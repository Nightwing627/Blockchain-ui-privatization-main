import { fixD, formatTime, colorMap } from '@/utils';

export default {
  props: {
    symbol: {
      default: '',
      type: String,
    },
    // 是否为最近
    lately: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      colorMap,
      revokeList: [], // 撤销队列
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      tabelLoading: true,
      tabelList: [], // 提现记录
      subTableData: [], // 提现记录详情
      subTableDataId: null, // 提现记录详情ID
      financeListData: [],
      imgUrl: '',
      QRflag: false,
      pullUpState: 0,
      detailsBox: false,
    };
  },
  watch: {
    symbol(v) {
      if (v && this.market) {
        this.tabelList = [];
        this.tabelLoading = true;
        this.paginationObj.currentPage = 1;
        this.getTableList();
      }
    },
    market(v) {
      if (v && this.symbol) {
        this.getTableList();
      }
    },
  },
  computed: {
    // market 接口
    market() { return this.$store.state.baseData.market; },
    paginationObjCurrentPage() { return this.paginationObj.currentPage; },
    columns() {
      return [
        { title: this.$t('assets.withdraw.withdrawTime'), width: '15%' }, // 提现时间
        { title: this.$t('assets.b2c.b2cWithdrawHisList1'), width: '18%' }, // 到账金额
        { title: this.$t('assets.b2c.fee'), width: '18%' }, // 手续费
        { title: this.$t('assets.withdraw.withdrawStatus'), width: '14%' }, // 状态
      ];
    },
    subColumns() {
      return [
        { title: this.$t('assets.b2c.b2cRecrgeHisList3') }, // 处理时间
        { title: this.$t('assets.b2c.firstWay') }, // 收款方式
        { title: this.$t('assets.b2c.addressUserName') }, // 收款人
        // '转账凭证', // 转账凭证
      ];
    },
  },
  methods: {
    // 下拉刷新
    onRefresh(done) {
      this.tabelList = [];
      this.tabelLoading = true;
      this.paginationObj.currentPage = 1;
      this.getTableList();
      done();
    },
    onInfiniteLoads(done) {
      if (this.pullUpState === 0) {
        this.pullUpState = 2;
        this.paginationObj.currentPage += 1;
        this.getTableList();
      }
      done();
    },
    init() {
      if (this.symbol && this.market) {
        this.getTableList();
      }
    },
    QRcodeClick() {
      this.QRflag = false;
    },
    showPrecision(symbol) {
      let v = 0;
      const { market } = this.$store.state.baseData;
      if (market && market.coinList && market.coinList[symbol]) {
        v = market.coinList[symbol].showPrecision;
      }
      return v;
    },
    detailsClose() { this.detailsBox = false; },
    // 撤销操作
    tableClick(type, rdata) {
      const { id } = rdata;
      if (type === 'revoke') {
        let even = {};
        this.tabelList.forEach((item) => {
          if (item.id === id) {
            even = item;
          }
        });
        if (this.revokeList.indexOf(even.id) === -1) {
          this.revokeList.push(even.id);
          this.axios({
            url: '/fiat/cancel_withdraw',
            headers: {},
            params: {
              id: even.id,
            },
            method: 'post',
          }).then((data) => {
            const ind = this.revokeList.indexOf(even.id);
            this.revokeList.splice(ind, 1);
            if (data.code.toString() === '0') {
              this.tabelList = [];
              this.tabelLoading = true;
              this.paginationObj.currentPage = 1;
              this.getTableList();
              this.$bus.$emit('tip', { text: data.msg, type: 'success' });
              if (this.lately) {
                this.$bus.$emit('getMess');
              }
            } else {
              this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            }
          });
        }
      }
      if (type === 'subView') {
        this.subTableDataId = id;
        this.subTableData = [];
        this.financeListData.forEach((item) => {
          if (item.id === this.subTableDataId) {
            this.subTableData.push({
              data: [
                item.updatedAt ? formatTime(item.updatedAt) : '--',
                this.$t('assets.b2c.bankCard'), // '银行卡',
                item.userName || '--',
              ],
            });
          }
        });
        this.detailsBox = true;
      }
      if (type === 'seePz') {
        let even = {};
        this.tabelList.forEach((item) => {
          if (item.id === id) {
            even = item;
          }
        });
        this.imgUrl = even.transferVoucher;
        this.QRflag = true;
      }
    },
    handleButton(item) {
      const arr = [];
      if (item.transferVoucher) {
        arr.push({
          type: 'button', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
          text: this.$t('assets.b2c.seePz'),
          iconClass: [''],
          eventType: 'seePz',
        });
      }
      if (item.status === 0) {
        arr.push({
          type: 'button', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
          text: this.$t('assets.flowingWater.Cancel'),
          iconClass: [''],
          eventType: 'revoke',
        });
      }
      arr.push({
        type: 'subTable',
        text: this.$t('trade.view'), // 详情
        eventType: 'subView',
      });
      return arr;
    },
    getTableList() {
      this.axios({
        // url: '/fiat/deposit/list',
        url: '/fiat/withdraw/list',
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          symbol: this.symbol === 'all' ? undefined : this.symbol,
        },
      }).then((data) => {
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          const list = [];
          this.financeListData = data.data.financeList;
          data.data.financeList.forEach((item) => {
            const showPrecision = this.showPrecision(item.symbol);
            list.push({
              id: item.id,
              transferVoucher: item.transferVoucher,
              title: [
                { text: item.symbol },
              ],
              handle: this.handleButton(item),
              data: [
                formatTime(item.createdAt), // 时间
                `${fixD(item.amount, showPrecision)} ${item.symbol}`, // 实际到账
                `${fixD(item.fee, showPrecision)} ${item.symbol}`, // 手续费
                item.statusText, // 状态
              ],
            });
          });
          this.tabelList = [...[], ...this.tabelList, ...list];
          if (Math.ceil(parseFloat(data.data.count) / parseFloat(this.paginationObj.display))
            > this.paginationObj.currentPage) {
            this.pullUpState = 0;
          } else {
            this.pullUpState = 3;
          }
        }
      });
    },
  },
};
