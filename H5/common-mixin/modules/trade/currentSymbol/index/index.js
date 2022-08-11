
import { getCoinShowName, getCookie } from '@/utils';
// 按钮
export default {
  name: 'currentSymbol',
  components: {
  },
  props: {
    etfPrice: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      symbolCurrent: null,
      dataList: [],
      symbolsData_bf: {},
    };
  },
  watch: {
    documentTitle(val) {
      document.title = val;
    },
  },
  computed: {
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
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
        str = `${this.symbolsData.close.data} ${this.symbolCurrent} ${this.$t('pageTitle.trade')}-${title}`;
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
    init() {
      this.$bus.$on('SYMBOL_CURRENT', (val) => {
        this.symbolCurrent = val;
      });
      this.$bus.$on('MARKET_DATA', (data) => {
        this.dataList = data;
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
  },
};
