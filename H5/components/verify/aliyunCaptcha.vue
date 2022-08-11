// Created by 任泽阳 on 18/12/07.
// 阿里云
<template>
  <section class="common-AliyunCaptcha" :style="contentStyle" id="common-AliyunCaptcha">
    <div class="ln" id="ln">
      <div v-bind:id="dynamicId"></div>
    </div>
    <!-- 错误文案占位 24px -->
    <div class="common-AliyunCaptcha-errorStence b-6-cl" v-if="errorHave">
      <!-- 错误信息容器 -->
      <p class="common-AliyunCaptcha-error" v-if="errorFlag">{{ errorText }}</p>
    </div>
  </section>
</template>
<script>
import VueScript2 from 'vue-script2';
import bowser from 'bowser';

export default {
  name: 'common-AliyunCaptcha',
  props: {
    width: { default: '100%', type: String }, // 该容器根容器 width属性
    marginTop: { default: '0px', type: String }, // 该组件根容器 margin-top属性
    errorHave: { default: false, type: Boolean }, // 是否有错误文案
    errorText: { default: '', type: String }, // 错误文案
    errorFlag: { default: false, type: Boolean }, // 错误文案是否显示
  },
  computed: {
    appkey() {
      return this.$store.state.baseData.publicInfo.nc.nc_appkey;
      // return 'FFFF0N000000000066A8';
      // return 'FFFF0000000001780E11';
    },
    prefix() {
      return this.$store.state.baseData.publicInfo.nc.nc_prefix;
    },
    dynamicId() {
      const ncId = `a${this.randomCode(10)}`;
      return ncId;
    },
    // 根容器 行内样式
    contentStyle() {
      return {
        width: this.width,
        marginTop: this.marginTop,
      };
    },
    lan() { return this.$store.state.baseData.lan; },
    alyLan() {
      let language = '';
      // 简体中文
      if (this.lan === 'zh_CN') {
        language = 'cn';
      // 繁体中文
      } else if (this.lan === 'el_GR') {
        language = 'tw';
      // 葡萄牙
      } else if (this.lan === 'en_US') {
        language = 'en';
      } else {
        const arr = [
          'ar_SA', // 阿拉伯文
          'de_DE', // 德文
          'es_ES', // 西班牙文
          'fr_FR', // 法文
          'in_ID', // 印尼语
          'it_IT', // 意大利文
          'iw_HE', // 希伯来语
          'ja_JP', // 日文
          'ko_KR', // 韓文
          'nl_NL', // 荷蘭文
          'pt_BR', // 波蘭文
          'ru_RU', // 俄文
          'th_TH', // 泰文
          'tr_TR', // 土耳其文
          'vi_VN', // 越南文
        ];
        if (arr.indexOf(this.lan) !== -1) {
          language = this.lan;
        }
      }
      if (!language.length) {
        language = 'en';
      }
      return language;
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    randomCode(length) {
      const arr = [];
      let str = '';
      arr.length = 10;
      arr.forEach(() => {
        str += Math.random().toString(36).substr(2);
      });
      return str.substr(0, length);
    },
    init() {
      // console.log(this.prefix)
      let nc = null;
      const scene = 'login'; // 场景,不可更改
      const token = [this.appkey, (new Date()).getTime(), Math.random()].join(':');
      const option = {
        renderTo: `#${this.dynamicId}`, // 渲染到该DOM ID指定的Div位置
        appkey: this.appkey,
        scene: this.prefix + scene,
        token,
        language: this.alyLan,
        callback: (data) => { // 校验成功回调
          this.$emit('callback', {
            verificationType: '1',
            csessionid: data.csessionid,
            sig: data.sig,
            token,
            scene,
            nc,
          });
        },
        error() {
          // console.log('error', s);
        },
        verifycallback() {
        },
      };
      this.$nextTick(() => {
        if (bowser.mobile) {
          VueScript2.load('//g.alicdn.com/sd/nch5/index.js?t=1497436353263')
            .then(() => {
              window.NoCaptcha.init(option);
              window.NoCaptcha.setEnabled(true);
              nc = window.NoCaptcha;
            });
        } else {
          VueScript2.load('//g.alicdn.com/sd/ncpc/nc.js?t=1497440454594')
            .then(() => {
              class F extends window.noCaptcha { }
              nc = new F();
              nc.init(option);
            });
        }
      });
    },
  },
};
</script>

<style lang="stylus">
// 错误信息占位容器
.common-AliyunCaptcha-errorStence {
    height: 24px;
    position: relative;
    // 错误文案容器
    .common-AliyunCaptcha-error {
      position: absolute;
      bottom: 2px;
      margin: 0;
      font-size: 12px;
      user-select:none;
    }
  }
.common-AliyunCaptcha {
  // 弹窗
  .nc-container .nc_scale .imgCaptcha, .nc-container .nc_scale .clickCaptcha {
    border: none;
  }
  .nc-container .clickCaptcha_text .btn_refresh {
    background: none
  }
  .nc-container .nc_scale .clickCaptcha div {
    height: 40px;
    line-height: 40px;
  }
  .nc-container .clickCaptcha_text .icon_close {
    line-height: 40px;
  }
  .clickCaptcha {
    width: 380px!important;
    top: 45px!important;
    box-shadow: 0px 2px 10px rgba(0,0,0,0.30)!important;
    padding-bottom: 30px!important;
    img {
      width: 300px!important;
    }
    .clickCaptcha_img {
      text-align: center!important;
    }
  }
  .imgCaptcha {
    width: 380px!important;
    min-height: 200px!important;
    box-sizing: border-box!important;
    border: none!important;
    top: 44px!important;
    padding: 40px!important;
    box-shadow: 0px 2px 10px rgba(0,0,0,0.30)!important;
    // input
    .imgCaptcha_text {
      margin: 0!important;
      height: 40px!important;
      width: 200px!important;
      box-sizing: border-box!important;
      overflow: hidden!important;
      border-bottom-width: 2px!important;
      border-bottom-style: solid!important;
      input {
        box-sizing: border-box!important;
        width: 100%!important;
        height: 100%!important;
        margin: 0!important;
      }
    }
    // 图
    .imgCaptcha_img {
      margin: 0!important;
      width: 100px!important;
      height: 40px!important;
      img {
        width: 100px!important;
        height: 40px!important;
        display: block!important;
      }
    }
    .btn_refresh {
      background: none;
    }
    // button
    .imgCaptcha_btn {
      background: none!important;
      width: 100%!important;
      margin: 40px 0 0 0!important;
      padding: 0!important;
      // 错误
      .nc_captcha_img_text {
        background: none;
      }
      .nc_scale_submit {
        width: 100%;
        height: 40px;
        line-height: 40px;
        border-radius: 2px;
        font-size: 14px;
      }
    }
  }
  .ln {
    padding: 0;
    .nc_wrapper {
      width: 100% !important;
    }
    // 滑条背景  nc_bg滑动后一系列状态背景 scale_text2为未滑动
    .nc-container .nc_scale .nc_bg
    .nc-container .nc_scale .scale_text2 {
      border-radius: 2px;
    }
    // 滑块滑动后 ok状态
    .nc-container .nc_scale .btn_ok {
      line-height: 40px;
      top: -1px;
      width: 56px!important;
      height: 40px;
      line-height: 40px;
      border: none;
      border-radius: 2px;
    }
    .nc-container .nc_scale .scale_text {
      line-height: 40px;
    }
    .nc-container .clickCaptcha .clickCaptcha_img img {
      margin: 0;
    }
    // 初始
    .nc_scale {
      height: 40px;
      line-height: 40px;
      border-radius: 2px;
      // 划块
      .btn_slide {
        line-height: 40px;
        top: -1px;
        width: 56px;
        height: 40px;
        line-height: 40px;
        border: none;
        border-radius: 2px;
      }
    }
  }
}
</style>
