import {
  imgMap, colorMap, fixD, formatTime,
} from '@/utils';

export default {
  data() {
    return {
      currentTab: 1,
      lineHeight: '55',
      marginRight: 50, // 距离右边的距离
      loading1: true,
      imgMap,
      colorMap,
      loading2: true,
      dataList: [],
      dataList2: [],
      cellHeight: 55,
      headHeight: 30,
      lineNumber: 10,
      classes: '',
      headClasses: '',
      bodyClasses: '',
      lineClass: '',
      // 分页器1
      list1Page: {
        count: 0, // 总条数
        page: 1, // 当前page
        pageSize: 10, // 每页显示
      },
      // 分页器2
      list2Page: {
        count: 0, // 总条数
        page: 1, // 当前page
        pageSize: 10, // 每页显示
      },
      startTime: '',
      endTime: '',
      coin: 'all',
      coinList: [],
    };
  },
  watch: {
    market: {
      immediate: true,
      handler(v) {
        if (v) { this.init(); }
      },
    },
  },
  computed: {
    usdtFix() {
      let fix = 2;
      if (this.market && this.market.coinList && this.market.coinList.USDT) {
        fix = this.market.coinList.USDT.showPrecision;
      }
      return fix;
    },
    market() { return this.$store.state.baseData.market; },
    sideList() {
      return [ // 方向选择列表
        // 全部
        { code: 'all', value: this.$t('order.exchangeOrder.all') },
        // 买入
        { code: 'buy', value: this.$t('order.exchangeOrder.buy') },
        // 卖出
        { code: 'sell', value: this.$t('order.exchangeOrder.sell') },
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
          title: this.$t('brokerSystem.commissionTable[1]'),
          align: 'left',
          width: '200px',
          classes: '',
        },
        {
          title: this.$t('brokerSystem.commissionTable[2]'),
          align: 'center',
          width: '',
        },
        {
          title: this.$t('brokerSystem.commissionTable[3]'),
          align: 'center',
          width: '',
        },
        {
          title: this.$t('brokerSystem.commissionTable[4]'),
          align: 'right',
          width: '',
        },
      ];
    },
    columns2() {
      return [
        {
          title: this.$t('brokerSystem.commissionTable[0]'),
          align: 'left',
          width: '200px',
          classes: '',
        },
        {
          title: this.$t('brokerSystem.commissionTable[1]'),
          align: 'center',
          width: '200px',
          classes: '',
        },
        {
          title: this.$t('brokerSystem.commissionTable[2]'),
          align: 'center',
          width: '',
        },
        {
          title: this.$t('brokerSystem.commissionTable[3]'),
          align: 'center',
          width: '',
        },
        {
          title: this.$t('brokerSystem.commissionTable[4]'),
          width: '',
        },
        {
          title: this.$t('brokerSystem.commissionTable[5]'),
          align: 'right',
          width: '',
        },
      ];
    },
  },
  methods: {
    init() {
      this.startTime = this.getNowTime(this.getMonth(-1));
      this.endTime = this.getNowTime(this.getMonth(0));
      // const arr = [
      //   { code: 'all', value: this.$t('order.exchangeOrder.all') },
      // ];
      // Object.keys(this.market.coinList).forEach((v) => {
      //   const even = this.market.coinList[v];
      //   arr.push({
      //     code: even.showName || even.name,
      //     value: even.name,
      //   });
      // });
      // this.coinList = arr;
      this.getList1();
    },
    pagechange1(v) {
      this.list1Page.page = v;
      this.getList1();
    },
    pagechange2(v) {
      this.list2Page.page = v;
      this.getList2();
    },
    getList1() {
      // const data = {
      //   mapList: [
      //     { coin: 'USDT', amount_total: '1', amount_return: '2', amount_sub: '3', },
      //     { coin: 'USDT', amount_total: '1', amount_return: '2', amount_sub: '3', },
      //     { coin: 'USDT', amount_total: '1', amount_return: '2', amount_sub: '3', },
      //     { coin: 'USDT', amount_total: '1', amount_return: '2', amount_sub: '3', },
      //     { coin: 'USDT', amount_total: '1', amount_return: '2', amount_sub: '3', },
      //     { coin: 'USDT', amount_total: '1', amount_return: '2', amount_sub: '3', },
      //     { coin: 'USDT', amount_total: '1', amount_return: '2', amount_sub: '3', },
      //     { coin: 'USDT', amount_total: '1', amount_return: '2', amount_sub: '3', },
      //     { coin: 'USDT', amount_total: '1', amount_return: '2', amount_sub: '3', },
      //     { coin: 'USDT', amount_total: '1', amount_return: '2', amount_sub: '3', },
      //   ]
      // }
      this.axios({
        url: 'co/agent/bonus_survey',
        hostType: 'fe-increment-api',
        params: {
          page: this.list1Page.page,
          pageSize: this.list1Page.pageSize,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.setList1(data.data.mapList);
          this.list1Page.count = data.data.count;
          this.setV2(data.data.mapList);
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    setV2(data) {
      const arr = [
        { code: 'all', value: this.$t('order.exchangeOrder.all') },
      ];
      data.forEach((v) => {
        arr.push({
          code: v.coin,
          value: v.coin,
        });
      });
      this.coinList = arr;
      this.getList2();
    },
    getFix(v) {
      let fix = 2;
      if (this.market && this.market.coinList && this.market.coinList[v]) {
        fix = this.market.coinList[v].showPrecision;
      }
      return fix;
    },
    setList1(data) {
      this.loading1 = false;
      const arr = [];
      data.forEach((item, index) => {
        const fix = this.getFix(item.coin.toUpperCase());
        arr.push({
          id: index,
          data: [
            item.coin,
            fixD(item.amount_return, fix),
            fixD(item.amount_sub, fix),
            fixD(item.amount_total, fix),
          ],
        });
      });
      this.dataList = arr;
    },
    getList2() {
      this.axios({
        url: 'co/agent/bonus_record',
        hostType: 'fe-increment-api',
        params: {
          page: this.list2Page.page,
          pageSize: this.list2Page.pageSize,
          start_time: formatTime(new Date(this.startTime).getTime()),
          end_time: formatTime(new Date(this.endTime).getTime()),
          coin: this.coin === 'all' ? undefined : this.coin,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.setList2(data.data.mapList);
          this.list2Page.count = data.data.count;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
      // const data = [
      //   { coin: 'USDT', amount_total: '123', amount_return: '13', amount_sub: 123, time: 123 },
      //   { coin: 'USDT', amount_total: '123', amount_return: '13', amount_sub: 123, time: 123 },
      //   { coin: 'USDT', amount_total: '123', amount_return: '13', amount_sub: 123, time: 123 },
      //   { coin: 'USDT', amount_total: '123', amount_return: '13', amount_sub: 123, time: 123 },
      //   { coin: 'USDT', amount_total: '123', amount_return: '13', amount_sub: 123, time: 123 },
      //   { coin: 'USDT', amount_total: '123', amount_return: '13', amount_sub: 123, time: 123 },
      // ]
    },
    setList2(data) {
      this.loading2 = false;
      const arr = [];
      data.forEach((item, index) => {
        const fix = this.getFix(item.coin.toUpperCase());
        arr.push({
          id: index,
          data: [
            item.time ? formatTime(item.time) : '--', // 时间
            item.coin, // 币种
            fixD(item.amount_return, fix), // 直推佣金
            fixD(item.amount_sub, fix), // 子经纪分佣
            fixD(item.amount_total, fix), // 累计佣金
            this.$t('brokerSystem.commissionTable[6]'),
          ],
        });
      });
      this.dataList2 = arr;
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
    startTimeSelect(v) {
      this.startTime = v;
      this.loading2 = true;
      this.list2Page.page = 1;
      this.getList2();
    },
    endTimeSelect(v) {
      this.endTime = v;
      this.loading2 = true;
      this.list2Page.page = 1;
      this.getList2();
    },
    currentType(data) {
      this.currentTab = data.index;
    },
    coinChange(item) {
      this.coin = item.code;
      this.loading2 = true;
      this.list2Page.page = 1;
      this.getList2();
    },
  },
};
