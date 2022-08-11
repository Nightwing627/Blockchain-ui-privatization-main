
// WS
import { mapState } from 'vuex';
import { myStorage } from '@/utils';
import worker from '@/utils/webWorker';
// mapState
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
      // window.onresize 延迟执行
      windowOnResizeFire: true,
      // 宽度分割
      mediaWidth: 1820,
      //
      coPublicInfo: null,
      // shuju
      marketData: null,
      // MywebSocket
      MywebSocket: null,
      // 当前市场
      marketCurrent: null,
      // 当前币对
      symbolCurrent: null,
      // 深度级别
      depthClasses: '0',
      // 深度值
      depthValue: 0,
      // 图表遮罩
      coverKlineBox: null,
      isFull: null,
      routeSymbol: this.$route.params.symbol,
      // H5当前模块 1:交易 2：K线 3：盘口 4：成交 5：委托
      activeTypeId: '1',
      // 是否显示币对列表
      isShowMarket: false,
    };
  },
  computed: {
    ...mapState({
      baseInfo({ baseData }) {
        if (baseData.coPublicInfo) {
          this.coPublicInfo = baseData.coPublicInfo;
          this.marketData = this.coPublicInfo.market;
          // 获取当前市场
          this.marketCurrent = myStorage.get('coMarkTitle');
          // 获取当前币对
          this.symbolCurrent = myStorage.get('coNowSymbol');
          return baseData.coPublicInfo;
        }
        return null;
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
    // 汇率单位
    rateData() {
      return this.$store.state.baseData.rate;
    },
    // 默认 获取 所有币对的
    symbolList() {
      if (this.marketData) {
        let arr = [];
        const obj = {};
        const marketKeys = Object.keys(this.marketData);
        marketKeys.forEach((item) => {
          arr = arr.concat(this.marketData[item]);
        });
        arr.forEach((k) => {
          obj[k.symbol] = k;
          obj[k.symbol].name = k.symbol;
          obj.tradeType = 'contract';
        });
        this.$bus.$emit('SYMBOL_LIST_ALL', obj);
        return obj;
      }
      return null;
    },
    symbolCurrentInfo() {
      if (this.symbolList && this.symbolCurrent) {
        return this.symbolList[this.symbolCurrent];
      }
      return null;
    },
    // H5 底部导航
    navList() {
      const arr = [
        {
          // 交易
          navText: this.$t('h5Add.tradeList1'),
          id: '1',
          classes: 'cc',
        },
        {
          // K线
          navText: this.$t('h5Add.tradeList2'),
          id: '2',
        },
        {
          // '盘口'
          navText: this.$t('contract.handicap'),
          id: '3',
        },
        {
          // 成交
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
  },
  beforeDestroy() {
    this.$bus.$emit('htmlScroll', true);
  },
  watch: {
    isShowMarket(v) {
      if (v) {
        this.$bus.$emit('htmlScroll', false);
      } else {
        this.$bus.$emit('htmlScroll', true);
      }
    },
    // 监听 获取到数据
    coPublicInfo(val) {
      if (val.wsUrl) {
        // 创建WS
        this.worker.postMessage({
          type: 'CREAT_WEBSOCKET',
          data: {
            wsUrl: val.wsUrl,
            lan: this.$store.state.baseData.lan,
            rate: this.rateData,
            symbolAll: this.symbolList,
          },
        });
      }
    },
    // 监听 当前选中货币对的改变
    symbolCurrent(val, oldVla) {
      if (val) {
        const sSymbol = val.replace('/', '_');
        this.$router.push(`/trade/${sSymbol}`);
        this.$bus.$emit('SYMBOL_CURRENT', val);
      }

      if (oldVla && this.MywebSocket) {
        // 停止 上一个币对的 实时成交 send
        this.webSocketSend('Trade', 'unsub', oldVla);
        // 发送 盘口深度数据 Send
        this.webSocketSend('Depth', 'unsub', oldVla, '0');
        // 发送 实时成交 数据 Send
        this.webSocketSend('Trade', 'req', val);
        this.webSocketSend('Trade', 'sub', val);
        // 发送 盘口深度 数据 Send
        this.webSocketSend('Depth', 'sub', val, '0');
      }
    },
    // 监听 webSocket 创建成功
    MywebSocket(val) {
      if (val) {
        // 发送 24小时行情历史数据 Send
        this.webSocketSend('Market', 'sub', this.symbolCurrent, this.symbolList);
        // // 发送 实时成交 数据 Send
        this.webSocketSend('Trade', 'req', this.symbolCurrent);
        this.webSocketSend('Trade', 'sub', this.symbolCurrent);
        // // 发送 盘口深度数据 Send
        this.webSocketSend('Depth', 'sub', this.symbolCurrent, 0);
      }
    },
    // 当前币对的信息数据
    symbolCurrentInfo(val) {
      this.$bus.$emit('SYMBOL_CURRENT_INFO', val);
    },
  },
  methods: {
    mountedInit() {
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
    init() {
      if (this.routeSymbol) {
        myStorage.set('coMarkTitle', this.routeSymbol.split('_')[1]);
        myStorage.set('coNowSymbol', this.routeSymbol);
      } else {
        const sSymbolName = myStorage.get('coNowSymbol');
        const sSymbol = sSymbolName;
        this.$router.push(`/trade/${sSymbol}`);
      }
      this.listenBusEvent();
      // 监听处理好的数据
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
    // H5 头部 币对点击打开市场列表
    headerClickEvent() {
      this.isShowMarket = !this.isShowMarket;
    },
    listenBusEvent() {
      // H5 监听 头部币对的点击事件
      this.$bus.$on('HEADER-CLICK-EVENT', this.headerClickEvent);
      // 监听 市场切换
      this.$bus.$on('ON_MARKET_SWITCH', (data) => {
        this.marketCurrent = data;
        myStorage.set('coMarkTitle', data);
      });
      // 监听 市场切换
      this.$bus.$on('ON_MARKET_SWITCH_ORDER', (data) => {
        this.marketCurrent = data;
        myStorage.set('coMarkTitle', data);
      });
      // 监听 币对切换
      this.$bus.$on('ON_SYMBOL_SWITCH', (data) => {
        myStorage.set('coNowSymbol', data);
        this.symbolCurrent = data;
        this.isShowMarket = false;
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
        },
      });
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
    shrinkBlock() {
      this.marketShrink = !this.marketShrink;
    },
    serachShrinkBlock() {
      this.marketShrink = false;
    },
    // H5 底部的导航点击事件
    bottomNavClick(data) {
      this.isShowMarket = false;
      this.activeTypeId = data.id;
      this.$bus.$emit('ACTIVE_TYPE_ID', this.activeTypeId);
    },
  },

};
