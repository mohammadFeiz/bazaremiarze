import Axios from "axios";
export default function apis({getState,token,getDateAndTime,showAlert,baseUrl}) {
  let {userInfo} = getState();
  return {
    async items() {
      let res = await Axios.get(`${baseUrl}/Guarantee/Requests?slpCode=${userInfo.slpcode}&page=${1}&perPage=${20}`);
      if(res.status === 401){return false}
      if (res.data === null || !res.data || !res.data.isSuccess || !res.data.data) {return []}
      

      let items = res.data.data.data;
      if(!Array.isArray(items)){return []}
      items = items.map((o) => {
        let {CreationDate,RequestID} = o;
        let {date,time} = getDateAndTime(CreationDate);

        return { 
          vaziat:{color:'#662D91',text:o.Summary},
          tarikh:date,
          saat:time, 
          shomare_darkhast:RequestID,
          org_object:o,
          id:RequestID
        }
      })
      return items
    },
    async mahsoolate_garanti(o){
      let {Details} = o;
      return Details.map(({Quantity,Name}) => {   
        return {
          onvan:Name,
          tedad:Quantity,
        } 
      }) 
    },
    async kalahaye_mojood() {
      let res = await Axios.get(`${baseUrl}/Guarantee/GetItems`);
      if (!res || !res.data || !res.data.isSuccess || !res.data.data) {
        console.error('Guarantee/GetItems data error')
      }
      else if (!res.data.data.length) {
        console.error('Guarantee/GetItems list is empty')
      }
      if(!res.data || !res.data.isSuccess || !res.data.data){return []}
      return res.data.data.map((x)=>{
        return {
          onvan:x.RejectedName,
          tedad:0,
          code:x.RejectedCode,
          optionValues:x.variants.map((o)=>{
            return {value:o.ItemCode,text:o.ItemColor}
          })
        }
      });
    },
    async sabte_kala(items) {
      debugger
      let res = await Axios.post(`${baseUrl}/Guarantee`, { CardCode: userInfo.cardCode, Items: items });
      return !!res.data && !!res.data.isSuccess
    },
    async getImages(itemCodes) {
      let res = await Axios.get(`${baseUrl}/Guarantee/GetGuaranteesImages?ids=${itemCodes.toString()}`); // itemCodes => itemCode of products, seprtaed by comma
      try{
        return res.data.data || []
      }
      catch{
        return []
      }
      //response
      // var res=[{"ItemCode":"3254","ImagesUrl":"http://link.com"}]
    }
  }
}