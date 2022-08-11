import {
  myStorage, fixD, colorMap,
} from '@/utils';

// const defaultIcon = imgMap.f_1;

export default {
  data() {
    return {
      colorMap,
      tabelLoading: true, // 表格 loading
      dataList: [], // 表格 数据
      totalBalance: '--', // 资产折合
      totalBalanceSymbol: '', // 资产折合币种
      totalRate: '--', // 资产折合汇率
      switchFlag: false, // 是否隐藏零资产
      findValue: '', // 搜索币种
      colors: ['#9695FF', '#8073FF', '#6C5EE5', '#706BE4', '#514DE9 ', '#4232C5'],
      axiosData: {},
    };
  },
  computed: {
    navList() {
      return [
        {
          text: this.$t('assets.otcAccount.ListOfFunds'),
          active: true,
          link: '/assets/b2cAccount',
        },
        {
          text: this.$t('assets.index.flowingWater'),
          link: '/assets/b2cFlowingWater',
        },
      ];
    },
    // 表格title
    columns() {
      return [
        { title: this.$t('assets.b2c.allName'), width: '10%' }, // 全称
        { title: this.$t('assets.withdraw.lumpSum'), width: '15%' }, // 总额
        { title: this.$t('assets.otcAccount.Available'), width: '20%' }, // 可用
        { title: this.$t('assets.otcAccount.freeze'), width: '20%' }, // 冻结
      ];
    },
    market() { return this.$store.state.baseData.market; },
    // 资金列表展示到页面数据
    dataListFilter() {
      // 隐藏零资产功能过滤数据
      let list = [];
      if (this.switchFlag) {
        this.dataList.forEach((item) => {
          if (parseFloat(item.btcValuation) >= 0.0001) {
            list.push(item);
          }
        });
      } else {
        list = this.dataList;
      }
      // 搜索框功能过滤数据
      const newList = [];
      list.forEach((item) => {
        if (item.title[0].text.toUpperCase().indexOf(this.findValue.toUpperCase()) !== -1) {
          newList.push(item);
        }
      });
      return newList;
    },
  },
  watch: {
    market(v) { if (v) { this.sendOtcAxios(); } },
  },
  methods: {
    init() {
      if (myStorage.get('assetsSwitch')) {
        this.switchFlag = myStorage.get('assetsSwitch');
      }
      if (this.market) { this.sendOtcAxios(); }
    },
    compare(property) {
      return function fn(a, b) {
        const value1 = a[property];
        const value2 = b[property];
        return value2 - value1;
      };
    },
    // 获取列表
    sendOtcAxios() {
      this.axios({
        url: 'fiat/balance',
      }).then((data) => {
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          this.setData(data.data);
          this.axiosData = data.data;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 处理列表数据
    setData({ allCoinMap }) {
      const { coinList } = this.market;
      const list = [];
      allCoinMap.forEach((item) => {
        const fix = (coinList[item.symbol] && coinList[item.symbol].showPrecision) || 0;
        list.push({
          id: JSON.stringify(item),
          title: [
            {
              text: item.symbol,
            },
          ],
          symbol: item.symbol,
          btcValuation: item.btcValue,
          handle: [
            {
              type: 'button', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
              text: this.$t('assets.exchangeAccount.Recharge'), // 充值
              eventType: 'b2cRecrge',
              // links: `b2cRecrge?symbol=${item.symbol}`,
              // classes: [item.depositOpen ? '' : 'tableNownStyle b-2-cl'],
              disabled: !item.depositOpen,
            },
            {
              type: 'button', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
              text: this.$t('assets.exchangeAccount.withdraw'), // 提现
              // links: `b2cWithdraw?symbol=${item.symbol}`,
              disabled: !item.withdrawOpen,
              eventType: 'b2cWithdraw',
            },
          ],
          data: [
            item.title || '--', // 全称
            fixD(item.totalBalance, fix), // 总额
            fixD(item.normalBalance, fix), // 可用
            fixD(item.lockBalance, fix), // 冻结
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
    tableClick(v, item) {
      if (v === 'b2cRecrge') {
        this.$router.push(`/assets/b2cRecrge?symbol=${item.symbol}`);
      } else {
        this.$router.push(`/assets/b2cWithdraw?symbol=${item.symbol}`);
      }
    },
  },
};
