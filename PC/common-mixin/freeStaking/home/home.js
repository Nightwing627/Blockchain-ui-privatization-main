import { colorMap, imgMap } from '@/utils';

export default {
  data() {
    return {
      currentType: 'all',
      currentStatus: 0,
      projectList: [],
      homeData: null,
      imgMap,
      colorMap,
      iconStyle: {
        0: '#icon-a_20',
        1: '#icon-a_21',
        2: '#icon-a_21',
        3: '#icon-a_21',
        4: '#icon-a_19',
        5: '#icon-a_19',
        6: '#icon-a_21',
      },
    };
  },
  computed: {
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    filterProjectData() {
      return this.projectList.filter((item) => {
        const filterRules = {
          0: {},
          1: { lockPos: [0], unLockPos: [1] },
          2: { lockPos: [1], unLockPos: [2] },
          3: { lockPos: [2, 3, 4, 5, 6], unLockPos: [3] },
        };

        const key = item.projectType === 3 ? 'lockPos' : 'unLockPos';
        const type = Boolean(this.currentType === 'all'
          || item.configTypes.indexOf(this.currentType) > -1);

        const status = Boolean(this.currentStatus === 0
          || filterRules[this.currentStatus][key].includes(item.status));

        return type && status;
      });
    },
    statusTab() {
      // return [
      //   { name: this.$t('innov.whole'), index: 0 }, // 全部
      //   { name: this.$t('freeStaking.home.status[0]'), index: 1 }, // 待开始
      //   { name: this.$t('freeStaking.home.status[1]'), index: 2 }, // 募集中
      //   { name: this.$t('freeStaking.home.status[2]'), index: 3 }, // 待计息
      //   { name: this.$t('freeStaking.home.status[3]'), index: 4 }, // 计息中
      //   { name: this.$t('freeStaking.home.status[4]'), index: 5 }, // 计息结束
      // ];
      return [
        { name: this.$t('innov.whole'), index: 0 }, // 全部
        { name: this.$t('freeStaking.home.status[0]'), index: 1 }, // 待开始
        { name: this.$t('innov.status2'), index: 2 }, // 进行中
        { name: this.$t('freeStaking.home.status[7]'), index: 3 }, // 已结束
      ];
    },
    navTab() {
      if (!this.homeData) return [];

      const navTabList = this.homeData.typeConfig.map((item) => ({
        name: item.typeName,
        index: item.typeSn,
      }));

      return [{ name: this.$t('innov.whole'), index: 'all' }].concat(navTabList);
    },
  },
  methods: {
    init() {
      this.getHomeData();
      this.getProjectList();
    },
    countStatusIsOn(item) {
      const lock = item.status === 1 && item.projectType === 3;
      const unLock = item.status === 2 && item.projectType !== 3;

      return lock || unLock ? 'f-4-cl' : 'f-2-cl';
    },
    countStatusText(item) {
      return item.projectType === 3
        ? this.statusText(item.status)
        : this.unLockStatusText(item.status);
    },
    statusText(status) {
      const text = {
        0: this.$t('freeStaking.home.status[0]'),
        1: this.$t('freeStaking.home.status[1]'),
        2: this.$t('freeStaking.home.status[2]'),
        3: this.$t('freeStaking.home.status[3]'),
        4: this.$t('freeStaking.home.status[4]'),
        5: this.$t('freeStaking.home.status[5]'),
        6: this.$t('freeStaking.home.status[6]'),
      };
      return text[status];
    },
    unLockStatusText(status) {
      const text = {
        1: this.$t('freeStaking.home.status[0]'),
        2: this.$t('innov.status2'),
        3: this.$t('freeStaking.home.status[7]'),
      };
      return text[status];
    },
    projectLabel(type) {
      const label = {
        0: '',
        1: 'HOT',
        2: 'NEW',
      };
      return label[type];
    },
    navToPosHistory() {
      this.$router.push('/myPos');
    },
    getHomeData() {
      this.axios({
        url: this.$store.state.url.freeStaking.index,
        headers: {},
        params: {},
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          const homeData = data.data;
          homeData.detail = homeData.detail.replace(/\n/g, '<br/>');
          this.homeData = homeData;
        }
      });
    },
    getProjectList() {
      this.axios({
        url: this.$store.state.url.freeStaking.project_list,
        headers: {},
        params: {},
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          this.projectList = data.data;
        }
      });
    },
    selectType(item) {
      this.currentType = item.index;
    },
    changeCurrentStatus(item) {
      this.currentStatus = item.index;
    },
    currentStyle(item) {
      return item.index === this.currentStatus ? ['f-1-cl', 'c-5-bg'] : ['f-2-cl'];
    },
    takeActivityDetail(item) {
      this.$router.push(`/freeStaking/${item.id}`);
    },
    navToConfigUrl(url) {
      window.location.href = url;
    },
    showLabel(item, status) {
      return item.labelType === status && (item.status === 1 || item.status === 0);
    },
  },
};
