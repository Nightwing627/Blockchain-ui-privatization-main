import { colorMap, browser } from '@/utils';
import worker from '@/utils/webWorker';

export default {
  name: 'app',
  data() {
    return {
      timer: null,
      hideheade: true,
      hideFooter: true,
      userActivite: false,
      userTime: 0,
      userTimer: null,
      setTimer: null,
      moving: false,
      wsClosed: false,
    };
  },
  mounted() {
    window.onresize = () => {
      this.$bus.$emit('WINFOW_ON_RESIIZE', document.body.clientWidth);
    };
  },
  watch: {
    phoneCode() {
      this.filterPhoneCode(this.limitCountryList);
    },
    limitCountryList: {
      handler(val) {
        this.filterPhoneCode(val);
      },
      immediate: true,
    },
    mustLogin(newMeta) {
      setTimeout(() => {
        if (this.loginFlag === '1' && newMeta) {
          this.$router.push('/login');
        }
      }, 500);
    },
    url(url) {
      if (url) {
        this.goM();
      }
    },
    loginFlag(val) {
      if (val === '2') {
        clearInterval(this.timer);
        this.$store.dispatch('getMessage_count');
        this.timer = setInterval(() => {
          this.$store.dispatch('getMessage_count');
        }, 15000);
      } else {
        clearInterval(this.timer);
      }
    },
    routeMeta(val) {
      // 国际版有些页面不显示导航
      if (this.templateLayoutType === '2' && val.hideHeade) {
        this.hideheade = true;
      } else if (val.hideHeade === 'visitLimit') {
        // 限制区域访问
        this.hideheade = true;
      } else {
        this.hideheade = false;
      }
      // 国际版有些页面不显示footer
      if (this.templateLayoutType === '2' && val.hideFooter !== 'false') {
        this.hideFooter = true;
      } else if (val.hideFooter === 'MandatoryHide') {
        // 限制区域访问
        this.hideFooter = true;
      } else {
        this.hideFooter = false;
      }
    },
    templateLayoutType(val) {
      if (val === '2' && this.routeMeta.hideFooter !== 'false') {
        this.hideFooter = true;
      } else {
        this.hideFooter = false;
      }
    },
    $route(to) {
      if (to.name !== 'serviceLimit') {
        this.getVisitStatus();
      }
    },
  },
  computed: {
    phoneCode() {
      return this.$t('phoneCode');
    },
    limitCountryList() {
      return this.$store.state.baseData.limitCountryList;
    },
    worker() {
      return worker();
    },
    templateLayoutType() {
      return this.$store.state.baseData.templateLayoutType;
    },
    routeMeta() {
      return this.$route.meta;
    },
    navigationType() {
      if (
        this.templateLayoutType === '2'
        && this.$route.meta.navigation !== '1'
      ) {
        return '2';
      }
      return '1';
    },
    routeTheme() {
      return this.$route.meta.theme;
    },
    // 底色 主题背景色
    pageTheme() {
      let layoutClass = 'Chainer';
      if (this.templateLayoutType === '2' && this.navigationType === '2') {
        layoutClass = 'Int';
      }
      if (this.routeTheme && this.routeTheme === 'homeOther') {
        return `c-2-bg ${layoutClass}`;
      }
      return `a-7-bg ${layoutClass}`;
    },
    // 头部别景色
    headClass() {
      if (this.routeTheme && this.routeTheme === 'homeOther') {
        return 'h-2-bg';
      }
      return 'h-1-bg';
    },
    // 底部 上边距
    footerClass() {
      const arr = [];
      if (this.routeTheme && this.routeTheme === 'homeOther') {
        arr.push('y-3-bg y-4-bd');
      } else {
        arr.push('y-1-bg y-2-bd');
      }
      if (this.$route.meta.footNotMrgin) {
        arr.push('no-margin');
      }
      return arr;
    },
    mustLogin() {
      return this.$route.meta.mustLogin;
    },
    publicInfo() {
      const info = this.$store.state.baseData.publicInfo || {};
      return info;
    },
    url() {
      return this.publicInfo.url || {};
    },
    loginFlag() {
      const { isLogin, userInfoIsReady } = this.$store.state.baseData;
      if (!isLogin && userInfoIsReady) {
        return '1';
      }
      return '2';
    },
  },
  methods: {
    // 区域IP访问限制 0 不限 1 限制
    getVisitStatus() {
      this.axios({
        // url: '/common/checkVisitStatus',
        url: 'limit_ip_login',
      }).then((data) => {
        if (data.code === '109109') {
          window.sessionStorage.setItem('LimitCountryNames', data.msg);
          this.$router.push('serviceLimit');
        }
      });
    },
    filterPhoneCode(val) {
      if (this.phoneCode.A.length) {
        if (val.length) {
          Object.keys(this.phoneCode).forEach((item) => {
            this.phoneCode[item] = this.phoneCode[item].filter((vitem) => {
              const valueArr = vitem.split('+');
              return val.indexOf(valueArr[2]) === -1;
            });
          });
        }

        this.$store.dispatch('setPhoneCodeGlobal', this.phoneCode);
      }
    },
    reload() {
      if (this.wsClosed) {
        window.location.reload();
      }
    },
    setTiming() {
      this.userActivite = true;
      this.userTime = 0;
      clearTimeout(this.userTimer);
      this.userTimer = null;
      clearTimeout(this.setTimer);
      this.setTimer = null;
      this.moving = true;
      this.setTimer = setTimeout(() => {
        this.moving = false;
        this.userActivite = false;
        if (!this.moving) {
          this.timing();
        }
      }, 1000);
    },
    timing() {
      clearTimeout(this.userTimer);
      this.userTimer = null;
      this.userTimer = setTimeout(() => {
        this.userTime += 1;
        if (this.userTime > 7200) {
          this.userActivite = true;
          window.localtion.reload();
          this.worker.postMessage({
            type: 'CLOSE_WEBSOCKET',
          });
          this.wsClosed = true;
        }
        if (!this.userActivite) {
          this.timing();
        }
      }, 1000);
    },
    goM() {
      if (this.url.mexUrl) {
        if (browser.isPhone || browser.isAndroid) {
          window.location.href = this.url.mexUrl;
        }
      }
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
