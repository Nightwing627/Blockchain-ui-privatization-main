
import axios from '@/api/http/axios';

export default {
  state: {
    coOrderData: {
      count: 0,
      orderList: [],
    },
  },
  actions: {
    getCoOrderListData({ commit }, data) {
      const headers = {};
      if (data.auto) {
        headers['exchange-auto'] = '1';
      }
      axios({
        url: data.url,
        method: 'post',
        hostType: 'co',
        headers,
        params: data.params,
      }).then((rs) => {
        if (rs.code === '0') {
          commit('CO_ORDER_LIST_DATA', rs.data);
        }
      });
    },
  },
  mutations: {
    CO_ORDER_LIST_DATA(state, data) {
      state.coOrderData = data;
    },
  },
};
