import {
  imgMap,
  colorMap,
  division,
  cut,
  nul,
  fixD,
  thousandsComma,
} from '@/utils';

export default {
  name: 'stopOrderMode',
  data() {
    return {
      imgMap,
      colorMap,
      marginModel: 1,
      tableLoading: false,
      // 是否加载成功
      dialogConfirmLoading: false,
      //  表格数据
      tableDataList: [],
      // 表单
      formData_1: {
        title: '',
        units: this.priceUnit,
        fix: 8,
        errorText: null,
        value: null,
      },
      formData_2: {
        title: '',
        units: this.priceUnit,
        fix: 8,
        errorText: null,
        value: null,
      },
      formData_3: {
        title: '',
        units: '',
        fix: 8,
        errorText: null,
        value: null,
      },
      formData_4: {
        title: '',
        units: this.priceUnit,
        fix: 8,
        errorText: null,
        value: null,
      },
      formData_5: {
        title: '',
        units: this.priceUnit,
        fix: 8,
        errorText: null,
        value: null,
      },
      formData_6: {
        title: '',
        units: '',
        fix: 8,
        errorText: null,
        value: null,
      },
      // 止盈是否是市价
      isMarket_profit: true,
      // 止损是否是市价
      isMarket_loss: true,
      // 止盈数量
      takeProfitCount: null,
      // 止损数量
      stopLossCount: null,
      // 止盈数量列表
      takeProfitList: [],
      // 止损数量列表
      stopLossList: [],
      // 防止重复提交
      sumbitFla: true,
      // 防止重复取消订单
      cancelFla: true,
      // 到期时间
      expireTime: '14',
      // 2小时行情数据WS
      WsData: {},
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
        titleText: this.$t('futures.stopOrder.titleText'), // '止盈止损',
        text1: this.$t('futures.stopOrder.text1'), // '止盈',
        text2: this.$t('futures.stopOrder.text2'), // '撤销所有止盈单',
        text3: this.$t('futures.stopOrder.text3'), // '止盈价需大于标记价格',
        text4: this.$t('futures.stopOrder.text4'), // '止盈价需小于标记价格',
        text5: this.$t('futures.stopOrder.text5'), // '预计盈亏',
        text6: this.$t('futures.stopOrder.text6'), // '预计收益率',
        text7: this.$t('futures.stopOrder.text7'), // '止损',
        text8: this.$t('futures.stopOrder.text8'), // '撤销所有止损单',
        text9: this.$t('futures.stopOrder.text9'), // '止损价需小于标记价格，大于强平价格',
        text10: this.$t('futures.stopOrder.text10'), // '止损价需大于标记价格，小于强平价格',
        text11: this.$t('futures.stopOrder.text11'), // '预计盈亏',
        text12: this.$t('futures.stopOrder.text12'), // '预计收益率',
        text13: this.$t('futures.stopOrder.text13'), // '止盈触发价',
        text14: this.$t('futures.stopOrder.text14'), // '委托价格',
        text15: this.$t('futures.stopOrder.text15'), // '委托数量',
        text16: this.$t('futures.stopOrder.text16'), // '张',
        text17: this.$t('futures.stopOrder.text17'), // '止损触发价',
        text18: this.$t('futures.stopOrder.text18'), // '委托价格',
        text19: this.$t('futures.stopOrder.text19'), // '量',
        text20: this.$t('futures.stopOrder.text20'), // '价格',
        text21: this.$t('futures.stopOrder.text21'), // '止盈价需大于标记价格！',
        text22: this.$t('futures.stopOrder.text22'), // '止盈价需小于标记价格！',
        text23: this.$t('futures.stopOrder.text23'), // '止损价需小于标记价格！',
        text24: this.$t('futures.stopOrder.text24'), // '止损价需大于强平价格！',
        text25: this.$t('futures.stopOrder.text25'), // '止损价需大于标记价格！',
        text26: this.$t('futures.stopOrder.text26'), // '止损价需小于强平价格！',
        text27: this.$t('futures.stopOrder.text27'), // '价格偏差太大！',
        text28: this.$t('futures.stopOrder.text28'), // '超出可平数量！',
        text29: this.$t('futures.stopOrder.text29'), // '有效期',
        text30: this.$t('futures.stopOrder.text30'), // '市价',
        columns1: this.$t('futures.stopOrder.columns1'), // '合约',
        columns2: this.$t('futures.stopOrder.columns2'), // '仓位/可平',
        columns3: this.$t('futures.stopOrder.columns3'), // '成本价',
        columns4: this.$t('futures.stopOrder.columns4'), // '标记价格',
        columns5: this.$t('futures.stopOrder.columns5'), // '强平价格',
        columns6: this.$t('futures.stopOrder.columns6'), // '止盈触发价',
        columns7: this.$t('futures.stopOrder.columns7'), // '委托价格',
        columns8: this.$t('futures.stopOrder.columns8'), // '委托数量',
        columns9: this.$t('futures.stopOrder.columns9'), // '止损触发价',
        columns10: this.$t('futures.stopOrder.columns10'), // '最新价格',
        time1: this.$t('futures.stopOrder.time1'), // '24H',
        time2: this.$t('futures.stopOrder.time2'), // '7天',
        time3: this.$t('futures.stopOrder.time3'), // '14天',
        time4: this.$t('futures.stopOrder.time4'), // '30天',
      };
    },
    // 用户配置信息
    userConfig() {
      return this.$store.state.future.futureUserConfig;
    },
    // 数量单位类型Number(1标的货币 2张)
    coUnitType() {
      return this.$store.state.future.coUnitType;
    },
    // 合约数量单位
    volUnit() {
      return this.$store.state.future.coUnit;
    },
    // 表头
    columns() {
      // '量 ' : '张'
      const coUnittext = this.coUnitType === 1 ? this.lanText.text19 : this.lanText.text16;
      return [
        {
          title: this.lanText.columns1, // '合约',
        },
        {
          title: `${this.lanText.columns2}(${coUnittext})`, // 仓位/可平
        },
        {
          title: this.lanText.columns3, // '成本价',
        },
        {
          // title: this.lanText.columns4, // '标记价格',
          title: this.lanText.columns10, // '最新价格',
        },
        {
          title: this.lanText.columns5, // '强平价格',
        },
      ];
    },
    // 表头2
    columns2() {
      return [
        {
          title: this.lanText.columns6, //  '止盈触发价',
        },
        {
          title: this.lanText.columns7, //  '委托价格',
        },
        {
          title: this.lanText.columns8, //  '委托数量',
        },
      ];
    },
    // 表头3
    columns3() {
      return [
        {
          title: this.lanText.columns9, //  '止损触发价',
        },
        {
          title: this.lanText.columns7, //  '委托价格',
        },
        {
          title: this.lanText.columns8, //  '委托数量',
        },
      ];
    },
    // 是否禁止提交
    dialogConfirmDisabled() {
      return !this.formVerify();
    },
    // 仓位张数
    positionVolume() {
      // 直接取后台返回的张数
      return this.dataInfo.positionVolumeOriginal;
    },
    // 止盈预计盈亏
    takeAmount() {
      let value = '0';
      // 委托数量
      const volume = this.formData_3.value;
      // 成本价
      const { openAvgPrice, orderSide } = this.dataInfo;
      // 基础价格 （市价：触发价、 限价：委托价和）
      const price = this.isMarket_profit ? this.formData_1.value : this.formData_2.value;
      if (!volume || !price) return value;
      let V1;
      if (orderSide === 'BUY') {
        // 多仓 基础价格 - 成本价
        V1 = cut(price, openAvgPrice);
      } else {
        // 空仓 成本价 - 基础价格
        V1 = cut(openAvgPrice, price);
      }
      // 市价止盈 = N1 * 委托数量
      value = nul(V1, this.volumeNumber(volume));
      return `${value}`;
    },
    // 止损预计盈亏
    lossAmount() {
      let value = '0';
      const volume = this.formData_6.value;
      // 成本价
      const { openAvgPrice, orderSide } = this.dataInfo;
      // 基础价格 （市价：触发价、 限价：委托价和）
      const price = this.isMarket_loss ? this.formData_4.value : this.formData_5.value;
      if (!volume || !price) return value;
      let V1;
      if (orderSide === 'BUY') {
        // 多仓 基础价格 - 成本价
        V1 = cut(price, openAvgPrice);
      } else {
        // 空仓 成本价 - 基础价格
        V1 = cut(openAvgPrice, price);
      }
      // 市价止盈 = N1 * 委托数量
      value = nul(V1, this.volumeNumber(volume));
      return `${value}`;
    },
    // 止盈预计收益率
    takeAmountRate() {
      return this.returnate(this.takeAmount, this.formData_3.value);
    },
    // 止损预计收益率
    takelossAmount() {
      return this.returnate(this.lossAmount, this.formData_6.value);
    },
    // 获取止盈单最大或者最小触发价
    takeOutProfit() {
      if (!this.takeProfitList.length) return null;
      const { orderSide } = this.dataInfo;
      let value = this.takeProfitList[0];
      this.takeProfitList.forEach((item, i) => {
        const next = this.takeProfitList[i + 1] || {};
        if (orderSide === 'SELL') {
          // 空仓取最大触发价
          value = value.triggerPrice < next.triggerPrice ? next : value;
        } else {
          // 多仓取最小触发价
          value = value.triggerPrice > next.triggerPrice ? next : value;
        }
      });
      return value;
    },
    // 获取止损单最大或者最小触发价
    takeLoss() {
      if (!this.stopLossList.length) return null;
      const { orderSide } = this.dataInfo;
      let value = this.stopLossList[0];
      this.stopLossList.forEach((item, i) => {
        const next = this.stopLossList[i + 1] || {};
        if (orderSide === 'BUY') {
          // 多仓取最大触发价
          value = value.triggerPrice < next.triggerPrice ? next : value;
        } else {
          // 空仓取最小触发价
          value = value.triggerPrice > next.triggerPrice ? next : value;
        }
      });
      return value;
    },
    placeHolder_one() {
      if (this.dataInfo.orderSide === 'BUY') {
        // 价格
        return `${this.lanText.text20} > ${this.thousandsComma(this.dataInfo.indexPrice)}`;
      }
      // 价格
      return `${this.lanText.text20} < ${this.thousandsComma(this.dataInfo.indexPrice)}`;
    },
    placeHolder_two() {
      // <p v-if="dataInfo.orderSide === 'BUY'">止损价需小于标记价格，大于强平价格</p>
      //     <p v-else>止损价需大于标记价格，小于强平价格</p>
      if (this.dataInfo.orderSide === 'BUY') {
        // 价格
        return `${this.lanText.text20} < ${this.thousandsComma(this.dataInfo.indexPrice)}`;
      }
      // 价格
      return `${this.lanText.text20} > ${this.thousandsComma(this.dataInfo.indexPrice)}`;
    },
    // 到期时间
    planTypeList() {
      return [
        {
          name: this.lanText.time1, // '24H',
          id: '1',
        },
        {
          name: this.lanText.time2, // '7天',
          id: '7',
        },
        {
          name: this.lanText.time3, // '14天',
          id: '14',
        },
        {
          name: this.lanText.time4, // '30天',
          id: '30',
        },
      ];
    },
    // 最新价格
    newPrice() {
      if (this.WsData && this.dataInfo) {
        const name = `${this.dataInfo.contractType}_${this.dataInfo.symbol.replace('-', '')}`;
        const kay = name.toLowerCase();

        if (this.WsData && this.WsData[kay]) {
          return this.WsData[kay].close;
        }
        return 0.00;
      }
      return 0.00;
    },
  },
  watch: {
    dataInfo(val) {
      if (val.brokerId) {
        this.getStopList();
        this.initForm();
      }
    },
    isShow() {
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
    'formData_4.value': function formData1(value) {
      if (value && Number(value)) {
        this.formData_4.errorText = null;
      }
    },
    'formData_5.value': function formData2(value) {
      if (value && Number(value)) {
        this.formData_5.errorText = null;
      }
    },
    'formData_6.value': function formData3(value) {
      if (value && Number(value)) {
        this.formData_6.errorText = null;
      }
    },
  },
  methods: {
    init() {
      // 接收24小时行情数据
      this.$bus.$on('FUTURE_MARKET_DATA', (data) => {
        this.WsData = JSON.parse(data);
      });
    },
    // 设置精度
    setAmountFix(data) {
      const { priceFix } = this.dataInfo;
      let fix = priceFix + 2;
      if (fix > 8) {
        fix = 8;
      }
      return this.thousandsComma(fixD(data, fix));
    },
    // 收益率(预计盈亏, 委托张数)
    returnate(amount, volume) {
      // 占用保证金
      const { holdAmount } = this.dataInfo;
      if (amount && holdAmount && volume) {
        //  预计盈亏 / 占用保证金 / 委托张数  *  仓位张数
        // const Nl = division(amount, holdAmount);
        // const N2 = division(Nl, this.volumeSheet(volume));
        // const N3 = nul(N2, this.positionVolume);
        const N3 = ((amount / holdAmount) / this.volumeSheet(volume)) * this.positionVolume;
        const value = N3 * 100;
        return fixD(value, 2);
      }
      return 0.00;
    },
    // 设置数字的颜色
    returnColor(vlaue) {
      if (vlaue) {
        if (Number(vlaue) < 0) return 'u-4-cl';
        if (Number(vlaue) > 0) return 'u-1-cl';
      }
      return '';
    },
    // 委托数量 = 委托张数 * 合约面值
    volumeNumber(volume) {
      // 如果当前单位是张
      if (this.coUnitType === 2) {
        const { multiplier } = this.dataInfo;
        // 转换成量
        return multiplier ? nul(volume, multiplier) : 0;
      }
      return volume;
    },
    // 委托张数 = 委托数量 / 合约面值
    volumeSheet(volume) {
      // 如果当前单位是量
      if (this.coUnitType === 1 && volume) {
        const { multiplier } = this.dataInfo;
        // 转换成张
        return multiplier ? division(volume, multiplier) : 0;
      }
      return volume;
    },
    // 设置表单参数
    initForm() {
      let volUnit = this.dataInfo.multiplierCoin;
      if (this.coUnitType === 2) {
        volUnit = this.lanText.text16; // '张';
      }

      this.formData_1.title = this.lanText.text13; // '止盈触发价';
      this.formData_2.title = this.lanText.text14; // '委托价格';
      this.formData_3.title = this.lanText.text15; // '委托数量';
      this.formData_4.title = this.lanText.text17; // '止损触发价';
      this.formData_5.title = this.lanText.text18; // '委托价格';
      this.formData_6.title = this.lanText.text15; // '委托数量';

      this.formData_1.value = null;
      this.formData_2.value = null;
      this.formData_3.value = null;
      this.formData_4.value = null;
      this.formData_5.value = null;
      this.formData_6.value = null;
      this.formData_1.errorText = null;
      this.formData_2.errorText = null;
      this.formData_3.errorText = null;
      this.formData_4.errorText = null;
      this.formData_5.errorText = null;
      this.formData_6.errorText = null;
      this.formData_1.units = this.dataInfo.quote;
      this.formData_1.fix = this.dataInfo.priceFix;
      this.formData_2.units = this.dataInfo.quote;
      this.formData_2.fix = this.dataInfo.priceFix;
      this.formData_4.units = this.dataInfo.quote;
      this.formData_4.fix = this.dataInfo.priceFix;
      this.formData_5.units = this.dataInfo.quote;
      this.formData_5.fix = this.dataInfo.priceFix;
      this.formData_3.units = volUnit;
      this.formData_6.units = volUnit;
      if (this.coUnitType === 2) {
        this.formData_3.fix = 0;
        this.formData_6.fix = 0;
      } else {
        this.formData_3.fix = this.dataInfo.volfix;
        this.formData_6.fix = this.dataInfo.volfix;
      }
    },
    // 条件单切换 市价 and 限价
    selectMarket(name) {
      if (name === 'isMarket_profit') {
        this.formData_2.value = '';
      } else {
        this.formData_5.value = '';
      }
      this[name] = !this[name];
    },
    // 表单输入事件
    changeInput(type, value) {
      this[type].value = value;
    },
    // 获取止盈止损类表
    getStopList() {
      this.axios({
        url: this.$store.state.url.futures.takeProfitStopLoss,
        hostType: 'co',
        params: {
          contractId: this.dataInfo.contractId,
          orderSide: this.dataInfo.orderSide,
        },
      }).then((data) => {
        if (data.code === '0' && data.data) {
          this.takeProfitCount = data.data.takeProfitCount;
          this.stopLossCount = data.data.stopLossCount;
          const { takeProfitList, stopLossList } = data.data;
          // 止盈列表
          this.takeProfitList = this.setlist(takeProfitList);
          // 止损列表
          this.stopLossList = this.setlist(stopLossList);
        }
      });
    },
    // 设置数据列表
    setlist(dataList) {
      const { priceFix } = this.dataInfo;
      const arr = [];
      if (dataList && dataList.length) {
        dataList.forEach((item) => {
          arr.push({
            // id
            id: item.id,
            // 触发价格
            triggerPrice: fixD(item.triggerPrice, priceFix),
            // 委托价格  // 市价
            price: item.price === 0 ? this.lanText.text30
              : this.thousandsComma(fixD(item.price, priceFix)),
            // 委托数量
            volume: this.setNumber(item.volume),
          });
        });
        return arr;
      }
      return arr;
    },
    // 设置数量（张数和数量的转换）
    setNumber(volume, type) {
      const { multiplier, volfix } = this.dataInfo;
      if (this.coUnitType === 1 && volume && multiplier) {
        // 把量换成张
        if (type === 2) {
          return fixD(division(volume, multiplier), 0);
        }
        // 把张换成量
        return fixD(nul(volume, multiplier), volfix);
      }
      return volume;
    },
    // 表单验证
    formVerify() {
      let flag = true;
      // 非空验证
      if (this.formData_1.value || this.formData_3.value) {
        if (!this.formData_1.value
          || !this.formData_3.value
          || (!this.formData_2.value && !this.isMarket_profit)) {
          flag = false;
        }
      }
      if (this.formData_4.value || this.formData_6.value) {
        if (!this.formData_4.value
          || !this.formData_6.value
          || (!this.formData_5.value && !this.isMarket_loss)) {
          flag = false;
        }
      }
      if (!this.formData_1.value && !this.formData_4.value) {
        flag = false;
      }
      return flag;
    },
    formVerify_v2() {
      const flag = true;
      //  标记价格, 强平价格, 可平数量 , 方向（BUY多长 SELL空仓）
      const {
        indexPrice, reducePrice, canCloseVolume, orderSide,
      } = this.dataInfo;
      // 验证止盈触发价
      if (this.formData_1.value && indexPrice) {
        if (orderSide === 'BUY') {
          if (Number(this.formData_1.value) <= Number(indexPrice)) {
            // 止盈价需大于标记价格！
            this.$bus.$emit('tip', { text: this.lanText.text21, type: 'error' });
            this.formData_1.errorText = 'true';
            return false;
          }
        } else if (Number(this.formData_1.value) >= Number(indexPrice)) {
          // 止盈价需小于标记价格！
          this.$bus.$emit('tip', { text: this.lanText.text22, type: 'error' });
          this.formData_1.errorText = 'true';
          return false;
        }
      }
      // 验证止损触发价
      if (this.formData_4.value && indexPrice) {
        // 多仓
        if (orderSide === 'BUY') {
          // 判断标记价格（多仓）
          if (Number(this.formData_4.value) >= Number(indexPrice)) {
            //  '止损价需小于标记价格
            this.$bus.$emit('tip', { text: this.lanText.text23, type: 'error' });
            this.formData_4.errorText = 'true';
            return false;
          }
          // 判断强平价格（多仓）
          if (Number(this.formData_4.value) <= Number(reducePrice)) {
            // '止损价需大于强平价格！'
            this.$bus.$emit('tip', { text: this.lanText.text24, type: 'error' });
            this.formData_4.errorText = 'true';
            return false;
          }
          // 判断标记价格（空仓）
        } else if (Number(this.formData_4.value) <= Number(indexPrice)) {
          // '止损价需大于标记价格！'
          this.$bus.$emit('tip', { text: this.lanText.text25, type: 'error' });
          this.formData_4.errorText = 'true';
          return false;
          // 判断强平价格（空仓）
        } else if (Number(this.formData_4.value) >= Number(reducePrice)) {
          // 止损价需小于强平价格！
          this.$bus.$emit('tip', { text: this.lanText.text26, type: 'error' });
          this.formData_4.errorText = 'true';
          return false;
        }
      }

      // 验证止盈委托价格
      if (this.formData_2.value && this.formData_1.value) {
        // 当前输入的价格和出发价的比例 (触发价格 - 输入的价格) / 触发价格
        const { priceRange } = this.dataInfo.coinResultVo;
        const range = Math.abs(
          division(cut(this.formData_1.value, this.formData_2.value),
            this.formData_1.value),
        );
        if ((range > priceRange)) {
          // '价格偏差太大！'
          this.$bus.$emit('tip', { text: this.lanText.text27, type: 'error' });
          this.formData_2.errorText = 'true';
          return false;
        }
      }
      // 验证止损委托价格

      if (this.formData_3.value && canCloseVolume) {
        if (Number(canCloseVolume) < Number(this.formData_3.value)) {
          // 超出可平数量！
          this.$bus.$emit('tip', { text: this.lanText.text28, type: 'error' });
          this.formData_3.errorText = 'true';
          return false;
        }
      }
      if (this.formData_6.value && canCloseVolume) {
        if (Number(canCloseVolume) < Number(this.formData_6.value)) {
          // 超出可平数量！
          this.$bus.$emit('tip', { text: this.lanText.text28, type: 'error' });
          this.formData_6.errorText = 'true';
          return false;
        }
      }
      return flag;
    },
    // 提交订单
    submit() {
      if (!this.formVerify()) return;
      if (!this.formVerify_v2()) return;
      if (!this.sumbitFla) return;
      this.sumbitFla = false;
      const orderList = [];
      if (this.formData_1.value) {
        orderList.push({
          triggerType: 2,
          type: this.isMarket_profit ? 2 : 1,
          price: this.isMarket_profit ? 0 : this.formData_2.value,
          volume: this.setNumber(this.formData_3.value, 2),
          triggerPrice: this.formData_1.value,
          // expiredTime: this.expireTime,
        });
      }
      if (this.formData_4.value) {
        orderList.push({
          triggerType: 1,
          type: this.isMarket_loss ? 2 : 1,
          price: this.isMarket_loss ? 0 : this.formData_5.value,
          volume: this.setNumber(this.formData_6.value, 2),
          triggerPrice: this.formData_4.value,
          expiredTime: this.expireTime,
        });
      }
      const paramsData = {
        contractId: this.dataInfo.contractId,
        positionType: this.dataInfo.positionType,
        leverageLevel: this.dataInfo.leverageLevel,
        side: this.dataInfo.orderSide === 'BUY' ? 'SELL' : 'BUY',
        orderList,
      };
      this.axios({
        url: this.$store.state.url.futures.createTpslOrder,
        hostType: 'co',
        params: paramsData,
      }).then((data) => {
        if (data.code === '0') {
          this.close();
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
        } else {
          const { respList } = data.data;
          if (respList && respList.length) {
            respList.forEach((item) => {
              if (item.code === '0') {
                this.close();
                this.$bus.$emit('tip', { text: item.msg, type: 'success' });
              } else {
                this.$bus.$emit('tip', { text: item.msg, type: 'error' });
              }
            });
          }
        }
        this.sumbitFla = true;
      }).catch(() => {
        this.sumbitFla = true;
      });
    },
    // 取消全部订单
    cancelOrder(type) {
      if (!this.cancelFla) return;
      this.cancelFla = false;
      const idArr = [];
      if (type === 1) {
        this.takeProfitList.forEach((item) => {
          idArr.push(item.id);
        });
      } else {
        this.stopLossList.forEach((item) => {
          idArr.push(item.id);
        });
      }
      this.axios({
        url: this.$store.state.url.futures.orderTpslCancel,
        hostType: 'co',
        params: {
          contractId: this.dataInfo.contractId,
          orderIds: idArr.join(','),
        },
      }).then((data) => {
        if (data.code === '0') {
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.getStopList();
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
        this.cancelFla = true;
      }).catch(() => {
        this.cancelFla = true;
      });
    },
    thousandsComma(num) {
      if (num) {
        return thousandsComma(num);
      }
      return num;
    },
    // 选择 到期时间
    selectPlanType(val) {
      this.expireTime = val;
    },
  },
};
