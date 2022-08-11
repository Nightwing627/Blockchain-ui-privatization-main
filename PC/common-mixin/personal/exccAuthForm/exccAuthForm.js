// @ is an alias to /src

import { imgMap } from '@/utils';
import livePhotos from '@/assets/images/1/livePhoto.png';
import countryMinix from '../../countryList/countryList';

const upload1 = imgMap.kyc_passport_a;
const upload2 = imgMap.kyc_passport_b;
const upload3 = imgMap.kyc_passport_c;
const upload4 = imgMap.livePhoto || livePhotos;

export default {
  name: 'exccAuthForm',
  mixins: [countryMinix],
  components: {
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
      livePhotoImg: '',
      firstPhotoLoading: false,
      secondPhotoLoading: false,
      thirdPhotoLoading: false,
      livePhotoLoading: false,
      checkValue1: '', // 证件号
      promptText1: this.$t('personal.label.idCardNum'),
      errorText1: '',
      checkErrorFlag1: false,
      promptText2: this.$t('personal.label.name'),
      errorText2: '',
      checkErrorFlag2: false,
      active: '1',
      disabled2: true,
      incomeErrorFlag: false,
      certificateTypeErrorFlag: false,
      imageType: '1',
      certificateTypeList: [
        {
          value: this.$t('personal.label.idCard'),
          code: 1,
        },
      ],
      kycPhone: '',
      kycMetaText: '', // 上传图片说明文案
      // 国家不可编辑
      countryDisabled: true,
      firstPhoto: '', // 身份证正面
      secondPhoto: '', // 身份证反面
      thirdPhoto: '', // 手持证件
      uploadName: '', // 当前选中的上传模块
      livePhoto: '', // 居住证图片
      full_name: '', // 姓名
      sex: '', // 性别
      birthday: '', // 出生日期
      city: '', // 市
      address: '', // 住在地址
      postcode: '', // 邮政编码
      certificateNumber: '', // 证件号码
      income: '0', // 收入来源
      qtTExt: '', // 收入来源选择其他的文案
      birthdayErrorText: '',
      birthdayErrorFlag: false,
    };
  },
  watch: {
    birthday(val) {
      if (!val.match(/^(\d{4})(-)(\d{2})(-)(\d{2})$/)) {
        this.birthdayErrorText = this.$t('personal.exccAuthForm.text16');
        this.birthdayErrorFlag = true;
      } else if (val && this.ageLimit && !this.validateAge()) {
        this.birthdayErrorText = '';
        this.birthdayErrorFlag = false;
        this.$bus.$emit('tip', { text: `${this.$t('personal.exccAuthForm.text14')}${this.ageLimit}`, type: 'error' });
      } else {
        const ar = val.split('-');
        if (Number(ar[0] > 2020) || Number(ar[1]) > 12 || Number(ar[2]) > 31) {
          this.birthdayErrorText = this.$t('personal.exccAuthForm.text16');
          this.birthdayErrorFlag = true;
        } else {
          this.birthdayErrorText = '';
          this.birthdayErrorFlag = false;
        }
      }
    },
    clientUploadType() {
      this.getImageToken();
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
    authRealname(authRealname) {
      if (authRealname !== null) {
        this.loading = false;
        if (authRealname.text === 'success') {
          this.$bus.$emit('tip', { text: authRealname.msg, type: 'success' });
          this.active = '3';
          this.$store.dispatch('resetType');
        } else {
          this.$bus.$emit('tip', { text: authRealname.msg, type: 'error' });
          this.active = '1';
          this.$store.dispatch('resetType');
        }
      }
    },
  },
  computed: {
    exccKycConfig() {
      return this.$store.state.personal.exccKycConfig;
    },
    ageLimit() {
      return this.exccKycConfig ? Number(this.exccKycConfig.data.ageLimit) : 0;
    },
    defaultShowDate() {
      if (this.ageLimit && Number(this.ageLimit) > 0) {
        const curDate = (new Date()).getTime();
        const fourYearsTime = 31536000000 * Number(this.ageLimit);
        return curDate - fourYearsTime;
      }
      return null;
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
    // 收入来源列表
    incomeList() {
      return [
        { code: '0', value: this.$t('personal.exccAuthorization.income1') },
        { code: '1', value: this.$t('personal.exccAuthorization.income2') },
        { code: '2', value: this.$t('personal.exccAuthorization.income3') },
        { code: '3', value: this.$t('personal.exccAuthorization.income4') },
        { code: '4', value: this.$t('personal.exccAuthorization.income5') },
        { code: '5', value: this.$t('personal.exccAuthorization.income6') },
        { code: '6', value: this.$t('personal.exccAuthorization.income7') },
      ];
    },
    isOpenUploadImg() {
      return this.$store.state.baseData.is_open_upload_img;
    },
    imgToken() {
      return this.$store.state.baseData.imgToken || {};
    },
    clientUploadType() {
      return this.$store.state.baseData.client_img_upload_open;
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
      return {
        backgroundImage: `url(${upload1})`,
      };
    },
    bg2() {
      return {
        backgroundImage: `url(${upload2})`,
      };
    },
    bg3() {
      return {
        backgroundImage: `url(${upload3})`,
      };
    },
    bg4() {
      return {
        backgroundImage: `url(${upload4})`,
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
      if (this.income === '6' && !this.qtTExt) {
        return true;
      }
      return !(this.full_name
      && this.sex
      && this.birthday
      && this.city
      && this.address
      && this.postcode
      && this.certificateNumber
      && this.country
      && this.validateAge()
      && !this.birthdayErrorFlag);
    },
  },
  methods: {
    init() {
      this.getImageToken();
      this.countryInit();
      this.getLang();
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
    mountedInit() {
      if (!this.exccKycConfig) {
        this.$store.dispatch('exccKycConfig');
      }
    },
    countryInit() {
      if (this.$route.query) {
        if (this.$route.query.country) {
          this.kycPhone = this.$route.query.country;
          this.country = this.$route.query.countryKeyCode;
        } else if (this.$route.query.countryKeyCode) {
          this.kycPhone = this.countryMap[`+${this.$route.query.countryKeyCode}`].code.replace('+', '');
          this.country = this.$route.query.countryKeyCode;
        } else {
          this.kycPhone = '156';
          this.country = '86';
        }
      }
    },
    getImageToken() {
      const tokenData = this.imgToken[this.imageType];
      if ((!tokenData || (new Date(tokenData.Expiration).getTime() - new Date().getTime() < 30000))
        && Number(this.clientUploadType)) {
        this.$store.dispatch('getImgToken', this.imageType);
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
      if (this.firstPhotoImg && this.secondPhotoImg && this.thirdPhotoImg && this.livePhotoImg) {
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
    incomeChange(item) {
      this.income = item.code;
    },
    inputChanges(value, name) {
      this[name] = value.trim();
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
      } else if (num === 3) {
        this.active = '1';
      } else {
        this.loading = true;
        const info = {
          fullName: this.full_name,
          // 性别
          sex: this.sex,
          birthday: this.birthday,
          city: this.city,
          address: this.address,
          postcode: this.postcode,
          certificateNumber: this.certificateNumber,
          country: `+${this.country}`,
          numberCode: this.kycPhone,
          income: this.income,
          firstPhoto: this.firstPhoto,
          secondPhoto: this.secondPhoto,
          thirdPhoto: this.thirdPhoto,
          livePhoto: this.livePhoto,
          otherIncomeDesc: this.qtTExt,
        };
        this.$store.dispatch('exccAuthRealname', info);
      }
    },
    onChangeCalendar(data) {
      this.birthday = data;
    },
    // 选择性别
    selectGender(id) {
      this.sex = id;
    },
    countryChange(item) {
      this.country = item.code;
      this.countryKeyCode = item.keyCode;
    },
    validateAge() {
      if (!this.ageLimit) {
        return true;
      }
      const birthday1 = this.birthday.split('-');
      const convert2Date = new Date(birthday1[0], birthday1[1], birthday1[2]);
      let nowDate = new Date(); // 获取当前时间
      const year = nowDate.getFullYear();
      const month = nowDate.getMonth() + 1;
      const date = nowDate.getDate();
      nowDate = new Date(year, month, date);
      const age = nowDate.getTime() - convert2Date.getTime(); // 毫秒
      let leapYear = 0; // 有多少个闰年
      for (let i = 0; i <= this.ageLimit; i += 1) {
        if ((i % 4 === 0 && i % 100 !== 0) || i % 400 === 0) {
          leapYear += 1;
        }
      }
      const YearNumber = this.ageLimit - leapYear;
      const betweenNumer = 86400000 * 365 * YearNumber + 86400000 * 366 * leapYear;
      return age >= betweenNumer;
    },
  },
};
