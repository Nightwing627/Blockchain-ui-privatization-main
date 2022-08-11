import {
  fixD, fixInput, timeFn, colorMap, imgMap,
} from '@/utils';


export default {
  name: 'page-withdraw',
  data() {
    return {
      tabelLoading: true,
      imgMap,
      colorMap,
      alertFlag: false, // alert变量
      detailsList: [
        { key: 'normal', value: '--' },
        { key: 'lock', value: '--' },
      ],
      withdrawMin: '--', // 最小提币额度
      withdrawMax: '--', // 最大提币额度
      tabelList: [], // 提现记录
      symbol: '',
      numberValue: '', // 提币数量
      proceduresValue: '', // 手续费
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      dialogFlag: false, // 弹窗开关
      dialogConfirmLoading: false, // 弹窗按钮loading
      googleValue: '', // 谷歌
      phoneValue: '', // 手机
      symbolObj: {}, // 当前币种信息对象
    };
  },
  filters: {
    fixDFn(v, that) {
      return fixD(v, that.showPrecision);
    },
  },
  watch: {
    krwData(v) { if (v) { this.initDetails(); } },
    paginationObjCurrentPage() { this.getTableList(); },
    numberValue(v) {
      this.numberValue = fixInput(v, this.showPrecision);
    },
    userInfo(v) { if (v && this.krwUserBankIsReady) { this.initStatus(); } },
    krwUserBankIsReady(v) { if (v && this.userInfo) { this.initStatus(); } },
  },
  computed: {
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    // 实名认证
    authLevel() {
      let str = '';
      if (this.userInfo) {
        str = this.userInfo.authLevel.toString();
      }
      return str;
    },
    // 该用户是否完成nice认证
    krwPhoneAuth() {
      let str = '0';
      if (this.userInfo
        && this.userInfo.is_krw_phone_auth) {
        str = this.userInfo.is_krw_phone_auth.toString();
      }
      return str;
    },
    krwUserBankIsReady() {
      return this.$store.state.personal.krwUserBankIsReady;
    },
    // 银行卡
    krwUserBank() {
      return this.$store.state.personal.krwUserBank;
    },
    alertData() {
      let authFlag = false;
      if (this.krwPhoneAuth === '1' || this.authLevel === '1') {
        authFlag = true;
      }
      const arr = [
        // 手机实名认证或身份认证
        { text: this.$t('assets.krw.withdrawAuth1'), flag: authFlag },
        // OTP认证
        { text: this.$t('assets.krw.withdrawAuth2'), flag: this.OpenGoogle },
        // 绑定银行卡
        { text: this.$t('assets.krw.withdrawAuth3'), flag: !!this.krwUserBank },
      ];
      return arr;
    },
    // 当前币种精度
    showPrecision() {
      let v = 0;
      const { market } = this.$store.state.baseData;
      if (market && market.coinList && market.coinList[this.symbol]) {
        v = market.coinList[this.symbol].showPrecision;
      }
      return v;
    },
    amount() {
      let str = this.numberValue - this.proceduresValue;
      if (str <= 0) {
        str = 0;
      }
      return str;
    },
    krwData() { return this.$store.state.assets.krwData; },
    paginationObjCurrentPage() { return this.paginationObj.currentPage; },
    // finance/account_balance 接口返回成功的数据
    exchangeData() { return this.$store.state.assets.exchangeData; },
    // market 接口
    market() { return this.$store.state.baseData.market; },
    // 提现按钮禁用状态
    btnDisabled() {
      let flag = false;
      if (Number(this.amount) < Number(this.withdrawMin)
        || Number(this.amount) > Number(this.withdrawMax)) {
        flag = true;
      }
      return flag;
    },
    // 表格title
    columns() {
      return [
        { title: this.$t('assets.krw.withdrawList1'), width: '15%' }, // 申请时间
        { title: this.$t('assets.krw.withdrawList2'), width: '25%', align: 'left' }, // 到账时间
        { title: this.$t('assets.krw.withdrawList3'), width: '10%' }, // 币种
        { title: this.$t('assets.krw.withdrawList4'), width: '10%' }, // 提现金额
        { title: this.$t('assets.krw.withdrawList5'), width: '10%' }, // 手续费
        { title: this.$t('assets.krw.withdrawList6'), width: '10%' }, // 用户银行账号
        { title: this.$t('assets.krw.withdrawList7'), width: '10%' }, // 状态
      ];
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
    // phoneValue 是否复合正则验证
    phoneValueFlag() { return this.$store.state.regExp.verification.test(this.phoneValue); },
    // googleValue 是否复合正则验证
    googleValueFlag() { return this.$store.state.regExp.verification.test(this.googleValue); },
    phoneError() {
      if (this.phoneValue.length !== 0 && !this.phoneValueFlag) return true;
      return false;
    },
    googleError() {
      if (this.googleValue.length !== 0 && !this.googleValueFlag) return true;
      return false;
    },
    that() { return this; },
    // 弹窗确认按钮
    dialogConfirmDisabled() {
      let phone = true;
      let google = true;
      if (this.OpenMobile) { phone = this.phoneValueFlag; }
      if (this.OpenGoogle) { google = this.googleValueFlag; }
      if ((phone && google) || this.dialogConfirmLoading) {
        return false;
      }
      return true;
    },
  },
  methods: {
    init() {
      this.$store.dispatch('krwGetUserBank');
      // 如果不存在币种跳走
      if (this.$route.query.symbol) {
        this.symbol = this.$route.query.symbol.toUpperCase();
      } else {
        this.$router.push('/assets/exchangeAccount');
      }
      if (!this.krwData) {
        this.$store.dispatch('krwData');
      } else {
        this.initDetails();
      }
      this.getTableList();
      if (this.userInfo && this.krwUserBankIsReady) {
        this.initStatus();
      }
    },
    initStatus() {
      let authFlag = false;
      if (this.krwPhoneAuth === '1' || this.authLevel === '1') {
        authFlag = true;
      }
      if (!authFlag || !this.OpenGoogle || !this.krwUserBank) {
        setTimeout(() => {
          this.alertFlag = true;
        }, 100);
      }
    },
    initDetails() {
      let obj = {};
      this.krwData.allCoinMap.forEach((item) => {
        if (item.symbol === this.symbol) {
          obj = item;
        }
      });
      this.detailsList = [
        { key: 'normal', value: fixD(obj.normalBalance, this.showPrecision) },
        { key: 'lock', value: fixD(obj.lockBalance, this.showPrecision) },
      ];
      this.withdrawMin = obj.withdrawMin;
      this.withdrawMax = obj.withdrawMax;
      this.proceduresValue = obj.defaultFee;
      this.symbolObj = obj;
    },
    inputChange(v, name) {
      this[name] = v;
    },
    // 全部提现
    allWithDraw() {
      if (!this.symbolObj.normalBalance) {
        this.numberValue = '0';
        return;
      }
      this.numberValue = this.symbolObj.normalBalance;
    },
    // 分页器
    pagechange(v) { this.paginationObj.currentPage = v; },
    // 获取验证码
    getCodeClick() {
      this.sendSmsCode();
    },
    // 发送验证码
    sendSmsCode() {
      this.axios({
        url: 'v4/common/smsValidCode',
        params: { operationType: '32' },
      }).then((data) => {
        if (data.code.toString() !== '0') {
          setTimeout(() => {
            // 倒计时重置
            this.$bus.$emit('getCode-clear', 'withdrawGetcode');
            // tip框提示错误
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }, 2000);
        } else {
          this.$bus.$emit('tip', { text: this.$t('assets.withdraw.phoneSendSuccess'), type: 'success' });
        }
      });
    },
    withdrawClick() {
      let authFlag = false;
      if (this.krwPhoneAuth === '1' || this.authLevel === '1') {
        authFlag = true;
      }
      if (!authFlag || !this.OpenGoogle || !this.krwUserBank) {
        this.alertFlag = true;
        return;
      }
      this.dialogFlag = true;
    },
    // 弹窗关闭
    dialogClose() {
      this.phoneValue = '';
      this.googleValue = '';
      this.dialogFlag = false;
    },
    dialogConfrim() {
      this.dialogConfirmLoading = true;
      this.axios({
        url: 'fiat/withdraw',
        params: {
          amount: this.amount, // 提现金额（不包含手续费
          googleCode: this.googleValue,
          smsAuthCode: this.phoneValue,
          symbol: this.symbol,
        },
      }).then((data) => {
        this.dialogConfirmLoading = false;
        if (data.code.toString() === '0') {
          this.getTableList(); // 获取列表
          this.$store.dispatch('krwData'); // 更新额度
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.numberValue = '';
          this.phoneValue = '';
          this.googleValue = '';
          this.dialogFlag = false;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    alertClone() {
      this.alertFlag = false;
    },
    alertGo() {
      this.$router.push('/personal/userManagement');
    },
    // 获取提现记录数据
    getTableList() {
      this.axios({
        url: 'fiat/withdraw/list',
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          symbol: this.symbol,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.tabelLoading = false;
          const list = [];
          data.data.financeList.forEach((item) => {
            let time = item.updatedAt
              ? timeFn(new Date(item.updatedAt), 'yyyy-MM-dd hh:mm:ss')
              : '--';
            if (Number(item.status) === 2) {
              time = '--';
            }
            list.push({
              id: item.id,
              data: [
                timeFn(new Date(item.createdAt), 'yyyy-MM-dd hh:mm:ss'), // 申请时间
                time, // 到账时间
                item.symbol, // 币种
                fixD(item.amount, this.showPrecision), // 提现金额
                fixD(item.fee, this.showPrecision), // 手续费
                item.userCard, // 用户银行账号
                item.statusText, // 状态
              ],
            });
          });
          this.tabelList = list;
          this.paginationObj.total = data.data.count > 30 ? 30 : data.data.count;
        }
      });
    },
  },
};
