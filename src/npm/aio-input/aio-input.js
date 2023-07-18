import React, { Component, createRef } from 'react';
import AIODate from './../aio-date/aio-date';
import Layout from './layout';
import Tags from './tags';
import Table from './table';
import Form from './form';
import Slider from './../aio-slider/aio-slider';
import AIOSwip from '../aio-swip/aio-swip';
import Options from './options';
import DatePicker from './datepicker';
import AIContext from './context';
import $ from 'jquery';
import './aio-input.css';
export default class AIOInput extends Component {
    constructor(props) {
        super(props);
        this.dom = createRef();
        this.datauniqid = 'aiobutton' + (Math.round(Math.random() * 10000000));
        this.state = {
            fitHorizontal:['text','number','textarea','password'].indexOf(props.type) !== -1 || props.popupWidth === 'fit' || props.type === 'multiselect',
            backdrop:['text','number','textarea','password'].indexOf(props.type) === -1,
            open: props.open || false,
        }
    }
    dragStart(e) { this.dragIndex = parseInt($(e.target).attr('datarealindex')); }
    dragOver(e) { e.preventDefault(); }
    drop(e) {
        e.stopPropagation();
        let { onSwap } = this.props, from = this.dragIndex, dom = $(e.target);
        if (!dom.hasClass('aio-input-option')) { dom = dom.parents('.aio-input-option'); };
        if (!dom.hasClass('aio-input-option')) { return };
        let to = parseInt(dom.attr('datarealindex'));
        if (from === to) { return }
        onSwap(from, to, this.swap)
    }
    swap(arr, from, to) {
        if (to === from + 1) {
            let a = to;
            to = from;
            from = a;
        }
        let Arr = arr.map((o, i) => { o._testswapindex = i; return o })
        let fromIndex = Arr[from]._testswapindex
        Arr.splice(to, 0, { ...Arr[from], _testswapindex: false })
        return Arr.filter((o) => o._testswapindex !== fromIndex)
    }
    toggle(state) {
        let { open } = this.state;
        let { onToggle } = this.props;
        if (state === undefined) { state = !open }
        if (state === open) { return }
        this.setState({ open: state });
        if (state) { $('body').addClass('aio-input-open'); }
        else {
            $('body').removeClass('aio-input-open');
            setTimeout(() => $(this.dom.current).focus(), 0)
        }
        if (onToggle) { onToggle(state) }
    }
    getSelectText() {
        let { options = [] } = this.props;
        let value = this.getProp('value');
        let option = options.find((option) => this.getOptionProp(option, 'value') === value);
        if (option === undefined) { return '' }
        return this.getOptionProp(option, 'text', '')
    }
    getDatepickerText() {
        let value = this.getProp('value');
        if (value) {
            let unit = this.getProp('unit', 'day');
            let Pattern = this.getProp('pattern');
            let list = AIODate().convertToArray({ date: value });
            let [year, month = 1, day = 1, hour = 0] = list;
            list = [year, month, day, hour];
            let pattern;
            let splitter = AIODate().getSplitter(value)
            if (Pattern) { pattern = Pattern }
            else if (unit === 'month') { pattern = `{year}${splitter}{month}` }
            else if (unit === 'day') { pattern = `{year}${splitter}{month}${splitter}{day}` }
            else if (unit === 'hour') { pattern = `{year}${splitter}{month}${splitter}{day} {hour} : 00` }
            return AIODate().getDateByPattern({ date: list, pattern })
        }
        let calendarType = this.getProp('calendarType', 'gregorian')
        return this.getProp('placeholder', calendarType === 'gregorian' ? 'Select Date' : 'انتخاب تاریخ')
    }
    getProp(key, def) {
        let { type, popOver, caret,options } = this.props;
        if(key === 'attrs'){
            if(['text','textarea','number','password','color'].indexOf(type) !== -1){return {}}
        }
        if (key === 'popOver') {
            if(['table','form','radio','tabs','checkbox','file'].indexOf(type) !== -1){return}
            if (type === 'button') { return popOver }
            if (type === 'datepicker') { return () => <DatePicker {...this.props} /> }
            if (type === 'select' || type === 'multiselect') { return () => <Options /> }
            if(type && options && ['text','number','textarea','password'].indexOf(type) !== -1){return ()=><Options type={type}/>}
        }
        let propsResult = this.props[key] === 'function' ? this.props[key]() : this.props[key];
        if (key === 'caret') { return caret === false?false:(this.getProp('popOver') ? (caret || true) : false )}
        if (key === 'multiple') { return type === 'multiselect' || (type === 'radio' && !!propsResult)}
        if (key === 'text' && propsResult === undefined) {
            if (type === 'select') { return this.getSelectText() }
            if (type === 'datepicker') { return this.getDatepickerText() }
        }
        if (key === 'value') {
            if (this.getProp('multiple')) {
                if (propsResult === undefined) { return [] }
                return !Array.isArray(propsResult) ? [propsResult] : propsResult
            }
            else { return Array.isArray(propsResult) ? propsResult[0] : propsResult }
        }
        propsResult = propsResult === undefined ? def : propsResult;
        return propsResult;
    }
    getOptionProp(option, key, def) {
        if(key === 'onClick'){return option.onClick}
        let optionResult = typeof option[key] === 'function' ? option[key](option) : option[key]
        if (optionResult !== undefined) { return optionResult }
        let prop = this.props['option' + key[0].toUpperCase() + key.slice(1, key.length)];
        if (typeof prop === 'string') {
            try {
                let props = this.props;
                let value, evalText = 'value = ' + prop;
                eval(evalText);
                return value;
            }
            catch {
                prop = prop
            }
        }
        if (typeof prop === 'function') { return prop(option) }
        if (prop !== undefined) { return prop }
        return def
    }
    click(e) {
        if ($(e.target).parents('.aio-input-tags').length !== 0) { return; }
        let { type, onChange = () => { }, onClick } = this.props;
        if (type === 'file') { return }
        if (this.getProp('popOver')) { this.toggle(true); }
        else if (type === 'checkbox') { onChange(!this.getProp('value')) }
        else if (onClick) { onClick(); }
    }
    optionClick(option) {
        let { onChange = () => { },type } = this.props;
        let Value = this.getProp('value');
        let { value, onClick, close,text } = option;
        if (onClick) { onClick(value, option); }
        else if(type && ['text','number','textarea','password'].indexOf(type) !== -1){onChange(text)}
        else if (this.getProp('multiple')) {
            if (Value.indexOf(value) === -1) { onChange(Value.concat(value), value, 'add') }
            else { onChange(Value.filter((o) => o !== value), value, 'remove') }
        }
        else { onChange(value, option) }
        if (close) { this.toggle(false) }
    }
    getContext() {
        let { open,fitHorizontal,backdrop } = this.state;
        return {
            ...this.props,
            dragStart:this.dragStart.bind(this),
            dragOver:this.dragOver.bind(this),
            drop:this.drop.bind(this),
            click: this.click.bind(this),
            optionClick: this.optionClick.bind(this),
            datauniqid: this.datauniqid,
            getProp: this.getProp.bind(this),
            getOptionProp: this.getOptionProp.bind(this),
            parentDom: this.dom,
            toggle: this.toggle.bind(this),
            open,fitHorizontal,backdrop
        }
    }
    render_button() { return <Layout /> }
    render_file() { return <Layout /> }
    render_select() { return <Layout /> }
    render_multiselect() { return <Multiselect /> }
    render_radio() { return <Layout text={<Options />} /> }
    render_tabs() { return <Layout text={<Options />} /> }
    render_checkbox() { return <Layout /> }
    render_datepicker() { return <Layout /> }
    render_table() { return <Table {...this.props} /> }
    render_text() { return <Layout text={<Input value={this.getProp('value')}/>} /> }
    render_password() { return <Layout text={<Input value={this.getProp('value')}/>} /> }
    render_textarea() { return <Layout text={<Input value={this.getProp('value')}/>} /> }
    render_number() { return <Layout text={<Input value={this.getProp('value')} />} /> }
    render_color() { return <Layout text={<Input value={this.getProp('value')} />} /> }
    render_slider() { return <Layout text={<InputSlider value={this.getProp('value')}/>} /> }
    render_form() { return <Form {...this.props} /> }
    render() {
        let { type } = this.props;
        if (!type || !this['render_' + type]) { return null }
        return (
            <AIContext.Provider value={this.getContext()}>
                {this['render_' + type]()}
            </AIContext.Provider>
        )
    }
}
AIOInput.defaultProps = { showTags: true }
class InputSlider extends Component{
    static contextType = AIContext;
    change(value){
        let {onChange} = this.context;
        if(value.length === 1){onChange(value[0])}
        else {onChange([value[0],value[1]])}
    }
    render(){
        let {getProp} = this.context;
        let value = getProp('value');
        let rtl = getProp('rtl');
        if(!Array.isArray(value)){value = [value]}
        return (
            <Slider
                direction={rtl?'left':'right'}
                showValue={true}
                value={value}
                onChange={this.change.bind(this)}
            />
        )
    }
}
class Multiselect extends Component {
    static contextType = AIContext;
    getTagByValue(v) {
        let { getProp, getOptionProp} = this.context;
        let options = getProp('options', [])
        let option = options.find((option) => v === getOptionProp(option, 'value'))
        if (option === undefined) { return }
        let disabled = getProp('disabled');
        return {
            option, disabled,
            text: getOptionProp(option, 'text'),
            value: getOptionProp(option, 'value'),
            tagBefore: getOptionProp(option, 'tagBefore'),
            tagAfter: getOptionProp(option, 'tagAfter'),
            tagAttrs: getOptionProp(option, 'tagAttrs', {}),
            onRemove: ()=>this.removeTag(v,disabled)
        }
    }
    removeTag(v,disabled){
        if(disabled){return}
        let {getProp,onChange = () => { } } = this.context;
        let value = getProp('value')
        onChange(value.filter((o) => o !== v))
    }
    render() {
        let { style = {}, getProp } = this.context;
        let value = getProp('value');
        let showTags = getProp('showTags', true);
        let tags = value.map((o, i) => this.getTagByValue(o));
        return (
            <div className={'aio-input-multiselect-container'} style={{ width: style.width }}>
                <Layout />
                {!!showTags && !!value.length && <Tags tags={tags} />}
            </div>
        )
    }
}

class Input extends Component {
    static contextType = AIContext;
    constructor(props) {
        super(props);
        this.dataUniqId = 'ai' + Math.round(Math.random() * 10000000)
        this.dom = createRef();
        this.container = createRef();
        let {value = ''} = props;
        if(value === null){value = ''}
        this.state = { value, prevValue: value }
    }
    componentDidMount() {
        let { type, min, max, swip } = this.context;
        if (type === 'number' && swip) {
            AIOSwip({
                speedY: 0.2,
                dom: $(this.dom.current),
                start: () => {
                    this.so = this.state.value || 0;
                },
                move: ({ dx, dy, dist }) => {
                    let newValue = -dy + this.so
                    if (min !== undefined && newValue < min) { return }
                    if (max !== undefined && newValue > max) { return }
                    this.change(newValue)
                }
            })
        }
    }
    componentDidUpdate() {
        let { type, autoHeight, delay = 400 } = this.props;
        if (type === 'textarea' && autoHeight) {
            let dom = this.dom.current;
            dom.style.height = 'fit-content';
            let scrollHeight = dom.scrollHeight + 'px'
            dom.style.height = scrollHeight;
            dom.style.overflow = 'hidden';
            dom.style.resize = 'none';
        }
        clearTimeout(this.rrt)
        if (this.state.value !== this.props.value) {
            this.rrt = setTimeout(() => this.setState({ value: this.props.value }), delay + 10)
        }
    }
    change(value) {
        let { type,getProp } = this.context;
        let onChange = getProp('onChange');
        if(!onChange){return}
        let maxLength = getProp('maxLength', Infinity);
        let justNumber = getProp('justNumber');
        let delay = getProp('delay', 400);
        let filter = getProp('filter', []);

        if (type === 'number') { if (value) { value = +value; } }
        else if (type === 'text' || value === 'textarea') {
            if (value) {
                if (justNumber) {
                    value = value.toString();
                    let lastChar = value[value.length - 1];    
                    if (isNaN(+lastChar)) { value = value.slice(0, value.length - 1) }
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
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.onChange(value);
        }, delay);
    }
    render() {
        let { getProp, type } = this.context;
        let { value } = this.state;
        let attrs = getProp('attrs', {});
        let disabled = getProp('disabled', false);
        let placeholder = getProp('placeholder');
        let spin = getProp('spin');
        this.onChange = getProp('onChange');
        let props = {
            ...attrs, value, type, disabled, ref: this.dom,placeholder,
            className: spin === false ? 'no-spin' : '',
            onChange: (e) => this.change(e.target.value)
        }
        if (typeof this.onChange !== 'function') { return <div className='aio-input-value'>{value}</div> }
        else if (type === 'textarea') { return <textarea {...props} /> }
        else { return (<input {...props} />) }
    }
}


