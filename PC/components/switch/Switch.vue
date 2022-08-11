<template>
  <div class='switchWrap'>
    <div class='switch' @click='toggle'>
      <span
              class='circle'
              :style='circleStyle'
              :class='isChecked ? "circleChecked a-12-bg" : "circleCheckOut a-1-bg"'
      />
      <p
              :style='boxStyle'
              :class='
          isChecked ? "switchBottomChecked a-14-bg" : "switchBottom a-2-bg"
        '
      />
    </div>
  </div>
</template>
<script>
export default {
  name: 'c-switch',
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
        width: `${this.width}px`,
        height: `${this.height}px`,
        'border-radius': `${this.height}px`,
      };
    },
    circleStyle() {
      return {
        width: `${this.circleWidth}px`,
        height: `${this.circleHeight}px`,
        'border-radius': '50%',
        top: `${(this.height - this.circleHeight) / 2}px`,
        left: '0px',
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
<style lang='stylus'>
.switchWrap{
  cursor pointer;
position: relative;
.circle{
position: absolute;
}
.circleChecked{
transform: translateX(12px);
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
