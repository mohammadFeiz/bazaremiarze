import React,{Component,createRef} from 'react';
import {Icon} from '@mdi/react';
import {mdiClose,mdiChevronDown,mdiPlusThick} from '@mdi/js';
import AIOSwip from './../aio-swip/aio-swip';
import {Popover} from './../aio-popup/aio-popup';
import $ from 'jquery'
import './input.css';

export default class Input extends Component{
    constructor(props){
      super(props);
      this.dataUniqId = 'ai' + Math.round(Math.random() * 10000000)
      this.dom = createRef();
      this.container = createRef();
      this.state = {value:props.value,prevValue:props.value,error:false,open:false} 
      $(window).on('click',(e)=>this.handleClick(e))
    }
    handleClick(e){
      let target = $(e.target);
      if(target.attr('data-uniq-id') === this.dataUniqId){
        return
      }
      if(target.parents(`[data-uniq-id=${this.dataUniqId}]`).length){
        return
      }
      this.setState({open:false})
    }
    change(value){
      let {onChange} = this.props;
      if(!onChange){return}
      let {type,maxLength = Infinity,justNumber,delay = 400,filter = []} = this.props;
      if (type === 'number') {
        if(value){value = +value;}
      }
      else if(type === 'text' || value === 'textarea'){
        if(value){
          if(justNumber){
            value = value.toString();
            let lastChar = value[value.length - 1];
            if(isNaN(+lastChar)){value = value.slice(0,value.length - 1)}
          }
          if(filter.length){
            value = value.toString();
            let lastChar = value[value.length - 1];
            if(filter.indexOf(lastChar) !== -1){value = value.slice(0,value.length - 1)}
          }
          if(value.toString().length > maxLength){
            value = value.toString().slice(0,maxLength);
          }
        }
      }
      this.setState({value});
      clearTimeout(this.timeout);
      this.timeout = setTimeout(()=>{
        onChange(value);
      },delay);
    }
    getOptions(){
      let {optionText,options = []} = this.props;
      let {value} = this.state;
      let res = options.map((option,index)=>{
        let text;
        if(typeof option === 'object' && option.text !== undefined){text = option.text}
        else if(typeof optionText === 'function'){
          text = optionText(option,index)
        }
        else if(typeof optionText === 'string'){
          try{eval(`text = ${optionText}`)}
          catch{text = ''}
        }
        else {text = ''}
        return text
      })
      return res.filter((o)=>!value || o.indexOf(value) !== -1)
    }
    componentDidMount(){
      let {type,min,max,swip} = this.props;
      if(type === 'number' && swip){
        AIOSwip({
          speedY:0.2,
          dom:$(this.dom.current),
          start:()=>{
            this.so = this.state.value;
          },
          move:({dx,dy,dist})=>{
            let newValue = -dy + this.so
            if(min !== undefined && newValue < min){return}
            if(max !== undefined && newValue > max){return}
            this.change(newValue)
          }
        })
      }
    }
    componentDidUpdate(){
      let {type,autoHeight,delay = 400} = this.props;
      if(type === 'textarea' && autoHeight){
        let dom = this.dom.current;
        dom.style.height = 'fit-content';
        let scrollHeight = dom.scrollHeight + 'px'
        dom.style.height = scrollHeight;
        dom.style.overflow = 'hidden';
        dom.style.resize = 'none';
      }
      clearTimeout(this.rrt)
      if(this.state.value !== this.props.value){
        this.rrt = setTimeout(()=>this.setState({value:this.props.value}),delay + 10)
      }
    }
    getInput(){
      let {attrs = {},type,onChange,spin} = this.props;
      let {error,value} = this.state;   
      if(error !== false){
        return <div className='aio-form-inline-error aio-form-input' onClick={()=>this.setState({error:false})}>{error}</div>
      }
      let props = {
         ...attrs,value,type,ref:this.dom,
         className:spin === false?'no-spin':'',
         onChange:(e)=>this.change(e.target.value)
      }
      if(typeof onChange !== 'function'){return <div className='aio-input-value'>{value}</div>}
      else if(type === 'textarea'){return <textarea {...props}/>}
      else {return (<input {...props}/>)}
    }
    getBefore(){
      let {before} = this.props;
      return (
        <div className='aio-input-before'>
          {before}
        </div>
      )
    }
    getAfter(){
      let {after} = this.props;
      return (
        <div className='aio-input-after'>
          {after}
        </div>
      )
    }
    getSubtext(){
      let {subtext} = this.props;
      return (
        <div className='aio-input-subtext'>
          {subtext}
        </div>
      )
    }
    getPopup(){
      let {open} = this.state;
      if(!open){return null}
      let options = this.getOptions()
      if(!options.length){return null}
      let getTarget = ()=>$(this.container.current);
      
      return (
        <Popover
          popupWidth='fit'
          id={this.dataUniqId}
          backdrop={false}
          attrs={{style:{padding:0}}}
          body={()=>{
            return (
              <div className='aio-input-options'>
                {
                  options.map((o,i)=>{
                    return (
                      <div key={i} className='aio-input-option' onClick={()=>this.change(o)}>{o}</div>
                    )
                  })
                }
              </div>
            )
          }}
          getTarget={getTarget}
        />
      )
    }
    getCaret(){
      let {options = []} = this.props;
      if(!options.length){return null}
      return (
        <div className='aio-input-caret'>
          <Icon path={mdiChevronDown} size={0.7}/>
        </div>
      )
    }
    render(){
      let {type,label,className} = this.props;
      return (
        <>
          <div 
            ref={this.container} 
            data-uniq-id={this.dataUniqId}
            className={`aio-input aio-input-${type}${className?' ' + className:''}`} 
            data-label={label?label:undefined}
            onClick={()=>this.setState({open:!this.state.open})}
          >
            {this.getBefore()}
            <div className='aio-input-value-container'>
              {this.getInput()}
              {this.getSubtext()}
            </div>
            {this.getAfter()}
            {this.getCaret()}
          </div>
          {this.getPopup()}
        </>
      )
    }
  }
  