// @ is an alias to /src
import { imgMap, colorMap } from '@/utils';

export default {
  name: 'krwManagement',
  data() {
    return {
      id: '', // uid
      mobileNumber: '', // 手机号或者邮箱显示
      authLevel: '', // 身份/实名认证状态，0、未审核，1、通过，2、未通过  3未认证
      nickName: '', // 昵称
      userName: '',
      imgMap,
      colorMap,
      email: '', // 邮箱
      dialogType: 1,
      is_krw_phone_auth: '', // NICE认证 1：已完成手机认证   0：未完成手机认证
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
      feeCoinOpen: '0',
      photo: imgMap.photo1,
      krwAuthFlag: false, // 身份认证对话框开关 -- krw定制
      krwAuthType: '1', // 身份认证对话框 select 选择值 -- krw定制
      krwAlertFlag: false, // krw 绑定银行卡前置条件校验
      krwConfrimFlag: false, // krw nice认证确认是否通过验证
      // 邀请码信息
      inviteCodeShow: true,
      inviteUrlShow: true,
      inviteCode: '',
      inviteQECode: '',
      inviteUrl: '',
      titleText: this.$t('personal.dialog.title'),
    };
  },
  watch: {
    userInfo(userinfo) { // 监听userinfo接口
      if (userinfo) {
        this.getUserInfo(); // 获取用户信息
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
    // 身份认证对话框 select 列表 -- krw定制
    krwAuthTypeOptions() {
      return [
        // 韩国
        { value: this.$t('personal.krw.authType'), code: '1' },
        // 外国人
        { value: this.$t('personal.krw.authOther'), code: '2' },
      ];
    },
    krwAlertData() {
      let authFlag = false;
      if (this.krwPhoneAuth === '1' || this.authLevel === 1) {
        authFlag = true;
      }
      const arr = [
        // 请您先完成NICE认证或身份认证
        { text: this.$t('personal.krw.alertk'), flag: authFlag },
        // OTP认证
        { text: this.$t('personal.krw.OTPk'), flag: Boolean(this.googleCode) },
      ];
      return arr;
    },
    krwUserBank() {
      return this.$store.state.personal.krwUserBank;
    },
    // 该用户是否完成nice认证
    krwPhoneAuth() {
      let str = '0';
      if (this.userInfo
        && this.userInfo.is_krw_phone_auth) {
        str = this.userInfo.is_krw_phone_auth.toString();
      }
      return str;
    },
    // 开启验证方式
    coinsKrwOpen() {
      const { publicInfo } = this.$store.state.baseData;
      let str = '0';
      if (publicInfo && publicInfo.switch && publicInfo.switch.coins_krw_open) {
        str = publicInfo.switch.coins_krw_open.toString();
      }
      return str;
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
  },
  methods: {
    init() {
      this.$store.dispatch('getUserInfo');
    },
    krwConfirmClick() {
      this.krwConfrimFlag = false;
      this.$store.dispatch('getUserInfo');
    },
    krwAlertClose() {
      this.krwAlertFlag = false;
    },
    // krw 绑定银行卡
    krwBindBank() {
      let authFlag = false;
      if (this.krwPhoneAuth === '1' || this.authLevel === 1) {
        authFlag = true;
      }
      if (this.googleCode && authFlag) {
        this.$router.push('/personal/krwBank');
      } else {
        this.krwAlertFlag = true;
      }
    },
    // nice证对话框 clone -- krw定制
    krwAuthClose() {
      this.krwAuthFlag = false;
    },
    // nice对话框 confirm -- krw定制
    krwAuthConfirm() {
      if (this.krwAuthType === '1') {
        // window.open('/ex/personal/krwKyc');
        if (this.krwPhoneAuth === '1') {
          this.$router.push('/personal/idAuth');
        } else {
          this.krwAuthFlag = false;
          // 请您先完善手机实名认证
          this.$bus.$emit('tip', { text: this.$t('personal.krw.phonek'), type: 'warning' });
        }
      } else {
        this.$router.push('/personal/idAuth');
      }
    },
    // nice认证 点击认证按钮 -- krw定制
    krwAuthentication() {
      this.krwConfrimFlag = true;
      window.open('/personal/krwKyc',
        '_blank',
        'menubar=0,scrollbars=1, resizable=1,status=1,titlebar=0,toolbar=0,location=1,height=614,width=432');
      // window.open('/ex/personal/krwKyc');
      // this.$router.push('/personal/krwKyc');
    },
    // nice认证 选择国籍 -- krw定制
    krwAuthTypeChange(item) {
      this.krwAuthType = item.code;
    },
    // 身份认证点击
    krwUserAuthClick() {
      if (this.krwPhoneAuth === '1') {
        this.$router.push('/personal/idAuth');
      } else {
        this.krwAuthFlag = true;
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
      // this.$bus.$emit('tip', { text: this.$t('personal.prompt.copySucces'), type: 'success' });
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
      } else if (link === 'krwBank') {
        this.$router.push('/personal/krwBank');
      } else {
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
          // 昵称不能为空
          this.errorText = this.$t('personal.userManagement.nameError1');
        } else if (val.length > 10) {
          this.checkErrorFlag = true;
          // 昵称长度不可超过十位
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
        // this.authLevel = 2
        this.is_krw_phone_auth = this.userInfo.is_krw_phone_auth; // NICE认证
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
