import { imgMap } from '@/utils';

export default {
  data() {
    return {
      imgMap,
      inviteUrl: '',
    };
  },
  computed: {
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    // 是否开启红包
    openType() {
      const { publicInfo } = this.$store.state.baseData;
      if (publicInfo && publicInfo.switch
      && publicInfo.switch.red_packet_open
      && publicInfo.switch.red_packet_open.toString() === '1') {
        return true;
      }
      return false;
    },
  },
  watch: {
    userInfo: {
      immediate: true,
      handler(v) {
        if (v) {
          this.userInfoReady();
        }
      },
    },
  },
  methods: {
    userInfoReady() {
      this.inviteUrl = this.userInfo.inviteUrl;
    },
    copy() {
      // this.$bus.$emit('tip', { text: this.$t('personal.prompt.copySucces'), type: 'success' });
      const save = (e) => {
        e.clipboardData.setData('text/plain', this.inviteUrl); // 下面会说到clipboardData对象
        e.preventDefault(); // 阻止默认行为
      };
      document.addEventListener('copy', save);
      document.execCommand('copy'); // 使文档处于可编辑状态，否则无效
      document.removeEventListener('copy', save);
      this.$bus.$emit('tip', { text: this.$t('personal.prompt.copySucces'), type: 'success' });
    },
  },
};
