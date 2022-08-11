import { mapState } from 'vuex';
import {
  myStorage, imgMap, colorMap,
} from '@/utils';
import worker from '@/utils/webWorker';

export default {
  name: 'homes',
  data() {
    return {
      krwCheck: false, // krw 弹窗下次不再提示
      krwFlag: false, // krw 弹窗
      krwBg: `background: url(${imgMap.krwhomebg})`,
      // 首页轮播图的 宽和高
      styles: {
        width: '100%',
        height: '2rem',
        backgroundColor: colorMap['c-3-bg'],
      },
      stylesHeight: '2rem',
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
      // class
      photoAppShow: false,
      productShow: false,
      home_edit_html: '',
    };
  },
  computed: {
    storeKrwFlag() {
      return this.$store.state.baseData.krwFlag;
    },
    coinsKrwOpen() {
      const { publicInfo } = this.$store.state.baseData;
      let str = '';
      if (publicInfo) {
        if (publicInfo.switch && publicInfo.switch.index_layer_open) {
          str = publicInfo.switch.index_layer_open.toString();
        } else {
          str = '0';
        }
      }
      return str;
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
      let arr = [];
      if (this.$store.state.baseData.market) {
        if (this.$store.state.baseData.market.home_symbol_show) {
          if (this.$store.state.baseData.market.home_symbol_show.recommend_symbol_list) {
            arr = this.$store.state.baseData.market.home_symbol_show.recommend_symbol_list;
          } else {
            arr = this.$store.state.baseData.market.headerSymbol;
          }
        } else {
          arr = this.$store.state.baseData.market.headerSymbol;
        }
        return arr;
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
  },
  watch: {
    coinsKrwOpen(v) {
      if (v === '1' && this.storeKrwFlag) {
        if (!localStorage.krwCheck) {
          this.krwFlag = true;
        }
      }
    },
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
    },
  },
  methods: {
    creaInit() {
      if (this.coinsKrwOpen === '1' && this.storeKrwFlag) {
        if (!localStorage.krwCheck) {
          this.krwFlag = true;
        }
      }
    },
    mounInit() {
      this.onmessageWorker();
      this.getLundata();
      // 监听 市场切换
      this.$bus.$on('SWITCH-MARKET', (data) => {
        this.marketCurrent = data;
        this.setMarketData();
      });
      this.$bus.$on('SWITCH-STORE', (data) => {
        this.setMyMarket(data);
        this.setMarketData();
      });
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
          const { photoApp, product } = this.$refs;

          if (photoApp && product) {
            const photoAppTop = photoApp.getBoundingClientRect().y;
            const productTop = product.getBoundingClientRect().y;
            if (WH - photoAppTop > 300) {
              this.photoAppShow = true;
            }
            if (WH - productTop > 200) {
              this.productShow = true;
            }
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
        this.setMarketData();
        this.setRecommendData();
      }
      if (type.indexOf('KLINE_DATA') > -1) {
        if (this.headerSymbol.length) {
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
      if (this.headerSymbol.length) {
        this.headerSymbol.forEach((item) => {
          this.recommendDataList[item] = {};
          if (this.marketDataObj && this.marketDataObj[item]) {
            this.recommendDataList[item] = this.marketDataObj[item];
          }
        });
        this.$bus.$emit('RECOMMEEND_DATA', this.recommendDataList);
      }
    },
    // 格式化 推荐位的24小时行情数据
    setMarketData() {
      const marketDataList = [];
      const keyarr = Object.keys(this.symbolList);
      keyarr.forEach((item) => {
        if (this.symbolList[item].newcoinFlag) {
          this.newcoinFlag = true;
        }
        const itemData = this.marketDataObj[item];
        if (itemData) {
          marketDataList.push({
            isShow: this.symbolList[item].isShow,
            id: itemData.name,
            data: [
              [
                {
                  iconSvg: this.myMarketIcon(itemData.name),
                  type: 'icon',
                  eventType: 'store',
                },
                {
                  iconSvg: `<span>${itemData.name}</span>`,
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
                  // classes: [itemData.close.class, 'fontSize14'],
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
    // 获取 首页数据(公告、轮播图)
    getLundata() {
      this.axios({
        url: this.$store.state.url.common.index_data,
        headers: {},
        params: {},
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          // 首页轮播图
          const { cmsAdvertList, noticeInfoList } = data.data;
          if (cmsAdvertList && cmsAdvertList.length) {
            this.slideList = data.data.cmsAppAdvertList;
          }
          // 首页公告
          if (noticeInfoList && noticeInfoList.length) {
            const arr = [];
            noticeInfoList.forEach((item) => {
              arr.push({
                noticeText: `${item.title.substr(0, 20)}...`,
                id: item.id,
              });
            });
            this.noticeList = arr;
          }
          this.home_edit_html = data.data.footer_warm_prompt;
          const homeEditHtml = data.data.footer_warm_prompt;
          // 首页自定义
          if (homeEditHtml && homeEditHtml.length) {
            const head = document.querySelector('head');
            const styleDom = document.createElement('style');
            if (homeEditHtml.indexOf('<script>') > -1) {
              let scriptHtml = homeEditHtml.match(/<script[^>]*>[\s\S]*?<\/[^>]*script>/gi)[0];
              const script = document.createElement('script');
              scriptHtml = scriptHtml.replace('<script>', '');
              scriptHtml = scriptHtml.replace(/<\/script>/ig, '');
              script.innerHTML = scriptHtml;
              head.appendChild(script);
            }
            let homeEditImgCss = '';
            const imgMapArry = Object.keys(imgMap);
            imgMapArry.forEach((item) => {
              if (item.indexOf('home_edit_') > -1) {
                homeEditImgCss += `.${item}{background-image:url(${imgMap[item]})}`;
              }
            });
            styleDom.innerHTML = homeEditImgCss;
            head.appendChild(styleDom);
          } else {
            this.onScrollHandle();
          }
        }
      });
    },
    // 设置 自选币对
    setMyMarket(symbol) {
      let mySymbol = myStorage.get('mySymbol') || [];
      if (mySymbol.length && mySymbol.indexOf(symbol) > -1) {
        mySymbol = mySymbol.filter((item) => item !== symbol);
      } else {
        mySymbol.push(symbol);
      }
      this.mySymbolList = mySymbol;
      myStorage.set('mySymbol', mySymbol);
      if (this.isLogin) {
        this.axios({
          url: this.$store.state.url.common.optional_symbol,
          headers: {},
          params: { optional_symbol: this.mySymbolList },
          method: 'post',
        }).then((data) => {
          if (data.code !== '0') {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
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
  },
  beforeDestroy() {
    this.webSocketSend('Market', 'unsub', this.symbolCurrent, this.symbolList);
    window.onscroll = null;
  },
};
