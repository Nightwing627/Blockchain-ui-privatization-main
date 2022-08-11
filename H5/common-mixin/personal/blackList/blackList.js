import { nul } from '@/utils';

export default {
  name: 'blackList',
  watch: {
    otcPersonRelationship(otcPersonRelationship) {
      if (otcPersonRelationship !== null) {
        this.loading = false;
        this.dataProcessin(otcPersonRelationship.data);
      }
    },
    otcUserContactsRemove(otcUserContactsRemove) {
      if (otcUserContactsRemove !== null) {
        if (otcUserContactsRemove.text === 'success') {
          this.$bus.$emit('tip', { text: otcUserContactsRemove.msg, type: 'success' });
          this.$store.dispatch('resetType');
          this.dialogFlag = false;
          this.page = 1;
          this.dataList = [];
          const info = { relationType: 'BLACKLIST', page: this.page, pageSize: this.pageSize };
          this.$store.dispatch('otcPersonRelationship', info);
          this.loading = true;
        } else {
          this.$bus.$emit('tip', { text: otcUserContactsRemove.msg, type: 'error' });
          this.$store.dispatch('resetType');
        }
      }
    },
  },
  computed: {
    otcPersonRelationship() {
      return this.$store.state.personal.otcPersonRelationship;
    },
    otcUserContactsRemove() {
      return this.$store.state.fiatdeal.otcUserContactsRemove;
    },
    navList() {
      return [
        {
          // 收款管理
          text: this.$t('personal.leaglTenderSet.title'),
          link: '/personal/leaglTenderSet',
        },
        {
          // 广告管理
          text: this.$t('personal.navMenu.list.advertisingManagement'),
          link: '/personal/advertisingManagement',
        },
        {
          // 黑名单
          text: this.$t('personal.navMenu.list.blackList'),
          active: true,
          link: '/personal/blackList',
        },
      ];
    },
  },
  methods: {
    init() {
      this.getData();
      this.loading = true;
    },
    getData() {
      const info = { relationType: 'BLACKLIST', page: this.page, pageSize: this.pageSize };
      this.$store.dispatch('otcPersonRelationship', info);
    },
    // 下拉刷新
    onRefresh(done) {
      this.dataList = [];
      this.loading = true;
      this.page = 1;
      this.getData();
      done();
    },
    onInfiniteLoads(done) {
      if (this.pullUpState === 0) {
        this.pullUpState = 2;
        this.page += 1;
        this.getData();
      }
      done();
    },
    dialogClose() {
      this.dialogFlag = false;
    },
    dialogConfirm() {
      const info = { friendId: this.uid };
      this.$store.dispatch('otcUserContactsRemove', info);
    },
    closeData(name, data) {
      this.dialogFlag = true;
      this.uid = data.id;
    },
    pagechange(page) {
      this.page = page;
      const info = { relationType: 'BLACKLIST', page: this.page, pageSize: this.pageSize };
      this.$store.dispatch('otcPersonRelationship', info);
      this.loading = true;
    },
    dataProcessin(data) {
      this.count = data.count;
      if (Math.ceil(parseFloat(data.count) / parseFloat(this.pageSize))
        > this.page) {
        this.pullUpState = 0;
      } else {
        this.pullUpState = 3;
      }
      const list = [];
      data.relationshipList.forEach((obj) => {
        list.push(
          {
            id: obj.userId,
            title: [
              {
                text: obj.otcNickName,
              },
            ],
            handle: [
              {
                type: 'button', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                text: this.$t('personal.blackList.closeText'),
                iconClass: [''],
                eventType: 'close',
                classes: [''],
              },
            ],
            data: [
              `${nul(obj.creditGrade, 100)}%`,
              obj.completeOrders,
              obj.completeOrders,
            ],
          },
        );
      });
      this.dataList = [...[], ...this.dataList, ...list];
    },
  },
  data() {
    return {
      pullUpState: 0,
      titleText: this.$t('personal.dialog.blackPrompt'),
      // table loading
      loading: false,
      uid: '',
      // table相关
      columns: [
        {
          title: this.$t('personal.blackList.columns')[1],
          align: 'right',
          width: '100px',
        },
        {
          title: this.$t('personal.blackList.columns')[2],
          align: 'right',
          width: '100px',
        },
        {
          title: this.$t('personal.blackList.columns')[3],
          align: 'right',
          width: '100px',
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
      // page相关
      count: 0,
      page: 1,
      pageSize: 10,
      // 弹框
      dialogFlag: false,
      dialogConfirmLoading: false,
      dialogConfirmDisabled: false,
    };
  },
};
