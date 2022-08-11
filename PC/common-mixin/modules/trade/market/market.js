import { getCoinShowName, myStorage } from '@/utils';

export default {
  name: 'market',
  data() {
    return {
      marketDataList: [],
      dataList: [],
      dataList_bar: [],
      symbolList: [],
      // 当前选中的市场
      marketCurrent: myStorage.get('markTitle'),
      // 获取当前币对
      symbolCurrent: myStorage.get('sSymbolName'),
      // 排序
      sortName: null,
      sortType: null,
      // 筛选
      listfilterVal: null,
      // 自选币对
      mySymbolList: myStorage.get('mySymbol') || [],
      setMyMarketSwitch: true,
      // 市场横向滚动参数
      slidePosition: 0,
      maxPosition: 0,
      // 是否有主区
      maincoinFlag: false,
      // 是否有创新区
      newcoinFlag: false,
      // 是否有观察区
      seecoinFlag: false,
      // 是否有解封区
      unsealcoinFlag: false,
      // 是否有减半区
      halvecoinFlag: false,
      // 在自选币对已经取消的
      cancelStoreSymbol: [],
    };
  },
  props: {
    moduleType: {
      type: String,
      default: 'ex',
    },
  },
  computed: {
    marketClass() {
      if (this.moduleType === 'lever') {
        return 'lever-market';
      }
      return '';
    },
    marketList() {
      if (this.$store.state.baseData.market) {
        if (this.moduleType === 'ex') {
          return this.$store.state.baseData.market.marketSort;
        }
        if (this.moduleType === 'lever') {
          const keysArr = this.$store.state.baseData.market.marketSort;
          const marketDataObj = this.$store.state.baseData.market.market;
          const newSort = [];
          if (keysArr && marketDataObj) {
            keysArr.forEach((item) => {
              const syArrkeyArr = Object.keys(marketDataObj[item]);
              if (syArrkeyArr.length) {
                syArrkeyArr.forEach((symbolName) => {
                  if (marketDataObj[item][symbolName].is_open_lever && newSort.indexOf(item) < 0) {
                    newSort.push(item);
                  }
                });
              }
            });
          }
          return newSort;
        }
      }
      return [];
    },
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    optionalSymbolServerOpen() {
      return this.$store.state.baseData.optional_symbol_server_open;
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
    marketList() {
      this.$nextTick(() => {
        this.maxPosition = this.$refs.marketUl.offsetWidth - this.$refs.marketBar.offsetWidth;
      });
    },
    // 搜索
    listfilterVal(val) {
      this.setData();
      if (val) {
        const reg = new RegExp(val, 'gim');
        this.dataList = this.dataList_bar.filter((item) => {
          if (item.showSymbol) {
            return item.showSymbol.symbol.match(reg);
          }
          return item.symbol.symbol.match(reg);
        });
      } else {
        this.dataList = this.dataList_bar;
      }
    },
    isLogin(val) {
      if (val) {
        this.mySymbolList = myStorage.get('mySymbol') || [];
      }
    },
  },
  methods: {
    init() {
      if (this.moduleType === 'lever') {
        this.marketCurrent = myStorage.get('leverMarkTitle');
        this.symbolCurrent = myStorage.get('leverSymbolName');
      }
      this.$bus.$on('extend', () => {
        this.shrinkBlock();
      });
      setTimeout(() => {
        if (this.$refs.marketUl && this.$refs.marketBar) {
          this.maxPosition = this.$refs.marketUl.offsetWidth - this.$refs.marketBar.offsetWidth;
        }
        this.$nextTick(() => {
          const step = this.marketList.indexOf(this.marketCurrent);
          if (step > 3) {
            this.slideMarket('right', step - 3);
          }
        });
      }, 0);
      this.$bus.$on('SYMBOL_LIST', (data) => {
        if (data) {
          this.symbolList = data;
          this.maincoinFlag = false;
          this.newcoinFlag = false;
          this.seecoinFlag = false;
          this.unsealcoinFlag = false;
          this.halvecoinFlag = false;
          this.sortName = null;
          this.sortType = null;
          // this.listfilterVal = '';
          this.setData();
        }
      });
      // 接收24小时行情数据
      this.$bus.$on('MARKET_DATA', (data) => {
        this.marketDataList = data;
        this.setData();
      });
    },
    symbolTitle(data) {
      return [`${getCoinShowName(data.symbol, this.coinList)}/${getCoinShowName(data.unit, this.coinList)}`];
    },
    countSymbolItemState(item, v) {
      const i = item.newcoinFlag === v;
      const state = v === 0 ? !item.newcoinFlag || i : i;
      return state;
    },
    unsealCountSymbolItemState(item) {
      const { symbol } = item.symbol;
      let state = false;
      if (this.coinList[symbol]
        && this.coinList[symbol].isOvercharge
        && this.coinList[symbol].isOvercharge.toString() === '1') {
        state = true;
      }
      return state;
    },
    setData() {
      const dataList = [];
      const keyarr = Object.keys(this.symbolList);
      this.maincoinFlag = false;
      this.newcoinFlag = false;
      this.seecoinFlag = false;
      this.unsealcoinFlag = false;
      this.halvecoinFlag = false;
      keyarr.forEach((item) => {
        const { isShow, newcoinFlag } = this.symbolList[item];

        if (this.marketDataList[item]) {
          if (isShow || this.listfilterVal || this.marketCurrent === 'myMarket') {
            const { symbol } = this.marketDataList[item].symbol;
            // 解封区
            if (this.coinList[symbol]
                && this.coinList[symbol].isOvercharge
                && this.coinList[symbol].isOvercharge.toString() === '1') {
              this.unsealcoinFlag = true;
            }
            if (newcoinFlag === 0) {
              this.maincoinFlag = true;
            }
            if (newcoinFlag === 1) {
              this.newcoinFlag = true;
            }
            if (newcoinFlag === 2) {
              this.seecoinFlag = true;
            }
            if (newcoinFlag === 3 && this.coinList[symbol]
              && !this.coinList[symbol].isOvercharge) {
              this.halvecoinFlag = true;
            }
            this.marketDataList[item].isShow = isShow;
            dataList.push(this.marketDataList[item]);
          }
        }
      });
      if (this.sortType === 'down') {
        dataList.sort((a, b) => parseFloat(b[this.sortName]) - parseFloat(a[this.sortName]));
      }
      if (this.sortType === 'up') {
        dataList.sort((a, b) => parseFloat(a[this.sortName]) - parseFloat(b[this.sortName]));
      }
      if (!this.sortType) {
        dataList.sort((a, b) => a.sort - b.sort);
      }
      if (this.listfilterVal) {
        const reg = new RegExp(this.listfilterVal, 'gim');
        this.dataList = this.dataList_bar.filter((item) => {
          if (item.showSymbol) {
            return item.showSymbol.symbol.match(reg);
          }
          return item.symbol.symbol.match(reg);
        });
      } else {
        this.dataList = dataList;
      }
      this.dataList_bar = dataList;
    },
    shrinkBlock() {
      this.$emit('shrinkBlock');
      this.$bus.$emit('shrinkBlock');
      this.$nextTick(() => {
        if (this.$refs.marketUl && this.$refs.marketBar) {
          this.maxPosition = this.$refs.marketUl.offsetWidth - this.$refs.marketBar.offsetWidth;
        }
      });
    },
    serachShrinkBlock() {
      // this.$refs.serachInp.focus();
      this.$emit('serachShrinkBlock');
      this.$refs.tradeFind.focusFn();
    },
    inputchanges(v) {
      this.listfilterVal = v;
    },
    // 切换市场
    switchMarket(data) {
      this.cancelStoreSymbol = [];
      this.marketCurrent = data;
      this.$bus.$emit('ON_MARKET_SWITCH', data);
    },
    // 切换币对
    switchSymbol(data) {
      // 判断 tradingview 已经初始化完成
      // if (window.tvWidget) {
      this.symbolCurrent = data;
      this.$bus.$emit('ON_SYMBOL_SWITCH', data);
      // }
    },
    // 币对排序
    sorteEvent(key) {
      this.$nextTick(() => {
        if (!this.sortName) {
          this.sortName = key;
          this.sortType = 'down';
          this.setData();
        } else if (this.sortType === 'down') {
          this.sortName = key;
          this.sortType = 'up';
          this.setData();
        } else if (this.sortType === 'up') {
          this.sortName = null;
          this.sortType = null;
          this.setData();
        }
        this.dataList_bar = this.dataList;
      });
    },
    // 设置 自选币对
    setMyMarket(symbol) {
      let url = this.$store.state.url.common.optional_symbol;
      if (this.optionalSymbolServerOpen === 1) {
        url = this.$store.state.url.common.optional_symbols;
      }
      // 防止重复点击
      if (!this.setMyMarketSwitch) return;
      this.setMyMarketSwitch = false;

      if (this.marketCurrent === 'myMarket') {
        this.cancelStoreSymbol.push(symbol);
      } else {
        this.cancelStoreSymbol = [];
      }
      let mySymbol = myStorage.get('mySymbol') || [];
      let addOrDelete = true;
      if (mySymbol.length && mySymbol.indexOf(symbol) > -1) {
        mySymbol = mySymbol.filter((item) => item !== symbol);
        addOrDelete = false;
      } else {
        mySymbol.push(symbol);
        addOrDelete = true;
      }
      if (this.optionalSymbolServerOpen === 1 && this.isLogin) {
        this.axios({
          url,
          headers: {},
          params: {
            operationType: addOrDelete === true ? '1' : '2', // 0批量添加 1单个添加 2单个删除
            symbols: symbol,
          },
          method: 'post',
        }).then((data) => {
          if (data.code === '0') {
            this.setMyMarketSwitch = true;
            this.mySymbolList = mySymbol;
            myStorage.set('mySymbol', mySymbol);
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      } else {
        this.setMyMarketSwitch = true;
        this.mySymbolList = mySymbol;
        myStorage.set('mySymbol', mySymbol);
      }
    },
    slideMarket(type, step = 1) {
      let position = parseFloat(this.slidePosition);
      const width = (this.$refs.marketBar.offsetWidth * step) / 2;
      if (type === 'left') {
        position += width;
        if (position > 0) {
          position = 0;
        }
      } else {
        position -= width;
        if (position < -this.maxPosition) {
          position = -this.maxPosition;
        }
      }
      this.slidePosition = `${position}px`;
    },
  },
};
