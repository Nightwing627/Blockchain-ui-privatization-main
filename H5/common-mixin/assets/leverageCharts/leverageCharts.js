import {
  imgMap,
  fixD,
  fixRate,
  getCoinShowName,
} from '@/utils';

export default {
  data() {
    return {
      otcHeader: `background: url(${imgMap.zc_le})`,
      totalBalance: '--', // 资产折合
      totalBalanceSymbol: '', // 资产折合币种
      totalRate: '--', // 折合法币
    };
  },
  props: {
    axiosData: {
      default: () => {},
      type: Object,
    },
  },
  watch: {
    axiosData(v) {
      if (v) {
        this.setData(v);
      }
    },
  },
  computed: {
    market() { return this.$store.state.baseData.market; },
  },
  methods: {
    getShowName(v) {
      let str = v;
      if (this.market) {
        const { coinList } = this.market;
        str = getCoinShowName(v, coinList);
      }
      return str;
    },
    setData({ totalBalance, totalBalanceSymbol }) {
      const { coinList, rate } = this.market;
      const totalFix = coinList[totalBalanceSymbol].showPrecision || 0;
      this.totalBalance = fixD(totalBalance, totalFix); // 折合资产
      this.totalBalanceSymbol = totalBalanceSymbol; // 折合币种
      this.totalRate = fixRate(totalBalance, rate, totalBalanceSymbol); // 折合法币
    },
  },
};
