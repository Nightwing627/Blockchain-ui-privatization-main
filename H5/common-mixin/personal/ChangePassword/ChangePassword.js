export default {
  name: 'changePassword',
  watch: {
    userInfo(userinfo) {
      this.googleCode = !!Number(userinfo.googleStatus);
      this.smsCode = !!Number(userinfo.isOpenMobileCheck);
    },
    resetPassword(resetPassword) {
      if (resetPassword !== null) {
        this.loading = false;
        if (resetPassword.text === 'success') {
          // this.$bus.$emit('tip', { text: resetPassword.msg, type: 'success' });
          this.$store.dispatch('resetType');
          this.out();
        } else {
          this.$bus.$emit('tip', { text: resetPassword.msg, type: 'error' });
          this.$store.dispatch('resetType');
          if (resetPassword.code !== '10009') {
            this.$bus.$emit('getCode-clear', 'loginGetcode');
          }
        }
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
        }
      }
    },
  },
  computed: {
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    resetPassword() {
      return this.$store.state.personal.resetPassword;
    },
    sendSmsCode() {
      return this.$store.state.personal.sendSmsCode;
    },
  },
  data() {
    return {
      checkValue1: '',
      checkValue2: '',
      checkValue3: '',
      checkValue4: '',
      checkValue5: '',
      promptText1: this.$t('personal.label.oldPassword'),
      promptText2: this.$t('personal.label.newPassword'),
      promptText3: this.$t('personal.label.newPasswordAgain'),
      promptText4: this.$t('personal.label.smsCodeText'),
      promptText5: this.$t('personal.label.googleCodeText'),
      errorText1: this.$t('personal.prompt.errorPasswordText'),
      errorText2: this.$t('personal.prompt.errorPasswordText'),
      errorText3: this.$t('personal.prompt.errorPasswordTwo'),
      errorText4: this.$t('personal.prompt.errorCode'),
      errorText5: this.$t('personal.prompt.errorCode'),
      checkErrorFlag1: false,
      checkErrorFlag2: false,
      checkErrorFlag3: false,
      checkErrorFlag4: false,
      checkErrorFlag5: false,
      disabled: true,
      oldNew: false,
      smsCode: false,
      googleCode: false,
      loading: false,
    };
  },
  methods: {
    init() {
      if (this.userInfo) {
        this.googleCode = !!Number(this.userInfo.googleStatus);
        this.smsCode = !!Number(this.userInfo.isOpenMobileCheck);
      }
    },
    out() {
      this.axios({
        url: '/user/login_out',
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.$bus.$emit('outUserIsLogin');
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    getCodeClick() {
      const info = { operationType: 5 };
      this.$store.dispatch('sendSmsCode', info);
    },
    // 密码正则
    passFlag(val) {
      return this.$store.state.regExp.passWord.test(val);
    },
    codeFlag(val) {
      return this.$store.state.regExp.verification.test(val);
    },
    inputChanges(value, name) {
      switch (name) {
        case 'oldPassword': { // oldpassword
          this.checkValue1 = value;
          if (this.passFlag(value)) {
            this.checkErrorFlag1 = false;
          } else {
            this.checkErrorFlag1 = true;
          }
          break;
        }
        case 'newPassword': { // newpassword
          this.checkValue2 = value;
          if (this.passFlag(value)) {
            this.checkErrorFlag2 = false;
          } else {
            this.checkErrorFlag2 = true;
          }
          break;
        }
        case 'newPasswordAgain': { // newpassword again
          this.checkValue3 = value;
          if (this.checkValue3 === this.checkValue2) {
            this.checkErrorFlag3 = false;
          } else {
            this.checkErrorFlag3 = true;
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
      if (this.checkValue1 && this.checkValue2 && this.checkValue3
        && this.checkValue2 === this.checkValue3 && !this.checkErrorFlag1
        && !this.checkErrorFlag2 && !this.checkErrorFlag3
        && !this.checkErrorFlag4 && !this.checkErrorFlag5) {
        if (this.smsCode) {
          this.disabled = !this.checkValue4;
        }
        if (this.googleCode) {
          this.disabled = !this.checkValue5;
        }
        if (this.smsCode && this.googleCode) {
          this.disabled = !(this.checkValue5 && this.checkValue4);
        }
      } else {
        this.disabled = true;
      }
    },
    checkFocus(num) {
      switch (num) {
        case '1': { // oldpassword
          break;
        }
        case '2': { // newpassword
          break;
        }
        default: { // newpassword again
          // console.log(1);
        }
      }
    },
    btnLink() {
      const info = {
        loginPword: this.checkValue1,
        newLoginPword: this.checkValue2,
        smsAuthCode: this.checkValue4,
        googleCode: this.checkValue5,
      };
      this.loading = true;
      this.$store.dispatch('resetPassword', info);
    },
  },
};
