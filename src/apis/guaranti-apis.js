import Axios from "axios";
export default function apis({getState,token,getDateAndTime,showAlert,baseUrl}) {
  let {userInfo} = getState();
  return {
    async items() {
      let res = await Axios.post(`${baseUrl}/Guarantee/GetAllGuarantees`, { CardCode: userInfo.cardCode });
      if(res.status === 401){return false}
      if (res.data && res.data.isSuccess && res.data.data) {
        let items = res.data.data.Items;
        items = items.map((o) => {
          let {date,time} = getDateAndTime(o.CreateTime);
          return { ...o,CreateTime:date,_time:time, Details: o.Details.map((d) => { return { ...d } }) }
        })
        return {items,total:res.data.data.TotalItems}
      }
      else { return {items:[],total:0}; }
      
      // return [];
    },
    async kalahaye_mojood() {
      let res = await Axios.get(`${baseUrl}/Guarantee/GetItems`);
      if (!res || !res.data || !res.data.isSuccess || !res.data.data) {
        console.error('Guarantee/GetItems data error')
      }
      else if (!res.data.data.length) {
        console.error('Guarantee/GetItems list is empty')
      }
      return res.data && res.data.isSuccess && res.data.data ? res.data.data.map(x=>{
        return {Code:x.RejectedCode,Name:x.RejectedName}
      }) : [];
    },
    async sabte_kala(items) {
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