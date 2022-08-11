import { colorMap, imgMap } from '@/utils';

export default {
  name: 'excheif',
  data() {
    return {
      headClasses: 'c-4-bg',
      bodyClasses: 'c-4-bg',
      tableLoading: true,
      imgMap,
      colorMap,
      backgroundImg: `background: url(${imgMap.jjrNeaderBg})  center bottom no-repeat #0E1A2E`,
      carpbgImg: `background: url(${imgMap.broker_carp})`,
      carpbgImgTow: `background: url(${imgMap.broker_carp2})`,
      tableData: [], // 角色列表
      // 邀请人数
      userCount: 0,
      inviteUrlShow: true,
      // 返佣邀请链接
      inviteUrl: '',
      inviteQECode: '',
      inviteQECodeShow: false,
      isDiractShow: false,
      // 用户的返佣信息
      level: {
        levelOneSum: '',
        levelTwoSum: '',
        symbol: '',
        allSum: '',
      },
      errorHave: false,
      // 二维码开关
      imgCodeFlag: false,
    };
  },
  watch: {
  },
  computed: {
    columns() {
      return [
        {
          title: this.$t('excheif.tabel1'),
          width: '8%',
        },
        {
          title: this.$t('excheif.tabel2'),
          width: '22%',
        },
        {
          title: `${this.$t('excheif.tabel3')}（${this.$t('excheif.preson')}）`,
          width: '26%',
        },
        {
          title: this.$t('excheif.tabel4'),
          width: '22%',
          styleClass: 'brtime',
        },
      ];
    },
  },
  methods: {
    init() {
      this.getCode();
      this.getLevel();
      this.getData();
    },
    // 获取邀请链接和人数
    getCode() {
      this.axios({
        url: this.$store.state.url.common.broker_code,
        method: 'get',
      }).then((data) => {
        if (data.code === '0') {
          this.inviteUrl = data.data.inviteUrl;
          this.userCount = data.data.inviteNUm;
          this.inviteQECode = data.data.inviteQRCode;
        }
      });
    },
    // 获取返佣信息
    getLevel() {
      this.axios({
        url: this.$store.state.url.common.broker_asset,
        method: 'get',
      }).then((data) => {
        if (data.code === '0') {
          this.level = data.data;
        }
      });
    },
    // 请求tabel数据
    getData() {
      this.tableLoading = true;
      this.axios({
        url: this.$store.state.url.common.broker_data_list,
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          if (data.data) {
            if (data.data.length) {
              data.data.forEach((ele) => {
                const obj = ele;
                obj.newList = [];
                if (obj.list && obj.list.length) {
                  obj.list.forEach((item) => {
                    obj.newList.push({
                      id: item.uid,
                      data: [
                        item.nickName, // 账户名
                        `${item.otcSumBrokerage}（${item.otcBrokerageSymbol}）`, // 收益
                        item.num, // 好友数
                        [{
                          type: 'html',
                          text: `${item.dateStr}<br>${item.timeStr}`,
                        }], // 注册日期
                      ],
                    });
                  });
                }
                this.tableData.push(obj);
              });
            }
          }
        }
        this.tableLoading = false;
      });
    },
    copyClick() {
      this.copy(this.inviteUrl);
    },
    copy(str) {
      this.$bus.$emit('tip', { text: this.$t('personal.prompt.copySucces'), type: 'success' });
      function save(e) {
        e.clipboardData.setData('text/plain', str); // 下面会说到clipboardData对象
        e.preventDefault(); // 阻止默认行为
      }
      document.addEventListener('copy', save);
      document.execCommand('copy'); // 使文档处于可编辑状态，否则无效
      document.removeEventListener('copy', save);
    },
    handMouseenter() {
      this.inviteUrlShow = false;
    },
    handMouseleave() {
      this.inviteUrlShow = true;
    },

    formatJson(filterVal, jsonData) {
      return jsonData.map((v) => filterVal.map((j) => v[j]));
    },
    imgCodeShow() {
      this.imgCodeFlag = true;
    },
    imgCodeHide() {
      this.imgCodeFlag = false;
    },
  },
};
