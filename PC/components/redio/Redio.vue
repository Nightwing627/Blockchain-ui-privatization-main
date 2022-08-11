// Created by 任泽阳 on 18/12/17. // 复选框组件
<template>
  <section class='common-redio' @click='handClick'>
    <svg class='icon icon-16' aria-hidden='true' v-if='value'>
      >
      <use xlink:href='#icon-c_14_1'></use>
    </svg>
    <svg class='icon icon-16' aria-hidden='true' v-else>
      <use xlink:href='#icon-c_14'></use>
    </svg>
  </section>
</template>

<script>
export default {
  name: 'c-redio',
  props: {
    value: { default: false, type: Boolean },
    name: { default: '', type: String },
    // className: { default:  }
  },
  methods: {
    handClick() {
      this.$emit('click', this.name);
    },
  },
};
</script>
<style lang='stylus'>
.common-redio {
  display: inline-block;
  cursor pointer;
}
</style>
