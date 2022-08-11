import DsBridge from 'dsbridge';

export const callApp = ({ name, params = {} }) => new Promise((resolve) => {
  DsBridge.call(name, JSON.stringify(params), (data) => {
    resolve(JSON.parse(data));
  });
});
export const watchApp = ({ name }) => new Promise((resolve) => {
  DsBridge.registerAsyn(name, (data, callBack) => {
    resolve({
      data: JSON.parse(data),
      callBack,
    });
  });
});
