// myStorage
import { fixD, myStorage } from '@/utils';

// mapState\

export default {
  name: 'market',
  components: {},
  props: {
    close: {
      default() {},
      type: Function,
    },
    isShow: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      // 币对列表
      // marketData: null,
      // 当前市场
      marketCurrent: null,

      // 行情数据
      WsData: {},
      // 当前合约市场
      currentTypeTab: 1,
      // 合约方向类型
      contractSide: 1,
      // 筛选
      listfilterVal: null,
      // 排序类别
      sortName: null,
      // 排序方向
      sortType: '',
      showTypeTabList0: false,
      showTypeTabList1: false,
      showTypeTabList2: false,
      showTypeTabList3: false,

    };
  },
  computed: {
    // 是否登录
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    // 类型列表 USDT合约/币本位合约
    typeTabList() {
      return [
        {
          id: 1,
          text: this.$t('futures.market.text4'), // 'USDT合约',
          isShow: this.showTypeTabList1,
          classes: this.contractSide === 1 ? 'u-8-bg b-1-cl' : 'a-3-bg b-2-cl',
        },
        {
          id: 0,
          text: this.$t('futures.market.text5'), // '币本位合约',
          isShow: this.showTypeTabList0,
          classes: this.contractSide === 0 ? 'u-8-bg b-1-cl' : 'a-3-bg b-2-cl',
        },
        {
          id: 2,
          text: this.$t('futures.market.text6'), // '混合合约',
          isShow: this.showTypeTabList2,
          classes: this.contractSide === 2 ? 'u-8-bg b-1-cl' : 'a-3-bg b-2-cl',
        },
        {
          id: 3,
          text: this.$t('futures.market.text7'), // '模拟合约',
          isShow: this.showTypeTabList3,
          classes: this.contractSide === 3 ? 'u-8-bg b-1-cl' : 'a-3-bg b-2-cl',
        },
      ];
    },
    // 合约列表
    contractList() {
      return this.$store.state.future.contractList;
    },
    // 当前合约名称
    contractName() {
      return this.$store.state.future.contractName;
    },
    // 当前合约信息
    contractInfo() {
      return this.$store.state.future.contractInfo;
    },
    // 合约币对价格精度
    pricefix() {
      return this.$store.state.future.pricefix;
    },
    // 合约类型列表
    contractTypeText() {
      return this.$store.state.future.contractTypeText;
    },
    // 币对列表
    marketList() {
      let data = [];
      let text = '';
      if (this.contractList && this.contractList.length) {
        this.contractList.forEach((item) => {
          // 混合合约 || 模拟合约
          if (item.contractType !== 'E') {
            text = `-${item.marginCoin}`;
          } else {
            text = '';
          }
          const symbolName = item.symbol.replace('-', '');
          data.push({
            type: this.filterType(item),
            key: item.wsDatakey,
            symbol: `${symbolName}${text}`,
            contractName: item.contractName,
            sort: item.sort,
            close: this.WsData[item.wsDatakey] ? this.WsData[item.wsDatakey].close : '--',
            rose: this.WsData[item.wsDatakey] ? this.WsData[item.wsDatakey].rose : '--',
            priceFix: item.priceFix,
          });
        });
      }
      // 搜索
      if (this.listfilterVal) {
        const reg = new RegExp(this.listfilterVal, 'gim');
        data = data.filter((item) => item.symbol.match(reg));
      }
      // 排序
      if (this.sortType === 'down') {
        data.sort((a, b) => parseFloat(b[this.sortName]) - parseFloat(a[this.sortName]));
      }
      if (this.sortType === 'up') {
        data.sort((a, b) => parseFloat(a[this.sortName]) - parseFloat(b[this.sortName]));
      }
      if (!this.sortType) {
        data.sort((a, b) => parseFloat(a.sort) - parseFloat(b.sort));
      }
      return data;
    },
    // 用户配置信息
    userConfig() {
      return this.$store.state.future.futureUserConfig;
    },

  },
  watch: {
    isShow() {
      this.listfilterVal = null;
    },
    contractInfo(val, old) {
      if (val && !old) {
        this.contractSide = this.filterType(val);
      }
    },
  },
  filters: {
    // 涨跌幅处理
    fixdRose(value) {
      if (value && value !== '--') {
        let slie = '';
        const val = parseFloat(value, 0);
        if (val > 0) { slie = '+'; }
        if (val < 0) { slie = '-'; }
        const num = Math.abs((value * 10000) / 100);
        return `${slie}${Number(num.toString().match(/^\d+(?:\.\d{0,2})?/))}`;
      }
      return value;
    },
  },
  methods: {
    // 筛选币对列表
    filterType(data) {
      // USDT 合约
      if (data.contractType === 'E' && data.contractSide === 1) {
        this.showTypeTabList1 = true;
        return 1;
      }
      // 币本位合约
      if (data.contractType === 'E' && data.contractSide === 0) {
        this.showTypeTabList0 = true;
        return 0;
      }
      // 模拟合约
      if (data.contractType === 'S') {
        this.showTypeTabList3 = true;
        return 3;
      }
      // 混合合约
      this.showTypeTabList2 = true;
      return 2;
    },
    // 最新价 精度处理
    fixPrice(value, fix) {
      return fixD(value, fix);
    },
    // 切换合约类型
    changeTypeTab(type) {
      this.contractSide = type;
      this.getReceiveCoupon();
    },
    // 搜索事件
    inputchanges(v) {
      this.listfilterVal = v;
    },
    // 币对排序
    sorteEvent(key) {
      this.$nextTick(() => {
        if (!this.sortName) {
          this.sortName = key;
          this.sortType = 'down';
        } else if (this.sortType === 'down') {
          this.sortName = key;
          this.sortType = 'up';
        } else if (this.sortType === 'up') {
          this.sortName = null;
          this.sortType = null;
        }
      });
    },
    // 切换币对
    switchSymbol(data) {
      let contractId;
      if (this.contractList && this.contractList.length) {
        this.contractList.forEach((item) => {
          if (data === item.contractName) {
            contractId = item.id;
          }
        });
      }
      myStorage.set('contractId', contractId);
      myStorage.set('contractName', data);
      myStorage.set('futuresMarketCurrent', this.contractSide);
      this.$bus.$emit('futuresMarketCurrent', this.contractSide);
      this.$store.dispatch('setActivePublicInfo');
      if (this.isLogin) {
        this.$store.dispatch('getUserConfig');
      }
      this.close();
    },
    // 涨跌幅 颜色 class
    roseClasses(data) {
      if (data && data !== '--') {
        const val = parseFloat(data, 0);
        if (val === 0) {
          return '';
        }
        return val > 0 ? 'u-1-cl' : 'u-4-cl';
      }
      return '';
    },

    init() {
      // 接收24小时行情数据
      this.$bus.$on('FUTURE_MARKET_DATA', (data) => {
        this.WsData = JSON.parse(data);
      });
      if (this.contractInfo) {
        this.contractSide = this.filterType(this.contractInfo);
      }
      this.getReceiveCoupon();
    },
    // 获去赠金
    getReceiveCoupon() {
      if (this.isLogin
        && this.userConfig
        && this.contractSide === 3
        && this.userConfig.openContract === 1
        && this.userConfig.couponTag === 0) {
        this.$store.dispatch('getReceiveCoupon');
      }
    },
  },
};
