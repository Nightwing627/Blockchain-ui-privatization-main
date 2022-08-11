export default {
  name: 'into-king-swiper',
  props: {
    slideList: {
      default: [],
    },
    slideListTitle: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      flag: false, // true 轮播图4张 false 轮播图1张
      kingImgs: [
        // { id: 0, img: 'https://img.bafang.com/cdn/banner/20200210/158131691959135284991-f2d6-41da-ac47-a7f9beaf8739.png' },
        // { id: 1, img: 'https://bafangpublic.oss-cn-hangzhou.aliyuncs.com/oksupport/banner/20190517/1558064565536a804fdca-af53-4611-93d7-f12afea7c982.jpg' },
        // { id: 2, img: 'https://img.bafang.com/cdn/banner/20200206/1580988093551a282e46a-f9cb-4b77-b6a3-e50a17ac29ea.jpg' },
        // { id: 3, img: 'https://img.bafang.com/cdn/banner/20200208/1581161049485466aef15-9734-4087-b4a5-a39f8b38f644.png' },
        // { id: 4, img: 'https://img.bafang.com/cdn/banner/20191219/157674850635041c5beb0-187d-46af-a5dd-7e8cd4e8f8a7.png' },
        // { id: 5, img: 'https://img.bafang.com/cdn/banner/20191205/157553273906281ffa086-7f64-4c3e-9fc9-8b7ff6e980d5.png' },
      ],
      nowimg: 1,
      kingSort: [],
      smallPage: 0,
      bigPage: 0,
      smallTimer: null,
      bigTimer: null,
    };
  },
  watch: {
    slideList: {
      immediate: true,
      handler(v) {
        if (v.length) {
          this.kingImgs = v;
          this.initKingSort();
          this.initTimer();
        }
      },
    },
  },
  computed: {
    imgBoxStyle() {
      const w = this.flag ? 1200 : 285;
      return {
        width: `${w}px`,
      };
    },
    bigStyle() {
      return {
        width: `${Math.ceil(this.kingSort.length / 4) * 1200}px`,
        'margin-left': `-${this.bigPage * 1200}px`,
      };
    },
    smallStyle() {
      return {
        width: `${this.kingSort.length * 285}px`,
        'margin-left': `-${this.smallPage * 285}px`,
      };
    },
    kingImgLists() {
      let arr = [];
      if (this.flag) {
        arr = this.kingSort.slice(this.bigPage * 4, (this.bigPage * 4) + 4);
      } else {
        arr.push(this.kingSort[this.smallPage]);
      }
      return arr;
    },
  },
  methods: {
    imgClick(v) {
      window.open(v, '_blank');
    },
    bigPageClick(v) {
      this.bigPage = v;
      this.initTimer();
    },
    bigClick() {
      if ((this.bigPage + 1) * 4 >= this.kingImgs.length) {
        this.bigPage = 0;
      } else {
        this.bigPage += 1;
      }
    },
    smallClick() {
      if ((this.smallPage + 1) >= this.kingImgs.length) {
        this.smallPage = 0;
      } else {
        this.smallPage += 1;
      }
    },
    setFlag() {
      this.initKingSort();
      this.flag = !this.flag;
      this.initTimer();
    },
    initTimer() {
      clearInterval(this.bigTimer);
      clearInterval(this.smallTimer);
      if (this.flag) {
        this.bigTimer = setInterval(() => {
          this.bigClick();
        }, 5000);
      } else {
        this.smallTimer = setInterval(() => {
          this.smallClick();
        }, 5000);
      }
    },
    initKingSort() {
      const fArr = [];
      const aArr = [];
      let arr = [];
      const forArr = this.kingSort.length ? this.kingSort : this.kingImgs;
      if (this.flag) {
        forArr.forEach((item, index) => {
          if (index < this.bigPage * 4) {
            fArr.push(item);
          } else {
            aArr.push(item);
          }
        });
        this.bigPage = 0;
      } else {
        forArr.forEach((item, index) => {
          if (index < this.smallPage) {
            fArr.push(item);
          } else {
            aArr.push(item);
          }
        });
        this.smallPage = 0;
      }
      arr = [...[], ...aArr, ...fArr];
      this.kingSort = arr;
    },
  },
};
