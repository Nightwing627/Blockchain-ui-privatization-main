import {
  fixD, imgMap, colorMap, getCoinShowName,
} from '@/utils';

export default {
  name: 'stronger',
  data() {
    return {
      imgMap,
      colorMap,
      loading: false,
      side: 'SELL',
      identity: 0, // 0 为拉黑， 1 被拉黑
      // 弹框
      dialogFlag: false,
      dialogConfirmLoading: false,
      dialogConfirmDisabled: false,
      blackList: 0, // 0 用户本人或未登录， 1 被拉黑， 2 未被拉黑
      uid: '',
      name: '',
      loginStatus: 0, // 在线状态 (1在线，0离线)
      imageUrl: '',
      otcNickName: '',
      completeOrders: '',
      complainNum: '',
      sucComplainNum: '',
      authLevel: '', // 认证状态 0、未审核，1、通过，2、未通过  3、未认证
      mobileAuthStatus: '', // 是否开启了手机认证:0-未开启,1-开启
      // 横向导航参数
      currentTab: 1,
      navTab: [
        {
          name: this.$t('stranger.navTab')[0],
          index: 1,
        },
        {
          name: this.$t('stranger.navTab')[1],
          index: 2,
        },
      ],
      lineHeight: '55',
      marginRight: 48, // 距离右边的距离
      // table 相关
      columns: [
        {
          title: this.$t('stranger.columns')[0],
          align: 'left',
          width: '100px',
          classes: '',
        },
        {
          title: this.$t('stranger.columns')[1],
          align: 'right',
          width: '100px',
          classes: '',
        },
        {
          title: this.$t('stranger.columns')[2],
          align: 'right',
          width: '200px',
          classes: '',
        },
        {
          title: this.$t('stranger.columns')[3],
          align: 'right',
          width: '200px',
          classes: '',
        },
        {
          title: this.$t('stranger.columns')[4],
          align: 'right',
          width: '200px',
          classes: '',
        },
        {
          title: this.$t('stranger.columns')[5],
          align: 'right',
          width: '200px',
          classes: '',
        },
      ],
      dataList: [],
      cellHeight: 55,
      headHeight: 34,
      lineNumber: 10,
      classes: '',
      headClasses: '',
      bodyClasses: '',
      lineClass: '',
      // page相关
      count: 0,
      page: 1,
      pageSize: 10,
    };
  },
  created() {
    this.init();
  },
  computed: {
    otcPersonHomePage() {
      return this.$store.state.fiatdeal.otcPersonHomePage;
    },
    otcPersonAds() {
      return this.$store.state.personal.otcPersonAds;
    },
    otcUserContacts() {
      return this.$store.state.fiatdeal.otcUserContacts;
    },
    otcUserContactsRemove() {
      return this.$store.state.fiatdeal.otcUserContactsRemove;
    },
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
    },
  },
  watch: {
    otcPersonHomePage(otcPersonHomePage) {
      if (otcPersonHomePage !== null) {
        this.name = otcPersonHomePage.data.otcNickName.substring(0, 1);
        this.otcNickName = otcPersonHomePage.data.otcNickName;
        this.loginStatus = otcPersonHomePage.data.loginStatus;
        this.imageUrl = otcPersonHomePage.data.imageUrl;
        this.completeOrders = otcPersonHomePage.data.completeOrders;
        this.complainNum = otcPersonHomePage.data.complainNum;
        this.sucComplainNum = otcPersonHomePage.data.sucComplainNum;
        this.authLevel = otcPersonHomePage.data.authLevel;
        this.mobileAuthStatus = otcPersonHomePage.data.mobileAuthStatus;
        this.blackList = otcPersonHomePage.data.identity;
      }
    },
    otcUserContactsRemove(otcUserContactsRemove) {
      if (otcUserContactsRemove !== null) {
        if (otcUserContactsRemove.text === 'success') {
          this.$bus.$emit('tip', { text: otcUserContactsRemove.msg, type: 'success' });
          this.$store.dispatch('resetType');
          this.$store.dispatch('otcPersonHomePage', { uid: this.uid });
          this.dialogFlag = false;
        } else {
          this.$bus.$emit('tip', { text: otcUserContactsRemove.msg, type: 'error' });
          this.$store.dispatch('resetType');
        }
      }
    },
    otcPersonAds(otcPersonAds) {
      if (otcPersonAds !== null) {
        if (this.publicInfo) {
          this.loading = false;
          // 数据处理
          this.dataProcessin(otcPersonAds.data, this.$store.state.baseData.market);
        }
      }
    },
    otcUserContacts(otcUserContacts) {
      if (otcUserContacts !== null) {
        if (otcUserContacts.text === 'success') {
          this.$bus.$emit('tip', { text: otcUserContacts.msg, type: 'success' });
          this.$store.dispatch('resetType');
          this.$store.dispatch('otcPersonHomePage', { uid: this.uid });
          this.dialogFlag = false;
        } else {
          this.$bus.$emit('tip', { text: otcUserContacts.msg, type: 'error' });
          this.$store.dispatch('resetType');
          this.$bus.$emit('getCode-clear', 'phone');
        }
      }
    },
  },
  methods: {
    init() {
      const { uid } = this.$route.query;
      this.uid = uid;
      this.$store.dispatch('otcPersonHomePage', { uid });
      const info = {
        uid: this.uid,
        page: this.page,
        pageSize: this.pageSize,
        adType: 'BUY',
      };
      this.$store.dispatch('otcPersonAds', info);
      this.loading = true;
      const infoData = { relationType: 'BLACKLIST', pageSize: 10000, page: 1 };
      this.$store.dispatch('otcPersonRelationship', infoData);
    },
    dataProcessin(data, market) {
      this.count = data.count;
      const list = [];
      data.adList.forEach((obj) => {
        list.push(
          {
            id: [this.uid, obj.advertId],
            data: [
              getCoinShowName(obj.coin, market.coinList),
              fixD(obj.volume, market.coinList[obj.coin].showPrecision),
              `${fixD(obj.minTrade, market.coinList[obj.coin].fiatPrecision[obj.payCoin.toLowerCase()] ? Number(market.coinList[obj.coin].fiatPrecision[obj.payCoin.toLowerCase()]) : this.$store.state.baseData.defaultFiatPrecision)} -
              ${fixD(obj.maxTrade, market.coinList[obj.coin].fiatPrecision[obj.payCoin.toLowerCase()] ? Number(market.coinList[obj.coin].fiatPrecision[obj.payCoin.toLowerCase()]) : this.$store.state.baseData.defaultFiatPrecision)} ${obj.payCoin}`,
              fixD(obj.price,
                market.coinList[obj.coin].fiatPrecision[obj.payCoin.toLowerCase()]
                  ? Number(market.coinList[obj.coin].fiatPrecision[obj.payCoin.toLowerCase()])
                  : this.$store.state.baseData.defaultFiatPrecision) + obj.payCoin,
              [
                {
                  type: 'icon',
                  iconSvg: `<ul>
                    ${this.paymentsList(obj.payments).join('')}
                </ul>`,
                  classes: 'payments-ul',
                },
              ],
              [
                {
                  type: 'button', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                  text: this.textShow(obj.side),
                  iconClass: [''],
                  eventType: 'close',
                  classes: [''],
                },
              ],
            ],
          },
        );
      });
      this.dataList = list;
    },
    textShow(side) {
      let text = '';
      if (this.blackList === 0) {
        text = this.$t('stranger.view');
      } else {
        text = (side === 'SELL') ? this.$t('stranger.buy') : this.$t('stranger.sell');
      }
      return text;
    },
    paymentsList(data) {
      const list = [];
      data.forEach((obj) => {
        list.push(`<li class='a-2-bg'><img src="${obj.icon}"/></li>`);
      });
      return list;
    },
    blackClick() {
      this.dialogFlag = true;
    },
    dialogClose() {
      this.dialogFlag = false;
    },
    dialogConfirm() {
      if (this.blackList === 1) { // 移除
        const info = { friendId: this.uid };
        this.$store.dispatch('otcUserContactsRemove', info);
      } else { // 加入黑名单
        const info = { otherUid: this.uid, relationType: 'BLACKLIST' };
        this.$store.dispatch('otcUserContacts', info);
      }
    },
    currentType(data) {
      this.loading = true;
      this.currentTab = data.index;
      this.page = 1;
      if (this.currentTab === 1) {
        this.side = 'BUY';
        const info = {
          uid: this.uid,
          page: this.page,
          pageSize: this.pageSize,
          adType: 'BUY',
        };
        this.$store.dispatch('otcPersonAds', info);
      } else {
        this.side = 'SELL';
        const info = {
          uid: this.uid,
          page: this.page,
          pageSize: this.pageSize,
          adType: 'SELL',
        };
        this.$store.dispatch('otcPersonAds', info);
      }
    },
    operation(type, id) {
      if (type === 'close') {
        this.$router.push({ path: '/otcTrade?', query: { orderId: id[1], userId: id[0] } });
      }
    },
    pagechange(page) {
      this.page = page;
      const info = {
        uid: this.uid,
        page: this.page,
        pageSize: this.pageSize,
        adType: this.side,
      };
      this.$store.dispatch('otcPersonAds', info);
    },
  },
};
