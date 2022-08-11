import { fixD, imgMap, getCoinShowName } from '@/utils';

export default {
  name: 'broker',
  data() {
    return {
      pullUpState: 0,
      headClasses: '',
      bodyClasses: '',
      tableLoading: true,
      backgroundImg: `background: url(${imgMap.jjrNeaderBg})  center bottom no-repeat #0E1A2E`,
      backgroundImg2: `background: url(${imgMap.broker_header_2})  center bottom no-repeat #0E1A2E;background-size: 100% 100%;`,
      tableData: [],
      tableType: 'agent_data',
      searchValue: '',
      calendarData: null,
      // 筛选币种
      coinValue: '',
      typeValue: null,
      // 直接邀请人数
      userCount: 0,
      // 间接邀请人数
      indiract: 0,
      // 判断商户是否显示间接人数
      isDiractShow: false,
      // 本月总收入
      allBonusAmount: null,
      allBonusCoin: 'BTC',
      errorHave: false,
      pagination: { // 翻页数据
        count: 0, // 总数量
        pageSize: 10, // 每页显示条数
        page: 1, // 当前页数
      },
      symbolType: this.$t('broker.symbolType'),
      type: this.$t('broker.type'),
    };
  },
  watch: {
    coinOPtion(value) {
      if (value.length) {
        this.coinValue = 'USDT';
      }
    },
    coinValue(value) {
      if (value) {
        this.pullUpState = 0;
        this.tableData = [];
        this.tableLoading = true;
        this.pagination.page = 1;
        this.getData();
      }
    },
    typeValue(value) {
      if (value && this.searchValue) {
        this.pullUpState = 0;
        this.tableData = [];
        this.tableLoading = true;
        this.pagination.page = 1;
        this.getData();
      }
    },
  },
  computed: {
    userType() {
      if (this.$store.state.baseData.userInfo) {
        return this.$store.state.baseData.userInfo.agentRoleName;
      }
      return false;
    },
    promptText() {
      switch (this.typeValue) {
        case 1:
          return this.$t('broker.promptText1'); // '请输入UID';
        case 2:
          return this.$t('broker.promptText2'); // '请输入手机号';
        default:
          return this.$t('broker.promptText3'); // '请输入邮箱';
      }
    },
    timeText() {
      return this.$t('broker.time');
    },
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    coinList() {
      if (this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return null;
    },
    coinOPtion() {
      const arr = [];
      if (this.coinList) {
        const coinList = Object.keys(this.coinList);
        coinList.forEach((item) => {
          arr.push({
            value: getCoinShowName(this.coinList[item].name, this.coinList),
            code: this.coinList[item].name,
          });
        });
        return arr;
      }
      return [];
    },
    typeOption() {
      return [
        {
          value: 'UID',
          code: 1,
        },
        {
          value: this.$t('broker.phoneeNumber'),
          code: 2,
        },
        {
          value: this.$t('broker.email'),
          code: 3,
        },
      ];
    },
    tabList() {
      return [
        {
          key: 'agent_data',
          text: this.$t('broker.remaid'),
        },
        {
          key: 'agent_account',
          text: this.$t('broker.agentAccount'),
        },
      ];
    },
    columns() {
      if (this.tableType === 'agent_data') {
        return [
          {
            title: 'UID',
            width: '100px',
          },
          {
            title: this.$t('broker.phoneeNumber'),
            width: '260px',
          },
          {
            title: this.$t('broker.email'),
            width: '260px',
          },
          {
            title: this.$t('broker.tier'),
            width: '100px',
          },
          {
            title: `${this.$t('broker.fee')}(${getCoinShowName(this.coinValue, this.coinList)})`,
            width: '150px',
          },
          {
            title: `${this.$t('broker.amount')}(${getCoinShowName(this.allBonusCoin, this.coinList)})`,
            width: '150px',
          },
          {
            title: this.$t('broker.opera'),
            width: '160px',
            classes: 'lastTh',
          },
        ];
      }
      return [
        {
          title: 'UID',
          width: '8%',
        },
        {
          title: this.$t('broker.phoneeNumber'),
          width: '22%',
        },
        {
          title: this.$t('broker.email'),
          width: '26%',
        },
        {
          title: this.$t('broker.tier'),
          width: '22%',
        },
        {
          title: `${this.$t('broker.ccNumber')}(${getCoinShowName(this.coinValue, this.coinList)})`,
          width: '22%',
        },
      ];
    },
    dataList() {
      if (this.tableData && this.tableData.length) {
        const dataArr = [];
        this.tableData.forEach((item) => {
          if (this.tableType === 'agent_data') {
            dataArr.push({
              id: item.uid,
              data: [
                item.uid,
                !item.mobileNumber ? '/' : item.mobileNumber,
                !item.email ? '/' : item.email,
                item.level,
                this.fixDFun(item.feeAmount, this.coinValue),
                this.fixDFun(item.bonusAmount, this.coinValue),
                // 交易对方
                {
                  text: this.$t('broker.view'),
                  eventType: 'view',
                  classes: 'u-8-cl',
                },
                // [
                //   {
                //     type: 'button',
                //     text: this.$t('broker.view'),
                //     iconClass: [''],
                //     eventType: 'view',
                //     classes: [],
                //   },
                // ],
              ],
            });
          } else {
            dataArr.push({
              id: item.uid,
              data: [
                item.uid, // UID
                !item.mobileNumber ? '/' : item.mobileNumber, // 手机号
                !item.email ? '/' : item.email, // 邮箱
                item.level, // 层级
                this.fixDFun(item.amount, this.coinValue), // 持仓量
              ],
            });
          }
        });
        return dataArr;
      }
      return [];
    },
  },
  methods: {
    init() {
      if (this.coinOPtion) {
        this.coinValue = 'USDT';
      }
    },
    // 下拉刷新
    onRefresh(done) {
      this.tableData = [];
      this.tableLoading = true;
      this.pagination.page = 1;
      this.getData();
      done();
    },
    onInfiniteLoads(done) {
      if (this.pullUpState === 0) {
        this.pullUpState = 2;
        this.pagination.page += 1;
        this.getData();
      }
      done();
    },
    fixDFun(val, symbol) {
      if (this.showPrecision(symbol)) {
        return fixD(val, this.showPrecision(symbol));
      }
      return val;
    },
    showPrecision(symbol) {
      if (this.$store.state.baseData && this.$store.state.baseData.market) {
        const { coinList } = this.$store.state.baseData.market;
        if (coinList[symbol]) {
          const precision = coinList[symbol].showPrecision;
          if (precision) {
            return precision;
          }
        }
      }
      return 4;
    },
    // 请求数据
    getData(search) {
      if (search) {
        this.pagination.page = 1;
        this.tableData = [];
        // this.pullUpState = 0
      }
      this.tableLoading = true;
      let url = this.$store.state.url.common.agent_data_query;
      const params = {
        pageNum: this.pagination.page,
        pageSize: this.pagination.pageSize,
        coinName: this.coinValue || 'USDT',
        keyword_type: this.typeValue || 1,
        keyword: this.searchValue,
      };
      if (this.tableType === 'agent_account') {
        url = this.$store.state.url.common.agent_account_query;
        params.dayTime = this.calendarData.replace(/\//g, '-');
      }
      this.axios({
        url,
        params,
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          this.tableData = [...[], ...this.tableData, ...data.data.mapList];
          if (search) {
            this.tableData = data.data.mapList;
          }
          this.pagination.count = data.data.count;
          if (Math.ceil(parseFloat(data.data.count) / parseFloat(this.pagination.pageSize))
            > this.pagination.page) {
            this.pullUpState = 0;
          } else {
            this.pullUpState = 3;
          }
          if (this.tableType === 'agent_data') {
            this.userCount = data.data.userCount;
            if (data.data.inviteNum || data.data.inviteNum === 0) {
              if (data.data.inviteNum !== -1) {
                this.indirect = data.data.inviteNum;
                this.isDiractShow = true;
              }
            }
            this.allBonusAmount = data.data.allBonusAmount;
            this.allBonusCoin = data.data.allBonusCoin;
          }
        }
        this.tableLoading = false;
      });
    },
    // 切换类型
    switcherType(type) {
      this.tableType = type;
      this.typeValue = '';
      this.searchValue = '';
      this.coinValue = 'USDT';
      this.calendarData = '';
      this.pagination.page = 1;
      this.tableData = [];
      this.pullUpState = 0;
      this.getData();
    },
    // 搜索输入事件
    inputLineChange(value, name) {
      this[name] = value;
      if (this.typeValue) {
        this.getData(true);
      }
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map((v) => filterVal.map((j) => v[j]));
    },
    // 搜索输入框回车事件
    /*      inputKeyup() {
        if (this.typeValue) {
          this.getData(true);
        }
      }, */
    // 选择时间
    onChangeCalendar(data) {
      this.calendarData = data;
    },
    // select 选择事件
    selectOnChange(data, name) {
      this[name] = data.code;
    },
    goViewPage(type, { id }) {
      this.$router.push(`/broker/${id}`);
    },
  },
};
