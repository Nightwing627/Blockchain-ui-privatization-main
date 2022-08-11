import {
  fixD, fixRate, imgMap,
} from '@/utils';

export default {
  data() {
    return {
      canvasPages: [], // canvas
      totalBalance: '--', // 资产折合
      totalBalanceSymbol: '', // 资产折合币种
      totalRate: '--', // 资产折合汇率
      colors: ['#9695FF', '#8073FF', '#6C5EE5', '#706BE4', '#514DE9 ', '#4232C5'],
      otcHeader: `background: url(${imgMap.zc_otc})`,
    };
  },
  props: {
    axiosData: {
      default: () => {},
      type: Object,
    },
  },
  watch: {
    axiosData(v) {
      if (v) {
        this.setData(v);
      }
    },
    // market(v) { if (v) { this.sendOtcAxios(); } },
    canvasPagesFilter(v) {
      if (v.length === 0) {
        this.canvasInit();
      } else {
        this.canvasMap();
      }
    },
  },
  computed: {
    market() { return this.$store.state.baseData.market; },
    // 饼图 数据（包含饼图 和 指标）
    canvasPagesFilter() {
      const arr = [];
      // 去除零资产
      const list = this.canvasPages.filter((item) => parseFloat(item.spk) > 0);
      // 排序
      list.sort(this.compare('spk'));
      // 非0资产的币种少于6种时
      if (list.length < 6) {
        list.forEach((item, index) => {
          arr.push({
            ...item,
            color: this.colors[index],
          });
        });
      // 非0资产的币种多于等于6种时
      } else if (list.length >= 6) {
        let evenSum = 0;
        // 选出前五个
        list.forEach((item, index) => {
          if (index < 5) {
            arr.push({
              ...item,
              color: this.colors[index],
            });
          } else {
            evenSum += item.spk;
          }
        });
        // 剩余币种归纳为其他
        arr.push({
          symbol: this.$t('assets.otcAccount.other'),
          spk: evenSum,
          color: this.colors[5],
        });
      }
      return arr;
    },
  },
  methods: {
    init() {
      this.$nextTick(() => {
        this.canvasInit();
      });
    },
    compare(property) {
      return function fn(a, b) {
        const value1 = a[property];
        const value2 = b[property];
        return value2 - value1;
      };
    },
    canvasMap() {
      const ctx = this.$refs.canvas.getContext('2d');
      this.$refs.canvas.width = 70;
      this.$refs.canvas.height = 70;
      let start = 0;
      this.canvasPagesFilter.forEach((item) => {
        let spk = start + item.spk * 2;
        if (start >= 2) { return; } // 防止 2-xx的值
        if (spk > 2) { spk = 2; } // 防止 1.x - 2.x的值
        ctx.beginPath();
        ctx.moveTo(35, 35);
        ctx.fillStyle = item.color;
        ctx.arc(35, 35, 35, Math.PI * start, Math.PI * spk);
        ctx.closePath();
        ctx.fill();
        start = spk;
      });
      ctx.beginPath();
      ctx.moveTo(35, 35);
      ctx.fillStyle = '#4a3dd8';
      ctx.arc(35, 35, 25, Math.PI * 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    },
    // canvas初始化
    canvasInit() {
      const ctx = this.$refs.canvas.getContext('2d');
      this.$refs.canvas.width = 70;
      this.$refs.canvas.height = 70;
      ctx.beginPath();
      ctx.moveTo(35, 35);
      ctx.fillStyle = '#e0e0e0';
      ctx.arc(35, 35, 35, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(50, 50);
      ctx.fillStyle = '#4a3dd8';
      ctx.arc(35, 35, 25, Math.PI * 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    },
    // 处理列表数据
    setData({ totalBtcValue, totalBalanceSymbol, allCoinMap }) {
      const totalBalance = totalBtcValue;
      const { coinList, rate } = this.market;
      const FFix = (coinList[totalBalanceSymbol]
        && coinList[totalBalanceSymbol].showPrecision) || 0;
      this.totalBalance = fixD(totalBalance, FFix); // 折合资产
      this.totalBalanceSymbol = totalBalanceSymbol; // 折合币种
      this.totalRate = fixRate(totalBalance, rate, totalBalanceSymbol); // 折合法币
      const canvasList = [];
      allCoinMap.forEach((item) => {
        canvasList.push({
          symbol: item.symbol,
          spk: item.btcValue / totalBalance,
        });
      });
      this.canvasPages = canvasList;
    },
  },
};
