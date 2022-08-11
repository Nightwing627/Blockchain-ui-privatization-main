// Created by 侯东东.
//  云合约
import axios from '@/api/http/axios';
import { setCoMarket, myStorage, getDigit } from '@/utils';

let timer = null;

const setCoTypeSymbol = (data) => {
  if (data) {
    const arr = data.split('-');
    return `${arr[0]}_${arr[1]}${arr[2]}`;
  }
  return null;
};
let isIframe = false;
/* eslint-disable */
if (self !== top) {
  isIframe = true;
}

export default {
  state: {
    // 是否在iframe中
    isIframe,
    // 合约列表
    contractList: null,
    // 合约列表 MAP
    contractListMap: {},
    // 合约币对列表
    contractSymbolList: [],
    // 存储当前合约信息
    contractInfo: null,
    // 前台公共实时信息
    publicMarkertInfo: {},
    // 存储当前合约名称
    contractName: myStorage.get('contractName'),
    // 存储当前合约币对
    contractSymbol: null,
    // 存储当前合约ID
    contractId: myStorage.get('contractId'),
    // 用户配置信息
    futureUserConfig: null,
    // 是否开通合约
    openContract: true,
    // 是否被冻结
    transStatus: 0,
    // 当前合约币对 小写带类型
    coTypeSymbol: setCoTypeSymbol(myStorage.get('contractName')),
    // 合约价格单位
    priceUnit: '',
    // 合约单位(标的货币||张)
    coUnit: '',
    // 合约单位类型 1标的货币, 2张 未登录默认是1
    coUnitType: myStorage.get('coUnitType') || 2,
    // 合约面值
    multiplier: '',
    // 服务器当前时间和本地时间的差
    serveTimeDiff: 0,
    // WS URL
    wsUrl: null,
    // 数量精度
    volfix: 0,
    // 价格精度
    pricefix: 4,
    // 保证金币种的精度
    coinfix: 4,
    // 合约资产
    futureAccountBalance: {},
    // 合约类型文案
    contractTypeText: {
      E: '永续',
      W: '周',
      N: '次周',
      M: '月',
      Q: '季度',
      H: '混合',
    },
    // 合约保证金信息列表
    marginCoinInfor: null,
    // 持仓列表
    positionList: null,
    // 持仓列表
    positionListNumber: null,
    // 币种列表
    marginCoinList: [],
    // 可平数量列表 {BUY: 可凭多  SELL：可凭空}
    activeCanClose: [],
    // 当前委托列表
    currentOrderLis: [],
    // 当前普通单委托数量
    orderCount: 0,
    // 当前条件单委托数量
    triggerOrderCount: 0,
  },
  mutations: {
    // 存储WS地址
    WS_URL(state, data) {
      state.wsUrl = data;
    },
    // 存储合约列表
    CO_PUBLIC_INFO(state, data) {
      state.contractList = data;
    },
    // 全部合约币对列表（发送WS send ）
    CONTRACT_SYMBOL_LIST(state, data) {
      state.contractSymbolList = data;
    },
    //
    SET_COUNIT_TYPE(state, data) {
      state.coUnitType = data;
    },
    SET_COUNIT_TEXT(state, data) {
      state.coUnit = data;
    },
    // 存储当前合约信息
    ACTIVE_CONTRACT_DATA(state, data) {
      state.contractInfo = data;
      // 合约面值
      state.multiplier = data.multiplier;
      // 数量精度 (合约面值后面的小数点的位数)
      state.volfix = getDigit(data.multiplier);
      // 合约币对价格精度
      state.pricefix = data.coinResultVo.symbolPricePrecision;
      // 保证金币种的精度
      state.coinfix = data.coinResultVo.marginCoinPrecision;
      // 配置合约数量默认单位
      if (!state.futureUserConfig) {
        if (state.coUnitType === 1) {
          state.coUnit = data.multiplierCoin;
        } else {
          // state.coUnit = '张';
        }
      }
      state.priceUnit = data.quote;
    },
    // 存储当前合约名称
    CONTRACT_NAME(state, data) {
      state.contractName = data;
    },
    // 存储当前合约币对
    CONTRACT_SYMBOL(state, data) {
      state.contractSymbol = data;
    },
    // 存储当前合约ID
    CONTRACT_ID(state, data) {
      state.contractId = data;
    },
    CONTRACT_TYPE_SYMBOL(state, data) {
      state.coTypeSymbol = data;
    },
    // 存储用户配置信息
    GET_USER_CONFIG(state, data) {
      // 是否开通了合约
      state.openContract = !!data.openContract;
      // 是否被冻结
      state.transStatus = data.transStatus;
      // 合约单位
      state.coUnitType = data.coUnit;
      myStorage.set('coUnitType', data.coUnit);
      if (data.coUnit === 1) {
        state.coUnit = data.multiplierCoin;
      } else {
        // state.coUnit = '张';
      }
      // 用户配置信息
      state.futureUserConfig = data;
    },
    // 服务器当前时间和本地时间的差
    SERVE_TIME_DIFF(state, data) {
      // 用户配置信息
      state.serveTimeDiff = data;
    },
    // 前台公共实时信息
    PUBLIC_MARKER_INFO(state, data) {
      state.publicMarkertInfo = data;
    },
    // 资产详情信息
    ACCOUNT_BALANCE(state, data) {
      state.futureAccountBalance = data;
    },
    // 抽取 保证金币种信息列表
    MARGIN_COIN_INFOR(state, data) {
      state.marginCoinInfor = data;
    },
    POSITION_LIST(state, data) {
      state.positionList = data;
      state.positionListNumber = data ? data.length : 0;
    },
    // 币种列表
    SYMBOL_LOST(state, data) {
      state.marginCoinList = data;
    },
    // 可平数量列表
    ACTIVE_CAN_CLOSE(state, data) {
      state.activeCanClose = data;
    },
    // 合约列表信息 MAP
    CONTRACT_LIST_MAP(state, data) {
      state.contractListMap = data;
    },
    // 当前合约订单列表
    CURRENT_OTDER_LIST(state, data) {
      state.currentOrderLis = data;
    },
    // 当前普通单委托数量
    ORDER_COUNT(state, data) {
      state.orderCount = data;
    },
    // 当前条件单委托数量
    TRIGGER_ORDER_COUNT(state, data) {
      state.triggerOrderCount = data;
    },
  },
  actions: {
    // 获取合约列表数据
    getFutorePublicInfo({ commit, dispatch }) {
      axios({
        url: this.state.url.futures.publicInfo,
        method: 'post',
        hostType: 'co',
      }).then((rs) => {
        if (rs.code === '0') {
          const { contractList, marginCoinList } = rs.data;
          setCoMarket(contractList);
          commit('WS_URL', rs.data.wsUrl);
          // 设置时间差
          if (rs.data.currentTimeMillis) {
            const now = new Date().getTime();
            commit('SERVE_TIME_DIFF', rs.data.currentTimeMillis - now);
          }
          const contractListArr = [];
          if (contractList && contractList.length) {
            const symbolList = [];
            const marginCoinInfor = {};
            const contractListMap = {};
            contractList.forEach((item) => {
              const dataItem = item;
              const { contractName } = dataItem;
              // 发送WS send 的时候使用的币对名
              const symbolArr = contractName.toLowerCase().split('-');
              const symbol = `${symbolArr[0]}_${symbolArr[1]}${symbolArr[2]}`;
              symbolList.push(symbol);
              // wsDatakey 接收WS 数据时 使用的Key
              dataItem.wsDatakey = symbol;
              contractListArr.push(dataItem);

              contractListMap[contractName] = dataItem || {};
              // 保证金币种精度
              const { marginCoinPrecision, symbolPricePrecision } = dataItem.coinResultVo;
              contractListMap[contractName].mCionFix = marginCoinPrecision;
              // 价格精度
              contractListMap[contractName].priceFix = symbolPricePrecision;
              // 数量精度（标的货币时使用， 合约面值小数点后面的位数）
              contractListMap[contractName].volfix = getDigit(dataItem.multiplier);

              // 抽取保证金币种信息
              marginCoinInfor[dataItem.marginCoin] = {
                // 保证金币种
                marginCoin: dataItem.marginCoin,
                // 保证金币种精度
                marginCoinPrecision: dataItem.coinResultVo.marginCoinPrecision,
                // 限制转入
                fundsInStatus: dataItem.coinResultVo.fundsInStatus,
                // 限制转出
                fundsOutStatus: dataItem.coinResultVo.fundsOutStatus,
              };
            });
            // 全部合约列表
            commit('CO_PUBLIC_INFO', contractListArr);
            // 全部合约币对列表（发送WS send ）
            commit('CONTRACT_SYMBOL_LIST', symbolList);
            // 保存 保证金信息列表
            commit('MARGIN_COIN_INFOR', marginCoinInfor);
            // 设置当前合约信息
            dispatch('setActivePublicInfo');
            // 币种列表
            commit('SYMBOL_LOST', marginCoinList);
            // 合约列表信息 MAP
            commit('CONTRACT_LIST_MAP', contractListMap);
          }
        }
      });
    },
    // 存储当前合约信息
    setActivePublicInfo({ commit, state, dispatch }) {
      const contractName = myStorage.get('contractName');
      const { contractList } = state;
      commit('CONTRACT_NAME', contractName);
      contractList.forEach((item) => {
        if (contractName === item.contractName) {
          // 当前合约ID
          commit('CONTRACT_ID', item.id);
          // 当前合约币对大写 不带类型
          commit('CONTRACT_SYMBOL', item.symbol.replace('-', ''));
          // 当前合约币对 小写加类型（WS的时候需要用到）
          const coTypeSymbol = `${item.contractType}_${item.symbol.replace('-', '')}`;
          commit('CONTRACT_TYPE_SYMBOL', coTypeSymbol.toLowerCase());
          // 当前合约信息
          commit('ACTIVE_CONTRACT_DATA', item);
          dispatch('getPublicMarkertInfo');
        }
      });
    },
    // 获取用户配置信息
    getUserConfig({ commit, state }) {
      if (!state.contractId) {
        clearInterval(timer);
        timer = setInterval(() => {
          if (state.contractId) {
            clearInterval(timer);
            axios({
              url: this.state.url.futures.getUserConfig,
              method: 'post',
              hostType: 'co',
              params: {
                contractId: state.contractId,
              },
            }).then((rs) => {
              if (rs.code === '0') {
                commit('GET_USER_CONFIG', rs.data);
              }
            });
          }
        }, 500);
      } else {
        axios({
          url: this.state.url.futures.getUserConfig,
          method: 'post',
          hostType: 'co',
          params: {
            contractId: state.contractId,
          },
        }).then((rs) => {
          if (rs.code === '0') {
            commit('GET_USER_CONFIG', rs.data);
          }
        });
      }
    },
    // 获取前台公共实时信息
    getPublicMarkertInfo({ commit, state }) {
      if (state.contractId) {
        axios({
          url: this.state.url.futures.publicMarkertInfo,
          method: 'post',
          hostType: 'co',
          params: {
            contractId: state.contractId,
          },
        }).then((rs) => {
          if (rs.code === '0') {
            commit('PUBLIC_MARKER_INFO', rs.data);
          }
        });
      }
    },
    // 请求合约资产
    getAccountBalance({ commit, state }) {
      if (state.contractInfo) {
        axios({
          url: this.state.url.futures.accountBalance,
          method: 'post',
          hostType: 'co',
          params: {
            marginCoin: state.contractInfo.marginCoin,
          },
        }).then((rs) => {
          if (rs.code === '0') {
            commit('ACCOUNT_BALANCE', rs.data.accounts[0]);
          }
        });
      }
    },
    // 获取持仓列表+资产
    getPositionList({ commit }) {
      axios({
        url: this.state.url.futures.getAssetsList,
        method: 'post',
        hostType: 'co',
        params: {},
      }).then((rs) => {
        if (rs.code === '0' && rs.data) {
          const { positionList, accountList } = rs.data;
          // 资产列表
          if (accountList && accountList.length) {
            const data = {};
            accountList.forEach((item) => {
              data[item.symbol] = item;
            });
            commit('ACCOUNT_BALANCE', data);
          } else {
            commit('ACCOUNT_BALANCE', null);
          }

          // 持仓列表
          commit('POSITION_LIST', positionList);
          if (positionList && positionList.length) {
            // 可平数量
            const activeCanClose = {};
            positionList.forEach((item) => {
              if (activeCanClose[item.contractName]) {
                activeCanClose[item.contractName][item.orderSide] = item.canCloseVolume;
              } else {
                activeCanClose[item.contractName] = {
                  [item.orderSide]: item.canCloseVolume,
                };
              }
            });
            // 可平数量
            commit('ACTIVE_CAN_CLOSE', activeCanClose);
          }
        }
      });
    },
    // 领取赠金
    getReceiveCoupon({ dispatch }) {
      axios({
        url: this.state.url.futures.receiveCoupon,
        method: 'post',
        hostType: 'co',
        params: {},
      }).then((rs) => {
        if (rs.code === '0') {
          dispatch('getUserConfig');
        }
      });
    },
    // 获取用户委托计数
    getUserOrderCount({ commit, state }) {
      axios({
        url: this.state.url.futures.getUserOrderCount,
        method: 'post',
        hostType: 'co',
        params: {
          contractId: state.contractId,
        },
      }).then((rs) => {
        if (rs.code === '0') {
          commit('ORDER_COUNT', rs.data.orderCount);
          commit('TRIGGER_ORDER_COUNT', rs.data.triggerOrderCount);
        }
      });
    },

  },

};
