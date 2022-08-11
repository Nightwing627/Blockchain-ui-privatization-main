import { formatTime, imgMap, colorMap } from '@/utils';

export default {
  name: 'questionsList',
  data() {
    return {
      imgMap,
      colorMap,
      tabelLoading: false,
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      tabelList: [],
      revokeList: [], // 撤销队列
    };
  },
  computed: {
    columns() {
      return [
        // 提交时间
        {
          title: this.$t('questions.list1'),
          width: '100px',
        },
        // 编号
        {
          title: this.$t('questions.list2'),
        },
        // 类型
        {
          title: this.$t('questions.list3'),
        },
        // 描述
        {
          title: this.$t('questions.list4'),
          width: '20%',
        },
        // 状态
        {
          title: this.$t('questions.list5'),
        },
        // 操作
        {
          title: this.$t('questions.list6'),
        },
      ];
    },
  },
  methods: {
    init() {
      this.getData();
    },
    getData() {
      this.tabelLoading = true;
      this.axios({
        url: 'question/list_problem',
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
        },
      }).then((data) => {
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          const arr = [];
          data.data.rqInfoList.forEach((item) => {
            arr.push({
              id: item.id,
              data: [
                formatTime(item.ctime),
                [
                  {
                    type: 'button',
                    text: item.id,
                    eventType: 'details',
                  },
                ],
                item.rqTypeText,
                item.rqDescribe,
                item.rqStatusText,
                [
                  {
                    type: 'button',
                    text: this.$t('questions.delete'),
                    eventType: 'delete',
                  },
                ],
              ],
            });
          });
          this.tabelList = arr;
          this.paginationObj.total = data.data.count;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    tableClick(type, id) {
      if (type === 'details') {
        this.$router.push(`/questions/questionsDetails?id=${id}`);
      } else if (type === 'delete') {
        if (this.revokeList.indexOf(id) === -1) {
          this.revokeList.push(id);
          this.axios({
            url: '/question/delete_problem',
            params: {
              id,
            },
          }).then((data) => {
            const ind = this.revokeList.indexOf(id);
            this.revokeList.splice(ind, 1);
            if (data.code.toString() === '0') {
              this.$bus.$emit('tip', { text: data.msg, type: 'success' });
              this.getData();
            } else {
              this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            }
          });
        }
      }
    },
    pagechange(v) {
      this.paginationObj.currentPage = v;
      this.getData();
    },
  },
};
