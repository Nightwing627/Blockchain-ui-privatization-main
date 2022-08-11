import { imgMap } from '@/utils';
import countryMinix from '../../../../PC/common-mixin/countryList/countryList';

export default {
  name: 'userManagement',
  mixins: [countryMinix],
  data() {
    return {
      mobileNumber: '', // 手机号或者邮箱显示
      authLevel: '', // 身份/实名认证状态，0、未审核，1、通过，2、未通过  3未认证
      email: '', // 邮箱
      dialogFlag: false,
      dialogConfirmLoading: false,
      dialogConfirmDisabled: false,
      oldName: '', // 用户最初昵称
      smsCode: false, // false对应0 关闭 true对应1 开启(手机短信认证)
      googleCode: false, // false对应0 关闭 true对应1 开启(google认证)
      switchValue: false, // 手续费设置
      clickType: true, // 可点击状态
      alertFlag: false,
      feeCoinOpen: '0',
      photo: imgMap.photo1,
      dialogType: 1,
      inviteCodeShow: true,
      inviteUrlShow: true,
      // 邀请码信息
      inviteCode: '',
      inviteQECode: '',
      inviteUrl: '',
      titleText: this.$t('personal.dialog.title'),
      showIinviteCode: false,
      state: 'KYC_AUTH',
      kycPhoneFlag: false,
      kycflag: false,
      kycButtonLoading: false,
    };
  },
  watch: {
    userInfo(userinfo) { // 监听userinfo接口
      if (userinfo) {
        this.getUserInfo();// 获取用户信息
      }
      this.googleCode = !!Number(userinfo.googleStatus);
      this.smsCode = !!Number(userinfo.isOpenMobileCheck);
    },
    openMobileVerify(openMobileVerify) {
      if (openMobileVerify !== null) {
        if (openMobileVerify.text === 'success') {
          this.$bus.$emit('tip', { text: openMobileVerify.msg, type: 'success' });
          this.$store.dispatch('resetType');
          this.$store.dispatch('getUserInfo');
        } else {
          this.$bus.$emit('tip', { text: openMobileVerify.msg, type: 'error' });
          this.$store.dispatch('resetType');
        }
      }
    },
    updateFeeCoinOpen(updateFeeCoinOpen) {
      if (updateFeeCoinOpen !== null) {
        const type = this.switchValue;
        if (updateFeeCoinOpen.text === 'success') {
          if (type) {
            this.$bus.$emit('tip', { text: this.$t('personal.state.closeSuccess'), type: 'success' });
            this.switchValue = !type;
            this.$store.dispatch('resetType');
          } else {
            this.$bus.$emit('tip', { text: this.$t('personal.state.openSuccess'), type: 'success' });
            this.switchValue = !type;
            this.$store.dispatch('resetType');
          }
        } else {
          this.$bus.$emit('tip', { text: updateFeeCoinOpen.msg, type: 'error' });
          this.$store.dispatch('resetType');
        }
      }
    },
    exccKycConfig(exccKycConfig) {
      if (exccKycConfig !== null && this.kycflag) {
        this.dialogConfirmLoading = false;
        if (exccKycConfig.text === 'success') {
          let fromPath = 'idAuth';
          if (exccKycConfig.data.openSingPass === '0') {
            if (exccKycConfig.data.verfyTemplet === '2') {
              fromPath = 'exccAuthForm';
            }
          } else {
            fromPath = 'kycAuth';
          }
          this.kycflag = false;
          this.$router.push(`/personal/${fromPath}?country=${this.country.split('+')[1]}&countryKeyCode=${this.countryKeyCode.split('+')[1]}`);
        } else {
          this.$bus.$emit('tip', { text: exccKycConfig.msg, type: 'error' });
          this.$store.dispatch('resetType');
        }
      }
    },
  },
  computed: {
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    openMobileVerify() {
      return this.$store.state.personal.openMobileVerify;
    },
    updateFeeCoinOpen() {
      return this.$store.state.personal.updateFeeCoinOpen;
    },
    navList() {
      return [
        {
          // 安全设置
          text: this.$t('personal.userManagement.securityTitle'),
          active: true,
          link: '/personal/userManagement',
        },
        {
          // 安全记录
          text: this.$t('personal.navMenu.list.safetyRecord'),
          link: '/personal/safetyRecord',
        },
      ];
    },
    exccKycConfig() {
      return this.$store.state.personal.exccKycConfig;
    },
    publicInfo() { return this.$store.state.baseData.publicInfo; },
  },
  methods: {
    init() {
      if (this.$route.query.state === this.state && this.$route.query.kycError) {
        this.$bus.$emit('tip', { text: this.$t('personal.exccAuth.errorText1'), type: 'error' });
      }
      // 获取 userinfo
      this.$store.dispatch('getUserInfo');
    },
    goAgent() {
      this.$router.push('/broker');
    },
    hideInviteCode() {
      this.showIinviteCode = false;
    },
    showInviteCode() {
      this.showIinviteCode = true;
    },
    copyClick(name) {
      const input = this.$refs[name];
      input.select();
      input.setSelectionRange(0, input.value.length);
      document.execCommand('copy');
      this.$bus.$emit('tip', {
        text: this.$t('personal.prompt.copySucces'),
        type: 'success',
      });
    },
    handMouseenter(name) {
      if (name === 'inviteCode') {
        this.inviteCodeShow = false;
      } else {
        this.inviteUrlShow = false;
      }
    },
    handMouseleave(name) {
      if (name === 'inviteCode') {
        this.inviteCodeShow = true;
      } else {
        this.inviteUrlShow = true;
      }
    },
    btnLink(link) {
      if (link === 'google') {
        this.$router.push('/personal/bindGoogle');
      } else if (link === 'phone') {
        this.$router.push('/personal/bindPhone');
      } else if (link === 'email') {
        this.$router.push('/personal/bindEmail');
      } else {
        this.$router.push('/personal/idAuth');
      }
    },
    dialogClose() { // 关闭或取消时
      this.dialogConfirmDisabled = false;
      this.dialogConfirmFlag = false;
      this.dialogFlag = false;
    },
    dialogConfirm() { // 点击确认时
      if (this.dialogType === 2) {
        this.dialogConfirmFlag = false;
        this.dialogFlag = false;
      }
    },
    modify(num) {
      if (num !== 1) {
        this.dialogType = 2;
        this.titleText = this.$t('personal.userManagement.otherList.myInviteCod.text');
      }
      this.dialogConfirmFlag = true;
      this.dialogFlag = true;
    },
    getUserInfo() {
      if (this.userInfo !== null) {
        // 邀请码信息
        this.inviteCode = this.userInfo.inviteCode;
        this.inviteQECode = this.userInfo.inviteQECode;
        this.inviteUrl = this.userInfo.inviteUrl;
        this.mobileNumber = this.userInfo.mobileNumber;// 电话号码
        this.email = this.userInfo.email;// 邮箱
        this.authLevel = this.userInfo.authLevel; // 身份认证状态
        if (Number(this.userInfo.useFeeCoinOpen) === 1) { // 是否开启手续费设置 1 开启 0 关闭
          this.switchValue = true;
        } else {
          this.switchValue = false;
        }
        this.feeCoinOpen = this.userInfo.fee_coin_open;
      }
    },
    openMobile() {
      this.$store.dispatch('openMobileVerify');
    },
    switchChange() {
      if (this.clickType) {
        this.clickType = false;
        setTimeout(() => {
          this.clickType = true;
        }, 1000);
        if (this.switchValue) {
          const info = { useFeeCoinOpen: '0' };
          this.$store.dispatch('updateFeeCoinOpen', info);
        } else {
          const info = { useFeeCoinOpen: '1' };
          this.$store.dispatch('updateFeeCoinOpen', info);
        }
      }
    },
    changePassword() {
      if (this.smsCode === true || this.googleCode === true) {
        this.$router.push('/personal/changePassword');
      } else {
        this.alertFlag = true;
      }
    },
    changeEmail() {
      if (this.smsCode === true || this.googleCode === true) {
        this.$router.push('/personal/changeEmail');
      } else {
        this.alertFlag = true;
      }
    },
    alertClose() {
      this.alertFlag = false;
    },
    alertGo() {
      this.alertFlag = false;
    },
    kycPhoneClose() {
      this.kycPhoneFlag = false;
    },
    identity(id) {
      if (id === '1') {
        this.kycPhoneFlag = true;
      } else {
        this.$router.push('/personal/idAuth');
      }
    },
    kycPhoneConfirm() {
      const customConfigData = this.publicInfo.custom_config;
      let kycSingaporeOpen = null;
      let customConfig = null;
      if (customConfigData) {
        try {
          customConfig = JSON.parse(customConfigData);
        } catch (error) {
          console.log(error);
        }
        kycSingaporeOpen = customConfig ? customConfig.kyc_singapore_open : null;
      }
      this.kycflag = true;
      this.dialogConfirmLoading = true;
      if (kycSingaporeOpen && kycSingaporeOpen !== '0') {
        this.$store.dispatch('exccKycConfig', {});
      } else {
        this.$router.push(`/personal/idAuth?country=${this.country.split('+')[1]}&countryKeyCode=${this.countryKeyCode.split('+')[1]}`);
      }
    },
    countryChange(item) {
      this.country = item.code;
      this.countryKeyCode = item.keyCode;
    },
  },
};
