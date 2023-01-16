import React,{Component,createRef} from 'react';
import AIOButton from './../../npm/aio-button/aio-button';
import AIOStorage from './../../npm/aio-storage/aio-storage';
import {Icon} from '@mdi/react';
import {mdiMenu,mdiClose,mdiChevronRight,mdiChevronLeft,mdiCheckCircleOutline,mdiAlertOutline,mdiInformationOutline, mdiChevronDown} from '@mdi/js';
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import $ from 'jquery';
import './index.css';

export default class ReactSuperApp extends Component {
    constructor(props){
      super(props);
      let {touch = 'ontouchstart' in document.documentElement,splash,splashTime = 7000} = props;
      this.storage = AIOStorage('rsa-cache')
      this.state = {
        navId:this.getNavId(),
        splash,
        showSplash:true,
        confirm:false,
        touch,
        popups:[],
        sideOpen:false,
        addPopup:(o)=>{
          let {popups} = this.state;
          if(o.id){//agar popup ba in id baz hast oon ro beband ke tekrari popup add nashe
            popups = popups.filter(({id})=>id !== o.id);
            this.state.popups = popups;
          }
          this.setState({popups:popups.concat(o)})
        },
        removePopup:(id)=>{
          let {popups} = this.state;
          if(id === undefined){popups.pop();}
          else if(id === 'all'){
            this.state.popups = [];
            popups = [];
          }
          else{popups = popups.filter((o)=>o.id !== id);}
          this.setState({popups})
        },
        changeTheme:(index)=>{
          let {themes} = props;
          this.theme = this.theme || 0;
          if(index === 'init'){
            this.theme = this.storage.load('theme',0);
          }
          else if(typeof(index) === 'number'){
            this.theme = index;
          }
          else {
            this.theme++;
          }
          this.storage.save(this.theme,'theme');
          if(this.theme > themes.length - 1){this.theme = 0}
          let target;
          try{
            target = themes[this.theme] || {};
          }
          catch{target = {}}
          for(let prop in target){
            document.documentElement.style.setProperty(prop, target[prop]);
          }
          
        },
        setConfirm:this.setConfirm.bind(this),
        setNavId:(navId)=>this.setState({navId})
      }
      if(props.themes){this.state.changeTheme('init')}
      if(splash){setTimeout(()=>this.setState({splash:false}),splashTime)}
      if(props.getActions){props.getActions({...this.state})}
    }
    setConfirm(obj){
      let confirm;
      let {type} = obj;
      if(type){
        let {text,subtext} = obj;
        let path,color;
        if(type === 'success'){path = mdiCheckCircleOutline; color = 'green';}
        else if(type === 'error'){path = mdiClose; color = 'red';}
        else if(type === 'warning'){path = mdiAlertOutline; color = 'orange';}
        else if(type === 'info'){path = mdiInformationOutline; color = 'dodgerblue';}
        let body = (
          <RVD
            layout={{
              column:[
                {size:12},
                {html:<Icon path={path} size={2}/>,style:{color},align:'vh'},
                {size:12},
                {html:text,style:{color},align:'vh'},
                {size:12},
                {html:subtext,align:'vh',className:'fs-10'}
              ]
            }}
          />
        )
        confirm = {text:body,style:{height:'fit-content',width:360},buttons:[{text:'بستن'}],backClose:true}
      }
      else{confirm = obj;}
      this.setState({confirm})
    }
    getNavId(){
      let {navs,navId} = this.props;
      if(!navs){return false}
      if(navId){
        let res = this.getNavById(navId);
        if(res !== false){return navId}
      }
      if(!navs.length){return false}
      return navs[0].id;
    }
    header_layout(nav){
        let {header,sides = [],title = ()=>nav.text} = this.props;
        if(header === false){return false}
        return {
          style:{flex:'none'},align:'v',className:'rsa-header',
          row:[
            {size:60,show:!!sides.length,html:<Icon path={mdiMenu} size={1}/>,align:'vh',attrs:{onClick:()=>this.setState({sideOpen:!this.state.sideOpen})}},
            {show:!sides.length,size:24},
            {flex:1,html:title(nav),className:'rsa-header-title'},
            {show:!!header,html:()=>header(this.state)},
          ]
        }
    }
    getNavById(id){
      let {navs} = this.props;
      this.res = false;
      this.getNavById_req(navs,id);
      return this.res;
    }
    getNavById_req(navs,id){
        if(this.res){return;}
        for(let i = 0; i < navs.length; i++){
            if(this.res){return;}
            let nav = navs[i];
            let {show = ()=>true} = nav;
            if(!show()){continue}
            if(nav.id === id){this.res = nav; break;}
            if(nav.navs){this.getNavById_req(nav.navs,id);}
        }
    }
    getMainClassName(){
      let {confirm,popups,sideOpen} = this.state;
      let {rtl,className:cls} = this.props;
      let className = 'rsa-main';
      className += cls?' ' + cls:'';
      className += rtl?' rtl':' ltr';
      if(confirm || popups.length || sideOpen){className += ' rsa-blur'}
      return className;
    }
    navigation_layout(type) {
      let {navs = [],navHeader,rtl} = this.props;
      if(!navs.length){return false}
      let {navId} = this.state;
      let props = {navs,navHeader,navId,onChange:(navId)=>this.setState({navId}),type,rtl}
      return {className:'of-visible',html: (<Navigation {...props}/>)};
    }
    page_layout(nav){
      let {body = ()=>''} = this.props;
      return {
        flex:1,
        column:[
          this.header_layout(nav),
          {flex:1,html:<div className='rsa-body'>{body(this.state)}</div>},
          this.navigation_layout('bottom')
        ]
      } 
    }
    
    renderMain(){
      let {navId} = this.state;
      let {navs,style} = this.props;
      let nav = navs?this.getNavById(navId):false;
      let layout = {style,className: this.getMainClassName()}
      layout.row = [this.navigation_layout('side'),this.page_layout(nav)]
      return (<RVD layout={layout}/>)
    }
    renderPopups(){
      let {popups,removePopup,confirm} = this.state;
      let {rtl,popupConfig = {}} = this.props;
      if(!popups.length){return null}
      return popups.map((o,i)=>{
        return <Popup key={i} blur={confirm || i === popups.length - 2} {...popupConfig} {...o} index={i} removePopup={()=>removePopup()} rtl={rtl}/>
      })
    }
    render() {
      let {confirm,sideOpen,splash} = this.state;
      let {sides = [],sideId,rtl,sideHeader,sideFooter,sideClassName} = this.props;
      return (
        <div className='rsa-container'>
          <div className='rsa'>
            {this.renderMain()},
            {this.renderPopups()}
            {confirm && <Confirm {...confirm} rtl={rtl} onClose={()=>this.setState({confirm:false})}/>}
            {sides.length && <SideMenu className={sideClassName} sideHeader={sideHeader} sideFooter={sideFooter} sides={sides} sideId={sideId} sideOpen={sideOpen} rtl={rtl} onClose={()=>this.setState({sideOpen:false})}/>}
            {splash && splash()}
          </div>
        </div>
      );
    }
  }
  class Navigation extends Component {
    state = {openDic:{}}
    header_layout() {
      let {navHeader} = this.props;
      if(!navHeader){return {size:12}}
      return {html: navHeader()};
    }
    items_layout(navs,level){
      return {
        flex:1,className:'ofy-auto',
        column:navs.filter(({show = ()=>true})=>show()).map((o,i)=>{
          if(o.navs){
            let {openDic} = this.state;
            let open = openDic[o.id] === undefined?true:openDic[o.id]
            let column = [this.item_layout(o,level)]
            if(open){column.push(this.items_layout(o.navs,level + 1))}
            return {gap:12,column}
          }
          return this.item_layout(o,level)
        })
      }
    }
    toggle(id){
      let {openDic} = this.state;
      let open = openDic[id] === undefined?true:openDic[id]
      this.setState({openDic:{...openDic,[id]:!open}})
    }
    item_layout(o,level = 0){
      let {onChange,navId,rtl} = this.props;
      let {openDic} = this.state;
      let {id,icon,navs} = o;
      let text = typeof o.text === 'function'?o.text():o.text;
      let active = id === navId;
      let open = openDic[id] === undefined?true:openDic[id]
      return {
        className:'rsa-navigation-item' + (active?' active':''),attrs:{onClick:()=>navs?this.toggle(id):onChange(id)},
        row:[
          {size:level * 16},
          {show:navs!== undefined,size:24,html:navs?<Icon path={open?mdiChevronDown:(rtl?mdiChevronLeft:mdiChevronRight)} size={1}/>:'',align:'vh'},
          {show:!!icon,size:48,html:()=>icon(active),align:'vh'},
          {html:text,align:'v'}
        ]
      }
    }
    bottomMenu_layout({icon,text,id}){
      let {navId,onChange} = this.props;
      let active = id === navId;
      return {
          flex:1,className:'rsa-bottom-menu-item' + (active?' active':''),attrs:{onClick:()=>onChange(id)},
          column:[
            {flex:2},
            {show:!!icon,html:()=>icon(active),align:'vh'},
            {flex:1},
            {html:text,align:'vh',className:'rsa-bottom-menu-item-text'},
            {flex:1}
          ]
      }
    }
    render() {
      let {type,navs} = this.props;
      if(type === 'bottom'){
        return (<RVD layout={{className: 'rsa-bottom-menu',hide_sm:true,hide_md:true,hide_lg:true,row: navs.map((o)=>this.bottomMenu_layout(o))}}/>)
      }
      return (<RVD layout={{hide_xs:true,className: 'rsa-navigation',column: [this.header_layout(),this.items_layout(navs,0)]}}/>);
    }
  }
  class SideMenu extends Component {
    header_layout() {
      let {sideHeader} = this.props;
      if(!sideHeader){return false}
      return {html: sideHeader(),className:'rsa-sidemenu-header'};
    }
    items_layout(){
      let {sides,sideId,onClose} = this.props;
      return {
        flex:1,gap:12,
        column:sides.map((o,i)=>{
          let {icon = ()=><div style={{width:12}}></div>,text,id,className,onClick = ()=>{},show = ()=>true} = o;
          let Show = show();
          let active = id === sideId;
          return {
            show:Show !== false,size:36,className:'rsa-sidemenu-item' + (active?' active':'') + (className?' ' + className:''),attrs:{onClick:()=>{onClick(o); onClose()}},
            row:[
              {size:48,html:icon(active),align:'vh'},
              {html:text,align:'v'}
            ]
          }
        })
      }
    }
    footer_layout(){
      let {sideFooter} = this.props;
      if(!sideFooter){return false}
      return {html: sideFooter(),className:'rsa-sidemenu-footer'};
    }
    componentDidMount(){
      setTimeout(()=>this.setState({open:true}),0)  
    }
    render() {
      let {onClose,rtl,sideOpen,className} = this.props;
      return (
          <RVD 
            layout={{
              className: 'rsa-sidemenu-container' + (sideOpen?' open':'') + (rtl?' rtl':' ltr') + (className?' ' + className:''),
              row:[
                {className: 'rsa-sidemenu',column: [this.header_layout(),this.items_layout(),this.footer_layout()]},
                {flex:1,attrs:{onClick:()=>onClose()}}
              ]
            }} 
          />
      );
    }
  }
  export function splitNumber(price,count = 3,splitter = ','){
    if(!price){return price}
    let str = price.toString()
    let dotIndex = str.indexOf('.');
    if(dotIndex !== -1){
        str = str.slice(0,dotIndex)
    }
    let res = ''
    let index = 0;
    for(let i = str.length - 1; i >= 0; i--){
        res = str[i] + res;
        if(index === count - 1){
            index = 0;
            if(i > 0){res = splitter + res;}
        }
        else{index++}
    }
    return res
  }
//tabs,body,onClose,title
class Popup extends Component{
    constructor(props){
      super(props);
      this.dom = createRef();
      this.state = {activeTabIndex:0};
      this.dui = 'a' + Math.random()

    }
    async onClose(){
      let {removePopup,onClose} = this.props;
      $(this.dom.current).animate({left:'50%',top:'100%',height:'0%',width:'0%',opacity:0}, 300,async ()=>{
        if(onClose){
          let res = await onClose();
          if(res === false){return}
          removePopup()
        }
        else{removePopup()}
      });
      
    }
    header_layout(){
      let {onClose = ()=>this.onClose(),title,header,rtl,closeType = 'close button'} = this.props;
      if(header === false){return false}
      return {
        size:48,className:'rsa-popup-header',
        row:[
          {show:closeType === 'back button' && onClose !== false,html:<Icon path={rtl?mdiChevronRight:mdiChevronLeft} size={1}/>,align:'vh',attrs:{onClick:()=>onClose()}},
          {show:closeType === 'back button' && onClose !== false,size:6},
          {flex:1,html:title,align:'v',className:'rsa-popup-title'},
          {show:!!header,html:()=><div style={{display:'flex',alignItems:'center'}}>{header()}</div>},
          {show:closeType === 'close button' && onClose !== false,size:36,html:<Icon path={mdiClose} size={0.8}/>,align:'vh',attrs:{onClick:()=>onClose()}}
        ]
      }
    }
    body_layout(){return {flex:1,column:[this.tabs_layout(),this.body_layout()]}}
    tabs_layout(){
      let {tabs} = this.props;
      if(!tabs){return false}
      let {activeTabIndex} = this.state;
      return {html:(<AIOButton type='tabs' options={tabs.map((o,i)=>{return {text:o,value:i}})} value={activeTabIndex} onChange={(activeTabIndex)=>this.setState({activeTabIndex})}/>)}
    }
    body_layout(){
      let {tabs,body} = this.props;
      let content;
      if(tabs){
        let {activeTabIndex} = this.state;
        content = body(activeTabIndex)
      }
      else {content = body()}
      if(content === 'loading'){return {flex:1,html:'در حال بارگزاری',align:'vh'}}
      if(content === 'empty'){return {flex:1,html:'موردی موجود نیست',align:'vh'}}
      return {flex:1,html:<div className='rsa-popup-body'>{content}</div>}
    }
    getClassName(){
      let {type,blur,className:cls} = this.props;
      let className = 'rsa-popup-container';
      if(cls){className += className?(' ' + cls):''}
      if(blur){className += ' rsa-blur'}
      if(type === 'fullscreen'){className += ' fullscreen'}
      if(type === 'bottom'){className += ' bottom-popup'}
      return className
    }
    backClick(e){
      let target = $(e.target);
      if(target.hasClass(this.dui)){return}
      let parents = target.parents('.rsa-popup');
      if(parents.hasClass(this.dui)){return}
      let {removePopup,onClose = ()=>removePopup(),backClose} = this.props;
      if(onClose === false){return}
      if(!backClose){return}
      onClose();
    }
    componentDidMount(){
      $(this.dom.current).animate({height: '100%',width: '100%',left:'0%',top:'0%',opacity:1}, 300);
    }
    render(){
      let {rtl,style} = this.props;
      return (  
        <div ref={this.dom} className={this.getClassName()} onClick={(e)=>this.backClick(e)} style={{
          left:'50%',top:'100%',height:'0%',width:'0%',opacity:0
        }}>
          <RVD 
            layout={{
              className:'rsa-popup' + (rtl?' rtl':' ltr') + (' ' + this.dui),
              style:{flex:'none',...style},
              column:[this.header_layout(),this.body_layout()]
            }}
          />  
        </div>
      )
    }
  }


  export class Confirm extends Component{
    constructor(props){
      super(props);
      this.dui = 'a' + Math.random();
    }
    header_layout(){
      let {onClose,title} = this.props;
      if(!title){return false}
      return {
        size:48,className:'rsa-popup-header',
        row:[
          {flex:1,html:title,align:'v',className:'rsa-popup-title'},
          {size:48,html:<Icon path={mdiClose} size={0.8}/>,align:'vh',attrs:{onClick:()=>onClose()}}
        ]
      }
    }
    body_layout(){
      let {text} = this.props;
      return {flex:1,html:text,className:'rsa-popup-body ofy-auto'}
    }
    onSubmit(){
      let {onClose,onSubmit} = this.props;
      onSubmit();
      onClose();
    }
    footer_layout(){
      let {buttons,onClose=()=>{}} = this.props;
      return {
        gap:12,
        size:48,
        align:'v',
        style:{padding:'0 12px'},
        className:'rsa-confirm-footer',
        row:buttons.map(({text,onClick = ()=>{}})=>{
          return {html:(
            <button 
              className='rsa-popup-footer-button' 
              onClick={()=>{onClick(); onClose()}}
            >{text}</button>
          )}
        }) 
      }
    }
    backClick(e){
      let {onClose,backClose} = this.props;
      if(!backClose){return}
      let target = $(e.target);
      if(target.hasClass(this.dui)){return}
      let parents = target.parents('.rsa-popup');
      if(parents.hasClass(this.dui)){return}
      
      onClose();
    }
    render(){
      let {style = {width:400,height:300},rtl} = this.props;
      return (  
        <div className='rsa-popup-container' onClick={(e)=>this.backClick(e)}>
          <RVD layout={{className:'rsa-popup rsa-confirm' + (' ' + this.dui),style:{flex:'none',direction:rtl?'rtl':'ltr',...style},column:[this.header_layout(),this.body_layout(),this.footer_layout()]}}/>  
        </div>
      )
    }
  }