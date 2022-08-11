import {
  fixInput, nul, division, fixD, thousandsComma,
} from '@/utils';

export default {
  name: 'lever',
  data() {
    return {
      stepPosition: 1,
      currenttage: 1,
      movement: 0,
      // 是否加载成功
      dialogConfirmLoading: false,
      // 是否禁止提交
      dialogConfirmDisabled: false,
      // 是否禁止输入
      inputDisabled: false,
      // 杠杆输入框选中Class
      inputActiveClass: '',
      // 杠杆值
      leverage: 0,
      // 最小杠杆倍数
      minLeverage: 1,
      // 最大杠杆倍数
      maxLeverage: 100,
      // 开关
      levelSwitch: true,
      // 当前杠杆最高可持有仓位上限
      maxNumber: 0,
      isShowUserMaxLevel: false,
    };
  },
  props: {
    isShow: {
      default: false,
      type: Boolean,
    },
    close: {
      default() {},
      type: Function,
    },
  },
  computed: {
    lanText() {
      return {
        text1: this.$t('futures.lever.text1'), // 杠杆倍数
        text2: this.$t('futures.lever.text2'), // 当前持仓最高支持杠杆
        text3: this.$t('futures.lever.text3'), // 当前杠杆最高可持有仓位上限约
        text4: this.$t('futures.lever.text4'), // 确认
        text5: this.$t('futures.lever.text5'), // 请登录后再进行操作
        text6: this.$t('futures.lever.text6'), // 本合约有委托单不可调整杠杆
        text7: this.$t('futures.lever.text7'), // 合约杠杆
        text8: this.$t('futures.lever.text8'), // 杠杆倍数最小不能低于
      };
    },
    itemLvaue() {
      return division(this.maxLeverage, 5);
    },
    feeValue() {
      return division(this.maxLeverage, 100);
    },
    // 提交保证金按钮文案
    confirmText() {
      let text = this.lanText.text4; // '确认';
      if (!this.isLogin) {
        text = this.lanText.text5; // '请登录后再进行操作';
      }
      if (!this.levelSwitch) {
        text = this.lanText.text6; // '本合约有委托单不可调整杠杆';
        this.dialogConfirmDisabled = true;
      }
      return text;
    },
    // 是否Login
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    // 用户配置信息
    userConfig() {
      return this.$store.state.future.futureUserConfig;
    },
    // 用户信息配置-可持有仓位上限
    leverCeiling() {
      if (this.userConfig) {
        return this.userConfig.leverCeiling;
      }
      return null;
    },
    // 用户最大可选择杠杆
    userMaxLevel() {
      return this.userConfig ? this.userConfig.userMaxLevel : 0;
    },
    // 当前合约ID
    contractId() {
      return this.$store.state.future.contractId;
    },
    // 数量单位
    coUnit() {
      return this.$store.state.future.coUnit;
    },
    // 当前合约面值
    multiplier() {
      return Number(this.$store.state.future.multiplier);
    },
    // 当前合约数量精度
    volfix() {
      return this.$store.state.future.volfix;
    },
    // 数量单位类型Number
    coUnitType() {
      return this.$store.state.future.coUnitType;
    },
    // 当前合约信息
    contractInfo() {
      return this.$store.state.future.contractInfo;
    },
    // 当前合约名称
    activeContractName() {
      let name = '';
      let text = '';
      if (this.contractInfo) {
        const nameText = this.contractInfo.symbol ? this.contractInfo.symbol.replace('-', '') : '';
        if (this.contractInfo.contractType !== 'E') {
          text = `-${this.contractInfo.marginCoin}`;
        }
        name = `${nameText}${text}`;
      }
      return name;
    },
    // 弹窗标题
    dialogTitle() {
      return `${this.activeContractName} ${this.lanText.text7}`; // 合约杠杆
    },
  },
  watch: {
    currenttage(val) {
      if (val || val === 0) {
        if (val > 100) {
          this.currenttage = 100;
        }
        if (val < 2) {
          this.leverage = 1;
        } else {
          this.leverage = Math.round(nul(this.currenttage, this.feeValue));
        }
      } else {
        this.leverage = '';
      }
    },
    leverage(val, old) {
      if (val) {
        // console.log(val);
        if (Number(val) > this.userMaxLevel) {
          this.isShowUserMaxLevel = true;
          setTimeout(() => {
            this.leverage = this.userMaxLevel;
          }, 100);
        } else {
          this.leverage = fixInput(val, 0);
          if (old && Number(old) <= this.userMaxLevel && Number(val) < Number(old)) {
            this.isShowUserMaxLevel = false;
          }
          if (this.userMaxLevel && Number(val) > this.userMaxLevel) {
            this.dialogConfirmDisabled = true;
          } else {
            this.dialogConfirmDisabled = false;
          }

          if (Number(val) > this.maxLeverage) {
            this.leverage = this.maxLeverage;
          }

          this.setPosition();
          this.setMaxNumber();
        }
      }
    },
    userConfig(val) {
      if (val) {
        this.levelSwitch = !!this.userConfig.levelCanSwitch;
        this.minLeverage = this.userConfig.minLevel;
        this.maxLeverage = this.userConfig.maxLevel;
        this.dialogConfirmDisabled = !this.levelSwitch;
      }
    },
  },
  methods: {
    init() {
      if (this.userConfig) {
        this.leverage = this.userConfig.nowLevel;
        this.minLeverage = this.userConfig.minLevel;
        this.maxLeverage = this.userConfig.maxLevel;
        this.levelSwitch = !!this.userConfig.levelCanSwitch;
        this.dialogConfirmDisabled = !this.levelSwitch;
      } else {
        this.leverage = 20;
      }
      document.onmouseup = () => {
        document.onmousemove = null;
      };
    },
    // 设置最大持仓上限
    setMaxNumber() {
      let num = 0;
      if (this.leverCeiling) {
        const keyArr = Object.keys(this.leverCeiling);
        keyArr.sort((a, b) => parseFloat(a) - parseFloat(b));
        let nextL = 0;
        for (let index = 0; index < keyArr.length; index += 1) {
          if (Number(this.leverage) > nextL && Number(this.leverage) <= keyArr[index]) {
            num = this.leverCeiling[keyArr[index]];
          }
          nextL = keyArr[index];
        }
        // 标的货币
        if (this.coUnitType === 1) {
          this.maxNumber = fixD(num, this.volfix);
        }
        // 张
        if (this.coUnitType === 2) {
          this.maxNumber = fixD(division(num, this.multiplier), 0);
        }
      }
    },
    // 设置滑竿位置
    setPosition() {
      if (this.leverage) {
        if (this.leverage < 2) {
          this.stepPosition = 0;
        } else {
          this.stepPosition = division(this.leverage, this.feeValue);
        }
      } else {
        this.stepPosition = 1;
      }
    },
    onmousedownCick(e) {
      if (this.levelSwitch) {
        const bar = this.$refs.dragStepWrap;
        const barLeft = bar.getBoundingClientRect().x;
        const oevent = e || window.event;
        const leftVal = oevent.clientX - barLeft;
        const stepPosition = parseInt(nul(division(leftVal, bar.offsetWidth), 100), 0);
        this.currenttage = stepPosition < 1 ? 1 : stepPosition;
      }
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
          const stepPosition = parseInt(nul(division(movement, bar.offsetWidth), 100), 0);
          this.currenttage = stepPosition < 1 ? 1 : stepPosition;
          document.onmouseup = () => {
            document.onmousemove = null;
          };
        };
        document.onmouseup = () => {
          document.onmousemove = null;
        };
      }
    },
    // 点击 滑动到指定倍数位置
    dragStep(index) {
      if (this.levelSwitch) {
        // this.stepPosition = nul(index, 20);
        this.currenttage = nul(index, 20);
        this.$emit('levelChange', index);
      }
    },
    // 乘法
    nulFun(val1, val2) {
      return Math.round(nul(val1, val2));
    },
    // 加
    add() {
      this.isClickAddOrSub = true;
      if (this.levelSwitch) {
        if (Number(this.leverage) < Number(this.maxLeverage)
          && Number(this.leverage) < Number(this.userMaxLevel)) {
          const leverage = Number(this.leverage) + 1;
          this.leverage = leverage;
          this.isShowUserMaxLevel = false;
        } else {
          this.isShowUserMaxLevel = true;
        }
      }
    },
    // 减
    subtract() {
      if (this.levelSwitch) {
        this.isClickAddOrSub = true;
        if (Number(this.leverage) > 1) {
          const leverage = Number(this.leverage) - 1;
          this.leverage = leverage;
          this.isShowUserMaxLevel = false;
        } else {
          this.isShowUserMaxLevel = true;
        }
      }
    },
    // 提交杠杆倍数
    submitLeverage() {
      if (!this.isLogin) {
        this.$router.push('/login');
        return false;
      }
      if (this.minLeverage > this.leverage) {
        // 杠杆倍数最小不能低于
        this.$bus.$emit('tip', { text: `${this.lanText.text8}${this.minLeverage}`, type: 'error' });
      }
      if (this.userConfig) {
        this.dialogConfirmLoading = true;
        this.axios({
          url: this.$store.state.url.futures.levelEdit,
          hostType: 'co',
          method: 'post',
          params: {
            nowLevel: this.leverage,
            contractId: this.contractId,
          },
        }).then(({ code, msg }) => {
          if (code.toString() === '0') {
            this.$store.dispatch('getUserConfig');
            this.close();
            this.$bus.$emit('tip', { text: msg, type: 'success' });
          } else {
            this.$bus.$emit('tip', { text: msg, type: 'error' });
          }
          this.dialogConfirmLoading = false;
        });
      }
      return false;
    },
    thousandsComma(num) {
      if (num) {
        return thousandsComma(num);
      }
      return num;
    },
  },
};
