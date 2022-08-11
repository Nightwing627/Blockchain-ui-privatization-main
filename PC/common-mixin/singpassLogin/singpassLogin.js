import {
  imgMap,
  setCookie,
  getScript,
} from '@/utils';

export default {
  name: 'singPassLogin',
  data() {
    return {
      ko64: imgMap.ko6_4,
      dialogFlag: false,
      dialogConfirmLoading: false,
      dialogConfirmDisabled: false,
      dialoghaveOption: false,
      assDialogFlag: false,
      assDialogConfirmLoading: false,
      assDialogConfirmDisabled: false,
      isShowRefresh: false,
      sTime: 0,
      setInterval: null,
      clientId: 'ECXX',
      clientCodeRequestUrl: null,
      redirectUri: null,
    };
  },
  props: {
    isShow: {
      default: true,
      type: Boolean,
    },
  },
  watch: {
    // isShow() {
    //   // this.dialogFlag = val;
    //   // if (val) {
    //   //   this.initSingPass();
    //   // }
    // },
    thirdPartyLoginData(data) {
      if (data !== null) {
        if (data.text === 'success') {
          this.dialogFlag = true;
          this.clientId = data.data.client_id;
          this.clientCodeRequestUrl = data.data.client_code_request_url;
          this.redirectUri = data.data.redirect_uri;
          this.initSingPass();
        }
      }
    },
  },
  computed: {
    titleText() {
      return this.$t('singPassLogin.mainText2'); // 'SingPass第三方登录';
    },
    singPassCode() {
      return this.$route.query.code;
    },
    singpassState() {
      return this.$route.query.state;
    },
    singpassSource() {
      return this.$route.query.source;
    },
    // 获取二维码的信息
    thirdPartyLoginData() {
      return this.$store.state.baseData.thirdPartyLoginData;
    },
    // 当前域名
    domainName() {
      return window.location.origin;
    },
  },
  methods: {
    init() {
      getScript('../../static/js/jquery-3.3.1.min.js').then(() => {
        getScript('https://saml.singpass.gov.sg/spcpextrest/resources/js/spcp-pvt-qr-v1.0.0.js').then(() => {

        });
      });
      if (this.singPassCode && this.singpassState && !this.singpassSource) {
        this.singPassRelation();
      }
    },
    // 查询 授权用户与平台用户是都关联
    singPassRelation() {
      this.axios({
        url: 'thirdPartLogin/singPassRelation',
        method: 'post',
        header: {},
        params: {
          singPassCode: this.singPassCode,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          // 已存在关联 登录成功
          if (data.data.exitSingPass === 1) {
            setCookie('token', data.data.token); // 存储cookie
            // 登录成功
            this.$bus.$emit('tip', { text: this.$t('login.loginSuccess'), type: 'success' });
            // 获取 userinfo
            this.$store.dispatch('getUserInfo');
            this.getMySymbol();
            this.$router.push('/');
          } else {
            // 不存在关联
            this.singPassCode = data.data.singPassCode;
            this.assDialogFlag = true;
          }
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      }).catch(() => {
      });
    },
    refreshHandler() {
      window.SPCPQR.refresh();
      this.isShowRefresh = false;
      this.setsTime();
    },
    initSingPass() {
      this.sTime = 0;
      this.isShowRefresh = false;
      setTimeout(() => {
        window.SPCPQR.init('qr_wrapper', {
          state: new Date().getTime(),
          nonce: new Date().getTime(),
          clientId: this.clientId,
          responseType: 'code',
          redirectUri: `${this.redirectUri}`,
          scope: 'openid',
        }, this.refreshHandler);
        this.setsTime();
      });
    },
    accountLogin() {
      const state = new Date().getTime();
      const nonce = new Date().getTime();
      const { clientId } = this;
      const responseType = 'code';
      // const redirectUri = `${this.domainName}/${this.redirectUri}`;
      // const redirectUri = 'http://rd3www.chaindown.com/zh_CN/login';
      const scope = 'openid';
      const url = `${this.clientCodeRequestUrl}?response_type=${responseType}&scope=${scope}&client_id=${clientId}&nonce=${nonce}&state=${state}&redirect_uri=${this.redirectUri}`;
      window.open(url);
    },
    goDow() {
      window.open('https://singpassmobile.sg/');
    },
    dialogClose() {
      this.dialogFlag = false;
    },
    dialogClosetwo() {
      this.assDialogFlag = false;
      this.$router.push('login');
    },
    dialogConfirm() {
    },
    assDialogConfirm() {
    },
    setsTime() {
      clearInterval(this.setInterval);
      this.sTime = 0;
      this.setInterval = setInterval(() => {
        this.sTime += 1;
        if (this.sTime >= 120) {
          this.isShowRefresh = true;
          clearInterval(this.setInterval);
        }
      }, 1000);
    },
    singPassLogin(val) {
      this.assDialogFlag = false;
      // 跳转注册
      if (val === 1) {
        this.$router.push(`register?singPassCode=${this.singPassCode}&singPassState=${this.singpassState}`);
      } else {
        this.$bus.$emit('setLoginMode', 'SingPass');
      }
    },
  },
};
