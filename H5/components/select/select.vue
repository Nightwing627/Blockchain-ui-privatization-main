// Created by 侯东东.
// 下拉框
// *****************************
<template>
  <div
    :class="classes"
    :style="stylees"
    :id="elementId"
    v-click-outside.capture="onClickOutside"
    v-click-outside:mousedown.capture="onClickOutside"
    >
    <!-- 展示容器 -->
    <div class="input_line_content a-2-bd"
      @click="toggleMenu"
    >
      <!-- 输入框 -->
      <input class="input_line_inp b-1-cl"
        type="text"
        required
        :readonly = '!filterable'
        v-model="values"
        @input="filterableChange"
        @focus="inputFoucus"
        @blur ="isFocused = false"
        >
      <!-- 三角ICON -->
      <i class="icon icon-triangle b-2-bd" :class="appendIcon"></i>
      <!-- 清空选项ICON -->
      <i v-if="values && clearable"
        class="icon icon-clear-btn b-2-cl"
        :class="clearableIcon"
        @click.stop="resetOptionData">X</i>
      <!-- 提示信息 -->
      <label class="input_line_prompt b-2-cl">{{ promptText }}</label>
      <!-- 选中时横线 -->
      <span class="input_line_activeLine a-12-bg"></span>
    </div>
    <!-- 错误信息容器 -->
    <div class="input_line_errorStence" v-if="errorHave">
      <p class="input_line_error b-6-cl" v-if="isError">{{ errorText }}</p>
    </div>
    <transition name="slideInDown">
      <div v-show="visible" class="select-options-box a-5-bg b-1-cl">
        <div v-show="selectOption.length" class="select-option-list"
          :style="setBoxHeight">
          <vue-scroll>
          <!-- 单行类型 -->
          <ul v-if="type === 'info'">
            <li
              class="select-option-item"
              v-for="(item, index) in selectOption"
              :class="{'a-4-bg': value === item.code || index === overInx}"
              :key="index"
              :style="optionStyle"
              ref="selectLi"
              @mouseover="mouseOver(index)"
              @mouseout="mouseOut(index)"
              @click="onOptionClick(item)"
              >
              {{item.value}}
            </li>
          </ul>
          <!-- 双行类型 -->
          <ul v-if="type === 'double'">
            <li
              class="select-option-item-double"
              v-for="(item, index) in selectOption"
              :class="{'a-4-bg': value === item.code || index === overInx}"
              :key="index"
              ref="selectLi"
              @mouseover="mouseOver(index)"
              @mouseout="mouseOut(index)"
              @click="onOptionClick(item)">
              <div>{{item.value}}</div>
              <div class="label b-2-cl">{{item.label}}</div>
            </li>
          </ul>
          </vue-scroll>
        </div>
        <div class="not_option" v-show="!selectOption.length">
          <!-- 暂无数据 -->
          {{ $t('components.select.noData') }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script>

import { directive as clickOutside } from 'v-click-outside-x';

export default {
  name: 'c-h-select',
  directives: { clickOutside },
  props: {
    // li的展现形式
    type: {
      default: 'info', // info为单行li  double为双行li
      type: String,
    },
    // 初始化默认 选中的值 String：直接显示，Number： 选项索引值
    value: {
      type: [String, Number],
      default: '',
    },
    options: {
      type: Array,
      default: () => [],
    },
    name: {
      type: String,
      default: '',
    },
    // Title
    promptText: {
      type: String,
      default: '',
    },
    // 设置边框样式. 默认线性样式
    box: {
      type: Boolean,
      default: false,
    },
    // 下拉框显示多少条，默认显示5条 多出显示滚动条
    optionNumber: {
      type: Number,
      default: 5,
    },
    // 选项列表 行高 默认0.4rem
    optionHeight: {
      type: [Number, String],
      default: 40,
    },
    // 下拉框右侧展开 ICON 默认 三角形icon
    appendIcon: {
      type: String,
      default: 'icon-triangle-down',
    },
    // 是否开启搜索功能
    filterable: {
      type: Boolean,
      default: false,
    },
    // 是否关闭
    disabled: {
      type: Boolean,
      default: false,
    },
    // 错误提示语
    errorText: {
      type: String,
      default: '',
    },
    // 将 下拉框设置成错误状态
    errorFlag: {
      type: Boolean,
      default: false,
    },
    // 占位符
    placehoder: {
      type: String,
      default: '',
    },
    // 无数据 提示语
    notFoundText: {
      type: String,
      default: '无匹配数据',
    },
    // 是否开启 清空选项的功能
    clearable: {
      type: Boolean,
      default: false,
    },
    // 清空选项按钮的Icon, icon的class
    clearableIcon: {
      type: String,
      default: 'icon-clear',
    },
    // 下拉框的宽度 （字符串 后面加单位 px %）
    width: {
      type: [String],
      default: '',
    },
    // 下拉框的高度
    height: {
      type: [String],
      default: '',
    },
    // 样式
    styles: {
      type: [Object, String],
      default: '',
    },
    elementId: {
      type: String,
      default: '',
    },
    // 是否需要验证
    errorHave: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      // 存储选中的值 和 默认选中的值
      values: '',
      // 控制下拉框是都可见
      visible: false,
      // 选项列表是否有数据
      isNotOption: false,
      // 检索关键字
      query: '',
      // isFocused
      isFocused: false,
      // 是否设置成错误状态
      isError: false,
      overInx: null,
    };
  },
  mounted() {
    if (this.value && this.options.length) {
      this.values = this.getInitialValue(this.value);
    }
  },
  computed: {
    selectOption() {
      if (!this.options.length) return [];
      if (!this.options[0].code && this.options[0].code !== 0) {
        // console.error('options数据格式错误', this.options);
        return [];
      }
      if (!this.query) return this.options;
      return this.options.filter((item) => {
        if (item.value.toUpperCase().indexOf(this.query.toUpperCase()) !== -1) {
          return item;
        }
        return false;
      });
    },
    classes() {
      return [
        'common-select',
        {
          'select-visible': this.visible,
          'select-disabled': this.disabled,
          'select-value': this.values,
          'select-filterable': this.filterable,
          'select-error': this.isError,
        },
      ];
    },
    stylees() {
      const styles = this.styles || {};
      if (this.width) styles.width = this.width;
      if (this.height) styles.width = this.height;
      return styles;
    },
    optionStyle() {
      const styles = {
        'min-height': `${(parseFloat(this.optionHeight) - 20) / 100}rem`,
        'line-height': `${(parseFloat(this.optionHeight) - 20) / 100}rem`,
      };
      return styles;
    },
    setBoxHeight() {
      if (this.selectOption.length <= this.optionNumber) {
        return false;
      }
      if (this.type === 'double') {
        return { 'max-height': `${(this.optionNumber * 50) / 100}rem` };
      }
      return { 'max-height': `${(this.optionNumber * this.optionHeight) / 100}rem` };
    },
  },
  watch: {
    value(value) {
      if (!value) this.values = '';
      else if (this.value) {
        this.values = this.getInitialValue(value);
      }
    },
    visible(value) {
      if (!value && this.filterable && this.options.length) {
        this.options.forEach((item) => {
          if (item.code === this.value) {
            this.values = item.value;
            this.query = '';
          }
        });
      }
      this.$emit('opent-chang', value, this.name);
    },
    errorFlag(value) {
      this.isError = value;
    },
  },
  methods: {
    inputFoucus() {
      this.isFocused = true;
      if (this.filterable) {
        this.query = '';
        this.values = '';
      }
    },
    mouseOver(inx) {
      this.overInx = inx;
    },
    mouseOut() {
      this.overInx = null;
    },
    // 下拉框 显示&隐藏
    toggleMenu() {
      this.visible = !this.visible;
    },
    // 点击 select 以外 隐藏下拉框
    onClickOutside() {
      this.visible = false;
    },
    // 点击 选项
    onOptionClick(item) {
      this.query = '';
      this.visible = false;
      this.isError = false;
      this.$emit('onChanges', item, this.name);
    },
    // 搜索框 输入事件
    filterableChange(event) {
      this.query = event.target.value;
      if (this.query.length) this.visible = true;
    },
    // 设置 显示的Value;
    getInitialValue(value) {
      // 如果是 true  表示 value  是搜索是输入的值
      let text;
      if (this.isFocused) {
        text = value;
      } else if (this.options.length) {
        this.options.forEach((item) => {
          if (item.code === value) {
            text = item.value;
          }
        });
      }
      return text;
    },
    // 清除选项
    resetOptionData() {
      this.values = '';
      this.query = '';
      this.$emit('onClear', true, this.name);
    },
  },
};
</script>

<style scoped lang="stylus">
.common-select {
  position: relative;
  cursor: pointer;
// 展示容器
  .input_line_content {
    height: 0.46rem;
    box-sizing: border-box;
    border-bottom-style solid
    border-bottom-width 0.01rem
    position: relative;
  }
  // 输入框容器
  .input_line_inp {
    position: absolute;
    bottom: 0rem;
    z-index: 2;
    width: 100%;
    border: 0rem;
    font-size: 0.14rem;
    height: 0.3rem;
    background: none;
    box-sizing: border-box;
    outline: none;
    display: inline-block;
    -webkit-transition: 0.3s;
    transition: 0.3s;
    cursor: pointer;
  }
  // 提示文案容器
  .input_line_prompt {
    z-index: 1;
    position: absolute;
    height: 0.3rem;
    line-height: 0.3rem;
    bottom: 0rem;
    left: 0;
    font-size: 0.14rem;
    -webkit-transition: 0.3s;
    transition: 0.3s;
    user-select:none;
  }
  // 下划线动效容器
  .input_line_activeLine {
    position: absolute;
    z-index: 3;
    bottom: -0.01rem;
    height: 0.01rem;
    width: 0;
    left: 50%;
    transform: translateX(-50%);
    display: inline-block;
    -transition: 0.5s;
    -webkit-transition: 0.5s;
    -ms-transition: 0.5s;
    animation-delay: 0.5s
    -webkit-animation-delay: 0.5s
    -ms-animation-delay: 0.5s
  }
  // 错误文案容器
  .input_line_errorStence {
    height: 0.24rem;
    position: relative;
    // 错误文案容器
    .input_line_error {
      position: absolute;
      bottom: 0;
      margin: 0;
      font-size: 0.12rem;
      user-select:none;
    }
  }
  // ICON
  .icon-triangle {
    // color: #828EA1;
    position: absolute;
    right: 0.05rem;
    bottom: 0.12rem;
    width:0;
    height:0;
    border-width:4px 4px 0;
    border-style:solid;
    border-left-color: transparent!important;
    border-right-color: transparent!important;
 //   border-color:#828EA1 transparent transparent;/*灰 透明 透明 */
    // text-align: center;
    // width: 20px;
    // line-height: 10px;
    // cursor: pointer;
    transition: all .3s ease-in-out;
  }
  // 清除 ICON
  .icon-clear-btn {
    position: absolute;
    right: 0;
    bottom:0
    text-align: center;
    width: 20px;
    line-height: 30px;
    cursor: pointer;
    display: none;
  }
  // 下拉框
  .select-options-box {
    position: absolute;
    transform-origin: center top 0px;
    top: 0.46rem;
    left: 0;
    right: 0;
    z-index: 9;
    box-shadow: 0 3px 4px 1px rgba(0,0,0,0.28);
    border-radius: 2px;
    font-size: 0.14rem;
    padding: 0.1rem 0;
    .select-option-list {
      overflow-y: scroll;
      .select-option-item {
          line-height: 0.4rem;
          font-size: 0.12rem;
          min-height: 0.2rem;
          padding: 0.1rem 0.2rem;
          cursor: pointer;
      }
      .select-option-item-double {
        padding: 0.08rem 0.2rem;
        line-height: 0.2rem;
        cursor: pointer;
      }
    }
    // 没有选项的样式
    .not_option {
      font-size: 0.12rem;
      line-height: 0.4rem;
      padding 0 20px;
    }
  }
  // input聚焦/具有文本时 提示文案浮起吃
  .input_line_inp:valid+.input_line_prompt,
  &.select-value .input_line_prompt,
  &.select-visible .input_line_prompt  {
      font-size: 0.12rem;
      -ms-transform: translateY(-20px);
      -webkit-transform: translateY(-20px);
      transform: translateY(-20px);
  }
  // input聚焦 下划线动效
  .input_line_content:hover .input_line_activeLine,
  &.select-visible .input_line_activeLine,
  .input_line_inp:valid+.input_line_prompt{
      width: 100%;
  }
  // 错误样式
  &.select-error {
    .input_line_activeLine {
      width: 100%;
      background: #EB4D5C;
    }
    .input_line_prompt {
      color: #EB4D5C;
      animation: shake 0.6s cubic-bezier(0.25, 0.8, 0.5, 1);
    }
  }
  // 展开样式
  &.select-visible {
    // 三角旋转180度
    .icon-triangle-down {
      transform: rotate(180deg);
    }
  }
  // 有值样式
  &:hover {
    // 清除按钮显示
    .icon-clear-btn {
      z-index: 9;
      background-color:#000;
      display: inline-block;
    }
  }
  // 展开动画
  .slideInDown-enter-active {
  transition: all .3s ease;
  }
  .slideInDown-leave-active {
    transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  }
  .slideInDown-enter, .slideInDown-leave-to {
    transform: translateY(-0.15rem);
    opacity: 0;
  }
  // 错误 label 抖动 动画
  @-webkit-keyframes shake {
    59% {
      margin-left: 0;
    }
    60%, 80% {
      margin-left: 0.02rem;
    }
    70%, 90% {
      margin-left: -0.02rem;
    }
  }
  @keyframes shake {
    59% {
      margin-left: 0;
    }
    60%, 80% {
      margin-left: 0.02rem;
    }
    70%, 90% {
      margin-left: -0.02rem;
    }
  }
}
</style>
