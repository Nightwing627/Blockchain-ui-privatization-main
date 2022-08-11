<template>
  <header
    ref="commonHeader"
    class="common-header h-3-bd h-1-bg">
    <pageTitle v-if="isApp && appShowPage"/>
    <!-- header展示 -->
    <template v-if="!isApp">
      <a class="button-logo" :href="isCoOpen ? 'javascript:void(0)' : headerLink.home">
        <img :src="intLogoUrl" />
      </a>
      <span class="button-menu" @click="showHeader" v-if="!isCoOpen">
        <!-- 1 -->
        <svg
          class="icon icon-18"
          aria-hidden="true">
          <use xlink:href="#icon-b_28"></use>
        </svg>
      </span>
      <li
        v-if="isCoOpen"
        @click="btnLink('/setLang')"
        class="button-li showLan lan-title">
        <span class="header-button-links">
           Language
        </span>
        <!-- <div
          class="header-user-showLan h-1-bg x-2-cl">
          <ul class="lang-list h-1-bg">
            <li v-for="(item, index) in langArr"
              :class="(lan === item.id || langHoverSub === item.id) ? 'h-4-bg x-3-cl' : ''"
              @mouseenter="handMouseenter(item.id, 'sub')"
              @mouseout="handMouseleave(item.id, 'sub')"
              @click="lanClick(item.id)"
              :key="index">{{ item.name }}</li>
          </ul>
        </div> -->
      </li>
      <div class="slot-bar">
        <pageTitle/>
      </div>
      <transition name="headerbox-fade">
        <div class="header-box h-1-bg" v-show="isShowHeader">
          <!-- 未登录时 -->
          <div class="header-guide h-2-bd" v-if="!isLogin && userInfoIsReady">
            <c-h-button
              type="hollow"
              :big="true"
              width = "1.57rem"
              height="0.4rem"
              @click="btnLink('/login')">
              <!-- 登录 -->
              {{$t('header.login')}}
            </c-h-button>
            <c-h-button
              type="solid"
              class="header-reg-button"
              height="0.4rem"
              width = "1.57rem"
              :big="true"
              @click="btnLink('/register')">
              <!-- 注册 -->
              {{$t('header.register')}}
            </c-h-button>
          </div>
          <!-- 主流板块 -->
          <ul class="common-header-linkList h-3-bd">
            <!-- 币币交易 -->
            <li
              v-if="headerLink.trade"
              class="button-li"
              :class="router === 'trade' ? 'h-4-bg x-3-cl' : ''"
              @click="btnHref(headerLink.trade)">
              <svg
                v-if="router === 'trade'"
                class="icon icon-18"
                aria-hidden="true">
                <use xlink:href="#icon-b_5_1"></use>
              </svg>
              <svg v-else
                class="icon icon-18"
                aria-hidden="true">
                <use xlink:href="#icon-b_5"></use>
              </svg>
              <span class="header-button-links">
                {{$t('header.trade')}}
              </span>
            </li>
            <!-- 法币交易 -->
            <li
              v-if="headerLink.otc"
              class="button-li"
              :class="router === 'fiatdeal' ? 'h-4-bg x-3-cl' : ''"
              @click="btnHref(headerLink.otc)">
              <svg
                v-if="router === 'fiatdeal'"
                class="icon icon-18"
                aria-hidden="true">
                <use xlink:href="#icon-b_6_1"></use>
              </svg>
              <svg v-else class="icon icon-18" aria-hidden="true">
                <use xlink:href="#icon-b_6"></use>
              </svg>
              <span class="header-button-links">
                {{fiatTradeOpen ? this.$t('assets.b2c.otcShow.header') : this.$t('header.otc')}}
              </span>
            </li>
            <li
              v-if="!headerLink.otc && saasOtcFlowConfig"
              class="button-li"
              :class="router === 'fiatdeal' ? 'h-4-bg x-3-cl' : ''"
              @click="btnHref('/mobility')">
              <svg
                v-if="router === 'fiatdeal'"
                class="icon icon-18"
                aria-hidden="true">
                <use xlink:href="#icon-b_6_1"></use>
              </svg>
              <svg v-else class="icon icon-18" aria-hidden="true">
                <use xlink:href="#icon-b_6"></use>
              </svg>
              <span class="header-button-links">
                <!-- 一键买币 -->
                {{ $t('mobilityTrade.immediately') }}
              </span>
            </li>
            <!-- 合约交易 -->
            <li
              v-if="headerLink.co"
              class="button-li"
              :class="router === 'cotrade' ? 'h-4-bg x-3-cl' : ''"
              @click="btnHref(headerLink.co)">
              <svg
                v-if="router === 'cotrade'"
                class="icon icon-18"
                aria-hidden="true">
                <use xlink:href="#icon-b_23_1"></use>
              </svg>
              <svg v-else class="icon icon-18" aria-hidden="true">
                <use xlink:href="#icon-b_23"></use>
              </svg>
              <span class="header-button-links">
                {{$t('header.co')}}
              </span>
            </li>
            <!-- 杠杆交易 -->
            <li v-if="publicInfo && publicInfo.switch
              && publicInfo.switch.lever_open
              && publicInfo.switch.lever_open.toString() === '1'"
              class="button-li"
              :class="router === 'margin' ? 'h-4-bg x-3-cl' : ''"
              @click="btnHref(headerLink.lever)">
              <svg class="icon icon-18 hover-hide"
                v-if="router === 'margin'"
                aria-hidden="true">
                <use xlink:href="#icon-b_24_1"></use>
              </svg>
              <svg class="icon icon-18 hover-show"
                v-else
                aria-hidden="true">
                <use xlink:href="#icon-b_24"></use>
              </svg>
              <span class="header-button-links">
                {{$t('header.lever')}}
              </span>
            </li>
            <!-- 资产 -->
            <li
              v-if="isLogin && userInfoIsReady"
              class="button-li"
              :class="router === 'assets' ? 'h-4-bg x-3-cl' : ''"
              @click="btnLink('/assets/exchangeAccount')">
              <svg
                v-if="router === 'assets'"
                class="icon icon-18"
                aria-hidden="true">
                <use xlink:href="#icon-b_8_1"></use>
              </svg>
              <svg v-else class="icon icon-18" aria-hidden="true">
                <use xlink:href="#icon-b_8"></use>
              </svg>
              <span class="header-button-links">
                {{$t('header.assets')}}
              </span>
            </li>
            <!-- 订单 -->
            <li
              v-if="isLogin && userInfoIsReady"
              class="button-li"
              :class="router === 'order' ? 'h-4-bg x-3-cl' : ''"
              @click="btnLink('/order/exchangeOrder')">
              <svg
                v-if="router === 'order'"
                class="icon icon-18"
                aria-hidden="true">
                <use xlink:href="#icon-b_27_1"></use>
              </svg>
              <svg v-else class="icon icon-18" aria-hidden="true">
                <use xlink:href="#icon-b_27"></use>
              </svg>
              <span class="header-button-links">
                {{$t('header.order')}}
              </span>
            </li>
            <!-- 个人中心 -->
            <li
              class="button-li header-user"
              :class="router === 'personal' ? 'h-4-bg x-3-cl' : ''"
              @click="btnLink('/personal/userManagement')">
              <i class="iconClass" style="top: 19px;">
                <svg
                  v-if="router === 'personal'"
                  class="icon icon-18"
                  aria-hidden="true">
                  <use xlink:href="#icon-b_4_1"></use>
                </svg>
                <svg v-else class="icon icon-18" aria-hidden="true">
                  <use xlink:href="#icon-b_4"></use>
                </svg>
              </i>
              <span class="header-button-links">
                <!-- 用户中心 -->
                {{$t('header.account')}}
              </span>
            </li>
            <!-- 消息 -->
            <!-- v-if="isLogin && userInfoIsReady" -->
            <li
              class="button-li"
              :class="router === 'mesage' ? 'h-4-bg x-3-cl' : ''"
              @click="btnLink('/mesage')">
              <div class="messageCount" v-if="messageCount"></div>
              <svg v-if="router === 'mesage'"
                class="icon icon-18 hover-hide" aria-hidden="true">
                <use xlink:href="#icon-b_3_1"></use>
              </svg>
              <svg v-else
                 class="icon icon-18 hover-show" aria-hidden="true">
                <use xlink:href="#icon-b_3"></use>
              </svg>
              <span class="header-button-links">
                <!-- 消息 -->
                {{$t('header.message')}}
              </span>
            </li>
          </ul>
          <!-- 扩展功能二级菜单 -->
          <ul
            v-if="publicInfo"
            class="common-header-linkList h-3-bd">
            <li
              v-if="userInfo && userInfo.agentStatus === 1"
              class="button-li"
              @click="btnLink('/broker')">
              <span>
                <!-- 经纪人系统 -->
                {{$t('header.broker')}}
              </span>
            </li>
            <li
              v-if="publicInfo.switch.is_return_open === '1'"
              class="button-li"
              @click="btnLink('/mining')">
              <span>
              <!-- 交易挖矿 -->
              {{$t('header.minings')}}
              </span>
            </li>
            <li
              v-if="publicInfo.switch.newcoinOpen === '1'"
              class="button-li"
              @click="btnLink('/innovation')">
              <span>
                <!-- 创新试验区 -->
                {{$t('header.innov_tit')}}
              </span>
            </li>
            <li
              v-if="publicInfo.switch.is_financing_open === '1'"
              class="button-li"
              @click="btnLink('/manageFinances')">
              <span>
                <!-- 理财宝 -->
                {{$t('manageFinances.manage_finances')}}
              </span>
            </li>
            <li v-if="appDownload.app_page_url"
              class="button-li"
              @click="btnLink('/appDownload')">
              <span>
                <!-- app 下载 -->
                {{$t('header.appDownLoad')}}
              </span>
            </li>
            <!--  自定义导航 -->
            <template v-if="headerTemplate.length">
              <li
                class="button-li"
                :key= "index"
                v-for="(item, index) in headerTemplate"
                @click="btnHref(item.link, item.target)">
                <span>
                  {{item.text}}
                </span>
              </li>
            </template>
            <!-- 国际化 切换语言 -->
            <li
              @click="btnLink('/setLang')"
              class="button-li showLan">
              <span class="header-button-links">
                Language
              </span>
              <!-- <div
                class="header-user-showLan h-1-bg x-2-cl">
                <ul class="lang-list h-1-bg">
                  <li v-for="(item, index) in langArr"
                    :class="(lan === item.id || langHoverSub === item.id) ? 'h-4-bg x-3-cl' : ''"
                    @mouseenter="handMouseenter(item.id, 'sub')"
                    @mouseout="handMouseleave(item.id, 'sub')"
                    @click="lanClick(item.id)"
                    :key="index">{{ item.name }}</li>
                </ul>
              </div> -->
            </li>
          </ul>
          <!-- 退出登录 -->
          <ul class="common-header-linkList h-3-bd">
            <!-- 退出登录 -->
            <li
              v-if="isLogin"
              class="button-li"
              @click="out">
              <span class="header-button-links">
                {{$t('header.out')}}
              </span>
            </li>
          </ul>
        </div>
      </transition>
    </template>

    <c-h-dialog :showFlag="showFlag"
      :titleText="$t('header.set')"
      @confirm="setConfirm"
      @close="setClose">
      <div class="setBox">
        <div class="setColor clearfix">
          <div class="setColor-key x-2-cl">{{$t('header.color')}}</div>
          <ul class="setColor-value">
            <li v-for="(item, i) in colorList" :key="i">
              <redioVue @click="setSkin(item.skinId)"
                :value="Dskin === item.skinId"/>
              <span @click="setSkin(item.skinId)" class="b-1-cl">{{ item.mainClor }}</span>
            </li>
          </ul>
        </div>
      </div>
    </c-h-dialog>
  </header>
</template>
<script>
import mixin from '../../common-mixin/header/header';
import '../../common-mixin/header/header.styl';
import pageTitle from './pageTitle/index.vue';
// 按钮
export default {
  name: 'c-h-header',
  mixins: [mixin],
  components: {
    pageTitle,
  },
};
</script>
