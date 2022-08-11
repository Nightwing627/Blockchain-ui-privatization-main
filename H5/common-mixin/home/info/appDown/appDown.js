import {
  fixUrl,
} from '@/utils';

export default {
  name: 'home-appDown',
  data() {
    return {
      cloe: true, // 是否下载展示浮层
      downData: {},
      iphone: false, // 是否为iphone
      android: false, // 是否为安卓
      wechat: false, // 是否为微信
      mask: false, // 微信弹窗
      kycFlag: false,
      kycTitle: '',
      kycMess: '',
      kycGET: true,
    };
  },
  computed: {
    isApp() {
      return this.$store.state.baseData.isApp;
    },
  },
  methods: {
    init() {
      this.down();
      this.getdown();
      this.kyc();
    },
    kycClose() {
      this.kycFlag = false;
    },
    kyc() {
      if (!this.kycGET) return;
      this.kycGET = false;
      const authStatus = fixUrl('resultSatus');
      if (authStatus) {
        switch (authStatus.toString()) {
          case '1':
            // 认证失败
            this.kycTitle = this.$t('kyc.error');
            // 无法达到认证要求，请返回个人中心重新提交实名申请
            this.kycMess = this.$t('kyc.text1');
            break;
          case '2':
            // 认证失败
            this.kycTitle = this.$t('kyc.error');
            // 账号已经通过实名认证，不能再提交实名申请。
            this.kycMess = this.$t('kyc.text2');
            break;
          case '3':
            // 认证失败
            this.kycTitle = this.$t('kyc.error');
            // 实名信息已绑定，不能重复提交申请。
            this.kycMess = this.$t('kyc.text3');
            break;
          default:
            // 认证成功
            this.kycTitle = this.$t('kyc.success');
            // 您的实名信息已通过审核。
            this.kycMess = this.$t('kyc.text4');
        }
        this.kycFlag = true;
      }
    },
    junp(e) {
      e.preventDefault();
      if (this.iphone) {
        this.$router.push('/appDownload');
      } else {
        const tag = this.$refs.downBtn.querySelector('a');
        tag.click();
      }
    },
    getdown() {
      this.axios({
        url: 'common/app_download',
        headers: {},
        params: {},
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          this.downData = data.data;
        }
      });
    },
    Close() {
      this.cloe = false;
    },
    down() {
      const ua = navigator.userAgent.toLowerCase();
      if (/micromessenger/.test(ua)) {
        this.wechat = true;
      } else if (/iphone|ipad|ipod/.test(ua)) {
        this.iphone = true;
      } else if (/android/.test(ua)) {
        this.android = true;
      }
    },
    we() {
      this.mask = true;
    },
  },
};
