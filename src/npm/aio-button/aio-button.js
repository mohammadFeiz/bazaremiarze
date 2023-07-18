import React, { Component, createRef, createContext } from 'react';
import { Icon } from '@mdi/react';
import { mdiAttachment, mdiClose } from '@mdi/js';
import Input from './input';
import Table from './table';
import DatePicker from './datepicker';
import DownloadUrl from '../aio-functions/download-url';
import AIODate from './../aio-date/aio-date';
import { Popover } from '../aio-popup/aio-popup';
import $ from 'jquery'
import './index.css';

let aioButtonContext = createContext();
let ABCLS = {
  button: 'aio-button', radio: 'aio-button-radio', tabs: 'aio-button-tabs', option: 'aio-button-option', options: 'aio-button-options',
  tags: 'aio-button-tags', tag: 'aio-button-tag', tagIcon: 'aio-button-tag-icon', tagText: 'aio-button-tag-text',
  open: 'aio-button-open', radioOption: 'aio-button-radio-option', tabsOption: 'aio-button-tabs-option',
  checkbox: 'aio-button-checkbox', text: 'aio-button-text', hasSubtext: 'aio-button-has-subtext', subtext: 'aio-button-subtext',
  gap: 'aio-button-gap', caret: 'aio-button-caret', search: 'aio-button-search', searchIcon: 'aio-button-icon',
  add: 'aio-button-add', popup: 'aio-button-popup', popupContainer: 'aio-button-popup-container', multiselect: 'aio-button-multiselect',
  checkOut: 'aio-button-check-out', checkIn: 'aio-button-check-in', splitter: 'aio-button-splitter'
}
class Radio extends Component {
  static contextType = aioButtonContext;
  render() {
    let { className, justify, rtl, style, gap, type, multiple, label } = this.context;
    var { options = [], attrs = {} } = this.props;
    return (
      <div
        {...attrs} className={ABCLS.radio + (rtl ? ' rtl' : '') + (className ? ' ' + className : '') + (label ? ' has-label' : '')} data-label={label}
        style={{ justifyContent: justify ? 'center' : undefined, ...style }}
      >
        {
          options.map((option, i) => {
            return <Option key={i} {...option} renderIndex={i} gap={gap} rtl={rtl} type={type} multiple={multiple} />
          })
        }
      </div>
    );
  }
}
class Tabs extends Component {
  static contextType = aioButtonContext;
  render() {
    let { className, rtl, style, gap, before, after, disabled } = this.context;
    var { options = [], attrs = {} } = this.props;
    return (
      <div
        {...attrs} className={ABCLS.tabs + (rtl ? ' rtl' : '') + (className ? ' ' + className : '')}
        style={{ ...style }}
      >
        {before !== undefined && before}
        {
          options.map((option, i) => {
            return <Option key={i} {...option} renderIndex={i} gap={gap} rtl={rtl} />
          })
        }
        {after !== undefined && <><div style={{ flex: 1 }}></div>{after}</>}
      </div>
    );
  }
}
export default class AIOButton extends Component {
  constructor(props) {
    super(props);
    this.dom = createRef()
    this.activeIndex = false;
    this.state = { open: this.props.open || false, touch: 'ontouchstart' in document.documentElement }
  }
  getPopover(){
    let {type,popOver} = this.props;
    if(type === 'button'){return popOver}
    if(type === 'datepicker'){return ()=><DatePicker {...this.props}/>} 
  }
  getPropfromProps({ option, index, field }) {
    let props = this.props;
    let prop = this.props['option' + field[0].toUpperCase() + field.slice(1, field.length)];
    let value;
    if (typeof prop === 'string') {
      try {
        let evalText = 'value = ' + prop;
        eval(evalText);
      }
      catch { value = undefined }
    }
    else if (typeof prop === 'function') { value = prop(option, index) }
    else if (prop !== undefined) { value = prop }
    return value;
  }
  getProp({ option, index, field, def, type, readFrom }) {
    if (readFrom !== 'props') {
      let optionResult = option[field];
      optionResult = typeof option[field] === 'function' ? option[field](option) : option[field];
      if (optionResult !== undefined) {
        if (type) {
          if (this.getType(optionResult) === type) { return optionResult; }
        }
        else { return optionResult; }
      }
    }
    if (readFrom !== 'option') {
      let propsResult = this.getPropfromProps({ option, index, field });
      if (propsResult !== undefined) {
        if (type) {
          if (this.getType(propsResult) === type) { return propsResult; }
        }
        else { return propsResult; }
      }
    }
    return def;
  }
  getType(a) {
    if (typeof a === 'object') {
      if (Array.isArray(a)) { return 'array' }
      return 'object'
    }
    return typeof a;
  }
  dragStart(e) { this.dragIndex = parseInt($(e.target).attr('datarealindex')); }
  dragOver(e) { e.preventDefault(); }
  drop(e) {
    e.stopPropagation();
    let { onSwap } = this.props, from = this.dragIndex, dom = $(e.target);
    if (!dom.hasClass(ABCLS.option)) { dom = dom.parents('.' + ABCLS.option); };
    if (!dom.hasClass(ABCLS.option)) { return };
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

  arrow(e, dom, dir) {
    e.preventDefault();
    let options = dom.find('.' + ABCLS.option)
    let active = options.filter('.active');
    if (active.length === 0) {
      let first = options.eq(0);
      let realIndex = +first.attr('datarealindex');
      let renderIndex = +first.attr('datarenderindex');
      this.activeIndex = { real: realIndex, render: renderIndex };
      first.addClass('active');
    }
    else {
      let renderIndex = +active.attr('datarenderindex');
      renderIndex += dir;
      if (dir === 1) { if (renderIndex >= options.length) { renderIndex = 0; } }
      else { if (renderIndex < 0) { renderIndex = options.length - 1; } }
      options.removeClass('active');
      let activeOption = options.eq(renderIndex);
      let realIndex = +activeOption.attr('datarealindex')
      this.activeIndex = { real: realIndex, render: renderIndex };
      activeOption.addClass('active').focus();
    }
  }
  enter(e) {
    if (this.activeIndex !== false) {
      let props = this.options.filter((o) => o.realIndex === this.activeIndex.real)[0]
      props.onClick()
      setTimeout(() => {
        let dom = $(this.dom.current)
        dom.focus();
      }, 0)
    }
  }
  keyDown(e, dom) {
    if (e.keyCode === 40) { this.arrow(e, dom, 1) }
    else if (e.keyCode === 38) { this.arrow(e, dom, -1) }
    else if (e.keyCode === 13) { this.enter(e) }
    else if (e.keyCode === 27) { this.toggle() }
  }
  optionClick(option, realIndex) {
    if (this.getProp({ option, index: realIndex, field: 'disabled' })) { return; }
    if (option.onClick) { option.onClick(option, realIndex); }
    else if (this.props.onClick) { this.props.onClick(option); }
    if (this.getProp({ option, index: realIndex, field: 'close', def: true }) !== false && this.getProp({ option, index: realIndex, field: 'checked', def: undefined }) === undefined) { this.toggle(); }
  }
  onButtonClick(e) {
    if ($(e.target).parents('.' + ABCLS.tags).length !== 0) { return; }
    var { options, onClick = () => { } } = this.props;
    let popOver = this.getPopover()
    if (options || popOver) { this.toggle(true); }
    else { onClick(this.props); }
  }
  showPopup(open, options) {
    let { type } = this.props;
    let popOver = this.getPopover();
    if (!open) { return false; }
    if(popOver){return true}
    if (type === 'radio' || type === 'checkbox') { return false }
    if (options && options.length) { return true }
    return false
  }
  toggle(state, isBackdrop) {
    let { open } = this.state;
    let { onBackdropClick, onToggle } = this.props;
    if (state === undefined) { state = !open }
    clearTimeout(this.timeOut);
    this.timeOut = setTimeout(() => {
      if (state === open) { return }
      this.setState({ open: state });
      if (state) { $('body').addClass(ABCLS.open); }
      else {
        $('body').removeClass(ABCLS.open);
        setTimeout(() => $(this.dom.current).focus(), 0)
      }
      if (onBackdropClick && isBackdrop) { onBackdropClick(this.props) }
      if (onToggle) { onToggle(state) }
    }, 100)
  }
  getOptions() {
    let { options, type = 'button' } = this.props;
    if (['select', 'multiselect', 'radio', 'tabs'].indexOf(type) === -1) { return }
    this.tags = [];
    this.text = undefined;
    let result = [];
    options = [...options];
    this.options_dic = {};
    for (let realIndex = 0; realIndex < options.length; realIndex++) {
      let option = options[realIndex];
      let value = this.getProp({ option, index: realIndex, field: 'value', def: undefined })
      let text = this.getProp({ option, index: realIndex, field: 'text', def: undefined });
      let checked, tagAttrs, className, before, after, close, tagBefore, active;
      if (type === 'select') {
        className = ABCLS.option;
        checked = this.getProp({ option, index: realIndex, field: 'checked', def: undefined });
        if (value !== undefined && value === this.props.value && this.text === undefined) { this.text = text }
        before = this.getProp({ option, index: realIndex, field: 'before', def: undefined });
        after = this.getProp({ option, index: realIndex, field: 'after', def: undefined });
        close = this.getProp({ option, index: realIndex, field: 'close', def: checked === undefined });
      }
      else if (type === 'multiselect') {
        className = ABCLS.option;
        checked = (this.props.value || []).indexOf(value) !== -1
        tagAttrs = this.getProp({ option, index: realIndex, field: 'tagAttrs', def: tagAttrs });
        before = this.getProp({ option, index: realIndex, field: 'before', def: undefined });
        tagBefore = this.getProp({ option, index: realIndex, field: 'tagBefore', def: undefined });
        after = this.getProp({ option, index: realIndex, field: 'after', def: undefined });
        close = this.getProp({ option, index: realIndex, field: 'close', def: checked === undefined });
      }
      else if (type === 'radio') {
        let { multiple } = this.props;
        className = ABCLS.radioOption;
        before = this.getProp({ option, index: realIndex, field: 'before', def: undefined });
        after = this.getProp({ option, index: realIndex, field: 'after', def: undefined });
        if (multiple) { checked = (this.props.value || []).indexOf(value) !== -1; }
        else { checked = this.props.value === value; }
        close = false;
      }
      else if (type === 'tabs') {
        active = this.props.value === value;
        className = ABCLS.tabsOption + (active ? ' active' : '');
        before = this.getProp({ option, index: realIndex, field: 'before', def: undefined });
        after = this.getProp({ option, index: realIndex, field: 'after', def: undefined });
        close = false;
      }
      let show = this.getProp({ option, index: realIndex, field: 'show', def: true })
      if (!show) { continue }
      this.options_dic[JSON.stringify(value)] = text;
      let checkIcon = this.getProp({ option, index: realIndex, field: 'checkIcon', def: undefined });
      let subtext = this.getProp({ option, index: realIndex, field: 'subtext', def: undefined });

      let disabled = this.getProp({ option, index: realIndex, field: 'disabled', def: false }) || this.props.disabled;
      let attrs = this.getProp({ option, index: realIndex, field: 'attrs', def: {} });
      let optionClassName = this.getProp({ option, index: realIndex, field: 'className', readFrom: 'option', def: undefined });
      let propsClassName = this.getProp({ option, index: realIndex, field: 'className', readFrom: 'props', def: undefined });
      if (optionClassName) { className += ' ' + optionClassName }
      if (propsClassName) { className += ' ' + propsClassName }
      if (disabled) { className += ' disabled' }
      let optionStyle = this.getProp({ option, index: realIndex, field: 'style', readFrom: 'option', def: {} });
      let propsStyle = this.getProp({ option, index: realIndex, field: 'style', readFrom: 'props', def: {} });
      let style = { ...propsStyle, ...optionStyle };
      let props = { option, value, show, text, subtext, checked, close, before, after, disabled, attrs, className, style, realIndex, tagAttrs, checkIcon, tagBefore };
      props.onClick = () => {
        if (props.disabled) { return }
        if (option.onClick) { option.onClick(props) }
        else if (option.onChange) { option.onChange(value, props) }
        else if (type === 'select' || type === 'tabs') {
          if (this.props.onChange) { this.props.onChange(value, props) }
        }
        else if (type === 'radio') {
          let { multiple } = this.props;
          if (multiple) {
            let { value: propsValue = [] } = this.props;
            if (propsValue.indexOf(value) === -1) {
              this.props.onChange(propsValue.concat(value), value, 'add')
            }
            else {
              this.props.onChange(propsValue.filter((o) => o !== value), value, 'remove')
            }
          }
          else {
            this.props.onChange(value, props)
          }
        }
        else if (type === 'multiselect') {
          let {value:propsValue = []} = this.props;
          if (propsValue.indexOf(value) === -1) {
            this.props.onChange(propsValue.concat(value), value, 'add')
          }
          else {
            this.props.onChange(propsValue.filter((o) => o !== value), value, 'remove')
          }
        }
        if (close && checked === undefined) { this.toggle() }
      }
      result.push(props)
      if (type === 'multiselect' && checked) { this.tags.push(props) }
    }
    return result;
  }
  getText() {
    let { type, value, text } = this.props;
    if (type === 'select') {
      if (text === undefined) { return this.options_dic[JSON.stringify(value)] || ''; }
      return (typeof text === 'function' ? text(this.options_dic[value]) : text) || '';
    }
    else if (type === 'datepicker') {
      let { calendarType = 'gregorian', unit = 'day', value, placeholder, pattern: Pattern } = this.props;
      
      let list = value ? AIODate().convertToArray({ date: value }) : [];
      let [year,month = 1,day = 1,hour = 0] = list;
      list = [year,month,day,hour];    
      if (text) { return typeof text === 'function' ? text(list) : text; }
      else if (value) {
        let pattern;
        let splitter = AIODate().getSplitter(value)
        if (Pattern) { pattern = Pattern }
        else if (unit === 'month') { pattern = `{year}${splitter}{month}` }
        else if (unit === 'day') { pattern = `{year}${splitter}{month}${splitter}{day}` }
        else if (unit === 'hour') { pattern = `{year}${splitter}{month}${splitter}{day} {hour} : 00` }
        return AIODate().getDateByPattern({ date: list, pattern })
      }
      else if (placeholder) { return placeholder }
      else { return calendarType === 'gregorian' ? 'Select Date' : 'انتخاب تاریخ'; }
    }
    else if (['checkbox', 'multiselect', 'button', 'file', 'datepicker'].indexOf(type) !== -1) {
      return typeof text === 'function' ? text() : text;
    }
  }
  getCaret() {
    let { caret = true, caretAttrs, type } = this.props;
    let popOver = this.getPopover();
    if (type === 'select' || type === 'multiselect' || type === 'datepicker' || (type === 'button' && !!popOver)) {
      let icon = caret === true ? <div className={ABCLS.caret} {...caretAttrs}></div> : caret;
      return <><div style={{ flex: 1 }}></div>{icon || ''}</>
    }
  }
  render() {
    let { type, show, subtext, value } = this.props;
    if (type === 'table') { return <Table {...this.props} /> }
    if (['text', 'number', 'textarea', 'color', 'password'].indexOf(type) !== -1) { return <Input {...this.props} /> }
    let { open, touch } = this.state;
    let context = {
      ...this.props, touch,
      onButtonClick: this.onButtonClick.bind(this),
      toggle: this.toggle.bind(this),
      dragStart: this.dragStart.bind(this),
      dragOver: this.dragOver.bind(this),
      drop: this.drop.bind(this),
      keyDown: this.keyDown.bind(this),
      popOver:this.getPopover()
    }
    let dataUniqId = 'aiobutton' + (Math.round(Math.random() * 10000000));
    let options = this.getOptions();
    this.options = options;
    if ((typeof show === 'function' ? show({ options }) : show) === false) { return null }
    let COMPONENT = {
      'button': Button, 'file': Button, 'select': Button, 'multiselect': Multiselect,
      'radio': Radio, 'tabs': Tabs, 'checkbox': Checkbox, 'datepicker': Button
    }[type]
    let props = {
      text: this.getText(), caret: this.getCaret(), dom: this.dom, dataUniqId, type, options, tags: this.tags,
      subtext: typeof subtext === 'function' ? subtext(value) : subtext,
    }
    return (
      <aioButtonContext.Provider value={context}>
        <COMPONENT {...props} />
        {this.showPopup(open, options) && <Popup parentDom={this.dom} dataUniqId={dataUniqId} options={options} type={type} />}
      </aioButtonContext.Provider>
    );
  }
}
AIOButton.defaultProps = { gap: 6 };
class Checkbox extends Component {
  static contextType = aioButtonContext;
  getText() {
    let { text } = this.props;
    return typeof text === 'function' ? text() : text;
  }
  getSubtext() {
    let { subtext } = this.props;
    return typeof subtext === 'function' ? subtext() : subtext;
  }
  keyDown(e) {
    let code = e.keyCode;
    let { disabled, onChange, value } = this.props;
    if (code === 13) {
      if (!disabled) { onChange(!!value, this.props) }
    }
  }
  render() {
    let { className, disabled, onChange, value, gap, rtl, before, after, label } = this.context;
    return (
      <Option
        {...this.props}
        data-label={label}
        attrs={{ onKeyDown: (e) => this.keyDown(e), ...this.props.attrs }}
        onKeyDown={(e) => this.keyDown(e)}
        gap={gap}
        before={before}
        after={after}
        rtl={rtl}
        text={this.getText()}
        subtext={this.getSubtext()}
        className={ABCLS.radioOption + ' ' + ABCLS.checkbox + (disabled ? ' disabled' : '') + (className ? ' ' + className : '') + (label ? ' has-label' : '')}
        checked={!!value}
        onClick={() => { if (!disabled) { onChange(!!value, this.props) } }}
      />
    )
  }
}
class Button extends Component {
  static contextType = aioButtonContext;
  async removeFile(index) {
    let { onChange = () => { }, value = [] } = this.context;
    let newValue = [];
    for (let i = 0; i < value.length; i++) {
      if (i === index) { continue }
      newValue.push(value[i])
    }
    onChange(newValue);
  }
  getFile(filename, fileSize) {
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
      let gb = size / (1024 * 1024 * 1024), mb = size / (1024 * 1024), kb = size / 1024;
      if (gb >= 1) { sizeString = gb.toFixed(2) + ' GB'; }
      else if (mb >= 1) { sizeString = mb.toFixed(2) + ' MB'; }
      else if (kb >= 1) { sizeString = kb.toFixed(2) + ' KB'; }
      else { sizeString = size + ' byte' }
      return { minName, sizeString }
    }
    catch {
      return { minName: 'untitle', sizeString: '0' }
    }
  }
  getFiles(value) {
    let result = [];
    for (let i = 0; i < value.length; i++) {
      let { name, url, size } = value[i];
      let { minName, sizeString } = this.getFile(name, size);
      result.push(
        <div key={i} className='aio-button-file'>
          <div className='aio-button-file-icon'>
            <Icon path={mdiAttachment} size={.8} />
          </div>
          <div className='aio-button-file-name' onClick={() => DownloadUrl(url, name)}>
            {`${minName} (${sizeString})`}
          </div>
          <div className='aio-button-file-icon' onClick={() => this.removeFile(i)}>
            <Icon path={mdiClose} size={.7} />
          </div>
        </div>
      )
    }
    return result
  }
  render() {
    let { type, onButtonClick, before, gap, attrs = {}, rtl, onChange = () => { }, after, disabled, className, style, label, multiple = false} = this.context;
    let { dataUniqId, text, subtext, caret, dom } = this.props;
    let props = {
      'data-label': label,
      tabIndex: 0, ...attrs, style, onClick: onButtonClick, 'data-uniq-id': dataUniqId, disabled, ref: dom,
      className: `${ABCLS.button} ${rtl ? 'rtl' : 'ltr'}${className ? ' ' + className : ''}${label ? ' has-label' : ''}`,
    }
    let inside = (
      <>
        {before !== undefined && <Before before={before} gap={gap} />}
        {text !== undefined && <Text text={text} subtext={subtext} />}
        {!!caret && caret}
        {after !== undefined && <After after={after} gap={gap} caret={caret} />}
      </>
    );
    if (type === 'file') {
      let {value = []} = this.context;
      return (
        <>
          <label {...props} className={props.className + (props.disabled ? ' disabled' : '')}>
            <input
              type='file' disabled={props.disabled} style={{ display: 'none' }} multiple={multiple}
              onChange={(e) => {
                let {value = []} = this.context;
                let Files = e.target.files;
                let result = [...value];
                let names = result.map(({ name }) => name);
                for (let i = 0; i < Files.length; i++) {
                  let file = Files[i];
                  if (names.indexOf(file.name) !== -1) { continue }
                  result.push({ name: file.name, size: file.size, file })
                }
                onChange(result)
              }} />
            {inside}
          </label>
          {
            !!value.length && (
              <div className='aio-button-files'>
                {this.getFiles(value)}
              </div>
            )
          }
        </>
      )
    }
    return (<button {...props}>{inside}</button>)
  }
}
function Text(props) {
  return (
    <div className={ABCLS.text + (props.subtext ? ' ' + ABCLS.hasSubtext : '')}>
      {props.text !== undefined && props.text}
      {props.subtext !== undefined && <div className={ABCLS.subtext}>{props.subtext}</div>}
    </div>
  )
}
function Before(props) { return <>{props.before}<div className={ABCLS.gap} style={{ width: props.gap }}></div></> }
function After(props) {
  return (
    <>
      {!props.caret && <div style={{ flex: 1, minWidth: props.gap }}></div>}
      {props.caret && <div style={{ width: props.gap }}></div>}
      {props.after}
    </>
  )
}
function SearchBox(props) {
  return (
    <div className={ABCLS.search}>
      <input type='text' value={props.value} placeholder={props.placeholder} onChange={(e) => props.onChange(e.target.value)} />
      <div className={ABCLS.searchIcon} onClick={() => { props.onChange('') }}>
        {
          props.value &&
          <svg viewBox="0 0 24 24" role="presentation" style={{ width: '1.2rem', height: '1.2rem' }}><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" style={{ fill: 'currentcolor' }}></path></svg>
        }
        {
          !props.value &&
          <svg viewBox="0 0 24 24" role="presentation" style={{ width: '1.2rem', height: '1.2rem' }}><path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" style={{ fill: 'currentcolor' }}></path></svg>
        }
      </div>

    </div>
  )
}
function AddBox(props) {
  if (props.exact) { return null }
  return (
    <div className={ABCLS.add} onClick={() => { props.onClick() }}>
      {props.placeholder}
    </div>
  )
}
class Popup extends Component {
  static contextType = aioButtonContext;
  constructor(props) {
    super(props);
    this.dom = createRef();
    this.state = { searchValue: '', addValue: '' };
  }
  getOptions() {
    let { searchValue } = this.state;
    let { gap, dragStart, dragOver, drop, rtl, onSwap } = this.context;
    let { options, type } = this.props;
    let result = [];
    let exact = false;
    let renderIndex = 0;
    for (let i = 0; i < options.length; i++) {
      let option = options[i];
      if (option.text === undefined) { continue }
      if (searchValue && option.text.indexOf(searchValue) === -1) { continue }
      if (option.text === searchValue) { exact = true }
      result.push(<Option key={i} {...option} renderIndex={renderIndex} gap={gap} dragStart={dragStart} dragOver={dragOver} drop={drop} rtl={rtl} onSwap={onSwap} type={type} />)
      renderIndex++;
    }
    this.exact = exact;
    return result;
  }
  getBody() {
    let { popOver, searchText = 'Search', addText = 'Add', search, popupHeader, popupFooter, onAdd } = this.context;
    if (popOver) { return popOver(this.context, () => this.context.toggle(false)) }
    let { searchValue } = this.state;
    let options = this.getOptions();
    return (
      <>
        {popupHeader && popupHeader}
        {(searchValue !== '' || options.length > 10) && search !== false && <SearchBox value={searchValue} onChange={(text) => this.setState({ searchValue: text })} placeholder={searchText} />}
        {onAdd && searchValue && <AddBox value={searchValue} onClick={() => onAdd(searchValue)} placeholder={addText} options={options} exact={this.exact} />}
        <div className={ABCLS.options}>{options}</div>
        {popupFooter && popupFooter}
      </>
    )
  }
  render() {
    var {
      toggle, popupAttrs = {}, keyDown, backdropAttrs, openRelatedTo,
      rtl, animate, popupWidth, fixPopupPosition, popoverSide
    } = this.context;
    let { dataUniqId, parentDom, type } = this.props;
    return (
      <Popover
        popoverSide={popoverSide}
        rtl={rtl} animate={animate} fitHorizontal={popupWidth === 'fit' || type === 'multiselect'}
        className='aio-button-popover'
        openRelatedTo={openRelatedTo} fixPopupPosition={fixPopupPosition}
        getTarget={() => $(parentDom.current)}
        id={dataUniqId}
        onClose={() => toggle(false, true)}
        backdropAttrs={{
          ...backdropAttrs,
          className: ABCLS.popupContainer
        }}
        attrs={{
          onKeyDown: (e) => keyDown(e, $(this.dom.current)),
          ...popupAttrs
        }}
        body={() => this.getBody()}
      />
    )
  }
}
class Multiselect extends Component {
  static contextType = aioButtonContext;
  render() {
    let { showTags, style = {} } = this.context;
    let { dataUniqId, tags, text, subtext, caret, dom } = this.props;
    return (
      <div className={ABCLS.multiselect} style={{ width: style.width }}>
        <Button dom={dom} dataUniqId={dataUniqId} text={text} subtext={subtext} caret={caret} />
        {showTags !== false && tags.length !== 0 && <Tags tags={tags} />}
      </div>
    )
  }
}
class Tags extends Component {
  static contextType = aioButtonContext;
  render() {
    let { tagsContainerClassName: tcc, tagsContainerStyle: tcs, rtl } = this.context;
    let { tags } = this.props;
    let Tags = tags.map((tag, i) => {
      return <Tag key={i} {...tag} attrs={tag.tagAttrs} />
    });
    return (<div className={ABCLS.tags + (rtl ? ' rtl' : '') + (tcc ? ' ' + tcc : '')} style={tcs}>{Tags}</div>)
  }
}
function Tag(props) {
  let {
    text, onClick, disabled, attrs = {},
    tagBefore = (
      <svg viewBox="0 0 24 24" role="presentation" style={{ width: '0.9rem', height: '0.9rem' }}>
        <path d="M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" style={{ fill: 'currentcolor' }}></path>
      </svg>
    ) } = props;
  return (
    <div className={ABCLS.tag + (attrs.className ? ' ' + attrs.className : '') + (disabled ? ' disabled' : '')} onClick={onClick} style={attrs.style}>
      <div className={ABCLS.tagIcon}>{tagBefore}</div>
      <div className={ABCLS.tagText}>{text}</div>
      <div className={ABCLS.tagIcon}>
        <svg viewBox="0 0 24 24" role="presentation" style={{ width: '0.9rem' }}>
          <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" style={{ fill: 'currentcolor' }}></path>
        </svg>
      </div>
    </div>
  )
}

function CheckIcon(props) {
  let { checked, checkIcon = {}, gap, type, multiple } = props;
  if (checked === undefined) { return null }
  if (Array.isArray(checkIcon)) {
    return (
      <>
        {checkIcon[checked ? 1 : 0]}
        <div className={ABCLS.gap} style={{ width: gap }}></div>
      </>
    )
  }
  let { size = [], color = [], round = type === 'radio' && !multiple } = checkIcon;
  if (!Array.isArray(color)) { color = [color] }
  let [outerColor = 'dodgerblue', innerColor = outerColor] = color;
  let iconColor = [outerColor, innerColor];
  if (!Array.isArray(size)) { size = [14, 12, 1] }
  let [outerSize = 14, innerSize = 12, stroke = 1] = size;
  let iconSize = [outerSize, innerSize, stroke];
  return (
    <>
      <div
        className={ABCLS.checkOut + (checked ? ' checked' : '') + (round ? ' round' : '')}
        style={{ color: iconColor[0], width: iconSize[0], height: iconSize[0], border: `${iconSize[2]}px solid` }}
      >
        {checked && <div className={ABCLS.checkIn + (round ? ' round' : '')} style={{ background: iconColor[1], width: iconSize[1], height: iconSize[1] }}></div>}
      </div>
      <div className={ABCLS.gap} style={{ width: gap }}></div>
    </>
  );
}
class Option extends Component {
  render() {
    let {
      type, option, realIndex, renderIndex, checked, before, after, text, subtext, className, style, onClick,
      title, checkIcon, gap = 6, dragStart, dragOver, drop, rtl, onSwap, attrs, multiple,
    } = this.props;
    let props = { className, title, style, onClick, datarenderindex: renderIndex, datarealindex: realIndex, tabIndex: 0, ...attrs, 'data-label': this.props['data-label'] }
    let checkIconProps = { checked, checkIcon, gap: !before && !text ? 0 : gap, type, multiple }
    if (onSwap) {
      props.onDragStart = dragStart;
      props.onDragOver = dragOver;
      props.onDrop = drop;
      props.draggable = true;
    }
    return (
      <>
        {option && option.splitter && <div className={ABCLS.splitter + (rtl ? ' rtl' : ' ltr')}>{option.splitter}</div>}
        <div {...props}>
          <CheckIcon {...checkIconProps} />
          {before && <Before before={before} gap={gap} />}
          <Text text={text} subtext={subtext} />
          {after && <After after={after} gap={gap} />}
        </div>
      </>
    )
  }
}
