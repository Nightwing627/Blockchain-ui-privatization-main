import {
  colorMap,
  getHex,
} from '@/utils';

export default {
  name: 'set-forcedReminder',
  data() {
    return {
      // 是否可以提交
      dialogConfirmLoading: false,
      // 是否禁止提交
      dialogConfirmDisabled: false,
      // 是否不在显示弹框
      isNotReConfirm: false,
      // 时间
      time: null,
      timer: null,
      // dataInfo: {
      //   symbol: 'BTCUSDTX',
      //   orderType: '限价单',
      //   sideText: '买入做多',
      //   sideClass: 'u-4-bg',
      //   isOpenAndIsMarket: true,
      //   price: '10000 USDTX',
      //   vol: '12333 ETHX',
      //   marginCoin: 'BTCX',
      //   currentCategory: 3,
      // },
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
    dataInfo: {
      default() {
        return {};
      },
      type: Object,
    },
  },
  computed: {
    lanText() {
      return {
        text1: this.$t('futures.reminder.text1'), // 触发价格
        text2: this.$t('futures.reminder.text2'), // 价格
        text3: this.$t('futures.reminder.text3'), // 下次不要提示，您可在【交易偏好设置】中重新设置
        text4: this.$t('futures.reminder.text4'), // 金额
        text5: this.$t('futures.reminder.text5'), // 数量
        text6: this.$t('futures.reminder.text6'), // 占用保证金
        text7: this.$t('futures.reminder.text7'), // 委托保证金
        text8: this.$t('futures.reminder.text8'), // 限价单
        text9: this.$t('futures.reminder.text9'), // 市价单
        text10: this.$t('futures.reminder.text10'), // 条件单
      };
    },
    // 弹框标题文案
    titleText() {
      if (this.dataInfo) {
        return `${this.dataInfo.sideText}${this.dataInfo.symbol}`;
      }
      return null;
    },
    // 确认按钮文案
    confirmText() {
      return this.dataInfo.sideText;
    },
    // 数量 || 金额
    volPrice() {
      if (this.dataInfo.isOpenAndIsMarket) {
        return this.lanText.text4; // '金额';
      }
      return this.lanText.text5; // '数量';
    },
    // 保证金标题
    marginTitle() {
      if (this.dataInfo && this.dataInfo.currentCategory === 3) {
        return this.lanText.text6; // '占用保证金';
      }
      return this.lanText.text7; // '委托保证金';
    },
    // 订单类型
    orderType() {
      let text = this.lanText.text8; // '限价单';
      if (this.dataInfo.currentCategory === 2) {
        text = this.lanText.text9; // '市价单';
      }
      if (this.dataInfo.currentCategory === 3) {
        text = this.lanText.text10; // '条件单';
      }
      return text;
    },
  },
  watch: {
    dataInfo(val) {
      setTimeout(() => {
        const box = document.getElementsByClassName('toConfirmBtn')[0];
        if (box) {
          box.style.setProperty('background-color', getHex(colorMap[val.sideClass]), 'important');
        }
      });
    },
  },
  methods: {
    init() {
      clearInterval(this.timer);
      this.fnCreatClock();
      this.timer = setInterval(() => {
        this.fnCreatClock();
      }, 1000);
    },
    // 二次确认提交
    submitConfirm() {
      // this.close();
      this.$emit('submitOrder', this.isNotReConfirm);
    },
    isReConfirmFun() {
      this.isNotReConfirm = !this.isNotReConfirm;
    },
    fnToDouble(num) {
      // 声明一个返回结果
      let sResult = '';
      if (num < 10) {
        // 判断数字小于10则是单数字，需要在前面添加字符串0
        sResult = `0${num}`;
      } else {
        // 数字为10以上转换为字符串
        sResult = `${num}`;
      }
      // 返回格式化后的字符串
      return sResult;
    },
    fnCreatClock() {
      const dLocal = new Date();
      const nYear = dLocal.getFullYear();
      const nMonth = dLocal.getMonth() + 1;
      const nDate = dLocal.getDate();
      const nHours = dLocal.getHours();
      const nMinutes = dLocal.getMinutes();
      const nSeconds = dLocal.getSeconds();

      this.time = `${nYear}-${this.fnToDouble(nMonth)}-${this.fnToDouble(nDate)
      } ${this.fnToDouble(nHours)}:${this.fnToDouble(nMinutes)}:${this.fnToDouble(nSeconds)}`;
    },

  },
};
