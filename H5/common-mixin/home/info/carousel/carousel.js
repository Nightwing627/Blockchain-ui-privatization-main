export default {
  name: 'com-home-carousel',
  data() {
    return {
      swiperOption: {
        notNextTick: true,
        // swiper configs 所有的配置同swiper官方api配置
        autoplay: 5000,
        loop: true,
        slidesPerView: 'auto',
        centeredSlides: true,
        disableOnInteraction: true,
        pagination: {
          el: '.swiper-pagination',
        },
        paginationClickable: true,
        spaceBetween: 30,
        autoplayDisableOnInteraction: true,
      },
      timer: null,
      arr: [],
    };
  },
  props: ['slideList'],
  watch: {
    slideList: {
      immediate: true,
      handler(v) {
        if (v.length !== 0) {
          this.arr = v;
          this.$nextTick(() => {
            this.swiper.slideTo(0, 0, false);
            this.timer = setInterval(() => {
              this.swiper.slideNext();
            }, 5000);
          });
        }
      },
    },
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  computed: {
    swiper() {
      return this.$refs.mySwiper.swiper;
    },
  },
  methods: {
    imgListClick(v) {
      let url = '';
      if (v.httpUrl.startsWith('http')) {
        url = v.httpUrl;
      } else {
        url = `http://${v.httpUrl}`;
      }
      window.location.href = url;
    },
  },
};
