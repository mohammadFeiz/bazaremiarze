import React,{Component, createRef} from 'react';
import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
import {Icon} from '@mdi/react';
import { mdiPlus,mdiMinus, mdiTrashCanOutline } from '@mdi/js';
import AIOButton from './../../../npm/aio-button/aio-button';
import InlineNumberKeyboard from '../../inline-number-keyboard/inline-number-keyboard';
import $ from 'jquery';
import './index.css';
export default class ProductCount extends Component{
    constructor(props){
        super(props);
        let {value} = this.props;
        this.state = {value,prevValue:value,popup:false}
    }
    change(value,min = this.props.min || 0){
        let {onChange,max = Infinity} = this.props;
        this.setState({value});
        clearTimeout(this.changeTimeout);
        this.changeTimeout = setTimeout(()=>{
            
            if(!isNaN(+value)){
                if(+value > max){value = max}
                if(+value < min){value = min}
            }
            onChange(value)
        },500)
        
    }
    touchStart(dir,touch,isTouch){
        if(touch && !isTouch){return}
        if(!touch && isTouch){return}
        let {value} = this.state;
        this.change(value + dir)
        if(touch){$(window).bind('touchend',$.proxy(this.touchEnd,this))}
        else{$(window).bind('mouseup',$.proxy(this.touchEnd,this))}
        // clearTimeout(this.timeout);
        // clearInterval(this.interval);
        // this.timeout = setTimeout(()=>{
        //   this.interval = setInterval(()=>{
        //     let {value} = this.state;
        //     let {min = 0} = this.props;
        //     this.change(value + dir,Math.max(min,1))
        //   },60)
        // },800)
      }
      touchEnd(){
        $(window).unbind('touchend',this.touchEnd)
        $(window).unbind('mouseup',this.touchEnd)
        // clearTimeout(this.timeout)
        // clearInterval(this.interval) 
      }
    render(){
        let {value,prevValue,popup} = this.state;
        let {min = 0,onChange,max = Infinity,style} = this.props;
        if(this.props.value !== prevValue){setTimeout(()=>this.setState({value:this.props.value,prevValue:this.props.value}),0)}
        let touch = 'ontouchstart' in document.documentElement;
        return (
            <>
                <RVD
                layout={{
                    childsProps: { align: "vh" },
                    style:{height:36,...style},
                    attrs:{onClick:(e)=>e.stopPropagation()},
                    row: [
                        {
                            html: (
                                <div 
                                    onMouseDown={(e)=>this.touchStart(1,touch,false)} 
                                    onTouchStart={(e)=>this.touchStart(1,touch,true)} 
                                    className={'product-count-button' + (value >= max?' disabled':'')}
                                >
                                    <Icon path={mdiPlus} size={0.8}/>
                                </div>
                            ),
                            show:onChange!== undefined
                        },
                        { 
                            show:!!value,
                            html:(
                                <div type='number' onClick={()=>this.setState({popup:true})} className='product-count-input'>{value}</div>
                            )
                        },
                        {
                            html: ()=>(
                                <div 
                                    onMouseDown={(e) =>this.touchStart(-1,touch,false)} 
                                    onTouchStart={(e) =>this.touchStart(-1,touch,true)} 
                                    className='product-count-button'
                                >
                                    <Icon path={mdiMinus} size={0.8}/>
                                </div>),
                            show:value > 1 && onChange!== undefined
                        },
                        {
                            html: ()=>(
                                <div 
                                    onClick={(e)=>this.change(0)} 
                                    className='product-count-button'
                                >
                                    <Icon path={mdiTrashCanOutline} size={0.8}/>
                                </div>
                            ),
                            show:value === 1 && onChange!== undefined
                        },
                    ] 
                }}
            />
            {
                popup &&
                <RVD
                    layout={{
                        style:{position:'fixed',left:0,top:0,width:'100%',height:'100%',zIndex:10,background:'rgba(0,0,0,0.5)'},
                        column:[
                            {
                                html:(
                                    <CountPopup
                                        value={value}
                                        onRemove={()=>{
                                            this.change(0)
                                            this.setState({popup:false})
                                        }}
                                        onChange={(value)=>{
                                            this.change(value)
                                            this.setState({popup:false})
                                        }}
                                    />
                                )
                            },
                            {
                                flex:1,
                                onClick:()=>this.setState({popup:false})
                            }
                        ]
                    }}
                />
            }
            </>
        )
    }
}

class CountPopup extends Component{
    constructor(props){
        super(props);
        this.dom = createRef();
        this.state = {value:props.value}
    }
    render(){
        let {value} = this.state;
        let {onRemove,onChange} = this.props;
        return (
            <RVD
                layout={{
                    style:{padding:12,background:'#fff',flex:'none',height:'fit-content',width:'100%'},
                    column:[
                        {html:'?????????? ???? ???????? ????????',className:'fs-12 bold theme-medium-font-color'},
                        {size:6},
                        {
                            gap:3,
                            row:[
                                {
                                    flex:1,
                                    html:(
                                        <input 
                                            type='number' value={value} min={0}
                                            ref={this.dom}
                                            onChange={(e)=>{
                                                let val = e.target.value;
                                                this.setState({value:val});
                                            }}
                                            onClick={()=>{
                                                $(this.dom.current).focus().select()
                                            }}
                                            style={{width:'100%',border:'none',border:'1px solid lightblue',height:36,textAlign:'center',borderRadius:4}}
                                        />
                                    )
                                },
                                
                                
                            ]
                        },
                        {size:12},
                        {
                            row:[
                                {
                                    flex:1,
                                    html:(
                                        <button 
                                            className='button-2' style={{background:'red',border:'none'}}
                                            onClick={()=>onRemove()}
                                        >?????? ??????????</button>
                                    )
                                },
                                {size:12},
                                {
                                    flex:1,
                                    html:(
                                        <button onClick={()=>onChange(value)} className='button-2'>
                                                ??????????
                                        </button>
                                    )
                                },
                            ]
                        },
                        {size:24}
                    ]
                }}
            />
        )
    }
}