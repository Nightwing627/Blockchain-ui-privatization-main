export default {
  name: 'chartsDepth',
  components: {},
  props: {
    balanceInfor: {
      type: Object,
      default: {},
    },
  },
  watch: {
    balanceInfor(val) {
      if (val) {
        this.resetData();
      }
    },
  },
  data() {
    return {

    };
  },
  computed: {
    serveData() {
      const arr = [];

      if (this.balanceInfor.isolateMargin && Number(this.balanceInfor.isolateMargin) !== 0) {
        arr.push({
          value: this.balanceInfor.isolateMargin,
          name: this.$t('futures.assetsChart.text1'), // '逐仓',
          itemStyle: { normal: { color: '#62A0A8' } },
        });
      }
      if (this.balanceInfor.totalMargin && Number(this.balanceInfor.totalMargin) !== 0) {
        arr.push({
          value: this.balanceInfor.totalMargin,
          name: this.$t('futures.assetsChart.text2'), // '全仓',
          itemStyle: { normal: { color: '#91C7AE' } },
        });
      }
      if (this.balanceInfor.lockAmount && Number(this.balanceInfor.lockAmount) !== 0) {
        arr.push({
          value: this.balanceInfor.lockAmount,
          name: this.$t('futures.assetsChart.text3'), // '冻结',
          itemStyle: { normal: { color: '#5183BB' } },
        });
      }

      return arr;
    },
  },
  methods: {
    init() {
      this.eachart();
    },
    resetData() {
      if (!this.balanceInfor) return;
      const series = [
        {
          name: '资产',
          type: 'pie',
          radius: ['50%', '75%'],
          avoidLabelOverlap: false,
          data: this.serveData,
        },
      ];
      this.myEcharts.setOption({
        series,
      });
      this.eachart();
    },
    eachart() {
      this.initEachart();
      this.myEcharts.resize();
    },
    initEachart() {
      // 基于准备好的dom，初始化echarts实例
      this.myEcharts = window.echarts.init(document.getElementById('assetsEcharts'));
      // 绘制图表
      this.myEcharts.setOption(
        {
          tooltip: {
            trigger: 'item',
            formatter: '{b} <br/> {c} ({d}%)',
          },
          series: [
            {
              name: '资产',
              type: 'pie',
              radius: ['50%', '75%'],
              avoidLabelOverlap: false,
              data: this.serveData,
            },
          ],
        },
      );
    },
  },
};
