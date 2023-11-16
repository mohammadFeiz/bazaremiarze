import React, { Component } from 'react';
import RVD from 'react-virtual-dom';
import AIOStorage from 'aio-storage';
import AIOInput from './../aio-input/aio-input';
import { Icon } from '@mdi/react';
import { mdiCellphone, mdiLock, mdiLoading, mdiAccount, mdiAccountBoxOutline, mdiEmail, mdiChevronRight } from '@mdi/js';
import './aio-login.css';
import AIOPopup from 'aio-popup';
export default class AIOlogin {
    logs = [];
    addLog = (num,message) => {
        alert(num + ' ' + message)
    }
    constructor(props) {
        let { id, onAuth, onSubmit, modes, timer, checkToken, register, userId, attrs, forget, otpLength } = props;
        AIOMapValidator(props);
        let storage = AIOStorage(`-AIOLogin-${id}`);
        this.setStorage = (key, value) => { storage.save({ name: key, value }); }
        this.getStorage = () => {
            let token = storage.load({ name: 'token', def: false });
            let userId = storage.load({ name: 'userId', def: '' });
            let userInfo = storage.load({ name: 'userInfo' });
            return { token, userId, userInfo }
        }
        this.setUserInfo = (userInfo) => { this.setStorage('userInfo', userInfo) }
        this.getUserInfo = () => { return this.getStorage().userInfo }
        this.setToken = (token) => { this.setStorage('token', token) }
        this.getToken = () => { return this.getStorage().token; }
        this.removeToken = () => { storage.remove({ name: 'token' }); }
        this.getUserId = () => { return this.getStorage().userId }
        this.logout = () => { this.removeToken(); window.location.reload() }
        this.props = {
            id, checkToken, onAuth, onSubmit, modes, register, userId, attrs, timer, forget, otpLength,
            getStorage: this.getStorage,
            addLog: this.addLog,
            setStorage: this.setStorage,
            removeToken: this.removeToken,
            setToken: this.setToken,
            getToken: this.getToken,
            getUserId: this.getUserId,
            logout: this.logout
        }
    }
    render = () => <AIOLOGIN {...this.props} />
}
class AIOLOGIN extends Component {
    state = { isAuth: undefined, showReload: false, reportedAuthToParent: false }
    async checkToken() {
        try {
            let { getStorage, checkToken, removeToken } = this.props;
            let { token, userId, userInfo } = getStorage();
            let result;
            if (typeof token !== 'string') { result = false }
            else {
                try { result = await checkToken(token, { userId, userInfo }); }
                catch (err) { new AIOPopup().addAlert({ type: 'error', text: 'بررسی توکن با خطا روبرو شد', subtext: this.getError(err) }) }
            }
            if (typeof result === 'string') { new AIOPopup().addAlert({ type: 'error', text: 'بررسی توکن با خطا روبرو شد', subtext: result }) }
            if (result === false) { removeToken() }
            if (typeof result !== 'boolean') { this.setState({ showReload: true }) }
            else { this.setState({ isAuth: result }); }
        }
        catch (err) {
            let { addLog } = this.props;
            addLog('12', err.message);
        }
    }
    getError(err) {
        try {
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
        catch (err) {
            let { addLog } = this.props;
            addLog('13', err.message)
        }
    }
    async componentDidMount() {
        try {
            this.checkToken();
        }
        catch (err) {
            let { addLog } = this.props;
            addLog('14', err.message)
        }
    }
    handleOnsubmitError(currentMode, nextMode, modes, token) {
        try {
            if (nextMode === 'auth' && !token) {
                alert(`aio-login error => if onSubmit returns an object contain nextMode:"auth", token props is required`)
            }
            if (currentMode === 'OTPNumber') {
                if (nextMode !== 'OTPCode' && nextMode !== 'register') {
                    alert(`
                        aio-login error => in onSubmit props cannot switch from mode:"${currentMode}" to mode:"${nextMode}" 
                        in this mode you just can switch to 'OTPCode' or 'register' or 'error' mode
                    `)
                }
            }
            else if (currentMode === 'OTPCode') {
                if (nextMode !== 'auth' && nextMode !== 'register') {
                    alert(`
                        aio-login error => in onSubmit props cannot switch from mode:"${currentMode}" to mode:"${nextMode}" 
                        in this mode you just can switch to 'auth' or 'register' or 'error' mode
                    `)
                }
            }
            else if (currentMode === 'forgetId') {
                if (nextMode !== 'forgetCode') {
                    alert(`
                        aio-login error => in onSubmit props cannot switch from mode:"${currentMode}" to mode:"${nextMode}" 
                        in this mode you just can switch to 'forgetCode' or 'error' mode
                    `)
                }
            }
            else if (currentMode === 'forgetCode') {
                if (modes.indexOf(nextMode) === -1) {
                    alert(`
                        aio-login error => in onSubmit props cannot switch from mode:"${currentMode}" to mode:"${nextMode}" 
                        in this mode you just can switch to ${modes.concat('error').split(' or ')} mode
                    `)
                }
            }
            else if (currentMode === 'register') { }
            else {
                if (['auth', 'register'].indexOf(nextMode) === -1) {
                    alert(`
                        aio-login error => in onSubmit props cannot switch from mode:"${currentMode}" to mode:"${nextMode}" 
                        in this mode you just can switch to "register" | "auth" | "error" mode
                    `)
                }
            }
        }
        catch (err) {
            let { addLog } = this.props;
            addLog('15', err.message)
        }
    }
    async onSubmit(model, currentMode) {
        try {
            let { modes, setStorage, removeToken, onSubmit } = this.props;
            let res = await onSubmit(model, currentMode);
            if (typeof res !== 'object') { return }
            let { nextMode, error, token } = res;
            if (!nextMode) { return alert('aio-login error => onSubmit should returns an object contain nextMode property') }
            if (nextMode === currentMode) { return }
            removeToken();
            if (nextMode === 'error') {
                if (error) {
                    let text = {
                        "OTPNumber": 'ارسال شماره همراه',
                        "OTPCode": 'ارسال کد یکبار مصرف',
                        "userName": 'ارسال نام کاربری و رمز عبور',
                        "phoneNumber": 'ارسال شماره همراه و رمز عبور',
                        "email": 'ارسال آدرس ایمیل و رمز عبور',
                        "register": 'عملیات ثبت نام'
                    }[currentMode]
                    let subtext = error;
                    new AIOPopup().addAlert({ type: 'error', text, subtext })
                }
                return 'error'
            }
            this.handleOnsubmitError(currentMode, nextMode, modes, token);
            if (['OTPNumber', 'phoneNumber', 'userName', 'email'].indexOf(currentMode) !== -1) {
                setStorage('userId', model.login.userId);
            }
            if (token) { setStorage('token', token) }
            if (nextMode === 'auth') { this.setState({ isAuth: true }) }
            else { return nextMode }
        }
        catch (err) {
            let { addLog } = this.props;
            addLog('16', err.message)
        }
    }
    render() {
        try {
            let { otpLength, onAuth, id, timer, modes, userId, register = {}, attrs = {}, forget, getStorage, logout, splash = () => null, addLog } = this.props;
            let { reportedAuthToParent, isAuth, showReload } = this.state;
            if (showReload) { return (<div className='aio-login-reload'><button onClick={() => window.location.reload()}>بارگذاری مجدد</button></div>) }
            //اگر هنوز توکن چک نشده ادامه نده
            if (isAuth === undefined) { return splash() }
            //اگر توکن چک شده و توکن ولید بوده onAuth رو کال کن و ادامه نده
            if (isAuth === true) {
                //برای جلوگیری از لوپ بی نهایت فقط یکبار onAuth  رو کال کن
                if (!reportedAuthToParent) {
                    let { token, userId, userInfo } = getStorage();
                    onAuth({ token, userId, userInfo, logout })
                    setTimeout(()=>{
                        this.setState({ reportedAuthToParent: true })
                    },0)
                }
                return splash()
            }
            // وقتی به اینجا رسیدی یعنی توکن قطعا چک شده و ولید نبوده پس لاگین رو رندر کن
            let fields = register.fields;
            this.fields = fields;
            let registerText = register.text || 'ثبت نام'
            let props = { forget, timer, otpLength, id, modes, attrs, userId, fields, registerText }
            let html = (
                <LoginForm {...props} addLog={addLog}
                    registerButton={register.type === 'button' ? registerText : undefined}
                    registerTab={register.type === 'tab' ? registerText : undefined}
                    onSubmit={this.onSubmit.bind(this)}
                />
            )
            return html
        }
        catch (err) {
            let { addLog } = this.props;
            addLog('17', err.message)
        }
    }
}
class LoginForm extends Component {
    constructor(props) {
        super(props);
        this.storage = AIOStorage(`-AIOLogin-${props.id}`);
        let { timer = 30, fields = [] } = props;
        let mode = props.modes[0];
        this.state = { mode, fields, timer, recode: false, tab: 'login', formError: true, model: this.getInitialModel(mode) }
    }
    getLabels(mode) {
        try {
            let { model, tab } = this.state;
            let { registerText, forget } = this.props;
            if (mode === 'OTPNumber') {
                let subtitle = 'شماره همراه خود را وارد کنید . پیامکی حاوی کد برای شما ارسال خواهد شد';
                return { inputLabel: 'شماره همراه', title: 'ورود با کد یکبار مصرف', submitText: 'ورود', subtitle }
            }
            if (mode === 'OTPCode') { return { inputLabel: 'کد پیامک شده', title: false, submitText: 'ورود', subtitle: `کد پیامک شده به شماره ی ${model.login.userId} را وارد کنید` } }
            if (mode === 'register') { return { inputLabel: false, title: registerText, submitText: registerText, subtitle: false, backButton: tab !== 'register' } }
            if (mode === 'forgetId') {
                let subtitle = `${forget.type === 'phoneNumber' ? 'شماره همراه' : 'ایمیل'} خود را وارد کنید . کد باز یابی رمز عبور برای شما ارسال خواهد شد`
                return { inputLabel: forget.type === 'email' ? 'ایمیل' : 'شماره همراه', backButton: true, title: 'بازیابی رمز عبور', submitText: 'دریافت کد بازیابی رمز', subtitle }
            }
            if (mode === 'forgetCode') {
                let { type } = forget;
                let subtitle = `کد ${type === 'phoneNumber' ? 'پیامک' : 'ایمیل'} شده به ${type === 'phoneNumber' ? 'شماره ی' : 'آدرس'} ${model.forget.id} را وارد کنید`
                return { inputLabel: `کد ${type === 'email' ? 'ایمیل' : 'پیامک'} شده`, backButton: true, title: 'بازیابی رمز عبور', submitText: 'تایید', subtitle }
            }
            if (mode === 'userName') { return { inputLabel: 'نام کاربری', title: 'ورود با نام کاربری', submitText: 'ورود', subtitle: false } }
            if (mode === 'email') { return { inputLabel: 'ایمیل', title: 'ورود با ایمیل', submitText: 'ورود', subtitle: false } }
            if (mode === 'phoneNumber') { return { inputLabel: 'شماره همراه', title: 'ورود با شماره همراه', submitText: 'ورود', subtitle: false } }
        }
        catch (err) {
            let { addLog } = this.props;
            addLog('18', err.message)
        }
    }
    changeMode(mode) {
        //alert(17)
        this.setState({ mode, formError: true, model: this.getInitialModel(mode) })
        //alert(18) 
    }
    getInitialModel(mode) {
        if (!mode) { mode = this.state.mode }
        let { userId } = this.props;
        return { forget: {}, register: {}, login: { userId } };
    }
    getWaitingTime() {
        try {
            let { timer, mode } = this.state;
            let lastTry = this.storage.load({ name: 'lastTry' + mode, def: new Date().getTime() - (timer * 1000) })
            let now = new Date().getTime();
            let res = Math.round((now - lastTry) / 1000);
            if (res < timer) { return timer - res }
            return 0
        }
        catch (err) {
            let { addLog } = this.props;
            addLog('21', err.message)
        }
    }
    setLastTry() {
        let { mode } = this.state;
        //alert(19)
        this.storage.save({ name: 'lastTry' + mode, value: new Date().getTime() })
        //alert(20) 
    }
    async onSubmit() {
        //alert(2)
        let { onSubmit } = this.props;
        let { loading, formError, model, mode } = this.state;
        if (formError || loading) { return }
        //alert(3)
        this.setState({ loading: true })
        //alert(4)
        let nextMode;
        try { 
            //alert(5)
            nextMode = await onSubmit(model, mode);
            //alert(6)  
        }
        catch { 
            //alert(7)
            this.setState({ loading: false }) 
            //alert(8)
        }
        //alert(9)
        this.setState({ loading: false })
        //alert(10)
        if (!nextMode) { return }
        //alert(11)
        this.setLastTry();
        //alert(12)
        if (nextMode === 'error') { 
            //alert(13)
            this.changeMode(mode) 
            //alert(14)
        }
        else { 
            //alert(15)
            this.setState({ mode: nextMode }) 
            //alert(16)
        }
    }
    title_layout({ title, backButton }) {
        try {
            if (!title) { return false }
            let { modes } = this.props;
            return {
                className: 'aio-login-title', align: 'v',
                row: [
                    { show: !!backButton, html: <Icon path={mdiChevronRight} size={1} />, size: 48, align: 'vh', onClick: () => this.changeMode(modes[0]) },
                    { html: title }
                ]
            }
        }
        catch (err) {
            let { addLog } = this.props;
            addLog('24', err.message);
        }
    }
    subtitle_layout({ subtitle }) {
        try {
            if (!subtitle) { return false }
            return { html: subtitle, className: 'aio-login-subtitle' }
        }
        catch (err) {
            let { addLog } = this.props;
            addLog('25', err.message);
        }
    }
    getInputs(labels) {
        try {
            let { fields, mode, model } = this.state;
            let { userId, forget } = this.props;
            let { register = {} } = model;
            let { otpLength } = this.props;
            if (mode === 'register') {
                let items = [
                    ...fields.map((o) => {
                        let validations;
                        if (o.validation) { validations = [['function', () => errorHandler({ field: 'register', value: register, parameter: { validation: o.validation } })]] }
                        else if (o.validations) { validations = o.validations }
                        let input = {};
                        for (let prop in o) {
                            if (['label', 'field', 'validation'].indexOf(prop) !== -1) { continue }
                            input[prop] = o[prop]
                        }
                        return { input, label: o.label, field: 'value.register.' + o.field, validations }
                    })
                ]
                return items
            }
            if (mode === 'forgetId') {
                let { type } = forget;
                return [
                    {
                        show: type === 'phoneNumber', field: `value.forget.id`, label: labels.inputLabel,
                        input: {
                            type: 'text', justNumber: true, before: <Icon path={mdiCellphone} size={0.8} />,
                            placeholder: '09...', maxLength: 11, attrs: { style: { direction: 'ltr' } }
                        },
                        validations: [['function', () => errorHandler({ field: 'phoneNumber', value: model.forget.id })]]
                    },
                    {
                        show: type === 'email', field: 'value.forget.id', label: labels.inputLabel,
                        input: { type: 'text', before: <Icon path={mdiAccount} size={0.8} />, attrs: { style: { direction: 'ltr' } } },
                        validations: [['function', () => errorHandler({ field: 'email', value: model.forget.id })]],
                    },
                ]
            }
            if (mode === 'forgetCode') {
                let { type, codeLength } = forget;
                return [
                    {
                        field: 'value.forget.code', label: labels.inputLabel,
                        input: {
                            maxLength: codeLength, justNumber: true, type: 'text', placeholder: Array(codeLength).fill('-').join(''),
                            attrs: { className: 'aio-login-otp-code' }
                        },
                        validations: [['function', () => errorHandler({ field: 'code', value: model.forget.code, parameter: { codeLength } })]]
                    },
                    {
                        field: 'value.forget.password', label: 'رمز عبور جدید',
                        input: { type: 'password', before: <Icon path={mdiLock} size={0.8} />, attrs: { style: { direction: 'ltr' } } },
                        validations: [['function', () => errorHandler({ field: 'password', value: model.forget.password })]]
                    },
                    {
                        field: 'value.forget.rePassword', label: 'تکرار رمز عبور جدید',
                        input: { type: 'password', before: <Icon path={mdiLock} size={0.8} />, attrs: { style: { direction: 'ltr' } } },
                        validations: [['function', () => errorHandler({ field: 'rePassword', value: model.forget.rePassword, parameter: { password: model.forget.password } })]]
                    }
                ]
            }
            let inputs = [
                {
                    show: mode === 'userName', field: 'value.login.userId', label: labels.inputLabel,
                    input: {
                        type: 'text', disabled: !!userId, placeholder: 'نام کاربری', before: <Icon path={mdiAccount} size={0.8} />,
                        attrs: { style: { direction: 'ltr' } }
                    },
                    validations: [['function', () => errorHandler({ field: 'userName', value: model.login.userId })]]
                },
                {
                    show: mode === 'OTPNumber' || mode === 'phoneNumber', field: `value.login.userId`, label: labels.inputLabel,
                    input: {
                        type: 'text', disabled: !!userId, justNumber: true, before: <Icon path={mdiCellphone} size={0.8} />,
                        placeholder: '09...', maxLength: 11, attrs: { style: { direction: 'ltr' } }
                    },
                    validations: [['function', () => errorHandler({ field: 'phoneNumber', value: model.login.userId })]]
                },
                {
                    show: mode === 'email', field: 'value.login.userId', label: labels.inputLabel,
                    input: { type: 'text', disabled: !!userId, before: <Icon path={mdiAccount} size={0.8} />, attrs: { style: { direction: 'ltr' } } },
                    validations: [['function', () => errorHandler({ field: 'email', value: model.login.userId })]],
                },
                {
                    show: !!model.login.userId && mode === 'OTPCode', field: 'value.login.password', label: labels.inputLabel,
                    input: {
                        maxLength: otpLength, justNumber: true, type: 'text', placeholder: Array(otpLength).fill('-').join(''),
                        attrs: { className: 'aio-login-otp-code' }
                    },
                    validations: [['function', () => errorHandler({ field: 'code', value: model.login.password, parameter: { codeLength: otpLength } })]]
                },
                {
                    show: mode !== 'OTPNumber' && mode !== 'OTPCode', field: 'value.login.password', label: 'رمز عبور',
                    input: { type: 'password', before: <Icon path={mdiLock} size={0.8} />, attrs: { style: { direction: 'ltr' } }, visible: true },
                    validations: [['function', () => errorHandler({ field: 'password', value: model.login.password })]]
                }
            ];
            return inputs
        }
        catch (err) {
            let { addLog } = this.props;
            addLog('26', err.message)
        }
    }
    form_layout(labels) {
        let { model, mode } = this.state;
        return {
            className: 'ofy-auto',
            html: (
                <AIOInput
                    type='form' key={mode} lang='fa' value={model} rtl={true}
                    onChange={(model, errors) => this.setState({ model, formError: !!Object.keys(errors).length })}
                    inputs={{ props: { gap: 12 }, column: this.getInputs(labels) }}
                />
            )
        }
    }
    submit_layout({ submitText }) {
        let { loading, formError } = this.state;
        let waitingTime = this.getWaitingTime();
        let text;
        if (waitingTime) {
            setTimeout(() => this.setState({}), 1000)
            text = `لطفا ${waitingTime} ثانیه صبر کنید`
        }
        return {
            style: { padding: '0 12px' }, className: 'm-b-12',
            html: (<SubmitButton text={text || submitText} loading={loading} disabled={() => !!formError || !!waitingTime} onClick={() => this.onSubmit()} />)
        }
    }
    changeUserId_layout() {
        try {
            let { mode } = this.state;
            if (mode !== 'OTPCode') { return false }
            return { onClick: () => this.changeMode('OTPNumber'), className: 'aio-login-text m-b-12', align: 'vh', html: 'تغییر شماره همراه' }
        }
        catch (err) {
            let { addLog } = this.props;
            addLog('29', err.message)
        }
    }
    recode_layout() {
        try {
            let { mode, model } = this.state;
            if (mode !== 'OTPCode') { return false }
            let waitingTime = this.getWaitingTime();
            if (!!waitingTime) { return false }
            return {
                className: 'aio-login-text m-b-12', html: `ارسال مجدد کد`, align: 'vh',
                onClick: () => this.setState({ mode: 'OTPNumber', model: { ...model, login: { ...model.login, password: '' } } })
            }
        }
        catch (err) {
            let { addLog } = this.props;
            addLog('30', err.message)
        }
    }
    changeMode_layout() {
        try {
            let { mode } = this.state;
            if (mode === 'register' || mode === 'forgetId' || mode === 'forgetCode') { return false }
            let { modes } = this.props;
            let others = []
            for (let i = 0; i < modes.length; i++) {
                let key = modes[i];
                if (mode === key) { continue }
                if (mode === 'OTPCode' && key === 'OTPNumber') { continue }
                let title = { OTPNumber: 'رمز یکبار مصرف', userName: 'نام کاربری و رمز عبور', email: 'آدرس ایمیل و رمز عبور', phoneNumber: 'شماره همراه و رمز عبور' }[key];
                let icon = { OTPNumber: mdiAccount, phoneNumber: mdiCellphone, userName: mdiAccountBoxOutline, email: mdiEmail }[key]
                others.push({
                    flex: 1, className: `of-visible aio-login-other-method aio-login-${key}`,
                    onClick: () => this.changeMode(key),
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
        catch (err) {
            let { addLog } = this.props;
            addLog('31', err.message)
        }
    }
    registerButton_layout() {
        try {
            let { registerButton } = this.props;
            let { mode } = this.state;
            if (!registerButton || mode === 'register') { return false }
            return { align: 'vh', html: (<button onClick={() => this.changeMode('register')} className='aio-login-register-button'>{registerButton}</button>) }
        }
        catch (err) {
            let { addLog } = this.props;
            addLog('32', err.message)
        }
    }
    registerTab_layout() {
        let { registerTab, modes } = this.props;
        if (registerTab === true) { registerTab = 'ثبت نام' }
        if (!registerTab) { return false }
        let { mode } = this.state;
        if (mode === 'forgetId' || mode === 'forgetCode') { return false }
        return {
            html: (
                <AIOInput
                    className='aio-login-register-tabs'
                    type='tabs' value={mode === 'register' ? 'register' : 'login'}
                    options={[{ text: 'ورود', value: 'login' }, { text: registerTab, value: 'register' }]}
                    onChange={(tab) => {
                        if (tab === 'login') { this.changeMode(modes[0]) }
                        else if (tab === 'register') { this.changeMode('register') }
                    }}
                />
            )
        }
    }
    forget_layout() {
        let { mode } = this.state;
        let { forget } = this.props;
        if (!forget) { return false }
        if (mode === 'register' || mode === 'OTPCode' || mode === 'OTPNumber' || mode === 'forgetId' || mode === 'forgetCode') { return false }
        let { text = [] } = forget
        let buttonText = text[0] || 'رمز عبور خود را فراموش کرده اید؟ اینجا کلیک کنید';
        return { className: 'aio-login-forget', html: buttonText, onClick: () => this.changeMode('forgetId') }
    }
    render() {
        let { attrs } = this.props, { mode } = this.state, labels = this.getLabels(mode);
        return (
            <RVD
                layout={{
                    className: 'aio-login' + (attrs.className ? ' ' + attrs.className : ''), style: attrs.style,
                    attrs: { ...attrs, onKeyDown: (e) => { if (e.keyCode === 13) { this.onSubmit() } } },
                    column: [
                        this.registerTab_layout(),
                        { column: [this.title_layout(labels), this.subtitle_layout(labels)] },
                        this.form_layout(labels),
                        this.forget_layout(),
                        this.submit_layout(labels),
                        { gap: 12, align: 'h', row: [this.recode_layout(), this.changeUserId_layout()] },
                        this.changeMode_layout(),
                        this.registerButton_layout()
                    ]
                }}
            />
        )
    }
}
function errorHandler({ field, value = '', parameter }) {
    return {
        userName() { if (!value) { return 'نام کاربری را وارد کنید' } return false },
        phoneNumber() {
            if (!value) { return 'شماره همراه خود را وارد کنید' }
            if (value.indexOf('09') !== 0) { return 'شماره همراه باید با 09 شروع شود' }
            if (value.length !== 11) { return 'شماره همراه باید 11 رقم باشد' }
            return false
        },
        email() {
            let atSignIndex = value.indexOf('@');
            if (!value) { return 'ایمیل خود را وارد کنید' }
            if (atSignIndex < 1) { return 'ایمیل خود را به درستی وارد کنید' }
            if (value.indexOf('.') === -1) { return 'ایمیل خود را به درستی وارد کنید' }
            if (value.lastIndexOf('.') > value.length - 3) { return 'ایمیل خود را به درستی وارد کنید' }
            return false
        },
        password() { if (value.length < 1) { return 'رمز عبور را وارد کنید' } return false; },
        rePassword() {
            if (value.length < 1) { return 'رمز عبور را وارد کنید' }
            if (value !== parameter.password) { return 'رمز با تکرار آن مطابقت ندارد' }
            return false;
        },
        code() { return value.length !== parameter.codeLength ? `کد ورود باید شامل ${parameter.codeLength} کاراکتر باشد` : false },
        register() { return parameter.validation(value); }
    }[field]()
}

class SubmitButton extends Component {
    onClick() {
        let { onClick, loading } = this.props;
        if (loading) { return; }
        //alert(1);
        onClick();
    }
    getLoadingIcon(){
        let { loading } = this.props;
        if(!loading){return null}
        return <Icon path={mdiLoading} size={1} spin={0.2} style={{ margin: '0 6px' }} />
    }
    render() {
        let { disabled, loading, text, outline } = this.props;
        let loadingText = 'در حال ارسال';
        let TEXT = loading?loadingText:text;
        let LOADING = this.getLoadingIcon()
        return (
            <button className={'aio-login-submit' + (outline ? ' aio-login-submit-outline' : '')} disabled={disabled()} onClick={() => this.onClick()}>
                {TEXT} {LOADING}
            </button>
        )
    }
}
function AIOMapValidator(props) {
    let { id, onAuth, onSubmit, modes, timer, checkToken, register, userId = '', attrs, forget, otpLength } = props;
    for (let prop in props) {
        if (['id', 'onAuth', 'onSubmit', 'modes', 'timer', 'checkToken', 'register', 'userId', 'attrs', 'forget', 'otpLength', 'splash'].indexOf(prop) === -1) {
            let error = `
                aio-login error => invalid props 
                ${prop} is not one of AIOLogin props,
                valid props are 'id' | 'onAuth' | 'onSubmit' | 'modes' | 'timer' | 'checkToken' | 'register' | 'userId' | 'attrs' | 'forget' | 'otpLength' | 'splash'
            `;
            alert(error); console.log(error); return;
        }
    }
    if (!id) { alert(`aio-login error=> missing id props, id props should be an string`) }
    if (!onAuth) {
        let error = `
            aio-login error => missing onAuth props
            onAuth type is => ({token:string,userId:string,logout:function})=>void
        `;
        alert(error); console.log(error); return;
    }
    if (typeof userId !== 'string') {
        let error = `aio-login error=> userId props should be an string`;
        alert(error); console.log(error); return;
    }
    if (!checkToken) {
        let error = `
            aio-login error=> missing checkToken props 
            checkToken type is => (token:string)=>boolean
            for prevent it set checkToken : ()=>true
        `;
        alert(error); console.log(error); return;
    }
    if (!onSubmit) {
        let error = `
            aio-login error=> missing onSubmit props,
            onSubmit type is => 
            (model:<model type>,mode:<mode type>)=>{
                nextMode:<mode type> // define next mode after submition
                error?:String, //should set in 'error' mode
                token?:string // should set in 'auth' mode
            }
            <model type> is {
                login:{userId:string,password:string | number},
                forget:{userId:string,password:string | number},
                register:{[field:string]:any}
            }
            <mode type> is 'OTPNumber' | 'OTPCode' | 'userName' | 'email' | 'phoneNumber' | 'forgetId' | 'forgetCode' | 'register' | 'error', | 'auth'
        `;
        alert(error); console.log(error); return;
    }
    if (typeof timer !== 'number') {
        let error = `aio-login error=> timer props should be an number`;
        alert(error); console.log(error); return;
    }
    if (!Array.isArray(modes) || !modes.filter((o) => ['OTPNumber', 'userName', 'email', 'phoneNumber'].indexOf(o) !== -1).length) {
        let error = `
            aio-login error=> modes props should be an array contain composite of 'OTPNumber' | 'userName' | 'email' | 'phoneNumber'
        `
        alert(error); console.log(error); return;
    }
    if (modes.indexOf('OTPNumber') !== -1) {
        if (!otpLength) {
            let error = `aio-login error=> otpLength props is not an number (for define length of otp code)`
            alert(error); console.log(error); return;
        }
    }
    if (register) {
        if (
            typeof register !== 'object' ||
            ['mode', 'tab', 'button'].indexOf(register.type) === -1 ||
            !register.text ||
            !Array.isArray(register.fields) ||
            !register.fields.length
        ) {
            let error = `
                aio-login error=> register props should be an object contain: 
                type: "tab" | "button" | "mode"
                fields:[
                    {
                        type:"text" | "number" | "textarea" | "chechbox" | "radio" | "select" | "multiselect" ,
                        before:html (for example an icon),
                        label:string (form input label),
                        validation:(value)=>string (error message) | undefined,
                        field:string (register object property)
                    },
                    ...
                ],
                text:string
            `;
            alert(error); console.log(error); return;
        }
    }
    if (forget) {
        if (typeof forget !== 'object') { alert(`aio-login error=> forget props should be an object`) }
        if (['phoneNumber', 'email'].indexOf(forget.type) === -1) {
            let error = `aio-login error=> forget props object, type property should be one of "phoneNumber" | "email"`;
            alert(error); console.log(error); return;
        }
        if (isNaN(forget.codeLength)) {
            let error = `aio-login error=> forget props object, codeLength property should be an number`;
            alert(error); console.log(error); return;
        }
    }
}
