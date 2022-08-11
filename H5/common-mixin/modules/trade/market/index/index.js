// myStorage
import { getCoinShowName, myStorage } from '@/utils';

export default {
  name: 'market',
  components: {
  },
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
      // 市场横向滚动参数
      slidePosition: 0,
      maxPosition: 0,
      // 是否有主区
      maincoinFlag: false,
      // 是否有创新区
      newcoinFlag: false,
      // 是否有观察区
      seecoinFlag: false,
      // 是否有减半区
      halvingFlag: false,
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
  },
  watch: {
    listfilterVal(val) {
      if (val) {
        const reg = new RegExp(val, 'gim');
        this.dataList = this.dataList_bar.filter(
          (item) => this.getShowName(item.symbol.symbol).match(reg),
        );
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
      this.$bus.$on('SYMBOL_LIST', (data) => {
        if (data) {
          this.symbolList = data;
          this.maincoinFlag = false;
          this.newcoinFlag = false;
          this.seecoinFlag = false;
          this.halvingFlag = false;
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
      // 市场 个数的超出宽度
      this.maxPosition = this.$refs.marketUl.offsetWidth - this.$refs.marketBar.offsetWidth;
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
    setData() {
      const dataList = [];
      const keyarr = Object.keys(this.symbolList);
      this.maincoinFlag = false;
      this.newcoinFlag = false;
      this.seecoinFlag = false;
      this.unsealcoinFlag = false;
      this.halvingFlag = false;
      keyarr.forEach((item) => {
        const { isShow, newcoinFlag } = this.symbolList[item];

        if (this.marketDataList[item]) {
          if (isShow || this.listfilterVal || this.marketCurrent === 'myMarket') {
            if (newcoinFlag === 0) {
              this.maincoinFlag = true;
            }
            if (newcoinFlag === 1) {
              this.newcoinFlag = true;
            }
            if (newcoinFlag === 2) {
              this.seecoinFlag = true;
            }
            if (newcoinFlag === 3) {
              this.halvingFlag = true;
            }
            this.marketDataList[item].isShow = isShow;
            this.marketDataList[item].multiple = this.symbolList[item].multiple;
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
        this.dataList = this.dataList_bar.filter(
          (item) => this.getShowName(item.symbol.symbol).match(reg),
        );
      } else {
        this.dataList = dataList;
      }
      this.dataList_bar = dataList;
    },
    shrinkBlock() {
      this.$emit('shrinkBlock');
    },
    serachShrinkBlock() {
      this.$refs.serachInp.focus();
      this.$emit('serachShrinkBlock');
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
      if (window.tvWidget) {
        this.symbolCurrent = data;
        this.$bus.$emit('ON_SYMBOL_SWITCH', data);
      }
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
      if (this.marketCurrent === 'myMarket') {
        this.cancelStoreSymbol.push(symbol);
      } else {
        this.cancelStoreSymbol = [];
      }
      let mySymbol = myStorage.get('mySymbol') || [];
      if (mySymbol.length && mySymbol.indexOf(symbol) > -1) {
        mySymbol = mySymbol.filter((item) => item !== symbol);
      } else {
        mySymbol.push(symbol);
      }
      this.mySymbolList = mySymbol;
      this.setData();
      myStorage.set('mySymbol', mySymbol);
      if (this.isLogin) {
        this.axios({
          url: this.$store.state.url.common.optional_symbol,
          headers: {},
          params: { optional_symbol: this.mySymbolList },
          method: 'post',
        }).then((data) => {
          if (data.code !== '0') {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            this.setData();
          }
        });
      }
    },
    slideMarket(type) {
      let position = parseFloat(this.slidePosition);
      if (type === 'left') {
        position += this.$refs.marketBar.offsetWidth / 2;
        if (position > 0) {
          position = 0;
        }
      } else {
        position -= this.$refs.marketBar.offsetWidth / 2;
        if (position < -this.maxPosition) {
          position = -this.maxPosition;
        }
      }
      this.slidePosition = `${position}px`;
    },
  },
};
