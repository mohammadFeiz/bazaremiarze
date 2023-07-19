import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import Main from './pages/main';
import Axios from 'axios';
import Register from './components/register/register';
import RVD from './interfaces/react-virtual-dom/react-virtual-dom';
import Loading from './components/loading/index';
import { Icon } from '@mdi/react';
import haraj1 from './images/haraj1.png';
import haraj2 from './images/haraj2.png';
import haraj3 from './images/haraj3.png';
import haraj4 from './images/haraj4.png';

import { mdiAlert,mdiClose } from '@mdi/js';
import logo from './images/logo5.png';
import { OTPLogin } from './npm/aio-login/aio-login';
import $ from 'jquery';
import './App.css';
import './theme.css';
import EPSrc from './images/ep.jpg';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';



class App extends Component {
  constructor(props) {
    super(props);
    let url = window.location.href;
    if(url.indexOf('localhost') !== -1){this.apiBaseUrl = "https://retailerapp.bbeta.ir/api/v1";}
    else if(url.indexOf('bazar') !== -1){this.apiBaseUrl = "https://apimy.burux.com/api/v1";}
    else if(url.indexOf('bbeta') !== -1){this.apiBaseUrl = "https://retailerapp.bbeta.ir/api/v1";}
    else(alert('error'))
    console.log(`base url is ${this.apiBaseUrl}`)
    //this.apiBaseUrl = "https://apimy.burux.com/api/v1";
    this.state = { 
      isAutenticated: false, registered: false, pageError: false, userInfo: {}, landing: false ,
      landing:true
    }
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////// Fill By Backend Developer ///////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async onInterNumber(number) {
    let sendSmsResult;
    try {
      sendSmsResult = await Axios.get(`${this.apiBaseUrl}/Users/FirstStep?phoneNumber=${number}`);
    }
    catch {
      this.setState({ pageError: { text: 'سرویس دهنده در دسترس نمی باشد', subtext: 'Users/FirstStep' } });
      return;
    }
    if (sendSmsResult.data.isSuccess) {
      let data = sendSmsResult.data.data;
      this.userId = data.id;
      this.setState({ registered: data.alreadyRegistered })
      return true
    }
    else {
      return sendSmsResult.data.message
    }

  }
  async onInterCode(code) {
    if (this.userId !== undefined) {
      const smsValidationResult = await Axios.get(`${this.apiBaseUrl}/Users/SecondStep?userId=${this.userId}&code=${code}`);
      if (smsValidationResult.data.isSuccess) {
        let res = smsValidationResult.data.data;
        let token = res.accessToken.access_token;
        let userInfo = await this.getUserInfo(res)
        this.setState({ isAutenticated: true, userInfo, token });
      }
      else { return smsValidationResult.data.message; }
    }
  }
  async onInterPassword(number, password) {
    //if error return error message
    const loginResult = await Axios.get(`${this.apiBaseUrl}/Users/Login?phoneNumber=${number}&password=${password}`);
    if (loginResult.data.isSuccess) {
      const res = loginResult.data.data;
      let userInfo = await this.getUserInfo(res);
      const token = userInfo.accessToken.access_token;
      this.setState({ isAutenticated: true, userInfo, token, registered: res.alreadyRegistered });
    }
    else
      return loginResult.data.message;
  }
  async updatePassword(password) {
    //در صورت موفقیت ریترن ترو
    //در صورت خطا ریترن متن خطا
    const setPasswordResult = await Axios.get(`${this.apiBaseUrl}/Users/SetPassword?password=${password}`);
    if (setPasswordResult.data.isSuccess)
      return true;
    else
      return setPasswordResult.data.message;
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  logout() {
    localStorage.removeItem('brxelctoken');
    this.setState({ isAutenticated: false })
  }
  async interByStorage() {
    let storage = localStorage.getItem('brxelctoken');
    if (!storage || storage === null) { this.setState({}); return; }
    storage = JSON.parse(storage);
    Axios.defaults.headers.common['Authorization'] = 'Bearer ' + storage.token;
    $('.loading').css({ display: 'flex' });
    let success = true;
      
    let res = await Axios.get(`${this.apiBaseUrl}/Users/CheckExpireToken`).catch((error)=>{
      success = false;
      this.handleStatus(error.response.status,storage)
    });
    if(success){
      this.handleStatus(res.status,storage);
    }
  }
  handleStatus(status,storage){
    if(status === 200){
      this.setState({ isAutenticated: true, userInfo: storage.userInfo, token: storage.token, registered: true })
    }
    else if(status === 401){
      localStorage.removeItem('brxelctoken')
      window.location.reload()
    }
    else{
      this.setState({ pageError: { text: 'سرویس دهنده در دسترس نیست', subtext: ''} })
    }
  }
  async componentDidMount() {
    this.mounted = true;
    this.interByStorage();

  }
  updateUserInfo(obj) {
    let { token, userInfo } = this.state;
    let newUserInfo = { ...userInfo, ...obj };
    this.setState({ userInfo: newUserInfo });
    localStorage.setItem('brxelctoken', JSON.stringify({ token, userInfo: newUserInfo }));
  }
  async getUserInfo(userInfo = this.state.userInfo) {
    const b1Info = await fetch(`https://b1api.burux.com/api/BRXIntLayer/GetCalcData/${userInfo.cardCode}`, {
      mode: 'cors', headers: { 'Access-Control-Allow-Origin': '*' }
    }).then((response) => {
      return response.json();
    }).then((data) => {
      return data;
    }).catch(function (error) {
      console.log(error);
      return null;
    });
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
      cardName: customer.cardName,
      itemPrices: b1Info.itemPrices,
      slpphone: b1Info.slpphone,
      slpcode: customer.slpcode,
      slpname: customer.slpname,
      groupCode: customer.groupCode,
      ballance: -ballance,
      slpphone: '09123534314',
      visitorMobile
    }
  }
  header_layout() {
    return {
      html: <img src={logo} width={160} height={160} alt='' />, align: 'vh'
    }
  }
  getNumberFromURL(){
    let str = window.location.href;
    var url = new URL(str);
    return url.searchParams.get("pn");
  }
  render() {
    if (!this.mounted) { return <Loading /> }
    let { isAutenticated, userInfo, token, registered, pageError,landing } = this.state;
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
            baseUrl={this.apiBaseUrl}
            mode='register'
            model={{ phoneNumber: userInfo.phoneNumber }}
            onClose={() => this.setState({ isAutenticated: false })}
            onSubmit={(userInfo) => this.setState({ userInfo, registered: true })}
          />
        )
      }
      try{
        localStorage.setItem('brxelctoken', JSON.stringify({ token, userInfo }));
      }
      catch(err){
        alert(`${err.message}. محدوده حافظه کش کلاینت به حد غیر مجاز رسیده است. لطفا این موضوع را با مرکز پشتیبانی در میان بگذارید`)
      }
      return (
        <>
          <Main
            logout={() => this.logout()}
            token={token}
            userInfo={userInfo}
            updateUserInfo={this.updateUserInfo.bind(this)}
            getUserInfo={this.getUserInfo.bind(this)}
            updatePassword={this.updatePassword.bind(this)}
            baseUrl={this.apiBaseUrl}
          />
        </>

      )
    }
    return (
      <RVD
        layout={{
          className: 'bg3B55A5 ofy-auto fullscreen',
          column: [
            { size: 48 },
            this.header_layout(),
            { size: 24 },
            {
              html: (
                <OTPLogin
                  time={90}
                  number={this.getNumberFromURL()}
                  header={<img src={logo} alt='' width={160} height={160} />}
                  onInterNumber={(number) => this.onInterNumber(number)}
                  onInterCode={(code) => this.onInterCode(code)}
                  onInterPassword={(number, password) => this.onInterPassword(number, password)}
                />
              )
            },
            {
              align: 'vh',
              html: (
                <a style={{ color: '#fff', height: 24, margin: 0 }} href="tel:02175116" className='fs-14'>
                  تماس با پشتیبانی
                </a>
              )
            },
            {
              align: 'vh',
              html: (
                <a style={{ color: '#fff', height: 30, margin: 0 }} href="tel:02175116">
                  021-75116
                </a>
              )
            },
            { flex: 1, style: { minHeight: 240 } }
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
                  در صورت خرید از محصولاتی که کاهش قیمت داشتند روی هر سبد خریدتون 2 عدد کارتن (بله درست خوندید! دو عدد کارتن 100 عددی!) لامپ 10 وات رو میتونین با قیمت 20 هزارتومان خریداری کنید! یعنی ۴ میلیون ریال هدیه ما به شما!
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
