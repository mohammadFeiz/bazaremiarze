import Axios from "axios";
import AIODate from "./../../npm/aio-date/aio-date";
import AIOStorage from './../../npm/aio-storage/aio-storage';
import AIOMessage from "../aio-message/aio-message";
import './index.css';
import $ from "jquery";
export let helper = {
  showAlert(obj = {}){AIOMessage(obj)},
  getDateAndTime(value){
    try{
      let res = AIODate().toJalali({date:value});
      let miliseconds = AIODate().getTime({date:value})
      let [year,month,day,hour,minute] = res;
      let date = `${year}/${month}/${day}`;
      let time = `${hour}:${minute}`;
      let delta = AIODate().getDelta({date:value});
      let remainingTime = delta.type === 'passed'?{day:0,hour:0,minute:0,second:0}:delta;
      let passedTime = delta.type === 'remaining'?{day:0,hour:0,minute:0,second:0}:delta;
      return {date,time,dateAndTime:`${date} ${time}`,remainingTime,passedTime,miliseconds}
    }
    catch{
      return {date:'',time:'',dateAndTime:'',remainingTime:0,passedTime:0,miliseconds:0}
    }
  },
  arabicToFarsi(value){
    try{return value.replace(/ك/g, "ک").replace(/ي/g, "ی");}
    catch{return value}
  }
}
export default function services(obj = {}) {
  let {
    getState,token,loader,id,
    getResponse,
    getMock = ()=>{return {}},
    onCatch = ()=>{},
    getError = ()=>{},
    baseUrl
  } = obj;
  if(typeof id !== 'string'){console.error('aio-storage => id should be an string, but id is:',id); return;}
  return Service({
    getState,token,loader,id,onCatch,getError,baseUrl,
    getResponse:getResponse({getState,token,helper,baseUrl}),
    getMock:getMock({getState,token,helper,baseUrl}) 
  })
}
function AIOServiceLoading(id){
  return (`
    <div class="aio-service-loading" id="${id}">
      <div class="aio-service-loading-0">
        <div class="aio-service-loading-1">
          <div class="aio-service-loading-2" style="animation: 1s ease-in-out 0.0s infinite normal none running aioserviceloading;"></div>
          <div class="aio-service-loading-2" style="animation: 1s ease-in-out 0.1s infinite normal none running aioserviceloading;"></div>
          <div class="aio-service-loading-2" style="animation: 1s ease-in-out 0.2s infinite normal none running aioserviceloading;"></div>
          <div class="aio-service-loading-2" style="animation: 1s ease-in-out 0.3s infinite normal none running aioserviceloading;"></div>
          <div class="aio-service-loading-2" style="animation: 1s ease-in-out 0.4s infinite normal none running aioserviceloading;"></div>
        </div>
      </div>
    </div>
  `)
}
function Service(config) {
  function validate(result,{validation,api,def,name,errorMessage,successMessage,messageTime}){
    name = typeof name === 'function'?name():name;
    name = name || api;
    if(typeof result === 'string'){
      if(errorMessage !== false){
        if(errorMessage === undefined){errorMessage = `${name} با خطا روبرو شد`}
        helper.showAlert({type:'error',text:errorMessage,subtext:result});
      }
      return def === undefined?result:def;
    }
    else{
      if(successMessage){
        successMessage = typeof successMessage === 'function'?successMessage(result):successMessage
        if(successMessage === true){successMessage = ''}
        helper.showAlert({type:'success',text:`${name} با موفقیت انجام شد`,subtext:successMessage,time:messageTime});
      }
    }
    return result;
  }
  function handleLoading({loading = true,loadingParent = 'body',api},state){
    if(loading){
      if(state){
        $(loadingParent).append(typeof config.loader === 'function'?config.loader():AIOServiceLoading(api));
      }
      else{
        let loadingDom = $('#' + api);
        if(!loadingDom.length){loadingDom = $('.aio-service-loading')}
        loadingDom.remove()
      }
    }
  }
  function getFromCache({cache,cacheName,api}){
    if (cache) {
      if(isNaN(cache)){console.error('aio-storage => cache should be a number, but cache is:',cache); return;}
      let storage = AIOStorage(config.id);
      return storage.load({name:cacheName ? 'storage-' + cacheName : 'storage-' + api,time:cache})
    }
  }
  async function getResultByResponse(obj,getMock){//return undefined(getResponse not set) or string(error) or response
    let {
      api,parameter,
      onCatch = config.onCatch,
      getError = config.getError
    } = obj
    try{
        let {
          getResponse = config.getResponse[api]
        } = obj;
        if(!getResponse){
          let error = `aio-service error => missing getResponse function in ${api} api`
          helper.showAlert({type:'error',text:error});
          return error;
        }
        let {response,result,mock} = await getResponse(parameter);
        if(mock && typeof getMock === 'function'){return getMock(parameter);}
        if(response){
          let error = getError(response,obj);
          if(typeof error === 'string'){return error}
        }
        return result
    }
    catch(err){
      let catcheResult = onCatch(err,api);
      if(typeof catcheResult === 'string'){return catcheResult}
      else{return err.message}  
    }
  }
  async function fetchData(obj){
    let {
      api,parameter,
      getMock = config.getMock[api]
    } = obj;
    let cache = getFromCache(obj);
    if(cache !== undefined){return cache}
    handleLoading(obj,true);
    if(obj.token){
      let tokenResult = typeof obj.token === 'function'?obj.token():obj.token;
      Axios.defaults.headers.common['Authorization'] = `Bearer ${tokenResult}`;
    }
    else if(config.token){
      let tokenResult = typeof config.token === 'function'?config.token():config.token;
      Axios.defaults.headers.common['Authorization'] = `Bearer ${tokenResult}`;
    }
    let res;
    try{
      let result = await getResultByResponse(obj,getMock); 
      if(result === undefined){if(getMock){res = getMock(parameter)}}
      else{res = result;}
    }
    catch(err){
      res = err.message;
    }
    handleLoading(obj,false);
    return res;
  }
  return async (obj) => {
    let { callback,cache,cacheName,api,onError} = obj;
    if(!api){
      helper.showAlert({type:'error',text:`aio-service error => missing api property`});
      return;
    }
    let result = await fetchData(obj);
    result = validate(result,obj);
    if (cache) {AIOStorage(config.id).save({name:cacheName ? 'storage-' + cacheName : 'storage-' + api,value:result})}
    if(callback && typeof result !== 'string'){callback(result);}
    if(onError && typeof result === 'string'){onError(result);}
    return result;
  }
}