import { templateConfig } from '@/utils';

export default {
  computed: {
    templateLayoutType() {
      let templates = this.$store.state.baseData.templateLayoutType;
      if (templates !== 0) {
        templates = 1;
      }
      return templateConfig[templates];
    },
  },
};
