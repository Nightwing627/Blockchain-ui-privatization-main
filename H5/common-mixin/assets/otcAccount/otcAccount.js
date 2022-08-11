import {
  fixD, fixInput, myStorage,
} from '@/utils';

export default {
  name: 'page-otcAccount',
  data() {
    return {
      transferObj: null, // 当前划转币种的信息
      transferSide: '1', // 划转方向 1 为从现货到场外  2 为场外到现货
      dialogConfirmLoading: false, // 弹窗的确认按钮loading
      dialogFlag: false, // 对话框
      transferValue: '', // 划转数量input
      tabelLoading: true, // 表格 loading
      dataList: [], // 表格 数据
      switchFlag: false, // 是否隐藏零资产
      findValue: '', // 搜索币种
      axiosData: {},
    };
  },
  computed: {
    navList() {
      return [
        {
          text: this.$t('assets.otcAccount.ListOfFunds'),
          active: true,
          link: '/assets/otcAccount',
        },
        {
          text: this.$t('assets.index.flowingWater'),
          link: '/assets/otcFlowingWater',
        },
      ];
    },
    side() {
      const ex = this.$t('assets.otcAccount.exchangeAccount');
      const otc = this.$t('assets.otcAccount.otcAccount');
      let from = '';
      let to = '';
      if (this.transferSide === '1') {
        from = ex;
        to = otc;
      } else {
        from = otc;
        to = ex;
      }
      return {
        from,
        to,
      };
    },
    // input框警示文案
    transferWarningText() {
      const text = this.$t('assets.otcAccount.can'); // 可转
      const { coin, exNormal, otcNormal } = this.transferData;
      const num = this.transferSide === '1' ? exNormal : otcNormal;
      return text + num + coin;
    },

    // 弹窗是否可点击
    dialogConfirmDisabled() {
      if (this.dialogConfirmLoading) { return false; }
      let flag = true;
      if (parseFloat(this.transferValue) > 0 && !this.transferError) {
        flag = false;
      }
      return flag;
    },
    transferError() {
      let flag = false;
      // 限制最大数量
      if (this.transferSide === '1') {
        if (parseFloat(this.transferValue) > parseFloat(this.transferData.exNormal)) {
          flag = true;
        }
      } else if (this.transferSide === '2') {
        if (parseFloat(this.transferValue) > parseFloat(this.transferData.otcNormal)) {
          flag = true;
        }
      }
      return flag;
    },
    transferData() {
      let [coin, exNormal, otcNormal] = ['', '--', '--'];
      if (this.transferObj) {
        coin = this.transferObj.coinSymbol;
        const { coinList } = this.market;
        const fix = (coinList[coin] && coinList[coin].showPrecision) || 0;
        // 现货可用
        if (!Number.isNaN(parseFloat(fixD(this.transferObj.exchangeNormal, fix)))) {
          exNormal = fixD(this.transferObj.exchangeNormal, fix);
        }
        // 场外可用
        if (!Number.isNaN(parseFloat(fixD(this.transferObj.normal, fix)))) {
          otcNormal = fixD(this.transferObj.normal, fix);
        }
      }
      return {
        coin,
        exNormal,
        otcNormal,
      };
    },
    // 表格title
    columns() {
      return [
        // { title: this.$t('assets.otcAccount.coin'), width: '20%' }, // 币种
        { title: this.$t('assets.otcAccount.Available'), width: '30%' }, // 可用
        { title: this.$t('assets.otcAccount.freeze'), width: '30%' }, // 冻结
        // { title: this.$t('assets.otcAccount.options'), width: '20%' }, // 操作
      ];
    },
    market() { return this.$store.state.baseData.market; },
    // 资金列表展示到页面数据
    dataListFilter() {
      // 隐藏零资产功能过滤数据
      let list = [];
      if (this.switchFlag) {
        this.dataList.forEach((item) => {
          if (parseFloat(item.data[0])) {
            list.push(item);
          }
        });
      } else {
        list = this.dataList;
      }
      // 搜索框功能过滤数据
      const newList = [];
      list.forEach((item) => {
        if (item.title[0].text.indexOf(this.findValue.toUpperCase()) !== -1) {
          newList.push(item);
        }
      });
      return newList;
    },
  },
  watch: {
    market(v) { if (v) { this.sendOtcAxios(); } },
    transferValue(v) {
      const { coinList } = this.market;
      const { coin } = this.transferData;
      const fix = (coinList[coin] && coinList[coin].showPrecision) || 0;
      // 限制精度和不非数字字符
      this.transferValue = fixInput(v, fix);
    },
  },
  methods: {
    init() {
      if (myStorage.get('assetsSwitch')) {
        this.switchFlag = myStorage.get('assetsSwitch');
      }
      if (this.market) { this.sendOtcAxios(); }
    },
    // 全部划转
    allTransfer() {
      if (this.transferSide === '1') {
        if (this.transferData.exNormal === '--') { return; }
        this.transferValue = this.transferData.exNormal;
      } else if (this.transferSide === '2') {
        if (this.transferData.exNormal === '--') { return; }
        this.transferValue = this.transferData.otcNormal;
      }
    },
    // 修改划转方向
    setTransferSide() {
      if (this.transferSide === '1') { this.transferSide = '2'; } else if (this.transferSide === '2') { this.transferSide = '1'; }
      this.transferValue = ''; // 重置划转数量
    },
    inputLineChange(value, name) {
      this[name] = value;
    },
    dialogClose() {
      this.transferSide = '1'; // 重置划转方向
      this.transferValue = ''; // 重置划转数量
      this.transferObj = null; // 重置划转对象
      this.dialogFlag = false; // 关闭弹窗
    },
    dialogConfirm() {
      this.dialogConfirmLoading = true;
      this.axios({
        url: 'finance/otc_transfer',
        params: {
          fromAccount: this.transferSide === '1' ? '1' : '2',
          toAccount: this.transferSide === '1' ? '2' : '1',
          amount: this.transferValue,
          coinSymbol: this.transferData.coin,
        },
        method: 'post',
      }).then((data) => {
        this.dialogConfirmLoading = false;
        if (data.code.toString() === '0') {
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.transferSide = '1'; // 重置划转方向
          this.transferValue = ''; // 重置划转数量
          this.transferObj = null; // 重置划转对象
          this.dialogFlag = false;
          this.tabelLoading = true;
          this.sendOtcAxios(); // 重新获取数据
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 获取列表
    sendOtcAxios() {
      this.axios({
        url: 'finance/v4/otc_account_list',
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
        const fix = (coinList[item.coinSymbol] && coinList[item.coinSymbol].showPrecision) || 0;
        // let coinImg = defaultIcon;
        // if (coinList[item.coinSymbol] && coinList[item.coinSymbol].icon.length) {
        //   coinImg = coinList[item.coinSymbol].icon;
        // }
        list.push({
          id: JSON.stringify(item),
          title: [
            {
              text: item.coinSymbol,
            },
          ],
          handle: [{
            type: 'button', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
            text: this.$t('assets.otcAccount.optionCapitalTransfer'), // 资金划转
            eventType: 'transfer',
          }],
          data: [
            // [
            //   {
            //     type: 'icon', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
            //     iconSvg: `<div class="coinIcon"><img src="${coinImg}"/></div>`,
            //     eventType: 'goTradeIn',
            //     classes: ['coinBox'],
            //   },
            //   {
            //     text: item.coinSymbol,
            //   },
            // ],
            fixD(item.normal, fix),
            fixD(item.lock, fix),
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
    tableClick(type, data) {
      if (type === 'transfer') {
        this.transferObj = JSON.parse(data.id);
        this.dialogFlag = true;
      }
    },
  },
};
