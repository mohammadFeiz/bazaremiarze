import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import Main from './pages/main/main';
import Axios from 'axios';
import Register from './components/register/register';
import AIOInput from './npm/aio-input/aio-input';
import PageError from './components/page-error';
import Landing from './components/landing';
import AIOLogin from './npm/aio-login/aio-login';
import AIOService from './npm/aio-service/aio-service';
import getApiFunctions from './apis/apis';
import './App.css';
import './theme.css';
import Splash from './components/spalsh/splash';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
AIOInput.defaults.mapApiKeys = {
  map:'web.68bf1e9b8be541f5b14686078d1e48d2',
  service:'service.30c940d0eff7403f9e8347160e384cc9'
}
class App extends Component {
  constructor(props) {
    super(props);
    let baseUrl = this.getBaseUrl();
    this.state = {
      apis: this.getApisInstance(baseUrl), Login: this.getLoginInstance(),registered:false,
      baseUrl, isAutenticated: false, pageError: false, userInfo: {}, landing: false, splash: true, token: false
    }
  }
  getBaseUrl() {
    let url = window.location.href;
    if (url.indexOf('bazar') !== -1) { return "https://apimy.burux.com/api/v1"; }
    else if (url.indexOf('bbeta') !== -1) { return "https://retailerapp.bbeta.ir/api/v1"; }
    else { return "https://retailerapp.bbeta.ir/api/v1"; }
  }
  getApisInstance(baseUrl) {return new AIOService({ getApiFunctions, baseUrl, id: 'bazaremiarzeapis' });}
  getLoginInstance() {
    let userId;
    try { userId = new URL(window.location.href).searchParams.get("pn").toString() }
    catch { userId = undefined }
    return new AIOLogin({
      timer: 5, modes: ['OTPNumber', 'phoneNumber'], otpLength: 4, id: 'bazarmiarezelogin', userId,
      onSubmit: this.onLoginSubmit.bind(this), checkToken: this.checkToken.bind(this),
      onAuth: this.onAuth.bind(this)
    })
  }
  updateUserInfo(obj) {
    let { userInfo, Login } = this.state;
    let newUserInfo = { ...userInfo, ...obj };
    this.setState({ userInfo: newUserInfo });
    Login.setUserInfo(newUserInfo)
  }
  async getUserInfo(userInfo = this.state.userInfo) {
    return await this.state.apis.request({ api: 'login.getUserInfo', parameter: userInfo, description: 'دریافت اطلاعات کاربری',loading:false })
  }
  onRegister(userInfo){
    let { Login } = this.state;
    Login.setUserInfo(userInfo)
    window.location.reload()
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
  async onAuth({ token,userId }){
    let { apis,Login } = this.state;
    let registered = await apis.request({api:'login.checkIsRegistered',parameter:userId,loading:false});
    apis.setToken(token);
    this.setState({ token, isAutenticated: true,registered })
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
      if (res) {
        let { id: userId } = res;
        this.setState({ userId })
        return { nextMode: 'OTPCode' }
      }
    }
    else if (mode === 'OTPCode' || mode === 'phoneNumber') {
      let userId = this.state.userId;
      let phoneNumber = model.login.userId;
      let password = model.login.password;
      let res = await apis.request({ api: 'login.login', onCatch, parameter: { userId, phoneNumber, password, type: mode },loading:false })
      if (res) {
        let { accessToken } = res;
        let token = accessToken.access_token;
        let userInfo = await this.getUserInfo(res);
        Login.setUserInfo(userInfo);
        this.setState({ userInfo });
        return { nextMode: 'auth', token }
      }
    }
  }
  async componentDidMount() {
    let { baseUrl, apis } = this.state;
    try {
      const response = await Axios.get(`${baseUrl}/BackOffice/GetLastCampaignManagement?type=backoffice`);
      let backOffice;
      if (typeof response.data.data[0] === 'string') {
        backOffice = JSON.parse(response.data.data[0]);
      }
      else {
        let str = window.prompt('تنظیمات اولیه اپ انجام نشده است. اگر ادمین سیستم هستید فایل تنظیمات اولیه را وارد کنید و گر نه به ادمین سیستم اطلاع دهید')
        if (typeof str === 'string') {
          backOffice = JSON.parse(str)
        }
        else {
          window.location.reload()
        }
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
    let { isAutenticated, userInfo, registered, pageError, landing, backOffice, splash, apis, Login, baseUrl } = this.state;
    if (splash) { return <Splash /> }
    if (landing) { return <Landing onClose={() => this.setState({ landing: false })} items={landing} /> }
    if (pageError) { return <PageError {...pageError} /> }
    if (isAutenticated) {
      if (!registered) {
        return (
          <Register
            baseUrl={baseUrl} mode='register' logout={Login.logout}
            model={{ phoneNumber: userInfo.phoneNumber }}
            onClose={() => {Login.logout(); window.location.reload()}}
            onSubmit={(userInfo)=>this.onRegister(userInfo)}
          />
        )
      }
      return (
        <Main
          apis={apis} Login={Login}
          userInfo={userInfo}
          backOffice={backOffice}
          updateUserInfo={this.updateUserInfo.bind(this)}
          getUserInfo={this.getUserInfo.bind(this)}
          baseUrl={baseUrl}
        />
      )
    }
    //اسپلش یک پلیس هولدر هست که میتونه یک تابع برای رندر محتوی بگیره و ما اینجا براش رندر کامپوننت لاگین رو می فرستیم
    return <Splash content={()=>Login.render()}/>
  }
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
serviceWorkerRegistration.unregister();
reportWebVitals();