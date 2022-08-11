import { routerEnv } from '@/utils';
import pcRouter from '../../router/common-router';
import assetsRouter from '../../router/assetsRouter';

export default [
  ...pcRouter,
  {
    path: `${routerEnv}/broker`,
    name: 'broker',
    meta: {
      theme: 'homeOther',
      navigation: '1', // 国际版中使用横向导航
      hideFooter: 'false', // 不隐藏footer
      pageTitle: 'broker',
    },
    component: () => import('@/views/broker/broker.vue'),
  },
  // 资金管理
  {
    path: `${routerEnv}/assets`,
    name: 'assets',
    component: () => import('@/views/assets/index.vue'),
    children: [...assetsRouter],
  },
  // 理财宝详情页
  {
    path: `${routerEnv}/noticeDetail`,
    redirect: (to) => {
      let type = '';
      if (to.query.type === 'cms') {
        type = `${routerEnv}/cms/${to.query.id}`;
      } else {
        type = `${routerEnv}/noticeInfo/${to.query.id}`;
      }
      return type;
    },
  },
  {
    path: `${routerEnv}/setLang`,
    name: 'setLang',
    meta: {
      theme: 'homeOther',
      pageTitle: 'setLang',
    },
    component: () => import('@/views/setLang.vue'),
  },
];
