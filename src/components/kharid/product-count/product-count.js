import React,{Component, createRef} from 'react';
import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
import {Icon} from '@mdi/react';
import { mdiPlus,mdiMinus, mdiTrashCanOutline } from '@mdi/js';
import AIOButton from './../../../interfaces/aio-button/aio-button';
import $ from 'jquery';
import './index.css';
export default class ProductCount extends Component{
    constructor(props){
        super(props);
        let {value} = this.props;
        this.state = {value,prevValue:value}
    }
    change(value,min = this.props.min || 0){
        let {onChange,max = Infinity} = this.props;
        if(value > max){return}
        this.setState({value});
        clearTimeout(this.changeTimeout);
        this.changeTimeout = setTimeout(()=>{
            if(value < min){value = min}
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
        let {value,prevValue} = this.state;
        let {min = 0,onChange,max = Infinity} = this.props;
        if(this.props.value !== prevValue){setTimeout(()=>this.setState({value:this.props.value,prevValue:this.props.value}),0)}
        let touch = 'ontouchstart' in document.documentElement;
        return (
            <RVD
                layout={{
                    childsProps: { align: "vh" },
                    style:{height:36},
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
                            flex: 1, show:!!value,
                            html:(
                                <AIOButton
                                    type='button'
                                    caret={false}
                                    position='top'
                                    text={value}
                                    popOver={({toggle})=>{
                                        return (
                                            <CountPopup value={value}
                                                onChange={(value)=>{
                                                    value = +value;
                                                    if(isNaN(value)){value = 0}
                                                    this.change(value)
                                                    toggle()
                                                }}
                                                onRemove={()=>{
                                                    this.change(0);
                                                    toggle()
                                                }}
                                            />
                                        )
                                    }}
                                />
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
                    style:{padding:12,background:'#fff',flex:'none',height:'fit-content'},
                    column:[
                        {html:'تعداد را وارد کنید',className:'fs-12 bold color605E5C'},
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
                                        >حذف محصول</button>
                                    )
                                },
                                {size:12},
                                {
                                    flex:1,
                                    html:(
                                        <button onClick={()=>onChange(value)} className='button-2'>
                                                تایید
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