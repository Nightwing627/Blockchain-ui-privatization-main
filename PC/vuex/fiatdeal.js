import axios from '@/api/http/axios';

const OTCSEARCH = 'OTCSEARCH';
const SIDEISBLOCKTRADE = 'SIDEISBLOCKTRADE';
const OTCTICKER = 'OTCTICKER';
const OTCMINUTELINE = 'OTCMINUTELINE';
const OTCPERSONHOMEPAGE = 'OTCPERSONHOMEPAGE';
const OTCUSERCONTACTS = 'OTCUSERCONTACTS';
const OTCUSERCONTACTSREMOVE = 'OTCUSERCONTACTSREMOVE';
const SETFLAG = 'SETFLAG';

export default {
  state: {
    otcSearch: null,
    sideIsBlockTrade: null,
    otcTicker: null,
    otcMinuteLine: null,
    otcPersonHomePage: null,
    otcUserContacts: null,
    otcUserContactsRemove: null,
  },
  mutations: {
    [OTCSEARCH](state, result) {
      state.otcSearch = result;
    },
    [SIDEISBLOCKTRADE](state, result) {
      state.sideIsBlockTrade = result;
    },
    [OTCTICKER](state, result) {
      state.otcTicker = result;
    },
    [OTCMINUTELINE](state, result) {
      state.otcMinuteLine = result;
    },
    [OTCPERSONHOMEPAGE](state, result) {
      state.otcPersonHomePage = result;
    },
    [OTCUSERCONTACTS](state, result) {
      state.otcUserContacts = result;
    },
    [OTCUSERCONTACTSREMOVE](state, result) {
      state.otcUserContactsRemove = result;
    },
    [SETFLAG](state, result) {
      state.flag = result;
    },
  },
  actions: {
    otcSearchFlag({ commit, state }, info) {
      if (state.flag) {
        commit('SETFLAG', false);
        const url = this.state.url.common.otc_search;
        axios({
          url,
          method: 'post',
          params: info,
          hostType: 'otc',
        }).then((data) => {
          if (Number(data.code) === 0) {
            const Info = { data: data.data };
            commit('OTCSEARCH', Info);
          }
        });
      }
    },
    otcSearch({ commit }, info) {
      const url = this.state.url.common.otc_search;
      axios({
        url,
        method: 'post',
        params: info,
        hostType: 'otc',
      }).then((data) => {
        if (Number(data.code) === 0) {
          const Info = { data: data.data };
          commit('OTCSEARCH', Info);
        }
      });
    },
    sideIsBlockTrade({ commit }, info) {
      commit('SIDEISBLOCKTRADE', info);
    },
    setFlag({ commit }, info) {
      commit('SETFLAG', info);
    },
    otcTicker({ commit }, info) {
      axios({
        url: this.state.url.common.otc_ticker,
        method: 'post',
        params: info,
        hostType: 'otc',
      }).then((data) => {
        if (Number(data.code) === 0) {
          const Info = { data: data.data };
          commit('OTCTICKER', Info);
        }
      });
    },
    otcMinuteLine({ commit }, info) {
      const params = { ...info };
      const headers = {};
      if (params.auto) {
        headers['exchange-auto'] = '1';
        delete params.auto;
      }
      axios({
        url: this.state.url.common.otc_minute_line,
        method: 'post',
        params,
        headers,
        hostType: 'otc',
      }).then((data) => {
        if (Number(data.code) === 0) {
          const Info = { data: data.data };
          commit('OTCMINUTELINE', Info);
        }
      });
    },
    otcPersonHomePage({ commit }, info) {
      axios({
        url: this.state.url.common.otc_person_home_page,
        method: 'post',
        params: info,
        hostType: 'otc',
      }).then((data) => {
        if (Number(data.code) === 0) {
          const Info = { data: data.data };
          commit('OTCPERSONHOMEPAGE', Info);
        }
      });
    },
    otcUserContacts({ commit }, info) {
      axios({
        url: this.state.url.common.otc_user_contacts,
        method: 'post',
        params: info,
        hostType: 'otc',
      }).then((data) => {
        if (Number(data.code) === 0) {
          const Info = { msg: data.msg, text: 'success' };
          commit('OTCUSERCONTACTS', Info);
        } else {
          const Info = { msg: data.msg, text: 'error' };
          commit('OTCUSERCONTACTS', Info);
        }
      });
    },
    otcUserContactsRemove({ commit }, info) {
      axios({
        url: this.state.url.common.otc_user_contacts_remove,
        method: 'post',
        params: info,
        hostType: 'otc',
      }).then((data) => {
        if (Number(data.code) === 0) {
          const Info = { msg: data.msg, text: 'success' };
          commit('OTCUSERCONTACTSREMOVE', Info);
        } else {
          const Info = { msg: data.msg, text: 'error' };
          commit('OTCUSERCONTACTSREMOVE', Info);
        }
      });
    },
  },
};
