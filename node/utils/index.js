const path = require('path');
const fs = require('fs');
const os = require('os');
const getSetData = require('./getSetData');
const hostFilter = require('./host-filter');
const dirExists = require('./mkdir');
const setSkin = require('./setSkin');

const fsPublicInfo = (mPath, app, fileName) => {
  const obj = {
    isHave: false,
    data: {},
  };
  if (fs.existsSync(mPath)) {
    obj.isHave = true;
    try {
      obj.data = JSON.parse(fs.readFileSync(mPath, 'utf8'));
    } catch (e) {
      obj.isHave = false;
      obj.data = null;
    }
  } else if (app && fs.existsSync(path.join(app.config.staticPath, `en_US-${fileName}.json`))) {
    obj.isHave = true;
    try {
      obj.data = JSON.parse(fs.readFileSync(path.join(app.config.staticPath, `en_US-${fileName}.json`), 'utf8'));
    } catch (e) {
      obj.isHave = false;
      obj.data = null;
    }
  }
  return obj;
};
const getPublicInfo = (app, lan) => {
  let lanSeo = {};
  let publicInfo = {};
  const sKinData = {};
  sKinData.listist = [];
  let cusSkin = app.ctx.cookies.get('cusSkin', {
    signed: false,
  });
  let nowHost = app.ctx.request.header.host;
  if (app.config.env === 'local') {
    nowHost = app.config.devUrlProxy.ex;
  }
  // 获取到主域名
  const domain = nowHost.replace(new RegExp(`^${nowHost.split('.')[0]}.`), '');
  const fileName = app.config.configDomain[nowHost] || domain;
  // 1.2 读取本地publicInfo
  const pub = fsPublicInfo(path.join(app.config.staticPath, `${lan}-${fileName}.json`), app, fileName);
  if (!pub.isHave) {
    return {};
  }
  // 1.2 读取本地 Skin
  const skin = fsPublicInfo(path.join(app.config.skinsPath, `${fileName}_skin.json`));
  const skinType = [];
  // 设置默认 皮肤
  if (skin && skin.data && skin.data.listist) {
    if (!cusSkin) {
      cusSkin = skin.data.default ? skin.data.default : '1';
      app.ctx.cookies.set('cusSkin', cusSkin, {
        httpOnly: false,
        signed: false,
        domain,
      });
    }
    skin.data.listist.forEach((item) => {
      const { skinName, mainClor, skinId } = item;
      skinType.push({ skinName, mainClor, skinId });
      if (item.skinId === cusSkin) {
        sKinData.listist.push(item);
      }
    });
  }
  // 1.2.1 如果有此文件 直接使用
  if (pub.isHave) {
    publicInfo = pub.data;
    lanSeo = pub.data.data.seo;
    if (!lan) {
      // eslint-disable-next-line no-param-reassign
      lan = pub.data.data.lan.defLan || 'zh_CN';
    }
    // 1.2.2 如果无此文件 则发起请求
  }
  publicInfo.data.skinType = skinType;
  if (sKinData.listist && sKinData.listist.length) {
    publicInfo.data.skin = sKinData;
  }
  if (lanSeo && lanSeo[lan]) {
    publicInfo.data.seo = lanSeo[lan];
  }
  return JSON.stringify(app.publicInfo) !== '{}' ? publicInfo.data : {};
};
const getLocale = (lan, fileName, fileBasePath, logger) => {
  let locale = '';
  let localePath = path.join(fileBasePath, `${lan}.json`);
  if (!fs.existsSync(localePath)) {
    const errorData = {
      fileName,
      message: '默认语言中没有此语言，因此返回英文语言包',
    };
    logger.error(JSON.stringify(errorData));
    localePath = path.join(fileBasePath, 'en_US.json');
  }
  try {
    locale = fs.readFileSync(localePath, 'UTF-8');
  } catch (e) {
    const errorData = {
      fileName,
      message: '未拿到语言包',
    };
    logger.error(JSON.stringify(errorData));
  }
  let res = {};
  try {
    res = JSON.parse(locale);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
  return res;
};
const getFileName = (app) => {
  let nowHost = app.ctx.request.header.host;
  if (app.config.env === 'local') {
    nowHost = app.config.devUrlProxy.ex;
  }
  // 获取到主域名
  const domain = nowHost.replace(new RegExp(`^${nowHost.split('.')[0]}.`), '');
  return app.config.configDomain[nowHost] || domain;
};

const compare = (property) => function short(a, b) {
  const value1 = a[property];
  const value2 = b[property];
  return value1 - value2;
};

const getIPAddress = () => {
  const interfaces = os.networkInterfaces();
  let ip = '';
  Object.keys(interfaces).forEach((devName) => {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i += 1) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        ip = alias.address;
      }
    }
  });
  return ip;
};

module.exports = {
  getLocale,
  getFileName,
  getPublicInfo,
  getSetData,
  hostFilter,
  dirExists,
  compare,
  setSkin,
  getIPAddress,
};
