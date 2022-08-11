import appMixin from '../app-mixin';

export default {
  mixins: [appMixin],
  created() {
    this.createInit();
  },
};
