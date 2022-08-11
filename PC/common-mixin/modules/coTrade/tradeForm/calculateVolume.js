import {
  fixD, division, cut, nul,
} from '@/utils';

export default {
  name: 'tradeFormCalculateVolume',

  computed: {
    // 用户信息配置-可持有仓位上限
    leverOriginCeiling() {
      if (this.userConfig) {
        return this.userConfig.leverOriginCeiling;
      }
      return null;
    },
    // 当前合约最大可开额度
    setMaxNumber() {
      let num = 0;
      if (this.leverOriginCeiling) {
        const keyArr = Object.keys(this.leverOriginCeiling);
        keyArr.sort((a, b) => parseFloat(a) - parseFloat(b));
        let nextL = 0;
        for (let index = 0; index < keyArr.length; index += 1) {
          if (Number(this.nowLevel) > nextL && Number(this.nowLevel) <= keyArr[index]) {
            num = this.leverOriginCeiling[keyArr[index]];
          }
          nextL = keyArr[index];
        }
        // 标的货币
        return num;
      }
      return num;
    },
    // 持仓列表
    positionList() {
      return this.$store.state.future.positionList || [];
    },
    // 普通委托列表
    currentOrderLis() {
      return this.$store.state.future.currentOrderLis || [];
    },
    // 获取当前合约同方向持仓仓位价值
    positionMaxBalance() {
      const value = {
        buy: 0,
        sell: 0,
      };
      if (this.positionList.length) {
        this.positionList.forEach((item) => {
          if (this.contractId === item.contractId) {
            // if (item.orderSide === 'BUY') {
            value.buy += item.positionBalance;
            // } else {
            value.sell += item.positionBalance;
            // }
          }
        });
      }
      return value;
    },
    // 当前合约同方向未成交委托价值
    orderMaxBalance() {
      const value = {
        buy: 0,
        sell: 0,
      };
      if (this.currentOrderLis.length) {
        this.currentOrderLis.forEach((item) => {
          if (this.contractId === item.contractId && item.open === 'OPEN') {
            // if (item.side === 'BUY') {
            value.buy += item.orderBalance;
            // } else {
            value.sell += item.orderBalance;
            // }
          }
        });
      }
      return value;
    },
    // 计算
    // 当前合约最大可开额度-当前合约同方向持仓仓位价值-当前合约同方向未成交委托价值
    V1Buy() {
      return cut(cut(this.setMaxNumber, this.positionMaxBalance.buy), this.orderMaxBalance.buy);
    },
    V1Sell() {
      return cut(cut(this.setMaxNumber, this.positionMaxBalance.sell), this.orderMaxBalance.sell);
    },
    // 价格取值规则：
    // 委托价格为限价：用户设置的限价价格
    // 委托价格为市价：取最新价格，买一价, 卖一价 三者间的中位数
    priceVal() {
      // 市价
      if (this.currentCategory === 2 || this.isMarket) {
        return this.activeNewPrice;
      }
      // 限价
      return this.inputPrice;
    },
    // 最大可买
    maxBuyNumber() {
      //  正向 & 张数
      if (!this.canUseAmount
        || !this.V1Buy
        || !this.priceVal
        || this.V1Buy.toString() === 'NaN') {
        return 0;
      }
      if (this.contractSide === 1 && this.coUnitType === 2) {
        // V1Buy * 保证金汇率 / (最新价格 * 合约面值)
        return division(nul(this.V1Buy, this.marginRate), nul(this.priceVal, this.multiplier));
      }
      // 反向 & 张数
      if (this.contractSide === 0 && this.coUnitType === 2) {
        // V1Buy * 价格 / 面值
        return division(nul(this.V1Buy, this.priceVal), this.multiplier);
      }
      // 正向 & 量
      if (this.contractSide === 1 && this.coUnitType === 1) {
        // V1Buy * 保证金汇率 / 价格
        return division(nul(this.V1Buy, this.marginRate), this.priceVal);
      }
      // 反向 & 量
      if (this.contractSide === 0 && this.coUnitType === 1) {
        // V1Buy * 价格
        return nul(this.V1Buy, this.priceVal);
      }
      return 0;
    },
    // 最大可卖
    maxSellNumber() {
      if (!this.canUseAmount
        || !this.V1Sell
        || !this.priceVal
        || this.V1Sell.toString() === 'NaN') {
        return 0;
      }
      //  正向 & 张数
      if (this.contractSide === 1 && this.coUnitType === 2) {
        // V1Sell * 保证金汇率 / (最新价格 * 合约面值)
        return division(nul(this.V1Sell, this.marginRate), nul(this.priceVal, this.multiplier));
      }
      // 反向 & 张数
      if (this.contractSide === 0 && this.coUnitType === 2) {
        // V1Sell * 价格 / 面值
        return division(nul(this.V1Sell, this.priceVal), this.multiplier);
      }
      // 正向 & 量
      if (this.contractSide === 1 && this.coUnitType === 1) {
        // V1Sell * 保证金汇率 / 价格
        return division(nul(this.V1Sell, this.marginRate), this.priceVal);
      }
      // 反向 & 量
      if (this.contractSide === 0 && this.coUnitType === 1) {
        // V1Sell  价格
        return nul(this.V1Sell, this.priceVal);
      }
      return 0;
    },

    // 根据可用余额计算的最大可开
    // 正向：最大可开 = （可用余额 *杠杆/汇率）/(价格*合约面值)
    // 反向：最大可开 = 可用余额 *杠杆*价格/合约面值
    // 根据可用余额计算的最大可开（量）：
    // 正向：最大可开 = （可用余额 *杠杆/汇率）/价格
    // 反向：最大可开 = 可用余额 *杠杆*价格
    // 价格取值规则：
    // 委托价格为限价：用户设置的限价价格
    // 委托价格为市价：取最新价格，买一价, 卖一价 三者间的中位数
    calculateMaxNumber() {
      if (!this.canUseAmount || !this.priceVal) return 0;
      // 正向
      if (this.contractSide === 1) {
        // 可用余额 * 杠杆 / 汇率
        const V1 = division(nul(this.canUseAmount, this.nowLevel), this.marginRate);
        // 张
        if (this.coUnitType === 2) {
          // 价格 * 合约面值
          const v2 = nul(this.priceVal, this.multiplier);
          return division(V1, v2);
        }
        // 量 （可用余额 *杠杆/汇率）/价格
        return division(V1, this.priceVal);
      }
      // 反向
      // 量
      // 可用余额 * 杠杆* 价格
      const V3 = nul(nul(this.canUseAmount, this.nowLevel), this.priceVal);
      if (this.coUnitType === 1) {
        return V3;
      }
      return division(V3, this.multiplier);
    },

    // 买入可平数量
    maxCloseBuy() {
      let number = 0;
      let canClose = 0;
      if (this.activeCanClose && this.activeCanClose.BUY) {
        canClose = this.activeCanClose.BUY;
      }
      // 张
      if (this.coUnitType === 2) {
        number = canClose;
      } else {
        // 量
        number = nul(canClose, this.multiplier);
      }
      return number < 0 ? 0 : number;
    },
    // 卖出可平数量
    maxCloseSell() {
      let number = 0;
      let canClose = 0;
      if (this.activeCanClose && this.activeCanClose.SELL) {
        canClose = this.activeCanClose.SELL;
      }
      // 张
      if (this.coUnitType === 2) {
        number = canClose;
      } else {
        // 量
        number = nul(canClose, this.multiplier);
      }
      return number < 0 ? 0 : number;
    },

    // 可买 || 可平
    maxCanBuyNumber() {
      // 平仓 || 只减仓
      if (this.transactionType === 2 || this.zhiJianCang) {
        return fixD(this.maxCloseSell, this.volfix);
      }
      const number = this.calculateMaxNumber < this.maxBuyNumber
        ? this.calculateMaxNumber : this.maxBuyNumber;
      if (number < 0) return 0;
      return fixD(number, this.volfix);
    },
    // 可卖 || 可平
    maxCanSellNumber() {
      // 平仓 || 只减仓
      if (this.transactionType === 2 || this.zhiJianCang) {
        return fixD(this.maxCloseBuy, this.volfix);
      }
      const number = this.calculateMaxNumber < this.maxSellNumber
        ? this.calculateMaxNumber : this.maxSellNumber;
      if (number < 0) return 0;
      return fixD(number, this.volfix);
    },

    // 买入成本
    canBuyCostNumber() {
      if (this.isLogin) {
        return fixD(this.calculateCostNumber('BUY'), this.marginCoinFix);
      }
      return 0;
    },
    // 卖出成本
    canSellCostNumber() {
      if (this.isLogin) {
        return fixD(this.calculateCostNumber('SELL'), this.marginCoinFix);
      }
      return 0;
    },

    // // 计算公式参数
    // calculateParameter() {
    //   // 可用 杠杆 输入的限价 触发价格 保证金汇率 合约面值 可平数量
    //   // 数量单位类型1标的货币, 2张 订单类型(限价、市价)  是否条件单市价
    //   // 是否只减仓 合约方向（1正向、0反向）  双向持仓中的1开仓2平仓 当前合约平均价格 张数或者市价的开仓价值
    //   return {
    //     canUseAmount: this.canUseAmount, // 可用
    //     nowLevel: this.nowLevel, // 当前合约杠杆
    //     price: this.inputPrice, // 输入的限价
    //     triggerPrice: this.triggerPrice, // 条件单的触发价
    //     marginRate: this.marginRate, // 保证金汇率
    //     multiplier: this.multiplier, // 合约面值
    //     activeCanClose: this.activeCanClose, // 可平数量(对象，可凭多、可凭空)
    //     coUnitType: this.coUnitType, // 数量单位类型1标的货币, 2张
    //     currentCategory: this.currentCategory, // 订单类型(限价、2市价)
    //     isMarket: this.isMarket, // 是否条件单市价
    //     zhiJianCang: this.zhiJianCang, // 是否只减仓
    //     contractSide: this.contractSide, // 合约方向（1正向、0反向）
    //     transactionType: this.transactionType, // 双向持仓中的 1开仓 2 平仓
    //     activeNewPrice: this.activeNewPrice, // 当前合约平均价格
    //     volume: this.inputVolume, // 张数或者市价的开仓价值
    //   };
    // },

    // // 可买 、可平多 数量
    // canBuyNumber() {
    //   if (this.isLogin && this.canUseAmount) {
    //     return fixD(calculateVolume('BUY', this.calculateParameter), this.volfix);
    //   }
    //   return 0;
    // },

    // // 可卖、可平空 数量
    // canSellNumber() {
    //   if (this.isLogin && Number(this.canUseAmount)) {
    //     return fixD(calculateVolume('SELL', this.calculateParameter), this.volfix);
    //   }
    //   return 0;
    // },

  },
  methods: {
    calculateCostNumber(type) {
      let volume = this.inputVolume;
      if (this.percentageVlaue) {
        volume = this.countPercentageVlaue(type);
      }
      let number = 0;
      // 平仓 || 只减仓 （仓位价值）
      if (this.transactionType === 2 || this.zhiJianCang) return 0;
      // 限价单 or 条件限价单 （数量）
      if (this.currentCategory === 1 || (this.currentCategory === 3 && !this.isMarket)) {
        if (!this.inputPrice) return 0;
        // 反向 = 张数 * 面值 / 限价 / 杠杆 * 保证金汇率
        number = nul(
          division(
            division(nul(volume, this.multiplier), this.inputPrice),
            this.nowLevel,
          ), this.marginRate,
        );
        // 正向 | 张数 * 面值 * 限价 / 杠杆 * 保证金汇率
        if (this.contractSide === 1) {
          number = nul(
            division(
              nul(
                nul(volume, this.multiplier), this.inputPrice,
              ),
              this.nowLevel,
            ),
            this.marginRate,
          );
        }
        return number;
      }
      // 市价单 or 添加市价单
      if (this.currentCategory === 2 || (this.currentCategory === 3 && this.isMarket)) {
        // 反向 | 正向 = 开仓价值 / 杠杆 8 保证金汇率
        number = nul(division(volume, this.nowLevel), this.marginRate);
        return number;
      }
      return number;
    },
  },

};
