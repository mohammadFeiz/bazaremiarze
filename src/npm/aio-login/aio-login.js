import React,{Component} from 'react';
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import AIOStorage from './../../npm/aio-storage/aio-storage';
import {Icon} from '@mdi/react';
import {mdiCellphone,mdiLock,mdiLoading} from '@mdi/js';
import './index.css';
export class OTPLogin extends Component{
    constructor(props){
      super(props);
      this.storage = AIOStorage('otp-login');
      this.state = {
        mode:'inter-phone',error:'',number:''
      }
    }
    getDelta(){
      let {time} = this.props; 
      let lastTime = this.storage.load('lastTime',new Date().getTime() - (time * 1000));
      return new Date().getTime() - lastTime;
    }
    async onInterPhone(number) {
      let {time,onInterNumber} = this.props;
      let delta = this.getDelta(number);
      if(delta >= time * 1000){
        console.log('send phone number to server',number);
        let res = await onInterNumber(number);
        this.storage.save(new Date().getTime(),'lastTime');
        if(typeof res === 'string'){
          this.storage.save(new Date().getTime() - (time * 1000),'lastTime');
          this.setState({mode:'error',error:res,number:''})
          return
        }
        else if(res !== true){return}
      }
      this.setState({ mode: 'inter-code',number})
    }
    async onInterCode(code) {
      let {onInterCode} = this.props;
      let res = await onInterCode(code);
      if(typeof res === 'string') {
          this.setState({ error: res,mode:'error' })
      }
    }
    async onInterPassword(number,password){
      let {onInterPassword} = this.props;
      let res = await onInterPassword(number,password);
      if(typeof res === 'string') {
          this.setState({ error: res,mode:'error' })
      }
    }
    render(){
      let {mode,number,error} = this.state;
      let {time} = this.props;
      return (
        <RVD
          layout={{
            className:'otp-login ofy-auto',
            column: [
              { 
                show:mode === 'inter-phone',align:'h',
                html:()=>(
                  <NumberForm
                    time={time}
                    onSubmit={(number)=>this.onInterPhone(number)}
                    onInterPassword={(number,password)=>this.onInterPassword(number,password)}
                    getDelta={this.getDelta.bind(this)}
                  />
                )
              },
              { 
                show:mode === 'inter-code',align:'h',
                html:()=>(
                  <CodeForm 
                    number={number}
                    time={time}
                    getDelta={this.getDelta.bind(this)}
                    onSubmit={async (code)=>await this.onInterCode(code)} 
                    onClose={()=>this.setState({ mode: 'inter-phone'})}
                    onResend={async (number)=>await this.onInterPhone(number)}
                  />
                )
              },
              { show:mode === 'error',html:()=><CodeError error={error} onClose={()=>this.setState({ error: '',mode:'inter-phone' })}/>},
            ]
          }}
        />
      )
    }
  }
  OTPLogin.defaultProps = {time:60}
  //time getDelta onSubmit
  class NumberForm extends Component{
    constructor(props){
      super(props);
      this.state = {number:'',password:'',error:'شماره همراه خود را وارد کنید',remainingTime:props.time,mode:'otp'}
    }
    componentDidMount(){
      this.update()
    }
    update(){
      let {getDelta,time} = this.props;
      clearTimeout(this.tiomeout);
      let delta = getDelta();
      if(delta >= time * 1000){this.setState({remainingTime:0})}
      else{
        this.setState({remainingTime:Math.round(((time * 1000) - delta) / 1000)})
        this.tiomeout = setTimeout(()=>this.update(),1000)
      }
    }
    getError(number) {
      if (!number || !number.length) { return 'شماره همراه خود را وارد کنید' }
      if (number.indexOf('09') !== 0) { return 'شماره همراه باید با 09 شروع شود' }
      if (number.length !== 11) { return 'شماره همراه باید 11 رقم باشد' }
      return false;
    }
    onChangeNumber(e){
      let value = e.target.value;
      if (value.length > 11) { return }
      this.setState({number:value,error:this.getError(value)})
    }
    async onSubmit(){
      let {error,number,password,mode} = this.state;
      if(error){return}
      if(mode === 'otp'){
        let {onSubmit} = this.props;
        await onSubmit(number)
      }
      else if(mode === 'password'){
        let {onInterPassword} = this.props;
        await onInterPassword(number,password);
      }
    }
    getInput(type){
      let {number,mode,password} = this.state;
      let {onInterPassword} = this.props;
      if(type === 'number'){
        return (
          <div className='otp-login-input'>
            <div className='otp-login-input-icon'>
              <Icon path={mdiCellphone} size={0.8} />
            </div>
            <input key={mode}
              type='number' tabIndex={0}
              onKeyDown={(e) => {if (e.keyCode === 13) { this.onSubmit() }}}
              value={number} onChange={(e) => this.onChangeNumber(e)} placeholder='09...'
            />
          </div>
        )
      }
      if(type === 'password'){
        return (
          <div className='otp-login-input'>
            <div className='otp-login-input-icon'>
              <Icon path={mdiLock} size={0.8} />
            </div>
            <input key={mode}
              type='password' tabIndex={0}
              onKeyDown={(e) => {if (e.keyCode === 13) { this.onSubmit() }}}
              value={password} onChange={(e) => this.setState({password:e.target.value})}
            />
          </div>
        )
      }
      
    }
    title_layout(){
      return { html: 'ورود | ثبت نام', className: 'otp-login-text1' }
    }
    subtitle_layout(){
      let {remainingTime,mode} = this.state;
      if(mode === 'otp'){
        if(remainingTime){
          return { html: `شماره تلفن همراه خود را پس از ${remainingTime} ثانیه وارد کنید`, className: 'otp-login-text2' }
        }
        else{
          return {html:'شماره تلفن همراه خود را وارد کنید. پیامکی حاوی کد برای شما ارسال میشود',className:'otp-login-text2'}
        }
      }
      if(mode === 'password'){
        return {html:'شماره تلفن همراه و رمز عبور را وارد کنید.',className:'otp-login-text2'}
      }
    }
    inputs_layout(){
      let {remainingTime,mode} = this.state;
      if(remainingTime && mode === 'otp'){return false}
      return {
        gap:12,
        column:[
          {style:{padding:'0 12px'},html: ()=>this.getInput('number')},
          { show:mode === 'password',style:{padding:'0 12px'},html: ()=>this.getInput('password') }
        ]
      }
    }
    error_layout(){
      let {error,remainingTime,mode,password} = this.state;
      if(remainingTime && mode === 'otp'){return false}
      return {
        className:'otp-login-error-container',
        column:[
          { show:!!error,html: error, align: 'v', className: 'otp-login-error'},
          { show:mode === 'password' && password.length < 6,html: 'رمز عبور باید حداقل 6 کاراکتر باشد', align: 'v', className: 'otp-login-error'}  
        ]
      }
    }
    submit_layout(){
      let {error,remainingTime,mode,password} = this.state;
      if(remainingTime && mode === 'otp'){return false}
      return {
        style:{padding:'0 12px'},
        html: (
          <SubmitButton 
            disabled={!!error || (mode === 'password' && password.length < 6)}
            onClick={async () => await this.onSubmit()}
          />
        )
      }
    }
    changeMode_layout(){
      let {mode} = this.state;
      return {
        column:[
          {
            gap:6,className:'p-h-12',
            row:[
              {flex:1,html:<div className='otp-login-splitter'></div>,align:'v'},
              {html:'یا',align:'v',className:'otp-login-or'},
              {flex:1,html:<div className='otp-login-splitter'></div>,align:'v'},
            ]
          },
          {
            html:(
              <button 
                className='otp-login-change-mode' 
                onClick={()=>this.setState({mode:mode === 'otp'?'password':'otp',number:'',password:''})}
              >{mode === 'otp'?'ورود با رمز عبور':'ورود با کد یکبار مصرف'}</button>
            ),
            className:'p-h-12 of-visible'
          }
        ]
      }
    }
    render(){
      return (
        <RVD
          layout={{
            className:'otp-login-form',
            column: [
              {
                className:'of-visible',
                column: [
                  this.title_layout(),
                  {size:12},
                  this.subtitle_layout(),
                  {size:12},
                  this.inputs_layout(),
                  this.error_layout(),
                  this.submit_layout(),
                  {size:12},
                  this.changeMode_layout()
                ]
              },
              { size: 16 }
            ]
          }}
        />
      )
    }
  }
  //getDelta number onSubmit onClose onResend
  class CodeForm extends Component{
    constructor(props){
      super(props);
      this.state = {code:'',recode:false}
      this.update();
    }
    label_layout(){
      let {number} = this.props;
      return {
        column:[
          {html: 'کد تایید را وارد کنید',className: 'otp-login-text1'},
          { size: 12 },
          {html: `کد تایید برای شماره ${number} پیامک شد`,className: 'otp-login-text2'}    
        ]
      }
    }
    input_layout(){
      let {code} = this.state;
      return {
        style:{padding:'0 12px'},
        html: (
          <div className='otp-login-input'>
            <input className='otp-login-code' type='number' value={code} onChange={(e) => this.onChange(e.target.value)} maxLength={4} placeholder='- - - -'/>
          </div>
        )
      }
    }
    submit_layout(){
      let {onSubmit} = this.props;
      let {code} = this.state;
      return {
        style:{padding:'0 12px'},
        html: (<SubmitButton disabled={isNaN(+code) || code.length !== 4} onClick={async () => await onSubmit(code)}/>)
      }
    }
    update(){
      let {getDelta,number,time} = this.props;
      clearTimeout(this.tiomeout);
      let delta = getDelta(number);
      if(delta > time * 1000){this.setState({recode:true})}
      else{
        this.setState({remainingTime:Math.round(((time * 1000) - delta) / 1000),recode:false})
        this.tiomeout = setTimeout(()=>this.update(),1000)
      }
    }
    onChange(code){
      if (code.length > 4) { return }
      this.setState({code});
    }
    remainingTime_layout(){
      let {recode,remainingTime} = this.state;
      if(recode || !remainingTime){return false}
      return {
        gap: 3,className: 'otp-login-text3', align: 'h',
        row: [
          { html: `${remainingTime} ثانیه`, style: {fontWeight:'bold' }},
          { html: 'مانده تا دریافت مجدد کد' }
        ]
      }
    }
    recode_layout(){
      let {number,onResend} = this.props;
      let {recode} = this.state;
      if(!recode){return false}
      return {
        style:{padding:'0 12px'}, show: recode, align: 'h',
        html: (
          <button className='button-3' style={{ width: 'fit-content' }} 
            onClick={async () => {
              await onResend(number);
              this.update();
            }}
          >دریافت مجدد کد</button>
        )
      }
    }
    changePhone_layout(){
      let {onClose} = this.props;
      return {
        attrs: { onClick: () => onClose() },
        className: 'otp-login-change-phone',
        html: 'تغییر شماره تلفن یا ورود با رمز'
      }
    }
    render(){
      return (
        <RVD
          layout={{
            className:'otp-login-form',
            column: [
              this.label_layout(),
              { size: 24 },
              this.input_layout(),
              { size: 16 },
              this.submit_layout(),
              { size: 16 },
              this.remainingTime_layout(),
              this.recode_layout(),
              { size: 12 },
              this.changePhone_layout()
            ]
          }}
        />
      )
    }
  }
  class CodeError extends Component{
    render(){
      let {error,onClose} = this.props;
      return (
        <RVD
          layout={{
            className:'otp-login-form',
            column: [
              { html: error, className: 'otp-login-error', align: 'vh' },
              { size: 24 },
              { html: (<button className='otp-login-submit' onClick={() => onClose()}>تلاش مجدد</button>) }
            ]
          }}
        />
      )
    }
  }


  class SubmitButton extends Component{
    state = {loading:false}
    async onClick(){
      let {onClick} = this.props;
      let {loading} = this.state;
      if(loading){return;}
      this.setState({loading:true})
      await onClick();
      this.setState({loading:false})
    }
    render(){
      let {disabled} = this.props;
      let {loading} = this.state;
      return (
        <>
          <button 
            className='otp-login-submit' 
            disabled={disabled}
            onClick={() => this.onClick()}
          >{loading?(<><Icon path={mdiLoading} size={1} spin={0.2} style={{margin:'0 6px'}}/>در حال ارسال</>):'ورود'}</button>
          {
            loading &&
            <div style={{position:'fixed',width:'100%',height:'100%',left:0,top:0,zIndex:100000000000000000000000000000000000000}}></div> 
          }
        </>
        
      )
    }
  }