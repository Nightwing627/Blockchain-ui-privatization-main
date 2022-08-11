<template>
  <section
    class='common-iconButton'
    @click.stop='handClick'
    @mousedown='handMouseDown'
    @mouseup='handMouseUp'
    @mouseenter='handMouseenter'
    @mouseleave='handMouseleave'
  >
    <div class='iconButton-icon'><slot /></div>
    <div class='iconButton-bg' :class='bgClass'></div>
  </section>
</template>

<script>
export default {
  name: 'c-iconButton',
  data() {
    return {
      isHover: false,
      isClick: false,
    };
  },
  props: {
    havebg: { default: false, type: Boolean },
  },
  computed: {
    bgClass() {
      let str = '';
      if (this.isHover || this.havebg) {
        str = 'iconButton-hover';
      }
      if (this.isClick) {
        str = 'iconButton-active';
      }
      return str;
    },
  },
  methods: {
    handClick() {
      this.$emit('click');
    },
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
  },
};
</script>

<style lang='stylus' scoped>
.common-iconButton {
  width: 36px;
  height: 36px;
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  .iconButton-icon {
    width: 36px;
    height: 36px;
    position: absolute;
    left: 0;
    top: 0;
    text-align: center;
    line-height: 36px;
  }
  .iconButton-bg {
    width: 36px;
    height: 36px;
  }
  .iconButton-hover {
    background: #fff;
    opacity: 0.15;
  }
  .iconButton-active {
    background: #fff;
    opacity: 0.3;
  }
}
</style>
