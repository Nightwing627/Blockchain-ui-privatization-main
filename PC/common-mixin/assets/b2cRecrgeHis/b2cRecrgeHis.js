import { fixD, formatTime, colorMap } from '@/utils';

export default {
  name: 'b2cRecrgeHis',
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
    };
  },
  watch: {
    symbol(v) {
      if (v && this.market) {
        this.getTableList();
      }
    },
    market(v) {
      if (v && this.symbol) {
        this.getTableList();
      }
    },
    paginationObjCurrentPage() { this.getTableList(); },
  },
  computed: {
    // market 接口
    market() { return this.$store.state.baseData.market; },
    paginationObjCurrentPage() { return this.paginationObj.currentPage; },
    columns() {
      return [
        { title: this.$t('assets.recharge.RechargeTime'), width: '15%' }, // 提现时间
        { title: this.$t('assets.recharge.RechargeCoin'), width: '10%' }, // 币种
        { title: this.$t('assets.b2c.b2cRecrgeHisList1'), width: '18%' }, // 申请数量
        { title: this.$t('assets.b2c.b2cRecrgeHisList2'), width: '18%' }, // 实际到账
        { title: this.$t('assets.withdraw.withdrawStatus'), width: '14%' }, // 状态
        { title: this.$t('assets.withdraw.withdrawOptions'), width: '25%' }, // 操作
      ];
    },
    subColumns() {
      return [
        this.$t('assets.b2c.b2cRecrgeHisList3'), // 处理时间
        this.$t('assets.b2c.firstWay'), // 收款方式
        this.$t('assets.b2c.addressUserName'), // 收款人
      ];
    },
  },
  methods: {
    init() {
      if (this.symbol && this.market) {
        this.getTableList();
      }
      this.$bus.$on('b2cRecrgeHisGet', () => {
        this.tabelLoading = true;
        this.paginationObj.currentPage = 1;
        this.getTableList();
      });
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
    // 分页器
    pagechange(v) { this.paginationObj.currentPage = v; },
    // 撤销操作
    tableClick(type, id) {
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
            url: '/fiat/cancel_deposit',
            headers: {},
            params: {
              id: even.id,
            },
            method: 'post',
          }).then((data) => {
            const ind = this.revokeList.indexOf(even.id);
            this.revokeList.splice(ind, 1);
            if (data.code.toString() === '0') {
              this.getTableList();
              this.$bus.$emit('tip', { text: data.msg, type: 'success' });
            } else {
              this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            }
          });
        }
      }
      if (type === 'subView') {
        this.subTableDataId = id.id;
        this.subTableData = [];
        this.financeListData.forEach((item) => {
          if (item.id === this.subTableDataId) {
            this.subTableData.push([
              item.updatedAt ? formatTime(item.updatedAt) : '--',
              this.$t('assets.b2c.bankCard'), // '银行卡',
              item.userName,
            ]);
          }
        });
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
        url: '/fiat/deposit/list',
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
            const isOther = item.symbol === 'AIKRW';
            const showPrecision = this.showPrecision(item.symbol);
            list.push({
              id: item.id,
              transferVoucher: item.transferVoucher,
              data: [
                formatTime(item.createdAt), // 时间
                item.symbol,
                fixD(item.amount, showPrecision)
                  + (isOther ? ' KRW' : ` ${item.symbol}`), // 申请数量
                `${fixD(item.settledAmount, showPrecision)} ${item.symbol}`, // 实际到账
                item.statusText, // 状态
                this.handleButton(item),
              ],
            });
          });
          this.tabelList = list;
          // this.paginationObj.total = data.data.count;
          this.paginationObj.total = (this.lately && data.data.count > 30)
            ? 30 : data.data.count;
        }
      });
    },
  },
};
