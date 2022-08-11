export default {
  props: {
    branchArr: {
      type: Array,
      default: () => [],
    },
    activeBranch: {
      type: String,
      default: '',
    },
    branchTip: {
      type: String,
      default: '',
    },
  },
  methods: {
    setActiveBranch(v) {
      if (v === this.activeBranch) return;
      this.$emit('setActiveBranch', v);
    },
  },
};
