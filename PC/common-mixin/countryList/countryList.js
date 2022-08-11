import { getCountryList } from '@/utils';

export default {
  data() {
    return {
      countryKeyCode: '',
      country: '', // 所在地
    };
  },
  watch: {
    countryObj: {
      handler() {
        const v = this.defaultCountryCode;
        if (v && this.countryKeyCode === '') {
          this.countryKeyCode = v;
        }
        if (
          !this.defaultCountryCodeReal
          && !this.country
          && v
          && this.countryMap
          && this.countryMap[v]
        ) {
          this.country = this.countryMap[v].code;
        }
        if (this.defaultCountryCodeReal && this.country === '') {
          this.country = this.defaultCountryCodeReal;
        }
      },
    },
    defaultCountryCodeReal: {
      handler(v) {
        if (v && this.country === '') {
          this.country = v;
        }
      },
      immediate: true,
    },
    defaultCountryCode: {
      handler(v) {
        if (v && this.countryKeyCode === '') {
          if (this.defaultCountryCodeReal) {
            this.countryKeyCode = this.countryListKeyObj[
              this.defaultCountryCodeReal
            ].keyCode;
          } else {
            this.countryKeyCode = v;
          }
        }
        if (
          !this.defaultCountryCodeReal
          && !this.country
          && v
          && this.countryMap
          && this.countryMap[v]
        ) {
          this.country = this.countryMap[v].code;
        }
      },
      immediate: true,
    },
  },
  computed: {
    countryListKeyObj() {
      const list = {};
      this.countryObj.list.forEach((item) => {
        list[item.code] = {
          code: item.code,
          keyCode: item.keyCode,
          value: item.value.split(' ')[0],
        };
      });
      return list;
    },
    // 国家渲染列表
    countryList() {
      return this.countryObj.list;
    },
    registerCountryList() {
      const countryList = this.filterCountryList(this.$t('phoneCode'));
      return getCountryList(countryList).list;
    },
    countryListMoy() {
      const arr = [];
      this.countryObj.list.forEach((item) => {
        arr.push({
          code: item.code,
          keyCode: item.keyCode,
          value: item.value.split(' +')[0],
        });
      });
      return arr;
    },
    countryMap() {
      return this.countryObj.countryMap;
    },
    countryRealMap() {
      return this.countryObj.countryRealMap;
    },
    countryObj() {
      return this.$store.state.baseData.countryObj;
    },
    // 默认区号
    defaultCountryCode() {
      return this.$store.state.baseData.defaultCountryCode;
    },
    defaultCountryCodeReal() {
      return this.$store.state.baseData.defaultCountryCodeReal;
    },
    limitCountryList() {
      return this.$store.state.baseData.limitCountryList;
    },
  },
  methods: {
    // 国家列表change
    countryChange(item) {
      this.country = item.code;
      this.countryKeyCode = item.keyCode;
    },
    filterCountryList(list) {
      const countryList = list;
      let { limitCountryList } = this;
      if (limitCountryList.length > 0) {
        limitCountryList = limitCountryList.join('').split('+');
        Object.keys(countryList).forEach((item) => {
          countryList[item] = countryList[item].filter((vitem) => {
            const valueArr = vitem.split('+');
            return limitCountryList.indexOf(valueArr[2]) === -1;
          });
        });
      }
      return countryList;
    },
  },
};
