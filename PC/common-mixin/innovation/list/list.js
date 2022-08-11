import {
  fixD, formatTime, nul, imgMap,
} from '@/utils';


const bannerImgUrl = imgMap.jjrNeaderBg;

export default {
  name: 'InnovationList',
  data() {
    return {
      imgMap,
      bannerImg: bannerImgUrl,
      bannerTitle: this.$t('innov.innov_tit'), // '创新试验区',
      nowType: 0,
      dataList: [],
      pagination: { // 翻页数据
        count: 0, // 总数量
        pageSize: 10, // 每页显示条数
        page: 1, // 当前页数
      },
    };
  },
  computed: {
    // 全部币种列表
    coinList() {
      if (this.$store.state.baseData && this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return null;
    },
    navTab() {
      return [
        { name: this.$t('innov.whole'), index: 0 }, // 全部
        { name: this.$t('innov.have'), index: 1 }, // 进行中
        { name: this.$t('innov.dh_end'), index: 2 }, // 兑换结束
        { name: this.$t('innov.dh_financing'), index: 3 }, // 兑换成功
      ];
    },
    buttonText() {
      if (this.nowType === 4) {
        return this.$t('innov.dh_end');
      }
      if (this.nowType === 3) {
        return this.$t('innov.dh_financing');
      }
      return this.$t('innov.immediate');
    },
    isLogin() {
      if (this.$store.state.baseData.isLogin) {
        return this.$store.state.baseData.isLogin;
      }
      return false;
    },
  },
  methods: {
    init() {
      this.getData();
    },
    countScale(a, b) {
      return !a || !b ? 0 : nul(a, b);
    },
    submitDisabled(item) {
      if (item.status === 2 || item.status === 3) {
        return false;
      }
      return true;
    },
    fixDFun(val, symbol) {
      if (this.showPrecision(symbol)) {
        return fixD(val, this.showPrecision(symbol));
      }
      return val;
    },
    showPrecision(symbol) {
      if (this.$store.state.baseData
        && this.$store.state.baseData.market
        && this.$store.state.baseData.market.coinList) {
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
    // tab切换
    currentType(item) {
      if (this.nowType !== item.index) {
        this.pagination.page = 1;
        this.nowType = item.index;
        this.getData();
      }
    },
    submit(data) {
      if (!this.isLogin) {
        this.$router.push('/login');
      } else {
        this.$router.push(`/innovation/${data}`);
      }
    },
    speed(item) {
      if (item.investAmount) {
        const speed = (item.investAmount / item.money) * 100;
        return fixD(speed, 2);
      }
      return 0;
    },
    // 翻页事件
    pagechange(num) {
      this.pagination.page = num;
      this.getData();
    },
    // 请求数据
    getData() {
      this.axios({
        url: this.$store.state.url.common.newcoin_project_list,
        params: {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          status: this.nowType,
        },
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          this.pagination.count = data.data.count;
          this.dataList = data.data.projectInfoList;
        }
      });
    },
    formatTimeFn(date) {
      return formatTime(date);
    },
    setStatusText(data) {
      let text = '';
      switch (data.status) {
        case 2:
          text = this.$t('innov.status1'); // '预热中';
          break;
        case 3:
          text = this.$t('innov.status2'); // '进行中';
          break;
        case 4:
          text = this.$t('innov.status3'); // '募集完成';
          break;
        case 5:
          text = this.$t('innov.status4'); // '发放TOKEN';
          break;
        default:
          text = this.$t('innov.status5'); // '退还申购基金';
      }
      return text;
    },
    statusClass(data) {
      if (data.status === 2 || data.status === 3) {
        return 'f-7-cl f-7-bd';
      }
      return 'f-4-cl f-4-bd';
    },
  },
};
