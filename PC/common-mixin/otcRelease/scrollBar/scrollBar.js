export default {
  name: 'otcRelease-scrollBar',
  data() {
    return {
      flag: false,
      left: 0,
      num: 0,
      clientX: 0,
      currentLeft: 0,
    };
  },
  props: {
    name: { default: '', type: String },
    className: { default: '', type: String },
  },
  watch: {
    num(v) { this.$emit('change', v.toString()); },
  },
  destroyed() {
    this.$bus.$off('documentMouseUp');
    this.$bus.$off('otcRelease-scrollBar-init');
  },
  methods: {
    init() {
      this.left = 141;
      this.num = 0;
      this.$emit('change', this.num);
      this.$bus.$on('otcRelease-scrollBar-init', (name) => {
        if (this.name === name) {
          this.init();
        }
      });
      this.$bus.$on('documentMouseUp', () => {
        document.removeEventListener('mousemove', this.handMouseMove, false);
      });
    },
    handMouseDown(e) {
      this.clientX = e.clientX;
      this.currentLeft = this.left;
      document.addEventListener('mousemove', this.handMouseMove, false);
    },
    handMouseMove(e) {
      // const scrollLeft = this.$refs.scroll.offsetLeft;
      const scrollWidth = this.$refs.scroll.offsetWidth;
      let nowClientX = e.clientX - this.clientX + this.currentLeft;
      if (nowClientX < 0) {
        nowClientX = 0;
      } else if (nowClientX > scrollWidth) {
        nowClientX = scrollWidth;
      }
      this.left = nowClientX - 9;
      if (this.left === 141) {
        this.num = 0;
      } else if (this.left > 141) {
        this.num = Math.ceil((this.left - 141) / 3);
      } else if (this.left < 141) {
        this.num = `-${Math.ceil((141 - this.left) / 3)}`;
      }
    },
  },
};
