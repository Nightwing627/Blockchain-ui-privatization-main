export default {
  name: 'page-resetPass',
  data() {
    return {
      nowType: 'phone', // phone--手机注册  email--邮箱注册
      nowStep: '1', // 当前步骤
      // 内容部分
      userValue: '', // userValue
      checkValue: '', // 验证码value
      passValue: '', // 密码Value
      comfirmValue: '', // 确认密码value
      submitLoading: false,
      submitDisabled: false,
      verifyObj: {}, // 滑动返回对象
      verifyFlag: false, // 滑动是否通过
      haveGoogle: false, // 是否开启谷歌
      haveID: false, // 是否开启身份证
      googleValue: '', // 谷歌
      IDValue: '', // 身份证
    };
  },
  watch: {
    loginRegistType(v) {
      if (v) { this.initNowType(); }
    },
    loginFlag(v) { if (v) { this.goHome(); } },
  },
  computed: {
    // 是否展示tab切换
    tabFlag() {
      let flag = false;
      if (this.loginRegistType === '1') {
        flag = true;
      }
      return flag;
    },
    // 开启验证方式
    loginRegistType() {
      // const { publicInfo } = this.$store.state.baseData;
      const str = '1'; // 1 手机/邮箱， 2 仅手机， 3 仅邮箱
      // if (publicInfo && publicInfo.switch && publicInfo.switch.login_regist_type) {
      //   str = publicInfo.switch.login_regist_type.toString();
      // }
      return str;
    },
    tabList() {
      return [
        // 手机号找回
        { name: this.$t('resetPass.phoneReset'), key: 'phone' },
        // 邮箱找回
        { name: this.$t('resetPass.emailReset'), key: 'email' },
      ];
    },
    loginFlag() {
      const { isLogin, userInfoIsReady } = this.$store.state.baseData;
      if (isLogin && userInfoIsReady) {
        return true;
      }
      return false;
    },
    maxLength() {
      let maxLength = '100';
      if (this.nowType === 'phone') {
        maxLength = '30';
      }
      return maxLength;
    },
    regExps() { return this.$store.state.regExp; },
    // userValue 是否复合正则验证
    userFlag() {
      const reg = this.nowType === 'phone' ? this.regExps.phone : this.regExps.email;
      return reg.test(this.userValue);
    },
    // checkValue 是否复合正则验证
    checkFlag() { return this.regExps.verification.test(this.checkValue); },
    // google 是否复合正则验证
    googleFlag() { return this.regExps.verification.test(this.googleValue); },
    // 身份证号 是否复合正则验证
    IDFlag() { return this.regExps.nonEmpty.test(this.IDValue); },
    // passValue 是否复合正则验证
    passFlag() { return this.regExps.passWord.test(this.passValue); },
    // comfirmValue 是否两次密码输入一致
    comfirmFlag() { return this.passValue === this.comfirmValue; },
    // user框是否为错误状态
    userErrorFlag() {
      if (this.userValue.length !== 0 && !this.userFlag) return true;
      return false;
    },
    // 验证框是否为错误
    checkErrorFlag() {
      if (this.checkValue.length !== 0 && !this.checkFlag) return true;
      return false;
    },
    googleErrorFlag() {
      if (this.googleValue.length !== 0 && !this.googleFlag) return true;
      return false;
    },
    IDErrorFlag() {
      if (this.IDValue.length !== 0 && !this.IDFlag) return true;
      return false;
    },
    // pass框是否为错误状态
    passErrorFlag() {
      if (this.passValue.length !== 0 && !this.passFlag) return true;
      return false;
    },
    // comfirm框是否为错误状态
    comfirmErrorFlag() {
      if (this.comfirmValue.length !== 0 && !this.comfirmFlag) return true;
      return false;
    },
    domKeys() {
      if (this.nowType === 'phone') {
        return {
          userKey: 'phone-user',
          verifyKey: 'phone-verify',
          checkKey: 'phone-check',
          passKey: 'phone-pass',
          comfirmKey: 'phone-comfirm',
          googleKey: 'phone-google',
          IDKey: 'phone-ID',
        };
      }
      return {
        userKey: 'email-user',
        verifyKey: 'email-verify',
        checkKey: 'email-check',
        passKey: 'email-pass',
        comfirmKey: 'email-comfirm',
        googleKey: 'email-google',
        IDKey: 'email-ID',
      };
    },
    domTexts() {
      if (this.nowType === 'phone') {
        return {
          userText: this.$t('resetPass.phone'), // 手机号
          userError: this.$t('resetPass.phoneError'), // 手机号输入格式不正确
          codeText: this.$t('resetPass.phoneCode'), // 短信验证码
          codeError: this.$t('resetPass.phoneCodeError'), // 请输入6位数字短信验证码
        };
      }
      return {
        userText: this.$t('resetPass.email'), // 邮箱
        userError: this.$t('resetPass.emailError'), // 邮箱输入格式不正确
        codeText: this.$t('resetPass.emailCode'), // 邮箱验证码
        codeError: this.$t('resetPass.emailCodeError'), // 请输入6位数字邮箱验证码
      };
    },
    submitStatus() {
      // 当前步骤为步骤一时
      let disabled = true;
      let text = '';
      if (this.nowStep === '1') {
        if ((this.verifyFlag && this.userFlag) || this.submitLoading) { disabled = false; }
        text = this.$t('resetPass.next');
      // 第二步
      } else if (this.nowStep === '2') {
        let IDF = true;
        let googleF = true;
        if (this.haveID) { IDF = this.IDFlag; }
        if (this.haveGoogle) { googleF = this.googleFlag; }
        if ((this.checkFlag
          && googleF
          && IDF) || this.submitLoading) { disabled = false; }
        text = this.$t('resetPass.next');
      // 第三步
      } else if (this.nowStep === '3') {
        if ((this.passFlag && this.comfirmFlag) || this.submitLoading) { disabled = false; }
        text = this.$t('resetPass.submit');
      }
      return {
        text,
        disabled, // 是否禁用
      };
    },
    publicInfo() {
      const { publicInfo } = this.$store.state.baseData;
      return publicInfo;
    },
    companyName() {
      if (this.publicInfo && this.publicInfo.msg) {
        return this.publicInfo.msg.company_name;
      }
      return '';
    },
  },
  methods: {
    init() {
      if (this.loginFlag) { this.goHome(); }
      this.$bus.$off('emailCode');
      this.$bus.$on('emailCode', (data) => {
        const newData = JSON.parse(JSON.stringify(data));
        newData.callback = undefined;
        this.axios({
          url: 'v4/common/emailValidCode',
          method: 'post',
          header: {},
          params: newData,
        }).then((info) => {
          data.callback(info);
        }).catch(() => {
        // console.log(info);
        });
      });
      this.$bus.$off('phoneCode');
      this.$bus.$on('phoneCode', (data) => {
        const newData = JSON.parse(JSON.stringify(data));
        newData.callback = undefined;
        this.axios({
          url: 'v4/common/smsValidCode',
          method: 'post',
          header: {},
          params: newData,
        }).then((info) => {
          data.callback(info);
        }).catch(() => {
        // console.log(info);
        });
      });
      if (this.loginRegistType) {
        this.initNowType();
      }
    },
    goUrl(url) { this.$router.push(url); },
    initNowType() {
      if (this.loginRegistType === '3') {
        this.nowType = 'email';
      } else {
        this.nowType = 'phone';
      }
    },
    goHome() { this.$router.push('/'); },
    // 切换找回类型
    setNowType(type) {
      this.nowStep = '1'; // 步骤返回到第一步
      this.nowType = type; // 切换tab
      this.userValue = ''; // 清空userValue
      this.verifyFlag = false; // 滑动验证
      this.verifyObj = {}; // 滑动验证
      this.checkValue = ''; // 短信/邮箱验证
    },
    // input onchanges事件
    inputChanges(value, name) {
      this[name] = value;
    },
    // 滑动验证成功后
    verifyCallBack(parameter) {
      this.verifyObj = parameter;
      this.verifyFlag = true;
    },
    // 获取验证码
    getCodeClick() {
      this.sendCode();
    },
    submit() {
      if (this.nowStep === '1') {
        this.submitStep1();
      } else if (this.nowStep === '2') {
        this.submitStep2();
      } else if (this.nowStep === '3') {
        this.submitStep3();
      }
    },
    // 第一步提交
    submitStep1() {
      const key = this.nowType === 'phone' ? 'mobileNumber' : 'email';
      this.submitLoading = true;
      this.axios({
        url: 'v4/user/reset_password_step_one',
        params: {
          ...this.verifyObj,
          nc: undefined,
          [key]: this.userValue,
        },
      }).then((data) => {
        if (this.verifyObj.nc) { this.verifyObj.nc.reset(); }
        this.verifyFlag = false;
        this.verifyObj = {};
        this.submitLoading = false;
        if (data.code.toString() === '0') {
          const { token, isCertificateNumber, isGoogleAuth } = data.data;
          this.token = token;
          if (isCertificateNumber && isCertificateNumber.toString() === '1') {
            this.haveID = true; // 是否开启谷歌身份证
          }
          if (isGoogleAuth && isGoogleAuth.toString() === '1') {
            this.haveGoogle = true; // 是否开启谷歌
          }
          this.nowStep = '2';
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 第二步提交
    submitStep2() {
      const key = this.nowType === 'phone' ? 'smsCode' : 'emailCode';
      this.submitLoading = true;
      this.axios({
        url: 'v4/user/reset_password_step_two',
        params: {
          [key]: this.checkValue,
          token: this.token,
          googleCode: this.googleValue,
          certifcateNumber: this.IDValue,
        },
      }).then((data) => {
        this.submitLoading = false;
        if (data.code.toString() === '0') {
          this.nowStep = '3';
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 第三步提交
    submitStep3() {
      this.submitLoading = true;
      this.axios({
        url: '/user/reset_password_step_three',
        params: {
          loginPword: this.passValue, // 密码
          token: this.token, // token
        },
      }).then((data) => {
        this.submitLoading = false;
        if (data.code.toString() === '0') {
          // 重置密码成功，请您登录
          this.$bus.$emit('tip', { text: this.$t('resetPass.resetSuccess'), type: 'success' });
          this.$router.push('/login');
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 发送短信/邮箱
    sendCode() {
      if (this.nowType === 'phone') {
        this.$bus.$emit('phoneCode', {
          token: this.token, // token
          operationType: '24', // 模版
          callback: (data) => {
            if (data.code.toString() !== '0') {
              // 倒计时重置
              this.$bus.$emit('getCode-clear', 'resetPassGetcode');
              // tip框提示错误
              this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            } else {
              // 短信已发送，请注意查收
              this.$bus.$emit('tip', { text: this.$t('resetPass.phoneSendSuccess'), type: 'success' });
            }
          },
        });
      } else if (this.nowType === 'email') {
        this.$bus.$emit('emailCode', {
          token: this.token, // token
          operationType: '3',
          callback: (data) => {
            if (data.code.toString() !== '0') {
              // 倒计时重置
              this.$bus.$emit('getCode-clear', 'resetPassGetcode');
              // tip框提示错误
              this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            } else {
              // 邮件已发送，请注意查收
              this.$bus.$emit('tip', { text: this.$t('resetPass.emailSendSuccess'), type: 'success' });
            }
          },
        });
      }
    },
  },
};
