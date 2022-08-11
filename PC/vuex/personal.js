/**
 * Created by wangxiaobo on 18/12/19.
 */
import axios from '@/api/http/axios';

const MODIFYNICKNAME = 'MODIFYNICKNAME';
const RESETPASSWORD = 'RESETPASSWORD';
const SENDSMSCODE = 'SENDSMSCODE';
const BINDEMAIL = 'BINDEMAIL';
const SENDEMAILCODE = 'SENDEMAILCODE';
const EMAILUPDATE = 'EMAILUPDATE';
const MOBILEUPDATE = 'MOBILEUPDATE';
const TOOPENGOOGLEAUTHENTICATOR = 'TOOPENGOOGLEAUTHENTICATOR';
const GOOGLEVERIFY = 'GOOGLEVERIFY';
const AUTHREALNAME = 'AUTHREALNAME';
const CLOSEGOOGLEVERIFY = 'CLOSEGOOGLEVERIFY';
const CLOSEMOBILEVERIFY = 'CLOSEMOBILEVERIFY';
const MOBILEBINDSAVE = 'MOBILEBINDSAVE';
const OPENMOBILEVERIFY = 'OPENMOBILEVERIFY';
const LOGINHISTORY = 'LOGINHISTORY';
const SETTINGHISTORY = 'SETTINGHISTORY';
const UPDATEFEECOINOPEN = 'UPDATEFEECOINOPEN';
const INVITEINFOLIST = 'INVITEINFOLIST';
const CREATEOPENAPI = 'CREATEOPENAPI';
const MYAPILIST = 'MYAPILIST';
const DELETEOPENAPI = 'DELETEOPENAPI';
const SETAPITOKEN = 'SETAPITOKEN';
const OPENAPIONE = 'OPENAPIONE';
const UPDATEOPENAPI = 'UPDATEOPENAPI';
const SETIP = 'SETIP';
const SETLABEL = 'SETLABEL';
const SETMODIFYAPISHOW = 'SETMODIFYAPISHOW';
const OTCPAYMENTADD = 'OTCPAYMENTADD';
const OTCPAYMENTFIND = 'OTCPAYMENTFIND';
const OTCPAYMENTDELETE = 'OTCPAYMENTDELETE';
const SETPAYMENT = 'SETPAYMENT';
const OTCPAYMENTUPDATE = 'OTCPAYMENTUPDATE';
const OTCCAPITALPASSWORDSET = 'OTCCAPITALPASSWORDSET';
const OTCCAPITALPASSWORDRESET = 'OTCCAPITALPASSWORDRESET';
const OTCPAYMENTOPEN = 'OTCPAYMENTOPEN';
const OTCPERSONADS = 'OTCPERSONADS';
const OTCCLOSEWANTED = 'OTCCLOSEWANTED';
const OTCPERSONRELATIONSHIP = 'OTCPERSONRELATIONSHIP';
const KRWGETUSERBANK = 'KRWGETUSERBANK';
const EXCCKYCCONFIG = 'EXCCKYCCONFIG';

export default {
  state: {
    modifyNickName: null,
    resetPassword: null,
    sendSmsCode: null,
    bindEmail: null,
    sendEmailCode: null,
    emailUpdate: null,
    mobileUpdate: null,
    toopenGoogleAuthenticator: null,
    googleVerify: null,
    authRealname: null,
    closeGoogleVerify: null,
    closeMobileVerify: null,
    mobileBindSave: null,
    openMobileVerify: null,
    loginHistory: null,
    settingHistory: null,
    updateFeeCoinOpen: null,
    inviteInfoList: null,
    createOpenApi: null,
    myApiList: null,
    deleteOpenApi: null,
    apiToken: null,
    openApiOne: null,
    updateOpenApi: null,
    apiIp: null,
    apiLabel: null,
    otcPaymentAdd: null,
    otcPaymentFind: null,
    otcPaymentDelete: null,
    setPayment: null,
    otcPaymentUpdate: null,
    otcCapitalPasswordSet: null,
    otcCapitalPasswordReset: null,
    otcPaymentOpen: null,
    otcPersonAds: null,
    otcCloseWanted: null,
    otcPersonRelationship: null,
    krwUserBank: null,
    krwUserBankIsReady: false,
    modifyApiShow: false,
    exccKycConfig: null,
  },
  mutations: {
    [KRWGETUSERBANK](state, result) {
      state.krwUserBankIsReady = true;
      state.krwUserBank = result;
    },
    // 上传昵称
    [MODIFYNICKNAME](state, result) {
      state.modifyNickName = result;
    },
    [RESETPASSWORD](state, result) {
      state.resetPassword = result;
    },
    [SENDSMSCODE](state, result) {
      state.sendSmsCode = result;
    },
    [BINDEMAIL](state, result) {
      state.bindEmail = result;
    },
    [SENDEMAILCODE](state, result) {
      state.sendEmailCode = result;
    },
    [EMAILUPDATE](state, result) {
      state.emailUpdate = result;
    },
    [SETMODIFYAPISHOW](state, result) {
      state.modifyApiShow = result;
    },
    [MOBILEUPDATE](state, result) {
      state.mobileUpdate = result;
    },
    [TOOPENGOOGLEAUTHENTICATOR](state, result) {
      state.toopenGoogleAuthenticator = result;
    },
    [GOOGLEVERIFY](state, result) {
      state.googleVerify = result;
    },
    [AUTHREALNAME](state, result) {
      state.authRealname = result;
    },
    [CLOSEGOOGLEVERIFY](state, result) {
      state.closeGoogleVerify = result;
    },
    [CLOSEMOBILEVERIFY](state, result) {
      state.closeMobileVerify = result;
    },
    [MOBILEBINDSAVE](state, result) {
      state.mobileBindSave = result;
    },
    [OPENMOBILEVERIFY](state, result) {
      state.openMobileVerify = result;
    },
    [LOGINHISTORY](state, result) {
      state.loginHistory = result;
    },
    [SETTINGHISTORY](state, result) {
      state.settingHistory = result;
    },
    [UPDATEFEECOINOPEN](state, result) {
      state.updateFeeCoinOpen = result;
    },
    [INVITEINFOLIST](state, result) {
      state.inviteInfoList = result;
    },
    [CREATEOPENAPI](state, result) {
      state.createOpenApi = result;
    },
    [MYAPILIST](state, result) {
      state.myApiList = result;
    },
    [DELETEOPENAPI](state, result) {
      state.deleteOpenApi = result;
    },
    [SETAPITOKEN](state, result) {
      state.apiToken = result;
    },
    [OPENAPIONE](state, result) {
      state.openApiOne = result;
    },
    [UPDATEOPENAPI](state, result) {
      state.updateOpenApi = result;
    },
    [SETIP](state, result) {
      state.apiIp = result;
    },
    [SETLABEL](state, result) {
      state.apiLabel = result;
    },
    [OTCPAYMENTADD](state, result) {
      state.otcPaymentAdd = result;
    },
    [OTCPAYMENTFIND](state, result) {
      state.otcPaymentFind = result;
    },
    [OTCPAYMENTDELETE](state, result) {
      state.otcPaymentDelete = result;
    },
    [SETPAYMENT](state, result) {
      state.setPayment = result;
    },
    [OTCPAYMENTUPDATE](state, result) {
      state.otcPaymentUpdate = result;
    },
    [OTCCAPITALPASSWORDSET](state, result) {
      state.otcCapitalPasswordSet = result;
    },
    [OTCCAPITALPASSWORDRESET](state, result) {
      state.otcCapitalPasswordReset = result;
    },
    [OTCPAYMENTOPEN](state, result) {
      state.otcPaymentOpen = result;
    },
    [OTCPERSONADS](state, result) {
      state.otcPersonAds = result;
    },
    [OTCCLOSEWANTED](state, result) {
      state.otcCloseWanted = result;
    },
    [OTCPERSONRELATIONSHIP](state, result) {
      state.otcPersonRelationship = result;
    },
    [EXCCKYCCONFIG](state, result) {
      state.exccKycConfig = result;
    },
  },
  actions: {
    krwGetUserBank({ commit }) {
      axios({
        url: '/user/bank/get',
        method: 'post',
      }).then((data) => {
        if (Number(data.code) === 0) {
          commit('KRWGETUSERBANK', data.data);
        }
      });
    },
    // 修改昵称
    modifyNickName({ commit }, info) {
      axios({
        url: this.state.url.common.modify_nick_name,
        method: 'post',
        params: info,
      }).then((data) => {
        if (Number(data.code) === 0) {
          const Info = { msg: data.msg, text: 'success' };
          commit('MODIFYNICKNAME', Info);
        } else {
          const Info = { msg: data.msg, text: 'error' };
          commit('MODIFYNICKNAME', Info);
        }
      });
    },
    // 修改状态
    resetType({ commit }) {
      commit('MODIFYNICKNAME', null);
      commit('RESETPASSWORD', null);
      commit('SENDSMSCODE', null);
      commit('SENDEMAILCODE', null);
      commit('MOBILEUPDATE', null);
      commit('GOOGLEVERIFY', null);
      commit('AUTHREALNAME', null);
      commit('CLOSEGOOGLEVERIFY', null);
      commit('CLOSEMOBILEVERIFY', null);
      commit('MOBILEBINDSAVE', null);
      commit('OPENMOBILEVERIFY', null);
      commit('UPDATEFEECOINOPEN', null);
      commit('DELETEOPENAPI', null);
      commit('CREATEOPENAPI', null);
      commit('UPDATEOPENAPI', null);
      commit('OTCPAYMENTADD', null);
      commit('OTCPAYMENTFIND', null);
      commit('OTCPAYMENTDELETE', null);
      commit('OTCPAYMENTUPDATE', null);
      commit('OTCCAPITALPASSWORDSET', null);
      commit('OTCCAPITALPASSWORDRESET', null);
      commit('OTCPAYMENTOPEN', null);
      commit('OTCCLOSEWANTED', null);
      commit('EXCCKYCCONFIG', null);
    },
    // 修改登录密码
    resetPassword({ commit }, info) {
      axios({
        url: this.state.url.common.reset_password,
        method: 'post',
        params: info,
      }).then((data) => {
        if (data.code === '0') {
          const Info = { msg: data.msg, text: 'success' };
          commit('RESETPASSWORD', Info);
        } else {
          const Info = { code: data.code, msg: data.msg, text: 'error' };
          commit('RESETPASSWORD', Info);
        }
      });
    },
    // 发送短信验证码
    sendSmsCode({ commit }, info) {
      axios({
        url: this.state.url.common.sms_code,
        method: 'post',
        params: info,
      }).then((data) => {
        if (data.code === '0') {
          const Info = { msg: data.msg, text: 'success' };
          commit('SENDSMSCODE', Info);
        } else {
          const Info = { msg: data.msg, text: 'error' };
          commit('SENDSMSCODE', Info);
        }
      });
    },
    // 发送邮箱验证码
    sendEmailCode({ commit }, info) {
      axios({
        url: this.state.url.common.email_code,
        method: 'post',
        params: info,
      }).then((data) => {
        if (data.code === '0') {
          const Info = { msg: data.msg, text: 'success' };
          commit('SENDEMAILCODE', Info);
        } else {
          const Info = { msg: data.msg, text: 'error' };
          commit('SENDEMAILCODE', Info);
        }
      });
    },
    // 绑定邮箱
    bindEmail({ commit }, info) {
      axios({
        url: this.state.url.common.bind_email,
        method: 'post',
        params: info,
      }).then((data) => {
        if (data.code === '0') {
          const Info = { msg: data.msg, text: 'success' };
          commit('BINDEMAIL', Info);
        } else {
          const Info = { code: data.code, msg: data.msg, text: 'error' };
          commit('BINDEMAIL', Info);
        }
      });
    },
    // 修改绑定邮箱
    emailUpdate({ commit }, info) {
      axios({
        url: this.state.url.common.email_update,
        method: 'post',
        params: info,
      }).then((data) => {
        if (data.code === '0') {
          const Info = { msg: data.msg, text: 'success' };
          commit('EMAILUPDATE', Info);
        } else {
          const Info = { code: data.code, msg: data.msg, text: 'error' };
          commit('EMAILUPDATE', Info);
        }
      });
    },
    // 修改手机号
    mobileUpdate({ commit }, info) {
      axios({
        url: this.state.url.common.mobile_update,
        method: 'post',
        params: info,
      }).then((data) => {
        if (data.code === '0') {
          const Info = { msg: data.msg, text: 'success' };
          commit('MOBILEUPDATE', Info);
        } else {
          const Info = { code: data.code, msg: data.msg, text: 'error' };
          commit('MOBILEUPDATE', Info);
        }
      });
    },
    // 获取google二维码
    toopenGoogleAuthenticator({ commit }, info) {
      axios({
        url: this.state.url.common.toopen_google_authenticator,
        method: 'post',
        params: info,
      }).then((data) => {
        if (data.code === '0') {
          // const Info = { msg: data.msg, text: 'success' };
          commit('TOOPENGOOGLEAUTHENTICATOR', data.data);
        }
      });
    },
    googleVerify({ commit }, info) {
      axios({
        url: this.state.url.common.google_verify,
        method: 'post',
        params: info,
      }).then((data) => {
        if (data.code === '0') {
          const Info = { msg: data.msg, text: 'success' };
          commit('GOOGLEVERIFY', Info);
        } else {
          const Info = { msg: data.msg, text: 'error' };
          commit('GOOGLEVERIFY', Info);
        }
      });
    },
    authRealname({ commit }, datas) {
      const { kycFlag, info } = datas;
      axios({
        url: kycFlag ? 'kyc/yushan/auth' : this.state.url.common.auth_realname,
        method: 'post',
        params: info,
      }).then((data) => {
        if (data.code === '0') {
          const Info = { msg: data.msg, text: 'success' };
          commit('AUTHREALNAME', Info);
        } else {
          const Info = { msg: data.msg, text: 'error' };
          commit('AUTHREALNAME', Info);
        }
      });
    },
    closeGoogleVerify({ commit }, info) {
      axios({
        url: this.state.url.common.close_google_verify,
        method: 'post',
        params: info,
      }).then((data) => {
        if (data.code === '0') {
          const Info = { msg: data.msg, text: 'success' };
          commit('CLOSEGOOGLEVERIFY', Info);
        } else {
          const Info = { code: data.code, msg: data.msg, text: 'error' };
          commit('CLOSEGOOGLEVERIFY', Info);
        }
      });
    },
    closeMobileVerify({ commit }, info) {
      axios({
        url: this.state.url.common.close_mobile_verify,
        method: 'post',
        params: info,
      }).then((data) => {
        if (data.code === '0') {
          const Info = { msg: data.msg, text: 'success' };
          commit('CLOSEMOBILEVERIFY', Info);
        } else {
          const Info = { code: data.code, msg: data.msg, text: 'error' };
          commit('CLOSEMOBILEVERIFY', Info);
        }
      });
    },
    mobileBindSave({ commit }, info) {
      axios({
        url: this.state.url.common.mobile_bind_save,
        method: 'post',
        params: info,
      }).then((data) => {
        if (data.code === '0') {
          const Info = { msg: data.msg, text: 'success' };
          commit('MOBILEBINDSAVE', Info);
        } else {
          const Info = { code: data.code, msg: data.msg, text: 'error' };
          commit('MOBILEBINDSAVE', Info);
        }
      });
    },
    openMobileVerify({ commit }, info) {
      axios({
        url: this.state.url.common.open_mobile_verify,
        method: 'post',
        params: info,
      }).then((data) => {
        if (data.code === '0') {
          const Info = { msg: data.msg, text: 'success' };
          commit('OPENMOBILEVERIFY', Info);
        } else {
          const Info = { msg: data.msg, text: 'error' };
          commit('OPENMOBILEVERIFY', Info);
        }
      });
    },
    loginHistory({ commit }, info) {
      axios({
        url: this.state.url.common.login_history,
        method: 'post',
        params: info,
      }).then((data) => {
        if (data.code === '0') {
          commit('LOGINHISTORY', data.data);
        } else {
          commit('LOGINHISTORY', data);
        }
      });
    },
    settingHistory({ commit }, info) {
      axios({
        url: this.state.url.common.setting_history,
        method: 'post',
        params: info,
      }).then((data) => {
        if (data.code === '0') {
          commit('SETTINGHISTORY', data.data);
        } else {
          commit('SETTINGHISTORY', data);
        }
      });
    },
    updateFeeCoinOpen({ commit }, info) {
      axios({
        url: this.state.url.common.update_fee_coin_open,
        method: 'post',
        params: info,
      }).then((data) => {
        if (data.code === '0') {
          const Info = { msg: data.msg, text: 'success' };
          commit('UPDATEFEECOINOPEN', Info);
        } else {
          const Info = { msg: data.msg, text: 'error' };
          commit('UPDATEFEECOINOPEN', Info);
        }
      });
    },
    inviteInfoList({ commit }, info) {
      axios({
        url: this.state.url.common.invite_info_list,
        method: 'post',
        params: info,
      }).then((data) => {
        if (data.code === '0') {
          const Info = data.data;
          commit('INVITEINFOLIST', Info);
        }
      });
    },
    createOpenApi({ commit }, info) {
      axios({
        url: this.state.url.common.create_open_api,
        method: 'post',
        params: info,
      }).then((data) => {
        if (data.code === '0') {
          const Info = { msg: data.msg, text: 'success', data: data.data };
          commit('CREATEOPENAPI', Info);
        } else {
          const Info = { msg: data.msg, text: 'error' };
          commit('CREATEOPENAPI', Info);
        }
      });
    },
    myApiList({ commit }, info) {
      axios({
        url: this.state.url.common.my_api_list,
        method: 'post',
        params: info,
      }).then((data) => {
        if (data.code === '0') {
          commit('MYAPILIST', data.data);
        }
      });
    },
    deleteOpenApi({ commit }, info) {
      axios({
        url: this.state.url.common.delete_open_api,
        method: 'post',
        params: info,
      }).then((data) => {
        if (data.code === '0') {
          const Info = { msg: data.msg, text: 'success' };
          commit('DELETEOPENAPI', Info);
        } else {
          const Info = { msg: data.msg, text: 'error' };
          commit('DELETEOPENAPI', Info);
        }
      });
    },
    setApiToken({ commit }, info) {
      commit('SETAPITOKEN', info);
    },
    setIp({ commit }, info) {
      commit('SETIP', info);
    },
    setLabel({ commit }, info) {
      commit('SETLABEL', info);
    },
    setModifyApiShow({ commit }, type) {
      commit('SETMODIFYAPISHOW', type);
    },
    openApiOne({ commit }, info) {
      axios({
        url: this.state.url.common.open_api_one,
        method: 'post',
        params: info,
      }).then((data) => {
        if (data.code === '0') {
          const Info = { msg: data.msg, text: 'success', data: data.data };
          commit('OPENAPIONE', Info);
        } else {
          const Info = { code: data.code, msg: data.msg, text: 'error' };
          commit('OPENAPIONE', Info);
        }
      });
    },
    updateOpenApi({ commit }, info) {
      axios({
        url: this.state.url.common.update_open_api,
        method: 'post',
        params: info,
      }).then((data) => {
        if (data.code === '0') {
          const Info = { msg: data.msg, text: 'success' };
          commit('UPDATEOPENAPI', Info);
        } else {
          const Info = { msg: data.msg, text: 'error' };
          commit('UPDATEOPENAPI', Info);
        }
      });
    },
    otcPaymentAdd({ commit }, info) {
      axios({
        url: this.state.url.common.otc_payment_add,
        method: 'post',
        params: info,
        hostType: 'otc',
      }).then((data) => {
        if (Number(data.code) === 0) {
          const Info = { msg: data.msg, text: 'success' };
          commit('OTCPAYMENTADD', Info);
        } else {
          const Info = { msg: data.msg, text: 'error' };
          commit('OTCPAYMENTADD', Info);
        }
      });
    },
    otcPaymentFind({ commit }, info) {
      axios({
        url: this.state.url.common.otc_payment_find,
        method: 'post',
        params: info,
        hostType: 'otc',
      }).then((data) => {
        if (Number(data.code) === 0) {
          const Info = { data: data.data };
          commit('OTCPAYMENTFIND', Info);
        }
      });
    },
    otcPaymentDelete({ commit }, info) {
      axios({
        url: this.state.url.common.otc_payment_delete,
        method: 'post',
        params: info,
        hostType: 'otc',
      }).then((data) => {
        if (Number(data.code) === 0) {
          const Info = { msg: data.msg, text: 'success' };
          commit('OTCPAYMENTDELETE', Info);
        } else {
          const Info = { msg: data.msg, text: 'error' };
          commit('OTCPAYMENTDELETE', Info);
        }
      });
    },
    setPayment({ commit }, info) {
      commit('SETPAYMENT', info);
    },
    otcPaymentUpdate({ commit }, info) {
      axios({
        url: this.state.url.common.otc_payment_update,
        method: 'post',
        params: info,
        hostType: 'otc',
      }).then((data) => {
        if (Number(data.code) === 0) {
          const Info = { msg: data.msg, text: 'success' };
          commit('OTCPAYMENTUPDATE', Info);
        } else {
          const Info = { msg: data.msg, text: 'error' };
          commit('OTCPAYMENTUPDATE', Info);
        }
      });
    },
    otcCapitalPasswordSet({ commit }, info) {
      axios({
        url: this.state.url.common.otc_capital_password_set,
        method: 'post',
        params: info,
      }).then((data) => {
        if (Number(data.code) === 0) {
          const Info = { msg: data.msg, text: 'success' };
          commit('OTCCAPITALPASSWORDSET', Info);
        } else {
          const Info = { msg: data.msg, text: 'error' };
          commit('OTCCAPITALPASSWORDSET', Info);
        }
      });
    },
    otcCapitalPasswordReset({ commit }, info) {
      axios({
        url: this.state.url.common.otc_capital_password_reset,
        method: 'post',
        params: info,
      }).then((data) => {
        if (Number(data.code) === 0) {
          const Info = { msg: data.msg, text: 'success' };
          commit('OTCCAPITALPASSWORDRESET', Info);
        } else {
          const Info = { msg: data.msg, text: 'error' };
          commit('OTCCAPITALPASSWORDRESET', Info);
        }
      });
    },
    otcPaymentOpen({ commit }, info) {
      axios({
        url: this.state.url.common.otc_payment_open,
        method: 'post',
        params: info,
        hostType: 'otc',
      }).then((data) => {
        if (Number(data.code) === 0) {
          const Info = { msg: data.msg, text: 'success' };
          commit('OTCPAYMENTOPEN', Info);
        } else {
          const Info = { msg: data.msg, text: 'error' };
          commit('OTCPAYMENTOPEN', Info);
        }
      });
    },
    otcPersonAds({ commit }, info) {
      axios({
        url: this.state.url.common.otc_person_ads,
        method: 'post',
        params: info,
        hostType: 'otc',
      }).then((data) => {
        if (Number(data.code) === 0) {
          const Info = { data: data.data };
          commit('OTCPERSONADS', Info);
        }
      });
    },
    otcCloseWanted({ commit }, info) {
      axios({
        url: this.state.url.common.otc_close_wanted,
        method: 'post',
        params: info,
        hostType: 'otc',
      }).then((data) => {
        if (Number(data.code) === 0) {
          const Info = { msg: data.msg, text: 'success' };
          commit('OTCCLOSEWANTED', Info);
        } else {
          const Info = { msg: data.msg, text: 'error' };
          commit('OTCCLOSEWANTED', Info);
        }
      });
    },
    otcPersonRelationship({ commit }, info) {
      axios({
        url: this.state.url.common.otc_person_relationship,
        method: 'post',
        params: info,
        hostType: 'otc',
      }).then((data) => {
        if (Number(data.code) === 0) {
          const Info = { data: data.data };
          commit('OTCPERSONRELATIONSHIP', Info);
        }
      });
    },
    exccAuthRealname({ commit }, info) {
      axios({
        url: this.state.url.common.excc_auth_realname,
        method: 'post',
        params: info,
      }).then((data) => {
        if (data.code === '0') {
          const Info = { msg: data.msg, text: 'success' };
          commit('AUTHREALNAME', Info);
        } else {
          const Info = { msg: data.msg, text: 'error' };
          commit('AUTHREALNAME', Info);
        }
      });
    },
    singPassVerifyAuth({ commit }, info) {
      axios({
        url: this.state.url.common.singPass_verifyAuth,
        method: 'post',
        params: info,
      }).then((data) => {
        if (data.code === '0') {
          const Info = { msg: data.msg, text: 'success' };
          commit('AUTHREALNAME', Info);
        } else {
          const Info = { msg: data.msg, text: 'error' };
          commit('AUTHREALNAME', Info);
        }
      });
    },
    exccKycConfig({ commit }, info) {
      axios({
        url: this.state.url.common.kyc_config,
        method: 'post',
        params: info,
      }).then((data) => {
        if (data.code === '0') {
          const Info = { data: data.data, msg: data.msg, text: 'success' };
          commit('EXCCKYCCONFIG', Info);
        } else {
          const Info = { msg: data.msg, text: 'error' };
          commit('EXCCKYCCONFIG', Info);
        }
      });
    },
  },
};
