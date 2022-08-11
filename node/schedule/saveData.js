const fs = require('fs');
const path = require('path');

const saveDataConfig = {
  interval: '20m', // 1 分钟间隔
  type: 'all', // 指定所有的 worker 都需要执行
  env: 'prod',
};

const saveData = (ctx) => {
  const { config } = ctx.app;
  const data = config.serverData;
  if (data) {
    Object.keys(data).forEach((type) => {
      if (type !== 'Locales') {
        const typePath = config.filePathMap[type];
        if (!fs.existsSync(typePath)) {
          fs.mkdirSync(typePath);
        }
        const dataType = data[type];
        Object.keys(dataType).forEach((id) => {
          const idPath = path.join(typePath, id);
          fs.writeFileSync(idPath, JSON.stringify(dataType[id]));
        });
      }
    });
  }
};

module.exports = {
  saveDataConfig,
  saveData,
};
