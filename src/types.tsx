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
    render:()=>React.ReactNode
}

/////aio-login
/////aio-service
export type I_AIOService_request = (obj:{
    api:string,parameter?:any,loading?:boolean,onCatch?:I_AIOService_onCatch,
    message?:{error?:boolean | string,success?:boolean | string},
    description:string,getError?:I_AIOService_getError
})=>any
export type I_AIOService_class = {
    request:I_AIOService_request,
    setToken:(token:string)=>void
}
export type I_AIOService_onCatch = (error:any)=>string | undefined
export type I_AIOService_getError = (response:any)=>string | undefined
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
export type I_backOffice_accessPhoneNumber = {phoneNumber:string,access:{[field:string]:boolean}};
export type I_backOffice = {
    accessPhoneNumbers:I_backOffice_accessPhoneNumber[]
    landing:{type:'billboard' | 'image' | 'description' | 'label',url?:string,text?:string}[],
    active_landing:boolean,
    isAdmin:(userInfo:I_userInfo)=>boolean,isSuperAdmin:(userInfo:I_userInfo)=>boolean
}