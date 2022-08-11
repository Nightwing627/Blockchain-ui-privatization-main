import { fixD, formatTime } from '@/utils';

export default {
  name: 'page-flowingWater',
  data() {
    return {
      tabelLoading: true,
      tabelList: [], // table数据列表
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      detailsData: {},
      pullUpState: 0,
    };
  },
  computed: {
    navList() {
      return [
        {
          text: this.$t('assets.coAccount.listTitle'),
          link: '/assets/coAccount',
        },
        {
          text: this.$t('assets.index.flowingWater'),
          link: '/assets/coFlowingWater',
          active: true,
        },
      ];
    },
    tradeLinkUrl() {
      if (process.env.NODE_ENV === 'development') {
        return '/co/trade';
      }
      if (this.$store.state.baseData && this.$store.state.baseData.publicInfo) {
        return `${this.linkurl.mcoUrl}/trade`;
      }
      return '';
    },
    // market 接口
    market() { return this.$store.state.baseData.market; },
    // 表格title
    columns() {
      const list = [
        { title: this.$t('assets.coFlowingWater.list1'), width: '10%' }, // 时间
        { title: this.$t('assets.coFlowingWater.list2'), width: '20%' }, // 类型
        { title: this.$t('assets.coFlowingWater.list3'), width: '20%' }, // 金额
        { title: this.$t('assets.coFlowingWater.list4'), width: '20%' }, // 合约
        { title: this.$t('assets.coFlowingWater.list5'), width: '30%' }, // 合约账户
      ];
      return list;
    },
  },
  methods: {
    // 下拉刷新
    onRefresh(done) {
      this.tabelList = [];
      this.tabelLoading = true;
      this.paginationObj.currentPage = 1;
      this.getData();
      done();
    },
    onInfiniteLoads(done) {
      if (this.pullUpState === 0) {
        this.pullUpState = 2;
        this.paginationObj.currentPage += 1;
        this.getData();
      }
      done();
    },
    getDetailData() {
      this.axios({
        url: 'account_balance',
        hostType: 'co',
      }).then((data) => {
        if (data.code.toString() === '0') {
          const [arr] = data.data;
          this.detailsData = arr;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    getData() {
      this.axios({
        url: 'business_transation_list',
        hostType: 'co',
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
        },
      }).then((data) => {
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          const list = [];
          data.data.transactionsList.forEach((item, index) => {
            list.push({
              id: index,
              // title: [
              //   {
              //     text:
              //   },
              // ],
              data: [
                formatTime(item.ctimeL), // 时间
                item.sceneStr, // 类型
                `${fixD(item.amountStr, item.showPrecision)} ${item.quoteSymbol}`, // 金额
                item.address, // 合约
                item.accountBalance,
              ],
            });
          });
          this.tabelList = [...[], ...this.tabelList, ...list];
          if (Math.ceil(parseFloat(data.data.count) / parseFloat(this.paginationObj.display))
            > this.paginationObj.currentPage) {
            this.pullUpState = 0;
          } else {
            this.pullUpState = 3;
          }
          // this.paginationObj.total = data.data.count;
        } else {
          this.pullUpState = 0;
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
  },
};
