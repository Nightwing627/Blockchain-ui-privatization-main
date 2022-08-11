/**
 * Created by wangxiaobo on 18/12/17.
 */
import { routerEnv } from '@/utils';
import personalRouter from '../../router/personalRouter';

export default [
  {
    path: `${routerEnv}/personal`,
    name: 'personal',
    component: () => import('@/views/personal/index.vue'),
    redirect: '/personal/userManagement',
    children: [
      ...personalRouter,
      {
        path: 'brokerSystem',
        name: 'personal',
        meta: {
          mustLogin: true,
          hideFooter: true,
          navName: 'brokerSystem',
          pageTitle: 'personal',
        },
        component: () => import('@/views/personal/brokerSystem/index.vue'),
      },
      {
        path: 'exBroker',
        name: 'personal',
        meta: {
          mustLogin: true,
          hideFooter: true,
          navName: 'exBroker',
          pageTitle: 'personal',
        },
        component: () => import('@/views/personal/broker/index.vue'),
      },
      {
        path: 'inviteCodeManagement',
        name: 'personal',
        meta: {
          mustLogin: true,
          hideFooter: true,
          navName: 'inviteCodeManagement',
        },
        component: () => import('@/views/personal/InviteCodeManagement.vue'),
      },
      {
        path: 'krwBank',
        name: 'personal',
        meta: { mustLogin: true, hideFooter: true, navName: 'krwBank' },
        component: () => import('@/views/personal/krwBank.vue'),
      },
      {
        path: 'krwKyc',
        name: 'personal',
        meta: { mustLogin: true, hideFooter: true, navName: 'krwKyc' },
        component: () => import('@/views/personal/krwKyc.vue'),
      },
      {
        path: 'faceAuth',
        name: 'personal',
        meta: { mustLogin: true, hideFooter: true, navName: 'userManagement' },
        component: () => import('@/views/personal/kycAuth.vue'),
      },
      {
        path: 'kycAuth',
        name: 'personal',
        meta: { mustLogin: true, hideFooter: true, navName: 'userManagement' },
        component: () => import('@/views/personal/kycAuthselect.vue'),
      },
      {
        path: 'exccAuthForm',
        name: 'personal',
        meta: { mustLogin: true, hideFooter: true, navName: 'userManagement' },
        component: () => import('@/views/personal/exccAuthForm.vue'),
      },
      {
        path: 'exccAuthorization',
        name: 'personal',
        meta: { mustLogin: true, hideFooter: true, navName: 'userManagement' },
        component: () => import('@/views/personal/exccAuthorization.vue'),
      },
    ],
  },
];
