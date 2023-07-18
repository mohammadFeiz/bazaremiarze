import React,{Component,createRef} from "react";
import RVD from './../../../npm/react-virtual-dom/react-virtual-dom';
import $ from 'jquery';
import { mdiMinusThick, mdiPlusThick } from "@mdi/js";
import {Icon} from '@mdi/react';
export default class CountPopup extends Component{
    constructor(props){
        super(props);
        this.dom = createRef();
        this.state = {value:props.value}
    }
    offset(v){
        let {value} = this.state;
        value = +value;
        if(isNaN(value)){value = 0}
        value += v;
        if(value < 0){value = 0}
        return value;
    }
    change(v){
        this.eventHandler('window','mouseup',$.proxy(this.mouseup,this));
        this.setState({value:this.offset(v)});
        clearTimeout(this.timeout)
        clearInterval(this.interval)
        this.timeout = setTimeout(()=>{
            this.interval = setInterval(()=>{
                this.setState({value:this.offset(v)});
            },10);
        },700)
    }
    mouseup(){
        this.eventHandler('window','mouseup',this.mouseup,'unbind');
        clearTimeout(this.timeout)
        clearInterval(this.interval)
    }
    eventHandler(selector, event, action, type = "bind") {
        var me = {mousedown: "touchstart",mousemove: "touchmove",mouseup: "touchend"};
        event = "ontouchstart" in document.documentElement ? me[event] : event;
        var element = typeof selector === "string" ? (selector === "window"? $(window): $(selector)): selector;
        element.unbind(event, action);
        if (type === "bind") {element.bind(event, action);}
    }
    render(){
        let {value} = this.state;
        let {onRemove,onChange} = this.props;
        let touch = "ontouchstart" in document.documentElement;
        return (
            <RVD
                layout={{
                    style:{height:'100%',padding:12},
                    onClick:(e)=>e.stopPropagation(),
                    column:[
                        {
                            gap:3,
                            row:[
                                {
                                    size:48,html:<Icon path={mdiPlusThick} size={1}/>,align:'vh',onClick:()=>this.change(1),
                                    attrs:{
                                        [touch?'onTouchStart':'onMouseDown']:()=>this.change(1)
                                    }
                                },
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
                                            style={{width:'100%',border:'1px solid lightblue',height:36,textAlign:'center',borderRadius:4}}
                                        />
                                    )
                                },
                                {
                                    size:48,html:<Icon path={mdiMinusThick} size={1}/>,align:'vh',
                                    attrs:{
                                        [touch?'onTouchStart':'onMouseDown']:()=>this.change(-1)
                                    }
                                }
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
                    ]
                }}
            />
        )
    }
}