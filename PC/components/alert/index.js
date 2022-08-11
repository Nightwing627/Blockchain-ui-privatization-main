import Alert from './Alert.vue';

Alert.install = (Vue) => {
  Vue.component(Alert.name, Alert);
};

export default Alert;
