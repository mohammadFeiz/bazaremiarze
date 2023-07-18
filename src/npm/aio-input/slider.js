import React ,{Component,createContext,createRef}from 'react';
import $ from 'jquery';
import './slider.css';
var RRangeSliderContext = createContext();
export default class RRangeSlider extends Component{
  constructor(props){
    super(props);
    var {direction} = this.props;
    this.touch = 'ontouchstart' in document.documentElement;
    if(direction === 'left'){
      this.getDiff = function (x,y,client){return x - client.x;}; this.oriention = 'horizontal';
    }
    else if(direction === 'right'){
      this.getDiff = function (x,y,client){return client.x - x;}; this.oriention = 'horizontal';
    }
    else if(direction === 'top'){
      this.getDiff = function (x,y,client){return y - client.y;}; this.oriention = 'vertical'; this.flexDirection = 'column-reverse';
    }
    else{
      this.getDiff = function (x,y,client){return client.y - y;}; this.oriention = 'vertical'; this.flexDirection = 'column';
    }
    this.dom = createRef();
    this.state = { 
      isDown:false,
    } 
  }
  getClient(e){return this.touch?{x: e.changedTouches[0].clientX,y:e.changedTouches[0].clientY }:{x:e.clientX,y:e.clientY}}
  getPercentByValue(value,start,end){return 100 * (value - start) / (end - start);} //getPercentByValue
  fix(number){
    let dotPos = this.props.step.toString().indexOf('.');
    let a = dotPos === -1?0:this.props.step.toString().length - dotPos - 1;
    return parseFloat((number).toFixed(a));
  }
  getStartByStep(start,step){
    var a = Math.round((start - step) / step) * step; 
    while(a < start){a += step;} return a;
  }
  eventHandler(selector, event, action,type = 'bind'){
    var me = { mousedown: "touchstart", mousemove: "touchmove", mouseup: "touchend" };
    event = this.touch ? me[event] : event;
    var element = typeof selector === "string"? (selector === "window"?$(window):$(selector)):selector; 
    element.unbind(event, action); 
    if(type === 'bind'){element.bind(event, action)}
  }
  getValidPoints(){
    let {value,start,end,min = start,max = end,step} = this.props;
    if(!value.length){value = [0]}
    for(var i = 0; i < value.length; i++){
      var point = value[i] || 0;
      point = Math.round((point - start)/step) * step + start;
      if(point < min){point = min;}
      if(point > max){point = max;}
      value[i] = point; 
    }
    return value
  }
  getOffset(x,y,size,e){
    var {start,end,step} = this.props,client = this.getClient(e);
    return  Math.round((end - start) * this.getDiff(x,y,client) / size / step) * step;
  }
  getValue(value,param = this.props){return typeof value === 'function'?value(param):value;}
  getPercents(){
    var {start,end} = this.props;      
    var percents = this.value.map((o,i)=>[
      this.getPercentByValue(i?this.value[i - 1]:start,start,end),
      this.getPercentByValue(o,start,end)
    ]);
    percents.push([percents[percents.length - 1][1],100])
    return percents;
  }
  decreaseAll(step = this.props.step){
    var start = this.props.start;
    var {min = start} = this.props;
    var offset = Math.min(step,this.value[0] - this.getValue(min));
    for(var i = 0; i < this.value.length; i++){
      this.value[i] -= offset;
      this.value[i] = this.fix(this.value[i])
    }
    this.moved = true;
  }
  increaseAll(step = this.props.step){
    var end = this.props.end;
    var {max = end} = this.props;
    var offset = Math.min(step,this.getValue(max) - this.value[this.value.length - 1]);
    for(var i = 0; i < this.value.length; i++){
      this.value[i] += offset;
      this.value[i] = this.fix(this.value[i])
    }
    this.moved = true;
  }
  mouseDown(e,index,type){
    e.preventDefault();
    var {start,end,min = start,max = end,onChange,disabled} = this.props;
    if(!onChange || disabled){return}
    var {x,y} = this.getClient(e),dom = $(this.dom.current);
    var pointContainers = dom.find('.slider-point-container');
    var size = dom.find('.slider-line')[this.oriention === 'horizontal'?'width':'height']();
    var length = this.value.length;
    
    this.eventHandler('window','mousemove',$.proxy(this.mouseMove,this));
    this.eventHandler('window','mouseup',$.proxy(this.mouseUp,this));
    
    this.moved = false;
    this.setState({isDown:true});
    pointContainers.css({zIndex:10}); 
    
    if(type === 'point'){
      let pointContainer = pointContainers.eq(index);
      pointContainer.css({zIndex:100});
      pointContainer.find('.slider-point').addClass('active');
      var current = this.value[index];
      var before = index === 0?min:this.value[index - 1];
      var after = index === this.value.length - 1?max:this.value[index + 1] 
      this.startOffset = {
        x,y,size,index:[index],value:[current], 
        startLimit:before - current,endLimit:after - current,
      }
    }
    else{
      let pointContainer1 = pointContainers.eq(index - 1);
      let pointContainer2 = pointContainers.eq(index);
      pointContainer1.css({zIndex:100});
      pointContainer2.css({zIndex:100});
      let p1 = pointContainer1.find('.slider-point');
      let p2 = pointContainer2.find('.slider-point');
      p1.addClass('active');
      p2.addClass('active');

      if(index === 0){this.decreaseAll();}
      else if(index === length){this.increaseAll();}
      if(index === 0 || index === length){
        this.startOffset = {
          x,y,size,
          index:this.value.map((o,i)=>i),value:this.value.map((o)=>o), 
          startLimit:min - this.value[0],endLimit:max - this.value[length - 1],
        }
      }
      else{
        var point1 = this.value[index - 1],point2 = this.value[index];
        var before = index === 1?min:this.value[index - 2];//مقدار قبلی رنج
        var after = index === length - 1?max:this.value[index + 1]; //مقدار بعدی رنج
        this.startOffset = {
          x,y,size,index:[index - 1,index],
          value:[point1,point2],startLimit:before - point1,endLimit:after - point2,
        }
      }
    }
  }
  
  mouseMove(e){
    let {onChange} = this.props;
    var {x,y,size,value,startLimit,endLimit,index} = this.startOffset;
    var offset = this.getOffset(x,y,size,e);
    if(offset < startLimit){offset = startLimit;}
    else if(offset > endLimit){offset = endLimit;}
    for(var i = 0; i < value.length; i++){
      let Index = index[i],Value = value[i],newValue = parseFloat(Value) + offset;
      if(this.value[Index] === newValue){return;}
      this.value[Index] = this.fix(newValue);
    } 
    this.moved = true;
    onChange(this.value,true);
  }
  mouseUp(){
    this.eventHandler('window','mousemove',this.mouseMove,'unbind');
    this.eventHandler('window','mouseup',this.mouseUp,'unbind');
    let {onChange} = this.props;
    var points = $(this.dom.current).find('.slider-point');
    points.removeClass('active');
    this.setState({isDown:false});
    if(this.moved){onChange(this.value,false);}
  }
  getContext(){
    var context = {...this.props}; 
    context.touch = this.touch;
    context.fix = this.fix.bind(this);
    context.oriention = this.oriention;
    context.getValue = this.getValue.bind(this); 
    context.isDown = this.state.isDown;
    context.mouseDown = this.mouseDown.bind(this);
    context.getStartByStep = this.getStartByStep.bind(this);
    context.getPercentByValue = this.getPercentByValue.bind(this);
    context.value = this.value;
    return context;
  }
  getStyle(){
    let {attrs} = this.props;
    let {style = {}} = attrs;
    var obj = {...style};
    obj = {...obj};
    obj.direction = 'ltr';
    obj.flexDirection = this.flexDirection;
    return obj
  }
  getClassName(){
    let {attrs} = this.props;
    let {className} = attrs;
    return `slider-container ${this.context.oriention}${className?' ' + className:''}`;
  }
  render(){
    this.value = this.getValidPoints();
    this.context = this.getContext();
    var {labelStep,scaleStep,attrs} = this.props;
    var percents = this.getPercents();
    return (
      <RRangeSliderContext.Provider value={this.context}>
        <div ref={this.dom} {...attrs} style={this.getStyle()} className={this.getClassName()}>
          <div style={{display:'flex',height:'100%',width:'100%',alignItems:'center',justifyContent:'center',position:'relative'}}>
            <RRangeSliderLine />
            {labelStep && <RRangeSliderLabels />}
            {scaleStep && <RRangeSliderScales />}
            {this.value.map((o,i)=><RRangeSliderFill key={i} index={i} percent={percents[i]}/>)}
            <RRangeSliderFill key={this.value.length} index={this.value.length} percent={percents[this.value.length]}/>
            {this.value.map((o,i)=><RRangeSliderPoint key={i} index={i} percent={percents[i]}/>)}
          </div>
          
        </div>
      </RRangeSliderContext.Provider>
    );
  }
}
RRangeSlider.defaultProps = {
  direction:'right',editLabel:(a)=>a,labelStyle:()=>{return {}},labelRotate:()=>{return 0},
  value:[0],scaleStyle:()=>{return {}},getPointHTML:()=>'',style:()=>{},
  start:0,end:100,step:1,activegetPointStyle:{},getText:()=>{return ''},attrs:{},
  pointStyle:{},lineStyle:{},fillStyle:{},valueStyle:()=>{return {}},textStyle:{},editValue:(value,index)=>value,textStyle:()=>{}
}
class RRangeSliderLine extends Component{
  static contextType = RRangeSliderContext;
  render(){
    var {lineStyle} = this.context;
    return (<div className='slider-line' style={typeof lineStyle === 'function'?lineStyle(this.context):lineStyle}></div>)
  }
}

class RRangeSliderFill extends Component{ 
  static contextType = RRangeSliderContext;
  getContainerStyle(){
    var {oriention,direction} = this.context,{percent} = this.props;
    var obj = {}; 
    obj[{right:'left',left:'right',top:'bottom',bottom:'top'}[direction]] = percent[0] + '%';
    if(oriention === 'horizontal'){obj.width = (percent[1] - percent[0]) + '%';} 
    else{obj.height = (percent[1] - percent[0]) + '%';}
    return obj;
  }
   
  render(){
    var {mouseDown,rangeEvents = {},fillStyle,getText,textStyle,touch,value} = this.context;
    var {index} = this.props;
    let active = (value.length === 1 && index === 0) || (value.length > 1 && index !== 0 && index < value.length )
    var containerProps = {
      'data-index':index,className:'slider-fill-container',
      [touch?'onTouchStart':'onMouseDown']:(e)=>{
        mouseDown(e,index,'fill')
      },
      style:this.getContainerStyle()
    }
    for(let prop in rangeEvents){
      containerProps[prop] = ()=>rangeEvents[prop](index)
    }
    let text = getText(index,this.context);
    let style;
    if(typeof fillStyle === 'function'){
      style = fillStyle(index,this.context);
    }
    else{
      if(value.length === 1 && index === 0){
        style = fillStyle;
      }
      if(value.length > 1 && index !== 0 && index !== value.length - 1){
        style = fillStyle;
      }
    }
    

    return (
      <div {...containerProps}> 
        <div className={'slider-fill' + (active?' slider-fill-active':'')} style={style} data-index={index}></div>
        {text !== undefined && <div className='slider-text' style={textStyle(index)}>{text}</div>}
      </div>
    );
  }
}

class RRangeSliderPoint extends Component{ 
  static contextType = RRangeSliderContext;
  getContainerStyle(){
    var {direction} = this.context,{percent} = this.props;
    return {
      [{right:'left',left:'right',top:'bottom',bottom:'top'}[direction]]:percent[1] + '%'};
  }
  getValueStyle(){
    var {showValue,isDown,valueStyle} = this.context;
    var {index} = this.props;
    if(showValue === false){return {display:'none'}}
    if(showValue === true || isDown){return typeof valueStyle === 'function'?valueStyle(index,this.context):valueStyle;}
    return {display:'none'};
  }
  render(){
    var {value,mouseDown,editValue,pointEvents,getPointHTML,pointStyle,touch,fix} = this.context;
    var {index} = this.props;
    var point = value[index];
    var props = {
      style:this.getContainerStyle(),'data-index':index,
      className:'slider-point-container', 
      [touch?'onTouchStart':'onMouseDown']:(e)=>{
        mouseDown(e,index,'point')
      },
    };
    for(let prop in pointEvents){
      props[prop] = ()=>pointEvents[prop](index)
    }
    var pointProps = {className:'slider-point',style:typeof pointStyle === 'function'?pointStyle(index,this.context):pointStyle,'data-index':index};
    var valueProps = {
      style:this.getValueStyle(),
      className:`slider-value ${'slider-value-' + index}`
    };
    let html = getPointHTML(index,this.context);
    return (
      <div {...props}>
        <div {...pointProps}>{html}</div>
        <div {...valueProps}>{editValue(fix(point),index)}</div>
      </div>
    );
  }
}

class RRangeSliderLabels extends Component{
  static contextType = RRangeSliderContext;
  constructor(props){
    super(props);
    this.dom = createRef();
    $(window).on('resize',this.update.bind(this))
  }
  getLabelsByStep(labelStep){
    var {start,label = {},end,getStartByStep} = this.context;
    var Labels = [];
    var value = getStartByStep(start,labelStep); 
    var key = 0;
    while (value <= end) {
      Labels.push(
        <RRangeSliderLabel key={key} value={value}/>
      );
      value += labelStep;
      value = parseFloat(value.toFixed(6))
      key++;
    } 
    return Labels;
  }
  getLabels(labelStep){
    return labelStep.map((o)=><RRangeSliderLabel key={o} value={o}/>)
  }
  update(){ 
    var container = $(this.dom.current); 
    var labels = container.find('.slider-label div'); 
    if(!labels.length){return;}
    var {direction,label = {}} = this.context;
    var firstLabel = labels.eq(0);
    var firstLabelThickness = firstLabel.attr('datarotated') === 'yes'?'height':'width';
    if(direction === 'right'){
      var end = firstLabel.offset().left + firstLabel[firstLabelThickness]();
      for(var i = 1; i < labels.length; i++){
        var label = labels.eq(i);
        let thickness = label.attr('datarotated') === 'yes'?'height':'width'; 
        label.css({display:'block'}) 
        var left = label.offset().left
        
        var width = label[thickness]();
        if(left < end + 5){ 
          label.css({display:'none'})
        }
        else{end = left + width;} 
      }
    }
    else if(direction === 'left'){
      var end = firstLabel.offset().left;
      for(var i = 1; i < labels.length; i++){
        var label = labels.eq(i);
        let thickness = label.attr('datarotated') === 'yes'?'height':'width'; 
        label.css({display:'block'})
        var left = label.offset().left
        var width = label[thickness]();
        var right = left + width;
        if(right > end - 5){
          label.css({display:'none'})
        }
        else{end = left;} 
      }
    }
  }
  componentDidMount(){this.update()}
  componentDidUpdate(){this.update()}
  render(){
    let {labelStep} = this.context;
    return (
      <div className='slider-labels' ref={this.dom}>
        {Array.isArray(labelStep)?this.getLabels(labelStep):this.getLabelsByStep(labelStep)}
      </div>
    );
  }
}

class RRangeSliderLabel extends Component{
  static contextType = RRangeSliderContext;
  getStyle(){
    var {start,end,getPercentByValue,direction,labelStyle,labelRotate} = this.context;
    var {value} = this.props;
    var obj = labelStyle(value,this.context);
    if(!obj){obj = {}}
    obj[{right:'left',left:'right',top:'bottom',bottom:'top'}[direction]] = getPercentByValue(value,start,end) + '%';
    let rotate = labelRotate(value);
    if(rotate){
      obj.transform = `rotate(${rotate + 'deg'})`;
      obj.justifyContent = rotate > 0?'flex-start':'flex-end' 
    }
    return obj; 
  } 
  click(e){
    var {onLabelClick} = this.context;
    e.stopPropagation();
    if(!onLabelClick){return}
    var {value} = this.props;
    onLabelClick(value);
  }
  render(){
    let {editLabel,labelRotate} = this.context;
    let {value} = this.props;
    let rotate = labelRotate(value);
    let text;
    try{text = editLabel(value)}
    catch{text = ''}
    return (
        <div
          onClick={this.click.bind(this)} style={this.getStyle()} 
          className={`slider-label`} 
        >
        <div datarotated={rotate?'yes':'no'} className='slider-label-text'>{text}</div>
        </div>
      
    );
  }
}

class RRangeSliderScales extends Component{
  static contextType = RRangeSliderContext;
  getScalesByStep(scaleStep){
    var {start,end,getStartByStep} = this.context;
    var value = getStartByStep(start,scaleStep);
    var key = 0,scales = []; 
    while (value <= end) {
      scales.push(<RRangeSliderScale value={value} key={key}/>);
      value += scaleStep;
      key++;
    }
    return scales;
  }
  getScales(scaleStep){
    return scaleStep.map((o)=><RRangeSliderScale value={o} key={o}/>)
  }
  render(){
    let {scaleStep} = this.context;  
    return(
      <div className='slider-scales'>
        {Array.isArray(scaleStep)?this.getScales(scaleStep):this.getScalesByStep(scaleStep)}
      </div>
    );
  }
}
class RRangeSliderScale extends Component{
  static contextType = RRangeSliderContext;
  getStyle(){
    var {scaleStyle} = this.context;
    var {start,end,direction,getPercentByValue} = this.context,{value} = this.props;
    var obj = scaleStyle(value,this.context);
    if(!obj){obj = {}}
    obj[{right:'left',left:'right',top:'bottom',bottom:'top'}[direction]] = getPercentByValue(value,start,end) + '%';
    return obj;
  }
  render(){
    let {getScaleHTML} = this.context;
    let {value} = this.props;
    return (
      <div className="slider-scale" style={this.getStyle()}>
        {getScaleHTML && getScaleHTML(value)} 
      </div>
    );
  }
}
