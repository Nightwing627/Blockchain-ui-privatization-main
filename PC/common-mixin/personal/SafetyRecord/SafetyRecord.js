import { imgMap, colorMap } from '@/utils';

export default {
  name: 'bindEmail',
  watch: {
    loginHistory(loginHistory) {
      this.loading1 = false;
      if (loginHistory) {
        if (!loginHistory.code) {
          this.count = loginHistory.count;
          this.processData(loginHistory.historyLoginList);
        }
      }
    },
    settingHistory(settingHistory) {
      this.loading2 = false;
      if (settingHistory) {
        if (!settingHistory.code) {
          this.count2 = settingHistory.count;
          this.processData(settingHistory.historySettingList);
        }
      }
    },
  },
  computed: {
    navTab() {
      return [
        {
          name: this.$t('personal.safetyRecord.navTab')[0],
          index: 1,
        },
        {
          name: this.$t('personal.safetyRecord.navTab')[1],
          index: 2,
        },
      ];
    },
    loginHistory() {
      return this.$store.state.personal.loginHistory;
    },
    settingHistory() {
      return this.$store.state.personal.settingHistory;
    },
  },
  data() {
    return {
      loading1: true,
      imgMap,
      colorMap,
      loading2: true,
      // 横向导航参数
      currentTab: 1,
      lineHeight: '55',
      marginRight: 48, // 距离右边的距离
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
    };
  },
  methods: {
    init() {
      this.getLoginHistory();
    },
    // 接收当前的头部状态
    currentType(data) {
      if (data.index !== this.currentTab) {
        this.currentTab = data.index;
        if (this.currentTab === 1) {
          this.getLoginHistory();
          this.count2 = 0; // 总条数
          this.page2 = 1; // 当前page
          this.pageSize2 = 10; // 每页显示
        } else {
          this.getSettingHistory();
          this.count = 0; // 总条数
          this.page = 1; // 当前page
          this.pageSize = 10; // 每页显示
        }
      }
    },
    // 处理数据
    processData(list) {
      if (this.currentTab === 1) {
        this.dataList = list.map((obj) => (
          {
            data: [obj.formatLgInTime, obj.lgPlatform, obj.lgIp, (obj.lgStatus === 1 ? this.$t('personal.safetyRecord.success') : this.$t('personal.safetyRecord.failure'))],
          }));
      } else {
        this.dataList2 = list.map((obj) => (
          {
            data: [obj.formatCtime, obj.optTypeName, obj.optIp],
          }));
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
