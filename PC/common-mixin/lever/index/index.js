import { myStorage } from '@/utils';

export default {
  data() {
    return {
      markTitleClass: 'leverMarkTitle',
      symbolNameClass: 'leverSymbolName',
      routerPathClass: 'margin',
    };
  },
  computed: {
    symbolAll() {
      if (this.$store.state.baseData.symbolAll) {
        const { symbolAll } = this.$store.state.baseData;
        const symbolAllKey = Object.keys(symbolAll);
        const symbolAllArr = {};
        symbolAllKey.forEach((item) => {
          if (symbolAll[item].is_open_lever) {
            symbolAllArr[item] = symbolAll[item];
          }
        });
        return symbolAllArr;
      }
      return {};
    },
    symbolList() {
      // 如果 当前市场 是 自选市场
      if (this.marketCurrent === 'myMarket') {
        const mySymbol = myStorage.get('mySymbol') || [];
        const marketList = {};
        if (mySymbol.length) {
          mySymbol.forEach((item) => {
            if (item && this.symbolAll[item] && this.symbolAll[item].is_open_lever) {
              marketList[item] = this.symbolAll[item];
            }
          });
        }
        return marketList;
      }
      if (this.marketList && this.marketCurrent) {
        const symbolArr = this.marketList[this.marketCurrent];
        const symbolKeyArr = Object.keys(symbolArr);
        const newSymbolList = {};
        if (symbolKeyArr.length) {
          symbolKeyArr.forEach((item) => {
            if (symbolArr[item].is_open_lever) {
              newSymbolList[item] = symbolArr[item];
            }
          });
        }
        return newSymbolList;
      }
      return null;
    },
  },
  methods: {
    leverInit() {
      if (this.routeSymbol) {
        myStorage.set(this.markTitleClass, this.routeSymbol.split('_')[1]);
        myStorage.set(this.symbolNameClass, this.routeSymbol.replace('_', '/'));
      } else {
        const sSymbolName = myStorage.get(this.symbolNameClass);
        if (sSymbolName) {
          const sSymbol = sSymbolName.replace('/', '_');
          this.$router.push(`/${this.routerPathClass}/${sSymbol}`);
        }
      }
    },
    leverMounted() {
      this.screenWidth = document.body.clientWidth;
      if (this.screenWidth <= this.mediaWidth) {
        this.shrink = true;
        this.marketShrink = true;
      }
      // 监听 窗口的大小改变
      this.$bus.$on('WINFOW_ON_RESIIZE', () => {
        // this.$bus.$emit('WINFOW_ON_RESIIZE', );
        if (this.windowOnResizeFire) {
          this.screenWidth = document.body.clientWidth;
          if (this.screenWidth <= this.mediaWidth) {
            // 如果 屏幕窗口 小于阈值 设置成收起模式
            this.shrink = true;
            this.marketShrink = true;
          } else {
            // 如果 屏幕窗口 大于阈值 设置成展开模式
            this.shrink = false;
            this.marketShrink = false;
          }
          this.windowOnResizeFire = false;
          // 0.3秒之后将标志位重置
          setTimeout(() => {
            this.windowOnResizeFire = true;
          });
        }
      });
    },
  },
};
