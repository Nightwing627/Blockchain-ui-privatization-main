<template>
<transition name="market-fade">
  <ul class="c_list_navSelect h-1-bg a-7-bd" v-show="flag">
    <li
      v-for="(item,index) in navTab"
      class="even h-3-bd b-1-cl"
      :key="index"
      @click="currentClick(item)"
    >
      <span class="even-text">
        {{item.name}}
      </span>
      <svg class="icon icon-14" aria-hidden="true" v-show="item.index==currentTab">
        <use xlink:href="#icon-a_14_1"></use>
      </svg>
    </li>
  </ul>
</transition>
</template>
<script>
export default {
  name: 'c-h-navSelect',
  data() {
    return {};
  },
  props: {
    flag: {
      default: false,
      type: Boolean,
    },
    // 当前选中状态
    currentTab: {
      default: 1,
      type: [Number, String],
    },
    // tab全部
    navTab: {
      default: () => [],
      type: Array,
    },
  },
  beforeDestroy() {
    this.$bus.$emit('htmlScroll', true);
  },
  watch: {
    flag(v) {
      if (v) {
        this.$bus.$emit('htmlScroll', false);
      } else {
        this.$bus.$emit('htmlScroll', true);
      }
    },
  },
  methods: {
    // 点击切换
    currentClick(item) {
      this.$emit('currentType', item);
    },
  },
};
</script>
<style lang="stylus" scope>
.c_list_navSelect {
  position: fixed;
  z-index: 2;
  width: 100%;
  left: 0;
  top: 0.44rem;
  border-top-style: solid;
  border-top-width: 0.01rem;
  height: calc(100% - 0.44rem);
  overflow: scroll;
  z-index: 3;
  padding: 0 0.15rem;
  box-sizing: border-box;
  overflow: scroll;
  .even {
    // min-height: 0.55rem;
    line-height: 0.25rem;
    padding: 0.15rem 0;
    width: 100%;
    border-bottom-width: 1px;
    border-bottom-style: solid;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .even-text {
      width: 92%;
      display: inline-block
      // display: i
    }
  }

}
.market-fade-enter-active {
  transition: all 0.4s ease;
}

.market-fade-leave-active {
  transition: all 0.4s ease;
}

.market-fade-enter, .market-fade-leave-to, {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
