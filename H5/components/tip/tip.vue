// Created by 任泽阳 on 18/12/06.
// 提示框
<template>
  <section class="common-tip" :style="{height: boxHeight + 'px'}">
    <ul>
      <transition-group name="tip">
        <li v-for="(item, index) in domList" :key="item.time"
          :ref="'dom' + index"
          class="common-tip-even a-4-bg b-1-cl">
          <div class="text">{{item.text}}</div>
          <div class="bg" :style="{background: item.color}"></div>
          <div class="text text-mark">{{item.text}}</div>
        </li>
      </transition-group>
    </ul>
  </section>
</template>
<script>
export default {
  name: 'c-h-tip',
  data() {
    return {
      boxHeight: 0,
      list: [
        // { text: 'error', time: 3000, type: 'error' },
        // { text: 'success', time: 3000, type: 'success' },
        // { text: 'info', time: 3000, type: 'info' },
        // { text: 'warning', time: 3000, type: 'warning' }
      ],
    };
  },
  watch: {
    domList() {
      this.$nextTick(() => {
        if (this.$refs.dom0 && this.$refs.dom0[0]) {
          this.boxHeight = this.$refs.dom0[0].offsetHeight;
        } else {
          this.boxHeight = 0;
        }
      });
    },
  },
  computed: {
    domList() {
      const list = [];
      this.list.forEach((item) => {
        let color = '';
        switch (item.type) {
          case 'error':
            color = '#EB4D5C';
            break;
          case 'success':
            color = '#1F3F59';
            break;
          case 'info':
            color = '#1F3F59';
            break;
          case 'warning':
            color = '#1F3F59';
            break;
          default:
            color = '#1F3F59';
        }
        list.push({ ...item, ...{ color } });
      });
      return list;
    },
  },
  mounted() {
    this.$bus.$on('tip', ({ text, type = 'info' }) => {
      const time = new Date().getTime();
      this.list.unshift({
        text,
        type,
        time,
      });
      setTimeout(() => {
        let id = -1;
        this.list.forEach((item, index) => {
          if (item.time === time) id = index;
        });
        this.list.splice(id, 1);
      }, 3000);
    });
  },
};
</script>
<style lang="stylus">
.tip-item-move {
  // display: inline-block;
  // margin-right: 10px;
}
.tip-enter-active {
  transition: all 0.3s;
}
.tip-enter {
  // opacity: 0;
  transform: translateY(-100%);
}
.tip-leave-active {
  transition: all 0.3s;
}
.tip-leave-to {
  // opacity: 0;
}

.common-tip {
  position: fixed;
  right: 0px;
  top: 0px;
  z-index: 9999;
  width: 100%;
  transition: all 0.3s;
  overflow: hidden;
  ul {
    transition: all 0.3s;
  }
  .common-tip-even {
    // box-shadow: 0px 2px 10px rgba(0,0,0,0.15);
    width: 100%;
    min-height: 0.44rem;
    box-sizing: border-box;
    transition: all 0.3s;
    position: relative;
    .text-mark {
      position: absolute;
      width: 100%;
      left: 0;
      top: 0;
    }
    .bg {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      opacity: 0.9;
    }
    .icon {
      position: absolute;
      width: 16px;
      height: 16px;
      top: 25px;
      left: 20px;
      border-radius: 50%;
    }
    .text{
      font-family: PingFangSC-Regular;
      font-size: 0.14rem;
      letter-spacing: 0;
      text-align: center;
      line-height: 0.2rem;
      box-sizing: border-box;
      word-wrap: break-word;
      padding: 0.12rem 0.15rem;
    }
  }
}
</style>
