import React, { Component, createRef, useEffect, useState } from 'react';
import RVD from 'react-virtual-dom';
import AIOStorage from 'aio-storage';
import AIOInput,{getFormInputs} from 'aio-input';
import { Icon } from '@mdi/react';
import { mdiCellphone, mdiLock, mdiLoading, mdiAccount, mdiAccountBoxOutline, mdiEmail, mdiChevronRight } from '@mdi/js';
import AIOPopup from 'aio-popup';
import './index.css';
export type I_AIOLogin = {
    setToken:(token:string | false)=>void,
    getToken:()=>string,
    removeToken:()=>void,
    setUserInfo:(userInfo:any,key?:string)=>any,
    getUserInfo:(key?:string)=>any,
    updateUserInfo:(key:string,value:any)=>any,
    getUserId:() => string,
    setMode:(mode:I_AL_mode)=>void,
    render:(p?:I_AL_render_parameter)=>React.ReactNode,
    logout:()=>void,
    isRegistered:()=>boolean
}
type I_AL_storageKey = 'token' | 'userInfo' | 'userId' | 'isRegistered';
export type I_AL_model = {
    login:{userId?:string,password?:string},
    register:{[field:string]:any},
    profile?:any,
    forget?:{userId?:string,newPassword?:string,reNewPassword?:string,password?:string},
    userInfo:any,
    token:string | false
}
export type I_AL_mode = 'OTPNumber' | 'phoneNumber' | 'OTPCode' | 'auth' | 'register' | 'forgetUserId' | 'forgetPassword' | 'email' | 'userName';
type I_AL_register = {
    registerType:'auto' | 'tab' | 'button',
    registerText?:(location:'tab button' | 'register button' | 'modal header' | 'form title' | 'submit button')=>string,
    registerFields:any[],
    checkIsRegistered?:(p:{token:string,userId:string,userInfo:any})=>Promise<boolean>,
    onSubmitRegister:(model:I_AL_model)=>Promise<boolean>
};
type I_AL_profile = {model:any,onSubmit:(model:any)=>void,fields:any[],title?:string,onClose?:Function,submitText?:string,subtitle?:string|false}
type I_AL_forget = {mode:'email' | 'phoneNumber',text?:React.ReactNode}
export type I_AL_props = { 
    id:string, 
    onSubmit:(model:I_AL_model,mode:I_AL_mode)=>Promise<boolean>, 
    checkToken:(token:string | false,obj:{userId:string,userInfo?:any})=>Promise<boolean | undefined>, 
    renderApp:(obj:{token:string,userId:string,userInfo:any,logout:()=>void,appState:any,isRegistered?:boolean})=>React.ReactNode,
    modes:I_AL_mode[], 
    otpLength:number,
    renderLogin?:(loginForm:React.ReactNode)=>React.ReactNode 
    timer?:number, 
    register?:I_AL_register, 
    userId?:string, 
    attrs?:any, 
    forget?:I_AL_forget, 
    splash?:{render:()=>any,time:number}
}
type I_AL_setStorage = (key:I_AL_storageKey,value:any)=>void;
type I_AL_getStorage = (key:I_AL_storageKey)=>any;
type I_AL_removeStorage = (key:I_AL_storageKey)=>void;
type I_AL_logout = ()=>void;
type I_AL_setMode = (mode:I_AL_mode)=>void;
type I_AL_render = (p?:I_AL_render_parameter)=>React.ReactNode;
type I_AL_render_parameter = {
    profile?:I_AL_profile,appState?:any,attrs?:any
}
type I_AL_getActions = (p:{setMode:(mode:I_AL_mode)=>void})=>void;
interface I_AL_AIOLOGIN extends I_AL_props {
    setStorage:I_AL_setStorage;
    getStorage:I_AL_getStorage;
    removeStorage:I_AL_removeStorage;
    logout:I_AL_logout;
    getActions:I_AL_getActions;
    profile?:I_AL_profile,
    appState?:any
}

export default class AIOlogin {
    setStorage:I_AL_setStorage;
    getStorage:I_AL_getStorage;
    removeStorage:I_AL_removeStorage;
    logout:I_AL_logout;
    setMode:I_AL_setMode;
    render:I_AL_render;
    getActions:I_AL_getActions;
    setUserInfo:(userInfo:any,key?:string)=>any;
    updateUserInfo:(key:string,value:any)=>any;
    getUserInfo:(key?:string)=>any;
    getUserId:()=>string;
    getToken:()=>string;
    setToken:(token:string)=>void;
    removeToken:()=>void;
    isRegistered:()=>boolean;
    constructor(props:I_AL_props) {
        let storage = AIOStorage(`-AIOLogin-${props.id}`);
        this.getToken = ()=>storage.load({ name: 'token' });
        this.setToken = (token:string)=>storage.save({ name: 'token', value:token });
        this.removeToken = ()=>storage.save({ name: 'token', value:false });
        this.setUserInfo = (userInfo:any,key?:string)=>storage.save({ name: `userInfo${key?'.' + key:''}`, value:userInfo });
        this.getUserInfo = (key?:string)=>storage.load({ name: `userInfo${key?'.' + key:''}` })
        this.updateUserInfo = (key:string,value:any)=>{
            let userInfo = this.getUserInfo();
            userInfo = userInfo || {};
            userInfo[key] = value;
            this.setUserInfo(userInfo);
            return userInfo
        };
        this.getUserId = ()=>storage.load({ name: 'userId' })
        this.setStorage = (key, value) => storage.save({ name: key, value });
        this.getStorage = (key:I_AL_storageKey) => {
            let token = storage.load({ name: 'token', def: false });
            let userId = storage.load({ name: 'userId', def: '' });
            let userInfo = storage.load({ name: 'userInfo' });
            let isRegistered = storage.load({ name: 'isRegistered' });
            let res = { token, userId, userInfo,isRegistered }
            if(key){return res[key]}
            return res
        }
        this.isRegistered = ()=>{
            let isRegistered = this.getStorage('isRegistered');
            if(typeof isRegistered !== 'boolean'){return false}
            return isRegistered
        }
        this.removeStorage = (key:I_AL_storageKey)=>storage.remove({name:key})
        this.logout = () => { this.removeStorage('token'); window.location.reload() }
        this.render = (p?:I_AL_render_parameter) => {
            let { attrs = props.attrs, profile,appState } = p || {};
            if (profile) {
                if (typeof profile !== 'object' || !Array.isArray(profile.fields) || !profile.fields.length || typeof profile.onSubmit !== 'function') {
                    let error = `
                        aio-login-error => profile props should be an object contain :
                        submitText : string | undefined,
                        title : string | undefined,
                        subtitle : string | undefined,
                        fields : ( <default field> | string )[],
                        model : { [ field : <default field>] : any },
                        onClose : (() => void) | undefined,
                        onSubmit : ( model : { [ field : <default field> ] : any } ) => void,
                        <default field> : (
                            "fullname" | "firstname" | "lastname" | "username" | "address" | "email" | "fathername" | "phone" | "mobile" | "postalcode",
                            "nationalcode" | "idcode" | "cardbank" | "state" | "city" | "gender" | "married" | "militaryservice" | "location"
                        )`;
                    alert(error); console.log(error); return null;
                }
            }
            this.getActions = (p:{setMode:(mode:I_AL_mode)=>void})=>{if(!this.setMode){this.setMode = p.setMode}};
            let PROPS:I_AL_AIOLOGIN = {
                ...props,
                getActions:this.getActions.bind(this),
                getStorage:this.getStorage.bind(this),
                setStorage:this.setStorage.bind(this),
                removeStorage:this.removeStorage.bind(this),
                logout: this.logout.bind(this),
                attrs,profile,appState
            }
            return <AIOLOGIN {...PROPS}/>
        }
    }
}
function AIOLOGIN(props:I_AL_AIOLOGIN) {
    let {
        getStorage,removeStorage,otpLength, id, timer, modes, userId, register,setStorage, 
        profile, attrs = {}, forget, logout,renderApp,appState,splash
    } = props;
    let [isTokenChecked,setIsTokenChecked] = useState<boolean>(false)
    let [showReload,setShowReload] = useState<boolean>(false)
    let [loading,setLoading] = useState<boolean>(false)
    let [showSplash,setShowSplash] = useState<boolean>(!!splash) 
    let [mode,setMode] = useState<I_AL_mode>(props.modes[0])
    if(splash && showSplash){setTimeout(()=>setShowSplash(false),splash.time)}
    props.getActions({ setMode})
    function getError(err) {
        if (typeof err === 'string') { return err }
        if (typeof err === 'object') {
            if (typeof err.response === 'object') {
                if (typeof err.response.data === 'object') {
                    let { message, Message } = err.response.data;
                    return Message || message;
                }
                else if (typeof err.response.data === 'string') { return err.response.data }
                else { return 'error' }
            }
            else { return err.message || err.Message }
        }
    }
    function init(){
        if(profile){return}
        checkToken();
    }
    function renderSplash(){return splash?splash.render():null}
    function renderReload(){return <div className='aio-login-reload'><button onClick={() => window.location.reload()}>بارگذاری مجدد</button></div>}
    useEffect(()=>{init()},[])
    async function getCheckTokenResult(token,userId,userInfo):Promise<boolean | string>{
        let error:string;
        if(!props.checkToken){error = `aio-login error => checkToken props should be a function !!! but is ${typeof props.checkToken}` }
        else{
            try { 
                let result = await props.checkToken(token, { userId, userInfo }); 
                if(typeof result === 'string'){error = result}
                else if(typeof result === 'boolean'){return result}
            }
            catch (err) { error = getError(err) }
        }
        if(error){new AIOPopup().addAlert({ type: 'error', text: 'بررسی توکن با خطا روبرو شد', subtext: error })}
    }
    async function checkToken() {
        let token = getStorage('token'),userId = getStorage('userId'),userInfo = getStorage('userInfo');
        let result = await getCheckTokenResult(token,userId,userInfo)
        if (result === true) {await setAuthenticated()}
        else if (result === false) { removeStorage('token') }
        else {setShowReload(true)}
        setIsTokenChecked(true)
    }
    function alertMissedToken(){
        new AIOPopup().addAlert({ 
            type: 'error', 
            text: 'aio-login error => it seems you forgot set token by instance.setToken(string))',
            subtext:'because register.onSubmitRegister returned true (true means call instance.rendeeApp())'
        });
        setShowReload(true)
    }
    async function onSubmit(model:I_AL_model) {
        try { 
            setLoading(true);
            let res = await props.onSubmit(model, mode);
            if(typeof res !== 'boolean'){
                new AIOPopup().addAlert({type: 'error',text: 'aio login developer warning',subtext:'onSubmit should return a boolean'});
            }
            if(res === false){setLoading(false); return}
            //اگر ارسال شماره برای دریافت رمز یکبار مصرف موفقیت آمیز است برو به صفحه ورود کد یکبار مصرف
            if(mode === 'OTPNumber'){setMode('OTPCode'); setLoading(false);}
            //اگر بررسی رمز عبور موفقیت آمیز است برو برای تصمیم گیری ورود به اپ یا ورود به ثبت نام
            else {await setAuthenticated(model.login.userId)}
        }
        catch {}
    }
    async function onRegister(model:I_AL_model){
        try{
            let res = await register.onSubmitRegister(model)
            //اگر درخواست ورود به اپ داده شده
            if(res === true){
                //اگر توکن ست شده وارد اپ شو
                if(getStorage('token')){setMode('auth')}
                //اگر توکن ست نشده به کاربر آلرت فراموشی ست کردن توکن بده
                else {alertMissedToken()}
            }
            //اگر درخواستی مبنی بر ورود به اپ داده نشده برو به صفحه لاگین
            else if(res === false){window.location.reload()}
            else {setLoading(false)}
        }
        catch(err){
            new AIOPopup().addAlert({type: 'error',text: 'registeration error',subtext:getError(err)});
            setLoading(false);
        }
    }
    async function isRegistered(){
        if(userId){setStorage('userId',userId)}
        let token = getStorage('token');
        let isRegistered;
        if(register && register.checkIsRegistered){
            let userId = getStorage('userId');
            let userInfo = getStorage('userInfo');
            try{isRegistered = await register.checkIsRegistered({token,userId,userInfo})}
            catch(err){
                new AIOPopup().addAlert({type: 'error',text: 'registeration error',subtext:getError(err),onClose:()=>window.location.reload()});
                setLoading(false);
            }
        }
        setStorage('isRegistered',isRegistered);
        return isRegistered
    }
    async function setAuthenticated(userId?:string){
        //اگر با کش وارد نشده ایم یوزر آی در را در کش ثبت کن
        if(userId){setStorage('userId',userId)}
        let token = getStorage('token');
        let registered = await isRegistered();
        if(registered === false && register.registerType === 'auto'){setLoading(false); setMode('register')}
        else{
            if (token){setMode('auth')}
            else {alertMissedToken()}
        }
    } 
    async function onSubmitProfile(profileModel){
        let res;
        setLoading(true);
        try { res = await profile.onSubmit(profileModel) }
        catch { setLoading(false); return; }
        setLoading(false);
        if (typeof res === 'string') {new AIOPopup().addAlert({ type: 'error', text:'ویرایش پروفایل با خطا روبرو شد', subtext:res })}
    }
    function renderLogin(){
        let p:I_LoginForm = {forget, timer, otpLength, id, modes, attrs, userId,register,loading,mode,onSubmit,setMode,getStorage,logout,onRegister}
        let content = <LoginForm {...p}/>;
        if(props.renderLogin){return props.renderLogin(content)}
        else{return content}
    }
    if(profile){
        let props:I_LoginForm = { timer, id, attrs, userId,loading,profile,onSubmitProfile,getStorage,logout,onRegister }
        return <LoginForm {...props}/>
    }
    if (showReload) { return renderReload() }
    if(!isTokenChecked || showSplash){return renderSplash()}
    //اگر توکن چک شده و توکن ولید بوده renderApp رو کال کن و ادامه نده
    if (mode === 'auth') {
        //علت کش کردن یوزر آی دی اینه که در اینجا در رندر اپ ارسالش می کنیم 
        let token = getStorage('token');
        let userId = getStorage('userId');
        let userInfo = getStorage('userInfo');
        let isRegistered = getStorage('isRegistered');
        if(typeof token === 'string' && typeof userId === 'string'){
            return renderApp({ token, userId, userInfo, logout,appState,isRegistered }); 
        }
        else {removeStorage('token');}
    }
    // وقتی به اینجا رسیدی یعنی توکن قطعا چک شده و ولید نبوده پس لاگین رو رندر کن
    return renderLogin()
}


type I_LoginForm = {
    id:string,timer?:number,mode?:I_AL_mode,userId?:string,register?:I_AL_register,profile?:I_AL_profile,forget?:I_AL_forget,
    setMode?:(mode:I_AL_mode)=>void,onSubmit?:(model:I_AL_model)=>Promise<void>,modes?:I_AL_mode[],attrs?:any,logout:()=>void
    onSubmitProfile?:(profileModel:any)=>void,otpLength?:number,loading:boolean,getStorage:I_AL_getStorage,onRegister:(model:I_AL_model)=>void
}
function LoginForm(props:I_LoginForm) {
    let {timer = 30,register,profile,forget,setMode,onSubmit,modes,attrs,onSubmitProfile,otpLength,mode,loading,getStorage,logout,onRegister} = props;
    let {registerType = 'auto',registerText = ()=>'Register',registerFields} = register || {};
    let [tab,setTab] = useState<'login'|'register'>('login')
    let [model,setModel] = useState<I_AL_model>(getInitialModel())
    let [error,setError] = useState<boolean>(!props.userId)
    function getLabels(mode:I_AL_mode) {
        if (profile) { 
            let {title,onClose,submitText = 'ویرایش اطلاعات کاربری',subtitle = false} = profile;
            if(!title && !onClose){return {inputLabel:false,title:false,subtitle:false,submitText,backButton:false}}
            return { inputLabel: false, title: title || 'ویرایش اطلاعات کاربری', submitText, subtitle, backButton: !!onClose } 
        }
        if (mode === 'OTPNumber') {
            let subtitle = 'شماره همراه خود را وارد کنید . پیامکی حاوی کد برای شما ارسال خواهد شد';
            return { inputLabel: 'شماره همراه', title: 'ورود با کد یکبار مصرف', submitText: 'ورود', subtitle }
        }
        if (mode === 'OTPCode') { return { inputLabel: 'کد پیامک شده', title: false, submitText: 'ورود', subtitle: `کد پیامک شده به شماره ی ${model.login.userId} را وارد کنید` } }
        if (mode === 'register') { 
            return { inputLabel: false, title:registerText('form title'), submitText:registerText('submit button'), subtitle:false, backButton: tab !== 'register' } 
        }
        if (mode === 'forgetUserId') {
            let subtitle = `${forget.mode === 'phoneNumber' ? 'شماره همراه' : 'ایمیل'} خود را وارد کنید . کد باز یابی رمز عبور برای شما ارسال خواهد شد`
            return { inputLabel: forget.mode === 'email' ? 'ایمیل' : 'شماره همراه', backButton: true, title: 'بازیابی رمز عبور', submitText: 'دریافت کد بازیابی رمز', subtitle }
        }
        if (mode === 'forgetPassword') {
            let { mode } = forget;
            let subtitle = `کد ${mode === 'phoneNumber' ? 'پیامک' : 'ایمیل'} شده به ${mode === 'phoneNumber' ? 'شماره ی' : 'آدرس'} ${model.forget.userId} را وارد کنید`
            return { inputLabel: `کد ${mode === 'email' ? 'ایمیل' : 'پیامک'} شده`, backButton: true, title: 'بازیابی رمز عبور', submitText: 'تایید', subtitle }
        }
        if (mode === 'userName') { return { inputLabel: 'نام کاربری', title: 'ورود با نام کاربری', submitText: 'ورود', subtitle: false } }
        if (mode === 'email') { return { inputLabel: 'ایمیل', title: 'ورود با ایمیل', submitText: 'ورود', subtitle: false } }
        if (mode === 'phoneNumber') { return { inputLabel: 'شماره همراه', title: 'ورود با شماره همراه', submitText: 'ورود', subtitle: false } }
    }
    function getInitialModel() {
        return { 
            forget: {}, 
            register: {}, 
            profile: (profile || {}).model, 
            login: { userId:props.userId },
            token:getStorage('token'),
            userInfo:getStorage('userInfo') 
        };
    }
    function changeMode(mode:I_AL_mode) {
        setMode(mode);
        setModel(getInitialModel())
    }
    function title_layout(labels) {
        let { title, backButton } = labels;
        if (!title) { return false }
        return {
            className: 'aio-login-title', align: 'v',
            row: [
                { 
                    show: !!backButton, html: <Icon path={mdiChevronRight} size={1} />, size: 48, align: 'vh', 
                    onClick: () => {
                        if(profile){profile.onClose()}
                        else if(mode === 'register'){logout()}
                        else {changeMode(modes[0])}
                    } 
                },
                { html: title }
            ]
        }
    }
    function subtitle_layout({ subtitle }) {
        if (!subtitle) { return false }
        return { html: subtitle, className: 'aio-login-subtitle' }
    }
    function getInput_phoneNumber(field, getValue) {
        return {
            field, label: 'شماره همراه',
            input: {
                type: 'text', justNumber: true, before: <Icon path={mdiCellphone} size={0.8} />,
                placeholder: '09...', maxLength: 11, attrs: { style: { direction: 'ltr' } }
            },
            validations: [['function', () => {
                let value = getValue();
                if (!value) { return 'شماره همراه خود را وارد کنید' }
                if (value.indexOf('09') !== 0) { return 'شماره همراه باید با 09 شروع شود' }
                if (value.length !== 11) { return 'شماره همراه باید 11 رقم باشد' }
                return false
            }]]
        }
    }
    function getInput_userName(field) {
        return {
            field, label: 'نام کاربری', validations: [['required']], style: { direction: 'ltr' },
            input: { type: 'text', disabled: !!props.userId, before: <Icon path={mdiAccount} size={0.8} /> }
        }
    }
    function getInput_email(field, getValue) {
        return {
            field, label: 'ایمیل', style: { direction: 'ltr' },
            input: { type: 'text', disabled: !!props.userId, before: <Icon path={mdiEmail} size={0.8} /> },
            validations: [['function', () => {
                let value = getValue();
                if (!value) { return 'ایمیل خود را وارد کنید' }
                let atSignIndex = value.indexOf('@');
                if (atSignIndex < 1) { return 'ایمیل خود را به درستی وارد کنید' }
                if (value.indexOf('.') === -1) { return 'ایمیل خود را به درستی وارد کنید' }
                if (value.lastIndexOf('.') > value.length - 3) { return 'ایمیل خود را به درستی وارد کنید' }
                return false
            }]],
        }
    }
    function getInput_otp(field, getValue) {
        return {
            field, label: 'رمز یکبار مصرف',
            input: { maxLength: otpLength, justNumber: true, type: 'text', placeholder: Array(otpLength).fill('-').join(''), className: 'aio-login-otp-code' },
            validations: [['function', () => {
                let value = getValue();
                if (!value) { return 'رمز یکبار مصرف را وارد کنید' }
                return value.length !== otpLength ? `رمز یکبار مصرف باید شامل ${otpLength} کاراکتر باشد` : false
            }]]
        }
    }
    function getInput_password(field, type) {
        let validations;
        if (type === 2) {
            validations = [['function', () => {
                let value = model.forget.reNewPassword;
                if (!value) { return 'تکرار رمز عبور جدید را وارد کنید' }
                if (value.length < 1) { return 'رمز عبور را وارد کنید' }
                if (value !== model.forget.newPassword) { return 'رمز با تکرار آن مطابقت ندارد' }
                return false;
            }]]
        }
        else { validations = [['required']] }
        return {
            field, label: ['رمز عبور', 'رمز عبور جدید', 'تکرار رمز عبور جدید'][type], validations,
            input: { type: 'password', before: <Icon path={mdiLock} size={0.8} />, style: { direction: 'ltr' }, visible: true }
        }
    }
    function getInputs() {
        if (profile) { return getFormInputs(profile.fields, 'profile') }
        if (mode === 'register') { return getFormInputs(registerFields, 'register') }
        if (mode === 'forgetUserId') {
            if(forget.mode === 'email'){
                return getInput_email(`value.forget.userId`, () => model.forget.userId)    
            }
            else if(forget.mode === 'phoneNumber'){
                return getInput_phoneNumber(`value.forget.userId`, () => model.forget.userId)    
            }
        }
        if (mode === 'forgetPassword') {
            return [
                getInput_otp('value.forget.password', () => model.forget.password),
                getInput_password('value.forget.newPassword', 1),
                getInput_password('value.forget.reNewPassword', 2),
            ]
        }
        if (mode === 'OTPNumber') { return [getInput_phoneNumber(`value.login.userId`, () => model.login.userId)] }
        if (mode === 'OTPCode') { return [getInput_otp('value.login.password', () => model.login.password)] }
        let userIdInput;
        if(mode === 'userName'){userIdInput = getInput_userName('value.login.userId')}
        else if(mode === 'phoneNumber'){userIdInput = getInput_phoneNumber('value.login.userId', () => model.login.userId)}
        else if(mode === 'email'){userIdInput = getInput_email('value.login.userId', () => model.login.userId)}
        return [userIdInput,getInput_password('value.login.password', 0)]
    }
    function form_layout(labels) {
        return {
            className: 'ofy-auto',
            html: (
                <AIOInput
                    type='form' key={mode} lang='fa' value={{...model}} rtl={true} initialDisabled={!props.userId}
                    onChange={(model,errors) => {
                        setModel(model); 
                        setError(!!errors.length)
                    }}
                    inputs={{ props: { gap: 12 }, column: getInputs() }}
                    footer={({ disabled }) => submit_layout({ submitText: labels.submitText, disabled })}
                />
            )
        }
    }
    function submit_layout(p:{ submitText:string, disabled:boolean }) {
        let { submitText, disabled } = p;
        let layout = {
            style: { padding: '0 12px' },
            html: (<SubmitButton mode={mode} timer={timer} text={submitText} loading={loading} disabled={disabled} onClick={() => submit()} />)
        }
        return <RVD layout={layout} />
    }
    async function submit() {
        if(error){return}
        if (profile) { await onSubmitProfile(model) }
        else if(mode === 'register'){await onRegister(model)}
        else { await onSubmit(model); }
    }
    function changeUserId_layout() {
        if (mode !== 'OTPCode') { return false }
        return { onClick: () => changeMode('OTPNumber'), className: 'aio-login-text m-b-12', align: 'vh', html: 'تغییر شماره همراه' }
    }
    function recode_layout() {
        if (mode !== 'OTPCode') { return false }
        return {
            className: 'aio-login-text m-b-12', html: `ارسال مجدد کد`, align: 'vh',
            onClick: () => {
                setMode('OTPNumber')
                let newModel:I_AL_model = { ...model, login: { ...model.login, password: '' } }
                setModel(newModel)
            }
        }
    }
    function changeMode_layout() {
        if (mode === 'register' || !!profile || mode === 'forgetUserId' || mode === 'forgetPassword') { return false }
        let others = []
        for (let i = 0; i < modes.length; i++) {
            let key = modes[i];
            if (mode === key) { continue }
            if (mode === 'OTPCode' && key === 'OTPNumber') { continue }
            let title = { OTPNumber: 'رمز یکبار مصرف', userName: 'نام کاربری و رمز عبور', email: 'آدرس ایمیل و رمز عبور', phoneNumber: 'شماره همراه و رمز عبور' }[key];
            let icon = { OTPNumber: mdiAccount, phoneNumber: mdiCellphone, userName: mdiAccountBoxOutline, email: mdiEmail }[key]
            others.push({
                flex: 1, className: `of-visible aio-login-other-method aio-login-${key}`,
                onClick: () => changeMode(key),
                row: [{ html: <Icon path={icon} size={0.7} />, align: 'vh' }, { size: 6 }, { align: 'v', html: title }]
            })
        }
        if (!others.length) { return false }
        return {
            className: 'p-h-12',
            column: [
                {
                    gap: 6,
                    row: [
                        { flex: 1, html: <div className='aio-login-splitter'></div>, align: 'v' },
                        { html: 'یا ورود با', align: 'v', className: 'aio-login-or bold' },
                        { flex: 1, html: <div className='aio-login-splitter'></div>, align: 'v' },
                    ]
                },
                { size: 12 },
                { grid: others, gridCols: 1, gridRow: { gap: 12 } }
            ]
        }
    }
    function registerButton_layout() {
        if ( mode === 'register') { return false }
        if (registerType !== 'button') { return false }
        return { align: 'vh', html: (<button onClick={() => changeMode('register')} className='aio-login-register-button'>{registerText('register button')}</button>) }
    }
    function registerTab_layout() {
        if(!register || registerType !== 'tab' || profile || mode === 'forgetUserId' || mode === 'forgetPassword') { return false }
        return {
            html: (
                <AIOInput
                    className='aio-login-register-tabs'
                    type='tabs' value={mode === 'register' ? 'register' : 'login'}
                    options={[{ text: 'ورود', value: 'login' }, { text: registerText('tab button'), value: 'register' }]}
                    onChange={(tab) => {
                        if (tab === 'login') { changeMode(modes[0]) }
                        else if (tab === 'register') { changeMode('register') }
                    }}
                />
            )
        }
    }
    function forget_layout() {
        if (profile) { return false }
        if (!forget) { return false }
        if (mode === 'register' || mode === 'OTPCode' || mode === 'OTPNumber' || mode === 'forgetUserId' || mode === 'forgetPassword') { return false }
        let { text } = forget
        let buttonText = text || 'رمز عبور خود را فراموش کرده اید؟ اینجا کلیک کنید';
        return { className: 'aio-login-forget', html: buttonText, onClick: () => changeMode('forgetUserId') }
    }
    let labels = getLabels(mode);
    let column;
    if(profile){column = [{ column: [title_layout(labels), subtitle_layout(labels)] },form_layout(labels)]}
    else {
        column = [
            registerTab_layout(),
            { column: [title_layout(labels), subtitle_layout(labels)] },
            form_layout(labels),forget_layout(),
            { gap: 12, align: 'h', row: [recode_layout(), changeUserId_layout()] },
            changeMode_layout(),registerButton_layout()
        ]
    }
    let className = 'aio-login' + (attrs.className ? ' ' + attrs.className : '')
    let style = attrs.style;
    return (<RVD layout={{className, style,column,attrs:{ onKeyDown: (e) => { if (e.keyCode === 13) { submit() } } }}}/>)
    
}
type I_SubmitButton = {disabled:boolean, loading:boolean, text:string, outline?:boolean,mode:I_AL_mode,onClick:()=>void,timer:number}
function SubmitButton(props:I_SubmitButton) {
    let {disabled, loading, text, outline,mode,onClick,timer} = props;
    let [time,setTime] = useState(getDelta());
    function click() {
        if (loading) { return; }
        setLastTry();
        onClick();
    }
    function setLastTry() {
        AIOStorage('aiologinlasttrypermode').save({ name: 'dic', value: { ...getLastTry(), [mode]: new Date().getTime() } })
        let delta = getDelta();
        setTime(delta)
    }
    function getLastTry() {
        return AIOStorage('aiologinlasttrypermode').load({ name: 'dic', def: {} });
    }
    function getDelta() {
        if (!timer) { return 0 }
        let lastTry = getLastTry();
        let lastTime = lastTry[mode]
        if (!lastTime) { return 0 }
        let delta = new Date().getTime() - lastTime;
        delta = delta / 1000;
        delta = timer - delta;
        delta = Math.round(delta)
        if (delta < 0) { delta = 0 }
        return delta
    }
    let loadingText = 'در حال ارسال';
    if (time > 0) {
        setTimeout(() => setTime(time - 1), 1000);
    }
    else if (time < 0) {
        setTimeout(() => setTime(0), 0);
    }
    if (time) { 
        disabled = true; 
        if(!loading){text = `لطفا ${time} ثانیه صبر کنید` }
    }
    return (
        <button className={'aio-login-submit' + (outline ? ' aio-login-submit-outline' : '')} disabled={disabled} onClick={() => click()}>
            {!loading && text}
            {!!loading && <Icon path={mdiLoading} size={1} spin={0.2} style={{ margin: '0 6px' }} />}
            {!!loading && loadingText}
        </button>
    )
}
