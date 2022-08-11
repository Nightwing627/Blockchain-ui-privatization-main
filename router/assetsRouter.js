export default [
  // 币币账户
  {
    path: 'exchangeAccount',
    name: 'assets',
    meta: {
      mustLogin: true,
      navName: 'exchangeAccount',
      activeName: 'assets',
      h5NavName: 'exchangeAccount',
      pageTitle: 'assets',
    },
    component: () => import('@/views/assets/exchangeAccount.vue'),
  },
  // 充值
  {
    path: 'recharge',
    name: 'assets',
    meta: {
      mustLogin: true,
      navName: 'exchangeAccount',
      activeName: 'assets',
      h5NavName: 'exchangeAccount',
      pageTitle: 'assets',
    },
    component: () => import('@/views/assets/recharge.vue'),
  },
  // 提现
  {
    path: 'withdraw',
    name: 'assets',
    meta: {
      mustLogin: true,
      navName: 'exchangeAccount',
      activeName: 'assets',
      h5NavName: 'exchangeAccount',
      pageTitle: 'assets',
    },
    component: () => import('@/views/assets/withdraw.vue'),
  },
  // 资金流水
  {
    path: 'flowingWater',
    name: 'assets',
    meta: {
      mustLogin: true,
      navName: 'flowingWater',
      activeName: 'assets',
      h5NavName: 'exchangeAccount',
      pageTitle: 'assets',
    },
    component: () => import('@/views/assets/flowingWater.vue'),
  },
  // 地址管理
  {
    path: 'addressMent',
    name: 'assets',
    meta: {
      mustLogin: true,
      navName: 'addressMent',
      activeName: 'assets',
      h5NavName: 'exchangeAccount',
      pageTitle: 'assets',
    },
    component: () => import('@/views/assets/addressMent.vue'),
  },
  // 法币账户
  {
    path: 'otcAccount',
    name: 'assets',
    meta: {
      mustLogin: true,
      navName: 'otcAccount',
      activeName: 'assets',
      h5NavName: 'otcAccount',
      pageTitle: 'assets',
    },
    component: () => import('@/views/assets/otcAccount.vue'),
  },
  // 法币资金流水
  {
    path: 'otcFlowingWater',
    name: 'assets',
    meta: {
      mustLogin: true,
      navName: 'otcFlowingWater',
      activeName: 'assets',
      h5NavName: 'otcAccount',
      pageTitle: 'assets',
    },
    component: () => import('@/views/assets/otcFlowingWater.vue'),
  },
  {
    path: 'innovations',
    name: 'assets',
    meta: {
      mustLogin: true,
      navName: 'innovations',
      activeName: 'assets',
      h5NavName: 'exchangeAccount',
      pageTitle: 'assets',
    },
    component: () => import('@/views/assets/innovations.vue'),
  },
  // 合约账户
  {
    path: 'coAccount',
    name: 'assets',
    meta: {
      mustLogin: true,
      navName: 'coAccount',
      activeName: 'assets',
      h5NavName: 'coAccount',
      pageTitle: 'assets',
    },
    component: () => import('@/views/assets/coAccount.vue'),
  },
  // 合约资金流水
  {
    path: 'coFlowingWater',
    name: 'assets',
    meta: {
      mustLogin: true,
      navName: 'coFlowingWater',
      activeName: 'assets',
      h5NavName: 'coAccount',
      pageTitle: 'assets',
    },
    component: () => import('@/views/assets/coFlowingWater.vue'),
  },
  // 杠杆账户
  {
    path: 'leverageAccount',
    name: 'assets',
    meta: {
      mustLogin: true,
      navName: 'leverageAccount',
      activeName: 'assets',
      h5NavName: 'leverageAccount',
      pageTitle: 'assets',
    },
    component: () => import('@/views/assets/leverageAccount.vue'),
  },
  // 杠杆借贷
  {
    path: 'leverageToLoan',
    name: 'assets',
    meta: {
      mustLogin: true,
      navName: 'leverageAccount',
      activeName: 'assets',
      h5NavName: 'leverageAccount',
      pageTitle: 'assets',
    },
    component: () => import('@/views/assets/leverageToLoan.vue'),
  },
  // 杠杆资金流水
  {
    path: 'lerverageFlowingWater',
    name: 'assets',
    meta: {
      mustLogin: true,
      navName: 'lerverageFlowingWater',
      activeName: 'assets',
      h5NavName: 'leverageAccount',
      pageTitle: 'assets',
    },
    component: () => import('@/views/assets/lerverageFlowingWater.vue'),
  },
  // b2c账户
  {
    path: 'b2cAccount',
    name: 'assets',
    meta: {
      mustLogin: true,
      navName: 'b2cAccount',
      activeName: 'assets',
      h5NavName: 'b2cAccount',
      pageTitle: 'assets',
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
      h5NavName: 'b2cAccount',
      pageTitle: 'assets',
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
      h5NavName: 'b2cAccount',
      pageTitle: 'assets',
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
      h5NavName: 'b2cAccount',
      pageTitle: 'assets',
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
      h5NavName: 'b2cAccount',
      pageTitle: 'assets',
    },
    component: () => import('@/views/assets/b2cAdd.vue'),
  },
  // b2c账户
  {
    path: 'b2cFlowingWater',
    name: 'assets',
    meta: {
      mustLogin: true,
      navName: 'b2cAccount',
      activeName: 'assets',
      h5NavName: 'b2cAccount',
      pageTitle: 'assets',
    },
    component: () => import('@/views/assets/b2cFlowingWater.vue'),
  },
];
