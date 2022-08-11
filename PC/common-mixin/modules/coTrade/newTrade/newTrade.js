import {
  fixD, formatTime, nul, thousandsComma,
} from '@/utils';

export default {
  name: 'newTrade',
  components: {},
  data() {
    return {
      wsData: [],
      dataList: [],
      cellWidth: [120, 90, 90],
      differNUmber: 29,
      bodyHeight: '700px',
      symbolCurrent: null,
    };
  },
  computed: {
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
    theadList() {
      return [
        this.$t('futures.newTrade.text2'), // 价格
        `${this.$t('futures.newTrade.text3')} (${this.coUnit})`, // 数量
        this.$t('futures.newTrade.text4'), //  时间
      ];
    },
  },
  watch: {
    coUnitType(val, old) {
      if (val && old) {
        this.setDataList(JSON.stringify(this.wsData), 'req');
      }
    },
  },
  methods: {
    init() {
      this.$bus.$on('TRADE_DATA_REQ', (data) => {
        this.setDataList(data, 'req');
      });
      this.$bus.$on('TRADE_DATA_SUB', (data) => {
        this.setDataList(data, 'sub');
      });
      // 获取 当前选中的货币对
      this.$bus.$on('SYMBOL_CURRENT', (val) => {
        this.symbolCurrent = val;
      });
    },
    setDataList(data, type) {
      const wsData = JSON.parse(data);
      const arr = [];
      if (type === 'req') {
        this.dataList = [];
        this.wsData = [];
      }
      if (wsData && wsData.length) {
        wsData.forEach((item, index) => {
          let { vol } = item;
          // 标的货币
          if (this.coUnitType === 1) {
            vol = fixD(nul(vol, this.multiplier), this.volfix);
          }
          const obj = {
            side: item.side === 'SELL' ? 'u-4-cl' : 'u-1-cl',
            time: formatTime(item.ts).split(' ')[1],
            ts: item.ts,
            price: fixD(item.price, this.pricefix),
            vol,
            date: new Date().getTime() + index,
          };
          if (type === 'sub') {
            this.dataList.unshift(obj);
            this.wsData.unshift(item);
            if (this.dataList.length > 150) {
              this.dataList.pop();
              this.wsData.pop();
            }
          } else {
            arr.push(obj);
          }
        });
      }
      if (type === 'req') {
        this.dataList = arr;
        this.wsData = wsData;
      }
      this.differNUmber = 29 - this.dataList.length > 0 ? 29 - this.dataList.length : 0;
    },
    handelPrice(price) {
      this.$bus.$emit('HANDEL_PRICE', price);
    },
    kyes(item, index) {
      if (item.change) {
        return new Date().getTime();
      }
      return index;
    },
    thousandsComma(num) {
      if (num) {
        return thousandsComma(num);
      }
      return num;
    },
  },
};
