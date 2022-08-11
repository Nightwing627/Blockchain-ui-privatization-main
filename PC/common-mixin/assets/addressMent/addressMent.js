import { getCoinShowName, colorMap, imgMap } from '@/utils';

export default {
  name: 'page-addressMent',
  data() {
    return {
      tabelLoading: true,
      imgMap,
      colorMap,
      alertFlag: false,
      selectList: [],
      remarksisRequire: false,
      symbolValue: '', // 添加地址 -- 币种
      addressValue: '', // 添加地址 -- 地址
      remarksValue: '', // 添加地址 -- 备注
      pagesValue: '', // 添加地址 -- 标签
      googleValue: '', // 添加地址 -- 谷歌验证码
      phoneValue: '', // 添加地址 -- 手机验证码
      havePageArr: ['XRP', 'EOS'], // 含有标签的币种
      dialogFlag: false, // 验证框flag
      dialogConfirmLoading: false, // 弹窗按钮确认loading状态
      tableList: [],
      dialogStatus: '', // 弹窗状态 add 为增加 del 为删除
      deleteObj: {}, // 删除的地址 对象
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      branchTip: '',
    };
  },
  computed: {
    symbol() { return this.symbolValue; },
    enforceGoogleAuth() {
      return this.$store.state.baseData.is_enforce_google_auth || 0;
    },
    authTitleText() {
      const text = this.enforceGoogleAuth ? 'assets.withdraw.enforceGoogleAuth' : 'assets.withdraw.safetyWarningError';
      return this.$t(text);
    },
    alertData() {
      const arr = [
        // 绑定谷歌验证
        { text: this.$t('assets.withdraw.bindGoogle'), flag: this.OpenGoogle },
      ];
      if (!this.enforceGoogleAuth) {
        // 绑定手机验证
        arr.push({ text: this.$t('assets.withdraw.bindPhone'), flag: this.OpenMobile });
      }
      return arr;
    },
    // finance/account_balance 接口返回成功的数据
    exchangeData() { return this.$store.state.assets.exchangeData; },
    // market 接口
    market() { return this.$store.state.baseData.market; },
    // userInfo是否请求完毕
    userInfoIsReady() { return this.$store.state.baseData.userInfoIsReady; },
    // 表格title
    columns() {
      return [
        { title: this.$t('assets.addressMent.listCoin'), width: '20%' }, // 币种
        {
          title: this.$t('assets.addressMent.listAddress'),
          width: '47%',
          align: 'left',
          styleClass: 'add-text clearfix',
        }, // 地址
        { title: this.$t('assets.addressMent.listRemarks'), width: '20%' }, // 备注
        { title: this.$t('assets.addressMent.listOptions'), width: '20%' }, // 操作
      ];
    },
    // 用户是否开启手机
    OpenMobile() {
      let flag = false;
      const { userInfo } = this.$store.state.baseData;
      if (userInfo && userInfo.isOpenMobileCheck.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    // 用户是否开启谷歌
    OpenGoogle() {
      let flag = false;
      const { userInfo } = this.$store.state.baseData;
      if (userInfo && userInfo.googleStatus.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    // 该币种是否有标签
    isHavePage() {
      let flag = false;
      // 判断market是否请求下来
      if (this.market && this.market.coinList) {
        if (!this.haveBranch) {
          // 判断market.coinList是否有当前币种
          if (this.market.coinList[this.symbolValue]) {
            const { tagType } = this.market.coinList[this.symbolValue];
            flag = tagType;
          }
        } else if (this.market.followCoinList[this.symbolValue][this.activeBranch]) {
          const { tagType } = this.market.followCoinList[this.symbolValue][this.activeBranch];
          flag = tagType;
        }
      }
      return flag;
    },
    // 用于检测标签  如果该币种有标签则 非空才通过
    pagesFlag() {
      let flag = false;
      // 如果有值 算通过
      /*    if (this.pagesValue.length) {
        flag = true;
      } */
      // 如果没有标签 直接算通过
      switch (Number(this.isHavePage)) {
        case 1:
        {
          flag = true;
          break;
        }
        case 2:
        {
          if (this.pagesValue.length) {
            flag = true;
          }
          break;
        }
        default:
        {
          flag = true;
        }
      }
      return flag;
    },
    // 添加按钮disabled
    addressBtnDisabled() {
      if (!this.userInfoIsReady) { return true; }
      let flag = true;
      if (this.symbolValue.length
      && this.addressValue.length
      && this.remarksValue.length
      && this.pagesFlag) {
        flag = false;
      }
      return flag;
    },
    // phoneValue 是否复合正则验证
    phoneValueFlag() { return this.$store.state.regExp.verification.test(this.phoneValue); },
    // googleValue 是否复合正则验证
    googleValueFlag() { return this.$store.state.regExp.verification.test(this.googleValue); },
    phoneError() {
      if (this.phoneValue.length !== 0 && !this.phoneValueFlag) return true;
      return false;
    },
    googleError() {
      if (this.googleValue.length !== 0 && !this.googleValueFlag) return true;
      return false;
    },
    // 弹窗确认按钮disabled
    dialogConfirmDisabled() {
      let phone = true;
      let google = true;
      if (this.OpenMobile) { phone = this.phoneValueFlag; }
      if (this.OpenGoogle) { google = this.googleValueFlag; }
      if ((phone && google) || this.dialogConfirmLoading) {
        return false;
      }
      return true;
    },
  },
  watch: {
    market(v) {
      if (v && this.exchangeData) {
        this.initSelectData();
      }
      if (v) {
        this.getTableList();
      }
      if (v && this.symbol) {
        this.branchInit(this.market);
      }
    },
    symbol(v) {
      if (v && this.market) {
        this.branchInit(this.market);
      }
    },
    userInfoIsReady() { this.canAlert(); },
    exchangeData(v) { if (v && this.market) { this.initSelectData(); } },
    // 添加地址切换币种时 清空地址/备注/标签
    symbolValue() {
      this.addressValue = '';
      this.remarksValue = '';
      this.pagesValue = '';
    },
    activeBranch(v) {
      if (v) {
        this.axios({
          url: 'cost/Getcost',
          params: {
            symbol: v,
          },
        }).then((data) => {
          if (data.code.toString() === '0') {
            this.branchTip = data.data.mainChainNameTip;
          }
        });
      }
    },
  },
  methods: {
    init() {
      // 如果没有 finance/account_balance 接口返回成功的数据
      if (!this.exchangeData) {
        this.$store.dispatch('assetsExchangeData');
      } else if (this.market) {
        this.initSelectData();
      }
      if (this.userInfoIsReady) {
        this.canAlert();
      }
      if (this.market) {
        this.getTableList();
      }
    },
    canAlert() {
      if (this.OpenGoogle || (!this.enforceGoogleAuth && this.OpenMobile)) {
        this.alertFlag = false;
      } else {
        setTimeout(() => {
          this.alertFlag = true;
        }, 100);
      }
    },
    alertClone() { this.alertFlag = false; },
    alertGo() { this.$router.push('/personal/userManagement'); },
    pagechange() {

    },
    // 添加地址 -- input改变
    inputLineChange(value, name) {
      this[name] = value;
    },
    // 添加地址 -- select改变
    selectLineChange(item) { this.symbolValue = item.code; },
    setActiveBranch(v) {
      this.activeBranch = v.code;
    },
    // 添加地址 -- select数据
    initSelectData() {
      const list = [];
      Object.keys(this.exchangeData.allCoinMap).forEach((item) => {
        if (this.exchangeData.allCoinMap[item].isFiat) {
          return;
        }
        const { coinList } = this.market;
        const showCoin = getCoinShowName(item, coinList);
        list.push({ value: showCoin, code: item });
      });
      this.selectList = list;
    },
    addressBtnClick() {
      if (this.OpenGoogle || (!this.enforceGoogleAuth && this.OpenMobile)) {
        this.dialogStatus = 'add';
        this.dialogFlag = true;
        return;
      }
      this.alertFlag = true;
    },
    // 弹框取消
    dialogClose() {
      this.dialogFlag = false;
      this.googleValue = '';
      this.phoneValue = '';
      this.dialogStatus = '';
    },
    // 弹框确认
    dialogConfirm() {
      if (this.dialogStatus === 'add') {
        this.addDialogConfirm();
      } else if (this.dialogStatus === 'del') {
        this.delDialogConfirm();
      }
    },
    addDialogConfirm() {
      this.dialogConfirmLoading = true;
      let address = this.addressValue;
      if (this.isHavePage) {
        address += `_${this.pagesValue}`;
      }
      this.axios({
        url: 'addr/add_withdraw_addr',
        params: {
          coinSymbol: this.haveBranch ? this.activeBranch : this.symbolValue, // 币种
          address, // 地址
          label: this.remarksValue, // 备注
          smsValidCode: this.phoneValue, // 手机验证码
          googleCode: this.googleValue, // 谷歌验证码
        },
      }).then((data) => {
        this.dialogConfirmLoading = false;
        if (data.code.toString() !== '0') {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.getTableList();
          this.dialogFlag = false;
          this.addressValue = '';
          this.remarksValue = '';
          this.pagesValue = '';
          this.googleValue = '';
          this.phoneValue = '';
          this.dialogStatus = '';
        }
      });
    },
    delDialogConfirm() {
      this.dialogConfirmLoading = true;
      this.axios({
        url: 'addr/delete_withdraw_addr',
        params: {
          ids: [this.deleteObj.id], // 删除的id
          smsValidCode: this.phoneValue, // 手机验证码
          googleCode: this.googleValue, // 谷歌验证码
        },
      }).then((data) => {
        this.dialogConfirmLoading = false;
        if (data.code.toString() !== '0') {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.getTableList();
          this.dialogFlag = false;
          this.googleValue = '';
          this.phoneValue = '';
          this.dialogStatus = '';
        }
      });
    },
    // 获取验证码
    getCodeClick() {
      this.sendSmsCode();
    },
    // 发送验证码
    sendSmsCode() {
      const operationType = this.dialogStatus === 'add' ? '11' : '21';
      this.axios({
        url: 'v4/common/smsValidCode',
        params: { operationType },
      }).then((data) => {
        if (data.code.toString() !== '0') {
          setTimeout(() => {
            // 倒计时重置
            this.$bus.$emit('getCode-clear', 'addressGetcode');
            // tip框提示错误
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }, 2000);
        } else {
          // 短信已发送，请注意查收
          this.$bus.$emit('tip', { text: this.$t('assets.addressMent.phoneSendSuccess'), type: 'success' });
        }
      });
    },
    tableClick(type, id) {
      if (type === 'deleteAddress') {
        let even = {};
        this.tableList.forEach((item) => {
          if (item.id === id) {
            even = item;
          }
        });
        this.deleteObj = even;
        this.dialogStatus = 'del';
        this.dialogFlag = true;
      }
    },
    getTableList() {
      this.axios({
        url: 'addr/address_list',
      }).then((data) => {
        if (data.code.toString() === '0') {
          const list = [];
          data.data.addressList.forEach((item) => {
            const { coinList } = this.market;
            const showCoin = getCoinShowName(item.symbol, coinList);
            list.push({
              id: item.id,
              data: [
                showCoin,
                [
                  {
                    type: 'icon', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                    iconSvg: `<svg class="icon icon-14" aria-hidden="true">
                      <use xlink:href="#icon-a_16"></use>
                    </svg>
                    `,
                  },
                  {
                    text: item.address,
                  },
                ],
                item.label,
                [{
                  type: 'button', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                  text: this.$t('assets.addressMent.delete'), // 删除
                  iconClass: [''],
                  eventType: 'deleteAddress',
                }],
              ],
            });
          });
          this.tabelLoading = false;
          this.tableList = list;
        }
      });
    },
  },
};
