import { formatTime } from '@/utils';

export default {
  name: 'questionsDetails',
  data() {
    return {
      id: '',
      rqInfoData: {},
      reInfoList: [],
      sendText: '',
      buttonLoading: false,
    };
  },
  computed: {
    buttonDisabled() {
      let flag = true;
      if (this.sendText.length || this.buttonLoading) {
        flag = false;
      }
      return flag;
    },
  },
  filters: {
    setTime(v) {
      if (v) {
        return formatTime(v);
      }
      return '--';
    },
  },
  methods: {
    init() {
      if (this.$route.query && this.$route.query.id) {
        this.id = this.$route.query.id;
        this.getData();
      }
    },
    submit() {
      this.buttonLoading = true;
      this.axios({
        url: 'question/reply_create',
        headers: {},
        params: {
          rqId: this.id,
          rqReplyContent: this.sendText,
          contentType: 1,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.getData(true);
        } else {
          this.buttonLoading = false;
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    inputLineChange(v) {
      this.sendText = v;
    },
    getData(flag) {
      this.axios({
        url: 'question/details_problem',
        params: {
          id: this.id,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.rqInfoData = data.data.rqInfo;
          this.reInfoList = data.data.rqReplyList;
          if (flag) {
            this.sendText = '';
            this.buttonLoading = false;
          }
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
  },
};
