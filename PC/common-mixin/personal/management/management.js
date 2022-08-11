export default {
  name: 'management',
  computed: {
    // 开启验证方式
    coinsKrwOpen() {
      const { publicInfo } = this.$store.state.baseData;
      let str = '';
      if (publicInfo) {
        if (publicInfo.switch && publicInfo.switch.coins_krw_open) {
          str = publicInfo.switch.coins_krw_open.toString();
        } else {
          str = '0';
        }
      }
      return str;
    },
  },
};
