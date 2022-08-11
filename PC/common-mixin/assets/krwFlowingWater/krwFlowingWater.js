import {
  fixD, timeFn, colorMap, imgMap,
} from '@/utils';


export default {
  name: 'page-flowingWater',
  data() {
    return {
      tabelLoading: true,
      imgMap,
      colorMap,
      nowType: 1, // 1为充值 2为提现
      symbol: '', // 当前币种
      tabelList: [], // table数据列表
      symbolList: [], // 币种选择列表
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
    };
  },
  computed: {
    navTab() {
      const arr = [
        { name: this.$t('assets.flowingWater.RechargeRecord'), index: 1 }, // 充值记录
        { name: this.$t('assets.flowingWater.WithdrawalsRecord'), index: 2 }, // 提现记录
      ];
      return arr;
    },
    // market 接口
    market() { return this.$store.state.baseData.market; },
    // 表格title
    columns() {
      let list = [];
      if (this.nowType === 1) {
        list = [
          { title: this.$t('assets.krw.rechargeList1'), width: '10%' }, // 申请时间
          { title: this.$t('assets.krw.rechargeList2'), width: '10%' }, // 到账时间
          { title: this.$t('assets.krw.rechargeList3'), width: '10%' }, // 币种
          { title: this.$t('assets.krw.rechargeList4'), width: '15%' }, // 充值金额
          { title: this.$t('assets.krw.rechargeList5'), width: '15%' }, // 到账金额
          { title: this.$t('assets.krw.rechargeList6') }, // 平台账户
          { title: this.$t('assets.krw.rechargeList7') }, // 状态
        ];
      } else if (this.nowType === 2) {
        list = [
          { title: this.$t('assets.krw.withdrawList1'), width: '15%' }, // 申请时间
          { title: this.$t('assets.krw.withdrawList2'), width: '25%', align: 'left' }, // 到账时间
          { title: this.$t('assets.krw.withdrawList3'), width: '10%' }, // 币种
          { title: this.$t('assets.krw.withdrawList4'), width: '10%' }, // 提现金额
          { title: this.$t('assets.krw.withdrawList5'), width: '10%' }, // 手续费
          { title: this.$t('assets.krw.withdrawList6'), width: '10%' }, // 用户银行账号
          { title: this.$t('assets.krw.withdrawList7'), width: '10%' }, // 状态
        ];
      }
      return list;
    },
    // 用于axios的symbol
    axiosSymbol() {
      if (this.symbol === 'all') {
        return '';
      }
      return this.symbol;
    },
    newcoinOpen() {
      return this.$store.state.baseData.newcoinOpen;
    },
  },
  watch: {
    market(v) { if (v) { this.setData(); } },
  },
  methods: {
    init() {
      // 如果没有 finance/account_balance 接口返回成功的数据
      if (!this.exchangeData) {
        this.$store.dispatch('assetsExchangeData');
      }
      if (this.market) { this.setData(); }
    },
    symbolChange(item) {
      this.symbol = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    // tab切换
    currentType(item) {
      this.nowType = item.index;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    setData() {
      const list = [{ code: 'all', value: this.$t('assets.flowingWater.allCoin') }];
      Object.keys(this.market.coinList).forEach((item) => {
        if (this.market.coinList[item].isFiat) {
          list.push({ code: item, value: item });
        }
      });
      this.symbolList = list;
      this.symbol = 'all';
      this.getData();
    },
    getData() {
      if (this.nowType === 1) {
        this.rechargeData();
      } else if (this.nowType === 2) {
        this.withdrawData();
      }
    },
    pagechange(v) {
      this.paginationObj.currentPage = v;
      this.getData();
    },
    // 充值数据
    rechargeData() {
      this.axios({
        url: 'fiat/deposit/list',
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          symbol: this.axiosSymbol,
        },
      }).then((data) => {
        if (this.nowType !== 1) return;
        if (data.code.toString() === '0') {
          const list = [];
          data.data.financeList.forEach((item, index) => {
            let time = item.updatedAt ? timeFn(new Date(item.updatedAt), 'yyyy-MM-dd hh:mm:ss')
              : '--';
            if (Number(item.status) === 2) {
              time = '--';
            }
            const { coinList } = this.market;
            const fix = (coinList[item.symbol] && coinList[item.symbol].showPrecision) || 0;
            list.push({
              id: index,
              data: [
                timeFn(new Date(item.createdAt), 'yyyy-MM-dd hh:mm:ss'), // 申请时间
                time, // 到账时间
                item.symbol, // 币种
                fixD(item.amount, fix), // 充值金额
                fixD(item.settledAmount, fix), // 到账金额
                item.companyCard, // 平台账户
                item.statusText, // 状态
              ],
            });
          });
          this.tabelLoading = false;
          this.tabelList = list;
          this.paginationObj.total = data.data.count;
        }
      });
    },
    // 提现数据
    withdrawData() {
      this.axios({
        url: 'fiat/withdraw/list',
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          symbol: this.axiosSymbol,
        },
      }).then((data) => {
        if (this.nowType !== 2) return;
        if (data.code.toString() === '0') {
          const list = [];
          data.data.financeList.forEach((item) => {
            let time = item.updatedAt
              ? timeFn(new Date(item.updatedAt), 'yyyy-MM-dd hh:mm:ss')
              : '--';
            if (Number(item.status) === 2) {
              time = '--';
            }
            let address = item.addressTo;
            if (this.isHavePage) {
              const [newAddress] = address.split('_')[0];
              address = newAddress;
            }
            const { coinList } = this.market;
            const fix = (coinList[item.symbol] && coinList[item.symbol].showPrecision) || 0;
            list.push({
              id: item.id,
              data: [
                timeFn(new Date(item.createdAt), 'yyyy-MM-dd hh:mm:ss'), // 申请时间
                time, // 到账时间
                item.symbol, // 币种
                fixD(item.amount, fix), // 提现金额
                fixD(item.fee, fix), // 手续费
                item.userCard, // 用户银行账号
                item.statusText, // 状态
              ],
            });
          });
          this.tabelLoading = false;
          this.tabelList = list;
          this.paginationObj.total = data.data.count;
        }
      });
    },
  },
};
