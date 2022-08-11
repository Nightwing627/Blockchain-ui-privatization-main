import {
  fixD, getCoinShowName, colorMap, imgMap,
  formatTime,
} from '@/utils';

export default {
  name: 'page-flowingWater',
  data() {
    return {
      tabelLoading: true,
      imgMap,
      colorMap,
      nowType: 1, // 1为充值 2为提现 3为其他 4 创新试验区
      symbol: '', // 当前币种
      tabelList: [], // table数据列表
      financeListData: [],
      subTableDataId: '',
      subTableData: [],
      subContentId: null,
      symbolList: [], // 币种选择列表
      otherType: '', // 其他记录 type
      otherTypeList: [], // 其他记录 type选择列表
      otherTypeFirst: true,
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      revokeList: [], // 撤销队列
      currentIncomeType: '0',
      otherTypeInner: '0', // 其他记录 type
      topUpTypeInner: '0', // 其他记录 type
    };
  },
  computed: {
    incomeType() {
      return [{
        code: '0', value: this.$t('freeStaking.incomeFilter[0]'),
      }, {
        code: '1', value: this.$t('freeStaking.incomeFilter[2]'),
      }, {
        code: '2', value: this.$t('freeStaking.incomeFilter[1]'),
      }];
    },
    topUpTypeList() {
      return [{
        code: '0', value: this.$t('assets.otcFlowingWater.all'),
      }, {
        code: '1', value: this.$t('assets.flowingWater.type1'),
      }, {
        code: '2', value: this.$t('assets.flowingWater.type2'),
      }];
    },
    otherTypeListInner() {
      return [{
        code: '0', value: this.$t('assets.otcFlowingWater.all'),
      }, {
        code: '1', value: this.$t('assets.flowingWater.WithdrawalsRecord'),
      }, {
        code: '2', value: this.$t('assets.withdraw.innerList'),
      }];
    },
    freeStakingStatus() {
      return {
        1: this.$t('manageFinances.completed'),
      };
    },
    financialTypeStatus() {
      return {
        0: this.$t('freeStaking.incomeFilter[0]'),
        1: this.$t('freeStaking.incomeFilter[2]'),
        2: this.$t('freeStaking.incomeFilter[1]'),
      };
    },
    // 是否开启了freeStaking
    incrementConfigStatus() {
      return this.$store.state.baseData.incrementConfigStatus || 0;
    },
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
    },
    navTab() {
      const arr = [
        { name: this.$t('assets.flowingWater.RechargeRecord'), index: 1 }, // 充值记录
        { name: this.$t('assets.flowingWater.WithdrawalsRecord'), index: 2 }, // 提现记录
        { name: this.$t('assets.flowingWater.OtherRecords'), index: 3 }, // 其他记录
      ];
      if (this.newcoinOpen === '1') {
        arr.push({ name: this.$t('innov.innov_tit'), index: 4 }); // 创新试验区
      }
      if (this.incrementConfigStatus) {
        arr.push({ name: this.$t('manageFinances.record'), index: 5 }); // 理财记录
      }

      return arr;
    },
    // finance/account_balance 接口返回成功的数据
    exchangeData() {
      return this.$store.state.assets.exchangeData;
    },
    // market 接口
    market() {
      return this.$store.state.baseData.market;
    },
    // 表格title
    columns() {
      let list = [];
      if (this.nowType === 1) {
        list = [
          { title: this.$t('assets.flowingWater.RechargeTime'), width: '10%' }, // 充值时间
          { title: this.$t('assets.flowingWater.RechargeCoin'), width: '10%' }, // 币种
          {
            title: this.$t('assets.flowingWater.RechargeVolume'),
            width: '30%',
          }, // 充值数量
          {
            title: this.$t('assets.flowingWater.RechargeNumber'),
            width: '20%',
          }, // 确认次数
          {
            title: this.$t('assets.flowingWater.RechargeStatus'),
            width: '10%',
          }, // 状态
          {
            title: this.$t('assets.flowingWater.withdrawOptions'),
            width: '10%',
          }, // 操作
        ];
      }
      if (this.nowType === 2) {
        list = [
          { title: this.$t('assets.flowingWater.withdrawTime'), width: '10%' }, // 提现时间
          {
            title: this.$t('assets.flowingWater.otherCoin'),
            width: '10%',
            align: 'left',
          }, // 币种
          {
            title: this.$t('assets.flowingWater.withdrawVolume'),
            width: '10%',
          }, // 提币数量
          { title: this.$t('assets.flowingWater.withdrawFee'), width: '10%' }, // 网络手续费
          {
            title: this.$t('assets.flowingWater.withdrawRemarks'),
            width: '15%',
          }, // 标签
          {
            title: this.$t('assets.flowingWater.withdrawStatus'),
            width: '10%',
          }, // 状态
          {
            title: this.$t('assets.flowingWater.withdrawOptions'),
            width: '10%',
          }, // 操作
        ];
      }
      if (this.nowType === 3 || this.nowType === 5) {
        list = [
          { title: this.$t('assets.flowingWater.otherTime'), width: '10%' }, // 时间
          { title: this.$t('assets.flowingWater.otherCoin'), width: '10%' }, // 币种
          { title: this.$t('assets.flowingWater.otherType'), width: '25%' }, // 类型
          { title: this.$t('assets.flowingWater.otherVolume'), width: '25%' }, // 数量
          { title: this.$t('assets.flowingWater.otherStatus'), width: '20%' }, // 状态
        ];
      }

      return list;
    },
    subColumns() {
      let arr = [
        this.$t('assets.flowingWater.withdrawAddress'), // 地址
        this.$t('assets.flowingWater.updataAt'), // 钱包处理时间
        this.$t('assets.flowingWater.txid'), // 区块链交易ID
      ];
      if (this.nowType === 1) {
        arr = [
          this.$t('assets.flowingWater.rechargeAddress'), // 地址
          this.$t('assets.flowingWater.updataAt'), // 钱包处理时间
          this.$t('assets.flowingWater.txid'), // 区块链交易ID
        ];
      }
      return arr;
    },
    // 用于axios的symbol
    axiosSymbol() {
      if (this.symbol === 'all') {
        return null;
      }
      return this.symbol;
    },
    newcoinOpen() {
      return this.$store.state.baseData.newcoinOpen;
    },
    isInnerTransferOpen() {
      return this.$store.state.baseData.is_inner_transfer_open || 0;
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
  },
  methods: {
    init() {
      // 如果没有 finance/account_balance 接口返回成功的数据
      if (!this.exchangeData) {
        this.$store.dispatch('assetsExchangeData');
      }
      if (this.exchangeData && this.market) {
        this.setData();
      }
    },
    getFreeStaking() {
      this.axios({
        url: this.$store.state.url.freeStaking.financial_management,
        headers: {},
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          gainCoin: this.axiosSymbol || '',
          financialType: Number(this.currentIncomeType),
        },
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          const { financeList, count } = data.data;
          const list = financeList.map((item, index) => {
            const { coinList } = this.market;
            const currentCoin = coinList[item.gainCoin];
            const fix = currentCoin ? currentCoin.showPrecision : 0;

            // const showCoin = getCoinShowName(item.coinSymbol, coinList);
            return {
              id: index,
              data: [
                item.time, // 时间
                item.gainCoin, // 币种
                this.financialTypeStatus[item.financialType], // 类型
                fixD(item.amount, fix), // 数量
                this.freeStakingStatus[item.status], // 状态
              ],
            };
          });

          this.tabelList = list;
          this.paginationObj.total = count;
        }
        this.tabelLoading = false;
      });
    },
    getOtherTypeList() {
      this.axios({
        url: 'record/other_transfer_scene',
      }).then((data) => {
        if (data.code.toString() === '0') {
          const { cenceList } = data.data;
          const list = [];
          cenceList.forEach((item) => {
            list.push({ code: item.key, value: item.key_text });
          });
          this.otherTypeList = list;
          if (list.length) {
            this.otherType = list[0].code;
          }
          this.getData();
        }
      });
    },
    symbolChange(item) {
      this.symbol = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    otherTypeChange(item) {
      this.otherType = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    otherTypeChangeInner(item) {
      this.otherTypeInner = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    topUpTypeChange(item) {
      this.topUpTypeInner = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    setIncomeType(item) {
      this.currentIncomeType = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    // tab切换
    currentType(item) {
      this.nowType = item.index;
      // this.symbol = 'all'
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      if (item.index !== 4) {
        this.tabelLoading = true;
      }
      if (item.index === 3) {
        if (this.otherTypeFirst) {
          // 获取其他记录中选择类型的列表
          this.getOtherTypeList();
          this.otherTypeFirst = false;
        } else {
          this.getData();
        }
      }
      if (item.index !== 3) {
        this.getData();
      }
    },
    setData() {
      const list = [
        { code: 'all', value: this.$t('assets.flowingWater.allCoin') },
      ];
      const { coinList } = this.market;
      Object.keys(this.exchangeData.allCoinMap).forEach((item) => {
        if (this.exchangeData.allCoinMap[item].isFiat) {
          return;
        }
        const showCoin = getCoinShowName(item, coinList);

        list.push({ code: item, value: showCoin });
      });
      this.symbolList = list;
      this.symbol = 'all';
      this.getData();
    },
    getData() {
      if (this.nowType === 1) {
        this.rechargeData();
      } else if (this.nowType === 2) {
        this.withdrawData();
      } else if (this.nowType === 5) {
        this.getFreeStaking();
      } else if (this.nowType === 3) {
        this.otherData();
      }
    },
    pagechange(v) {
      this.paginationObj.currentPage = v;
      this.getData();
    },
    // 撤销操作
    tableClick(type, id) {
      if (type === 'revoke') {
        let even = {};
        this.tabelList.forEach((item) => {
          if (item.id === id) {
            even = item;
          }
        });
        if (this.revokeList.indexOf(even.id) === -1) {
          this.revokeList.push(even.id);
          this.axios({
            url: '/finance/cancel_withdraw',
            headers: {},
            params: {
              withdrawId: even.id,
            },
            method: 'post',
          }).then((data) => {
            const ind = this.revokeList.indexOf(even.id);
            this.revokeList.splice(ind, 1);
            if (data.code.toString() === '0') {
              this.getData();
              this.$bus.$emit('tip', { text: data.msg, type: 'success' });
            } else {
              this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            }
          });
        }
      }
      if (type === 'subView') {
        this.subTableDataId = id.id;
        this.subTableData = [];
        this.financeListData.forEach((item) => {
          if (item.id === this.subTableDataId) {
            let address = item.addressTo;
            let txidadd = item.txid;
            if (this.isHavePage) {
              const [newAddress] = address.split('_');
              address = newAddress;
            }
            if (
              this.publicInfo.switch.open_txid_addr_jump
              && this.publicInfo.switch.open_txid_addr_jump === '1'
              && item.txidAddr
            ) {
              const txid = `<a href='${item.txidAddr}' target='_blank' class='b-4-cl'>${item.txid}</a>`;
              txidadd = txid;
            }
            this.subTableData.push([
              address, // 地址
              item.walletTime ? formatTime(item.walletTime) : '---',
              txidadd || '---',
            ]);
          }
        });
      }
    },
    // 充值数据
    rechargeData() {
      this.axios({
        url: 'record/new_deposit_list',
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          coinSymbol: this.axiosSymbol,
          type: this.topUpTypeInner === '0' ? null : Number(this.topUpTypeInner), // 类型
        },
      }).then((data) => {
        if (this.nowType !== 1) return;
        if (data.code.toString() === '0') {
          const list = [];
          this.financeListData = data.data.financeList.map((item) => ({
            ...item,
            id: item.createdAtTime,
          }));
          data.data.financeList.forEach((item) => {
            const { coinList } = this.market;
            const fix = (coinList[item.symbol] && coinList[item.symbol].showPrecision)
              || 0;
            const showCoin = getCoinShowName(item.symbol, coinList);
            list.push({
              id: item.createdAtTime,
              data: [
                item.createdAt, // 时间
                showCoin, // 币种
                fixD(item.amount, fix), // 充值数量
                item.confirmDesc, // 确认次数
                item.status_text, // 状态
                this.handleButton(item),
              ],
            });
          });
          this.tabelLoading = false;
          this.tabelList = list;
          this.paginationObj.total = data.data.count;
        }
      });
    },
    // 提现数据
    withdrawData() {
      this.axios({
        url: 'record/new_withdraw_list',
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          coinSymbol: this.axiosSymbol,
          type: this.otherTypeInner === '0' ? null : Number(this.otherTypeInner), // 类型
        },
      }).then((data) => {
        if (this.nowType !== 2) return;
        if (data.code.toString() === '0') {
          const list = [];
          this.financeListData = data.data.financeList;
          data.data.financeList.forEach((item) => {
            const { coinList } = this.market;
            const fix = (coinList[item.symbol] && coinList[item.symbol].showPrecision)
              || 0;
            const showCoin = getCoinShowName(item.symbol, coinList);
            list.push({
              id: item.id,
              data: [
                item.createdAt, // 时间
                showCoin, // 币种
                // address, // 地址
                fixD(item.amount, fix), // 充值数量
                fixD(item.fee, fix), // 手续费
                item.label, // 备注
                item.status_text, // 状态
                this.handleButton(item),
              ],
            });
          });
          this.tabelLoading = false;
          this.tabelList = list;
          this.paginationObj.total = data.data.count;
        }
      });
    },
    handleButton(item) {
      const arr = [];
      if (item.status === 0 && this.nowType === 2 && item.type === '1') {
        arr.push({
          type: 'button', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
          text: this.$t('assets.flowingWater.Cancel'),
          iconClass: [''],
          eventType: 'revoke',
        });
      }
      arr.push({
        type: 'subTable',
        classes: 'u-8-cl',
        text: this.$t('trade.view'), // 详情
        eventType: 'subView',
      });
      return arr;
    },
    // 其他数据
    otherData() {
      this.axios({
        url: 'record/other_transfer_list',
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          coinSymbol: this.axiosSymbol,
          transactionScene: this.otherType,
        },
      }).then((data) => {
        if (this.nowType !== 3) return;
        if (data.code.toString() === '0') {
          const { financeList, count } = data.data;
          const list = [];
          financeList.forEach((item, index) => {
            const { coinList } = this.market;
            const fix = (coinList[item.coinSymbol]
                && coinList[item.coinSymbol].showPrecision)
              || 0;
            const showCoin = getCoinShowName(item.coinSymbol, coinList);
            list.push({
              id: index,
              data: [
                item.createTime, // 时间
                showCoin, // 币种
                item.transactionScene, // 类型
                fixD(item.amount, fix), // 数量
                item.status_text, // 状态
              ],
            });
          });

          this.tabelLoading = false;
          this.tabelList = list;
          this.paginationObj.total = count;
        }
      });
    },
  },
};
