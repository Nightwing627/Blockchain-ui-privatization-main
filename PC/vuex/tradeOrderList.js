import axios from '@/api/http/axios';

export default {
  state: {
    nowOrderData: {
      count: 0,
      orderList: [],
    },
    historyData: {
      count: 0,
      orderList: [],
    },
    subTableData: {
      count: 0,
      orderList: [],
    },
  },
  actions: {
    getOrderListData({ commit }, data) {
      const headers = {};
      if (data.auto) {
        headers['exchange-auto'] = '1';
      }
      axios({
        url: data.url,
        method: 'post',
        headers,
        params: data.params,
      }).then((rs) => {
        if (rs.code === '0') {
          const rep = rs;
          rep.data.orderType = data.orderType;
          commit('ORDER_LIST_DATA', rep.data);
          // if (data.orderType === 1) {
          //   commit('ORDER_LIST_DATA', rs.data);
          // } else {
          //   commit('HISTORY_DATA', rs.data);
          // }
        }
      });
    },
    getSubTableData({ commit }, data) {
      axios({
        url: data.url,
        method: 'post',
        params: data.params,
      }).then((rs) => {
        if (rs.code === '0') {
          const rep = rs;
          rep.data.id = data.params.order_id;
          commit('SUB_TABLE_DATA', rep.data);
        }
      });
    },
  },
  mutations: {
    ORDER_LIST_DATA(state, data) {
      state.nowOrderData = data;
    },
    HISTORY_DATA(state, data) {
      state.historyData = data;
    },
    SUB_TABLE_DATA(state, data) {
      state.subTableData = data;
    },
  },
};
