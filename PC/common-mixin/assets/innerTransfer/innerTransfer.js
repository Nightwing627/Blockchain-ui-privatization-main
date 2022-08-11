import {
  fixD, fixInput, getCoinShowName, colorMap, imgMap,
} from '@/utils';

export default {
  name: 'page-withdraw',
  data() {
    return {
      imgMap,
      colorMap,
      alertFlag: false, // alert变量
      detailsList: [
        { key: 'sum', value: '--' },
        { key: 'normal', value: '--' },
        { key: 'lock', value: '--' },
      ],
      withdrawMin: '--', // 最小提币额度
      withdrawMax: '--', // 最大提币额度
      daywithdrawMax: '--', // 最大提币额度
      symbol: '',
      numberValue: '', // 提币数量
      proceduresValue: '', // 手续费
      dialogFlag: false, // 弹窗开关
      dialogConfirmLoading: false, // 弹窗按钮loading
      googleValue: '', // 谷歌
      phoneValue: '', // 手机
      defaultFeeFlag: true,
      defaultFee: null,
      symbol_withdraw_msg: null,
      notIdShowDialog: false,
      nowType: 1, // 1为站外提现 2为站内提现
      accountValue: '', // 账号
      accountFlag: false,
    };
  },
  filters: {
    fixDFn(v, that) {
      return fixD(v, that.showPrecision);
    },
  },
  watch: {
    userInfoIsReady() { this.canAlert(); },
    exchangeData(v) { if (v) { this.initDetails(); } },
    symbol(v) {
      if (v && this.market) {
        // this.innerInit();
        this.defInit();
      }
    },
    market: {
      immediate: true,
      handler(v) {
        if (v && this.symbol) {
          // this.innerInit();
          this.defInit();
        }
      },
    },
    proceduresValue(v) { this.proceduresValue = fixInput(v, this.showPrecision); },
    numberValue(v) { this.numberValue = fixInput(v, this.showPrecision); },
  },
  computed: {
    // finance/account_balance 接口返回成功的数据
    exchangeData() { return this.$store.state.assets.exchangeData; },
    showSymbol() {
      let str = this.symbol;
      if (this.market && this.market.coinList
        && this.market.coinList[this.symbol]) {
        str = getCoinShowName(this.symbol, this.market.coinList);
      }
      return str;
    },
    enforceGoogleAuth() {
      return this.$store.state.baseData.is_enforce_google_auth || 0;
    },
    authTitleText() {
      const text = this.enforceGoogleAuth ? 'assets.withdraw.enforceGoogleAuth' : 'assets.withdraw.safetyWarningError';
      return this.$t(text);
    },
    switchadd() {
      const { publicInfo } = this.$store.state.baseData;
      let switchopen = 0;
      if (publicInfo && publicInfo.switch.open_txid_addr) {
        switchopen = Number(publicInfo.switch.open_txid_addr);
      }
      return switchopen;
    },
    alertData() {
      const arr = [
        // 绑定谷歌验证
        { text: this.$t('assets.withdraw.bindGoogle'), flag: this.OpenGoogle },
      ];
      if (!this.enforceGoogleAuth) {
        // 绑定手机验证
        arr.push({ text: this.$t('assets.withdraw.bindPhone'), flag: this.OpenMobile });
      }
      return arr;
    },
    // paginationObjCurrentPage() { return this.paginationObj.currentPage; },
    // 当前币种精度
    showPrecision() {
      let v = 0;
      const { market } = this.$store.state.baseData;
      if (market && market.coinList && market.coinList[this.symbol]) {
        v = market.coinList[this.symbol].showPrecision;
      }
      return v;
    },
    // market 接口
    market() { return this.$store.state.baseData.market; },
    // 提现按钮禁用状态
    btnDisabled() {
      let flag = true;
      if (this.accountValue.length && this.numberOptions.flag) {
        flag = false;
      }
      return flag;
    },
    userInfoIsReady() { return this.$store.state.baseData.userInfoIsReady; },
    // 用户是否开启手机
    OpenMobile() {
      let flag = false;
      const { userInfo } = this.$store.state.baseData;
      if (userInfo && userInfo.isOpenMobileCheck.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    idAuth() {
      const { userInfo } = this.$store.state.baseData;
      let idAuth = 0;
      if (userInfo) {
        idAuth = Number(userInfo.authLevel);
      }
      return idAuth;
    },
    // 用户是否开启谷歌
    OpenGoogle() {
      let flag = false;
      const { userInfo } = this.$store.state.baseData;
      if (userInfo && userInfo.googleStatus.toString() === '1') {
        flag = true;
      }
      return flag;
    },
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
    // 提币数量的校验
    // 提现条件：
    // 1. 提现数量 > 手续费
    // 2. 提现数量 <= 可用余额 （提现数量包含手续费）
    // 3. 提现最小限额 =< (提现数量 -手续费) =<提现最大限额
    numberOptions() {
      const obj = {
        text: '', // 错误提示文案
        flag: null, // 是否通过校验
        error: null, // 是否展示文案
      };
      const haveNum = parseFloat(this.detailsList[1].value) || 0; // 可用
      const minNum = parseFloat(this.withdrawMin) || 0; // 最小提币额
      const maxNum = parseFloat(this.withdrawMax) || 0; // 最大提币额
      const daymaxNum = parseFloat(this.daywithdrawMax) || 0; // 单日最大提币额
      const spk = fixD(this.numberValue - this.proceduresValue, this.showPrecision); // 提币数量减手续费
      if (this.numberValue.length === 0 || parseFloat(this.numberValue) === 0) {
        // 请输入提币数量
        obj.text = this.$t('assets.withdraw.NumberOfCoinsError');
        obj.flag = false;
        obj.error = false;
        return obj;
      } if (parseFloat(this.numberValue) <= parseFloat(this.proceduresValue)) {
        // 提币数量需大于矿工手续费
        obj.text = this.$t('assets.withdraw.NumberOfCoinsError2');
        obj.flag = false;
        obj.error = true;
        return obj;
      } if (parseFloat(this.numberValue) > haveNum) {
        // 提币数量不得大于可用余额
        obj.text = this.$t('assets.withdraw.NumberOfCoinsError3');
        obj.flag = false;
        obj.error = true;
        return obj;
      } if (parseFloat(minNum) > spk || parseFloat(maxNum) < spk) {
        // （提币数量-矿工手续费）需要大于最小提币额且小于最大提币额
        obj.text = this.$t('assets.withdraw.NumberOfCoinsError4');
        obj.flag = false;
        obj.error = true;
        return obj;
      } if (this.switchadd === 1) {
        if (parseFloat(daymaxNum) < spk) {
          // （提币数量-矿工手续费）需要小于单日最大提币额
          obj.text = this.$t('assets.withdraw.NumberOfCoinsError5');
          obj.flag = false;
          obj.error = true;
          return obj;
        }
      }
      obj.flag = true;
      obj.error = false;
      return obj;
    },
    baseData() {
      return this.$store.state.baseData.publicInfo;
    },
    // 提现是否开启了必须实名认证
    withdrawKycOpen() {
      let isOpen = 0;
      if (this.baseData && this.baseData.kycLimitConfig) {
        isOpen = this.baseData.kycLimitConfig.withdraw_kyc_open;
      }
      return Number(isOpen);
    },
  },
  methods: {
    defInit() {
      if (!this.exchangeData) {
        this.$store.dispatch('assetsExchangeData');
      } else {
        this.initDetails();
      }
    },
    init() {
      // 如果不存在币种跳走
      if (this.$route.query.symbol) {
        this.symbol = this.$route.query.symbol.toUpperCase();
      } else {
        this.$router.push('/assets/exchangeAccount');
      }
      if (this.userInfoIsReady) {
        this.canAlert();
      }
    },
    canAlert() {
      if (this.OpenGoogle || (!this.enforceGoogleAuth && this.OpenMobile)) {
        this.alertFlag = false;
      } else {
        setTimeout(() => {
          this.alertFlag = true;
        }, 100);
      }
    },
    alertClone() {
      this.alertFlag = false;
      this.notIdShowDialog = false;
    },
    alertGo() { this.$router.push('/personal/userManagement'); },
    goAddress() { this.$router.push('/assets/addressMent'); },
    inputChange(v, name) {
      this[name] = v;
    },
    innerInit() {
      // 该币种是否有标签
    },
    // 上半部分 左侧数据
    initDetails() {
      const obj = this.exchangeData.allCoinMap[this.symbol];
      const normalBalance = Number(obj.normal_balance) || Number(obj.overcharge_balance);
      this.detailsList = [
        { key: 'sum', value: fixD(obj.total_balance, this.showPrecision) }, // 总额
        { key: 'normal', value: fixD(normalBalance, this.showPrecision) }, // 可用
        { key: 'lock', value: fixD(obj.lock_balance, this.showPrecision) }, // 冻结
      ];
      this.symbol_withdraw_msg = obj.symbol_withdraw_msg || null; // 注意事项
      this.withdrawMin = fixD(obj.withdraw_min, this.showPrecision); // 最小提币额
      this.withdrawMax = fixD(obj.withdraw_max, this.showPrecision);// 最大提币额
      this.daywithdrawMax = fixD(obj.withdraw_max_day, this.showPrecision);// 单日最大提币额
      this.defaultFee = `${obj.innerTransferFee}`;
      this.proceduresValue = `${obj.innerTransferFee}`; // 默认手续费
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
        params: { operationType: '34' },
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
      if (this.OpenGoogle || (!this.enforceGoogleAuth && this.OpenMobile)) {
        if (this.withdrawKycOpen && this.idAuth !== 1) {
          this.notIdShowDialog = true;
          return;
        }
        this.isExistAccount();
        // this.dialogFlag = true;
        return;
      }
      this.alertFlag = true;
    },
    // 判断站内账户是否存在
    isExistAccount() {
      this.axios({
        url: 'inner_transfer/user_auth',
        params: {
          transferUid: this.accountValue, // 对方账号
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.dialogFlag = true;
        } else {
          // this.accountFlag = true;
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
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
      const pv = this.showPrecision;
      const amount = fixD(this.numberValue - this.proceduresValue, pv);
      this.axios({
        url: 'inner_transfer/do_withdraw',
        params: {
          transferUid: this.accountValue, // 提现地址id
          fee: this.proceduresValue, // 手续费
          amount, // 提现金额（不包含手续费
          googleCode: this.googleValue,
          smsAuthCode: this.phoneValue,
          symbol: this.symbol,
        },
      }).then((data) => {
        this.dialogConfirmLoading = false;
        if (data.code.toString() === '0') {
          this.$bus.$emit('innerList');
          this.$store.dispatch('assetsExchangeData'); // 更新额度
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.proceduresValue = '';
          this.numberValue = '';
          this.phoneValue = '';
          this.googleValue = '';
          this.accountValue = '';
          this.dialogFlag = false;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 去认证
    gotoAuth() {
      this.$router.push('/personal/userManagement');
    },
  },
};
