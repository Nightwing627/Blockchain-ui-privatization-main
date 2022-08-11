import { imgMap } from '@/utils';

export default {
  methods: {
    goRegister() {
      if (this.registerInfo) {
        if (this.registerInfo.indexOf('@') > -1) {
          this.$router.push(`/register?email=${this.registerInfo}`);
        } else {
          this.$router.push(`/register?phone=${this.registerInfo}`);
        }
      }
    },
  },
  data() {
    return {
      inputStyle: 'text-indent:20px;width:286px;',
      omBottombg: imgMap.om_bottombg,
      newImg: imgMap.om_new,
      omGg: imgMap.om_gg,
    };
  },
  computed: {
    registerPlace() {
      return this.$t('europe.regester.placeHolder');
    },
  },
};
