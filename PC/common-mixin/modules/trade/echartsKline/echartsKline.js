import { colorMap, myStorage, getHex } from '@/utils';

export default {
  name: 'myEchartsKline',
  components: {},
  data() {
    return {
      isshowLoading: true,
      myEchartsKline: null,
      echartsData: {
        minval: 0,
        maxval: 0,
        buysArr: [],
        asksArr: [],
      },
      klineData: null,
      dates: null,
      data: null,
      subData: null,
      styleObject: {
        height: '450px',
      },
      fataChannelVal: null,
      seriesData: {
        data: ['--', '--', '--', '--'],
        vol: '--',
        MA5: '--',
        MA10: '--',
        MA30: '--',
      },
      tootipData: [],
      ishoverFla: false,
      markPointBgColor: colorMap['u-4-cl'],
      symbolCurrent: myStorage.get('sSymbolName'),
      lastTimeS: myStorage.get('lastTimeS'),
      // lastTimeS: 'Line',
      lineClosreData: [],
      dataZoomStart: 50,
      gridRightVal: 10,
    };
  },
  computed: {
    // 当前货币对名称数据
    symbolName() {
      if (this.symbolCurrent) {
        const symbolArr = this.symbolCurrent.toLowerCase().split('/');
        return {
          base: this.symbolCurrent.split('/')[0],
          count: this.symbolCurrent.split('/')[1],
          name: this.symbolCurrent,
          symbol: symbolArr[0] + symbolArr[1],
        };
      }
      return {
        base: null, // 基础货币
        count: null, // 计价货币
        name: null, // 大写 带/
        symbol: null, // 小写
      };
    },
    kLinwReqData() {
      return this.$store.state.trade.kLinwReqData;
    },
    kLinwSubData() {
      return this.$store.state.trade.kLinwSubData;
    },
  },
  watch: {
    tootipData(data) {
      if (data.length) {
        data.forEach((item) => {
          if (item.seriesName === 'K' && item.data.length === 6) {
            this.seriesData.data = item.data;
            this.seriesData.data.splice(0, 1);
          }
          if (item.seriesName === 'Volume') {
            const [, vol] = item.data;
            this.seriesData.vol = vol;
          }
          if (item.seriesName === 'MA5') {
            this.seriesData.MA5 = item.data !== '-' ? item.data.toFixed(4) : '-';
          }
          if (item.seriesName === 'MA10') {
            this.seriesData.MA10 = item.data !== '-' ? item.data.toFixed(4) : '-';
          }
          if (item.seriesName === 'MA30') {
            this.seriesData.MA30 = item.data !== '-' ? item.data.toFixed(4) : '-';
          }
        });
      }
    },
    data(data) {
      if (data.length && !this.ishoverFla) {
        const len = data.length - 1;
        this.seriesData.data = data[len];
        const [, vol] = this.volumes[len];
        this.seriesData.vol = vol;
        if (this.calculateMA(5, data)[len] !== '-') {
          this.seriesData.MA5 = this.calculateMA(5, data)[len].toFixed(4);
        }
        if (this.calculateMA(10, data)[len] !== '-') {
          this.seriesData.MA10 = this.calculateMA(5, data)[len].toFixed(4);
        }
        if (this.calculateMA(30, data)[len] !== '-') {
          this.seriesData.MA30 = this.calculateMA(5, data)[len].toFixed(4);
        }
      }
    },
    kLinwReqData(val) {
      const [, symbolType, , scale] = val.channel.split('_');
      if (symbolType === this.symbolName.symbol
        && val.channel !== this.fataChannelVal
        && val.data.length) {
        this.fataChannelVal = val.channel;
        this.klineData = val.data;
        this.volumes = [];
        this.dates = [];
        this.data = [];
        this.lineClosreData = [];
        this.klineData.forEach((item, i) => {
          const close = `${item.close}`;
          this.gridRightVal = close.length * 1.1;
          const dateArr = item.ds.split('-');
          const timeArr = dateArr[2].split(':');
          const time = `${timeArr[0]}:${timeArr[1]}`;
          this.dates.push(`${dateArr[1]}-${time}`);
          this.volumes.push([i, item.vol, item.open < item.close ? 1 : -1]);
          this.data.push([item.open, item.close, item.high, item.low, item.vol]);
          if (scale === '1min') {
            this.lineClosreData.push(item.close);
          }
        });
        this.$bus.$emit('HIDE_LOADING');
        this.initEachart();
      }
    },
    kLinwSubData(val) {
      const [, symbolType, , scale] = val.channel.split('_');
      if (symbolType === this.symbolName.symbol) {
        const data = [val.tick.open, val.tick.close, val.tick.high, val.tick.low, val.tick.vol];
        const dateArr = val.tick.ds.split('-');
        const timeArr = dateArr[2].split(':');
        const time = `${timeArr[0]}:${timeArr[1]}`;
        const date = `${dateArr[1]}-${time}`;
        if (this.dates && this.dates.indexOf(date) === -1) {
          this.dates.push(date);
          this.data.push(data);
          if (scale === '1min') {
            this.lineClosreData.push(data[1]);
          }
          this.volumes.push([
            this.volumes.length,
            val.tick.vol,
            val.tick.open < val.tick.close ? 1 : -1]);
        } else {
          this.data.splice(-1, 1, data);
          if (scale === '1min') {
            this.lineClosreData.splice(-1, 1, data[1]);
          }
          this.volumes.splice(-1, 1, [
            this.volumes.length - 1,
            val.tick.vol, val.tick.open < val.tick.close ? 1 : -1]);
        }
        this.eachart();
      }
    },
    lastTimeS(val, old) {
      if ((val === 'Line' || old === 'Line') && this.myEchartsKline) {
        this.myEchartsKline.clear();
      }
      this.initEachart();
    },
  },
  methods: {
    init() {
      this.$bus.$on('WINFOW_ON_RESIIZE', () => {
        this.myEchartsKline.resize();
      });
      this.$bus.$on('SYMBOL_CURRENT', (val) => {
        this.symbolCurrent = val;
        if (this.myEchartsKline) {
          this.eachart(true);
        }
      });
      this.$bus.$on('LAST-TIMES', (data) => {
        this.lastTimeS = data;
      });
      this.$bus.$on('shrinkBlock', () => {
        if (this.myEchartsKline) {
          this.myEchartsKline.resize();
        }
      });
    },
    eachart(notData) {
      const len = this.dates.length - 1;
      let dates = [];
      if (len < 50) {
        for (let index = 0; index < 100; index += 1) {
          if (this.dates[index]) {
            dates.push(this.dates[index]);
          } else {
            dates.push('');
          }
        }
      } else {
        dates = this.dates;
      }
      if (this.data[len][0] <= this.data[len][1]) {
        this.markPointBgColor = colorMap['u-1-cl'];
      } else {
        this.markPointBgColor = colorMap['u-4-cl'];
      }
      this.myEchartsKline.resize();
      this.isshowLoading = false;
      let series = [];
      let xAxis = [];
      xAxis = [
        {
          data: notData ? '' : dates,
        },
        {
          data: notData ? '' : dates,
        },
      ];
      series = [
        {
          type: 'candlestick',
          name: 'K',
          data: notData ? '' : this.data,
          markPoint: {
            data: [
              {
                yAxis: notData ? '' : this.data[this.data.length - 1][1],
                value: notData ? '' : this.data[this.data.length - 1][1],
                x: `${100.5 - this.gridRightVal}%`,
                symbol: 'circle',
                symbolSize: notData ? 0 : '1',
                label: {
                  show: true,
                  backgroundColor: this.markPointBgColor, // '#717a82',
                  color: '#fff',
                  padding: [2, 2, 2, 2],
                  position: 'right',
                },
              },
            ],
          },
        },
        {
          name: 'MA5',
          type: 'line',
          data: notData ? '' : this.calculateMA(5, this.data),
        },
        {
          name: 'MA10',
          type: 'line',
          data: notData ? '' : this.calculateMA(10, this.data),
        },
        {
          name: 'MA30',
          type: 'line',
          data: notData ? '' : this.calculateMA(30, this.data),
        },
        {
          name: 'Volume',
          data: notData ? '' : this.volumes,
        },
      ];
      if (this.lastTimeS === 'Line') {
        series = [
          {
            name: 'Line',
            type: 'line',
            data: notData ? '' : this.lineClosreData,
          },
          {
            name: 'Volume',
            type: 'bar',
            data: notData ? '' : this.volumes,
          },
        ];
      }
      this.myEchartsKline.setOption({
        xAxis,
        series,
      });
    },
    initEachart() {
      // 基于准备好的dom，初始化echarts实例
      this.myEchartsKline = window.echarts.init(document.getElementById('myEchartsKline'));
      const len = this.dates.length - 1;
      if (this.data[len][0] < this.data[len][1]) {
        this.markPointBgColor = colorMap['u-1-cl'];
      }
      let dates = [];
      if (len > 200) {
        this.dataZoomStart = 60;
      }
      if (len < 200) {
        this.dataZoomStart = 0;
      }
      if (len < 50) {
        for (let index = 0; index < 100; index += 1) {
          if (this.dates[index]) {
            dates.push(this.dates[index]);
          } else {
            dates.push('');
          }
        }
      } else {
        dates = this.dates;
      }
      // 绘制图表
      const KlineOption = {
        legend: {
          show: false,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            lineStyle: {
              type: 'dashed',
            },
          },
          formatter: (params) => {
            this.ishoverFla = true;
            this.tootipData = params;
          },
        },
        axisPointer: {
          link: { xAxisIndex: 'all' },
          label: {
            backgroundColor: colorMap['b-3-bd'],
          },
        },
        dataZoom: [
          {
            type: 'inside',
            xAxisIndex: [0, 1],
            start: this.dataZoomStart,
            end: 100,
            minSpan: 10,
          },
          {
            show: false,
            xAxisIndex: [0, 1],
            type: 'slider',
            start: this.dataZoomStart,
            end: 100,
            minSpan: 10,
          },
        ],
        xAxis: [
          {
            type: 'category',
            data: dates,
            axisLabel: { show: false },
            axisTick: { show: false, interval: 1 },
            axisLine: { lineStyle: { color: colorMap['b-3-bd'] } },
            axisPointer: {
              label: {
                show: false,
              },
            },
          },
          {
            type: 'category',
            axisTick: { show: true, interval: 1 },
            gridIndex: 1,
            data: dates,
            scale: true,
            min: 'dataMin',
            axisLine: { lineStyle: { color: colorMap['b-3-bd'] } },
          },
        ],
        yAxis: [
          {
            position: 'right',
            offset: 5,
            scale: true,
            gridIndex: 0,
            axisLine: { lineStyle: { color: colorMap['b-3-bd'] } },
            splitLine: { show: false },
            boundaryGap: true,
            axisLabel: {
              showMinLabel: false,
            },
          },
          {
            scale: true,
            gridIndex: 1,
            offset: 5,
            splitNumber: 2,
            position: 'right',
            axisLine: { lineStyle: { color: colorMap['b-3-bd'] } },
            splitLine: { show: false },
            boundaryGap: true,
            axisLabel: {
              showMaxLabel: false,
              showMinLabel: false,
              formatter(data) {
                const value = data;
                if (value >= 1000) {
                  return `${value / 1000}k`;
                }
                return value;
              },
            },
          },
        ],
        grid: [
          {
            left: 'left',
            height: '60%',
            bottom: '25%',
            right: `${this.gridRightVal}%`,
          },
          {
            left: 'left',
            bottom: '6%',
            height: '19%',
            right: `${this.gridRightVal}%`,
          },
        ],
        visualMap: {
          show: false,
          seriesIndex: 4,
          dimension: 2,
          pieces: [{
            value: 1,
            color: colorMap['u-1-cl'],
          }, {
            value: -1,
            color: colorMap['u-4-cl'],
          }],
        },
        animation: false,
        series: [
          {
            type: 'candlestick',
            name: 'K',
            data: this.data,
            itemStyle: {
              color: colorMap['u-1-cl'],
              color0: colorMap['u-4-cl'],
              borderColor: colorMap['u-1-cl'],
              borderColor0: colorMap['u-4-cl'],
            },
            markPoint: {
              data: [
                {
                  yAxis: this.data[this.data.length - 1][1],
                  value: this.data[this.data.length - 1][1],
                  x: `${100 - this.gridRightVal}%`,
                  symbol: 'circle',
                  symbolSize: '1',
                  label: {
                    show: true,
                    backgroundColor: this.markPointBgColor, // '#717a82',
                    color: '#fff',
                    padding: [2, 2, 2, 2],
                    position: 'right',
                  },
                },
              ],
            },
          },
          {
            name: 'MA5',
            type: 'line',
            data: this.calculateMA(5, this.data),
            smooth: true,
            showSymbol: false,
            lineStyle: {
              width: 1,
              color: '#F5CB89',
            },
          },
          {
            name: 'MA10',
            type: 'line',
            data: this.calculateMA(10, this.data),
            smooth: true,
            showSymbol: false,
            lineStyle: {
              width: 1,
              color: '#5FCFBF',
            },
          },
          {
            name: 'MA30',
            type: 'line',
            data: this.calculateMA(30, this.data),
            smooth: true,
            showSymbol: false,
            lineStyle: {
              width: 1,
              color: '#DD89F5',
            },
          },
          {
            name: 'Volume',
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: this.volumes,
          },
        ],
      };
      if (this.lastTimeS === 'Line') {
        KlineOption.visualMap = {
          show: false,
          seriesIndex: 1,
          dimension: 2,
          pieces: [{
            value: 1,
            color: colorMap['u-1-cl'],
          }, {
            value: -1,
            color: colorMap['u-4-cl'],
          }],
        };
        KlineOption.series = [
          {
            name: 'Line',
            type: 'line',
            data: this.lineClosreData,
            smooth: true,
            showSymbol: false,
            lineStyle: {
              width: 1,
              color: colorMap['a-12-bd'],
            },
            areaStyle: {
              color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: getHex(colorMap['a-12-bd']),

              }, {
                offset: 1,
                color: colorMap['a-15-bg'],
              }]),
            },
          },
          {
            name: 'Volume',
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: this.volumes,
          },
        ];
      }
      this.myEchartsKline.setOption(KlineOption);
    },
    calculateMA(dayCount, data) {
      const result = [];
      for (let i = 0, len = data.length; i < len; i += 1) {
        if (i >= dayCount) {
          let sum = 0;
          for (let j = 0; j < dayCount; j += 1) {
            sum += data[i - j][1];
          }
          result.push(sum / dayCount);
        } else {
          result.push('-');
        }
      }
      return result;
    },
    KlineLeave() {
      this.ishoverFla = false;
      if (this.data.length && this.myEchartsKline) {
        const len = this.data.length - 1;
        this.seriesData.data = this.data[len];
        const [, vol] = this.volumes[len];
        this.seriesData.vol = vol;
        if (this.calculateMA(5, this.data)[len] !== '-') {
          if (this.calculateMA(5, this.data)[len] !== '-') {
            this.seriesData.MA5 = this.calculateMA(5, this.data)[len].toFixed(4);
          }
          if (this.calculateMA(10, this.data)[len] !== '-') {
            this.seriesData.MA10 = this.calculateMA(5, this.data)[len].toFixed(4);
          }
          if (this.calculateMA(30, this.data)[len] !== '-') {
            this.seriesData.MA30 = this.calculateMA(5, this.data)[len].toFixed(4);
          }
        }
      }
    },
  },
};
