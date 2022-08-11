import countryMinix from '../../../../PC/common-mixin/countryList/countryList';

export default {
  name: 'changePassword',
  mixins: [countryMinix],
  watch: {
    userInfo(userinfo) {
      this.googleCode = !!Number(userinfo.googleStatus);
      this.smsCode = !!Number(userinfo.isOpenMobileCheck);
      this.checkValue1 = this.userInfo.mobileNumber;
    },
    mobileUpdate(mobileUpdate) {
      if (mobileUpdate !== null) {
        this.loading = false;
        if (mobileUpdate.text === 'success') {
          this.$bus.$emit('tip', { text: mobileUpdate.msg, type: 'success' });
          this.$store.dispatch('resetType');
          this.$router.push('/personal/userManagement');
        } else {
          this.$bus.$emit('tip', { text: mobileUpdate.msg, type: 'error' });
          this.$store.dispatch('resetType');
          if (mobileUpdate.code !== '10009') {
            this.$bus.$emit('getCode-clear', 'smsCode');
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
    defaultCountryCode(v) {
      if (v && this.country === '') {
        this.country = v;
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
    mobileUpdate() {
      return this.$store.state.personal.mobileUpdate;
    },
  },
  data() {
    return {
      promptText: this.$t('personal.label.promptText'),
      errorText: this.$t('personal.label.errorText'),
      loading: false,
      checkValue1: '',
      checkValue2: '',
      checkValue3: '',
      checkValue4: '',
      checkValue5: '',
      promptText1: this.$t('personal.label.oldPhone'),
      promptText2: this.$t('personal.label.smsCodeText'),
      promptText3: this.$t('personal.label.newPhone'),
      promptText4: this.$t('personal.label.smsCodeText'),
      promptText5: this.$t('personal.label.googleCodeText'),
      errorText1: '',
      errorText2: this.$t('personal.prompt.errorCode'),
      errorText3: this.$t('personal.prompt.errorPhone'),
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
      countryErrorFlag: false,
    };
  },
  methods: {
    init() {
      if (this.userInfo) {
        this.googleCode = !!Number(this.userInfo.googleStatus);
        this.smsCode = !!Number(this.userInfo.isOpenMobileCheck);
        this.checkValue1 = this.userInfo.mobileNumber;
      }
    },
    // 手机正则
    phoneFlag(val) {
      return this.$store.state.regExp.phone.test(val);
    },
    codeFlag(val) {
      return this.$store.state.regExp.verification.test(val);
    },
    getCodeClick(name) {
      if (name === 'oldSmsCode') {
        this.$bus.$emit('getCode-start', 'oldSmsCode');
        const info = { operationType: 3 };
        this.$store.dispatch('sendSmsCode', info);
      } else if (this.checkValue3 && !this.checkErrorFlag3) {
        this.$bus.$emit('getCode-start', 'smsCode');
        const info = {
          mobile: this.checkValue3,
          operationType: 2,
          countryCode: this.countryKeyCode,
        };
        this.$store.dispatch('sendSmsCode', info);
      } else {
        this.checkErrorFlag3 = true;
        this.errorText3 = this.$t('personal.prompt.errorNewPhone');
      }
    },
    inputChanges(value, name) {
      switch (name) {
        case 'oldSmsCode': { // oldSmsCode
          this.checkValue2 = value;
          if (this.codeFlag(value)) {
            this.checkErrorFlag2 = false;
          } else {
            this.checkErrorFlag2 = true;
          }
          break;
        }
        case 'newPhone': { // newPhone
          this.checkValue3 = value;
          if (this.phoneFlag(value)) {
            this.checkErrorFlag3 = false;
          } else {
            this.checkErrorFlag3 = true;
            this.errorText3 = this.$t('personal.prompt.errorPhone');
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
      if (this.checkValue4 && this.checkValue2 && this.checkValue3
        && !this.checkErrorFlag2 && !this.checkErrorFlag3 && !this.checkErrorFlag4
        && !this.checkErrorFlag5) {
        if (this.googleCode) {
          this.disabled = !this.checkValue5;
        } else {
          this.disabled = false;
        }
      } else {
        this.disabled = true;
      }
    },
    btnLink() {
      this.loading = true;
      const info = {
        smsAuthCode: this.checkValue4,
        countryCode: this.countryKeyCode,
        mobileNumber: this.checkValue3,
        googleCode: this.checkValue5,
        authenticationCode: this.checkValue2,
      };
      this.$store.dispatch('mobileUpdate', info);
    },
  },
};
