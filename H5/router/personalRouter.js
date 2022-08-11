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
      // EXCC认证选择页面
      {
        path: 'kycAuth',
        name: 'personal',
        meta: {
          mustLogin: true,
          pageTitle: 'personal',
        },
        component: () => import('@/views/personal/exccAuth.vue'),
      },
      // EXCC认证 人工提交模板2
      {
        path: 'exccAuthForm',
        name: 'personal',
        meta: {
          mustLogin: true,
          pageTitle: 'personal',
        },
        component: () => import('@/views/personal/exccAuthForm.vue'),
      },
      // EXCC认证 回调页面
      {
        path: 'exccAuthorization',
        name: 'personal',
        meta: {
          mustLogin: true,
          pageTitle: 'personal',
        },
        component: () => import('@/views/personal/exccAuthorization.vue'),
      },
    ],
  },
];
