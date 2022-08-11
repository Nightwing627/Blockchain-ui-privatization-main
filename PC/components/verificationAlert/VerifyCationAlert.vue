// Created by 任泽阳. // 基于带图弹窗封装的组件 // *****************************
<template>
  <c-alert
    @close='close'
    :imgMap='imgMap'
    @confirm='confirm'
    :buttonText='buttonText'
    :showFlag='showFlag'
    imageType='1'
    :haveClose="haveClose"
  >
    <section class='verificationc-alert'>
      <div class='alertTitle b-1-cl'>{{ titleText }}</div>
      <div class='alertText'>{{ detaText }}</div>
      <div
        class='alertError a-2-bd'
        v-for='(item, index) in dataList'
        :key='index'
      >
        <span class='alertError-text'>{{ item.text }}</span>
        <span class='alertError-icon'>
          <svg class='icon icon-14' aria-hidden='true' v-if='item.flag'>
            <use xlink:href='#icon-a_14_1'></use>
          </svg>
          <svg class='icon icon-14' aria-hidden='true' v-else>
            <use xlink:href='#icon-a_14'></use>
          </svg>
        </span>
      </div>
    </section>
  </c-alert>
</template>
<script>
export default {
  name: 'c-verifyCationc-alert',
  props: {
    imgMap: {
      type: Object,
      default: () => {},
      required: true,
    },
    // 数据列表
    dataList: {
      type: Array,
      default: () => [],
    },
    titleText: { default: '', type: String },
    detaText: { default: '', type: String },
    // 展示变量
    showFlag: { default: false, type: Boolean },
    // button文案
    buttonText: { default: '', type: String },
    haveClose: { default: true, type: Boolean },
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
<style lang='stylus' scoped>
.verificationc-alert {
  .alertTitle {
    margin-bottom: 15px;
  }
  .alertText {
    width: 285px;
    font-size: 12px;
    margin-bottom: 5px;
  }
  .alertError {
    height: 36px;
    border-bottom-width: 1px;
    border-bottom-style: solid;
    line-height: 36px;
    .alertError-text {
      font-size: 12px;
    }
    .alertError-icon {
      float: right;
    }
  }
  .alertBot {
    margin-bottom: 10px
  }
}
</style>
