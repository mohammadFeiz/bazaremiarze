import React,{Component} from 'react';
import './index.css';
export default class AIOLoading extends Component {
  constructor(props){
    super(props);
    this.state = {
      name:'spin1',
    }
  }
  spin1(){
    let {config} = this.props;
    var {size = 50,thickness = 4,fill = '#000',duration = 1} = config;
    return (
      <div style={{
        width:size,height:size,
        borderTop: `${thickness}px solid ${fill}`,
        borderRight: `${thickness}px solid transparent`,
        borderRadius:'100%',
        webkitAnimation: `${duration}s rotate linear infinite`,
        animation: `${duration}s rotate linear infinite`,
      }}/>
    )
  }
  spin2(){
    let {config} = this.props;
    var {size = 50,thickness = 4,fill = '#000', empty = '#ddd',duration = 1,style} = config;
    return (
      <div style={{
        width:size,height:size,
        borderStyle:'solid',
        borderWidth:thickness,
        borderColor:empty,
        borderTopColor: fill,
        borderRadius:'100%',
        webkitAnimation: `${duration}s rotate linear infinite`,
        animation: `${duration}s rotate linear infinite`,
        ...style
      }}/>
    )
  }
  spin3(){
    let {config} = this.props;
    var {size = 50,thickness = 4,fill = '#000', empty='#ddd',duration = 1,style} = config;
    return (
      <div style={{
        width:size,height:size,
        border: `${thickness}px solid ${empty}`,
        borderStyle:'solid',
        borderWidth:thickness,
        borderColor:empty,
        borderTopColor: fill,
        borderBottomColor: fill,
        borderRadius:'100%',
        webkitAnimation: `${duration}s rotate linear infinite`,
        animation: `${duration}s rotate linear infinite`,
        ...style
      }}/>
    )
  }
  spin4(){
    let {config} = this.props;
    var {size = 80,thickness = [6,18],count = 12,fill = '#000',duration = 1.0,round = 3} = config;
    return (
      <div style={{
        position:'relative',
        display:'inline-block',
        width:size,height:size,
      }}>
        {
          Array(count).fill(0).map((o,i)=>{
            return (
              <>
                <div style={{
                  transformOrigin:`${size/2}px ${size/2}px`,
                  webkitAnimation: `${duration}s lds-spinner linear infinite`,
                  animation: `${duration}s lds-spinner linear infinite`,
                  transform:`rotate(${i * 360 / count}deg)`,
                  animationDelay:(duration/count*i) + 's'
                }}>
                  <div style={{
                  display:'block',
                  position:'absolute',
                  top:3,
                  left:(size - thickness[0]) / 2,
                  width:thickness[0],
                  height:thickness[1],
                  borderRadius:round,
                  background:fill
                }}></div>
                </div>
                
              </>
            )
          })
        }
      </div>
    )
  }
  spin5(){
    let {config} = this.props;
    var {size = 60,thickness = 3,fill = '#000',duration = 0.8} = config;
    let instyle = {
      boxSizing:'border-box',display:'block',position:'absolute',
      width: size,height: size,border:`${thickness}px solid #000`,borderRadius: '100%',
      animation: `lds-ring ${duration}s cubic-bezier(0.5, 0, 0.5, 1) infinite`,
      borderColor: `${fill} transparent transparent transparent`
    }
    return (
      <div style={{
        position:'relative',
        display:'inline-block',
        width:size,height:size
      }}>
        {
          Array(4).fill(0).map((o,i)=>{
            return (
              <div style={{...instyle,animationDelay:`${(duration - 0.5 * duration) / 4 * i}s`}}></div>
            )
          })
        }
        
      </div>
    )
  }
  dots1(){
    let {config} = this.props;
    var {gap = 2,thickness = 12,fill = '#000',duration = 1,count = 3} = config;
    let delay = duration / count
    let colors = Array.isArray(fill)?fill:[fill]
    let getStyle = (s)=>{
      return {
        width:thickness,
        height:thickness,
        borderRadius:'100%',
        webkitAnimation: `${duration}s grow ease-in-out infinite${s}`,
        animation: `${duration}s grow ease-in-out infinite ${s}s`,
      }
    }
    return (
      <div style={{
        display:'flex',justifyContent:'center',alignItems:'center',height:thickness
      }}>
        {
          new Array(count).fill(0).map((o,i)=>{
            return (
              <>
                {i !== 0 && <div style={{width:gap}}></div>}
                <div className="dot-loader" style={{...getStyle(i * delay),background:colors[i] || colors[0]}}/> 
              </>
            )
          })
        }
        
      </div>
    )
  }
  dots2(){
    let {config} = this.props;
    var {count = 8,size = 60,thickness = 4,borderRadius = 20,fill = '#000',duration = 0.8,style} = config;
    let colors = Array.isArray(fill)?fill:[fill]
    let angle = 360 / count;
    let inDuration = duration / count;
    let Thickness = Array.isArray(thickness)?thickness:[thickness,thickness];
    let getStyle1 = (i)=>{
      return {
        width:'100%',height:'100%',left:0,top:0,position:'absolute',display:'flex',alignItems:'center',
        transform:`rotate(${i * angle}deg)`,
        
      }
    }
    let getStyle2 = (i)=>{
      let color = colors[i%colors.length];
      return {
        width:Thickness[0],height:Thickness[1],background:color,borderRadius:borderRadius + 'px',
        webkitAnimation: `${duration}s opaque ease-in-out infinite both ${i * inDuration}s`,
        animation: `${duration}s opaque ease-in-out infinite both ${i * inDuration}s`,
      }
    }
    let items = [];
    for(let i = 0; i < count; i++){
      items.push(
        <div key={i} style={{...getStyle1(i)}}>
          <div style={getStyle2(i)}></div>
        </div>
      )
    }
    return (
      <div style={{position:'relative',width:size,height:size,display:'flex',alignItems:'center'}}>{items}</div>
    )
  }
  cubes1(){
    let {config} = this.props;
    var {size = 60,delays = [0.2,0.3,0.4,0.1,0.2,0.3,0,0.1,0.2],borderRadius = 0,fill = '#000',duration = 1.3,gap = 0,style} = config;
    let colors = Array.isArray(fill)?fill:[fill]
    let getStyle1 = (i)=>{
      return {
        width: `calc(33% - ${gap}px)`,height: `calc(33% - ${gap}px)`,background:colors[i % colors.length],float:'left',borderRadius:borderRadius + 'px',margin:gap / 2,
        animation: `scale ${duration}s infinite ease-in-out`,
        animationDelay:delays[i % delays.length] + 's'
      }
    }
    var items = [];
    for(var i = 0; i < 9; i++){
      items.push(<div key={i} style={getStyle1(i)}></div>)
    }
    return (
      <div class="cubes" style={{width:size,height:size}}>
        {items}
      </div>
    )
  }
  cubes2(){
    let {config} = this.props;
    var {count = 5,size,thickness = [7,30],delay = 0.1,borderRadius = 0,fill = '#000',duration = 1.3,gap = 3,style} = config;
    let colors = Array.isArray(fill)?fill:[fill]
    let Thickness = Array.isArray(thickness)?thickness:[thickness,thickness];
    let getStyle1 = (i)=>{
      return {
        width:Thickness[0],height:Thickness[1],background:colors[i % colors.length],margin:`0 ${gap/2}px`,
        animation: `${duration}s scaleY infinite ease-in-out ${i * delay}s`,
        borderRadius:borderRadius + 'px'
      }
    }
    let items = [];
    for(var i = 0; i < count; i++){
      items.push(<div key={i} style={getStyle1(i)}></div>)
    }
    return (
      <div className="rect" style={{width:size,display:'flex',alignItems:'center',justifyContent:'center'}}>
        {items}
      </div>
    )
  }
  cubes3(){
    let {config} = this.props;
    let {duration = 1,type = 1,fill = '#000',size = 68,gap = 1,count = 3} = config;
    let unit = duration / ((count * count) - ((count - 2) * (count - 2)));
    let delays;
    if(count === 3){
      delays = [1,2,3,8,9,4,7,6,5];
    }
    else if(count === 4){
      delays = [
        1,2,3,4,
        12,0,0,5,
        11,0,0,6,
        10,9,8,7
      ];
    }
    else if(count === 5){
      delays = [
        1,2,3,4,5,
        16,0,0,0,6,
        15,0,0,0,7,
        14,0,0,0,8,
        13,12,11,10,9
      ];
    }
    else if(count === 6){
      delays = [
        1,2,3,4,5,6,
        20,0,0,0,0,7,
        19,0,0,0,0,8,
        18,0,0,0,0,9,
        17,0,0,0,0,10,
        16,15,14,13,12,11
      ];
    }
    else if(count === 7){
      delays = [
        1,2,3,4,5,6,7,
        24,0,0,0,0,0,8,
        23,0,0,0,0,0,9,
        22,0,0,0,0,0,10,
        21,0,0,0,0,0,11,
        20,0,0,0,0,0,12,
        19,18,17,16,15,14,13
      ];
    }
    return (
      <div
        style={{
          width:size,height:size,
          display:'grid',
          gridTemplateColumns:Array(count).fill('auto').join(' '),
          gridGap:gap
        }}
      >
        {
          Array(count * count).fill(0).map((o,i)=>{
            let x = i % count;
            let y = Math.floor(i / count);
            let isCenter = x > 0 && x < count - 1 && y > 0 && y < count - 1
            return (
              <div
                style={{
                  animation:isCenter?'none': `${duration}s cubes3-${type} infinite ease-in-out ${delays[i] * unit}s`,
                  background:isCenter?'none':fill
                }}
              ></div>
            )
          })
        }    
      </div>
    )
    
  }
  getSameCenterCircles({count,thickness,gap,fill}){
    var getStyle1 = (i)=>{
      var offset = (((i * 2 + 1)) * gap) + ((i + 1) * 2 * thickness);
      return { 
        border:`${thickness}px solid ${fill[i] || fill[0]}`,
        position:'absolute',
        width:`calc(100% - ${offset}px)`,
        height:`calc(100% - ${offset}px)`,
        borderRadius:'100%', 
      }
    }
    var circles = [];
    for(let i = 0; i < count; i++){
      circles.push(<div key={i} className="line line1" style={getStyle1(i)}></div>)
    }
    return circles;
  }
  orbit(){
    let {config} = this.props;
    var {count = 2,size = 70,thickness = 3,gap = 3,fill=['#000'],duration = 1.3} = config;
    if(!Array.isArray(fill)){fill = [fill]}
    var circles = this.getSameCenterCircles({count,thickness,gap,fill});
    var radius = count * (thickness + gap);
    return (
          <div style={{
            width:size,height:size,
            position:'relative',display:'flex',alignItems:'center',justifyContent:'center'
          }}>
            {circles}
            <div style={{
              width:'100%',position:'absolute',height:'100%',left:0,top:0,display:'flex',alignItems:'center',justifyContent:'space-between',
              animation:`${duration}s rotate infinite linear`
            }}>
              <div style={{width:radius,height:radius,background:fill[2] || fill[0],borderRadius:'100%'}}></div>
              <div style={{width:radius,height:radius,background:fill[3] || fill[0],borderRadius:'100%'}}></div>
              
            </div>
        </div>
  
  
    )
  }
  puls(){
    let {config} = this.props;
    var {size = 30,thickness = 1,duration = 0.5,fill = ['#be65e2']} = config;
    fill = Array.isArray(fill)?fill:[fill]
    var getStyle1 = (i)=>{
      let color = fill[i] || fill[0];
      let style = {
        width:'100%',height:'100%',display:'block',border:`${thickness}px solid ${color}`,
        position:'absolute',top: 0,left: 0,borderRadius: '50%',boxSizing: 'border-box',
      }
      if(i === 0){
        style.transform = 'scale(1)';
        style.opacity = 1;
        style.webkitAnimation = `spinner-1--before ${duration}s linear infinite`;
        style.animation = `spinner-1--before ${duration}s linear infinite`;
      }
      else {
        style.transform = 'scale(0)';
        style.opacity = 0;
        style.webkitAnimation = `spinner-1--after ${duration}s linear infinite`;
        style.animation = `spinner-1--after ${duration}s linear infinite`;
      }
      return style;
    }
    return (
      <div className='spinonediv-1' style={{width:size,height:size,borderRadius:'100%',position:'absolute'}}>
        <div style={getStyle1(0)}></div>
        <div style={getStyle1(1)}></div>
      </div>
    )
  }
  puls1(){
    let {config} = this.props;
    var {size = 50,duration = 1,fill = ['#000']} = config;
    fill = Array.isArray(fill)?fill:[fill]
    let getStyle1 = (i)=>{
      let animation = `ball-scale-multiple ${duration}s 0s linear infinite`
      let style = {
        background:fill[i] || fill[0],
        borderRadius:'100%',position:'absolute',
        width:'100%',height:'100%',
        webkitAnimation: animation,
        animation:animation
      }
      if(i === 1){
        style.webkitAnimationDelay = '-0.4s';
        style.animationDelay = '-0.4s';
      }
      else if(i === 2){
        style.webkitAnimationDelay = '-0.2s';
        style.animationDelay = '-0.2s';
      }
      return style
    }
    return (
        <div style={{
          width:size,height:size,display:'flex',
          alignItems:'center',justifyContent:'cennter',position:'relative'
        }}>
          <div style={getStyle1(0)}></div>
          <div style={getStyle1(1)}></div>
          <div style={getStyle1(2)}></div>
        </div>
      
    )
  }

  render() {
    let {config} = this.props;
    let {name} = config;
    return this[name]()
  }
}