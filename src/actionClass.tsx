import React from 'react';
import RVD from 'react-virtual-dom';
import UrlToJson from './npm/aio-functions/url-to-json';
import Pricing from './pricing';
import ShopClass from './shop-class.tsx';
import { Icon } from '@mdi/react';
import { 
    mdiShieldCheck, mdiCellphoneMarker, mdiClipboardList,mdiCodeBraces, mdiExitToApp, mdiCash, mdiSecurity, mdiSkullScan, 
    mdiCart,mdiStore, mdiShopping, mdiAccountBox, mdiDelete, mdiEye, 
    mdiLoading
} from "@mdi/js";
import getSvg from './utils/getSvg';
import Register from './components/register/register';
import PriceList from './popups/price-list/price-list';
import BackOffice from './back-office-panel.tsx';
import {CountPopup} from './shop-class.tsx';
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
import {Cart} from './shop-class.tsx';
import Sefareshe_Ersal_Shode_Baraye_Vizitor from './components/kharid/sefareshe-ersal-shode-baraye-vizitor/sefareshe-ersal-shode-baraye-vizitor';
import Sefaresh_Pardakht_Shode from './components/kharid/sefaresh-pardakht-shode/sefaresh-pardakht-shode';
import Home from "./pages/home/home.tsx";
import Buy from "./pages/buy/buy.tsx";
import Bazargah from "./pages/bazargah/bazargah";
import BazargahNew from "./pages/bazargah/bg.tsx";
import Profile from "./pages/profile/profile.tsx";
import Vitrin from './pages/vitrin/vitrin.tsx';
import { I_AIOLogin } from './npm/aio-login/index.tsx';
import { 
    I_marketingLine, I_shippingOptions, I_state_spreeCategories, I_spreeCategory, I_state_Shop, I_app_state, I_state_backOffice, 
    I_userInfo, I_B1Info, I_state_cart, I_cartShop_Product, I_cartTaxon, I_updateProfile, I_cartShop_taxon, 
    I_actionClass, I_changeCartProps, I_getFactorDetails_result, I_ShopProps, I_cartShop_bundle, I_bundle_taxon, I_cartVariant, I_factorDetailItem, I_cartProduct, I_AIOService_class 
} from './types';
export default class ActionClass implements I_actionClass {
    getState:()=>I_app_state;
    getProps:()=>{
        backOffice:I_state_backOffice,
        userInfo:I_userInfo,
        b1Info:I_B1Info,
        Logger:any,
        updateProfile:I_updateProfile,
        Login:I_AIOLogin,
        apis:I_AIOService_class
    };
    SetState:(obj:any)=>void
    pricing:any;
    constructor({ getState, getProps,SetState,onPricingStarted }) {
        this.getState = getState;
        this.getProps = getProps;
        this.SetState = SetState;
        let { userInfo } = this.getProps();
        this.pricing = new Pricing('https://b1api.burux.com/api/BRXIntLayer/GetCalcData', userInfo.cardCode, 12 * 60 * 60 * 1000);
        this.pricing.startservice(()=>onPricingStarted()).then((value) => { return value; });
    }
    
    getGuaranteeItems = async () => {
        let { apis, Login } = this.getProps();
        let res = await apis.request({ api: "guaranti.garantiItems", loading: false, description: 'دریافت لیست کالاهای گارانتی کاربر' });
        if (res === false) { Login.logout(); return; }
        let guaranteeExistItems = await apis.request({ api: "guaranti.kalahaye_ghabele_garanti", loading: false, description: 'کالاهای قابل گارانتی', def: [] });
        this.SetState({guaranteeExistItems,guaranteeItems: res})
    }
    getBazargahOrders = async () => {
        let {apis} = this.getProps();
        let wait_to_get = await apis.request({ 
            api: 'bazargah.daryafte_sefareshate_bazargah', 
            parameter: { type: 'wait_to_get' }, 
            loading: false, 
            //description: 'دریافت سفارشات در انتظار اخذ بازارگاه' 
        });
        let wait_to_send = await apis.request({ 
            api: 'bazargah.daryafte_sefareshate_bazargah', 
            parameter: { type: 'wait_to_send' }, 
            loading: false, 
            description: 'دریافت سفارشات در انتظار ارسال بازارگاه' 
        });
        this.SetState({bazargahOrders:{wait_to_get, wait_to_send}})
    }
    removeCartTab = (shopId:string) => {
        let { cart,setCart } = this.getState();
        let newCart:I_state_cart = {shops:{}}
        for (let prop in cart.shops) { if (prop !== shopId) { newCart.shops[prop] = cart.shops[prop] } }
        setCart(newCart)
    }

    getNavItems = () => {

        let { userInfo } = this.getProps();
        let {newBazargah,isShopReady} = this.getState();
        let icon = (path:any,spin?:boolean) => <Icon path={path} size={.9} spin={spin?0.3:undefined}/>
        let firstName = userInfo.firstName;
        let lastName = userInfo.lastName;

        //DataPushLayer
        const pushToDataLayer = (eventData) => {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push(eventData);
        };

        lastName = typeof lastName !== 'string'?'':lastName;
        return [
            { 
                text: "ویترین", 
                icon: () => icon(mdiStore), 
                // icon: () => 
                // <svg xmlns="http://www.w3.org/2000/svg" width="22" height="28" viewBox="0 0 29 28" fill="none">
                // <path d="M23.5833 14V21C23.5833 23.5773 21.494 25.6667 18.9166 25.6667H9.58329C7.00596 25.6667 4.91663 23.5773 4.91663 21V14" stroke="#757875" stroke-width="1.75" stroke-linejoin="round"/>
                // <path d="M19.8135 2.33325H8.68646C6.56622 2.33325 4.65958 3.78547 3.87214 6.00014L2.98783 8.48727C2.72014 9.24014 2.5351 10.0458 2.73035 10.8206C3.19275 12.6556 4.69294 13.9999 6.47222 13.9999C8.61999 13.9999 10.3611 12.0412 10.3611 9.62492C10.3611 12.0412 12.1022 13.9999 14.25 13.9999C16.3978 13.9999 18.1389 12.0412 18.1389 9.62492C18.1389 12.0412 19.88 13.9999 22.0278 13.9999C23.8071 13.9999 25.3072 12.6556 25.7696 10.8206C25.9649 10.0458 25.7799 9.24014 25.5122 8.48727L24.6279 6.00014C23.8404 3.78547 21.9338 2.33325 19.8135 2.33325Z" stroke="#757875" stroke-width="1.75" stroke-linejoin="round"/>
                // <path d="M10.75 22.1667C10.75 20.2338 12.317 18.6667 14.25 18.6667C16.183 18.6667 17.75 20.2338 17.75 22.1667V25.6667H10.75V22.1667Z" stroke="#757875" stroke-width="1.75" stroke-linejoin="round"/>
                // </svg>, 
                id: "vitrin",
                //render:()=><Vitrin/> 
                render: () => {
                    pushToDataLayer({
                        event: 'page_view',
                        page_title: 'ویترین',
                        page_url: '/vitrin',
                    });
                    return <Vitrin />;
                }
            },
            { 
                text: "بازارگاه", 
                icon: () => icon(mdiCellphoneMarker), 
                // icon: () => 
                // <svg xmlns="http://www.w3.org/2000/svg" width="22" height="28" viewBox="0 0 28 28" fill="none">
                // <path fill-rule="evenodd" clip-rule="evenodd" d="M23.3313 16.5016L21.8207 14.4875C21.6757 14.2942 21.4015 14.2551 21.2082 14.4C21.0149 14.545 20.9757 14.8192 21.1207 15.0125L22.2362 16.4999H17.2051L18.3206 15.0125C18.4656 14.8192 18.4264 14.545 18.2331 14.4C18.0398 14.2551 17.7656 14.2942 17.6206 14.4875L16.11 16.5016C15.0025 16.544 14.1229 17.3638 13.9277 18.3958H25.5134C25.3183 17.3639 24.4387 16.544 23.3313 16.5016ZM24.5517 23.9713C24.3302 25.0554 23.3842 25.8333 22.2874 25.8333H17.1538C16.0569 25.8333 15.111 25.0554 14.8894 23.9713L13.9357 19.3046L13.9291 19.2708H25.5121L25.5054 19.3046L24.5517 23.9713ZM17.9706 20.7149C18.22 20.7149 18.4223 20.9172 18.4223 21.1667L18.4223 23.5C18.4223 23.7495 18.22 23.9517 17.9706 23.9517C17.7211 23.9517 17.5188 23.7495 17.5188 23.5V21.1667C17.5188 20.9172 17.7211 20.7149 17.9706 20.7149ZM21.9222 21.1667C21.9222 20.9172 21.72 20.7149 21.4705 20.7149C21.221 20.7149 21.0188 20.9172 21.0188 21.1667V23.5C21.0188 23.7495 21.221 23.9517 21.4705 23.9517C21.72 23.9517 21.9222 23.7495 21.9222 23.5L21.9222 21.1667Z" fill="#757875"/>
                // <path fill-rule="evenodd" clip-rule="evenodd" d="M13.5195 24.867C13.3278 24.8765 13.1348 24.8814 12.9407 24.8814C6.62217 24.8814 1.5 19.7592 1.5 13.4407C1.5 7.12217 6.62217 2 12.9407 2C19.2592 2 24.3814 7.12217 24.3814 13.4407C24.3814 13.6348 24.3765 13.8277 24.367 14.0195C23.8681 13.645 23.3225 13.3293 22.7406 13.0828C22.7041 12.0654 22.5126 11.0874 22.189 10.1719H18.4332C18.5424 10.9344 18.6141 11.7292 18.6445 12.5462C18.0819 12.6243 17.5386 12.7629 17.0214 12.9551C17.0005 11.9811 16.9169 11.0474 16.7807 10.1719H9.10061C8.94197 11.1919 8.85472 12.291 8.85472 13.4407C8.85472 14.5903 8.94197 15.6894 9.10061 16.7094H12.8113C12.5494 17.2238 12.3433 17.7712 12.2009 18.3438H9.43158C9.64485 19.1858 9.91021 19.9485 10.2156 20.6102C10.9508 22.203 11.8053 23.0002 12.5647 23.1974C12.8139 23.7956 13.1358 24.3558 13.5195 24.867ZM15.6658 6.27119C14.8063 4.40911 13.7838 3.63438 12.9407 3.63438C12.0976 3.63438 11.075 4.40911 10.2156 6.27119C9.91021 6.93288 9.64485 7.69558 9.43158 8.53753H16.4498C16.2365 7.69558 15.9711 6.93288 15.6658 6.27119ZM7.75043 8.53753C8.00014 7.4485 8.33175 6.45274 8.73165 5.58629C8.94611 5.12162 9.18879 4.67779 9.45868 4.27056C7.33785 5.0763 5.56902 6.59666 4.44629 8.53753H7.75043ZM7.22034 13.4407C7.22034 12.3081 7.29945 11.2102 7.44815 10.1719H3.69238C3.33101 11.1943 3.13438 12.2945 3.13438 13.4407C3.13438 14.5868 3.33101 15.687 3.69238 16.7094H7.44815C7.29945 15.6712 7.22034 14.5732 7.22034 13.4407ZM8.73165 21.2951C8.33175 20.4286 8.00014 19.4329 7.75043 18.3438H4.44629C5.56902 20.2847 7.33785 21.8051 9.45868 22.6108C9.18879 22.2036 8.94611 21.7597 8.73165 21.2951ZM21.4351 8.53753C20.3123 6.59666 18.5435 5.0763 16.4227 4.27056C16.6926 4.67779 16.9352 5.12162 17.1497 5.58629C17.5496 6.45274 17.8812 7.4485 18.1309 8.53753H21.4351Z" fill="#757875"/>
                // </svg>, 
                id: "bazargah",
                render: () => {
                    pushToDataLayer({
                        event: 'page_view',
                        page_title: 'بازارگاه',
                        page_url: '/bazargah',
                    });
                    return <BazargahNew />;
                }
                //render:()=><BazargahNew/>
                 //render:()=>newBazargah?<BazargahNew/>:<Bazargah/> 
            },
            { 
                text: "خانه", 
                icon: () => getSvg('home'), 
                id: "khane",
                // render: () => {
                //     pushToDataLayer({
                //         event: 'page_view',
                //         actionName: 'open-home',
                //         actionId: 30,
                //         tagName: 'Home'
                //     });
                //     return <Home />;
                // }
                render:()=><Home/> 
            },
            { 
                text: "خرید", 
                icon: () => icon(isShopReady?mdiShopping:mdiLoading,!isShopReady),
                // icon: () => 
                // <svg xmlns="http://www.w3.org/2000/svg" width="22" height="28" viewBox="0 0 28 28" fill="none">
                // <path d="M10.5 7L10.5 8.16667C10.5 10.0997 12.067 11.6667 14 11.6667C15.933 11.6667 17.5 10.0997 17.5 8.16667V7" stroke="#757875" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                // <path d="M18.2134 3.5H9.78658C7.50533 3.5 5.55845 5.14926 5.18341 7.39947L3.23897 19.0661C2.76489 21.9106 4.95842 24.5 7.84214 24.5H20.1578C23.0416 24.5 25.2351 21.9106 24.761 19.0661L22.8166 7.39947C22.4415 5.14926 20.4946 3.5 18.2134 3.5Z" stroke="#757875" stroke-width="1.75" stroke-linejoin="round"/>
                // </svg>,
                id: "kharid",
                //render:()=><Buy/>,
                render: () => {
                    pushToDataLayer({
                        event: 'page_view',
                        page_title: 'خرید از بروکس',
                        page_url: '/burux_shop',
                    });
                    return <Buy />;
                },
                disabled:!isShopReady 
            },
            { 
                text: () => `${firstName} ${lastName}`, 
                marquee: true, 
                icon: () => icon(mdiAccountBox), 
                // icon: () => 
                // <svg xmlns="http://www.w3.org/2000/svg" width="22" height="28" viewBox="0 0 28 28" fill="none">
                // <ellipse cx="13.9999" cy="20.4166" rx="8.16667" ry="4.08333" stroke="#757875" stroke-width="1.75" stroke-linejoin="round"/>
                // <circle cx="13.9999" cy="8.16667" r="4.66667" stroke="#757875" stroke-width="1.75" stroke-linejoin="round"/>
                // </svg>,
                id: "profile",
                render: () => {
                    pushToDataLayer({
                        event: 'page_view',
                        page_title: 'پروفایل',
                        page_url: '/profile',
                    });
                    return <Profile />;
                }
                //render:()=><Profile/> 
            },
        ]
    }
    getSideItems = () => {
        let { userInfo,b1Info, backOffice, Logger } = this.getProps();
        let { logout,rsa } = this.getState();
        let { slpcode } = b1Info.customer;
        let isAdmin = backOffice.isAdmin(userInfo);
        let { activeManager } = backOffice;
        let icon = (path:any):React.ReactNode => <Icon path={path} size={0.8} />
        return [
            { text: 'بازارگاه', icon: () => icon(mdiCellphoneMarker), onClick: () => rsa.setNavId('bazargah') },
            { text: 'پیگیری سفارش خرید', icon: () => icon(mdiClipboardList), onClick: () => this.openPopup('peygiriye-sefareshe-kharid') },
            { text: 'درخواست گارانتی', icon: () => icon(mdiShieldCheck), onClick: () => this.openPopup('sabteGarantiJadid'), show: () => !!activeManager.garanti && !!slpcode },
            { text: 'لیست قیمت', icon: () => icon(mdiCash), onClick: () => this.openPopup('priceList'), show: () => !!activeManager.priceList },
            { text: 'پنل ادمین', icon: () => icon(mdiSecurity), onClick: () => this.openPopup('admin-panel'), show: () => !!isAdmin },
            { text: 'رفتار سیستم', icon: () => icon(mdiSkullScan), onClick: () => Logger.openPopup(), show: () => !!this.getState().developerMode },
            { text: 'خروج از حساب کاربری', icon: () => icon(mdiExitToApp), attrs: { className: 'colorFDB913' }, onClick: () => logout() }
        ]
    }
    getShopState = async () => {
        let { apis,backOffice, userInfo,b1Info } = this.getProps();
        let {setCart} = this.getState();
        let { Bundle, Regular, spreeCampaigns = [] } = backOffice;
        let Shop:I_state_Shop = {}
        Shop.Regular = new ShopClass({getAppState: () => this.getState(),config: {...Regular,itemType:'Product'}})
        if (Bundle.active) {
            let shopProps:I_ShopProps = { ...Bundle, shopId: 'Bundle',itemType:'Bundle' }
            Shop.Bundle = new ShopClass({getAppState: () => this.getState(),config: shopProps})
        }
        let isAdmin = backOffice.isAdmin(userInfo);
        for (let i = 0; i < spreeCampaigns.length; i++) {
            let spreeCampaign:I_ShopProps = spreeCampaigns[i];
            let { shopId, active,justActiveForAdmins,CampaignId  } = spreeCampaign;
            if (!active) { continue }
            if(!isAdmin && justActiveForAdmins){continue}
           if(CampaignId === 54 || CampaignId === 55 || CampaignId === 61 || CampaignId === 60)
           {
                let {MaxOrderValue,PayDueDate,CamPayTime,LineConditions} = this.autoGetCampaignConditionsByCardCode(CampaignId,userInfo.cardCode,b1Info.customer.groupCode)
                if(Array.isArray(PayDueDate) && PayDueDate.length){spreeCampaign.PayDueDates = PayDueDate.map((o)=>+o)}
                if(Array.isArray(CamPayTime) && CamPayTime.length){spreeCampaign.PaymentTimes = CamPayTime.map((o)=>+o)}
                if(Array.isArray(LineConditions) && LineConditions.length){spreeCampaign.LineConditions = LineConditions}
                if(MaxOrderValue && typeof MaxOrderValue === 'number'){spreeCampaign.maxTotal = MaxOrderValue}
            }
            Shop[shopId] = new ShopClass({getAppState: () => this.getState(),config: {...spreeCampaign}})
        }
        let cart:I_state_cart = await apis.request({api: 'kharid.getCart',parameter: { userInfo, Shop },description: 'دریافت اطلاعات سبد خرید'});
        setCart(cart);
        this.SetState({Shop})
    }
    openPopup = (type:string, parameter?:any) => {
        let { rsa, backOffice, Logger,msfReport,setCart } = this.getState();
        let { userInfo } = this.getProps();
        let { removeModal, setNavId } = rsa;
        if (type === 'vitrin-search') {
            msfReport({actionName:'open vitrin search',actionId:18,tagName:'vitrin',eventName:'page view'})
            let {render} = parameter;
            rsa.addModal({
                id: type,
                header: { title: 'افزودن محصول به ویترین من', attrs: { className: 'vitrin-search-popup-header' } },
                body: { render }
            })
        }
        if (type === 'vitrin-product-page') {
            let {render,product} = parameter;
            msfReport({actionName:'open vitrin product page',targetName:product.name,targetId:product.id,actionId:1548,tagName:'vitrin',eventName:'page view'})
            rsa.addModal({
                id: type,
                header: { title: 'افزودن نوع کالا به ویترین من', attrs: { className: '' } },
                body: { render }
            })
        }
        else if(type === 'vitrin-categories'){
            let {render} = parameter;
            msfReport({actionName:'open vitrin categories',actionId:19,tagName:'vitrin',eventName:'page view'})
            rsa.addModal({body: {render},id: 'categories',header: { title: 'دسته بندی محصولات' }})
        }
        else if(type === 'vitrin-price-suggestion'){
            let {render} = parameter;
            rsa.addModal({body: {render},position: 'bottom',id: type,header: { title: 'پیشنهاد قیمت دیگر' }})
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
                phone:userInfo.phoneNumber,
                //nationalcode:userInfo.nationalCode,
                address:userInfo.address,
                city:userInfo.userCity,
                state:userInfo.userProvince,
            }
            let fields = [];
            if(mode === 'profile'){
                fields = [
                    ['*firstname','*lastname'],
                    ['*storeName_text_نام فروشگاه','*phone'],
                    //['*nationalcode'],
                    ['*location'] ,
                    ['*address'],
                    ['*state','*city']
                ]
            }
            if(mode === 'location'){
                fields = ['*location','*address',['*state','*city']]
            }
            let onSubmit = async (model) => await updateProfile(model,mode,()=>removeModal(type));
            rsa.addModal({position: 'fullscreen', id: type,header,body: {attrs:{className:'profile-container'},render: () => {
                return <Register renderLogin={()=>Login.render({profile:{model,onSubmit,fields}})} mode={mode}/>
            }}})
        }
        else if (type === 'logs') {
            rsa.addModal({ position: 'fullscreen', id: type, body: { render: () => Logger.render() }, header: { title: 'رفتار سیستم' } })
        }
        else if (type === 'priceList') {
            msfReport({actionName:'open price list',actionId:21,tagName:'other',eventName:'page view'})
            rsa.addModal({ position: 'fullscreen', id: type, body: { render: () => <PriceList /> }, header: { title: 'لیست قیمت تولیدکنندگان', backButton: true } })
        }
        else if (type === 'admin-panel') {
            msfReport({actionName:'open admin panel',actionId:22,tagName:'other',eventName:'page view'})
            rsa.addModal({ position: 'fullscreen', id: type, body: { render: () => <BackOffice model={backOffice} phoneNumber={userInfo.userName} /> } })
        }
        else if (type === 'count-popup') {
            msfReport({actionName:'open product count popup',actionId:23,tagName:'kharid',eventName:'page view'})
            rsa.addModal({
                position: 'center', id: type, attrs: { style: { height: 'fit-content' } },
                body: { render: () => <CountPopup {...parameter} /> }, header: { title: 'تعداد را وارد کنید' }
            })
        }
        else if (type === 'password') {
            msfReport({actionName:'open password popup',actionId:24,tagName:'profile',eventName:'page view'})
            rsa.addModal({ id: type, position: 'fullscreen', body: { render: () => <PasswordPopup /> }, header: { title: 'مشاهده و ویرایش رمز عبور' } })
        }
        else if (type === 'peygiriye-sefareshe-kharid') {
            msfReport({actionName:'open order follow up popup',actionId:25,tagName:'kharid',eventName:'page view'})
            rsa.addModal({ id: type, position: 'fullscreen', body: { render: () => <OrdersHistory activeTab={parameter} /> }, header: { title: 'پیگیری سفارش خرید' } })
        }
        if (type === 'joziate-sefareshe-kharid') {
            rsa.addModal({ id: type, position: 'fullscreen', body: { render: () => <OrderPopup order={parameter} /> }, header: { title: 'جزییات سفارش خرید' } })
        }
        else if (type === 'sabteGarantiJadid') {
            rsa.addModal({ id: type, position: 'fullscreen', body: { render: () => <SabteGarantiJadid /> }, header: { title: 'درخواست مرجوع کالای سوخته' } })
        }
        else if (type === 'joziate-darkhast-haye-garanti') {
            rsa.addModal({ id: type, position: 'fullscreen', body: { render: () => <JoziateDarkhastHayeGaranti /> }, header: { title: 'جزییات درخواست های گارانتی' } })
        }
        else if (type === 'payame-sabte-garanti') {
            let { text, subtext } = parameter;
            rsa.addModal({ id: type, position: 'center', body: { render: () => <PayameSabteGaranti text={text} subtext={subtext} onClose={() => removeModal()} /> } })
        }
        else if (type === 'sabte-garanti-jadid-ba-joziat') {
            rsa.addModal({ id: type, position: 'fullscreen', body: { render: () => <SabteGarantiJadidBaJoziat /> }, header: { title: 'ثبت در خواست گارانتی جدید با جزییات' } })
        }
        else if (type === 'search') {
            msfReport({actionName:'open search popup',actionId:26,tagName:'kharid',eventName:'page view'})
            
            rsa.addModal({
                id: type, position: 'fullscreen', body: { render: () => <Search /> }, header: { title: 'جستجو در محصولات' },
                //header: () => <Header type='popup' popupId='search' />
            })
        }
        else if (type === 'wallet') {
            rsa.addModal({ id: type, position: 'fullscreen', body: { render: () => <Wallet onClose={() => removeModal()} /> } })
        }
        else if (type === 'tanzimate-kife-pool') {
            rsa.addModal({ id: type, position: 'fullscreen', body: { render: () => <TanzimateKifePool cards={parameter.cards} onChange={parameter.onChange} /> }, header: { title: 'تنظیمات کیف پول' } })
        }
        else if (type === 'cart') {
            msfReport({actionName:'open cart',actionId:27,tagName:'kharid',eventName:'page view'})
            rsa.addModal({ 
                id: type, position: 'fullscreen', body: { render: () => <Cart shopId={parameter} /> }, 
                header: { 
                    title: 'سبد خرید',
                    buttons:[
                        [<Icon path={mdiDelete} size={0.7}/>,{onClick:()=>{
                            rsa.addConfirm({
                                title:'حذف کلیه اقلام سبد خرید',
                                text:'آیا از حذف کلیه موارد اطمینان دارید',
                                onSubmit:async ()=>{await setCart({shops:{}}); return true}
                            })
                        },className:'align-vh theme-medium-font-color'}],
                        //[<Icon path={mdiEye} size={0.7}/>,{onClick:()=>console.log(this.getState().cart),className:'align-vh theme-medium-font-color'}]
                    ] 
                } 
            })
        }
        else if (type === 'sefareshe-ersal-shode-baraye-vizitor') {
            rsa.addModal({
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
        else if (type === 'sefaresh-pardakht-shode') {
            const urlParams = new URLSearchParams(window.location.search);
            const docNum = urlParams.get('docnum');
            debugger
            rsa.addModal({
                id: type,
                body: {
                    render: () => (
                        <Sefaresh_Pardakht_Shode docNum={docNum} status={parameter.status} onShowInHistory={() => { removeModal('all'); this.openPopup('peygiriye-sefareshe-kharid', 'در حال بررسی'); }}/>
                    )
                }
            })
        }
        else if(type === 'bazargah-order-page'){
            let {render} = parameter;
            rsa.addModal({position:'fullscreen',body: {render},id: type,header: { title: 'جزییات سفارش' }})
        }
        else if(type === 'bazargah-sent'){
            let {render} = parameter;
            rsa.addModal({position:'center',body: {render},id: type,header: { title: 'تایید نهایی تحویل سفارش' }})
        }
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
    fixPrice = ({ items, CampaignId, PriceListNum,PayDueDate }) => {
        let { userInfo,b1Info } = this.getProps();
        let {Logger} = this.getState();
        if (!b1Info.customer.groupCode) { console.error('fixPrice missing userInfo.groupCode') }
        if (!userInfo.cardCode) { console.error('fixPrice missing userInfo.cardCode') }
        let data = {
            "CardGroupCode": b1Info.customer.groupCode,
            "CardCode": userInfo.cardCode,
            "marketingdetails": {
                "PriceList": PriceListNum,
                "SlpCode": b1Info.customer.slpcode,
                "Campaign": CampaignId,
                PayDueDate
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
    getSideFooter = ()=>{
        return (
            <RVD
              layout={{
                style:{height:60,color:'#fff'},
                row:[
                  {flex:1},
                  {size:36,align:'vh',html:<Icon path={mdiCodeBraces} size={1}/>,onClick:()=>{
                    let {developerMode} = this.getState();
                    this.SetState({developerMode:!developerMode})
                  }}
                ]
              }}
            />
          )
    }
    getAppTitle = (navItem) => {
        if (navItem.id === 'khane') {
            return <>{getSvg('mybrxlogo', { className: 'rvd-hide-sm rvd-hide-md rvd-hide-lg' })}<div className='rvd-hide-xs'>{navItem.text}</div></>
        }
        else if (navItem.id === 'profile') { return 'پروفایل' }
        else { return navItem.text }
    }
    manageUrl = () => {
        //debugger
        let wrl = window.location.href;
        let jsonUrl = UrlToJson(wrl)
        if (jsonUrl.status === '2') {
            setTimeout(
                ()=>{
                    this.openPopup('sefaresh-pardakht-shode', false)
                },
                200)
        }
        else if (jsonUrl.status === '3') {
            setTimeout(
                ()=>{
                    this.openPopup('sefaresh-pardakht-shode', true)
                },
                200)  
        }
    }
    getInitialNavId = () => {
        let wrl = window.location.href;
        let jsonUrl = UrlToJson(wrl)
        return jsonUrl.tab || 'khane'
    }
    getSpreeCategories = () => {
        let {backOffice} = this.getProps();
        let { spreeCategories = [] } = backOffice;
        let categories:I_state_spreeCategories = { icon_type: [], slider_type: [], dic: {} }
        for (let i = 0; i < spreeCategories.length; i++) {
            let sc:I_spreeCategory = spreeCategories[i];
            let { showType = 'icon', id ,active} = sc;
            categories[`${showType}_type`].push(sc);
            categories.dic[id] = sc;
        }
        this.SetState({spreeCategories:categories})
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
    getFactorDetails = (marketingLines:I_marketingLine[], shippingOptions?:I_shippingOptions, container?:string) => {
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
    autoGetCampaignConditionsByCardCode = (CampaignId, CardCode, CardGroupCode)=>{
        let res = this.pricing.autoGetCampaignConditionsByCardCode(CampaignId, CardCode, CardGroupCode);
        return res;
    }
    openLink = (linkTo:string) => {
        let { Shop, rsa,backOffice } = this.getState();
        if (linkTo === 'Bundle') { Shop.Bundle.openCategory() }
        else if (linkTo.indexOf('category') === 0) {
            let id = linkTo.split('_')[1];
            let category = backOffice.spreeCategories.find((o)=>o.id === id);
            let {name} = category;
            Shop.Regular.openCategory({categoryId:id,categoryName:name});
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
    getHeaderIcons = async (obj) => {
        let { cart } = obj;
        let res = [];
        if (cart) {
            let length = await this.getCartLength();
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
    getCartLength = async () => {
        let { Shop,cart } = this.getState();
        let cartLength = 0;
        let cartShopIds:string[] = Object.keys(cart.shops);
        for (let i = 0; i < cartShopIds.length; i++) {
            let cartShopId = cartShopIds[i];
            let {cartVariants} = await Shop[cartShopId].getCartVariants()
            cartLength += cartVariants.length;
        }
        return cartLength
    }
    removeCart = (cart,ids,fields)=>{
        let obj = cart;
        for(let i = 0; i < ids.length - 1; i++){
            obj = obj[fields[i]];
            if(!obj){return}
            obj = obj[ids[i]]
        }
        let field = fields[ids.length - 1];
        let id = ids[ids.length - 1];
        let newItems = {}
        let length = 0;
        for(let prop in obj[field]){
            if(id.toString() !== prop.toString()){
                length++;
                newItems[prop] = obj[field][prop]
            }
        }
        if(length){obj[field] = newItems}
        else if(ids.length < 2){obj[field] = {};}
        else {this.removeCart(cart,ids.slice(0,ids.length - 1),fields)}
    }
    editCartTaxonByPricing = async(cartTaxon:I_cartTaxon,shopId:string,removable:boolean)=>{
        let { Shop,rsa,cart,setCart } = this.getState();
        let factorDetailsItems:I_factorDetailItem[] = []
        let variantsParents:{[variantId:string]:{productId:string,taxonId:string}} = {}
        for(let productId in cartTaxon.products){
            let { variants }:I_cartProduct = cartTaxon.products[productId];
            for(let variantId in variants){
                let variant:I_cartVariant = variants[variantId];
                let { count } = variant;
                variant.error = undefined;
                variantsParents[variantId] = {productId,taxonId:cartTaxon.taxonId};
                factorDetailsItems.push({ ItemCode: variantId, ItemQty: count });
            }
        }
        let CampaignId = Shop[shopId].CampaignId;
        let factorDetails:I_getFactorDetails_result = this.getFactorDetails(factorDetailsItems, {CampaignId}, 'editCartItem');
        let { MarketingLines } = factorDetails;
        let hasError = false;
        for(let i = 0; i < MarketingLines.length; i++){
            if(!MarketingLines[i].CampaignDetails){continue}
            let {CampaignDetails = {},ItemCode,ItemQty} = MarketingLines[i];
            let {productId,taxonId} = variantsParents[ItemCode]; 
            let products = await Shop[shopId].getShopItems({taxonId,productId})
            let product = products[0];
            let cartVariant:I_cartVariant = cartTaxon.products[productId].variants[ItemCode];
            let {Information,BundleRowsInfos} = CampaignDetails;
            if(!BundleRowsInfos){continue}
            let {isUnderValue,isOverValue} = BundleRowsInfos;
            if(isUnderValue){
                if(ItemQty === 0){
                    if(removable){
                        let newCart:I_state_cart = JSON.parse(JSON.stringify(cart));
                        this.removeCart(newCart,[shopId,cartTaxon.taxonId,productId,ItemCode],['shops','taxons','products','variants'])
                        setCart(newCart)
                    }
                    else {
                        rsa.addSnakebar({text:Information,time:4,type:'warning'});
                        hasError = true; cartVariant.error = Information;
                    }
                }
                else {cartVariant.count = ItemQty;}
            }
            else if(isOverValue){
                rsa.addSnakebar({text:`در شرایط فعلی این فاکتور حداکثر تعداد قابل انتخاب از محصول ${product.name} ${ItemQty} عدد می باشد`,time:6,type:'warning'});
                if(ItemQty === 0){
                    let newCart:I_state_cart = JSON.parse(JSON.stringify(cart));
                    this.removeCart(newCart,[shopId,cartTaxon.taxonId,productId,ItemCode],['shops','taxons','products','variants'])
                    setCart(newCart)
                }
                else {
                    cartVariant.count = ItemQty;
                }
            }
        }
        cartTaxon.hasError = hasError;
    }
    fixCartByPricing = async (shopId:string)=>{
        if(!this.getCartShop(shopId)){return}
        let cartShop = this.getCartShop(shopId) as I_cartShop_taxon;
        for(let taxonId in cartShop.taxons){
            let cartTaxon:I_cartTaxon = cartShop.taxons[taxonId];
            await this.editCartTaxonByPricing(cartTaxon,shopId,true)
        }
    }
    removeCartItem = async (p:I_changeCartProps)=>{
        let {shopId,taxonId,productId,variantId} = p;
        let { cart } = this.getState();
        let newCart:I_state_cart = JSON.parse(JSON.stringify(cart));
        if(taxonId){
            this.removeCart(newCart,[shopId,taxonId,productId,variantId],['shops','taxons','products','variants'])
            let cartShop = newCart.shops[shopId] as I_cartShop_taxon;
            if(cartShop && cartShop.taxons[taxonId]){
                await this.editCartTaxonByPricing(cartShop.taxons[taxonId],shopId,false)     
            }
        }
        else {
            this.removeCart(newCart,[shopId,productId,variantId],['shops','products','variants'])
        }
        return newCart as I_state_cart
    }
    reportRemoveCart = async ({shopId,taxonId,productId,variantId})=>{
        let { msfReport,Shop } = this.getState();
        let products =  await Shop[shopId].getShopItems({taxonId,productId})
        let product = products[0];
        msfReport({actionName:'remove from cart',actionId:23,targetName:`${product.name}(${variantId})`,targetId:variantId,tagName:'kharid',eventName:'action'})
    }
    reportAddToCart = async ({shopId,taxonId,productId,variantId})=>{
        let { msfReport,Shop } = this.getState();
        let products =  await Shop[shopId].getShopItems({taxonId,productId})
        let product = products[0];
        msfReport({actionName:'add to cart',actionId:24,targetName:`${product.name}(${variantId})`,targetId:variantId,tagName:'kharid',eventName:'action'})
    }
    editCartItem = async (p:I_changeCartProps)=>{
        let {shopId,taxonId, productId, variantId,count,productCategory} = p; 
        let { cart } = this.getState();
        let cartShop = this.getCartShop(shopId);
        let reportAdd = false;
        if(taxonId){
            let newCartShop = cartShop as I_cartShop_taxon;
            if(newCartShop){newCartShop = JSON.parse(JSON.stringify(newCartShop))}
            if(!newCartShop){newCartShop = {type:'Taxon',taxons:{}}}
            if(!newCartShop.taxons[taxonId]){
                newCartShop.taxons[taxonId] = {taxonId,products:{},hasError:false}
            }
            if(!newCartShop.taxons[taxonId].products[productId]){
                newCartShop.taxons[taxonId].products[productId] = {variants:{},productId,productCategory}
            }
            if(!newCartShop.taxons[taxonId].products[productId].variants[variantId]){
                reportAdd = true;
                newCartShop.taxons[taxonId].products[productId].variants[variantId] = {count:0,productCategory,productId,variantId}
            }
            newCartShop.taxons[taxonId].products[productId].variants[variantId].count = count
            let cartTaxon:I_cartTaxon = newCartShop.taxons[taxonId];
            await this.editCartTaxonByPricing(cartTaxon,shopId,false);
            newCartShop.taxons[taxonId] = cartTaxon;
            cartShop = newCartShop;
        }
        else {
            let newCartShop = cartShop as I_cartShop_Product;
            if(!newCartShop){newCartShop = {products:{},type:'Product'}}
            if(!newCartShop.products[productId]){
                newCartShop.products[productId] = {variants:{},productId,productCategory}
            }
            if(!newCartShop.products[productId].variants[variantId]){
                reportAdd = true
                newCartShop.products[productId].variants[variantId] = {count:0,productCategory,variantId,productId}
            }
            newCartShop.products[productId].variants[variantId].count = count;
            //await this.setCartLimit(newCartShop);
            cartShop = newCartShop;
        }
        if(reportAdd){this.reportAddToCart({shopId,taxonId,productId,variantId})}
        return {...cart,shops:{...cart.shops,[shopId]:cartShop}}
    }
    removeCartBundleTaxon = (taxon:I_bundle_taxon) => {
        let {cart,setCart} = this.getState();
        let newCart: I_state_cart = JSON.parse(JSON.stringify(cart));
        let cartTab: I_cartShop_bundle = this.getCartShop('Bundle') as I_cartShop_bundle;
        let newTaxons = {},length = 0;
        for(let taxonId in cartTab.taxons){
            if(taxonId !== taxon.id){
                length++;
                newTaxons[taxonId] = cartTab.taxons[taxonId]
            }
        }
        if(!length){
            let fixedCart = {shops:{}};
            for(let cartId in cart.shops){if(cartId !== 'Bundle'){fixedCart.shops[cartId] = cart.shops[cartId]}}
            newCart = fixedCart;
        }
        else{
            cartTab.taxons = newTaxons;
            newCart.shops.Bundle = cartTab;
        }
        setCart(newCart)
    }
    changeCart = async (p:I_changeCartProps) => {
        let { shopId,taxonId, productId, variantId,count,productCategory } = p;
        let { apis,setCart } = this.getState();
        let props:I_changeCartProps = { shopId,taxonId, productId, variantId,count,productCategory }
        let newCart:I_state_cart = !count?await this.removeCartItem(props):await this.editCartItem(props);
        apis.request({ api: 'kharid.setCart', parameter: newCart, loading: false, description: 'ثبت سبد خرید' })
        setCart(newCart);
    }
    getCartShop = (shopId)=>{
        let { cart } = this.getState();
        return cart.shops[shopId]
    }
    setCartShop = (shopId,value)=>{
        let { cart,setCart } = this.getState();
        let newCart:I_state_cart = {...cart,shops:{...cart.shops,[shopId]:value}}
        setCart(newCart) 
    }
}
