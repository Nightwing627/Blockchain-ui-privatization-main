import { imgMap } from '@/utils';
// 输入框
export default {
  data() {
    return {
      dialogConfirmLoading: false,
      dialogConfirmDisabled: false,
      checkErrorFlag: false,
      checkValue: '',
      dialogFlag: false,
      nickName: '',
      titleText: this.$t('personal.dialog.title'),
      promptText: this.$t('personal.dialog.name'),
      errorText: this.$t('personal.dialog.text'),
      userName: '',
      id: '',
    };
  },
  computed: {
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    headImg() {
      return imgMap.head;
    },
    modifyNickName() {
      return this.$store.state.personal.modifyNickName;
    },
  },
  watch: {
    userInfo(userinfo) { // 监听userinfo接口
      if (userinfo) {
        this.getUserInfo();
      }
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
  },
  methods: {
    init() {
      if (this.userInfo) {
        this.getUserInfo();
      }
    },
    modify() {
      this.dialogType = 1;
      this.titleText = this.$t('personal.dialog.title');
      this.dialogConfirmFlag = true;
      this.dialogFlag = true;
    },
    getUserInfo() {
      if (this.userInfo !== null) {
        // 邀请码信息
        this.userName = (this.userInfo.mobileNumber !== '') ? this.userInfo.mobileNumber : this.userInfo.email;// 有电话号码显示电话号码,无则显示邮箱
        this.nickName = (this.userInfo.nickName !== '')
          ? this.userInfo.nickName
          : this.$t('personal.userManagement.userName');
        this.checkValue = this.userInfo.nickName;
        this.oldName = this.userInfo.nickName;
        this.id = this.userInfo.id;
      }
    },
    inputChanges(val) { // 获取输入框内容
      this.checkValue = val;
    },
    dialogClose() { // 关闭或取消时
      this.dialogConfirmDisabled = false;
      this.dialogConfirmFlag = false;
      this.dialogFlag = false;
      this.checkValue = this.oldName;
      this.checkErrorFlag = false;
    },
    dialogConfirm() { // 点击确认时
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
    },
  },
};
