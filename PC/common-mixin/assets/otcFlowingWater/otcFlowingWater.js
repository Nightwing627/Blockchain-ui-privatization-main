import {
  fixD, colorMap, imgMap, getCoinShowName,
} from '@/utils';


export default {
  name: 'page-flowingWater',
  data() {
    return {
      tabelLoading: true,
      imgMap,
      colorMap,
      type: 'all', // 当前类型
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
    typeList() {
      return [
        { code: 'all', value: this.$t('assets.otcFlowingWater.all') }, // 全部
        { code: '1', value: this.$t('assets.otcFlowingWater.inOtc') }, // 转入场外
        { code: '2', value: this.$t('assets.otcFlowingWater.outOtc') }, // 转出场外
      ];
    },
    // market 接口
    market() { return this.$store.state.baseData.market; },
    // 表格title
    columns() {
      const list = [
        { title: this.$t('assets.otcFlowingWater.listTime'), width: '20%' }, // 时间
        { title: this.$t('assets.otcFlowingWater.listCoin'), width: '20%' }, // 币种
        { title: this.$t('assets.otcFlowingWater.listType'), width: '20%' }, // 类型
        { title: this.$t('assets.otcFlowingWater.listVolume'), width: '40%' }, // 数量
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
    // 用于axios的type
    axiosType() {
      if (this.type === 'all') {
        return null;
      }
      return this.type;
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
    typeChange(item) {
      this.type = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    setData() {
      const list = [{ code: 'all', value: this.$t('assets.otcFlowingWater.allCoin') }];
      Object.keys(this.market.coinList).forEach((item) => {
        if (this.market.coinList[item].otcOpen === 1) {
          list.push({
            value: getCoinShowName(item, this.market.coinList),
            code: item,
          });
        }
      });
      this.symbolList = list;
      this.symbol = 'all';
      this.getData();
    },
    getData() {
      this.axios({
        url: '/record/otc_transfer_list',
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          coinSymbol: this.axiosSymbol,
          transactionType: this.axiosType,
        },
      }).then((data) => {
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          const list = [];
          data.data.financeList.forEach((item, index) => {
            const { coinList } = this.market;
            const fix = (coinList[item.coinSymbol] && coinList[item.coinSymbol].showPrecision) || 0;
            list.push({
              id: index,
              data: [
                item.createTime, // 时间
                getCoinShowName(item.coinSymbol, coinList), // 币种
                item.transactionType_text, // 类型
                fixD(item.amount, fix), // 充值数量
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
