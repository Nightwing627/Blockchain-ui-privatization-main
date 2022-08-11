import { templateConfig } from '@/utils';

export default {
  computed: {
    index_international_open() {
      // 0: 'china',
      // 1: 'international',
      // 2: 'biki',
      // 3: 'momo',
      // 4: 'japanese',
      // 5: 'korea',
      // 6: 'europe',
      // 7: 'bidesk',
      // 8: 'bitWind',
      let templates = this.$store.state.baseData.index_international_open;
      if (templates === 7) {
        templates = 1;
      }
      return templateConfig[templates];
    },
    swiperFlag() {
      return this.$store.state.baseData.swiperFlag;
    },
  },
};
