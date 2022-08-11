<template>
  <div class="pageTitle-login f-1-cl" v-if="!isLogin">
    <div @click="link('/login')">{{$t('header.login')}}</div>
    /
    <div @click="link('/register')">{{$t('header.register')}}</div>
  </div>
</template>

<script>
import mixin from '../../../common-mixin/header/pageTitle/login/login';
import '../../../common-mixin/header/pageTitle/login/login.styl';

export default {
  mixins: [mixin],
};
</script>
