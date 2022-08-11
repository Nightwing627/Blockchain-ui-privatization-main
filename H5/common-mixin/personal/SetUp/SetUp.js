export default {
  name: 'setUp',
  data() {
    return {
      loading: false,
      paymentList: [], // 判断是否已有收款方式
      paymentId: '',
      collectionWays: '',
      certificateTypeErrorFlag: false,
      certificateTypeList: [],
      payment: 1,
      payments: null,
      payments2: null,
      disabled: true,
      // 验证码部分
      promptText1: this.$t('personal.label.smsCodeText'),
      errorText1: this.$t('personal.prompt.errorCode'),
      checkErrorFlag1: false,
      checkValue1: '',
      promptText2: this.$t('personal.label.googleCodeText'),
      errorText2: this.$t('personal.prompt.errorCode'),
      checkErrorFlag2: false,
      checkValue2: '',
      // 验证框显示隐藏
      smsCode: false,
      googleCode: false,
      // 提交时
      // 公用参数
      userName: '',
      account: '', // 西联汇款可不填
      // 非银行卡情况
      qrcodeImg: '',
      // 银行卡相关
      bank: '',
      branch: '', // 选填
      // 判断是修改还是添加 0为添加1为修改
      set: 0,
      obj: {},
      id: '',
    };
  },
  computed: {
    getOtcPublicInfo() {
      return this.$store.state.baseData.otcPublicInfo;
    },
    sendSmsCode() {
      return this.$store.state.personal.sendSmsCode;
    },
    otcPaymentAdd() {
      return this.$store.state.personal.otcPaymentAdd;
    },
    setPayment() {
      return this.$store.state.personal.setPayment;
    },
    otcPaymentUpdate() {
      return this.$store.state.personal.otcPaymentUpdate;
    },
    otcPaymentFind() {
      return this.$store.state.personal.otcPaymentFind;
    },
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
  },
  watch: {
    userInfo(userInfo) {
      if (userInfo !== null) {
        this.googleCode = !!Number(userInfo.googleStatus);
        this.smsCode = !!Number(userInfo.isOpenMobileCheck);
      }
    },
    otcPaymentFind(otcPaymentFind) {
      if (otcPaymentFind !== null) {
        this.paymentList = otcPaymentFind.data;
        // 数据处理
        this.modifyData(otcPaymentFind);
      }
    },
    getOtcPublicInfo(getOtcPublicInfo) {
      if (getOtcPublicInfo !== null) {
        // 数据处理
        this.dataProcessing(getOtcPublicInfo.payments);
        this.collectionWays = getOtcPublicInfo.payments[0].key;
      }
    },
    sendSmsCode(sendSmsCode) {
      if (sendSmsCode !== null) {
        if (sendSmsCode.text === 'success') {
          this.$bus.$emit('tip', { text: sendSmsCode.msg, type: 'success' });
          this.$store.dispatch('resetType');
        } else {
          this.$bus.$emit('tip', { text: sendSmsCode.msg, type: 'error' });
          this.$store.dispatch('resetType');
          this.$bus.$emit('getCode-clear', 'phone');
        }
      }
    },
    otcPaymentAdd(otcPaymentAdd) {
      if (otcPaymentAdd !== null) {
        this.loading = false;
        if (otcPaymentAdd.text === 'success') {
          this.$bus.$emit('tip', { text: otcPaymentAdd.msg, type: 'success' });
          this.$store.dispatch('resetType');
          this.$router.push('/personal/leaglTenderSet');
        } else {
          this.$bus.$emit('tip', { text: otcPaymentAdd.msg, type: 'error' });
          this.$store.dispatch('resetType');
        }
      }
    },
    setPayment(setPayment) {
      if (setPayment !== null) {
        this.set = setPayment.set;
      }
    },
    otcPaymentUpdate(otcPaymentUpdate) {
      if (otcPaymentUpdate !== null) {
        this.loading = false;
        if (otcPaymentUpdate.text === 'success') {
          this.$bus.$emit('tip', { text: otcPaymentUpdate.msg, type: 'success' });
          this.$store.dispatch('resetType');
          this.$router.push('/personal/leaglTenderSet');
        } else {
          this.$bus.$emit('tip', { text: otcPaymentUpdate.msg, type: 'error' });
          this.$store.dispatch('resetType');
        }
      }
    },
  },
  methods: {
    init() {
      // 这里请求otcPublicInfo
      const { paymentId } = this.$route.query; // url参数
      const { otcPublicInfo } = this.$store.state.baseData; // otc publicinfo
      const { userInfo } = this.$store.state.baseData; // userinfo
      const { otcPaymentFind } = this.$store.state.personal; // 支付列表
      this.$store.dispatch('otcPaymentFind');
      if (paymentId) { // 有值则为修改
        this.set = 1;
        this.paymentId = paymentId;
        // 查看是否有数据
        if (otcPaymentFind) { // 有则使用
          this.modifyData(otcPaymentFind);
        } else { // 无则请求
          this.$store.dispatch('otcPaymentFind');
        }
      } else { // 无值为新增
        this.set = 0;
        this.payment = 1;
        this.payments = { name: this.$t('personal.setUp.paymentMethods.paymentsWA.name'), title: this.$t('personal.setUp.paymentMethods.paymentsWA.title') };
      }
      if (otcPublicInfo !== null) {
        // 数据处理
        this.dataProcessing(otcPublicInfo.payments);
        this.collectionWays = otcPublicInfo.payments[0].key;
      } else {
        this.$store.dispatch('getOtcPublicInfo');
      }
      if (userInfo !== null) {
        this.googleCode = !!Number(userInfo.googleStatus);
        this.smsCode = !!Number(userInfo.isOpenMobileCheck);
      }
    },
    codeFlag(val) {
      return this.$store.state.regExp.verification.test(val);
    },
    judge() { // 判断非银行卡非西联情况下 提交按钮是否开启
      if (this.userName && this.account && this.qrcodeImg
        && !this.checkErrorFlag1 && !this.checkErrorFlag2) {
        if (this.smsCode) {
          this.disabled = !this.checkValue1;
        }
        if (this.googleCode) {
          this.disabled = !this.checkValue2;
        }
        this.$forceUpdate();
      } else {
        this.disabled = true;
      }
    },
    judge2() { // 银行卡
      if (this.userName && this.account && this.bank
        && !this.checkErrorFlag1 && !this.checkErrorFlag2) {
        if (this.smsCode) {
          this.disabled = !this.checkValue1;
        }
        if (this.googleCode) {
          this.disabled = !this.checkValue2;
        }
        this.$forceUpdate();
      } else {
        this.disabled = true;
      }
    },
    callBack(type, name, obj) {
      if (type === 'payment1') {
        this[name] = obj[name];
        this.judge();
      } else {
        this[name] = obj[name];
        this.judge2();
      }
    },
    inputChanges(value, name) {
      if (this.collectionWays === 'otc.payment.domestic.bank.transfer') {
        switch (name) {
          case 'smsCode':
            this.checkValue1 = value;
            if (this.codeFlag(value)) {
              this.checkErrorFlag1 = false;
            } else {
              this.checkErrorFlag1 = true;
            }
            break;
          default:
            this.checkValue2 = value;
            if (this.codeFlag(value)) {
              this.checkErrorFlag2 = false;
            } else {
              this.checkErrorFlag2 = true;
            }
        }
        this.judge2();
      } else if (this.collectionWays === 'otc.payment.western.union') {
        // console.log('西联');
      } else {
        switch (name) {
          case 'smsCode':
            this.checkValue1 = value;
            if (this.codeFlag(value)) {
              this.checkErrorFlag1 = false;
            } else {
              this.checkErrorFlag1 = true;
            }
            break;
          default:
            this.checkValue2 = value;
            if (this.codeFlag(value)) {
              this.checkErrorFlag2 = false;
            } else {
              this.checkErrorFlag2 = true;
            }
        }
        this.judge();
      }
    },
    getCodeClick() {
      this.$bus.$emit('getCode-start', 'phone');
      const info = { operationType: 28 };
      this.$store.dispatch('sendSmsCode', info);
    },
    btnLink() {
      this.loading = true;
      const info = {};
      if (this.collectionWays === 'otc.payment.domestic.bank.transfer') {
        info.payment = this.collectionWays;
        info.userName = this.userName;
        info.bankName = this.bank;
        info.bankOfDeposit = this.branch;
        info.account = this.account;
        info.smsAuthCode = this.checkValue1;
        info.googleCode = this.checkValue2;
        info.id = this.id;
      } else if (this.collectionWays === 'otc.payment.western.union') {
        // console.log('西联');
      } else {
        info.payment = this.collectionWays;
        info.userName = this.userName;
        info.account = this.account;
        info.qrcodeImg = this.qrcodeImg;
        info.smsAuthCode = this.checkValue1;
        info.googleCode = this.checkValue2;
        info.id = this.id;
      }
      if (!this.set) {
        this.$store.dispatch('otcPaymentAdd', info);
      } else {
        this.$store.dispatch('otcPaymentUpdate', info);
      }
    },
    paymentsChange(item) {
      this.collectionWays = item.code;
      this.payment = 0;
      this.$nextTick(() => {
        this.choosePayment(item);
      });
    },
    // 根据下拉选择应显示的收款方式，目前根据产品所述分为三种 1.微信支付宝 2.银行卡 3.其它所有
    choosePayment(item) {
      this.checkValue1 = '';
      this.checkValue2 = '';
      this.qrcodeImg = '';
      if (item.code === 'otc.payment.domestic.bank.transfer') {
        this.payment = 2;
        this.payments2 = {
          name: this.$t('personal.setUp.paymentMethods.paymentsCard.name'),
          bank: this.$t('personal.setUp.paymentMethods.paymentsCard.bank'),
          branch: this.$t('personal.setUp.paymentMethods.paymentsCard.branch'),
          account: this.$t('personal.setUp.paymentMethods.paymentsCard.account'),
          obj: this.obj,
        };
      } else {
        this.payment = 1;
        this.payments = { name: this.$t('personal.setUp.paymentMethods.paymentsWA.name'), title: item.value + this.$t('personal.setUp.paymentMethods.paymentsWA.title'), obj: this.obj };
      }
    },
    dataProcessing(payments) {
      // select 数据处理 现在只保留三个 支付宝微信银行卡
      if (!this.paymentId) { // 新增
        this.certificateTypeList = [];
        payments.forEach((obj, index) => {
          this.certificateTypeList.push({ value: obj.title, code: obj.key });
          if (index === 0) {
            this.choosePayment({ value: obj.title, code: obj.key });
          }
        });
      }
    },
    modifyData(data) { // 点进修改 处理数据
      data.data.forEach((obj) => {
        if (obj.id === Number(this.paymentId)) {
          this.obj = obj;
          if (this.obj.payment === 'otc.payment.domestic.bank.transfer') {
            this.payment = 2;
            this.payments2 = {
              name: this.$t('personal.setUp.paymentMethods.paymentsCard.name'),
              bank: this.$t('personal.setUp.paymentMethods.paymentsCard.bank'),
              branch: this.$t('personal.setUp.paymentMethods.paymentsCard.branch'),
              account: this.$t('personal.setUp.paymentMethods.paymentsCard.account'),
              obj: this.obj,
            };
            this.collectionWays = this.obj.payment;
            this.userName = this.obj.userName;
            this.bank = this.obj.bankName;
            this.branch = this.obj.bankOfDeposit;
            this.account = this.obj.account;
            this.id = this.obj.id;
          } else {
            this.payment = 1;
            this.payments = { name: this.$t('personal.setUp.paymentMethods.paymentsWA.name'), title: this.obj.title + this.$t('personal.setUp.paymentMethods.paymentsWA.title'), obj: this.obj };
            this.collectionWays = this.obj.payment;
            this.userName = this.obj.userName;
            this.account = this.obj.account;
            this.qrcodeImg = this.obj.qrcodeImg;
            this.id = this.obj.id;
          }
        }
      });
    },
  },
};
