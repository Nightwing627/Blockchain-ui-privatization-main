// Created by 王晓波. // 上传图片 // *****************************
<template>
  <div>
    <input
      class='input_upload_file'
      type='file'
      :class='className'
      :accept='formatValue'
      ref='upload'
      @change='tellFun'
    />
    <div class='upload-div' @click='uploadClick'></div>
  </div>
</template>

<script>
export default {
  name: 'c-oldUploadFile',
  props: {
    // 最大尺寸
    maxSize: {
      type: String,
      default: '5',
    },
    imageType: {
      type: String,
      default: '2',
    },
    // 上传数据类型
    formatValue: {
      type: String,
      default: 'image/jpeg, image/jpg, image/png',
    },
    // 接口名
    url: {
      type: String,
      default: '',
    },
    // 外部传入name
    name: {
      type: String,
      default: '',
    },
    // 外部传入请求类型
    isOpenUploadImg: {
      type: String,
      default: '',
    },
    // 外部传入可拓展项
    expand: {
      type: Array,
      default: () => [],
    },
    // className
    className: {
      type: String,
      default: '',
    },
    // isWaterMark 添加水印
    isWaterMark: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      // 真实文件尺寸
      size: '',
      // 真实文件格式
      realFormatValue: '',
    };
  },
  mounted() {},
  computed: {},
  watch: {},
  methods: {
    uploadClick() {
      this.$refs.upload.click();
    },
    tellFun(e) {
      const val = e.target.files[0];
      if (val.size > this.maxSize * 1024 * 1024) {
        this.$emit('tellMessage', {
          error: '图片尺寸过大',
          code: 'maxSize',
        });
        e.target.value = '';
      } else {
        this.$emit('tellMessage', {
          name: this.name,
        });
        const formData = new FormData();
        formData.append(this.name, val);
        formData.append('name', this.name);
        // 添加水印
        if (this.isWaterMark) {
          // formData.append('isWaterMark', 1);
        }
        if (this.expand.length > 0) {
          this.expand.forEach((item) => {
            formData.append(Object.keys(item)[0], item[Object.keys(item)[0]]);
          });
        }
        this.axios({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          method: 'post',
          url: this.url,
          hostType: Number(this.isOpenUploadImg) === 1 ? 'upload' : null,
          params: formData,
        }).then((res) => {
          if (!Number(res.code)) {
            const { data } = res;
            const fileName = data.filenameStr
              ? data.filenameStr
              : data.filename;
            const name = data.name || this.name;
            this.$emit('uploadFinish', {
              url: data.base_image_url + fileName,
              imgSrc: data.filename,
              fileName,
              name,
            });
            e.target.value = '';
          }
        });
      }
    },
  },
};
</script>

<style scoped lang='stylus'>
.input_upload_file{
  opacity: 0;
}
.upload-div{
  width:100%;
  height:100%;
  position: absolute;
  top:0;
  opacity: 0;
  z-index: 3;
  cursor: pointer;
}
</style>
