export default function (defMap, baseUrl = '') {
  const defaultMap = defMap;
  const imgMap = window.previewImgMap || window.imgMap;
  const url = baseUrl === '/' ? '' : baseUrl;
  if (!imgMap) {
    Object.keys(defaultMap).forEach((key) => {
      if (!/^(http|https)/.test(defaultMap[key])) {
        defaultMap[key] = url + defaultMap[key];
      }
    });
  }

  const imgs = imgMap || defaultMap;
  // return defaultMap;
  return imgs;
}
