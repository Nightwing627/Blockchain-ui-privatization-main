import { formatTime, imgMap } from '@/utils';


const bannerImgUrl = imgMap.jjrNeaderBg;

export default {
  name: 'manageFinancesList',
  data() {
    return {
      imgMap,
      bannerImg: bannerImgUrl,
      bannerTitle: this.$t('manageFinances.manage_finances'), // '理财宝',
      dataList: [],
    };
  },
  computed: {
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
    // 路由跳转
    btnLink(link) {
      this.$router.push(link);
    },
    submit(data) {
      if (!this.isLogin) {
        this.$router.push('/login');
      } else {
        this.$router.push(`/manageFinances/${data.toString()}`);
      }
    },
    getList() {
      if (!this.isLogin) {
        this.$router.push('/login');
      } else {
        this.$router.push('/manageFinancesOrder');
      }
    },
    // 请求数据
    getData() {
      this.axios({
        url: this.$store.state.url.common.financing,
        params: {},
        method: 'post',
        hostType: 'financing',
      }).then((data) => {
        if (data.code === '0') {
          this.dataList = data.data.projectList;
          data.data.projectList.forEach((item) => {
            if (item.rate_type === 0) {
              this.$set(item, 'rate_type_text', this.$t('manageFinances.yearRate'));
            } else {
              this.$set(item, 'rate_type_text', this.$t('manageFinances.dayRate'));
            }
          });
        }
      });
    },
    formatTimeFn(date) {
      return formatTime(date);
    },
  },
};
