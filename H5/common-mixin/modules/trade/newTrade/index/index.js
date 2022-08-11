import { setBoxHeight, getCoinShowName } from '@/utils';

export default {
  name: 'newTrade',
  data() {
    return {
      dataList: [],
      cellWidth: [32, 32, 30],
      differNUmber: 51,
      // bodyHeight: '819px',
      symbolCurrent: null,
      newTradeHeight: '400px',
    };
  },
  computed: {
    theadList() {
      if (this.symbolCurrent) {
        return [
          `${this.$t('trade.price')}(${this.getShowName(this.symbolCurrent.split('/')[1])})`,
          `${this.$t('trade.vol')}(${this.getShowName(this.symbolCurrent.split('/')[0])})`,
          this.$t('trade.time'),
        ];
      }
      return [
        `${this.$t('trade.price')}()`,
        `${this.$t('trade.vol')}()`,
        this.$t('trade.time'),
      ];
    },
    flashSwitchs() {
      try {
        return this.$store.state.baseData.publicInfo.switch.trade_depth_is_flash;
      } catch {
        return 0;
      }
    },
  },
  methods: {
    init() {
      this.newTradeHeight = `${setBoxHeight(2.12) - 10}px`;
      this.$bus.$on('TRADE_DATA', (data) => {
        this.dataList = data.tradeData;
        this.differNUmber = 51 - this.dataList.length > 0 ? 51 - this.dataList.length : 0;
      });
      // 获取 当前选中的货币对
      this.$bus.$on('SYMBOL_CURRENT', (val) => {
        this.dataList = [];
        this.differNUmber = 51;
        this.symbolCurrent = val;
      });
    },
    getShowName(v) {
      let str = '';
      const showNameMarket = this.$store.state.baseData.market;
      if (showNameMarket) {
        const { coinList } = showNameMarket;
        str = getCoinShowName(v, coinList);
      }
      return str;
    },
    trBgClass(type) {
      // console.log(type);
      return type === 'u-1-cl' ? 'u-1-bg' : 'u-4-bg';
    },
    handelPrice(price) {
      this.$bus.$emit('HANDEL_PRICE', price);
    },
    kyes(item, index) {
      if (item.change) {
        return item.date;
      }
      return index;
    },
  },
};
