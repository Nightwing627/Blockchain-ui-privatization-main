export default {
  name: 'areaAndIplimit',
  computed: {
    areaList() {
      const areaLimitList = window.sessionStorage.getItem('LimitCountryNames');
      return areaLimitList;
    },
  },
};
