import { getCoinShowName } from '@/utils';

export default {
  methods: {
    setCion(data, type) {
      const showData = getCoinShowName(data, this.symbolAll);
      if (type === 'b') {
        return `/ ${showData.split('/')[1]}`;
      }

      return showData.split('/')[0];
    },
  },
};
