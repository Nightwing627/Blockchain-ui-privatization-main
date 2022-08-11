/*
@ 计算器
@author HDD */
import {
  imgMap,
  colorMap,
  division,
  nul,
  fixD,
  fixInput,
  add,
  cut,
  thousandsComma,
} from '@/utils';

export default {
  name: 'calculatorMode',
  data() {
    return {
      imgMap,
      colorMap,
      marginModel: 1,
      // 隐藏底部按钮
      haveOption: false,
      tableLoading: false,
      // 是否加载成功
      dialogConfirmLoading: false,
      //  表格数据
      tableDataList: [],
      // 选中的类型
      categoryType: 1,
      // 下单方向
      sideType: 1,
      // 表单
      formData_1: {
        title: '',
        units: this.priceUnit,
        fix: 8,
        errorText: null,
        value: null,
        isShow: true,
      },
      formData_2: {
        title: '',
        units: this.priceUnit,
        fix: 8,
        errorText: null,
        value: null,
        isShow: true,
      },
      formData_3: {
        title: '',
        units: '',
        fix: 8,
        errorText: null,
        value: null,
        isShow: true,
      },
      // 杠杆
      stepPosition: 1,
      currenttage: 1,
      movement: 0,
      // 杠杆值
      leverage: 0,
      // 最小杠杆倍数
      minLeverage: 1,
      // 最大杠杆倍数
      maxLeverage: 100,
      // 当前杠杆最高可持有仓位上限
      maxNumber: 0,
      // 开仓保证金
      openMargin: 0.00,
      openMargin_opi: 0,
      openMarginClass: '',
      // 收益额
      revenue: 0.00,
      revenue_opi: 0,
      revenueClass: '',
      // 平仓价格
      closePrice: 0.00,
      closePriceClass: '',
      // 强平价格
      forceClosePrice: 0.00,
      forceClosePriceClass: '',
      forceClosePriceNUm: true,
      // 维持保证金率列表
      ladderList: [],
      // 头寸列表
      leverCeiling: {},
      // 杠杆输入框选中Class
      inputActiveClass: '',

    };
  },
  props: {
    isShow: {
      default: false,
      type: Boolean,
    },
    close: {
      default() {},
      type: Function,
    },
    dataInfo: {
      default: () => {},
      type: Object,
    },
  },
  computed: {
    lanText() {
      return {
        text1: this.$t('futures.calculator.text1'), // 计算器"
        text2: this.$t('futures.calculator.text2'), // 杠杆"
        text3: this.$t('futures.calculator.text3'), // 当前杠杆最高可持有头寸数"
        text4: this.$t('futures.calculator.text4'), // 计算"
        text5: this.$t('futures.calculator.text5'), // 计算结果"
        text6: this.$t('futures.calculator.text6'), // 开仓保证金"
        text7: this.$t('futures.calculator.text7'), // 收益额"
        text8: this.$t('futures.calculator.text8'), // 回报率"
        text9: this.$t('futures.calculator.text9'), // 平仓价格"
        text10: this.$t('futures.calculator.text10'), // 无法达到该收益率"
        text11: this.$t('futures.calculator.text11'), // 强平价格"
        text12: this.$t('futures.calculator.text12'), // 开仓价格"
        text13: this.$t('futures.calculator.text13'), // 平仓价格"
        text14: this.$t('futures.calculator.text14'), // 数量"
        text15: this.$t('futures.calculator.text15'), // 张"
        text16: this.$t('futures.calculator.text16'), // 收益"
        text17: this.$t('futures.calculator.text17'), // 多仓"
        text18: this.$t('futures.calculator.text18'), // 空仓"
        text19: this.$t('futures.calculator.text19'), // 买入做多"
        text20: this.$t('futures.calculator.text20'), // 卖出做空"
        text21: this.$t('futures.calculator.text21'), // 仓位数量"
        text22: this.$t('futures.calculator.text22'), // 保证金数量"
        text23: this.$t('futures.calculator.text23'), // 保证金不足以开仓
        text24: this.$t('futures.calculator.text24'), // 不会被强制平仓
      };
    },
    // 用户配置信息
    userConfig() {
      return this.$store.state.future.futureUserConfig;
    },
    // 当前合约信息
    contractInfo() {
      return this.$store.state.future.contractInfo;
    },
    // 当前合约ID
    contractId() {
      return this.$store.state.future.contractId;
    },
    // 当前合约方向（1正向、0反向）
    contractSide() {
      if (this.contractInfo) {
        return this.contractInfo.contractSide;
      }
      return 1;
    },
    // 当前合约保证金汇率
    marginRate() {
      if (this.contractInfo) {
        return this.contractInfo.marginRate;
      }
      return 1;
    },
    // 数量单位类型Number(1标的货币 2张)
    coUnitType() {
      return this.$store.state.future.coUnitType;
    },
    // 合约数量单位
    volUnit() {
      return this.$store.state.future.coUnit;
    },
    // 当前合约数量精度
    volfix() {
      if (this.coUnitType === 1) {
        return this.$store.state.future.volfix;
      }
      return 0;
    },
    volfix_two() {
      return this.$store.state.future.volfix;
    },
    // *
    // 当前合约价格单位
    priceUnit() {
      return this.$store.state.future.priceUnit;
    },
    // 当前合约面值
    multiplier() {
      return Number(this.$store.state.future.multiplier) || 1;
    },
    // 当前合约价格精度
    pricefix() {
      return this.$store.state.future.pricefix;
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
    // 用户信息配置-可持有仓位上限
    // leverCeiling() {
    //   if (this.userConfig) {
    //     return this.userConfig.leverCeiling;
    //   }
    //   return null;
    // },
    // 类型（收益，平仓价格， 强平价格）
    categoryTypeList() {
      return [
        {
          id: 1,
          text: this.lanText.text16, // '收益',
          classes: this.categoryType === 1 ? 'u-8-bg' : 'a-3-bg',
        },
        {
          id: 2,
          text: this.lanText.text13, // '平仓价格',
          classes: this.categoryType === 2 ? 'u-8-bg' : 'a-3-bg',
        },
        {
          id: 3,
          text: this.lanText.text11, // '强平价格',
          classes: this.categoryType === 3 ? 'u-8-bg' : 'a-3-bg',
        },
      ];
    },
    // 类型（收益，平仓价格， 强平价格）
    sideTypeList() {
      if (this.categoryType === 3) {
        return [
          {
            id: 1,
            text: this.lanText.text17, // '多仓',
            classes: this.sideType === 1 ? 'u-1-bg' : 'a-3-bg',
          },
          {
            id: 2,
            text: this.lanText.text18, // '空仓',
            classes: this.sideType === 2 ? 'u-4-bg' : 'a-3-bg',
          },
        ];
      }
      return [
        {
          id: 1,
          text: this.lanText.text19, // '买入做多',
          classes: this.sideType === 1 ? 'u-1-bg' : 'a-3-bg',
        },
        {
          id: 2,
          text: this.lanText.text20, // '卖出做空',
          classes: this.sideType === 2 ? 'u-4-bg' : 'a-3-bg',
        },
      ];
    },
    // 杠杆选项
    itemLvaue() {
      return division(this.maxLeverage, 5);
    },
    // 杠杆
    feeValue() {
      return division(this.maxLeverage, 100);
    },
    // 是否禁止提交
    dialogConfirmDisabled() {
      return !this.formVerify();
    },
    // 回报率
    reportRate() {
      // 回报率 = 收益额 / 保证金 * 100%
      if (this.openMargin_opi && this.revenue_opi) {
        return fixD((this.revenue_opi / this.openMargin_opi) * 100, 2);
      }
      return 0;
    },
    reportRateClass() {
      if (this.reportRate) {
        if (Number(this.reportRate) > 0) {
          return 'u-1-cl';
        }
        if (Number(this.reportRate) < 0) {
          return 'u-4-cl';
        }
      }
      return '';
    },
    // 标记价格
    tagPrice() {
      const { publicMarkertInfo } = this.$store.state.future;
      if (publicMarkertInfo) {
        // 标记价格
        return publicMarkertInfo.tagPrice;
      }
      return 0;
    },

  },
  watch: {
    dataInfo(val) {
      if (val.brokerId) {
        this.getStopList();
        this.initForm();
      }
    },
    isShow(val) {
      if (val) {
        this.init();
      }
      this.initForm();
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

    currenttage(val) {
      if (val || val === 0) {
        if (val > 100) {
          this.currenttage = 100;
        }
        if (val < 2) {
          this.leverage = 1;
        } else {
          this.leverage = Math.round(nul(this.currenttage, this.feeValue));
        }
      } else {
        this.leverage = '';
      }
    },
    leverage(val) {
      if (val) {
        this.leverage = fixInput(val, 0);
        if (Number(val) > this.maxLeverage) {
          this.leverage = this.maxLeverage;
        }
        this.setPosition();
        this.setMaxNumber();
      }
    },

  },
  methods: {
    init() {
      // 初始化表单
      this.initForm();
      // 获取阶梯设置
      this.getladderList();
      if (this.userConfig) {
        this.leverage = this.userConfig.nowLevel;
        this.minLeverage = this.userConfig.minLevel;
        this.maxLeverage = this.userConfig.maxLevel;
      } else {
        this.leverage = 20;
      }
      document.onmouseup = () => {
        document.onmousemove = null;
      };
    },
    // 设置表单参数
    initForm() {
      this.openMargin = 0.00;
      this.revenue = 0.00;
      this.closePrice = 0.00;
      this.forceClosePrice = 0.00;
      this.openMarginClass = '';
      this.revenueClass = '';
      this.closePriceClass = '';
      this.forceClosePriceClass = '';
      //
      this.formData_1.value = null;
      this.formData_2.value = null;
      this.formData_3.value = null;

      this.formData_1.errorText = null;
      this.formData_2.errorText = null;
      this.formData_3.errorText = null;

      this.formData_1.title = this.lanText.text12; // '开仓价格';
      this.formData_2.title = this.lanText.text13; // '平仓价格';
      this.formData_3.title = this.lanText.text14; // '数量';

      this.formData_1.units = this.priceUnit;
      this.formData_2.units = this.priceUnit;
      this.formData_3.units = this.volUnit;

      this.formData_1.fix = this.pricefix;
      this.formData_2.fix = this.pricefix;
      this.formData_3.fix = this.volfix;

      this.formData_3.isShow = true;

      if (this.categoryType === 2) {
        this.formData_2.title = this.lanText.text8; // '回报率';
        this.formData_2.units = '%';
        this.formData_2.fix = 2;

        this.formData_3.isShow = false;
      }
      if (this.categoryType === 3) {
        this.formData_2.title = this.lanText.text21; // '仓位数量';
        this.formData_3.title = this.lanText.text22; // '保证金数量';

        this.formData_2.units = this.volUnit;
        this.formData_3.units = this.marginCoin;

        this.formData_2.fix = this.volfix;
        this.formData_3.fix = this.marginCoinFix;
      }
    },
    // 表单输入事件
    changeInput(type, value) {
      this[type].value = value;
    },
    // 表单验证
    formVerify() {
      if (!this.formData_1.value || !this.formData_2.value) {
        return false;
      }
      if (this.categoryType !== 2 && !this.formData_3.value) {
        return false;
      }
      return true;
    },
    // 提交订单
    submit() {
      if (!this.formVerify()) return;
      // 计算收益
      const openPrice = this.formData_1.value; // 开仓价格
      let closePrice = this.formData_2.value; // 平仓价格 || 回报率 || 3:仓位数量
      let volume = this.setNumber(this.formData_3.value); // 数量 || 3:保证金数量
      if (this.categoryType === 1) {
        // 开仓保证金**（this.contractSide 1：正向  0：反向）
        // 正向合约：所需保证金=初始保证金 = 数量 * 开仓价格 / 杠杆 / 保证金汇率
        // 反向合约：所需保证金=初始保证金 = 数量 / 开仓价格 / 杠杆 / 保证金汇率
        const v1 = this.contractSide === 1 ? nul(volume, openPrice) : division(volume, openPrice);
        const v2 = division(division(v1, this.leverage), this.marginRate);
        this.openMargin_opi = v2;
        this.openMargin = fixD(v2, this.marginCoinFix);

        if (Number(this.openMargin) > 0) {
          this.openMarginClass = 'u-1-cl';
        }
        if (Number(this.openMargin) < 0) {
          this.openMarginClass = 'u-4-cl';
        }
        // 收益额
        // 正向合约：
        //   买入做多 收益额=（平仓价格 - 开仓价格）* 数量 / 保证金汇率
        //   卖出做空 收益额=（平仓价格 - 开仓价格）* 数量 / 保证金汇率 * -1
        // 反向合约：
        //   买入做多 收益额=（1/平仓价格 - 1/开仓价格）* 数量 / 保证金汇率 * -1
        //   卖出做空 收益额=（1/平仓价格 - 1/开仓价格）* 数量 / 保证金汇率
        let n2;
        if (this.contractSide === 1) {
          n2 = closePrice - openPrice;
        } else {
          n2 = division(1, closePrice) - division(1, openPrice);
        }
        const n3 = division(nul(n2, volume), this.marginRate);
        // 买入做多
        let revenue = this.contractSide === 1 ? n3 : n3 * -1;
        if (this.sideType === 2) {
          // 卖出做空
          revenue = this.contractSide === 1 ? n3 * -1 : n3;
        }
        this.revenue_opi = revenue;
        this.revenue = fixD(revenue, this.marginCoinFix);
        if (Number(this.revenue) > 0) {
          this.revenueClass = 'u-1-cl';
        }
        if (Number(this.revenue) < 0) {
          this.revenueClass = 'u-4-cl';
        }
        // this.contractSide === 1
      }

      // 计算平仓价格
      if (this.categoryType === 2) {
        // 平仓价格
        // （单位：计价货币）
        // 正向合约：
        // 买入做多 平仓价格 = 开仓价格 *（杠杆 + 回报率） / 杠杆
        // 卖出做空 平仓价格 = 开仓价格 *（杠杆 - 回报率） / 杠杆
        // 反向合约：
        // 买入做多 平仓价格 = 开仓价格 * 杠杆  /  （杠杆 - 回报率）
        // 卖出做空 平仓价格 = 开仓价格 * 杠杆  /  （杠杆 + 回报率）
        const reportRate = division(closePrice, 100);
        // 杠杆 + 回报率
        let M1 = add(this.leverage, reportRate);
        // 杠杆 - 回报率
        if ((this.contractSide === 1 && this.sideType === 2)
        || (this.contractSide === 0 && this.sideType === 1)) {
          M1 = cut(this.leverage, reportRate);
        }
        let value;
        // 正向
        if (this.contractSide === 1) {
          value = division(nul(openPrice, M1), this.leverage);
        } else {
          value = division(nul(openPrice, this.leverage), M1);
        }
        if (value <= 0) {
          this.closePrice = 'none';
        } else {
          this.closePrice = fixD(value, this.pricefix);
          if (Number(this.closePrice) > 0) {
            this.closePriceClass = 'u-1-cl';
          }
          if (Number(this.closePrice) < 0) {
            this.closePriceClass = 'u-4-cl';
          }
        }
      }
      if (this.categoryType === 3) {
        // 强平价格
        // （单位：计价货币）
        // 正向合约：
        // 多仓 强平价格 = （保证金数量 / 保证金汇率 - 仓位数量 * 开仓价格） / （（维持保证金率 + 手续费率 - 1）* 仓位数量）
        // 空仓 强平价格 = （保证金数量 / 保证金汇率 + 仓位数量 * 开仓价格） / （（维持保证金率 + 手续费率 + 1）* 仓位数量 ）
        // 反向合约：
        // 多仓 强平价格 = （（维持保证金率 + 手续费率 + 1）* 仓位数量）/ （保证金数量 / 保证金汇率 - 仓位数量 / 开仓价格）
        // 空仓 强平价格 = （（维持保证金率 + 手续费率 - 1）* 仓位数量）/ （保证金数量 / 保证金汇率 + 仓位数量 / 开仓价格）
        // 维持保证金率 = （仓位数量 * 标记价格）所在的挡位的维持保证金率
        // 手续费=0.00075
        // this.marginRate  保证金汇率
        closePrice = this.setNumber(this.formData_2.value); // 3:仓位数量
        volume = this.formData_3.value; // 3:保证金数量
        const sRate = 0.00075; // 手续费
        const Y1 = closePrice * this.tagPrice; // 仓位数量 * 标记价格
        const mRate = this.getladderValue(Y1); // 获取维持保证金率
        // 保证金数量 / 保证金汇率
        const Y2 = division(volume, this.marginRate);
        // 正向 = 仓位数量 * 开仓价格
        // 反向 = 仓位数量 / 开仓价格
        const Y3 = this.contractSide === 1
          ? nul(closePrice, openPrice)
          : division(closePrice, openPrice);
        // 正向 多仓 || 反向 空仓 = 保证金数量 / 保证金汇率 - 仓位数量 * 开仓价格 :
        let Y4 = cut(Y2, Y3);
        // 正向 多仓 || 反向 空仓 = （维持保证金率 + 手续费率 - 1）
        let Y5 = cut(add(mRate, sRate), 1);
        //  正向 空仓 || 反向 多仓
        if ((this.contractSide === 1 && this.sideType === 2)
        || (this.contractSide === 0 && this.sideType === 1)) {
          // 保证金数量 / 保证金汇率 + 仓位数量 * 开仓价格
          Y4 = add(Y2, Y3);
          // 维持保证金率 + 手续费率 + 1
          Y5 = add(add(mRate, sRate), 1);
        }

        // Y5 * 仓位数量
        const Y6 = nul(Y5, closePrice);
        const value = this.contractSide === 1 ? division(Y4, Y6) : division(Y6, Y4);

        // 多仓：强平价格>开仓价格 时 不显示强平价格，显示：保证金不足以开仓！
        if (this.sideType === 1 && value > openPrice) {
          this.forceClosePrice = this.lanText.text23; // '保证金不足以开仓';
          this.forceClosePriceNUm = false;
          this.forceClosePriceClass = 'u-4-cl';
        } else if (this.sideType === 2 && value < openPrice) {
          this.forceClosePrice = this.lanText.text23; // '保证金不足以开仓';
          this.forceClosePriceNUm = false;
          this.forceClosePriceClass = 'u-4-cl';
        } else {
          this.forceClosePrice = this.thousandsComma(fixD(value, this.pricefix));
          this.forceClosePriceNUm = true;
          if (Number(value) > 0) {
            this.forceClosePriceClass = 'u-1-cl';
          }
          if (Number(value) < 0) {
            // 不会被强制平仓
            this.forceClosePrice = this.lanText.text24;
            this.forceClosePriceNUm = false;
            this.forceClosePriceClass = 'u-4-cl';
          }
        }
      }
    },

    // 设置数量（把张换成量）
    setNumber(volume) {
      // 如果当前数量单位是张
      if (this.coUnitType === 2 && volume && this.multiplier) {
        return fixD(nul(volume, this.multiplier), this.volfix_two);
      }
      return volume;
    },
    // 切换 /收益/平仓价格/强平价格
    switchType(type, id) {
      if (this[type] !== id) {
        this[type] = id;
        this.initForm();
        this.openMargin_opi = 0;
        this.revenue_opi = 0;
      }
    },
    // 设置最大持仓上限
    setMaxNumber() {
      let num = 0;
      if (this.leverCeiling) {
        const keyArr = Object.keys(this.leverCeiling);
        keyArr.sort((a, b) => parseFloat(a) - parseFloat(b));
        let nextL = 0;
        for (let index = 0; index < keyArr.length; index += 1) {
          if (Number(this.leverage) > nextL && Number(this.leverage) <= keyArr[index]) {
            num = this.leverCeiling[keyArr[index]];
          }
          nextL = keyArr[index];
        }
        // 标的货币
        if (this.coUnitType === 1) {
          this.maxNumber = fixD(num, this.volfix);
        }
        // 张
        if (this.coUnitType === 2) {
          this.maxNumber = fixD(division(num, this.multiplier), 0);
        }
      }
    },
    // 设置滑竿位置
    setPosition() {
      if (this.leverage) {
        if (this.leverage < 2) {
          this.stepPosition = 0;
        } else {
          this.stepPosition = division(this.leverage, this.feeValue);
        }
      } else {
        this.stepPosition = 1;
      }
    },
    onmousedownCick(e) {
      const bar = this.$refs.dragStepWrap;
      const barLeft = bar.getBoundingClientRect().x;
      const oevent = e || window.event;
      const leftVal = oevent.clientX - barLeft;
      const stepPosition = parseInt(nul(division(leftVal, bar.offsetWidth), 100), 0);
      this.stepPosition = stepPosition < 1 ? 1 : stepPosition;
      this.currenttage = stepPosition < 1 ? 1 : stepPosition;
    },
    // 杠杆滑动
    onmousedown(event) {
      let oevent = event || window.event;
      const self = this.$refs.dragStep;
      const bar = this.$refs.dragStepWrap;
      const leftVal = oevent.clientX - self.offsetLeft;
      document.onmousemove = (e) => {
        oevent = e || window.event;
        let movement = oevent.clientX - leftVal;
        if (movement < 0) {
          movement = 0;
        } else if (movement > bar.offsetWidth) {
          movement = bar.offsetWidth;
        }
        const stepPosition = parseInt(nul(division(movement, bar.offsetWidth), 100), 0);
        this.stepPosition = stepPosition < 1 ? 1 : stepPosition;
        this.currenttage = stepPosition < 1 ? 1 : stepPosition;
        document.onmouseup = () => {
          document.onmousemove = null;
        };
      };
      document.onmouseup = () => {
        document.onmousemove = null;
      };
    },
    // 点击 滑动到指定倍数位置
    dragStep(index) {
      this.stepPosition = nul(index, 20);
      this.currenttage = nul(index, 20);
      this.$emit('levelChange', index);
    },
    // 乘法
    nulFun(val1, val2) {
      return Math.round(nul(val1, val2));
    },
    // 获取当前维持保证金率的值
    getladderValue(value) {
      let rate = 0;
      if (this.ladderList && this.ladderList.length) {
        rate = this.ladderList[this.ladderList.length - 1].minMarginRate;
        if (value === 0) {
          rate = this.ladderList[0].minMarginRate;
        } else {
          this.ladderList.forEach((item) => {
            if (value > item.minPositionValue && value <= item.maxPositionValue) {
              rate = item.minMarginRate;
            }
          });
        }
      }
      return rate;
    },
    // 获取阶梯设置列表
    getladderList() {
      this.axios({
        url: this.$store.state.url.futures.getLadderInfo,
        method: 'post',
        hostType: 'co',
        params: {
          contractId: this.contractId,
        },
      }).then((rs) => {
        this.tableLoading = false;
        if (rs.code === '0' && rs.data) {
          if (rs.data.ladderList) {
            this.ladderList = rs.data.ladderList.ladderList || [];
          }
          if (rs.data.leverList) {
            const leverListInfor = rs.data.leverList;
            this.minLeverage = leverListInfor.minLever;
            this.maxLeverage = leverListInfor.maxLever;
          }
          if (rs.data.leverCeiling) {
            this.leverCeiling = rs.data.leverCeiling;
          }
          if (!this.userConfig) {
            this.leverage = 20;
          }
        }
      });
    },
    // 加
    add() {
      if (Number(this.leverage) < Number(this.maxLeverage)) {
        const leverage = Number(this.leverage) + 1;
        this.leverage = leverage;
      }
    },
    // 减
    subtract() {
      if (Number(this.leverage) > 1) {
        const leverage = Number(this.leverage) - 1;
        this.leverage = leverage;
      }
    },
    thousandsComma(num) {
      if (num) {
        return thousandsComma(num);
      }
      return num;
    },
  },
};
