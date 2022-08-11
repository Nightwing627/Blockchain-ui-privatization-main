import Header from './header.vue';

Header.install = (Vue) => {
  Vue.component(Header.name, Header);
};

export default Header;
