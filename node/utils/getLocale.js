const fs = require('fs');
const path = require('path');
const { merge } = require('lodash');
const dirExists = require('../utils/mkdir');

const getLocales = async (domainData, app, CusLocales) => {
  const lan = app.ctx.cookies.get('lan', {
    signed: false,
  });
  const { fileName } = domainData;
  const fileBasePath = app.config.localesPath;
  let defaultLocalePath = path.join(app.config.defaultLocalePath, `${lan}.json`);
  if (!fs.existsSync(defaultLocalePath)) {
    defaultLocalePath = path.join(app.config.defaultLocalePath, 'en_US.json');
    const errorData = {
      fileName,
      message: '默认语言中没有此语言，选取英文语言包',
    };
    app.logger.error(JSON.stringify(errorData));
  }
  let defaultLocale = fs.readFileSync(defaultLocalePath, 'UTF-8');
  dirExists(path.join(fileBasePath, fileName));
  let ossLocalePath = '';
  let ossLocale = '';
  if (CusLocales) {
    if (CusLocales[lan]) {
      ossLocalePath = CusLocales[lan];
      ossLocale = await app.ctx.curl(ossLocalePath, {
        dataType: 'json',
        method: 'GET',
        timeout: '30000',
      });
    }
  }
  let mergeLocale = {};
  try {
    defaultLocale = JSON.parse(defaultLocale);
  } catch (e) {
    const errorData = {
      fileName,
      message: '默认语言包转换json失败',
    };
    app.logger.error(JSON.stringify(errorData));
  }
  let ossLocaleJSON = ossLocale.data;
  // eslint-disable-next-line valid-typeof
  if (typeof ossLocale.data === 'String') {
    try {
      ossLocaleJSON = JSON.parse(ossLocale.data);
    } catch (e) {
      const errorData = {
        fileName,
        message: '客户自定义语言包转换json失败',
      };
      app.logger.error(JSON.stringify(errorData));
    }
  }
  mergeLocale = merge(defaultLocale, ossLocaleJSON);
  fs.writeFile(
    path.join(fileBasePath, fileName, `${lan}.json`),
    JSON.stringify(mergeLocale),
    (error) => {
      if (error) {
        const errorData = {
          fileName,
          message: '自定义语言包保存失败',
        };
        app.logger.error(JSON.stringify(errorData));
      } else {
        const errorData = {
          fileName,
          message: '自定义语言包保存成功',
        };
        app.logger.error(JSON.stringify(errorData));
      }
    },
  );
};

module.exports = getLocales;
