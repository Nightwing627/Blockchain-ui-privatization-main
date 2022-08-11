import {
  fixD, formatTime, getCoinShowName, colorMap, imgMap,
} from '@/utils';


export default {
  name: 'page-flowingWater',
  data() {
    return {
      imgMap,
      colorMap,
      tabelLoading: true,
      nowType: 1, // 1为当前借贷 2为历史借贷 3为划转记录
      symbol: '', // 当前币种 (当前借贷/历史借贷使用)
      tabelList: [], // table数据列表
      symbolList: [], // 币种选择列表
      otherType: '0', // 其他记录 type
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      revokeList: [], // 撤销队列
      subContent: [], // 展开的数据
      subColumns: [], // 展开的表头
      subContentId: 0, // 展开的id
      subLoading: false, // 展开的loading
      dataList: {},
      messData: null,
    };
  },
  computed: {
    otherTypeList() {
      return [
        // 全部
        { code: '0', value: this.$t('assets.lerverageFlowingWater.directionAll') },
        // 转入杠杆
        { code: '1', value: this.$t('assets.lerverageFlowingWater.directionIn') },
        // 转出杠杆
        { code: '2', value: this.$t('assets.lerverageFlowingWater.directionOut') },
      ];
    },
    navTab() {
      const arr = [
        // 当前借贷
        { name: this.$t('assets.lerverageFlowingWater.tab1'), index: 1 },
        // 历史借贷
        { name: this.$t('assets.lerverageFlowingWater.tab2'), index: 2 },
        // 划转记录
        { name: this.$t('assets.lerverageFlowingWater.tab3'), index: 3 },
      ];
      return arr;
    },
    // market 接口
    market() { return this.$store.state.baseData.market; },
    // 表格title
    columns() {
      let list = [];
      if (this.nowType === 1) {
        list = [
          { title: this.$t('assets.lerverageFlowingWater.tab1List1'), width: '10%' }, // 申请时间
          { title: this.$t('assets.lerverageFlowingWater.tab1List2'), width: '10%' }, // 杠杆账户
          { title: this.$t('assets.lerverageFlowingWater.tab1List3'), width: '10%' }, // 币种
          { title: this.$t('assets.lerverageFlowingWater.tab1List4'), width: '15%' }, // 数量
          { title: this.$t('assets.lerverageFlowingWater.tab1List5'), width: '10%' }, // 利率
          { title: this.$t('assets.lerverageFlowingWater.tab1List6'), width: '15%' }, // 未还利息
          { title: this.$t('assets.lerverageFlowingWater.tab1List7'), width: '15%' }, // 未还数量
          { title: this.$t('assets.lerverageFlowingWater.tab1List8'), width: '15%' }, // 操作
        ];
      } if (this.nowType === 2) {
        list = [
          { title: this.$t('assets.lerverageFlowingWater.tab2List1'), width: '10%' }, // 申请时间
          { title: this.$t('assets.lerverageFlowingWater.tab2List2'), width: '10%' }, // 杠杆账户
          { title: this.$t('assets.lerverageFlowingWater.tab2List3'), width: '10%' }, // 币种
          { title: this.$t('assets.lerverageFlowingWater.tab2List4'), width: '15%' }, // 数量
          { title: this.$t('assets.lerverageFlowingWater.tab2List5'), width: '15%' }, // 利率
          { title: this.$t('assets.lerverageFlowingWater.tab2List6'), width: '15%' }, // 未还利息
          { title: this.$t('assets.lerverageFlowingWater.tab2List7'), width: '15%' }, // 操作
          { title: this.$t('assets.lerverageFlowingWater.tab1List8'), width: '10%' }, // 操作
        ];
      } if (this.nowType === 3) {
        list = [
          { title: this.$t('assets.lerverageFlowingWater.tab3List1'), width: '10%' }, // 时间
          { title: this.$t('assets.lerverageFlowingWater.tab3List2'), width: '20%' }, // 杠杆账户
          { title: this.$t('assets.lerverageFlowingWater.tab3List3'), width: '20%' }, // 币种
          { title: this.$t('assets.lerverageFlowingWater.tab3List4'), width: '30%' }, // 数量
          { title: this.$t('assets.lerverageFlowingWater.tab3List5'), width: '20%' }, // 方向
        ];
      }
      return list;
    },
    // 用于axios的symbol
    axiosSymbol() {
      if (this.symbol === 'all') {
        return null;
      }
      return this.symbol;
    },
    newcoinOpen() {
      return this.$store.state.baseData.newcoinOpen;
    },
  },
  watch: {
    market(v) { if (v && this.messData) { this.setData(); } },
    messData(v) { if (v && this.market) { this.setData(); } },
  },
  methods: {
    init() {
      this.getMess();
      if (this.market && this.messData) { this.setData(); }
    },
    getShowSymbol(v, coin) {
      if (!this.market) return v;
      const { market } = this.market;
      let showSymbol = v;
      if (this.market && market) {
        const obj = market[coin][v];
        showSymbol = obj.showName || obj.name;
      }
      return showSymbol;
    },
    getShowCoin(v) {
      if (!this.market) return v;
      const { coinList } = this.market;
      let str = v;
      if (this.market && coinList) {
        str = getCoinShowName(v, coinList);
      }
      return str;
    },
    getMess() {
      this.axios({
        url: '/lever/finance/balance',
      }).then((data) => {
        if (data.code.toString() === '0') {
          const arr = [];
          Object.keys(data.data.leverMap).forEach((item) => {
            const sp = item.split('/');
            arr[sp[0] + sp[1]] = data.data.leverMap[item];
          });
          this.messData = arr;
        }
      });
    },
    symbolChange(item) {
      this.symbol = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    otherTypeChange(item) {
      this.otherType = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    // tab切换
    currentType(item) {
      this.nowType = item.index;
      // this.symbol = 'all'
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    rateFixFn(v) {
      return `${fixD(v * 100, 2)}%`;
    },
    setData() {
      const list = [{ code: 'all', value: this.$t('assets.lerverageFlowingWater.allCoin') }];
      const { market } = this.market;
      Object.keys(market).forEach((item) => {
        Object.keys(market[item]).forEach((cv) => {
          const obj = market[item][cv];
          if (obj.is_open_lever) {
            list.push({ code: obj.symbol, value: this.getShowSymbol(obj.name, item) });
          }
        });
      });
      this.symbolList = list;
      this.symbol = 'all';
      this.getData();
    },
    getData() {
      if (this.nowType === 1) {
        this.rechargeData();
      } else if (this.nowType === 2) {
        this.withdrawData();
      } else {
        this.otherData();
      }
    },
    repaymentSuccess() {
      this.getData();
    },
    pagechange(v) {
      this.paginationObj.currentPage = v;
      this.getData();
    },
    tableClick(type, data) {
      if (type === 'repayment') {
        const Did = data.split('_')[1];
        const obj = this.dataList[Did];
        this.$bus.$emit('coRepayment', obj);
      } else if (type === 'details') {
        this.getSubTableData(data);
      }
    },
    typeText(v) {
      let str = '';
      switch (v) {
        case '1':
          str = this.$t('assets.leverageToLoan.typeText1');
          break;
        case '2':
          str = this.$t('assets.leverageToLoan.typeText2');
          break;
        default:
          str = this.$t('assets.leverageToLoan.typeText3');
      }
      return str;
    },
    // 查看详情
    getSubTableData(v) {
      if (v.open) {
        const sp = v.id.split('_');
        const vID = Number(sp[1]);
        // const symbol = sp[0];
        this.subContentId = v.id;
        this.subColumns = [
          this.$t('order.exchangeOrder.detailsTime'), // 时间
          this.$t('assets.leverageToLoan.list3'), // 币种
          this.$t('order.exchangeOrder.detailsVolume'), // 数量
          this.$t('assets.flowingWater.type'), // 类型
        ];
        this.subContent = [];
        this.subLoading = true;
        this.axios({
          url: '/lever/return/info',
          method: 'post',
          params: {
            id: vID.toString(),
            pageSize: 10000,
          },
        }).then((data) => {
          if (v.id !== this.subContentId) { return; }
          if (data.code.toString() === '0') {
            const list = [];
            data.data.financeList.forEach((item) => {
              // const [baseCoin, countCoin] = this.symbol.split('/');
              // const { marketFix, coinFix } = this.getFix(countCoin, baseCoin);
              // const obj = this.messData[symbol] || {};
              // let returnFix = obj.baseReturnPrecision || 8;
              const returnFix = 8;
              // if (item.coin === obj.quoteCoin) {
              //   returnFix = obj.quoteReturnPrecision || 8;
              // }
              list.push({
                ctime: formatTime(Number(item.repaymentTime)),
                coin: this.getShowCoin(item.coin),
                volume: fixD(item.returnMoney, returnFix),
                type: this.typeText(item.type.toString()),
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
    // 当前借贷数据数据
    rechargeData() {
      this.axios({
        url: 'lever/borrow/new',
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          symbol: this.axiosSymbol,
        },
      }).then((data) => {
        if (this.nowType !== 1) return;
        if (data.code.toString() === '0') {
          const list = [];
          data.data.financeList.forEach((item) => {
            const { coinList } = this.market;
            let fix = (coinList[item.coin] && coinList[item.coin].showPrecision) || 0;
            const obj = this.messData[item.symbol] || {};
            let returnFix = obj.baseReturnPrecision || 8;
            if (item.coin === obj.quoteCoin) {
              returnFix = obj.quoteReturnPrecision || 8;
            }
            // 新增修改精度为 8
            returnFix = 8;
            fix = 8;
            this.dataList[item.id] = item;
            list.push({
              id: `${item.symbol}_${item.id}`,
              data: [
                formatTime(Number(item.ctime)),
                item.showName || item.symbol.toUpperCase(),
                this.getShowCoin(item.coin.toUpperCase()),
                fixD(item.borrowMoney, fix),
                this.rateFixFn(item.interestRate),
                fixD(item.oweInterest, returnFix),
                fixD(item.oweAmount, returnFix),
                [
                  {
                    type: 'subTable', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                    text: this.$t('order.exchangeOrder.details'), // 详情
                    eventType: 'details',
                  },
                  {
                    type: 'button', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                    text: this.$t('assets.lerverageFlowingWater.repayment'), // 归还
                    eventType: 'repayment',
                  },
                ],
              ],
            });
          });
          this.tabelLoading = false;
          this.tabelList = list;
          this.paginationObj.total = data.data.count;
        }
      });
    },
    getHisStatus(status) {
      let str = '';
      switch (status) {
        case 1:
          str = this.$t('assets.lerverageFlowingWater.status1');
          break;
        case 2:
          str = this.$t('assets.lerverageFlowingWater.status2');
          break;
        case 3:
          str = this.$t('assets.lerverageFlowingWater.status3');
          break;
        case 4:
          str = this.$t('assets.lerverageFlowingWater.status4');
          break;
        case 5:
          str = this.$t('assets.lerverageFlowingWater.status5');
          break;
        case 6:
          str = this.$t('assets.lerverageFlowingWater.status6');
          break;
        case 7:
          str = this.$t('assets.lerverageFlowingWater.status7');
          break;
        default:
          str = '';
      }
      return str;
    },
    withdrawData() {
      this.axios({
        url: '/lever/borrow/history',
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          symbol: this.axiosSymbol,
        },
      }).then((data) => {
        if (this.nowType !== 2) return;
        if (data.code.toString() === '0') {
          const list = [];
          data.data.financeList.forEach((item) => {
            const { coinList } = this.market;
            let fix = (coinList[item.coin] && coinList[item.coin].showPrecision) || 0;
            const obj = this.messData[item.symbol] || {};
            let returnFix = obj.baseReturnPrecision;
            if (item.coin === obj.quoteCoin) {
              returnFix = obj.quoteReturnPrecision || 8;
            }
            // 新增修改精度为 8
            returnFix = 8;
            fix = 8;
            list.push({
              id: `${item.symbol}_${item.id}`,
              data: [
                formatTime(Number(item.ctime)),
                item.showName || item.symbol.toUpperCase(),
                this.getShowCoin(item.coin.toUpperCase()),
                fixD(item.borrowMoney, fix),
                this.rateFixFn(item.interestRate),
                fixD(item.interest, returnFix),
                this.getHisStatus(item.status),
                [
                  {
                    type: 'subTable', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                    text: this.$t('order.exchangeOrder.details'), // 详情
                    eventType: 'details',
                  },
                ],
              ],
            });
          });
          this.tabelLoading = false;
          this.tabelList = list;
          this.paginationObj.total = data.data.count;
        }
      });
    },
    // 划转记录
    otherData() {
      this.axios({
        url: 'lever/finance/transfer/list',
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          symbol: this.axiosSymbol,
          transactionType: this.otherType === '0' ? undefined : this.otherType,
        },
      }).then((data) => {
        if (this.nowType !== 3) return;
        if (data.code.toString() === '0') {
          const { financeList, count } = data.data;
          const list = [];
          financeList.forEach((item, index) => {
            const { coinList } = this.market;
            let fix = (coinList[item.coinSymbol] && coinList[item.coinSymbol].showPrecision) || 0;
            fix = 8;
            const side = item.transferType === 1
              ? this.$t('assets.lerverageFlowingWater.directionIn')
              : this.$t('assets.lerverageFlowingWater.directionOut'); // 状态
            list.push({
              id: index,
              data: [
                formatTime(item.createTime), // 时间
                item.showName || item.symbol, // 杠杆账户
                this.getShowCoin(item.coinSymbol), // 币种
                fixD(item.amount, fix), // 数量
                [{
                  text: side,
                  classes: item.transferType === 1 ? 'e-5-cl' : 'e-6-cl',
                }],

              ],
            });
          });
          this.tabelLoading = false;
          this.tabelList = list;
          this.paginationObj.total = count;
        }
      });
    },
  },
};
