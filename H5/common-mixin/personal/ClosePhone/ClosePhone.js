export default {
  name: 'bindEmail',
  created() {},
  watch: {
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
    closeMobileVerify(closeMobileVerify) {
      if (closeMobileVerify !== null) {
        this.loading = false;
        if (closeMobileVerify.text === 'success') {
          this.$bus.$emit('tip', { text: closeMobileVerify.msg, type: 'success' });
          this.$store.dispatch('resetType');
          this.$router.push('/personal/userManagement');
        } else {
          this.$bus.$emit('tip', { text: closeMobileVerify.msg, type: 'error' });
          this.$store.dispatch('resetType');
          if (closeMobileVerify.code !== '10009') {
            this.$bus.$emit('getCode-clear', 'smsCode');
          }
        }
      }
    },
  },
  computed: {
    sendSmsCode() {
      return this.$store.state.personal.sendSmsCode;
    },
    closeMobileVerify() {
      return this.$store.state.personal.closeMobileVerify;
    },
  },
  data() {
    return {
      loading: false,
      checkValue1: '',
      checkValue2: '',
      promptText1: this.$t('personal.label.googleCodeText'),
      promptText2: this.$t('personal.label.smsCodeText'),
      errorText1: this.$t('personal.prompt.errorCode'),
      errorText2: this.$t('personal.prompt.errorCode'),
      checkErrorFlag1: false,
      checkErrorFlag2: false,
      disabled: true,
    };
  },
  methods: {
    codeFlag(val) {
      return this.$store.state.regExp.verification.test(val);
    },
    getCodeClick(name) {
      if (name === 'smsCode') {
        this.$bus.$emit('getCode-start', 'smsCode');
        const info = { operationType: 14 };
        this.$store.dispatch('sendSmsCode', info);
      }
    },
    inputChanges(value, name) {
      if (name === 'googleCode') {
        this.checkValue1 = value;
        if (this.codeFlag(value)) {
          this.checkErrorFlag1 = false;
        } else {
          this.checkErrorFlag1 = true;
        }
      } else {
        this.checkValue2 = value;
        if (this.codeFlag(value)) {
          this.checkErrorFlag2 = false;
        } else {
          this.checkErrorFlag2 = true;
        }
      }
      if (this.checkValue1 && this.checkValue2
          && !this.checkErrorFlag1 && !this.checkErrorFlag2) {
        this.disabled = false;
      } else {
        this.disabled = true;
      }
    },
    btnLink() {
      this.loading = true;
      const info = {
        googleCode: this.checkValue1,
        smsValidCode: this.checkValue2,
      };
      this.$store.dispatch('closeMobileVerify', info);
    },
  },
};
