// import React, { Component, createRef, useEffect, useState } from 'react';
// import RVD from 'react-virtual-dom';
// import AIOStorage from 'aio-storage';
// import AIOInput,{getFormInputs} from 'aio-input';
// import { Icon } from '@mdi/react';
// import { mdiCellphone, mdiLock, mdiLoading, mdiAccount, mdiAccountBoxOutline, mdiEmail, mdiChevronRight } from '@mdi/js';
// import AIOPopup from 'aio-popup';
// import './index.css';
// export type I_AL_storageKey = 'token' | 'userInfo' | 'userId';
// export type I_AL_model = {login:{userId?:string,password?:string},register:{[field:string]:any},profile?:any,forget?:{userId?:string}}
// export type I_AL_mode = 'OTPNumber' | 'phoneNumber' | 'OTPCode' | 'auth' | 'register' | 'forgetUserId' | 'forgetPassword' | 'email' | 'userName';
// export type I_AL_register = {type:'mode' | 'tab' | 'button',text:string,fields:any[],title:string,submitText:string,subtitle?:string | false};
// export type I_AL_profile = {model:any,onSubmit:(model:any)=>void,fields:any[],title:string,onClose?:Function,submitText:string,subtitle?:string|false}
// export type I_AL_forget = {mode:'email' | 'phoneNumber'}
// export type I_AL_props = { 
//     id:string, 
//     onSubmit:(model:I_AL_model,mode:I_AL_mode)=>Promise<void>, 
//     modes:I_AL_mode[], 
//     mode?:I_AL_mode,
//     timer:number, 
//     checkToken:(token:string | false,obj:{userId:string,userInfo?:any})=>Promise<boolean | undefined>, 
//     register:I_AL_register, 
//     userId?:string, 
//     attrs, 
//     forget, 
//     otpLength:number,
//     renderApp:(obj:{token:string,userId:string,userInfo:any,logout:()=>void,appState:any})=>React.ReactNode,
//     renderSplash:()=>React.ReactNode,
//     splashTime?:number,
//     renderLogin:(loginForm:React.ReactNode)=>React.ReactNode 
// }
// type I_AL_setStorage = (key:I_AL_storageKey,value:any)=>void;
// type I_AL_getStorage = (key:I_AL_storageKey)=>any;
// type I_AL_removeStorage = (key:I_AL_storageKey)=>void;
// type I_AL_logout = ()=>void;
// type I_AL_setMode = (mode:I_AL_mode)=>void;
// type I_AL_render = (p?:{profile?:{model:any,onSubmit:(model:any)=>void,fields:any[]},appState?:any,attrs?:any})=>React.ReactNode;
// type I_AL_getActions = (p:{setMode:(mode:I_AL_mode)=>void})=>void;
// interface I_AIOLOGIN extends I_AL_props {
//     setStorage:I_AL_setStorage;
//     getStorage:I_AL_getStorage;
//     removeStorage:I_AL_removeStorage;
//     logout:I_AL_logout;
//     getActions:I_AL_getActions;
//     profile?:I_AL_profile,
//     appState?:any
// }
// export default class AIOlogin {
//     setStorage:I_AL_setStorage;
//     getStorage:I_AL_getStorage;
//     removeStorage:I_AL_removeStorage;
//     logout:I_AL_logout;
//     setMode:I_AL_setMode;
//     render:I_AL_render;
//     getActions:I_AL_getActions;
//     constructor(props:I_AL_props) {
//         AIOLoginValidator(props);
//         let storage = AIOStorage(`-AIOLogin-${props.id}`);
//         this.setStorage = (key, value) => storage.save({ name: key, value });
//         this.getStorage = (key:I_AL_storageKey) => {
//             let token = storage.load({ name: 'token', def: false });
//             let userId = storage.load({ name: 'userId', def: '' });
//             let userInfo = storage.load({ name: 'userInfo' });
//             let res = { token, userId, userInfo }
//             if(key){return res[key]}
//             return res
//         }
//         this.removeStorage = (key:I_AL_storageKey)=>storage.remove({name:key})
//         this.logout = () => { this.removeStorage('token'); window.location.reload() }
//         this.render = (p) => {
//             let { attrs = props.attrs, profile,appState } = p || {};
//             if (profile) {
//                 if (typeof profile !== 'object' || !Array.isArray(profile.fields) || !profile.fields.length || typeof profile.onSubmit !== 'function') {
//                     let error = `
//                         aio-login-error => profile props should be an object contain :
//                         submitText : string | undefined,
//                         title : string | undefined,
//                         subtitle : string | undefined,
//                         fields : ( <default field> | string )[],
//                         model : { [ field : <default field>] : any },
//                         onClose : (() => void) | undefined,
//                         onSubmit : ( model : { [ field : <default field> ] : any } ) => void,
//                         <default field> : (
//                             "fullname" | "firstname" | "lastname" | "username" | "address" | "email" | "fathername" | "phone" | "mobile" | "postalcode",
//                             "nationalcode" | "idcode" | "cardbank" | "state" | "city" | "gender" | "married" | "militaryservice" | "location"
//                         )`;
//                     alert(error); console.log(error); return null;
//                 }
//             }
//             this.getActions = (p:{setMode:(mode:I_AL_mode)=>void})=>{if(!this.setMode){this.setMode = p.setMode}};
//             let PROPS = {
//                 ...props,
//                 getActions:this.getActions.bind(this),
//                 getStorage:this.getStorage.bind(this),
//                 setStorage:this.setStorage.bind(this),
//                 removeStorage:this.removeStorage.bind(this),
//                 logout: this.logout.bind(this),
//                 attrs,profile,appState
//             }
//             return <AIOLOGIN {...PROPS}/>
//         }
//     }
// }
// function AIOLOGIN(props:I_AIOLOGIN) {
//     let [isTokenChecked,setIsTokenChecked] = useState<boolean>(false)
//     let [showReload,setShowReload] = useState<boolean>(false)
//     let [loading,setLoading] = useState<boolean>(false)
//     let [showSplash,setShowSplash] = useState<boolean>(false)
//     let {
//         splashTime = 0,getStorage,removeStorage,otpLength, id, timer, modes, userId, register = {}, 
//         profile, attrs = {}, forget, logout, renderSplash = () => null,renderApp,renderLogin,appState
//     } = props;
//     let [mode,setMode] = useState<I_AL_mode>(props.mode || props.modes[0])
//     if(showSplash){setTimeout(()=>setShowSplash(false),splashTime)}
//     props.getActions({ setMode})
//     async function checkToken() {
//         let token = getStorage('token');
//         let userId = getStorage('userId');
//         let userInfo  = getStorage('userInfo');
//         let result;
//         try { result = await props.checkToken(token, { userId, userInfo }); }
//         catch (err) { new AIOPopup().addAlert({ type: 'error', text: 'بررسی توکن با خطا روبرو شد', subtext: getError(err) }) }
//         if (result === true) { setMode('auth') }
//         else if (result === false) { removeStorage('token') }
//         else {
//             if (typeof result === 'string') { new AIOPopup().addAlert({ type: 'error', text: 'بررسی توکن با خطا روبرو شد', subtext: result }) }
//             setShowReload(true)
//         }
//         setIsTokenChecked(true)
//     }
//     function getError(err) {
//         if (typeof err === 'string') { return err }
//         if (typeof err === 'object') {
//             if (typeof err.response === 'object') {
//                 if (typeof err.response.data === 'object') {
//                     let { message, Message } = err.response.data;
//                     return Message || message;
//                 }
//                 else if (typeof err.response.data === 'string') { return err.response.data }
//                 else { return 'error' }
//             }
//             else { return err.message || err.Message }
//         }
//     }
//     function init(){
//         if(profile){return}
//         checkToken();
//     }
//     useEffect(()=>{init()},[])
//     async function onSubmit(model) {
//         let { mode: currentMode } = this.state;
//         let res;
//         setLoading(true)
//         try { res = await props.onSubmit(model, currentMode) }
//         catch { setLoading(false); return; }
//         setLoading(false);
//         if (typeof res === 'string') {
//             let text = {
//                 "OTPNumber": 'ارسال شماره همراه',
//                 "OTPCode": 'ارسال کد یکبار مصرف',
//                 "userName": 'ارسال نام کاربری و رمز عبور',
//                 "phoneNumber": 'ارسال شماره همراه و رمز عبور',
//                 "email": 'ارسال آدرس ایمیل و رمز عبور',
//                 "register": 'عملیات ثبت نام',
//             }[currentMode]
//             text = `${text} با خطا روبرو شد`
//             let subtext = res;
//             new AIOPopup().addAlert({ type: 'error', text, subtext })
//         }
//     }
//     async function onSubmitProfile(model){
//         let res;
//         setLoading(true);
//         try { res = await profile.onSubmit(model) }
//         catch { setLoading(false); return; }
//         setLoading(false);
//         if (typeof res === 'string') {new AIOPopup().addAlert({ type: 'error', text:'ویرایش پروفایل با خطا روبرو شد', subtext:res })}
//     }
//     if(profile){
//         let props = { timer, id, attrs, userId,loading,profile,onSubmitProfile:this.onSubmitProfile.bind(this) }
//         return <LoginForm {...props}/>
//     }
//     if (showReload) { return (<div className='aio-login-reload'><button onClick={() => window.location.reload()}>بارگذاری مجدد</button></div>) }
//     //اگر هنوز توکن چک نشده ادامه نده
//     if (!isTokenChecked || showSplash) { 
//         return renderSplash() 
//     }
//     //اگر توکن چک شده و توکن ولید بوده renderApp رو کال کن و ادامه نده
//     if (mode === 'auth') {
//         let token = getStorage('token');
//         let userId = getStorage('userId');
//         let userInfo = getStorage('userInfo');
//         return renderApp({ token, userId, userInfo, logout,appState }); 
//     }
//     // وقتی به اینجا رسیدی یعنی توکن قطعا چک شده و ولید نبوده پس لاگین رو رندر کن
//     let content = (
//         <LoginForm {...{ forget, timer, otpLength, id, modes, attrs, userId,register,loading,mode }}
//             onSubmit={onSubmit}
//             onChangeMode={setMode}
//         />
//     )
//     if(renderLogin){return renderLogin(content)}
//     else{return content}
// }
// type I_LoginForm = {
//     id:string,timer?:number,mode:I_AL_mode,userId:string,register?:I_AL_register,profile?:I_AL_profile,forget?:I_AL_forget,
//     onChangeMode:(mode:I_AL_mode)=>void,onSubmit:(model:I_AL_model)=>Promise<void>,modes:I_AL_mode[],attrs?:any
// }
// function LoginForm(props:I_LoginForm) {
//     let {timer = 30,register,profile,forget,onChangeMode,onSubmit,modes,attrs} = props;
//     let [storage] = useState(AIOStorage(`-AIOLogin-${props.id}`))
//     let [tab,setTab] = useState<'login'|'register'>('login')
//     let [model,setModel] = useState<I_AL_model>(getInitialModel(props.mode))
//     let [error,setError] = useState<boolean>(!props.userId)
//     function getLabels(mode:I_AL_mode) {
//         if (profile) { 
//             let {title,onClose,submitText = 'ویرایش اطلاعات کاربری',subtitle = false} = profile;
//             if(!title && !onClose){return {inputLabel:false,title:false,subtitle:false,submitText,backButton:false}}
//             return { inputLabel: false, title: title || 'ویرایش اطلاعات کاربری', submitText, subtitle, backButton: !!onClose } 
//         }
//         if (mode === 'OTPNumber') {
//             let subtitle = 'شماره همراه خود را وارد کنید . پیامکی حاوی کد برای شما ارسال خواهد شد';
//             return { inputLabel: 'شماره همراه', title: 'ورود با کد یکبار مصرف', submitText: 'ورود', subtitle }
//         }
//         if (mode === 'OTPCode') { return { inputLabel: 'کد پیامک شده', title: false, submitText: 'ورود', subtitle: `کد پیامک شده به شماره ی ${model.login.userId} را وارد کنید` } }
//         if (mode === 'register') { 
//             let {title,submitText = 'ثبت نام',subtitle = false} = register;
//             return { inputLabel: false, title, submitText, subtitle, backButton: tab !== 'register' } 
//         }
//         if (mode === 'forgetUserId') {
//             let subtitle = `${forget.mode === 'phoneNumber' ? 'شماره همراه' : 'ایمیل'} خود را وارد کنید . کد باز یابی رمز عبور برای شما ارسال خواهد شد`
//             return { inputLabel: forget.mode === 'email' ? 'ایمیل' : 'شماره همراه', backButton: true, title: 'بازیابی رمز عبور', submitText: 'دریافت کد بازیابی رمز', subtitle }
//         }
//         if (mode === 'forgetPassword') {
//             let { mode } = forget;
//             let subtitle = `کد ${mode === 'phoneNumber' ? 'پیامک' : 'ایمیل'} شده به ${mode === 'phoneNumber' ? 'شماره ی' : 'آدرس'} ${model.forget.userId} را وارد کنید`
//             return { inputLabel: `کد ${mode === 'email' ? 'ایمیل' : 'پیامک'} شده`, backButton: true, title: 'بازیابی رمز عبور', submitText: 'تایید', subtitle }
//         }
//         if (mode === 'userName') { return { inputLabel: 'نام کاربری', title: 'ورود با نام کاربری', submitText: 'ورود', subtitle: false } }
//         if (mode === 'email') { return { inputLabel: 'ایمیل', title: 'ورود با ایمیل', submitText: 'ورود', subtitle: false } }
//         if (mode === 'phoneNumber') { return { inputLabel: 'شماره همراه', title: 'ورود با شماره همراه', submitText: 'ورود', subtitle: false } }
//     }
//     function getInitialModel() {
//         return { forget: {}, register: {}, profile: (profile || {}).model, login: { userId:props.userId } };
//     }
//     function changeMode(mode:I_AL_mode) {
//         onChangeMode(mode);
//         setModel(getInitialModel())
//     }
//     function title_layout({ title, backButton }) {
//         if (!title) { return false }
//         return {
//             className: 'aio-login-title', align: 'v',
//             row: [
//                 { show: !!backButton, html: <Icon path={mdiChevronRight} size={1} />, size: 48, align: 'vh', onClick: () => profile?profile.onClose():changeMode(modes[0]) },
//                 { html: title }
//             ]
//         }
//     }
//     function subtitle_layout({ subtitle }) {
//         if (!subtitle) { return false }
//         return { html: subtitle, className: 'aio-login-subtitle' }
//     }
//     function getInput_phoneNumber(field, getValue) {
//         return {
//             field, label: 'شماره همراه',
//             input: {
//                 type: 'text', justNumber: true, before: <Icon path={mdiCellphone} size={0.8} />,
//                 placeholder: '09...', maxLength: 11, attrs: { style: { direction: 'ltr' } }
//             },
//             validations: [['function', () => {
//                 let value = getValue();
//                 if (!value) { return 'شماره همراه خود را وارد کنید' }
//                 if (value.indexOf('09') !== 0) { return 'شماره همراه باید با 09 شروع شود' }
//                 if (value.length !== 11) { return 'شماره همراه باید 11 رقم باشد' }
//                 return false
//             }]]
//         }
//     }
//     function getInput_userName(field) {
//         let { userId } = this.props;
//         return {
//             field, label: 'نام کاربری', validations: [['required']], style: { direction: 'ltr' },
//             input: { type: 'text', disabled: !!userId, before: <Icon path={mdiAccount} size={0.8} /> }
//         }
//     }
//     function getInput_email(field, getValue) {
//         let { userId } = this.props;
//         return {
//             field, label: 'ایمیل', style: { direction: 'ltr' },
//             input: { type: 'text', disabled: !!userId, before: <Icon path={mdiEmail} size={0.8} /> },
//             validations: [['function', () => {
//                 let value = getValue();
//                 if (!value) { return 'ایمیل خود را وارد کنید' }
//                 let atSignIndex = value.indexOf('@');
//                 if (atSignIndex < 1) { return 'ایمیل خود را به درستی وارد کنید' }
//                 if (value.indexOf('.') === -1) { return 'ایمیل خود را به درستی وارد کنید' }
//                 if (value.lastIndexOf('.') > value.length - 3) { return 'ایمیل خود را به درستی وارد کنید' }
//                 return false
//             }]],
//         }
//     }
//     function getInput_otp(field, getValue) {
//         let { otpLength } = this.props;
//         return {
//             field, label: 'رمز یکبار مصرف',
//             input: { maxLength: otpLength, justNumber: true, type: 'text', placeholder: Array(otpLength).fill('-').join(''), className: 'aio-login-otp-code' },
//             validations: [['function', () => {
//                 let { otpLength } = this.props;
//                 let value = getValue();
//                 if (!value) { return 'رمز یکبار مصرف را وارد کنید' }
//                 return value.length !== otpLength ? `رمز یکبار مصرف باید شامل ${otpLength} کاراکتر باشد` : false
//             }]]
//         }
//     }
//     function getInput_password(field, type) {
//         let validations;
//         if (type === 2) {
//             validations = [['function', () => {
//                 let { model } = this.state;
//                 let value = model.forget.reNewPassword;
//                 if (!value) { return 'تکرار رمز عبور جدید را وارد کنید' }
//                 if (value.length < 1) { return 'رمز عبور را وارد کنید' }
//                 if (value !== model.forget.newPassword) { return 'رمز با تکرار آن مطابقت ندارد' }
//                 return false;
//             }]]
//         }
//         else { validations = [['required']] }
//         return {
//             field, label: ['رمز عبور', 'رمز عبور جدید', 'تکرار رمز عبور جدید'][type], validations,
//             input: { type: 'password', before: <Icon path={mdiLock} size={0.8} />, style: { direction: 'ltr' }, visible: true }
//         }
//     }
//     function getInputs() {
//         let { forget, mode, profile,register } = this.props;
//         if (profile) { return getFormInputs(profile.fields, 'profile') }
//         if (mode === 'register') { return getFormInputs(register.fields, 'register') }
//         if (mode === 'forgetUserId') {
//             return [this['getInput_' + forget.mode](`value.forget.userId`, () => this.state.model.forget.userId)]
//         }
//         if (mode === 'forgetPassword') {
//             return [
//                 this.getInput_otp('value.forget.password', () => this.state.model.forget.password),
//                 this.getInput_password('value.forget.newPassword', 1),
//                 this.getInput_password('value.forget.reNewPassword', 2),
//             ]
//         }
//         if (mode === 'OTPNumber') { return [this.getInput_phoneNumber(`value.login.userId`, () => this.state.model.login.userId)] }
//         if (mode === 'OTPCode') { return [this.getInput_otp('value.login.password', () => this.state.model.login.password)] }
//         return [
//             this['getInput_' + mode]('value.login.userId', () => this.state.model.login.userId),
//             this.getInput_password('value.login.password', 0)
//         ]
//     }
//     function form_layout(labels) {
//         let { model } = this.state, { mode,userId } = this.props;
//         return {
//             className: 'ofy-auto',
//             html: (
//                 <AIOInput
//                     type='form' key={mode} lang='fa' value={model} rtl={true} initialDisabled={!userId}
//                     onChange={(model,errors) => { this.setState({ model,error:!!errors.length }) }}
//                     inputs={{ props: { gap: 12 }, column: this.getInputs(labels) }}
//                     footer={({ disabled }) => this.submit_layout({ submitText: labels.submitText, disabled })}
//                 />
//             )
//         }
//     }
//     function submit_layout({ submitText, disabled }) {
//         let { loading, timer, mode } = this.props;
//         let layout = {
//             style: { padding: '0 12px' },
//             html: (<SubmitButton mode={mode} timer={timer} text={submitText} loading={loading} disabled={() => !!disabled} onClick={() => this.onSubmit()} />)
//         }
//         return <RVD layout={layout} />
//     }
//     async function onSubmit() {
//         let { onSubmit, profile,onSubmitProfile } = this.props;
//         let { model,error } = this.state;
//         if(error){return}
//         if (profile) { onSubmitProfile(model) }
//         else { onSubmit(model); }
//     }
//     function changeUserId_layout() {
//         let { mode } = this.props;
//         if (mode !== 'OTPCode') { return false }
//         return { onClick: () => this.changeMode('OTPNumber'), className: 'aio-login-text m-b-12', align: 'vh', html: 'تغییر شماره همراه' }
//     }
//     function recode_layout() {
//         let { model } = this.state;
//         let { mode, onChangeMode } = this.props;
//         if (mode !== 'OTPCode') { return false }
//         return {
//             className: 'aio-login-text m-b-12', html: `ارسال مجدد کد`, align: 'vh',
//             onClick: () => {
//                 onChangeMode('OTPNumber')
//                 this.setState({ model: { ...model, login: { ...model.login, password: '' } } })
//             }
//         }
//     }
//     function changeMode_layout() {
//         let { mode, modes, profile } = this.props;
//         if (mode === 'register' || !!profile || mode === 'forgetUserId' || mode === 'forgetPassword') { return false }
//         let others = []
//         for (let i = 0; i < modes.length; i++) {
//             let key = modes[i];
//             if (mode === key) { continue }
//             if (mode === 'OTPCode' && key === 'OTPNumber') { continue }
//             let title = { OTPNumber: 'رمز یکبار مصرف', userName: 'نام کاربری و رمز عبور', email: 'آدرس ایمیل و رمز عبور', phoneNumber: 'شماره همراه و رمز عبور' }[key];
//             let icon = { OTPNumber: mdiAccount, phoneNumber: mdiCellphone, userName: mdiAccountBoxOutline, email: mdiEmail }[key]
//             others.push({
//                 flex: 1, className: `of-visible aio-login-other-method aio-login-${key}`,
//                 onClick: () => this.changeMode(key),
//                 row: [{ html: <Icon path={icon} size={0.7} />, align: 'vh' }, { size: 6 }, { align: 'v', html: title }]
//             })
//         }
//         if (!others.length) { return false }
//         return {
//             className: 'p-h-12',
//             column: [
//                 {
//                     gap: 6,
//                     row: [
//                         { flex: 1, html: <div className='aio-login-splitter'></div>, align: 'v' },
//                         { html: 'یا ورود با', align: 'v', className: 'aio-login-or bold' },
//                         { flex: 1, html: <div className='aio-login-splitter'></div>, align: 'v' },
//                     ]
//                 },
//                 { size: 12 },
//                 { grid: others, gridCols: 1, gridRow: { gap: 12 } }
//             ]
//         }
//     }
//     function registerButton_layout() {
//         let { register, mode } = this.props;
//         if ( mode === 'register') { return false }
//         if (!register.type !== 'button') { return false }
//         let {buttonText = 'ثبت نام'} = register
//         return { align: 'vh', html: (<button onClick={() => this.changeMode('register')} className='aio-login-register-button'>{buttonText}</button>) }
//     }
//     function registerTab_layout() {
//         let { register, modes, mode,profile } = this.props;
//         if(!register || register.type !== 'tab' || profile || mode === 'forgetUserId' || mode === 'forgetPassword') { return false }
//         let {tabText = 'ثبت نام'} = register;
//         return {
//             html: (
//                 <AIOInput
//                     className='aio-login-register-tabs'
//                     type='tabs' value={mode === 'register' ? 'register' : 'login'}
//                     options={[{ text: 'ورود', value: 'login' }, { text: tabText, value: 'register' }]}
//                     onChange={(tab) => {
//                         if (tab === 'login') { this.changeMode(modes[0]) }
//                         else if (tab === 'register') { this.changeMode('register') }
//                     }}
//                 />
//             )
//         }
//     }
//     function forget_layout() {
//         if (profile) { return false }
//         if (!forget) { return false }
//         if (props.mode === 'register' || props.mode === 'OTPCode' || props.mode === 'OTPNumber' || props.mode === 'forgetUserId' || props.mode === 'forgetPassword') { return false }
//         let { text = [] } = forget
//         let buttonText = text[0] || 'رمز عبور خود را فراموش کرده اید؟ اینجا کلیک کنید';
//         return { className: 'aio-login-forget', html: buttonText, onClick: () => changeMode('forgetUserId') }
//     }
//     let labels = getLabels(mode);
//     let column;
//     if(profile){column = [{ column: [title_layout(labels), subtitle_layout(labels)] },form_layout(labels)]}
//     else {
//         column = [
//             registerTab_layout(),
//             { column: [title_layout(labels), subtitle_layout(labels)] },
//             form_layout(labels),forget_layout(),
//             { gap: 12, align: 'h', row: [recode_layout(), changeUserId_layout()] },
//             changeMode_layout(),registerButton_layout()
//         ]
//     }
//     let className = 'aio-login' + (attrs.className ? ' ' + attrs.className : '')
//     let style = attrs.style;
//     return (<RVD layout={{className, style,column,attrs:{ onKeyDown: (e) => { if (e.keyCode === 13) { onSubmit() } } }}}/>)
    
// }
// class SubmitButton extends Component {
//     state = {time: this.getDelta()}
//     async onClick() {
//         let { onClick, loading } = this.props;
//         if (loading) { return; }
//         this.setLastTry();
//         await onClick();
//     }
//     setLastTry() {
//         let { mode } = this.props;
//         AIOStorage('aiologinlasttrypermode').save({ name: 'dic', value: { ...this.getLastTry(), [mode]: new Date().getTime() } })
//         let delta = this.getDelta();
//         this.setState({ time: delta })
//     }
//     getLastTry() {
//         return AIOStorage('aiologinlasttrypermode').load({ name: 'dic', def: {} });
//     }
//     getDelta() {
//         let { mode, timer } = this.props;
//         if (!timer) { return 0 }
//         let lastTry = this.getLastTry();
//         let lastTime = lastTry[mode]
//         if (!lastTime) { return 0 }
//         let delta = new Date().getTime() - lastTime;
//         delta = delta / 1000;
//         delta = timer - delta;
//         delta = Math.round(delta)
//         if (delta < 0) { delta = 0 }
//         return delta
//     }
//     render() {
//         let { disabled, loading, text, outline } = this.props;
//         let isDisabled = disabled();
//         let loadingText = 'در حال ارسال';
//         let { time } = this.state;
//         if (time > 0) {
//             setTimeout(() => this.setState({ time: this.state.time - 1 }), 1000);
//         }
//         else if (time < 0) {
//             setTimeout(() => this.setState({ time: 0 }), 0);
//         }
//         if (time) { 
//             isDisabled = true; 
//             if(!loading){text = `لطفا ${time} ثانیه صبر کنید` }
//         }
//         return (
//             <button className={'aio-login-submit' + (outline ? ' aio-login-submit-outline' : '')} disabled={isDisabled} onClick={() => this.onClick()}>
//                 {!loading && text}
//                 {!!loading && <Icon path={mdiLoading} size={1} spin={0.2} style={{ margin: '0 6px' }} />}
//                 {!!loading && loadingText}
//             </button>
//         )
//     }
// }
// function AIOLoginValidator(props) {
//     let { id, onSubmit, modes, timer, checkToken, register, userId = '', renderApp, forget, otpLength,renderLogin } = props;
//     for (let prop in props) {
//         if (['id', 'renderApp','renderLogin', 'onSubmit', 'modes', 'timer', 'checkToken', 'register', 'userId', 'attrs', 'forget', 'otpLength', 'renderSplash','splashTime'].indexOf(prop) === -1) {
//             let error = `
//                 aio-login error => invalid props 
//                 ${prop} is not one of AIOLogin props,
//                 valid props are 'id' | 'renderApp' | 'renderLogin','onSubmit' | 'modes' | 'timer' | 'checkToken' | 'register' | 'userId' | 'attrs' | 'forget' | 'otpLength' | 'renderSplash' | 'splashTime'
//             `;
//             alert(error); console.log(error); return;
//         }
//     }
//     if (!id) { alert(`aio-login error=> missing id props, id props should be an string`) }
//     if (!renderApp) {
//         let error = `
//             aio-login error => missing renderApp props
//             renderApp type is => ({token:string,userId:string,userInfo?:any,logout:function})=>React.ReactNode
//         `;
//         alert(error); console.log(error); return;
//     }
//     if (typeof userId !== 'string') {
//         let error = `aio-login error=> userId props should be an string`;
//         alert(error); console.log(error); return;
//     }
//     if (!checkToken) {
//         let error = `
//             aio-login error=> missing checkToken props 
//             checkToken type is => (token:string)=>boolean
//             for prevent it set checkToken : ()=>true
//         `;
//         alert(error); console.log(error); return;
//     }
//     if (!onSubmit) {
//         let error = `
//             aio-login error=> missing onSubmit props,
//             onSubmit type is => 
//             (model:<model type>,mode:<mode type>)=>string|undefined
//             <model type> is {
//                 login:{userId:string,password:string | number},
//                 forget:{userId:string,password:string | number},
//                 register:{[field:string]:any},
//             }
//             <mode type> is 'OTPNumber' | 'OTPCode' | 'userName' | 'email' | 'phoneNumber' | 'forgetUserId' | 'forgetPassword' | 'register' | 'auth'
//         `;
//         alert(error); console.log(error); return;
//     }
//     if (renderLogin && typeof renderLogin !== 'function') {
//         let error = `
//             aio-login error=> renderLogin props is not a function,
//             renderLogin type is => 
//             ( loginForm : React.ReactNode ) => React.ReactNode
//         `;
//         alert(error); console.log(error); return;
//     }
//     if (typeof timer !== 'number') {
//         let error = `aio-login error=> timer props should be an number`;
//         alert(error); console.log(error); return;
//     }
//     if (!Array.isArray(modes) || !modes.filter((o) => ['OTPNumber', 'userName', 'email', 'phoneNumber'].indexOf(o) !== -1).length) {
//         let error = `
//             aio-login error=> modes props should be an array contain composite of 'OTPNumber' | 'userName' | 'email' | 'phoneNumber'
//         `
//         alert(error); console.log(error); return;
//     }
//     if (modes.indexOf('OTPNumber') !== -1) {
//         if (!otpLength) {
//             let error = `aio-login error => otpLength props is not an number (for define length of otp code)`
//             alert(error); console.log(error); return;
//         }
//     }
//     if (register) {
//         if (
//             typeof register !== 'object' ||
//             ['mode', 'tab', 'button'].indexOf(register.type) === -1 ||
//             !Array.isArray(register.fields) ||
//             !register.fields.length
//         ) {
//             let error = `
//                 aio-login-error => register props should be an object contain :
//                 type : "mode" | "tab" | "button"
//                 tabText : string | undefined
//                 buttonText : string | undefined
//                 submitText : string | undefined
//                 title : string | undefined
//                 subtitle : string | undefined
//                 fields:(<default field> | object)[]

//                 <default field>:(
//                     "fullname" | "firstname" | "lastname" | "username" | "address" | "email" | "fathername" | "phone" | "mobile" | "postalcode",
//                     "nationalcode" | "idcode" | "cardbank" | "state" | "city" | "gender" | "married" | "militaryservice" | "location"
//                 )
//             `;
//             alert(error); console.log(error); return;
//         }
//     }

//     if (forget) {
//         let message = `aio-login error=> forget props should be an object contain mode:'phoneNumber | email'`
//         if (typeof forget !== 'object') { alert(message) }
//         if (['phoneNumber', 'email'].indexOf(forget.mode) === -1) { alert(message); console.log(message); return; }
//     }
// }
