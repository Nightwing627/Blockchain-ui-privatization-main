import {
  fixD,
  nul,
  colorMap,
  imgMap,
  getCoinShowName,
} from '@/utils';

export default {
  name: 'center',
  filters: {
    roseFilter(v) {
      return fixD(v, 2);
    },
  },
  watch: {
    otcPaymentFind(otcPaymentFind) {
      if (otcPaymentFind) {
        this.paymentList = otcPaymentFind.data;
      }
    },
    defaultCountryCode(v) {
      if (v && this.value1 === '') {
        this.value1 = v;
      }
    },
    otcSearch(otcSearch) {
      if (otcSearch !== null) {
        this.loading = false;
        this.count = otcSearch.data.count;
        this.tablesData(otcSearch.data.advertList);
      }
    },
    sideIsBlockTrade(sideIsBlockTrade) {
      if (sideIsBlockTrade !== null) {
        switch (sideIsBlockTrade.side) {
          case 'ordinary':
            this.side = 'SELL';
            this.isBlockTrade = 0;
            break;
          case 'ordinaryBuy':
            this.side = 'SELL';
            this.isBlockTrade = 0;
            break;
          case 'ordinarySell':
            this.side = 'BUY';
            this.isBlockTrade = 0;
            break;
          case 'bulkBuy':
            this.side = 'SELL';
            this.isBlockTrade = 1;
            break;
          case 'bulkSell':
            this.side = 'BUY';
            this.isBlockTrade = 1;
            break;
          default:
            this.side = 'SELL';
            this.isBlockTrade = 1;
        }
        this.page = 1;
        this.pageSize = 15;
        // 左侧导航切换时不需要请求 24小时和分钟线
        this.getSearchData();
      }
    },
    otcTicker(otcTicker) {
      // 头部数据
      if (otcTicker) {
        if (this.publicInfo) {
          if (this.otcPublicInfo) {
            this.lastPrice = this.dealOtcTicke(
              otcTicker.data.lastPrice,
            );
            this.avgPrice = this.dealOtcTicke(
              otcTicker.data.avgPrice,
            );
            this.rose = otcTicker.data.rose;
            this.roseData(this.rose);
          }
        }
      }
    },
    otcMinuteLine(otcMinuteLine) {
      if (otcMinuteLine !== null) {
        // 数据处理kline
        this.kLineData(otcMinuteLine.data);
      }
    },
    userInfo(userInfo) {
      if (userInfo) {
        if (userInfo.nickName && userInfo.isCapitalPwordSet) {
          if (!userInfo.isOpenMobileCheck && !userInfo.googleStatus) {
            this.$bus.$emit('tip', { text: this.$t('fiatdeal.center.idinfo'), type: 'info' });
          }
        } else {
          this.$bus.$emit('tip', { text: this.$t('fiatdeal.center.idinfo'), type: 'info' });
        }
      }
    },
    publicInfo(publicInfo) {
      if (publicInfo) {
        if (this.otcPublicInfo) {
          // 数据处理 显示头部横向列表
          this.dataProcessin(publicInfo.market.coinList, this.otcPublicInfo.defaultCoin);
          if (!this.defaultCoin) {
            this.defaultCoin = this.otcPublicInfo.defaultCoin;
          }
          this.side = this.otcPublicInfo.defaultSeach.toUpperCase();
          this.otcDefaultPaycoin = this.otcPublicInfo.otcDefaultPaycoin;
          this.value2 = this.otcPublicInfo.otcDefaultPaycoin;

          // 国家地区数据处理
          this.dataCountry(this.otcPublicInfo.countryNumberInfo);
          // 处理法币币种数据
          this.dataPaycoins(this.otcPublicInfo.paycoins);
          // 支付方式数据处理
          this.dataPayments(this.otcPublicInfo.payments);
          // 请求数据
          // 搜索数据
          this.getData();
          // 24小时数据
          this.getOtcTicke();
          // 分钟线
          this.getMinuteLine();
          // 头部数据
          if (this.otcTicker) {
            this.lastPrice = this.dealOtcTicke(
              this.otcTicker.data.lastPrice,
            );
            this.avgPrice = this.dealOtcTicke(
              this.otcTicker.data.avgPrice,
            );
            this.rose = this.otcTicker.data.rose;
          }
        }
      }
    },
    otcPublicInfo(otcPublicInfo) {
      if (otcPublicInfo) {
        if (this.publicInfo) {
          // 数据处理 显示头部横向列表
          this.dataProcessin(this.publicInfo.market.coinList, otcPublicInfo.defaultCoin);
          if (!this.defaultCoin) {
            this.defaultCoin = otcPublicInfo.defaultCoin;
          }
          this.side = otcPublicInfo.defaultSeach.toUpperCase();
          this.otcDefaultPaycoin = otcPublicInfo.otcDefaultPaycoin;
          this.value2 = otcPublicInfo.otcDefaultPaycoin;

          // 国家地区数据处理
          this.dataCountry(otcPublicInfo.countryNumberInfo);
          // 处理法币币种数据
          this.dataPaycoins(otcPublicInfo.paycoins);
          // 支付方式数据处理
          this.dataPayments(otcPublicInfo.payments);
          // 请求数据
          // 搜索数据
          this.getData();
          // 24小时数据
          this.getOtcTicke();
          // 分钟线
          this.getMinuteLine();
          // 头部数据
          if (this.otcTicker) {
            this.lastPrice = this.dealOtcTicke(
              this.otcTicker.data.lastPrice,
            );
            this.avgPrice = this.dealOtcTicke(
              this.otcTicker.data.avgPrice,
            );
            this.rose = this.otcTicker.data.rose;
          }
        }
      }
    },
  },
  computed: {
    fiatTradeOpen() {
      const base = this.$store.state.baseData.publicInfo;
      if (base && base.switch && base.switch.fiat_trade_open === '1') {
        return true;
      }
      return false;
    },
    saasOtcFlowConfig() {
      let flag = false;
      if (this.publicInfo && this.publicInfo.switch
        && this.publicInfo.switch.saas_otc_flow_config
        && this.publicInfo.switch.saas_otc_flow_config.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    isShowMobility() {
      let flag = false;
      if (this.defaultCoin === 'USDT' && this.value2 === 'CNY' && this.saasOtcFlowConfig) {
        flag = true;
      }
      return flag;
    },
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    tradeTypeErrorText() {
      const start = this.$t('personal.alert.payTypeError[0]');
      const end = this.$t('personal.alert.payTypeError[1]');
      let pay = '';
      this.tradeTypeErrorShop.forEach((el) => {
        pay += `${el.title},`;
      });
      pay = pay.substr(0, pay.length - 1);

      return `${start}${pay}${end}`;
    },
    market() { return this.$store.state.baseData.market; },
    priceFix() {
      let fix = this.$store.state.baseData.defaultFiatPrecision;
      if (this.market
        && this.market.coinList[this.defaultCoin]
        && this.market.coinList[this.defaultCoin].fiatPrecision
        && this.market.coinList[this.defaultCoin].fiatPrecision[this.value2.toLowerCase()]) {
        fix = this.market.coinList[this.defaultCoin].fiatPrecision[this.value2.toLowerCase()];
      }
      return Number(fix);
    },
    otcPaymentFind() {
      return this.$store.state.personal.otcPaymentFind;
    },
    openOTxt() {
      return this.$t('fiatdeal.openA')[this.openC];
    },
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    otcSearch() {
      return this.$store.state.fiatdeal.otcSearch;
    },
    sideIsBlockTrade() {
      return this.$store.state.fiatdeal.sideIsBlockTrade;
    },
    otcTicker() {
      return this.$store.state.fiatdeal.otcTicker;
    },
    otcMinuteLine() {
      return this.$store.state.fiatdeal.otcMinuteLine;
    },
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
    },
    otcPublicInfo() {
      return this.$store.state.baseData.otcPublicInfo;
    },
    excheifFlag() {
      return this.$store.state.baseData.exchief_project_switch;
    },
  },
  data() {
    return {
      // alert弹框
      alertFlag: false,
      imgMap,
      colorMap,
      paymentList: [], // 支付方式list
      // table loading
      loading: false,
      // 分钟线
      klineDataList: [],
      lastPrice: '', // 最新价
      avgPrice: '', // 平均价
      rose: '', // 涨跌幅
      roseColor: 0, // 0 无颜色 1 涨绿 2 跌红
      side: '', // 买卖
      // 是否是大宗交易
      isBlockTrade: 0,
      defaultCoin: '', // 交易币种
      otcDefaultPaycoin: '', // 交易法币
      // 横向导航参数
      currentTab: 1,
      navTab: [],
      lineHeight: '55',
      marginRight: 48, // 距离右边的距离
      // select相关
      value1: '', // 国家
      value2: '', // 法币
      value3: '', // 支付方式
      countryErrorFlag: false,
      list1: [],
      list2: [],
      currencyListShow: [],
      currencyListHide: [],
      showMore: false,
      openC: 0,
      paycoinsType: 0,
      list3: [],
      // 法币币种
      paycoins: [],
      // table 相关
      columns: [
        {
          title: this.$t('fiatdeal.center.columns')[0],
          align: 'left',
          width: '200px',
          classes: '',
        },
        {
          title: this.$t('fiatdeal.center.columns')[1],
          align: 'right',
          width: '200px',
          classes: '',
        },
        {
          title: this.$t('fiatdeal.center.columns')[2],
          align: 'right',
          width: '250px',
          classes: '',
        },
        {
          title: this.$t('fiatdeal.center.columns')[3],
          align: 'right',
          width: '180px',
          classes: '',
        },
        {
          title: this.$t('fiatdeal.center.columns')[4],
          align: 'right',
          width: '150px',
          classes: '',
        },
        {
          title: this.$t('fiatdeal.center.columns')[5],
          align: 'right',
          width: '100px',
          classes: '',
        },
      ],
      dataList: [],
      cellHeight: 70,
      headHeight: 30,
      lineNumber: 15,
      classes: '',
      headClasses: '',
      bodyClasses: '',
      lineClass: '',
      // page相关
      count: 0,
      page: 1,
      pageSize: 15,
      tradeTypeErrorShop: [],
    };
  },
  methods: {
    init() {
      this.$store.dispatch('otcPaymentFind'); // 获取支付方式list
      if (this.defaultCountryCode) {
        this.value1 = this.defaultCountryCode;
      }
      const { otcPublicInfo } = this.$store.state.baseData;
      const { publicInfo } = this.$store.state.baseData;
      const { userInfo } = this.$store.state.baseData;
      if (otcPublicInfo && publicInfo) {
        // 数据处理 显示头部横向列表
        this.dataProcessin(publicInfo.market.coinList, otcPublicInfo.defaultCoin);
        // 头部单位
        if (!this.defaultCoin) {
          this.defaultCoin = otcPublicInfo.defaultCoin;
        }
        this.side = otcPublicInfo.defaultSeach.toUpperCase();
        this.otcDefaultPaycoin = otcPublicInfo.otcDefaultPaycoin;
        this.value2 = otcPublicInfo.otcDefaultPaycoin;

        // 国家地区数据处理
        this.dataCountry(otcPublicInfo.countryNumberInfo);
        // 处理法币币种数据
        this.dataPaycoins(otcPublicInfo.paycoins);
        // 支付方式数据处理
        this.dataPayments(otcPublicInfo.payments);
        // 请求数据
        // 搜索数据
        this.getData();
        // 24小时数据
        this.getOtcTicke();
        // 分钟线
        this.getMinuteLine();
        // 分钟线轮训
        setInterval(() => {
          // 分钟线
          this.getMinuteLine(true);
        }, 30000);
      }
      if (userInfo !== null) {
        if (userInfo.nickName && userInfo.isCapitalPwordSet) {
          if (!userInfo.isOpenMobileCheck && !userInfo.googleStatus) {
            this.$bus.$emit('tip', { text: this.$t('fiatdeal.center.idinfo'), type: 'info' });
          }
        } else {
          this.$bus.$emit('tip', { text: this.$t('fiatdeal.center.idinfo'), type: 'info' });
        }
      }
    },
    changKinde(v) {
      this.value2 = v.code;
      this.otcDefaultPaycoin = v.code;
      this.listChange(v, 'value2');
    },
    showKinde() {
      this.showMore = !this.showMore;
      if (this.openC === 0) {
        this.openC = 1;
      } else {
        this.openC = 0;
      }
    },
    roseData(rose) {
      if (rose === 0) {
        this.roseColor = 0;
      } else if (rose > 0) {
        this.roseColor = 1;
      } else {
        this.roseColor = 2;
      }
    },
    alertClose() {
      this.alertFlag = false;
    },
    alertGo() {
      this.alertFlag = false;
      this.$router.push('/personal/leaglTenderSet');
    },
    dealOtcTicke(price) {
      return fixD(price, this.priceFix);
    },
    kLineData(data) {
      const list = [];
      data.forEach((obj) => {
        list.push([obj.time, obj.price]);
      });
      this.klineDataList = list;
    },
    operation(type, id) {
      if (!this.isLogin) {
        this.$router.push('/login');
        return;
      }

      switch (type) {
        case 'icon':
          this.$router.push({ path: '/stranger', query: { uid: id[0] } });
          break;
        default:
          if (this.side === 'BUY' && !this.isPaymentMatch(id[2])) { // 要出售时并无支付方式时
            [,, this.tradeTypeErrorShop] = id;
            this.alertFlag = true;
          } else {
            this.$router.push({ path: '/otcTrade?', query: { orderId: id[1], userId: id[0] } });
          }
      }
    },
    isPaymentMatch(payments) {
      if (this.paymentList.length === 0) { // 如果用户没有任何支付方式设定，则不能进行交易
        return false;
      }
      if (!payments || payments.length === 0) { // 如果商户没有支付方式，则不能进行交易
        return false;
      }

      // 检查支付方式是否匹配
      return payments.some(
        (obj) => this.paymentList.some((payment) => obj.key === payment.payment),
      );
    },
    pagechange(data) {
      this.page = data;
      this.getData();
    },
    getData() { // 获取数据
      this.loading = true;
      const info = {
        side: this.side,
        symbol: this.defaultCoin,
        isBlockTrade: this.isBlockTrade,
        payCoin: this.value2,
        payments: this.value3 === 'all' ? '' : this.value3,
        numberCode: this.value1 === 'all' ? '' : this.value1,
        pageSize: this.pageSize,
        page: this.page,
      };
      this.$store.dispatch('otcSearch', info);
    },
    getSearchData() { // 获取数据
      this.loading = true;
      const info = {
        side: this.side,
        symbol: this.defaultCoin,
        isBlockTrade: this.isBlockTrade,
        payCoin: this.value2,
        payments: this.value3 === 'all' ? '' : this.value3,
        numberCode: this.value1 === 'all' ? '' : this.value1,
        pageSize: this.pageSize,
        page: this.page,
      };
      this.$store.dispatch('otcSearchFlag', info);
    },
    getOtcTicke() {
      const info = {
        symbol: this.defaultCoin,
        payCoin: this.value2,
      };
      this.$store.dispatch('otcTicker', info);
    },
    getMinuteLine(auto) {
      const info = {
        symbol: this.defaultCoin,
        payCoin: this.value2,
      };
      if (auto) {
        info.auto = true;
      }
      this.$store.dispatch('otcMinuteLine', info);
    },
    tablesData(data) { // 处理数据
      const { coinList } = this.$store.state.baseData.market;
      const list = [];
      if (data) {
        data.forEach((obj) => {
          list.push({
            id: [obj.userId, obj.advertId, obj.payments],
            data: [
              [
                {
                  type: 'icon',
                  eventType: 'icon',
                  iconSvg: `<div class="merchants">
                    <div class="merchants-left a-12-bg" style="color:#EDF4F8">
                    ${obj.imageUrl ? `<img src="${obj.imageUrl}"/>` : `<span>${obj.otcNickName.substring(0, 1)}</span>`}
                    <i class="i a-5-bd ${obj.loginStatus === 1 ? 'a-18-bg' : 'a-1-bg'}"></i>
                    </div>
                    <div class="merchants-right">
                    <p>${obj.otcNickName}</p>
                    <p class="b-2-cl">${this.$t('fiatdeal.center.trading')} ${obj.completeOrders} | ${this.$t('fiatdeal.center.credit')} ${nul(obj.creditGrade, 100)}%</p>
                    </div>
                    </div>`,
                },
              ],
              [
                {
                  text: `${fixD(obj.volumeBalance, coinList[this.defaultCoin].showPrecision)}
                    ${getCoinShowName(this.defaultCoin, this.market.coinList)}`,
                  classes: 'b-2-cl',
                },
              ],
              [
                {
                  text: `${fixD(obj.minTrade, this.priceFix)}
                  - ${fixD(obj.maxTrade, this.priceFix)} ${obj.payCoin}`,
                  classes: 'b-2-cl',
                },
              ],
              [
                {
                  text: `${fixD(obj.price, this.priceFix)} ${obj.payCoin}`,
                  classes: '',
                },
              ],
              [
                {
                  type: 'icon',
                  iconSvg: `<ul>
                    ${this.paymentsList(obj.payments).join('')}
                </ul>`,
                  classes: 'payments-ul',
                },
              ],
              [{
                type: 'button', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                text: this.side === 'SELL' ? this.$t('fiatdeal.center.buy') : this.$t('fiatdeal.center.sell'),
                iconClass: [''],
                eventType: 'check',
                classes: [''],
              }],
            ],
          });
        });
        this.dataList = list;
      } else {
        this.dataList = [];
      }
    },
    paymentsList(data) {
      const list = [];
      data.forEach((obj) => {
        list.push(`<li class='a-2-bg'><img src=${obj.icon} /></li>`);
      });
      return list;
    },
    listChange(item, name) {
      // debugger
      switch (name) {
        case 'value1':
          this.value1 = item.code;
          // 24小时数据
          this.getOtcTicke();
          // 分钟线
          this.getMinuteLine();
          break;
        case 'value2':
          this.value2 = item.code;
          this.otcDefaultPaycoin = item.code;
          // 24小时数据
          this.getOtcTicke();
          // 分钟线
          this.getMinuteLine();
          break;
        default:
          this.value3 = item.code;
      }
      // 重新请求table数据
      // 数据重置
      this.page = 1;
      this.pageSize = 15;
      this.getData();
    },
    currentType(data) {
      this.currentTab = data.index;
      this.defaultCoin = data.coinName;
      // 重新请求table数据
      // 数据重置
      this.page = 1;
      this.pageSize = 15;
      this.getData();
      // 24小时数据
      this.getOtcTicke();
      // 分钟线
      this.getMinuteLine();
    },
    dataProcessin(data, symbol) {
      let list = Object.values(data);

      if (Array.isArray(list)) {
        list = list.sort((a, b) => a.sort - b.sort);
      }

      this.navTab = [];
      let tab = false;
      let count = 0;
      list.forEach((obj) => {
        if (Number(obj.otcOpen) === 1) {
          count += 1;
          this.navTab.push(
            {
              name: getCoinShowName(obj.name, this.market.coinList),
              index: count,
              coinName: obj.name,
            },
          );
          if (obj.name === symbol) {
            this.currentTab = count;
            tab = true;
          }
        }
      });
      if (!tab) {
        this.currentTab = this.navTab[0].index;
        this.defaultCoin = this.navTab[0].name;
        // this.getOtcTicke();
      }
    },
    dataPaycoins(data) {
      this.paycoinsType = 1;
      this.currencyListHide = [];
      this.currencyListShow = [];
      data.forEach((obj) => {
        if (obj.used) {
          const object = { value: obj.title, code: obj.key };
          if (obj.hide) {
            this.paycoinsType = 2;
            object.hide = 1;
            this.currencyListHide.push(object);
          } else {
            this.currencyListShow.push(object);
          }
          this.list2.push(object);
        }
      });
    },
    dataPayments(data) {
      const List = [];
      List.push({ value: this.$t('fiatdeal.center.all'), code: 'all' });
      data.forEach((obj) => (
        List.push({ value: obj.title, code: obj.key })
      ));
      this.list3 = List;
      this.value3 = 'all';
    },
    dataCountry(data) {
      const List = [];
      List.push({ value: this.$t('fiatdeal.center.all'), code: 'all' });
      data.forEach((obj) => (
        List.push({ value: obj.title, code: obj.numberCode })
      ));
      this.list1 = List;
      this.value1 = 'all';
    },
    handlerGoCredit() {
      // 信用卡
      this.$router.push('/creditCard');
    },
  },
};
