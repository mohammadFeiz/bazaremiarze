import actionClass from './actionClass';
/////aio-login
export type I_AIOLogin_mode = (
    'OTPNumber' | 'phoneNumber' | 'OTPCode' | 'auth' |
    'register'
)
export type I_AIOLogin_model = {
  login:{userId:string,password:string},
  register:{[field:string]:any},
  profile?:any
}
export type I_AIOLogin_onSubmit = (model:I_AIOLogin_model,mode:I_AIOLogin_mode)=>Promise<void>
export type I_AIOLogin_checkToken = (token:string | false)=>Promise<boolean | undefined>
export type I_AIOLogin_renderApp = (obj:{token:string})=>React.ReactNode
export type I_AIOLogin_renderLogin = (loginForm:React.ReactNode)=>React.ReactNode
export type I_AIOLogin_renderSplash = ()=>React.ReactNode
export type I_AIOLogin_register = {type:'mode' | 'tab' | 'button',text:string,fields:any[]}
export type I_AIOLogin_props = {
  id: string, modes: I_AIOLogin_mode[], timer: number, otpLength: number, 
  userId?:string,
  onSubmit: I_AIOLogin_onSubmit, 
  checkToken: I_AIOLogin_checkToken,
  splashTime?:number,
  register?:I_AIOLogin_register,
  renderApp:I_AIOLogin_renderApp,
  renderLogin?:I_AIOLogin_renderLogin,
  renderSplash?:I_AIOLogin_renderSplash
}
export type I_AIOLogin_class = {
    setStorage:(key:string,value:any)=>void,
    getStorage:(key:string)=>any,
    setMode:(mode:I_AIOLogin_mode)=>void,
    render:(p?:I_AIOLogin_class_render_parameter)=>React.ReactNode,
    logout:()=>void
}
export type I_AIOLogin_class_render_parameter = {
    profile?:{model:any,onSubmit:(model:any)=>void,fields:any[]}
}

/////aio-login
/////aio-service
export type I_AIOService_request = (obj:{
    api:string,parameter?:any,loading?:boolean,onCatch?:I_AIOService_onCatch,
    message?:{error?:boolean | string,success?:boolean | string},
    description?:string,getError?:I_AIOService_getError,def?:any,
    cache?:{time:number,name:string}
})=>any
export type I_AIOService_class = {
    request:I_AIOService_request,
    setToken:(token:string)=>void,
    getCache:(key:string)=>any
}
export type I_AIOService_onCatch = (error:any)=>string | undefined
export type I_AIOService_getError = (response:any)=>string | undefined
export type I_apiFunctionReturn = {result:any,response?:any}
/////aio-service
export type I_userInfo = {
    landlineNumber:string,
    landline:string,
    latitude:number,
    longitude:number,
    firstName:string,
    lastName:string,
    userName:string,
    password:string,
    storeName:string,
    address:string,
    userProvince:string,
    userCity:string,
    id:string,
    phoneNumber:string,
    cardCode:string,
    osVendorId:string,
    accessToken:{access_token:string}

}
export type I_B1Info = {
    itemPrices:any[],//notice
    salePeople:{
        mobile:string
    },
    customer:{
        ballance:number,
        groupName:string,
        slpcode:string,
        slpname:string,
        groupCode:string
    }
}

export type I_register = {
    landlineNumber: string,
    landline: string,
    latitude: number,
    longitude: number,
    firstName: string,
    lastName: string,
    password: string,
    storeName: string,
    address: string,
    userProvince: string,
    userCity: string
}
//////backOffice
export type I_state_backOffice = {
    accessPhoneNumbers:I_state_backOffice_accessPhoneNumber[]
    landing:{type:'billboard' | 'image' | 'description' | 'label',url?:string,text?:string}[],
    active_landing:boolean,
    isAdmin:(userInfo:I_userInfo)=>boolean,isSuperAdmin:(userInfo:I_userInfo)=>boolean
    Regular:I_ShopProps,
    Bundle:I_ShopProps,
    spreeCampaigns:I_ShopProps[],
    spreeCategories:I_spreeCategory[],
    activeManager:{bazargah:boolean,garanti:boolean,priceList:boolean,vitrin:boolean,wallet:boolean}
    PayDueDate_options:I_PaydueDate_option[]
}
export type I_PaydueDate_option = {
    cashPercent:number,days:number,discountPercent:number,id:string,text:string,value:number,_id:string}
export type I_state_backOffice_accessPhoneNumber = {phoneNumber:string,access:{[field:string]:boolean}};
//////backOffice
export type I_shippingOptions = {
    PaymentTime?:number, PayDueDate?:number, DeliveryType?:number, giftCodeInfo?:any, discountCodeInfo?:any,CampaignId?:number
}
export type I_marketingLine = {ItemCode:string,ItemQty:number}
export type I_spreeCategory = { showType:'icon' | 'slider', id:string,active:boolean,billboard?:string,icon?:string,name:string }

export type I_ShopProps = {
    CampaignId:number,
    DeliveryType:number,
    DeliveryTypes:number[],
    PayDueDate:number,
    PayDueDates:number[],
    PaymentTime:number,
    PaymentTimes:number[],
    SettleType:number,
    SettleTypes:number[],
    active:boolean,
    id:string,
    name:string,
    getAppState?:()=>any,
    billboard?:string,
    icon?:string,
    maxCart?:number,
    PriceListNum?:number,
    taxons?:I_ShopClass_taxon[],
} 
export type I_ShopClass_taxon = {id:string,name:string,min:number,max:number,products?:I_product[]}
export type I_ShopClass = {
    getAppState: () => I_app_state,
    taxons?: I_ShopClass_taxon[],
    cartId: string,
    id: string,
    maxCart?:number,
    renderCard: (
        p: {
            product: I_product, renderIn: I_shopRenderIn, variantId?: string, count?: number,
            details?: any, loading?: boolean, index?: number, style?: any, type?: any
        }
    ) => React.ReactNode,
    renderPage:(product:I_product)=>React.ReactNode,
    renderTaxonCard: (
        p: {
            taxon: I_ShopClass_taxon, renderIn: I_shopRenderIn, index?: number, onFetchProducts?: any, errors?: any[], hasErrors?: any[]
        }
    ) => React.ReactNode,
    getCartVariants:()=>I_cartVariant[],
    name: string,
    billboard?:string,
    icon?:string,
    CampaignId?:number,
    openCategory:(id?:string)=>void,
    payment:(p:{ address, SettleType, PaymentTime, DeliveryType, PayDueDate, cartId, giftCodeInfo, discountCodeInfo })=>boolean,
    getCartProducts:(renderIn:I_shopRenderIn,shippingOptions?:I_shippingOptions)=>React.ReactNode[],
    renderCartFactor:()=>React.ReactNode,
    PriceListNum?: number,
    getAmounts_all(
        p:{cartItems, shippingOptions, container}
    )=>{ total, discounts, payment: DocumentTotal, ClubPoints?:any, hasError },
    getAmounts_Bundle:(
        p:{cartItems:I_cartProduct[],shippingOptions?:I_shippingOptions,container?:string}
    )=>{ total:number, discounts:I_discount[], payment:number, ClubPoints?: any },
}
export type I_shopRenderIn = 'product'|'shipping'|'cart'|'category';
export type I_actionClass = {
    getNavItems:()=>{
        text:string | (()=>string),icon:()=>React.ReactNode,render:()=>React.ReactNode,id:string
    }[],
    getSideItems:()=>{
        text:string,icon:()=>React.ReactNode,onClick:()=>void
    }[],
    getSideFooter:()=>React.ReactNode,
    getShopState:()=>{Shop:I_state_Shop,cart:I_state_cart},
    fixPrice:(
        p:{ 
            items:{itemCode:string,ItemCode:string,itemQty:number,ItemQty:number}[], 
            CampaignId?:number,PriceListNum?:number 
        }
    )=>any[],//notice
    getHeaderIcons:(p:{[key:string]:boolean})=>any[],
    getFactorDetails:(items:any[],shippingOptions:I_shippingOptions,container?:string)=>{
        MarketingLines:{CampaignDetails:any,ItemCode:string}[],
        DocumentTotal:number,
        marketingdetails:{ DiscountList:any, ClubPoints:any }
    },
    openPopup:(key:string,parameter?:any)=>void,
    getCodeDetails:(p:{giftCodeInfo:any,discountCodeInfo:any})=>any,
    getState:()=>I_app_state,
    setState:(p:any)=>void,
    getProps:()=>{
        backOffice:I_state_backOffice,
        userInfo:I_userInfo,
        b1Info:I_B1Info,
        Logger:any,
        updateProfile:I_updateProfile,
        Login:I_AIOLogin_class
    },
    pricing:any,
    getAppTitle:(nav:any)=>React.ReactNode,
    manageUrl:()=>void,
    getInitialNavId:()=>I_bottomMenu,
    getSpreeCategories:(backOffice:I_state_backOffice) =>I_state_spreeCategories
    getSettleType:(PayDueDate:number) => number|undefined,
    openLink:(linkTo:string) => void,
    isLocationMissed:()=>boolean,
    handleMissedLocation:()=>void,
    getCartLength:()=>number,
    removeItem:(obj:any,id:string,field:string)=>any,
    removeCartItem:(p:I_changeCartProps)=>I_state_cart,
    editCartItem:(p:I_changeCartProps)=>I_state_cart,
    changeCart:(p:I_changeCartProps)=>void,
    getGuaranteeItems:()=>void,
    getBazargahOrders:()=>void,
    removeCartTab:(cartId:string)=>void
}
export type I_changeCartProps = {cartId:string,taxonId?:string,variantId:string,product:I_product,count:number}
export type I_app_state = {
    backOffice:I_state_backOffice,
    apis:I_AIOService_class,
    Login:I_AIOLogin_class,
    userInfo:I_userInfo,
    b1Info:I_B1Info,
    Logger:any,
    Shop:I_state_Shop,
    rsa:any,
    logout:()=>void,
    developerMode:boolean,
    cart:I_state_cart,
    msfReport:I_msfReport,
    bazargahOrders:{wait_to_get?:[],wait_to_send?:[]},
    actionClass:I_actionClass
}
export type I_state_spreeCategories = { icon_type: I_spreeCategory[], slider_type: I_spreeCategory[], dic: {} }
export type I_state_Shop = {[shopId:string]:I_ShopClass}
/////cart
export type I_state_cart = {[cartId:string]:(I_cartTab | I_cartTab_isTaxon)}
export type I_cartTab = {products:{[productId:string]:I_cartProduct},isTaxon?:false}
export type I_cartProduct = {variants:{[variantId:string]:I_cartVariant},product:I_product}
export type I_cartVariant = {
    cartId:string,count:number | I_bundleCount,
    variant:I_variant,variantId:string,
    product:I_product,productId:string,
    taxon?:I_ShopClass_taxon,taxonId?:string,
    error?:string
};
export type I_bundleCount = {packQty:number,qtyInPacks:any}
export type I_cartTab_isTaxon = {taxons:{[taxonId:string]:I_cartTaxon},isTaxon:true}
export type I_cartTaxon = {
    taxonId:string,products:{[productId:string]:I_cartProduct},taxon:I_ShopClass_taxon,
    errors?:{product:any,taxonId:string,minValue:number,maxValue:number,error:string}[]
}
/////cart
export type I_report = {
    actionName: string, actionId: number, targetName?: string, targetId?: any,
    tagName: 'kharid' | 'vitrin' | 'profile' | 'other' | 'user authentication', eventName: 'action' | 'page view',
    result?: 'success' | 'unsuccess', message?: string
}
export interface I_Report_parameter extends I_report {
    apis: I_AIOService_class; phoneNumber: string; userId: string;
}  
export type I_msfReport = (obj: I_report, p?: { userId?: string, phoneNumber?: string }) => void
export type I_updateProfile = (loginModel: I_AIOLogin_model, mode: 'register' | 'profile' | 'location', callback?: Function)=>void


export type I_product = {
    description: any;
    clubpoint: any;
    name:string,
    cartId:string,
    ItemCode:string,
    id:string,
    B1Dscnt:number,
    CmpgnDscnt:number,
    PymntDscnt:number,
    FinalPrice:number, 
    Price:number,
    price:number,
    optionTypes:I_product_optionType[],
    defaultVariant:I_variant,
    hasFullDetail?:boolean,
    inStock:boolean,
    srcs:string[],
    details:[key:string,value:string][],
    variants:I_variant[]
};
export type I_product_optionType = {
    id:string,
    name:string,
    items:{[optionValueId:string]:string}[]
}
export type I_variant = {
    id:string,
    code:string,
    inStock:boolean,
    isDefault:boolean
    B1Dscnt:number,
    CmpgnDscnt:number,
    PymntDscnt:number,
    FinalPrice:number, 
    Price:number,
    optionValues:{[optiontypeId:string]:string},
    srcs:string[]
};
export type I_discount = { percent?:number, value:number, title:string }


export type I_bottomMenu = 'vitrin' | 'bazargah' | 'khane' | 'kharid' | 'profile'