// Created by 王晓波. // 头部导航 // *****************************
<template>
  <ul class='c_list_nav' :style='boxStyle'>
    <li
      v-for='(item, index) in navTab'
      :class='color(item)'
      :key='index'
      :style='[marginStyle, minWidthStyle]'
      @click='currentClick(item)'
    >
      <span>
        {{ item.name }}
        <b
          class='activeLine'
          :class='activeColor'
          v-show='item.index == currentTab'
        ></b>
      </span>
    </li>
  </ul>
</template>
<script>
export default {
  name: 'c-navTab',
  data() {
    return {};
  },
  props: {
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
    // 子元素是否设置最小宽度
    minWidth: {
      default: 'auto',
      type: String,
    },
  },
  computed: {
    // 整体高度
    boxStyle() {
      return {
        'line-height': `${this.lineHeight}px`,
      };
    },
    marginStyle() {
      return {
        'margin-right': `${this.marginRight}px`,
      };
    },
    minWidthStyle() {
      return {
        'min-width': this.minWidth,
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
<style lang='stylus'>
.c_list_nav {
    float: left;
    box-sizing: border-box;
    user-select: none;

    li {
        float: left;
        cursor: pointer;
        position: relative;
        text-align center;

        span {
            font-family: 'PingFangSC-Regular';
            font-size: 14px;
            letter-spacing: 0;
            text-align: left;
            line-height: 16px;
        }

        &:last-child {
            margin-right: 0;
        }
    }

    .activeLine {
        width: 40px;
        height: 2px;
        position: absolute;
        left: 50%;
        right: 50%;
        transform: translateX(-50%);
        bottom: 0;
    }
}
</style>
