export default {
  name: 'aliwe',
  data() {
    return {
      promptText1: '',
      errorText1: '',
      checkErrorFlag1: false,
      imageType: '2',
      checkValue1: '',
      promptText2: '',
      errorText2: '',
      checkErrorFlag2: false,
      checkValue2: '',
      isOpenUploadImg: '0',
      imgLoading: false,
      imgSrc: '',
      imgFile: '',
    };
  },
  props: {
    payments: {
      default: () => {},
      type: Object,
    },
  },
  methods: {
    init() {
      if (this.payments !== null) {
        this.promptText1 = this.payments.name;
        this.promptText2 = this.payments.title;
        if (this.payments.obj) {
          this.checkValue1 = this.payments.obj.userName;
          this.checkValue2 = this.payments.obj.account;
          this.imgSrc = this.payments.obj.qrcodeImg;
        }
      }
      const { publicInfo } = this.$store.state.baseData;
      if (publicInfo !== null) {
        this.isOpenUploadImg = publicInfo.switch.is_open_upload_img;
      }
      // if (this.userInfo) {
      //   this.checkValue1 = this.userInfo.realName;
      //   const obj = {};
      //   obj.userName = this.userInfo.realName;
      //   this.$emit('callBack', 'payment1', 'userName', obj);
      // }
      if (this.isModify === 0 || this.isCanModifyName) {
        if (this.userInfo) {
          this.checkValue1 = this.userInfo.realName;
          const obj = {};
          obj.userName = this.userInfo.realName;
          this.$emit('callBack', 'payment1', 'userName', obj);
        }
      }
    },
    inputChanges(value, name) {
      if (name === 'userName') {
        this.checkValue1 = value;
      } else {
        this.checkValue2 = value;
      }
      const obj = {};
      obj[name] = value;
      this.$emit('callBack', 'payment1', name, obj);
    },
    uploadFinish(obj) {
      if (obj.error) {
        this.$bus.$emit('tip', { text: obj.error, type: 'error' });
        return;
      }
      this.imgLoading = false;
      this.imgSrc = obj.url;
      const img = this.imgSrc;
      this.$emit('callBack', 'payment1', 'qrcodeImg', { qrcodeImg: img });
    },
    onChangeFileFun() {
      this.imgLoading = true;
    },
  },
  computed: {
    isCanModifyName() {
      return this.userInfo && Number(this.userInfo.userCompanyInfo.status) === 0;
    },
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
  },
  watch: {
    userInfo(v) {
      if (v) {
        this.checkValue1 = v.realName;
        const obj = {};
        obj.userName = v.realName;
        this.$emit('callBack', 'payment1', 'userName', obj);
      }
    },
    payments(payments) {
      if (payments !== null) {
        this.checkValue2 = payments.obj.account;
        this.imgSrc = payments.obj.qrcodeImg;
        this.promptText1 = payments.name;
        this.promptText2 = payments.title;
      }
    },
  },
};
