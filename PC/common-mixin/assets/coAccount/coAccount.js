import {
  fixD, colorMap, imgMap,
} from '@/utils';

export default {
  name: 'page-coAccount',
  data() {
    return {
      showFlag: false,
      tabelInfoData: [], // 列表元素数据
      detailsData: {}, // 账户详情
      tabelLoading: true,
      imgMap,
      colorMap,
      transferSide: '1',
      transferValue: '',
      dialogConfirmLoading: false,
      // openContract:true,
      // transStatus:0,
      symbol: null,
      // 开通合约交易弹框
      openFuturesDialogShow: false,
    };
  },
  filters: {
    fixDFn(v, that) {
      return fixD(v, that.detailsData.showPrecision);
    },
  },
  watch: {
    // 监听 用户配置信息
    openContract(val) {
      if (!val) {
        this.openFuturesDialogShow = true;
      }
    },

  },
  computed: {
    // 是否开通合约
    openContract() {
      if (this.$store.state.future) {
        return this.$store.state.future.openContract;
      }
      return true;
    },
    // 是否被冻结
    transStatus() {
      if (this.$store.state.future) {
        return this.$store.state.future.transStatus;
      }
      return true;
    },
    // 币种信息
    marginCoinInfor() {
      if (this.$store.state.future.marginCoinInfor) {
        return this.$store.state.future.marginCoinInfor;
      }
      return {};
    },
    // 合约列表
    contractList() {
      if (this.$store.state.future.contractList) {
        return this.$store.state.future.contractList;
      }
      return [];
    },
    userInfo() {
      if (this.$store.state.baseData.userInfo) {
        return this.$store.state.baseData.userInfo;
      }
      return {};
    },
    // 表格数据
    tableData() {
      const arr = [];
      this.tabelInfoData.forEach((item) => {
        const precision = this.marginCoinInfor[item.symbol].marginCoinPrecision;
        arr.push({
          id: JSON.stringify(item),
          data: [
            item.symbol, // 币种
            fixD(item.canUseAmount, precision), // 可用s
            fixD(item.totalAmount, precision), // 总资产
            fixD(item.totalMargin, precision), // 全仓保证金
            fixD(item.isolateMargin, precision), // 逐仓保证金
            fixD(item.lockAmount, precision), // 冻结保证金
            // fixD(item.realizedAmount, precision), // 已实现盈亏
            // fixD(item.unRealizedAmount, precision), // 未实现盈亏
            [
              {
                type: this.transStatus ? 'button' : 'label',
                text: this.$t('futures.coAccount.transfer'), // 划转
                eventType: 'clickDialog',
                classes: [
                  this.transStatus
                    ? ''
                    : 'tableNownStyle tableTithDraw b-2-cl',
                ],
              },
            ],
          ],
        });
      });
      return arr;
    },
    // 表格title
    columns() {
      return [
        { title: this.$t('futures.coAccount.coin'), width: '5%' }, // 币种
        { title: this.$t('futures.coAccount.canUser'), width: '15%' }, // 可用
        { title: this.$t('futures.coAccount.allBalance'), width: '15%' }, // 总资产
        { title: this.$t('futures.coAccount.allMargin'), width: '15%' }, // 全仓保证金
        { title: this.$t('futures.coAccount.subMargin'), width: '15%' }, // 逐仓保证金
        { title: this.$t('futures.coAccount.lockMargin'), width: '15%' }, // 冻结保证金
        // { title: '已实现盈亏', width: '10%' }, // 已实现盈亏
        // { title: '未实现盈亏', width: '10%' }, // 未实现盈亏s
        { title: this.$t('futures.coAccount.opera'), width: '10%' }, // 未实现盈亏
      ];
    },
    // market 接口
    market() { return this.$store.state.baseData.market; },
  },
  methods: {
    init() {
      // 请求合约PublicInfo
      this.$store.dispatch('getFutorePublicInfo');
      if (!this.openContract) {
        this.openFuturesDialogShow = true;
      }
      this.getDetailData();
    },
    getDetailData() {
      this.axios({
        url: 'position/get_assets_list',
        hostType: 'co',
        params: {
          onlyAccount: 1,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          if (data.data.accountList.length) {
            this.tabelInfoData = data.data.accountList;
          }
        }
        this.tabelLoading = false;
      });
    },
    tableClick(type, data) {
      if (type === 'clickDialog') {
        this.symbol = JSON.parse(data).symbol;
        this.showFlag = true;
      }
    },
    // 开通合约交易
    submit() {
      this.openFuturesDialogShow = false;
      this.getDetailData();
    },
    // 关闭弹窗
    closeDialog(data) {
      if (data) {
        this.getDetailData();
      }
      // 关闭开通合约交易弹框
      this.openFuturesDialogShow = false;
      this.showFlag = false;
    },
  },
};
