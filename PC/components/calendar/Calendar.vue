<template>
  <section class="wh_container">
    <div class="wh_content_all">
      <div class="wh_top_changge">
        <li @click="PreMonth(myDate,false)">
          <div class="wh_jiantou1"></div>
        </li>
        <li class="wh_content_li e-2-cl">{{dateTop}}</li>
        <li @click="NextMonth(myDate,false)">
          <div class="wh_jiantou2"></div>
        </li>
      </div>
      <div class="wh_content">
        <div
          class="wh_content_item"
          v-for="(tag, index) in textTop"
          :key="index + 'tag'">
          <div class="wh_top_tag">{{tag}}</div>
        </div>
      </div>
      <div class="wh_content">
        <div class="wh_content_item"
          v-for="(item,index) in list"
          :key="index"
          @click="clickDay(item,index)">
          <div
            class="wh_item_date c-8-cl-h"
            v-bind:class="[{ wh_isMark: item.isMark},
            {'hide':item.otherMonth!=='nowMonth'},
            {wh_want_dayhide:item.dayHide},
            {wh_isToday:item.isToday},
            {'c-8-bg':item.chooseDay},
            setClass(item)]"
          >{{item.id}}</div>
        </div>
      </div>
    </div>
  </section>
</template>
<script>

import timeUtil from './calendar';

export default {
  data() {
    return {
      myDate: [],
      list: [],
      historyChose: [],
      dateTop: '',
    };
  },
  props: {
    markDate: {
      type: Array,
      default: () => [],
    },
    markDateMore: {
      type: Array,
      default: () => [],
    },
    textTop: {
      type: Array,
      default: () => ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    },
    sundayStart: {
      type: Boolean,
      default: () => false,
    },
    agoDayHide: { type: String, default: '0' },
    futureDayHide: { type: String, default: '2554387200' },
    defaultDate: { type: String, default: '0' },
    defaultShowDate: {
      type: Number,
    },
  },
  created() {
    this.intStart();
    if (this.defaultShowDate) {
      this.myDate = new Date(this.defaultShowDate);
    } else {
      this.myDate = new Date();
    }
  },
  methods: {
    intStart() {
      timeUtil.sundayStart = this.sundayStart;
    },
    setClass(data) {
      const obj = {};
      obj[data.markClassName] = data.markClassName;
      return obj;
    },
    clickDay(item) {
      if (item.otherMonth === 'nowMonth' && !item.dayHide) {
        this.getList(this.myDate, item.date);
      }
      if (item.otherMonth !== 'nowMonth') {
        if (item.otherMonth === 'preMonth') {
          this.PreMonth(item.date);
        } else {
          this.NextMonth(item.date);
        }
      }
    },
    ChoseMonth(date, isChosedDay = true) {
      const ndate = timeUtil.dateFormat(date);
      this.myDate = new Date(ndate);
      this.$emit('changeMonth', timeUtil.dateFormat(this.myDate));
      if (isChosedDay) {
        this.getList(this.myDate, date, isChosedDay);
      } else {
        this.getList(this.myDate);
      }
    },
    PreMonth(date, isChosedDay = true) {
      const ndate = timeUtil.dateFormat(date);
      this.myDate = timeUtil.getOtherMonth(this.myDate, 'preMonth');
      this.$emit('changeMonth', timeUtil.dateFormat(this.myDate));
      if (isChosedDay) {
        this.getList(this.myDate, ndate, isChosedDay);
      } else {
        this.getList(this.myDate);
      }
    },
    NextMonth(date, isChosedDay = true) {
      const ndate = timeUtil.dateFormat(date);
      this.myDate = timeUtil.getOtherMonth(this.myDate, 'nextMonth');
      this.$emit('changeMonth', timeUtil.dateFormat(this.myDate));
      if (isChosedDay) {
        this.getList(this.myDate, ndate, isChosedDay);
      } else {
        this.getList(this.myDate);
      }
    },
    forMatArgs() {
      let NmarkDate = this.markDate;
      let NmarkDateMore = this.markDateMore;
      NmarkDate = NmarkDate.map((k) => timeUtil.dateFormat(k));
      NmarkDateMore = NmarkDateMore.map((k) => {
        const obj = {};
        obj.date = timeUtil.dateFormat(k.date);
        return obj;
      });
      return [NmarkDate, NmarkDateMore];
    },
    getList(date, chooseDay) {
      const [markDate, markDateMore] = this.forMatArgs();
      this.dateTop = `
        ${date.getFullYear()}
        ${this.$t('common.year')}
        ${date.getMonth() + 1}
        ${this.$t('common.mouth')}`;
      const arr = timeUtil.getMonthList(this.myDate);
      for (let i = 0; i < arr.length; i += 1) {
        let markClassName = '';
        const k = arr[i];
        k.chooseDay = false;
        const nowTime = k.date;
        const t = new Date(nowTime).getTime() / 1000;
        // 看每一天的class
        markDateMore.forEach((c) => {
          if (c.date === nowTime) {
            markClassName = c.className || '';
          }
        });
        // 标记选中某些天 设置class
        k.markClassName = markClassName;
        k.isMark = markDate.indexOf(nowTime) > -1;
        // 无法选中某天
        k.dayHide = t < this.agoDayHide || t > this.futureDayHide;
        if (k.isToday) {
          this.$emit('isToday', nowTime);
        }
        const flag = !k.dayHide && k.otherMonth === 'nowMonth';

        if (chooseDay && chooseDay === nowTime && flag) {
          this.$emit('choseDay', nowTime);
          this.historyChose.push(nowTime);
          k.chooseDay = true;
        } else if (
          this.historyChose[this.historyChose.length - 1] === nowTime
          && !chooseDay
          && flag
        ) {
          k.chooseDay = true;
        }
      }
      this.list = arr;
    },
  },
  mounted() {
    // 为了能让日历默认选择一个 新增defaultDate字段
    this.getList(this.myDate, this.defaultDate.replace(/-/g, '/'));
  },
  watch: {
    defaultShowDate(val) {
      if (val) {
        this.myDate = new Date(this.defaultShowDate);
        this.getList(this.myDate, this.defaultDate.replace(/-/g, '/'));
      }
    },
    markDate: {
      handler() {
        this.getList(this.myDate);
      },
      deep: true,
    },
    markDateMore: {
      handler() {
        this.getList(this.myDate);
      },
      deep: true,
    },
    agoDayHide: {
      handler() {
        this.getList(this.myDate);
      },
      deep: true,
    },
    futureDayHide: {
      handler() {
        this.getList(this.myDate);
      },
      deep: true,
    },
    sundayStart: {
      handler() {
        this.intStart();
        this.getList(this.myDate);
      },
      deep: true,
    },
  },
};
</script>
<style scoped>
@media screen and (min-width: 460px) {
  .wh_item_date:hover {
    cursor: pointer;
  }
}


.wh_container {
  width: 100%;
  margin: auto;
}
.wh_top_changge {
  display: flex;
  margin-bottom: 30px;
}
.wh_top_changge li {
  cursor: pointer;
  display: flex;
  font-size: 12px;
  flex: 1;
  justify-content: center;
  align-items: center;
  height: 18px;
  padding-top: 4px;
}

.wh_top_changge .wh_content_li {
  cursor: auto;
  flex: 7.6;
  font-size: 14px;
}
.wh_content_all {
  width: 100%;
  overflow: hidden;
  padding-bottom: 8px;
}

.wh_content {
  display: flex;
  flex-wrap: wrap;
  padding: 0 3% 0 3%;
  margin: 0 auto;
  width: 260px;
}

.wh_content:first-child .wh_content_item_tag,
.wh_content:first-child .wh_content_item {
  font-size: 12px;
}

.wh_content_item,
.wh_content_item_tag {
  font-size: 12px;
  width: 13.4%;
  text-align: center;
  position: relative;
}
.wh_content_item {
  height: 36px;
}

.wh_top_tag {
  width: 36px;
  height: 36px;
  line-height: 36px;
  margin: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.wh_item_date {
  width: 36px;
  height: 36px;
  line-height: 36px;
  margin: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 100%;

}

.wh_jiantou1 {
  width: 6px;
  height: 6px;
  cursor: pointer;
  border-top: 2px solid #828EA1;
  border-left: 2px solid #828EA1;
  transform: rotate(-45deg);
}
.wh_jiantou2 {
  width: 6px;
  height: 6px;
  cursor: pointer;
  border-top: 2px solid #828EA1;
  border-right: 2px solid #828EA1;
  transform: rotate(45deg);
}
.wh_content_item > .wh_isMark {
  margin: auto;
  border-radius: 100px;
  background: blue;
  z-index: 2;
}
.hide {
  display: none;
}
</style>
