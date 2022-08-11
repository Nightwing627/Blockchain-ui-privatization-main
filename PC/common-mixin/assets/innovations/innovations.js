import {
  fixD, formatTime, getCoinShowName, colorMap, imgMap,
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
      investSymbol: null,
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
    };
  },
  computed: {
    // 全部币种列表
    coinList() {
      if (this.$store.state.baseData && this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return null;
    },
    statusList() {
      return [
        this.$t('innov.have'), // 进行中
        this.$t('innov.financing'), // 募集成功
        this.$t('innov.end'), // 募集结束
      ];
    },
    // market 接口
    market() { return this.$store.state.baseData.market; },
    // 表格title
    columns() {
      const list = [
        {
          title: this.$t('innov.purchase_time'), // '申购时间',
          width: '100px',
        },
        {
          title: this.$t('innov.purchase'), // '申购订单编号',
          width: '200px',
        },
        {
          title: this.$t('innov.entry'), // '项目名称',
        },
        {
          title: this.$t('innov.purchase_amount'), // '申购金额',
          width: '150px',
        },
        {
          title: this.$t('innov.obtain_token'), // '获得代币',
          width: '100px',
        },
        {
          title: this.$t('innov.state'), // '状态',
          width: '100px',
        },
        {
          title: this.$t('innov.operation'), // '操作',
          width: '100px',
        },
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
    setData() {
      const list = [{ code: 'all', value: this.$t('assets.otcFlowingWater.allCoin') }];
      Object.keys(this.market.coinList).forEach((item) => {
        if (this.market.coinList[item].otcOpen === 1) {
          list.push({ code: item, value: item });
        }
      });
      this.symbolList = list;
      this.symbol = 'all';
      this.getData();
    },
    getData() {
      this.axios({
        url: '/newcoin/invest_manage_list',
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
        },
      }).then((data) => {
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          const list = [];
          if (data.data.record.length) {
            data.data.record.forEach((item) => {
              this.investSymbol = item.investSymbol;
              const { coinList } = this.market;
              const investFix = coinList[item.investSymbol]
                ? coinList[item.investSymbol].showPrecision : 0;
              const tokenFix = coinList[item.tokenSymbol]
                ? coinList[item.tokenSymbol].showPrecision : 0;
              list.push({
                id: item.projectId,
                data: [
                  formatTime(item.orderTime), // 时间
                  item.orderId, // 订单编号
                  item.name, // 项目名称
                  `${fixD(item.investAmount, investFix)}
                    ${getCoinShowName(item.investSymbol, coinList)}`, // 申购金额
                  `${fixD(item.tokenAmount, tokenFix)}
                    ${getCoinShowName(item.tokenSymbol, coinList)}`, // 获得代币数量
                  // this.statusList[item.status - 2], // 状态
                  this.setStatusText(item),
                  [
                    {
                      type: 'button',
                      text: this.$t('innov.view_details'),
                      iconClass: [''],
                      eventType: 'view',
                      classes: this.classesVieew(item),
                    },
                  ],
                ],
              });
            });
            this.tabelList = list;
            this.paginationObj.total = data.data.count;
          }
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    pagechange(v) {
      this.paginationObj.currentPage = v;
      this.getData();
    },
    goViewPage(type, data) {
      this.$router.push(`/innovation/${data}`);
    },
    classesVieew(item) {
      if (item.status === 7) {
        return 'noshow';
      }
      return [];
    },
    setStatusText(data) {
      let text = '';
      switch (data.status) {
        case 2:
          text = this.$t('innov.status1'); // '预热中';
          break;
        case 3:
          text = this.$t('innov.status2'); // '进行中';
          break;
        case 4:
          text = this.$t('innov.status3'); // '募集完成';
          break;
        case 5:
          text = this.$t('innov.status4'); // '发放TOKEN';
          break;
        default:
          text = this.$t('innov.status5'); // '退还申购基金';
      }
      return text;
    },
  },
};
