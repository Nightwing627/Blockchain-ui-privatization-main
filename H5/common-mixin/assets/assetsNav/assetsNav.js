export default {
  props: {
    navList: {
      default: [],
    },
  },
  methods: {
    handClick(v) {
      let str = v;
      if (v[0] !== '/') {
        str = `/${v}`;
      }
      this.$router.push(str);
    },
  },
};
