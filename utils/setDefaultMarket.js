// 设置 默认市场 和 默认选中币对
// eslint-disable-next-line import/extensions
import myStorage from './mystorage';

function getSorterMaker(market) {
  let coinName = null;
  let coinSort = null;
  Object.keys(market).forEach((key) => {
    if (typeof coinSort !== 'number' || market[key].sort < coinSort) {
      coinName = key;
      coinSort = market[key].sort;
    }
  });

  return coinName;
}

export const setDefaultMarket = (data) => {
  const markTitle = myStorage.get('markTitle');
  const homeMarkTitle = myStorage.get('homeMarkTitle');
  const marketIndex = data.maket_index;
  // 默认市场
  if (!markTitle || !data.market[markTitle]) {
    const defaultMarket = data.market[marketIndex] ? marketIndex
      : Object.keys(data.market)[0];
    myStorage.set('markTitle', defaultMarket);
  }
  // 首页默认市场
  if (!homeMarkTitle || !data.market[homeMarkTitle]) {
    const defaultMarket = data.market[marketIndex] ? marketIndex
      : Object.keys(data.market)[0];
    myStorage.set('homeMarkTitle', defaultMarket);
  }

  // 设置默认币对
  const sSymbolName = myStorage.get('sSymbolName') || null;
  const sMarkTitle = myStorage.get('markTitle');
  // 如果 myStorage 中没有默认币对  或者 市场列表中没有选中的币对
  if (!sSymbolName || !data.market[sMarkTitle][sSymbolName]) {
    // const defaultSymbol = data.market[sMarkTitle][sSymbolName] ? sSymbolName
    //   : Object.keys(data.market[sMarkTitle])[0];
    const defaultSymbol = data.market[sMarkTitle][sSymbolName] ? sSymbolName
      : getSorterMaker(data.market[sMarkTitle]);
    myStorage.set('sSymbolName', defaultSymbol);
  }
};

export const setLeverDefaultMarket = (data) => {
  const leverMarkTitle = myStorage.get('leverMarkTitle');
  // // 默认市场
  if (!leverMarkTitle || !data[leverMarkTitle]) {
    const dataKey = Object.keys(data);
    const defaultMarket = dataKey[0];
    myStorage.set('leverMarkTitle', defaultMarket);
  }
  // 设置默认币对
  const leverSymbolName = myStorage.get('leverSymbolName') || null;
  const sleverMarkTitle = myStorage.get('leverMarkTitle');
  // 如果 myStorage 中没有默认币对  或者 市场列表中没有选中的币对
  if (!leverSymbolName || !(data[sleverMarkTitle] && data[sleverMarkTitle][leverSymbolName])) {
    if (data[sleverMarkTitle]) {
      const defaultSymbol = Object.keys(data[sleverMarkTitle])[0];
      myStorage.set('leverSymbolName', defaultSymbol);
    }
  }
};

// 设置当前合约名称
export const setCoMarket = (dataList) => {
  // console.log(contractList);
  let sort0 = '';
  if (dataList) {
    const contractList = dataList.sort((a, b) => a.sort - b.sort);
    const contractListName = [];
    const contractListId = {};
    contractList.forEach((item, index) => {
      if (index === 0) {
        sort0 = item.contractName;
      }
      contractListName.push(item.contractName);
      contractListId[item.contractName] = item.id;
    });
    const clientPathName = window.location.pathname.split('/');
    const clientContractNameArr = clientPathName.filter((x) => contractListName.includes(x));
    const clientContractName = clientContractNameArr[0];
    if (clientContractName) {
      myStorage.set('contractName', clientContractName);
      myStorage.set('contractId', contractListId[clientContractName]);
    } else {
      const contractName = myStorage.get('contractName');
      if (!contractName || contractListName.indexOf(contractName) === -1) {
        myStorage.set('contractName', sort0);
        myStorage.set('contractId', contractListId[sort0]);
      }
    }
  }
};
