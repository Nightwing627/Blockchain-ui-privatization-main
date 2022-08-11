// Created by 任泽阳 on 18/12/12.
// 验证
<template>
  <section class="common-verify" :key="name">
    <!-- 极验 -->
    <Geetest v-if="verificationType === '2'"
      @callback="callback"
      @getCaptchaObj="getCaptchaObj"
      :width='width'
      :product="product"
      :marginTop='marginTop'
      :errorHave='errorHave'
      :errorText='errorText'
      :errorFlag='errorFlag'
      :geetestBg="geetestBg"/>
    <!-- 阿里 -->
    <AliyunCaptcha v-if="verificationType === '1'"
      @callback="callback"
      :width='width'
      :marginTop='marginTop'
      :errorHave='errorHave'
      :errorText='errorText'
      :errorFlag='errorFlag'/>
  </section>
</template>
<script>
import AliyunCaptcha from './aliyunCaptcha.vue';
import Geetest from './geetest.vue';

export default {
  name: 'c-h-verify',
  props: {
    product: { default: '', type: String },
    name: { default: '', type: String },
    width: { default: '100%', type: String }, // 该容器根容器 width属性
    marginTop: { default: '0px', type: String }, // 该组件根容器 margin-top属性
    errorHave: { default: false, type: Boolean }, // 是否有错误文案
    errorText: { default: '', type: String }, // 错误文案
    errorFlag: { default: false, type: Boolean }, // 错误文案是否显示
    geetestBg: { default: 'a-7-bg', type: String }, // 极验的背景颜色
  },
  components: {
    AliyunCaptcha,
    Geetest,
  },
  computed: {
    verificationType() {
      const { publicInfo } = this.$store.state.baseData;
      let type = '0';
      if (publicInfo && publicInfo.switch && publicInfo.switch.verificationType) {
        type = publicInfo.switch.verificationType;
      }
      return type;
    },
  },
  methods: {
    callback(item) {
      this.$emit('callback', item);
    },
    getCaptchaObj(captchaObj) {
      this.$emit('getCaptchaObj', captchaObj);
    },
  },
};
</script>
<style lang="stylus">
.common-verify{
  position relative
  z-index 1
}
</style>
