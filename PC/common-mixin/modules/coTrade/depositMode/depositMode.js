// 保证金模式弹框 全仓/逐仓切换
export default {
  name: 'depositMode',
  data() {
    return {
      marginModel: 1,
      // 是否加载成功
      dialogConfirmLoading: false,
      // 是否禁止提交
      dialogConfirmDisabled: false,
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
        // 全仓保证金模式: 所有仓位共用合约账户中的保证金来避免仓位被强平。在强平事件中，交易者可能会损失所有的保证金和仓位。
        text1: this.$t('futures.depositMode.text1'),
        // 逐仓保证金模式: 一定数量保证金被分配到仓位上。如果仓位保证金亏损到低于维持保证金的水平，仓位将被强平。在逐仓模式下，您可以为这个仓位添加和减少保证金。
        text2: this.$t('futures.depositMode.text2'),
        text3: this.$t('futures.depositMode.text3'), // 设置为全仓模式
        text4: this.$t('futures.depositMode.text4'), // 设置为逐仓模式
        text5: this.$t('futures.depositMode.text5'), // 请登录后再进行操作
        text6: this.$t('futures.depositMode.text6'), // 已是全仓模式
        text7: this.$t('futures.depositMode.text7'), // 已是逐仓模式
        text8: this.$t('futures.depositMode.text8'), // 持有仓位/有挂单时不可改变保证金模式
        text9: this.$t('futures.depositMode.text9'), // 全仓
        text10: this.$t('futures.depositMode.text10'), // 逐仓
        text12: this.$t('futures.depositMode.text12'), // 保证金模式
      };
    },
    // 提交保证金按钮文案
    confirmText() {
      // '设置为全仓模式' : '设置为逐仓模式'
      let text = this.marginModel === 1 ? this.lanText.text3 : this.lanText.text4;
      if (!this.isLogin) {
        return this.lanText.text5; // '请登录后再进行操作';
      }
      if (this.userConfig && this.marginModel === this.userConfig.marginModel) {
        // '已是全仓模式' : '已是逐仓模式';
        text = this.marginModel === 1 ? this.lanText.text6 : this.lanText.text7;
        this.dialogConfirmDisabled = true;
      }
      if (this.userConfig && this.marginModel !== this.userConfig.marginModel) {
        this.dialogConfirmDisabled = false;
      }
      if (this.userConfig && !this.userConfig.marginModelCanSwitch) {
        text = this.lanText.text8; // '持有仓位/有挂单时不可改变保证金模式';
        this.dialogConfirmDisabled = true;
      }
      if (!this.userConfig) {
        this.dialogConfirmDisabled = true;
      }
      return text;
    },
    // 保证金模式列表
    categoryList() {
      return [
        {
          id: 1,
          text: this.lanText.text9, // '全仓',
          classes: this.marginModel === 1 ? 'u-8-bg' : 'a-3-bg',
        },
        {
          id: 2,
          text: this.lanText.text10, // '逐仓',
          classes: this.marginModel === 2 ? 'u-8-bg' : 'a-3-bg',
        },
      ];
    },
    // 是否Login
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    // 用户配置信息
    userConfig() {
      return this.$store.state.future.futureUserConfig;
    },
    // 当前合约ID
    contractId() {
      return this.$store.state.future.contractId;
    },
    // 当前合约信息
    contractInfo() {
      return this.$store.state.future.contractInfo;
    },
    // 当前合约名称
    activeContractName() {
      let name = '';
      let text = '';
      if (this.contractInfo) {
        const nameText = this.contractInfo.symbol ? this.contractInfo.symbol.replace('-', '') : '';
        if (this.contractInfo.contractType !== 'E') {
          text = `-${this.contractInfo.marginCoin}`;
        }
        name = `${nameText}${text}`;
      }
      return name;
    },
    // 弹窗标题
    titleText() {
      return `${this.activeContractName}${this.lanText.text12}`; // 保证金模式
    },
  },
  methods: {
    init() {
      if (this.userConfig) {
        if (this.userConfig.marginModelCanSwitch) {
          this.marginModel = this.userConfig.marginModel === 1 ? 2 : 1;
        } else {
          this.marginModel = this.userConfig.marginModel;
        }
      }
    },
    // 切换保证金模式
    selectCategory(id) {
      this.marginModel = id;
    },
    // 提交保证金模式
    submit() {
      if (!this.isLogin) {
        this.$router.push('/login');
        return false;
      }
      if (this.userConfig) {
        this.dialogConfirmLoading = true;
        this.axios({
          url: this.$store.state.url.futures.marginModelEdit,
          hostType: 'co',
          method: 'post',
          params: {
            marginModel: this.marginModel,
            contractId: this.contractId,
          },
        }).then(({ code, msg }) => {
          if (code.toString() === '0') {
            this.$store.dispatch('getUserConfig');
            this.close();
            this.$bus.$emit('tip', { text: msg, type: 'success' });
          } else {
            this.$bus.$emit('tip', { text: msg, type: 'error' });
          }
          this.dialogConfirmLoading = false;
        });
      }
      return false;
    },
  },
};
