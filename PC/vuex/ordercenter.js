import axios from '@/api/http/axios';

const CURRENTNEW = 'CURRENTNEW'; // 获取当前委托
const HISTORYEW = 'HISTORYEW'; // 获取历史委托
const CANCELORDER = 'CANCELORDER'; // 撤单
const ORDERDETAIL = 'ORDERDETAIL'; // 成交记录详情

export default {
  state: {
    navListActive: 1,
    navList: [
      {
        iconClass: 'iconClass',
        navText: '币币订单',
        href: '',
        type: 1,
        id: 1,
      },
      // {
      //   iconClass: 'iconClass',
      //   navText: '法币订单',
      //   type: 1,
      //   id: 2,
      //   href: '',
      // },
    ],
    currentTab: {
      index: 1,
      name: '当前委托',
    },
    navTab: [
      {
        name: '当前委托',
        index: 1,
      },
      {
        name: '历史委托',
        index: 2,
      },
    ],
    dataList: [
      {
        id: 1,
        data: [
          [
            {
              text: '2018/8/7',
              classes: [''],
              subContent: {
                text: '18:22:16',
                classes: '', // 默认没有
              },
            },
          ],
          [
            {
              text: '买入',
              classes: 'b-5-cl',
            },
          ],
          [
            {
              text: '38.0000000',
              classes: [''],
            },
          ],
          [
            {
              text: '38.0000000',
              classes: [''],
            },
          ],
          [
            {
              text: '38.0000000',
              classes: [''],
            },
          ],
          [
            {
              text: '38.0000000',
              classes: [''],
            },
          ],
          [
            {
              text: '38.0000000',
              classes: [''],
              subContent: {
                text: '5.0000000',
                classes: '', // 默认没有
              },
            },
          ],
          [
            {
              type: 'button', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
              text: '撤单',
              iconClass: [''],
              links: '',
              eventType: 'sddsssss',
              classes: [''],
            },
          ],
        ],
      },
    ],
    currentNew: {},
    historyNew: {},
    cancelorder: {},
    orderDetail: {},
  },
  actions: {
    listChanges({ commit }, id) {
      commit('navListActive', id);
    },
    navList({ commit }, data) {
      commit('navList', data);
    },
    currentTab({ commit }, data) {
      commit('currentTab', data);
    },
    navTabs({ commit }, data) {
      commit('navTabs', data);
    },
    incrementAsync({ commit }, data) {
      commit('increment', data);
    },
    incrementAsyncs({ commit }, data) {
      commit('increments', data);
    },
    dataList({ commit }, data) {
      commit('dataList', data);
    },
    // 获取当前委托
    currentNew({ commit }, data) {
      axios({
        url: this.state.url.ordercenter.currentNew,
        method: 'post',
        params: data,
      }).then((rs) => {
        if (rs.code === '0') {
          commit('CURRENTNEW', rs.data);
        }
      });
    },
    // 获取历史委托
    historyNew({ commit }, data) {
      axios({
        url: this.state.url.ordercenter.historyNew,
        method: 'post',
        params: data,
      }).then((rs) => {
        if (rs.code === '0') {
          commit('HISTORYEW', rs.data);
        }
      });
    },
    // 撤单
    cancelorder({ commit }, data) {
      axios({
        url: this.state.url.ordercenter.cancelorder,
        method: 'post',
        params: data,
      }).then((rs) => {
        commit('CANCELORDER', rs);
      });
    },
    // 成交记录详情
    orderDetail({ commit }, data) {
      axios({
        url: this.state.url.ordercenter.orderDetail,
        method: 'post',
        params: data,
      }).then((rs) => {
        if (rs.code === '0') {
          commit('ORDERDETAIL', rs.data);
        }
      });
    },
  },
  mutations: {
    navListActive(state, id) {
      state.navListActive = id;
    },
    navList(state, data) {
      state.navList = data;
    },
    currentTab(state, data) {
      state.currentTab = data;
    },
    navTabs(state, data) {
      state.navTab = data;
    },
    increment(state, data) {
      state.currentValue = data.code;
    },
    increments(state, data) {
      state.currentValues = data.code;
    },
    dataList(state, data) {
      state.currencyType = data;
    },
    [CURRENTNEW](state, data) {
      state.currentNew = data;
    },
    [HISTORYEW](state, data) {
      state.historyNew = data;
    },
    [CANCELORDER](state, data) {
      state.cancelorder = data;
    },
    [ORDERDETAIL](state, data) {
      state.orderDetail = data;
    },
  },
};
