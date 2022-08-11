
import { fixD, imgMap, colorMap } from '@/utils';

export default {
  data() {
    return {
      timer: null,
      orderIsReady: false,
      orderId: '',
      axiosData: {},
      payObj: {}, // 买家支付时，选择的支付方式对象
      cancelOrderFlag: false, // 取消订单 开关变量 -- 用于买1
      cancelOrderCheck: false, // 取消订单 checkout
      cancelOrderLoading: false, // 取消订单 loading
      goPayFlag: false, // 确认付款弹窗 开关变量 -- 用于买1
      gopayConfirmLoading: false, // 确认付款弹窗 -- loading 用于买1
      releaseFlag: false, // 确认放行弹窗 开关变量
      passValue: '', // 资金密码 -- 用于卖2
      passCheck: false, // 资金密码 checkout -- 用于卖2
      releaseConfirmLoading: false, // 确认放币弹窗 确认按钮loading -- 用于卖2
      appealFlag: false, // 申诉弹窗 -- 用于买2/卖2
      appealValue: '', // 申诉内容 -- 用于买2/卖2
      appealLoading: false, // 申诉弹窗 确认按钮loading -- 用于买2/卖2
      cancelAppealFlag: false, // 取消申诉弹窗
      cancelAppealLoading: false, // 取消申诉的loading
      chatTop: 0,
      // chatHeight: 0,
      maxEvmFlag: false,
      imgMap,
      colorMap,
      identificationShow: false,
    };
  },
  watch: {
    status(v) {
      if (v) {
        this.$nextTick(() => {
          const { title } = this.$refs;
          this.chatTop = title.$el.offsetHeight;
        });
      }
    },
  },
  computed: {
    identificationInfo() {
      const obj = {};
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
          obj.isTwoMin = Number(this.commonData.isTwoMin);
        }
      }
      return obj;
    },
    goPayText() {
      let price = '';
      let id = '';
      const { sequence, totalPrice, paycoin } = this.commonData;
      if (sequence) {
        id = sequence.substring(sequence.length - 6);
      }
      if (totalPrice && paycoin) {
        price = `${totalPrice} ${paycoin}`;
      }
      return {
        id,
        price,
      };
    },
    // buy 1 去支付按钮 disabled
    goPayDisabled() {
      let flag = true;
      if (this.payObj.payment) {
        flag = false;
      }
      return flag;
    },
    // 资金密码 是否复合正则验证 卖2
    passFlag() { return this.$store.state.regExp.passWord.test(this.passValue); },
    // 资金密码 是否为错误状态 卖2
    passErrorFlag() {
      if (this.passValue.length !== 0 && !this.passFlag) return true;
      return false;
    },
    // 确认放币弹窗 确定按钮 禁用  卖2
    releaseConfirmDisbale() {
      let flag = true;
      if ((this.passCheck && this.passFlag) || this.releaseConfirmLoading) {
        flag = false;
      }
      return flag;
    },
    // 申诉弹窗 确定按钮 禁用 买2/卖2
    appealConfirmDisabled() {
      let flag = true;
      if (this.appealValue.length || this.appealLoading) {
        flag = false;
      }
      return flag;
    },
    // 取消订单 确定按钮 禁用
    cancelOrderConfirmDisabled() {
      let flag = true;
      if (this.cancelOrderCheck || this.cancelOrderLoading) {
        flag = false;
      }
      return flag;
    },
    status() {
      if (this.commonData.status) {
        return this.commonData.status.toString();
      }
      return '0';
    },
    baseData() {
      return this.$store.state.baseData;
    },
    userInfo() { return this.$store.state.baseData.userInfo; },
    isLogin() { return this.$store.state.baseData.isLogin; },
    // 传给子组件是否准备就绪 必须订单接口和user_info请求成功
    isReady() {
      let flag = false;
      if (this.isLogin && this.orderIsReady) {
        flag = true;
      }
      return flag;
    },
    // 传给子组件的数据 axios返回的订单数据 + 自己算出的方向
    commonData() {
      let obj = {};
      if (this.isReady) {
        if (this.userInfo.id && this.axiosData.seller && this.axiosData.seller.uid) {
          const side = this.userInfo.id.toString() === this.axiosData.seller.uid.toString() ? 'SELL' : 'BUY';
          obj = { ...this.axiosData, ...{ side } };
        }
      }
      return obj;
    },
    market() { return this.$store.state.baseData.market; },
    priceFix() {
      let fix = this.$store.state.baseData.defaultFiatPrecision;
      const { coin, paycoin } = this.commonData;
      if (this.market
        && this.market.coinList[coin]
        && this.market.coinList[coin].fiatPrecision
        && this.market.coinList[coin].fiatPrecision[paycoin.toLowerCase()]) {
        fix = this.market.coinList[coin].fiatPrecision[paycoin.toLowerCase()];
      }
      return Number(fix);
    },
    volumeFix() {
      let fix = '';
      const { coin } = this.commonData;
      if (this.market && coin
        && this.market.coinList[coin]
        && this.market.coinList[coin].showPrecision) {
        fix = this.market.coinList[coin].showPrecision;
      }
      return Number(fix);
    },
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    init() {
      const { orderId } = this.$route.query;
      if (orderId) {
        this.orderId = orderId;
        this.getData();
      }
    },
    maxEvm(v) {
      this.maxEvmFlag = v;
    },
    getData() {
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        this.initOrder(true);
      }, 10000);
      this.initOrder();
    },
    // 获取订单数据
    initOrder(auto) {
      const headers = {};
      if (auto) {
        headers['exchange-auto'] = '1';
      }
      this.axios({
        url: 'v4/otc/order_detail',
        params: {
          sequence: this.orderId,
          headers,
        },
        hostType: 'otc',
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.orderIsReady = true;
          this.axiosData = data.data;
          this.axiosData.price = fixD(this.axiosData.price, this.priceFix);
          this.axiosData.totalPrice = fixD(this.axiosData.totalPrice, this.priceFix);
          this.axiosData.volume = fixD(this.axiosData.volume, this.volumeFix);
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 买家支付时，修改选择的支付方式对象
    setPayObj(v) {
      this.payObj = v;
    },
    // 买1 去支付按钮
    goPayClick() {
      this.goPayFlag = true;
    },
    // 买1 确认付款碳层 close
    goPayClose() {
      this.goPayFlag = false;
    },
    // 买1 标记为已付款 confirm
    gopayConfirm() {
      this.gopayConfirmLoading = true;
      this.axios({
        url: '/v4/otc/order_payed',
        hostType: 'otc',
        params: {
          sequence: this.orderId,
          payment: this.payObj.payment,
        },
      }).then((data) => {
        this.gopayConfirmLoading = false;
        if (data.code.toString() === '0') {
          this.getData();
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.goPayFlag = false;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 卖2 确认收款并放币
    releaseClick() {
      this.releaseFlag = true;
    },
    // 卖2 checkout点击
    passCheckClick() {
      this.passCheck = !this.passCheck;
    },
    // 卖2 关闭确认放行弹窗
    releaseClose() {
      this.releaseFlag = false; // 关闭弹窗
      this.passValue = ''; // 清空资金密码
      this.passCheck = false; // 取消checkout
    },
    // 卖2 确认放行弹窗 确定
    releaseConfirm() {
      this.releaseConfirmLoading = true;
      const url = 'otc/confirm_order';
      this.axios({
        url,
        hostType: 'otc',
        params: {
          sequence: this.orderId,
          capitalPword: this.passValue,
        },
      }).then((data) => {
        this.releaseConfirmLoading = false;
        if (data.code.toString() === '0') {
          this.getData();
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.releaseClose();
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 申诉按钮点击 买2 / 卖2
    appealClick() {
      const nowTime = new Date().getTime();
      const spk = nowTime - this.axiosData.payTime;
      if (spk <= 300000) {
        // 确认付款5分钟后才可提交申诉
        this.$bus.$emit('tip', {
          text: this.$t('otcDetailOrder.AppealTitleFive'),
          type: 'warning',
        });
      } else {
        this.appealFlag = true;
      }
    },
    // 申诉弹窗 关闭按钮
    appealClose() {
      this.appealFlag = false;
      this.appealValue = '';
    },
    // 申诉弹窗 确认按钮
    appealConfirm() {
      this.appealLoading = true;
      this.axios({
        url: '/question/create_problem',
        params: {
          rqType: this.commonData.side === 'BUY' ? 8 : 9,
          rqDescribe: this.appealValue,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          const url = 'otc/complain_order';
          this.axios({
            url,
            hostType: 'otc',
            params: {
              sequence: this.orderId,
              complainId: data.data.complainId,
            },
          }).then((cdata) => {
            this.appealLoading = false;
            if (cdata.code.toString() === '0') {
              this.getData();
              this.appealClose();
              this.$bus.$emit('tip', { text: cdata.msg, type: 'success' });
            } else {
              this.$bus.$emit('tip', { text: cdata.msg, type: 'error' });
            }
          });
        } else {
          this.appealLoading = false;
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 取消申诉 点击
    cancelAppealClick() {
      this.cancelAppealFlag = true;
    },
    // 取消申诉弹窗 关闭按钮
    cancelAppealClose() {
      this.cancelAppealFlag = false;
    },
    // 取消申诉弹窗 确定按钮
    cancelAppealConfirm() {
      this.cancelAppealLoading = true;
      const url = 'otc/complain_cancel';
      this.axios({
        hostType: 'otc',
        url,
        params: {
          sequence: this.orderId,
        },
      }).then((data) => {
        this.cancelAppealLoading = false;
        if (data.code.toString() === '0') {
          this.getData();
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.cancelAppealClose();
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // ---------- 取消订单 -----------
    // 取消订单 click
    cancelOrderClick() {
      this.cancelOrderFlag = true;
    },
    // 取消订单 checkout点击
    cancelOrderCheckClick() {
      this.cancelOrderCheck = !this.cancelOrderCheck;
    },
    // 取消订单 弹窗关闭
    cancelOrderClose() {
      this.cancelOrderFlag = false;
      this.cancelOrderCheck = false;
    },
    // 取消订单 确认按钮
    cancelOrderConfirm() {
      this.cancelOrderLoading = true;
      const url = 'otc/order_cancel';
      this.axios({
        url,
        hostType: 'otc',
        params: {
          sequence: this.orderId,
        },
      }).then((data) => {
        this.cancelOrderLoading = false;
        if (data.code.toString() === '0') {
          this.getData();
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.cancelOrderClose();
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    inputLineChange(value, name) {
      this[name] = value;
    },
    // 前往广告大厅
    goHall() {
      this.$router.push('/');
    },
  },
};
