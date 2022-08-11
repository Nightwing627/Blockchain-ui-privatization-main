// Created by 任泽阳 on 18/12/25.
// 公共部分路由 (三站公用的路由)
import { routerEnv } from '@/utils';
import pcRouter from '../../router/common-router';
import assetsRouter from '../../router/assetsRouter';

export default [
  ...pcRouter,
  // 经纪人系统 列表
  {
    path: `${routerEnv}/broker`,
    name: 'broker',
    meta: {
      theme: 'homeOther',
      navigation: '1', // 国际版中使用横向导航
      hideFooter: 'false', // 不隐藏footer
      pageTitle: 'broker',
    },
    component: () => import('@/views/broker/index.vue'),
  },
  // 资金管理
  {
    path: `${routerEnv}/assets`,
    name: 'assets',
    component: () => import('@/views/assets/index.vue'),
    children: [
      ...assetsRouter,
      // 币宝账户
      {
        path: 'bibaoAccount',
        name: 'assets',
        meta: {
          mustLogin: true,
          navName: 'bibaoAccount',
        },
        component: () => import('@/views/assets/bibaoAccount.vue'),
      },
      // 币宝详情
      {
        path: 'bibaoDetail',
        name: 'assets',
        meta: {
          mustLogin: true,
          navName: 'bibaoDetail',
        },
        component: () => import('@/views/assets/bibaoDetail.vue'),
      },
      // b2c账户
      {
        path: 'b2cAccount',
        name: 'assets',
        meta: {
          mustLogin: true,
          navName: 'b2cAccount',
          activeName: 'assets',
        },
        component: () => import('@/views/assets/b2cAccount.vue'),
      },
      // b2c账户
      {
        path: 'b2cRecrge',
        name: 'assets',
        meta: {
          mustLogin: true,
          navName: 'b2cAccount',
          activeName: 'assets',
        },
        component: () => import('@/views/assets/b2cRecrge.vue'),
      },
      // b2c账户
      {
        path: 'b2cWithdraw',
        name: 'assets',
        meta: {
          mustLogin: true,
          navName: 'b2cAccount',
          activeName: 'assets',
        },
        component: () => import('@/views/assets/b2cWithdraw.vue'),
      },
      // b2c账户
      {
        path: 'b2cAddressMent',
        name: 'assets',
        meta: {
          mustLogin: true,
          navName: 'b2cAccount',
          activeName: 'assets',
        },
        component: () => import('@/views/assets/b2cAddressMent.vue'),
      },
      // b2c账户
      {
        path: 'b2cAdd',
        name: 'assets',
        meta: {
          mustLogin: true,
          navName: 'b2cAccount',
          activeName: 'assets',
        },
        component: () => import('@/views/assets/b2cAdd.vue'),
      },
      // b2c账户
      {
        path: 'b2cFlowingWater',
        name: 'assets',
        meta: {
          mustLogin: true,
          navName: 'b2cFlowingWater',
          activeName: 'assets',
        },
        component: () => import('@/views/assets/b2cFlowingWater.vue'),
      },
    ],
  },
  // 理财宝详情页
  {
    path: `${routerEnv}/manageFinances/:id`,
    name: 'manageFinancesView',
    meta: {
      mustLogin: true,
      theme: 'homeOther',
      navigation: '1', // 国际版中使用横向导航
      hideFooter: 'false', // 不隐藏footer
    },
    component: () => import('@/views/manageFinances/view.vue'),
  },
  // 理财宝首页
  {
    path: `${routerEnv}/manageFinances`,
    name: 'manageFinances',
    meta: {
      theme: 'homeOther',
      navigation: '1', // 国际版中使用横向导航
      hideFooter: 'false', // 不隐藏footer
    },
    component: () => import('@/views/manageFinances/list.vue'),
  },
  // 理财宝订单页
  {
    path: `${routerEnv}/manageFinancesOrder`,
    name: 'manageFinancesOrder',
    meta: {
      theme: 'homeOther',
      navigation: '1', // 国际版中使用横向导航
      hideFooter: 'false', // 不隐藏footer
    },
    component: () => import('@/views/manageFinances/orderList.vue'),
  },
  {
    path: `${routerEnv}/questions`,
    name: 'questions',
    redirect: '/questions/init',
    meta: {
      theme: '',
      navigation: '1', // 国际版中使用横向导航
      hideFooter: 'false', // 不隐藏footer
      mustLogin: true,
    },
    component: () => import('@/views/problemCenter/index.vue'),
    children: [
      {
        path: 'init',
        name: 'questions',
        meta: {
          theme: '',
          navigation: '1', // 国际版中使用横向导航
          hideFooter: 'false', // 不隐藏footer
          mustLogin: true,
          activeName: '/questions/init',
        },
        component: () => import('@/views/problemCenter/initQuestions.vue'),
      },
      {
        path: 'list',
        name: 'questions',
        meta: {
          theme: '',
          navigation: '1', // 国际版中使用横向导航
          hideFooter: 'false', // 不隐藏footer
          mustLogin: true,
          activeName: '/questions/list',
        },
        component: () => import('@/views/problemCenter/questionsList.vue'),
      },
      {
        path: 'questionsDetails',
        name: 'questions',
        meta: {
          theme: '',
          navigation: '1', // 国际版中使用横向导航
          hideFooter: 'false', // 不隐藏footer
          mustLogin: true,
          activeName: '/questions/list',
        },
        component: () => import('@/views/problemCenter/questionsDetails.vue'),
      },
    ],
  },
  // 行情页面
  {
    path: `${routerEnv}/market`,
    name: 'market',
    meta: {
      footNotMrgin: true,
    },
    component: () => import('@/views/market/index.vue'),
  },
  {
    path: `${routerEnv}/freeStaking`,
    name: 'freeStaking',
    meta: {
      mustLogin: false,
      theme: 'homeOther',
      navigation: '1', // 国际版中使用横向导航
      hideFooter: 'false', // 不隐藏footer
      footNotMrgin: true,
    },
    component: () => import('@/views/freeStaking/home/index.vue'),
  },
  {
    path: `${routerEnv}/freeStaking/:id`,
    name: 'freeStakingDetail',
    meta: {
      mustLogin: false,
      theme: 'homeOther',
      navigation: '1', // 国际版中使用横向导航
      hideFooter: 'false', // 不隐藏footer
    },
    component: () => import('@/views/freeStaking/detail/index.vue'),
  },
  {
    path: `${routerEnv}/myPos`,
    name: 'myPos',
    meta: {
      mustLogin: true,
      theme: 'homeOther',
      navigation: '1', // 国际版中使用横向导航
      hideFooter: 'false', // 不隐藏footer
    },
    component: () => import('@/views/freeStaking/myPos/index.vue'),
  },
];
