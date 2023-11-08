import React, { Component } from "react";
import ShopClass from "../../shop-class";
import Header from "../../components/header";
//pages//////////////////////////////////
import Home from "../home/index";
import Buy from "../buy/index";
import Bazargah from "../bazargah/bazargah";
import Profile from "../profile/profile";
import Vitrin from '../vitrin/vitrin';
import BackOffice from '../../back-office-panel';

//popups/////////////////////////////////////
import OrdersHistory from "../../components/kharid/orders-history/orders-history";
import SabteGarantiJadid from "../../components/garanti/sabte-garanti-jadid/sabte-garanti-jadid";
import Wallet from "../../popups/wallet/wallet";
import TanzimateKifePool from "../../components/kife-pool/tanzimate-kife-pool/tanzimate-kife-pool";
import Cart from "../../components/kharid/cart/cart";
import Sefareshe_Ersal_Shode_Baraye_Vizitor from "../../components/kharid/sefareshe-ersal-shode-baraye-vizitor/sefareshe-ersal-shode-baraye-vizitor";
import JoziateDarkhastHayeGaranti from "../../components/garanti/joziate-darkhast-haye-garanti/joziate-darkhast-haye-garanti";
import OrderPopup from "../../components/kharid/order-popup/order-popup";
import PasswordPopup from "../../components/password-popup/password-popup";
import CountPopup from "../../components/kharid/product-count/count-popup";
import PriceList from "../../popups/price-list/price-list";
import Register from "../../components/register/register";

//npm////////////////////////////////////////
import { Icon } from '@mdi/react';
import { mdiCart,mdiShieldCheck, mdiCellphoneMarker, mdiClipboardList, mdiExitToApp, mdiOpacity, mdiCash, mdiSecurity } from "@mdi/js";
import RSA from '../../npm/react-super-app/react-super-app';
import RVD from '../../npm/react-virtual-dom/react-virtual-dom';
import AIOStorage from 'aio-storage';
import getSvg from "../../utils/getSvg";
import Logo5 from './../../images/logo5.png';
import Logo1 from './../../images/logo1.png';
import Pricing from "../../pricing";
import appContext from "../../app-context";
import dateCalculator from "../../utils/date-calculator";
import Search from "../../components/kharid/search/search";
import SabteGarantiJadidBaJoziat from "../../components/garanti/sabte-garanti-jadid-ba-joziat/sabte-garanti-jadid-ba-joziat";
import PayameSabteGaranti from "../../components/garanti/payame-sabte-garanti/payame-sabte-garanti";
import SignalR from '../../singalR/signalR';
import Splash from "../../components/spalsh/splash";
import UrlToJson from './../../npm/aio-functions/url-to-json';
import $ from 'jquery';
import "./index.css";
export default class Main extends Component {
  constructor(props) {
    super(props);
    let wrl = window.location.href;
    let rsa = new RSA({rtl:true,maxWidth:770})
    this.addAnaliticsHistory({userId:props.userInfo.phoneNumber})
    let jsonUrl = UrlToJson(wrl)
    if (jsonUrl.status === '2') {
      alert('خطا در پرداخت')
        //window.location.href = wrl.slice(0,wrl.indexOf('/?status')) 
        window.history.pushState(window.history.state, window.title, wrl.slice(0, wrl.indexOf('/?status')));
    }
    else if (jsonUrl.status === '3') {
      alert('پرداخت موفق')
        //window.location.href = wrl.slice(0,wrl.indexOf('/?status')) 
        window.history.pushState(window.history.state, window.title, wrl.slice(0, wrl.indexOf('/?status')));
    }
    let images = localStorage.getItem('electricy-images');
    if (images === undefined || images === null) {
      images = {};
      localStorage.setItem('electricy-images', '{}')
    }
    else {
      images = JSON.parse(images);
    }
    this.dateCalculator = dateCalculator();
    let { baseUrl } = this.props;
    let homeBillboards = props.backOffice.homeContent || [];
    homeBillboards = homeBillboards.filter((o)=>o.type === 'billboard');
    props.apis.setProperty('getState',()=>{return {...this.state}})
    this.state = {
      Login:props.Login,
      apis:props.apis,
      jsonUrl,
      rsa,
      userInfo:props.userInfo,
      backOffice: props.backOffice,
      homeBillboards,
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
      showMessage: this.showMessage.bind(this),
      getHeaderIcons:this.getHeaderIcons.bind(this),
      images,
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
      openPopup:this.openPopup.bind(this),
      changeCart:this.changeCart.bind(this),
      getShopById:this.getShopById.bind(this),
      getCartIds:()=>{
        let {Shop_Bundle,spreeCampaignIds} = this.state;
        let ids = ['Regular'];
        for(let i = 0; i < spreeCampaignIds.length; i++){
          let spreeCampaignId = spreeCampaignIds[i];
          ids.push(spreeCampaignId);
        }
        if(Shop_Bundle.active){ids.push('Bundle')}
        return ids;
      },
      removeCart:this.removeCart.bind(this),
      getLinkToFunction:this.getLinkToFunction.bind(this),
      bazargahPower:this.bazargahPowerStorage('get'),
      bazargahPowerStorage:this.bazargahPowerStorage.bind(this)
    };
    let signalR = new SignalR(() => this.state);
    signalR.start();
    this.state.signalR = signalR;
  }
  getLinkToFunction(linkTo){
    if(linkTo === 'Bundle'){
        return ()=>{
            let {Shop_Bundle} = this.state;
            Shop_Bundle.openCategory()
        }
    }
    else if(linkTo.indexOf('category') === 0){
        return async ()=>{
            let id = linkTo.split('_')[1];
            let {Shop_Regular} = this.state;
            Shop_Regular.openCategory(id);
        }
    }
    else if(linkTo.indexOf('spreeCampaign') === 0){
        return ()=>{
            let id = linkTo.split('_')[1];
            let {getShopById} = this.state;
            let shop = getShopById(id);
            if(!shop){return}
            shop.openCategory();
        }
    }
    else if(linkTo.indexOf('openPopup') === 0){
      return ()=>{
          let id = linkTo.split('_')[1];
          this.openPopup(id);
      }
    }
    else if(linkTo.indexOf('bottomMenu') === 0){
        return ()=>{
          let id = linkTo.split('_')[1];
            let {rsa} = this.state;
            rsa.setNavId(id)
        }
    }
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
  changeOpacity() {
    let { opacity } = this.state;
    if (opacity === 100) { opacity = 90 }
    else if (opacity === 90) { opacity = 80 }
    else if (opacity === 80) { opacity = 70 }
    else if (opacity === 70) { opacity = 100 }
    this.setState({ opacity })
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
  getCartLength() {
    let { cart } = this.state;
    let cartLength = 0;
    let cartTabs = Object.keys(cart);
    for (let i = 0; i < cartTabs.length; i++) {
      let cartTab = cart[cartTabs[i]];
      cartLength += Object.keys(cartTab.items).length;
    }
    return cartLength
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
  async changeCart({ count, variantId, product }) {
    let { cart, apis } = this.state;
    let newCartTabItems = {};
    let { cartId } = product;
    let cartTab = cart[cartId];
    //مقدار اولیه سبد خرید
    if (!cartTab) { cartTab = { items: {} } }
    //حذف از سبد خرید
    if (count === 0) {
      let res = {};
      for (let prop in cartTab.items) {
        if (prop.toString() !== variantId.toString()) { res[prop] = cartTab.items[prop] }
      }
      newCartTabItems = res;
    }
    else {
      newCartTabItems = { ...cartTab.items }
      //افزودن به سبد خرید
      if (newCartTabItems[variantId] === undefined) {
        newCartTabItems[variantId] = { count, product, variantId }
      }
      //ویرایش سبد خرید
      else { newCartTabItems[variantId].count = count; }
    }
    clearTimeout(this.cartTimeout);
    let newCart = { ...cart, [cartId]: { ...cartTab, items: newCartTabItems } };
    this.cartTimeout = setTimeout(async () => await apis.request({ api: 'kharid.setCart', parameter: newCart, loading: false, description: 'ثبت سبد خرید' }), 2000)
    this.setState({ cart: newCart });
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
  async updateSpreeCategories(backOffice){
    let {spreeCategories = []} = backOffice;
    let categories = {icon_type:[],slider_type:[],dic:{}}
    for(let i = 0; i < spreeCategories.length; i++){
      let sc = spreeCategories[i];
      let {showType = 'icon',id} = sc;
      categories[`${showType}_type`].push(sc);
      categories.dic[id] = sc;
    }
    this.setState({spreeCategories:categories})
  }
  async getBazargahOrders() {
    let { bazargahOrders, apis } = this.state;
    let wait_to_get = await apis.request({ api: 'bazargah.daryafte_sefareshate_bazargah', parameter: { type: 'wait_to_get' }, loading: false, description: 'دریافت سفارشات در انتظار اخذ بازارگاه' });
    let wait_to_send = await apis.request({ api: 'bazargah.daryafte_sefareshate_bazargah', parameter: { type: 'wait_to_send' }, loading: false, description: 'دریافت سفارشات در انتظار ارسال بازارگاه' });
    this.setState({ bazargahOrders: { ...bazargahOrders, wait_to_get, wait_to_send } })
  }
  showMessage(message) {
    alert(message)
    //this.setState({message:this.state.messages.concat(message)});
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
  async getShopState(backOffice){
    let {apis} = this.state;
    let {Bundle = {},Regular,spreeCampaigns = []} = backOffice;
    let states = {spreeCampaignIds:[],Shop_Bundle:{},Shop_Regular:{}}
    
    states.Shop_Regular = new ShopClass({
      getAppState:()=>this.state,
      config:{...Regular,cartId:'Regular',spree:true}
    })
    states.Shop_Bundle = new ShopClass({
      getAppState:()=>this.state,
      config:{...Bundle,cartId:'Bundle',products:[]}
    })
    if(Bundle.active){
      await apis.request({ 
        api: "kharid.daryafte_ettelaate_bundle", loading: false, description: 'دریافت اطلاعات باندل',
        onSuccess:(products)=>states.Shop_Bundle.update({products})
      });
    }
    
    for(let i = 0; i < spreeCampaigns.length; i++){
      let spreeCampaign = spreeCampaigns[i];
      let {id,active} = spreeCampaign;
      if(!active){continue}
      states.spreeCampaignIds.push(id);
      states[`Shop_${id}`] = new ShopClass({
        getAppState:()=>this.state,
        config:{...spreeCampaign,cartId:id,spree:true,spreeCampaign:true}
      })
    }
    for(let prop in states){this.state[prop] = states[prop];}
  }
  updateBackOfficeAccess(backOffice){
    let { userInfo } = this.props;
    let {accessPhoneNumbers = []} = backOffice;
    if(userInfo.userName === '09123534314'){this.state.backOfficeAccess = true;}
    let obj = accessPhoneNumbers.find((o)=>o.phoneNumber === userInfo.userName);
    if(obj){
      let {access} = obj,res = false;
      for(let prop in access){if(access[prop] === true){res = true; break;}}
      if(res){this.state.backOfficeAccess = true;}
    }
  }
  async componentDidMount() {
    let { userInfo } = this.props;
    let {apis,backOffice} = this.state;
    let pricing = new Pricing('https://b1api.burux.com/api/BRXIntLayer/GetCalcData', userInfo.cardCode, 12 * 60 * 60 * 1000)
    pricing.startservice().then((value) => { return value; });
    await this.getShopState(backOffice);
    this.updateBackOfficeAccess(backOffice);
    this.updateSpreeCategories(backOffice);
    let getFactorDetails = (items, obj = {}) => {
      let { SettleType, PaymentTime, PayDueDate, DeliveryType } = obj;
      let { userInfo } = this.props;
      let config = {
        "CardCode": userInfo.cardCode,
        "CardGroupCode": userInfo.groupCode,
        "MarketingLines": items,
        "DeliverAddress": userInfo.address,
        "marketingdetails": {
          "SlpCode": userInfo.slpcode,
          SettleType,
          PaymentTime,
          PayDueDate,
          DeliveryType
        }
      }
      let res = pricing.autoCalcDoc(config)
      return res
    }
    let fixPrice = ({items, CampaignId,PriceListNum}) => {
      let { userInfo } = this.props;
      if(!userInfo.groupCode){console.error('fixPrice missing userInfo.groupCode')}
      if(!userInfo.cardCode){console.error('fixPrice missing userInfo.cardCode')}
      if(!userInfo.slpcode){console.error('fixPrice missing userInfo.slpcode')}
      let data = {
        "CardGroupCode": userInfo.groupCode,
        "CardCode": userInfo.cardCode,
        "marketingdetails": {
          "PriceList": PriceListNum,
          "SlpCode": userInfo.slpcode,
          "Campaign": CampaignId
        },
        "MarketingLines": items
      }
      let list = items.map(({ itemCode }) => itemCode);
      try {
        list = pricing.autoPriceList(list, data);
      }
      catch (err) {
        alert('Pricing در محاسبات دچار مشکل شد . لطفا این مساله را با ادمین سیستم در میان بگذارید')
        alert(err)
      }

      return list
    }
    this.state.fixPrice = fixPrice;
    this.state.getFactorDetails = getFactorDetails;
    if (backOffice.activeManager.garanti && userInfo.slpcode) { this.getGuaranteeItems(); }
    if (backOffice.activeManager.bazargah) { this.getBazargahOrders(); }
    //let testedChance = await apis.request({api:"gardoone.get_tested_chance"});
    let cart = await apis.request({ api: 'kharid.getCart', loading: false, description: 'دریافت اطلاعات سبد خرید' });
    this.mounted = true;
    setTimeout(()=>{
      try{
        let {userInfo} = this.props;
        let {latitude,longitude,userProvince,userCity} = userInfo;
        if(!userProvince || !userCity || !latitude || !longitude || Math.abs(latitude - 35.699739) < 0.0002 || Math.abs(longitude - 51.338097) < 0.0002){
          this.openPopup('profile')
        }
      }
      catch{}
      
    },1000)
    this.setState({
      cart,
      fixPrice,
      pricing,
      getFactorDetails
    });
  }
  async openPopup(type, parameter) {
    let { rsa, backOffice } = this.state;
    let { userInfo } = this.props;
    let { addModal, removeModal, setNavId } = rsa;
    if(type === 'profile'){
      let {userInfo,updateUserInfo,baseUrl} = this.props;
      addModal({
        position: 'fullscreen', id: type,
        body: {
          render:() => {
            return (
              <Register baseUrl={baseUrl} mode='edit' locationMode={true} model={{...userInfo}} 
                  onSubmit={(userInfo)=>{
                      updateUserInfo(userInfo)
                  }}
                  onClose={()=>{
                    rsa.removeModal()
                  }}
              />
            )
          }
        }, 
        header:{title: 'ثبت موقعیت جغرافیایی',backbutton:true}
      })
    }
    else if (type === 'priceList') {
      addModal({
        position: 'fullscreen', id: type,
        body: {render:() => <PriceList />}, header:{title: 'لیست قیمت تولیدکنندگان',backbutton:true}
      })
    }
    else if (type === 'admin-panel') {
      addModal({
        position: 'fullscreen', id: type,
        body: {render:() => <BackOffice model={backOffice} phoneNumber={userInfo.userName} />}
      })
    }    
    else if (type === 'count-popup') {
      addModal({
        position: 'center', id: type,
        attrs:{style: { height: 'fit-content' }},
        body: {render:() => <CountPopup {...parameter} />}, header:{title: 'تعداد را وارد کنید', closeType: 'close button'}
      })
    }
    else if (type === 'password') {
      addModal({ id:type,position: 'fullscreen', body: {render:() => <PasswordPopup />}, header:{title: 'مشاهده و ویرایش رمز عبور' }})
    }
    else if (type === 'peygiriye-sefareshe-kharid') {
      addModal({ id:type,position: 'fullscreen', body: {render:() => <OrdersHistory activeTab={parameter} />}, header:{title: 'جزيیات سفارش خرید' }})
    }
    if (type === 'joziate-sefareshe-kharid') {
      addModal({ id:type,position: 'fullscreen', body: {render:() => <OrderPopup order={parameter} />}, header:{title: 'پیگیری سفارش خرید' }})
    }
    else if (type === 'sabteGarantiJadid') {
      addModal({ id:type,position: 'fullscreen', body: {render:() => <SabteGarantiJadid />}, header:{title: 'درخواست مرجوع کالای سوخته' }})
    }
    else if (type === 'joziate-darkhast-haye-garanti') {
      addModal({ id:type,position: 'fullscreen', body: {render:() => <JoziateDarkhastHayeGaranti />}, header:{title: 'جزییات درخواست های گارانتی' }})
    }
    else if (type === 'payame-sabte-garanti') {
      let { text, subtext } = parameter;
      addModal({ id:type,position: 'center', body: {render:() => <PayameSabteGaranti text={text} subtext={subtext} onClose={() => removeModal()} />} })
    }
    else if (type === 'sabte-garanti-jadid-ba-joziat') {
      addModal({ id:type,position: 'fullscreen', body: {render:() => <SabteGarantiJadidBaJoziat />}, header:{title: 'ثبت در خواست گارانتی جدید با جزییات' }})
    }
    else if (type === 'search') {
      addModal({
        id:type,position: 'fullscreen', body: {render:() => <Search />}, header:{title: 'جستجو در محصولات'},
        //header: () => <Header type='popup' popupId='search' />
      })
    }
    else if (type === 'wallet') {
      addModal({ id:type,position: 'fullscreen', body: {render:() => <Wallet onClose={() => removeModal()} />} })
    }
    else if (type === 'tanzimate-kife-pool') {
      addModal({ id:type,position: 'fullscreen', body: {render:() => <TanzimateKifePool cards={parameter.cards} onChange={parameter.onChange} />}, header:{title: 'تنظیمات کیف پول' }})
    }
    else if (type === 'cart') {
      addModal({ id:type,position: 'fullscreen', body: {render:() => <Cart cartId={parameter} />}, header:{title: 'سبد خرید'}, id: 'cart' })
    }
    else if (type === 'sefareshe-ersal-shode-baraye-vizitor') {
      addModal({
        id:type,
        body: {render:() => (
          <Sefareshe_Ersal_Shode_Baraye_Vizitor
            orderNumber={parameter.orderNumber}
            qr={parameter.qr}
            onShowInHistory={() => {
              removeModal('all');
              this.openPopup('peygiriye-sefareshe-kharid', 'در حال بررسی');
            }}
            onClose={() => {
              removeModal('all');
              setNavId('khane')
            }}
          />
        )}
      })
    }
  }
  getProfileName(userInfo) {
    //let str = userInfo.cardName;
    let str = `${userInfo.firstName} ${typeof userInfo.lastName === 'string'?userInfo.lastName:'' }`;
    if (!str) { return 'پروفایل' }
    if (str.length <= 12) { return str }
    return <marquee behavior='scroll' scrollamount={3} direction='right'>{str}</marquee>
  }
  addAnaliticsHistory({ url, title,userId }) {
    window.dataLayer = window.dataLayer || [];
    if(userId){
      window.dataLayer.push({
        'user_id': userId
      });
    }
    else {

    }
    window.dataLayer.push({
      'event': 'virtualPageview',
      'pageUrl': `https://bazar.miarze.com/${url}`,
      'pageTitle': title //some arbitrary name for the page/state
    });
  }
  getContext() {
    return {
      ...this.state,
      userInfo: this.props.userInfo,
      getCartItemsByProduct: this.getCartItemsByProduct.bind(this),
      getBazargahOrders: this.getBazargahOrders.bind(this),
      getCartLength: this.getCartLength.bind(this),
      baseUrl: this.props.baseUrl,
      addAnaliticsHistory: this.addAnaliticsHistory.bind(this)

    }
  }
  getHeaderIcons(obj){
    let {cart} = obj;
    let res = [];
    if(cart){
      let length = this.getCartLength(); 
      res.push(
        [
          (<>
            <Icon path={mdiCart} size={0.8} />
            {length > 0 ? <div className='badge-2'>{length}</div> : undefined}
          </>),
          {
            className:'header-icon',
            style:{ background: "none", color: '#605E5C' },
            onClick:() => this.openPopup('cart'),
          }
        ]
      )
    }
    return res
    
  }
  render() {
    if (!this.mounted) { return null }
    let { userInfo } = this.props;
    let { opacity, theme, backOffice, backOfficeAccess,rsa,jsonUrl,Login } = this.state;
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
            { text: this.getProfileName(userInfo), icon: () => getSvg(21), id: "profile" },
          ],
          side:{
            items:[
              { text: 'بازارگاه', icon: () => <Icon path={mdiCellphoneMarker} size={0.8} />, onClick: () => this.state.rsa.setNavId('bazargah') },
              { text: 'پیگیری سفارش خرید', icon: () => <Icon path={mdiClipboardList} size={0.8} />, onClick: () => this.openPopup('peygiriye-sefareshe-kharid') },
              { text: 'درخواست گارانتی', icon: () => <Icon path={mdiShieldCheck} size={0.8} />, onClick: () => this.openPopup('sabteGarantiJadid'), show: () => !!backOffice.activeManager.garanti && userInfo.slpcode },
              { text: 'لیست قیمت', icon: () => <Icon path={mdiCash} size={0.8} />, onClick: () => this.openPopup('priceList'),show: ()=>!!backOffice.activeManager.priceList},
              { text: 'پنل ادمین', icon: () => <Icon path={mdiSecurity} size={0.8} />, onClick: () => this.openPopup('admin-panel'), show: () => backOfficeAccess },
              { text: 'خروج از حساب کاربری', icon: () => <Icon path={mdiExitToApp} size={0.8} />, className: 'colorFDB913', onClick: () => Login.logout() }  
            ],
            header:() => <div style={{margin:'24px 0'}}><img src={Logo1} alt='' height={48}/></div>,
            footer:() => (
              <RVD
                layout={{
                  className: 'h-48 p-12 color-fff', align: 'v',
                  row: [
                    { flex: 1 },
                    { html: <Icon path={mdiOpacity} size={1} onClick={() => this.changeOpacity()} /> }
                  ]
                }}
              />
            ),
            attrs:{
              className:`opacity-${opacity} theme-${theme}`
            }
          },
          navHeader:() => <NavHeader />,
          header:({ navId }) => <Header type='page' navId={navId} />,
          navId:jsonUrl.tab || 'khane',
          body:({ navId, setNavId }) => {
            if (navId === "khane") { return <Home />; }
            if (navId === "kharid") { return <Buy />; }
            if (navId === "bazargah") { return <Bazargah />; }
            if (navId === "vitrin") { return <Vitrin onExit={() => { setNavId('khane') }} />; }
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
