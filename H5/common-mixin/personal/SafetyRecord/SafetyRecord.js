
export default {
  name: 'bindEmail',
  watch: {
    loginHistory(loginHistory) {
      this.loading1 = false;
      if (loginHistory) {
        if (!loginHistory.code) {
          this.count = loginHistory.count;
          if (Math.ceil(parseFloat(loginHistory.count) / parseFloat(this.pageSize))
            > this.page) {
            this.pullUpState = 0;
          } else {
            this.pullUpState = 3;
          }
          this.processData(loginHistory.historyLoginList);
        }
      }
    },
    settingHistory(settingHistory) {
      this.loading2 = false;
      if (settingHistory) {
        if (!settingHistory.code) {
          this.count2 = settingHistory.count;
          if (Math.ceil(parseFloat(settingHistory.count) / parseFloat(this.pageSize2))
            > this.page2) {
            this.pullUpState = 0;
          } else {
            this.pullUpState = 3;
          }
          this.processData(settingHistory.historySettingList);
        }
      }
    },
  },
  computed: {
    loginHistory() {
      return this.$store.state.personal.loginHistory;
    },
    settingHistory() {
      return this.$store.state.personal.settingHistory;
    },
    navList() {
      return [
        {
          // 安全设置
          text: this.$t('personal.userManagement.securityTitle'),
          link: '/personal/userManagement',
        },
        {
          // 安全记录
          text: this.$t('personal.navMenu.list.safetyRecord'),
          active: true,
          link: '/personal/safetyRecord',
        },
      ];
    },
  },
  data() {
    return {
      loading1: true,
      loading2: true,
      // 横向导航参数
      currentTab: 1,
      navTab: [
        {
          name: this.$t('personal.safetyRecord.navTab')[0],
          index: 1,
        },
        {
          name: this.$t('personal.safetyRecord.navTab')[1],
          index: 2,
        },
      ],
      // table 参数
      columns: [
        {
          title: this.$t('personal.safetyRecord.loginColumn')[0],
          align: 'left',
          width: '200px',
          classes: '',
        },
        {
          title: this.$t('personal.safetyRecord.loginColumn')[1],
          align: 'center',
          width: '',
        },
        {
          title: this.$t('personal.safetyRecord.loginColumn')[2],
          align: 'center',
          width: '',
        },
        {
          title: this.$t('personal.safetyRecord.loginColumn')[3],
          align: 'right',
          width: '',
        },
      ],
      columns2: [
        {
          title: this.$t('personal.safetyRecord.settingColumn')[0],
          align: 'left',
          width: '200px',
          classes: '',
        },
        {
          title: this.$t('personal.safetyRecord.settingColumn')[1],
          align: 'center',
          width: '',
        },
        {
          title: this.$t('personal.safetyRecord.settingColumn')[2],
          align: 'center',
          width: '',
        },
      ],
      dataList: [],
      dataList2: [],
      cellHeight: 55,
      headHeight: 30,
      lineNumber: 10,
      classes: '',
      headClasses: '',
      bodyClasses: '',
      lineClass: '',
      // 数据相关
      count: 0, // 总条数
      page: 1, // 当前page
      pageSize: 10, // 每页显示
      count2: 0, // 总条数
      page2: 1, // 当前page
      pageSize2: 10, // 每页显示
      pullUpState: 0,
    };
  },
  methods: {
    init() {
      this.getLoginHistory();
    },
    // 下拉刷新
    onRefresh(done) {
      if (this.currentTab === 1) {
        this.page = 1;
        this.dataList = [];
        this.loading1 = true;
        const info = {
          page: this.page,
          pageSize: this.pageSize,
        };
        this.$store.dispatch('loginHistory', info);
      } else {
        this.page2 = 1;
        this.dataList2 = [];
        this.loading2 = true;
        const info = {
          page: this.page2,
          pageSize: this.pageSize2,
        };
        this.$store.dispatch('settingHistory', info);
      }
      // this.getData();
      done();
    },
    onInfiniteLoads(done) {
      if (this.pullUpState === 0) {
        this.pullUpState = 2;
        if (this.currentTab === 1) {
          this.page += 1;
          const info = {
            page: this.page,
            pageSize: this.pageSize,
          };
          this.$store.dispatch('loginHistory', info);
        } else {
          this.page2 += 1;
          const info = {
            page: this.page2,
            pageSize: this.pageSize2,
          };
          this.$store.dispatch('settingHistory', info);
        }
      }
      done();
    },
    // 接收当前的头部状态
    currentType(data) {
      if (data.index !== this.currentTab) {
        this.currentTab = data.index;
        this.pullUpState = 0;
        if (this.currentTab === 1) {
          this.count2 = 0; // 总条数
          this.page2 = 1; // 当前page
          // this.pageSize2 = 10; // 每页显示
          this.dataList2 = [];
          this.getLoginHistory();
        } else {
          this.count = 0; // 总条数
          this.page = 1; // 当前page
          // this.pageSize = 10; // 每页显示
          this.dataList = [];
          this.getSettingHistory();
        }
      }
    },
    // 处理数据
    processData(list) {
      if (this.currentTab === 1) {
        const newList = [];
        list.forEach((obj) => (
          newList.push({
            data: [
              obj.formatLgInTime,
              obj.lgPlatform,
              obj.lgIp,
              (obj.lgStatus === 1 ? this.$t('personal.safetyRecord.success') : this.$t('personal.safetyRecord.failure'))],
          })
        ));
        this.dataList = [...[], ...this.dataList, ...newList];
      } else {
        const newList = [];
        list.forEach((obj) => (
          newList.push({
            data: [obj.formatCtime, obj.optTypeName, obj.optIp],
          })
        ));
        this.dataList2 = [...[], ...this.dataList2, ...newList];
      }
    },
    pagechange(page) {
      if (this.currentTab === 1) {
        this.page = page;
        const info = {
          page: this.page,
          pageSize: this.pageSize,
        };
        this.$store.dispatch('loginHistory', info);
      } else {
        this.page2 = page;
        const info = {
          page: this.page2,
          pageSize: this.pageSize2,
        };
        this.$store.dispatch('settingHistory', info);
      }
    },
    getLoginHistory() { // 获取登录历史数据
      const info = {
        page: this.page,
        pageSize: this.pageSize,
      };
      this.loading1 = true;
      this.$store.dispatch('loginHistory', info);
    },
    getSettingHistory() { // 获取安全设置历史数据
      const info = {
        page: this.page2,
        pageSize: this.pageSize2,
      };
      this.loading2 = true;
      this.$store.dispatch('settingHistory', info);
    },
  },
};
