const setTradeData = function (symbol, datalist, rateData, lan) {
  const tradeData = [];
  const queueData = [];
  if (datalist && datalist.length) {
    const priceFix = symbol.price || symbol.pricePrecision;
    const volumeFix = symbol.volume || 0;
    const marketName = symbol.name.split('/')[1];
    const keyArr = [];
    let num = 0;
    datalist.forEach((item, index) => {
      // 去重 截取150条 格式化
      // if (keyArr.indexOf(item.ts) === -1) {
      if (num < 150) {
        const rate = fixRate(item.price, rateData, marketName, lan);
        const nextprice = datalist[index + 1] ? datalist[index + 1].price : null;
        let rose = null;
        if (nextprice) {
          if (nextprice > item.price) {
            rose = 'down';
          } else if (nextprice < item.price) {
            rose = 'up';
          }
        }
        tradeData.push({
          side: item.side === 'SELL' ? 'u-4-cl' : 'u-1-cl',
          // time: item.ds.split(' ')[1],
          time: formatTime(item.ts).split(' ')[1],
          rate,
          ts: item.ts,
          price: fixD(item.price, priceFix),
          vol: fixD(item.vol, volumeFix),
          rose,
          date: new Date().getTime() + index,
          change: item.change,
        });
        keyArr.push(item.ts);
        queueData.push(item);
        num += 1;
      }
      // }
    });
    // 排序 并返回数据
    return {
      tradeData: tradeData.sort((a, b) => b.ts - a.ts),
      queueDataList: queueData,
    };
  }
  return {
    tradeData,
    queueDataList: queueData,
  };
};
