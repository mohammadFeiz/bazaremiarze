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
import { mdiShieldCheck, mdiCellphoneMarker, mdiClipboardList, mdiExitToApp, mdiOpacity, mdiCash, mdiSecurity, mdiSkullScan, mdiClose, mdiPageLayoutBody } from "@mdi/js";
import RSA from '../../npm/react-super-app/react-super-app';
import AIOStorage from 'aio-storage';
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
    let isAdmin = actionClass.isAdmin();
    actionClass.manageUrl();
    this.state = {
      actionClass,
      isAdmin,
      Logger,
      Login:props.Login,
      apis:props.apis,
      rsa,
      userInfo:props.userInfo,
      backOffice: props.backOffice,
      Shop_Bundle:{},
      Shop_Regular:{},
      baseUrl,
      opacity: 100, theme: 'light',
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
      getUserInfo: props.getUserInfo,
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
      getShopById:this.getShopById.bind(this),
      removeCart:this.removeCart.bind(this),
      bazargahPower:this.bazargahPowerStorage('get'),
      bazargahPowerStorage:this.bazargahPowerStorage.bind(this)
    };
    let signalR = new SignalR(() => this.state);
    signalR.start();
    this.state.signalR = signalR;
  }
  getShopById(id){
    return this.state[`Shop_${id}`]
  }
  bazargahPowerStorage(type){
    let bazargahPowerStorage = AIOStorage('bazargahPowerStorage');
    let power = bazargahPowerStorage.load({name:'power',def:true});
    if(type === 'get'){return power}
    if(type === 'set'){bazargahPowerStorage.save({name:'power',value:!power})}
  }
  getCartItemsByProduct(product) {
    let { cart } = this.state;
    let { cartId } = product;
    if(!cart[cartId]){return []}
    let res = [];
    for (let i = 0; i < product.variants.length; i++) {
      let variant = product.variants[i];
      let cartItem = cart[cartId].items[variant.id];
      if (cartItem) { res.push(cartItem) }
    }
    return res
  }
  removeCart(cartId) {
    let { cart } = this.state;
    let newCart = {}
    for (let prop in cart) {
      if (prop !== cartId) { newCart[prop] = cart[prop] }
    }
    this.setState({ cart: newCart })
  }
  fix(value) {
    try { return +value.toFixed(0) }
    catch { return 0 }
  }
  async getGuaranteeImages(items) {
    if (!items.length) { return }
    let { apis, images } = this.state;
    let itemCodes = [];
    for (let i = 0; i < items.length; i++) {
      let { Details = [] } = items[i];
      for (let j = 0; j < Details.length; j++) {
        let { Code } = Details[j];
        if (images[Code]) { continue }
        if (itemCodes.indexOf(Code) !== -1) { continue }
        itemCodes.push(Code);
      }
    }
    let res = await apis.request({ api: 'guaranti.daryafte_tasavire_kalahaye_garanti', parameter: itemCodes, loading: false, description: 'دریافت تصاویر کالاهای گارانتی' });
    for (let i = 0; i < res.length; i++) {
      images[res.ItemCode] = res.ImagesUrl;
    }
    this.setState({ images })
  }
  async getGuaranteeItems() {
    let { apis,Login } = this.state;
    let res = await apis.request({ api: "guaranti.garantiItems", loading: false, description: 'دریافت لیست کالاهای گارانتی کاربر' });
    if (res === false) {Login.logout(); return;}
    //this.getGuaranteeImages(items);
    let guaranteeExistItems = await apis.request({ api: "guaranti.kalahaye_ghabele_garanti", loading: false, description: 'کالاهای قابل گارانتی',def:[] });
    this.setState({
      guaranteeItems: res,
      guaranteeExistItems
    });
  }
  async getBazargahOrders() {
    let { bazargahOrders, apis } = this.state;
    let wait_to_get = await apis.request({ api: 'bazargah.daryafte_sefareshate_bazargah', parameter: { type: 'wait_to_get' }, loading: false, description: 'دریافت سفارشات در انتظار اخذ بازارگاه' });
    let wait_to_send = await apis.request({ api: 'bazargah.daryafte_sefareshate_bazargah', parameter: { type: 'wait_to_send' }, loading: false, description: 'دریافت سفارشات در انتظار ارسال بازارگاه' });
    this.setState({ bazargahOrders: { ...bazargahOrders, wait_to_get, wait_to_send } })
  }
  async getGarantProducts() {
    let { guaranteeItems, apis, garanti_products_dic } = this.state;
    for (let i = 0; i < guaranteeItems.length; i++) {
      let { org_object, id } = guaranteeItems[i];
      let mahsoolat = await apis.request({ api: 'guaranti.mahsoolate_garanti', parameter: org_object, loading: false, description: 'دریافت محصولات گارانتی' });
      garanti_products_dic[id] = mahsoolat;
    }
    this.setState({ garanti_products_dic });
  }
  async componentDidMount() {
    let { userInfo } = this.props;
    let {backOffice,actionClass} = this.state;
    await actionClass.startPricing()
    await actionClass.getShopState();
    if (backOffice.activeManager.garanti && userInfo.slpcode) { this.getGuaranteeItems(); }
    if (backOffice.activeManager.bazargah) { this.getBazargahOrders(); }
    //let testedChance = await apis.request({api:"gardoone.get_tested_chance"});
    this.mounted = true;
    actionClass.handleMissedLocation()
  }
  getContext() {
    return {
      ...this.state,
      userInfo: this.props.userInfo,
      getCartItemsByProduct: this.getCartItemsByProduct.bind(this),
      getBazargahOrders: this.getBazargahOrders.bind(this),
      baseUrl: this.props.baseUrl
    }
  }
  render() {
    if (!this.mounted) { return null }
    let { userInfo } = this.props;
    let { opacity, theme, backOffice,rsa,actionClass,Login,isAdmin } = this.state;
    return (
      <appContext.Provider value={this.getContext()}>
        {rsa.render({
          className:`rvd-rtl opacity-${opacity} theme-${theme}`,
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
              { text: 'بازارگاه', icon: () => <Icon path={mdiCellphoneMarker} size={0.8} />, onClick: () => this.state.rsa.setNavId('bazargah') },
              { text: 'پیگیری سفارش خرید', icon: () => <Icon path={mdiClipboardList} size={0.8} />, onClick: () => actionClass.openPopup('peygiriye-sefareshe-kharid') },
              { text: 'درخواست گارانتی', icon: () => <Icon path={mdiShieldCheck} size={0.8} />, onClick: () => actionClass.openPopup('sabteGarantiJadid'), show: () => !!backOffice.activeManager.garanti && userInfo.slpcode },
              { text: 'لیست قیمت', icon: () => <Icon path={mdiCash} size={0.8} />, onClick: () => actionClass.openPopup('priceList'),show: ()=>!!backOffice.activeManager.priceList},
              { text: 'پنل ادمین', icon: () => <Icon path={mdiSecurity} size={0.8} />, onClick: () => actionClass.openPopup('admin-panel'), show: () => !!isAdmin },
              { text: 'رفتار سیستم', icon: () => <Icon path={mdiSkullScan} size={0.8} />, onClick: () => actionClass.openPopup('logs') },
              { text: 'خروج از حساب کاربری', icon: () => <Icon path={mdiExitToApp} size={0.8} />, className: 'colorFDB913', onClick: () => Login.logout() }  
            ],
            header:() => <div style={{margin:'24px 0'}}><img src={Logo1} alt='' height={48}/></div>,
            attrs:{
              className:`opacity-${opacity} theme-${theme}`
            }
          },
          navHeader:() => <NavHeader />,
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
class NavHeader extends Component {
  render() {
    return (
      <div className='w-100 align-vh m-v-16'>
        <img src={Logo5} alt='' width={200} />
      </div>

    )
  }
}
