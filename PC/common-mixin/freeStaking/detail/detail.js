import { fixD, colorMap, imgMap } from '@/utils';

export default {
  data() {
    return {
      imgMap,
      colorMap,
      projectDetail: null,
      lockNumber: '0',
      userAgress: false,
      tableList: [],
      projectId: null,
      currencyModalState: false,
      verifyObj: {},
      dialogFlag: false,
      googleVlaue: '',
      phoneCode: '',
      headerBackground: {
        'background-image': `url(${imgMap.free_staking_banner})`,
      },
      timer: null,
    };
  },
  filters: {
    userInputLockFix(val) {
      return (parseFloat(val) || 0).toString();
    },
  },
  computed: {
    totalAmount() {
      const { totalAmount } = this.projectDetail;
      return !this.isLogin || !this.projectDetail ? '- - -' : fixD(totalAmount, this.currentSymbol);
    },
    totalGainAmount() {
      const { totalGainAmount } = this.projectDetail;
      return !this.isLogin || !this.projectDetail ? '- - -' : fixD(totalGainAmount, this.currentSymbol);
    },
    totalUserGainAmount() {
      const { totalUserGainAmount } = this.projectDetail;
      return !this.isLogin || !this.projectDetail ? '- - -' : fixD(totalUserGainAmount, this.currentSymbol);
    },
    raiseAmount() {
      const { raiseAmount } = this.projectDetail;
      return !this.projectDetail ? '- - -' : fixD(raiseAmount, this.currentSymbol);
    },
    userBalance() {
      const { balance } = this.projectDetail;
      return !this.projectDetail ? '- - -' : fixD(balance, this.currentSymbol);
    },
    lockMinNumText() {
      if (!this.projectDetail) return '';

      const { buyAmountMin, shortName, buyAmountMax } = this.projectDetail;
      const text = this.$t('freeStaking.detail.lockNum');
      const text1 = this.$t('freeStaking.detail.lockMinNum');
      const text2 = this.$t('freeStaking.detail.lockMaxNum');
      return `${text} (${text1}${buyAmountMin} ${shortName}；${text2}${buyAmountMax} ${shortName} )`;
    },
    symbolAll() {
      const { market } = this.$store.state.baseData;

      return market && market.coinList ? market.coinList : null;
    },
    currentSymbol() {
      let fix = 0;
      if (this.projectDetail && this.projectDetail.gainCoin && this.symbolAll) {
        const { showPrecision } = this.symbolAll[this.projectDetail.gainCoin];
        fix = showPrecision;
      }

      return fix;
    },
    enforceGoogleAuth() {
      return this.$store.state.baseData.is_enforce_google_auth || 0;
    },
    userFeatureIncome() {
      if (!this.isLogin) return '- - -';
      const {
        totalAmount, gainRate, lockDay, currencyExchangeRate,
      } = this.projectDetail;
      const all = totalAmount + Number(this.lockNumber);

      return fixD(
        ((all * gainRate) / 100 / 365) * lockDay * currencyExchangeRate,
        this.currentSymbol,
      );
    },
    verificationType() {
      const { publicInfo } = this.$store.state.baseData;
      let type = '0';
      if (
        publicInfo
        && publicInfo.switch
        && publicInfo.switch.verificationType
      ) {
        type = publicInfo.switch.verificationType;
      }
      return type;
    },
    showActivityTable() {
      const { status, projectType } = this.projectDetail;
      const lockPosStatus = projectType === 3 && this.isShowBlock([3, 4, 5]); // 判断是否是协议Pos和状态
      const unLockPosStatus = projectType === 1 && status !== 1; // 判断是否是持仓Pos和状态
      return (unLockPosStatus || lockPosStatus) && this.isLogin;
    },
    isLogin() {
      if (this.$store.state.baseData.isLogin) {
        return this.$store.state.baseData.isLogin;
      }
      return false;
    },
    projectStatus() {
      const { activeStatus = null } = this.projectDetail;
      const projectStatus = [
        { title: this.$t('freeStaking.detail.activityStatus[0]'), datetime: '', active: false },
        { title: this.$t('freeStaking.detail.activityStatus[1]'), datetime: '', active: false },
        { title: this.$t('freeStaking.detail.activityStatus[2]'), datetime: '', active: false },
        { title: this.$t('freeStaking.detail.activityStatus[3]'), datetime: '', active: false },
        { title: this.$t('freeStaking.detail.activityStatus[4]'), datetime: '', active: false },
      ];

      return projectStatus.map((item, index) => ({
        ...item,
        datetime: this.countStateTime(index),
        active: activeStatus !== null && activeStatus > index,
      }));
    },
    columns() {
      return [
        { title: this.$t('freeStaking.detail.incomeTime'), width: '50%' }, // 币种
        { title: this.$t('freeStaking.detail.incomeNum'), width: '50%', align: 'left' }, // 地址
      ];
    },
    // 二次确认按钮是否开启
    confirmBtnFlag() {
      if (this.googleStatus === 1) {
        if (this.googleErrorFlag || this.googleVlaue.length === 0) {
          return true;
        }
      }
      if (this.isOpenMobileCheck === 1) {
        if (this.phoneCode.length === 0 || this.checkErrorFlag) {
          return true;
        }
      }
      return false;
    },
    checkPhione() {
      return { text: this.$t('login.phoneCode'), haveCode: true };
    },
    googleVlaueForm() {
      return { text: this.$t('login.googleCode'), haveCode: false };
    },
    // 验证框是否为错误
    googleErrorFlag() {
      return this.googleVlaue.length !== 0 && !this.authInputRight(this.googleVlaue);
    },
    // 验证框是否为错误
    phoneErrorFlag() {
      return this.phoneCode.length !== 0 && !this.authInputRight(this.phoneCode);
    },
    userInfo() {
      if (this.$store.state.baseData.userInfo) {
        return this.$store.state.baseData.userInfo;
      }
      return {};
    },
    googleStatus() {
      return this.userInfo ? this.userInfo.googleStatus : null;
    },
    isOpenMobileCheck() {
      return this.userInfo ? this.userInfo.isOpenMobileCheck : null;
    },
    userIncomeTitle() {
      const { lockDay = 0 } = this.projectDetail;
      const day = this.$t('freeStaking.detail.twoDayIncome[0]');
      const text = this.$t('freeStaking.detail.twoDayIncome[1]');

      return `${lockDay}${day}${text}`;
    },
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  },
  methods: {
    init() {
      this.projectId = this.$route.params.id;
      document.getElementsByTagName('html')[0].scrollTop = 0;
      this.getProjectDetail();
    },
    initData() {
      this.lockNumber = 0;
      this.googleVlaue = '';
      this.phoneCode = '';
    },
    tableClick() {

    },
    timerBegin(t) {
      let time = t;
      this.timer = setInterval(() => {
        if (time > 0) {
          time -= 1;
        } else {
          clearInterval(this.timer);
          window.location.reload();
        }
      }, 1000);
    },
    countStateTime(index) {
      if (!this.projectDetail) return '';
      let time = '';
      switch (index) {
        case 0:
          time = this.projectDetail.stime;
          break;
        case 1:
          time = this.projectDetail.etime;
          break;
        case 2:
          time = this.projectDetail.ltime;
          break;
        case 3:
          time = this.projectDetail.iasDate;
          break;
        default:
          break;
      }
      return time;
    },
    checkoutHandle(val) {
      this.userAgress = val;
    },
    changeUserAgreeState() {
      this.userAgress = !this.userAgress;
    },
    isShowBlock(state = []) {
      return state.includes(this.projectDetail.activeStatus);
    },
    getProjectDetail() {
      this.axios({
        url: this.$store.state.url.freeStaking.project_detail,
        headers: {},
        params: { id: this.projectId },
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          const projectDetail = data.data;
          // 判断项目关闭或者删除
          if (projectDetail.status === -1 || projectDetail.status === 5) {
            this.$router.push('/freeStaking');
            return;
          }

          if (projectDetail.status === 1 && projectDetail.projectType === 3) {
            this.timerBegin(projectDetail.remainingTimeSeconds);
          }

          // 如果是已满仓状态 按产品逻辑强行设置成募集开始
          if (projectDetail.activeStatus === 6) projectDetail.activeStatus = 1;

          projectDetail.details = projectDetail.details.replace(/\n/g, '<br/>');
          projectDetail.info = projectDetail.info.replace(/\n/g, '<br/>');
          this.projectDetail = projectDetail;
          this.tableList = this.countTableList(projectDetail.userGainList);
        }
      });
    },
    countTableList(userGainList) {
      if (!userGainList || !Array.isArray(userGainList)) return [];

      return userGainList.map((item) => ({
        id: item.id,
        data: [
          item.gainTime,
          item.gainAmount,
        ],
      }));
    },
    lineStatusStyle(index) {
      const { activeStatus } = this.projectDetail;
      return `width:${activeStatus - 1 > index ? '100%' : '50%'}`;
    },
    goBackHome() {
      window.location.href = this.projectDetail.url;
    },
    navMyPos() {
      this.$router.push('/myPos');
    },
    showCurrencyModal() {
      this.currencyModalState = true;
    },
    hideCurrencyModal() {
      this.currencyModalState = false;
    },
    submitUserPos() {
      const {
        buyAmountMin, buyAmountMax, balance, shortName, totalAmount,
      } = this.projectDetail;
      let errText = '';

      if (!this.isLogin) {
        this.$router.push('/login');
        return;
      }

      // 兑换金额不能大于账户数量
      if (parseFloat(this.lockNumber) > parseFloat(balance)) {
        errText = `${this.$t('freeStaking.detail.balanceError[0]')}
        ${this.userBalance}${shortName}${this.$t('freeStaking.detail.balanceError[1]')}`;

        this.showToast(errText);
        return;
      }

      if (parseFloat(this.lockNumber) < parseFloat(buyAmountMin)) {
        errText = `${this.$t('freeStaking.detail.buyAmountMinError')}${buyAmountMin}${shortName}`;
        this.showToast(errText);
        return;
      }

      if ((parseFloat(this.lockNumber) + parseFloat(totalAmount)) > parseFloat(buyAmountMax)) {
        errText = `${this.$t('freeStaking.detail.buyAmountMaxError')}${buyAmountMax}${shortName}`;
        this.showToast(errText);
        return;
      }

      // 判断如果没有谷歌验证 使用谷歌验证
      if (
        this.googleStatus !== 1
        && this.isOpenMobileCheck !== 1
      ) {
        errText = this.$t('innov.binding');

        this.showToast(errText);
        return;
      }

      // 谷歌强制认证开启的时候 判断有没有谷歌没有的话 提示去绑定
      if (this.googleStatus !== 1 && this.enforceGoogleAuth) {
        errText = this.$t('assets.withdraw.bindGoogle');

        this.showToast(errText);
        return;
      }

      if (this.verificationType === '2') {
        this.captchaObj.verify();
      } else {
        this.dialogFlag = true;
      }
    },
    getCaptchaObj(captchaObj) {
      this.captchaObj = captchaObj;
    },
    verifyCallBack(parameter) {
      this.verifyObj = {
        geetest_challenge: parameter.geetest_challenge,
        geetest_seccode: parameter.geetest_seccode,
        geetest_validate: parameter.geetest_validate,
      };
      this.dialogFlag = true;
    },
    // 关闭弹窗
    dialogClose() {
      this.dialogFlag = false;
      this.phoneCode = '';
      this.googleVlaue = '';
      this.emailCheckValue = '';
    },
    getCodeClick() {
      this.axios({
        url: 'v4/common/smsValidCode',
        method: 'post',
        header: {},
        params: {
          operationType: 28,
        },
      })
        .then((data) => {
          if (data.code.toString() !== '0') {
            // 倒计时重置
            this.$bus.$emit('getCode-clear', 'loginGetcode');
            // tip框提示错误
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          } else {
            // 邮件已发送，请注意查收
            this.$bus.$emit('tip', {
              text: '验证码已发送，请注意查收',
              type: 'success',
            });
          }
        })
        .catch(() => {

        });
    },
    inputChanges(value, name) {
      this[name] = value;
    },
    dialogConfirm() {
      let params = {
        amount: this.lockNumber,
        projectId: this.projectId,
        googleCode: this.googleVlaue,
        smsValidCode: this.phoneCode,
        verificationType: this.verificationType,
      };

      if (this.verificationType === '2') {
        params = Object.assign(params, this.verifyObj);
      }

      this.axios({
        url: this.$store.state.url.freeStaking.project_apply,
        headers: {},
        params,
        method: 'post',
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.$bus.$emit('tip', {
            text: this.$t('购买成功'),
            type: 'success',
          });
          this.dialogFlag = false;
          this.initData();
          this.init();
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    authInputRight(value) {
      return this.$store.state.regExp.verification.test(value);
    },
    autoFillCoin() {
      this.lockNumber = String(this.projectDetail.balance);
    },
    showToast(errText) {
      if (!errText) return;
      this.$bus.$emit('tip', {
        text: errText,
        type: 'error',
      });
    },
  },

};
