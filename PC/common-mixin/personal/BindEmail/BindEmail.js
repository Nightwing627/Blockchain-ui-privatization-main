export default {
  name: 'bindEmail',
  watch: {
    userInfo(userinfo) {
      this.googleCode = !!Number(userinfo.googleStatus);
      this.smsCode = !!Number(userinfo.isOpenMobileCheck);
    },
    sendSmsCode(sendSmsCode) {
      if (sendSmsCode !== null) {
        if (sendSmsCode.text === 'success') {
          this.$bus.$emit('tip', { text: sendSmsCode.msg, type: 'success' });
          this.$store.dispatch('resetType');
        } else {
          this.$bus.$emit('tip', { text: sendSmsCode.msg, type: 'error' });
          this.$store.dispatch('resetType');
        }
      }
    },
    sendEmailCode(sendEmailCode) {
      if (sendEmailCode !== null) {
        if (sendEmailCode.text === 'success') {
          this.$bus.$emit('tip', { text: sendEmailCode.msg, type: 'success' });
          this.$store.dispatch('resetType');
        } else {
          this.$bus.$emit('tip', { text: sendEmailCode.msg, type: 'error' });
          this.$store.dispatch('resetType');
        }
      }
    },
    bindEmail(bindEmail) {
      this.loading = false;
      if (bindEmail.text === 'success') {
        this.$bus.$emit('tip', { text: bindEmail.msg, type: 'success' });
        this.$store.dispatch('resetType');
        this.$router.push('/personal/userManagement');
      } else {
        this.$bus.$emit('tip', { text: bindEmail.msg, type: 'error' });
        this.$store.dispatch('resetType');
        if (bindEmail.code !== '10009') {
          this.$bus.$emit('getCode-clear', 'phone');
        }
      }
    },
  },
  computed: {
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    sendSmsCode() {
      return this.$store.state.personal.sendSmsCode;
    },
    sendEmailCode() {
      return this.$store.state.personal.sendEmailCode;
    },
    bindEmail() {
      return this.$store.state.personal.bindEmail;
    },
  },
  data() {
    return {
      loading: false,
      checkValue1: '',
      checkValue2: '',
      checkValue4: '',
      checkValue5: '',
      promptText1: this.$t('personal.label.email'),
      promptText2: this.$t('personal.label.emailCodeText'),
      promptText4: this.$t('personal.label.smsCodeText'),
      promptText5: this.$t('personal.label.googleCodeText'),
      errorText1: this.$t('personal.prompt.errorEmailText'),
      errorText2: this.$t('personal.prompt.errorCode'),
      errorText4: this.$t('personal.prompt.errorCode'),
      errorText5: this.$t('personal.prompt.errorCode'),
      checkErrorFlag1: false,
      checkErrorFlag2: false,
      checkErrorFlag4: false,
      checkErrorFlag5: false,
      disabled: true,
      oldNew: false,
      smsCode: false,
      googleCode: false,
      autoStart: false,
      error: false,
    };
  },
  methods: {
    init() {
      if (this.userInfo) {
        this.googleCode = !!Number(this.userInfo.googleStatus);
        this.smsCode = !!Number(this.userInfo.isOpenMobileCheck);
      }
    },
    emailFlag(val) {
      return this.$store.state.regExp.email.test(val);
    },
    codeFlag(val) {
      return this.$store.state.regExp.verification.test(val);
    },
    getCodeClick(name) {
      if (name === 'phone') {
        this.$bus.$emit('getCode-start', 'phone');
        const info = { operationType: 5 };
        this.$store.dispatch('sendSmsCode', info);
      } else if (this.emailFlag(this.checkValue1)) {
        this.$bus.$emit('getCode-start', 'email');
        const info = { email: this.checkValue1, operationType: 2 };
        this.$store.dispatch('sendEmailCode', info);
      } else {
        this.checkErrorFlag1 = true;
        this.errorText1 = this.$t('personal.prompt.errorEmail');
      }
    },
    inputChanges(value, name) {
      switch (name) {
        case 'email': { // email
          this.checkValue1 = value;
          if (this.emailFlag(value)) {
            this.checkErrorFlag1 = false;
          } else {
            this.errorText1 = this.$t('personal.prompt.errorEmailText');
            this.checkErrorFlag1 = true;
          }
          break;
        }
        case 'emailCode': {
          this.checkValue2 = value;
          if (this.codeFlag(value)) {
            this.checkErrorFlag2 = false;
          } else {
            this.checkErrorFlag2 = true;
          }
          break;
        }
        case 'smsCode': { // 短信验证码
          this.checkValue4 = value;
          if (this.codeFlag(value)) {
            this.checkErrorFlag4 = false;
          } else {
            this.checkErrorFlag4 = true;
          }
          break;
        }
        default: { // google验证码
          this.checkValue5 = value;
          if (this.codeFlag(value)) {
            this.checkErrorFlag5 = false;
          } else {
            this.checkErrorFlag5 = true;
          }
        }
      }
      if (this.checkValue1 && this.checkValue2 && !this.checkErrorFlag1
        && !this.checkErrorFlag2 && !this.checkErrorFlag4 && !this.checkErrorFlag5) {
        /*
        if (this.smsCode) {
          this.disabled = !this.checkValue4;
        }
        if (this.google) {
          this.disabled = !this.checkValue5;
        }
        */
        this.disabled = false;
      } else {
        this.disabled = true;
      }
    },
    btnLink() {
      this.loading = true;
      const info = {
        email: this.checkValue1,
        emailValidCode: this.checkValue2,
        smsValidCode: this.checkValue4,
        googleCode: this.checkValue5,
      };
      this.$store.dispatch('bindEmail', info);
    },
  },
};
