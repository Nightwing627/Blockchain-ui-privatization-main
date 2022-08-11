
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
      this.navListActive = this.$route.meta.navName;
      if (this.navList.length) {
        this.navList.forEach((item) => {
          if (this.navListActive === item.id) {
            this.pageTitleText = item.navText;
          }
        });
      }
    },
    listChanges(data) {
      if ((data.id === 'coFlowingWater' || data.id === 'coAccount') && window.HOSTAPI !== 'co') {
        const paths = this.$route.path.split('/');
        paths[paths.length - 1] = data.id;
        window.location.href = `${this.linkurl.coUrl}${paths.join('/')}`;
      } else {
        this.$router.push(data.id);
        this.navListActive = data.id;
        this.pageTitleText = data.navText;
      }
    },
  },
  watch: {
    metaText(v) {
      this.navListActive = v;
    },
  },
  computed: {
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
    isCoOpen() {
      const base = this.$store.state.baseData.publicInfo;
      if (base && base.switch && base.switch.indep_co_switch === '1') {
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
      return this.$store.state.baseData.fiat_open;
    },
    navList() {
      let arr = [
        // 币币账户
        {
          iconClass: 'iconClass',
          navText: this.isCoOpen ? this.$t('assets.index.coExchangeAccount') : this.$t('assets.index.exchangeAccount'),
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
        // 资金流水
        {
          iconClass: 'iconClass',
          navText: this.$t('assets.index.flowingWater'),
          href: '',
          type: 2,
          id: 'flowingWater',
        },
        // 地址管理
        {
          iconClass: 'iconClass',
          navText: this.$t('assets.index.addressMent'),
          href: '',
          type: 2,
          id: 'addressMent',
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
        // 资金流水
        {
          iconClass: 'iconClass',
          navText: this.$t('assets.index.otcFlowingWater'),
          href: '',
          type: 2,
          id: 'otcFlowingWater',
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
      //   // 资金流水
      //   {
      //     iconClass: 'iconClass',
      //     navText: this.$t('assets.index.otcFlowingWater'),
      //     href: '',
      //     type: 2,
      //     id: 'krwFlowingWater',
      //   },
      // ];
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
        // 资金流水
        {
          iconClass: 'iconClass',
          navText: this.$t('assets.index.otcFlowingWater'),
          href: '',
          type: 2,
          id: 'b2cFlowingWater',
        },
      ];
      if (this.fiatTradeOpen) {
        arr = [...arr, ...b2cOtcArr];
      }
      // if (this.coinsKrwOpen === 1) {
      //   arr = [...arr, ...backOtcArr];
      // }
      if (this.linkurl.otcUrl || this.saasOtcFlowConfig) {
        arr = arr.concat(otcArr);
      }
      // 币宝账户
      if (this.is_deposit_open) {
        arr = [
          ...arr,
          ...[
            {
              iconClass: 'iconClass',
              navText: this.$t('assets.index.bibaoAccount'),
              href: '',
              type: 1,
              activeIconSvg: `<svg class="icon icon-18" aria-hidden="true">
                <use xlink:href="#icon-b_23_1"></use>
              </svg>`, // 更换图标
              iconSvg: `<svg class="icon icon-18" aria-hidden="true">
                <use xlink:href="#icon-b_23"></use>
              </svg>`,
              id: 'bibaoAccount',
            },
            // 查看详情
            {
              iconClass: 'iconClass',
              navText: this.$t('assets.index.detail'),
              href: '',
              type: 2,
              id: 'bibaoDetail',
            },
          ],
        ];
      }
      if (this.linkurl.coUrl) {
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
            {
              iconClass: 'iconClass',
              navText: this.$t('assets.index.otcFlowingWater'),
              href: '',
              type: 2,
              id: 'coFlowingWater',
            },
          ],
        ];
      }
      if (this.leverOpen === 1) {
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
          {
            iconClass: 'iconClass',
            navText: this.$t('assets.index.otcFlowingWater'),
            href: '',
            type: 2,
            id: 'lerverageFlowingWater',
          },
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
    is_deposit_open() {
      return this.$store.state.baseData.is_deposit_open;
    },
    newcoinOpen() {
      return this.$store.state.baseData.newcoinOpen;
    },
    metaText() { return this.$route.meta.navName; },
    loginFlag() {
      const { isLogin, userInfoIsReady } = this.$store.state.baseData;
      if (isLogin && userInfoIsReady) {
        return false;
      }
      return true;
    },
    leverOpen() {
      return this.$store.state.baseData.lever_open;
    },
  },
};
