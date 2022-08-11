import {
  fixD, formatTime, imgMap, getCoinShowName,
} from '@/utils';

export default {
  name: 'brokerView',
  data() {
    return {
      pullUpState: 0,
      headClasses: '',
      bodyClasses: '',
      tableLoading: false,
      backgroundImg: `background: url(${imgMap.jjrNeaderBg})  center bottom no-repeat #0E1A2E`,
      myData: {},
      tableData: {},
      tableType: 'return_list',
      searchValue: null,
      bonusAmount: null,
      bonusCoinName: null,
      // 筛选币种
      startTime: '',
      endTime: '',
      pagination: { // 翻页数据
        count: 0, // 总数量
        pageSize: 10, // 每页显示条数
        page: 1, // 当前页数
      },
      uid: null,
    };
  },
  watch: {
    isLogin(val) {
      if (val) {
        this.getData();
      }
    },
  },
  computed: {
    startTimeText() {
      return this.$t('broker.startTime'); // '起始时间';
    },
    endTimeText() {
      return this.$t('broker.endTime'); // '截止时间';
    },
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    coinList() {
      if (this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return null;
    },
    columns() {
      return [
        {
          title: this.$t('broker.time'),
          width: '100px',
        },
        {
          title: this.$t('broker.scale'), // '返佣比例',
        },
        {
          title: `${this.$t('broker.fee')}(${getCoinShowName(this.bonusCoinName, this.coinList)})`,
        },
        {
          title: `${this.$t('broker.amount')}(${getCoinShowName(this.bonusCoinName, this.coinList)})`,
        },
      ];
    },
    dataList() {
      if (this.tableData && this.tableData.length) {
        const dataArr = [];
        this.tableData.forEach((item) => {
          dataArr.push({
            id: item.uid,
            data: [
              formatTime(item.time), // 时间
              item.scale, // 返佣比例
              `${this.fixDFun(item.fee, item.feeCoin)}
                ${getCoinShowName(item.feeCoin, this.coinList)}`, // 手续费
              `${this.fixDFun(item.bonus, item.bonusCoin)}
                ${getCoinShowName(item.bonusCoin, this.coinList)}`, // 返佣额度
            ],
          });
        });
        return dataArr;
      }
      return [];
    },
  },
  methods: {
    init() {
      this.uid = this.$route.params.item;
      if (this.isLogin) {
        this.getData();
      }
    },
    // 下拉刷新
    onRefresh(done) {
      this.tableData = [];
      this.tableLoading = true;
      this.pagination.page = 1;
      this.getData();
      done();
    },
    onInfiniteLoads(done) {
      if (this.pullUpState === 0) {
        this.pullUpState = 2;
        this.pagination.page += 1;
        this.getData();
      }
      done();
    },
    fixDFun(val, symbol) {
      if (this.showPrecision(symbol)) {
        return fixD(val, this.showPrecision(symbol));
      }
      return val;
    },
    showPrecision(symbol) {
      if (this.$store.state.baseData && this.$store.state.baseData.market) {
        const { coinList } = this.$store.state.baseData.market;
        if (coinList[symbol]) {
          const precision = coinList[symbol].showPrecision;
          if (precision) {
            return precision;
          }
        }
      }
      return 4;
    },
    // 请求数据
    getData(ajaxUrl) {
      this.tableLoading = true;
      const url = ajaxUrl || this.$store.state.url.common.agent_data_info_query;
      this.axios({
        url,
        params: {
          pageNum: this.pagination.page,
          pageSize: this.pagination.pageSize,
          uid: this.uid,
          startTime: this.startTime,
          endTime: this.endTime,
        },
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          this.tableData = data.data.mapList;
          this.pagination.count = data.data.count;
          this.bonusAmount = data.data.bonusAmount;
          this.bonusCoinName = data.data.bonusCoinName;
          if (Math.ceil(parseFloat(data.data.count) / parseFloat(this.pagination.pageSize))
            > this.pagination.page) {
            this.pullUpState = 0;
          } else {
            this.pullUpState = 3;
          }
        }
        this.tableLoading = false;
      });
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map((v) => filterVal.map((j) => v[j]));
    },
    // 选择时间
    onChangeCalendar(data, name) {
      this[name] = data;
      if (this.startTime && this.endTime) {
        this.tableData = [];
        this.tableLoading = true;
        this.pagination.page = 1;
        this.pullUpState = 0;
        this.getData();
      }
    },
    // select 选择事件
    selectOnChange(data, name) {
      this[name] = data.code;
    },
  },
};
