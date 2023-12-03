import React, { Component,useReducer } from 'react';
import AIOStorage from 'aio-storage';
import { Icon } from '@mdi/react';
import { mdiMenu, mdiChevronRight, mdiChevronLeft, mdiChevronDown } from '@mdi/js';
import RVD from 'react-virtual-dom';
import AIOPopup from 'aio-popup';
import './react-super-app.css';
//type I_Sidemenu_props = {items:I_SideMenu_props_item[],header:()=>React.ReactNode,footer:()=>React.ReactNode,attrs:object}
//type I_SideMene_props_item = {icon?:React.ReactNode | ()=>React.ReactNode,text:String,className?:String,style?:Object,onClick?:()=>void,show?:()=>boolean}
export default class RSA {
  constructor(props = {}) {
    RSAValidate(props);
    let { rtl, maxWidth,initialState = {},AppContext,nav,side,title,subtitle,headerContent,actions,header,body,id } = props;
    this.props = {
      rtl,maxWidth,AppContext,initialState,nav,side,title,subtitle,headerContent,actions,header,body,id,
      popup:new AIOPopup({ rtl }),
      getActions:({getNavId,setNavId,openSide,closeSide,SetState,GetState})=>{
        this.getNavId = getNavId;
        this.GetState = GetState;
        this.setNavId = setNavId;
        this.openSide = openSide;
        this.closeSide = closeSide;
        this.SetState = SetState;
      }
    }
    window.history.pushState({}, '')
    window.history.pushState({}, '')
    window.onpopstate = () => {
      window.history.pushState({}, '');
      this.removeModal()
    };  
  }
  render = () => <RSAAPP {...this.props}/>
  addModal = (obj) => this.props.popup.addModal(obj);
  addAlert = (obj) => this.props.popup.addAlert(obj);
  removeModal = (obj) => this.props.popup.removeModal(obj);
  addSnakebar = (obj) => this.props.popup.addSnakebar(obj);
}
function REDUCER(state,action){
  return {...state,[action.key]:action.value}
}
function RSAAPP(props){
  let [state,dispatch] = useReducer(REDUCER,props.initialState)
  function SetState(key,value){dispatch({key,value})}
  function GetState(key){return key?state[key]:{...state}}
  function getContext(){return {actions:props.actions,SetState,GetState,...props.popup}}
  let PROPS = {...props,getActions:(obj)=>props.getActions({...obj,SetState,GetState})} 
  let {AppContext} = props;
  if(AppContext){return (<AppContext.Provider value={getContext()}><ReactSuperApp {...PROPS}/></AppContext.Provider>);}
  else {return <ReactSuperApp {...PROPS}/>}
}

class ReactSuperApp extends Component {
  constructor(props) {
    super(props);
    let { touch = 'ontouchstart' in document.documentElement, splash, splashTime = 7000,id,nav } = props;
    this.storage = AIOStorage('rsa-cache-' + id);
    window.oncontextmenu = function (event) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    };
    let navId = nav?(nav.cache?this.initNavId(this.storage.load({name:'navId',def:this.initNavId()})):this.initNavId()):false
    this.state = {
      navId,
      splash,
      showSplash: true,
      confirm: false,
      touch,
      changeTheme: (index) => {
        let { themes } = props;
        this.theme = this.theme || 0;
        if (index === 'init') {
          this.theme = this.storage.load({ name: 'theme', value: 0 });
        }
        else if (typeof (index) === 'number') {
          this.theme = index;
        }
        else {
          this.theme++;
        }
        this.storage.save({ value: this.theme, name: 'theme' });
        if (this.theme > themes.length - 1) { this.theme = 0 }
        let target;
        try {
          target = themes[this.theme] || {};
        }
        catch { target = {} }
        for (let prop in target) {
          document.documentElement.style.setProperty(prop, target[prop]);
        }

      },
      openSide:this.openSide.bind(this),
      closeSide:this.closeSide.bind(this),
      setNavId: this.setNavId.bind(this),
      getNavId:this.getNavId.bind(this)
    }
    if (props.themes) { this.state.changeTheme('init') }
    if (splash) { setTimeout(() => this.setState({ splash: false }), splashTime) }
    props.getActions({ ...this.state })
  }
  getNavId(){return this.state.navId}
  setNavId(navId){
    let {nav} = this.props;
    if(nav.cache){this.storage.save({name:'navId',value:navId})}
    this.setState({navId})
  }
  initNavId(id) {
    let { nav } = this.props;
    if (!nav) { return false }
    this.navItems = typeof nav.items === 'function'?nav.items():nav.items;
    if (id) {
      let res = this.getNavById(id);
      if (res !== false) { return id }
    }
    if (nav.id) {
      let res = this.getNavById(nav.id);
      if (res !== false) { return nav.id }
    }
    if (!this.navItems && !this.navItems.length) { return false }
    return this.navItems.filter(({ show = () => true }) => show())[0].id;
  }
  header_layout(activeNav) {
    let { header} = this.props;
    let Header = typeof header === 'function'?header():header;
    if (Header === false) { return false }
    if(Header){return {style: { flex: 'none', width: '100%' }, align: 'v', className: 'rsa-header of-visible',html: Header}}
    let { headerContent, side, title = () => activeNav?activeNav.text:'' ,subtitle = ()=>{}} = this.props;
    let Title = title(activeNav);
    let Subtitle = subtitle(activeNav);
    if(!Title && !side && !headerContent){return false}
    return {
      style: { flex: 'none', width: '100%' }, align: 'v', className: 'rsa-header of-visible',
      row: [
        { size: 60, show: !!side, html: <Icon path={mdiMenu} size={1} />, align: 'vh', attrs: { onClick: () => this.openSide() } },
        {
          show: !!Title,
          column:[
            {  html: Title, className: 'rsa-header-title' },
            {  show:!!Subtitle,html: Subtitle, className: 'rsa-header-subtitle' }
          ]
        },
        {show:!!title || !!side ,flex:1},
        { flex: !!title || !!side?undefined:1, show: !!headerContent, html: () => headerContent({...this.state}), className: 'of-visible' },
      ]
    }
  }
  getNavById(id) {
    this.res = false;
    this.getNavById_req(this.navItems, id);
    return this.res;
  }
  getNavById_req(items, id) {
    if (this.res) { return; }
    for (let i = 0; i < items.length; i++) {
      if (this.res) { return; }
      let item = items[i];
      let { show = () => true } = item;
      if (!show()) { continue }
      if (item.id === id) { this.res = item; break; }
      let navItems = typeof item.items === 'function'?item.items():item.items
      if (navItems) { 
        this.getNavById_req(navItems, id); 
      }
    }
  }
  getMainClassName() {
    let { rtl, className: cls } = this.props;
    let className = 'rsa-main';
    className += cls ? ' ' + cls : '';
    className += rtl ? ' rtl' : ' ltr';
    return className;
  }
  navigation_layout(type) {
    let { nav,rtl } = this.props;
    if (!nav || !this.navItems || !this.navItems.length) { return false }
    let { navId } = this.state;
    let props = { nav, navId, setNavId: (navId) => this.setNavId(navId), type, rtl }
    return { className: 'of-visible', html: (<Navigation {...props} navItems={this.navItems}/>) };
  }
  page_layout({render}) {
    let { body = () => '' } = this.props;
    let {navId} = this.state;
    let content = body({...this.state,render});
    let activeNav = this.getNavById(navId);
    return {
      flex: 1,
      column: [
        this.header_layout(activeNav),
        { flex: 1, html: <div className='rsa-body'>{content}</div> },
        this.navigation_layout('bottom')
      ]
    }
  }

  renderMain() {
    let { navId } = this.state;
    let { nav, style } = this.props;
    this.navItems = typeof nav.items === 'function'?nav.items():nav.items
    let navItem = nav ? this.getNavById(navId) : false;
    let layout = { style, className: this.getMainClassName() }
    layout.row = [this.navigation_layout('side'), this.page_layout(navItem)]
    return (<RVD layout={layout} />)
  }
  openSide() {
    let { popup, rtl } = this.props;
    popup.addModal({
      position: rtl ? 'right' : 'left', id: 'rsadefaultsidemodal',
      backdrop:{attrs:{className:'rsa-sidemenu-backdrop'}},
      body: { render: ({ close }) => this.renderSide(close) },
    })
  }
  closeSide(){
    let { popup } = this.props;
    popup.removeModal('rsadefaultsidemodal')
  }
  renderSide(close) {
    let { side = {}, rtl } = this.props;
    let items = typeof side.items === 'function'?side.items():side.items;
    return <SideMenu {...side} items={items} rtl={rtl} onClose={() => close()} />
  }
  render() {
    let { splash } = this.state;
    let { style, className, maxWidth, popup,rtl } = this.props;
    return (
      <div className={`rsa-container` + (className ? ' ' + className : '')} style={{...style,direction:rtl?'rtl':'ltr'}}>
        <div className='rsa' style={{ maxWidth }}>
          {this.renderMain()}
          {popup.render()}
          {splash && splash()}
        </div>
      </div>
    );
  }
}
class Navigation extends Component {
  state = { openDic: {} }
  header_layout() {
    let { nav } = this.props;
    if (!nav.header) { return { size: 12 } }
    return { html: nav.header() };
  }
  footer_layout() {
    let { nav } = this.props;
    if (!nav.footer) { return { size: 12 } }
    return { html: nav.footer() };
  }
  items_layout(navItems, level) {
    return {
      flex: 1, className: 'ofy-auto',
      column: navItems.filter(({ show = () => true }) => show()).map((o, i) => {
        if (o.items) {
          let { openDic } = this.state;
          let open = openDic[o.id] === undefined ? true : openDic[o.id]
          let column = [this.item_layout(o, level)]
          if (open) { column.push(this.items_layout(o.items, level + 1)) }
          return { column }
        }
        return this.item_layout(o, level)
      })
    }
  }
  toggle(id) {
    let { openDic } = this.state;
    let open = openDic[id] === undefined ? true : openDic[id]
    this.setState({ openDic: { ...openDic, [id]: !open } })
  }
  text_layout({text,marquee},type) {
    text = typeof text === 'function' ? text() : text; 
    let html;
    if (!marquee) { html = text }
    else {
      html = <marquee behavior='scroll' scrollamount={3} direction='right'>{text}</marquee>
    }
    if(type === 'side'){return { html, align: 'v' }}
    if(type === 'bottom'){return { html, align: 'vh', className: 'rsa-bottom-menu-item-text' }}
  }
  item_layout(o, level = 0) {
    let { setNavId, navId, rtl } = this.props;
    let { openDic } = this.state;
    let { id, icon, items } = o;
    let active = id === navId;
    let open = openDic[id] === undefined ? true : openDic[id]
    return {
      className: 'rsa-navigation-item' + (active ? ' active' : ''), attrs: { onClick: () => items ? this.toggle(id) : setNavId(id) },
      row: [
        { size: level * 16 },
        { size: 24, html: items ? <Icon path={open ? mdiChevronDown : (rtl ? mdiChevronLeft : mdiChevronRight)} size={1} /> : '', align: 'vh' },
        { show: !!icon, size: 48, html: () => typeof icon === 'function' ? icon(active) : icon, align: 'vh' },
        this.text_layout(o,'side')
      ]
    }
  }
  bottomMenu_layout(o) {
    let { icon, id } = o;
    let { navId, setNavId } = this.props;
    let active = id === navId;
    return {
      flex: 1, className: 'rsa-bottom-menu-item of-visible' + (active ? ' active' : ''), attrs: { onClick: () => setNavId(id) },
      column: [
        { show: !icon,flex: 1 },
        { show: !!icon,flex: 2 },
        { show: !!icon, html: () => typeof icon === 'function' ? icon(active) : icon, align: 'vh', className: 'of-visible' },
        { show: !!icon,flex: 1 },
        this.text_layout(o,'bottom'),
        { flex: 1 }
      ]
    }
  }
  render() {
    let { type, navItems } = this.props;
    if (type === 'bottom') {
      return (<RVD layout={{ className: 'rsa-bottom-menu', hide_sm: true, hide_md: true, hide_lg: true, row: navItems.filter(({ show = () => true }) => show()).map((o) => this.bottomMenu_layout(o)) }} />)
    }
    return (<RVD layout={{ hide_xs: true, className: 'rsa-navigation', column: [this.header_layout(), this.items_layout(navItems, 0),this.footer_layout()] }} />);
  }
}
class SideMenu extends Component {
  header_layout() {
    let { header } = this.props;
    if (!header) { return false }
    return { html: header(), className: 'rsa-sidemenu-header' };
  }
  items_layout() {
    let { items, onClose } = this.props;
    return {
      flex: 1,
      column: items.map((o, i) => {
        let { icon = () => <div style={{ width: 12 }}></div>, text, attrs = {}, onClick = () => { }, show = () => true } = o;
        let Show = show();
        return {
          style:attrs.style,
          show: Show !== false, size: 36, className: 'rsa-sidemenu-item' + (attrs.className ? ' ' + attrs.className : ''), onClick: () => { onClick(o); onClose() },
          row: [
            { size: 48, html: typeof icon === 'function'?icon():icon, align: 'vh' },
            { html: text, align: 'v' }
          ]
        }
      })
    }
  }
  footer_layout() {
    let { footer } = this.props;
    if (!footer) { return false }
    return { html: footer(), className: 'rsa-sidemenu-footer' };
  }
  componentDidMount() {
    setTimeout(() => this.setState({ open: true }), 0)
  }
  render() {
    let { attrs = {} } = this.props;
    return (
      <RVD
        layout={{
          attrs,
          className: 'rsa-sidemenu' + (attrs.className ? ' ' + attrs.className : ''),
          column: [this.header_layout(), this.items_layout(), this.footer_layout()]
        }}
      />
    );
  }
}
const RSANavInterface = `
{
  id?:string,
  items:[],
  header?:()=>React.ReactNode,
  footer?:()=>React.ReactNode,
  cache?:boolean
}
`
const RSANavItemInterface = `
{
  id:string,
  text:string | ()=>string,
  icon?:React.ReactNode || ()=>React.ReactNode,
  items?:[],
  show?:()=>boolean
}
`
function RSAValidate(props){
  let error = RSAValidateError(props);
  if(error){alert(error)}
}

function RSAValidateError(props){
  let validProps = ['id','rtl','title','nav','initialState','subtitle','AppContext','actions','body','header','headerContent','maxWidth','side']
  for(let prop in props){
    if(validProps.indexOf(prop) === -1){
      return `
        react-super-app error => invalid props (${prop}). 
        valid properties are 'id','rtl','title','nav','initialState','subtitle','AppContext','actions','body','header','headerContent','maxWidth','side'
      `
    }
  }
  if(props.initialState !== undefined && (typeof props.initialState !== 'object' || Array.isArray(props.initialState))){
    return `
        react-super-app error => initialState props should be an object. 
      `
  }
  if(props.actions !== undefined && (typeof props.actions !== 'object' || Array.isArray(props.actions))){
    return `
        react-super-app error => actions props should be an object. 
      `
  }
  if(props.rtl !== undefined && typeof props.rtl !== 'boolean'){
    return `
        react-super-app error => rtl props should be boolean. 
      `
  }
  if(!props.id || typeof props.id !== 'string'){
    return `
        react-super-app error => id props should be an string but is ${props.id}. 
      `
  }
  if(props.title !== undefined && typeof props.title !== 'function'){
    return `
        react-super-app error => title props should be a functon that get nav item as parameter and returns string. 
      `
  }
  if(props.subtitle !== undefined && typeof props.subtitle !== 'function'){
    return `
        react-super-app error => subtitle props should be a functon that get nav item as parameter and returns string. 
      `
  }
  if(props.headerContent !== undefined && typeof props.headerContent !== 'function'){
    return `
      react-super-app error => headerContent props should be a functon that returns html. 
    `
  }
  if(typeof props.body !== 'function'){
    return `
        react-super-app error => body props should be a funtion that returns html. 
      `
  }
  let navError = RSAValidateNav(props.nav)
  if(navError){return navError}
  let sideError = RSAValidateSide(props.side)
  if(sideError){return sideError}

}
function RSAValidateSide(side){
  //type I_Sidemenu_props = {items:I_SideMenu_props_item[],header:()=>React.ReactNode,footer:()=>React.ReactNode,attrs:object}
//type I_SideMene_props_item = {icon?:React.ReactNode | ()=>React.ReactNode,text:String,className?:String,style?:Object,onClick?:()=>void,show?:()=>boolean}
  if(!side){return}
  let side_validProps = ['items','header','footer','attrs']
  for(let prop in side){
    if(side_validProps.indexOf(prop) === -1){
      return `
        react-super-app error => invalid side property (${prop}). 
        valid nav properties are 'items','header','footer','attrs'
      `
    }
  }
  let sideItemError = 'each side item should be an object cointan {icon?:React.ReactNode | ()=>React.ReactNode,text:String,attrs?:object,show?:()=>boolean,onClick:function|undefined}'
  if(!side.items || (!Array.isArray(side.items) && typeof side.items !== 'function')){
    return `
      react-super-app error => side.items should be an array of objects or function that returns array of objects 
      ${sideItemError}
    `
  }
  for(let i = 0; i < side.items.length; i++){
    let item = side.items[i];
    let {text,show = ()=>true,attrs = {}} = item;
    let sideItem_validProps = ['text','icon','attrs','show','onClick']
    for(let prop in item){
      if(sideItem_validProps.indexOf(prop) === -1){
        return `
          react-super-app error => side.items[${i}].${prop} is not a valid side item property.
          ${sideItemError}
        `
      }
    }
    if(typeof show !== 'function'){
      return `
        react-super-app error => side.items[${i}].show should be a function that returns boolean.
        ${sideItemError}
      `
    }
    if(typeof attrs !== 'object' || Array.isArray(attrs)){
      return `
        react-super-app error => side.items[${i}].attrs should be an object contain dom attributes.
        ${sideItemError}
      `
    }
    if(!text || typeof text !== 'string'){return `react-super-app error => side.items[${i}].text should be an string`}
  }
}
function RSAValidateNav(nav){
  if(typeof nav !== 'object' || Array.isArray(nav)){
    return `
      react-super-app error => nav props should be an object contain ${RSANavInterface}.
      each nav item should be an object contain ${RSANavItemInterface}
    `
  }
  let nav_validProps = ['id','items','header','footer','cache']
  for(let prop in nav){
    if(nav_validProps.indexOf(prop) === -1){
      return `
        react-super-app error => invalid nav property (${prop}). 
        valid nav properties are 'id','items','header','footer','cache'
      `
    }
  }
  if(nav.id && typeof nav.id !== 'string'){return `react-super-app error => exist nav.id should be an string`}
  if(!nav.items || (!Array.isArray(nav.items) && typeof nav.items !== 'function')){return `
    react-super-app error => nav.items should be an array or function.
  `}
  let itemsError = RSAValidateNavItems(nav.items)
  if(itemsError){return itemsError}
}
function RSAValidateNavItems(items = [],path = 'nav'){
  let navItemError = `
    nav item should be an object contain 
    ${RSANavItemInterface}
  `
  for(let i = 0; i < items.length; i++){
    let item = items[i];
    let {id,text,show = ()=>true,render} = item;
    let usedIds = [];
    let navItem_validProps = ['id','items','icon','show','text','render']
    for(let prop in item){
      if(navItem_validProps.indexOf(prop) === -1){
        return `
          react-super-app error => ${path}.items[${i}].${prop} is not a valid nav item property.
          ${navItemError}
        `
      }
    }
    if(render && typeof render !== 'function'){
      return `
        react-super-app error => ${path}.items[${i}].render should be a function that returns html.
        ${navItemError}
      `
    }
    if(typeof show !== 'function'){
      return `
        react-super-app error => ${path}.items[${i}].show should be a function that returns boolean.
        ${navItemError}
      `
    }
    if(!id || typeof id !== 'string'){
      return `
        react-super-app error => ${path}.items[${i}].id should be an string.
        ${navItemError}
      `
    }
    if(usedIds.indexOf(id) !== -1){
      return `
        react-super-app error => ${path}.items[${i}].id is duplicate.
        ${navItemError}
      `
    }
    usedIds.push(item.id)
    if(!text || typeof text !== 'string'){return `react-super-app error => ${path}.items[${i}].text should be an string`}
    let itemsError = RSAValidateNavItems(item.items,path + `.items[${i}]`);
    if(itemsError){return itemsError}
  }
}