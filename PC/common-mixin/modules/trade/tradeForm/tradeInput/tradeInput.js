import { fixD, fixInput } from '@/utils';

export default {
  name: 'tableList',
  components: {
  },
  data() {
    return {
      focusv: false,
      valueData: null,
    };
  },
  props: {
    datas: {
      type: Object,
    },
    value: {
      type: [String, Number],
      default: null,
    },
    name: {
      type: String,
      default: null,
    },
    fixValue: {
      type: [String, Number],
    },
  },
  computed: {
    // 全部币种列表
    coinList() {
      if (this.$store.state.baseData && this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return null;
    },
    ItemClass() {
      let bg = '';
      let bd = 'a-3-bd';
      if (this.content && this.content.disabled) {
        bg = '';
      }
      if (this.focusv) {
        bd = 'a-12-bd';
      }
      if (this.content && this.content.isError) {
        bd = 'c-3-bd';
      }
      return [bg, bd];
    },
    content() {
      if (this.datas) {
        return this.datas;
      }
      return {};
    },
  },
  watch: {
    value(val) {
      this.valueData = fixInput(val, this.fixValue);
    },
  },
  methods: {
    init() {
      this.$bus.$on('SYMBOL_CURRENT', () => {
        this.valueData = null;
      });
      this.$bus.$on('ECHARTS_DATA', (data) => {
        if (this.name === 'formData_1' && !this.valueData
          && !this.focusv) {
          if (data.asksArr && data.asksArr.length) {
            const f = data.asksArr[0];
            if (f) {
              const [d] = f;
              this.valueData = fixD(d, this.fixValue);
              this.$emit('onChanes', { name: this.name, value: d });
            }
          }
        }
        if (this.name === 'formData_3' && !this.valueData
          && !this.focusv) {
          if (data.buysArr && data.buysArr.length) {
            const i = data.buysArr.length - 1;
            const f = data.buysArr[i];
            if (f) {
              const [d] = f;
              this.valueData = fixD(d, this.fixValue);
              this.$emit('onChanes', { name: this.name, value: d });
            }
          }
        }
      });
    },
    inputFocus() {
      if (!this.content.disabled) {
        this.focusv = true;
        this.$refs.inputs.focus();
      }
    },
    handle(type) {
      if (type === 'focus') {
        this.focusv = true;
      } else {
        this.focusv = false;
      }
    },
    handleInput(val) {
      const data = val;
      this.valueData = fixInput(data, this.fixValue);
      this.$emit('onChanes', { name: this.name, value: data, type: 'from' });
    },
  },
};
