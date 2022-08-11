// @ is an alias to /src
import { imgMap } from '@/utils';
import countryMinix from '../../countryList/countryList';

const upload1 = imgMap.kyc_idcard_a;
const upload2 = imgMap.kyc_idcard_b;
const upload3 = imgMap.kyc_idcard_c;
const upload4 = imgMap.kyc_passport_a;
const upload5 = imgMap.kyc_passport_b;
const upload6 = imgMap.kyc_passport_c;

export default {
  name: 'bindEmail',
  mixins: [countryMinix],
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
      firstPhotoImgSrc: '',
      secondPhotoImgSrc: '',
      thirdPhotoImgSrc: '',
      firstPhotoLoading: false,
      secondPhotoLoading: false,
      thirdPhotoLoading: false,
      checkValue1: '', // 证件号
      promptText1: this.$t('personal.label.idCardNum'),
      errorText1: '',
      checkErrorFlag1: false,
      checkValue2: '', // 姓名
      promptText2: this.$t('personal.label.name'),
      active: '1',
      disabled2: true,
      country: '', // 国家编号
      countryErrorFlag: false,
      certificateType: 2, // 证件类型
      certificateTypeErrorFlag: false,
      imageType: '1',
      firstPhoto: '', // 身份证正面
      secondPhoto: '', // 身份证反面
      thirdPhoto: '', // 手持证件
      uploadName: '', // 当前选中的上传模块
      idAuthType: [
        {
          code: 2,
          value: this.$t('personal.kyc.type1'),
        },
        {
          code: 4,
          value: this.$t('personal.kyc.type2'),
        },
        {
          code: 3,
          value: this.$t('personal.kyc.type3'),
        },
      ],
      kycPhone: '', // kyc选择的国家
      kycPhoneCode: '',
      kycName: '', // kyc 外国 - 名
      kycFamilyName: '', // kyc 外国 - 姓
      kycMetaText: '', // 上传图片说明文案
      flag: false, // 二维码
    };
  },
  watch: {
    interfaceSwitch(v) {
      if (v) {
        this.getLang();
      }
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
    publicInfo(v) {
      if (v) {
        this.isOpenUploadImg = this.publicInfo.switch.is_open_upload_img;
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
          this.firstPhotoImgSrc = '';
          this.secondPhotoImgSrc = '';
          this.thirdPhotoImgSrc = '';
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
          this.kycName = '';
          this.kycFamilyName = '';
          this.$store.dispatch('resetType');
        }
      }
    },
    appDownload(v) {
      if (v) { this.flag = true; }
    },
  },
  computed: {
    interfaceSwitch() {
      return this.$store.state.baseData.interfaceSwitch;
    },
    appAuthOpen() {
      return this.$store.state.baseData.app_auth_open;
    },
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
    },
    // ”00“ face++
    // ”01“羽山kyc
    // “02”简版自动
    // ”10“ 人工
    nameVerifiedType() {
      return this.$store.state.baseData.nameVerifiedType;
    },
    bg1() {
      if (this.kycType === '1') {
        return { backgroundImage: `url(${upload1})` };
      }
      return {
        backgroundImage: `url(${upload5})`,
      };
    },
    bg2() {
      if (this.kycType === '1') {
        return {
          backgroundImage: `url(${upload2})`,
        };
      }
      return {
        backgroundImage: `url(${upload4})`,
      };
    },
    bg3() {
      if (this.kycType === '1') {
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
    // kyc第一步骤
    kycStep1Disabled() {
      let flag = true;
      // 中国
      if (this.kycType === '1') {
        if (this.kycNationality.length // 国籍
          && this.checkValue2.length // 姓名
          && this.checkValue1.length) { // 证件号码
          flag = false;
        }
      // 外国
      } else if (this.kycNationality.length // 国籍
        && this.kycName.length // 名
        && this.kycFamilyName.length // 姓
        && this.checkValue1.length) { // 证件号码
        flag = false;
      }
      return flag;
    },
    // 国籍
    kycNationality() {
      let str = '';
      const current = this.countryRealMap[`+${this.kycPhone}`];

      if (this.kycPhone && current) {
        const val = current.value;
        [str] = val.split(' +');
      }
      return str;
    },
    // 验证类型 1为中国人 2为外国人
    kycType() {
      if (this.kycPhone) {
        if (this.kycPhone === '156') {
          return '1';
        }
        return '2';
      }
      return '2';
    },
    appDownload() {
      return this.$store.state.baseData.app_download;
    },
  },
  methods: {
    init() {
      if (this.$route.query) {
        if (this.$route.query.country) {
          this.kycPhone = this.$route.query.country;
          this.kycPhoneCode = this.$route.query.countryKeyCode;
        } else if (this.$route.query.countryKeyCode) {
          this.kycPhone = this.countryMap[`+${this.$route.query.countryKeyCode}`].code.replace('+', '');
          this.kycPhoneCode = this.$route.query.countryKeyCode;
        } else {
          this.kycPhone = '156';
          this.kycPhoneCode = '86';
        }
      }
      if (this.publicInfo !== null) {
        this.isOpenUploadImg = this.publicInfo.switch.is_open_upload_img;
      }
      if (this.userInfo) {
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
      if (this.interfaceSwitch) {
        this.getLang();
      }
    },
    getLang() {
      this.axios({
        url: '/kyc/Api/getUploadImgCopywriting',
      }).then((data) => {
        if (data.code.toString() === '0') {
          if (data.data.language) {
            this.kycMetaText = data.data.language;
          }
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    idAuthTypeChange({ code }) {
      this.certificateType = code;
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
      this[`${this.uploadName}ImgSrc`] = obj.imgSrc;
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
    inputChanges(value, name) {
      // 中国 - 姓名
      if (name === 'name') {
        this.checkValue2 = value;
      // 外国 - 姓
      } else if (name === 'kycFamilyName') {
        this.kycFamilyName = value;
      // 外国 - 名
      } else if (name === 'kycName') {
        this.kycName = value;
      // 证件号码
      } else {
        this.checkValue1 = value;
      }
    },
    checkFocus(name) {
      switch (name) {
        case 'email': {
          // email
          this.checkErrorFlag1 = false;
          this.errorText1 = '';
          break;
        }
        case '2': {
          // emailCode
          break;
        }
        default: {
          // newpassword again
        }
      }
    },
    btnLink(num) {
      if (num === 1) {
        this.active = '2';
      } else {
        this.loading = true;
        let type = 1;
        if (this.kycType === '2') {
          type = this.certificateType;
        }
        // 如果是中国并且是开启了简版自动kyc请求
        if (this.nameVerifiedType === '02' && this.kycType === '1') {
          const info = {
            countryCode: `+${this.kycPhoneCode}`, // 电话编码
            numberCode: this.kycPhone, // 国家代码
            certificateType: type, // 证件类型
            cardNo: this.checkValue1, // 证件号
            name: this.checkValue2 || undefined, // 中国 - 姓名
            photo_front: this.firstPhotoImgSrc,
            photo_back: this.secondPhotoImgSrc,
            photo_living: this.thirdPhotoImgSrc,
          };
          this.$store.dispatch('authRealname', { info, kycFlag: true });
          return;
        }
        const info = {
          countryCode: `+${this.kycPhoneCode}`, // 电话编码
          numberCode: this.kycPhone, // 国家代码
          certificateType: type, // 证件类型
          certificateNumber: this.checkValue1, // 证件号
          userName: this.checkValue2 || undefined, // 中国 - 姓名
          firstPhoto: this.firstPhoto,
          secondPhoto: this.secondPhoto,
          thirdPhoto: this.thirdPhoto,
          familyName: this.kycFamilyName || undefined, // 外国姓
          name: this.kycName || undefined, // 外国名
        };
        this.$store.dispatch('authRealname', { info, kycFlag: false });
      }
    },
  },
};
