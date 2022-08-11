import {
  imgMap,
  colorMap,
  formatTime,
  fixD,
  nul,
  division,
  thousandsComma,
  myStorage,
} from '@/utils';

export default {
  name: 'orderList',
  data() {
    return {
      // 订单类型：0：持有仓位 1：当前委托 2：当日成交 3：历史委托 4: 盈亏记录 5: '成交记录'
      orderType: 1,
      imgMap,
      colorMap,
      pagination: { // 翻页数据
        count: 0, // 总数量
        pageSize: 10, // 每页显示条数
        page: 1, // 当前页数
      },
      // 撤销订单 防止重复点击
      cancelFla: true,
      tableLoading: false,
      cancelOrderId: null,
      timer: 15000,
      // 当前操作的合约数据（修改保证金，平仓，全仓）
      currentOrder: {},
      // 当前委托列表
      currentOrderLis: [],

      // table使用的 数量列表
      dataList: [],
      cellHeight: 56,
      revokeList: [],
      // 条件单显示类别
      triggeType: 0,
      // 轮训请求订单
      getDataTimer: null,
      // 只显示当前合约开关
      isShowCurPosition: myStorage.get('isShowCurPosition'),
      // 仓位数量
      positionListNumber: 0,
    };
  },
  watch: {
    orderType(val) {
      this.dataList = [];
      clearInterval(this.getDataTimer);
      this.getDataTimer = null;
      if (val > 0) {
        this.getOrderList();
      }
      // if (val > 3) {
      //   this.cellHeight = 28;
      // } else {
      //   this.cellHeight = 56;
      // }
    },
    currentOrderLis(data) {
      if (data && data.length && this.orderType > 0 && this.orderType < 3) {
        clearInterval(this.getDataTimer);
        this.getDataTimer = null;
        this.intervalGetData();
      } else {
        clearInterval(this.getDataTimer);
        this.getDataTimer = null;
      }
    },
    coUnitType() {
      this.getOrderList();
      if (this.orderType === 1) {
        this.formatCurrentData();
      }
    },
    contractId() {
      this.getOrderList();
    },
    orderCount() {
      this.$store.dispatch('getUserConfig');
    },
  },
  computed: {
    // 是否 是云合约在iframe中调用
    isIframe() {
      return this.$store.state.future.isIframe;
    },
    lanText() {
      return {
        tabType1: this.$t('futures.orderList.tabType1'), // 仓位
        tabType2: this.$t('futures.orderList.tabType2'), // 普通委托
        tabType3: this.$t('futures.orderList.tabType3'), // 条件委托
        tabType4: this.$t('futures.orderList.tabType4'), // 历史委托
        tabType5: this.$t('futures.orderList.tabType5'), // 资金流水
        subTabType1: this.$t('futures.orderList.subTabType1'), // 所有
        subTabType2: this.$t('futures.orderList.subTabType2'), // 止损单
        subTabType3: this.$t('futures.orderList.subTabType3'), // 止盈单
        a_columns_1: this.$t('futures.orderList.a_columns_1'), // 合约
        a_columns_2: this.$t('futures.orderList.a_columns_2'), // 方向
        a_columns_3: this.$t('futures.orderList.a_columns_3'), // 数量
        a_columns_4: this.$t('futures.orderList.a_columns_4'), // 完成度
        a_columns_5: this.$t('futures.orderList.a_columns_5'), // 委托价格
        a_columns_6: this.$t('futures.orderList.a_columns_6'), // 成交均价
        a_columns_7: this.$t('futures.orderList.a_columns_7'), // 类型
        a_columns_8: this.$t('futures.orderList.a_columns_8'), // 只减仓
        a_columns_9: this.$t('futures.orderList.a_columns_9'), // 时间
        a_columns_10: this.$t('futures.orderList.a_columns_10'), // 操作
        b_columns_1: this.$t('futures.orderList.b_columns_1'), // 合约
        b_columns_2: this.$t('futures.orderList.b_columns_2'), // 方向
        b_columns_3: this.$t('futures.orderList.b_columns_3'), // 触发价格
        b_columns_4: this.$t('futures.orderList.b_columns_4'), // 委托价格
        b_columns_5: this.$t('futures.orderList.b_columns_5'), // 委托数量/价值
        b_columns_6: this.$t('futures.orderList.b_columns_6'), // 类型
        b_columns_7: this.$t('futures.orderList.b_columns_7'), // 只减仓
        b_columns_8: this.$t('futures.orderList.b_columns_8'), // 提交时间
        b_columns_9: this.$t('futures.orderList.b_columns_9'), // 过期时间
        c_columns_1: this.$t('futures.orderList.c_columns_1'), // 合约
        c_columns_2: this.$t('futures.orderList.c_columns_2'), // 类型
        c_columns_3: this.$t('futures.orderList.c_columns_3'), // 方向
        c_columns_4: this.$t('futures.orderList.c_columns_4'), // 委托价格
        c_columns_5: this.$t('futures.orderList.c_columns_5'), // 委托数量/价值
        c_columns_6: this.$t('futures.orderList.c_columns_6'), // 成交数量
        c_columns_7: this.$t('futures.orderList.c_columns_7'), // 成交均价
        c_columns_8: this.$t('futures.orderList.c_columns_8'), // 盈亏
        c_columns_9: this.$t('futures.orderList.c_columns_9'), // 状态
        c_columns_10: this.$t('futures.orderList.c_columns_10'), // 时间
        c_columns_11: this.$t('futures.orderList.c_columns_11'), // 手续费
        d_columns_1: this.$t('futures.orderList.d_columns_1'), // 时间
        d_columns_2: this.$t('futures.orderList.d_columns_2'), // 类型
        d_columns_3: this.$t('futures.orderList.d_columns_3'), // 金额
        d_columns_4: this.$t('futures.orderList.d_columns_4'), // 币种
        typeStatus1: this.$t('futures.orderList.typeStatus1'), // 限价单
        typeStatus2: this.$t('futures.orderList.typeStatus2'), // 市价单
        typeStatus3: this.$t('futures.orderList.typeStatus3'), // 只做maker
        typeStatus4: this.$t('futures.orderList.typeStatus4'), // 强制减仓
        typeStatus5: this.$t('futures.orderList.typeStatus5'), // 仓位合并
        getStatus1: this.$t('futures.orderList.getStatus1'), // 新订单
        getStatus2: this.$t('futures.orderList.getStatus2'), // 完全成交
        getStatus3: this.$t('futures.orderList.getStatus3'), // 部分成交
        getStatus4: this.$t('futures.orderList.getStatus4'), // 已取消
        getStatus5: this.$t('futures.orderList.getStatus5'), // 待撤销
        getStatus6: this.$t('futures.orderList.getStatus6'), // 异常订单
        getStatus7: this.$t('futures.orderList.getStatus7'), // 部分成交已撤销
        sideT1: this.$t('futures.orderList.sideT1'), // 开
        sideT2: this.$t('futures.orderList.sideT2'), // 平
        sideT3: this.$t('futures.orderList.sideT3'), // 空
        sideT4: this.$t('futures.orderList.sideT4'), // 多
        mPrice: this.$t('futures.orderList.mPrice'), // 市价
        isclose1: this.$t('futures.orderList.isclose1'), // 是
        isclose2: this.$t('futures.orderList.isclose2'), // 否
        cancel: this.$t('futures.orderList.cancel'), // 取消
        allCancel: this.$t('futures.orderList.allCancel'), // 全部取消
        tstext1: this.$t('futures.orderList.tstext1'), // 请
        tstext2: this.$t('futures.orderList.tstext2'), // 登录/注册
        tstext3: this.$t('futures.orderList.tstext3'), // 再进行操作
        text14: this.$t('futures.positionLis.text14'),
        text15: this.$t('futures.positionLis.text15'),
      };
    },
    // tab 项
    tabTypeItem() {
      // return [
      // 持仓
      // this.isLogin ? `${this.lanText.tabType1} (${this.positionListNumber})` : this.lanText.tabType1,
      // this.isLogin ? `${this.lanText.tabType2} (${this.orderCount})` : this.lanText.tabType2, // '普通委托'
      // this.isLogin ? `${this.lanText.tabType3} (${this.triggerOrderCount})` : this.lanText.tabType3, // '条件委托'
      // this.lanText.tabType4, // '历史委托'
      // this.lanText.tabType5, // '资金流水'
      // this.$t('futures.orderList.newText1'), // '盈亏记录',
      // this.$t('futures.orderList.newText2'), // '成交记录',
      // ];
      return [
        { label: this.isLogin ? `${this.lanText.tabType2} (${this.orderCount})` : this.lanText.tabType2, value: 1 }, // '普通委托'
        { label: this.lanText.tabType4, value: 3 }, // '历史委托'
      ];
    },
    // 条件单（筛选项）
    subTabTypeItem() {
      return [
        { label: this.lanText.subTabType1, value: 0 }, // '所有'
        { label: this.lanText.subTabType2, value: 1 }, // '止损单'
        { label: this.lanText.subTabType3, value: 2 }, // '止盈单'
      ];
    },
    // 合约列表 MAP
    contractListMap() {
      return this.$store.state.future.contractListMap;
    },
    // 当前合约ID
    contractId() {
      return this.$store.state.future.contractId;
    },
    // 仓位数量
    // positionListNumber() {
    //   if (this.$store.state.future.positionListNumber) {
    //     return this.$store.state.future.positionListNumber;
    //   }
    //   return '0';
    // },
    // 当前合约信息
    contractInfo() {
      return this.$store.state.future.contractInfo;
    },
    // 当前合约方向（1正向、0反向）
    contractSide() {
      if (this.contractInfo) {
        return this.contractInfo.contractSide;
      }
      return 1;
    },
    // 当前合约保证金币种
    marginCoin() {
      if (this.contractInfo) {
        return this.contractInfo.marginCoin;
      }
      return '';
    },
    // 当前合约币种精度
    coinfix() {
      return this.$store.state.future.coinfix;
    },
    // 当前合约价格精度
    pricefix() {
      return this.$store.state.future.pricefix;
    },
    // 当前合约保证金币种精度
    marginCoinFix() {
      if (this.contractInfo && this.contractInfo.coinResultVo) {
        return this.contractInfo.coinResultVo.marginCoinPrecision;
      }
      return 4;
    },
    // 数量单位类型Number(1标的货币 2张)
    coUnitType() {
      return this.$store.state.future.coUnitType;
    },
    // 当前合约面值
    multiplier() {
      return Number(this.$store.state.future.multiplier) || 1;
    },
    // 当前合约数量精度
    volfix() {
      if (this.coUnitType === 1) {
        return this.$store.state.future.volfix;
      }
      return 0;
    },
    // 当前合约数量单位
    volUnit() {
      return this.$store.state.future.coUnit;
    },
    // 当前合约价格单位
    priceUnit() {
      return this.$store.state.future.priceUnit;
    },
    // 当前普通单委托数量
    orderCount() {
      return this.$store.state.future.orderCount;
    },
    // 当前条件单委托数量
    triggerOrderCount() {
      return this.$store.state.future.triggerOrderCount;
    },
    // 表头
    columns() {
      if (this.orderType === 1) {
        return [
          {
            title: this.lanText.a_columns_1, // 合约
            width: '120px',
            classes: 'symbol',
            styleClass: 'symbol-name',
          },
          {
            title: this.lanText.a_columns_2, // 方向
            width: '60px',
          },
          {
            title: `${this.lanText.a_columns_3}(${this.volUnit})`, // 数量
            width: '150px',
          },
          {
            title: this.lanText.a_columns_4, // 完成度
            width: '120px',
          },
          {
            title: this.lanText.a_columns_5, // 委托价格
            width: '180px',
          },
          {
            title: this.lanText.a_columns_6, // 成交均价
            width: '180px',
          },
          {
            title: this.lanText.a_columns_7, // 类型
            width: '80px',
          },
          {
            title: this.lanText.a_columns_8, // 只减仓
            width: '100px',
          },
          {
            title: this.lanText.a_columns_9, // 时间
            width: '100px',
          },
          {
            title: this.lanText.a_columns_10, // 操作
            width: '100px',
            classes: 'opera',
            styleClass: 'opera-btn',
          },
        ];
      }
      if (this.orderType === 2) {
        return [
          {
            title: this.lanText.b_columns_1, // 合约
            width: '100px',
          },
          {
            title: this.lanText.b_columns_2, // 方向
            width: '80px',
          },
          {
            title: this.lanText.b_columns_3, // 触发价格
            width: '180px',
          },
          {
            title: this.lanText.b_columns_4, // 委托价格
            width: '180px',
          },
          {
            title: this.lanText.b_columns_5, // 委托数量/价值
            width: '180px',
          },
          {
            title: this.lanText.b_columns_6, // 类型
            width: '100px',
          },
          {
            title: this.lanText.b_columns_7, // 只减仓
            width: '80px',
          },
          {
            title: this.lanText.b_columns_8, // 提交时间
            width: '100px',
          },
          {
            title: this.lanText.b_columns_9, // 过期时间
            width: '100px',
          },
          {
            title: this.lanText.a_columns_10, // 操作
            width: '80px',
          },
        ];
      }
      if (this.orderType === 3) {
        return [
          {
            title: this.lanText.c_columns_1, // 合约
            width: '120px',
          },
          {
            title: this.lanText.c_columns_2, // 类型
            width: '100px',
          },
          {
            title: this.lanText.c_columns_3, // 方向
            width: '100px',
          },
          {
            title: this.lanText.c_columns_4, // 委托价格
            width: '160px',
          },
          {
            title: this.lanText.c_columns_5, // 委托数量/价值
            width: '160px',
          },
          {
            title: `${this.lanText.c_columns_6}(${this.volUnit})`, // 成交数量
            width: '160px',
          },
          {
            title: this.lanText.c_columns_7, // 成交均价
            width: '160px',
          },
          {
            title: this.lanText.c_columns_8, // 盈亏
            width: '160px',
          },
          {
            title: `${this.lanText.c_columns_11} (${this.marginCoin})`, // 手续费
            width: '160px',
          },
          // {
          //   title: this.lanText.xxxx, // 只减仓
          //   width: '100px',
          // },
          {
            title: this.lanText.c_columns_9, // 状态
            width: '100px',
          },
          {
            title: this.lanText.c_columns_10, // 时间
            width: '100px',
          },
        ];
      }
      if (this.orderType === 4) {
        return [
          {
            title: this.lanText.c_columns_1, // 合约
            width: '10%',
          },
          {
            title: this.$t('futures.orderList.newText3'), // '开仓均价',
            width: '10%',
            classes: 'left-text',
          },
          {
            title: this.$t('futures.orderList.newText4'), // '平仓均价',
            width: '10%',
          },
          {
            title: `${this.$t('futures.orderList.newText5')} (${this.volUnit})`, // 仓位数量
            width: '10%',
          },
          {
            title: this.$t('futures.orderList.newText6'), // '已实现盈亏',
            promptText: this.$t('futures.orderList.newText7'), // '总盈亏为该仓位持仓期间累计发生的总盈亏，总盈亏 = 手续费+资金费用+仓位盈亏',
            width: '10%',
          },
          {
            title: `${this.lanText.c_columns_11} (${this.marginCoin})`, // 手续费
            promptText: this.$t('futures.orderList.newText8'), // '开仓、平仓累计总手续费',
            width: '10%',
          },
          {
            title: this.$t('futures.orderList.newText9'), // '资金费用',
            promptText: this.$t('futures.orderList.newText10'), // '持仓期间的总资金费用',
            width: '10%',
          },
          {
            title: this.$t('futures.orderList.newText15'), // '仓位盈亏',
            promptText: this.$t('futures.orderList.newText11'), // '仓位盈亏为仓位每次平仓的仓位盈亏之和，平仓盈亏根据 平仓前的持仓均价和平仓均价计算得出',
            width: '10%',
          },
          {
            title: this.$t('futures.orderList.newText12'), // '分摊',
            width: '10%',
          },
          {
            title: this.$t('futures.orderList.newText13'), // '平仓时间',
            width: '120px',
          },
        ];
      }
      return [
        {
          title: this.lanText.c_columns_1, // 合约
          width: '12%',
        },
        {
          title: this.$t('futures.orderList.newText3'), // '开仓均价',
          width: '12%',
          classes: 'left-text',
        },
        {
          title: this.lanText.c_columns_3, // 方向
          width: '12%',
        },
        {
          title: `${this.lanText.c_columns_6}(${this.volUnit})`, // 成交数量
          width: '12%',
        },
        {
          title: this.$t('futures.orderList.newText14'), // '角色',
          width: '12%',
        },
        {
          title: `${this.lanText.c_columns_11} (${this.marginCoin})`, // 手续费
          width: '12%',
        },
        {
          title: this.lanText.c_columns_10, // 时间
          width: '120px',
        },
      ];
    },
    // 是否Login
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    // 是否开通了合约交易
    openContract() {
      return this.$store.state.future.openContract;
    },
    bodyClasses() {
      return `bodyContent${this.orderType} a-6-bg`;
    },
    memoText() {
      return [
        this.$t('futures.orderList.memoText1'),
        this.$t('futures.orderList.memoText2'),
        this.$t('futures.orderList.memoText3'),
        this.$t('futures.orderList.memoText4'),
        this.$t('futures.orderList.memoText5'),
        this.$t('futures.orderList.memoText6'),
        this.$t('futures.orderList.memoText7'),
        this.$t('futures.orderList.memoText8'),
      ];
      // return [
      //   '用户撤销',
      //   '订单异常，被系统撤销',
      //   '仓位发生强平，未成交委托被系统撤销',
      //   '对手盘不足，委托被系统取消',
      //   'FOK订单，无法全部成交时被系统撤销',
      //   'IOC订单，无法立即成交时部分委托被系统撤销',
      //   '被动委托, 被动委托，撮合时为taker部分被系统撤销',
      // ];
    },
  },
  methods: {
    init() {
      if (myStorage.get('isShowCurPosition') === undefined) {
        this.isShowCurPosition = true;
      }
      this.getOrderList('init');
      // 监听下单成功 重新请求订单
      this.$bus.$on('CRAET-ORDER-SUCCESS', () => {
        this.getOrderList();
        this.$store.dispatch('getUserOrderCount');
      });
      this.$bus.$on('positionListNumber', (data) => {
        this.positionListNumber = data;
      });
    },
    // 切换订单类型
    switchType(index) {
      if (this.orderType !== index) {
        this.orderType = index;
        if (this.isLogin && this.openContract) {
          this.tableLoading = true;
        }
      }
    },
    subSwitchType(index) {
      if (this.triggeType !== index) {
        this.triggeType = index;
        this.formatTrigData();
      }
    },
    // 订单类型
    typeStatus(status) {
      let str = '';
      switch (status) {
        case 1:
          str = this.lanText.typeStatus1; // '限价单';
          break;
        case 2:
          str = this.lanText.typeStatus2; // '市价单';
          break;
        case 3:
          str = 'IOC'; // 'IOC';
          break;
        case 4:
          str = 'FOK'; // 'FOK';
          break;
        case 5:
          str = this.lanText.typeStatus3; // '只做maker';
          break;
        case 6:
          str = this.lanText.typeStatus4; // '强制减仓';
          break;
        case 7:
          str = this.lanText.typeStatus5; // '仓位合并';
          break;
        default:
          str = '';
      }
      return str;
    },
    // 订单状态
    getStatus(status) {
      let str = '';
      switch (status) {
        case 0:
          str = this.lanText.getStatus1; // 新订单
          break;
        case 1:
          str = this.lanText.getStatus1; // 新订单
          break;
        case 2:
          str = this.lanText.getStatus2; // 完全成交
          break;
        case 3:
          str = this.lanText.getStatus3; // 部分成交
          break;
        case 4:
          str = this.lanText.getStatus4; // 已取消
          break;
        case 5:
          str = this.lanText.getStatus5; // 待撤销
          break;
        case 6:
          str = this.lanText.getStatus6; // 异常订单
          break;
        case 7:
          str = this.lanText.getStatus7; // 部分成交已撤销
          break;
        default:
          str = '';
      }
      return str;
    },
    // 订单数量
    setVolume(volume) {
      if (this.coUnitType === 1) {
        return fixD(nul(volume, this.multiplier), this.volfix);
      }
      return this.thousandsComma(volume);
    },
    // 完成度
    makeRate(dealVolume, volume) {
      if (dealVolume && volume) {
        // 已完成数量 / 委托数量
        const value = nul(division(dealVolume, volume), 100);
        return fixD(value, 2);
      }
      return 0.00;
    },
    // 返回订单方向
    setSide(data) {
      let classes = 'u-1-cl';
      // 开 ：平
      const open = data.open === 'OPEN' ? this.lanText.sideT1 : this.lanText.sideT2;
      // 空
      let side = this.lanText.sideT3;
      if ((data.open === 'OPEN' && data.side === 'BUY')
            || (data.open === 'CLOSE' && data.side === 'SELL')) {
        // 多
        side = this.lanText.sideT4;
      }
      if (data.side === 'SELL') {
        classes = 'u-4-cl';
      }
      return [
        {
          text: `${open}${side}`,
          classes,
        },
      ];
    },
    // 返回合约名称
    setContractName(data) {
      const acriveData = this.contractListMap[data.contractName];
      if (acriveData) {
        let name = '';
        let text = '';
        if (data) {
          const nameText = acriveData.symbol ? acriveData.symbol.replace('-', '') : '';
          if (acriveData.contractType !== 'E') {
            text = `-${acriveData.marginCoin}`;
          }
          name = `${nameText}${text}`;
        }
        return name;
      }
      return data.symbol.replace('-', '');
    },
    // 请求订单数据
    getOrderList(type) {
      if (!this.isLogin || !this.openContract) return;
      const paramsData = {
        contractId: this.contractId,
      };
      // 请求数量
      this.$store.dispatch('getUserOrderCount');
      // 当前委托
      let url = this.$store.state.url.futures.currentOrderList;
      // 条件委托
      if (this.orderType === 2) {
        url = this.$store.state.url.futures.triggerOrderList;
      }
      // 历史委托
      if (this.orderType === 3) {
        url = this.$store.state.url.futures.historyOrderList;
      }
      // 盈亏记录
      if (this.orderType === 4) {
        url = this.$store.state.url.futures.historyPositionList;
      }
      // 成交记录
      if (this.orderType === 5) {
        url = this.$store.state.url.futures.getTradeInfo;
      }
      this.axios({
        url,
        method: 'post',
        hostType: 'co',
        params: paramsData,
      }).then((rs) => {
        this.tableLoading = false;
        if (rs.code === '0' && rs.data) {
          // 当前委托
          if (this.orderType === 1 || type === 'init') {
            this.currentOrderLis = rs.data.orderList;
            // 将当前委托存储在vuex
            this.$store.commit('CURRENT_OTDER_LIST', this.currentOrderLis);
            this.formatCurrentData();
          }
          // 条件委托
          if (this.orderType === 2) {
            this.currentOrderLis = rs.data.trigOrderList;
            this.formatTrigData();
          }
          // 历史委托
          if (this.orderType === 3) {
            this.currentOrderLis = rs.data.orderList;
            this.formatHistoryData();
          }
          // 盈亏记录
          if (this.orderType === 4) {
            this.currentOrderLis = rs.data.positionList;
            this.formatTransData();
          }
          // 成交记录
          if (this.orderType === 5) {
            this.currentOrderLis = rs.data.tradeList;
            this.formatTradeInfo();
          }
        }
      });
    },
    // 格式化当前委托订单数据
    formatCurrentData() {
      const list = [];
      if (this.currentOrderLis && this.currentOrderLis.length) {
        this.currentOrderLis.forEach((item) => {
          let price = null;
          if (item.type === 2 && Number(item.price) === 0) {
            price = this.lanText.mPrice; // '市价';
          } else {
            price = this.thousandsComma(fixD(item.price, item.pricePrecision));
          }
          list.push({
            id: JSON.stringify(item),
            classes: 'b-2-cl',
            data: [
              // 合约
              this.setContractName(item),
              // 方向
              this.setSide(item),
              // 成交数量 / 委托数量
              `${this.setVolume(item.dealVolume)} / ${this.setVolume(item.volume)}`,
              // '完成度',
              `${this.makeRate(item.dealVolume, item.volume)}%`,
              // 委托价格
              price,
              // 成交均价
              item.pricePrecision ? this.thousandsComma(fixD(item.avgPrice, item.pricePrecision)) : '--',
              // 类型
              this.typeStatus(item.type),
              // 只减仓
              // '是' : '否'
              item.open === 'CLOSE' ? this.lanText.isclose1 : this.lanText.isclose2,
              // 时间
              formatTime(item.ctime),
              // 撤单
              [
                {
                  type: 'button',
                  text: this.lanText.cancel, // 取消
                  eventType: 'cancelOrder',
                },
              ],
            ],
          });
        });
      }
      this.dataList = list;
    },
    // 格式化条件委托订单数据
    formatTrigData() {
      const list = [];
      if (this.currentOrderLis && this.currentOrderLis.length) {
        this.currentOrderLis.forEach((item) => {
          if (this.triggeType && this.triggeType !== item.triggerType) return;
          let price = null;
          let volume = null;
          if (item.type === 2 && Number(item.price) === 0) {
            price = this.lanText.mPrice; // '市价';
            // 价值
            if (item.open === 'OPEN') {
              // 反向
              let unit = this.contractInfo.base;
              const { volfix } = this.$store.state.future;
              let coinFix = volfix;
              // 正向
              if (this.contractSide === 1) {
                unit = this.priceUnit;
                coinFix = this.pricefix;
              }
              volume = `${fixD(item.volume, coinFix)} ${unit}`;
            } else {
              volume = `${this.setVolume(item.volume)} ${this.volUnit}`;
            }
          } else {
            price = this.thousandsComma(fixD(item.price, item.pricePrecision));
            // 委托数量
            volume = `${this.setVolume(item.volume)} ${this.volUnit}`;
          }

          list.push({
            id: JSON.stringify(item),
            classes: 'b-2-cl',
            data: [
              // 合约
              this.setContractName(item),
              // 方向
              this.setSide(item),
              // 触发价格
              this.thousandsComma(fixD(item.triggerPrice, item.pricePrecision)),
              // 委托价格
              price,
              // 委托数量/价值
              volume,
              // 类型
              this.typeStatus(item.timeInForce),
              // 只减仓
              // '是' : '否',
              item.open === 'CLOSE' ? this.lanText.isclose1 : this.lanText.isclose2,
              // 提交时间
              formatTime(item.mtime),
              // 过期时间
              formatTime(item.expireTime),
              // 撤单
              [
                {
                  type: 'button',
                  text: this.lanText.cancel, // 取消
                  eventType: 'cancelOrder',
                },
              ],
            ],
          });
        });
      }
      this.dataList = list;
    },
    // 格式化 历史委托 订单数据
    formatHistoryData() {
      const list = [];
      if (this.currentOrderLis && this.currentOrderLis.length) {
        this.currentOrderLis.forEach((item, index) => {
          let price = null;
          let volume = null;
          if (item.type === 2 && Number(item.price) === 0) {
            price = this.lanText.mPrice; // '市价';
            // 价值
            if (item.open === 'OPEN') {
              // 反向
              let unit = this.contractInfo.base;
              const { volfix } = this.$store.state.future;
              let coinFix = volfix;
              // 正向
              if (this.contractSide === 1) {
                unit = this.priceUnit;
                coinFix = this.pricefix;
              }
              volume = `${fixD(item.volume, coinFix)} ${unit}`;
            } else {
              // 委托数量
              volume = `${this.setVolume(item.volume)} ${this.volUnit}`;
            }
          } else {
            price = this.thousandsComma(fixD(item.price, item.pricePrecision));
            // 委托数量
            volume = `${this.setVolume(item.volume)} ${this.volUnit}`;
          }
          const cancelCauseClass = index > 3 ? 'position-bottom' : '';
          list.push({
            id: JSON.stringify(item),
            classes: 'b-2-cl',
            data: [
              // 合约
              this.setContractName(item),
              // 类型
              // this.typeStatus(item.type),
              item.liqPositionMsg ? [
                {
                  text: `<div class="cancel_cause cancel_cause_right">
                  ${this.typeStatus(item.type)}
                  <span class="cancel_cause-btn">
                    <svg aria-hidden="true" class="icon icon-16">
                      <use xlink:href="#icon-a_15"></use>
                    </svg>
                    <div class="cancel_cause_text a-5-bg b-1-cl a-3-bd ${cancelCauseClass}">
                    ${this.replaceAll(item.liqPositionMsg)}
                    </div>
                  </span>
                </div>`,
                  type: 'html',
                },
              ] : this.typeStatus(item.type),
              // 方向
              this.setSide(item),
              // 委托价格
              item.type === 6 ? '--' : price,
              // 委托数量/价值
              volume,
              // 成交数量
              this.setVolume(item.dealVolume),
              // 成交均价
              item.type === 6 ? '--' : this.thousandsComma(fixD(item.avgPrice, item.pricePrecision)),
              // 盈亏
              [
                {
                  text: `${fixD(item.realizedAmount, this.marginCoinFix)} ${this.marginCoin}`,
                  classes: this.setClsdsd(item.realizedAmount),
                },
              ],
              // 手续费
              fixD(item.tradeFee, this.marginCoinFix),
              // 只减仓
              // item.open === 'CLOSE' ? '是' : '否',
              // 状态
              item.status === 4 && item.memo ? [
                {
                  text: `<div class="cancel_cause">
                  ${this.getStatus(item.status)}
                  <span class="cancel_cause-btn">
                    <svg aria-hidden="true" class="icon icon-16">
                      <use xlink:href="#icon-a_15"></use>
                    </svg>
                    <div class="cancel_cause_text a-5-bg b-1-cl a-3-bd ${cancelCauseClass}">
                      ${this.memoText[item.memo - 1]}
                    </div>
                  </span>
                </div>`,
                  type: 'html',
                },
              ] : this.getStatus(item.status),
              // 提交时间
              formatTime(item.ctime),

            ],
          });
        });
      }
      this.dataList = list;
    },
    // 格式化盈亏记录数据
    formatTransData() {
      const list = [];
      if (this.currentOrderLis && this.currentOrderLis.length) {
        this.currentOrderLis.forEach((item) => {
          // 杠杆
          const level = `${item.leverageLevel}X`;
          // 类型
          const sideBgclass = item.side === 'BUY' ? 'u-1-bg' : 'u-4-bg';
          //
          const sideClclass = item.side === 'BUY' ? 'u-1-cl' : 'u-4-cl';
          // 合约名称
          const name = this.setContractName(this.contractInfo);
          // 类型  '逐仓' : '全仓';
          const type = item.positionType === 2 ? this.lanText.text15 : this.lanText.text14;
          list.push({
            id: JSON.stringify(item),
            classes: 'b-2-cl',
            data: [
              // 合约
              [
                {
                  type: 'html',
                  text: `<div class="futurs-name">
                    <i class="sideBg ${sideBgclass}"></i>
                    <p class="${sideClclass}">${name}</p>
                    <p>${type} ${level}</p>
                    </div>`,
                  classes: this.amountClass(item.amount),
                },
              ],
              fixD(item.openPrice, this.pricefix), // 开仓均价
              fixD(item.closePrice, this.pricefix), // 平仓均价
              this.setVolume(item.volume), // 仓位数量
              this.fixDSign(item.historyRealizedAmount, this.marginCoinFix), // 已实现盈亏
              this.fixDSign(item.tradeFee, this.marginCoinFix), // 手续费
              this.fixDSign(item.capitalFee, this.marginCoinFix), // 资金费用
              this.fixDSign(item.closeProfit, this.marginCoinFix), // 仓位盈亏
              this.fixDSign(item.shareAmount, this.marginCoinFix), // 分摊金额
              formatTime(item.mtime), // 平仓时间
            ],
          });
        });
      }
      this.dataList = list;
    },
    // 格式化成交记录数据
    formatTradeInfo() {
      const list = [];
      if (this.currentOrderLis && this.currentOrderLis.length) {
        this.currentOrderLis.forEach((item) => {
          list.push({
            id: JSON.stringify(item),
            classes: 'b-2-cl',
            data: [
              // 合约
              this.setContractName(item),
              // 成交均价
              fixD(item.price, this.pricefix),
              // 方向
              this.setSide(item),
              // 成交数量
              this.setVolume(item.volume),
              // 角色
              item.role,
              // 手续费
              `${fixD(item.fee, item.feeCoinPrecision)} ${item.feeCoin}`,
              // 时间
              formatTime(item.ctime),
            ],
          });
        });
      }
      this.dataList = list;
    },
    replaceAll(str) {
      return str.replace(/\\n/g, '<br/>');
    },
    setClsdsd(val) {
      if (val === 0) {
        return '';
      }
      return val < 0 ? 'u-4-cl' : 'u-1-cl';
    },
    // 设置精度 + 符号
    fixDSign(value, fix) {
      if (value && fix.toString()) {
        if (Number(value) > 0) {
          return `+${fixD(value, fix)}`;
        }
        return fixD(value, fix);
      }
      return '0.00';
    },
    amountClass(value) {
      if (value) {
        if (Number(value) > 0) {
          return 'u-1-cl';
        }
        if (Number(value) < 0) {
          return 'u-4-cl';
        }
      }
      return '';
    },
    // 表格操作按钮点击事件
    elementClick(type, v) {
      if (type === 'cancelOrder') {
        const obj = JSON.parse(v);
        this.revokeList.push(obj.id);
        setTimeout(() => {
          this.axios({
            url: this.$store.state.url.futures.orderCancel,
            hostType: 'co',
            method: 'post',
            params: {
              contractId: this.contractId,
              orderId: obj.id,
              isConditionOrder: this.orderType === 2,
            },
          }).then((data) => {
            const ind = this.revokeList.indexOf(obj.id);
            this.revokeList.splice(ind, 1);
            if (data.code.toString() === '0') {
              this.$store.dispatch('getPositionList');
              this.$store.dispatch('getUserConfig');
              this.$bus.$emit('tip', { text: data.msg, type: 'success' });
              this.getOrderList();
            } else {
              this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            }
          });
        }, 500);
      }
    },
    // 取消委托
    cancelOrder() {
    },
    goPage(path) {
      if (path === 'login' && this.isIframe) {
        window.parent.postMessage('login', '*');
      } else {
        this.$router.push(`/${path}`);
      }
    },
    // 轮训请求订单数据
    intervalGetData() {
      clearInterval(this.getDataTimer);
      this.getDataTimer = setInterval(() => {
        this.getOrderList();
        if (!this.isLogin || !this.currentOrderLis.length) {
          clearInterval(this.getDataTimer);
          this.getDataTimer = null;
        }
      }, 5000);
    },
    thousandsComma(num) {
      if (num) {
        return thousandsComma(num);
      }
      return num;
    },
    // 只显示当前合约开关
    switchChange() {
      this.isShowCurPosition = !this.isShowCurPosition;
      myStorage.set('isShowCurPosition', this.isShowCurPosition);
      this.$bus.$emit('isShowCurPosition', this.isShowCurPosition);
    },
  },
};
