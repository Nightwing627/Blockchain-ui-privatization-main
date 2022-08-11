import {
  fixD,
  fixInput,
  getCoinShowName,
} from '@/utils';

export default {
  data() {
    return {
      transferConfirmLoading: false,
      transferFlag: false, // 资金划转弹窗开关变量
      transferValue: '', // 划转数量
      transferCoin: '', // 划转的币种
      transferObj: {}, // 当前划转币种对象
      axiosFlag: false,
      symbol: '',
      repaymentData: {}, // 借贷信息
    };
  },
  filters: {
    fixDFn(v, that) {
      return fixD(v, that.transferCoinFix);
    },
    fixDReturnFn(v, that) {
      return fixD(v, that.returnFix);
    },
  },
  watch: {
    market(v) { if (v && this.axiosFlag) { this.getData(); } },
    transferValue(v) {
      this.transferValue = fixInput(v, this.returnFix);
    },
  },
  computed: {
    symbolAll() { return this.$store.state.baseData.symbolAll; },
    inputMess() {
      const obj = {
        flag: false,
        showError: false,
        text: '',
      };
      const inp = Number(this.transferValue);
      const have = Number(this.transferCanNum);
      const max = Number(fixD(this.repaymentMess.Surplus, this.returnFix));
      const min = Number(this.transferMinNum);
      let flag = true;
      if (min > max) flag = false;
      if (inp === 0) {
        obj.flag = false;
        obj.text = '';
        obj.showError = false;
      } else if (min > inp && flag) {
        obj.flag = false;
        obj.showError = true;
        // 归还数量不得小于
        const str = this.$t('assets.leverageRepayment.error1');
        obj.text = `${str} ${fixD(min, this.transferCoinFix)} ${this.transferCoin}`;
      } else if (inp > have) {
        obj.flag = false;
        obj.showError = true;
        // 归还数量不得大于可用数量
        obj.text = this.$t('assets.leverageRepayment.error2');
      } else if (inp > max) {
        obj.flag = false;
        obj.showError = true;
        // 归还数量不得大于应还数量
        obj.text = this.$t('assets.leverageRepayment.error3');
      } else {
        obj.flag = true;
        obj.text = '';
        obj.showError = false;
      }
      return obj;
    },
    repaymentMess() {
      const obj = {
        coin: '', // 借贷币种
        sum: '', // 借贷总数
        rete: '', // 借贷产生的利息
        Surplus: '', // 应还 未还 + 利息
      };
      const {
        coin, borrowMoney, oweInterest, oweAmount,
      } = this.repaymentData;
      obj.coin = coin;
      obj.sum = borrowMoney || 0;
      obj.rate = oweInterest || 0;
      obj.Surplus = (oweInterest || 0) + (oweAmount || 0);
      return obj;
    },
    market() { return this.$store.state.baseData.market; },
    transferWarningText() {
      const text = this.$t('assets.leverageRepayment.can'); // 可用
      const num = fixD(this.transferCanNum, this.returnFix);
      return `${text} ${num} ${this.getShowName(this.transferCoin)} `;
    },
    transferCoinFix() {
      let fix = 0;
      if (this.market
        && this.market.coinList
        && this.market.coinList[this.transferCoin]) {
        fix = this.market.coinList[this.transferCoin].showPrecision;
      }
      return Number(fix);
    },
    returnFix() {
      let returnFix = this.transferObj.baseReturnPrecision || 0;
      if (this.repaymentMess.coin === this.transferObj.quoteCoin) {
        returnFix = this.transferObj.quoteReturnPrecision;
      }
      return returnFix;
    },
    // 弹窗是否可点击
    transferConfirmDisabled() {
      if (this.transferConfirmLoading) { return false; }
      let flag = true;
      if (this.inputMess.flag) {
        flag = false;
      }
      return flag;
    },
    // 可用数量
    transferCanNum() {
      const {
        baseNormalBalance,
        quoteNormalBalance,
        baseCoin,
        quoteCoin,
      } = this.transferObj;
      let balance = '';
      if (this.transferCoin === baseCoin) {
        balance = baseNormalBalance;
      } else if (this.transferCoin === quoteCoin) {
        balance = quoteNormalBalance;
      }
      return Number(balance);
    },
    // 最小还款额度
    transferMinNum() {
      const {
        baseMinPayment,
        quoteMinPayment,
        baseCoin,
        quoteCoin,
      } = this.transferObj;
      let balance = '';
      if (this.transferCoin === baseCoin) {
        balance = baseMinPayment;
      } else if (this.transferCoin === quoteCoin) {
        balance = quoteMinPayment;
      }
      return Number(balance);
    },
  },
  methods: {
    init() {
      this.$bus.$on('coRepayment', (data) => {
        const { symbol, coin } = data;
        this.repaymentData = data;
        this.axiosFlag = true;
        this.symbol = symbol;
        this.transferFlag = true;
        this.transferCoin = coin;
        if (this.market) {
          this.getData();
        }
      });
    },
    getShowName(v) {
      let str = '';
      if (this.market) {
        const { coinList } = this.market;
        str = getCoinShowName(v, coinList);
      }
      return str;
    },
    getShowSymbol(v) {
      let str = '';
      if (this.symbolAll) {
        str = getCoinShowName(v, this.symbolAll);
      }
      return str;
    },
    // 获取数据
    getData() {
      this.axiosFlag = false;
      const params = {
        symbol: this.symbol,
      };
      this.axios({
        url: '/lever/finance/symbol/balance',
        params,
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.transferObj = data.data;
        }
      });
    },
    // 全部划转
    allTransfer() {
      const { Surplus } = this.repaymentMess;
      let sum = '';
      if (Number(Surplus) > Number(this.transferCanNum)) {
        sum = Number(this.transferCanNum);
      } else {
        sum = Number(Surplus);
      }
      this.transferValue = fixD(sum, this.returnFix);
    },
    inputLineChange(value, name) {
      this[name] = value;
    },
    clearTransfer() {
      this.transferFlag = false; // 资金划转弹窗开关变量
      this.transferValue = ''; // 划转数量
      this.transferCoin = ''; // 划转的币种
      this.transferConfirmLoading = false;
      this.$set(this, 'transferObj', {}); // // 当前划转币种对象
    },
    transferDialogClose() {
      this.clearTransfer();
    },
    transferDialogConfirm() {
      this.transferConfirmLoading = true;
      const params = {
        id: this.repaymentData.id,
        amount: this.transferValue,
      };
      this.axios({
        url: '/lever/finance/return',
        params,
      }).then((data) => {
        this.transferConfirmLoading = false;
        if (data.code.toString() === '0') {
          this.clearTransfer();
          this.$emit('success');
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
  },
};
