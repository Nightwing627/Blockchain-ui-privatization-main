import {
  fixD,
  formatTime,
  myStorage,
  getCoinShowName,
} from '@/utils';

export default {
  name: 'orderList',
  data() {
    return {
      orderType: 1, // 订单类型 1: 当前委托 2:历史委托
      pagination: { // 翻页数据
        count: 0, // 总数量
        pageSize: 10, // 每页显示条数
        page: 1, // 当前页数
      },
      subTableDataId: null,
      subTableDataIds: null,
      // 当前货币对
      symbolCurrent: myStorage.get('leverSymbolName'),
      // 撤销订单 防止重复点击
      cancelFla: true,
      getDataInter: null,
      subTableData: [],
      subLoading: false,
      orderIdArrar: [],
      tableLoading: false,
      cancelOrderId: null,
      timer: 15000,
      cellHeight: 56,
      // 上拉加载的设置
      pullUpState: 0, // 子组件的pullUpState状态
      dataList: [],
      detailsBox: false,
      detailsSymbol: '',
      detailsSide: '',
    };
  },
  props: {
    moduleType: {
      type: String,
      default: 'ex',
    },
  },
  watch: {
    isLogin(val) {
      if (val) {
        this.getData();
      }
    },
    orderData(val) {
      if (val) {
        if (val.count > 0) {
          this.timer = 2000;
        } else {
          this.timer = 15000;
        }
        // 轮训请求数据
        this.intervalGet();
        this.tableLoading = false;
        this.pagination.count = val.count;
        if (Math.ceil(parseFloat(val.count) / parseFloat(this.pagination.pageSize))
          > this.pagination.page) {
          this.pullUpState = 0;
        } else {
          this.pullUpState = 3;
        }
        if (val.orderType === 1) {
          const formDataList = this.formData(this.orderData.orderList, this.cancelOrderId);
          if (this.pagination.page > 1) {
            this.dataList = this.dataList.concat(formDataList);
          } else {
            this.dataList = formDataList;
          }
        } else if (val.orderType === 2) {
          if (this.pagination.page > 1) {
            this.dataList = this.dataList.concat(this.formHistoryData(this.orderData.orderList));
          } else {
            this.dataList = this.formHistoryData(this.orderData.orderList);
          }
        } else {
          this.dataList = [];
        }
      }
    },
    subData(val) {
      if (val) {
        this.subLoading = false;
        if (val.id === this.subTableDataId) {
          this.subTableData = this.setSubTableData(val.trade_list);
        }
      }
    },
  },
  computed: {
    titleBlockClass() {
      if (this.$store.state.baseData.templateLayoutType === '2') {
        return 'a-4-bg';
      }
      return 'a-7-bg';
    },
    // 是否Login
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    subData() {
      return this.$store.state.tradeOrderList.subTableData;
    },
    // tab 项
    tabTypeItem() {
      return [
        this.$t('trade.activeOrder'), // 当前委托
        this.$t('trade.historyOrder'), // 历史委托
      ];
    },
    // 表头
    columns() {
      if (this.orderType === 2) {
        return [
          {
            title: this.$t('trade.time'), // '时间',
          },
          {
            title: this.$t('trade.transaction'), // '交易对'
          },
          {
            title: `${this.$t('trade.price')}(${this.getShowName(this.symbolUnit.units)})`, // 价格
          },
          {
            title: `${this.$t('trade.number')}(${this.getShowName(this.symbolUnit.symbol)})`, // 数量
          },
          {
            title: this.$t('trade.average'), // '成交均价'
          },
          {
            title: this.$t('trade.status'), // '状态'
          },
          // {
          //   title: this.$t('trade.opera'), // '操作'
          // },
        ];
      }
      return [
        {
          title: this.$t('trade.time'), // '时间',
        },
        {
          title: `${this.$t('trade.price')}(${this.getShowName(this.symbolUnit.units)})`, // 价格
        },
        {
          title: `${this.$t('trade.number')}(${this.getShowName(this.symbolUnit.symbol)})`, // 数量
        },
        {
          title: `${this.$t('trade.dealMoney')}(${this.getShowName(this.symbolUnit.units)})`, // 交易额
        },
        {
          title: this.$t('trade.average'), // '成交均价'
        },
        {
          title: `${this.$t('trade.deal')}/${this.$t('trade.noDeal')}`, // 已成交/未成交
        },
        {
          title: this.$t('trade.opera'), // '操作'
          classes: 'opera',
        },
      ];
    },
    subColumns() {
      return [
        { title: this.$t('trade.time') },
        { title: this.$t('trade.price') },
        { title: this.$t('trade.number') },
        { title: this.$t('trade.turnover') },
        { title: this.$t('trade.serviceCharge') },
      ];
    },
    // 当前币对小写
    symbols() {
      if (this.symbolCurrent) {
        const symbolArr = this.symbolCurrent.split('/');
        const symbol = symbolArr[0].toLowerCase() + symbolArr[1].toLowerCase();
        return symbol;
      }
      return null;
    },
    // 全部币对列表
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },
    // 当前币对
    symbolUnit() {
      if (this.symbolCurrent) {
        return {
          symbol: this.symbolCurrent.split('/')[0],
          units: this.symbolCurrent.split('/')[1],
        };
      }
      return {};
    },
    // 当前币对精度计算的值
    fixValue() {
      if (this.symbolAll && this.symbolCurrent) {
        const symbol = this.symbolAll[this.symbolCurrent];
        return {
          priceFix: symbol.price,
          volumeFix: symbol.volume,
        };
      }
      return {
        priceFix: 2,
        volumeFix: 8,
      };
    },
    orderData() {
      if (this.$store.state.tradeOrderList) {
        return this.$store.state.tradeOrderList.nowOrderData;
      }
      return null;
    },
    hisData() {
      if (this.$store.state.tradeOrderList) {
        return this.$store.state.tradeOrderList.historyData;
      }
      return null;
    },
  },
  methods: {
    init() {
      // 获取 当前选中的货币对
      this.symbolCurrent = myStorage.get('sSymbolName');
      if (this.moduleType === 'lever') {
        this.symbolCurrent = myStorage.get('leverSymbolName');
      }
      if (this.isLogin) {
        this.getData();
        // 轮训请求数据
        this.intervalGet();
      }
      this.$bus.$on('SYMBOL_CURRENT', (val) => {
        this.symbolCurrent = val;
        if (this.isLogin) {
          this.pagination.page = 1;
          this.subTableDataId = null;
          this.tableLoading = true;
          this.getData();
        }
      });
      // 监听下单成功
      this.$bus.$on('ORDER_CREATE', () => {
        this.pagination.page = 1;
        this.getData();
      });
    },
    getShowSymbol(v) {
      let str = '';
      const showNameSymbols = this.$store.state.baseData.symbolAll;
      if (showNameSymbols) {
        str = getCoinShowName(v, showNameSymbols);
      }
      return str;
    },
    getShowName(v) {
      let str = '';
      const showNameMarket = this.$store.state.baseData.market;
      if (showNameMarket) {
        const { coinList } = showNameMarket;
        str = getCoinShowName(v, coinList);
      }
      return str;
    },
    detailsClose() {
      this.detailsBox = false;
    },
    // 轮训请求数据
    intervalGet() {
      clearInterval(this.getDataInter);
      this.getDataInter = setInterval(() => {
        this.getData(true);
      }, this.timer);
    },
    // 判断 限价单 还是 市价单
    setPrice(data) {
      if (data.type === 1) {
        return fixD(data.price, this.fixValue.priceFix);
      }
      return this.$t('trade.marketPrice');
    },
    // 格式化数据
    formData(data, cancelOrderId) {
      const dataArray = data || [];
      const newData = [];
      if (dataArray.length) {
        dataArray.forEach((item) => {
          if (cancelOrderId !== item.id) {
            const tableData = {
              id: item.id,
              title: [
                {
                  text: item.side_text,
                  classes: item.side === 'BUY' ? 'u-1-cl' : 'u-4-cl',
                  disabled: true,
                },
                {
                  text: this.getShowSymbol(`${item.baseCoin}/${item.countCoin}`),
                },
              ],
              handle: [
                {
                  text: this.$t('trade.cancelOrder'), // 撤单
                  eventType: 'cancel',
                  classes: '',
                },
              ],
              data: [
                {
                  text: formatTime(item.time_long),
                },
                {
                  text: this.setPrice(item),
                },
                {
                  text: fixD(item.volume, this.fixValue.volumeFix),
                },
                {
                  text: fixD(item.total_price, this.fixValue.priceFix),
                },
                {
                  text: fixD(item.avg_price, this.fixValue.priceFix),
                },
                {
                  text: `${fixD(item.deal_volume, this.fixValue.volumeFix)} /
                  ${fixD(item.remain_volume, this.fixValue.volumeFix)}`,
                },
              ],
            };
            newData.push(tableData);
          }
        });
        return newData;
      }
      return [];
    },
    // 历史委托数据格式化
    formHistoryData(data) {
      const dataArray = data || [];
      const newData = [];
      const idArr = [];
      if (dataArray.length) {
        dataArray.forEach((item) => {
          idArr.push(item.id);
          let subTableBtn = [];
          if (item.status === 2 || (item.status === 4 && parseFloat(item.deal_volume) !== 0)) {
            subTableBtn = [
              {
                type: 'subTable',
                text: this.$t('trade.view'), // 详情
                eventType: 'view',
              },
            ];
          } else {
            subTableBtn = [
              {
                type: 'subTable',
                text: this.$t('trade.view'), // 详情
                eventType: 'view',
                classes: 'notShowe',
              },
            ];
          }
          const tableData = {
            id: item.id,
            title: [
              {
                text: item.side_text,
                classes: item.side === 'BUY' ? 'u-1-cl' : 'u-4-cl',
                disabled: true,
              },
              {
                text: this.getShowSymbol(`${item.baseCoin}/${item.countCoin}`),
              },
            ],
            symbol: `${item.baseCoin}/${item.countCoin}`,
            side: item.side,
            handle: subTableBtn,
            data: [
              { text: formatTime(item.time_long) },
              { text: this.getShowSymbol(`${item.baseCoin}/${item.countCoin}`) },
              { text: this.setPrice(item) },
              { text: fixD(item.volume, this.fixValue.volumeFix) },
              { text: fixD(item.avg_price, this.fixValue.priceFix) },
              { text: item.status_text },
            ],
          };
          newData.push(tableData);
        });
        // this.orderIdArrar = idArr;
        return newData;
      }
      return [];
    },
    // sub table Data 格式化
    setSubTableData(data) {
      const arr = [];
      if (data.length) {
        data.forEach((item) => {
          const {
            ctime,
            price,
            volume,
            fee,
            feeCoin,
          } = item;
          const dealPrice = item.deal_price;
          arr.push({
            data: [
              { text: ctime },
              { text: fixD(price, this.fixValue.priceFix) },
              { text: fixD(volume, this.fixValue.volumeFix) },
              { text: fixD(dealPrice, this.fixValue.priceFix) },
              { text: `${fee} ${this.getShowName(feeCoin.toUpperCase())}` },
            ],
          });
        });
        return arr;
      }
      return [];
    },
    // 切换订单类型
    switchType(index) {
      if (index !== this.orderType) {
        this.orderType = index;
        this.dataList = [];
        this.pagination.page = 1;
        this.getData();
        // if (this.isLogin) {
        //   this.subTableDataId = null;
        //   this.pagination.page = 1;
        //   this.subTableData = [];
        //   this.orderIdArrar = [];
        //   this.tableLoading = true;
        // }
      }
    },
    elementClick(type, data) {
      if (type === 'cancel') {
        this.cancelOrderEvent(data);
      } else {
        this.getSubTableData(data);
      }
    },
    // 查看详情
    getSubTableData(data) {
      this.subTableData = [];
      this.subLoading = true;
      this.subTableDataId = data.id;
      const symbolArr = this.symbolCurrent.split('/');
      const symbol = symbolArr[0].toLowerCase() + symbolArr[1].toLowerCase();
      this.detailsBox = true;
      this.detailsSymbol = data.symbol;
      this.detailsSide = data.side;
      let url = this.$store.state.url.ordercenter.orderDetail;
      if (this.moduleType === 'lever') {
        url = this.$store.state.url.lever.list_by_order;
      }
      const params = {
        url,
        params: {
          symbol,
          order_id: data.id,
          pageSize: this.pagination.pageSize,
        },
      };
      this.$store.dispatch('getSubTableData', params);
    },
    // 撤单
    cancelOrderEvent(odata) {
      if (this.cancelFla) {
        this.cancelFla = false;
        const data = {
          orderId: odata.id,
          symbol: this.symbols,
        };
        let url = this.$store.state.url.ordercenter.cancelorder;
        if (this.moduleType === 'lever') {
          url = this.$store.state.url.lever.cancel;
        }
        this.axios({
          url,
          method: 'post',
          params: data,
        }).then((rep) => {
          if (rep.code === '0') {
            // this.getData();
            this.cancelOrderId = odata.id;
            // 撤单成功 提示
            this.$bus.$emit('tip', { text: this.$t('trade.cancelled'), type: 'success' });
            this.cancelFla = true;
          } else {
            this.$bus.$emit('tip', { text: rep.msg, type: 'error' });
            this.cancelFla = true;
          }
        });
      }
    },
    // 请求订单数据
    getData(auto) {
      if (this.symbolCurrent && this.isLogin) {
        let url = this.$store.state.url.cointran.orderNew;
        if (this.orderType === 2) {
          url = this.$store.state.url.ordercenter.historyNew;
        }
        if (this.moduleType === 'lever') {
          url = this.$store.state.url.lever.new;
          if (this.orderType === 2) {
            url = this.$store.state.url.lever.all;
          }
        }
        const symbolArr = this.symbolCurrent.split('/');
        const symbol = symbolArr[0].toLowerCase() + symbolArr[1].toLowerCase();
        const data = {
          url,
          orderType: this.orderType,
          params: {
            symbol,
            pageSize: this.pagination.pageSize,
          },
        };
        if (this.orderIdArrar.length && this.orderType === 2) {
          data.params.idList = this.orderIdArrar;
        } else {
          data.params.page = this.pagination.page;
        }
        if (auto) {
          data.auto = true;
        }
        this.$store.dispatch('getOrderListData', data);
      }
    },
    // 上拉加载翻页
    onInfiniteLoads(done) {
      if (this.pullUpState === 0) {
        this.pullUpState = 2;
        this.pagination.page += 1;
        this.getData();
      }
      done();
    },
    // 下拉刷新
    onRefresh(done) {
      this.pagination.page = 1;
      this.getData();
      done();
    },
  },
  // 组价离开前执行
  beforeDestroy() {
    clearInterval(this.getDataInter);
  },
};
