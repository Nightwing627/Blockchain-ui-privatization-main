export default {
  name: 'foot',
  data() {
    return {
      sideList: [],
    };
  },
  computed: {
    templateLayoutType() {
      return this.$store.state.baseData.templateLayoutType;
    },
    footerTemplateReceived() {
      return this.$store.state.baseData.footerTemplateReceived;
    },
    footerTemplate() {
      return this.$store.state.baseData.footerTemplate;
    },
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
    },
    configFooterOpen() {
      if (this.publicInfo && this.publicInfo.switch) {
        return this.publicInfo.switch.config_footer_open;
      }
      return '0';
    },
    companyName() {
      if (this.publicInfo && this.publicInfo.msg) {
        return this.publicInfo.msg.company_name;
      }
      return '';
    },
    logoUrl() {
      let url = '';
      if (this.publicInfo && this.publicInfo.msg) {
        url = this.publicInfo.msg.footer_logo_path || this.publicInfo.msg.logoUrl;
      }
      return url;
    },
  },
  methods: {
    goPage(fileName) {
      this.$router.push(`${fileName}`);
    },
    getData() {
      this.axios({
        url: this.$store.state.url.common.footer,
        headers: {},
        params: {},
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          this.sideList = data.data;
        }
      });
    },
  },
};
