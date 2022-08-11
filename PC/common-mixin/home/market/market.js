import { myStorage } from '@/utils';

export default {
  name: 'Market',
  data() {
    return {
      // 滚动条配置
      ops: {
        rail: {
          gutterOfSide: '0px',
        },
      },
      // 筛选 货币对
      listfilter: null,
      // 表格加载LOADING
      tableLoading: true,
      // 表格 超过 20条出现滚动条
      lineNumber: 15,
      // 表头 Class
      headClasses: 'c-3-bg',
      bodyClasses: 'c-4-bg',
      klineDataList: {},
      marketDataObj: [],
      marketDataList: [],
      marketDataList_bar: [],
      marketCurrent: null,
      MainAreaFilter: [], // 主区币种
      CreateAreaFilter: [], // 创新区币种
      SeeAreaFilter: [], // 观察区币种
      hideAreaFilter: [], // 隐藏区币种,
      unsealAreaFilter: [], // 解封区币种
      halveAreaFilter: [], // 减半区币种
      MainAreaData: [],
      hideAreaData: [],
      CreateAreaData: [],
      SeeAreaData: [],
      unsealAreaData: [],
      halveAreaData: [],
      sortValue: 'sort', // 排序类型
      sortSell: false, // 排序方向 true-正序 false-倒序
      hoverIndex: null,
      coAreaData: [],
      coTypeList: [],
      usdtHeaderFlag: false,
      usdHeaderFlag: false,
    };
  },
  props: {
    dataList: {
      type: Array,
      default: () => [],
    },
  },
  filters: {
    sortIcon(v, sortValue, sortSell) {
      let str = '#icon-a_17';
      if (v === sortValue) {
        if (sortSell) {
          str = '#icon-a_17_1';
        } else {
          str = '#icon-a_17_2';
        }
      }
      return str;
    },
  },
  computed: {
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    isCoOpen() {
      const base = this.$store.state.baseData.publicInfo;
      if (base && base.switch && base.switch.indep_co_switch === '1') {
        return true;
      }
      return false;
    },
    index_international_open() {
      return this.$store.state.baseData.index_international_open;
    },
    dataLength() {
      let len = 0;
      this.tableData.forEach((item) => {
        if (this.tableData.length > 1) {
          len += 1;
        }
        item.data.forEach(() => {
          len += 1;
        });
      });
      return len;
    },
    tableHeight() {
      let h = 300;
      const spk = 30; // 条数
      if (this.dataLength > 5 && this.dataLength < spk) {
        h = 56 * this.dataLength;
      } else if (this.dataLength >= spk) {
        h = 56 * spk;
      }
      return h;
    },
    tableData() {
      const arr = [];
      const result = [];
      const coResult = [];
      const coArr = [];
      if (this.halveAreaData.length) {
        const data = this.dataSort(this.halveAreaData);
        arr.push({
          title: this.$t('trade.halving'),
          titleIndex: 0,
          data,
        });
      }
      if (this.MainAreaData.length) {
        const data = this.dataSort(this.MainAreaData);
        arr.push({
          title: this.$t('trade.maincon'),
          data,
        });
      }
      if (this.CreateAreaData.length) {
        const data = this.dataSort(this.CreateAreaData);
        arr.push({
          title: this.$t('trade.newcon'),
          data,
        });
      }
      if (this.SeeAreaData.length) {
        const data = this.dataSort(this.SeeAreaData);
        arr.push({
          title: this.$t('trade.seecon'),
          data,
        });
      }
      if (this.unsealAreaData.length) {
        const data = this.dataSort(this.unsealAreaData);
        arr.push({
          title: this.$t('trade.unseal'),
          data,
        });
      }
      if (this.coAreaData.length) {
        const data = this.dataSort(this.coAreaData);
        coArr.push({
          title: this.$t('trade.unseal'),
          data,
        });
        coArr.forEach((el) => {
          const item = el;
          const datas = el.data.filter((e) => e.isShow || this.listfilter || this.marketCurrent === 'USDT');
          if (datas.length) {
            item.data = datas;
            const newItem = item;
            coResult.push(newItem);
          }
        });
      }
      arr.forEach((el) => {
        const item = el;
        const data = el.data.filter((e) => e.isShow || this.listfilter || this.marketCurrent === 'myMarket');

        if (data.length) {
          item.data = data;
          const newItem = item;
          item.data.forEach((citem, index) => {
            newItem.data[index].etfOpen = this.symbolAll[citem.id].etfOpen;
            // citem.etfOpen
          });
          result.push(newItem);
        }
      });
      if (this.isCoOpen) {
        return coResult;
      }
      return result;
    },
    // 表头
    columns() {
      return [
        {
          title: this.$t('home.market'), // 市场
          key: 'sort',
          sortable: !this.isCoOpen,
        },
        {
          title: this.$t('home.close'), // 最新价
          key: 'closes',
          sortable: true,
        },
        {
          title: this.$t('home.applies'), // 涨跌幅
          key: 'roses',
          sortable: true,
        },
        {
          title: this.$t('home.height'), // 最高价
        },
        {
          title: this.$t('home.low'), // 最低价
        },
        {
          title: this.isCoOpen ? `${this.$t('home.H_volume')}(${this.$t('common.zhang')})` : this.$t('home.H_volume'), // 24H成交量
        },
        {
          title: this.isCoOpen ? `${this.$t('home.H_coNumber')}(${this.$t('common.zhang')})` : this.$t('home.H_turnover'), // 持仓量
        },
      ];
    },
    // 全部市场
    marketAllList() {
      if (this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.marketSort;
      }
      return [];
    },
    // 全部市场
    coMmarketAllList() {
      const data = [];
      if (this.usdtHeaderFlag) {
        data.push(1);
      }
      if (this.usdHeaderFlag) {
        data.push(2);
      }
      const arr = [];
      if (data && data.length) {
        data.forEach((ele) => {
          const obj = {};
          if (Number(ele) === 1) {
            obj.type = 'USDT';
            obj.name = this.$t('home.tab_USDT');
          }
          if (Number(ele) === 2) {
            obj.type = 'USD';
            obj.name = this.$t('home.tab_USD');
          }
          arr.push(obj);
        });
        myStorage.set('homeMarkTitle', arr[0].type);
      }
      return arr;
    },
    // market
    market() {
      if (this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.market;
      }
      return {};
    },
    // 全部币对列表
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },
    // 全部币种列表
    coinList() {
      if (this.$store.state.baseData && this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return null;
    },
  },
  watch: {
    market(v) {
      if (Object.keys(v).length) {
        this.filterArea();
      }
    },
    listfilter(val) {
      let data = this.marketDataList_bar;
      if (val) {
        const reg = new RegExp(val, 'gim');
        data = this.marketDataList_bar.filter((item) => item.showName.match(reg));
      }
      this.setData(data, true);
    },
    dataList(val) {
      this.tableLoading = false;
      this.marketDataList_bar = val;
      let data = val;
      if (this.listfilter) {
        const reg = new RegExp(this.listfilter, 'gim');
        data = this.marketDataList_bar.filter((item) => item.showName.match(reg));
      }
      this.setData(data);
    },
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    init() {
      this.marketCurrent = myStorage.get('homeMarkTitle');
      if (Object.keys(this.market).length) {
        this.filterArea();
      }
      // 监听交易区
      this.$bus.$on('COMARGET_SWITCH', (data) => {
        if (data === 'USDT') {
          this.usdtHeaderFlag = true;
        }
        if (data === 'USD') {
          this.usdHeaderFlag = true;
        }
      });
    },
    enter(index) {
      this.hoverIndex = index;
    },
    leave() {
      this.hoverIndex = null;
    },
    lineClassesH(index) {
      if (index === this.hoverIndex) {
        return 'c-3-bg';
      }
      return 'c-4-bg';
    },
    dataSort(v) {
      if (this.sortValue.length) {
        return v.sort((a, b) => {
          let first = a;
          let end = b;
          if (this.sortSell) {
            first = b;
            end = a;
          }
          switch (this.sortValue) {
            case 'roses':
              return (parseFloat(first.data[2][0].sortVal) || 0)
                - (parseFloat(end.data[2][0].sortVal) || 0);
            case 'closes':
              return (parseFloat(first.data[1][0].sortVal) || 0)
                - (parseFloat(end.data[1][0].sortVal) || 0);
            default:
              return (parseFloat(first.data[0][1].sortVal) || 0)
                - (parseFloat(end.data[0][1].sortVal) || 0);
          }
        });
      }
      return v;
    },
    sort(v) {
      if (this.tableLoading) return;
      if (!v.sortable) return;
      if (this.sortValue !== v.key) {
        this.sortValue = v.key;
        this.sortSell = true;
      } else {
        this.sortSell = !this.sortSell;
      }
    },
    setData(val, isSearch = false) {
      if (!this.isCoOpen) {
        const MainArea = []; // 主区
        const CreateArea = []; // 创新区
        const SeeArea = []; // 观察区
        const hideArea = []; // 隐藏区
        const unsealArea = []; // 解封区
        const halveArea = []; // 减半区
        val.forEach((item) => {
          if (this.MainAreaFilter.indexOf(item.id) !== -1) {
            MainArea.push(item);
          }
          if (this.CreateAreaFilter.indexOf(item.id) !== -1) {
            CreateArea.push(item);
          }
          if (this.SeeAreaFilter.indexOf(item.id) !== -1) {
            SeeArea.push(item);
          }
          if (this.hideAreaFilter.indexOf(item.id) !== -1) {
            hideArea.push(item);
          }
          if (this.unsealAreaFilter.indexOf(item.id) !== -1 && !isSearch) {
            unsealArea.push(item);
          }
          if (this.halveAreaFilter.indexOf(item.id) !== -1) {
            halveArea.push(item);
          }
        });
        this.MainAreaData = MainArea;
        this.CreateAreaData = CreateArea;
        this.SeeAreaData = SeeArea;
        this.hideAreaData = hideArea;
        this.unsealAreaData = unsealArea;
        this.halveAreaData = halveArea;
      } else {
        this.coAreaData = [...val];
      }
    },
    filterArea() {
      const MainAreaFilter = []; // 主区币种
      const CreateAreaFilter = []; // 创新区币种
      const SeeAreaFilter = []; // 观察区币种
      const hideAreaFilter = []; // 隐藏区币种
      const unsealAreaFilter = []; // 解封区币种
      const halveAreaFilter = []; // 减半区币种
      Object.keys(this.market).forEach((item) => {
        Object.keys(this.market[item]).forEach((citem) => {
          const { newcoinFlag, name } = this.market[item][citem];
          // 解封区
          if (this.coinList[name.split('/')[0]]
              && this.coinList[name.split('/')[0]].isOvercharge
              && this.coinList[name.split('/')[0]].isOvercharge.toString() === '1') {
            unsealAreaFilter.push(citem);
          } else if (newcoinFlag === 1) {
            // 创新区
            CreateAreaFilter.push(citem);
            // 观察区
          } else if (newcoinFlag === 2) {
            SeeAreaFilter.push(citem);
          } else if (newcoinFlag === 0) {
            MainAreaFilter.push(citem);
          } else if (newcoinFlag === 3) {
            halveAreaFilter.push(citem);
          }
        });
      });
      this.MainAreaFilter = MainAreaFilter;
      this.CreateAreaFilter = CreateAreaFilter;
      this.SeeAreaFilter = SeeAreaFilter;
      this.hideAreaFilter = hideAreaFilter;
      this.unsealAreaFilter = unsealAreaFilter;
      this.halveAreaFilter = halveAreaFilter;
    },
    marketClick(symbol) {
      this.$bus.$emit('SWITCH-STORE', symbol);
    },
    // 切换市场
    switchMarket(data) {
      if (this.tableLoading) return;
      this.listfilter = null;
      this.marketCurrent = this.isCoOpen ? data.type : data;
      this.tableLoading = true;
      if (data !== 'myMarket' && !this.isCoOpen) {
        myStorage.set('homeMarkTitle', data);
      }
      if (this.isCoOpen) {
        myStorage.set('homeMarkTitle', data.type);
      }
      this.$bus.$emit('SWITCH-MARKET', data);
    },
    bandLink(data, etfOpen) {
      if (this.isCoOpen) {
        const coUrl = this.linkurl.coUrl ? `${this.linkurl.coUrl}/trade/${data}` : '';
        window.location.href = coUrl;
        return;
      }
      myStorage.set('sSymbolName', data);
      if (etfOpen) {
        myStorage.set('markTitle', 'ETF');
      } else {
        myStorage.set('markTitle', data.split('/')[1]);
      }
      this.$router.push('/trade');
      // this.$router.push(`/trade/${data.replace('/', '_')}`);
    },
  },
};
