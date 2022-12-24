import React,{Component,createRef} from "react";
import "./index.css";
import $ from 'jquery';
export default class App extends Component {
  constructor(props){
    super(props);
    this.touch = 'ontouchstart' in document.documentElement;
    this.dom = createRef();
    var {count = 3,move} = this.props;
    if(move){
      move(this.move.bind(this))
    }
    this.state = {
      count
    }
  }
    
  eventHandler(selector, event, action,type = 'bind'){
    var me = { mousedown: "touchstart", mousemove: "touchmove", mouseup: "touchend" }; 
    event = this.touch ? me[event] : event;
    var element = typeof selector === "string"?(selector === "window"?$(window):$(selector)):selector; 
    element.unbind(event, action); 
    if(type === 'bind'){element.bind(event, action)}
  }
  getClient(e) {
    return this.touch
      ? [e.changedTouches[0].clientX,e.changedTouches[0].clientY]
      : [e.clientX,e.clientY];
  }
  getStyle(){
    var {size,width = 200} = this.props;
    var {count} = this.state;
    var height = count * (size);
    return {width,height}
  }
  getItems(){ 
    var {size,items,showIndex,style} = this.props;
    this.activeIndex = 0;
    return items.map(({text,active},i)=>{
      if(active){this.activeIndex = i;}
      return <div key={i} dataindex={i} className='r-drag-list-item' style={{height:size,...style}} title={showIndex?i:''}>{text}</div>
    })
  }
  getIndexByTop(top){
    var {size} = this.props;
    var {count} = this.state;
    return Math.round(((count * size) - size - (2*top)) / (2 * size));
  }
  getTopByIndex(index){
    var {size} = this.props;
    var {count} = this.state;
    return (count - 2 * index - 1) * size / 2;
  }
  getContainerStyle(){
    var style = {
      top:this.getTopByIndex(this.activeIndex)
    };
    return style;
  }
  
  moveDown(){
    var {items} = this.props;
    if(this.activeIndex >= items.length - 1){return}
    this.activeIndex++;
    var newTop = this.getTopByIndex(this.activeIndex);
    this.setStyle({top:newTop});
    this.setBoldStyle(this.activeIndex);
  }
  setBoldStyle(index){
    $(this.dom.current).find('.r-drag-list-item').removeClass('active');
    $(this.dom.current).find('.r-drag-list-item[dataindex='+(index)+']').addClass('active');
  }
  moveUp(){
    if(this.activeIndex <= 0){return}
    this.activeIndex--;
    var newTop = this.getTopByIndex(this.activeIndex);
    this.setStyle({top:newTop});
    this.setBoldStyle(this.activeIndex);
    
  }
  keyDown(e){
    var {editable} = this.props;
    if(editable === false){return}
    if(e.keyCode === 38){
      this.moveUp();
    }
    else if(e.keyCode === 40){
      this.moveDown();
    }
    
  }
  getLimit(){
    var {items} = this.props;
    return {
      top:this.getTopByIndex(-1),
      bottom:this.getTopByIndex(items.length)
    }
  }
  getTrueTop(top){
    let {items} = this.props;
    let index = this.getIndexByTop(top);
    if(index < 0){index = 0}
    if(index > items.length - 1){index = items.length - 1}
    return this.getTopByIndex(index);
  }
  mouseDown(e){
    var {items,onChange,editable} = this.props;
    if(editable === false){return}
    this.eventHandler('window','mousemove',$.proxy(this.mouseMove,this));
    this.eventHandler('window','mouseup',$.proxy(this.mouseUp,this));
    clearInterval(this.interval);
    this.moved = false;
    this.isDown = true;
    var [x,y] = this.getClient(e);
    this.setStyle({transition:'unset'});
    let top = this.getTop();
    var index = this.getIndexByTop(top);
    this.setBoldStyle(index);
    this.setStyle({top,transition:'unset'});
    onChange(items[index],index)
    this.so = {y,top,limit:this.getLimit()};
  }
  getTop(){
    var top = parseInt($(this.dom.current).find('.r-drag-list-inner').css('top'));
    return this.getTrueTop(top);
  }
  fixTop(value){
    let {top,bottom} = this.so.limit;
    if(value > top){return top}
    if(value < bottom){return bottom}
    return value;
  }
  mouseMove(e){
    this.moved = true;
    var [x,y] = this.getClient(e);
    var offset = y - this.so.y;
    if(this.lastY === undefined){this.lastY = y}
    this.deltaY = y - this.lastY;
    this.lastY = y;
    if(Math.abs(offset) < 20){this.deltaY = 3}
    var newTop = this.fixTop(this.so.top + offset);
    let index = this.getIndexByTop(newTop);
    this.so.newTop = newTop;
    this.setBoldStyle(index);
    this.setStyle({top:newTop}); 
  }
  setStyle(obj){
    $(this.dom.current).find('.r-drag-list-inner').css(obj);
  }
  mouseUp(e){ 
    this.eventHandler('window','mousemove',this.mouseMove,'unbind');
    this.eventHandler('window','mouseup',this.mouseUp,'unbind'); 
    this.isDown = false;
    if(!this.moved){return}
    this.moved = false;
    this.move(this.deltaY,this.so.newTop)
  }
  move(deltaY,startTop = this.getTop()){ 
    var {items,onChange = ()=>{},decay = 8,stop = 3} = this.props;
    if(decay < 0){decay = 0}
    if(decay > 99){decay = 99}
    decay = parseFloat(1 + decay / 1000)
    this.interval = setInterval(()=>{
      startTop += deltaY; 
      let index = this.getIndexByTop(startTop);
      if(Math.abs(deltaY) < stop || index < 0 || index > items.length - 1){
        clearInterval(this.interval); 
        if(index < 0){index = 0}
        if(index > items.length - 1){index = items.length - 1}
        let top = this.getTopByIndex(index);
        this.setBoldStyle(index);
        this.setStyle({top,transition:'0.3s'});
        onChange(items[index],index)
        return;
      }      
      deltaY /= decay;
      this.setStyle({top:startTop});
    },20)
  }
  componentDidUpdate(){
    this.setBoldStyle(this.activeIndex);
  }
  componentDidMount(){
    this.setBoldStyle(this.activeIndex);
  }
  render(){
    var items = this.getItems();
    return (
        <div ref={this.dom} className='r-drag-list-container' style={this.getStyle()} tabIndex={0} onKeyDown={(e)=>this.keyDown(e)}>
        <div 
          className='r-drag-list-inner' 
          style={this.getContainerStyle()} 
          onMouseDown={(e)=>this.mouseDown(e)} 
          onTouchStart={(e)=>this.mouseDown(e)}
        >{items}</div>
      </div>
    );  
  }
}
App.defaultProps = {size:48,items:[],onChange:(item,index)=>{}}