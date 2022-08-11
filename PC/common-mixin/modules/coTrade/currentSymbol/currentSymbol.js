import {
  nul, fixD, division, thousandsComma, getCookie, myStorage,
} from '@/utils';

export default {
  name: 'currentSymbol',
  components: {
  },
  data() {
    return {
      // 24小时行情数据
      WsData: {},
      // 是否显示市场
      isShowMarket: false,
      // 是否显示 合约设置弹框
      setFuturesIsShow: false,

      // 下次收取资金费率开始时间戳
      nextStartTime: null,
      // 下次收取资金费率开始时间倒计时
      countDownTime: null,
      // 倒计时
      setIntervalTimer: null,
      // 当前价格颜色的Class
      activePriceClass: '',
      // 轮训倒计时
      timer: null,
      // 本期结算时间
      activeTimer: null,
      // 下期结算时间
      nextTimer: null,
      // 当前合约市场id
      contractSide: myStorage.get('futuresMarketCurrent'),
    };
  },
  computed: {
    lantext() {
      return {
        explain1: this.$t('futures.currentSymbol.explain1'),
        explain4: this.$t('futures.currentSymbol.explain4'),
      };
    },
    // 是否登录
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    // 当前合约信息
    contractInfo() {
      return this.$store.state.future.contractInfo;
    },
    // 资金费率间隔
    capitalFrequency() {
      if (this.contractInfo) {
        return this.contractInfo.capitalFrequency;
      }
      return 1;
    },
    // 当前合约名称
    activeContractName() {
      let name = '';
      let text = '';
      if (this.contractInfo) {
        const nameText = this.contractInfo.symbol ? this.contractInfo.symbol.replace('-', '') : '';
        if (this.contractInfo.contractType !== 'E') {
          text = `-${this.contractInfo.marginCoin}`;
        }
        name = `${nameText}${text}`;
      }
      return name;
    },
    // 当前合约面值
    multiplier() {
      return Number(this.$store.state.future.multiplier);
    },
    // 合约数量单位
    coUnit() {
      return this.$store.state.future.coUnit;
    },
    // 数量单位类型Number
    coUnitType() {
      return this.$store.state.future.coUnitType;
    },
    // 合约数量精度
    volfix() {
      return this.$store.state.future.volfix;
    },
    // 合约币对价格精度
    pricefix() {
      return this.$store.state.future.pricefix;
    },
    // 合约类型列表
    contractTypeText() {
      return this.$store.state.future.contractTypeText;
    },
    // 用户配置信息
    userConfig() {
      return this.$store.state.future.futureUserConfig;
    },
    // 当前合约保证金模式
    marginModel() {
      if (this.userConfig) {
        // 全仓 ： 逐仓
        return this.userConfig.marginModel === 1
          ? this.$t('futures.currentSymbol.marginModel1')
          : this.$t('futures.currentSymbol.marginModel2');
      }
      return this.$t('futures.currentSymbol.marginModel1');
    },
    // 当前合约杠杆倍数
    nowLevel() {
      if (this.userConfig) {
        return this.userConfig.nowLevel || '20';
      }
      return '20';
    },
    // 获取服务器和本地的时间差
    serveTimeDiff() {
      return this.$store.state.future.serveTimeDiff;
    },
    // 标记价格、指数价格、资金费率
    publicMarkertInfo() {
      const { publicMarkertInfo } = this.$store.state.future;
      if (publicMarkertInfo) {
        return {
          // 标记价格
          tagPrice: this.fixPrice(publicMarkertInfo.tagPrice),
          // 资金费率下次
          nextFundRate: this.fundRate(publicMarkertInfo.nextFundRate),
          // 指数价格
          indexPrice: this.fixPrice(publicMarkertInfo.indexPrice),
          // 本期资金费率
          currentFundRate: this.fundRate(publicMarkertInfo.currentFundRate),
        };
      }
      return {
        tagPrice: '--',
        nextFundRate: '--',
        currentFundRate: '--',
        indexPrice: '--',
      };
    },
    // 当前合约24小时行情数据
    activeWsData() {
      let obj = {
        close: '--',
        rose: '--',
        vol: '--',
        roseClass: '',
      };
      if (this.contractInfo && this.WsData) {
        const key = this.contractInfo.wsDatakey;
        if (this.WsData[key]) {
          const data = this.WsData[key];
          // 关闭当前合约价格
          this.$bus.$emit('ACTIVE_CONTRACT_PRICE', data.close);
          let { vol } = data;
          let roseClass = '';
          let slie = '';
          const val = parseFloat(data.rose, 0);
          if (val > 0) {
            roseClass = 'u-1-bg';
            slie = '+';
          }
          if (val < 0) {
            roseClass = 'u-4-bg';
            slie = '-';
          }
          if (val === 0) {
            roseClass = 'b-2-bg';
            slie = '-';
          }
          // 标的货币
          if (this.coUnitType === 1) {
            vol = fixD(nul(vol, this.multiplier), 0);
          }
          obj = {
            close: this.fixPrice(data.close),
            rose: `${slie}${this.fixdRose(data.rose)}`,
            vol,
            roseClass,
          };
        }
      }
      return obj;
    },
    publicInfo() {
      if (this.$store.state && this.$store.state.baseData) {
        return this.$store.state.baseData.publicInfo;
      }
      return null;
    },
    typeTabList() {
      console.log(this.contractSide);
      if (this.contractSide === 1) {
        return this.$t('futures.market.text4'); // 'USDT合约',
      }
      if (this.contractSide === 0) {
        return this.$t('futures.market.text5'); // '币本位合约',
      }
      if (this.contractSide === 2) {
        return this.$t('futures.market.text6'); // '混合合约',
      }
      return this.$t('futures.market.text7'); // '模拟合约',
    },
    // 页面标题title
    documentTitle() {
      const lang = getCookie('lan');
      let str = '';
      if (this.publicInfo) {
        const { indexHeaderTitle, seo } = this.publicInfo;
        let title = '';
        if (indexHeaderTitle) {
          if (lang) {
            title = seo.title || indexHeaderTitle[lang];
          } else {
            const lan = this.publicInfo.lan.defLan;
            title = seo.title || indexHeaderTitle[lan];
          }
        }
        str = `${this.activeWsData.close}-${this.activeContractName} ${this.typeTabList} | ${title}`;
      }
      return str;
    },
  },
  watch: {
    // 页面标题title
    documentTitle(val) {
      document.title = val;
    },
    // 当前价格变化
    activeWsData(val, old) {
      if (val && old) {
        if (val.close !== '--' || old.close !== '--') {
          const newP = parseFloat(val.close, 0);
          const oldP = parseFloat(old.close, 0);
          if (newP > oldP) {
            this.activePriceClass = 'u-1-cl';
          } else if (newP < oldP) {
            this.activePriceClass = 'u-4-cl';
          } else if (newP !== oldP) {
            this.activePriceClass = '';
          }
        } else if (val !== old) {
          this.activePriceClass = '';
        }
      }
      this.$bus.$emit('activeWsData', { close: val.close, class: this.activePriceClass });
    },
    contractInfo(val) {
      if (val) {
        // 设置 资金费率倒计时
        this.setNextStartTime();
      }
    },
  },
  methods: {
    // 新价精度
    fixPrice(value) {
      if (value) {
        return fixD(value, this.pricefix);
      }
      return '--';
    },
    // 数量精度
    fixVol(value) {
      if (value) {
        return fixD(value, this.volfix);
      }
      return '--';
    },
    // 处理涨跌幅
    fixdRose(value) {
      if (value) {
        const num = Math.abs((value * 10000) / 100);
        return `${Number(num.toString().match(/^\d+(?:\.\d{0,2})?/))}`;
      }
      return '00.00';
    },
    // 处理资金费率
    fundRate(value) {
      if (value === 0) {
        return value;
      }
      if (value) {
        let slie;
        const val = parseFloat(value, 0);
        if (val > 0) {
          slie = '+';
        }
        if (val < 0) {
          slie = '-';
        }
        const num = Math.abs((value * 10000) / 100);
        // return `${slie}${Number(num.toString().match(/^\d+(?:\.\d{0,5})?/))}`;
        return `${slie}${fixD(num, 5)}`;
      }
      return '--';
    },
    // 设置下次收取资金费率开始时间戳
    setNextStartTime() {
      if (this.contractInfo) {
        // 开始时间
        let Time = this.contractInfo.capitalStartTime;
        // 一天结算次数
        const Len = division(24, this.capitalFrequency);
        // 当前时间戳
        const serverTime = new Date().getTime() + this.serveTimeDiff;
        // 当前时间的小时数
        const NowH = new Date(serverTime).getHours();
        // 当天的的0点时间戳
        const TNS = new Date(new Date(serverTime).toLocaleDateString()).getTime();
        for (let index = 0; index < Len; index += 1) {
          if (NowH >= Time) {
            Time += this.capitalFrequency;
          }
        }

        // 本期结算时间
        this.activeTimer = Time > 9 ? `${Time}:00` : `0${Time}:00`;
        // 下期结算时间
        let nextTimer = Time + this.capitalFrequency;
        if (nextTimer > 24) {
          nextTimer -= 24;
        }
        if (nextTimer < 9) {
          nextTimer = `0${nextTimer}`;
        }
        this.nextTimer = `${nextTimer}:00`;
        this.nextStartTime = nul(Time, 3600000) + TNS;
        this.countdown();
      }
    },
    // 设置倒计时
    countdown() {
      clearInterval(this.setIntervalTimer);
      this.setIntervalTimer = setInterval(() => {
        // 获取当前时间
        const nowtime = new Date().getTime() + this.serveTimeDiff;
        const lefttime = this.nextStartTime - nowtime; // 距离结束时间的毫秒数
        if (lefttime > 0) {
          let lefth = Math.floor(division(lefttime, 3600000) % 24); // 计算小时数
          let leftm = Math.floor(division(lefttime, 60000) % 60); // 计算分钟数
          let lefts = Math.floor(division(lefttime, 1000) % 60); // 计算秒数
          lefth = lefth < 10 ? `0${lefth}` : lefth;
          leftm = leftm < 10 ? `0${leftm}` : leftm;
          lefts = lefts < 10 ? `0${lefts}` : lefts;
          this.countDownTime = `${lefth}:${leftm}:${lefts}`; // 返回倒计时的字符串
        } else {
          this.setNextStartTime();
        }
      }, 1000);
    },
    // 开启弹框
    showDialog(type) {
      // 显示开通合约交易弹框
      if (this.userConfig && !this.userConfig.openContract) {
        this.$bus.$emit('OPEN_FUTURE');
        return false;
      }
      if (this.isLogin) {
        this.$store.dispatch('getUserConfig');
      }
      this[type] = true;
      return false;
    },
    // 关闭弹窗
    closeDialog() {
      // 关闭市场
      this.isShowMarket = false;
      // 关闭合约设置弹窗
      this.setFuturesIsShow = false;
      // 关闭杠杆弹窗
      this.leverageDialogShow = false;
      // 关闭切换保证金模式弹框
      this.depositDialogShow = false;
    },
    // 关闭市场
    onClickOutside() {
      this.isShowMarket = false;
    },
    // 显示 市场
    showMarket() {
      this.isShowMarket = !this.isShowMarket;
    },
    init() {
      // 获取前台公共实时信息(指数价格 标记价格 资金费率)
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        this.$store.dispatch('getPublicMarkertInfo');
      }, 5000);
      // 接收24小时行情数据
      this.$bus.$on('FUTURE_MARKET_DATA', (data) => {
        this.WsData = JSON.parse(data);
      });
      this.$bus.$on('futuresMarketCurrent', (data) => {
        this.contractSide = data;
      });
      this.setNextStartTime();
    },
    thousandsComma(num) {
      if (num) {
        return thousandsComma(num);
      }
      return num;
    },
  },
  destroyed() {
    this.$bus.$off('FUTURE_MARKET_DATA');
    clearInterval(this.timer);
    this.timer = null;
  },
};
