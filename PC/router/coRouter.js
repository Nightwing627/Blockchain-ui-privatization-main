import { routerEnv } from '@/utils';

export default [
  {
    path: `${routerEnv}/`,
    name: 'cotrade',
    meta: {
      footNotMrgin: true,
      pageTitle: 'select', // header
    },
    component: () => import('@/components/modules/spotTrade/contract.vue'),
  },
  {
    path: `${routerEnv}/trade/:symbol`,
    name: 'cotrade',
    meta: {
      activeName: 'exTrade',
      footNotMrgin: true,
      pageTitle: 'select', // header
    },
    component: () => import('@/components/modules/spotTrade/contract.vue'),
  },
  {
    path: `${routerEnv}/trade`,
    name: 'cotrade',
    meta: {
      activeName: 'exTrade',
      footNotMrgin: true,
      pageTitle: 'select', // header
    },
    component: () => import('@/components/modules/spotTrade/contract.vue'),
  },
  {
    path: `${routerEnv}/proSwap/:symbol`,
    name: 'cotrade',
    meta: {
      activeName: 'coTrade',
      footNotMrgin: true,
      pageTitle: 'select', // header
    },
    component: () => import('@/components/modules/spotTrade/contract.vue'),
  },
  {
    path: `${routerEnv}/proSwap`,
    name: 'cotrade',
    meta: {
      activeName: 'coTrade',
      footNotMrgin: true,
      pageTitle: 'select', // header
    },
    component: () => import('@/components/modules/spotTrade/contract.vue'),
  },
  {
    path: `${routerEnv}/futuresData`,
    name: 'futuresData',
    meta: {
      activeName: 'coTrade',
      footNotMrgin: true,
      pageTitle: 'select',
    },
    component: () => import('@/views/futuresData/futuresData.vue'),
  },
  {
    path: '*',
    component: () => import('@/views/home/index.vue'),
    redirect: `${routerEnv}/`,
  },
];
