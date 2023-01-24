import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import Main from './pages/main';
import Axios from 'axios';
import Register from './components/register/register';
import RVD from './interfaces/react-virtual-dom/react-virtual-dom';
import Loading from './components/loading/index';
import getSvg from './utils/getSvg';
import {Icon} from '@mdi/react';
import { mdiAlert } from '@mdi/js';
import landsrc1 from './images/land1.png';
import landsrc2 from './images/land2.png';
import logo from './images/logo5.png';
import {OTPLogin} from './npm/aio-login/aio-login';
import $ from 'jquery';
import './App.css';
import './theme.css';
import EPSrc from './images/ep.jpg';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';



class App extends Component {
  constructor(props) {
    super(props);
    this.apiBaseUrl = "https://retailerapp.bbeta.ir/api/v1";
    this.state = { isAutenticated: false, registered: false,pageError:false,userInfo:{},landing:false}
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////// Fill By Backend Developer ///////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async onInterNumber(number) {
    let sendSmsResult;
    try{
      sendSmsResult = await Axios.get(`${this.apiBaseUrl}/Users/FirstStep?phoneNumber=${number}`);
    }
    catch{
      this.setState({pageError:{text:'سرویس دهنده در دسترس نمی باشد',subtext:'Users/FirstStep'}});
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
      if (smsValidationResult.data.isSuccess){
        let res = smsValidationResult.data.data;
        let token = res.accessToken.access_token;
        let userInfo = await this.getUserInfo(res)
        this.setState({ isAutenticated: true, userInfo, token });
      }
      else {return smsValidationResult.data.message;}
    }
  }
  async onInterPassword(number,password){
    //if error return error message
    const loginResult = await Axios.get(`${this.apiBaseUrl}/Users/Login?phoneNumber=${number}&password=${password}`);
    if (loginResult.data.isSuccess){
      const res = loginResult.data.data;
      let userInfo = await this.getUserInfo(res);
      const token = userInfo.accessToken.access_token;
      this.setState({ isAutenticated: true, userInfo, token,registered:res.alreadyRegistered });
    }
    else
      return loginResult.data.message;
  }
  async updatePassword(password){
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
    localStorage.clear('brxelctoken');
    this.state.recodeIn = false;
    this.setState({ isAutenticated: false })
  }
  async interByStorage() {
    let storage = localStorage.getItem('brxelctoken');
    if (!storage || storage === null) { this.setState({}); return; }
    storage = JSON.parse(storage);
    Axios.defaults.headers.common['Authorization'] = 'Bearer ' + storage.token;
    let res;
    $('.loading').css({display:'flex'});
    try{
      res = await Axios.post(`${this.apiBaseUrl}/BOne/GetCustomer`, { "DocCode": storage.userInfo.cardCode });
      //$('.loading').css({display:'none'});
    }
    catch(err){
      this.setState({pageError:{text:'سرویس دهنده در دسترس نیست',subtext:'BOne/GetCustomer ' + err.message}})
    }
    if (res.status === 401) {
      this.setState({});
      return;
    }
    this.setState({ isAutenticated: true, userInfo: storage.userInfo, token: storage.token, registered: true })
  }
  async componentDidMount() {
    this.mounted = true;
    this.interByStorage();
    
  }
  updateUserInfo(obj){
    let {token,userInfo} = this.state;
    let newUserInfo = {...userInfo,...obj};
    this.setState({userInfo:newUserInfo});
    localStorage.setItem('brxelctoken', JSON.stringify({ token, userInfo:newUserInfo }));
  }
  async getUserInfo(userInfo = this.state.userInfo){
    const b1Info = await fetch(`https://b1api.burux.com/api/BRXIntLayer/GetCalcData/${userInfo.cardCode}`, {
        mode: 'cors',headers: {'Access-Control-Allow-Origin': '*'}
    }).then((response) => {
        return response.json();
    }).then((data) => {
        return data;
    }).catch(function (error) {
        console.log(error);
        return null;
    });
    let {customer = {}} = b1Info;
    let ballance = customer.ballance;
    let visitorMobile;
    try{visitorMobile = b1Info.salePeople.mobile}
    catch{visitorMobile = ''}
    if(isNaN(ballance)){
      console.error(`b1Info.customer.ballance is ${ballance} but we set it on 0`)
      ballance = 0;
    }
    return {
      ...userInfo,
      cardCode:userInfo.cardCode,
      groupName:customer.groupName,
      cardName:customer.cardName,
      itemPrices:b1Info.itemPrices,
      slpphone:b1Info.slpphone,
      slpcode:customer.slpcode,
      slpname:customer.slpname,
      groupCode:customer.groupCode,
      ballance:-ballance,
      slpphone:'09123534314',
      visitorMobile
    }
  }
  header_layout(){
    return {
      html:<img src={logo} width={160} height={160} alt=''/>,align:'vh'
    }
  }
  render() {
    if (!this.mounted) { return <Loading/> }
    let {landing} = this.state;
    if(landing){
      return <Landing onClose={()=>this.setState({landing:false})}/>
    }
    let { isAutenticated, userInfo, token, registered ,pageError} = this.state;
    if(pageError){
      return (
        <>
        <RVD
          layout={{
            className:'page-error fullscreen',
            row:[
              {flex:1},
              {
                className:'page-error-image',
                column:[
                  {flex:3},
                  {html:<img src={EPSrc} width='100%'/>},
                  {size:24},
                  {html:<Icon path={mdiAlert} size={4}/>,align:'h'},
                  {html:pageError.text,align:'h'},
                  {html:pageError.subtext,align:'h'},
                  {size:36},
                  {html:'بارگزاری مجدد',className:'bm-reload',attrs:{onClick:()=>window.location.reload()}},
                  {flex:2}
                ]
              },
              {flex:1}

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
            model={{phoneNumber:userInfo.phoneNumber}}
            onClose={()=>this.setState({ isAutenticated: false })}
            onSubmit={(userInfo)=>this.setState({ userInfo, registered: true })}
          />
        )
      }
      localStorage.setItem('brxelctoken', JSON.stringify({ token, userInfo }));
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
          className:'bg3B55A5 ofy-auto fullscreen',
          column:[
            {size:48},
            this.header_layout(),
            {size:24},
            {
              html:(
                <OTPLogin
                  time={30}
                  header={<img src={logo} width={160} height={160}/>}
                  onInterNumber={(number)=>this.onInterNumber(number)}
                  onInterCode={(code)=>this.onInterCode(code)}
                  onInterPassword={(number,password)=>this.onInterPassword(number,password)}
                />
              )
            },
            {flex:1,style:{minHeight:240}}
          ]
        }}
      />
    )
  }
}
class Landing extends Component{
  constructor(props){
    super(props);
    this.state = {img:1}
    setInterval(()=>{
      this.setState({img:this.state.img * -1})
    },1000)
  }
  render(){
    let {img} = this.state;
    let {onClose} = this.props;
    return(
      <RVD
        layout={{
          className:'fullscreen',
          column:[
            {html:getSvg('mybrxlogo'),align:'vh',size:96},
            {html:<img src={img === 1?landsrc1:landsrc2} alt='' width='100%' height='100%' className='br-12' style={{maxWidth:400}}/>,align:'vh'},
            {html:'می ارزه; مجری جشنواره نورواره بروکس ',className:'fs-24 bold m-h-12',style:{textAlign:'right'}},
            {size:12},
            {html:'یک همکاری فوق العاده با بروکس! جشنواره نورواره 3 با تخفیف های باورنکردنی برای تحول فروش شما شروع شد.',className:'fs-16 m-h-12',style:{textAlign:'right'}},
            {flex:1},
            {html:<button className='button-2 m-h-12' onClick={()=>onClose()}>ورود به بازار می ارزه</button>},
            {size:12}
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
