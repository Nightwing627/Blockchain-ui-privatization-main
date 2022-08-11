import {
  myStorage, fixD, colorMap, imgMap,
} from '@/utils';


const defaultIcon = imgMap.f_1;

export default {
  name: 'page-otcAccount',
  data() {
    return {
      otcHeader: `background: url(${imgMap.krwBg})`,
      imgMap,
      colorMap,
      tabelLoading: true, // 表格 loading
      dataList: [], // 表格 数据
      totalBalance: '--', // 资产折合
      totalBalanceSymbol: '', // 资产折合币种
      switchFlag: false, // 是否隐藏零资产
      findValue: '', // 搜索币种
    };
  },
  computed: {
    krwData() { return this.$store.state.assets.krwData; },
    // 表格title
    columns() {
      return [
        { title: this.$t('assets.otcAccount.coin'), width: '20%' }, // 币种
        { title: this.$t('assets.otcAccount.Available'), width: '30%' }, // 可用
        { title: this.$t('assets.otcAccount.freeze'), width: '30%' }, // 冻结
        { title: this.$t('assets.otcAccount.options'), width: '20%' }, // 操作
      ];
    },
    market() { return this.$store.state.baseData.market; },
    // 资金列表展示到页面数据
    dataListFilter() {
      // 隐藏零资产功能过滤数据
      let list = [];
      if (this.switchFlag) {
        this.dataList.forEach((item) => {
          if (parseFloat(item.data[1])) {
            list.push(item);
          }
        });
      } else {
        list = this.dataList;
      }
      // 搜索框功能过滤数据
      const newList = [];
      list.forEach((item) => {
        if (item.data[0][1].text.indexOf(this.findValue.toUpperCase()) !== -1) {
          newList.push(item);
        }
      });
      return newList;
    },
  },
  watch: {
    market(v) { if (v) { this.sendOtcAxios(); } },
    krwData(v) { if (v) { this.setData(this.krwData); } },
  },
  methods: {
    init() {
      if (myStorage.get('assetsSwitch')) {
        this.switchFlag = myStorage.get('assetsSwitch');
      }
      if (this.market) { this.sendOtcAxios(); }
      if (this.krwData) { this.setData(this.krwData); }
    },
    // 获取列表
    sendOtcAxios() {
      this.$store.dispatch('krwData');
    },
    // 处理列表数据
    setData({ totalBalance, totalBalanceSymbol, allCoinMap }) {
      this.tabelLoading = false;
      const { coinList } = this.market;
      this.totalBalance = totalBalance; // 折合资产
      this.totalBalanceSymbol = totalBalanceSymbol; // 折合币种
      const list = [];
      let coinImg = defaultIcon;
      allCoinMap.forEach((item) => {
        const fix = Number(coinList[item.symbol].showPrecision);
        if (coinList[item.symbol] && coinList[item.symbol].icon.length) {
          coinImg = coinList[item.symbol].icon;
        }
        list.push({
          id: JSON.stringify(item),
          data: [
            [
              {
                type: 'icon', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                iconSvg: `<div class="coinIcon"><img src="${coinImg}"/></div>`,
                eventType: 'goTradeIn',
                classes: ['coinBox'],
              },
              {
                text: item.symbol,
              },
            ],
            fixD(item.normalBalance, fix),
            fixD(item.lockBalance, fix),
            [
              {
                type: 'link', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                text: this.$t('assets.exchangeAccount.Recharge'), // 充值
                links: `krwRecharge?symbol=${item.symbol}`,
              },
              {
                type: 'link', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                text: this.$t('assets.exchangeAccount.withdraw'), // 提现
                links: `krwWithdraw?symbol=${item.symbol}`,
              },
            ],
          ],
        });
      });
      this.dataList = list;
    },
    // 隐藏零资产
    findChanges(v) {
      this.findValue = v;
    },
    switchChange() {
      this.switchFlag = !this.switchFlag;
      myStorage.set('assetsSwitch', this.switchFlag);
    },
    tableClick() {
    },
  },
};
