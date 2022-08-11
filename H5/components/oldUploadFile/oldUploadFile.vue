// Created by 王晓波.
// 上传图片
// *****************************
<template>
  <div>
    <input class="input_upload_file" type="file"
           :class="className"
           :accept="formatValue"
           ref="upload"
           @change="tellFun"/>
    <div class="upload-div"
         @click="uploadClick"></div>
    <div v-if="isApp && isAndroid" @click="isAndroidUpload" class="android-upload"></div>
  </div>
</template>

<script>
import { callApp } from '@/utils';

export default {
  name: 'c-h-oldUploadFile',
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
  computed: {
    isApp() {
      return this.$store.state.baseData.isApp;
    },
    isAndroid() {
      if (this.$route.query && this.$route.query.ua) {
        return (this.$route.query.ua === 'android');
      }
      return false;
    },
  },
  watch: {

  },
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
          formData.append('isWaterMark', 1);
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
          hostType: (Number(this.isOpenUploadImg) === 1) ? 'upload' : null,
          params: formData,
        }).then((res) => {
          if (!Number(res.code)) {
            const { data } = res;
            const fileName = data.filenameStr ? data.filenameStr : data.filename;
            const name = data.name || this.name;
            this.$emit('uploadFinish', { url: data.base_image_url + fileName, fileName, name });
            e.target.value = '';
          } else {
            this.$bus.$emit('tip', { text: res.msg, type: 'error' });
          }
        });
      }
    },
    isAndroidUpload() {
      callApp({
        name: 'uploadExchange',
        params: {
          routerName: 'uploadImg',
          index: this.name,
        },
      }).then(() => {
        this.$emit('tellMessage', {
          name: this.name,
        });
      });
      callApp({
        name: 'exchangeUploadInfo',
        params: {
          routerName: 'uploadImg',
          index: this.name,
        },
      }).then((res) => {
        if (res.filename) {
          const fileName = res.filenameStr ? res.filenameStr : res.filename;
          const name = res.name || this.name;
          this.$emit('uploadFinish', { url: res.base_image_url + fileName, fileName, name });
        } else if (res.code && res.code !== '0') {
          this.$emit('tellMessage', {
            type: 'error',
            name: this.name,
          });
          if (res.msg) {
            this.$bus.$emit('tip', { text: res.msg, type: 'error' });
          }
        }
      });
    },
  },
};
</script>

<style scoped lang="stylus">
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
.android-upload{
  width:100%;
  height:100%;
  position: absolute;
  top:0;
  z-index: 4;
  cursor: pointer;
}
</style>
