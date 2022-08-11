import { imgMap, colorMap } from '@/utils';
import countryMinix from '../../countryList/countryList';

export default {
  name: 'userManagement',
  mixins: [countryMinix],
  data() {
    return {
      id: '', // uid
      mobileNumber: '', // 手机号或者邮箱显示
      authLevel: '', // 身份/实名认证状态，0、未审核，1、通过，2、未通过  3未认证
      nickName: '', // 昵称
      userName: '',
      email: '', // 邮箱
      dialogFlag: false,
      dialogConfirmLoading: false,
      dialogConfirmDisabled: false,
      checkErrorFlag: false,
      checkValue: '',
      promptText: this.$t('personal.dialog.name'),
      errorText: this.$t('personal.dialog.text'),
      oldName: '', // 用户最初昵称
      smsCode: false, // false对应0 关闭 true对应1 开启(手机短信认证)
      googleCode: false, // false对应0 关闭 true对应1 开启(google认证)
      switchValue: false, // 手续费设置
      clickType: true, // 可点击状态
      alertFlag: false,
      imgMap,
      colorMap,
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
      kycPhoneFlag: false, // kyc选择国家弹窗
      country: '', // kyc用户选择的国家
      kycLoading: false,
      state: 'KYC_AUTH',
    };
  },
  watch: {
    // 默认区号
    defaultCountryCode(v) {
      if (v && this.country === '') {
        this.country = v;
      }
    },
    userInfo(userinfo) { // 监听userinfo接口
      if (userinfo) {
        this.getUserInfo();// 获取用户信息
      }
      this.googleCode = !!Number(userinfo.googleStatus);
      this.smsCode = !!Number(userinfo.isOpenMobileCheck);
      this.id = userinfo.id;
    },
    modifyNickName(modifyNickName) { // 修改昵称逻辑操作
      if (modifyNickName !== null) {
        if (modifyNickName.text === 'success') {
          // tip框提示
          this.$bus.$emit('tip', { text: modifyNickName.msg, type: 'success' });
          // 重新获取 userinfo
          this.$store.dispatch('getUserInfo');
          this.dialogConfirmFlag = false;
          this.dialogFlag = false;
          this.checkValue = this.oldName;
          this.checkErrorFlag = false;
          this.dialogConfirmLoading = false;
          this.$store.dispatch('resetType');
        } else {
          // tip框提示错误
          this.$bus.$emit('tip', { text: modifyNickName.msg, type: 'error' });
          this.$store.dispatch('resetType');
          this.dialogConfirmLoading = false;
        }
      }
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
  },
  computed: {
    interfaceSwitch() {
      return this.$store.state.baseData.interfaceSwitch;
    },
    templateLayoutType() {
      return this.$store.state.baseData.templateLayoutType;
    },
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    modifyNickName() {
      return this.$store.state.personal.modifyNickName;
    },
    openMobileVerify() {
      return this.$store.state.personal.openMobileVerify;
    },
    updateFeeCoinOpen() {
      return this.$store.state.personal.updateFeeCoinOpen;
    },
    headImg() {
      return imgMap.head;
    },
    publicInfo() { return this.$store.state.baseData.publicInfo; },
    // ”00“ face++
    // ”01“羽山kyc
    // “02”简版自动
    // ”10“ 人工
    nameVerifiedType() {
      return this.$store.state.baseData.nameVerifiedType;
    },
  },
  methods: {
    init() {
      this.$store.dispatch('getUserInfo');
    },
    goAgent() {
      this.$router.push('/agent');
    },
    // kyc 弹窗关闭
    kycPhoneClose() {
      // 关闭弹窗
      this.kycPhoneFlag = false;
      // 初始化select内容
      this.country = this.defaultCountryCodeReal
        ? this.defaultCountryCodeReal : this.countryMap[this.defaultCountryCode].code; // 所在地
      this.countryKeyCode = this.defaultCountryCode ? this.defaultCountryCode : ''; // 所在地
    },
    // kyc 弹窗确认
    kycPhoneConfirm() {
      // 中国人 - 认证face++
      if (this.nameVerifiedType === '00' && this.country === '+156') {
        this.axios({
          url: '/kyc/Api/get_Valid_QRcode',
        }).then((data) => {
          this.kycLoading = false;
          if (data.code.toString() === '0') {
            const { openAuto, limitFlag } = data.data;
            if ((openAuto && openAuto.toString() === '0')
              || (limitFlag && limitFlag.toString() === '1')) {
              // if (kycSingaporeOpen && kycSingaporeOpen !== '0') {
              //   this.$store.dispatch('exccKycConfig', {});
              // } else {
              this.$router.push('/personal/idAuth?country=156&countryKeyCode=86');
              // }
            } else {
              this.$router.push('/personal/faceAuth?country=156&countryKeyCode=86');
            }
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      // 外国人 - 认证
      } else {
        // if (kycSingaporeOpen && kycSingaporeOpen !== '0') {
        //   this.$store.dispatch('exccKycConfig', {});
        // } else {
        const countryNum = this.country.split('+')[1];
        const countryKeyCodeNum = this.countryKeyCode.split('+')[1];
        this.$router.push(`/personal/idAuth?country=${countryNum}&countryKeyCode=${countryKeyCodeNum}`);
        // }
        this.kycLoading = false;
      }
    },
    copyClick(name) {
      if (name === 'inviteCode') {
        this.copy(this.inviteCode);
      } else {
        this.copy(this.inviteUrl);
      }
    },
    copy(str) {
      this.$bus.$emit('tip', { text: this.$t('personal.prompt.copySucces'), type: 'success' });
      function save(e) {
        e.clipboardData.setData('text/plain', str); // 下面会说到clipboardData对象
        e.preventDefault(); // 阻止默认行为
      }
      document.addEventListener('copy', save);
      document.execCommand('copy'); // 使文档处于可编辑状态，否则无效
      document.removeEventListener('copy', save);
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
      } else if (link === 'identity') {
        this.kycPhoneFlag = true;
      } else if (link === 'goID') {
        this.$router.push('/personal/idAuth');
      }
    },
    dialogClose() { // 关闭或取消时
      this.dialogConfirmDisabled = false;
      this.dialogConfirmFlag = false;
      this.dialogFlag = false;
      this.checkValue = this.oldName;
      this.checkErrorFlag = false;
    },
    dialogConfirm() { // 点击确认时
      if (this.dialogType === 2) {
        this.dialogConfirmFlag = false;
        this.dialogFlag = false;
      } else {
        const val = this.checkValue;
        if (val.length === 0) { // 为空提示
          this.checkErrorFlag = true;
          this.errorText = this.$t('personal.userManagement.nameError1');
        } else if (val.length > 10) {
          this.checkErrorFlag = true;
          this.errorText = this.$t('personal.userManagement.nameError2');
        } else { // 非空提交
          this.dialogConfirmLoading = true;
          this.$store.dispatch('modifyNickName', { nickname: val });
        }
      }
    },
    inputChanges(val) { // 获取输入框内容
      this.checkValue = val;
    },
    checkFocus() {

    },
    modify(num) {
      if (num === 1) {
        this.dialogType = 1;
        this.titleText = this.$t('personal.dialog.title');
      } else {
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
        // 邀请码信息
        this.userName = (this.userInfo.mobileNumber !== '') ? this.userInfo.mobileNumber : this.userInfo.email;// 有电话号码显示电话号码,无则显示邮箱
        this.mobileNumber = this.userInfo.mobileNumber;// 电话号码
        this.nickName = (this.userInfo.nickName !== '')
          ? this.userInfo.nickName
          : this.$t('personal.userManagement.userName');
        this.email = this.userInfo.email;// 邮箱
        this.checkValue = this.userInfo.nickName;
        this.oldName = this.userInfo.nickName;
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
  },
};
