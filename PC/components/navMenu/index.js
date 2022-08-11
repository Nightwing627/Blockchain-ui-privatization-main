import NavMenu from './NavMenu.vue';

NavMenu.install = (Vue) => {
  Vue.component(NavMenu.name, NavMenu);
};

export default NavMenu;
