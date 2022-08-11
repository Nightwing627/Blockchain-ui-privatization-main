import { callApp, watchApp } from './debridge';

export const setBoxHeight = (val) => {
  const depthBoxHeight = document.body.clientHeight;
  const docEle = document.documentElement;
  const docWidth = docEle.clientWidth >= 750 ? 750 : docEle.clientWidth;
  return depthBoxHeight - val * (100 * (docWidth / 375));
};

export {
  callApp,
  watchApp,
};
