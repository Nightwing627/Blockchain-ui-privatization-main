export default {
  name: 'currencyNotes',
  props: {
    coinName: {
      type: String,
      required: true,
    },
  },
  data() {
    return {};
  },
  computed: {
    coinSymbolIntroduce() {
      let currentCoinInfo = {};
      const { coinSymbolIntroduce } = this.$store.state.baseData;
      coinSymbolIntroduce.forEach((el) => {
        if (el.coinSymbol === this.coinName) {
          currentCoinInfo = el;
        }
      });

      return currentCoinInfo;
    },
  },
  components: {},
  methods: {
    goUrl() {},
  },
};
