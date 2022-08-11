import Dialog from './noticeDialog.vue';

Dialog.install = (Vue) => {
  Vue.component(Dialog.name, Dialog);
};

export default Dialog;
