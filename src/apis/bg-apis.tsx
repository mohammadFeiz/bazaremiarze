import React from 'react'
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
            //let response = await Axios.get(`${baseUrl.replace('v1','v2')}/os/getordersbazargah?aroundMe=${type === 'سفارشات من'?'false':'true'}`)
            let response = await Axios.get(`${baseUrl.replace('v1','v2')}/os/getorders?aroundMe=${type === 'سفارشات من'?'false':'true'}`)
            const data = response.data.data;
            let result;
            if(response.data.isSuccess){
                result = data.map((o)=>{
                    let {orderDate,takenDate,sendingDate,deliveryType,trackingCode,delivererPhone,delivererName} = o;
                    let submitDate = AIODate().getTime({date:orderDate})
                    
                    if(o.status === 'sending' && (!deliveryType || deliveryType === null)){
                        debugger
                    }
                    if(o.status === 'sent' && (!sendingDate || sendingDate === null)){
                        debugger
                    }

                    return {
                        status:o.status,
                        submitDate,
                        deliverDate:sendingDate?AIODate().getTime({date:sendingDate}):undefined,//use in status:sent
                        code: o.code ,
                        price: o.price,
                        items:o.items.map((item)=>{
                            if(!item.image || typeof item.image !== 'string'){item.image = imgph}
                            // let details = item.details                           
                            // if(!details || !Array.isArray(details)){details = []}
                            let detail = [];
                            let details = item.details.toString()
                            //.split("برند").pop()
                            //.replace('برند','')
                            try{
                                let startIndex = details.indexOf('#');
                                let endIndex = details.indexOf('$');
                                let response = details.slice(startIndex,endIndex);
                                if(response[0] === '#' && response.length === 7){
                                    let before = details.slice(0,startIndex);
                                    let after = details.slice(endIndex + 1,details.length)
                                    let color = response;
                                    detail = [
                                        {align:'vh',html:<div className='w-6 h-6 br-100' style={{background:'#ddd'}}></div>,size:16},
                                        {html:before},
                                        {html:<div className='w-12 h-12 br-3' style={{background:color}}></div>,align:'vh'},
                                        {html:after},
                                        
                                    ]
                                    
                                }
                                else {
                                    detail = [
                                        {align:'vh',html:<div className='w-6 h-6 br-100' style={{background:'#ddd'}}></div>,size:16},
                                        {html:details}
                                    ]
                                }

                            }
                            catch{
                                detail = [
                                {align:'vh',html:<div className='w-6 h-6 br-100' style={{background:'#ddd'}}></div>,size:16},
                                {html:details}
                            ]}
                            return {count:item.count,price:item.price,image:item.image,name:item.name,inVitrin:item.inVitrin,id:item.id,vendorId:item.vendorId,detail}
                        }),
                        distanceKM:o.distance,
                        totalOrderCompleted:o.totalOrderCompleted,
                        inVitrin:o.inVitrin,
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
            return {response,result}
        },
        async bg_to_shouldSend({order}){
            let url = `${baseUrl.replace('v1','v2')}/OS/toTaken`;
            let body = {orderId:order.orderId}
            let response = await Axios.post(url,body);
            let result = response.data.isSuccess ? true:response.data.message;
            return {response,result}
        },
        async bg_to_sending({order,data}){
            let {deliveryType,carierName,carierPhoneNumber,trackingCode} = data;
            let url = `${baseUrl.replace('v1','v2')}/OS/toDelivere`;
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
            let url = `${baseUrl.replace('v1','v2')}/OS/toCustomer`;
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