import { mapState } from 'vuex';
import {
  myStorage, imgMap, colorMap, getCoinShowName,
} from '@/utils';
import worker from '@/utils/webWorker';

export default {
  data() {
    return {
      krwCheck: false, // krw 弹窗下次不再提示
      krwFlag: false, // krw 弹窗
      krwBg: `background: url(${imgMap.krwhomebg})`,
      // 首页轮播图的 宽和高
      styles: {
        width: '100%',
        height: '580px',
        backgroundColor: colorMap['c-3-bg'],
      },
      stylesHeight: '580',
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
      // 首页 轮播图
      slideList: [],
      // 首页 轮播图-文案
      slideListTitle: {
        title: '',
        subTitle: '',
      },
      // 首页 公告数据
      noticeList: [],
      // 24小时行情WS数据
      marketDataObj: [],
      marketDataList: [],
      // 推荐位数据
      recommendDataList: {},
      klineDataList: {},
      // 自选币对
      mySymbolList: myStorage.get('mySymbol') || [],
      setMyMarketSwitch: true,
      // class
      photoAppShow: false,
      productShow: false,
      homeEditReady: false,
      home_edit_html: '',
      moreButtonImg1: `background: url(${imgMap.ggicon})`,
      moreButtonImg2: `background: url(${imgMap.ggicon_h})`,
      moreButtonImg3: `background: url(${imgMap.om_gg})`,
      registerInfo: '',
      instruments: [], // 合约列表
      tabType: 'USD',
      coHeaderSymbol: [],
    };
  },
  computed: {
    coinTagLangs() {
      return this.$store.state.baseData.coinTagLangs;
    },
    coinTagOpen() {
      return this.$store.state.baseData.coin_tag_open;
    },
    optionalSymbolServerOpen() {
      return this.$store.state.baseData.optional_symbol_server_open;
    },
    appDownload() {
      return this.$store.state.baseData.app_download;
    },
    index_international_open() {
      return this.$store.state.baseData.index_international_open;
    },
    storeKrwFlag() {
      return this.$store.state.baseData.krwFlag;
    },
    coinsKrwOpen() {
      return this.$store.state.baseData.index_layer_open;
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
    imgClass() {
      const style = {
        bgIcon: {
          backgroundImage: `url(${imgMap.home_edit_icon})`,
        },
        bgImg: {
          background: `url(${imgMap.home_edit_bg}) 0 bottom repeat-x #0E1A2E`,
        },
        homeEditImga: {
          backgroundImage: `url(${imgMap.home_edit_imga})`,
        },
        homeEditImgb: {
          backgroundImage: `url(${imgMap.home_edit_imgb})`,
        },
      };
      return style;
    },
    // 推荐位 币对
    headerSymbol() {
      if (this.marketData) {
        return this.marketData.headerSymbol;
      }
      return [];
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
    // WS worker
    worker() {
      return worker();
    },
    // 汇率单位
    rateData() {
      return this.$store.state.baseData.rate;
    },
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    isCoOpen() {
      const base = this.$store.state.baseData.publicInfo;
      if (base && base.switch && base.switch.indep_co_switch === '1') {
        return true;
      }
      return false;
    },
  },
  watch: {
    coinsKrwOpen(v) {
      if (v === 1 && this.storeKrwFlag) {
        if (!localStorage.krwCheck) {
          this.krwFlag = true;
        }
      }
    },
    symbolList(val, oldVal) {
      if (oldVal) {
        const oldValKey = Object.keys(oldVal);
        const objData = {};
        oldValKey.forEach((item) => {
          if (this.headerSymbol.indexOf(item) < 0 && oldVal[item]) {
            objData[item] = oldVal[item];
          }
        });
        this.webSocketSend('Market', 'unsub', this.symbolCurrent, objData);
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
      if (val.wsUrl && !this.isCoOpen) {
        const exParmas = {
          type: 'CREAT_WEBSOCKET',
          data: {
            wsUrl: val.wsUrl,
            lan: this.$store.state.baseData.lan,
            rate: this.rateData,
            symbolAll: this.symbolAll,
          },
        };
        // 创建WS
        this.worker.postMessage(exParmas);
      }
    },
    instruments(val) {
      if (val && this.marketData && this.marketData.wsUrl) {
        // 创建WS
        this.worker.postMessage({
          type: 'CREAT_CO_WEBSOCKET',
          data: {
            wsUrl: this.marketData.wsUrl,
            // wsUrl: 'wss://ws3.dcmex.com/wsswap/realTime',
            lan: this.$store.state.baseData.lan,
            rate: this.rateData,
            symbolAll: this.instruments,
          },
        });
      }
    },
    // 监听 webSocket 创建成功
    MywebSocket(val) {
      if (val) {
        if (this.isCoOpen) {
          // 发送 数据 Send
          const arr = ['OrderBook:2', 'QuoteBin5m:2'];
          this.webSocketCoSend('CoReview', null, this.tabType, arr);
          // 发送kline实时数据合约
          if (this.coHeaderSymbol.length) {
            const args = [];
            this.coHeaderSymbol.forEach((item) => {
              args.push(`QuoteBin30m:${item.instrument_id}`);
            });
            this.worker.postMessage({
              type: 'WEBSOCKET_KLINE_CO_SEND',
              data: {
                args,
              },
            });
          }
        } else {
          const symbolListKey = Object.keys(this.symbolList);
          const objData = {};
          symbolListKey.forEach((item) => {
            objData[item] = this.symbolList[item];
          });
          this.headerSymbol.forEach((item) => {
            if (symbolListKey.indexOf(item) < 0 && this.symbolAll[item]) {
              objData[item] = this.symbolAll[item];
            }
          });

          // 发送 24小时行情历史数据 Send
          this.webSocketSend('Review', null, this.symbolCurrent, this.symbolAll);
          // 发送 24小时行情实时数据 Send
          this.webSocketSend('Market', 'sub', this.symbolCurrent, objData);
          // 发送 推荐位 kline数据 Send
          if (this.headerSymbol.length) {
            this.headerSymbol.forEach((item) => {
              const symbolArr = item.toLowerCase().split('/');
              const symbol = symbolArr[0] + symbolArr[1];
              this.worker.postMessage({
                type: 'WEBSOCKET_KLINE_SEND',
                data: {
                  symbol,
                  type: 'req',
                  lastTimeS: '1min',
                  lTime: false,
                  number: 100,
                  symbolCurrent: item,
                },
              });
              this.worker.postMessage({
                type: 'WEBSOCKET_KLINE_SEND',
                data: {
                  symbol,
                  type: 'sub',
                  lastTimeS: '1min',
                  lTime: false,
                  symbolCurrent: item,
                },
              });
            });
          }
        }
      }
    },
  },
  methods: {
    getCoMarketData() {
      this.axios({
        url: 'swap/instruments',
        headers: {},
        method: 'get',
        hostType: 'fe-cov2-api',
      }).then((data) => {
        if (data.errno === 'OK') {
          this.instruments = [...data.data.instruments];
          this.instruments.forEach((item) => {
            if (item.quote_coin === 'USDT') {
              this.$bus.$emit('COMARGET_SWITCH', 'USDT');
            }
            if (item.quote_coin === 'USD') {
              this.$bus.$emit('COMARGET_SWITCH', 'USD');
            }
          });
          if (this.instruments.length >= 6) {
            this.coHeaderSymbol = [...this.instruments.slice(0, 6)];
          } else {
            this.coHeaderSymbol = [...this.instruments];
          }
          this.$bus.$emit('COHEADER_SYMBOL', this.coHeaderSymbol);
          // 获取Kline历史数据
          this.getKhistory();
        }
      });
    },
    getCoinLabel(name, coinList = {}) {
      if (coinList && coinList[name.toUpperCase()]) {
        const { coinTag = '' } = coinList[name.toUpperCase()];
        return coinTag ? this.coinTagLangs[coinTag] : '';
      }

      return '';
    },
    init() {
      if (this.coinsKrwOpen === 1 && this.storeKrwFlag) {
        if (!localStorage.krwCheck) {
          this.krwFlag = true;
        }
      }
      this.onmessageWorker();
      this.getLundata();
      // 监听 市场切换
      this.$bus.$on('SWITCH-MARKET', (data) => {
        this.marketCurrent = this.isCoOpen ? data.type : data;
        this.setMarketData();
      });
      this.$bus.$on('SWITCH-STORE', (data) => {
        this.setMyMarket(data);
        this.setMarketData();
      });
      if (this.isCoOpen) {
        this.getCoMarketData();
      }
    },
    goRegister() {
      if (this.registerInfo) {
        this.$router.push(`/register?email=${this.registerInfo}`);
      }
    },
    goPage(path) {
      this.$router.push(`/${path}`);
    },
    download(type) {
      window.open(this.appDownload[`${type}_download_url`]);
    },
    registerChange(val) {
      this.registerInfo = val;
    },
    krwCheckClick() {
      this.krwCheck = !this.krwCheck;
    },
    krwClose() {
      this.krwFlag = false;
      this.$store.dispatch('setKrwFlag');
    },
    krwConfrim() {
      this.krwFlag = false;
      this.$store.dispatch('setKrwFlag');
      if (this.krwCheck) {
        localStorage.krwCheck = true;
      }
    },
    getIconImg(val) {
      return `background:url(${imgMap[`home_edit_icon${val}`]})`;
    },
    // 公告更多跳转
    btnLink() {
      this.$router.push('/noticeInfo');
    },
    onScrollHandle() {
      window.onscroll = () => {
        if (!this.productShow) {
          const WH = window.innerHeight;
          const photoAppTop = this.$refs.photoApp.getBoundingClientRect().y;
          const productTop = this.$refs.product.getBoundingClientRect().y;
          if (WH - photoAppTop > 300) {
            this.photoAppShow = true;
          }
          if (WH - productTop > 200) {
            this.productShow = true;
          }
        } else {
          window.onscroll = null;
        }
      };
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
        const marketArr = Object.keys(this.marketDataObj);
        if (this.isCoOpen) {
          if (marketArr.length === this.instruments.length) {
            this.setMarketData();
            this.setRecommendData();
          }
        } else {
          this.setMarketData();
          this.setRecommendData();
        }
      }
      if (type.indexOf('KLINE_DATA') > -1) {
        if (this.headerSymbol.length && !this.isCoOpen) {
          this.headerSymbol.forEach((key) => {
            const [, symbolType] = WsData.channel.split('_');
            const symbolArr = key.toLowerCase().split('/');
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
                  this.klineDataList[key].push([
                    kData.id,
                    kData.close,
                  ]);
                }
              }
            }
          });
          this.$bus.$emit('RECOMMEEND_KLINE_DATA', this.klineDataList);
        }
        if (this.isCoOpen) {
          const kData = WsData;
          const wsId = kData.group.charAt(kData.group.length - 1);
          this.coHeaderSymbol.forEach((item) => {
            const keyYs = this.klineDataList[item.symbol] || [];
            const lengths = keyYs.length;
            const lastId = this.klineDataList[item.symbol][lengths - 1][0];
            if (this.klineDataList[item.symbol].length) {
              if (Number(lastId) === Number(wsId)) {
                this.klineDataList[item.symbol].pop();
                if (this.klineDataList[item.symbol].length > 30) {
                  this.klineDataList[item.symbol].shift();
                }
                const { close, timestamp } = kData.data[0];
                this.klineDataList[item.symbol].push([
                  timestamp,
                  close,
                ]);
              }
            }
          });
          this.$bus.$emit('RECOMMEEND_KLINE_DATA', this.klineDataList);
        }
      }
    },
    // 发送 Send
    webSocketSend(type, sendType, symbolData, symbolList) {
      if (this.isCoOpen) return;
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
    // 发送 CoSend
    webSocketCoSend(type, sendType, symbolData, symbolList) {
      this.worker.postMessage({
        type: 'WEBSOCKET_CO_SEND',
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
      if (this.headerSymbol.length && !this.isCoOpen) {
        this.headerSymbol.forEach((item) => {
          this.recommendDataList[item] = {};
          if (this.marketDataObj && this.marketDataObj[item]) {
            this.recommendDataList[item] = this.marketDataObj[item];
          }
        });
        this.$bus.$emit('RECOMMEEND_DATA', this.recommendDataList);
      }
      if (this.isCoOpen) {
        if (this.coHeaderSymbol.length) {
          this.coHeaderSymbol.forEach((item) => {
            if (this.marketDataObj && this.marketDataObj[item.symbol]) {
              this.recommendDataList[item.symbol] = this.marketDataObj[item.symbol];
            }
          });
          this.$bus.$emit('RECOMMEEND_DATA', this.recommendDataList);
        }
      }
    },
    // 格式化 推荐位的24小时行情数据
    setMarketData() {
      if (this.isCoOpen) {
        const marketDataList = [];
        const USTDinstruments = this.instruments.filter((item) => item.quote_coin === 'USDT');
        const USTinstruments = this.instruments.filter((item) => item.quote_coin === 'USD');
        const typeData = this.marketCurrent === 'USD' ? USTinstruments : USTDinstruments;
        typeData.forEach((item) => {
          const itemData = this.marketDataObj[item.symbol];
          if (itemData) {
            const showName = itemData.name.split('/')[0] || itemData.name;
            const iconSvg = `<span>${showName}</span>`;
            // const name = item.name;
            marketDataList.push({
              isShow: true,
              id: item.symbol,
              showName,
              data: [
                [
                  {
                    iconSvg: '',
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
        this.marketDataList = marketDataList;
      } else {
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
      }
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
    // 获取 首页数据(公告、轮播图)
    getLundata() {
      const dataObj = {};
      if (this.$route.query && this.$route.query.preview && this.$route.query.homeBoard) {
        dataObj.preview = Number(this.$route.query.preview) > 1 ? 0
          : Number(this.$route.query.preview);
        dataObj.homeBoard = Number(this.$route.query.homeBoard);
        // if (this.$route.query.homeBoard === '20200216') {
        //   dataObj = {};
        // }
      }
      this.axios({
        url: this.$store.state.url.common.index_data,
        headers: {},
        params: dataObj,
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          // 首页轮播图
          const { cmsAdvertList, noticeInfoList } = data.data;
          if (cmsAdvertList && cmsAdvertList.length) {
            this.slideList = data.data.cmsAdvertList;
          }
          this.slideListTitle.title = data.data.index_international_title1 || '';
          this.slideListTitle.subTitle = data.data.index_international_title2 || '';
          // 首页公告
          if (noticeInfoList && noticeInfoList.length) {
            const arr = [];
            let length = 18;
            if (this.index_international_open === 1) {
              length = 50;
            }
            noticeInfoList.forEach((item) => {
              const space = item.title.length > length ? '...' : '';
              arr.push({
                noticeText: `${item.title.substr(0, length)}${space}`,
                id: item.id,
              });
            });
            this.noticeList = arr;
          }
          this.home_edit_html = data.data.footer_warm_prompt;
        }
        this.homeEditReady = true;
      });
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
    // 获取Kine历史数据
    getKhistory() {
      const endTime = new Date().getTime().toString().substr(0, 10);
      const newTime = new Date(new Date().getTime() - 30 * 60 * 1000);
      const startTime = newTime.getTime().toString().substr(0, 10);
      this.coHeaderSymbol.forEach((item) => {
        const url = `swap/kline?instrumentID=${item.instrument_id}&startTime=${startTime}&endTime=${endTime}&resolution=M&unit=1`;
        this.axios({
          url,
          headers: {},
          method: 'get',
          hostType: 'fe-cov2-api',
        }).then((data) => {
          if (data.errno === 'OK') {
            const kData = data.data;
            this.klineDataList[item.symbol] = [];
            const lengthNumber = kData ? kData.slice(-30) : [];
            if (lengthNumber && lengthNumber.length) {
              lengthNumber.forEach((ele) => {
                this.klineDataList[item.symbol].push([
                  ele.timestamp,
                  ele.close,
                ]);
              });
            }
            this.$bus.$emit('RECOMMEEND_KLINE_DATA', this.klineDataList);
          }
        });
      });
    },
  },
  destroyed() {
    this.$bus.$off('SWITCH-STORE');
    this.$bus.$off('SWITCH-MARKET');
  },
  beforeDestroy() {
    this.webSocketSend('Market', 'unsub', this.symbolCurrent, this.symbolList);
    window.onscroll = null;
  },
};
