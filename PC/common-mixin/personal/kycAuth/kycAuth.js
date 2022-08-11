export default {
  name: 'common-keyAuth',
  data() {
    return {
      loading: true, // 页面loading
      qrCode: '', // 二维码
      time: 0, // 倒计时
      timeReload: false,
      statusLoading: false, // 认证状态的loading
      forceAuto: false, // 是否强制审核
      goIDauthLoading: false, // 选择人工的loading
    };
  },
  computed: {
    publicInfo() { return this.$store.state.baseData.publicInfo; },
    showTime() {
      if (this.time) {
        const min = Math.floor(this.time / 60);
        const sec = this.time - 60 * min;
        let str = '';
        if (min) {
          str += `${min}${this.$t('personal.kyc.kycMin')}`;
        }
        str += `${sec}${this.$t('personal.kyc.kycSec')}`;
        return str;
      }
      return '';
    },
  },
  methods: {
    init() {
      this.getData();
    },
    // 获取页面信息
    getData() {
      this.axios({
        url: '/kyc/Api/get_Valid_QRcode',
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.loading = false;
          this.setData(data.data);
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 选择人工
    goIDauth() {
      if (this.goIDauthLoading) return;
      this.goIDauthLoading = true;
      // 判断开关是否开启
      const customConfigData = this.publicInfo.custom_config;
      let kycSingaporeOpen = null;
      let customConfig = null;
      if (customConfigData) {
        try {
          customConfig = JSON.parse(customConfigData);
        } catch (error) {
          console.log(error);
        }
        kycSingaporeOpen = customConfig ? customConfig.kyc_singapore_open : null;
      }
      this.axios({
        url: '/kyc/Api/get_Valid_QRcode',
      }).then((data) => {
        this.goIDauthLoading = false;
        if (data.code.toString() === '0') {
          // 需求5.2.2 否，则跳转至账号管理界面，界面右上角显示提示语提示：“已存在实名认证信息”。
          if (data.data.authStatus === '1') {
            this.$bus.$emit('tip', { text: this.$t('personal.kyc.kycAuth7'), type: 'warning' });
            this.$router.push('/personal/userManagement');
          // 需求5.2.1 是，则跳转至实名认证页_中国界面进行人工审核模式提交实名认证
          } else if (kycSingaporeOpen && kycSingaporeOpen !== '0') {
            this.$store.dispatch('exccKycConfig', {});
          } else {
            this.$router.push('/personal/idAuth?kycPhone=86');
          }
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 获取当前认证结果
    getStatus() {
      this.statusLoading = true;
      this.axios({
        url: '/kyc/Api/get_Database_Authentication_result',
      }).then((data) => {
        this.statusLoading = false;
        if (data.code.toString() === '0') {
          const { authStatus } = data.data;
          // 需求4.2.1 存在，则跳转至该用户的账号管理界面，提示语提示：“已存在实名认证信息”。
          if (authStatus && authStatus.toString() === '1') {
            this.$bus.$emit('tip', { text: this.$t('personal.kyc.kycAuth7'), type: 'warning' });
            this.$router.push('/personal/userManagement');
          // 需求4.2.2 不存在，则停留在当前界面，提示语提示：“请扫描二维码完成认证”
          } else {
            this.$bus.$emit('tip', { text: this.$t('personal.kyc.kycAuth8'), type: 'warning' });
          }
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    setData({
      openAuto, limitFlag, authStatus, qrCode, validSecond, forceAuto,
    }) {
      // 需求3.1.1 如果未开启自动审核 则跳转到人工审核
      // 需求3.4.1 当日平台、个人超出当日自动审核限制 则跳转到人工审核
      if ((openAuto && openAuto.toString() === '0')
        || (limitFlag && limitFlag.toString() === '1')) {
        this.$bus.$emit('tip', { text: this.$t('personal.kyc.kycAuth9'), type: 'warning' });
        // this.$router.push('/personal/idAuth?kycPhone=86');
        this.$store.dispatch('exccKycConfig', {});
        return;
      }
      // 需求3.2.1 判断该用户存在未审核或已通过的实名信息 则跳转到账号管理
      if (authStatus && authStatus.toString() === '1') {
        this.$bus.$emit('tip', { text: this.$t('personal.kyc.kycAuth7'), type: 'warning' });
        this.$router.push('/personal/userManagement');
        return;
      }
      // 需求5.1 本段文只有在后台配置了非强制自动审核时才会显示
      if (forceAuto && forceAuto.toString() === '0') {
        this.forceAuto = true;
      }
      // 需求1 展示二维码
      this.qrCode = qrCode;
      // 需求2 倒计时
      if (validSecond) {
        // 需求2.1 有效时长根据数据库存储的该用户的token过期时间计算，文案需倒数动态显示
        let timer = null;
        this.time = validSecond;
        timer = setInterval(() => {
          this.time -= 1;
          if (this.time === 0) {
            clearInterval(timer);
            // 需求2.2 倒计时结束后，文案变为红色字体提示：“二维码已过期，请刷新页面重新获取”
            this.timeReload = true;
          }
        }, 1000);
      }
    },
  },
};
