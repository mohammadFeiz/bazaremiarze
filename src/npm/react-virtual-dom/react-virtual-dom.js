import React,{Component,Fragment} from "react";
import $ from 'jquery';
import "./index.css";
export default class ReactVirtualDom extends Component {
  touch = 'ontouchstart' in document.documentElement;
  eventHandler(event, action,type = 'bind'){
    event = this.touch ? { mousemove: "touchmove", mouseup: "touchend" }[event] : event;
    $(window).unbind(event, action);
    if(type === 'bind'){$(window).bind(event, action)}
  }
  getClassName(obj,align,ofx,ofy,of,Attrs,attrs,Props,pointer,padding){
    let className = 'rvd';
    let gapClassName = 'rvd-gap';
    if(obj.gapAttrs && obj.gapAttrs.className){
      gapClassName += ' ' + obj.gapAttrs.className
    }
    if(pointer){ className += ' rvd-pointer';}
    if(Attrs.className){ className += ' ' + Attrs.className}
    if(attrs.className){ className += ' ' + attrs.className}
    if(obj.className){ className += ' ' + obj.className}
    if(align === 'v'){className += obj.column?' rvd-justify':' rvd-align';}
    else if(align === 'h'){className += obj.column?' rvd-align':' rvd-justify';}
    else if(align === 'vh'){className += ' rvd-justify rvd-align';}
    if(ofx){className += (' rvd-ofx-' + ofx)}
    if(ofy){className += (' rvd-ofy-' + ofy)}
    if(of){className += (' rvd-of-' + of)}
    if(obj.row){className += ' rvd-row'}
    else if(obj.column){className += ' rvd-column'}
    if(obj.hide_xs || Props.hide_xs){
      className += ' r-layout-hide-xs';
      gapClassName += ' r-layout-hide-xs';
    }
    if(obj.hide_sm || Props.hide_sm){
      className += ' r-layout-hide-sm';
      gapClassName += ' r-layout-hide-sm';
    }
    if(obj.hide_md || Props.hide_md){
      className += ' r-layout-hide-md';
      gapClassName += ' r-layout-hide-md';
    }
    if(obj.hide_lg || Props.hide_lg){
      className += ' r-layout-hide-lg';
      gapClassName += ' r-layout-hide-lg';
    }
    return {className,gapClassName};
  }
  getProps(obj,index,parent,isRoot){
    let {childsAttrs = ()=>{return {}},childsProps = ()=>{return {}}} = parent;
    let {attrs = {},onResize,swapId} = obj;
    let Attrs = (typeof childsAttrs === 'function'?childsAttrs(obj,index):childsAttrs) || {};
    let Props = (typeof childsProps === 'function'?childsProps(obj,index):childsProps) || {};
    let size = obj.size || Props.size;
    let flex = obj.flex || Props.flex;
    let align = obj.align || Props.align;
    let ofx = obj.ofx || Props.ofx;
    let ofy = obj.ofy || Props.ofy;
    let of = obj.of || Props.of;
    let padding = obj.padding || Props.padding;
    let onClick = obj.onClick || Props.onClick;
    let pointer = !!Attrs.onClick || !!attrs.onClick || !!onClick;
    let childs = [];
    let html = typeof obj.html === 'function'?obj.html():obj.html;
    let dataId = 'a' + Math.random();
    let style = {...Attrs.style,...attrs.style,...obj.style}
    let axis;
    let gapStyle = {}
    if(parent.row){
      if(size !== undefined){style.width = size}
      gapStyle.width = parent.gap;
      if(size && onResize){gapStyle.cursor = 'col-resize';}
      axis = 'x';
    }
    else if(parent.column){
      if(size !== undefined){style.height = size}
      gapStyle.height = parent.gap;
      if(size && onResize){gapStyle.cursor = 'row-resize';}
      axis = 'y';
    }
    if(obj.row){
      childs = typeof obj.row === 'function'?obj.row():obj.row;
    }
    else if(obj.column){
      childs = typeof obj.column === 'function'?obj.column():obj.column
    }
    if(obj.gapAttrs && obj.gapAttrs.style){
      gapStyle = {...gapStyle,...obj.gapAttrs.style}
    }
    let {className,gapClassName} = this.getClassName(obj,align,ofx,ofy,of,Attrs,attrs,Props,pointer,padding);
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
      attrs.onDragOver = (e)=>{
        e.preventDefault();
      }
      attrs.onDrop = ()=>{
        let {onSwap = ()=>{}} = this.props;
        if(this.swapId === swapId){return;}
        onSwap(this.swapId,swapId);
        this.swapId = false
      }
    } 
    return {
      size,flex,childs,style,html,dataId,
      attrs:{onClick,...Attrs,...attrs,className,'data-id':dataId},
      gapAttrs
    }
  }
  getClient(e){return this.touch?{x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY}:{x:e.clientX,y:e.clientY}}
  getHtml(obj,index,parentObj,isRoot){
    if(!obj || obj === null){return ''}
    let {show = true} = obj;
    let Show = typeof show === 'function'?show():show;
    let parent = parentObj || {};
    if(!Show){return null}
    let {size,flex,childs,style,html,attrs,gapAttrs} = this.getProps(obj,index,parent,isRoot)
    if(parentObj){flex = flex || 'none'}
    var result;
    if(!childs.length){result = <div {...attrs} style={{...style,flex}}>{html}</div>}
    else{
      let Style = {flex:!size?(flex || 1):undefined,...style};
      result = (
        <div {...attrs} style={Style}>
          {childs.map((o,i)=><Fragment key={i}>{this.getHtml(o,i,obj)}</Fragment>)}
        </div>
      )
    }
    return (
      <Fragment key={index}>
        {result}
        {parent.gap !== undefined && <div {...gapAttrs}></div>}
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
    return this.getHtml(layout,0,undefined,true);
  }
}
ReactVirtualDom.defaultProps = {gap:0,layout:{}};
