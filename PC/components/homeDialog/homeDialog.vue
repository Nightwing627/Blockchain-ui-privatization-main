<template>
  <section class="common-homeDialog">
    <!-- 背景遮罩层 -->
    <div class="dialog-markAll u-7-bg" v-if="showFlag"></div>
    <!-- 弹出框 -->
    <transition name="drop">
      <div class="dialog-frame a-5-bg" v-if="showFlag" ref="dialog">
        <!-- 富文本类 -->
        <div v-if="dialogType === 'text'">
          <div class="dialog-frame-head a-4-bg">
            <span class="dialog-frame-head-text b-1-cl">{{ titleText }}</span>
            <span class="dialog-frame-head-close">
              <c-iconButton @click="close">
                <svg class="icon icon-16" aria-hidden="true">
                  <use xlink:href="#icon-c_7" />
                </svg>
              </c-iconButton>
            </span>
          </div>
          <div class="dialog-frame-body">
            <section v-html="htmlText"></section>
          </div>
          <div class="dialog-frame-bottom a-4-bg" v-if="haveOption">
            <div
              class="dialog-frame-options"
              :class="!haveTwo ? 'dialog-frame-options-oneBtn' : ''"
            >
              <c-button
                type="text"
                paddingW="31px"
                height="40px"
                @click="twoClick"
                class="closeBtnClass"
                v-if="haveTwo"
              >{{ twoText }}</c-button>
              <c-button type="solid" paddingW="31px" height="40px" @click="oneClick">
                {{ oneText }}</c-button>
            </div>
          </div>
        </div>
        <!-- 图片类 -->
        <div class="dialog-imgBox" v-else>
          <span class="dialog-imgBox-close">
            <c-iconButton @click="close" :havebg="true">
              <svg class="icon icon-16" aria-hidden="true">
                <use xlink:href="#icon-c_7" />
              </svg>
            </c-iconButton>
          </span>
          <img style="width: 100%; display: block" :src="imgUrl" alt @click="imgClick" />
        </div>
      </div>
    </transition>
  </section>
</template>
<script>
// 按钮
import {
  setCookie,
  getCookie,
} from '@/utils';

export default {
  name: 'c-homeDialog',
  data() {
    return {
      dialogType: 'text', // 弹窗类型 text / img
      showFlag: false, // 展示变量
      titleText: '', // 富文本类 -- 提示文案
      oneText: '', // 富文本类 -- 第一个按钮的文案
      oneLink: '', // 富文本类 -- 第一个按钮的跳转链接
      twoText: '', // 富文本类 -- 第二个按钮的文案
      twoLink: '', // 富文本类 -- 第二个按钮的跳转链接
      htmlText: '', // 富文本框内容
      haveTwo: false, // 富文本类 -- 是否有第二个按钮
      haveOption: false, // 富文本类 -- 是否有下面option区域
      imgUrl: '', // 图片类 -- 图片地址
      imgLink: '', // 图片类 -- 图片跳转链接
      nowId: '',
    };
  },
  watch: {
    showFlag(v) {
      if (v) {
        this.$nextTick(() => {
          if (this.$refs.dialog.offsetHeight % 2 !== 0) {
            const str = `${this.$refs.dialog.offsetHeight + 1}px`;
            this.$refs.dialog.style.height = str;
          }
        });
      }
    },
    userInfoIsReady: {
      immediate: true,
      handler(v) {
        if (v) {
          // this.getData();
        }
      },
    },
  },
  computed: {
    // userInfo是否请求完毕
    userInfoIsReady() {
      return this.$store.state.baseData.userInfoIsReady;
    },
  },
  methods: {
    getData() {
      this.axios({
        url: 'homepage_Elastic_Layer',
        params: {
          terminalType: '0',
        },
      }).then((data) => {
        if (data.code.toString() === '0'
          && data.data) {
          // https://chaindown-oss.oss-cn-hongkong.aliyuncs.com/upload/20200303204248519.jpeg
          const {
            activityTitle,
            startTime,
            endTime,
            displayType,
            picturePath,
            pictureUrl,
            imageText,
            buttonWritingOne,
            buttonWritingTwo,
            buttonUrlOne,
            buttonUrlTwo,
          } = data.data;
          this.dialogType = displayType.toString() === '0' ? 'img' : 'text'; // 类型
          this.titleText = activityTitle; // 标题
          if (this.dialogType === 'img') {
            // 图片地址
            if (picturePath && picturePath.length) {
              this.imgUrl = picturePath;
            }
            // 图片跳转地址
            if (pictureUrl && pictureUrl.length) {
              this.imgLink = pictureUrl;
            }
          } else {
            // 富文本内容
            if (imageText && imageText.length) {
              this.htmlText = imageText;
            }
            // 按钮1文案
            if (buttonWritingOne && buttonWritingOne.length) {
              this.oneText = buttonWritingOne;
              this.haveOption = true;
            }
            // 按钮1跳转地址
            if (buttonUrlOne && buttonUrlOne.length) {
              this.oneLink = buttonUrlOne;
            }
            // 按钮2文案
            if (buttonWritingTwo && buttonWritingTwo.length) {
              this.twoText = buttonWritingTwo;
              this.haveTwo = true;
              this.haveOption = true;
            }
            // 按钮2跳转地址
            if (buttonUrlTwo && buttonUrlTwo.length) {
              this.twoLink = buttonUrlTwo;
            }
          }
          const { isLogin } = this.$store.state.baseData;
          let flag = false;
          this.nowId = `${data.data.id}-${data.data.mtime}`;
          const cookieArr = getCookie('homeAlertArr')
            ? JSON.parse(getCookie('homeAlertArr')) : [];
          let cookieFlag = false;
          if (cookieArr.indexOf(this.nowId) === -1) {
            cookieFlag = true;
          }
          if (data.data.isLogin.toString() === '1' && isLogin) {
            flag = true;
          }
          if (data.data.isLogin.toString() === '0') {
            flag = true;
          }
          const time = new Date().getTime();
          if (time > startTime && time < endTime && flag && cookieFlag) {
            this.showFlag = true;
          }
        } else {
          // this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    setCookieArr() {
      const cookieArr = getCookie('homeAlertArr')
        ? JSON.parse(getCookie('homeAlertArr')) : [];
      cookieArr.push(this.nowId);
      setCookie('homeAlertArr', JSON.stringify(cookieArr));
    },
    close() {
      this.showFlag = false;
      this.setCookieArr();
    },
    oneClick() {
      if (this.oneLink) {
        window.location.href = this.oneLink;
      } else {
        this.showFlag = false;
        this.setCookieArr();
      }
    },
    twoClick() {
      if (this.twoLink) {
        window.location.href = this.twoLink;
      } else {
        this.showFlag = false;
        this.setCookieArr();
      }
    },
    imgClick() {
      if (this.imgLink) {
        window.location.href = this.imgLink;
      } else {
        this.showFlag = false;
        this.setCookieArr();
      }
    },
  },
};
</script>

<style lang='stylus'>
.drop-enter-active {
  animation: drop-in 0.3s;
}

.drop-leave-active {
  animation: drop-in 0.3s reverse;
}

@keyframes drop-in {
  0% {
    // transform: translateY(-100%);
    top: 35%;
    opacity: 0.7;
  }

  100% {
    /* margin-top: 10px; */
    opacity: 1;
  }
}

.common-homeDialog {
  .btnClass {
    margin-right: 10px;
  }

  .dialog-imgBox {
    min-height: 200px;
    max-height: 600px;
    overflow-y: scroll;
    position: relative;
    border-radius: 4px;
  }

  .dialog-imgBox-close {
    right: 20px;
    cursor: pointer;
    font-size: 20px;
    top: 12px;
    position: absolute;
  }

  .dialog-markAll {
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 999;
    top: 0;
    left: 0;
  }

  .dialog-frame {
    transform: 0.3s transition;
    position: fixed;
    z-index: 1000;
    left: 50%;
    top: 50%;
    transform: translate3d(-50%, -50%, 0);
    width: 800px;
    border-radius: 2px;
  }

  .dialog-frame-head {
    box-sizing: border-box;
    height: 60px;
    width: 100%;
    padding: 0 30px;
    line-height: 60px;
  }

  .dialog-frame-head-text {
    font-size: 16px;
  }

  .dialog-frame-head-close {
    float: right;
    cursor: pointer;
    font-size: 20px;
    margin-top: 12px;
  }

  .dialog-frame-body {
    width: 740px;
    min-height: 200px;
    max-height: 440px;
    overflow-y: scroll;
    margin-left: 30px;
    box-sizing: border-box;
    padding: 30px 0;
  }

  .closeBtnClass {
    font-size: 14px;
    margin-right: 10px;
  }

  .dialog-frame-bottom {
    // margin-bottom: 40px;
    height: 100px;
    position: relative;

    .dialog-frame-options {
      position: absolute;
      right: 30px;
      top: 30px;
    }

    .dialog-frame-options-oneBtn {
      right: 50%;
      transform: translateX(50%);
    }
  }
}
</style>
