import Axios from "axios";
import nosrcImage from './../images/no-src.png';
import AIODate from './../npm/aio-date/aio-date';
import bulbSrc from './../images/10w-bulb.png';
export default function apis({getState,token,getDateAndTime,showAlert,baseUrl}) {
  return {
    async orders({type}){
      //return mockApis('orders',type);
      let time = getState().backOffice.bazargah[{'wait_to_get':'forsate_akhze_sefareshe_bazargah','wait_to_send':'forsate_ersale_sefareshe_bazargah'}[type]];
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
          return {name:i.productName,detail:`${i.options} - تعداد:${i.quantity}`,src:src, id:i.id,price:i.finalPrice * i.quantity};
        })
      }
      catch{
        distance = 0;
        orderItems=[];
      }
      let passedTime = AIODate().getPassedTime(order.orderDate).minutes;
      let forsat = {'wait_to_get':'forsate_akhze_sefareshe_bazargah','wait_to_send':'forsate_ersale_sefareshe_bazargah'}[type];
      let totalTime = getState().backOffice.bazargah[forsat];
      if(passedTime > totalTime){return false}
      return {
        type,
        sendStatus:{
          itemsChecked:order.providedData !== null && order.providedData.itemsChecked ? order.providedData.itemsChecked : {},//{'0':true,'1':false}
          delivererId:order.providedData !== null && order.providedData.delivererId ? order.providedData.delivererId : undefined,
          delivererType:order.providedData !== null && order.providedData.delivererType ? order.providedData.delivererType : 'shakhsi',
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


function orders_mock(type){
  if(type === 'wait_to_send'){
    return [
      {
          type,
          "sendStatus": {
              "itemsChecked": {},
              "delivererType": "eco",
              "isFinal": false
          },
          "amount": 5109001,
          "distance": 603.01,
          "benefit": 110000,
          "deliveredCode": "2035",
          "totalTime": 960,
          "address": "",
          "items": [
              {
                  "name": "لامپ 7 وات هدیه",
                  "detail": "رنگ نور: مهتابی - 1",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBblpLIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--fcc438af7fdfd5b0c2b3980ea0a19b14e41b7339/Frame%2048095391%20(1).png",
                  "id": 1359
              },
              {
                  "name": "چراغ آویز تک شعله شیدا",
                  "detail": "برند: بروکس, رنگ: سفید - 1",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBZ2c4IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--770dee1b05be2a4a76f5dfe4cd502ae793ee285d/%D8%B4%DB%8C%D8%AF%D8%A7%20%D8%B3%D9%81%DB%8C%D8%AF%20%D8%A7%DB%8C%D8%B3%D8%AA%D8%A7%D8%AF%D9%87.png",
                  "id": 1360
              },
              {
                  "name": "چراغ آویز تک شعله نگار",
                  "detail": "برند: بروکس, رنگ: سفید - 1",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBcXM2IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--525e267abc4f44518be9f3951c502e423fef44fb/%D9%86%DA%AF%D8%A7%D8%B1%20%D8%B3%D9%81%DB%8C%D8%AF%20%D8%AA%DA%A9%20%D8%B4%D8%B9%D9%84%D9%87%20%D8%A7%DB%8C%D8%B3%D8%AA%D8%A7%D8%AF%D9%87.png",
                  "id": 1361
              },
              {
                  "name": "لامپ ال ای دی حبابی 12 وات بروکس",
                  "detail": "رنگ نور: مهتابی, برند: بروکس - 1",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBcEk5IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--e994c22a34dbf91f33f3830dc8229bc81a366e45/1.jpg",
                  "id": 1362
              }
          ],
          "cityId": null,
          "provinceId": null,
          "buyerId": "635",
          "receiverId": "2820",
          "buyerName": "کاویانی",
          "receiverName": "کاویانی",
          "buyerNumber": "09171481923",
          "receiverNumber": "09171481923",
          "orderId": 697,
          "vendorId": "36",
          "shippingAddress": "گچساران، خیابان خواجه زاده، سرنبش",
          "zipCode": "7581816664",
          "optionalAddress": null,
          "city": "- - -",
          "province": null,
          "longitude": "50.82706665034537",
          "latitude": "30.34623686479373",
          "orderDate": "2023-01-24T10:10:25.4127841",
          "id": 1304,
          "createdDate": "1401/11/4",
          "modifiedDate": null,
          "isDeleted": false
      },
      {
          type,
          "sendStatus": {
              "itemsChecked": {},
              "delivererType": "eco",
              "isFinal": false
          },
          "amount": 309001,
          "distance": 728.36,
          "benefit": 110000,
          "deliveredCode": "5857",
          "totalTime": 960,
          "address": "",
          "items": [
              {
                  "name": "لامپ ال ای دی حبابی 12 وات بروکس",
                  "detail": "رنگ نور: مهتابی, برند: بروکس - 1",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBcEk5IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--e994c22a34dbf91f33f3830dc8229bc81a366e45/1.jpg",
                  "id": 1319
              },
              {
                  "name": "لامپ 7 وات هدیه",
                  "detail": "رنگ نور: مهتابی - 1",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBblpLIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--fcc438af7fdfd5b0c2b3980ea0a19b14e41b7339/Frame%2048095391%20(1).png",
                  "id": 1320
              }
          ],
          "cityId": null,
          "provinceId": null,
          "buyerId": "595",
          "receiverId": "2736",
          "buyerName": "افشارها",
          "receiverName": "افشارها",
          "buyerNumber": "09155006377",
          "receiverNumber": "09155006377",
          "orderId": 658,
          "vendorId": "36",
          "shippingAddress": "بلوار وکیل اباد بین وکیل آباد62و64",
          "zipCode": "9179773914",
          "optionalAddress": null,
          "city": "- - -",
          "province": null,
          "longitude": "59.4688919",
          "latitude": "36.3369228",
          "orderDate": "2023-01-24T10:12:38.7124587",
          "id": 1293,
          "createdDate": "1401/11/3",
          "modifiedDate": null,
          "isDeleted": false
      },
      {
        type,
        "sendStatus": {
              "itemsChecked": {},
              "delivererType": "eco",
              "isFinal": false
          },
          "amount": 799000,
          "distance": 555.35,
          "benefit": 110000,
          "deliveredCode": "9500",
          "totalTime": 960,
          "address": "",
          "items": [
              {
                  "name": "لامپ ال ای دی حبابی 20 وات بروکس",
                  "detail": "رنگ نور: مهتابی, برند: بروکس - 1",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaVUrIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--08a653ce98811d01ed4689cd42cc616886baedad/20-bulb-min.png",
                  "id": 1301
              }
          ],
          "cityId": null,
          "provinceId": null,
          "buyerId": "577",
          "receiverId": "2691",
          "buyerName": "صادقی",
          "receiverName": "صادقی",
          "buyerNumber": "09166008096",
          "receiverNumber": "09166008096",
          "orderId": 634,
          "vendorId": "36",
          "shippingAddress": "اهواز.صددستگاه باهنر  بلوار سپاه شرقی  خیابان   هفت ایثار  مجتمع مسکونی اسراع  طبقه سوم ",
          "zipCode": "6178747558",
          "optionalAddress": null,
          "city": "- - -",
          "province": null,
          "longitude": "48.72146794812751",
          "latitude": "31.27927927927928",
          "orderDate": "2023-01-24T10:07:37.202228",
          "id": 1287,
          "createdDate": "1401/11/3",
          "modifiedDate": null,
          "isDeleted": false
      },
      {
        type,
        "sendStatus": {
              "itemsChecked": {},
              "delivererType": "eco",
              "isFinal": false
          },
          "amount": 3090001,
          "distance": 518.69,
          "benefit": 110000,
          "deliveredCode": "2755",
          "totalTime": 960,
          "address": "",
          "items": [
              {
                  "name": "لامپ ال ای دی حبابی 12 وات بروکس",
                  "detail": "رنگ نور: مهتابی, برند: بروکس - 10",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBcEk5IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--e994c22a34dbf91f33f3830dc8229bc81a366e45/1.jpg",
                  "id": 1299
              },
              {
                  "name": "لامپ 7 وات هدیه",
                  "detail": "رنگ نور: مهتابی - 1",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBblpLIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--fcc438af7fdfd5b0c2b3980ea0a19b14e41b7339/Frame%2048095391%20(1).png",
                  "id": 1300
              }
          ],
          "cityId": null,
          "provinceId": null,
          "buyerId": "557",
          "receiverId": "2675",
          "buyerName": "مهدی بیگی",
          "receiverName": "مهدی بیگی",
          "buyerNumber": "09189422172",
          "receiverNumber": "09189422172",
          "orderId": 637,
          "vendorId": "36",
          "shippingAddress": "چوار، جاده ایلام - ایوان، ، سلمان فارسی",
          "zipCode": "6936135338",
          "optionalAddress": null,
          "city": "- - -",
          "province": null,
          "longitude": "46.29906188696624",
          "latitude": "33.69725422245407",
          "orderDate": "2023-01-24T10:07:29.761031",
          "id": 1286,
          "createdDate": "1401/11/3",
          "modifiedDate": null,
          "isDeleted": false
      },
      {
        type,
        "sendStatus": {
              "itemsChecked": {},
              "delivererType": "eco",
              "isFinal": false
          },
          "amount": 2263001,
          "distance": 516.85,
          "benefit": 110000,
          "deliveredCode": "7341",
          "totalTime": 960,
          "address": "",
          "items": [
              {
                  "name": "لامپ ال ای دی حبابی 15 وات بروکس",
                  "detail": "رنگ نور: آفتابی, برند: بروکس - 4",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBcXM5IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--51f12ed3dcb62da266ff364bd4c4422ea9bbaff8/15.jpg",
                  "id": 1295
              },
              {
                  "name": "لامپ 7 وات هدیه",
                  "detail": "رنگ نور: مهتابی - 1",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBblpLIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--fcc438af7fdfd5b0c2b3980ea0a19b14e41b7339/Frame%2048095391%20(1).png",
                  "id": 1296
              },
              {
                  "name": "لامپ حبابی 10 وات بروکس",
                  "detail": "رنگ نور: مهتابی, برند: بروکس - 2",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbjg5IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--c8c0cafaaa09d5e811232a5480ca57ff83b5188a/10w-bulb-min.png",
                  "id": 1297
              },
              {
                  "name": "لامپ حبابی 10 وات بروکس",
                  "detail": "رنگ نور: آفتابی, برند: بروکس - 1",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbjg5IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--c8c0cafaaa09d5e811232a5480ca57ff83b5188a/10w-bulb-min.png",
                  "id": 1298
              }
          ],
          "cityId": null,
          "provinceId": null,
          "buyerId": "574",
          "receiverId": "2673",
          "buyerName": "روشن بین",
          "receiverName": "روشن بین",
          "buyerNumber": "09166349533",
          "receiverNumber": "09166349533",
          "orderId": 630,
          "vendorId": "36",
          "shippingAddress": "خوزستان،  بهبهان ،خیابان شاهد کوچه شاه2 پلاک 23",
          "zipCode": "6361974786",
          "optionalAddress": null,
          "city": "- - -",
          "province": null,
          "longitude": "49.00546073913575",
          "latitude": "31.5477463387985",
          "orderDate": "2023-01-24T10:07:21.9170135",
          "id": 1285,
          "createdDate": "1401/11/3",
          "modifiedDate": null,
          "isDeleted": false
      },
      {
        type,
        "sendStatus": {
              "itemsChecked": {},
              "delivererType": "eco",
              "isFinal": false
          },
          "amount": 418001,
          "distance": 553.61,
          "benefit": 110000,
          "deliveredCode": "1782",
          "totalTime": 960,
          "address": "",
          "items": [
              {
                  "name": "لامپ حبابی 10 وات بروکس",
                  "detail": "رنگ نور: مهتابی, برند: بروکس - 2",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbjg5IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--c8c0cafaaa09d5e811232a5480ca57ff83b5188a/10w-bulb-min.png",
                  "id": 1286
              },
              {
                  "name": "لامپ 7 وات هدیه",
                  "detail": "رنگ نور: مهتابی - 1",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBblpLIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--fcc438af7fdfd5b0c2b3980ea0a19b14e41b7339/Frame%2048095391%20(1).png",
                  "id": 1287
              }
          ],
          "cityId": null,
          "provinceId": null,
          "buyerId": "564",
          "receiverId": "2651",
          "buyerName": "منصوری",
          "receiverName": "منصوری",
          "buyerNumber": "09309460195",
          "receiverNumber": "09309460195",
          "orderId": 623,
          "vendorId": "36",
          "shippingAddress": "اهواز، انقلاب، امیرکبیر شمالی، میدان امیرکبیر",
          "zipCode": null,
          "optionalAddress": null,
          "city": "- - -",
          "province": null,
          "longitude": "48.6532062292099",
          "latitude": "31.32544085215377",
          "orderDate": "2023-01-24T10:07:09.7910573",
          "id": 1281,
          "createdDate": "1401/11/3",
          "modifiedDate": null,
          "isDeleted": false
      },
      {
        type,
        "sendStatus": {
              "itemsChecked": {
                  "1273": true,
                  "1274": true
              },
              "delivererType": "shakhsi",
              "isFinal": false
          },
          "amount": 818001,
          "distance": 563.26,
          "benefit": 110000,
          "deliveredCode": "6884",
          "totalTime": 960,
          "address": "",
          "items": [
              {
                  "name": "لامپ ال ای دی حبابی 15 وات بروکس",
                  "detail": "رنگ نور: آفتابی, برند: بروکس - 2",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBcXM5IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--51f12ed3dcb62da266ff364bd4c4422ea9bbaff8/15.jpg",
                  "id": 1273
              },
              {
                  "name": "لامپ 7 وات هدیه",
                  "detail": "رنگ نور: مهتابی - 1",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBblpLIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--fcc438af7fdfd5b0c2b3980ea0a19b14e41b7339/Frame%2048095391%20(1).png",
                  "id": 1274
              }
          ],
          "cityId": null,
          "provinceId": null,
          "buyerId": "548",
          "receiverId": "2613",
          "buyerName": "ساجدی",
          "receiverName": "ساجدی",
          "buyerNumber": "09339475259",
          "receiverNumber": "09339475259",
          "orderId": 597,
          "vendorId": "36",
          "shippingAddress": "بجنورد، شرق سپاه ، امام محمد باقر 29 پلاک 21",
          "zipCode": "9417784344",
          "optionalAddress": null,
          "city": "- - -",
          "province": null,
          "longitude": "57.33202457427979",
          "latitude": "37.47594794878128",
          "orderDate": "2023-01-23T14:50:13.0795103",
          "id": 1276,
          "createdDate": "1401/11/3",
          "modifiedDate": null,
          "isDeleted": false
      },
      {
        type,
        "sendStatus": {
              "itemsChecked": {},
              "delivererType": "eco",
              "isFinal": false
          },
          "amount": 2451001,
          "distance": 117.95,
          "benefit": 110000,
          "deliveredCode": "9066",
          "totalTime": 960,
          "address": "",
          "items": [
              {
                  "name": "لامپ ال ای دی حبابی 15 وات بروکس",
                  "detail": "رنگ نور: آفتابی, برند: بروکس - 3",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBcXM5IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--51f12ed3dcb62da266ff364bd4c4422ea9bbaff8/15.jpg",
                  "id": 1264
              },
              {
                  "name": "لامپ 7 وات هدیه",
                  "detail": "رنگ نور: مهتابی - 1",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBblpLIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--fcc438af7fdfd5b0c2b3980ea0a19b14e41b7339/Frame%2048095391%20(1).png",
                  "id": 1265
              },
              {
                  "name": "لامپ ال ای دی اشکی 7 وات بروکس",
                  "detail": "رنگ نور: آفتابی, برند: بروکس - 4",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBa285IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--84de62e03abfc209f9db79f5bb8ca3be259edeb0/Ashki-bulb-min.png",
                  "id": 1266
              }
          ],
          "cityId": null,
          "provinceId": null,
          "buyerId": "508",
          "receiverId": "2601",
          "buyerName": "کیانی",
          "receiverName": "کیانی",
          "buyerNumber": "09111273607",
          "receiverNumber": "09111273607",
          "orderId": 558,
          "vendorId": "36",
          "shippingAddress": "آمل خیابان طالب آملی. دریای 22/1 کوی فیاض بخش3.کوی شهید عبدالله اپرناک.پلاک 26",
          "zipCode": "4615867888",
          "optionalAddress": null,
          "city": "- - -",
          "province": null,
          "longitude": "52.35014319419862",
          "latitude": "36.47876694570104",
          "orderDate": "2023-01-23T14:49:52.2965841",
          "id": 1273,
          "createdDate": "1401/11/3",
          "modifiedDate": null,
          "isDeleted": false
      },
      {
        type,
        "sendStatus": {
              "itemsChecked": {},
              "delivererType": "eco",
              "isFinal": false
          },
          "amount": 1817100,
          "distance": 257.54,
          "benefit": 110000,
          "deliveredCode": "7053",
          "totalTime": 960,
          "address": "",
          "items": [
              {
                  "name": "باتری قلمی قابل شارژ بروکس",
                  "detail": "نوع بسته بندی: بلیستر - 1",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBcXBIIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--7e7c1aad93ce18c7e9cdb20fe2e8a282e274f7d3/%D8%A8%D8%A7%D8%AA%D8%B1%DB%8C%20%D9%82%D9%84%D9%85%DB%8C%20%D8%B4%D8%A7%D8%B1%DA%98%DB%8C.jpg",
                  "id": 1263
              }
          ],
          "cityId": null,
          "provinceId": null,
          "buyerId": "285",
          "receiverId": "2592",
          "buyerName": "پورمحمد ",
          "receiverName": "پورمحمد ",
          "buyerNumber": "09111869448",
          "receiverNumber": "09111869448",
          "orderId": 587,
          "vendorId": "36",
          "shippingAddress": "بندر انزلی، خیابان مفتح شمالی کوچه شهید مرتضی پور ساختمان عسل 5 واحد 6",
          "zipCode": "4314785594",
          "optionalAddress": null,
          "city": "- - -",
          "province": null,
          "longitude": "49.46928977966309",
          "latitude": "37.47148752701589",
          "orderDate": "2023-01-24T10:06:55.3200059",
          "id": 1272,
          "createdDate": "1401/11/3",
          "modifiedDate": null,
          "isDeleted": false
      },
      {
          type,
          "sendStatus": {
              "itemsChecked": {},
              "delivererType": "eco",
              "isFinal": false
          },
          "amount": 1614001,
          "distance": 257.54,
          "benefit": 110000,
          "deliveredCode": "6926",
          "totalTime": 960,
          "address": "",
          "items": [
              {
                  "name": "لامپ ال ای دی شمعی 7 وات بروکس",
                  "detail": "رنگ نور: مهتابی, برند: بروکس - 6",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbU05IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--791c46036b669034f10bbe3b2bac865fc23c2a52/shami-bulb-min.png",
                  "id": 1260
              },
              {
                  "name": "لامپ 7 وات هدیه",
                  "detail": "رنگ نور: مهتابی - 1",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBblpLIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--fcc438af7fdfd5b0c2b3980ea0a19b14e41b7339/Frame%2048095391%20(1).png",
                  "id": 1261
              }
          ],
          "cityId": null,
          "provinceId": null,
          "buyerId": "285",
          "receiverId": "2588",
          "buyerName": "پورمحمد ",
          "receiverName": "پورمحمد ",
          "buyerNumber": "09111869448",
          "receiverNumber": "09111869448",
          "orderId": 585,
          "vendorId": "36",
          "shippingAddress": "بندر انزلی، خیابان مفتح شمالی کوچه شهید مرتضی پور ساختمان عسل 5 واحد 6",
          "zipCode": "4314785594",
          "optionalAddress": null,
          "city": "- - -",
          "province": null,
          "longitude": "49.46928977966309",
          "latitude": "37.47148752701589",
          "orderDate": "2023-01-24T10:06:45.6080711",
          "id": 1270,
          "createdDate": "1401/11/3",
          "modifiedDate": null,
          "isDeleted": false
      },
      {
          type,
          "sendStatus": {
              "itemsChecked": {},
              "delivererType": "eco",
              "isFinal": false
          },
          "amount": 1000,
          "distance": 4.5,
          "benefit": 110000,
          "deliveredCode": "7334",
          "totalTime": 960,
          "address": "",
          "items": [
              {
                  "name": "لامپ حبابی رنگی 9 وات بروکس",
                  "detail": "رنگ نور: زرد, برند: بروکس - 1",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBajlDIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--a7720c25633e4dae2488ea74beb7873306dfb767/%D9%84%D8%A7%D9%85%D9%BE%20%D8%B1%D9%86%DA%AF%DB%8C-%D8%A2%D8%A8%DB%8C-%D8%AA%DA%A9.png",
                  "id": 192
              }
          ],
          "cityId": null,
          "provinceId": null,
          "buyerId": "21",
          "receiverId": "2170",
          "buyerName": "احتشامی",
          "receiverName": "احتشامی",
          "buyerNumber": "09930442794",
          "receiverNumber": "09930442794",
          "orderId": 413,
          "vendorId": "36",
          "shippingAddress": "تهران، شیخ فضل الله، ستارخان، توحیدی",
          "zipCode": "1235467849",
          "optionalAddress": null,
          "city": "- - -",
          "province": null,
          "longitude": "51.3623138",
          "latitude": "35.7200291",
          "orderDate": "2023-01-12T21:49:03.9213378",
          "id": 235,
          "createdDate": "1401/10/10",
          "modifiedDate": null,
          "isDeleted": false
      },
      {
          type,
          "sendStatus": {
              "itemsChecked": {
                  "182": true
              },
              "delivererId": 4,
              "delivererType": "eco",
              "isFinal": false
          },
          "amount": 10000,
          "distance": 7.5,
          "benefit": 110000,
          "deliveredCode": "8997",
          "totalTime": 960,
          "address": "",
          "items": [
              {
                  "name": " باتری کتابی قابل شارژ بروکس(تستی)",
                  "detail": "برند: بروکس, مدل: شارژی - 1",
                  "src": "",
                  "id": 182
              }
          ],
          "cityId": null,
          "provinceId": null,
          "buyerId": "21",
          "receiverId": "2024",
          "buyerName": "احتشامی",
          "receiverName": "احتشامی",
          "buyerNumber": "09930442794",
          "receiverNumber": "09930442794",
          "orderId": 374,
          "vendorId": "36",
          "shippingAddress": "تهران، آزادی، تقاطع میدان آزادی",
          "zipCode": "1234567897",
          "optionalAddress": null,
          "city": "- - -",
          "province": null,
          "longitude": "51.34057044982911",
          "latitude": "35.69958174823983",
          "orderDate": "2022-12-19T14:27:15.6434226",
          "id": 228,
          "createdDate": "1401/9/28",
          "modifiedDate": null,
          "isDeleted": false
      },
      {
          type,
          "sendStatus": {
              "itemsChecked": {},
              "delivererType": "eco",
              "isFinal": false
          },
          "amount": 3759300,
          "distance": 7.1,
          "benefit": 110000,
          "deliveredCode": "6132",
          "totalTime": 960,
          "address": "",
          "items": [],
          "cityId": null,
          "provinceId": null,
          "buyerId": "10214",
          "receiverId": "11512",
          "buyerName": "قلی",
          "receiverName": "قلی",
          "buyerNumber": "09368556617",
          "receiverNumber": "09368556617",
          "orderId": 465520,
          "vendorId": "36",
          "shippingAddress": "بزرگراه شهید سلیمانی شرق، قبل از خروجی صیاد، پلاک 1312، ساختمان بروکس",
          "zipCode": "1631693612",
          "optionalAddress": null,
          "city": "تهران",
          "province": null,
          "longitude": "51.361256",
          "latitude": "35.691879",
          "orderDate": "2022-10-23T11:18:45.9837038",
          "id": 199,
          "createdDate": "1401/8/1",
          "modifiedDate": null,
          "isDeleted": false
      },
      {
          type,
          "sendStatus": {
              "itemsChecked": {
                  "117": true
              },
              "delivererId": 2,
              "delivererType": "eco",
              "isFinal": false
          },
          "amount": 1000,
          "distance": 5.33,
          "benefit": 110000,
          "deliveredCode": "3118",
          "totalTime": 960,
          "address": "",
          "items": [
              {
                  "name": "لامپ حبابی رنگی 9 وات",
                  "detail": "رنگ نور: سبز, برند: بروکس - 1",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBajlDIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--a7720c25633e4dae2488ea74beb7873306dfb767/%D9%84%D8%A7%D9%85%D9%BE%20%D8%B1%D9%86%DA%AF%DB%8C-%D8%A2%D8%A8%DB%8C-%D8%AA%DA%A9.png",
                  "id": 117
              }
          ],
          "cityId": null,
          "provinceId": null,
          "buyerId": "21",
          "receiverId": "1062",
          "buyerName": "احتشامی",
          "receiverName": "احتشامی",
          "buyerNumber": "09930442794",
          "receiverNumber": "09930442794",
          "orderId": 140,
          "vendorId": "36",
          "shippingAddress": "تهران، انقلاب اسلامی، مهارت",
          "zipCode": "1123456874",
          "optionalAddress": null,
          "city": "- - -",
          "province": null,
          "longitude": "51.40137849284487",
          "latitude": "35.70061769567459",
          "orderDate": "2022-10-18T17:27:30.9904069",
          "id": 167,
          "createdDate": "1401/7/18",
          "modifiedDate": null,
          "isDeleted": false
      },
      {
          type,
          "sendStatus": {
              "itemsChecked": {},
              "delivererType": "eco",
              "isFinal": false
          },
          "amount": 1000,
          "distance": 4.8,
          "benefit": 110000,
          "deliveredCode": null,
          "totalTime": 960,
          "address": "",
          "items": [
              {
                  "name": "لامپ حبابی رنگی 9 وات",
                  "detail": "رنگ نور: سبز, برند: بروکس - 1",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBajlDIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--a7720c25633e4dae2488ea74beb7873306dfb767/%D9%84%D8%A7%D9%85%D9%BE%20%D8%B1%D9%86%DA%AF%DB%8C-%D8%A2%D8%A8%DB%8C-%D8%AA%DA%A9.png",
                  "id": 114
              }
          ],
          "cityId": null,
          "provinceId": null,
          "buyerId": "21",
          "receiverId": "1018",
          "buyerName": "احتشامی",
          "receiverName": "احتشامی",
          "buyerNumber": "09930442794",
          "receiverNumber": "09930442794",
          "orderId": 132,
          "vendorId": "36",
          "shippingAddress": "تهران",
          "zipCode": "1234567891",
          "optionalAddress": null,
          "city": "- - -",
          "province": null,
          "longitude": "51.36932373046876",
          "latitude": "35.71195290290719",
          "orderDate": null,
          "id": 164,
          "createdDate": "1401/7/18",
          "modifiedDate": null,
          "isDeleted": false
      },
      {
          type,
          "sendStatus": {
              "itemsChecked": {},
              "delivererType": "eco",
              "isFinal": false
          },
          "amount": 2000,
          "distance": 13.39,
          "benefit": 110000,
          "deliveredCode": null,
          "totalTime": 960,
          "address": "",
          "items": [
              {
                  "name": "لامپ حبابی رنگی 9 وات",
                  "detail": "رنگ نور: سبز, برند: بروکس - 2",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBajlDIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--a7720c25633e4dae2488ea74beb7873306dfb767/%D9%84%D8%A7%D9%85%D9%BE%20%D8%B1%D9%86%DA%AF%DB%8C-%D8%A2%D8%A8%DB%8C-%D8%AA%DA%A9.png",
                  "id": 113
              }
          ],
          "cityId": null,
          "provinceId": null,
          "buyerId": "21",
          "receiverId": "988",
          "buyerName": "احتشامی",
          "receiverName": "احتشامی",
          "buyerNumber": "09930442794",
          "receiverNumber": "09930442794",
          "orderId": 133,
          "vendorId": "36",
          "shippingAddress": "تهران، لشگری، قباد",
          "zipCode": "1234567894",
          "optionalAddress": null,
          "city": "- - -",
          "province": null,
          "longitude": "51.25946044921876",
          "latitude": "35.70498347442685",
          "orderDate": null,
          "id": 163,
          "createdDate": "1401/7/18",
          "modifiedDate": null,
          "isDeleted": false
      },
      {
          type,
          "sendStatus": {
              "itemsChecked": {},
              "delivererType": "eco",
              "isFinal": false
          },
          "amount": 1000,
          "distance": 18.65,
          "benefit": 110000,
          "deliveredCode": null,
          "totalTime": 960,
          "address": "",
          "items": [
              {
                  "name": "لامپ حبابی رنگی 9 وات",
                  "detail": "رنگ نور: سبز, برند: بروکس - 1",
                  "src": "https://shopback.miarze.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBajlDIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--a7720c25633e4dae2488ea74beb7873306dfb767/%D9%84%D8%A7%D9%85%D9%BE%20%D8%B1%D9%86%DA%AF%DB%8C-%D8%A2%D8%A8%DB%8C-%D8%AA%DA%A9.png",
                  "id": 112
              }
          ],
          "cityId": null,
          "provinceId": null,
          "buyerId": "21",
          "receiverId": "901",
          "buyerName": "احتشامی",
          "receiverName": "احتشامی",
          "buyerNumber": "09930442794",
          "receiverNumber": "09930442794",
          "orderId": 130,
          "vendorId": "36",
          "shippingAddress": "تهران",
          "zipCode": "1234567891",
          "optionalAddress": null,
          "city": "تهران",
          "province": null,
          "longitude": "51.23268789665223",
          "latitude": "35.64767168639377",
          "orderDate": null,
          "id": 162,
          "createdDate": "1401/7/17",
          "modifiedDate": null,
          "isDeleted": false
      }
  ]
  }
}