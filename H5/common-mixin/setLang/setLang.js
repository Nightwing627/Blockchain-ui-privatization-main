export default {
  name: 'common-setLang',
  computed: {
    publicInfo() { return this.$store.state.baseData.publicInfo; },
    langList() {
      if (this.publicInfo && this.publicInfo.lan) {
        const arr = [];
        this.publicInfo.lan.lanList.forEach((item) => {
          arr.push({ name: item.name, index: item.id });
        });
        return arr;
      }
      return [];
    },
    activeLang() {
      return this.$store.state.baseData.lan;
    },
  },
  methods: {
    headleChange(v) {
      this.lanClick(v.index);
    },
    lanClick(id) {
      // this.
      const pageNname = localStorage.getItem('pageName');
      if (id === this.activeLang) {
        this.$router.push(pageNname);
        return;
      }
      if (this.isLogin) {
        this.axios({
          url: this.$store.state.url.common.change_language,
          params: { language: id },
          method: 'post',
        }).then((res) => {
          if (Number(res.code) === 0) {
            const { fullPath } = this.$route;
            const str = fullPath.replace(this.activeLang, id);
            const hrefs = str.slice(0, str.lastIndexOf('/'));
            window.location.href = hrefs + pageNname;
          }
        });
      } else {
        const { fullPath } = this.$route;
        const str = fullPath.replace(this.activeLang, id);
        const hrefs = str.slice(0, str.lastIndexOf('/') + 1);
        window.location.href = hrefs + pageNname;
      }
    },
  },
};
