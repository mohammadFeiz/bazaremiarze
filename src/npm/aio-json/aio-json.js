import React,{Component,createRef} from "react";
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import {Icon} from '@mdi/react';
import {mdiClose,mdiPlusThick,mdiCog,mdiChevronRight,mdiChevronDown,mdiContentCopy} from '@mdi/js';
import AIOButton from './../../npm/aio-button/aio-button';
import Slider from './../../npm/aio-slider/aio-slider'; 
import $ from 'jquery';
import "./index.css";
export default class AIOJson extends Component {
  constructor(props){
    super(props);
    let {json = false} = this.props;
    let variables = false;
    if(json){variables = this.regenerate(json)}
    this.state = {
      _open:true,
      space:20,
      indent:10,height:16,fontSize:10,
      variableColor:'#ff0000',numberColor:'green',textColor:'#b81515',booleanColor:'#0000ff',background:'#eee',
      generated:false,border:'#e3e3e3',
      variables,json,prevJson:JSON.stringify(json)
    }
  }
  regenerate(json){
    let type = this.getType(json);
    let res = []
    if(type === 'array'){
      for(let i = 0; i < json.length; i++){res.push(this.regenerateReq(json[i]))} 
    }
    else if(type === 'object'){
      for(let prop in json){res.push(this.regenerateReq(json[prop],prop))} 
    }
    
    return res
  }
  getType(o){
    if(Array.isArray(o)){return 'array'}
    let type = typeof o;
    if(type === 'object'){return 'object'}
    if(type === 'number'){return 'number'}
    if(type === 'boolean'){return 'boolean'}
    return 'text'
  }
  regenerateReq(o,name){
    let type = this.getType(o);
    if(type === 'text' || type === 'number' || type === 'boolean'){return {type,name,value:o}}
    if(type === 'array'){return {type:'array',name,value:o.map((p)=>this.regenerateReq(p))}}
    if(type === 'object'){
      let res = {type:'object',name,value:[]}
      for(let prop in o){res.value.push(this.regenerateReq(o[prop],prop))}
      return res;
    }
  }
  generate(){
    let {variables,json} = this.state;
    if(json === false){return}
    let type = this.getType(json);
    if(type === 'object'){
      this.res = {}
      for(let i = 0; i < variables.length; i++){
        let variable = variables[i];
        let {name} = variable;
        this.res[name] = this.generateReq(variable)
      }
      return this.res
    }
    else if(type === 'array'){
      this.res = []
      for(let i = 0; i < variables.length; i++){
        let variable = variables[i];
        this.res.push(this.generateReq(variable))
      }
      return this.res
    }
  }
  generateReq({type,value}){
    if(type === 'text' || type === 'number' || type === 'boolean'){return value}
    if(type === 'array'){
      let res = [];
      for(let i = 0; i < value.length; i++){
        res.push(this.generateReq(value[i]))
      }
      return res;
    }
    if(type === 'object'){
      let res = {};
      for(let i = 0; i < value.length; i++){
        res[value[i].name] = this.generateReq(value[i])
      }
      return res;
    }
    
    
  }
  getAddButton(onClick,init){
    let {space} = this.state;
    return {
      size:space,align:'vh',
      html:(
        <AIOButton 
          caret={false} type='select' className='json-builder-add' text={<Icon path={mdiPlusThick} size={0.5}/>}
          options={[
            {text:'text',value:'text',style:{height:24,display:init?'none':undefined}},
            {text:'number',value:'number',style:{height:24,display:init?'none':undefined}},
            {text:'boolean',value:'boolean',style:{height:24,display:init?'none':undefined}},
            {text:'array',value:'array',style:{height:24}},
            {text:'object',value:'object',style:{height:24}},
          ]}
          onChange={(value)=>onClick(value)}
        />
      )
    }
  }
  getRemoveButton(o,index,isRoot){
    let {variables,space} = this.state;
    return { 
      size:space,align:'vh',
      html:(
        <AIOButton 
          type='button' caret={false} className='json-builder-button' text={<Icon path={mdiClose} size={0.6}/>}
          onClick={()=>{
            if(isRoot){this.setState({variables:false,json:false},()=>this.changeVariables())}
            else {o.splice(index,1); this.setState({variables},()=>this.changeVariables())}
          }}
        />
      )
    }
  }
  getCloneButton(parent,index,o){
    let {variables,space} = this.state;
    return { 
      size:space,align:'vh',
      html:(
        <AIOButton 
          type='button' caret={false} className='json-builder-button' text={<Icon path={mdiContentCopy} size={0.5}/>}
          onClick={()=>{
            parent.splice(index + 1,0,JSON.parse(JSON.stringify(o))); 
            this.setState({variables},()=>this.changeVariables())
          }}
        />
      )
    }
  }
  getToggleButton(o){
    let {_open = true} = o;
    let {space} = this.state;
    return {size:space,align:'vh',html:(
      <AIOButton 
        type='button' caret={false} className='json-builder-button'
        text={<Icon path={!_open?mdiChevronRight:mdiChevronDown} size={0.5}/>}
        onClick={()=>{o._open = !_open; this.setState({})}}
      />
    )}
  }
  getSettingButton(){
    let {indent,height,fontSize,space} = this.state;
    return {size:space,align:'vh',html:(
      <AIOButton 
        type='button' caret={false} className='json-builder-button' text={<Icon path={mdiCog} size={0.5}/>} style={{padding:0}}
        popOver={()=>{
          return (
            <RVD
              layout={{
                attrs:{style:{fontSize:12}},
                column:[
                  {
                    size:24,
                    row:[
                      {size:12},
                      {size:60,html:'Indent',align:'v'},
                      {
                        size:160,
                        html:(
                          <Slider start={10} end={36}
                            attrs={{style:{height:24}}}
                            showValue={false}
                            points={[indent]}
                            onChange={(points)=>this.setState({indent:points[0]})}
                          />
                        )
                      },
                      {size:48,html:indent,align:'vh'}
                    ]
                  },
                  {
                    size:24,
                    row:[
                      {size:12},
                      {size:60,html:'Height',align:'v'},
                      {
                        size:160,
                        html:(
                          <Slider start={12} end={36}
                            attrs={{style:{height:24}}}
                            showValue={false}
                            points={[height]}
                            onChange={(points)=>this.setState({height:points[0]})}
                          />
                        )
                      },
                      {size:48,html:height,align:'vh'}
                    ]
                  },
                  {
                    size:24,
                    row:[
                      {size:12},
                      {size:60,html:'FontSize',align:'v'},
                      {
                        size:160,
                        html:(
                          <Slider start={10} end={28} attrs={{style:{height:24}}} showValue={false} points={[fontSize]}
                            onChange={(points)=>this.setState({fontSize:points[0]})}
                          />
                        )
                      },
                      {size:48,html:fontSize,align:'vh'}
                    ]
                  }
                ]
              }}
            />
          )
        }}
      />
    )}
  }
  changeVariables(){
    if(this.props.onChange){
      let res = this.props.onChange(this.generate());
      if(res !== undefined){
        this.setState({json:res,variables:this.regenerate(res)})
      }
    }
  }
  getSpace(){return {size:20}}
  getColumn(o,level,index,parent){
    return this[`get${{text:'NT',number:'NT',array:'AO',object:'AO',boolean:'Bool'}[o.type]}Variable`](o,level,index,parent)
  }
  getNTVariable(o,level,index,parent){
    let {type,name,value = type === 'text'?'':0} = o,{indent,height,variableColor,numberColor,textColor,border} = this.state;
    let color = type === 'text'?textColor:numberColor;
    return {
      attrs:{style:{borderBottom:`1px solid ${border}`}},size:height,
      childsProps:{align:'v'},
      row:[
        this.getSpace(),
        {size:level * indent},
        {
          show:name !== undefined,
          html:()=><TextField color={variableColor} canEmpty={false} value={name} canSpace={false} onChange={(v)=>{o.name = v; this.changeVariables()}}/>
        },
        {show:name !== undefined,html:':',attrs:{style:{color:variableColor}}},
        {show:type==='text',html:'"',attrs:{style:{color}}},
        {html:<TextField color={type === 'text'?textColor:color} type={type} value={value} onChange={(v)=>{o.value = v;  this.changeVariables()}}/>},
        {show:type==='text',html:'"',attrs:{style:{color}}},
        {html:','},
        {flex:1},
        this.getRemoveButton(parent,index),
        this.getCloneButton(parent,index,o)
      ]
    }
  }
  getBoolVariable(o,level,index,parent){
    let {name,value} = o,{variables,indent,height,variableColor,booleanColor,border} = this.state;
    return {
      attrs:{style:{borderBottom:`1px solid ${border}`,padding:0}},size:height,
      childsProps:{align:'v'},
      row:[
        this.getSpace(),
        {size:level * indent},
        {show:name !== undefined,html:()=><TextField canEmpty={false} color={variableColor} value={name} canSpace={false} onChange={(v)=>{o.name = v; this.changeVariables()}}/>},
        {show:name !== undefined,html:':',attrs:{style:{color:variableColor}}},
        {attrs:{style:{overflow:'hidden'}},html:(
          <AIOButton style={{background:'none',fontSize:'inherit',color:booleanColor}}
            type='select' value={value} caret={false} 
            options={[{text:'false',value:false,style:{height:24}},{text:'true',value:true,style:{height:24}}]} 
            onChange={(v)=>{o.value = v; this.setState({variables},()=>this.changeVariables())}}
          />
        )},
        {html:','},
        {flex:1},
        this.getRemoveButton(parent,index),
        this.getCloneButton(parent,index,o)
      ]
    }
  }
  getAOVariable(o,level,index,parent){
    let {name,value,_open = true} = o,{indent,height,variableColor,border} = this.state,column = []
    column.push(
      {
        attrs:{style:{borderBottom:`1px solid ${border}`}},size:height,
        childsProps:{align:'v'},
        row:[
          level === 0?this.getSettingButton():this.getToggleButton(o),
          {size:level * indent},
          {show:name !== undefined,html:()=>(<TextField canEmpty={false} color={variableColor} value={name} canSpace={false} onChange={(v)=>{o.name = v; this.changeVariables()}}/>)},
          {show:name !== undefined,html:':',attrs:{style:{color:variableColor}}},
          {html:o.type === 'array' ? '[' : '{'},
          this.getAddButton((type)=>this.add(o.value,type,o.type === 'object')),
          {flex:1},
          this.getRemoveButton(parent,index,level === 0),
          level === 0?this.getSpace():this.getCloneButton(parent,index,o)
        ]
      }
    )
    if(_open){for(let i = 0; i < value.length; i++){column.push(this.getColumn(value[i],level + 1,i,value))}}
    column.push({
      attrs:{style:{borderBottom:`1px solid ${border}`}},size:height,
      childsProps:{align:'v'},
      row:[
        this.getSpace(),
        {size:level * indent},
        {html:o.type === 'array' ? ']' : '}'},
        {html:','},
        {flex:1},
        this.getSpace(),
        this.getSpace()
      ]
    })
    return {column}
  }
  add(o,type,hasName){
    let obj;
    if(type === 'text'){obj = {type,value:''}}
    else if(type === 'number'){obj = {type,value:0}}
    else if(type === 'boolean'){obj = {type,value:false}}
    else if(type === 'array'){obj = {type,value:[],_open:true}}
    else if(type === 'object'){obj = {type,value:[],_open:true}}
    if(hasName){obj.name = 'untitle'}
    o.push(obj);
    this.setState({},()=>{
      if(this.props.onChange){
        this.changeVariables()
      }
    })
    
  }
  onSubmit(){ 
    let {onSubmit} = this.props;
    onSubmit(this.generate())
  }
  getHeader(mode){
    let {variables,_open,json} = this.state,column = [];
    let {onSubmit,onClose} = this.props;
    if(_open){column.push(this.getColumn({type:'object',value:variables},0,0,variables))}
    return {
      size:36,attrs:{className:'json-builder-header'},align:'v',
      row:[
        {
          flex:1,html:(
            <AIOButton 
              optionIconSize={[14,12 ,1]}
              optionIconColor={'#fff'}
              style={{color:'inherit',fontSize:'inherit'}}
              type='radio' value={mode} optionWidth='fit-content' 
              optionStyle={{height:36}}
              options={[{text:'JSON Builder',value:'builder'},{text:'JSON Preview',value:'preview'}]}
              onChange={(value)=>{
                if(value === 'builder'){this.setState({generated:false})}
                else {this.setState({generated:JSON.stringify(this.generate(json),undefined,4)})}
              }}
            />
          )
        },
        {
          show:onSubmit !== undefined,
          html:<button className='json-builder-submit' onClick={()=>this.onSubmit()}>Submit</button>
        },
        {
          show:onClose !== undefined,size:48,
          align:'vh',html:<button className='json-builder-close' onClick={()=>this.onClose()}>
            <Icon path={mdiClose} size={1.5}/>
          </button>
        },
      ]
    }
  }
  render(){ 
    if(this.props.onChange){
      if(JSON.stringify(this.props.json) !== this.state.prevJson){
        setTimeout(()=>{
          this.setState({json:this.props.json,prevJson:JSON.stringify(this.props.json),variables:this.regenerate(this.props.json)})
        },0)
      }
    }
    let {variables,_open,fontSize,generated,json} = this.state,column = [];
    let {className,style} = this.props;
    if(variables === false){
      column.push(
        {
          row:[
            this.getAddButton(
          (type)=>this.setState({json:type === 'array'?[]:{},variables:this.regenerate(type === 'array'?[]:{})}),
          true
        )
          ]
        }
      )
    }
    else {
      let type = this.getType(json);
      if(_open){column.push(this.getColumn({type,value:variables},0,0,variables))}
    
    }
    let mode = generated === false?'builder':'preview';
    return (
      <RVD
        layout={{
          attrs:{className:'json-builder' + (className?' ' + className:''),style},
          column:[
            this.getHeader(mode),
            {
              flex:1,show:mode === 'builder',attrs:{style:{padding:12}},
              html:<RVD layout={{style:{fontSize},className:'ofy-auto',column}}/>
            },
            {show:mode === 'preview',flex:1,className:'ofy-auto',html:<pre>{generated}</pre>,style:{padding:12}}
          ]
        }}
      />
    )
  }
}

class TextField extends Component{
  constructor(props){
    super(props);
    this.dom = createRef()
    this.state = {edit:false,value:this.props.value,prevValue:this.props.value}
  }
  componentDidUpdate(){
    let input = $(this.dom.current);
    if(!input || !input.length){return;}
    if(!input.is(":focus")){
      input.focus().select();
    }
  }
  render(){
    let {edit} = this.state;
    let {onChange,canSpace = true,type='text',color,canEmpty = true} = this.props;
    let {value,prevValue} = this.state;
    if(this.props.value !== prevValue){
      setTimeout(()=>this.setState({value:this.props.value,prevValue:this.props.value}),0);
    }
    if(edit){
      return (
        <input 
          type={type} ref={this.dom} className='text-field-input' value={value} 
          onBlur={()=>{
            this.setState({edit:false})
            onChange(this.state.value)
          }} 
          onChange={(e)=>{
            let value = e.target.value;
            if(type === 'number'){value = parseFloat(value)}
            if(!canSpace){value = value.replace(/\s/g,'');}
            this.setState({value})}
          }
        />
      )
    }
    else{
      return (
        <div 
          className='text-field-text' onClick={()=>this.setState({edit:true})}
          style={{background:!value.toString().length && !canEmpty?'red':undefined,color}}
        >{value}</div>
      )
    }
  }
}