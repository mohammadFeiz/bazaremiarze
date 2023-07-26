import React, { Component, createRef } from 'react';
import RVD from './../react-virtual-dom/react-virtual-dom';
import AIOStorage from './../aio-storage/aio-storage';
import AIOInput from './../aio-input/aio-input';
import { Icon } from '@mdi/react';
import { mdiCellphone, mdiLock, mdiLoading, mdiAccount, mdiAccountBoxOutline, mdiEmail, mdiChevronRight } from '@mdi/js';
import AIOService from './../aio-service/aio-service';

import './index.css';
export default class AIOLogin extends Component {
    constructor(props) {
        super(props);
        let {id, checkToken,COMPONENT,onSubmit} = props;
        if (!id) { console.error(`aio-login error=> missing id props`) }
        if (!COMPONENT) { console.error(`aio-login error=> missing COMPONENT props`) }
        this.valid = true
        this.tokenStorage = AIOStorage(`${id}-token`);
        this.state = {
            isAutenticated: false,
            apis: AIOService({
                id: `${id}login`,
                getResponse: () => {
                    return {
                        checkToken: async () => {
                            let token = this.tokenStorage.load({ name: 'token', def: false });
                            let isAuthenticated = this.tokenStorage.load({ name: 'isAuthenticated', def: false });
                            if (!token || !isAuthenticated) { return { result: false } }
                            let result = await checkToken(token);
                            return { result }
                        },
                        async onSubmit({model,mode}){
                            let {mode:Mode,error = 'خطایی رخ داد',token} = await onSubmit(model,mode);
                            if(Mode === 'Error'){return {result:error}}
                            return {result:{Mode,token}}
                        }
                    }
                },
                onCatch: (res) => { 
                    this.setState({ isAutenticated: false }); 
                    return 'error' 
                }
            })
        }
    }
    async componentDidMount() {
        if (!this.valid) { return }
        let res = await this.state.apis({
            api: 'checkToken', name: 'بررسی توکن',
            errorMessage: 'اتصال خود را بررسی کنید',
        })
        this.mounted = true;
        this.setState({ isAutenticated: res });
    }
    logout() { this.tokenStorage.remove({ name: 'token' }); window.location.reload() }
    render() {
        if (!this.valid) { return null }
        if (!this.mounted) { return null }
        let { registerFields, layout, otpLength, COMPONENT, id, time = 16,methods,className,style,model } = this.props;
        let { isAutenticated,apis } = this.state;
        if (isAutenticated) {
            let props = {
                token: this.tokenStorage.load({ name: 'token' }),
                userId: this.tokenStorage.load({ name: 'userId' }),
                logout: this.logout.bind(this)
            }
            COMPONENT(props)
            return null
        }
        if (registerFields) {
            registerFields = registerFields.map(({ before, label, field, type,required }) => {
                return { label, field, type, before,required }
            })
        }
        let html = (
            <LoginForm
                time={time} fields={registerFields} otpLength={otpLength} id={id} methods={methods} className={className} style={style} model={model}
                onSubmit={async (model,mode)=>{
                    let name = {
                        "OTPPhoneNumber":'ارسال شماره همراه',
                        "OTPCode":'ارسال کد یکبار مصرف',
                        "UserName":'ارسال نام کاربری و رمز عبور',
                        "PhoneNumber":'ارسال شماره همراه و رمز عبور',
                        "Email":'ارسال آدرس ایمیل و رمز عبور',
                        "Register":'عملیات ثبت نام'
                    }[mode];
                    let {token,Mode} = await apis({
                        api:'onSubmit', parameter: {model,mode}, name,loading:false
                    })
                    let modes = [];
                    if(mode === 'OTPPhoneNumber'){modes = ['Error','OTPCode','Authenticated']}
                    else{modes = ['Error','Authenticated']}
                    if(registerFields){modes.push('Register')}
                    if(modes.indexOf(Mode) === -1){
                        console.error(`aio-login error => onSubmit props should returns an object contain mode(${modes.join(' | ')})`)
                        return
                    }
                    if (token) { 
                        this.tokenStorage.save({ value: token, name: 'token' });
                        this.tokenStorage.save({ value:model[mode], name: 'userId' });
                        this.setState({ token})
                    }
                    if(Mode === 'Authenticated'){
                        this.tokenStorage.save({name:'isAuthenticated',value:true})
                        this.setState({isAutenticated:true})
                    }
                    else {return Mode}
                }}
            />
        )
        if (layout) { return layout(html) }
        return html
    }
}
class LoginForm extends Component {
    constructor(props) {
        super(props);
        this.dom = createRef()
        this.storage = AIOStorage(props.id + 'aio-login');
        let { time = 30, fields = [],model = {} } = props;
        let mode = props.methods[0];
        this.state = {
            mode,fields, time, recode: false,
            formError: true,
            userId: model[mode],
            model: this.getInitialModel(mode)
        }
    }
    changeMode(mode){
        let { model = {} } = this.props;
        this.setState({
            mode,
            formError: true,
            userId: model[mode],
            model: this.getInitialModel(mode)
        })
    }
    getInitialModel(mode) {
        if(!mode){mode = this.state.mode}
        let { model = {},methods } = this.props;
        let obj = {password:'',OTPCode:''};
        for(let i = 0; i < methods.length; i++){
            obj[methods[i]] = model[methods[i]] || '';
        }
        return obj;
    }
    getWaitingTime(){
        let {time,mode} = this.state;
        let lastTry = this.storage.load({name:'lastTry' + mode,def: new Date().getTime() - (time * 1000)})
        let now = new Date().getTime();
        let res = Math.round((now - lastTry) / 1000);
        if(res < time){return time - res}
        return 0
    }
    setLastTry(){
        let {mode} = this.state;
        this.storage.save({name:'lastTry' + mode,value:new Date().getTime()})
    }
    async onSubmit() {
        let {onSubmit} = this.props;
        let { loading, formError,model,mode } = this.state;
        if (formError || loading) { return }
        this.setState({loading:true})
        let Mode = await onSubmit(model,mode);
        this.setState({loading:false})
        this.setLastTry();
        if(Mode === 'Register'){this.setState({mode:'Register',userId:model[mode]})}
        if(Mode === 'OTPCode'){this.setState({mode:'OTPCode',userId:model[mode]})}
    }
    title_layout() {
        let { mode } = this.state;
        if(mode === 'OTPCode'){return false}
        let dic = {OTPPhoneNumber:'کد یکبار مصرف',Email:'ایمیل',UserName:'نام کاربری',PhoneNumber:'شماره همراه'}
        let html = mode === 'Register'?`ثبت نام`:`ورود با ${dic[mode]}`
        return {
            className: 'aio-login-title',
            html, align: 'v'
        }
    }
    subtitle_layout() {
        let { mode,userId } = this.state;
        let html = '';
        if(mode === 'OTPPhoneNumber'){
            html = 'شماره همراه خود را وارد کنید . پیامکی حاوی کد برای شما ارسال خواهد شد'
        }
        else if(mode === 'OTPCode'){
            html = `کد پیامک شده به شماره ی ${userId} را وارد کنید`
        }
        return { html, className: 'aio-login-subtitle' }
    }
    getInputs() {
        let { fields, mode, model, userId } = this.state;
        let {model:InitialModel} = this.props;
        let {otpLength} = this.props;
        if (mode === 'Register') {
            return [...fields.map((o) => { return { input:{...o,label:undefined},label:o.label, field: 'value.register.' + o.field, validations: o.required ? [['required']] : undefined } })]
        }
        let inputs = [
            {
                show:mode === 'UserName',field: 'value.UserName',label: 'نام کاربری', disabled:!!InitialModel.UsertName,
                input:{
                    type: 'text',placeholder: 'نام کاربری',before: <Icon path={mdiAccount} size={0.8} />,
                    style:{direction:'ltr'}
                },
                validations: [['function', () => errorHandler('UserName', model.UserName)]]
            },
            {
                show:mode === 'OTPPhoneNumber' || mode === 'PhoneNumber',field: `value.${mode}`,label: 'شماره همراه',disabled:!!InitialModel.OTPPhoneNumber || !! InitialModel.PhoneNumber,
                input:{
                    type: 'text',justNumber: true,before: <Icon path={mdiCellphone} size={0.8} />, 
                    placeholder: '09...',maxLength:11,style:{direction:'ltr'}
                },  
                validations: [['function', () => errorHandler('PhoneNumber', model[mode])]]
            },
            {
                show:mode === 'Email',field: 'value.Email',label: 'ایمیل', disabled:!!InitialModel.Email, 
                input:{type: 'text',before: <Icon path={mdiAccount} size={0.8} />,style:{direction:'ltr'}}, 
                validations: [['function', () => errorHandler('Email', model.Email)]],
            },
            {
                show:!!userId && mode === 'OTPCode',field: 'value.OTPCode', label: 'کد پیامک شده',
                input:{
                    maxLength: otpLength, justNumber: true, type: 'text', placeholder: Array(otpLength).fill('-').join(''),
                    className:'aio-login-otp-code'
                },
                validations: [['function', () => errorHandler('OTPCode', model.OTPCode, otpLength)]]
            },
            {
                show:mode !== 'OTPPhoneNumber' && mode !== 'OTPCode',field: 'value.password',label: 'رمز عبور', 
                input:{type: 'password',before: <Icon path={mdiLock} size={0.8} />,style:{direction:'ltr'}}, 
                validations: [['function', () => errorHandler('password', model.password)]]
            }
        ];
        return inputs
    }
    form_layout() {
        let { model,userId,mode } = this.state;
        return {
            className:'ofy-auto',
            html: (
                <AIOInput
                    type='form' key={mode + userId} lang='fa' value={model} rtl={true} 
                    onChange={(model,errors) => this.setState({ model,formError:!!errors.length})}
                    inputs={{props:{gap:12},column:this.getInputs()}}
                />
            )
        }
    }
    submit_layout() {
        let { loading,formError,mode } = this.state;
        let waitingTime = this.getWaitingTime();
        let text = mode === 'Register'?'ثبت نام':'ورود';
        if(waitingTime){
            setTimeout(()=>this.setState({}),1000)
            text = `لطفا ${waitingTime} ثانیه صبر کنید`
        }
        return {
            style: { padding: '0 12px' }, className: 'm-b-12',
            gap:12,
            row: [
                {
                    flex: 1,
                    html: (
                        <SubmitButton
                            text={text}
                            disabled={() => !!formError || !!waitingTime}
                            onClick={() => this.onSubmit()}
                            loading={loading}
                        />
                    )
                }
            ]
        }
    }
    changeUserId_layout(){
        let { mode } = this.state;
        if(mode !== 'OTPCode'){return false}
        return {
            onClick: () => this.changeMode('OTPPhoneNumber'), 
            className: 'aio-login-text m-b-12', align: 'vh', html: 'تغییر شماره همراه'
        }
    }
    recode_layout() {
        let { mode ,userId} = this.state;
        if (mode !== 'OTPCode') { return false }
        let waitingTime = this.getWaitingTime();
        if(!!waitingTime){return false}
        return {
            className: 'aio-login-text m-b-12', html: `ارسال مجدد کد`, align: 'vh',
            onClick: () => {
                this.setState({mode:'OTPPhoneNumber'})

            }
        }    
    }
    changeMode_layout() {
        let { mode } = this.state;
        if (mode === 'Register') { return false }
        let { methods } = this.props;
        let others = []
        for (let i = 0; i < methods.length; i++) {
            let key = methods[i];
            if (mode === key) { continue }
            if(mode === 'OTPCode' && key === 'OTPPhoneNumber'){continue}
            let title = {OTPPhoneNumber:'رمز یکبار مصرف',UserName:'نام کاربری و رمز عبور',Email:'آدرس ایمیل و رمز عبور',PhoneNumber:'شماره همراه و رمز عبور'}[key];
            let icon = {OTPPhoneNumber: mdiAccount,PhoneNumber: mdiCellphone,UserName: mdiAccountBoxOutline,Email:mdiEmail}[key]
            others.push({
                flex: 1,
                className: `of-visible aio-login-other-method aio-login-${key}`,
                onClick: () => this.changeMode(key),
                row: [
                    { html: <Icon path={icon} size={1}/>, align: 'vh' },
                    { size: 6 },
                    { align: 'v', html: title }
                ]
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
    render() {
        let {className,style} = this.props;
        return (
            <RVD
                layout={{
                    className: 'aio-login' + (className?' ' + className:''),style,
                    attrs: { onKeyDown: (e) => { if (e.keyCode === 13) { this.onSubmit() } } },
                    column: [
                        { 
                            column: [
                                this.title_layout(), 
                                this.subtitle_layout()
                            ] 
                        },
                        this.form_layout(),
                        this.submit_layout(),
                        {
                            gap:12,align:'h',
                            row:[
                                this.recode_layout(),
                                this.changeUserId_layout()
                            ]
                        },
                        this.changeMode_layout()
                    ]
                }}
            />
        )
    }
}
function errorHandler(field, value = '', otpLength) {
    return {
        UserName() {
            if (!value) { return 'نام کاربری را وارد کنید' }
            return false
        },
        PhoneNumber() {
            if (!value) { return 'شماره همراه خود را وارد کنید' }
            if (value.indexOf('09') !== 0) { return 'شماره همراه باید با 09 شروع شود' }
            if (value.length !== 11) { return 'شماره همراه باید 11 رقم باشد' }
            return false
        },
        Email() {
            let atSignIndex = value.indexOf('@');
            if (!value) { return 'ایمیل خود را وارد کنید' }
            if (atSignIndex < 1) { return 'ایمیل خود را به درستی وارد کنید' }
            if (value.indexOf('.') === -1) { return 'ایمیل خود را به درستی وارد کنید' }
            if (value.lastIndexOf('.') > value.length - 3) { return 'ایمیل خود را به درستی وارد کنید' }
            return false
        },
        password() {
            if (value.length < 6) { return 'رمز عبور باید شامل حداقل 6 کاراکتر باشد' }
            return false
        },
        OTPCode() {
            let res;
            if (value.length !== otpLength) { res = `کد ورود باید شامل ${otpLength} کاراکتر باشد` }
            else { res = false }
            return res
        }
    }[field](value)
}

class SubmitButton extends Component {
    state = { reload: false }
    async onClick() {
        let { onClick, loading } = this.props;
        if (loading) { return; }
        await onClick();
    }
    render() {
        let { disabled, loading, text,outline } = this.props;
        let { reload } = this.state;
        if (loading && !reload) { setTimeout(() => this.setState({ reload: true }), 16 * 1000) }
        let loadingText = reload ? 'بارگزاری مجدد' : 'در حال ارسال';
        return (
            <>
                <button className={'aio-login-submit' + (outline?' aio-login-submit-outline':'')} disabled={disabled()} onClick={() => this.onClick()}>
                    {loading ? (<><Icon path={mdiLoading} size={1} spin={0.2} style={{ margin: '0 6px' }} />{loadingText}</>) : text}
                </button>
                {
                    loading &&
                    <div
                        style={{ position: 'fixed', width: '100%', height: '100%', left: 0, top: 0, zIndex: 100000000000000000000000000000000000000 }}
                        onClick={() => { if (reload) { window.location.reload() } }}
                    ></div>
                }
            </>
        )
    }
}

