export default {
  watch: {
    home_edit_html(val) {
      if (val) {
        this.$nextTick(() => {
          if (window.bitWindHomeFuncton) {
            window.bitWindHomeFuncton();
          }
        });
      }
    },
  },
  methods: {
    bitWindInit() {
      if (window.bitWindHomeFuncton) {
        const $app = document.getElementById('app');
        $app.classList.add('bitwind-page-app');
        window.bitWindHomeFuncton();
      }
    },
  },
};
