import {
  myStorage, fixD, fixRate, getCoinShowName, colorMap, imgMap,
} from '@/utils';

export default {
  name: 'page-exchangeAccount',
  data() {
    return {
      tabelLoading: true,
      exchangeHeader: `background: url(${imgMap.zc_ex})`,
      tabelLength: 20,
      imgMap,
      colorMap,
      switchFlag: false, // 是否隐藏零资产
      findValue: '', // 搜索框内容
      dataList: [],
      totalBalance: '--', // 总资产折合
      totalRate: '--', // 折合法币
      totalBalanceSymbol: '', // 总资产折合单位
      colors: [
        'rgba(255, 255, 255, 1)',
        'rgba(255, 255, 255, 0.8)',
        'rgba(255, 255, 255, 0.6)',
        'rgba(255, 255, 255, 0.4)',
        'rgba(255, 255, 255, 0.25)',
        'rgba(255, 255, 255, 0.1)',
      ],
      // colors: ['red', 'blue', 'pink', 'green', '#fff', '#000'],
      canvasPages: [],
      havePosition: false, // 平台锁仓
      positionV2: false, // 代币锁仓
      positionV3: false, // 理财锁仓
      searchTimer: null,
      searchListResult: [],
      search: false,
      isShowDialog: false,
    };
  },
  computed: {
    baseData() {
      return this.$store.state.baseData.publicInfo;
    },
    isCoOpen() {
      const base = this.$store.state.baseData.publicInfo;
      if (base && base.switch && base.switch.indep_co_switch === '1') {
        return true;
      }
      return false;
    },
    // 提现是否开启了必须实名认证
    withdrawKycOpen() {
      let isOpen = 0;
      if (this.baseData && this.baseData.kycLimitConfig) {
        isOpen = this.baseData.kycLimitConfig.withdraw_kyc_open;
      }
      return Number(isOpen);
    },
    // 充值是否开启了必须实名认证
    depositeKycOpen() {
      let isOpen = 0;
      if (this.baseData && this.baseData.kycLimitConfig) {
        isOpen = this.baseData.kycLimitConfig.deposite_kyc_open;
      }
      return Number(isOpen);
    },
    // 用户信息
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    // 认证信息
    idAuth() {
      let idAuth = 0;
      if (this.userInfo) {
        idAuth = Number(this.userInfo.authLevel);
      }
      return idAuth;
    },
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    tradeLinkUrl() {
      if (process.env.NODE_ENV === 'development') {
        return this.isCoOpen ? '/co/trade' : '/ex/trade';
      }
      if (this.$store.state.baseData && this.$store.state.baseData.publicInfo) {
        return this.isCoOpen ? `${this.linkurl.coUrl}/trade` : `${this.linkurl.exUrl}/trade`;
      }
      return '';
    },
    // 表格title
    columns() {
      let arr = [];
      if (this.havePosition || this.positionV2 || this.positionV3) {
        arr = [{ title: this.$t('assets.exchangeAccount.position'), width: '' }];
      }
      return [
        { title: this.$t('assets.exchangeAccount.coin'), width: '100px' }, // 币种
        { title: this.$t('assets.exchangeAccount.lumpSum'), width: '' }, // 总额
        { title: this.$t('assets.exchangeAccount.Available'), width: '' }, // 可用
        { title: this.$t('assets.exchangeAccount.freeze'), width: '' }, // 冻结
        ...arr,
        {
          title: `${this.$t('assets.exchangeAccount.AssetFolding')}(${
            this.showTotalBalanceSymbol
          })`,
          width: '',
        }, // 资产折合
        { title: this.$t('assets.exchangeAccount.options'), width: '200px' }, // 操作
      ];
    },
    // finance/account_balance 接口返回成功的数据
    exchangeData() {
      return this.$store.state.assets.exchangeData;
    },
    // market 接口
    market() {
      return this.$store.state.baseData.market;
    },
    // 饼图 数据（包含饼图 和 指标）
    canvasPagesFilter() {
      const arr = [];
      // 去除零资产
      const list = this.canvasPages.filter((item) => parseFloat(item.spk) > 0);
      // 排序
      list.sort(this.compare('spk'));
      // 非0资产的币种少于6种时
      if (list.length < 6) {
        list.forEach((item, index) => {
          const { coinList } = this.market;
          const coinName = getCoinShowName(item.symbol, coinList);
          arr.push({
            ...item,
            symbol: coinName,
            color: this.colors[index],
          });
        });
        // 非0资产的币种多于等于6种时
      } else if (list.length >= 6) {
        let evenSum = 0;
        // 选出前五个
        list.forEach((item, index) => {
          if (index < 5) {
            const { coinList } = this.market;
            const coinName = getCoinShowName(item.symbol, coinList);
            arr.push({
              ...item,
              symbol: coinName,
              color: this.colors[index],
            });
          } else {
            evenSum += item.spk;
          }
        });
        // 剩余币种归纳为其他
        arr.push({
          symbol: this.$t('assets.exchangeAccount.other'), // 其他
          spk: evenSum,
          color: this.colors[5],
        });
      }
      return arr;
    },
    showTotalBalanceSymbol() {
      let str = this.totalBalanceSymbol;
      if (
        this.market
        && this.market.coinList
        && this.market.coinList[this.totalBalanceSymbol]
      ) {
        str = getCoinShowName(this.totalBalanceSymbol, this.market.coinList);
      }
      return str;
    },
  },
  watch: {
    exchangeData(v) {
      if (v && this.market) {
        this.setData();
      }
    },
    market(v) {
      if (v && this.exchangeData) {
        this.setData();
      }
    },
    canvasPagesFilter(v) {
      if (v.length === 0) {
        this.canvasInit();
      } else {
        this.canvasMap();
      }
    },
  },
  methods: {
    init() {
      if (myStorage.get('assetsSwitch')) {
        this.switchFlag = myStorage.get('assetsSwitch');
      }
      this.canvasInit();
      this.$store.dispatch('assetsExchangeData');
      if (this.exchangeData && this.market) {
        this.setData();
      }
    },
    setData() {
      const {
        totalBalance,
        totalBalanceSymbol,
        platformCoin,
        allCoinMap,
      } = this.exchangeData;

      this.positionV3 = Object.keys(allCoinMap).some(
        (key) => Number(allCoinMap[key].lock_increment_amount) > 0,
      );
      const { coinList, rate } = this.market;
      const fix = (coinList[totalBalanceSymbol]
          && coinList[totalBalanceSymbol].showPrecision)
        || 0;
      this.totalBalance = fixD(totalBalance, fix); // 折合资产
      this.totalBalanceSymbol = totalBalanceSymbol; // 折合币种
      this.totalRate = fixRate(totalBalance, rate, totalBalanceSymbol); // 折合法币
      if (platformCoin && platformCoin.length) {
        const obj = allCoinMap[platformCoin];
        if (obj && Number(obj.lock_position_balance)) {
          this.havePosition = true;
        }
      }
      if (
        this.baseData.switch.lock_position_v2_status
        && this.baseData.switch.lock_position_v2_status.toString() === '1'
      ) {
        this.positionV2 = true;
      }
      this.setDataList(allCoinMap, totalBalance);
    },
    compare(property) {
      return function fn(a, b) {
        const value1 = a[property];
        const value2 = b[property];
        return value2 - value1;
      };
    },
    switchChange() {
      this.switchFlag = !this.switchFlag;
      myStorage.set('assetsSwitch', this.switchFlag);
      this.findChanges(this.findValue);
    },
    canvasMap() {
      const ctx = this.$refs.canvas.getContext('2d');
      this.$refs.canvas.width = 100;
      this.$refs.canvas.height = 100;
      let start = 0;
      this.canvasPagesFilter.forEach((item) => {
        let spk = start + item.spk * 2;
        if (start >= 2) {
          return;
        } // 防止 2-xx的值
        if (spk > 2) {
          spk = 2;
        } // 防止 1.x - 2.x的值
        ctx.beginPath();
        ctx.moveTo(50, 50);
        ctx.fillStyle = item.color;
        ctx.arc(50, 50, 50, Math.PI * start, Math.PI * spk);
        ctx.closePath();
        ctx.fill();
        start = spk;
      });
      ctx.beginPath();
      ctx.moveTo(50, 50);
      ctx.fillStyle = '#294EBB';
      ctx.arc(50, 50, 35, Math.PI * 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    },
    canvasInit() {
      const ctx = this.$refs.canvas.getContext('2d');
      this.$refs.canvas.width = 100;
      this.$refs.canvas.height = 100;
      ctx.beginPath();
      ctx.moveTo(50, 50);
      ctx.fillStyle = '#e0e0e0';
      ctx.arc(50, 50, 50, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(50, 50);
      ctx.fillStyle = '#294EBB';
      ctx.arc(50, 50, 35, Math.PI * 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    },
    findChanges(v) {
      this.findValue = v;
      if (this.searchTimer) clearTimeout(this.searchTimer);
      if (v !== '') {
        this.searchTimer = setTimeout(() => {
          const result = this.dataList.filter((item) => {
            const isSamll = !this.switchFlag || (this.switchFlag && item.classes !== 'smail-account');
            const isSearch = isSamll && item.data[0].toUpperCase().indexOf(v.toUpperCase()) !== -1;
            return isSearch;
          });
          this.searchListResult = result;
          this.search = true;
        }, 400);
      } else {
        this.search = false;
      }
    },
    tableClick(type, symbol) {
      // 提现
      if (type === 'withdraw') {
        // 如果开启了必须认证 并且 未认证成功 禁止提现
        if (this.withdrawKycOpen && this.idAuth !== 1) {
          this.isShowDialog = true;
        } else {
          this.$router.push(`withdraw?symbol=${symbol}`);
        }
      }
      // 充值
      if (type === 'recharge') {
        if (this.depositeKycOpen && this.idAuth !== 1) {
          this.isShowDialog = true;
        } else {
          this.$router.push(`recharge?symbol=${symbol}`);
        }
      }
      if (type === 'goTrade') {
        const mSymbol = symbol.code;
        if (mSymbol.toString().indexOf('/') === -1) {
          return;
        }
        myStorage.set('markTitle', mSymbol.split('/')[1]);
        myStorage.set('sSymbolName', mSymbol);
        // this.$router.push('/trade');
        window.location.href = this.tradeLinkUrl;
      } else if (type === 'goTradeIn') {
        // this.$router.push('/trade');
        window.location.href = this.tradeLinkUrl;
      }
    },
    // 弹框取消
    dialogClose() {
      this.isShowDialog = false;
    },
    // 去认证
    gotoAuth() {
      this.$router.push('/personal/userManagement');
    },
    setDataList(data, sum) {
      const list = [];
      const canvasList = [];
      Object.keys(data).forEach((item) => {
        if (data[item].isFiat) {
          return;
        }
        canvasList.push({
          symbol: item,
          spk: data[item].allBtcValuatin / sum,
        });
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
              selectOption.push({
                value: showSymbol,
                code: market[v][cv].name,
              });
            }
            if (v === item) {
              by.push({ value: showSymbol, code: market[v][cv].name });
            }
          });
        });
        if (selectOption.length === 0) {
          selectOption = by;
        }
        let arr = [];

        // 平台币锁仓数量
        const lockPositionBalance = data[item].lock_position_balance || '0';
        // 代币锁仓数量
        const lockPositionV2Amount = data[item].lock_position_v2_amount || '0';
        // 理财锁仓数量
        const lockIncrementAmount = data[item].lock_increment_amount || '0';
        // // 判断当前锁仓类型大于一个的时候
        if (this.havePosition || this.positionV2 || this.positionV3) {
          const num = Number(lockPositionBalance)
            + Number(lockPositionV2Amount)
            + Number(lockIncrementAmount);

          const selectList = [];
          if (Number(lockPositionBalance)) {
            selectList.push(
              `${this.$t('assets.exchangeAccount.positionBalance')}：
                    ${fixD(lockPositionBalance, fix)}`,
            );
          }
          if (Number(lockPositionV2Amount)) {
            selectList.push(
              `${this.$t('assets.exchangeAccount.positionV2Amount')}：
                  ${fixD(lockPositionV2Amount, fix)}`,
            );
          }
          if (Number(lockIncrementAmount)) {
            selectList.push(
              `${this.$t('assets.exchangeAccount.incomeLock')}：${fixD(
                lockIncrementAmount,
                fix,
              )}`,
            );
          }

          arr = [
            num
              ? [
                {
                  type: 'select',
                  iconSvg: `<span class="position">${fixD(num, fix)}</span>`,
                  selectOption: selectList,
                  iconClass: ['aaa'],
                  eventType: '',
                  selectWidth: '150',
                },
              ]
              : fixD(num, fix),
          ];
        }

        const coinName = getCoinShowName(item, coinList);
        let showUnlockSell = false;
        if (
          coinList[item]
          && coinList[item].isOvercharge
          && coinList[item].isOvercharge.toString() === '1'
        ) {
          showUnlockSell = true;
        }
        const btcValuation = fixD(data[item].allBtcValuatin, btcFix);
        list.push({
          // id: data[item].sort,
          id: item,
          btcValuation,
          classes: btcValuation >= 0.0001 ? '' : 'smail-account',
          data: [
            coinName,
            fixD(data[item].total_balance, fix),
            showUnlockSell
              ? [
                {
                  text: fixD(data[item].normal_balance, fix),
                  subContent: {
                    text: `${fixD(
                      data[item].overcharge_balance || 0,
                      fix,
                    )} (${this.$t('assets.exchangeAccount.limit')})`,
                    classes: 'showUnlockSell',
                  },
                },
              ]
              : fixD(data[item].normal_balance, fix),
            fixD(data[item].lock_balance, fix),
            ...arr,
            fixD(data[item].allBtcValuatin, btcFix),
            [
              data[item].coinName === this.baseData.financing_symbol
                ? {
                  type:
                      data[item].coinName === this.baseData.financing_symbol
                        ? 'link'
                        : 'label', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                  text: '去理财', // 去理财
                  links: '/manageFinances',
                  classes: [
                    data[item].coinName === this.baseData.financing_symbol
                      ? ''
                      : 'tableNownStyle b-2-cl',
                  ],
                }
                : '',
              {
                type: data[item].depositOpen ? 'button' : 'label', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                text: this.$t('assets.exchangeAccount.Recharge'), // 充值
                links: `recharge?symbol=${item}`,
                eventType: 'recharge',
                classes: [data[item].depositOpen ? '' : 'tableNownStyle b-2-cl'],
              },
              {
                type: data[item].withdrawOpen ? 'button' : 'label', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                text: this.$t('assets.exchangeAccount.withdraw'), // 提现
                links: `withdraw?symbol=${item}`,
                eventType: 'withdraw',
                classes: [
                  data[item].withdrawOpen
                    ? ''
                    : 'tableNownStyle tableTithDraw b-2-cl',
                ],
              },
              selectOption.length
                ? {
                  type: 'select', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                  iconSvg:
                      '<svg class="icon icon-16" aria-hidden="true"><use xlink:href="#icon-c_1"></use></svg>',
                  selectOption,
                  iconClass: [''],
                  eventType: 'goTrade',
                }
                : {
                  type: 'icon', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                  iconSvg:
                      '<span style="display: inline-block; width: 16px; height: 16px"></span>',
                  // eventType: 'goTradeIn',
                },
            ],
          ],
        });
      });
      this.canvasPages = canvasList;
      this.tabelLoading = false;
      this.tabelLength = list.length;
      this.dataList = list.sort((a, b) => a.id - b.id);
      // this.smailData = this.dataList.filter(item => parseFloat(item.btcValuation) >= 0.0001);
    },
  },
};
