export default {
  methods: {
    goTrade() {
      this.$router.push('/trade');
    },
    lineClassesH(index) {
      if (index === this.hoverIndex) {
        return 'hoverClass';
      }
      return '';
    },
  },
};
