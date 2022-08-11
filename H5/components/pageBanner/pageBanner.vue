<template>
  <div
    class="page-banner"
    :class="className"
    :style="bannerStyle">
    <h2 class="title f-8-cl">{{title}}</h2>
  </div>
</template>
<script>
import { imgMap } from '@/utils';

export default {
  name: 'c-h-pageBanner',
  props: {
    title: {
      type: String,
      default: '帮助中心',
    },
    className: {
      type: [String, Array],
      default: '',
    },
    backgroungImgUrl: {
      type: String,
      default: '',
    },
    styles: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    bannerStyle() {
      let style = {};
      style.background = `url(${imgMap.inforHeadBg})`;
      if (this.backgroungImgUrl) {
        style.background = `url(${this.backgroungImgUrl})`;
      }
      if (this.styles) {
        style = Object.assign(style, this.styles);
      }
      return style;
    },
  },
};
</script>
<style lang="stylus">
  .page-banner {
    height: 200px;
    padding-top: 1px;
    margin-top: 0px;
    text-align: center;
    background-repeat: no-repeat !important;
    background-position: center bottom !important;
    background-size: cover !important;
    .title {
      font-weight: normal;
      margin: 70px 0 20px;
    }
  }
</style>
