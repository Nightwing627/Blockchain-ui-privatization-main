import { myStorage, getCoinShowName } from '@/utils';

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
      itemWidth: 0,
      iw: 0,
    };
  },
  computed: {
    symbolAll() { return this.$store.state.baseData.symbolAll; },
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
  },
  watch: {
  },
  methods: {
    init() {
      this.clientWidths = document.body.clientWidth;
      this.$bus.$on('WINFOW_ON_RESIIZE', () => {
        this.clientWidths = document.body.clientWidth;
      });
      // 监听 数据
      this.$bus.$on('RECOMMEEND_DATA', (data) => {
        const keys = Object.keys(data);
        keys.forEach((item) => {
          this.$set(this.dataList, item, data[item]);
        });
      });
      this.$bus.$on('RECOMMEEND_KLINE_DATA', (data) => {
        const keys = Object.keys(data);
        keys.forEach((item) => {
          this.$set(this.klineDataList, item, data[item]);
        });
      });
      this.iw = this.$refs.recommendContent[0].offsetWidth + 10;
      this.itemWidth = this.headerSymbol.length * (this.iw);
    },
    getShowSymbol(v) {
      let str = '';
      if (this.symbolAll) {
        str = getCoinShowName(v, this.symbolAll);
      }
      return str;
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
      myStorage.set('sSymbolName', data);
      myStorage.set('markTitle', data.split('/')[1]);
      this.$router.push('/trade');
    },
  },
};
