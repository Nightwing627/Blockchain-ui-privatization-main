export default {
  data() {
    return {
      tc: '',
      rqstData: '',
      targetId: '',
      commonSvlUrl: '',
    };
  },
  methods: {
    init() {
      this.axios({
        url: 'user/phone/auth_request',
        method: 'post',
      }).then((data) => {
        if (data.code.toString() === '0') {
          const {
            commonSvlUrl, rqstData, targetId, tc,
          } = data.data;
          this.commonSvlUrl = commonSvlUrl;
          this.rqstData = rqstData;
          this.targetId = targetId;
          this.tc = tc;
          this.$nextTick(() => {
            this.$refs.myFrom.submit();
            // setTimeout(() => {

            // }, 3000);
            // var retcode = 'B000';
            // if ("B000" == retcode) {
            //   //请求认证
            //   window.name = "";
            //   document.form1.submit();
            // } else {
            //   //返回请求失败页面
            //   alert("手机认证服务异常，请稍后再试 (code=" + retcode + ")");
            //   self.close();
            // }
          });
        }
      });
    },
  },
};
