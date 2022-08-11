import { myStorage } from '@/utils';

export default {
  name: 'CompanyApplication',
  data() {
    return {
      textFlag: true,
      copyTime: 0,
      submitLoading: false, // 提交按钮loading
      superCompany: false,
      stepProgress: this.$t('application.stepProgress'),
      moduleShow: false,
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
    headerDesc() {
      const { applyStatus, applyRuleStatus } = this;
      let str = '';
      switch (applyStatus) {
        case 0: {
          str = this.$t('application.company.head.desc');
          break;
        }
        case 3: {
          str = this.$t('application.company.head.descApplied');
          if (applyRuleStatus === 0 || applyRuleStatus === 1) {
            str = this.$t('application.company.head.desc');
          }
          break;
        }
        case 2: {
          if (applyRuleStatus === 1 || applyRuleStatus === 0) {
            str = this.$t('application.company.head.desc');
          }
          break;
        }
        default: {
          str = '';
        }
      }
      return str;
    },
    headerTitle() {
      const { applyStatus, applyRuleStatus, companyStatus } = this;
      let companyTypeS = 1;
      let str = '';
      const applyMap = {
        0: '',
        1: 'Appling',
        3: 'Applied',
      };
      const companyMap = {
        1: '',
        2: 'Super',
      };
      let applyType = applyMap[this.applyStatus];
      if (this.applySuper) {
        applyType = '';
      } else if (applyStatus === 1 && applyRuleStatus === 0) {
        applyType = 'Appling';
      } else if ((applyStatus === 2 && applyRuleStatus === 1 && companyStatus === 1)
        || (applyStatus === 2 && applyRuleStatus === 3)) {
        applyType = 'Applied';
      } else if ((applyStatus === 2 && (applyRuleStatus === 1 || applyRuleStatus === 0))
        || (applyStatus === 3 && applyRuleStatus === 0)
        || (applyStatus === 3 && applyRuleStatus === 1 && companyStatus === 2)) {
        applyType = '';
      }
      if ((applyRuleStatus === 1 && companyStatus === 2)
        || (applyStatus === 3 && applyRuleStatus === 3)
        || (applyStatus === 2 && applyRuleStatus === 3)
      || (applyStatus === 3 && applyRuleStatus === 1 && companyStatus === 2)) {
        companyTypeS = 2;
      }
      const companyTypeDesc = companyMap[companyTypeS];
      str = this.$t(`application.company${companyTypeDesc}.head.title${applyType}`);
      if (str.indexOf('undefined') > -1) {
        str = '';
      }
      return str;
    },
    applySuper() {
      const { applyStatus, applyRuleStatus, companyType } = this;
      return ((applyStatus === 3 || applyStatus === 2)
        && applyRuleStatus === 1 && companyType === 2);
    },
    companyStatus() {
      return Number(this.otcCompanyInfo.status);
    },
    applyStatus() {
      return Number(this.userCompanyInfo.applyStatus);
    },
    marginCoinSymbol() {
      return this.otcCompanyInfo.marginCoinSymbol;
    },
    normalCompanyMarginNum() {
      let no = 0;
      if (this.applyRuleStatus === 0) {
        no = Number(this.otcCompanyInfo.normalCompanyMarginNum);
      } else if (this.applyRuleStatus === 1) {
        no = Number(this.otcCompanyInfo.superCompanyMarginNum);
      }
      return no;
    },
    otcCompanyApplyEmail() {
      return this.otcCompanyInfo.otcCompanyApplyEmail;
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
    allPass() {
      const { applyStatus, applyRuleStatus, companyStatus } = this;
      return (applyRuleStatus === 3 && (applyStatus === 3 || applyStatus === 2))
        || ((applyStatus === 3 || applyStatus === 2)
          && applyRuleStatus === 1 && companyStatus === 1);
    },
    applyPass() {
      const { applyStatus, applyRuleStatus } = this;
      return (applyRuleStatus === 3 && applyStatus === 3)
        || (applyStatus === 3 && applyRuleStatus === 1);
    },
    applying() {
      let bol = false;
      const { applyStatus, applyRuleStatus } = this;
      if ((applyStatus === 1)
        && (applyRuleStatus === 1 || applyRuleStatus === 3 || applyRuleStatus === 0)) {
        bol = true;
      }
      return bol;
    },
    relieving() {
      let bol = false;
      const { applyStatus, applyRuleStatus } = this;
      if (applyStatus === 1 && (applyRuleStatus === 2 || applyRuleStatus === 4)) {
        bol = true;
      }
      return bol;
    },
    docAddr() {
      return this.otcCompanyInfo.docAddr;
    },
    submitDisabled() {
      return !this.textFlag;
    },
    btnShow() {
      const { applyStatus, applyRuleStatus, companyStatus } = this;
      return applyStatus === 0
      || (applyStatus === 3 && applyRuleStatus === 1 && companyStatus === 2)
      || (applyStatus === 2 && applyRuleStatus === 1 && companyStatus === 2)
      || (applyRuleStatus === 0 && applyStatus !== 1);
    },
    userInfo() {
      return this.$store.state.baseData.userInfo || {};
    },
    fiatTradeOpen() {
      const base = this.$store.state.baseData.publicInfo;
      if (base && base.switch && base.switch.fiat_trade_open === '1') {
        return true;
      }
      return false;
    },
  },
  methods: {
    init() {
      const { applyRuleStatus, applyStatus } = this;
      if (this.companyStatus === 0) {
        this.$router.push('/');
      } else if ((applyRuleStatus === 2 || applyRuleStatus === 4) && applyStatus === 1) {
        this.$router.push('/companyApplication');
      } else {
        this.moduleShow = true;
      }
    },
    relieveClick() {
      const { history } = window;
      if (!history.state) {
        this.$router.push('/companyApplication');
      } else {
        history.back();
      }
    },
    lineShow(inx, len) {
      return (inx + 1) < len;
    },
    copyMail(val) {
      const time = new Date().getTime();
      if (time - this.copyTime > 1000) {
        this.$bus.$emit('tip', { text: '复制成功', type: 'success' });
        const save = function save(e) {
          e.clipboardData.setData('text/plain', val);
          e.preventDefault();
        };
        document.addEventListener('copy', save, false);
        document.execCommand('copy');
        document.removeEventListener('copy', save);
        this.copyTime = time;
      }
    },
    actived(type) {
      const { applyStatus, applyRuleStatus, companyStatus } = this;
      let count = applyStatus;
      if ((applyRuleStatus === 1 && applyStatus === 3 && companyStatus === 2)
        || (applyRuleStatus === 0 && applyStatus !== 1)
      || (applyStatus === 2 && applyRuleStatus === 1)) {
        count = 0;
      }
      if (applyStatus === 2 && (applyRuleStatus === 1 || applyRuleStatus === 3)) {
        count = 3;
      }
      return count >= type ? 'a-12-bg' : 'a-2-bg ';
    },
    checkoutClick(flag) {
      this.textFlag = flag;
    },
    back() {
      this.$router.push('/');
    },
    applyCompany() {
      let type = 1;
      if (this.applyRuleStatus === 0) {
        type = 0;
      }
      if (this.applyRuleStatus === 1) {
        type = 1;
      }
      this.axios({
        url: this.$store.state.url.common.company_apply,
        hostType: 'otc',
        method: 'post',
        params: {
          type,
        },
      }).then((data) => {
        if (!Number(data.code)) {
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.$store.dispatch('getUserInfo');
          myStorage.remove('companyAppling');
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
        this.submitLoading = false;
      });
    },
    submit() {
      this.submitLoading = true;
      this.axios({
        url: this.$store.state.url.common.otc_account_list,
        hostType: 'ex',
        method: 'post',
      }).then((data) => {
        if (!Number(data.code)) {
          const { allCoinMap } = data.data;
          allCoinMap.forEach((item) => {
            if (item.coinSymbol === this.marginCoinSymbol) {
              if (Number(item.normal) >= this.normalCompanyMarginNum) {
                this.applyCompany();
              } else {
                this.$bus.$emit('tip', {
                  text: this.fiatTradeOpen
                    ? this.$t('assets.b2c.otcShow.unEnough')
                    : this.$t('application.unEnough'),
                  type: 'error',
                });
                this.submitLoading = false;
              }
            }
          });
        }
      });
    },
  },
};
