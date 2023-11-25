import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import Main from './pages/main/main';
import Axios from 'axios';
import PageError from './components/page-error';
import Landing from './components/landing';
import AIOLogin from './npm/aio-login/aio-login';
import AIOLog from './npm/aio-log/aio-log';
import AIOService from 'aio-service';
import getApiFunctions from './apis/apis';
import './App.css';
import './theme.css';
import Splash from './components/spalsh/splash';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
class App extends Component {
  constructor(props) {
    super(props);
    let baseUrl = this.getBaseUrl();
    this.state = {
      apis: this.getApisInstance(baseUrl), Login: this.getLoginInstance(),Logger:new AIOLog('bmlog'),
      baseUrl, isAutenticated: false, pageError: false, userInfo: {}, landing: false, splash: true, token: false
    }
  }
  getBaseUrl() {
    let url = window.location.href;
    if (url.indexOf('bazar') !== -1) { return "https://apimy.burux.com/api/v1"; }
    else if (url.indexOf('bbeta') !== -1) { return "https://retailerapp.bbeta.ir/api/v1"; }
    else { return "https://retailerapp.bbeta.ir/api/v1"; }
  }
  getApisInstance(baseUrl) {return new AIOService({ getApiFunctions,getState:()=>this.state, baseUrl, id: 'bazaremiarzeapis' });}
  getLoginInstance() {
    let userId;
    try { userId = new URL(window.location.href).searchParams.get("pn").toString() }
    catch { userId = undefined }
    return new AIOLogin({
      timer: 5, modes: ['OTPNumber', 'phoneNumber'], otpLength: 4, id: 'bazarmiarezelogin', userId,
      onSubmit: this.onLoginSubmit.bind(this), checkToken: this.checkToken.bind(this),
      onAuth: this.onAuth.bind(this),
      register:{
        type:'mode',text:'ثبت نام در بازار می ارزه',
        fields:[
          ['*firstname','*lastname'],
          ['*storeName_text_نام فروشگاه','*phone'],
          ['password','repassword'],
          '*location',
          '*address',
          ['*state','*city']
        ]

      }
    })
  }
  // {html:'به خانواده بزرگ بروکس بپیوندید',className:'fs-12 theme-dark-font-color bold t-a-right'}
  //           {html:'بیش از 8000 فروشگاه در سطح کشور عضو این خانواده هستند',className:'fs-10 theme-medium-font-color t-a-right'}
  async getUserInfo(userInfo = this.state.userInfo) {
    return await this.state.apis.request({ api: 'login.getUserInfo', parameter: userInfo, description: 'دریافت اطلاعات کاربری',loading:false })
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
      Login.setUserInfo(newUserInfo)
      callback()
    }
  }
  async checkToken(token) {
    let { apis, Login } = this.state;
    let res = await apis.request({
      api: 'login.checkToken', parameter: token,loading:false,
      onCatch: () => 'خطای 10037.این کد خطا را به پشتیبانی اعلام کنید'
    })
    if (res === true) {
      let userInfo = Login.getUserInfo();
      if(typeof userInfo !== 'object' || !userInfo.cardCode || typeof userInfo.cardCode !== 'string'){
        return false;
      }
      else {
        let updatedUserInfo = await this.getUserInfo(userInfo);
        this.setState({ userInfo: updatedUserInfo })
        return true
      }
      
    }
    else if (res === false) { return false }
  }
  async onAuth({ token }){
    let { apis } = this.state;
    apis.setToken(token);
    this.setState({ token, isAutenticated: true })
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
        let { id: userId } = res;
        this.setState({ userId })
        Login.setMode('OTPCode')
      }
    }
    else if (mode === 'OTPCode' || mode === 'phoneNumber') {
      let userId = this.state.userId;
      let phoneNumber = model.login.userId;
      let password = model.login.password;
      let res = await apis.request({ api: 'login.login', onCatch, parameter: { userId, phoneNumber, password, type: mode },loading:false })
      if (typeof res === 'object') {
        let { accessToken } = res;
        let token = accessToken.access_token;
        let userInfo = await this.getUserInfo(res);
        let registered = await apis.request({api:'login.checkIsRegistered',parameter:phoneNumber,loading:false});
        if(registered){
          Login.setUserInfo(userInfo);
          Login.setToken(token);
          Login.setMode('auth'); 
        }
        else {Login.setMode('register');}
        this.setState({ userInfo });
      }
    }
    else if(mode === 'register'){this.updateProfile(model.register,'register',()=>window.location.reload)}
  }
  async componentDidMount() {
    let { baseUrl, apis,Login } = this.state;
    try {
      const response = await Axios.get(`${baseUrl}/BackOffice/GetLastCampaignManagement?type=backoffice`);
      let backOffice;
      if (typeof response.data.data[0] === 'string') {
        backOffice = JSON.parse(response.data.data[0]);
      }
      else {
        let str = window.prompt('تنظیمات اولیه اپ انجام نشده است. اگر ادمین سیستم هستید فایل تنظیمات اولیه را وارد کنید و گر نه به ادمین سیستم اطلاع دهید')
        if (typeof str === 'string') {backOffice = JSON.parse(str)}
        else {window.location.reload()}
      }
      apis.handleCacheVersions(backOffice.versions || {});
      let landing = false;
      if (backOffice.landing && backOffice.active_landing) { landing = backOffice.landing }
      this.setState({ backOffice, landing });
      let loginType = new URL(window.location.href).searchParams.get("login");
      if (loginType) {
        Axios.get(`${baseUrl}/login?type=${loginType}`);
      }
    }
    catch (err) {
      this.setState({ pageError: { text: 'دریافت تنظیمات اولیه با خطا مواجه شد', subtext: err.message } })
    }
    this.setState({ splash: false })  
  }
  render() {
    let { isAutenticated, userInfo, pageError, landing, backOffice, splash, apis, Login, baseUrl,Logger } = this.state;
    if (splash) { return <Splash /> }
    if (landing) { return <Landing onClose={() => this.setState({ landing: false })} items={landing} /> }
    if (pageError) { return <PageError {...pageError} /> }
    if (isAutenticated) {
      let props = {apis,Login,Logger,userInfo,backOffice,baseUrl,updateProfile:this.updateProfile.bind(this)}
      return (<Main {...props}/>)
    }
    //اسپلش یک پلیس هولدر هست که میتونه یک تابع برای رندر محتوی بگیره و ما اینجا براش رندر کامپوننت لاگین رو می فرستیم
    return <Splash content={()=>Login.render()}/>
  }
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
serviceWorkerRegistration.unregister();
reportWebVitals();