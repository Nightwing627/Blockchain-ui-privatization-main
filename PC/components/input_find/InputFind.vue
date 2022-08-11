// Created by 任泽阳 on 18/12/05. // 搜索输入框
<template>
  <section
    class='input-find-content'
    :class='`${contentClass} ${className}`'
    @mouseenter='handMouseenter'
    @mouseleave='handMouseleave'
  >
    <!-- <div v-if='solidBcClass' class='solidBc' :class='solidBcClass'></div> -->
    <div class='content'>
      <span class='iconbox' v-if='!iconHide'>
        <svg class='icon icon-14' aria-hidden='true'>
          <use xlink:href='#icon-a_12'></use>
        </svg>
      </span>
      <input
        v-model='curValue'
        :disabled='disabled'
        :style='inputStyle'
        ref='inputFind'
        autocomplete='off'
        class='b-1-cl'
        :placeholder='promptText'
        @focus='handFocus'
        @blur='handBlur'
      />
      <span
        class='clones'
        @click='clones'
        v-if='curValue && curValue.length && !iconHide'
        >x</span
      >
    </div>
  </section>
</template>
<script>
export default {
  name: 'c-inputFind',
  data() {
    return {
      nowValue: '', // 内部双向数据绑定
      maxLength: 100, // 最长长度
      isHover: false,
      isFocus: false,
    };
  },
  props: {
    name: { default: '', type: String }, // 名称标识
    className: { default: '', type: String }, // class根容器
    disabled: { default: false, type: Boolean }, // 是否为只读
    promptText: { default: '', type: String }, // 提示文案
    value: { default: '', type: String }, // 外部 v-model 传入的植
    lightColour: { default: false, type: Boolean }, // 是否为浅色版
    iconHide: { default: false, type: Boolean },
    inputStyle: { default: '', type: String },
  },
  watch: {
    nowValue(v) {
      // 限制最长长度
      if (v.length > this.maxLength) {
        this.nowValue = v.substring(0, this.maxLength);
      }
      // 限制空格
      if (v.indexOf(' ') !== -1) {
        const arr = this.nowValue.split(' ');
        let str = '';
        arr.forEach((item) => {
          str += item;
        });
        this.nowValue = str;
      }
      this.$emit('onchanges', v, this.name);
    },
  },
  created() {
    this.$bus.$off('inputFind-focus');
    this.$bus.$on('inputFind-focus', (name) => {
      if (name === this.name) {
        this.focusFn();
      }
    });
  },
  computed: {
    curValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.nowValue = value;
      },
    },
    contentClass() {
      if (this.isHover || this.isFocus) {
        return 'a-12-bd';
      }
      return 'a-2-bd';
    },
    solidBcClass() {
      let className = null;
      if (this.isHover) {
        className = 'solidBc-hover';
      }
      if (this.isFocus) {
        className = 'solidBc-active';
      }
      return className;
    },
  },
  methods: {
    focusFn() {
      this.$nextTick(() => {
        this.$refs.inputFind.focus();
      });
    },
    clones() {
      this.$emit('onchanges', '', this.name);
    },
    // input 鼠标划入
    handMouseenter() {
      this.isHover = true;
    },
    // input 鼠标划出
    handMouseleave() {
      this.isHover = false;
    },
    // input 获取焦点
    handFocus() {
      this.$emit('focus');
      this.isFocus = true;
    },
    // input 失去焦点
    handBlur() {
      this.$emit('blur');
      this.isFocus = false;
    },
  },
};
</script>
<style lang='stylus'>
.input-find-content {
  width: 200px;
  height: 28px;
  line-height: 28px;
  position: relative;
  border-radius: 2px;
  overflow: hidden;
  border-width: 1px;
  border-style: solid;
  box-sizing: border-box;
  transition: all 0.3s;
  .clones {
    position: absolute;
    right: 10px;
    line-height: 28px;
    cursor: pointer;
  }
  .solidBc {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }
  .content {
    z-index: 2;
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }
  .solidBc-hover {
    opacity: 0.05
  }
  .solidBc-active {
    opacity: 0.05
  }
  .iconbox {
    width: 30px;
    height: 28px;
    display: inline-block;
    text-align: center;
    line-height: 28px;
    vertical-align: middle
  }
  input {
    width: 168px;
    height: 20px;
    margin-top: -1px;
    line-height: 20px;
    vertical-align: middle
  }
}
</style>
