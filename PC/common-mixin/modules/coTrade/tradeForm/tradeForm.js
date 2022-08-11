import {
  fixD, division, getDigit, cut, thousandsComma, myStorage, nul,
} from '@/utils';

export default {
  name: 'tradeForm',
  data() {
    return {
      // 按钮颜色class类型
      showClassType: null,
      // 交易类型 1开仓 2 平仓
      transactionType: 1,
      // 1 限价 2 市价 3 条件
      currentCategory: 1,
      // 是否是市价
      isMarket: false,
      // 只减仓
      zhiJianCang: false,
      // 百分比值
      percentageVlaue: null,
      // 百分比值鼠标移入效果
      percentageVlaueHover: null,
      // 下单按钮是否OK
      isSubmitDisbled: false,
      // 是否显示杠杆弹窗
      leverageDialogShow: false,
      // 是否显示 二次确认弹框
      forcedReminderShow: false,
      // 是否选中了订单类型
      isCheckedOrdeType: null,
      // 订单类型对象{}
      ordeType: {},
      // 鼠标移入订单类型对象
      hoverOrdeType: {},
      // buy买入、sell卖出？
      sideType: null,
      // 提交防止连击
      submitFlag: true,
      // 到期时间
      expireTime: '14',

      formData_1: {
        title: '', // '价格',
        units: this.priceUnit,
        fix: 8,
        isShow: true,
        errorText: null,
        value: null,
      },
      formData_2: {
        title: '', // '价格',
        units: this.priceUnit,
        fix: 8,
        isShow: false,
        errorText: null,
        value: null,
      },
      formData_3: {
        title: '', // '数量',
        units: '', // '张',
        fix: 8,
        isShow: true,
        errorText: null,
        value: null,
      },
      // 下单提交数据
      submitData: null,
      // 二次确认数据
      confirmData: {},
      // 当前合约最新平均价
      activeNewPrice: 0,
      // 持仓模式 1：单向持仓 2：双向持仓
      positionModel: myStorage.get('positionModel') || 2,
      // 切换保证金模式弹框
      depositDialogShow: false,
      // 是否显示下单类型选项类表
      ordeTypePtions: false,
    };
  },
  props: {
  },
  computed: {
    // 是否 是云合约在iframe中调用
    isIframe() {
      return this.$store.state.future.isIframe;
    },
    // 当前合约保证金模式
    marginModelText() {
      if (this.userConfig) {
        // 全仓 ： 逐仓
        return this.userConfig.marginModel === 1
          ? this.$t('futures.currentSymbol.marginModel1')
          : this.$t('futures.currentSymbol.marginModel2');
      }
      return this.$t('futures.currentSymbol.marginModel1');
    },
    lanText() {
      return {
        mPrice: this.$t('futures.tradeForm.mPrice'),
        textjz: this.$t('futures.tradeForm.textjz'),
        text1: this.$t('futures.tradeForm.text1'),
        text2: this.$t('futures.tradeForm.text2'),
        text3: this.$t('futures.tradeForm.text3'),
        text4: this.$t('futures.tradeForm.text4'),
        text5: this.$t('futures.tradeForm.text5'),
        text6: this.$t('futures.tradeForm.text6'),
        text7: this.$t('futures.tradeForm.text7'),
        text8: this.$t('futures.tradeForm.text8'),
        text9: this.$t('futures.tradeForm.text9'),
        text10: this.$t('futures.tradeForm.text10'),
        text11: this.$t('futures.tradeForm.text11'),
        text12: this.$t('futures.tradeForm.text12'),
        text13: this.$t('futures.tradeForm.text13'),
        text14: this.$t('futures.tradeForm.text14'),
        text15: this.$t('futures.tradeForm.text15'),
        text16: this.$t('futures.tradeForm.text16'),
        text17: this.$t('futures.tradeForm.text17'),
        text18: this.$t('futures.tradeForm.text18'),
        text19: this.$t('futures.tradeForm.text19'),
        text20: this.$t('futures.tradeForm.text20'),
        text21: this.$t('futures.tradeForm.text21'),
        text22: this.$t('futures.tradeForm.text22'),
        text23: this.$t('futures.tradeForm.text23'),
        text24: this.$t('futures.tradeForm.text24'),
        text25: this.$t('futures.tradeForm.text25'),
        text26: this.$t('futures.tradeForm.text26'),
        text27: this.$t('futures.tradeForm.text27'),
        text28: this.$t('futures.tradeForm.text28'),
        text29: this.$t('futures.tradeForm.text29'),
        text30: this.$t('futures.tradeForm.text30'),
        text31: this.$t('futures.tradeForm.text31'),
        text32: this.$t('futures.tradeForm.text32'),
        text33: this.$t('futures.tradeForm.text33'),
        text34: this.$t('futures.tradeForm.text34'),
        text35: this.$t('futures.tradeForm.text35'),
        text36: this.$t('futures.tradeForm.text36'),
        text37: this.$t('futures.tradeForm.text37'),
        text38: this.$t('futures.tradeForm.text38'),
        text39: this.$t('futures.tradeForm.text39'),
        text40: this.$t('futures.tradeForm.text40'),
        text41: this.$t('futures.tradeForm.text41'),
        text42: this.$t('futures.tradeForm.text42'),
        text43: this.$t('futures.tradeForm.text43'),
        text44: this.$t('futures.tradeForm.text44'),
        text45: this.$t('futures.tradeForm.text45'),
        text46: this.$t('futures.tradeForm.text46'),
        text47: this.$t('futures.tradeForm.text47'),
        text48: this.$t('futures.tradeForm.text48'),
        text49: this.$t('futures.tradeForm.text49'),
        text50: this.$t('futures.tradeForm.text50'),
        text51: this.$t('futures.tradeForm.text51'),
        text52: this.$t('futures.tradeForm.text52'),
        text53: this.$t('futures.tradeForm.text53'),
        text56: this.$t('futures.tradeForm.text56'),
        text57: this.$t('futures.tradeForm.text57'),
      };
    },
    // 是否登录
    isLogin() {
      if (this.$store.state.baseData.isLogin) {
        return this.$store.state.baseData.isLogin;
      }
      return false;
    },
    // 用户配置信息
    userConfig() {
      return this.$store.state.future.futureUserConfig;
    },
    // 持仓类型(1 全仓，2 仓逐)
    marginModel() {
      return this.userConfig ? this.userConfig.marginModel : 1;
    },
    // 当前合约ID
    contractId() {
      return this.$store.state.future.contractId;
    },
    // 当前合约价格单位
    priceUnit() {
      return this.$store.state.future.priceUnit;
    },
    // 当前合约价格精度
    pricefix() {
      return this.$store.state.future.pricefix;
    },
    // 到期时间
    planTypeList() {
      return [
        {
          name: this.lanText.text16, // '24H',
          id: '1',
        },
        {
          name: this.lanText.text17, // '7天',
          id: '7',
        },
        {
          name: this.lanText.text18, // '14天',
          id: '14',
        },
        {
          name: this.lanText.text19, // '30天',
          id: '30',
        },
      ];
    },
    // 是否开通了合约交易
    openContract() {
      return this.$store.state.future.openContract;
    },
    // 数量单位
    volUnit() {
      return this.$store.state.future.coUnit;
    },
    // 当前合约面值
    multiplier() {
      return Number(this.$store.state.future.multiplier) || 1;
    },
    // 当前合约名称
    contractName() {
      return this.$store.state.future.contractName;
    },
    // 当前合约币对
    contractSymbol() {
      return this.$store.state.future.contractSymbol;
    },
    // 当前合约数量精度
    volfix() {
      if (this.coUnitType === 1) {
        return this.$store.state.future.volfix;
      }
      return 0;
    },
    // 数量单位类型Number 1标的货币, 2张
    coUnitType() {
      return this.$store.state.future.coUnitType;
    },
    // 当前合约信息
    contractInfo() {
      return this.$store.state.future.contractInfo;
    },
    // 当前合约币对信息
    coinResultVo() {
      if (this.contractInfo) {
        return this.contractInfo.coinResultVo;
      }
      return {};
    },
    // 标的货币（数量单位 base）
    baseCoin() {
      if (this.contractInfo) {
        return this.contractInfo.base;
      }
      return null;
    },
    // 计价货币
    quoteCoin() {
      if (this.contractInfo) {
        return this.contractInfo.quote;
      }
      return null;
    },
    // 标的货币（合约面值单位）
    multiplierCoin() {
      if (this.contractInfo) {
        return this.contractInfo.multiplierCoin;
      }
      return null;
    },
    // 标的货币精度（合约面值）
    multiplierFix() {
      if (this.contractInfo) {
        return getDigit(this.contractInfo.multiplier);
      }
      return 4;
    },
    // 当前合约保证金币种
    marginCoin() {
      if (this.contractInfo) {
        return this.contractInfo.marginCoin;
      }
      return '';
    },
    // 当前合约保证金币种精度
    marginCoinFix() {
      if (this.contractInfo && this.contractInfo.coinResultVo) {
        return this.contractInfo.coinResultVo.marginCoinPrecision;
      }
      return 4;
    },
    // 用户合约资产
    accountBalanceMap() {
      return this.$store.state.future.futureAccountBalance;
    },
    accountBalance() {
      if (this.accountBalanceMap && this.marginCoin) {
        return this.accountBalanceMap[this.marginCoin];
      }
      return {};
    },
    // 可用
    canUseAmount() {
      if (this.isLogin && this.accountBalance && this.accountBalance.canUseAmount !== '--') {
        return fixD(this.accountBalance.canUseAmount, this.marginCoinFix);
      }
      return 0;
    },
    // 当前合约杠杆倍数
    nowLevel() {
      if (this.userConfig) {
        return this.userConfig.nowLevel || 20;
      }
      return 20;
    },
    // 当前合约保证金汇率
    marginRate() {
      if (this.contractInfo && this.contractInfo.marginRate) {
        return this.contractInfo.marginRate;
      }
      return 1;
    },
    // 当前合约方向（1正向、0反向）
    contractSide() {
      if (this.contractInfo) {
        return this.contractInfo.contractSide;
      }
      return 1;
    },
    // 当前合约可平数量
    activeCanClose() {
      const { activeCanClose } = this.$store.state.future;
      let obj = {};
      if (activeCanClose) {
        obj = activeCanClose[this.contractName];
      }
      return obj;
    },
    // 仓位方向（开仓 还是平仓）
    orderSide() {
      let open = 'OPEN';
      if (this.zhiJianCang || this.transactionType === 2) {
        open = 'CLOSE';
      }
      return open;
    },
    // 百分比列表
    percentageList() {
      return [10, 20, 50, 100];
    },
    // 开仓 平仓 Tab
    switchTradeTypeList() {
      return [
        {
          id: 1,
          text: this.lanText.text20, // '开仓',
          classes: this.transactionType === 1 ? 'u-8-bg b-1-cl' : 'a-8-bg b-2-cl',
        },
        {
          id: 2,
          text: this.lanText.text21, // '平仓',
          classes: this.transactionType === 2 ? 'u-8-bg b-1-cl' : 'a-8-bg b-2-cl',
        },
      ];
    },
    // 限价单\市价单\条件单
    categoryList() {
      return [
        {
          id: 1,
          text: this.lanText.text22, // '限价单',
          classes: this.currentCategory === 1 ? 'a-5-bg b-1-cl' : 'a-8-bg b-2-cl',
        },
        {
          id: 2,
          text: this.lanText.text23, // '市价单',
          classes: this.currentCategory === 2 ? 'a-5-bg b-1-cl' : 'a-8-bg b-2-cl',
        },
        {
          id: 3,
          text: this.lanText.text24, // '条件单',
          classes: this.currentCategory === 3 ? 'a-5-bg b-1-cl' : 'a-8-bg b-2-cl',
        },
      ];
    },
    // 可买 可卖标题文案
    openableData() {
      if (this.zhiJianCang || this.transactionType === 2) {
        return {
          buyText: this.lanText.text25, // '可平空',
          sellText: this.lanText.text26, // '可平多',
        };
      }
      return {
        buyText: this.lanText.text27, // '可买',
        sellText: this.lanText.text28, // '可卖',
      };
    },
    // 订单类型列表
    ordeTypeList() {
      return [
        {
          title: this.lanText.text29, // '只做maker',
          // '只做Maker（Post-Only）订单保证用户只做maker，该订单不会立即在市场成交，假如此委托会立即与已有委托单成交，那么此委托单将被立即取消。',
          text: this.lanText.text30,
          id: 5,
        },
        {
          title: 'IOC',
          // text: 'IOC（Immediately or Cancel）订单若不能立即成交则立即取消未成交的部分。',
          text: this.lanText.text31,
          id: 3,
        },
        {
          title: 'FOK',
          // text: 'FOK（Fill or Kill）订单若不能全部成交则立即全部取消。',
          text: this.lanText.text32,
          id: 4,
        },
      ];
    },
    // login 按钮信息
    loginButton() {
      if (this.isLogin && !this.openContract) {
        return {
          text: this.lanText.text33, // '开通合约交易',
          class: 'u-8-bg buyBtn u-16-cl',
        };
      }
      return {
        text: this.lanText.text34, // '登录后进行交易',
        class: 'u-8-bg buyBtn u-16-cl',
      };
    },
    // 按钮信息
    buttosContent() {
      if (this.transactionType === 2 || this.zhiJianCang) {
        return {
          buyButton: {
            text: this.lanText.text35, // '买入平空',
            class: 'u-1-bg buyBtn b-1-cl',
          },
          sellButton: {
            text: this.lanText.text36, // '卖出平多',
            class: 'u-4-bg sellBtn b-1-cl',
          },
        };
      }
      if (this.positionModel === 2) {
        return {
          buyButton: {
            text: this.lanText.text37, // '买入开多',
            class: 'u-1-bg buyBtn b-1-cl',
          },
          sellButton: {
            text: this.lanText.text38, // '卖出开空',
            class: 'u-4-bg sellBtn b-1-cl',
          },
        };
      }
      return {
        buyButton: {
          text: this.lanText.text39, // '买入做多',
          class: 'u-1-bg buyBtn b-1-cl',
        },
        sellButton: {
          text: this.lanText.text40, // '卖出做空',
          class: 'u-4-bg sellBtn b-1-cl',
        },
      };
    },
    // 是否是 市价开仓
    isOpenAndIsMarket() {
      // 市价单 && 不是只减仓
      // 条件市价 && 不是只减仓 && transactionType=== 1 开仓  2平仓
      if ((this.currentCategory === 2 || this.isMarket)
      && !this.zhiJianCang && this.transactionType === 1) {
        return true;
      }
      return false;
    },
    // 输入的价格
    inputPrice() {
      // 市价
      if (this.currentCategory === 2 || this.isMarket) {
        return 0;
      }
      // 条件单
      if (this.currentCategory === 3) {
        return this.formData_2.value;
      }
      return Number(this.formData_1.value);
    },
    // 数量(张数) || 市价的开仓价值
    inputVolume() {
      // 限价的数量 and 市价的开仓价值
      let volume = this.formData_3.value;
      // 如果单位是标记货币 && 不是市价开仓(开仓价值)
      if (this.coUnitType === 1 && !this.isOpenAndIsMarket && volume) {
        // 转换成张
        volume = division(volume, this.multiplier);
      }
      return Number(volume) || 0;
    },
    // 条件单的触发价
    triggerPrice() {
      if (this.currentCategory === 3) {
        return this.formData_1.value;
      }
      return null;
    },

    // 提交时的订单类型
    submitOrderType() {
      // 订单类型 (1 limit， 2 market，3 IOC，4 FOK，5 POST_ONLY)
      let type = this.currentCategory;
      if (this.currentCategory === 3) {
        type = this.isMarket ? 2 : 1;
      }
      if (this.isCheckedOrdeType && this.ordeType && this.ordeType.id) {
        type = this.ordeType.id;
      }
      return type;
    },
    // 开仓价值 约等于
    worthRate() {
      // 正向： 开仓价值 / 本交易所最新价格 / 保证金汇率(币)
      // 正向： 开仓价值 / 本交易所最新价格 / 保证金汇率(张)
      // 反向： 开仓价值 * 本交易所最新价格 / 保证金汇率(币)
      // 反向： 开仓价值 * 本交易所最新价格 / 保证金汇率(张)
      // this.marginRate：保证金汇率
      // this.multiplier： 合约面值
      const value = this.countPercentageVlaue() || this.inputVolume;
      let V1 = '';
      if (value && this.activeNewPrice) {
        // 正向
        if (this.contractSide === 1) {
          V1 = division(value, this.activeNewPrice);
        } else {
          // 反向
          V1 = nul(value, this.activeNewPrice);
        }
        if (V1) {
          return fixD(division(V1, this.marginRate), this.multiplierFix);
        }
      }
      return 0;
    },
    // 价值
    worthValue() {
      let volume = this.countPercentageVlaue() || this.inputVolume;
      let price = this.formData_1.value;
      if (this.currentCategory === 3) {
        price = this.formData_2.value;
      }
      if (volume && price) {
        volume = nul(volume, this.multiplier);
        // 正向合约
        if (this.contractSide === 1) {
          return fixD(nul(volume, price), this.pricefix);
        }
        // 反向合约
        // const { volfix } = this.$store.state.future;
        return fixD(division(volume, price), this.marginCoinFix);
      }
      return 0;
    },
  },
  watch: {
    // 用户配置信息
    userConfig(val) {
      if (val) {
        //
        this.positionModel = val.positionModel;
        // 只减仓
        this.zhiJianCang = false;
        // 交易类型 1开仓 2 平仓
        this.transactionType = 1;
        // 1 限价 2 市价 3 条件
        // this.currentCategory = 1;
        // 条件单是否是市价
        this.isMarket = false;
        // 只减仓
        this.zhiJianCang = false;
        // 设置表单布局
        this.setFormType();
        // 清空表单内容
        this.clearFormData();
      }
    },
    // 合约ID
    contractId() {
      // 清空表单内容
      this.clearFormData();
    },
    'formData_1.value': function formData1(value) {
      if (value && Number(value)) {
        this.formData_1.errorText = null;
      }
    },
    'formData_2.value': function formData2(value) {
      if (value && Number(value)) {
        this.formData_2.errorText = null;
      }
    },
    'formData_3.value': function formData3(value) {
      if (value && Number(value)) {
        this.formData_3.errorText = null;
      }
    },
    volUnit(val) {
      if (val) {
        this.setFormType();
      }
    },
    ordeTypeList() {
      const [ordeType] = this.ordeTypeList;
      this.ordeType = ordeType;
    },
  },
  methods: {
    init() {
      // 监听喜好设置
      this.$bus.$on('set-future', (data) => {
        if (data && data.positionModel) {
          this.positionModel = data.positionModel;
        }
      });
      // 监听获取当前最新价格
      this.$bus.$on('ACTIVE_NEW_PRICE', (val) => {
        if (val) {
          this.activeNewPrice = val;
        }
      });
      // 监听点击盘口的价格
      this.$bus.$on('HANDEL_PRICE', (val) => {
        if (val) {
          this.formData_1.value = val;
        }
      });
      this.setFormType();
      // 设置默认订单类型
      this.$nextTick(() => {
        const [ordeType] = this.ordeTypeList;
        this.ordeType = ordeType;
      });
    },
    // 显示弹框
    showDialog(type) {
      this.$bus.$emit(type);
    },
    // 开启弹框
    setShowDialog(type) {
      // 显示开通合约交易弹框
      if (this.userConfig && !this.userConfig.openContract) {
        this.$bus.$emit('OPEN_FUTURE');
        return false;
      }
      if (type === 'leverageDialogShow'
        && this.userConfig
        && !this.userConfig.levelCanSwitch) {
        // 本合约当前存在委托，不可调整杠杆
        this.$bus.$emit('tip', { text: this.$t('futures.tradeForm.text54'), type: 'error' });
        return false;
      }
      if (type === 'depositDialogShow'
        && this.userConfig
        && !this.userConfig.marginModelCanSwitch) {
        // '本合约当前存在委托/仓位，不可调整仓位类型'
        this.$bus.$emit('tip', { text: this.$t('futures.tradeForm.text55'), type: 'error' });
        return false;
      }

      if (!this.isLogin) {
        this.$bus.$emit('tip', { text: this.lanText.text34, type: 'error' });
      } else {
        this.$store.dispatch('getUserConfig');
        this[type] = true;
      }

      return false;
    },

    // 切换 开仓  和 平仓
    switchTradeType(type) {
      if (this.transactionType !== type) {
        this.transactionType = type;
        this.setFormType();
        this.clearFormData();
      }
    },
    // 切换 /普通/高级限价/计划
    selectCategory(id) {
      if (this.currentCategory !== id) {
        this.currentCategory = id;
        // 条件单是否是市价
        this.isMarket = false;
        this.setFormType();
        this.clearFormData();
      }
    },
    // 条件单切换 市价 and 限价
    selectMarket() {
      if (this.isMarket) {
        this.formData_3.value = '';
      }
      this.isMarket = !this.isMarket;
      this.setFormType();
      this.clearFormData('isMarket');
    },
    // 清除百分比
    clearPercentage() {
      this.percentageVlaue = null;
      this.formData_3.value = null;
      this.formData_3.percentageVlaue = null;
      this.formData_1.percentageVlaue = null;
    },
    // 设置百分比
    setPercentageVlaue(value) {
      this.percentageVlaue = value;
      if (this.formData_3.isShow) {
        this.formData_3.percentageVlaue = value;
        this.formData_3.value = null;
        this.formData_3.errorText = null;
      } else {
        this.formData_1.percentageVlaue = value;
        this.formData_1.value = null;
        this.formData_1.errorText = null;
      }
    },
    // 计算百分比的数量
    countPercentageVlaue(type) {
      if (!this.percentageVlaue) return 0;
      const canNumber = type === 'BUY' ? this.maxCanBuyNumber : this.maxCanSellNumber;
      if (!canNumber) return 0;
      let number = 0;
      //  市价 开仓 非只减仓
      if (this.isOpenAndIsMarket) {
        // 百分比*可用*杠杆 / 保证金汇率 = 仓位价值
        const percentageVlaue = division(this.percentageVlaue, 100);
        // 百分比 * 可用
        const Np = nul(percentageVlaue, this.canUseAmount);
        // 根据余额算出可开
        const val1 = division(nul(Np, this.nowLevel), this.marginRate);
        // 根据杠杆限制算出可开
        const val2 = type === 'BUY' ? nul(percentageVlaue, this.V1Buy) : nul(percentageVlaue, this.V1Sell);
        const val3 = Number(val1) < Number(val2) ? val1 : val2;
        number = fixD(val3, this.pricefix);
      } else {
        // 百分比*（可买 || 可卖）= 数量
        number = nul(division(this.percentageVlaue, 100), canNumber);
        // 如果当前单位是标的货币
        if (this.coUnitType === 1 && number) {
          // 换算成（张）
          number = fixD(division(number, this.multiplier), 0);
        }
        if (this.coUnitType === 2) {
          number = fixD(number, 0);
        }
      }
      return number;
    },
    // 设置表单
    setFormType() {
      this.formData_1.promptText = null;
      this.formData_3.promptText = null;

      // 限价
      if (this.currentCategory === 1) {
        this.formData_1.isShow = true;
        this.formData_1.title = this.lanText.text11; //  '委托价格';
        this.formData_1.units = this.priceUnit;
        this.formData_1.fix = this.pricefix;
        this.formData_3.isShow = true;
        this.formData_3.units = this.volUnit;
        this.formData_3.fix = this.volfix;
      }

      // 市价
      if (this.currentCategory === 2) {
        this.isCheckedOrdeType = false;
        // 平仓 || 只减仓
        if (this.transactionType === 2 || this.zhiJianCang) {
          this.formData_1.isShow = false;
          this.formData_3.isShow = true;
        } else {
          this.formData_1.isShow = false;
          this.formData_3.isShow = true;
        }
      }
      // 条件单
      if (this.currentCategory === 3) {
        this.formData_1.isShow = true;
        this.formData_2.isShow = true;
        this.formData_3.isShow = true;
        this.formData_1.title = this.lanText.text12; // '触发价';
        // '当该合约的最新成交价达到该价格时，系统将按照你设置的下单价格和下单数量为你下单。';
        this.formData_1.promptText = this.lanText.text13;
        this.formData_2.title = this.lanText.text11; // '委托价格';
        this.formData_1.units = this.priceUnit;
        this.formData_2.fix = this.pricefix;
        this.formData_1.fix = this.pricefix;
      } else {
        this.formData_2.isShow = false;
      }
      // 如果是市价开仓
      if (this.isOpenAndIsMarket) {
        this.formData_3.title = this.lanText.text14; // '开仓价值';
        // '需要开的仓位的价值，仓位价值 = 仓位数量 * 成交价格，实际成交的仓位数量与成交时的成交价格有关。';
        this.formData_3.promptText = this.lanText.text15;
        // 正向
        if (this.contractSide === 1) {
          this.formData_3.units = this.priceUnit;
          this.formData_3.fix = this.pricefix;
        } else {
          // 反向
          const { volfix } = this.$store.state.future;
          this.formData_3.units = this.baseCoin;
          this.formData_3.fix = volfix;
        }
      } else {
        this.formData_3.title = this.lanText.text53; // '委托数量';
        this.formData_3.units = this.volUnit;
        this.formData_3.fix = this.volfix;
      }
      this.setHeight();
    },
    // 清除表单数据
    clearFormData(type) {
      if (type !== 'isMarket') {
        this.formData_1.value = null;
      }
      // this.isMarket = false;
      this.percentageVlaue = null;
      this.formData_2.value = null;
      this.formData_1.errorText = null;
      this.formData_2.errorText = null;
      this.formData_3.errorText = null;
      this.formData_3.value = null;
      // 百分数
      this.formData_1.percentageVlaue = null;
      this.formData_3.percentageVlaue = null;
      this.setHeight();
    },
    // 表单输入事件
    changeInput(type, value) {
      this[type].value = value;
    },
    // 多选框选择事件(只减仓)
    checkoutClick(type) {
      this.zhiJianCang = type;
      this.setFormType();
    },
    // 多选框选择事件(只减仓)
    checkedOrdeTypeclick(type) {
      this.isCheckedOrdeType = type;
    },
    // 单选框 选择事件
    radioClick(type) {
      this.ordeType = type;
      this.ordeTypePtions = false;
    },
    // 显示开通合约弹框/登录
    loginButtonClick() {
      if (!this.isLogin) {
        if (this.isIframe) {
          window.parent.postMessage('login', '*');
        } else {
          this.$router.push('/login');
        }
      } else {
        // 显示开通合约弹框
        this.$bus.$emit('OPEN_FUTURE');
      }
    },
    // 表单输入值大小验证
    formNumberVerify() {
      let flag = true;
      this.formData_1.errorText = null;
      this.formData_2.errorText = null;
      this.formData_3.errorText = null;
      const { sideType } = this;
      // 当前输入的价格和最新价的比例 (当前价格 - 输入的价格) / 当前价格
      if (this.inputPrice) {
        const range = Math.abs(
          division(cut(this.activeNewPrice, this.inputPrice),
            this.activeNewPrice),
        );
        const { priceRange } = this.coinResultVo; // 最大价格比例

        let chaFlag = true;
        if (sideType === 'SELL' && Number(this.inputPrice) < Number(this.activeNewPrice)) {
          chaFlag = false;
        }
        if (sideType === 'BUY' && Number(this.inputPrice) > Number(this.activeNewPrice)) {
          chaFlag = false;
        }
        if (range > priceRange && !chaFlag) {
          if (this.currentCategory === 3) {
            this.formData_2.errorText = this.lanText.text41; // '价格偏差太大！';
          } else {
            this.formData_1.errorText = this.lanText.text41; // '价格偏差太大！';
          }
          flag = false;
        }
      }
      // 数量
      let vol = this.inputVolume;
      if (this.percentageVlaue) {
        vol = this.countPercentageVlaue(sideType);
      }
      if (vol) {
        // 验证市价开仓
        if (this.isOpenAndIsMarket) {
        // 市价（开仓价值）
          const { maxMarketMoney, minOrderMoney } = this.coinResultVo;
          if (vol > maxMarketMoney) {
            // 超出单次最大下单金额，最多可输入
            this.formData_3.errorText = `${this.lanText.text42}${maxMarketMoney} ${this.marginCoin}`;
            flag = false;
          }
          if (vol < minOrderMoney) {
            // 超出单次最小下单金额，最少需输入

            let coin = this.marginCoin;
            if (this.contractInfo.contractType !== 'E' && this.currentCategory === 2) {
              coin = this.quoteCoin;
            }

            this.formData_3.errorText = `${this.lanText.text43}${minOrderMoney} ${coin}`;
            flag = false;
          }

          // 百分比 * 可用
          const val1 = fixD(division(
            nul(this.canUseAmount, this.nowLevel), this.marginRate,
          ), this.pricefix);
          const val2 = sideType === 'BUY' ? this.V1Buy : this.V1Sell;
          const number = Number(val1) < Number(val2) ? Number(val1) : Number(val2);
          if (vol > number) {
            this.formData_3.errorText = `${this.lanText.text57}`;
            flag = false;
            return false;
          }
        } else {
          // 限价
          const { maxLimitVolume, minOrderVolume } = this.coinResultVo;
          //
          const canMaxNumber = sideType === 'SELL' ? this.maxCanSellNumber : this.maxCanBuyNumber;
          let canMaxNumberZhang = canMaxNumber;
          if (this.coUnitType === 1 && !this.isOpenAndIsMarket && canMaxNumber) {
            // 转换成张
            canMaxNumberZhang = division(canMaxNumber, this.multiplier);
          }
          // 超出最大数量
          if (vol > Number(canMaxNumberZhang)) {
            // 超出最大下单量，最多还可以下单
            this.formData_3.errorText = `${this.lanText.text56} ${canMaxNumber} ${this.volUnit}`;
            flag = false;
            return false;
          }

          if (vol > maxLimitVolume) {
            let Tn = maxLimitVolume;
            // 如果是标记货币
            if (this.coUnitType === 1) {
              Tn = nul(maxLimitVolume, this.multiplier);
            }
            // 超出单次最大下单量，最多可输入
            this.formData_3.errorText = `${this.lanText.text44}${Tn} ${this.volUnit}！`;
            flag = false;
          }
          // 超出最小数量
          if (vol < minOrderVolume) {
            let Tn = minOrderVolume;
            // 如果是标记货币
            if (this.coUnitType === 1) {
              Tn = nul(minOrderVolume, this.multiplier);
            }
            // 超出单次最小下单量，最少需输入
            this.formData_3.errorText = `${this.lanText.text45}${Tn} ${this.volUnit}！`;
            flag = false;
          }
          // 验证平仓数量 是否超出可平数量
          if (this.zhiJianCang || this.transactionType === 2) {
            // 可平数量
            const Kp = sideType === 'SELL' ? Number(this.maxCanSellNumber) : Number(this.maxCanBuyNumber);
            // 如果当前单位是标的货币
            if (this.coUnitType === 1) {
              vol = nul(vol, this.multiplier);
            }
            if (vol > Kp) {
              this.formData_3.errorText = this.lanText.text46; // '超出可平数量！';
              flag = false;
            }
          }
        }
      }
      this.setHeight();
      return flag;
    },
    // 表单 非空 验证
    formVerify() {
      let flag = true;
      const { sideType } = this;
      // 百分比数量
      const BfbVol = this.countPercentageVlaue(sideType);
      // 验证限价
      if (this.currentCategory === 1) {
        if (!this.inputPrice) {
          this.formData_1.errorText = this.lanText.text47; // '请输入价格!';
          flag = false;
        }
        if (!this.inputVolume && !BfbVol) {
          this.formData_3.errorText = this.lanText.text48; // '请输入数量!';
          flag = false;
        }
      }
      // 验证市价
      if (this.currentCategory === 2 && !BfbVol) {
        if (!this.inputVolume && this.orderSide === 'OPEN') {
          this.formData_3.errorText = this.lanText.text49; // '请输入开仓价值!';
          flag = false;
        }
        if (!this.inputVolume && this.orderSide === 'CLOSE') {
          this.formData_3.errorText = this.lanText.text48; // '请输入数量!';
          flag = false;
        }
      }
      // 验证条件单
      if (this.currentCategory === 3) {
        // 触发价
        if (!this.triggerPrice) {
          this.formData_1.errorText = this.lanText.text50; // '请输入触发价!';
          flag = false;
        }
        // 价格
        if (!this.inputPrice && !this.isMarket) {
          this.formData_2.errorText = this.lanText.text47; // '请输入价格!';
          flag = false;
        }
        // 数量
        if (!this.inputVolume && !this.isMarket && !BfbVol) {
          this.formData_3.errorText = this.lanText.text48; // '请输入数量!';
          flag = false;
        }
        if (!this.inputVolume && this.isMarket && this.orderSide === 'OPEN' && !BfbVol) {
          this.formData_3.errorText = this.lanText.text49; // '请输入开仓价值!';
          flag = false;
        }
      }
      this.setHeight();
      return flag;
    },
    // 验证保证金是否足够
    amountVerify() {
      // 保证金数量
      let marginCoinVol = this.canBuyCostNumber;
      // 确认按钮class
      if (this.sideType === 'SELL') {
        marginCoinVol = this.canSellCostNumber;
      }
      if (Number(marginCoinVol) > Number(this.canUseAmount)) {
        // 保证金余额不足！
        this.$bus.$emit('tip', { text: this.lanText.text51, type: 'error' });
        return false;
      }
      return true;
    },
    // 点击买入卖出按钮
    submitForm(sideType) {
      this.sideType = sideType;
      // 如果没有登录跳转登录页面
      if (!this.isLogin) {
        if (this.isIframe) {
          window.parent.postMessage('login', '*');
        } else {
          this.$router.push('/login');
        }
      }
      // 表单非空验证
      if (!this.formVerify()) return false;
      // 表单价格 数量 大小验证
      if (!this.formNumberVerify(sideType)) return false;
      // 验证保证金余额是够足够
      if (!this.amountVerify()) return false;

      // 百分比的数量 || 输入的数量 (张)
      const volume = this.countPercentageVlaue(sideType) || this.inputVolume;
      let submitVolume = volume;

      // 如果不是市价开仓
      if (!this.isOpenAndIsMarket && submitVolume) {
        // 转换成张
        submitVolume = fixD(submitVolume, 0);
      }

      this.submitData = {
        contractId: this.contractId, // 合约ID
        positionType: this.marginModel, // 持仓类型(1 全仓，2 仓逐)
        side: this.sideType, // 买卖方向（buy 买入，sell 卖出）
        leverageLevel: this.nowLevel, // 杠杆倍数
        price: this.inputPrice, // 下单价格(市价单传0)
        volume: submitVolume, // 下单数量(开仓 市价单：开仓价值)
        triggerPrice: this.triggerPrice, // 触发价格
        open: this.orderSide, // 开平仓方向(open 开仓，close 平仓)
        type: this.submitOrderType, // 订单类型 (1 limit， 2 market，3 IOC，4 FOK，5 POST_ONLY)
        isConditionOrder: this.currentCategory === 3, // 是否是条件单
        // expireTime: this.expireTime, // 到期时间
      };

      // 判断用户是否设置了开启二次确认
      if (this.userConfig && this.userConfig.pcSecondConfirm) {
        let sideTypeData = this.buttosContent.buyButton;
        // 保证金数量
        let marginCoinVol = this.canBuyCostNumber;
        // 确认按钮class
        let sideClass = 'u-1-bg';
        if (this.sideType === 'SELL') {
          sideTypeData = this.buttosContent.sellButton;
          marginCoinVol = this.canSellCostNumber;
          sideClass = 'u-4-bg';
        }
        // 数量
        let vol = `${volume} ${this.volUnit}`;
        // 市价开仓
        if (this.orderSide === 'OPEN' && (this.currentCategory === 2 || this.isMarket)) {
          // 反向
          let unit = this.contractInfo.base;
          // 正向
          if (this.contractSide === 1) {
            unit = this.priceUnit;
          }
          vol = `${volume} ${unit}`;
        } else if (this.coUnitType === 1) {
          // 如果当前单位是标的货币 就 把张 换算成 标的数量
          vol = `${fixD(nul(volume, this.multiplier), this.volfix)} ${this.volUnit}`;
        }
        this.confirmData = {
          // 币种
          symbol: this.contractSymbol,
          // 订单类型Number（1限价单、2市价单、3条件单）
          currentCategory: this.currentCategory,
          // 确认按钮文案（买入做多...）
          sideText: sideTypeData.text,
          // 确认按钮颜色class
          sideClass,
          // 是否是开仓市价单
          isOpenAndIsMarket: this.isOpenAndIsMarket,
          // 条件单 触发价
          triggerPrice: `${this.triggerPrice} ${this.priceUnit}`,
          // 价格
          price: this.inputPrice ? `${this.inputPrice} ${this.priceUnit}` : '市价',
          // 数量
          vol,
          marginCoin: `${marginCoinVol} ${this.marginCoin}`,
        };
        this.forcedReminderShow = true;
      } else {
        this.dialogConfirmLoading = true;
        this.submit();
      }
      return false;
    },
    // 下单提交
    submit() {
      if (this.submitFlag) {
        this.submitFlag = false;
        this.axios({
          url: this.$store.state.url.futures.orderCreate,
          hostType: 'co',
          method: 'post',
          params: this.submitData,
        }).then(({ code, msg }) => {
          if (code.toString() === '0') {
            this.clearFormData();
            this.$store.dispatch('getUserConfig');
            this.$store.dispatch('getPositionList');
            this.forcedReminderShow = false;
            this.$bus.$emit('CRAET-ORDER-SUCCESS');
            this.$bus.$emit('tip', { text: msg, type: 'success' });
          } else {
            this.$bus.$emit('tip', { text: msg, type: 'error' });
          }
          this.dialogConfirmLoading = false;
          this.submitFlag = true;
        });
      }
    },
    // 下单二次确认提交
    submitOrder(data) {
      if (data) {
        this.axios({
          url: this.$store.state.url.futures.editUserPageConfig,
          hostType: 'co',
          method: 'post',
          params: {
            pcSecondConfirm: 0,
            contractId: this.contractId,
          },
        }).then(({ code, msg }) => {
          if (code.toString() === '0') {
            this.$store.dispatch('getUserConfig');
          } else {
            this.$bus.$emit('tip', { text: msg, type: 'error' });
          }
        });
      }
      this.dialogConfirmLoading = true;
      this.submit();
    },
    // 关闭弹窗
    closeDialog() {
      // 关闭强制提醒（二次确认）弹框
      this.forcedReminderShow = false;
      // 关闭杠杆弹窗
      this.leverageDialogShow = false;
      // 关闭切换保证金模式弹框
      this.depositDialogShow = false;
    },
    // 选择 到期时间
    selectPlanType(val) {
      this.expireTime = val;
    },
    setHeight() {
      let setTimer = setTimeout(() => {
        const layoutHeight = document.getElementById('layoutBlockTrade') && document.getElementById('layoutBlockTrade').clientHeight;
        const coTradeBoxHeight = document.getElementById('coTradeBox').clientHeight;
        const syHeight = layoutHeight - coTradeBoxHeight - 15;
        this.$bus.$emit('syHeight', syHeight);
        clearTimeout(setTimer);
        setTimer = null;
      }, 100);
    },
    thousandsComma(num) {
      if (num) {
        return thousandsComma(num);
      }
      return num;
    },
    evenHandMouseenter(key, type) {
      this[key] = type;
    },
    evenHandMouseleave(key) {
      this[key] = null;
    },
  },

};
