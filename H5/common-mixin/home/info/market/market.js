import { myStorage, getCoinShowName } from '@/utils';

export default {
  name: 'homes',
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
      marketDataObj: [],
      marketDataList: [],
      marketDataList_bar: [],
      marketCurrent: null,
      MainAreaFilter: [], // 主区币种
      CreateAreaFilter: [], // 创新区币种
      SeeAreaFilter: [], // 观察区币种
      MainAreaData: [],
      CreateAreaData: [],
      SeeAreaData: [],
      sortValue: 'sort', // 排序类型
      sortSell: false, // 排序方向 true-正序 false-倒序
      hoverIndex: null,
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
    coinTagLangs() {
      return this.$store.state.baseData.coinTagLangs;
    },
    coinTagOpen() {
      return this.$store.state.baseData.coin_tag_open;
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

      arr.forEach((el) => {
        const item = el;
        const data = el.data.filter((e) => e.isShow || this.listfilter || this.marketCurrent === 'myMarket');
        if (data.length) {
          item.data = data;
          result.push(item);
        }
      });
      return result;
    },
    // 表头
    columns() {
      return [
        {
          title: this.$t('home.market'), // 市场
          key: 'sort',
          sortable: true,
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
        // {
        //   title: this.$t('home.height'), // 最高价
        // },
        // {
        //   title: this.$t('home.low'), // 最低价
        // },
        // {
        //   title: this.$t('home.H_volume'), // 24H成交量
        // },
        // {
        //   title: this.$t('home.H_turnover'), // 24小时成交额
        // },
      ];
    },
    // 全部市场
    marketAllList() {
      if (this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.marketSort;
      }
      return [];
    },
    // market
    market() {
      if (this.$store.state.baseData.market) {
        const newMarket = {};
        const obj = this.$store.state.baseData.market;
        if (obj.home_symbol_show) {
          if (obj.home_symbol_show.observed_symbol_list) {
            const arr = Object.keys(obj.home_symbol_show.observed_symbol_list);
            arr.forEach((item) => {
              newMarket[item] = {};
              obj.home_symbol_show.observed_symbol_list[item].forEach((key) => {
                if (Object.keys(obj.market[item]).indexOf(key) > -1) {
                  newMarket[item][key] = obj.market[item][key];
                }
              });
            });
          } else {
            Object.keys(obj.market).forEach((item) => {
              newMarket[item] = {};
              const len = Object.keys(obj.market[item]).length;
              if (len > 20) {
                for (let i = 0; i < 20; i += 1) {
                  const citem = Object.keys(obj.market[item])[i];
                  newMarket[item][citem] = obj.market[item][citem];
                }
              } else {
                for (let i = 0; i < len; i += 1) {
                  const citem = Object.keys(obj.market[item])[i];
                  newMarket[item][citem] = obj.market[item][citem];
                }
              }
            });
          }
        } else {
          Object.keys(obj.market).forEach((item) => {
            newMarket[item] = {};
            const len = Object.keys(obj.market[item]).length;
            if (len > 20) {
              for (let i = 0; i < 20; i += 1) {
                const citem = Object.keys(obj.market[item])[i];
                newMarket[item][citem] = obj.market[item][citem];
              }
            } else {
              for (let i = 0; i < len; i += 1) {
                const citem = Object.keys(obj.market[item])[i];
                newMarket[item][citem] = obj.market[item][citem];
              }
            }
          });
        }
        return newMarket;
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
        data = this.marketDataList_bar.filter((item) => item.id.match(reg));
      }
      this.setData(data);
    },
    dataList(val) {
      this.tableLoading = false;
      this.marketDataList_bar = val;
      let data = val;
      if (this.listfilter) {
        const reg = new RegExp(this.listfilter, 'gim');
        data = this.marketDataList_bar.filter((item) => item.id.match(reg));
      }
      this.setData(data);
    },
  },
  methods: {
    getCoinLabel(symbol) {
      const coin = symbol.split('/')[0];
      if (this.coinTagOpen
          && this.coinList && this.coinList[coin.toUpperCase()]) {
        const { coinTag = '' } = this.coinList[coin.toUpperCase()];
        return coinTag ? this.coinTagLangs[coinTag] : '';
      }
      return '';
    },
    init() {
      this.marketCurrent = myStorage.get('homeMarkTitle');
      if (Object.keys(this.market).length) {
        this.filterArea();
      }
    },
    lowBDD(v) {
      if (v.indexOf('<span>') !== -1) {
        const str = v.split('<span>')[1];
        const newStr = str.split('</span>')[0];
        return this.getShowSymbol(newStr);
      }
      return v;
    },
    getShowSymbol(v) {
      let str = '';
      const showNameSymbols = this.$store.state.baseData.symbolAll;
      if (showNameSymbols) {
        str = getCoinShowName(v, showNameSymbols);
      }
      return str;
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
    setData(val) {
      const MainArea = []; // 主区
      const CreateArea = []; // 创新区
      const SeeArea = []; // 观察区
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
      });

      this.MainAreaData = MainArea;
      this.CreateAreaData = CreateArea;
      this.SeeAreaData = SeeArea;
    },
    filterArea() {
      const MainAreaFilter = []; // 主区币种
      const CreateAreaFilter = []; // 创新区币种
      const SeeAreaFilter = []; // 观察区币种
      Object.keys(this.market).forEach((item) => {
        Object.keys(this.market[item]).forEach((citem) => {
          // 创新区
          if (this.market[item][citem].newcoinFlag === 1) {
            CreateAreaFilter.push(citem);
          // 观察区
          } else if (this.market[item][citem].newcoinFlag === 2) {
            SeeAreaFilter.push(citem);
          } else {
            MainAreaFilter.push(citem);
          }
        });
      });
      this.MainAreaFilter = MainAreaFilter;
      this.CreateAreaFilter = CreateAreaFilter;
      this.SeeAreaFilter = SeeAreaFilter;
    },
    marketClick(symbol) {
      this.$bus.$emit('SWITCH-STORE', symbol);
    },
    // 切换市场
    switchMarket(data) {
      if (this.tableLoading) return;
      this.listfilter = null;
      this.marketCurrent = data;
      this.tableLoading = true;
      if (data !== 'myMarket') {
        myStorage.set('homeMarkTitle', data);
      }
      this.$bus.$emit('SWITCH-MARKET', data);
    },
    bandLink(data) {
      myStorage.set('sSymbolName', data);
      myStorage.set('markTitle', data.split('/')[1]);
      this.$router.push('/trade');
    },
  },
};
