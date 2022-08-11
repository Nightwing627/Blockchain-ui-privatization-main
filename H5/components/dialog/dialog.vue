// Created by 任泽阳 on 18/12/07.
// 对话框
<template>
  <section class="common-dialog">
    <!-- 背景遮罩层 -->
    <div class="dialog-markAll u-7-bg" v-if="showFlag"></div>
    <!-- 弹出框 -->
    <transition name="drop">
      <div class="dialog-frame a-5-bg" v-if="showFlag" ref="dialog">
        <div class="dialog-frame-head a-4-bg">
          <span class="dialog-frame-head-text b-1-cl">{{titleText}}</span>
          <span class="dialog-frame-head-close">
            <c-h-iconButton @click="close">
              <svg class="icon icon-16" aria-hidden="true">
                <use xlink:href="#icon-c_7"></use>
              </svg>
            </c-h-iconButton>
          </span>
        </div>
        <div class="dialog-frame-body" :style="bodyStyle">
          <slot/>
        </div>
        <div class="dialog-frame-bottom">
          <div class="dialog-frame-options">
            <c-h-button type="solid"
              name="dialogConfirm"
              width="100%"
              height="40px"
              @click="confirm"
              :loading="confirmLoading"
              :disabled="confirmDisabled">{{confirmTextProps}}</c-h-button>
            <c-h-button type="text"
              width="100%"
              height="40px"
              marginTop="10px"
              @click="close"
              className="closeBtnClass">{{closeTextProps}}</c-h-button>
          </div>
        </div>
      </div>
    </transition>
  </section>
</template>
<script>
// 按钮
export default {
  name: 'c-h-dialog',
  props: {
    // 展示变量
    showFlag: { default: false, type: Boolean },
    // 上边距  有警告文字时为20px
    paddingTop: { default: '30px', type: String },
    // 下边距
    paddingBottom: { default: '30px', type: String },
    // 提示文案
    titleText: { default: '', type: String },
    // 确认按钮的文案
    confirmText: { default: '', type: String },
    // 取消按钮的文案
    closeText: { default: '', type: String },
    // 确认按钮的loading
    confirmLoading: { default: false, type: Boolean },
    // 确认按钮的disabled
    confirmDisabled: { default: false, type: Boolean },
  },
  beforeDestroy() {
    this.$bus.$emit('htmlScroll', true);
  },
  watch: {
    showFlag(v) {
      if (v) {
        this.$bus.$emit('htmlScroll', false);
        this.$nextTick(() => {
          if (this.$refs.dialog.offsetHeight % 2 !== 0) {
            const str = `${this.$refs.dialog.offsetHeight + 1}px`;
            this.$refs.dialog.style.height = str;
          }
        });
      } else {
        this.$bus.$emit('htmlScroll', true);
      }
    },
  },
  computed: {
    confirmTextProps() {
      if (this.confirmText.length) {
        return this.confirmText;
      }
      // 确定
      return this.$t('components.dialog.confirmText');
    },
    closeTextProps() {
      if (this.closeText.length) {
        return this.closeText;
      }
      // 取消
      return this.$t('components.dialog.closeText');
    },
    bodyStyle() {
      return {
        paddingTop: this.paddingTop,
        paddingBottom: this.paddingBottom,
      };
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

<style lang="stylus">
.drop-enter-active {
  animation: drop-in .3s;
}
.drop-leave-active {
  animation: drop-in .3s reverse;
}
@keyframes drop-in {
  0% {
    // transform: translateY(-100%);
    top: 35%;
    opacity: 0.7
  }
  100% {
    /* margin-top: 10px; */
    // transform: translateY(-50%);
    opacity: 1;
  }
}
.common-dialog {
  .btnClass {
    margin-right: 10px;
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
    border-radius: 0.02rem;
    transform: 0.3s transition;
    position fixed;
    z-index: 1000;
    left: 50%;
    top: 50%;
    transform: translate3d(-50%, -50%, 0);
    // width: 480px;
    width: 3.45rem;
    border-radius: 2px;
  }
  .dialog-frame-head {
    box-sizing: border-box;
    height: 0.5rem;
    width: 100%;
    padding: 0 0.1rem 0 0.2rem;
    line-height: 0.5rem;
  }
  .dialog-frame-head-text {
    font-size: 0.16rem;
    font-weight: bold;
  }
  .dialog-frame-head-close {
    float: right;
    cursor: pointer;
    font-size: 0.22rem;
    margin-top: 0.06rem;
  }
  .dialog-frame-body {
    padding: 0 0.2rem;
  }
  .closeBtnClass {
    font-size: 14px;
    margin-right: 10px;
  }
  .dialog-frame-bottom {
    margin-bottom: 0.15rem;
    padding: 0 0.15rem;
    padding-top: 0.15rem;
    // height: 40px;
    // position: relative;
    .dialog-frame-options {
      // position: absolute;
      right: 40px;
    }
  }
}
</style>
