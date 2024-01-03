import React, { Component, createRef, useContext, createContext, Fragment, useState, useEffect } from 'react';
import * as ReactDOMServer from 'react-dom/server';
import Axios from 'axios';
import { Icon } from '@mdi/react';
import {
    mdiChevronDown, mdiLoading, mdiAttachment, mdiChevronRight, mdiClose, mdiCircleMedium, mdiArrowUp, mdiArrowDown,
    mdiSort, mdiFileExcel, mdiMagnify, mdiPlusThick, mdiChevronLeft, mdiImage, mdiEye, mdiEyeOff, mdiDownloadOutline,
    mdiCrosshairsGps
} from "@mdi/js";
import $ from 'jquery';
import AIODate from './../../npm/aio-date/aio-date';
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import AIOPopup from './../../npm/aio-popup/aio-popup';
import './index.css';
const AICTX = createContext();
export default class AIOInput extends Component {
    static defaults = { 
        validate: false, mapApiKeys: {}, popover: {},
    };
    constructor(props) {
        super(props);
        this.types = {
            type:props.type,
            isInput : ['text', 'number', 'textarea', 'password'].indexOf(props.type) !== -1,
            isDropdown : ['text', 'number', 'textarea', 'select', 'multiselect','button','datepicker'].indexOf(props.type) !== -1,
            hasOption : ['text', 'number', 'textarea','color', 'select', 'multiselect','radio','tabs','list'].indexOf(props.type) !== -1,
            hasPlaceholder : ['text', 'number', 'textarea','color', 'select', 'table','image','datepicker'].indexOf(props.type) !== -1,
            hasMultiple : ['radio', 'file', 'slider'].indexOf(props.type) !== -1,
            hasKeyboard : ['text', 'textarea', 'number', 'password'].indexOf(props.type) !== -1,
            hasText : ['multiselect', 'checkbox', 'button','select'].indexOf(props.type) !== -1,
            hasSearch : ['multiselect', 'table','select'].indexOf(props.type) !== -1
        }
        this.handleIsMultiple(props.type);
        this.dom = createRef();
        this.datauniqid = 'aiobutton' + (Math.round(Math.random() * 10000000));
        this.popup = new AIOPopup();
        this.getPopover = new Popover(this.getProp.bind(this), this.datauniqid, this.toggle.bind(this), this.getOptions.bind(this), this.addToAttrs.bind(this)).getFn();
        this.state = { open: this.getProp('open', false), showPassword: false }
    }
    handleIsMultiple(type) {
        if (type === 'multiselect' || type === 'table') { this.isMultiple = () => true }
        else if (type === 'radio' || type === 'slider' || type === 'file') { this.isMultiple = () => !!this.props.multiple }
        else { this.isMultiple = () => false };
    }
    dragStart(e) { this.dragIndex = parseInt($(e.target).attr('datarealindex')); }
    dragOver(e) { e.preventDefault(); }
    drop(e) {
        e.stopPropagation();
        let from = this.dragIndex, dom = $(e.target);
        if (!dom.hasClass('aio-input-option')) { dom = dom.parents('.aio-input-option'); };
        if (!dom.hasClass('aio-input-option')) { return };
        let to = parseInt(dom.attr('datarealindex'));
        if (from === to) { return }
        this.properties.onSwap(from, to, this.swap)
    }
    swap(arr, from, to) {
        if (to === from + 1) { let a = to; to = from; from = a; }
        let Arr = arr.map((o, i) => { o._testswapindex = i; return o })
        let fromIndex = Arr[from]._testswapindex
        Arr.splice(to, 0, { ...Arr[from], _testswapindex: false })
        return Arr.filter((o) => o._testswapindex !== fromIndex)
    }
    getSelectText() {
        //cannot use this.properties here 
        let options = this.getProp('options',[]);
        let value = this.getProp('value');
        let option = options.find((option) => value === undefined ? false : this.getOptionProp(option, 'value') === value);
        if (option === undefined) { return }
        return this.getOptionProp(option, 'text')
    }
    getDatepickerText() {
        //cannot use this.properties here 
        let value = this.getProp('value');
        let unit = this.getProp('unit','day');
        let Pattern = this.getProp('pattern');
        let calendarType = this.getProp('calendarType');
        let placeholder = this.getProp('placeholder'); 
        if (value) {
            let list = AIODate().convertToArray({ date: value });
            let [year, month = 1, day = 1, hour = 0] = list;
            list = [year, month, day, hour];
            let pattern;
            let splitter = AIODate().getSplitter(value)
            if (Pattern) { pattern = Pattern }
            else if (unit === 'month') { pattern = `{year}${splitter}{month}` }
            else if (unit === 'day') { pattern = `{year}${splitter}{month}${splitter}{day}` }
            else if (unit === 'hour') { pattern = `{year}${splitter}{month}${splitter}{day} - {hour} : 00` }
            return <div style={{ direction: 'ltr' }}>{AIODate().getDateByPattern({ date: list, pattern })}</div>
        }
        return placeholder || (calendarType === 'gregorian' ? 'Select Date' : 'انتخاب تاریخ')
    }
    addToAttrs(attrs = {}, { className, style, stylePriority = true }) {
        let classNames = [];
        if (attrs.className) { classNames.push(attrs.className) }
        if (className) { classNames.push(className) }
        let newClassName = classNames.length ? classNames.join(' ') : undefined
        let newStyle = stylePriority ? { ...attrs.style, ...style } : { ...style, ...attrs.style };
        return { ...attrs, className: newClassName, style: newStyle }
    }
    getProp(key, def,preventFunction) {
        let { type } = this.props;
        let propsResult = this.props[key] === 'function' && !preventFunction ? this.props[key]() : this.props[key];
        if (key === 'value') {
            if (propsResult === null) { propsResult = undefined }
            
            if (this.isMultiple()) {
                if (propsResult === undefined) { propsResult = [] }
                if (!Array.isArray(propsResult)) {
                    console.error(`aio-input error => in type="${type}" by multiple:true value should be an array but is ${propsResult}`)
                    propsResult = [propsResult]
                }
            }
            else {
                if (Array.isArray(propsResult)) {
                    console.error(`aio-input error => in type="${type}" by multiple:false|undefined value cannot be an array`)
                    propsResult = propsResult[0]
                }
                if (type === 'map') {
                    let { lat = 35.699739, lng = 51.338097 } = propsResult || {};
                    propsResult = { lat, lng }
                }
            }
            if(type === 'slider'){
                if (!Array.isArray(propsResult)) {
                    if (typeof propsResult !== 'number') { propsResult = [] }
                    else { propsResult = [propsResult] }
                }
            }
            return propsResult === undefined ? def : propsResult;
        }
        if (key === 'type') { return this.props.type }
        if (key === 'props') { return this.props }
        if (key === 'after') {
            if (type === 'password' && this.getProp('visible')) {
                let { showPassword } = this.state;
                return <div className='align-v' onClick={() => this.toggleShowPassword()}><Icon path={showPassword ? mdiEyeOff : mdiEye} size={.8} /></div>
            }
        }
        if (key === 'caret') {
            if (propsResult === false) { return false }
            if (type === 'button') { return !!this.getProp('popover') }
            if (type === 'select' || type === 'multiselect' || type === 'datepicker') { return propsResult || true }
            if (type === 'text' || type === 'number' || type === 'textarea') {
                let options = this.getProp('options');
                if (options) { return propsResult || true }
                else { return false }
            }
            return false;
        }
        if (key === 'text' && propsResult === undefined) {
            if (type === 'select') { return this.getSelectText() }
            if (type === 'datepicker') { return this.getDatepickerText() }
        }
        propsResult = propsResult === undefined ? def : propsResult;
        return propsResult;
    }
    getOptionProp(option, key, def, preventFunction) {
        let optionResult = typeof option[key] === 'function' && !preventFunction ? option[key](option, this.props) : option[key]
        if (optionResult !== undefined) { return optionResult }
        let prop = this.props['option' + key[0].toUpperCase() + key.slice(1, key.length)];
        if (typeof prop === 'string') {
            try {
                let props = this.props, value;
                eval('value = ' + prop);
                return value;
            }
            catch {}
        }
        if (typeof prop === 'function' && !preventFunction) {
            let res = prop(option, this.props);
            return res === undefined ? def : res;
        }
        return prop !== undefined ? prop : def;
    }
    toggle(popover, e) {
        let open = !!this.popup.getModals().length
        if (!!popover === !!open) { return }
        if (popover) {
            this.popup.addModal(popover);
            this.setState({ open: true })
        }
        else {
            this.popup.removeModal();
            this.setState({ open: false })
            setTimeout(() => $(this.dom.current).focus(), 0)
        }
    }
    click(e, dom) {
        let type = this.types.type;
        let onChange = this.properties.onChange || (() => { });
        let attrs = this.properties.attrs;
        if (type === 'checkbox') { onChange(!this.properties.value) }
        else if (this.getPopover) { this.toggle(this.getPopover(dom), e) }
        else if (attrs.onClick) { attrs.onClick(); }
    }
    optionClick(option) {
        let onChange = this.properties.onChange || (() => { });
        let type = this.types.type;
        let Value = this.properties.value;
        let { value, attrs = {},onClick, close, text } = option;
        if (onClick) { onClick(value, option); }
        else if (attrs.onClick) { attrs.onClick(value, option); }
        else if (type && ['text', 'number', 'textarea', 'password'].indexOf(type) !== -1) { onChange(text, option) }
        else if (this.isMultiple()) {
            if (Value.indexOf(value) === -1) { onChange(Value.concat(value), value, 'add') }
            else { onChange(Value.filter((o) => o !== value), value, 'remove') }
        }
        else { onChange(value, option) }
        if (close) { this.toggle(false) }
    }
    toggleShowPassword() { this.setState({ showPassword: !this.state.showPassword }) }
    getOptions() {
        let type = this.types.type;
        let getDefaultOptionChecked = (value) => {
            if (type === 'multiselect' || type === 'radio') {
                let Value = this.properties.value;
                return this.isMultiple() ? Value.indexOf(value) !== -1 : Value === value
            }
        }
        let options = this.properties.options || [];
        let result = [];
        let renderIndex = 0;
        let Value = this.properties.value;
        let draggable = this.types.isDropdown && this.types.hasOption && this.props.onSwap;
        for (let i = 0; i < options.length; i++) {
            let option = options[i];
            let disabled = this.properties.disabled || this.getOptionProp(option, 'disabled');
            let show = this.getOptionProp(option, 'show')
            if (show === false) { continue }
            let text = this.getOptionProp(option, 'text');
            if (this.types.isInput && Value && text.toString().indexOf(Value.toString()) !== 0) { continue }
            let value = this.getOptionProp(option, 'value')
            let attrs = this.getOptionProp(option, 'attrs', {});
            let obj = {
                attrs,text, value,disabled,draggable,
                checkIcon: this.getOptionProp(option, 'checkIcon', [], true),
                checked: this.getOptionProp(option, 'checked', getDefaultOptionChecked(value)),
                before: this.getOptionProp(option, 'before'),
                after: this.getOptionProp(option, 'after'),
                justify: this.getOptionProp(option, 'justify'),
                subtext: this.getOptionProp(option, 'subtext'),
                onClick: this.getOptionProp(option, 'onClick',undefined,true),
                className: this.getOptionProp(option, 'className'),
                style: this.getOptionProp(option, 'style'),
                tagAttrs: this.getOptionProp(option, 'tagAttrs'),
                tagBefore: this.getOptionProp(option, 'tagBefore'),
                close: this.getOptionProp(option, 'close', type !== 'multiselect'),
                tagAfter: this.getOptionProp(option, 'tagAfter'),
                renderIndex, realIndex: i
            }
            if (value === Value) { obj.attrs = this.addToAttrs(obj.attrs, { className: 'active' }) }
            result.push(obj)
            renderIndex++;
        }
        return result;
    }
    getContext() {
        return {
            ...this.props,
            properties:this.properties,
            addToAttrs: this.addToAttrs.bind(this),
            mapApiKeys: AIOInput.defaults.mapApiKeys,
            isMultiple: this.isMultiple.bind(this),
            types: this.types,
            type: this.types.type,
            getOptions: this.getOptions.bind(this),
            open: this.state.open,
            toggleShowPassword: this.toggleShowPassword.bind(this),
            showPassword: this.state.showPassword,
            popup: this.popup,
            dragStart: this.dragStart.bind(this),
            dragOver: this.dragOver.bind(this),
            drop: this.drop.bind(this),
            click: this.click.bind(this),
            optionClick: this.optionClick.bind(this),
            datauniqid: this.datauniqid,
            getProp: this.getProp.bind(this),
            getOptionProp: this.getOptionProp.bind(this),
            parentDom: this.dom,
        }
    }
    D2S(n) { n = n.toString(); return n.length === 1 ? '0' + n : n }
    getTimeText(obj) {
        obj = { ...obj }
        for (let prop in obj) { obj[prop] = this.D2S(obj[prop]) }
        let text = [], dateArray = [];
        if (obj.year !== undefined) { dateArray.push(obj.year) }
        if (obj.month !== undefined) { dateArray.push(obj.month) }
        if (obj.day !== undefined) { dateArray.push(obj.day) }
        if (dateArray.length) { text.push(dateArray.join('/')) }
        let timeArray = []
        if (obj.hour !== undefined) { timeArray.push(obj.hour) }
        if (obj.minute !== undefined) { timeArray.push(obj.minute) }
        if (obj.second !== undefined) { timeArray.push(obj.second) }
        if (timeArray.length) { text.push(timeArray.join(':')) }
        return text.join(' ');
    }
    render_button() { return <Layout /> }
    render_list() {
        return <List properties={this.properties} getOptionProp={this.getOptionProp.bind(this)} />
    }
    render_time() {
        let getProps = () => {
            let calendarType = this.properties.calendarType;
            let today = AIODate().getToday({ calendarType });
            let todayObject = { year: today[0], month: today[1], day: today[2], hour: today[3], minute: today[4], second: today[5] }
            let value = this.properties.value || {};
            for (let prop in value) { if (value[prop] === true) { value[prop] = todayObject[prop] } }
            let popover = this.properties.popover || {};
            let onChange = this.properties.onChange;
            let className = 'aio-input-time';
            className += this.properties.className?' ' + this.properties.className:'';
            let style = this.properties.style;
            return { text: this.getTimeText(value), attrs: this.addToAttrs(this.properties.attrs, { style: { direction: 'ltr' } }), popover, onChange, value,className,style }
        }
        let { text, attrs, popover = {}, onChange,className,style } = getProps()
        return (
            <AIOInput
                caret={false} text={text} {...this.props} attrs={attrs} type='button' className={className} style={style}
                popover={!onChange ? undefined : {
                    position: 'center', ...popover, attrs: this.addToAttrs(popover.attrs, { className: 'aio-input-time-popover' }),
                    render: ({ close }) => <TimePopover value={getProps().value} onChange={(obj) => onChange(obj)} onClose={() => close()} />
                }}
            />
        )
    }
    render_file() { return <File /> }
    render_select() { return <Layout /> }
    render_multiselect() { return <Multiselect /> }
    render_radio() { return <Layout text={<Options />} /> }
    render_tabs() { return <Layout text={<Options />} /> }
    render_checkbox() { return <Layout /> }
    render_datepicker() { return <Layout /> }
    render_image() { return <Layout text={<Image />} /> }
    render_map() { return <Layout text={<Map properties={this.properties} />} /> }
    render_table() { return <Table properties={this.properties} /> }
    render_text() { return <Layout text={<Input />} /> }
    render_password() { return <Layout text={<Input />} /> }
    render_textarea() { return <Layout text={<Input />} /> }
    render_number() { return <Layout text={<Input />} /> }
    render_color() { return <Layout text={<Input />} /> }
    render_slider() { return <Layout text={<InputSlider properties={this.properties} />} /> }
    render_form() { return <Form properties={this.properties} /> }
    render() {
        let type = this.types.type;
        this.properties = getMainProperties(this.props,this.getProp.bind(this),this.types);
        if (!type || !this['render_' + type]) { return null }
        return (
            <AICTX.Provider key={this.datauniqid} value={this.getContext()}>
                {this['render_' + type]()}
                {this.popup.render()}
            </AICTX.Provider>
        )
    }
}
class Popover {
    constructor(getProp, id, toggle, getOptions, addToAttrs) {
        this.getProp = getProp;
        this.getOptions = getOptions;
        this.addToAttrs = addToAttrs;
        this.toggle = toggle;
        this.type = getProp('type');
        this.id = id;
        this.isActive = this.getIsActive();
        if (this.isActive) { this.rtl = getProp('rtl') }
    }
    getRender = (popover) => {
        if (this.type === 'button') { return ({ close }) => popover.render({ close }) }
        else if (this.type === 'datepicker') { return ({ close }) => <DatePicker onClose={close} /> }
        else {
            return ({ close }) => {
                let options = this.getOptions() || [];
                if (!options.length) { return null }
                if (popover.render) { return popover.render({ close, options }) }
                return <Options options={options} />
            }
        }
    }
    getIsActive = () => {
        let options = this.getProp('options');
        let popover = this.getProp('popover');
        if (this.type === 'button') { return !!popover }
        if (this.type === 'datepicker') { return true }
        else if (this.type === 'select') { return true }
        else if (this.type === 'multiselect') { return true }
        else if (this.type === 'text') { return !!options }
        else if (this.type === 'number') { return !!options }
        else if (this.type === 'textarea') { return !!options }
        return false
    }
    getBackdrop = (popover) => {
        let { backdrop = {} } = popover;
        return { ...backdrop, attrs: this.addToAttrs(backdrop.attrs, { className: 'aio-input-backdrop ' + this.id }) }
    }
    getBody = (popover, render) => {
        let { body = {} } = popover;
        return { ...body, render }
    }
    getPopover = (popover, dom) => {
        let { fixStyle, fitHorizontal = ['multiselect', 'text', 'number', 'textarea'].indexOf(this.type) !== -1 } = popover;
        return { fixStyle, fitHorizontal, pageSelector: '.aio-input-backdrop.' + this.id, getTarget: () => $(dom.current) }
    }
    getFn = () => {
        if (!this.isActive) { return }
        return (dom) => {
            let popover = { ...AIOInput.defaults.popover, ...this.getProp('popover', {}) }
            let render = this.getRender(popover);
            let body = this.getBody(popover, render);
            let rtl = this.getProp('rtl');
            let { position = 'popover', header } = popover;
            return {
                onClose: () => this.toggle(false),
                rtl, header, position,
                backdrop: this.getBackdrop(popover),
                body,
                popover: this.getPopover(popover, dom),
                attrs: this.addToAttrs(popover.attrs, { className: `aio-input-popover aio-input-popover-${this.rtl ? 'rtl' : 'ltr'}` })
            }
        }
    }
}
function TimePopover(props) {
    let { lang = 'fa' } = props;
    let [startYear] = useState(props.value.year ? props.value.year - 10 : undefined);
    let [endYear] = useState(props.value.year ? props.value.year + 10 : undefined);
    let [value, setValue] = useState({ ...props.value })
    function change(obj) { setValue({ ...value, ...obj }) }
    function translate(key) {
        return lang === 'fa' ? { 'year': 'سال', 'month': 'ماه', 'day': 'روز', 'hour': 'ساعت', 'minute': 'دقیقه', 'second': 'ثانیه', 'Submit': 'ثبت' }[key] : key
    }
    function getOptions(type) {
        let { year, month, day } = value;
        if (type === 'year') { return new Array(endYear - startYear + 1).fill(0).map((o, i) => { return { text: i + startYear, value: i + startYear } }) }
        if (type === 'day') {
            let length = !year || !month ? 31 : AIODate().getMonthDaysLength({ date: [year, month] });
            if (day > length) { change({ day: 1 }) }
            return new Array(length).fill(0).map((o, i) => { return { text: i + 1, value: i + 1 } })
        }
        if (type === 'month') { return new Array(12).fill(0).map((o, i) => { return { text: i + 1, value: i + 1 } }) }
        return new Array(type === 'hour' ? 24 : 60).fill(0).map((o, i) => { return { text: i, value: i } })
    }
    function layout(type) {
        if (typeof value[type] !== 'number') { return false }
        return {
            column: [
                { html: translate(type), align: 'vh', size: 36 },
                { html: (<AIOInput type='list' value={value[type]} options={getOptions(type)} size={48} width={72} onChange={(v) => change({ [type]: v })} />) }
            ]
        }
    }
    function submit() { props.onChange(value); props.onClose(); }
    return (
        <RVD
            layout={{
                className: 'dir-ltr',
                column: [
                    { align: 'h', className: 'm-b-12', row: [layout('year'), layout('month'), layout('day'), layout('hour'), layout('minute'), layout('second')] },
                    { html: <button className='ai-style-3' style={{ height: 36, fontSize: 12 }} onClick={submit}>{translate('Submit')}</button> }
                ]
            }}
        />
    )
}
function Image() {
    let { properties } = useContext(AICTX);
    let [popup] = useState(new AIOPopup());
    let {value = {},width,height,onChange,disabled,loading,placeholder,preview} = properties;
    let [url, setUrl] = useState();
    let dom = createRef()
    // if(typeof value === 'object'){
    //     let fr = new FileReader();
    //     fr.onload = function () {
    //         $(dom.current).attr('src',fr.result)
    //     }
    //     fr.readAsDataURL(value);
    // }
    useEffect(() => {
        if (value.file) {
            changeUrl(typeof value.file === 'object')
        }
        else if (typeof value.url === 'string') {
            if (url !== value.url) { setUrl(value.url) }
        }
        else if (value.url !== false) { setUrl(false) }//notice
    })
    function changeUrl(file, callback = () => { }) {
        try {
            let fr = new FileReader();
            fr.onload = function () {
                if (url !== fr.result) {
                    setUrl(fr.result);
                    callback(fr.result)
                }
            }
            fr.readAsDataURL(file);
        }
        catch { }
    }
    function openPopup() {
        popup.addModal({
            header: {
                title: '',
                onClose: (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    popup.removeModal();
                }
            },
            body: {
                render: () => {
                    let src = $(dom.current).attr('src')
                    return (<div className='aio-input-image-preview-popup'><img src={src} alt={placeholder} /></div>)
                }
            }
        })
    }
    let IMG = url ? (
        <>
            <img ref={dom} src={url} alt={placeholder} style={{ objectFit: 'cover' }} width={width} height={height} />
            {typeof onChange === 'function' && <div onClick={(e) => { e.stopPropagation(); e.preventDefault(); onChange() }} className='aio-input-image-remove'><Icon path={mdiClose} size={1} /></div>}
            {preview && <div onClick={(e) => { e.stopPropagation(); e.preventDefault(); openPopup() }} className='aio-input-image-preview'><Icon path={mdiImage} size={1} /></div>}
            {popup.render()}
        </>
    ) : <span className='aio-input-image-placeholder'>{placeholder}</span>
    if (!onChange) {
        return IMG
    }
    return (
        <AIOInput
            disabled={disabled || loading}
            type='file' justify={true} text={IMG} attrs={{ style: { width: '100%', height: '100%', padding: 0 } }}
            onChange={(file) => {
                changeUrl(file, (url) => {
                    onChange({ file, url })
                });
            }}
        />
    )
}
function Multiselect() {
    let { properties } = useContext(AICTX);
    let {style = {}} = properties.attrs;
    return (<div className={'aio-input-multiselect-container'} style={{ width: style.width }}><Layout /><Tags /></div>)
}
function Tags() {
    let { properties, getOptionProp } = useContext(AICTX);
    let value = properties.value || [], rtl = properties.rtl;
    if (!value.length || properties.hideTags) { return null }
    let options = properties.options || []
    return (
        <div className={`aio-input-tags${rtl ? ' rtl' : ''}`}>
            {
                value.map((o, i) => {
                    let option = options.find((option) => o === getOptionProp(option, 'value'))
                    if (option === undefined) { return null }
                    return <Tag key={i} value={o} option={option} />
                })
            }
        </div>
    )
}
function Tag({ option, value }) {
    let { properties, getOptionProp } = useContext(AICTX);
    let onChange = properties.onChange || (() => { })
    let text = getOptionProp(option, 'text');
    let tagAttrs = getOptionProp(option, 'tagAttrs', {});
    let tagBefore = getOptionProp(option, 'tagBefore', <Icon path={mdiCircleMedium} size={0.7} />);
    let tagAfter = getOptionProp(option, 'tagAfter');
    let disabled = getOptionProp(option, 'disabled') || properties.disabled;
    let onRemove = disabled ? undefined : () => { onChange(properties.value.filter((o) => o !== value)) }
    return (
        <div {...tagAttrs} className={'aio-input-tag' + (tagAttrs.className ? ' ' + tagAttrs.className : '') + (disabled ? ' disabled' : '')} style={tagAttrs.style}>
            <div className='aio-input-tag-icon'>{tagBefore}</div>
            <div className='aio-input-tag-text'>{text}</div>
            {tagAfter !== undefined && <div className='aio-input-tag-icon'>{tagAfter}</div>}
            <div className='aio-input-tag-icon'><Icon path={mdiClose} size={0.7} onClick={onRemove} /></div>
        </div>
    )
}
class Input extends Component {
    static contextType = AICTX;
    constructor(props) {
        super(props);
        this.dom = createRef();
        this.container = createRef();
        this.datauniqid = `ac${Math.round(Math.random() * 100000)}`;
        this.state = { value: undefined, prevValue: undefined }
    }
    componentDidMount() {
        let { properties, type } = this.context;
        let {min,max,swip,value} = properties;
        this.setState({ value, prevValue: value })
        if (type === 'number' && swip) {
            AIOSwip({
                speedY: 0.2,
                dom: ()=>$(this.dom.current),
                start: () => [0,this.state.value || 0],
                move: ({ y }) => {
                    let newValue = -y;
                    if (min !== undefined && newValue < min) { return }
                    if (max !== undefined && newValue > max) { return }
                    this.change(newValue)
                }
            })
        }
    }
    componentDidUpdate() {
        let { properties } = this.context;
        clearTimeout(this.rrt)
        let propsValue = properties.value
        if (this.state.prevValue !== propsValue) {
            this.rrt = setTimeout(() => this.setState({ value: propsValue, prevValue: propsValue }), 0)
        }
    }
    convertPersianDigits(value){
        try{
            value = value.toString();
            let res = '';
            for(let i = 0; i < value.length; i++){
                let dic = {
                    "۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9"
                }
                res += dic[value[i]] || value[i];
            }
            value = res;
        }
        catch{}
        return value
    }
    change(value, onChange) {
        let { properties, types } = this.context;
        let {blurChange,maxLength = Infinity,justNumber,filter = [],delay = 400} = properties;
        if (types.type === 'number') { if (value) { value = +value; } }
        else if (types.hasKeyboard) {
            if (value) {
                value = this.convertPersianDigits(value);
                if (justNumber) {
                    value = value.toString();
                    let lastChar = value[value.length - 1];
                    if (lastChar === ' ' || isNaN(+lastChar)) {
                        if (Array.isArray(justNumber)) {
                            if (justNumber.indexOf(lastChar) === -1) { value = value.slice(0, value.length - 1) }
                        }
                        else { value = value.slice(0, value.length - 1) }
                    }
                }
                if (filter.length) {
                    value = value.toString();
                    let lastChar = value[value.length - 1];
                    if (filter.indexOf(lastChar) !== -1) { value = value.slice(0, value.length - 1) }
                }
                if (value.toString().length > maxLength) {
                    value = value.toString().slice(0, maxLength);
                }
            }
        }
        this.setState({ value });
        if (!blurChange) {
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => onChange(value), delay);
        }
    }
    blur(onChange) {
        let { properties } = this.context;
        let {blurChange} = properties;
        if (!blurChange) { return }
        onChange(this.state.value)
    }
    getInputAttrs() {
        let { properties, showPassword, type, addToAttrs } = this.context;
        let { value = '' } = this.state;
        let {disabled,placeholder,onChange,spin,justify,options,justNumber} = properties;
        let inputAttrs = addToAttrs(properties.inputAttrs, {
            className: !spin ? 'no-spin' : undefined,
            style: justify ? { textAlign: 'center' } : undefined
        })
        let p = {
            ...inputAttrs, value, type, ref: this.dom, disabled, placeholder,
            onChange: onChange ? (e) => this.change(e.target.value, onChange) : undefined,
            onBlur: () => this.blur(onChange)
        }
        if (type === 'color' && options) { p = { ...p, list: this.datauniqid } }
        if (type === 'password' && showPassword) { p = { ...p, type: 'text', style: { ...p.style, textAlign: 'center' } } }
        if(justNumber === true){
            p.pattern = "\d*";
            p.inputMode = "numeric";
        }
        return p;
    }
    render() {
        let { properties, type } = this.context;
        let { value = '' } = this.state;
        let attrs = this.getInputAttrs()
        if (!attrs.onChange) { return value }
        else if (type === 'color') {
            let options = properties.options;
            return (
                <label style={{ width: '100%', height: '100%', background: value }}>
                    <input {...attrs} style={{ opacity: 0 }} />
                    {options && <datalist id={this.datauniqid}>{options.map((o) => <option value={o} />)}</datalist>}
                </label>
            )
        }
        else if (type === 'textarea') { return <textarea {...attrs} /> }
        else { return (<input {...attrs} />) }
    }
}
class Form extends Component {
    static contextType = AICTX;
    constructor(props) {
        super(props);
        let { properties } = props;
        let {value = {},onChange} = properties;
        this.state = { initialValue: JSON.stringify(value) }
        if (!onChange) { this.state.value = value; }
        this.errors = {}
    }
    getValue() { 
        let {properties} = this.props;
        let {onChange,value = {}} = properties;
        return onChange? value : this.state.value 
    }
    getErrors() { return [...Object.keys(this.errors).filter((o) => !!this.errors[o]).map((o) => this.errors[o])] }
    removeError(field) {
        let newErrors = {}
        for (let prop in this.errors) { if (prop !== field) { newErrors[prop] = this.errors[prop] } }
        this.errors = newErrors
    }
    setValue({itemValue, formItem,field}) {
        //اگر فرم آیتم ارسال شد یعنی در حال تغییر مستقیم توسط یک اینپوت هستیم
        //اگر فیلد ارسال شد یعنی خارج از برنامه داریم یک پروپرتی را چنج می کنیم پس ارور هندلینگ نباید انجام شود
        let {properties} = this.props;
        let {onChange} = properties;
        let Field = field || formItem.field
        let value = this.getValue();
        let newValue = this.setValueByField(value, Field, itemValue);
        if(!field){
            let error = this.getError(formItem, itemValue)
            if (error) { this.errors[Field] = error }
            else { this.removeError(Field) }
        }
        if (onChange) { onChange(newValue, this.getErrors()) }
        else { this.setState({ value: newValue }) }
    }
    header_layout() {
        let {properties} = this.props;
        let {header,title,subtitle,headerAttrs,onClose,onBack} = properties;
        if (!header && !title) { return false }
        return {
            className: 'aio-input-form-header' + (headerAttrs.className ? ' ' + headerAttrs.className : ''), style: headerAttrs.style,
            row: [
                { show: !!onBack, size: 36, html: <Icon path={mdiChevronRight} size={.8} />, align: 'vh', onClick: () => onBack() },
                {
                    show: !!title, align: 'v',
                    column: [
                        { html: title, className: 'aio-input-form-title' },
                        { show: !!subtitle, html: subtitle, className: 'aio-input-form-subtitle' },
                    ]
                },
                { flex: 1, show: !!title },
                { show: !!header, flex: !!title ? undefined : 1, html: () => typeof header === 'function' ? header() : header, align: 'vh' },
                { show: !!onClose, html: <Icon path={mdiClose} size={.8} />, onClick: () => onClose(), className: 'aio-input-form-close-icon' }
            ]
        }
    }
    body_layout() {
        let {properties} = this.props;
        let {inputs} = properties;
        if (Array.isArray(inputs)) { inputs = { column: inputs.map((o) => this.input_layout(o)) } }
        let res = { flex: 1, className: 'aio-input-form-body', ...inputs }
        return res
    }
    reset() {
        let {properties} = this.props;
        let {onChange} = properties;
        let { initialValue } = this.state;
        if (onChange) { onChange(JSON.parse(initialValue)) }
        else { this.setState({ value: JSON.parse(initialValue) }) }
    }
    footer_layout() {
        let {properties} = this.props;
        let {footer,onClose,onSubmit,footerAttrs,closeText,resetText,submitText,reset,initialDisabled} = properties;
        let { initialValue } = this.state;
        if (footer === false) { return false }
        if (!footer && !onSubmit && !onClose && !reset) { return false }
        let disabled = false;
        if(!!this.getErrors().length){disabled = true}
        else if(initialDisabled && initialValue === JSON.stringify(this.getValue())){disabled = true}
        if (footer) {
            let html = typeof footer === 'function' ? footer({ onReset: () => this.reset(), disabled, errors: this.getErrors() }) : footer;
            let className = 'aio-input-form-footer' + (footerAttrs.className ? ' ' + footerAttrs.className : '');
            return { className, style: footerAttrs.style, html }
        }
        return {
            className: 'aio-input-form-footer' + (footerAttrs.className ? ' ' + footerAttrs.className : ''), style: footerAttrs.style,
            html:(
                <>
                    { !!onClose && <button onClick={() => onClose()} className='aio-input-form-close-button aio-input-form-footer-button'>{closeText}</button>}
                    { !!reset && <button onClick={() => this.reset()} className='aio-input-form-reset-button aio-input-form-footer-button'>{resetText}</button> }
                    { !!onSubmit && <button disabled={disabled} onClick={() => onSubmit()} className='aio-input-form-submit-button aio-input-form-footer-button'>{submitText}</button> }
                </>
            )
        }
    }
    getDefault({ type, multiple }) {
        return { file: [], multiselect: [], radio: multiple ? [] : undefined, slider: multiple ? [] : undefined }[type]
    }
    getValueByField({field, def,functional,value = this.getValue()}) {
        let {properties} = this.props;
        let props = properties.props, a;
        if(functional && typeof field === 'function'){a = field(value);}
        else if (typeof field === 'string') {        
            if (field.indexOf('value.') !== -1 /*|| field.indexOf('props.') !== -1*/) {
                try { eval(`a = ${field}`); }
                catch{}
            }
            else { a = field }
        }
        else { a = field }
        return a === undefined ? def : a;
    }
    setValueByField(obj = {}, field, value) {
        try{
            field = field.replaceAll('[','.');
            field = field.replaceAll(']','');
            
        }
        catch{}
        var fields = field.split('.');
        var node = obj;
        for (let i = 0; i < fields.length - 1; i++) {
            let f = fields[i];
            if (f === 'value') { continue }
            if (node[f] === undefined) {
                if (isNaN(parseFloat(fields[i + 1]))) { node[f] = {} }
                else { node[f] = []; }
                node = node[f];
            }
            else { node = node[f]; }
        }
        node[fields[fields.length - 1]] = value;
        return obj;
    }
    componentDidMount() { this.reportErrors() }
    componentDidUpdate() { this.reportErrors() }
    reportErrors() {
        let {properties} = this.props;
        let {getErrors} = properties;
        if (!getErrors) { return }
        let errors = this.getErrors();
        if (JSON.stringify(errors) !== this.reportedErrors) {
            getErrors(errors);
            this.reportedErrors = JSON.stringify(errors)
        }
    }
    getAttrs(propsAttrs = {}, ownAttrs = {}) {
        let style = { ...propsAttrs.style, ...ownAttrs.style }
        return { ...propsAttrs, ...ownAttrs, style }
    }
    getInputProps(input, formItem) {
        let { addToAttrs } = this.context;
        let {properties} = this.props;
        let {rtl,disabled,updateInput = (o)=>o,inputStyle = {},inputClassName} = properties;
        let value = this.getValueByField({field:formItem.field, def:this.getDefault(input)});
        let props = { 
            rtl, value, 
            onChange: (value) => {
                if(input.type === 'map' && formItem.addressField && value.address){
                    this.setValue({itemValue:value.address,field:formItem.addressField})    
                }
                this.setValue({itemValue:value, formItem})
            },attrs:{} 
        };
        for (let prop in input) { 
            let functional = ['options'].indexOf(prop) !== -1;
            props[prop] = this.getValueByField({field:input[prop],functional}) 
        }
        props.value = value;
        if (input.type === 'slider' && props.showValue === undefined) { props.showValue = 'inline'; }
        let { attrs = {} } = input;
        for (let prop in attrs) { props.attrs[prop] = this.getValueByField({field:attrs[prop]}) }
        props.attrs = addToAttrs({...props.attrs}, { style: inputStyle, stylePriority: false, className: inputClassName })
        if (disabled) { props.disabled = true; }
        if (['text', 'number', 'password', 'textarea'].indexOf(props.type) !== -1) {
            let { inputAttrs = {} } = input;
            props.inputAttrs = {};
            for (let prop in inputAttrs) { props.inputAttrs[prop] = this.getValueByField({field:inputAttrs[prop]}) }
        }
        return updateInput(props);
    }
    get_layout(key,value,attrs){
        if (!value) { return false }
        let {addToAttrs} = this.context;
        let cls = 'aio-input-form';
        let className = {'label':`${cls}-label`,'footer':`${cls}-item-footer`,'error':`${cls}-error`}[key];
        attrs = addToAttrs(attrs,{className})
        return { html: value, align: 'v', attrs }
    }
    input_layout(formItem) {
        let {properties} = this.props;
        let { label, footer, input, flex, size, field } = formItem;
        let value = this.getValueByField({field, def:this.getDefault(input)});
        let error = this.getError(formItem, value)
        if (error) { this.errors[field] = error }
        else { this.errors[field] = undefined }
        let labelAttrs = this.getAttrs(properties.labelAttrs, formItem.labelAttrs)
        let errorAttrs = this.getAttrs(properties.errorAttrs, formItem.errorAttrs)
        let footerAttrs = this.getAttrs(properties.footerAttrs, formItem.footerAttrs)
        let inputProps = this.getInputProps(input, formItem);
        return {
            flex, size, className: 'aio-input-form-item',
            column: [
                {
                    flex: 1, className: 'aio-input-form-item-input-container of-visible',
                    column: [
                        this.get_layout('label',label, labelAttrs),
                        { className: 'aio-input-form-item-input-container of-visible', html: <AIOInput {...inputProps} /> },
                    ]
                },
                this.get_layout('footer',footer, footerAttrs),
                this.get_layout('error',error, errorAttrs)
            ]
        }
    }
    getError(o, value, options) {
        let {properties} = this.props;
        let {lang} = properties;
        let { validations = [], input } = o;
        let { type } = input;
        if (!validations.length || type === 'html') { return '' }
        let a = {
            value, title: o.label, lang,
            validations: validations.map((a) => {
                let params = a[2] || {};
                let target = typeof a[1] === 'function' ? a[1] : this.getValueByField({field:a[1], def:''});
                let operator = a[0];
                return [operator, target, params]
            })
        }
        return AIOValidation(a);
    }
    render() {
        let {addToAttrs} = this.context;
        let {properties} = this.props;
        let {rtl,attrs} = properties;
        attrs = addToAttrs(attrs,{className: 'aio-input-form' + (rtl ? ' aio-input-form-rtl' : '')})
        return (
            <RVD
                getLayout={(obj, parent = {}) => {
                    let show = this.getValueByField({field:obj.show, def:true});
                    if (show === false) { return false }
                    if (obj.input) { return this.input_layout({ ...obj, flex: parent.row && !obj.size && !obj.flex ? 1 : undefined }) }
                    if (parent.input) { obj.className = 'of-visible' }
                    return { ...obj }
                }}
                layout={{attrs,column: [this.header_layout(), this.body_layout(), this.footer_layout()]}}
            />
        )
    }
}
function Options(props) {
    let context = useContext(AICTX);
    let { properties, getOptions, types } = context;
    let type = properties.type;
    let [searchValue, setSearchValue] = useState('');
    function renderSearchBox(options) {
        let {search} = properties;
        if (type === 'tabs' || types.isInput || search === false) { return null }
        if (type === 'radio' && !search) { return null }
        if (typeof search !== 'string') { search = 'Search' }
        if (searchValue === '' && options.length < 10) { return null }
        return (
            <div className='aio-input-search'>
                <input type='text' value={searchValue} placeholder={search} onChange={(e) => setSearchValue(e.target.value)} />
                <div className='aio-input-search-icon' onClick={() => { setSearchValue('') }}>
                    <Icon path={searchValue ? mdiClose : mdiMagnify} size={.8} />
                </div>
            </div>
        )
    }
    function getRenderOptions(options) {
        let renderIndex = 0;
        return options.map((option, i) => {
            if (searchValue) {
                if (option.text === undefined || option.text === '') { return null }
                if (option.text.indexOf(searchValue) === -1) { return null }
            }
            let p = { key: i, option, renderIndex, realIndex: i, searchValue }
            return <Layout {...p} />
        });
    }
    let options = props.options || getOptions();
    if (!options.length) { return null }
    let renderOptions = getRenderOptions(options);
    let className = `aio-input-options aio-input-${type}-options`
    if(types.isDropdown){className += ' aio-input-dropdown-options'}
    return (
        <>
            {renderSearchBox(options)}
            <div className={className}>{renderOptions}</div>
        </>
    )
}
//column schema
//title,value,width,minWidth,justify,type,onChange,cellAttrs,subtext,before,after
const AITableContext = createContext();
class Table extends Component {
    static contextType = AICTX;
    constructor(p) {
        super(p);
        let { properties } = p;
        this.dom = createRef();
        let Sort = new SortClass({ properties, getState: () => this.state, setState: (obj) => this.setState(obj) })
        let {columns} = properties;
        let searchColumns = [];
        let updatedColumns = columns.map((o) => {
            let { id = 'aitc' + Math.round(Math.random() * 1000000), sort, search } = o;
            o._id = id;
            sort = sort === true ? {} : sort;
            let column = { ...o, sort };
            if (search) { searchColumns.push(column) }
            return column
        })
        this.state = {
            searchValue: '',
            columns: updatedColumns,
            searchColumns,
            sorts: [], Sort,
            getDynamics: ({ value, row, column, def, rowIndex }) => {
                let {properties} = this.props;
                if(properties.paging){
                    let {serverSide,number,size} = properties.paging;
                    if(!serverSide){
                        rowIndex += ((number - 1) * size)
                    }
                    
                }
                let type = typeof value;
                if (type === 'string') {
                    let result = value;
                    let {properties} = this.props;
                    let {getValue} = properties;
                    if (getValue[value]) { result = getValue[value]({ row, column, rowIndex }) }
                    else if (value.indexOf('row.') !== -1) { try { eval(`result = ${value}`); } catch { result = '' } }
                    return result === undefined ? def : result;
                }
                if (type === 'undefined') { return def }
                if (type === 'function') { return value({ row, column, rowIndex }) }
                return value === undefined ? def : value
            },
            setCell: (row, column, cellNewValue) => {
                if (column.input && column.input.onChange) { column.input.onChange({ value:cellNewValue, row, column }) }
                else {
                    let {properties} = this.props;
                    let {value,onChange = ()=>{}} = properties;
                    row = JSON.parse(JSON.stringify(row));
                    eval(`${column.value} = cellNewValue`);
                    onChange(value.map((o) => o._id !== row._id ? o : row))
                }
            }
        }
    }
    componentDidMount() {
        let { columns, Sort } = this.state;
        this.setState({ sorts: Sort.initiateSortsByColumns(columns) })
    }
    add() {
        let {properties} = this.props;
        let {onAdd,value,onChange = ()=>{}} = properties;
        if (typeof onAdd === 'function') { onAdd(); }
        else if (typeof onAdd === 'object') { onChange([onAdd, ...value]) }
    }
    remove(row, index) {
        let {properties} = this.props;
        let {value,onRemove,onChange = ()=>{}} = properties;
        let action = ()=>onChange(value.filter((o, i) => o._id !== row._id));
        if (typeof onRemove === 'function') { onRemove({row,action,rowIndex:index}); }
        else if (onRemove === true) { action(); }
    }
    exportToExcel() {
        let {properties} = this.props;
        let {excel,value} = properties;
        let list = [];
        let { getDynamics, columns } = this.state;
        for (let i = 0; i < value.length; i++) {
            let row = value[i], json = {};
            for (let j = 0; j < columns.length; j++) {
                let column = columns[j], { title, excel, value } = column;
                if (excel) { json[typeof excel === 'string' ? excel : title] = getDynamics({ value, row, column, rowIndex: i }) }
            }
            list.push(json)
        }
        ExportToExcel(list, { promptText: typeof excel === 'string' ? excel : 'Inter Excel File Name' })
    }
    dragStart(e, row) { this.start = row; }
    dragOver(e, row) { e.preventDefault(); }
    getIndexById(rows, id) { for (let i = 0; i < rows.length; i++) { if (rows[i]._id === id) { return i } } }
    drop(e, row) {
        if (this.start._id === undefined) { return }
        if (this.start._id === row._id) { return }
        let {properties} = this.props;
        let {value,onSwap,onChange = ()=>{}} = properties;
        let newValue = value.filter((o) => o._id !== this.start._id);
        let placeIndex = this.getIndexById(value, row._id);
        newValue.splice(placeIndex, 0, this.start)
        if (typeof onSwap === 'function') { onSwap({ newValue, from: { ...this.start }, to: row }) }
        else { onChange(newValue) }
    }
    getSearchedRows(rows) {
        let {properties} = this.props;
        let {onSearch} = properties;
        if (onSearch !== true) { return rows }
        let { searchColumns, searchValue, getDynamics } = this.state;
        if (!searchColumns.length || !searchValue) { return rows }
        return AIOInputSearch(rows, searchValue, (row, index) => {
            let str = '';
            for (let i = 0; i < searchColumns.length; i++) {
                let column = searchColumns[i];
                let value = getDynamics({ value: column.value, row, def: '', column, rowIndex: index });
                if (value) { str += value + ' ' }
            }
            return str
        })
    }
    getRows() {
        let {properties} = this.props;
        let { Sort } = this.state;
        let {value = [],paging:p} = properties;
        let searchedRows = this.getSearchedRows(value);
        let sortedRows = Sort.getSortedRows(searchedRows);
        let pagedRows = p && !p.serverSide ? sortedRows.slice((p.number - 1) * p.size, p.number * p.size) : sortedRows;
        return { rows:value, searchedRows, sortedRows, pagedRows }
    }
    //calculate style of cells and title cells
    getCellStyle(column) {
        let { getDynamics } = this.state;
        let width = getDynamics({ value: column.width });
        let minWidth = getDynamics({ value: column.minWidth });
        return { width: width ? width : undefined, flex: width ? undefined : 1, minWidth }
    }
    getCellAttrs({ row, rowIndex, column,type }){
        let {addToAttrs} = this.context;
        let { getDynamics } = this.state;
        let attrs = getDynamics({ value: column[`${type}Attrs`], column, def: {},row,rowIndex });
        let justify = getDynamics({ value: column.justify, def: false });
        let cls = `aio-input-table-${type}` + (justify ? ` aio-input-table-${type}-justify` : '')
        attrs = addToAttrs(attrs,{className:cls,style:this.getCellStyle(column)});
        if(type === 'title'){attrs.title = getDynamics({ value: column.title, def: '' })}
        return { ...attrs }
    }
    getRowAttrs(row, rowIndex) {
        let {properties} = this.props;
        let { addToAttrs,rowAttrs = ()=>{return {}} } = this.context;
        let {onSwap} = properties;
        let obj = addToAttrs(rowAttrs({ row, rowIndex }), { className: 'aio-input-table-row' })
        if (!!onSwap) { obj = { ...obj, draggable: true, onDragStart: (e) => this.dragStart(e, row), onDragOver: (e) => this.dragOver(e, row), onDrop: (e) => this.drop(e, row) } }
        return obj;
    }
    getCellContent({ row, rowIndex, column }) {
        let { getDynamics, setCell } = this.state;
        let template = getDynamics({ value: column.template, row, rowIndex, column });
        if (template !== undefined) { return template }
        let input = getDynamics({ value: column.input, row, rowIndex, column });
        if (!input) { input = { type: 'text' } }
        let convertedInput = {}
        for (let prop in input) { 
            if(['onChange','onClick'].indexOf(prop) !== -1){convertedInput[prop] = input[prop]}
            else {convertedInput[prop] = getDynamics({ value: input[prop], row, rowIndex, column }) }
        }
        return (
            <AIOInput
                {...convertedInput}
                value={getDynamics({ value: column.value, row, rowIndex, column })}
                onChange={column.input ? (value) => setCell(row, column, value) : undefined}
            />
        )
    }
    search(searchValue) {
        let {properties} = this.props;
        let {onSearch} = properties;
        if (onSearch === true) { this.setState({ searchValue }) }
        else { onSearch(searchValue) }
    }
    getContext(ROWS) {
        let {addToAttrs} = this.context;
        let {properties} = this.props;
        let {rowGap,columnGap} = properties;
        let context = {
            ROWS,addToAttrs,
            properties,
            state: { ...this.state },
            parentDom: this.dom,
            SetState: (obj) => this.setState(obj),
            getCellAttrs: this.getCellAttrs.bind(this),
            getRowAttes: this.getRowAttrs.bind(this),
            getCellContent: this.getCellContent.bind(this),
            add: this.add.bind(this),
            remove: this.remove.bind(this),
            search: this.search.bind(this),
            exportToExcel: this.exportToExcel.bind(this),
            RowGap: <div className='aio-input-table-border-h' style={{ height: rowGap }}></div>,
            ColumnGap: <div className='aio-input-table-border-v' style={{ width: columnGap }}></div>,
        }
        return context
    }
    render() {
        let {properties} = this.props;
        let {paging,attrs} = properties;
        let ROWS = this.getRows();
        return (
            <AITableContext.Provider value={this.getContext(ROWS)}>
                <div {...attrs} ref={this.dom} className={'aio-input-table' + (attrs.className ? ' ' + attrs.className : '')}>
                    <TableToolbar />
                    <div className='aio-input-table-unit'><TableHeader /><TableRows /></div>
                    {paging ? <TablePaging /> : ''}
                </div>
            </AITableContext.Provider>
        )
    }
}
function TablePaging() {
    function fix(paging) {
        let { number, size = 20, length = 0, sizes = [1, 5, 10, 15, 20, 30, 50, 70, 100], serverSide } = paging
        if (!serverSide) { length = ROWS.sortedRows.length }
        if (sizes.indexOf(size) === -1) { size = sizes[0] }
        let pages = Math.ceil(length / size);
        number = number > pages ? pages : number;
        number = number < 1 ? 1 : number;
        let start = number - 3;
        let end = number + 3;
        return { ...paging, length, pages, number, size, sizes, start, end }
    }
    let { ROWS, properties } = useContext(AITableContext)
    let [paging,setPaging] = useState(fix(properties.paging));
    let [timeout,settimeout] = useState()
    useEffect(()=>{
        setPaging(fix(properties.paging));
    },[properties.paging])
    function changePaging(obj) { 
        let newPaging = fix({ ...paging, ...obj });
        setPaging(newPaging);
        if(newPaging.serverSide){
            clearTimeout(timeout);
            settimeout(setTimeout(()=>newPaging.onChange(newPaging),800));
        }
        else{newPaging.onChange(newPaging)}
    }
    let { rtl, pages, number, size, sizes, start, end } = paging;
    let buttons = [];
    let isFirst = true
    for (let i = start; i <= end; i++) {
        if (i < 1 || i > pages) {
            buttons.push(<button key={i} className={'aio-input-table-paging-button aio-input-table-paging-button-hidden'}>{i}</button>)
        }
        else {
            let index;
            if(isFirst){index = 1; isFirst = false;}
            else if(i === Math.min(end,pages)){index = pages}
            else{index = i;}
            buttons.push(<button key={index} className={'aio-input-table-paging-button' + (index === number ? ' active' : '')} onClick={() => changePaging({ number: index })}>{index}</button>)
        }
    }
    return (
        <div className='aio-input-table-paging' style={{ direction: rtl ? 'rtl' : 'ltr' }}>
            {buttons}
            {
                sizes.length &&
                <AIOInput
                    attrs={{ className: 'aio-input-table-paging-button aio-input-table-paging-size' }}
                    type='select' value={size} options={sizes} optionText='option' optionValue='option'
                    onChange={(value) => changePaging({ size: value })}
                    popover={{fitHorizontal:true}}
                />
            }
        </div>
    )
}
function TableRows() {
    let { properties, ROWS } = useContext(AITableContext)
    let {rowTemplate,rowAfter = () => null,rowBefore = () => null,rowsTemplate,placeholder = 'there is not any items'} = properties;
    function getContent() {
        let rows = ROWS.pagedRows || [];
        if (rowsTemplate) { return rowsTemplate(rows) }
        if (rows.length) {
            return rows.map((o, i) => {
                let { id = 'ailr' + Math.round(Math.random() * 10000000) } = o;
                o._id = o._id === undefined ? id : o._id;
                let isLast = i === rows.length - 1, Row;
                if (rowTemplate) { Row = rowTemplate({ row: o, rowIndex: i, isLast }) }
                else { Row = <TableRow key={id} row={o} rowIndex={i} isLast={isLast} /> }
                return (<Fragment key={id}>{rowBefore({ row: o, rowIndex: i })}{Row}{rowAfter({ row: o, rowIndex: i })}</Fragment>)
            })
        }
        if(placeholder){
            return <div style={{ width: '100%', textAlign: 'center', padding: 12, boxSizing: 'border-box' }}>{placeholder}</div>
        }
        return false
    }
    let content = getContent();
    if(content === false){return null}
    return <div className='aio-input-table-rows'>{content}</div>
}
function TableToolbar() {
    let { add, exportToExcel, RowGap, properties, state, search,addToAttrs } = useContext(AITableContext);
    let {toolbarAttrs,toolbar,onAdd,excel,onSearch} = properties;
    toolbarAttrs = addToAttrs(toolbarAttrs,{className:'aio-input-table-toolbar'})
    let { sorts } = state;
    if (!onAdd && !excel && !toolbar && !onSearch && !sorts.length) { return null }
    return (
        <>
            <div {...toolbarAttrs}>
                {toolbar && <div className='aio-input-table-toolbar-content'>{typeof toolbar === 'function' ? toolbar() : toolbar}</div>}
                <div className='aio-input-table-search'>
                    {!!onSearch && <AIOInput type='text' onChange={(value) => search(value)} after={<Icon path={mdiMagnify} size={0.7} />} />}
                </div>
                {state.Sort.getSortButton()}
                {!!excel && <div className='aio-input-table-toolbar-icon' onClick={() => exportToExcel()}><Icon path={mdiFileExcel} size={0.8} /></div>}
                {!!onAdd && <div className='aio-input-table-toolbar-icon' onClick={() => add()}><Icon path={mdiPlusThick} size={0.8} /></div>}

            </div>
            {RowGap}
        </>
    )
}
function TableHeader() {
    let { RowGap, properties, state,addToAttrs } = useContext(AITableContext);
    let {headerAttrs,onRemove} = properties;
    headerAttrs = addToAttrs(headerAttrs,{className:'aio-input-table-header'})
    let { columns } = state;
    let Titles = columns.map((o, i) => <TableTitle key={o._id} column={o} isLast={i === columns.length - 1} />);
    let RemoveTitle = !onRemove ? null : <button className='aio-input-table-remove'></button>;
    return (<><div {...headerAttrs}>{Titles}{RemoveTitle}{RowGap}</div></>)
}
function TableTitle({ column, isLast }) {
    let { ColumnGap, getCellAttrs } = useContext(AITableContext);
    let attrs = getCellAttrs({column,type:'title'});
    return (
        <>
            <div {...attrs}>{attrs.title}</div>
            {!isLast && ColumnGap}
        </>
    )
}
function TableRow({ row, isLast, rowIndex }) {
    let { remove, RowGap, properties, state, getRowAttes } = useContext(AITableContext);
    function getCells() {
        return state.columns.map((column, i) => {
            let key = row._id + ' ' + column._id;
            let isLast = i === state.columns.length - 1;
            return (<TableCell isLast={isLast} key={key} row={row} rowIndex={rowIndex} column={column} />)
        })
    }
    let {onRemove} = properties;
    return (
        <>
            <div key={row._id} {...getRowAttes(row, rowIndex)}>
                {getCells(row, rowIndex)}
                {onRemove ? <button className='aio-input-table-remove' onClick={() => remove(row)}><Icon path={mdiClose} size={0.8} /></button> : null}
            </div>
            {RowGap}
        </>
    )
}
const TableCell = ({ row, rowIndex, column, isLast }) => {
    let context = useContext(AITableContext);
    let { ColumnGap, getCellAttrs, getCellContent } = context;
    let content = getCellContent({ row, rowIndex, column });
    return (
        <Fragment key={row._id + ' ' + column._id}>
            <div {...getCellAttrs({ row, rowIndex, column,type:'cell' })} >{content}</div>
            {!isLast && ColumnGap}
        </Fragment>
    )

}
class SortClass {
    constructor({ properties, getState, setState }) {
        this.properties = properties;
        this.getState = getState;
        this.setState = setState;
    }
    setSort = (sortId, changeObject) => {
        let { sorts } = this.getState();
        let newSorts = sorts.map((sort) => {
            if (sort.sortId === sortId) {
                let newSort = { ...sort, ...changeObject }
                return newSort;
            }
            return sort
        });
        this.setSorts(newSorts)
    }
    setSorts = async (sorts) => {
        let {onChangeSort} = this.properties;
        if (onChangeSort) {
            let res = await onChangeSort(sorts)
            if (res !== false) { this.setState({ sorts }); }
        }
        else {
            this.setState({ sorts });
            let activeSorts = sorts.filter((sort) => sort.active !== false);
            if (activeSorts.length) {
                let {value ,onChange = ()=>{}} = this.properties;
                onChange(this.sort(value, activeSorts))
            }
        }
    }
    getSortedRows = (rows) => {
        if (this.initialSort) { return rows }
        let {onChangeSort,onChange = ()=>{}} = this.properties;
        let { sorts } = this.getState();
        if (onChangeSort) { return rows }
        let activeSorts = sorts.filter((sort) => sort.active !== false);
        if (!activeSorts.length) { return rows }
        if (rows.length) { this.initialSort = true; onChange(this.sort(rows, activeSorts)) }
        else { return rows; }
    }
    sort = (rows = [], sorts = []) => {
        if (!sorts.length) { return rows }
        return rows.sort((a, b) => {
            for (let i = 0; i < sorts.length; i++) {
                let { dir, getValue } = sorts[i];
                let aValue = getValue(a), bValue = getValue(b);
                if (aValue < bValue) { return -1 * (dir === 'dec' ? -1 : 1); }
                if (aValue > bValue) { return 1 * (dir === 'dec' ? -1 : 1); }
                if (i === sorts.length - 1) { return 0; }
            }
            return 0;
        });
    }
    initiateSortsByColumns = (columns) => {
        let { getDynamics } = this.getState();
        let sorts = [];
        for (let i = 0; i < columns.length; i++) {
            let column = columns[i];
            let { sort, _id, type } = column;
            if (!sort) { continue }
            let { active = false, dir = 'dec' } = sort;
            let getValue = (row) => {
                let value = getDynamics({ value: column.value, row, column })
                if (type === 'datepicker') { value = AIODate().getTime(value); }
                return value
            }
            sorts.push({ dir, title: sort.title || column.title, sortId: _id, active, type, getValue })
        }
        return sorts;
    }
    getSortOption = (sort) => {
        let { active, dir = 'dec', title, sortId } = sort;
        return {
            text: title, checked: !!active, close: false, value: sortId,
            after: (
                <Icon
                    path={dir === 'dec' ? mdiArrowDown : mdiArrowUp} size={0.8}
                    onClick={(e) => { e.stopPropagation(); this.setSort(sortId, { dir: dir === 'dec' ? 'inc' : 'dec' }) }}
                />
            )
        }
    }
    getSortButton() {
        let { sorts } = this.getState();
        if (!sorts.length) { return null }
        let sortOptions = sorts.map((sort) => this.getSortOption(sort));
        return (
            <AIOInput
                popover={{ header: { attrs: { className: 'aio-input-table-toolbar-popover-header' }, title: 'Sort', onClose: false }, pageSelector: '.aio-input-table' }}
                key='sortbutton' caret={false} type='select' options={sortOptions}
                attrs={{ className: 'aio-input-table-toolbar-icon' }}
                text={<Icon path={mdiSort} size={0.7} />}
                onSwap={(from, to, swap) => this.setSorts(swap(sorts, from, to))}
                onChange={(value, option) => {
                    this.setSort(value, { active: !option.checked })
                }}
            />
        )
    }
}
class Layout extends Component {
    static contextType = AICTX;
    constructor(p) {
        super(p);
        this.dom = createRef()
    }
    getClassName(label) {
        let { properties, getOptionProp, datauniqid, types, isMultiple } = this.context;
        let {direction,disabled,rtl} = properties;
        let { option } = this.props;
        let cls;
        if (option !== undefined) {
            cls = `aio-input-option aio-input-${this.properties.type}-option`
            if (isMultiple()) { cls += ` aio-input-${this.properties.type}-multiple-option` }
            if (types.isDropdown) { cls += ` aio-input-dropdown-option` }
            if (getOptionProp(option, 'disabled')) { cls += ' disabled' }
        }
        else {
            cls = `aio-input aio-input-${this.properties.type}`;
            if (this.properties.type === 'slider') {
                if (direction === 'top' || direction === 'bottom') { cls += ' aio-input-slider-vertical' }
                else { cls += ' aio-input-slider-horizontal' }
            }
            if (disabled) { cls += ' disabled' }
            if (types.isInput) { cls += ` aio-input-input` }
            if (rtl) { cls += ' aio-input-rtl' }

        }
        cls += ' ' + datauniqid;
        cls += label ? ' has-label' : '';
        return cls;
    }
    getProps() {
        let { dragStart, dragOver, drop, click, optionClick, open,addToAttrs } = this.context;
        let { option, realIndex, renderIndex } = this.props;
        let { label, justify, attrs = {}, disabled,draggable } = this.properties;
        let zIndex;
        if (open && !option && ['text', 'number', 'textarea'].indexOf(this.properties.type) !== -1) {
            zIndex = 100000
        }
        let onClick;
        //ممکنه این یک آپشن باشه باید دیزیبل پرنتش هم چک بشه تا دیزیبل بشه
        if (!disabled) {
            if (option === undefined) {onClick = (e) => { e.stopPropagation(); click(e, this.dom) }}
            else {onClick = (e) => { e.stopPropagation(); optionClick(option) }}
        }
        attrs = addToAttrs(attrs,{
            className:this.getClassName(label),
            style: { ...this.properties.style,justifyContent: justify ? 'center' : undefined, zIndex }
        })
        let p = {...attrs, onClick, ref: this.dom, disabled, 'data-label': label}
        if (draggable) {
            p.datarealindex = realIndex;
            p.datarenderindex = renderIndex;
            p.onDragStart = dragStart;
            p.onDragOver = dragOver;
            p.onDrop = drop;
            p.draggable = true;
        }
        return p;
    }
    getDefaultChecked() {
        if (this.properties.type === 'checkbox') { return !!this.properties.value }
    }
    getItemClassName(key) {
        let { option } = this.props,className = `aio-input-${key}`;
        if (option) {className += ` aio-input-${this.properties.type}-option-${key}`}
        else {className += ` aio-input-${this.properties.type}-${key}`}
        return className;
    }
    text_layout() {
        let { text, subtext,placeholder, justify } = this.properties;
        let {types} = this.context;
        if (text === undefined && placeholder !== undefined) { text = <div className='aio-input-placeholder'>{placeholder}</div> }
        if (text) {
            if (subtext) {
                return (
                    <div className={`aio-input-content aio-input-${this.properties.type}-content${justify && !types.isInput ? ' aio-input-content-justify' : ''}`}>
                        <div style={{ textAlign: justify ? 'center' : undefined }} className={`${this.getItemClassName('value')}${justify && !types.isInput ? ' aio-input-value-justify' : ''}`}>{text}</div>
                        <div style={{ textAlign: justify ? 'center' : undefined }} className={`${this.getItemClassName('subtext')}${justify && !types.isInput ? ' aio-input-value-justify' : ''}`}>{subtext}</div>
                    </div>
                )
            }
            else {
                return (
                    <div
                        style={{ textAlign: justify && !types.isInput ? 'center' : undefined }}
                        className={`${this.getItemClassName('value')}${justify && !types.isInput ? ' aio-input-value-justify' : ''}`}
                    >{text}</div>
                )
            }
        }
        else { return <div className='flex-1'></div> }
    }
    getProperties(){
        let { properties,type } = this.context;
        let { option,text } = this.props;
        let res = option?option:properties;
        if(text !== undefined){res.text = text}
        return {...res,type}
    }
    getDragIcon(){
        return (
            <svg viewBox="8 4 10 13" role="presentation" style={{width: 12,height: '1.8rem'}}>
                <path d="M9,3H11V5H9V3M13,3H15V5H13V3M9,7H11V9H9V7M13,7H15V9H13V7M9,11H11V13H9V11M13,11H15V13H13V11M9,15H11V17H9V15M13,15H15V17H13V15M9,19H11V21H9V19M13,19H15V21H13V19Z" style={{fill: 'currentcolor'}}></path>
            </svg>
        )
    }
    render() {
        let { option } = this.props;
        this.properties = this.getProperties();
        let { checked, checkIcon = AIOInput.defaults.checkIcon, before, after, caret, loading,type,draggable } = this.properties;
        let content = (
            <>
                {draggable && this.getDragIcon()}
                <CheckIcon {...{ checked, checkIcon, type, option }} />
                {before !== undefined && <div className={this.getItemClassName('before')}>{before}</div>}
                {this.text_layout()}
                {after !== undefined && <div className={this.getItemClassName('after')}>{after}</div>}
                {loading && <div className={this.getItemClassName('loading')}>{loading === true ? <Icon path={mdiLoading} spin={0.3} size={.8} /> : loading}</div>}
                {caret && <div className='aio-input-caret'>{caret === true ? <Icon path={mdiChevronDown} size={.8} /> : caret}</div>}
            </>
        )
        let props = this.getProps();
        if (type === 'file') { return (<label {...props}>{content}<InputFile /></label>) }
        return (<div {...props}>{content}</div>)
    }
}
class CheckIcon extends Component {
    static contextType = AICTX;
    render() {
        let { checked, checkIcon = [] } = this.props;
        if (checked === undefined) { return null }
        if (typeof checkIcon === 'function') { return checkIcon(checked) }
        return (
            <div className={'aio-input-check-out' + (checked ? ' checked' : '')} style={{ ...checkIcon, background: 'none' }}>
                {checked && <div className={'aio-input-check-in'} style={{ background: checkIcon.background }}></div>}
            </div>
        );
    }
}
function File() {return (<div className='aio-input-file-container'><Layout /><FileItems /></div>)}
class InputFile extends Component {
    static contextType = AICTX;
    change(e) {
        let { properties, isMultiple } = this.context;
        let {value = [],onChange = ()=>{}} = properties;
        let Files = e.target.files;
        let result;
        if (isMultiple()) {
            result = [...value];
            let names = result.map(({ name }) => name);
            for (let i = 0; i < Files.length; i++) {
                let file = Files[i];
                if (names.indexOf(file.name) !== -1) { continue }
                result.push({ name: file.name, size: file.size, file })
            }
        }
        else {result = Files.length ? Files[0] : undefined}
        onChange(result)
    }
    render() {
        let { properties, isMultiple } = this.context;
        let {disabled} = properties;
        let multiple = isMultiple();
        let props = { disabled, type: 'file', style: { display: 'none' }, multiple, onChange: (e) => this.change(e) }
        return <input {...props} />
    }
}
class FileItems extends Component {
    static contextType = AICTX;
    render() {
        let { properties } = this.context;
        let {value,rtl} = properties;
        let files = [];
        if (Array.isArray(value)) { files = value }
        else if (value) { files = [value] }
        else { return null }
        if (!files.length) { return null }
        return (
            <div className='aio-input-files' style={{ direction: rtl ? 'rtl' : 'ltr' }}>{files.map((file, i) => <FileItem key={i} file={file} index={i} />)}</div>
        )
    }
}
class FileItem extends Component {
    static contextType = AICTX;
    getFile(file) {
        let filename = file.name || 'untitle';
        let fileSize = file.size || 0;
        let nameLength = 20;
        try {
            let minName, sizeString;
            let lastDotIndex = filename.lastIndexOf('.');
            let name = filename.slice(0, lastDotIndex);
            let format = filename.slice(lastDotIndex + 1, filename.length);
            if (name.length > nameLength) {
                minName = name.slice(0, parseInt(nameLength / 2)) + '...' + name.slice(name.length - parseInt(nameLength / 2), name.length) + '.' + format;
            }
            else { minName = filename; }
            let size = fileSize;
            if (!size) { return { minName, sizeString: false } }
            let gb = size / (1024 * 1024 * 1024), mb = size / (1024 * 1024), kb = size / 1024;
            if (gb >= 1) { sizeString = gb.toFixed(2) + ' GB'; }
            else if (mb >= 1) { sizeString = mb.toFixed(2) + ' MB'; }
            else if (kb >= 1) { sizeString = kb.toFixed(2) + ' KB'; }
            else { sizeString = size + ' byte' }
            return { minName, sizeString }
        }
        catch {return { minName: 'untitle', sizeString: false }}
    }
    remove(index) {
        let { properties } = this.context;
        let {onChange = ()=>{},value = []} = properties;
        let newValue = [];
        for (let i = 0; i < value.length; i++) {
            if (i === index) { continue }
            newValue.push(value[i])
        }
        onChange(newValue);
    }
    renderString(minName, sizeString) {
        let size;
        if (sizeString === false) { size = '' }
        else { size = ` ( ${sizeString})` }
        return `${minName}${size}`
    }
    render() {
        let { file, index } = this.props;
        let { minName, sizeString } = this.getFile(file);
        let { url, name } = file;
        return (
            <div className='aio-input-file' style={{ cursor: url ? 'pointer' : 'default' }}>
                <div className='aio-input-file-icon'>
                    <Icon path={url ? mdiDownloadOutline : mdiAttachment} size={.8} />
                </div>
                <div className='aio-input-file-name' onClick={() => {
                    if (url) { DownloadUrl(url, name) }
                }}>
                    {this.renderString(minName, sizeString)}
                </div>
                <div className='aio-input-file-icon' onClick={() => this.remove(index)}>
                    <Icon path={mdiClose} size={.7} />
                </div>
            </div>
        )
    }
}
const DPContext = createContext();
class DatePicker extends Component {
    static contextType = AICTX;
    render() {
        let { properties } = this.context, { onClose } = this.props
        return (<Calendar properties={properties} onClose={onClose} />)
    }
}
class Calendar extends Component {
    constructor(props) {
        super(props);
        let { properties } = props;
        let {calendarType,value} = properties;
        let { getToday, convertToArray, getMonths, getWeekDay } = AIODate();
        let today = getToday({ calendarType });
        if (!value) { value = today }
        let [year, month, day] = convertToArray({ date: value })
        let months = getMonths({ calendarType });
        this.state = {
            activeDate: { year, month, day }, years: this.getYears(), today,
            todayWeekDay: getWeekDay({ date: today }).weekDay,
            months, thisMonthString: months[today[1] - 1],
        }
    }
    translate(text) {
        let { properties, translate = (text) => text } = this.props;
        let {calendarType,unit} = properties;
        if (text === 'Today') {
            if (unit === 'month') { text = 'This Month' }
            else if (unit === 'hour') { text = 'This Hour' }
        }
        let obj = { 'Clear': 'حذف', 'This Hour': 'ساعت کنونی', 'Today': 'امروز', 'This Month': 'ماه جاری', }
        let res = text;
        if (calendarType === 'jalali' && obj[text]) { res = obj[text] }
        return translate(res)
    }
    changeActiveDate(obj) {
        let newActiveDate;
        if (obj === 'today') {
            let { today } = this.state;
            let { properties } = this.props;
            let {unit} = properties;
            let [year, month, day] = today;
            newActiveDate = { year, month, day: unit === 'month' ? 1 : day };
        }
        else { newActiveDate = { ...this.state.activeDate, ...obj } }
        this.setState({ activeDate: newActiveDate })
    }
    getYears() {
        let start, end;
        let { properties } = this.props;
        let {calendarType,startYear,endYear} = properties
        let today = AIODate().getToday({ calendarType });
        if (typeof startYear === 'string' && startYear.indexOf('-') === 0) {
            start = today[0] - parseInt(startYear.slice(1, startYear.length));
        }
        else { start = parseInt(startYear); }
        if (typeof endYear === 'string' && endYear.indexOf('+') === 0) {
            end = today[0] + parseInt(endYear.slice(1, endYear.length));
        }
        else { end = parseInt(endYear); }
        let years = [];
        for (var i = start; i <= end; i++) { years.push(i); }
        return years;
    }
    getPopupStyle() {
        let { properties } = this.props;
        let {disabled,size,theme} = properties;
        return {
            width: size, fontSize: size / 17, background: theme[1], color: theme[0], stroke: theme[0],
            cursor: disabled === true ? 'not-allowed' : undefined,
        };
    }
    getContext() {
        let { properties } = this.props;
        return {
            ...this.state,
            properties,
            changeActiveDate: this.changeActiveDate.bind(this),
            translate: this.translate.bind(this),
            SetState: (obj) => this.setState(obj),
            onChange: ({ year, month, day, hour }) => {
                let { properties, onClose } = this.props;
                let {calendarType,unit,onChange = ()=>{},close,value} = properties;
                let { months } = this.state;
                let dateArray = [year, month, day, hour];
                let jalaliDateArray = calendarType === 'gregorian' ? AIODate().toJalali({ date: dateArray }) : dateArray;
                let gregorianDateArray = calendarType === 'jalali' ? AIODate().toGregorian({ date: dateArray }) : dateArray;
                let { weekDay, index: weekDayIndex } = unit === 'month' ? { weekDay: null, index: null } : AIODate().getWeekDay({ date: dateArray })
                let get2digit = (v) => {
                    if (v === undefined) { return }
                    v = v.toString();
                    return v.length === 1 ? `0${v}` : v
                }
                let dateString;
                let splitter = typeof value === 'string' ? AIODate().getSplitter(value) : '/';
                if (unit === 'month') { dateString = `${year}${splitter}${get2digit(month)}` }
                else if (unit === 'day') { dateString = `${year}${splitter}${get2digit(month)}${splitter}${get2digit(day)}` }
                else if (unit === 'hour') { dateString = `${year}${splitter}${get2digit(month)}${splitter}${get2digit(day)}${splitter}${get2digit(hour)}` }
                let monthString = months[month - 1];
                let jalaliMonthString = calendarType === 'gregorian' ? AIODate().getMonths({ calendarType: 'jalali' })[month - 1] : monthString;
                let gregorianMonthString = calendarType === 'jalali' ? AIODate().getMonths({ calendarType: 'gregorian' })[month - 1] : monthString;
                let props = {
                    months, jalaliDateArray, gregorianDateArray, dateArray, weekDay, weekDayIndex, dateString,
                    year, month, day, hour, monthString, jalaliMonthString, gregorianMonthString,
                }
                onChange(dateString, props);
                if (close) { onClose() }
            }
        }
    }
    render() {
        return (
            <DPContext.Provider value={this.getContext()}>
                <div className='aio-input-datepicker-container' style={{ display: 'flex' }}>
                    <div className='aio-input-datepicker-calendar' style={this.getPopupStyle()}>
                        <DPHeader /><DPBody /><DPFooter />
                    </div>
                    <DPToday />
                </div>
            </DPContext.Provider>
        );
    }
}
class DPToday extends Component {
    static contextType = DPContext;
    render() {
        let { properties, translate, today, todayWeekDay, thisMonthString } = this.context;
        let {theme,calendarType,unit,size} = properties;
        return (
            <div className='aio-input-datepicker-today' style={{ width: size / 2, color: theme[1], background: theme[0] }}>
                <div style={{ fontSize: size / 13 }}>{translate('Today')}</div>
                {
                    (unit === 'day' || unit === 'hour') &&
                    <>
                        <div style={{ fontSize: size / 11 }}>{calendarType === 'gregorian' ? todayWeekDay.slice(0, 3) : todayWeekDay}</div>
                        <div style={{ fontSize: size / 12 * 4, height: size / 12 * 4 }}>{today[2]}</div>
                        <div style={{ fontSize: size / 11 }}>{calendarType === 'gregorian' ? thisMonthString.slice(0, 3) : thisMonthString}</div>
                    </>
                }
                {unit === 'month' && <div style={{ fontSize: size / 8 }}>{calendarType === 'gregorian' ? thisMonthString.slice(0, 3) : thisMonthString}</div>}
                <div style={{ fontSize: size / 11 }}>{today[0]}</div>
                {unit === 'hour' && <div style={{ fontSize: size / 10 }}>{today[3] + ':00'}</div>}
            </div>
        )
    }
}
class DPFooter extends Component {
    static contextType = DPContext;
    render() {
        let { properties, changeActiveDate, translate } = this.context;
        let {remove,disabled,onChange = ()=>{},size} = properties;
        if (disabled) { return null }
        let buttonStyle = { padding: `${size / 20}px 0` };
        return (
            <div className='aio-input-datepicker-footer' style={{ fontSize: size / 13 }}>
                {remove && <button style={buttonStyle} onClick={() => onChange(false)}>{translate('Clear')}</button>}
                <button style={buttonStyle} onClick={() => changeActiveDate('today')}>{translate('Today')}</button>
            </div>
        )
    }
}
class DPBody extends Component {
    static contextType = DPContext;
    getStyle() {
        let { properties } = this.context;
        let {size,calendarType,unit} = properties;
        var columnCount = { hour: 4, day: 7, month: 3 }[unit];
        var rowCount = { hour: 6, day: 7, month: 4 }[unit];
        var padding = size / 18, fontSize = size / 15,a = (size - padding * 2) / columnCount;
        var rowHeight = { hour: size / 7, day: a, month: size / 6, year: size / 7 }[unit];
        var gridTemplateColumns = '', gridTemplateRows = '';
        for (let i = 1; i <= columnCount; i++) {gridTemplateColumns += a + 'px' + (i !== columnCount ? ' ' : '')}
        for (let i = 1; i <= rowCount; i++) {gridTemplateRows += (rowHeight) + 'px' + (i !== rowCount ? ' ' : '')}
        let direction = calendarType === 'gregorian' ? 'ltr' : 'rtl';
        return { gridTemplateColumns, gridTemplateRows, direction, padding, fontSize }
    }
    render() {
        let { properties, activeDate } = this.context;
        let {unit} = properties;
        return (
            <div className='aio-input-datepicker-body' style={this.getStyle()}>
                {unit === 'hour' && new Array(24).fill(0).map((o, i) => <DPCell key={'cell' + i} dateArray={[activeDate.year, activeDate.month, activeDate.day, i]} />)}
                {unit === 'day' && <DPBodyDay />}
                {unit === 'month' && new Array(12).fill(0).map((o, i) => <DPCell key={'cell' + i} dateArray={[activeDate.year, i + 1]} />)}
            </div>
        )
    }
}
class DPBodyDay extends Component {
    static contextType = DPContext;
    render() {
        let { properties, activeDate } = this.context;
        let {theme,calendarType} = properties;
        let firstDayWeekDayIndex = AIODate().getWeekDay({ date: [activeDate.year, activeDate.month, 1] }).index;
        var daysLength = AIODate().getMonthDaysLength({ date: [activeDate.year, activeDate.month] });
        let weekDays = AIODate().getWeekDays({ calendarType });
        return (<>
            {weekDays.map((weekDay, i) => <DPCellWeekday key={'weekday' + i} weekDay={weekDay} />)}
            {new Array(firstDayWeekDayIndex).fill(0).map((o, i) => <div key={'space' + i} className='aio-input-datepicker-space aio-input-datepicker-cell' style={{ background: theme[1] }}></div>)}
            {new Array(daysLength).fill(0).map((o, i) => <DPCell key={'cell' + i} dateArray={[activeDate.year, activeDate.month, i + 1]} />)}
            {new Array(42 - (firstDayWeekDayIndex + daysLength)).fill(0).map((o, i) => <div key={'endspace' + i} className='aio-input-datepicker-space aio-input-datepicker-cell' style={{ background: theme[1] }}></div>)}
        </>)
    }
}
class DPCellWeekday extends Component {
    static contextType = DPContext;
    render() {
        let { properties, translate } = this.context;
        let {theme,calendarType} = properties;
        let { weekDay } = this.props;
        return (
            <div className='aio-input-datepicker-weekday aio-input-datepicker-cell' style={{ background: theme[1], color: theme[0] }}>
                <span>{translate(weekDay.slice(0, calendarType === 'gregorian' ? 2 : 1))}</span>
            </div>
        )
    }
}
class DPCell extends Component {
    static contextType = DPContext;
    getClassName(isActive, isToday, isDisabled, className) {
        var str = 'aio-input-datepicker-cell';
        if (isDisabled) { str += ' aio-input-datepicker-disabled' }
        if (isActive) { str += ' aio-input-datepicker-active'; }
        if (isToday) { str += ' today'; }
        if (className) { str += ' className'; }
        return str;
    }
    render() {
        let { properties, translate,onChange } = this.context;
        let {disabled,dateAttrs,theme,value,calendarType,unit,dateDisabled} = properties;
        let { dateArray } = this.props;
        let { isEqual, isMatch, getMonths, getToday } = AIODate();
        let isActive = !value ? false : AIODate().isEqual(dateArray, value);
        let isToday = isEqual(dateArray, getToday({ calendarType }))
        let isDateDisabled = !dateDisabled ? false : isMatch({ date: dateArray, matchers: dateDisabled });
        let isDisabled = disabled || isDateDisabled;
        let Attrs = {}
        if (dateAttrs) { Attrs = dateAttrs({ dateArray, isToday, isDisabled, isActive, isMatch: (o) => isMatch({ date: dateArray, matchers: o }) }) || {} }
        let className = this.getClassName(isActive, isToday, isDisabled, Attrs.className);
        let onClick = isDisabled ? undefined : () => { onChange({ year: dateArray[0], month: dateArray[1], day: dateArray[2], hour: dateArray[3] }, true) };
        let style = {}
        if (!isDisabled) { style.background = theme[1]; }
        if (className.indexOf('aio-input-datepicker-active') !== -1) {
            style.background = theme[0];
            style.color = theme[1];
        }
        if (className.indexOf('today') !== -1) { style.border = `1px solid ${theme[0]}` }
        style = { ...style, ...Attrs.style }
        let text;
        if (unit === 'hour') { text = dateArray[3] + ':00' }
        else if (unit === 'day') { text = dateArray[2] }
        else if (unit === 'month') {
            let months = getMonths({ calendarType });
            text = translate(calendarType === 'gregorian' ? months[dateArray[1] - 1].slice(0, 3) : months[dateArray[1] - 1])
        }
        return <div style={style} onClick={onClick} className={className}>{isDisabled ? <del>{text}</del> : text}</div>
    }
}
class DPHeader extends Component {
    static contextType = DPContext;
    getYears() {
        let { activeDate, years, changeActiveDate } = this.context;
        let props = {
            value: activeDate.year, options: years.map((y) => { return { text: y.toString(), value: y } }),
            onChange: (year) => { changeActiveDate({ year }) }
        }
        return (<DPHeaderDropdown {...props} />)
    }
    getMonths() {
        let { properties, activeDate, changeActiveDate, months, translate } = this.context;
        let {calendarType} = properties;
        let props = {
            value: activeDate.month, onChange: (month) => { changeActiveDate({ month }) },
            options: months.map((o, i) => { return { value: i + 1, text: translate(calendarType === 'gregorian' ? o.slice(0, 3) : o) } })
        }
        return (<DPHeaderDropdown {...props} />)
    }
    getDays() {
        let { activeDate, changeActiveDate } = this.context;
        let daysLength = AIODate().getMonthDaysLength({ date: [activeDate.year, activeDate.month] });
        let options = new Array(daysLength).fill(0).map((o, i) => { return { text: (i + 1).toString(), value: i + 1 } })
        let props = { value: activeDate.day, options, onChange: (day) => changeActiveDate({ day }) }
        return (<DPHeaderDropdown {...props} />)
    }
    render() {
        let { properties } = this.context;
        let {size,unit} = properties
        return (
            <div className='aio-input-datepicker-header' style={{ height: size / 4 }}>
                <DPArrow type='minus' />
                <div className='aio-input-datepicker-select' style={{ fontSize: Math.floor(size / 12) }}>
                    {this.getYears()}
                    {unit !== 'month' ? this.getMonths() : null}
                    {unit === 'hour' ? this.getDays() : null}
                </div>
                <DPArrow type='plus' />
            </div>
        )
    }
}
class DPHeaderDropdown extends Component {
    static contextType = DPContext;
    render() {
        //این شرط فقط در حالت سال رخ میدهد در شرایطی که فقط یک سال قابل انتخاب است
        let { value, options, onChange } = this.props;
        if (this.props.options.length === 1) { return this.props.options[0] }
        let { properties } = this.context;
        let {size,theme} = properties
        let props = {
            value, options, onChange, search: false,caret: false, type: 'select',
            attrs: {className: 'aio-input-datepicker-dropdown'},
            optionAttrs: {style: { height: size / 6, background: theme[1], color: theme[0] }}
        }
        return (<AIOInput {...props} />)
    }
}
class DPArrow extends Component {
    static contextType = DPContext;
    change() {
        let { properties, years, changeActiveDate, activeDate } = this.context;
        let {calendarType,unit} = properties;
        let { type } = this.props;
        let offset = (calendarType === 'gregorian' ? 1 : -1) * (type === 'minus' ? -1 : 1);
        let date = [activeDate.year, activeDate.month, activeDate.day]
        let next = AIODate().getByOffset({ date, offset, unit: { 'hour': 'day', 'day': 'month', 'month': 'year' }[unit] })
        if (next[0] > years[years.length - 1] || next[0] < years[0]) { return }
        if (unit === 'month') { changeActiveDate({ year: next[0] }) }
        if (unit === 'day') { changeActiveDate({ year: next[0], month: next[1] }) }
        if (unit === 'hour') { changeActiveDate({ year: next[0], month: next[1], day: next[2] }) }
    }
    getIcon() {
        let { properties } = this.context, { type } = this.props;
        let {theme} = properties;
        return <Icon path={type === 'minus' ? mdiChevronLeft : mdiChevronRight} size={1} style={{ color: theme[0] }} />
    }
    render() {
        let { size } = this.context;
        return (<div className='aio-input-datepicker-arrow' style={{ width: size / 6, height: size / 6 }} onClick={() => this.change()}>{this.getIcon()}</div>)
    }
}
function InputSlider() {
    let { properties, isMultiple } = useContext(AICTX)
    let {onChange,value} = properties;
    function change(value) {
        if (isMultiple()) { onChange([...value]) }
        else {onChange(value[0])}
    }
    let props = {...properties,value,onChange: !onChange ? undefined : change}
    return (<Slider {...props} />)
}
const SliderContext = createContext();
class Slider extends Component {
    constructor(props) {
        super(props);
        var { direction } = this.props;
        this.touch = 'ontouchstart' in document.documentElement;
        if (direction === 'left') {
            this.getDiff = function (x, y, client) { return x - client.x; }; this.oriention = 'horizontal';
        }
        else if (direction === 'right') {
            this.getDiff = function (x, y, client) { return client.x - x; }; this.oriention = 'horizontal';
        }
        else if (direction === 'top') {
            this.getDiff = function (x, y, client) { return y - client.y; }; this.oriention = 'vertical'; this.flexDirection = 'column-reverse';
        }
        else {
            this.getDiff = function (x, y, client) { return client.y - y; }; this.oriention = 'vertical'; this.flexDirection = 'column';
        }
        this.dom = createRef();
        this.state = {
            isDown: false,
        }
    }
    getClient(e) { return this.touch ? { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY } : { x: e.clientX, y: e.clientY } }
    getPercentByValue(value, start, end) { return 100 * (value - start) / (end - start); } //getPercentByValue
    fix(number) {
        let dotPos = this.props.step.toString().indexOf('.');
        let a = dotPos === -1 ? 0 : this.props.step.toString().length - dotPos - 1;
        return parseFloat((number).toFixed(a));
    }
    getStartByStep(start, step) {
        var a = Math.round((start - step) / step) * step;
        while (a < start) { a += step; } return a;
    }
    eventHandler(selector, event, action, type = 'bind') {
        var me = { mousedown: "touchstart", mousemove: "touchmove", mouseup: "touchend" };
        event = this.touch ? me[event] : event;
        var element = typeof selector === "string" ? (selector === "window" ? $(window) : $(selector)) : selector;
        element.unbind(event, action);
        if (type === 'bind') { element.bind(event, action) }
    }
    getValidValue() {
        let { value = [], start, end, min = start, max = end, step } = this.props;
        if (!Array.isArray(value) || !value.length) { value = [0] }
        for (var i = 0; i < value.length; i++) {
            var point = value[i];
            point = Math.round((point - start) / step) * step + start;
            if (point < min) { point = min; }
            if (point > max) { point = max; }
            value[i] = point;
        }
        return value
    }
    getOffset(x, y, size, e) {
        var { start, end, step } = this.props, client = this.getClient(e);
        return Math.round((end - start) * this.getDiff(x, y, client) / size / step) * step;
    }
    getValue(value, param = this.props) { return typeof value === 'function' ? value(param) : value; }
    getPercents() {
        var { start, end } = this.props;
        var percents = this.value.map((o, i) => [
            this.getPercentByValue(i ? this.value[i - 1] : start, start, end),
            this.getPercentByValue(o, start, end)
        ]);
        percents.push([percents[percents.length - 1][1], 100])
        return percents;
    }
    decreaseAll(step = this.props.step) {
        var start = this.props.start;
        var { min = start } = this.props;
        var offset = Math.min(step, this.value[0] - this.getValue(min));
        for (var i = 0; i < this.value.length; i++) {
            this.value[i] -= offset;
            this.value[i] = this.fix(this.value[i])
        }
        this.moved = true;
    }
    increaseAll(step = this.props.step) {
        let end = this.props.end;
        let { max = end } = this.props;
        let offset = Math.min(step, this.getValue(max) - this.value[this.value.length - 1]);
        for (var i = 0; i < this.value.length; i++) {
            this.value[i] += offset;
            this.value[i] = this.fix(this.value[i])
        }
        this.moved = true;
    }
    mouseDown(e, index, type) {
        e.preventDefault();
        let { start, end, min = start, max = end, onChange, disabled } = this.props;
        if (!onChange || disabled) { return }
        let { x, y } = this.getClient(e), dom = $(this.dom.current);
        let pointContainers = dom.find('.aio-slider-point-container');
        let size = dom.find('.aio-slider-line')[this.oriention === 'horizontal' ? 'width' : 'height']();
        let length = this.value.length;
        this.eventHandler('window', 'mousemove', $.proxy(this.mouseMove, this));
        this.eventHandler('window', 'mouseup', $.proxy(this.mouseUp, this));
        this.moved = false;
        this.setState({ isDown: true });
        pointContainers.css({ zIndex: 10 });
        if (type === 'point') {
            let pointContainer = pointContainers.eq(index);
            pointContainer.css({ zIndex: 100 });
            pointContainer.find('.aio-slider-point').addClass('active');
            let current = this.value[index];
            let before = index === 0 ? min : this.value[index - 1];
            let after = index === this.value.length - 1 ? max : this.value[index + 1]
            this.startOffset = {x, y, size, index: [index], value: [current],startLimit: before - current, endLimit: after - current}
        }
        else {
            let pointContainer1 = pointContainers.eq(index - 1);
            let pointContainer2 = pointContainers.eq(index);
            pointContainer1.css({ zIndex: 100 });
            pointContainer2.css({ zIndex: 100 });
            let p1 = pointContainer1.find('.aio-slider-point');
            let p2 = pointContainer2.find('.aio-slider-point');
            p1.addClass('active');
            p2.addClass('active');

            if (index === 0) { this.decreaseAll(); }
            else if (index === length) { this.increaseAll(); }
            if (index === 0 || index === length) {
                this.startOffset = {
                    x, y, size,
                    index: this.value.map((o, i) => i), value: this.value.map((o) => o),
                    startLimit: min - this.value[0], endLimit: max - this.value[length - 1],
                }
            }
            else {
                let point1 = this.value[index - 1], point2 = this.value[index];
                let before = index === 1 ? min : this.value[index - 2];//مقدار قبلی رنج
                let after = index === length - 1 ? max : this.value[index + 1]; //مقدار بعدی رنج
                this.startOffset = {
                    x, y, size, index: [index - 1, index],
                    value: [point1, point2], startLimit: before - point1, endLimit: after - point2,
                }
            }
        }
    }

    mouseMove(e) {
        let { onChange } = this.props;
        var { x, y, size, value, startLimit, endLimit, index } = this.startOffset;
        var offset = this.getOffset(x, y, size, e);
        if (offset < startLimit) { offset = startLimit; }
        else if (offset > endLimit) { offset = endLimit; }
        for (var i = 0; i < value.length; i++) {
            let Index = index[i], Value = value[i], newValue = parseFloat(Value) + offset;
            if (this.value[Index] === newValue) { return; }
            this.value[Index] = this.fix(newValue);
        }
        this.moved = true;
        onChange(this.value, true);
    }
    mouseUp() {
        this.eventHandler('window', 'mousemove', this.mouseMove, 'unbind');
        this.eventHandler('window', 'mouseup', this.mouseUp, 'unbind');
        let { onChange } = this.props;
        var points = $(this.dom.current).find('.aio-slider-point');
        points.removeClass('active');
        this.setState({ isDown: false });
        if (this.moved) { onChange(this.value, false); }
    }
    getContext() {
        return {
            ...this.props,
            touch: this.touch,
            fix: this.fix.bind(this),
            oriention: this.oriention,
            getValue: this.getValue.bind(this),
            isDown: this.state.isDown,
            mouseDown: this.mouseDown.bind(this),
            getStartByStep: this.getStartByStep.bind(this),
            getPercentByValue: this.getPercentByValue.bind(this),
            value: this.value
        };
    }
    getStyle() {
        return {direction:'ltr',flexDirection:this.flexDirection}
    }
    getClassName() {
        let { attrs, disabled } = this.props, { className } = attrs;
        return `aio-slider ${this.context.oriention}${className ? ' ' + className : ''}${disabled ? ' disabled' : ''}`;
    }
    render() {
        this.value = this.getValidValue();
        this.context = this.getContext();
        var { labelStep, scaleStep } = this.props;
        var percents = this.getPercents();
        return (
            <SliderContext.Provider value={this.context}>
                <div ref={this.dom} style={this.getStyle()} className={this.getClassName()}>
                    <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        <SliderLine />
                        {labelStep && <SliderLabels />}
                        {scaleStep && <SliderScales />}
                        {this.value.map((o, i) => <SliderFill key={i} index={i} percent={percents[i]} />)}
                        <SliderFill key={this.value.length} index={this.value.length} percent={percents[this.value.length]} />
                        {this.value.map((o, i) => <SliderPoint key={i} index={i} percent={percents[i]} />)}
                    </div>
                </div>
            </SliderContext.Provider>
        );
    }
}
Slider.defaultProps = {
    direction: 'right', editLabel: (a) => a, labelStyle: {}, labelRotate: 0,
    value: [0], scaleStyle: {}, style: () => { },
    start: 0, end: 100, step: 1, activegetPointStyle: {}, getText: () => { return '' }, attrs: {},
    pointStyle: {}, lineStyle: {}, fillStyle: {}, valueStyle: {}, editValue: (value, index) => value, textStyle: () => { }
}
class SliderLine extends Component {
    static contextType = SliderContext;
    render() {
        var { lineStyle } = this.context;
        return (<div className='aio-slider-line' style={typeof lineStyle === 'function' ? lineStyle(this.context) : lineStyle}></div>)
    }
}
class SliderFill extends Component {
    static contextType = SliderContext;
    getContainerStyle() {
        var { oriention, direction } = this.context, { percent } = this.props;
        var obj = {};
        obj[{ right: 'left', left: 'right', top: 'bottom', bottom: 'top' }[direction]] = percent[0] + '%';
        if (oriention === 'horizontal') { obj.width = (percent[1] - percent[0]) + '%'; }
        else { obj.height = (percent[1] - percent[0]) + '%'; }
        return obj;
    }
    render() {
        var { mouseDown, rangeEvents = {}, fillStyle, getText, textStyle, touch, value } = this.context;
        var { index } = this.props;
        var containerProps = {
            'data-index': index, className: 'aio-slider-fill-container',style: this.getContainerStyle(),
            [touch ? 'onTouchStart' : 'onMouseDown']: (e) => mouseDown(e, index, 'fill')
        }
        for (let prop in rangeEvents) {containerProps[prop] = () => rangeEvents[prop](index)}
        let text = getText(index, this.context),style, active;
        if (typeof fillStyle === 'function') {style = fillStyle(index, this.context);}
        else {
            if (value.length === 1 && index === 0) {style = fillStyle; active = true}
            if (value.length > 1 && index !== 0 && index !== value.length) {style = fillStyle; active = true;}
        }
        return (
            <div {...containerProps}>
                <div className={'aio-slider-fill' + (active ? ' aio-slider-fill-active' : '')} style={style} data-index={index}></div>
                {text !== undefined && <div className='aio-slider-text' style={textStyle(index)}>{text}</div>}
            </div>
        );
    }
}
class SliderPoint extends Component {
    static contextType = SliderContext;
    getContainerStyle() {
        var { direction } = this.context, { percent } = this.props;
        return {[{ right: 'left', left: 'right', top: 'bottom', bottom: 'top' }[direction]]: percent[1] + '%'};
    }
    getValueStyle() {
        var { showValue, isDown, valueStyle } = this.context;
        var { index } = this.props;
        if (showValue === false) { return { display: 'none' } }
        if (showValue === true || showValue === 'inline' || isDown) { return typeof valueStyle === 'function' ? valueStyle(index, this.context) : valueStyle; }
        return { display: 'none' };
    }
    render() {
        var { value, mouseDown, editValue, pointEvents, getPointHTML, pointStyle, touch, fix, showValue } = this.context;
        var { index } = this.props;
        var point = value[index];
        var props = {
            style: this.getContainerStyle(), 'data-index': index, className: 'aio-slider-point-container',
            [touch ? 'onTouchStart' : 'onMouseDown']: (e) => mouseDown(e, index, 'point')
        };
        for (let prop in pointEvents) { props[prop] = () => pointEvents[prop](index) }
        var pointProps = { className: 'aio-slider-point', style: typeof pointStyle === 'function' ? pointStyle(index, this.context) : pointStyle, 'data-index': index };
        var valueProps = {
            style: this.getValueStyle(),
            className: `aio-slider-value ${'aio-slider-value-' + index}` + (showValue === 'inline' ? ' aio-slider-value-inline' : '')
        };
        let html = getPointHTML ? getPointHTML(index, this.context) : '';
        return (
            <div {...props}>
                {showValue !== 'inline' && <div {...pointProps}>{html}</div>}
                <div {...valueProps}>{editValue(fix(point), index)}</div>
            </div>
        );
    }
}
class SliderLabels extends Component {
    static contextType = SliderContext;
    constructor(props) {
        super(props);
        this.dom = createRef();
        $(window).on('resize', this.update.bind(this))
    }
    getLabelsByStep(labelStep) {
        var { start, end, getStartByStep } = this.context;
        var Labels = [];
        var value = getStartByStep(start, labelStep);
        var key = 0;
        while (value <= end) {
            Labels.push(<SliderLabel key={key} value={value} />);
            value += labelStep;
            value = parseFloat(value.toFixed(6))
            key++;
        }
        return Labels;
    }
    getLabels(labelStep) { return labelStep.map((o) => <SliderLabel key={o} value={o} />) }
    update() {
        let container = $(this.dom.current);
        let labels = container.find('.aio-slider-label div');
        if (!labels.length) { return; }
        let { direction } = this.context;
        let firstLabel = labels.eq(0);
        let firstLabelThickness = firstLabel.attr('datarotated') === 'yes' ? 'height' : 'width';
        if (direction === 'right') {
            let end = firstLabel.offset().left + firstLabel[firstLabelThickness]();
            for (let i = 1; i < labels.length; i++) {
                let label = labels.eq(i);
                let thickness = label.attr('datarotated') === 'yes' ? 'height' : 'width';
                label.css({ display: 'block' })
                let left = label.offset().left

                let width = label[thickness]();
                if (left < end + 5) {
                    label.css({ display: 'none' })
                }
                else { end = left + width; }
            }
        }
        else if (direction === 'left') {
            var end = firstLabel.offset().left;
            for (let i = 1; i < labels.length; i++) {
                let label = labels.eq(i);
                let thickness = label.attr('datarotated') === 'yes' ? 'height' : 'width';
                label.css({ display: 'block' })
                let left = label.offset().left
                let width = label[thickness]();
                let right = left + width;
                if (right > end - 5) {
                    label.css({ display: 'none' })
                }
                else { end = left; }
            }
        }
    }
    componentDidMount() { this.update() }
    componentDidUpdate() { this.update() }
    render() {
        let { labelStep } = this.context;
        return (
            <div className='aio-slider-labels' ref={this.dom}>
                {Array.isArray(labelStep) ? this.getLabels(labelStep) : this.getLabelsByStep(labelStep)}
            </div>
        );
    }
}
class SliderLabel extends Component {
    static contextType = SliderContext;
    getStyle(rotate) {
        var { start, end, getPercentByValue, direction, labelStyle } = this.context;
        var { value } = this.props;
        var obj = typeof labelStyle === 'function' ? labelStyle(value, this.context) : labelStyle;
        obj = !obj ? {} : { ...obj }
        let key = { right: 'left', left: 'right', top: 'bottom', bottom: 'top' }[direction];
        obj[key] = getPercentByValue(value, start, end) + '%';
        if (rotate) {
            obj.transform = `rotate(${rotate + 'deg'})`;
            obj.justifyContent = rotate > 0 ? 'flex-start' : 'flex-end'
        }
        return obj;
    }
    click(e) {
        var { onLabelClick } = this.context;
        e.stopPropagation();
        if (!onLabelClick) { return }
        var { value } = this.props;
        onLabelClick(value);
    }
    render() {
        let { editLabel, labelRotate } = this.context;
        let { value } = this.props;
        let rotate = typeof labelRotate === 'function' ? labelRotate(value) : labelRotate;
        let text;
        try { text = editLabel(value) }
        catch { text = '' }
        return (
            <div onClick={this.click.bind(this)} style={this.getStyle(rotate)} className={`aio-slider-label`}>
                <div datarotated={rotate ? 'yes' : 'no'} className='aio-slider-label-text'>{text}</div>
            </div>
        );
    }
}
class SliderScales extends Component {
    static contextType = SliderContext;
    getScalesByStep(scaleStep) {
        var { start, end, getStartByStep } = this.context;
        var value = getStartByStep(start, scaleStep);
        var key = 0, scales = [];
        while (value <= end) {
            scales.push(<SliderScale value={value} key={key} />);
            value += scaleStep;
            key++;
        }
        return scales;
    }
    getScales(scaleStep) { return scaleStep.map((o) => <SliderScale value={o} key={o} />) }
    render() {
        let { scaleStep } = this.context;
        let scales = Array.isArray(scaleStep) ? this.getScales(scaleStep) : this.getScalesByStep(scaleStep)
        return (<div className='aio-slider-scales'>{scales}</div>);
    }
}
function SliderScale(props) {
    let context = useContext(SliderContext);
    function getStyle() {
        var { scaleStyle } = context;
        var { start, end, direction, getPercentByValue } = context, { value } = props;
        var obj = typeof scaleStyle === 'function' ? scaleStyle(value, context) : scaleStyle;
        obj = !obj ? {} : { ...obj }
        if (!obj) { obj = {} }
        obj[{ right: 'left', left: 'right', top: 'bottom', bottom: 'top' }[direction]] = getPercentByValue(value, start, end) + '%';
        return obj;
    }
    let { getScaleHTML } = context, { value } = props;
    return (<div className="aio-slider-scale" style={getStyle()}>{getScaleHTML && getScaleHTML(value)}</div>);
}
class List extends Component {
    constructor(props) {
        super(props);
        let { properties, getOptionProp } = props;
        this.getOptionProp = getOptionProp;
        this.touch = 'ontouchstart' in document.documentElement;
        this.dom = createRef();
        let {count,move} = properties;
        if (move) { move(this.move.bind(this)) }
        this.state = { count }
    }
    eventHandler(selector, event, action, type = 'bind') {
        var me = { mousedown: "touchstart", mousemove: "touchmove", mouseup: "touchend" };
        event = this.touch ? me[event] : event;
        var element = typeof selector === "string" ? (selector === "window" ? $(window) : $(selector)) : selector;
        element.unbind(event, action);
        if (type === 'bind') { element.bind(event, action) }
    }
    getClient(e) {
        try {return this.touch && e.changedTouches? [e.changedTouches[0].clientX, e.changedTouches[0].clientY]: [e.clientX, e.clientY];}
        catch {return this.touch && e.changedTouches? [e.changedTouches[0].clientX, e.changedTouches[0].clientY]: [e.clientX, e.clientY]}
    }
    getStyle() {
        let {properties} = this.props;
        let {size,width} = properties;
        var { count } = this.state,height = count * (size);
        return { width, height }
    }
    getOptions() {
        let {properties} = this.props;
        let {size,options = [],value:propsValue} = properties;
        this.activeIndex = 0;
        return options.map((option, i) => {
            let value = this.getOptionProp(option, 'value');
            let text = this.getOptionProp(option, 'text', '');
            let style = this.getOptionProp(option, 'style', {});
            if (value === propsValue) { this.activeIndex = i; }
            return <div key={i} dataindex={i} className='aio-input-list-option' style={{ height: size, ...style }}>{text}</div>
        })
    }
    getIndexByTop(top) {
        let {properties} = this.props;
        let {size} = properties;
        let { count } = this.state;
        return Math.round(((count * size) - size - (2 * top)) / (2 * size));
    }
    getTopByIndex(index) {
        let {properties} = this.props;
        let {size} = properties;
        let { count } = this.state;
        return (count - 2 * index - 1) * size / 2;
    }
    getContainerStyle() {return {top: this.getTopByIndex(this.activeIndex)};}
    moveDown() {
        let {properties} = this.props;
        let {options = []} = properties;
        if (this.activeIndex >= options.length - 1) { return }
        this.activeIndex++;
        var newTop = this.getTopByIndex(this.activeIndex);
        this.setStyle({ top: newTop });
        this.setBoldStyle(this.activeIndex);
    }
    setBoldStyle(index) {
        $(this.dom.current).find('.aio-input-list-option').removeClass('active');
        $(this.dom.current).find('.aio-input-list-option[dataindex=' + (index) + ']').addClass('active');
    }
    moveUp() {
        if (this.activeIndex <= 0) { return }
        this.activeIndex--;
        var newTop = this.getTopByIndex(this.activeIndex);
        this.setStyle({ top: newTop });
        this.setBoldStyle(this.activeIndex);
    }
    keyDown(e) {
        let {properties} = this.props;
        let {editable} = properties;
        if (!editable) { return }
        if (e.keyCode === 38) {this.moveUp();}
        else if (e.keyCode === 40) {this.moveDown();}
    }
    getLimit() {
        let {properties} = this.props;
        let {options = []} = properties;
        return {top: this.getTopByIndex(-1),bottom: this.getTopByIndex(options.length)}
    }
    getTrueTop(top) {
        let {properties} = this.props;
        let {options = []} = properties;
        let index = this.getIndexByTop(top);
        if (index < 0) { index = 0 }
        if (index > options.length - 1) { index = options.length - 1 }
        return this.getTopByIndex(index);
    }
    mouseDown(e) {
        let {properties} = this.props;
        let {options = [],onChange = ()=>{},editable} = properties;
        if (!editable) { return }
        this.eventHandler('window', 'mousemove', $.proxy(this.mouseMove, this));
        this.eventHandler('window', 'mouseup', $.proxy(this.mouseUp, this));
        clearInterval(this.interval);
        this.moved = false;
        this.isDown = true;
        let client = this.getClient(e);
        let y = client[1]
        this.setStyle({ transition: 'unset' });
        let top = this.getTop();
        var index = this.getIndexByTop(top);
        this.setBoldStyle(index);
        this.setStyle({ top, transition: 'unset' });
        onChange(options[index].value, index)
        this.so = { y, top, limit: this.getLimit() };
    }
    getTop() {
        var top = parseInt($(this.dom.current).find('.aio-input-list-options').css('top'));
        return this.getTrueTop(top);
    }
    fixTop(value) {
        let { top, bottom } = this.so.limit;
        if (value > top) { return top }
        if (value < bottom) { return bottom }
        return value;
    }
    mouseMove(e) {
        this.moved = true;
        var client = this.getClient(e);
        let y = client[1];
        var offset = y - this.so.y;
        if (this.lastY === undefined) { this.lastY = y }
        this.deltaY = y - this.lastY;
        this.lastY = y;
        if (Math.abs(offset) < 20) { this.deltaY = 3 }
        var newTop = this.fixTop(this.so.top + offset);
        let index = this.getIndexByTop(newTop);
        this.so.newTop = newTop;
        this.setBoldStyle(index);
        this.setStyle({ top: newTop });
    }
    setStyle(obj) {$(this.dom.current).find('.aio-input-list-options').css(obj);}
    mouseUp(e) {
        this.eventHandler('window', 'mousemove', this.mouseMove, 'unbind');
        this.eventHandler('window', 'mouseup', this.mouseUp, 'unbind');
        this.isDown = false;
        if (!this.moved) { return }
        this.moved = false;
        this.move(this.deltaY, this.so.newTop)
    }
    move(deltaY, startTop = this.getTop()) {
        let {properties} = this.props;
        let {options = [],onChange = ()=>{},stop,decay} = properties;
        if (decay < 0) { decay = 0 }
        if (decay > 99) { decay = 99 }
        decay = parseFloat(1 + decay / 1000)
        this.interval = setInterval(() => {
            startTop += deltaY;
            let index = this.getIndexByTop(startTop);
            if (Math.abs(deltaY) < stop || index < 0 || index > options.length - 1) {
                clearInterval(this.interval);
                if (index < 0) { index = 0 }
                if (index > options.length - 1) { index = options.length - 1 }
                let top = this.getTopByIndex(index);
                this.setBoldStyle(index);
                this.setStyle({ top, transition: '0.3s' });
                onChange(options[index].value, index)
                return;
            }
            deltaY /= decay;
            this.setStyle({ top: startTop });
        }, 20)
    }
    componentDidUpdate() {this.setBoldStyle(this.activeIndex);}
    componentDidMount() {this.setBoldStyle(this.activeIndex);}
    render() {
        let {properties} = this.props;
        let {attrs} = properties;
        let options = this.getOptions();
        return (
            <div
                {...attrs} ref={this.dom} tabIndex={0} onKeyDown={(e) => this.keyDown(e)}
                className={'aio-input-list' + (attrs.className ? ' ' + attrs.className : '')}
                style={{ ...attrs.style, ...this.getStyle() }}
            >
                <div
                    className='aio-input-list-options' style={this.getContainerStyle()}
                    onMouseDown={(e) => this.mouseDown(e)} onTouchStart={(e) => this.mouseDown(e)}
                >{options}</div>
            </div>
        );
    }
}
const MapContext = createContext();
function Map(props) {
    let context = useContext(AICTX);
    let mapApiKeys = context.mapApiKeys;
    let { properties } = props;
    let {popup,mapConfig,onChange,disabled,attrs,onChangeAddress,value} = properties;
    let isPopup = false;
    let onClose = false;
    let p = { popup, isPopup, onClose, onChange, attrs, onChangeAddress, value, mapApiKeys, mapConfig, disabled }
    return <MapUnit {...p} />
}
class MapUnit extends Component {
    static contextType = AICTX;
    constructor(props) {
        super(props);
        this.datauniqid = 'mp' + (Math.round(Math.random() * 10000000))
        this.markers = []
        this.dom = createRef();
        let { mapConfig = {} } = props;
        let { zoom = 14 } = mapConfig;
        this.state = { address: '', value: props.value, prevValue: props.value, zoom, prevZoom: zoom }
    }
    handleArea() {
        if (this.area) { this.area.remove() }
        let { mapConfig = {} } = this.props;
        let { area } = mapConfig;
        if (area && this.L && this.map) {
            let { color = 'dodgerblue', opacity = 0.1, radius = 1000, lat, lng } = area;
            this.area = this.L.circle([lat, lng], { color, fillColor: color, fillOpacity: opacity, radius }).addTo(this.map);
        }
    }
    ipLookUp() {
        $.ajax('http://ip-api.com/json')
            .then(
                (response) => {
                    let { lat, lon } = response;
                    this.flyTo(lat, lon, undefined, 'ipLookUp')
                },
                (data, status) => console.log('Request failed.  Returned status of', status)
            );
    }
    handlePermission() {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
            if (result.state === 'granted') { console.log(result.state); }
            else if (result.state === 'prompt') { console.log(result.state); }
            else if (result.state === 'denied') { console.log(result.state); }
        });
    }
    async getAddress({ lat, lng }) {
        let { mapApiKeys } = this.props;
        try {
            let res = await Axios.get(`https://api.neshan.org/v5/reverse?lat=${lat}&lng=${lng}`, { headers: { 'Api-Key': mapApiKeys.service, Authorization: false } });
            return res.status !== 200 ? '' : res.data.formatted_address;
        }
        catch (err) { return '' }
    }
    goToCurrent() {
        if ("geolocation" in navigator) {
            this.handlePermission();
            // check if geolocation is supported/enabled on current browser
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    let { latitude: lat, longitude: lng } = position.coords;
                    this.apis.flyTo(lat, lng, undefined, 'goToCurrent');
                },
                (error_message) => { this.ipLookUp() }
            )
        }
        else { this.ipLookUp() }
    }
    async route(from = [35.699739, 51.338097], to = [35.699939, 51.338497]) {
        let { mapApiKeys } = this.context;
        try {
            let param = { headers: { 'Api-Key': mapApiKeys.service } }
            let url = `https://api.neshan.org/v4/direction?type=car&origin=${from[0]},${from[1]}&destination=${to[0]},${to[1]}`;
            await Axios.get(url, param);
        }
        catch (err) { return '' }
    }
    async showPath(path) {
        let { mapApiKeys } = this.props;
        try { await Axios.post(`https://api.neshan.org/v3/map-matching?path=${path}`, { headers: { 'Api-Key': mapApiKeys.service } }); }
        catch (err) { return '' }
    }
    flyTo(lat, lng) {
        let animate = GetDistance(this.state.value, { lat, lng }) > 0.3;
        if (!lat || !lng) { return }
        this.map.flyTo([lat, lng], undefined, { animate, duration: 1 });
    }
    panTo(lat, lng) { this.map.panTo({ lat, lng }) }
    async updateAddress({ lat, lng }) {
        clearTimeout(this.atimeout);
        this.setState({addressLoading:true})
        this.atimeout = setTimeout(async ()=>{
            let { onChange = () => { } } = this.props;
            let address = await this.getAddress({ lat, lng });
            this.setState({ address,addressLoading:false });
            onChange({lat,lng,address});
        },500);
    }
    change({ lat, lng }) {
        let { onChange = () => { } } = this.props;
        let {address} = this.state;
        onChange({ lat, lng,address });
        this.updateAddress({ lat, lng })
    }
    move({ lat, lng }) {
        let { mapConfig = {} } = this.props;
        let { marker = true } = mapConfig;
        if (marker) { this.marker.setLatLng({ lat, lng }) }
        clearTimeout(this.atimeout);
        clearTimeout(this.btimeout);
        this.btimeout = setTimeout(async () => this.setState({ value: { lat, lng } }, () => this.change({ lat, lng })), 500);
    }
    //maptype: "dreamy" | 'standard-day'  
    init() {
        let { mapApiKeys, onChange, mapConfig = {}, disabled, attrs = {} } = this.props;
        let { marker = true, traffic = false, zoomControl = false, maptype = 'dreamy-gold', poi = true } = mapConfig;
        let { value, zoom } = this.state;
        let config = {
            key: mapApiKeys.map, maptype, poi, traffic,
            center: [value.lat, value.lng], zoom,
            dragging: !disabled,
            scrollWheelZoom: 'center',
            //minZoom: zoomable ? undefined : zoom,
            //maxZoom: zoomable ? undefined : zoom,
            zoomControl
        }
        let map = new window.L.Map(this.dom.current, config);
        let L = window.L,myMap = map;
        this.map = myMap; this.L = L;
        if (marker && myMap) { this.marker = L.marker([value.lat, value.lng]).addTo(myMap); }
        myMap.on('click', (e) => {
            if (attrs.onClick) { return }
            if (onChange) { let { lat, lng } = e.latlng; this.map.panTo({ lat, lng }) }
        });
        if (!disabled) {
            myMap.on('move', (e) => {
                //marker.setLatLng(e.target.getCenter())
                let { lat, lng } = e.target.getCenter()
                this.move({ lat, lng })
            });
        }
        this.updateAddress(value);
        this.handleMarkers()
        this.handleArea()
    }
    componentDidMount() {
        if (document.getElementById('aio-input-map-neshan') === null) {
            try {
                const script = document.createElement("script");
                script.src = `https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.js`;
                script.id = 'aio-input-map-neshan'
                script.onload = () => this.init();
                document.body.appendChild(script);
            }
            catch (err) { console.log(err) }
        }
        else { this.init() }
    }
    componentDidUpdate() {
        let { prevValue, prevZoom: szoom } = this.state;
        let { value } = this.props;
        if (
            JSON.stringify(prevValue) !== JSON.stringify(value) 
            //|| pzoom !== szoom
        ) {
            setTimeout(() => {
                this.flyTo(
                    value.lat, 
                    value.lng, szoom, 'componentDidUpdate');
                this.setState({ 
                    prevValue: value, 
                    //prevZoom: pzoom 
                })
            }, 0)
        }
        this.handleArea()
        this.handleMarkers()
    }
    getMarkerDefaultOptions(marker) {
        let { mapConfig = {} } = this.props;
        let { markerOptions = {} } = mapConfig;
        let { size: dsize = 20, color: dcolor = 'orange', html: dhtml, text: dtext = '' } = markerOptions;
        let { size = dsize, color = dcolor, html = dhtml, text = dtext } = marker;
        return { size, color, html, text }
    }
    getMarker(marker) {
        let { size, color, html, text } = this.getMarkerDefaultOptions(marker);
        let innerSize = size * 0.4;
        let borderSize = Math.ceil(size / 10);
        let innerTop = Math.round(size / 25);
        let top = `-${(size / 2 + innerSize)}px`;
        let style1 = `transform:translateY(${top});flex-shrink:0;color:${color};width:${size}px;height:${size}px;border:${borderSize}px solid;position:relative;border-radius:100%;display:flex;align-items:center;justify-content:center;`
        let style2 = `position:absolute;left:calc(50% - ${innerSize}px);top:calc(100% - ${innerTop}px);border-top:${innerSize}px solid ${color};border-left:${innerSize}px solid transparent;border-right:${innerSize}px solid transparent;`
        let innerHtml = '', innerText = '';
        if (html) { innerHtml = JSXToHTML(html) }
        if (text) { innerText = JSXToHTML(text) }
        return (`<div class='aio-input-map-marker' data-parent='${this.datauniqid}' style="${style1}">${innerHtml}<div class='aio-input-map-marker-text'>${innerText}</div><div style="${style2}"></div></div>`)
    }
    handleMarkers() {
        let { mapConfig = {} } = this.props;
        let { markers = [] } = mapConfig;
        if (!markers || !this.map || !this.L) { markers = [] }
        if (this.markers.length) {
            for (let i = 0; i < this.markers.length; i++) { this.markers[i].remove(); }
            this.markers = [];
        }
        for (let i = 0; i < markers.length; i++) {
            let marker = markers[i];
            let { lat, lng, popup = () => '' } = marker;
            let pres = popup(marker)
            if (typeof pres !== 'string') { try { pres = pres.toString() } catch { } }
            this.markers.push(
                this.L.marker([lat, lng], { icon: this.L.divIcon({ html: this.getMarker(marker) }) }).addTo(this.map).bindPopup(pres)
            )
        }
    }
    getContext() {
        let { mapApiKeys } = this.props;
        return { mapApiKeys, rootProps: { ...this.props }, rootState: { ...this.state }, flyTo: this.flyTo.bind(this), goToCurrent: this.goToCurrent.bind(this) }
    }
    renderPopup() {
        let { showPopup } = this.state;
        if (showPopup) {
            let { popup } = this.props, { attrs = {} } = popup, { value } = this.state;
            if (popup === true) { popup = {} }
            let props = {
                ...this.props, ...popup, value,
                mapConfig: {...popup.mapConfig },
                isPopup: true, popup: false,
                onClose: () => this.setState({ showPopup: false }),
                attrs: { ...attrs, style: { width: '100%', height: '100%', top: 0, position: 'fixed', left: 0, zIndex: 1000000, ...attrs.style }, onClick: undefined },
                onChange: (obj) => { 
                    this.move(obj);  
                }
            }
            return <MapUnit {...props} />
        }
        return null
    }
    render() {
        let { attrs = {},mapConfig = {},popup,isPopup } = this.props;
        return (
            <>
                <MapContext.Provider value={this.getContext()}>
                    <RVD
                        layout={{
                            className: 'aio-input-map-container' + (mapConfig.draggable === false?' not-draggable':''), style: attrs.style,
                            onClick:()=>{
                                if (popup && !isPopup) { this.setState({ showPopup: true }) }
                            },
                            column: [{ html: <MapHeader /> }, { flex: 1, attrs: { ref: this.dom }, html: '' }, { html: <MapFooter /> }]
                        }}
                    />
                </MapContext.Provider>
                {this.renderPopup()}
            </>
        )
    }
}
function MapHeader() {
    let context = useContext(MapContext);
    let { rootProps, rootState, flyTo, goToCurrent, mapApiKeys } = context;
    let { mapConfig = {}, onClose } = rootProps;
    let { title, search } = mapConfig;
    let [searchValue, setSearchValue] = useState('');
    let [searchResult, setSearchResult] = useState([]);
    let [loading, setLoading] = useState(false);
    let [showResult, setShowResult] = useState(false);
    let loadingIcon = <Icon path={mdiLoading} size={1} spin={0.4} />;
    let closeIcon = <Icon path={mdiClose} size={0.8} onClick={() => setShowResult(false)} />;
    let searchIcon = <Icon path={mdiMagnify} size={0.8} />;
    let dom = createRef();
    let timeout;
    async function changeSearch(e) {
        let { value } = rootState, { lat, lng } = value, searchValue = e.target.value;
        setSearchValue(searchValue);
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
            try {
                let param = { headers: { 'Api-Key': mapApiKeys.service,'Authorization':false } }
                let url = `https://api.neshan.org/v1/search?term=${decodeURI(searchValue)}&lat=${lat}&lng=${lng}`;
                setLoading(true); let res = await Axios.get(url, param); setLoading(false)
                if (res.status !== 200) { return }
                setSearchResult(res.data.items)
            }
            catch (err) { }
        }, 1000)
    }
    function SearchInput() {
        return (<input ref={dom} value={searchValue} className='aio-input-map-serach-input' type='text' placeholder='جستجو' onChange={changeSearch} onClick={() => setShowResult(true)} />)
    }
    function search_layout() {
        let showCloseButton = !!showResult && !!searchResult.length;
        return {
            flex: 1, row: [
                { align: 'h', flex: 1, html: SearchInput() },
                { show: !!loading, align: 'vh', className: 'aio-input-map-serach-icon', html: loadingIcon },
                { show: showCloseButton, align: 'vh', className: 'aio-input-map-serach-icon', html: closeIcon },
                { show: !showCloseButton && !loading, align: 'vh', className: 'aio-input-map-serach-icon', html: searchIcon }
            ]
        }
    }
    function input_layout() {
        if (!search) { return false }
        return { className: 'aio-input-map-search', row: [currentPoint_layout(), search_layout()] }
    }
    function result_layout() {
        if (!searchResult || !searchResult.length || !showResult) { return false }
        return {
            className: 'aio-input-map-serach-results',
            column: searchResult.map(({ title, address, location }) => {
                return {
                    onClick: () => { setShowResult(false); flyTo(location.y, location.x, undefined, 'result_layout') },
                    className: 'aio-input-map-search-result',
                    column: [
                        { html: title, className: 'aio-input-map-serach-result-text', align: 'v' },
                        { html: address, className: 'aio-input-map-serach-result-subtext', align: 'v', style: { opacity: 0.5 } }
                    ]
                }
            })
        }
    }
    function header_layout() {
        if (typeof title !== 'string' && !onClose) { return false }
        return {
            row: [
                { show: !!onClose, align: 'vh', html: <Icon path={mdiChevronRight} size={1} />, className: 'aio-input-map-close', onClick: () => onClose() },
                { show: typeof title === 'string', html: title, className: 'aio-input-map-title', align: 'v' },
            ]
        }
    }
    function currentPoint_layout() {
        return { className: 'aio-input-map-current-point', html: <Icon path={mdiCrosshairsGps} size={0.8} onClick={() => goToCurrent()} />, align: 'vh' }
    }
    if (!search && !title && !onClose) { return null }
    return (
        <RVD
            layout={{
                className: 'aio-input-map-header of-visible' + (searchResult && searchResult.length && showResult ? ' aio-input-map-header-open' : ''),
                column: [header_layout(), input_layout(), result_layout(),]
            }}
        />
    )
}
function MapFooter() {
    let context = useContext(MapContext);
    let { rootProps, rootState } = context;
    let { value } = rootState, { lat, lng } = value;
    let { onClose, onChange } = rootProps;
    function submit_layout() {
        if (!rootProps.isPopup) { return false }
        return { html: (<button className='aio-input-map-submit' onClick={async () => {onChange(rootState.value); onClose()}}>تایید موقعیت</button>) }
    }
    function details_layout() {
        let {mapConfig = {}} = rootProps;
        if(mapConfig.showAddress === false){return false}
        if(rootState.addressLoading){
            return {flex:1,html:<Icon path={mdiLoading} size={1} spin={0.4}/>,align:'v'}
        }
        return { flex: 1, column: [{ html: rootState.address, className: 'aio-input-map-address' }, { show: !!lat && !!lng, html: () => `${lat} - ${lng}`, className: 'aio-input-map-coords' }] }
    }
    let Submit = submit_layout()
    let Details = details_layout();
    if(!Submit && !Details){return null}
    return (<RVD layout={{ className: 'aio-input-map-footer', row: [Details, Submit] }} />)
}
function AIOSwip({dom,start = ()=>{},move = ()=>{},end = ()=>{},speedX = 1,speedY = 1,stepX = 1,stepY = 1,id}){
    let a = {
      timeout:undefined,
      count:0,
      getDom(){return dom()},
      getClient(e){return 'ontouchstart' in document.documentElement?{x: e.changedTouches[0].clientX,y:e.changedTouches[0].clientY }:{x:e.clientX,y:e.clientY}},
      eventHandler(selector, event, action,type = 'bind'){
        var me = { mousedown: "touchstart", mousemove: "touchmove", mouseup: "touchend" }; 
        event = 'ontouchstart' in document.documentElement ? me[event] : event;
        var element = typeof selector === "string"?(selector === "window"?$(window):$(selector)):selector; 
        element.unbind(event, action); 
        if(type === 'bind'){element.bind(event, action)}
      },
      init(){
        a.count++;
        if(a.count > 10){clearTimeout(a.timeout); return}
        let res = dom();
        if(!res.length){a.timeout = setTimeout(()=>a.init(),400)}
        else {
          clearTimeout(a.timeout);
          this.eventHandler(a.getDom(),'mousedown',$.proxy(this.mouseDown,this))
        }
      },
      getPercentByValue(value,start,end){return 100 * (value - start) / (end - start)},
      getMousePosition(e){
          let client = this.getClient(e),x = client.x - this.left,y = client.y - this.top;
          let xp = this.getPercentByValue(x,0,this.width),yp = this.getPercentByValue(y,0,this.height);
          return {xp,yp,clientX:client.x,clientY:client.y,x,y}
      },
      mouseDown(e){
        let dom = a.getDom();
        let offset = dom.offset();
        this.width = dom.width();
        this.height = dom.height(); 
        this.left = offset.left;
        this.top = offset.top;
        let mp = this.getMousePosition(e)
        this.so = {
          client:{x:mp.clientX,y:mp.clientY}
        };
        let res = start({mousePosition:{...mp},id});
        if(!Array.isArray(res)){return;}
        let x = res[0];
        let y = res[1];
        this.so.x = x;
        this.so.y = y;
        this.eventHandler('window','mousemove',$.proxy(this.mouseMove,this));
        this.eventHandler('window','mouseup',$.proxy(this.mouseUp,this))
      },
      mouseMove(e){
        let client = this.getClient(e);
        let dx = client.x - this.so.client.x;
        let dy = client.y - this.so.client.y;
        dx = Math.round(dx * speedX)
        dy = Math.round(dy * speedY)
        dx = Math.floor(dx / stepX) * stepX;
        dy = Math.floor(dy / stepY) * stepY;
        if(dx === this.dx && dy === this.dy){return}
        this.dx = dx;
        this.dy = dy;
        let dist = Math.round(Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2)))
        this.dist = dist;
        let x,y;
        if(this.so.x !== undefined && this.so.y !== undefined){
          x = this.so.x + dx;
          y = this.so.y + dy;
        }
        move({dx,dy,dist,x,y,id,mousePosition:{...this.getMousePosition(e)},e});
      },
      mouseUp(e){
        this.eventHandler('window','mousemove',this.mouseMove,'unbind');
        this.eventHandler('window','mouseup',this.mouseUp,'unbind');
        end({dx:this.dx,dy:this.dy,dist:this.dist,id,e})
      }
    }
    a.init();
  }
function AIOInputSearch(items,searchValue,getValue = (o) =>o){if(!searchValue){return items}function isMatch(keys,value){for(let i = 0; i < keys.length; i++){if(value.indexOf(keys[i]) === -1){return false}} return true}let keys = searchValue.split(' ');return items.filter((o,i)=>isMatch(keys,getValue(o,i)))}
function ExportToExcel(rows,config = {}){let {promptText = 'Inter Excel File Name'} = config;let o = {fixPersianAndArabicNumbers (str){if(typeof str !== 'string'){return str} let persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g],arabicNumbers  = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g]; for(var i=0; i<10; i++){str = str.replace(persianNumbers[i], i).replace(arabicNumbers[i], i);}return str;},getJSON(rows){let result = [];for (let i = 0; i < rows.length; i++) {let json = rows[i],fixedJson = {};for(let prop in json){fixedJson[prop] = this.fixPersianAndArabicNumbers(json[prop])} result.push(fixedJson);}return result;},export() {let name = window.prompt(promptText);if (!name || name === null || !name.length) {return};var data = this.getJSON(rows);var arrData = typeof data != "object" ? JSON.parse(data) : data;var CSV = "";CSV += '\r\n\n';if (true) {let row = "";for (let index in arrData[0]) { row += index + ","; }row = row.slice(0, -1);CSV += row + "\r\n";}for (var i = 0; i < arrData.length; i++) {let row = "";for (let index in arrData[i]) { row += '"' + arrData[i][index] + '",'; }row.slice(0, row.length - 1);CSV += row + "\r\n";}if (CSV === "") { alert("Invalid data"); return; }var fileName = name.replace(/ /g, "_");var universalBOM = "\uFEFF";var uri = "data:text/csv;charset=utf-8," + encodeURIComponent(universalBOM + CSV);var link = document.createElement("a");link.href = uri;link.style = "visibility:hidden";link.download = fileName + ".csv";document.body.appendChild(link);link.click();document.body.removeChild(link);}}; return o.export();}
async function DownloadUrl(url, name) {fetch(url, {mode: 'no-cors',}).then(resp => resp.blob()).then(blob => {let url = window.URL.createObjectURL(blob);let a = document.createElement('a');a.style.display = 'none';a.href = url;a.download = name;document.body.appendChild(a);a.click();window.URL.revokeObjectURL(url);}).catch(() => alert('oh no!'));}
function JSXToHTML(html){return ReactDOMServer.renderToStaticMarkup(html)}
function GetDistance(p1, p2) {
    let { lat: lat1, lng: lon1 } = p1;
    let { lat: lat2, lng: lon2 } = p2;
    let rad = Math.PI / 180;
    let radius = 6371; //earth radius in kilometers
    return Math.acos(Math.sin(lat2 * rad) * Math.sin(lat1 * rad) + Math.cos(lat2 * rad) * Math.cos(lat1 * rad) * Math.cos(lon2 * rad - lon1 * rad)) * radius; //result in Kilometers
}
export function AIOValidation(props) {
    let $$ = {
        translate(text) {
            if (!text) { return text }
            let { lang } = props;
            let dict = {
                'should be contain': 'باید شامل',
                'should be before': 'باید قبل از',
                'cannot be after': 'نمی تواند بعد از',
                'should be after': 'باید بعد از',
                'cannot be before': 'نمی تواند قبل از',
                'should not be contain': 'نمی تواند شامل',
                'should be less than': 'باید کمتر از',
                'should be more than': 'باید بیشتر از',
                'could not be more than': 'نباید بزرگ تر از',
                'could not be less than': 'نباید کوچک تر از',
                'character(s)': 'کاراکتر',
                'item(s)': 'مورد',
                'should be equal': 'باید برابر',
                'cannot be equal': 'نمی تواند برابر'
            }
            return lang === 'fa' ? dict[text] : text
        },
        getMessage(target, { be, validation, unit = '' }) {
            let params = validation[2] || {}
            let { title = props.title, target: targetPresentation = target, message } = params;
            if (message) { return message }
            return `${title} ${this.translate(be)} ${JSON.stringify(targetPresentation)} ${unit}` + (props.lang === 'fa' ? ' باشد' : '')
        },
        contain(target, validation, value) {
            let config = { be: 'should be contain', validation };
            if (target === 'number') { if (!/\d/.test(value)) { return this.getMessage('number', config) } }
            else if (target === 'letter') { if (!/[a-zA-Z]/.test(value)) { return this.getMessage('letter', config) } }
            else if (target === 'uppercase') { if (!/[A-Z]/.test(value)) { return this.getMessage('uppercase', config) } }
            else if (target === 'lowercase') { if (!/[a-z]/.test(value)) { return this.getMessage('lowercase', config) } }
            else if (target === 'symbol') { if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(value)) { return this.getMessage('symbol', config) } }
            else if (typeof target.test === 'function') { if (!target.test(value)) { return this.getMessage(target.toString(), config) } }
            else { if (value.indexOf(target) === -1 && target !== undefined) { return this.getMessage(target, config) } }
        },
        notContain(target, validation, value) {
            let config = { be: 'should not be contain', validation };
            if (target === 'number') { if (/\d/.test(value)) { return this.getMessage('number', config) } }
            else if (target === 'letter') { if (/[a-zA-Z]/.test(value)) { return this.getMessage('letter', config) } }
            else if (target === 'uppercase') { if (/[A-Z]/.test(value)) { return this.getMessage('uppercase', config) } }
            else if (target === 'lowercase') { if (/[a-z]/.test(value)) { return this.getMessage('lowercase', config) } }
            else if (target === 'symbol') { if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(value)) { return this.getMessage('symbol', config) } }
            else if (typeof target.test === 'function') { if (target.test(value)) { return this.getMessage(target.toString(), config) } }
            else { if (value.indexOf(target) !== -1) { return this.getMessage(target, config) } }
        },
        length(target, validation, value, unit, exact) {
            if (exact) { return this.getMessage(target, { validation, be: 'should be contain', unit }) }
            if (value && value.length !== target) { return this.getMessage(target, { validation, be: 'should be contain', unit }) }
        },
        notLength(target, validation, value, unit, exact) {
            if (exact) { return this.getMessage(target, { validation, be: 'should not be contain', unit }) }
            if (value && value.length === target) { return this.getMessage(target, { validation, be: 'should not be contain', unit }) }
        },
        lengthLess(target, validation, value, unit, exact) {
            if (exact) { return this.getMessage(target, { validation, be: 'should be less than', unit }) }
            if (value && value.length >= target) { return this.getMessage(target, { validation, be: 'should be less than', unit }) }
        },
        lengthLessEqual(target, validation, value, unit, exact) {
            if (exact) { return this.getMessage(target, { validation, be: 'could not be more than', unit }) }
            if (value && value.length > target) { return this.getMessage(target, { validation, be: 'could not be more than', unit }) }
        },
        lengthMore(target, validation, value, unit, exact) {
            if (exact) { return this.getMessage(target, { validation, be: 'should be more than', unit }) }
            if (value && value.length <= target) { return this.getMessage(target, { validation, be: 'should be more than', unit }) }
        },
        lengthMoreEqual(target, validation, value, unit, exact) {
            if (exact) { return this.getMessage(target, { validation, be: 'could not be less than', unit }) }
            if (value && value.length < target) { return this.getMessage(target, { validation, be: 'could not be less than', unit }) }
        },
        equal(target, validation, value, a, exact) {
            if (exact) { this.getMessage(target, { validation, be: 'should be equal' }) }
            if (JSON.stringify(value) !== JSON.stringify(target)) {
                return this.getMessage(target, { validation, be: 'should be equal' })
            }
        },
        not(target, validation, value, a, exact) {
            if (exact) { return this.getMessage(target, { validation, be: 'cannot be equal' }) }
            if (JSON.stringify(value) === JSON.stringify(target)) {
                return this.getMessage(target, { validation, be: 'cannot be equal' })
            }
        },
        dateLess(target, validation, value, a, exact) {
            if (exact) { return this.getMessage(target, { validation, be: 'should be before' }) }
            if (AIODate().isGreater(value, target) || AIODate().isEqual(value, target)) {
                return this.getMessage(target, { validation, be: 'should be before' })
            }
        },
        dateLessEqual(target, validation, value, a, exact) {
            if (exact) { return this.getMessage(target, { validation, be: 'cannot be after' }) }
            if (AIODate().isGreater(value, target)) {
                return this.getMessage(target, { validation, be: 'cannot be after' })
            }
        },
        dateMore(target, validation, value, a, exact) {
            if (exact) { return this.getMessage(target, { validation, be: 'should be after' }) }
            if (AIODate().isLess(value, target) || AIODate().isEqual(value, target)) {
                return this.getMessage(target, { validation, be: 'should be after' })
            }
        },
        dateMoreEqual(target, validation, value, a, exact) {
            if (exact) { this.getMessage(target, { validation, be: 'cannot be before' }) }
            if (AIODate().isLess(value, target)) {
                return this.getMessage(target, { validation, be: 'cannot be before' })
            }
        },
        less(target, validation, value, a, exact) {
            if (exact) { return this.getMessage(target, { validation, be: 'should be less than' }) }
            if (typeof value === 'number' && typeof target === 'number' && value >= target) {
                return this.getMessage(target, { validation, be: 'should be less than' })
            }
        },
        lessEqual(target, validation, value, a, exact) {
            if (exact) { return this.getMessage(target, { validation, be: 'could not be more than' }) }
            if (typeof value === 'number' && typeof target === 'number' && value > target) {
                return this.getMessage(target, { validation, be: 'could not be more than' })
            }
        },
        more(target, validation, value, a, exact) {
            if (exact) { return this.getMessage(target, { validation, be: 'should be more than' }) }
            if (typeof value === 'number' && typeof target === 'number' && value <= target) {
                return this.getMessage(target, { validation, be: 'should be more than' })
            }
        },
        moreEqual(target, validation, value, a, exact) {
            if (exact) { return this.getMessage(target, { validation, be: 'could not be less than' }) }
            if (typeof value === 'number' && typeof target === 'number' && value < target) {
                return this.getMessage(target, { validation, be: 'could not be less than' })
            }
        },
        getResult(fn, target, validation, value, unit) {
            target = Array.isArray(target) ? target : [target];
            if (Array.isArray(target)) {
                let matchedTargets = [];
                let notMatchedTargets = [];
                for (let i = 0; i < target.length; i++) {
                    let result = this[fn](target[i], validation, value, unit)
                    if (!result) { matchedTargets.push(target[i]) }
                    else { notMatchedTargets.push(target[i]) }
                }
                if (matchedTargets.length) { return }
                // if(notMatchedTargets.length > 3){
                //   notMatchedTargets = [notMatchedTargets[0],notMatchedTargets[1],notMatchedTargets[2],'...']
                // }
                return this[fn](notMatchedTargets.join(' or '), validation, value, unit, true)
            }
            else {
                let result = this[fn](target, validation, value, unit)
                if (result) { return result }
            }

        },
        getValidation() {
            let { lang = 'en', value, validations = [] } = props;
            let unit = '';
            if (Array.isArray(value)) { unit = this.translate('item(s)') }
            else if (typeof value === 'string') { unit = this.translate('character(s)') }
            for (let i = 0; i < validations.length; i++) {
                let [type, target, params = {}] = validations[i];
                let result;
                if (type === 'function') {
                    result = target(value);
                }
                else if (type === 'required') {
                    if (value === undefined || value === null || value === '' || value === false || value.length === 0) {
                        let { title = props.title } = params;
                        if (lang === 'en') { return `${title} is required` }
                        if (lang === 'fa') { return `وارد کردن ${title} ضروری است` }
                    }
                }
                else if (type === 'contain') { result = this.getResult('contain', target, validations[i], value) }
                else if (type === '!contain') { result = this.getResult('notContain', target, validations[i], value) }
                else if (type === 'length') { result = this.getResult('length', target, validations[i], value, unit) }
                else if (type === '!length') { result = this.getResult('notLength', target, validations[i], value, unit) }
                else if (type === 'length<') { result = this.getResult('lengthLess', target, validations[i], value, unit) }
                else if (type === 'length<=') { result = this.getResult('lengthLessEqual', target, validations[i], value, unit) }
                else if (type === 'length>') { result = this.getResult('lengthMore', target, validations[i], value, unit) }
                else if (type === 'length>=') { result = this.getResult('lengthMoreEqual', target, validations[i], value, unit) }
                else if (type === '=') { result = this.getResult('equal', target, validations[i], value) }
                else if (type === '!=') { result = this.getResult('not', target, validations[i], value) }
                else if (type === '<') { result = this.getResult('less', target, validations[i], value) }
                else if (type === '<=') { result = this.getResult('lessEqual', target, validations[i], value) }
                else if (type === '>') { result = this.getResult('more', target, validations[i], value) }
                else if (type === '>=') { result = this.getResult('moreEqual', target, validations[i], value) }
                else if (type === 'date<') { result = this.getResult('dateLess', target, validations[i], value) }
                else if (type === 'date<=') { result = this.getResult('dateLessEqual', target, validations[i], value) }
                else if (type === 'date>') { result = this.getResult('dateMore', target, validations[i], value) }
                else if (type === 'date>=') { result = this.getResult('dateMoreEqual', target, validations[i], value) }
                if (result) { return result }
            }
            return ''
        }
    }
    props.translate = props.translate || function (text) { return text }
    props.lang = props.lang || 'en';
    let validation;
    try { validation = $$.getValidation() } catch { validation = '' }
    return validation;
}
export function getFormInputs(fields,path){
    function getInput(input){return typeof input === 'string'?getFormInput(input,path):input}
    return fields.map((o)=>Array.isArray(o)?{row:o.map((oo)=>getInput(oo))}:getInput(o))
}
export function getFormInput(Field,path){
    function getOptions(field,path){
        return {
            militaryservice:()=>['مشمول','معاف','پایان خدمت'],gender:()=>['مرد','زن'],married:()=>['مجرد','متاهل'],state:()=>Object.keys(getCities()),
            city:()=>(value)=>{
                let state;
                try{eval(`state = value${path?'.' + path:''}.state`)} catch{}
                return !state?[]:getCities()[state]
            },
            
        }[field]()
    }
    function getField(field){return `value${path?`.${path}`:''}.${field}`}
    function getBase(field){
        let list = field.split('_');
        if(list.length === 3){return {field:list[0],input:{type:list[1]},label:list[2],extra:{}}}
        let {input,label,extra = {}} = {
            fullname:{input:{type:'text'},label:'نام و نام خانوادگی'},
            firstname:{input:{type:'text'},label:'نام'},
            lastname:{input:{type:'text'},label:'نام خانوادگی'},
            username:{input:{type:'text'},label:'نام کاربری'},
            address:{input:{type:'textarea'},label:'آدرس'},
            email:{input:{type:'text'},label:'ایمیل'},
            father:{input:{type:'text'},label:'نام پدر'},
            phone:{input:{type:'text',maxLength:11,justNumber:true},label:'شماره تلفن'},
            mobile:{input:{type:'text',maxLength:11,justNumber:true},label:'شماره همراه'},
            postal:{input:{type:'text',justNumber:true},label:'کد پستی'},
            nationalcode:{input:{type:'text',maxLength:10,justNumber:true},label:'کد ملی'},
            idnumber:{input:{type:'text'},label:'شماره شناسنامه'}, 
            cardbank:{input:{type:'text',justNumber:true,maxLength:16},label:'شماره کارت'},
            state:{input:{type:'select'},label:'استان'},
            city:{input:{type:'select'},label:'شهر'},
            gender:{input:{type:'radio'},label:'جنسیت'},
            married:{input:{type:'radio'},label:'وضعیت تاهل'},
            password:{input:{type:'password'},label:'رمز عبور'},
            repassword:{
                input:{type:'password'},label:'تکرار رمز عبور',
                extra:{validations:[['=',getField('password'),{message:'تکرار رمز صحیح نیست'}]]}
            },
            militaryservice:{input:{type:'radio'},label:'وضعیت خدمت'},
            location:{
                input:{
                    type:'map',mapConfig:{draggable:false,zoomable:false,showAddress:false},
                    popup:{mapConfig:{search:true,title:'ثبت موقعیت جغرافیایی',zoomable:true,draggable:true}},
                    style:{height:90,minHeight:90}
                },
                label:'موقعیت جغرافیایی',extra:{addressField:getField('address')}
            }, 
        }[field];
        return {input,label,extra,field}
    }
    let required = false;
    if(Field.indexOf('*') === 0){Field = Field.slice(1,Field.length); required = true}
    let {input,label,extra,field} = getBase(Field);
    let inputProps = {...input}
    if(['select','radio'].indexOf(input.type) !== -1){inputProps = {...inputProps,optionText:'option',optionValue:'option',options:getOptions(field,path)}}
    if(['select'].indexOf(input.type) !== -1){inputProps = {...inputProps,popover:{fitHorizontal:true}}}
    return {field:`value${path?`.${path}`:''}.${field}`,validations:required?[['required']]:undefined,label,input:inputProps,...extra}     
}
function getCities() {
    return {
        "آذربایجان شرقی": ["اسکو", "اهر", "ایلخچی", "آبش احمد", "آذرشهر", "آقکند", "باسمنج", "بخشایش", "بستان آباد", "بناب", "بناب جدید", "تبریز", "ترک", "ترکمانچای", "تسوج", "تیکمه داش", "جلفا", "خاروانا", "خامنه", "خراجو", "خسروشهر", "خضرلو", "خمارلو", "خواجه", "دوزدوزان", "زرنق", "زنوز", "سراب", "سردرود", "سهند", "سیس", "سیه رود", "شبستر", "شربیان", "شرفخانه", "شندآباد", "صوفیان", "عجب شیر", "قره آغاج", "کشکسرای", "کلوانق", "کلیبر", "کوزه کنان", "گوگان", "لیلان", "مراغه", "مرند", "ملکان", "ملک کیان", "ممقان", "مهربان", "میانه", "نظرکهریزی", "هادی شهر", "هرگلان", "هریس", "هشترود", "هوراند", "وایقان", "ورزقان", "یامچی"],
        "آذربایجان غربی": ["ارومیه", "اشنویه", "ایواوغلی", "آواجیق", "باروق", "بازرگان", "بوکان", "پلدشت", "پیرانشهر", "تازه شهر", "تکاب", "چهاربرج", "خوی", "دیزج دیز", "ربط", "سردشت", "سرو", "سلماس","سیلوانه", "سیمینه", "سیه چشمه", "شاهین دژ", "شوط", "فیرورق", "قره ضیاءالدین", "قطور", "قوشچی", "کشاورز", "گردکشانه", "ماکو", "محمدیار", "محمودآباد", "مهاباد", "میاندوآب","میرآباد", "نالوس", "نقده", "نوشین"],
        "اردبیل": ["اردبیل", "اصلاندوز", "آبی بیگلو", "بیله سوار", "پارس آباد", "تازه کند", "تازه کندانگوت", "جعفرآباد", "خلخال", "رضی", "سرعین", "عنبران", "فخرآباد", "کلور", "کوراییم","گرمی", "گیوی", "لاهرود", "مشگین شهر", "نمین", "نیر", "هشتجین", "هیر"],
        "اصفهان": ["ابریشم", "ابوزیدآباد", "اردستان", "اژیه", "اصفهان", "افوس", "انارک", "ایمانشهر", "آران وبیدگل", "بادرود", "باغ بهادران", "بافران", "برزک", "برف انبار", "بهاران شهر", "بهارستان", "بوئین و میاندشت", "پیربکران", "تودشک", "تیران", "جندق", "جوزدان", "جوشقان و کامو", "چادگان", "چرمهین", "چمگردان", "حبیب آباد", "حسن آباد", "حنا", "خالدآباد", "خمینی شهر", "خوانسار", "خور", "خورزوق", "داران", "دامنه", "درچه", "دستگرد", "دهاقان", "دهق", "دولت آباد", "دیزیچه", "رزوه", "رضوانشهر", "زاینده رود", "زرین شهر", "زواره", "زیباشهر", "سده لنجان", "سفیدشهر", "سگزی", "سمیرم", "شاهین شهر", "شهرضا", "طالخونچه", "عسگران", "علویجه", "فرخی", "فریدونشهر", "فلاورجان", "فولادشهر", "قمصر", "قهجاورستان", "قهدریجان", "کاشان", "کرکوند", "کلیشاد و سودرجان", "کمشچه", "کمه", "کهریزسنگ", "کوشک", "کوهپایه", "گرگاب", "گزبرخوار", "گلپایگان", "گلدشت", "گلشهر", "گوگد", "لای بید", "مبارکه", "مجلسی", "محمدآباد", "مشکات", "منظریه", "مهاباد", "میمه", "نائین", "نجف آباد", "نصرآباد", "نطنز", "نوش آباد", "نیاسر", "نیک آباد", "هرند", "ورزنه", "ورنامخواست", "وزوان", "ونک"],
        "البرز": ["اسارا", "اشتهارد", "تنکمان","تهران دشت", "چهارباغ","ساوجبلاغ", "سعید آباد", "شهر جدید هشتگرد", "طالقان","فردیس", "کرج","کردان", "کمال شهر", "کوهسار", "گرمدره","گلبهار", "ماهدشت", "محمدشهر", "مشکین دشت", "نظرآباد", "هشتگرد"],
        "ایلام": ["ارکواز","ایلام","ایوان","آبدانان","آسمان آباد","بدره","پهله","توحید","چوار","دره شهر","دلگشا","دهلران","زرنه","سراب باغ","سرابله","صالح آباد","لومار","مهران","مورموری","موسیان","میمه" ],
        "بوشهر": ["امام حسن","انارستان","اهرم","آب پخش","آبدان","برازجان","بردخون","بندردیر","بندردیلم","بندرریگ","بندرکنگان","بندرگناوه","بنک","بوشهر","تنگ ارم","جم","چغادک","خارک","خورموج","دالکی","دلوار","ریز","سعدآباد","سیراف","شبانکاره","شنبه","عسلویه","کاکی","کلمه","نخل تقی","وحدتیه"],
        "تهران":["ارجمند","اسلامشهر","اندیشه","آبسرد","آبعلی","باغستان","باقرشهر","بومهن","پاکدشت","پردیس","پرند","پیشوا","تهران","جوادآباد","چهاردانگه","حسن آباد","دماوند","دیزین","شهر ری","رباط کریم","رودهن","شاهدشهر","شریف آباد","شمشک","شهریار","صالح آباد","صباشهر","صفادشت","فردوسیه","فشم","فیروزکوه","قدس","قرچک","قیامدشت","کهریزک","کیلان","گلستان","لواسان","مارلیک","ملارد","میگون","نسیم شهر","نصیرآباد","وحیدیه","ورامین"],
        "چهارمحال و بختیاری": ["اردل","آلونی","باباحیدر","بروجن","بلداجی","بن","جونقان","چلگرد","سامان","سفیددشت","سودجان","سورشجان","شلمزار","شهرکرد","طاقانک","فارسان","فرادنبه","فرخ شهر","کیان","گندمان","گهرو","لردگان","مال خلیفه","ناغان","نافچ","نقنه","هفشجان"],
        "خراسان جنوبی": ["ارسک","اسدیه","اسفدن","اسلامیه","آرین شهر","آیسک","بشرویه","بیرجند","حاجی آباد","خضری دشت بیاض","خوسف","زهان","سرایان","سربیشه","سه قلعه","شوسف","طبس ","فردوس","قاین","قهستان","محمدشهر","مود","نهبندان","نیمبلوک"],
        "خراسان رضوی": ["احمدآباد صولت","انابد","باجگیران","باخرز","بار","بایگ","بجستان","بردسکن","بیدخت","بینالود","تایباد","تربت جام","تربت حیدریه","جغتای","جنگل","چاپشلو","چکنه","چناران","خرو","خلیل آباد","خواف","داورزن","درگز","در رود","دولت آباد","رباط سنگ","رشتخوار","رضویه","روداب","ریوش","سبزوار","سرخس","سفیدسنگ","سلامی","سلطان آباد","سنگان","شادمهر","شاندیز","ششتمد","شهرآباد","شهرزو","صالح آباد","طرقبه","عشق آباد","فرهادگرد","فریمان","فیروزه","فیض آباد","قاسم آباد","قدمگاه","قلندرآباد","قوچان","کاخک","کاریز","کاشمر","کدکن","کلات","کندر","گلمکان","گناباد","لطف آباد","مزدآوند","مشهد","ملک آباد","نشتیفان","نصرآباد","نقاب","نوخندان","نیشابور","نیل شهر","همت آباد","یونسی" ],
        "خراسان شمالی": ["اسفراین","ایور","آشخانه","بجنورد","پیش قلعه","تیتکانلو","جاجرم","حصارگرمخان","درق","راز","سنخواست","شوقان","شیروان","صفی آباد","فاروج","قاضی","گرمه","لوجلی"],
        "خوزستان": ["اروندکنار","الوان","امیدیه","اندیمشک","اهواز","ایذه","آبادان","آغاجاری","باغ ملک","بستان","بندرامام خمینی","بندرماهشهر","بهبهان","ترکالکی","جایزان","چمران","چویبده","حر","حسینیه","حمزه","حمیدیه","خرمشهر","دارخوین","دزآب","دزفول","دهدز","رامشیر","رامهرمز","رفیع","زهره","سالند","سردشت","سوسنگرد","شادگان","شاوور","شرافت","شوش","شوشتر","شیبان","صالح شهر","صفی آباد","صیدون","قلعه تل","قلعه خواجه","گتوند","لالی","مسجدسلیمان","ملاثانی","میانرود","مینوشهر","هفتگل","هندیجان","هویزه","ویس"],
        "زنجان": ["ابهر","ارمغان خانه","آب بر","چورزق","حلب","خرمدره","دندی","زرین آباد","زرین رود","زنجان","سجاس","سلطانیه","سهرورد","صائین قلعه","قیدار","گرماب","ماه نشان","هیدج"],
        "سمنان": ["امیریه","ایوانکی","آرادان","بسطام","بیارجمند","دامغان","درجزین","دیباج","سرخه","سمنان","شاهرود","شهمیرزاد","کلاته خیج","گرمسار","مجن","مهدی شهر","میامی"],
        "سیستان و بلوچستان": ["ادیمی","اسپکه","ایرانشهر","بزمان","بمپور","بنت","بنجار","پیشین","جالق","چابهار","خاش","دوست محمد","راسک","زابل","زابلی","زاهدان","زهک","سراوان","سرباز","سوران","سیرکان","علی اکبر","فنوج","قصرقند","کنارک","گشت","گلمورتی","محمدان","محمدآباد","محمدی","میرجاوه","نصرت آباد","نگور","نوک آباد","نیک شهر","هیدوچ"],
        "فارس": ["اردکان","ارسنجان","استهبان","اشکنان","افزر","اقلید","امام شهر","اهل","اوز","ایج","ایزدخواست","آباده","آباده طشک","باب انار","بالاده","بنارویه","بهمن","بوانات","بیرم","بیضا","جنت شهر","جهرم","جویم","زرین دشت","حسن آباد","خان زنیان","خاوران","خرامه","خشت","خنج","خور","داراب","داریان","دبیران","دژکرد","دهرم","دوبرجی","رامجرد","رونیز","زاهدشهر","زرقان","سده","سروستان","سعادت شهر","سورمق","سیدان","ششده","شهرپیر","شهرصدرا","شیراز","صغاد","صفاشهر","علامرودشت","فدامی","فراشبند","فسا","فیروزآباد","قائمیه","قادرآباد","قطب آباد","قطرویه","قیر","کارزین (فتح آباد)","کازرون","کامفیروز","کره ای","کنارتخته","کوار","گراش","گله دار","لار","لامرد","لپویی","لطیفی","مبارک آباددیز","مرودشت","مشکان","مصیری","مهر","میمند","نوبندگان","نوجین","نودان","نورآباد","نی ریز","وراوی"],
        "قزوین": ["ارداق","اسفرورین","اقبالیه","الوند","آبگرم","آبیک","آوج","بوئین زهرا","بیدستان","تاکستان","خاکعلی","خرمدشت","دانسفهان","رازمیان","سگزآباد","سیردان","شال","شریفیه","ضیاآباد","قزوین","کوهین","محمدیه","محمودآباد نمونه","معلم کلایه","نرجه"],
        "قم": ["جعفریه","دستجرد","سلفچگان","قم","قنوات","کهک"],
        "کردستان": ["آرمرده","بابارشانی","بانه","بلبان آباد","بوئین سفلی","بیجار","چناره","دزج","دلبران","دهگلان","دیواندره","زرینه","سروآباد","سریش آباد","سقز","سنندج","شویشه","صاحب","قروه","کامیاران","کانی دینار","کانی سور","مریوان","موچش","یاسوکند"],
        "کرمان": ["اختیارآباد","ارزوئیه","امین شهر","انار","اندوهجرد","باغین","بافت","بردسیر","بروات","بزنجان","بم","بهرمان","پاریز","جبالبارز","جوپار","جوزم","جیرفت","چترود","خاتون آباد","خانوک","خورسند","درب بهشت","دهج","رابر","راور","راین","رفسنجان","رودبار","ریحان شهر","زرند","زنگی آباد","زیدآباد","سیرجان","شهداد","شهربابک","صفائیه","عنبرآباد","فاریاب","فهرج","قلعه گنج","کاظم آباد","کرمان","کشکوئیه","کهنوج","کوهبنان","کیانشهر","گلباف","گلزار","لاله زار","ماهان","محمدآباد","محی آباد","مردهک","مس سرچشمه","منوجان","نجف شهر","نرماشیر","نظام شهر","نگار","نودژ","هجدک","یزدان شهر"],
        "کرمانشاه": ["ازگله","اسلام آباد غرب","باینگان","بیستون","پاوه","تازه آباد","جوان رود","حمیل","ماهیدشت","روانسر","سرپل ذهاب","سرمست","سطر","سنقر","سومار","شاهو","صحنه","قصرشیرین","کرمانشاه","کرندغرب","کنگاور","کوزران","گهواره","گیلانغرب","میان راهان","نودشه","نوسود","هرسین","هلشی"],
        "کهگیلویه و بویراحمد": ["باشت","پاتاوه","چرام","چیتاب","دهدشت","دوگنبدان","دیشموک","سوق","سی سخت","قلعه رئیسی","گراب سفلی","لنده","لیکک","مادوان","مارگون","یاسوج"],
        "گلستان": ["انبارآلوم","اینچه برون","آزادشهر","آق قلا","بندرترکمن","بندرگز","جلین","خان ببین","دلند","رامیان","سرخنکلاته","سیمین شهر","علی آباد کتول","فاضل آباد","کردکوی","کلاله","گالیکش","گرگان","گمیش تپه","گنبدکاووس","مراوه","مینودشت","نگین شهر","نوده خاندوز","نوکنده"],
        "لرستان": ["ازنا","اشترینان","الشتر","الیگودرز","بروجرد","پلدختر","چالانچولان","چغلوندی","چقابل","خرم آباد","درب گنبد","دورود","زاغه","سپیددشت","سراب دوره","فیروزآباد","کونانی","کوهدشت","گراب","معمولان","مومن آباد","نورآباد","ویسیان"],
        "گیلان": ["احمدسرگوراب","اسالم","اطاقور","املش","آستارا","آستانه اشرفیه","بازار جمعه","بره سر","بندرانزلی","پره سر","پیربازار","تالش","توتکابن","جیرنده","چابکسر","چاف و چمخاله","چوبر","حویق","خشکبیجار","خمام","دیلمان","زیباکنار","رانکوه","رحیم آباد","رستم آباد","رشت","رضوانشهر","رودبار","رودبنه","رودسر","سنگر","سیاهکل","شفت","شلمان","صومعه سرا","فومن","کلاچای","کوچصفهان","کومله","کیاشهر","گوراب زرمیخ","لاهیجان","لشت نشا","لنگرود","لوشان","لولمان","لوندویل","لیسار","ماسال","ماسوله","مرجقل","منجیل","واجارگاه"],
        "مازندران": ["امیرکلا","ایزدشهر","آلاشت","آمل","بابل","بابلسر","بلده","بهشهر","بهنمیر","پل سفید","تنکابن","جویبار","چالوس","چمستان","خرم آباد","خلیل شهر","خوش رودپی","دابودشت","رامسر","رستمکلا","رویان","رینه","زرگرمحله","زیرآب","سادات شهر","ساری","سرخرود","سلمان شهر","سورک","شیرگاه","شیرود","عباس آباد","فریدونکنار","فریم","قائم شهر","کتالم","کلارآباد","کلاردشت","کله بست","کوهی خیل","کیاسر","کیاکلا","گتاب","گزنک","گلوگاه","محمودآباد","مرزن آباد","مرزیکلا","نشتارود","نکا","نور","نوشهر"],
        "مرکزی": ["اراک","آستانه","آشتیان","پرندک","تفرش","توره","جاورسیان","خشکرود","خمین","خنداب","داودآباد","دلیجان","رازقان","زاویه","ساروق","ساوه","سنجان","شازند","غرق آباد","فرمهین","قورچی باشی","کرهرود","کمیجان","مامونیه","محلات","مهاجران","میلاجرد","نراق","نوبران","نیمور","هندودر"],
        "هرمزگان": ["ابوموسی","بستک","بندرجاسک","بندرچارک","بندرخمیر","بندرعباس","بندرلنگه","بیکا","پارسیان","تخت","جناح","حاجی آباد","درگهان","دهبارز","رویدر","زیارتعلی","سردشت","سندرک","سوزا","سیریک","فارغان","فین","قشم","قلعه قاضی","کنگ","کوشکنار","کیش","گوهران","میناب","هرمز","هشتبندی"],
        "همدان": ["ازندریان","اسدآباد","برزول","بهار","تویسرکان","جورقان","جوکار","دمق","رزن","زنگنه","سامن","سرکان","شیرین سو","صالح آباد","فامنین","فرسفج","فیروزان","قروه درجزین","قهاوند","کبودر آهنگ","گل تپه","گیان","لالجین","مریانج","ملایر","نهاوند","همدان"],
        "یزد": ["ابرکوه","احمدآباد","اردکان","اشکذر","بافق","بفروئیه","بهاباد","تفت","حمیدیا","خضرآباد","دیهوک","رضوانشهر","زارچ","شاهدیه","طبس","عقدا","مروست","مهردشت","مهریز","میبد","ندوشن","نیر","هرات","یزد"]
    }  
}
function getMainProperties(props,getProp,types){
    let p = getProp;
    let {type,rtl} = props;
    let value = p('value');
    let loading = p('loading');
    let disabled = p('disabled');
    let className = p('className');
    let style = p('style');
    let onClick = p('onClick',undefined,true);
    let attrs = {...p('attrs',{})};
    let justify = p('justify');
    if(className){attrs.className = className}
    if(style){attrs.style = style}
    if(onClick){attrs.onClick = onClick}
    let properties = {
        props:{...props},
        value,type,rtl,loading,disabled:loading || disabled,attrs,justify,
        onChange: p('onChange',undefined,true),
        text: p('text'),
        before: p('before'),after: p('after'),subtext: p('subtext'),label: p('label'),
        className: p('className'),style: p('style')
    }
    if(types.hasOption){
        properties = {
            ...properties,
            options:p('options'),
            optionText:p('optionText'),
            optionValue:p('optionValue'),
            optionAttrs:p('optionAttrs'),
            optionDisabled:p('optionDisabled'),
            optionClassName:p('optionClassName'),
            optionStyle:p('optionStyle'),
            optionShow:p('optionShow'),
            optionSubtext:p('optionSubtext'),
            optionCheckIcon:p('optionCheckIcon'),
            optionBefore:p('optionBefore'),
            optionAfter:p('optionAfter')
        }
    }
    if(types.isDropdown){
        properties = {...properties,caret: p('caret'),popover:p('popover')}
        if(types.hasOption){properties = {...properties,optionClose:p('optionClose'),onSwap:p('onSwap')}}
    }
    if(types.isInput){properties = {...properties,inputAttrs:p('inputAttrs'),blurChange:p('blurChange'),delay:p('delay')}}
    if(types.hasPlaceholder){properties = {...properties,placeholder: p('placeholder')}}
    if(types.hasMultiple){properties = {...properties,multiple: p('multiple')}}
    if(types.hasSearch){properties = {...properties,search: p('search')}}
    if(types.hasKeyboard){properties = {...properties,maxLength: p('maxLength'),filter: p('filter'),justNumber: p('justNumber')}}
    if(type === 'number'){properties = {...properties,swip:p('swip'),spin:p('spin',true)}}
    else if(type === 'password'){properties = {...properties,visible:p('visible')}}
    else if(type === 'checkbox'){properties = {...properties,checkIcon:p('checkIcon'),checked:!!value}}
    else if(type === 'image'){properties = {...properties,preview:p('preview'),width:p('width'),height:p('height')}}
    else if(type === 'map'){properties = {...properties,onChangeAddress:p('onChangeAddress'),popup:p('popup'),mapConfig:p('mapConfig',{})}}
    else if(type === 'multiselect'){
        properties = {
            ...properties,
            optionTagAttrs:p('optionTagAttrs'),
            optionTagBefore:p('optionTagBefore'),
            optionTagAfter:p('optionTagAfter'),
            hideTags:p('hideTags')
        }
    }
    else if(type === 'datepicker'){
        properties = {
            ...properties,
            calendarType:p('calendarType','gregorian'),
            unit:p('unit','day'),
            theme:p('theme',[]),
            size:p('size',180),
            startYear:p('startYear','-10'),
            endYear:p('endYear','+10'),
            pattern:p('pattern'),
            dateDisabled:p('dateDisabled'),
            dateAttrs:p('dateAttrs'),
            remove:p('remove'),
            close:p('close')
        }
    }
    else if(type === 'time'){
        properties = {...properties,calendarType:p('calendarType','gregorian')}
    }
    else if(type === 'list'){
        properties = {
            ...properties,
            size:p('size',48),
            width:p('width',200),
            decay:p('decay',8),
            stop:p('stop',3),
            count:p('count',3),
            move:p('move'),
            editable:p('editable',true)
        }
    }
    else if(type === 'slider'){
        properties = {
            ...properties,
            showValue:p('showValue'),
            lineStyle:p('lineStyle'),
            fillStyle:p('fillStyle'),
            pointStyle:p('pointStyle'),
            valueStyle:p('valueStyle'),
            labelStyle:p('labelStyle'),
            scaleStyle:p('scaleStyle'),
            getPointHTML:p('getPointHTML'),
            getScaleHTML:p('getScaleHTML'),
            direction:p('direction',rtl?'left':'right'),
            scaleStep:p('scaleStep'),
            labelStep:p('labelStep'),
            editLabel:p('editLabel'),
            start:p('start'),
            step:p('step'),
            end:p('end'),
            min:p('min'),
            max:p('max'),
            labelRotate:p('labelRotate'),
        }
    }
    else if(type === 'form'){
        properties = {
            ...properties,
            onClose:p('onClose'),
            onBack:p('onBack'),
            headerAttrs:p('headerAttrs',{}),
            subtitle:p('subtitle'),
            header:p('header'),
            footer:p('footer'),
            getErrors:p('getErrors'),
            onSubmit:p('onSubmit'),
            footerAttrs:p('footerAttrs',{}),
            closeText:p('closeText','Close'),
            resetText:p('resetText','Reset'),
            submitText:p('submitText','Submit'),
            reset:p('reset'),
            inputs:p('inputs'),
            inputClassName:p('inputClassName'),
            inputStyle:p('inputStyle',{}),
            labelAttrs:p('labelAttrs'),
            lang:p('lang','en'),
            updateInput:p('updateInput',(o)=>o),
            initialDisabled:p('initialDisabled',true)
        }
    }
    else if(type === 'table'){
        properties = {
            ...properties,
            columns:p('columns',[]),
            getValue:p('getValue',{}),
            rowAttrs:p('rowAttrs'),
            toolbar:p('toolbar'),
            excel:p('excel'),
            toolbarAttrs:p('toolbarAttrs'),
            paging:p('paging'),
            rowGap:p('rowGap'),
            columnGap:p('columnGap'),
            onAdd:p('onAdd'),
            onRemove:p('onRemove'),
            onSearch:p('onSearch'),
            onSwap:p('onSwap'),
            onChangeSort:p('onChangeSort'),
            headerAttrs:p('headerAttrs'),
            rowTemplate:p('rowTemplate'),
            rowsTemplate:p('rowsTemplate'),
            rowAfter:p('rowAfter'),
            rowBefore:p('rowBefore')
        }
    }
    return {...properties}
}