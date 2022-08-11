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
      sellLineNumber: 21,
      buyLineNumber: 21,
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
  computed: {
    sellList() {
      const len = this.dataList.asksData.length;
      let sLen = -5;
      if (len <= 5) {
        sLen = -len;
      }
      return this.dataList.asksData.slice(sLen);
    },
    buyList() {
      return this.dataList.buyData.slice(0, 5);
    },
    templateLayoutType() {
      return this.$store.state.baseData.templateLayoutType;
    },
    // 价格 数量 累计
    theadList() {
      return [
        this.$t('contract.price'), // 价格
        `${this.$t('trade.number')}(${this.$t('contract.piece')})`,
        // this.$t('contract.total'), // '总量',
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
      if (this.templateLayoutType === '2') {
        let depthBoxHeight = document.body.clientHeight;
        if (depthBoxHeight < 800) {
          depthBoxHeight = 800;
        }

        this.sellHeight = (depthBoxHeight - 612) / 2;
        this.buyHeight = (depthBoxHeight - 613) / 2;
      }
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
  },
};
