import { fixD, fixInput } from '@/utils';

export default {
  name: 'forced-reminder',
  data() {
    return {
      // 是否可以提交
      dialogConfirmLoading: false,
      // 是否禁止提交
      // 当前币种
      axiosSymbol: '',
      // 划转方向  true 币币-合约  false 合约-币币
      // direction: true,
      transferSide: '1',
      // 划转数量
      // value: '',
      transferValue: '',
      // 当前币种数据
      detailsData: {},
      // 币币可转
      exchangeAmount: null,
      // 合约可转
      contractAmount: null,
      // 币种列表
      // symbolList: [],
    };
  },
  props: {
    isShow: {
      default: false,
      type: Boolean,
    },
    finish: {
      default: false,
      type: Boolean,
    },
    close: {
      default() {},
      type: Function,
    },
    symbol: {
      default: '',
      type: String,
    },
  },

  computed: {
    // 币种信息
    marginCoinInfor() {
      if (this.$store.state.future.marginCoinInfor) {
        return this.$store.state.future.marginCoinInfor;
      }
      return {};
    },
    // 保证金币种列表
    marginCoinList() {
      if (this.$store.state.future.marginCoinList) {
        return this.$store.state.future.marginCoinList;
      }
      return [];
    },
    symbolList() {
      if (this.marginCoinList.length !== 0) {
        const arr = [];
        this.marginCoinList.forEach((item) => {
          arr.push({ value: item, code: item });
        });
        // this.symbol = arr[0].code;
        return arr;
      }
      return [];
    },
    // 用户合约资产
    accountBalanceMap() {
      if (this.$store.state.future.futureAccountBalance) {
        return this.$store.state.future.futureAccountBalance;
      }
      return {};
    },
    // 币币资产
    exchangeData() {
      if (this.$store.state.assets.exchangeData) {
        return this.$store.state.assets.exchangeData;
      }
      return null;
    },
    // 币种精度
    showPrecision() {
      if (this.marginCoinInfor && this.axiosSymbol) {
        return this.marginCoinInfor[this.axiosSymbol].marginCoinPrecision;
      }
      return 4;
    },
    // 限制转入
    fundsInStatus() {
      if (this.marginCoinInfor && this.axiosSymbol) {
        return this.marginCoinInfor[this.axiosSymbol].fundsInStatus;
      }
      return false;
    },
    // 限制转出
    fundsOutStatus() {
      if (this.marginCoinInfor && this.axiosSymbol) {
        return this.marginCoinInfor[this.axiosSymbol].fundsOutStatus;
      }
      return false;
    },
    // 弹窗是否可点击
    dialogConfirmDisabled() {
      if (this.dialogConfirmLoading) { return false; }
      let flag = true;
      if (parseFloat(this.transferValue) > 0 && !this.transferError) {
        flag = false;
      }
      if (this.marginCoinInfor && this.axiosSymbol) {
        if (this.transferSide === '1') {
          if (this.axiosSymbol && !this.fundsInStatus) {
            flag = true;
          }
        } else if (this.transferSide === '2') {
          if (this.axiosSymbol && !this.fundsOutStatus) {
            flag = true;
          }
        }
      }

      return flag;
    },
    // 错误提示
    transferError() {
      let flag = false;
      // 限制最大数量\
      if (this.transferSide === '1') {
        if (parseFloat(this.transferValue) > parseFloat(this.exchangeAmount)) {
          flag = true;
        }
      } else if (this.transferSide === '2') {
        if (parseFloat(this.transferValue) > parseFloat(this.contractAmount)) {
          flag = true;
        }
      }
      return flag;
    },
    // 划转input框可用文案
    transferWarningText() {
      let text = this.$t('futures.transfer.canTransfer'); // 可转
      let num = null;
      if (this.marginCoinInfor && this.axiosSymbol) {
        text = this.$t('futures.transfer.canTransfer'); // 可转
        num = this.transferSide === '1'
          ? fixD(this.exchangeAmount, this.showPrecision)
          : fixD(this.contractAmount, this.showPrecision);
        return `${text} ${num} ${this.axiosSymbol}`;
      }
      return `${text} ${num} ${this.axiosSymbol}`;
    },
    // 限制划转
    confirmText() {
      let text = this.$t('futures.transfer.confirm'); // 确定
      if (this.marginCoinInfor && this.axiosSymbol) {
        if (this.transferSide === '1' && this.axiosSymbol && !this.fundsInStatus) {
          text = this.$t('futures.transfer.cantIn'); // 限制转入
        }
        if (this.transferSide === '2' && this.axiosSymbol && !this.fundsOutStatus) {
          text = this.$t('futures.transfer.cantOut'); // 限制转出
        }
      }
      return text;
    },
    // 方向
    side() {
      const ex = this.$t('futures.transfer.exchangeAccount');
      const co = this.$t('futures.transfer.coAccount');
      let from = '';
      let to = '';
      if (this.transferSide === '1') {
        from = ex;
        to = co;
      } else {
        from = co;
        to = ex;
      }
      return {
        from,
        to,
      };
    },
  },
  watch: {
    isShow(v) {
      if (v) {
        this.axiosSymbol = this.symbol;
        this.getData();
      }
    },
    // 币币余额
    exchangeData(v) {
      if (v && this.axiosSymbol) {
        if (v.allCoinMap[this.axiosSymbol] !== undefined) {
          const balance = v.allCoinMap[this.axiosSymbol].normal_balance;
          this.exchangeAmount = fixD(balance, this.showPrecision);
        } else {
          this.exchangeAmount = fixD(0, this.showPrecision);
        }
      }
    },
    // 合约余额
    accountBalanceMap(v) {
      if (v && this.axiosSymbol) {
        this.contractAmount = v[this.axiosSymbol].canUseAmount;
      }
    },
    // 切换币种
    symbol(v) {
      if (v && this.isShow) {
        this.getData();
      }
    },
    transferValue(v) {
      if (v && this.showPrecision) {
        this.transferValue = fixInput(v, this.showPrecision);
      }
    },
  },
  methods: {
    init() {},
    getData() {
      // 请求合约余额
      this.$store.dispatch('getPositionList');
      // 请求币币余额
      this.$store.dispatch('assetsExchangeData');
      // 重置
      this.transferValue = '';
    },
    symbolChange(item) {
      this.axiosSymbol = item.code;
      this.getData();
    },
    inputLineChange(value, name) {
      this[name] = value;
    },
    dialogConfirm() {
      this.dialogConfirmLoading = true;
      // const { contractAccountType, walletAccountType } = this.detailsData;
      // if (this.transferSide === '1') {
      //   this.toContract();
      // } else {
      //   this.toExchange();
      // }
      // /contract/co_transfer
      this.toCoTransfer();
    },
    // 通用
    toCoTransfer() {
      this.axios({
        url: 'contract/co_transfer',
        hostType: 'ex',
        params: {
          // wallet_to_contract:币币划转至合约  contract_to_wallet:合约划转至币币
          transferType: this.transferSide === '1' ? 'wallet_to_contract' : 'contract_to_wallet',
          amount: Number(this.transferValue),
          coinSymbol: this.axiosSymbol,
        },
        method: 'post',
      }).then((data) => {
        this.dialogConfirmLoading = false;
        if (data.code.toString() === '0') {
          this.close(true);
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 从合约划转到币币
    toExchange() {
      this.axios({
        url: 'assets/saas_trans/co_to_ex',
        hostType: 'co',
        params: {
          amount: Number(this.transferValue),
          coinSymbol: this.axiosSymbol,
        },
        method: 'post',
      }).then((data) => {
        this.dialogConfirmLoading = false;
        if (data.code.toString() === '0') {
          this.close(true);
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 从币币到合约
    toContract() {
      this.axios({
        url: 'web/futures_transfer',
        hostType: 'ex',
        params: {
          amount: Number(this.transferValue),
          coinSymbol: this.axiosSymbol,
        },
        method: 'post',
      }).then((data) => {
        this.dialogConfirmLoading = false;
        if (data.code.toString() === '0') {
          this.close(true);
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 修改划转方向
    setTransferSide() {
      if (this.transferSide === '1') { this.transferSide = '2'; } else if (this.transferSide === '2') { this.transferSide = '1'; }
      this.transferValue = ''; // 重置划转数量
    },
    //  全部划转
    allTransfer() {
      if (this.transferSide === '1') {
        if (this.exchangeAmount === null) { return; }
        this.transferValue = this.exchangeAmount.toString();
      } else if (this.transferSide === '2') {
        if (!this.contractAmount) { return; }
        this.transferValue = this.contractAmount.toString();
      }
    },
  },
};
