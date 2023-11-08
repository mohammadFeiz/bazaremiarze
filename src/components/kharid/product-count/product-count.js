import React,{Component} from 'react';
import RVD from './../../../npm/react-virtual-dom/react-virtual-dom';
import {Icon} from '@mdi/react';
import { mdiPlus,mdiMinus, mdiTrashCanOutline } from '@mdi/js';
import appContext from '../../../app-context';
import $ from 'jquery';
import './index.css';
export default class ProductCount extends Component{
    static contextType = appContext;
    constructor(props){
        super(props);
        let {value} = this.props;
        this.state = {value,prevValue:value,popup:false}
    }
    change(value,min = this.props.min || 0){
        value = +value;
        if(isNaN(value)){value = 0}
        let {onChange,max = Infinity} = this.props;
        this.setState({value});
        clearTimeout(this.changeTimeout);
        this.changeTimeout = setTimeout(()=>{
            if(value > max){value = max}
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
      openPopup(){
        let {openPopup,rsa} = this.context;
        let {value} = this.state;
        let config = {
            onChange:(value)=>{
                this.change(value);
                rsa.removeModal()
            },
            onRemove:()=>{
                this.change(0)
                rsa.removeModal()
            },
            onClose:()=>{
                rsa.removeModal()
            },
            value,
        }
        openPopup('count-popup',config)
      }
    render(){
        let {value,prevValue} = this.state;
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
                                    <Icon path={mdiPlus} size={1}/>
                                </div>
                            ),
                            align:'vh',
                            show:onChange!== undefined
                        },
                        { 
                            show:!!value,
                            flex:1,
                            html:(
                                <div
                                    className='product-count-input'
                                    onClick={()=>this.openPopup()}
                                >{value}</div>
                            )
                        },
                        {
                            html: ()=>(
                                <div 
                                    onMouseDown={(e) =>this.touchStart(-1,touch,false)} 
                                    onTouchStart={(e) =>this.touchStart(-1,touch,true)} 
                                    className='product-count-button'
                                >
                                    <Icon path={mdiMinus} size={1}/>
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
            </>
        )
    }
}

