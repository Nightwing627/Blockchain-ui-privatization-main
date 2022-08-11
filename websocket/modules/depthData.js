const { fixD, fixRate } = window.BlockChainUtils;
const setDepthData = function (symbol, data, rate, depthValue, lan) {
  const dataTypeKey = Object.keys(data);
  const priceFix = depthValue;
  const volumeFix = symbol.volume || 0;
  const names = symbol.name.split('/');
  const symbolName = names[0];
  const marketName = names[1] || symbol.quoteSymbol;
  const depthListData = {};
  let maxTotal = 0;

  dataTypeKey.forEach((item) => {
    if (item !== 'newData') {
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
      // console.log('itemKey', objKeys.length);
      // 去掉 价格为零的
      objKeys.forEach((itemKey, index) => {
        const itemArr = objItem[itemKey];
        if (Number(fixD(itemArr[1]), priceFix) !== 0 && dataArr.length < 150) {
          // 获取最大的数量
          maxval = maxval < itemArr[1] ? itemArr[1] : maxval;

          totalNum += itemArr[1];
          const ratePrice = fixRate(itemArr[0], rate, marketName, lan);
          const objd = {
            rate: ratePrice,
            total: fixD(totalNum, volumeFix),
            price: fixD(itemArr[0], priceFix),
            vol: fixD(itemArr[1], volumeFix),
            diff: itemArr[2],
          };
          // 处理增量数据
          if (data.newData && data.newData.indexOf(itemArr[0]) < 0) {
            objd.diff = 0;
          }
          dataArr.push(objd);
        }
      });

      depthListData[item] = dataArr;
      if (maxTotal < maxval) {
        maxTotal = maxval;
      }
    }
  });

  return {
    symbol: symbol.name,
    depthMaxNumber: maxTotal,
    asksData: depthListData.asks.reverse(),
    buyData: depthListData.buys,
  };
};
