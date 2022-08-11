export default {
  data() {
    return {
      timeras: null,
    };
  },
  computed: {
    // 底部 上边距
    footerClass() {
      const arr = [];
      if (this.routeTheme && this.routeTheme === 'homeOther') {
        arr.push('h-3-bg h-4-bd');
      } else {
        arr.push('h-1-bg h-2-bd');
        arr.push('h-2-bd');
      }
      if (this.$route.meta.footNotMrgin) {
        arr.push('no-margin');
      }
      return arr;
    },
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    // 数量单位类型Number(1标的货币 2张)
    coUnitType() {
      return this.$store.state.future.coUnitType;
    },
    zhang() {
      return this.$t('futures.setFutures.text11'); // '张',
    },
  },
  watch: {
    coUnitType(val) {
      if (val && val === 2) {
        this.$store.commit('SET_COUNIT_TEXT', this.zhang);
      }
    },
    zhang(val) {
      if (val && this.coUnitType === 2) {
        this.$store.commit('SET_COUNIT_TEXT', val);
      }
    },
    userInfo(val) {
      if (val && this.isLogin) {
        // 获取用户配置信息
        this.$store.dispatch('getUserConfig');
        // 获取仓位和资产
        this.$store.dispatch('getPositionList');
        this.getMessageCCount();
      }
    },
  },
  methods: {
    init() {
      if (this.coUnitType && this.coUnitType === 2) {
        this.$store.commit('SET_COUNIT_TEXT', this.zhang);
      }
      this.$bus.$on('outUserIsLogin', () => {
        // 清除登录状态
        this.$store.dispatch('deleteIsLogin');
        // 如果当前页面需要登录 则跳转到登录
        if (this.$route.meta.mustLogin) {
          this.$router.push('/login');
        }
      });
      this.setStyle();
      this.timing();
      document.addEventListener(
        'mousewheel',
        () => {
          this.setTiming();
          this.reload();
        },
        false,
      );
      document.addEventListener(
        'click',
        () => {
          this.setTiming();
          this.reload();
        },
        false,
      );
      document.addEventListener(
        'mousemove',
        () => {
          this.setTiming();
          this.reload();
        },
        false,
      );
      document.addEventListener(
        'keydown',
        () => {
          this.setTiming();
          this.reload();
        },
        false,
      );

      // 获取获取合约列表
      this.$store.dispatch('getUserInfo');
      // 获取 userinfo
      this.$store.dispatch('getFutorePublicInfo');
      // 获取 public-info-v4 数据
      this.$store.dispatch('getPublicInfo');
      // 获取下载数据
      this.$store.dispatch('getAppDownload');
      // 获取自定义footer 和 自定义header
      this.$store.dispatch('getFooterHeander_info');
    },
    getMessageCCount() {
      // 获取用户持仓和资产列表
      this.timeras = setInterval(() => {
        this.$store.dispatch('getMessage_count');
        if (!this.isLogin) {
          clearInterval(this.timeras);
          this.timeras = null;
        }
      }, 5000);
    },
  },
};
