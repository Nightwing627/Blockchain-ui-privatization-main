// 按钮
import { fixD, thousandsComma, myStorage } from '@/utils';

export default {
  name: 'futuresaAssets',
  data() {
    return {
      // 是否显示 划转弹框
      transferIsShow: false,
      // 显示类型
      blockType: 2,
      boxHeight: 332,
      // 维持保证金列表
      ladderList: [],
      // 最低维持保证金绿
      minMarginRate: 0.00,
    };
  },
  computed: {
    lanText() {
      return {
        text1: this.$t('futures.assets.text1'), // '资产',
        text2: this.$t('futures.assets.text2'), // '合约信息',
        text3: this.$t('futures.assets.text3'), // '立即划转',
        text4: this.$t('futures.assets.text4'), // '更多',
        text5: this.$t('futures.assets.text5'), // '账户保证金率',
        text6: this.$t('futures.assets.text6'), // '账户保证金率=该币种总资产/该币种担保的仓位总价值。此值用来表示担保资产的大致水平。保证金率越低，仓位被强制减仓的风险越大。',
        text7: this.$t('futures.assets.text7'), // '总资产',
        text8: this.$t('futures.assets.text8'), // '合约账户总权益。账户总权益=全仓总权益+逐仓总权益+冻结保证金。',
        text9: this.$t('futures.assets.text9'), // '全仓保证金',
        text10: this.$t('futures.assets.text10'), // '所有用来担保全仓仓位的保证金。当全仓仓位被强制平仓时，会损失这些资产。请注意：转入合约账户的资产会自动作为全仓保证金。',
        text11: this.$t('futures.assets.text11'), // '逐仓保证金',
        text12: this.$t('futures.assets.text12'), // '所有用来担保逐仓仓位的保证金。逐仓保证金和全仓分开，全仓仓位被强制平仓不会影响到这部分资产。',
        text13: this.$t('futures.assets.text13'), // '冻结保证金',
        text14: this.$t('futures.assets.text14'), // '提交委托时冻结的委托保证金总和。',
        text15: this.$t('futures.assets.text15'), // '合约代号',
        text16: this.$t('futures.assets.text16'), // '到期日期',
        text17: this.$t('futures.assets.text17'), // '合约标的',
        text18: this.$t('futures.assets.text18'), // '指数',
        text19: this.$t('futures.assets.text19'), // '保证金币种',
        text20: this.$t('futures.assets.text20'), // '合约面值',
        text21: this.$t('futures.assets.text21'), // '最小价格变动单位',
        text22: this.$t('futures.assets.text22'), // '最低维持保证金率',
        text23: this.$t('futures.assets.text23'), // '结算周期',
        text24: this.$t('futures.assets.text24'), // '['永续', '周', '次周', '月', '季度'];',
        text25: this.$t('futures.assets.text25'), // '合约数据',
      };
    },
    deliveryKind() {
      return this.lanText.text24; //  ['永续', '周', '次周', '月', '季度'];
    },
    contractShowType() {
      if (this.contractInfo) {
        return this.deliveryKind[Number(this.contractInfo.deliveryKind)];
      }
      return this.deliveryKind[0];
    },
    // 是否登录
    isLogin() {
      if (this.$store.state.baseData.isLogin) {
        return this.$store.state.baseData.isLogin;
      }
      return false;
    },
    // 当前合约信息
    contractInfo() {
      if (this.$store.state.future.contractInfo) {
        return this.$store.state.future.contractInfo;
      }
      return {};
    },
    // 是否开通了合约交易
    openContract() {
      return this.$store.state.future.openContract;
    },
    // 当前合约价格单位
    priceUnit() {
      return this.$store.state.future.priceUnit;
    },
    // 当前合约保证金币种
    marginCoin() {
      if (this.contractInfo) {
        return this.contractInfo.marginCoin;
      }
      return '';
    },
    // 当前合约ID
    contractId() {
      return this.$store.state.future.contractId;
    },
    // 当前合约保证金币种精度
    marginCoinFix() {
      if (this.contractInfo && this.contractInfo.coinResultVo) {
        return this.contractInfo.coinResultVo.marginCoinPrecision;
      }
      return 4;
    },
    // 用户合约资产
    accountBalanceMap() {
      return this.$store.state.future.futureAccountBalance;
    },
    accountBalance() {
      if (this.accountBalanceMap && this.marginCoin) {
        return this.accountBalanceMap[this.marginCoin];
      }
      return {};
    },
    balanceInfor() {
      if (this.accountBalance) {
        return {
          // 全仓保证金率
          totalMarginRate: this.fixdRose(this.accountBalance.totalMarginRate),
          // 可用
          canUseAmount: fixD(this.accountBalance.canUseAmount, this.marginCoinFix),
          // 总资产
          totalAmount: fixD(this.accountBalance.totalAmount, this.marginCoinFix),
          // 全仓保证金
          totalMargin: fixD(this.accountBalance.totalMargin, this.marginCoinFix),
          // 逐仓保证金
          isolateMargin: fixD(this.accountBalance.isolateMargin, this.marginCoinFix),
          // 冻结保证金
          lockAmount: fixD(this.accountBalance.lockAmount, this.marginCoinFix),
          // 已实现盈亏
          realizedAmount: fixD(this.accountBalance.realizedAmount, this.marginCoinFix),
          // 未实现盈亏
          unRealizedAmount: fixD(this.accountBalance.unRealizedAmount, this.marginCoinFix),
        };
      }
      return {
        canUseAmount: '0', // 可用
        totalAmount: '0', // 总资产
        totalMargin: '0', // 全仓保证金
        isolateMargin: '0', // 逐仓保证金
        lockAmount: '0', // 冻结保证金
        realizedAmount: '0', // 已实现盈亏
        unRealizedAmount: '0', // 未实现盈亏
      };
    },
    // 当前合约价格精度
    pricefix() {
      return this.$store.state.future.pricefix;
    },
    hintClass() {
      if (this.balanceInfor.totalAmount && Number(this.balanceInfor.totalAmount) !== 0) {
        return 'position-top';
      }
      return '';
    },
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },

    futuresDataUrl() {
      const { lan } = this.$store.state.baseData;
      if (process.env.NODE_ENV === 'development') {
        return '/co/zh_CN/futuresData';
      }
      if (this.$store.state.baseData && this.$store.state.baseData.publicInfo) {
        return this.linkurl.coUrl ? `${this.linkurl.coUrl}/${lan}/futuresData` : '';
      }
      return '';
    },
  },
  watch: {
    isLogin(val) {
      if (val && this.openContract) {
        this.blockType = 1;
      } else {
        this.blockType = 2;
        this.getladderList();
      }
    },
    openContract(val) {
      if (val && this.isLogin) {
        this.blockType = 1;
      } else {
        this.blockType = 2;
        this.getladderList();
      }
    },
  },
  filters: {
    setfixNumer(v) {
      if (v === 0) {
        return '1';
      }
      if (v === 1) {
        return '0.1';
      }
      return `${fixD(0, v - 1)}1`;
    },
    setSymbolNumer(name) {
      if (name) {
        return name.replace(/-/g, '');
      }
      return '';
    },
  },
  methods: {
    contractNames(data) {
      let name = data;
      if (data) {
        name = data.replace(/-/g, '');
      }
      // 混合合约 || 模拟合约
      let text = '';
      if (this.contractInfo.contractType !== 'E') {
        text = `-${this.contractInfo.marginCoin}`;
      }
      return `${name}${text}`;
    },
    init() {
      this.$bus.$on('syHeight', (val) => {
        this.boxHeight = val;
      });
      if (this.isLogin) {
        this.blockType = 1;
      } else {
        this.blockType = 2;
        this.getladderList();
      }
    },
    // 显示划转弹框
    openTransfer() {
      this.transferIsShow = true;
    },
    fixdRose(value) {
      if (value && value !== '--') {
        let slie = '';
        const val = parseFloat(value, 0);
        if (val > 0) { slie = '+'; }
        if (val < 0) { slie = '-'; }
        const num = Math.abs((value * 10000) / 100);
        return `${slie}${Number(num.toString().match(/^\d+(?:\.\d{0,2})?/))}`;
      }
      return value;
    },
    // 关闭弹框
    closeDialog() {
      // 关闭划转弹框
      this.transferIsShow = false;
    },
    // 切换类型
    switchBlock(type) {
      if (this.blockType !== type) {
        this.blockType = type;
      }
      if (type === 2) {
        this.getladderList();
      }
    },
    // 获取阶梯设置列表
    getladderList() {
      this.axios({
        url: this.$store.state.url.futures.getLadderInfo,
        method: 'post',
        hostType: 'co',
        params: {
          contractId: this.contractId,
        },
      }).then((rs) => {
        this.tableLoading = false;
        if (rs.code === '0' && rs.data) {
          if (rs.data.ladderList) {
            this.ladderList = rs.data.ladderList.ladderList || [];
            if (this.ladderList && this.ladderList.length) {
              const rate = this.ladderList[0].minMarginRate;
              this.minMarginRate = fixD(rate * 100, 2);
            }
          }
        }
      });
    },
    thousandsComma(num) {
      if (num) {
        return thousandsComma(num);
      }
      return num;
    },
    // 跳转至合约数据页面
    goFuturesData() {
      const type = myStorage.get('futuresMarketCurrent');
      window.location.href = `${this.futuresDataUrl}?marginCoin=${this.marginCoin}&type=${type}&contractId=${this.contractId}`;
    },

  },
};
