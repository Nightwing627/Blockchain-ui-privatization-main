<!-- // Created by 侯东东.
// 表格组件
// ***************************** -->
<template>
  <c-h-dropDownRefresh :isopen="isopenRefresh" :on-refresh="onRefresh">
    <c-h-pullUpReload
      :on-infinite-load="onInfiniteLoad"
      :isopen = "isopenLoad"
      :parentPullUpState="pullUpState">
      <div v-if="loading" class="loading-box">
        <c-h-loading size="50"/>
      </div>
      <div v-else-if= "tableDataList && tableDataList.length" :class="classBox">
        <template v-for = "(line, index) in tableDataList">
          <div
            class="h-item-block"
            @click="lineClickEvent(line)"
            :class="[classLine, line.classes]"
            :key="index"
           >
            <ul class="data-list">
              <li
                v-if="(line.title && line.title.length) || (line.handle)"
                class="titlee clearfix data-list-li">
                <div v-if="line.title">
                  <span
                    v-for="(titItem, titIndex) in line.title"
                    :key="'tit' + titIndex"
                    :class="[classHead, 'x-1-cl' ,titItem.classes]"
                    @click.stop="elementClickEvent(titItem, line)"
                    v-html = "titItem.text">
                  </span>
                </div>
                <div
                  v-if="line.handle"
                  class="t-body">
                  <div
                    v-for="(btnItem, n) in line.handle"
                    :key="'btnItem' + n"
                    class= "item-btn"
                    :class="handleClass(btnItem)"
                    @click.stop="elementClickEvent(btnItem, line)"
                    >
                    <!-- 下拉框 -->
                    <span
                      class="t-select"
                      v-if="btnItem.type === 'select'"
                      :key="'sel' + n"
                      :class="btnItem.classes">
                      <i
                        class="icon-btn"
                        v-html="btnItem.iconSvg"
                        :class="btnItem.iconClass"
                        @click.stop="selectClickEvent(line.id)">
                      </i>
                      <div class="select-box a-5-bg" v-show="selectIsOpenId === line.id">
                        <ul class="select-box-ul">
                          <li
                          :style="`${btnItem.selectWidth ?
                          'width: ' + btnItem.selectWidth +'px'
                          : ''}`"
                          class="select-option b-2-cl data-list-li"
                          v-for="(list, k) in  btnItem.selectOption"
                          :key="'opt' + k"
                          @click.stop="elementClickEvent(btnItem, list)">
                           {{list.value}}
                          </li>
                        </ul>
                      </div>
                    </span>
                    <span v-else v-html="btnItem.text"></span>
                  </div>
                </div>
              </li>
              <li
                v-for="(item, i) in line.data"
                :ref="index === 0 ? 'td' + i : ''"
                :key="'td' + i"
                class="clearfix data-list-li">
                <div v-if="columns[i]"
                :class="[classHead ,columns[i].classes]">
                  {{columns[i].title}}
                </div>
                <div :class="classBody" v-if="isType(item) === 'string'">{{item}}</div>
                <div
                    v-else
                    :class=" [classBody ,item.classes]"
                    :key="'text' + i"
                    v-html="item.text"
                    @click.stop="elementClickEvent(item, line)">
                </div>
              </li>
            </ul>
            <slot name="extend" :data="line"></slot>
          </div>
        </template>

      </div>
      <div v-else class="no-data b-2-cl">
        <svg class="icon icon-50" aria-hidden="true">
          <use xlink:href="#icon-g_2"></use>
        </svg>
        <p>
          <!-- 暂无数据 -->
          {{$t('common.notData')}}
        </p>
      </div>
    </c-h-pullUpReload>
  </c-h-dropDownRefresh>
</template>

<script>

export default {
  name: 'c-h-dataList',
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    // 表头数据列表
    columns: {
      type: Array,
      default: () => [],
    },
    // 表格数据列表
    dataList: {
      type: Array,
      default: () => [],
    },
    // 整个表格根元素的class
    classes: {
      type: [String, Array],
      default: () => [],
    },
    // 表头class
    headClasses: {
      type: [String, Array],
      default: () => [],
    },
    // 表内容class
    bodyClasses: {
      type: [String, Array],
      default: () => [],
    },
    // 表格每一行class
    lineClasses: {
      type: [String, Array],
      default: () => [],
    },
    // 上滑动翻页的状态
    pullUpState: {
      type: [String, Number],
      default: 0,
    },
    // 是否开启上滑翻页的功能
    isopenInfiniteLoad: {
      default: true,
    },
    // 是否开启下拉刷新
    isopenRefresh: {
      default: true,
    },
  },
  data() {
    return {
      // 是否排序
      isSorte: false,
      // 排序 使用的Key
      sorteKey: null,
      // 排序方向
      sortType: null,
      // 下拉选项是否显示
      selectIsOpenId: null,
    };
  },

  mounted() {
  },
  computed: {
    // 表格 根目录 class
    classBox() {
      const cls = this.isType(this.classes) === 'Array' ? [...this.classes] : this.classes;
      return ['common-table-h5', cls];
    },
    classBody() {
      const cls = this.isType(this.bodyClasses) === 'Array' ? [...this.bodyClasses] : this.bodyClasses;
      return ['t-body x-1-cl', cls];
    },
    // 表头 class
    classHead() {
      const cls = this.isType(this.headClasses) === 'Array' ? [...this.headClasses] : this.headClasses;
      return ['t-head', cls];
    },
    // 表格行 class
    classLine() {
      const cls = this.isType(this.lineClasses) === 'Array' ? [...this.lineClasses] : this.lineClasses;
      return ['a-3-bd', cls];
    },
    // 表格 数据列表
    tableDataList() {
      return this.dataList;
    },
    // 是否开启翻页加载的功能
    isopenLoad() {
      if (this.isopenInfiniteLoad && this.dataList.length) {
        return true;
      }
      return false;
    },
  },
  watch: {
  },
  methods: {
    handleClass(item) {
      const cls = item.disabled ? 'b-2-cl' : 'u-8-cl';
      return ['handle-btn', cls, item.classes];
    },

    isType(obj) {
      const types = Object.prototype.toString.call(obj);
      if (types === '[object Array]') {
        return 'Array';
      }
      if (types === '[object Object]') {
        return 'Object';
      }
      return 'string';
    },
    // 下拉框点击 展示 和隐藏
    selectClickEvent(id) {
      this.selectIsOpenId = this.selectIsOpenId !== id ? id : null;
    },
    // 行 点击事件
    lineClickEvent(item) {
      this.selectIsOpenId = null;
      this.$emit('lineClick', item);
    },
    // 按钮 点击事件
    elementClickEvent(item, id) {
      this.selectIsOpenId = null;
      if (item.eventType && !item.disabled) {
        this.$emit('elementClick', item.eventType, id);
        if (item.type === 'link') {
          this.$router.push(item.links);
        }
      }
    },
    // 滑动到底部加载数据的方法
    onInfiniteLoad(done) {
      this.$emit('onInfiniteLoad', done);
    },
    onRefresh(done) {
      this.$emit('onRefresh', done);
    },
  },
};
</script>

<style lang="stylus">
  .h-item-block {
    border-bottom-width: 1px;
    border-bottom-style: solid;
    padding: 0.15rem 0;
    .data-list-li {
      min-height: 0.24rem;
      line-height: 0.24rem;
    }
    .titlee {
      margin-bottom: 0.1rem;
      .t-head {
        font-size: 0.16rem;
        margin-right: 0.04rem;
      }
    }
    .t-head {
      float: left;
      font-size: 0.12rem;
    }
    .t-body {
      float: right;
      font-size: 0,.14rem;
      max-width: 2.2rem;
      text-align: right;
      // overflow: hidden;
      word-break: break-all;
      .handle-btn {
        margin-left: 0.1rem;
      }
    }
    .item-btn {
      display: inline-block;
      vertical-align: middle;
      margin-left: 0.1rem;
      position: relative;
    }
    .select-box {
      position: absolute;
      text-align: left;
      transform-origin: center top 0px;
      top: 0.24rem;
      right: 0;
      z-index: 9;
      box-shadow: 0 3px 4px 1px rgba(0,0,0,0.28);
      border-radius: 2px;
      font-size: 14px;
      min-width: 0.8rem;
      overflow-y: auto;
      padding: 0.05rem 0;
      text-align: center;
      .select-box-ul {
        max-height: 200px;
      }
      .select-option {
        white-space:nowrap;
        line-height: 0.4rem;
        height: 0.4rem;
        padding: 0 0.1rem;
        cursor: pointer;
        font-size: 12px;
        &:hover {
          background-color: #263043;
        }
      }
    }
  }
 .loading-box {
    text-align: center;
    padding: 0.4rem 0 0;
  }
  .no-data {
    text-align: center;
    padding: 0.6rem 0 0;
    min-height: 1.5rem;
  }
</style>
