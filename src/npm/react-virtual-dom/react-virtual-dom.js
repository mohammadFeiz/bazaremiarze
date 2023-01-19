import React,{Component,Fragment} from "react";
import $ from 'jquery';
import "./index.css";
let RVDCLS = {
  rvd:'rvd',pointer:'rvd-pointer',gap:'rvd-gap',justify:'rvd-justify',align:'rvd-align',
  row:'rvd-row',column:'rvd-column',hidexs:'rvd-hide-xs',hidesm:'rvd-hide-sm',hidemd:'rvd-hide-md',hidelg:'rvd-hide-lg'
}
export default class ReactVirtualDom extends Component {
  touch = 'ontouchstart' in document.documentElement;
  eventHandler(event, action,type = 'bind'){
    event = this.touch ? { mousemove: "touchmove", mouseup: "touchend" }[event] : event;
    $(window).unbind(event, action);
    if(type === 'bind'){$(window).bind(event, action)}
  }
  getClassName(obj,align,Attrs,attrs,Props,pointer,isRoot,parent = {}){
    let className = RVDCLS.rvd;
    let gapClassName = RVDCLS.gap;
    if(isRoot){className += ' rvd-root'}
    if(parent.gapAttrs && parent.gapAttrs.className){
      gapClassName += ' ' + parent.gapAttrs.className
    }
    if(pointer){ className += ' ' + RVDCLS.pointer;}
    if(Attrs.className){ className += ' ' + Attrs.className}
    if(attrs.className){ className += ' ' + attrs.className}
    if(obj.className){ className += ' ' + obj.className}
    if(align === 'v'){className += ' ' + (obj.column?RVDCLS.justify:RVDCLS.align);}
    else if(align === 'h'){className += ' ' + (obj.column?RVDCLS.align:RVDCLS.justify);}
    else if(align === 'vh'){className += ` ${RVDCLS.justify} ${RVDCLS.align}`;}
    if(obj.row){className += ' ' + RVDCLS.row}
    else if(obj.column){className += ' ' + RVDCLS.column}
    let hide_xs,hide_sm,hide_md,hide_lg;
    
    if(obj.show_xs || Props.show_xs){hide_xs = false; hide_sm = true; hide_md = true; hide_lg = true;}
    if(obj.hide_xs || Props.hide_xs){hide_xs = true;}
    if(obj.show_sm || Props.show_sm){hide_xs = true; hide_sm = false; hide_md = true; hide_lg = true;}
    if(obj.hide_sm || Props.hide_sm){hide_sm = true;}
    if(obj.show_md || Props.show_md){hide_xs = true; hide_sm = true; hide_md = false; hide_lg = true;}
    if(obj.hide_md || Props.hide_md){hide_md = true;}
    if(obj.show_lg || Props.show_lg){hide_xs = true; hide_sm = true; hide_md = true; hide_lg = false;}
    if(obj.hide_lg || Props.hide_lg){hide_lg = true;} 
    if(hide_xs){
      className += ' ' + RVDCLS.hidexs;
      gapClassName += ' ' + RVDCLS.hidexs;
    }
    if(hide_sm){
      className += ' ' + RVDCLS.hidesm;
      gapClassName += ' ' + RVDCLS.hidesm;
    }
    if(hide_md){
      className += ' ' + RVDCLS.hidemd;
      gapClassName += ' ' + RVDCLS.hidemd;
    }
    if(hide_lg){
      className += ' ' + RVDCLS.hidelg;
      gapClassName += ' ' + RVDCLS.hidelg;
    }
    return {className,gapClassName};
  }
  getProps(obj,index,parent = {},isRoot){
    let {childsAttrs = ()=>{return {}},childsProps = ()=>{return {}}} = parent;
    let {attrs = {},onResize,swapId} = obj;
    let Attrs = (typeof childsAttrs === 'function'?childsAttrs(obj,index):childsAttrs) || {};
    let Props = (typeof childsProps === 'function'?childsProps(obj,index):childsProps) || {};
    let size = obj.size || Props.size;
    let flex = obj.flex || Props.flex;
    let align = obj.align || Props.align;
    let onClick = obj.onClick || Props.onClick;
    let pointer = !!Attrs.onClick || !!attrs.onClick || !!onClick;
    let childs = [];
    let html = typeof obj.html === 'function'?obj.html():obj.html;
    let dataId = 'a' + Math.random();
    let style = {...Attrs.style,...attrs.style,...obj.style}
    let axis;
    let gapStyle = {}
    if(parent.row){
      if(size !== undefined){style.width = size; flex = undefined}
      gapStyle.width = parent.gap;
      if(size && onResize){gapStyle.cursor = 'col-resize';}
      axis = 'x';
    }
    else if(parent.column){
      if(size !== undefined){style.height = size; flex = undefined}
      gapStyle.height = parent.gap;
      if(size && onResize){gapStyle.cursor = 'row-resize';}
      axis = 'y';
    }
    if(obj.row){childs = typeof obj.row === 'function'?obj.row():obj.row;}
    else if(obj.column){childs = typeof obj.column === 'function'?obj.column():obj.column}
    if(parent.gapAttrs && parent.gapAttrs.style){gapStyle = {...gapStyle,...obj.gapAttrs.style}}
    let {className,gapClassName} = this.getClassName(obj,align,Attrs,attrs,Props,pointer,isRoot,parent);
    let gapAttrs = {className:gapClassName,style:gapStyle,draggable:false,onDragStart:(e)=>{e.preventDefault(); return false}};
    if(size && onResize){
      gapAttrs[this.touch?'onTouchStart':'onMouseDown'] = (e)=>{
        this.so = {pos:this.getClient(e),onResize,axis,size,dataId};
        this.eventHandler('mousemove',$.proxy(this.mouseMove,this));
        this.eventHandler('mouseup',$.proxy(this.mouseUp,this));
      }
    }
    if(swapId !== undefined){
      attrs.draggable = true;
      attrs.onDragStart = (e)=>{
        let {swapHandleClassName} = this.props;
        if(swapHandleClassName){
          if(!$(e.target).hasClass(swapHandleClassName) && $(e.target).parents('.' + swapHandleClassName).length === 0){return;}
        }
        this.swapId = swapId;
      }
      attrs.onDragOver = (e)=>e.preventDefault();
      attrs.onDrop = ()=>{
        let {onSwap = ()=>{}} = this.props;
        if(this.swapId === swapId){return;}
        onSwap(this.swapId,swapId);
        this.swapId = false
      }
    } 
    attrs = {onClick,...Attrs,...attrs,style:{flex,...style},className,'data-id':dataId};
    if(this.props.loading && html){
      html = (
        <>
          <div style={{opacity:0}}>{html}</div>
          <div className='rvd-loading'></div>  
        </>
      )
      attrs.onClick = undefined
    }
    return {childs,html,attrs,gapAttrs}
  }
  getClient(e){return this.touch?{x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY}:{x:e.clientX,y:e.clientY}}
  getLayout(obj,index,parent,isRoot){
    if(!obj || obj === null || (typeof obj.show === 'function'?obj.show():obj.show) === false){return ''}
    let {childs,html,attrs,gapAttrs} = this.getProps(obj,index,parent,isRoot)
    return (
      <Fragment key={index}>
        <div {...attrs}>
          {childs.length?childs.map((o,i)=><Fragment key={i}>{this.getLayout(o,i,obj,false)}</Fragment>):html}
        </div>
        {parent && parent.gap !== undefined && <div {...gapAttrs}></div>}
      </Fragment>
    ) 
  }
  mouseMove(e){
    var {rtl} = this.props;
    var {pos,axis,size,dataId} = this.so;
    var client = this.getClient(e);
    var offset = (client[axis] - pos[axis]) * (rtl?-1:1);
    if(offset % 24 !== 0){return}
    this.so.newSize = offset + size;
    var panel = $('[data-id="'+dataId+'"]');
    panel.css({[{'x':'width','y':'height'}[axis]]:this.so.newSize})
  }
  mouseUp(){
    this.eventHandler('mousemove',this.mouseMove,'unbind');
    this.eventHandler('mouseup',this.mouseUp,'unbind');
    var {onResize,newSize} = this.so;
    onResize(newSize);
  }
  render(){
    var {gap,layout} = this.props;
    return this.getLayout(layout,0,undefined,true);
  }
}
ReactVirtualDom.defaultProps = {gap:0,layout:{}};
