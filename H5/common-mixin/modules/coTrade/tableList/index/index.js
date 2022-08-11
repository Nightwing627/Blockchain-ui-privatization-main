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
      default: 24,
    },
    maxValue: {
      type: Number,
    },
  },
  computed: {
    tbodyStyle() {
      if (this.bodyHeight < 500) {
        return {
          height: `${this.bodyHeight / 100}rem`,
        };
      }
      return {
        height: `${this.bodyHeight / 100}rem`,
      };
    },
    asksOPtion() {
      if (this.type === 'asks' && this.bodyHeight < 500) {
        return 'asksOPtion';
      }
      return '';
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
      try {
        return this.$store.state.baseData.publicInfo.switch.trade_depth_is_flash;
      } catch {
        return 0;
      }
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
      this.$bus.$on('ACTIVE_TYPE_ID', () => {
        setTimeout(() => {
          if (this.type === 'asks') {
            this.scrollTo();
          }
        });
      });
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
      const length = this.type === 'buy' ? this.dataList.length - 1 : 0;
      const maxValue = this.dataList[length].total;
      let W = 0;
      if (vol === '--' || maxValue === '--') {
        return 0;
      }
      W = (parseFloat(vol) / parseFloat(maxValue)) * 100 + 5;
      if (W > 100) {
        W = 100;
      }
      return { width: `${W}%` };
    },
  },
};
