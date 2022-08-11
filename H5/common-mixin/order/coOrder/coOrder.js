import { fixD, formatTime } from '@/utils';

export default {
  name: 'page-otcOrder',
  data() {
    return {
      switchFlag: false,
      tabelLoading: true,
      tabelList: [],
      nowType: 1, // 1为当前委托 2为历史委托
      contract: '', // 当前合约
      side: 'all', // 当前方向
      contractList: [],
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      revokeList: [], // 撤销队列
      // 上拉加载的设置
      pullUpState: 0,
    };
  },
  watch: {
    coPublicInfo(v) {
      if (v) {
        this.initContractList();
      }
    },
  },
  computed: {
    coPublicInfo() { return this.$store.state.baseData.coPublicInfo; },
    navTab() {
      return [
        // 当前委托
        { name: this.$t('order.otcOrder.nowOrder'), index: 1 },
        // 历史委托
        { name: this.$t('order.otcOrder.hisOrder'), index: 2 },
      ];
    },
    sideList() {
      return [ // 方向选择列表
        // 全部
        { code: 'all', value: this.$t('order.otcOrder.all') },
        // 买入
        { code: 'BUY', value: this.$t('order.otcOrder.buy') },
        // 卖出
        { code: 'SELL', value: this.$t('order.otcOrder.sell') },
      ];
    },
    axiosSide() {
      if (this.side === 'all') {
        return '';
      }
      return this.side;
    },
    // 表格title
    columns() {
      let list = [];
      if (this.nowType === 1) {
        list = [
          { title: this.$t('order.coOrder.nowList1'), width: '10%' }, // 时间
          { title: this.$t('order.coOrder.nowList3'), width: '8%' }, // 仓位数量(张)
          { title: this.$t('order.coOrder.nowList4'), width: '10%' }, // 委托价格
          { title: this.$t('order.coOrder.nowList5'), width: '5%' }, // 已成交
          { title: this.$t('order.coOrder.nowList6'), width: '5%' }, // 剩余
          { title: this.$t('order.coOrder.nowList7'), width: '10%' }, // 价值
          { title: this.$t('order.coOrder.nowList8'), width: '10%' }, // 成交均价
          { title: this.$t('order.coOrder.nowList9'), width: '10%' }, // 类型
          { title: this.$t('order.coOrder.nowList10'), width: '10%' }, // 状态
        ];
      } if (this.nowType === 2) {
        list = [
          { title: this.$t('order.coOrder.hisList1'), width: '100px' }, // 时间
          { title: this.$t('order.coOrder.hisList3'), width: '10%' }, // 仓位数量(张)
          { title: this.$t('order.coOrder.hisList4') }, // 委托价格
          { title: this.$t('order.coOrder.hisList5'), width: '10%' }, // 已成交
          { title: this.$t('order.coOrder.hisList6'), width: '15%' }, // 成交均价
          { title: this.$t('order.coOrder.hisList7') }, // 类型
          { title: this.$t('order.coOrder.hisList8') }, // 状态
        ];
      }
      return list;
    },
  },
  methods: {
    init() {
      if (this.coPublicInfo) {
        this.initContractList();
      }
    },
    initContractList() {
      const { market } = this.coPublicInfo;
      const list = [];
      Object.keys(market).forEach((vitem) => {
        market[vitem].forEach((item) => {
          const {
            baseSymbol, quoteSymbol, contractType, settleTime, maxLeverageLevel,
          } = item;
          let time = '';
          if (contractType) {
            const t = settleTime.split(' ')[0].split('-');
            time = t[1] + t[2];
          }
          const msg = `${this.getContractType(contractType)} · ${time} (${maxLeverageLevel}X)`;
          const str = `${baseSymbol}${quoteSymbol} - ${msg}`;
          list.push(
            {
              code: item.id,
              value: str,
            },
          );
        });
      });
      this.contractList = list;
      if (list.length) {
        this.contract = list[0].code;
        this.getData();
      }
    },
    switchChange() {
      this.switchFlag = !this.switchFlag;
      this.getData();
    },
    getData() {
      if (this.nowType === 1) {
        this.getNowData();
      } else if (this.nowType === 2) {
        this.getHisData();
      }
    },
    getStatus(status) {
      let str = '';
      switch (status) {
        case 0:
          str = this.$t('order.coOrder.status1'); // '新订单';
          break;
        case 1:
          str = this.$t('order.coOrder.status1'); // '新订单';
          break;
        case 2:
          str = this.$t('order.coOrder.status2'); // '完全成交';
          break;
        case 3:
          str = this.$t('order.coOrder.status3'); // '部分成交';
          break;
        case 4:
          str = this.$t('order.coOrder.status4'); // '已取消';
          break;
        case 5:
          str = this.$t('order.coOrder.status5'); // '待撤销';
          break;
        case 6:
          str = this.$t('order.coOrder.status6'); // '已废弃';
          break;
        case 7:
          str = this.$t('order.coOrder.status7'); // '部分成交已撤销';
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
          type = this.$t('order.coOrder.orderType1'); // '永续';
          break;
        case 1:
          type = this.$t('order.coOrder.orderType2'); // '当周';
          break;
        case 2:
          type = this.$t('order.coOrder.orderType3'); // '次周';
          break;
        case 3:
          type = this.$t('order.coOrder.orderType4'); // '月度';
          break;
        case 4:
          type = this.$t('order.coOrder.orderType5'); // '季度';
          break;
        default:
          type = '';
      }
      return type;
    },
    // 获取当前
    getNowData() {
      this.axios({
        url: 'order_list_new',
        hostType: 'co',
        method: 'post',
        params: {
          // order_type: '1'
          side: this.axiosSide,
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          contractId: this.contract,
        },
      }).then((data) => {
        if (this.nowType !== 1) return;
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          const list = [];
          const { orderList, count } = data.data;
          orderList.forEach((item) => {
            const type = this.getContractType(item.contractType);
            let time = '';
            if (item.contractType) {
              const t = item.settleTime.split(' ')[0].split('-');
              time = t[1] + t[2];
            }
            list.push({
              id: JSON.stringify(item),
              title: [
                {
                  text: `${item.symbol} ${type} · ${time} (${item.leverageLevel}X)`,
                },
              ],
              handle: [
                [0, 1, 3].indexOf(item.status) !== -1
                  ? {
                    type: 'button',
                    text: this.$t('order.coOrder.cancel'), // 撤单
                    eventType: 'cancelOrder',
                  } : null,
              ],
              data: [
                formatTime(item.ctimeStr), // 时间
                {
                  text: `<span
                    style="cursor: auto"
                    class="${item.side === 'BUY' ? 'u-1-cl' : 'u-4-cl'}">
                    ${item.side === 'BUY' ? '+' : '-'}
                    ${item.volume}
                  </span>`,
                },
                fixD(item.price, item.pricePrecision), // 委托价格
                item.dealVolume, // 已成交
                item.undealVolume, // 剩余
                fixD(item.orderPriceValue, item.pricePrecision), // 价值
                fixD(item.avgPrice, item.pricePrecision), // 成交均价
                item.type === 1
                  ? this.$t('order.coOrder.infoOrder')
                  : this.$t('order.coOrder.marketOrder'), // 类型
                this.getStatus(item.status),
              ],
            });
          });
          if (this.paginationObj.currentPage > 1) {
            this.tabelList = this.tabelList.concat(list);
          } else {
            this.tabelList = list;
          }
          this.paginationObj.total = data.data.count;
          if (Math.ceil(parseFloat(data.data.count) / parseFloat(this.paginationObj.display))
            > this.paginationObj.currentPage) {
            this.pullUpState = 0;
          } else {
            this.pullUpState = 3;
          }
          this.paginationObj.total = count;
        } else {
          this.pullUpState = 0;
          this.paginationObj.currentPage -= 1;
          if (this.paginationObj.currentPage < 1) {
            this.paginationObj.currentPage = 1;
          }
        }
      });
    },
    // 获取历史订单
    getHisData() {
      this.axios({
        url: 'order_list_history',
        hostType: 'co',
        method: 'post',
        params: {
          side: this.axiosSide,
          isShowCanceled: this.switchFlag ? 1 : 0,
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          contractId: this.contract,
        },
      }).then((data) => {
        if (this.nowType !== 2) return;
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          const list = [];
          const { orderList, count } = data.data;
          orderList.forEach((item) => {
            const type = this.getContractType(item.contractType);
            let time = '';
            if (item.contractType) {
              const t = item.settleTime.split(' ')[0].split('-');
              time = t[1] + t[2];
            }
            list.push({
              id: JSON.stringify(item),
              title: [
                {
                  text: `${item.symbol} ${type} · ${time} (${item.leverageLevel}X)`,
                },
              ],
              data: [
                formatTime(item.ctimeStr), // 时间
                {
                  text: `<span
                    style="cursor: auto"
                    class="${item.side === 'BUY' ? 'u-1-cl' : 'u-4-cl'}">
                    ${item.side === 'BUY' ? '+' : '-'}
                    ${item.volume}
                  </span>`,
                }, // 仓位数量(张)
                fixD(item.price, item.pricePrecision), // 委托价格
                item.dealVolume, // 已成交
                fixD(item.avgPrice, item.pricePrecision), // 成交均价
                item.type === 1
                  ? this.$t('order.coOrder.infoOrder')
                  : this.$t('order.coOrder.marketOrder'), // 类型
                this.getStatus(item.status),
              ],
            });
          });
          if (this.paginationObj.currentPage > 1) {
            this.tabelList = this.tabelList.concat(list);
          } else {
            this.tabelList = list;
          }
          this.paginationObj.total = data.data.count;
          if (Math.ceil(parseFloat(data.data.count) / parseFloat(this.paginationObj.display))
            > this.paginationObj.currentPage) {
            this.pullUpState = 0;
          } else {
            this.pullUpState = 3;
          }
          this.paginationObj.total = count;
        } else {
          this.pullUpState = 0;
          this.paginationObj.currentPage -= 1;
          if (this.paginationObj.currentPage < 1) {
            this.paginationObj.currentPage = 1;
          }
        }
      });
    },
    // 切换委托
    currentType(item) {
      if (this.nowType === item.index) { return; }
      this.nowType = item.index;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    // 切换方向
    sideChange(item) {
      if (this.side === item.code) { return; }
      this.side = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    contractChange(item) {
      if (this.contract === item.code) { return; }
      this.contract = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    tableClick(type, v) {
      if (type === 'cancelOrder') {
        const obj = JSON.parse(v.id);
        this.revokeList.push(obj.orderId);
        this.axios({
          url: 'cancel_order',
          hostType: 'co',
          method: 'post',
          params: {
            orderId: obj.orderId,
            contractId: obj.contractId,
          },
        }).then((data) => {
          const ind = this.revokeList.indexOf(obj.orderId);
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
    pagechange(v) {
      this.paginationObj.currentPage = v;
      this.getData();
    },
    // 上拉加载翻页
    onInfiniteLoads(done) {
      if (this.pullUpState === 0) {
        this.pullUpState = 2;
        this.paginationObj.currentPage += 1;
        this.getData();
      }
      done();
    },
    // 下拉刷新
    onRefresh(done) {
      this.paginationObj.currentPage = 1;
      this.getData();
      done();
    },
  },
};
