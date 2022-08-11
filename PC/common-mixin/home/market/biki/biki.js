export default {
  methods: {
    lineClassesH(index) {
      if (index === this.hoverIndex) {
        return 'c-3-bg';
      }
      return 'c-2-bg';
    },
  },
};
