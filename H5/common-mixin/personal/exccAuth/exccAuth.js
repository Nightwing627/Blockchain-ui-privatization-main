import { imgMap, myStorage, callApp } from '@/utils';
import exccAuthType1s from '@/assets/images/1/exccAuthType1.png';
import exccAuthType2s from '@/assets/images/1/exccAuthType2.png';

const { exccAuthType1, exccAuthType2 } = imgMap;

export default {
  name: 'kycAuth',
  data() {
    return {
      query: '',
      imgExccAuthType1: exccAuthType1 || exccAuthType1s,
      imgExccAuthType2: exccAuthType2 || exccAuthType2s,
      exccAuthType: '1',
      loading: false,
      authType: '1',
      verfyTemplet: '',
      openSingPass: '',
      ageLimit: null,
      SingPassConfig: {},
      state: 'KYC_AUTH',
      kycflag: false,
    };
  },
  watch: {
    exccKycConfig(exccKycConfig) {
      if (exccKycConfig !== null && this.kycflag) {
        if (exccKycConfig.text === 'success') {
          let fromPath = 'idAuth';
          if (exccKycConfig.data.openSingPass === '0') {
            if (exccKycConfig.data.verfyTemplet === '2') {
              fromPath = 'exccAuthForm';
            }
            const { country, countryKeyCode } = this.$route.query;
            this.kycflag = false;
            this.$router.push(`/personal/${fromPath}?country=${country}&countryKeyCode=${countryKeyCode}&ua=${this.androidtext}`);
          }
        } else {
          this.$bus.$emit('tip', { text: exccKycConfig.msg, type: 'error' });
          this.$store.dispatch('resetType');
        }
      }
    },
  },
  computed: {
    isAndroid() {
      if (this.$route.query && this.$route.query.ua) {
        return (this.$route.query.ua === 'android');
      }
      return false;
    },
    androidtext() {
      return this.$route.query.ua;
    },
    exccKycConfig() {
      return this.$store.state.personal.exccKycConfig || {};
    },
    redirect_uri() {
      return `${window.location.origin}/personal/kycAuth`;
    },
    isApp() {
      return this.$store.state.baseData.isApp;
    },
  },
  methods: {
    init() {
      this.query = this.$route.query;
      if (this.$route.query.state === this.state && this.$route.query.code) {
        this.$router.push(`/personal/exccAuthorization?code=${this.$route.query.code}`);
      }
      if (this.$route.query.state === this.state && this.$route.query.error) {
        if (this.isApp) {
          callApp({
            name: 'exchangeRouter',
            params: { routerName: 'singpasscancel' },
          });
        } else {
          this.$router.push(`/personal/userManagement?kycError=${this.$route.query.error}&state=${this.state}`);
        }
      }
    },
    mountedInit() {
      if (!this.exccKycConfig || !this.exccKycConfig.text) {
        this.kycflag = true;
        this.$store.dispatch('exccKycConfig');
      }
    },
    callAuthoriseApi() {
      const { SingPassConfig } = this.exccKycConfig ? this.exccKycConfig.data : null;
      if (SingPassConfig && SingPassConfig.url) {
        // const purpose = JSON.stringify(new Date().getTime());
        const authoriseUrl = `${SingPassConfig.url}?client_id=${SingPassConfig.clientId}&attributes=${SingPassConfig.attributes}&purpose=${SingPassConfig.purpose}&state=${this.state}&redirect_uri=${SingPassConfig.returnUrl}`;
        myStorage.set('authoriseUrl', authoriseUrl);
        if (this.isApp) {
          window.location.href = authoriseUrl;
        } else {
          window.open(authoriseUrl);
        }
      } else {
        this.$bus.$emit('tip', { text: '接口异常，请联系管理员', type: 'error' });
      }
    },
    clickSlectType(id) {
      this.exccAuthType = id;
    },
    confirmAuthType() {
      this.loading = true;
      if (this.exccAuthType === '1') {
        let fromPath = 'idAuth';
        if (this.isApp && this.exccKycConfig && this.exccKycConfig.data.verfyTemplet === '1') {
          callApp({
            name: 'exchangeRouter',
            params: { routerName: 'choosekycfirst' },
          });
        } else {
          if (this.exccKycConfig && this.exccKycConfig.data.verfyTemplet === '2') {
            fromPath = 'exccAuthForm';
          }
          const { country, countryKeyCode } = this.$route.query;
          this.$router.push(`/personal/${fromPath}?country=${country}&countryKeyCode=${countryKeyCode}&ua=${this.androidtext}`);
        }
      } else {
        this.callAuthoriseApi();
      }
    },
  },
};
