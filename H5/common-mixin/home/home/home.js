export default {
  data() {
    return {
      flag: false,
    };
  },
  computed: {
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    templateLayoutType() {
      return this.$store.state.baseData.templateLayoutType;
    },
    internationalOpen() {
      let flag = false;
      const { publicInfo } = this.$store.state.baseData;
      if (publicInfo && publicInfo.switch
        && publicInfo.switch.index_international_open
        && publicInfo.switch.index_international_open.toString() === '2') {
        flag = true;
      }
      return flag;
    },
  },
  methods: {
    // 路由跳转
    btnLink(link) {
      this.$router.push(link);
    },
  },
};
