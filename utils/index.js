import {
  add, cut, division, nul,
} from './math';

import {
  logImg,
  fixRate,
  formatTime,
  fixD,
  diff,
  lastD,
  fixUrl,
  fixInput,
  getComplexType,
  getTime,
  timeFn,
  getLocationLang,
  getCoinShowName,
  fixFloat,
  thousandsComma,
  getCountryList,
  getDigit,
} from './common-method';

import calculateVolume from './calculateVolume';
import getHex from './rgbaToHex';
import getScript from './getScript';
import colorMap from './colorMap';
import templateConfig from './templateConfig';
import { setCookie, getCookie, removeCookie } from './cookie';

import myStorage from './mystorage';

import browser from './getBrowser';
import imgMap from './imgMap';
import { setCoMarket, setDefaultMarket, setLeverDefaultMarket } from './setDefaultMarket';

const routerEnv = (process.env.NODE_ENV === 'development') ? '*' : '*';
export {
  getDigit,
  setCoMarket,
  setDefaultMarket,
  setLeverDefaultMarket,
  logImg,
  add, // 加法
  cut, // 减法
  division, //  除法
  nul, // 乘法
  fixRate,
  formatTime,
  fixD,
  diff,
  lastD,
  fixUrl,
  fixInput,
  getScript,
  getComplexType,
  getTime,
  timeFn,
  fixFloat,
  getHex,
  routerEnv,
  colorMap,
  myStorage,
  browser,
  getLocationLang,
  getCoinShowName,
  thousandsComma,
  getCountryList,
  templateConfig,
  setCookie,
  getCookie,
  removeCookie,
  imgMap,
  calculateVolume,
};
