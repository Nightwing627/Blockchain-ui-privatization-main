export default {
  name: 'modifySettings',
  data() {
    return {
      loading: false,
      // 验证码部分
      promptText1: this.$t('personal.label.smsCodeText'),
      errorText1: this.$t('personal.prompt.errorCode'),
      checkErrorFlag1: false,
      checkValue1: '',
      promptText2: this.$t('personal.label.googleCodeText'),
      errorText2: this.$t('personal.prompt.errorCode'),
      checkErrorFlag2: false,
      checkValue2: '',
      promptText3: '',
      errorText3: this.$t('personal.prompt.errorPasswordText'),
      checkErrorFlag3: false,
      checkValue3: '',
      promptText4: '',
      errorText4: this.$t('personal.prompt.errorPasswordTwo'),
      checkErrorFlag4: false,
      checkValue4: '',
      disabled: true,
      // 验证框显示隐藏
      smsCode: false,
      googleCode: false,
      // 是否开启资金密码 0 关闭 1 开启
      isCapitalPwordSet: 0,
    };
  },
  methods: {
    init() {
      const { userInfo } = this.$store.state.baseData;
      if (userInfo !== null) {
        this.googleCode = !!Number(userInfo.googleStatus);
        this.smsCode = !!Number(userInfo.isOpenMobileCheck);
        this.isCapitalPwordSet = userInfo.isCapitalPwordSet;
      }
    },
    passwordFlag(val) {
      return this.$store.state.regExp.passWord.test(val);
    },
    codeFlag(val) {
      return this.$store.state.regExp.verification.test(val);
    },
    getCodeClick() {
      this.$bus.$emit('getCode-start', 'phone');
      const info = {
        operationType: (this.isCapitalPwordSet === 0 ? 6 : 7),
      };
      this.$store.dispatch('sendSmsCode', info);
    },
    inputChanges(value, name) {
      switch (name) {
        case 'password':
          this.checkValue3 = value;
          if (this.passwordFlag(value)) {
            this.checkErrorFlag3 = false;
            if (this.checkValue4 && this.checkValue3 !== this.checkValue4) {
              this.checkErrorFlag4 = true;
            } else {
              this.checkErrorFlag4 = false;
            }
          } else {
            this.checkErrorFlag3 = true;
          }
          break;
        case 'passwordAgain':
          this.checkValue4 = value;
          if (this.checkValue3 === this.checkValue4) {
            this.checkErrorFlag4 = false;
          } else {
            this.checkErrorFlag4 = true;
          }
          break;
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
      if (this.checkValue3 && this.checkValue4
        && this.checkValue3 === this.checkValue4
        && !this.checkErrorFlag3 && !this.checkErrorFlag4
        && !this.checkErrorFlag1 && !this.checkErrorFlag2) {
        if (this.smsCode) {
          this.disabled = !this.checkValue1;
        }
        if (this.googleCode) {
          this.disabled = !this.checkValue2;
        }
        if (this.googleCode && this.smsCode) {
          this.disabled = !(this.checkValue1 && this.checkValue2);
        }
      } else {
        this.disabled = true;
      }
    },
    btnLink() {
      this.loading = true;
      const info = {
        newCapitalPwd: this.checkValue3,
        smsAuthCode: this.checkValue1,
        googleCode: this.checkValue2,
      };
      this.$store.dispatch('otcCapitalPasswordSet', info);
    },
  },
  computed: {
    enforceGoogleAuth() {
      return this.$store.state.baseData.is_enforce_google_auth || 0;
    },
    moneyPassword() {
      if (this.isCapitalPwordSet === 0) {
        return this.$t('personal.label.moneyPassword');
      }
      return this.$t('personal.label.oldMoneyPassword');
    },
    confirmMoneyPassword() {
      if (this.isCapitalPwordSet === 0) {
        return this.$t('personal.label.confirmMoneyPassword');
      }
      return this.$t('personal.label.newConfirmMoneyPassword');
    },
    sendSmsCode() {
      return this.$store.state.personal.sendSmsCode;
    },
    otcCapitalPasswordSet() {
      return this.$store.state.personal.otcCapitalPasswordSet;
    },
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
  },
  watch: {
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
    otcCapitalPasswordSet(otcCapitalPasswordSet) {
      if (otcCapitalPasswordSet !== null) {
        this.loading = false;
        if (otcCapitalPasswordSet.text === 'success') {
          this.$bus.$emit('tip', { text: otcCapitalPasswordSet.msg, type: 'success' });
          this.$store.dispatch('resetType');
          this.$router.push('/personal/leaglTenderSet');
        } else {
          this.$bus.$emit('tip', { text: otcCapitalPasswordSet.msg, type: 'error' });
          this.$store.dispatch('resetType');
          this.$bus.$emit('getCode-clear', 'phone');
        }
      }
    },
    userInfo(userInfo) {
      if (userInfo !== null) {
        this.googleCode = !!Number(userInfo.googleStatus);
        this.smsCode = !!Number(userInfo.isOpenMobileCheck);
        this.isCapitalPwordSet = userInfo.isCapitalPwordSet;
      }
    },
  },
};
