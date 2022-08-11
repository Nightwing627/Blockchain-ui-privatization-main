import { routerEnv } from '@/utils';

export default [
  // 区域和IP禁止访问 落地页
  // {
  //   path: `${routerEnv}/serviceLimit`,
  //   name: 'serviceLimit',
  //   meta: {
  //     theme: 'homeOther',
  //     navigation: '1', // 国际版中使用横向导航
  //     hideFooter: 'MandatoryHide', // 隐藏footer
  //     hideHeade: 'visitLimit', // 访问限制，不显示头部导航
  //     H5HideCommonHeader: true,
  //   },
  //   component: () => import('@/views/areaAndIpLimit.vue'),
  // },
  // 经纪人系统 详情
  {
    path: `${routerEnv}/broker/:item`,
    name: 'broker',
    meta: {
      theme: 'homeOther',
      navigation: '1', // 国际版中使用横向导航
      hideFooter: 'false', // 不隐藏footer
      pageTitle: 'broker',
    },
    component: () => import('@/views/broker/view.vue'),
  },
  // 创新试验区详情
  {
    path: `${routerEnv}/innovation/:id`,
    name: 'innovationView',
    meta: {
      mustLogin: true,
      theme: 'homeOther',
      navigation: '1', // 国际版中使用横向导航
      hideFooter: 'false', // 不隐藏footer
      pageTitle: 'innovation',
    },
    component: () => import('@/views/innovation/view.vue'),
  },
  // 创新试验区列表
  {
    path: `${routerEnv}/innovation`,
    name: 'innovation',
    meta: {
      theme: 'homeOther',
      navigation: '1', // 国际版中使用横向导航
      hideFooter: 'false', // 不隐藏footer
      pageTitle: 'innovation',
    },
    component: () => import('@/views/innovation/list.vue'),
  },
  // 挖矿交易
  {
    path: `${routerEnv}/mining`,
    name: 'mining',
    meta: {
      theme: 'homeOther',
      navigation: '1', // 国际版中使用横向导航
      hideFooter: 'false', // 不隐藏footer
      pageTitle: 'mining',
    },
    component: () => import('@/views/mining.vue'),
  },
  // 消息中心
  {
    path: `${routerEnv}/mesage`,
    name: 'mesage',
    meta: {
      mustLogin: true,
      theme: '',
      navigation: '1', // 国际版中使用横向导航
      hideFooter: 'false', // 不隐藏footer
      pageTitle: 'select',
    },
    component: () => import('@/views/mesage.vue'),
  },
  // 帮助中心
  {
    path: `${routerEnv}/cms/:id?`,
    name: 'cms',
    meta: {
      theme: '',
      navigation: '1', // 国际版中使用横向导航
      hideFooter: 'false', // 不隐藏footer
      pageTitle: 'select',
    },
    component: () => import('@/views/cms.vue'),
  },
  // 公告
  {
    path: `${routerEnv}/noticeInfo/:ntId?`,
    name: 'noticeInfo',
    meta: {
      navigation: '1', // 国际版中使用横向导航
      hideFooter: 'false', // 不隐藏footer
      pageTitle: 'select',
    },
    component: () => import('@/views/noticeInfo.vue'),
  },
  // 登录
  {
    path: `${routerEnv}/login`,
    name: 'login',
    meta: {
      hideHeade: true,
      appRouter: 'login', // 在app中访问APP
      isCoOpen: true,
    },
    component: () => import('@/views/login.vue'),
  },
  // 注册
  {
    path: `${routerEnv}/register`,
    name: 'register',
    meta: {
      hideHeade: true,
    },
    component: () => import('@/views/Register.vue'),
  },
  // 找回密码
  {
    path: `${routerEnv}/resetPass`,
    name: 'resetPass',
    meta: {
      hideHeade: true,
      isCoOpen: true,
    },
    component: () => import('@/views/resetPass.vue'),
  },
  // 流动性otc
  {
    path: `${routerEnv}/mobility`,
    name: 'otcTrade',
    meta: {
      hideHeade: true,
      mustLogin: true,
    },
    component: () => import('@/views/mobility/index.vue'),
  },
  // 订单中心new
  {
    path: `${routerEnv}/order`,
    name: 'order',
    component: () => import('@/views/order/index.vue'),
    children: [
      // 币币订单
      {
        path: 'exchangeOrder',
        name: 'order',
        meta: {
          mustLogin: true,
          navName: 'exchangeOrder',
          activeName: 'order',
          pageTitle: 'order',
        },
        component: () => import('@/views/order/exchangeOrder.vue'),
      },
      // 法币订单
      {
        path: 'otcOrder',
        name: 'order',
        meta: {
          mustLogin: true,
          navName: 'otcOrder',
          pageTitle: 'order',
          activeName: 'order',
        },
        component: () => import('@/views/order/otcOrder.vue'),
      },
      // 杠杆订单
      {
        path: 'leverageOrder',
        name: 'order',
        meta: {
          mustLogin: true,
          navName: 'leverageOrder',
          activeName: 'order',
          pageTitle: 'order',
        },
        component: () => import('@/views/order/leverageOrder.vue'),
      },
      // 合约订单
      {
        path: 'coOrder',
        name: 'order',
        meta: {
          mustLogin: true,
          navName: 'coOrder',
          activeName: 'order',
          pageTitle: 'order',
        },
        component: () => import('@/views/order/coOrder.vue'),
      },
    ],
  },
  // app download
  {
    path: `${routerEnv}/install`,
    name: 'appDownload',
    meta: {
      theme: 'homeOther',
      navigation: '1', // 国际版中使用横向导航
      hideFooter: 'false', // 不隐藏footer
    },
    component: () => import('@/views/appDownload.vue'),
  },
  {
    path: `${routerEnv}/appDownload`,
    name: 'appDownload',
    meta: {
      theme: 'homeOther',
      navigation: '1', // 国际版中使用横向导航
      hideFooter: 'false', // 不隐藏footer
      pageTitle: 'appDownload',
    },
    component: () => import('@/views/appDownload.vue'),
  },
];
