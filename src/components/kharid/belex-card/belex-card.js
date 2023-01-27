import React,{Component} from "react";
import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
import ProductCount from "../product-count/product-count";
import functions from "../../../functions";
import appContext from "../../../app-context";
import {Icon} from '@mdi/react';
import {mdiDelete} from '@mdi/js';
import $ from 'jquery';
export default class BelexCard extends Component{
    static contextType = appContext;
    state = {mounted:false,removeMode:false}
    onClick(){
        let {openPopup} = this.context;
        let {product,variantId} = this.props;
        openPopup('product',{product,variantId})
    }
    label_layout(){
        return {
            row:[
                {html:'همایش بلکس شیراز',style:{color:'#FDB913'},className:'fs-12 bold',align:'v'},
                {size:3},
                {flex:1,html:(<div style={{height:2,width:'1100%',background:'#FDB913'}}></div>),align:'v'}
            ]
        }       
    }
    image_layout(){
        let {product} = this.props;
        let {src = ''} = product;
        return {
            column:[
                {
                    flex:1,size:114,html:<img src={src} alt='' width='100%' height='100%' className='br-12'/>
                },
            ]
        }
    }
    name_layout(){
        let {product} = this.props;
        let {name} = product;
        return {html:name,className:'fs-14 theme-dark-font-color bold'}
    }
    detail_layout(){
        let {product,count} = this.props;
        let {variants} = product;
        if(count){
            let str = '';
            for(let prop in count.qtyInPacks){
                str += ` ${prop}`;
                for(let i = 0; i < count.qtyInPacks[prop].length; i++){
                    let o = count.qtyInPacks[prop][i];
                    str += ` ${o.count} عدد ${o.optionValueName}`
                }
                str+=' *** '
            }
            return {html:str,className:'fs-12 theme-medium-font-color',style:{textAlign:'right'}}
             
        }
        let names = variants.map(({name})=>name);
        return {html:names.join(' - '),className:'fs-12 theme-medium-font-color',style:{textAlign:'right'}}
    }
    price_layout(){
        let {product,variantId} = this.props;
        return {
            size:36,
            row:[
                {
                    flex:1,className:'fs-14 bold theme-dark-font-color',
                    align:'v',
                    row:[
                        {flex:1},
                        {html:functions.splitPrice(product.price)},
                        {size:3},
                        {html:'تومان'}
                    ]
                },
                
            ]
        }
    }
    remove(){
        let {product,count,variantId} = this.props;
        if(!variantId){variantId = product.variants[0].id}
        if(!count){return false}
        let {changeCart} = this.context;
        changeCart(0,variantId,product)
        
    }
    componentDidMount(){
        let {index = 0} = this.props;
        setTimeout(()=>{
            this.setState({mounted:true})
        },index * 100 + 100)
    }
    timer(){
        this.time = 0;
        this.interval = setInterval(()=>{
            this.time++;
            if(this.time > 50){
                clearInterval(this.interval);
                this.setState({removeMode:true})
            }
        },10)
    }
    cancelRemoveMode(){
        this.setState({removeMode:false})
    }
    remove_layout(){
        let {removeMode} = this.state;
        if(!removeMode){return false}
        let {changeCart} = this.context;
        
        return {
            style:{zIndex:10,position:'absolute',width:'100%',height:'100%',left:0,top:0,background:'rgba(255,255,255,0.9)'},
            html:(
                <RVD
                    layout={{
                        column:[
                            {flex:1,onClick:()=>this.cancelRemoveMode()},
                            {
                                row:[
                                    {flex:1,onClick:()=>this.cancelRemoveMode()},
                                    {
                                        html:<Icon path={mdiDelete} size={1} style={{padding:16,background:'#A4262C',color:'#fff',borderRadius:'100%'}}/>,align:'vh',
                                        onClick:()=>{
                                            let {product} = this.props;
                                            changeCart(0,product.code,product)
                                        }
                                    },
                                    {flex:1,onClick:()=>this.cancelRemoveMode()}
                                ]
                            },
                            {flex:1,onClick:()=>this.cancelRemoveMode()}
                        ]
                    }}
                />
            )
        }
    }
    mounseup(){
        clearInterval(this.interval);
        $(window).unbind('mouseup',this.mounseup)
        $(window).unbind('touchend',this.mounseup)
    }
    render(){
        let {mounted,removeMode} = this.state;
        let {count} = this.props;
        let touch = 'ontouchstart' in document.documentElement;
        let attrs = {};
        if(count){
            if(touch){
                attrs.onTouchStart = ()=>{
                    this.timer();
                    $(window).bind('touchend',$.proxy(this.mounseup,this))
                }
            }
            else {
                attrs.onMouseDown = ()=>{
                    this.timer();
                    $(window).bind('mouseup',$.proxy(this.mounseup,this))
                }
            }
        }
        return (
            <RVD
                layout={{
                    className:'theme-box-shadow theme-card-bg theme-border-radius theme-gap-h p-12 of-visible rvd-rotate-card' + (mounted?' mounted':''),
                    attrs:{
                        onMouseDown:count?()=>{
                            this.timer();
                            $(window).bind('mouseup',$.proxy(this.mounseup,this))
                        }:undefined
                    },
                    onClick:()=>{if(!removeMode){this.onClick()}},
                    column:[
                        this.label_layout(),
                        this.remove_layout(),
                        {size:6},
                        {
                            row:[
                                {
                                    size:114,column:[
                                        this.image_layout(),
                                    ]
                                },
                                {size:12},
                                {
                                    flex:1,
                                    column:[
                                        this.name_layout(),
                                        {size:6},
                                        this.detail_layout(),
                                        {flex:1},
                                        this.price_layout()
                                    ]
                                }
                            ]
                        },
                        
                    ]
                }}
            />
        )
    }
}