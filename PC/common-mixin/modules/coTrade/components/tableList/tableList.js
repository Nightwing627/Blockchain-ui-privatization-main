import {
  thousandsComma,
} from '@/utils';

export default {
  name: 'tableList',
  components: {
  },
  data() {
    return {
      ops: {
        scrollPanel: {
          scrollingY: true,
          initialScrollY: 0,
        },
      },
    };
  },
  props: {
    type: {
      type: String,
      default: '',
    },
    theadList: {
      type: Array,
      default: () => [],
    },
    dataList: {
      type: Array,
      default: () => [],
    },
    cellWidth: {
      type: Array,
      default: () => [],
    },
    bodyHeight: {
      type: Number,
      default: 0,
    },
    lineNumber: {
      type: Number,
      default: 10,
    },
    maxValue: {
      type: Number,
    },
  },
  computed: {
    tbodyStyle() {
      return {
        height: `${this.bodyHeight}px`,
      };
    },
    priceClass() {
      return this.type === 'buy' ? 'u-1-cl' : 'u-4-cl';
    },
    trBgClass_two() {
      return this.type === 'buy' ? 'u-3-bg' : 'u-6-bg';
    },
    differNUmber() {
      if (this.lineNumber - this.dataList.length > 0) {
        return this.lineNumber - this.dataList.length;
      }
      return 0;
    },
    flashSwitchs() {
      return this.$store.state.baseData.trade_depth_is_flash;
    },
  },
  watch: {
    theadList(val) {
      this.scrollTo(val);
    },
    bodyHeight(val, oldval) {
      if (oldval && val) {
        if (this.type === 'asks' && val > 500) {
          this.scrollTo();
        }
      }
    },
    dataList(val, oldval) {
      if (this.type === 'asks' && !oldval.length) {
        setTimeout(() => {
          this.scrollTo();
        });
      }
    },
  },
  methods: {
    init() {
      this.scrollTo();
    },
    isShow(i) {
      if (this.type === 'asks') {
        const num = this.dataList.length - this.lineNumber;
        return num <= i;
      }
      return i < this.lineNumber;
    },
    trBgClass(diff) {
      return diff === 1 ? 'u-2-bg' : 'u-5-bg';
    },
    handelPrice(price) {
      this.$bus.$emit('HANDEL_PRICE', price);
    },
    scrollTo() {
      if (this.$refs.vs) {
        this.$refs.vs.scrollTo({
          y: 99999,
        }, false);
      }
    },
    handleResize() {
      if (this.type === 'asks') {
        setTimeout(() => {
          this.scrollTo();
        }, 100);
      }
    },
    setWidth(vol) {
      // const length = this.type === 'buy' ? this.dataList.length - 1 : 0;
      // const maxValue = this.dataList[length].total;
      let W = 0;
      if (vol === '--' || this.maxValue === '--') {
        return 0;
      }
      W = (parseFloat(vol) / parseFloat(this.maxValue)) * 100 + 5;
      if (W > 105) {
        W = 105;
      }
      return { width: `${W}%` };
    },
    thousandsComma(num) {
      if (num) {
        return thousandsComma(num);
      }
      return num;
    },
  },
};
