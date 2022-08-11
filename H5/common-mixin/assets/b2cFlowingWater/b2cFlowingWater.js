export default {
  data() {
    return {
      nowType: 1, // 1为充值 2为提现
      symbolList: [],
      symbol: '',
      axiosData: {},
    };
  },
  computed: {
    market() { return this.$store.state.baseData.market; },
    navTab() {
      const arr = [
        { name: this.$t('assets.flowingWater.RechargeRecord'), index: 1 }, // 充值记录
        { name: this.$t('assets.flowingWater.WithdrawalsRecord'), index: 2 }, // 提现记录
      ];
      return arr;
    },
    navList() {
      return [
        {
          text: this.$t('assets.otcAccount.ListOfFunds'),
          link: '/assets/b2cAccount',
        },
        {
          text: this.$t('assets.index.flowingWater'),
          active: true,
          link: '/assets/b2cFlowingWater',
        },
      ];
    },
  },
  watch: {
    market: {
      immediate: true,
      handler(v) {
        if (v) { this.sendOtcAxios(); }
      },
    },
  },
  methods: {
    // 获取列表
    sendOtcAxios() {
      this.axios({
        url: 'fiat/balance',
      }).then((data) => {
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          this.axiosData = data.data;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    init() {
      if (this.$route.query.type) {
        this.nowType = Number(this.$route.query.type);
      }
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
          if (this.$route.query.coin) {
            this.symbol = this.$route.query.coin;
          } else {
            this.symbol = 'all';
          }
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
