import {
  fixD,
  fixInput,
} from '@/utils';

export default {
  name: 'page-mobility',
  data() {
    return {
      buyPayments: [],
      buyPayActive: '',
      buyPayLoading: true,
      sellPayments: [],
      sellPayActive: '',
      sellPayLoading: true,
      side: '', // 购买方向 买BUY 卖SELL
      legal: '', // 法币币种
      coin: '', // 数字货币
      tradeType: '', // 购买类型 1按金额交易 2按数量交易
      tradeValue: '', // 购买量
      activePay: '', // 当前选中的交易方式
      consultPrice: '', // 参考价格
      balanceList: {}, // 所以币种余额
      amountMax: '', // 最大交易数量
      amountMin: '', // 最小交易数量
      priceMax: '', // 最小交易价格
      priceMin: '', // 最大交易价格
      getBalanceReady: false, // 是否获取完余额
      firstGetNewPrice: false, // 是否第一次获取报价
      consultPriceReady: false, // 是否拿到参考单价
      balanceReady: false, // 是否取得余额
      dealLoading: false, // 获取报价的loading
      newPrice: {},
      axiosTimer: null,
      axiosTime: null,
      showNewGet: false, // 按钮展示是否重新获取 - 黄色button
      btnLoading: false,
    };
  },
  watch: {
    tradeValue(v, oldV) {
      if (this.selectCode === 1) {
        this.tradeValue = fixInput(v, this.priceFix);
      } else {
        this.tradeValue = fixInput(v, this.valueFix);
      }
      if (parseFloat(v) !== parseFloat(oldV)) {
        this.getNewPrice();
      }
    },
    market: {
      immediate: true,
      handler(v) {
        if (v) {
          this.getInfo();
          this.getBalance();
        }
      },
    },
  },
  computed: {
    btnObj() {
      const obj = {
        disbaled: true,
        text: '',
        class: '',
        showTime: false,
      };
      obj.disbaled = this.dealObj.btnDisabled;
      obj.text = this.title;
      if (!this.dealObj.btnDisabled && this.axiosTime) {
        obj.showTime = true;
      }
      if (!this.dealObj.btnDisabled && this.showNewGet) {
        obj.class = 'b-7-bg f-1-cl';
        // 报价已过期，点击获取最新价格
        obj.text = this.$t('mobilityTrade.btnHis');
      }
      return obj;
    },
    dealText() {
      let str = '';
      if (this.side === 'BUY') {
        if (this.tradeType === '1') {
          // 输入购买金额后获取
          str = this.$t('mobilityTrade.warn1');
        } else if (this.tradeType === '2') {
          // 输入购买数量后获取
          str = this.$t('mobilityTrade.warn2');
        }
      } else if (this.side === 'SELL') {
        if (this.tradeType === '1') {
          // 输入出售金额后获取
          str = this.$t('mobilityTrade.warn3');
        } else if (this.tradeType === '2') {
          // 输入出售数量后获取
          str = this.$t('mobilityTrade.warn4');
        }
      }
      return str;
    },
    axiosSellPayments() {
      let str = '';
      this.sellPayments.forEach((item) => {
        str += `${item.payment},`;
      });
      return str;
    },
    axiosBuyPayments() {
      let str = '';
      this.buyPayments.forEach((item) => {
        str += `${item.key},`;
      });
      return str;
    },
    getNewPriceFlag() {
      let flag = false;
      if (this.side === 'BUY') {
        if (this.coin && this.legal
          && this.tradeType && this.errorObj.flag
          && this.buyPayments.length
          && this.consultPriceReady) {
          flag = true;
        }
      } else if (this.side === 'SELL') {
        if (this.coin && this.legal
          && this.tradeType && this.errorObj.flag
          && this.sellPayments.length
          && this.consultPriceReady) {
          flag = true;
        }
      }
      return flag;
    },
    errorObj() {
      const obj = {
        flag: true,
        text: '',
        showError: false,
      };
      const tradeValue = parseFloat(this.tradeValue);
      const amountMax = parseFloat(this.amountMax);
      const amountMin = parseFloat(this.amountMin);
      const priceMax = parseFloat(this.priceMax);
      const priceMin = parseFloat(this.priceMin);
      const valueBalance = parseFloat(this.nowBalance.value);
      const priceBalance = parseFloat(this.nowBalance.price);
      if (!tradeValue) {
        obj.flag = false;
        obj.text = '';
        obj.showError = false;
        return obj;
      }
      if (!this.getBalanceReady && this.side === 'SELL') {
        obj.flag = false;
        obj.text = '';
        obj.showError = false;
        return obj;
      }
      if (this.tradeType === '1') {
        // 最大下单金额为 1 CNY
        if (tradeValue > priceBalance && this.side === 'SELL') {
          obj.flag = false;
          obj.text = `${this.$t('mobilityTrade.error1')} ${this.nowBalance.price} ${this.legal}`;
          obj.showError = true;
          return obj;
        }
        // 下单数量需在1-2 CNY 之间”
        if (priceMin > tradeValue || tradeValue > priceMax) {
          obj.flag = false;
          obj.text = `${this.$t('mobilityTrade.error2')} ${this.priceMin}-${this.priceMax} ${this.legal}`;
          obj.showError = true;
          return obj;
        }
      } else if (this.tradeType === '2') {
        // 最大下单金额为 1 BTC
        if (tradeValue > valueBalance && this.side === 'SELL') {
          obj.flag = false;
          obj.text = `${this.$t('mobilityTrade.error3')} ${this.nowBalance.value} ${this.coin}`;
          obj.showError = true;
          return obj;
        }
        // 下单数量需在 1-2 BTC 之间”
        if (amountMin > tradeValue || tradeValue > amountMax) {
          obj.flag = false;
          obj.text = `${this.$t('mobilityTrade.error4')} ${this.amountMin}-${this.amountMax} ${this.coin}`;
          obj.showError = true;
          return obj;
        }
      }
      return obj;
    },
    market() { return this.$store.state.baseData.market; },
    valueFix() {
      let fix = this.$store.state.baseData.defaultFiatPrecision;
      if (this.market
        && this.market.coinList[this.coin]
        && this.market.coinList[this.coin].showPrecision) {
        fix = this.market.coinList[this.coin].showPrecision;
      }
      return fix;
    },
    priceFix() {
      let fix = this.$store.state.baseData.defaultFiatPrecision;
      if (this.market
        && this.market.coinList[this.coin]
        && this.market.coinList[this.coin].fiatPrecision
        && this.market.coinList[this.coin].fiatPrecision[this.legal.toLowerCase()]) {
        fix = this.market.coinList[this.coin].fiatPrecision[this.legal.toLowerCase()];
      }
      return Number(fix);
    },
    nowBalance() {
      let price = '';
      let value = '';
      if (this.balanceList[this.coin] && this.consultPrice) {
        value = fixD(this.balanceList[this.coin], this.valueFix);
        price = fixD(
          this.balanceList[this.coin] * this.consultPrice * 0.9,
          this.priceFix,
        );
      }
      return {
        price,
        value,
      };
    },
    priceText() {
      if (this.side === 'BUY') {
        // 按金额购买
        return this.$t('mobilityTrade.priceBuy');
      } if (this.side === 'SELL') {
        // 按金额出售
        return this.$t('mobilityTrade.priceSell');
      }
      return '';
    },
    valueText() {
      if (this.side === 'BUY') {
        // 按数量购买
        return this.$t('mobilityTrade.volumeBuy');
      } if (this.side === 'SELL') {
        // 按数量出售
        return this.$t('mobilityTrade.volumeSell');
      }
      return '';
    },
    sideTab() {
      if (this.side === 'BUY') {
        return 1;
      } if (this.side === 'SELL') {
        return 2;
      }
      return 0;
    },
    sideList() {
      return [
        { name: this.$t('mobilityTrade.immediatelyBuy'), index: 1 },
        { name: this.$t('mobilityTrade.immediatelySell'), index: 2 },
      ];
    },
    inputCoin() {
      if (this.tradeType === '1') {
        return this.legal;
      }
      return this.coin;
    },
    title() {
      if (this.side === 'BUY') {
        return this.$t('mobilityTrade.immediatelyBuy');
      } if (this.side === 'SELL') {
        return this.$t('mobilityTrade.immediatelySell');
      }
      return '';
    },
    nowObj() {
      let obj = {};
      if (this.side === 'BUY') {
        obj = this.newPrice[this.buyPayActive] || {};
      } else if (this.side === 'SELL') {
        obj = this.newPrice[this.sellPayActive] || {};
      }
      return obj;
    },
    dealObj() {
      const obj = this.nowObj;
      const ret = {
        price: '--',
        value: '--',
        sum: '--',
        priceClass: '',
        btnDisabled: true,
      };
      if ((this.side === 'SELL' && this.sellPayments.length) || this.side === 'BUY') {
        if (this.getNewPriceFlag) {
          // 未找到合适报价，请修改下单条件
          ret.price = obj.hasValue ? obj.price : this.$t('mobilityTrade.error5');
          ret.value = obj.hasValue ? obj.amount : '--';
          ret.sum = obj.hasValue ? obj.totalPrice : '--';
          ret.priceClass = obj.hasValue ? '' : 'b-7-cl';
          ret.btnDisabled = !obj.hasValue;
        } else {
          ret.price = this.dealText;
          ret.btnDisabled = true;
        }
      } else {
        // 请您先添加收款方式
        ret.price = this.$t('mobilityTrade.error6');
        ret.btnDisabled = true;
      }
      // newPrice
      return ret;
    },
  },
  methods: {
    btnClick() {
      if (this.showNewGet) {
        this.btnLoading = true;
        this.getNewPrice();
      } else {
        this.btnLoading = true;
        this.axios({
          url: this.side === 'BUY'
            ? '/flow/buy'
            : '/flow/sell',
          params: {
            side: this.side,
            advertId: this.nowObj.advertId,
            volume: this.nowObj.amount,
            totalPrice: this.nowObj.totalPrice,
            price: this.nowObj.price,
            payment: this.nowObj.payment,
            coinSymbol: this.nowObj.coin,
            paySymbol: this.nowObj.payCoin,
            payType: this.tradeType === '1' ? 'PRICE' : 'AMOUNT',
          },
        }).then((data) => {
          this.btnLoading = false;
          if (data.code.toString() === '0') {
            this.$bus.$emit('tip', { text: data.msg, type: 'success' });
            window.open(data.data);
            this.$router.push('/order/otcOrder');
          } else if (data.code.toString() === '101162') {
            this.axiosTime = 0;
            clearInterval(this.axiosTimer);
            this.showNewGet = true;
            this.btnLoading = false;
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      }
    },
    // 获取当前报价
    getNewPrice() {
      if (!this.getNewPriceFlag) return;
      this.dealLoading = true;
      this.newPrice = {};
      this.axios({
        url: '/chainup/otc/coin/price',
        params: {
          symbol: this.coin,
          payCoin: this.legal,
          side: this.side === 'BUY' ? 'SELL' : 'BUY',
          payType: this.tradeType === '1' ? 'PRICE' : 'AMOUNT',
          payPrice: this.tradeType === '1' ? this.tradeValue : undefined,
          payAmount: this.tradeType === '2' ? this.tradeValue : undefined,
          payments: this.side === 'BUY' ? this.axiosBuyPayments : this.axiosSellPayments,
        },
      }).then((data) => {
        this.axiosTime = 60;
        this.showNewGet = false;
        this.btnLoading = false;
        clearInterval(this.axiosTimer);
        this.axiosTimer = setInterval(() => {
          this.axiosTime -= 1;
          if (this.axiosTime === 0) {
            clearInterval(this.axiosTimer);
            this.showNewGet = true;
            this.btnLoading = false;
          }
        }, 1000);
        if (data.code.toString() === '0') {
          setTimeout(() => {
            this.dealLoading = false;
            this.newPrice = data.data;
          }, 1000);
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    allClick() {
      const amountMax = parseFloat(this.amountMax);
      const priceMax = parseFloat(this.priceMax);
      const valueBalance = parseFloat(this.nowBalance.value);
      const priceBalance = parseFloat(this.nowBalance.price);
      if (this.tradeType === '1') {
        if (priceBalance <= priceMax) {
          this.tradeValue = this.nowBalance.price;
        } else {
          this.tradeValue = this.priceMax;
        }
      } else if (this.tradeType === '2') {
        if (valueBalance <= amountMax) {
          this.tradeValue = this.nowBalance.value;
        } else {
          this.tradeValue = this.amountMax;
        }
      }
    },
    inputChanges(value) {
      this.tradeValue = value;
    },
    getInfo() {
      this.axios({
        url: 'otc_flow_coin/info',
        hostType: 'otc',
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.init(data.data);
          this.getBuyPayments(data.data.payments);
          this.getSellPayments();
          this.getConsultPrice();
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    add() {
      this.$router.push('/personal/leaglTenderSet');
    },
    // 获取参考价格
    getConsultPrice() {
      this.consultPriceReady = false;
      this.axios({
        url: '/otc_flow_coin/consider_price_v4',
        hostType: 'otc',
        params: {
          baseSymbol: this.coin,
          coinSymbol: this.legal,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.consultPrice = data.data.referencePrice;
          this.amountMax = fixD(data.data.amountMax, this.valueFix);
          this.amountMin = fixD(data.data.amountMin, this.valueFix);
          this.priceMax = fixD(data.data.priceMax, this.priceFix);
          this.priceMin = fixD(data.data.priceMin, this.priceFix);
          this.consultPriceReady = true;
          if (this.side === 'BUY') {
            this.getNewPrice();
          } else if (this.side === 'SELL' && this.sellPayments.length && this.balanceReady) {
            this.getNewPrice();
          }
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 获取支付方式
    getBuyPayments(payments) {
      // payments = [
      //   { key: 'otc.payment.alipay', title: '支付宝' },
      //   { key: 'otc.payment.wxpay', title: '微信' },
      //   { key: 'otc.payment.domestic.bank.transfer', title: '银行卡' },
      // ];
      this.buyPayments = payments;
      if (this.buyPayments.length) {
        this.buyPayActive = this.buyPayments[0].key;
      }
      this.buyPayLoading = false;
    },
    // 获取收款方式
    getSellPayments() {
      this.axios({
        url: 'otc/payment/find',
        hostType: 'otc',
      }).then((data) => {
        if (data.code.toString() === '0') {
          const arr = [];
          data.data.forEach((item) => {
            if (item.isOpen) {
              arr.push(item);
            }
          });
          this.sellPayments = arr;
          if (arr.length) {
            this.sellPayActive = arr[0].payment;
          }
          this.sellPayLoading = false;
          if (this.side === 'SELL' && arr.length && this.balanceReady) {
            this.getNewPrice();
          }
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 初始化
    init({ defaultCoin, defaultSeach, otcDefaultPaycoin }) {
      const {
        side, legal, coin, tradeType, tradeValue,
      } = this.$route.query;
      this.side = side || defaultSeach;
      this.legal = legal || otcDefaultPaycoin;
      this.coin = coin || defaultCoin;
      this.tradeType = tradeType || '1';
      this.tradeValue = tradeValue || '';
    },
    sideChange(item) {
      if (item.index === this.sideTab) return;
      if (item.index === 1) {
        this.side = 'BUY';
        this.tradeType = '1';
      } else {
        this.side = 'SELL';
        this.tradeType = '2';
      }
      this.tradeValue = '';
    },
    setTradeType(v) {
      this.tradeType = v;
      this.tradeValue = '';
    },
    buyPaymentsChange(v) {
      this.buyPayActive = v;
    },
    sellPaymentsChange(v) {
      this.sellPayActive = v;
    },
    getBalance() {
      this.axios({
        url: 'finance/v4/otc_account_list',
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.balanceReady = true;
          const obj = {};
          data.data.allCoinMap.forEach((item) => {
            obj[item.coinSymbol] = item.normal;
          });
          this.balanceList = obj;
          this.getBalanceReady = true;
          if (this.side === 'SELL' && this.sellPayments.length && this.balanceReady) {
            this.getNewPrice();
          }
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
  },
};
