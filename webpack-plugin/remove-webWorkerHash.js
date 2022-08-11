const path = require('path');
const fs = require('fs');

const projectPath = process.cwd();
const webWorkerMapPath = path.join(projectPath, 'app/view/src/assets/js/webworker-map.js');

const webworkerMap = JSON.parse(fs.readFileSync(webWorkerMapPath, 'UTF-8').replace('export default ', ''));
const keys = Object.keys(webworkerMap);
const nMap = {};
keys.forEach((item) => {
  const str = webworkerMap[item];
  if (str !== 'common-method.js') {
    nMap[item] = str.substring(str.indexOf('-') + 1, str.length);
  } else {
    nMap[item] = str;
  }
});
fs.writeFileSync(webWorkerMapPath, `export default ${JSON.stringify(nMap)}`);
