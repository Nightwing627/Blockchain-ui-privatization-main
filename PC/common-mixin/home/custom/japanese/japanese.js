import { imgMap } from '@/utils';

export default {
  data() {
    return {
      productImg: `background:url(${imgMap.japa_product}) 0 0 no-repeat;`,
      imgCoin: imgMap.japa_top_coin,
      imgMarket: imgMap.japa_top_market,
      exchangeBg: `background:url(${imgMap.japa_top_bg}) 0 0 no-repeat;`,
      registerImgs: [
        imgMap.japa_register_1,
        imgMap.japa_register_2,
        imgMap.japa_register_3,
      ],
      accountImgs: [
        imgMap.japa_acc_1,
        imgMap.japa_acc_2,
        imgMap.japa_acc_3,
      ],
      arrowImg: imgMap.japa_arrow,
    };
  },
  computed: {
    accountStepList() {
      let obj = null;
      if (typeof this.$t('japanese.accountStep.stepList') !== 'string') {
        obj = this.$t('japanese.accountStep.stepList');
      }
      return obj;
    },
    registerStepList() {
      let obj = null;
      if (typeof this.$t('japanese.registerStep.stepList') !== 'string') {
        obj = this.$t('japanese.registerStep.stepList');
      }
      return obj;
    },
  },
};
