import { fixRate, myStorage, getCoinShowName } from '@/utils';

export default {
  name: 'market',
  data() {
    return {
      dataList: {
        asksData: [],
        buyData: [],
        depthMaxNumber: null,
      },
      cellWidth: [100, 90, 95],
      // 收起状态 盘口 和 实时成交显示哪个 ？
      shrinksDdpthNewShow: 'D',
      // 卖盘 高度
      sellHeight: 300,
      // 买盘 高度
      buyHeight: 300,
      // 显示条数
      sellLineNumber: 22,
      buyLineNumber: 22,
      // 当前选中的深度级别
      currentdepthClass: 0,
      // 当前选中的货币对
      symbolCurrent: myStorage.get('sSymbolName'),
      // 市场数据
      marketData: [],
      symbolsData_bf: {},
      maxHeeight: 600,
      minHeight: 390,
      totalBalancesHide: false,
      depthType: '',
    };
  },
  props: {
    moduleType: {
      type: String,
      default: 'ex',
    },
    etfPrice: {
      type: String,
      default: '',
    },
  },
  computed: {
    depthClass() {
      if (this.moduleType === 'lever') {
        return 'lever-depth-block';
      }
      return '';
    },
    totalBalances() {
      if (this.accountBalance) {
        const { totalBalance, totalBalanceSymbol } = this.accountBalance;
        return {
          totalBalance,
          totalBalanceSymbol,
          totalRater: fixRate(totalBalance, this.rateData, totalBalanceSymbol),
        };
      }
      return {
        totalBalance: '0.0000',
        totalBalanceSymbol: 'BTC',
        totalRater: '0.00',
      };
    },
    rateData() {
      return this.$store.state.baseData.rate;
    },
    accountBalance() {
      if (this.$store.state.assets) {
        return this.$store.state.assets.assetsCoinData;
      }
      return null;
    },
    templateLayoutType() {
      return this.$store.state.baseData.templateLayoutType;
    },
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
    theadList() {
      if (this.symbolCurrent) {
        const symbolCurrent = getCoinShowName(this.symbolCurrent, this.symbolAll).split('/');
        // 价格 数量 累计
        return [
          `${this.$t('trade.price')}(${symbolCurrent[1]})`,
          `${this.$t('trade.number')}(${symbolCurrent[0]})`,
          `${this.$t('trade.total')}(${symbolCurrent[0]})`,
        ];
      }
      return [
        `${this.$t('trade.price')}()`,
        `${this.$t('trade.number')}()`,
        `${this.$t('trade.total')}()`,
      ];
    },
    symbolsData() {
      if (this.marketData[this.symbolCurrent]) {
        return this.marketData[this.symbolCurrent];
      }
      return {
        name: '--',
        symbol: {
          symbol: '--',
          unit: '--',
        },
        close: {
          class: '',
          data: '--',
          price: '--',
        },
        amount: '--',
        rose: {
          class: '',
          data: '--',
        },
      };
    },
    // 深度选项
    depthOption() {
      if (this.symbolAll && this.symbolCurrent) {
        const option = [];
        const arr = this.symbolAll[this.symbolCurrent].depth.split(',');
        arr.forEach((item) => {
          const opt = item.split('.')[1] ? item.split('.')[1].length : '0';
          option.push(opt);
        });
        return option;
      }
      return [];
    },
    deptValue() {
      if (this.depthOption) {
        const val = this.depthOption[this.currentdepthClass];
        this.$bus.$emit('DEPTH_VALUE', val);
        return val;
      }
      return null;
    },
  },
  watch: {
    deptValue(val) {
      if (val) {
        this.$bus.$emit('DEPTH_VALUE', val);
      }
    },
    minHeight(val) {
      if (this.sellHeight > 1 && this.buyHeight > 1 && this.templateLayoutType === '2') {
        const number = Math.floor(val / 16);
        this.sellLineNumber = number;
        this.buyLineNumber = number;
      }
    },
  },
  methods: {
    getShowEtf(v) {
      let flag = false;
      const symbol = v;
      if (this.symbolAll
        && this.symbolAll[symbol]
        && this.symbolAll[symbol].etfOpen) {
        flag = true;
      }
      return flag;
    },
    init() {
      if (this.moduleType === 'lever') {
        // 卖盘 高度
        this.sellHeight = 416;
        // 买盘 高度
        this.buyHeight = 416;
        // 显示条数
        this.sellLineNumber = 26;
        this.buyLineNumber = 26;
        this.maxHeeight = 840;
        // 当前选中的货币对
        this.symbolCurrent = myStorage.get('leverSymbolName');
      }

      this.setBoxHeight();
      // 监听 深度数据
      this.$bus.$on('DEPTH_DATA', (data) => {
        if (data && this.symbolCurrent === data.symbol) {
          this.dataList = data;
        } else {
          this.dataList = {
            asksData: [],
            buyData: [],
            depthMaxNumber: null,
          };
        }
      });
      // 监听 市场（最新价格） 数据
      this.$bus.$on('MARKET_DATA', (data) => {
        this.marketData = data;
      });
      // 获取 当前选中的货币对
      this.$bus.$on('SYMBOL_CURRENT', (val) => {
        this.dataList = {
          asksData: [],
          buyData: [],
          depthMaxNumber: null,
        };
        this.symbolCurrent = val;
        this.currentdepthClass = 0;
      });
      // 监听 浏览器窗口大小改变
      this.$bus.$on('WINFOW_ON_RESIIZE', () => {
        // 设置国际版TV的高度
        this.setBoxHeight(false);
      });
    },
    handelTotal() {
      this.totalBalancesHide = !this.totalBalancesHide;
    },
    setBoxHeight(change = true) {
      if (this.templateLayoutType === '2') {
        let depthBoxHeight = document.body.clientHeight;
        if (depthBoxHeight < 800) {
          depthBoxHeight = 800;
        }
        this.maxHeeight = depthBoxHeight - 524;
        this.minHeight = (depthBoxHeight - 528) / 2;
        this.switchDepthType('', change);
      }
    },
    // 切换深度
    switchDepth(num) {
      if (num === 1) {
        if (this.currentdepthClass < this.depthOption.length - 1) {
          this.currentdepthClass += num;
          this.$bus.$emit('DEPTH_CLASSES', this.currentdepthClass.toString());
        }
      } else if (this.currentdepthClass > 0) {
        this.currentdepthClass += num;
        this.$bus.$emit('DEPTH_CLASSES', this.currentdepthClass.toString());
      }
    },
    switchBlock(type) {
      this.shrinksDdpthNewShow = type;
    },
    // 盘口 切换 全买盘 或者 全卖盘
    switchDepthType(type, change = true) {
      if (change) this.switchBlock('D');
      switch (type) {
        case 'sell':
          this.sellHeight = this.maxHeeight;
          this.buyHeight = 0;
          this.sellLineNumber = 150;
          this.buyLineNumber = 0;
          this.depthType = 'sell';
          break;
        case 'buy':
          this.sellHeight = 0;
          this.buyHeight = this.maxHeeight;
          this.sellLineNumber = 0;
          this.buyLineNumber = 150;
          this.depthType = 'buy';
          break;
        default:
          this.sellHeight = this.minHeight;
          this.buyHeight = this.minHeight;
          this.depthType = 'center';
          if (this.templateLayoutType === '2') {
            const number = Math.floor(this.minHeight / 16);
            this.sellLineNumber = number;
            this.buyLineNumber = number;
          } else {
            this.sellLineNumber = 24;
            this.buyLineNumber = 24;
          }
      }
    },
  },
};
