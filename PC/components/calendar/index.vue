<!-- // Created by 侯东东.
// 日期组件
// ***************************** -->
<template>
  <div
    :class="classes"
    :style="stylees"
    :id="elementId"
    v-click-outside.capture="onClickOutside"
    v-click-outside:mousedown.capture="onClickOutside"
  >
    <!-- 展示容器 -->
    <div class="input_line_content" :class="inputLineStyle" @click="toggleMenu">
      <!-- 输入框 -->
      <input
        class="input_line_inp b-1-cl"
        type="text"
        required
        readonly
        v-model="values"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />
      <!-- 三角ICON -->
      <i class="icon icon-triangle" :class="appendIcon"></i>
      <!-- 清空选项ICON -->
      <i
        v-if="values && clearable"
        class="icon icon-clear-btn"
        :class="clearableIcon"
        @click.stop="resetOptionData"
        >X</i
      >
      <!-- 提示信息 -->
      <label class="input_line_prompt">{{ promptText }}</label>
      <!-- 选中时横线 -->
      <span class="input_line_activeLine"></span>
    </div>
    <!-- 错误信息容器 -->
    <div class="input_line_errorStence" v-if="errorHave">
      <p class="input_line_error" v-if="isError">{{ errorText }}</p>
    </div>
    <transition name="slideInDown">
      <div v-show="visible" class="select-options-box">
        <div class="preview-date-info h-4-bg" v-if="showDateInfo">
          <div class="preview-date-year f-2-cl">
            {{ currentDate.year }}
          </div>
          <div class="preview-date-day f-1-cl" :class="dateInfoTilteClass">
            {{ previewDateText }}
          </div>
        </div>
        <div class="select-option-list">
          <calendar
            :defaultShowDate="defaultShowDate"
            :agoDayHide="agoDayHide"
            :futureDayHide="futureDayHide"
            @choseDay="clickDay"
            :defaultDate="this.value"
          >
          </calendar>
        </div>
        <div class="btton-box">
          <buttons class="button" type="text" @click="cancelCalendar">
            {{ $t("application.cancel") }}
          </buttons>
          <buttons class="button" type="text" @click="confirmCalendar">
            {{ $t("application.confirm") }}
          </buttons>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { directive as clickOutside } from 'v-click-outside-x';
import buttons from '../button/Button.vue';
import calendar from './Calendar.vue';

export default {
  name: 'c-calendar',
  components: {
    calendar,
    buttons,
  },
  directives: { clickOutside },
  props: {
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
    // 选项列表 行高 默认40px
    optionHeight: {
      type: Number,
      default: 40,
    },
    // 下拉框右侧展开 ICON 默认 三角形icon
    appendIcon: {
      type: String,
      default: 'icon-triangle-down',
    },
    // 是否关闭
    disabled: {
      type: Boolean,
      default: false,
    },
    // 是否开启头部日期详情
    showDateInfo: {
      type: Boolean,
      default: false,
    },
    dateInfoTilteClass: {
      type: String,
      default: 'f-1-cl',
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
    // 设置输入框下划线class
    inputLineStyle: {
      type: String,
      default: '',
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
    agoDayHide: { type: String, default: '' },
    futureDayHide: { type: String, default: '2554387200' },
    defaultShowDate: {
      type: Number,
    },
  },
  data() {
    return {
      // 存储选中的值 和 默认选中的值
      values: '',
      oldvalues: '',
      // 控制下拉框是都可见
      visible: false,
      // 选项列表是否有数据
      isNotOption: false,
      // isFocused
      isFocused: false,
      // 是否设置成错误状态
      isError: false,
      nowV: '',
    };
  },
  mounted() {
    if (this.value) {
      this.values = this.value.replace(/\//g, '-');
      this.nowV = this.values;
    }
  },
  computed: {
    currentLan() {
      if (this.$store.state.baseData) {
        return this.$store.state.baseData.lan;
      }
      return null;
    },
    currentDate() {
      const date = new Date(this.value);

      return {
        year: date.getFullYear(),
        week: date.getDay(),
        month: date.getMonth(),
        day: date.getDate(),
      };
    },
    previewDateText() {
      if (!this.value) return '';
      const isChinese = this.currentLan === 'zh_CN';
      const weekText = this.$t(`weeks.${this.currentDate.week}`);
      const month = this.$t(`months.${this.currentDate.month}`);
      const day = `${this.currentDate.day}${isChinese ? '日' : ''}`;
      // 2019-02-01

      const en = `${weekText},${day} ${month}`;
      const zh = `${month}${day}，${weekText}`;

      return isChinese ? zh : en;
    },
    classes() {
      return [
        'common-select',
        {
          'select-visible': this.visible,
          'select-disabled': this.disabled,
          'select-value': this.values,
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
  },
  watch: {
    value(data) {
      if (!data) this.values = '';
      else if (this.value) {
        this.values = data.replace(/\//g, '-');
      }
    },
    visible(value) {
      this.$emit('opent-chang', value, this.name);
    },
    errorFlag(value) {
      this.isError = value;
    },
  },
  methods: {
    clickDay(data) {
      this.nowV = data.replace(/\//g, '-');
      this.$emit('onChanges', data.replace(/\//g, '-'), this.name);
    },
    /* changeDate(data) {
      console.log(data); // 左右点击切换月份
    }, */
    // 下拉框 显示&隐藏
    toggleMenu() {
      this.visible = !this.visible;
    },
    // 点击 select 以外 隐藏下拉框
    onClickOutside() {
      this.oldvalues = this.values;
      this.visible = false;
    },
    // 点击 选项
    onOptionClick(item) {
      this.visible = false;
      this.isError = false;
      this.$emit('onChanges', item, this.name);
    },
    // 清除选项
    resetOptionData() {
      this.values = '';
      this.$emit('onClear', true, this.name);
    },
    // 取消选择日期
    cancelCalendar() {
      this.$emit('onChanges', this.oldvalues, this.name);
      this.visible = false;
      this.isError = false;
    },
    confirmCalendar() {
      this.oldvalues = this.values;
      this.visible = false;
      this.$emit('onSelect', this.nowV, this.name);
    },
  },
};
</script>

<style scoped lang="stylus">
.common-select {
  position relative
  cursor pointer

  .btton-box {
    text-align right
    padding 0 24px 15px 24px

    .common-button {
      font-size 14px
    }
  }

  .input_line_content {
    height 46px
    box-sizing border-box
    border-bottom 2px solid #3F4D66
    position relative
  }

  // 输入框容器
  .input_line_inp {
    position absolute
    bottom 0px
    z-index 2
    width 100%
    border 0px
    font-size 14px
    height 30px
    background none
    box-sizing border-box
    outline none
    display inline-block
    -webkit-transition 0.3s
    transition 0.3s
    cursor pointer
  }

  // 提示文案容器
  .input_line_prompt {
    z-index 1
    position absolute
    height 30px
    line-height 30px
    bottom 0px
    left 0
    font-size 14px
    -webkit-transition 0.3s
    transition 0.3s
    user-select none
  }

  // 下划线动效容器
  .input_line_activeLine {
    position absolute
    z-index 3
    bottom -2px
    height 2px
    width 0
    left 50%
    transform translateX(-50%)
    display inline-block
    background #18B6FF
    -transition 0.5s
    -webkit-transition 0.5s
    -ms-transition 0.5s
    animation-delay 0.5s
    -webkit-animation-delay 0.5s
    -ms-animation-delay 0.5s
  }

  // 错误文案容器
  .input_line_errorStence {
    height 24px
    position relative

    // 错误文案容器
    .input_line_error {
      position absolute
      bottom 0
      margin 0
      font-size 12px
      color #EB4D5C
      user-select none
    }
  }

  // ICON
  .icon-triangle {
    // color: #828EA1;
    position absolute
    right 5px
    bottom 12px
    width 0
    height 0
    border-width 4px 4px 0
    border-style solid
    border-color #828EA1 transparent transparent /* 灰 透明 透明 */
    // text-align: center;
    // width: 20px;
    // line-height: 10px;
    // cursor: pointer;
    transition all 0.3s ease-in-out
  }

  // 清除 ICON
  .icon-clear-btn {
    color #828EA1
    position absolute
    right 0
    bottom 0
    text-align center
    width 20px
    line-height 30px
    cursor pointer
    display none
  }

  // 下拉框
  .select-options-box {
    position absolute
    transform-origin center top 0px
    top 46px
    left 0
    right 0
    z-index 9
    background-color #1D2635
    width 400px
    box-shadow 0 3px 4px 1px rgba(0, 0, 0, 0.28)
    border-radius 2px
    font-size 14px
    color #EDF4F8
    padding 0 0 10px 0

    .select-option-list {
      padding-top 10px

      .select-option-item {
        line-height 40px
        font-size 12px
        height 40px
        padding 0 20px
        cursor pointer

        &:hover, &.selected {
          background #263043
        }
      }

      .select-option-item-double {
        padding 4px 20px
        cursor pointer

        .label {
          color #828ea1
        }

        &:hover, &.selected {
          background #263043
        }
      }
    }

    // 没有选项的样式
    .not_option {
      font-size 12px
      line-height 40px
      padding 0 20px
    }

    .preview-date-info {
      width 400px
      height 100px

      .preview-date-year {
        padding 30px 0 11px 40px
        font-size 12px
        line-height 16px
      }

      .preview-date-day {
        padding-left 40px
        font-family PingFangSC-Regular
        font-size 22px
      }
    }
  }

  // input聚焦/具有文本时 提示文案浮起吃
  .input_line_inp:valid+.input_line_prompt,
  &.select-value .input_line_prompt,
  &.select-visible .input_line_prompt {
    font-size 12px
    -ms-transform translateY(-20px)
    -webkit-transform translateY(-20px)
    transform translateY(-20px)
  }

  // input聚焦 下划线动效
  .input_line_content:hover .input_line_activeLine,
  &.select-visible .input_line_activeLine,
  .input_line_inp:valid+.input_line_prompt {
    width 100%
  }

  // 错误样式
  &.select-error {
    .input_line_activeLine {
      width 100%
      background #EB4D5C
    }

    .input_line_prompt {
      color #EB4D5C
      animation shake 0.6s cubic-bezier(0.25, 0.8, 0.5, 1)
    }
  }

  // 展开样式
  &.select-visible {
    // 三角旋转180度
    .icon-triangle-down {
      transform rotate(180deg)
    }
  }

  // 有值样式
  &:hover {
    // 清除按钮显示
    .icon-clear-btn {
      z-index 9
      background-color #000
      display inline-block
    }
  }

  // 展开动画
  .slideInDown-enter-active {
    transition all 0.3s ease
  }

  .slideInDown-leave-active {
    transition all 0.3s cubic-bezier(1, 0.5, 0.8, 1)
  }

  .slideInDown-enter, .slideInDown-leave-to {
    transform translateY(-15px)
    opacity 0
  }

  // 错误 label 抖动 动画
  @keyframes shake {
    59% {
      margin-left 0
    }

    60%, 80% {
      margin-left 2px
    }

    70%, 90% {
      margin-left -2px
    }
  }

  @keyframes shake {
    59% {
      margin-left 0
    }

    60%, 80% {
      margin-left 2px
    }

    70%, 90% {
      margin-left -2px
    }
  }
}
</style>
