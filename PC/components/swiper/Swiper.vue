<template>
  <div class='carousel-wrap' :style='boxStyle'>
    <ul class='slide-ul'>
      <li
        v-for='(list, index) in slideList'
        :key='index'
        :class='itemClass(index)'
        @mouseenter='stop'
        @mouseleave='go'
      >
        <a
          :style='{ backgroundImage: "url(" + list.imageUrl + ")" }'
          :href='list.httpUrl'
        >
        </a>
      </li>
    </ul>
    <div
      v-if='slideList.length > 1'
      class='carousel-items a-5-bg'
      ref='bottomLine'
      :style='itemStyle'
    >
      <span
        v-for='(item, index) in slideList'
        :class='activeCl(index === currentIndex)'
        :style='itemWidth'
        @mouseover='change(index)'
        :key='index'
        ref='currentSel'
      >
      </span>
    </div>
  </div>
</template>
<script>
export default {
  name: 'c-swiper',
  props: {
    slideList: {
      default: () => [],
      type: Array,
    },
    interval: {
      default: 4000,
      type: Number,
    },
    height: {
      default: '736',
      type: [Number, String],
    },
    lineWidths: {
      default: '300',
      type: [Number, String],
    },
    liStyle: {
      default: '',
      type: String,
    },
    itemStyle: {
      default: '',
      type: String,
    },
    activeClass: {
      default: '',
      type: String,
    },
  },
  computed: {
    boxStyle() {
      return {
        height: `${this.height}px`,
      };
    },
    lineWidth() {
      return {
        width: `${this.lineWidths}px`,
      };
    },
    itemWidth() {
      let width = `width:${this.lineWidths / this.slideList.length}px`;
      if (this.liStyle) {
        width = this.liStyle;
      }
      return width;
    },
  },
  data() {
    return {
      currentIndex: 0,
      timer: '',
    };
  },
  mounted() {},
  methods: {
    activeCl(active) {
      let cl = 'a-12-bg';
      if (this.activeClass) {
        cl = this.activeClass;
      }
      if (!active) {
        return '';
      }
      return `active ${cl}`;
    },
    itemClass(index) {
      const arr = [];
      if (index === this.currentIndex) {
        arr.push('show');
      }
      if (index > this.currentIndex) {
        arr.push('left');
      }
      if (index < this.currentIndex) {
        arr.push('right');
      }
      return arr;
    },
    go() {
      this.timer = setInterval(() => {
        this.autoPlay();
      }, this.interval);
    },
    stop() {
      clearInterval(this.timer);
      this.timer = null;
    },
    change(index) {
      this.currentIndex = index;
    },
    autoPlay() {
      if (this.slideList.length > 0) {
        this.currentIndex += 1;
        if (this.currentIndex > this.slideList.length - 1) {
          this.currentIndex = 0;
        }
      }
    },
  },
  created() {
    this.$nextTick(() => {
      this.timer = setInterval(() => {
        this.autoPlay();
      }, this.interval);
    });
  },
};
</script>
<style lang='stylus'>
 .carousel-wrap {
   width: 100%;
   overflow: hidden;
}

.slide-ul {
  position: relative;
  width: 100%;
  height: 100%;
}

.slide-ul li {
  position: absolute;
  width: 100%;
  height: 100%;
  transition: all 1s ease;
}
.slide-ul .show {
  transition: all 1s ease;
  // transform: translateX(0);
  opacity: 1;
  z-index: 2;
}
.slide-ul .left {
  transition: all 1s ease;
  // transform: translateX(100%);
  opacity: 0;
  z-index: 1
}
.slide-ul .right {
  transition: all 1s ease;
  // transform: translateX(-100%);
  opacity: 0;
  z-index: 1
}
.slide-ul li a {
  display: block;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-position: center top;
}

.carousel-items {
  position: absolute;
  z-index: 10;
  top: 558px;
  left: 50%;
  transform: translateX(-50%);
  height: 2px;
  margin: 0 auto;
  text-align: center;
  font-size: 0;
  z-index: 5;
}

.carousel-items span {
  display: inline-block;
  height: 2px;
  cursor: pointer;
}
.carousel-items .active {
  // background-color: orange;
}

.list-enter-to {
  transition: all 1s ease;
  // transform: translateX(0);
  opacity: 1;
  z-index: 9
}

.list-leave-active {
  transition: all 1s ease;
  // transform: translateX(-100%)
  opacity: 0;
  z-index: 1;
}

.list-enter {
  // transform: translateX(100%)
  opacity: 0;
  z-index: 1
}

.list-leave {
  // transform: translateX(0)
  opacity: 1;
  z-index: 9
}
</style>
