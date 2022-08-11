import { imgMap, colorMap } from '@/utils';

export default {
  name: 'leaglTenderSet',
  data() {
    return {
      activeId: '',
      alertFlag: false,
      switchValue: false,
      imgMap,
      colorMap,
      dataList: [],
      isCapitalPwordSet: 0,
      sms: '',
      google: '',
      nickName: '',
      authLevel: 0, // 身份/实名认证状态，0、未审核，1、通过，2、未通过  3未认证
    };
  },
  methods: {
    init() {
      this.$store.dispatch('otcPaymentFind');
      // 获取 userinfo
      this.$store.dispatch('getUserInfo');

      const { userInfo } = this.$store.state.baseData;
      if (userInfo !== null) {
        this.isCapitalPwordSet = userInfo.isCapitalPwordSet;
        this.google = !!userInfo.googleStatus;
        this.sms = !!userInfo.isOpenMobileCheck;
        this.nickName = userInfo.nickName;
        this.authLevel = userInfo.authLevel;
      }
    },
    resloveText(obj) {
      const {
        bankName, bankOfDeposit, account, userName,
      } = obj;
      let name = '';

      if (this.$store.state.baseData.userInfo) {
        name = this.$store.state.baseData.userInfo.realName;
      }
      if (!this.isCanModifyName) {
        name = userName;
      }
      if (this.excheifFlag) {
        name = userName;
      }
      const arr = [bankName, bankOfDeposit, account, name].filter((item) => item);
      return arr.join(' &nbsp; &nbsp; &nbsp; ');
    },
    alertClose() {
      this.alertFlag = false;
    },
    alertGo() {
      this.$router.push('/personal/userManagement');
    },
    switchChange(id, isOpen) {
      let open = '0';
      if (isOpen === '1') {
        open = 0;
      } else {
        open = 1;
      }
      const info = { id: Number(id), isOpen: open };
      this.$store.dispatch('otcPaymentOpen', info);
    },
    click(id, name) {
      if (!this.authIsPass) {
        this.alertFlag = true;
        return;
      }

      if (name === 'delete') {
        if (this.activeId !== id) {
          this.activeId = id;
          const info = { id };
          this.$store.dispatch('otcPaymentDelete', info);
        }
      } else if (name === 'modify') {
        this.$router.push({
          path: '/personal/setUp',
          query: { paymentId: id.id },
        });
        // 传参
        const info = { obj: id, set: 1 }; // set 0为正常添加 1为修改
        this.$store.dispatch('setPayment', info);
      }
    },
    btnLink(name) {
      if (this.authIsPass) {
        if (name === 'modifySettings') {
          this.$router.push({ path: '/personal/modifySettings', query: {} });
        } else {
          this.$router.push({ path: '/personal/setUp', query: {} });
        }
      } else {
        this.alertFlag = true;
      }
    },
  },
  computed: {
    fiatTradeOpen() {
      const base = this.$store.state.baseData.publicInfo;
      if (base && base.switch && base.switch.fiat_trade_open === '1') {
        return true;
      }
      return false;
    },
    authTitleText() {
      const text = this.enforceGoogleAuth
        ? 'personal.alert.enforceGoogleAuth'
        : 'assets.withdraw.safetyWarningError';
      return this.$t(text);
    },
    enforceGoogleAuth() {
      return this.$store.state.baseData.is_enforce_google_auth || 0;
    },
    authIsPass() {
      return (
        this.nickName
        && this.authLevel === 1
        && (this.google || (!this.enforceGoogleAuth && this.sms))
      );
    },
    otcPaymentFind() {
      return this.$store.state.personal.otcPaymentFind;
    },
    otcPaymentDelete() {
      return this.$store.state.personal.otcPaymentDelete;
    },
    otcPaymentOpen() {
      return this.$store.state.personal.otcPaymentOpen;
    },
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    isCanModifyName() {
      return (
        this.userInfo && Number(this.userInfo.userCompanyInfo.status) === 0
      );
    },
    excheifFlag() {
      return this.$store.state.baseData.exchief_project_switch;
    },
  },
  watch: {
    otcPaymentFind(otcPaymentFind) {
      if (otcPaymentFind !== null) {
        this.dataList = otcPaymentFind.data;
      }
    },
    otcPaymentDelete(otcPaymentDelete) {
      if (otcPaymentDelete !== null) {
        this.activeId = '';
        if (otcPaymentDelete.text === 'success') {
          this.$bus.$emit('tip', {
            text: otcPaymentDelete.msg,
            type: 'success',
          });
          this.$store.dispatch('resetType');
          this.$store.dispatch('otcPaymentFind');
        } else {
          this.$bus.$emit('tip', { text: otcPaymentDelete.msg, type: 'error' });
          this.$store.dispatch('resetType');
        }
      }
    },
    otcPaymentOpen(otcPaymentOpen) {
      if (otcPaymentOpen !== null) {
        if (otcPaymentOpen.text === 'success') {
          this.$bus.$emit('tip', { text: otcPaymentOpen.msg, type: 'success' });
          this.$store.dispatch('resetType');
          this.$store.dispatch('otcPaymentFind');
        } else {
          this.$bus.$emit('tip', { text: otcPaymentOpen.msg, type: 'error' });
          this.$store.dispatch('resetType');
        }
      }
    },
    userInfo(userInfo) {
      if (userInfo !== null) {
        this.isCapitalPwordSet = userInfo.isCapitalPwordSet;
        this.google = !!userInfo.googleStatus;
        this.sms = !!userInfo.isOpenMobileCheck;
        this.nickName = userInfo.nickName;
        this.authLevel = userInfo.authLevel;
      }
    },
  },
};
