export default function URL_to_JSON(url) {
    try{
      return JSON.parse(`{"${decodeURI(url.split('?')[1]).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"')}"}`)
    }
    catch{return {}}
}