const rimraf = require('rimraf');
const crypto = require('crypto');
const {transform} = require('@babel/core');
const fs = require('fs');

const projectPath = process.cwd();
const path = require('path');

const webWorkerMap = {};

const webWorkerPath = path.join(__dirname, '../web-worker');
const webWorkerMapPath = path.join(projectPath, 'app/view/src/assets/js/webworker-map.js');

function createwebWrokerMap(dirPath) {
  const files = fs.readdirSync(dirPath);
  files.forEach((value) => {
    const filePath = path.join(dirPath, value);
    if (fs.statSync(filePath).isDirectory()) {
      createwebWrokerMap(filePath);
    } else {
      const fileSource = fs.readFileSync(filePath, 'UTF-8');
      const md5sum = crypto.createHash('md5');
      md5sum.update(transform(fileSource, {
        minified: true,
        comments: false,
        configFile: false,
        presets: [
          ['@babel/preset-env',
            {
              "useBuiltIns": false
            }],
        ],
        plugins: [["@babel/plugin-transform-modules-commonjs",{
          "strictMode":false
        }]]
      }).code);
      const md5 = md5sum.digest('hex');
      const hashValue = `${md5}-${value}`;
      webWorkerMap[value.replace('.js', '')] = hashValue;
    }
  });
}

rimraf.sync(webWorkerMapPath);
createwebWrokerMap(webWorkerPath);
fs.writeFileSync(webWorkerMapPath, `export default ${JSON.stringify(webWorkerMap)}`);