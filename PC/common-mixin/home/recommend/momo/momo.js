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
      liItemWidth: 300,
    };
  },
  computed: {
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
      return this.headerSymbol.length * 300 - 20;
    },
    headerSymbol() {
      if (this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.headerSymbol;
      }
      return [];
    },
    boxWidth() {
      return 4 * this.liItemWidth;
    },
    evenDatas() {
      const arr = [];
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
      return arr;
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
          this.isScroll = false;
        }
      }
    },
  },
  destroyed() {
    this.$bus.$off('WINFOW_ON_RESIIZE');
    this.$bus.$off('RECOMMEEND_DATA');
    this.$bus.$off('RECOMMEEND_KLINE_DATA');
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
          const coinLabel = (data[item] && data[item].symbol)
            ? this.getCoinLabel(data[item].symbol.symbol, this.coinList)
            : '';
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
      if (data) {
        myStorage.set('sSymbolName', data);
        myStorage.set('markTitle', data.split('/')[1]);
      }

      this.$router.push('/trade');
    },
  },

};
