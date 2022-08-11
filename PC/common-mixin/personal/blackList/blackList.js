import { nul, imgMap, colorMap } from '@/utils';

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
  },
  methods: {
    init() {
      const info = { relationType: 'BLACKLIST', page: this.page, pageSize: this.pageSize };
      this.$store.dispatch('otcPersonRelationship', info);
      this.loading = true;
    },
    dialogClose() {
      this.dialogFlag = false;
    },
    dialogConfirm() {
      const info = { friendId: this.uid };
      this.$store.dispatch('otcUserContactsRemove', info);
    },
    closeData(name, id) {
      this.dialogFlag = true;
      this.uid = id;
    },
    pagechange(page) {
      this.page = page;
      const info = { relationType: 'BLACKLIST', page: this.page, pageSize: this.pageSize };
      this.$store.dispatch('otcPersonRelationship', info);
      this.loading = true;
    },
    dataProcessin(data) {
      this.count = data.count;
      const list = [];
      data.relationshipList.forEach((obj) => {
        list.push(
          {
            id: obj.userId,
            data: [
              obj.otcNickName,
              `${nul(obj.creditGrade, 100)}%`,
              obj.completeOrders,
              obj.completeOrders,
              [
                {
                  type: 'button', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
                  text: this.$t('personal.blackList.closeText'),
                  iconClass: [''],
                  eventType: 'close',
                  classes: [''],
                },
              ],
            ],
          },
        );
      });
      this.dataList = list;
    },
  },
  data() {
    return {
      imgMap,
      colorMap,
      titleText: this.$t('personal.dialog.blackPrompt'),
      // table loading
      loading: false,
      uid: '',
      // table相关
      columns: [
        {
          title: this.$t('personal.blackList.columns')[0],
          align: 'left',
          width: '100px',
          classes: '',
        },
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
        {
          title: this.$t('personal.blackList.columns')[4],
          align: 'right',
          width: '150px',
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
