import {
  fixD, nul, division, thousandsComma,
} from '@/utils';

export default {
  name: 'market',
  data() {
    return {
      wsData: {},
      // 当前深度
      activeDepat: 0,
      depatHover: 0,
      isShowDepat: false,
      cellWidth: [120, 90, 90],
      // 收起状态 盘口 和 实时成交显示哪个 ？
      shrinksDdpthNewShow: 'D',
      // 卖盘 高度
      sellHeight: 235,
      // 买盘 高度
      buyHeight: 210,
      // 显示条数
      sellLineNumber: 10,
      buyLineNumber: 10,
      // 当前价格
      activePrice: null,
      priceClsss: null,

    };
  },
  computed: {
    templateLayoutType() {
      return this.$store.state.baseData.templateLayoutType;
    },
    // 价格 数量 累计
    theadList() {
      return [
        this.$t('futures.depth.theadList1'), // 价格
        `${this.$t('futures.depth.theadList2')} (${this.coUnit})`, // '数量',
        `${this.$t('futures.depth.theadList3')} (${this.coUnit})`, // '总计',
      ];
    },
    // 当前合约信息
    contractInfo() {
      return this.$store.state.future.contractInfo;
    },
    // 深度级别列表
    depathList() {
      if (this.contractInfo) {
        const d = this.contractInfo.coinResultVo.depth;
        if (d === ['0', '0', '0']) {
          return ['0'];
        }
        return this.contractInfo.coinResultVo.depth;
      }
      return ['3', '2', '1'];
    },
    // 当前币对
    symbolCurrent() {
      return this.$store.state.future.coTypeSymbol;
    },
    // 当前合约面值
    multiplier() {
      return Number(this.$store.state.future.multiplier);
    },
    // 合约数量单位
    coUnit() {
      return this.$store.state.future.coUnit;
    },
    // 数量单位类型Number
    coUnitType() {
      return this.$store.state.future.coUnitType;
    },
    // 合约数量精度
    volfix() {
      return this.$store.state.future.volfix;
    },
    // 合约币对价格精度
    pricefix() {
      return this.$store.state.future.pricefix;
    },
    // 标记价格、指数价格、资金费率
    publicMarkertInfo() {
      const { publicMarkertInfo } = this.$store.state.future;
      if (publicMarkertInfo) {
        return {
          // 标记价格
          tagPrice: this.fixPrice(publicMarkertInfo.tagPrice),
          // 指数价格
          indexPrice: this.fixPrice(publicMarkertInfo.indexPrice),
        };
      }
      return {
        indexPrice: '--',
      };
    },
    dataList() {
      if (this.wsData) {
        const data = this.wsData;
        // console.log(data);
        const dataTypeKey = Object.keys(data);
        const depthListData = {};
        let maxTotal = 0;
        if (dataTypeKey.length) {
          dataTypeKey.forEach((item) => {
            const objItem = data[item];
            let totalNum = 0;
            let maxval = 0;
            const dataArr = [];
            let objKeys = null;
            if (item === 'asks') {
              objKeys = Object.keys(objItem).sort((a, b) => a - b);
            } else {
              objKeys = Object.keys(objItem).sort((a, b) => b - a);
            }
            // 去掉 价格为零的
            objKeys.forEach((itemKey) => {
              const itemArr = objItem[itemKey];
              if (dataArr.length < 10) {
                // 获取最大的数量
                maxval = maxval < itemArr[1] ? itemArr[1] : maxval;
                totalNum += itemArr[1];
                let total = totalNum;
                let vol = itemArr[1];
                // 标的货币
                if (this.coUnitType === 1 && totalNum && this.multiplier) {
                  total = fixD(nul(totalNum, this.multiplier), this.volfix);
                  vol = fixD(nul(vol, this.multiplier), this.volfix);
                }
                const objd = {
                  // 总量
                  total,
                  // 价格
                  price: fixD(itemArr[0], this.pricefix),
                  // 数量
                  vol,
                  // 是否有变化
                  diff: itemArr[2],
                };
                  // 处理增量数据
                if (data.newData && data.newData.indexOf(itemArr[0]) < 0) {
                  objd.diff = 0;
                }
                if (vol > 0) {
                  dataArr.push(objd);
                }
              }
            });
            depthListData[item] = dataArr;
            if (maxTotal < maxval) {
              maxTotal = maxval;
            }
          });
          let asksMaxValue = 0;
          let buysMaxValue = 0;
          if (depthListData.asks && depthListData.asks.length) {
            const index = depthListData.asks.length - 1;
            asksMaxValue = depthListData.asks[index].total;
          }
          if (depthListData.buys && depthListData.buys.length) {
            const index = depthListData.buys.length - 1;
            buysMaxValue = depthListData.buys[index].total;
          }
          const maxTotalValue = Math.max(asksMaxValue, buysMaxValue);
          return {
            depthMaxNumber: maxTotalValue,
            asksData: depthListData.asks.reverse(),
            buyData: depthListData.buys,
          };
        }
      }
      return {
        asksData: [],
        buyData: [],
        depthMaxNumber: null,
      };
    },
    //  买一
    buyOne() {
      if (this.dataList && this.dataList.buyData.length) {
        return this.swNumber(this.dataList.buyData[0].price);
      }
      return 0;
    },
    // 卖一
    sellOne() {
      if (this.dataList && this.dataList.asksData.length) {
        return this.swNumber(this.dataList.asksData[0].price);
      }
      return 0;
    },
    // 获取当前合约最新价格（下单模块使用）
    activeNewPrice() {
      let value = 0;
      if (this.buyOne && this.sellOne && this.activePrice) {
        value = this.medianValue(this.buyOne, this.sellOne, this.activePrice);
      } else if (!this.buyOne && this.sellOne && this.activePrice) {
        value = this.meanValue(this.sellOne, this.activePrice);
      } else if (this.buyOne && !this.sellOne && this.activePrice) {
        value = this.meanValue(this.buyOne, this.activePrice);
      } else if (this.buyOne && this.sellOne && !this.activePrice) {
        value = this.meanValue(this.buyOne, this.sellOne);
      } else {
        const arr = [this.buyOne, this.sellOne, this.activePrice];
        arr.forEach((item) => {
          if (item) {
            value = item;
          }
        });
      }
      return value;
    },
  },
  watch: {
    activeNewPrice(val) {
      this.$bus.$emit('ACTIVE_NEW_PRICE', val);
    },
  },
  methods: {
    init() {
      // 监听 深度数据
      this.$bus.$on('DEPTH_DATA', (data) => {
        // console.log(data);
        this.wsData = data;
      });
      this.$bus.$on('activeWsData', (data) => {
        if (data.close && data.close !== '--') {
          this.activePrice = Number(data.close);
        } else {
          this.activePrice = '--';
        }
        this.priceClsss = data.class;
      });
    },
    // 新价精度
    fixPrice(value) {
      if (value) {
        return fixD(value, this.pricefix);
      }
      return '--';
    },
    fixDepthNumber(val) {
      if (val === 0 || val === '0') {
        return 1;
      }
      if (val === 1 || val === '1') {
        return 0.1;
      }
      const n = Number(val) - 1;
      const num = 0;
      const b = num.toFixed(n);
      return `${b}1`;
    },
    // 盘口 和 实时成交 切换
    switchBlock(type) {
      this.shrinksDdpthNewShow = type;
    },
    handMouseenter(id) {
      this.depatHover = id;
    },
    switchDepat(id) {
      this.activeDepat = id;
      this.isShowDepat = false;
      this.$bus.$emit('DEPTH_VALUE', this.activeDepat);
    },
    handMouseleave() {
      this.depatHover = '';
    },
    // 转数字
    swNumber(val) {
      if (parseFloat(val).toString() !== 'NaN') {
        return parseFloat(val);
      }
      return false;
    },
    // 三个数获取中间值
    medianValue(a, b, c) {
      if ((b - a) * (a - c) >= 0) {
        return a;
      } if ((a - b) * (b - c) >= 0) {
        return b;
      }
      return c;
    },
    // 两个数获取平均
    meanValue(a, b) {
      return division(a + b, 2);
    },
    thousandsComma(num) {
      if (num) {
        return thousandsComma(num);
      }
      return num;
    },
  },
};
