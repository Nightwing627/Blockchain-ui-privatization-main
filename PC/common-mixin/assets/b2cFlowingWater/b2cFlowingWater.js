export default {
  data() {
    return {
      nowType: 1, // 1为充值 2为提现
      symbolList: [],
      symbol: '',
    };
  },
  computed: {
    navTab() {
      const arr = [
        { name: this.$t('assets.flowingWater.RechargeRecord'), index: 1 }, // 充值记录
        { name: this.$t('assets.flowingWater.WithdrawalsRecord'), index: 2 }, // 提现记录
      ];
      return arr;
    },
  },
  methods: {
    init() {
      this.getMessage();
    },
    symbolChange(item) {
      this.symbol = item.code;
    },
    getMessage() {
      this.axios({
        url: 'fiat/balance',
      }).then((data) => {
        if (data.code.toString() === '0') {
          const list = [{ code: 'all', value: this.$t('assets.otcFlowingWater.all') }];
          data.data.allCoinMap.forEach((item) => {
            list.push({ code: item.symbol, value: item.symbol });
          });
          this.symbol = 'all';
          this.symbolList = list;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    currentType(item) {
      this.nowType = item.index;
    },
  },
};
