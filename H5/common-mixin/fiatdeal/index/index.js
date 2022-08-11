import { myStorage } from '@/utils';

export default {
  name: 'index',
  computed: {
    userInfo() {
      return this.$store.state.baseData.userInfo || {};
    },
    userCompanyInfo() {
      return this.userInfo.userCompanyInfo || {};
    },

    otcCompanyInfo() {
      return this.userInfo.otcCompanyInfo || {};
    },
    // 申请商户开关
    companyStatus() {
      return Number(this.otcCompanyInfo.status);
    },
    applyStatus() {
      return Number(this.userCompanyInfo.applyStatus);
    },
    // 大宗交易判断开关
    isBigDeal() {
      return Number(this.$store.state.baseData.is_open_bigDeal);
    },
    navList() {
      const arr = [
        {
          iconClass: 'iconClass',
          navText: this.$t('fiatdeal.navList')[0],
          id: 'ordinary',
        },
      ];
      // 大宗交易
      if (this.isBigDeal) {
        arr.push(
          {
            iconClass: 'iconClass',
            navText: this.$t('fiatdeal.navList')[3],
            href: '',
            type: 1,
            activeIconSvg: '<svg class="icon icon-18" aria-hidden="true">'
              + '<use xlink:href="#icon-b_20_1"></use>'
              + '</svg>',
            iconSvg: '<svg class="icon icon-18" aria-hidden="true">'
              + '<use xlink:href="#icon-b_20"></use>'
              + '</svg>',
            id: 'bulk',
          },
        );
      }
      arr.push(
        {
          iconClass: 'iconClass',
          navText: this.$t('fiatdeal.navList')[6],
          href: '',
          type: 1,
          activeIconSvg: '<svg class="icon icon-18" aria-hidden="true">'
            + '<use xlink:href="#icon-b_21_1"></use>'
            + '</svg>',
          iconSvg: '<svg class="icon icon-18" aria-hidden="true">'
            + '<use xlink:href="#icon-b_21"></use>'
            + '</svg>',
          id: 'advertising',
        },
      );
      // 申请商户
      if (this.companyStatus) {
        arr.push(
          {
            iconClass: 'iconClass',
            navText: this.$t('fiatdeal.navList')[7],
            href: '',
            type: 1,
            activeIconSvg: '<svg class="icon icon-18" aria-hidden="true">'
              + '<use xlink:href="#icon-b_22_1"></use>'
              + '</svg>',
            iconSvg: '<svg class="icon icon-18" aria-hidden="true">'
              + '<use xlink:href="#icon-b_22"></use>'
              + '</svg>',
            id: 'companyApplication',
          },
        );
      }
      return arr;
    },
  },
  methods: {
    init() {
      if (this.navList.length) {
        this.navList.forEach((item) => {
          if (this.navListActive === item.id) {
            this.pageTitleText = item.navText;
          }
        });
      }
    },
    listChanges(data) {
      const { applyStatus } = this;
      const companyAppling = myStorage.get('companyAppling');
      if (this.navListActive !== data.id && data.id !== this.clickName) {
        if (data.id === 'ordinary') {
          this.navListActive = 'ordinary';
        } else if (data.id === 'bulk') {
          this.navListActive = 'bulk';
        } else {
          if (data.id === 'advertising') {
            this.$router.push('/otcRelease');
            return;
          }
          if (data.id === 'companyApplication') {
            if (applyStatus === 1 && !companyAppling) {
              this.$router.push('/companyApplicationDetail');
              myStorage.set('companyAppling', true);
            } else {
              this.$router.push('/companyApplication');
            }
            return;
          }
          this.navListActive = data.id;
        }
        const info = {
          side: data.id,
        };
        this.$store.dispatch('sideIsBlockTrade', info);
      }
      this.clickName = data.id;
      this.pageTitleText = data.navText;
      // this.$router.push('/fiatdeal/center');
    },
  },
  data() {
    return {
      clickName: '',
      navListActive: 'ordinary',
      pageTitleText: null,
    };
  },
};
