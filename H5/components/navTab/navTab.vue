// Created by 王晓波.
// 头部导航
// *****************************
<template>
<div class="common-navTab">
  <ul class="c_list_nav" :style="boxStyle">
    <li
      v-for="(item,index) in navTab"
      :class="color(item)"
      :key="index"
      :style="marginStyle"
      @click="currentClick(item)"
    >
      <span>
        {{item.name}}
        <b class="activeLine"
           :class="activeColor"
           v-show="item.index==currentTab"></b>
      </span>

    </li>
  </ul>
</div>
</template>
<script>
export default {
  name: 'c-h-navTab',
  data() {
    return {};
  },
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
    // 整体高度
    lineHeight: {
      default: '56',
      type: [Number, String],
    },
    // 距离右边的距离
    marginRight: {
      default: '46',
      type: [Number, String],
    },
    // 传入原始颜色class
    className: {
      default: '',
      type: String,
    },
    // 传人active颜色class
    activeClassName: {
      default: '',
      type: String,
    },
    // 选中条颜色
    activeColor: {
      default: '',
      type: String,
    },
  },
  computed: {
    // 整体高度
    boxStyle() {
      return {
        'line-height': `${this.lineHeight / 100}rem`,
      };
    },
    marginStyle() {
      return {
        'margin-right': `${this.marginRight / 100}rem`,
      };
    },
  },
  methods: {
    // 输出颜色
    color(item) {
      if (item.index === this.currentTab) {
        return this.activeClassName;
      }
      return this.className;
    },
    // 点击切换
    currentClick(item) {
      this.$emit('currentType', item);
    },
  },
  created() {},
};
</script>
<style lang="stylus">
.common-navTab {
  width: 100%;
  overflow-x: scroll;
  .c_list_nav {
    user-select: none;
    display: flex;
    li {
      white-space: nowrap;
      // float: left;
      cursor: pointer;
      position: relative;

      span {
        font-family: 'PingFangSC-Regular';
        font-size: 0.14rem;
        letter-spacing: 0;
        text-align: left;
        line-height: 0.16rem;
      }

      &:last-child{
        margin-right: 0;
      }
    }

    .activeLine {
      width: 0.4rem;
      height: 0.02rem;
      position: absolute;
      left: 50%;
      right:50%;
      transform:translateX(-50%);
      bottom: 0;
    }
  }
}

</style>
