import React, { Component, useEffect, useState } from "react";
import Header from "../../components/header";
//actions////////////////////////////////
import ActionClass from "../../actionClass";
//pages//////////////////////////////////
import Home from "../home/index";
import Buy from "../buy/index";
import Bazargah from "../bazargah/bazargah";
import Profile from "../profile/profile";
import Vitrin from '../vitrin/vitrin';

//npm////////////////////////////////////////
import { Icon } from '@mdi/react';
import { mdiShieldCheck, mdiCellphoneMarker, mdiClipboardList, mdiExitToApp, mdiCash, mdiSecurity, mdiSkullScan, mdiClose, mdiPageLayoutBody, mdiStore, mdiHome, mdiShopping, mdiAccountBox } from "@mdi/js";
import RSA from '../../npm/react-super-app/react-super-app';
import getSvg from "../../utils/getSvg";
import Logo5 from './../../images/logo5.png';
import Logo1 from './../../images/logo1.png';
import appContext from "../../app-context";
import SignalR from '../../singalR/signalR';
import Splash from "../../components/spalsh/splash";
import "./index.css";
export default class Main extends Component {
  constructor(props) {
    super(props);
    let { baseUrl,Logger } = this.props;
    props.apis.setProperty('getState',()=>{return {...this.state}});
    let actionClass = new ActionClass({
      getSelf:()=>this,
      getState:()=>this.state,
      getProps:()=>this.props,
      setState:(obj)=>{
        for(let prop in obj){this.state[prop] = obj[prop]}
        this.setState(obj)
      }
    })
    let rsa = new RSA({
      rtl:true,maxWidth:770,id:'bazarmiarzersa',
      title:(nav)=>actionClass.getAppTitle(nav),
      nav:{
        items:()=>{
          let {backOffice,userInfo} = this.props;
          let icon = (path)=><Icon path={path} size={.9}/>
          return [
            { text: "خرید", icon: () => icon(mdiShopping), id: "kharid" },
            { text: "بازارگاه", icon: () => icon(mdiCellphoneMarker), id: "bazargah" },
            { text: "خانه", icon: () => icon(mdiHome), id: "khane" },
            { text: "ویترین", icon: () => icon(mdiStore), id: "vitrin", show: () => !!backOffice.activeManager.vitrin },
            { text: ()=>`${userInfo.firstName} ${userInfo.lastName}`,marquee:true, icon: () => icon(mdiAccountBox), id: "profile" },
          ]
        },
        id:actionClass.getInitialNavId(),
        header:()=><div className='w-100 align-vh m-v-16'><img src={Logo5} alt='' width={200} /></div>
      },
      side:{
        items:()=>{
          let {rsa,actionClass,Login} = this.state;
          let {userInfo,backOffice} = this.props;
          let {setNavId} = rsa;
          let {openPopup} = actionClass;
          let {logout} = Login;
          let {slpcode,isAdmin} = userInfo;
          let {activeManager} = backOffice;
          let icon = (path)=> <Icon path={path} size={0.8} />
          return [
            { text: 'بازارگاه', icon: () => icon(mdiCellphoneMarker), onClick: () => setNavId('bazargah') },
            { text: 'پیگیری سفارش خرید', icon: () => icon(mdiClipboardList), onClick: () => openPopup('peygiriye-sefareshe-kharid') },
            { text: 'درخواست گارانتی', icon: () => icon(mdiShieldCheck), onClick: () => openPopup('sabteGarantiJadid'), show: () => !!activeManager.garanti && slpcode },
            { text: 'لیست قیمت', icon: () => icon(mdiCash), onClick: () => openPopup('priceList'),show: ()=>!!activeManager.priceList},
            { text: 'پنل ادمین', icon: () => icon(mdiSecurity), onClick: () => openPopup('admin-panel'), show: () => !!isAdmin },
            { text: 'رفتار سیستم', icon: () => icon(mdiSkullScan), onClick: () => openPopup('logs') },
            { text: 'خروج از حساب کاربری', icon: () => icon(mdiExitToApp), className: 'colorFDB913', onClick: () => logout() }  
          ]
        },
        header:() => <div style={{margin:'24px 0'}}><img src={Logo1} alt='' height={48}/></div>,
      },
      headerContent:({ navId }) => <Header type='page' navId={navId} />,
      body:({ navId }) => {
        if (navId === "khane") { return <Home />; }
        if (navId === "kharid") { return <Buy />; }
        if (navId === "bazargah") { return <Bazargah />; }
        if (navId === "vitrin") { return <Vitrin/>; }
        if (navId === "profile") { return <Profile />; }
      },
    })
    
    actionClass.manageUrl();
    this.state = {
      actionClass,
      Logger,
      Login:props.Login,
      apis:props.apis,
      rsa,
      userInfo:props.userInfo,
      backOffice: props.backOffice,
      Shop_Bundle:{},
      Shop_Regular:{},
      baseUrl,
      theme: 'light',
      bazargahOrders: {
        wait_to_get: undefined,
        wait_to_send: undefined
      },
      spreeCategories:{slider_type:[],icon_type:[],dic:{}},
      SetState: (obj) => this.setState(obj),
      messages: [],
      campaigns: [],
      testedChance: true,
      updateUserInfo: props.updateUserInfo,
      allProducts: [],
      cart: {},//{variantId:{count,product,variant}}
      product: false,
      category: false,
      order: false,
      guaranteeItems: [],
      garanti_products_dic: {},
      guaranteeExistItems: [],
      popup: {},
      peygiriyeSefaresheKharid_tab: undefined,
    };
    let signalR = new SignalR(() => this.state);
    signalR.start();
    this.state.signalR = signalR;
  }
  async getVitrinData(){
    let {apis,userInfo} = this.state;
    let started = await apis.request({
      api: 'vitrin.v_getStarted',
      description: 'دریافت وضعیت ویترین'
    })
    this.setState({vitrin:{started}})
    apis.request({
      api: 'vitrin.v_mahsoolate_entekhab_shode',description: 'دریافت آی دی های محصولات انتخاب شده ی ویترین',loading:false,
      parameter:userInfo.cardCode,
      onSuccess:async (selectedProductsIds)=>{
          let selectedProductsList = selectedProductsIds.length?await apis.request({
              api: 'vitrin.v_getProductsByIds',description: 'دریافت لیست محصولات انتخاب شده ی ویترین',loading:false,
              parameter:selectedProductsIds.toString(),
      
          }):[];
          let selectedProducts = {};
          for(let i = 0; i < selectedProductsList.length; i++){
              let p = selectedProductsList[i];
              selectedProducts[p.id] = p
          }
          this.updateVitrin({selectedProducts})
      }
  });
  }
  getSelectedProducts(){
    let { apis,userInfo,actionClass } = this.context;
    //actionClass.addAnaliticsHistory({url:'Vitrin',title:'Vitrin'}) //notice
    
  }
  updateVitrin(obj){
    let {vitrin} = this.state;
    let newVitrin = {...vitrin,...obj}
    this.setState({vitrin:newVitrin})
  }
  
  async componentDidMount() {
    let { userInfo } = this.props;
    this.getVitrinData()
    let {backOffice,actionClass} = this.state;
    await actionClass.startPricing()
    await actionClass.getShopState();
    if (backOffice.activeManager.garanti && userInfo.slpcode) { actionClass.getGuaranteeItems(); }
    if (backOffice.activeManager.bazargah) { actionClass.getBazargahOrders(); }
    //let testedChance = await apis.request({api:"gardoone.get_tested_chance"});
    this.mounted = true;
    actionClass.handleMissedLocation()
  }
  getContext() {return {...this.state,updateVitrin:(obj)=>this.updateVitrin(obj)}}
  render() {
    if (!this.mounted) { return null }
    let { userInfo } = this.props;
    let { theme, backOffice,rsa,actionClass,Login } = this.state;
    let {setNavId} = rsa;
    return (
      <appContext.Provider value={this.getContext()}>
        {rsa.render()}
      </appContext.Provider>
    );
  }
}
Main.defaultProps = { userInfo: { cardCode: 'c50000' } }