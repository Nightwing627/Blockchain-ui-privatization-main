import {
  imgMap, fixD, fixRate, getCoinShowName,
} from '@/utils';

export default {
  data() {
    return {
      exchangeHeader: `background: url(${imgMap.zc_ex})`,
      totalBalance: '--', // 总资产折合
      totalRate: '--', // 折合法币
      totalBalanceSymbol: '', // 总资产折合单位
      colors: [
        'rgba(255, 255, 255, 1)',
        'rgba(255, 255, 255, 0.8)',
        'rgba(255, 255, 255, 0.6)',
        'rgba(255, 255, 255, 0.4)',
        'rgba(255, 255, 255, 0.25)',
        'rgba(255, 255, 255, 0.1)',
      ],
      // colors: ['red', 'blue', 'pink', 'green', '#fff', '#000'],
      canvasPages: [],
    };
  },
  created() {
    this.$nextTick(() => {
      this.canvasInit();
    });
    if (this.exchangeData && this.market) { this.setData(); }
  },
  computed: {
    exchangeData() { return this.$store.state.assets.exchangeData; },
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
          symbol: this.$t('assets.exchangeAccount.other'), // 其他
          spk: evenSum,
          color: this.colors[5],
        });
      }
      return arr;
    },
  },
  watch: {
    exchangeData(v) { if (v && this.market) { this.setData(); } },
    market(v) { if (v && this.exchangeData) { this.setData(); } },
    canvasPagesFilter(v) {
      if (v.length === 0) {
        this.canvasInit();
      } else {
        this.canvasMap();
      }
    },
  },
  methods: {
    init() {
      this.$nextTick(() => {
        this.canvasInit();
      });
      if (this.exchangeData && this.market) { this.setData(); }
    },
    getShowName(v) {
      let str = v;
      if (this.exchangeData && this.market) {
        const { coinList } = this.market;
        str = getCoinShowName(v, coinList);
      }
      return str;
    },
    compare(property) {
      return function fn(a, b) {
        const value1 = a[property];
        const value2 = b[property];
        return value2 - value1;
      };
    },
    setData() {
      const {
        totalBalance, totalBalanceSymbol,
        allCoinMap,
      } = this.exchangeData;
      const { coinList, rate } = this.market;
      const fix = (coinList[totalBalanceSymbol] && coinList[totalBalanceSymbol].showPrecision) || 0;
      this.totalBalance = fixD(totalBalance, fix); // 折合资产
      this.totalBalanceSymbol = totalBalanceSymbol; // 折合币种
      this.totalRate = fixRate(totalBalance, rate, totalBalanceSymbol); // 折合法币
      this.setDataList(allCoinMap, totalBalance);
    },
    setDataList(data, sum) {
      const canvasList = [];
      Object.keys(data).forEach((item) => {
        if (data[item].isFiat) {
          return;
        }
        canvasList.push({
          symbol: item,
          spk: data[item].btcValuatin / sum,
        });
      });
      this.canvasPages = canvasList;
    },
    canvasInit() {
      if (this.canvasPagesFilter.length) {
        return;
      }
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
      ctx.fillStyle = '#294EBB';
      ctx.arc(35, 35, 25, Math.PI * 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
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
      ctx.fillStyle = '#294EBB';
      ctx.arc(35, 35, 25, Math.PI * 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    },
  },
};
