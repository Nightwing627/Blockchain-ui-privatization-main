/*
@ 喜好设置
@author HDD */
import { myStorage } from '@/utils';

export default {
  name: 'forced-reminder',
  data() {
    return {
      // 持仓类型 1: 单向持仓 2： 双向持仓
      positionModel: myStorage.get('positionModel') || 2,
      // 下单二次确认
      pcSecondConfirm: myStorage.get('pcSecondConfirm') || 1,
      // 展示单位
      coUnit: myStorage.get('coUnitType') || 2,
      // 是否可以切换持仓类型
      positionModelCanSwitch: true,
      // 二次确认开关
      switchFlag: true,
      // 有效期
      expireTime: 14,
    };
  },
  props: {
    isShow: {
      default: false,
      type: Boolean,
    },
    close: {
      default() {},
      type: Function,
    },
  },
  computed: {
    lanText() {
      return {
        titleText: this.$t('futures.setFutures.titleText'), // '交易喜好设置',
        text1: this.$t('futures.setFutures.text1'), // '持仓类型',
        text2: this.$t('futures.setFutures.text2'), // '持有任何合约仓位/有挂单时不可更改持仓类型',
        text3: this.$t('futures.setFutures.text3'), // '单向持仓',
        text4: this.$t('futures.setFutures.text4'), // '单向持仓模式下，一个合约只允许持有一个方向的仓位',
        text5: this.$t('futures.setFutures.text5'), // '双向持仓',
        text6: this.$t('futures.setFutures.text6'), // '双向持仓模式下，一个合约可允许同时持有多空两个方向的仓位，并且同一合约下不同方向仓位风险对冲',
        text7: this.$t('futures.setFutures.text7'), // '下单前弹框确认',
        text8: this.$t('futures.setFutures.text8'), // '开启',
        text9: this.$t('futures.setFutures.text9'), // '关闭',
        text10: this.$t('futures.setFutures.text10'), // '合约单位',
        text11: this.$t('futures.setFutures.text11'), // '张',
        text12: this.$t('futures.setFutures.text12'), // '确定',
      };
    },
    // 用户配置信息
    userConfig() {
      return this.$store.state.future.futureUserConfig;
    },
    // 当前合约信息
    contractInfo() {
      return this.$store.state.future.contractInfo;
    },
    // 币种单位
    multiplierCoin() {
      if (this.userConfig) {
        return this.userConfig.multiplierCoin;
      } if (this.contractInfo) {
        return this.contractInfo.base;
      }
      return 'BTC';
    },
    // 是否Login
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    // 当前合约ID
    contractId() {
      return this.$store.state.future.contractId;
    },
    // 提交保证金按钮文案
    confirmText() {
      return this.lanText.text12; // '确定';
    },
    // 是否开通了合约交易
    openContract() {
      return this.$store.state.future.openContract;
    },
  },
  watch: {

    userConfig(val) {
      if (val) {
        this.positionModel = this.userConfig.positionModel;
        this.pcSecondConfirm = this.userConfig.pcSecondConfirm;
        this.coUnit = this.userConfig.coUnit;
        this.expireTime = this.userConfig.expireTime;
        this.positionModelCanSwitch = !!this.userConfig.positionModelCanSwitch;
        myStorage.set('pcSecondConfirm', this.pcSecondConfirm);
      } else {
        this.pcSecondConfirm = myStorage.get('pcSecondConfirm') || 1;
      }
      if (this.pcSecondConfirm) {
        this.switchFlag = true;
      } else {
        this.switchFlag = false;
      }
    },
  },
  methods: {
    init() {
      if (this.userConfig) {
        this.positionModel = this.userConfig.positionModel;
        this.pcSecondConfirm = this.userConfig.pcSecondConfirm;
        this.coUnit = this.userConfig.coUnit;
        this.expireTime = this.userConfig.expireTime;
        this.positionModelCanSwitch = !!this.userConfig.positionModelCanSwitch;
        myStorage.set('pcSecondConfirm', this.pcSecondConfirm);
      } else {
        this.pcSecondConfirm = myStorage.get('pcSecondConfirm') || 1;
      }
      if (this.pcSecondConfirm) {
        this.switchFlag = true;
      } else {
        this.switchFlag = false;
      }
    },
    // 切换事件
    redioChange(type, vlaue) {
      if (type === 'positionModel' && !this.positionModelCanSwitch && this.isLogin && this.openContract) {
        this.$bus.$emit('tip', { text: '持有任何合约仓位/有挂单时不可更改持仓类型', type: 'error' });
      } else {
        this[type] = vlaue;
      }
    },
    switchChange() {
      this.switchFlag = !this.switchFlag;
    },
    // 提交
    submitConfirm() {
      // 判断未登录 或者 为开通合约的情况
      if (!this.isLogin || !this.openContract) {
        myStorage.set('coUnitType', this.coUnit);
        myStorage.set('pcSecondConfirm', this.pcSecondConfirm);
        myStorage.set('positionModel', this.positionModel);
        this.$store.commit('SET_COUNIT_TYPE', this.coUnit);
        this.$store.dispatch('setActivePublicInfo');
        this.$bus.$emit('set-future', {
          positionModel: this.positionModel,
          coUnit: this.coUnit,
          pcSecondConfirm: this.pcSecondConfirm,
        });
        this.close();
        return false;
      }
      if (this.userConfig) {
        this.dialogConfirmLoading = true;
        this.axios({
          url: this.$store.state.url.futures.editUserPageConfig,
          hostType: 'co',
          method: 'post',
          params: {
            positionModel: this.positionModel,
            pcSecondConfirm: this.switchFlag ? 1 : 0,
            coUnit: this.coUnit,
            contractId: this.contractId,
            expireTime: this.expireTime,
          },
        }).then(({ code, msg }) => {
          if (code.toString() === '0') {
            myStorage.set('pcSecondConfirm', this.pcSecondConfirm);
            myStorage.set('coUnitType', this.coUnit);
            myStorage.set('positionModel', this.positionModel);
            this.$store.dispatch('getUserConfig');
            this.close();
            this.$bus.$emit('tip', { text: msg, type: 'success' });
          } else {
            this.$bus.$emit('tip', { text: msg, type: 'error' });
          }
          this.dialogConfirmLoading = false;
        });
      } else {
        console.error('没有获取到userConfig');
      }
      return false;
    },
  },
};
