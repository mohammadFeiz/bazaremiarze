import React,{Component,createRef,createContext} from 'react';
import $ from 'jquery'
import './index.css';
let aioButtonContext = createContext();
let ABCLS = {
  button:'aio-button',radio:'aio-button-radio',tabs:'aio-button-tabs',option:'aio-button-option',options:'aio-button-options',
  tags:'aio-button-tags',tag:'aio-button-tag',tagIcon:'aio-button-tag-icon',tagText:'aio-button-tag-text',
  open:'aio-button-open',radioOption:'aio-button-radio-option',tabsOption:'aio-button-tabs-option',
  checkbox:'aio-button-checkbox',text:'aio-button-text',hasSubtext:'aio-button-has-subtext',subtext:'aio-button-subtext',
  gap:'aio-button-gap',caret:'aio-button-caret',badge:'aio-button-badge',search:'aio-button-search',searchIcon:'aio-button-icon',
  add:'aio-button-add',popup:'aio-button-popup',popupContainer:'aio-button-popup-container',multiselect:'aio-button-multiselect',
  checkOut:'aio-button-check-out',checkIn:'aio-button-check-in',splitter:'aio-button-splitter'
}
class Radio extends Component {
  static contextType = aioButtonContext;
  render(){
    let {className,justify,rtl,style,gap,type} = this.context;
    var {options = [],attrs = {}} = this.props;
    return (
      <div 
        {...attrs} className={ABCLS.radio + (rtl?' rtl':'') + (className?' ' + className:'')} 
        style={{justifyContent:justify?'center':undefined,...style}}
      >
        {
          options.map((option,i)=>{
            return <Option key={i} {...option} renderIndex={i} gap={gap} rtl={rtl} type={type}/>
          })
        }
      </div>
    );
  }
}

class Tabs extends Component {
  static contextType = aioButtonContext;
  render(){
    let {className,rtl,style,gap,before,after} = this.context;
    var {options = [],attrs = {}} = this.props;
    return (
      <div 
        {...attrs} className={ABCLS.tabs + (rtl?' rtl':'') + (className?' ' + className:'')} 
        style={{...style}}
      >
        {before !== undefined && before}
        {
          options.map((option,i)=>{
            return <Option key={i} {...option} renderIndex={i} gap={gap} rtl={rtl}/>
          })
        }
        {after !== undefined && after}
      </div>
    );
  }
}


export default class AIOButton extends Component {
    constructor(props){
      super(props);
      this.dom = createRef()
      this.activeIndex = false;
      this.state = {open:this.props.open || false,touch:'ontouchstart' in document.documentElement}
    }
    getPropfromProps({option,index,field}){
    let prop = this.props['option' + field[0].toUpperCase() + field.slice(1,field.length)];
    let value;
    if(typeof prop === 'string'){try{ eval('value = ' + prop)} catch{value = undefined}}
    else if(typeof prop === 'function'){value = prop(option,index)}
    else if(prop !== undefined){value = prop}
    return value; 
  }
  getProp({option,index,field,def,type,readFrom}){
    if(readFrom !== 'props'){
      let optionResult = option[field];
      if(optionResult !== undefined){
        if(type){
          if(this.getType(optionResult) === type){return optionResult;}
        }
        else {return optionResult;}
      }
    }
    if(readFrom !== 'option'){
      let propsResult = this.getPropfromProps({option,index,field});
      if(propsResult !== undefined){
        if(type){
          if(this.getType(propsResult) === type){return propsResult;}
        }
        else {return propsResult;}
      }
    }
    return def;
  }
  getType(a){
      if(typeof a === 'object'){
        if(Array.isArray(a)){return 'array'}
        return 'object'
      }
      return typeof a;
    }
    dragStart(e){this.dragIndex = parseInt($(e.target).attr('datarealindex'));}
    dragOver(e){e.preventDefault();}
    drop(e){
      e.stopPropagation();
      let {onSwap} = this.props,from = this.dragIndex,dom = $(e.target);
      if(!dom.hasClass(ABCLS.option)){dom = dom.parents('.' + ABCLS.option);};
      if(!dom.hasClass(ABCLS.option)){return};
      let to = parseInt(dom.attr('datarealindex'));
      if(from === to){return}
      onSwap(from,to,this.swap)
    }
    swap(arr,from,to){
      if(to === from + 1){
        let a = to;
        to = from;
        from = a;
      }
      let Arr = arr.map((o,i)=>{o._testswapindex = i; return o})
      let fromIndex = Arr[from]._testswapindex
      Arr.splice(to,0,{...Arr[from],_testswapindex:false})
      return Arr.filter((o)=>o._testswapindex !== fromIndex) 
    }
    
    arrow(e,dom,dir){
      e.preventDefault();
      let options = dom.find('.' + ABCLS.option)
      let active = options.filter('.active');
      if(active.length === 0){
        let first = options.eq(0);
        let realIndex = +first.attr('datarealindex');
        let renderIndex = +first.attr('datarenderindex'); 
        this.activeIndex = {real:realIndex,render:renderIndex};
        first.addClass('active');
      }
      else{
        let renderIndex = +active.attr('datarenderindex');
        renderIndex += dir;
        if(dir === 1){if(renderIndex >= options.length){renderIndex = 0;}}
        else{if(renderIndex < 0){renderIndex = options.length - 1;}}
        options.removeClass('active');
        let activeOption = options.eq(renderIndex);
        let realIndex = +activeOption.attr('datarealindex')
        this.activeIndex = {real:realIndex,render:renderIndex};
        activeOption.addClass('active').focus();
      }
    }
    enter(e){
      if(this.activeIndex !== false){
        let props = this.options.filter((o)=>o.realIndex === this.activeIndex.real)[0]
        props.onClick()
        setTimeout(()=>{
          let dom = $(this.dom.current)
          dom.focus();
        },0)
      }
    }
    keyDown(e,dom){
      if(e.keyCode === 40){this.arrow(e,dom,1)}
      else if(e.keyCode === 38){this.arrow(e,dom,-1)}
      else if(e.keyCode === 13){this.enter(e)}
      else if(e.keyCode === 27){this.toggle()}
    }
    optionClick(option,realIndex){
      if(this.getProp({option,index:realIndex,field:'disabled'})){return;}
      if(option.onClick){option.onClick(option,realIndex);}
      else if(this.props.onClick){this.props.onClick(option);} 
      if(this.getProp({option,index:realIndex,field:'close',def:true}) !== false && this.getProp({option,index:realIndex,field:'checked',def:undefined}) === undefined ){this.toggle();}
    }
    onButtonClick(e){
      if($(e.target).parents('.' + ABCLS.tags).length !== 0){return;}
      var {options,popOver,onClick = ()=>{}} = this.props;
      if(options || popOver){this.toggle(true);}
      else{onClick(this.props);}
    }
    showPopup(open,options){
      let {popOver,type} = this.props;
      if(type === 'radio' || type === 'checkbox'){return false}
      if(!open){return false;}
      if(popOver){return true;}
      if(options && options.length){return true}
      return false
    }
    toggle(state,isBackdrop){
      let {open} = this.state;
      let {onBackdropClick,onToggle} = this.props;
      if(state === undefined){state = !open}
      clearTimeout(this.timeOut);
      this.timeOut = setTimeout(()=>{
        if(state === open){return}
        this.setState({open:state});
        if(state){$('body').addClass(ABCLS.open);}
        else{
          $('body').removeClass(ABCLS.open);
          setTimeout(()=>$(this.dom.current).focus(),0)
        }
        if(onBackdropClick && isBackdrop){onBackdropClick(this.props)}
        if(onToggle){onToggle(state)}
      },100)
    }
    getOptions(){
      let {options,type = 'button',text} = this.props;
      if(type === 'button' || type === 'checkbox'){return}
      if(type === 'select' && !this.state.open){return;}
      this.tags = [];
      this.text = undefined;
      let result = [];
      options = [...options];
      for(let realIndex = 0; realIndex < options.length; realIndex++){
        let option = options[realIndex];
        let value = this.getProp({option,index:realIndex,field:'value',def:undefined})
        let text = this.getProp({option,index:realIndex,field:'text',def:undefined});
        let checked,tagAttrs,className,before,after,close,tagBefore,active;
        if(type === 'select'){
          className = ABCLS.option;
          checked = this.getProp({option,index:realIndex,field:'checked',def:undefined});
          if(value !== undefined && value === this.props.value && this.text === undefined){this.text = text}
          before = this.getProp({option,index:realIndex,field:'before',def:undefined});
          after = this.getProp({option,index:realIndex,field:'after',def:undefined});
          close = this.getProp({option,index:realIndex,field:'close',def:checked === undefined});
        }
        else if(type === 'multiselect'){
          className = ABCLS.option;
          checked = (this.props.value || []).indexOf(value) !== -1
          tagAttrs = this.getProp({option,index:realIndex,field:'tagAttrs',def:tagAttrs});
          before = this.getProp({option,index:realIndex,field:'before',def:undefined});
          tagBefore = this.getProp({option,index:realIndex,field:'tagBefore',def:undefined});
          after = this.getProp({option,index:realIndex,field:'after',def:undefined});
          close = this.getProp({option,index:realIndex,field:'close',def:checked === undefined});
        }
        else if(type === 'radio'){
          className = ABCLS.radioOption;
          before = this.getProp({option,index:realIndex,field:'before',def:undefined});
          after = this.getProp({option,index:realIndex,field:'after',def:undefined});
          checked = this.props.value === value;
          close = false;
        }
        else if(type === 'tabs'){
          active = this.props.value === value;
          className = ABCLS.tabsOption + (active?' active':'');
          before = this.getProp({option,index:realIndex,field:'before',def:undefined});
          after = this.getProp({option,index:realIndex,field:'after',def:undefined});
          close = false;
        }
        let show = this.getProp({option,index:realIndex,field:'show',def:true})
        if(!show){continue}
        let checkIcon = this.getProp({option,index:realIndex,field:'checkIcon',def:undefined}); 
        let subtext = this.getProp({option,index:realIndex,field:'subtext',def:undefined});
        
        let disabled = this.getProp({option,index:realIndex,field:'disabled',def:false}) || this.props.disabled;
        let attrs = this.getProp({option,index:realIndex,field:'attrs',def:{}});
        let optionClassName = this.getProp({option,index:realIndex,field:'className',readFrom:'option',def:undefined});
        let propsClassName = this.getProp({option,index:realIndex,field:'className',readFrom:'props',def:undefined});
        if(optionClassName){className += ' ' + optionClassName}
        if(propsClassName){className += ' ' + propsClassName}
        if(disabled){className += ' disabled'}
        let optionStyle = this.getProp({option,index:realIndex,field:'style',readFrom:'option',def:{}});
        let propsStyle = this.getProp({option,index:realIndex,field:'style',readFrom:'props',def:{}});
        let style = {...propsStyle,...optionStyle};
        let props = {option,value,show,text,subtext,checked,close,before,after,disabled,attrs,className,style,realIndex,tagAttrs,checkIcon,tagBefore};
        props.onClick = ()=>{
          if(props.disabled){return}
          if(option.onClick){option.onClick(props)}
          else if(option.onChange){option.onChange(value,props)}
          else if(type === 'select' || type === 'radio' || type === 'tabs'){this.props.onChange(value,props)}
          else if(type === 'multiselect'){
            if(this.props.value.indexOf(value) === -1){
              this.props.onChange(this.props.value.concat(value),value,'add')
            }
            else{
              this.props.onChange(this.props.value.filter((o)=>o !== value),value,'remove')
            }
          }
          if(close && checked === undefined){this.toggle()}
        }
        result.push(props)
        if(type === 'multiselect' && checked){this.tags.push(props)}
      }
      return result;
    }
    getText(){
      let {type,text,options} = this.props;
      if(type === 'select'){
        if(text !== undefined && typeof text !== 'function'){return text}
        if(this.state.open){
          return typeof text === 'function'?text(this.text):(this.text === undefined?'':this.text);  
        }
        else{
          for(let i = 0; i < options.length; i++){
            let option = options[i];
            let show = this.getProp({option,index:i,field:'show',def:true})
            if(!show){continue}
            let option_value = this.getProp({option,index:i,field:'value',def:undefined})
            let option_text = this.getProp({option,index:i,field:'text',def:undefined});
            if(option_value !== undefined && option_value === this.props.value){return typeof text === 'function'?text(option_text):option_text}
          }
          return ''
        }
      }
      if(type === 'button'){return typeof text === 'function'?text():text}
      if(type === 'multiselect'){return typeof text === 'function'?text():text}
    }
    getSubtext(){
      let {type,subtext,value} = this.props;
      if(type === 'button'){return typeof subtext === 'function'?subtext():subtext}
      if(type === 'select'){return typeof subtext === 'function'?subtext(value):subtext}
      if(type === 'multiselect'){return typeof subtext === 'function'?subtext(value):subtext}
      
    }
    render(){
      let {type,popOver,caret,style} = this.props;
      let {open,touch} = this.state;
      let context = {
        ...this.props,touch,
        onButtonClick:this.onButtonClick.bind(this),
        toggle:this.toggle.bind(this),
        dragStart:this.dragStart.bind(this),
        dragOver:this.dragOver.bind(this),
        drop:this.drop.bind(this),
        keyDown:this.keyDown.bind(this)
      }
      let dataUniqId = 'aiobutton' + (Math.round(Math.random() * 10000000));
      let options = this.getOptions();
      this.options = options;
      let text = this.getText();
      let subtext = this.getSubtext();
      let show = typeof this.props.show === 'function'?this.props.show({options}):this.props.show;
      if(show === false){return null}
      return (
        <aioButtonContext.Provider value={context}>
            {type === 'multiselect' && <Multiselect dom={this.dom} dataUniqId={dataUniqId} tags={this.tags} text={text} subtext={subtext} caret={caret === undefined?true:caret} style={style}/>}
            {type === 'button' && <Button dom={this.dom} dataUniqId={dataUniqId} text={text} subtext={subtext} caret={caret === undefined?(popOver?true:false):caret}/>}
            {type === 'select' && <Button dom={this.dom} dataUniqId={dataUniqId} text={text} subtext={subtext} caret={caret === undefined?true:caret}/>}
            {(type === 'radio') && <Radio dom={this.dom} options={options}/>}
            {(type === 'tabs') && <Tabs dom={this.dom} options={options}/>}
            {type === 'checkbox' && <Checkbox dom={this.dom} {...this.props}/>}
            {this.showPopup(open,options) && <Popup dataUniqId={dataUniqId} options={options} type={type}/>}
        </aioButtonContext.Provider>
      );
    }    
}
AIOButton.defaultProps = {gap:6};
class Checkbox extends Component{
  getText(){
    let {text} = this.props;
    return typeof text === 'function'?text():text;
  }
  getSubtext(){
    let {subtext} = this.props;
    return typeof subtext === 'function'?subtext():subtext;
  }
  keyDown(e){
    let code = e.keyCode;
    let {disabled,onChange,value} = this.props;
    if(code === 13){
      if(!disabled){onChange(!!value,this.props)}
    }
  }
  render(){
    let {className,disabled,onChange,value,gap,rtl} = this.props;
    return (
      <Option
        {...this.props}
        attrs={{onKeyDown:(e)=>this.keyDown(e),...this.props.attrs}}
        onKeyDown={(e)=>this.keyDown(e)}
        gap={gap}
        rtl={rtl}
        text={this.getText()}
        subtext={this.getSubtext()}
        className={ABCLS.radioOption + ' ' + ABCLS.checkbox + (disabled?' disabled': '') + (className?' ' + className:'')}
        checked={!!value}
        onClick={()=>{if(!disabled){onChange(!!value,this.props)}}}
      />
    )
  }
}
class Button extends Component{
  static contextType = aioButtonContext;
  render(){
    let {onButtonClick,before,gap,attrs = {},rtl,caretAttrs,badge,badgeAttrs,after,disabled,className,style} = this.context;
    let {dataUniqId,text,subtext,caret,dom} = this.props;
    let props = {
      tabIndex:0,...attrs,style,onClick:onButtonClick,'data-uniq-id':dataUniqId,disabled,ref:dom,
      className:`${ABCLS.button} ${rtl?'rtl':'ltr'}${className?' ' + className:''}`,
    }
    return (
      <button {...props}>
        {before !== undefined && <Before before={before} gap={gap}/>} 
        {text !== undefined && <Text text={text} subtext={subtext}/>}
        {caret !== false && <Caret caret={caret} attrs={caretAttrs}/>} 
        {after !== undefined && <After after={after} gap={gap} caret={caret}/>} 
        {badge !== undefined && <Badge badge={badge} attrs={badgeAttrs}/>}
      </button>
    )
  }
}
function Text(props){
  return (
    <div className={ABCLS.text + (props.subtext?' ' + ABCLS.hasSubtext:'')}>
      {props.text !== undefined && props.text}
      {props.subtext !== undefined && <div className={ABCLS.subtext}>{props.subtext}</div>}  
    </div>
  )
}
function Before(props){return <>{props.before}<div className={ABCLS.gap} style={{width:props.gap}}></div></>}
function Caret(props){
  let {attrs = {}} = props
  let icon = props.caret === true?<div className={ABCLS.caret} {...attrs}></div>:props.caret;
  return (<><div style={{flex:1}}></div>{icon}</>)
}
function After(props){
  return (
    <>
      {!props.caret && <div style={{flex:1,minWidth:props.gap}}></div>}
      {props.caret && <div style={{width:props.gap}}></div>}
      {props.after}
    </>
  )
}
function Badge({badge,attrs = {}}){return <div {...attrs} className={ABCLS.badge + (attrs.className?' ' + attrs.className:'')}>{badge}</div>}
function SearchBox(props){
  return (
    <div className={ABCLS.search}>
      <input type='text' value={props.value} placeholder={props.placeholder} onChange={(e)=>props.onChange(e.target.value)}/>
      <div className={ABCLS.searchIcon} onClick={()=>{props.onChange('')}}>
        {
          props.value && 
          <svg viewBox="0 0 24 24" role="presentation" style={{width: '1.2rem',height: '1.2rem'}}><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" style={{fill: 'currentcolor'}}></path></svg>
        }
        {
          !props.value &&
          <svg viewBox="0 0 24 24" role="presentation" style={{width: '1.2rem',height: '1.2rem'}}><path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" style={{fill: 'currentcolor'}}></path></svg>
        }
      </div>
      
    </div>
  )
}
function AddBox(props){
  if(props.exact){return null}
  return (
    <div className={ABCLS.add} onClick={()=>{props.onClick()}}> 
      {props.placeholder}
    </div>
  )
}
class Popup extends Component{
  static contextType = aioButtonContext;
  constructor(props){
    super(props);
    this.dom = createRef();
    this.state = {searchValue:'',addValue:''};
  }
  componentDidMount(){
    this.update($(this.dom.current));
  }
  getLimit(dom){
    var offset = dom.offset();
    var left = offset.left - window.pageXOffset;
    var top = offset.top - window.pageYOffset;
    var width = dom.outerWidth();
    var height = dom.outerHeight();
    var right = left + width;
    var bottom = top + height;
    return {left,top,right,bottom,width,height};
  }
  update(popup){
      let {dataUniqId} = this.props;
      var {rtl,openRelatedTo,animate,popupWidth,popupAttrs = {},popupPosition} = this.context;
      var button = $(`.${ABCLS.button}[data-uniq-id = ${dataUniqId}]`);
      var parent = openRelatedTo?popup.parents(openRelatedTo):undefined;
      parent = Array.isArray(parent) && parent.length === 0?undefined:parent;
      var bodyWidth = window.innerWidth;
      var bodyHeight = window.innerHeight;
      var parentLimit = parent?this.getLimit(parent):{left:0,top:0,right:bodyWidth,bottom:bodyHeight};
      if(parentLimit.left < 0){parentLimit.left = 0;}
      if(parentLimit.right > bodyWidth){parentLimit.right = bodyWidth;}
      if(parentLimit.top < 0){parentLimit.top = 0;}
      if(parentLimit.bottom > bodyHeight){parentLimit.bottom = bodyHeight;}
      
      var buttonLimit = this.getLimit(button);
      var popupLimit = this.getLimit(popup); 
      var left,right,top,bottom,style = {};
      top = buttonLimit.bottom;
      bottom = top + popupLimit.height;  
      if(popupWidth){
        style.left = buttonLimit.left;
        style.width = popupWidth === 'fit'?buttonLimit.width:popupWidth;
      }
      else if(rtl){
        right = buttonLimit.right;
        left = right - popupLimit.width;
        if(left < parentLimit.left){style.left = parentLimit.left;}
        else{style.left = left;}
      }
      else{
        left = buttonLimit.left; 
        right = left + popupLimit.width;
        if(right > parentLimit.right){style.left = parentLimit.right - popupLimit.width;}
        else{style.left = left}
      }
      if(bottom > parentLimit.bottom){
        if(popupLimit.height > buttonLimit.top - parentLimit.top){style.top = parentLimit.bottom - popupLimit.height;}  
        else{style.top = buttonLimit.top - popupLimit.height;}
      }
      else{style.top = buttonLimit.bottom;}
      let attrsStyle = popupAttrs.style;
      if(animate){
        let a = {...style,...attrsStyle}
        let beforeTop = a.top + 90,afterTop = a.top,obj;
        if(animate === true){
          a.top = beforeTop; a.opacity = 0;
          obj = {top:afterTop,opacity:1}
        }
        else{obj = animate}
        popup.css(a)
        popup.animate(obj,{duration:100})
      }
      else{
        let a = {...style,...attrsStyle};
        popup.css(a)
      }
      popup.focus();
    }
  
  getOptions(){
    let {searchValue} = this.state;
    let {gap,dragStart,dragOver,drop,rtl,onSwap} = this.context;
    let {options,type} = this.props;
    let result = [];
    let exact = false;
    let renderIndex = 0;
    for(let i = 0; i < options.length; i++){
      let option = options[i];
      if(option.text === undefined){continue}
      if(searchValue && option.text.indexOf(searchValue) === -1){continue}
      if(option.text === searchValue){exact = true}
      result.push(<Option key={i} {...option} renderIndex={renderIndex} gap={gap} dragStart={dragStart} dragOver={dragOver} drop={drop} rtl={rtl} onSwap={onSwap} type={type}/>)
      renderIndex++;
    }
    this.exact = exact;
    return result;
  }
  renderPopOver(){return this.context.popOver?this.context.popOver(this.context,()=>this.context.toggle(false)):null}
  renderOptions(){
    let {popOver,searchText = 'Search',addText ='Add',search,popupHeader,popupFooter,onAdd} = this.context;
    let {searchValue} = this.state;
    if(popOver){return null}
    let options = this.getOptions();
    return (
      <>
        {popupHeader && popupHeader}
        {(searchValue !== '' || options.length > 10) && search !== false &&<SearchBox value={searchValue} onChange={(text)=>this.setState({searchValue:text})} placeholder={searchText}/>}
        {onAdd && searchValue && <AddBox value={searchValue} onClick={()=>onAdd(searchValue)} placeholder={addText} options={options} exact={this.exact}/>}
        <div className={ABCLS.options}>{options}</div>
        {popupFooter && popupFooter}
      </>
    )
  }
  getClassName(){
    let {rtl,popupAttrs = {}} = this.context;
    let {className:popupClassName} = popupAttrs;
    let className = ABCLS.popup;
    if(rtl){className += ' rtl'}
    if(popupClassName){className += ' ' + popupClassName}
    return className;
  }

  //start
  render(){
    var {toggle,popupAttrs = {},keyDown,backColor} = this.context;
    let {dataUniqId} = this.props;
    let props = {
      className:ABCLS.popupContainer,style:{background:backColor},
      onClick:(e)=>{
        e.stopPropagation();
        if($(e.target).attr('data-uniq-id') === dataUniqId){return;}
        if($(e.target).parents(`[data-uniq-id=${dataUniqId}]`).length){return;}
        toggle(false,true)
      }
    }
    return(
      <div {...props}>
        <div {...popupAttrs} ref={this.dom} data-uniq-id={dataUniqId} className={this.getClassName()} tabIndex={0} onKeyDown={(e)=>keyDown(e,$(this.dom.current))}>
            {this.renderPopOver()}
            {this.renderOptions()}   
        </div>
      </div>
    );
  }
}
class Multiselect extends Component{
  static contextType = aioButtonContext;
  render(){
    let {showTags,style = {}} = this.context;
    let {dataUniqId,tags,text,subtext,caret} = this.props;
    return (
      <div className={ABCLS.multiselect} style={{width:style.width}}>
        <Button dataUniqId={dataUniqId} text={text} subtext={subtext} caret={caret}/>
        {showTags !== false && tags.length !== 0 && <Tags tags={tags}/>}
      </div>
    )
  }
}
class Tags extends Component{
  static contextType = aioButtonContext;
  render(){
    let {tagsContainerClassName:tcc,tagsContainerStyle:tcs,rtl} = this.context;
    let {tags} = this.props;
    let Tags = tags.map((tag,i)=>{
      return <Tag key={i} {...tag} attrs={tag.tagAttrs}/>
    });
    return (<div className={ABCLS.tags + (rtl?' rtl':'') + (tcc?' ' + tcc:'')} style={tcs}>{Tags}</div>)
  }
}
function Tag(props){
  let {
    text,onClick,disabled,attrs = {},
    tagBefore = (
      <svg viewBox="0 0 24 24" role="presentation" style={{width: '0.9rem',height: '0.9rem'}}>
        <path d="M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" style={{fill: 'currentcolor'}}></path>
      </svg>
    )} = props;
  return (
    <div className={ABCLS.tag + (attrs.className?' ' + attrs.className:'') + (disabled?' disabled':'')} onClick={onClick} style={attrs.style}>
      <div className={ABCLS.tagIcon}>{tagBefore}</div>
      <div className={ABCLS.tagText}>{text}</div>
      <div className={ABCLS.tagIcon}>
        <svg viewBox="0 0 24 24" role="presentation" style={{width:'0.9rem'}}>
          <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" style={{fill: 'currentcolor'}}></path>
        </svg>
      </div>
    </div>
  )
}

function CheckIcon(props){
  let {checked,checkIcon = {},gap,type} = props;
  if(checked === undefined){return null} 
  if(Array.isArray(checkIcon)){
    return (
      <>
        {checkIcon[checked?1:0]}
        <div className={ABCLS.gap} style={{width:gap}}></div>
      </>
    )
  }
  let {size = [],color = [],round = type === 'radio'} = checkIcon;
  if(!Array.isArray(color)){color = [color]}
  let [outerColor = 'dodgerblue',innerColor = outerColor] = color;
  let iconColor = [outerColor,innerColor];
  if(!Array.isArray(size)){size = [14,12,1]}
  let [outerSize = 14,innerSize = 12,stroke = 1] = size;
  let iconSize = [outerSize,innerSize,stroke]; 
  return (
    <>
    <div 
      className={ABCLS.checkOut + (checked?' checked':'') + (round?' round':'')} 
      style={{color:iconColor[0],width:iconSize[0],height:iconSize[0],border:`${iconSize[2]}px solid`}}
    >
      {checked && <div className={ABCLS.checkIn + (round?' round':'')} style={{background:iconColor[1],width:iconSize[1],height:iconSize[1]}}></div>}
    </div>
    <div className={ABCLS.gap} style={{width:gap}}></div>
    </>
  );
}
class Option extends Component{
  render(){
    let {type,option,realIndex,renderIndex,checked,before,after,text,subtext,className,style,onClick,title,checkIcon,gap = 6,dragStart,dragOver,drop,rtl,onSwap,attrs} = this.props;
    let props = {className,title,style,onClick,datarenderindex:renderIndex,datarealindex:realIndex,tabIndex:0,...attrs}
    let checkIconProps = {checked,checkIcon,gap:!before && !text?0:gap,type}
    if(onSwap){
      props.onDragStart = dragStart;
      props.onDragOver = dragOver;
      props.onDrop = drop;
      props.draggable = true;
    }
    return (
      <>
          {option && option.splitter &&<div className={ABCLS.splitter + (rtl?' rtl':' ltr')}>{option.splitter}</div>}
          <div {...props}>
            <CheckIcon {...checkIconProps}/>
            {before && <Before before={before} gap={gap}/>}
            <Text text={text} subtext={subtext}/>
            {after && <After after={after} gap={gap}/>}
          </div>
      </>
    )
  }
}
