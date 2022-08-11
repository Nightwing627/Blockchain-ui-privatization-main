// Created by 侯东东. // 分页器 // *****************************
<template>
  <div class='pagination a-5-bg' :class='classes'>
    <div class='pagination-bar a-3-bd b-2-cl'>
      <span class='num b-2-cl'>
        {{ startNumber }} - {{ endNumber }} of {{ total }}
      </span>
      <span
        class='pagination-btn a-4-cl-h'
        :class='{ disabled: currentPage === 1 }'
        @click='pagination(-1)'
      >
        <svg class='icon icon-14' aria-hidden='true' v-if='currentPage === 1'>
          <use xlink:href='#icon-a_10_1'></use>
        </svg>
        <svg class='icon icon-14' aria-hidden='true' v-else>
          <use xlink:href='#icon-a_10'></use>
        </svg>
      </span>
      <span
        class='pagination-btn a-4-cl-h'
        :class='{ disabled: currentPage === totalPage }'
        @click='pagination(1)'
      >
        <svg
          class='icon icon-14'
          aria-hidden='true'
          v-if='currentPage === totalPage'
        >
          <use xlink:href='#icon-a_11_1'></use>
        </svg>
        <svg class='icon icon-14' aria-hidden='true' v-else>
          <use xlink:href='#icon-a_11'></use>
        </svg>
      </span>
    </div>
  </div>
</template>

<script type='es6'>
export default {
  name: 'c-pagination',
  data() {
    return {
      pages: this.currentPage,
    };
  },
  props: {
    total: { // 数据总条数
      type: Number,
      default: 0,
    },
    display: { // 每页显示条数
      type: Number,
      default: 10,
    },
    currentPage: { // 当前页码
      type: Number,
      default: 1,
    },
    classes: {
      type: String,
    },
  },
  computed: {
    totalPage() {
      return Math.ceil(parseFloat(this.total) / parseFloat(this.display)); // 总页数
    },
    startNumber() {
      return (parseFloat(this.currentPage) - 1) * parseFloat(this.display) + 1;
    },
    endNumber() {
      const num = parseFloat(this.currentPage) * parseFloat(this.display);
      if (num > this.total) {
        return this.total;
      }
      return num;
    },
  },
  watch: {
    currentPage(val) {
      this.pages = val;
    },
  },
  methods: {
    pagination(num) {
      if (num < 1) {
        if (parseFloat(this.currentPage) > 1 && parseFloat(this.pages) > 1) {
          this.pages -= 1;
          this.$emit('pagechange', this.pages);
        }
      } else if (parseFloat(this.currentPage) < parseFloat(this.totalPage)
        && parseFloat(this.pages) < parseFloat(this.totalPage)) {
        this.pages += 1;
        this.$emit('pagechange', this.pages);
      }
    },
  },
};
</script>
<style scoped lang='stylus'>
.pagination {
  padding: 0 20px;
}
.pagination-bar {
  user-select: none;
  border-top-width: 1px ;
  border-top-style: solid;
  height: 56px;
  line-height: 56px;
  text-align: right;
  font-size: 12px;
  .num {
    margin-right: 10px;
  }
  .pagination-btn {
    cursor: pointer;
    font-size: 14px;
    display: inline-block;
    width: 40px;
    height: 40px;
    line-height: 40px;
    margin-top: 4px;
    text-align: center;
    border-radius: 50%;
  }
  .disabled {
    cursor: default;
    &:hover{
      background: none;
    }
  }
}
</style>
