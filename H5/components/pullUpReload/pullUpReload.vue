<template>
  <div class="loadMoudle"
    @touchstart="touchStart($event)"
    @touchmove="touchMove($event)"
    :style="{transform: 'translate3d(0,' + top + 'px, 0)'}">
    <slot></slot>
    <div class="load-more" v-if="isopen" :class = "{'bigHeight' : pullUpState === 2}">
      {{pullUpStateText}}
    </div>
  </div>
</template>

<script>
export default {
  name: 'c-h-pullUpReload',
  props: {
    isopen: {
      default: true,
    },
    parentPullUpState: {
      default: 0,
    },
    onInfiniteLoad: {
      type: Function,
      require: false,
    },
  },
  data() {
    return {
      top: 0,
      startY: 0,
      // 1:上拉加载更多, 2:加载中……, 3:没有了
      pullUpState: 0,
      // 是否正在加载
      isLoading: false,
    };
  },
  computed: {
    pullUpStateText() {
      let data = null;
      switch (this.pullUpState) {
        // 上拉加载更多
        case 1: {
          data = this.$t('h5Add.pullUpStatus1');
          break;
        }
        // 加载中……
        case 2: {
          data = this.$t('h5Add.pullUpStatus2');
          break;
        }
        // 已加载完毕
        case 3: {
          // data = this.$t('h5Add.pullUpStatus3');
          data = '';
          break;
        }
        default: {
          data = null;
        }
      }
      return data;
    },
  },
  methods: {
    touchStart(e) {
      if (this.isopen) {
        this.startY = e.targetTouches[0].pageY;
      }
    },
    touchMove(e) {
      if (e.targetTouches[0].pageY < this.startY && this.isopen) { // 上拉
        this.judgeScrollBarToTheEnd();
      }
    },

    // 判断滚动条是否到底
    judgeScrollBarToTheEnd() {
      const innerHeight = document.querySelector('.loadMoudle').clientHeight;
      // 变量scrollTop是滚动条滚动时，距离顶部的距离
      const scrollTop = document.documentElement.scrollTop
      || window.pageYOffset || document.body.scrollTop;
      // 变量scrollHeight是滚动条的总高度
      const scrollHeight = document.documentElement.clientHeight || document.body.scrollHeight;
      // 滚动条到底部的条件
      if (scrollTop + scrollHeight >= innerHeight) {
        if (this.pullUpState !== 3 && !this.isLoading) {
          this.pullUpState = 1;
          this.infiniteLoad();
        }
      }
    },

    infiniteLoad() {
      this.pullUpState = 2;
      this.isLoading = true;
      setTimeout(() => {
        this.onInfiniteLoad(this.infiniteLoadDone);
      }, 800);
    },
    infiniteLoadDone() {
      this.pullUpState = 1;
      this.isLoading = false;
    },
  },
  watch: {
    parentPullUpState(curVal) {
      this.pullUpState = curVal;
    },
  },
};
</script>

<style scoped>
.load-more {
  width: 100%;
  text-align:  center;
  height: 0.24rem;
  line-height: 0.24rem;
  font-size: 0.12rem;
  transition: height 1s;
}
.bigHeight {
  height: 0.84rem;
}
</style>
