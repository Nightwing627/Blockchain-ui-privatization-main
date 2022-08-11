// WebSocket
const webworkerMap = JSON.parse(decodeURIComponent(location.search.split('=')[1]));
let dir = 'static';
if(webworkerMap.baseDir){
  dir = webworkerMap.baseDir;
}
importScripts(webworkerMap.baseUrl + dir + '/js/pako.min.js');
// 公共方法
importScripts(webworkerMap.baseUrl + dir + '/web-worker/utils/' + webworkerMap['common-method']);


const sendMessage = function (type, subType, data) {
  self.postMessage({
    type,
    data: {
      type: subType,
      WsData: data,
    },
  });
};
let webSocketUrl = null;
let MywebSocket = null;
// 当前选中的币对
let currentSymbol = null;
// 24小时行情的数据队列
let marketData = {
  renew: [],
};
// 24小时行情 用来判断是否是第一次的数据
let marketDataKey = [];
// 货币汇率单位
const rateData = null;
// 24小时行情 队列延迟 时间
const marketTime = {
  socketTime: 0, // 存储上一条数据的时间
  contrastTime: 500, // 对比时间
  outTime: 500, // 延迟推送时间
  timeOut: null, // timeOut
};
// 实时成交数据队列
let tradeData = [];
// 实时成交 队列延迟 时间
const tradeTime = {
  socketTime: 0, // 存储上一条数据的时间
  contrastTime: 200, // 对比时间
  outTime: 250, // 延迟推送时间
  timeOut: null, // timeOut
};
// 盘口 深度的 级别
let curreentDepth = null;
// 盘口 深度 队列
const tickData = {
  asks: '',
  buys: '',
};
const depthTime = {
  socketTime: 0, // 存储上一条数据的时间
  contrastTime: 250, // 对比时间
  outTime: 255, // 延迟推送时间
  timeOut: null, // timeOut
};
// ECharts 深度 队列
const echartsData = {};
const echartsTime = {
  socketTime: 0, // 存储上一条数据的时间
  contrastTime: 50, // 对比时间
  outTime: 50, // 延迟推送时间
  timeOut: null, // timeOut
};


const marketReviewSend = function () {
  if (MywebSocket) {
    MywebSocket.send(JSON.stringify({
      event: 'req',
      params: {
        channel: 'review',
      },
    }));
  }
};
const markteWsSend = function (type, symbolList) {
  if (symbolList && MywebSocket) {
    symbolList.forEach((item) => {
      const data = JSON.stringify({
        event: type,
        params: {
          channel: `market_${item}_ticker`,
          cb_id: item,
        },
      })
      MywebSocket.send(data);
    });
  }
};
// 实时成交 WS 请求
const tradeWsSend = function (type, symbolCurrent) {
  if (MywebSocket && symbolCurrent) {
    const symbolArr = symbolCurrent.toLowerCase().split('/');
    const symbol = symbolArr[1] ? symbolArr[0] + symbolArr[1] : symbolArr[0];
    const num = 100;
    MywebSocket.send(
      JSON.stringify(
        {
          event: type,
          params: {
            channel: `market_${symbol}_trade_ticker`,
            cb_id: symbol,
            top: num,
          },
        },
      ),
    );
  }
};
// 盘口深度 WS 请求
const depthWsSend = function (type, symbol, depth) {
  if (MywebSocket) {
    MywebSocket.send(
      JSON.stringify(
        {
          event: type,
          params: {
            channel: `market_${symbol}_depth_step${depth}`,
            cb_id: symbol,
          },
        },
      ),
    );
  }
};
// tradingView 数据
const klineWsSend = function (parameters) {
  const { type } = parameters;
  const { symbol } = parameters;
  const { lastTimeS } = parameters;
  const { lTime } = parameters;
  const { number } = parameters;
  const params = {
    channel: `market_${symbol}_kline_${lastTimeS}`,
    cb_id: symbol,
  };
  if (lTime) {
    params.endIdx = lTime;
    params.pageSize = number;
  }
  if (MywebSocket.readyState === 1) {
    MywebSocket.send(JSON.stringify({
      event: type,
      params,
    }));
  }
};

let timeoutTop = null;
let lockReconnectTop = false;
let lockDestroyTop = false;

clearTimeout(timeoutTop);
// 心跳检测
const heartCheckTop = function () {
  const timeout = 30000;
  if (MywebSocket.readyState !== 3) {
    clearTimeout(timeoutTop);
    if (!lockReconnectTop && !lockDestroyTop) {
      timeoutTop = setTimeout(() => {
        console.log('未检测到心跳体征');
        MywebSocket.send('1111');
        MywebSocket.close();
      }, timeout);
    }
  }
};
// 重连WS
const reconnectTop = function (type) {
  if (!lockReconnectTop && !lockDestroyTop) {
    lockReconnectTop = true;
    setTimeout(() => {
      // console.log('开始执行WS重连操作');
      creatWebSocket(type);
    }, 3000);
  }
};

const creatWebSocket = function () {
  // console.log('开始链接WS');
  if (webSocketUrl) {
    MywebSocket = new WebSocket(webSocketUrl);
    MywebSocket.binaryType = 'arraybuffer';
    webSocketEvent();
    lockReconnectTop = false;
  }
};

let ii = 0;
const upperKey = function (data){
  let dataObj = data
  for (var key in dataObj){
      dataObj["\""+key.toUpperCase()+"\""] = dataObj[key];
      delete(dataObj[key]);
  }
  return dataObj;
}
const webSocketEvent = function () {
  // WS 链接成功
  MywebSocket.onopen = function () {
    sendMessage('WEBSOCKET_ON_OPEN', MywebSocket.readyState);
    // console.log('WS链接成功');
    // 开始 心跳检测
    heartCheckTop();
  };
  MywebSocket.onclose = function (data) {
    reconnectTop();
    sendMessage('WEBSOCKET_ON_OPEN', false);
    // console.log('WS已关闭');
  };
  MywebSocket.onmessage = function (event) {
    heartCheckTop(); // 重置心跳检测
    const ua = new Uint8Array(event.data);
    const data = JSON.parse(pako.inflate(ua, { to: 'string' }));
    let dataType;
    let symbolType;
    
    if (data.ping) {
      // console.log('data.ping', data.ping);
      MywebSocket.send(JSON.stringify({ pong: data.ping }));
      return false
    }
    // console.log('WSData', data)
    if (data.channel && data.channel !== 'review') {
        const channelArr = data.channel.split('_');
        // 数据币对
        symbolType = `${channelArr[1]}_${channelArr[2]}`;
        // 数据类型
        dataType = channelArr[3];
    }
    // 24小时行情 -- 全部历史数据
    if (data.channel === 'review') {
      marketData = data.data;
      // console.log('24小时行情 review', marketData);
      sendMessage('WEBSOCKET_DATA', 'FUTURE_MARKET_DATA', JSON.stringify(marketData));
    }
    // 24小时行情 -- 实时数据
    if (data.tick && dataType === 'ticker') {
      // console.log('24小时行情', data);
      marketData[symbolType] = data.tick;
      // 判断是否距离上次收到数据的时间
      if (data.ts - marketTime.socketTime >= marketTime.contrastTime) {
        clearTimeout(marketTime.timeOut);
        marketTime.socketTime = data.ts;
        sendMessage('WEBSOCKET_DATA', 'FUTURE_MARKET_DATA', JSON.stringify(marketData));
      } else {
        clearTimeout(marketTime.timeOut);
        marketTime.timeOut = null;
        marketTime.timeOut = setTimeout(() => {
          sendMessage('WEBSOCKET_DATA', 'FUTURE_MARKET_DATA', JSON.stringify(marketData));
        }, marketTime.outTime);
      }
    }
    // console.log(currentSymbol, symbolType)
    if (currentSymbol === symbolType) {
      // K线图数据
      if (data.channel && data.channel.indexOf('_kline_') > -1) {
        
        if (data.event_rep && data.event_rep === 'rep') {
          // console.log('K线历史数据', data)
          // K线历史数据
          sendMessage('WEBSOCKET_DATA', 'KLINE_DATA_REQ', JSON.stringify(data));
        } else {
          // k线实时数据
          // console.log('k线实时数据', data)
          sendMessage('WEBSOCKET_DATA', 'KLINE_DATA_SUB', JSON.stringify(data));
        }
      }
      // 盘口 深度 数据
      if (data.tick && data.channel.indexOf('depth_step') !== -1) {
        // console.log('深度数据', data)
        ii += 1;
        const depthClasses = `depth_step${curreentDepth}`;
        const channelArr = data.channel.split('_');
        const step = channelArr[channelArr.length - 1];
        if (data.channel.indexOf(depthClasses) !== -1) {
          // 增量数据
          if (data.tick.side) {
            // console.log('增量数据', data);
            const { tick } = data;
            let diff = 1;
            // 如果新的小于旧的
            if (tickData[symbolType] && tickData[symbolType][tick.side][tick.price] && tickData[symbolType][tick.side][tick.price][1] > tick.volume) {
              diff = 2;
            }
            tickData[symbolType][tick.side][tick.price] = [tick.price, tick.volume, diff];

            if (!tickData[symbolType].newData) {
              tickData[symbolType].newData = [tick.price];
            } else if (tickData[symbolType].newData.indexOf(tick.price) < 0) {
              tickData[symbolType].newData.push(tick.price);
            }
            if (data.ts - depthTime.socketTime >= depthTime.contrastTime) {
              depthTime.socketTime = data.ts;
              clearTimeout(depthTime.timeOut);
              depthTime.timeOut = null;
              sendMessage(
                'WEBSOCKET_DATA',
                'DEPTH_DATA',
                tickData[symbolType],
              );
              tickData[symbolType].newData = [];
            } else {
              clearTimeout(depthTime.timeOut);
              depthTime.timeOut = null;
              depthTime.timeOut = setTimeout(() => {
                sendMessage(
                  'WEBSOCKET_DATA',
                  'DEPTH_DATA',
                  tickData[symbolType],
                  
                );
                tickData[symbolType].newData = [];
              }, depthTime.outTime);
            }
          } else {
            // 全量数据
            // console.log('全量数据', data);
            if (data.tick.asks === null) data.tick.asks = [];
            if (data.tick.buys === null) data.tick.buys = [];
            tickData[symbolType] = {
              asks: {},
              buys: {},
            };
            data.tick.asks.forEach((item) => {
              tickData[symbolType].asks[item[0]] = item;
            });
            data.tick.buys.forEach((item) => {
              tickData[symbolType].buys[item[0]] = item;
            });
            sendMessage(
              'WEBSOCKET_DATA',
              'DEPTH_DATA',
              tickData[symbolType]
            );
          }
        }
      }
      // 实时成交 数据
      if (data.channel.indexOf('trade_ticker') !== -1) {
      // console.log('实时成交', data);
      //  最新成交 历史数据
      if (data.event_rep === 'rep') {
        sendMessage('WEBSOCKET_DATA', 'TRADE_DATA_REQ', JSON.stringify(data.data));
      }
      // 最新成交 实时数据
      if (data.tick && data.tick.data.length) {
        data.tick.data.forEach(item => {
          tradeData.unshift(item)
        })
        // 判断距离上次收到数据的时间 是否大于阈值
        if (data.ts - tradeTime.socketTime >= tradeTime.contrastTime) {
          clearTimeout(tradeTime.timeOut);
          tradeTime.socketTime = data.ts;
          sendMessage('WEBSOCKET_DATA', 'TRADE_DATA_SUB', JSON.stringify(tradeData));
          tradeData = []
        } else {
          clearTimeout(tradeTime.timeOut);
          tradeTime.timeOut = null;
          tradeTime.timeOut = setTimeout(() => {
            sendMessage('WEBSOCKET_DATA', 'TRADE_DATA_SUB', JSON.stringify(tradeData));
            tradeData = []
          }, tradeTime.outTime);
        }
      }
    }
    }
  };
};
// 关闭WS
const closeWebSocket = function () {
  // 设置 禁止在重连
  lockDestroyTop = true;
  clearTimeout(timeoutTop);
  MywebSocket.close();
};
// 监听 发送send
const webSocketSend = function (parameters) {
  // 存储当前货币对
  const { type } = parameters;
  const { sendType } = parameters;
  const { symbolData } = parameters;
  const { symbolList } = parameters;
  if(sendType === 'sub' && symbolData) {
    currentSymbol = symbolData
  }

  // 24小时行情 历史全部数据
  if (type === 'Review') {
    marketReviewSend();
  }

  // 24小时行情 实时数据
  if (type === 'Market' &&  symbolList) {
    markteWsSend(sendType, symbolList);
  }

  // 实时成交数据 Send
  if (type === 'Trade' && symbolData) {
    tradeWsSend(sendType, symbolData);
  }

  // 盘口数据 Send
  if (type === 'Depth' && symbolData) {
    curreentDepth = symbolList;
    depthWsSend(sendType, symbolData, curreentDepth);
    
  }
};

self.addEventListener('message', (event) => {
  const { data } = event;
  // 监听 创建 WS
  if (data.type === 'CREAT_WEBSOCKET') {
    if (!MywebSocket) {
      webSocketUrl = data.data.wsUrl;
      creatWebSocket(data.data.wsUrl);
    } else {
      sendMessage('WEBSOCKET_ON_OPEN', MywebSocket.readyState);
    }
  }
  if (data.type === 'CLOSE_WEBSOCKET') {
    closeWebSocket(data.data);
  }
  // 发送 send
  if (data.type === 'WEBSOCKET_SEND') {
    if (MywebSocket.readyState === 1) {
      webSocketSend(data.data);
    }
  }
  // 发送 kline send
  if (data.type === 'WEBSOCKET_KLINE_SEND') {
    klineWsSend(data.data);
  }
}, false);
