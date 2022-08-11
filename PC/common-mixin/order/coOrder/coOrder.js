import {
  fixD,
  formatTime,
  imgMap,
  colorMap,
} from '@/utils';

export default {
  name: 'page-otcOrder',
  data() {
    return {
      imgMap,
      colorMap,
      switchFlag: false,
      tabelLoading: true,
      tabelList: [],
      startTime: '',
      endTime: '',
      nowType: 1, // 1为当前委托 2计划委托 3历史委托 4历史成交
      contractList: [], // 合约
      side: '', // 当前方向
      contractType: '', // 合约类型
      contract: '', // 当前合约
      orderType: '', // 订单类型
      paginationObj: {
        total: 0, // 数据总条数
        display: 20, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      revokeList: [], // 撤销队列
    };
  },
  watch: {
    sideList(v) {
      if (v && v.length) {
        this.side = 1;
      }
    },
    contractTypeList(v) {
      if (v && v.length) {
        this.contractType = 1;
      }
    },
    orderTypeList(v) {
      if (v && v.length) {
        this.orderType = 'all';
      }
    },
    contractListAll(newVal) {
      if (newVal && newVal.length) {
        this.getContractList();
      }
    },
    startTime(newVal, oldVal) {
      if (oldVal) {
        this.getData();
      }
    },
    endTime(newVal, oldVal) {
      if (oldVal) {
        this.getData();
      }
    },
  },
  computed: {
    startTimeNum() {
      return (new Date(this.startTime.replace(/-/g, '/')).getTime() / 1000).toString();
    },
    endTimeNum() {
      return (new Date(this.endTime.replace(/-/g, '/')).getTime() / 1000).toString();
    },
    // 合约列表
    contractListAll() {
      if (this.$store.state.future) {
        return this.$store.state.future.contractList;
      }
      return [];
    },
    // 合约列表 MAP
    contractListMap() {
      if (this.$store.state.future) {
        return this.$store.state.future.contractListMap;
      }
      return {};
    },
    coPublicInfo() { return this.$store.state.baseData.coPublicInfo; },
    navTab() {
      return [
        // 当前委托
        { name: this.$t('futures.order.title1'), index: 1 },
        // 计划委托
        { name: this.$t('futures.order.title2'), index: 2 },
        // 历史委托
        { name: this.$t('futures.order.title3'), index: 3 },
        // 历史计划委托
        { name: this.$t('futures.order.title4'), index: 4 },
        // 历史成交
        { name: this.$t('futures.order.title5'), index: 5 },
      ];
    },
    sideList() {
      return [ // 交割类型列表
        // 永续合约
        { code: 1, value: this.$t('futures.order.typeList1') },
        // 模拟合约
        { code: 2, value: this.$t('futures.order.typeList2') },
        // 混合合约
        { code: 3, value: this.$t('futures.order.typeList3') },
      ];
    },
    // 合约类型
    contractTypeList() {
      return [ // 合约类型列表
        // USDT合约
        { code: 1, value: this.$t('futures.order.sideType1') },
        // 币本位合约
        { code: 0, value: this.$t('futures.order.sideType2') },
        // // 混合合约
        // { code: 2, value: '混合合约' },
      ];
    },
    // 订单类型
    orderTypeList() {
      return [ // 订单类型列表
        // 全部
        { code: 'all', value: this.$t('futures.order.all') },
        // 限价单
        { code: 1, value: this.$t('futures.order.orderType1') },
        // 市价单
        { code: 2, value: this.$t('futures.order.orderType2') },
        // PostOnly
        { code: 3, value: this.$t('futures.order.orderType3') },
        // IOC
        { code: 4, value: this.$t('futures.order.orderType4') },
        // FOK
        { code: 5, value: this.$t('futures.order.orderType5') },
      ];
    },
    //
    axiosType() {
      if (this.orderType === 'all') {
        return '';
      }
      return this.orderType;
    },
    // 表格title
    columns() {
      let list = [];
      if (this.nowType === 1) {
        list = [
          { title: this.$t('futures.order.contract'), width: '10%', align: 'left' }, // 合约
          { title: this.$t('futures.order.time'), width: '10%' }, // 时间
          { title: this.$t('futures.order.orderType'), width: '10%' }, // 订单类型
          { title: this.$t('futures.order.side'), width: '10%' }, // 方向
          { title: this.$t('futures.order.intrustPrice'), width: '10%' }, // 委托价格
          { title: this.$t('futures.order.intrustVolume'), width: '10%' }, // 委托数量
          { title: this.$t('futures.order.dealVolume'), width: '10%' }, // 成交数量
          { title: this.$t('futures.order.dealPrice'), width: '10%' }, // 成交均价
          { title: this.$t('futures.order.onlyCut'), width: '10%' }, // 只减仓
          { title: this.$t('futures.order.opera'), width: '10%' }, // 操作
        ];
      }
      if (this.nowType === 2) {
        list = [
          { title: this.$t('futures.order.contract'), width: '10%', align: 'left' }, // 合约
          { title: this.$t('futures.order.time'), width: '10%' }, // 时间
          { title: this.$t('futures.order.orderType'), width: '10%' }, // 订单类型
          { title: this.$t('futures.order.side'), width: '10%' }, // 方向
          { title: this.$t('futures.order.triggerPrice'), width: '10%' }, // 触发价
          { title: this.$t('futures.order.intrustPrice'), width: '10%' }, // 委托价格
          { title: this.$t('futures.order.intrustVolumeOrNum'), width: '10%' }, // 委托数量/价值
          // { title: '成交数量(张)', width: '10%' }, // 价值
          // { title: '成交均价', width: '10%' }, // 成交均价
          { title: this.$t('futures.order.onlyCut'), width: '10%' }, // 只减仓
          { title: this.$t('futures.order.overTime'), width: '10%' }, // 只减仓
          { title: this.$t('futures.order.opera'), width: '10%' }, // 操作
        ];
      }
      if (this.nowType === 3) {
        list = [
          { title: this.$t('futures.order.contract'), width: '8%', align: 'left' }, // 合约
          { title: this.$t('futures.order.time'), width: '10%' }, // 时间
          { title: this.$t('futures.order.orderType'), width: '10%' }, // 订单类型(张)
          { title: this.$t('futures.order.side'), width: '10%' }, // 方向
          { title: this.$t('futures.order.intrustPrice'), width: '10%' }, // 委托价格
          { title: this.$t('futures.order.intrustVolumeOrNum'), width: '10%' }, // 委托数量/价值
          { title: this.$t('futures.order.dealVolume'), width: '10%' }, // 成交数量
          { title: this.$t('futures.order.dealPrice'), width: '8%' }, // 成交均价
          { title: this.$t('futures.order.fee'), width: '8%' }, // 手续费
          { title: this.$t('futures.order.onlyCut'), width: '8%' }, // 只减仓
          { title: this.$t('futures.order.status'), width: '8%' }, // 状态
        ];
      }
      if (this.nowType === 4) {
        list = [
          { title: this.$t('futures.order.contract'), width: '10%', align: 'left' }, // 合约
          { title: this.$t('futures.order.side'), width: '10%' }, // 方向
          { title: this.$t('futures.order.triggerPrice'), width: '15%' }, // 触发价格
          { title: this.$t('futures.order.intrustPrice'), width: '15%' }, // 委托价格
          { title: this.$t('futures.order.intrustVolumeOrNum'), width: '10%' }, // 委托数量/价值
          { title: this.$t('futures.order.onlyCut'), width: '10%' }, // 只减仓
          { title: this.$t('futures.order.status'), width: '10%' }, // 状态
          { title: this.$t('futures.order.submitTime'), width: '10%' }, // 提交委托时间
          { title: this.$t('futures.order.triggerTime'), width: '10%' }, // 触发时间
        ];
      }
      if (this.nowType === 5) {
        list = [
          { title: this.$t('futures.order.contract'), width: '10%', align: 'left' }, // 合约
          { title: this.$t('futures.order.time'), width: '15%' }, // 时间
          { title: this.$t('futures.order.side'), width: '15%' }, // 方向
          { title: this.$t('futures.order.roles'), width: '15%' }, // 角色
          { title: this.$t('futures.order.dealVolume'), width: '15%' }, // 成交数量
          { title: this.$t('futures.order.priceDeal'), width: '15%' }, // 成交价格
          { title: this.$t('futures.order.fee'), width: '15%' }, // 手续费
        ];
      }
      return list;
    },
    // 历史委托
    historyMemoText() {
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
      if (this.sideList[0].value) {
        this.side = 1;
      }
      if (this.contractTypeList[0].value) {
        this.contractType = 1;
      }
      if (this.orderTypeList[0].value) {
        this.orderType = 'all';
      }
      if (this.contractListAll) {
        this.getContractList();
      }
      this.resetTime();
    },
    // 重置时间
    resetTime() {
      const timestamp = new Date().getTime();
      const t = 60 * 60 * 24 * 1000 * 2;
      this.startTime = this.getNowTime(timestamp - t);
      this.endTime = this.getNowTime(timestamp);
      this.start = `${this.startTime} 00:00:00`;
      this.end = `${this.endTime} 23:59:59`;
    },
    getNowTime(time = '') {
      const date = new Date(time);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}-${month}-${day}`;
    },
    getContractList() {
      let side = '';
      if (this.side) {
        if (this.side === 1) {
          side = 'E';
        } else if (this.side === 2) {
          side = 'S';
        } else {
          side = 'H';
        }
      } else {
        side = 'E';
      }
      let contractType = '';
      if (this.contractType !== '') {
        contractType = this.contractType;
      } else {
        contractType = 1;
      }
      const list = [];
      this.contract = null;
      this.contractListAll.forEach((item) => {
        if (item.coType === side && item.contractSide === contractType) {
          list.push(
            {
              code: item.id,
              value: item.symbol.replace('-', ''),
            },
          );
        }
      });
      this.contractList = list;
      if (list.length) {
        this.contract = list[0].code;
        this.tabelLoading = true;
        this.getData();
      } else {
        this.paginationObj.currentPage = 1; // 页码
        this.paginationObj.total = 0; // 总条数
        this.tabelList = [];
        this.tabelLoading = false;
      }
    },
    // initContractList() {
    //   const { market } = this.coPublicInfo;
    //   const list = [];
    //   Object.keys(market).forEach((vitem) => {
    //     market[vitem].forEach((item) => {
    //       const {
    //         baseSymbol, quoteSymbol, contractType, settleTime, maxLeverageLevel,
    //       } = item;
    //       let time = '';
    //       if (contractType) {
    //         const t = settleTime.split(' ')[0].split('-');
    //         time = t[1] + t[2];
    //       }
    //       const msg = `${this.getContractType(contractType)} · ${time} (${maxLeverageLevel}X)`;
    //       const str = `${baseSymbol}${quoteSymbol} - ${msg}`;
    //       list.push(
    //         {
    //           code: item.id,
    //           value: str,
    //         },
    //       );
    //     });
    //   });
    //   this.contractList = list;
    //   if (list.length) {
    //     this.contract = list[0].code;
    //     this.getData();
    //   }
    // },
    // switchChange() {
    //   this.switchFlag = !this.switchFlag;
    //   this.getData();
    // },
    getData() {
      if (this.nowType === 1) {
        this.getNowData();
      } else if (this.nowType === 2) {
        this.getPlanData();
      } else if (this.nowType === 3) {
        this.getHisData();
      } else if (this.nowType === 4) {
        this.getHisPlanData();
      } else if (this.nowType === 5) {
        this.getHisDealData();
      }
    },
    typeStatus(status) {
      let str = '';
      switch (status) {
        case 1:
          str = this.$t('futures.order.orderType1'); // '限价单';
          break;
        case 2:
          str = this.$t('futures.order.orderType2'); // '市价单';
          break;
        case 3:
          str = this.$t('futures.order.orderType4'); // 'IOC';
          break;
        case 4:
          str = this.$t('futures.order.orderType5'); // 'FOK';
          break;
        case 5:
          str = this.$t('futures.order.orderType3'); // 'POST_ONLY';
          break;
        case 6:
          str = this.$t('futures.order.orderType6'); // '强制减仓';
          break;
        case 7:
          str = this.$t('futures.order.orderType7'); // '仓位合并';
          break;
        default:
          str = '';
      }
      return str;
    },
    getStatus(status) {
      let str = '';
      switch (status) {
        case 0:
          str = this.$t('futures.order.status1'); // '新订单';
          break;
        case 1:
          str = this.$t('futures.order.status1'); // '新订单';
          break;
        case 2:
          str = this.$t('futures.order.status2'); // '完全成交';
          break;
        case 3:
          str = this.$t('futures.order.status3'); // '部分成交';
          break;
        case 4:
          str = this.$t('futures.order.status4'); // '已取消';
          break;
        case 5:
          str = this.$t('futures.order.status5'); // '待撤销';
          break;
        case 6:
          str = this.$t('futures.order.status6'); // '异常订单';
          break;
        case 7:
          str = this.$t('futures.order.status7'); // '部分成交已撤销';
          break;
        default:
          str = '';
      }
      return str;
    },
    getContractType(contractType) {
      let type = '';
      switch (contractType) {
        case 0:
          type = this.$t('futures.order.contractType1'); // '永续';
          break;
        case 1:
          type = this.$t('futures.order.contractType2'); // '当周';
          break;
        case 2:
          type = this.$t('futures.order.contractType3'); // '次周';
          break;
        case 3:
          type = this.$t('futures.order.contractType4'); // '月度';
          break;
        case 4:
          type = this.$t('futures.order.contractType5'); // '季度';
          break;
        default:
          type = '';
      }
      return type;
    },
    statusText(status) {
      let str = '';
      switch (status) {
        case 0:
          str = this.$t('futures.order.statusText1'); // '有效';
          break;
        case 1:
          str = this.$t('futures.order.statusText2'); // '已过期';
          break;
        case 2:
          str = this.$t('futures.order.statusText3'); // '已完成';
          break;
        case 3:
          str = this.$t('futures.order.statusText4'); // '触发失败';
          break;
        case 4:
          str = this.$t('futures.order.status4'); // '已取消';
          break;
        default:
          str = '';
      }
      return str;
    },
    // 获取当前委托
    getNowData() {
      this.axios({
        url: 'order/current_order_list',
        hostType: 'co',
        method: 'post',
        params: {
          type: this.axiosType,
          // side: this.side,
          limit: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          contractId: this.contract,
        },
      }).then((data) => {
        if (this.nowType !== 1) return;
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          const list = [];
          const { orderList, count } = data.data;
          if (orderList && orderList.length) {
            orderList.forEach((item) => {
              const open = item.open === 'OPEN' ? this.$t('futures.order.open') : this.$t('futures.order.close');
              let side = this.$t('futures.order.sell');
              if ((item.open === 'OPEN' && item.side === 'BUY')
              || (item.open === 'CLOSE' && item.side === 'SELL')) {
                side = this.$t('futures.order.buy');
              }
              let price = null;
              if (item.type === 2 && Number(item.price) === 0) {
                price = this.$t('futures.order.currentPrice');
              } else {
                price = fixD(item.price, item.pricePrecision);
              }
              list.push({
                id: JSON.stringify(item),
                data: [
                  item.symbol, // 合约
                  formatTime(item.ctime), // 时间
                  this.typeStatus(item.type),
                  open + side,
                  price, // 委托价格
                  item.volume, // 委托数量
                  item.dealVolume, // 成交数量
                  item.avgPrice ? fixD(item.avgPrice, item.pricePrecision) : '--', // 成交均价
                  item.open === 'CLOSE'
                    ? this.$t('futures.order.yes')
                    : this.$t('futures.order.no'), // 只减仓
                  [
                    {
                      type: 'button',
                      text: this.$t('futures.order.cancel'), // 撤单
                      eventType: 'cancelOrder',
                    },
                  ],
                ],
              });
            });
          }
          this.tabelList = list;
          this.paginationObj.total = count;
        }
      });
    },
    // 获取计划委托
    getPlanData() {
      this.axios({
        url: 'order/trigger_order_list',
        hostType: 'co',
        method: 'post',
        params: {
          type: this.axiosType,
          // side: this.side,
          limit: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          contractId: this.contract,
        },
      }).then((data) => {
        if (this.nowType !== 2) return;
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          const list = [];
          const { trigOrderList, count } = data.data;
          if (trigOrderList && trigOrderList.length) {
            trigOrderList.forEach((item) => {
              const open = item.open === 'OPEN' ? this.$t('futures.order.open') : this.$t('futures.order.close');
              let side = this.$t('futures.order.sell');
              if ((item.open === 'OPEN' && item.side === 'BUY')
              || (item.open === 'CLOSE' && item.side === 'SELL')) {
                side = this.$t('futures.order.buy');
              }
              let price = null;
              let unit = null;
              let volume = null;
              if (item.type === 2 && Number(item.price) === 0) {
                price = this.$t('futures.order.currentPrice');
                if (item.open === 'OPEN') {
                  if (this.contractListMap) {
                    unit = this.contractListMap[item.contractName].marginCoin;
                    volume = fixD(item.volume, this.contractListMap[item.contractName].mCionFix);
                  }
                } else {
                  volume = item.volume;
                  unit = this.$t('futures.order.per');
                }
              } else {
                volume = item.volume;
                price = fixD(item.price, item.pricePrecision);
                unit = this.$t('futures.order.per');
              }
              list.push({
                id: JSON.stringify(item),
                data: [
                  item.symbol, // 合约
                  formatTime(item.ctime), // 时间
                  this.typeStatus(item.type),
                  open + side,
                  fixD(item.triggerPrice, item.pricePrecision), // 触发价
                  price, // 委托价格
                  `${volume} ${unit}`, // 委托数量
                  // item.dealVolume, // 成交数量
                  // fixD(item.avgPrice, item.pricePrecision), // 成交均价
                  item.open === 'CLOSE'
                    ? this.$t('futures.order.yes')
                    : this.$t('futures.order.no'), // 只减仓
                  formatTime(item.expireTime), // 过期时间
                  [
                    {
                      type: 'button',
                      text: this.$t('futures.order.cancel'), // 撤单
                      eventType: 'cancelOrder',
                    },
                  ],
                ],
              });
            });
          }
          this.tabelList = list;
          this.paginationObj.total = count;
        }
      });
    },
    // 获取历史委托
    getHisData() {
      this.axios({
        url: 'order/history_order_list',
        hostType: 'co',
        method: 'post',
        params: {
          type: this.axiosType,
          limit: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          contractId: this.contract,
          beginTime: new Date(this.start).getTime(),
          endTime: new Date(this.end).getTime(),
        },
      }).then((data) => {
        if (this.nowType !== 3) return;
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          const list = [];
          const { orderList, count } = data.data;
          if (orderList && orderList.length) {
            orderList.forEach((item, index) => {
              const open = item.open === 'OPEN' ? this.$t('futures.order.open') : this.$t('futures.order.close');
              let side = this.$t('futures.order.sell');
              if ((item.open === 'OPEN' && item.side === 'BUY')
              || (item.open === 'CLOSE' && item.side === 'SELL')) {
                side = this.$t('futures.order.buy');
              }
              let price = null;
              let unit = null;
              let volume = null;
              if (item.type === 2 && Number(item.price) === 0) {
                price = this.$t('futures.order.currentPrice');
                if (item.open === 'OPEN') {
                  if (this.contractListMap) {
                    unit = this.contractListMap[item.contractName].marginCoin;
                    volume = fixD(item.volume, this.contractListMap[item.contractName].mCionFix);
                  }
                } else {
                  volume = item.volume;
                  unit = this.$t('futures.order.per');
                }
              } else {
                volume = item.volume;
                price = fixD(item.price, item.pricePrecision);
                unit = this.$t('futures.order.per');
              }
              let lastClass = null;
              if (index > 3) {
                lastClass = 'position-bottom';
              }
              list.push({
                id: JSON.stringify(item),
                data: [
                  item.symbol, // 合约
                  formatTime(item.ctime), // 时间
                  // this.typeStatus(item.type),
                  item.liqPositionMsg ? [
                    {
                      text: `<div class="cancel_cause cancel_cause_right">
                      ${this.typeStatus(item.type)}
                      <span class="cancel_cause-btn">
                        <svg aria-hidden="true" class="icon icon-16">
                          <use xlink:href="#icon-a_15"></use>
                        </svg>
                        <div class="cancel_cause_text a-5-bg b-1-cl a-3-bd ${lastClass}">
                        ${this.replaceAll(item.liqPositionMsg)}
                        </div>
                      </span>
                    </div>`,
                      type: 'html',
                    },
                  ] : this.typeStatus(item.type),
                  open + side,
                  item.type === 6 ? '--' : price, // 委托价格
                  `${volume} ${unit}`, // 委托数量
                  item.dealVolume, // 成交数量
                  (!item.avgPrice || item.type === 6) ? '--' : fixD(item.avgPrice, item.pricePrecision), // 成交均价
                  `${fixD(item.tradeFee, item.pricePrecision)} ${this.contractListMap[item.contractName].marginCoin}`, /// 手续费
                  item.open === 'CLOSE'
                    ? this.$t('futures.order.yes')
                    : this.$t('futures.order.no'), // 只减仓
                  // this.getStatus(item.status), // 状态
                  // 状态
                  item.status === 4 && item.memo ? [
                    {
                      text: `<div class="cancel_cause">
                      ${this.getStatus(item.status)}
                      <span class="cancel_cause-btn">
                        <svg aria-hidden="true" class="icon icon-16">
                          <use xlink:href="#icon-a_15"></use>
                        </svg>

                        <div class="cancel_cause_text a-7-bg b-1-cl a-3-bd ${lastClass}">
                          ${this.historyMemoText[item.memo - 1]}
                        </div>
                      </span>
                    </div>`,
                      type: 'html',
                    },
                  ] : this.getStatus(item.status),
                ],
              });
            });
          }
          this.tabelList = list;
          this.paginationObj.total = count;
        }
      });
    },
    // 获取历史计划委托
    getHisPlanData() {
      this.axios({
        url: 'order/history_trigger_order_list',
        hostType: 'co',
        method: 'post',
        params: {
          type: this.axiosType,
          limit: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          contractId: this.contract,
          beginTime: new Date(this.start).getTime(),
          endTime: new Date(this.end).getTime(),
        },
      }).then((data) => {
        if (this.nowType !== 4) return;
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          const list = [];
          const { trigOrderList, count } = data.data;
          if (trigOrderList && trigOrderList.length) {
            trigOrderList.forEach((item, index) => {
              const open = item.open === 'OPEN' ? this.$t('futures.order.open') : this.$t('futures.order.close');
              let side = this.$t('futures.order.sell');
              if ((item.open === 'OPEN' && item.side === 'BUY')
              || (item.open === 'CLOSE' && item.side === 'SELL')) {
                side = this.$t('futures.order.buy');
              }
              let price = null;
              let unit = null;
              let volume = null;
              if (item.type === 2 && Number(item.price) === 0) {
                price = this.$t('futures.order.currentPrice');
                if (item.open === 'OPEN') {
                  if (this.contractListMap) {
                    unit = this.contractListMap[item.contractName].marginCoin;
                    volume = fixD(item.volume, this.contractListMap[item.contractName].mCionFix);
                  }
                } else {
                  volume = item.volume;
                  unit = this.$t('futures.order.per');
                }
              } else {
                volume = item.volume;
                price = fixD(item.price, item.pricePrecision);
                unit = this.$t('futures.order.per');
              }
              let lastClass = null;
              if (index > 3) {
                lastClass = 'position-bottom';
              }
              list.push({
                id: JSON.stringify(item),
                data: [
                  item.symbol, // 合约
                  open + side, // 方向
                  fixD(item.triggerPrice, item.pricePrecision), // 触发价格
                  price, // 委托价格
                  `${volume} ${unit}`, // 委托数量
                  item.open === 'CLOSE'
                    ? this.$t('futures.order.yes')
                    : this.$t('futures.order.no'), // 只减仓
                  // this.statusText(item.status), // 状态
                  item.status === 4 && item.memo ? [
                    {
                      text: `<div class="cancel_cause">
                      ${this.statusText(item.status)}
                      <span class="cancel_cause-btn">
                        <svg aria-hidden="true" class="icon icon-16">
                          <use xlink:href="#icon-a_15"></use>
                        </svg>
                        <div class="cancel_cause_text a-7-bg b-1-cl a-3-bd ${lastClass}">
                          ${this.memoText(item)}
                        </div>
                      </span>
                    </div>`,
                      type: 'html',
                    },
                  ] : this.statusText(item.status),

                  formatTime(item.ctime), // 提交委托时间
                  formatTime(item.mtime), // 触发时间
                ],
              });
            });
          }
          this.tabelList = list;
          this.paginationObj.total = count;
        }
      });
    },
    replaceAll(str) {
      return str.replace(/\\n/g, '<br/>');
    },
    // 取消原因
    memoText(data) {
      let type = '';
      this.sideList.forEach((item) => {
        if (this.side === item.code) {
          type = item.value;
        }
      });
      if (data.memo === 1) {
        return this.$t('futures.order.memoText1'); // '用户取消';
      }
      if (data.memo === 2) {
        return this.$t('futures.order.memoText2'); // '超过有效期';
      }
      if (data.memo === 3) {
        // 最新价格达到
        return `${formatTime(data.mtime)}${data.symbol}${type} ${this.$t('futures.order.memoText3')}
        ${fixD(data.triggerPrice, data.pricePrecision)}
        ${this.$t('futures.order.memoText4')}`;
        // 触发计划委托，因账户保证金余额不足，委托无法提交，执行失败
      }
      if (data.memo === 4) {
        return `${formatTime(data.mtime)}${data.symbol}${type} ${this.$t('futures.order.memoText3')}
        ${fixD(data.triggerPrice, data.pricePrecision)}
        ${this.$t('futures.order.memoText5')}`;
        // 触发计划委托，因仓位可平数量不足，无法提交委托，执行失败`;
      }
      if (data.memo === 5) {
        return `${formatTime(data.mtime)}${data.symbol}${type} ${this.$t('futures.order.memoText3')}
        ${fixD(data.triggerPrice, data.pricePrecision)}
        ${this.$t('futures.order.memoText6')}`;
        // 触发计划委托，因仓位发生强平，无法提交委托，执行失败`;
      }
      if (data.memo === 6) {
        return `${formatTime(data.mtime)}${data.symbol}${type} ${this.$t('futures.order.memoText3')}
        ${fixD(data.triggerPrice, data.pricePrecision)}
        ${this.$t('futures.order.memoText7')}`;
        // 触发计划委托，因该合约已被暂停交易，无法提交委托，执行失败`;
      }
      return null;
    },
    // 获取历史成交
    getHisDealData() {
      this.axios({
        url: 'order/his_trade_list',
        hostType: 'co',
        method: 'post',
        params: {
          type: this.axiosType,
          limit: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          contractId: this.contract,
          beginTime: new Date(this.start).getTime(),
          endTime: new Date(this.end).getTime(),
        },
      }).then((data) => {
        if (this.nowType !== 5) return;
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          const list = [];
          const { tradeHisList, count } = data.data;
          if (tradeHisList && tradeHisList.length) {
            tradeHisList.forEach((item) => {
              const open = item.open === 'OPEN' ? this.$t('futures.order.open') : this.$t('futures.order.close');
              let side = this.$t('futures.order.sell');
              if ((item.open === 'OPEN' && item.side === 'BUY')
              || (item.open === 'CLOSE' && item.side === 'SELL')) {
                side = this.$t('futures.order.buy');
              }
              list.push({
                id: JSON.stringify(item),
                data: [
                  item.symbol, // 合约
                  formatTime(item.ctime), // 时间
                  open + side,
                  item.role,
                  item.volume, // 成交数量
                  fixD(item.price, item.pricePrecision), // 成交价格
                  `${fixD(item.fee, item.feeCoinPrecision)} ${item.feeCoin}`, // 手续费
                ],
              });
            });
          }
          this.tabelList = list;
          this.paginationObj.total = count;
        }
      });
    },
    outExcela() {
    // outExcela(url, params, type) {
      // return new Promise((resolve) => {
      //   this.axios({
      //     url,
      //     params,
      //     hostType: type,
      //     responseType: 'arraybuffer',
      //     mustAll: true,
      //   }).then(({ data, headers }) => {
      //     console.log(data, headers);
      //     const content = data;
      //     const blob = new Blob([content]);
      //     if (decodeURI(headers['content-disposition']) !== 'undefined') {
      //       const fileName = decodeURI(headers['content-disposition'].split('"')[1]);
      //       // const fileName = 'as.xlsx';
      //       // 非IE下载
      //       if ('download' in document.createElement('a')) {
      //         const elink = document.createElement('a');
      //         elink.download = fileName;
      //         elink.style.display = 'none';
      //         elink.href = URL.createObjectURL(blob);
      //         document.body.appendChild(elink);
      //         elink.click();
      //         URL.revokeObjectURL(elink.href); // 释放URL 对象
      //         document.body.removeChild(elink);
      //       } else { // IE10+下载
      //         navigator.msSaveBlob(blob, fileName);
      //       }
      //     }
      //     const enc = new TextDecoder('utf-8');
      //     const res = null;
      //     if (decodeURI(headers['content-disposition']) !== 'undefined') {
      //       res = { code: '0' }; // 转化成json对象
      //     } else {
      //       res = JSON.parse(enc.decode(new Uint8Array(data))); // 转化成json对象
      //     }
      //     resolve(res);
      //   });
      // });
    },
    // 导出CSV
    exportCSV() {
      // let exporturl = '';
      // if (this.nowType === 3) {
      //   exporturl = 'order/export/his_order_list_saas';
      // } else if (this.nowType === 4) {
      //   exporturl = 'order/export/trigger_order_list';
      //   this.axiosType = '';
      // }
      // const data = {
      //   type: this.axiosType,
      //   limit: this.paginationObj.display, // 每页条数
      //   page: this.paginationObj.currentPage, // 页码
      //   contractId: this.contract,
      //   beginTime: new Date(this.start).getTime(),
      //   endTime: new Date(this.end).getTime(),
      // };
      // this.outExcela('order/export/his_order_list_saas', data, 'co').then((datas) => {
      //   // this.outFlagImport = true;
      //   if (datas.code === '0') {
      //     this.$bus.$emit('alert', { type: 'success', message: '导出成功' }); // 导出成功
      //   } else {
      //     this.$bus.$emit('alert', { type: 'error', message: datas.msg }); // 导出失败
      //   }
      // });
    },
    // 切换tab
    currentType(item) {
      if (this.nowType === item.index) { return; }
      this.resetTime();
      this.nowType = item.index;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    // 切换交割类型
    sideChange(item) {
      if (this.side === item.code) { return; }
      this.side = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getContractList();
    },
    // 切换合约类型
    contractTypeChange(item) {
      if (this.contractType === item.code) { return; }
      this.contractType = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getContractList();
    },
    // 切换合约
    contractChange(item) {
      if (this.contract === item.code) { return; }
      this.contract = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    // 切换订单类型
    orderTypeChange(item) {
      if (this.orderType === item.code) { return; }
      this.orderType = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    // 撤销订单
    tableClick(type, v) {
      if (type === 'cancelOrder') {
        const obj = JSON.parse(v);
        this.revokeList.push(obj.id);
        const isConditionOrder = this.nowType === 2;
        this.axios({
          url: 'order/order_cancel',
          hostType: 'co',
          method: 'post',
          params: {
            orderId: obj.id,
            contractId: this.contract,
            isConditionOrder,
          },
        }).then((data) => {
          const ind = this.revokeList.indexOf(obj.id);
          this.revokeList.splice(ind, 1);
          if (data.code.toString() === '0') {
            this.$bus.$emit('tip', { text: this.$t('contract.cancel_success'), type: 'success' });
            // let sId = 0;
            // this.tabelList.forEach((item, i) => {
            //   if (item.id === id) {
            //     sId = i;
            //   }
            // });
            // this.tabelList.splice(sId, 1);
            this.getData();
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      }
    },
    // 撤销全部订单
    cancelAll() {
      if (this.tabelList.length) {
        const isConditionOrder = this.nowType === 2;
        this.axios({
          url: 'order/order_cancel',
          hostType: 'co',
          method: 'post',
          params: {
            contractId: this.contract,
            isConditionOrder,
          },
        }).then((data) => {
          if (data.code.toString() === '0') {
            this.$bus.$emit('tip', { text: this.$t('contract.cancel_success'), type: 'success' });
            this.getData();
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      }
    },
    search() {
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    // 选择时间
    startTimeSelect(v) {
      this.startTime = v;
      this.start = `${this.startTime} 00:00:00`;
      this.end = `${this.endTime} 23:59:59`;
      // this.loading = true;
      // this.listPage.page = 1;
      // this.getData();
    },
    endTimeSelect(v) {
      this.endTime = v;
      this.start = `${this.startTime} 00:00:00`;
      this.end = `${this.endTime} 23:59:59`;
      // this.loading = true;
      // this.listPage.page = 1;
      // this.getData();
    },
    pagechange(v) {
      this.paginationObj.currentPage = v;
      this.getData();
    },
  },
};
