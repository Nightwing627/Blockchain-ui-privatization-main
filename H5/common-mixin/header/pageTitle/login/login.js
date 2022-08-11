export default {
  computed: {
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
  },
  methods: {
    link(v) {
      this.$router.push(v);
    },
  },
};
