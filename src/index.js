import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import Main from './pages/main';
import Axios from 'axios';
import Register from './components/register/register';
import RVD from './interfaces/react-virtual-dom/react-virtual-dom';
import { Icon } from '@mdi/react';
import haraj1 from './images/haraj1.png';
import haraj2 from './images/haraj2.png';
import haraj3 from './images/haraj3.png';
import haraj4 from './images/haraj4.png';

import { mdiAlert,mdiClose } from '@mdi/js';
import logo from './images/logo5.png';
import AIOLogin from './npm/aio-login/aio-login';
import AIOStorage from './npm/aio-storage/aio-storage';
import './App.css';
import './theme.css';
import EPSrc from './images/ep.jpg';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

class App extends Component {
  constructor(props) {
    super(props);
    let url = window.location.href;
    if (url.indexOf('localhost') !== -1) { this.apiBaseUrl = "https://retailerapp.bbeta.ir/api/v1"; }
    else if (url.indexOf('bazar') !== -1) { this.apiBaseUrl = "https://apimy.burux.com/api/v1"; }
    else if (url.indexOf('bbeta') !== -1) { this.apiBaseUrl = "https://retailerapp.bbeta.ir/api/v1"; }
    else (alert('unknown domain'))
    this.apiBaseUrl = "https://apimy.burux.com/api/v1";
    this.Storage = AIOStorage('bazarmiarzeuserinfo') 
    //this.apiBaseUrl = "https://apimy.burux.com/api/v1";
    this.state = { isAutenticated: false, registered: true, pageError: false, userInfo: {}, landing: false,landing:true }
  }
  async updatePassword(password) {
    const setPasswordResult = await Axios.get(`${this.apiBaseUrl}/Users/SetPassword?password=${password}`);
    if (setPasswordResult.data.isSuccess) { return true; }
    else { return setPasswordResult.data.message; }
  }
  updateUserInfo(obj) {
    let { userInfo } = this.state;
    let newUserInfo = { ...userInfo, ...obj };
    this.setState({ userInfo: newUserInfo });
    this.Storage.save({name:'userInfo', value:newUserInfo});
  }
  async getUserInfo(userInfo = this.state.userInfo) {
    const b1Info = await fetch(`https://b1api.burux.com/api/BRXIntLayer/GetCalcData/${userInfo.cardCode}`, {
      mode: 'cors', headers: { 'Access-Control-Allow-Origin': '*' }
    }).then((response) => {return response.json();}).then((data) => {return data;}).catch(function (error) {return null;});
    let { customer = {} } = b1Info;
    let ballance = customer.ballance;
    let visitorMobile;
    try { visitorMobile = b1Info.salePeople.mobile }
    catch { visitorMobile = '' }
    if (isNaN(ballance)) {
      console.error(`b1Info.customer.ballance is ${ballance} but we set it on 0`)
      ballance = 0;
    }
    return {
      ...userInfo,
      cardCode: userInfo.cardCode,
      groupName: customer.groupName,
      itemPrices: b1Info.itemPrices,
      slpcode: customer.slpcode,
      slpname: customer.slpname,
      groupCode: customer.groupCode,
      ballance: -ballance,
      visitorMobile
    }
  }
  async checkToken(token) { // if success return true else return string
    let response;
    Axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    let result;
    try { 
      response = await Axios.get(`${this.apiBaseUrl}/Users/CheckExpireToken`); 
      result = response.status === 200;
    }
    catch (err) {
      try {
        if (err.response.status === 401) { result = false }
        else { this.setState({ pageError: { text: 'سرویس دهنده در دسترس نیست', subtext: ''} }) }
      }
      catch { result = 'خطا در دریافت اطلاعات' }
    }
    if(result === true){
      let userInfo = this.Storage.load({name:'userInfo'});
      userInfo = await this.getUserInfo(userInfo);
      this.setState({userInfo})
    }
    return result;
  }
  async onSubmit(model, mode) {
    if (mode === 'OTPPhoneNumber') {
      let sendSmsResult;
      try { sendSmsResult = await Axios.get(`${this.apiBaseUrl}/Users/FirstStep?phoneNumber=${model.OTPPhoneNumber}`); }
      catch { this.setState({ pageError: { text: 'سرویس دهنده در دسترس نمی باشد', subtext: 'Users/FirstStep' } }); return; }
      if (sendSmsResult.data.isSuccess) {
        let data = sendSmsResult.data.data;
        this.userId = data.id;
        this.setState({ registered: !!data.alreadyRegistered })
        return { mode: 'OTPCode' }
      }
      else { return { mode: 'Error', error: sendSmsResult.data.message } }
    }
    else if (mode === 'OTPCode') {
      if (this.userId === undefined) { return { mode: 'Error', error: 'خطا در دریافت یوزر آی دی' } }
      const smsValidationResult = await Axios.get(`${this.apiBaseUrl}/Users/SecondStep?userId=${this.userId}&code=${model.OTPCode}`);
      if (smsValidationResult.data.isSuccess) {
        let res = smsValidationResult.data.data;
        let token = res.accessToken.access_token;
        let userInfo = await this.getUserInfo(res)
        this.setState({ userInfo });
        return { mode: 'Authenticated', token }
      }
      else { return { mode: 'Error', error: smsValidationResult.data.message } }
    }
    else if (mode === 'PhoneNumber') {
      const loginResult = await Axios.get(`${this.apiBaseUrl}/Users/Login?phoneNumber=${model.PhoneNumber}&password=${model.password}`);
      if (loginResult.data.isSuccess) {
        const res = loginResult.data.data;
        let userInfo = await this.getUserInfo(res);
        const token = userInfo.accessToken.access_token;
        this.setState({ userInfo, registered: res.alreadyRegistered });
        return { mode: 'Authenticated', token }
      }
      else { return { mode: 'Error', error: loginResult.data.message } }
    }
  }
  render() {
    let { isAutenticated, userInfo, token, registered, pageError,landing,logout } = this.state;
    if(landing){
      return <LandingTakhfif onClose={()=>this.setState({landing:false})}/>
    }
    if (pageError) {
      return (
        <>
          <RVD
            layout={{
              className: 'page-error fullscreen',
              row: [
                { flex: 1 },
                {
                  className: 'page-error-image',
                  column: [
                    { flex: 3 },
                    { html: <img src={EPSrc} width='100%' /> },
                    { size: 24 },
                    { html: <Icon path={mdiAlert} size={4} />, align: 'h' },
                    { html: pageError.text, align: 'h' },
                    { html: pageError.subtext, align: 'h' },
                    { size: 36 },
                    { html: 'بارگزاری مجدد', className: 'bm-reload', attrs: { onClick: () => window.location.reload() } },
                    { flex: 2 }
                  ]
                },
                { flex: 1 }
              ]
            }}
          />
        </>
      )
    }
    if (isAutenticated) {
      if (!registered) {
        return (
          <Register
            baseUrl={this.apiBaseUrl} mode='register'
            model={{ phoneNumber: userInfo.phoneNumber }}
            onClose={() => this.setState({ isAutenticated: false })}
            onSubmit={(userInfo) => this.setState({ userInfo, registered: true })}
          />
        )
      }
      try {
        this.Storage.save({name:'userInfo',value:userInfo})
      }
      catch (err) {
        alert(`${err.message}. محدوده حافظه کش کلاینت به حد غیر مجاز رسیده است. لطفا این موضوع را با مرکز پشتیبانی در میان بگذارید`)
      }
      return (
        <>
          <Main
            logout={logout} token={token} userInfo={userInfo}
            updateUserInfo={this.updateUserInfo.bind(this)}
            getUserInfo={this.getUserInfo.bind(this)}
            updatePassword={this.updatePassword.bind(this)}
            baseUrl={this.apiBaseUrl}
          />
        </>

      )
    }
    let urlPhoneNumber = new URL(window.location.href).searchParams.get("pn");
    return (
      <RVD
        layout={{
          className: 'bg3B55A5 ofy-auto fullscreen ',
          column: [
            { flex: 1 },
            { html: <img src={logo} width={160} height={160} alt='' />, align: 'vh' },
            { flex: 1 },
            {
              align:'vh',className:'of-visible',
              html: (
                <AIOLogin
                  style={{maxWidth:360,boxShadow: 'rgba(0, 0, 0, 0.2) 0px 6px 15px 5px'}}
                  time={8} methods={['OTPPhoneNumber', 'PhoneNumber']} otpLength={4} id='bazarmiarzelogin'
                  model={{ OTPPhoneNumber: urlPhoneNumber, PhoneNumber: urlPhoneNumber }}
                  onSubmit={this.onSubmit.bind(this)}
                  checkToken={this.checkToken.bind(this)}
                  COMPONENT={({ logout, token }) => this.setState({ isAutenticated: true, logout, token })}
                />
              )
            },
            {size:24},
            { flex: 3, style: { minHeight: 200 },align:'vh',column:[
              { align: 'vh', html: (<a style={{ color: '#fff', height: 24, margin: 0 }} href="tel:02175116" className='fs-14'>تماس با پشتیبانی</a>) },
              { align: 'vh', html: (<a style={{ color: '#fff', height: 30, margin: 0 }} href="tel:02175116">021-75116</a>) },
            ] }
          ]
        }}
      />
    )
  }
}

class LandingTakhfif extends Component{
  close_layout(){
    let {onClose} = this.props;
    return {
      size:48,
      row:[
        {flex:1},
        {
          align:'vh',
          className:'p-h-12',
          onClick:()=>onClose(),
          html:<Icon path={mdiClose} size={1}/>
        }
      ]
    }
  }
  header_layout(src){
    return {
      column:[
        {
          html:(
            <img src={src} width='100%' alt=''/>
          )
        }
      ]
    }
  }
  billboard_layout(src){
    return {
      className:'p-12',
      html:(
        <img src={src} alt='' width='100%'/>
      )
    }
  }
  description_layout(text){
    return {
      style:{textAlign:'right'},
      className:'m-b-12 p-h-12 fs-12',
      html:text
    }
  }
  label_layout(text){
    return {
      className:'theme-dark-font-color fs-16 bold p-h-12',
      html:text
    }
  }
  link_be_kharid(){
    let {onClose} = this.props;
    return {
      className:'m-b-12 p-h-12',
      html:(
        <button 
          onClick={()=>{
            onClose()
          }}
          className='button-2'
        >همین الان خرید کنید</button>
      )
    }
  }
  link_be_belex(){
    let {onClose} = this.props;
    return {
      className:'m-b-12 p-h-12',
      html:(
        <button 
          onClick={()=>{
            onClose()
          }}
          className='button-2'
        >خرید لامپ 10 وات</button>
      )
    }
  }
  render(){
    return (
      <RVD
        layout={{
          style:{background:'#fff',height:'100%'},
          className:'fullscreen',
          column:[
            this.close_layout(),
            {
              className:'ofy-auto',flex:1,
              column:[
                this.header_layout(haraj1),
                this.billboard_layout(haraj2),
                this.billboard_layout(haraj3),
                this.description_layout(
                  `
                  این روزها که شاهد گرونی های روزافزون و کاهش قدرت خرید هستیم، شرکت بروکس با در نظر گرفتن شرایط اقتصادی فعلی جامعه و نرخ تورم سعی در کمک به کسب و کار الکتریکی‌ها داره. برای همین طی مذاکرات و تصمیم گیری‌ها، در نظر گرفتیم تمامی محصولات روشنایی و الکتریکی خود را با 25 الی 30 درصد زیر قیمت به فروش برسونیم!
                  `
                ),
                this.link_be_kharid(),
                this.billboard_layout(haraj4),
                this.label_layout('لامپ 10 وات بروکس فقط 20 هزارتومن!'),
                this.description_layout(
                  `
                  هدیه ما به شما در بازار می ارزه خرید لامپ ۱۰ وات با قیمت استثنایی!
شما میتوانید حداکثر 2 کارتن لامپ 10 وات را با قیمت 20 هزار تومان خریداری کنید! یعنی ۴ میلیون ریال هدیه ما به شما!
این فرصت بی نظیر را از دست ندهید!
                  `
                ),
                this.link_be_belex(),
                
              ]
            }  
          ]
        }}
      
      />
    )
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
