// Created by 任泽阳 on 18/12/17.
// 登录/注册/重置密码 手机/邮箱切换
<template>
  <ul class="into-tab a-2-bd" :class="`${disabled ? 'userNone' : ''} ${className}`">
    <li v-for="(item, index) in list"
      :key="index"
      @click="setNowKey(item.key)"
      :style="evenStyle"
      :class="nowKey === item.key ? 'b-1-cl' : ''">
      {{ item.name }}
    </li>
    <span :style="barStyle" class="a-12-bg"></span>
  </ul>
</template>
<script>
export default {
  name: 'c-h-IntoTab',
  props: {
    className: { default: '', type: String }, // 根节点class
    list: { default: [] }, // [{name: xx, key: xx}]
    nowKey: { default: '', type: String }, // 当前值
    disabled: { default: false, type: Boolean }, // 是否可点击
  },
  computed: {
    // 下划线样式
    barStyle() {
      const area = 100 / this.list.length; // 每份占位宽度
      let ind = 0;
      this.list.forEach((item, i) => {
        if (item.key === this.nowKey) {
          ind = i;
        }
      });
      return {
        width: `${area}%`,
        left: `${ind * area}%`,
      };
    },
    // 每一项样式
    evenStyle() {
      const area = 100 / this.list.length; // 每份占位宽度
      return { width: `${area}%` };
    },
  },
  methods: {
    setNowKey(item) {
      if (this.disabled) { return; }
      this.$emit('onchenges', item);
    },
  },
};
</script>

<style lang="stylus" scoped>
.userNone {
  li {cursor: no-drop!important}
}
.into-tab {
  width: 3.45rem;
  height: 0.4rem;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  position: relative;
  span {
    position: absolute;
    height: 2px;
    width: 50%;
    bottom: -1px;
    transition: all 0.3s!important;
    left: 0;
  }
  li {
    float: left;
    width: 50%;
    line-height: 0.4rrem;
    text-align: center;
    cursor: pointer;
    user-select: none
  }
}
</style>
