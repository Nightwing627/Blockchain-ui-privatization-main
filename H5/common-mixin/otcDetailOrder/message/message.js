export default {
  props: {
    commonData: { default: () => ({}), type: Object },
    // 当前订单 是买数字货币BUY 还是卖数字货币SELL
    isReady: { default: false, type: Boolean },
  },
  methods: {
    identificationShow() {
      this.$emit('update:identificationShow', true);
    },
  },
  computed: {
    identificationInfo() {
      const obj = {
        otcAuthnameOpen: 0,
      };
      const sideMap = {
        SELL: 'buyer',
        BUY: 'seller',
      };
      if (this.commonData.side) {
        const commonData = this.commonData[sideMap[this.commonData.side]];
        if (commonData) {
          obj.realName = commonData.realName;
          obj.mobileNumber = commonData.mobileNumber;
          obj.email = commonData.email;
          if (this.commonData.otcAuthnameOpen) {
            obj.otcAuthnameOpen = Number(this.commonData.otcAuthnameOpen);
          }
        }
      }
      return obj;
    },
    showDescription() {
      let flag = false;
      if (this.commonData.description && this.commonData.description.length) {
        flag = true;
      }
      return flag;
    },
  },
};
