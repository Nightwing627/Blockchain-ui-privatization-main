import {
  fixD, getCoinShowName, colorMap, imgMap,
} from '@/utils';


export default {
  name: 'page-recharge',
  data() {
    return {
      addressShow: true,
      addressPageShow: true,
      tabelLoading: true,
      alertFlag: false,
      imgMap,
      colorMap,
      detailsList: [
        { key: 'sum', value: '--' },
        { key: 'normal', value: '--' },
        { key: 'lock', value: '--' },
      ],
      address: '', // 地址
      addressPage: '', // 标签（xrp/eos）时
      addressQRCode: '', // 二维码地址
      tabelList: [], // 充值记录
      symbol: '',
      havePageArr: ['XRP', 'EOS'], // 含有标签的币种
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      addressTime: null,
      branchTip: '',
    };
  },
  watch: {
    exchangeData(v) {
      if (v) {
        this.initDetails();
      }
    },
    symbol(v) {
      if (v && this.market) {
        this.branchInit(this.market);
        this.initAddress();
      }
    },
    market: {
      immediate: true,
      handler(v) {
        if (v && this.symbol) {
          this.branchInit(v);
          this.initAddress();
        }
      },
    },
    paginationObjCurrentPage() {
      this.getTableList();
    },
  },
  filters: {
    fixDFn(v, that) {
      return fixD(v, that.showPrecision);
    },
  },
  computed: {
    isHavePage() {
      let flag = false;
      // 判断market是否请求下来
      if (this.market && this.market.coinList) {
        if (!this.haveBranch) {
          // 判断market.coinList是否有当前币种
          if (this.market.coinList[this.symbol]) {
            const { tagType } = this.market.coinList[this.symbol];
            flag = tagType;
          }
        } else if (this.market.followCoinList[this.symbol][this.activeBranch]) {
          const { tagType } = this.market.followCoinList[this.symbol][this.activeBranch];
          flag = tagType;
        }
      }
      return flag;
    },
    showSymbol() {
      let str = this.symbol;
      if (this.market && this.market.coinList
        && this.market.coinList[this.symbol]) {
        str = getCoinShowName(this.symbol, this.market.coinList);
      }
      return str;
    },
    serverName() {
      const { publicInfo } = this.$store.state.baseData;
      let code = '';
      if (publicInfo && publicInfo.msg && publicInfo.msg.company_name) {
        code = publicInfo.msg.company_name;
      }
      return code;
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
        { title: this.$t('assets.recharge.RechargeTime'), width: '20%' }, // 充值时间
        { title: this.$t('assets.recharge.RechargeCoin'), width: '10%' }, // 币种
        { title: this.$t('assets.recharge.RechargeVolume'), width: '30%' }, // 充值数量
        { title: this.$t('assets.recharge.RechargeNumber'), width: '20%' }, // 确认次数
        { title: this.$t('assets.recharge.RechargeStatus'), width: '20%' }, // 状态
      ];
    },
  },
  methods: {
    setActiveBranch(v) {
      this.activeBranch = v;
      this.initAddress();
    },
    init() {
      // 如果不存在币种跳走
      if (this.$route.query.symbol) {
        this.symbol = this.$route.query.symbol.toUpperCase();
      } else {
        this.$router.push('/assets/exchangeAccount');
      }
      // 如果没有 finance/account_balance 接口返回成功的数据
      if (!this.exchangeData) {
        this.$store.dispatch('assetsExchangeData');
      } else {
        this.initDetails();
      }
      // 获取table表数据
      this.getTableList();
    },
    handMouseenter(name) {
      if (name === 'address') {
        this.addressShow = false;
      } else {
        this.addressPageShow = false;
      }
    },
    handMouseleave(name) {
      if (name === 'address') {
        this.addressShow = true;
      } else {
        this.addressPageShow = true;
      }
    },
    alertClone() { this.alertFlag = false; },
    initDetails() {
      const obj = this.exchangeData.allCoinMap[this.symbol];
      const normalBalance = Number(obj.normal_balance) || Number(obj.overcharge_balance);
      this.detailsList = [
        { key: 'sum', value: obj.total_balance },
        { key: 'normal', value: normalBalance },
        { key: 'lock', value: obj.lock_balance },
      ];
    },
    getBranchAddress() {
      this.axios({
        url: 'cost/Getcost',
        params: {
          symbol: this.activeBranch,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.branchTip = data.data.mainChainNameTip;
        }
      });
    },
    initAddress() {
      // const { tokenBase } = this.market.coinList[this.symbol];
      const { tagType } = this.market.coinList[this.symbol];
      if (tagType === 1 || tagType === 2) {
        // this.isHavePage = tagType;
        setTimeout(() => {
          this.alertFlag = Boolean(tagType);
        }, 100);
      }
      if (this.haveBranch) {
        this.getBranchAddress();
      }
      // 请求该数据详情
      this.axios({
        url: 'finance/get_charge_address',
        params: {
          symbol: !this.haveBranch ? this.symbol : this.activeBranch,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          // let { allCoinMap } = this.exchangeData
          this.addressQRCode = data.data.addressQRCode;
          if (this.isHavePage) {
            const arr = data.data.addressStr.split('_');
            const [address, addressPage] = arr;
            this.address = address;
            this.addressPage = addressPage;
          } else {
            this.address = data.data.addressStr;
          }
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    copy(item) {
      if (item === 'address') {
        this.copyAddress();
      } else if (item === 'addressPage') {
        this.copyAddressPage();
      }
    },
    copyAddress() {
      const input = this.$refs.address;
      input.select();
      document.execCommand('copy');
      // 地址复制成功
      this.$bus.$emit('tip', { text: this.$t('assets.recharge.copyAddress'), type: 'success' });
    },
    copyAddressPage() {
      const input = this.$refs.addressPage;
      input.select();
      input.setSelectionRange(0, input.value.length);
      document.execCommand('copy');
      // 地址标签成功
      this.$bus.$emit('tip', { text: this.$t('assets.recharge.copyLabel'), type: 'success' });
    },
    pagechange(v) {
      this.paginationObj.currentPage = v;
    },
    getTableList() {
      this.axios({
        url: 'record/deposit_list',
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          coinSymbol: this.symbol,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          const list = [];
          data.data.financeList.forEach((item, index) => {
            const { coinList } = this.market;
            const coinName = getCoinShowName(item.symbol, coinList);
            list.push({
              id: index,
              data: [
                item.createdAt, // 时间
                coinName, // 币种
                fixD(item.amount, this.showPrecision), // 充值数量
                item.confirmDesc, // 确认次数
                item.status_text, // 状态
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
