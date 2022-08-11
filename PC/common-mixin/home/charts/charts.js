
export default {
  name: 'Charts',
  computed: {
    styleObject() {
      return { height: this.height };
    },
  },
  components: {},
  data() {
    return {
      isshowLoading: true,
      myEcharts: {},
      echartsData: {},
    };
  },
  props: {
    dataList: {
      type: Array,
      default: () => [],
    },
    name: {
      type: String,
    },
    height: {
      type: String,
      default: '50px',
    },
    haveBg: {
      type: Boolean,
      default: true,
    },
    klineColor: {
      type: String,
      default: '#24a0f5',
    },
    lineWidth: {
      type: String,
      default: '2',
    },
  },
  watch: {
    dataList(value) {
      this.echartsData = value;
      this.eachart();
      this.$forceUpdate();
    },
  },
  methods: {
    init() {
      this.initEachart();
    },
    eachart() {
      this.myEcharts[this.name].resize();
      this.myEcharts[this.name].setOption({
        series: [
          {
            data: this.echartsData,
            type: 'line',
            lineStyle: {
              normal: {
                color: this.klineColor,
                width: this.lineWidth,
              },
            },
          },
        ],
      });
    },
    initEachart() {
      let bg;
      if (this.haveBg) {
        bg = {
          normal: {
            color: new window.echarts.graphic.LinearGradient(
              0, 0, 0, 1,
              [
                { offset: 0, color: 'rgba(36,160,245,0.2)' },
                { offset: 1, color: 'rgba(36,160,245,0.05)' },
              ],
            ),
          },
        };
      }
      // 基于准备好的dom，初始化echarts实例
      this.myEcharts[this.name] = window.echarts.init(document.getElementById(`myEcharts${this.name}`));
      // 绘制图表
      this.myEcharts[this.name].setOption({
        grid: {
          left: -10,
          bottom: 0,
          top: 0,
          right: -10,
        },
        xAxis: {
          show: false,
          type: 'category',
          min: 'dataMin',
          max: 'dataMax',
        },
        yAxis: {
          show: false,
          type: 'value',
          min: 'dataMin',
          max: 'dataMax',
        },
        series: [
          {
            data: [],
            type: 'line',
            symbol: 'none',
            lineStyle: {
              normal: {
                color: this.klineColor,
                width: 2,
              },
            },
            areaStyle: bg,
          },
        ],
      });
    },
  },
};
