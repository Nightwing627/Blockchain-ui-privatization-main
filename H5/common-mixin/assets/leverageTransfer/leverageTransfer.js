import {
  fixD,
  fixInput,
  getCoinShowName,
} from '@/utils';

export default {
  data() {
    return {
      loading: false,
      transferConfirmLoading: false,
      transferFlag: false, // 资金划转弹窗开关变量
      transferSide: '1', // 划转方向 1 为从现货到杠杆  2 为杠杆到现货
      transferValue: '', // 划转数量
      transferCoin: '', // 划转的币种
      transferObj: {}, // 当前划转币种对象
      axiosFlag: false,
      symbol: '',
      defineCoin: '',
    };
  },
  watch: {
    market(v) { if (v && this.axiosFlag) { this.getData(); } },
    transferObj(v) {
      if (Object.keys(v).length) {
        if (this.defineCoin) {
          this.transferCoin = this.defineCoin;
        } else {
          this.transferCoin = v.baseCoin;
        }
      }
    },
    transferValue(v) {
      this.transferValue = fixInput(v, this.transferCoinFix);
    },
  },
  computed: {
    market() { return this.$store.state.baseData.market; },
    side() {
      const ex = this.$t('assets.otcAccount.exchangeAccount');
      const otc = this.$t('assets.leverageTransfer.leverageAccount');
      let from = '';
      let to = '';
      if (this.transferSide === '1') {
        from = ex;
        to = otc;
      } else {
        from = otc;
        to = ex;
      }
      return {
        from,
        to,
      };
    },
    transferWarningText() {
      const text = this.$t('assets.otcAccount.can'); // 可转
      const num = fixD(this.transferCanNum, this.transferCoinFix);
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
    // 弹窗是否可点击
    transferConfirmDisabled() {
      if (this.transferConfirmLoading) { return false; }
      let flag = true;
      if (parseFloat(this.transferValue) > 0 && !this.transferError) {
        flag = false;
      }
      return flag;
    },
    transferError() {
      let flag = false;
      if (parseFloat(this.transferValue) > parseFloat(this.transferCanNum)) {
        flag = true;
      }
      return flag;
    },
    // 可划转数量
    transferCanNum() {
      const {
        baseCanTransfer,
        quoteCanTransfer,
        baseExNormalBalance,
        quoteEXNormalBalance,
        baseCoin,
        quoteCoin,
      } = this.transferObj;
      let coBalance = '';
      let exBalance = '';
      if (this.transferCoin === baseCoin) {
        coBalance = baseCanTransfer;
        exBalance = baseExNormalBalance;
      } else if (this.transferCoin === quoteCoin) {
        coBalance = quoteCanTransfer;
        exBalance = quoteEXNormalBalance;
      }
      let balance = '';
      if (this.transferSide === '1') {
        balance = exBalance;
      } else {
        balance = coBalance;
      }
      return Number(balance);
    },
  },
  methods: {
    init() {
      this.$bus.$on('coTransfer', (symbol, coin) => {
        this.axiosFlag = true;
        this.symbol = symbol;
        this.transferFlag = true;
        this.loading = true;
        if (coin) {
          this.defineCoin = coin;
        }
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
        this.loading = false;
        if (data.code.toString() === '0') {
          this.transferObj = data.data;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 切换币种
    transferCoinChange(v) {
      if (this.transferCoin === v) return;
      this.transferCoin = v;
      this.transferValue = ''; // 重置划转数量
    },
    // 修改划转方向
    setTransferSide() {
      if (this.transferSide === '1') { this.transferSide = '2'; } else if (this.transferSide === '2') { this.transferSide = '1'; }
      this.transferValue = ''; // 重置划转数量
    },
    // 全部划转
    allTransfer() {
      this.transferValue = fixD(this.transferCanNum, this.transferCoinFix);
    },
    inputLineChange(value, name) {
      this[name] = value;
    },
    clearTransfer() {
      this.transferFlag = false; // 资金划转弹窗开关变量
      this.transferSide = '1'; // 划转方向 1 为从现货到杠杆  2 为杠杆到现货
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
        fromAccount: this.transferSide === '1' ? '1' : '2',
        toAccount: this.transferSide === '1' ? '2' : '1',
        amount: this.transferValue,
        coinSymbol: this.transferCoin,
        symbol: this.transferObj.symbol,
      };
      this.axios({
        url: '/lever/finance/transfer',
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
