export default {
  data() {
    return {
      haveBranch: false, // 是否存在多主链
      branchArr: [],
      activeBranch: '', // 当前选中的子链
    };
  },
  methods: {
    branchInit(v) {
      const { coinList, followCoinList } = v;
      this.haveBranch = false;
      this.branchArr = [];
      this.activeBranch = '';
      if (this.symbol && coinList[this.symbol]
        && coinList[this.symbol].mainChainType === 1) {
        this.haveBranch = true;
        if (followCoinList[this.symbol]) {
          const arr = [];
          const coinKeys = Object.keys(followCoinList[this.symbol]);
          coinKeys.forEach((item) => {
            const even = followCoinList[this.symbol][item];
            arr.push({ value: even.mainChainName, code: item });
          });
          this.branchArr = arr;
          if (coinKeys.indexOf(this.symbol) !== -1) {
            this.activeBranch = this.symbol;
          } else {
            const [activeBranch] = coinKeys;
            this.activeBranch = activeBranch;
          }
        }
      }
    },
  },
};
