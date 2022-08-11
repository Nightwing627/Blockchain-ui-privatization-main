import {
  myStorage, fixD, fixRate, getCoinShowName, colorMap, imgMap,
} from '@/utils';

export default {
  name: 'page-leverAccount',
  data() {
    return {
      otcHeader: `background: url(${imgMap.zc_le})`,
      tabelLoading: true, // 表格 loading
      imgMap,
      colorMap,
      dataList: [], // 表格 数据
      totalBalance: '--', // 资产折合
      totalBalanceSymbol: '', // 资产折合币种
      switchFlag: false, // 是否隐藏零资产
      findValue: '', // 搜索币种
      totalRate: '--', // 折合法币
    };
  },
  watch: {
    market(v) {
      if (v) { this.getData(); }
    },
  },
  computed: {
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },
    showTotalBalanceSymbol() {
      let str = this.totalBalanceSymbol;
      if (this.market && this.market.coinList
        && this.market.coinList[this.totalBalanceSymbol]) {
        str = getCoinShowName(this.totalBalanceSymbol, this.market.coinList);
      }
      return str;
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
        return `${this.linkurl.exUrl}/margin`;
      }
      return '';
    },
    // 表格title
    columns() {
      return [
        { title: this.$t('assets.leverageAccount.list1') }, // 杠杆账户
        { title: this.$t('assets.leverageAccount.list2'), width: '13%' }, // 总资产
        { title: this.$t('assets.leverageAccount.list3'), width: '13%' }, // 可用
        { title: this.$t('assets.leverageAccount.list4'), width: '13%' }, // 冻结
        { title: this.$t('assets.leverageAccount.list5'), width: '13%' }, // 已借
        { title: this.$t('assets.leverageAccount.list6'), width: '13%' }, // 爆仓价
        { title: this.$t('assets.leverageAccount.list7'), width: '10%' }, // 风险率
        { title: this.$t('assets.leverageAccount.list8') }, // 操作
      ];
    },
    market() { return this.$store.state.baseData.market; },
    // 资金列表展示到页面数据
    dataListFilter() {
      // 隐藏零资产功能过滤数据
      let list = [];
      if (this.switchFlag) {
        this.dataList.forEach((item) => {
          const { subContent, text } = item.data[1][0];
          if (parseFloat(text) || parseFloat(subContent.text)) {
            list.push(item);
          }
        });
      } else {
        list = this.dataList;
      }
      // 搜索框功能过滤数据
      const newList = [];
      list.forEach((item) => {
        if (item.data[0].toUpperCase().indexOf(this.findValue.toUpperCase()) !== -1) {
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
        }
      });
    },
    // 处理列表数据
    setData({ totalBalance, totalBalanceSymbol, leverMap }) {
      this.tabelLoading = false;
      const { coinList, rate, market } = this.market;
      this.totalBalance = fixD(totalBalance, 8); // 折合资产
      this.totalBalanceSymbol = totalBalanceSymbol; // 折合币种
      this.totalRate = fixRate(totalBalance, rate, totalBalanceSymbol); // 折合法币
      const list = [];
      Object.keys(leverMap).forEach((v) => {
        const item = leverMap[v];
        let quoteFix = coinList[item.quoteCoin].showPrecision || 0;
        if (this.symbolAll) {
          quoteFix = this.symbolAll[item.name].price;
        }
        // const marketFix = market[item.quoteCoin][item.name].volume || 0;
        // const showSymbol = market[v][cv].showName || market[v][cv].name;
        const obj = market[item.quoteCoin][item.name];
        const showSymbol = obj.showName || obj.name;
        // getCoinShowName
        const showBaseCoin = getCoinShowName(item.baseCoin, coinList);
        const showQuoteFix = getCoinShowName(item.quoteCoin, coinList);
        list.push({
          id: JSON.stringify(item),
          data: [
            showSymbol,
            // 总资产
            [
              {
                text: `${fixD(item.baseTotalBalance, 8)} ${showBaseCoin}`,
                subContent: {
                  text: `${fixD(item.quoteTotalBalance, 8)} ${showQuoteFix}`,
                },
              },
            ],
            // 可用
            [
              {
                text: `${fixD(item.baseNormalBalance, 8)} ${showBaseCoin}`,
                subContent: {
                  text: `${fixD(item.quoteNormalBalance, 8)} ${showQuoteFix}`,
                },
              },
            ],
            // 冻结
            [
              {
                text: `${fixD(item.baseLockBalance, 8)} ${showBaseCoin}`,
                subContent: {
                  text: `${fixD(item.quoteLockBalance, 8)} ${showQuoteFix}`,
                },
              },
            ],
            // 已借
            [
              {
                // text: `${fixD(item.baseBorrowBalance, baseFix)} ${showBaseCoin}`,
                text: `${fixD(item.baseBorrowBalance, 8)} ${showBaseCoin}`,
                subContent: {
                  // text: `${fixD(item.quoteBorrowBalance, quoteFix)} ${showQuoteFix}`,
                  text: `${fixD(item.quoteBorrowBalance, 8)} ${showQuoteFix}`,
                },
              },
            ],
            // 爆仓价
            `${fixD(item.burstPrice, quoteFix)} ${showQuoteFix}`,
            // 风险率
            item.riskRate ? `${item.riskRate}%` : '--',
            [
              {
                type: 'button', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                text: this.$t('assets.leverageAccount.transfer'), // 划转
                eventType: 'transfer',
              },
              {
                type: 'link', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                text: this.$t('assets.leverageAccount.ToLoan'), // 借贷
                links: `leverageToLoan?symbol=${item.symbol}`,
              },
              {
                type: 'icon', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                iconSvg: '<svg class="icon icon-16" aria-hidden="true"><use xlink:href="#icon-c_1"></use></svg>',
                eventType: 'goTrade',
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
    tableClick(v, data) {
      const obj = JSON.parse(data);
      if (v === 'transfer') {
        this.$bus.$emit('coTransfer', obj.symbol);
      } else if (v === 'goTrade') {
        const symbol = obj.name;
        if (symbol.toString().indexOf('/') === -1) { return; }
        const arr = symbol.split('/');
        // myStorage.set('markTitle', symbol.split('/')[1]);
        // myStorage.set('sSymbolName', symbol);
        window.location.href = `${this.tradeLinkUrl}/${arr[0]}_${arr[1]}`;
      }
    },
  },
};
