import React, { Component, useState } from 'react';
import Main from './pages/main/main.tsx';
import PageError from './components/page-error';
import Landing from './components/landing';
import AIOLogin from './npm/aio-login/aio-login';
import AIOLog from 'aio-log';
import AIOService from './npm/aio-service/aio-service.js';
import getApiFunctions from './apis/apis.ts';
import './App.css';
import './theme.css';
import Splash from './components/spalsh/splash';
import {  I_AIOService_class, I_AIOService_onCatch, I_B1Info, I_Report_parameter, I_msfReport, I_state_backOffice, I_backOffice_accessPhoneNumber, I_updateProfile, I_userInfo } from './types';
import { I_AL_props,I_AIOLogin, I_AL_model } from './npm/aio-login/index.tsx';
type I_getBaseUrl = () => string
const getBaseUrl: I_getBaseUrl = function () {
  return "https://apimy.burux.com/api/v1";
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
  let [backOffice,setBackOffice] = useState<I_state_backOffice>()
  let [userInfo, setUserInfo] = useState<I_userInfo | undefined>()
  let [b1Info, setB1Info] = useState<I_B1Info | undefined>()
  let [apis] = useState<I_AIOService_class>(new AIOService({ getApiFunctions,getState:()=>{return {Logger}}, baseUrl, id: 'bazaremiarzeapis' }))
  const renderSplash = () => <Splash loading={true} />
  let AIOLoginProps:I_AL_props = {
    id: 'bazarmiarezelogin', modes: ['OTPNumber', 'phoneNumber'], timer: 5, otpLength: 4, userId:urlUserId, 
    splash:{time:2500,render:renderSplash},
    onSubmit:async (model, mode) => {
      if (mode === 'OTPNumber') { 
        let res = await apis.request({ api: 'login.OTPNumber', parameter: model.login.userId, onCatch: onSubmit_onCatch, loading: false, description: 'ارسال شماره همراه' })
        if (typeof res === 'object') {
          //در اوتی پی بعد از ارسال شماره یک آی دی دریافت می شود که در ای پی آی او تی پی کد مورد نیاز است پس ما این آی دی رو در دیس ذخیره می کنیم
          Login.setUserInfo({id:res.id});
          Login.setMode('OTPCode')
          return true
        }
        else {return false}
      }
      else if (mode === 'OTPCode' || mode === 'phoneNumber') {
        let api,description,parameter,userId,phoneNumber = model.login.userId;
        if(mode === 'OTPCode'){
          userId = Login.getUserInfo().id;
          api = 'login.loginByOTPCode'; description = 'ارسال کد یکبار مصرف'; parameter = { id:userId, otpCode: model.login.password }
        }
        else if(mode === 'phoneNumber'){
          api = 'login.loginByPhoneNumber'; description = 'ورود با شماره همراه و رمز عبور'; parameter = {phoneNumber:model.login.userId,password:model.login.password}
        }
        let userInfo:(I_userInfo | string) = await apis.request({ api, onCatch: onSubmit_onCatch, parameter, loading: false, description })
        if (typeof userInfo === 'string') {
          msfReport({
            actionName: `login by ${mode}`, actionId: mode === 'OTPCode' ? 0 : 1, result: 'unsuccess',
            message: userInfo, tagName: 'user authentication', eventName: 'action'
          }, { userId:model.login.userId });
          return false;
        }
        userInfo = fixUserInfo(userInfo)
        let { accessToken } = userInfo;
        let token = accessToken.access_token;
        let b1Info:I_B1Info = await getB1Info(userInfo);
        if (!b1Info) { return }
        Login.setUserInfo(userInfo);
        Login.setToken(token);
        msfReport({ actionName: `login by ${mode}`, actionId: mode === 'OTPCode' ? 0 : 1, result: 'success', tagName: 'user authentication', eventName: 'action' }, {userId,phoneNumber})
        setUserInfo(userInfo);
        setB1Info(b1Info)
        return true
      }
    },
    checkToken:async (token) => {
      let backOffice = await apis.request({ api: 'login.getBackOffice', parameter: {apis,Login}, description: 'دریافت تنظیمات اولیه', loading: false })
      if (typeof backOffice === 'object') {
        setBackOffice(backOffice)
        if (!token) { return false }
        let isTokenValid = await apis.request({ api: 'login.checkToken',description:'دریافت اطلاعات ورود', parameter: token, loading: false, onCatch: () => 'خطای 10037.این کد خطا را به پشتیبانی اعلام کنید' })
        if (isTokenValid === false) { return false }
        let userInfo = Login.getUserInfo()
        userInfo = fixUserInfo(userInfo)
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
    },
    renderApp:({ token,appState })=>{
      apis.setToken(token);
      return <Main {...appState} />
    }, 
    renderLogin:(loginForm) => <Splash content={() => loginForm} />,
    register: {
      registerType: 'auto',
      registerText:(place)=> {
        if(place === 'form title'){return 'ثبت نام'}
        if(place === 'submit button'){return 'ثبت نام در بازار می ارزه'}
      },
      checkIsRegistered:async ({userId,userInfo,token})=>{
        let res = await apis.request({
          api: 'login.checkIsRegistered',loading: false, 
          parameter: {phoneNumber:userId,Logger}, 
          description: 'دریافت اطلاعات ثبت نام' })
        return res;
      },
      registerFields: [
        ['*firstname', '*lastname'],
        ['*storeName_text_نام فروشگاه', { input: { type: 'text',justNumber:true }, field: 'value.register.phone', label: 'شماره تلفن ثابت', validations: [['required'], ['length>', 10]] }],
        ['password', 'repassword'], '*location', '*address', ['*state', '*city']
      ],
      onSubmitRegister:async (model) => {
        msfReport({ actionName: `register`, actionId: 3, result: 'success', tagName: 'user authentication', eventName: 'action' }, { phoneNumber: model.login.userId })
        let userInfo = await updateProfile(model, 'register')
        if(userInfo){Login.setUserInfo(userInfo); return true}
        else{return false}
      }
    }
  }
  let [Login] = useState<I_AIOLogin>(new AIOLogin(AIOLoginProps))
  function fixUserInfo(userInfo:I_userInfo){
    let type = typeof userInfo;
    if(type !== 'object' || type === null){return userInfo}
    if(typeof userInfo.latitude === 'string'){
      if(isNaN(+userInfo.latitude)){userInfo.latitude = undefined}
      else{userInfo.latitude = +userInfo.latitude}
    }
    if(typeof userInfo.longitude === 'string'){
      if(isNaN(+userInfo.longitude)){userInfo.longitude = undefined}
      else{userInfo.longitude = +userInfo.longitude}
    }
    return userInfo
  }
  const onSubmit_onCatch: I_AIOService_onCatch = (error) => {
    let result: string | undefined;
    try { result = error.response.data.Message }
    catch { setPageError({ text: 'سرویس دهنده در دسترس نمی باشد', subtext: 'Users/FirstStep' }) }
    return result;
  }
  const msfReport: I_msfReport = (obj, p = {}) => {
    try{
      let { id = p.userId,phoneNumber = p.phoneNumber } = userInfo || {};
      let { actionName, actionId, eventName, targetName, targetId, tagName } = obj
      Report({
        apis, userId: id, phoneNumber, actionName, actionId, eventName, targetName, targetId, tagName
      })
    }
    catch(err){
      console.log('msfReport error',err)
    }
  }
  
  const getB1Info = async (userInfo:I_userInfo) => {
    return await apis.request({ api: 'login.getB1Info', parameter: {userInfo,Logger}, description: 'دریافت اطلاعات b1', loading: false })
  }
  const updateProfile:I_updateProfile = async (loginModel:I_AL_model, mode, callback) => {
    let model:any = {}, description: string;
    if (mode === 'register') { model = loginModel.register; description = 'ثبت نام' }
    else if (mode === 'profile') { model = loginModel.profile; description = 'ویرایش حساب کاربری' }
    else if (mode === 'location') { model = loginModel.profile; description = 'ثبت موقعیت جغرافیایی' }
    let oldUserInfo = (userInfo || {}) as I_userInfo;
    let newUserInfo: I_userInfo = { ...oldUserInfo, ...model} as I_userInfo
    try{
      newUserInfo = {...newUserInfo,latitude:model.location.lat,longitude:model.location.lng,landlineNumber:model.phone,phoneNumber:Login.getUserId()}
      if(!newUserInfo.address){newUserInfo.address = model.location.address}
    }
    catch{}
    let res = await apis.request({
      api: 'login.profile', parameter: { model: newUserInfo, mode,Logger }, description, loading: false,
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
      Login.setUserInfo(newUserInfo)
      if (callback){
        callback();
      };
      return newUserInfo;
    }
    return false
  }
  if (pageError) { return <PageError {...pageError} /> }
  if (showLanding && backOffice && backOffice.landing && backOffice.active_landing) { return <Landing onClose={() => setShowLanding(false)} items={backOffice.landing} /> }
  let appState = { apis, Login, Logger, userInfo,b1Info, backOffice, baseUrl, updateProfile, msfReport };
  return Login.render({appState})
}