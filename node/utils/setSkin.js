const fs = require('fs');
const dirExists = require('./mkdir');
const hostFilter = require('./host-filter.js');

const setSkin = (domainData, app, fileBasePath, skinDataPath) => {
  dirExists(fileBasePath);
  app.ctx.curl(skinDataPath, {
    dataType: 'json',
    method: 'GET',
    timeout: '30000',
  }).then((res) => {
    if (res) {
      fs.writeFile(`${fileBasePath}${domainData.fileName}.json`,
        JSON.stringify(res.data, 'utf8'), (error) => {
          if (error) {
            const errorData = {
              domain: domainData.domainName, // 域名
              message: `${skinDataPath} 保存失败`, // 描述
              error,
            };
            fs.readFile(`${fileBasePath}${domainData.fileName}.json`, (err, data) => {
              if (err) {
                app.logger.error(`skin文件读取失败：${err}`);
              } else {
                app.logger.error(`删除skin文件为：名字：${fileBasePath}${domainData.fileName}.json 内容：${data}`);
              }
            });
            fs.unlinkSync(`${fileBasePath}${domainData.fileName}.json`);
            if (!hostFilter.test(domainData.domainName)) {
              app.logger.error(JSON.stringify(errorData));
            }
          } else {
            const errorData = {
              domain: domainData.domainName, // 域名
              message: `${skinDataPath} 请求成功`, // 描述
            };
            if (!hostFilter.test(domainData.domainName)) {
              app.logger.error(JSON.stringify(errorData));
            }
          }
        });
    } else {
      const errorData = {
        domain: domainData.domainName, // 域名
        message: `${skinDataPath} 保存失败执行删除操作`, // 描述
      };
      if (!hostFilter.test(domainData.domainName)) {
        app.logger.error(JSON.stringify(errorData));
      }
    }
  }).catch((err) => {
    const errorData = {
      domain: domainData.domainName, // 域名
      message: `${skinDataPath} 保存失败`, // 描述
      err,
    };
    if (!hostFilter.test(domainData.domainName)) {
      app.logger.error(JSON.stringify(errorData));
    }
  });
};

module.exports = setSkin;
