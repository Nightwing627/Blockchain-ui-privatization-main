import {
  fixD,
  formatTime,
  getCoinShowName,
  myStorage,
  imgMap,
  colorMap,
} from '@/utils';

export default {
  name: 'orderList',
  data() {
    return {
      imgMap,
      colorMap,
      orderType: 1, // 订单类型 1: 当前委托 2:历史委托
      pagination: { // 翻页数据
        count: 0, // 总数量
        pageSize: 10, // 每页显示条数
        page: 1, // 当前页数
      },
      subTableDataId: null,
      subTableDataIds: null,
      // 当前货币对
      symbolCurrent: myStorage.get('sSymbolName'),
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
    coinSymbols() {
      if (this.symbolCurrent) {
        return this.symbolCurrent.replace('/', ',');
      }
      return '';
    },
    // 全部币种列表
    coinList() {
      if (this.$store.state.baseData && this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return null;
    },
    titleBlockClass() {
      if (this.$store.state.baseData.templateLayoutType === '2') {
        return 'a-5-bg';
      }
      return 'a-7-bg';
    },
    // 是否Login
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    openOrderCollect() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.open_order_collect;
      }
      return null;
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
            width: '100px',
          },
          {
            title: this.$t('trade.class'), // '类别'
            width: '200px',
          },
          {
            title: this.$t('trade.transaction'), // '交易对'
          },
          {
            title: `${this.$t('trade.price')}
            (${getCoinShowName(this.symbolUnit.units, this.coinList)})`, // 价格
          },
          {
            title: `${this.$t('trade.number')}
            (${getCoinShowName(this.symbolUnit.symbol, this.coinList)})`, // 数量
          },
          {
            title: this.$t('trade.average'), // '成交均价'
          },
          {
            title: this.$t('trade.status'), // '状态'
          },
          {
            title: this.$t('trade.opera'), // '操作'
            width: '100px',
          },
        ];
      }
      return [
        {
          title: this.$t('trade.time'), // '时间',
          width: '100px',
        },
        {
          title: this.$t('trade.class'), // '类别'
          width: '150px',
        },
        {
          title: `${this.$t('trade.price')}
          (${getCoinShowName(this.symbolUnit.units, this.coinList)})`, // 价格
        },
        {
          title: `${this.$t('trade.number')}
          (${getCoinShowName(this.symbolUnit.symbol, this.coinList)})`, // 数量
        },
        {
          title: `${this.$t('trade.dealMoney')}
          (${getCoinShowName(this.symbolUnit.units, this.coinList)})`, // 交易额
        },
        {
          title: this.$t('trade.average'), // '成交均价'
        },
        {
          title: `${this.$t('trade.deal')}/${this.$t('trade.noDeal')}`, // 已成交/未成交
        },
        {
          title: this.$t('trade.opera'), // '操作'
          width: '100px',
          classes: 'opera',
        },
      ];
    },
    subColumns() {
      return [
        this.$t('trade.time'),
        this.$t('trade.price'),
        this.$t('trade.number'),
        this.$t('trade.turnover'),
        this.$t('trade.serviceCharge'),
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
      // if (this.orderType === 1 && this.$store.state.tradeOrderList) {
      //   return this.$store.state.tradeOrderList.nowOrderData;
      // }
      // if (this.orderType === 2 && this.$store.state.tradeOrderList) {
      //   return this.$store.state.tradeOrderList.historyData;
      // }
      return null;
    },
    dataList() {
      if (this.orderData && this.orderData.orderType === this.orderType) {
        if (this.orderType === 1) {
          return this.formData(this.orderData.orderList, this.cancelOrderId);
        }
        return this.formHistoryData(this.orderData.orderList);
      }
      return [];
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
    // 查看全部订单
    goOrderPage() {
      // this.$router.push({path: '/order/exchangeOrder', query: {nowType: this.orderType}});
      if (this.moduleType === 'lever') {
        window.location.href = `/order/leverageOrder?nowType=${this.orderType}`;
      } else {
        window.location.href = `/order/exchangeOrder?nowType=${this.orderType}`;
      }
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
            let showClose = true;
            if (item.type === 2
              || (item.isCloseCancelOrder && item.isCloseCancelOrder.toString() === '1')) {
              showClose = false;
            }
            const tableData = {
              id: item.id,
              data: [
                formatTime(item.time_long),
                [
                  {
                    text: item.side_text,
                    classes: item.side === 'BUY' ? 'u-1-cl' : 'u-4-cl',
                  },
                ],
                [
                  {
                    text: this.setPrice(item),
                  },
                ],
                [
                  {
                    text: fixD(item.volume, this.fixValue.volumeFix),
                  },
                ],
                [
                  {
                    text: fixD(item.total_price, this.fixValue.priceFix),
                  },
                ],
                [
                  {
                    text: fixD(item.avg_price, this.fixValue.priceFix),
                  },
                ],
                [
                  {
                    text: fixD(item.deal_volume, this.fixValue.volumeFix),
                    subContent: {
                      text: fixD(item.remain_volume, this.fixValue.volumeFix),
                    },
                  },
                ],
                [
                  {
                    type: 'button',
                    text: this.$t('trade.cancelOrder'), // 撤单
                    eventType: 'cancel',
                    classes: !showClose ? 'marketPriceOrder' : '',
                  },
                ],
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
          const tableData = {
            id: item.id,
            data: [
              formatTime(item.time_long),
              [
                {
                  text: item.side_text,
                  classes: item.side === 'BUY' ? 'u-1-cl' : 'u-4-cl',
                },
              ],
              [
                {
                  text: `${getCoinShowName(item.baseCoin, this.coinList)}
                    /${getCoinShowName(item.countCoin, this.coinList)}`,
                },
              ],
              [
                {
                  text: this.setPrice(item),
                },
              ],
              [
                {
                  text: fixD(item.volume, this.fixValue.volumeFix),
                },
              ],
              [
                {
                  text: fixD(item.avg_price, this.fixValue.priceFix),
                },
              ],
              [
                {
                  text: item.status_text,
                },
              ],
            ],
          };
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
          tableData.data.push(subTableBtn);
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
            ctime,
            price: fixD(price, this.fixValue.priceFix),
            volume: fixD(volume, this.fixValue.volumeFix),
            dealPrice: fixD(dealPrice, this.fixValue.priceFix),
            fee: `${fee} ${getCoinShowName(feeCoin, this.coinList).toUpperCase()}`,

          });
        });
        return arr;
      }
      return [];
    },
    // 切换订单类型
    switchType(index) {
      this.orderType = index;
      this.getData();
      if (this.isLogin) {
        this.subTableDataId = null;
        this.pagination.page = 1;
        this.subTableData = [];
        this.orderIdArrar = [];
        this.tableLoading = true;
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
      if (data.open) {
        this.subTableData = [];
        this.subLoading = true;
        this.subTableDataId = data.id;
        const symbolArr = this.symbolCurrent.split('/');
        const symbol = symbolArr[0].toLowerCase() + symbolArr[1].toLowerCase();
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
      }
    },
    // 撤单
    cancelOrderEvent(id) {
      if (this.cancelFla) {
        this.cancelFla = false;
        const data = {
          orderId: id,
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
            this.cancelOrderId = id;
            // 重新请求资产
            this.$store.dispatch('assetsExchangeData', {
              auto: false,
              coinSymbols: this.coinSymbols,
            });
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
    // 翻页事件
    pagechange(num) {
      this.pagination.page = num;
      this.subTableData = null;
      this.subTableDataId = null;
      this.orderIdArrar = [];
      this.getData();
    },
  },
};
