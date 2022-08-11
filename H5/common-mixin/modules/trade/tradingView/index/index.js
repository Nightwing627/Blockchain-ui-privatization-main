import {
  colorMap, getHex, imgMap, getCookie, myStorage,
} from '@/utils';

export default {
  name: 'tradingView',
  data() {
    return {
      TvBoxHeight: 0,
      // 颜色主题
      theme: 'theme_default',
      // 图标类型 TV：1 Echart: 2
      chartType: 1,
      symbolCurrent: myStorage.get('sSymbolName'),
      MywebSocket: null,
      lastTimeS: myStorage.get('lastTimeS'),
      language: getCookie('lan') ? getCookie('lan').split('_')[0] : '',
      lTime: null,
      fTime: 0,
      isCreateWidget: false,
      isshowLoading: false,
      chartTypeHove: null,
      isfullTv: false,
      isfullTvsd: null,
      // 市场横向滚动参数
      slidePosition: 0,
      maxPosition: 0,
      lanArry: ['ar', 'zh_TW', 'zh', 'cs', 'da_DK', 'nl_NL', 'en', 'et_EE', 'fr', 'de', 'el', 'he_IL', 'hu_HU', 'id_ID', 'it', 'ja', 'ko', 'ms_MY', 'no', 'fa', 'pl', 'pt', 'ro', 'ru', 'sk_SK', 'es', 'sv', 'th', 'tr', 'vi'],
      isSubTimerShow: false,
      backgroundImg: `background: url(${imgMap.kz}) right center no-repeat`,
    };
  },
  props: {
    moduleType: {
      type: String,
      default: 'ex',
    },
  },
  computed: {
    templateLayoutType() {
      return this.$store.state.baseData.templateLayoutType;
    },
    baseTimeArry() {
      if (this.$store.state.baseData
        && this.$store.state.baseData.market
        && this.$store.state.baseData.market.klineScale.length) {
        return this.$store.state.baseData.market.klineScale;
      }
      return ['1min', '5min', '15min', '30min', '60min', '4h', '1day', '1week', '1month'];
    },
    subBaseTimeArry() {
      const arr = [];
      this.baseTimeArry.forEach((item, index) => {
        if (index > 4) {
          arr.push(item);
        }
      });
      return arr;
    },
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
    timeArry() {
      const a = [];
      if (this.baseTimeArry.length) {
        this.baseTimeArry.forEach((it) => {
          const t = [];
          if (it.indexOf('min') > -1) {
            t.push(it, parseFloat(it));
          } else if (it.toLowerCase().indexOf('h') > -1 && it.toLowerCase().indexOf('month') === -1) {
            t.push(it, parseFloat(it) * 60);
          } else if (it.indexOf('day') > -1) {
            t.push(it, parseFloat(it) * 24 * 60);
          } else if (it.indexOf('week') > -1) {
            t.push(it, parseFloat(it) * 7 * 24 * 60);
          } else if (it.indexOf('month') > -1) {
            t.push(it, parseFloat(it) * 30 * 24 * 60);
          }
          a.push(t);
        });
      }
      return a;
    },
    // 全部货币对
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },
  },
  methods: {
    mountedInit() {
      if (this.moduleType === 'lever') {
        this.symbolCurrent = myStorage.get('leverSymbolName');
      }
      // 监听TV 是否是全屏状态
      document.removeEventListener('fullscreenchange', this.quitfullTv);
      document.addEventListener('fullscreenchange', this.quitfullTv);
      // 设置国际版TV的高度
      this.setTvBoxHeight();
      this.$bus.$on('WINFOW_ON_RESIIZE', () => {
        // 监听TV 是否是全屏状态
        this.quitfullTv();
        // 设置国际版TV的高度
        this.setTvBoxHeight();
        // 市场 个数的超出宽度
        this.maxPosition = this.$refs.topMenuBox.offsetWidth - this.$refs.topMenuBar.offsetWidth;
        this.slideMarket('left');
      });
      if (this.lanArry.indexOf(this.language) <= -1) {
        this.language = 'en';
      }
      if (!myStorage.get('lastTimeS')) {
        myStorage.set('lastTimeS', '30min');
        this.lastTimeS = '30min';
      }
      // 监听 WebSocket 链接成功
      this.$bus.$on('WEBSOCKET_ON_OPEN', (val) => {
        this.MywebSocket = val;
        if (this.MywebSocket) {
          this.isCreateWidget = false;
          this.init();
        }
      });
      // 获取 当前选中的货币对
      this.$bus.$on('SYMBOL_CURRENT', (val) => {
        if (this.symbolCurrent !== val) {
          if (this.chartType === 1) {
            this.isshowLoading = true;
          }
          this.symbolCurrent = val;
          if (window.tvWidget) {
            window.tvWidget.setSymbol(
              this.symbolName.symbol,
              this.getTimeMin(true, this.lastTimeS), () => {
                this.widget.chart().executeActionById('chartReset');
              },
            );
          }
        }
        this.setTvBoxHeight();
      });
      // 市场 个数的超出宽度
      this.maxPosition = this.$refs.topMenuBox.offsetWidth - this.$refs.topMenuBar.offsetWidth;
    },
    showSubTimer() {
      this.isSubTimerShow = !this.isSubTimerShow;
    },
    setTvBoxHeight() {
      // this.TvBoxHeight = `${setBoxHeight(2.15)}px`;
      let bodyH = document.documentElement.clientHeight;
      if (bodyH < 800) bodyH = 800;
      if (this.templateLayoutType === '2') {
        if (this.moduleType === 'co') {
          this.TvBoxHeight = '100%';
        } else {
          this.TvBoxHeight = `${bodyH - 475}px`;
        }
      } else if (this.showGridFlag && this.lan !== 'zh_CN') {
        this.TvBoxHeight = '375px';
      } else {
        this.TvBoxHeight = '400px';
      }
    },
    enter(index) {
      this.chartTypeHove = index;
    },
    leave() {
      this.chartTypeHove = null;
    },
    chartTypeShow(num) {
      if (this.chartType === num || this.chartTypeHove === num) {
        return true;
      }
      return false;
    },
    init() {
      window.TradingView.onready(this.createWidget());
    },
    // tadingView 生命周期函数
    udf_datafeed() {
      const self = this;
      return {
        onReady(callback) {
          const cnf = {
            supported_resolutions: self.getTimeMin(false, 1), // 数组
            supports_group_request: false,
            supports_marks: true,
            supports_search: false,
            supports_timescale_marks: false,
          };
          setTimeout(() => {
            callback(cnf);
          }, 0);
        },
        // 切换币对后
        resolveSymbol(symbolName, onSymbolResolvedCallback) {
          setTimeout(() => {
            onSymbolResolvedCallback({
              name: symbolName,
              'exchange-traded': '',
              'exchange-listed': '',
              minmov: 1,
              minmov2: 0,
              pointvalue: 1,
              session: '0000-2400:1234567',
              has_intraday: true,
              has_no_volume: false,
              volume_precision: 1,
              description: symbolName.toUpperCase(),
              type: 'bitcoin',
              supported_resolutions: self.getTimeMin(false, 1),
              pricescale: self.fixDepthNumber(self.symbolName.name),
              ticker: symbolName.toUpperCase(),
              timezone: window.jstz.determine().name(),
            });
          }, 0);
        },
        // 获取深度数据（k线无需请求深度）
        calculateHistoryDepth() {
          return undefined;
        },
        // tradingview 获取历史数据
        getBars(symbolInfo,
          resolution,
          from,
          to,
          onHistoryCallback,
          onErrorCallback,
          firstDataRequest) {
          if (firstDataRequest) {
            self.lTime = false;
          }
          const lastTimeS = self.lastTimeS === 'Line' ? '1min' : self.lastTimeS;
          if (self.MywebSocket) {
            self.$bus.$emit('WEBSOCKET_KLINE_SEND', {
              type: 'req',
              symbol: symbolInfo.name,
              lastTimeS,
              lTime: self.lTime,
              number: 300,
            });
          }
          self.$bus.$off('KLINE_DATA_REQ');
          self.$bus.$on('KLINE_DATA_REQ', (data) => {
            const [, symbolType] = data.channel.split('_');
            if (data.event_rep && symbolType === self.symbolName.symbol) {
              const klData = data.data;
              const arrData = [];
              if (data.data.length) {
                klData.forEach((item) => {
                  arrData.push(self.setData(item));
                });
                self.fTime = arrData[arrData.length - 1].time;
                if (self.lTime === klData[0].id) {
                  onHistoryCallback([], { noData: true });
                } else {
                  self.lTime = klData[0].id;
                  onHistoryCallback(arrData);
                }
              } else {
                onHistoryCallback([], { noData: true });
              }
            }
          });
          if (!self.isCreateWidget) {
            self.widget_onChartReady();
            self.widget.chart().setChartType(1);
            // self.widget.headerReady().then(() => {
            //   // self.widget_onChartReady();
            //   // self.widget.chart().setChartType(1);
            // });
          }
        },
        // tradingview 获取实时数据
        subscribeBars(symbolInfo, resolution, onRealtimeCallback) {
          self.isshowLoading = false;
          const lastTimeS = self.lastTimeS === 'Line' ? '1min' : self.lastTimeS;
          if (self.MywebSocket) {
            self.$bus.$emit('WEBSOCKET_KLINE_SEND', {
              type: 'sub',
              symbol: symbolInfo.name,
              lastTimeS,
            });
          }
          self.$bus.$off('KLINE_DATA_SUB');
          self.$bus.$on('KLINE_DATA_SUB', (data) => {
            const [, symbolType] = data.channel.split('_');
            if (data.tick && symbolType === self.symbolName.symbol) {
              const tickData = self.setData(data.tick);
              if (self.fTime < tickData.time) {
                onRealtimeCallback(tickData);
              }
            }
          });
        },
        // tradingview 取消订阅上一 币对 / 刻度
        unsubscribeBars(subscriberUID) {
          const arr = subscriberUID.split('_');
          const symbol = arr[0].toLowerCase();
          const lastTimeS = self.getTimeMin(true, parseFloat(arr[1]));
          self.$bus.$emit('WEBSOCKET_KLINE_SEND', {
            type: 'unsub',
            symbol,
            lastTimeS,
          });
        },
      };
    },
    // 创建 TradingView
    createWidget() {
      class F extends window.TradingView.widget {}
      window.tvWidget = new F({
        debug: false,
        autosize: true,
        timezone: window.jstz.determine().name(),
        symbol: this.symbolName.symbol,
        interval: this.getTimeMin(true, this.lastTimeS),
        container_id: 'tv_chart_container', // DOM id
        datafeed: this.udf_datafeed(), // 配置 声明周期
        library_path: '/static/charting_library/', // 静态文件路径
        locale: this.language, // 语言
        disabled_features: [
          'header_symbol_search',
          'timeframes_toolbar',
          'volume_force_overlay',
          'header_saveload',
          'header_resolutions',
          'header_compare',
          'header_screenshot',
          'header_undo_redo',
          'adaptive_logo',
          'header_fullscreen_button',
          'timezone_menu',
          'scales_context_menu',
          'legend_context_menu',
          'symbol_search_hot_key',
          'header_widget',
          // 'use_localstorage_for_settings',
          // 'show_chart_property_page',
          // 'timeframes_toolbar',
          // 'symbol_info',
          // 'header_widget_dom_node',
          // 'header_indicators',
          // 'header_widget',
          // 'pane_context_menu',
          // 'header_fullscreen_button',
          // 'display_market_status',
          // 'header_chart_type',
        ],
        enabled_features: [
          // 'study_templates',
          'hide_left_toolbar_by_default',
          'move_logo_to_main_pane',
        ],
        charts_storage_url: `${window.location.protocol}//saveload.tradingview.com`,
        charts_storage_api_version: '1.1',
        client_id: 'tradingview.com',
        user_id: 'public_user',
        toolbar_bg: getHex(colorMap['a-6-bg']), // 工具栏底色
        studies_overrides: {
          'volume.volume.color.0': getHex(colorMap['u-4-bg']),
          'volume.volume.color.1': getHex(colorMap['u-1-bg']),
          'volume.volume.transparency': 50,
        },
        overrides: {
          // k线的颜色
          volumePaneSize: 'small', // 成交量大小
          'scalesProperties.fontSize': 12, // 图标区域xy轴 字体大小
          'scalesProperties.textColor': getHex(colorMap['b-3-cl']), // 图标区域xy轴 文字颜色
          'scalesProperties.lineColor': getHex(colorMap['a-3-bd']), // 图标区域xy轴颜色
          'paneProperties.background': getHex(colorMap['a-6-bg']), // 图标区域 背景色
          'paneProperties.vertGridProperties.color': getHex(colorMap['a-7-bg']), // 图标区域 表格纵轴颜色
          'paneProperties.horzGridProperties.color': getHex(colorMap['a-7-bg']), // 图标区域 表格橫轴颜色
          'paneProperties.crossHairProperties.color': getHex(colorMap['b-2-bg']), // 图标区域 鼠标十字线颜色
          'paneProperties.legendProperties.showLegend': false, // 折叠信息
          // 柱状图颜色设置
          'mainSeriesProperties.candleStyle': {
            upColor: getHex(colorMap['u-1-cl']),
            downColor: getHex(colorMap['u-4-cl']),
            drawBorder: true,
            borderColor: '',
            borderUpColor: getHex(colorMap['u-1-cl']),
            borderDownColor: getHex(colorMap['u-4-cl']),
            drawWick: true,
            wickColor: '#fff',
            wickUpColor: getHex(colorMap['u-1-cl']),
            wickDownColor: getHex(colorMap['u-4-cl']),
            barColorsOnPrevClose: !1,
          },
          // 分时图颜色设置
          // 分时背景色渐变 上半部分
          'mainSeriesProperties.areaStyle.color1': colorMap['a-15-bg'],
          // 分时背景色渐变 下半部分
          'mainSeriesProperties.areaStyle.color2': colorMap['a-17-bg'],
          'mainSeriesProperties.areaStyle.linecolor': getHex(colorMap['a-12-bd']),
          'mainSeriesProperties.areaStyle.linestyle': 0,
          'mainSeriesProperties.areaStyle.linewidth': 2,
          'mainSeriesProperties.areaStyle.priceSource': 'close',
        },
      });
      this.widget = window.tvWidget;
    },
    // 格式化时间刻度
    getTimeMin(only, type) {
      if (only) {
        let t = null;
        if (this.timeArry.length) {
          this.timeArry.forEach((item) => {
            const s = item.indexOf(type);
            if (s > -1) {
              t = s === 0 ? item[1] : item[0];
            }
          });
        }
        return t;
      }
      const t = [];
      this.timeArry.forEach((item) => {
        t.push(item[type]);
      });
      return t;
    },
    // 精度计算
    fixDepthNumber(symbolName) {
      const n = this.symbolAll[symbolName].price;
      const b = 10 ** n;
      return parseFloat(b.toString());
    },
    widget_onChartReady() {
      this.isCreateWidget = true;
      this.creatMA();
      // ===== 默认样式皮肤修改 =====
      const style = document.createElement('style');
      /* eslint-disable */
      const clas = document.createTextNode('.chart-page .chart-container{}.apply-common-tooltip,.wrap-1GG7GnNO- svg{fill:' + colorMap['b-3-cl'] + '!important;color:' + colorMap['b-3-cl'] + '!important;cursor: pointer;}.textColor .wrap-18oKCBRc- div,.wrap-18oKCBRc- .apply-common-tooltip:hover,.wrap-1GG7GnNO- svg:hover,.button-263WXsg--.isActive-2mI1-NUL- .icon-1Y-3MM9F-,.button-263WXsg-- .icon-1Y-3MM9F-:hover{fill:' + colorMap['a-1-cl'] + '!important;color:' + colorMap['a-1-cl'] + '!important;}.container-3_8ayT2Q- .background-Q1Fcmxly-{fill: ' + colorMap['b-2-cl'] + '; stroke: ' + colorMap['b-2-cl'] + ';}.container-3_8ayT2Q- .arrow-WcYWFXUn-, html.theme-dark .container-3_8ayT2Q- .arrow-WcYWFXUn-{stroke: ' + colorMap['b-1-cl'] + ';}.feature-no-touch .container-3_8ayT2Q-:hover .background-Q1Fcmxly-{fill: ' + colorMap['a-1-cl'] + ';stroke: ' + colorMap['a-1-cl'] + ';}')
      /* eslint-enable */
      style.append(clas);
      this.widget.createButton().append(style);
    },
    creatMA() {
      // ===== 创建移动均线 =====
      this.widget.chart().createStudy('Moving Average', false, false, [5], null, { 'plot.color': '#9660c4' });
      this.widget.chart().createStudy('Moving Average', false, false, [10], null, { 'plot.color': '#84aad5' });
      this.widget.chart().createStudy('Moving Average', false, false, [20], null, { 'plot.color': '#55b263' });
    },
    setMAShow() {
      // ===== 显示移动均线 =====
      const c = this.widget.chart().getAllStudies();
      this.widget.chart().setEntityVisibility(c[0].id, true);
      this.widget.chart().setEntityVisibility(c[1].id, true);
      this.widget.chart().setEntityVisibility(c[2].id, true);
    },
    setMAHide() {
      // ===== 隐藏移动均线 =====
      const c = this.widget.chart().getAllStudies();
      this.widget.chart().setEntityVisibility(c[0].id, false);
      this.widget.chart().setEntityVisibility(c[1].id, false);
      this.widget.chart().setEntityVisibility(c[2].id, false);
    },
    timeClike(v) {
      this.isSubTimerShow = false;
      if (v !== 'Line' && v !== '1min' && v !== this.lastTimeS) {
        this.isshowLoading = true;
      }
      if (v !== this.lastTimeS) {
        this.lastTimeS = v;
        if (v === 'Line') {
          myStorage.set('lastTimeS', '1min');
        } else {
          myStorage.set('lastTimeS', v);
        }
        if (this.isCreateWidget) {
          const resolution = this.widget.chart().resolution();
          if (v === 'Line') {
            if (resolution !== '1') {
              this.widget.chart().setResolution('1', () => {
                this.widget.chart().setChartType(3); // 折线图
              });
            } else if (resolution === '1') {
              this.widget.chart().setChartType(3);
            }
            this.setMAHide();
          } else {
            if (resolution === '1' && v === '1min') {
              this.widget.chart().setChartType(1); // 蜡烛图
            } else {
              const timeS = this.getTimeMin(true, v);
              this.widget.chart().setResolution(timeS.toString(), () => {
                this.widget.chart().setChartType(1);
                this.widget.chart().executeActionById('chartReset');
              });
            }
            this.setMAShow();
          }
        }
      }
    },
    // 格式化数据
    setData(obj) {
      return {
        time: obj.id * 1000,
        close: obj.close,
        open: obj.open,
        high: obj.high,
        low: obj.low,
        volume: obj.vol,
      };
    },
    switchChartType(type) {
      if (type === 2) {
        this.isshowLoading = false;
      }
      this.chartType = type;
    },
    quit(e) {
      this.isfullTv = false;
      if (this.isfullTv) {
        const key = e.keyCode;
        if (key === 27) {
          this.isfullTv = false;
        }
      }
    },
    fullTv() {
      if (!this.isfullTv) {
        this.isfullTv = true;
        const element = this.$refs.tv_chart_container;
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
        }
      } else {
        this.isfullTv = false;
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    },
    quitfullTv() {
      // 监听TV 是否是全屏状态
      if (this.isfullTv) {
        this.isfullTv = window.fullScreen
          || document.webkitIsFullScreen
          || document.msFullscreenElement;
      }
    },
    // 设置时间刻度的滚动
    slideMarket(type) {
      let position = parseFloat(this.slidePosition);
      if (type === 'left') {
        position += this.$refs.topMenuBar.offsetWidth / 2;
        if (position > 0) {
          position = 0;
        }
      } else {
        position -= this.$refs.topMenuBar.offsetWidth / 2;
        if (position < -this.maxPosition) {
          position = -this.maxPosition;
        }
      }
      this.slidePosition = `${position}px`;
    },
  },
  beforeDestroy() {
    this.MywebSocket = false;
  },
};
