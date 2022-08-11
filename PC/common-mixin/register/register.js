import {
  getCookie, setCookie, imgMap, colorMap,
} from '@/utils';
import countryMinix from '../countryList/countryList';

export default {
  name: 'page-register',
  mixins: [countryMinix],
  data() {
    return {
      imgMap,
      colorMap,
      nowType: 'phone', // phone--手机注册  email--邮箱注册
      userValue: '', // user框 (手机号/邮箱）
      checkValue: '', // 验证码框
      passValue: '', // 密码框
      comfirmValue: '', // 确认密码框
      invitedValue: '', // 邀请码
      verifyObj: {}, // 滑动返回对象
      verifyFlag: false, // 滑动是否通过
      textFlag: false, // 服务条款是否通过
      textFlag2: false, // 服务条款是否通过
      textFlag3: false, // 服务条款是否通过
      submitLoading: false, // 提交按钮loading
      getCodeHaving: false, // 验证码倒计时中（true为倒计时中）
      getCodeMustCountry: false, // 用于获取验证码时 打开所在地的错误
      getCodeMustUser: false, // 用于获取验证码时 user的错误
      error10003: false,
      dialogFlag: false, // 弹窗
      haveOption: false, // 弹窗 极验/发送验证码
      dialogConfirmLoading: false,
      token: null,
      urlHasinvitedCode: false,
      lan: getCookie('lan'),
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
    loginFlag(v) {
      if (v) {
        this.goHome();
      }
    },
    loginRegistType(v) {
      if (v) {
        this.initNowType();
      }
    },
    // nowUserRegType: {
    //   immediate: true,
    //   handler(v) {
    //     if (v[0] === 1) {
    //       this.nowType = 'phone';
    //     } else {
    //       this.nowType = 'email';
    //     }
    //   },
    // },
  },
  beforeMount() {
    if (this.$route.query.inviteCode) {
      this.invitedValue = this.$route.query.inviteCode;
      this.urlHasinvitedCode = true;
    }

    if (this.$route.query.email) {
      this.userValue = this.$route.query.email;
      this.nowType = 'email';
    }
    if (this.$route.query.phone) {
      this.userValue = this.$route.query.phone;
      this.nowType = 'phone';
    }
  },
  computed: {
    // userRegType() {
    //   const { publicInfo } = this.$store.state.baseData;
    //   let str = '{}';
    //   if (publicInfo) {
    //     if (publicInfo.switch && publicInfo.switch.user_reg_type) {
    //       str = publicInfo.switch.user_reg_type;
    //     }
    //   }
    //   return JSON.parse(str);
    // },
    // nowUserRegType() {
    //   const lan = getCookie('lan');
    //   let arr = [1, 2];
    //   if (this.userRegType[lan]) {
    //     arr = this.userRegType[lan];
    //   }
    //   return arr;
    // },
    templateType() {
      return this.$store.state.baseData.templateLayoutType;
    },
    isInternationTem() {
      return this.$store.state.baseData.templateLayoutType === '2';
    },
    dialogConfirmDisabled() {
      if (!this.checkFlag && !this.dialogConfirmLoading) return true;
      return false;
    },
    coinsKrwOpen() {
      const { publicInfo } = this.$store.state.baseData;
      let str = '';
      if (publicInfo) {
        if (publicInfo.switch && publicInfo.switch.register_cms_style) {
          str = publicInfo.switch.register_cms_style.toString();
        } else {
          str = '0';
        }
      }
      return str;
    },
    // 是否展示tab切换
    tabFlag() {
      let flag = false;
      // if (this.nowUserRegType.length !== 1) {
      if (this.loginRegistType === '1') {
        flag = true;
      }
      return flag;
    },
    // 开启验证方式
    loginRegistType() {
      const { publicInfo } = this.$store.state.baseData;
      let str = '1'; // 1 手机/邮箱， 2 仅手机， 3 仅邮箱
      if (
        publicInfo
        && publicInfo.switch
        && publicInfo.switch.login_regist_type
      ) {
        str = publicInfo.switch.login_regist_type.toString();
      }
      return str;
    },
    publicInfo() {
      const { publicInfo } = this.$store.state.baseData;
      return publicInfo;
    },
    tabList() {
      let list = [
        // 手机号注册
        { name: this.$t('register.phoneRegister'), key: 'phone' },
        // 邮箱注册
        { name: this.$t('register.emailRegister'), key: 'email' },
      ];
      if (this.lan === 'zh_CN' || this.lan === 'el_GR') {
        // }
        // if (this.nowUserRegType[0] === 2) {
        list = [
          // 邮箱注册
          { name: this.$t('register.emailRegister'), key: 'email' },
          // 手机号注册
          { name: this.$t('register.phoneRegister'), key: 'phone' },
        ];
      }
      return list;
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
    // 运营商名称
    serverName() {
      const { publicInfo } = this.$store.state.baseData;
      let code = '';
      if (publicInfo && publicInfo.msg && publicInfo.msg.company_name) {
        code = publicInfo.msg.company_name;
      }
      return code;
    },
    // 邀请码必填
    mustInvited() {
      const { publicInfo } = this.$store.state.baseData;
      let must = '0';
      if (
        publicInfo
        && publicInfo.switch
        && publicInfo.switch.is_invitationCode_required === '1'
      ) {
        must = '1';
      }
      return must;
    },
    // 是否开启滑动验证
    mustVerify() {
      const { publicInfo } = this.$store.state.baseData;
      if (this.error10003) {
        return true;
      }
      if (
        publicInfo
        && publicInfo.switch
        && publicInfo.switch.regist_must_check_open === '1'
      ) {
        return true;
      }
      return false;
    },
    // 所在地验证框
    countryFlag() {
      if (this.nowType === 'phone') {
        return this.country.length;
      }
      return true;
    },
    regExps() {
      return this.$store.state.regExp;
    },
    // userValue 是否复合正则验证
    userFlag() {
      const reg = this.nowType === 'phone' ? this.regExps.phone : this.regExps.email;
      return reg.test(this.userValue);
    },
    // checkValue 是否复合正则验证
    checkFlag() {
      return this.regExps.verification.test(this.checkValue);
    },
    // passValue 是否复合正则验证
    passFlag() {
      return this.regExps.passWord.test(this.passValue);
    },
    // comfirmValue 是否两次密码输入一致
    comfirmFlag() {
      return this.passValue === this.comfirmValue;
    },
    // invitedValue 是否复合正则验证
    invitedFlag() {
      if (this.mustInvited === '0') {
        return true;
      }
      return this.regExps.nonEmpty.test(this.invitedValue);
    },
    //
    countryErrorFlag() {
      if (this.getCodeMustCountry) {
        if (!this.countryFlag) {
          return true;
        }
      }
      return false;
    },
    // user框是否为错误状态
    userErrorFlag() {
      if (this.getCodeMustUser) {
        if (!this.userFlag) return true;
      } else if (this.userValue.length !== 0 && !this.userFlag) return true;
      return false;
    },
    // 验证框是否为错误
    checkErrorFlag() {
      if (this.checkValue.length !== 0 && !this.checkFlag) return true;
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
    // 验证码框是否为错误状态
    invitedErrorFlag() {
      if (this.invitedValue.length !== 0 && !this.invitedFlag) return true;
      return false;
    },
    // 是否展示获取验证码
    isShowGetCode() {
      // 如果强制开启滑动验证
      if (this.mustVerify) {
        // 滑动验证通过 或者 正在倒计时中
        if (this.verifyFlag || this.getCodeHaving) {
          return true;
        }
        return false;
      }
      return true;
    },
    // 登录button 禁用状态
    submitDisabled() {
      const {
        countryFlag,
        userFlag,
        passFlag,
        comfirmFlag,
        invitedFlag,
        textFlag,
        textFlag2,
        submitLoading,
      } = this;
      let cms = textFlag;
      if (this.coinsKrwOpen === '1') {
        cms = textFlag && textFlag2;
      }
      if (
        (countryFlag
          && userFlag
          // && checkFlag
          && passFlag
          && comfirmFlag
          && invitedFlag
          && cms)
        || submitLoading
      ) {
        return false;
      }
      return true;
    },
    domKeys() {
      if (this.nowType === 'phone') {
        return {
          userKey: 'phone-user',
          verifyKey: 'phone-verify',
          checkKey: 'phone-check',
          passKey: 'phone-pass',
          comfirmKey: 'phone-comfirm',
          invitedKey: 'phone-invited',
        };
      }
      return {
        userKey: 'email-user',
        verifyKey: 'email-verify',
        checkKey: 'email-check',
        passKey: 'email-pass',
        comfirmKey: 'email-comfirm',
        invitedKey: 'email-invited',
      };
    },
    // 用户框和验证码框 文案和错误文案
    domTexts() {
      if (this.nowType === 'phone') {
        return {
          userText: this.$t('register.phone'), // 手机号
          userError: this.$t('register.phoneError'), // 手机号输入格式不正确
          codeText: this.$t('register.phoneCode'), // 短信验证码
          codeError: this.$t('register.phoneCodeError'), // 请输入6位数字短信验证码
        };
      }
      return {
        userText: this.$t('register.email'), // 邮箱
        userError: this.$t('register.emailError'), // 邮箱输入格式不正确
        codeText: this.$t('register.emailCode'), // 邮箱验证码
        codeError: this.$t('register.emailCodeError'), // 请输入6位数字邮箱验证码
      };
    },
    // 邀请码
    invitedText() {
      if (this.mustInvited === '0') {
        return this.$t('register.InvitationCodeOptional'); // '邀请码(选填)
      }
      return this.$t('register.InvitationCodeIsRequired'); // 邀请码
    },
    companyName() {
      if (this.publicInfo && this.publicInfo.msg) {
        return this.publicInfo.msg.company_name;
      }
      return '';
    },
    singPassCode() {
      return this.$route.query.singPassCode;
    },
    singpassState() {
      return this.$route.query.singPassState;
    },
    submitButtonText() {
      if (this.singPassCode && this.singpassState) {
        return this.$t('singPassLogin.mainText14');
      }
      return this.$t('register.register');
    },
    registerPageTitle() {
      if (this.singPassCode && this.singpassState) {
        return this.$t('singPassLogin.mainText15');
      }
      return this.$t('register.WelcomeToRegister');
    },
    // 默认手机号
    defaultCountryCode() {
      let { defaultCountryCode } = this.$store.state.baseData;
      const { defaultCountryCodeReal } = this.$store.state.baseData;
      const { limitCountryList } = this;
      if (limitCountryList.length > 0 && defaultCountryCode) {
        const countryList = limitCountryList;
        // const countryCode = defaultCountryCode.replace('+', '');
        const countryCodeReal = defaultCountryCodeReal.replace('+', '');
        if (countryList.indexOf(countryCodeReal) > -1) {
          defaultCountryCode = this.registerCountryList[0].keyCode;
        }
      }
      return defaultCountryCode;
    },
    // 默认国家码
    defaultCountryCodeReal() {
      let { defaultCountryCodeReal } = this.$store.state.baseData;
      const { limitCountryList } = this;
      if (limitCountryList.length > 0) {
        const countryList = limitCountryList;
        const countryCode = defaultCountryCodeReal.replace(/\+/g, '');
        if (countryList.indexOf(countryCode) > -1) {
          defaultCountryCodeReal = '';
        }
      }
      return defaultCountryCodeReal;
    },
  },
  methods: {
    init() {
      if (this.loginFlag) {
        this.goHome();
      }
      this.$bus.$off('emailCode');
      this.$bus.$on('emailCode', (data) => {
        const newData = JSON.parse(JSON.stringify(data));
        newData.callback = undefined;
        this.axios({
          url: 'v4/common/emailValidCode',
          method: 'post',
          header: {},
          params: newData,
        })
          .then((info) => {
            data.callback(info);
          })
          .catch(() => {});
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
        })
          .then((info) => {
            data.callback(info);
          })
          .catch(() => {
            // console.log(info);
          });
      });
      if (this.loginRegistType) {
        this.initNowType();
      }
    },
    dialogClose() {
      this.dialogFlag = false;
      this.checkValue = '';
      this.haveOption = false;
    },
    dialogConfirm() {
      this.dialogConfirmLoading = true;
      if (this.nowType === 'phone') {
        const params = {
          smsCode: this.checkValue, // 验证码
          token: this.token,
        };
        // 判断是否关联第三方登录账号
        if (this.singPassCode && this.singpassState) {
          params.singPassCode = this.singPassCode;
        }
        this.axios({
          // url: 'v4/user/reg_mobile',
          url: '/user/reg_mobile_confirm',
          params,
          headers: {},
          method: 'post',
        }).then((data) => {
          this.dialogConfirmLoading = false;
          if (data.code.toString() === '0') {
            if (window.location.search.indexOf('return') !== -1) {
              const returnURL = window.location.search.substring(8);
              window.location.href = unescape(returnURL);
            } else if (data.data) {
              const { token } = data.data;
              if (token) {
                // this.$router.push('/login');
                // 登录成功，已登录
                this.$bus.$emit('tip', {
                  text: this.$t('register.registerSuccessQLogin'),
                  type: 'success',
                });
                setCookie('token', token); // 存储cookie
                // 获取 userinfo
                this.$store.dispatch('getUserInfo');
                this.$router.push('/');
              } else {
                // 注册成功, 请登录
                this.$bus.$emit('tip', {
                  text: this.$t('register.registerSuccess'),
                  type: 'success',
                });
                this.$router.push('/login');
              }
            } else {
              // 注册成功, 请登录
              this.$bus.$emit('tip', {
                text: this.$t('register.registerSuccess'),
                type: 'success',
              });
              this.$router.push('/login');
            }
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      } else {
        const params = {
          emailCode: this.checkValue, // 验证码
          token: this.token,
        };
        // 判断是否关联第三方登录账号
        if (this.singPassCode && this.singpassState) {
          params.singPassCode = this.singPassCode;
        }
        this.axios({
          // url: 'v4/user/reg_mobile',
          url: '/user/reg_email_confirm',
          params,
          headers: {},
          method: 'post',
        }).then((data) => {
          this.dialogConfirmLoading = false;
          if (data.code.toString() === '0') {
            // 注册成功, 已登录
            if (window.location.search.indexOf('return') !== -1) {
              const returnURL = window.location.search.substring(8);
              window.location.href = unescape(returnURL);
            } else if (data.data) {
              const { token } = data.data;
              if (token) {
                this.$bus.$emit('tip', {
                  text: this.$t('register.registerSuccessQLogin'),
                  type: 'success',
                });
                setCookie('token', token);
                this.$store.dispatch('getUserInfo');
                this.$router.push('/');
              } else {
                this.$bus.$emit('tip', {
                  text: this.$t('register.registerSuccess'),
                  type: 'success',
                });
                this.$router.push('/login');
              }
            } else {
              this.$bus.$emit('tip', {
                text: this.$t('register.registerSuccess'),
                type: 'success',
              });
              this.$router.push('/login');
            }
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      }
    },
    buttonClick() {
      this.dialogFlag = true;
    },
    initNowType() {
      if (this.loginRegistType === '3') {
        this.nowType = 'email';
      } else {
        this.nowType = 'phone';
      }
      // if (this.lan === 'zh_CN' || this.lan === 'el_GR') {
      //   this.nowType = 'phone';
      // } else {
      //   this.nowType = 'email';
      // }
    },
    goUrl(url) {
      // 如果是第三方注册 跳转到登录也是第三方登录
      if (url === '/login' && this.singPassCode && this.singpassState) {
        this.$router.push(
          `${url}?code=${this.singPassCode}&state=${this.singpassState}&source=reg`,
        );
      } else {
        this.$router.push(url);
      }
    },
    goHome() {
      this.$router.push('/');
    },
    // tab切换
    setNowType(type) {
      if (this.submitLoading) {
        return;
      } // 如果正在提交禁止切换
      if (type === this.nowType) {
        return;
      }
      if (this.verifyObj.nc) {
        this.verifyObj.nc.reset();
      }
      this.country = this.defaultCountryCodeReal
        ? this.defaultCountryCodeReal
        : this.countryMap[this.defaultCountryCode].code; // 所在地
      this.countryKeyCode = this.defaultCountryCode
        ? this.defaultCountryCode
        : ''; // 所在地
      this.userValue = ''; // user框 (手机号/邮箱）
      this.checkValue = ''; // 验证码框
      this.passValue = ''; // 密码框
      this.comfirmValue = ''; // 确认密码框
      this.invitedValue = ''; // 清楚邀请码
      this.verifyObj = {}; // 滑动返回对象
      this.verifyFlag = false; // 滑动是否通过
      this.textFlag = false; // 清服务条款
      this.nowType = type;
      this.getCodeHaving = false;
      this.getCodeMustCountry = false; // 获取验证码时 关闭所在地的错误
      this.getCodeMustUser = false; // 获取验证码时 关闭user框的错误
      this.error10003 = false;
      if (this.$route.query.inviteCode) {
        this.invitedValue = this.$route.query.inviteCode;
      }
      if (this.$route.query.email && this.nowType === 'email') {
        this.userValue = this.$route.query.email;
      }
    },
    // input onchanges事件
    inputChanges(value, name) {
      this[name] = value;
    },
    // user框获取焦点
    userFocus() {
      this.getCodeMustUser = false;
    },
    // 手机号所在地框获取焦点
    countryFocus(v) {
      if (v) {
        this.getCodeMustCountry = false;
      }
    },
    // 提交
    submit() {
      // this.submitLoading = true;
      let ajaxUrl = '/user/reg_email_chk_info';
      const objData = {
        ...this.verifyObj, // 滑动验证
        nc: undefined,
        loginPword: this.passValue, // 密码
        newPassword: this.comfirmValue, // 新密码
        invitedCode: this.invitedValue, // 邀请码
      };
      if (this.nowType === 'phone') {
        ajaxUrl = '/user/reg_mobile_chk_info';
        objData.countryCode = this.countryKeyCode; // 国家编号
        objData.mobileNumber = this.userValue; // 手机号
      } else {
        objData.email = this.userValue; // 邮箱
      }
      this.axios({
        // url: 'v4/user/reg_mobile',
        url: ajaxUrl,
        params: objData,
        headers: {},
        method: 'post',
      }).then((data) => {
        // this.submitLoading = false;
        if (data.code.toString() === '0') {
          this.token = data.data.token;
          this.haveOption = true;
          this.$nextTick(() => {
            this.getCodeClick();
          });
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          this.dialogFlag = false;
        }
      });
    },
    // 点击获取验证码
    getCodeClick() {
      // 发送验证码
      this.sendCode();
      // this.verifyObj = {};
      // this.verifyFlag = false;
      // 倒计时开始
      this.$bus.$emit('getCode-start', 'registerGetcode');
      // 获取验证码计时开始
      this.getCodeHaving = true;
    },
    // 倒计时重置
    getCodeClear() {
      // 获取验证码计时结束
      this.getCodeHaving = false;
    },
    // 发送短信/邮箱
    sendCode() {
      if (this.nowType === 'phone') {
        const countryCode = this.countryKeyCode; // 区号
        this.$bus.$emit('phoneCode', {
          token: this.token,
          countryCode, // 区号
          // mobile: this.userValue, // 手机号
          operationType: '1', // 模版
          callback: (data) => {
            if (data.code.toString() === '0') {
              // 短信已发送，请注意查收
              this.$bus.$emit('tip', {
                text: this.$t('register.phoneSendSuccess'),
                type: 'success',
              });
            } else if (data.code.toString() === '10003') {
              if (this.error10003) {
                this.$bus.$emit('tip', { text: data.msg, type: 'error' });
              } else {
                this.error10003 = true;
                // 请滑动安全验证后再获取验证码
                this.$bus.$emit('tip', {
                  text: this.$t('register.scrollCode'),
                  type: 'warning',
                });
              }
              // 倒计时重置
              this.$bus.$emit('getCode-clear', 'registerGetcode');
            } else {
              // 倒计时重置
              this.$bus.$emit('getCode-clear', 'registerGetcode');
              // tip框提示错误
              this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            }
          },
        });
      } else if (this.nowType === 'email') {
        this.$bus.$emit('emailCode', {
          token: this.token,
          // ...this.verifyObj, // 滑动验证
          // nc: undefined,
          // email: this.userValue, // 邮箱
          operationType: '1',
          callback: (data) => {
            if (data.code.toString() === '0') {
              // 邮件已发送，请注意查收
              this.$bus.$emit('tip', {
                text: this.$t('register.emailSendSuccess'),
                type: 'success',
              });
            } else if (data.code.toString() === '10003') {
              if (this.error10003) {
                // tip框提示错误
                this.$bus.$emit('tip', { text: data.msg, type: 'error' });
              } else {
                this.error10003 = true;
                // 请滑动安全验证后再获取验证码
                this.$bus.$emit('tip', {
                  text: this.$t('register.scrollCode'),
                  type: 'warning',
                });
              }
              // 倒计时重置
              this.$bus.$emit('getCode-clear', 'registerGetcode');
            } else {
              // 倒计时重置
              this.$bus.$emit('getCode-clear', 'registerGetcode');
              // tip框提示错误
              this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            }
          },
        });
      }
    },
    // 滑动验证回调
    verifyCallBack(parameter) {
      this.verifyObj = parameter;
      this.verifyFlag = true;
      this.submit();
    },
    // 同意服务条款
    checkoutClick(flag) {
      this.textFlag = flag;
    },
    // 同意服务条款
    checkoutClick2(flag) {
      this.textFlag2 = flag;
    },
    // 同意服务条款
    checkoutClick3(flag) {
      this.textFlag3 = flag;
    },
  },
};
