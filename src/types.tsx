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
    profile?:{model:any,onSubmit:(model:any)=>void,fields:any[]},
    appState?:any
}

/////aio-login
/////aio-service
export type I_AIOService_request = (obj:{
    api:string,parameter?:any,loading?:boolean,onCatch?:I_AIOService_onCatch,
    message?:{error?:boolean | string,success?:boolean | string},
    description?:string,getError?:I_AIOService_getError,def?:any,
    cache?:{time:number,name:string},
    onSuccess?:(any)=>void,
    onError?:(message:string)=>void
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
    itemPrices:I_itemPrice[],//notice
    salePeople:{mobile:string},
    customer:{ballance:number,groupName:string,slpcode:string,slpname:string,groupCode:string}
}
export type I_itemPrice = {itemCode: any,mainSku?: any,canSell: boolean,qtyRelation:number}
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
    colors:any,
    accessPhoneNumbers:I_backOffice_accessPhoneNumber[]
    landing:I_backOffice_content[],
    homeContent:I_backOffice_content[],
    active_landing:boolean,
    active_homeContent:boolean,
    isAdmin?:(userInfo:I_userInfo)=>boolean,isSuperAdmin?:(userInfo:I_userInfo)=>boolean
    Regular:I_ShopProps,
    Bundle:I_ShopProps,
    spreeCampaigns:I_ShopProps[],
    spreeCategories:I_spreeCategory[],
    activeManager:{bazargah:boolean,garanti:boolean,priceList:boolean,vitrin:boolean,wallet:boolean}
    PayDueDate_options:I_PaydueDate_option[],
    PaymentTime_options:I_PaymentTime_option[],
    DeliveryType_options:I_DeliveryType_option[],
    bazargah: {
        forsate_ersale_sefareshe_bazargah: number,
        forsate_akhze_sefareshe_bazargah: number
    },
    versions: I_backOffice_versions,
    vitrinCategories,
}
export type I_backOffice_versions = {
    login?: number,
    taxonProducts?: number,
    categoryProducts?:number,
    cart?: number,
    all?: number
}
export type I_backOffice_vitrinCategory = {
    name:string,imageUrl?:any,id:any,open:boolean,
    childs?:I_backOffice_vitrinCategory[]
}
export type I_backOffice_content = {type:'billboard' | 'image' | 'description' | 'label',url?:string,text?:string,id:string,active:boolean,linkTo?:string}
export type I_PaydueDate_option = {
    cashPercent:number,days:number,discountPercent:number,id?:string,text:string,value:any,_id:string}
export type I_PaymentTime_option = {text:string,value:any,id?:string}
export type I_DeliveryType_option = {text:string,value:any,id?:string}
export type I_backOffice_accessPhoneNumber = {phoneNumber:string,access:{[field:string]:boolean},name:string};
//////backOffice
export type I_shippingOptions = {
    PaymentTime?:number, PayDueDate?:number, DeliveryType?:number,SettleType?:number, giftCodeInfo?:any, discountCodeInfo?:any,CampaignId?:number,address?:string
}
export type I_marketingLine = {ItemCode:string,ItemQty:number}
export type I_spreeCategory = { showType:'icon' | 'slider', id:string,active:boolean,billboard?:string,icon?:string,name:string }

export type I_ShopProps = {
    active:boolean,
    shopName:string,
    PayDueDate:number,PaymentTime:number,DeliveryType:number,
    PayDueDates:number[],PaymentTimes:number[],DeliveryTypes:number[],
    CampaignId:number,
    shopId:string,
    getAppState?:()=>any,
    billboard?:string,
    icon?:string,
    maxCart?:number,
    PriceListNum?:number,
    taxons?:I_taxon[],
    description?:string,
    itemType:'Product' | 'Taxon' | 'Bundle'
} 
export type I_taxon = {id:string,name:string,min:number,max:number,products?:I_product[]}
export type I_ShopClass = {
    shopName: string,
    active:boolean,
    shopId: string,
    taxons?: I_taxon[],
    maxCart?:number,
    CampaignId?:number,
    PriceListNum?: number,
    billboard?:string,
    products?: I_product;
    description?: string;
    icon?:string,
    getCategoryItems:(p?: { categoryId?: string, categoryName?: string,count?:number })=>Promise<any[]>,
    renderCard_Regular: (
        p: {product: I_product, renderIn: I_renderIn, index: number,loading?: boolean, type?: 'horizontal' | 'vertical'}
    ) => React.ReactNode,
    renderCard_Bundle:(p:{ taxon:I_bundle_taxon, renderIn:I_renderIn, index?:number })=>React.ReactNode,
    renderCard_taxon: (
        p: {
            taxon: I_taxon, renderIn: I_renderIn, index?: number, onFetchProducts?: any, errors?: any[], hasErrors?: any[]
        }
    ) => React.ReactNode,
    getProductById:(productId:string,productCategory:I_product_category)=>Promise<I_product>,
    renderCartItems:(renderIn:I_renderIn)=>Promise<any[]>
    openCategory:(p?:{categoryId: string, categoryName: string})=>void,
    getCartVariants:(p?:{productId?:string,taxonId?:string})=>I_cartVariant[],
    payment:(p:I_shippingOptions)=>Promise<boolean>, 
    renderCartFactor:(button?:boolean)=>Promise<React.ReactNode>,
    getAmounts:I_getAmounts,getAmounts_all:I_getAmounts,getAmounts_Bundle:I_getAmounts,
    getMarketingLines_Bundle:()=>{ItemCode:any,ItemQty:number,Price:number,BasePackCode:any,BasePackQty:number}[]
    getFactorItems:(shippingOptions:I_shippingOptions,container:string)=>Promise<I_factorItem[]>
    getPaymentButtonText:(shippingOptions: I_shippingOptions) => string,
    getBundleCartDetails:()=>{cartVariants:I_cartTab_bundle_variant[],total:number}
}
export type I_factorItem = {key:string,value:string,className?:string}
export type I_getAmounts = (shippingOptions:I_shippingOptions, container?:string)=>Promise<I_amounts>;
export type I_amounts = { total:number, discounts:I_discount[], payment:number, ClubPoints?: any };
export type I_renderIn = 'product'|'shipping'|'cart'|'category' | 'slider';
export type I_actionClass = {
    getNavItems:()=>{
        text:string | (()=>string),icon:()=>React.ReactNode,render:()=>React.ReactNode,id:string
    }[],
    getSideItems:()=>{
        text:string,icon:()=>React.ReactNode,onClick:()=>void
    }[],
    getSideFooter:()=>React.ReactNode,
    getShopState:()=>Promise<{Shop:I_state_Shop,cart:I_state_cart}>,
    fixPrice:(
        p:{ 
            items:{itemCode:string,ItemCode:string,itemQty:number,ItemQty:number}[], 
            CampaignId?:number,PriceListNum?:number 
        }
    )=>I_fixPrice_result[],
    getHeaderIcons:(p:{[key:string]:boolean})=>any[],
    getFactorDetails:(items:any[],shippingOptions:I_shippingOptions,container?:string)=>I_getFactorDetails_result,
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
    setCart:(newCart:I_state_cart)=>void,
    getGuaranteeItems:()=>void,
    getBazargahOrders:()=>void,
    removeCartTab:(shopId:string)=>void
}
export type I_getFactorDetails_result = {
    MarketingLines:{CampaignDetails:any,ItemCode:string}[],
    DocumentTotal:number,
    marketingdetails:{ DiscountList:any, ClubPoints:any }
}
export type I_fixPrice_result = {
    ItemCode: string,SalesMeasureUnit: string,NumInSale: number,Price: number,B1Dscnt: number,FinalPrice: number,PymntDscnt: number,CmpgnDscnt: number
    OnHand?: {whsCode?: string,qty?: number,qtyLevel?: number,qtyLevRel?: number} | null,   
}
export type I_changeCartProps = {taxonId?:string,variantId:string,product:I_product,count:number}
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
    actionClass:I_actionClass,
    baseUrl:string,
    spreeCategories:I_state_spreeCategories
}
export type I_state_spreeCategories = { icon_type: I_spreeCategory[], slider_type: I_spreeCategory[], dic: {} }
export type I_state_Shop = {[shopId:string]:I_ShopClass}
/////cart
export type I_state_cart = {[shopId:string]:(I_cartTab | I_cartTab_taxon | I_cartTab_bundle)}
export type I_cartTab = {products:{[productId:string]:I_cartProduct},type:'regular'}
export type I_cartProduct = {productId:string,productCategory:I_product_category,variants:{[variantId:string]:I_cartVariant}}
export type I_cartVariant = {
    productCategory:I_product_category,count:number,
    variantId:string,
    productId:string,
    taxonId?:string,
    error?:string,
    minValue?:number,
    maxValue?:number
};
export type I_cartTab_bundle = {
    taxons:{[taxonId:string]:I_cartTab_bundle_taxon},type:'Bundle'
}
export type I_cartTab_bundle_taxon = {
    count:number,products:{[productId:string]:I_cartTab_bundle_product},taxon:I_bundle_taxon
}
export type I_cartTab_bundle_product = {
    variants:{[variantId:string]:I_cartTab_bundle_variant},qty:number,price:number
}
export type I_cartTab_bundle_variant = {
    count:number,step:number,variantId:any
}
export type I_cartTab_taxon = {taxons:{[taxonId:string]:I_cartTaxon},type:'taxon'}
export type I_cartTaxon = {
    taxonId:string,products:{[productId:string]:I_cartProduct}
}
/////cart
export type I_bundle_taxon = {
    shopId:'Bundle',id:string,name:string,price:number,products:I_bundle_product[],image:any,description:string,max:number
}
export type I_bundle_product = { //mainSku => id, unitPrice => price
    id:string,name:string,price:number,qty:number,variants:I_bundle_variant[]
}
export type I_bundle_variant = {//Code => id Name=> name Step => step
    id:string,name:string,step:number
}
export type I_marketingLine_bundle = { ItemCode: any, ItemQty: number, Price: number, BasePackCode: any, BasePackQty: number }
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
    //مواردی که ابتدا دریافت می شود
    id:string,
    name:string,
    images:any[],
    inStock:boolean,
    B1Dscnt:number,
    CmpgnDscnt:number,
    PymntDscnt:number,
    FinalPrice:number, 
    Price:number,
    hasFullDetail:boolean,
    category:{shopId:string,shopName:string,categoryId?:string,categoryName?:string,taxonId?:string,taxonName?:string}, //اطلاعات دسته بندی محصول
    //مواردی که با کلیک روی محصول دریافت می شود
    description?: any;
    clubpoint?: any;
    optionTypes?:I_product_optionType[],
    details?:I_product_detail[],
    variants?:I_variant[]
};
export type I_product_detail = [key:string,value:string];
export type I_product_optionType = {
    id:string,
    name:string,
    items:{[optionValueId:string]:string}
}
export type I_product_category = {shopId:string,shopName:string,categoryId?:string,categoryName?:string,taxonId?:string,taxonName?:string}

export type I_variant = {
    id:string,
    inStock:boolean,
    B1Dscnt:number,
    CmpgnDscnt:number,
    PymntDscnt:number,
    FinalPrice:number, 
    Price:number,
    optionValues:I_variant_optionValues,
    images:any[]
};
export type I_variant_optionValues = {[optiontypeId:string]:string}
export type I_discount = { percent?:number, value:number, title:string }


export type I_bottomMenu = 'vitrin' | 'bazargah' | 'khane' | 'kharid' | 'profile'