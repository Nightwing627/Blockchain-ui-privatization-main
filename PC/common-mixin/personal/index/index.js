export default {
  name: 'personal',
  data() {
    return {
      navListActive: 'userManagement',
      pageTitleText: null,
      coAgentFlag: false,
    };
  },
  methods: {
    init() {
      this.navListActive = this.$route.meta.navName;
      if (this.navList.length) {
        this.navList.forEach((item) => {
          if (this.navListActive === item.id) {
            this.pageTitleText = item.navText;
          }
        });
      }
      if (this.coinsKrwOpen === '1') {
        this.krwGetUserBack();
      }
      // this.getCoAgentFlag();
    },
    getCoAgentFlag() {
      this.axios({
        url: 'common/public',
        hostType: 'fe-increment-api',
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.coAgentFlag = data.data.coAgentStatus;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    listChanges(data) {
      this.navListActive = data.id;
      this.pageTitleText = data.navText;
      this.$router.push(`/personal/${data.id}`);
      this.$store.dispatch('setModifyApiShow', false);
    },
    // 获取当前用户的银行账号 -- krw定制
    krwGetUserBack() {
      this.$store.dispatch('krwGetUserBank');
    },
  },
  computed: {
    fiatTradeOpen() {
      const base = this.$store.state.baseData.publicInfo;
      if (base && base.switch && base.switch.fiat_trade_open === '1') {
        return true;
      }
      return false;
    },
    templateLayoutType() {
      return this.$store.state.baseData.templateLayoutType;
    },
    lineHidth1() {
      if (this.templateLayoutType === '2') {
        return '80';
      }
      return '56';
    },
    subLineHidth() {
      if (this.templateLayoutType === '2') {
        return '60';
      }
      return '56';
    },
    coinsKrwOpen() {
      const { publicInfo } = this.$store.state.baseData;
      let str = '0';
      if (publicInfo && publicInfo.switch && publicInfo.switch.coins_krw_open) {
        str = publicInfo.switch.coins_krw_open.toString();
      }
      return str;
    },
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    navList() {
      const arr = [
        {
          iconClass: 'iconClass',
          navText: this.$t('personal.navMenu.list.userManagement'),
          href: '',
          type: 1,
          activeIconSvg:
            '<svg class="icon icon-18" aria-hidden="true">'
            + '<use xlink:href="#icon-b_9_1"></use>'
            + '</svg>',
          iconSvg:
            '<svg class="icon icon-18" aria-hidden="true">'
            + '<use xlink:href="#icon-b_9"></use>'
            + '</svg>',
          id: 'userManagement',
        },
        {
          iconClass: 'iconClass',
          navText: this.$t('personal.navMenu.list.safetyRecord'),
          href: '',
          type: 2,
          activeIconSvg: '',
          iconSvg: '',
          id: 'safetyRecord',
        },
      ];
      if (this.linkurl.otcUrl) {
        arr.push(
          {
            iconClass: 'iconClass',
            navText: this.fiatTradeOpen
              ? this.$t('assets.b2c.otcShow.leaglTenderSet')
              : this.$t('personal.navMenu.list.leaglTenderSet'),
            href: '',
            type: 1,
            activeIconSvg:
              '<svg class="icon icon-18" aria-hidden="true">'
              + '<use xlink:href="#icon-b_10_1"></use>'
              + '</svg>',
            iconSvg:
              '<svg class="icon icon-18" aria-hidden="true">'
              + '<use xlink:href="#icon-b_10"></use>'
              + '</svg>',
            id: 'leaglTenderSet',
          },
          {
            iconClass: 'iconClass',
            navText: this.$t('personal.navMenu.list.advertisingManagement'),
            href: '',
            type: 2,
            activeIconSvg: '',
            iconSvg: '',
            id: 'advertisingManagement',
          },
          {
            iconClass: 'iconClass',
            navText: this.$t('personal.navMenu.list.blackList'),
            href: '',
            type: 2,
            activeIconSvg: '',
            iconSvg: '',
            id: 'blackList',
          },
        );
      }
      arr.push({
        iconClass: 'iconClass',
        navText: this.$t('personal.navMenu.list.apiManagement'),
        href: '',
        type: 1,
        activeIconSvg:
          '<svg class="icon icon-18" aria-hidden="true">'
          + '<use xlink:href="#icon-b_12_1"></use>'
          + '</svg>',
        iconSvg:
          '<svg class="icon icon-18" aria-hidden="true">'
          + '<use xlink:href="#icon-b_12"></use>'
          + '</svg>',
        id: 'apiManagement',
      });
      // 现货经纪人
      if (this.userInfo && this.userInfo.agentStatus === 1) {
        arr.push({
          iconClass: 'iconClass',
          navText: this.$t('brokerSystem.overviewTitle[2]'),
          href: '',
          type: 1,
          activeIconSvg: `<svg class="icon icon-18" aria-hidden="true">
            <use xlink:href="#icon-b_23_1"></use>
          </svg>`,
          iconSvg: `<svg class="icon icon-18" aria-hidden="true">
            <use xlink:href="#icon-b_23"></use>
          </svg>`,
          id: 'exBroker',
        });
      }
      // 合约经纪人
      if (this.coAgentFlag) {
        arr.push({
          iconClass: 'iconClass',
          navText: this.$t('brokerSystem.overviewTitle[3]'),
          href: '',
          type: 1,
          activeIconSvg:
            '<svg class="icon icon-18" aria-hidden="true">'
            + '<use xlink:href="#icon-b_43_1"></use>'
            + '</svg>',
          iconSvg:
            '<svg class="icon icon-18" aria-hidden="true">'
            + '<use xlink:href="#icon-b_43"></use>'
            + '</svg>',
          id: 'brokerSystem',
        });
      }
      return arr;
    },
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
    },
    userInfo() { return this.$store.state.baseData.userInfo; },
    metaText() {
      return this.$route.meta.navName;
    },
  },
  watch: {
    coinsKrwOpen(v) {
      if (v === '1') {
        this.krwGetUserBack();
      }
    },
    metaText(metaText) {
      this.navListActive = metaText;
    },
  },
};
