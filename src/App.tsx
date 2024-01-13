import React, { Component, useState } from 'react';
import Main from './pages/main/main';
import PageError from './components/page-error';
import Landing from './components/landing';
import AIOLogin from './npm/aio-login/aio-login';
import AIOLog from 'aio-log';
import AIOService from 'aio-service';
import getApiFunctions from './apis/apis';
import './App.css';
import './theme.css';
import Splash from './components/spalsh/splash';
import { I_AIOLogin_checkToken, I_AIOLogin_class, I_AIOLogin_mode, I_AIOLogin_model, I_AIOLogin_onSubmit, I_AIOLogin_props, I_AIOLogin_renderApp, I_AIOLogin_renderLogin, I_AIOLogin_renderSplash, I_AIOService_class, I_AIOService_onCatch, I_userInfo } from './types';
type I_getBaseUrl = ()=>string
const getBaseUrl:I_getBaseUrl = function() {
  //return "https://apimy.burux.com/api/v1";
  let url = window.location.href;
  if (url.indexOf('bazar') !== -1) { return "https://apimy.burux.com/api/v1"; }
  else if (url.indexOf('bbeta') !== -1) { return "https://retailerapp.bbeta.ir/api/v1"; }
  else { return "https://retailerapp.bbeta.ir/api/v1"; }
}
type I_getUrlUserId = ()=>string | undefined;
const getUrlUserId:I_getUrlUserId = function (){
  let userId;
  try { userId = new URL(window.location.href).searchParams.get("pn").toString() }
  catch { userId = undefined }
  return userId;
}
type I_getApisInstance = (baseUrl:string,getState:Function)=>I_AIOService_class
const getApisInstance:I_getApisInstance = function(baseUrl,getState){
  return new AIOService({ getApiFunctions,getState, baseUrl, id: 'bazaremiarzeapis' });
}
type I_getLoginInstance_parameter = {
  onSubmit:I_AIOLogin_onSubmit,checkToken:I_AIOLogin_checkToken,
  renderApp:I_AIOLogin_renderApp,renderLogin:I_AIOLogin_renderLogin,
  renderSplash:I_AIOLogin_renderSplash
}
type I_getLoginInstance = (obj:I_getLoginInstance_parameter)=>I_AIOLogin_class
const getLoginInstance:I_getLoginInstance = function(parameter){
  let {onSubmit,checkToken,renderApp,renderLogin,renderSplash} = parameter;
  let userId = getUrlUserId();
  let props:I_AIOLogin_props = {
    id: 'bazarmiarezelogin',modes: ['OTPNumber', 'phoneNumber'],timer: 5,otpLength: 4,userId,splashTime:2500,onSubmit, checkToken,
    renderApp,renderLogin,renderSplash,
    register:{
      type:'mode',text:'ثبت نام در بازار می ارزه',
      fields:[
        ['*firstname','*lastname'],
        ['*storeName_text_نام فروشگاه',{input:{type:'text'},field:'value.phone',label:'شماره تلفن ثابت',validations:[['required'],['length>',10]]}],
        ['password','repassword'],'*location','*address',['*state','*city']
      ]
    }
  }
  return new AIOLogin(props)
}
type I_Report_parameter = {
  apis:I_AIOService_class,phoneNumber?:string,userInfo:I_userInfo,
  actionName:string,actionId:3
}
type I_Report = (parameter:I_Report_parameter)=>void;
const Report:I_Report = function(parameter){
  let {userInfo,phoneNumber = userInfo.phoneNumber,apis,actionName} = parameter;
  phoneNumber = phoneNumber === undefined?userInfo.phoneNumber:phoneNumber;
  let res = {actionName,phoneNumber,userId:userInfo.id}
  apis.request({
    api:'backOffice.report',loading:false,message:{error:false},
    parameter:res,description:'ارسال گزارش'
  })
}
export default function App(){
  let [baseUrl] = useState<string>(getBaseUrl());
  let [apis] = useState<I_AIOService_class>(getApisInstance(baseUrl,()=>{return {}}))
  let [pageError,setPageError] = useState<{text:string,subtext:string}>()
  let [logger] = useState(new AIOLog('bmlog'))
  let [landing,setLanding] = useState(false);
  let [userInfo,setUserInfo] = useState<I_userInfo | undefined>()
  let [userId,setUserId] = useState();
  const renderApp:I_AIOLogin_renderApp = ({token})=><Main {...this.getAppProps(token)}/>
  const renderLogin:I_AIOLogin_renderLogin = (loginForm)=><Splash content={()=>loginForm}/>
  const renderSplash:I_AIOLogin_renderSplash = ()=><Splash loading={true}/>
  const onSubmit:I_AIOLogin_onSubmit = async(model:I_AIOLogin_model, mode:I_AIOLogin_mode) => {
    if (mode === 'OTPNumber') {onSubmit_OTPNumber(model)}
    else if(mode === 'OTPCode'){onSubmit_OTPCode(model,mode)}
    else if (mode === 'phoneNumber') {onSubmit_phoneNumber(model,mode)}
    else if(mode === 'register'){onSubmit_register(model)}
  }
  const onSubmit_onCatch:I_AIOService_onCatch = (error)=>{
    let result:string | undefined;
    try { result = error.response.data.Message }
    catch {setPageError({ text: 'سرویس دهنده در دسترس نمی باشد', subtext: 'Users/FirstStep' })}
    return result;
  }
  const onSubmit_OTPNumber = async(model:I_AIOLogin_model) => {
    let res = await apis.request({api: 'login.OTPNumber', parameter: model.login.userId, onCatch:onSubmit_onCatch,loading:false,description:'ارسال شماره همراه' })
    if (typeof res === 'object') {
      //در اوتی پی بعد از ارسال شماره یک آی دی دریافت می شود که در ای پی آی او تی پی کد مورد نیاز است پس ما این آی دی رو در دیس ذخیره می کنیم
      setUserId(res.id);
      Login.setStorage('userId',model.login.userId);
      Login.setMode('OTPCode')
    }
  }
  const onSubmit_OTPCode = async (model:I_AIOLogin_model,mode:I_AIOLogin_mode)=>{
    let response = await apis.request({ api: 'login.loginByOTPCode', onCatch:onSubmit_onCatch, parameter: { id:this.id, otpCode:model.login.password },loading:false,description:'ارسال کد یکبار مصرف' })
    handleLoginResponse(response,model.login.userId,mode) 
  }
  const onSubmit_phoneNumber = async (model:I_AIOLogin_model,mode:I_AIOLogin_mode)=>{
    let response = await apis.request({ api: 'login.loginByPhoneNumber', onCatch:onSubmit_onCatch, parameter: { phoneNumber:model.login.userId, password:model.login.password },loading:false,description:'ورود با شماره همراه و رمز عبور' })
    handleLoginResponse(response,model.login.userId,mode) 
  }
  const onSubmit_register = async (model:I_AIOLogin_model)=>{
    msfReport({actionName:`register`,actionId:3,result:'success',tagName:'user authentication',eventName:'action'},model.login.userId)
    updateProfile(model,'register',()=>window.location.reload())
  }
  const msfReport = (obj:{})=>{
    Report({
      apis,userInfo,
    })
  }
  const checkToken:I_AIOLogin_checkToken = async (token) => {
    let { apis } = this.state;
    let appSetting = await apis.request({api:'login.getBackOffice',parameter:apis,description:'دریافت تنظیمات اولیه',loading:false})
    if(typeof appSetting === 'object'){
      let {backOffice,landing} = appSetting;
      this.setState({backOffice,landing})
      if(!token){return false}
      let isTokenValid = await apis.request({api: 'login.checkToken', parameter: token,loading:false,onCatch: () => 'خطای 10037.این کد خطا را به پشتیبانی اعلام کنید'})
      if (isTokenValid === true) {return await this.handleUserInfo()}
      else if (isTokenValid === false) { return false }
    }
  }
  const handleLoginResponse = async (response,userId,mode) => {
    if(typeof response === 'string'){
      let report = {
        actionName:`login by ${mode}`,
        actionId:mode === 'OTPCode'?0:1,
        result:'unsuccess',
        message:response,
        tagName:'user authentication',
        eventName:'action'
      }
      msfReport(report,userId); 
      return;
    }
    let { accessToken } = response;
    let token = accessToken.access_token;
    let userInfo = await this.getUserInfo(response);
    if(!userInfo){return}
    let registered = await apis.request({api:'login.checkIsRegistered',parameter:userId,loading:false});
    if(registered){
      Login.setStorage('userInfo',userInfo);
      Login.setStorage('userId',userId);
      Login.setStorage('token',token);
      Login.setMode('auth'); 
    }
    else {Login.setMode('register');}
    this.msfReport({actionName:`login by ${mode}`,actionId:mode === 'OTPCode'?0:1,result:'success',tagName:'user authentication',eventName:'action'},userId)
    this.setState({ userInfo });
  }
  let [Login] = useState<I_AIOLogin_class>(getLoginInstance({onSubmit,checkToken,renderLogin,renderApp,renderSplash}))
  
  
  
}
class Appjs extends Component {
  async getUserInfo(userInfo = this.state.userInfo) {
    let {backOffice} = this.state;
    return await this.state.apis.request({ api: 'login.getUserInfo', parameter: {userInfo,backOffice}, description: 'دریافت اطلاعات کاربری',loading:false })
  }
  
  async updateProfile(loginModel,mode,callback){
    let model = {};
    if(mode === 'register'){model = loginModel.register}
    else if(mode === 'profile'){model = loginModel.profile}
    else if(mode === 'location'){model = loginModel.profile}
    let {apis,userInfo} = this.state;
    let obj = {
      ...userInfo,
      landlineNumber:model.phone,
      landline:model.phone,
      latitude:model.location.lat,
      longitude:model.location.lng,
      firstName:model.firstname,
      lastName:model.lastname,
      password:model.password,
      storeName:model.storeName,
      address:model.address,
      userProvince:model.state,
      userCity:model.city
    }
    let description = {register:'ثبت نام',profile:'ویرایش حساب کاربری',location:'ثبت موقعیت جغرافیایی'}[mode]
    let res = await apis.request({
        api:'login.profile',parameter:{model:{...userInfo,...obj},mode},description,loading:false,
        onCatch:(error)=>{
            let {response,message,Message} = error;
            if(response && response.data){
                let {message,Message} = response.data;
                if(message || Message){return message || Message}
            }
            return message || Message || 'خطای نا مشخص onCatch'
        },
        getError:(response)=>{
            if(!response.data.isSuccess){
                let {message,Message} = response.data;
                return message || Message || 'خطای نا مشخص onError'
            }   
        }
    })
    if(typeof res === 'object'){
      let { userInfo, Login } = this.state;
      let newUserInfo = { ...userInfo, ...obj };
      this.setState({ userInfo: newUserInfo });
      Login.setStorage('userInfo',newUserInfo)
      callback()
    }
  }
  async handleUserInfo(){
    let {Login} = this.state;
    let userInfo = Login.getStorage('userInfo')
    if(typeof userInfo !== 'object' || !userInfo.cardCode || typeof userInfo.cardCode !== 'string'){
      return false;
    }
    else {
      let updatedUserInfo = await this.getUserInfo(userInfo);
      this.setState({ userInfo: updatedUserInfo })
      this.msfReport({actionName:'login by cache',actionId:9,result:'success',eventName:'action',tagName:'user authentication'},updatedUserInfo.phoneNumber)
      return true
    }
  }
  
  
  
  getAppProps(token){
    let { userInfo, backOffice, apis, Login, baseUrl,Logger } = this.state;
    apis.setToken(token);
    return {apis,Login,Logger,userInfo,backOffice,baseUrl,updateProfile:this.updateProfile.bind(this),msfReport:this.msfReport.bind(this)}
  }
  render() {
    let { pageError, landing, Login } = this.state;
    if (landing) { return <Landing onClose={() => this.setState({ landing: false })} items={landing} /> }
    if (pageError) { return <PageError {...pageError} /> }
    return Login.render()
  }
}