import { imgMap } from '@/utils';

export default {
  name: 'appDownload',
  data() {
    return {
      flag: false,
    };
  },
  watch: {
    appDownload(v) {
      if (v) { this.flag = true; }
    },
  },
  computed: {
    navList() {
      return [
        {
          url: this.imgs.download_flag_1,
          title: this.$t('appDownLoad.flag')[0].title,
          desc: this.$t('appDownLoad.flag')[0].desc,
        },
        {
          url: this.imgs.download_flag_2,
          title: this.$t('appDownLoad.flag')[1].title,
          desc: this.$t('appDownLoad.flag')[1].desc,
        },
        {
          url: this.imgs.download_flag_3,
          title: this.$t('appDownLoad.flag')[2].title,
          desc: this.$t('appDownLoad.flag')[2].desc,
        },
        {
          url: this.imgs.download_flag_4,
          title: this.$t('appDownLoad.flag')[3].title,
          desc: this.$t('appDownLoad.flag')[3].desc,
        },
      ];
    },
    stepList() {
      const { lan } = this.$store.state.baseData;
      let lang = lan;
      if (lan !== 'zh_CN') {
        lang = 'en_US';
      }
      return [
        {
          url: this.imgs[`download_ios_01_${lang}`],
          step: this.$t('appDownLoad.setUp.step')[0].step,
          title: this.$t('appDownLoad.setUp.step')[0].title,
          desc: this.$t('appDownLoad.setUp.step')[0].desc,
        },
        {
          url: this.imgs[`download_ios_02_${lang}`],
          step: this.$t('appDownLoad.setUp.step')[1].step,
          title: this.$t('appDownLoad.setUp.step')[1].title,
          desc: this.$t('appDownLoad.setUp.step')[1].desc,
        },
        {
          url: this.imgs[`download_ios_03_${lang}`],
          step: this.$t('appDownLoad.setUp.step')[2].step,
          title: this.$t('appDownLoad.setUp.step')[2].title,
          desc: this.$t('appDownLoad.setUp.step')[2].desc,
        },
        {
          url: this.imgs[`download_ios_04_${lang}`],
          step: this.$t('appDownLoad.setUp.step')[3].step,
          title: this.$t('appDownLoad.setUp.step')[3].title,
          desc: this.$t('appDownLoad.setUp.step')[3].desc,
        },
        {
          url: this.imgs[`download_ios_05_${lang}`],
          step: this.$t('appDownLoad.setUp.step')[4].step,
          title: this.$t('appDownLoad.setUp.step')[4].title,
          desc: this.$t('appDownLoad.setUp.step')[4].desc,
        },
      ];
    },
    appDownload() {
      return this.$store.state.baseData.app_download;
    },
    mainBg() {
      return `background-image: url("${imgMap.appdownload_bg}#0E1A2E"`;
    },
    imgs() {
      return imgMap;
    },
  },
  methods: {
    download(type) {
      window.open(this.appDownload[`${type}_download_url`]);
    },
    init() {
      const footer = document.querySelector('#footer-box');
      if (footer) {
        footer.style.marginTop = 0;
      }
      if (this.appDownload) {
        this.flag = true;
      }
    },
  },
};
