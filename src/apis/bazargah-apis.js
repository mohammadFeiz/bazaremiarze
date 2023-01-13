import Axios from "axios";
import nosrcImage from './../images/no-src.png';
import AIODate from './../npm/aio-date/aio-date';
import bulbSrc from './../images/10w-bulb.png';
export default function apis({getState,token,getDateAndTime,showAlert,baseUrl}) {
  return {
    async orders({type}){
      return mockApis('orders',type);
      let time = getState().bazargah[{'wait_to_get':'forsate_akhze_sefareshe_bazargah','wait_to_send':'forsate_ersale_sefareshe_bazargah'}[type]];
      let res = await Axios.get(`${baseUrl}/OS/GetWithDistance?time=${time}&distance=100&status=${{'wait_to_get':'1','wait_to_send':'2'}[type]}`); // 1 for pending
      let data = [];
      try{data = res.data.data || [];}
      catch{data = []}
      let result = data.map((order)=>this.bazargahItem({order,time,type}));
      result = result.filter((order)=>order !== false)
      return result
    },
    bazargahItem({order,type}){
      let bulbSrc = nosrcImage;
      let distance = 0;
      let orderItems=[];
      try{
        distance = +order.distance.toFixed(2);
        orderItems=order.orderItems.map(i=>{    
          let src=i.imagesUrl != null && i.imagesUrl != undefined ? i.imagesUrl.split(",")[0]:bulbSrc;
          return {name:i.productName,detail:`${i.options} - ${i.quantity}`,src:src, id:i.id};
        })
      }
      catch{
        distance = 0;
        orderItems=[];
      }
      let passedTime = AIODate().getPassedTime(order.orderDate).minutes;
      let forsat = {'wait_to_get':'forsate_akhze_sefareshe_bazargah','wait_to_send':'forsate_ersale_sefareshe_bazargah'}[type];
      let totalTime = getState().bazargah[forsat];
      if(passedTime > totalTime){return false}
      return {
        type,
        sendStatus:{
          itemsChecked:order.providedData !== null && order.providedData.itemsChecked ? order.providedData.itemsChecked : {},//{'0':true,'1':false}
          delivererId:order.providedData !== null && order.providedData.delivererId ? order.providedData.delivererId : undefined,
          delivererType:order.providedData !== null && order.providedData.delivererType ? order.providedData.delivererType : 'eco',
          isFinal:order.providedData !== null && order.providedData.isFinal ? order.providedData.isFinal : false,
        },
        "amount":order.finalAmount,
        distance,
        "benefit":110000,
        'deliveredCode':order.deliveredCode,
        "totalTime":totalTime,
        "address": order.billAddress,
        "items":orderItems,
        "cityId": null,
        "provinceId": null,
        "buyerId": order.buyerId,
        "receiverId": order.receiverId,
        "buyerName": order.buyerName,
        "receiverName": order.receiverName,
        "buyerNumber": order.buyerNumber,
        "receiverNumber": order.receiverNumber,
        "orderId": order.orderId,
        "vendorId": order.vendorId,
        "shippingAddress": order.shippingAddress,
        "zipCode": order.zipCode,
        "optionalAddress": order.optionalAddress,
        "city":order.city,
        "province": order.province,
        "longitude": order.longitude,
        "latitude": order.latitude,
        "orderDate": type === 'wait_to_send'?order.acceptedDate:order.orderDate,
        "id": order.id,
        "createdDate": getDateAndTime(order.createdDate).date,
        "modifiedDate": null,
        "isDeleted": order.isDeleted
      }
    },
    async activity(active){
      let res = await Axios.get(`${baseUrl}/Users/ActivateBazargah?isBazargahActive=${active}`);
      let result = false;
      try{
        result = res.data.isSuccess || false
      }
      catch{result = false}

      return res.data.data.isBazargahActive;  
    },
    async taghire_vaziate_ersale_sefaresh({orderId,sendStatus}){
      let result = await Axios.get(`${baseUrl}/OS/OrderItemStatus?orderId=${orderId}&data=${JSON.stringify(sendStatus)}`);

      // sendStatus:{
      //   itemsChecked:{},//{'0':true,'1':false}
      //   delivererId:'0',
      // }
      
      //if(!res){return false}
      
      return result.data.isSuccess;

    },
    async get_deliverers(){

      let result = await Axios.get(`${baseUrl}/Deliverer`);
      if(!result.data.isSuccess) return;
      return result.data.data;

      // return [
      //   {name:'عباس حسنی',id:'0',mobile:'09123434568'},
      //   {name:'علی عنایتی',id:'1',mobile:'09125345646'},
      //   {name:'دانیال کاوه',id:'2',mobile:'09126456345'},
      //   {name:'محمد احمدی',id:'3',mobile:'09123345435'}
      // ] 
    },
    async get_ecoDeliverer(res){
      console.log('get_ecoDeliverer')
      if(!res){
        return false
      }
      return {
          fullName:'عباس حسنی',id:'1231234',phoneNumber:'09123434568'
      } 
    },
    async ecoRequest(order){
      return true
    },
    async add_deliverer({mobile,name}){
      let result = await Axios.post(`${baseUrl}/Deliverer`,{
        phoneNumber:mobile,
        fullName:name
      });
      if(result.data.isSuccess){
        return result.data.data
      }
    },
    async taide_code_tahvil({dynamicCode,deliveredCode,orderId}){
      let result = await Axios.get(`${baseUrl}/OS/DeliveredCodeValidation?code=${deliveredCode+dynamicCode}&id=${orderId}`);
      if(!result.data.isSuccess) return false;
      return result.data.data;
    },
    async akhze_sefaresh({orderId}){
      let {userInfo} = getState();
      let res = await Axios.post(`${baseUrl}/OS/AddNewOrder`, {
        cardCode :userInfo.cardCode,
        orderId
      });

      return res.data.isSuccess;
    }
  }
}


function mockApis(api,parameter){
  let data = {
    orders:()=>{
      let type = parameter;
      if(type === 'wait_to_get'){return []}
      else if (type === 'wait_to_send'){
        return [
          {
              type:'wait_to_send',
              sendStatus:{
                  itemsChecked:{},//{'0':true,'1':false}
                  delivererId:false,
                  delivererType:'eco',
                  isFinal:false
              },
              "amount":123456789,
              distance:1000,
              "benefit":110000,
              "totalTime":10,
              "address": 'آدرس',
              "items":[
                  {name:'نام1',src:bulbSrc,detail:'جزییات',id:'0'},
                  {name:'نام2',src:bulbSrc,detail:'جزییات',id:'1'},
                  {name:'نام3',src:bulbSrc,detail:'جزییات',id:'2'},
              ],
              "cityId": null,
              "provinceId": null,
              "buyerId": '10',
              "receiverId": '10',
              "buyerName": 'نام',
              "receiverName": 'نام',
              "buyerNumber": 12354,
              "receiverNumber": 123546,
              "orderId": '0',
              "vendorId": '0',
              "shippingAddress": 'آدرس',
              "zipCode": '12345',
              "optionalAddress": 'آدرس',
              "city":'تهران',
              "province": 'تهران',
              "longitude": 51.338097,
              "latitude": 35.699739,
              "orderDate": new Date().getTime(),
              "id": '0',
              "createdDate": new Date().getTime() - 6000000,
              "modifiedDate": null,
              "isDeleted": false
          }
        ]
        
      }
    }
  }
  return data[api]()
}