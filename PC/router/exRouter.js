import { routerEnv } from '@/utils';

export default [
  // 杠杆交易
  {
    path: `${routerEnv}/margin/:symbol`,
    name: 'margin',
    meta: {
      footNotMrgin: true,
      activeName: 'marginTrade',
      pageTitle: 'select', // header
      isCoOpen: true,
    },
    component: () => import('@/views/lever/index.vue'),
  },
  {
    path: `${routerEnv}/margin`,
    name: 'margin',
    meta: {
      footNotMrgin: true,
      activeName: 'marginTrade',
      pageTitle: 'select', // header
      isCoOpen: true,
    },
    component: () => import('@/views/lever/index.vue'),
  },
  // 交易中心
  {
    path: `${routerEnv}/trade/:symbol`,
    name: 'trade',
    meta: {
      footNotMrgin: true,
      activeName: 'exTrade',
      hideFooter: true,
      pageTitle: 'select', // header
      isCoOpen: true,
    },
    component: () => import('@/components/modules/spotTrade/trade.vue'),
  },
  {
    path: `${routerEnv}/trade`,
    name: 'trade',
    meta: {
      footNotMrgin: true,
      activeName: 'exTrade',
      pageTitle: 'select', // header
      isCoOpen: true,
    },
    component: () => import('@/components/modules/spotTrade/trade.vue'),
  },
  // 首页
  {
    path: `${routerEnv}/`,
    name: 'home',
    meta: {
      pageTitle: 'home',
      theme: 'homeOther',
      navigation: '1',
      footNotMrgin: true,
      hideFooter: 'false',
      H5HideCommonHeader: true, // H5 隐藏公共导航
      isCoOpen: true,
    },
    component: () => import('@/views/home/index.vue'),
  },
  {
    path: '*',
    component: () => import('@/views/home/index.vue'),
    redirect: `${routerEnv}/`,
  },
];
