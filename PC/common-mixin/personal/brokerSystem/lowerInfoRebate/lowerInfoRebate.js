import { imgMap, colorMap } from '@/utils';

export default {
  data() {
    return {
      loading: true,
      imgMap,
      colorMap,
      dataList: [],
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
      startTime: '',
      endTime: '',
      uidValue: '',
      phoneValue: '',
      coinType: 'all',
      type: 'all',
      lowerType: 'all',
    };
  },
  computed: {
    typeList() {
      return [
        // 全部
        { code: 'all', key: 'type', value: this.$t('order.otcOrder.all') },
      ];
    },
    coinTypeList() {
      return [
        // 全部
        { code: 'all', key: 'coinType', value: this.$t('order.otcOrder.all') },
      ];
    },
    lowerTypeList() {
      return [
        // 全部
        { code: 'all', key: 'lowerType', value: this.$t('order.otcOrder.all') },
      ];
    },
    startTimeNum() {
      return (new Date(this.startTime.replace(/-/g, '/')).getTime() / 1000).toString();
    },
    endTimeNum() {
      return (new Date(this.endTime.replace(/-/g, '/')).getTime() / 1000).toString();
    },
    startTimeText() {
      return this.$t('broker.startTime');
    },
    endTimeText() {
      return this.$t('freeStaking.myPos.endTime');
    },
    navTab() {
      return [
        {
          name: this.$t('brokerSystem.commissionNavTab[0]'),
          index: 1,
        },
        {
          name: this.$t('brokerSystem.commissionNavTab[1]'),
          index: 2,
        },
      ];
    },
    columns() {
      return [
        {
          title: this.$t('brokerSystem.lowerTable1[0]'),
          align: 'left',
          width: '200px',
          classes: '',
        },
        {
          title: this.$t('brokerSystem.lowerTable[1]'),
          align: 'left',
          width: '200px',
          classes: '',
        },
        {
          title: this.$t('brokerSystem.lowerTable[2]'),
          align: 'center',
          width: '',
        },
        {
          title: this.$t('brokerSystem.lowerTable[3]'),
          align: 'center',
          width: '',
        },
        {
          title: this.$t('brokerSystem.lowerTable[4]'),
          align: 'center',
          width: '',
        },
        {
          title: this.$t('brokerSystem.lowerTable1[1]'),
          align: 'center',
          width: '',
        },
        {
          title: this.$t('brokerSystem.lowerTable1[2]'),
          align: 'center',
          width: '',
        },
        {
          title: this.$t('brokerSystem.lowerTable1[3]'),
          align: 'center',
          width: '',
        },
        {
          title: this.$t('brokerSystem.lowerTable1[4]'),
          align: 'center',
          width: '',
        },
        {
          title: this.$t('brokerSystem.lowerTable1[5]'),
          align: 'right',
          width: '',
        },
      ];
    },
  },
  methods: {
    init() {
      this.startTime = this.getNowTime(this.getMonth(-3));
      this.endTime = this.getNowTime(this.getMonth(3));
    },
    getMonth(n) {
      const date = new Date();
      return date.setMonth(date.getMonth() + n);
    },
    getNowTime(time = '') {
      const date = new Date(time);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      return `${year}-${month}-${day}`;
    },
    setStartTime(time) {
      this.startTime = time;
      this.reducePost();
    },
    setEndTime(time) {
      this.endTime = time;
      this.reducePost();
    },
    currentType(data) {
      this.currentTab = data.index;
    },
    reducePost() {
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {

      }, 500);
    },
    inputChanges(value, name) {
      this[name] = value;
    },
    setSelect(item) {
      this[item.key] = item.code;
    },
  },
};
