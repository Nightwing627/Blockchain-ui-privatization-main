import {
  fixD,
  formatTime,
  fixInput,
  nul,
  fixFloat,
  thousandsComma,
  colorMap,
  imgMap,
} from '@/utils';


export default {
  name: 'InnovationList',
  data() {
    return {
      bannerImg: null,
      imgMap,
      colorMap,
      bannerTitle: '',
      nowType: 1,
      errorFlag: false,
      errorHave: false,
      pageId: null,
      pageData: {},
      amount: '',
      dialogFlag: false, // 弹窗flag
      dialogConfirmLoading: false, // 用于弹窗按钮loading效果
      checkValue: '', // 验证码value
      googleVlaue: '', // 谷歌验证码
      checkErrorText: '',
      googleErrorText: '',
      dbclick: true,
      captchaObj: null,
      verifyFlag: false,
      verifyObj: null,
      precision: 4,
      emailCheckValue: '',
    };
  },
  watch: {
    sendEmailCode(sendEmailCode) {
      if (sendEmailCode !== null) {
        if (sendEmailCode.text === 'success') {
          this.$bus.$emit('tip', { text: sendEmailCode.msg, type: 'success' });
          this.$store.dispatch('resetType');
        } else {
          this.$bus.$emit('tip', { text: sendEmailCode.msg, type: 'error' });
          this.$store.dispatch('resetType');
          this.$bus.$emit('getCode-clear', 'EmailCode');
        }
      }
    },
    amount(value) {
      this.amount = fixInput(
        value,
        this.showPrecision(this.pageData.coinSymbol),
      );
    },
    checkValue(value) {
      this.checkValue = fixInput(value, 0);
    },
    emailCheckValue(value) {
      this.emailCheckValue = fixInput(value, 0);
    },
    googleVlaue(value) {
      this.googleVlaue = fixInput(value, 0);
    },
  },
  computed: {
    sendEmailCode() {
      return this.$store.state.personal.sendEmailCode;
    },
    enforceGoogleAuth() {
      return this.$store.state.baseData.is_enforce_google_auth || 0;
    },
    // 全部币种列表
    coinList() {
      if (this.$store.state.baseData && this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return null;
    },
    spendWarning() {
      if (this.is_newcoin_project_entrance) {
        if (
          Number(this.pageData.u_entranceSymbol_account)
          < Number(this.pageData.entranceAmount)
        ) {
          return true;
        }
      }
      return false;
    },
    is_newcoin_project_entrance() {
      return this.$store.state.baseData.is_newcoin_project_entrance;
    },
    verificationType() {
      const { publicInfo } = this.$store.state.baseData;
      let type = '0';
      if (
        publicInfo
        && publicInfo.switch
        && publicInfo.switch.verificationType
      ) {
        type = publicInfo.switch.verificationType;
      }
      return type;
    },
    statusList() {
      return [
        this.$t('innov.have'), // 进行中
        this.$t('innov.financing'), // 募集成功
        this.$t('innov.end'), // 募集结束
      ];
    },
    promptText() {
      return this.$t('innov.numbre'); // '数量';
    },
    userInfo() {
      if (this.$store.state.baseData.userInfo) {
        return this.$store.state.baseData.userInfo;
      }
      return {};
    },
    googleStatus() {
      if (this.userInfo) {
        return this.userInfo.googleStatus;
      }
      return null;
    },
    isOpenMobileCheck() {
      if (this.userInfo) {
        return this.userInfo.isOpenMobileCheck;
      }
      return null;
    },
    emailAuthOpen() {
      if (this.userInfo) {
        return this.userInfo.email;
      }
      return null;
    },
    submitDisabled() {
      if (this.pageData.isAuthRealname && this.userInfo.authLevel !== 1) {
        return true;
      }
      if (
        (this.pageData.status === 2 || this.pageData.status === 3)
        && this.amount
        && this.amount <= this.pageData.u_coinSymbol_amount
      ) {
        return false;
      }
      return true;
    },
    amountDisabled() {
      if (this.pageData.isAuthRealname && this.userInfo.authLevel !== 1) {
        return true;
      }
      if (
        this.pageData.u_coinSymbol_amount < this.pageData.singleMinRaiseMoney
        || this.pageData.singleMaxRaiseMoney === 0
        || this.pageData.money - this.pageData.raisedMoney === 0
      ) {
        return true;
      }
      if (this.pageData.status === 2 || this.pageData.status === 3) {
        return false;
      }
      return true;
    },
    speed() {
      if (this.pageData.raisedMoney) {
        const speed = (this.pageData.raisedMoney / this.pageData.money) * 100;
        return fixD(speed, 2);
      }
      return 0;
    },
    // 二次验证弹层 text展示文字 havacode是否有获取验证码
    checkPhione() {
      return { text: this.$t('login.phoneCode'), haveCode: true };
    },
    googleVlaueForm() {
      return { text: this.$t('login.googleCode'), haveCode: false };
    },
    emailVlaueForm() {
      return { text: this.$t('login.emailCode'), haveCode: true };
    },
    // checkValue 是否复合正则验证
    checkFlag() {
      return this.$store.state.regExp.verification.test(this.checkValue);
    },
    // checkValueEmail 是否复合正则验证
    checkFlagEamil() {
      return this.$store.state.regExp.verification.test(this.emailCheckValue);
    },
    // googleVlaue 是否复合正则验证
    googleFlag() {
      return this.$store.state.regExp.verification.test(this.googleVlaue);
    },
    // 验证框是否为错误
    checkErrorFlag() {
      if (this.checkValue.length !== 0 && !this.checkFlag) return true;
      return false;
    },
    checkEmailErrorFlag() {
      if (this.emailCheckValue.length !== 0 && !this.checkFlagEamil) {
        return true;
      }
      return false;
    },
    // 验证框是否为错误
    googleErrorFlag() {
      if (this.googleVlaue.length !== 0 && !this.googleFlag) return true;
      return false;
    },
    // 二次确认按钮是否开启
    confirmBtnFlag() {
      if (this.googleStatus === 1) {
        if (this.googleErrorFlag || this.googleVlaue.length === 0) {
          return true;
        }
      }
      if (this.isOpenMobileCheck === 1) {
        if (this.checkValue.length === 0 || this.checkErrorFlag) {
          return true;
        }
      }
      return false;
    },
  },
  methods: {
    init() {
      this.pageId = this.$route.params.id;
      this.getData();
    },
    fixFloat(num, precision) {
      return fixFloat(num, precision);
    },
    thousandsComma(num) {
      return thousandsComma(num);
    },
    getCaptchaObj(captchaObj) {
      this.captchaObj = captchaObj;
    },
    verifyCallBack(parameter) {
      this.verifyObj = {
        geetest_challenge: parameter.geetest_challenge,
        geetest_seccode: parameter.geetest_seccode,
        geetest_validate: parameter.geetest_validate,
      };
      this.verifyFlag = true;
      this.dialogFlag = true;
    },
    countScale(a, b) {
      return !a || !b ? 0 : nul(a, b);
    },
    fixDFun(val, symbol) {
      if (this.showPrecision(symbol)) {
        return fixD(val, this.showPrecision(symbol));
      }
      return val;
    },
    showPrecision(symbol) {
      if (
        this.$store.state.baseData
        && this.$store.state.baseData.market
        && this.$store.state.baseData.market.coinList
      ) {
        const { coinList } = this.$store.state.baseData.market;
        if (coinList[symbol]) {
          const precision = coinList[symbol].showPrecision;
          if (precision) {
            return precision;
          }
        }
      }
      return 4;
    },
    setStatusText(data) {
      let text = '';
      switch (data.status) {
        case 2:
          text = this.$t('innov.status1'); // '预热中';
          break;
        case 3:
          text = this.$t('innov.status2'); // '进行中';
          break;
        case 4:
          text = this.$t('innov.status3'); // '募集完成';
          break;
        case 5:
          text = this.$t('innov.status4'); // '发放TOKEN';
          break;
        default:
          text = this.$t('innov.status5'); // '退还申购基金';
      }
      return text;
    },
    // tab切换
    currentType(item) {
      this.nowType = item.index;
    },
    submit() {
      // 兑换金额不能小于单次购买最小额度
      if (this.amount < this.pageData.singleMinRaiseMoney) {
        this.$bus.$emit('tip', {
          text: `${this.$t('innov.lowerThanMinAmount')}${this.pageData.singleMinRaiseMoney}`,
          type: 'error',
        });

        return;
      }
      // 单笔兑换金额不能大于单次兑换最大额度
      if (this.amount > this.pageData.singleMaxRaiseMoney) {
        this.$bus.$emit('tip', {
          text: `${this.$t('innov.higherThanMaxAmount')}${this.pageData.singleMaxRaiseMoney}`,
          type: 'error',
        });

        return;
      }
      // 接受币种余额不足
      if (this.amount > this.pageData.u_coinSymbol_amount) {
        this.$bus.$emit('tip', {
          text: `${this.pageData.coinSymbol}${this.$t('innov.balanceNotEnough')}`,
          type: 'error',
        });

        return;
      }
      // 输入额度超出我的剩余可兑换额度
      if (this.pageData.level_amount !== null && this.amount > this.pageData.level_amount) {
        this.$bus.$emit('tip', {
          text: `${this.$t('innov.surplusExchangeAmount')}:${this.pageData.level_amount}`,
          type: 'error',
        });

        return;
      }
      // 判断如果没有谷歌验证 没有手机验证  没有邮箱验证 或者 没有绑定邮箱的时候提示去绑定手机号或者谷歌
      if (
        this.googleStatus !== 1
        && this.isOpenMobileCheck !== 1
        && (!this.pageData.email_validate_open || !this.emailAuthOpen)
      ) {
        this.$bus.$emit('tip', {
          text: this.$t('innov.binding'),
          type: 'error',
        });

        return;
      }

      // 谷歌强制认证开启的时候 判断有没有谷歌没有的话 提示去绑定
      if (this.googleStatus !== 1 && this.enforceGoogleAuth) {
        this.$bus.$emit('tip', {
          text: this.$t('assets.withdraw.bindGoogle'),
          type: 'error',
        });

        return;
      }

      if (this.verificationType === '2') {
        this.captchaObj.verify();
      } else {
        this.dialogFlag = true;
      }
    },
    inputChanges(value, name) {
      this[name] = value;
    },
    formatTimeFn(date) {
      return formatTime(date);
    },
    // 关闭弹窗
    dialogClose() {
      this.dialogFlag = false;
      this.checkValue = '';
      this.googleVlaue = '';
      this.emailCheckValue = '';
    },
    // 发送验证码组件点击button
    getCodeClick() {
      this.sendCode();
    },
    postEmailCode() {
      // this.$bus.$emit('getCode-start', 'EmailCode');
      const info = { operationType: 21 };
      this.$store.dispatch('sendEmailCode', info);
    },
    // 发送验证码
    sendCode() {
      this.axios({
        url: 'v4/common/smsValidCode',
        method: 'post',
        header: {},
        params: {
          operationType: 28,
        },
      })
        .then((data) => {
          if (data.code.toString() !== '0') {
            // 倒计时重置
            this.$bus.$emit('getCode-clear', 'loginGetcode');
            // tip框提示错误
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          } else {
            // 邮件已发送，请注意查收
            this.$bus.$emit('tip', {
              text: '验证码已发送，请注意查收',
              type: 'success',
            });
          }
        })
        .catch(() => {

        });
    },
    dialogConfirm() {
      if (this.dbclick) {
        let params = {
          verificationType: this.verificationType,
          amount: this.amount,
          projectId: this.pageData.id,
          smsValidCode: this.checkValue,
          googleCode: this.googleVlaue,
          symbol: this.pageData.coinSymbol,
          percent: this.pageData.speed,
          emailValidCode: this.emailCheckValue,
        };
        if (this.verificationType === '2') {
          params = Object.assign(params, this.verifyObj);
        }
        this.dbclick = false;
        this.axios({
          url: this.$store.state.url.common.newcoin_purchase,
          headers: {},
          params,
          method: 'post',
        }).then((data) => {
          this.dialogClose();
          this.dbclick = true;
          if (data.code.toString() === '0') {
            // '申购成功，募集完成后可获得项目Token'
            this.amount = '';
            this.$bus.$emit('tip', {
              text: this.$t('innov.token'),
              type: 'success',
            });
            window.location.reload();
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      }
    },
    // 请求数据
    getData() {
      this.axios({
        url: this.$store.state.url.common.newcoin_project_detail,
        params: {
          projectId: Number(this.pageId),
        },
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          const { status } = data.data;
          if (status === 0 || status === 1 || status === 7) {
            this.$router.replace('/innovation');
          }
          // data.data.email_validate_open = 0;
          this.pageData = data.data;
          this.bannerImg = data.data.banner;
        }
      });
    },
    // goTrade
    goTrade() {
      this.$router.push('/trade');
    },
  },
};
