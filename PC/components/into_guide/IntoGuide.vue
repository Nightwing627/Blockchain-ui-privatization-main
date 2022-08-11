// Created by 任泽阳 on 18/12/06. // 登录/注册/重置密码 引导框
<template>
  <section class='into-guide' :style='backgroundImg'>
    <div class='into-guide-center'>
      <div class='into-logo'>
        <img :src='intoLogoUrl' alt='' />
      </div>
      <slot />
    </div>
  </section>
</template>
<script>
export default {
  name: 'c-intoGuide',
  props: {
    imgMap: {
      type: Object,
      default: () => {},
      required: true,
    },
  },
  data() {
    const { imgMap } = this;
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
      const { imgMap } = this;
      let url = '';
      if (
        this.publicInfo
        && this.publicInfo.msg
        && this.publicInfo.msg.logoUrl
      ) {
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
<style lang='stylus' scoped>
.into-guide {
  width: 100%;
  height: 200px;
  // background: #1D2635;
  position: relative;
  background-position: left top;
  .into-guide-center {
    position: absolute;
    top: 0;
    left: 50%;
    transform:translateX(-50%);
    height: 200px;
    display: inline-block;
  }
  .into-logo {
    display: none;
  }
}
// 国际版
.Int {
  .into-guide {
    background: none !important;
    height: auto;
    .into-guide-center {
      width: 380px;
      text-align: left;
      padding-top: 90px;
      position: relative;
      height: auto;
      .into-logo {
        display: block;
        width: 50px;
        margin-bottom: 35px;
        img {
          width: 50px;
        }
      }
      p {
        margin: 0;
        font-size: 32px;
        line-height: 32px;
        text-align: left;
      }
      .guide-text {
        font-size: 12px;
        line-height: 16px;
        text-align: left;
        padding: 7px 0 0 0;
        margin: 0;
        .goRegister {
          font-size: 12px;
        }
      }
    }
  }
}
</style>
