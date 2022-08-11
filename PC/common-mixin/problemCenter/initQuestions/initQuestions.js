export default {
  name: 'initQuestions',
  data() {
    return {
      typeList: [],
      type: '',
      leavingText: '',
      imageType: '2',
      imgUrl: '', // 上传图片 url
      imgLoading: false,
      imageDataStr: '',
      buttonLoading: false,
    };
  },
  computed: {
    buttonDisabled() {
      let flag = true;
      if ((this.type.length && this.leavingText.length) || this.buttonLoading) {
        flag = false;
      }
      return flag;
    },
    isOpenUploadImg() {
      const data = this.$store.state.baseData.publicInfo;
      let flag = '0';
      if (data && data.switch && data.switch.is_open_upload_img
         && data.switch.is_open_upload_img.toString === '1') {
        flag = '1';
      }
      return flag;
    },
  },
  methods: {
    init() {
      this.initTypeList();
    },
    onChangeFileFun() {
      this.imgLoading = true;
    },
    uploadFinish(obj) {
      if (obj.error) {
        this.$bus.$emit('tip', { text: obj.error, type: 'error' });
        return;
      }
      this.imgUrl = obj.url;
      this.imgLoading = false;
      this.imageDataStr = obj.fileName;
    },
    // 初始化申诉类型
    initTypeList() {
      this.axios({
        url: 'question/problem_tip_list',
      }).then((data) => {
        if (data.code.toString() === '0') {
          const arr = [];
          data.data.rqTypeList.forEach((item) => {
            arr.push({ value: item.value, code: item.code.toString() });
          });
          this.typeList = arr;
          // if(arr.length) {
          //   this.$nextTick(() => {
          //     this.type = arr[0].code
          //   })
          // }
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    inputLineChange(v) {
      this.leavingText = v;
    },
    changeType(v) {
      this.type = v.code;
    },
    submit() {
      this.buttonLoading = true;
      this.axios({
        url: 'question/create_problem',
        params: {
          imageDataStr: this.imageDataStr.length ? this.imageDataStr : undefined,
          rqDescribe: this.leavingText,
          rqType: this.type,
        },
      }).then((data) => {
        this.buttonLoading = false;
        if (data.code.toString() === '0') {
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.$router.push('/questions/list');
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
  },
};
