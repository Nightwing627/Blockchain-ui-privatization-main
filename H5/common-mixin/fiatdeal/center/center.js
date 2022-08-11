import { fixD, nul } from '@/utils';

export default {
  name: 'center',
  filters: {
    roseFilter(v) {
      return fixD(v, 2);
    },
  },
  watch: {
    sideIsBlockTrade(sideIsBlockTrade) {
      if (sideIsBlockTrade !== null) {
        switch (sideIsBlockTrade.side) {
          case 'ordinary':
            this.side = 'SELL';
            this.isBlockTrade = 0;
            break;
          case 'bulkBuy':
            this.side = 'SELL';
            this.isBlockTrade = 1;
            break;
          default:
            this.side = 'SELL';
            this.isBlockTrade = 1;
        }
        this.page = 1;
        this.dataList = [];
        this.getData();
      }
    },
    pageTopTitle(v) {
      this.$bus.$emit('PAGE-TOP-TITLE', v);
    },
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
        if (Math.ceil(parseFloat(otcSearch.data.count) / parseFloat(this.pageSize))
          > this.page) {
          this.pullUpState = 0;
        } else {
          this.pullUpState = 3;
        }
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
          this.defaultCoin = this.otcPublicInfo.defaultCoin;
          this.side = this.otcPublicInfo.defaultSeach;
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
          this.defaultCoin = otcPublicInfo.defaultCoin;
          this.side = otcPublicInfo.defaultSeach;
          this.otcDefaultPaycoin = otcPublicInfo.otcDefaultPaycoin;
          this.value2 = otcPublicInfo.otcDefaultPaycoin;

          // 国家地区数据处理
          this.dataCountry(otcPublicInfo.countryNumberInfo);
          // 处理法币币种数据
          this.dataPaycoins(otcPublicInfo.paycoins);
          // 支付方式数据处理
          this.dataPayments(otcPublicInfo.payments);
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
    pageTopTitle() {
      const obj = this.navTab[this.currentTab - 1];
      let str = '';
      if (obj && obj.name) {
        str = obj.name;
      }
      return str;
    },
    sideIsBlockTrade() {
      return this.$store.state.fiatdeal.sideIsBlockTrade;
    },
    nowSide() {
      if (this.side === 'SELL') {
        return 1;
      }
      return 2;
    },
    sideTab() {
      return [
        // 购买
        { name: this.$t('fiatdeal.navList')[1], index: 1 },
        // 出售
        { name: this.$t('fiatdeal.navList')[2], index: 2 },
      ];
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
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    otcSearch() {
      return this.$store.state.fiatdeal.otcSearch;
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
  },
  data() {
    return {
      mobilitySelect: 2, // 快捷区 / 自选区
      pullUpState: 0,
      coinListFlag: false, // 选择币种弹窗
      // alert弹框
      alertFlag: false,
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
      list3: [],
      // 法币币种
      paycoins: [],
      // table 相关
      columns: [
        // {
        //   title: this.$t('fiatdeal.center.columns')[0],
        //   align: 'left',
        //   width: '200px',
        //   classes: '',
        // },
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
      pageSize: 10,
    };
  },
  methods: {
    init() {
      this.$bus.$off('HEADER-CLICK-EVENT');
      this.$bus.$on('HEADER-CLICK-EVENT', () => {
        this.coinListFlag = !this.coinListFlag;
      });
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
        this.defaultCoin = otcPublicInfo.defaultCoin;
        this.side = otcPublicInfo.defaultSeach;
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
    setMobilitySelect(v) {
      this.mobilitySelect = v;
    },
    onInfiniteLoads(done) {
      if (this.pullUpState === 0) {
        this.pullUpState = 2;
        this.page += 1;
        this.getData(true);
      }
      done();
    },
    // 下拉刷新
    onRefresh(done) {
      this.dataList = [];
      this.loading = true;
      this.page = 1;
      this.getData();
      done();
    },
    sideChange(item) {
      if (this.nowSide === item.index) { return; }
      if (item.index === 1) {
        this.side = 'SELL';
      } else {
        this.side = 'BUY';
      }
      this.page = 1;
      this.dataList = [];
      this.getData();
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
    operation(type, data) {
      const { id } = data;
      switch (type) {
        case 'icon':
          this.$router.push({ path: '/stranger', query: { uid: id[0] } });
          break;
        default:
          if (this.side === 'BUY' && this.paymentList.length === 0) { // 要出售时并无支付方式时
            this.alertFlag = true;
          } else {
            this.$router.push({ path: '/otcTrade?', query: { orderId: id[1], userId: id[0] } });
          }
      }
    },
    getData(noLoading) { // 获取数据
      if (!noLoading) {
        this.loading = true;
      }
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
            id: [obj.userId, obj.advertId],
            title: [
              {
                type: 'icon',
                eventType: 'icon',
                text: `<div class="merchants">
                  <div class="merchants-left a-12-bg" style="color:#EDF4F8">
                  ${obj.imageUrl ? `<img src="${obj.imageUrl}"/>` : `<span>${obj.otcNickName.substring(0, 1)}</span>`}
                  <i class="i a-5-bd ${obj.loginStatus === 1 ? 'a-18-bg' : 'a-1-bg'}"></i>
                  </div>
                  <div class="merchants-right">
                  <p>${obj.otcNickName}</p>
                  </div>
                  </div>`,
              },
            ],
            handle: [
              {
                text: `<p class="b-2-cl tradingV">${obj.completeOrders} | ${nul(obj.creditGrade, 100)}%</p>`,
              },
            ],
            data: [
              // 数量
              {
                text: `${fixD(obj.volumeBalance, coinList[this.defaultCoin].showPrecision)} ${this.defaultCoin}`,
                classes: 'b-2-cl',
              },
              // 限额
              {
                text: `${fixD(obj.minTrade, this.priceFix)}
                - ${fixD(obj.maxTrade, this.priceFix)} ${obj.payCoin}`,
                classes: 'b-2-cl',
              },
              // 单价
              {
                text: `${fixD(obj.price, this.priceFix)} ${obj.payCoin}`,
                classes: '',
              },
              // [{
              //   type: 'button', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
              //   text:
              //   iconClass: [''],
              //   eventType: 'check',
              //   classes: [''],
              // }],
            ],
            extendData: {
              payments: obj.payments,
              text: this.side === 'SELL' ? this.$t('fiatdeal.center.buy') : this.$t('fiatdeal.center.sell'),
            },
          });
        });
        this.dataList = [...[], ...this.dataList, ...list];
      } else {
        this.dataList = [];
      }
    },
    listChange(item, name) {
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
      this.dataList = [];
      this.getData();
    },
    currentType(data) {
      this.mobilitySelect = 2;
      this.coinListFlag = false;
      this.currentTab = data.index;
      this.defaultCoin = data.name;
      // 重新请求table数据
      // 数据重置
      this.page = 1;
      this.dataList = [];
      this.getData();
      // 24小时数据
      this.getOtcTicke();
      // 分钟线
      this.getMinuteLine();
    },
    dataProcessin(data, symbol) {
      const List = [];
      const list = Object.values(data);
      let tab = false;
      list.forEach((obj) => {
        if (Number(obj.otcOpen) === 1) {
          List.push(obj);
        }
      });
      this.navTab = List.map((obj, index) => (
        { name: obj.name, index: index + 1 }
      ));
      this.navTab.forEach((obj) => {
        if (obj.name === symbol) {
          this.currentTab = obj.index;
          tab = true;
        }
      });
      if (!tab) {
        [this.currentTab] = [this.navTab[0]];
        this.getOtcTicke();
      }
    },
    dataPaycoins(data) {
      this.list2 = data.map((obj) => (
        { value: obj.title, code: obj.key }
      ));
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
  },
  beforeDestroy() {
    this.$bus.$off('HEADER-CLICK-EVENT');
  },
};
