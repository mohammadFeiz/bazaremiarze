import Axios from "axios";
import imgph from './../images/imgph.png';
import AIODate from 'aio-date';
import { I_bg_order, I_bg_tab, I_deliveryType } from "../pages/bazargah/bg";
export type I_bg_orders_param = I_bg_tab;
export type I_bg_orders_result = I_bg_order[];
export type I_bg_orders = (type:I_bg_orders_param)=>Promise<{response:any,result:I_bg_orders_result}>

export type I_bg_to_shouldSend_result = true | string;
export type I_bg_to_shouldSend = (p:{order:I_bg_order})=>Promise<{response:any,result:I_bg_to_shouldSend_result}>

export type I_bg_to_sending_param = {deliveryType:I_deliveryType,carierName?:string,carierPhoneNumber?:string,trackingCode?:string};
export type I_bg_to_sending_result = true | string;
export type I_bg_to_sending = (p:{order:I_bg_order,data:I_bg_to_sending_param})=>Promise<{response:any,result:I_bg_to_sending_result}>

export type I_bg_to_sent_param = {deliveryCode:string};
export type I_bg_to_sent_result = true | string;
export type I_bg_to_sent = (p:{order:I_bg_order,data:I_bg_to_sent_param})=>Promise<{response:any,result:I_bg_to_sent_result}>

export default function bgApis({baseUrl,helper}) {
    let fns:{
        bg_orders:I_bg_orders,
        bg_to_shouldSend:I_bg_to_shouldSend,
        bg_to_sending:I_bg_to_sending,
        bg_to_sent:I_bg_to_sent
    } = {
        async bg_orders(type){
            //type 'اطراف من' | 'سفارشات من'
            let response = await Axios.get(`https://retailerapp.bbeta.ir/api/v2/os/getorders?aroundMe=${type === 'سفارشات من'?'false':'true'}`)
            // console.log(res.data.data)
            const data = response.data.data;
            let result;
            if(response.data.isSuccess){
                result = data.map((o)=>{
                    let {orderDate,takenDate,deliveryType,trackingCode,delivererPhone,delivererName} = o;
                    let submitDate = AIODate().getTime({date:orderDate})
                    
                    if(o.status === 'sending' && (!deliveryType || deliveryType === null)){
                        debugger
                    }
                    if(o.status === 'sent' && (!takenDate || takenDate === null)){
                        debugger
                    }

                    return {
                        status:o.status,submitDate,
                        deliverDate:takenDate?AIODate().getTime({date:takenDate}):undefined,//use in status:sent
                        code: o.code ,price: o.price,
                        items:o.items.map((item)=>{
                            if(!item.image || typeof item.image !== 'string'){item.image = imgph}
                            if(!item.details || !Array.isArray(item.details)){item.details = []}
                            return {count:item.count,price:item.price,image:item.image,name:item.name,details:item.details}
                        }),
                        distanceKM:o.distance,
                        orderId:o.orderId,
                        deliveryType:deliveryType?{'Peyk':'carier','Post':'post'}[deliveryType]:undefined,//use in status:sending
                        trackingCode,//use in status:sending
                        carierName:delivererName || '',//use in status:sending
                        carierPhoneNumber:delivererPhone || '',//use in status:sending
                        info:{name:o.info.name,lat:o.info.lat,lng:o.info.lng,address:o.info.address,city:o.info.city,province:o.info.province,postal:o.info.postal,phone:o.info.phone}
                    }
                })
            }
            else {
                result = response.data.message
            }
            
                // {
                //     status:'canTake',submitDate:new Date().getTime() - ( 15 * 60 * 60 * 1000) - (45 * 60 * 1000),
                //     //deliverDate?:number,//use in status:sent
                //     code:'R12321423',price:16788000,
                //     items:[
                //         {
                //             count:4,price:156000,image:'https://foroozeshh.ir/uploads/35c364159798460e8c0d9fcf7b3c900f.png',name:'بست کمربندی',
                //             details:[{key:'سایز',value:'35'}]
                //         },
                //         {
                //             count:1,price:156000,image:'https://dkstatics-public.digikala.com/digikala-products/ad471d52115052c14a17dbeb99c48ea506c1bb8a_1650959811.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90',name:'اسپیکر جی بی ال',
                //             details:[{key:'رنگ',value:'سبز ارتشی'}]
                //         },
                //         {
                //             count:1,price:156000,image:'https://irananker.com/wp-content/uploads/2020/01/A8133-4-600x600.jpg',name:'کابل انکر طول 1.8 متر powerline Micro USB',
                //         },
                //     ],
                //     isInVitrin:true,
                //     distanceKM:6.4,
                //     //deliveryType?:I_deliveryType,//use in status:sending
                //     //trackingCode?:string,//use in status:sending
                //     info:{name:'محمد شریف احتشامی',lat:35.699739,lng:51.338097,address:'تهران شیخ بهایی شمالی نوربخش پلاک 30 واحد 4',city:'تهران',province:'تهران',postal:1234567,phone:'02188050006'}
                // },
                // {
                //     status:'takenByOther',submitDate:new Date().getTime() - ( 3 * 60 * 60 * 1000) - (10 * 60 * 1000),
                //     //deliverDate?:number,//use in status:sent
                //     code:'R12321423',price:16788000,
                //     items:[
                //         {
                //             count:4,price:156000,image:lampsrc,name:'لامپ حبابی 12 وات',
                //             details:[{key:'رنگ نور',value:'آفتابی'},{key:'سر پیچ',value:'E27'}]
                //         },
                //         {
                //             count:4,price:156000,image:lampsrc,name:'لامپ حبابی 12 وات',
                //             details:[{key:'رنگ نور',value:'مهتابی'},{key:'سر پیچ',value:'E27'}]
                //         }
                //     ],
                //     distanceKM:6.4,
                //     //deliveryType?:I_deliveryType,//use in status:sending
                //     //trackingCode?:string,//use in status:sending
                //     info:{name:'داوود عباس نژاد',lat:35.699739,lng:51.338097,address:'تهران شیخ بهایی شمالی نوربخش پلاک 30 واحد 4',city:'تهران',province:'تهران',postal:1234567,phone:'02188050006'}
                // },
                // {
                //     status:'takenByOther',submitDate:new Date().getTime() - ( 1 * 60 * 60 * 1000) - (22 * 60 * 1000),
                //     //deliverDate?:number,//use in status:sent
                //     code:'R12321423',price:16788000,
                //     items:[
                //         {
                //             count:4,price:156000,image:lampsrc,name:'لامپ حبابی 12 وات',
                //             details:[{key:'رنگ نور',value:'آفتابی'},{key:'سر پیچ',value:'E27'}]
                //         },
                //         {
                //             count:1,price:1159787,image:'https://image.torob.com/base/images/e8/bW/e8bWco3U1x-5AdDk.jpg_/0x176.jpg 1x,https://image.torob.com/base/images/e8/bW/e8bWco3U1x-5AdDk.jpg_/0x352.jpg 2x',name:'دریل چکشی رونیکس'
                //         }
                //     ],
                //     distanceKM:6.4,
                //     //deliveryType?:I_deliveryType,//use in status:sending
                //     //trackingCode?:string,//use in status:sending
                //     info:{name:'دانیال عنایتی',lat:35.699739,lng:51.338097,address:'تهران شیخ بهایی شمالی نوربخش پلاک 30 واحد 4',city:'تهران',province:'تهران',postal:1234567,phone:'02188050006'}
                // }
            return {response,result}
        },
        async bg_to_shouldSend({order}){
            debugger
            let url = `https://retailerapp.bbeta.ir/api/v2/OS/toTaken`;
            let body = {orderId:order.orderId}
            let response = await Axios.post(url,body);
            let result = response.data.isSuccess?true:response.data.message;
            return {response,result}
        },
        async bg_to_sending({order,data}){
            let {deliveryType,carierName,carierPhoneNumber,trackingCode} = data;
            let url = `https://retailerapp.bbeta.ir/api/v2/OS/toDelivere`;
            let body;
            if(deliveryType === 'carier'){
                body = {
                    "orderId": order.orderId, // required
                    "deliveryType": "Peyk", // required 
                    "PhoneNumber": carierPhoneNumber, // required
                    "Fullname": carierName // optional
                }    
            }
            else if(deliveryType === 'post'){
                body = {
                    "orderId": order.orderId, // required
                    "deliveryType": "Post", // required 
                    "trackingCode": trackingCode, // optional
                }
            }
            let response = await Axios.post(url,body);
            let result = response.data.isSuccess?true:response.data.message;
            return {response,result}
        },
        async bg_to_sent({order,data}){
            let {deliveryCode} = data
            let url = `https://retailerapp.bbeta.ir/api/v2/OS/toCustomer`;
            let body = {
                "orderId": order.orderId,
                "code": deliveryCode
            }
            let response = await Axios.post(url,body);
            let result = response.data.isSuccess?true:response.data.message;
            return {response,result}
        }
    }
    return fns;
}