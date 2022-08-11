import { imgMap } from '@/utils';

export default {
  data() {
    return {
      downloadStyle: `background:url(${imgMap.ko3_bg}) center 10px no-repeat`,
      ko4Img: imgMap.ko4_0,
      authImg: imgMap.ko5,
      koMore: imgMap.ko_more,
      ko6CImg: {
        ko61: imgMap.ko6_1,
        ko62: imgMap.ko6_2,
        ko63: imgMap.ko6_3,
        ko64: imgMap.ko6_4,
        ko65: imgMap.ko6_5,
        ko66: imgMap.ko6_6,
      },
    };
  },
  computed: {
    navList() {
      return [
        {
          title: this.$t('appDownLoad.flag')[0].title,
          desc: this.$t('appDownLoad.flag')[0].desc,
        },
        {
          title: this.$t('appDownLoad.flag')[1].title,
          desc: this.$t('appDownLoad.flag')[1].desc,
        },
        {
          title: this.$t('appDownLoad.flag')[2].title,
          desc: this.$t('appDownLoad.flag')[2].desc,
        },
        {
          title: this.$t('appDownLoad.flag')[3].title,
          desc: this.$t('appDownLoad.flag')[3].desc,
        },
      ];
    },
    list() {
      return [
        {
          mess: this.$t('homeTemplate.text_07'),
          title: this.$t('homeTemplate.text_06'),
          img: imgMap.ko4_1,
        },
        {
          mess: this.$t('homeTemplate.text_09'),
          title: this.$t('homeTemplate.text_10'),
          img: imgMap.ko4_2,
        },
        {
          mess: this.$t('homeTemplate.text_11'),
          title: this.$t('homeTemplate.text_12'),
          img: imgMap.ko4_3,
        },
        {
          mess: this.$t('homeTemplate.text_13'),
          title: this.$t('homeTemplate.text_14'),
          img: imgMap.ko4_4,
        },
      ];
    },
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
    },
  },
};
