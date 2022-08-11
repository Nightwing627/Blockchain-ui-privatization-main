// @ is an alias to /src
import { fixInput, callApp } from '@/utils';
import countryMinix from '../../../../PC/common-mixin/countryList/countryList';

export default {
  name: 'exccAuthorization',
  mixins: [countryMinix],
  data() {
    return {
      isLoading: true,
      aliasname: '',
      sex: '',
      uinfin: '',
      name: '',
      nationality: '',
      residentialstatus: '',
      dob: '',
      birthcountry: '',
      regadd: '',
      mobileno: '',
      mailadd: '',
      income: '0', // 收入来源
      code: '',
      active: '',
      qtTExt: '', // 收入来源选择其他的文案
    };
  },
  watch: {
    mobileno(val) {
      this.mobileno = fixInput(val, 0);
    },
    authRealname(authRealname) {
      if (authRealname !== null) {
        if (authRealname.text === 'success') {
          if (this.isApp) {
            callApp({
              name: 'exchangeRouter',
              params: { routerName: 'kyccomplete' },
            });
          } else {
            this.$bus.$emit('tip', { text: authRealname.msg, type: 'success' });
            this.active = '1';
          }
        } else {
          this.$bus.$emit('tip', { text: authRealname.msg, type: 'error' });
          this.$store.dispatch('resetType');
        }
      }
    },
    dob(val) {
      if (val && this.ageLimit && !this.validateAge()) {
        this.$bus.$emit('tip', { text: `您需要年满${this.ageLimit}岁才能在平台认证`, type: 'error' });
      }
    },
  },
  computed: {
    exccKycConfig() {
      return this.$store.state.personal.exccKycConfig;
    },
    ageLimit() {
      return this.exccKycConfig ? Number(this.exccKycConfig.data.ageLimit) : 0;
    },
    isApp() {
      return this.$store.state.baseData.isApp;
    },
    authRealname() {
      return this.$store.state.personal.authRealname;
    },
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    authLevel() {
      return this.userInfo ? this.userInfo.authLevel : '';
    },
    disabled() {
      if (this.dob && !this.validateAge()) {
        return true;
      }
      if (this.income === '6' && !this.qtTExt) {
        return true;
      }
      return !(this.mobileno && this.mailadd);
    },
    // 收入来源列表
    incomeList() {
      return [
        { code: '0', value: this.$t('personal.exccAuthorization.income1') },
        { code: '1', value: this.$t('personal.exccAuthorization.income2') },
        { code: '2', value: this.$t('personal.exccAuthorization.income3') },
        { code: '3', value: this.$t('personal.exccAuthorization.income4') },
        { code: '4', value: this.$t('personal.exccAuthorization.income5') },
        { code: '5', value: this.$t('personal.exccAuthorization.income6') },
        { code: '6', value: this.$t('personal.exccAuthorization.income7') },
      ];
    },
  },
  methods: {
    init() {
      this.code = this.$route.query.code;
      if (this.code) {
        this.getData();
      } else {
        this.isLoading = false;
      }
      if (!this.exccKycConfig) {
        this.$store.dispatch('exccKycConfig');
      }
    },
    getData() {
      this.axios({
        url: '/kyc/singPass/getInfo',
        method: 'post',
        header: {},
        params: {
          code: this.code,
        },
      }).then((info) => {
        this.isLoading = false;
        if (info.code === '0') {
          this.aliasname = info.data.aliasname;
          this.sex = info.data.sex;
          this.uinfin = info.data.uinfin;
          this.name = info.data.name;
          this.nationality = info.data.nationality;
          this.residentialstatus = info.data.residentialstatus;
          this.dob = info.data.dob;
          this.birthcountry = info.data.birthcountry;
          this.regadd = info.data.regadd;
          this.mobileno = info.data.mobileno;
          this.mailadd = info.data.mailadd;
          this.qtTExt = info.data.otherIncomeDesc;
          this.income = '0';
        } else {
          this.$bus.$emit('tip', { text: info.msg, type: 'error' });
        }
      }).catch(() => {});
    },
    inputChanges(value, name) {
      this[name] = value;
    },
    incomeChange(item) {
      this.income = item.code;
    },
    submitData() {
      const info = {
        mobileno: this.mobileno,
        mailadd: this.mailadd,
        income: this.income,
        otherIncomeDesc: this.qtTExt,
      };
      this.$store.dispatch('singPassVerifyAuth', info);
    },
    validateAge() {
      if (!this.ageLimit) {
        return true;
      }
      const birthday1 = this.dob.split('-');
      const convert2Date = new Date(birthday1[0], birthday1[1], birthday1[2]);
      let nowDate = new Date(); // 获取当前时间
      const year = nowDate.getFullYear();
      const month = nowDate.getMonth() + 1;
      const date = nowDate.getDate();
      nowDate = new Date(year, month, date);
      const age = nowDate.getTime() - convert2Date.getTime(); // 毫秒
      let leapYear = 0; // 有多少个闰年
      for (let i = 0; i <= this.ageLimit; i += 1) {
        if ((i % 4 === 0 && i % 100 !== 0) || i % 400 === 0) {
          leapYear += 1;
        }
      }
      const YearNumber = this.ageLimit - leapYear;
      const betweenNumer = 86400000 * 365 * YearNumber + 86400000 * 366 * leapYear;
      return age >= betweenNumer;
    },
  },
};
