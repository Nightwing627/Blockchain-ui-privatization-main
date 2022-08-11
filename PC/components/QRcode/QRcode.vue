<template>
  <section class="common-QRcode" v-if="flag" @click="handleClick">
    <div class="common-QRcode-market u-7-bg"></div>
    <div class="common-QRcode-maxEvm h-2-bg">
      <img :src="imgUrl" alt="">
    </div>
  </section>
</template>
<script>
export default {
  name: 'c-QRcode',
  props: {
    imgUrl: {
      default: '',
      type: String,
    },
    flag: {
      default: false,
      type: Boolean,
    },
    name: {
      default: '',
      type: String,
    },
  },
  methods: {
    handleClick() {
      this.$emit('QRcodeClick');
    },
  },
};
</script>
<style lang="stylus" scoped>
.common-QRcode {
  .common-QRcode-market {
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 1001;
    top: 0;
    left: 0;
  }
  .common-QRcode-maxEvm {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1002;
    left: 50%;
    top: 50%;
    -webkit-transform: translate3d(-50%, -50%, 0);
    transform: translate3d(-50%, -50%, 0);
    padding: 10px;
    border-radius: 2px;
    img {
      min-width: 500px;
      max-width: 740px;
      min-height: 500px;
      max-height: 740px;
    }
  }
}
</style>
