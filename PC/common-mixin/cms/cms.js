import { formatTime } from '@/utils';

export default {
  name: 'noticeInfo',
  components: {
  },
  data() {
    return {
      contentId: this.$route.params.id,
      sideList: [],
      notieContent: {},
      sidetion: {
        count: '',
        page: 1,
        pageSize: 10,
      },
    };
  },
  watch: {
    $route(val) {
      this.contentId = val.params.id;
      this.getfile();
    },
  },
  methods: {
    init() {
      this.getData();
      this.contentId = this.$route.params.id;
    },
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
          if (this.$route.params.id) {
            this.contentId = this.$route.params.id;
          } else {
            this.contentId = data.data[0].fileName;
            this.$router.push(`/cms/${data.data[0].fileName}`);
          }
          this.getfile();
        }
      });
    },
    getfile() {
      this.axios({
        url: this.$store.state.url.common.cmsInfo,
        headers: {},
        params: {
          fileName: this.contentId,
        },
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          this.notieContent = data.data;
          this.notieContent.ctime = formatTime(data.data.ctimeLong);
        }
      });
    },
  },
};
