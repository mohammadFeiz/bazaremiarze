import Axios from "axios";
import AIODate from "./../../npm/aio-date/aio-date";
import AIOStorage from './../../npm/aio-storage/aio-storage';
import AIOPopup from "./../../npm/aio-popup/aio-popup";
import './index.css';
import $ from "jquery";
export let helper = {
  showAlert(obj = {}){
    let inst = new AIOPopup();
    inst.addAlert(obj)
  },
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
export default class AIOservice{
  constructor(props){
    AIOServiceValidate(props);
    this.Axios = Axios;
    this.helper = helper;
    let {
      id,loader,baseUrl,token,
      getState = ()=>{return {}},
      getApiFunctions = ()=>{return {}},
      onCatch = ()=>{},
      getError = ()=>{},
    } = props;
    this.id = id;
    this.baseUrl = baseUrl;
    this.storage = AIOStorage('-AIOService-' + this.id);
    this.loader = loader;
    this.getState = getState;
    this.token = token;
    this.onCatch = onCatch;
    this.getError = getError;
    this.setToken = (token)=>{
      let res = token || this.token;
      if(res){
        this.token = res;
        Axios.defaults.headers.common['Authorization'] = `Bearer ${res}`;
      }
    }
    let param = {helper,storage:this.storage,baseUrl:this.baseUrl,id:this.id,Axios:this.Axios,setToken:this.setToken.bind(this)};
    this.apiFunctions = getApiFunctions(param);
  }
  handleCacheVersions = (cacheVersions) => {
    let def = {};
    for(let prop in cacheVersions){def[prop] = 0}
    let storedCacheVersions = this.getCache('storedCacheVersions',def);
    let diffrences = {};
    for(let prop in cacheVersions){
      if(storedCacheVersions[prop] === undefined){continue}
      if (storedCacheVersions[prop] !== cacheVersions[prop]) {
        diffrences[prop] = true;
        if(prop === 'all'){
          this.storage.reset();
        }
        else{this.removeCache(prop)}
      }
      else {diffrences[prop] = false;}
    }
    this.setCache('storedCacheVersions',cacheVersions);
    return diffrences;
  }
  removeCache = (name) => this.storage.remove({name});
  setCache = (name,value) => this.storage.save({name,value})
  getCache = (name,def) => {
    if(name){return this.storage.load({name,def})}
    else {return this.storage.getModel()} 
  }
  setProperty = (key,value)=>{
    if(['getState','loader','baseUrl'].indexOf(key) === -1){return}
    this[key] = value;
  }
  getLoading = (id) => {
    console.log(`aio-service show loading by ${id}`)
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
  handleLoading = (service,state) => {
    let {loading = true,loadingParent = 'body',api} = service;
    if(!loading){return}
    if(state){$(loadingParent).append(typeof this.loader === 'function'?this.loader():this.getLoading(api));}
    else{
      let loadingDom = $('#' + api);
      if(!loadingDom.length){loadingDom = $('.aio-service-loading')}
      loadingDom.remove()
    }
  }
  getFromCache = (service) => {
    let {cache} = service;
    if(!cache){return}
    return this.storage.load({name:cache.name,time:cache.time})
  }
  handleError = (type,p) => {
    let id = this.id;
    if(type === 'request'){
      let properties = [
        'token','api','def','description','message','cache','onError','onSuccess',
        'onCatch','getError','apiFunction','parameter','loading','loadingParent'
      ]
      for(let prop in p){
        if(properties.indexOf(prop) === -1){
          let error = `aio-service with id:${id} error => ${prop} is not a valid property for request object. valid proprties for request object is ${properties.join(' | ')}`
          helper.showAlert({type:'error',text:error});
          return error
        }
      }
      let error;
      if(!p.api){
        error = `aio-service with id:${id} in apiFunction with name (${p.api}) error => missing api property in call request. request object is ${p}`
      }
      else if(p.cache && (typeof p.cache !== 'object' || typeof p.cache.name !== 'string' || typeof p.cache.time !== 'number')){
        error = `
          aio-service with id:${id} error => cache property request parameter object should be an object contain name:string and time:number.
          api is ${p.api}
        `
      }
      if(error){
        helper.showAlert({type:'error',text:error});
        return error
      }
    }
    if(type === 'apiFunction'){
      let error = `aio-service with id:${id} error => cannot find apiFunction ${p.api}. apiFunction should define in getApiFunctions result  or request object`
      helper.showAlert({type:'error',text:error});
      return error;
    }
    if(type === 'apiFunctionReturn'){
      let {res,service} = p;
      if((Array.isArray(res) || typeof res !== 'object') || (res.response === undefined && res.result === undefined)){
        let error = `
          aio-service with id:${id} error => apiFunction (by name '${service.api}') should return an object contain response and result.
          apiFunction name is ${service.api}
        `
        helper.showAlert({type:'error',text:error});
        return error;
      }
      for(let prop in res){
        if(['response','result'].indexOf(prop) === -1){
          let error = `
            aio-service with id:${id} error => apiFunction returned an object contain invalid property. 
            invalid property is : ${prop}
            apiFunction name is ${service.api}
          `
          helper.showAlert({type:'error',text:error});
          return error;
        }
      }
    }
  }
  getApisFunction(service){
    if(service.apiFunction){return service.apiFunction}
    let res;
    eval(`res = this.apiFunctions.${service.api}`);
    return res;
  }
  getResult = async (service) => {//return undefined(apiFunction not set) or string(error) or response
    let {
      api,parameter,
      onCatch = this.onCatch,
      getError = this.getError,
    } = service;
    try{
        let apiFunction = this.getApisFunction(service);
        if(!apiFunction){return this.handleError('apiFunction',service);}
        let res = await apiFunction(parameter,this.getState());
        let resError = this.handleError('apiFunctionReturn',{res,service})
        if(resError){return resError;}
        let {response,result} = res;
        if(response){
          let error = getError(response,service);
          if(typeof error === 'string'){return error}
        }
        return result
    }
    catch(err){
      let catchResult;
      try{catchResult = onCatch(err,service)}
      catch(err){catchResult = err.message || err.Message;}
      if(catchResult === undefined){catchResult = err.message || err.Message}
      console.log(err); 
      return catchResult
    }
  }
  fetchData = async (service) => {
    let cacheResult = this.getFromCache(service); if(cacheResult !== undefined){return cacheResult}
    this.handleLoading(service,true);
    this.setToken(service.token);
    let res;
    try{res = await this.getResult(service);}
    catch(err){res = err.message;}
    this.handleLoading(service,false);
    return res;
  }
  
  validate = (result,service)=>{
    let {api,description,message = {}} = service
    description = (typeof description === 'function'?description():description) || api;
    if(typeof result === 'string'){
      if(message.error !== false){
        let text = message.error;
        if(text === undefined){text = `${description} با خطا روبرو شد`}
        helper.showAlert({type:'error',text,subtext:result});
      }
      return result;
    }
    else{
      if(message.success){
        let subtext = typeof message.success === 'function'?message.success(result):message.success;
        if(subtext === true){subtext = ''}
        helper.showAlert({type:'success',text:`${description} با موفقیت انجام شد`,subtext,time:message.time});
      }
    }
    return result;
  } 
  request = async (service)=> {
    let { onSuccess,cache,onError,def} = service;
    if(this.handleError('request',service)){return}
    let result = await this.fetchData(service);
    result = this.validate(result,service);
    if(typeof result === 'string'){
      if(onError){onError(result);}
      return def
    }
    else {
      if(result === undefined){result = def}
      if(cache){this.storage.save({name:cache.name,value:result})}
      if(onSuccess){onSuccess(result);}
      return result;
    }
  }
}


function AIOServiceValidate({id,loader,getApiFunctions,cacheVersions}){
  let error;
  if(typeof id !== 'string'){
    error = `
      aio-service with id:${id} error => id props should be an string
    `
  }
  else if(typeof getApiFunctions !== 'function'){
    error = `
      aio-service with id:${id} error => missing getApiFunctions props. getAPiFunctions is a function that returns an object contain apiFunctions.
    `
  }
  
  else if(loader && typeof loader !== 'function'){
    error = `
      aio-service with id:${id} error => loader props should be a function
    `
  }
  if(error){alert(error); console.log(error)}
}

function ValidateApi(schema,object,description){
  let $$ = {
      varTypes:{'object': true, 'array': true, 'string': true, 'number': true, 'boolean': true, 'undefined': true, 'any': true, 'function': true, 'null': true},
      checkTypes(value, types){
          if (types === 'any') { return }
          types = types.split('|');
          let res;
          let passed = false;
          for (let i = 0; i < types.length; i++) {
              let type = types[i];
              let error = this.checkType(value, type, types)
              if (error) { res = error }
              else { passed = true }
          }
          if (!passed) { return res }
      },
      checkType(value, type, types){
          let res = false,valueType = this.getType(value);
          if (this.varTypes[type]) {if (valueType === type) { res = true }}
          else {
              let typeString;
              try { typeString = JSON.parse(type) } catch { typeString = type }
              if (value === typeString) { res = true }
          }
          if (res === false) {
              let res;
              try { res = JSON.stringify(value) } catch { res = value }
              return `should be ${types.join('|')} but is ${res}`
          }
      },
      getType(v){
          if (Array.isArray(v)) { return 'array' }
          return v === null?'undefined':typeof v;
      },
      validate(){
          if(!schema || !object){return}
          for (let prop in object) {
              if (!schema[prop]) { return `${description} error, ${prop} is invalid props` }
              let error = this.checkTypes(object[prop], schema[prop])
              if (error) {
                  return `${description}, ${prop} props ${error}`
              }
          }
      }
  }
  return $$.validate()
} 