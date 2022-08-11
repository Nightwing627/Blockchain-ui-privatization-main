
export default {
  name: 'checkApi',
  props: {
    getApiList: {
      default: () => [],
      type: Function,
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
        }
      }
    },
    updateOpenApi(updateOpenApi) {
      if (updateOpenApi !== null) {
        this.loading = false;
        if (updateOpenApi.text === 'success') {
          this.$bus.$emit('tip', { text: updateOpenApi.msg, type: 'success' });
          this.$store.dispatch('resetType');
          this.$store.dispatch('setModifyApiShow', false);
          this.getApiList('set');
        } else {
          this.$bus.$emit('tip', { text: updateOpenApi.msg, type: 'error' });
          this.$store.dispatch('resetType');
        }
      }
    },
  },
  computed: {
    sendSmsCode() {
      return this.$store.state.personal.sendSmsCode;
    },
    updateOpenApi() {
      return this.$store.state.personal.updateOpenApi;
    },
  },
  data() {
    return {
      // input
      loading: false,
      divShow: 1,
      promptText1: this.$t('personal.label.ipText'),
      errorText1: this.$t('personal.prompt.ipErrorText'),
      checkErrorFlag1: false,
      checkValue1: '',
      promptText2: this.$t('personal.label.noteText'),
      errorText2: '',
      checkErrorFlag2: false,
      checkValue2: '',
      promptText3: this.$t('personal.label.smsCodeText'),
      errorText3: this.$t('personal.prompt.errorCode'),
      checkErrorFlag3: false,
      checkValue3: '',
      promptText4: this.$t('personal.label.googleCodeText'),
      errorText4: this.$t('personal.prompt.errorCode'),
      checkErrorFlag4: false,
      checkValue4: '',
      disabled: true,
      googleCode: false,
      smsCode: false,
    };
  },
  methods: {
    init() {
      const { userInfo } = this.$store.state.baseData;
      if (userInfo !== null) {
        this.googleCode = !!Number(userInfo.googleStatus);
        this.smsCode = !!Number(userInfo.isOpenMobileCheck);
      }
      const { apiIp } = this.$store.state.personal;
      const { apiLabel } = this.$store.state.personal;
      if (apiIp !== null) {
        this.checkValue1 = apiIp;
      }
      if (apiLabel !== null) {
        this.checkValue2 = apiLabel;
      }
    },
    dealIp(value) {
      let a = true;
      if (value.indexOf(',') !== -1) {
        if (value.charAt(value.length - 1) === ',') { // 如果最后一位是,删除最后一位再进行处理
          const attr = value.substring(0, value.length - 1).split(',');
          const len = attr.length;
          if (len <= 5) {
            attr.forEach((obj) => {
              if (this.ipFlag(obj)) {
                a = true;
              } else {
                a = false;
              }
            });
          } else {
            a = false;
          }
        } else { // 否则正常处理
          const attr = value.split(',');
          const len = attr.length;
          if (len <= 5) {
            attr.forEach((obj) => {
              if (this.ipFlag(obj)) {
                a = true;
              } else {
                a = false;
              }
            });
          } else {
            a = false;
          }
        }
      } else {
        a = this.ipFlag(value);
      }
      return a;
    },
    ipFlag(val) {
      let flag = false;
      if (!val) {
        flag = true;
      } else {
        flag = new RegExp(this.$store.state.regExp.ip, 'g').test(val);
      }
      return flag;
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
        case 'ip':
          this.checkValue1 = val;
          if (this.dealIp(val)) {
            this.checkErrorFlag1 = false;
          } else {
            this.checkErrorFlag1 = true;
          }
          break;
        case 'note':
          this.checkValue2 = val;
          break;
        case 'phoneCode':
          this.checkValue3 = val;
          if (this.codeFlag(val)) {
            this.checkErrorFlag3 = false;
          } else {
            this.checkErrorFlag3 = true;
          }
          break;
        default:
          this.checkValue4 = val;
          if (this.codeFlag(val)) {
            this.checkErrorFlag4 = false;
          } else {
            this.checkErrorFlag4 = true;
          }
      }
      if (this.checkValue2 && !this.checkErrorFlag1
        && !this.checkErrorFlag3 && !this.checkErrorFlag4) {
        if (this.smsCode) {
          this.disabled = !this.checkValue3;
        }
        if (this.googleCode) {
          this.disabled = !this.checkValue4;
        }
      } else {
        this.disabled = true;
      }
    },
    btnLink() {
      this.loading = true;
      const token = this.$store.state.personal.apiToken;
      const info = {
        smsValidCode: this.checkValue3,
        googleCode: this.checkValue4,
        label: this.checkValue2,
        believeIps: this.checkValue1,
        token,
      };
      this.$store.dispatch('updateOpenApi', info);
    },

  },
};
