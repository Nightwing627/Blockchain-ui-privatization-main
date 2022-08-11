import { myStorage } from '@/utils';

export default {
  name: 'recommend',
  data() {
    return {
      dataList: {},
      klineDataList: {},
      mySymbolList: '',
      symbolCurrent: myStorage.get('sSymbolName'),
    };
  },
  computed: {
    // 全部币对列表
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },
    symbolCurrentCoinName() {
      return this.symbolCurrent.split('/')[0] || '';
    },
  },
  destroyed() {
    this.$bus.$off('RECOMMEEND_DATA');
    this.$bus.$off('RECOMMEEND_KLINE_DATA');
    this.$bus.$off('SWITCH-SYMBOL');
    this.$bus.$off('MYSYMBOL-LIST');
  },
  methods: {
    init() {
      // 监听 数据
      this.$bus.$on('RECOMMEEND_DATA', (data) => {
        this.dataList = data;
      });
      this.$bus.$on('RECOMMEEND_KLINE_DATA', (data) => {
        const keys = Object.keys(data);
        this.klineDataList = {};
        keys.forEach((item) => {
          if (this.symbolCurrent === item) {
            this.$set(this.klineDataList, item, data[item]);
          }
        });
      });
      this.$bus.$on('SWITCH-SYMBOL', (data) => {
        this.symbolCurrent = data;
      });
      this.$bus.$on('MYSYMBOL-LIST', (data) => {
        this.mySymbolList = data;
      });
    },
    marketClick(symbol) {
      this.$bus.$emit('SWITCH-STORE', symbol);
    },
    bandLink(symbol) {
      const symbolArr = symbol.split('/');
      const sym = `${symbolArr[0]}_${symbolArr[1]}`;
      this.$router.push(`/trade/${sym}`);
    },
  },
};
