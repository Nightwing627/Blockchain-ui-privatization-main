// Created by 任泽阳 on 18/12/06. // 提示框
<template>
  <section class='common-tip'>
    <ul>
      <transition-group name='tip'>
        <li
          v-for='item in domList'
          :key='item.time'
          class='common-tip-even a-4-bg b-1-cl'
          :class='item.color'
        >
          <span class='icon'></span>
          <svg
            v-if='item.type === "info"'
            class='icon icon-16'
            aria-hidden='true'
          >
            <use xlink:href='#icon-c_3'></use>
          </svg>
          <svg
            v-if='item.type === "error"'
            class='icon icon-16'
            aria-hidden='true'
          >
            <use xlink:href='#icon-c_5'></use>
          </svg>
          <svg
            v-if='item.type === "success"'
            class='icon icon-16'
            aria-hidden='true'
          >
            <use xlink:href='#icon-c_4'></use>
          </svg>
          <svg
            v-if='item.type === "warning"'
            class='icon icon-16'
            aria-hidden='true'
          >
            <use xlink:href='#icon-c_6'></use>
          </svg>
          <div class='text'>{{ item.text }}</div>
        </li>
      </transition-group>
    </ul>
  </section>
</template>
<script>
export default {
  name: 'c-tip',
  data() {
    return {
      list: [
        // { text: 'error', time: 3000, type: 'error' },
        // { text: 'success', time: 3000, type: 'success' },
        // { text: 'info', time: 3000, type: 'info' },
        // { text: 'warning', time: 3000, type: 'warning' }
      ],
    };
  },
  computed: {
    domList() {
      const list = [];
      this.list.forEach((item) => {
        let color = '';
        switch (item.type) {
          case 'error':
            color = 'a-19-bd';
            break;
          case 'success':
            color = 'a-18-bd';
            break;
          case 'info':
            color = 'a-12-bd';
            break;
          case 'warning':
            color = 'a-20-bd';
            break;
          default:
            color = 'a-12-bd';
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
<style lang='stylus'>
.tip-item-move {
  display: inline-block;
  margin-right: 10px;
}
.tip-enter-active, .tip-leave-active {
  transition: all 0.3s;
}
.tip-enter, .tip-leave-to
/* .list-leave-active for below version 2.1.8 */ {
  opacity: 0;
  transform: translateX(30%);
}

.common-tip {
  position: fixed;
  right: 20px;
  top: 83px;
  z-index: 9999;
  .info {
    border-left-width: 3px;
    border-left-style: solid;
  }
  .common-tip-even {
    box-shadow: 0px 2px 10px rgba(0,0,0,0.15);
    width: 280px;
    min-height: 60px;
    margin-bottom: 26px;
    border-left-width: 3px;
    border-left-style: solid;
    box-sizing: border-box;
    transition: all 0.3s;
    padding: 22px 25px 22px 52px;
    position: relative;
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
      font-size: 14px;
      letter-spacing: 0;
      text-align: left;
      line-height: 22px;
    }
  }
}
</style>
