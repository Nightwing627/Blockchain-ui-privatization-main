import {
  fixD, formatTime, getCoinShowName, colorMap, imgMap,
} from '@/utils';


const bannerImgUrl = imgMap.jjrNeaderBg;
export default {
  name: 'orderList',
  data() {
    return {
      bannerImg: bannerImgUrl,
      bannerTitle: this.$t('manageFinances.manage_finances'), // '理财宝',
      tabelLoading: true,
      imgMap,
      colorMap,
      symbol: '', // 当前币种
      tabelList: [], // table数据列表
      financeListData: [],
      subTableDataId: '',
      subTableDataOpen: 0,
      subTableData: [],
      subContentId: null,
      symbolList: [], // 币种选择列表
      otherType: '', // type
      otherTypeList: [], // type选择列表
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
    };
  },
  computed: {
    coinList() {
      if (this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return null;
    },
    // market 接口
    market() { return this.$store.state.baseData.market; },
    // 表格title
    columns() {
      const list = [
        { title: this.$t('manageFinances.buyTime'), width: '8%' }, // 购买时间
        { title: this.$t('manageFinances.name'), width: '15%' }, // 项目名称
        { title: this.$t('manageFinances.orderNumber'), width: '15%' }, // 订单号
        { title: this.$t('manageFinances.coin'), width: '10%' }, // 币种
        { title: this.$t('manageFinances.number'), width: '15%' }, // 数量
        { title: this.$t('manageFinances.tablerate'), width: '10%' }, // 利率
        { title: this.$t('manageFinances.status'), width: '10%' }, // 状态
        { title: this.$t('manageFinances.operating'), width: '10%' }, // 操作
      ];
      return list;
    },
    subColumns() {
      return [
        this.$t('manageFinances.transferTime'), // 转出时间
        this.$t('manageFinances.returnCoin'), // 返还币种
        this.$t('manageFinances.returnNumber'), // 返还数量
        this.$t('manageFinances.type'), // 类型
      ];
    },
    // 用于axios的symbol
    axiosSymbol() {
      if (this.symbol === 'all') {
        return null;
      }
      return this.symbol;
    },
    // 用于axios的symbol
    axiostype() {
      if (this.otherType === 'all') {
        return null;
      }
      return this.otherType;
    },
  },
  watch: {
    market(v) { if (v) { this.setData(); } },
  },
  methods: {
    init() {
      if (this.market) { this.setData(); }
    },
    // 获取个人理财记录
    getDataList() {
      this.axios({
        url: this.$store.state.url.common.financingList,
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          coinSymbol: this.axiosSymbol,
          status: this.axiostype,
        },
        hostType: 'financing',
      }).then((data) => {
        if (data.code.toString() === '0') {
          const list = [];
          data.data.order_list.forEach((item, index) => {
            const { coinList } = this.market;
            const fix = (coinList[item.symbol] && coinList[item.symbol].showPrecision) || 0;
            list.push({
              id: index,
              data: [
                formatTime(item.ctime), // 时间
                item.name, // 项目名称
                item.order_id, // 订单号
                getCoinShowName(item.symbol, this.coinList), // 币种
                fixD(item.number, fix), // 数量
                item.rate, // 利率
                item.status_txt, // 状态
                this.handleButton(item.order_id),
              ],
            });
          });
          this.tabelLoading = false;
          this.tabelList = list;
          this.paginationObj.total = data.data.count;
        }
      });
    },
    symbolChange(item) {
      // this.subTableDataOpen = 0
      this.symbol = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      // this.subTableDataOpen = 0
      this.getDataList();
    },
    otherTypeChange(item) {
      // this.subTableDataOpen = 0
      this.otherType = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getDataList();
    },
    setData() {
      const list = [{ code: 'all', value: this.$t('assets.flowingWater.allCoin') }];
      Object.keys(this.market.coinList).forEach((item) => {
        if (this.market.coinList[item].isFiat) {
          return;
        }
        list.push({ code: item, value: getCoinShowName(item, this.coinList) });
      });
      this.symbolList = list;
      // console.log(this.symbolList);
      this.symbol = 'all';
      const otherlist = [
        { code: 'all', value: this.$t('manageFinances.allType') },
        { code: '1', value: this.$t('manageFinances.subscribed') },
        { code: '2', value: this.$t('manageFinances.interested') },
        { code: '3', value: this.$t('manageFinances.completed') },
      ];
      this.otherTypeList = otherlist;
      this.otherType = this.otherTypeList[0].code;
      this.getDataList();
    },
    pagechange(v) {
      this.paginationObj.currentPage = v;
      this.getDataList();
    },
    // 详情列表
    tableClick(type, id) {
      this.subTableDataId = id.id;
      this.subTableData = [];
      this.axios({
        url: this.$store.state.url.common.financingListDet,
        headers: {},
        params: {
          order_id: type,
        },
        method: 'post',
        hostType: 'financing',
      }).then((data) => {
        if (data.code.toString() === '0') {
          data.data.return_list.forEach((item) => {
            const { coinList } = this.market;
            const fix = (coinList[item.symbol] && coinList[item.symbol].showPrecision) || 0;
            let detailtype = null;
            if (item.type === 0) {
              detailtype = this.$t('manageFinances.interest');
            } else {
              detailtype = this.$t('manageFinances.principal');
            }
            // console.log(type)
            this.subTableData.push([
              formatTime(item.return_time), // 地址
              item.symbol,
              fixD(item.number, fix),
              detailtype,
            ]);
          });
        }
      });
    },
    handleButton(item) {
      const arr = [];
      arr.push({
        type: 'subTable',
        text: this.$t('trade.view'), // 详情
        eventType: item,
        // orderId: item,
      });
      return arr;
    },
  },
};
