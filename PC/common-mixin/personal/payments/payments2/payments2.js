export default {
  name: 'bankcard',
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
      promptText3: '',
      errorText3: '',
      checkErrorFlag3: false,
      checkValue3: '',
      promptText4: '',
      errorText4: '',
      checkErrorFlag4: false,
      checkValue4: '',
    };
  },
  props: {
    payments: {
      default: () => {},
      type: Object,
    },
    isModify: {
      type: Number,
    },
  },
  methods: {
    init() {
      if (this.payments !== null) {
        this.promptText1 = this.payments.name;
        this.promptText2 = this.payments.bank;
        this.promptText3 = this.payments.branch;
        this.promptText4 = this.payments.account;
        if (this.payments.obj) {
          this.checkValue1 = this.payments.obj.userName;
          this.checkValue2 = this.payments.obj.bankName;
          this.checkValue3 = this.payments.obj.bankOfDeposit;
          this.checkValue4 = this.payments.obj.account;
        }
      }
      if (this.isModify === 0 || this.isCanModifyName) {
        if (this.userInfo) {
          if (!this.excheifFlag && !this.checkValue1) {
            this.checkValue1 = this.userInfo.realName;
          }
          const obj = {};
          obj.userName = this.userInfo.realName;
          this.$emit('callBack', 'payment2', 'userName', obj);
        }
      }
    },
    inputChanges(value, name) {
      switch (name) {
        case 'userName':
          this.checkValue1 = value;
          break;
        case 'bank':
          this.checkValue2 = value;
          break;
        case 'branch':
          this.checkValue3 = value;
          break;
        default:
          this.checkValue4 = value;
      }
      const obj = {};
      obj[name] = value;
      this.$emit('callBack', 'payment2', name, obj);
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
      if (this.isModify === 0 || this.isCanModifyName) {
        if (v) {
          if (!this.excheifFlag && !this.checkValue1) {
            this.checkValue1 = v.realName;
          }
          const obj = {};
          obj.userName = v.realName;
          this.$emit('callBack', 'payment2', 'userName', obj);
        }
      }
    },
    payments(payments) {
      if (payments !== null) {
        this.promptText1 = payments.name;
        this.promptText2 = payments.bank;
        this.promptText3 = payments.branch;
        this.promptText4 = payments.account;
      }
    },
  },
};
