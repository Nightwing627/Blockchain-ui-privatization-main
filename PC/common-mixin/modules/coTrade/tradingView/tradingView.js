import {
  myStorage,
  getCookie,
  colorMap,
  getHex,
  imgMap,
  logImg,
  getScript,
  nul,
} from '@/utils';

export default {
  name: 'tradingView',
  data() {
    return {
      TvBoxHeight: '697px',
      // 颜色主题
      theme: 'theme_default',
      // 图标类型 TV：1 Echart: 2
      chartType: 1,
      MywebSocket: null,
      lastTimeS: myStorage.get('lastTimeS'),
      timeLable: myStorage.get('lastTimeS'),
      language: getCookie('lan') ? getCookie('lan').split('_')[0] : '',
      lTime: null,
      fTime: 0,
      isCreateWidget: false,
      isshowLoading: true,
      maskBg: true,
      chartTypeHove: null,
      loadingEchart: false,
      isfullTv: false,
      isfullTvsd: null,
      echartLoaded: false,
      // 市场横向滚动参数
      slidePosition: 0,
      maxPosition: 0,
      lanArry: [
        'ar',
        'zh_TW',
        'zh',
        'cs',
        'da_DK',
        'nl_NL',
        'en',
        'et_EE',
        'fr',
        'de',
        'el',
        'he_IL',
        'hu_HU',
        'id_ID',
        'it',
        'ja',
        'ko',
        'ms_MY',
        'no',
        'fa',
        'pl',
        'pt',
        'ro',
        'ru',
        'sk_SK',
        'es',
        'sv',
        'th',
        'tr',
        'vi',
      ],
      // 合约全部币对
      coSymbolAll: null,
      // 是否是移动端
      isMobile: window.isMobile,
      // 隐藏K线工具选项
      disabled_features_arr: [
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
        // 'header_settings',
        // 'header_widget',
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
    };
  },
  computed: {
    // 当前合约币对
    symbolCurrent() {
      return this.$store.state.future.coTypeSymbol;
    },
    // 数量单位类型Number（1标的货币 2张）
    coUnitType() {
      return this.$store.state.future.coUnitType;
    },
    // 当前合约面值
    multiplier() {
      return Number(this.$store.state.future.multiplier);
    },
    // 当前币对价格精度
    pricefix() {
      return this.$store.state.future.pricefix;
    },
    klineLogo() {
      return imgMap.tradingViewLogo || '';
    },
    templateLayoutType() {
      return this.$store.state.baseData.templateLayoutType;
    },
    baseTimeArry() {
      try {
        return this.$store.state.baseData.market.klineScale;
      } catch (w) {
        return [
          '1min',
          '5min',
          '15min',
          '30min',
          '60min',
          '4h',
          '1day',
          '1week',
          '1month',
        ];
      }
    },
    timeArry() {
      const a = [];
      if (this.baseTimeArry.length) {
        this.baseTimeArry.forEach((it) => {
          const t = [];
          if (it.indexOf('min') > -1) {
            t.push(it, parseFloat(it));
          } else if (
            it.toLowerCase().indexOf('h') > -1
            && it.indexOf('month') < 0
          ) {
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
    // 币币and杠杆 全部货币对
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },
    themeTV() {
      const theme = getCookie('cusSkin') || getCookie('defSkin') || '1';
      const stheme = theme.toString() === '1' ? 'Dark' : 'Light';
      return 'Light';
    },
  },
  watch: {
    symbolCurrent(val, old) {
      if (val && old) {
        if (this.chartType === 1) {
          this.isshowLoading = true;
        }
        if (window.tvWidget) {
          const arr = this.symbolCurrent.split('_');
          let symbolCurrent = arr[1];
          if (arr && arr.length) {
            if (arr[0] !== 'e' && arr[0] !== 's') {
              symbolCurrent = `${arr[1]}-${arr[0]}`;
            }
          }
          window.tvWidget.setSymbol(
            symbolCurrent,
            this.getTimeMin(true, this.lastTimeS),
            () => {
              this.widget.chart().executeActionById('chartReset');
            },
          );
        }
      }
    },
    coUnitType(val, old) {
      if (val && old) {
        if (this.chartType === 1) {
          this.isshowLoading = true;
        }
        if (this.lastTimeS === 'Line') {
          this.lastTimeS = '1min';
        }
        if (window.tvWidget) {
          this.widget.setLanguage(this.language);
          setTimeout(() => {
            this.creatMA();
          }, 1000);
        }
      }
    },
  },
  methods: {
    init() {
      // 监听TV 是否是全屏状态
      document.removeEventListener('fullscreenchange', this.quitfullTv);
      document.addEventListener('fullscreenchange', this.quitfullTv);

      if (this.lanArry.indexOf(this.language) <= -1) {
        this.language = 'en';
      }
      if (getCookie('lan') === 'el_GR') {
        this.language = 'zh_TW';
      }
      if (!myStorage.get('lastTimeS')) {
        myStorage.set('lastTimeS', '1day');
        this.lastTimeS = '1day';
      }
      // 监听 WebSocket 链接成功
      this.$bus.$on('WEBSOCKET_ON_OPEN', (val) => {
        this.MywebSocket = JSON.parse(JSON.stringify(val));
        if (this.MywebSocket) {
          this.isCreateWidget = false;
          this.initTradingView();
        }
      });

      // 隐藏loading
      this.$bus.$on('HIDE_LOADING', () => {
        this.isshowLoading = false;
      });
      // 市场 个数的超出宽度
      // this.maxPosition = this.$refs.topMenuBox.offsetWidth - this.$refs.topMenuBar.offsetWidth;
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
    initTradingView() {
      this.createWidget();
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
              pricescale: self.fixDepthNumber(),
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
        getBars(
          symbolInfo,
          resolution,
          from,
          to,
          onHistoryCallback,
          onErrorCallback,
          firstDataRequest,
        ) {
          if (firstDataRequest) {
            self.lTime = false;
          }
          const lastTimeS = self.lastTimeS === 'Line' ? '1min' : self.lastTimeS;
          if (self.MywebSocket) {
            self.$bus.$emit('WEBSOCKET_KLINE_SEND', {
              type: 'req',
              symbol: self.symbolCurrent,
              lastTimeS,
              lTime: self.lTime,
              number: 50,
            });
          }
          self.$bus.$off('KLINE_DATA_REQ');
          self.$bus.$on('KLINE_DATA_REQ', (data) => {
            const wsData = JSON.parse(data);
            self.fTime = 0;
            const channelArr = wsData.channel.split('_');
            const Ntime = channelArr[channelArr.length - 1];
            const [, type, symbol] = wsData.channel.split('_');
            const symbolType = `${type}_${symbol}`;
            if (symbolType === self.symbolCurrent && lastTimeS === Ntime) {
              const klData = wsData.data;
              const arrData = [];
              if (klData && klData.length) {
                klData.forEach((item) => {
                  arrData.push(self.setData(item));
                });
                if (firstDataRequest) {
                  self.fTime = arrData[arrData.length - 1].time;
                }
                if (self.lTime === klData[0].id) {
                  onHistoryCallback([], { noData: true });
                  logImg({
                    host: window.location.host,
                    type: 'onHistoryCallback',
                    path: window.location.href,
                    ds: 'onHistoryCallback noDate',
                    data: {
                      symbol: self.symbolCurrent,
                    },
                    t: new Date().getTime(),
                  });
                } else {
                  self.lTime = klData[0].id;
                  onHistoryCallback(arrData);
                }
              } else {
                if (self.secend < 3) {
                  self.udf_datafeed().getBars(
                    symbolInfo,
                    resolution,
                    from,
                    to,
                    onHistoryCallback,
                    onErrorCallback,
                    firstDataRequest,
                  );
                  self.secend += 1;
                  return;
                }
                if (!self.lTime) {
                  logImg({
                    host: window.location.host,
                    type: 'tradingView',
                    path: window.location.href,
                    ds: 'first onHistoryCallback noData',
                    data,
                    t: new Date().getTime(),
                  });
                }
                onHistoryCallback([], { noData: true });
              }
            }
          });
          if (!self.isCreateWidget) {
            self.widget_onChartReady();
            self.widget.chart().setChartType(1);
          }
        },
        // tradingview 获取实时数据
        subscribeBars(symbolInfo, resolution, onRealtimeCallback) {
          self.isshowLoading = false;
          self.maskBg = false;
          const lastTimeS = self.lastTimeS === 'Line' ? '1min' : self.lastTimeS;
          if (self.MywebSocket) {
            self.$bus.$emit('WEBSOCKET_KLINE_SEND', {
              type: 'sub',
              symbol: self.symbolCurrent,
              lastTimeS,
            });
          }
          self.$bus.$off('KLINE_DATA_SUB');
          self.$bus.$on('KLINE_DATA_SUB', (data) => {
            const wsData = JSON.parse(data);
            // console.log('实时数据', wsData);
            const channelArr = wsData.channel.split('_');
            const Ntime = channelArr[channelArr.length - 1];
            const [, type, symbol] = wsData.channel.split('_');
            const symbolType = `${type}_${symbol}`;
            if (
              wsData.tick
              && Ntime === lastTimeS
              && symbolType === self.symbolCurrent
            ) {
              const tickData = self.setData(wsData.tick);
              if (self.fTime < tickData.time) {
                onRealtimeCallback(tickData);
              }
            }
          });
        },
        // tradingview 取消订阅上一 币对 / 刻度
        unsubscribeBars(subscriberUID) {
          const arr = subscriberUID.split('_');
          const symbol = `${arr[0]}_${arr[1]}`;
          self.$bus.$emit('WEBSOCKET_KLINE_SEND', {
            type: 'unsub',
            symbol: symbol.toLowerCase(),
            lastTimeS: self.getTimeMin(true, parseFloat(arr[2])),
          });
        },
      };
    },
    // 创建 TradingView
    createWidget() {
      class F extends window.TradingView.widget {}
      if (this.symbolCurrent) {
        const symbolCurrent = this.symbolCurrent.split('_')[1];
        window.tvWidget = new F({
          debug: false,
          autosize: true,
          timezone: window.jstz.determine().name(),
          symbol: symbolCurrent,
          interval: this.getTimeMin(true, this.lastTimeS),
          container_id: 'tv_chart_container', // DOM id
          datafeed: this.udf_datafeed(), // 配置 生命周期
          library_path: '/static/charting_library/', // 静态文件路径
          locale: this.language, // 语言
          disabled_features: this.disabled_features_arr,
          enabled_features: [
          // 'study_templates',
            'hide_left_toolbar_by_default',
          ],
          charts_storage_url: `${window.location.protocol}//saveload.tradingview.com`,
          charts_storage_api_version: '1.1',
          client_id: 'tradingview.com',
          user_id: 'public_user',
          toolbar_bg: '#fff', // 工具栏底色
          theme: this.themeTV,
          studies_overrides: {
            'volume.volume.color.0': getHex(colorMap['u-4-bg']),
            'volume.volume.color.1': getHex(colorMap['u-1-bg']),
            'volume.volume.transparency': 50,
          },
          overrides: {
          // k线的颜色
            volumePaneSize: 'small', // 成交量大小
            'scalesProperties.fontSize': 12, // 图标区域xy轴 字体大小
            'scalesProperties.textColor': '#A7B4CB', // 图标区域xy轴 文字颜色
            'scalesProperties.lineColor': '#A7B4CB', // 图标区域xy轴颜色
            'paneProperties.background': '#fff', // 图标区域 背景色
            'paneProperties.vertGridProperties.color': '#fff', // 图标区域 表格纵轴颜色
            'paneProperties.horzGridProperties.color': '#fff', // 图标区域 表格橫轴颜色
            'paneProperties.crossHairProperties.color': getHex(
              colorMap['b-2-bg'],
            ), // 图标区域 鼠标十字线颜色
            'paneProperties.legendProperties.showLegend': true, // 折叠信息
            // 柱状图颜色设置
            'mainSeriesProperties.candleStyle.upColor': '#52CC8A',
            'mainSeriesProperties.candleStyle.downColor': '#FF4E4E',
            'mainSeriesProperties.candleStyle.drawWick': true,
            'mainSeriesProperties.candleStyle.drawBorder': true,
            'mainSeriesProperties.candleStyle.borderColor': '',
            'mainSeriesProperties.candleStyle.borderUpColor': '#52CC8A',
            'mainSeriesProperties.candleStyle.borderDownColor': '#FF4E4E',
            'mainSeriesProperties.candleStyle.wickUpColor': '#52CC8A',
            'mainSeriesProperties.candleStyle.wickDownColor': '#FF4E4E',
            'mainSeriesProperties.candleStyle.barColorsOnPrevClose': !1,
            // 分时图颜色设置
            // 分时背景色渐变 上半部分
            'mainSeriesProperties.areaStyle.color1': colorMap['a-15-bg'],
            // 分时背景色渐变 下半部分
            'mainSeriesProperties.areaStyle.color2': colorMap['a-17-bg'],
            'mainSeriesProperties.areaStyle.linecolor': getHex(
              colorMap['a-12-bd'],
            ),
            'mainSeriesProperties.areaStyle.linestyle': 0,
            'mainSeriesProperties.areaStyle.linewidth': 2,
            'mainSeriesProperties.areaStyle.priceSource': 'close',
          },
        });
        this.widget = window.tvWidget;
      }
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
    fixDepthNumber() {
      const b = 10 ** this.pricefix;
      return parseFloat(b.toString());
    },
    widget_onChartReady() {
      this.isCreateWidget = true;
      this.creatMA();
      // ===== 默认样式皮肤修改 =====
      const style = document.createElement('style');
      /* eslint-disable */
      const clas = document.createTextNode(
        ".apply-common-tooltip,.wrap-1GG7GnNO- svg{fill:" +
          colorMap["b-3-cl"] +
          "!important;color:" +
          colorMap["b-3-cl"] +
          "!important;cursor: pointer;}.textColor .wrap-18oKCBRc- div,.wrap-18oKCBRc- .apply-common-tooltip:hover,.wrap-1GG7GnNO- svg:hover,.button-263WXsg--.isActive-2mI1-NUL- .icon-1Y-3MM9F-,.button-263WXsg-- .icon-1Y-3MM9F-,.button-263WXsg-- .icon-1Y-3MM9F-:hover{fill:" +
          colorMap["a-1-cl"] +
          "!important;color:" +
          colorMap["a-1-cl"] +
          "!important;}.container-3_8ayT2Q- .background-Q1Fcmxly-{fill: " +
          colorMap["b-2-cl"] +
          "; stroke: " +
          colorMap["b-2-cl"] +
          ";}.container-3_8ayT2Q- .arrow-WcYWFXUn-, html.theme-dark .container-3_8ayT2Q- .arrow-WcYWFXUn-{stroke: " +
          colorMap["b-1-cl"] +
          ";}.feature-no-touch .container-3_8ayT2Q-:hover .background-Q1Fcmxly-{fill: " +
          colorMap["a-1-cl"] +
          ";stroke: " +
          colorMap["a-1-cl"] +
          ";}" + ".wrap-3tiHesTk- {position: absolute; right: 0;height: 66px !important;background: none !important;}" + ".layout__area--top, .overflowWrap-PWdgT-U_-{height: 66px!important;}"
      );
    /* eslint-enable */
      style.append(clas);
      this.widget.headerReady().then(() => {
        this.widget.createButton().append(style);
      });
    },
    creatMA() {
      // ===== 创建移动均线 =====
      this.widget
        .chart()
        .createStudy('Moving Average', false, false, [5], null, {
          'plot.color': '#F5CB89',
        });
      this.widget
        .chart()
        .createStudy('Moving Average', false, false, [10], null, {
          'plot.color': '#5FCFBF',
        });
      this.widget
        .chart()
        .createStudy('Moving Average', false, false, [30], null, {
          'plot.color': '#DD89F5',
        });
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
        this.$bus.$emit('LAST-TIMES', v);
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
      let volume = obj.vol;
      if (this.coUnitType === 1) {
        volume = nul(obj.vol, this.multiplier);
      }

      return {
        time: obj.id * 1000,
        close: obj.close,
        open: obj.open,
        high: obj.high,
        low: obj.low,
        volume,
      };
    },
    setChartType(type) {
      this.chartType = type;
      setTimeout(() => {
        const { topMenuBox = null, topMenuBar = null } = this.$refs;
        this.maxPosition = topMenuBox.offsetWidth - topMenuBar.offsetWidth;
      }, 500);
    },
    switchChartType(type) {
      if (type === 2) {
        if (!window.echarts && !this.loadingEchart) {
          this.loadingEchart = true;
          getScript(`${process.env.BASE_URL}static/js/echarts.min.js`).then(() => {
            this.loadingEchart = false;
            this.isshowLoading = false;
            this.echartLoaded = true;
            this.setChartType(type);
          });
        } else {
          this.setChartType(type);
        }
      } else {
        this.setChartType(type);
      }
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
      if (this.$refs.topMenuBar) {
        if (type === 'left') {
          position += this.$refs.topMenuBar.offsetWidth / 2;
          if (position > 0) {
            position = 0;
          }
        } else {
          const { topMenuBox = null, topMenuBar = null } = this.$refs;
          this.maxPosition = topMenuBox.offsetWidth - topMenuBar.offsetWidth;
          position -= this.$refs.topMenuBar.offsetWidth / 2;
          if (position < -this.maxPosition) {
            position = -this.maxPosition;
          }
        }
        this.slidePosition = `${position}px`;
      }
    },
  },

};
