
import { imgMap, colorMap } from '@/utils';

export default {
  data() {
    return {
      imgMap,
      colorMap,
      delFlag: false,
      confirmLoading: false,
      tabelLoading: true,
      dialogConfirmLoading: false, // 弹窗按钮确认loading状态
      tableList: [],
      dialogStatus: '', // 弹窗状态 add 为增加 del 为删除
      deleteObj: {}, // 删除的地址 对象
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      bankObj: {},
      delId: '',
    };
  },
  computed: {
    paginationObjCurrentPage() { return this.paginationObj.currentPage; },
    enforceGoogleAuth() {
      return this.$store.state.baseData.is_enforce_google_auth || 0;
    },
    // 表格title
    columns() {
      return [
        { title: this.$t('assets.addressMent.listCoin'), width: '15%' }, // 币种
        { title: this.$t('assets.b2c.payType'), width: '15%' }, // 支付方式
        { title: this.$t('assets.b2c.address'), width: '20%' }, // 账户
        { title: this.$t('assets.b2c.addressUserName'), width: '20%' }, // 收款人
        { title: this.$t('assets.addressMent.listOptions'), width: '30%' }, // 操作
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
    paginationObjCurrentPage() { this.getTableList(); },
  },
  methods: {
    init() {
      // 如果没有 finance/account_balance 接口返回成功的数据
      if (this.$route.query.symbol) {
        this.symbol = this.$route.query.symbol.toUpperCase();
      } else {
        this.$router.push('/assets/b2cAccount');
        return;
      }
      this.getBankList();
    },
    delClose() {
      this.delFlag = false;
    },
    delConfirm() {
      this.confirmLoading = true;
      this.axios({
        url: '/user/bank/delete',
        params: {
          id: this.delId,
        },
      }).then((data) => {
        this.confirmLoading = false;
        if (data.code.toString() === '0') {
          this.paginationObj.currentPage = 1;
          this.getTableList();
          this.delFlag = false;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    getBankList() {
      this.axios({
        url: '/bank/all',
        params: {
          symbol: this.symbol,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          const obj = {};
          data.data.forEach((item) => {
            obj[item.bankNo.toString()] = item.accountName;
          });
          this.bankObj = obj;
          this.getTableList();
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    pagechange(v) {
      this.paginationObj.currentPage = v;
    },
    addressBtnClick() {
      this.$router.push(`/assets/b2cAdd?symbol=${this.symbol}&type=add`);
    },
    tableClick(type, id) {
      if (type === 'del') {
        this.delId = id;
        this.delFlag = true;
        // let even = {};
        // this.tableList.forEach((item) => {
        //   if (item.id === id) {
        //     even = item;
        //   }
        // });
        // this.deleteObj = even;
        // this.dialogStatus = 'del';
      }
      if (type === 'set') {
        this.$router.push(`/assets/b2cAdd?symbol=${this.symbol}&type=set&id=${id}`);
      }
    },
    getTableList() {
      this.axios({
        url: 'user/bank/user_bank_list',
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          symbol: this.symbol,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          const list = [];
          data.data.list.forEach((item) => {
            list.push({
              id: item.id,
              data: [
                item.symbol,
                this.$t('assets.b2c.bankCard'), // '银行卡',
                this.bankObj[item.bankNo],
                item.name,
                [
                  // 编辑
                  {
                    type: 'button', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                    text: this.$t('assets.b2c.set'), // 编辑
                    iconClass: [''],
                    eventType: 'set',
                  },
                  {
                    type: 'button', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                    text: this.$t('assets.addressMent.delete'), // 删除
                    iconClass: [''],
                    eventType: 'del',
                  },
                ],
              ],
            });
          });
          this.tabelLoading = false;
          this.tableList = list;
          this.paginationObj.total = data.data.count;
        }
      });
    },
  },
};
