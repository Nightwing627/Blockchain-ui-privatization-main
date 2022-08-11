import {
  imgMap, setCookie, getCookie, myStorage,
} from '@/utils';

// 按钮
export default {
  name: 'c-header',
  data() {
    return {
      outFlag: true,
      // langArr: [], // 语言数组
      langHover: '', // 语言滑过
      langHoverSub: null,
      showFlag: false, // 设置主题弹窗变量
      userSkin: getCookie('cusSkin') || getCookie('defSkin'), // 用户选择的skin
      hoverHeader: '', //
      activeHeader: '',
      hoverMark: '',
      activeMark: '',
      extensionPosition: {},
    };
  },
  watch: {
    title() {
      this.modifyTilte();
    },
    $route: {
      handler() {
        this.setActive();
        this.setMarkActive();
      },
      // 深度观察监听
      deep: true,
    },
    market: {
      handler(v) {
        if (v) {
          this.setActive();
        }
      },
      // 深度观察监听
      deep: true,
    },
    router(router) {
      if (router !== null) {
        this.modifyTilte();
      }
    },
  },
  methods: {
    init() {
      this.setMarkActive();
      this.modifyTilte();
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
            // setCookie('lan', id);
            const { fullPath } = this.$route;
            const str = fullPath.replace(this.lan, id);
            window.location.href = str;
          }
        });
      } else {
        // setCookie('lan', id);
        const { fullPath } = this.$route;
        const str = fullPath.replace(this.lan, id);
        window.location.href = str;
      }
    },
    // 获取服务端自选币对
    getMySymbol() {
      return this.axios({
        url: 'optional/list_symbol',
        params: {},
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          const mySymbol = data.data.symbols.filter((x) => x !== '');
          myStorage.set('mySymbol', mySymbol);
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
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
      if (link.indexOf('http') > -1) {
        window.location.href = link;
      } else {
        this.$router.push(link);
      }
    },
    btnHref(link, target, options) {
      if (options && options.trades) {
        if (options.id === this.activeHeader) {
          return;
        }
        if (options.id === 'exTrade' && this.etfOpen) {
          this.marketCurrent = myStorage.set('markTitle', '');
          // 获取当前币对
          this.symbolCurrent = myStorage.set('sSymbolName', '');
        }
      }
      const headerTitleList = Object.keys(this.headerLink);
      const currentTitle = headerTitleList.filter((x) => (this.headerLink[x] === link ? x : '')).join();
      // 点击首页行情和币币交易 现货交易时拉取最新自选币对
      if (this.optionalSymbolServerOpen === 1 && this.isLogin
        && (currentTitle === 'home' || currentTitle === 'trade')) {
        this.getMySymbol().finally(() => {
          if (target && target === 'black') {
            window.open(link);
          } else {
            window.location.href = link;
          }
        });
      } else if (target && target === 'black') {
        window.open(link);
      } else {
        window.location.href = link;
      }
    },
    // 退出登录
    out() {
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
    getClass(v) {
      let str = '';
      if (v === this.activeHeader || v === this.hoverHeader) {
        str = 'x-3-cl';
      }
      return str;
    },
    setActive() {
      const { meta } = this.$route;
      const arr = ['exTrade', 'otcTrade', 'coTrade', 'marginTrade', 'assets', 'order'];
      let active = '';
      if (meta && meta.activeName
        && arr.indexOf(meta.activeName) !== -1) {
        active = meta.activeName;
      } else {
        const reg = /\/ex\/|\/otc\/|\/co\//g;
        let myPath = '';
        if (this.$route.path.match(reg)) {
          const Brr = this.$route.path.match(reg);

          myPath = `${this.$route.path.split(Brr[0])[1]}`;
        } else {
          myPath = this.$route.path.slice(1, this.$route.path.length);
        }
        active = myPath;
      }
      if (active === 'exTrade') {
        if (this.market && this.etfOpen
            && this.$route.params && this.$route.params.symbol) {
          const routeSymbol = this.$route.params.symbol;
          let symbolNameClassCion = routeSymbol.split('_')[0];
          let markTitleClassCion = routeSymbol.split('_')[1];
          const symbolNameClass = routeSymbol.split('_')[0];
          const markTitleClass = routeSymbol.split('_')[1];
          const coinLisArr = Object.keys(this.coinList);
          coinLisArr.forEach((item) => {
            const { showName } = this.coinList[item];
            if (showName === markTitleClass) {
              markTitleClassCion = item;
            }
            if (showName === symbolNameClass) {
              symbolNameClassCion = item;
            }
          });
          const symbol = `${symbolNameClassCion}/${markTitleClassCion}`;
          if (this.symbolAll[symbol] && this.symbolAll[symbol].etfOpen) {
            active = 'etf';
          }
        }
      }
      this.activeHeader = active;
    },
    setMarkActive() {
      const reg = /\/ex\/|\/otc\/|\/co\//g;
      let myPath = '';
      if (this.$route.path.match(reg)) {
        const arr = this.$route.path.match(reg);
        myPath = `/${this.$route.path.split(arr[0])[1]}`;
      } else {
        myPath = this.$route.path.slice(0, this.$route.path.length);
      }
      this.activeMark = myPath;
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
    evenHandMouseenter(v) {
      this.hoverHeader = v;
    },
    evenHandMouseleave() {
      this.hoverHeader = '';
    },
    markMouseenter(v) {
      this.hoverMark = v;
    },
    markMouseleave() {
      this.hoverMark = '';
    },
    // App 下载
    download(type) {
      window.open(this.appDownload[`${type}_download_url`]);
    },
    compare(property) {
      return function short(a, b) {
        const value1 = a[property];
        const value2 = b[property];
        return value1 - value2;
      };
    },
  },
  computed: {
    fiatTradeOpen() {
      const base = this.$store.state.baseData.publicInfo;
      if (base && base.switch && base.switch.fiat_trade_open === '1') {
        return true;
      }
      return false;
    },
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },
    // 全部币种列表
    coinList() {
      if (this.$store.state.baseData && this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return null;
    },
    // market 接口
    market() { return this.$store.state.baseData.market; },
    saasOtcFlowConfig() {
      let flag = false;
      if (this.publicInfo && this.publicInfo.switch
        && this.publicInfo.switch.saas_otc_flow_config
        && this.publicInfo.switch.saas_otc_flow_config.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    headerTemplateReceived() {
      return this.$store.state.baseData.swiperFlag;
    },
    optionalSymbolServerOpen() {
      return this.$store.state.baseData.optional_symbol_server_open;
    },
    leverFlag() {
      let leverFlag = false;
      if (this.publicInfo && this.publicInfo.switch
        && this.publicInfo.switch.lever_open
        && this.publicInfo.switch.lever_open.toString() === '1') {
        leverFlag = true;
      }
      return leverFlag;
    },
    etfNavigationSwitch() {
      let flag = false;
      if (this.publicInfo && this.publicInfo.switch
        && this.publicInfo.switch.etfNavigationSwitch
        && this.publicInfo.switch.etfNavigationSwitch.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    etfHave() {
      let flag = false;
      if (this.market && this.market.market.ETF
         && Object.keys(this.market.market.ETF).length) {
        flag = true;
      }
      return flag;
    },
    etfOpen() {
      if (this.etfNavigationSwitch && this.etfHave) {
        return true;
      }
      return false;
    },
    tradesList() {
      const arr = [];
      // 行情
      if (this.publicInfo && this.publicInfo.switch.index_kline_switch === '1') {
        arr.push({
          title: this.$t('header.market'),
          activeId: 'market',
          link: this.headerLink.market,
        });
      }

      // 币币交易
      if (this.headerLink.trade) {
        arr.push({
          title: this.$t('header.trade'),
          activeId: 'exTrade',
          link: this.headerLink.trade,
        });
      }

      // 法币
      if (this.headerLink.otc) {
        arr.push({
          title: this.fiatTradeOpen ? this.$t('assets.b2c.otcShow.header') : this.$t('header.otc'),
          activeId: 'otcTrade',
          link: this.headerLink.otc,
        });
      }
      // 一键买币
      if (!this.headerLink.otc && this.saasOtcFlowConfig) {
        arr.push({
          title: this.$t('mobilityTrade.immediately'),
          activeId: 'otcTrade',
          link: '/mobility',
        });
      }
      // 合约
      // if (this.headerLink.co) {
      //   arr.push({
      //     title: this.$t('header.co'),
      //     activeId: 'coTrade',
      //     link: this.headerLink.co,
      //     selectList: [
      //       {
      //         activeId: 'coTrade',
      //         link: this.headerLink.co,
      //         title: this.$t('header.co'),
      //       },
      //       {
      //         activeId: 'futuresData',
      //         link: this.headerLink.futuresData,
      //         title: '合约数据', // '合约数据',
      //       },
      //     ],
      //   });
      // }
      // 杠杆
      if (this.leverFlag) {
        arr.push({
          title: this.$t('header.lever'),
          activeId: 'marginTrade',
          link: this.headerLink.lever,
        });
      }
      // etf
      // 币币交易
      if (this.etfOpen) {
        arr.push({
          title: this.$t('etfAdd.title'),
          activeId: 'etf',
          link: this.etfUrl,
        });
      }

      return arr;
    },
    etfUrl() {
      let str = '';
      if (this.market) {
        const etfArr = [];
        Object.keys(this.market.market.ETF).forEach((ci) => {
          etfArr.push(this.market.market.ETF[ci]);
        });
        const symbol = etfArr.sort(this.compare('sort'))[0];
        const name = symbol.showName || symbol.name;
        str = name.replace('/', '_');
      }
      return `${this.headerLink.trade}/${str}`;
    },
    isCoOpen() {
      const base = this.$store.state.baseData.publicInfo;
      if (base && base.switch && base.switch.indep_co_switch === '1') {
        return true;
      }
      return false;
    },
    assetsList() {
      const arr = [];
      if (!this.isCoOpen && this.headerLink.trade) {
        arr.push({
          title: this.isCoOpen ? this.$t('assets.index.coExchangeAccount') : this.$t('assets.index.exchangeAccount'),
          link: '/assets/exchangeAccount',
        });
      } else if (this.isCoOpen) {
        arr.push({
          title: this.isCoOpen ? this.$t('assets.index.coExchangeAccount') : this.$t('assets.index.exchangeAccount'),
          link: '/assets/exchangeAccount',
        });
      }

      const otcTitle = !this.fiatTradeOpen
        ? this.$t('assets.index.otcAccount')
        : this.$t('assets.b2c.otcShow.otcAccount');

      if (this.headerLink.otc) {
        arr.push({
          title: otcTitle,
          link: '/assets/otcAccount',
        });
      }
      if (this.fiatTradeOpen) {
        arr.push({
          title: this.$t('assets.index.otcAccount'),
          link: '/assets/b2cAccount',
        });
      }
      if (!this.headerLink.otc && this.saasOtcFlowConfig) {
        arr.push({
          title: otcTitle,
          link: '/assets/otcAccount',
        });
      }
      if (this.headerLink.co) {
        let url = `${this.headerLink.co}/assets/coAccount`;
        if (window.HOSTAPI === 'co') {
          url = '/assets/coAccount';
        }
        arr.push({
          title: this.$t('assets.index.coAccount'),
          link: url,
        });
      }
      if (this.leverFlag) {
        arr.push({
          title: this.$t('assets.index.leverage'),
          link: '/assets/leverageAccount',
        });
      }
      return arr;
    },
    orderList() {
      const arr = [];
      if (this.headerLink.trade) {
        arr.push({
          title: this.$t('order.index.exOrder'),
          link: '/order/exchangeOrder',
        });
      }
      const otcTitle = !this.fiatTradeOpen
        ? this.$t('order.index.otcOrder')
        : this.$t('assets.b2c.otcShow.otcOrder');

      if (this.headerLink.otc) {
        arr.push({
          title: otcTitle,
          link: '/order/otcOrder',
        });
      }
      if (!this.headerLink.otc && this.saasOtcFlowConfig) {
        arr.push({
          title: otcTitle,
          link: '/order/otcOrder',
        });
      }
      if (this.headerLink.co) {
        let url = `${this.headerLink.co}/order/coOrder`;
        if (window.HOSTAPI === 'co') {
          url = '/order/coOrder';
        }
        arr.push({
          title: this.$t('order.coOrder.coOrder'),
          link: url,
        });
      }
      if (this.leverFlag) {
        arr.push({
          title: this.$t('order.index.leverage'),
          link: '/order/leverageOrder',
        });
      }
      return arr;
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
        title = indexHeaderTitle[language] || '';
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
      if (this.userSkin) {
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
    chanSkin() {
      let sw = '1';
      if (this.publicInfo
        && this.publicInfo.skin
        && this.publicInfo.skin.changeSkin) {
        sw = this.publicInfo.skin.changeSkin;
      }
      return sw;
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
      if (this.publicInfo && this.publicInfo.switch.is_financing_open) {
        return true;
      }
      if (this.userInfo && this.userInfo.agentStatus
        && this.publicInfo && this.publicInfo.switch.agentUserOpen) {
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
          trade: this.linkurl.exUrl ? '/ex/zh_CN/trade' : '',
          market: this.linkurl.exUrl ? '/ex/zh_CN/market' : '',
          lever: '/ex/margin',
          otc: this.linkurl.otcUrl ? '/otc/zh_CN/' : '',
          co: this.linkurl.coUrl ? '/co/zh_CN/trade' : '',
        };
      }
      if (this.$store.state.baseData && this.$store.state.baseData.publicInfo) {
        return {
          home: this.linkurl.exUrl ? `${this.linkurl.exUrl}/${this.lan}/` : '',
          trade: this.linkurl.exUrl ? `${this.linkurl.exUrl}/${this.lan}/trade` : '',
          market: this.linkurl.exUrl ? `${this.linkurl.exUrl}/${this.lan}/market` : '',
          otc: this.linkurl.otcUrl ? `${this.linkurl.otcUrl}/${this.lan}/` : '',
          lever: this.linkurl.exUrl ? `${this.linkurl.exUrl}/${this.lan}/margin` : '',
          co: this.linkurl.coUrl ? `${this.linkurl.coUrl}/${this.lan}/trade` : '',
        };
      }
      return '';
    },
    router() {
      return this.$route.name;
    },
    routerPath() {
      return this.$route.path;
    },
    headerTemplate() {
      let arr = [];
      try {
        arr = JSON.parse(this.$store.state.baseData.headerTemplate) || [];
      } catch (w) {
        arr = [];
      }
      const newArr = [];

      if (Array.isArray(arr)) {
        arr.forEach((item) => {
          let str = '';
          const first = item.link.split('//');
          if (first && first.length === 2) {
            const fid = first[1].indexOf('/');
            if (fid !== -1) {
              const ac = first[1].slice(fid + 1, first[1].length);
              if (ac && ac.length) {
                str = ac;
              }
            }
          }
          if (str.length === 0) {
            str = item.link;
          }
          newArr.push({ ...{}, ...item, ...{ activeId: str } });
        });
      }

      return newArr;
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
    logoUrl() {
      let url = '';
      if (this.publicInfo && this.publicInfo.msg && this.publicInfo.msg.logoUrl) {
        url = this.publicInfo.msg.logoUrl || imgMap.logo;
        // 设置 标题栏的 icon 图标
        // const link = document.querySelector
        // ("link[rel*='icon']") || document.createElement('link');
        // link.type = 'image/x-icon';
        // link.rel = 'shortcut icon';
        // link.href = this.publicInfo.msg.iconUrl;
        // document.getElementsByTagName('head')[0].appendChild(link);
      }
      return url;
    },
    intLogoUrl() {
      let url = '';
      if (this.publicInfo && this.publicInfo.msg && this.publicInfo.msg.logoUrl) {
        url = this.publicInfo.msg.index_international_logo || imgMap.int_logo;
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
