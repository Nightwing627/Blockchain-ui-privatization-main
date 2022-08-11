export default {
  name: 'b2cMixins',
  data() {
    return {
      alertFlag: false,
    };
  },
  watch: {
    userInfoIsReady: {
      immediate: true,
      handler(v) {
        if (v) {
          this.canAlert();
        }
      },
    },
  },
  methods: {
    alertClone() { this.alertFlag = false; },
    alertGo() {
      if (window.isApp) {
        if (!this.idAuth) {
          this.$router.push('/personal/idAuth');
          return;
        }
        if (!this.OpenGoogle) {
          this.$router.push('/personal/bindGoogle');
        }
        if (!this.enforceGoogleAuth && !this.OpenMobile) {
          this.$router.push('/personal/bindPhone');
        }
      } else {
        this.$router.push('/personal/userManagement');
      }
    },
    canAlert() {
      if ((this.OpenGoogle || (!this.enforceGoogleAuth && this.OpenMobile)) && this.idAuth) {
        this.alertFlag = false;
      } else {
        setTimeout(() => {
          this.alertFlag = true;
        }, 100);
      }
    },
  },
  computed: {
    userInfoIsReady() { return this.$store.state.baseData.userInfoIsReady; },
    // 是否强制谷歌
    enforceGoogleAuth() {
      return this.$store.state.baseData.is_enforce_google_auth || 0;
    },
    authTitleText() {
      const text = 'assets.withdraw.enforceGoogleAuth';
      return this.$t(text);
    },
    alertData() {
      const arr = [
        // 实名认证
        { text: this.$t('otcRelease.authentication'), flag: this.idAuth },
        // 绑定谷歌验证
        { text: this.$t('assets.withdraw.bindGoogle'), flag: this.OpenGoogle },
      ];
      if (!this.enforceGoogleAuth) {
        // 绑定手机验证
        arr.push({ text: this.$t('assets.withdraw.bindPhone'), flag: this.OpenMobile });
      }
      return arr;
    },
    // 用户是否开启手机
    OpenMobile() {
      let flag = false;
      const { userInfo } = this.$store.state.baseData;
      if (userInfo && userInfo.isOpenMobileCheck.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    // 用户是否开启谷歌
    OpenGoogle() {
      let flag = false;
      const { userInfo } = this.$store.state.baseData;
      if (userInfo && userInfo.googleStatus.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    idAuth() {
      const { userInfo } = this.$store.state.baseData;
      let idAuth = 0;
      if (userInfo) {
        idAuth = Number(userInfo.authLevel) === 1;
      }
      return idAuth;
    },
  },
};
