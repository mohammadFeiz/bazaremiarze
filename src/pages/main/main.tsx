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
import { I_AIOLogin_class, I_AIOService_class, I_B1Info, I_ShopClass, I_actionClass, I_app_state, I_msfReport, I_state_backOffice, I_updateProfile, I_userInfo, I_vitrin, I_vitrin_product } from "../../types.tsx";
import { v_updateMyVitrin_payload } from "../../apis/vitrin-apis.tsx";
type I_Main = {
  baseUrl:string,Logger:any,updateProfile:I_updateProfile,Login:I_AIOLogin_class,apis:I_AIOService_class,userInfo:I_userInfo,b1Info:I_B1Info,
  backOffice:I_state_backOffice,msfReport:I_msfReport
}
export default function Main(props:I_Main) {
  let { baseUrl,Logger,updateProfile,userInfo,b1Info,Login,apis,backOffice,msfReport } = props;
  apis.setProperty('getState',()=>{return getContext()});
  let [mounted,setMounted] = useState<boolean>(false)
  let [actionClass] = useState<I_actionClass>(new ActionClass({
    getState:()=>getContext(),getProps:()=>props
  }))
  let [rsa] = useState<any>(new RSA({
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
    headerContent:({ navId }) => <Header type='page' navId={navId} />,
    body:({ render,id,text }) => {
      if(!mounted){return null}
      if(id !== AIOStorage('bm' + userInfo.cardCode).load({name:'lastNavId'})){
        msfReport({actionName:'tab',actionId:7,targetName:text,targetId:id,tagName:'other',eventName:'page view'})  
      }
      AIOStorage('bm' + userInfo.cardCode).save({name:'lastNavId',value:id})  
      return render()
    },
  }))
  let [vitrin,setVitrin] = useState<I_vitrin>({
    isFetch:false,
    update:(obj,callback = ()=>{})=>{
      let newVitrin = {...vitrin,...obj}
      setVitrin(newVitrin);
      setTimeout(callback(),0)
    },
    removeSelectedProduct:(productId)=>{
      let { vitrinSelected = {},update } = vitrin;
      let newVitrinSelected = {}
      for(let prop in vitrinSelected){
        if(prop !== productId.toString()){
          newVitrinSelected[prop] = vitrinSelected[prop]
        }
      }
      update({vitrinSelected:newVitrinSelected})
    },
    getIsSelected:(productId,variantId)=>{
      let { vitrinSelected = {} } = vitrin;
      if(!vitrinSelected[productId.toString()]){return false}
      if(!variantId){return true}
      return !!vitrinSelected[productId.toString()].variantIds.find((o)=>o === variantId)
    },
    add:(product:I_vitrin_product,variantId:string | number)=>{
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
  })
  let [Shop,setShop] = useState<{[shopId:string]:I_ShopClass}>({})
  let [developerMode,setDeveloperMode] = useState<boolean>(false);
  function logout(){
    msfReport({actionName:'logout',actionId:875,tagName:'user authentication',eventName:'action'});
    Login.logout();
  }
  let [bazargahOrders,setBazargahOrders] = useState<any>({wait_to_get: undefined,wait_to_send: undefined});
  async function getBazargahOrders(){
    let {wait_to_get, wait_to_send } = await actionClass.getBazargahOrders(apis);
    setBazargahOrders({wait_to_get, wait_to_send})
  }
  let [spreeCategories,setSpreeCategories] = useState({slider_type:[],icon_type:[],dic:{}})
  function getSpreeCategories(){
    let spreeCategories = actionClass.getSpreeCategories(backOffice);
    setSpreeCategories(spreeCategories)
  }
  let [guaranteeItems,setGuaranteeItems] = useState([]);
  let [garanti_products_dic,set_garanti_products_dic] = useState<any>({})
  let [guaranteeExistItems,setGuaranteeExistItems] = useState<any>([])
  async function getGuaranteeItems(){
    let {guaranteeExistItems,guaranteeItems} = await actionClass.getGuaranteeItems({Login,apis})
    setGuaranteeExistItems(guaranteeExistItems);
    setGuaranteeItems(guaranteeItems)
  }
  let [cart,setCart] = useState({shops:{}})
  
  function getContext() {
    let context:I_app_state = {
      baseUrl,developerMode,actionClass,Logger,updateProfile,Login,apis,rsa,userInfo,b1Info,backOffice,msfReport,
      logout,vitrin,Shop,bazargahOrders,spreeCategories,guaranteeItems,garanti_products_dic,guaranteeExistItems,
      cart,setCart,setGuaranteeExistItems,setGuaranteeItems,setBazargahOrders,setDeveloperMode
    }
    return context;
  }
  let [signalR] = useState(new SignalR(()=>getContext()))
  async function getShopState(){
    let {cart,Shop} = await actionClass.getShopState({ apis,backOffice, userInfo })
    setShop(Shop); setCart(cart);
  }
  async function getInitialState(){
    actionClass.manageUrl();
    signalR.start();
    vitrin.fetchData();
    getSpreeCategories();
    if (backOffice.activeManager.garanti && b1Info.customer.slpcode) { getGuaranteeItems(); }
    if (backOffice.activeManager.bazargah) { getBazargahOrders(); }
    actionClass.handleMissedLocation()
    await getShopState()
    mounted = true;
    setMounted(true)
  }
  useEffect(()=>{getInitialState()},[])
  return (<appContext.Provider value={getContext()}>{rsa.render()}</appContext.Provider>);
  
}
