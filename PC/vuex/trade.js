
// K线历史数据
const KLINEREQDATA = 'KLINEREQDATA';
const KLINESUBDATA = 'KLINESUBDATA';

export default {
  state: {
    kLinwReqData: null,
    kLinwSubData: null,
  },
  actions: {
    kLinwReqData({ commit }, data) {
      commit('KLINEREQDATA', data);
    },
    kLinwSubData({ commit }, data) {
      commit('KLINESUBDATA', data);
    },
  },
  mutations: {
    [KLINEREQDATA](state, result) {
      state.kLinwReqData = result;
    },
    [KLINESUBDATA](state, result) {
      state.kLinwSubData = result;
    },

  },
};
