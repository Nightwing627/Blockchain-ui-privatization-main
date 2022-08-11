import { colorMap, imgMap } from '@/utils';

export default {
  data() {
    return {
      colorMap,
      imgMap,
      currentType: 0, // 0 锁仓  1 持仓
      startTime: '',
      endTime: '',
      posData: [],
      paginationData: {
        total: 100, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      subTableData: null,
      subTableDataId: null,
      subPosData: [],
      loading: false,
      pageData: {},
    };
  },
  computed: {
    startTimeNum() {
      return (new Date(this.startTime.replace(/-/g, '/')).getTime() / 1000).toString();
    },
    endTimeNum() {
      return (new Date(this.endTime.replace(/-/g, '/')).getTime() / 1000).toString();
    },
    columns() {
      const lockPosTable = [
        { title: this.$t('freeStaking.myPos.lockPosTable[0]'), width: '10%' },
        { title: this.$t('manageFinances.startTime'), width: '20%' },
        { title: this.$t('freeStaking.myPos.lockPosTable[2]'), width: '15%' },
        { title: this.$t('freeStaking.myPos.lockPosTable[3]'), width: '20%' },
        { title: this.$t('freeStaking.myPos.lockPosTable[4]'), width: '20%' },
        { title: this.pageData.tipStatus, width: '15%' },
      ];

      const unLockPosTable = [
        { title: this.$t('freeStaking.myPos.unLockPosTable[0]'), width: '20%' },
        { title: this.$t('freeStaking.myPos.unLockPosTable[1]'), width: '20%' },
        { title: this.$t('freeStaking.myPos.unLockPosTable[2]'), width: '20%' },
        { title: this.$t('freeStaking.myPos.unLockPosTable[3]'), width: '20%' },
        { title: this.$t('freeStaking.myPos.unLockPosTable[4]'), width: '20%' },
      ];

      return this.currentType ? unLockPosTable : lockPosTable;
    },
    subColumns() {
      const columns = [
        { text: this.$t('freeStaking.detail.incomeTime'), class: 'table-custom-class' },
        { text: this.$t('freeStaking.detail.incomeNum'), class: 'table-custom-class' },
      ];

      return this.currentType ? [] : columns;
    },
    navTabList() {
      return [{
        name: this.pageData.tipLock,
        index: 0,
      }, {
        name: this.pageData.tipNormal,
        index: 1,
      }];
    },
    startTimeText() {
      return this.$t('broker.startTime');
    },
    endTimeText() {
      return this.$t('freeStaking.myPos.endTime');
    },
  },
  methods: {
    init() {
      this.startTime = this.getNowTime(this.getMonth(-3));
      this.endTime = this.getNowTime(this.getMonth(3));
      this.getUserPosData(this.currentType);
    },
    getMonth(n) {
      const date = new Date();
      return date.setMonth(date.getMonth() + n);
    },
    getUserPosData(currentType) {
      const { currentPage, display } = this.paginationData;
      this.loading = true;

      this.axios({
        url: this.$store.state.url.freeStaking.pos_history,
        headers: {},
        params: {
          page: currentPage,
          pageSize: display,
          projectType: currentType ? 1 : 3,
          strTime: this.startTime,
          entTime: this.endTime,
        },
        method: 'post',
      }).then((data) => {
        if (data.code === '0' && currentType === this.currentType) {
          const { count, posList } = data.data;
          this.pageData = data.data;
          this.paginationData.total = count;
          this.posData = this.initPosData(posList);
          this.loading = false;
        }
      });
    },
    reducePost() {
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.getUserPosData(this.currentType);
      }, 500);
    },
    initPosData(data) {
      if (!Array.isArray(data)) return false;
      const subPosData = [];
      const posData = data.map((item, index) => {
        const lockData = [
          item.baseCoin,
          item.ltime,
          item.totalAmount,
          `${item.gainRate}%`,
          [
            {
              text: item.totalUserGainAmount,
            },
            {
              type: 'subTable',
            },
          ],
          this.countStatusText(item.projectStatus),
        ];
        const unLockData = [
          item.baseCoin,
          item.revenueTime,
          item.baseAmount,
          item.gainRate,
          item.gainAmount,
        ];

        const subPosDataItem = !this.currentType && Array.isArray(item.userGainList)
          ? item.userGainList : [];

        const subPosDataItemAddClass = subPosDataItem.map((el) => [{
          text: el.gainTime,
          class: 'table-custom-class',
        }, {
          text: el.gainAmount,
          class: 'table-custom-class',
        }]);

        subPosData.push(
          subPosDataItemAddClass,
        );

        return {
          id: index,
          data: this.currentType ? unLockData : lockData,
        };
      });

      this.subPosData = subPosData;

      return posData;
    },
    getNowTime(time = '') {
      const date = new Date(time);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      return `${year}-${month}-${day}`;
    },
    selectType(item) {
      if (this.loading) return;

      this.currentType = item.index;
      this.subTableDataId = null;
      this.getUserPosData(this.currentType);
    },
    setStartTime(time) {
      this.startTime = time;
      this.reducePost();
    },
    setEndTime(time) {
      this.endTime = time;
      this.reducePost();
    },
    countStatusText(status) {
      const statusText = {
        0: this.$t('freeStaking.home.status[0]'),
        1: this.$t('freeStaking.home.status[1]'),
        2: this.$t('freeStaking.home.status[2]'),
        3: this.$t('freeStaking.home.status[3]'),
        4: this.$t('freeStaking.home.status[4]'),
        5: this.$t('freeStaking.home.status[5]'),
        6: this.$t('freeStaking.home.status[6]'),
      };
      return statusText[status];
    },
    pagechange(e) {
      if (this.loading) return;
      this.paginationData.currentPage = e;
      this.subTableDataId = null;
      this.getUserPosData(this.currentType);
    },
    tableClick(element, data) {
      if (!this.currentType) {
        this.subTableData = this.subPosData[data.id];
        this.subTableDataId = data.id;
      }
    },
  },
};
