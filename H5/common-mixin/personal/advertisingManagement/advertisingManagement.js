import { formatTime, fixD } from '@/utils';

export default {
  name: 'advertisingManagement',
  watch: {
    otcPersonAds(otcPersonAds) {
      if (otcPersonAds !== null) {
        if (this.publicInfo) {
          this.loading = false;
          this.count = otcPersonAds.data.count;
          this.dataProcessin(otcPersonAds.data.adList, this.$store.state.baseData.market);
          if (Math.ceil(parseFloat(otcPersonAds.data.count) / parseFloat(this.pageSize))
            > this.page) {
            this.pullUpState = 0;
          } else {
            this.pullUpState = 3;
          }
        }
      }
    },
    otcCloseWanted(otcCloseWanted) {
      if (otcCloseWanted !== null) {
        this.dialogConfirmLoading = false;
        if (otcCloseWanted.text === 'success') {
          this.$bus.$emit('tip', { text: otcCloseWanted.msg, type: 'success' });
          this.dataList = [];
          this.page = 1;
          this.$store.dispatch('resetType');
          if (this.currentTab === 1) {
            const info = {
              uid: this.uid,
              pageSize: this.pageSize,
              page: this.page,
              adType: 'buy',
            };
            this.$store.dispatch('otcPersonAds', info);
          } else {
            const info = {
              uid: this.uid,
              pageSize: this.pageSize,
              page: this.page,
              adType: 'sell',
            };
            this.$store.dispatch('otcPersonAds', info);
          }
          this.dialogFlag = false;
        } else {
          this.$bus.$emit('tip', { text: otcCloseWanted.msg, type: 'error' });
          this.$store.dispatch('resetType');
          this.$bus.$emit('getCode-clear', 'phone');
        }
      }
    },
    userInfo(userInfo) {
      if (userInfo) {
        this.uid = userInfo.id;
        const info = { uid: this.uid, pageSize: this.pageSize, page: this.page };
        this.$store.dispatch('otcPersonAds', info);
      }
    },
  },
  computed: {
    navList() {
      return [
        {
          // 收款管理
          text: this.$t('personal.leaglTenderSet.title'),
          link: '/personal/leaglTenderSet',
        },
        {
          // 广告管理
          text: this.$t('personal.navMenu.list.advertisingManagement'),
          active: true,
          link: '/personal/advertisingManagement',
        },
        {
          // 黑名单
          text: this.$t('personal.navMenu.list.blackList'),
          link: '/personal/blackList',
        },
      ];
    },
    baseData() { return this.$store.state.baseData; },
    otcPersonAds() {
      return this.$store.state.personal.otcPersonAds;
    },
    otcCloseWanted() {
      return this.$store.state.personal.otcCloseWanted;
    },
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
    },
    otcLinkUrl() {
      const obj = {
        url: '',
        type: '', // 1为push 2为herf
      };
      // 开发
      if (process.env.NODE_ENV === 'development') {
        obj.url = '';
        obj.type = '1';
        // 线上
      } else if (window.HOSTAPI === 'ex' && this.baseData.publicInfo) {
        obj.url = this.$store.state.baseData.publicInfo.url.motcUrl;
        obj.type = '2';
      } else if (window.HOSTAPI === 'otc') {
        obj.url = '';
        obj.type = '1';
      }
      return obj;
    },
  },
  data() {
    return {
      pullUpState: 0,
      // table loading
      titleText: this.$t('personal.dialog.closeAd'),
      loading: false,
      // uid
      uid: '',
      // 横向导航参数
      currentTab: 1,
      navTab: [
        {
          name: this.$t('personal.advertisingManagement.navTab')[0],
          index: 1,
        },
        {
          name: this.$t('personal.advertisingManagement.navTab')[1],
          index: 2,
        },
      ],
      // table相关
      columns: [
        {
          title: this.$t('personal.advertisingManagement.columns')[0],
          align: 'left',
          width: '120px',
          classes: '',
        },
        {
          title: this.$t('personal.advertisingManagement.columns')[1],
          align: 'right',
          width: '100px',
        },
        {
          title: this.$t('personal.advertisingManagement.columns')[3],
          align: 'right',
          width: '150px',
        },
        {
          title: this.$t('personal.advertisingManagement.columns')[4],
          align: 'right',
          width: '100px',
        },
        {
          title: this.$t('personal.advertisingManagement.columns')[5],
          align: 'right',
          width: '100px',
        },
      ],
      dataList: [],
      cellHeight: 55,
      headHeight: 30,
      lineNumber: 10,
      classes: '',
      headClasses: '',
      bodyClasses: '',
      lineClass: '',
      // page相关
      count: 0,
      page: 1,
      pageSize: 10,
      // 弹框相关
      dialogFlag: false,
      dialogConfirmLoading: false,
      dialogConfirmDisabled: false,
      // 要关闭的广告id
      advertId: '',
    };
  },
  methods: {
    init() {
      const { userInfo } = this.$store.state.baseData;
      if (userInfo !== null) {
        this.loading = true;
        this.uid = userInfo.id;
        const info = { uid: this.uid, pageSize: this.pageSize, page: this.page };
        this.$store.dispatch('otcPersonAds', info);
      }
    },
    getData() {
      if (this.currentTab === 1) {
        const info = {
          uid: this.uid,
          pageSize: this.pageSize,
          page: this.page,
          adType: 'buy',
        };
        this.$store.dispatch('otcPersonAds', info);
      } else {
        const info = {
          uid: this.uid,
          pageSize: this.pageSize,
          page: this.page,
          adType: 'sell',
        };
        this.$store.dispatch('otcPersonAds', info);
      }
    },
    // 下拉刷新
    onRefresh(done) {
      this.dataList = [];
      this.loading = true;
      this.page = 1;
      this.getData();
      done();
    },
    onInfiniteLoads(done) {
      if (this.pullUpState === 0) {
        this.pullUpState = 2;
        this.page += 1;
        this.getData();
      }
      done();
    },
    dataProcessin(list, market) {
      const dataList = [];
      if (list !== null) {
        list.forEach((obj) => {
          dataList.push(
            {
              id: [obj.advertId, this.uid],
              title: [
                {
                  text: obj.coin,
                },
              ],
              handle: [
                {
                  type: 'button',
                  text: this.$t('personal.tool.view'),
                  iconClass: [''],
                  eventType: 'view',
                  classes: '',
                },
                {
                  // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                  type: this.typeShow(obj.status),
                  text: this.showText(obj.status),
                  iconClass: [''],
                  eventType: this.eventType(obj.status),
                  classes: [this.showClasses(obj.status)],
                },
              ],
              data: [
                formatTime(obj.createTime),
                obj.advertId,
                fixD(obj.price, market.coinList[obj.coin].fiatPrecision[obj.payCoin.toLowerCase()]
                  ? Number(market.coinList[obj.coin].fiatPrecision[obj.payCoin.toLowerCase()])
                  : this.$store.state.baseData.defaultFiatPrecision) + obj.payCoin,
                fixD(obj.volume, market.coinList[obj.coin].showPrecision),
                this.stateHand(obj.status),
              ],
            },
          );
        });
        this.dataList = [...[], ...this.dataList, ...dataList];
      }
    },
    currentType(data) {
      this.currentTab = data.index;
      this.dataList = [];
      this.page = 1;
      this.loading = true;
      if (this.currentTab === 1) {
        const info = {
          uid: this.uid,
          pageSize: this.pageSize,
          page: this.page,
          adType: 'buy',
        };
        this.$store.dispatch('otcPersonAds', info);
      } else {
        const info = {
          uid: this.uid,
          pageSize: this.pageSize,
          page: this.page,
          adType: 'sell',
        };
        this.$store.dispatch('otcPersonAds', info);
      }
    },
    closeData(type, data) {
      const { id } = data;
      if (type === 'close') {
        [this.dialogFlag, this.advertId] = [true, id[0]];
      } else if (type === 'view') {
        if (this.otcLinkUrl.type === '1') {
          this.$router.push(`${this.otcLinkUrl.url}/otcTrade?orderId=${id[0]}&userId=${id[1]}`);
        } else if (this.otcLinkUrl.type === '2') {
          window.location.href = `${this.otcLinkUrl.url}/otcTrade?orderId=${id[0]}&userId=${id[1]}`;
        }
      }
    },
    dialogClose() {
      this.dialogFlag = false;
    },
    dialogConfirm() {
      this.dialogConfirmLoading = true;
      const info = { advertId: this.advertId };
      this.$store.dispatch('otcCloseWanted', info);
    },
    pagechange(page) {
      this.page = page;
      let adType = 'buy';
      if (this.currentTab !== 1) {
        adType = 'sell';
      }
      const info = {
        uid: this.uid,
        pageSize: this.pageSize,
        page: this.page,
        adType,
      };
      this.$store.dispatch('otcPersonAds', info);
    },
    stateHand(num) {
      switch (num) {
        case 1:
          return this.$t('personal.state.release');
        case 2:
          return this.$t('personal.state.trading');
        case 3:
          return this.$t('personal.state.overdue');
        default:
          return this.$t('personal.state.close');
      }
    },
    showText(num) {
      switch (num) {
        case 1:
          return this.$t('personal.state.close');
        case 2:
          return this.$t('personal.state.trading');
        case 3:
          return this.$t('personal.state.overdue');
        default:
          return this.$t('personal.state.closed');
      }
    },
    eventType(num) {
      switch (num) {
        case 1:
          return 'close';
        default:
          return '';
      }
    },
    showClasses(num) {
      switch (num) {
        case 1:
          return '';
        default:
          return 'b-2-cl banned-click';
      }
    },
    typeShow(num) {
      switch (num) {
        case 1:
          return 'button';
        default:
          return 'label';
      }
    },
  },
};
