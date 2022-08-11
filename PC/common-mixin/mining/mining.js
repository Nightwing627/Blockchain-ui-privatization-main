import {
  fixD,
  formatTime,
  getComplexType,
  imgMap,
  colorMap,
  getCoinShowName,
} from '@/utils';

export default {
  name: 'noticeInfo',
  data() {
    return {
      currentTab: 1,
      navTab: [
        {
          name: this.$t('mining.my_earnings'),
          index: 1,
        },
        {
          name: this.$t('mining.invite_bonus'),
          index: 2,
        },
      ],
      marginRight: 50,
      lineHeight: '48',
      headClasses: '',
      bodyClasses: '',
      tableLoading: false,
      backgroundImg: `background: url(${imgMap.jjrNeaderBg}) center bottom no-repeat`,
      myData: {},
      tableType: 'return_list',
      pagination: { // 翻页数据
        count: 0, // 总数量
        pageSize: 10, // 每页显示条数
        page: 1, // 当前页数
      },
      // 邀请分红相关数据
      inviteNumber: '',
      inviteReturnNumber: '',
      inviteCode: '',
      inviteCodeShow: true,
      inviteUrlShow: true,
      inviteUrl: '',
      inviteQECode: '',
      inviteQECodeShow: false,
      page: 1,
      pageSize: 10,
      count: 0,
      loading: true,
      classes: '',
      lineClass: '',
      // table 参数
      columnsBonus: [
        {
          title: this.$t('personal.inviteCodeManagement.columns')[0],
          align: 'left',
          width: '200px',
          classes: '',
        },
        {
          title: this.$t('personal.inviteCodeManagement.columns')[1],
          align: 'center',
          width: '',
        },
        /*
                {
                  title: this.$t('personal.inviteCodeManagement.columns')[2],
                  align: 'center',
                  width: '',
                },
                {
                  title: this.$t('personal.inviteCodeManagement.columns')[3],
                  align: 'center',
                  width: '',
                },
                */
      ],
      imgMap,
      colorMap,
      dataListBonus: [],
      isInviteOpen: true,
    };
  },
  watch: {
    isLogin(val) {
      if (val) {
        this.getData();
      }
    },
    inviteInfoList(inviteInfoList) {
      if (inviteInfoList !== null) {
        this.loading = false;
        this.inviteNumber = inviteInfoList.invite_number;
        this.count = Number(inviteInfoList.invite_number);
        this.inviteReturnNumber = inviteInfoList.invite_return_number;
        this.inviteCode = inviteInfoList.inviteCode;
        this.inviteQECode = inviteInfoList.inviteQECode;
        this.inviteUrl = inviteInfoList.inviteUrl;
        this.processData(inviteInfoList.invite_list);
      }
    },
    publicInfo(publicInfo) {
      if (publicInfo !== null) {
        if (Number(publicInfo.switch.is_invite_open) === 1) {
          this.isInviteOpen = true;
        } else {
          this.isInviteOpen = false;
        }
      }
    },
  },
  computed: {
    coinList() {
      if (this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return null;
    },
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
    },
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    inviteInfoList() {
      return this.$store.state.personal.inviteInfoList;
    },
    speed() {
      if (this.myData.total_return_number) {
        const speed = (this.myData.total_return_number / this.myData.dividend_total_amount) * 100;
        return fixD(speed, 2);
      }
      return 0;
    },
    tabList() {
      return [
        {
          key: 'return_list',
          text: this.$t('mining.mining_detail'), // '今日挖矿明细',
        },
        {
          key: 'dividend_list',
          text: this.$t('mining.amount_dividends'), // '今日待分红收入',
        },
        {
          key: 'yesterday_dividend_list',
          text: this.$t('mining.bonus'), // '昨日分红',
        },
      ];
    },
    columns() {
      if (this.tableType === 'return_list') {
        return [
          {
            title: this.$t('mining.time'), // '时间',
            width: '100px',
          },
          {
            title: `${this.$t('mining.trader_volume')}(BTC)`, // '交易量折合(BTC)',
            width: '30%',
          },
          {
            title: `${this.$t('mining.Produce')}
            (${getCoinShowName(this.myData.coin, this.coinList)})`, // `产出(${this.myData.coin})`,
            width: '30%',
          },
          {
            title: this.$t('mining.state'), // '状态',
            width: '30%',
          },
        ];
      }
      return [
        {
          title: this.$t('mining.coin'), // '币种 ',
          width: '100px',
        },
        {
          title: this.$t('mining.platform'), // '平台总手续费',
          width: '48%',
        },
        {
          title: this.$t('mining.divided'), // '待分红',
          width: '48%',
        },
      ];
    },
    dataList() {
      const data = [];
      const oData = this.myData[this.tableType];
      if (oData && oData.length) {
        oData.forEach((item, index) => {
          const lineData = {
            id: `${this.tableType}${index}`,
          };
          if (this.tableType === 'return_list') {
            const status = item.status === 0
              ? this.$t('mining.replaced')
              : this.$t('mining.Return'); // '待返还' : '返还';
            lineData.data = [
              formatTime(item.dtime),
              this.fixDFun(item.return_number_btc, 'BTC'),
              this.fixDFun(item.return_number, this.myData.coin),
              status,
            ];
          } else {
            lineData.data = [
              getCoinShowName(item.coin, this.coinList),
              this.fixDFun(item.fee, this.myData.coin),
              this.fixDFun(item.dividend_number, this.myData.coin),
            ];
          }
          data.push(lineData);
        });
      }
      return data;
    },
  },
  methods: {
    // 切换
    currentType(data) {
      if (data.index !== this.currentTab) {
        this.currentTab = data.index;
      }
    },
    fixDFun(val, symbol) {
      if (this.showPrecision(symbol)) {
        return fixD(val, this.showPrecision(symbol));
      }
      return val;
    },
    showPrecision(symbol) {
      if (this.coinList) {
        // const { coinList } = this.$store.state.baseData.market;
        if (this.coinList[symbol]) {
          const precision = this.coinList[symbol].showPrecision;
          if (precision) {
            return precision;
          }
        }
      }
      return 4;
    },
    // 翻页事件
    pagechange(num) {
      this.pagination.page = num;
      this.getData();
    },
    // 请求数据
    getData() {
      this.axios({
        url: this.$store.state.url.common.return_info_list,
        params: {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
        },
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          this.myData = data.data;
          if (this.tableType === 'return_list') {
            this.pagination.count = data.data.return_count;
          }
          if (this.tableType === 'dividend_list') {
            this.pagination.count = data.data.dividend_count;
          }
          if (this.tableType === 'yesterday_dividend_list') {
            this.pagination.count = data.data.yesterday_dividend_count;
          }
        }
      });
    },
    // 切换类型
    switcherType(type) {
      this.tableType = type;
      this.pagination.page = 1;
      this.getData();
    },
    copyClick(name) {
      if (name === 'inviteCode') {
        this.copy(this.inviteCode);
      } else {
        this.copy(this.inviteUrl);
      }
    },
    copy(str) {
      this.$bus.$emit('tip', { text: this.$t('personal.prompt.copySucces'), type: 'success' });
      function save(e) {
        e.clipboardData.setData('text/plain', str); // 下面会说到clipboardData对象
        e.preventDefault(); // 阻止默认行为
      }
      document.addEventListener('copy', save);
      document.execCommand('copy'); // 使文档处于可编辑状态，否则无效
      document.removeEventListener('copy', save);
    },
    handMouseenter(name) {
      if (name === 'inviteCode') {
        this.inviteCodeShow = false;
      } else {
        this.inviteUrlShow = false;
      }
    },
    handMouseleave(name) {
      if (name === 'inviteCode') {
        this.inviteCodeShow = true;
      } else {
        this.inviteUrlShow = true;
      }
    },
    processData(list) { // 处理数据
      if (getComplexType(list) === 'Array') {
        this.dataListBonus = list.map((obj) => ({
          data: [formatTime(obj.register_time), obj.invitee],
        }));
      }
    },
    pagechangeBonus(page) {
      this.page = page;
      const info = { page, pageSize: this.pageSize };
      this.$store.dispatch('inviteInfoList', info);
    },
  },
};
