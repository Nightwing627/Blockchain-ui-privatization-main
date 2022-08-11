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
    // 当前币对列表
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
    // H5 底部导航
    navList() {
      const arr = [
        // 交易
        {
          navText: this.$t('h5Add.tradeList1'),
          id: '1',
          classes: 'cc',
        },
        // K线
        {
          navText: this.$t('h5Add.tradeList2'),
          id: '2',
        },
        // 盘口
        {
          navText: this.$t('h5Add.tradeList6'),
          id: '3',
        },
        // 成交
        {
          navText: this.$t('h5Add.tradeList4'),
          id: '4',
        },
      ];
      // 委托
      if (this.isLogin) {
        arr.push({
          navText: this.$t('h5Add.tradeList5'),
          id: '5',
        });
      }
      return arr;
    },
  },
};
