import { colorMap, getHex, fixD } from '@/utils';

export default {
  data() {
    return {
      charsBar: null,
      chartLine: null,
      amountTotal: '--', // 总数额
      amountYesterday: '--', // 昨天数额
      amountYesterdayRate: '--', // 昨天同比上日率
      amountBYesterday: '--', // 前天数额
      amountBYesterdayRate: '--', // 前日同比上日率
    };
  },
  props: {
    reqReady: {
      default: false,
      type: Boolean,
    },
    reqData: {
      default: () => { },
      type: Object,
    },
  },
  filters: {
    rateFilter(v) {
      const num = parseFloat(v);
      let str = '';
      if (`${num}` === 'NaN') {
        str = '--';
      } else {
        let vs = '';
        if (num > 0) { vs = '+'; }
        str = `${vs}${v}%`;
      }
      return str;
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
  },
  methods: {
    getRateClass(v) {
      let str = '';
      const num = parseFloat(v);
      if (num > 0) {
        str = 'u-1-cl';
      } else if (num < 0) {
        str = 'u-4-cl';
      } else {
        str = '';
      }
      return str;
    },
    reqSet() {
      this.setBonusData();
      this.setBarData();
      this.setLineData();
    },
    setBonusData() {
      const data = this.reqData.bonus_info;
      this.amountTotal = fixD(data.amount_total, this.usdtFix); // 总数额
      this.amountYesterday = fixD(data.amount_yesterday, this.usdtFix); // 昨天数额
      this.amountBYesterday = fixD(data.amount_b_yesterday, this.usdtFix); // 前天数额
      this.amountYesterdayRate = data.amount_yesterday_rate; // 昨天同比上日率
      this.amountBYesterdayRate = data.amount_b_yesterday_rate; // 前日同比上日率
    },
    setLineData() {
      const data = this.reqData.bonus_week;
      const timeArr = [];
      const valueArr = [];
      const tv = [
        this.$t('brokerSystem.weeks[0]'),
        this.$t('brokerSystem.weeks[1]'),
        this.$t('brokerSystem.weeks[2]'),
        this.$t('brokerSystem.weeks[3]'),
        this.$t('brokerSystem.weeks[4]'),
        this.$t('brokerSystem.weeks[5]'),
        this.$t('brokerSystem.weeks[6]'),
      ];
      data.forEach((even) => {
        const newDate = new Date(even.time);
        const m = newDate.getMonth() + 1;
        const d = newDate.getDate();
        const w = tv[newDate.getDay()];
        timeArr.push({
          value: `${m}/${d} ${w}`,
          textStyle: {
            align: 'center',
          },
        });
        valueArr.push(fixD(even.amount, this.usdtFix));
      });
      if (timeArr.length) {
        timeArr[0].textStyle.align = 'left';
        timeArr[timeArr.length - 1].textStyle.align = 'right';
      }
      this.chartLine.setOption({
        xAxis: {
          data: timeArr,
        },
        series: [
          { data: valueArr },
        ],
      });
    },
    setBarData() {
      const data = this.reqData.bonus_info;
      this.charsBar.setOption({
        legend: {
          data: [this.$t('brokerSystem.charts[0]'), this.$t('brokerSystem.charts[1]')],
        },
        series: [
          {
            data: [
              {
                value: fixD(data.amount_return, this.usdtFix),
                name: this.$t('brokerSystem.charts[0]'),
                itemStyle: { color: colorMap['u-8-bg'] },
              },
              {
                value: fixD(data.amount_sub, this.usdtFix),
                name: this.$t('brokerSystem.charts[1]'),
                itemStyle: { color: colorMap['a-13-bg'] },
              },
            ],
          },
        ],
      });
    },
    init() {
      this.$nextTick(() => {
        this.initChartsBar();
        this.initChartsLine();
      });
    },
    initChartsBar() {
      this.charsBar = window.echarts.init(document.getElementById('overviewChars-bar'));
      this.charsBar.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          left: 140,
          top: 40,
          selectedMode: false,
          data: [this.$t('brokerSystem.charts[0]'), this.$t('brokerSystem.charts[1]')],
          textStyle: {
            color: colorMap['b-2-cl'],
          },
        },
        series: [
          {
            // name: '访问来源',
            type: 'pie',
            radius: ['80%', '100%'],
            avoidLabelOverlap: false,
            hoverAnimation: false, // 是否开启 hover 在扇区上的放大动画效果。
            center: [70, 70],
            width: 140,
            height: 140,
            label: {
              normal: {
                show: false,
                position: 'center',
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: '14',
                  fontWeight: 'bold',
                  color: colorMap['b-2-cl'],
                },
              },
            },
            labelLine: {
              normal: {
                show: false,
              },
            },
          },
        ],
      });
    },
    initChartsLine() {
      this.chartLine = window.echarts.init(document.getElementById('overviewChars-line'));
      const bg = {
        normal: {
          color: new window.echarts.graphic.LinearGradient(
            0, 0, 0, 1,
            [
              // { offset: 0, color: getHex(colorMap['u-8-bg']) },
              // { offset: 1, color: getHex(colorMap['a-5-bg']) },
              { offset: 0, color: colorMap['a-13-bg'] },
              { offset: 1, color: colorMap['a-17-bg'] },
            ],
          ),
        },
      };
      this.chartLine.setOption({
        // trigger: 'axis', // 不限时弹层
        tooltip: {
          trigger: 'axis', // 不限时弹层
          axisPointer: { // 显示随手指移动的刻度线
            type: 'cross',
            crossStyle: {
              width: 2,
              color: getHex(colorMap['b-2-cl']),
              type: 'cross',
            },
          },
        },
        grid: {
          show: true,
          borderWidth: 0,
          borderColor: getHex(colorMap['a-3-bd']),
          containLabel: true,
          left: 5,
          top: 40,
          right: 5,
          bottom: 0,
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisPointer: {
            show: true,
            type: 'line',
            lineStyle: {
              color: getHex(colorMap['b-2-cl']),
              width: 2,
              type: 'dotted',
            },
          },
          axisLine: {
            show: true,
            lineStyle: {
              width: 1,
              color: getHex(colorMap['a-3-bd']),
            },
          },
          axisTick: {
            lineStyle: {
              color: getHex(colorMap['a-3-bd']),
            },
          },
          axisLabel: {
            color: getHex(colorMap['b-2-cl']),
          },
          splitLine: {
            lineStyle: {
              width: 1,
              color: getHex(colorMap['a-3-bd']),
            },
          },
          // data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        },
        yAxis: [
          {
            type: 'value',
            axisLine: {
              show: true,
              lineStyle: {
                width: 1,
                color: getHex(colorMap['a-3-bd']),
              },
            },
            axisTick: {
              lineStyle: {
                color: getHex(colorMap['a-3-bd']),
              },
            },
            axisLabel: {
              color: getHex(colorMap['b-2-cl']),
              formatter: (value) => fixD(value, this.usdtFix),
            },
            splitLine: {
              lineStyle: {
                width: 1,
                color: getHex(colorMap['a-3-bd']),
              },
            },
          },
        ],
        series: [{
          // data: [0, 1, 0, 1, 0, 1, 0],
          type: 'line',
          areaStyle: bg,
          lineStyle: {
            color: getHex(colorMap['u-8-bd']),
          },
          itemStyle: {
            color: getHex(colorMap['u-8-bd']),
            borderWidth: 0,
            opacity: 0,
          },
        }],
      });
    },
  },
};
