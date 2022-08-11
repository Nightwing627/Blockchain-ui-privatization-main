import {
  myStorage, fixD, fixRate, fixInput, colorMap, imgMap,
  getCoinShowName,
} from '@/utils';

const defaultIcon = imgMap.f_1;

export default {
  name: 'page-otcAccount',
  data() {
    return {
      otcHeader: `background: url(${imgMap.zc_otc})`,
      imgMap,
      colorMap,
      transferObj: null, // 当前划转币种的信息
      transferSide: '1', // 划转方向 1 为从现货到场外  2 为场外到现货
      dialogConfirmLoading: false, // 弹窗的确认按钮loading
      dialogFlag: false, // 对话框
      transferValue: '', // 划转数量input
      tabelLoading: true, // 表格 loading
      dataList: [], // 表格 数据
      totalBalance: '--', // 资产折合
      totalBalanceSymbol: '', // 资产折合币种
      totalRate: '--', // 资产折合汇率
      canvasPages: [], // canvas
      switchFlag: false, // 是否隐藏零资产
      findValue: '', // 搜索币种
      colors: [
        'rgba(255, 255, 255, 1)',
        'rgba(255, 255, 255, 0.8)',
        'rgba(255, 255, 255, 0.6)',
        'rgba(255, 255, 255, 0.4)',
        'rgba(255, 255, 255, 0.25)',
        'rgba(255, 255, 255, 0.1)',
      ],
    };
  },
  computed: {
    isCoOpen() {
      const base = this.$store.state.baseData.publicInfo;
      if (base && base.switch && base.switch.indep_co_switch === '1') {
        return true;
      }
      return false;
    },
    side() {
      const ex = this.isCoOpen ? this.$t('assets.index.coExchangeAccount') : this.$t('assets.index.exchangeAccount');
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
      return text + num + this.getShowCoin(coin);
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
          arr.push({
            ...item,
            color: this.colors[index],
          });
        });
      // 非0资产的币种多于等于6种时
      } else if (list.length >= 6) {
        let evenSum = 0;
        // 选出前五个
        list.forEach((item, index) => {
          if (index < 5) {
            arr.push({
              ...item,
              color: this.colors[index],
            });
          } else {
            evenSum += item.spk;
          }
        });
        // 剩余币种归纳为其他
        arr.push({
          symbol: this.$t('assets.otcAccount.other'),
          spk: evenSum,
          color: this.colors[5],
        });
      }
      return arr;
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
        { title: this.$t('assets.otcAccount.coin'), width: '20%' }, // 币种
        { title: this.$t('assets.otcAccount.Available'), width: '30%' }, // 可用
        { title: this.$t('assets.otcAccount.freeze'), width: '30%' }, // 冻结
        { title: this.$t('assets.otcAccount.options'), width: '20%' }, // 操作
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
        if (item.data[0][1].text.toUpperCase().indexOf(this.findValue.toUpperCase()) !== -1) {
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
    canvasPagesFilter(v) {
      if (v.length === 0) {
        this.canvasInit();
      } else {
        this.canvasMap();
      }
    },
  },
  methods: {
    getShowCoin(v) {
      let str = v;
      if (this.market && this.market.coinList) {
        str = getCoinShowName(v, this.market.coinList);
      }
      return str;
    },
    init() {
      if (myStorage.get('assetsSwitch')) {
        this.switchFlag = myStorage.get('assetsSwitch');
      }
      if (this.market) { this.sendOtcAxios(); }
      this.canvasInit();
    },
    compare(property) {
      return function fn(a, b) {
        const value1 = a[property];
        const value2 = b[property];
        return value2 - value1;
      };
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
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 处理列表数据
    setData({ totalBalance, totalBalanceSymbol, allCoinMap }) {
      const { coinList, rate } = this.market;
      const FFix = (coinList[totalBalanceSymbol]
        && coinList[totalBalanceSymbol].showPrecision) || 0;
      this.totalBalance = fixD(totalBalance, FFix); // 折合资产
      this.totalBalanceSymbol = totalBalanceSymbol; // 折合币种
      this.totalRate = fixRate(totalBalance, rate, totalBalanceSymbol); // 折合法币
      const btcFix = (coinList[totalBalanceSymbol]
        && coinList[totalBalanceSymbol].showPrecision) || 0;
      const list = [];
      const canvasList = [];
      allCoinMap.forEach((item) => {
        canvasList.push({
          symbol: item.coinSymbol,
          spk: item.btcValuation / totalBalance,
        });
        const fix = (coinList[item.coinSymbol] && coinList[item.coinSymbol].showPrecision) || 0;
        let coinImg = defaultIcon;
        if (coinList[item.coinSymbol] && coinList[item.coinSymbol].icon.length) {
          coinImg = coinList[item.coinSymbol].icon;
        }
        list.push({
          id: JSON.stringify(item),
          btcValuation: fixD(item.btcValuation, btcFix),
          data: [
            [
              {
                type: 'icon', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                iconSvg: `<div class="coinIcon"><img src="${coinImg}"/></div>`,
                eventType: 'goTradeIn',
                classes: ['coinBox'],
              },
              {
                text: getCoinShowName(item.coinSymbol, coinList),
              },
            ],
            fixD(item.normal, fix),
            fixD(item.lock, fix),
            [{
              type: 'button', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
              text: this.$t('assets.otcAccount.optionCapitalTransfer'), // 资金划转
              eventType: 'transfer',
            }],
          ],
        });
      });
      this.canvasPages = canvasList;
      this.dataList = list;
    },
    canvasMap() {
      const ctx = this.$refs.canvas.getContext('2d');
      this.$refs.canvas.width = 100;
      this.$refs.canvas.height = 100;
      let start = 0;
      this.canvasPagesFilter.forEach((item) => {
        let spk = start + item.spk * 2;
        if (start >= 2) { return; } // 防止 2-xx的值
        if (spk > 2) { spk = 2; } // 防止 1.x - 2.x的值
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
      ctx.fillStyle = '#4a3dd8';
      ctx.arc(50, 50, 35, Math.PI * 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    },
    // canvas初始化
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
      ctx.fillStyle = '#4a3dd8';
      ctx.arc(50, 50, 35, Math.PI * 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
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
        this.transferObj = JSON.parse(data);
        this.dialogFlag = true;
      }
    },
  },
};
