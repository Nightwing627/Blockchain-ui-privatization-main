// Created by 任泽阳 on 18/12/05. // 多行文本输入框
<template>
  <section class='area-line-content' :style='contentStyle' :class='className'>
    <!-- 基础占位 46px 包含下划线 -->
    <div
      class='input-line-baseStance a-2-bd'
      :class='baseStanceClass'
      ref='baseStance'
    >
      <div
        class='input_line_inp'
        ref='area_line_inp'
        @mouseenter='handMouseenter'
        @mouseout='handMouseleave'
      >
        <!-- 输入框 -->
        <textarea
          :maxlength='maxLength'
          class='common-textarea b-1-cl'
          :type='nowType'
          required='true'
          v-model='curValue'
          :disabled='disabled'
          @focus='handFocus'
          @blur='handBlur'
          ref='textarea'
          rows='1'
          autocomplete='off'
        ></textarea>
        <div class='input-line-slot clearfix' ref='slot'>
          <slot />
        </div>
        <svg class='icon icon-14 area-icon' aria-hidden='true' v-if='!disabled'>
          <use xlink:href='#icon-a_18'></use>
        </svg>
      </div>
      <!-- 提示信息 -->
      <label
        class='input-line-prompt'
        :class='promptClass'
        @click='promptClick'
        >{{ promptText }}</label
      >
      <!-- 选中时横线 -->
      <span
        class='input-line-activeLine'
        :class='activeLineClass'
        :style='activeLineStyle'
      ></span>
      <!-- 只读时 -->
    </div>
    <!-- 错误文案占位 24px -->
    <div class='input-line-errorStence' v-if='errorHave'>
      <!-- 错误信息容器 -->
      <p class='input-line-error b-6-cl' v-if='errorFlag && !isFocus'>
        {{ errorText }}
      </p>
      <!-- 警示文案 -->
      <p class='input-line-warning' v-else-if='warningFlag'>
        {{ warningText }}
      </p>
    </div>
    <!-- 底部提示框 -->
    <div class='input-line-limit'></div>
  </section>
</template>
<script>
export default {
  name: 'c-textAreaLine',
  mounted() {
    const that = this;
    function makeExpandingArea(el) {
      const setStyle = (ev) => {
        that.$refs.textarea.style.height = 'auto';
        that.$refs.textarea.style.height = `${ev.scrollHeight}px`;
        that.$refs.area_line_inp.style.height = `${ev.scrollHeight}px`;
      };
      // const delayedResize = (ev) => {
      //   window.setTimeout(() => {
      //     setStyle(ev);
      //   },
      //   0);
      // };
      if (el.addEventListener) {
        el.addEventListener(
          'input',
          () => {
            setStyle(el);
          },
          false,
        );
        setStyle(el);
      } else if (el.attachEvent) {
        el.attachEvent('onpropertychange', () => {
          setStyle(el);
        });
        setStyle(el);
      }
      // if (window.VBArray && window.addEventListener) { // IE9
      //   el.attachEvent('onkeydown', () => {
      //     const key = window.event.keyCode;
      //     if (key === 8 || key === 46) delayedResize(el);
      //   });
      //   el.attachEvent('oncut', () => {
      //     delayedResize(el);
      //   }); // 处理粘贴
      // }
    }
    makeExpandingArea(this.$refs.textarea);
  },
  data() {
    return {
      isFocus: false, // 是否获取焦点
      isHover: false, // 是否划过
      inputWidth: 0, // input宽度
      slotWidth: 0,
      focusTime: null,
      nowType: 'text',
    };
  },
  props: {
    maxLength: { default: '500', type: String }, // 最大长度
    name: { default: '', type: String }, // 名称标识
    className: { default: '', type: String }, // class根容器
    value: { default: '', type: String }, // 外部 v-model 传入的植
    width: { default: '100%', type: String }, // 该容器根容器 width属性 (***务必加单位***)
    marginTop: { default: '0px', type: String }, // 该组件根容器 margin-top属性 (***务必加单位***)
    inputType: { default: 'text', type: String }, // input框 type属性
    promptText: { default: '', type: String }, // 提示文案
    disabled: { default: false, type: Boolean }, // 是否为只读
    errorHave: { default: false, type: Boolean }, // 是否有错误文案
    errorText: { default: '', type: String }, // 错误文案
    errorFlag: { default: false, type: Boolean }, // 错误文案是否显示
    warningText: { default: '', type: String }, // 是否有警示文案
  },
  created() {
    this.$bus.$off('textarea-focus');
    this.$bus.$on('textarea-focus', (name) => {
      if (name === this.name) {
        this.$refs.textarea.focus();
      }
    });
  },
  computed: {
    curValue: {
      get() {
        return this.value;
      },
      set(v) {
        const value = v;
        // 限制空格
        // if (value.indexOf(' ') !== -1) {
        //   const arr = value.split(' ');
        //   let str = '';
        //   arr.forEach((item) => { str += item; });
        //   value = str;
        //   this.$forceUpdate();
        // }
        this.$emit('onchanges', value, this.name);
      },
    },
    warningFlag() {
      let flag = false;
      if (this.warningText.length) {
        if (!(this.errorFlag && !this.isFocus)) {
          flag = true;
        }
      }
      return flag;
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
      // 禁止时
      if (this.disabled) {
        return 'input-line-baseStance-disabled';
      }
      // 错误时
      if (this.errorHave && this.errorFlag && !this.isFocus) {
        return 'input-line-baseStance-error';
      }
      return '';
    },
    // 提示文案 class
    promptClass() {
      let className = '';
      let color = 'b-2-cl';
      if (this.isFocus || this.value.length) {
        className += 'input-line-prompt-active';
      }
      if (this.errorHave && this.errorFlag && !this.isFocus) {
        color = 'b-6-cl';
      }
      return `${className} ${color}`;
    },
    // 下横线 class
    activeLineClass() {
      let className = 'a-12-bg';
      if (this.errorHave && this.errorFlag && !this.isFocus) {
        className = 'a-19-bg';
      }
      return className;
    },
    // 下横线 行内样式
    activeLineStyle() {
      let width = 0;
      // input划过 / input聚焦 / 错误文案显示 时 下划线展示
      if (this.isHover || this.isFocus || (this.errorHave && this.errorFlag)) {
        width = '100%';
      }
      if (this.disabled) {
        width = 0;
      }
      return {
        width,
      };
    },
  },
  methods: {
    promptClick() {
      if (this.focusTime) {
        const nowTime = new Date().getTime();
        if (nowTime - this.focusTime > 200) {
          this.$refs.textarea.focus();
          this.focusTime = null;
        }
      } else {
        this.$refs.textarea.focus();
      }
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
      this.nowType = this.inputType;
      this.$emit('focus', this.name);
      this.isFocus = true;
    },
    // input 失去焦点
    handBlur() {
      this.focusTime = new Date().getTime();
      this.$emit('blur', this.name);
      this.isFocus = false;
    },
  },
};
</script>
<style lang='stylus'>
.area-line-content {
  .common-textarea {
    resize:none;
    line-height: 30px;
    width: 380px;
    max-height: 150px;
    padding: 0;
    margin: 0;
  }
  // 基础占位容器 (默认)
  .input-line-baseStance {
    // height: 30px;
    padding-top: 14px;
    // box-sizing: border-box;
    border-bottom-width: 2px;
    border-bottom-style: solid;
    position: relative;
    .area-icon {
      position: absolute;
      right: 0;
      bottom: 0;
    }
    // 输入框
    .input_line_inp {
      // position: absolute;
      bottom: 0px;
      // z-index: 2;
      width: 100%;
      border: 0px;
      font-size: 14px;
      // height: 30px;
      background: none;
      max-height: 150px;
      // box-sizing: border-box;
      // outline: none;
      textarea {
        // height: 30px;
        width: 100%;
        font-size: 14px;
        position: absolute;
        bottom: 0;
      }
      textarea::-webkit-scrollbar {
        display: none;
      }
      .input-line-slot {
        float: left;
        display: inline-block;
        position: absolute;
        height: auto;
        right: 0;
        bottom: 0;
      }
    }
    // 提示文案容器
    .input-line-prompt {
      cursor: text;
      z-index: 1;
      position: absolute;
      height: 30px;
      line-height: 30px;
      top: 14px;
      left: 0;
      font-size: 14px;
      -webkit-transition: 0.3s;
      transition: 0.3s;
      user-select:none;
    }
    // input聚焦/具有文本 时 提示文案浮起
    .input-line-prompt-active {
      cursor: auto;
      font-size: 12px;
      -ms-transform: translateY(-20px);
      -webkit-transform: translateY(-20px);
      transform: translateY(-20px);
    }
    // 下划线动效容器
    .input-line-activeLine {
      position: absolute;
      z-index: 3;
      // top: 43px;
      bottom: -2px;
      height: 2px;
      width: 0;
      left: 50%;
      transform: translateX(-50%);
      display: inline-block;
      transition: 0.5s;
      -webkit-transition: 0.5s;
      -ms-transition: 0.5s;
      animation-delay: 0.5s
      -webkit-animation-delay: 0.5s
      -ms-animation-delay: 0.5s
    }
  }
  // 基础占位容器 (禁用时)
  .input-line-baseStance-disabled {
    border-bottom-width: 2px;
    border-bottom-style: dotted;
    .input-line-prompt-active {
      cursor: no-drop;
    }
    textarea {
      cursor: no-drop;
    }
  }
  // 基础占位容器 (错误时)
  .input-line-baseStance-error {
    // 提示文案容器 (错误时)
    .input-line-prompt {
      animation: shake 0.6s cubic-bezier(0.25, 0.8, 0.5, 1);
    }
  }
  // 错误信息占位容器
  .input-line-errorStence {
    height: 24px;
    position: relative;
    // 错误文案容器
    .input-line-error {
      position: absolute;
      top: 2px;
      margin: 0;
      font-size: 12px;
      user-select:none;
    }
    // 警示框
    .input-line-warning {
      position: absolute;
      bottom: 5px;
      font-size: 12px;
    }
  }

  .input_line_inp:focus+.input-line-prompt,
  .input_line_inp:valid+.input-line-prompt {
  }
  // 错误 label 抖动 动画
  @-webkit-keyframes shake {
    59% {
      margin-left: 0;
    }
    60%, 80% {
      margin-left: 2px;
    }
    70%, 90% {
      margin-left: -2px;
    }
  }
  @keyframes shake {
    59% {
      margin-left: 0;
    }
    60%, 80% {
      margin-left: 2px;
    }
    70%, 90% {
      margin-left: -2px;
    }
  }
}
</style>
