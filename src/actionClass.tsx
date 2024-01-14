import React, { useState } from 'react';
import RVD from 'react-virtual-dom';
import UrlToJson from './npm/aio-functions/url-to-json';
import Pricing from './pricing';
import ShopClass from './shop-class.tsx';
import { Icon } from '@mdi/react';
import { mdiShieldCheck, mdiCellphoneMarker, mdiClipboardList,mdiCodeBraces, mdiExitToApp, mdiCash, mdiSecurity, mdiSkullScan, mdiCart,mdiStore, mdiHome, mdiShopping, mdiAccountBox } from "@mdi/js";
import getSvg from './utils/getSvg';
import Register from './components/register/register';
import PriceList from './popups/price-list/price-list';
import BackOffice from './back-office-panel';
import CountPopup from './components/kharid/product-count/count-popup';
import PasswordPopup from './components/password-popup/password-popup';
import OrdersHistory from './components/kharid/orders-history/orders-history';
import OrderPopup from './components/kharid/order-popup/order-popup';
import SabteGarantiJadid from './components/garanti/sabte-garanti-jadid/sabte-garanti-jadid';
import JoziateDarkhastHayeGaranti from './components/garanti/joziate-darkhast-haye-garanti/joziate-darkhast-haye-garanti';
import PayameSabteGaranti from './components/garanti/payame-sabte-garanti/payame-sabte-garanti';
import SabteGarantiJadidBaJoziat from './components/garanti/sabte-garanti-jadid-ba-joziat/sabte-garanti-jadid-ba-joziat';
import Search from './components/kharid/search/search';
import Wallet from './popups/wallet/wallet';
import TanzimateKifePool from './components/kife-pool/tanzimate-kife-pool/tanzimate-kife-pool';
import Cart from './components/kharid/cart/cart.tsx';
import Sefareshe_Ersal_Shode_Baraye_Vizitor from './components/kharid/sefareshe-ersal-shode-baraye-vizitor/sefareshe-ersal-shode-baraye-vizitor';
import AIOInput from './npm/aio-input/aio-input';
import Home from "./pages/home/index";
import Buy from "./pages/buy/index";
import Bazargah from "./pages/bazargah/bazargah";
import Profile from "./pages/profile/profile";
import Vitrin from './pages/vitrin/vitrin';
import taxonCampaign from './taxonCampaign';
import { I_marketingLine, I_shippingOptions, I_state_spreeCategories, I_spreeCategory, I_state_Shop, I_app_state, I_state_backOffice, I_userInfo, I_B1Info, I_state_cart, I_cartTab, I_cartTaxon, I_updateProfile, I_AIOLogin_class, I_cartTab_isTaxon, I_cartProduct, I_variant } from './types';

type I_getSideItems = ()=>{
    text:string,icon:()=>React.ReactNode,onClick:()=>void
}[]
type I_getNavItems = ()=>{
    text:string | (()=>string),icon:()=>React.ReactNode,render:()=>React.ReactNode,id:string
}[]
type I_getFactorDetails = (items:any[],shippingOptions:I_shippingOptions,container?:string)=>{
    MarketingLines:{CampaignDetails:any,ItemCode:string}[]
}
type I_getShopState = ()=>{
    Shop:I_state_Shop,cart:I_state_cart
}
export default class ActionClass {
    getState:()=>I_app_state;
    setState:(p:any)=>void
    getProps:()=>{
        backOffice:I_state_backOffice,
        userInfo:I_userInfo,
        b1Info:I_B1Info,
        Logger:any,
        updateProfile:I_updateProfile,
        Login:I_AIOLogin_class
    };
    pricing:any;
    constructor({ getState, getProps, setState }) {
        this.getState = getState;
        this.getProps = getProps;
        this.setState = setState;
    }
    getSideItems:I_getSideItems = () => {
        let { userInfo,b1Info, backOffice, Logger } = this.getProps();
        let { logout } = this.getState();
        let { slpcode } = b1Info.customer;
        let isAdmin = backOffice.isAdmin(userInfo);
        let { activeManager } = backOffice;
        let icon = (path:any):React.ReactNode => <Icon path={path} size={0.8} />
        return [
            { text: 'بازارگاه', icon: () => icon(mdiCellphoneMarker), onClick: () => this.getState().rsa.setNavId('bazargah') },
            { text: 'پیگیری سفارش خرید', icon: () => icon(mdiClipboardList), onClick: () => this.openPopup('peygiriye-sefareshe-kharid') },
            { text: 'درخواست گارانتی', icon: () => icon(mdiShieldCheck), onClick: () => this.openPopup('sabteGarantiJadid'), show: () => !!activeManager.garanti && slpcode },
            { text: 'لیست قیمت', icon: () => icon(mdiCash), onClick: () => this.openPopup('priceList'), show: () => !!activeManager.priceList },
            { text: 'پنل ادمین', icon: () => icon(mdiSecurity), onClick: () => this.openPopup('admin-panel'), show: () => !!isAdmin },
            { text: 'رفتار سیستم', icon: () => icon(mdiSkullScan), onClick: () => Logger.openPopup(), show: () => !!this.getState().developerMode },
            { text: 'خروج از حساب کاربری', icon: () => icon(mdiExitToApp), attrs: { className: 'colorFDB913' }, onClick: () => logout() }
        ]
    }
    getNavItems:I_getNavItems = () => {
        let { userInfo } = this.getProps();
        let icon = (path) => <Icon path={path} size={.9} />
        let firstName = userInfo.firstName;
        let lastName = userInfo.lastName;
        lastName = typeof lastName !== 'string'?'':lastName;
        return [
            { text: "ویترین", icon: () => icon(mdiStore), id: "vitrin",render:()=><Vitrin/> },
            { text: "بازارگاه", icon: () => icon(mdiCellphoneMarker), id: "bazargah",render:()=><Bazargah/> },
            { text: "خانه", icon: () => getSvg('home'), id: "khane",render:()=><Home/> },
            { text: "خرید", icon: () => icon(mdiShopping), id: "kharid",render:()=><Buy/> },
            { text: () => `${firstName} ${lastName}`, marquee: true, icon: () => icon(mdiAccountBox), id: "profile",render:()=><Profile/> },
        ]
    }
    getSideFooter = ()=>{
        return (
            <RVD
              layout={{
                style:{height:60,color:'#fff'},
                row:[
                  {flex:1},
                  {size:36,align:'vh',html:<Icon path={mdiCodeBraces} size={1}/>,onClick:()=>{
                    let {developerMode} = this.getState();
                    this.setState({developerMode:!developerMode})
                  }}
                ]
              }}
            />
          )
    }
    getAppTitle = (nav) => {
        if (nav.id === 'khane') {
            return <>{getSvg('mybrxlogo', { className: 'rvd-hide-sm rvd-hide-md rvd-hide-lg' })}<div className='rvd-hide-xs'>{nav.text}</div></>
        }
        else if (nav.id === 'profile') { return 'پروفایل' }
        else { return nav.text }
    }
    manageUrl = () => {
        let wrl = window.location.href;
        let jsonUrl = UrlToJson(wrl)
        if (jsonUrl.status === '2') {
            alert('خطا در پرداخت')
            //window.location.href = wrl.slice(0,wrl.indexOf('/?status')) 
            //window.history.pushState(window.history.state, window.title, wrl.slice(0, wrl.indexOf('/?status')));
        }
        else if (jsonUrl.status === '3') {
            alert('پرداخت موفق')
            //window.location.href = wrl.slice(0,wrl.indexOf('/?status')) 
            //window.history.pushState(window.history.state, window.title, wrl.slice(0, wrl.indexOf('/?status')));
        }
    }
    getInitialNavId = () => {
        let wrl = window.location.href;
        let jsonUrl = UrlToJson(wrl)
        return jsonUrl.tab || 'khane'
    }
    startPricing = () => {
        let { userInfo } = this.getProps();
        this.pricing = new Pricing('https://b1api.burux.com/api/BRXIntLayer/GetCalcData', userInfo.cardCode, 12 * 60 * 60 * 1000)
        this.pricing.startservice().then((value) => { return value; });
    }
    getShopState:I_getShopState = () => {
        let { apis,backOffice, userInfo } = this.getState();
        let { Bundle, Regular, spreeCampaigns = [] } = backOffice;
        let Shop:I_state_Shop = {}
        Shop.Regular = new ShopClass({getAppState: () => this.getState(),config: Regular})
        if (Bundle.active) {
            Shop.Bundle = new ShopClass({getAppState: () => this.getState(),config: { ...Bundle, cartId: 'Bundle' }})
        }
        for (let i = 0; i < spreeCampaigns.length; i++) {
            let spreeCampaign = spreeCampaigns[i];
            if(spreeCampaign.id === '10818'){
                let list = taxonCampaign;
                let cacheCampaigns = apis.getCache('campaigns') || {}
                let {campaignProducts = {}} = cacheCampaigns;                
                spreeCampaign.taxons = list.map(([id,name,min,max],i)=>{
                    let products = campaignProducts[`item_10818_${id}`];
                    return {id,name,isTaxon:true,products,min,max}
                })
            }
            let { id, active,taxons  } = spreeCampaign;
            if (!active) { continue }
            Shop[id] = new ShopClass({
                getAppState: () => this.getState(),
                config: { ...spreeCampaign, cartId: id,taxons:taxons && taxons.length?taxons:undefined }
            })
        }
        
        let cart = apis.request({api: 'kharid.getCart',parameter: { userInfo, Shop },description: 'دریافت اطلاعات سبد خرید'});
        return {cart,Shop}
    }
    getSpreeCategories = (backOffice:I_state_backOffice) => {
        let { spreeCategories = [] } = backOffice;
        let categories:I_state_spreeCategories = { icon_type: [], slider_type: [], dic: {} }
        for (let i = 0; i < spreeCategories.length; i++) {
            let sc:I_spreeCategory = spreeCategories[i];
            let { showType = 'icon', id } = sc;
            categories[`${showType}_type`].push(sc);
            categories.dic[id] = sc;
        }
        return categories;
    }
    getSettleType = (PayDueDate:number) =>{
        if(PayDueDate === undefined){return}
        let {backOffice} = this.getProps();
        let PayDueDateOption = backOffice.PayDueDate_options.find((o)=>o.value === PayDueDate);
        if(!PayDueDateOption){return}
        let {cashPercent,days} = PayDueDateOption;
        if(days){return cashPercent?4:2}
        else{return cashPercent?1:undefined}
    }
    getCodeDetails = ({ giftCodeInfo, discountCodeInfo }) => {
        function getPromo(id) {
            if (id === 0) { }
            if (id === 1) { return { Id: 1, Name: "5% تخفیف تا سقف 10 میلیون تومان", Max: 100000000, Discount: 5 } }
            if (id === 2) { return { Id: 2, Name: "10% تخفیف تا سقف 5 میلیون تومان", Max: 50000000, Discount: 10 } }
            if (id === 3) { return { Id: 3, Name: "هدیه 500 هزارتومان", Max: 5000000, Discount: 100 } }
            if (id === 4) { return { Id: 4, Name: "هدیه یک میلیون تومان", Max: 10000000, Discount: 100 } }
            if (id === 5) { return { Id: 5, Name: "هدیه یک و نیم میلیون تومان", Max: 15000000, Discount: 100 } }
            if (id === 6) { return { Id: 6, Name: "هدیه دو میلیون تومان", Max: 20000000, Discount: 100 } }
        }
        let DiscountList;
        if (giftCodeInfo) {
            let { Max } = getPromo(giftCodeInfo.promotion_code.promotion_type)
            DiscountList = DiscountList || {};
            DiscountList.PromotionCode = giftCodeInfo.promotion_code.code;
            DiscountList.PromotionValue = Max;
            DiscountList.PromotionId = giftCodeInfo.promotion_code.id;

        }
        if (discountCodeInfo) {
            let { Max, Discount } = getPromo(discountCodeInfo.promotion_code.promotion_type)
            DiscountList = DiscountList || {};
            DiscountList.DiscountId = discountCodeInfo.promotion_code.id;
            DiscountList.DiscountPercentage = Discount;
            DiscountList.DiscountMaxValue = Max;
            DiscountList.DiscountCode = discountCodeInfo.promotion_code.code;
        }
        return DiscountList
    }
    getFactorDetails:I_getFactorDetails = (marketingLines:I_marketingLine[], shippingOptions?:I_shippingOptions, container?:string) => {
        let { PaymentTime, PayDueDate, DeliveryType, giftCodeInfo, discountCodeInfo,CampaignId } = shippingOptions || {};
        let DiscountList = this.getCodeDetails({ giftCodeInfo, discountCodeInfo });
        let { userInfo,b1Info } = this.getProps();
        let { Logger } = this.getState();
        let SettleType = this.getSettleType(PayDueDate)
        let config = {
            "CardCode": userInfo.cardCode,
            "CardGroupCode": b1Info.customer.groupCode,
            "MarketingLines": marketingLines,
            "DeliverAddress": userInfo.address,
            "DiscountList": DiscountList,
            "marketingdetails": { 
                "SlpCode": b1Info.customer.slpcode, 
                SettleType, PaymentTime, PayDueDate, DeliveryType, DiscountList,
                Campaign:CampaignId
             }
        }
        if (container === 'shipping') { Logger.add(`autoCalcDoc payload(${container})`, JSON.parse(JSON.stringify(config)), 'autoCalcDoc_payload' + container) }
        let res = this.pricing.autoCalcDoc(config);
        if (container === 'shipping') { 
            let data = {}
            try{
                data = {...res,CampaignDetails:{...res.CampaignDetails,BundleRowsInfos:'به خاطر حجم زیاد حذف شد'}}
            }
            catch{}
            Logger.add(`autoCalcDoc response(${container})`, data, 'autoCalcDoc_response' + container) 
        }
        return res
    }
    fixPrice = ({ items, CampaignId, PriceListNum }) => {
        let { userInfo,b1Info } = this.getProps();
        let {Logger} = this.getState();
        if (!b1Info.customer.groupCode) { console.error('fixPrice missing userInfo.groupCode') }
        if (!userInfo.cardCode) { console.error('fixPrice missing userInfo.cardCode') }
        if (!b1Info.customer.slpcode) { console.error('fixPrice missing userInfo.slpcode') }
        let data = {
            "CardGroupCode": b1Info.customer.groupCode,
            "CardCode": userInfo.cardCode,
            "marketingdetails": {
                "PriceList": PriceListNum,
                "SlpCode": b1Info.customer.slpcode,
                "Campaign": CampaignId
            },
            "MarketingLines": items
        }
        let list = items.map(({ itemCode }) => itemCode);
        Logger.add(`autoPriceList payload`, JSON.parse(JSON.stringify(data)), 'autoPriceList_payload')
        
        try {
            list = this.pricing.autoPriceList(list, data);
            Logger.add(`autoPriceList response`, JSON.parse(JSON.stringify(data)), 'autoPriceList_response')
        }
        catch (err) {
            alert('Pricing در محاسبات دچار مشکل شد . لطفا این مساله را با ادمین سیستم در میان بگذارید')
            alert(err)
        }
        return list
    }
    openLink = (linkTo:string) => {
        let { Shop, rsa } = this.getState();
        if (linkTo === 'Bundle') { Shop.Bundle.openCategory() }
        else if (linkTo.indexOf('category') === 0) {
            let id = linkTo.split('_')[1];
            Shop.Regular.openCategory(id);
        }
        else if (linkTo.indexOf('spreeCampaign') === 0) {
            let id = linkTo.split('_')[1];
            let shop = Shop[id];
            if (!shop) { return }
            shop.openCategory();
        }
        else if (linkTo.indexOf('openPopup') === 0) { this.openPopup(linkTo.split('_')[1]); }
        else if (linkTo.indexOf('bottomMenu') === 0) { rsa.setNavId(linkTo.split('_')[1]) }
    }
    isLocationMissed = () => {
        let { userInfo:u } = this.getProps();
        if(!u.latitude){return true}
        if(!u.longitude){return true}
        if(!u.userProvince){return true}
        if(!u.userCity){return true}
        let delta = Math.sqrt(Math.pow(Math.abs(u.latitude - 35.699739),2) + Math.pow(Math.abs(u.longitude - 51.338097),2));
        if(delta < 0.0006){return true}
        return false
    }
    handleMissedLocation = () => {
        setTimeout(() => {
            try {if(this.isLocationMissed()){this.openPopup('profile','location')}} catch { }
        }, 1000)
    }
    getHeaderIcons = (obj) => {
        let { cart } = obj;
        let res = [];
        if (cart) {
            let length = this.getCartLength();
            res.push(
                [
                    (
                        <>
                            <Icon path={mdiCart} size={0.8} />
                            {length > 0 ? <div className='badge-2'>{length}</div> : undefined}
                        </>
                    ),
                    { className: 'header-icon', style: { background: "none", color: '#605E5C' }, onClick: () => this.openPopup('cart') }
                ]
            )
        }
        return res

    }
    getCartLength = () => {
        let { cart } = this.getState();
        let cartLength = 0;
        let cartTabs = Object.keys(cart);
        for (let i = 0; i < cartTabs.length; i++) {
            let cartTab = cart[cartTabs[i]];
            cartLength += Object.keys(cartTab.items).length;
        }
        return cartLength
    }
    removeItem = (obj,id,field)=>{
        let newItems = {}
        let length = 0;
        for(let prop in obj[field]){
            if(id.toString() !== prop.toString()){
                length++;
                newItems[prop] = obj[field][prop]
            }
        }
        if(length){return{...obj,[field]:newItems}}
        return {...obj,[field]:undefined};
    }
    removeCartItem = ({cartId,taxonId,variantId,product,CampaignId})=>{
        let { cart,msfReport } = this.getState();
        let cartTab = cart[cartId];
        if(taxonId){
            let newCartTab = cartTab as I_cartTab_isTaxon;
            let cartTaxon:I_cartTaxon = newCartTab.taxons[taxonId];
            let cartProduct:I_cartProduct = cartTaxon.products[product.id];
            cartProduct = this.removeItem(cartProduct,variantId,'variants')
            if(!cartProduct.variants){
                cartTaxon = this.removeItem(cartTaxon,product.id,'products')
            }
            if(!cartTaxon.products){
                newCartTab = this.removeItem(newCartTab,taxonId,'taxons')
            }
            cartTab = newCartTab;
            if(cartTaxon.products){
                let factorDetailsItems = []
                let variantDic = {}
                for(let productId in cartTaxon.products){
                    let { variants,product } = cartTaxon.products[productId];
                    for(let variantId in variants){
                        let { count,variant } = variants[variantId];
                        variantDic[variantId] = {product,variant};
                        factorDetailsItems.push({ ItemCode: variantId, ItemQty: count })
                    }
                }
                let errors = []
                let factorDetails = this.getFactorDetails(factorDetailsItems, {CampaignId}, 'editCartItem');
                let { MarketingLines } = factorDetails;
                for(let i = 0; i < MarketingLines.length; i++){
                    let {CampaignDetails = {},ItemCode} = MarketingLines[i];
                    let {Status = 0,Information,BundleRowsInfos} = CampaignDetails;
                    if(Status < 0){
                        let {taxonId,minValue,maxValue} = BundleRowsInfos;
                        let {product,variant} = variantDic[ItemCode]; 
                        errors.push({variant,product,taxonId,minValue,maxValue,error:Information})
                    }
                }
                cartTaxon.errors = errors
            }
        }
        else {
            let newCartTab = cartTab as I_cartTab;
            let cartProduct:I_cartProduct = newCartTab.products[product.id]
            cartProduct = this.removeItem(cartProduct,variantId,'variants');
            if(!cartProduct.variants){
                newCartTab = this.removeItem(newCartTab,product.id,'products')  
            }
            cartTab = newCartTab
        }
        msfReport({actionName:'remove from cart',actionId:23,targetName:`${product.name}(${variantId})`,targetId:variantId,tagName:'kharid',eventName:'action'})    
        let newCart = {}
        for(let prop in cart){
            if(prop === cartId){
                if(cartTab.isTaxon === true){
                    if(cartTab.taxons){newCart[prop] = cartTab}
                }
                else{
                    if(cartTab.products){newCart[prop] = cartTab}
                }
            }
            else {newCart[prop] = cart[prop];}
        }
        return newCart
    }
    editCartItem = ({cartId,taxonId,variantId,count,product,CampaignId})=>{
        let { cart,msfReport } = this.getState();
        let cartTab = cart[cartId];
        let reportAdd = false;
        if(taxonId){
            let newCartTab = cartTab as I_cartTab_isTaxon;
            if(!newCartTab){newCartTab = {isTaxon:true,taxons:{}}}
            if(!newCartTab.taxons[taxonId]){
                newCartTab.taxons[taxonId] = {taxonId,products:{}}
            }
            if(!newCartTab.taxons[taxonId].products[product.id]){
                newCartTab.taxons[taxonId].products[product.id] = {variants:{},product}
            }
            if(!newCartTab.taxons[taxonId].products[product.id].variants[variantId]){
                reportAdd = true;
                let variant = product.variants.find((variant)=>variant.id === variantId);
                newCartTab.taxons[taxonId].products[product.id].variants[variantId] = {count:0,variant}
            }
            newCartTab.taxons[taxonId].products[product.id].variants[variantId].count = count
            let factorDetailsItems = []
            let variantDic = {}
            for(let productId in newCartTab.taxons[taxonId].products){
                let { variants, product } = newCartTab.taxons[taxonId].products[productId];
                for(let variantId in variants){
                    let {count,variant} = variants[variantId];
                    variantDic[variantId] = {variant,product};
                    factorDetailsItems.push({ ItemCode: variantId, ItemQty: count }) 
                }
            }
            let errors = []
            let factorDetails = this.getFactorDetails(factorDetailsItems, {CampaignId}, 'editCartItem');
            let { MarketingLines } = factorDetails;
            for(let i = 0; i < MarketingLines.length; i++){
                let {CampaignDetails = {},ItemCode} = MarketingLines[i];
                let {Information,BundleRowsInfos} = CampaignDetails;
                if(Information){
                    let {taxonId,minValue,maxValue} = BundleRowsInfos;
                    let {product,variant} = variantDic[ItemCode]
                    errors.push({product,variant,taxonId,minValue,maxValue,error:Information})
                }
            }
            newCartTab.taxons[taxonId].errors = errors
            cartTab = newCartTab;
        }
        else {
            let newCartTab = cartTab as I_cartTab;
            if(!newCartTab){newCartTab = {products:{},isTaxon:false}}
            if(!newCartTab.products[product.id]){
                newCartTab.products[product.id] = {product,variants:{}}
            }
            if(!newCartTab.products[product.id].variants[variantId]){
                reportAdd = true
                let variant = product.variants.find((variant:I_variant)=>variant.id === variantId);
                newCartTab.products[product.id].variants[variantId] = {variant,count:0}
            }
            newCartTab.products[product.id].variants[variantId].count = count;
            cartTab = newCartTab;
        }
        if(reportAdd){msfReport({actionName:'add to cart',actionId:24,targetName:`${product.name}(${variantId})`,targetId:variantId,tagName:'kharid',eventName:'action'})}
        return {...cart,[cartId]:cartTab}
    }
    changeCart = async ({ count, variantId, product,taxonId,cartId,CampaignId }) => {
        let { apis } = this.getState();
        let props = { cartId,count, variantId, product,taxonId,CampaignId }
        let newCart = !count?this.removeCartItem(props):this.editCartItem(props);
        await apis.request({ api: 'kharid.setCart', parameter: newCart, loading: false, description: 'ثبت سبد خرید' })
        this.setState({ cart: newCart });
    }
    openPopup = (type:string, parameter?:any):void => {
        let { rsa, backOffice, Logger,msfReport } = this.getState();
        let { userInfo } = this.getProps();
        let { addModal, removeModal, setNavId } = rsa;
        if (type === 'vitrin-search') {
            msfReport({actionName:'open vitrin search',actionId:18,tagName:'vitrin',eventName:'page view'})
            let {render} = parameter;
            addModal({
                id: type,
                header: { title: 'افزودن محصول به ویترین من', attrs: { className: 'vitrin-search-popup-header' } },
                body: { render }
            })
        }
        if (type === 'vitrin-product-page') {
            let {render,product} = parameter;
            msfReport({actionName:'open vitrin product page',targetName:product.name,targetId:product.id,actionId:1548,tagName:'vitrin',eventName:'page view'})
            addModal({
                id: type,
                header: { title: 'افزودن نوع کالا به ویترین من', attrs: { className: '' } },
                body: { render }
            })
        }
        else if(type === 'vitrin-categories'){
            let {render} = parameter;
            msfReport({actionName:'open vitrin categories',actionId:19,tagName:'vitrin',eventName:'page view'})
            addModal({body: {render},id: 'categories',header: { title: 'دسته بندی محصولات' }})
        }
        else if (type === 'profile') {
            let { Login,updateProfile} = this.getProps();
            msfReport({actionName:'open profile',actionId:20,tagName:'profile',eventName:'page view'})
            let mode = parameter;
            let title = {profile:'ویرایش حساب کاربری',location:'ثبت موقعیت جغرافیایی'}[mode]
            let subtitle = `شماره:${userInfo.phoneNumber || userInfo.userName} - کد : ${userInfo.cardCode}`
            let header = {title,subtitle}
            let model = {
                firstname:userInfo.firstName,
                lastname:userInfo.lastName,
                location:{lat:userInfo.latitude,lng:userInfo.longitude},
                storeName:userInfo.storeName,
                phone:userInfo.landline || userInfo.landlineNumber,
                address:userInfo.address,
                city:userInfo.userCity,
                state:userInfo.userProvince
            }
            let fields = [];
            if(mode === 'profile'){
                fields = [['*firstname','*lastname'],['*storeName_text_نام فروشگاه','*phone'],'*location','*address',['*state','*city']]
            }
            if(mode === 'location'){
                fields = ['*location','*address',['*state','*city']]
            }
            let onSubmit = async (model) => await updateProfile(model,mode,()=>removeModal(type));
            addModal({position: 'fullscreen', id: type,header,body: {attrs:{className:'profile-container'},render: () => {
                return <Register renderLogin={()=>Login.render({profile:{model,onSubmit,fields}})} mode={mode}/>
            }}})
        }
        else if (type === 'logs') {
            addModal({ position: 'fullscreen', id: type, body: { render: () => Logger.render() }, header: { title: 'رفتار سیستم' } })
        }
        else if (type === 'priceList') {
            msfReport({actionName:'open price list',actionId:21,tagName:'other',eventName:'page view'})
            addModal({ position: 'fullscreen', id: type, body: { render: () => <PriceList /> }, header: { title: 'لیست قیمت تولیدکنندگان', backbutton: true } })
        }
        else if (type === 'admin-panel') {
            msfReport({actionName:'open admin panel',actionId:22,tagName:'other',eventName:'page view'})
            addModal({ position: 'fullscreen', id: type, body: { render: () => <BackOffice model={backOffice} phoneNumber={userInfo.userName} /> } })
        }
        else if (type === 'count-popup') {
            msfReport({actionName:'open product count popup',actionId:23,tagName:'kharid',eventName:'page view'})
            addModal({
                position: 'center', id: type, attrs: { style: { height: 'fit-content' } },
                body: { render: () => <CountPopup {...parameter} /> }, header: { title: 'تعداد را وارد کنید', closeType: 'close button' }
            })
        }
        else if (type === 'password') {
            msfReport({actionName:'open password popup',actionId:24,tagName:'profile',eventName:'page view'})
            addModal({ id: type, position: 'fullscreen', body: { render: () => <PasswordPopup /> }, header: { title: 'مشاهده و ویرایش رمز عبور' } })
        }
        else if (type === 'peygiriye-sefareshe-kharid') {
            msfReport({actionName:'open order follow up popup',actionId:25,tagName:'kharid',eventName:'page view'})
            addModal({ id: type, position: 'fullscreen', body: { render: () => <OrdersHistory activeTab={parameter} /> }, header: { title: 'جزيیات سفارش خرید' } })
        }
        if (type === 'joziate-sefareshe-kharid') {
            addModal({ id: type, position: 'fullscreen', body: { render: () => <OrderPopup order={parameter} /> }, header: { title: 'پیگیری سفارش خرید' } })
        }
        else if (type === 'sabteGarantiJadid') {
            addModal({ id: type, position: 'fullscreen', body: { render: () => <SabteGarantiJadid /> }, header: { title: 'درخواست مرجوع کالای سوخته' } })
        }
        else if (type === 'joziate-darkhast-haye-garanti') {
            addModal({ id: type, position: 'fullscreen', body: { render: () => <JoziateDarkhastHayeGaranti /> }, header: { title: 'جزییات درخواست های گارانتی' } })
        }
        else if (type === 'payame-sabte-garanti') {
            let { text, subtext } = parameter;
            addModal({ id: type, position: 'center', body: { render: () => <PayameSabteGaranti text={text} subtext={subtext} onClose={() => removeModal()} /> } })
        }
        else if (type === 'sabte-garanti-jadid-ba-joziat') {
            addModal({ id: type, position: 'fullscreen', body: { render: () => <SabteGarantiJadidBaJoziat /> }, header: { title: 'ثبت در خواست گارانتی جدید با جزییات' } })
        }
        else if (type === 'search') {
            msfReport({actionName:'open search popup',actionId:26,tagName:'kharid',eventName:'page view'})
            
            addModal({
                id: type, position: 'fullscreen', body: { render: () => <Search /> }, header: { title: 'جستجو در محصولات' },
                //header: () => <Header type='popup' popupId='search' />
            })
        }
        else if (type === 'wallet') {
            addModal({ id: type, position: 'fullscreen', body: { render: () => <Wallet onClose={() => removeModal()} /> } })
        }
        else if (type === 'tanzimate-kife-pool') {
            addModal({ id: type, position: 'fullscreen', body: { render: () => <TanzimateKifePool cards={parameter.cards} onChange={parameter.onChange} /> }, header: { title: 'تنظیمات کیف پول' } })
        }
        else if (type === 'cart') {
            msfReport({actionName:'open cart',actionId:27,tagName:'kharid',eventName:'page view'})
            addModal({ id: type, position: 'fullscreen', body: { render: () => <Cart cartId={parameter} /> }, header: { title: 'سبد خرید' } })
        }
        else if (type === 'sefareshe-ersal-shode-baraye-vizitor') {
            addModal({
                id: type,
                body: {
                    render: () => (
                        <Sefareshe_Ersal_Shode_Baraye_Vizitor
                            orderNumber={parameter.orderNumber} qr={parameter.qr}
                            onShowInHistory={() => { removeModal('all'); this.openPopup('peygiriye-sefareshe-kharid', 'در حال بررسی'); }}
                            onClose={() => { removeModal('all'); setNavId('khane') }}
                        />
                    )
                }
            })
        }
    }
    getGuaranteeItems = async () => {
        let { apis, Login } = this.getState();
        let res = await apis.request({ api: "guaranti.garantiItems", loading: false, description: 'دریافت لیست کالاهای گارانتی کاربر' });
        if (res === false) { Login.logout(); return; }
        let guaranteeExistItems = await apis.request({ api: "guaranti.kalahaye_ghabele_garanti", loading: false, description: 'کالاهای قابل گارانتی', def: [] });
        this.setState({ guaranteeItems: res, guaranteeExistItems });
    }
    getBazargahOrders = async () => {
        let { bazargahOrders, apis } = this.getState();
        let wait_to_get = await apis.request({ api: 'bazargah.daryafte_sefareshate_bazargah', parameter: { type: 'wait_to_get' }, loading: false, description: 'دریافت سفارشات در انتظار اخذ بازارگاه' });
        let wait_to_send = await apis.request({ api: 'bazargah.daryafte_sefareshate_bazargah', parameter: { type: 'wait_to_send' }, loading: false, description: 'دریافت سفارشات در انتظار ارسال بازارگاه' });
        this.setState({ bazargahOrders: { ...bazargahOrders, wait_to_get, wait_to_send } })
    }
    getCartItemsByProduct = (product,cartId,taxonId) => {
        let { cart } = this.getState();
        if (!cart[cartId]) { return [] }
        let res = [];
        for (let i = 0; i < product.variants.length; i++) {
            let variant = product.variants[i];
            if(taxonId){
                let cartTab = cart[cartId] as I_cartTaxon;
                let taxonItem = cartTab.items[taxonId];
                if(taxonItem){
                    let cartItem = cartTab.items[taxonId].items[variant.id];
                    if (cartItem) { res.push(cartItem) }
                }  
            }
            else{
                let cartTab = cart[cartId] as I_cartTab;
                let cartItem = cartTab.items[variant.id];
                if (cartItem) { res.push(cartItem) }
            }
            
        }
        return res
    }
    removeCart = (cartId:string) => {
        let { cart } = this.getState();
        let newCart = {}
        for (let prop in cart) { if (prop !== cartId) { newCart[prop] = cart[prop] } }
        this.setState({ cart: newCart })
    }
}