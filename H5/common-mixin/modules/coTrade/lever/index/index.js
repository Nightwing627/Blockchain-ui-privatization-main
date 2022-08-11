export default {
  name: 'lever',
  data() {
    return {
      stepPosition: 100,
      movement: 0,
      // 彩虹条光标位置
      lineIndicator: 0,
      // 当前杠杆倍数的索引值
      currenttage: 0,
      leftVal: 0,
    };
  },
  props: {
    level: {
      type: [String, Number],
      default: '',
    },
    levelList: {
      type: Array,
      default: () => [],
    },
    levelSwitch: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    // 杠杆平均百分比
    changeLevelLeftNum() {
      return 100 / (this.levelList.length - 1);
    },
    // 最终的杠杆倍数的索引
    definiteLevel() {
      return this.levelList.indexOf(this.level.toString());
    },
    percentageArr() {
      const arr = [];
      this.levelList.forEach((item, index) => {
        arr.push(parseInt(index * this.changeLevelLeftNum, 0));
      });
      return arr;
    },
  },
  watch: {
    definiteLevel(val) {
      this.currenttage = val;
      // 彩虹条 刻度的位置
      this.lineIndicator = val * this.changeLevelLeftNum;
      this.stepPosition = val * this.changeLevelLeftNum;
    },
  },
  methods: {
    init() {
      if (this.levelList.indexOf(this.level.toString()) !== -1) {
        this.lineIndicator = this.definiteLevel * this.changeLevelLeftNum;
        this.stepPosition = this.definiteLevel * this.changeLevelLeftNum;
      } else {
        this.lineIndicator = 0;
        this.stepPosition = 0;
      }
      // 监听 杠杆 修改失败
      this.$bus.$on('LEVEL_CHANGE_EERROR', () => {
        this.stepPosition = this.definiteLevel * this.changeLevelLeftNum;
      });
      document.onmouseup = () => {
        document.onmousemove = null;
      };
    },
    gtouchstart(event) {
      const self = this.$refs.dragStep;
      const clientx = event.targetTouches[0].clientX;
      this.leftVal = clientx - self.offsetLeft;
    },
    gtouchmove(event) {
      const bar = this.$refs.dragStepWrap;
      const clientx = event.changedTouches[0].clientX;
      let movement = clientx - this.leftVal;
      if (movement < 0) {
        movement = 0;
      } else if (movement > bar.offsetWidth) {
        movement = bar.offsetWidth;
      }
      const stepPosition = parseInt((movement / bar.offsetWidth) * 100, 0);
      this.percentageArr.forEach((item, i) => {
        const minVal = i === 0 ? 0 : item - (item - this.percentageArr[i - 1]) / 2;
        const maxVal = i === this.percentageArr.length - 1
          ? 100 : item + (this.percentageArr[i + 1] - item) / 2;
        if (stepPosition > minVal && stepPosition < maxVal) {
          this.stepPosition = item;
          // 当前杠杆倍数的索引值
          this.currenttage = i;
        }
      });
    },
    gtouchend() {
      const currentLevel = this.levelList[this.currenttage];
      this.$emit('levelChange', currentLevel);
    },
    // 杠杆滑动
    onmousedown(event) {
      if (this.levelSwitch) {
        let oevent = event || window.event;
        const self = this.$refs.dragStep;
        const bar = this.$refs.dragStepWrap;
        const leftVal = oevent.clientX - self.offsetLeft;
        document.onmousemove = (e) => {
          oevent = e || window.event;
          let movement = oevent.clientX - leftVal;
          if (movement < 0) {
            movement = 0;
          } else if (movement > bar.offsetWidth) {
            movement = bar.offsetWidth;
          }
          const stepPosition = parseInt((movement / bar.offsetWidth) * 100, 0);
          this.percentageArr.forEach((item, i) => {
            const minVal = i === 0 ? 0 : item - (item - this.percentageArr[i - 1]) / 2;
            const maxVal = i === this.percentageArr.length - 1
              ? 100 : item + (this.percentageArr[i + 1] - item) / 2;
            if (stepPosition > minVal && stepPosition < maxVal) {
              this.stepPosition = item;
              // 当前杠杆倍数的索引值
              this.currenttage = i;
            }
          });
          document.onmouseup = () => {
            document.onmousemove = null;
            const currentLevel = this.levelList[this.currenttage];
            this.$emit('levelChange', currentLevel);
          };
        };
        document.onmouseup = () => {
          document.onmousemove = null;
        };
      }
    },
    // 点击 滑动到指定倍数位置
    dragStep(item, index) {
      if (this.levelSwitch) {
        this.stepPosition = index * this.changeLevelLeftNum;
        this.$emit('levelChange', item);
      }
    },
    // 设置默认倍数 || 返回之前倍数的位置
    setDefaultStep(data = 1) {
      const index = this.levelList.indexOf(data.toString());
      this.stepPosition = index * this.changeLevelLeftNum;
    },
  },
};
