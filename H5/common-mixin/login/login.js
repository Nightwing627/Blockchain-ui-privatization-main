import { setCookie } from '@/utils';

export default {
  name: 'page-login',
  data() {
    return {
      userValue: '', // 账号value
      passValue: '', // 密码value
      checkValue: '', // 验证码value
      checkType: '0', // 验证码类型( '1'-谷歌 '2'-手机 '3'-邮箱 )
      verifyObj: {}, // 滑动返回对象
      verifyFlag: false, // 滑动是否通过
      dialogFlag: false, // 弹窗flag
      submitLoading: false, // input框
      userToken: null, // 服务端第一次校验返回
      dialogConfirmLoading: false, // 用于弹窗按钮loading效果
      selectValue: 'google',
    };
  },
  watch: {
    checkValue(newV) {
      if (newV.length === 6) {
        this.$nextTick(() => {
          this.$bus.$emit('button-click', 'dialogConfirm');
        });
      }
    },
    loginFlag(v) { if (v) { this.goHome(); } },
  },
  computed: {
    // user框 PromptText
    userInputPrompt() {
      let str = '';
      switch (this.loginRegistType) {
        case '1':
          str = this.$t('login.phoneOrEmail');
          break;
        case '2':
          str = this.$t('login.phone');
          break;
        case '3':
          str = this.$t('login.email');
          break;
        default:
          str = this.$t('login.phoneOrEmail');
      }
      return str;
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
    selectOptions() {
      const arr = [{ value: this.$t('login.GoogleAuthenticator'), code: 'google' }];
      if (this.loginRegistType === '2') {
        arr.push({ value: this.$t('login.MobilePhoneVerification'), code: 'phone' });
      } else if (this.loginRegistType === '3') {
        arr.push({ value: this.$t('login.MailboxValidation'), code: 'email' });
      } else {
        arr.push({ value: this.$t('login.MobilePhoneVerification'), code: 'phone' });
        arr.push({ value: this.$t('login.MailboxValidation'), code: 'email' });
      }
      return arr;
    },
    loginFlag() {
      const { isLogin, userInfoIsReady } = this.$store.state.baseData;
      if (isLogin && userInfoIsReady) {
        return true;
      }
      return false;
    },
    checkText() {
      switch (this.checkType) {
        case '1':
          // 请输入6位数字谷歌验证码
          return this.$t('login.googleCodeError');
        case '2':
          // 请输入6位数字手机验证码
          return this.$t('login.phoneCodeError');
        case '3':
          // 请输入6位数字邮箱验证码
          return this.$t('login.emailCodeError');
        default:
          // 请输入6位数字验证码
          return this.$t('login.codeError');
      }
    },
    serverName() {
      const { publicInfo } = this.$store.state.baseData;
      let code = '';
      if (publicInfo && publicInfo.msg && publicInfo.msg.company_name) {
        code = publicInfo.msg.company_name;
      }
      return code;
    },
    // userValue 是否复合正则验证
    userFlag() {
      const { phone, email } = this.$store.state.regExp;
      if (this.loginRegistType === '2') {
        if (phone.test(this.userValue)) { return true; }
      } else if (this.loginRegistType === '3') {
        if (email.test(this.userValue)) { return true; }
      } else {
        if (phone.test(this.userValue)) { return true; }
        if (email.test(this.userValue)) { return true; }
      }
      return false;
    },
    // passValue 是否复合正则验证
    passFlag() { return this.$store.state.regExp.passWord.test(this.passValue); },
    // checkValue 是否复合正则验证
    checkFlag() { return this.$store.state.regExp.verification.test(this.checkValue); },
    // 二次验证弹层 text展示文字 havacode是否有获取验证码
    checkOptions() {
      switch (this.checkType) {
        case '1':
          // 谷歌验证码
          return { text: this.$t('login.googleCode'), haveCode: false };
        case '2':
          // 手机验证码
          return { text: this.$t('login.phoneCode'), haveCode: true };
        case '3':
          // 邮箱验证码
          return { text: this.$t('login.emailCode'), haveCode: true };
        default:
          // 验证码
          return { text: this.$t('login.code'), haveCode: false };
      }
    },
    // user框是否为错误状态
    userErrorFlag() {
      if (this.userValue.length !== 0 && !this.userFlag) return true;
      return false;
    },
    // pass框是否为错误状态
    passErrorFlag() {
      if (this.passValue.length !== 0 && !this.passFlag) return true;
      return false;
    },
    // 验证框是否为错误
    checkErrorFlag() {
      if (this.checkValue.length !== 0 && !this.checkFlag) return true;
      return false;
    },
    // 登录button 禁用状态
    submitDisabled() {
      const {
        userFlag, passFlag, verifyFlag, submitLoading,
      } = this;
      if ((userFlag && passFlag && verifyFlag) || submitLoading) {
        return false;
      }
      return true;
    },
    dialogConfirmDisabled() {
      if (!this.checkFlag && !this.dialogConfirmLoading) return true;
      return false;
    },
    // 是否开启验证方式
    openLoginVerificationMode() {
      // const { publicInfo } = this.$store.state.baseData;
      // if (publicInfo && publicInfo.switch
      // && publicInfo.switch.openLoginVerificationMode === '1') {
      //   return true;
      // }
      return false;
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
    },
    goUrl(url) { this.$router.push(url); },
    goHome() { this.$router.push('/'); },
    // input onchanges事件
    inputChanges(value, name) {
      this[name] = value;
    },
    selectChange(item) {
      this.selectValue = item.code;
    },
    submit() {
      const params = {
        ...this.verifyObj,
        ...{
          mobileNumber: this.userValue,
          loginPword: this.passValue,
          nc: null,
          // type: this.selectValue,
        },
      };
      this.submitLoading = true;
      this.axios({
        url: 'user/login_in',
        headers: {},
        params,
        method: 'post',
      }).then((data) => {
        this.verifyObj.nc.reset(); // 滑动重置
        this.verifyFlag = false; // 验证通过置未未通过
        this.submitLoading = false; // button按钮loading取消
        if (data.code.toString() === '0') {
          this.dialogFlag = true; // 打开弹窗
          this.checkType = data.data.type; // '1'-谷歌 '2'-手机 '3'-邮箱
          this.userToken = data.data.token;
          this.$nextTick(() => {
            // 验证码input获取焦点
            this.$bus.$emit('inputLine-focus', 'checkValue');
            // 触发发送验证码button
            this.$bus.$emit('button-click', 'loginGetcodeBtn');
          });
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 极验滑动通过
    verifyCallBack(parameter) {
      this.verifyObj = parameter;
      this.verifyFlag = true;
    },
    // 二次校验
    dialogConfirm() {
      this.dialogConfirmLoading = true;
      this.axios({
        url: 'user/confirm_login',
        method: 'post',
        params: {
          token: this.userToken,
          authCode: this.checkValue,
          type: this.selectValue,
        },
      }).then((data) => {
        this.dialogConfirmLoading = false;
        if (data.code.toString() === '0') {
          this.dialogClose(); // 关闭弹窗
          setCookie('token', this.userToken); // 存储cookie
          // 登录成功
          this.$bus.$emit('tip', { text: this.$t('login.loginSuccess'), type: 'success' });
          // 获取 userinfo
          this.$store.dispatch('getUserInfo');
          this.$router.push('/');
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 关闭弹窗
    dialogClose() {
      this.dialogFlag = false;
      this.checkValue = '';
    },
    // 发送验证码组件点击button
    getCodeClick() {
      this.sendCode();
    },
    // 发送验证码
    sendCode() {
      if (this.checkType === '2') {
        this.$bus.$emit('phoneCode', {
          token: this.userToken,
          operationType: '25',
          callback: (data) => {
            if (data.code.toString() !== '0') {
              // 倒计时重置
              this.$bus.$emit('getCode-clear', 'loginGetcode');
              // tip框提示错误
              this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            } else {
              // 短信已发送，请注意查收
              this.$bus.$emit('tip', { text: this.$t('login.phoneSendSuccess'), type: 'success' });
            }
          },
        });
      } else if (this.checkType === '3') {
        this.$bus.$emit('emailCode', {
          token: this.userToken,
          operationType: '4',
          callback: (data) => {
            if (data.code.toString() !== '0') {
              // 倒计时重置
              this.$bus.$emit('getCode-clear', 'loginGetcode');
              // tip框提示错误
              this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            } else {
              // 邮件已发送，请注意查收
              this.$bus.$emit('tip', { text: this.$t('login.emailSendSuccess'), type: 'success' });
            }
          },
        });
      }
    },
  },
};
