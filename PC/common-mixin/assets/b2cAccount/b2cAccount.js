import {
  myStorage, imgMap, fixD, fixRate, colorMap,
} from '@/utils';

const defaultIcon = imgMap.f_1;

export default {
  data() {
    return {
      colorMap,
      otcHeader: `background: url(${imgMap.zc_otc})`,
      tabelLoading: true, // 表格 loading
      dataList: [], // 表格 数据
      totalBalance: '--', // 资产折合
      totalBalanceSymbol: '', // 资产折合币种
      totalRate: '--', // 资产折合汇率
      canvasPages: [], // canvas
      switchFlag: false, // 是否隐藏零资产
      findValue: '', // 搜索币种
      colors: ['#9695FF', '#8073FF', '#6C5EE5', '#706BE4', '#514DE9 ', '#4232C5'],
    };
  },
  computed: {
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
    // 表格title
    columns() {
      return [
        { title: this.$t('assets.otcAccount.coin'), width: '15%' }, // 币种
        { title: this.$t('assets.b2c.allName'), width: '10%' }, // 全称
        { title: this.$t('assets.withdraw.lumpSum'), width: '15%' }, // 总额
        { title: this.$t('assets.otcAccount.Available'), width: '20%' }, // 可用
        { title: this.$t('assets.otcAccount.freeze'), width: '20%' }, // 冻结
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
    // 获取列表
    sendOtcAxios() {
      this.axios({
        url: 'fiat/balance',
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
    setData({ totalBtcValue, totalBalanceSymbol, allCoinMap }) {
      const { coinList, rate } = this.market;
      const FFix = (coinList[totalBalanceSymbol]
        && coinList[totalBalanceSymbol].showPrecision) || 0;
      this.totalBalance = fixD(totalBtcValue, FFix); // 折合资产
      this.totalBalanceSymbol = totalBalanceSymbol; // 折合币种
      this.totalRate = fixRate(totalBtcValue, rate, totalBalanceSymbol); // 折合法币
      const btcFix = (coinList[totalBalanceSymbol]
        && coinList[totalBalanceSymbol].showPrecision) || 0;
      const list = [];
      const canvasList = [];
      allCoinMap.forEach((item) => {
        canvasList.push({
          symbol: item.symbol,
          spk: item.btcValue / totalBtcValue,
        });
        const fix = (coinList[item.symbol] && coinList[item.symbol].showPrecision) || 0;
        let coinImg = defaultIcon;
        if (coinList[item.symbol] && coinList[item.symbol].icon.length) {
          coinImg = coinList[item.symbol].icon;
        }
        list.push({
          id: JSON.stringify(item),
          btcValuation: fixD(item.btcValue, btcFix),
          data: [
            [
              {
                type: 'icon', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                iconSvg: `<div class="coinIcon"><img src="${coinImg}"/></div>`,
                eventType: 'goTradeIn',
                classes: ['coinBox'],
              },
              {
                text: item.symbol,
              },
            ],
            item.title || '--', // 全称
            fixD(item.totalBalance, fix), // 总额
            fixD(item.normalBalance, fix), // 可用
            fixD(item.lockBalance, fix), // 冻结
            [
              {
                type: item.depositOpen ? 'link' : 'label', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                text: this.$t('assets.exchangeAccount.Recharge'), // 充值
                links: `b2cRecrge?symbol=${item.symbol}`,
                classes: [item.depositOpen ? '' : 'tableNownStyle b-2-cl'],
              },
              {
                type: item.withdrawOpen ? 'link' : 'label', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                text: this.$t('assets.exchangeAccount.withdraw'), // 提现
                links: `b2cWithdraw?symbol=${item.symbol}`,
                classes: [item.withdrawOpen ? '' : 'tableNownStyle tableTithDraw b-2-cl'],
              },
            ],
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
    tableClick() {
    },
  },
};
