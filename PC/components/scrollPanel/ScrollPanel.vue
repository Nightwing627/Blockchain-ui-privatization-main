<template>
  <div class='parent'>
    <vue-scroll>
      <div><span class='demo-title'>Vuescroll</span></div>
      <div><span class='demo-title'>Vuescroll</span></div>
      <div><span class='demo-title'>Vuescroll</span></div>
      <div><span class='demo-title'>Vuescroll</span></div>
      <div><span class='demo-title'>Vuescroll</span></div>
      <div><span class='demo-title'>Vuescroll</span></div>
      <div><span class='demo-title'>Vuescroll</span></div>
      <div><span class='demo-title'>Vuescroll</span></div>
      <div><span class='demo-title'>Vuescroll</span></div>
      <div><span class='demo-title'>Vuescroll</span></div>
      <div><span class='demo-title'>Vuescroll</span></div>
      <div><span class='demo-title'>Vuescroll</span></div>
      <div><span class='demo-title'>Vuescroll</span></div>
      <div><span class='demo-title'>Vuescroll</span></div>
      <div><span class='demo-title'>Vuescroll</span></div>
      <div><span class='demo-title'>Vuescroll</span></div>
      <div><span class='demo-title'>Vuescroll</span></div>
      <div><span class='demo-title'>Vuescroll</span></div>
      <div><span class='demo-title'>Vuescroll</span></div>
      <div><span class='demo-title'>Vuescroll</span></div>
      <div><span class='demo-title'>Vuescroll</span></div>
      <div><span class='demo-title'>Vuescroll</span></div>
      <div><span class='demo-title'>Vuescroll</span></div>
      <div><span class='demo-title'>Vuescroll</span></div>
    </vue-scroll>
  </div>
</template>

<script>
const easings = [
  'easeInQuad',
  'easeOutQuad',
  'easeInOutQuad',
  'easeInCubic',
  'easeOutCubic',
  'easeInOutCubic',
  'easeInQuart',
  'easeOutQuart',
  'easeInOutQuart',
  'easeInQuint',
  'easeOutQuint',
  'easeInOutQuint',
];
export default {
  name: 'c-scrollPanel',
  data() {
    return {
      ops: {
        rail: {
          opacity: '0.2',
          background: undefined,
          border: '1px solid #cecece',
          size: '15px',
        },
        bar: {
          background: undefined,
          keepShow: false,
          size: '10px',
          minSize: 0.2,
        },
        scrollButton: {
          enable: true,
          background: '#cecece',
        },
        scrollPanel: {
          easing: 'easeInQuad',
          speed: 800,
        },
      },
      width: '',
      easings,
    };
  },
  mounted() {},
  methods: {},
};
</script>

<style lang='stylus'>

.parent {
  height: 300px;
}
</style>
