<template>
<div class="switchWrap">
<div class="switch" @click="toggle">
<span
class="circle"
:style="circleStyle"
:class="isChecked ? 'circleChecked a-12-bg' : 'circleCheckOut a-1-bg'"
></span>
<p :style="boxStyle" :class="isChecked ? 'switchBottomChecked a-14-bg' : 'switchBottom a-2-bg'"></p>
</div>
</div>
</template>
<script>
export default {
  name: 'c-h-switch',
  data() {
    return {
      isChecked: this.value,
    };
  },
  props: {
    width: {
      default: '30',
      type: String,
    }, // 该容器 width属性
    height: {
      default: '12',
      type: String,
    }, // 该容器 height属性
    // 开关上圆的宽度，默认14px
    circleWidth: {
      default: '18',
      type: String,
    },
    // 开关上圆的高度，默认14px
    circleHeight: {
      default: '18',
      type: String,
    },
    // 控制开关开启关闭
    value: {
      default: true,
      type: Boolean,
    },
  },
  computed: {
    boxStyle() {
      return {
        width: `${this.width / 100}rem`,
        height: `${this.height / 100}rem`,
        'border-radius': `${this.height / 100}rem`,
      };
    },
    circleStyle() {
      return {
        width: `${this.circleWidth / 100}rem`,
        height: `${this.circleHeight / 100}rem`,
        'border-radius': '50%',
        top: `${(this.height - this.circleHeight) / 200}rem`,
        left: '0rem',
      };
    },
  },
  watch: {
    value(val) {
      this.isChecked = val;
    },
    isChecked(val) {
      this.$emit('onchange', val);
    },
  },
  methods: {
    toggle() {
      this.$emit('click');
    },
  },
};
</script>
<style lang="stylus">
.switchWrap{
  cursor pointer;
position: relative;
.circle{
position: absolute;
}
.circleChecked{
transform: translateX(0.12rem);
transition: transform 0.35s cubic-bezier(0.4, 0.4, 0.25, 1.35);
}
.circleCheckOut{
transform: translateX(0);
transition: transform 0.35s cubic-bezier(0.4, 0.4, 0.25, 1.35);
}
.switchBottom{
}
.switchBottomChecked{
}
}
</style>
