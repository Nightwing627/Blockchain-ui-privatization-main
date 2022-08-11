<template lang="html">
    <div
      class="refreshMoudle"
      @touchstart="touchStart($event)"
      @touchmove="touchMove($event)"
      @touchend="touchEnd($event)"
      :style="{transform: 'translate3d(0,' + top + 'px, 0)'}">
      <div class="pull-refresh" v-if="isDropDown && isopen">
        {{dropDownStateText}}
      </div>
      <slot></slot>
    </div>
</template>
<script>
export default {
  name: 'c-h-dropDownRefresh',
  props: {
    isopen: {
      default: true,
    },
    onRefresh: {
      type: Function,
      required: false,
    },
  },
  data() {
    return {
      // 默认高度, 相应的修改.releshMoudle的margin-top和.down-tip, .up-tip, .refresh-tip的height
      defaultOffset: 50,
      top: 0,
      scrollIsToTop: 0,
      startY: 0,
      isDropDown: false, // 是否下拉
      isRefreshing: false, // 是否正在刷新
      dropDownState: 1, // 显示1:下拉刷新, 2:松开刷新, 3:刷新中……
    };
  },
  computed: {
    dropDownStateText() {
      let data = null;
      switch (this.dropDownState) {
        // 下拉刷新
        case 1: {
          data = this.$t('h5Add.dropDownStatus1');
          break;
        }
        // 松开刷新
        case 2: {
          data = this.$t('h5Add.dropDownStatus2');
          break;
        }
        // 加载中...
        case 3: {
          data = this.$t('h5Add.dropDownStatus3');
          break;
        }
        default: {
          data = null;
        }
      }
      return data;
    },
  },
  created() {
    if (document.querySelector('.down-tip')) {
      // 获取不同手机的物理像素（dpr）,以便适配rem
      this.defaultOffset = document.querySelector('.down-tip').clientHeight || this.defaultOffset;
    }
  },
  methods: {
    touchStart(e) {
      if (this.isopen) {
        this.startY = e.targetTouches[0].pageY;
      }
    },
    touchMove(e) {
      if (this.isopen) {
      // safari 获取scrollTop用window.pageYOffset
        this.scrollIsToTop = document.documentElement.scrollTop
        || window.pageYOffset || document.body.scrollTop;
        if (e.targetTouches[0].pageY > this.startY) { // 下拉
          this.isDropDown = true;
          if (this.scrollIsToTop === 0 && !this.isRefreshing) {
            // 拉动的距离
            const diff = e.targetTouches[0].pageY - this.startY - this.scrollIsToTop;
            this.top = window.Math.pow(diff, 0.8)
              + (this.dropDownState === 3 ? this.defaultOffset : 0);
            if (this.top >= this.defaultOffset) {
              this.dropDownState = 2;
              e.preventDefault();
            } else {
              this.dropDownState = 1;
              e.preventDefault();
            }
          }
        } else {
          this.isDropDown = false;
          this.dropDownState = 1;
        }
      }
    },
    touchEnd() {
      if (this.isDropDown && !this.isRefreshing) {
        if (this.top >= this.defaultOffset) { // do refresh
          this.refresh();
          this.isRefreshing = true;
          // console.log(`do refresh`);
        } else { // cancel refresh
          this.isRefreshing = false;
          this.isDropDown = false;
          this.dropDownState = 1;
          this.top = 0;
        }
      }
    },
    refresh() {
      this.dropDownState = 3;
      this.top = this.defaultOffset;
      setTimeout(() => {
        this.onRefresh(this.refreshDone);
      }, 800);
    },
    refreshDone() {
      this.isRefreshing = false;
      this.isDropDown = false;
      this.dropDownState = 1;
      this.top = 0;
    },
  },
};

</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.refreshMoudle {
  width: 100%;
  -webkit-overflow-scrolling: touch; /* ios5+ */
}
.pull-refresh {
  width: 100%;
  transition-duration: 200ms;
  height: 0.24rem;
  line-height: 0.24rem;
  text-align: center;
}
</style>
