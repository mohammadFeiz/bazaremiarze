/////aio-login
export type I_AIOLogin_mode = 'OTPNumber' | 'phoneNumber' | 'OTPCode'
export type I_AIOLogin_model = {
  login:{userId:string,password:string},
  register:{[field:string]:any}
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
    setMode:(mode:I_AIOLogin_mode)=>void
}

/////aio-login
/////aio-service
export type I_AIOService_request = (obj:{
    api:string,parameter?:any,loading?:boolean,onCatch?:I_AIOService_onCatch
})=>any
export type I_AIOService_class = {
    request:I_AIOService_request
}
export type I_AIOService_onCatch = (error:any)=>string | undefined

/////aio-service
export type I_userInfo = {
    phoneNumber:string,
    id:string
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
export type backOffice = {

}