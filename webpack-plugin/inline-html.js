const path = require('path');
const fs = require('fs');
const {transform} = require('@babel/core');
const crypto = require('crypto');
const cp = require('child_process');
let platform = 'pc';

const projectPath = process.cwd();
const jsFiles = fs.readFileSync(path.join(__dirname, '../static/js/html-init.js'), 'utf-8');
const h5jsFiles = fs.readFileSync(path.join(__dirname, '../static/js/h5-html-init.js'), 'utf-8');

const evnConfig = ['ex', 'otc', 'co', 'swap', 'sly'];

let gitVersion = '';
const lastTagCommand = 'git describe --abbrev=0 --tags';

const staticFolder = path.join(projectPath, 'app/public/static/');
const outPath = path.join(projectPath, 'app/dist/static/');
const distPath = path.join(projectPath, 'app/dist/');
try {
  const gitHead = fs.readFileSync('.git/HEAD', 'utf-8').trim();
  // eslint-disable-next-line prefer-destructuring
  gitVersion = gitHead.split('/')[2];
} catch (e) {
  // eslint-disable-next-line no-console
  console.log('no git version');
}

if (!gitVersion) {
  try {
    gitVersion = cp.execSync(lastTagCommand, { cwd: '.' }).toString().replace(/\s/g, '');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('no git tag');
  }
}

function getIconFontScript(source) {
  const md5sum = crypto.createHash('md5');
  md5sum.update(source);
  const md5 = md5sum.digest('hex');
  return md5;
}

function copyStaticFolder(dirPath, outToPath) {
  fs.readdirSync(dirPath).forEach((value) => {
    const filePath = path.join(dirPath, value);
    let intoPath = path.join(outToPath, value);
    if (fs.statSync(filePath).isDirectory()) {
      if (!fs.existsSync(intoPath)) {
        fs.mkdirSync(intoPath);
      }
      copyStaticFolder(filePath, intoPath);
    } else {
      const codeType = /.js|.css|.html/ig.test(value) ? 'UTF-8' : null;
      let fileSource = fs.readFileSync(filePath, codeType);
      if (intoPath.indexOf('iconfont') > -1 || intoPath.indexOf('web-worker') > -1) {
        fileSource = transform(fileSource, {
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
        }).code;
        if (process.env.NODE_ENV === 'production') {
          const hashValue = `${getIconFontScript(fileSource)}-${value}`;
          intoPath = path.join(outToPath, hashValue);
        }
      }
      fs.writeFileSync(intoPath, fileSource);
    }
  });
}

function createStaticFolder() {
  if (process.env.NODE_ENV === 'production') {
    const webWorkerOutPath = path.join(outPath, 'web-worker');
    const localesPath = path.join(outPath, 'locales');
    const imgPath = path.join(outPath, 'img');
    const defImgPath = path.join(outPath, 'img/1');
    if (!fs.existsSync(distPath)) {
      fs.mkdirSync(distPath);
    }
    if (!fs.existsSync(outPath)) {
      fs.mkdirSync(outPath);
    }
    if (!fs.existsSync(webWorkerOutPath)) {
      fs.mkdirSync(webWorkerOutPath);
    }
    if (!fs.existsSync(localesPath)) {
      fs.mkdirSync(localesPath);
    }
    if (!fs.existsSync(imgPath)) {
      fs.mkdirSync(imgPath);
    }
    if (!fs.existsSync(defImgPath)) {
      fs.mkdirSync(defImgPath);
    }
    copyStaticFolder(path.join(__dirname, '../web-worker'), webWorkerOutPath);
    copyStaticFolder(path.join(__dirname, '../static'), outPath);
    copyStaticFolder(path.join(staticFolder, '../static/locales'), path.join(distPath, 'static/locales'));
    copyStaticFolder(path.join(projectPath, 'app/public/static/img/1'), defImgPath);
  } else {
    const webWorkerOutPath = path.join(projectPath, 'app/public/static/web-worker');
    if (!fs.existsSync(staticFolder)) {
      fs.mkdirSync(staticFolder);
    }
    if (!fs.existsSync(webWorkerOutPath)) {
      fs.mkdirSync(webWorkerOutPath);
    }
    copyStaticFolder(path.join(__dirname, '../web-worker'), webWorkerOutPath);
    copyStaticFolder(path.join(__dirname, '../static'), staticFolder);
  }
}

function resloveHtml(html, type) {
  let jsPath = jsFiles;
  if(platform === 'h5'){
    jsPath = h5jsFiles;
  }
  const script = transform(jsPath, {
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
  }).code;
  let str = html.replace('<script inline-html></script>', `<script>window.evn = "${process.env.NODE_ENV}";window.sysVersion = "${gitVersion}";window.updateDate="${new Date()}"; ${script}</script>`);
  str = str.replace(/\/{{staticDomain}}/g, '{{staticDomain}}');
  if (process.env.NODE_ENV === 'production') {
    str = str.replace(/<script[^>]*>[\s\S]*?<\/[^>]*script>/gi, (item) => {
      let val = item;
      if (item.indexOf('iconfont.js') > -1) {
        let source = fs.readFileSync(path.join(__dirname, '../static/js/iconfont.js'), 'UTF-8');
        source = transform(source, {
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
        }).code;
        val = item.replace('iconfont.js', `${getIconFontScript(source)}-iconfont.js`);
      }
      return val;
    });
  }
  return str;
}

function emit(compilation, cb) {
  const keys = Object.keys(compilation.assets);
  keys.forEach((item) => {
    const name = item.split('-')[0];
    if (evnConfig.indexOf(name) > -1) {
      const source = compilation.assets[item].source();
      const html = resloveHtml(source, this.type);
      const obj = {
        source: () => html,
        size: () => html.size,
      };
      // eslint-disable-next-line no-param-reassign
      compilation.assets[item] = obj;
    }
  });
  createStaticFolder();
  cb();
}

class InlineHtmlPlugin {
  constructor(type) {
    platform = type;
  }
  apply(compiler) {
    if (compiler.hooks) {
      const plugin = { name: 'inline-html-plugin' };
      compiler.hooks.emit.tapAsync(plugin, emit);
    } else {
      compiler.plugin('emit', emit);
    }
  }
}
module.exports = InlineHtmlPlugin;