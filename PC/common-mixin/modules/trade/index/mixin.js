// mapState
import { mapState } from 'vuex';
import worker from '@/utils/webWorker';
// 24小时行情
import {
  fixD,
  myStorage,
  imgMap,
  colorMap,
  setCookie,
  getCookie,
} from '@/utils';

export default {
  name: 'trade',
  data() {
    return {
      markTitleClass: 'markTitle',
      symbolNameClass: 'sSymbolName',
      imgMap,
      colorMap,
      routerPathClass: 'trade',
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
      routeSymbol: this.$route.params.symbol,
      isFull: null,
      tradeLimitData: null,
      tradeAlertState: false,
      etfDialog: false,
      etfUrl: '',
      etfName: '',
      etfTimer: null,
      etfPrice: '--',
      lTime: null,
      lastTimeS: myStorage.get('lastTimeS'),
    };
  },
  computed: {
    fundRate() {
      const { publicInfo } = this.$store.state.baseData;
      let str = '';
      if (publicInfo && publicInfo.fundRate) {
        str = publicInfo.fundRate;
      }
      return str;
    },
    // market 接口
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
      hasTradeLimitOpen({ baseData }) {
        return baseData.has_trade_limit_open;
      },
    }),
    // 全部币种列表
    coinList() {
      if (this.$store.state.baseData && this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return {};
    },
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },
    trade_board_is_fold() {
      return this.$store.state.baseData.trade_board_is_fold;
    },
    // 当前币对精度计算的值
    fixValue() {
      if (this.symbolAll && this.symbolCurrent) {
        const symbol = this.symbolAll[this.symbolCurrent];
        return {
          priceFix: symbol.price,
          volumeFix: symbol.volume,
        };
      }
      return {
        priceFix: 2,
        volumeFix: 8,
      };
    },
    tradeLimitAlertText() {
      let text = '';
      if (this.tradeLimitData) {
        const symbol = this.$route.params.symbol.split('_')[0];
        const {
          trade_limit_buy_info: tradeLimtBuyInfo,
          trade_limit_sell_info: tradeLimitSellInfo,
          trade_symbol_sell_limit: tradeSymbolSellLimit,
          trade_symbol_buy_limit: tradeSymbolBuyLimit,
        } = this.tradeLimitData;

        // 该币对限制每日交易数量
        text = `${this.$t('tradeLimt.tradeLimit_text_everyDayCount')}`;
        // 单日最大买入量为：
        const txt1 = `${this.$t('tradeLimt.tradeLimit_text_everyDayBuy') + fixD(tradeSymbolBuyLimit, this.fixValue.volumeFix) + symbol + this.$t('tradeLimt.tradeLimit_text_everyDayBuy_end')}，`;
        // 单日最大卖出量为：
        const txt2 = `${this.$t('tradeLimt.tradeLimit_text_everyDaySell') + fixD(tradeSymbolSellLimit, this.fixValue.volumeFix) + symbol + this.$t('tradeLimt.tradeLimit_text_everyDaySell_end')}`;
        // 未限制买入交易
        const txt3 = this.$t('tradeLimt.tradeLimit_text_noLimitBuy');
        // 未限制卖出交易
        const txt4 = this.$t('tradeLimt.tradeLimit_text_noLimitSell');

        text += (tradeLimtBuyInfo ? txt1 : txt3);
        text += (tradeLimitSellInfo ? txt2 : txt4);
      }

      return text;
    },
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
    trade_board_is_fold: {
      handler() {
        if (this.trade_board_is_fold) {
          setTimeout(() => {
            if (this.screenWidth <= this.mediaWidth) {
              this.$bus.$emit('extend');
            }
          }, 0);
        }
      },
      immediate: true,
    },
    hasTradeLimitOpen(val) {
      if (val && this.currentSymbolCase) {
        this.getTradeLimitInfo(this.currentSymbolCase);
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
            symbolAll: this.$store.state.baseData.symbolAll,
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
      if (val && this.symbolAll) {
        this.getJz();
        // const sSymbolShowName = this.symbolAll[val].showName || val;
        const sSymbolShowName = this.symbolAll[val] ? this.symbolAll[val].showName : val;
        const sSymbol = sSymbolShowName.replace('/', '_');
        if (this.symbolAll[val] && this.symbolAll[val].etfOpen) {
          myStorage.set(this.markTitleClass, 'ETF');
        }
        this.$router.push(`/${this.routerPathClass}/${sSymbol}`);
        this.$bus.$emit('SYMBOL_CURRENT', val);
      }
      if (this.hasTradeLimitOpen) {
        const symbol = val.replace('/', '').toLocaleLowerCase();
        this.getTradeLimitInfo(symbol);
      }
      if (oldVla && this.MywebSocket) {
        if (this.oldMarket !== val.split('/')[1]) {
          // 如果 切换了市场 又切换了币对 就 停止 上一个币对的 24小时行情 send
          this.webSocketSend('Market', 'unsub', val, { [oldVla]: this.symbolAll[oldVla] });
        }
        // 停止 上一个币对的 实时成交 send
        this.webSocketSend('Trade', 'unsub', oldVla);
        // 发送 实时成交 数据 Send
        this.webSocketSend('Trade', 'req', val);
        this.webSocketSend('Trade', 'sub', val);
        // 取消订阅 上一个币对的K线数据
        this.webSocketKlineSend('unsub', oldVla, this.lastTimeS);
        // 发送 K线历史数据 send
        this.webSocketKlineSend('req', val, this.lastTimeS);
        // 发送 K线实时数据 send
        this.webSocketKlineSend('sub', val, this.lastTimeS);
        this.depthClasses = '0';
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
        this.webSocketSend('Review', null, this.symbolCurrent, this.symbolList);
        // 发送 24小时行情实时数据 Send
        this.webSocketSend('Market', 'sub', this.symbolCurrent, this.symbolList);
        // 发送 实时成交 数据 Send
        this.webSocketSend('Trade', 'req', this.symbolCurrent);
        this.webSocketSend('Trade', 'sub', this.symbolCurrent);
        // 发送 盘口深度数据 Send
        this.webSocketSend('Depth', 'sub', this.symbolCurrent, this.depthClasses);
        // 发送 K线历史数据 send
        this.webSocketKlineSend('req', this.symbolCurrent, this.lastTimeS);
        // 发送 K线实时数据 send
        this.webSocketKlineSend('sub', this.symbolCurrent, this.lastTimeS);
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
    // 监听K线刻度的变化
    lastTimeS(data, olddata) {
      // 取消订阅 上一个币对的K线数据
      this.webSocketKlineSend('unsub', this.symbolCurrent, olddata);
      // 发送 K线历史数据 send
      this.webSocketKlineSend('req', this.symbolCurrent, data);
      // 发送 K线实时数据 send
      this.webSocketKlineSend('sub', this.symbolCurrent, data);
    },
  },
  methods: {
    getJz() {
      let flag = false;
      clearInterval(this.etfTimer);
      if (this.symbolCurrent && this.symbolAll) {
        flag = !!(this.symbolAll[this.symbolCurrent] && this.symbolAll[this.symbolCurrent].etfOpen);
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
          // if (data.data.fundRate) {
          //   this.fundRate = data.data.fundRate;
          // }
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
          && !getCookie('etfDialog')) {
          this.etfDialog = true;
        }
      }
    },
    etfDialogConfirm() {
      this.etfDialog = false;
      setCookie('etfDialog', true);
    },
    hideTradeAlert() {
      this.tradeAlertState = false;
    },
    getTradeLimitInfo(symbol) {
      this.axios({
        url: 'order/trade_limit_info',
        params: {
          symbol,
        },
        method: 'post',
      }).then((res) => {
        if (res.code !== '0') return;

        const { data } = res;
        Object.keys(data).forEach((key) => {
          data[key] = Number(data[key]);
        });

        if (this.currentSymbolCase === symbol) {
          const sellInfo = Number(data.trade_limit_sell_info);
          const buyInfo = Number(data.trade_limit_buy_info);
          this.tradeLimitData = data;
          this.tradeAlertState = Boolean(sellInfo || buyInfo);
        }
      });
    },
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
        if (this.symbolAll[symbol] && this.symbolAll[symbol].etfOpen) {
          markTitleClassCion = 'ETF';
        }
        if (markTitleClassCion && symbolNameClassCion) {
          myStorage.set(this.markTitleClass, markTitleClassCion);
          myStorage.set(this.symbolNameClass, symbol);
        }
      } else {
        const sSymbolName = myStorage.get(this.symbolNameClass);
        if (sSymbolName) {
          const sSymbolShowName = this.symbolAll[sSymbolName] ? this.symbolAll[sSymbolName].showName : sSymbolName;
          const sSymbol = sSymbolShowName.replace('/', '_');
          this.$router.push(`/${this.routerPathClass}/${sSymbol}`);
        }
      }

      this.screenWidth = document.body.clientWidth;
      if (this.screenWidth <= this.mediaWidth) {
        this.shrink = true;
        this.marketShrink = true;
      }
      // 监听 窗口的大小改变
      this.$bus.$on('WINFOW_ON_RESIIZE', () => {
        // this.$bus.$emit('WINFOW_ON_RESIIZE', );
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
      });
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
    },
    listenBusEvent() {
      // 监听 市场切换

      this.$bus.$on('ON_MARKET_SWITCH', (data) => {
        this.marketCurrent = data;
      });
      // 监听 币对切换
      this.$bus.$on('ON_SYMBOL_SWITCH', (data) => {
        myStorage.set(this.markTitleClass, this.marketCurrent);
        myStorage.set(this.symbolNameClass, data);
        this.symbolCurrent = data;

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
      this.$bus.$on('LTIME', (data) => {
        this.lTime = data;
      });
      this.$bus.$on('LAST-TIMES', (data) => {
        this.lastTimeS = data;
      });
    },
    listenWSData(data) {
      const { type, WsData } = data;
      this.$bus.$emit(type, WsData);

      if (type === 'KLINE_DATA_REQ') {
        this.$store.dispatch('kLinwReqData', WsData);
      }
      if (type === 'KLINE_DATA_SUB') {
        this.$store.dispatch('kLinwSubData', WsData);
      }

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
    // 隐藏基本版 临时注释掉
    // type, symbolData, lastTimeS
    webSocketKlineSend() {
      // const lastTimeSval = lastTimeS === 'Line' ? '1min' : lastTimeS;
      // const arr = symbolData.split('/');
      // const symbol = `${arr[0].toLowerCase()}${arr[1].toLowerCase()}`;
      // this.worker.postMessage({
      //   type: 'WEBSOCKET_KLINE_SEND',
      //   data: {
      //     type,
      //     symbol,
      //     lastTimeS: lastTimeSval,
      //     lTime: this.lTime,
      //     number: 150,
      //   },
      // });
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
  },
};
