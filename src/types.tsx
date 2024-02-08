import actionClass from './actionClass';
import { I_AIOLogin,I_AL_model } from './npm/aio-login/index.tsx';
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
    getCache:(key:string)=>any,
    setCache:(key:string,value:any)=>void,
    setProperty:(key:string,value:any)=>void,
}
export type I_AIOService_onCatch = (error:any)=>string | undefined
export type I_AIOService_getError = (response:any)=>string | undefined
export type I_apiFunctionReturn = {result:any,response?:any}
/////aio-service
export type I_userInfo = {
    landlineNumber:string,
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
    customer:{ballance:number,groupName:string,slpcode:string,slpname:string,groupCode:string,purchaseState:{onlyByCash:boolean,onlyByOrder:boolean,inBlackList:boolean}}
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
//////rsa
export type I_rsa_addModal = {
    position?:'fullscreen' | 'center' | 'popover' | 'left' | 'right' | 'top' | 'bottom',
    id?:string,
    attrs?:any,
    backdrop?:{attrs?:any},
    header?:false | {
        title:string,subtitle?:string,attrs?:any,backButton?:boolean,
        buttons?:[text:React.ReactNode,attrs?:any][]
    },
    body:{render:(p:{state:any,setState:(p:any)=>void})=>React.ReactNode,attrs?:any}
}
export type I_rsa_addSnakebar = {
    type:'info' | 'warning' | 'error' | 'success',
    text:string,
    subtext?:string,
    time?:number,
    rtl?:boolean,
    action?:{text:string,onClick:()=>void},
    onClose?:false | (()=>void)
}
export type I_rsa_addConfirm = {
    title:string,
    text:string,
    onSubmit:()=>Promise<boolean>,
    subtitle?:string,
    submitText?:string,
    canselText?:string,
    onCansel?:()=>void,
    attrs?:any
}
export type I_rsa = {
    setNavId:(navId:string)=>void,
    addModal:(p:I_rsa_addModal)=>void,
    removeModal:(id?:string)=>void,
    addSnakebar:(p:I_rsa_addSnakebar)=>void,
    closeSide:()=>void,
    getNavId:()=>string,
    addConfirm:(p:I_rsa_addConfirm)=>void,
    openSide:()=>void,
    render:()=>React.ReactNode,
    changeTheme: (index:number) => void
}
export type I_rsa_navItem = {
    id:string,
    text:string | (()=>string),
    icon?:React.ReactNode | (()=>React.ReactNode),
    items?:I_rsa_navItem[],
    show?:()=>boolean,
    render?:()=>React.ReactNode
}
export type I_rsa_nav = {
    items:()=>I_rsa_navItem[]
    id?:string,
    header?:()=>React.ReactNode,
    footer?:()=>React.ReactNode,
    cache?:boolean
}
export type I_rsa_sideItem = {
    icon?:React.ReactNode | (()=>React.ReactNode),
    text:string,
    attrs?:any,
    show?:()=>boolean,
    onClick:Function
}
export type I_rsa_side = {
    items:I_rsa_sideItem[] | (()=>I_rsa_sideItem[]),
    header?:()=>React.ReactNode,
    footer?:()=>React.ReactNode,
    attrs?:any
}
export type I_rsa_props = {
    rtl:boolean,maxWidth:number,id:string,title?:(nav:I_rsa_nav)=>string,
    nav:I_rsa_nav,side?:I_rsa_side,
    headerContent?:()=>React.ReactNode,
    body:(activeNavItem:I_rsa_navItem)=>React.ReactNode

} 
//////rsa
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
    vitrinCategories:any[],
    vitrinBrands:string[],
    bundleData:I_bundle_taxon[]
}
export type I_backOffice_versions = {
    login?: number,
    taxonProducts?: number,
    cart?: number,
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
export type I_backOffice_access = {
    appsetting:boolean,spreeManagement:boolean,contentManagement:boolean,priceList:boolean,vitrinSuggestions:boolean,vitrinBrands:boolean,vitrinCategories:boolean
}
export type I_backOffice_accessKey = 'appsetting'|'spreeManagement'|'contentManagement'|'priceList'|'vitrinSuggestions'|'vitrinBrands'|'vitrinCategories'
export type I_backOffice_accessPhoneNumber = {
    phoneNumber:string,
    access:I_backOffice_access,
    name:string
};
//////backOffice
export type I_shippingOptions = {
    PaymentTime?:number, PayDueDate?:number, DeliveryType?:number,SettleType?:number, giftCodeInfo?:any, discountCodeInfo?:any,CampaignId?:number,address?:string
}
export type I_marketingLine = {ItemCode:string,ItemQty:number}
export type I_spreeCategory = { showType:'icon' | 'slider', id:string,active:boolean,billboard?:string,icon?:string,name:string }

export type I_ShopProps = {
    active:boolean,
    justActiveForAdmins:boolean,
    shopName:string,
    PayDueDate:number,PaymentTime:number,DeliveryType:number,
    PayDueDates:number[],PaymentTimes:number[],DeliveryTypes:number[],
    CampaignId:number,
    shopId:string,
    getAppState?:()=>any,
    billboard?:string,
    icon?:string,
    maxCart?:number,
    maxTotal?:boolean,
    PriceListNum?:number,
    taxons?:I_taxon[],
    description?:string,
    itemType:'Product' | 'Taxon' | 'Bundle' | 'Category'
} 
export type I_taxon = {id:string,name:string,min:number,max:number}
export type I_ShopClass = {
    shopName: string,
    discountPercent?:number,
    active:boolean,
    shopId: string,
    taxons?: I_taxon[],
    maxCart?:number,
    CampaignId?:number,
    PriceListNum?: number,
    billboard?:string,
    products?: I_product,
    description?: string,
    icon?:string,
    itemType: 'Product' | 'Bundle' | 'Taxon' | 'Category',
    getShopItems:(p?:{taxonId?: string, productId?: string})=>Promise<any[]>,
    renderCard_Regular: (
        p: {product: I_product, renderIn: I_renderIn, index: number,loading?: boolean, type?: 'horizontal' | 'vertical'}
    ) => React.ReactNode,
    renderCard_Bundle:(p:{ taxon:I_bundle_taxon, renderIn:I_renderIn, index?:number })=>React.ReactNode,
    renderCard_taxon: (
        p: {
            taxon: I_taxon, renderIn: I_renderIn, index?: number, onFetchProducts?: any, errors?: any[], hasErrors?: any[]
        }
    ) => React.ReactNode,
    renderCartItems:(renderIn:I_renderIn)=>Promise<any[]>
    openCategory:(taxonId?:any)=>void,
    getCartVariants:(p?:{productId?:string,taxonId?:string})=>Promise<{
        cartVariants:I_cartVariant[],marketingLines:I_marketingLine[],total:number,
        bundleMarketingLines:I_marketingLine_bundle[],bundleCartVariants:I_cartShop_bundle_variant[]
    }>,
    payment:(p:I_shippingOptions)=>Promise<boolean>, 
    renderCartFactor:(button?:boolean)=>Promise<React.ReactNode>,
    getAmounts:I_getAmounts,getAmounts_all:I_getAmounts,getAmounts_Bundle:I_getAmounts,
    getFactorItems:(shippingOptions:I_shippingOptions,container:string)=>Promise<I_factorItem[]>
    getPaymentButtonText:(shippingOptions: I_shippingOptions) => string,
    updateProduct:(product:I_product)=>void,
    isProductInCart:(productId:string,taxonId?:string)=>boolean
}
export type I_factorItem = {key:string,value:string,className?:string}
export type I_getAmounts = (shippingOptions:I_shippingOptions, container?:string)=>Promise<I_amounts>;
export type I_amounts = { total:number, discounts:I_discount[], payment:number, ClubPoints?: any };
export type I_renderIn = 'product'|'shipping'|'cart'|'category' | 'slider';
export type I_actionClass = {
    getNavItems:()=>{
        text:string | (()=>string),icon:()=>React.ReactNode,render:()=>React.ReactNode,id:string
    }[],
    getSideItems:()=>I_rsa_sideItem[],
    getSideFooter:()=>React.ReactNode,
    getShopState:()=>Promise<void>,
    fixPrice:(
        p:{ 
            items:{itemCode:string,ItemCode:string,itemQty:number,ItemQty:number}[], 
            CampaignId?:number,PriceListNum?:number 
        }
    )=>I_fixPrice_result[],
    getHeaderIcons:(p:{[key:string]:boolean})=>Promise<any[]>,
    getFactorDetails:(items:I_factorDetailItem[],shippingOptions:I_shippingOptions,container?:string)=>I_getFactorDetails_result,
    openPopup:(key:string,parameter?:any)=>void,
    getCodeDetails:(p:{giftCodeInfo:any,discountCodeInfo:any})=>any,
    getState:()=>I_app_state,
    getProps:()=>{
        backOffice:I_state_backOffice,
        userInfo:I_userInfo,
        b1Info:I_B1Info,
        Logger:any,
        updateProfile:I_updateProfile,
        Login:I_AIOLogin
    },
    pricing:any,
    getAppTitle:(nav:any)=>React.ReactNode,
    manageUrl:()=>void,
    getInitialNavId:()=>I_bottomMenu,
    getSpreeCategories:() =>void,
    getSettleType:(PayDueDate:number) => number|undefined,
    openLink:(linkTo:string) => void,
    isLocationMissed:()=>boolean,
    handleMissedLocation:()=>void,
    getCartLength:()=>Promise<number>,
    removeCartItem:(p:I_changeCartProps)=>Promise<I_state_cart>,
    editCartItem:(p:I_changeCartProps)=>Promise<I_state_cart>,
    changeCart:(p:I_changeCartProps)=>Promise<void>,
    getGuaranteeItems:()=>Promise<void>,
    getBazargahOrders:()=>Promise<void>,
    removeCartTab:(shopId:string)=>void,
    removeCartBundleTaxon:(taxon:I_bundle_taxon) =>void,
    fixCartByPricing:(shopId:string)=>Promise<void>,
    removeCart:(cart:I_state_cart,ids:string[],fields:string[])=>void,
    getCartShop:(shopId:string)=>any,
    setCartShop:(shopId:string,value:any)=>void,
    editCartTaxonByPricing:(cartTaxon:I_cartTaxon,shopId:string,removable:boolean)=>Promise<void>
}
export type I_factorDetailItem = { ItemCode: string, ItemQty: number }
export type I_getFactorDetails_result = {
    MarketingLines:{CampaignDetails:any,ItemCode:string,ItemQty:number}[],
    DocumentTotal:number,
    marketingdetails:{ DiscountList:any, ClubPoints:any }
}
export type I_fixPrice_result = {
    ItemCode: string,SalesMeasureUnit: string,NumInSale: number,Price: number,B1Dscnt: number,FinalPrice: number,PymntDscnt: number,CmpgnDscnt: number
    OnHand?: {whsCode?: string,qty?: number,qtyLevel?: number,qtyLevRel?: number} | null,   
}
export type I_changeCartProps = {shopId:string,taxonId?:string, productId:string, variantId:string,count:number,productCategory:I_product_category}
export type I_app_state = {
    mounted:boolean,
    backOffice:I_state_backOffice,
    apis:I_AIOService_class,
    Login:I_AIOLogin,
    userInfo:I_userInfo,
    b1Info:I_B1Info,
    Logger:any,
    Shop:I_state_Shop,
    rsa:I_rsa,
    logout:()=>void,
    developerMode:boolean,
    cart:I_state_cart,
    msfReport:I_msfReport,
    bazargahOrders:{wait_to_get?:[],wait_to_send?:[]},
    actionClass:I_actionClass,
    baseUrl:string,
    spreeCategories:I_state_spreeCategories,
    vitrin:I_vitrin,
    updateProfile:I_updateProfile,
    guaranteeItems:any[],
    garanti_products_dic:any,
    guaranteeExistItems:any,
    SetState:(obj:any,callback?:any)=>void,
    setCart:(newcart:I_state_cart)=>void,
    newBazargah:boolean
}
export type I_state_spreeCategories = { icon_type: I_spreeCategory[], slider_type: I_spreeCategory[], dic: {} }
export type I_state_Shop = {[shopId:string]:I_ShopClass}
/////cart
export type I_state_cart = {shops:{[shopId:string]:I_cartShop}}
export type I_cartShop = I_cartShop_Product | I_cartShop_taxon | I_cartShop_bundle;
export type I_cartShop_type = 'Product' | 'Taxon' | 'Bundle'
export type I_cartShop_Product = {products:{[productId:string]:I_cartProduct},type:'Product'}
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
export type I_cartShop_bundle = {
    taxons:{[taxonId:string]:I_cartShop_bundle_taxon},type:'Bundle'
}
export type I_cartShop_bundle_taxon = {
    count:number,products:{[productId:string]:I_cartShop_bundle_product},price:number,taxonId:any
}
export type I_cartShop_bundle_product = {
    variants:{[variantId:string]:I_cartShop_bundle_variant},qty:number,price:number
}
export type I_cartShop_bundle_variant = {
    count:number,step:number,variantId:any
}
export type I_cartShop_taxon = {taxons:{[taxonId:string]:I_cartTaxon},type:'Taxon'}
export type I_cartTaxon = {
    taxonId:string,products:{[productId:string]:I_cartProduct},hasError:boolean
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
export type I_updateProfile = (loginModel: I_AL_model, mode: 'register' | 'profile' | 'location', callback?: Function)=>Promise<I_userInfo | false>


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
    productSku:string | number,
    Price:number,
    hasFullDetail:boolean,
    category:I_product_category, //اطلاعات دسته بندی محصول
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
export type I_product_category = {shopId:string,shopName:string,taxonId?:string,taxonName?:string}

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


export type I_vitrin = {
    started?:boolean,
    update:(obj:any,callback?:Function)=>void,
    removeSelectedProduct:(productId:string | number)=>void,
    getIsSelected:(productId:string | number,variantId?:string | number)=>boolean,
    add:(product:I_vitrin_product,variantId:string | number)=>void,
    remove:(product:any,variantId:string | number)=>void,
    updateVitrinSelected:(product:any,variantId:string | number)=>void,
    fetchData:()=>Promise<void>,
    vitrinSelected?:{[productId:string | number]:I_vitrinSelected_product}
}
export type I_vitrinSelected_product = {
    product:any,
    variantIds:(string | number)[]
}
export type I_vitrin_product = {
    id:string | number,
    image:string,
    name:string,
    description:string,
    price:number,
    variants:I_vitrin_variant[],
    optionTypes:I_vitrin_product_optionType[]
}
export type I_vitrin_variant = {
    id:string | number,
    inStock:number,
    price:number,
    keys:(string | number)[],
    image:string

}
export type I_vitrin_product_optionType = {
    id:number | string,name:string,optionValues:I_vitrin_product_optionValue[]
}
export type I_vitrin_product_optionValue = {
    id:string | number,name:string
}
export type I_RVD_layout = {
    row?:I_RVD_child[],
    column?:I_RVD_child[],
    align?:'v' | 'h' | 'vh',
    gap?:number,
    html?:React.ReactNode
}
export type I_RVD_child = {

} | false