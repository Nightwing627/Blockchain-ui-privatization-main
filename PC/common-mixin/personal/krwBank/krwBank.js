export default {
  name: 'changePassword',
  data() {
    return {
      userName: '', // 户名
      backType: '', // 开户行
      bankAccount: '', // 银行账号
      // 开户行列表
      backTypeOptions: [],
      smsCode: '',
      googleCode: '',
      submitLoading: false, // 提交按钮loading
    };
  },
  watch: {
    userInfo(v) {
      if (v) {
        if (v.realName.length) {
          this.userName = v.realName;
        } else {
          this.userName = v.phone_auth_name;
        }
        this.initStatus();
      }
    },
  },
  computed: {
    // 用户是否开启谷歌
    OpenGoogle() {
      let flag = false;
      const { userInfo } = this.$store.state.baseData;
      if (userInfo && userInfo.googleStatus.toString() === '1') {
        flag = true;
      }
      return flag;
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
    authLevel() {
      let str = '';
      if (this.userInfo) {
        str = this.userInfo.authLevel.toString();
      }
      return str;
    },
    krwUserBank() {
      return this.$store.state.personal.krwUserBank;
    },
    regExps() { return this.$store.state.regExp; },
    userInfo() {
      return this.$store.state.baseData.userInfo;
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
    // 银行账号
    bankAccountFlag() { return this.regExps.number.test(this.bankAccount); },
    // 银行账号是否为错误
    bankAccountErrorFlag() {
      if (this.bankAccount.length !== 0 && !this.bankAccountFlag) return true;
      return false;
    },
    // 短信验证码 -- 正则验证
    smsCodeFlag() { return this.regExps.verification.test(this.smsCode); },
    // 银行账号是否为错误
    smsCodeFlagErrorFlag() {
      if (this.smsCode.length !== 0 && !this.smsCodeFlag) return true;
      return false;
    },
    // 谷歌验证码 -- 正则验证
    googleCodeFlag() { return this.regExps.verification.test(this.googleCode); },
    // 银行账号是否为错误
    googleCodeFlagErrorFlag() {
      if (this.googleCode.length !== 0 && !this.googleCodeFlag) return true;
      return false;
    },
    submitDisabled() {
      let phone = true;
      let google = true;
      if (this.OpenMobile) { phone = this.smsCodeFlag; }
      if (this.OpenGoogle) { google = this.googleCodeFlag; }
      if ((this.backType.length
       && this.bankAccountFlag
       && phone && google) || this.submitLoading) {
        return false;
      }
      return true;
    },
  },
  methods: {
    init() {
      if (this.userInfo) {
        if (this.userInfo.realName.length) {
          this.userName = this.userInfo.realName;
        } else {
          this.userName = this.userInfo.phone_auth_name;
        }
        this.initStatus();
      }
      this.axios({
        url: 'bank/all',
        method: 'post',
      }).then((data) => {
        if (data.code.toString() === '0') {
          const arr = [];
          data.data.forEach((item) => {
            arr.push({
              value: item.name,
              code: item.id.toString(),
            });
          });
          if (arr.length) {
            this.backType = arr[0].code;
          }
          this.backTypeOptions = arr;
        }
      });
    },
    initStatus() {
      let authFlag = false;
      if (this.krwPhoneAuth === '1' || this.authLevel === '1') {
        authFlag = true;
      }
      if (!this.OpenGoogle || !authFlag) {
        this.$router.push('/personal/userManagement');
      }
    },
    submit() {
      this.submitLoading = true;
      let url = 'user/bank/add';
      // this.userName = '1'
      const params = {
        bankNo: this.backType, // 开户行id
        cardNo: this.bankAccount, // 银行账号
        name: this.userName, // 姓名
        smsAuthCode: this.smsCode,
        googleCode: this.googleCode,
      };
      // 修改
      if (this.krwUserBank) {
        url = 'user/bank/edit';
        params.id = this.krwUserBank.id;
      }
      this.axios({
        url,
        params,
      }).then((data) => {
        this.submitLoading = false;
        if (data.code.toString() !== '0') {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        } else {
          this.$store.dispatch('krwGetUserBank');
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.$router.push('/personal/userManagement');
        }
      });
    },
    getCodeClick() {
      let operationType = '30';
      if (this.krwUserBank) {
        operationType = '31';
      }
      this.axios({
        url: 'v4/common/smsValidCode',
        params: { operationType },
      }).then((data) => {
        if (data.code.toString() !== '0') {
          setTimeout(() => {
            // 倒计时重置
            this.$bus.$emit('getCode-clear', 'smsCode');
            // tip框提示错误
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }, 2000);
        } else {
          // 短信已发送，请注意查收
          this.$bus.$emit('tip', { text: this.$t('assets.addressMent.phoneSendSuccess'), type: 'success' });
        }
      });
    },
    inputChanges(value, name) {
      this[name] = value;
    },
    backTypeChange(item) {
      this.backType = item.code;
    },
  },
};
