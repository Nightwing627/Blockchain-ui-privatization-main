import { setBoxHeight } from '@/utils';
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
      sellHeight: 335,
      // 买盘 高度
      buyHeight: 335,
      // 显示条数
      sellLineNumber: 20,
      buyLineNumber: 20,
      // 当前选中的货币对
      symbolCurrent: null,
      // 当前选中的货币对的信息数据
      symbolCurrentInfo: null,
      // 市场数据
      marketData: [],
      // 警示灯
      liquidationRate: 0,
      // 标记价格
      tagPrice: null,
      indexPrice: null,
      // 轮训请求风险警示灯的数据
      getLiquidationRateTimer: null,
    };
  },
  mounted() {
  },
  computed: {
    templateLayoutType() {
      return this.$store.state.baseData.templateLayoutType;
    },
    // 价格 数量 累计
    theadList() {
      return [
        this.$t('contract.price'), // 价格
        this.$t('contract.number'), // '目前仓位数量',
        this.$t('contract.total'), // '总量',
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
  },
  methods: {
    init() {
      this.setBoxHeight();
      // 监听 浏览器窗口大小改变
      this.$bus.$on('WINFOW_ON_RESIIZE', () => {
        // 设置国际版TV的高度
        this.setBoxHeight();
      });
      // 监听 标记价格
      this.$bus.$on('TAG_PRICE', (data) => {
        this.tagPrice = data.tagPrice;
        this.indexPrice = data.indexPrice;
      });
      // 监听 深度数据
      this.$bus.$on('DEPTH_DATA', (data) => {
        this.dataList = data;
      });
      // 监听 市场（最新价格） 数据
      this.$bus.$on('MARKET_DATA', (data) => {
        this.marketData = data;
      });
      // 获取 当前选中的货币对
      this.$bus.$on('SYMBOL_CURRENT', (val) => {
        this.symbolCurrent = val;
        this.dataList = {
          asksData: [],
          buyData: [],
          depthMaxNumber: null,
        };
      });
      // 获取 当前选中的货币对的信息
      this.$bus.$on('SYMBOL_CURRENT_INFO', (val) => {
        this.symbolCurrentInfo = val;
        this.getLiquidationRate();
      });
    },
    setBoxHeight() {
      this.maxHeeight = setBoxHeight(2.71);
      this.minHeight = setBoxHeight(2.71) / 2;
      this.switchDepthType();
    },
    // 盘口 和 实时成交 切换
    switchBlock(type) {
      this.shrinksDdpthNewShow = type;
    },
    // 请求风险警示灯的数据
    getLiquidationRate() {
      this.axios({
        url: this.$store.state.url.contract.get_liquidation_rate,
        hostType: 'co',
        params: {
          contractId: this.symbolCurrentInfo.id,
        },
      }).then((data) => {
        if (data.code === '0') {
          const rate = data.data.liquidationRate;
          if (rate === 0) {
            this.liquidationRate = 0;
          } else {
            this.liquidationRate = parseInt(rate / 20 + 1, 0);
          }
        }
      });
      clearTimeout(this.getLiquidationRateTimer);
      this.getLiquidationRateTimer = null;
      this.getLiquidationRateTimer = setTimeout(() => {
        this.getLiquidationRate();
      }, 20000);
    },
    // 盘口 切换 全买盘 或者 全卖盘
    switchDepthType(type) {
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
