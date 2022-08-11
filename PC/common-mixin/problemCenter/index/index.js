export default {
  name: 'initiateQuestions',
  data() {
    return {
      contentId: '',
    };
  },
  computed: {
    activeName() {
      return this.$route.meta.activeName;
    },
    sideList() {
      return [
        {
        // 发起提问
          title: this.$t('questions.send'),
          fileName: '/questions/init',
        },
        {
        // '问题列表'
          title: this.$t('questions.list'),
          fileName: '/questions/list',
        },
      ];
    },
  },
  watch: {
    activeName(v) {
      this.contentId = v;
    },
  },
  methods: {
    init() {
      if (this.$route.meta && this.$route.meta.activeName) {
        this.contentId = this.$route.meta.activeName;
      }
    },
    pushRouter(v) {
      this.$router.push(v);
    },
  },
};
