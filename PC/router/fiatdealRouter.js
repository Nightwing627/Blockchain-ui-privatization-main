import { routerEnv } from '@/utils';

export default [
  {
    path: `${routerEnv}`,
    name: 'fiatdeal',
    meta: {
      activeName: 'otcTrade',
      pageTitle: 'select', // header
    },
    component: () => import('@/views/fiatdeal/index.vue'),
  },
  {
    path: `${routerEnv}/creditCard`,
    name: 'creditCard',
    meta: {
      footNotMrgin: true,
      activeName: 'otcTrade',
      pageTitle: 'select', // header
    },
    component: () => import('@/views/fiatdeal/creditCard.vue'),
  },
];
