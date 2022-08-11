import { colorMap, getHex } from '@/utils';

export default {
  name: 'chartsDepth',
  components: {},
  props: {
    chartType: {
      default: 1,
    },
  },
  data() {
    return {
      isshowLoading: true,
      myEcharts: null,
      echartsData: {
        minval: 0,
        maxval: 0,
        buysArr: [],
        asksArr: [],
      },
      styleObject: {
        height: '450px',
      },
    };
  },
  watch: {
    chartType(val) {
      if (val) {
        this.myEcharts.resize();
      }
    },
  },
  methods: {
    init() {
      this.initEachart();
      this.$bus.$on('ECHARTS_DATA', (data) => {
        if (data) {
          this.echartsData = data;
          this.eachart();
        } else {
          this.echartsData = {
            minval: 0,
            maxval: 0,
            yminval: 0,
            ymaxval: 0,
            buysArr: [],
            asksArr: [],
          };
          this.eachart();
        }
      });
      // 获取 当前选中的货币对
      this.$bus.$on('SYMBOL_CURRENT', () => {
        this.echartsData = {
          minval: 0,
          maxval: 0,
          yminval: 0,
          ymaxval: 0,
          buysArr: [],
          asksArr: [],
        };
        this.eachart();
      });
      this.$bus.$on('WINFOW_ON_RESIIZE', () => {
        this.myEcharts.resize();
      });
    },
    eachart() {
      this.myEcharts.resize();
      this.isshowLoading = false;
      let series = [];
      series = [
        {
          ...this.seriesTypes.buy,
          data: this.echartsData.buysArr,
          type: 'line',
        },
        {
          ...this.seriesTypes.ask,
          data: this.echartsData.asksArr,
          type: 'line',
        },
      ];
      this.myEcharts.setOption({
        xAxis: [
          {
            min: this.echartsData.minval,
            max: this.echartsData.maxval,
          },
        ],
        // yAxis: [
        //   {
        //     min: this.echartsData.yminval,
        //     max: this.echartsData.ymaxval,
        //   },
        // ],
        series,
      });
    },
    initEachart() {
      // 基于准备好的dom，初始化echarts实例
      this.myEcharts = window.echarts.init(document.getElementById('myEcharts'));
      // 绘制图表
      this.myEcharts.setOption({
        animation: false,
        // tooltip: {
        //   trigger: 'axis', // 不限时弹层
        //   axisPointer: { // 显示随手指移动的刻度线
        //     type: 'cross',
        //     crossStyle: {
        //       width: 2,
        //       color: getHex(colorMap['b-2-cl']),
        //       type: 'cross',
        //     },
        //   },
        // },
        // dataZoom: [
        //   {
        //     type: 'slider',
        //     show: true,
        //     filterMode: 'none', // 缩放区域外（在这里作用是避免数据中断）
        //     xAxisIndex: [0],
        //     start: 100,
        //     end: 0,
        //   },
        // ],
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
                { offset: 1, color: colorMap['u-4-bg'] },
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
  },
};
