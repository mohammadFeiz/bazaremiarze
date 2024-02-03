import React, { Component, useEffect, useState } from "react";
import Header from "../../components/header.js";
//actions////////////////////////////////
import ActionClass from "../../actionClass.tsx";
import AIOStorage from 'aio-storage'
//npm////////////////////////////////////////
import RSA from 'react-super-app';
import Logo5 from './../../images/logo5.png';
import Logo1 from './../../images/bmloading.png';
import appContext from "../../app-context.js";
import SignalR from '../../singalR/signalR.js';
import "./index.css";
import { I_AIOService_class, I_B1Info, I_ShopClass, I_actionClass, I_app_state, I_msfReport, I_rsa_navItem, I_rsa_props, I_state_Shop, I_state_backOffice, I_state_cart, I_state_spreeCategories, I_updateProfile, I_userInfo, I_vitrin, I_vitrin_product } from "../../types.tsx";
import { v_updateMyVitrin_payload } from "../../apis/vitrin-apis.tsx";
import {I_AIOLogin} from './../../npm/aio-login/index.tsx';
type I_Main = {
  baseUrl:string,Logger:any,updateProfile:I_updateProfile,Login:I_AIOLogin,apis:I_AIOService_class,userInfo:I_userInfo,b1Info:I_B1Info,
  backOffice:I_state_backOffice,msfReport:I_msfReport
}

export type I_Main_state = {
  mounted:boolean,
  rsa:any,
  actionClass:I_actionClass,
  vitrin:I_vitrin,
  developerMode:boolean,
  Shop:I_state_Shop,
  cart:I_state_cart,
  spreeCategories:I_state_spreeCategories,
  garanti_products_dic:any,
  guaranteeItems:any[],
  guaranteeExistItems:any,
  bazargahOrders:{wait_to_get?:[],wait_to_send?:[]}
}
export default class Main extends Component <I_Main,I_Main_state>{
  constructor(props){
    super(props);
    props.apis.setProperty('getState',()=>{return this.getContext()});
    let actionClass = new ActionClass({
      getState:this.getContext.bind(this),getProps:()=>this.props,SetState:this.SetState.bind(this)
    })
    let rsaProps:I_rsa_props = {
      rtl:true,maxWidth:770,id:'bazarmiarzersa',
      title:(nav)=>actionClass.getAppTitle(nav),
      nav:{
        items:actionClass.getNavItems,
        id:actionClass.getInitialNavId(),
        header:()=><div className='w-100 m-v-16'><img src={Logo5 as string} alt='' width={200} /></div>
      },
      side:{
        items:actionClass.getSideItems,
        header:() => <div style={{margin:'24px 0'}} className='align-vh w-100'><img src={Logo1 as string} alt='' height={24}/></div>,
        footer:actionClass.getSideFooter
      },
      headerContent:() => <Header type='page' navId={this.state.rsa.getNavId()} />,
      body:(p:I_rsa_navItem) => {
        let { render,id,text } = p;
        let {userInfo,msfReport} = this.props;
        if(id !== AIOStorage('bm' + userInfo.cardCode).load({name:'lastNavId'})){
          msfReport({actionName:'tab',actionId:7,targetName:typeof text === 'string'?text:text(),targetId:id,tagName:'other',eventName:'page view'})  
        }
        AIOStorage('bm' + userInfo.cardCode).save({name:'lastNavId',value:id})  
        return render()
      },
    }
    let rsa = new RSA(rsaProps);
    let vitrin = this.getInitialVitrin()
    this.state = {
      mounted:false,rsa,
      actionClass,vitrin,
      developerMode:false,
      Shop:{},cart:{shops:{}},
      spreeCategories:{slider_type:[],icon_type:[],dic:{}},
      garanti_products_dic:{},guaranteeExistItems:[],guaranteeItems:[],
      bazargahOrders:{wait_to_get: undefined,wait_to_send: undefined}
    }
  }
  getInitialVitrin(){
    return {
      update:(obj,callback = ()=>{})=>{
        let {vitrin} = this.state;
        let newVitrin:I_vitrin = {...vitrin,...obj}
        this.SetState({vitrin:newVitrin});
        setTimeout(()=>callback(),0)
      },
      removeSelectedProduct:(productId)=>{
        let {vitrin} = this.state;
        let { vitrinSelected = {},update } = vitrin;
        let newVitrinSelected = {}
        for(let prop in vitrinSelected){
          if(prop !== productId.toString()){
            newVitrinSelected[prop] = vitrinSelected[prop]
          }
        }
        update({vitrinSelected:newVitrinSelected})
      },
      getIsSelected:(productId:string | number,variantId?:string | number)=>{
        let {vitrin} = this.state;
        let { vitrinSelected = {} } = vitrin;
        if(!vitrinSelected[productId.toString()]){return false}
        if(!variantId){return true}
        return !!vitrinSelected[productId.toString()].variantIds.find((o)=>o === variantId)
      },
      add:(product:I_vitrin_product,variantId:string | number)=>{
        let {vitrin} = this.state;
        let { vitrinSelected,getIsSelected,update } = vitrin;
        if(getIsSelected(product.id,variantId)){return}
        let pstrid = product.id.toString();
        let newVitrinSelected = {};
        if(getIsSelected(product.id)){
          let newVariantIds = [...vitrinSelected[pstrid].variantIds,variantId]
          newVitrinSelected = {...vitrinSelected,[pstrid]:{...vitrinSelected[pstrid],variantIds:newVariantIds}}
        }
        else {
          newVitrinSelected = {...vitrinSelected,[pstrid]:{product,variantIds:[variantId]}}
        }
        update({vitrinSelected:newVitrinSelected})
      },
      remove:(product,variantId)=>{
        let {vitrin} = this.state;
        let { vitrinSelected,getIsSelected,update } = vitrin;
        if(!getIsSelected(product.id,variantId)){return}
        let pstrid = product.id.toString();
        let newVitrinSelected = {};
        let newVariantIds = vitrinSelected[pstrid].variantIds.filter((vi)=>vi !== variantId)
        for(let pid in vitrinSelected){
          if(pid !== pstrid){
            newVitrinSelected[pid] = vitrinSelected[pid]
          }
          else if(newVariantIds.length){
            newVitrinSelected[pid] = {...vitrinSelected[pid],variantIds:newVariantIds}
          }
        }
        update({vitrinSelected:newVitrinSelected})
      },
      updateVitrinSelected:(product,variantId)=>{
        let {vitrin} = this.state,{apis} = this.props;
        let { add,remove,getIsSelected } = vitrin;
        let isSelected = getIsSelected(product.id,variantId)
        let parameter:v_updateMyVitrin_payload = { isSelected, product,variantId }
        apis.request({
            api: 'vitrin.v_updateMyVitrin',parameter,
            onCatch: (error) => {
                try {
                    let { message, Message } = error.response.data;
                    return message || Message
                }
                catch {return 'خطای 1133'}
            },
            onSuccess: () => {
                if (getIsSelected(product.id,variantId)) { remove(product,variantId)}
                else {add(product,variantId)}
            }
        })
      },
      fetchData:async ()=>{
        let {vitrin} = this.state,{apis,userInfo} = this.props;
        let started = await apis.request({api: 'vitrin.v_getStarted',loading:false,description: 'دریافت وضعیت ویترین'})
        vitrin.started = started;
        apis.request({
          api: 'vitrin.v_selected',description: 'دریافت محصولات انتخاب شده ی ویترین',loading:false,
          parameter:userInfo.cardCode,def:[],
          onSuccess:async (list)=>{
            let vitrinSelected = {};
            for(let i = 0; i < list.length; i++){
              let {product,productId,variantId,vartiantId} = list[i];
              vitrinSelected[productId] = vitrinSelected[productId] || {product,variantIds:[]}
              vitrinSelected[productId].variantIds.push(vartiantId || variantId)
            }
            vitrin.update({vitrinSelected})
          }
        });
      }
    }
  }
  async componentDidMount(){
    let {actionClass,vitrin} = this.state,{backOffice,b1Info} = this.props;
    actionClass.manageUrl();
    let signalR = new SignalR(()=>this.getContext())
    signalR.start();
    vitrin.fetchData();
    actionClass.getSpreeCategories();
    if (backOffice.activeManager.garanti && b1Info.customer.slpcode) { actionClass.getGuaranteeItems(); }
    if (backOffice.activeManager.bazargah) { actionClass.getBazargahOrders(); }
    actionClass.handleMissedLocation()
    await actionClass.getShopState()
    this.SetState({mounted:true})  
  }
  logout(){
    let {msfReport,Login} = this.props;
    msfReport({actionName:'logout',actionId:875,tagName:'user authentication',eventName:'action'});
    Login.logout();
  }
  SetState(obj:any,callback?:any){this.setState(obj,callback)}
  setCart(newCart:I_state_cart){
    let {apis} = this.props;
    this.SetState({cart:newCart})
    apis.request({ api: 'kharid.setCart', parameter: newCart, loading: false, description: 'ثبت سبد خرید' })
  }
  getContext(){
    let {baseUrl,Logger,updateProfile,Login,apis,userInfo,b1Info,backOffice,msfReport} = this.props;
    let {developerMode,actionClass,rsa,cart} = this.state;
    let context:I_app_state = {
      ...this.state,
      baseUrl,Logger,updateProfile,Login,apis,userInfo,b1Info,backOffice,msfReport,
      developerMode,actionClass,rsa,
      cart,
      logout:this.logout.bind(this),
      SetState:this.SetState.bind(this),
      setCart:this.setCart.bind(this)
    }
    return context;
  }
  render(){
    let {mounted,rsa} = this.state;
    if(!mounted){return null}
    return (<appContext.Provider value={this.getContext()}>{rsa.render()}</appContext.Provider>);
  }
}
