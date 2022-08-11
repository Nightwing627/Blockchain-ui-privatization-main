// Created by 任泽阳 on 18/12/06.
// 带图弹窗组件
// *****************************
<template>
  <section class="common-alert">
    <!-- 背景遮罩层 -->
    <div class="alert-markAll a-9-bg" v-if="showFlag"></div>
    <!-- 弹出框 -->
    <transition name="drop">
      <div class="alert-frame a-5-bg" v-if="showFlag">
        <div class="alert-close">
          <c-h-iconButton @click="close" v-if="haveClose">
            <svg class="icon icon-16" aria-hidden="true">
              <use xlink:href="#icon-c_7"></use>
            </svg>
          </c-h-iconButton>
        </div>
        <!-- 图片 -->
        <!-- <div class="alert-img"
          :style="imgClass"></div> -->
        <!-- 文本 -->
        <div class="alert-main">
          <slot></slot>
        </div>
        <!-- 文案 button -->
        <div class="alert-button">
           <c-h-button type="text"
              paddingW="15px"
              height="40px"
              @click="confirm"
              className="closeBtnClass">{{buttonTextProp}}</c-h-button>
        </div>
      </div>
    </transition>
  </section>
</template>
<script>
import { imgMap } from '@/utils';

export default {
  name: 'c-h-alert',
  props: {
    // 展示变量
    showFlag: { default: false, type: Boolean },
    // button文案
    buttonText: { default: '', type: String },
    haveClose: { default: true, type: Boolean },
    // img
    imageType: {
      default: '2',
      type: String,
    },
  },
  computed: {
    imgClass() {
      const img = this.imageType === '1' ? imgMap.alert : imgMap.alert2;
      return {
        backgroundImage: `url(${img})`,
      };
    },
    buttonTextProp() {
      if (this.buttonText.length) {
        return this.buttonText;
      }
      // 我知道了
      return this.$t('components.alert.buttonText');
    },
  },
  methods: {
    close() { this.$emit('close'); },
    confirm() { this.$emit('confirm'); },
  },
};
</script>
<style lang="stylus">
.drop-enter-active {
  animation: drop-in .3s;
}
.drop-leave-active {
  animation: drop-in .3s reverse;
}
@keyframes drop-in {
  0% {
    top: 35%;
    opacity: 0.7
  }
  100% {
    opacity: 1;
  }
}
.common-alert {
  .closeBtnClass {
    font-size: 14px
  }
  .alert-markAll {
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 8;
    top: 0;
    left: 0;
  }
  .alert-frame {
    transform: 0.3s transition;
    position fixed;
    z-index: 9;
    left: 50%;
    top: 50%;
    transform: translate3d(-50%, -50%, 0);
    width: 90%;
    padding: 0.3rem 0.2rem 0.6rem 0.2rem;
    box-sizing: border-box;
    border-radius: 2px;
    .alertTitle {
      font-size: 16px;
    }
    .alert-close {
      position: absolute;
      right: 10px;
      top: 5px;
      cursor: pointer
    }
    .alert-img {
      position: absolute;
      width: 80px;
      height: 80px;
      left: 39px;
      top: 55px;
    }
    .alert-main {
      display: inline-block;
      width: 300px;
      min-height: 60px;
      word-wrap: break-word;
      word-break: normal;
      font-size: 14px;
    }
    .alert-button {
      position: absolute;
      bottom: 13px;
      right: 5px;
    }
  }
}
</style>
