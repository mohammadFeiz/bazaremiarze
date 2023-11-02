import React, { Component, createRef } from 'react';
import * as ReactDOMServer from 'react-dom/server';
import { Icon } from '@mdi/react';
import { mdiClose, mdiChevronRight, mdiChevronLeft } from '@mdi/js';
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import $ from 'jquery';
import './aio-popup.css';


export default class AIOPopup {
  constructor(obj = {}){
    this.rtl = obj.rtl
  }
  render = () => {
    return (
      <>
        <Popups
          rtl={this.rtl}
          getActions={({addModal,removeModal,getModals})=>{
            this._addModal = addModal;
            this._removeModal = removeModal;
            this._getModals = getModals;
          }}
        />
        <AIOSnackeBar rtl={this.rtl} getActions={({add})=>{
          this._addSnakebar = add;
        }}/>
      </>
    )
  }
  getModals = ()=>this._getModals()
  addModal = (obj = {},animate = true)=>{
    if(obj.id === undefined){obj.id = 'popup' + Math.round(Math.random() * 1000000)}
    this._addModal(obj,animate)
  }
  removeModal = (arg,animate = true)=> this._removeModal(arg,animate);
  addAlert = (obj = {}) => {
    let { icon, type = '', text = '', subtext = '', time = 10, className, closeText = 'بستن' } = obj
    Alert({icon,type,text,subtext,time,className,closeText})
  }
  addSnakebar = (obj = {})=>{
    let {text,index,type,subtext,action = {},time = 6,rtl} = obj;
    this._addSnakebar({text,index,type,subtext,action,time,rtl})
  }
}
class Popups extends Component {
  constructor(props) {
    super(props);
    let { getActions = () => { } } = props
    this.state = {modals: []}
    getActions({
      removeModal: this.removeModal.bind(this),
      addModal: this.addModal.bind(this),
      getModals: ()=>[...this.state.modals]
    })
  }
  change(obj) {
    let { onChange = () => { } } = this.props;
    for(let prop in obj){this.state[prop] = obj[prop]}
    this.setState(obj, () => onChange({ ...this.state }))
  }
  addModal(o,animate = true) {
    if(typeof o !== 'object'){
      console.error('aio-popup => addModal modal parameter to add is not an object');
      return;
    }
    if(o.id === undefined){
      console.error('aio-popup => addModal missing modal id property');
      return;
    }
    let { modals } = this.state;
    let newModals = modals.filter(({ id }) => id !== o.id);
    newModals.push({...o,mounted:o.position === 'popover'?false:!animate})
    this.change({ modals: newModals })
  }
  async removeModal(arg = 'last',animate = true) {
    if(arg === 'all'){this.change({ modals: [] });}
    else{
      let { modals } = this.state;
      if(!modals.length){return}
      this.mount(arg,false);
      setTimeout(()=>{
        let modal = arg === 'last'?modals[modals.length - 1]:modals.find((o) => o.id === arg);
        if(modal.onClose){modal.onClose()}
        else if(arg === 'last'){this.change({ modals: modals.slice(0,modals.length - 1) })}
        else {this.change({ modals: modals.filter((o) => o.id !== arg) })}
      },animate?300:0)
    }
  }
  mount(id = 'last',state){
    try{
      let { modals } = this.state;
      if(id === 'last'){id = modals[modals.length - 1].id}
      let newModals = modals.map((o)=>o.id === id?{...o,mounted:state}:o)
      this.change({modals:newModals})
    }
    catch{return}
  }
  getModals() {
    let { modals } = this.state;
    if (!modals.length) { return null }
    return modals.map(({popover, 
      position,text,onSubmit, rtl = this.props.rtl, attrs = {}, onClose,backdrop, header,footer, closeType, body, id,mounted }, i) => {
        let props = {
        id,backdrop,footer,text,onSubmit,header,popover,
        position, rtl, attrs, closeType, body,index: i,mounted,
        onClose: () => this.removeModal(id),
        onMount:()=>this.mount(id,true)
      }
      return <Popup key={id} {...props} />
    })
  }
  render() {
    return (
      <>
        {this.getModals()}
      </>
    )
  }
}

class Popup extends Component {
  constructor(props) {
    super(props);    
    this.dom = createRef();
    this.state = {popoverStyle:undefined}
  }
  async onClose() {
    let { onClose } = this.props;
    onClose();
  }
  componentDidMount(){
    let {popover = {},position,mounted,onMount} = this.props;
    setTimeout(()=>{
      this.setState({
        popoverStyle:position === 'popover'?this.getPopoverStyle():{},
      })
      if(!mounted){onMount()}
    },0)
    if(popover.getTarget){
      this.dui = 'a' + (Math.round(Math.random() * 10000000));
      let target = popover.getTarget();
      target.attr('data-uniq-id',this.dui)
    }
    $(window).unbind('click',this.handleBackClick)
    $(window).bind('click',$.proxy(this.handleBackClick,this))
  }
  handleBackClick(e){
    if(!this.dui){return}
    let target = $(e.target)
    if(this.props.backdrop !== false || target.attr('data-uniq-id') === this.dui || target.parents(`[data-uniq-id=${this.dui}]`).length){
      return
    }
    this.onClose();
  }
  header_layout() {
    let { rtl,header } = this.props;
    if (typeof header !== 'object') { return false }
    return {html:<ModalHeader rtl={rtl} header={header} handleClose={()=>this.onClose()}/>}
  }
  body_layout(){
    let {body = {}} = this.props;
    return { flex:1,html:<ModalBody body={body} handleClose={this.onClose.bind(this)}/> }
  }
  footer_layout() {
    let {closeText,submitText,onSubmit,footer,type} = this.props;
    let handleClose = this.onClose.bind(this);
    let props = {closeText,submitText,onSubmit,footer,type,handleClose};
    return {html:<ModalFooter {...props}/>}
  }
  getBackDropClassName() {
    let { rtl,position = 'fullscreen',backdrop,mounted } = this.props;
    let className = 'aio-popup-backdrop';
    if (backdrop && backdrop.attrs && backdrop.attrs.className) { className += ' ' + backdrop.attrs.className }
    className += ` aio-popup-position-${position}`
    className += backdrop === false?' aio-popup-backdrop-off':''
    className += rtl?' rtl':' ltr'
    if(!mounted){className += ' not-mounted'}
    return className
  }
  backClick(e) {
    e.stopPropagation();
    let target = $(e.target);
    let { backdrop = {} } = this.props;
    if (backdrop.close === false) { return }
    if(!target.hasClass('aio-popup-backdrop')){return}
    this.onClose()
  }
  getPopoverStyle(){
    let { popover = {},rtl,attrs = {} } = this.props;
    let {getTarget,pageSelector,fitHorizontal,fixStyle = (o) => o} = popover; 
    if(!getTarget) { return {} }
    let target = getTarget();
    if (!target || !target.length) { return {}}
    let popup = $(this.dom.current);
    let style = Align(popup, target, { fixStyle: fixStyle, pageSelector, fitHorizontal, style: attrs.style, rtl })
    return {...style,position:'fixed'}
  }
  render() {
    let { rtl, attrs = {},backdrop,mounted} = this.props;
    let {popoverStyle} = this.state
    let backdropProps = {
      ...(backdrop?backdrop.attrs:{}),
      className: this.getBackDropClassName(),
      onClick: backdrop === false?undefined:(e) => this.backClick(e),
    }
    let style = { ...popoverStyle,...attrs.style,flex:'none'}
    let className = 'aio-popup' + (rtl ? ' rtl' : ' ltr') + (!mounted?' not-mounted':'') + (attrs.className?' ' + attrs.className:'');
    return (
      <div {...backdropProps}>
        <RVD
          layout={{
            attrs:{...attrs,ref:this.dom,style:undefined,className:undefined,'data-uniq-id':this.dui},
            className,style,
            column: [
              this.header_layout(),
              this.body_layout(),
              this.footer_layout()
            ]
          }}
        />
      </div>
    )
  }
}
function ModalHeader({rtl,header,handleClose}){
  if(typeof header !== 'object'){return null}
  let {title,subtitle,buttons = [],onClose,backButton,attrs = {}} = header;
  function close(e){if(onClose){onClose(e)} else{handleClose()}}
  function backButton_layout(){
    if(!backButton || onClose === false){return false}
    let path,style;
    if(rtl){path = mdiChevronRight; style = {marginLeft:12}}
    else {path = mdiChevronLeft; style = {marginRight:12}}
    return { html: <Icon path={path} size={1} />, align: 'vh', onClick: () => onClose() ,style}
  }
  function title_layout(){
    if(!title){return false}
    if(!subtitle){
      return { flex: 1,align: 'v', html: title, className: 'aio-popup-title' }  
    }
    else {
      return { 
        flex: 1, align: 'v',
        column:[
          {html:title,className: 'aio-popup-title'},
          {html:subtitle,className: 'aio-popup-subtitle'}
        ]  
      }
    }
  }
  function buttons_layout(){
    if(!buttons.length){return false}
    return {
      gap:6,align:'vh',
      row:()=>buttons.map(([text,attrs = {}])=>{
        let {onClick = ()=>{},className} = attrs;
        attrs.className = 'aio-popup-header-button' + (className?' ' + className:'');
        attrs.onClick = ()=> onClick({close:handleClose})
        return {html:(<button {...attrs}>{text}</button>),align:'vh'}
      })
    }
  }
  function close_layout(){
    if(backButton || onClose === false){return false}
    return { html: <Icon path={mdiClose} size={0.8} />, align: 'vh', onClick: (e) => close(e),className:'aio-popup-header-close-button' }
  }
  let className = 'aio-popup-header' + (attrs.className?' ' + attrs.className:'')
  let style = attrs.style;
  return (<RVD layout={{attrs,className,style,row: [backButton_layout(),title_layout(),buttons_layout(),close_layout()]}}/>)
}
function ModalBody({handleClose,body}){
    let {render,attrs = {}} = body;
    return (
      <div {...attrs} className={'aio-popup-body' + (attrs.className?' ' + attrs.className:'')}>
        {typeof render === 'function' && render({close:handleClose})}
      </div>
    )
}
function ModalFooter({type,closeText = 'Close',submitText = 'Submit',footer,handleClose,onSubmit}){
  if(typeof footer !== 'object'){return null}
  let {attrs = {}} = footer;
  let {buttons = []} = footer;
  function buttons_layout(){
    if(!buttons.length){return false}
    return {
      gap:6,align:'vh',
      row:()=>buttons.map(([text,attrs = {}])=>{
        let {onClick = ()=>{},className} = attrs;
        attrs.className = 'aio-popup-footer-button' + (className?' ' + className:'');
        attrs.onClick = ()=> onClick({close:handleClose})
        return {html:(<button {...attrs}>{text}</button>),align:'vh'}
      })
    }
  }
  let className = 'aio-popup-footer' + (attrs.className?' ' + attrs.className:'')
  let style = attrs.style;
  return (<RVD layout={{className,style,...buttons_layout()}}/>)
}


function Alert(obj = {}) {
  let { icon,type,text,subtext,time,className,closeText} = obj;
  let $$ = {
      time: 0,
      getId() {
          return 'aa' + Math.round((Math.random() * 100000000))
      },
      getBarRender() {
          return `<div class='aio-popup-time-bar' style="width:${$$.time}%;"></div>`
      },
      updateBarRender() {
          $(`.aio-popup-alert-container.${$$.id} .aio-popup-time`).html($$.getBarRender())
      },
      getRender() {
          return (`
      <div class='aio-popup-alert-container ${$$.id}${className ? 'aio-popup' + className : ''}'>
        <div class='aio-popup-alert aio-popup-alert-${type}'>
          <div class='aio-popup-alert-header'>${$$.getIcon()}</div>
          <div class='aio-popup-alert-body'>
            <div class='aio-popup-alert-text'>${ReactDOMServer.renderToStaticMarkup(text)}</div>
            <div class='aio-popup-alert-subtext'>${subtext}</div>
          </div>
          <div class='aio-popup-alert-footer'>
            <button class='aio-popup-alert-close ${$$.id}'>${closeText}</button>    
          </div>
          <div class='aio-popup-time'></div>
        </div>    
      </div>
    `)
      },
      close() {
          $('.' + $$.id).remove()
      },
      getIcon() {
          if (icon === false) { return '' }
          return icon || {
              error: (`<svg viewBox="0 0 24 24" role="presentation" style="width: 4.5rem; height: 4.5rem;"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"></path></svg>`),
              warning: (`<svg viewBox="0 0 24 24" role="presentation" style="width: 4.5rem; height: 4.5rem;"><path d="M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16"></path></svg>`),
              info: (`<svg viewBox="0 0 24 24" role="presentation" style="width: 4.5rem; height: 4.5rem;"><path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"></path></svg>`),
              success: (`<svg viewBox="0 0 24 24" role="presentation" style="width: 4.5rem; height: 4.5rem;"><path d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20M16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z"></path></svg>`)
          }[type] || ''
      },
      startTimer() {
          setTimeout(() => {
              if ($$.time >= 100) { $$.time = 100; $$.close(); return}
              $$.time += 2;
              $$.updateBarRender();
              $$.startTimer();
          }, time / 50 * 1000)
      },
      render() {
          $('body').append($$.getRender());
          $('button.' + $$.id).off('click', $$.close);
          $('button.' + $$.id).on('click', $$.close)
      }
  }
  $$.id = $$.getId();
  $$.render();
  if (time) { $$.startTimer(); }
}
class AIOSnackeBar extends Component{
  constructor(props){
    super(props);
    this.state = {items:[]}
    props.getActions({add:this.add.bind(this)})
  }
  add(item){
    let {items} = this.state;
    this.setState({items:items.concat({...item,id:'a' + Math.round(Math.random() * 1000000000)})})
  }
  remove(id){
    let {items} = this.state;
    this.setState({items:items.filter((o,i)=>o.id !== id)})
  }
  render(){
    let {items} = this.state;
    let {rtl = false} = this.props;
    return (
      <>
       {
         items.map((item,i)=>{
           return (
             <SnackebarItem key={item.id} rtl={rtl} {...item} index={i} onRemove={(id)=>this.remove(id)}/>
           )
         })
       }
      </>
    )
  }
}

class SnackebarItem extends Component{
  constructor(props){
    super(props);
    this.state = {mounted:false,timer:0,bottom:0}
  }
  componentDidMount(){
    let {time = 8} = this.props;
    setTimeout(()=>this.setState({mounted:true}),0)
    setTimeout(()=>this.remove(),time * 1000)
  }
  remove(){
    let {onRemove,id} = this.props;
    this.setState({mounted:false})
    setTimeout(()=>onRemove(id),200)
  }
  info_svg(){return (<svg viewBox="0 0 24 24" role="presentation" style={{width: '1.2rem',height: '1.2rem'}}><path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" style={{fill: 'currentcolor'}}></path></svg>)}
  success_svg(){return (<svg viewBox="0 0 24 24" role="presentation" style={{width: '1.2rem',height: '1.2rem'}}><path d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20M16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z" style={{fill: 'currentcolor'}}></path></svg>)}
  getSvg(type){return type === 'error' || type === 'warning' || type === 'info'?this.info_svg():this.success_svg()}
  getBottom(index){
    let els = $('.aio-popup-snakebar-item-container'),sum = 12;
    for(let i = 0; i < index; i++){sum += els.eq(i).height() + 6;}
    return sum
  }
  render(){
    let {mounted} = this.state;
    let {text,index,type,subtext,action,time,rtl} = this.props;
    let bottom = this.getBottom(index)
    return (
      <div onClick={()=>this.remove()} className={'aio-popup-snakebar-item-container' + (mounted?' mounted':'')} style={{bottom,direction:rtl?'rtl':undefined}}>
        <div className={`aio-popup-snakebar-item aio-popup-snakebar-item-${type}`}>
          <div className={`aio-popup-snakebar-item-icon`}>{this.getSvg(type)}</div>
          <div className='aio-popup-snakebar-item-text'>
            <div>{text}</div>
            {!!subtext && <div className='aio-popup-snakebar-item-subtext'>{subtext}</div>}
          </div>
          {
            !!action.text && 
            <button 
              className='aio-popup-snakebar-item-action' 
              onClick={(e)=>{
                e.stopPropagation(); 
                action.onClick();
                this.remove()
              }}
            >{action.text}</button>}
          <div className={`aio-popup-snakebar-bar`} style={{transition:`${time}s linear`,right:rtl?0:'unset',left:rtl?'unset':0}}></div>  
        </div>
      </div>
    )
  }
}
//id,onClose,backdrop,getTarget,position,fixStyle,attrs,fitHorizontal,pageSelector,rtl,body
function Align(dom,target,config = {}){
  let {fitHorizontal,style,fixStyle = (o)=>o,pageSelector,rtl} = config;
  let $$ = {
    getDomLimit(dom,type){
      let offset = dom.offset();
      let left = offset.left - window.pageXOffset;
      let top = offset.top - window.pageYOffset;
      if(pageSelector && type !== 'page'){
        let page = $(pageSelector);
        try{
          let {left:l,top:t} = page.offset()
          left -= l;
          top -= t;
        }
        catch{}
      }
      let width = dom.outerWidth();
      let height = dom.outerHeight();
      let right = left + width;
      let bottom = top + height;
      return {left,top,right,bottom,width,height};
    },
    getPageLimit(dom){
      let page = pageSelector?$(pageSelector):undefined;
      page = Array.isArray(page) && page.length === 0?undefined:page;
      let bodyWidth = window.innerWidth;
      let bodyHeight = window.innerHeight;
      let pageLimit = page?$$.getDomLimit(page,'page'):{left:0,top:0,right:bodyWidth,bottom:bodyHeight};
      if(pageLimit.left < 0){pageLimit.left = 0;}
      if(pageLimit.right > bodyWidth){pageLimit.right = bodyWidth;}
      if(pageLimit.top < 0){pageLimit.top = 0;}
      if(pageLimit.bottom > bodyHeight){pageLimit.bottom = bodyHeight;}
      return pageLimit;
    },
    align(){
      let pageLimit = $$.getPageLimit(dom);
      let targetLimit = $$.getDomLimit(target,'target');
      let domLimit = $$.getDomLimit(dom,'popover'); 
      domLimit.top = targetLimit.bottom
      domLimit.bottom = domLimit.top + domLimit.height;  
      if(fitHorizontal){
        domLimit.width = targetLimit.width;
        domLimit.left = targetLimit.left;
        domLimit.right = targetLimit.left + targetLimit.width
      }
      else {
        //اگر راست به چپ باید باشد
        if(rtl){
          //راست المان را با راست هدف ست کن
          domLimit.right = targetLimit.right;
          //چپ المان را بروز رسانی کن
          domLimit.left = domLimit.right - domLimit.width;
          //اگر المان از سمت چپ از صفحه بیرون زد سمت چپ المان را با سمت چپ صفحه ست کن
          if(domLimit.left < pageLimit.left){domLimit.left = pageLimit.left;}
        }
        //اگر چپ به راست باید باشد
        else{
          //چپ المان را با چپ هدف ست کن
          domLimit.left = targetLimit.left; 
          //راست المان را بروز رسانی کن
          domLimit.right = domLimit.left + domLimit.width;
          //اگر المان از سمت راست صفحه بیرون زد سمت چپ المان را با پهنای المان ست کن
          if(domLimit.right > pageLimit.right){domLimit.left = pageLimit.right - domLimit.width;}
        }
      }
      
      //اگر المان از سمت پایین صفحه بیرون زد
      if(domLimit.bottom > pageLimit.bottom){
        if(domLimit.height > targetLimit.top - pageLimit.top){domLimit.top = pageLimit.bottom - domLimit.height;}  
        else{domLimit.top = targetLimit.top - domLimit.height;}
      }
      else{domLimit.top = targetLimit.bottom;}
      let overflowY;
      if(domLimit.height > pageLimit.bottom - pageLimit.top){
        domLimit.top = 6;
        domLimit.bottom = undefined;
        domLimit.height = pageLimit.bottom - pageLimit.top - 12;
        overflowY = 'auto';
      }
      let finalStyle = {left:domLimit.left,top:domLimit.top,width:domLimit.width,overflowY,...style}
        console.log(finalStyle)
        return fixStyle(finalStyle,{targetLimit,pageLimit})
    }
  }
  return $$.align();
}