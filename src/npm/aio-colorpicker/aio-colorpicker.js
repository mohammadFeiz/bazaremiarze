import React,{Component,createRef} from "react";
import Slider from './../../npm/aio-slider/aio-slider';
import AIOSwip from './../../npm/aio-swip/aio-swip';
import $ from 'jquery';
import './index.css';
export default class AIOColorpicker extends Component {
    constructor() {
      super();
      this.state = {value:0,brightness:0,darkness:0};
      this.dom = createRef();
      this.r = 255; this.g = 0; this.b = 0;
    }
    getValueByPercent(percent,start,end){return start + (percent * (end - start) / 100)}
    convertValueToRGB(value){
      var r,g,b;
      value *= 6;
      //value 0 255
      //r 255
      //g 0
      //b 0 255
      if(value <= 255){r = 255; g = 0; b = value;} //255,0,0  =>  255,0,255
      //value 256 510
      //r 0 254
      //g 0 
      //b 255
      else if(value <= 510){r = 510 - value; g = 0; b = 255;} //254,0,255  =>  0,0,255 
      //value 511 765
      //r 0
      //g 1 255
      //b 255
      else if(value <= 765){r = 0; g = value - 510; b = 255;} //0,1,255 => 0,255,255
      //value 766 1020
      //r 0
      //g 255
      //b 0 254
      else if(value <= 1020){r = 0; g = 255; b = 1020 - value;} //0,255,254 => 0,255,0
      //value 1021 1275
      //r 1 255
      //g 255 
      //b 0
      else if(value <= 1275){r = value - 1020; g = 255; b = 0;} //1,255,0 => 255,255,0
      //value 1276 1530
      //r 255
      //g 0 254
      //b 0
      else if(value <= 1530){r = 255; g = 1530 - value; b = 0;} //255,254,0 => 255,0,0
      this.r = r; this.g = g; this.b = b
      var rgb = `rgb(${r},${g},${b})`;
      return rgb;
    }
    getFinalColor(){
      var {darkness,brightness} = this.state;
      var r = this.r + ((255 - this.r) * brightness / 100); if(r > 255){r = 255;}
      r = r - (r * darkness / 100); if(r < 0){r = 0;}
      var g = this.g + ((255 - this.g) * brightness / 100); if(g > 255){g = 255;}
      g = g - (g * darkness / 100); if(g < 0){g = 0;}
      var b = this.b + ((255 - this.b) * brightness / 100); if(b > 255){b = 255;}
      b = b - (b * darkness / 100); if(b < 0){b = 0;} 
      return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`
    }
    update({xp,yp}){
      xp = 100 - xp;
      if(xp > 100){xp = 100;}
      else if(xp < 0){xp = 0;}
      if(yp > 100){yp = 100;}
      else if(yp < 0){yp = 0;}
      this.setState({brightness:xp,darkness:yp})
    }
    componentDidMount(){
        AIOSwip({
            dom:$(this.dom.current),
            start:({mousePosition})=>this.update(mousePosition),
            move:({mousePosition})=>this.update(mousePosition)
        })
    }
    render() {
      var {r,g,b,value,brightness,darkness} = this.state;
      var finalColor = this.getFinalColor();
      return (
        <div className='r-color-picker'>
          <div className='r-color-picker-pallet'>
            <div ref={this.dom} className='r-color-picker-pool' style={{background:this.convertValueToRGB(value)}}>
              <div className='r-color-picker-white'></div>
              <div className='r-color-picker-black'></div>
              <div className='r-color-picker-handle' style={{right:brightness + '%',top:darkness + '%'}}><div></div>  </div>
            </div>
            <Slider 
              direction='right' start={0} end={255} points={[value]} showValue={false}
              attrs={{className:'r-color-picker-slider'}}
              pointStyle={()=>{return {width:'3px',borderRadius:0,height:'20px',background:'#fff',boxShadow:'0 0 0 1px #000'}}}
              lineStyle={()=>{return {display:'none'}}}
              onChange={(points)=>this.setState({value:points[0]})}
            />
          </div>
          <div className='r-color-picker-result' style={{background:finalColor}}>
          </div>
        </div>
      );
    }
  }