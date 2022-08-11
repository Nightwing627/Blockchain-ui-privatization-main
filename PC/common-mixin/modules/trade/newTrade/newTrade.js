import { myStorage, getCoinShowName } from '@/utils';

export default {
  name: 'newTrade',
  components: {},
  data() {
    return {
      dataList: [],
      cellWidth: [100, 90, 95],
      differNUmber: 51,
      symbolCurrent: myStorage.get('sSymbolName'),
    };
  },
  props: {
    moduleType: {
      type: String,
      default: 'ex',
    },
  },
  computed: {
    newTradeClass() {
      if (this.moduleType === 'lever') {
        return 'lever-newTrade';
      }
      return '';
    },
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },
    theadList() {
      if (this.symbolCurrent && this.moduleType !== 'co') {
        const symbolCurrent = getCoinShowName(this.symbolCurrent, this.symbolAll).split('/');
        return [
          `${this.$t('trade.price')}(${symbolCurrent[1]})`,
          `${this.$t('trade.vol')}(${symbolCurrent[0]})`,
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
      return this.$store.state.baseData.trade_depth_is_flash;
    },
  },
  methods: {
    init() {
      if (this.moduleType === 'lever') {
        this.symbolCurrent = myStorage.get('leverSymbolName');
      }

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
    trBgClass(type) {
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
