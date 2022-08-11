import { fixD, fixInput, getCoinShowName } from '@/utils';

export default {
  name: 'page-withdraw',
  data() {
    return {
      tabelLoading: true,
      tabelList: [],
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      messData: {}, // 当前币对信息
      broCoin: '', // 当前借贷的币种
      broNum: '', // 借贷数量
      btnLoading: false, // loading
      subContent: [], // 展开的数据
      subColumns: [], // 展开的表头
      subContentId: 0, // 展开的id
      subLoading: false, // 展开的loading
      dataList: {},
    };
  },
  filters: {
    fixDFn(v, that, type) {
      return fixD(v, that.coinFix[type]);
    },
    rateFix(v) {
      const data = v || 0;
      return `${fixD(data * 100, 2)}%`;
    },

  },
  watch: {
    messData(v) {
      if (Object.keys(v).length) {
        this.broCoin = v.baseCoin;
      }
    },
    broNum(v) {
      this.broNum = fixInput(v, this.coinFix[this.broMessage.type]);
    },
  },
  computed: {
    btnDisabled() {
      let flag = true;
      if (this.broErrorObj.flag || this.btnLoading) {
        flag = false;
      }
      return flag;
    },
    // 借贷币种的信息
    broMessage() {
      const obj = {
        total: '0', // 总额度
        can: '0', // 可借
        borrowed: '0', // 已借
        type: 'base',
        min: '0', // 最小借贷量
      };
      const {
        baseCoin,
        baseTotalBorrow,
        baseCanBorrow,
        baseBorrowBalance,
        baseMinBorrow,
        quoteCoin,
        quoteTotalBorrow,
        quoteCanBorrow,
        quoteBorrowBalance,
        quoteMinBorrow,
      } = this.messData;
      if (this.broCoin === baseCoin) {
        obj.total = baseTotalBorrow || 0;
        obj.can = baseCanBorrow || 0;
        obj.borrowed = baseBorrowBalance || 0;
        obj.type = 'base';
        obj.min = baseMinBorrow || 0;
      } else if (this.broCoin === quoteCoin) {
        obj.total = quoteTotalBorrow || 0;
        obj.can = quoteCanBorrow || 0;
        obj.borrowed = quoteBorrowBalance || 0;
        obj.type = 'quote';
        obj.min = quoteMinBorrow || 0;
      }
      return obj;
    },
    // 全部币对列表
    symbolAll() { return this.$store.state.baseData.symbolAll; },
    // market 接口
    market() { return this.$store.state.baseData.market || {}; },
    // 表格title
    columns() {
      return [
        { title: this.$t('assets.leverageToLoan.list1'), width: '10%' }, // 申请时间
        { title: this.$t('assets.leverageToLoan.list2'), width: '10%', align: 'left' }, // 杠杆账户
        { title: this.$t('assets.leverageToLoan.list3'), width: '10%' }, // 币种
        { title: this.$t('assets.leverageToLoan.list4'), width: '15%' }, // 数量
        { title: this.$t('assets.leverageToLoan.list5'), width: '10%' }, // 利率
        { title: this.$t('assets.leverageToLoan.list6'), width: '15%' }, // 未还利息
        { title: this.$t('assets.leverageToLoan.list7'), width: '15%' }, // 未还数量
        { title: this.$t('assets.leverageToLoan.list8'), width: '15%' }, // 操作
      ];
    },
    coinFix() {
      const { coinList } = this.market;
      const obj = {
        base: 0,
        quote: 0,
      };
      if (coinList && Object.keys(this.messData).length) {
        const { baseCoin, quoteCoin } = this.messData;
        if (coinList[baseCoin]) {
          obj.base = coinList[baseCoin].showPrecision;
        }
        if (coinList[quoteCoin]) {
          obj.quote = coinList[quoteCoin].showPrecision;
        }
      }
      return obj;
    },
    broWarningText() {
      const { can, type } = this.broMessage;
      const num = fixD(can, this.coinFix[type]);
      return `${this.$t('assets.leverageToLoan.canToLoan')} ${num} ${this.getShowName(this.broCoin)}`;
    },
    broErrorObj() {
      const obj = {
        flag: false, // 是否通过验证
        text: '', // 错误文案
        showError: false, // 是否提示错误
      };
      if (Number(this.broNum) === 0) {
        obj.flag = false;
        obj.text = '';
        obj.showError = false;
      } else if (Number(this.broNum) > Number(this.broMessage.can)) {
        obj.flag = false;
        // 借贷数量不得大于可借贷数量
        obj.text = this.$t('assets.leverageToLoan.inputError1');
        obj.showError = true;
      } else if (Number(this.broNum) < Number(this.broMessage.min)) {
        obj.flag = false;
        const { min, type } = this.broMessage;
        const num = fixD(min, this.coinFix[type]);
        // 借贷数量不得小于
        const str = this.$t('assets.leverageToLoan.inputError2');
        obj.text = `${str} ${num} ${this.broCoin}`;
        obj.showError = true;
      } else {
        obj.flag = true;
        obj.text = '';
        obj.showError = false;
      }
      return obj;
    },
  },
  methods: {
    init() {
      // 如果不存在币种跳走
      if (this.$route.query.symbol) {
        this.symbol = this.$route.query.symbol.toUpperCase();
      } else {
        this.$router.push('assets/leverageAccount');
      }
    },
    getShowSymbol(v) {
      let str = '';
      if (this.symbolAll) {
        str = getCoinShowName(v, this.symbolAll);
      }
      return str;
    },
    getShowName(v) {
      let str = '';
      if (this.market) {
        const { coinList } = this.market;
        str = getCoinShowName(v, coinList);
      }
      return str;
    },
    rateFixFn(v) {
      return `${fixD(v * 100, 2)}%`;
    },
    // 全部借贷
    allBro() {
      this.broNum = this.broMessage.can;
    },
    transferSuccess() {
      this.getData();
    },
    getData() {
      const params = {
        symbol: this.symbol,
      };
      // fetch('http://localhost:7001/financeLeverageFinance').then((data) => {
      //   return data.json()
      // }).then((data) => {
      //   if(data.code.toString() === '0') {
      //     this.messData = data.data
      //   }
      // })
      this.axios({
        url: '/lever/finance/symbol/balance',
        params,
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.messData = data.data;
        }
      });
    },
    // 划转
    transfer(coin) {
      this.$bus.$emit('coTransfer', this.messData.symbol, coin);
    },
    // 修改借贷币种
    setBroCoin(v) {
      if (this.broCoin === v) return;
      this.broCoin = v;
      this.broNum = '';
    },
    inputChange(v, name) {
      this[name] = v;
    },
    // 借贷点击
    broClick() {
      this.btnLoading = true;
      this.axios({
        url: '/lever/finance/borrow',
        params: {
          symbol: this.symbol,
          coin: this.broCoin,
          amount: this.broNum,
        },
      }).then((data) => {
        this.btnLoading = false;
        if (data.code.toString() === '0') {
          this.getData();
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.broNum = '';
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
      // fetch('http://localhost:7001/leverFinanceTransfer').then((data) => {
      //   return data.json()
      // })
    },
    tableClick(type, data) {
      if (type === 'repayment') {
        const obj = this.dataList[data];
        this.$bus.$emit('coRepayment', obj);
      } else if (type === 'details') {
        this.getSubTableData(data);
      }
    },
    typeText(v) {
      let str = '';
      switch (v) {
        case '1':
          str = this.$t('assets.leverageToLoan.typeText1');
          break;
        case '2':
          str = this.$t('assets.leverageToLoan.typeText2');
          break;
        default:
          str = this.$t('assets.leverageToLoan.typeText3');
      }
      return str;
    },
  },
};
