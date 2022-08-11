// Created by 任泽阳 on 18/12/07.
// loaidng组件s
// *****************************
<template>
  <section class="common-loading" :style="contentStyle" :class="className">
    <div :style="contentStyle" ref="loading" class="common-loading-content">
      <div class="mmd-loading-circle-layout">
        <!-- 扩出部分 -->
        <div class="mmd-loading-layout-left">
          <div class="mmd-loading-circle-left mmd-loading-circle-left-com"
             :class="colorName"
            :style="leftStyle"></div>
        </div>
        <!-- 收起部分 -->
        <div class="mmd-loading-layout-right">
          <div class="mmd-loading-circle-right mmd-loading-circle-right-com"
            :class="colorName"
            :style="rightStyle"></div>
        </div>
      </div>
    </div>
  </section>
</template>
<script>
export default {
  name: 'c-h-loading',
  props: {
    // 尺寸
    size: {
      default: '30',
      type: String,
    },
    // class
    className: {
      default: 'a-12-bd',
      type: String,
    },
    colorName: {
      default: 'b-4-cl',
      type: String,
    },
  },
  computed: {
    // 容器盒子style
    contentStyle() {
      return {
        width: `${this.size}px`,
        height: `${this.size}px`,
      };
    },
    // 扩出盒子style
    leftStyle() {
      const bw = Math.round(this.size / 10);
      const w = this.size - 2 * bw;
      return {
        width: `${w}px`,
        height: `${w}px`,
        borderWidth: `${bw}px`,
        borderLeft: `${bw}px solid transparent`,
        borderBottom: `${bw}px solid transparent`,
      };
    },
    // 收起盒子style
    rightStyle() {
      const bw = Math.round(this.size / 10);
      const w = this.size - 2 * bw;
      return {
        width: `${w}px`,
        height: `${w}px`,
        borderWidth: `${bw}px`,
        borderRight: `${bw}px solid transparent`,
        borderTop: `${bw}px solid transparent`,
      };
    },
  },
};
</script>
<style lang="stylus" scoped>
.common-loading {
  position: relative;
  display: inline-block;
}
.common-loading-content {
  position: absolute;
}
.mmd-loading-circle-right, .mmd-loading-circle-left {
}
.mmd-loading-wrap {
  animation: mmd-loading-animation-wrap 2.5s linear infinite;
  -webkit-animation: mmd-loading-animation-wrap 2.5s linear infinite;
}
.mmd-loading-circle-layout {
  width: 100%;
  height: 100%;
  animation: mmd-loading-animation-circle 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  -webkit-animation: mmd-loading-animation-circle 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.mmd-loading-layout-left {
  float: left;
  width: 50%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
.mmd-loading-layout-right {
  float: right;
  width: 50%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
.mmd-loading-circle-left-com {
  position: absolute;
  top: 0;
  left: 0;
  border-style: solid;
  border-radius: 50%;
  transform: rotate(40deg);
  animation: loading-animation-circle-left 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  -webkit-animation: loading-animation-circle-left 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.mmd-loading-circle-right-com {
  position: absolute;
  top: 0;
  right: 0;
  border-style: solid;
  border-radius: 50%;
  transform: rotate(-310deg);
  animation: loading-animation-circle-right 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  -webkit-animation: loading-animation-circle-right 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
@keyframes loading-animation-circle-left {
  0% {
    transform: rotate(40deg);
  }

  50% {
    transform: rotate(-100deg);
  }

  100% {
    transform: rotate(40deg);
  }
}
@keyframes loading-animation-circle-left {
  0% {
    transform: rotate(40deg);
  }

  50% {
    transform: rotate(-100deg);
  }

  100% {
    transform: rotate(40deg);
  }
}
@keyframes loading-animation-circle-right {
  0% {
    transform: rotate(-310deg);
  }

  50% {
    transform: rotate(-170deg);
  }

  100% {
    transform: rotate(-310deg);
  }
}
@keyframes loading-animation-circle-right {
  0% {
    transform: rotate(-310deg);
  }

  50% {
    transform: rotate(-170deg);
  }

  100% {
    transform: rotate(-310deg);
  }
}
@keyframes mmd-loading-animation-circle {
  0% {
    transform: rotate(0deg);
  }

  25% {
    transform: rotate(180deg);
  }

  50% {
    transform: rotate(360deg);
  }

  75% {
    transform: rotate(540deg);
  }

  100% {
    transform: rotate(720deg);
  }
}
@keyframes mmd-loading-animation-circle {
  0% {
    transform: rotate(0deg);
  }

  25% {
    transform: rotate(180deg);
  }

  50% {
    transform: rotate(360deg);
  }

  75% {
    transform: rotate(540deg);
  }

  100% {
    transform: rotate(720deg);
  }
}
@keyframes mmd-loading-animation-wrap {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
@keyframes mmd-loading-animation-wrap {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
