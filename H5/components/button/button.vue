// Created by 任泽阳 on 18/12/06.
// 按钮组件
// *****************************
// 注 1.该组件必须传入type
// 注 2.组件内容通过slot传入
<template>
<!--  -->
  <button
    class="common-button"
    :style="contentStyle"
    :class="`${allClass} ${className}`"
    @click.stop="handClick"
    ref="button"
    @mousedown="handMouseDown"
    @mouseup="handMouseUp"
    @mouseenter="handMouseenter"
    @mouseleave="handMouseleave"
  >
    <div class="common-button-slot">
      <c-h-loading size="10" className="common-button-loading" v-if="loading" colorName="b-1-cl"/>
      <slot/>
    </div>
    <!-- 用于实心按钮 滑过和点击 -->
    <div v-if="solidBcClass" class="solidBc" :class="solidBcClass"></div>
    <!-- 动画 -->
  </button>
</template>
<script>

export default {
  name: 'c-h-button',
  data() {
    return {
      flag: true,
      wH: 0, // 动画变量
      nX: 0, // 动画变量
      nY: 0, // 动画变量
      canvClass: '', // 动画class
      isHover: false,
      isClick: false,
    };
  },
  props: {
    name: { default: '', type: String },
    // 类型   实心-solid 空心-hollow 文本-test
    type: {
      validator(val) {
        return ['solid', 'hollow', 'text'].indexOf(val) !== -1;
      },
      default: 'solid',
    },
    className: { default: '', type: String }, // 根容器class 默认样式 不要传进来选中样式和滑过样式
    // *** 如果要配置颜色组 需要传入一整套颜色
    defaultColorClass: { default: '', type: String }, // 该组件默认颜色组
    hoverColorClass: { default: '', type: String }, // 该组件滑过颜色组 仅空心按钮 框线按钮
    activeColorClass: { default: '', type: String }, // 该组件选中颜色组 仅空心按钮 框线按钮
    // ***
    disabled: { default: false, type: Boolean }, // 是否禁用 (!** 该属性仅存在solid类型 **!)
    loading: { default: false, type: Boolean }, // 是否loading  (!** 该属性仅存在solid类型 **!)
    big: { default: false, type: Boolean }, // 是否为略大button  (!** 该属性仅存在hollow类型 **!)
    kind: { default: false, type: Boolean }, // false为蓝色系 true为灰色系  (!** 该属性仅存在text类型 **!)
    paddingW: { default: '', type: String }, // 左右padding
    height: { default: '', type: String }, // 该容器根容器 height属性
    width: { default: '', type: String }, // 该容器根容器 width属性
    marginTop: { default: '0px', type: String }, // 该组件根容器 margin-top属性
  },
  created() {
    // 错误处理： 如果 disable和loading同时存在
    if (this.disabled && this.loading) {
      this.flag = false; // 不展示组件
      // throw('Common-button: disable 和 loading 只可存在一个') // 抛错
      // console.error('Common-button: disable 和 loading 只可存在一个');
    }
    this.$bus.$on('button-click', (name) => {
      if (name === this.name) {
        this.handClick();
      }
    });
  },
  computed: {
    // overClass() {
    //   let className = ''
    //   if(this.type === 'solid') { return className }
    //   if(this.isHover) {
    //     if(this.type === 'hollow') {
    //       // if(this.big) {  }
    //       return 'a-12-bd'
    //     }
    //   }
    // },
    // 用于实心按钮 滑过和点击
    solidBcClass() {
      let className = null;
      if (this.type === 'solid' && !this.loading && !this.disabled) {
        if (this.isHover) { className = 'u-14-bg'; }
        if (this.isClick) { className = 'u-15-bg'; }
      }
      return className;
    },
    contentStyle() {
      let { width, height, paddingW } = this.$props;
      const hollowH = this.big ? '0.3rem' : '0.24rem';
      switch (this.type) {
        // 实心
        case 'solid':
          width = width === '' ? '' : width;
          height = height === '' ? '0.40rem' : height;
          paddingW = paddingW === '' ? '0.2rem' : paddingW;
          break;
        // 空心
        case 'hollow':
          width = width === '' ? '' : width;
          height = height === '' ? hollowH : height;
          paddingW = paddingW === '' ? '0.2rem' : paddingW;
          break;
        // 文本
        case 'text':
          width = width === '' ? '' : width;
          height = height === '' ? '0.24rem' : height;
          paddingW = paddingW === '' ? '0.1rem' : paddingW;
          break;
        default:
          break;
      }
      return {
        width,
        height,
        paddingLeft: paddingW,
        paddingRight: paddingW,
        marginTop: this.marginTop,
      };
    },
    // 整理当前类型和状态
    nowType() {
      let type = 'solid';
      if (this.type === 'solid') {
        type = 'solid';
        if (this.loading) { type = 'solid-loading'; }
        if (this.disabled) { type = 'solid-disabled'; }
      } else if (this.type === 'hollow') {
        type = 'hollow';
        if (this.big) { type = 'hollow-big'; }
      } else if (this.type === 'text') {
        type = 'text';
        if (this.kind) { type = 'text-king'; }
      }
      return type;
    },
    // 基础样式
    infoClass() {
      switch (this.nowType) {
        // 实心
        case 'solid':
          return 'common-button-solid';
        case 'solid-loading':
          return 'common-button-solid-loading';
        case 'solid-disabled':
          return 'common-button-solid-disabled';
        // 框线
        case 'hollow':
          return 'common-button-hollow';
        case 'hollow-big':
          return 'common-button-hollow-big';
        // 文本
        case 'text':
          return 'common-button-text';
        case 'text-king':
          return 'common-button-text-kind';
        default:
          return 'common-button-solid';
      }
    },
    // 元素默认颜色
    defaultColor() {
      if (this.defaultColorClass.length > 0) { return this.defaultColorClass; }
      switch (this.nowType) {
        // 实心
        case 'solid':
          return 'u-8-bg u-16-cl'; // ( class 背景色-蓝 字体色-白 )
        case 'solid-loading':
          return 'u-8-bg u-16-cl'; // ( class 背景色-蓝 字体色-白 )
        case 'solid-disabled':
          return 'u-11-bg u-16-cl'; // ( class 背景色-灰 字体色-白 )
        // 框线
        case 'hollow':
          return 'u-16-cl u-11-bd'; // ( class 字体色-灰 边框色-灰 )
        case 'hollow-big':
          return 'u-16-cl u-8-bd'; // ( class 字体色-灰 边框色-蓝 )
        // 文本
        case 'text':
          return 'u-8-cl'; // ( class 字体色-蓝 )
        case 'text-king':
          return 'u-11-cl'; // ( class 字体色-灰 )
        default:
          return 'u-8-bg u-11-cl'; // ( class 背景色-蓝 字体色-白 )
      }
    },
    // 元素滑过颜色
    hoverColor() {
      if (this.hoverColorClass.length > 0) { return this.hoverColorClass; }
      switch (this.nowType) {
        // 实心
        case 'solid':
          return 'u-8-bg u-16-cl'; // ( class 背景色-蓝 字体色-白 )
        case 'solid-loading':
          return 'u-8-bg u-16-cl'; // ( class 背景色-蓝 字体色-白 )
        case 'solid-disabled':
          return 'u-11-bg u-16-cl'; // ( class 背景色-灰 字体色-白 )
        // 框线
        case 'hollow':
          return 'u-8-cl u-8-bd'; // ( class 字体色-蓝 边框色-蓝 )
        case 'hollow-big':
          return 'u-8-cl u-8-bd'; // ( class 字体色-蓝 边框色-蓝 )
        // 文本
        case 'text':
          return 'u-8-cl u-9-bg'; // ( class 字体色 )
        case 'text-king':
          return 'u-11-cl u-12-bg'; // ( class 字体色 )
        default:
          return 'u-8-bg u-11-cl'; // ( class 背景色 字体色 )
      }
    },
    // 元素点击颜色
    activeColor() {
      if (this.activeColorClass.length > 0) { return this.activeColorClass; }
      switch (this.nowType) {
        // 实心
        case 'solid':
          return 'u-8-bg u-16-cl'; // ( class 背景色-蓝 字体色-白 )
        case 'solid-loading':
          return 'u-8-bg u-16-cl'; // ( class 背景色-蓝 字体色-白 )
        case 'solid-disabled':
          return 'u-12-bg u-16-cl'; // ( class 背景色-灰 字体色-白 )
        // 框线
        case 'hollow':
          return 'u-8-cl u-8-bd'; // ( class 字体色-蓝 边框色-蓝 )
        case 'hollow-big':
          return 'u-8-cl u-8-bd'; // ( class 字体色-蓝 边框色-蓝 )
        // 文本3
        case 'text':
          return 'u-8-cl u-10-bg'; // ( class 字体色 )
        case 'text-king':
          return 'u-11-cl u-12-bg'; // ( class 字体色 )
        default:
          return 'u-8-bg u-11-cl'; // ( class 背景色 字体色 )
      }
    },
    allClass() {
      let colorClass = this.defaultColor;
      if (this.isHover) { colorClass = this.hoverColor; }
      if (this.isClick) { colorClass = this.activeColor; }
      return `${this.infoClass} ${colorClass}`;
    },
    // 特效点击点
    canvStyle() {
      return {
        width: `${this.wH}px`,
        height: `${this.wH}px`,
        left: `${this.nX}px`,
        top: `${this.nY}px`,
      };
    },
  },
  methods: {
    // input 鼠标划入
    handMouseenter() {
      this.isHover = true;
    },
    // input 鼠标划出
    handMouseleave() {
      this.isHover = false;
    },
    handMouseDown() {
      this.isClick = true;
    },
    handMouseUp() {
      this.isClick = false;
    },
    handClick() {
      if (this.disabled || this.loading) return;
      this.$emit('click');
    },
  },
};
</script>

<style lang="stylus">
.solidBc {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}
// 实心按钮
solid-style() {
  height: 0.40rem;
  line-height: 0.40rem;
}
// 实心按钮 -- 默认
.common-button-solid {
  font-size: 0.14rem;
}

// 实心按钮 -- 禁止
.common-button-solid-disabled {
  font-size: 0.14rem;
  cursor: not-allowed!important
}

// 实心按钮 -- 等待
.common-button-solid-loading {
  font-size: 0.14rem;
  cursor: wait!important
}

// 空心按钮
.common-button-hollow, .common-button-hollow-big {
  border-width: 1px;
  border-style: solid;
}
.common-button-hollow {
  font-size: 0.12rem;
}
.common-button-hollow-big {
  font-size: 0.14rem
}

// 文本按钮
.common-button-text,
.common-button-text-kind {
  font-size: 0.12rem;
}
.common-button {
  transition: all 0.3s;
  box-sizing: border-box;
  border-radius: 2px;
  position: relative;
  overflow: hidden;
  text-align: center;
  cursor: pointer;
  user-select: none;
  display: inline-block;
  .common-button-slot {
    position: relative;
    display: inline;
    vertical-align: middle;
    .common-button-loading {
      position: absolute;
      vertical-align: middle;
      left: -14px;
      top: 56%;
      transform: translateY(-50%)
    }
  }
  .button-background {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
  }
}
.button-canv {
  position: absolute;
  left: 0.20rem;
  top: 0.20rem;
  transform: scale(0);
}
.mmd-waves-effect {
  border-radius: 100%;
  background-color: #D8D8D8;

}

.mmd-waves-effect-animation {
  animation: mmd-maves-animation-definition 0.8s ease-out;
  /* 兼容各大浏览器 */
  -moz-animation: mmd-maves-animation-definition 0.8s ease-out;
  -webkit-animation: mmd-maves-animation-definition 0.8s ease-out;
  -o-animation: mmd-maves-animation-definition 0.8s ease-out;
}

@keyframes mmd-maves-animation-definition {
  from {
    transform: scale(0.1);
    opacity: 0.5;
  }

  to {
    transform: scale(2); /* 因为涟漪的大小为标签的最长边，为了保证点击标签边缘时，涟漪也能覆盖整个标签，scale值最小应为2 */
    opacity: 0;
  }
}

@keyframes mmd-maves-animation-definition {
  from {
    transform: scale(0.1);
    opacity: 0.5;
  }

  to {
    transform: scale(2); /* 因为涟漪的大小为标签的最长边，为了保证点击标签边缘时，涟漪也能覆盖整个标签，scale值最小应为2 */
    opacity: 0;
  }
}

@keyframes mmd-maves-animation-definition {
  from {
    transform: scale(0.1);
    opacity: 0.5;
  }

  to {
    transform: scale(2); /* 因为涟漪的大小为标签的最长边，为了保证点击标签边缘时，涟漪也能覆盖整个标签，scale值最小应为2 */
    opacity: 0;
  }
}

@keyframes mmd-maves-animation-definition {
  from {
    transform: scale(0.1);
    opacity: 0.5;
  }

  to {
    transform: scale(2); /* 因为涟漪的大小为标签的最长边，为了保证点击标签边缘时，涟漪也能覆盖整个标签，scale值最小应为2 */
    opacity: 0;
  }
}

</style>
