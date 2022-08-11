
const oldData = {};
function dataTemplate(item, WSdata, rateData, oldObj, lan) {
  const names = item.name.split('/');
  const symbol = names[0];
  const unit = names[1];

  const showNames = item.showName ? item.showName.split('/') : null;
  const showSymbol = showNames ? showNames[0] : null;
  const showUnit = showNames ? showNames[1] : null;
  if (!WSdata.renew.length || WSdata.renew.indexOf(item.symbol.toLowerCase()) !== -1 || !oldData[item.name]) {

    const data = WSdata[item.symbol.toLowerCase()];
    const oldObj = oldData[item.name];
    const symbolItem = {};
    if (data) {
  
      const marketName = item.name.split('/')[1] || item.quoteSymbol;
      const priceFix = item.price || item.pricePrecision;
      const volumeFix = item.volume || 0;
      // 收盘价判断
      const oldClose = oldObj ? oldObj.closes : '';
      const close = fixD(data.close, priceFix);
      const cN = parseFloat(close);
      const ocN = parseFloat(oldClose);
      // 计算汇率
      let rate = 0;
      if (rateData) {
        rate = fixRate(data.close, rateData, marketName, lan);
      }
      // 最新价格 涨跌 颜色class
      let priceClass = '';
      if (ocN) {
        if (ocN > cN) {
          priceClass = 'u-4-cl';
        }
        if (ocN < cN) {
          priceClass = 'u-1-cl';
        }
      }
      // 涨跌幅判断
      const num = Math.abs(data.rose * 10000 / 100);
      let rose = null;
      let rc = null;
      if (!parseFloat(num)) {
        rose = '0.00%';
      } else {
        rose = `${Number(num.toString().match(/^\d+(?:\.\d{0,2})?/))}`;
        if (data.rose < 0) {
          rc = 'u-4-cl';
          rose = `-${rose}%`;
        }
        if (data.rose > 0) {
          rc = 'u-1-cl';
          rose = `+${rose}%`;
        }
        if (data.rose === 0) {
          rc = '';
          rose = '0.00%';
        }
      }
      if (showNames) {
        symbolItem.showSymbol = {
          symbol: showSymbol,
          unit: showUnit,
        };
      }
      symbolItem.symbol = {
        symbol,
        unit,
      };
      symbolItem.closes = close;
      symbolItem.close = {
        class: priceClass,
        data: close,
        price: rate,
      };
      symbolItem.roses = rose;
      symbolItem.rose = {
        class: rc,
        data: rose,
      };
      symbolItem.IsST = item.IsST || 0;
      symbolItem.newcoinFlag = item.newcoinFlag;
      symbolItem.sort = item.sort;
      symbolItem.name = item.name;
      symbolItem.multiple = item.multiple || '0';
      symbolItem.low = fixD(data.low, priceFix);
      symbolItem.vol = fixD(data.vol, volumeFix);
      symbolItem.high = fixD(data.high, priceFix);
      symbolItem.amount = fixD(data.amount, priceFix);
      symbolItem.holdAmount = fixD(data.holdAmount, priceFix);
      symbolItem.holdVolume = fixD(data.holdVolume, volumeFix);

      oldData[item.name] = symbolItem;
    } else {
      if (showNames) {
        symbolItem.showSymbol = {
          symbol: showSymbol,
          unit: showUnit,
        };
      }
      symbolItem.symbol = {
        symbol,
        unit,
      };
      symbolItem.closes = -99999;
      symbolItem.close = {
        class: '',
        data: '--',
        price: '--',
      };
      symbolItem.roses = -99999;
      symbolItem.rose = {
        class: '',
        data: '--',
      };
      symbolItem.isShow = true;
      symbolItem.amount = '--';
      symbolItem.low = '--';
      symbolItem.high = '--';
      symbolItem.vol = '--';
      symbolItem.multiple = item.multiple || '0';
      symbolItem.name = item.name;
      symbolItem.sort = item.sort;
      symbolItem.IsST = item.IsST || 0;
      symbolItem.newcoinFlag = item.newcoinFlag;
      oldData[item.name] = symbolItem;
    }
    return symbolItem;
  }
  return oldData[item.name];
}
//  当前币对列表， 市场队列数据， 汇率单位
const setMarketData = function (symbolList, data, rateData, lan) {
  const marketData = {};
  const symbolsKeys = Object.keys(symbolList);
  symbolsKeys.forEach((item) => {
    if (symbolList[item].symbol) {
      const symbolkey = symbolList[item].symbol;
      const itemData = data[symbolkey] || '';
      marketData[item] = dataTemplate(symbolList[item], data, rateData, oldData[symbolkey], lan);
    }
  });
  return marketData;
};



const coDataTemplate = function (wsData, rateData, lan) {
  const arr = [];
  wsData.forEach((ele) => {
    // 涨跌幅判断
    const num = Math.abs(ele.change_rate * 10000 / 100);
    let rc = null;
    const marketName = ele.symbol.split('/')[1] || item.symbol;
    // 计算汇率
    let rate = 0;
    if (rateData) {
      rate = fixRate(ele.close, rateData, marketName, lan);
    }
    if (!parseFloat(num)) {
      rose = '0.00%';
    } else {
      rose = `${Number(num.toString().match(/^\d+(?:\.\d{0,2})?/))}`;
      if (ele.change_rate < 0) {
        rc = 'u-4-cl';
        rose = `-${rose}%`;
      }
      if (ele.change_rate > 0) {
        rc = 'u-1-cl';
        rose = `+${rose}%`;
      }
      if (ele.change_rate === 0) {
        rc = '';
        rose = '0.00%';
      }
    }
    const itemSymbol = {};
    itemSymbol.IsSt = 0;
    itemSymbol.amount = ele.position_size;
    // 持仓量position_size
    itemSymbol.close = {
      class: "",
      data: ele.close, // 最新价
      price: rate, // 人民币
    };
    itemSymbol.closes = ele.close; // 最新价
    itemSymbol.high = ele.high; //最高价
    itemSymbol.holdAmount = "--";
    itemSymbol.holdVolume = "--";
    itemSymbol.low = ele.low; // 最低价
    itemSymbol.name = ele.symbol;
    itemSymbol.newcoinFlag = 0;
    itemSymbol.instrument_id = ele.instrument_id;
    itemSymbol.rose = {
      class: rc,
      data: rose,
    };
    itemSymbol.roses = rose;
    itemSymbol.showSymbol = {
      symbol: "ETC",
      unit: "USDT",
    };
    itemSymbol.sort = 0;
    itemSymbol.symbol = {
      symbol: "ETC",
      unit: "USDT",
    },
    itemSymbol.vol = ele.qty24;
    arr.push(itemSymbol);
  })
  return arr;
}
const marketDataCo = {};
const setMarketDataCo = function (symbolAll, data, rateData, lan) {
  const arr = coDataTemplate(data, rateData, lan);
  symbolAll.forEach((item) => {
      arr.forEach((ele) => {
        if (item.instrument_id === ele.instrument_id) {
          marketDataCo[item.symbol] = ele;
        }
      })
    });
  return marketDataCo;
};