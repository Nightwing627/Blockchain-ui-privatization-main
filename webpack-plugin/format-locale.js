const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const crypto = require('crypto');
const rimraf = require('rimraf');

const projectPath = process.cwd();
const staticFolder = path.join(projectPath, 'app/public/static/');
const basePath = path.join(projectPath, 'app/public/static/locales');
const imgBuildPath = path.join(projectPath, 'app/public/static/img');
const defaultLocaleName = 'zh_CN';
const imgPath = path.join(projectPath, 'app/view/imgTheme');
const imgMap = {};

rimraf.sync(path.join(projectPath, 'app/dist/'));

function def(item, compareItem, fileName, errorMessage) {
  const itemKyes = Object.keys(item);
  itemKyes.forEach((li) => {
    const obj = item[li];
    if (!compareItem[li]) {
      errorMessage.push(`${fileName} : ${li} ${JSON.stringify(obj)}`);
    } else if (Object.prototype.toString.call(obj) === '[object Object]') {
      def(obj, compareItem[li], fileName, errorMessage);
    }
  });
}

function writeFiles(jsonData) {
  const filesMap = {};
  const filesMapPath = path.join(projectPath, 'app/view/src/locale/', 'filesMap.json');
  let content = JSON.stringify(jsonData.defaultLocale);
  let md5sum = crypto.createHash('md5');
  md5sum.update(content);
  let md5 = md5sum.digest('hex');
  fs.writeFileSync(path.join(basePath, `${md5}-${defaultLocaleName}.json`), content);
  filesMap[defaultLocaleName] = `${md5}-${defaultLocaleName}.json`;
  const keys = Object.keys(jsonData.localeMaps);
  keys.forEach((key) => {
    const fileName = key.replace('js', 'json');
    content = JSON.stringify(jsonData.localeMaps[key]);
    md5sum = crypto.createHash('md5');
    md5sum.update(content);
    md5 = md5sum.digest('hex');
    filesMap[key.replace('.js', '')] = `${md5}-${fileName}`;
    fs.writeFileSync(path.join(basePath, `${md5}-${fileName}`), content);
  });
  rimraf.sync(filesMapPath);
  fs.writeFileSync(filesMapPath, JSON.stringify(filesMap));
}

function getJsonData(list) {
  const localeMaps = {};
  let defaultLocale = {};
  for (let i = 0, len = list.length; i < len; i += 1) {
    delete require.cache[require.resolve(path.join(projectPath, 'app/view/src/locale/', list[i]))];
    // eslint-disable-next-line global-require,import/no-dynamic-require
    const locale = require(path.join(projectPath, 'app/view/src/locale/', list[i]));
    if (list[i] !== (`${defaultLocaleName}.js`)) {
      localeMaps[list[i]] = locale;
    } else {
      defaultLocale = locale;
    }
  }
  return {
    localeMaps,
    defaultLocale,
  };
}

function emit() {
  const files = _.without(fs.readdirSync(path.join(projectPath, 'app/view/src/locale')), 'index.js', 'filesMap.json', 'default.js', '.DS_Store');
  const jsonData = getJsonData(files);
  const errorMessage = [];
  const keys = Object.keys(jsonData.localeMaps);
  keys.forEach((key) => {
    def(jsonData.defaultLocale, jsonData.localeMaps[key], key, errorMessage);
  });
  if (errorMessage.length) {
    // eslint-disable-next-line no-throw-literal
    throw `miss keys of locales: \n ${errorMessage.join('\n')}`;
  }
  rimraf.sync(basePath);
  fs.mkdirSync(basePath);
  writeFiles(jsonData);
}

function createImgMap(dirPath) {
  rimraf.sync(path.join(projectPath, 'app/view/src/utils/imgMap.json'));
  const dirs = fs.readdirSync(dirPath);
  // eslint-disable-next-line consistent-return
  dirs.forEach((dir) => {
    if (dir === '.DS_Store') { return false; }
    const imgs = fs.readdirSync(path.join(dirPath, dir));
    imgMap[dir] = {};
    imgs.forEach((item) => {
      const imgKeys = item.split('.');
      const suffix = imgKeys[1];
      const imgKey = imgKeys[0];
      const source = fs.readFileSync(path.join(dirPath, dir, item));
      const md5sum = crypto.createHash('md5');
      md5sum.update(source);
      const md5 = md5sum.digest('hex');
      imgMap[dir][imgKey] = `/static/img/${dir}/${md5}.${suffix}`;
    });
    fs.writeFileSync(path.join(projectPath, 'app/view/src/utils/imgMap.json'), JSON.stringify(imgMap), 'utf-8');
  });
}

function getIconFontScript(source) {
  const md5sum = crypto.createHash('md5');
  md5sum.update(source);
  const md5 = md5sum.digest('hex');
  return md5;
}

function copyImg() {
  const dirs = fs.readdirSync(imgPath);
  if (!fs.existsSync(staticFolder)) {
    fs.mkdirSync(staticFolder);
  }
  rimraf.sync(imgBuildPath);
  fs.mkdirSync(imgBuildPath);
  // eslint-disable-next-line consistent-return
  dirs.forEach((dirItem) => {
    if (dirItem === '.DS_Store') { return false; }
    const inPath = path.join(imgPath, dirItem);
    const paths = fs.readdirSync(inPath);
    paths.forEach((item) => {
      const source = fs.readFileSync(path.join(inPath, item));
      const imgKeys = item.split('.');
      const suffix = imgKeys[1];
      if (!fs.existsSync(path.join(imgBuildPath, dirItem))) {
        fs.mkdirSync(path.join(imgBuildPath, dirItem));
      }
      fs.writeFileSync(path.join(imgBuildPath, dirItem, `${getIconFontScript(source)}.${suffix}`), source);
    });
  });
}

copyImg();
createImgMap(imgPath);
emit();
