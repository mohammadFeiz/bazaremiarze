import Axios from "axios";
export default function apis({getState,token,getDateAndTime,showAlert,baseUrl}) {
  let {userInfo} = getState();
  return {
    async items() {
      let res = await Axios.post(`${baseUrl}/Guarantee/GetAllGuarantees`, { CardCode: userInfo.cardCode });
      if(res.status === 401){return false}
      if (!res.data || !res.data.isSuccess || !res.data.data) {return {items:[],total:0}}
      

      let items = res.data.data.Items;
      items = items.map((o) => {
        let {CreateTime,RequestID,StatusCode} = o;
        
        let {date,time} = getDateAndTime(CreateTime);
        
        let vaziat;
        if(StatusCode.toString() === '0'){vaziat = {color:'#662D91',text:'در حال بررسی'}}
        else if(StatusCode.toString() === '1'){vaziat = {color:'#005478',text:'اعلام به ویزیتور'}}
        
        return { 
          vaziat,
          tarikh:date,
          saat:time, 
          shomare_darkhast:RequestID,
          org_object:o,
          id:'a' + Math.random()
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
      let res = await Axios.get(`${baseUrl}/Guarantee/GetAllProducts`);
      if (!res || !res.data || !res.data.isSuccess || !res.data.data) {
        console.error('Guarantee/GetAllProducts data error')
      }
      else if (!res.data.data.length) {
        console.error('Guarantee/GetAllProducts list is empty')
      }
      if(!res.data || !res.data.isSuccess || !res.data.data){return []}
      return res.data.data.map(({Name,Code,Qty})=>{
        return {
          oovan:Name,
          tedad:Qty,
          code:Code
        }
      })
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