const currentData = [];
let pYname = null;
let aYname = '';
const setEchartsData = function (dataList, type, currentSymbol) {
  const volumeFix = currentSymbol.volume;
  const defaultThreshold = currentSymbol.defaultThreshold || 0.1;
  if (type === 'current') {
    pYname = currentSymbol.name;
    if (dataList) {
      currentData[0] = Number(dataList.price);
      currentData[1] = Number(dataList.vol);
    }
    return;
  }
  if (!type) {
    aYname = currentSymbol.name;
  }
  if (pYname !== aYname) return false;
  let middlePrice = currentData[0];
  // 完成累加
  const j = 0;
  let minval = null;
  let maxval = null;
  let yminval = null;
  let ymaxval = null;
  let buysArr = [];
  let asksArr = [];

  const asksKey = Object.keys(dataList.asks);
  const buysKey = Object.keys(dataList.buys);

  if (dataList && asksKey.length > 1 || buysKey.length > 1) {
    const EachartDat = {};
    const keyArr = Object.keys(dataList);
    keyArr.forEach((key) => {
      if (key !== 'newData') {
        let i = 0;
        EachartDat[key] = [];
        const objItem = dataList[key];
        const objKeys = key === 'asks' ? Object.keys(objItem).sort((a, b) => a - b) : Object.keys(objItem).sort((a, b) => b - a);
        objKeys.forEach((item, index) => {
          if (Number(objItem[item][1]) !== 0) {
            objItem[item][0] = Number(objItem[item][0]);
            objItem[item][1] = Number(fixD(objItem[item][1] + i, volumeFix));
            [, i] = objItem[item];
            EachartDat[key].push(objItem[item]);
          }
        });
      }
    });

    buysArr = EachartDat.buys.reverse();
    asksArr = EachartDat.asks;

    // minval = (buysArr[0] && buysArr[0][0]) || 0;
    // maxval = (asksArr.length && asksArr[asksArr.length - 1][0]) || 0;

    const buyMax = (buysArr.length && buysArr[buysArr.length - 1][0]) || 0;
    const asksMin = (asksArr[0] && asksArr[0][0]) || 0;
    if (!middlePrice || middlePrice === 0) {
      middlePrice = (buyMax + asksMin) / 2;
    }
    minval = middlePrice - middlePrice * defaultThreshold;
    maxval = middlePrice + middlePrice * defaultThreshold;

    buysArr = buysArr.filter((item) => item[0] >= minval);
    asksArr = asksArr.filter((item) => item[0] <= maxval);

    buysArr.length && buysArr.unshift([minval, buysArr[0][1]]);
    asksArr.length && asksArr.push([maxval, asksArr[asksArr.length - 1][1]]);

    const buySpks = minval === 0 ? 0 : (middlePrice - minval) / middlePrice;
    const askSpks = maxval === 0 ? 0 : (maxval - middlePrice) / middlePrice;

    let spks = 0.15;
    if (buySpks > spks && askSpks > spks) {
      spks = buySpks >= askSpks ? askSpks : buySpks;
    } else {
      spks = buySpks >= askSpks ? buySpks : askSpks;
    }
    spks > 1 && (spks = 1);

    // minval = middlePrice - (middlePrice * spks);
    // maxval = middlePrice + (middlePrice * spks);

    if (!buysArr.length && asksArr.length) {
      yminval = asksArr[0][1];
      ymaxval = asksArr[asksArr.length - 1][1];
    } else if (!asksArr.length && buysArr.length) {
      yminval = buysArr[buysArr.length - 1][1];
      ymaxval = buysArr[0][1];
    } else {
      yminval = buysArr[buysArr.length - 1][1] > asksArr[0][1] ? asksArr[0][1] : buysArr[buysArr.length - 1][1];
      ymaxval = buysArr[0][1] > asksArr[asksArr.length - 1][1] ? buysArr[0][1] : asksArr[asksArr.length - 1][1];
    }
  }
  return {
    buysArr,
    asksArr,
    minval,
    maxval,
    yminval,
    ymaxval,
  };
};
