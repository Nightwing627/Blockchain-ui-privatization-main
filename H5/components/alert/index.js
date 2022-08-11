import Alert from './alert.vue';

Alert.install = (Vue) => {
  Vue.component(Alert.name, Alert);
};

export default Alert;
