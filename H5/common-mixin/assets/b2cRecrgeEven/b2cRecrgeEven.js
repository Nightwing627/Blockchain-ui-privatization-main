export default {
  props: {
    title: {
      default: '',
      type: String,
    },
    haveCopy: {
      default: false,
      type: Boolean,
    },
    hover: {
      default: false,
      type: Boolean,
    },
    value: {
      default: '',
      type: String,
    },
  },
  methods: {
    copy() {
      const input = this.$refs.value;
      input.select();
      input.setSelectionRange(0, input.value.length);
      document.execCommand('copy');
      // 地址复制成功
      this.$bus.$emit('tip', { text: this.$t('assets.krw.copySuccess'), type: 'success' });
    },
  },
};
