import { imgMap, getComplexType } from '@/utils';

export default {
  data() {
    return {
      appImg: imgMap.download_img,
      imgList: {
        omApp1: imgMap.om_app_1,
        omApp2: imgMap.om_app_2,
        omApp3: imgMap.om_app_3,
        omApp4: imgMap.om_app_4,
        omBtn1: imgMap.om_btn_1,
        omBtn2: imgMap.om_btn_2,
        omEwm: imgMap.om_ewm,
        omEwm2: imgMap.om_ewm2,
        omProImg1: imgMap.om_pro_img1,
        omProImg2: imgMap.om_pro_img2,
        omProImg3: imgMap.om_pro_img3,
        omImg: imgMap.om_img,
        omBicon1: imgMap.om_bicon1,
        omBicon2: imgMap.om_bicon2,
        omBicon3: imgMap.om_bicon3,
        omBicon4: imgMap.om_bicon4,
      },
      registerInfo: '',
    };
  },
  methods: {
    lastItem(list, inx) {
      let cl = '';
      if (list.length - 1 === inx) {
        cl = 'last-item';
      }
      return cl;
    },
  },
  computed: {
    productList() {
      let list = [];
      const arr = this.$t('europe.productDetail');
      if (getComplexType(arr) === 'Array') {
        list = arr;
      }
      return list;
    },
    serviceList() {
      let list = [];
      const arr = this.$t('europe.serviceDetail.list');
      if (getComplexType(arr) === 'Array') {
        list = arr;
      }
      return list;
    },
  },
};
