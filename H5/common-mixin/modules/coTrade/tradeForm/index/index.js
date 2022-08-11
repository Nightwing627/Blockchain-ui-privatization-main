import { mapState } from 'vuex';
import { fixD, myStorage } from '@/utils';

export default {
  name: 'tableList',
  data() {
    return {
      // 当前交易方向  BUY买入 SELL卖出
      side: 'BUY',
      // 合约下单的初始化数据
      initData: {},
      // 价格输入框
      contractPrice: {
        title: this.$t('contract.price'), // 价格
        units: 'USDT',
        subText: '',
        errorText: '',
        isError: false,
        disabled: false,
        disabledText: '',
        value: '',
      },
      // 仓位数量输入框
      contractNUmber: {
        title: this.$t('contract.cw'), // '仓位',
        units: this.$t('contract.piece'), // '张',
        subText: '',
        errorText: '',
        isError: false,
        disabled: false,
        disabledText: '',
        value: '',
      },
      isLoading: false,
      // 交易类型 1限价 2 市价
      transactionType: 1,
      // 货币对列表
      marketList: null,
      // 当前市场
      marketCurrent: myStorage.get('coMarkTitle'),
      // 当前切换的货币对
      symbolCurrent: myStorage.get('coNowSymbol'),
      // 当前选中的货币对的信息数据
      symbolCurrentInfo: null,
      // 当前杠杆倍数
      definiteLevel: 0,
      // 杠杆倍数数组
      levelList: [],
      // 防止多次提交
      fal: true,
      // 仓位和价格 是否使用初始化数据
      isUseInitData: true,
      first: true,
      // 倒计时
      stopSetTiemout: null,
      // 下单按钮是否OK
      isSubmitOk: true,
      // 当前杠杆倍数是否使用init的数据
      isLevelInitData: true,
      // 当前币对的初始化数据
      contractConfig: null,
      // 下单防止重复提交
      subFla: true,
      // 循环请求标记价格
      getPriceTimer: null,
      // 下单确认框 是都显示
      dialogFlag: false,
      // 标记价格
      tagPrice: null,
      // 下单类型
      formType: null,
      // 当前合约的仓位数据
      currentOrderData: null,
    };
  },
  props: {
  },
  computed: {
    transactionTypeList() {
      return [
        // 限价交易
        { name: this.$t('contract.limitPriceTrade'), index: 1 },
        // 市价交易
        { name: this.$t('contract.marketPriceTrade'), index: 2 },
      ];
    },
    ...mapState({
      coBase({ baseData }) {
        if (baseData.coPublicInfo) {
          // 货币对列表
          this.marketList = baseData.coPublicInfo.market;
          return baseData.coPublicInfo;
        }
        return {};
      },
    }),
    is_more_position() {
      return this.$store.state.baseData.is_more_position;
    },
    // 是否登录
    isLogin() {
      if (this.$store.state.baseData.isLogin) {
        return this.$store.state.baseData.isLogin;
      }
      return false;
    },
    // 是否开启杠杆
    levelSwitch() {
      return this.isLogin;
    },
    // 按钮信息
    buttosContent() {
      return {
        buyButton: {
          text: this.isLogin ? this.$t('contract.buyButton') : this.$t('contract.loginReg'), // '登录/注册',
          class: this.isLogin ? 'u-1-bg buyBtn u-16-cl' : 'u-8-bg buyBtn u-16-cl',
        },
        sellButton: {
          text: this.isLogin ? this.$t('contract.sellButton') : this.$t('contract.loginReg'), // '登录/注册',
          class: this.isLogin ? 'u-4-bg sellBtn u-16-cl' : 'u-8-bg sellBtn u-16-cl',
        },
      };
    },
    // 当前币对 计价单位
    pricingUnits() {
      // console.log(this.symbolCurrentInfo);
      const contractConfig = this.symbolCurrentInfo || '';
      // bond  != quoteSymbol  仓位 和 价格 都用 quoteSymbol
      if (contractConfig && contractConfig.bond !== contractConfig.quoteSymbol) {
        return {
          vol: contractConfig.quoteSymbol,
          pri: contractConfig.quoteSymbol,
        };
      }
      //  bond = quoteSymbol  仓位baseSymbol    价格： quoteSymbol
      if (contractConfig && contractConfig.bond === contractConfig.quoteSymbol) {
        return {
          vol: contractConfig.baseSymbol,
          pri: contractConfig.quoteSymbol,
        };
      }
      return {
        vol: '',
        pri: '',
      };
    },
    formData2Fix() {
      return 0;
    },
    pricePrecision() {
      if (this.symbolCurrentInfo) {
        return this.symbolCurrentInfo.pricePrecision;
      }
      return 4;
    },
    // 买入成本
    buyOrderCost() {
      if (this.initData) {
        return fixD(this.initData.buyOrderCost, 4);
      }
      return '--';
    },
    // 卖出成本
    sellOrderCost() {
      if (this.initData) {
        return fixD(this.initData.sellOrderCost, 4);
      }
      return '--';
    },
    // 委托价值
    orderPriceValue() {
      if (this.initData) {
        return fixD(this.initData.orderPriceValue, 4);
      }
      return '--';
    },
    // 可用余额
    canUseBalance() {
      if (this.initData) {
        return fixD(this.initData.canUseBalance, 4);
      }
      return '--';
    },
    // 价格颜色的class
    priceClass() {
      if (this.formType === 'BUY') {
        return 'u-1-cl';
      }
      return 'u-4-cl';
    },
    confirmFormTitle() {
      const t = this.formType === 'BUY' ? this.$t('contract.buy') : this.$t('contract.sell');
      const y = this.transactionType === 1 ? this.$t('contract.infoOrder') : this.$t('contract.marketOrder');
      return t + y;
    },
  },
  watch: {
    // 监听货币单位的变化
    pricingUnits(val) {
      this.contractPrice.units = val.pri;
      // this.contractNUmber.units = val.vol;
    },
    isLogin(val) {
      if (val) {
        // 获取标记价格
        this.getTagPrice();
        // 获取 初始化 币对数据
        this.getInitData();
      } else {
        this.isSubmitOk = true;
      }
    },
    symbolCurrentInfo(val) {
      if (!this.isLogin) {
        this.definiteLevel = val.maxLeverageLevel;
        // 杠杆倍数数组
        this.levelList = val.leverTypes.split(',');
      }
    },
    levelList(value) {
      this.$bus.$emit('LEVEL_LIST', value);
    },
  },
  methods: {
    init() {
      // 监听 当前货币对切换
      this.$bus.$on('SYMBOL_CURRENT', (val) => {
        this.symbolCurrent = val;
        if (this.isLogin) {
          this.isSubmitOk = false;
        }
      });
      // 监听 市场切换
      this.$bus.$on('ON_MARKET_SWITCH', (data) => {
        this.marketCurrent = data;
        this.currentOrderData = null;
      });
      // 监听 市场切换
      this.$bus.$on('ON_MARKET_SWITCH_ORDER', (data) => {
        this.marketCurrent = data;
      });
      // 获取 当前选中的货币对的信息
      this.$bus.$on('SYMBOL_CURRENT_INFO', (val) => {
        this.symbolCurrentInfo = val;
        this.symbolCurrentInfo.typeName = this.setTypeName(this.symbolCurrentInfo);
        this.isLevelInitData = true;
        this.isUseInitData = true;
        this.clearValue();
        // 获取标记价格
        this.getTagPrice();
        // 获取 初始化 币对数据
        this.getInitData();
      });
      // 获取 当前选中的货币对的信息
      this.$bus.$on('GET_INIT_DATA', (fal) => {
        // 获取 初始化 币对数据
        this.getInitData(fal);
      });
      this.$bus.$on('CO_CURRENT_TODER_DATA', (data) => {
        this.currentOrderData = data;
        if (data) {
          this.currentOrderData.unrealisedRateIndex = fixD(data.unrealisedRateIndex, 2);
          this.currentOrderData.liquidationPrice = fixD(data.liquidationPrice, data.pricePrecision);
          this.currentOrderData.avgPrice = fixD(data.avgPrice, data.pricePrecision);
        }
      });
      // 获取 盘口 和 成交点击过来的价格
      this.$bus.$on('HANDEL_PRICE', (data) => {
        this.contractPrice.value = data;
      });
      // 获取杠杆修改
      this.$bus.$on('ON_CHANGE_LEVEL', (data) => {
        this.onChangelevel(data);
      });
    },
    setTransactionType(v) {
      this.transactionType = v.index;
      this.isUseInitData = true;
      if (v.index === 2) {
        this.contractPrice.disabled = true;
      } else {
        this.contractPrice.disabled = false;
      }
    },
    setSide(v) {
      this.side = v;
    },
    // 合约名称
    setTypeName(data) {
      const n = this.setSymbolName(data.contractType);
      const t = data.settleTime.split(' ')[0].split('-');
      const time = data.contractType === 0 ? '' : ` · ${t[1]}${t[2]}`;
      const x = data.maxLeverageLevel;
      return `${n}${time} (${x}X)`;
    },
    // 合约类型
    setSymbolName(data) {
      switch (data) {
        case 0:
          return this.$t('contract.contractType1');
        case 1:
          return this.$t('contract.contractType2');
        case 2:
          return this.$t('contract.contractType3');
        case 3:
          return this.$t('contract.contractType4');
        default:
          return this.$t('contract.contractType5');
      }
    },
    // 切换 限价交易 和 市价交易
    switchTradeType(type) {
      this.isUseInitData = true;
      this.transactionType = type;
      if (type === 2) {
        this.contractPrice.disabled = true;
      } else {
        this.contractPrice.disabled = false;
      }
    },
    // 杠杆修改事件
    onChangelevel(data) {
      document.onmouseup = null;
      // 杠杆如果有修改 禁止使用初始化的数据
      this.isLevelInitData = false;
      this.sendLevelMultiple(data);
    },
    // input 框 输入事件
    onChaneForm(data) {
      if (!this.contractNUmber.value && !this.contractPrice.value) {
        this.isSubmitOk = true;
      } else if (this.isLogin) {
        this.isSubmitOk = false;
      }
      this[data.name].value = data.value;
      // 仓位和数量禁止使用初始化数据
      this.isUseInitData = false;
      if (data.value) {
        // 去请求初始化数据
        clearTimeout(this.stopSetTiemout);
        this.stopSetTiemout = setTimeout(() => {
          this.getInitData(true, true);
        }, 1000);
      }
    },
    // 清空 表单数据
    clearValue() {
      this.contractNUmber.value = '';
      this.contractPrice.value = '';
    },
    // 循环获取标记价格
    getTagPrice(auto) {
      const headers = {};
      if (auto) {
        headers['exchange-auto'] = '1';
      }
      this.axios({
        url: 'tag_price',
        hostType: 'co',
        headers,
        params: {
          contractId: this.symbolCurrentInfo ? this.symbolCurrentInfo.id : '',
        },
      }).then((data) => {
        if (data.code === '0') {
          this.tagPrice = fixD(data.data.tagPrice, this.pricePrecision);
          this.$bus.$emit('TAG_PRICE', data.data);
        }
      });
      clearTimeout(this.getPriceTimer);
      this.getPriceTimer = null;
      this.getPriceTimer = setTimeout(() => {
        this.getTagPrice(true);
      }, 5000);
    },
    // 获取当前合约下单的初始化数据
    getInitData(fla, islevel) {
      this.loading = true;
      if (this.isLogin) {
        const objData = {
          contractId: this.symbolCurrentInfo ? this.symbolCurrentInfo.id : '', // 合约ID
          orderType: this.transactionType, // 限价 1 市价 2
        };
        // 杠杆倍数
        if (islevel) {
          objData.level = Number(this.definiteLevel);
        }
        if (fla) {
          // 仓位数量
          objData.volume = Number(this.contractNUmber.value);
          // 限价价格
          objData.price = this.contractPrice.value;
        }
        this.axios({
          url: this.$store.state.url.contract.init_take_order,
          hostType: 'co',
          params: objData,
        }).then((data) => {
          if (data.code === '0') {
            this.isSubmitOk = true;
            this.loading = false;
            this.initData = data.data;
            // 当前币对数据
            this.symbolCurrentInfo = data.data.contractConfig;
            this.symbolCurrentInfo.typeName = this.setTypeName(this.symbolCurrentInfo);
            this.levelList = this.symbolCurrentInfo.leverTypes.split(',');
            if (this.isUseInitData) {
              // 设置默认值价格
              this.contractPrice.value = data.data.price;
              // 设置默认仓位数量
              this.contractNUmber.value = `${data.data.volume}`;
            }
            // 设置默认杠杆倍数
            if (this.isLevelInitData) {
              this.definiteLevel = `${data.data.level}`;
            }
          }
        });
      }
    },
    // 发送杠杆倍数
    sendLevelMultiple(level) {
      this.isSubmitOk = false;
      this.axios({
        url: this.$store.state.url.contract.change_level,
        hostType: 'co',
        params: {
          contractId: this.symbolCurrentInfo.id,
          leverageLevel: level,
        },
      }).then((data) => {
        if (data.code === '0') {
          this.definiteLevel = `${level}`;
          this.getInitData(true, true);
          this.$bus.$emit('LEVEL_CHANGE_SUCCESS');
        } else {
          // 告诉 杠杆组件 修改失败了
          this.$bus.$emit('LEVEL_CHANGE_EERROR');
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
        this.isSubmitOk = true;
      }).catch(() => {
        setTimeout(() => {
          // 告诉 杠杆组件 修改失败了
          this.$bus.$emit('LEVEL_CHANGE_EERROR');
          this.isSubmitOk = true;
        }, 100);
      });
    },
    // 下单提交
    submit() {
      if (this.subFla) {
        this.subFla = false;
        let data = {};
        data = {
          // 合约ID
          contractId: this.symbolCurrentInfo.id,
          // 数量
          volume: Number(this.contractNUmber.value),
          // 价格
          price: this.contractPrice.value,
          // 限价单还是市价单
          orderType: this.transactionType,
          // 买卖
          side: this.formType,
          // 杠杆倍数
          level: Number(this.definiteLevel),
          // 开仓单： 0
          closeType: 0,
          // 逐仓：2
          copType: 2,
        };
        this.axios({
          url: this.$store.state.url.contract.take_order,
          hostType: 'co',
          params: data,
        }).then((datas) => {
          if (datas.code === '0') {
            this.subFla = true;
            // 重新请求初始化合约数据
            this.getInitData(true);
            this.$bus.$emit('tip', { text: this.$t('trade.dealCussess'), type: 'success' });
            // 发送下单成功的事件
            this.$bus.$emit('ORDER_CREATE', { type: 'success' });
            this.dialogFlag = false;
          } else {
            this.subFla = true;
            this.$bus.$emit('tip', { text: datas.msg, type: 'error' });
          }
        }).catch(() => {
          this.subFla = true;
        });
      }
    },
    submitForm(type) {
      this.dialogFlag = true;
      this.formType = type;
      if (!this.isLogin) {
        this.$router.push('/login');
        // 如果input里有值 并且 是仓位数量  并且有初始化数据
      } else if (this.contractNUmber.value && this.symbolCurrentInfo) {
        // 限制输入数量最大值
        if (Number(this.contractNUmber.value) > this.symbolCurrentInfo.maxOrderVolume) {
          this.$bus.$emit('tip', {
            // 仓位数量最大可输入
            text: `${this.$t('contract.errorText_01')}${this.symbolCurrentInfo.maxOrderVolume}`,
            type: 'error',
          });
        } else if (Number(this.contractNUmber.value) < this.symbolCurrentInfo.minOrderVolume) {
          this.$bus.$emit('tip', {
            // 仓位数量最小可输入
            text: `${this.$t('contract.errorText_02')}${this.symbolCurrentInfo.maxOrderVolume}`,
            type: 'error',
          });
        } else {
          this.dialogFlag = true;
          this.formType = type;
        }
      }
    },
    dialogConfirm() {
      this.submit();
    },
    // 弹框取消
    dialogClose() {
      this.dialogFlag = false;
    },
  },
  // 组价离开前执行
  beforeDestroy() {
    clearInterval(this.assetsInter);
  },
};
