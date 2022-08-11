import { myStorage, getCookie } from '@/utils';

export default {
  name: 'currentSymbol',
  components: {
  },
  data() {
    return {
      symbolCurrent: myStorage.get('coNowSymbol'),
      marketCurrent: myStorage.get('coMarkTitle'),
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
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
    },
    documentTitle() {
      const lang = getCookie('lan');
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
        return `${this.symbolsData.close.data} ${this.symbolCurrent} ${this.$t('pageTitle.trade')}-${title}`;
      }
      return '';
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
      this.$bus.$on('ON_MARKET_SWITCH_ORDER', (data) => {
        this.marketCurrent = data;
      });
      // 监听 市场切换
      this.$bus.$on('ON_MARKET_SWITCH', (data) => {
        this.marketCurrent = data;
      });
      this.$bus.$on('MARKET_DATA', (data) => {
        this.dataList = data;
      });
    },
  },
};
