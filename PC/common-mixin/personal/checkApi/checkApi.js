export default {
  name: 'checkApi',
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
    openApiOne(openApiOne) {
      if (openApiOne !== null) {
        this.loading = false;
        if (openApiOne.text === 'success') {
          this.$bus.$emit('tip', { text: openApiOne.msg, type: 'success' });
          this.$store.dispatch('resetType');
          this.secretKey = openApiOne.data.secretKey;
          this.qrCode = openApiOne.data.qrCode;
          this.divShow = 2;
        } else {
          this.$bus.$emit('tip', { text: openApiOne.msg, type: 'error' });
          this.$store.dispatch('resetType');
          if (openApiOne.code !== '10009') {
            this.$bus.$emit('getCode-clear', 'phone');
          }
        }
      }
    },
  },
  computed: {
    sendSmsCode() {
      return this.$store.state.personal.sendSmsCode;
    },
    openApiOne() {
      return this.$store.state.personal.openApiOne;
    },
  },
  data() {
    return {
      svgShow: true,
      // input'
      loading: false,
      divShow: 1,
      promptText1: this.$t('personal.label.smsCodeText'),
      errorText1: this.$t('personal.prompt.errorCode'),
      checkErrorFlag1: false,
      checkValue1: '',
      promptText2: this.$t('personal.label.googleCodeText'),
      errorText2: this.$t('personal.prompt.errorCode'),
      checkErrorFlag2: false,
      checkValue2: '',
      disabled: true,
      googleCode: false,
      smsCode: false,
      secretKey: '',
      qrCode: '',
    };
  },
  methods: {
    init() {
      const { userInfo } = this.$store.state.baseData;
      if (userInfo !== null) {
        this.googleCode = !!Number(userInfo.googleStatus);
        this.smsCode = !!Number(userInfo.isOpenMobileCheck);
      }
    },
    handMouseenter() {
      this.svgShow = false;
    },
    handMouseleave() {
      this.svgShow = true;
    },
    codeFlag(val) {
      return this.$store.state.regExp.verification.test(val);
    },
    getCodeClick() {
      this.$bus.$emit('getCode-start', 'phone');
      const info = { operationType: 16 };
      this.$store.dispatch('sendSmsCode', info);
    },
    inputChanges(val, name) {
      switch (name) {
        case 'phoneCode':
          this.checkValue1 = val;
          if (this.codeFlag(val)) {
            this.checkErrorFlag1 = false;
          } else {
            this.checkErrorFlag1 = true;
          }
          break;
        default:
          this.checkValue2 = val;
          if (this.codeFlag(val)) {
            this.checkErrorFlag2 = false;
          } else {
            this.checkErrorFlag2 = true;
          }
      }

      if (!this.checkErrorFlag1 && !this.checkErrorFlag2) {
        if (this.smsCode) {
          this.disabled = !this.checkValue1;
        }
        if (this.googleCode) {
          this.disabled = !this.checkValue2;
        }
      } else {
        this.disabled = true;
      }
    },
    btnLink() {
      this.loading = true;
      const token = this.$store.state.personal.apiToken;
      const info = {
        smsValidCode: this.checkValue1,
        googleCode: this.checkValue2,
        token,
      };
      this.$store.dispatch('openApiOne', info);
    },
    copyClick(name) {
      if (name === 'secretKey') {
        this.copy(this.secretKey);
      }
    },
    copy(str) {
      // this.$bus.$emit('tip', { text: this.$t('personal.prompt.copySucces'), type: 'success' });
      function save(e) {
        e.clipboardData.setData('text/plain', str); // 下面会说到clipboardData对象
        e.preventDefault(); // 阻止默认行为
      }
      document.addEventListener('copy', save);
      document.execCommand('copy'); // 使文档处于可编辑状态，否则无效
      document.removeEventListener('copy', save);
    },
  },
};
