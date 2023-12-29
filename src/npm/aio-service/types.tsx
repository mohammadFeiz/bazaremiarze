type I_apiFunction = (param?:any)=>{response?:object,result:any};
type I_mockFunction = (param?:any)=>any;
type I_onCatch = (errorObject:object,requestParameterObject:I_requestParameter)=>string;
type I_getError = (response:object,requestParameterObject:I_requestParameter)=>void | string;
type I_message = {success?:boolean | string,error?:boolean | string,time?:number}
type I_cache = {name:string,time:number}

export interface I_AIOService_properties {
    id:string; 
    baseUrl?:string; 
    token?:string; 
    getState?:()=>object; 
    loader?:()=>React.ReactNode;
    getError?:I_getError;
    onCatch?:I_onCatch;
    getApiFunctions:()=>{[apiFunctionName:string]:I_apiFunction};
    getMockFunctions?:()=>{[mockFunctionName:string]:I_mockFunction};
}
export type I_requestParameter = {
    token?:string,
    api:string,
    def?:any,
    description?:string,
    message?:I_message,
    cache?:I_cache,
    onError?:()=>void,
    onSuccess?:(result:any)=>void,
    onCatch?:I_onCatch,
    getError?:I_getError,
    apiFunction?:I_apiFunction,
    mockFunction?:I_mockFunction,
    parameter?:any,
    loading?:boolean,
    loadingParent?:string
}
export type I_requestReturn = {
    response:object,
    result:any
}
export interface I_AIOService_instance {
    removeCache:(name:string) => void;
    getCache:() => object;
    setToken:(token:string)=>void; 
    request:(obj:I_requestParameter)=>any
}