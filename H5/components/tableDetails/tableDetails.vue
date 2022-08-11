<template>
<transition name="tableDetails">
  <section class="common-tableDetails a-7-bg" v-if="flag">
    <div class="tableDetails-box">
      <div class="detailsBox-title">
        <div class="symbol"><slot name="title"/></div>
        <div class="u-8-cl return" @click="close">{{ $t('h5Add.return') }}</div>
      </div>
      <slot name="table"/>
    </div>
  </section>
</transition>
</template>

<script>
export default {
  name: 'c-h-tableDetails',
  props: {
    flag: {
      default: false,
      type: Boolean,
    },
  },
  methods: {
    close() {
      this.$emit('close');
    },
  },
};
</script>
<style lang="stylus">
.tableDetails-item-move {
  display: inline-block;
  // margin-right: 10px;
}
.tableDetails-enter-active, .tableDetails-leave-active {
  transition: all 0.3s;
}
.tableDetails-enter, .tableDetails-leave-to
/* .list-leave-active for below version 2.1.8 */ {
  opacity: 1;
  transform: translateY(80%);
}
</style>
<style lang="stylus" scoped>
.common-tableDetails {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 10;
  padding: 0.15rem;
  top: 0.43rem;
  padding-bottom 0.5rem;
  overflow-y: scroll;
  box-sizing: border-box;
  .detailsBox-title {
    display: flex;
    justify-content: space-between;
    .symbol {
      font-size: 0.16rem;
    }
  }
}
</style>
