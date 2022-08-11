import {
  fixD, timeFn, fixInput, colorMap, imgMap,
} from '@/utils';


export default {
  name: 'page-recharge',
  data() {
    return {
      imgMap,
      colorMap,
      tabelLoading: true,
      detailsList: [
        { key: 'normal', value: '--' },
        { key: 'lock', value: '--' },
      ],
      tabelList: [], // 充值记录
      symbol: '',
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      bankUser: '', // 银行账户名
      bankName: '', // 银行名称
      bankAccount: '', // 银行账号
      rechargeNum: '', // 充值金额
      showFlag: false, // 确认充值 是否展示
      serverBankObj: {}, // 运营商 银行信息
      minRecharge: 0, // 最小提币额
      confirmLoading: false, // 确认弹窗的loading
    };
  },
  watch: {
    krwData(v) { if (v) { this.initDetails(); } },
    paginationObjCurrentPage() { this.getTableList(); },
    rechargeNum(v) {
      this.rechargeNum = fixInput(v, this.showPrecision);
    },
  },
  filters: {
    fixDFn(v, that) {
      return fixD(v, that.showPrecision);
    },
  },
  computed: {
    userInfo() {
      let obj = {};
      if (this.$store.state.baseData.userInfo) {
        obj = this.$store.state.baseData.userInfo;
      }
      return obj;
    },
    krwData() { return this.$store.state.assets.krwData; },
    buttonDisabled() {
      let flag = true;
      if (Number(this.rechargeNum) >= Number(this.minRecharge)) {
        flag = false;
      }
      return flag;
    },
    paginationObjCurrentPage() { return this.paginationObj.currentPage; },
    that() { return this; },
    // 当前币种精度
    showPrecision() {
      let v = 0;
      const { market } = this.$store.state.baseData;
      if (market && market.coinList && market.coinList[this.symbol]) {
        v = market.coinList[this.symbol].showPrecision;
      }
      return v;
    },
    // finance/account_balance 接口返回成功的数据
    exchangeData() { return this.$store.state.assets.exchangeData; },
    // market 接口
    market() { return this.$store.state.baseData.market; },
    // 表格title
    columns() {
      return [
        { title: this.$t('assets.krw.rechargeList1'), width: '10%' }, // 申请时间
        { title: this.$t('assets.krw.rechargeList2'), width: '10%' }, // 到账时间
        { title: this.$t('assets.krw.rechargeList3'), width: '10%' }, // 币种
        { title: this.$t('assets.krw.rechargeList4'), width: '15%' }, // 充值金额
        { title: this.$t('assets.krw.rechargeList5'), width: '15%' }, // 到账金额
        { title: this.$t('assets.krw.rechargeList6') }, // 平台账户
        { title: this.$t('assets.krw.rechargeList7') }, // 状态
      ];
    },
  },
  methods: {
    init() {
      // 如果不存在币种跳走
      if (this.$route.query.symbol) {
        this.symbol = this.$route.query.symbol.toUpperCase();
      } else {
        this.$router.push('/assets/krwAccount');
      }
      if (!this.krwData) {
        this.$store.dispatch('krwData');
      } else {
        this.initDetails();
      }
      // 获取table表数据
      this.getTableList();
      // 获取服务商的银行信息
      this.getServerBank();
    },
    DialogConfrim() {
      this.confirmLoading = true;
      this.axios({
        url: 'fiat/deposit',
        params: {
          symbol: this.symbol,
          amount: this.rechargeNum,
        },
      }).then((data) => {
        this.confirmLoading = false;
        if (data.code.toString() === '0') {
          this.rechargeNum = '';
          this.$store.dispatch('krwData');
          this.getTableList();
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.showFlag = false;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    buttonClick() {
      this.showFlag = true;
    },
    DialogClose() {
      this.showFlag = false;
    },
    initDetails() {
      let obj = {};
      this.krwData.allCoinMap.forEach((item) => {
        if (item.symbol === this.symbol) {
          obj = item;
        }
      });
      this.detailsList = [
        { key: 'normal', value: obj.normalBalance },
        { key: 'lock', value: obj.lockBalance },
      ];
      this.minRecharge = obj.depositMin;
    },
    getServerBank() {
      // // 请求该数据详情
      this.axios({
        url: 'company/bank/info',
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.bankUser = data.data.name;
          this.bankName = data.data.bankName;
          this.bankAccount = data.data.cardNo;
        }
      });
    },
    copy(v) {
      const input = this.$refs[v];
      input.select();
      document.execCommand('copy');
      // 复制成功
      this.$bus.$emit('tip', { text: this.$t('assets.krw.copySuccess'), type: 'success' });
    },
    pagechange(v) {
      this.paginationObj.currentPage = v;
    },
    inputChanges(value, name) {
      this[name] = value;
    },
    getTableList() {
      this.axios({
        url: 'fiat/deposit/list',
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          symbol: this.symbol,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          const list = [];
          data.data.financeList.forEach((item, index) => {
            // rechargeListError
            let time = item.updatedAt ? timeFn(new Date(item.updatedAt), 'yyyy-MM-dd hh:mm:ss')
              : '--';
            if (Number(item.status) === 2) {
              time = '--';
            }
            list.push({
              id: index,
              data: [
                timeFn(new Date(item.createdAt), 'yyyy-MM-dd hh:mm:ss'), // 申请时间
                time, // 到账时间
                item.symbol, // 币种
                fixD(item.amount, this.showPrecision), // 充值金额
                fixD(item.settledAmount, this.showPrecision), // 到账金额
                item.companyCard, // 平台账户
                item.statusText, // 状态
              ],
            });
          });
          this.tabelLoading = false;
          this.tabelList = list;
          this.paginationObj.total = data.data.count > 30 ? 30 : data.data.count;
        }
      });
    },
  },
};
