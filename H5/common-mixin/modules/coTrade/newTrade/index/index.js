import { setBoxHeight } from '@/utils';

export default {
  name: 'newTrade',
  components: {},
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
      return [
        this.$t('contract.price'), // 价格,
        this.$t('contract.volume'), // 成交数量'
        this.$t('contract.time'), // 时间,
      ];
    },
    flashSwitchs() {
      return 1;
      // try {
      //   return this.$store.state.baseData.publicInfo.switch.trade_depth_is_flash;
      // } catch {
      //   return 1;
      // }
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
        this.symbolCurrent = val;
      });
    },
    handelPrice(price) {
      this.$bus.$emit('HANDEL_PRICE', price);
    },
    kyes(item, index) {
      if (item.change) {
        return new Date().getTime();
      }
      return index;
    },
  },
};
