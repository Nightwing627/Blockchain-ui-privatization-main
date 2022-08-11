// Created by 王晓波. // 左侧导航 // *****************************
<template>
  <aside :style='boxStyle' class='navMenu t-2-bg'>
    <ul class='navMenuList'>
      <li
        v-for='(item, idx) in navList'
        :key='idx'
        @click='listTextChange(item)'
        :style='lineHeightStyle1(item)'
        :class='returnClass(item)'
        class='a-7-bd'
        :id='item.id'
        @mouseenter='handMouseenter(item)'
        @mouseleave='handMouseleave'
      >
        <i
          :class='item.iconClass'
          :style='topStyle'
          v-show='item.type == 1'
          v-html='
            navListActive == item.id || hoverId == item.id
              ? item.activeIconSvg
              : item.iconSvg
          '
        ></i>
        <span v-text='item.navText'></span>
        <b
          :style='heightStyle(item)'
          class='activeBorder a-12-bg'
          v-if='navListActive == item.id'
        ></b>
      </li>
    </ul>
  </aside>
</template>
<script>
export default {
  name: 'c-navMenu',
  data() {
    return {
      hoverId: '',
    };
  },
  props: {
    // 组件整体宽度
    width: {
      default: '190',
      type: [Number, String],
    },
    // 元素行高
    lineHidth1: {
      default: '56',
      type: [Number, String],
    },
    // 元素行高
    subLineHidth: {
      default: '56',
      type: [Number, String],
    },
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
    // 组件整体宽度
    boxStyle() {
      return {
        width: `${this.width}px`,
      };
    },
    topStyle() {
      return {
        top: `${(this.lineHidth1 - 18) / 2}px`,
      };
    },
  },
  methods: {
    lineHeightStyle1(item) {
      if (item.type === 1) {
        return {
          'line-height': `${this.lineHidth1}px`,
        };
      }
      return {
        'line-height': `${this.subLineHidth}px`,
      };
    },
    heightStyle(item) {
      if (item.type === 1) {
        return {
          'line-height': `${this.lineHidth1}px`,
        };
      }
      return {
        'line-height': `${this.subLineHidth}px`,
      };
    },
    // 菜单栏点击事件
    listTextChange(item) {
      this.$emit('listChange', item);
    },
    handMouseenter(item) {
      this.hoverId = item.id;
    },
    handMouseleave() {
      this.hoverId = '';
    },
    returnClass(item) {
      let str = '';
      if (this.navListActive === item.id) {
        str = 'listActive a-4-bg b-1-cl';
      } else if (this.hoverId === item.id) {
        str = 'listActive b-1-cl a-4-bg';
      } else {
        str = 'nolistActive a-5-bg b-2-cl';
      }
      if (item.type === 1) {
        str = `${str} medium`;
      }
      if (item.type === 2) {
        str = `${str} min-medium`;
      }
      return str;
    },
  },
};
</script>
<style lang='stylus'>
.navMenu {
  .navMenuList{
    li{
      position: relative;
      cursor: pointer;
      transition: all 0.5s;
      i {
        position: absolute;
        width: 16px;
        text-align: center;
        height: 18px;
        line-height: 18px;
        left: 20px;
      }
      span{
        font-family: PingFangSC-Regular;
        font-size: 14px;
        letter-spacing: 0;
        line-height: 16px;
        margin-left: 49px;
      }
      b {
        width: 3px;
        position: absolute;
        top: 0;
        left: 0;
      }
    }
    .listActive {
      box-sizing: border-box;
      position: relative;
    }
  }
}
// 国际版
.Int {
  .navMenu {
  .navMenuList{
    li{
      border-bottom-width: 1px;
      border-bottom-style: solid;
      b.activeBorder {
        display: none;
      }
    }
  }
}
}
</style>
