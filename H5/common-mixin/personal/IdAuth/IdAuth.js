import { imgMap } from '@/utils';
import countryMinix from '../../../../PC/common-mixin/countryList/countryList';

const upload1 = imgMap.kyc_idcard_a;
const upload2 = imgMap.kyc_idcard_b;
const upload3 = imgMap.kyc_idcard_c;
const upload4 = imgMap.kyc_passport_a;
const upload5 = imgMap.kyc_passport_b;
const upload6 = imgMap.kyc_passport_c;

export default {
  name: 'bindEmail',
  mixins: [countryMinix],
  watch: {
    country: {
      handler(val) {
        if (val) {
          if (val !== '+156') {
            this.certificateType = 2; // 证件类型
            this.certificateTypeList = [
              {
                value: this.$t('personal.label.passport'),
                code: 2,
              },
            ];
          } else {
            this.certificateType = 1; // 证件类型
            this.certificateTypeList = [
              {
                value: this.$t('personal.label.idCard'),
                code: 1,
              },
            ];
          }
        }
      },
      immediate: true,
    },
    iskrwOpen(v) {
      if (v) {
        this.checkValue1 = this.userInfo.phone_auth_birthday;
        this.checkValue2 = this.userInfo.phone_auth_name;
      }
    },
    authRealname(authRealname) {
      if (authRealname !== null) {
        this.loading = false;
        if (authRealname.text === 'success') {
          this.$bus.$emit('tip', { text: authRealname.msg, type: 'success' });
          this.active = '3';
          this.$store.dispatch('resetType');
        } else {
          this.$bus.$emit('tip', { text: authRealname.msg, type: 'error' });
          this.firstPhotoImg = '';
          this.secondPhotoImg = '';
          this.thirdPhotoImg = '';
          this.firstPhotoLoading = false;
          this.secondPhotoLoading = false;
          this.thirdPhotoLoading = false;
          this.checkValue1 = '';
          this.checkValue2 = '';
          this.disabled2 = true;
          this.active = '1';
          this.firstPhoto = '';
          this.secondPhoto = '';
          this.thirdPhoto = '';
          this.uploadName = '';
          this.$store.dispatch('resetType');
        }
      }
    },
    coinsKrwOpen(v) {
      if (v === '1') { this.initCertificateType(); }
    },
    krwPhoneAuth() {
      if (this.coinsKrwOpen === '1') { this.initCertificateType(); }
    },
    userInfo(v) {
      if (v) {
        this.authLevel = this.userInfo.authLevel;
        if (this.authLevel === 2 || this.authLevel === 3) {
          this.active = '1';
        } else if (this.authLevel === 0) {
          this.active = '3';
        } else {
          // this.authLevel为1 审核通过
          this.$router.push('/personal/userManagement');
        }
      }
    },
  },
  computed: {
    // 国籍
    kycNationality() {
      let str = '';
      const current = this.countryRealMap[`${this.country}`];
      if (this.country && current) {
        const val = current.value;
        [str] = val.split(' +');
      }
      return str;
    },
    countrydisabled() {
      if (this.$route.query.country && this.country) {
        return true;
      }
      return false;
    },
    isOpenUploadImg() {
      return this.$store.state.baseData.is_open_upload_img;
    },
    iskrwOpen() {
      let flag = false;
      if (this.coinsKrwOpen === '1' && this.krwPhoneAuth === '1') {
        flag = true;
      }
      return flag;
    },
    //  是否开启了 krw(针对韩国客户)
    coinsKrwOpen() {
      const { publicInfo } = this.$store.state.baseData;
      let str = '0';
      if (publicInfo && publicInfo.switch && publicInfo.switch.coins_krw_open) {
        str = publicInfo.switch.coins_krw_open.toString();
      }
      return str;
    },
    // 该用户是否完成nice认证
    krwPhoneAuth() {
      let str = '0';
      if (this.userInfo
        && this.userInfo.is_krw_phone_auth) {
        str = this.userInfo.is_krw_phone_auth.toString();
      }
      return str;
    },
    bg1() {
      if (this.certificateType === 1) {
        return { backgroundImage: `url(${upload1})` };
      }
      return {
        backgroundImage: `url(${upload5})`,
      };
    },
    bg2() {
      if (this.certificateType === 1) {
        return {
          backgroundImage: `url(${upload2})`,
        };
      }
      return {
        backgroundImage: `url(${upload4})`,
      };
    },
    bg3() {
      if (this.certificateType === 1) {
        return {
          backgroundImage: `url(${upload3})`,
        };
      }
      return {
        backgroundImage: `url(${upload6})`,
      };
    },
    authRealname() {
      return this.$store.state.personal.authRealname;
    },
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    activeP1() {
      if (this.active !== '1') {
        return '';
      }
      return 'b-2-cl';
    },
    activeP2() {
      if (this.active !== '2') {
        return '';
      }
      return 'b-2-cl';
    },
    activeP3() {
      if (this.active === '3') {
        return 'b-2-cl';
      }
      return '';
    },
    activeS2() {
      if (this.active !== '1') {
        return 'a-12-bg';
      }
      return 'a-1-bg';
    },
    activeS3() {
      if (this.active === '3') {
        return 'a-12-bg';
      }
      return 'a-1-bg';
    },
    disabled() {
      return !(this.checkValue1 && this.checkValue2);
    },
  },
  data() {
    return {
      promptTextType: this.$t('personal.idAuth.promptTextType'),
      promptText: this.$t('personal.label.promptText'),
      errorText: this.$t('personal.label.errorText'),
      authLevel: 3,
      text1: this.$t('personal.label.idCard'),
      text2: this.$t('personal.label.passport'),
      loading: false,
      firstPhotoImg: '',
      secondPhotoImg: '',
      thirdPhotoImg: '',
      firstPhotoLoading: false,
      secondPhotoLoading: false,
      thirdPhotoLoading: false,
      checkValue1: '', // 证件号
      promptText1: this.$t('personal.label.idCardNum'),
      errorText1: '',
      checkErrorFlag1: false,
      checkValue2: '', // 姓名
      promptText2: this.$t('personal.label.name'),
      errorText2: '',
      checkErrorFlag2: false,
      active: '1',
      disabled2: true,
      countryErrorFlag: false,
      certificateType: 1, // 证件类型
      certificateTypeErrorFlag: false,
      imageType: '1',
      certificateTypeList: [
        {
          value: this.$t('personal.label.idCard'),
          code: 1,
        },
      ],
      firstPhoto: '', // 身份证正面
      secondPhoto: '', // 身份证反面
      thirdPhoto: '', // 手持证件
      uploadName: '', // 当前选中的上传模块
    };
  },
  methods: {
    init() {
      const { country, countryKeyCode } = this.$route.query;
      this.country = `+${country}`;
      this.countryKeyCode = `${countryKeyCode}`;
      if (this.userInfo) {
        this.authLevel = this.userInfo.authLevel;
        if (this.authLevel === 2 || this.authLevel === 3) {
          this.active = '1';
        } else if (this.authLevel === 0) {
          this.active = '3';
        } else { // this.authLevel为1 审核通过
          this.$router.push('/personal/userManagement');
        }
      }
    },
    // krw定制
    initCertificateType() {
      if (this.krwPhoneAuth === '1') {
        this.certificateType = 1;
      } else {
        this.certificateType = 2;
      }
    },
    uploadFinish(obj) {
      if (obj.name) {
        this.uploadName = obj.name;
      }
      if (obj.error) {
        this.$bus.$emit('tip', { text: obj.error, type: 'error' });
        return;
      }
      this[`${this.uploadName}Img`] = obj.url;
      this[`${this.uploadName}Loading`] = false;
      this[this.uploadName] = obj.fileName;
      if (this.firstPhotoImg && this.secondPhotoImg && this.thirdPhotoImg) {
        this.disabled2 = false;
      }
    },
    onChangeFileFun(obj) {
      if (obj.code && obj.code === 'maxSize') {
        this.$bus.$emit('tip', { text: this.$t('personal.exccAuthForm.text3'), type: 'error' });
      }
      this.uploadName = obj.name;
      this[`${this.uploadName}Loading`] = true;
    },
    countryChange(item, name) {
      if (name === 'certificateType') {
        this.certificateType = item.code;
      } else {
        if (item.code !== '+156') {
          this.certificateType = 2; // 证件类型
          this.certificateTypeList = [
            {
              value: this.$t('personal.label.passport'),
              code: 2,
            },
          ];
        } else {
          this.certificateType = 1; // 证件类型
          this.certificateTypeList = [
            {
              value: this.$t('personal.label.idCard'),
              code: 1,
            },
          ];
        }
        this.country = item.code;
        this.countryKeyCode = item.keyCode;
      }
    },
    inputChanges(value, name) {
      if (name === 'name') {
        this.checkValue2 = value.trim();
      } else {
        this.checkValue1 = value.trim();
      }
    },
    checkFocus(name) {
      switch (name) {
        case 'email': { // email
          this.checkErrorFlag1 = false;
          this.errorText1 = '';
          break;
        }
        case '2': { // emailCode
          break;
        }
        default: { // newpassword again
          // console.log(1);
        }
      }
    },
    btnLink(num) {
      if (num === 1) {
        this.active = '2';
      } else {
        this.loading = true;
        const countryCode = this.iskrwOpen ? '+82' : this.countryKeyCode;
        const mcode = this.country;
        // this.countryList.forEach((item) => {
        //   if (item.keyCode === countryCode) {
        //     mcode = item.code;
        //   }
        // });
        const datas = {
          info: {
            countryCode,
            numberCode: mcode ? mcode.slice(1, mcode.length) : '',
            certificateType: this.certificateType,
            certificateNumber: this.checkValue1,
            userName: this.checkValue2,
            firstPhoto: this.firstPhoto,
            secondPhoto: this.secondPhoto,
            thirdPhoto: this.thirdPhoto,
          },
          kycFlag: false,
        };
        this.$store.dispatch('authRealname', datas);
      }
    },
  },
};
