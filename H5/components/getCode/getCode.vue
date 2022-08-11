// Created by 任泽阳 on 18/12/06.
// 获取验证码组件
// *****************************
<template>
  <section class="common-getCode" :class="className">
    <!-- 获取验证码 -->
    <c-h-button type="text"
      height="30px"
      v-if="flag"
      @click="codeClick"
      :name="buttonName">{{ $t('components.getCode.button') }}</c-h-button>
    <!-- 后重新获取 -->
    <div class="times b-2-cl" v-else>{{mins}}s
      {{ $t('components.getCode.after') }}</div>
  </section>
</template>
<script>

export default {
  name: 'c-h-getCode',
  props: {
    className: { default: '', type: String }, // 根节点class
    code: { default: 100, type: Number }, // 倒计时时间
    name: { default: '', type: String }, // name标示
    buttonName: { default: 'codeClickButton', type: String }, // 获取验证码按钮name
    codeFlag: { default: true, type: Boolean }, // 按钮是否可点击
    autoStart: { default: true, type: Boolean }, // 按钮按下时 自动开始倒计时
  },
  data() {
    return {
      flag: true, // 是否可点击
      mins: 0, // 倒计时仅展示
      timer: null,
    };
  },
  watch: {
    codeFlag(newValue) {
      if (newValue) {
        this.clear();
      } else {
        this.startTime();
      }
    },
  },
  created() {
    this.$bus.$emit('getCode-clear');
    this.$bus.$on('getCode-clear', (name) => {
      if (name === this.name) {
        this.clear();
      }
    });
    this.$bus.$emit('getCode-start');
    this.$bus.$on('getCode-start', (name) => {
      if (name === this.name) {
        this.startTime();
      }
    });
  },
  methods: {
    codeClick() {
      this.$emit('click', this.name);
      if (this.autoStart) {
        this.startTime();
      }
    },
    startTime() {
      this.clear();
      this.flag = false;
      this.mins = this.code;
      this.mins -= 1;
      this.timer = setInterval(() => {
        this.mins -= 1;
        if (this.mins === 0) {
          this.clear();
        }
      }, 1000);
    },
    clear() {
      this.$emit('clear');
      this.flag = true;
      clearInterval(this.timer);
    },
  },
  beforeDestroy() {
    this.clear();
  },
};
</script>
<style lang="stylus" scoped>
.common-getCode {
  height: 30px;
  .times {
    font-size: 12px;
    line-height: 30px;
    cursor: no-drop;
    user-select: none;
    text-align: center;
  }
}
</style>
