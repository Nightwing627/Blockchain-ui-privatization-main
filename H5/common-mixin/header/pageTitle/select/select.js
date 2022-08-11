import {
  getCoinShowName,
} from '@/utils';

export default {
  name: 'pageTitle-exTrade',
  data() {
    return {
      symbol: '',
      type: '',
      etfOpen: false,
    };
  },
  methods: {
    pClick() {
      window.open(window.localStorage.etfUrl, '_blank');
    },
    headerClickEvent() {
      this.$bus.$emit('HEADER-CLICK-EVENT');
    },
    getShowSymbol(v) {
      let str = '';
      const showNameSymbols = this.$store.state.baseData.symbolAll;
      if (showNameSymbols) {
        str = getCoinShowName(v, showNameSymbols);
      }
      return str;
    },
  },
  created() {
    this.$bus.$off('PAGE-TOP-TITLE');
    this.$bus.$on('PAGE-TOP-TITLE', (data) => {
      if (typeof data === 'string') {
        this.symbol = data;
        this.type = '';
      } else {
        this.type = data.type;
        this.symbol = data.symbol;
        this.etfOpen = data.etfOpen;
      }
    });
  },
  computed: {
    coinTagLangs() {
      return this.$store.state.baseData.coinTagLangs;
    },
    coinTagOpen() {
      return this.$store.state.baseData.coin_tag_open;
    },
    coinList() {
      if (this.$store.state.baseData && this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return null;
    },
    currentCoinLabel() {
      const coin = this.symbol.split('/')[0];
      if (this.coinTagOpen
          && this.coinList && this.coinList[coin.toUpperCase()]) {
        const { coinTag = '' } = this.coinList[coin.toUpperCase()];
        return coinTag ? this.coinTagLangs[coinTag] : '';
      }

      return '';
    },
    showTitle() {
      let { symbol } = this;
      if (this.type === 'getShowSymbol') {
        symbol = this.getShowSymbol(this.symbol);
      }
      return symbol;
    },
  },
  beforeDestroy() {
    this.$bus.$off('PAGE-TOP-TITLE');
  },
};
