import { fixD } from '@/utils';

export default {
  name: 'page-otcOrder',
  data() {
    return {
      switchFlag: false,
      tabelLoading: true,
      tabelList: [],
      nowType: 1, // 1为当前委托 2为历史委托
      symbol: 'all', // 当前币种
      symbolList: [], // 币种选择列表
      side: 'all', // 方向
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      // 上拉加载的设置
      pullUpState: 0,
    };
  },
  watch: {
    market(v) { if (v) { this.initSymbolList(); } },
  },
  computed: {
    navTab() {
      return [
        // 当前委托
        { name: this.$t('order.otcOrder.nowOrder'), index: 1 },
        // 历史委托
        { name: this.$t('order.otcOrder.hisOrder'), index: 2 },
      ];
    },
    sideList() {
      return [ // 方向选择列表
        // 全部
        { code: 'all', value: this.$t('order.otcOrder.all') },
        // 买入
        { code: 'buy', value: this.$t('order.otcOrder.buy') },
        // 卖出
        { code: 'sell', value: this.$t('order.otcOrder.sell') },
      ];
    },
    market() { return this.$store.state.baseData.market; },
    axiosSide() {
      if (this.side === 'all') {
        return '';
      }
      return this.side;
    },
    axiosSymbol() {
      if (this.symbol === 'all') {
        return undefined;
      }
      return this.symbol;
    },
    // 表格title
    columns() {
      let list = [];
      if (this.nowType === 1) {
        list = [
          { title: this.$t('order.otcOrder.nowOrderId') }, // 订单号
          { title: this.$t('order.otcOrder.nowOrderPirce') }, // 价格
          { title: this.$t('order.otcOrder.nowOrderVolume') }, // 数量
          { title: this.$t('order.otcOrder.nowOrderTotol') }, // 交易额
          { title: this.$t('order.otcOrder.nowOrderStatus') }, // 状态
          { title: this.$t('order.otcOrder.nowOrderUser') }, // 交易方
        ];
      } if (this.nowType === 2) {
        list = [
          { title: this.$t('order.otcOrder.hisOrderId') }, // 订单号
          { title: this.$t('order.otcOrder.hisOrderPirce') }, // 价格
          { title: this.$t('order.otcOrder.hisOrderVolume') }, // 数量
          { title: this.$t('order.otcOrder.hisOrderTotol') }, // 交易额
          { title: this.$t('order.otcOrder.hisOrderStatus') }, // 状态
          { title: this.$t('order.otcOrder.hisOrderUser') }, // 交易方
        ];
      }
      return list;
    },
    baseData() { return this.$store.state.baseData; },
    otcLinkUrl() {
      const obj = {
        url: '',
        type: '', // 1为push 2为herf
      };
      // 开发
      if (process.env.NODE_ENV === 'development') {
        obj.url = '';
        obj.type = '1';
        // 线上
      } else if (window.HOSTAPI === 'ex' && this.baseData.publicInfo) {
        obj.url = this.$store.state.baseData.publicInfo.url.motcUrl;
        obj.type = '2';
      } else if (window.HOSTAPI === 'otc') {
        obj.url = '';
        obj.type = '1';
      }
      return obj;
    },
  },
  methods: {
    init() {
      if (this.market) { this.initSymbolList(); }
    },
    currentCoinPriceFix(price, coin, payCoin) {
      let fix = this.$store.state.baseData.defaultFiatPrecision;
      if (payCoin
          && this.market
          && this.market.coinList[coin]
          && this.market.coinList[coin].fiatPrecision
          && this.market.coinList[coin].fiatPrecision[payCoin.toLowerCase()]) {
        fix = this.market.coinList[coin].fiatPrecision[payCoin.toLowerCase()];
        return fixD(price, fix) + payCoin;
      }

      return price;
    },
    switchChange() {
      this.paginationObj.currentPage = 1;
      this.switchFlag = !this.switchFlag;
      this.getData();
    },
    initSymbolList() {
      const { coinList } = this.market;
      const list = [{
        code: 'all',
        value: this.$t('order.otcOrder.allCoin'),
      }];
      Object.keys(coinList).forEach((item) => {
        if (coinList[item].otcOpen) {
          list.push({ code: item, value: item });
        }
      });
      this.symbol = 'all';
      this.symbolList = list;
      // if (list.length) { this.symbol = list[0].code; }
      this.getData();
    },
    getData() {
      if (this.nowType === 1) {
        this.getNowData();
      } else if (this.nowType === 2) {
        this.getHisData();
      }
    },
    // 获取当前
    getNowData() {
      const url = '/order/otc/unfinished';
      this.axios({
        url,
        method: 'post',
        params: {
          // side: this.axiosSide,
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          coinSymbol: this.axiosSymbol,
        },
      }).then((data) => {
        if (this.nowType !== 1) return;
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          const list = [];
          data.data.orderList.forEach((item) => {
            let block = '';
            let Aurl = '';
            if (item.orderType) {
              Aurl = item.url;
              block = 'target="view_frame"';
            }
            list.push({
              id: JSON.stringify(item),
              title: [
                {
                  text: item.type,
                  classes: item.side === 'BUY' ? 'u-1-cl' : 'u-4-cl',
                },
                {
                  text: item.coinSymbol,
                },
              ],
              data: [
                // 订单号
                item.orderType
                  ? {
                    text: `<a class="u-8-cl" ${block} href="${Aurl}">${item.sequence}</a>`,
                  }
                  : {
                    text: item.sequence,
                    eventType: 'orderId',
                    classes: ['orderId', 'u-8-cl'],
                  },
                item.price, // 价格
                item.volume, // 数量
                this.currentCoinPriceFix(item.totalPrice, item.coinSymbol, item.payCoin), // 交易额
                item.status_text, // 状态
                // 交易对方
                item.orderType ? item.realName
                  : {
                    text: item.nickName,
                    classes: 'u-8-cl',
                    eventType: 'userName',
                  },
              ],
            });
          });
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
          this.paginationObj.total = data.data.count;
        } else {
          this.pullUpState = 0;
          this.paginationObj.currentPage -= 1;
          if (this.paginationObj.currentPage < 1) {
            this.paginationObj.currentPage = 1;
          }
        }
      });
    },
    // 获取历史订单
    getHisData() {
      const url = '/order/otc/complete';
      this.axios({
        url,
        method: 'post',
        params: {
          // side: this.axiosSide,
          isShowCanceled: this.switchFlag ? 1 : 0,
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          coinSymbol: this.axiosSymbol,
        },
      }).then((data) => {
        if (this.nowType !== 2) return;
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          const list = [];
          data.data.orderList.forEach((item) => {
            let block = '';
            let Aurl = '';
            if (item.orderType) {
              Aurl = item.url;
              block = 'target="view_frame"';
            }
            list.push({
              id: JSON.stringify(item),
              title: [
                {
                  text: item.type,
                  classes: item.side === 'BUY' ? 'b-5-cl' : 'b-6-cl',
                },
                {
                  text: item.coinSymbol,
                },
              ],
              data: [
                // 订单号
                item.orderType
                  ? {
                    text: `<a class="u-8-cl" ${block} href="${Aurl}">${item.sequence}</a>`,
                  }
                  : {
                    text: item.sequence,
                    eventType: 'orderId',
                    classes: ['orderId', 'u-8-cl'],
                  },
                item.price, // 价格
                item.volume, // 数量
                this.currentCoinPriceFix(item.totalPrice, item.coinSymbol, item.payCoin), // 交易额
                item.status_text, // 状态
                // 交易对方
                item.orderType ? item.realName
                  : {
                    text: item.nickName,
                    classes: 'u-8-cl',
                    eventType: 'userName',
                  },
              ],
            });
          });
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
          this.paginationObj.total = data.data.count;
        } else {
          this.pullUpState = 0;
          this.paginationObj.currentPage -= 1;
          if (this.paginationObj.currentPage < 1) {
            this.paginationObj.currentPage = 1;
          }
        }
      });
    },
    // 切换委托
    currentType(item) {
      if (this.nowType === item.index) { return; }
      this.nowType = item.index;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    // 切换币种
    symbolChange(item) {
      if (this.symbol === item.code) { return; }
      this.symbol = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    // 切换方向
    sideChange(item) {
      if (this.side === item.code) { return; }
      this.side = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    tableClick(type, v) {
      const data = JSON.parse(v.id);
      if (type === 'orderId') {
        if (this.otcLinkUrl.type === '1') {
          this.$router.push(`${this.otcLinkUrl.url}/otcDetailOrder?orderId=${data.sequence}`);
        } else if (this.otcLinkUrl.type === '2') {
          window.location.href = `${this.otcLinkUrl.url}/otcDetailOrder?orderId=${data.sequence}`;
        }
      } else if (type === 'userName') {
        let id = '';
        if (data.side === 'BUY') {
          id = data.sellerId;
        } else if (data.side === 'SELL') {
          id = data.buyerId;
        }
        if (this.otcLinkUrl.type === '1') {
          this.$router.push(`${this.otcLinkUrl.url}/stranger?uid=${id}`);
        } else if (this.otcLinkUrl.type === '2') {
          window.location.href = `${this.otcLinkUrl.url}/stranger?uid=${id}`;
        }
      }
    },
    pagechange(v) {
      this.paginationObj.currentPage = v;
      this.getData();
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
