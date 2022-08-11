
import axios from '@/api/http/axios';
import { getComplexType } from '@/utils';


export default {
  state: {
    exchangeData: null, // 资金
    krwData: null, // krw数据
    assetsCoinData: null,
  },
  actions: {
    assetsExchangeData({ commit }, payLoad) {
      let auto = false;
      let coinSymbols = '';

      if (getComplexType(payLoad) === 'Object') {
        auto = payLoad.auto;
        coinSymbols = payLoad.coinSymbols;
      } else {
        auto = payLoad;
      }

      const headers = {};
      if (auto) {
        headers['exchange-auto'] = '1';
      }
      axios({
        url: 'finance/v5/account_balance',
        headers,
        params: { coinSymbols },
      }).then((data) => {
        if (data.code.toString() === '0') {
          if (coinSymbols) {
            commit('assetsCoin', data.data);
          } else {
            commit('assetsExchangeData', data.data);
          }
        }
      });
    },
    krwData({ commit }) {
      axios({
        url: 'fiat/balance',
      }).then((data) => {
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          commit('krwData', data.data);
        }
      });
    },
  },
  mutations: {
    assetsCoin(state, data) {
      state.assetsCoinData = data;
    },
    assetsExchangeData(state, data) {
      state.exchangeData = data;
    },
    krwData(state, data) {
      state.krwData = data;
    },
  },
};
