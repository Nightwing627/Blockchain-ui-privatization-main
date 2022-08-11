import { imgMap } from '@/utils';

export default {
  name: 'into-guide',
  data() {
    return {
      backgroundImg: `background: url(${imgMap.interHomeA})#0e1a2d`,
      page: 0, // 当前分页
      imgs: [], // 图片
      swiperTime: 10000, // 切换时间
      pageTime: 0,
      timer: null,
      thumbPage: 0, // 缩略图当前页数
      thumbPage_2: 0,
      thumbItemWidth: '270',
      thumbLeft: 0,
      imgData: {
        omLeft: imgMap.om_left,
        omRight: imgMap.om_right,
      },
    };
  },
  props: {
    slideList: {
      default: [],
    },
    slideListTitle: {
      type: Object,
      default: () => ({}),
    },
  },
  watch: {
    slideList(v) {
      if (v && v.length) {
        this.initFn();
      }
    },
    thumbPage(val) {
      this.thumbPage_2 = val;
      let left = val * (270 * 4);
      if (left < 0) {
        left = 0;
      }
      if (left > this.maxLeft) {
        left = this.maxLeft;
      }
      this.thumbLeft = `-${left}px`;
    },
    thumbPage_2(val) {
      let left = val * (270 * 4);
      if (left < 0) {
        left = 0;
      }
      if (left > this.maxLeft) {
        left = this.maxLeft;
      }
      this.thumbLeft = `-${left}px`;
    },
  },
  computed: {
    imgList() {
      if (this.imgs.length === 0) return [];
      let arr = [];
      let list = [];
      if (this.imgs.length <= 4) {
        list = this.imgs;
      } else {
        const page = this.page - 1;
        list = this.imgs.slice(page * 4, (page * 4) + 4);
      }
      arr = [...list];
      return arr;
    },
    pageWidth() {
      return Math.floor((this.pageTime / this.swiperTime) * 40);
    },
    indexInternationalOpen() {
      return this.$store.state.baseData.index_international_open;
    },
    pageLength() {
      // 欧美版
      if (this.indexInternationalOpen === 6) {
        return this.imgs.length;
      }
      // 国际版 biki 版
      return Math.ceil(this.imgs.length / 4);
    },
    // 欧美版
    thumbLineWidth() {
      return Math.floor((this.pageTime / this.swiperTime) * 270);
    },
    thumbWidth() {
      return `${this.imgs.length * 270}px`;
    },

    thumbToTalpage() {
      return Math.ceil(this.imgs.length / 4);
    },
    maxLeft() {
      return this.imgs.length * 270 - 1080;
    },
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    init() {
      if (this.slideList && this.slideList.length) {
        this.initFn();
      }
    },
    goTo(v) {
      window.open(v);
    },
    prev() {
      if (this.thumbPage_2 > 0) {
        this.thumbPage_2 -= 1;
      } else {
        this.thumbPage_2 = this.thumbToTalpage - 1;
      }
    },
    next() {
      if (this.thumbPage_2 + 1 < this.thumbToTalpage) {
        this.thumbPage_2 += 1;
      } else {
        this.thumbPage_2 = 0;
      }
    },
    initFn() {
      this.imgs = this.slideList;
      this.page = 1;
      if (this.imgs.length > 4) {
        this.pageTime = 0;
        this.pageTimeFn();
      }
    },
    pageClick(page) {
      if (this.page === page) return;
      this.page = page;
      this.pageTime = 0;
      this.pageTimeFn();
    },
    pageTimeFn() {
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        this.pageTime += 100;
        if (this.pageTime > this.swiperTime) {
          this.pageTime = 0;
          this.page += 1;
          if (this.page > this.pageLength) {
            this.page = 1;
          }
          this.thumbPage = Math.ceil(this.page / 4) - 1;
        }
      }, 100);
    },
    enter() {
      clearInterval(this.timer);
    },
    leave() {
      this.pageTimeFn();
    },
  },

};
