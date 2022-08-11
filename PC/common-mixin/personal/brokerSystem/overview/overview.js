import { imgMap, colorMap, fixD } from '@/utils';

export default {

  data() {
    return {
      currentTab: 1,
      lineHeight: '55',
      marginRight: 50, // 距离右边的距离
      loading1: true,
      loading2: true,
      dataList: [],
      dataList2: [],
      imgMap,
      colorMap,
      countTotal: '--', // 总数量
      countAgent: '--', // 子经纪数量
      countCommon: '--', // 直客数量
      countBonus: '--', // 昨日返佣数量
    };
  },
  props: {
    reqReady: {
      default: false,
      type: Boolean,
    },
    reqData: {
      default: () => {},
      type: Object,
    },
  },
  watch: {
    reqReady: {
      immediate: true,
      handler(v) {
        if (v) {
          this.reqSet();
        }
      },
    },
  },
  computed: {
    market() {
      return this.$store.state.baseData.market;
    },
    usdtFix() {
      let fix = 0;
      if (this.market && this.market.coinList && this.market.coinList.USDT) {
        fix = this.market.coinList.USDT.showPrecision;
      }
      return fix;
    },
    navTab() {
      return [
        // 直客贡献排行
        {
          name: this.$t('brokerSystem.overviewTitle[0]'),
          index: 1,
        },
        // 子经纪贡献排行
        {
          name: this.$t('brokerSystem.overviewTitle[1]'),
          index: 2,
        },
      ];
    },
    columns() {
      return [
        // 排名
        {
          title: this.$t('brokerSystem.overviewList[0]'),
          align: 'left',
        },
        // 手机号
        {
          title: this.$t('brokerSystem.overviewList[1]'),
          align: 'center',
        },
        // 返佣手续费 (USDT)
        {
          title: this.$t('brokerSystem.overviewList[2]'),
          align: 'right',
          width: '200px',
        },
      ];
    },
    columns2() {
      return [
        // 排名
        {
          title: this.$t('brokerSystem.overviewList[0]'),
          align: 'left',
        },
        // 手机号
        {
          title: this.$t('brokerSystem.overviewList[1]'),
          align: 'center',
        },
        // 返佣手续费 (USDT)
        {
          title: this.$t('brokerSystem.overviewList[2]'),
          align: 'right',
          width: '200px',
        },
      ];
    },
  },
  methods: {
    reqSet() {
      this.initSystem();
      this.initList1();
      this.initList2();
    },
    initSystem() {
      const data = this.reqData.child_info;
      this.countTotal = data.count_total; // 总数量
      this.countAgent = data.count_agent; // 子经纪数量
      this.countCommon = data.count_common; // 直客数量
      this.countBonus = data.count_bonus; // 昨日返佣数量
    },
    initList1() {
      const data = this.reqData.user_return;
      const arr = [];
      data.forEach((item, index) => {
        arr.push({
          id: index,
          data: [
            `NO.${index + 1}`,
            item.username,
            fixD(item.amount, this.usdtFix),
          ],
        });
      });
      this.loading1 = false;
      this.dataList = arr;
    },
    initList2() {
      const data = this.reqData.user_sub;
      const arr = [];
      data.forEach((item, index) => {
        arr.push({
          id: index,
          data: [
            `NO.${index + 1}`,
            item.username,
            fixD(item.amount, this.usdtFix),
          ],
        });
      });
      this.loading2 = false;
      this.dataList2 = arr;
    },
    init() {
    },
    currentType(data) {
      this.currentTab = data.index;
    },
  },
};
