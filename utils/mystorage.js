// myStorage
export default (function myStorage() {
  const ms = 'myStorage';
  const storage = window.localStorage;
  if (!window.localStorage) {
  //  console.log('浏览器不支持localstorage');
    return false;
  }
  const init = () => {
    storage.setItem(ms, '{}');
  };
  const set = (key, value) => {
    // 存储
    let mydata = storage.getItem(ms);
    if (!mydata) {
      init();
      mydata = storage.getItem(ms);
    }
    mydata = JSON.parse(mydata);
    mydata[key] = value;
    storage.setItem(ms, JSON.stringify(mydata));
    return mydata;
  };

  const get = (key) => {
    // 读取
    let mydata = storage.getItem(ms);
    if (!mydata) return false;
    mydata = JSON.parse(mydata);
    return mydata[key];
  };

  const remove = (key) => {
    // 读取
    let mydata = storage.getItem(ms);
    if (!mydata) return false;
    mydata = JSON.parse(mydata);
    delete mydata[key];
    storage.setItem(ms, JSON.stringify(mydata));
    return mydata;
  };

  const clear = () => {
    // 清除对象
    storage.removeItem(ms);
  };


  return {
    set,
    get,
    remove,
    init,
    clear,
  };
}());
