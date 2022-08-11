import QRcode from './QRcode.vue';

QRcode.install = (Vue) => {
  Vue.component(QRcode.name, QRcode);
};

export default QRcode;
