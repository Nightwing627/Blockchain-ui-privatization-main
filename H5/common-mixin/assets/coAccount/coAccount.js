import {
  fixD,
  myStorage,
} from '@/utils';


export default {
  name: 'page-coAccount',
  data() {
    return {
      showFlag: false,
      tabelInfoData: [], // 列表元素数据
      detailsData: {}, // 账户详情
      tabelLoading: true,
    };
  },
  computed: {
    navList() {
      return [
        {
          text: this.$t('assets.coAccount.listTitle'),
          active: true,
          link: '/assets/coAccount',
        },
        {
          text: this.$t('assets.index.flowingWater'),
          link: '/assets/coFlowingWater',
        },
      ];
    },
    // 表格数据
    tableData() {
      const arr = [];
      this.tabelInfoData.forEach((item) => {
        let type = '';
        switch (item.contractType) {
          case 0:
            type = this.$t('assets.coAccount.type1'); // 永续
            break;
          case 1:
            type = this.$t('assets.coAccount.type2'); // 当周
            break;
          case 2:
            type = this.$t('assets.coAccount.type3'); // 次周
            break;
          case 3:
            type = this.$t('assets.coAccount.type4'); // 月度
            break;
          case 4:
            type = this.$t('assets.coAccount.type5'); // 季度
            break;
          default:
            type = '';
        }
        let time = '';
        if (item.contractType) {
          const t = item.settleTime.split(' ')[0].split('-');
          time = t[1] + t[2];
        }
        arr.push({
          id: JSON.stringify(item),
          title: [
            {
              text: `${item.contractSeries} ${type} · ${time} (${item.leverageLevel}X)`,
            },
          ],
          handle: [
            {
              type: 'button', // 'link' ' button' ,'html', 'label', 'icon' ‘str’
              text: '<svg class="icon icon-16" aria-hidden="true"><use xlink:href="#icon-c_1"></use></svg>',
              eventType: 'goTrade',
            },
          ],
          data: [
            {
              text: item.side === 'BUY' ? `+${item.volume}` : `-${item.volume}`,
              classes: item.side === 'BUY' ? 'u-1-cl' : 'u-4-cl',
            },
            `${fixD(item.realisedAmount, item.showPrecision)} ${item.quoteSymbol}`,
            `${fixD(item.unrealisedAmount, item.showPrecision)} ${item.quoteSymbol}`,
          ],
        });
      });
      return arr;
    },
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    tradeLinkUrl() {
      if (process.env.NODE_ENV === 'development') {
        return '/co/trade';
      }
      if (this.$store.state.baseData && this.$store.state.baseData.publicInfo) {
        return `${this.linkurl.mcoUrl}/trade`;
      }
      return '';
    },
    // 表格title
    columns() {
      return [
        // { title: this.$t('assets.coAccount.list1'), width: '20%' }, // 合约
        { title: this.$t('assets.coAccount.list2'), width: '20%' }, // 仓位数量(张)
        { title: this.$t('assets.coAccount.list3'), width: '25%' }, // 已实现盈亏
        { title: this.$t('assets.coAccount.list4'), width: '25%' }, // 未实现盈亏
        // { title: this.$t('assets.coAccount.list5'), width: '10%' }, // 操作
      ];
    },
    // market 接口
    market() { return this.$store.state.baseData.market; },
  },
  methods: {
    init() {
      this.getDetailData();
      this.axios({
        url: 'hold_contract_list',
        hostType: 'co',
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.tabelLoading = false;
          this.tabelInfoData = data.data;
        }
      });
    },
    getDetailData() {
      this.axios({
        url: 'account_balance',
        hostType: 'co',
      }).then((data) => {
        if (data.code.toString() === '0') {
          const [arr] = data.data;
          this.detailsData = arr;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    tableClick(type, data) {
      if (type === 'goTrade') {
        const obj = JSON.parse(data.id);
        myStorage.set('coMarkTitle', obj.contractSeries);
        myStorage.set('coNowSymbol', obj.symbol);
        window.location.href = this.tradeLinkUrl;
      }
    },
  },
};
