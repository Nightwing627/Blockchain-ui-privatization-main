export default {
  name: 'paypal',
  data() {
    return {
      promptText1: '',
      errorText1: '',
      checkErrorFlag1: false,
      checkValue1: '',
      promptText2: '',
      errorText2: '',
      checkErrorFlag2: false,
      checkValue2: '',
    };
  },
  props: {
    payments: {
      default: () => {},
      type: Object,
    },
  },
  methods: {
    init() {
      if (this.payments !== null) {
        this.promptText1 = this.payments.name;
        this.promptText2 = this.payments.title;
        if (this.payments.obj) {
          this.checkValue1 = this.payments.obj.userName;
          this.checkValue2 = this.payments.obj.account;
        }
      }

      if (this.isCanModifyName) {
        if (this.userInfo) {
          this.checkValue1 = this.userInfo.realName;
          const obj = {};
          obj.userName = this.userInfo.realName;
          this.$emit('callBack', 'payment3', 'userName', obj);
        }
      }
    },
    inputChanges(value, name) {
      if (name === 'userName') {
        this.checkValue1 = value;
      } else {
        this.checkValue2 = value;
      }
      const obj = {};
      obj[name] = value;
      this.$emit('callBack', 'payment3', name, obj);
    },
  },
  computed: {
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    isCanModifyName() {
      return this.userInfo && Number(this.userInfo.userCompanyInfo.status) === 0;
    },
    excheifFlag() {
      return this.$store.state.baseData.exchief_project_switch;
    },
  },
  watch: {
    userInfo(v) {
      if (this.isCanModifyName) {
        if (v) {
          this.checkValue1 = v.realName;
          const obj = {};
          obj.userName = v.realName;
          this.$emit('callBack', 'payment3', 'userName', obj);
        }
      }
    },
    payments(payments) {
      if (payments !== null) {
        this.checkValue2 = payments.obj.account;
        this.promptText1 = payments.name;
        this.promptText2 = payments.title;
      }
    },
  },
};
