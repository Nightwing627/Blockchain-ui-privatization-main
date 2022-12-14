export default {
  state: {
    ip: '^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)($|(?!\\.$)\\.)){4}$', // ip正则
    verification: /^[0-9]{6}$/, // 验证码 谷歌/手机/邮箱
    nonEmpty: /[^~!$&.,]+/, // 非空验证（类型不限，位数非0）
    number: /^[0-9]+$/, // 数字正则验证 (数字0-9，位数不限)
    phone: /^[0-9]{7,}$/, // 手机号正则验证 (数字0-9，位数不限)
    passWord: /^(?![0-9_~!@#$%^&*()]+$)(?![a-zA-Z_~!@#$%^&*()]+$)[0-9A-Za-z_~!@#$%^&*()]{8,20}$/, // 密码正则（数字+字母，位数8～20位）
    email: /@+/,
    numbers: /^\d+(,\d\d\d)*.\d+$/, // 只能输入数字逗号小数点
  },
};
