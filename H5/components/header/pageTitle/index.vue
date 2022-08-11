<template>
  <section class="header-pageTitle">
    <!-- 选择框定制 -->
    <header-select v-if="selectFlag"/>
    <login v-if="homeFlag"/>
    <!-- 默认 -->
    <div v-if="!selectFlag && !homeFlag" class="defind-pageTitle b-1-cl">
      {{defineTitle}}
    </div>
  </section>
</template>

<script>
import headerSelect from './select.vue';
import login from './login.vue';
import mixin from '../../../common-mixin/header/pageTitle/index/index';
import '../../../common-mixin/header/pageTitle/index/index.styl';

export default {
  mixins: [mixin],
  components: {
    headerSelect,
    login,
  },
};
</script>
