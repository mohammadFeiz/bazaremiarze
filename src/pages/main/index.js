import React, { Component } from "react";

//pages//////////////////////////////////
import Home from "./../home/index";
import Buy from "./../buy/index";
import Bazargah from "../bazargah/bazargah";
import MyBurux from "./../my-burux/index";
import Noorvare3 from './../../pages/noorvare3/noorvare3';

//popups/////////////////////////////////////
import OrdersHistory from "./../../components/kharid/orders-history/orders-history";
import SabteGarantiJadid from "../../components/garanti/sabte-garanti-jadid/sabte-garanti-jadid";
import Shipping from './../../components/kharid/shipping/shipping';
import Wallet from "../../popups/wallet/wallet";
import TanzimateKifePool from "../../components/kife-pool/tanzimate-kife-pool/tanzimate-kife-pool";
import Cart from "./../../components/kharid/cart/cart";
import Sefareshe_Ersal_Shode_Baraye_Vizitor from "./../../components/kharid/sefareshe-ersal-shode-baraye-vizitor/sefareshe-ersal-shode-baraye-vizitor";
import JoziateDarkhastHayeGaranti from "./../../components/garanti/joziate-darkhast-haye-garanti/joziate-darkhast-haye-garanti";
import OrderPopup from "./../../components/kharid/order-popup/order-popup";
import PasswordPopup from "../../components/password-popup/password-popup";

//npm////////////////////////////////////////
import {Icon} from '@mdi/react';
import { mdiShieldCheck,mdiCellphoneMarker,mdiClipboardList,mdiExitToApp, mdiCart, mdiBell, mdiPower, mdiMagnify, mdiPalette, mdiOpacity} from "@mdi/js";
import RSA from './../../npm/react-super-app/react-super-app';
import RVD from './../../interfaces/react-virtual-dom/react-virtual-dom';
import AIOService from './../../npm/aio-service/aio-service';
import AIOButton from './../../interfaces/aio-button/aio-button';
import AIOStorage from './../../npm/aio-storage/aio-storage';


import getSvg from "../../utils/getSvg";
import Logo1 from './../../images/logo1.png';
import Pricing from "./../../pricing";
import appContext from "../../app-context";
import dateCalculator from "../../utils/date-calculator";
import Search from "./../../components/kharid/search/search";
import Product from "./../../components/kharid/product/product";
import CategoryView from "./../../components/kharid/category-view/category-view";
import kharidApis from "../../apis/kharid-apis";
import bazargahApis from './../../apis/bazargah-apis';
import walletApis from './../../apis/wallet-apis';
import gardooneApis from './../../apis/gardoone-apis';
import guarantiApis from './../../apis/guaranti-apis';
import SabteGarantiJadidBaJoziat from "../../components/garanti/sabte-garanti-jadid-ba-joziat/sabte-garanti-jadid-ba-joziat";
import PayameSabteGaranti from "../../components/garanti/payame-sabte-garanti/payame-sabte-garanti";
import SignalR from '../../singalR/signalR';
import Splash from "../../components/spalsh/splash";
import "./index.css";
export default class Main extends Component {
  constructor(props) {
    super(props);
    let wrl = window.location.href;
    let status = wrl.indexOf('status=');
    if(status !== -1){
      status = wrl.slice(status + 7,wrl.length)
      if(status === '2'){
        alert('خطا در پرداخت')
        //window.location.href = wrl.slice(0,wrl.indexOf('/?status')) 
        window.history.pushState(window.history.state, window.title, wrl.slice(0,wrl.indexOf('/?status')));
      }
      if(status === '3'){
        alert('پرداخت موفق')
        //window.location.href = wrl.slice(0,wrl.indexOf('/?status')) 
        window.history.pushState(window.history.state, window.title, wrl.slice(0,wrl.indexOf('/?status')));
      }
    
    }
    let signalR=new SignalR(()=>this.state);
    signalR.start();
    
    let images = localStorage.getItem('electricy-images');
    if(images === undefined || images === null){
      images = {};
      localStorage.setItem('electricy-images','{}')
    }
    else {
      images = JSON.parse(images);
    }
    this.dateCalculator = dateCalculator();
    let backOffice = {
      forsate_ersale_sefareshe_bazargah:16 * 60,
      forsate_akhze_sefareshe_bazargah:90
    }
    this.noorvare3Storage = AIOStorage('noorvare3');
    let noorvare3 = this.noorvare3Storage.load('show',true)
    this.state = {
      noorvare3,
      opacity:100,theme:'light',
      bazargah:{
        setActivity:async (state)=>{
          let {bazargahApis,bazargah} = this.state;
          let res = await bazargahApis({api:'activity',parameter:state})
          this.setState({bazargah:{...bazargah,active:res}})
        },
        // active:this.props.userInfo.isBazargahActive,
        active:true,
        forsate_ersale_sefareshe_bazargah:backOffice.forsate_ersale_sefareshe_bazargah,
        forsate_akhze_sefareshe_bazargah:backOffice.forsate_akhze_sefareshe_bazargah
      },
      SetState: (obj) => this.setState(obj),
      showMessage:this.showMessage.bind(this),
      images,
      signalR,
      messages:[],
      campaigns:[],
      testedChance: true,
      updateUserInfo:props.updateUserInfo,
      getUserInfo:props.getUserInfo,
      updatePassword:props.updatePassword,
      allProducts:[],
      shipping:false,//{cards:[<ProductCard/>,...],cartItems:[{count,variant,product}],total:number}
      cart: {},//{variantId:{count,product,variant}}
      product:false,
      category:false,
      guaranteePopupZIndex:0,
      ordersHistoryZIndex:0,
      order:false,
      guaranteeItems: [],
      garanti_products_dic:{},
      guaranteeExistItems: [],
      popup: {},
      showGaranti:true,
      peygiriyeSefaresheKharid_tab:undefined,
      buy_view:undefined,//temporary state
    };
    let {token,baseUrl} = this.props;
    let log = true;
    let getState = ()=>{
      return {...this.state,userInfo:props.userInfo}
    }
    this.state.kharidApis = AIOService({token,getState,apis:kharidApis,log,baseUrl});
    this.state.bazargahApis = AIOService({token,getState,apis:bazargahApis,log,baseUrl});
    this.state.walletApis = AIOService({token,getState,apis:walletApis,log,baseUrl});
    this.state.gardooneApis = AIOService({token,getState,apis:gardooneApis,log,baseUrl});
    this.state.guarantiApis = AIOService({token,getState,apis:guarantiApis,log,baseUrl});
  }
  changeOpacity(){
    let {opacity} = this.state;
    if(opacity === 100){opacity = 90}
    else if(opacity === 90){opacity = 80}
    else if(opacity === 80){opacity = 70}
    else if(opacity === 70){opacity = 100}
    this.setState({opacity})
  }
  changeCart(count,variantId,product){
    let {cart,kharidApis} = this.state;
    let newCart;
    if(typeof count === 'object'){
      newCart = {...count}
    }
    else{
      if(count === 0){
        let res = {};
        for(let prop in cart){
          if(prop.toString() !== variantId.toString()){res[prop] = cart[prop]}
        }
        newCart = res;
      }
      else{
        newCart = {...cart}
        if(newCart[variantId] === undefined){
          let variant;
          try{variant = product.variants.filter((o) => o.id === variantId)[0]}
          catch{variant = undefined;}
          newCart[variantId] = {count,product,variant}
        }
        else{newCart[variantId].count = count;}
      }
    }
    clearTimeout(this.cartTimeout);
    this.cartTimeout = setTimeout(async ()=>await kharidApis({api:'setCart',parameter:newCart,loading:false}),2000)
    this.setState({cart:newCart});
  }
  getCartCountByVariantId(variantId) {
    if(!variantId){return 0}
    let { cart } = this.state;
    let cartItem = cart[variantId];
    if(!cartItem){return 0}
    return cartItem.count || 0;
  }
  async getGuaranteeImages(items){
    if(!items.length){return}
    let {guarantiApis,images} = this.state;
    let itemCodes = [];
    for(let i = 0; i < items.length; i++){
      let {Details = []} = items[i];
      for(let j = 0; j < Details.length; j++){
        let {Code} = Details[j];
        if(images[Code]){continue}
        if(itemCodes.indexOf(Code) !== -1){continue}
        itemCodes.push(Code);
      }
    }
    let res = await guarantiApis({api:'getImages',parameter:itemCodes,loading:false});
    for(let i = 0; i < res.length; i++){
      images[res.ItemCode] = res.ImagesUrl;
    }
    this.setState({images})
  }
  async getGuaranteeItems(){
    let {guarantiApis} = this.state;
    let res = await guarantiApis({api:"items",loading:false});
    if(res === false){
      this.props.logout();
      return;
    }
    //this.getGuaranteeImages(items);
    let guaranteeExistItems = await guarantiApis({api:"kalahaye_mojood",loading:false});
    this.setState({
      guaranteeItems:res,
      guaranteeExistItems
    });
  }
  async getCampaignsData() {
    let {kharidApis} = this.state;
    let campaigns = await kharidApis({api:"getCampaigns",loading:false});
    this.setState({ campaigns});
  }
  async get_forooshe_vije() {
    let {kharidApis} = this.state;
    let forooshe_vije = await kharidApis({api:"forooshe_vije",loading:false});
    this.setState({ forooshe_vije});
  }
  async getBazargahOrders(){
    let {bazargah,bazargahApis} = this.state;
    bazargah.wait_to_get = await bazargahApis({api:'orders',parameter:{type:'wait_to_get'},loading:false});
    bazargah.wait_to_send = await bazargahApis({api:'orders',parameter:{type:'wait_to_send'},loading:false});
    this.setState({bazargah})
  }
  showMessage(message){
    alert(message)
    //this.setState({message:this.state.messages.concat(message)});
  }
  async getGarantProducts(){
    let {guarantiApis} = this.state;
    let {guaranteeItems} = this.context;
    let {garanti_products_dic} = this.state;
    for(let i = 0; i < guaranteeItems.length; i++){
        let {org_object,id} = guaranteeItems[i];
        let mahsoolat = await guarantiApis({api:'mahsoolate_garanti',parameter:org_object,loading:false});
        garanti_products_dic[id] = mahsoolat;
    }
      this.setState({garanti_products_dic});
  }
  async componentDidMount() {
    let {bazargah,kharidApis,showGaranti} = this.state;
    let {userInfo} = this.props;
    if(showGaranti){
      this.getGuaranteeItems();
      
    }
    this.getCampaignsData();
    this.get_forooshe_vije();
    if(bazargah.active){this.getBazargahOrders();}
    //let testedChance = await gardooneApis({type:"get_tested_chance"});
    let pricing = new Pricing('https://b1api.burux.com/api/BRXIntLayer/GetCalcData', userInfo.cardCode,12 * 60 * 60 * 1000)
    pricing.startservice().then((value) => { return value; });
    let getFactorDetails = (items,obj = {})=>{
      let {SettleType,PaymentTime,PayDueDate,DeliveryType} = obj;
      let {userInfo} = this.props;
      let config = {
        "CardCode": userInfo.cardCode,
        "CardGroupCode":userInfo.groupCode,
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
    let fixPrice = (items,campaign = {})=>{
      let {userInfo} = this.props;
      let data = {
        "CardGroupCode": userInfo.groupCode,
        "CardCode": userInfo.cardCode,
        "marketingdetails": {
          "PriceList": campaign.PriceListNum,
          "SlpCode": userInfo.slpcode,
          "Campaign":campaign.CampaigId
        },
        "MarketingLines": items
      }
      let list = items.map(({itemCode})=>itemCode);
        list = pricing.autoPriceList(list, data, null, null, null, null, null, "01");
        return list
    }
    let updateProductPrice = (list,campaignId)=>{
        if(list === false){return false}
      return list.map((o)=>{
        
          if(!o.defaultVariant){
            console.error(`updateProductPrice error`);
            console.error('object is',o);
          }
          let a = o.variants.map((res)=>{
            return {
              itemCode:res.code,itemQty:1
            }
          })
          let array = fixPrice(a,campaignId);
          let result;
          for(let i = 0; i < array.length; i++){
            let obj = array[i];
            if(!result){result = obj}
            else{
              if(obj.FinalPrice && obj.FinalPrice < result.FinalPrice ){
                result = obj;
              }
            }
          }
          let newObj = {...o,...result};
          return newObj
      })
    }
    let cart = await kharidApis({api:'getCart',loading:false});
    this.setState({
      cart,
      fixPrice,
      pricing,
      updateProductPrice,getFactorDetails
    });
  }
  openPopup(type,parameter){
    let {rsa_actions} = this.state;
    let {addPopup,removePopup,setNavId} = rsa_actions;
    if(type === 'password'){
      addPopup({body:()=><PasswordPopup/>,title:'مشاهده و ویرایش رمز عبور'})
    }
    else if(type === 'peygiriye-sefareshe-kharid'){
      addPopup({body:()=><OrdersHistory activeTab={parameter}/>,title:'جزيیات سفارش خرید'})
    }
    if(type === 'joziate-sefareshe-kharid'){
      addPopup({body:()=><OrderPopup order={parameter}/>,title:'پیگیری سفارش خرید'})
    }
    else if(type === 'sabte-garanti-jadid'){
      addPopup({ body:()=><SabteGarantiJadid/>,title:'درخواست مرجوع کالای سوخته'})
    }
    else if(type === 'joziate-darkhast-haye-garanti'){
      addPopup({ body:()=><JoziateDarkhastHayeGaranti/>,title:'جزییات درخواست های گارانتی'})
    }
    else if(type === 'payame-sabte-garanti'){
      let {text,subtext} = parameter;
      addPopup({ type:'center',body:()=><PayameSabteGaranti text={text} subtext={subtext} onClose={()=>removePopup()}/>,header:false})
    }
    else if(type === 'sabte-garanti-jadid-ba-joziat'){
      addPopup({ body:()=><SabteGarantiJadidBaJoziat/>,title:'ثبت در خواست گارانتی جدید با جزییات'})
    }
    else if(type === 'search'){
      addPopup({ 
        body:()=><Search/>,title:'جستجو در محصولات',
        header:()=><Header type='popup' popupId='search'/>
      })
    }
    else if(type === 'product'){
      addPopup({
        body:()=><Product product={parameter}/>,
        title:'خرید کالا',id:'product',
        header:()=><Header type='popup' popupId='product'/>
      })
    }
    else if (type === 'category'){
      addPopup({body:()=><CategoryView category={parameter.category}/>,title:parameter.name})
    }
    else if(type === 'wallet'){
      addPopup({header:false,body:()=><Wallet onClose={()=>removePopup()}/>})
    }
    else if(type === 'tanzimate-kife-pool'){
      addPopup({body:()=><TanzimateKifePool cards={parameter.cards} onChange={parameter.onChange}/>,title:'تنظیمات کیف پول'})
    }
    else if(type === 'cart'){
      addPopup({body:()=><Cart/>,title:'سبد خرید',id:'cart'})
    }
    else if(type === 'shipping'){
      this.setState({shipping:parameter},()=>{
        addPopup({
          body:()=><Shipping onSend={(o)=>this.ersal_baraye_vizitor(o)}/>,
          title:'ادامه فرایند خرید'
        })
      })
    }
    else if(type === 'sefareshe-ersal-shode-baraye-vizitor'){
      addPopup({
        body:()=>(
          <Sefareshe_Ersal_Shode_Baraye_Vizitor
            orderNumber={parameter}
            onShowInHistory={()=>{
              removePopup('all');
              this.openPopup('peygiriye-sefareshe-kharid','در حال بررسی');
            }}
            onClose={()=>{
              removePopup('all');
              setNavId('khane')
            }}
          />
        ),
        header:false
      })
    }
  }
  async ersal_baraye_vizitor({address,SettleType,PaymentTime,DeliveryType,PayDueDate}){
    let {shipping,kharidApis,cart,rsa_actions} = this.state;
    let {cartItems} = shipping;
    let orderNumber = await kharidApis({
      api:"sendToVisitor",
      parameter:{address,SettleType,PaymentTime,DeliveryType,PayDueDate}
    })
    if(orderNumber){
      let variantIds = cartItems.map((o)=>o.variant.id)
      let newCart = {};
      for(let prop in cart){
        if(variantIds.indexOf(prop) === -1){
          newCart[prop] = cart[prop]
        }
      }
      rsa_actions.removePopup('all');
      this.changeCart(newCart)
      this.openPopup('sefareshe-ersal-shode-baraye-vizitor',orderNumber)
    }
  }
  getProfileName(userInfo){
    //let str = userInfo.cardName;
    let str = `${userInfo.firstName} ${userInfo.lastName}`;
    if(!str){return 'پروفایل'}
    if(str.length <= 12){return str}
    return <marquee behavior='scroll' scrollamount={3} direction='right'>{str}</marquee> 
  }
  render() {
    let {userInfo,logout} = this.props;
    let {opacity,theme,noorvare3} = this.state;
    console.log('opacity',opacity);
    let context = {
      ...this.state,
      userInfo,
      openPopup:this.openPopup.bind(this),
      changeCart:this.changeCart.bind(this),
      getCartCountByVariantId:this.getCartCountByVariantId.bind(this),
      logout: this.props.logout,
      baseUrl:this.props.baseUrl
    };
    if(noorvare3){
      return (
        <Noorvare3 
          changeDontShow={(value)=>this.noorvare3Storage.save(!value,'show')} 
          onClose={()=>this.setState({noorvare3:false})}
          onSubmit={()=>{
            this.noorvare3Storage.save(!value,'show')
            this.setState({noorvare3:false})
          }}
        />
      )
    }
    return (
      <appContext.Provider value={context}>
        <RSA
          rtl={true}
          className={`rvd-rtl opacity-${opacity} theme-${theme}`}
          popupConfig={{closeType:'back button',type:'fullscreen',className:`opacity-${opacity} theme-${theme}`}}
          sideClassName={`opacity-${opacity} theme-${theme}`}
          title={(nav)=>nav.id === 'khane'?<>{getSvg('mybrxlogo',{className:'rvd-hide-sm rvd-hide-md rvd-hide-lg'})}<div className='rvd-hide-xs'>{nav.text}</div></>:(nav.id === 'profile'?'پروفایل':nav.text)}
          navs={[
            { text: "خانه", icon: ()=>getSvg(19), id: "khane" },
            { text: "خرید", icon: ()=>getSvg('buy'), id: "kharid" },
            { text: "بازارگاه", icon: ()=>getSvg(20), id: "bazargah" },
            { text:this.getProfileName(userInfo), icon: ()=>getSvg(21), id: "profile" },
          ]}
          sides={[
            { text: 'بازارگاه', icon: ()=> <Icon path={mdiCellphoneMarker} size={0.8}/>,onClick:()=>this.state.rsa_actions.setNavId('bazargah')},
            { text: 'پیگیری سفارش خرید', icon: ()=> <Icon path={mdiClipboardList} size={0.8} />,onClick:()=>this.openPopup('peygiriye-sefareshe-kharid')},
            { text: 'درخواست گارانتی', icon: ()=> <Icon path={mdiShieldCheck} size={0.8} />,onClick:()=>this.openPopup('sabte-garanti-jadid'),show:()=>this.state.showGaranti !== false},
            { text: 'خروج از حساب کاربری', icon: ()=> <Icon path={mdiExitToApp} size={0.8} />,className:'colorFDB913',onClick:()=>logout() }
          ]}
          navHeader={()=>{
            return <NavHeader/>
          }}
          sideHeader={()=><div style={{padding:'24px 0'}}>{getSvg('mybrxlogo')}</div>}
          sideFooter={()=>(
            <RVD
              layout={{
                className:'h-48 p-12 color-fff',align:'v',
                row:[
                  {flex:1},
                  {html:<Icon path={mdiOpacity} size={1} onClick={()=>this.changeOpacity()}/>}
                ]
              }}
            />
          )}
          header={({navId})=><Header type='page' navId={navId}/>}
          navId='khane'
          body={({navId})=>{
            if (navId === "khane") {return <Home />;}
            if (navId === "kharid") {return <Buy/>;}
            if (navId === "bazargah") {return <Bazargah/>;}
            if (navId === "profile") {return <MyBurux />;}
          }}
          getActions={({setConfirm,addPopup,removePopup,setNavId})=>{
            this.setState({rsa_actions:{setConfirm,addPopup,removePopup,setNavId}})
          }}
          splash={()=><Splash/>}
          splashTime={7000}
        />
      </appContext.Provider>
    );
  }
}
Main.defaultProps = {userInfo:{cardCode:'c50000'}}
class NavHeader extends Component{
  render(){
    return (
      <div className='w-100 align-vh m-v-16'>
        <img src={Logo1} alt='' width={200}/>
      </div>
      
    )
  }
}
class Message extends Component{
  constructor(props){
    super(props);
    this.iv = setInterval(()=>{
      let {messages,onChange} = this.props;
      if(!messages.length){clearInterval(this.iv); return}
      messages = messages.slice(1,messages.length);
      onChange(messages);
    },3000)
  }
  render(){
    let {messages} = this.props;
    return <div className='my-burux-message'>{messages[0]}</div>
  }
}
class Header extends Component{
  static contextType = appContext;
  cart_layout(){
    let {openPopup} = this.context;
    let {navId,type,popupId} = this.props;
    if(type === 'page'){
      if(['kharid'].indexOf(navId) === -1){return false}
    }
    if(type === 'popup'){
      if(['product','search'].indexOf(popupId) === -1){return false}
    }
    let {cart} = this.context; 
    let length = Object.keys(cart).length;
    return {
      html:(
        <AIOButton
          type="button" 
          className='header-icon'
          style={{ background: "none",color:'#605E5C' }} 
          text={<Icon path={mdiCart} size={0.7}/>} 
          badge={length > 0?length:undefined}
          badgeAttrs={{ className: "badge-1" }} 
          onClick={() => openPopup('cart')}
        />
      )
    }
  }
  notif_layout(){
    let {navId,type} = this.props;
    if(type === 'popup'){return false}
    if(type === 'page' && navId !== 'khane'){return false}
    let length = 12;
    return {
      html:(
        <AIOButton
          type="button" 
          className='header-icon'
          style={{ background: "none",color:'#605E5C' }} 
          text={<Icon path={mdiBell} size={0.7}/>} 
          badge={length > 0?length:undefined}
          badgeAttrs={{ className: "badge-1" }} 
        />
      )
    }
  }
  bazargahPower_layout(){
    let {bazargah} = this.context;
    let {navId,type} = this.props;
    if(type !== 'page' || navId !== 'bazargah' || !bazargah.active){return false}
    return {
      html:(
        <AIOButton
          type="button" 
          className='header-icon'
          style={{ background: "none",color:'#605E5C' }} 
          text={<Icon path={mdiPower} size={0.7}/>} 
          onClick={()=>bazargah.setActivity(false)}
        />
      )
    }
  }
  buySearch_layout(){
    let {openPopup} = this.context;
    let {navId,type} = this.props;
    if(type !== 'page' || navId !== 'kharid'){return false}
    return {
      html:(
        <AIOButton
          type="button" 
          className='header-icon'
          style={{ background: "none",color:'#605E5C' }} 
          text={<Icon path={mdiMagnify} size={0.7}/>} 
          onClick={()=>openPopup('search')}
        />
      )
    }
  }
  render(){
    return (
      <RVD
        layout={{
          style:{paddingLeft:12},
          row:[
            this.buySearch_layout(),
            this.cart_layout(),
            //this.notif_layout(),
            this.bazargahPower_layout(),
            
          ]
        }}
      />
    )
  }
}