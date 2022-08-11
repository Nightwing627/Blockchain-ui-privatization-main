
import { imgMap } from '@/utils';

export default {
  data() {
    return {
      imgMap,
      symbol: '',
      bank: '', // 银行
      bankSub: '', // 支行
      cardNo: '', // 账号
      name: '', // 姓名
      cms: '', // 短信验证码
      google: '', // 谷歌验证码
      bankList: [],
      btnLoading: false,
      nowType: '',
      setId: '',
    };
  },
  watch: {
    AddUserInfoIsReady: {
      immediate: true,
      handler(v) {
        if (v) {
          const { userInfo } = this.$store.state.baseData;
          this.name = userInfo.realName;
        }
      },
    },
  },
  computed: {
    AddUserInfoIsReady() { return this.userInfoIsReady; },
    buttonDisable() {
      let flag = true;
      const cmsSuc = this.OpenMobile ? this.cmsFlag : true;
      const googleSuc = this.OpenGoogle ? this.googleFlag : true;
      if ((this.bank.length
        && this.cardNoFlag
        && cmsSuc
        && googleSuc) || this.btnLoading) {
        flag = false;
      }
      return flag;
    },
    regExps() { return this.$store.state.regExp; },
    cardNoFlag() { return this.regExps.nonEmpty.test(this.cardNo); },
    bankSubFlag() { return this.regExps.nonEmpty.test(this.bankSub); },
    cmsFlag() { return this.regExps.verification.test(this.cms); },
    googleFlag() { return this.regExps.verification.test(this.google); },
    cmsErrorFlag() {
      if (this.cms.length !== 0 && !this.cmsFlag) return true;
      return false;
    },
    googleErrorFlag() {
      if (this.google.length !== 0 && !this.googleFlag) return true;
      return false;
    },
  },
  methods: {
    init() {
      const { symbol, type, id } = this.$route.query;
      if (symbol && type === 'add') {
        this.symbol = symbol.toUpperCase();
        this.nowType = 'add';
      } else if (symbol && type === 'set' && id) {
        this.symbol = symbol.toUpperCase();
        this.nowType = 'set';
        this.setId = id;
      } else {
        this.$router.push('/assets/b2cAccount');
        return;
      }
      this.getBankList();
    },
    addressChange(item) {
      this.bank = item.code;
    },
    getSetMess() {
      this.axios({
        url: '/user/bank/get',
        params: {
          id: this.setId,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.bank = data.data.bankNo.toString();
          this.bankSub = data.data.bankSub;
          this.cardNo = data.data.cardNo;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    submit() {
      this.btnLoading = true;
      this.axios({
        url: this.nowType === 'add' ? '/user/bank/add' : '/user/bank/edit',
        params: {
          id: this.nowType === 'add' ? undefined : this.setId,
          bankId: this.bank,
          bankSub: this.bankSub || undefined,
          cardNo: this.cardNo,
          name: this.name,
          symbol: this.symbol,
          smsAuthCode: this.cms || undefined,
          googleCode: this.google || undefined,
        },
      }).then((data) => {
        this.btnLoading = false;
        if (data.code.toString() === '0') {
          this.$router.push(`/assets/b2cAddressMent?symbol=${this.symbol}`);
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 获取验证码
    getCodeClick() {
      this.sendCode();
    },
    sendCode() {
      this.axios({
        url: 'v4/common/smsValidCode',
        params: { operationType: this.nowType === 'add' ? '30' : '31' },
      }).then((data) => {
        if (data.code.toString() !== '0') {
          setTimeout(() => {
            // 倒计时重置
            this.$bus.$emit('getCode-clear', 'withdrawGetcode');
            // tip框提示错误
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }, 2000);
        } else {
          this.$bus.$emit('tip', { text: this.$t('assets.withdraw.phoneSendSuccess'), type: 'success' });
        }
      });
    },
    inputChanges(value, name) {
      this[name] = value;
    },
    getBankList() {
      this.axios({
        url: '/bank/all',
        params: {
          symbol: this.symbol,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          const arr = [];
          data.data.forEach((item) => {
            arr.push({
              code: item.bankNo.toString(),
              value: item.accountName,
            });
          });
          this.bankList = arr;
          if (arr.length && this.nowType === 'add') {
            this.bank = arr[0].code;
          }
          if (this.nowType === 'set') {
            this.getSetMess();
          }
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
  },
};
