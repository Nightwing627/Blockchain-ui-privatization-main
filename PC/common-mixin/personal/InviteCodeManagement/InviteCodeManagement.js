// @ is an alias to /src
import {
  getComplexType, formatTime, imgMap, colorMap,
} from '@/utils';

export default {
  name: 'inviteCodeManagement',
  watch: {
    userInfo(userInfo) {
      if (userInfo !== null) {
        this.inviteCode = userInfo.inviteCode;
        this.inviteQECode = userInfo.inviteQECode;
        this.inviteUrl = userInfo.inviteUrl;
      }
    },
    inviteInfoList(inviteInfoList) {
      if (inviteInfoList !== null) {
        this.loading = false;
        this.inviteNumber = inviteInfoList.invite_number;
        this.count = Number(inviteInfoList.invite_number);
        this.inviteReturnNumber = inviteInfoList.invite_return_number;
        this.processData(inviteInfoList.invite_list);
      }
    },
  },
  computed: {
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    inviteInfoList() {
      return this.$store.state.personal.inviteInfoList;
    },
    friendImg() {
      return imgMap.friend;
    },
  },
  data() {
    return {
      imgMap,
      colorMap,
      inviteCodeShow: true,
      inviteUrlShow: true,
      loading: true,
      inviteCode: '',
      inviteQECode: '',
      inviteQECodeShow: false,
      inviteUrl: '',
      inviteNumber: '',
      inviteReturnNumber: '',
      // table 参数
      columns: [
        {
          title: this.$t('personal.inviteCodeManagement.columns')[0],
          align: 'left',
          width: '200px',
          classes: '',
        },
        {
          title: this.$t('personal.inviteCodeManagement.columns')[1],
          align: 'center',
          width: '',
        },
      ],
      dataList: [],
      cellHeight: 55,
      headHeight: 30,
      lineNumber: 10,
      classes: '',
      headClasses: '',
      bodyClasses: '',
      lineClass: '',
      count: 0,
      page: 1,
      pageSize: 10,
    };
  },
  methods: {
    init() {
      const info = { page: this.page, pageSize: this.pageSize };
      this.$store.dispatch('inviteInfoList', info);
      const { userInfo } = this.$store.state.baseData;
      this.inviteCode = userInfo.inviteCode;
      this.inviteQECode = userInfo.inviteQECode;
      this.inviteUrl = userInfo.inviteUrl;
    },
    handMouseenter(name) {
      if (name === 'inviteCode') {
        this.inviteCodeShow = false;
      } else {
        this.inviteUrlShow = false;
      }
    },
    handMouseleave(name) {
      if (name === 'inviteCode') {
        this.inviteCodeShow = true;
      } else {
        this.inviteUrlShow = true;
      }
    },
    copyClick(name) {
      if (name === 'inviteCode') {
        this.copy(this.inviteCode);
      } else {
        this.copy(this.inviteUrl);
      }
    },
    copy(str) {
      // this.$bus.$emit('tip', { text: this.$t('personal.prompt.copySucces'), type: 'success' });
      function save(e) {
        e.clipboardData.setData('text/plain', str); // 下面会说到clipboardData对象
        e.preventDefault(); // 阻止默认行为
      }
      document.addEventListener('copy', save);
      document.execCommand('copy'); // 使文档处于可编辑状态，否则无效
      document.removeEventListener('copy', save);
    },
    processData(list) { // 处理数据
      if (getComplexType(list) === 'Array') {
        this.dataList = list.map((obj) => (
          {
            data: [formatTime(obj.register_time), obj.invitee],
          }));
      }
    },
    pagechange(page) {
      this.page = page;
      const info = { page, pageSize: this.pageSize };
      this.$store.dispatch('inviteInfoList', info);
    },
  },
};
