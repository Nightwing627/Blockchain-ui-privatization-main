import { myStorage, imgMap } from '@/utils';

export default {
  name: 'CompanyApplication',
  data() {
    return {
      jurisdictionObj: {
        data: [], // 数据
        str: '', // 文案
        statusKey: '', // 当前跳转状态
        flag: false, //
        btnText: '', // 确定按钮
        btnLink: '', // 确认文案
        pass: true,
      },
      textFlag: true,
      copyTime: 0,
      btnConfirm: this.$t('application.confirm'),
      submitLoading: false, // 提交按钮loading
      superCompany: false,
      confirmLoading: false,
      alertFlag: false,
      serviceList: this.$t('application.serviceList'),
      viewShow: false,
      imgList: [
        imgMap.application_security,
        imgMap.application_ads,
        imgMap.application_special,
        imgMap.application_vip,
      ],
    };
  },
  watch: {
  },
  computed: {
    otcCompanyInfo() {
      return this.userInfo.otcCompanyInfo || {};
    },
    userCompanyInfo() {
      return this.userInfo.userCompanyInfo || {};
    },
    btnShow() {
      const { applyStatus, applyRuleStatus, companyStatus } = this;
      let bol = false;
      if (applyStatus === 0
        || applyRuleStatus === 0
        || (applyStatus === 1 && (applyRuleStatus !== 4 && applyRuleStatus !== 2))
        || (applyStatus === 3 && applyRuleStatus === 1 && companyStatus === 2)
      || (applyStatus === 2 && applyRuleStatus === 1 && companyStatus === 2)) {
        bol = true;
      }
      return bol;
    },
    congratulate() {
      let str = '';
      if (this.applyRuleStatus === 1) {
        str = this.$t('application.congratulate');
      } else {
        str = this.$t('application.congratulateSuper');
      }
      return str;
    },
    allPass() {
      const { applyStatus, applyRuleStatus, companyStatus } = this;
      return (applyRuleStatus === 3 && applyStatus === 3)
        || (applyStatus === 3 && applyRuleStatus === 1 && companyStatus === 1);
    },
    applyBtn() {
      let str = '';
      if (this.applyRuleStatus === 0) {
        str = this.$t('application.applyBtn');
      } else {
        str = this.$t('application.applyBtnSuper');
      }
      return str;
    },
    companyStatus() {
      return Number(this.otcCompanyInfo.status);
    },
    applyStatus() {
      return Number(this.userCompanyInfo.applyStatus);
    },
    relieving() {
      let bol = false;
      const { applyStatus, applyRuleStatus } = this;
      if (applyStatus === 1 && (applyRuleStatus === 2 || applyRuleStatus === 4)) {
        bol = true;
      }
      return bol;
    },
    /*
    * applyRuleStatus
    * 0: 未认证
    * 1: 普通商户
    * 2: 普通商户解除
    * 3: 超级商户
    * 4: 超级商户解除
    * */
    applyRuleStatus() {
      return Number(this.userCompanyInfo.status);
    },
    applyPass() {
      const { applyStatus, applyRuleStatus, companyStatus } = this;
      return ((applyRuleStatus === 1 && applyStatus === 3)
        || ((applyStatus === 1 || applyStatus === 3) && applyRuleStatus === 3)
        || (applyStatus === 2 && (applyRuleStatus === 1 || applyRuleStatus === 3))
        || (applyStatus === 1 && applyRuleStatus === 1 && companyStatus === 2))
        && applyStatus !== 1;
    },
    marginCoinSymbol() {
      return this.otcCompanyInfo.marginCoinSymbol;
    },
    normalCompanyMarginNum() {
      return Number(this.otcCompanyInfo.normalCompanyMarginNum);
    },
    otcCompanyApplyEmail() {
      return Number(this.otcCompanyInfo.otcCompanyApplyEmail);
    },
    docAddr() {
      return Number(this.otcCompanyInfo.docAddr);
    },
    submitDisabled() {
      return !this.textFlag;
    },
    userInfo() {
      return this.$store.state.baseData.userInfo || {};
    },
  },
  methods: {
    init() {
      if (this.companyStatus === 0) {
        this.$router.push('/');
      } else {
        this.viewShow = true;
      }
      this.jurisdiction();
    },
    isSh() {
      if (this.userInfo.authLevel.toString() !== '1') {
        // alert('请您先实名认证');
        return;
      }
      if (this.userInfo.otcCompanyInfo && this.userInfo.userCompanyInfo) {
        if (this.userInfo.otcCompanyInfo.status !== '0') {
          if (this.userInfo.userCompanyInfo === '0') {
            // alert('请您申请成为商户');
          }
        }
      }
    },
    jurisdiction() {
      // const arr = [
      //   { text: '绑定谷歌验证', flag: this.OpenGoogle },
      //   { text: '绑定手机验证', flag: this.OpenMobile },
      // ];
      // let userInfo = {
      //   authLevel: 1,
      //   nickName: '1',
      //   otcCompanyInfo: { status: 1 },
      //   userCompanyInfo: { status: 0 }
      // }
      const data = [];
      // 请完成实名认证，设置昵称才能发布广告
      let str = this.$t('otcRelease.jurisdictionTitle');
      const {
        otcCompanyInfo, userCompanyInfo, nickName, authLevel,
      } = this.userInfo;
      let statusKey = '';
      let btnText = '';
      let btnLink = '';
      let pass = true;
      // 实名认证
      const authentication = this.$t('otcRelease.authentication');
      if (authLevel.toString() === '1') {
        data.push({ text: authentication, flag: true, key: 'authLevel' });
      } else {
        data.push({ text: authentication, flag: false, key: 'authLevel' });
        statusKey = 'authLevel';
        // 去认证
        btnText = this.$t('otcRelease.DeCertification');
        btnLink = '/personal/idAuth';
        pass = false;
      }
      // 设置昵称
      const SetNickname = this.$t('otcRelease.SetNickname');
      if (nickName && nickName.length) {
        data.push({ text: SetNickname, flag: true, key: 'nickName' });
      } else {
        data.push({ text: SetNickname, flag: false, key: 'nickName' });
        if (!statusKey.length) {
          statusKey = 'nickName';
          // 去设置
          btnText = this.$t('otcRelease.ToSetUp');
          btnLink = '/personal/userManagement';
          pass = false;
        }
      }
      // 申请商户
      if (otcCompanyInfo.status.toString() !== '0') {
        // 请完成实名认证，设置昵称并申请成为商家才能发布广告
        str = this.$t('otcRelease.jurisdictionTitle2');
        const ApplicationMerchant = this.$t('otcRelease.ApplicationMerchant');
        if (userCompanyInfo.status.toString() !== '0') {
          data.push({ text: ApplicationMerchant, flag: true, key: 'companyInfo' });
        } else {
          data.push({ text: ApplicationMerchant, flag: false, key: 'companyInfo' });
          if (!statusKey.length) {
            statusKey = 'companyInfo';
            // 去申请
            btnText = this.$t('otcRelease.ToApply');
            btnLink = 'self';
            pass = false;
          }
        }
      }
      const obj = {
        data,
        str,
        statusKey,
        btnText,
        btnLink,
        pass,
        flag: !!statusKey.length,
      };
      this.jurisdictionObj = obj;
    },
    alertConfirm() {
      if (this.jurisdictionObj.btnLink === 'self') {
        this.jurisdictionObj.flag = false;
      } else {
        this.$router.push(this.jurisdictionObj.btnLink);
      }
    },
    verifyAlertClose() {
      this.jurisdictionObj.flag = false;
    },
    alertClose() {
      this.alertFlag = false;
    },
    confirm() {
      this.relieve();
    },
    checkoutClick(flag) {
      this.textFlag = flag;
    },
    apply() {
      this.$router.push('/companyApplicationDetail');
    },
    relieveClick() {
      this.alertFlag = true;
    },
    relieve() {
      this.confirmLoading = true;
      this.axios({
        url: this.$store.state.url.common.company_release,
        hostType: 'otc',
        method: 'post',
      }).then((data) => {
        if (!(Number(data.code))) {
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.$store.dispatch('getUserInfo');
          this.alertFlag = false;
          this.confirmLoading = false;
          myStorage.remove('companyAppling');
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          this.alertFlag = false;
          this.confirmLoading = false;
        }
      });
    },
  },
};
