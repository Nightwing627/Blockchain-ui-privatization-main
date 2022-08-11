import { myStorage, getCookie } from '@/utils';
// 按钮
export default {
  name: 'currentSymbol',
  data() {
    return {
      symbolCurrent: myStorage.get('sSymbolName'),
      dataList: [],
      symbolsData_bf: {},
      currencyModalState: false,
    };
  },
  props: {
    etfUrl: {
      type: String,
      default: '',
    },
    fundRate: {
      type: String,
      default: '',
    },
    etfPrice: {
      type: String,
      default: '',
    },
    marketShrink: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    documentTitle(val) {
      document.title = val;
    },
  },
  computed: {
    coinTagLangs() {
      return this.$store.state.baseData.coinTagLangs;
    },
    coinTagOpen() {
      return this.$store.state.baseData.coin_tag_open;
    },
    currentCoinLabel() {
      if (JSON.stringify(this.coinList) !== '{}') {
        const item = this.coinList[this.symbolCurrentCoinName.toUpperCase()];
        if (item) {
          const { coinTag = '' } = item;

          return coinTag ? this.coinTagLangs[coinTag] : '';
        }
      }
      return '';
    },
    symbolCurrentCoinName() {
      return this.symbolCurrent.split('/')[0] || '';
    },
    symbol_profile() {
      return this.$store.state.baseData.symbol_profile;
    },
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
    },
    // 全部币种列表
    coinList() {
      if (this.$store.state.baseData && this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return {};
    },
    // 全部币对列表
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },
    documentTitle() {
      const lang = getCookie('lan');
      let str = '';
      if (this.publicInfo) {
        const { indexHeaderTitle, seo } = this.publicInfo;
        let title = '';
        if (indexHeaderTitle) {
          if (lang) {
            title = seo.title || indexHeaderTitle[lang];
          } else {
            const lan = this.publicInfo.lan.defLan;
            title = seo.title || indexHeaderTitle[lan];
          }
        }
        const symbolCur = this.symbolAll[this.symbolCurrent]
          ? this.symbolAll[this.symbolCurrent].showName
          : this.symbolCurrent;
        str = `${this.symbolsData.close.data} ${symbolCur} ${this.$t(
          'pageTitle.trade',
        )}-${title}`;
      }
      return str;
    },
    symbolsData() {
      if (this.dataList[this.symbolCurrent]) {
        return this.dataList[this.symbolCurrent];
      }
      return {
        name: '--',
        symbol: {
          symbol: '--',
          unit: '--',
        },
        high: '--',
        low: '--',
        close: {
          class: '',
          data: '--',
          price: '--',
        },
        amount: '--',
        rose: {
          class: '',
          data: '--',
        },
      };
    },
  },
  methods: {
    init() {
      this.$bus.$on('SYMBOL_CURRENT', (val) => {
        this.symbolCurrent = val;
      });
      this.$bus.$on('MARKET_DATA', (data) => {
        this.dataList = data;
      });
    },
    getShowEtf(v) {
      let flag = false;
      const symbol = v;
      if (this.symbolAll
        && this.symbolAll[symbol]
        && this.symbolAll[symbol].etfOpen) {
        flag = true;
      }
      return flag;
    },
    showCurrencyModal() {
      this.currencyModalState = true;
    },
    hideCurrencyModal() {
      this.currencyModalState = false;
    },
  },
};
