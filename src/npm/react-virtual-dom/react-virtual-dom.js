import React,{Component,Fragment} from "react";
import $ from 'jquery';
import "./index.css";
let RVDCLS = {
  rvd:'rvd',pointer:'rvd-pointer',gap:'rvd-gap',justify:'rvd-justify',align:'rvd-align',
  row:'rvd-row',column:'rvd-column',hidexs:'rvd-hide-xs',hidesm:'rvd-hide-sm',hidemd:'rvd-hide-md',hidelg:'rvd-hide-lg'
}
export default class ReactVirtualDom extends Component {
  getClassName(pointer,isRoot,props){
    let className = RVDCLS.rvd;
    if(isRoot){className += ' rvd-root'}
    if(props.className){className += ' ' + props.className}
    if(pointer){ className += ' ' + RVDCLS.pointer;}
    if(props.align === 'v'){className += ' ' + (props.column?RVDCLS.justify:RVDCLS.align);}
    else if(props.align === 'h'){className += ' ' + (props.column?RVDCLS.align:RVDCLS.justify);}
    else if(props.align === 'vh'){className += ` ${RVDCLS.justify} ${RVDCLS.align}`;}
    if(props.row){className += ' ' + RVDCLS.row}
    else if(props.column || props.grid){className += ' ' + RVDCLS.column}
    let hideClassName = getHideClassName(props)
    return className + (hideClassName?' ' + hideClassName:'');
  }
  getProps(obj,index,parent = {},isRoot){
    let {htmls = {}} = this.props;
    let {childsProps = ()=>{return {}}} = parent;
    let Props = (typeof childsProps === 'function'?childsProps(obj,index):childsProps) || {};
    let props = {...Props,...obj}
    let {swapId,size,flex,onClick,html,style,longTouch} = props; 
    let attrs = obj.attrs || Props.attrs || {};
    let pointer =  !!onClick || !!attrs.onClick;
    let childs = [];
    html = typeof html === 'function'?html():html;
    if(typeof html === 'string' && htmls[html]){
      html = htmls[html](obj)
    }
    let dataId = 'a' + Math.random();
    style = {...attrs.style,...style}
    if(parent.row){
      if(size !== undefined){style.width = size; flex = undefined}
    }
    else if(parent.column || parent.grid){
      if(size !== undefined){style.height = size; flex = undefined}
    }
    if(obj.row){childs = typeof obj.row === 'function'?obj.row():obj.row;}
    else if(obj.column){childs = typeof obj.column === 'function'?obj.column():obj.column}
    else if(obj.grid){
      let {gridCols = 2} = obj;
      let grid = typeof obj.grid === 'function'?obj.grid():obj.grid;
      for(let i = 0; i < grid.length; i+=gridCols){
        let row = [];
        let gridRow = typeof obj.gridRow === 'function'?obj.gridRow(i):obj.gridRow;
        for(let j = i; j < i + gridCols; j++){
          if(grid[j]){row.push(grid[j])}
        } 
        childs.push({
          row:[...row],...gridRow
        })
      }
      obj.column = [...childs]
    }
    let className = this.getClassName(pointer,isRoot,props);
    let gapAttrs = getGapAttrs(obj,parent,props,dataId)
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
    attrs = {onClick,...attrs,style:{flex,...style},className,'data-id':dataId};
    if(props.egg){attrs.onClick = ()=>this.egg(props.egg)}
    if(longTouch){
      attrs['ontouchstart' in document.documentElement?'onTouchStart':'onMouseDown'] = (e)=>{
        this.lt = dataId;
        this[dataId + 'callback'] = longTouch;
        this.timer()
        eventHandler('mouseup',$.proxy(this.longTouchMouseUp,this));
      }
    }
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
  getLayout(obj,index,parent,isRoot){
    if(typeof obj === 'object' && typeof parent === 'object'){obj.props = {...parent.props,...obj.props}}
    let {getLayout} = this.props;
    if(!obj || obj === null || (typeof obj.show === 'function'?obj.show():obj.show) === false){return ''}
    if(getLayout){obj = getLayout(obj,parent)}
    let {childs,html,attrs,gapAttrs} = this.getProps(obj,index,parent,isRoot)
    return (
      <Fragment key={index}>
        <div {...attrs}>
          {childs.length?childs.map((o,i)=><Fragment key={i}>{this.getLayout(o,i,obj,false)}</Fragment>):html}
        </div>
        {parent && (parent.gap !== undefined || (parent.props && parent.props.gap !== undefined)) && <div {...gapAttrs}></div>}
      </Fragment>
    ) 
  }
  egg({callback = ()=>{},count = 10}){
    this.eggCounter++;
    if(this.eggCounter >= count){callback()}
    clearTimeout(this.timeOut);
    this.timeOut = setTimeout(()=>this.eggCounter = 0,500)
  }
  longTouchMouseUp(){
    eventHandler('mouseup',this.longTouchMouseUp,'unbind');
    clearInterval(this[this.lt + 'interval']);
  }
  timer(){
    this.time = 0;
    this[this.lt + 'interval'] = setInterval(()=>{
        this.time++;
        if(this.time > 50){
            clearInterval(this[this.lt + 'interval']);
            this[this.lt + 'callback']()
        }
    },10)
  }
  
  render(){
    var {gap,layout} = this.props;
    return this.getLayout(layout,0,undefined,true);
  }
}
ReactVirtualDom.defaultProps = {gap:0,layout:{}};

export function RVDRemoveV(selector,callback){
  $(selector).animate({opacity:0},100).animate({height:0,padding:0},150,callback);
}
export function RVDRemoveH(selector,callback){
  $(selector).animate({opacity:0},100).animate({width:0,padding:0},150,callback);
}
export function RVDRemove(selector,callback){
  $(selector).animate({opacity:0},200,callback);
}
function eventHandler(event, action,type = 'bind'){
  event = 'ontouchstart' in document.documentElement ? { mousemove: "touchmove", mouseup: "touchend" }[event] : event;
  $(window).unbind(event, action);
  if(type === 'bind'){$(window).bind(event, action)}
}
function getGapAttrs(obj,parent = {},props = {},dataId){
  let $$ = {
    getClient(e){return 'ontouchstart' in document.documentElement?{x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY}:{x:e.clientX,y:e.clientY}},
    mouseMove(e){
      var {rtl} = this.props;
      var {pos,axis,size,dataId} = this.so;
      var client = this.getClient(e);
      var offset = (client[axis] - pos[axis]) * (rtl?-1:1);
      if(offset % 24 !== 0){return}
      this.so.newSize = offset + size;
      var panel = $('[data-id="'+dataId+'"]');
      panel.css({[{'x':'width','y':'height'}[axis]]:this.so.newSize})
    },
    mouseUp(){
      eventHandler('mousemove',this.mouseMove,'unbind');
      eventHandler('mouseup',this.mouseUp,'unbind');
      var {onResize,newSize} = this.so;
      onResize(newSize);
    },
    getGap(obj,parent,dir){
      let gap = parent['gap' + dir] || parent.gap || (parent.props?parent.props['gap' + dir] || parent.props.gap:undefined)
      return typeof gap === 'function'?gap(obj,parent):gap;
    },
    getClassName(){
      let className = RVDCLS.gap;
      if(parent.gapAttrs && parent.gapAttrs.className){className += ' ' + parent.gapAttrs.className}
      let hideClassName = getHideClassName(props)
      return className + (hideClassName?' ' + hideClassName:'');
    },
    getGapAttrs(){
      let {size,onResize} = props;
      let style = {},axis;
      if(parent.row){
        axis = 'x';
        style.width = this.getGap(obj,parent,'H');
        if(size && onResize){style.cursor = 'col-resize';}
      }
      else if(parent.column || parent.grid){
        axis = 'y'
        style.height = this.getGap(obj,parent,'V');
        if(size && onResize){style.cursor = 'row-resize';}
      }
      else {return {}}
      if(parent.gapAttrs && parent.gapAttrs.style){style = {...style,...parent.gapAttrs.style}}
      let gapAttrs = {
        className:this.getClassName(),style,draggable:false,
        onDragStart:(e)=>{e.preventDefault(); return false}
      };
      if(size && onResize){
        gapAttrs['ontouchstart' in document.documentElement?'onTouchStart':'onMouseDown'] = (e)=>{
          this.so = {pos:this.getClient(e),onResize,axis,size,dataId};
          eventHandler('mousemove',$.proxy(this.mouseMove,this));
          eventHandler('mouseup',$.proxy(this.mouseUp,this));
        }
      }
      return gapAttrs;
    }
  } 
  return $$.getGapAttrs()
}
function getHideClassName(props){
  let hide_xs,hide_sm,hide_md,hide_lg,className;  
  if(props.show_xs){hide_xs = false; hide_sm = true; hide_md = true; hide_lg = true;}
  if(props.hide_xs){hide_xs = true;}
  if(props.show_sm){hide_xs = true; hide_sm = false; hide_md = true; hide_lg = true;}
  if(props.hide_sm){hide_sm = true;}
  if(props.show_md){hide_xs = true; hide_sm = true; hide_md = false; hide_lg = true;}
  if(props.hide_md){hide_md = true;}
  if(props.show_lg){hide_xs = true; hide_sm = true; hide_md = true; hide_lg = false;}
  if(props.hide_lg){hide_lg = true;}
  if(hide_xs){className += ' ' + RVDCLS.hidexs;}
  if(hide_sm){className += ' ' + RVDCLS.hidesm;}
  if(hide_md){className += ' ' + RVDCLS.hidemd;}
  if(hide_lg){className += ' ' + RVDCLS.hidelg;}
  return className;
}