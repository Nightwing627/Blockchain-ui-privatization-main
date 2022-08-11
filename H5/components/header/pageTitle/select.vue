<template>
  <section class="pageTitle-exTrade">
    <span v-if="etfOpen" class="eft-box-icon">
      <svg class="icon icon-14" aria-hidden="true">
        <use xlink:href="#icon-a_15"></use>
      </svg>
    </span>
    <div class="page-market a-4-bg h-7-cl">
      <div class="page-market-even">{{$t('etfAdd.sbyText1')}}</div>
      <div class="page-market-even">{{$t('etfAdd.sbyText2')}}</div>
      <div class="page-market-even">{{$t('etfAdd.sbyText3')}}</div>
      <div class="page-market-even">{{$t('etfAdd.sbyText4')}}</div>
      <div class="page-market-even">{{$t('etfAdd.sbyText5')}}</div>
      <div class="u-8-cl page-market-click" @click="pClick">{{$t('etfAdd.sbyText6')}}</div>
    </div>
    <div class="header-content">
      <span class="b-1-cl showText">
        {{ showTitle }}
      </span>
      <div class="coin-label" v-if="currentCoinLabel">
        <span class="coin-text a-12-cl">{{currentCoinLabel}}</span>
        <span class="coin-bg a-12-bg"></span>
      </div>
      <svg class="icon icon-16" aria-hidden="true" @click="headerClickEvent">
        <use xlink:href="#icon-a_13"></use>
      </svg>
    </div>
  </section>
</template>

<script>
import mixin from '../../../common-mixin/header/pageTitle/select/select';
import '../../../common-mixin/header/pageTitle/select/select.styl';

export default {
  mixins: [mixin],
};
</script>
