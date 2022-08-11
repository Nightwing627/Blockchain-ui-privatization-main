import cloneDeep from 'lodash/cloneDeep';
import axios from '@/api/http/axios';
import {
  getComplexType,
  getCountryList,
  fixUrl,
  removeCookie,
  setCookie,
  getCookie,
  myStorage,
  setDefaultMarket,
  setLeverDefaultMarket,
} from '@/utils';

const SETISAPP = 'SETISAPP';
const GETPUBLICINFO = 'GETPUBLICINFO'; // 公共数据 public_info
const GETAPPDOWNLOAD = 'GETAPPDOWNLOAD'; // app下载
const GETMARKET = 'GETMARKET'; // 公共 币对 数据
const USERINFO = 'USERINFO'; // userinfo数据
const USERINFOISREADY = 'USERINFOISREADY'; // 修改userInfoIsReady
const SYMBOLALL = 'SYMBOLALL'; // 全部币对列表对象 {}
const RATE = 'RATE'; // 设置汇率单位
const DELETEISLOGIN = 'DELETEISLOGIN'; // 清理登录状态
const GETFOOTERHEADERINFO = 'GETFOOTERHEADERINFO'; // 自定义footer和header模板
const MESSAGECOUNT = 'MESSAGECOUNT';
const GETOTCPUBLICINFO = 'GETOTCPUBLICINFO';
const SETLAN = 'SETLAN';
const GETCOPUBLICINFO = 'GETCOPUBLICINFO'; // 合约公共数据 public_info
const IMGTOKEN = 'IMGTOKEN';
const CLIENTUPLOAD = 'CLIENTUPLOAD';
const IS_OPEN_BIGDEAL = 'IS_OPEN_BIGDEAL';
const SETKRWFLAG = 'SETKRWFLAG';
const TEMPLATELAYOUTTYPE = 'TEMPLATELAYOUTTYPE'; // 模板类型 国际版 or 中国版
const SETLEVERMARKET = 'SETLEVERMARKET';
const INDEXHEADERTITLE = 'INDEXHEADERTITLE';
const COINSYMBOLINTRODUCE = 'COINSYMBOLINTRODUCE';
const SYMBOLPROFILE = 'SYMBOLPROFILE'; // trade页面 币种弹窗开关
const ENFORCE_GOOGLE_AUTH = 'ENFORCE_GOOGLE_AUTH';
const ISMOREPOSITION = 'ISMOREPOSITION'; // 合约分仓开关
const NEW_COIN_OPEN = 'NEW_COIN_OPEN';
const IS_INVITE_OPEN = 'IS_INVITE_OPEN';
const IS_DEPOSIT_OPEN = 'IS_DEPOSIT_OPEN';
const TRADE_BOARD_IS_FOLD = 'TRADE_BOARD_IS_FOLD';
const TRADE_DEPTH_IS_FLASH = 'TRADE_DEPTH_IS_FLASH';
const INDEX_LAYER_OPEN = 'INDEX_LAYER_OPEN';
const OPTIONAL_SYMBOL_SERVER_OPEN = 'OPTIONAL_SYMBOL_SERVER_OPEN'; // 自选币对开关
const FIAT_OPEN = 'FIAT_OPEN';
const LEVER_OPEN = 'LEVER_OPEN';
const HAS_TRADE_LIMIT_OPEN = 'HAS_TRADE_LIMIT_OPEN';
const IS_NEWCOIN_PROJECT_ENTRANCE = 'IS_NEWCOIN_PROJECT_ENTRANCE';
const LIMIT_COUNTRY_LIST = 'LIMIT_COUNTRY_LIST';
const SET_DEFAULT_COUNTRYCODE = 'SET_DEFAULT_COUNTRY_CODE';
const SET_INTERFACES_WITCH = 'SET_INTERFACES_WITCH';
const SET_COUNTRY_OBJ = 'SET_COUNTRY_OBJ';
const SET_IS_OPEN_UPLOAD_IMG = 'SET_IS_OPEN_UPLOAD_IMG';
const INCREMENT_CONFIG_STATUS = 'INCREMENT_CONFIG_STATUS';
const SWIPERFLAG = 'SWIPERFLAG';
const EXCHIEFPROJECTSWITCH = 'EXCHIEFPROJECTSWITCH'; // 首页模板类型
const SET_EXCHIEF_REDIRECT = 'SET_EXCHIEF_REDIRECT';
const HOMEbOARDtYPE = 'HOMEbOARDtYPE';
const COIN_TAG_OPEN = 'COIN_TAG_OPEN';
const COIN_TAG_LANGS = 'COIN_TAG_LANGS';
const AGENT_USER_OPEN = 'AGENT_USER_OPEN'; // 经纪人开关
const THIRD_PARTY_LOGIN_DATA = 'THIRD_PARTY_LOGIN_DATA'; // 第三方登录请求数据
const APP_AUTH_OPEN = 'APP_AUTH_OPEN'; // 比交所实名验证开关
const IS_INNER_TRANSFER_OPEN = 'IS_INNER_TRANSFER_OPEN'; // 站内直转开关
const KYC_TYPE = 'KYC_TYPE'; // 实名验证类型
let previewIndexInternationalOpen = null;
const IS_HIDEN = fixUrl('is_hiden');
if (fixUrl('homeBoard') && fixUrl('preview')) {
  // previewIndexInternationalOpen = fixUrl('homeBoard') > 8 ? 1 : fixUrl('homeBoard');
  previewIndexInternationalOpen = fixUrl('homeBoard');
} else {
  // eslint-disable-next-line no-console
  console.log('not in preview');
}

const lanMap = {
  zh_CN: 'cny',
  en_US: 'usd',
  el_GR: 'cny',
  ko_KR: 'krw',
  mn_MN: 'mnt',
  ru_RU: 'rub',
  ja_JP: 'jpy',
};

export default {
  state: {
    isApp: false, // 当前承载端是否为app
    // 公共 public Info 数据
    publicInfo: null,
    // 公共 public Info 数据
    otcPublicInfo: null,
    // 合约 公共 public Info 数据
    coPublicInfo: null,
    // 公共 市场币对数据
    market: null,
    // 全部 货币对
    symbolAll: null,
    // 公共 用户数据
    userInfo: null,
    // 公共 是否登录 userInfo请求成功 且返回code为0 会把该值变为true
    isLogin: false,
    // userInfo请求成功 不辨别code 会把该值变为true
    userInfoIsReady: false,
    // 汇率计算单位
    rate: null,
    // 自选比对
    worker: null,
    defaultFiatPrecision: '4',
    // 自定义四footer 模板
    footerTemplate: null,
    // 自定义hander 模板
    headerTemplate: null,
    // 未读消息数量
    messageCount: null,
    // 未读消息前4条
    userMessageList: null,
    // krw首页弹窗flag
    krwFlag: false,
    lan: '',
    app_download: null,
    storageClean: false,
    imgToken: {},
    client_img_upload_open: '0',
    // 杠杆market
    leverMarket: {},
    is_open_bigDeal: 0,
    // 首页模板
    // 0: china, 1:international, 2:biki, 3:momo,
    // 4:japanese, 5:korea, 6:europe, 7:bidesk, 8:bitWind,
    index_international_open: 0,
    templateLayoutType: '1',
    indexHeaderTitle: {},
    coinSymbolIntroduce: [], // trade页面 币种弹窗数据
    symbol_profile: 0, // trade页面 币种弹窗开关
    is_more_position: 0, // 合约分仓开关
    index_layer_open: 0,
    is_open_upload_img: 0,
    newcoinOpen: null,
    is_deposit_open: 0,
    trade_depth_is_flash: 0,
    fiat_open: 0,
    lever_open: 0,
    is_newcoin_project_entrance: 0,
    is_enforce_google_auth: 0, // 是否开启强制谷歌验证模式
    has_trade_limit_open: 0, // 是否开启买入卖出限制交易
    limitCountryList: [], // 限制不可注册 不可实名认证的国家
    phoneCodeGlobal: {},
    footerTemplateReceived: false,
    interfaceSwitch: false,
    defaultCountryCode: '',
    countryObj: {},
    defaultCountryCodeReal: '',
    trade_board_is_fold: 0, // 侧边栏不根据屏幕大小显示
    incrementConfigStatus: 0, // 新理财相关配置 0.关 1.开
    swiperFlag: false,
    exchief_project_switch: 0, // 是否显示全部支付方式
    exchief_arr_filter: [],
    coin_tag_open: 0, // 币种标签开关
    outSideIntertMethodscoinTagLangs: {}, // 币种标签名称
    is_invite_open: 0,
    agentUserOpen: null, // 经纪人开关
    thirdPartyLoginData: null,
    app_auth_open: 0, // 比交所实名验证开关
    is_inner_transfer_open: 0, // 站内划转开关
    nameVerifiedType: 10, // 比交所实名验证开关
  },
  actions: {
    setIsApp({ commit }, flag) {
      commit('SETISAPP', flag);
    },
    getUserInfo({ commit }) {
      axios({
        url: this.state.url.common.user_info,
        method: 'post',
      }).then((data) => {
        commit('USERINFOISREADY');
        if (data.code === '0') {
          // data.data.googleStatus = 0;
          // data.data.isOpenMobileCheck = 0;
          commit('USERINFO', data.data);
        }
      });
    },
    // 获取app下载
    getAppDownload({ commit }) {
      axios({
        url: this.state.url.common.app_download,
        method: 'post',
      }).then((data) => {
        if (!Number(data.code)) {
          commit('GETAPPDOWNLOAD', data.data);
        }
      });
    },
    // 获取 public_info 数据
    getPublicInfo({
      commit, state, dispatch,
    }) {
      // 只需要Market的数据
      const setMarketInforData = (data) => {
        // 前market中的代码
        if (data.market) {
          const setSymbolAll = (result) => {
            const symbolAll = {};
            const marketKey = Object.keys(result.market);
            marketKey.forEach((item) => {
              const symbolKey = Object.keys(result.market[item]);
              symbolKey.forEach((symbol) => {
                symbolAll[symbol] = result.market[item][symbol];
                // 判断隐藏区开没开启 没有isShow默认都显示

                const { isShow } = result.market[item][symbol];
                if (typeof isShow === 'undefined' || getComplexType(isShow) === 'Null') {
                  symbolAll[symbol].isShow = 1;
                }
              });
            });

            return symbolAll;
          };
          const myCoinList = {};
          const { coinList } = data.market;
          const { website } = this.state;
          Object.keys(coinList).forEach((item) => {
            if (!coinList[item].fiatPrecision) {
              myCoinList[item] = {
                ...data.data.market.coinList[item],
                fiatPrecision: { cny: '2', usd: '2', krw: '2' },
              };
            } else {
              const coin = cloneDeep(coinList[item]);
              if (website === 'ex' && coin.symbolPrecision) {
                coin.fiatPrecision = coin.symbolPrecision;
              }
              myCoinList[item] = { ...coin };
            }
          });
          const myMarket = { ...data.market, coinList: myCoinList };
          setDefaultMarket(myMarket);

          commit('GETMARKET', myMarket);
          commit('RATE', myMarket.rate);
          commit('SYMBOLALL', setSymbolAll(myMarket));
        }
      };
      // Market 和 Public 的数据都需要
      const setBaseDate = (data) => {
        const { lanList } = data.lan;
        const lan = {};
        lan.lanList = [];
        lan.defLan = data.lan.defLan;
        lanList.forEach((item) => {
          if (item.defaultFiat) {
            lan.lanList.push({ ...item });
          } else {
            lan.lanList.push({ ...item, defaultFiat: lanMap[item.id] });
          }
        });
        const myData = { ...data, lan };
        if (window.clientUrl) {
          const urls = {};
          const urlKeys = Object.keys(window.clientUrl);
          urlKeys.forEach((item) => {
            if (item) {
              urls[item] = window.clientUrl[item];
            }
          });
          myData.url = { ...myData.url, ...urls };
          myData.market.wsUrl = urls.wsUrl;
        }
        const leverMarket = {};
        if (data.switch && data.market) {
          if (data.switch.lever_open && data.switch.lever_open.toString() === '1') {
            const { market } = data.market;
            Object.keys(market).forEach((item) => {
              const obj = {};
              Object.keys(market[item]).forEach((citem) => {
                if (market[item][citem].is_open_lever) {
                  obj[citem] = market[item][citem];
                }
              });
              if (Object.keys(obj).length) {
                leverMarket[item] = obj;
              }
            });
          }
          if (data.switch.lever_open && data.switch.lever_open.toString() === '1') {
            setLeverDefaultMarket(leverMarket);
          }
        }
        commit('SETLEVERMARKET', leverMarket);
        commit('GETPUBLICINFO', myData);
      };
      // 只需要 Public 的数据
      const sloveData = (data) => {
        // data.switch.fiat_trade_open = '1';
        commit('GETPUBLICINFO', data);
        // 临时添加-结束 后续由服务器添加配置
        if (data.sKinData) {
          myStorage.set('skin', data.sKinData);
          myStorage.set('skinTyp', data.skinType);
        } else if (data.skin) {
          myStorage.set('skin', data.skin);
        }
        if (data.skin) {
          const defSkin = getCookie('defSkin');
          const cusSkin = getCookie('cusSkin');
          if (!cusSkin || cusSkin === 'none') {
            setCookie('changeSkin', data.skin.changeSkin);
            setCookie('defSkin', data.skin.default);
            setCookie('cusSkin', data.skin.default);
            if (defSkin) {
              if (defSkin !== data.skin.default) {
                if (!window.name) {
                  window.location.reload();
                }
              }
            }
          }
        } else {
          myStorage.set('skin', '');
          myStorage.set('colorMap', '');
          myStorage.set('imgMap', '');
        }
        const cookieLan = getCookie('lan');
        const { defLan, lanList } = data.lan;
        let language = '';

        if (cookieLan && defLan && lanList) {
          lanList.forEach((item) => {
            if (item.id === cookieLan) {
              language = cookieLan;
            }
          });
        }
        if (!language) {
          language = defLan;
          setCookie('lan', language);
        }
        commit('SETLAN', language);
        commit('SWIPERFLAG', true);

        commit(LIMIT_COUNTRY_LIST, data.limitCountryList || []);
        commit(ENFORCE_GOOGLE_AUTH, Number(data.switch.is_enforce_google_auth) || 0);
        commit(LEVER_OPEN, Number(data.switch.lever_open));
        commit('NEW_COIN_OPEN', data.switch.newcoinOpen);
        commit('AGENT_USER_OPEN', data.switch.agentUserOpen);
        commit('IS_DEPOSIT_OPEN', Number(data.switch.is_deposit_open));
        commit('TRADE_BOARD_IS_FOLD', Number(data.switch.trade_board_is_fold));
        commit('TRADE_DEPTH_IS_FLASH', data.switch.trade_depth_is_flash);

        commit(APP_AUTH_OPEN, Number(data.switch.yskyc_is_open) || 0);
        commit(IS_INNER_TRANSFER_OPEN, Number(data.switch.is_inner_transfer_open) || 0);

        commit('IS_OPEN_BIGDEAL', data.switch.is_open_bigDeal);
        commit(INCREMENT_CONFIG_STATUS, Number(data.switch.incrementConfigStatus) || 0);
        if (data.switch.client_img_upload_open) {
          commit('CLIENTUPLOAD', data.switch.client_img_upload_open);
        }

        if (data.switch.is_open_upload_img) {
          commit(SET_IS_OPEN_UPLOAD_IMG, data.switch.is_open_upload_img);
        }

        if (data.indexHeaderTitle) {
          commit('INDEXHEADERTITLE', data.indexHeaderTitle);
        }
        if (data.switch.interfaceSwitch) {
          commit(SET_INTERFACES_WITCH, Number(data.switch.interfaceSwitch));
        }
        if (data.switch.index_layer_open) {
          commit(INDEX_LAYER_OPEN, Number(data.switch.index_layer_open));
        }
        if (data.switch.is_invite_open) {
          commit(IS_INVITE_OPEN, Number(data.switch.is_invite_open));
        }
        if (data.switch.optional_symbol_server_open) {
          commit(OPTIONAL_SYMBOL_SERVER_OPEN, Number(data.switch.optional_symbol_server_open));
        }
        if (data.switch.is_newcoin_project_entrance) {
          commit(IS_NEWCOIN_PROJECT_ENTRANCE, Number(data.switch.is_newcoin_project_entrance));
        }
        if (data.switch.index_international_open) {
          commit('TEMPLATELAYOUTTYPE', Number(data.switch.index_international_open));
        }
        // 设置首页模板
        if (previewIndexInternationalOpen && Number(previewIndexInternationalOpen)) {
          commit('HOMEbOARDtYPE', Number(previewIndexInternationalOpen));
        } else if (data.switch.index_temp_type) {
          commit('HOMEbOARDtYPE', Number(data.switch.index_temp_type));
        }

        if (data.switch.fiat_open) {
          commit(FIAT_OPEN, Number(data.switch.fiat_open));
        }

        if (data.switch.has_trade_limit_open) {
          commit(HAS_TRADE_LIMIT_OPEN, Number(data.switch.has_trade_limit_open));
        }
        // kyc类型
        // ”00“ face++
        // ”01“羽山kyc
        // “02”简版自动
        // ”10“ 人工
        if (data.switch.nameVerifiedType) {
          commit(KYC_TYPE, data.switch.nameVerifiedType);
        }

        if (data.msg.default_country_code || data.msg.default_country_code_real) {
          commit(SET_DEFAULT_COUNTRYCODE, {
            default_country_code: data.msg.default_country_code,
            default_country_code_real: data.msg.default_country_code_real
              ? `+${data.msg.default_country_code_real}`
              : '',
          });
        }
        // 如果是exchief商户检查otc/publicinfo接口是否比v4接口快一步加载；如果快则进行数据处理；
        if (Number(data.switch.Exchief_project_switch)) {
          commit(EXCHIEFPROJECTSWITCH, data.switch.Exchief_project_switch);
          if (state.otcPublicInfo
             && state.otcPublicInfo.payments.length === 3
             && state.exchief_arr_filter.length) {
            const exchiefObj = [];
            state.exchief_arr_filter.forEach((obj) => {
              if (
                obj.key === 'otc.payment.paypal'
                || obj.key === 'otc.payment.MTNmobile'
                || obj.key === 'otc.payment.VodafoneCash'
                || obj.key === 'otc.payment.AirtelTigo'
              ) {
                exchiefObj.push(obj);
              }
            });
            commit('SET_EXCHIEF_REDIRECT', exchiefObj);
          }
        }
        const symbolProfile = Number(data.switch.symbol_profile);
        commit('SYMBOLPROFILE', symbolProfile);
        if (symbolProfile === 1) {
          dispatch('getCoinSymbolIntroduce');
        }
        if (state.storageClean) {
          if (!window.name) {
            window.location.reload();
          }
        }
        // 动态添加 js 比如 客服  和 统计的js
        const newScript = document.createElement('script');
        newScript.type = 'text/javascript';
        newScript.innerHTML = data.msg.config_footer_js;
        document.getElementsByTagName('head')[0].appendChild(newScript);

        // 这个是给外部保留一个接口 外部可传入方法
        // eslint-disable-next-line
        if (this['_actions'].outSideIntertMethods) {
          dispatch('outSideIntertMethods', data);
        }
        const { coinTagLangs = {} } = data.market;
        const currentLan = getCookie('lan');
        commit(COIN_TAG_OPEN, Number(data.switch.coin_tag_open) || 0);
        commit(COIN_TAG_LANGS, coinTagLangs[currentLan] || {});
      };
      // 获取 public-info数据
      const getInfo = () => new Promise((resolve) => {
        const params = {};
        if (IS_HIDEN) {
          params.is_hiden = IS_HIDEN;
        }
        axios({
          url: this.state.url.common.public_info,
          method: 'post',
          params,
        }).then((data) => {
          if (data.code === '0') {
            const a = '11';
            const localClear = myStorage.get('localClear');
            if (a !== localClear) {
              myStorage.clear();
              myStorage.set('localClear', a);
              state.storageClean = true;
            }
            sloveData(data.data);
            setMarketInforData(data.data);
            setBaseDate(data.data);
            resolve(data.data);
          }
        });
      });
      if (!window.publicInfo || IS_HIDEN) {
        Promise.all([getInfo()]).then(() => {
        });
      } else {
        sloveData(window.publicInfo);
        setMarketInforData(window.publicInfo);
        setBaseDate(window.publicInfo);
      }
    },
    // 获取汇率计算单位
    getRateInfo({ commit }) {
      clearInterval(this.thisInterval);
      this.thisInterval = setInterval(() => {
        axios({
          url: this.state.url.common.rate,
          method: 'post',
          headers: { 'exchange-auto': '1' },
        }).then((data) => {
          if (data.code === '0') {
            commit('RATE', data.rate);
          }
        });
      }, 30000);
    },
    // 取消登录状态
    deleteIsLogin({ commit }) {
      removeCookie('token'); // 清理cookie
      commit('DELETEISLOGIN');
    },
    // 获取自定义你Footer 和 自定义 hander 的模板数据
    getFooterHeander_info({ commit, state }) {
      axios({
        url: this.state.url.common.footerAndHeader,
        method: 'post',
      }).then((data) => {
        if (data.code.toString() === '0') {
          commit('GETFOOTERHEADERINFO', data.data);
        }
        state.footerTemplateReceived = true;
      });
    },
    getMessage_count({ commit }) {
      axios({
        url: this.state.url.mesage.message_count,
        headers: { 'exchange-auto': '1' },
        method: 'post',
      }).then((data) => {
        if (data.code.toString() === '0') {
          commit('MESSAGECOUNT', data.data);
        }
      });
    },
    // 获取 otcpublic_info 数据
    getOtcPublicInfo({ commit, state }) {
      axios({
        url: 'otc/public_info',
        method: 'post',
        hostType: 'otc',
      }).then((data) => {
        if (Number(data.code) === 0) {
          const paymentsObj = [];
          const ExchiefObj = [];
          const paymentsArr = data.data.payments;
          paymentsArr.forEach((obj) => {
            if (
              obj.key === 'otc.payment.alipay'
              || obj.key === 'otc.payment.wxpay'
              || obj.key === 'otc.payment.domestic.bank.transfer'
            ) {
              paymentsObj.push(obj);
              ExchiefObj.push(obj);
            }
            if (
              obj.key === 'otc.payment.paypal'
              || obj.key === 'otc.payment.MTNmobile'
              || obj.key === 'otc.payment.VodafoneCash'
              || obj.key === 'otc.payment.AirtelTigo'
            ) {
              ExchiefObj.push(obj);
            }
          });
          const payments = {
            ...data.data,
            payments:
             !Number(state.exchief_project_switch)
               ? paymentsObj
               : ExchiefObj,
          };
          commit('GETOTCPUBLICINFO', { payments, paymentsArr });
        }
      });
    },
    getImgToken({ commit }, imageType) {
      axios({
        method: 'post',
        url: this.state.url.common.get_image_token,
        hostType: 'ex',
        params: {
          operate_type: imageType,
        },
      }).then((result) => {
        if (!Number(result.code)) {
          const data = {};
          data[imageType] = result.data;
          commit('IMGTOKEN', data);
        }
      });
    },
    setKrwFlag({ commit }) {
      commit('SETKRWFLAG');
    },
    setPhoneCodeGlobal({ commit }, phoneCode) {
      commit(SET_COUNTRY_OBJ, getCountryList(phoneCode));
    },
    getCoinSymbolIntroduce({ commit }) {
      axios({
        method: 'post',
        url: 'common/coinSymbol_introduce',
        hostType: 'ex',
        params: {},
      }).then((result) => {
        if (!Number(result.code)) {
          commit('COINSYMBOLINTRODUCE', result.data);
        }
      });
    },
    thirdPartyLoginData({ commit }, param) {
      axios({
        url: param.url,
        method: 'post',
        params: param.data,
      }).then((data) => {
        if (data.code === '0') {
          const Info = { msg: data.msg, text: 'success', data: data.data };
          commit('THIRD_PARTY_LOGIN_DATA', Info);
        } else {
          const Info = { code: data.code, msg: data.msg, text: 'error' };
          commit('THIRD_PARTY_LOGIN_DATA', Info);
        }
      });
    },
  },
  mutations: {
    [COIN_TAG_OPEN](state, result) {
      state.coin_tag_open = result;
    },
    [COIN_TAG_LANGS](state, result) {
      state.coinTagLangs = result;
    },
    [IS_INVITE_OPEN](state, result) {
      state.is_invite_open = result;
    },
    [SETISAPP](state, flag) {
      state.isApp = flag;
    },
    [INCREMENT_CONFIG_STATUS](state, result) {
      state.incrementConfigStatus = result;
    },
    [SET_IS_OPEN_UPLOAD_IMG](state, result) {
      state.is_open_upload_img = result;
    },
    [SET_COUNTRY_OBJ](state, result) {
      state.countryObj = result;
    },
    [SET_INTERFACES_WITCH](state, result) {
      state.interfaceSwitch = result;
    },
    [SET_DEFAULT_COUNTRYCODE](state, result) {
      state.defaultCountryCode = result.default_country_code || '';
      state.defaultCountryCodeReal = result.default_country_code_real || '';
    },
    [LIMIT_COUNTRY_LIST](state, result) {
      state.limitCountryList = result;
    },
    [IS_NEWCOIN_PROJECT_ENTRANCE](state, result) {
      state.is_newcoin_project_entrance = result;
    },
    [ENFORCE_GOOGLE_AUTH](state, result) {
      state.is_enforce_google_auth = result;
    },

    [APP_AUTH_OPEN](state, result) {
      state.app_auth_open = result;
    },

    [IS_INNER_TRANSFER_OPEN](state, result) {
      state.is_inner_transfer_open = result;
    },

    [LEVER_OPEN](state, result) {
      state.lever_open = result;
    },
    [FIAT_OPEN](state, result) {
      state.fiat_open = result;
    },
    [HAS_TRADE_LIMIT_OPEN](state, result) {
      state.has_trade_limit_open = result;
    },
    [INDEX_LAYER_OPEN](state, result) {
      state.index_layer_open = result;
    },
    [OPTIONAL_SYMBOL_SERVER_OPEN](state, result) {
      state.optional_symbol_server_open = result;
    },
    [NEW_COIN_OPEN](state, result) {
      state.newcoinOpen = result;
    },
    [AGENT_USER_OPEN](state, result) {
      state.agentUserOpen = result;
    },
    [IS_DEPOSIT_OPEN](state, result) {
      state.is_deposit_open = result;
    },
    [TRADE_BOARD_IS_FOLD](state, result) {
      state.trade_board_is_fold = result;
    },
    [TRADE_DEPTH_IS_FLASH](state, result) {
      state.trade_depth_is_flash = result;
    },
    [SYMBOLPROFILE](state, result) {
      state.symbol_profile = result;
    },
    [COINSYMBOLINTRODUCE](state, result) {
      state.coinSymbolIntroduce = result;
    },
    [INDEXHEADERTITLE](state, result) {
      state.indexHeaderTitle = result;
    },
    [SETLEVERMARKET](state, result) {
      state.leverMarket = result;
    },
    [IS_OPEN_BIGDEAL](state, result) {
      let isOpenBigdeal = false;
      if (typeof result === 'undefined') {
        isOpenBigdeal = true;
      } else {
        isOpenBigdeal = result;
      }
      state.is_open_bigDeal = isOpenBigdeal;
    },
    [ISMOREPOSITION](state, result) {
      state.is_more_position = result;
    },
    [SETKRWFLAG](state) {
      state.krwFlag = false;
    },
    [CLIENTUPLOAD](state, result) {
      state.client_img_upload_open = result;
    },
    [IMGTOKEN](state, result) {
      state.imgToken = { ...state.imgToken, ...result };
    },
    // 公共数据 public_info
    [GETAPPDOWNLOAD](state, result) {
      state.app_download = result;
    },
    // 公共数据 public_info
    [GETPUBLICINFO](state, result) {
      state.publicInfo = result;
      // state.publicInfo.url.otcUrl = '';
    },
    // 公共 币对 数据
    [GETMARKET](state, result) {
      // result.coinList.BTC.showName = 'BTC123';
      state.market = result;
    },
    // 全部币对列表
    [SYMBOLALL](state, result) {
      state.symbolAll = result;
    },
    // userinfo
    [USERINFO](state, result) {
      state.userInfo = result;
      state.isLogin = true;
    },
    // userInfoIsReady
    [USERINFOISREADY](state) {
      state.userInfoIsReady = true;
    },
    [RATE](state, result) {
      state.rate = result;
    },
    [DELETEISLOGIN](state) {
      state.isLogin = false;
    },
    [GETFOOTERHEADERINFO](state, data) {
      if (data.footer) {
        state.footerTemplate = data.footer;
      }
      if (data.header) {
        state.headerTemplate = data.header;
      }
    },
    [MESSAGECOUNT](state, data) {
      state.messageCount = data.noReadMsgCount;
      state.userMessageList = data.userMessageList;
    },
    // 公共数据 public_info
    [GETOTCPUBLICINFO](state, result) {
      state.otcPublicInfo = result.payments;
      state.exchief_arr_filter = result.paymentsArr;
    },
    // 合约 公共数据 public_info
    [GETCOPUBLICINFO](state, result) {
      state.coPublicInfo = result;
    },
    [SETLAN](state, result) {
      state.lan = result;
    },
    // 模板类型(中国版 国际版)
    [TEMPLATELAYOUTTYPE](state, result) {
      state.index_international_open = result;
      state.templateLayoutType = `${result + 1}`;
      // state.templateLayoutType = '2';
    },
    // 首页模板类型
    [HOMEbOARDtYPE](state, result) {
      state.index_international_open = result;
    },
    [SWIPERFLAG](state, result) {
      state.swiperFlag = result;
    },
    // otc支付方式是否显示全部
    [EXCHIEFPROJECTSWITCH](state, result) {
      state.exchief_project_switch = Number(result);
    },
    [SET_EXCHIEF_REDIRECT](state, result) {
      if (result.length) {
        result.forEach((item) => {
          state.otcPublicInfo.payments.push(item);
        });
      }
    },
    [THIRD_PARTY_LOGIN_DATA](state, result) {
      state.thirdPartyLoginData = result;
    },
    [KYC_TYPE](state, result) {
      state.nameVerifiedType = result;
    },
  },
};
