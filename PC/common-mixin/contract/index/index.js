import futureWorker from '@/utils/futureWorker';

export default {
  name: 'trade',
  data() {
    return {
      // 数据
      marketData: null,
      // MywebSocket
      MywebSocket: null,
      // 深度值
      depthValue: 0,
      // 图表遮罩
      coverKlineBox: null,
      // 开通合约交易弹框
      openFuturesDialogShow: false,
      // 交易喜好设置弹框
      setFuturesDialogShow: false,
      // 计算器弹框
      calculatorDialogShow: false,
      // 轮训
      getPositionTimer: null,
      // 下单选择类型弹框是否显示
      subOtderTypeShow: null,
    };
  },
  computed: {
    worker() {
      return futureWorker();
    },
    // 是否Login
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    // WS URL
    wsUrl() {
      return this.$store.state.future.wsUrl || null;
    },
    // 用户配置信息
    userConfig() {
      return this.$store.state.future.futureUserConfig;
    },
    // 合约币对列表
    contractSymbolList() {
      return this.$store.state.future.contractSymbolList;
    },
    // 是否开通了合约交易
    openContract() {
      return this.$store.state.future.openContract;
    },
    // 当前币对小写带类型
    symbolCurrent() {
      return this.$store.state.future.coTypeSymbol;
    },
    contractName() {
      return this.$store.state.future.contractName || '';
    },
  },
  watch: {
    // wsUrl
    wsUrl(val, old) {
      if (val && !old) {
        this.worker.postMessage({
          type: 'CREAT_WEBSOCKET',
          data: {
            wsUrl: val,
            lan: this.$store.state.baseData.lan,
            rate: '',
            symbolAll: {},
          },
        });
      }
    },
    // 监听 用户配置信息
    openContract(val) {
      if (!val) {
        this.openFuturesDialogShow = true;
      }
    },
    // 监听 当前选中货币对的改变
    contractName(val) {
      if (val) {
        this.$router.push(`/trade/${val}`);
        this.$bus.$emit('SYMBOL_CURRENT', val);
      }
    },
    symbolCurrent(val, oldVla) {
      if (oldVla && this.MywebSocket) {
        // 停止 上一个币对的 实时成交 send
        this.webSocketSend('Trade', 'unsub', oldVla);
        // 发送 实时成交 数据 Send
        this.webSocketSend('Trade', 'req', val);
        this.webSocketSend('Trade', 'sub', val);
        // 停止 盘口深度数据 Send
        this.webSocketSend('Depth', 'unsub', oldVla, this.depthValue);
        // 发送 盘口深度 数据 Send
        this.webSocketSend('Depth', 'sub', val, this.depthValue);
      }
    },
    // 监听 webSocket 创建成功
    MywebSocket(val) {
      if (val) {
        // 发送 24小时行情历史数据 Send
        this.webSocketSend('Review');
        // 发送 24小时行情实时数据 Send
        this.webSocketSend('Market', 'sub', this.symbolCurrent, this.contractSymbolList);
        // 发送 盘口深度数据 Send
        this.webSocketSend('Depth', 'sub', this.symbolCurrent, this.depthValue);

        // // 发送 实时成交 数据 Send
        this.webSocketSend('Trade', 'req', this.symbolCurrent);
        this.webSocketSend('Trade', 'sub', this.symbolCurrent);
      }
    },
    // 深度值切换
    depthValue(val, old) {
      if (old) {
        this.webSocketSend('Depth', 'unsub', this.symbolCurrent, old);
      }
      this.webSocketSend('Depth', 'sub', this.symbolCurrent, val);
    },
  },
  methods: {
    init() {
      // 轮训获取数据
      this.intervalGetData();
      // 获取worker信息
      this.worker.onmessage = (event) => {
        const { data } = event;
        // 监听 WebSocket 链接成功
        if (data.type === 'WEBSOCKET_ON_OPEN') {
          this.MywebSocket = null;
          this.MywebSocket = data.data.type;
          this.$bus.$emit('WEBSOCKET_ON_OPEN', this.MywebSocket);
        }
        // 监听 WS 数据
        if (data.type === 'WEBSOCKET_DATA') {
          this.listenWSData(data.data);
        }
      };
      this.listenBusEvent();
    },
    listenBusEvent() {
      if (this.wsUrl) {
        this.worker.postMessage({
          type: 'CREAT_WEBSOCKET',
          data: {
            wsUrl: this.wsUrl,
            lan: this.$store.state.baseData.lan,
            rate: '',
            symbolAll: {},
          },
        });
      }
      // 显示开通合约弹框
      this.$bus.$on('OPEN_FUTURE', () => {
        this.openFuturesDialogShow = true;
      });
      // 显示偏好设置弹框
      this.$bus.$on('SET_FUTURE_CONFIG', () => {
        if (this.isLogin && this.openContract) {
          this.$store.dispatch('getUserConfig');
        }
        this.setFuturesDialogShow = true;
      });
      // 显示计算器弹框
      this.$bus.$on('OPEN_CALCULATOR_DIALOG', () => {
        this.calculatorDialogShow = true;
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
    // 分发WS数据
    listenWSData(data) {
      const { type, WsData } = data;
      this.$bus.$emit(type, WsData);
    },
    webSocketSend(type, sendType, symbolData, symbolList) {
      this.worker.postMessage({
        type: 'WEBSOCKET_SEND',
        data: {
          type,
          sendType,
          symbolData,
          symbolList,
          depthValue: 0,
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
      if (e.target
        && e.target.className
        && e.target.className.indexOf
        && e.target.className.indexOf('ac-type') > -1) {
        this.subOtderTypeShow = e.target.nextElementSibling;
      } else if (this.subOtderTypeShow) {
        this.subOtderTypeShow.style.display = 'none';
        this.subOtderTypeShow = null;
      }
    },
    // 关闭弹窗
    closeDialog() {
      // 关闭开通合约交易弹框
      this.openFuturesDialogShow = false;
      // 关闭喜好设置弹框
      this.setFuturesDialogShow = false;
      // 关闭计算器弹框
      this.calculatorDialogShow = false;
    },
    intervalGetData() {
      // 获取用户持仓和资产列表
      clearInterval(this.getPositionTimer);
      this.getPositionTimer = setInterval(() => {
        if (this.isLogin && this.openContract) {
          this.$store.dispatch('getPositionList');
          this.$store.dispatch('getUserOrderCount');
        } else {
          clearInterval(this.getPositionTimer);
          this.getPositionTimer = null;
        }
      }, 5000);
    },
  },
  destroyed() {
    this.$bus.$off('OPEN_FUTURE');
    this.$bus.$off('SET_FUTURE_CONFIG');
    this.$bus.$off('OPEN_CALCULATOR_DIALOG');
    this.$bus.$off('DEPTH_VALUE');
    this.$bus.$off('WEBSOCKET_KLINE_SEND');
    clearInterval(this.getPositionTimer);
    this.getPositionTimer = null;
  },
};
