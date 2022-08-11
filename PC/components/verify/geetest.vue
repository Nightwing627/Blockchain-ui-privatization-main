// Created by 任泽阳 on 18/12/07. // 极验
<template>
  <section class='common-geetest' :style='contentStyle'>
    <!-- 基础部分 占位42px -->
    <div
      class='common-geetest-baseStance a-2-bd'
      :class='baseStanceClass'
      @mouseenter='handMouseenter'
      @mouseleave='handMouseleave'
    >
      <div v-if='!isReady' class='common-geetest-loading'>
        <c-loading size='20' />
      </div>
      <div id='captchaBox' class='a-5-bg' ref='captchaBox'></div>
      <!-- 选中时横线 -->
      <span
        class='common-geetest-activeLine'
        :class='activeLineClass'
        :style='activeLineStyle'
      ></span>
    </div>
    <!-- 错误文案占位 24px -->
    <div class='common-geetest-errorStence b-6-cl' v-if='errorHave'>
      <!-- 错误信息容器 -->
      <p class='common-geetest-error' v-if='errorFlag'>{{ errorText }}</p>
    </div>
  </section>
</template>
<script>
export default {
  name: 'common-geetest',
  data() {
    return {
      nowState: false, // 当前状态 true可滑动 false不可滑动 用于下划线时判断
      isHover: false, // 是否划过
      isReady: false, // 是否准备成功
    };
  },
  props: {
    product: { default: '', type: String },
    width: { default: '100%', type: String }, // 该容器根容器 width属性
    marginTop: { default: '0px', type: String }, // 该组件根容器 margin-top属性
    errorHave: { default: false, type: Boolean }, // 是否有错误文案
    errorText: { default: '', type: String }, // 错误文案
    errorFlag: { default: false, type: Boolean }, // 错误文案是否显示
    geetestBg: { default: 'a-7-bg', type: String }, // 极验的背景颜色
    colorMap: { default: () => {}, required: true },
  },
  computed: {
    lan() {
      return this.$store.state.baseData.lan;
    },
    geetestLan() {
      let language = '';
      // 简体中文
      if (this.lan === 'zh_CN') {
        language = 'zh-cn';
        // 繁体中文
      } else if (this.lan === 'el_GR') {
        language = 'zh-hk';
        // 葡萄牙
      } else if (this.lan === 'pt_PT') {
        language = 'pt-pt';
      } else {
        const arr = [
          'en', // 英文
          'ja', // 日文
          'id', // 印尼
          'ko', // 韩语
          'ru', // 俄语
          'ar', // 阿拉伯
          'es', // 西班牙语
          'fr', // 法语
          'de', // 德语
        ];
        if (this.lan.length && this.lan.split('_').length) {
          if (arr.indexOf(this.lan.split('_')[0].toLowerCase()) !== -1) {
            const [lans] = this.lan.split('_');
            language = lans;
          }
        }
      }
      if (!language.length) {
        language = 'en';
      }
      return language;
    },
    // 根容器 行内样式
    contentStyle() {
      return {
        width: this.width,
        marginTop: this.marginTop,
      };
    },
    // 基础占位容器 class
    baseStanceClass() {
      if (this.errorHave && this.errorFlag) {
        return 'common-geetest-baseStance-error';
      }
      return '';
    },
    // 下横向 行内样式
    activeLineStyle() {
      let width = '0%';
      if (
        (this.nowState && this.isHover)
        || (this.errorHave && this.errorFlag)
      ) {
        width = '100%';
      }
      return {
        width,
      };
    },
    // 下横线 class
    activeLineClass() {
      let className = 'a-12-bg';
      if (this.errorHave && this.errorFlag && !this.isFocus) {
        className = 'a-19-bg';
      }
      return className;
    },
  },
  created() {
    this.init();
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
    init() {
      this.axios({
        url: 'common/tartCaptcha',
        headers: {},
        params: {},
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          this.geetest({
            challenge: data.data.captcha.challenge,
            gt: data.data.captcha.gt,
            success: data.data.captcha.success,
          });
        }
      });
    },
    setStyle() {
      const { colorMap } = this;
      const radar = document.getElementsByClassName(
        'geetest_radar_tip_content',
      );
      const reset = document.getElementsByClassName(
        'geetest_reset_tip_content',
      );
      const geetestRadarBtn = document.getElementsByClassName(
        'geetest_radar_btn',
      );
      const geetestSuccessBtn = document.getElementsByClassName(
        'geetest_success_btn',
      );

      if (colorMap) {
        if (radar && radar.length) {
          radar[0].style.color = colorMap['b-2-cl'];
        }
        if (reset && reset.length) {
          reset[0].style.color = colorMap['b-2-cl'];
        }
        if (geetestRadarBtn && geetestRadarBtn.length) {
          geetestRadarBtn[0].style.background = colorMap[this.geetestBg];
        }
        if (geetestSuccessBtn && geetestSuccessBtn.length) {
          geetestSuccessBtn[0].style.background = colorMap[this.geetestBg];
        }
      }
    },
    // 构件极验
    geetest({ challenge, gt, success }) {
      const product = this.product ? this.product : 'popup';
      window.initGeetest(
        {
          // 以下 4 个配置参数为必须，不能缺少
          product,
          lang: this.geetestLan,
          gt,
          challenge,
          offline: !success, // 表示用户后台检测极验服务器是否宕机
          new_captcha: true, // 用于宕机时表示是新验证码的宕机
          width: '100%',
        },
        (captchaObj) => {
          this.nowState = true;
          captchaObj.appendTo(this.$refs.captchaBox);
          this.$emit('getCaptchaObj', captchaObj);
          captchaObj.onReady(() => {
            this.isReady = true;
            this.$nextTick(() => {
              this.setStyle();
            });
          });
          captchaObj.onError(() => {});
          captchaObj.onSuccess(() => {
            this.nowState = false;
            const result = captchaObj.getValidate();
            setTimeout(() => {
              this.$emit('callback', {
                geetest_challenge: result.geetest_challenge,
                geetest_seccode: result.geetest_seccode,
                geetest_validate: result.geetest_validate,
                verificationType: '2',
                token: true,
                nc: Object.assign(captchaObj, { reset: captchaObj.reset }),
              });
            }, 300);
          });
        },
      );
    },
  },
};
</script>
<style lang='stylus'>
// 根容器
.common-geetest {
  // 基础占位容器 (默认)
  .common-geetest-baseStance {
    position: relative;
    height: 38px;
    border-bottom-width: 2px;
    border-bottom-style: solid;
    // 下划线动效容器
    .common-geetest-activeLine {
      position: absolute;
      top: 38px;
      height: 2px;
      width: 0%;
      left: 50%;
      transform: translateX(-50%);
      display: inline-block;
      -webkit-transition: 0.5s;
      transition: 0.5s;
      animation-delay: 0.5s
    }
    // loading容器
    .common-geetest-loading {
      position: absolute;
      height: 30px;
      line-height: 30px;
      bottom: 0;
      left: 0;
      width: 100%;
      font-size: 14px
    }
  }
  // 基础占位容器 (错误时)
  .common-geetest-baseStance-error {
  }
  // 错误信息占位容器
  .common-geetest-errorStence {
    height: 24px;
    position: relative;
    // 错误文案容器
    .common-geetest-error {
      position: absolute;
      bottom: 2px;
      margin: 0;
      font-size: 12px;
      user-select:none;
    }
  }
}

// 极验样式部分
#captchaBox {
  // 极验 自身最外层盒子
  .geetest_wind {
    height: 38px;
  }
  // 初始状态 小icon部分
  .geetest_radar {
    width: 24px;
    height: 24px;
    top: 3px;
  }
  // 初始状态 重试状态 文字部分
  .geetest_radar_tip_content, geetest_reset_tip_content {
    font-size: 14px;
  }
  .geetest_reset_tip_content
  // 文字部分盒子
  .geetest_radar_tip {
    height: 38px;
    line-height: 42px;
  }
  // 等待状态
  .geetest_holder.geetest_wind.geetest_radar_click_ready .geetest_radar_tip {
    opacity: 1
  }
  // loading
  .geetest_radar_btn {
  }
  .geetest_holder.geetest_wind .geetest_radar_btn ,
  .geetest_holder.geetest_wind .geetest_radar_btn:hover{
    background: none;
    border: none;
  }
  // 成功后
  .geetest_holder.geetest_wind .geetest_success_btn,
  .geetest_holder.geetest_wind .geetest_success_btn:hover {
    border: none;
    height: 38px;
    background-color transparent;
  }
  .geetest_holder.geetest_wind .geetest_success_btn .geetest_success_box .geetest_success_show {
    background: none;
    border: none;
  }
  .geetest_logo,
  .geetest_success_logo {
    display: none;
  }
}
</style>
