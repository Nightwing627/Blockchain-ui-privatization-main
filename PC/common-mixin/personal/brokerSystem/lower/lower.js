export default {
  data() {
    return {
      currentTab: 1,
      lineHeight: '55',
      marginRight: 50, // 距离右边的距离
    };
  },
  computed: {
    navTab() {
      return [
        {
          name: this.$t('brokerSystem.lowerNavTab[0]'),
          index: 1,
        },
        // {
        //   name: this.$t('brokerSystem.lowerNavTab[1]'),
        //   index: 2,
        // },
      ];
    },
  },
  methods: {
    currentType(data) {
      this.currentTab = data.index;
    },
  },
};
