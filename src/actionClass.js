import React, { useState } from 'react';
import RVD from 'react-virtual-dom';
import UrlToJson from './npm/aio-functions/url-to-json';
import Pricing from './pricing';
import ShopClass from './shop-class';
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
import Cart from './components/kharid/cart/cart';
import Sefareshe_Ersal_Shode_Baraye_Vizitor from './components/kharid/sefareshe-ersal-shode-baraye-vizitor/sefareshe-ersal-shode-baraye-vizitor';
import AIOInput from './npm/aio-input/aio-input';
import Home from "./pages/home/index";
import Buy from "./pages/buy/index";
import Bazargah from "./pages/bazargah/bazargah";
import Profile from "./pages/profile/profile";
import Vitrin from './pages/vitrin/vitrin';


export default class ActionClass {
    constructor({ getState, getProps, setState }) {
        this.getState = getState;
        this.getProps = getProps;
        this.setState = setState;
    }
    getSideItems = () => {
        let { userInfo, backOffice, Logger } = this.getProps();
        let { logout } = this.getState();
        let { slpcode, isAdmin } = userInfo;
        let { activeManager } = backOffice;
        let icon = (path) => <Icon path={path} size={0.8} />
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
    getNavItems = () => {
        let { backOffice, userInfo } = this.getProps();
        let icon = (path) => <Icon path={path} size={.9} />
        return [
            { text: "ویترین", icon: () => icon(mdiStore), id: "vitrin",render:()=><Vitrin/> },
            { text: "بازارگاه", icon: () => icon(mdiCellphoneMarker), id: "bazargah",render:()=><Bazargah/> },
            { text: "خانه", icon: () => getSvg('home'), id: "khane",render:()=><Home/> },
            { text: "خرید", icon: () => icon(mdiShopping), id: "kharid",render:()=><Buy/> },
            { text: () => `${userInfo.firstName} ${userInfo.lastName}`, marquee: true, icon: () => icon(mdiAccountBox), id: "profile",render:()=><Profile/> },
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
    addAnaliticsHistory = ({ url, title, userId }) => {
        window.dataLayer = window.dataLayer || [];
        if (userId) {
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

    manageUrl = () => {
        //let { userInfo } = this.getProps()
        let wrl = window.location.href;
        //this.addAnaliticsHistory({userId:userInfo.phoneNumber})
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
    getShopState = async () => {
        let { apis } = this.getState();
        let { backOffice, userInfo } = this.getProps();
        let { Bundle = {}, Regular, spreeCampaigns = [] } = backOffice;
        let states = { spreeCampaignIds: [], Shop_Bundle: {}, Shop_Regular: {}, spreeCategories: [] }

        states.Shop_Regular = new ShopClass({
            getAppState: () => this.getState(),
            config: { ...Regular, cartId: 'Regular', spree: true }
        })
        states.Shop_Bundle = new ShopClass({
            getAppState: () => this.getState(),
            config: { ...Bundle, cartId: 'Bundle', products: [] }
        })
        if (Bundle.active) {
            await apis.request({
                api: "kharid.daryafte_ettelaate_bundle", loading: false, description: 'دریافت اطلاعات باندل',
                onSuccess: (products) => states.Shop_Bundle.update({ products })
            });
        }

        for (let i = 0; i < spreeCampaigns.length; i++) {
            let spreeCampaign = spreeCampaigns[i];
            let list = [
                [10819,'حبابی 7 وات'],
                [10820,'حبابی 10 وات'],
                [10821,'حبابی 12 وات'],
                [10822,'حبابی 15 وات'],
                [10823,'حبابی 20 وات'],
                [10824,'حبابی 25 وات'],
                [10825,'لامپ رنگی'],
                [10826,'اشکی 6 وات'],
                [10827,'شمعی 7 وات'],
                [10828,'انعکاسی 6 و 7 وات'],
                [10829,'گروه کالایی 6 (هالوژن)'],
                [10830,'گروه کالایی 7 (fpl و قاب fpl )'],
                [10831,'گروه کالایی 8 (چراغ خطی)'],
                [10832,'پنل ۶۰ در ۶۰'],
                [10833,'پنل پلی کربنات توکار 8 وات'],
                [10834,'پنل پلی کربنات توکار 15 وات'],
                [10835,'پنل پلی کربنات توکار 18 وات'],
                [10836,'پنل پلی کربنات توکار 22 وات'],
                [10885,'پنل پلی کربنات توکار 28 وات'],
                [10883,'پنل 32 روکار - cob'],
                [10837,'گروه کالایی 10 ( چراغ سقفی)'],
                [10838,'باتری ۴ تایی'],
                [10839,'باتری دوتایی'],
                [10840,'باتری ریموتی - متوسط و شارژی '],
                [10841,'باتری سکه ای '],
                [10842,'کلید مینیاتوری تک پل - ترک'],
                [10886,'کلید مینیاتوری دو پل - ترک'],
                [10844,'کلید مینیاتوری سه پل - ترک'],
                [10845,'گروه کالایی 15  (محافظ جان )'],
                [10846,'سیم افشان 1 در 1,5'],
                [10849,'سیم افشان 1 در2.5'],
                [10850,'سیم افشان 1 در4'],
                [10853,'سیم افشان 1 در6'],
                [10856,'کابل سری 2'],
                [10857,'کابل سری 3'],
                [10858,'کابل سری 4'],
                [10859,'زوجی'],
                [10860,'آنتن سپهر( مس)'],
                [10861,'بست کمربندی'],
                [10862,'فتوسل و آنتن'],
                [10863,'محافظ تک راهی'],
                [10864,'محافظ 3 خانه'],
                [10865,'محافظ 6 خانه'],
                [10866,'چند راهی 5 خانه'],
                [10867,'چسب سیلیکونی'],
                [10868,'چسب 123'],
                [10869,'محصولات رزا قلمو'],
                [10870,'محصولات رزاغلتک'],
                [10871,'محصولات رزا صفحه برش'],
                [10847,'سنباده پشت کرکی و فلاپ دیسک'],
                [10848,'سنباده برگی و سنباده رول'],
                [10851,'دستکش'],
                [10887,'قفل'],
                [10852,'متر های فنی و مهندسی'],
                [10854,'متر های فلزی'],
                [10855,'آچار تخت و رینگی'],
                [10888,'آچار یکسر جغجغه'],
                [10872,'آچار آلن'],
                [10873,'آچار فرانسه'],
                [10889,'ست سوهان و مغار'],
                [10875,'ست بکس'],
                [10876,'ست پیچ گوشتی'],
                [10877,'انبر میخ کش'],
                [10878,'گروه انبر پرچ'],
                [10879,'گروه انبر دست'],
                [10880,'گروه قیچی'],
                [10884,'روغن دان و تلمبه پایی'],
                [10881,'کابل باطری به باطری'],
                [10882,'تورچ جوشکاری']
            ]
            if(spreeCampaign.id === '10818'){
                let cacheCampaigns = apis.getCache('campaigns') || {}
                let {campaignProducts = {}} = cacheCampaigns;                
                spreeCampaign.taxons = list.map(([id,name])=>{
                    let products = campaignProducts[`item_10818_${id}`];
                    return {id,name,isTaxon:true,products}
                })
            }
            let { id, active,taxons  } = spreeCampaign;
            if (!active) { continue }
            states.spreeCampaignIds.push(id);
            states[`Shop_${id}`] = new ShopClass({
                getAppState: () => this.getState(),
                config: { ...spreeCampaign, cartId: id, spree: true, spreeCampaign: true,taxons:taxons && taxons.length?taxons:undefined }
            })
        }
        let { spreeCategories = [] } = backOffice;
        let categories = { icon_type: [], slider_type: [], dic: {} }
        for (let i = 0; i < spreeCategories.length; i++) {
            let sc = spreeCategories[i];
            let { showType = 'icon', id } = sc;
            categories[`${showType}_type`].push(sc);
            categories.dic[id] = sc;
        }
        states.spreeCategories = categories;
        let cart = await apis.request({
            api: 'kharid.getCart',
            parameter: { userInfo, Shop_Bundle: states.Shop_Bundle, spreeCampaignIds: states.spreeCampaignIds },
            description: 'دریافت اطلاعات سبد خرید'
        });
        states.cart = cart;
        this.setState(states)
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
    getFactorDetails = (items, shippingOptions = {}, container) => {
        let { PaymentTime, PayDueDate, DeliveryType, giftCodeInfo, discountCodeInfo,CampaignId } = shippingOptions;
        let DiscountList = this.getCodeDetails({ giftCodeInfo, discountCodeInfo });
        let { userInfo } = this.getProps();
        let { Logger,getSettleType } = this.getState();
        let SettleType = getSettleType(PayDueDate)
        let config = {
            "CardCode": userInfo.cardCode,
            "CardGroupCode": userInfo.groupCode,
            "MarketingLines": items,
            "DeliverAddress": userInfo.address,
            "DiscountList": DiscountList,
            "marketingdetails": { 
                "SlpCode": userInfo.slpcode, 
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
        let { userInfo } = this.getProps();
        let {Logger} = this.getState();
        if (!userInfo.groupCode) { console.error('fixPrice missing userInfo.groupCode') }
        if (!userInfo.cardCode) { console.error('fixPrice missing userInfo.cardCode') }
        if (!userInfo.slpcode) { console.error('fixPrice missing userInfo.slpcode') }
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
    openLink = (linkTo) => {
        let { Shop_Bundle, Shop_Regular, rsa } = this.getState();
        if (linkTo === 'Bundle') { Shop_Bundle.openCategory() }
        else if (linkTo.indexOf('category') === 0) {
            let id = linkTo.split('_')[1];
            Shop_Regular.openCategory(id);
        }
        else if (linkTo.indexOf('spreeCampaign') === 0) {
            let id = linkTo.split('_')[1];
            let shop = this.getShopById(id);
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
                    (<><Icon path={mdiCart} size={0.8} />{length > 0 ? <div className='badge-2'>{length}</div> : undefined}</>),
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
    
    removeCartItem = ({cartId,taxonId,variantId,product,CampaignId})=>{
        let remove = (parent,itemId)=>{
            let newParent = {};
            let newLength = 0;
            for(let item_id in parent){
                if(item_id.toString() !== itemId.toString()){newLength++; newParent[item_id] = parent[item_id]}
            }
            return newLength?newParent:false
        }
        let { cart,msfReport } = this.getState();
        let cartTab = cart[cartId];
        let cartTabItems = cartTab.items;
        if(taxonId){
            let cartTabTaxonItems = remove(cartTabItems[taxonId].items,variantId);
            cartTabItems = {...cartTabItems,[taxonId]:{...cartTabItems[taxonId],items:cartTabTaxonItems}}
            if(!cartTabTaxonItems){cartTabItems = remove(cartTabItems,taxonId)}
            if(cartTabItems){
                let factorDetailsItems = []
                let {items} = cartTabItems[taxonId];
                let productDic = {}
                for(let prop in items){
                    let { variantId, count, product } = items[prop];
                    let variant = product.variants.find((o) => o.id === variantId)
                    productDic[variant.code] = product;
                    factorDetailsItems.push({ ItemCode: variant.code, ItemQty: count })
                }
                let errors = []
                let factorDetails = this.getFactorDetails(factorDetailsItems, {CampaignId}, 'editCartItem');
                let { MarketingLines } = factorDetails;
                for(let i = 0; i < MarketingLines.length; i++){
                    let {CampaignDetails = {},ItemCode} = MarketingLines[i];
                    let {Status = 0,Information,BundleRowsInfos} = CampaignDetails;
                    if(Status < 0){
                        let {taxonId,minValue,maxValue} = BundleRowsInfos;
                        errors.push({product:productDic[ItemCode],taxonId,minValue,maxValue,error:Information})
                    }
                }
                cartTabItems[taxonId].errors = errors
            }
        }
        else {cartTabItems = remove(cartTabItems,variantId);   }
        msfReport({actionName:'remove from cart',actionId:23,targetName:`${product.name}(${variantId})`,targetId:variantId,tagName:'kharid',eventName:'action'})    
        let newCart = {...cart,[cartId]:{...cart[cartId],items:cartTabItems}}
        if(!cartTabItems){newCart = remove(newCart.items,cartId)}
        if(!newCart){newCart = {}}
        return newCart
    }
    editCartItem = ({cartId,taxonId,variantId,count,product,CampaignId})=>{
        let { cart,msfReport } = this.getState();
        let cartTab = cart[cartId] || {items:{},taxonId};
        let cartTabItems = cartTab.items;
        if(taxonId){
            cartTabItems[taxonId] = cartTabItems[taxonId] || {isTaxon:true,taxonId,items:{}}
            if(!cartTabItems[taxonId].items[variantId]){
                msfReport({actionName:'add to cart',actionId:24,targetName:`${product.name}(${variantId})`,targetId:variantId,tagName:'kharid',eventName:'action'})
                cartTabItems[taxonId].items[variantId] = {product,variantId,count:0,isTaxon:true,taxonId}
            }
            cartTabItems[taxonId].items[variantId].count = count
            let factorDetailsItems = []
            let {items} = cartTabItems[taxonId];
            let productDic = {}
            for(let prop in items){
                let { variantId, count, product } = items[prop];
                let variant = product.variants.find((o) => o.id === variantId)
                productDic[variant.code] = product;
                factorDetailsItems.push({ ItemCode: variant.code, ItemQty: count })
            }
            let errors = []
            let factorDetails = this.getFactorDetails(factorDetailsItems, {CampaignId}, 'editCartItem');
            let { MarketingLines } = factorDetails;
            for(let i = 0; i < MarketingLines.length; i++){
                let {CampaignDetails = {},ItemCode} = MarketingLines[i];
                let {Information,BundleRowsInfos} = CampaignDetails;
                if(Information){
                    let {taxonId,minValue,maxValue} = BundleRowsInfos;
                    errors.push({product:productDic[ItemCode],taxonId,minValue,maxValue,error:Information})
                }
            }
            cartTabItems[taxonId].errors = errors
        }
        else {
            if(!cartTabItems[variantId]){
                cartTabItems[variantId] = {product,variantId,count:0}
            }
            cartTabItems[variantId].count = count
        }
        return {...cart,[cartId]:{...cartTab,items:cartTabItems}}
    }
    changeCart = async ({ count, variantId, product,taxonId,cartId,CampaignId }) => {
        let { cart, apis } = this.getState();
        let cartTab = cart[cartId];
        if (!cartTab) { cartTab = { items: {},taxonId } }
        let props = { cartId,count, variantId, product,taxonId,CampaignId }
        let newCart = !count?this.removeCartItem(props):this.editCartItem(props);
        await apis.request({ api: 'kharid.setCart', parameter: newCart, loading: false, description: 'ثبت سبد خرید' })
        this.setState({ cart: newCart });
    }
    openPopup = async (type, parameter) => {
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
            let { userInfo,Login,updateProfile} = this.getProps();
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
            msfReport({actionName:'open password popup',actionId:24,tagName:'prodile',eventName:'page view'})
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
    getGuaranteeImages = async (items) => {
        if (!items.length) { return }
        let { apis, images } = this.getState();
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
    getGuaranteeItems = async () => {
        let { apis, Login } = this.getState();
        let res = await apis.request({ api: "guaranti.garantiItems", loading: false, description: 'دریافت لیست کالاهای گارانتی کاربر' });
        if (res === false) { Login.logout(); return; }
        //this.getGuaranteeImages(items);
        let guaranteeExistItems = await apis.request({ api: "guaranti.kalahaye_ghabele_garanti", loading: false, description: 'کالاهای قابل گارانتی', def: [] });
        this.setState({ guaranteeItems: res, guaranteeExistItems });
    }
    getBazargahOrders = async () => {
        let { bazargahOrders, apis } = this.getState();
        let wait_to_get = await apis.request({ api: 'bazargah.daryafte_sefareshate_bazargah', parameter: { type: 'wait_to_get' }, loading: false, description: 'دریافت سفارشات در انتظار اخذ بازارگاه' });
        let wait_to_send = await apis.request({ api: 'bazargah.daryafte_sefareshate_bazargah', parameter: { type: 'wait_to_send' }, loading: false, description: 'دریافت سفارشات در انتظار ارسال بازارگاه' });
        this.setState({ bazargahOrders: { ...bazargahOrders, wait_to_get, wait_to_send } })
    }
    getShopById = (id) => {
        return this.getState()[`Shop_${id}`]
    }
    getCartItemsByProduct = (product,cartId,taxonId) => {
        let { cart } = this.getState();
        if (!cart[cartId]) { return [] }
        let res = [];
        for (let i = 0; i < product.variants.length; i++) {
            let variant = product.variants[i];
            if(taxonId){
                let taxonItem = cart[cartId].items[taxonId];
                if(taxonItem){
                    let cartItem = cart[cartId].items[taxonId].items[variant.id];
                    if (cartItem) { res.push(cartItem) }
                }   
            }
            else{
                let cartItem = cart[cartId].items[variant.id];
                if (cartItem) { res.push(cartItem) }
            }
            
        }
        return res
    }
    removeCart = (cartId) => {
        let { cart } = this.getState();
        let newCart = {}
        for (let prop in cart) { if (prop !== cartId) { newCart[prop] = cart[prop] } }
        this.setState({ cart: newCart })
    }
}

function DeveloperModePassword({ onSubmit }) {
    let [code, setCode] = useState('')
    function change(code) {
        setCode(code);
        if (code === 'bmdevmode') { onSubmit() }
    }
    return (
        <AIOInput
            type='text' value={code} onChange={(code) => change(code)} className='developer-mode-input'
        />
    )
}