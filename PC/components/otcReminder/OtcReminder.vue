// Created by 任泽阳. // otc温馨提示 // *****************************
<template>
  <section class='otcReminder b-3-cl'>
    <p class='otcReminder-title' @click='handClick'>
      <!-- 温馨提示 -->
      {{ $t('components.otcReminder.title') }}
    </p>
    <ul class='otcReminder-list' v-if='flag'>
      <!-- 1.交易前请详细了解对方的交易信息。 -->
      <li>{{ $t('components.otcReminder.text1') }}</li>
      <!-- 2.请通过平台进行沟通约定，并保存好相关聊天记录。 -->
      <li>{{ $t('components.otcReminder.text2') }}</li>
      <!-- 3.如遇到交易纠纷，可通过申诉来解决问题。 -->
      <li>{{ $t('components.otcReminder.text3') }}</li>
      <li>{{ $t('components.otcReminder.text4') }}</li>
    </ul>
  </section>
</template>
<script>
export default {
  name: 'c-otcReminder',
  data() {
    return {
      flag: true,
    };
  },
  methods: {
    handClick() {
      this.flag = !this.flag;
    },
  },
};
</script>
<style lang='stylus' scoped>
.otcReminder {
  margin-top: 40px;
  font-size: 12px;
  .otcReminder-title {
    cursor: pointer;
    user-select: none
  }
  .otcReminder-list {
    line-height: 22px;
    margin-top: 20px;
    li {
      max-width: 680px;
    }
  }
}
</style>
