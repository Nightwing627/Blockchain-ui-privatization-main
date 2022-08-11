export default {
  methods: {
    init() {
      this.goM();
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
      // 获取 public-info 数据
      this.$store.dispatch('getPublicInfo');
      this.$store.dispatch('getAppDownload');
      // 获取 userinfo
      this.$store.dispatch('getUserInfo');
      // 获取自定义footer 和 自定义header
      this.$store.dispatch('getFooterHeander_info');

      if (this.loginFlag === '2') {
        clearInterval(this.timer);
        this.$store.dispatch('getMessage_count');
        this.timer = setInterval(() => {
          this.$store.dispatch('getMessage_count');
        }, 15000);
      } else {
        clearInterval(this.timer);
      }
    },
  },
};
