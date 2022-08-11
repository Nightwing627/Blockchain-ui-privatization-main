import {
  fixD, fixInput, nul, division,
} from '@/utils';

export default {
  data() {
    return {
      orderId: null, // 订单id
      userId: null, // 用户id
      axiosObj: {},
      axiosReady: false,
      closeTradeConfirmLoading: false, // 关闭广告弹窗 -- 确认按钮loading
      closeTradeFlag: false, // 关闭广告弹窗变量
      leftInp: '', // 左侧input
      rightInp: '', // 右侧input
      passCode: '', // 资金密码
      btnLoading: false,
      timer: null, // 倒计时 计时器
      time: 60, // 倒计时
    };
  },
  watch: {
    optionsFlag(v) {
      if (v === 'even') {
        this.startTime();
      }
    },
    leftInp(v) {
      let fix = 0;
      // 如果该订单为 卖单走法币精度, 买单走数字货币精度
      if (this.axiosObj.side === 'SELL') {
        fix = this.priceFix;
      } else if (this.axiosObj.side === 'BUY') {
        fix = this.volumeFix;
      }
      this.leftInp = fixInput(v, fix);
    },
    rightInp(v) {
      let fix = 0;
      // 如果该订单为 卖单走数字货币币精度, 买单走法币精度
      if (this.axiosObj.side === 'SELL') {
        fix = this.volumeFix;
      } else if (this.axiosObj.side === 'BUY') {
        fix = this.priceFix;
      }
      this.rightInp = fixInput(v, fix);
    },
  },
  filters: {
    payFixD(v, that) {
      return fixD(v, that.priceFix);
    },
    coinFixD(v, that) {
      return fixD(v, that.volumeFix);
    },
    BTCFixD(v, that) {
      return fixD(v, that.btcFix);
    },
  },
  computed: {
    fiatTradeOpen() {
      const base = this.$store.state.baseData.publicInfo;
      if (base && base.switch && base.switch.fiat_trade_open === '1') {
        return true;
      }
      return false;
    },
    templateLayoutType() {
      return this.$store.state.baseData.templateLayoutType;
    },
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    userVip() {
      let str = '';
      if (this.userInfo && this.userInfo.otcCompanyInfo) {
        if (Number(this.userInfo.otcCompanyInfo.status)) {
          if (this.axiosObj.companyLevel === 1) {
            str = `<svg class="icon icon-16" aria-hidden="true">
              <use xlink:href="#icon-c_16"></use>
            </svg>`;
          } else if (this.axiosObj.companyLevel === 2) {
            str = `<svg class="icon icon-16" aria-hidden="true">
              <use xlink:href="#icon-c_17"></use>
            </svg>`;
          }
        }
      }
      return str;
    },
    // 信用度
    credit() {
      let str = '';
      if (this.axiosObj.creditGrade) {
        str = `${this.axiosObj.creditGrade * 100}%`;
      }
      return str;
    },
    // 我要出售(立即出售) 按钮
    mySellBtnDisabled() {
      let flag = true;
      if (
        (this.leftInpObj.flag && this.rightInpObj.flag && this.passFlag)
        || this.btnLoading
      ) {
        flag = false;
      }
      return flag;
    },
    // 我要购买(立即购买) 按钮
    myBuyBtnDisabled() {
      let flag = true;
      if ((this.leftInpObj.flag && this.rightInpObj.flag) || this.btnLoading) {
        flag = false;
      }
      return flag;
    },
    leftInpObj() {
      // 我要出售 当前该输入框为数字货币
      if (this.axiosObj.side === 'BUY') {
        // 当前框为0 或者没有数量时
        if (parseFloat(this.leftInp) === 0 || this.leftInp.length === 0) {
          return {
            flag: false,
            errorFlag: false,
            errorText: '',
          };
          // 当前框的值 大于 剩余数量
        }
        if (
          parseFloat(this.leftInp) > parseFloat(this.axiosObj.volumeBalance)
        ) {
          return {
            flag: false,
            errorFlag: true,
            // 下单金额大于该订单数量
            errorText: this.$t('otcTrade.numberError'),
          };
        }
        return {
          flag: true,
          errorFlag: false,
          errorText: '',
        };

        // 我要购买 当前该输入框为法币
      }
      if (this.axiosObj.side === 'SELL') {
        // 当前框为0 或者没有数量时
        if (parseFloat(this.leftInp) === 0 || this.leftInp.length === 0) {
          return {
            flag: false,
            errorFlag: false,
            errorText: '',
          };
          // 当前框的值 小于 最小交易限额
        }
        if (parseFloat(this.leftInp) < parseFloat(this.axiosObj.minTrade)) {
          return {
            flag: false,
            errorFlag: true,
            // 换取数量不得小于最小交易限额
            errorText: this.$t('otcTrade.numberMinError'),
          };
          // 当前框的值 大于 最大交易限额
        }
        if (parseFloat(this.leftInp) > parseFloat(this.axiosObj.maxTrade)) {
          return {
            flag: false,
            errorFlag: true,
            // 换取数量不得大于最大交易限额
            errorText: this.$t('otcTrade.numberMaxError'),
          };
        }
        return {
          flag: true,
          errorFlag: false,
          errorText: '',
        };
      }
      return {
        flag: false,
        errorFlag: false,
        errorText: '',
      };
    },
    rightInpObj() {
      // 我要出售 当前该输入框为法币框
      if (this.axiosObj.side === 'BUY') {
        // 当前框为0 或者没有数量时
        if (parseFloat(this.rightInp) === 0 || this.rightInp.length === 0) {
          return {
            flag: false,
            errorFlag: false,
            errorText: '',
          };
          // 当前框的值 小于 最小交易限额
        }
        if (parseFloat(this.rightInp) < parseFloat(this.axiosObj.minTrade)) {
          return {
            flag: false,
            errorFlag: true,
            // 换取数量不得小于最小交易限额
            errorText: this.$t('otcTrade.numberMinError'),
          };
          // 当前框的值 大于 最大交易限额
        }
        if (parseFloat(this.rightInp) > parseFloat(this.axiosObj.maxTrade)) {
          return {
            flag: false,
            errorFlag: true,
            // 换取数量不得大于最大交易限额
            errorText: this.$t('otcTrade.numberMaxError'),
          };
        }
        return {
          flag: true,
          errorFlag: false,
          errorText: '',
        };

        // 我要购买
      }
      if (this.axiosObj.side === 'SELL') {
        // 当前框为0 或者没有数量时
        if (parseFloat(this.rightInp) === 0 || this.rightInp.length === 0) {
          return {
            flag: false,
            errorFlag: false,
            errorText: '',
          };
          // 当前框的值 大于 剩余数量
        }
        if (
          parseFloat(this.rightInp) > parseFloat(this.axiosObj.volumeBalance)
        ) {
          return {
            flag: false,
            errorFlag: true,
            // 下单金额大于该订单数量
            errorText: this.$t('otcTrade.numberError'),
          };
        }
        return {
          flag: true,
          errorFlag: false,
          errorText: '',
        };
      }
      return {
        flag: false,
        errorFlag: false,
        errorText: '',
      };
    },
    // passCode 是否复合正则验证
    passFlag() {
      return this.$store.state.regExp.passWord.test(this.passCode);
    },
    // pass框是否为错误状态
    passErrorFlag() {
      if (this.passCode.length !== 0 && !this.passFlag) return true;
      return false;
    },
    leftInputOptions() {
      // 下单金额
      let promptText = this.$t('otcTrade.OrderAmount');
      // 下单数量
      if (this.axiosObj.side === 'BUY') {
        promptText = this.$t('h5Add.OrderAmount');
      }
      let warningText = '';
      const {
        side, payCoin, coin, minTrade, maxTrade,
      } = this.axiosObj;
      if (side === 'SELL') {
        // 用 法币 买 数字货币
        promptText += ` (${payCoin})`;
        // 下单金额范围
        warningText = `${this.$t('otcTrade.ScopeOrderAmount')}
         (${fixD(minTrade, this.priceFix)} - ${fixD(maxTrade, this.priceFix)})`;
      } else if (side === 'BUY') {
        // 用 数字货币 换 法币
        promptText += `(${coin})`;
      }
      return {
        promptText,
        warningText,
      };
    },
    rightInputOptions() {
      // 换取数量
      let promptText = this.$t('otcTrade.QuantityInExchange');
      // 换取金额
      if (this.axiosObj.side === 'BUY') {
        promptText = this.$t('h5Add.QuantityInExchange');
      }
      let warningText = '';
      const {
        side, payCoin, coin, minTrade, maxTrade,
      } = this.axiosObj;
      if (side === 'SELL') {
        // 用 法币 买 数字货币
        promptText += ` (${coin})`;
      } else if (side === 'BUY') {
        // 用 数字货币 换 法币
        promptText += `(${payCoin})`;
        // 下单金额范围
        warningText = `${this.$t('otcTrade.ScopeOrderAmount')}
          (${fixD(minTrade, this.priceFix)} - ${fixD(
  maxTrade,
  this.priceFix,
)})`;
      }
      return {
        promptText,
        warningText,
      };
    },
    // 操作区域展示的模块 非自己/自己
    optionsFlag() {
      let flag = '';
      if (this.axiosReady) {
        if (this.axiosObj.tip && this.axiosObj.tip.length) {
          flag = 'myself';
        } else {
          flag = 'even';
        }
      }
      return flag;
    },
    that() {
      return this;
    },
    volumeFix() {
      let fix = '';
      const { coin } = this.axiosObj;
      if (
        this.market
        && coin
        && this.market.coinList[coin]
        && this.market.coinList[coin].showPrecision
      ) {
        fix = this.market.coinList[coin].showPrecision;
      }
      return Number(fix);
    },
    btcFix() {
      let fix = '';
      if (
        this.market
        && this.market.coinList.BTC
        && this.market.coinList.BTC.showPrecision
      ) {
        fix = this.market.coinList.BTC.showPrecision;
      }
      return Number(fix);
    },
    priceFix() {
      let fix = this.$store.state.baseData.defaultFiatPrecision;
      const { payCoin, coin } = this.axiosObj;
      if (
        this.market
        && coin
        && payCoin
        && this.market.coinList[coin]
        && this.market.coinList[coin].fiatPrecision
        && this.market.coinList[coin].fiatPrecision[payCoin.toLowerCase()]
      ) {
        fix = this.market.coinList[coin].fiatPrecision[payCoin.toLowerCase()];
      }
      return Number(fix);
    },
    market() {
      return this.$store.state.baseData.market;
    },
    otcPublicInfo() {
      return this.$store.state.baseData.otcPublicInfo;
    },
    // 使用 xx 交易 xxx
    messageTitle() {
      let str = '';
      const { side, coin, payCoin } = this.axiosObj;
      if (side && coin && payCoin) {
        // 使用
        str = `${this.$t('otcTrade.use')}
          ${payCoin}
          ${
  side === 'BUY' ? this.$t('otcTrade.sell') : this.$t('otcTrade.buy')
} ${coin}`;
      }
      return str;
    },
    // 收款方式 / 付款方式
    sidePay() {
      // 交易方式
      let str = this.$t('otcTrade.TransactionMode');
      if (this.axiosObj.side) {
        str = this.axiosObj.side === 'BUY'
          ? this.$t('otcTrade.payment')
          : this.$t('otcTrade.Receivables');
      }
      return str;
    },
    // 是否展示商家备注
    isShowEscription() {
      if (this.axiosObj.description && this.axiosObj.description.length) {
        return true;
      }
      return false;
    },
    // 支付方式
    payments() {
      if (this.axiosObj.payments) {
        return this.axiosObj.payments;
      }
      return [];
    },
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    init() {
      const { orderId, userId } = this.$route.query;
      if (orderId) {
        this.orderId = orderId;
        this.userId = userId;
        this.initOrder();
      }
    },
    startTime() {
      clearInterval(this.timer);
      this.time = 60;
      this.timer = setInterval(() => {
        this.time -= 1;
        if (this.time <= 0) {
          clearInterval(this.timer);
          this.$router.push('/');
        }
      }, 1000);
    },
    goUser() {
      if (this.userId) {
        this.$router.push(`/stranger?uid=${this.userId}`);
      }
    },
    BtnClick() {
      // 我要购买
      if (this.axiosObj.side === 'SELL') {
        this.btnLoading = true;
        this.axios({
          url: 'v4/otc/buy_order_save',
          params: {
            advertId: this.orderId,
            price: this.axiosObj.price,
            totalPrice: this.leftInp, // 法币
            type: 'price',
            volume: this.rightInp, // 数字货币
          },
          hostType: 'otc',
        }).then((data) => {
          this.btnLoading = false;
          if (data.code.toString() === '0') {
            this.$bus.$emit('tip', { text: data.msg, type: 'success' });
            this.$router.push(`otcDetailOrder?orderId=${data.data.sequence}`);
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
        // 我要出售
      } else if (this.axiosObj.side === 'BUY') {
        this.btnLoading = true;
        this.axios({
          url: 'v4/otc/sell_order_save',
          params: {
            advertId: this.orderId,
            capitalPword: this.passCode,
            price: String(this.axiosObj.price),
            totalPrice: this.rightInp, // 法币
            type: 'volume',
            volume: this.leftInp, // 数字货币
          },
          hostType: 'otc',
        }).then((data) => {
          this.btnLoading = false;
          if (data.code.toString() === '0') {
            this.$bus.$emit('tip', { text: data.msg, type: 'success' });
            this.$router.push(`otcDetailOrder?orderId=${data.data.sequence}`);
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      }
    },
    inputAll(type) {
      if (this.axiosObj.volumeBalance) {
        if (type === 'right') {
          this.rightInp = fixD(this.axiosObj.volumeBalance, this.volumeFix);
          this.rightServe();
        } else if (type === 'left') {
          this.leftInp = fixD(this.axiosObj.volumeBalance, this.volumeFix);
          this.leftServe();
        }
      }
    },
    // 返回法币交易大厅
    goHall() {
      this.$router.push('/');
    },
    // 关闭广告
    closeTrade() {
      this.closeTradeFlag = true;
    },
    // 关闭广告弹窗 -- 确认
    closeTradeConfirm() {
      this.closeTradeConfirmLoading = true;
      this.axios({
        url: '/otc/close_wanted',
        method: 'post',
        hostType: 'otc',
        params: {
          advertId: this.orderId,
        },
      }).then((data) => {
        this.closeTradeConfirmLoading = false;
        if (data.code.toString() === '0') {
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.initOrder(); // 重新请求该订单
          this.closeTradeFlag = false; // 关闭弹窗
          this.$router.push('/');
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 关闭广告弹窗 -- 取消
    closeTradeClose() {
      this.closeTradeFlag = false;
    },
    inputLineChange(value, name) {
      this[name] = value;
      if (name === 'leftInp') {
        this.leftServe();
      } else if (name === 'rightInp') {
        this.rightServe();
      }
    },
    leftServe() {
      // 联动rightinp
      if (this.axiosObj.price) {
        // 当前为法币
        if (this.axiosObj.side === 'SELL') {
          this.rightInp = division(
            parseFloat(fixInput(this.leftInp, this.priceFix)),
            parseFloat(this.axiosObj.price),
          );
          // 当前为数字货币
        } else if (this.axiosObj.side === 'BUY') {
          this.rightInp = nul(
            parseFloat(fixInput(this.leftInp, this.volumeFix)),
            parseFloat(this.axiosObj.price),
          );
        }
      }
    },
    rightServe() {
      // 联动rightinp
      if (this.axiosObj.price) {
        // 当前为数字货币
        if (this.axiosObj.side === 'SELL') {
          this.leftInp = nul(
            parseFloat(fixInput(this.rightInp, this.volumeFix)),
            parseFloat(this.axiosObj.price),
          );
          // 当前为法币
        } else if (this.axiosObj.side === 'BUY') {
          this.leftInp = division(
            parseFloat(fixInput(this.rightInp, this.priceFix)),
            parseFloat(this.axiosObj.price),
          );
        }
      }
    },
    initOrder() {
      this.axios({
        url: 'otc/v4/wanted_detail',
        method: 'post',
        hostType: 'otc',
        params: {
          advertId: this.orderId,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.axiosReady = true;
          this.axiosObj = data.data;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
  },
};
