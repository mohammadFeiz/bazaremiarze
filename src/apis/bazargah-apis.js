import Axios from "axios";
import nosrcImage from './../images/no-src.png';
import AIODate from './../npm/aio-date/aio-date';
export default function bazargahApis({baseUrl,helper}) {
    return {
        async getBazargahTotalTime(type,{backOffice}) {
            let forsat = { 'wait_to_get': 'forsate_akhze_sefareshe_bazargah', 'wait_to_send': 'forsate_ersale_sefareshe_bazargah' }[type];
            let result = backOffice.bazargah[forsat];
            return { result }
        },
        async isOrderTimePassed({ order, type },{apis}) {
            let totalTime = await apis.request({ api: 'bazargah.getBazargahTotalTime', parameter: type })
            let { miliseconds, type: timetype } = AIODate().getDelta({ date: order.orderDate });
            let result = timetype === 'passed' && miliseconds > totalTime * 60 * 1000;
            return { result }
        },
        async daryafte_sefareshate_bazargah({ type },{apis}) {
            //return {mock:true}
            let totalTime = await apis.request({ api: 'bazargah.getBazargahTotalTime', parameter: type });
            let res = await Axios.get(`${baseUrl}/OS/GetWithDistance?time=${totalTime}&distance=100&status=${{ 'wait_to_get': '1', 'wait_to_send': '2' }[type]}`); // 1 for pending
            let data = [];
            try { data = res.data.data || []; }
            catch { data = [] }
            let result = [];
            for (let i = 0; i < data.length; i++) {
                let order = data[i];
                let item = await apis.request({ api: 'bazargah.bazargahItem', parameter: { order, type } });
                if (item === false) { continue }
                result.push(item);
            }
            return { result}
        },
        async bazargahItem({ order, type },{apis}) {
            let passed = await apis.request({ api: 'bazargah.isOrderTimePassed', parameter: { order, type } })
            if (passed) { return { result: false } }
            let totalTime = await apis.request({ api: 'bazargah.getBazargahTotalTime', parameter: type });
            let bulbSrc = nosrcImage;
            let distance = 0;
            let orderItems = [];
            try {
                distance = +order.distance.toFixed(2);
                orderItems = order.orderItems.map(i => {
                    let src = i.imagesUrl !== null && i.imagesUrl !== undefined ? i.imagesUrl.split(",")[0] : bulbSrc;
                    return { name: i.productName, detail: `${i.options} - تعداد:${i.quantity}`, src: src, id: i.id, price: i.finalPrice * i.quantity };
                })
            }
            catch {
                distance = 0;
                orderItems = [];
            }
            let result = {
                type,
                sendStatus: {
                    itemsChecked: order.providedData !== null && order.providedData.itemsChecked ? order.providedData.itemsChecked : {},//{'0':true,'1':false}
                    delivererId: order.providedData !== null && order.providedData.delivererId ? order.providedData.delivererId : undefined,
                    delivererType: order.providedData !== null && order.providedData.delivererType ? order.providedData.delivererType : 'shakhsi',
                    isFinal: order.providedData !== null && order.providedData.isFinal ? order.providedData.isFinal : false,
                },
                "amount": order.finalAmount,
                distance,
                "benefit": 110000,
                'deliveredCode': order.deliveredCode,
                "totalTime": totalTime,
                "address": order.billAddress,
                "items": orderItems,
                "cityId": null,
                "provinceId": null,
                "buyerId": order.buyerId,
                "orderNumber": order.orderNumber,
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
                "city": order.city,
                "province": order.province,
                "longitude": order.longitude,
                "latitude": order.latitude,
                "orderDate": type === 'wait_to_send' ? order.acceptedDate : order.orderDate,
                "id": order.id,
                "createdDate": helper.getDateAndTime(order.createdDate).date,
                "modifiedDate": null,
                "isDeleted": order.isDeleted
            }
            return { result }
        },
        async bazargahActivity(active) {
            let res = await Axios.get(`${baseUrl}/Users/ActivateBazargah?isBazargahActive=${active}`);
            return { result: res.data.data.isBazargahActive };
        },
        async taghire_vaziate_ersale_sefaresh({ orderId, sendStatus }) {
            let result = await Axios.get(`${baseUrl}/OS/OrderItemStatus?orderId=${orderId}&data=${JSON.stringify(sendStatus)}`);
            return { result: result.data.isSuccess };
        },
        async get_deliverers() {
            let result = await Axios.get(`${baseUrl}/Deliverer`);
            if (!result.data.isSuccess) { return { result: [] } };
            return { result: result.data.data };
        },
        async get_ecoDeliverer(res) {
            let result;
            if (!res) {
                result = false
            }
            result = {
                fullName: 'عباس حسنی', id: '1231234', phoneNumber: '09123434568'
            }
            return { result }
        },
        async ecoRequest(order) {
            return { result: true }
        },
        async add_deliverer({ mobile, name }) {
            let result = await Axios.post(`${baseUrl}/Deliverer`, {
                phoneNumber: mobile,
                fullName: name
            });
            if (result.data.isSuccess) {
                return { result: result.data.data }
            }
        },
        async remove_deliverer(id) {
            return {
                result:true,//در صورت موفقیت
                //result:'Message' // در صورت خطا
            }
        },
        async taide_code_tahvil({ dynamicCode, deliveredCode, orderId }) {
            let result = await Axios.get(`${baseUrl}/OS/DeliveredCodeValidation?code=${deliveredCode + dynamicCode}&id=${orderId}`);
            if (!result.data.isSuccess) { result = result.data.message || 'خطا' }
            else { result = result.data.data }
            return { result }
        },
        async akhze_sefaresh({ orderId },{userInfo}) {
            let res = await Axios.post(`${baseUrl}/OS/AddNewOrder`, {
                cardCode: userInfo.cardCode,
                orderId
            });
            let result = res.data.isSuccess?true:(res.data.message || res.data.Message || 'خطا');
            return { result }
        }
    }
}


export function bazargahMock() {
    return {
        async daryafte_sefareshate_bazargah({ type }) {
            if(type === 'wait_to_get'){
                return [
                    {
                        "type": "wait_to_get",
                        "sendStatus": {
                            "itemsChecked": {
                                "2663": true
                            },
                            "delivererId": 19,
                            "delivererType": "shakhsi",
                            "isFinal": true
                        },
                        "amount": 1000,
                        "distance": 5.3,
                        "benefit": 110000,
                        "deliveredCode": "1168",
                        "totalTime": 1440,
                        "address": "",
                        "items": [
                            {
                                "name": "پنل پلی کربنات روکار 18 وات بروکس",
                                "detail": "رنگ نور: مهتابی, برند: بروکس - تعداد:1",
                                "src": "https://spree.burux.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdU1vIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--90dbc24e335917f6dfed49d5cf444c1a3ce183da/Lamp-Site-temp1-min-2.jpg",
                                "id": 2663,
                                "price": 1000
                            }
                        ],
                        "buyerId": "21",
                        "orderNumber": "R744123792",
                        "receiverId": "18813",
                        "buyerName": "احتشامی",
                        "receiverName": "احتشامی",
                        "buyerNumber": "09930442794",
                        "receiverNumber": "09930442794",
                        "orderId": 2636,
                        "vendorId": "36",
                        "shippingAddress": "تهران، انقلاب اسلامی، بین ابوریحان و مهارت",
                        "zipCode": "1234567897",
                        "optionalAddress": null,
                        "city": "- - -",
                        "province": null,
                        "longitude": "51.40090942382813",
                        "latitude": "35.70080152485188",
                        "orderDate": new Date().toISOString(),
                        "id": 1765,
                        "createdDate": "1402/2/13",
                        "modifiedDate": null,
                        "isDeleted": false
                    },
                    {
                        "type": "wait_to_get",
                        "sendStatus": {
                            "itemsChecked": {},
                            "delivererType": "shakhsi",
                            "isFinal": false
                        },
                        "amount": 1000,
                        "distance": 5.3,
                        "benefit": 110000,
                        "deliveredCode": "1390",
                        "totalTime": 1440,
                        "address": "",
                        "items": [
                            {
                                "name": "لامپ ال ای دی حبابی 12 وات بروکس",
                                "detail": "رنگ نور: آفتابی, برند: بروکس - تعداد:1",
                                "src": "https://spree.burux.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBa0lyIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--a4e9f14f935e6302ba9755f2d8dd6d696af894cd/1.jpg",
                                "id": 2635,
                                "price": 1000
                            }
                        ],
                        "buyerId": "21",
                        "orderNumber": "R977858833",
                        "receiverId": "18675",
                        "buyerName": "احتشامی",
                        "receiverName": "احتشامی",
                        "buyerNumber": "09930442794",
                        "receiverNumber": "09930442794",
                        "orderId": 3164,
                        "vendorId": "36",
                        "shippingAddress": "تهران، انقلاب اسلامی، بین ابوریحان و مهارت",
                        "zipCode": "1234567897",
                        "optionalAddress": null,
                        "city": "- - -",
                        "province": null,
                        "longitude": "51.40090942382813",
                        "latitude": "35.70080152485188",
                        "orderDate": new Date().toISOString(),
                        "id": 1752,
                        "createdDate": "1402/2/4",
                        "modifiedDate": null,
                        "isDeleted": false
                    },
                    {
                        "type": "wait_to_get",
                        "sendStatus": {
                            "itemsChecked": {},
                            "delivererType": "shakhsi",
                            "isFinal": false
                        },
                        "amount": 4776002,
                        "distance": 1058.61,
                        "benefit": 110000,
                        "deliveredCode": "0332",
                        "totalTime": 1440,
                        "address": "",
                        "items": [
                            {
                                "name": "لامپ ال ای دی حبابی 12 وات بروکس",
                                "detail": "رنگ نور: مهتابی, برند: بروکس - تعداد:3",
                                "src": "https://spree.burux.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBa0lyIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--a4e9f14f935e6302ba9755f2d8dd6d696af894cd/1.jpg",
                                "id": 1666,
                                "price": 3870000
                            },
                            {
                                "name": "لامپ حبابی 10 وات هدیه",
                                "detail": "رنگ نور: مهتابی - تعداد:2",
                                "src": "https://spree.burux.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbzlLIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--baa53af7e81e59c783f73217a84771c36625bba4/Frame%2048095391%20(1).png",
                                "id": 1667,
                                "price": 4
                            },
                            {
                                "name": "باتری قلمی پک 2 تایی بروکس",
                                "detail": "نوع بسته بندی: بلیستر - تعداد:4",
                                "src": "https://spree.burux.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBckJIIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--0641437a568b588e009ed914ecc8d2d4c7fe46c3/%D8%A8%D8%A7%D8%AA%D8%B1%DB%8C%20%D9%82%D9%84%D9%85%DB%8C.jpg",
                                "id": 1668,
                                "price": 4144000
                            },
                            {
                                "name": "باتری ریموتی نیم قلمی بروکس",
                                "detail": "ظرفیت: 23 A - تعداد:2",
                                "src": "https://spree.burux.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBcjlIIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--cf64ed33f97992d339be6049a44eab0e6c2f6b2f/%D8%B1%DB%8C%D9%85%D9%88%D8%AA%DB%8C%2023.jpg",
                                "id": 1669,
                                "price": 812000
                            },
                            {
                                "name": "باتری نیم قلمی پک 2 تایی بروکس",
                                "detail": "نوع بسته بندی: بلیستر - تعداد:4",
                                "src": "https://spree.burux.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBclpIIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--8c0dd3d67cb4d0f149b7128a17f7989470e9ab6e/%D8%A8%D8%A7%D8%AA%D8%B1%DB%8C%20%D9%86%DB%8C%D9%85%20%D9%82%D9%84%D9%85%DB%8C.jpg",
                                "id": 1670,
                                "price": 3696000
                            },
                            {
                                "name": "لامپ حبابی 10 وات بروکس",
                                "detail": "رنگ نور: آفتابی, برند: بروکس - تعداد:4",
                                "src": "https://spree.burux.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdWs0IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--d58585a0dc073f623f6232d1114fa6d74c5049d1/10w-bulb-min.png",
                                "id": 1671,
                                "price": 4480000
                            }
                        ],
                        "buyerId": "1720",
                        "orderNumber": "R196607926",
                        "receiverId": "9098",
                        "buyerName": "طاهری",
                        "receiverName": "طاهری",
                        "buyerNumber": "09173613152",
                        "receiverNumber": "09173613152",
                        "orderId": 1398,
                        "vendorId": "36",
                        "shippingAddress": "بندرعباس، امام خمینی، شهید حسن خانگاه",
                        "zipCode": "7913933334",
                        "optionalAddress": null,
                        "city": "- - -",
                        "province": null,
                        "longitude": "56.26974910497665",
                        "latitude": "27.17808510808077",
                        "orderDate": new Date().toISOString(),
                        "id": 1422,
                        "createdDate": "1401/12/12",
                        "modifiedDate": null,
                        "isDeleted": false
                    }
                ]
            }
            else {
                return [
                    {
                        "type": "wait_to_send",
                        "sendStatus": {
                            "itemsChecked": {},
                            "delivererType": "shakhsi",
                            "isFinal": false
                        },
                        "amount": 1000,
                        "distance": 5.3,
                        "benefit": 110000,
                        "deliveredCode": "9602",
                        "totalTime": 960,
                        "address": "",
                        "items": [
                            {
                                "name": "پنل توکار 9 وات تابش",
                                "detail": "رنگ نور: مهتابی - تعداد:1",
                                "src": "data:image/png;base64,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",
                                "id": 2667,
                                "price": 1000
                            }
                        ],
                        "cityId": null,
                        "provinceId": null,
                        "buyerId": "21",
                        "orderNumber": "R825976624",
                        "receiverId": "18864",
                        "buyerName": "احتشامی",
                        "receiverName": "احتشامی",
                        "buyerNumber": "09930442794",
                        "receiverNumber": "09930442794",
                        "orderId": 3293,
                        "vendorId": "36",
                        "shippingAddress": "تهران، انقلاب اسلامی، بین ابوریحان و مهارت",
                        "zipCode": "1234567897",
                        "optionalAddress": null,
                        "city": "- - -",
                        "province": null,
                        "longitude": "51.40090942382813",
                        "latitude": "35.70080152485188",
                        "orderDate": new Date().toISOString(),
                        "id": 1768,
                        "createdDate": "1402/2/16",
                        "modifiedDate": null,
                        "isDeleted": false
                    }
                ]
                
            }
        },
    }
}