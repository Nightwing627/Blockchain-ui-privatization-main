<!-- // Created by 侯东东.
// 底部侧导航
// ***************************** -->
<template>
  <aside class="buttom-nav-common h-1-bg">
    <ul class="buttom-nav-ul">
      <li
        v-for="(item, idx) in navList"
        :key="idx"
        @click="listTextChange(item)"
        :class="returnClass(item)"
        :id="item.id">
        <span v-text="item.navText"></span>
      </li>
    </ul>
  </aside>
</template>
<script>
export default {
  name: 'c-h-bottomNav',
  data() {
    return {
      hoverId: '',
    };
  },
  props: {
    // 菜单列表
    navList: {
      default: () => [],
      type: Array,
    },
    // 默认选中第几个
    navListActive: {
      default: 1,
      type: [Number, String],
    },
  },
  computed: {
  },
  methods: {
    returnClass(item) {
      let str = item.classes;
      if (this.navListActive === item.id) {
        str = `${item.classes} h-4-bg x-1-cl`;
      }
      return str;
    },
    // 菜单栏点击事件
    listTextChange(item) {
      this.$emit('clickEvent', item);
    },
  },
};
</script>
<style lang="stylus">
.buttom-nav-common {
  height: 0.44rem;
  position: fixed;
  bottom: 0;
  width: 100%;
  left: 0;
  z-index: 9;
  overflow-x: scroll;
  .buttom-nav-ul {
    display: flex;
    li{
      position: relative;
      cursor: pointer;
      transition: all 0.5s;
      line-height: 0.44rem;
      height: 0.44rem;
      flex: 1;
      text-align: center;
      span{
        font-size: 0.12rem;
        letter-spacing: 0;
      }
    }
  }
}
</style>
