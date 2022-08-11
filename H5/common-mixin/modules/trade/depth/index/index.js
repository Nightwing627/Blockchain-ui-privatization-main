import { setBoxHeight, getCoinShowName } from '@/utils';

// 按钮
export default {
  name: 'market',
  data() {
    return {
      dataList: {
        asksData: [],
        buyData: [],
        depthMaxNumber: null,
      },
      cellWidth: [30, 30, 30],
      // 收起状态 盘口 和 实时成交显示哪个 ？
      shrinksDdpthNewShow: 'D',
      // 卖盘 高度
      sellHeight: 160,
      // 买盘 高度
      buyHeight: 160,
      // 显示条数
      sellLineNumber: 24,
      buyLineNumber: 24,
      // 当前选中的深度级别
      currentdepthClass: 0,
      // 当前选中的货币对
      symbolCurrent: null,
      // 市场数据
      marketData: [],
      symbolsData_bf: {},
      maxHeeight: 780,
      minHeight: 160,
    };
  },
  computed: {
    templateLayoutType() {
      return this.$store.state.baseData.templateLayoutType;
    },
    theadList() {
      if (this.symbolCurrent) {
        // 价格 数量 累计
        return [
          `${this.$t('trade.price')}(${this.getShowName(this.symbolCurrent.split('/')[1])})`,
          `${this.$t('trade.number')}(${this.getShowName(this.symbolCurrent.split('/')[0])})`,
          `${this.$t('trade.total')}(${this.getShowName(this.symbolCurrent.split('/')[0])})`,
        ];
      }
      return [
        `${this.$t('trade.price')}()`,
        `${this.$t('trade.number')}()`,
        `${this.$t('trade.total')}()`,
      ];
    },
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
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
        return this.depthOption[this.currentdepthClass];
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
  },
  methods: {
    init() {
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
        this.setBoxHeight();
      });
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
    setBoxHeight() {
      this.maxHeeight = setBoxHeight(2.61);
      this.minHeight = setBoxHeight(2.61) / 2;
      this.switchDepthType();
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
    switchDepthType(type) {
      this.switchBlock('D');
      switch (type) {
        case 'sell':
          this.sellHeight = this.maxHeeight;
          this.buyHeight = 0;
          this.sellLineNumber = 150;
          this.buyLineNumber = 0;
          break;
        case 'buy':
          this.sellHeight = 0;
          this.buyHeight = this.maxHeeight;
          this.sellLineNumber = 0;
          this.buyLineNumber = 150;
          break;
        default:
          this.sellHeight = this.minHeight;
          this.buyHeight = this.minHeight;
          this.sellLineNumber = 24;
          this.buyLineNumber = 24;
      }
    },
  },
};
