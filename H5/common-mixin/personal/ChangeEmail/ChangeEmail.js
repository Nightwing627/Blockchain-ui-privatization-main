export default {
  name: 'changePassword',
  watch: {
    userInfo(userinfo) {
      this.googleCode = !!Number(userinfo.googleStatus);
      this.smsCode = !!Number(userinfo.isOpenMobileCheck);
      this.checkValue1 = this.userInfo.email;
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
    emailUpdate(emailUpdate) {
      if (emailUpdate !== null) {
        this.loading = false;
        if (emailUpdate.text === 'success') {
          this.$bus.$emit('tip', { text: emailUpdate.msg, type: 'success' });
          this.$store.dispatch('resetType');
          this.$router.push('/personal/userManagement');
        } else {
          this.$bus.$emit('tip', { text: emailUpdate.msg, type: 'error' });
          this.$store.dispatch('resetType');
          if (emailUpdate.code !== '10009') {
            this.$bus.$emit('getCode-clear', 'smsCode');
          }
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
  },
  computed: {
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    sendSmsCode() {
      return this.$store.state.personal.sendSmsCode;
    },
    emailUpdate() {
      return this.$store.state.personal.emailUpdate;
    },
    sendEmailCode() {
      return this.$store.state.personal.sendEmailCode;
    },
  },
  data() {
    return {
      loading: false,
      checkValue1: '',
      checkValue2: '',
      checkValue3: '',
      checkValue6: '',
      checkValue4: '',
      checkValue5: '',
      promptText1: this.$t('personal.label.oldEmail'),
      promptText2: this.$t('personal.label.newEmail'),
      promptText3: this.$t('personal.label.emailCodeText'),
      promptText6: this.$t('personal.label.newEmailCodeText'),
      promptText4: this.$t('personal.label.smsCodeText'),
      promptText5: this.$t('personal.label.googleCodeText'),
      errorText1: '',
      errorText2: this.$t('personal.prompt.errorEmailText'),
      errorText3: this.$t('personal.prompt.errorCode'),
      errorText6: this.$t('personal.prompt.errorCode'),
      errorText4: this.$t('personal.prompt.errorCode'),
      errorText5: this.$t('personal.prompt.errorCode'),
      checkErrorFlag1: false,
      checkErrorFlag2: false,
      checkErrorFlag3: false,
      checkErrorFlag6: false,
      checkErrorFlag4: false,
      checkErrorFlag5: false,
      disabled: true,
      oldNew: false,
      smsCode: false,
      googleCode: false,
    };
  },
  methods: {
    init() {
      if (this.userInfo) {
        this.googleCode = !!Number(this.userInfo.googleStatus);
        this.smsCode = !!Number(this.userInfo.isOpenMobileCheck);
        this.checkValue1 = this.userInfo.email;
      }
    },
    getCodeClick(name) {
      if (name === 'smsCode') {
        this.$bus.$emit('getCode-start', 'smsCode');
        const info = { operationType: 15 };
        this.$store.dispatch('sendSmsCode', info);
      } else if (name === 'oldEmailCode') {
        this.$bus.$emit('getCode-start', 'oldEmailCode');
        const info = { operationType: 15 };
        this.$store.dispatch('sendEmailCode', info);
      } else if (this.checkValue2) {
        this.$bus.$emit('getCode-start', 'newEmailCode');
        const info = { email: this.checkValue2, operationType: 2 };
        this.$store.dispatch('sendEmailCode', info);
      } else {
        this.checkErrorFlag2 = true;
        this.errorText2 = this.$t('personal.prompt.errorEmail');
      }
    },
    inputChanges(value, name) {
      switch (name) {
        case 'newEmail': { // newEmail
          this.checkValue2 = value;
          if (this.emailFlag(value)) {
            this.checkErrorFlag2 = false;
          } else {
            this.checkErrorFlag2 = true;
          }
          break;
        }
        case 'oldEmailCode': { // oldEmailCode
          this.checkValue3 = value;
          if (this.codeFlag(value)) {
            this.checkErrorFlag3 = false;
          } else {
            this.checkErrorFlag3 = true;
          }
          break;
        }
        case 'newEmailCode': { // newEmailCode
          this.checkValue6 = value;
          if (this.codeFlag(value)) {
            this.checkErrorFlag6 = false;
          } else {
            this.checkErrorFlag6 = true;
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
      if (this.checkValue2 && this.checkValue3 && this.checkValue6
          && !this.checkErrorFlag2 && !this.checkErrorFlag3
          && !this.checkErrorFlag4 && !this.checkErrorFlag5
          && !this.checkErrorFlag6) {
        if (this.smsCode) {
          this.disabled = !this.checkValue4;
        }
        if (this.googleCode) {
          this.disabled = !this.checkValue5;
        }
        if (!this.smsCode && !this.googleCode) {
          this.disabled = false;
        }
      } else {
        this.disabled = true;
      }
    },
    emailFlag(val) {
      return this.$store.state.regExp.email.test(val);
    },
    codeFlag(val) {
      return this.$store.state.regExp.verification.test(val);
    },
    btnLink() {
      this.loading = true;
      const info = {
        emailOldValidCode: this.checkValue3,
        emailNewValidCode: this.checkValue6,
        email: this.checkValue2,
        smsValidCode: this.checkValue4,
        googleCode: this.checkValue5,
      };
      this.$store.dispatch('emailUpdate', info);
    },
  },
};
