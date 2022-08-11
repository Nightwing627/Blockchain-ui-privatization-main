import appMixin from '../app-mixin';

export default {
  mixins: [appMixin],
  created() {
    this.coInit();
  },
  mounted() {
    this.createInit('co');
  },
};
