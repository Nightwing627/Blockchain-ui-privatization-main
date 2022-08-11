// 计算 可买可买
// 加 减 乘 除
import { nul, division } from './math';
// @ canUseAmount  可用
// @ nowLevel  当前合约杠杆
// @ price  输入的限价
// @ triggerPrice  条件单的触发价
// @ marginRate  保证金汇率
// @ multiplier  合约面值
// @ activeCanClose  可平数量(对象，可凭多、可凭空)
// @ coUnitType  数量单位类型 1:标的货币, 2:张
// @ currentCategory  订单类型(1限价、2市价 、3条件单)
// @ isMarket  是否条件单市价
// @ zhiJianCang  是否只减仓
// @ contractSide  合约方向（1正向、0反向）
// @ transactionType 双向持仓中的 1开仓 2 平仓
// @ activeNewPrice  当前合约平均价
// @ volume 张数或者市价的开仓价值
const calculateVolume = (type, data) => {
  // console.log(type, data);
  const {
    canUseAmount,
    nowLevel,
    price,
    triggerPrice,
    marginRate,
    multiplier,
    activeCanClose,
    coUnitType,
    currentCategory,
    isMarket,
    zhiJianCang,
    contractSide,
    transactionType,
    activeNewPrice,
    volume,
  } = data;
  let number = 0;

  // 成本
  if (type === 'cost') {
    // 平仓 || 只减仓 （仓位价值）
    if (transactionType === 2 || zhiJianCang) return 0;
    // 限价单 or 条件限价单 （数量）
    if (currentCategory === 1 || (currentCategory === 3 && !isMarket)) {
      if (!price) return 0;
      // 反向 = 张数 * 面值 / 限价 / 杠杆 * 保证金汇率
      number = nul(division(division(nul(volume, multiplier), price), nowLevel), marginRate);
      // 正向 | 张数 * 面值 * 限价 / 杠杆 * 保证金汇率
      if (contractSide === 1) {
        number = nul(division(nul(nul(volume, multiplier), price), nowLevel), marginRate);
      }
      return number;
    }
    // 市价单 or 添加市价单
    if (currentCategory === 2 || (currentCategory === 3 && isMarket)) {
      // 反向 | 正向 = 开仓价值 / 杠杆 8 保证金汇率
      number = nul(division(volume, nowLevel), marginRate);
      return number;
    }
    return number;
  }
  // 买入卖出
  // 平仓 || 只减仓
  if (transactionType === 2 || zhiJianCang) {
    // 张
    let canClose = 0;
    const sT = type === 'SELL' ? 'BUY' : 'SELL';
    if (activeCanClose && activeCanClose[sT]) {
      canClose = activeCanClose[sT];
    }
    if (coUnitType === 2) {
      number = canClose;
    } else {
      number = nul(canClose, multiplier);
    }
    return number;
  }
  // 开仓、非只减仓
  if (!canUseAmount) return 0;
  // 限价单 or 条件限价单
  if (currentCategory === 1 || (currentCategory === 3 && !isMarket)) {
    if (!price) return 0;
    // 反向 = 可用 * 杠杆 * 限价 / 保证金汇率
    let N1 = division(nul(nul(canUseAmount, nowLevel), price), marginRate);
    if (contractSide === 1) {
      // 正向 = 可用 * 杠杆 / 限价 * 保证金汇率
      N1 = division(division(nul(canUseAmount, nowLevel), price), marginRate);
    }
    // 1标的货币：N1 | 张：N1 / 面值
    number = coUnitType === 1 ? N1 : division(N1, multiplier);
    return number;
  }
  // 市价
  if (currentCategory === 2) {
    if (!activeNewPrice) return 0;
    // 反向 = 可用 / 保证金汇率 * 杠杆 * 本交易所最新价格
    let N2 = nul(nul(division(canUseAmount, marginRate), nowLevel), activeNewPrice);
    // 正向 = 可用 / 保证金汇率 * 杠杆 / 本交易所最新价格
    if (contractSide === 1) {
      N2 = division(nul(division(canUseAmount, marginRate), nowLevel), activeNewPrice);
    }
    // 1标的货币：N2 | 张：N2 / 面值
    number = coUnitType === 1 ? N2 : division(N2, multiplier);
    return number;
  }
  // 条件单市价
  if (currentCategory === 3 && isMarket) {
    if (!triggerPrice) return 0;
    // 反向 = 可用 / 保证金汇率 * 杠杆 * 触发价
    let N3 = nul(nul(division(canUseAmount, marginRate), nowLevel), triggerPrice);
    // 正向 = 可用 / 保证金汇率 * 杠杆 / 本交易所最新价格
    if (contractSide === 1) {
      N3 = division(nul(division(canUseAmount, marginRate), nowLevel), triggerPrice);
    }
    // 1标的货币：N3 | 张：N3 / 面值
    number = coUnitType === 1 ? N3 : division(N3, multiplier);
    return number;
  }

  return number;
};

export default calculateVolume;
