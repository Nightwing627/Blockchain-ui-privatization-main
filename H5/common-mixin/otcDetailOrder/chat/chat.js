import { timeFn } from '@/utils';

export default {
  data() {
    return {
      userScrollOpt: {
        detectResize: true,
        scrollPanel: {
          initialScrollY: 999999,
          initialScrollX: false,
          scrollingX: true,
          scrollingY: true,
          speed: 300,
          easing: undefined,
          verticalNativeBarPos: 'right',
        },
      },
      tab: '', // server客服 user商家
      serverData: [],
      serverInp: '',
      serverBtnLoading: false,
      serverTimer: null,
      serverScroll: false,
      userBtnLoading: false,
      userWs: null,
      userWsReady: false, //
      userData: [], // 商户数据
      userInp: '', // 商户框
      chatId: '', // ws信息
      userTime: null, // 发送ws消息的time 用于loding的过程
      wsTime: null, // 用于重新连接ws
      sendTimer: null, // 商家聊天 若五秒没从服务端返
      resetTimer: null, // 商家聊天 若在三秒内重复创建
      chatHeight: 684,
      userTimes: null, // 发送消息倒计时
    };
  },
  props: {
    // 1-5 为正常流程  6是服务端状态  7为异常订单 8按3处理(客服介入强制使订单完成)
    // 待支付1 已支付2 交易成功3 取消 4 申诉 5 打币中6 异常订单7 申诉处理结束8
    commonData: { default: () => ({}), type: Object },
    // 当前订单 是买数字货币BUY 还是卖数字货币SELL
    isReady: { default: false, type: Boolean },
    chatTop: { default: 0, type: Number },
  },
  filters: {
    setTime(v) {
      return timeFn(new Date(Number(v)), 'yyyy-MM-dd hh:mm:ss');
    },
  },
  watch: {
    status(v) {
      if (v === '5' && this.commonData.isComplainUser.toString() === '1') {
        this.tab = 'server';
      } else {
        this.tab = 'user';
      }
    },
    tab(v) {
      if (v === 'server') {
        // 清除 商家聊天 若五秒没从服务端返回相同数据的后续操作
        if (this.sendTimer) { clearTimeout(this.sendTimer); }
        // 清除 商家聊天 若在三秒内重复创建ws的后续操作
        if (this.resetTimer) { clearTimeout(this.resetTimer); }
        // 如果 商家聊天 ws已经创建好了，则给他断开
        if (this.userWsReady) { this.userWs.close(); }
        // 获取 客服聊天数据
        this.getServerData();
        this.serverScroll = true;
      } else if (v === 'user') {
        // 清除 循环请求客服聊天数据
        if (this.serverTimer) { clearInterval(this.serverTimer); }
        // 创建ws并且请求历史数据
        this.initUser();
      }
    },
  },
  computed: {
    userVip() {
      let str = '';
      if (this.userInfo && this.userInfo.otcCompanyInfo) {
        if (Number(this.userInfo.otcCompanyInfo.status)) {
          if (this.userMess.companyLevel === 1) {
            str = `<svg class="icon icon-16" aria-hidden="true">
              <use xlink:href="#icon-c_16"></use>
            </svg>`;
          } else if (this.userMess.companyLevel === 2) {
            str = `<svg class="icon icon-16" aria-hidden="true">
              <use xlink:href="#icon-c_17"></use>
            </svg>`;
          }
        }
      }
      return str;
    },
    userInfo() { return this.$store.state.baseData.userInfo; },
    serverMy() {
      let obj = {};
      if (this.commonData.side === 'BUY') {
        obj = this.commonData.buyer;
      } else {
        obj = this.commonData.seller;
      }
      return obj;
    },
    userMess() {
      let obj = {};
      if (this.commonData.side === 'BUY') {
        obj = this.commonData.seller;
      } else if (this.commonData.side === 'SELL') {
        obj = this.commonData.buyer;
      }
      return obj;
    },
    otcWsUrl() {
      let str = '';
      if (this.$store.state.baseData.otcPublicInfo) {
        str = this.$store.state.baseData.otcPublicInfo.otcChatWS;
      }
      return str;
      // return 'wss://ws2.chaindown.com/otc-chat/chatServer'
    },
    serverBtnDisabled() {
      let flag = true;
      if (this.serverInp.length || this.serverBtnLoading) {
        flag = false;
      }
      return flag;
    },
    userBtnDisabled() {
      let flag = true;
      if (this.userInp.length || this.userBtnLoading) {
        flag = false;
      }
      return flag;
    },
    status() {
      if (this.commonData.status) {
        return this.commonData.status.toString();
      }
      return '0';
    },
    chatUserHeight() {
      if (this.status === '5' && this.commonData.isComplainUser.toString() === '1') {
        return this.chatHeight - 50 - 86 - 60;
      }
      return this.chatHeight - 86 - 60;
    },
    chatServerHeight() {
      return this.chatHeight - 50 - 60 - 6;
    },
    userSide() {
      let from = '';
      let to = '';
      if (this.commonData.side === 'BUY') {
        from = this.commonData.buyer.uid.toString();
        to = this.commonData.seller.uid.toString();
      } else if (this.commonData.side === 'SELL') {
        from = this.commonData.seller.uid.toString();
        to = this.commonData.buyer.uid.toString();
      }
      return {
        from, to,
      };
    },
  },
  beforeDestroy() {
    // 如果 商家聊天 ws已经创建好了，则给他断开
    this.tab = '';
    if (this.userWsReady) { this.userWs.close(); }
    this.userWs = null;
    clearInterval(this.serverTimer);
    clearTimeout(this.sendTimer);
    clearTimeout(this.resetTimer);
  },
  methods: {
    close() {
      this.$emit('setShowCharts', false);
    },
    goUid(id) {
      if (id) {
        this.$router.push(`/stranger?uid=${id}`);
      }
    },
    userInpKeyup(e) {
      if (e.keyCode === 13) {
        this.$bus.$emit('button-click', 'userButton');
      }
    },
    serverInpKeyup(e) {
      if (e.keyCode === 13) {
        this.$bus.$emit('button-click', 'serverButton');
      }
    },
    // aaa() {
    //   this.userWs.close()
    // },
    userBtnClick() {
      if (this.userWsReady) {
        this.userBtnLoading = true;
        this.sendTimer = setTimeout(() => {
          if (this.userBtnLoading) {
            this.userBtnLoading = false;
            if (this.userWs && this.userWsReady) {
              this.userWs.close();
              this.userInp = '';
            }
          }
        }, 5000);
        this.userTime = new Date().getTime();
        this.userWs.send(JSON.stringify({
          chatId: this.chatId,
          message: {
            content: this.userInp,
            from: this.userSide.from,
            to: this.userSide.to, // 接收人,如果没有则置空,如果有多个接收人则用,分隔
            orderId: this.commonData.sequence,
            time: this.userTime,
          },
          type: 'message',
        }));
      }
    },
    getUserData() {
      this.axios({
        url: '/chatMsg/message',
        method: 'post',
        params: {
          fromId: this.userSide.from,
          toId: this.userSide.to,
          orderId: this.commonData.sequence,
        },
        hostType: 'otc',
      }).then((data) => {
        if (data.code.toString() === '0') {
          const arr = [];
          data.data.forEach((v) => {
            let obj = {};
            if (this.commonData.side === 'BUY') {
              obj = v.fromId === this.userSide.from
                ? this.commonData.buyer
                : this.commonData.seller;
            } else {
              obj = v.fromId === this.userSide.from
                ? this.commonData.seller
                : this.commonData.buyer;
            }
            arr.push({
              replayContent: v.content, // 追 问内容
              contentType: '1', // 1-文字内容 2-图片url
              userType: v.fromId === this.userSide.from ? '2' : '1', // 用户类型：1-后台用户 2-前端用户
              ctime: v.ctime, // 提交时间
              obj,
            });
          });
          this.userData = arr;
          this.$nextTick(() => {
            this.$refs.userMessage.scrollTo({
              y: '100%',
            }, false);
          });
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 创建商家聊天 / 创建ws
    initUser() {
      if (this.tab !== 'user') { return; }
      this.getUserData(); // 获取历史数据
      // 创建ws
      if (this.otcWsUrl.length) {
        this.userWs = null; // 重置
        this.wsTime = new Date().getTime(); // 记录下创建时间 用于避免高频率创建
        const str = this.userSide.from + this.userSide.to; // 自己的id + 对方的id
        // 开始创建
        this.userWs = new WebSocket(`${this.otcWsUrl}/${window.btoa(str)}`);
        // 已经创建
        this.userWs.onopen = (() => {
          if (this.tab !== 'user') { return; }
          this.userWsReady = true;
        });
        // 接收数据
        this.userWs.onmessage = ((ev) => {
          if (this.tab !== 'user') { return; }
          if (ev.data) {
            const data = JSON.parse(ev.data);
            this.chatId = data.chatId;
            if (data.message) {
              if (Number(data.message.time) === Number(this.userTime)) {
                this.userBtnLoading = false;
                this.userInp = '';
              }
              let obj = {};
              if (this.commonData.side === 'BUY') {
                obj = data.message.from === this.userSide.from
                  ? this.commonData.buyer
                  : this.commonData.seller;
              } else {
                obj = data.message.from === this.userSide.from
                  ? this.commonData.seller
                  : this.commonData.buyer;
              }
              this.userData.push({
                replayContent: data.message.content, // 追 问内容
                contentType: '1', // 1-文字内容 2-图片url
                userType: data.message.from === this.userSide.from ? '2' : '1', // 用户类型：1-后台用户 2-前端用户
                ctime: data.message.time, // 提交时间
                obj,
              });
              this.$nextTick(() => {
                this.$refs.userMessage.scrollTo({
                  y: '100%',
                }, false);
              });
            }
          }
        });
        // 一旦发现错误就关闭
        this.userWs.onerror = (() => {
          if (this.tab !== 'user') { return; }
          this.userWs.close();
        });
        // 错误处理
        this.userWs.onclose = (() => {
          if (this.tab !== 'user') { return; }
          this.userWsReady = false;
          const nowTime = new Date().getTime();
          const spk = nowTime - this.wsTime;
          // 避免高频率创建
          if (spk > 3000) {
            this.initUser();
          } else {
            // 如果切到客服 或者退出 这个倒计时就没有必要继续了
            this.resetTimer = setTimeout(() => {
              clearTimeout(this.resetTimer);
              this.initUser();
            }, 3000 - spk);
          }
        });
      }
    },
    serverBtnClick() {
      this.serverBtnLoading = true;
      this.axios({
        url: '/question/reply_create',
        method: 'post',
        params: {
          rqId: this.commonData.complainId,
          rqReplyContent: this.serverInp,
          contentType: '1',
        },
      }).then((data) => {
        this.serverBtnLoading = false;
        if (data.code.toString() === '0') {
          this.serverScroll = true;
          this.getServerData();
          this.serverInp = '';
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    setTab(v) {
      this.tab = v;
    },
    getServerData() {
      clearInterval(this.serverTimer);
      this.axiosServer();
      this.serverTimer = setInterval(() => {
        this.axiosServer(true);
      }, 3000);
    },
    axiosServer(auto) {
      const headers = {};
      if (auto) {
        headers['exchange-auto'] = '1';
      }
      this.axios({
        url: '/question/details_problem',
        headers,
        params: {
          id: this.commonData.complainId,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          const arr = [];
          if (data.data.rqInfo) {
            arr.push({
              replayContent: data.data.rqInfo.rqDescribe, // 追 问内容
              contentType: '1', // 1-文字内容 2-图片url
              userType: '2', // 用户类型：1-后台用户 2-前端用户
              ctime: data.data.rqInfo.ctime, // 提交时间
            });
          }
          this.serverData = [...arr, ...data.data.rqReplyList];
          this.$nextTick(() => {
            if (this.serverScroll) {
              this.serverScroll = false;
              this.$refs.serverMessage.scrollTo({
                y: '100%',
              }, false);
            }
          });
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 上传图片
    fileChange(e) {
      const fileSize = e.srcElement.files[0].size / 1024 / 1024;
      if (fileSize <= 2) {
        const from = new FormData();
        from.append('file', this.$refs.fileInp.files[0], this.$refs.fileInp.files[0].name);
        // if (this.$store.state.baseData.publicInfo.uploadFlag === '1') {
        //   ajaxUrl = window.HOST_API.updata_url
        //   hostType = 'upload'
        // }
        this.axios({
          url: 'common/upload_img',
          headers: { 'Content-Type': 'multipart/form-data' },
          params: from,
          method: 'post',
        }).then((data) => {
          if (data.code === '0') {
            this.axios({
              url: '/question/reply_create',
              method: 'post',
              params: {
                rqId: this.commonData.complainId,
                rqReplyContent: data.data.filename,
                contentType: '2',
              },
            }).then((cdata) => {
              if (cdata.code.toString() === '0') {
                this.serverScroll = true;
                this.getServerData();
              } else {
                this.$bus.$emit('tip', { text: cdata.msg, type: 'error' });
              }
            });
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      } else {
        this.$bus.$emit('tip', { text: '请上传2MB以内的图片', type: 'warning' });
      }
    },
  },
};
