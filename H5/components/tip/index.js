import Tip from './tip.vue';

Tip.install = (Vue) => {
  Vue.component(Tip.name, Tip);
};

export default Tip;
