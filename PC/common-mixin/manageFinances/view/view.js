import {
  fixD,
  formatTime,
  fixInput,
  imgMap,
} from '@/utils';

const replaceStrMap = {
  biki: 'Tokencan',
  'www.biki.com': 'www.tokencan.net',
};

export default {
  name: 'InnovationList',
  data() {
    return {
      imgMap,
      numberValue: '', // 购买数量
      alertFlag: false, // 验证弹窗
      alertFlagAuth: false, // 实名弹窗
      // bannerImg: null,
      // bannerTitle: '',
      nowType: 1,
      errorFlag: false,
      errorHave: false,
      pageId: null,
      pageData: {},
      amount: '',
      dialogFlag: false, // 弹窗flag
      dialogConfirmLoading: false, // 用于弹窗按钮loading效果
      checkValue: '', // 验证码value
      googleVlaue: '', // 谷歌验证码
      checkErrorText: '',
      googleErrorText: '',
      dbclick: true,
      rate_type: '', // 年化日化
      interest_begin_time: '', // 计息开始时间
      interest_end_time: '', // 到期退出时间
      end_time: '', // 项目截止时间
      return_type: '', // 还款方式
      income: 0,
      balance: null, // 可用余额
      secoundClick: true, // 防止二次点击
    };
  },
  watch: {
    userInfoIsReady() { this.alert(); },
    income(value) {
      this.income = fixD(value, this.showPrecision(this.pageData.interest_symbol));
    },
    amount(value) {
      this.amount = fixInput(value, this.showPrecision(this.pageData.symbol));
      this.income = ((this.amount * this.pageData.rate) / 100 / 365) * this.pageData.limit_day;
    },
    checkValue(value) {
      this.checkValue = fixInput(value, 0);
    },
    googleVlaue(value) {
      this.googleVlaue = fixInput(value, 0);
    },
  },
  computed: {
    coinList() {
      if (this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return null;
    },
    templateLayoutType() {
      return Number(this.$store.state.baseData.templateLayoutType);
    },
    userInfoIsReady() { return this.$store.state.baseData.userInfoIsReady; },
    // 用户是否实名
    authLevel() {
      let flag = false;
      const { userInfo } = this.$store.state.baseData;
      if (userInfo && userInfo.authLevel.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    // 用户是否开启手机
    OpenMobile() {
      let flag = false;
      const { userInfo } = this.$store.state.baseData;
      if (userInfo && userInfo.isOpenMobileCheck.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    // 用户是否开启谷歌
    OpenGoogle() {
      let flag = false;
      const { userInfo } = this.$store.state.baseData;
      if (userInfo && userInfo.googleStatus.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    alertData() {
      const arr = [
        // 绑定谷歌验证
        { text: this.$t('assets.withdraw.bindGoogle'), flag: this.OpenGoogle },
        // 绑定手机验证
        { text: this.$t('assets.withdraw.bindPhone'), flag: this.OpenMobile },
      ];
      return arr;
    },
    promptText() {
      return this.$t('innov.numbre'); // '数量';
    },
    userInfo() {
      if (this.$store.state.baseData.userInfo) {
        return this.$store.state.baseData.userInfo;
      }
      return {};
    },
    numberOptions() {
      const obj = {
        text: '', // 错误提示文案
        flag: null, // 是否通过校验
        error: null, // 是否展示文案
      };
      const haveNum = parseFloat(this.pageData.balance) || 0; // 可用
      // console.log(this.pageData.balance)
      if (this.amount.length === 0 || parseFloat(this.amount) === 0) {
        // 请输入购买数量
        obj.text = this.$t('manageFinances.inputNumber');
        obj.flag = false;
        obj.error = false;
        return obj;
      } if (parseFloat(this.amount) > haveNum) {
        // 购买数量不得大于可用余额
        obj.text = this.$t('manageFinances.buyNumMax');
        obj.flag = false;
        obj.error = true;
        return obj;
      }
      obj.flag = true;
      obj.error = false;
      return obj;
    },
    btnDisabled() {
      let flag = true;
      if (this.numberOptions.flag) {
        flag = false;
      }
      return flag;
    },
  },
  methods: {
    init() {
      this.pageId = this.$route.params.id;
      this.getData();
      if (this.userInfoIsReady) {
        this.alert();
      }
    },
    replaceStr(str) {
      return replaceStrMap[str.toLowerCase()];
    },
    alert() {
      if (!this.authLevel) {
        this.canAuthAlert();
      } else {
        this.canAlert();
      }
    },
    canAlert() {
      if (this.OpenGoogle || this.OpenMobile) {
        this.alertFlag = false;
      } else {
        setTimeout(() => {
          this.alertFlag = true;
        }, 100);
      }
    },
    canAuthAlert() {
      if (this.authLevel) {
        this.alertFlagAuth = false;
      } else {
        setTimeout(() => {
          this.alertFlagAuth = true;
        }, 100);
      }
    },
    alertClone() { this.alertFlag = false; },
    alertAuthClone() { this.alertFlagAuth = false; },
    alertGo() { this.$router.push('/personal/userManagement'); },
    alertAuthGo() { this.$router.push('/personal/idAuth'); },
    fixDFun(val, symbol) {
      if (this.showPrecision(symbol)) {
        return fixD(val, this.showPrecision(symbol));
      }
      return val;
    },
    showPrecision(symbol) {
      if (this.$store.state.baseData
        && this.$store.state.baseData.market
        && this.$store.state.baseData.market.coinList) {
        const { coinList } = this.$store.state.baseData.market;
        if (coinList[symbol]) {
          const precision = coinList[symbol].showPrecision;
          if (precision) {
            return precision;
          }
        }
      }
      return 4;
    },
    submit() {
      if (!this.authLevel) {
        this.alertFlagAuth = true;
        return;
      }
      if (!this.OpenGoogle && !this.OpenMobile) {
        this.alertFlag = true;
        return;
      }
      this.order();
    },
    inputChanges(value, name) {
      this[name] = value;
    },
    formatTimeFn(date) {
      return formatTime(date);
    },
    goRecharge(symbol) {
      // console.log(symbol)
      this.$router.push(`/assets/recharge?symbol=${symbol}`);
    },
    getMore() {
      this.$router.push('/manageFinances');
    },
    // 请求数据
    getData() {
      this.axios({
        url: this.$store.state.url.common.financingDet,
        params: {
          id: this.pageId,
        },
        hostType: 'financing',
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          this.pageData = data.data;
          if (data.data.rate_type === 0) {
            this.rate_type = this.$t('manageFinances.yearRate');
          } else {
            this.rate_type = this.$t('manageFinances.dayRate');
          }
          this.balance = fixD(data.data.balance, this.showPrecision(data.data.symbol));
          this.end_time = formatTime(data.data.end_time);
          if (data.data.interest_begin_type === 1) {
            this.interest_begin_time = formatTime(data.data.user_interest_begin_time);
            this.interest_end_time = formatTime(data.data.user_interest_end_time);
          } else {
            this.interest_begin_time = formatTime(data.data.interest_begin_time);
            this.interest_end_time = formatTime(data.data.interest_end_time);
          }
          if (data.data.return_type === 1) {
            this.return_type = this.$t('manageFinances.first');
          } else {
            this.return_type = this.$t('manageFinances.together');
          }
          // this.bannerImg = data.data.banner;
        }
      });
    },
    // 下单
    order() {
      if (!this.secoundClick) { return; }
      this.secoundClick = false;
      this.axios({
        url: this.$store.state.url.common.order,
        params: {
          id: this.pageData.id,
          number: this.amount,
        },
        hostType: 'financing',
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          window.location.href = data.data.payUrl;
          this.secoundClick = true;
        }
      });
    },
  },
};
