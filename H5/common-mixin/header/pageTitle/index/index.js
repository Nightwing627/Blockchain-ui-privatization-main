export default {
  name: 'header-pageTitle',
  data() {
    return {

    };
  },
  computed: {
    homeFlag() {
      let flag = false;
      if (this.routerPageTitle === 'home') {
        flag = true;
      }
      return flag;
    },
    selectFlag() {
      let flag = false;
      if (this.routerPageTitle === 'select') {
        flag = true;
      }
      return flag;
    },
    routerPageTitle() {
      return this.$route.meta.pageTitle;
    },
    defineTitle() {
      return this.$t('pageTitle')[this.routerPageTitle] || '';
    },
  },
};
