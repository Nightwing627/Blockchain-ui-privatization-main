// 开通合约交易页面
export default {
  name: 'openFuture',
  data() {
    return {
      // 是否加载成功
      dialogConfirmLoading: false,
      // 是否禁止提交
      dialogConfirmDisabled: false,
    };
  },
  props: {
    isShow: {
      default: false,
      type: Boolean,
    },
    close: {
      default() {},
      type: Function,
    },
  },
  computed: {
    lanText() {
      return {
        // 合约交易风险确认书
        titleText: this.$t('futures.openFutures.titleText'),
        // 确认并开通合约交易
        confirmText: this.$t('futures.openFutures.confirmText'),
        text1: this.$t('futures.openFutures.text1'),
        text2: this.$t('futures.openFutures.text2'),
        text3: this.$t('futures.openFutures.text3'),
        text4: this.$t('futures.openFutures.text4'),
        text5: this.$t('futures.openFutures.text5'),
        text6: this.$t('futures.openFutures.text6'),
        text7: this.$t('futures.openFutures.text7'),
      };
    },
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
  },
  watch: {
  },
  methods: {
    init() {
    },
    selectCategory(id) {
      this.currentCategory = id;
    },
    // 开通合约交易
    submit() {
      const { mobileNumber, email, id } = this.userInfo;
      this.dialogConfirmLoading = true;
      this.axios({
        url: this.$store.state.url.futures.createCoId,
        hostType: 'co',
        method: 'post',
        params: {
          mobileNumber,
          email,
          uid: id,
        },
      }).then(({ code, msg }) => {
        if (code.toString() === '0') {
          this.$store.dispatch('getUserConfig');
          this.close();
          this.$bus.$emit('tip', { text: msg, type: 'success' });
        } else {
          this.$bus.$emit('tip', { text: msg, type: 'error' });
        }
        this.dialogConfirmLoading = false;
      });
    },

  },
};
