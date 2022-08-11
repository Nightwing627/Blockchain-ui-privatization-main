import { fixD, getCoinShowName, myStorage } from '@/utils';

export default {
  name: 'page-exchangeAccount',
  created() {
  },
  data() {
    return {
      tabelLoading: true,
      tabelLength: 20,
      switchFlag: false, // 是否隐藏零资产
      findValue: '', // 搜索框内容
      dataList: [],
      havePosition: false, // 平台锁仓
      positionV2: false, // 代币锁仓
      totalBalanceSymbol: '',
    };
  },
  computed: {
    navList() {
      return [
        {
          text: this.$t('assets.exchangeAccount.ListOfFunds'),
          active: true,
          link: '/assets/exchangeAccount',
        },
        {
          text: this.$t('assets.index.flowingWater'),
          link: '/assets/flowingWater',
        },
        {
          text: this.$t('assets.index.addressMent'),
          link: '/assets/addressMent',
        },
      ];
    },
    baseData() { return this.$store.state.baseData.publicInfo; },
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    tradeLinkUrl() {
      if (process.env.NODE_ENV === 'development') {
        return '/ex/trade';
      }
      if (this.$store.state.baseData && this.$store.state.baseData.publicInfo) {
        return `${this.linkurl.mexUrl}/trade`;
      }
      return '';
    },
    // 表格title
    columns() {
      const arr = [];
      if (this.havePosition || this.positionV2) {
        let str = '';
        // 仅开启平台币锁仓
        // if (this.havePosition && !this.positionV2) {
        //   str = this.$t('assets.exchangeAccount.positionBalance');
        // // 仅开启代币锁仓
        // } else if (!this.havePosition && this.positionV2) {
        //   str = this.$t('assets.exchangeAccount.positionV2Amount');
        // } else if (this.havePosition && this.positionV2) {
        //   str = this.$t('assets.exchangeAccount.position');
        // }

        if (this.havePosition) {
          str = this.$t('assets.exchangeAccount.positionBalance');
          arr.push({ title: str, width: '' });
        }
        if (this.positionV2) {
          str = this.$t('assets.exchangeAccount.positionV2Amount');
          arr.push({ title: str, width: '' });
        }
      }
      const { coinList } = this.market;
      const totalBalanceSymbol = getCoinShowName(this.totalBalanceSymbol, coinList); // 折合币种
      return [
        { title: this.$t('assets.exchangeAccount.lumpSum'), width: '' }, // 总额
        { title: this.$t('assets.exchangeAccount.Available'), width: '' }, // 可用
        { title: this.$t('assets.exchangeAccount.freeze'), width: '' }, // 冻结
        ...arr,
        { title: `${this.$t('assets.exchangeAccount.AssetFolding')}(${totalBalanceSymbol})`, width: '' }, // 资产折合
        { title: this.$t('assets.exchangeAccount.options'), width: '200px' }, // 操作
      ];
    },
    // finance/account_balance 接口返回成功的数据
    exchangeData() { return this.$store.state.assets.exchangeData; },
    // market 接口
    market() { return this.$store.state.baseData.market; },
    // 资金列表展示到页面数据
    dataListFilter() {
      // 隐藏零资产功能过滤数据
      let list = [];
      if (this.switchFlag) {
        this.dataList.forEach((item) => {
          if (parseFloat(item.data[1].text)) {
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
    exchangeData(v) { if (v && this.market) { this.setData(); } },
    market(v) { if (v && this.exchangeData) { this.setData(); } },
  },
  methods: {
    creInit() {
      if (myStorage.get('assetsSwitch')) {
        this.switchFlag = myStorage.get('assetsSwitch');
      }
    },
    init() {
      this.$store.dispatch('assetsExchangeData');
      if (this.exchangeData && this.market) { this.setData(); }
    },
    setData() {
      const {
        totalBalance, totalBalanceSymbol,
        platformCoin, allCoinMap,
      } = this.exchangeData;
      this.totalBalanceSymbol = totalBalanceSymbol; // 折合币种
      if (platformCoin && platformCoin.length) {
        const obj = allCoinMap[platformCoin];
        if (obj && Number(obj.lock_position_balance)) {
          this.havePosition = true;
        }
      }
      if (this.baseData.switch.lock_position_v2_status
        && this.baseData.switch.lock_position_v2_status.toString() === '1') {
        this.positionV2 = true;
      }
      this.setDataList(allCoinMap, totalBalance);
    },
    switchChange() {
      this.switchFlag = !this.switchFlag;
      myStorage.set('assetsSwitch', this.switchFlag);
    },

    findChanges(v) {
      this.findValue = v;
    },
    tableClick(type, symbol) {
      if (type === 'goTrade') {
        if (symbol.code.toString().indexOf('/') === -1) { return; }
        myStorage.set('markTitle', symbol.code.split('/')[1]);
        myStorage.set('sSymbolName', symbol.code);
        // this.$router.push('/trade');
        window.location.href = this.tradeLinkUrl;
      } else if (type === 'goTradeIn') {
        // this.$router.push('/trade');
        window.location.href = this.tradeLinkUrl;
      } else if (type === 'recharge') {
        this.$router.push(`/assets/recharge?symbol=${symbol.id}`);
      } else if (type === 'withdraw') {
        this.$router.push(`/assets/withdraw?symbol=${symbol.id}`);
      } else if (type === 'manageFinances') {
        this.$router.push('/assets/manageFinances');
      }
    },
    setDataList(data) {
      const list = [];
      Object.keys(data).forEach((item) => {
        if (data[item].isFiat) {
          return;
        }
        // 该币种精度
        const { coinList, market } = this.market;
        const fix = (coinList[item] && coinList[item].showPrecision) || 0;
        // 资产折合精度
        const totle = this.totalBalanceSymbol;
        const btcFix = (coinList[totle] && coinList[totle].showPrecision) || 0;
        // 逻辑 1 如果 优先找出交易币种为当前货币的
        //     2 如果 1条件未筛选出，则去看当前货币是否为计价货币 把以该货币为计价货币的币对都加进去
        let selectOption = [];
        const by = [];
        Object.keys(market).forEach((v) => {
          Object.keys(market[v]).forEach((cv) => {
            const showSymbol = market[v][cv].showName || market[v][cv].name;
            if (cv.split('/')[0] === item) {
              selectOption.push({ value: showSymbol, code: market[v][cv].name });
            }
            if (v === item) {
              by.push({ value: showSymbol, code: market[v][cv].name });
            }
          });
        });
        if (selectOption.length === 0) {
          selectOption = by;
        }
        const arr = [];
        if (this.havePosition) {
          arr.push({ text: fixD(data[item].lock_position_balance, fix) });
        }
        if (this.positionV2) {
          arr.push(
            {
              text: fixD(data[item].lock_position_v2_amount, fix),
            },
          );
        }
        // if (this.havePosition || this.positionV2) {
        //   // 仅开启平台币锁仓
        //   if (this.havePosition && !this.positionV2) {
        //     arr = [
        //       {
        //         text: fixD(data[item].lock_position_balance, fix),
        //       },
        //     ];
        //   // 仅开启代币锁仓
        //   } else if (!this.havePosition && this.positionV2) {
        //     arr = [
        //       {
        //         text: fixD(data[item].lock_position_v2_amount, fix),
        //       },
        //     ];
        //   } else if (this.havePosition && this.positionV2) {
        //     const lockPositionBalance = data[item].lock_position_balance;
        //     const lockPositionV2Amount = data[item].lock_position_v2_amount;
        //     const num = Number(lockPositionBalance) + Number(lockPositionV2Amount);
        //     const selectList = [];
        //     if (Number(lockPositionBalance)) {
        //       selectList.push(
        //         `${this.$t('assets.exchangeAccount.positionBalance')}：
        //             ${fixD(lockPositionBalance, fix)}`,
        //       );
        //     }
        //     if (Number(lockPositionV2Amount)) {
        //       selectList.push(
        //         `${this.$t('assets.exchangeAccount.positionV2Amount')}：
        //           ${fixD(lockPositionV2Amount, fix)}`,
        //       );
        //     }
        //     arr = [
        //       num
        //         ? [{
        //           type: 'select', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
        //           iconSvg: `<span class="position">${fixD(num, fix)}</span>`,
        //           selectOption: selectList,
        //           iconClass: ['aaa'],
        //           eventType: '',
        //           selectWidth: '150',
        //         }] : fixD(num, fix),
        //     ];
        //   }
        // }
        const coinName = getCoinShowName(item, coinList);
        list.push({
          // id: data[item].sort,
          id: item,
          title: [
            {
              text: coinName,
            },
          ],
          handle: [
            data[item].coinName === this.baseData.financing_symbol
              ? {
                type: 'button', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                text: '去理财', // 去理财
                eventType: 'manageFinances',
              } : '',
            // 充值
            data[item].depositOpen
              ? {
                type: 'button',
                text: this.$t('assets.exchangeAccount.Recharge'), // 充值
                eventType: 'recharge',
              }
              : {
                type: 'button',
                text: this.$t('assets.exchangeAccount.Recharge'), // 充值
                disabled: true,
                // classes: ['tableNownStyle b-2-cl'],
              },
            // 提现
            data[item].withdrawOpen
              ? {
                type: 'button',
                text: this.$t('assets.exchangeAccount.withdraw'), // 充值
                eventType: 'withdraw',
              }
              : {
                type: 'button',
                text: this.$t('assets.exchangeAccount.withdraw'), // 充值
                disabled: true,
                // classes: ['tableNownStyle b-2-cl'],
              },
            selectOption.length
              ? {
                type: 'select', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                iconSvg: '<svg class="icon icon-16" aria-hidden="true"><use xlink:href="#icon-c_1"></use></svg>',
                selectOption,
                iconClass: [''],
                eventType: 'goTrade',
              } : {
                type: 'icon', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                iconSvg: '<span style="display: inline-block; width: 16px; height: 16px"></span>',
                // eventType: 'goTradeIn',
              },
          ],
          data: [
            {
              text: fixD(data[item].total_balance, fix),
            },
            {
              text: fixD(data[item].normal_balance, fix),
            },
            {
              text: fixD(data[item].lock_balance, fix),
            },
            ...arr,
            {
              text: fixD(data[item].btcValuatin, btcFix),
            },
          ],
        });
      });
      this.tabelLoading = false;
      this.tabelLength = list.length;
      this.dataList = list.sort((a, b) => a.id - b.id);
    },
  },
};
