import { imgMap } from '@/utils';

export default {
  data() {
    return {
      backgroundImg: `background: url(${imgMap.interAppBg})#0e1a2d`,
      appImg: imgMap.interPhone,
      flag: false,
    };
  },
  props: {
    homeHtml: {
      default: '',
    },
    homeEditReady: {
      default: false,
    },
  },
  watch: {
    appDownload(v) {
      if (v) { this.flag = true; }
    },
    homeHtml(v) {
      if (v) { this.htmlFn(); }
    },
  },
  computed: {
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    imgClass() {
      const style = {
        bgIcon: {
          backgroundImage: `url(${imgMap.home_edit_icon})`,
        },
        bgImg: {
          background: `url(${imgMap.home_edit_bg}) 0 bottom repeat-x #0E1A2E`,
        },
        homeEditImga: {
          backgroundImage: `url(${imgMap.home_edit_imga})`,
        },
        homeEditImgb: {
          backgroundImage: `url(${imgMap.home_edit_imgb})`,
        },
      };
      return style;
    },
    appDownload() {
      return this.$store.state.baseData.app_download;
    },
    downloadIconUrl() {
      return imgMap.download_icon;
    },
    list() {
      return [
        {
          mess: this.$t('homeTemplate.text_07'),
          title: this.$t('homeTemplate.text_06'),
          img: imgMap.interCcustom1,
        },
        {
          mess: this.$t('homeTemplate.text_09'),
          title: this.$t('homeTemplate.text_10'),
          img: imgMap.interCcustom2,
        },
        {
          mess: this.$t('homeTemplate.text_11'),
          title: this.$t('homeTemplate.text_12'),
          img: imgMap.interCcustom3,
        },
        {
          mess: this.$t('homeTemplate.text_13'),
          title: this.$t('homeTemplate.text_14'),
          img: imgMap.interCcustom4,
        },
      ];
    },
  },
  methods: {
    init() {
      if (this.appDownload) {
        this.flag = true;
      }
      if (this.homeHtml) {
        this.htmlFn();
      }
    },
    getIconImg(val) {
      return `background:url(${imgMap[`home_edit_icon${val}`]})`;
    },
    htmlFn() {
      if (this.homeHtml && this.homeHtml.length) {
        const head = document.querySelector('head');
        let scriptHtml = '';
        if (this.homeHtml.match(/<script[^>]*>[\s\S]*?<\/[^>]*script>/gi)) {
          [scriptHtml] = this.homeHtml.match(/<script[^>]*>[\s\S]*?<\/[^>]*script>/gi);
        }
        if (scriptHtml) {
          scriptHtml = scriptHtml.replace('<script>', '');
          scriptHtml = scriptHtml.replace(/<\/script>/ig, '');
          const script = document.createElement('script');
          script.innerHTML = scriptHtml;
          head.appendChild(script);
          const styleDom = document.createElement('style');
          let homeEditImgCss = '';
          const imgMapArry = Object.keys(imgMap);
          imgMapArry.forEach((item) => {
            if (item.indexOf('home_edit_') > -1) {
              homeEditImgCss += `.${item}{background-image:url(${imgMap[item]})}`;
            }
          });
          styleDom.innerHTML = homeEditImgCss;
          head.appendChild(styleDom);
        }
      }
    },
  },
};
