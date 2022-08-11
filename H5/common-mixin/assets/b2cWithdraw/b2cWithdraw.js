import { fixD, fixInput, imgMap } from '@/utils';

export default {
  data() {
    return {
      imgMap,
      tabelLoading: true,
      detailsList: [
        { key: 'totalBalance', value: '--' },
        { key: 'normalBalance', value: '--' },
        { key: 'lockBalance', value: '--' },
      ],
      withdrawMin: '--', // 最小提币额度
      withdrawMax: '--', // 最大提币额度
      daywithdrawMax: '--', // 最大提币额度
      symbol: '',
      addressValue: '', // 提现地址
      numberValue: '', // 提币数量
      addressList: [], // 提现地址列表
      dialogFlag: false, // 弹窗开关
      dialogConfirmLoading: false, // 弹窗按钮loading
      googleValue: '', // 谷歌
      phoneValue: '', // 手机
      nowSymbolMess: {},
      feeList: {},
      warning: '',
    };
  },
  filters: {
    fixDFn(v, showPrecision) {
      return fixD(v, showPrecision);
    },
  },
  watch: {
    numberValue(v) { this.numberValue = fixInput(v, this.showPrecision); },
    market: {
      handler(v) {
        if (v && this.symbol) {
          this.getMessage();
        }
      },
    },
  },
  computed: {
    inputW() {
      let str = '';
      if (this.isOther) {
        str = `${this.$t('assets.withdraw.NumberOfCoins')}（${this.symbol}）`;
      } else {
        str = this.$t('assets.withdraw.NumberOfCoins');
      }
      return str;
    },
    aikrw() {
      let str = '--';
      if (this.isOther && this.arrivalAccount !== '--') {
        str = this.arrivalAccount * 1000;
      }
      return str;
    },
    isOther() {
      return this.symbol === 'AIKRW';
    },
    buttonDisabled() {
      if (this.numberValueObj.flag && this.feeList[this.addressValue]) {
        return false;
      }
      return true;
    },
    numberValueObj() {
      let flag = true;
      let showError = false;
      let text = '';
      const inp = parseFloat(this.numberValue);
      const haveNum = parseFloat(this.detailsList[1].value) || 0; // 可用
      const max = parseFloat(this.withdrawMax) || 0; // 最大
      const min = parseFloat(this.withdrawMin) || 0; // 最小
      const day = parseFloat(this.daywithdrawMax) || 0; // 最小
      if (!inp) {
        flag = false;
        showError = false;
      } else if (inp < min) {
        flag = false;
        showError = true;
        // 单笔提现金额不得小于
        const warn = this.$t('assets.b2c.withdrawMinWarn');
        text = `${warn}${this.withdrawMin} ${this.symbol}`;
      } else if (inp > max) {
        flag = false;
        showError = true;
        // 单笔提现金额不得大于
        const warn = this.$t('assets.b2c.withdrawMaxWarn');
        text = `${warn}${this.withdrawMax} ${this.symbol}`;
      } else if (inp > day) {
        flag = false;
        showError = true;
        // 今日可提现金额
        const warn = this.$t('assets.b2c.withdrawDayWarn');
        text = `${warn}${this.daywithdrawMax} ${this.symbol}`;
      } else if (inp > haveNum) {
        flag = false;
        showError = true;
        // 可用余额为
        const warn = this.$t('assets.b2c.withdrawHaveWarn');
        text = `${warn}${this.detailsList[1].value} ${this.symbol}`;
      }
      return {
        flag,
        showError,
        text,
      };
    },
    showSymbol() {
      const str = this.symbol;
      return str;
    },
    // 当前币种精度
    showPrecision() {
      let v = 0;
      const { market } = this.$store.state.baseData;
      if (market && market.coinList && market.coinList[this.symbol]) {
        v = market.coinList[this.symbol].showPrecision;
      }
      return v;
    },
    // finance/account_balance 接口返回成功的数据
    exchangeData() { return this.$store.state.assets.exchangeData; },
    // market 接口
    market() { return this.$store.state.baseData.market; },
    // phoneValue 是否复合正则验证
    phoneValueFlag() { return this.$store.state.regExp.verification.test(this.phoneValue); },
    // googleValue 是否复合正则验证
    googleValueFlag() { return this.$store.state.regExp.verification.test(this.googleValue); },
    phoneError() {
      if (this.phoneValue.length !== 0 && !this.phoneValueFlag) return true;
      return false;
    },
    googleError() {
      if (this.googleValue.length !== 0 && !this.googleValueFlag) return true;
      return false;
    },
    // 弹窗确认按钮
    dialogConfirmDisabled() {
      let phone = true;
      let google = true;
      if (this.OpenMobile) { phone = this.phoneValueFlag; }
      if (this.OpenGoogle) { google = this.googleValueFlag; }
      if ((phone && google) || this.dialogConfirmLoading) {
        return false;
      }
      return true;
    },
    that() { return this; },
    arrivalAccount() {
      if (!this.numberValueObj.flag) return '--';
      if (this.fee !== '--') {
        return fixD(parseFloat(this.numberValue) - parseFloat(this.fee),
          this.showPrecision);
      }
      return '--';
    },
    fee() {
      if (!this.numberValueObj.flag) return '--';
      if (this.feeList[this.addressValue] && this.market) {
        const { fee, feeType } = this.feeList[this.addressValue];
        // if(this.addressValue === '81') {
        //   fee = 1
        //   feeType = 0
        // }
        // 百分比
        if (feeType) {
          const feeFix = fee / 100;
          return fixD(this.numberValue * feeFix, this.showPrecision);
        // 固定值
        }
        return fixD(fee, this.showPrecision);
      }
      return '--';
    },
  },
  methods: {
    init() {
      // 如果不存在币种跳走
      if (this.$route.query.symbol) {
        this.symbol = this.$route.query.symbol.toUpperCase();
      } else {
        this.$router.push('/assets/exchangeAccount');
      }
      this.$bus.$on('getMess', () => {
        this.getMessage();
      });
      if (this.market && this.symbol) {
        this.getMessage();
      }
      this.getBankList();
    },
    getMessage() {
      this.axios({
        url: 'fiat/balance',
        params: { symbol: this.symbol },
      }).then((data) => {
        if (data.code.toString() === '0') {
          let obj = {};
          data.data.allCoinMap.forEach((item) => {
            if (item.symbol === this.symbol) {
              obj = item;
            }
          });
          this.nowSymbolMess = obj;
          this.detailsList.forEach((item, index) => {
            this.detailsList[index].value = fixD(obj[item.key], this.showPrecision);
          });
          this.withdrawMin = fixD(obj.withdrawMin, this.showPrecision);
          this.withdrawMax = fixD(obj.withdrawMax, this.showPrecision);
          this.daywithdrawMax = fixD(obj.canWithdrawBalance, this.showPrecision);
          this.warning = data.data.withdrawTip;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    getBankList() {
      this.axios({
        url: '/bank/all',
        params: {
          symbol: this.symbol,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          const obj = {};
          data.data.forEach((item) => {
            obj[item.bankNo.toString()] = item.accountName;
          });
          this.getUserBank(obj);
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    getUserBank(bankObj) {
      this.axios({
        url: 'user/bank/user_bank_list',
        params: {
          pageSize: 100, // 每页条数
          page: 1, // 页码
          symbol: this.symbol,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          const list = [];
          const feeList = {};
          data.data.list.forEach((item) => {
            list.push({
              code: `${item.id}`,
              value: `${item.cardNo}`,
              label: `${bankObj[item.bankNo]}(${item.name})`,
            });
            feeList[item.id] = item;
          });
          this.feeList = feeList;
          this.addressList = list;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    goAddress() { this.$router.push(`/assets/b2cAddressMent?symbol=${this.symbol}`); },
    inputChange(v, name) {
      this[name] = v;
    },
    // 提现select框 change
    addressChange(item) {
      this.addressValue = item.code;
    },
    // 全部提现
    allWithDraw() {
      if (this.detailsList[1].value === '--') return;
      this.numberValue = this.detailsList[1].value;
    },
    // 获取验证码
    getCodeClick() {
      this.sendSmsCode();
    },
    // 发送验证码
    sendSmsCode() {
      this.axios({
        url: 'v4/common/smsValidCode',
        params: { operationType: '32' },
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
    withdrawClick() {
      this.dialogFlag = true;
    },
    // 弹窗关闭
    dialogClose() {
      this.phoneValue = '';
      this.googleValue = '';
      this.dialogFlag = false;
    },
    // 弹窗确认
    dialogConfirm() {
      this.dialogConfirmLoading = true;
      this.axios({
        url: '/fiat/withdraw',
        params: {
          symbol: this.symbol,
          userWithdrawBankId: this.addressValue,
          amount: this.numberValue,
          smsAuthCode: this.phoneValue || undefined,
          googleCode: this.googleValue || undefined,
        },
      }).then((data) => {
        this.dialogConfirmLoading = false;
        if (data.code.toString() === '0') {
          // this.getTableList(); // 获取列表
          // this.$store.dispatch('assetsExchangeData'); // 更新额度
          this.$bus.$emit('b2cWithdrawHisGet');
          this.getMessage();
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.addressValue = '';
          this.numberValue = '';
          this.phoneValue = '';
          this.googleValue = '';
          this.dialogFlag = false;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
  },
};
