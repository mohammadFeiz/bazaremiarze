import React, { Component, useState } from 'react';
import Main from './pages/main/main';
import PageError from './components/page-error';
import Landing from './components/landing';
import AIOLogin from './npm/aio-login/aio-login';
import AIOLog from 'aio-log';
import AIOService from 'aio-service';
import getApiFunctions from './apis/apis.ts';
import './App.css';
import './theme.css';
import Splash from './components/spalsh/splash';
import { I_AIOLogin_checkToken, I_AIOLogin_class, I_AIOLogin_mode, I_AIOLogin_model, I_AIOLogin_onSubmit, I_AIOLogin_props, I_AIOLogin_renderApp, I_AIOLogin_renderLogin, I_AIOLogin_renderSplash, I_AIOService_class, I_AIOService_onCatch, I_B1Info, I_Report_parameter, I_msfReport, I_state_backOffice, I_state_backOffice_accessPhoneNumber, I_updateProfile, I_userInfo } from './types';
type I_getBaseUrl = () => string
const getBaseUrl: I_getBaseUrl = function () {
  //return "https://apimy.burux.com/api/v1";
  let url = window.location.href;
  if (url.indexOf('bazar') !== -1) { return "https://apimy.burux.com/api/v1"; }
  else if (url.indexOf('bbeta') !== -1) { return "https://retailerapp.bbeta.ir/api/v1"; }
  else { return "https://retailerapp.bbeta.ir/api/v1"; }
}
type I_getUrlUserId = () => string | undefined;
const getUrlUserId: I_getUrlUserId = function () {
  let userId:string;
  try { userId = new URL(window.location.href).searchParams.get("pn").toString() }
  catch { userId = undefined }
  return userId;
}
type I_Report = (parameter: I_Report_parameter) => void;
const Report: I_Report = function (parameter) {
  let { phoneNumber, userId, apis, actionName } = parameter;
  let res = { actionName, phoneNumber, userId }
  apis.request({
    api: 'backOffice.report', loading: false, message: { error: false },
    parameter: res, description: 'ارسال گزارش'
  })
}

export default function App() {
  let [baseUrl] = useState<string>(getBaseUrl());
  let [urlUserId] = useState<string>(getUrlUserId());
  
  let [Logger] = useState(new AIOLog('bmlog'))
  let [showLanding,setShowLanding] = useState<boolean>(true);
  let [pageError, setPageError] = useState<{ text: string, subtext: string }>()
  let [backOffice,setBackOffice] = useState<I_state_backOffice | undefined>()
  let [userInfo, setUserInfo] = useState<I_userInfo | undefined>()
  let [b1Info, setB1Info] = useState<I_B1Info | undefined>()
  let [apis] = useState<I_AIOService_class>(new AIOService({ getApiFunctions,getState:()=>{return {Logger}}, baseUrl, id: 'bazaremiarzeapis' }))
  const onSubmit: I_AIOLogin_onSubmit = async (model: I_AIOLogin_model, mode: I_AIOLogin_mode) => {
    if (mode === 'OTPNumber') { onSubmit_OTPNumber(model) }
    else if (mode === 'OTPCode') { onSubmit_OTPCode(model, mode) }
    else if (mode === 'phoneNumber') { onSubmit_phoneNumber(model, mode) }
    else if (mode === 'register') { onSubmit_register(model) }
  }
  const checkToken: I_AIOLogin_checkToken = async (token) => {
    let backOffice = await apis.request({ api: 'login.getBackOffice', parameter: apis, description: 'دریافت تنظیمات اولیه', loading: false })
    if (typeof backOffice === 'object') {
      setBackOffice(backOffice)
      if (!token) { return false }
      let isTokenValid = await apis.request({ api: 'login.checkToken',description:'دریافت اطلاعات ورود', parameter: token, loading: false, onCatch: () => 'خطای 10037.این کد خطا را به پشتیبانی اعلام کنید' })
      if (isTokenValid === false) { return false }
      let userInfo = Login.getStorage('userInfo')
      if (typeof userInfo !== 'object' || !userInfo.cardCode || typeof userInfo.cardCode !== 'string') {
        return false;
      }
      else {
        let b1Info = await getB1Info(userInfo);
        setB1Info(b1Info);
        setUserInfo(userInfo);
        msfReport({ actionName: 'login by cache', actionId: 9, result: 'success', eventName: 'action', tagName: 'user authentication' }, userInfo.phoneNumber)
        return true
      } 
    }
  }
  function renderApp({ token,appState }){
    apis.setToken(token);
    return <Main {...appState} />
  }
  const renderLogin: I_AIOLogin_renderLogin = (loginForm) => <Splash content={() => loginForm} />
  const renderSplash: I_AIOLogin_renderSplash = () => <Splash loading={true} />
  let AIOLoginProps: I_AIOLogin_props = {
    id: 'bazarmiarezelogin', modes: ['OTPNumber', 'phoneNumber'], timer: 5, otpLength: 4, userId:urlUserId, splashTime: 2500, 
    onSubmit,checkToken,renderApp, renderLogin, renderSplash,
    register: {
      type: 'mode', text: 'ثبت نام در بازار می ارزه',
      fields: [
        ['*firstname', '*lastname'],
        ['*storeName_text_نام فروشگاه', { input: { type: 'text' }, field: 'value.phone', label: 'شماره تلفن ثابت', validations: [['required'], ['length>', 10]] }],
        ['password', 'repassword'], '*location', '*address', ['*state', '*city']
      ]
    }
  }
  let [Login] = useState<I_AIOLogin_class>(new AIOLogin(AIOLoginProps))
  
  const onSubmit_onCatch: I_AIOService_onCatch = (error) => {
    let result: string | undefined;
    try { result = error.response.data.Message }
    catch { setPageError({ text: 'سرویس دهنده در دسترس نمی باشد', subtext: 'Users/FirstStep' }) }
    return result;
  }
  async function onSubmit_OTPNumber(model: I_AIOLogin_model){
    let res = await apis.request({ api: 'login.OTPNumber', parameter: model.login.userId, onCatch: onSubmit_onCatch, loading: false, description: 'ارسال شماره همراه' })
    if (typeof res === 'object') {
      //در اوتی پی بعد از ارسال شماره یک آی دی دریافت می شود که در ای پی آی او تی پی کد مورد نیاز است پس ما این آی دی رو در دیس ذخیره می کنیم
      Login.setStorage('userInfo',{id:res.id});
      Login.setStorage('userId', model.login.userId);
      Login.setMode('OTPCode')
    }
  }
  const onSubmit_OTPCode = async (model: I_AIOLogin_model, mode: I_AIOLogin_mode) => {
    let {id} = Login.getStorage('userInfo') 
    let userInfo = await apis.request({ api: 'login.loginByOTPCode', onCatch: onSubmit_onCatch, parameter: { id, otpCode: model.login.password }, loading: false, description: 'ارسال کد یکبار مصرف' })
    handleLoginResponse(userInfo, model.login.userId, mode)
  }
  const onSubmit_phoneNumber = async (model: I_AIOLogin_model, mode: I_AIOLogin_mode) => {
    let userInfo = await apis.request({ api: 'login.loginByPhoneNumber', onCatch: onSubmit_onCatch, parameter: { phoneNumber: model.login.userId, password: model.login.password }, loading: false, description: 'ورود با شماره همراه و رمز عبور' })
    handleLoginResponse(userInfo, model.login.userId, mode)
  }
  const handleLoginResponse = async (userInfo:I_userInfo, userId, mode) => {
    if (typeof userInfo === 'string') {
      msfReport({
        actionName: `login by ${mode}`, actionId: mode === 'OTPCode' ? 0 : 1, result: 'unsuccess',
        message: userInfo, tagName: 'user authentication', eventName: 'action'
      }, { userId });
      return;
    }
    let { accessToken } = userInfo;
    let token = accessToken.access_token;
    let b1Info:I_B1Info = await getB1Info(userInfo);
    if (!b1Info) { return }
    let registered = await apis.request({ api: 'login.checkIsRegistered', parameter: userId, loading: false, description: 'دریافت اطلاعات ثبت نام' });
    if (registered) {
      Login.setStorage('userInfo', userInfo);
      Login.setStorage('userId', userId);
      Login.setStorage('token', token);
      Login.setMode('auth');
    }
    else { Login.setMode('register'); }
    msfReport({ actionName: `login by ${mode}`, actionId: mode === 'OTPCode' ? 0 : 1, result: 'success', tagName: 'user authentication', eventName: 'action' }, userId)
    setUserInfo(userInfo);
    setB1Info(b1Info)
  }
  
  const onSubmit_register = async (model: I_AIOLogin_model) => {
    msfReport({ actionName: `register`, actionId: 3, result: 'success', tagName: 'user authentication', eventName: 'action' }, { phoneNumber: model.login.userId })
    updateProfile(model, 'register', () => window.location.reload())
  }
  const msfReport: I_msfReport = (obj, p) => {
    let { id = p.userId,phoneNumber = p.phoneNumber } = userInfo || {};
    let { actionName, actionId, eventName, targetName, targetId, tagName } = obj
    Report({
      apis, userId: id, phoneNumber, actionName, actionId, eventName, targetName, targetId, tagName
    })
  }
  
  const getB1Info = async (userInfo:I_userInfo) => {
    return await apis.request({ api: 'login.getB1Info', parameter: {userInfo,Logger}, description: 'دریافت اطلاعات b1', loading: false })
  }
  const updateProfile:I_updateProfile = async (loginModel, mode, callback) => {
    let model = {}, description: string;
    if (mode === 'register') { model = loginModel.register; description = 'ثبت نام' }
    else if (mode === 'profile') { model = loginModel.profile; description = 'ویرایش حساب کاربری' }
    else if (mode === 'location') { model = loginModel.profile; description = 'ثبت موقعیت جغرافیایی' }
    let oldUserInfo = (userInfo || {}) as I_userInfo;
    let newUserInfo: I_userInfo = { ...oldUserInfo, ...model}
    let res = await apis.request({
      api: 'login.profile', parameter: { model: newUserInfo, mode }, description, loading: false,
      onCatch: (error) => {
        let { response, message, Message } = error;
        if (response && response.data) {
          let { message, Message } = response.data;
          if (message || Message) { return message || Message }
        }
        return message || Message || 'خطای نا مشخص onCatch'
      },
      getError: (response) => {
        if (!response.data.isSuccess) {
          let { message, Message } = response.data;
          return message || Message || 'خطای نا مشخص onError'
        }
      }
    })
    if (typeof res === 'object') {
      setUserInfo(newUserInfo);
      Login.setStorage('userInfo', newUserInfo)
      callback()
    }
  }
  if (pageError) { return <PageError {...pageError} /> }
  if (showLanding && backOffice && backOffice.landing && backOffice.active_landing) { return <Landing onClose={() => setShowLanding(false)} items={backOffice.landing} /> }
  let appState = { apis, Login, Logger, userInfo,b1Info, backOffice, baseUrl, updateProfile, msfReport };
  return Login.render({appState})
}

