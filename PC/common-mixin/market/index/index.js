import { mapState } from 'vuex';
import worker from '@/utils/webWorker';
import {
  myStorage, getCoinShowName,
} from '@/utils';

export default {
  data() {
    return {
      // 市场数据
      marketData: null,
      // MywebSocket
      MywebSocket: null,
      // 当前市场
      marketCurrent: null,
      // 当前币对
      symbolCurrent: null,
      // 当前币对列表
      symbolCurrentList: [],
      // 筛选 货币对
      listfilter: null,
      // 表格加载LOADING
      tableLoading: false,
      // 表格 超过 20条出现滚动条
      lineNumber: 20,
      // 24小时行情WS数据
      marketDataObj: [],
      marketDataList: [],
      // 推荐位数据
      recommendDataList: {},
      klineDataList: {},
      // 自选币对
      mySymbolList: myStorage.get('mySymbol') || [],
      setMyMarketSwitch: true,
      // 是否显示左侧数据栏
      isShowRecommend: true,

    };
  },
  computed: {
    coinTagLangs() {
      return this.$store.state.baseData.coinTagLangs;
    },
    coinTagOpen() {
      return this.$store.state.baseData.coin_tag_open;
    },
    ...mapState({
      baseInfo({ baseData }) {
        this.marketData = baseData.market;
        // 获取当前市场
        this.marketCurrent = myStorage.get('homeMarkTitle');
        // 获取当前币对
        this.symbolCurrent = myStorage.get('sSymbolName');
        return baseData;
      },
    }),
    // WS worker
    worker() {
      return worker();
    },
    // 全部 货币对
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },
    // 当前市场列表
    currentMarketList() {
      return this.marketData ? this.marketData.market : null;
    },
    coinList() {
      if (this.$store.state.baseData.market) {
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
      if (this.currentMarketList && this.marketCurrent) {
        return this.currentMarketList[this.marketCurrent];
      }
      return null;
    },
    // 汇率单位
    rateData() {
      return this.$store.state.baseData.rate;
    },
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    optionalSymbolServerOpen() {
      return this.$store.state.baseData.optional_symbol_server_open;
    },
  },
  watch: {
    symbolList(val, oldVal) {
      if (oldVal) {
        this.webSocketSend('Market', 'unsub', this.symbolCurrent, oldVal);
        this.webSocketSend('Market', 'sub', this.symbolCurrent, val);
      }
    },
    // 监听 是否登录
    isLogin(val) {
      if (val) {
        this.mySymbolList = myStorage.get('mySymbol') || [];
      }
    },
    // 监听获取到 market 接口的数据
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
    // 监听 webSocket 创建成功
    MywebSocket(val) {
      if (val) {
        // 发送 24小时行情历史数据 Send
        this.webSocketSend('Review', null, this.symbolCurrent, this.symbolAll);
        // 发送 24小时行情实时数据 Send
        this.webSocketSend('Market', 'sub', this.symbolCurrent, this.symbolList);
        // 发送 推荐位 kline数据 Send
        if (this.symbolCurrent) {
          this.klneSend();
        }
      }
    },
    symbolCurrent(val, oldVal) {
      if (val && this.MywebSocket) {
        this.isShowRecommend = true;
        this.klneSend(oldVal);
      }
    },
    mySymbolList(val) {
      if (val) {
        this.$bus.$emit('MYSYMBOL-LIST', val);
      }
    },
  },
  beforeDestroy() {
    this.webSocketSend('Market', 'unsub', this.symbolCurrent, this.symbolList);
    window.onscroll = null;
  },
  methods: {
    init() {
      this.onmessageWorker();
      // 监听 市场切换
      this.$bus.$on('SWITCH-MARKET', (data) => {
        this.marketCurrent = data;
        this.setMarketData();
      });
      this.$bus.$on('SWITCH-STORE', (data) => {
        this.setMyMarket(data);
        this.setMarketData();
      });
      this.$bus.$on('SWITCH-SYMBOL', (data) => {
        this.symbolCurrent = data;
        this.setRecommendData();
      });
      this.$bus.$emit('MYSYMBOL-LIST', this.mySymbolList);
      // 监听 窗口的大小改变
      this.$bus.$on('WINFOW_ON_RESIIZE', () => {
        this.isShowRecommend = true;
      });
    },
    klneSend(oldVal) {
      const symbolArr = this.symbolCurrent.toLowerCase().split('/');
      const symbol = symbolArr[0] + symbolArr[1];
      if (oldVal) {
        const oldSymbolArr = oldVal.toLowerCase().split('/');
        const oldSsymbol = oldSymbolArr[0] + oldSymbolArr[1];
        this.worker.postMessage({
          type: 'WEBSOCKET_KLINE_SEND',
          data: {
            symbol: oldSsymbol,
            type: 'unsub',
            lastTimeS: '1min',
          },
        });
      }
      this.worker.postMessage({
        type: 'WEBSOCKET_KLINE_SEND',
        data: {
          symbol,
          type: 'req',
          lastTimeS: '1min',
          lTime: false,
          number: 100,
          symbolCurrent: this.symbolCurrent,
        },
      });
      this.worker.postMessage({
        type: 'WEBSOCKET_KLINE_SEND',
        data: {
          symbol,
          type: 'sub',
          lastTimeS: '1min',
          lTime: false,
          symbolCurrent: this.symbolCurrent,
        },
      });
    },
    onmessageWorker() {
      this.worker.onmessage = (event) => {
        const { data } = event;
        // 监听 WebSocket 链接成功
        if (data.type === 'WEBSOCKET_ON_OPEN') {
          this.MywebSocket = data.data.type;
        }
        // 监听 WS 数据
        if (data.type === 'WEBSOCKET_DATA') {
          this.listenWSData(data.data);
        }
      };
    },
    // 监听 WS 返回的数据
    listenWSData(data) {
      const { type, WsData } = data;
      // 24小时行情数据
      if (type === 'MARKET_DATA') {
        this.marketDataObj = WsData;
        this.setMarketData();
        this.setRecommendData();
      }
      if (type.indexOf('KLINE_DATA') > -1) {
        const [, symbolType] = WsData.channel.split('_');
        const key = this.symbolCurrent;
        const symbolArr = this.symbolCurrent.toLowerCase().split('/');
        const symbol = symbolArr[0] + symbolArr[1];
        if (symbol === symbolType) {
          if (WsData.event_rep === 'rep') {
            const kData = WsData.data;

            this.klineDataList[key] = [];
            const lengthNumber = kData.slice(-20);
            lengthNumber.forEach((item) => {
              this.klineDataList[key].push([
                item.id,
                item.close,
              ]);
            });
          } else {
            const kData = WsData.tick;
            const keyYs = this.klineDataList[key] || [];
            const lengths = keyYs.length;
            if (this.klineDataList[key].length) {
              const lastId = this.klineDataList[key][lengths - 1][0];
              if (lastId === kData.id) {
                this.klineDataList[key].pop();
              }
              if (this.klineDataList[key].length > 20) {
                this.klineDataList[key].shift();
              }
              if (lastId <= kData.id) {
                this.klineDataList[key].push([
                  kData.id,
                  kData.close,
                ]);
              }
            }
          }
        }
        this.$bus.$emit('RECOMMEEND_KLINE_DATA', this.klineDataList);
      }
    },
    // 发送 Send
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
    // 格式化 推荐位的 K线数据
    setRecommendData() {
      if (this.marketDataObj && this.marketDataObj[this.symbolCurrent]) {
        this.$bus.$emit('RECOMMEEND_DATA', this.marketDataObj[this.symbolCurrent]);
      }
    },
    getCoinLabel(name, coinList = {}) {
      if (coinList && coinList[name.toUpperCase()]) {
        const { coinTag = '' } = coinList[name.toUpperCase()];
        return coinTag ? this.coinTagLangs[coinTag] : '';
      }

      return '';
    },
    // 格式化 推荐位的24小时行情数据
    setMarketData() {
      if (!this.symbolList) return;
      const marketDataList = [];
      const keyarr = Object.keys(this.symbolList);
      keyarr.forEach((item) => {
        if (this.symbolList[item].newcoinFlag) {
          this.newcoinFlag = true;
        }
        const itemData = this.marketDataObj[item];
        if (itemData) {
          const showName = getCoinShowName(itemData.name, this.symbolAll);
          const coinLabel = this.getCoinLabel(itemData.symbol.symbol, this.coinList);
          let iconSvg = `<span>${showName}</span>`;
          if (coinLabel && this.coinTagOpen) {
            const str = `<div class="coin-label">
              <span class="coin-text a-12-cl">${coinLabel}</span>
              <span class="coin-bg a-12-bg"></span>
            </div>`;
            iconSvg = `${iconSvg}${str}`;
          }
          marketDataList.push({
            isShow: this.symbolList[item].isShow,
            id: itemData.name,
            showName,
            data: [
              [
                {
                  iconSvg: this.myMarketIcon(itemData.name),
                  type: 'icon',
                  eventType: 'store',
                },
                {
                  iconSvg,
                  type: 'icon',
                  eventType: 'symbol',
                  classes: 'symbolName',
                  sortVal: itemData.sort,
                  key: 'sort',
                },
              ],
              [
                {
                  text: itemData.close.data,
                  classes: ['fontSize14'],
                  sortVal: itemData.closes,
                  key: 'closes',
                  subContent: {
                    text: itemData.close.price !== '--' ? `≈ ${itemData.close.price}` : itemData.close.price,
                    classes: ['b-2-cl'], // 默认没有
                  },
                },
              ],
              [
                {
                  type: 'label',
                  text: itemData.rose.data,
                  sortVal: itemData.roses,
                  key: 'roses',
                  classes: this.itemRoseClass(itemData.rose),
                },
              ],
              [
                {
                  text: itemData.high,
                },
              ],
              [
                {
                  text: itemData.low,
                },
              ],
              [
                {
                  text: itemData.vol,
                },
              ],
              [
                {
                  text: itemData.amount,
                },
              ],
            ],
          });
        }
      });
      this.marketDataList = marketDataList.sort((a, b) => a.sort - b.sort);
    },
    // 设置币对是否收藏的ICON
    myMarketIcon(symbol) {
      if (this.mySymbolList.indexOf(symbol) === -1) {
        return `<svg class="icon icon-16" aria-hidden="true">
                <use xlink:href="#icon-c_11">
              </use></svg>`;
      }
      return `<svg class="icon icon-16" aria-hidden="true">
                <use xlink:href="#icon-c_11_1">
              </use></svg>`;
    },
    // 设置 自选币对
    setMyMarket(symbol) {
      let url = this.$store.state.url.common.optional_symbol;
      if (this.optionalSymbolServerOpen === 1) {
        url = this.$store.state.url.common.optional_symbols;
      }
      // 防止重复点击
      if (!this.setMyMarketSwitch) return;
      this.setMyMarketSwitch = false;

      let mySymbol = myStorage.get('mySymbol') || [];
      let addOrDelete = true;
      if (mySymbol.length && mySymbol.indexOf(symbol) > -1) {
        mySymbol = mySymbol.filter((item) => item !== symbol);
        addOrDelete = false;
      } else {
        mySymbol.push(symbol);
        addOrDelete = true;
      }
      if (this.optionalSymbolServerOpen === 1 && this.isLogin) {
        this.axios({
          url,
          headers: {},
          params: {
            operationType: addOrDelete === true ? '1' : '2', // 0批量添加 1单个添加 2单个删除
            symbols: symbol,
          },
          method: 'post',
        }).then((data) => {
          if (data.code === '0') {
            this.setMyMarketSwitch = true;
            this.mySymbolList = mySymbol;
            myStorage.set('mySymbol', mySymbol);
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      } else {
        this.setMyMarketSwitch = true;
        this.mySymbolList = mySymbol;
        myStorage.set('mySymbol', mySymbol);
      }
    },
    // 24小时行情 涨跌幅 的背景、样色的class
    itemRoseClass(rose) {
      let bgClass = null;
      if (rose.class === 'u-1-cl') {
        bgClass = 'rose-label u-3-bg';
      } else if (rose.class === 'u-4-cl') {
        bgClass = 'rose-label u-6-bg';
      }
      return [rose.class, bgClass];
    },
    closeRecommend() {
      this.isShowRecommend = false;
    },
  },
};
