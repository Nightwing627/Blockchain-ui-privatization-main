// @ is an alias to /src
import { imgMap } from '@/utils';
import exccAuthType1s from '@/assets/images/1/exccAuthType1.png';
import exccAuthType2s from '@/assets/images/1/exccAuthType2.png';

const imgExccAuthType1 = imgMap.exccAuthType1;
const imgExccAuthType2 = imgMap.exccAuthType2;

export default {
  name: 'kycAuthselect',
  props: {
    countryVal: { default: '', type: String },
    countryKeyCodeVal: { default: '', type: String },
  },
  data() {
    return {
      kycLoading: false,
      imgExccAuthType1: imgExccAuthType1 || exccAuthType1s,
      imgExccAuthType2: imgExccAuthType2 || exccAuthType2s,
      kycExccFlag: false,
      exccAuthType: '1',
      state: 'KYC_AUTH',
    };
  },
  watch: {
    exccKycConfig(exccKycConfig) {
      if (exccKycConfig && exccKycConfig.text) {
        this.kycLoading = false;
        if (exccKycConfig.text === 'success') {
          let fromPath = 'idAuth';
          if (exccKycConfig.data) {
            if (exccKycConfig.data.openSingPass === '0') {
              if (exccKycConfig.data.verfyTemplet === '2') {
                fromPath = 'exccAuthForm';
              }
              this.$router.push(`/personal/${fromPath}?country=${this.countryVal}&countryKeyCode=${this.countryKeyCodeVal}`);
            } else {
              this.kycExccFlag = true;
            }
          }
        } else {
          this.$bus.$emit('tip', { text: exccKycConfig.msg, type: 'error' });
          this.$store.dispatch('resetType');
        }
      }
    },
  },
  computed: {
    exccKycConfig() {
      return this.$store.state.personal.exccKycConfig;
    },
  },
  methods: {

    init() {
      const pathsArr = this.$route.path.split('/');
      const paths = pathsArr[pathsArr.length - 1];
      this.query = this.$route.query;
      if (this.$route.query.state === this.state && this.$route.query.code) {
        this.$router.push(`/personal/exccAuthorization?code=${this.$route.query.code}`);
      } else if (this.$route.query.state === this.state && this.$route.query.error) {
        this.$bus.$emit('tip', { text: this.$t('personal.exccAuth.errorText1'), type: 'error' });
        this.$router.push(`/personal/userManagement?kycError=${this.$route.query.error}&state=${this.state}`);
      } else if (!this.countryVal && !this.countryKeyCodeVal && paths === 'kycAuth') {
        this.$router.push('/personal/userManagement');
      }
    },
    kycExccClose() {
      this.kycExccFlag = false;
    },
    callAuthoriseApi() {
      const { SingPassConfig } = this.exccKycConfig ? this.exccKycConfig.data : null;
      if (SingPassConfig && SingPassConfig.url) {
        // const purpose = JSON.stringify(new Date().getTime());
        const authoriseUrl = `${SingPassConfig.url}?client_id=${SingPassConfig.clientId}&attributes=${SingPassConfig.attributes}&purpose=${SingPassConfig.purpose}&state=${this.state}&redirect_uri=${SingPassConfig.returnUrl}`;
        window.open(authoriseUrl);
      } else {
        this.$bus.$emit('tip', { text: '接口异常，请联系管理员', type: 'error' });
      }
    },
    kycExccConfirm() {
      if (this.exccAuthType === '1') {
        let fromPath = 'idAuth';
        if (this.exccKycConfig && this.exccKycConfig.data && this.exccKycConfig.data.verfyTemplet === '2') {
          fromPath = 'exccAuthForm';
        }
        this.$router.push(`/personal/${fromPath}?country=${this.countryVal}&countryKeyCode=${this.countryKeyCodeVal}`);
      } else {
        this.callAuthoriseApi();
      }
    },
    clickSlectType(id) {
      this.exccAuthType = id;
    },
  },
};
