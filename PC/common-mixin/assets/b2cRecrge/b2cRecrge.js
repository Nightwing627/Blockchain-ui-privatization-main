
import { fixD, fixInput, imgMap } from '@/utils';


export default {
  data() {
    return {
      imgMap,
      QRflag: false,
      dialogFlag: false,
      dialogConfirmLoading: false,
      rechargeNum: '',
      imgLoading: false,
      imageType: '2',
      messageValue: {
        bankName: '', // 银行名称
        bankSub: '', // 分行
        cardNo: '', // 卡号
        name: '', // 收款人
        remark: '', // 转账备注
      },
      symbol: '',
      imgUrl: '',
      imageDataStr: '',
      nowSymbolMess: {},
      infoIsReady: false,
      assetsReady: false,
      buttonLoading: false,
      isTransferVoucher: 0,
      warning: '',
    };
  },
  filters: {
    fixDFn(v, that) {
      return fixD(v, that.showPrecision);
    },
  },
  watch: {
    clientUploadType() {
      this.getImageToken();
    },
    market(v) {
      if (v && this.symbol) {
        this.getAssets();
        this.getMessage();
      }
    },
    rechargeNum(v) {
      this.rechargeNum = fixInput(v, this.showPrecision);
    },
  },
  computed: {
    inputW() {
      let str = '';
      if (this.isOther) {
        str = `${this.$t('assets.b2c.rechargeSum')}（${this.symbol}）`;
      } else {
        str = this.$t('assets.b2c.rechargeSum');
      }
      return str;
    },
    aikrw() {
      let str = '--';
      if (this.isOther && this.rechargeNum) {
        str = this.rechargeNum * 1000;
      }
      return str;
    },
    isOther() {
      return this.symbol === 'AIKRW';
    },
    rechargeNumFlag() {
      const inputValue = parseFloat(this.rechargeNum);
      const minValue = parseFloat(this.minRecrge);
      return inputValue >= minValue;
    },
    rechargeNumError() {
      if (this.rechargeNum.length && !this.rechargeNumFlag) return true;
      return false;
    },
    that() { return this; },
    market() { return this.$store.state.baseData.market; },
    minRecrge() {
      let str = '0';
      if (this.nowSymbolMess.depositMin) {
        str = this.nowSymbolMess.depositMin;
      }
      return str;
    },
    clientUploadType() {
      return this.$store.state.baseData.client_img_upload_open;
    },
    isOpenUploadImg() {
      const data = this.$store.state.baseData.publicInfo;
      let flag = '0';
      if (data && data.switch && data.switch.is_open_upload_img
        && data.switch.is_open_upload_img.toString === '1') {
        flag = '1';
      }
      return flag;
    },
    imgToken() {
      return this.$store.state.baseData.imgToken || {};
    },
    messageOptions() {
      return {
        // 银行名称
        bankName: {
          title: this.$t('assets.b2c.bankName'),
          haveCopy: false,
        },
        // 分行
        bankSub: {
          title: this.$t('assets.b2c.bankSub'),
          haveCopy: true,
        },
        // 卡号
        cardNo: {
          title: this.$t('assets.b2c.cardNo'),
          haveCopy: true,
        },
        // 收款人
        name: {
          title: this.$t('assets.b2c.name'),
          haveCopy: true,
        },
        // 转账备注
        remark: {
          title: this.$t('assets.b2c.remark'),
          haveCopy: true,
          hover: true,
        },
      };
    },
    showSymbol() {
      const str = this.symbol;
      // if (this.market && this.market.coinList
      //   && this.market.coinList[this.symbol]) {
      //   str = getCoinShowName(this.symbol, this.market.coinList);
      // }
      return str;
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
    // 提现按钮禁用状态
    btnDisabled() {
      let flag = true;
      const imgFlag = this.isTransferVoucher
        ? (!!this.imageDataStr.length)
        : true;
      if ((this.assetsReady && this.infoIsReady
        && this.rechargeNumFlag && imgFlag)
        || this.buttonLoading) {
        flag = false;
      }
      return flag;
    },
  },
  methods: {
    init() {
      this.getImageToken();
      // 如果不存在币种跳走
      if (this.$route.query.symbol) {
        this.symbol = this.$route.query.symbol.toUpperCase();
      } else {
        this.$router.push('/assets/b2cAccount');
        return;
      }
      if (this.symbol && this.market) {
        this.getAssets();
        this.getMessage();
      }
    },
    imgClick() {
      this.QRflag = true;
    },
    QRcodeClick() {
      this.QRflag = false;
    },
    dialogClose() {
      this.dialogFlag = false;
    },
    dialogConfirm() {
      this.dialogConfirmLoading = true;
      this.axios({
        url: '/fiat/deposit',
        params: {
          symbol: this.symbol,
          transferVoucher: this.imageDataStr,
          amount: this.isOther ? this.aikrw : this.rechargeNum,
        },
      }).then((data) => {
        this.dialogConfirmLoading = false;
        if (data.code.toString() === '0') {
          this.rechargeNum = '';
          this.imgUrl = '';
          this.imageDataStr = '';
          this.dialogFlag = false;
          this.$bus.$emit('b2cRecrgeHisGet');
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    getAssets() {
      this.axios({
        url: 'fiat/balance',
        params: {
          symbol: this.symbol,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.assetsReady = true;
          let obj = {};
          data.data.allCoinMap.forEach((item) => {
            if (item.symbol === this.symbol) {
              obj = item;
            }
          });
          this.nowSymbolMess = obj;
          this.warning = data.data.depositTip;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    submit() {
      this.dialogFlag = true;
    },
    inputChanges(value, name) {
      this[name] = value;
    },
    onChangeFileFun() {
      this.imgLoading = true;
    },
    uploadFinish(obj) {
      if (obj.error) {
        this.$bus.$emit('tip', { text: obj.error, type: 'error' });
        return;
      }
      this.imgUrl = obj.url;
      this.imgLoading = false;
      this.imageDataStr = obj.fileName;
    },
    getImageToken() {
      const tokenData = this.imgToken[this.imageType];
      if ((!tokenData || (new Date(tokenData.Expiration).getTime() - new Date().getTime() < 30000))
        && Number(this.clientUploadType)) {
        this.$store.dispatch('getImgToken', this.imageType);
      }
    },
    getMessage() {
      this.axios({
        url: '/company/bank/info',
        params: {
          symbol: this.symbol,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.infoIsReady = true;
          this.messageValue.bankName = data.data.bankName || '';
          this.messageValue.bankSub = data.data.bankSub || '';
          this.messageValue.cardNo = data.data.cardNo || '';
          this.messageValue.name = data.data.name || '';
          this.messageValue.remark = data.data.remark || '';
          this.isTransferVoucher = data.data.isTransferVoucher || 0;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    inputChange(v, name) {
      this[name] = v;
    },
  },
};
