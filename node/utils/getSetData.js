const fs = require('fs');
const path = require('path');
const { cloneDeep } = require('lodash');
const dirExists = require('./mkdir');
const hostFilter = require('./host-filter');
const getLocales = require('./getLocale');
const setSkin = require('./setSkin');

const formatTime = (dateTime) => {
  const date = new Date(dateTime);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  function s(t) {
    return t < 10 ? `0${t}` : t;
  }

  return `${year}-${s(month)}-${s(day)} ${s(hours)}:${s(minutes)}:${s(seconds)}`;
};

const getSetData = async (domainData, host, app, fileBasePath, api, lan) => {
  dirExists(fileBasePath);
  const serverConfigPath = path.join(__dirname, './../../../../serverConfig.json');
  let urlHost = 'http://127.0.0.1';
  let apiProxy = '/fe-ex-api';
  let headersHost = '';
  let ip = '';
  if (fs.existsSync(serverConfigPath)) {
    const jsonData = JSON.parse(fs.readFileSync(serverConfigPath, 'utf8'));
    urlHost = jsonData.curlHost;
    apiProxy = jsonData.proxy;
    ip = app.config.LOCAL_IP;
    headersHost = jsonData.headerHost;
  }
  if (domainData) {
    let header = {
      host: headersHost.length
        ? `${headersHost}.${domainData.fileName}`
        : host,
    };
    if (app.config.env === 'local') {
      urlHost = app.config.devUrlProxy.ex;
      header = {};
    }
    if (lan) {
      header['exchange-language'] = lan;
    }
    if (ip) {
      header['X-Forwarded-For'] = ip;
    }
    header['Content-Type'] = 'application/json';
    const res = await app.ctx.curl(`${urlHost}${apiProxy}/${api}`, {
      dataType: 'json',
      method: 'POST',
      timeout: '30000',
      headers: header,
      data: JSON.stringify({
        uaTime: formatTime(new Date().getTime()),
      }),
    });
    if (res.status === 200 && res.data.code.toString() === '0') {
      if (api.indexOf('public_info') > -1) {
        if (res.data.data.skin_new) {
          setSkin(domainData, app, app.config.skinsPath, res.data.data.skin_new);
        }
        if (res.data.data.locales) {
          getLocales(domainData, app, res.data.data.locales);
        }
        if (res.data.data.market && res.data.data.market.market) {
          const { coinList, market } = res.data.data.market;
          if (Object.keys(market).length && Number(res.data.data.switch.etfNavigationSwitch)) {
            res.data.data.switch.etfOpen = true;
          }
          const setSymbolAll = (result) => {
            const symbolAll = {};
            const marketKey = Object.keys(result.market);
            marketKey.forEach((item) => {
              const symbolKey = Object.keys(result.market[item]);
              symbolKey.forEach((symbol) => {
                symbolAll[symbol] = result.market[item][symbol];
                // 判断隐藏区开没开启 没有isShow默认都显示

                const { isShow } = result.market[item][symbol];
                if (typeof isShow === 'undefined' || Object.prototype.toString.call(isShow) === 'Null') {
                  symbolAll[symbol].isShow = 1;
                }
              });
            });
            return symbolAll;
          };
          const myCoinList = {};
          Object.keys(coinList).forEach((item) => {
            if (!coinList[item].fiatPrecision) {
              myCoinList[item] = {
                ...coinList[item],
                fiatPrecision: { cny: '2', usd: '2', krw: '2' },
              };
            } else {
              const coin = cloneDeep(coinList[item]);
              if (app.config.buildEnv === 'ex' && coin.symbolPrecision) {
                coin.fiatPrecision = coin.symbolPrecision;
              }
              myCoinList[item] = { ...coin };
            }
          });
          const myMarket = { ...res.data.data.market, coinList: myCoinList };
          res.data.data.symbolAll = setSymbolAll(myMarket);
        }
      }
      let intoPath = `${fileBasePath}${domainData.fileName}.json`;
      if (lan) {
        intoPath = `${fileBasePath}${lan}-${domainData.fileName}.json`;
      }
      fs.writeFile(intoPath, JSON.stringify({ data: res.data.data }, 'utf8'), (error) => {
        if (error) {
          const errorData = {
            domain: domainData.domainName, // 域名
            message: `${api} 保存失败`, // 描述
            error,
          };
          if (!hostFilter.test(domainData.domainName)) {
            app.logger.error(JSON.stringify(errorData));
          }
        }
        const errorData = {
          domain: domainData.domainName, // 域名
          message: `${api} 请求成功`, // 描述
        };
        if (!hostFilter.test(domainData.domainName)) {
          app.logger.error(JSON.stringify(errorData));
        }
      });
    } else {
      const errorData = {
        domain: domainData.domainName, // 域名
        message: res.status === 200 ? `${api}报错 code非0` : `${api}报错 status非200`, // 描述
        key: res.status === 200 ? 'res.data.message' : 'res.status', // key
        data: res.status === 200 ? JSON.stringify(res.data) : res.status, // value
      };
      if (!hostFilter.test(domainData.domainName)) {
        app.logger.error(JSON.stringify(errorData));
      }
    }
  }
};

module.exports = getSetData;
