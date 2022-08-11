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
      pagination: {
        // 翻页数据
        count: 0, // 总数量
        pageSize: 9, // 每页显示条数
        page: 1, // 当前页数
      },
      noticeSearchVal: '',
      cacheData: {
        sideList: [],
        pagination: [],
      },
      timer: null,
      searchLoaded: false,
      openSearch: false,
    };
  },
  computed: {
    menuBoxHeight() {
      if (this.menuBarHeight > 860) {
        return '860px';
      }
      return 'auto';
    },
    contentMinHeight() {
      if (this.menuBarHeight > 860) {
        return '760px';
      }
      return '';
    },
  },
  filters: {
    cutTextLength(value) {
      return value.slice(0, 20);
    },
  },
  methods: {
    init() {
      this.menuBarHeight = this.$refs.menuBar.offsetHeight;
      if (this.$route.params.ntId) {
        this.contentId = parseFloat(this.$route.params.ntId);
      }
      // 获取列表书数据
      this.getListData();
      // 获取 内容
      this.getContentData();
    },
    clearSearchVal() {
      this.noticeSearchVal = '';
      this.setCacheToData();
    },
    setDataToCache() {
      const { sideList, pagination } = this;
      this.cacheData = {
        cache: true,
        sideList,
        pagination,
      };

      this.sideList = [];
      this.pagination = {
        count: 0,
        pageSize: 10,
        page: 1,
      };
    },
    setCacheToData() {
      const { sideList, pagination } = this.cacheData;
      this.sideList = sideList;
      this.pagination = pagination;
      this.cacheData = {
        sideList: [],
        pagination: [],
        cache: false,
      };
    },
    postValToSearch() {
      this.searchLoaded = false;

      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }

      this.timer = setTimeout(() => {
        if (this.noticeSearchVal !== '') {
          this.isshowLoading = true;
          this.searchNoticeToKey(this.noticeSearchVal);
        }
      }, 300);
    },
    searchNoticeToKey() {
      // this.searchLoaded = true;
      //   this.isshowLoading = false;
      //   if (data.code === '0' && this.noticeSearchVal !== '') {
      //     this.sideList = [];
      //   }
      if (this.noticeSearchVal !== '') {
        this.getListData(true);
      }
    },
    setNoticeSearchVal() {
      if (this.noticeSearchVal) {
        if (!this.cacheData.cache) {
          this.setDataToCache();
        }
        this.postValToSearch();
      }
      if (this.noticeSearchVal === '' && this.cacheData.cache) {
        this.setCacheToData();
      }
    },
    // 翻页事件
    pagechange(num) {
      const isSearch = this.noticeSearchVal !== '';
      this.pagination.page = num;
      this.getListData(isSearch);
    },
    // 获取列表书数据
    getListData(isSearch = false) {
      const keyword = isSearch ? this.noticeSearchVal : '';
      this.getData({
        url: this.$store.state.url.notice.notice_list,
        params: {
          keyword,
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
        },
        callback: (data) => {
          this.isshowLoading = false;
          this.searchLoaded = true;
          this.openSearch = data.data.openSearch;

          // 如果路由没有参数 默认显示第一条数据
          if (!isSearch || (isSearch && this.noticeSearchVal !== '')) {
            this.sideList = data.data.noticeInfoList;
            this.pagination.count = data.data.count;
          }

          if (!parseFloat(this.$route.params.ntId)) {
            this.writing(data.data.noticeInfoList[0].id);
            this.$router.push(`/noticeInfo/${data.data.noticeInfoList[0].id}`);
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
