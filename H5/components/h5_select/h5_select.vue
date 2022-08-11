<template>
  <section class="h5_select"
    v-click-outside.capture="onClickOutside"
    v-click-outside:mousedown.capture="onClickOutside">
    <div class="now" @click="handClick">
      {{ activeText }}
      <i class="icon icon-triangle b-1-bd icon-triangle-down"
       :class="showList ? 'show' : ''"></i>
    </div>
    <ul class="selectList a-5-bg" :class="showList ? 'showList' : ''">
      <li v-for="(item, index) in navTab"
        :key="index"
        @click="currentClick(item)"
        :class="currentTab === item.index ? 'a-4-bg x-1-cl' : ''"
        >{{ item.name }}</li>
    </ul>
  </section>
</template>

<script>
import { directive as clickOutside } from 'v-click-outside-x';

export default {
  name: 'c-h-h5Select',
  data() {
    return {
      showList: false,
    };
  },
  directives: { clickOutside },
  props: {
    // 当前选中状态
    currentTab: {
      default: 1,
      type: Number,
    },
    // tab全部
    navTab: {
      default: () => [],
      type: Array,
    },
  },
  computed: {
    activeText() {
      let str = '';
      this.navTab.forEach((item) => {
        if (item.index === this.currentTab) {
          str = item.name;
        }
      });
      return str;
    },
  },
  methods: {
    onClickOutside() {
      this.showList = false;
    },
    handClick() {
      this.showList = !this.showList;
    },
    // 点击切换
    currentClick(item) {
      this.showList = false;
      this.$emit('currentType', item);
    },
  },
};
</script>


<style lang="stylus" scoped>
.h5_select {
  position: relative;
  .now {
    line-height: 0.2rem;
    position: relative;
    display: inline-block;
    padding-right: 0.12rem;
    font-size: 0.12rem;
  }
  .show {
    transform: rotate(180deg)!important;
  }
  .showList {
    display: block!important;
  }
  .selectList {
    display: none;
    position: absolute;
    z-index: 3;
    padding: 0.1rem 0;
    li {
      font-size: 0.12rem;
      line-height: 0.4rem;
      min-width: 1.2rem;
      box-sizing: border-box;
      padding: 0 0.2rem;
    }
  }
  .icon-triangle {
    // color: #828EA1;
    position: absolute;
    bottom: 0.08rem;
    right: 0;
    width:0;
    height:0;
    border-width:4px 4px 0;
    border-style:solid;
    border-left-color: transparent!important;
    border-right-color: transparent!important;
 //   border-color:#828EA1 transparent transparent;/*灰 透明 透明 */
    // text-align: center;
    // width: 20px;
    // line-height: 10px;
    // cursor: pointer;
    transition: all .3s ease-in-out;
  }
}
</style>
