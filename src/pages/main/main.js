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
import { mdiShieldCheck, mdiCellphoneMarker, mdiClipboardList, mdiExitToApp, mdiCash, mdiSecurity, mdiSkullScan, mdiClose, mdiPageLayoutBody } from "@mdi/js";
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
    let rsa = new RSA({rtl:true,maxWidth:770})
    let actionClass = new ActionClass({
      getSelf:()=>this,
      getState:()=>this.state,
      getProps:()=>this.props,
      setState:(obj)=>{
        for(let prop in obj){this.state[prop] = obj[prop]}
        this.setState(obj)
      }})
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
  async componentDidMount() {
    let { userInfo } = this.props;
    let {backOffice,actionClass} = this.state;
    await actionClass.startPricing()
    await actionClass.getShopState();
    if (backOffice.activeManager.garanti && userInfo.slpcode) { actionClass.getGuaranteeItems(); }
    if (backOffice.activeManager.bazargah) { actionClass.getBazargahOrders(); }
    //let testedChance = await apis.request({api:"gardoone.get_tested_chance"});
    this.mounted = true;
    actionClass.handleMissedLocation()
  }
  getContext() {return {...this.state}}
  render() {
    if (!this.mounted) { return null }
    let { userInfo } = this.props;
    let { theme, backOffice,rsa,actionClass,Login } = this.state;
    let {setNavId} = rsa;
    return (
      <appContext.Provider value={this.getContext()}>
        {rsa.render({
          className:`rvd-rtl theme-${theme}`,
          title:(nav) => nav.id === 'khane' ? <>{getSvg('mybrxlogo', { className: 'rvd-hide-sm rvd-hide-md rvd-hide-lg' })}<div className='rvd-hide-xs'>{nav.text}</div></> : (nav.id === 'profile' ? 'پروفایل' : nav.text),
          navs:[
            { text: "خانه", icon: () => getSvg(19), id: "khane" },
            { text: "خرید", icon: () => getSvg('buy'), id: "kharid" },
            { text: "بازارگاه", icon: () => getSvg(20), id: "bazargah" },
            { text: "ویترین", icon: () => getSvg('vitrin'), id: "vitrin", show: () => !!backOffice.activeManager.vitrin },
            { text: ()=>`${userInfo.firstName} ${userInfo.lastName}`,marquee:true, icon: () => getSvg(21), id: "profile" },
          ],
          side:{
            items:[
              { text: 'بازارگاه', icon: () => <Icon path={mdiCellphoneMarker} size={0.8} />, onClick: () => setNavId('bazargah') },
              { text: 'پیگیری سفارش خرید', icon: () => <Icon path={mdiClipboardList} size={0.8} />, onClick: () => actionClass.openPopup('peygiriye-sefareshe-kharid') },
              { text: 'درخواست گارانتی', icon: () => <Icon path={mdiShieldCheck} size={0.8} />, onClick: () => actionClass.openPopup('sabteGarantiJadid'), show: () => !!backOffice.activeManager.garanti && userInfo.slpcode },
              { text: 'لیست قیمت', icon: () => <Icon path={mdiCash} size={0.8} />, onClick: () => actionClass.openPopup('priceList'),show: ()=>!!backOffice.activeManager.priceList},
              { text: 'پنل ادمین', icon: () => <Icon path={mdiSecurity} size={0.8} />, onClick: () => actionClass.openPopup('admin-panel'), show: () => !!userInfo.isAdmin },
              { text: 'رفتار سیستم', icon: () => <Icon path={mdiSkullScan} size={0.8} />, onClick: () => actionClass.openPopup('logs') },
              { text: 'خروج از حساب کاربری', icon: () => <Icon path={mdiExitToApp} size={0.8} />, className: 'colorFDB913', onClick: () => Login.logout() }  
            ],
            header:() => <div style={{margin:'24px 0'}}><img src={Logo1} alt='' height={48}/></div>,
            attrs:{
              className:`theme-${theme}`
            }
          },
          navHeader:() => <div className='w-100 align-vh m-v-16'><img src={Logo5} alt='' width={200} /></div>,
          header:({ navId }) => <Header type='page' navId={navId} />,
          navId:actionClass.getInitialNavId(),
          body:({ navId, setNavId }) => {
            if (navId === "khane") { return <Home />; }
            if (navId === "kharid") { return <Buy />; }
            if (navId === "bazargah") { return <Bazargah />; }
            if (navId === "vitrin") { return <Vitrin/>; }
            if (navId === "profile") { return <Profile />; }
          },
          splash:() => <Splash />,
          splashTime:2000
        })}
      </appContext.Provider>
    );
  }
}
Main.defaultProps = { userInfo: { cardCode: 'c50000' } }