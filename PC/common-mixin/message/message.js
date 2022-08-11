import { formatTime } from '@/utils';

export default {
  name: 'mesage',
  data() {
    return {
      messageType: 0,
      sideList: [],
      notieContent: [],
      pagination: {
        count: 0,
        page: 1,
        pageSize: 10,
      },
      selectArr: [],
      deleteFlag: null,
      readFlag: null,
      pageNumber: null,
      isshowLoading: true,
      pageTitle: null,
    };
  },
  computed: {
    title() {
      if (this.pageTitle) {
        return this.pageTitle;
      }
      if (this.sideList.length) {
        return this.sideList[0].title;
      }
      return '';
    },
    dataListId() {
      if (this.notieContent.length) {
        const arr = [];
        this.notieContent.forEach((item) => {
          arr.push(item.id);
        });
        return arr;
      }
      return [];
    },
  },
  methods: {
    init() {
      this.getListData();
    },
    formatTimeFn(date) {
      return formatTime(date);
    },
    // 获取列表书数据
    getListData() {
      this.isshowLoading = true;
      this.getData({
        url: this.$store.state.url.mesage.message,
        params: {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          messageType: this.messageType,
        },
        callback: (data) => {
          this.notieContent = data.data.userMessageList;
          this.sideList = data.data.typeList;
          this.pagination.count = data.data.count;
          this.isshowLoading = false;
        },
      });
    },
    getData(datas) {
      const { url, params, callback } = datas;
      this.axios({
        url,
        params,
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          callback(data);
        } else {
          this.deleteFlag = null;
          this.readFlag = null;
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      }).catch(() => {
        this.deleteFlag = null;
        this.readFlag = null;
        this.$bus.$emit('tip', { text: this.$t('common.error_500'), type: 'error' });
      });
    },
    // 标记为已读
    onChangeRead(id, index) {
      if (index !== 'all' && this.notieContent[index].status === 2) {
        return false;
      }
      if (this.readFlag !== id) {
        this.readFlag = id;
        this.getData({
          url: this.$store.state.url.mesage.message_status,
          params: {
            id,
          },
          callback: () => {
            if (index === 'all') {
              this.notieContent.forEach((item, i) => {
                this.notieContent[i].status = 2;
              });
            } else {
              this.notieContent[index].status = 2;
            }
            this.$store.dispatch('getMessage_count');
          },
        });
      }
      return true;
    },
    // 删除
    deleteMsg(id, index) {
      if (index === 'all' && !id.length) {
        // '请选择要删除的内容'
        this.$bus.$emit('tip', { text: this.$t('message.pleSelContent'), type: 'error' });
      } else if (this.deleteFlag !== id) {
        this.deleteFlag = id;
        this.getData({
          url: this.$store.state.url.mesage.message_del,
          params: {
            ids: id.toString(),
          },
          callback: () => {
            this.selectArr = [];
            this.notieContent.splice(index, 1);
            this.$store.dispatch('getMessage_count');
            this.getListData();
          },
        });
      }
    },
    // 切换类型
    switchType(id, title) {
      this.pageTitle = title;
      this.messageType = id;
      this.pagination.page = 1;
      this.getListData();
    },
    // 翻页事件
    pagechange(num) {
      this.pageNumber = num;
      this.pagination.page = num;
      this.getListData();
    },
    // 复选框
    checkoutSelect(data) {
      if (data === 'all') {
        if (this.selectArr.length === this.dataListId.length) {
          this.selectArr = [];
        } else {
          const [...selectArr] = this.dataListId;
          this.selectArr = selectArr;
        }
      } else {
        const index = this.selectArr.indexOf(data);
        if (index !== -1) {
          this.selectArr.splice(index, 1);
        } else {
          this.selectArr.push(data);
        }
      }
    },
  },
};
