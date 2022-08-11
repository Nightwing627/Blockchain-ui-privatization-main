// 汇率计算
import { getCookie } from './cookie';

export const logImg = (data) => {
  if (!/localhost|dev|staging/g.test(window.location.host)) {
    const img = document.createElement('img');
    img.src = `https://chaindown-oss.oss-cn-hongkong.aliyuncs.com/static/cd.png?info=${JSON.stringify(data)}`;
  }
};

export const getCountryList = (phoneCodeGlobal) => {
  const list = [];
  const countryMap = {};
  const countryRealMap = {};
  if (phoneCodeGlobal.A) {
    Object.keys(phoneCodeGlobal).forEach((item) => {
      phoneCodeGlobal[item].forEach((vitem) => {
        const valueArr = vitem.split('+');
        const value = `${valueArr[0]}+${valueArr[1]}`;
        const codeArr = vitem.split(' +');
        const code = `+${codeArr[1].split('+')[0]}`;
        const obj = { value, code: `+${valueArr[2]}`, keyCode: code };
        list.push(obj);
        countryMap[code] = obj;
        countryRealMap[`+${valueArr[2]}`] = obj;
      });
    });
  }
  return (() => ({
    list,
    countryMap,
    countryRealMap,
  }))();
};

export const diff = (date) => {
  const dateBegin = new Date(date.replace(/-/g, '/'));
  const dateEnd = new Date();
  const dateDiff = dateEnd.getTime() - dateBegin.getTime();
  const dayDiff = -Math.floor(dateDiff / (24 * 3600 * 1000));
  return dayDiff;
};

export const fixRate = (price, exrate, market) => {
  const lang = getCookie('lan') || 'en_US';
  // if (lang === 'el_GR') { lang = 'zh_CN' }
  if (!exrate) {
    return '--';
  }
  const larate = exrate[lang] || exrate.en_US;
  if (!larate) {
    return '--';
  }
  const pric = larate[market] * price;
  if (`${parseFloat(pric)}` !== 'NaN') {
    const rate = typeof larate.symbolPrecision !== 'undefined' ? larate.symbolPrecision : larate.coin_precision;
    return larate.lang_logo + pric.toFixed(rate);
  }
  return '--';
};
// 时间格式化
export const formatTime = (dateTime) => {
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

// 精度计算E+处理方法
const fixDEAdd = (num, precision, autoFix = true) => {
  if (`${num}` === '0') {
    if (!window.parseFloat(precision) || !autoFix) return 0;
    return '0.'.padEnd(precision + 2, '0');
  }
  if (!num) return '--';

  const number = parseFloat(num);
  const strN = num.toString();
  const flag = number < 0;
  let result = strN;

  if (strN.toLowerCase().indexOf('e') > -1) {
    const n = strN.match(/(\d+?)(?:\.(\d*))?e([+-])(\d+)/);
    const nl = n[1]; // 小数点左边
    const nr = n[2]; // 小数点右边
    const type = n[3]; //  + / -
    const floatN = n[4]; // 科学计数法的位数

    let params = '';
    let pr = nr ? nr.substr(floatN) : '';

    if (pr) pr = `.${pr}`;
    if (type !== '-') {
      for (let i = 0; i < floatN; i += 1) {
        const p = nr[i] || '0';
        params += p;
      }
      result = nl + params + pr;
    } else {
      let strl = '0';
      for (let i = 0; i < floatN; i += 1) {
        const p = nl[nl.length - i - 1] || '0';
        params = p + params;
      }
      if (nl.length > floatN) strl = nl.substr(0, nl.length - floatN);
      result = `${strl}.${params}${nr}`;
    }
  }

  if (precision && autoFix) {
    let pal = `${result.split('.')[0]}.`;
    const par = result.split('.')[1] || '';

    for (let i = 0; i < precision; i += 1) {
      pal += par[i] || '0';
    }
    result = pal;
  }

  if (result.length > 14) {
    const arry = result.split('.');
    if (arry[0].length > 14) {
      result = `${arry[0].slice(0, 14)}+`;
    } else {
      result = result.slice(0, 13);
      if (result.indexOf('.') === 12) {
        result = result.slice(0, 12);
      }
    }
  }

  return `${flag ? '-' : ''}${result}`;
};
// 精度计算
export const fixD = (num, precision) => {
  // num初始化
  if (`${num}` === '0') {
    if (!window.parseFloat(precision)) {
      return 0;
    }
    return '0.'.padEnd(precision + 2, '0');
  }
  if (!num) {
    return '--';
  }
  // 暂用 ----
  // if (num.length > 14) {
  //   let rNum = num.slice(0, 14);
  //   if (num[13] === '.') {
  //     rNum = rNum.slice(0, 13);
  //   }
  //   return `${rNum}+`;
  // }
  // ----------
  let flag = false;
  if (parseFloat(num) < 0) {
    flag = true;
  }

  const newnum = `${Math.abs(parseFloat(num))}`;
  if (newnum === 'NaN') {
    return '--';
  }
  let fixNum = newnum;
  // 科学计数法计算
  if (newnum.toLowerCase().indexOf('e') > -1) {
    if (newnum.toLowerCase().indexOf('+') > -1) return fixDEAdd(newnum, precision);
    const a = newnum.toLowerCase().split('e');
    let b = a[0];
    const c = Math.abs(parseFloat(a[1]));
    let d = '';
    let h = b.length;
    let i;
    if (a[0].split('.')[1]) {
      b = a[0].split('.')[0] + a[0].split('.')[1];
      h = a[0].split('.')[0].length;
    }
    for (i = 0; i < c - h; i += 1) {
      d += '0';
    }
    fixNum = `0.${d}${b}`;
  }
  // 精度格式化
  // precision初始化
  if (`${precision}` !== '0' && !precision) {
    return (flag ? '-' : '') + fixNum;
  }
  if (`${parseFloat(num)}` === 'NaN') {
    return (flag ? '-' : '') + fixNum;
  }
  const fNum = fixNum.split('.');
  if (precision === 0) {
    fixNum = parseInt(fixNum, 10);
  } else if (precision > 0 && fNum[1]) {
    if (fNum[1].length > precision) {
      if (fNum[1].indexOf('999999999') > -1) {
        const s = parseFloat(fixNum).toFixed(precision + 1);
        fixNum = s.slice(0, s.length - 1);
      } else {
        fixNum = `${fNum[0]}.${fNum[1].slice(0, precision)}`;
      }
    } else {
      fixNum = parseFloat(fixNum).toFixed(precision);
    }
  } else {
    fixNum = parseFloat(fixNum).toFixed(precision);
  }
  if (fixNum.length >= 14 && fixNum.indexOf('.') > -1) {
    const arry = fixNum.split('.');
    if (arry[0].length > 14) {
      fixNum = `${arry[0].slice(0, 14)}+`;
    } else {
      fixNum = fixNum.slice(0, 13);
      if (fixNum.indexOf('.') === 12) {
        fixNum = fixNum.slice(0, 12);
      }
    }
  }
  return (flag ? '-' : '') + fixNum;
};

// 删除小数点最后面的0
export const lastD = (num) => {
  if (!num) return num;
  const newNum = `${num}`;
  const str = newNum.split('.')[1];
  if (!str) return newNum;

  function substring(stri) {
    const arr = stri.split('');
    for (let i = arr.length - 1; i >= 0; i -= 1) {
      if (!arr[i]) return newNum.split('.')[0];
      if (arr[i] === '0') {
        arr.splice(i);
      } else {
        break;
      }
    }
    if (!arr.length) return newNum.split('.')[0];
    return `${newNum.split('.')[0]}.${arr.join('')}`;
  }

  return substring(str);
};
// 获取url里的参数
export const fixUrl = (name) => {
  const text = window.location.search.substring(1).split('&');
  let v = null;
  for (let i = text.length - 1; i >= 0; i -= 1) {
    const key = text[i].split('=')[0];
    const value = text[i].split('=')[1];
    if (key === name) {
      v = value;
      break;
    }
  }
  return v;
};
// 输入框
export const fixInput = (val, fixs) => {
  let fix = fixs;
  if (!fix === 0) {
    fix = fix || 10;
  }

  let v = `${fixDEAdd(val, fixs, false)}`;
  // 操作1
  // 用户行为 直接上来打个.
  // 解决方案 置换成0.
  if (v.charAt(0) === '.') {
    v = '0.';
  }
  // 操作2
  // 用户行为 打多个点.
  // 解决方案 保留第二个点以前的数值
  const strArr = [...v].reduce((res, c) => {
    if (res[c]) {
      res[c] += 1;
    } else {
      res[c] = 1;
    }
    return res;
  }, {});
  if (strArr['.'] === 2) {
    const arr = v.split('.');
    v = `${arr[0]}.${arr[1]}`;
  }
  // 操作3
  // 用户行为 小数点后输入超过该币种精度限制
  // 解决方案 保留该精度之前的数值
  if (v.indexOf('.') !== -1) {
    const integer = v.split('.')[0]; // 整数
    let decimal = v.split('.')[1]; // 小数
    if (decimal.length > fix) {
      decimal = decimal.substring(0, fix);
      v = `${integer}.${decimal}`;
    }
  }
  // 操作4
  // 用户行为 转成汉语拼音后可输入汉字字母等字符
  // 解决方案 干掉写入的文字
  const strKey = Object.keys(strArr);
  strKey.forEach((c) => {
    let str = '01234567890.';
    if (fix === 0) { str = '01234567890'; }
    if (str.indexOf(c) === -1) {
      v = v.split(c)[0] + (v.split(c)[1] || '');
    }
  });
  // 操作5
  // 用户行为 输入总长度超过14位 包括.
  // 解决方案 截取前14位
  if (v.length > 13) {
    v = v.substring(0, 13);
  }
  return v;
};
// 计算倒计时 仅支持到天位
export const getTime = (spkTime) => {
  let dateSpan = Math.abs(spkTime);
  if (!dateSpan) { return ''; }
  // 计算天
  const iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
  // 计算小时
  dateSpan -= (iDays * (24 * 3600 * 1000));
  let iHour = `${Math.floor(dateSpan / (3600 * 1000))}`;
  iHour = iHour.length === 1 ? `0${iHour}` : iHour;
  // 计算分钟
  dateSpan -= (iHour * (3600 * 1000));
  let iMin = `${Math.floor(dateSpan / (60 * 1000))}`;
  iMin = iMin.length === 1 ? `0${iMin}` : iMin;
  // 计算秒钟
  dateSpan -= (iMin * (60 * 1000));
  let iSec = `${Math.floor(dateSpan / 1000)}`;
  iSec = iSec.length === 1 ? `0${iSec}` : iSec;
  return {
    day: iDays,
    hour: iHour,
    min: iMin,
    sec: iSec,
  };
};
// 计算时间 2012:12:12 12:12:12
export function timeFn(dataObj, data) {
  let fmt = data;
  const o = {
    'M+': dataObj.getMonth() + 1, // 月份
    'd+': dataObj.getDate(), // 日
    'h+': dataObj.getHours(), // 小时
    'm+': dataObj.getMinutes(), // 分
    's+': dataObj.getSeconds(), // 秒
    'q+': Math.floor((dataObj.getMonth() + 3) / 3), // 季度
    S: dataObj.getMilliseconds(), // 毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (`${dataObj.getFullYear()}`).substr(4 - RegExp.$1.length));
  }
  Object.keys(o).forEach((k) => {
    if (new RegExp(`(${k})`).test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k])
        : ((`00${o[k]}`).substr((`${o[k]}`).length)));
    }
  });
  return fmt;
}
export const getComplexType = (obj) => {
  const type = Object.prototype.toString.call(obj);
  return type.match(/\s(.+)]/ig)[0].trim().replace(']', '');
};

export const thousands = (num) => {
  const str = num.toString();
  const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
  return str.replace(reg, '$1,');
};

export function getLocationLang() {
  const langList = ['el_GR', 'en_US', 'ja_JP', 'ko_KR', 'vi_VN', 'zh_CN'];
  const hrefLang = window.location.href.match(/lang=(.+?)(&|$)/);
  let url = '';

  if (hrefLang && hrefLang[1] && langList.indexOf(hrefLang[1]) > -1) {
    [, url] = hrefLang;
  }

  return url;
}

export function getCoinShowName(name, coinList = {}) {
  if (name && coinList && coinList[name.toUpperCase()]) {
    return coinList[name.toUpperCase()].showName || name;
  }
  return name;
}
export function fixFloat(num, precision) {
  const fix = Number(precision);
  const n = `${num}`;
  const arr = n.split('.');
  if (Number.isNaN(Number(num))) {
    return '--';
  }
  if (!fix || arr.length === 1) {
    return arr[0];
  }
  return `${arr[0]}.${arr[1].substring(0, fix)}`;
}
// 千位数字每三位加逗号
export const thousandsComma = (num) => {
  let Num = (num || 0).toString();
  let symbol = '';
  if (new RegExp(/^\+|^-/).test(Num)) {
    symbol = Num.substr(0, 1);
    Num = Num.substr(1);
  }
  let number = 0;
  let floatNum = '';
  let intNum = '';
  // 判断是否有小数位，有则截取小数点后的数字
  if (Num.indexOf('.') > 0) {
    number = Num.indexOf('.'); // 获取小数点出现的位置
    floatNum = Num.substr(number); // 截取arr.substr(form, length)
    intNum = Num.substring(0, number); // 截取arr.substring(start, end)
  } else {
    intNum = Num;
  }
  const result = [];
  let counter = 0;
  intNum = intNum.split('');
  // 利用3的倍数，向数组插入','
  for (let i = intNum.length - 1; i >= 0; i -= 1) {
    counter += 1;
    result.unshift(intNum[i]);
    if (!(counter % 3) && i !== 0) { result.unshift(','); }
  }
  return symbol + result.join('') + floatNum || '';
};
// 计算小数点后面的数量
export const getDigit = (num) => {
  const arr = String(num).split('.');
  if (arr.length < 2) {
    return 0;
  }
  return arr[1].length;
};
