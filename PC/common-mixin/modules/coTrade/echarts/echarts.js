import {
  colorMap, getHex, myStorage, fixD, nul,
} from '@/utils';

export default {
  name: 'chartsDepth',
  components: {},
  props: {
    chartType: { default: 0, type: Number },
  },
  watch: {
    chartType(val) {
      if (val === 2) {
        this.intervalGetdata();
        this.eachart();
      } else {
        clearInterval(this.intervalData);
        this.intervalData = null;
      }
    },
    contractId(val) {
      if (val && this.chartType === 2) {
        this.getData();
      }
    },
    coUnitType(val) {
      if (val && this.chartType === 2) {
        this.getData();
      }
    },
  },
  data() {
    return {
      symbolCurrent: myStorage.get('sSymbolName'),
      isshowLoading: true,
      myEcharts: null,
      loading: true,
      destory: false,
      echartsData: {
        minval: 0,
        maxval: 0,
        buysArr: [],
        asksArr: [],
      },
      styleObject: {
        height: '630px',
      },
      interval: 5000,
      intervalData: null,
      deptValue: 8,
    };
  },
  methods: {
    init() {
      this.$bus.$on('WINFOW_ON_RESIIZE', () => {
        if (this.myEcharts) {
          this.myEcharts.resize();
        }
      });
    },
    intervalGetdata() {
      this.getData(true);
      clearInterval(this.intervalData);
      this.intervalData = setInterval(() => {
        this.getData();
      }, this.interval);
    },
    getData(first) {
      this.axios({
        url: this.$store.state.url.futures.depthMap,
        hostType: 'co',
        params: {
          contractId: this.contractId,
        },
      }).then((data) => {
        if (first) {
          this.loading = false;
        }
        if (data.code && data.code.toString() === '0') {
          if (data.data && data.data.buys && data.data.buys.length) {
            const bl = data.data.buys.length;
            const lasteData = data.data.buys[bl - 1];
            [this.echartsData.minval] = lasteData;
            const buysArr = [];
            data.data.buys.forEach((item) => {
              buysArr.push([item[0], this.setNumber(item[2])]);
            });
            this.echartsData.buysArr = buysArr.reverse();
          } else {
            this.echartsData.buysArr = [];
          }
          if (data.data && data.data.asks && data.data.asks.length) {
            const sl = data.data.asks.length;
            const lasteAsks = data.data.asks[sl - 1];
            [this.echartsData.maxval] = lasteAsks;
            this.echartsData.asksArr = [];
            data.data.asks.forEach((item) => {
              this.echartsData.asksArr.push([item[0], this.setNumber(item[2])]);
            });
          } else {
            this.echartsData.asksArr = [];
          }
          this.eachart();
        } else {
          this.clearData();
        }
      });
    },
    setNumber(volume) {
      if (this.coUnitType === 1) {
        return fixD(nul(volume, this.multiplier), this.volfix);
      }
      return volume;
    },
    clearData() {
      this.echartsData = {
        minval: 0,
        maxval: 0,
        yminval: 0,
        ymaxval: 0,
        buysArr: [],
        asksArr: [],
      };
      this.eachart();
    },
    eachart() {
      if (this.destory) {
        return;
      }
      if (this.myEcharts) {
        this.myEcharts.dispose(this.myEcharts);
      }
      this.initEachart();
      const data = JSON.parse(JSON.stringify(this.echartsData));
      this.myEcharts.resize();
      this.isshowLoading = false;
      let series = [];
      series = [
        {
          ...this.seriesTypes.buy,
          data: data.buysArr,
          type: 'line',
        },
        {
          ...this.seriesTypes.ask,
          data: data.asksArr,
          type: 'line',
        },
      ];
      this.myEcharts.setOption({
        xAxis: [
          {
            min: data.minval,
            max: data.maxval,
          },
        ],
        series,
      });
    },
    initEachart() {
      const self = this;
      // 基于准备好的dom，初始化echarts实例
      this.myEcharts = window.echarts.init(document.getElementById('myEcharts'));
      // 绘制图表
      this.myEcharts.setOption({
        animation: false,
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
          top: 67,
          right: 5,
          bottom: 0,
        },
        xAxis: {
          type: 'value',
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
            showMaxLabel: false,
            showMinLabel: false,
            formatter: function name(value) {
              return value.toFixed(self.pricefix);
            },
          },
          splitLine: {
            lineStyle: {
              width: 1,
              color: getHex(colorMap['a-3-bd']),
            },
          },
        },
        yAxis: [
          {
            min: 'dataMin',
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
            },
            splitLine: {
              lineStyle: {
                width: 1,
                color: getHex(colorMap['a-3-bd']),
              },
            },
          },
        ],
      });
    },
  },
  computed: {
    // 当前合约币对
    contractId() {
      return this.$store.state.future.contractId;
    },
    // 合约币对价格精度
    pricefix() {
      return this.$store.state.future.pricefix;
    },
    // 数量单位类型Number(1标的货币 2张)
    coUnitType() {
      return this.$store.state.future.coUnitType;
    },
    // 当前合约面值
    multiplier() {
      return Number(this.$store.state.future.multiplier) || 1;
    },
    // 当前合约数量精度
    volfix() {
      if (this.coUnitType === 1) {
        return this.$store.state.future.volfix;
      }
      return 0;
    },
    seriesTypes() {
      const buy = {
        type: 'line',
        symbol: 'none',
        itemStyle: {
          normal: {
            color: colorMap['a-18-bg'],
          },
        },
        lineStyle: {
          normal: {
            color: colorMap['a-18-bg'],
            width: 2,
          },
        },
        areaStyle: {
          normal: {
            color: new window.echarts.graphic.LinearGradient(
              0, 0, 0, 1,
              [
                { offset: 0, color: colorMap['a-18-bg'] },
                { offset: 1, color: colorMap['u-2-bg'] },
              ],
            ),
          },
        },
        data: [],
      };
      const ask = {
        type: 'line',
        symbol: 'none',
        lineStyle: {
          normal: {
            color: colorMap['a-19-bg'],
            width: 2,
          },
        },
        itemStyle: {
          normal: {
            color: colorMap['a-19-bg'],
          },
        },
        areaStyle: {
          normal: {
            color: new window.echarts.graphic.LinearGradient(
              0, 0, 0, 1,
              [
                { offset: 0, color: colorMap['a-19-bg'] },
                { offset: 1, color: colorMap['u-5-bg'] },
              ],
            ),
          },
        },
        data: [],
      };
      const autoBuy = {
        ...buy,
        lineStyle: {
          normal: {
            width: 0,
          },
        },
      };
      const autoAsk = {
        ...ask,
        lineStyle: {
          normal: {
            width: 0,
          },
        },
      };
      return {
        buy,
        ask,
        autoBuy,
        autoAsk,
      };
    },
    // // 全部币对列表
    // symbolAll() {
    //   return this.$store.state.baseData.symbolAll;
    // },
    // // 当前币对精度计算的值
    // fixValue() {
    //   if (this.symbolAll && this.symbolCurrent) {
    //     const symbol = this.symbolAll[this.symbolCurrent];
    //     return {
    //       priceFix: symbol.price,
    //       volumeFix: symbol.volume,
    //     };
    //   }
    //   return {
    //     priceFix: 2,
    //     volumeFix: 8,
    //   };
    // },
  },
  destroyed() {
    this.$bus.$off('SYMBOL_CURRENT');
    this.$bus.$off('WINFOW_ON_RESIIZE');
    this.$bus.$off('DEPTH_VALUE');
    clearInterval(this.intervalData);
    this.intervalData = null;
    this.destory = true;
  },
};
