import {
  fixInput,
} from '@/utils';

export default {
  name: 'page-mobilityTrade',
  props: {
    // 买卖方向
    seach: { type: String, default: '' },
    // 法币
    legal: { type: String, default: '' },
    // 数字货币
    coin: { type: String, default: '' },
  },
  data() {
    return {
      selectCode: 1,
      inputValue: '',
      flag: true,
    };
  },
  watch: {
    side: {
      immediate: true,
      handler(v) {
        this.selectCode = 0;
        this.$nextTick(() => {
          if (v === 'BUY') {
            this.selectCode = 1;
          } else if (v === 'SELL') {
            this.selectCode = 2;
          }
        });
      },
    },
    inputValue(v) {
      if (this.selectCode === 1) {
        this.inputValue = fixInput(v, this.priceFix);
      } else {
        this.inputValue = fixInput(v, this.valueFix);
      }
    },
  },
  computed: {
    buttonDisabled() {
      let flag = true;
      if (Number(this.inputValue)) {
        flag = false;
      }
      return flag;
    },
    inputCoin() {
      if (this.selectCode === 1) {
        return this.legal;
      }
      return this.coin;
    },
    title() {
      if (this.side === 'BUY') {
        // 一键购买
        return this.$t('mobilityTrade.immediatelyBuy');
      } if (this.side === 'SELL') {
        // 一键出售
        return this.$t('mobilityTrade.immediatelySell');
      }
      return '';
    },
    side() {
      if (this.seach === 'BUY') {
        return 'SELL';
      } if (this.seach === 'SELL') {
        return 'BUY';
      }
      return '';
    },
    market() { return this.$store.state.baseData.market; },
    valueFix() {
      let fix = this.$store.state.baseData.defaultFiatPrecision;
      if (this.market
        && this.market.coinList[this.coin]
        && this.market.coinList[this.coin].showPrecision) {
        fix = this.market.coinList[this.coin].showPrecision;
      }
      return fix;
    },
    priceFix() {
      let fix = this.$store.state.baseData.defaultFiatPrecision;
      if (this.market
        && this.market.coinList[this.coin]
        && this.market.coinList[this.coin].fiatPrecision
        && this.market.coinList[this.coin].fiatPrecision[this.legal.toLowerCase()]) {
        fix = this.market.coinList[this.coin].fiatPrecision[this.legal.toLowerCase()];
      }
      return Number(fix);
    },
    priceText() {
      if (this.side === 'BUY') {
        // 按金额购买
        return this.$t('mobilityTrade.priceBuy');
      } if (this.side === 'SELL') {
        // 按金额出售
        return this.$t('mobilityTrade.priceSell');
      }
      return '';
    },
    valueText() {
      if (this.side === 'BUY') {
        // 按数量购买
        return this.$t('mobilityTrade.volumeBuy');
      } if (this.side === 'SELL') {
        // 按数量出售
        return this.$t('mobilityTrade.volumeSell');
      }
      return '';
    },
    selectList() {
      let priceText = '';
      let valueText = '';
      if (this.side === 'BUY') {
        priceText = this.$t('mobilityTrade.priceBuy');
        valueText = this.$t('mobilityTrade.volumeBuy');
      } else {
        priceText = this.$t('mobilityTrade.priceSell');
        valueText = this.$t('mobilityTrade.volumeSell');
      }
      return [
        { code: 1, value: priceText },
        { code: 2, value: valueText },
      ];
    },
    inputPromptText() {
      // 请输入金额
      if (this.selectCode === 1) {
        return this.$t('mobilityTrade.addPrice');
      }
      // 请输入数量
      return this.$t('mobilityTrade.addVolume');
    },
  },
  methods: {
    setTradeType(v) {
      this.selectCode = v;
      this.inputValue = '';
    },
    inputChanges(value) {
      this.inputValue = value;
    },
    btnClick() {
      this.$router.push(
        `/mobility?side=${this.side}&legal=${this.legal}&coin=${this.coin}&tradeType=${this.selectCode}&tradeValue=${this.inputValue}`,
      );
    },
  },
};
