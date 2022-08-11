import { fixD, getCoinShowName } from '@/utils';

export default {
  name: 'page-flowingWater',
  data() {
    return {
      tabelLoading: true,
      nowType: 1, // 1为充值 2为提现 3为其他 4 创新试验区
      symbol: '', // 当前币种
      defineSymbol: '', // 默认币种
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
      pullUpState: 0,
    };
  },
  computed: {
    navList() {
      return [
        {
          text: this.$t('assets.exchangeAccount.ListOfFunds'),
          link: 'assets/exchangeAccount',
        },
        {
          text: this.$t('assets.index.flowingWater'),
          active: true,
          link: 'assets/flowingWater',
        },
        {
          text: this.$t('assets.index.addressMent'),
          link: 'assets/addressMent',
        },
      ];
    },
    publicInfo() { return this.$store.state.baseData.publicInfo; },
    navTab() {
      const arr = [
        { name: this.$t('assets.flowingWater.RechargeRecord'), index: 1 }, // 充值记录
        { name: this.$t('assets.flowingWater.WithdrawalsRecord'), index: 2 }, // 提现记录
        { name: this.$t('assets.flowingWater.OtherRecords'), index: 3 }, // 其他记录
      ];
      if (this.newcoinOpen === '1') {
        arr.push({ name: this.$t('innov.innov_tit'), index: 4 }); // 创新试验区
      }
      return arr;
    },
    // finance/account_balance 接口返回成功的数据
    exchangeData() { return this.$store.state.assets.exchangeData; },
    // market 接口
    market() { return this.$store.state.baseData.market; },
    // 表格title
    columns() {
      let list = [];
      if (this.nowType === 1) {
        list = [
          { title: this.$t('assets.flowingWater.RechargeTime'), width: '10%' }, // 充值时间
          // { title: this.$t('assets.flowingWater.RechargeCoin'), width: '10%' }, // 币种
          { title: this.$t('assets.flowingWater.RechargeVolume'), width: '30%' }, // 充值数量
          { title: this.$t('assets.flowingWater.RechargeNumber'), width: '20%' }, // 确认次数
          { title: this.$t('assets.flowingWater.RechargeStatus'), width: '10%' }, // 状态
        ];
      } if (this.nowType === 2) {
        list = [
          { title: this.$t('assets.flowingWater.withdrawTime'), width: '10%' }, // 提现时间
          { title: this.$t('assets.flowingWater.withdrawVolume'), width: '10%' }, // 提币数量
          { title: this.$t('assets.flowingWater.withdrawFee'), width: '10%' }, // 网络手续费
          { title: this.$t('assets.flowingWater.withdrawRemarks'), width: '15%' }, // 标签
          { title: this.$t('assets.flowingWater.withdrawStatus'), width: '10%' }, // 状态
        ];
      } if (this.nowType === 3) {
        list = [
          { title: this.$t('assets.flowingWater.otherTime'), width: '10%' }, // 时间
          { title: this.$t('assets.flowingWater.otherType'), width: '25%' }, // 类型
          { title: this.$t('assets.flowingWater.otherVolume'), width: '25%' }, // 数量
          { title: this.$t('assets.flowingWater.otherStatus'), width: '20%' }, // 状态
        ];
      }
      return list;
    },
    subColumns() {
      return [
        this.$t('assets.flowingWater.withdrawAddress'), // 地址
        this.$t('assets.flowingWater.updataAt'), // 钱包处理时间
        this.$t('assets.flowingWater.txid'), // 区块链交易ID
      ];
    },
    // 用于axios的symbol
    axiosSymbol() {
      if (this.symbol === 'all') {
        return undefined;
      }
      return this.symbol;
    },
    newcoinOpen() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.switch.newcoinOpen;
      }
      return null;
    },
  },
  watch: {
    exchangeData(v) { if (v && this.market) { this.setData(); } },
    market(v) { if (v && this.exchangeData) { this.setData(); } },
  },
  methods: {
    init() {
      const { type, coin } = this.$route.query;
      if (type && coin) {
        this.nowType = Number(type);
        this.defineSymbol = coin;
      }
      // 如果没有 finance/account_balance 接口返回成功的数据
      if (!this.exchangeData) {
        this.$store.dispatch('assetsExchangeData');
      }
      if (this.exchangeData && this.market) { this.setData(); }
    },
    // 下拉刷新
    onRefresh(done) {
      this.tabelList = [];
      this.tabelLoading = true;
      this.paginationObj.currentPage = 1;
      this.getData();
      done();
    },
    onInfiniteLoads(done) {
      if (this.pullUpState === 0) {
        this.pullUpState = 2;
        this.paginationObj.currentPage += 1;
        this.getData();
      }
      done();
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
      this.pullUpState = 0;
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    otherTypeChange(item) {
      this.otherType = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.pullUpState = 0;
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
      this.pullUpState = 0;
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
      const list = [{ code: 'all', value: this.$t('assets.flowingWater.allCoin') }];
      let defineCoin = null;
      const { coinList } = this.market;
      Object.keys(this.exchangeData.allCoinMap).forEach((item) => {
        if (this.exchangeData.allCoinMap[item].isFiat) {
          return;
        }
        const showCoin = getCoinShowName(item, coinList);
        list.push({ code: item, value: showCoin });
        if (item === this.defineSymbol.toUpperCase()) {
          defineCoin = item;
        }
      });
      this.symbolList = list;
      this.symbol = defineCoin || 'all';
      this.getData();
    },
    getData() {
      if (this.nowType === 1) {
        this.rechargeData();
      } else if (this.nowType === 2) {
        this.withdrawData();
      } else {
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
          if (item.id === id.id) {
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
              this.tabelList = [];
              this.paginationObj.currentPage = 1;
              this.tabelLoading = true;
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
            if (this.publicInfo.switch.open_txid_addr_jump && this.publicInfo.switch.open_txid_addr_jump === '1') {
              const txid = `<a href='${item.txidAddr}' target='_blank' class='b-4-cl'>${item.txid}</a>`;
              txidadd = txid;
            }
            this.subTableData.push([
              address, // 地址
              item.updateAt || '---',
              txidadd || '---',
            ]);
          }
        });
      }
    },
    // 充值数据
    rechargeData() {
      this.axios({
        url: 'record/deposit_list',
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          coinSymbol: this.axiosSymbol,
        },
      }).then((data) => {
        if (this.nowType !== 1) return;
        if (data.code.toString() === '0') {
          const list = [];
          this.financeListData = data.data
            .financeList.map((item, index) => ({ ...item, id: index }));
          data.data.financeList.forEach((item, index) => {
            const { coinList } = this.market;
            const fix = (coinList[item.symbol] && coinList[item.symbol].showPrecision) || 0;
            const showCoin = getCoinShowName(item.symbol, coinList);
            list.push({
              id: index,
              title: [
                {
                  text: showCoin,
                },
              ],
              handle: this.handleButton(item),
              data: [
                item.createdAt, // 时间
                fixD(item.amount, fix), // 充值数量
                item.confirmDesc, // 确认次数
                item.status_text, // 状态
                // this.handleButton(item),
              ],
            });
          });
          this.tabelLoading = false;
          this.tabelList = [...[], ...this.tabelList, ...list];
          if (Math.ceil(parseFloat(data.data.count) / parseFloat(this.paginationObj.display))
            > this.paginationObj.currentPage) {
            this.pullUpState = 0;
          } else {
            this.pullUpState = 3;
          }
          // this.paginationObj.total = data.data.count;
        } else {
          this.pullUpState = 0;
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 提现数据
    withdrawData() {
      this.axios({
        url: 'record/withdraw_list',
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          coinSymbol: this.axiosSymbol,
        },
      }).then((data) => {
        if (this.nowType !== 2) return;
        if (data.code.toString() === '0') {
          const list = [];
          this.financeListData = data.data.financeList;
          data.data.financeList.forEach((item) => {
            const { coinList } = this.market;
            const fix = (coinList[item.symbol] && coinList[item.symbol].showPrecision) || 0;
            const showCoin = getCoinShowName(item.symbol, coinList);
            list.push({
              id: item.id,
              title: [
                {
                  text: showCoin,
                },
              ],
              handle: this.handleButton(item),
              data: [
                item.createdAt, // 时间
                // item.symbol, // 币种
                // address, // 地址
                fixD(item.amount, fix), // 充值数量
                fixD(item.fee, fix), // 手续费
                item.label, // 备注
                item.status_text, // 状态
                // this.handleButton(item),
              ],
            });
          });
          this.tabelLoading = false;
          this.tabelList = [...[], ...this.tabelList, ...list];
          if (Math.ceil(parseFloat(data.data.count) / parseFloat(this.paginationObj.display))
            > this.paginationObj.currentPage) {
            this.pullUpState = 0;
          } else {
            this.pullUpState = 3;
          }
          // this.paginationObj.total = data.data.count;
        } else {
          this.pullUpState = 0;
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    handleButton(item) {
      const arr = [];
      if (item.status === 0 && this.nowType === 2) {
        arr.push({
          type: 'button', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
          text: this.$t('assets.flowingWater.Cancel'),
          iconClass: [''],
          eventType: 'revoke',
        });
      }
      // arr.push({
      //   type: 'subTable',
      //   classes: 'u-8-cl',
      //   text: this.$t('trade.view'), // 详情
      //   eventType: 'subView',
      // });
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
          const { financeList } = data.data;
          const list = [];
          financeList.forEach((item, index) => {
            const { coinList } = this.market;
            const fix = (coinList[item.coinSymbol] && coinList[item.coinSymbol].showPrecision) || 0;
            const showCoin = getCoinShowName(item.coinSymbol, coinList);
            list.push({
              id: index,
              title: [
                {
                  text: showCoin,
                },
              ],
              data: [
                item.createTime, // 时间
                item.transactionScene, // 类型
                fixD(item.amount, fix), // 数量
                item.status_text, // 状态
              ],
            });
          });
          this.tabelLoading = false;
          this.tabelList = [...[], ...this.tabelList, ...list];
          if (Math.ceil(parseFloat(data.data.count) / parseFloat(this.paginationObj.display))
            > this.paginationObj.currentPage) {
            this.pullUpState = 0;
          } else {
            this.pullUpState = 3;
          }
          // this.paginationObj.total = data.data.count;
        } else {
          this.pullUpState = 0;
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
  },
};
