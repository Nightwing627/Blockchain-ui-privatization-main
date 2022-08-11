import { fixD, getCoinShowName } from '@/utils';

export default {
  data() {
    return {
      deleteArr: [],
      tabelLoading: true,
      switchFlag: false, // 显示已撤单
      nowType: 1, // 1为当前委托 2为历史委托
      symbol: '', // 当前币种
      symbolList: [], // 币种选择列表
      side: 'all', // 方向
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      symbolMarketList: [], // 市场列表
      symbolMarket: '', // 当前市场
      symbolCoinList: [], // 币种列表
      symbolCoin: '', // 币种列表
      subTableData: {},
      tabelList: [],
      revokeList: [], // 撤销队列
      subContent: [], // 展开的数据
      subContentId: 0, // 展开的id
      subLoading: false, // 展开的loading
      // 上拉加载的设置
      pullUpState: 0,
    };
  },
  watch: {
    market(v) { if (v) { this.initSymbolMarketList(); } },
  },
  computed: {
    navTab() {
      return [
        // 当前委托
        { name: this.$t('order.exchangeOrder.nowOrder'), index: 1 },
        // 历史委托
        { name: this.$t('order.exchangeOrder.hisOrder'), index: 2 },
      ];
    },
    sideList() {
      return [ // 方向选择列表
        // 全部
        { code: 'all', value: this.$t('order.exchangeOrder.all') },
        // 买入
        { code: 'buy', value: this.$t('order.exchangeOrder.buy') },
        // 卖出
        { code: 'sell', value: this.$t('order.exchangeOrder.sell') },
      ];
    },
    market() { return this.$store.state.baseData.market; },
    // 表格title
    columns() {
      let list = [];
      const market = this.symbolMarket;
      const coin = this.symbolCoin;
      if (this.nowType === 1) {
        list = [
          // 时间
          {
            title: this.$t('order.exchangeOrder.nowOrderTime'),
            width: '100px',
          },
          // 价格
          {
            title: `${this.$t('order.exchangeOrder.nowOrderPrice')}(${this.getShowName(market)})`,
          },
          // 数量
          {
            title: `${this.$t('order.exchangeOrder.nowOrderVolume')}(${this.getShowName(coin)})`,
          },
          // 交易额
          {
            title: `${this.$t('order.exchangeOrder.nowOrderTotol')}(${this.getShowName(market)})`,
          },
          // 平均成交价
          {
            title: `${this.$t('order.exchangeOrder.nowOrderAverage')}(${this.getShowName(market)})`,
            width: '130px',
          },
          // 已成交/未成交
          {
            title: `${this.$t('order.exchangeOrder.nowOrderTransaction')}(${this.getShowName(coin)})`,
            width: '140px',
          },
        ];
      } if (this.nowType === 2) {
        list = [
          // 时间
          {
            title: this.$t('order.exchangeOrder.hisOrderTime'),
            width: '100px',
          },
          // 价格
          {
            title: `${this.$t('order.exchangeOrder.hisOrderPrice')}(${this.getShowName(market)})`,
          },
          // 数量
          {
            title: `${this.$t('order.exchangeOrder.hisOrderVolume')}(${this.getShowName(coin)})`,
          },
          // 成交均价
          {
            title: `${this.$t('order.exchangeOrder.hisOrderAverage')}(${this.getShowName(market)})`,
            width: '130px',
          },
          // 状态
          {
            title: this.$t('order.exchangeOrder.hisOrderStatus'),
          },
        ];
      }
      return list;
    },
    subColumns() {
      return [
        {
          title: this.$t('order.exchangeOrder.detailsTime'), // 时间
        },
        {
          title: this.$t('order.exchangeOrder.detailsPrice'), // 价格
        },
        {
          title: this.$t('order.exchangeOrder.detailsVolume'), // 数量
        },
        {
          title: this.$t('order.exchangeOrder.detailsTotol'), // 成交额
        },
        {
          title: this.$t('order.exchangeOrder.detailsFee'), // 手续费
        },
      ];
    },
    axiosSide() {
      if (this.side === 'all') {
        return '';
      }
      return this.side;
    },
    axiosSymbol() {
      return `${this.symbolCoin}${this.symbolMarket}`.toLowerCase();
    },
  },
  methods: {
    init() {
      if (this.market) { this.initSymbolMarketList(); }
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
    // 市场发生改变
    symbolMarketChange(item) {
      if (this.symbolMarket === item.code) { return; }
      this.symbolMarket = item.code;
      // 创建币种列表
      const list = [];
      const { market } = this.market;
      if (market[this.symbolMarket]) {
        Object.keys(market[this.symbolMarket]).forEach((citem) => {
          const coin = citem.split('/')[0];
          const citemObj = market[this.symbolMarket][citem];
          const showSymbol = citemObj.showName || citemObj.name;
          list.push({ code: coin, value: showSymbol });
        });
      }
      this.symbolCoinList = list;
      if (list.length) {
        this.symbolCoinChange(list[0]);
      }
    },
    // 币种发生改变
    symbolCoinChange(item) {
      if (this.symbolCoin === item.code) { return; }
      this.symbolCoin = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.clearSub();
      this.getData();
    },
    // 初始化市场
    initSymbolMarketList() {
      const { market, coinList } = this.market;
      const list = [];
      Object.keys(market).forEach((item) => {
        list.push({ value: this.getShowName(item, coinList), code: item });
      });
      this.symbolMarketList = list;
      if (list.length) {
        this.symbolMarketChange(list[0]);
      }
    },
    switchChange() {
      this.paginationObj.currentPage = 1;
      this.switchFlag = !this.switchFlag;
      this.getData();
    },
    // 切换委托
    currentType(item) {
      if (this.nowType === item.index) { return; }
      this.nowType = item.index;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.clearSub();
      this.getData();
    },
    getData() {
      if (this.nowType === 1) {
        this.getNowData();
      } else if (this.nowType === 2) {
        this.getHisData();
      }
    },
    getFix(market, coin) {
      // 例如 btc/usdt
      let marketFix = 0; // 市场精度 usdt
      let coinFix = 0; // 交易币种精度 btc
      const symbol = `${coin}/${market}`;
      const marketObj = this.market.market;
      if (marketObj[market] && marketObj[market][symbol]) {
        const { price, volume } = marketObj[market][symbol];
        marketFix = price;
        coinFix = volume;
      }
      return {
        marketFix,
        coinFix,
      };
    },
    // 获取当前
    getNowData() {
      const symbol = `${this.symbolCoin}${this.symbolMarket}`.toLowerCase();
      this.axios({
        url: '/order/list/new',
        method: 'post',
        params: {
          side: this.axiosSide,
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          symbol,
        },
      }).then((data) => {
        if (this.nowType !== 1) return;
        if (data.code.toString() === '0') {
          const list = [];
          data.data.orderList.forEach((item) => {
            const { marketFix, coinFix } = this.getFix(item.countCoin, item.baseCoin);
            list.push({
              id: item.id,
              title: [
                {
                  text: item.side_text,
                  classes: item.side === 'BUY' ? 'u-1-cl' : 'u-4-cl',
                },
                {
                  text: this.getShowName(item.baseCoin),
                },
              ],
              handle: [
                item.type.toString() === '1'
                  ? {
                    type: 'button',
                    text: this.$t('order.exchangeOrder.cancel'), // 撤单
                    eventType: 'cancelOrder',
                  }
                  : null,
              ],
              data: [
                {
                  text: item.created_at, // 时间
                },
                {
                  // 价格
                  text: item.type.toString() === '1'
                    ? fixD(item.price, marketFix)
                    : this.$t('order.exchangeOrder.marketPrice'), // 市价,
                },
                {
                  text: fixD(item.volume, coinFix), // 数量
                },
                {
                  text: fixD(item.total_price, marketFix), // 交易额
                },
                {
                  text: fixD(item.avg_price, marketFix), // 平均成交价
                },
                {
                  // 已成交/ 未成交
                  text: `${fixD(item.deal_volume, coinFix)} / ${fixD(item.remain_volume, coinFix)}`,
                },
              ],
            });
          });
          this.tabelLoading = false;
          if (this.paginationObj.currentPage > 1) {
            this.tabelList = this.tabelList.concat(list);
          } else {
            this.tabelList = list;
          }
          this.paginationObj.total = data.data.count;
          if (Math.ceil(parseFloat(data.data.count) / parseFloat(this.paginationObj.display))
            > this.paginationObj.currentPage) {
            this.pullUpState = 0;
          } else {
            this.pullUpState = 3;
          }
        } else {
          this.pullUpState = 0;
          this.paginationObj.currentPage -= 1;
          if (this.paginationObj.currentPage < 1) {
            this.paginationObj.currentPage = 1;
          }
          this.tabelLoading = false;
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 获取历史
    getHisData() {
      const symbol = `${this.symbolCoin}${this.symbolMarket}`.toLowerCase();
      this.axios({
        url: '/order/entrust_history',
        method: 'post',
        params: {
          side: this.axiosSide,
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          symbol,
          isShowCanceled: this.switchFlag ? 1 : 0, // 是否展示已撤单
        },
      }).then((data) => {
        if (this.nowType !== 2) return;
        if (data.code.toString() === '0') {
          const list = [];
          data.data.orderList.forEach((item) => {
            const { marketFix, coinFix } = this.getFix(item.countCoin, item.baseCoin);
            let subTableBtn = [];
            if (item.status === 2 || (item.status === 4 && parseFloat(item.deal_volume) !== 0)) {
              subTableBtn = [
                {
                  type: 'subTable',
                  text: this.$t('order.exchangeOrder.details'), // 详情
                  eventType: 'view',
                },
              ];
            } else {
              subTableBtn = [];
            }
            list.push({
              id: item.id,
              title: [
                {
                  text: item.side_text,
                  classes: item.side === 'BUY' ? 'u-1-cl' : 'u-4-cl',
                },
                {
                  text: this.getShowName(item.baseCoin),
                },
              ],
              handle: subTableBtn,
              data: [
                // 时间
                {
                  text: item.created_at,
                },
                // 价格
                {
                  text: item.type.toString() === '1'
                    ? fixD(item.price, marketFix)
                    : this.$t('order.exchangeOrder.marketPrice'), // 市价
                },
                // 数量
                {
                  text: fixD(item.volume, coinFix),
                },
                // 成交均价
                {
                  text: fixD(item.avg_price, marketFix),
                },
                // 状态
                {
                  text: item.status_text,
                },
              ],
            });
          });
          this.tabelLoading = false;
          if (this.paginationObj.currentPage > 1) {
            this.tabelList = this.tabelList.concat(list);
          } else {
            this.tabelList = list;
          }
          this.paginationObj.total = data.data.count;
          if (Math.ceil(parseFloat(data.data.count) / parseFloat(this.paginationObj.display))
            > this.paginationObj.currentPage) {
            this.pullUpState = 0;
          } else {
            this.pullUpState = 3;
          }
        } else {
          this.pullUpState = 0;
          this.paginationObj.currentPage -= 1;
          if (this.paginationObj.currentPage < 1) {
            this.paginationObj.currentPage = 1;
          }
          this.tabelLoading = false;
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 切换方向
    sideChange(item) {
      if (this.side === item.code) { return; }
      this.side = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.clearSub();
      this.getData();
    },
    tableClick(type, data) {
      if (type === 'cancelOrder') {
        this.cancelOrder(data.id);
      }
      if (type === 'view') {
        this.getSubTableData(data);
      }
      if (type === 'retuenList') {
        this.nowType = 2;
      }
    },
    // 重置详情
    clearSub() {
      this.subContentId = null;
      this.subContent = [];
      this.subLoading = false;
    },
    // 查看详情
    getSubTableData(v) {
      this.subContentId = v.id;
      this.subContent = [];
      this.subLoading = true;
      this.axios({
        url: 'trade/list_by_order',
        method: 'post',
        params: {
          symbol: this.axiosSymbol,
          order_id: v.id,
          // pageSize: this.pagination.pageSize,
        },
      }).then((data) => {
        if (v.id !== this.subContentId) { return; }
        if (data.code.toString() === '0') {
          const list = [];
          if (data.data.count && data.data.count > 0) {
            this.nowType = 3;
            data.data.trade_list.forEach((item, index) => {
              // const [baseCoin, countCoin] = this.symbol.split('/');
              const { marketFix, coinFix } = this.getFix(this.symbolMarket, this.symbolCoin);
              list.push({
                id: item.id,
                title: index === 0
                  ? [
                    {
                      text: item.side_text,
                      classes: item.side === 'BUY' ? 'u-1-cl' : 'u-4-cl',
                    },
                    {
                      text: this.getShowName(item.feeCoin.toUpperCase()),
                    },
                  ] : [],
                handle: index === 0
                  ? [{
                    text: this.$t('h5Add.return'),
                    eventType: 'retuenList',
                  }] : null,
                data: [
                  // 时间
                  item.ctime,
                  // 价格
                  fixD(item.price, marketFix),
                  // 数量
                  fixD(item.volume, coinFix),
                  // 成交均价
                  fixD(item.deal_price, marketFix),
                  item.fee,
                ],
              });
            });
            this.subLoading = false;
            this.subTableData = list;
          } else {
            // this.$bus.$emit('tip', { text: '暂无详情', type: 'error' });
          }
        } else {
          this.subLoading = false;
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 撤单
    cancelOrder(id) {
      if (this.revokeList.indexOf(id) === -1) {
        this.revokeList.push(id);
        this.axios({
          url: 'order/cancel',
          method: 'post',
          params: {
            orderId: id,
            symbol: this.axiosSymbol,
          },
        }).then((data) => {
          const ind = this.revokeList.indexOf(id);
          this.revokeList.splice(ind, 1);
          if (data.code.toString() === '0') {
            this.$bus.$emit('tip', { text: data.msg, type: 'success' });
            let sId = 0;
            this.tabelList.forEach((item, i) => {
              if (item.id === id) {
                sId = i;
              }
            });
            this.tabelList.splice(sId, 1);
            // this.getData();
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      }
    },
    // 上拉加载翻页
    onInfiniteLoads(done) {
      if (this.pullUpState === 0) {
        this.pullUpState = 2;
        this.paginationObj.currentPage += 1;
        this.getData();
      }
      done();
    },
    // 下拉刷新
    onRefresh(done) {
      this.paginationObj.currentPage = 1;
      this.getData();
      done();
    },
  },
};
