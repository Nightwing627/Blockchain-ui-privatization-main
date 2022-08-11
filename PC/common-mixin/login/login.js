import {
  myStorage,
  setCookie,
  imgMap,
  colorMap,
} from '@/utils';

export default {
  name: 'page-login',
  data() {
    return {
      imgMap,
      colorMap,
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
      addHoverclass: 0,
      singPassDialogFlag: false,
      thirdListShow: false,
      loginMode: null,
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
    // 第三方登录信息
    thirdPartyLoginData(data) {
      if (data !== null) {
        this.loading = false;
        if (data.text === 'success') {
          // 打开 singPass 弹框
          this.singPassDialogFlag = true;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      }
    },
  },
  computed: {
    // 登录按钮文案
    loginButtonText() {
      if (this.loginMode === 'SingPass') {
        return this.$t('singPassLogin.mainText13'); // '登录并关联SingPass账号';
      }
      if (this.singPassCode && this.singpassState && this.singpassSource === 'reg') {
        return this.$t('singPassLogin.mainText13'); // '登录并关联SingPass账号';
      }
      return this.$t('login.login');
    },
    loginPageTitle() {
      if (this.loginMode === 'SingPass') {
        return this.$t('singPassLogin.mainText2'); // 'SingPass第三方登录';
      }
      if (this.singPassCode && this.singpassState && this.singpassSource === 'reg') {
        return this.$t('singPassLogin.mainText2'); // 'SingPass第三方登录';
      }
      return this.$t('login.WelcomeToLogin');
    },
    // user框 PromptText
    isInternationTem() {
      return this.$store.state.baseData.templateLayoutType === '2';
    },
    userInputPrompt() {
      let str = '';
      switch (this.loginRegistType) {
        case '1':
          str = this.$t('login.phoneOrEmail');
          break;
        case '2':
          str = this.$t('resetPass.phone');
          break;
        case '3':
          str = this.$t('resetPass.email');
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
    thirdList() {
      if (this.publicInfo && this.publicInfo.thirdInfo && this.publicInfo.thirdInfo.length > 0) {
        const arr = [];
        this.publicInfo.thirdInfo.forEach((item) => {
          arr.push({
            value: item.name,
            img: item.logoAddress,
            code: item.pcThirdUrl,
            sort: item.sort,
            pcJump: item.pcJump,
          });
        });
        const newArr = this.sortKey(arr, 'sort');
        return newArr;
      }
      return null;
    },
    thirdPartyLoginData() {
      return this.$store.state.baseData.thirdPartyLoginData;
    },
    singPassCode() {
      return this.$route.query.code;
    },
    singpassState() {
      return this.$route.query.state;
    },
    singpassSource() {
      return this.$route.query.source;
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
      this.$bus.$on('closeSingPassDialog', () => {
        this.singPassDialogFlag = false;
      });
      this.$bus.$on('setLoginMode', (info) => {
        this.loginMode = info;
      });
    },
    sortKey(array, key) {
      return array.sort((a, b) => {
        const x = a[key];
        const y = b[key];
        return (x - y); // 从小到大排序
      });
    },
    changeThird(item) {
      if (item.pcJump === '1') {
        window.open(item.code, '_blank');
      }
    },
    addHover(num) {
      this.addHoverclass = num;
      this.thirdListShow = true;
    },
    removeHover() {
      this.addHoverclass = null;
      // setTimeout(() => {
      //   this.thirdListShow = false;
      // });
    },
    goUrl(url) {
      // 如果是第三方登录 跳转到注册也是第三方注册
      if (url === '/register' && this.singPassCode && this.singpassState) {
        this.$router.push(`${url}?singPassCode=${this.singPassCode}&singPassState=${this.singpassState}`);
      } else {
        this.$router.push(url);
      }
    },
    goHome() { window.location.href = '/'; },
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
      const params = {
        token: this.userToken,
        authCode: this.checkValue,
        type: this.selectValue,
      };
      // 判断是否是 第三方 登录
      if (this.singPassCode && this.singpassState) {
        params.singPassCode = this.singPassCode;
      }
      this.axios({
        url: 'user/confirm_login',
        method: 'post',
        params,
      }).then((data) => {
        this.dialogConfirmLoading = false;
        if (data.code.toString() === '0') {
          this.dialogClose(); // 关闭弹窗
          setCookie('token', this.userToken); // 存储cookie
          // 登录成功
          this.$bus.$emit('tip', { text: this.$t('login.loginSuccess'), type: 'success' });
          // 获取 userinfo
          this.$store.dispatch('getUserInfo');
          this.getMySymbol();
          window.location.href = '/';
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
    // 获取服务端自选币对
    getMySymbol() {
      this.axios({
        url: 'optional/list_symbol',
        params: {},
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          const storageMySymbol = myStorage.get('mySymbol') || [];
          const webMySymbol = data.data.symbols.filter((x) => x !== '') || [];
          const sumMySymbolList = Array.from(new Set([...storageMySymbol, ...webMySymbol]));
          const diffMySymbolList = storageMySymbol.filter((x) => !webMySymbol.includes(x));
          // 同步本地自选币对和服务端币对
          // sync_status 0需要同步 1不需要同步
          if (diffMySymbolList.length !== 0 && data.data.sync_status === '0') {
            myStorage.set('mySymbol', sumMySymbolList);
            this.axios({
              url: this.$store.state.url.common.optional_symbol,
              headers: {},
              params: {
                operationType: diffMySymbolList.length > '1' ? '0' : '1', // 0批量添加 1单个添加 2单个删除
                symbols: diffMySymbolList.join(','),
              },
              method: 'post',
            }).then(() => {});
          } else {
            myStorage.set('mySymbol', webMySymbol);
          }
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 点击第三方登录
    goThirdUrl(data) {
      // 直接跳转至第三方
      if (data.pcJump === '1') {
        window.open(data.code, '_blank');
      } else {
        // 请求第三方登录信息
        this.$store.dispatch('thirdPartyLoginData', {
          url: data.code,
          data: {},
        });
      }
    },
  },
};
