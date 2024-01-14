import Axios from "axios";
export default function guarantiApis({baseUrl,helper}) {
  return {
    async garantiItems(undefined,{b1Info}) {
      let res = await Axios.get(`${baseUrl}/Guarantee/Requests?slpCode=${b1Info.customer.slpcode}&page=${1}&perPage=${20}`);
      if(res.status === 401){return {result:false}}
      if (res.data === null || !res.data || !res.data.isSuccess || !res.data.data) {return {result:[]}}
      let items = res.data.data.data;
      if(!Array.isArray(items)){return {result:[]}}
      items = items.map((o) => {
        let {CreationDate,RequestID} = o;
        let {date,time} = helper.getDateAndTime(CreationDate);
        return { 
          vaziat:{color:'#662D91',text:o.Summary},
          tarikh:date,
          saat:time, 
          shomare_darkhast:RequestID,
          org_object:o,
          id:RequestID
        }
      })
      return {result:items}
    },
    async mahsoolate_garanti(o){
      let {Details} = o;
      let result = Details.map(({Quantity,Name}) => {return {onvan:Name,tedad:Quantity}}) 
      return {result}
    },
    async kalahaye_ghabele_garanti() {
      let res = await Axios.get(`${baseUrl}/Guarantee/GetItems`);
      if (!res || !res.data || !res.data.isSuccess || !res.data.data) {
        console.error('Guarantee/GetItems data error')
      }
      else if (!res.data.data.length) {
        console.error('Guarantee/GetItems list is empty')
      }
      if(!res.data || !res.data.isSuccess || !res.data.data){return {result:[]}}
      let result = res.data.data.map((x)=>{
        return {
          onvan:x.RejectedName,
          tedad:0,
          code:x.RejectedCode,
          optionValues:x.Variants.map((o)=>{
            return {value:o.ItemCode,text:o.ItemColor}
          })
        }
      });
      return {result}
    },
    async sabte_kalahaye_garanti(items,{b1Info}) {
      let res = await Axios.post(`${baseUrl}/Guarantee/Equivalent`, { SlpCode: b1Info.customer.slpcode,
         Detail: items.map(x=>{
          return {
            ItemCode:x.code,
            Quantity:items.reduce((partialSum, a) => partialSum + a.Qty, 0),
            Variants:items.map(a=>{
              return {ItemCode:a.lightCode, ItemQty:a.Qty};
            })
           };
         })});

            // let res = await Axios.post(`${baseUrl}/Guarantee/Equivalent`, { SlpCode: b1Info.customer.slpcode,
      //    Detail: {
      //     ItemCode:x.code,Quantity:items.reduce((partialSum, a) => partialSum + a.Qty, 0),
      //     Variants: items.map(x=>{
      //       return {
      //         ItemCode:x.lightCode,
      //         ItemQty:x.Qty
      //       }
      //     })
      //   }});
      return {result:!!res.data && !!res.data.isSuccess};
    },
    async daryafte_tasavire_kalahaye_garanti(itemCodes) {
      let res = await Axios.get(`${baseUrl}/Guarantee/GetGuaranteesImages?ids=${itemCodes.toString()}`); // itemCodes => itemCode of products, seprtaed by comma
      let result;
      try{
        result = res.data.data || []
      }
      catch{
        result = []
      }
      return {result}
      //response
      // var res=[{"ItemCode":"3254","ImagesUrl":"http://link.com"}]
    }
  }
}