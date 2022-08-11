import countryMinix from '../../../../PC/common-mixin/countryList/countryList';

export default {
  name: 'personal',
  mixins: [countryMinix],
  methods: {
    listChanges(data) {
      this.$router.push(`/personal/${data.id}`);
      this.$store.dispatch('setModifyApiShow', false);
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
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    navList() {
      const arr = [
        // 账号管理
        {
          navText: this.$t('personal.navMenu.list.userManagement'),
          id: 'userManagement',
        },
      ];
      if (this.linkurl.motcUrl) {
        arr.push({
          // 法币设置
          navText: this.fiatTradeOpen
            ? this.$t('assets.b2c.otcShow.leaglTenderSet')
            : this.$t('personal.navMenu.list.leaglTenderSet'),
          id: 'leaglTenderSet',
        });
      }
      // api管理
      arr.push({
        navText: this.$t('personal.navMenu.list.apiManagement'),
        id: 'apiManagement',
      });
      return arr;
    },
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
    },
    routeMeta() { return this.$route.meta; },
    navListActive() { return this.$route.meta.h5NavName; },
    haveNav() { return this.$route.meta.haveNav; },
  },
};
