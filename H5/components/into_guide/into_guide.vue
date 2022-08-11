// Created by 任泽阳 on 18/12/06.
// 登录/注册/重置密码 引导框
<template>
  <section class="into-guide" :style="backgroundImg">
    <div class="into-guide-center">
      <div class="into-logo">
        <img :src="intoLogoUrl" alt="" />
      </div>
      <slot/>
    </div>
  </section>
</template>
<script>
import { imgMap } from '@/utils';

export default {
  name: 'c-h-intoGuide',
  data() {
    return {
      backgroundImg: ` background: url(${imgMap.login})#0e1a2d`,
    };
  },
  computed: {
    templateLayoutType() {
      return this.$store.state.baseData.templateLayoutType;
    },
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
    },
    intLogoUrl() {
      let url = '';
      if (this.publicInfo && this.publicInfo.msg && this.publicInfo.msg.logoUrl) {
        url = this.publicInfo.msg.index_international_logo || imgMap.int_logo;
      }
      return url;
    },
    intoLogoUrl() {
      if (this.templateLayoutType === '2') {
        return this.intLogoUrl;
      }
      return '';
    },
  },
};
</script>
<style lang="stylus" scoped>
.into-guide {
  width: 100%;
  height: 0.98rem;
  position: relative;
  background-position: left top !important;
  background-size: 100% !important;
  .into-guide-center {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 0.98rem;
    display: inline-block;
  }
  .into-logo {
    display: none;
  }
}
</style>
