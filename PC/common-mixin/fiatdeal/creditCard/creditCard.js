import {
  fixInput, fixD,
} from '@/utils';

export default {
  data() {
    return {
      confirmFlag: false,
      redioFlag: false,
      activeToken: '', // 当前 数字货币
      activeFiat: '', // 当前 法币货币
      tokenList: [], // 数字货币 下拉列表
      fiatList: [], // 法币货币 下拉列表
      tokenInput: '', // 输入的数字货币
      fiatInput: '', // 输入的法币货币
      nowRate: 0, // 当前币种汇率
      sourceID: '',
      spks: {}, // 区间
      dialogConfirmLoading: false,
      callBackFlag: false, // 回调弹窗
    };
  },
  computed: {
    loginFlag() {
      const { isLogin, userInfoIsReady } = this.$store.state.baseData;
      if (isLogin && userInfoIsReady) {
        return true;
      }
      return false;
    },
    warn2Text() {
      const value = this.$t('creditCard.warn2');
      const arr = [
        'https://buy.moonpay.io/trade_history',
        '/assets/flowingWater',
      ];
      return this.setLocals(value, arr);
    },
    callBackText1() {
      const value = this.$t('creditCard.callBackText1');
      const arr = [
        'https://buy.moonpay.io/trade_history',
      ];
      return this.setLocals(value, arr);
    },
    lan() {
      if (this.$store.state.baseData) {
        return this.$store.state.baseData.lan;
      }
      return null;
    },
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    dialogConfirmDisabled() {
      if (this.dialogConfirmLoading) {
        return false;
      }
      if (this.redioFlag) {
        return false;
      }
      return true;
    },
    market() { return this.$store.state.baseData.market; },
    nowSpk() {
      let obj = '';
      if (this.spks[this.activeFiat]) {
        obj = this.spks[this.activeFiat];
      }
      return obj;
    },
    inputError() {
      const obj = {
        flag: false,
        show: false,
        text: '',
      };
      const { minAmount, maxAmount } = this.nowSpk;
      const numb = parseFloat(this.fiatInput);
      if (this.fiatInput && this.nowSpk) {
        if (minAmount - 1 < numb && numb < maxAmount + 1) {
          obj.flag = true;
        } else {
          obj.show = true;
          // 下单区间
          obj.text = `${this.$t('creditCard.spk')}：${minAmount} ${this.activeFiat}
           ~ ${maxAmount} ${this.activeFiat}`;
        }
      }
      return obj;
    },
    buttonDisable() {
      let flag = true;
      if (this.activeFiat && this.inputError.flag) {
        flag = false;
      }
      return flag;
    },
  },
  watch: {
    confirmFlag(v) {
      if (!v) { this.redioFlag = false; }
    },
    // tokenInput(v) {
    //   const { coinList } = this.market;
    //   const fix = (coinList[this.activeToken] && coinList[this.activeToken].showPrecision) || 0;
    //   // 限制精度和不非数字字符
    //   this.tokenInput = fixInput(v, fix).toString();
    // },
    // fiatInput(v) {
    //   this.fiatInput = fixInput(v, 2).toString();
    // },
  },
  methods: {
    goLogin() {
      this.$router.push('/login');
    },
    setLocals(value, linkList) {
      const str = value;
      let newStr = '';
      if (str) {
        const arr = str.split('$<');
        let i = 0;
        arr.forEach((item) => {
          if (item.indexOf('>$') !== -1) {
            const url = linkList[i];
            i += 1;
            const n = item.split('>$');
            newStr += `<a class="u-8-cl" href="${url}" target="_block">
              ${n[0]}</a>${n[1]}`;
          } else {
            newStr += item;
          }
        });
      }
      return newStr;
    },
    callBackSubmit() {
      this.$router.push('/assets/exchangeAccount');
    },
    callBackClose() {
      this.callBackFlag = false;
    },
    setRedio() {
      this.redioFlag = !this.redioFlag;
    },
    submit() {
      this.confirmFlag = true;
    },
    confirmClose() {
      this.confirmFlag = false;
    },
    confirmSubmit() {
      this.dialogConfirmLoading = true;
      // this.axios({
      //   url: 'finance/get_charge_address',
      //   params: {
      //     symbol: this.activeToken,
      //   },
      // }).then((data) => {
      //   if (data.code.toString() === '0') {
      //     this.getD();
      //   } else {
      //     this.$bus.$emit('tip', { text: data.msg, type: 'error' });
      //   }
      // });

			this.getD();
    },
    getD() {
      this.axios({
        url: 'credit/createOrder',
        hostType: 'fe-credit-api',
        params: {
          token: this.activeToken, // 加密货币
          fiatCoin: this.activeFiat, // 法定货币
          amount: this.fiatInput, // 法定货币数额 （正整数）
          // source: this.sourceID, // 服务商ID
        },
        method: 'post',
      }).then((data) => {
        this.dialogConfirmLoading = false;
        if (data.code === '0') {
          // window.location.href = data.data.url;
          window.open(data.data.orderUrl);
          this.confirmFlag = false;
          this.callBackFlag = true;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    inputChanges(value, name) {
      this[name] = value;
      const { coinList } = this.market;
      const fix = (coinList[this.activeToken] && coinList[this.activeToken].showPrecision) || 0;
      if (name === 'tokenInput') {
        // 限制精度和不非数字字符
        this.tokenInput = fixInput(value, fix);
        this.fiatInput = fixD((this.tokenInput * this.nowRate), 0);
      } else {
        this.fiatInput = fixInput(value, 0);
        this.tokenInput = fixD((this.fiatInput / this.nowRate), fix);
      }
    },
    init() {
      this.getLogos();
      this.getCoins();
    },
    // 获取头部logo
    getLogos() {
      // this.axios({
      //   url: 'middleman/bankList',
      //   hostType: 'fe-credit-api',
      //   params: {},
      //   method: 'post',
      // }).then((data) => {
      //   if (data.code === '0') {
      //     console.log(data);
      //   } else {
      //     this.$bus.$emit('tip', { text: data.msg, type: 'error' });
      //   }
      // });
    },
    // 获取币种列表
    getCoins() {
      this.axios({
        url: 'credit/availableCoins',
        hostType: 'fe-credit-api',
        params: {},
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          const { fiatList, tokenList } = data.data;
          const fiatArr = [];
          fiatList.forEach((item) => {
            fiatArr.push({
              value: item.fiatCoin,
              code: item.fiatCoin,
            });
            if (item.isDefault) {
              this.activeFiat = item.fiatCoin;
            }
            this.spks[item.fiatCoin] = item;
          });
          const tokenArr = [];
          tokenList.forEach((item) => {
            let value = item.coin;
            if (value === 'EUSDT') {
              value = 'USDT(ERC20)';
            }
            tokenArr.push({
              value,
              code: item.coin,
            });
            if (item.isDefault) {
              this.activeToken = item.coin;
            }
          });
          this.fiatList = fiatArr;
          this.tokenList = tokenArr;
          this.getMess();
        } else {
          // this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    getMess() {
      this.axios({
        url: 'credit/moonPayRate',
        hostType: 'fe-credit-api',
        params: {
          token: this.activeToken, // 加密货币
          fiatCoin: this.activeFiat, // 法定货币
        },
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          if (this.fiatInput || this.tokenInput) {
            this.fiatInput = '';
            this.tokenInput = '';
            // 汇率已更新，请重新下单
            this.$bus.$emit('tip', {
              text: this.$t('creditCard.warningText'),
              type: 'warning',
            });
          }
          this.nowRate = data.data.moonPayRate;
          // this.sourceID = data.data.serverList[0].id;
        } else {
          // this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    reset() {
      this.tokenInput = '';
      this.fiatInput = '';
      this.nowRate = 0;
      this.getMess();
    },
    tokenChange(item) {
      if (item.code === this.activeToken) return;
      this.activeToken = item.code;
      this.reset();
    },
    fiatChange(item) {
      if (item.code === this.activeFiat) return;
      this.activeFiat = item.code;
      this.reset();
    },
  },
};
