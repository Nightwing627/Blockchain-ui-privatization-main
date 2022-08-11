// Created by 任泽阳 on 18/12/17. // 复选框组件
<template>
  <section class='common-checkout' @click='handClick'>
    <svg class='icon icon-16' aria-hidden='true' v-if='value'>
      <use xlink:href='#icon-c_15_1'></use>
    </svg>
    <svg class='icon icon-16' aria-hidden='true' v-else>
      <use xlink:href='#icon-c_15'></use>
    </svg>
    <!-- <span class='common-checkout-true'></span>
    <span class='common-checkout-false'</span> -->
  </section>
</template>

<script>
export default {
  name: 'c-checkBox',
  props: {
    value: { default: false, type: Boolean },
    // className: { default:  }
  },
  methods: {
    handClick() {
      this.$emit('click', !this.value);
    },
  },
};
</script>
<style lang='stylus'>
.common-checkout {
  display: inline-block;
  cursor pointer;
  .common-checkout-true {
    border-radius: 2px;
    display: inline-block;
    width: 100%;
    height: 100%;
    text-align: center;
    vertical-align middle;
  }
  .common-checkout-false {
    display: inline-block;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    border-radius: 2px;
    vertical-align middle;
  }
}
</style>
