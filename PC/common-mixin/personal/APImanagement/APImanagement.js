import { imgMap, colorMap } from '@/utils';

export default {
  name: 'apiManagement',
  watch: {
    userInfo(userInfo) {
      if (userInfo !== null) {
        this.googleCode = !!Number(userInfo.googleStatus);
        this.smsCode = !!Number(userInfo.isOpenMobileCheck);
      }
    },
    sendSmsCode(sendSmsCode) {
      if (sendSmsCode !== null) {
        if (sendSmsCode.text === 'success') {
          this.$bus.$emit('tip', { text: sendSmsCode.msg, type: 'success' });
          this.$store.dispatch('resetType');
        } else {
          this.$bus.$emit('getCode-clear', 'phone');
          this.$bus.$emit('tip', { text: sendSmsCode.msg, type: 'error' });
          this.$store.dispatch('resetType');
        }
      }
    },
    createOpenApi(createOpenApi) {
      if (createOpenApi !== null) {
        this.loading2 = false;
        if (createOpenApi.text === 'success') {
          this.$bus.$emit('tip', { text: createOpenApi.msg, type: 'success' });
          this.$store.dispatch('resetType');
          this.dialogConfirm();
          // 再次获取apilist
          const info = { page: this.page, pageSize: this.pageSize };
          this.$store.dispatch('myApiList', info);
        } else {
          this.$bus.$emit('tip', { text: createOpenApi.msg, type: 'error' });
          this.$store.dispatch('resetType');
        }
      }
    },
    myApiList(myApiList) {
      if (myApiList !== null) {
        this.loading = false;
        this.processData(myApiList.apiList);
        if (myApiList.count > 10) {
          this.count = myApiList.count;
        } else if (myApiList.count === 0) {
          this.apiList = [];
        }
      }
    },
    deleteOpenApi(deleteOpenApi) {
      if (deleteOpenApi !== null) {
        this.delete = true;
        if (deleteOpenApi.text === 'success') {
          this.$bus.$emit('tip', { text: deleteOpenApi.msg, type: 'success' });
          this.$store.dispatch('resetType');
          // 重新请求apilist
          const info = { page: this.page, pageSize: this.pageSize };
          this.$store.dispatch('myApiList', info);
        } else {
          this.$bus.$emit('tip', { text: deleteOpenApi.msg, type: 'error' });
          this.$store.dispatch('resetType');
        }
      }
    },
  },
  computed: {
    modifyApiShow() {
      return this.$store.state.personal.modifyApiShow;
    },
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    sendSmsCode() {
      return this.$store.state.personal.sendSmsCode;
    },
    createOpenApi() {
      return this.$store.state.personal.createOpenApi;
    },
    myApiList() {
      return this.$store.state.personal.myApiList;
    },
    deleteOpenApi() {
      return this.$store.state.personal.deleteOpenApi;
    },
    api() {
      return imgMap.api;
    },
    apiUrl() {
      const data = {
        2: '',
        3: '',
      };
      try {
        const url = this.$store.state.baseData.publicInfo.url.exUrl;
        const nUrls = url.match(/(.+)\/\/(.+)?\/?/i);
        const protocol = nUrls[1];
        const nUrl = nUrls[2];
        data[2] = `(${protocol.indexOf('s') > -1 ? 'wss' : 'ws'}://${nUrl.replace(nUrl.substring(0, nUrl.indexOf('.')), 'ws')})`;
        data[3] = `(${protocol}//${nUrl.replace(nUrl.substring(0, nUrl.indexOf('.')), 'openapi')})`;
      } catch (e) {
        // console.log(e)
      }
      return data;
    },
  },
  data() {
    return {
      titleText: this.$t('personal.APImanagement.titleText'),
      loading: true,
      loading2: false,
      imgMap,
      colorMap,
      alertFlag: false,
      // Table
      columns: [
        {
          title: this.$t('personal.APImanagement.columns')[0],
          align: 'left',
          width: '200px',
          classes: '',
        },
        {
          title: this.$t('personal.APImanagement.columns')[1],
          align: 'left',
          width: '200px',
        },
        {
          title: this.$t('personal.APImanagement.columns')[2],
          align: 'right',
          width: '',
        },
        {
          title: this.$t('personal.APImanagement.columns')[3],
          align: 'right',
          width: '',
        },
        {
          title: this.$t('personal.APImanagement.columns')[4],
          align: 'right',
          width: '',
        },
      ],
      columns2: [
        {
          title: `${this.$t('personal.APImanagement.columnsApi')[0]} 111111`,
          align: 'left',
          width: '470px',
          classes: '',
        },
        {
          title: this.$t('personal.APImanagement.columnsApi')[1],
          align: 'left',
          width: '470px',
        },
      ],
      apiList: [],
      apiList2: [
        {
          data: [
            '/open/api/get_records',
            this.$t('personal.APImanagement.apiList')[0],
          ],
        },
        {
          data: [
            '/open/api/get_ticker',
            this.$t('personal.APImanagement.apiList')[1],
          ],
        },
        {
          data: [
            '/open/api/get_trades',
            this.$t('personal.APImanagement.apiList')[2],
          ],
        },
        {
          data: [
            '/open/api/market_dept',
            this.$t('personal.APImanagement.apiList')[3],
          ],
        },
      ],
      apiList3: [
        {
          data: [
            '/open/api/all_order',
            this.$t('personal.APImanagement.apiList')[4],
          ],
        },
        {
          data: [
            '/open/api/all_trade',
            this.$t('personal.APImanagement.apiList')[5],
          ],
        },
        {
          data: [
            '/open/api/cancel_order',
            this.$t('personal.APImanagement.apiList')[6],
          ],
        },
        {
          data: [
            '/open/api/common/symbols',
            this.$t('personal.APImanagement.apiList')[7],
          ],
        },
        {
          data: [
            '/open/api/create_order',
            this.$t('personal.APImanagement.apiList')[8],
          ],
        },
        {
          data: [
            '/open/api/market',
            this.$t('personal.APImanagement.apiList')[9],
          ],
        },
        {
          data: [
            '/open/api/new_order',
            this.$t('personal.APImanagement.apiList')[10],
          ],
        },
        {
          data: [
            '/open/api/order_info',
            this.$t('personal.APImanagement.apiList')[11],
          ],
        },
        {
          data: [
            '/open/api/user/account',
            this.$t('personal.APImanagement.apiList')[12],
          ],
        },
      ],
      cellHeight: 55,
      headHeight: 30,
      lineNumber: 10,
      classes: '',
      headClasses: '',
      bodyClasses: '',
      lineClass: '',
      count: 0,
      page: 1,
      pageSize: 10,
      secretKey: '',
      apiKey: '',
      // 弹框相关
      dialogFlag: false,
      dialogConfirmLoading: false,
      dialogConfirmDisabled: false,
      // input相关参数
      promptText1: this.$t('personal.APImanagement.ip'),
      errorText1: this.$t('personal.prompt.ipCode'),
      checkErrorFlag1: false,
      checkValue1: '',
      promptText2: this.$t('personal.APImanagement.note'),
      errorText2: this.$t('personal.prompt.noteCode'),
      checkErrorFlag2: false,
      checkValue2: '',
      promptText3: this.$t('personal.label.smsCodeText'),
      errorText3: this.$t('personal.prompt.errorCode'),
      checkErrorFlag3: false,
      checkValue3: '',
      promptText4: this.$t('personal.label.googleCodeText'),
      errorText4: this.$t('personal.prompt.errorCode'),
      checkErrorFlag4: false,
      checkValue4: '',
      // 发送验证码
      autoStart: false,
      // button
      disabled: true,
      // 横向导航参数
      currentTab: 1,
      navTab: [
        {
          name: this.$t('personal.APImanagement.navTab')[0],
          index: 1,
        },
        {
          name: this.$t('personal.APImanagement.navTab')[1],
          index: 2,
        },
        {
          name: this.$t('personal.APImanagement.navTab')[2],
          index: 3,
        },
      ],
      lineHeight: '55',
      marginRight: 48, // 距离右边的距离
      smsCode: false, // false对应0 关闭 true对应1 开启(手机短信认证)
      googleCode: false, // false对应0 关闭 true对应1 开启(google认证)
      delete: true, // 删除按钮的可点击状态
      secretKeyShow: true,
      apiKeyShow: true,
    };
  },
  methods: {
    init() {
      const { userInfo } = this.$store.state.baseData;
      if (userInfo !== null) {
        this.googleCode = !!Number(userInfo.googleStatus);
        this.smsCode = !!Number(userInfo.isOpenMobileCheck);
        if (!this.smsCode && !this.googleCode) {
          this.alertFlag = true;
        } else {
          this.alertFlag = false;
        }
      }
      this.getApiList();
    },
    getApiList() {
      const info = { page: this.page, pageSize: this.pageSize };
      this.$store.dispatch('myApiList', info);
    },
    handMouseenters(name) {
      if (name === 'secretKey') {
        this.secretKeyShow = false;
      } else {
        this.apiKeyShow = false;
      }
    },
    handMouseleaves(name) {
      if (name === 'secretKey') {
        this.secretKeyShow = true;
      } else {
        this.apiKeyShow = true;
      }
    },
    handMouseenter(e) {
      e.target.classList.add('b-4-cl');
      e.target.classList.remove('b-2-cl');
    },
    handMouseleave(e) {
      e.target.classList.add('b-2-cl');
      e.target.classList.remove('b-4-cl');
    },
    alertClose() {
      this.$router.push('/personal/UserManagement');
    },
    alertGo() {
      this.$router.push('/personal/UserManagement');
    },
    codeFlag(val) {
      return this.$store.state.regExp.verification.test(val);
    },
    ipFlag(val) {
      return new RegExp(this.$store.state.regExp.ip, 'g').test(val);
    },
    numbers(val) {
      return this.$store.state.regExp.numbers.test(val);
    },
    pagechange(page) {
      this.page = page;
      const info = { page, pageSize: this.pageSize };
      this.$store.dispatch('myApiList', info);
    },
    processData(list) { // 处理数据
      if (list !== null) {
        this.apiList = list.map((obj) => (
          {
            id: { token: obj.token, ip: obj.believeIps, label: obj.label },
            data: [
              obj.label,
              obj.believeIps,
              obj.token,
              [{
                type: 'button', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                text: this.$t('personal.tool.view'),
                iconClass: [''],
                eventType: 'check',
                classes: [''],
              }],
              [
                {
                  type: 'button', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                  text: this.$t('personal.tool.modify'),
                  iconClass: [''],
                  eventType: 'modify',
                  classes: [''],
                },
                {
                  type: 'button', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                  text: this.$t('personal.tool.delete'),
                  iconClass: [''],
                  eventType: 'delete',
                  classes: [''],
                },
              ],
            ],
          }));
      }
    },
    deleteData(type, obj) {
      // const info = obj.token;
      switch (type) {
        case 'delete':
          if (this.delete) {
            this.$store.dispatch('deleteOpenApi', { token: obj.token });
            this.delete = false;
          }
          break;
        case 'check':
          this.$store.dispatch('setApiToken', obj.token);
          this.$router.push('/personal/checkApi');
          break;
        case 'modify':
          this.$store.dispatch('setApiToken', obj.token);
          this.$store.dispatch('setIp', obj.ip);
          this.$store.dispatch('setLabel', obj.label);
          this.$store.dispatch('setModifyApiShow', true);
          break;
        default:
      }
    },
    copyClick(name) { // 粘贴
      if (name === 'apiKey') {
        this.copy(this.apiKey);
      } else {
        this.copy(this.secretKey);
      }
    },
    copy(str) {
      // this.$bus.$emit('tip', { text: this.$t('personal.prompt.copySucces'), type: 'success' });
      function save(e) {
        e.clipboardData.setData('text/plain', str); // 下面会说到clipboardData对象
        e.preventDefault(); // 阻止默认行为
      }
      document.addEventListener('copy', save);
      document.execCommand('copy'); // 使文档处于可编辑状态，否则无效
      document.removeEventListener('copy', save);
    },
    dialogClose() { // 关闭或取消时
      this.dialogConfirmFlag = false;
      this.dialogFlag = false;
      this.checkValue = this.oldName;
      // 重置所有项
      this.checkValue1 = '';
      this.checkValue2 = '';
      this.checkValue3 = '';
      this.checkValue4 = '';
      this.disabled = true;
      this.$bus.$emit('getCode-clear', 'phone');
    },
    dialogConfirm() {
      this.dialogConfirmFlag = false;
      this.dialogFlag = false;
      this.checkValue = this.oldName;
      // 重置所有项
      this.checkValue1 = '';
      this.checkValue2 = '';
      this.checkValue3 = '';
      this.checkValue4 = '';
      this.disabled = true;
      this.$bus.$emit('getCode-clear', 'phone');
    },
    currentType(data) {
      this.columns2 = [
        {
          title: `${this.$t('personal.APImanagement.columnsApi')[0]} ${this.apiUrl[data.index]}`,
          align: 'left',
          width: '470px',
          classes: '',
        },
        {
          title: this.$t('personal.APImanagement.columnsApi')[1],
          align: 'left',
          width: '470px',
        },
      ];
      this.currentTab = data.index;
    },
    dealIp(value) {
      let a = true;
      if (value.indexOf(',') !== -1) {
        if (value.charAt(value.length - 1) === ',') { // 如果最后一位是,删除最后一位再进行处理
          const attr = value.substring(0, value.length - 1).split(',');
          const len = attr.length;
          if (len <= 5) {
            attr.forEach((obj) => {
              if (this.ipFlag(obj)) {
                a = true;
              } else {
                a = false;
              }
            });
          } else {
            a = false;
          }
        } else { // 否则正常处理
          const attr = value.split(',');
          const len = attr.length;
          if (len <= 5) {
            attr.forEach((obj) => {
              if (this.ipFlag(obj)) {
                a = true;
              } else {
                a = false;
              }
            });
          } else {
            a = false;
          }
        }
      } else {
        a = this.ipFlag(value);
      }
      return a;
    },
    inputChanges(val, name) {
      switch (name) {
        case 'ip':
          this.checkValue1 = val;
          if (val) {
            if (this.dealIp(val)) {
              this.checkErrorFlag1 = false;
            } else {
              this.checkErrorFlag1 = true;
            }
          } else {
            this.checkErrorFlag1 = false;
          }
          break;
        case 'note':
          this.checkValue2 = val;
          if (this.checkValue2) {
            this.checkErrorFlag2 = false;
          } else {
            this.checkErrorFlag2 = true;
          }
          break;
        case 'phoneCode':
          this.checkValue3 = val;
          if (this.codeFlag(val)) {
            this.checkErrorFlag3 = false;
          } else {
            this.checkErrorFlag3 = true;
          }
          break;
        default:
          this.checkValue4 = val;
          if (this.codeFlag(val)) {
            this.checkErrorFlag4 = false;
          } else {
            this.checkErrorFlag4 = true;
          }
      }
      if (this.checkValue2 && !this.checkErrorFlag3 && !this.checkErrorFlag4
        && !this.checkErrorFlag1 && !this.checkErrorFlag2) {
        if (this.smsCode) {
          this.disabled = !this.checkValue3;
        }
        if (this.googleCode) {
          this.disabled = !this.checkValue4;
        }
        if (this.smsCode && this.googleCode) {
          this.disabled = !(this.checkValue3 && this.checkValue4);
        }
      } else {
        this.disabled = true;
      }
    },
    getCodeClick() {
      this.$bus.$emit('getCode-start', 'phone');
      const info = { operationType: 16 };
      this.$store.dispatch('sendSmsCode', info);
    },
    btnLink() {
      this.loading2 = true;
      const info = {
        believeIps: this.checkValue1,
        label: this.checkValue2,
        smsValidCode: this.checkValue3,
        googleCode: this.checkValue4,
      };
      this.$store.dispatch('createOpenApi', info);
    },
  },
};
