export default {
  data() {
    return {
      toastState: false,
    };
  },
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
    showToast() {
      this.toastState = true;
    },
    hideToast() {
      this.toastState = false;
    },
    setActiveBranch(v) {
      if (v === this.activeBranch) return;
      this.$emit('setActiveBranch', v);
    },
  },
};
