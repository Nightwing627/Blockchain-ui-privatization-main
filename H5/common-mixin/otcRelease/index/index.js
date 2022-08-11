import { fixD, fixInput, imgMap } from '@/utils';

export default {
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
      backgroundImg: imgMap.otcRelease,
      accountList: [], // 资产列表
      symbol: null, // 当前币种
      symbolList: [], // 币种列表
      side: '', // SELL出售 BUY购买
      legalCurrency: '', // 法币币种
      legalCurrencyList: [], // 法币select框
      number: '', // 数量
      pricingMethod: '1', // 定价方式
      pricentMethod: '1',
      barNum: 0, // 溢价滚动条
      autoPrice: '', // 自定义价格
      rates: null, // 法币汇率
      minPrice: '', // 最小限额
      maxPrice: '', // 最大限额
      tradeTime: '5', // 付款时限
      frequency: '0', // 交易次数
      days: '30', // 失效时间
      buyPaysList: [], // 支付方式 (购买时)
      sellPaysList: [], // 收款方式 (出售时)
      myBuyPaysList: [], // 选择的支付方式
      mySellPaysList: [], // 选择的收款方式
      confirmLoading: false, // 提交按钮loading
      reply: '', // 自动回复
      leavingText: '', // 广告留言
      successDialogFlag: false, // 成功后的提示
      precent: '',
      coinListFlag: false,
    };
  },
  beforeDestroy() {
    this.$bus.$off('HEADER-CLICK-EVENT');
  },
  watch: {
    showSymbol(v) {
      this.$bus.$emit('PAGE-TOP-TITLE', v);
      this.axios({
        url: 'otc/rates',
        method: 'post',
        hostType: 'otc',
        params: {
          symbol: v,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.rates = data.data;
        }
      });
    },
    userInfo(v) {
      if (v) {
        this.jurisdiction();
        this.initSellPaysList();
        this.isSh();
      }
    },
    // 格式化 数量的输入
    number(v) {
      let fix = 0;
      if (this.market && this.market.coinList && typeof (this.symbol) === 'number') {
        // 获取精度
        Object.keys(this.market.coinList).forEach((citem) => {
          const { showPrecision, name } = this.market.coinList[citem];
          if (name === this.showSymbol) { fix = showPrecision; }
        });
        this.number = fixInput(v, fix);
      }
    },
    precent(v) {
      this.precent = fixInput(v, 2);
    },
    // 格式化 自定义价格
    autoPrice(v) {
      const fix = this.priceFix;
      this.autoPrice = fixInput(v, fix);
    },
    // 格式化 最小限额
    minPrice(v) {
      const fix = this.priceFix;
      this.minPrice = fixInput(v, fix);
    },
    // 格式化 最大限额
    maxPrice(v) {
      const fix = this.priceFix;
      this.maxPrice = fixInput(v, fix);
    },
    // 付款期限
    tradeTime(v) {
      this.tradeTime = fixInput(v, 0);
    },
    // 交易次数
    frequency(v) {
      this.frequency = fixInput(v, 0);
    },
    market(v) {
      // 构建交易货币列表
      if (v && this.otcPublicInfo) { this.initSymbolList(); }
    },
    otcPublicInfo(v) {
      // 构件法币列表
      if (v) {
        this.initLegalCurrencyList(); // 初始化法币
        this.side = this.otcPublicInfo.defaultSeach; // 设置默认方向
        this.initBuyPaysList(); // 初始化支付方式列表
        if (this.market) { this.initSymbolList(); }
      }
    },
  },
  computed: {
    // 失效时间列表
    daysList() {
      const day = this.$t('otcRelease.day');
      return [
        { value: `2${day}`, code: '2' },
        { value: `4${day}`, code: '4' },
        { value: `7${day}`, code: '7' },
        { value: `30${day}`, code: '30' },
      ];
    },
    pricentMethodList() {
      return [
        { value: this.$t('otcRelease.higher'), code: '1' },
        { value: this.$t('otcRelease.lower'), code: '2' },
      ];
    },
    // 定价方式列表
    pricingMethodList() {
      return [
        // 市场价(溢价)
        { value: this.$t('otcRelease.MarketPrice'), code: '1' },
        // 自定义
        { value: this.$t('otcRelease.Custom'), code: '2' },
      ];
    },
    rateUrl() {
      let url = '';
      if (this.otcPublicInfo
       && this.otcPublicInfo.rateUrl) {
        url = this.otcPublicInfo.rateUrl;
      }
      return url;
    },
    confirmDisabled() {
      let flag = true;
      let priceF = true;
      if (this.pricingMethod === '2') {
        priceF = this.autoPriceObj.flag;
      }
      let payF = false;
      if (this.side === 'SELL') {
        payF = this.mySellPaysList.length;
      } else {
        payF = this.myBuyPaysList.length;
      }
      if ((this.symbol
        && this.side.length
        && this.legalCurrency.length
        && this.numberObj.flag
        && priceF
        && this.precentObj.flag
        && this.minPriceObj.flag
        && this.maxPriceObj.flag
        && this.tradeTimeObj.flag
        && this.frequencyFlag
        && this.days.length
        && payF) || this.confirmLoading) {
        flag = false;
      }
      return flag;
    },
    precentPrice() {
      const precent = (this.precent === '') ? 0 : this.precent;
      let price = '--';
      if (this.nowPrice !== '--') {
        if (this.pricentMethod === '1') {
          price = fixD(this.nowPrice * (1 + window.parseFloat(precent) / 100), this.priceFix);
        } else {
          price = fixD(this.nowPrice * (1 - window.parseFloat(precent) / 100), this.priceFix);
        }
      }
      return price;
    },
    sum() {
      let sum = 0;
      if (this.number) {
        if (this.pricingMethod === '1') {
          sum = this.number * this.precentPrice;
        } else {
          sum = this.number * this.autoPrice;
        }
      }
      return fixD(sum, this.priceFix);
    },
    priceFix() {
      let fix = this.$store.state.baseData.defaultFiatPrecision;
      if (this.market
        && this.market.coinList[this.showSymbol]
        && this.market.coinList[this.showSymbol].fiatPrecision
        && this.market.coinList[this.showSymbol].fiatPrecision[this.legalCurrency.toLowerCase()]) {
        fix = this.market.coinList[this.showSymbol].fiatPrecision[this.legalCurrency.toLowerCase()];
      }
      return Number(fix);
    },
    // 当前单价
    nowPrice() {
      let price = '--';
      if (this.rates
        && this.rates.symbol === this.showSymbol
        && this.market && this.market.coinList) {
        const fix = this.priceFix;
        const nowP = this.rates[this.legalCurrency];
        price = fixD(nowP, fix);
      }
      return price;
    },
    market() { return this.$store.state.baseData.market; },
    userInfo() { return this.$store.state.baseData.userInfo; },
    otcPublicInfo() { return this.$store.state.baseData.otcPublicInfo; },
    frequencyFlag() {
      if (this.frequency.length === 0) {
        return false;
      }
      return true;
    },
    // 数量输入框 验证
    numberObj() {
      if (this.side === 'SELL') {
        if (this.number.length === 0 || parseFloat(this.number) === 0) {
          return {
            flag: false,
            errorFlag: false,
            // 请输入数量
            errorText: this.$t('otcRelease.PleaseEnterQuantity'),
          };
        } if (parseFloat(this.numberValue) >= parseFloat(this.number)) {
          return {
            flag: true,
            errorFlag: false,
            errorText: '',
          };
        } if (parseFloat(this.numberValue) < parseFloat(this.number)) {
          return {
            flag: false,
            errorFlag: true,
            // 可用余额不足
            errorText: this.$t('otcRelease.availableBalance'),
          };
        }
        return {
          flag: false,
          errorFlag: false,
          errorText: '',
        };
      }
      if (this.number.length === 0 || parseFloat(this.number) === 0) {
        return {
          flag: false,
          errorFlag: false,
          errorText: '',
        };
      }
      return {
        flag: true,
        errorFlag: false,
        errorText: '',
      };
    },
    // 自定义价格 验证
    autoPriceObj() {
      if (this.autoPrice.length === 0 || parseFloat(this.autoPrice) === 0) {
        return {
          flag: false,
          errorFlag: false,
          errorText: '',
        };
      }
      return {
        flag: true,
        errorFlag: false,
        errorText: '',
      };
    },
    // 百分比验证
    precentObj() {
      if (this.precent > 50) {
        return {
          flag: false,
          errorFlag: true,
          errorText: this.$t('otcRelease.precentError'),
        };
      }
      return {
        flag: true,
        errorFlag: false,
        errorText: '',
      };
    },
    // 最小限额 验证
    minPriceObj() {
      if (this.minPrice.length === 0 || parseFloat(this.minPrice) === 0) {
        return {
          flag: false,
          errorFlag: false,
          errorText: '',
        };
      } if (parseFloat(this.minPrice) > parseFloat(this.sum)) {
        return {
          flag: false,
          errorFlag: true,
          // 最小限额不得大于总金额
          errorText: this.$t('otcRelease.minPriceError1'),
        };
      } if (parseFloat(this.minPrice) >= parseFloat(this.maxPrice)) {
        return {
          flag: false,
          errorFlag: true,
          // 最小限额不得大于或等于最大限额
          errorText: this.$t('otcRelease.minPriceError2'),
        };
      }
      return {
        flag: true,
        errorFlag: false,
        errorText: '',
      };
    },
    // 最大限额 验证
    maxPriceObj() {
      if (this.maxPrice.length === 0 || parseFloat(this.maxPrice) === 0) {
        return {
          flag: false,
          errorFlag: false,
          errorText: '',
        };
      } if (parseFloat(this.maxPrice) > parseFloat(this.sum)) {
        return {
          flag: false,
          errorFlag: true,
          // 最大限额不得大于总金额
          errorText: this.$t('otcRelease.maxPriceError1'),
        };
      } if (parseFloat(this.minPrice) >= parseFloat(this.maxPrice)) {
        return {
          flag: false,
          errorFlag: true,
          // 最大限额不得小于或等于最小限额
          errorText: this.$t('otcRelease.maxPriceError2'),
        };
      }
      return {
        flag: true,
        errorFlag: false,
        errorText: '',
      };
    },
    // 付款时限 验证
    tradeTimeObj() {
      if (this.tradeTime.length === 0) {
        return {
          flag: false,
          errorFlag: false,
          // 请输入付款时限
          errorText: this.$t('otcRelease.paymentTimeLimit'),
        };
      } if (parseFloat(this.tradeTime) < 5 || parseFloat(this.tradeTime) > 60) {
        return {
          flag: false,
          errorFlag: true,
          // 付款时限应当在 5-60 分钟
          errorText: this.$t('otcRelease.paymentTimeError'),
        };
      }
      return {
        flag: true,
        errorFlag: false,
        errorText: '',
      };
    },
    // 页面上用于展示的交易货币
    showSymbol() {
      let v = '';
      if (this.symbolList.length && typeof (this.symbol) === 'number') {
        this.symbolList.forEach((item) => {
          if (item.index === this.symbol) { v = item.name; }
        });
      }
      return v;
    },
    // 当前币种可用余额
    numberValue() {
      let v = '--';
      if (this.accountList && this.accountList.length
      && typeof (this.symbol) === 'number'
      && this.market && this.market.coinList
      && this.otcPublicInfo && this.otcPublicInfo.feeOtcList) {
        this.accountList.forEach((item) => {
          if (item.coinSymbol === this.showSymbol) {
            const { normal } = item;
            let symbolRate = 0;
            let fix = 0;
            // 获取手续费
            this.otcPublicInfo.feeOtcList.forEach((citem) => {
              if (citem.symbol === this.showSymbol) { symbolRate = citem.rate; }
            });
            // 获取精度
            Object.keys(this.market.coinList).forEach((citem) => {
              const { showPrecision, name } = this.market.coinList[citem];
              if (name === this.showSymbol) { fix = showPrecision; }
            });
            // const fee = normal * symbolRate;
            // v = fixD(normal - fee, fix);
            v = fixD(normal / (1 + symbolRate), fix);
          }
        });
      }
      return v;
    },
  },
  methods: {
    mounInit() {
      this.precent = '';
    },
    init() {
      this.initData();
      this.$bus.$off('HEADER-CLICK-EVENT');
      this.$bus.$on('HEADER-CLICK-EVENT', () => {
        this.coinListFlag = !this.coinListFlag;
      });
    },
    alertClose() {
      this.jurisdictionObj.flag = false;
    },
    alertConfirm() {
      this.$router.push(this.jurisdictionObj.btnLink);
    },
    goNoPay() {
      this.$router.push('/personal/leaglTenderSet');
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
    initData() {
      this.getAccountList();
      if (this.market && this.otcPublicInfo) { this.initSymbolList(); }
      if (this.otcPublicInfo) {
        this.initLegalCurrencyList(); // 初始化法币
        this.side = this.otcPublicInfo.defaultSeach; // 设置默认方向
        this.initBuyPaysList(); // 初始化支付方式列表
      }
      if (this.userInfo) {
        this.jurisdiction();
        this.initSellPaysList();
        this.isSh();
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
        btnLink = '/personal';
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
            btnLink = '/companyApplication';
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
    inputLineChange(value, name) {
      this[name] = value;
    },
    // 获取列表
    getAccountList() {
      this.axios({
        url: '/finance/otc_account_list',
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.accountList = data.data.allCoinMap;
        }
      });
    },
    // 初始化 数字货币列表
    initSymbolList() {
      const list = [];
      const { coinList } = this.market;
      Object.keys(coinList).forEach((item, index) => {
        if (coinList[item].otcOpen) {
          list.push({ name: item, index: index + 1 });
        }
      });
      this.symbolList = list;
      this.initSymbol();
    },
    // 设置默认的数字货币
    initSymbol() {
      this.symbolList.forEach((item) => {
        if (item.name === this.otcPublicInfo.defaultCoin) {
          this.symbol = item.index;
        }
      });
    },
    // 初始化交易的法币
    initLegalCurrencyList() {
      const list = [];
      this.otcPublicInfo.paycoins.forEach((item) => {
        list.push({ value: item.title, code: item.key });
      });
      this.legalCurrency = this.otcPublicInfo.otcDefaultPaycoin;
      this.legalCurrencyList = list;
    },
    // 初始化支付方式列表
    initBuyPaysList() {
      this.buyPaysList = this.otcPublicInfo.payments;
    },
    // 初始化收款方式列表
    initSellPaysList() {
      this.axios({
        url: '/otc/payment/find',
        hostType: 'otc',
        params: { isOpen: '1' },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.sellPaysList = data.data;
        }
      });
    },
    // 重置 数量/定价方式/最小限额/最大限额/付款时限
    reset() {
      this.number = ''; // 重置数量
      this.pricingMethod = '1'; // 重置定价方式
      this.autoPrice = ''; // 重置自定义价格
      this.minPrice = ''; // 重置最小限额
      this.maxPrice = ''; // 重置最大限额
      this.tradeTime = '5'; // 重置付款时限
      this.frequency = '0'; // 重置交易次数
      this.days = '30'; // 重置失效时间
      this.myBuyPaysList = []; // 重置已选支付方式
      this.mySellPaysList = []; // 重置已选收款方式
      this.leavingText = ''; // 广告留言
      this.reply = '';
    },
    // 切换币种
    symbolChange(item) {
      this.coinListFlag = false;
      if (this.symbol === item.index) { return; }
      this.symbol = item.index;
      this.side = this.otcPublicInfo.defaultSeach; // 重置广告类型
      this.legalCurrency = this.otcPublicInfo.otcDefaultPaycoin; // 重置法币
      this.reset();
    },
    // 切换广告类型
    sideChange(name) {
      this.side = name;
      this.legalCurrency = this.otcPublicInfo.otcDefaultPaycoin; // 重置法币
      this.reset();
    },
    // 切换法币
    legalCurrencyChange(item) {
      this.legalCurrency = item.code;
      this.reset();
    },
    // 切换溢价方向
    precentMethodChange(item) {
      this.pricentMethod = item.code;
    },
    // 切换定价方式
    pricingMethodChange(item) {
      this.pricingMethod = item.code;
      this.autoPrice = this.nowPrice;
      this.precent = '';
      this.pricentMethod = '1';
    },
    // 溢价
    barChange(num) {
      this.barNum = Number(num);
    },
    // 切换失效时间
    daysChange(item) {
      this.days = item.code;
    },
    // 支付方式点击
    buyPayClick(item) {
      if (this.myBuyPaysList.indexOf(item.key) !== -1) {
        this.myBuyPaysList.splice(this.myBuyPaysList.indexOf(item.key), 1);
      } else {
        if (this.myBuyPaysList.length >= 3) {
          // 最多可以选择三种支付方式
          this.$bus.$emit('tip', { text: this.$t('otcRelease.threePayment'), type: 'warning' });
          return;
        }
        this.myBuyPaysList.push(item.key);
      }
    },
    // 收款方式点击
    sellPayClick(item) {
      if (this.mySellPaysList.indexOf(item.payment) !== -1) {
        this.mySellPaysList.splice(this.mySellPaysList.indexOf(item.payment), 1);
      } else {
        this.mySellPaysList.push(item.payment);
      }
    },
    confirm() {
      if (!this.jurisdictionObj.pass) {
        this.jurisdictionObj.flag = true;
        return;
      }
      let priceParams = {};
      // 价格
      if (this.pricingMethod === '1') {
        priceParams = {
          price: this.precentPrice,
          priceRate: Math.abs(this.precent),
          priceRateType: (this.pricentMethod === '1') ? 2 : 3,
        };
      } else {
        priceParams = {
          price: this.autoPrice,
          priceRate: 0,
          priceRateType: 0,
        };
      }
      const payments = [];
      if (this.side === 'SELL') {
        this.mySellPaysList.forEach((item) => {
          payments.push({
            payment: item,
          });
        });
      } else {
        this.myBuyPaysList.forEach((item) => {
          payments.push({
            payment: item,
          });
        });
      }
      const params = {
        coin: this.showSymbol, // 交易币种
        side: this.side, // 方向
        payCoin: this.legalCurrency, // 法币
        volume: this.number, // 数量
        ...priceParams, // 价格
        minTrade: this.minPrice, // 最小限额
        maxTrade: this.maxPrice, // 最大限额
        limitTime: this.tradeTime, // 交易期限
        dealVolume: this.frequency, // 交易次数
        days: this.days, // 失效时间
        payments,
        description: this.leavingText,
        autoReply: this.reply,
      };
      this.confirmLoading = true;
      this.axios({
        url: 'otc/wanted_save',
        hostType: 'otc',
        params,
      }).then((data) => {
        this.confirmLoading = false;
        if (data.code.toString() === '0') {
          this.successDialogFlag = true;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    successDialogConfirm() {
      this.initData();
      this.reset();
      this.successDialogFlag = false;
    },
    successDialogClose() {
      this.$router.push('/');
    },
  },
};
