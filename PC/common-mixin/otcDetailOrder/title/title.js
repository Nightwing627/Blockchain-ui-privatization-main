import { getTime } from '@/utils';

export default {
  name: 'otcDetailOrder-title',
  data() {
    return {
      djsTime: 0,
      timer: '',
      vTimer: null,
    };
  },
  props: {
    // 1-5 为正常流程  6是服务端状态  7为异常订单 8按3处理(客服介入强制使订单完成)
    // 待支付1 已支付2 交易成功3 取消 4 申诉 5 打币中6 异常订单7 申诉处理结束8
    commonData: { default: () => ({}), type: Object },
    // 当前订单 是买数字货币BUY 还是卖数字货币SELL
    isReady: { default: false, type: Boolean },
  },
  watch: {
    status(v) {
      if (v === '1' && this.commonData.limitTime && this.isReady) {
        this.djsTime = this.commonData.limitTime;
        this.setTime();
      } else if (v !== '1' && v !== '0') {
        if (this.vTimer) { clearInterval(this.vTimer); }
      }
    },
  },
  computed: {
    payText() {
      let str = '';
      if (this.commonData.payKey
        && this.commonData.payment
        && this.$store.state.baseData.otcPublicInfo
        && this.$store.state.baseData.otcPublicInfo.payments) {
        this.$store.state.baseData.otcPublicInfo.payments.forEach((item) => {
          if (item.key === this.commonData.payKey) {
            str = item.title;
          }
        });
        this.commonData.payment.forEach((item) => {
          if (item.payment === this.commonData.payKey) {
            str += ` (${item.account}) `;
          }
        });
      }
      return str;
    },
    status() {
      if (this.commonData.status) {
        return this.commonData.status.toString();
      }
      return '0';
    },
    domArr() {
      // 已拍下
      const arr = [
        // 已拍下
        {
          text: this.$t('otcDetailOrder.barText'),
          class: 'a-12-bg b-1-cl',
        },
      ];
      if (this.isReady) {
        const { status, side } = this.commonData;
        // 已拍下 -- 待付款 -- 待收币
        if (status.toString() === '1' && side === 'BUY') {
          arr.push(
            // 待付款
            { text: this.$t('otcDetailOrder.bar1Buy1'), class: 'a-2-bg b-1-cl' },
            // 待收币
            { text: this.$t('otcDetailOrder.bar1Buy2'), class: 'a-2-bg b-1-cl' },
          );
        // 已拍下 -- 待收款 -- 待放币
        } else if (status.toString() === '1' && side === 'SELL') {
          arr.push(
            // 待收款
            { text: this.$t('otcDetailOrder.bar1Sell1'), class: 'a-2-bg b-1-cl' },
            // 待放币
            { text: this.$t('otcDetailOrder.bar1Sell2'), class: 'a-2-bg b-1-cl' },
          );
        // 已拍下 -- 已付款 -- 待收币
        } else if (status.toString() === '2' && side === 'BUY') {
          arr.push(
            // 已付款
            { text: this.$t('otcDetailOrder.bar2Buy1'), class: 'a-12-bg b-1-cl' },
            // 待收币
            { text: this.$t('otcDetailOrder.bar2Buy2'), class: 'a-2-bg b-1-cl' },
          );
        // 已拍下 -- 已收款 -- 待放币
        } else if (status.toString() === '2' && side === 'SELL') {
          arr.push(
            // 已收款
            { text: this.$t('otcDetailOrder.bar2Sell1'), class: 'a-12-bg b-1-cl' },
            // 待放币
            { text: this.$t('otcDetailOrder.bar2Sell2'), class: 'a-2-bg b-1-cl' },
          );
        // 已拍下 -- 已付款 -- 已完成
        } else if (status.toString() === '3' && side === 'BUY') {
          arr.push(
            // 已付款
            { text: this.$t('otcDetailOrder.bar3Buy1'), class: 'a-12-bg b-1-cl' },
            // 已完成
            { text: this.$t('otcDetailOrder.bar3Buy2'), class: 'a-12-bg b-1-cl' },
          );
        // 已拍下 -- 已收款 -- 已完成
        } else if (status.toString() === '3' && side === 'SELL') {
          arr.push(
            // 已收款
            { text: this.$t('otcDetailOrder.bar3Sell1'), class: 'a-12-bg b-1-cl' },
            // 已完成
            { text: this.$t('otcDetailOrder.bar3Sell2'), class: 'a-12-bg b-1-cl' },
          );
        // 已拍下 -- 已关闭
        } else if (status.toString() === '4' || status.toString() === '9') {
          arr.push(
            // 已关闭
            { text: this.$t('otcDetailOrder.bar4Sell'), class: 'a-12-bg b-1-cl' },
          );
        // 已拍下 -- 申诉中
        } else if (status.toString() === '5') {
          arr.push(
            { text: this.$t('otcDetailOrder.bar5Sell'), class: 'a-12-bg b-1-cl' },
          );
        // 已拍下 -- 异常订单
        } else if (status.toString() === '7') {
          arr.push(
            { text: this.$t('otcDetailOrder.bar7Sell'), class: 'a-12-bg b-1-cl' },
          );
        // 已拍下 -- 已付款 -- 已完成
        } else if (status.toString() === '8' && side === 'BUY') {
          arr.push(
            // 已付款
            { text: this.$t('otcDetailOrder.bar8Buy1'), class: 'a-12-bg b-1-cl' },
            // 已完成
            { text: this.$t('otcDetailOrder.bar8Buy2'), class: 'a-12-bg b-1-cl' },
          );
        // 已拍下 -- 已收款 -- 已完成
        } else if (status.toString() === '8' && side === 'SELL') {
          arr.push(
            // 已收款
            { text: this.$t('otcDetailOrder.bar8Sell1'), class: 'a-12-bg b-1-cl' },
            // 已完成
            { text: this.$t('otcDetailOrder.bar8Sell2'), class: 'a-12-bg b-1-cl' },
          );
        }
      }
      return arr;
    },
  },
  beforeDestroy() {
    clearInterval(this.vTimer);
  },
  methods: {
    goAss() {
      this.$router.push('/assets/otcAccount');
    },
    setTime() {
      this.timer = this.initTime(this.djsTime);
      this.vTimer = setInterval(() => {
        this.djsTime -= 1000;
        if (this.djsTime <= 0) {
          clearInterval(this.vTimer);
          this.$emit('getData');
          return;
        }
        this.timer = this.initTime(this.djsTime);
      }, 1000);
    },
    initTime(spkTime) {
      const {
        day, hour, min, sec,
      } = getTime(spkTime);
      let str = '';
      if (Number(day)) { str += `${day}${this.$t('otcDetailOrder.day')}`; }
      if (Number(hour)) { str += `${hour}${this.$t('otcDetailOrder.hour')}`; }
      if (Number(min)) { str += `${min}${this.$t('otcDetailOrder.min')}`; }
      str += `${sec}${this.$t('otcDetailOrder.sec')}`;
      return str;
    },
  },
};
