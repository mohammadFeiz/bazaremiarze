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
    description?:string,getError?:I_AIOService_getError,def?:any
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
    taxons?:[id:string,name:string,min:number,max:number][]
} 
export type I_ShopClass = {
    billboard?:string,icon?:string,name:string,
    openCategory:(id?:string)=>void,
    payment:(p:{ address, SettleType, PaymentTime, DeliveryType, PayDueDate, cartId, giftCodeInfo, discountCodeInfo })=>boolean
    getCartProducts:(renderIn:'product'|'shipping'|'cart'|'category',shippingOptions?:I_shippingOptions)=>React.ReactNode[],
    renderCartFactor:()=>React.ReactNode
}
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
export type I_actionClass = {
    fixPrice:(
        p:{ 
            items:{itemCode:string,ItemCode:string,itemQty:number,ItemQty:number}[], 
            CampaignId?:number,PriceListNum?:number 
        }
    )=>any[],//notice
}
export type I_state_spreeCategories = { icon_type: I_spreeCategory[], slider_type: I_spreeCategory[], dic: {} }
export type I_state_Shop = {[shopId:string]:I_ShopClass}
/////cart
export type I_state_cart = {[cartId:string]:(I_cartTab | I_cartTaxon)}
export type I_cartTab = {items:{[variantId:string]:I_cartItem}}
export type I_cartItem = {product:any,count:number,variantId:string}
export type I_cartTaxon = {items:{[taxonId:string]:I_cartTaxonItem},isTaxon:true}
export type I_cartTaxonItem = {
    taxonId:string,items:{[variantId:string]:I_cartItem},
    errors?:{product:any,taxonId:string,minValue:number,maxValue:number,error:string}[]
}
/////cart
export type I_report = {
    actionName: string, actionId: number, targetName?: string, targetId?: number,
    tagName: 'kharid' | 'vitrin' | 'profile' | 'other' | 'user authentication', eventName: 'action' | 'page view',
    result?: 'success' | 'unsuccess', message?: string
}
export interface I_Report_parameter extends I_report {
    apis: I_AIOService_class; phoneNumber: string; userId: string;
}  
export type I_msfReport = (obj: I_report, p?: { userId?: string, phoneNumber?: string }) => void
export type I_updateProfile = (loginModel: I_AIOLogin_model, mode: 'register' | 'profile' | 'location', callback?: Function)=>void


export type I_product = any
