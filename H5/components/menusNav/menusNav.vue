<template>
<div class="common-menusNav a-4-bg">
  <ul class="menusNav">
    <li v-for="(item, index) in navList"
      :key="index"
      :class="item.active ? 'x-1-cl' : ''"
      @click="handClick(item.link)">
        {{ item.text }}
      <span v-if="item.active" class="line u-8-bg"></span>
    </li>
  </ul>
</div>
</template>

<script>
export default {
  name: 'c-h-menusNav',
  props: {
    navList: {
      default: [],
    },
  },
  methods: {
    handClick(v) {
      this.$router.push(v);
    },
  },
};
</script>


<style lang="stylus" scoped>
.common-menusNav {
  width: 100%;
  height: 0.4rem;
  overflow-x: scroll;
  display: flex;
  .menusNav {
    display: flex;
    li {
      margin: 0 0.15rem;
      line-height: 0.4rem;
      font-size: 0.14rem;
      position: relative;
      white-space: nowrap;
    }
    .line {
      position: absolute;
      height: 0.02rem;
      width: 0.4rem;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
    }
  }
}

</style>
