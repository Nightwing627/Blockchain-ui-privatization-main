import {
  colorMap, getHex, imgMap, formatTime, fixD, getCookie,
} from '@/utils';

export default {
  name: 'futuresData',
  data() {
    return {
      imgMap,
      colorMap,
      tableType: 1,
      headClasses: 'c-4-bg',
      bodyClasses: 'c-4-bg',
      symbol: null,
      type: null,
      contractId: null,
      tableLoading: false,
      dataList: [],
      brokenLineList: [],
      historyList: [],
      amount: 0,
      pagination: { // 翻页数据
        count: 0, // 总数量
        pageSize: 10, // 每页显示条数
        page: 1, // 当前页数
      },
    };
  },
  computed: {
    // 类型列表 USDT合约/币本位合约
    typeTabList() {
      return [
        {
          code: '1',
          value: this.$t('futuresData.typeTabList1'), // 'USDT合约',
        },
        {
          code: '0',
          value: this.$t('futuresData.typeTabList2'), // '币本位合约',
        },
        {
          code: '2',
          value: this.$t('futuresData.typeTabList3'), // '混合合约',
        },
        {
          code: '3',
          value: this.$t('futuresData.typeTabList4'), // '模拟合约',
        },
      ];
    },
    tbaleTitle() {
      let text = this.$t('futuresData.tabList1'); //  '收支记录';
      if (this.tableType === 2) {
        text = this.$t('futuresData.tabList2'); //  '历史数据';
      }
      if (this.tableType === 3) {
        text = this.$t('futuresData.tabList3'); //  '指数价格组成';
      }
      return text;
    },
    moreText() {
      let data = {
        text: this.$t('futuresData.moreText1'), //  '了解保险基金',
        link: 'https://chainupfutures.zendesk.com/hc/zh-sg/articles/900003529386-%E4%BF%9D%E9%99%A9%E5%9F%BA%E9%87%91',
      };
      if (this.tableType === 2) {
        data = {
          text: this.$t('futuresData.moreText2'), //  '了解资金费率',
          link: 'https://chainupfutures.zendesk.com/hc/zh-sg/articles/900004402523-%E8%B5%84%E9%87%91%E8%B4%B9%E7%8E%87',
        };
      }
      if (this.tableType === 3) {
        data = {
          text: this.$t('futuresData.moreText3'), //  '了解指数价格',
          link: 'https://chainupfutures.zendesk.com/hc/zh-sg/articles/900004402503-%E6%8C%87%E6%95%B0%E4%BB%B7%E6%A0%BC',
        };
      }
      if (this.tableType === 4) {
        data = {
          text: this.$t('futuresData.moreText4'), //  '了解指标记价格',
          link: 'https://chainupfutures.zendesk.com/hc/zh-sg/articles/900003490006-%E6%A0%87%E8%AE%B0%E4%BB%B7%E6%A0%BC',
        };
      }
      return data;
    },
    // 合约列表
    contractList() {
      return this.$store.state.future.contractList;
    },
    // 当前基金币种信息
    acriveSymbol() {
      let data = {};
      if (this.contractList.length && this.symbol) {
        this.contractList.forEach((item) => {
          if (item.marginCoin === this.symbol) { data = item; }
        });
      }
      return data;
    },
    // 当前合约信息
    acriveContract() {
      let data = {};
      if (this.contractList.length && this.symbol) {
        this.contractList.forEach((item) => {
          if (item.id === this.contractId) { data = item; }
        });
      }
      return data;
    },
    // 合约列表
    marketList() {
      const data = [];
      let text = '';
      if (this.contractList && this.contractList.length) {
        this.contractList.forEach((item) => {
          if (Number(this.type) === this.filterType(item)) {
            if (item.contractType !== 'E') {
              text = `-${item.marginCoin}`;
            } else {
              text = '';
            }
            const symbolName = item.symbol.replace('-', '');
            data.push({
              value: `${symbolName}${text}`,
              code: item.id,
            });
          }
        });
      }

      return data;
    },
    // 保证金币种列表
    marginCoinList() {
      if (this.$store.state.future.marginCoinList) {
        return this.$store.state.future.marginCoinList;
      }
      return [];
    },
    tabList() {
      return [
        {
          key: 1,
          text: this.$t('futuresData.tabList1'), // '永续合约保险基金',
        },
        {
          key: 2,
          text: this.$t('futuresData.tabList2'), // '资金费率',
        },
        {
          key: 3,
          text: this.$t('futuresData.tabList3'), // '指数价格',
        },
        {
          key: 4,
          text: this.$t('futuresData.tabList4'), // '标记价格',
        },
      ];
    },
    // 保险基金币种
    symbolOPtion() {
      const arr = [];
      if (this.marginCoinList.length) {
        this.marginCoinList.forEach((item) => {
          arr.push({
            value: item,
            code: item,
          });
        });
      }

      return arr;
    },
    columns() {
      if (this.tableType === 1) {
        return [
          {
            title: this.$t('futuresData.columns1'), //  '时间',
            width: '33%',
          },
          {
            title: this.$t('futuresData.columns2'), //  '流水类型',
            width: '33%',
          },
          {
            title: this.$t('futuresData.columns3'), //  '金额',
            width: '33%',
          },
        ];
      }
      if (this.tableType === 2) {
        return [
          {
            title: this.$t('futuresData.columns1'), //  '时间',
            width: '33%',
          },
          {
            title: this.$t('futuresData.columns4'), //  '合约',
            width: '33%',
          },
          {
            title: this.$t('futuresData.columns5'), //  '当期资金费率',
            width: '33%',
          },
        ];
      }
      return [
        {
          title: this.$t('futuresData.columns6'), //  '交易所',
          width: '50%',
        },
        {
          title: this.$t('futuresData.columns7'), //  '权重',
          width: '50%',
        },
      ];
    },
    contractName() {
      if (this.contractId && this.marketList.length) {
        let name = '';
        this.marketList.forEach((item) => {
          if (this.contractId === item.code) {
            name = item.value;
          }
        });
        return name;
      }
      return '';
    },
    publicInfo() {
      if (this.$store.state && this.$store.state.baseData) {
        return this.$store.state.baseData.publicInfo;
      }
      return null;
    },
    // 页面标题title
    documentTitle() {
      const lang = getCookie('lan');
      let str = '';
      if (this.publicInfo) {
        const { indexHeaderTitle, seo } = this.publicInfo;
        let title = '';
        if (indexHeaderTitle) {
          if (lang) {
            title = seo.title || indexHeaderTitle[lang];
          } else {
            const lan = this.publicInfo.lan.defLan;
            title = seo.title || indexHeaderTitle[lan];
          }
        }
        str = `合约数据 - ${title}`;
      }
      return str;
    },
  },
  watch: {
    // 页面标题title
    documentTitle(val) {
      setTimeout(() => {
        document.title = val;
      }, 200);
    },
    // 永续合约保险基金列表
    symbolOPtion(val, old) {
      if (val.length && !old.length) {
        this.setSymbolValue();
      }
    },
    // 永续合约保险基金
    symbol(val) {
      if (val) {
        this.pagination.page = 1;
        this.getData();
        this.getRiskAccount();
      }
    },
    // 合约类型列表
    typeTabList(val, old) {
      if (val.length && !old.length) {
        // this.type = val[0].code;
        this.setTypeValue();
      }
    },
    // 合约列表
    marketList(val) {
      if (val.length) {
        this.pagination.page = 1;
        // this.contractId = val[0].code;
        this.setcoValue();
      } else {
        this.contractId = null;
      }
    },
    contractId(val) {
      this.brokenLineList = [];
      if (val) {
        this.getData();
      }
    },
    tableType(val) {
      if (val) {
        this.setSymbolValue();
        if (this.typeTabList.length) {
          // this.type = this.typeTabList[0].code;
          this.setTypeValue();
        }
        if (this.marketList.length) {
          // this.contractId = this.marketList[0].code;
          this.setcoValue();
        }
        this.getData();
      }
    },
    // line
    brokenLineList() {
      let time = [];
      let datas = [];
      if (this.brokenLineList && this.brokenLineList.length) {
        this.brokenLineList.forEach((item) => {
          time.push(formatTime(item.ctime));
          datas.push(fixD(item.amount, this.acriveSymbol.mCionFix));
        });
      } else {
        time = [0];
        datas = [0];
      }

      this.myEcharts.setOption({
        xAxis:
        {
          data: time,
        },
        series: [
          {
            type: 'line',
            data: datas,
          },
        ],
      });
    },
  },
  methods: {
    init() {
      this.initEachart();
      this.setInitValue();
      this.setSymbolValue();
      document.title = this.documentTitle;
    },
    // 设置默认保险基金币种
    setSymbolValue() {
      if (this.symbolOPtion.length) {
        const { marginCoin } = this.$route.query;
        if (marginCoin && this.isIndexFo(this.symbolOPtion, marginCoin)) {
          this.symbol = marginCoin;
        } else if (this.isIndexFo(this.symbolOPtion, 'USDT')) {
          this.symbol = 'USDT';
        } else {
          this.symbol = this.symbolOPtion[0].code;
        }
      }
    },
    // 设置默认合约类型
    setTypeValue() {
      if (this.typeTabList.length) {
        const { type } = this.$route.query;
        if (type && this.isIndexFo(this.typeTabList, type)) {
          this.type = type;
        } else {
          this.type = this.typeTabList[0].code;
        }
      }
    },
    // 设置默认合约
    setcoValue() {
      if (this.marketList.length) {
        const { contractId } = this.$route.query;
        if (contractId && this.isIndexFo(this.marketList, contractId)) {
          this.contractId = Number(contractId);
        } else {
          this.contractId = this.marketList[0].code;
        }
      }
    },
    isIndexFo(list, val) {
      let flag = false;
      list.forEach((item) => {
        if (item.code.toString() === val.toString()) {
          flag = true;
        }
      });
      return flag;
    },
    setInitValue() {
      // 合约列表
      if (this.marketList.length) {
        // this.contractId = this.marketList[0].code;
        this.setcoValue();
      }
      // 合约类型
      if (this.typeTabList.length) {
        // this.type = this.typeTabList[0].code;
        this.setTypeValue();
      }
      // 保险基金币种
      if (this.symbolOPtion.length) {
        // this.symbol = this.symbolOPtion[0].code;
        this.setSymbolValue();
      }
    },

    initEachart() {
      // 基于准备好的dom，初始化echarts实例
      this.myEcharts = window.echarts.init(document.getElementById('chartbox'));
      // 绘制图表
      this.myEcharts.setOption({
        animation: false,
        tooltip: {
          trigger: 'axis', // 不限时弹层
          axisPointer: { // 显示随手指移动的刻度线
            type: 'cross',
            crossStyle: {
              width: 2,
              color: getHex(colorMap['b-2-cl']),
              type: 'cross',
            },
          },
        },
        grid: {
          show: true,
          borderWidth: 0,
          borderColor: getHex(colorMap['a-3-bd']),
          containLabel: true,
          left: 5,
          top: 40,
          right: 5,
          bottom: 0,
        },
        xAxis: {
          data: [],
          axisPointer: {
            show: true,
            type: 'line',
          },
          axisLine: {
            show: true,
            lineStyle: {
              width: 1,
              color: getHex(colorMap['a-3-bd']),
            },
          },
          axisTick: {
            lineStyle: {
              color: getHex(colorMap['a-3-bd']),
            },
          },
          axisLabel: {
            color: getHex(colorMap['b-2-cl']),
            formatter: function name(value) {
              return value;
            },
          },
          splitLine: {
            lineStyle: {
              width: 1,
              color: getHex(colorMap['a-3-bd']),
            },
          },
        },
        yAxis: [
          {
            type: 'value',
            axisLine: {
              show: true,
              lineStyle: {
                width: 1,
                color: getHex(colorMap['a-3-bd']),
              },
            },
            axisTick: {
              lineStyle: {
                color: getHex(colorMap['a-3-bd']),
              },
            },
            axisLabel: {
              color: getHex(colorMap['b-2-cl']),
            },
            splitLine: {
              lineStyle: {
                width: 1,
                color: getHex(colorMap['a-3-bd']),
              },
            },
          },
        ],
        series: [{
          data: [],
          // lineStyle: {
          //   color: getHex(colorMap['b-1-cl']),
          // },
          type: 'line',
        }],
      });
    },
    // 筛选币对列表
    filterType(data) {
      // USDT 合约
      if (data.contractType === 'E' && data.contractSide === 1) {
        return 1;
      }
      // 币本位合约
      if (data.contractType === 'E' && data.contractSide === 0) {
        return 0;
      }
      // 模拟合约
      if (data.contractType === 'S') {
        return 3;
      }
      return 2;
    },
    // 切换类型
    switcherType(type) {
      this.pagination.page = 1;
      this.tableType = type;
      if (type === 1) {
        this.getRiskAccount();
      }
    },
    // select 选择事件
    selectOnChange(data, name) {
      this[name] = data.code;
    },
    getData() {
      let url = this.$store.state.url.futures.riskBalanceList;
      let paramsData = {
        symbol: this.symbol,
        page: this.pagination.page,
        limit: this.pagination.pageSize,
      };
      if (this.tableType === 2) {
        url = this.$store.state.url.futures.fundingRateList;
        paramsData = {
          contractId: this.contractId,
          page: this.pagination.page,
          limit: this.pagination.pageSize,
        };
      }
      if (this.tableType === 3) {
        url = this.$store.state.url.futures.indexPriceWeightList;
        paramsData = {
          contractId: this.contractId,
          page: this.pagination.page,
          limit: this.pagination.pageSize,
        };
      }
      this.brokenLineList = [];
      this.axios({
        url,
        hostType: 'co',
        params: paramsData,
      }).then(({ data, code }) => {
        this.tableLoading = false;
        if (code === '0') {
          this.historyList = data.historyList;
          this.brokenLineList = data.brokenLineList || [];
          if (this.tableType === 3) {
            this.setData(data.records);
          } else {
            this.setData(this.historyList);
          }
          if (this.tableType === 1) {
            this.pagination.count = data.hisCount;
          }
          if (this.tableType === 2) {
            this.pagination.count = data.count;
          }
        }
      });
    },
    setData(dataList) {
      const arr = [];
      if (dataList && dataList.length) {
        if (this.tableType === 1) {
          dataList.forEach((item) => {
            arr.push({
              id: item.id,
              data: [
                formatTime(item.ctime),
                // '接管盈利注入' : '风险准备金支出',
                item.type === 1 ? this.$t('futuresData.text2') : this.$t('futuresData.text3'),
                fixD(item.hisAmount, this.acriveSymbol.mCionFix),
              ],
            });
          });
        }
        if (this.tableType === 2) {
          dataList.forEach((item) => {
            arr.push({
              id: item.id,
              data: [
                formatTime(item.ctime),
                item.contractName,
                `${fixD(item.amount * 100, 5)}%`,
              ],
            });
          });
        }
        if (this.tableType === 3) {
          dataList.forEach((item) => {
            arr.push({
              id: item.id,
              data: [
                item.name,
                `${fixD(item.weightRate * 100, 2)}%`,
              ],
            });
          });
        }
      }
      this.dataList = arr;
    },
    getRiskAccount() {
      const url = this.$store.state.url.futures.getRiskAccount;
      const paramsData = {
        coinSymbol: this.symbol,
      };
      this.axios({
        url,
        hostType: 'co',
        params: paramsData,
      }).then(({ data, code }) => {
        this.tableLoading = false;
        if (code === '0') {
          this.amount = fixD(data.amount, this.acriveSymbol.mCionFix);
        }
      });
    },
    pagechange(v) {
      this.pagination.page = v;
      this.getData();
    },
    linkMore(link) {
      window.open(link);
    },

  },
};
