import { mapState } from 'vuex';
import { diff, myStorage } from '@/utils';

export default {
  name: 'market',
  components: {},
  data() {
    return {
      // 币对列表
      marketData: null,
      // 当前市场
      marketCurrent: null,
      // 当前币对
      symbolCurrent: null,
      // 行情数据
      marketDataList: {},
    };
  },
  computed: {
    ...mapState({
      baseInfo({ baseData }) {
        if (baseData.coPublicInfo) {
          this.marketData = baseData.coPublicInfo.market;
          // 获取当前币对
          this.symbolCurrent = myStorage.get('coNowSymbol');
          // 获取当前市场
          this.marketCurrent = myStorage.get('coMarkTitle');
          return baseData.coPublicInfo;
        }
        return null;
      },
    }),
    marketListWidth() {
      return `width:${this.marketList.length * 91}px;`;
    },
    marketList() {
      if (this.marketData) {
        const keyList = Object.keys(this.marketData);
        const marketList = [];
        keyList.forEach((item) => {
          let [...marketData] = this.marketData[item];
          marketData = marketData.sort((a, b) => a.contractType - b.contractType);
          const { symbol } = marketData[0];
          marketList.push({
            name: item,
            WsData: this.marketDataList[symbol] ? this.marketDataList[symbol] : {
              closes: '--',
              roses: '--',
              rose: {
                class: '--',
              },
            },
          });
        });
        return marketList;
      }
      return [];
    },
    currentSymbolList() {
      if (this.marketData && this.symbolCurrent) {
        if (this.marketDataList) {
          const MarketList = this.marketData[this.marketCurrent];
          const arr = [];
          if (MarketList.length) {
            MarketList.forEach((item) => {
              const { ...obj } = item;
              obj.WsData = this.marketDataList[item.symbol] ? this.marketDataList[item.symbol] : {
                closes: '--',
                roses: '--',
                rose: {
                  class: '--',
                },
              };
              obj.typeName = this.setTypeName(item);
              arr.push(obj);
            });
          }
          return arr.sort((a, b) => a.sort - b.sort);
        }
        return this.marketData[this.marketCurrent];
      }
      return [];
    },
    currentSymbolData() {
      let symbolCurrent = {};
      if (this.currentSymbolList.length) {
        this.currentSymbolList.forEach((item) => {
          if (item.symbol === this.symbolCurrent) {
            symbolCurrent = item;
          }
        });
      }
      return symbolCurrent;
    },
    datedifference() {
      if (this.currentSymbolData && this.currentSymbolData.contractType > 0) {
        return diff(this.currentSymbolData.settleTime);
      }
      return '';
    },
  },
  watch: {
    symbolCurrent(val) {
      if (val) {
        this.currentSymbolList.forEach((item) => {
          if (item.symbol === this.symbolCurrent) {
            this.$bus.$emit(
              'PAGE-TOP-TITLE',
              `${item.baseSymbol}${item.quoteSymbol} ${item.typeName} ${item.WsData.closes}`,
            );
          }
        });
      }
    },
  },
  methods: {
    init() {
      this.$bus.$on('ON_MARKET_SWITCH', (val) => {
        if (val) {
          this.marketCurrent = val;
        }
      });
      this.$bus.$on('ON_MARKET_SWITCH_ORDER', (val) => {
        if (val) {
          this.marketCurrent = val;
        }
      });
      this.$bus.$on('ON_SYMBOL_SWITCH', (val) => {
        if (val) {
          this.symbolCurrent = val;
        }
      });
      // 接收24小时行情数据
      this.$bus.$on('MARKET_DATA', (data) => {
        this.marketDataList = data;
      });
    },
    // 合约名称
    setTypeName(data) {
      const n = this.setSymbolName(data.contractType);
      const t = data.settleTime.split(' ')[0].split('-');
      const time = data.contractType === 0 ? '' : ` · ${t[1]}${t[2]}`;
      const x = data.maxLeverageLevel;
      return `${n}${time} (${x}X)`;
    },
    // 合约类型
    setSymbolName(data) {
      switch (data) {
        case 0:
          return this.$t('contract.contractType1');
        case 1:
          return this.$t('contract.contractType2');
        case 2:
          return this.$t('contract.contractType3');
        case 3:
          return this.$t('contract.contractType4');
        default:
          return this.$t('contract.contractType5');
      }
    },
    // 切换市场
    switchMarket(data) {
      this.marketCurrent = data;
      this.switchSymbol(this.currentSymbolList[0].symbol);
      this.$bus.$emit('ON_MARKET_SWITCH', data);
    },
    // 切换币对
    switchSymbol(data) {
      this.symbolCurrent = data;
      this.$bus.$emit('ON_SYMBOL_SWITCH', data);
    },
  },
};
