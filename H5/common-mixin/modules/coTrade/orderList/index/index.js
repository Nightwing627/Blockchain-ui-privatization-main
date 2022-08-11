
import { mapState } from 'vuex';
import {
  fixD,
  fixInput,
  formatTime,
  myStorage,
} from '@/utils';

export default {
  name: 'orderList',
  data() {
    return {
      // 订单类型：0：持有仓位 1：当前委托 2：当日成交 3：历史委托,
      orderType: 0,
      pagination: { // 翻页数据
        count: 0, // 总数量
        pageSize: 10, // 每页显示条数
        page: 1, // 当前页数
      },
      // 当前货币对
      symbolCurrent: null,
      // 撤销订单 防止重复点击
      cancelFla: true,
      getDataInter: null,
      tableLoading: true,
      cancelOrderId: null,
      timer: 15000,
      cellHeight: 56,
      // 当前操作的合约数据（修改保证金，平仓，全仓）
      currentOrder: {},
      // 修改保证金弹框
      isShowDialog: false,
      // 修改保证金弹框标题
      confirmFormTitle: this.$t('contract.addMinusEnsure'), // '增加&减少保证金',
      // 保证金错误提示语
      marginErrorText: null,
      // 保证金是否输入错误
      marginErrorFlag: false,
      // 修改保证金 数量
      marginValue: '',
      // 修改保证金类型 Add: 增加 Minus：减少
      marginReviseType: 'Add',
      // 确认修改保证金防止双击
      sumbitFla: true,
      // 限价平仓 输入的价格
      limitPriceObj: {},
      // 当前仓位name
      currenSymboltDataName: null,
      currenSymboltDataId: null,
      dataList: [],
      // 上拉加载的设置
      pullUpState: 0, // 子组件的pullUpState状态
      detailsBox: false,
      detailsSymbol: '',
      detailsSide: '',
      // 关闭上滑翻页
      isopenInfiniteLoad: false,
      // 当前货币市场
      marketCurrent: null,
      // 杠杆列表
      levelList: [],
      symbolAll: null,
      leverListShow: false,
      curLeverageLevel: null,
    };
  },
  watch: {
    orderData(val) {
      if (val) {
        if (this.orderType === 0 && val.positionCount > 0) {
          this.timer = 2000;
        } else if (this.orderType === 1 && val.orderCount > 0) {
          this.timer = 2000;
        } else {
          this.timer = 7000;
        }
        // 轮训请求数据
        // this.intervalGet();
        this.tableLoading = false;

        if (this.orderType === 0) {
          if (val && val.positionCount) {
            this.dataList = this.formPosition(val.positions);
          } else {
            this.dataList = [];
          }
        } else if (val && val.orderList) {
          this.dataList = this.formData(val.orderList);
        }
      }
    },
    currenSymboltDataId() {
      this.dataList = this.formPosition(this.orderData.positions);
    },
    marginValue(v) { this.marginValue = fixInput(v, this.currentOrder.valuePrecision); },
  },
  computed: {
    ...mapState({
      coBase({ baseData }) {
        if (baseData.coPublicInfo) {
          return baseData.coPublicInfo;
        }
        return {};
      },
    }),
    is_more_position() {
      return this.$store.state.baseData.is_more_position;
    },
    // 是否Login
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    // tab 项
    tabTypeItem() {
      return [
        this.$t('contract.holding'), // '持有仓位',
        this.$t('contract.currentEntrust'), // '当前委托',
        this.$t('contract.dayTrading'), // '当日成交',
        this.$t('contract.historyEntru'), // '历史委托',
      ];
    },
    // 表头
    columns() {
      if (this.orderType === 0) {
        return [
          // {
          //   title: this.$t('contract.co'), // '合约',
          // },
          {
            title: this.$t('contract.nowList1'), // '时间',
          },
          {
            title: this.$t('contract.nowList3'), // '仓位数量(张)',
          },
          {
            title: this.$t('contract.nowList7'), // '价值',
          },
          {
            title: this.$t('contract.nowList13'), // '开仓价格',
          },
          {
            title: this.$t('contract.nowList14'), // '标记价格',
          },
          {
            title: this.$t('contract.nowList15'), // '强平价格',
          },
          {
            title: `${this.$t('contract.nowList16')}(${this.$t('contract.nowList18')}%)`, // '未实现盈亏(回报率%)',
          },
          {
            title: this.$t('contract.nowList17'), // '已实现盈亏',
          },
          {
            title: this.$t('contract.nowList19'), // '保证金',
          },
          {
            title: this.$t('contract.nowList11'), // '操作'
          },
        ];
      }
      if (this.orderType === 1) {
        return [
          {
            title: this.$t('contract.nowList1'), // '时间',
          },
          // {
          //   title: this.$t('contract.co'), // '合约',
          //   classes: 'left-text',
          // },
          {
            title: this.$t('contract.nowList3'), // '仓位数量(张)',
          },
          {
            title: this.$t('contract.nowList4'), // '委托价格',
          },
          {
            title: this.$t('contract.nowList5'), // '已成交',
          },
          {
            title: this.$t('contract.nowList6'), // '剩余',
          },
          {
            title: this.$t('contract.nowList7'), // '价值',
          },
          {
            title: this.$t('contract.nowList8'), // '成交均价',
          },
          {
            title: this.$t('contract.nowList9'), // '类型',
          },
          {
            title: this.$t('contract.nowList10'), // '状态',
          },
          {
            title: this.$t('trade.opera'), // '操作'
          },
        ];
      }
      if (this.orderType === 2) {
        return [
          {
            title: this.$t('contract.nowList1'), // '时间',
          },
          // {
          //   title: this.$t('contract.co'), // '合约',
          // },
          {
            title: this.$t('contract.nowList3'), // '仓位数量(张)',
          },
          {
            title: this.$t('contract.nowList12'), // '成交价格',
          },
          {
            title: this.$t('contract.nowList5'), // '已成交',
          },
          {
            title: this.$t('contract.nowList6'), // '剩余',
          },
          {
            title: this.$t('contract.nowList7'), // '价值',
          },
          {
            title: this.$t('contract.nowList8'), // '成交均价',
          },
          {
            title: this.$t('contract.nowList9'), // '类型',
          },
          {
            title: this.$t('contract.nowList20'), // '委托ID',
          },
        ];
      }
      return [
        {
          title: this.$t('contract.nowList1'), // '时间',
        },
        // {
        //   title: this.$t('contract.co'), // '合约',
        // },
        {
          title: this.$t('contract.nowList3'), // '仓位数量(张)',
        },
        {
          title: this.$t('contract.nowList4'), // '委托价格',
        },
        {
          title: this.$t('contract.nowList5'), // '已成交',
        },
        {
          title: this.$t('contract.nowList8'), // '成交均价',
        },
        {
          title: this.$t('contract.nowList9'), // '类型',
        },
        {
          title: this.$t('contract.nowList10'), // '状态',
        },
      ];
    },
    // 增加&减少保证金 提示文案
    marginPromptText() {
      if (this.marginReviseType === 'Add') {
        return this.$t('contract.addEnsureNumbere'); // '增加保证金数量';
      }
      return this.$t('contract.minusEnsureNumbere'); // '减少保证金数量';
    },
    // 修改保证金是否可以提交
    confirmDisabled() {
      if (this.marginValue && this.marginValue > 0) {
        return false;
      }
      return true;
    },
    orderData() {
      if (this.$store.state.coOrderList) {
        return this.$store.state.coOrderList.coOrderData;
      }
      return null;
    },
    // dataList() {
    //   if (!this.isLogin) {
    //     return [];
    //   }
    //   if (this.orderType === 0) {
    //     if (this.orderData && this.orderData.positionCount) {
    //       return this.formPosition(this.orderData.positions);
    //     }
    //     return [];
    //   }
    //   if (this.orderData && this.orderData.orderList) {
    //     return this.formData(this.orderData.orderList);
    //   }
    //   return [];
    // },
  },
  methods: {
    init() {
      // 获取当前市场
      this.marketCurrent = myStorage.get('coMarkTitle');
      // 获取当前币对
      this.symbolCurrent = myStorage.get('coNowSymbol');

      this.$bus.$on('SYMBOL_LIST_ALL', (data) => {
        this.symbolAll = data;
      });
      this.$bus.$on('LEVEL_CHANGE_SUCCESS', (data) => {
        if (data) {
          this.getData();
        }
      });
      // 获取 当前选中的货币对
      this.getData();
      this.$bus.$on('SYMBOL_CURRENT', (val) => {
        this.marketCurrent = val;
        if (this.is_more_position !== 1) {
          this.pagination.page = 1;
          this.tableLoading = true;
          this.getData();
        }
      });
      this.$bus.$on('ON_SYMBOL_SWITCH', (val) => {
        this.symbolCurrent = val;
      });
      // 监听 市场切换
      this.$bus.$on('ON_MARKET_SWITCH', () => {
        this.currenSymboltDataId = null;
      });
      // 监听下单成功
      this.$bus.$on('ORDER_CREATE', () => {
        this.pagination.page = 1;
        this.getData();
      });
      // 轮训请求数据
      this.intervalGet();
    },
    onChangelevel(data) {
      this.$bus.$emit('ON_CHANGE_LEVEL', data);
      this.leverListShow = false;
    },
    // 切换订单类型
    switchType(index) {
      this.tableLoading = true;
      this.orderType = index;
      this.pagination.page = 1;
      this.dataList = [];
      this.getData();
    },
    // 轮训请求数据
    intervalGet() {
      clearInterval(this.getDataInter);
      this.getDataInter = setInterval(() => {
        this.getData(true);
      }, this.timer);
    },
    // 格式化数据
    formData(data) {
      const dataArray = data || [];
      const newData = [];
      if (dataArray.length) {
        dataArray.forEach((item, index) => {
          if (index < 80) {
            let tableData = {};
            // 当前委托
            if (this.orderType === 1 && this.cancelOrderId !== item.orderId) {
              tableData = {
                id: item.orderId,
                title: [
                  {
                    text: this.contractName(item),
                    classes: item.side === 'BUY' ? 'u-1-cl' : 'u-4-cl',
                    disabled: true,
                  },
                ],
                handle: [
                  // 撤单
                  {
                    text: this.$t('contract.cancel'),
                    eventType: 'cancel',
                    classes: item.type === 2 ? 'marketPriceOrder' : '',
                  },
                ],
                data: [
                  // 时间
                  {
                    text: formatTime(item.ctimeStr),
                  },
                  // 数量
                  {
                    text: item.side === 'BUY' ? `+${item.volume}` : `-${item.volume}`,
                    classes: item.side === 'BUY' ? 'u-1-cl' : 'u-4-cl',
                  },
                  // 价格
                  this.setPrice(item),
                  // 已成交数量
                  item.dealVolume,
                  // 剩余数量
                  item.undealVolume,
                  // 价值
                  fixD(item.orderPriceValue, item.pricePrecision),
                  // 成交均价
                  fixD(item.avgPrice, item.pricePrecision),
                  // 类型 '限价单' : '市价单',
                  item.type === 1 ? this.$t('contract.infoOrder') : this.$t('contract.marketOrder'),
                  // 状态
                  this.status(item.status),
                ],
              };
            }
            // 当日成交
            if (this.orderType === 2) {
              tableData = {
                id: item.orderId,
                title: [
                  {
                    text: this.contractName(item),
                    classes: item.side === 'BUY' ? 'u-1-cl' : 'u-4-cl',
                    disabled: true,
                  },
                ],
                data: [
                  {
                    text: formatTime(item.ctimeStr),
                  },
                  // 数量
                  {
                    text: item.side === 'BUY' ? `+${item.volume}` : `-${item.volume}`,
                    classes: item.side === 'BUY' ? 'u-1-cl' : 'u-4-cl',
                  },
                  // 成交价格
                  this.setPrice(item),
                  // 已成交数量
                  item.dealVolume,
                  // 剩余数量
                  item.undealVolume,
                  // 价值
                  fixD(item.orderPriceValue, item.pricePrecision),
                  // 成交均价
                  fixD(item.avgPrice, item.pricePrecision),
                  // 类型
                  item.type === 1 ? this.$t('contract.infoOrder') : this.$t('contract.marketOrder'), // '限价单' : '市价单',
                  // 委托ID
                  item.orderId,
                ],
              };
            }
            // 历史委托
            if (this.orderType === 3) {
              tableData = {
                id: item.orderId,
                title: [
                  {
                    text: this.contractName(item),
                    classes: item.side === 'BUY' ? 'u-1-cl' : 'u-4-cl',
                    disabled: true,
                  },
                ],
                data: [
                  // 时间
                  {
                    text: formatTime(item.ctimeStr),
                  },
                  // 数量
                  {
                    text: item.side === 'BUY' ? `+${item.volume}` : `-${item.volume}`,
                    classes: item.side === 'BUY' ? 'u-1-cl' : 'u-4-cl',
                  },
                  // 委托价格
                  this.setPrice(item),
                  // 已成交数量
                  item.dealVolume,
                  // 成交均价
                  fixD(item.avgPrice, item.pricePrecision),
                  // 类型
                  item.type === 1 ? this.$t('contract.infoOrder') : this.$t('contract.marketOrder'), // '限价单' : '市价单',
                  // 状态
                  this.status(item.status),
                ],
              };
            }
            if (this.cancelOrderId !== item.orderId) {
              newData.push(tableData);
            }
          }
        });
        return newData;
      }
      return [];
    },
    // 格式化持有仓位
    formPosition(data) {
      const dataArray = data || [];
      const newData = [];
      if (dataArray.length) {
        this.$bus.$emit('CO_CURRENT_TODER_DATA', null);
        dataArray.forEach((item) => {
          if (this.symbolCurrent === item.symbol) {
            this.$bus.$emit('CO_CURRENT_TODER_DATA', item);
          }
          if (this.cancelOrderId !== item.orderId) {
            const tableData = {
              id: item.id,
              title: [
                {
                  text: this.contractName(item),
                  classes: item.side === 'BUY' ? 'u-1-cl' : 'u-4-cl',
                  disabled: true,
                },
              ],
              data: [
                // 时间
                {
                  text: item.ctime,
                },
                // 数量
                {
                  text: item.side === 'BUY' ? `+${item.volume}` : `-${item.volume}`,
                  classes: item.side === 'BUY' ? 'u-1-cl' : 'u-4-cl',
                },
                // 价值
                fixD(item.priceValue, item.valuePrecision),
                // 开仓价格
                fixD(item.avgPrice, item.pricePrecision),
                // 标记价格
                fixD(item.indexPrice, item.pricePrecision),
                // 强平价格
                fixD(item.liquidationPrice, item.pricePrecision),
                // 未实现盈亏（回报率）
                {
                  type: 'html',
                  text: this.unrealisedAmount(item),
                },
                // 已实现盈亏（回报率）
                {
                  type: 'html',
                  text: this.realisedAmoun(item),
                },
                // 保证金
                {
                  text: `${fixD(item.assignedMargin, item.valuePrecision)}(${item.leverageLevel}x)`,
                },
              ],
            };
            newData.push(tableData);
          }
        });
        return newData;
      }
      return [];
    },
    // 设置价格
    setPrice(item) {
      if (item.type === 2) {
        return this.$t('contract.marketPrice');
      }
      return fixD(item.price, item.pricePrecision);
    },
    // 未实现盈亏
    unrealisedAmount(data) {
      const template = `<span>
          ${fixD(data.unrealisedAmountIndex, data.valuePrecision)}
          ${data.bond}
          (${fixD(data.unrealisedRateIndex, 2)})
      </span>`;
      return template;
    },
    // 已实现盈亏
    realisedAmoun(data) {
      const template = `<span>
          ${fixD(data.realisedAmountCurr, data.valuePrecision)}
          ${data.bond}
        </span>`;
      return template;
    },
    // 合约名称
    contractName(data) {
      const c = data.symbol.split('_')[1] ? data.symbol.split('_')[1] : data.symbol;
      const n = this.setSymbolName(data.contractType);
      const t = data.settleTime ? data.settleTime.split(' ')[0].split('-') : '';
      const time = data.contractType === 0 ? '' : ` · ${t[1]}${t[2]}`;
      const x = data.leverageLevel;
      return `${c} ${n} ${time} (${x}X)`;
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
    // 订单状态
    status(v) {
      // （1.新订单.2.完全成绩看3.部分成交4.已撤单5.待撤单 6.异常订单 7.部分成交已撤销 注：0 是初始订单展示为新订单）
      switch (v) {
        case 0:
          return this.$t('contract.status1'); // '新订单';
        case 1:
          return this.$t('contract.status1'); // '新订单';
        case 2:
          return this.$t('contract.status2'); // '完全成交';
        case 3:
          return this.$t('contract.status3'); // '部分成交';
        case 4:
          return this.$t('contract.status4'); // '已撤单';
        case 5:
          return this.$t('contract.status5'); // '待撤单';
        case 6:
          return this.$t('contract.status6'); // '异常订单';
        case 7:
          return this.$t('contract.status7'); // '部分成交已撤销';
        default:
          return '';
      }
    },
    // 请求订单数据
    getData(auto) {
      let url = this.$store.state.url.contract.user_position;
      if (this.orderType !== 0) {
        url = this.$store.state.url.contract.order_list;
      }
      const data = {
        url,
        params: {
          pageSize: this.pagination.pageSize,
        },
      };
      if (this.orderType !== 0) {
        data.params.order_type = this.orderType;
      }
      if (auto) {
        data.auto = true;
      }
      if (this.isLogin) {
        this.$store.dispatch('getCoOrderListData', data);
      } else {
        this.tableLoading = false;
      }
    },
    // 表格操作按钮点击事件
    elementClick(type, data) {
      // 修改保证金
      if (type === 'margin') {
        // 显示修改保证金的弹框
        this.orderData.positions.forEach((item) => {
          if (data.id === item.id) {
            this.currentOrder = item;
          }
        });
        this.isShowDialog = true;
      }
      // 市价平仓
      if (type === 'close') {
        // 显示修改保证金的弹框
        this.orderData.positions.forEach((item) => {
          if (data.id === item.id) {
            this.close(item);
          }
        });
      }
      // 取消委托
      if (type === 'cancel') {
        this.orderData.orderList.forEach((item) => {
          if (data.id === item.orderId) {
            this.cancelOrder(item);
          }
        });
      }
      if (type === 'level') {
        let curSym = null;
        this.orderData.positions.forEach((item) => {
          if (data.id === item.id) {
            curSym = item.symbol;
            this.curLeverageLevel = `${item.leverageLevel}`;
          }
        });
        if (this.symbolAll && this.symbolAll[curSym]) {
          this.levelList = this.symbolAll[curSym].leverTypes.split(',');
          this.leverListShow = true;
        }
      }
    },
    // 限价平单 || 市价全平
    close(item) {
      let paramsData = {};
      paramsData = {
        // 合约ID
        contractId: item.contractId,
        // 数量
        volume: item.volume,
        // 价格
        price: item.indexPrice,
        // 限价1单还是市价单2
        orderType: item.orderType || 2,
        // 买卖
        side: item.side === 'BUY' ? 'SELL' : 'BUY',
        // 杠杆倍
        level: item.leverageLevel,
        // 0:开仓单，1：平仓单
        closeType: 1,
        // 1：全仓 2：逐仓（ 默认2：逐仓）
        copType: 2,
        // 仓位id
        positionId: item.id,
      };
      if (this.cancelFla) {
        this.cancelFla = false;
        this.axios({
          url: this.$store.state.url.contract.take_order,
          hostType: 'co',
          params: paramsData,
        }).then((data) => {
          if (data.code === '0') {
            this.cancelOrderId = item.id;
            this.limitPriceObj = {};
            this.getData();
            // 重新请求初始化数据
            this.$bus.$emit('GET_INIT_DATA', true);
            // 撤单成功
            this.$bus.$emit('tip', { text: this.$t('contract.c_success'), type: 'success' });
            this.cancelFla = true;
          } else {
            this.cancelFla = true;
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        }).catch(() => {
          this.cancelFla = true;
        });
      }
    },
    // 取消委托
    cancelOrder(item) {
      let paramsData = {};
      paramsData = {
        // 合约ID
        contractId: item.contractId,
        // 订单ID
        orderId: item.orderId,
      };
      // 检测是否是取消过的订单
      if (this.cancelFla && this.cancelOrderId !== item.orderId) {
        this.cancelOrderId = item.orderId;
        this.cancelFla = false;
        this.axios({
          url: this.$store.state.url.contract.cancel_order,
          hostType: 'co',
          params: paramsData,
        }).then((data) => {
          if (data.code === '0') {
            this.getData();
            // 重新请求初始化数据
            this.$bus.$emit('GET_INIT_DATA', true);
            // 撤单成功
            this.$bus.$emit('tip', { text: this.$t('contract.cancel_success'), type: 'success' });
            this.cancelFla = true;
          } else {
            this.cancelFla = true;
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        }).catch(() => {
          this.cancelFla = true;
        });
      }
    },
    // 切换 修改保证经类型
    setReviseType(type) {
      this.marginReviseType = type;
    },
    // 保证金输入
    inputChanges(value, name) {
      this[name] = value;
    },
    // 确认修改保证金
    dialogConfirm() {
      if (this.sumbitFla) {
        this.sumbitFla = false;
        const paramsData = {
          contractId: this.currentOrder.contractId,
          positionId: this.currentOrder.id,
          amount: this.marginReviseType === 'Add' ? this.marginValue : `-${this.marginValue}`,
        };
        this.axios({
          url: this.$store.state.url.contract.transfer_margin,
          hostType: 'co',
          params: paramsData,
        }).then((data) => {
          this.sumbitFla = true;
          if (data.code === '0') {
            this.getData();
            this.isShowDialog = false;
            this.marginValue = '';
            // 重新请求初始化数据
            this.$bus.$emit('GET_INIT_DATA', true);
            // 操作成功
            this.$bus.$emit('tip', { text: `${this.marginPromptText}${this.$t('contract.success')}`, type: 'success' });
          } else {
            this.isShowDialog = false;
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        }).catch(() => {
          this.sumbitFla = true;
          this.isShowDialog = false;
          // 体统错误
          this.$bus.$emit('tip', { text: this.$t('contract.c_error'), type: 'error' });
        });
      }
    },
    // 翻页事件
    pagechange(num) {
      this.pagination.page = num;
      this.getData();
    },
    // 弹框取消
    dialogClose() {
      this.marginValue = '';
      this.marginReviseType = 'Add';
      this.isShowDialog = false;
    },
    // 上拉加载翻页
    onInfiniteLoads(done) {
      if (this.pullUpState === 0) {
        this.pullUpState = 2;
        this.pagination.page += 1;
        this.getData();
      }
      done();
    },
    // 下拉刷新
    onRefresh(done) {
      this.pagination.page = 1;
      this.dataList = [];
      this.tableLoading = true;
      this.getData();
      done();
    },
    closeChangeLevel() {
      this.leverListShow = false;
    },
  },
  // 组件离开前执行
  beforeDestroy() {
    clearInterval(this.getDataInter);
  },
};
