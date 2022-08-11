import { colorMap, callApp, setCookie } from '@/utils';

export default {
  name: 'app',
  data() {
    return {
      timer: null, // 轮询获取消息接口timer
      pageTopTitle: null, // header中间的头部
    };
  },
  computed: {
    isCoOpen() {
      const base = this.$store.state.baseData.publicInfo;
      if (base && base.switch && base.switch.indep_co_switch === '1') {
        return true;
      }
      return false;
    },
    limitCountryAndPhoneCode() {
      return {
        phoneCode: this.$t('phoneCode'),
        limitCountryList: this.$store.state.baseData.limitCountryList,
      };
    },
    limitCountryList() {
      return this.$store.state.baseData.limitCountryList;
    },
    haveMarginTop() {
      let flag = true;
      if (this.isApp && !this.appShowPage) {
        flag = false;
      }
      return flag;
    },
    appShowPage() {
      let flag = false;
      if (this.routeMeta.pageTitle === 'select') {
        flag = true;
      }
      return flag;
    },
    isApp() {
      return this.$store.state.baseData.isApp;
    },
    // 当前路由meta
    routeMeta() {
      return this.$route.meta;
    },
    // 当前路由是否需要登录
    mustLogin() {
      return this.$route.meta.mustLogin;
    },
    // public_info数据
    publicInfo() {
      return this.$store.state.baseData.publicInfo || {};
    },
    // 服务端返回url集合
    url() {
      return this.publicInfo.url || {};
    },
    // 用户是否登录 1-未登录  2-登录
    loginFlag() {
      const { isLogin, userInfoIsReady } = this.$store.state.baseData;
      if (!isLogin && userInfoIsReady) {
        return '1';
      }
      return '2';
    },
  },
  watch: {
    limitCountryAndPhoneCode: {
      handler(val) {
        const phoneCodeGlobal = val.phoneCode;
        const { limitCountryList } = val;

        if (phoneCodeGlobal.A.length) {
          if (limitCountryList.length) {
            Object.keys(phoneCodeGlobal).forEach((item) => {
              phoneCodeGlobal[item] = phoneCodeGlobal[item].filter((vitem) => {
                const valueArr = vitem.split('+');
                return limitCountryList.indexOf(valueArr[2]) === -1;
              });
            });
          }

          this.$store.dispatch('setPhoneCodeGlobal', phoneCodeGlobal);
        }
      },
      immediate: true,
    },
    routeMeta: {
      handler(val) {
        if (val.isCoOpen && this.isCoOpen) {
          this.$router.push('/appDownload');
        }
      },
      // 深度观察监听
      deep: true,
    },
    mustLogin(newMeta) {
      setTimeout(() => {
        if (this.loginFlag === '1' && newMeta) {
          this.$router.push('/login');
        }
      }, 500);
    },
    url(url) {
      if (url.mcoUrl) {
        // 获取 合约 co-public-info 数据
        this.$store.dispatch('getCoPublicInfo');
      }
    },
    loginFlag() {
      this.getMessageCount();
    },
    $route(to) {
      if (to.name !== 'serviceLimit') {
        this.getVisitStatus();
      }
    },
  },
  methods: {
    // 区域IP访问限制 0 不限 1 限制
    getVisitStatus() {
      this.axios({
        url: 'limit_ip_login',
      }).then((data) => {
        if (data.code === '109109') {
          window.sessionStorage.setItem('LimitCountryNames', data.msg);
          this.$router.push('serviceLimit');
        }
      });
    },
    coInit() {
      this.appInfo();
      this.$bus.$on('outUserIsLogin', () => {
        // 清除登录状态
        this.$store.dispatch('deleteIsLogin');
        // 如果当前页面需要登录 则跳转到登录
        if (this.$route.meta.mustLogin) {
          this.$router.push('/login');
        }
      });
      this.setStyle();
    },
    createInit(hostType) {
      // ！！！注意： 涉及到初始化的axios请求一定要放在 getOtcCommonData 方法内
      if (window.isApp) {
        this.appInfo(hostType);
      } else {
        // 初始化获取服务端数据
        this.getOtcCommonData();
      }
      // 监听接口未登录状态
      this.outUserIsLogin();
      // 设置公共style
      this.setStyle();
      // 全局dom扩展功能
      this.domOptions();
    },
    appInfo(hostType) {
      callApp({ name: 'exchangeInfo' }).then((data) => {
        this.$store.dispatch('setIsApp', true);
        setCookie('token', data.exchange_token);
        setCookie('lan', data.exchange_lan);
        // if (data.exchange_token) {}
        // if (data.exchange_lan) {}
        if (data.exchange_skin === 'night') {
          setCookie('cusSkin', '1');
        } else {
          setCookie('cusSkin', '2');
        }
        switch (hostType) {
          case 'otc':
            this.getOtcCommonData();
            break;
          case 'co':
            this.getCoCommonData();
            break;
          default:
            this.getCommonData();
        }
      });
    },
    domOptions() {
      const html = document.getElementsByTagName('html')[0];
      const body = document.getElementsByTagName('body')[0];
      this.$bus.$on('htmlScroll', (flag) => {
        let value = 'hidden';
        if (flag) {
          value = 'visible';
        }
        body.style.overflow = value;
        html.style.overflow = value;
      });
    },
    // 轮询请求消息
    getMessageCount() {
      if (this.loginFlag === '2') {
        clearInterval(this.timer);
        this.$store.dispatch('getMessage_count');
        this.timer = setInterval(() => {
          this.$store.dispatch('getMessage_count');
        }, 15000);
      } else {
        clearInterval(this.timer);
      }
    },
    // 初始化 现货 获取服务端数据
    getCommonData() {
      // 获取 public-info 数据
      this.$store.dispatch('getPublicInfo');
      // 获取 userinfo
      this.$store.dispatch('getUserInfo');
      // 获取 APP下载
      this.$store.dispatch('getAppDownload');
      // 获取自定义footer 和 自定义header
      this.$store.dispatch('getFooterHeander_info');
      // 轮询请求消息
      this.getMessageCount();
    },
    getOtcCommonData() {
      this.getCommonData();
      this.$store.dispatch('getOtcPublicInfo');
    },
    getCoCommonData() {
      this.getCommonData();
      this.$store.dispatch('getCoPublicInfo');
    },
    // 监听接口code未登录状态
    outUserIsLogin() {
      this.$bus.$on('outUserIsLogin', () => {
        // 清除登录状态
        this.$store.dispatch('deleteIsLogin');
        // 如果当前页面需要登录 则跳转到登录
        if (this.$route.meta.mustLogin) {
          this.$router.push('/login');
        }
      });
    },
    setStyle() {
      if (colorMap) {
        const str = `
          input::-webkit-input-placeholder {
            color: ${colorMap['b-2-cl']};
          }
          input::-moz-placeholder {
            color: ${colorMap['b-2-cl']};
          }
          input::-moz-placeholder {
            color: ${colorMap['b-2-cl']};
          }
          input::-ms-input-placeholder {
            color: ${colorMap['b-2-cl']};
          }
          #common-AliyunCaptcha .nc_scale {
            background: ${colorMap['a-5-bg']};
          }
          #common-AliyunCaptcha .clickCaptcha {
            background: ${colorMap['a-5-bg']};
          }
          #common-AliyunCaptcha .nc-container .nc_scale .clickCaptcha div {
            background: ${colorMap['a-5-bg']};
          }
          #common-AliyunCaptcha .nc_scale .btn_slide {
            background: ${colorMap['a-4-bg']};
            color: ${colorMap['b-2-cl']};
          }
          #common-AliyunCaptcha .scale_text.scale_text.slidetounlock span[data-nc-lang="_startTEXT"] {
            -webkit-text-fill-color: ${colorMap['b-2-cl']};
          }
          #common-AliyunCaptcha .nc_scale .nc_bg {
            background: ${colorMap['a-5-bg']};
          }
          #common-AliyunCaptcha .nc_scale .scale_text2 {
            color: ${colorMap['b-2-cl']};
            background: ${colorMap['a-5-bg']};
          }
          #common-AliyunCaptcha .nc_scale .btn_ok {
            background: ${colorMap['a-4-bg']};
            color: ${colorMap['b-2-cl']};
          }
          #common-AliyunCaptcha .imgCaptcha {
            background: ${colorMap['a-5-bg']}!important;
          }
          #common-AliyunCaptcha .imgCaptcha_text {
            background: ${colorMap['a-5-bg']}!important;
            border-bottom-color: ${colorMap['b-1-bd']}!important;
          }
          #common-AliyunCaptcha .imgCaptcha_text input {
            background: ${colorMap['a-5-bg']}!important;
            color: ${colorMap['b-2-cl']}!important;
          }
          #common-AliyunCaptcha .nc_scale_submit {
            background: ${colorMap['a-12-bg']};
          }
          #common-AliyunCaptcha .icon_close {
            color: ${colorMap['b-6-cl']};
          }
          input:-webkit-autofill , textarea:-webkit-autofill, select:-webkit-autofill {
            -webkit-box-shadow: 0px 0px 0px 1000px ${colorMap['a-7-bg']} inset;
            -webkit-text-fill-color: ${colorMap['b-2-cl']};
          }
        `;
        const nod = document.createElement('style');
        nod.type = 'text/css';
        if (nod.styleSheet) {
          // ie下
          nod.styleSheet.cssText = str;
        } else {
          nod.innerHTML = str; // 或者写成 nod.appendChild(document.createTextNode(str))
        }
        document.getElementsByTagName('head')[0].appendChild(nod);
      }
    },
  },
};
