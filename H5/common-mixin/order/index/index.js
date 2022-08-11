export default {
  name: 'order',
  data() {
    return {
      navListActive: 'exchangeOrder',
      pageTitleText: null,
    };
  },
  methods: {
    init() {
      this.$bus.$emit('PAGE-TOP-TITLE', '订单中心');
      this.navListActive = this.$route.meta.navName;
      if (this.navList.length) {
        this.navList.forEach((item) => {
          if (this.navListActive === item.id) {
            this.pageTitleText = item.navText;
          }
        });
      }
    },
    bottomNavClick(data) {
      this.$router.push(data.id);
      this.navListActive = data.id;
      this.pageTitleText = data.navText;
    },
  },
  watch: {
    metaText(v) {
      this.navListActive = v;
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
    publicInfo() { return this.$store.state.baseData.publicInfo; },
    saasOtcFlowConfig() {
      let flag = false;
      if (this.publicInfo && this.publicInfo.switch
        && this.publicInfo.switch.saas_otc_flow_config
        && this.publicInfo.switch.saas_otc_flow_config.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    navList() {
      const arr = [];
      if (this.linkurl.mexUrl) {
        // 币币订单
        arr.push({
          iconClass: 'iconClass',
          navText: this.$t('order.index.exOrder'),
          href: '',
          type: 1,
          activeIconSvg: `<svg class="icon icon-18" aria-hidden="true">
            <use xlink:href="#icon-b_7_1"></use>
          </svg>`,
          iconSvg: `<svg class="icon icon-18" aria-hidden="true">
            <use xlink:href="#icon-b_7"></use>
          </svg>`,
          id: 'exchangeOrder',
        });
      }
      // 法币订单
      if (this.linkurl.motcUrl || this.saasOtcFlowConfig) {
        arr.push({
          iconClass: 'iconClass',
          navText: !this.fiatTradeOpen
            ? this.$t('order.index.otcOrder')
            : this.$t('assets.b2c.otcShow.otcOrder'),
          href: '',
          type: 1,
          activeIconSvg: `<svg class="icon icon-18" aria-hidden="true">
            <use xlink:href="#icon-b_8_1"></use>
          </svg>`,
          iconSvg: `<svg class="icon icon-18" aria-hidden="true">
            <use xlink:href="#icon-b_8"></use>
          </svg>`,
          id: 'otcOrder',
        });
      }
      // 合约订单',
      if (this.linkurl.mcoUrl) {
        arr.push({
          iconClass: 'iconClass',
          navText: this.$t('order.coOrder.coOrder'),
          href: '',
          type: 1,
          activeIconSvg: `<svg class="icon icon-18" aria-hidden="true">
            <use xlink:href="#icon-b_27_1"></use>
          </svg>`,
          iconSvg: `<svg class="icon icon-18" aria-hidden="true">
            <use xlink:href="#icon-b_27"></use>
          </svg>`,
          id: 'coOrder',
        });
      }

      // 杠杆订单
      if (this.leverOpen === '1') {
        arr.push({
          iconClass: 'iconClass',
          navText: this.$t('order.index.leverage'),
          href: '',
          type: 1,
          activeIconSvg: `<svg class="icon icon-18" aria-hidden="true">
            <use xlink:href="#icon-b_25_1"></use>
          </svg>`,
          iconSvg: `<svg class="icon icon-18" aria-hidden="true">
            <use xlink:href="#icon-b_25"></use>
          </svg>`,
          id: 'leverageOrder',
        });
      }
      return arr;
    },
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    metaText() { return this.$route.meta.navName; },
    leverOpen() {
      const { publicInfo } = this.$store.state.baseData;
      let str = '0';
      if (publicInfo && publicInfo.switch && publicInfo.switch.lever_open) {
        str = publicInfo.switch.lever_open.toString();
      }
      return str;
    },
  },
};
