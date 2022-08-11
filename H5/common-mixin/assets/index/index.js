export default {
  name: 'assets',
  data() {
    return {
      navListActive: 'exchangeAccount',
      pageTitleText: null,
    };
  },
  methods: {
    init() {
      this.navListActive = this.$route.meta.h5NavName;
      if (this.navList.length) {
        this.navList.forEach((item) => {
          if (this.navListActive === item.id) {
            this.pageTitleText = item.navText;
          }
        });
      }
    },
    listChanges(data) {
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
    templateLayoutType() {
      return this.$store.state.baseData.templateLayoutType;
    },
    fiatTradeOpen() {
      const base = this.$store.state.baseData.publicInfo;
      if (base && base.switch && base.switch.fiat_trade_open === '1') {
        return true;
      }
      return false;
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
    // 开启验证方式
    coinsKrwOpen() {
      const { publicInfo } = this.$store.state.baseData;
      let str = '0';
      if (publicInfo && publicInfo.switch && publicInfo.switch.fiat_open) {
        str = publicInfo.switch.fiat_open.toString();
      }
      return str;
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
      let arr = [
        // 币币账户
        {
          iconClass: 'iconClass',
          navText: this.$t('assets.index.exchangeAccount'),
          href: '',
          type: 1,
          activeIconSvg: `<svg class="icon icon-18" aria-hidden="true">
            <use xlink:href="#icon-b_5_1"></use>
          </svg>`,
          iconSvg: `<svg class="icon icon-18" aria-hidden="true">
            <use xlink:href="#icon-b_5"></use>
          </svg>`,
          id: 'exchangeAccount',
        },
      ];
      const otcArr = [
        // 法币账户
        {
          iconClass: 'iconClass',
          navText: !this.fiatTradeOpen
            ? this.$t('assets.index.otcAccount')
            : this.$t('assets.b2c.otcShow.otcAccount'),
          href: '',
          type: 1,
          activeIconSvg: `<svg class="icon icon-18" aria-hidden="true">
            <use xlink:href="#icon-b_6_1"></use>
          </svg>`,
          iconSvg: `<svg class="icon icon-18" aria-hidden="true">
            <use xlink:href="#icon-b_6"></use>
          </svg>`,
          id: 'otcAccount',
        },
      ];
      // 韩国法币
      // const backOtcArr = [
      //   {
      //     iconClass: 'iconClass',
      //     navText: !this.fiatTradeOpen
      //       ? this.$t('assets.index.otcAccount')
      //       : this.$t('assets.b2c.otcShow.otcAccount'),
      //     href: '',
      //     type: 1,
      //     activeIconSvg: `<svg class="icon icon-18" aria-hidden="true">
      //       <use xlink:href="#icon-b_5_1"></use>
      //     </svg>`,
      //     iconSvg: `<svg class="icon icon-18" aria-hidden="true">
      //       <use xlink:href="#icon-b_5"></use>
      //     </svg>`,
      //     id: 'krwAccount',
      //   },
      // ];
      if (this.coinsKrwOpen === '1') {
        // arr = [...arr, ...backOtcArr];
      }
      if (this.linkurl.motcUrl || this.saasOtcFlowConfig) {
        arr = arr.concat(otcArr);
      }
      // b2c法币
      const b2cOtcArr = [
        {
          iconClass: 'iconClass',
          navText: this.$t('assets.index.otcAccount'),
          href: '',
          type: 1,
          activeIconSvg: `<svg class="icon icon-18" aria-hidden="true">
            <use xlink:href="#icon-b_5_1"></use>
          </svg>`,
          iconSvg: `<svg class="icon icon-18" aria-hidden="true">
            <use xlink:href="#icon-b_5"></use>
          </svg>`,
          id: 'b2cAccount',
        },
      ];
      if (this.fiatTradeOpen) {
        arr = [...arr, ...b2cOtcArr];
      }
      if (this.linkurl.mcoUrl) {
        arr = [
          ...arr,
          ...[
            {
              iconClass: 'iconClass',
              navText: this.$t('assets.index.coAccount'),
              href: '',
              type: 1,
              activeIconSvg: `<svg class="icon icon-18" aria-hidden="true">
                <use xlink:href="#icon-b_23_1"></use>
              </svg>`,
              iconSvg: `<svg class="icon icon-18" aria-hidden="true">
                <use xlink:href="#icon-b_23"></use>
              </svg>`,
              id: 'coAccount',
            },
            // 资金流水
            // {
            //   iconClass: 'iconClass',
            //   navText: this.$t('assets.index.otcFlowingWater'),
            //   href: '',
            //   type: 2,
            //   id: 'coFlowingWater',
            // },
          ],
        ];
      }
      if (this.leverOpen === '1') {
        const leverageArr = [
          {
            iconClass: 'iconClass',
            navText: this.$t('assets.index.leverage'),
            href: '',
            type: 1,
            activeIconSvg: `<svg class="icon icon-18" aria-hidden="true">
              <use xlink:href="#icon-b_24_1"></use>
            </svg>`,
            iconSvg: `<svg class="icon icon-18" aria-hidden="true">
              <use xlink:href="#icon-b_24"></use>
            </svg>`,
            id: 'leverageAccount',
          },
          // 资金流水
          // {
          //   iconClass: 'iconClass',
          //   navText: this.$t('assets.index.otcFlowingWater'),
          //   href: '',
          //   type: 2,
          //   id: 'lerverageFlowingWater',
          // },
        ];
        arr = [...arr, ...leverageArr];
      }

      return arr;
    },
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    newcoinOpen() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.switch.newcoinOpen;
      }
      return null;
    },
    metaText() { return this.$route.meta.h5NavName; },
    loginFlag() {
      const { isLogin, userInfoIsReady } = this.$store.state.baseData;
      if (isLogin && userInfoIsReady) {
        return false;
      }
      return true;
    },
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
