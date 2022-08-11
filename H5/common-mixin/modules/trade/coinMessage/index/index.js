export default {
  name: 'trade-coinMessage',
  data() {
    return {
      nowCoin: '',
      coinData: {},
    };
  },
  computed: {
    nowData() {
      return this.coinData[this.nowCoin] || {};
    },
  },
  beforeDestroy() {
    this.$bus.$off('SYMBOL_CURRENT');
  },
  methods: {
    init() {
      this.getData();
      // 监听 当前货币对切换
      this.$bus.$on('SYMBOL_CURRENT', (val) => {
        const str = val.split('/')[0];
        this.nowCoin = str;
      });
    },
    getData() {
      this.axios({
        url: 'common/coinSymbol_introduce',
      }).then((data) => {
        if (data.code === '0') {
          const mess = {};
          data.data.forEach((item) => {
            mess[item.coinSymbol] = item;
          });
          this.coinData = mess;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          this.fal = true;
        }
      });
    },
  },
};
