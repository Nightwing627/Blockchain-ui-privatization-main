import Header from './index.vue';

Header.install = (Vue) => {
  Vue.component(Header.name, Header);
};

export default Header;
