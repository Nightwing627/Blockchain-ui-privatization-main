import Dialog from './homeDialog.vue';

Dialog.install = (Vue) => {
  Vue.component(Dialog.name, Dialog);
};

export default Dialog;
