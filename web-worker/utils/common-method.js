// 汇率计算
const fixRate = function (price, exrate, market, language) {
  const lang = language || 'en_US';
  // if (lang === 'el_GR') { lang = 'zh_CN' }
  if (!exrate) {
    return '--';
  }
  const larate = exrate[lang] || exrate.en_US;
  const pric = larate[market] * price;
  if (`${parseFloat(pric)}` !== 'NaN') {
    const rate = typeof larate.symbolPrecision !== 'undefined' ? larate.symbolPrecision : larate.coin_precision;
    return larate.lang_logo + pric.toFixed(rate);
  }
  return '--';
};
// 时间格式化
const formatTime = function (dateTime) {
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

  return `${year}/${s(month)}/${s(day)} ${s(hours)}:${s(minutes)}:${s(seconds)}`;
};
// 精度计算
const fixD = function (num, precision) {
  // num初始化
  if (`${num}` === '0') {
    if (!parseFloat(precision)) {
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
  const newnum = `${parseFloat(num)}`;
  if (newnum === 'NaN') {
    return '--';
  }
  let fixNum = newnum;
  // 科学计数法计算
  if (newnum.toLowerCase().indexOf('e') > -1) {
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
    return fixNum;
  }
  if (`${parseFloat(num)}` === 'NaN') {
    return fixNum;
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
  return fixNum;
};
// 删除小数点最后面的0
const lastD = function (num) {
  if (!num) return num;
  const newNum = `${num}`;
  const str = newNum.split('.')[1];
  if (!str) return newNum;
  function substring(str) {
    const arr = str.split('');
    for (let i = arr.length - 1; i >= 0; i--) {
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
const fixUrl = function (name) {
  const text = location.search.substring(1).split('&');
  let v = null;
  for (let i = text.length - 1; i >= 0; i--) {
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
const fixInput = function (v, fix) {
  if (!fix === 0) {
    fix = fix || 10;
  }
  v += '';
  // 操作1
  // 用户行为 直接上来打个.
  // 解决方案 置换成0.
  if (v.charAt(0) === '.') { v = '0' + '.'; }
  // 操作2
  // 用户行为 打多个点.
  // 解决方案 保留第二个点以前的数值
  const strArr = v.split('').reduce((res, c) => {
    res[c] ? res[c]++ : res[c] = 1;
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
  for (const c in strArr) {
    let str = '01234567890.';
    if (fix === 0) { str = '01234567890'; }
    if (str.indexOf(c) === -1) {
      v = v.split(c)[0] + (v.split(c)[1] || '');
    }
  }
  // 操作5
  // 用户行为 输入总长度超过14位 包括.
  // 解决方案 截取前14位
  if (v.length > 14) {
    v = v.substring(0, 14);
  }
  return v;
};

const filterArr = function filterArr(list, value, currentPrice, type) {
  const arr = [];
  if (type === 'buy') {
    for (var i = 0, len = list.length; i < len; i++) {
      if (list[i][0] > value && list[i][0] < currentPrice) {
        arr.push(list[i]);
      }
    }
  } else {
    for (var i = 0, len = list.length; i < len; i++) {
      if (list[i][0] < value && list[i][0] > currentPrice) {
        arr.push(list[i]);
      }
    }
  }
  return arr;
};
