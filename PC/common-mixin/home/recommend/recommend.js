import { myStorage, colorMap } from '@/utils';

export default {
  name: 'recommend',
  data() {
    return {
      // 滚动组件配置
      ops: {
        scrollPanel: {
          speed: 400,
          easing: 'easeOutQuad',
        },
        bar: {
          size: 0,
        },
        rail: {
          size: 0,
        },
      },
      clientWidths: 0,
      process: 0,
      dataList: {},
      klineDataList: {},
      isScroll: false, // true滚动 false剧中
      scrollRG: 0, // 滚动距离
      timer: null,
      liItemWidth: 310,
      coHeaderSymbol: [],
    };
  },
  computed: {
    isCoOpen() {
      const base = this.$store.state.baseData.publicInfo;
      if (base && base.switch && base.switch.indep_co_switch === '1') {
        return true;
      }
      return false;
    },
    coinTagLangs() {
      return this.$store.state.baseData.coinTagLangs;
    },
    coinTagOpen() {
      return this.$store.state.baseData.coin_tag_open;
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
    ulStyle() {
      const obj = {
        width: `${this.boxWidth}px`,
      };
      if (this.isScroll) {
        obj.marginLeft = `${-1 * this.scrollRG}px`;
      }
      return obj;
    },
    itemWidth() {
      return this.isCoOpen
        ? this.coHeaderSymbol.length * 300 - 20 : this.headerSymbol.length * 300 - 20;
    },
    headerSymbol() {
      if (this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.headerSymbol;
      }
      return [];
    },
    boxWidth() {
      return this.evenDatas.length * this.liItemWidth;
    },
    evenDatas() {
      const arr = [];
      if (!this.isCoOpen) {
        if (this.headerSymbol.length) {
          this.headerSymbol.forEach((item) => {
            const obj = {
              symbol: item, // 币对
              price: '--', // 价格
              volume: '--', // 24H vol
              roseVal: '--', // 涨跌幅
              roseCls: '', // 涨跌幅颜色
            };
            if (this.dataList[item]) {
              const data = this.dataList[item];
              obj.price = data.close ? data.close.data : '--';
              obj.volume = data.vol;
              obj.roseVal = data.rose ? data.rose.data : '--';
              obj.roseCls = data.rose ? data.rose.class : '--';
              obj.klineColor = data.rose ? colorMap[data.rose.class] : '';
              obj.coinLabel = data.symbol ? this.getCoinLabel(data.symbol.symbol, this.coinList) : '';
            }
            arr.push(obj);
          });
          if (this.isScroll) {
            for (let i = 0; i < this.headerSymbol.length; i += 1) {
              arr.push(arr[i]);
            }
          }
        }
      } else if (this.coHeaderSymbol.length) {
        this.coHeaderSymbol.forEach((item) => {
          const obj = {
            symbol: item.symbol, // 币对
            price: '--', // 价格
            volume: '--', // 24H vol
            roseVal: '--', // 涨跌幅
            roseCls: '', // 涨跌幅颜色
          };
          if (this.dataList[item.symbol]) {
            const data = this.dataList[item.symbol];
            obj.price = data.close ? data.close.data : '--';
            obj.volume = data.vol;
            obj.roseVal = data.rose ? data.rose.data : '--';
            obj.roseCls = data.rose ? data.rose.class : '--';
            obj.klineColor = data.rose ? colorMap[data.rose.class] : '';
            obj.coinLabel = '';
          }
          arr.push(obj);
        });
        if (this.isScroll) {
          for (let i = 0; i < this.coHeaderSymbol.length; i += 1) {
            arr.push(arr[i]);
          }
        }
      }

      return arr;
    },
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
  },
  watch: {
    isScroll(v) {
      if (v) {
        this.scrollRG = 0;
        this.start();
      } else {
        this.scrollRG = 0;
        clearInterval(this.timer);
      }
    },
    clientWidths(v) {
      if (v) {
        const by = this.headerSymbol.length * this.liItemWidth;
        // 剧中
        if (by <= v) {
          this.isScroll = false;
        // 滚动
        } else {
          this.isScroll = true;
        }
      }
    },
  },
  destroyed() {
    this.$bus.$off('WINFOW_ON_RESIIZE');
    this.$bus.$off('RECOMMEEND_DATA');
    this.$bus.$off('RECOMMEEND_KLINE_DATA');
    this.$bus.$off('COHEADER_SYMBOL');
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    getCoinLabel(name, coinList = {}) {
      if (coinList && coinList[name.toUpperCase()]) {
        const { coinTag = '' } = coinList[name.toUpperCase()];
        return coinTag ? this.coinTagLangs[coinTag] : '';
      }

      return '';
    },
    init() {
      this.clientWidths = document.body.clientWidth;
      this.$bus.$on('WINFOW_ON_RESIIZE', () => {
        this.clientWidths = document.body.clientWidth;
      });
      // 监听 数据
      this.$bus.$on('RECOMMEEND_DATA', (data) => {
        const keys = Object.keys(data);
        keys.forEach((item) => {
          let coinLabel = '';
          if (this.isCoOpen) {
            coinLabel = '';
          } else {
            coinLabel = (data[item] && data[item].symbol)
              ? this.getCoinLabel(data[item].symbol.symbol, this.coinList)
              : '';
          }
          this.$set(this.dataList, item,
            { ...{}, ...data[item], ...{ coinLabel } });
        });
      });
      this.$bus.$on('RECOMMEEND_KLINE_DATA', (data) => {
        const keys = Object.keys(data);
        keys.forEach((item) => {
          this.$set(this.klineDataList, item, data[item]);
        });
      });
      this.$bus.$on('COHEADER_SYMBOL', (data) => {
        this.coHeaderSymbol = [...data];
      });
    },
    symbolIcon(data) {
      const coin = data.symbol.split('/')[0];
      const iconImg = this.coinList[coin] ? this.coinList[coin].icon : '';
      return iconImg;
    },
    enter() {
      clearInterval(this.timer);
    },
    leave() {
      this.start();
    },
    start() {
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        const sum = this.evenDatas.length * this.liItemWidth - this.clientWidths;
        this.scrollRG += 1;
        if (this.scrollRG > sum) {
          // this.scrollRG = sum % this.liItemWidth
          this.scrollRG = this.headerSymbol.length * this.liItemWidth - this.clientWidths;
        }
      }, 50);
    },
    handleScroll(vertical, horizontal) {
      this.process = horizontal.process;
    },
    scrollRecommend(type) {
      let num = this.clientWidths / 2;
      if (type === 'prev') {
        num = -num;
      }
      this.$refs.vs.scrollBy({
        dx: num,
      });
    },
    bandLink(data) {
      if (data && !this.isCoOpen) {
        myStorage.set('sSymbolName', data);
        myStorage.set('markTitle', data.split('/')[1]);
      }
      if (!this.isCoOpen) {
        this.$router.push('/trade');
      } else {
        const coUrl = this.linkurl.coUrl ? `${this.linkurl.coUrl}/trade/${data}` : '';
        window.location.href = coUrl;
      }
    },
  },

};
