import {
  fixD, formatTime, colorMap, imgMap,
} from '@/utils';

export default {
  name: 'page-flowingWater',
  data() {
    return {
      imgMap,
      colorMap,
      tabelLoading: true,
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
    // market 接口
    market() { return this.$store.state.baseData.market; },
    // 表格title
    columns() {
      const list = [
        { title: this.$t('assets.bibaoAccount.coin'), width: '20%' }, // 币种
        { title: this.$t('assets.bibaoAccount.transferNum'), width: '10' }, // 转入数量
        { title: this.$t('assets.bibaoAccount.freed'), width: '20%' }, // 释放
        { title: this.$t('assets.bibaoAccount.startTime'), width: '12%' }, // 开始时间
        { title: this.$t('assets.bibaoAccount.endTime'), width: '12%' }, // 到期时间
        { title: this.$t('assets.bibaoAccount.status'), width: '30%' }, // 状态
      ];
      return list;
    },
    // 用于axios的symbol
    axiosSymbol() {
      if (this.symbol === 'all') {
        return null;
      }
      return this.symbol;
    },
  },
  watch: {
    market(v) { if (v) { this.setData(); } },
  },
  methods: {
    init() {
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
    setData() {
      const list = [{ code: 'all', value: this.$t('assets.otcFlowingWater.allCoin') }];
      Object.keys(this.market.coinList).forEach((item) => {
        list.push({ code: item, value: item });
      });
      this.symbolList = list;
      this.symbol = 'all';
      if (this.$route.query.symbol) {
        this.symbol = this.$route.query.symbol.toUpperCase();
      }
      this.getData();
    },
    getData() {
      this.axios({
        url: '/record/deposit_detail',
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          coinSymbol: this.axiosSymbol,
        },
      }).then((data) => {
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          const list = [];
          data.data.depositList.forEach((item, index) => {
            const { coinList } = this.market;
            const fix = (coinList[item.symbol] && coinList[item.symbol].showPrecision) || 0;
            list.push({
              id: index,
              data: [
                item.symbol, // 币种
                fixD(item.amount, fix),
                fixD(item.unlocked_amount, fix),
                formatTime(item.startDate),
                formatTime(item.expireDate),
                item.statusText, // 类型
              ],
            });
          });
          this.tabelList = list;
          this.paginationObj.total = data.data.count;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    pagechange(v) {
      this.paginationObj.currentPage = v;
      this.getData();
    },
  },
};
