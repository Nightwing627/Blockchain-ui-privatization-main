import {
  fixD, fixRate, imgMap, fixInput,
} from '@/utils';


export default {
  name: 'page-coAccount',
  props: {
    detailsData: {
      default: () => {},
      type: Object,
    },
  },
  mounted() {
    // this.getDetailData();
  },
  data() {
    return {
      showFlag: false,
      // detailsData: {}, // 账户详情
      tabelLoading: true,
      exchangeHeader: `background: url(${imgMap.assetsco})`,
      transferSide: '1',
      transferValue: '',
      dialogConfirmLoading: false,
    };
  },
  filters: {
    fixDFn(v, that) {
      return fixD(v, that.detailsData.showPrecision);
      // return fixD(v, that.showPrecision);
    },
    fixRateFn(v, that) {
      if (that.market
        && that.market.rate
        && that.detailsData.quoteSymbol) {
        const { rate } = that.market;
        const { quoteSymbol } = that.detailsData;
        return fixRate(v, rate, quoteSymbol);
      }
      return '--';
    },
  },
  watch: {
    transferValue(v) {
      this.transferValue = fixInput(v, this.detailsData.showPrecision);
    },
  },
  computed: {
    // 弹窗是否可点击
    dialogConfirmDisabled() {
      if (this.dialogConfirmLoading) { return false; }
      let flag = true;
      if (parseFloat(this.transferValue) > 0 && !this.transferError) {
        flag = false;
      }
      return flag;
    },
    transferError() {
      let flag = false;
      const { walletBalance, margin } = this.detailsData;
      // 限制最大数量
      if (this.transferSide === '1') {
        if (parseFloat(this.transferValue) > parseFloat(walletBalance)) {
          flag = true;
        }
      } else if (this.transferSide === '2') {
        if (parseFloat(this.transferValue) > parseFloat(margin)) {
          flag = true;
        }
      }
      return flag;
    },
    // input框警示文案
    transferWarningText() {
      const text = this.$t('assets.otcAccount.can'); // 可转
      const { walletBalance, canUseBalance, quoteSymbol } = this.detailsData;
      const num = this.transferSide === '1'
        ? fixD(walletBalance, this.detailsData.showPrecision)
        : fixD(canUseBalance, this.detailsData.showPrecision);
      return `${text} ${num} ${quoteSymbol}`;
    },
    side() {
      const ex = this.$t('assets.otcAccount.exchangeAccount');
      const co = this.$t('assets.coAccount.coAccount');
      let from = '';
      let to = '';
      if (this.transferSide === '1') {
        from = ex;
        to = co;
      } else {
        from = co;
        to = ex;
      }
      return {
        from,
        to,
      };
    },
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    tradeLinkUrl() {
      if (process.env.NODE_ENV === 'development') {
        return '/co/trade';
      }
      if (this.$store.state.baseData && this.$store.state.baseData.publicInfo) {
        return `${this.linkurl.mcoUrl}/trade`;
      }
      return '';
    },
    // market 接口
    market() { return this.$store.state.baseData.market; },
  },
  methods: {

    dialogClose() {
      this.showFlag = false;
    },
    dialogConfirm() {
      this.dialogConfirmLoading = true;
      const { contractAccountType, walletAccountType } = this.detailsData;
      this.axios({
        url: 'capital_transfer',
        hostType: 'co',
        params: {
          fromType: this.transferSide === '1' ? walletAccountType : contractAccountType,
          toType: this.transferSide === '1' ? contractAccountType : walletAccountType,
          amount: Number(this.transferValue),
          bond: this.detailsData.quoteSymbol,
        },
        method: 'post',
      }).then((data) => {
        this.dialogConfirmLoading = false;
        if (data.code.toString() === '0') {
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.transferSide = '1'; // 重置划转方向
          this.transferValue = ''; // 重置划转数量
          this.showFlag = false;
          // this.getDetailData();
          this.$emit('callBack');
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    clickDialog() {
      this.showFlag = true;
    },
    inputLineChange(value, name) {
      this[name] = value;
    },
    // 修改划转方向
    setTransferSide() {
      if (this.transferSide === '1') { this.transferSide = '2'; } else if (this.transferSide === '2') { this.transferSide = '1'; }
      this.transferValue = ''; // 重置划转数量
    },
    allTransfer() {
      const { walletBalance, canUseBalance } = this.detailsData;
      if (this.transferSide === '1') {
        if (!walletBalance) { return; }
        this.transferValue = walletBalance.toString();
      } else if (this.transferSide === '2') {
        if (!canUseBalance === '--') { return; }
        this.transferValue = canUseBalance.toString();
      }
    },
  },
};
