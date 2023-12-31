import Axios from "axios";
import nosrc from './../images/no-src.png';
import vitrin_category_src from './../images/vitrin-category.png';
import vitrin_brand_src from './../images/vitrin-brand.png';
import AIOStorage from 'aio-storage';
export default function vitrinApis({ baseUrl, helper }) {
    return {
        async v_getStarted() {
            var res = await Axios.get(`${baseUrl}/vitrin/GetVitrinState`);
            if (res.data.isSuccess === true) {
                return { result: res.data.data }
            }
            return { result: res.data.message }
        },
        async v_setStarted(state) {
            var res = await Axios.post(`${baseUrl}/vitrin/UpdateVitrinMangement`, { IsVitrinStarted: state });
            if (res.data.isSuccess === true) {
                return { result: res.data.data }
            }
            return { result: res.data.message }
        },
        async v_updateMyVitrin({ isSelected, product, variantId }) {
            //type state = 'add' | 'remove'
            //type product = <product>
            //type variantId = number
            return vitrinMock().v_updateMyVitrin({ isSelected, product, variantId })
            // let res = await Axios.post(`${baseUrl}/vitrin/UpdateVitrin`, { ProductId: id, state: !state, B1Code: product.sku, Price: product.price });
            // if (res.data.isSuccess === true) {
            //     return { result: true }
            // }
            // else { return res.data.message }
        },
        async v_kolle_mahsoolat({ pageSize, pageNumber, searchValue, filter = [], taxon }, { apis }) {
            return vitrinMock().v_getProducts()
            let body = {
                Taxons: [10673],
                PageSize: pageSize,
                PageNumber: pageNumber,
                Term: searchValue
            }
            let response = await Axios.post(`${baseUrl}/spree/GetProducts`, body);
            console.log(response)
            let result = {
                products: response.data.data.result,
                total: response.data.data.totalRecords
            }
            return { response, result }
        },
        async v_selected(cardCode) {
            return vitrinMock().v_selected()
            let res = await Axios.get(`${baseUrl}/vitrin/GetVitrinProductsByCardCode?cardCode=${cardCode}`);
            let ids = res.data.data;
            return { result: ids }
        },
        async v_category_options(parameter, { apis }) {
            let categoryOptions = await apis.request({ api: 'vitrin.v_miarze_categories' });
            let names;
            names = categoryOptions.map((o) => { return o.name });
            return { mock: false, result: names }
        },
        async v_miarze_categories(parameter, { apis }) {
            let res = await Axios.get(`${baseUrl}/Spree/GetAllCategoriesbyIds?ids=10709,10673`);
            let dataResult = res.data.data.data;
            let included = res.data.data.included;
            let categories = dataResult.map((o) => {
                let src = nosrc;
                const imgData = o.relationships.image.data;
                if (imgData !== undefined && imgData != null) {
                    const taxonImage = included.find(x => x.type === "taxon_image" && x.id === imgData.id)
                    if (taxonImage !== undefined && taxonImage != null) {
                        src = "https://spree.burux.com" + taxonImage.attributes.original_url;
                    }
                }
                return { name: o.attributes.name, cartId: o.attributes.name, id: o.id, src: src };
            });
            for (let i = 0; i < categories.length; i++) {
                categories[i].products = await apis.request({ api: 'kharid.getCategoryProducts', parameter: categories[i].id });
            }
            return { mock: false, result: categories };
        },
        async v_miarze_brands() {
            return { mock: true }
        },
        async addSuggestion(suggestion, { userInfo }) {
            let { brand, image, name } = suggestion;
            let { cardCode } = userInfo;
            let formdata = new FormData();
            formdata.append("Image", image.file);
            formdata.append("Brand", brand);
            formdata.append("Name", name);
            formdata.append("CardCode", cardCode);
            let response = await Axios.post(`${baseUrl}/ProductSuggestion/CreateProductSuggestion`, formdata);
            let result;
            if (response.data.isSuccess === true) { result = true }
            else { result = response.data.message }
            return { result }
        }
    }
}

export function vitrinMock() {
    let vitrinStorage = AIOStorage('vitrinstorage')
    return {
        v_mockVitrinSelected() {
            return {
                '534535345345': {
                    product: {
                        "id": '534535345345', "name": "کابل روکش پی وی سی", "description": "توضیحات","price": 2900000,
                        "variants": [
                            {
                                "id": "546345345", "inStock": 100000, "price": 2900000, "keys": [54345, 43234],
                                "image": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ZNOMPX6753_a.jpg"
                            },
                            {
                                "id": "45523452", "inStock": 100000, "price": 2900000, "keys": [54345, 63453],
                                "image": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ZNOMPX6753_a.jpg"
                            }
                        ],
                        "image": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ZNOMPX6753_a.jpg",
                        "optionTypes": [
                            { "id": 82067, "name": "طول سیم", "optionValues": [{ "id": 54345, "name": "5 متری" }, { "id": 65453, "name": "10 متری" }] },
                            { "id": 34867, "name": "برند", "optionValues": [{ "id": 43234, "name": "بروکس" }, { "id": 63453, "name": "ممد کابل ساز" }] }
                        ]
                    },
                    variantIds: ['546345345']
                },
                '64525345': {
                    product: {
                        "id": '64525345', "name": "لامپ حبابی 10 وات", "description": "توضیحات","price": 2900000,
                        "variants": [
                            {
                                "id": "53453534", "inStock": 100000, "price": 2900000, "keys": [6546, 544433],
                                "image": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ZNOMPX6753_a.jpg"
                            },
                            {
                                "id": "5645645744", "inStock": 100000, "price": 2900000, "keys": [5346453, 765456],
                                "image": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ZNOMPX6753_a.jpg"
                            }
                        ],
                        "image": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ZNOMPX6753_a.jpg",
                        "optionTypes": [
                            { "id": 82067, "name": "رنگ نور", "optionValues": [{ "id": 6546, "name": "آفتابی" }, { "id": 5346453, "name": "مهتابی" }] },
                            { "id": 34867, "name": "برند", "optionValues": [{ "id": 544433, "name": "بروکس" }, { "id": 765456, "name": "ممد لامپ ساز" }] }
                        ]
                    },
                    variantIds:["5645645744"]
                }
            }
        },
        v_getProducts() {
            let response = {
                "data": {
                    "data": {
                        "pageNumber": 1,
                        "pageSize": 20,
                        "totalPages": 1,
                        "totalRecords": 2,
                        "result": [
                            {
                                "id": '534535345345', "name": "کابل روکش پی وی سی", "description": "توضیحات","price": 2900000,
                                "variants": [
                                    {
                                        "id": "546345345", "inStock": 100000, "price": 2900000, "keys": [54345, 43234],
                                        "image": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ZNOMPX6753_a.jpg"
                                    },
                                    {
                                        "id": "45523452", "inStock": 100000, "price": 2900000, "keys": [54345, 63453],
                                        "image": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ZNOMPX6753_a.jpg"
                                    }
                                ],
                                "image": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ZNOMPX6753_a.jpg",
                                "optionTypes": [
                                    { "id": 82067, "name": "طول سیم", "optionValues": [{ "id": 54345, "name": "5 متری" }, { "id": 65453, "name": "10 متری" }] },
                                    { "id": 34867, "name": "برند", "optionValues": [{ "id": 43234, "name": "بروکس" }, { "id": 63453, "name": "ممد کابل ساز" }] }
                                ]
                            },
                            {
                                "id": '64525345', "name": "لامپ حبابی 10 وات", "description": "توضیحات","price": 2900000,
                                "variants": [
                                    {
                                        "id": "53453534", "inStock": 100000, "price": 2900000, "keys": [6546, 544433],
                                        "image": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ZNOMPX6753_a.jpg"
                                    },
                                    {
                                        "id": "5645645744", "inStock": 100000, "price": 2900000, "keys": [5346453, 765456],
                                        "image": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ZNOMPX6753_a.jpg"
                                    }
                                ],
                                "image": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ZNOMPX6753_a.jpg",
                                "optionTypes": [
                                    { "id": 82067, "name": "رنگ نور", "optionValues": [{ "id": 6546, "name": "آفتابی" }, { "id": 5346453, "name": "مهتابی" }] },
                                    { "id": 34867, "name": "برند", "optionValues": [{ "id": 544433, "name": "بروکس" }, { "id": 765456, "name": "ممد لامپ ساز" }] }
                                ]
                            }
                        ]
                    },
                    "isSuccess": true,
                    "statusCode": "Success",
                    "message": "عملیات با موفقیت انجام شد"
                },
                "status": 200,
                "statusText": "OK",
                "headers": {
                    "content-type": "application/json; charset=utf-8"
                },
                "config": {
                    "transitional": {
                        "silentJSONParsing": true,
                        "forcedJSONParsing": true,
                        "clarifyTimeoutError": false
                    },
                    "adapter": [
                        "xhr",
                        "http"
                    ],
                    "transformRequest": [
                        null
                    ],
                    "transformResponse": [
                        null
                    ],
                    "timeout": 0,
                    "xsrfCookieName": "XSRF-TOKEN",
                    "xsrfHeaderName": "X-XSRF-TOKEN",
                    "maxContentLength": -1,
                    "maxBodyLength": -1,
                    "env": {},
                    "headers": {
                        "Accept": "application/json, text/plain, */*",
                        "Authorization": "Bearer eyJhbGciOiJBMTI4S1ciLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwidHlwIjoiSldUIn0.WjpUHlXyKYjXBsHoCanhU9ceQISnEwkH0eXjOEKbYfHggLPI6cxjfA._mX-ElyJihneJ5hTeC9J6w.R3kDFeZNWmZyfu23GZOfHAYCFmvqVqCt_Z2jjA29ypftDGrjvEz-zsZawKxrewovIFsD0CqkCJMBFAlRUmMefAtpe7rEw5rh4meM6xYZiWPkMz4hfHZWttJ6iB1yFwkRk3r38JhidJMveJVSXaoUnwCpR4EN0H7Mr2OvLiv1hu_w3m_UFRysm_1bzQp1gVfTbe61u9bf0XLkt3F91AGH-geCd9h7kwezW8djG-xN1Y-29EVpVPjkkdu1CK08MJPailNYGl2kYwYiRgUeqRkefuGl0LEUdzaCAwju6Vrzu3GklE3TlpsBCvHwc9xbsBng7CGU0mNiizjyglTvIYvRedLwE2GTm2vdSISuSD4qFZLCP65Tivlm-eDIMJ7_4pJXXxVIk359PRlExBi7Oz9xGt8KeFJuVoiDc4AyFaj_YF33k_5grejN_K25RgVxHsNLYyf5ic0ikhanUSu99aDCAmK3p59IkjBT-jR5NpmSYjus418kKtJ5LaUKROcRSfmk5hd-D-9JYgtnCfJ5DGfESwQ6zsGH5uD44vvX_AUoeUrDB1M35XxMJq42xfkm-NkQEIX52Glin4qc-RK3iDi5BWa3dpNmGK-Wl-VhEmEHdE_Q9ZC1ELYGksXIBaWqvV9mIUMM7pe_8bMJonKAElufvg.S0OVIi7KlR3e7Yek1roKOA",
                        "Content-Type": "application/json"
                    },
                    "method": "post",
                    "url": "https://retailerapp.bbeta.ir/api/v1/spree/GetProducts",
                    "data": "{\"Taxons\":[10673],\"PageSize\":20,\"PageNumber\":1,\"Term\":\"\"}"
                },
                "request": {}
            }
            let result = {
                products: response.data.data.result,
                total: response.data.data.totalRecords
            }
            return { response, result }
        },
        v_selected() {
            let myVitrin = vitrinStorage.load({ name: 'vitrinSelected', def: [] })
            let result = {};
            for (let i = 0; i < myVitrin.length; i++) {
                let { product, productId, variantId } = myVitrin[i];
                result[productId] = result[productId] || { product, variantIds: [] }
                result[productId].variantIds.push(variantId)
            }
            result = {
                '534535345345': {
                    product: {
                        "id": '534535345345', "name": "کابل روکش پی وی سی", "description": "توضیحات","price": 2900000,
                        "variants": [
                            {
                                "id": "546345345", "inStock": 100000, "price": 2900000, "keys": [54345, 43234],
                                "image": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ZNOMPX6753_a.jpg"
                            },
                            {
                                "id": "45523452", "inStock": 100000, "price": 2900000, "keys": [54345, 63453],
                                "image": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ZNOMPX6753_a.jpg"
                            }
                        ],
                        "image": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ZNOMPX6753_a.jpg",
                        "optionTypes": [
                            { "id": 82067, "name": "طول سیم", "optionValues": [{ "id": 54345, "name": "5 متری" }, { "id": 65453, "name": "10 متری" }] },
                            { "id": 34867, "name": "برند", "optionValues": [{ "id": 43234, "name": "بروکس" }, { "id": 63453, "name": "ممد کابل ساز" }] }
                        ]
                    },
                    variantIds: ['546345345',"45523452"]
                },
                // '64525345': {
                //     product: {
                //         "id": '64525345', "name": "لامپ حبابی 10 وات", "description": "توضیحات","price": 2900000,
                //         "variants": [
                //             {
                //                 "id": "53453534", "inStock": 100000, "price": 2900000, "keys": [6546, 544433],
                //                 "image": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ZNOMPX6753_a.jpg"
                //             },
                //             {
                //                 "id": "5645645744", "inStock": 100000, "price": 2900000, "keys": [5346453, 765456],
                //                 "image": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ZNOMPX6753_a.jpg"
                //             }
                //         ],
                //         "image": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ZNOMPX6753_a.jpg",
                //         "optionTypes": [
                //             { "id": 82067, "name": "رنگ نور", "optionValues": [{ "id": 6546, "name": "آفتابی" }, { "id": 5346453, "name": "مهتابی" }] },
                //             { "id": 34867, "name": "برند", "optionValues": [{ "id": 544433, "name": "بروکس" }, { "id": 765456, "name": "ممد لامپ ساز" }] }
                //         ]
                //     },
                //     variantIds:["5645645744","53453534"]
                // }
            }
            return { result }
        },
        v_updateMyVitrin({ isSelected, product, variantId }) {
            let myVitrin = vitrinStorage.load({ name: 'vitrinSelected', def: [] })
            if (isSelected) {
                myVitrin = myVitrin.filter((o) => {
                    if (o.productId === product.id && o.variantId === variantId) { return false }
                    return true
                })
            }
            else {
                myVitrin = [myVitrin, { productId: product.id, product, variantId }]
            }
            vitrinStorage.save({ name: 'vitrinSelected', value: myVitrin })
            return { result: true };
        },
        v_kolle_mahsoolat() {
            return [
                { id: '0', name: 'دریل چکشی رونیکس مدل ۱۲۱۱', src: '', price: 120000, categories: ['دریل و پیچ گوشتی'] },
                { id: '1', name: 'دریل پیچ گوشتی شارژی چکشی دیوالت مدل DCD700', src: '', price: 120000, categories: ['ابزار برقی', 'ابزار دستی'] },
                { id: '2', name: 'دریل پیچ گوشتی شارژی مکس مدل +DL1', src: '', price: 120000, categories: ['ابزار برقی'] },
                { id: '3', name: 'دریل بتن کن رونیکس کد 2701', src: '', price: 120000, categories: ['دریل و پیچ گوشتی'] },
                { id: '4', name: 'دریل پیچ گوشتی شارژی پی ام مدل PM-CE1', src: '', price: 120000, categories: ['دریل و پیچ گوشتی', 'ابزار دستی'] },
                { id: '5', name: 'دریل چکشی رونیکس مدل ۱۲۱۱', src: '', price: 120000, categories: ['دریل و پیچ گوشتی'] },
                { id: '6', name: 'دریل پیچ گوشتی شارژی مکس مدل +DL1', src: '', price: 120000, categories: ['ابزار دستی'] },
                { id: '7', name: 'دریل بتن کن رونیکس کد 2701', src: '', price: 120000, categories: ['ابزار برقی', 'ابزار دستی'] },
            ]
        },
        v_category_options() {
            return [
                'دریل و پیچ گوشتی',
                'ابزار برقی',
                'ابزار دستی'
            ]
        },
        v_miarze_categories() {
            return [
                { name: 'محصولات روشنایی', src: vitrin_category_src },
                { name: 'محصولات روشنایی', src: vitrin_category_src },
                { name: 'محصولات روشنایی', src: vitrin_category_src },
                { name: 'محصولات روشنایی', src: vitrin_category_src },
                { name: 'محصولات روشنایی', src: vitrin_category_src },
                { name: 'محصولات روشنایی', src: vitrin_category_src },
                { name: 'محصولات روشنایی', src: vitrin_category_src },
                { name: 'محصولات روشنایی', src: vitrin_category_src },
                { name: 'محصولات روشنایی', src: vitrin_category_src },
            ]
        },
        v_miarze_brands() {
            return [
                { name: 'بروکس', src: vitrin_brand_src },
                { name: 'بروکس', src: vitrin_brand_src },
                { name: 'بروکس', src: vitrin_brand_src },
                { name: 'بروکس', src: vitrin_brand_src },
                { name: 'بروکس', src: vitrin_brand_src },
                { name: 'بروکس', src: vitrin_brand_src },
                { name: 'بروکس', src: vitrin_brand_src },
                { name: 'بروکس', src: vitrin_brand_src },
                { name: 'بروکس', src: vitrin_brand_src },
                { name: 'بروکس', src: vitrin_brand_src },

            ]
        }
    }
}