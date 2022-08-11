import menusNav from './menusNav.vue';

menusNav.install = (Vue) => {
  Vue.component(menusNav.name, menusNav);
};

export default menusNav;
