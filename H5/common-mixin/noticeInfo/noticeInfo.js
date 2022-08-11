import { myStorage, formatTime } from '@/utils';

export default {
  name: 'noticeInfo',
  data() {
    return {
      contentId: parseFloat(myStorage.get('ntId')) || null,
      sideList: [],
      notieContent: {},
      menuBarHeight: null,
      isshowLoading: true,
      pagination: { // 翻页数据
        count: 0, // 总数量
        pageSize: 10, // 每页显示条数
        page: 1, // 当前页数
      },
      typeListFlag: false,
    };
  },
  watch: {
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
        arr.push({ name: item.title, index: item.id });
      });
      return arr;
    },
  },
  beforeDestroy() {
    this.$bus.$off('HEADER-CLICK-EVENT');
  },
  filters: {
    cutTextLength(value) {
      return value.slice(0, 20);
    },
  },
  methods: {
    init() {
      // this.menuBarHeight = this.$refs.menuBar.offsetHeight;
      if (this.$route.params.ntId) {
        this.contentId = parseFloat(this.$route.params.ntId);
      }
      // 获取列表书数据
      this.getListData();
      // 获取 内容
      this.getContentData();
      this.$bus.$off('HEADER-CLICK-EVENT');
      this.$bus.$on('HEADER-CLICK-EVENT', () => {
        this.typeListFlag = !this.typeListFlag;
      });
    },
    goPage(v) {
      this.writing(v.index);
      this.typeListFlag = false;
    },
    // 翻页事件
    pagechange(num) {
      this.pagination.page = num;
      this.getListData();
    },
    // 获取列表书数据
    getListData() {
      this.getData({
        url: this.$store.state.url.notice.notice_list,
        params: {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
        },
        callback: (data) => {
          this.pagination.count = data.data.count;
          this.sideList = data.data.noticeInfoList;
          // 如果路由没有参数 默认显示第一条数据

          if (!parseFloat(this.$route.params.ntId)) {
            this.writing(data.data.noticeInfoList[0].id);
            this.$router.push(`noticeInfo/${data.data.noticeInfoList[0].id}`);
          }
        },
      });
    },
    // 获取 内容
    getContentData() {
      this.getData({
        url: this.$store.state.url.notice.notice_info,
        params: {
          id: this.contentId,
        },
        callback: (data) => {
          this.notieContent = data.data.noticeInfo;
          this.notieContent.ctime = formatTime(data.data.noticeInfo.ctime);
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
        },
      });
    },
    writing(i) {
      if (i !== this.contentId) {
        myStorage.set('ntId', i);
        this.contentId = i;
        // this.$router.push({ path: 'noticeInfo', params: { ntId: i } });
        this.$router.push(`${i}`);
        this.getContentData();
      }
    },
    getData(datas) {
      this.isshowLoading = true;
      const { url, params, callback } = datas;
      this.axios({
        url,
        params,
        method: 'post',
      }).then((data) => {
        this.isshowLoading = false;
        if (data.code === '0') {
          callback(data);
        }
      });
    },
  },
};
