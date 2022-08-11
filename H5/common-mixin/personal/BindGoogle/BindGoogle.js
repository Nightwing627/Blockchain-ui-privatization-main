export default {
  name: 'bindEmail',
  watch: {
    userInfo(userinfo) {
      this.googleCode = !!Number(userinfo.googleStatus);
      this.smsCode = !!Number(userinfo.isOpenMobileCheck);
    },
    toopenGoogleAuthenticator(toopenGoogleAuthenticator) {
      this.googleImg = toopenGoogleAuthenticator.googleImg;
      this.googleKey = toopenGoogleAuthenticator.googleKey;
    },
    googleVerify(googleVerify) {
      if (googleVerify !== null) {
        this.loading = false;
        if (googleVerify.text === 'success') {
          this.$bus.$emit('tip', { text: googleVerify.msg, type: 'success' });
          this.$store.dispatch('resetType');
          this.$router.push('/personal/userManagement');
        } else {
          this.$bus.$emit('tip', { text: googleVerify.msg, type: 'error' });
          this.$store.dispatch('resetType');
        }
      }
    },
  },
  computed: {
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    toopenGoogleAuthenticator() {
      return this.$store.state.personal.toopenGoogleAuthenticator;
    },
    googleVerify() {
      return this.$store.state.personal.googleVerify;
    },
  },
  data() {
    return {
      svgShow: true,
      loading: false,
      checkValue4: '',
      checkValue5: '',
      promptText4: this.$t('personal.label.password'),
      promptText5: this.$t('personal.label.googleCodeText'),
      errorText4: this.$t('personal.prompt.errorPasswordText'),
      errorText5: this.$t('personal.prompt.errorCode'),
      checkErrorFlag4: false,
      checkErrorFlag5: false,
      disabled: true,
      oldNew: false,
      smsCode: false,
      googleCode: false,
      autoStart: false,
      googleImg: '',
      googleKey: '',
    };
  },
  methods: {
    reload() {
      this.init();
    },
    init() {
      this.$store.dispatch('toopenGoogleAuthenticator');
      if (this.userInfo) {
        this.googleCode = !!Number(this.userInfo.googleStatus);
        this.smsCode = !!Number(this.userInfo.isOpenMobileCheck);
      }
    },
    handMouseenter() {
      this.svgShow = false;
    },
    handMouseleave() {
      this.svgShow = true;
    },
    copyClick() {
      this.copy(this.googleKey);
    },
    copy() {
      // this.$bus.$emit('tip', { text: this.$t('personal.prompt.copySucces'), type: 'success' });
      // function save(e) {
      //   e.clipboardData.setData('text/plain', str); // 下面会说到clipboardData对象
      //   e.preventDefault(); // 阻止默认行为
      // }
      // document.addEventListener('copy', save);
      // document.execCommand('copy'); // 使文档处于可编辑状态，否则无效
      // document.removeEventListener('copy', save);
      const input = this.$refs.googleKey;
      input.select();
      input.setSelectionRange(0, input.value.length);
      document.execCommand('copy');
      this.$bus.$emit('tip', {
        text: this.$t('personal.prompt.copySucces'),
        type: 'success',
      });
    },
    // 密码正则
    passFlag(val) {
      return this.$store.state.regExp.passWord.test(val);
    },
    codeFlag(val) {
      return this.$store.state.regExp.verification.test(val);
    },
    getCodeClick(name) {
      if (name === 'phone') {
        this.$bus.$emit('getCode-start', 'phone');
        const info = { operationType: 5 };
        this.$store.dispatch('sendSmsCode', info);
      }
    },
    inputChanges(value, name) {
      if (name === 'password') {
        this.checkValue4 = value;
        if (this.passFlag(value)) {
          this.checkErrorFlag4 = false;
        } else {
          this.checkErrorFlag4 = true;
        }
      } else {
        this.checkValue5 = value;
        if (this.codeFlag(value)) {
          this.checkErrorFlag5 = false;
        } else {
          this.checkErrorFlag5 = true;
        }
      }
      if (this.checkValue5 && this.checkValue4
        && !this.checkErrorFlag4 && !this.checkErrorFlag5) {
        this.disabled = false;
      } else {
        this.disabled = true;
      }
    },
    btnLink(name) {
      if (name === 'appstore') {
        window.open('https://itunes.apple.com/us/app/google-authenticator/id388497605?mt=8');
      } else if (name === 'googleplay') {
        window.open('https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2');
      } else if (name === 'android') {
        window.open('https://sj.qq.com/myapp/detail.htm?apkName=com.google.android.apps.authenticator2');
      } else {
        this.loading = true;
        const info = {
          googleKey: this.googleKey,
          googleCode: this.checkValue5,
          loginPwd: this.checkValue4,
        };
        this.$store.dispatch('googleVerify', info);
      }
    },
  },
};
