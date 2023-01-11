import Axios from "axios";
import AIODate from "./../../npm/aio-date/aio-date";
import './index.css';
import $ from "jquery";
function AIOServiceShowAlert(obj = {}){
  let {type = '',text = '',subtext = '',icon} = obj;
  let svg = icon || {
      error:(
          `<svg viewBox="0 0 24 24" role="presentation" style="width: 4.5rem; height: 4.5rem;"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" style="fill: red;"></path></svg>`
      ),
      warning:(
          `<svg viewBox="0 0 24 24" role="presentation" style="width: 4.5rem; height: 4.5rem;"><path d="M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16" style="fill: orange;"></path></svg>`
      ),
      info:(
          `<svg viewBox="0 0 24 24" role="presentation" style="width: 4.5rem; height: 4.5rem;"><path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" style="fill: dodgerblue;"></path></svg>`
      ),
      success:(
          `<svg viewBox="0 0 24 24" role="presentation" style="width: 4.5rem; height: 4.5rem;"><path d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20M16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z" style="fill: green;"></path></svg>`
      )

  }[type] || ''
  let dui = 'aa' + Math.round((Math.random() * 100000000))
  let str = `
      <div class='aio-service-alert-container ${dui}'>
          <div class='aio-service-alert'>
              <div class='aio-service-alert-header'>
                  ${svg}
              </div>
              <div class='aio-service-alert-body'>
                  <div class='aio-service-alert-text'>
                      ${text}
                  </div>
                  <div class='aio-service-alert-subtext'>
                      ${subtext}
                  </div>
              </div>
              <div class='aio-service-alert-footer'>
                  <button class='aio-service-alert-close ${dui}'>بستن</button>    
              </div>    
          </div>    
      </div>
  `
  $('body').append(str);
  $('.' + dui).on({click:function(){
      $('.' + dui).remove()
  }})
}
export default function services({getState,apis,token,loader,baseUrl}) {
  function getDateAndTime(value){
    let dateCalculator = AIODate();
    let adate,atime;
    try {
      if (value.indexOf("T") !== -1) {atime = value.split("T")[1].split(".")[0];} 
      else {atime = value.split(" ")[1];}
    } 
    catch {atime = undefined;}
    try {adate = dateCalculator.gregorianToJalali(value).join("/");
    } 
    catch {adate = "";}
    return {date:adate,time:atime}
  }
  function arabicToFarsi(value){
    try{return value.replace(/ك/g, "ک").replace(/ي/g, "ی");}
    catch{return value}
  }
  if(token){
    Axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  return Service(apis({Axios,getState,getDateAndTime,arabicToFarsi,token,AIOServiceShowAlert,baseUrl}),loader)
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

function Service(services,loader) {
  function getFromCache(key, minutes) {
    if (minutes === true) { minutes = Infinity }
    let storage = localStorage.getItem(key);
    if (storage === undefined || storage === null) { return false }
    let { time, data } = JSON.parse(storage);
    if ((new Date().getTime() / 60000) - (time / 60000) > minutes) { return false }
    return data;
  }
  function setToCache(key, data) {
    let time = new Date().getTime();
    localStorage.setItem(key, JSON.stringify({ time, data }))
  }
  function removeLoading(id){
    if(!id){return}
    let loading = $('#' + id);
    if(!loading.length){loading = $('.aio-service-loading')}
    loading.remove()
  }
  return async ({ api,callback, parameter, loading = true, cache, cacheName,def,validation,loadingParent = 'body' }) => {
    let loadingId;
    if (loading) {
      loadingId = 'b' + Math.random()
      $(loadingParent).append(typeof loader === 'function'?loader():AIOServiceLoading(loadingId)); 
    }
    if (cache) {
      let a = getFromCache(cacheName ? 'storage-' + cacheName : 'storage-' + api, cache);
      if (a !== false) {
        removeLoading(loadingId);
        return a
      }
      if (!services[api]) {debugger;}
      let result = await services[api](parameter);
      removeLoading(loadingId);
      setToCache(cacheName ? 'storage-' + cacheName : 'storage-' + api, result);
      return result;
    }
    if (!services[api]) {alert('services.' + api + ' is not define')}
    let result;
    try{
      result = await services[api](parameter);
    }
    catch(err){
      AIOServiceShowAlert({type:'error',text:`apis().${api}`,subtext:err.message});
    }
    removeLoading(loadingId);
    if(validation){
      let message = validation(result);
      if(typeof message === 'string'){
        AIOServiceShowAlert({type:'error',text:`apis().${api}`,subtext:message});
        result = def === undefined?result:def;
      }
    }
    if(callback){callback(result)}
    return result;
  }
}

