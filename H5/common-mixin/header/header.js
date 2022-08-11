import { imgMap, setCookie, getCookie } from '@/utils';
// 按钮
export default {
  data() {
    return {
      outFlag: true,
      // langArr: [], // 语言数组
      langHover: '', // 语言滑过
      langHoverSub: null,
      showFlag: false, // 设置主题弹窗变量
      userSkin: getCookie('cusSkin') || getCookie('defSkin'), // 用户选择的skin
      extensionPosition: {},
      isShowHeader: false,
      srcArr: ['innovation', 'appDownload', 'init'], // 自定义头部列表包含该项去重
    };
  },
  beforeDestroy() {
    this.$bus.$emit('htmlScroll', true);
  },
  watch: {
    isShowHeader(v) {
      if (v) {
        this.$bus.$emit('htmlScroll', false);
      } else {
        this.$bus.$emit('htmlScroll', true);
      }
    },
    title() {
      this.modifyTilte();
    },
    router(router) {
      if (router !== null) {
        this.modifyTilte();
      }
    },
    logoUrl() {
      if (this.logoUrl) {
        this.setIconUrl();
      }
    },
  },
  methods: {
    showHeader() {
      this.isShowHeader = !this.isShowHeader;
    },
    setAlert() {
      this.showFlag = true;
    },
    setClose() {
      this.userSkin = '';
      this.showFlag = false;
    },
    lanClick(id) {
      // this.
      if (id === this.lan) { return; }
      if (this.isLogin) {
        this.axios({
          url: this.$store.state.url.common.change_language,
          params: { language: id },
          method: 'post',
        }).then((res) => {
          if (Number(res.code) === 0) {
            const { fullPath } = this.$route;
            const str = fullPath.replace(this.lan, id);
            window.location.href = str;
          }
        });
      } else {
        const { fullPath } = this.$route;
        const str = fullPath.replace(this.lan, id);
        window.location.href = str;
      }
    },
    handMouseenter(id, sub) {
      if (sub === 'sub') {
        this.langHoverSub = id;
      } else {
        this.langHover = id;
      }
      if (id === 'extension' && this.$refs.commonHeader) {
        const top = this.$refs.extension.offsetTop;
        const { height } = this.$refs.commonHeader.getBoundingClientRect();
        if (height - top > 350) {
          this.extensionPosition = { top: `${top + 20}px` };
        } else {
          this.extensionPosition = { bottom: `${height - top - 40}px` };
        }
      }
    },
    handMouseleave(sub) {
      if (sub === 'sub') {
        this.langHoverSub = '';
      } else {
        this.langHover = '';
      }
    },
    // 路由跳转
    btnLink(link) {
      const pageName = this.$route.name;
      if (pageName !== 'setLang') {
        localStorage.setItem('pageName', pageName);
      }
      this.isShowHeader = false;
      this.$router.push(link);
    },
    btnHref(link, target) {
      this.isShowHeader = false;
      if (target && target === 'black') {
        window.open(link);
      } else {
        window.location.href = link;
      }
    },
    // 退出登录
    out() {
      this.isShowHeader = false;
      if (!this.outFlag) { return; }
      this.outFlag = false;
      this.axios({
        url: '/user/login_out',
      }).then((data) => {
        this.outFlag = true;
        if (data.code.toString() === '0') {
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.$bus.$emit('outUserIsLogin');
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // title
    modifyTilte() {
      let routerName = this.$route.name;
      if (this.fiatTradeOpen && routerName === 'fiatdeal') { routerName = 'b2cFiatdeal'; }
      let title = `${this.$t('pageTitle')[routerName] ? this.$t('pageTitle')[routerName] : ''}`;
      if (this.title !== '') title = `${this.title}-${title}`;
      document.title = title;
    },
    setConfirm() {
      setCookie('cusSkin', this.userSkin);
      window.location.reload();
    },
    setSkin(id) {
      this.userSkin = id;
    },
    setIconUrl() {
      if (this.publicInfo && this.publicInfo.msg && this.publicInfo.msg.logoUrl) {
        // 设置 标题栏的 icon 图标
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = this.publicInfo.msg.iconUrl;
        document.getElementsByTagName('head')[0].appendChild(link);
      }
    },
  },
  mounted() {
    this.modifyTilte();
    if (this.logoUrl) {
      this.setIconUrl();
    }
    this.$bus.$on('HEADER-CLICK-EVENT', () => {
      this.isShowHeader = false;
    });
  },
  computed: {
    isCoOpen() {
      const base = this.$store.state.baseData.publicInfo;
      if (base && base.switch && base.switch.indep_co_switch === '1') {
        return true;
      }
      return false;
    },
    fiatTradeOpen() {
      const base = this.$store.state.baseData.publicInfo;
      if (base && base.switch && base.switch.fiat_trade_open === '1') {
        return true;
      }
      return false;
    },
    saasOtcFlowConfig() {
      let flag = false;
      if (this.publicInfo && this.publicInfo.switch
                && this.publicInfo.switch.saas_otc_flow_config
                && this.publicInfo.switch.saas_otc_flow_config.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    index_international_open() {
      return this.$store.state.baseData.index_international_open;
    },
    logoUrl() {
      let url = '';
      if (this.publicInfo && this.publicInfo.msg && this.publicInfo.msg.logoUrl) {
        url = this.publicInfo.msg.logoUrl || imgMap.logo;
      }
      return url;
    },
    appShowPage() {
      let flag = false;
      if (this.routerPageTitle === 'select') {
        flag = true;
      }
      return flag;
    },
    routerPageTitle() {
      return this.$route.meta.pageTitle;
    },
    isApp() {
      return this.$store.state.baseData.isApp;
    },
    title() {
      let seo = {};
      if (this.publicInfo) {
        seo = this.publicInfo.seo;
      }
      const { indexHeaderTitle, lan } = this.$store.state.baseData;
      let title = '';
      if (getCookie('lan')) {
        const language = getCookie('lan');
        title = indexHeaderTitle[language];
      } else {
        const language = lan ? lan.defLan : '';
        title = language ? indexHeaderTitle[language] : '';
      }
      return seo.title || title;
    },
    templateLayoutType() {
      return this.$store.state.baseData.templateLayoutType;
    },
    navigationType() {
      if (this.templateLayoutType === '2' && this.$route.meta.navigation !== '1') {
        return '2';
      }
      return '1';
    },
    appDownload() {
      return this.$store.state.baseData.app_download || '';
    },
    Dskin() {
      let str = '';
      if (this.userSkin && this.userSkin.length) {
        str = this.userSkin;
      } else if (getCookie('defSkin') || getCookie('cusSkin')) {
        if (getCookie('cusSkin')) {
          str = getCookie('cusSkin');
        } else {
          str = getCookie('defSkin');
        }
      }
      return str;
    },
    colorList() {
      let arr = [];
      if (!this.publicInfo) return arr;
      const { skinType = [] } = this.publicInfo;

      if (this.publicInfo && skinType.length) {
        arr = skinType;
      } else if (this.publicInfo
        && this.publicInfo.skin
        && this.publicInfo.skin.listist) {
        arr = this.publicInfo.skin.listist;
      }
      return arr;
    },
    subNavisShow() {
      if (this.publicInfo && this.publicInfo.switch.newcoinOpen === '1') {
        return true;
      }
      if (this.publicInfo && this.publicInfo.switch.is_return_open === '1') {
        return true;
      }
      if (this.appDownload && this.appDownload.app_page_url) {
        return true;
      }
      return false;
    },
    lan() {
      if (this.$store.state.baseData) {
        return this.$store.state.baseData.lan;
      }
      return null;
    },
    showLan() {
      let str = '';
      if (this.langArr.length) {
        this.langArr.forEach((item) => {
          if (this.lan === item.id) {
            str = item.name;
          }
        });
      }
      return str;
    },
    messageCount() {
      if (this.$store.state.baseData.messageCount) {
        return this.$store.state.baseData.messageCount;
      }
      return null;
    },
    userMessageList() {
      if (this.$store.state.baseData.userMessageList) {
        return this.$store.state.baseData.userMessageList;
      }
      return null;
    },
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    headerLink() {
      if (process.env.NODE_ENV === 'development') {
        return {
          home: '/ex/',
          trade: this.linkurl.mexUrl ? '/ex/trade' : '',
          lever: '/ex/margin',
          otc: this.linkurl.motcUrl ? '/otc/' : '',
          co: this.linkurl.mcoUrl ? '/co/trade' : '',
        };
      }
      if (this.$store.state.baseData && this.$store.state.baseData.publicInfo) {
        return {
          home: this.linkurl.mexUrl,
          trade: this.linkurl.mexUrl ? `${this.linkurl.mexUrl}/trade` : '',
          otc: this.linkurl.motcUrl,
          lever: this.linkurl.mexUrl ? `${this.linkurl.mexUrl}/margin` : '',
          co: this.linkurl.mcoUrl,
        };
      }
      return '';
    },
    router() {
      return this.$route.name;
    },
    headerTemplate() {
      try {
        const headerTemplate = JSON.parse(this.$store.state.baseData.headerTemplate);
        if (headerTemplate && headerTemplate.length) {
          headerTemplate.forEach((item, i) => {
            const ind = item.link.split('/');
            this.srcArr.forEach((ele) => {
              if (ind[ind.length - 1] === ele) {
                headerTemplate.splice(i, 1);
              }
            });
          });
        }
        return headerTemplate || [];
      } catch (w) {
        return [];
      }
    },
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    userInfoIsReady() {
      return this.$store.state.baseData.userInfoIsReady;
    },
    userInfo() { return this.$store.state.baseData.userInfo; },
    publicInfo() { return this.$store.state.baseData.publicInfo; },
    langArr() {
      if (this.publicInfo && this.publicInfo.lan) {
        return this.publicInfo.lan.lanList;
      }
      return [];
    },
    userText() {
      if (this.userInfo) {
        return this.userInfo.userAccount;
      }
      return '';
    },
    intLogoUrl() {
      let url = '';
      if (this.publicInfo && this.publicInfo.msg && this.publicInfo.msg.logoUrl) {
        url = this.publicInfo.msg.h5LoginImg || imgMap.int_logo;
      }
      return url;
    },
    userStatus() {
      let str = '';
      if (this.userInfo && this.userInfo.accountStatus.toString()) {
        switch (this.userInfo.accountStatus.toString()) {
          case '0':
            str = this.$t('header.userStatus1'); // '正常';
            break;
          case '1':
            str = this.$t('header.userStatus2'); // '冻结交易，冻结提现';
            break;
          case '2':
            str = this.$t('header.userStatus3'); // '冻结交易 3冻结提现';
            break;
          default:
            break;
        }
      }
      return str;
    },
  },
};
