export default [
  {
    path: 'userManagement',
    name: 'personal',
    meta: {
      mustLogin: true,
      hideFooter: true,
      haveNav: true, // 是否含有栏目nav
      h5NavName: 'userManagement', // 栏目nav选中状态
      navName: 'userManagement',
      pageTitle: 'personal', // header
    },
    component: () => import('@/views/personal/management.vue'),
  },
  {
    path: 'changePassword',
    name: 'personal',
    meta: {
      mustLogin: true,
      hideFooter: true,
      navName: 'userManagement',
      pageTitle: 'personal',
    },
    component: () => import('@/views/personal/ChangePassword.vue'),
  },
  {
    path: 'bindEmail',
    name: 'personal',
    meta: {
      mustLogin: true,
      hideFooter: true,
      navName: 'userManagement',
      pageTitle: 'personal',
    },
    component: () => import('@/views/personal/BindEmail.vue'),
  },
  {
    path: 'bindPhone',
    name: 'personal',
    meta: {
      mustLogin: true,
      hideFooter: true,
      navName: 'userManagement',
      pageTitle: 'personal',
      appRouter: 'bindPhone',
    },
    component: () => import('@/views/personal/BindPhone.vue'),
  },
  {
    path: 'changeEmail',
    name: 'personal',
    meta: {
      mustLogin: true,
      hideFooter: true,
      pageTitle: 'personal',
      navName: 'userManagement',
    },
    component: () => import('@/views/personal/ChangeEmail.vue'),
  },
  {
    path: 'changePhone',
    name: 'personal',
    meta: {
      mustLogin: true,
      hideFooter: true,
      pageTitle: 'personal',
      navName: 'userManagement',
    },
    component: () => import('@/views/personal/ChangePhone.vue'),
  },
  {
    path: 'bindGoogle',
    name: 'personal',
    meta: {
      mustLogin: true,
      hideFooter: true,
      navName: 'userManagement',
      pageTitle: 'personal',
      appRouter: 'bindGoogle',
    },
    component: () => import('@/views/personal/BindGoogle.vue'),
  },
  {
    path: 'idAuth',
    name: 'personal',
    meta: {
      mustLogin: true,
      hideFooter: true,
      navName: 'userManagement',
      pageTitle: 'personal',
      appRouter: 'idAuth',
    },
    component: () => import('@/views/personal/IdAuth.vue'),
  },
  {
    path: 'closeGoogle',
    name: 'personal',
    meta: {
      mustLogin: true,
      hideFooter: true,
      pageTitle: 'personal',
      navName: 'userManagement',
    },
    component: () => import('@/views/personal/CloseGoogle.vue'),
  },
  {
    path: 'closePhone',
    name: 'personal',
    meta: {
      mustLogin: true,
      hideFooter: true,
      pageTitle: 'personal',
      navName: 'userManagement',
    },
    component: () => import('@/views/personal/ClosePhone.vue'),
  },
  {
    path: 'safetyRecord',
    name: 'personal',
    meta: {
      mustLogin: true,
      hideFooter: true,
      navName: 'safetyRecord',
      h5NavName: 'userManagement',
      haveNav: true,
      pageTitle: 'personal',
    },
    component: () => import('@/views/personal/SafetyRecord.vue'),
  },
  {
    path: 'apiManagement',
    name: 'personal',
    meta: {
      mustLogin: true,
      hideFooter: true,
      navName: 'apiManagement',
      pageTitle: 'personal',
    },
    component: () => import('@/views/personal/APImanagement.vue'),
  },
  {
    path: 'checkApi',
    name: 'personal',
    meta: {
      mustLogin: true,
      hideFooter: true,
      navName: 'apiManagement',
      pageTitle: 'personal',
    },
    component: () => import('@/views/personal/checkApi.vue'),
  },
  {
    path: 'leaglTenderSet',
    name: 'personal',
    meta: {
      mustLogin: true,
      hideFooter: true,
      navName: 'leaglTenderSet',
      h5NavName: 'leaglTenderSet',
      haveNav: true,
      pageTitle: 'personal',
    },
    component: () => import('@/views/personal/LeaglTenderSet.vue'),
  },
  {
    path: 'setUp',
    name: 'personal',
    meta: {
      mustLogin: true,
      hideFooter: true,
      navName: 'leaglTenderSet',
      pageTitle: 'personal',
      appRouter: 'setUp', // 在app中访问APP
    },
    component: () => import('@/views/personal/SetUp.vue'),
  },
  {
    path: 'modifySettings',
    name: 'personal',
    meta: {
      mustLogin: true,
      hideFooter: true,
      navName: 'leaglTenderSet',
      pageTitle: 'personal',
      appRouter: 'modifySettings', // 在app中访问APP
    },
    component: () => import('@/views/personal/modifySettings.vue'),
  },
  {
    path: 'advertisingManagement',
    name: 'personal',
    meta: {
      mustLogin: true,
      hideFooter: true,
      navName: 'advertisingManagement',
      h5NavName: 'leaglTenderSet',
      haveNav: true,
      pageTitle: 'personal',
    },
    component: () => import('@/views/personal/advertisingManagement.vue'),
  },
  {
    path: 'blackList',
    name: 'personal',
    meta: {
      mustLogin: true,
      hideFooter: true,
      navName: 'blackList',
      h5NavName: 'leaglTenderSet',
      haveNav: true,
      pageTitle: 'personal',
    },
    component: () => import('@/views/personal/blackList.vue'),
  },
];
