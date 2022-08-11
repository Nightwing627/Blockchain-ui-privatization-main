import { imgMap } from '@/utils';

export default {
  data() {
    return {
      qShowList: [],
      inputStyle: 'text-indent:20px;width:286px;',
      headerStyle: `background:url(${imgMap.japa_banner_bg}) 0 0 no-repeat`,
      headerImg: `background:url(${imgMap.japa_banner}) 0 0 no-repeat`,
    };
  },
  methods: {
    showA(inx) {
      if (!this.qShowList[inx]) {
        this.qShowList[inx] = {};
      }
      this.qShowList[inx].show = !this.qShowList[inx].show;
      this.$forceUpdate();
    },
  },
  computed: {
    qaList() {
      let obj = null;
      if (typeof this.$t('japanese.qa') !== 'string') {
        obj = this.$t('japanese.qa');
      }
      return obj;
    },
  },
};
