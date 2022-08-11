import {
  fixD,
  myStorage,
  getCoinShowName,
} from '@/utils';


export default {
  name: 'page-leverAccount',
  data() {
    return {
      tabelLoading: true, // 表格 loading
      dataList: [], // 表格 数据
      switchFlag: false, // 是否隐藏零资产
      findValue: '',
      axiosData: {},
    };
  },
  watch: {
    market(v) {
      if (v) { this.getData(); }
    },
  },
  computed: {
    navList() {
      return [
        {
          text: this.$t('assets.otcAccount.ListOfFunds'),
          active: true,
          link: '/assets/leverageAccount',
        },
        {
          text: this.$t('assets.index.flowingWater'),
          link: '/assets/lerverageFlowingWater',
        },
      ];
    },
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    tradeLinkUrl() {
      if (process.env.NODE_ENV === 'development') {
        return '/ex/margin';
      }
      if (this.$store.state.baseData && this.$store.state.baseData.publicInfo) {
        return `${this.linkurl.mexUrl}/margin`;
      }
      return '';
    },
    // 表格title
    columns() {
      return [
        { title: this.$t('assets.leverageAccount.list2'), width: '13%' }, // 总资产
        { title: this.$t('assets.leverageAccount.list3'), width: '13%' }, // 可用
        { title: this.$t('assets.leverageAccount.list4'), width: '13%' }, // 冻结
        { title: this.$t('assets.leverageAccount.list5'), width: '13%' }, // 已借
        { title: this.$t('assets.leverageAccount.list6'), width: '13%' }, // 爆仓价
        { title: this.$t('assets.leverageAccount.list7'), width: '10%' }, // 风险率
        // { title: this.$t('assets.leverageAccount.list8') }, // 操作
      ];
    },
    market() { return this.$store.state.baseData.market; },
    // 资金列表展示到页面数据
    dataListFilter() {
      // 隐藏零资产功能过滤数据
      let list = [];
      if (this.switchFlag) {
        this.dataList.forEach((item) => {
          // const { subContent, text } = item.data[0][0];
          const arrspk = item.data[0].split('/');
          const text = arrspk[0];
          const subContent = arrspk[1];
          if (parseFloat(text) || parseFloat(subContent)) {
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
  methods: {
    init() {
      if (myStorage.get('assetsSwitch')) {
        this.switchFlag = myStorage.get('assetsSwitch');
      }
      if (this.market) {
        this.getData();
      }
    },
    transferSuccess() {
      this.getData();
    },
    getData() {
      this.axios({
        url: '/lever/finance/balance',
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.tabelLoading = false;
          const { leverMap } = data.data;
          this.serverData = leverMap;
          this.setData(data.data);
          this.axiosData = data.data;
        }
      });
    },
    // 处理列表数据
    setData({ leverMap }) {
      this.tabelLoading = false;
      const { coinList, market } = this.market;
      const list = [];
      Object.keys(leverMap).forEach((v) => {
        const item = leverMap[v];
        const baseFix = coinList[item.baseCoin].showPrecision || 0;
        const quoteFix = coinList[item.quoteCoin].showPrecision || 0;
        // const marketFix = market[item.quoteCoin][item.name].volume || 0;
        const obj = market[item.quoteCoin][item.name];
        const showSymbol = obj.showName || obj.name;
        const showBaseCoin = getCoinShowName(item.baseCoin, coinList);
        const showQuoteFix = getCoinShowName(item.quoteCoin, coinList);
        list.push({
          id: JSON.stringify(item),
          title: [
            {
              text: showSymbol,
            },
          ],
          handle: [
            {
              type: 'button', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
              text: this.$t('assets.leverageAccount.transfer'), // 划转
              eventType: 'transfer',
            },
            {
              type: 'link', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
              text: this.$t('assets.leverageAccount.ToLoan'), // 借贷
              // links: `leverageToLoan?symbol=${item.symbol}`,
              eventType: 'goToLoan',
            },
            {
              type: 'button', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
              text: '<svg class="icon icon-16" aria-hidden="true"><use xlink:href="#icon-c_1"></use></svg>',
              eventType: 'goTrade',
            },
          ],
          data: [
            // 总资产
            `${fixD(item.baseTotalBalance, baseFix)} ${showBaseCoin}
            /${fixD(item.quoteTotalBalance, quoteFix)} ${showQuoteFix}`,
            // 可用
            `${fixD(item.baseNormalBalance, baseFix)} ${showBaseCoin}
            /${fixD(item.quoteNormalBalance, quoteFix)} ${showQuoteFix}`,
            // 冻结
            `${fixD(item.baseLockBalance, baseFix)} ${showBaseCoin}
            /${fixD(item.quoteLockBalance, quoteFix)} ${showQuoteFix}`,
            // 已借
            `${fixD(item.baseBorrowBalance, baseFix)} ${showBaseCoin}
            /${fixD(item.quoteBorrowBalance, quoteFix)} ${showQuoteFix}`,
            // 爆仓价
            `${fixD(item.burstPrice, quoteFix)} ${showQuoteFix}`,
            // 风险率
            item.riskRate ? `${item.riskRate}%` : '--',
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
    tableClick(v, data) {
      const obj = JSON.parse(data.id);
      if (v === 'transfer') {
        this.$bus.$emit('coTransfer', obj.symbol);
      } else if (v === 'goTrade') {
        const symbol = obj.name;
        if (symbol.toString().indexOf('/') === -1) { return; }
        // myStorage.set('markTitle', symbol.split('/')[1]);
        // myStorage.set('sSymbolName', symbol);
        window.location.href = `
        ${this.tradeLinkUrl}/${symbol.split('/')[0]}_${symbol.split('/')[1]}`;
      } else if (v === 'goToLoan') {
        const sym = obj.symbol;
        this.$router.push(`/assets/leverageToLoan?symbol=${sym}`);
      }
    },
  },
};
