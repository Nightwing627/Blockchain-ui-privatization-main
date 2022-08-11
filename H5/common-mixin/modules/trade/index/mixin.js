// mapState
import { mapState } from 'vuex';
import { myStorage, getCoinShowName } from '@/utils';
import worker from '@/utils/webWorker';

export default {
  name: 'trade',
  data() {
    return {
      // 是否是收起状态
      shrink: false,
      // 24小时行情 是否是收起状态
      marketShrink: false,
      // 窗口宽度
      screenWidth: null,
      // 延迟执行
      windowOnResizeFire: true,
      // 宽度分割
      mediaWidth: 1820,
      // shuju
      marketData: null,
      // MywebSocket
      MywebSocket: null,
      // 当前市场
      marketCurrent: null,
      // 当前币对
      symbolCurrent: null,
      // 当前币对列表
      symbolCurrentList: [],
      // 深度级别
      depthClasses: '0',
      // 深度值
      depthValue: null,
      // 图表遮罩
      coverKlineBox: null,
      isFull: null,
      routeSymbol: this.$route.params.symbol,
      // H5当前模块 1:交易 2：K线 3：简介 4：成交 5：委托
      activeTypeId: '1',
      // 是否显示币对列表
      isShowMarket: false,
      markTitleClass: 'markTitle',
      symbolNameClass: 'sSymbolName',
      routerPathClass: 'trade',
      symbolAllLoad: false,
      etfDialog: false,
      etfUrl: '',
      etfName: '',
      etfTimer: null,
      etfPrice: '--',
    };
  },
  computed: {
    market() { return this.$store.state.baseData.market; },
    ...mapState({
      baseInfo({ baseData }) {
        this.marketData = baseData.market;
        // 获取当前市场
        this.marketCurrent = myStorage.get(this.markTitleClass);
        // 获取当前币对
        this.symbolCurrent = myStorage.get(this.symbolNameClass);
        return baseData;
      },
    }),
    templateLayoutType() {
      return this.$store.state.baseData.templateLayoutType;
    },
    worker() {
      return worker();
    },
    // 是否Login
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    // Market 数据
    marketList() {
      return this.marketData ? this.marketData.market : null;
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
    // 当前币对列表
    symbolList() {
      // 如果 当前市场 是 自选市场
      if (this.marketCurrent === 'myMarket') {
        const mySymbol = myStorage.get('mySymbol') || [];
        const marketList = {};
        if (mySymbol.length) {
          mySymbol.forEach((item) => {
            if (item && this.symbolAll[item]) {
              marketList[item] = this.symbolAll[item];
            }
          });
        }
        return marketList;
      }
      if (this.marketList && this.marketCurrent) {
        return this.marketList[this.marketCurrent];
      }
      return null;
    },
    // 汇率单位
    rateData() {
      return this.$store.state.baseData.rate;
    },
    // 设置 收缩版本 还是展开版
    leftClasses() {
      return this.marketShrink ? 'left-shrinks' : 'left-expand';
    },
    currentSymbolCase() {
      if (this.symbolCurrent) {
        const symbolArr = this.symbolCurrent.toLowerCase().split('/');
        return symbolArr[0] + symbolArr[1];
      }
      return null;
    },
    // H5 底部导航
    navList() {
      const arr = [
        // 交易
        {
          navText: this.$t('h5Add.tradeList1'),
          id: '1',
          classes: 'cc',
        },
        // K线
        {
          navText: this.$t('h5Add.tradeList2'),
          id: '2',
        },
        // 简介
        {
          navText: this.$t('h5Add.tradeList3'),
          id: '3',
        },
        // 成交
        {
          navText: this.$t('h5Add.tradeList4'),
          id: '4',
        },
      ];
      // 委托
      if (this.isLogin) {
        arr.push({
          navText: this.$t('h5Add.tradeList5'),
          id: '5',
        });
      }
      return arr;
    },
    copySymbolCurrent() {
      return this.symbolCurrent;
    },
  },
  watch: {
    market: {
      immediate: true,
      handler(v) {
        if (v) {
          this.init();
          if (this.symbolAllLoad && this.symbolCurrent) {
            this.symbolCurrentFn();
          }
          this.initEtfDialog();
        }
      },
    },
    copySymbolCurrent: {
      immediate: true,
      handler(v) {
        if (v) { this.initEtfDialog(); }
      },
    },
    isShowMarket(v) {
      if (v) {
        this.$bus.$emit('htmlScroll', false);
      } else {
        this.$bus.$emit('htmlScroll', true);
      }
    },
    // 监听 获取到数据
    marketData(val) {
      if (val.wsUrl) {
        // 创建WS
        this.worker.postMessage({
          type: 'CREAT_WEBSOCKET',
          data: {
            wsUrl: val.wsUrl,
            lan: this.$store.state.baseData.lan,
            rate: this.rateData,
            symbolAll: this.symbolAll,
          },
        });
      }
    },
    // 监听 当前市场的切换
    marketCurrent(val, oldVla) {
      if (oldVla) {
        // 存储 上一次选中的市场
        this.oldMarket = oldVla;
      } else {
        this.oldMarket = val;
      }
    },
    // 监听 当前选中货币对的改变
    symbolCurrent(val, oldVla) {
      if (!this.symbolAll) { this.symbolAllLoad = true; }
      if (val && this.symbolAll) {
        this.getJz();
        if (this.symbolAll) {
          this.symbolCurrentFn();
        } else {
          this.symbolAllLoad = true;
        }
        const sSymbol = val.replace('/', '_');
        this.$router.push(`/${this.routerPathClass}/${sSymbol}`);
        this.$bus.$emit('SYMBOL_CURRENT', val);
        const headText = `${val}`;
        this.$nextTick(() => {
          this.$bus.$emit('PAGE-TOP-TITLE', { type: 'getShowSymbol', symbol: headText });
        });
      }
      if (oldVla && this.MywebSocket) {
        if (this.oldMarket !== val.split('/')[1]) {
          // 如果 切换了市场 又切换了币对 就 停止 上一个币对的 24小时行情 send
          this.webSocketSend('Market', 'unsub', val, { [oldVla]: this.symbolAll[oldVla] });
        }
        // 停止 上一个币对的 实时成交 send
        this.webSocketSend('Trade', 'unsub', oldVla);
        this.depthClasses = '0';
        // 发送 实时成交 数据 Send
        this.webSocketSend('Trade', 'req', val);
        this.webSocketSend('Trade', 'sub', val);
        setTimeout(() => {
          // 发送 盘口深度 数据 Send
          this.webSocketSend('Depth', 'unsub', oldVla, this.depthClasses);
          if (this.depthClasses !== '0') {
            this.webSocketSend('Depth', 'unsub', oldVla, '0');
          }
          this.webSocketSend('Depth', 'sub', val, this.depthClasses);
        });
      }
    },
    // 监听 当前币对列表的变化
    symbolList(val, oldVla) {
      this.$bus.$emit('SYMBOL_LIST', val);

      if (this.MywebSocket) {
        // 发送 24小时行情实时数据 Send -- unsub
        this.webSocketSend('Market', 'unsub', this.symbolCurrent, oldVla);
        // 发送 24小时行情实时数据 Send -- sub
        this.webSocketSend('Market', 'sub', this.symbolCurrent, val);
      }
    },
    // 监听 webSocket 创建成功
    MywebSocket(val) {
      if (val) {
        // 发送 24小时行情历史数据 Send
        // this.webSocketSend('Review', null, this.symbolCurrent, this.symbolList);
        this.webSocketSend('Review', null, this.symbolCurrent, this.symbolList);
        // 发送 24小时行情实时数据 Send
        this.webSocketSend('Market', 'sub', this.symbolCurrent, this.symbolList);
        // 发送 实时成交 数据 Send
        this.webSocketSend('Trade', 'req', this.symbolCurrent);
        this.webSocketSend('Trade', 'sub', this.symbolCurrent);
        // 发送 盘口深度数据 Send
        this.webSocketSend('Depth', 'sub', this.symbolCurrent, this.depthClasses);
      }
    },
    // 监听 货币汇率单位
    rateData(val) {
      if (val) {
        this.$bus.$emit('RATE_DATA', val);
      }
    },
    // 监听 深度切换
    depthClasses(val, oldVal) {
      setTimeout(() => {
        if (oldVal) {
          if (oldVal !== '0') {
            this.webSocketSend('Depth', 'unsub', this.symbolCurrent, oldVal);
          }
        }
        this.webSocketSend('Depth', 'sub', this.symbolCurrent, val);
      });
    },
  },
  methods: {
    getJz() {
      let flag = false;
      clearInterval(this.etfTimer);
      if (this.symbolCurrent && this.symbolAll) {
        flag = !!this.symbolAll[this.symbolCurrent].etfOpen;
      }
      this.etfPrice = '--';
      if (!flag) return;
      // console.log()
      this.getJzAxios(this.symbolCurrent);
      this.etfTimer = setInterval(() => {
        this.getJzAxios();
      }, 3000);
    },
    getJzAxios() {
      const arr = this.symbolCurrent.split('/');
      this.axios({
        url: '/etfAct/netValue',
        method: 'post',
        params: {
          base: arr[0],
          quote: arr[1],
        },
      }).then((data) => {
        if (data.code === '0') {
          this.etfPrice = data.data.price;
          // this.etfUrl = data.data.faqUrl;
          // this.etfName = data.data.domainName;
        } else {
          // this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    createdInit() {
      this.axios({
        url: 'etfAct/faqInfo',
        // method: 'get',
      }).then((data) => {
        if (data.code === '0') {
          this.etfUrl = data.data.faqUrl;
          window.localStorage.etfUrl = data.data.faqUrl;
          this.etfName = data.data.domainName;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    initEtfDialog() {
      if (this.symbolAll && this.copySymbolCurrent) {
        const symbol = this.copySymbolCurrent;
        if (this.symbolAll
          && this.symbolAll[symbol]
          && this.symbolAll[symbol].etfOpen
          && !window.localStorage.etfDialog) {
          this.etfDialog = true;
        }
      }
    },
    etfDialogConfirm() {
      this.etfDialog = false;
      window.localStorage.etfDialog = true;
    },
    symbolCurrentFn() {
      const val = this.symbolCurrent;
      const sSymbolShowName = this.symbolAll[val].showName || val;
      const sSymbol = sSymbolShowName.replace('/', '_');
      if (this.symbolAll[val].etfOpen) {
        myStorage.set(this.markTitleClass, 'ETF');
      }
      this.$router.push(`/trade/${sSymbol}`);
      this.$bus.$emit('SYMBOL_CURRENT', val);
      const headText = `${val}`;
      this.$nextTick(() => {
        this.$bus.$emit('PAGE-TOP-TITLE',
          {
            type: 'getShowSymbol',
            symbol: headText,
            etfOpen: !!this.symbolAll[val].etfOpen,
          });
      });
    },
    getShowSymbol(v) {
      let str = '';
      const showNameSymbols = this.$store.state.baseData.symbolAll;
      if (showNameSymbols) {
        str = getCoinShowName(v, showNameSymbols);
      }
      return str;
    },
    // H5 头部 币对点击打开市场列表
    headerClickEvent() {
      this.isShowMarket = !this.isShowMarket;
    },
    // createdInit() {
    //   if (this.routeSymbol) {
    //     myStorage.set(this.markTitleClass, this.routeSymbol.split('_')[1]);
    //     myStorage.set(this.symbolNameClass, this.routeSymbol.replace('_', '/'));
    //   } else {
    //     const sSymbolName = myStorage.get(this.symbolNameClass);
    //     const sSymbol = sSymbolName.replace('/', '_');
    //     this.$router.push(`/${this.routerPathClass}/${sSymbol}`);
    //   }
    // },
    init() {
      this.getJz();
      if (this.routeSymbol) {
        let symbolNameClassCion = this.routeSymbol.split('_')[0];
        let markTitleClassCion = this.routeSymbol.split('_')[1];
        const symbolNameClass = this.routeSymbol.split('_')[0];
        const markTitleClass = this.routeSymbol.split('_')[1];
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
        if (this.symbolAll[symbol].etfOpen) {
          markTitleClassCion = 'ETF';
        }
        if (markTitleClassCion && symbolNameClassCion) {
          myStorage.set(this.markTitleClass, markTitleClassCion);
          myStorage.set(this.symbolNameClass, symbol);
        }
      } else {
        const sSymbolName = myStorage.get(this.symbolNameClass);
        if (sSymbolName) {
          const sSymbolShowName = this.symbolAll[sSymbolName].showName || sSymbolName;
          const sSymbol = sSymbolShowName.replace('/', '_');
          this.$router.push(`/trade/${sSymbol}`);
        }
      }
      this.$bus.$off('HEADER-CLICK-EVENT');
      this.listenBusEvent();
      this.worker.onmessage = (event) => {
        const { data } = event;
        // 监听 WebSocket 链接成功
        if (data.type === 'WEBSOCKET_ON_OPEN') {
          this.MywebSocket = data.data.type;
          this.$bus.$emit('WEBSOCKET_ON_OPEN', this.MywebSocket);
        }
        // 监听 WS 数据
        if (data.type === 'WEBSOCKET_DATA') {
          this.listenWSData(data.data);
        }
      };
      this.screenWidth = document.body.clientWidth;
      if (this.screenWidth <= this.mediaWidth) {
        this.shrink = true;
        this.marketShrink = true;
      }
      // 监听 窗口的大小改变
      window.onresize = () => {
        this.$bus.$emit('WINFOW_ON_RESIIZE', document.body.clientWidth);
        if (this.windowOnResizeFire) {
          this.screenWidth = document.body.clientWidth;
          if (this.screenWidth <= this.mediaWidth) {
            // 如果 屏幕窗口 小于阈值 设置成收起模式
            this.shrink = true;
            this.marketShrink = true;
          } else {
            // 如果 屏幕窗口 大于阈值 设置成展开模式
            this.shrink = false;
            this.marketShrink = false;
          }
          this.windowOnResizeFire = false;
          // 0.3秒之后将标志位重置
          setTimeout(() => {
            this.windowOnResizeFire = true;
          });
        }
      };
    },
    listenBusEvent() {
      // H5 监听 头部币对的点击事件
      this.$bus.$on('HEADER-CLICK-EVENT', this.headerClickEvent);
      // 监听 市场切换
      this.$bus.$on('ON_MARKET_SWITCH', (data) => {
        this.marketCurrent = data;
      });
      // 监听 币对切换
      this.$bus.$on('ON_SYMBOL_SWITCH', (data) => {
        myStorage.set(this.markTitleClass, this.marketCurrent);
        myStorage.set(this.symbolNameClass, data);
        this.symbolCurrent = data;
        // 隐藏币对列表弹层
        this.isShowMarket = false;

        if (this.isLogin) {
          this.$store.dispatch('assetsExchangeData', {
            auto: false,
            coinSymbols: data.replace('/', ','),
          });
        }
      });
      // 监听 深度级别的切换
      this.$bus.$on('DEPTH_CLASSES', (data) => {
        this.depthClasses = data;
      });
      // 监听 深度级别的值
      this.$bus.$on('DEPTH_VALUE', (data) => {
        this.depthValue = data;
      });
      // 监听 kline 发送Send
      this.$bus.$on('WEBSOCKET_KLINE_SEND', (data) => {
        this.worker.postMessage({
          type: 'WEBSOCKET_KLINE_SEND',
          data,
        });
      });
    },
    listenWSData(data) {
      const { type, WsData } = data;
      this.$bus.$emit(type, WsData);
      if (type === 'TRADE_DATA') {
        this.worker.postMessage({
          type: 'TRADE_QUEUE_DATA',
          data: WsData.queueDataList,
        });
      }
    },
    webSocketSend(type, sendType, symbolData, symbolList) {
      this.worker.postMessage({
        type: 'WEBSOCKET_SEND',
        data: {
          type,
          sendType,
          symbolData,
          symbolList,
          depthValue: this.depthValue,
        },
      });
    },
    shrinkBlock() {
      this.marketShrink = !this.marketShrink;
    },
    serachShrinkBlock() {
      this.marketShrink = false;
    },
    ondblclick() {
      return false;
    },
    onclickfun(e) {
      // 显示和隐藏币币交易页面 TradingView 的遮罩
      if (e.target.className === 'coverKlineBox') {
        this.coverKlineBox = e.target;
      }
      if (e.target.className === 'coverKlineBox') {
        this.coverKlineBox.style.display = 'none';
      } else if (this.coverKlineBox) {
        this.coverKlineBox.style.display = 'block';
        this.coverKlineBox = null;
      }
    },
    // H5 底部的导航点击事件
    bottomNavClick(data) {
      this.activeTypeId = data.id;
      this.$bus.$emit('ACTIVE_TYPE_ID', this.activeTypeId);
    },
  },
  beforeDestroy() {
    this.$bus.$emit('htmlScroll', true);
  },
};
