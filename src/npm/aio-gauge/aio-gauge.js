import React ,{Component}from 'react';
import AIOCanvas from './../../npm/aio-canvas/aio-canvas';

export default class RGauger extends Component{
  constructor(props){
    super(props);
    this.getDetails();
  }
  getPercentByValue(value,start,end){return 100 * (value - start) / (end - start)}
  getDetails(){
    var {angle,start,end,direction} = this.props;
    this.scales = this.getScales();
    this.labels = this.getLabels();
    this.slice = direction === 'clock'?[this.getAngleByValue(end),this.getAngleByValue(start)]:[this.getAngleByValue(start),this.getAngleByValue(end)];
    this.circles = this.getCircles();
  }
  getAngleByValue(value){
    var {direction,start,end,angle,rotate} = this.props;
    var percent = this.getPercentByValue(value,start,end);
    var valueAngle = angle / 100 * percent;
    if(direction === 'clock'){
      return 90 + angle / 2 - valueAngle + rotate;  
    }
    return 90 - angle / 2 + valueAngle + rotate;
  }
  
  getRanges(){
    var {direction,ranges = [],radius,thickness} = this.props;
    if(!thickness){return []}
    var Ranges = (typeof ranges === 'function'?ranges(this.props):ranges).map((r,i)=>{ 
      let {value,color,lineCap} = r;
      value = parseFloat(value); 
      if(isNaN(value)){console.error(`r-gauger error: ranges[${i}].value is undefined or not an number`)}
      return {color,angle:this.getAngleByValue(value),lineCap}
    })
    var circles = [];
    for(var i = 0; i < Ranges.length; i++){
      var {color,angle,lineCap} = Ranges[i];
      var startAngle = i === 0?this.getAngleByValue(this.props.start):Ranges[i - 1].angle;
      var endAngle = angle;
      var slice;
      if(direction === 'clock'){
        slice = [endAngle,startAngle]
      }
      else {
        slice = [startAngle,endAngle]
      }
      circles.push({type:'Arc',lineCap,r:radius,slice,stroke:color,lineWidth:thickness})
    }
    return circles.reverse();
  }
  getCircles(){
    var {circles} = this.props;
    if(!circles || circles.length === 0){return []}
    return circles.map((c)=>{
      return {type:'Arc',r:c.radius,lineWidth:c.lineWidth,stroke:c.stroke,fill:c.fill,lineCap:c.lineCap,slice:c.slice?this.slice:undefined}
    });

  }
  getLabels(){
    var {start,end,label,radius,thickness,angle:mainAngle} = this.props;
    if(!label){return []}
    if(!Array.isArray(label)){label = [label]}
    if(!label.length){return []}
    var labels = {};
    for(let i = 0; i < label.length; i++){
      if(!label[i].step){continue}
      let {step,edit,min = start,max = end} = label[i];
      step = this.getValueByField(step);
      min = this.getValueByField(min);
      max = this.getValueByField(max);
      if(min < start){min = start}
      if(min > end){min = end}
      if(max < start){max = start}
      if(max > end){max = end}
      let value = label[i].start === undefined?Math.round(min/step) * step:label[i].start;
      while(value <= max){
        let {offset = 0,color = '#000',fontSize = 10} = label[i];
        offset = this.getValueByField(offset,value)
        color = this.getValueByField(color,value);
        fontSize = this.getValueByField(fontSize,value);
        let pivot = offset?-offset:-(radius - thickness / 2);
        if(!labels[value]){
          let angle = this.getAngleByValue(value);
          
          labels[value] = {
            rotate:angle,pivot:[pivot,0],type:'Group',
            items:[{type:'Text',text:edit?edit(value):value,fill:color,rotate:-angle,fontSize}]
          }
        }
        value+=step;
      }
    }
    let res = [];
    for(let prop in labels){res.push(labels[prop])}
    if(mainAngle === 360 && res[res.length - 1].rotate % 90 === 0){res.pop();}
    return res;
  }
  getScales(){
    var {start,end,scale,radius,thickness} = this.props;
    if(!Array.isArray(scale)){scale = [scale]}
    let scales = {}
    for(let i = 0; i < scale.length; i++){
      if(!scale[i].step){continue}
      let {step,min = start,max = end} = scale[i];
      step = this.getValueByField(step);
      min = this.getValueByField(min);
      max = this.getValueByField(max);
      if(min < start){min = start}
      if(min > end){min = end}
      if(max < start){max = start}
      if(max > end){max = end}
      let value = scale[i].start === undefined?Math.round(min/step) * step:scale[i].start;
      while(value <= max){
        let {offset = 0,color = '#000',width,height = 5,lineCap} = scale[i];
        offset = this.getValueByField(offset,value)
        color = this.getValueByField(color,value);
        width = this.getValueByField(width,value);
        height = this.getValueByField(height,value);
        lineCap = this.getValueByField(lineCap);      
        let pivot = offset?-offset:-(radius - height - thickness / 2);
        if(!scales[value]){
          let angle = this.getAngleByValue(value);
          scales[value] = {type:'Line',stroke:color,lineCap,points:[[0,0],[height,0]],lineWidth:width,pivot:[pivot,0],rotate:angle}
        }
        value+=step;
      }
    } 
    let res = [];
    for(let prop in scales){res.push(scales[prop])}
    return res;
  }
  getHandles(){
    var {handle} = this.props;
    if(!handle){return [];}
    return Array.isArray(handle)?handle.map((h)=>this.getHandle(h)):[this.getHandle(handle)];
  }
  getHandle(handle){
    var {start,end,radius,thickness} = this.props;
    var {value = false,offset = 0,color = '#000',width = 4,height = (radius - thickness/2),radius:handleRadius=4} = handle;
    offset = this.getValueByField(offset,value);
    color = this.getValueByField(color,value);
    width = this.getValueByField(width,value);
    height = this.getValueByField(height,value);
    handleRadius = this.getValueByField(handleRadius,value);
    var angle = this.getAngleByValue(value);
    return { 
      type:'Group',
      items:[
        {type:'Line',fill:color,points:[[0,-width / 2],[height,0],[0,width / 2]],lineWidth:width,pivot:[-offset,0],rotate:angle,close:true},
        {type:'Arc',r:handleRadius,fill:color}
      ] 
    }
  }
  getTexts(){
    var {text} = this.props;
    if(!text){return [];}
    var texts = Array.isArray(text)?text.map((t)=>this.getText(t)):[this.getText(text)];
    return texts;
  } 
  getValueByField(field,value){
    let props = this.props;
    try{
      let type = typeof field;
      if(type === 'function'){return field(props);}
      if(type === 'string'){
        if(field.indexOf('props.') === 0 || field.indexOf('value') === 0 ){
          let result;
          eval('result = ' + field);
          return result;
        }
        return field;
      }
      return field; 
    }
    catch{return;}
  }
  getText(text){
    var {value,top = 20,left = 0,fontSize = 10,fontFamily = 'arial',color = '#000',rotate = 0} = text;
    value = this.getValueByField(value);
    top = this.getValueByField(top);
    left = this.getValueByField(left);
    fontSize = this.getValueByField(fontSize);
    fontFamily = this.getValueByField(fontFamily);
    color = this.getValueByField(color);
    if(!Array.isArray(color)){color = [color]}
    let [fill,stroke] = color;
    rotate = this.getValueByField(rotate);
    return {
      type:'Text',text:typeof value === 'function'?value(this.props):value,x:left,y:-top,rotate,fontSize,fontFamily,fill,stroke
    }
  }
  getItems(){return this.props.customShapes.concat(this.circles,this.getRanges(),this.labels,this.scales,this.getTexts(),this.getHandles())} 
  getStyle(){
    var Style = {...this.props.style};
    Style.width = Style.width;
    Style.height = Style.height;
    return Style;
  }
  render(){
    var {dynamic,position,id,className} = this.props;
    if(dynamic){this.getDetails();}
    return (
      <AIOCanvas className={`r-gauger${className?' ' + className:''}`} id={id} items={this.getItems()} style={this.getStyle()} screenPosition={position}/>
    )
  }
}
RGauger.defaultProps = {angle:180,rotate:0,start:0,end:100,thickness:10,radius:70,scale:{},direction:'clock',position:[0,0],customShapes:[]}