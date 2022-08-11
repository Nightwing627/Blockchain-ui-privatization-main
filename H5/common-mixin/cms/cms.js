import { formatTime } from '@/utils';

export default {
  name: 'noticeInfo',
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
      typeListFlag: false,
    };
  },
  beforeDestroy() {
    this.$bus.$off('HEADER-CLICK-EVENT');
  },
  watch: {
    // $route(val) {
    //   this.contentId = val.params.id;
    //   this.getfile();
    // },
    nTitle(v) {
      this.$bus.$emit('PAGE-TOP-TITLE', v);
    },
  },
  computed: {
    nTitle() {
      return this.notieContent.title;
    },
    sideListFit() {
      const arr = [];
      this.sideList.forEach((item) => {
        arr.push({ name: item.title, index: item.fileName });
      });
      return arr;
    },
  },
  methods: {
    init() {
      this.getData();
      this.contentId = this.$route.params.id;
      this.$bus.$off('HEADER-CLICK-EVENT');
      this.$bus.$on('HEADER-CLICK-EVENT', () => {
        this.typeListFlag = !this.typeListFlag;
      });
    },
    goPage({ index }) {
      this.$router.push(`${index}`);
      this.getfile(index);
      this.typeListFlag = false;
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
            this.$router.push(`cms/${data.data[0].fileName}`);
          }
          this.getfile();
        }
      });
    },
    getfile(index) {
      this.axios({
        url: this.$store.state.url.common.cmsInfo,
        headers: {},
        params: {
          fileName: index || this.contentId,
        },
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          this.notieContent = data.data;
          this.notieContent.ctime = formatTime(data.data.ctimeLong);
          this.$nextTick(() => {
            const arr = Array.from(this.$refs.content.getElementsByTagName('img'));
            arr.forEach((dom) => {
              const ev = dom;
              if (ev.src.split('://')[0] === 'http') {
                ev.src = `https://${ev.src.split('://')[1]}`;
              }
              ev.style.maxWidth = '98%';
              ev.style.maxHeight = 'auto';
            });
          });
        }
      });
    },
  },
};
