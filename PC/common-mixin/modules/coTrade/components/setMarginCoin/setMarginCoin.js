// 调节逐仓仓位保证金
import {
  nul, add, cut, division, fixD, fixInput, thousandsComma,
} from '@/utils';

export default {
  name: 'setMarginCoin',
  data() {
    return {
      // 是否加载成功
      dialogConfirmLoading: false,
      // 修改保证金类型 1: 增加 2：减少
      marginReviseType: 1,
      // 修改保证金 数量
      marginValue: '',
      // 保证金错误提示语
      marginErrorText: null,
      // 保证金是否输入错误
      marginErrorFlag: false,
      // 确认修改保证金防止双击
      sumbitFla: true,

    };
  },
  props: {
    isShow: {
      default: false,
      type: Boolean,
    },
    close: {
      default() {},
      type: Function,
    },
    marginData: {
      default: () => {},
      type: Object,
    },
  },
  computed: {
    lanText() {
      return {
        titleText: this.$t('futures.setMarginCoin.titleText'), // '调节逐仓仓位保证金',
        text1: this.$t('futures.setMarginCoin.text1'), // '当前',
        text2: this.$t('futures.setMarginCoin.text2'), // '变更后',
        text3: this.$t('futures.setMarginCoin.text3'), // '仓位',
        text4: this.$t('futures.setMarginCoin.text4'), // '仓位保证金',
        text5: this.$t('futures.setMarginCoin.text5'), // '实际杠杆',
        text6: this.$t('futures.setMarginCoin.text6'), // '强平价',
        text7: this.$t('futures.setMarginCoin.text7'), // '可用',
        text8: this.$t('futures.setMarginCoin.text8'), // '可减少保证金',
        text9: this.$t('futures.setMarginCoin.text9'), // '全部',
        text10: this.$t('futures.setMarginCoin.text10'), // '增加保证金',
        text11: this.$t('futures.setMarginCoin.text11'), // '减少保证金',
        text12: this.$t('futures.setMarginCoin.text12'), // '增加保证金数量',
        text13: this.$t('futures.setMarginCoin.text13'), // '减少保证金数量',
        text14: this.$t('futures.setMarginCoin.text14'), // '余额不足',
        text15: this.$t('futures.setMarginCoin.text15'), // '可减少保证金不足',
      };
    },
    // 数量单位类型Number(1标的货币 2张)
    coUnitType() {
      return this.$store.state.future.coUnitType;
    },
    // 保证金模式列表
    categoryList() {
      return [
        {
          id: 1,
          text: this.lanText.text10, // '增加保证金',
          classes: this.marginReviseType === 1 ? 'u-8-bg' : 'a-3-bg',
        },
        {
          id: 2,
          text: this.lanText.text11, // '减少保证金',
          classes: this.marginReviseType === 2 ? 'u-8-bg' : 'a-3-bg',
        },
      ];
    },
    // 增加&减少保证金 提示文案
    marginPromptText() {
      if (this.marginReviseType === 1) {
        return this.lanText.text12; // '增加保证金数量';
      }
      return this.lanText.text13; // '减少保证金数量';
    },
    // 修改保证金是否可以提交
    dialogConfirmDisabled() {
      if (this.marginValue && this.marginValue > 0 && !this.marginErrorText) {
        return false;
      }
      return true;
    },
    // 保证金精度
    mCionFix() {
      if (this.marginData.mCionFix) {
        return this.marginData.mCionFix;
      }
      return 8;
    },
    // 修改后的保证金数量
    modifiedMargin() {
      if (this.marginValue) {
        const holdAmount = this.marginData.holdAmount || 0;
        let value = 0;
        // 如果是减少保证金
        if (this.marginReviseType === 2) {
          value = fixD(cut(holdAmount, this.marginValue), this.mCionFix);
          if (value < 0) value = 0;
          return value;
        }
        value = fixD(add(holdAmount, this.marginValue), this.mCionFix);
        if (value < 0) value = 0;
        return value;
      }
      return this.marginData.holdAmount;
    },
    // 修改后的强平价格
    modifiedReducePrice() {
      if (!this.marginValue) return this.marginData.reducePrice;
      // 保证金汇率 标记价格 维持保证金率 手续费率 合约方向(1正向 0反向)， 价格精度
      const {
        marginRate, indexPrice, keepRate, maxFeeRate, contractSide, priceFix,
      } = this.marginData;
      if (!marginRate.toString()
        || !indexPrice.toString()
        || !keepRate.toString()
        || !maxFeeRate.toString()
        || !contractSide.toString()) return '';
      // 逐仓权益 / 保证金汇率
      const N1 = division(this.interests, marginRate);
      // 仓位数量 * 仓位方向 * 标记价格
      const N2 = nul(nul(this.positionNumber, this.sideNumber), indexPrice);
      // 逐仓权益 / 保证金汇率 - 仓位数量 * 仓位方向 * 标记价格
      const N3 = cut(N1, N2);
      // 维持保证金率 + 手续费率
      const X1 = add(keepRate, maxFeeRate);
      // (维持保证金率 + 手续费率)* 仓位数量
      const X2 = nul(X1, this.positionNumber);
      // 仓位 * 仓位方向
      const X3 = nul(this.positionNumber, this.sideNumber);
      // (维持保证金率 + 手续费率)* 仓位数量 - 仓位数量 * 仓位方向
      let X4 = cut(X2, X3);
      // 正向合约 =(逐仓权益 / 保证金汇率 - 仓位数量 * 仓位方向 * 标记价格) / (维持保证金率 + 手续费率)* 仓位数量 - 仓位数量 * 仓位方向)
      let value = division(N3, X4);
      if (contractSide === 0) {
        X4 = add(X2, X3);
        // 仓位数量 * 仓位方向 / 标记价格
        const Y1 = division(nul(this.positionNumber, this.sideNumber), indexPrice);
        const Y2 = add(N1, Y1);

        // 反向合约 =(维持保证金率 + 手续费率)* 仓位数量 + 仓位数量 * 仓位方向) / (逐仓权益 / 保证金汇率 + 仓位数量 * 仓位方向 / 标记价格)
        value = division(X4, Y2);
      }
      if (value <= 0) {
        return '--';
      }
      return fixD(value, priceFix);
    },
    // 仓位方向：多仓是1，空仓是-1
    sideNumber() {
      return this.marginData.orderSide === 'BUY' ? 1 : -1;
    },
    // 仓位数量 = 仓位张数 * 面值
    positionNumber() {
      const { multiplier } = this.marginData;
      let vol = this.marginData.positionVolumeOriginal;
      // 算出标的货币数量(数量 * 合约面值)
      vol = multiplier ? nul(vol, multiplier) : 0;
      return vol;
    },
    // 逐仓权益 = 仓位保证金 + 已实现盈亏 + 未实现盈亏
    interests() {
      const { realizedAmount, unRealizedAmount } = this.marginData;
      return add(add(this.modifiedMargin, realizedAmount), unRealizedAmount);
    },
  },
  watch: {
    marginValue(v) {
      this.$nextTick(() => {
        this.marginValue = fixInput(v, this.mCionFix);
      });
      const { canUseAmount, canSubMarginAmount } = this.marginData;
      if (this.marginReviseType === 1) {
        if (Number(this.marginValue) > Number(canUseAmount)) {
          this.$nextTick(() => {
            this.marginErrorText = this.lanText.text14; // '余额不足';
            this.marginErrorFlag = true;
          });
        } else {
          this.$nextTick(() => {
            this.marginErrorText = '';
            this.marginErrorFlag = false;
          });
        }
      } else if (Number(this.marginValue) > Number(canSubMarginAmount)) {
        this.$nextTick(() => {
          this.marginErrorText = this.lanText.text15; // '可减少保证金不足';
          this.marginErrorFlag = true;
        });
      } else {
        this.$nextTick(() => {
          this.marginErrorText = '';
          this.marginErrorFlag = false;
        });
      }
    },
  },
  methods: {
    // 实际杠杆
    activeLeverage(type) {
      //  标记价格, 保证金汇率, 合约方向(1正向 0反向)
      const {
        indexPrice, marginRate, contractSide,
      } = this.marginData;
      // 保证金
      let { holdAmount } = this.marginData;

      // 如果要获取变更后的实际杠杆
      if (type === 2) {
        // 获取修改后的保证金
        holdAmount = this.modifiedMargin;
      }
      let value = 0;
      if (this.positionNumber && indexPrice && holdAmount && marginRate) {
        if (contractSide === 1) {
        // 正向合约 = 仓位数量 * 标记价格 / 仓位保证金 / 保证金汇率
          value = division(
            division(nul(this.positionNumber, indexPrice), holdAmount), marginRate,
          );
        } else {
          // (反向合约) = 仓位数量 / 标记价格 / 仓位保证金 / 保证金汇率
          value = division(
            division(division(this.positionNumber, indexPrice), holdAmount), marginRate,
          );
        }
      }
      let data = fixD(value, 1);
      if (Number(data) < 0.1) {
        data = '<0.1';
      }
      return data;
    },
    // 切换 修改保证金类型
    selectCategory(id) {
      this.marginReviseType = id;
      this.marginValue = '';
    },
    // 保证金输入
    inputChanges(value, name) {
      this[name] = value;
    },
    // 确认修改保证金
    dialogConfirm() {
      if (this.sumbitFla) {
        this.sumbitFla = false;
        const paramsData = {
          type: this.marginReviseType,
          contractId: this.marginData.contractId,
          positionId: this.marginData.positionId,
          amount: this.marginReviseType === 1 ? this.marginValue : `-${this.marginValue}`,
        };
        this.axios({
          url: this.$store.state.url.futures.changePositionMargin,
          hostType: 'co',
          params: paramsData,
        }).then((data) => {
          this.sumbitFla = true;
          if (data.code === '0') {
            this.marginValue = '';
            this.close();
            // 重新请仓位列表
            this.$store.dispatch('getPositionList');
            // 操作成功
            this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        }).catch(() => {
          this.sumbitFla = true;
          // 系统错误
          this.$bus.$emit('tip', { text: this.$t('contract.c_error'), type: 'error' });
        });
      }
    },
    // 点击全部
    allevent() {
      if (this.marginReviseType === 1) {
        this.marginValue = this.marginData.canUseAmount;
      } else {
        this.marginValue = this.marginData.canSubMarginAmount;
      }
    },
    thousandsComma(num) {
      if (num) {
        return thousandsComma(num);
      }
      return num;
    },
  },
};
