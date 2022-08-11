import {
  imgMap, colorMap, fixD, getCoinShowName,
} from '@/utils';

export default {
  name: 'page-otcOrder',
  data() {
    return {
      imgMap,
      colorMap,
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
    };
  },
  watch: {
    market(v) { if (v) { this.initSymbolList(); } },
  },
  computed: {
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    excheifFlag() {
      return this.$store.state.baseData.exchief_project_switch;
    },
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
          { title: this.$t('order.otcOrder.nowOrderType') }, // 类别
          { title: this.$t('order.otcOrder.nowOrderCoin') }, // 币种
          { title: this.$t('order.otcOrder.nowOrderPirce') }, // 价格
          { title: this.$t('order.otcOrder.nowOrderVolume') }, // 数量
          { title: this.$t('order.otcOrder.nowOrderTotol') }, // 交易额
          { title: this.$t('order.otcOrder.service') }, // 手续费
          { title: this.$t('order.otcOrder.nowOrderStatus') }, // 状态
          { title: this.$t('order.otcOrder.nowOrderUser') }, // 交易方
        ];
      } if (this.nowType === 2) {
        list = [
          { title: this.$t('order.otcOrder.hisOrderId') }, // 订单号
          { title: this.$t('order.otcOrder.hisOrderType') }, // 类别
          { title: this.$t('order.otcOrder.hisOrderCoin') }, // 币种
          { title: this.$t('order.otcOrder.hisOrderPirce') }, // 价格
          { title: this.$t('order.otcOrder.hisOrderVolume') }, // 数量
          { title: this.$t('order.otcOrder.hisOrderTotol') }, // 交易额
          { title: this.$t('order.otcOrder.service') }, // 手续费
          { title: this.$t('order.otcOrder.hisOrderStatus') }, // 状态
          { title: this.$t('order.otcOrder.hisOrderUser') }, // 交易方
        ];
      }
      if (!this.excheifFlag) {
        list.forEach((item, i) => {
          if (item.title === this.$t('order.otcOrder.service')) {
            list.splice(i, 1);
          }
        });
      }
      console.log(list);
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
        obj.url = this.$store.state.baseData.publicInfo.url.otcUrl;
        obj.type = '2';
      } else if (window.HOSTAPI === 'otc') {
        obj.url = '';
        obj.type = '1';
      }
      return obj;
    },
  },
  methods: {
    getFix(coin) {
      return this.market.coinList[coin.toLocaleUpperCase()].showPrecision;
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
    init() {
      if (this.market) { this.initSymbolList(); }
    },
    switchChange() {
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
          list.push({ code: item, value: getCoinShowName(item, coinList) });
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
            let Aurl = '';
            if (process.env.NODE_ENV === 'development') {
              Aurl = `/otcDetailOrder?orderId=${item.sequence}`;
            } else {
              Aurl = `${this.linkurl.otcUrl}/otcDetailOrder?orderId=${item.sequence}`;
            }
            let block = '';
            if (item.orderType) {
              Aurl = item.url;
              block = 'target="view_frame"';
            }
            let Flist = [
              // 订单号
              [{
                // type: 'link', text: item.sequence, eventType: 'orderId', classes: ['orderId'],
                type: 'icon', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                iconSvg: `<a class="u-8-cl" ${block} href="${Aurl}">${item.sequence}</a>`,
              }],
              [{
                text: item.type,
                classes: item.side === 'BUY' ? 'b-5-cl' : 'b-6-cl',
              }],
              getCoinShowName(item.coinSymbol, this.market.coinList), // 币种
              this.currentCoinPriceFix(item.price, item.coinSymbol, item.payCoin), // 价格
              fixD(item.volume, this.getFix(item.coinSymbol)), // 数量
              this.currentCoinPriceFix(item.totalPrice, item.coinSymbol, item.payCoin), // 交易额
            ];
            if (this.excheifFlag) {
              Flist.push(item.relativeFee);
            }
            const Vlist = [
              item.status_text, // 状态
              // 交易对方
              item.orderType
                ? item.realName
                : [
                  {
                    type: 'button',
                    text: item.nickName,
                    eventType: 'userName',
                    subContent: {
                      text: item.realName,
                      classes: ['e-2-cl'], // 默认没有
                    },
                  },
                ],
            ];
            Flist = Flist.concat(Vlist);
            list.push({
              id: JSON.stringify(item),
              data: Flist,
            });
          });
          this.tabelList = list;
          this.paginationObj.total = data.data.count;
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
            let Aurl = '';
            if (process.env.NODE_ENV === 'development') {
              Aurl = `/otcDetailOrder?orderId=${item.sequence}`;
            } else {
              Aurl = `${this.linkurl.otcUrl}/otcDetailOrder?orderId=${item.sequence}`;
            }
            let block = '';
            if (item.orderType) {
              Aurl = item.url;
              block = 'target="view_frame"';
            }
            let flist = [
              // 订单号
              [{
                // type: 'link', text: item.sequence, eventType: 'orderId', classes: ['orderId'],
                type: 'icon', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                iconSvg: `<a class="u-8-cl" ${block} href="${Aurl}">${item.sequence}</a>`,
              }],
              [{
                text: item.type,
                classes: item.side === 'BUY' ? 'b-5-cl' : 'b-6-cl',
              }],
              getCoinShowName(item.coinSymbol, this.market.coinList), // 币种
              this.currentCoinPriceFix(item.price, item.coinSymbol, item.payCoin), // 价格
              fixD(item.volume, this.getFix(item.coinSymbol)), // 数量
              this.currentCoinPriceFix(item.totalPrice, item.coinSymbol, item.payCoin), // 交易额
            ];
            if (this.excheifFlag) {
              flist.push(item.relativeFee);
            }
            const Vlist = [
              item.status_text, // 状态
              // 交易对方
              item.orderType
                ? item.realName
                : [
                  {
                    type: 'button',
                    text: item.nickName,
                    eventType: 'userName',
                    subContent: {
                      text: item.realName,
                      classes: ['e-2-cl'], // 默认没有
                    },
                  },
                ],
            ];
            flist = flist.concat(Vlist);
            list.push({
              id: JSON.stringify(item),
              data: flist,
            });
          });
          this.tabelList = list;
          this.paginationObj.total = data.data.count;
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
      const data = JSON.parse(v);
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
  },
};
