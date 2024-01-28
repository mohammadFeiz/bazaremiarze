import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import Main from './pages/main/main';
import Axios from 'axios';
import PageError from './components/page-error';
import Landing from './components/landing';
import AIOLogin from './npm/aio-login/aio-login';
import AIOLog from 'aio-log';
import AIOService from 'aio-service';
import getApiFunctions from './apis/apis';
import './App.css';
import './theme.css';
import Splash from './components/spalsh/splash';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
function getBaseUrl() {
  // return "https://apimy.burux.com/api/v1";
  let url = window.location.href;
  if (url.indexOf('bazar') !== -1) { return "https://apimy.burux.com/api/v1"; }
  else if (url.indexOf('bbeta') !== -1) { return "https://retailerapp.bbeta.ir/api/v1"; }
  else { return "https://retailerapp.bbeta.ir/api/v1"; }
}
class App extends Component {
  constructor(props) {
    super(props);
    let baseUrl = getBaseUrl();
    this.state = {
      apis: this.getApisInstance(baseUrl), Login: this.getLoginInstance(),Logger:new AIOLog('bmlog'),
      baseUrl, pageError: false, userInfo: {}, landing: false, splash: true, token: false
    }
  }
  getApisInstance(baseUrl) {return new AIOService({ getApiFunctions,getState:()=>this.state, baseUrl, id: 'bazaremiarzeapis' });}
  getLoginInstance() {
    let userId;
    try { userId = new URL(window.location.href).searchParams.get("pn").toString() }
    catch { userId = undefined }
    return new AIOLogin({
      id: 'bazarmiarezelogin', 
      modes: ['OTPNumber', 'phoneNumber'], 
      timer: 5, 
      otpLength: 4, 
      userId,
      onSubmit: this.onLoginSubmit.bind(this), 
      checkToken: this.checkToken.bind(this),
      splashTime:2500,
      register:{
        type:'mode',text:'ثبت نام در بازار می ارزه',
        fields:[
          ['*firstname','*lastname'],
          ['*storeName_text_نام فروشگاه',{input:{type:'text'},field:'value.phone',label:'شماره تلفن ثابت',validations:[['required'],['length>',10]]}],
          ['password','repassword'],
          '*location',
          '*address',
          ['*state','*city']
        ]
      },
      renderApp:({token})=><Main {...this.getAppProps(token)}/>,
      renderLogin:(loginForm)=><Splash content={()=>loginForm}/>,
      renderSplash:()=><Splash loading={true}/>
    })
  }
  
  async getUserInfo(userInfo = this.state.userInfo) {
    let {backOffice} = this.state;
    return await this.state.apis.request({ api: 'login.getUserInfo', parameter: {userInfo,backOffice}, description: 'دریافت اطلاعات کاربری',loading:false })
  }
  msfReport(obj,phoneNumber){
    let {userInfo = {},apis} = this.state;
    phoneNumber = phoneNumber === undefined?userInfo.phoneNumber:phoneNumber;
    this.msfreports = this.msfReports || [];
    let res = {...obj,phoneNumber,userId:userInfo.id}
    this.msfreports.push(res);
    console.log(this.msfreports);
    apis.request({
      api:'backOffice.report',loading:false,message:{error:false},
      parameter:res,description:'ارسال گزارش'
    })
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
  async checkToken(token) {
    let { apis } = this.state;
    let appSetting = await apis.request({api:'login.getBackOffice',parameter:apis,description:'دریافت تنظیمات اولیه',loading:false})
    if(typeof appSetting === 'object'){
      let {backOffice,landing} = appSetting;
      console.log(backOffice)
      this.setState({backOffice,landing})
      if(!token){return false}
      let isTokenValid = await apis.request({api: 'login.checkToken', parameter: token,loading:false,onCatch: () => 'خطای 10037.این کد خطا را به پشتیبانی اعلام کنید'})
      if (isTokenValid === true) {return await this.handleUserInfo()}
      else if (isTokenValid === false) { return false }
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
  async onLoginSubmit(model, mode) {
    let { apis, Login } = this.state;
    let onCatch = (error) => {
      try { return error.response.data.Message }
      catch {
        this.setState({ pageError: { text: 'سرویس دهنده در دسترس نمی باشد', subtext: 'Users/FirstStep' } })
        return false;
      }
    };
    if (mode === 'OTPNumber') {
      let res = await apis.request({ api: 'login.OTPNumber', parameter: model.login.userId, onCatch,loading:false })
      if (typeof res === 'object') {
        //در اوتی پی بعد از ارسال شماره یک آی دی دریافت می شود که در ای پی آی او تی پی کد مورد نیاز است پس ما این آی دی رو در دیس ذخیره می کنیم
        this.id = res.id;
        Login.setStorage('userId',model.login.userId);
        Login.setMode('OTPCode')
      }
    }
    else if(mode === 'OTPCode'){
      let response = await apis.request({ api: 'login.loginByOTPCode', onCatch, parameter: { id:this.id, otpCode:model.login.password },loading:false })
      this.handleLoginResponse(response,model.login.userId,mode) 
    }
    else if (mode === 'phoneNumber') {
      let response = await apis.request({ api: 'login.loginByPhoneNumber', onCatch, parameter: { phoneNumber:model.login.userId, password:model.login.password },loading:false })
      this.handleLoginResponse(response,model.login.userId,mode) 
    }
    else if(mode === 'register'){
      this.msfReport({actionName:`register`,actionId:3,result:'success',tagName:'user authentication',eventName:'action'},model.login.userId)
      this.updateProfile(model,'register',()=>window.location.reload())
    }
  }
  async handleLoginResponse(response,userId,mode){
    let { apis, Login } = this.state;
    if(typeof response === 'string'){
      let report = {
        actionName:`login by ${mode}`,
        actionId:mode === 'OTPCode'?0:1,
        result:'unsuccess',
        message:response,
        tagName:'user authentication',
        eventName:'action'
      }
      this.msfReport(report,userId); 
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
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
serviceWorkerRegistration.unregister();
reportWebVitals();