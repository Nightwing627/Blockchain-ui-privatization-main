export default {
  props: {
    commonData: { default: () => ({}), type: Object },
    isReady: { default: false, type: Boolean },
    // 买家支付时，选择的支付方式对象
    payObj: { default: () => ({}), type: Object },
  },
  computed: {
    otcPublicInfo() { return this.$store.state.baseData.otcPublicInfo; },
    pays() {
      const arr = [];
      if (this.isReady && this.otcPublicInfo.payments && this.commonData.payment) {
        this.commonData.payment.forEach((v) => {
          const obj = v;
          this.otcPublicInfo.payments.forEach((cv) => {
            if (v.payment === cv.key) {
              obj.name = cv.title;
            }
          });
          arr.push(obj);
        });
      }
      return arr;
    },
    status() {
      if (this.commonData.status) {
        return this.commonData.status.toString();
      }
      return '0';
    },
    showText() {
      let str = '';
      if (this.isReady) {
        const { side } = this.commonData;
        // 您已付款，无法查看对方支付信息
        if (side === 'BUY' && this.status === '2') {
          str = this.$t('otcDetailOrder.paysBuy2');
        // 您已付款，无法查看对方支付信息
        } else if (side === 'BUY' && this.status === '3') {
          str = this.$t('otcDetailOrder.paysBuy3');
        // 订单已完成，无法查看支付信息
        } else if (side === 'SELL' && this.status === '3') {
          str = this.$t('otcDetailOrder.paysSell3');
        // 订单已关闭，无法查看支付信息
        } else if (this.status === '4' || this.status === '9') {
          str = this.$t('otcDetailOrder.pays4');
        // 订单申诉中，无法查看支付信息
        } else if (this.status === '5') {
          str = this.$t('otcDetailOrder.pays5');
        // 订单异常，无法查看支付信息
        } else if (this.status === '7') {
          str = this.$t('otcDetailOrder.pays7');
        // 您已付款，无法查看对方支付信息
        } else if (side === 'BUY' && this.status === '8') {
          str = this.$t('otcDetailOrder.paysBuy8');
        // 订单已完成，无法查看支付信息
        } else if (side === 'SELL' && this.status === '8') {
          str = this.$t('otcDetailOrder.paysSell8');
        }
      }
      return str;
    },
    showPay() {
      let flag = false;
      if (this.isReady) {
        const { side } = this.commonData;
        if (this.status === '1') {
          flag = true;
        } else if (side === 'SELL' && this.status === '2') {
          flag = true;
        }
      }
      return flag;
    },
  },
  methods: {
    payClick(v) {
      this.$emit('setPayObj', v);
    },
    activePayMarkClick(v) {
      if (this.activePayMark === v) {
        this.activePayMark = '';
        return;
      }
      this.activePayMark = v;
    },
  },
  data() {
    return {
      activePayMark: '',
    };
  },
};
