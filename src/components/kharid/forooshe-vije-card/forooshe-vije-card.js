import React,{Component} from "react";
import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
import ProductCount from "../product-count/product-count";
import functions from "../../../functions";
import appContext from "../../../app-context";
import {Icon} from '@mdi/react';
import {mdiDelete} from '@mdi/js';
import $ from 'jquery';
export default class ForoosheVijeCard extends Component{
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
                {html:'فروش ویژه بسته',style:{color:'#FDB913'},className:'fs-12 bold',align:'v'},
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
        let {product,variantId} = this.props;
        let {variants} = product;
        if(variantId){
            let variant = variants.find(({id})=>variantId === id)
            return {
                gap:3,
                row:[
                    {html:variant.name,className:'fs-12 theme-dark-font-color bold'},
                    {html:variant.totalQty,className:'fs-12 theme-dark-font-color bold'},
                    {html:'عدد',className:'fs-12 theme-medium-font-color'}
                    
                ]
            } 
        }
        let names = variants.map(({name})=>name);
        return {html:names.join(' - '),className:'fs-12 theme-medium-font-color',style:{textAlign:'right'}}
    }
    price_layout(){
        let {product,variantId} = this.props;
        let {variants} = product;
        let variant;
        if(variantId){
            variant = variants.find(({id})=>variantId === id);
        }
        let min = Infinity;
        let max = -Infinity;
        for(let i = 0; i < variants.length; i++){
            let {finalPrice} = variants[i];
            if(finalPrice < min){min = finalPrice}
            if(finalPrice > max){max = finalPrice}
        }
        return {
            size:36,
            row:[
                {
                    show:!variantId,flex:1,className:'fs-14 bold theme-dark-font-color',
                    align:'v',
                    row:[
                        {flex:1},
                        {html:functions.splitPrice(min)},
                        {size:3},
                        {html:'تا',className:'fs-12 theme-medium-font-color'},
                        {size:3},
                        {html:functions.splitPrice(max)},
                        {size:3},
                        {html:'تومان'}
                    ]
                },
                {
                    show:!!variantId,flex:1,className:'fs-14 bold theme-dark-font-color',
                    align:'v',
                    row:[
                        {flex:1},
                        {html:()=>functions.splitPrice(variant.finalPrice)},
                        {size:3},
                        {html:'تومان'}
                    ]
                }
            ]
        }
    }
    count_layout(){
        let {product,count,variantId} = this.props;
        if(!variantId){variantId = product.variants[0].id}
        if(!count){return false}
        let {changeCart} = this.context;
        return {align:'vh',html:'حذف',onClick:(e)=>{
            e.stopPropagation();
            changeCart(0,variantId,product)
        }}
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
        let {product,variantId} = this.props;
        
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
                                        onClick:()=>changeCart(0,variantId,product)
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
    }
    render(){
        let {mounted,removeMode} = this.state;
        return (
            <RVD
                layout={{
                    className:'theme-box-shadow theme-card-bg theme-border-radius theme-gap-h p-12 of-visible rvd-rotate-card' + (mounted?' mounted':''),
                    attrs:{
                        onMouseDown:()=>{
                            this.timer();
                            $(window).bind('mouseup',$.proxy(this.mounseup,this))
                        }
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
                                        this.count_layout(),
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