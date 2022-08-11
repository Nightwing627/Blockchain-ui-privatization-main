// Created by 任泽阳 on 18/12/06. // 带图弹窗组件 //
*****************************
<template>
  <section class='common-alert'>
    <!-- 背景遮罩层 -->
    <div class='alert-markAll a-9-bg' v-if='showFlag'></div>
    <!-- 弹出框 -->
    <transition name='drop'>
      <div class='alert-frame a-5-bg' v-if='showFlag'>
        <div class='alert-close'>
          <c-iconButton @click='close' v-if="haveClose">
            <svg class='icon icon-16' aria-hidden='true'>
              <use xlink:href='#icon-c_7'></use>
            </svg>
          </c-iconButton>
        </div>
        <!-- 图片 -->
        <div class='alert-img' :style='imgClass'></div>
        <!-- 文本 -->
        <div class='alert-main'>
          <slot></slot>
        </div>
        <!-- 文案 button -->
        <div class='alert-button'>
          <c-button
            type='text'
            paddingW='15px'
            height='40px'
            @click='confirm'
            className='closeBtnClass'
            >{{ buttonTextProp }}</c-button
          >
        </div>
      </div>
    </transition>
  </section>
</template>
<script>
export default {
  name: 'c-alert',
  props: {
    imgMap: {
      type: Object,
      default: () => {},
      required: true,
    },
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
      const { imgMap } = this;
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
    close() {
      this.$emit('close');
    },
    confirm() {
      this.$emit('confirm');
    },
  },
};
</script>
<style lang='stylus'>
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
    z-index: 100;
    top: 0;
    left: 0;
  }
  .alert-frame {
    transform: 0.3s transition;
    position fixed;
    z-index: 101;
    left: 50%;
    top: 50%;
    transform: translate3d(-50%, -50%, 0);
    width: 480px;
    padding: 60px 36px 67px 144px;
    box-sizing: border-box;
    border-radius: 2px;
    .alert-close {
      position: absolute;
      right: 20px;
      top: 10px;
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
      bottom: 20px;
      right: 25px;
    }
  }
}
</style>
