import { routerEnv } from '@/utils';

export default [
  {
    path: `${routerEnv}/stranger`,
    name: 'stranger',
    component: () => import('@/views/stranger.vue'),
  },
  // 交易页面
  {
    path: `${routerEnv}/otcTrade`,
    name: 'otcTrade',
    meta: { mustLogin: true, isCoOpen: true },
    component: () => import('@/views/otcTrade/index.vue'),
  },
  // 发布广告
  {
    path: `${routerEnv}/otcRelease`,
    name: 'otcRelease',
    meta: {
      mustLogin: true,
      pageTitle: 'select',
    },
    component: () => import('@/views/otcRelease/index.vue'),
  },
  // 订单详情页
  {
    path: `${routerEnv}/otcDetailOrder`,
    name: 'otcDetailOrder',
    meta: { mustLogin: true },
    component: () => import('@/views/otcDetailOrder/index.vue'),
  },
  {
    path: `${routerEnv}/companyApplicationDetail`,
    name: 'companyApplicationDetail',
    meta: { mustLogin: true },
    component: () => import('@/views/CompanyApplication/CompanyApplicationDetail.vue'),
  },
  {
    path: `${routerEnv}/companyApplication`,
    meta: { mustLogin: true },
    name: 'companyApplication',
    component: () => import('@/views/CompanyApplication/CompanyApplication.vue'),
  },
  {
    path: `${routerEnv}/applicationPolicy`,
    name: 'applicationPolicy',
    component: () => import('@/views/CompanyApplication/ApplicationPolicy.vue'),
  },
  {
    path: '*',
    component: () => import('@/views/home/index.vue'),
    redirect: `${routerEnv}/`,
  },
];
