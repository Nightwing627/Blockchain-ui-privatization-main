import {
  fixD,
  getCoinShowName,
  imgMap,
  colorMap,
} from '@/utils';

export default {
  data() {
    return {
      imgMap,
      colorMap,
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
      subColumns: [], // 展开的表头
      subContentId: 0, // 展开的id
      subLoading: false, // 展开的loading
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
      // let market = this.symbolMarket;
      // let coin = this.symbolCoin;
      // const { coinList } = this.market ? this.market.coinList : '';
      // if (coinList) {
      //   // market = market === 'all' ? '' : `(${getCoinShowName(market, coinList)})`;
      //   // coin = coin === 'all' ? '' : `(${getCoinShowName(coin, coinList)})`;
      // }
      if (this.nowType === 1) {
        list = [
          // 时间
          {
            title: this.$t('order.exchangeOrder.nowOrderTime'),
            width: '70px',
          },
          // 币对
          {
            title: this.$t('order.exchangeOrder.coin'),
            width: '70px',
          },
          // 类别
          {
            title: this.$t('order.exchangeOrder.nowOrderType'),
            width: '70px',
          },
          // 价格
          {
            title: `${this.$t('order.exchangeOrder.nowOrderPrice')}`,
          },
          // 数量
          {
            title: `${this.$t('order.exchangeOrder.nowOrderVolume')}`,
          },
          // 交易额
          {
            title: `${this.$t('order.exchangeOrder.nowOrderTotol')}`,
          },
          // 平均成交价
          {
            title: `${this.$t('order.exchangeOrder.nowOrderAverage')}`,
            // width: '130px',
          },
          // 已成交/未成交
          {
            title: `${this.$t('order.exchangeOrder.nowOrderTransaction')}`,
            width: '140px',
          },
          // 操作
          {
            title: this.$t('order.exchangeOrder.nowOrderOptions'),
            width: '100px',
          },
        ];
      } if (this.nowType === 2) {
        list = [
          // 时间
          {
            title: this.$t('order.exchangeOrder.hisOrderTime'),
            width: '70px',
          },
          // 币对
          {
            title: this.$t('order.exchangeOrder.coin'),
            width: '70px',
          },
          // 类别
          {
            title: this.$t('order.exchangeOrder.hisOrderType'),
            width: '70px',
          },
          // 价格
          {
            title: `${this.$t('order.exchangeOrder.hisOrderPrice')}`,
          },
          // 数量
          {
            title: `${this.$t('order.exchangeOrder.hisOrderVolume')}`,
          },
          // 成交均价
          {
            title: `${this.$t('order.exchangeOrder.hisOrderAverage')}`,
            // width: '130px',
          },
          // 状态
          {
            title: this.$t('order.exchangeOrder.hisOrderStatus'),
          },
          // 操作
          {
            title: this.$t('order.exchangeOrder.hisOrderOptions'),
            width: '100px',
          },
        ];
      }
      return list;
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
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },
    // 是否开启 查询全部币对
    openOrderCollect() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.open_order_collect;
      }
      return null;
    },
  },
  methods: {
    init() {
      if (this.$route.query.nowType) {
        this.nowType = Number(this.$route.query.nowType);
      }
      if (this.market) { this.initSymbolMarketList(); }
    },
    // 市场发生改变
    symbolMarketChange(item) {
      if (this.symbolMarket === item.code) { return; }
      this.symbolMarket = item.code;
      // 创建币种列表
      const list = [];
      if (this.openOrderCollect === '1' && this.symbolMarket === 'all') {
        list.push({ value: this.$t('order.exchangeOrder.all'), code: 'all' });
      }
      const { market } = this.market;
      let curList = market[this.symbolMarket];
      if (this.symbolMarket === 'all') {
        curList = this.symbolAll;
      }
      if (curList) {
        Object.keys(curList).forEach((citem) => {
          const coinArr = citem.split('/');
          const citemObj = curList[citem];
          const showSymbol = citemObj.showName || citemObj.name;
          list.push({ code: `${coinArr[0]}${coinArr[1]}`, value: showSymbol });
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
      if (this.openOrderCollect === '1') {
        list.push({ value: this.$t('order.exchangeOrder.all180'), code: 'all' });
      }
      Object.keys(market).forEach((item) => {
        list.push({ value: getCoinShowName(item, coinList), code: item });
      });
      this.symbolMarketList = list;
      if (list.length) {
        this.symbolMarketChange(list[0]);
      }
    },
    switchChange() {
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
      if (this.symbolAll[symbol]) {
        const { price, volume } = this.symbolAll[symbol];
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
      const symbolCoin = this.symbolCoin === 'all' ? '' : this.symbolCoin;
      // const symbolMarket = this.symbolMarket === 'all' ? '' : this.symbolMarket;
      const symbol = symbolCoin.toLowerCase();
      let ajaxUrl = 'order/list/new';
      const paramsData = {
        side: this.axiosSide,
        pageSize: this.paginationObj.display, // 每页条数
        page: this.paginationObj.currentPage, // 页码
        symbol,
      };
      if (this.openOrderCollect === '1') {
        paramsData.entrust = this.nowType;
        paramsData.orderType = 1;
        ajaxUrl = 'order/entrust_search';
      }
      this.axios({
        url: ajaxUrl,
        method: 'post',
        params: paramsData,
      }).then((data) => {
        if (this.nowType !== 1) return;
        if (data.code.toString() === '0') {
          const list = [];
          let { orderList } = data.data;
          if (this.openOrderCollect === '1') {
            orderList = data.data.orders;
          }
          orderList.forEach((item) => {
            const quoteCoin = item.quoteCoin || item.countCoin;
            const { marketFix, coinFix } = this.getFix(quoteCoin, item.baseCoin);
            let showClose = true;
            if (item.type === 2 || item.status === 5
              || (item.isCloseCancelOrder && item.isCloseCancelOrder.toString() === '1')) {
              showClose = false;
            }
            list.push({
              id: item.id,
              data: [
                item.created_at, // 时间
                `${item.baseCoin}/${quoteCoin}`, // 币对
                [{
                  text: item.side_text,
                  classes: item.side === 'BUY' ? 'b-5-cl' : 'b-6-cl',
                }],
                item.type.toString() === '1'
                  ? `${fixD(item.price, marketFix)} ${quoteCoin}` // 价格
                  : this.$t('order.exchangeOrder.marketPrice'), // 市价
                `${fixD(item.volume, coinFix)} ${item.baseCoin}`, // 数量
                `${fixD(item.total_price, marketFix)} ${quoteCoin}`, // 交易额
                `${fixD(item.avg_price, marketFix)} ${quoteCoin}`, // 平均成交价
                [
                  {
                    text: `${fixD(item.deal_volume, coinFix)} ${item.baseCoin}`,
                    subContent: { text: `${fixD(item.remain_volume, coinFix)} ${item.baseCoin}` },
                  },
                ],
                [
                  showClose
                    ? {
                      type: 'button',
                      text: this.$t('order.exchangeOrder.cancel'), // 撤单
                      eventType: 'cancelOrder',
                    }
                    : '',
                ],
              ],
            });
          });
          this.tabelLoading = false;
          this.tabelList = list;
          this.paginationObj.total = data.data.count;
        } else {
          this.tabelLoading = false;
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 分页器
    pagechange(v) {
      this.paginationObj.currentPage = v;
      this.clearSub();
      this.getData();
    },
    // 获取历史
    getHisData() {
      const symbolCoin = this.symbolCoin === 'all' ? '' : this.symbolCoin;
      // const symbolMarket = this.symbolMarket === 'all' ? '' : this.symbolMarket;
      const symbol = symbolCoin.toLowerCase();
      let ajaxUrl = '/order/entrust_history';
      const paramsData = {
        side: this.axiosSide,
        pageSize: this.paginationObj.display, // 每页条数
        page: this.paginationObj.currentPage, // 页码
        isShowCanceled: this.switchFlag ? 1 : 0, // 是否展示已撤单
        symbol,
      };
      if (this.openOrderCollect === '1') {
        paramsData.entrust = this.nowType;
        paramsData.orderType = 1;
        ajaxUrl = 'order/entrust_search';
      }
      this.axios({
        url: ajaxUrl,
        method: 'post',
        params: paramsData,
      }).then((data) => {
        if (this.nowType !== 2) return;
        if (data.code.toString() === '0') {
          const list = [];
          let { orderList } = data.data;
          if (this.openOrderCollect === '1') {
            orderList = data.data.orders;
          }
          orderList.forEach((item) => {
            const quoteCoin = item.quoteCoin || item.countCoin;
            const { marketFix, coinFix } = this.getFix(quoteCoin, item.baseCoin);
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
              data: [
                item.created_at,
                `${item.baseCoin}/${quoteCoin}`, // 币对
                [{
                  text: item.side_text,
                  classes: item.side === 'BUY' ? 'b-5-cl' : 'b-6-cl',
                }],
                item.type.toString() === '1'
                  ? `${fixD(item.price, marketFix)} ${quoteCoin}` // 价格
                  : this.$t('order.exchangeOrder.marketPrice'), // 市价
                `${fixD(item.volume, coinFix)} ${item.baseCoin}`, // 数量
                `${fixD(item.avg_price, marketFix)} ${quoteCoin}`, // 平均成交价
                item.status_text,
                subTableBtn,
              ],
            });
          });
          this.tabelLoading = false;
          this.tabelList = list;
          this.paginationObj.total = data.data.count;
        } else {
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
    tableClick(type, id) {
      if (type === 'cancelOrder') {
        this.cancelOrder(id);
      }
      if (type === 'view') {
        this.getSubTableData(id);
      }
    },
    // 重置详情
    clearSub() {
      this.subContentId = null;
      this.subColumns = [];
      this.subContent = [];
      this.subLoading = false;
    },
    // 查看详情
    getSubTableData(v) {
      if (v.open) {
        this.subContentId = v.id;
        this.subColumns = [
          this.$t('order.exchangeOrder.detailsTime'), // 时间
          this.$t('order.exchangeOrder.detailsPrice'), // 价格
          this.$t('order.exchangeOrder.detailsVolume'), // 数量
          this.$t('order.exchangeOrder.detailsTotol'), // 成交额
          this.$t('order.exchangeOrder.detailsFee'), // 手续费
        ];
        this.subContent = [];
        this.subLoading = true;
        let symbol = '';
        this.tabelList.forEach((item) => {
          if (item.id === v.id) {
            [, symbol] = item.data;
          }
        });
        const symbolCoin = `${symbol.split('/')[0]}${symbol.split('/')[1]}`;
        this.axios({
          url: 'trade/list_by_order',
          method: 'post',
          params: {
            symbol: symbolCoin,
            order_id: v.id,
            // pageSize: this.pagination.pageSize,
          },
        }).then((data) => {
          if (v.id !== this.subContentId) { return; }
          if (data.code.toString() === '0') {
            const list = [];
            data.data.trade_list.forEach((item) => {
              const { marketFix, coinFix } = this.getFix(
                symbol.split('/')[1], symbol.split('/')[0],
              );
              list.push({
                ctime: item.ctime,
                price: fixD(item.price, marketFix),
                volume: fixD(item.volume, coinFix),
                dealPrice: fixD(item.deal_price, marketFix),
                fee: item.fee,
              });
            });
            this.subLoading = false;
            this.subContent = list;
          } else {
            this.subLoading = false;
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      }
    },
    // 撤单
    cancelOrder(id) {
      if (this.revokeList.indexOf(id) === -1) {
        this.revokeList.push(id);
        let symbol = '';
        this.tabelList.forEach((item) => {
          if (item.id === id) {
            [, symbol] = item.data;
          }
        });
        symbol = `${symbol.split('/')[0]}${symbol.split('/')[1]}`;
        this.axios({
          url: 'order/cancel',
          method: 'post',
          params: {
            orderId: id,
            symbol,
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
  },
};
