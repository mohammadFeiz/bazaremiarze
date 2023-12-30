import Axios from "axios";
import nosrc from './../images/no-src.png';
import vitrin_category_src from './../images/vitrin-category.png';
import vitrin_brand_src from './../images/vitrin-brand.png';
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
        async v_updateMyVitrin({ id, state, product }) {
            let res = await Axios.post(`${baseUrl}/vitrin/UpdateVitrin`, { ProductId: id, state: !state, B1Code: product.sku, Price: product.price });
            if (res.data.isSuccess === true) {
                return { result: true }
            }
            else { return res.data.message }
        },
        async v_kolle_mahsoolat({ pageSize, pageNumber, searchValue, filter = [] ,taxon}, { apis }) {
            let {products,total} = await apis.request({api:'kharid.getSpreeProducts',loading:false,parameter:{ Taxons: taxon,pageSize,pageNumber,Name:searchValue,vitrin:true }});
            let allProducts;
            allProducts = products.map((o)=>{return {id : o.id , name : o.name , price:o.FinalPrice / 10 , src:o.srcs[0] , inStock:true , sku : o.defaultVariant?o.defaultVariant.code:o.code}  });
            return {result:{products:allProducts,total}}
        },
        async v_getProducts({ pageSize, pageNumber, searchValue }){
            let body = {
                Taxons:[10673],
                PageSize:pageSize,
                PageNumber:pageNumber,
                Term:searchValue
            }
            let response = await Axios.post(`${baseUrl}/spree/GetProducts`,body);
            console.log(response)
            let result =  {
                products:response.data.data.result,
                total:response.data.data.totalRecords
            }
            return {response,result}

        },
        async v_mahsoolate_entekhab_shode(cardCode) {
            let res = await Axios.get(`${baseUrl}/vitrin/GetVitrinProductsByCardCode?cardCode=${cardCode}`);
            let ids = res.data.data;
            return { result: ids }
        },
        async v_getProductsByIds(ids, { apis }) {
            let {products} = await apis.request({ api: 'kharid.getSpreeProducts', loading: false, parameter: { ids, vitrin: true, Taxons: '10673' } });
            //products = await apis.request({api:'kharid.updateProductPrice',parameter:{ products, cartId: 'Regular' }});
            products = products.map((o) => { return { id: o.id, name: o.name, price: o.FinalPrice / 10, src: o.srcs[0], inStock: true, sku: o.defaultVariant ? o.defaultVariant.code : o.code } });
            return { result: products }
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
            let {cardCode} = userInfo;
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
    return {
        v_getProducts(){
            let response = {
                "data": {
                    "data": {
                        "pageNumber": 1,
                        "pageSize": 20,
                        "totalPages": 42,
                        "totalRecords": 835,
                        "result": [
                            {
                                "id": 17750,
                                "name": "16A - تبدیل 3 به 2",
                                "description": "<div class=\"chat-history-scroll-container ng-tns-c2363718026-2 show-bottom-shadow ng-trigger ng-trigger-resetChat\">\r\n<div class=\"conversation-container ng-tns-c2363718026-2 ng-star-inserted\">\r\n<div class=\"ng-tns-c1540624679-698\">\r\n<div class=\"response-container ng-tns-c1684728538-699 response-container-has-multiple-responses\">\r\n<div class=\"presented-response-container ng-tns-c1684728538-699\">\r\n<div class=\"response-container-content ng-tns-c1684728538-699\">\r\n<div class=\"response-content ng-trigger ng-trigger-responsePopulation ng-tns-c1684728538-699 ng-animate-disabled\">\r\n<div class=\"markdown markdown-main-panel\" dir=\"rtl\">\r\n<p data-sourcepos=\"3:1-3:17\"><strong>موارد استفاده</strong></p>\r\n<p data-sourcepos=\"5:1-5:313\">تبدیل 3 به 2 امگا یک محصول کاربردی برای اتصال دو دستگاه الکترونیکی به یک پریز برق است. این تبدیل از یک سو دارای سه شاخه برق استاندارد ایرانی است و از سوی دیگر دارای دو شاخه برق استاندارد اروپایی است. این تبدیل برای استفاده در سفرهای خارجی یا برای استفاده از دستگاه&zwnj;های الکترونیکی اروپایی در ایران بسیار مناسب است.</p>\r\n<p data-sourcepos=\"9:1-9:294\">شرکت امگا یکی از تولیدکنندگان پیشرو لوازم برقی در ایران است. این شرکت با بیش از 50 سال تجربه در زمینه تولید لوازم برقی، محصولاتی با کیفیت و با دوام تولید می&zwnj;کند. تبدیل 3 به 2 امگا یکی از محصولات باکیفیت این شرکت است که با استفاده از مواد اولیه مرغوب و با رعایت استانداردهای ایمنی تولید شده است.</p>\r\n<p data-sourcepos=\"11:1-11:18\"><strong>مزایای استفاده</strong></p>\r\n<p data-sourcepos=\"13:1-13:37\">تبدیل 3 به 2 امگا مزایای زیر را دارد:</p>\r\n<ul data-sourcepos=\"15:1-21:0\">\r\n<li data-sourcepos=\"15:1-15:49\">امکان اتصال دو دستگاه الکترونیکی به یک پریز برق</li>\r\n<li data-sourcepos=\"16:1-16:36\">مناسب برای استفاده در سفرهای خارجی</li>\r\n<li data-sourcepos=\"17:1-17:62\">مناسب برای استفاده از دستگاه&zwnj;های الکترونیکی اروپایی در ایران</li>\r\n<li data-sourcepos=\"18:1-18:24\">کیفیت بالا و دوام بالا</li>\r\n<li data-sourcepos=\"19:1-19:42\">تولید شده با استفاده از مواد اولیه مرغوب</li>\r\n<li data-sourcepos=\"20:1-21:0\">رعایت استانداردهای ایمنی</li>\r\n</ul>\r\n<p data-sourcepos=\"24:1-24:64\">برای استفاده ایمن از تبدیل 3 به 2 امگا، موارد زیر را رعایت کنید:</p>\r\n<ul data-sourcepos=\"26:1-30:0\">\r\n<li data-sourcepos=\"26:1-26:61\">از تبدیل برای اتصال دستگاه&zwnj;هایی با توان بالا استفاده نکنید.</li>\r\n<li data-sourcepos=\"27:1-27:50\">از تبدیل در محیط&zwnj;های مرطوب یا خیس استفاده نکنید.</li>\r\n<li data-sourcepos=\"28:1-28:49\">از تبدیل در دماهای بالا یا پایین استفاده نکنید.</li>\r\n<li data-sourcepos=\"29:1-30:0\">از تبدیل در معرض مستقیم نور خورشید قرار ندهید.</li>\r\n</ul>\r\n<p data-sourcepos=\"37:1-37:273\">&nbsp;</p>\r\n</div>\r\n</div>\r\n</div>\r\n</div>\r\n</div>\r\n</div>\r\n</div>\r\n</div>",
                                "variants": [
                                    {
                                        "base_id": 34718,
                                        "id": "OMPX0019",
                                        "inStock": "Infinity",
                                        "price": "185000.0",
                                        "keys": [
                                            10645
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 34717,
                                        "id": "",
                                        "inStock": "0",
                                        "price": "185000.0",
                                        "keys": [],
                                        "images": [
                                            {
                                                "id": 22111,
                                                "styles": [
                                                    {
                                                        "height": 870,
                                                        "width": 650,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBak9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--768390ed8ef2099897f5b8a22ae0882f8e7b1754/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJOVEI0T0Rjd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--9d99bfcc52d0a1897dd97b07bffc02efbde44a2b/OMPX0557_a.jpg"
                                                    },
                                                    {
                                                        "height": 371,
                                                        "width": 278,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBak9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--768390ed8ef2099897f5b8a22ae0882f8e7b1754/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMHlOemg0TXpjeFBnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--64b14f523be50f7476123b6d541a38b24837d871/OMPX0557_a.jpg"
                                                    },
                                                    {
                                                        "height": 600,
                                                        "width": 600,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBak9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--768390ed8ef2099897f5b8a22ae0882f8e7b1754/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/OMPX0557_a.jpg"
                                                    },
                                                    {
                                                        "height": 371,
                                                        "width": 278,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBak9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--768390ed8ef2099897f5b8a22ae0882f8e7b1754/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMHlOemg0TXpjeFBnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--64b14f523be50f7476123b6d541a38b24837d871/OMPX0557_a.jpg"
                                                    },
                                                    {
                                                        "height": 297,
                                                        "width": 222,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBak9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--768390ed8ef2099897f5b8a22ae0882f8e7b1754/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMHlNako0TWprM1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--73aa0d5baaa5bb6622b3df722e8276359aa0f6dd/OMPX0557_a.jpg"
                                                    },
                                                    {
                                                        "height": 468,
                                                        "width": 350,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBak9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--768390ed8ef2099897f5b8a22ae0882f8e7b1754/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMHpOVEI0TkRZNFBnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--549ca421774c56b66e5355327eeaa8dd2d3d2f76/OMPX0557_a.jpg"
                                                    },
                                                    {
                                                        "height": 340,
                                                        "width": 254,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBak9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--768390ed8ef2099897f5b8a22ae0882f8e7b1754/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMHlOVFI0TXpRd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--2149fe8b40080437ff5cc3147f62f608cfef49a1/OMPX0557_a.jpg"
                                                    },
                                                    {
                                                        "height": 600,
                                                        "width": 448,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBak9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--768390ed8ef2099897f5b8a22ae0882f8e7b1754/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDBORGg0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--33bf1b5e3d1117fb133b0a48c3416c49a0cc870d/OMPX0557_a.jpg"
                                                    },
                                                    {
                                                        "height": 200,
                                                        "width": 160,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBak9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--768390ed8ef2099897f5b8a22ae0882f8e7b1754/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMHhOakI0TWpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--34355f8547d5104466da9ba10360fa977bb7121f/OMPX0557_a.jpg"
                                                    },
                                                    {
                                                        "height": 240,
                                                        "width": 240,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBak9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--768390ed8ef2099897f5b8a22ae0882f8e7b1754/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMHlOREI0TWpRd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--32f5850d7079b1e01877ade69790fcb82531b648/OMPX0557_a.jpg"
                                                    },
                                                    {
                                                        "height": 100,
                                                        "width": 100,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBak9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--768390ed8ef2099897f5b8a22ae0882f8e7b1754/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMHhNREI0TVRBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--541f9eb5aca281fd8a7bf356092299654af8e92e/OMPX0557_a.jpg"
                                                    },
                                                    {
                                                        "height": 48,
                                                        "width": 48,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBak9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--768390ed8ef2099897f5b8a22ae0882f8e7b1754/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnczBPSGcwT0Q0R093WlVPZ3RsZUhSbGJuUkFDRG9QWW1GamEyZHliM1Z1WkVraUNYTm9iM2NHT3daVU9neHhkV0ZzYVhSNWFWVT0iLCJleHAiOm51bGwsInB1ciI6InZhcmlhdGlvbiJ9fQ==--8bb3ed9a09345618b7b48cd911403af9c9ae788e/OMPX0557_a.jpg"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ],
                                "images": [
                                    {
                                        "id": 22111,
                                        "styles": [
                                            {
                                                "height": 600,"width": 600,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBak9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--768390ed8ef2099897f5b8a22ae0882f8e7b1754/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/OMPX0557_a.jpg"
                                            }
                                        ]
                                    }
                                ],
                                "optionTypes": [
                                    {
                                        "id": 1,"name": "brand",
                                        "optioValues": [
                                            {"id": 10645,"name": "امگا"}
                                        ]
                                    }
                                ],
                                "optioValues": [],
                                "properties": [
                                    {
                                        "key": "ولتاژ خروجی",
                                        "value": "250"
                                    },
                                    {
                                        "key": "ولتاژ ورودی",
                                        "value": "220"
                                    },
                                    {
                                        "key": "ابعاد",
                                        "value": "4x3x3"
                                    },
                                    {
                                        "key": "جریان خروجی",
                                        "value": "10"
                                    },
                                    {
                                        "key": "توضیحات",
                                        "value": "مبدل برق 3 پین به 2 پین مناسب برای وسایل صوتی و تصویری و همچنین شارژر گوشی های موبایل و تبلت"
                                    },
                                    {
                                        "key": "تعداد پورت ",
                                        "value": "یک عدد"
                                    },
                                    {
                                        "key": "وزن",
                                        "value": "50 گرم"
                                    }
                                ]
                            },
                            {
                                "id": 17708,
                                "name": "  محافظ 6 خانه سیم دار  5متری امگا مدل P6000 بدون ارت",
                                "description": "<p data-sourcepos=\"5:1-5:365\">محافظ برق یکی از مهم&zwnj;ترین لوازم جانبی برای تجهیزات الکترونیکی است. این وسیله از آسیب دیدن دستگاه&zwnj;های الکترونیکی در برابر نوسانات برق، اضافه بار و سایر مشکلات احتمالی جلوگیری می&zwnj;کند. محافظ برق 6 خانه سیم دار امگا مدل P6000 بدون ارت یکی از بهترین گزینه&zwnj;های موجود در بازار است که با ویژگی&zwnj;های منحصر به فرد خود، می&zwnj;تواند از دستگاه&zwnj;های الکترونیکی شما به خوبی محافظت کند.</p>\r\n<p data-sourcepos=\"7:1-7:19\"><strong>ویژگی&zwnj;های کلیدی</strong></p>\r\n<ul data-sourcepos=\"9:1-13:0\">\r\n<li data-sourcepos=\"9:1-9:139\"><strong>طول کابل 5 متری:</strong>&nbsp;این محافظ برق با طول کابل 5 متری، امکان اتصال دستگاه&zwnj;های الکترونیکی در دورترین نقطه خانه یا محل کار را فراهم می&zwnj;کند.</li>\r\n<li data-sourcepos=\"10:1-10:89\"><strong>3 نشانگر LED:</strong>&nbsp;نشانگرهای LED روی بدنه محافظ، وضعیت دستگاه را به کاربر اطلاع می&zwnj;دهند.</li>\r\n<li data-sourcepos=\"11:1-11:142\"><strong>محافظت در برابر نوسانات برق:</strong>&nbsp;این محافظ برق از دستگاه&zwnj;های الکترونیکی در برابر نوسانات برق، اضافه بار و سایر مشکلات احتمالی محافظت می&zwnj;کند.</li>\r\n<li data-sourcepos=\"12:1-13:0\"><strong>6 پریز برق:</strong>&nbsp;این محافظ برق دارای 6 پریز برق است که امکان اتصال 6 دستگاه مختلف را به آن فراهم می&zwnj;کند.</li>\r\n</ul>\r\n<p data-sourcepos=\"23:1-23:16\"><strong>طراحی و ساخت</strong></p>\r\n<p data-sourcepos=\"25:1-25:172\">محافظ برق 6 خانه سیم دار امگا مدل P6000 بدون ارت دارای طراحی ساده و شیکی است. این محافظ از پلاستیک با کیفیت ساخته شده است و مقاومت بالایی در برابر ضربه و سایر آسیب&zwnj;ها دارد.</p>\r\n<p data-sourcepos=\"27:1-27:16\"><strong>نحوه استفاده</strong></p>\r\n<p data-sourcepos=\"29:1-29:164\">برای استفاده از محافظ برق 6 خانه سیم دار امگا مدل P6000 بدون ارت، ابتدا سیم برق را به پریز برق وصل کنید. سپس دستگاه&zwnj;های الکترونیکی خود را به پریزهای محافظ وصل کنید.</p>\r\n<p data-sourcepos=\"33:1-33:317\">محافظ برق 6 خانه سیم دار امگا مدل P6000 بدون ارت یک محصول با کیفیت و مقرون به صرفه است که می&zwnj;تواند از دستگاه&zwnj;های الکترونیکی شما به خوبی محافظت کند. این محافظ برق دارای ویژگی&zwnj;های منحصر به فردی مانند طول کابل 5 متری، 3 نشانگر LED و محافظت در برابر نوسانات برق است که آن را به یک گزینه ایده&zwnj;آل برای کاربران تبدیل می&zwnj;کند.</p>",
                                "variants": [
                                    {
                                        "base_id": 34578,
                                        "id": "  ZNOMPX6753",
                                        "inStock": "0",
                                        "price": "2900000.0",
                                        "keys": [
                                            10645
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 34577,
                                        "id": "",
                                        "inStock": "0",
                                        "price": "2900000.0",
                                        "keys": [],
                                        "images": [
                                            {
                                                "id": 22017,
                                                "styles": [
                                                    {
                                                        "height": 600,
                                                        "width": 600,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ZNOMPX6753_a.jpg"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ],
                                "images": [
                                    {
                                        "id": 22017,
                                        "styles": [
                                            {
                                                "height": 600,
                                                "width": 600,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ZNOMPX6753_a.jpg"
                                            }
                                        ]
                                    }
                                ],
                                "optionTypes": [
                                    {
                                        "id": 10003,
                                        "name": "tolsim",
                                        "optioValues": []
                                    },
                                    {
                                        "id": 1,
                                        "name": "brand",
                                        "optioValues": [
                                            {
                                                "id": 10645,
                                                "name": "امگا"
                                            }
                                        ]
                                    }
                                ],
                                "optioValues": [],
                                "properties": [
                                    {
                                        "key": "رنگ",
                                        "value": "سفید"
                                    },
                                    {
                                        "key": "تعداد پورت یو اس بی",
                                        "value": "ندارد"
                                    },
                                    {
                                        "key": "توان",
                                        "value": "2500 ولت آمپر"
                                    },
                                    {
                                        "key": "تعداد پریز",
                                        "value": "6"
                                    },
                                    {
                                        "key": "بدون ارت",
                                        "value": "بدون ارت"
                                    },
                                    {
                                        "key": "توضیحات",
                                        "value": "پریز دارای 3 پریز گرد 45 درجه"
                                    },
                                    {
                                        "key": "نشانگر ال ای دی",
                                        "value": "دارد"
                                    }
                                ]
                            },
                            {
                                "id": 17704,
                                "name": " محافظ 6 خانه سیم دار 3 متری امگا مدل P6000 بدون ارت",
                                "description": "<p data-sourcepos=\"5:1-5:365\">محافظ برق یکی از مهم&zwnj;ترین لوازم جانبی برای تجهیزات الکترونیکی است. این وسیله از آسیب دیدن دستگاه&zwnj;های الکترونیکی در برابر نوسانات برق، اضافه بار و سایر مشکلات احتمالی جلوگیری می&zwnj;کند. محافظ برق 6 خانه سیم دار امگا مدل P6000 بدون ارت یکی از بهترین گزینه&zwnj;های موجود در بازار است که با ویژگی&zwnj;های منحصر به فرد خود، می&zwnj;تواند از دستگاه&zwnj;های الکترونیکی شما به خوبی محافظت کند.</p>\r\n<p data-sourcepos=\"7:1-7:19\"><strong>ویژگی&zwnj;های کلیدی</strong></p>\r\n<ul data-sourcepos=\"9:1-13:0\">\r\n<li data-sourcepos=\"9:1-9:139\"><strong>طول کابل 5 متری:</strong>&nbsp;این محافظ برق با طول کابل 5 متری، امکان اتصال دستگاه&zwnj;های الکترونیکی در دورترین نقطه خانه یا محل کار را فراهم می&zwnj;کند.</li>\r\n<li data-sourcepos=\"10:1-10:89\"><strong>3 نشانگر LED:</strong>&nbsp;نشانگرهای LED روی بدنه محافظ، وضعیت دستگاه را به کاربر اطلاع می&zwnj;دهند.</li>\r\n<li data-sourcepos=\"11:1-11:142\"><strong>محافظت در برابر نوسانات برق:</strong>&nbsp;این محافظ برق از دستگاه&zwnj;های الکترونیکی در برابر نوسانات برق، اضافه بار و سایر مشکلات احتمالی محافظت می&zwnj;کند.</li>\r\n<li data-sourcepos=\"12:1-13:0\"><strong>6 پریز برق:</strong>&nbsp;این محافظ برق دارای 6 پریز برق است که امکان اتصال 6 دستگاه مختلف را به آن فراهم می&zwnj;کند.</li>\r\n</ul>\r\n<p data-sourcepos=\"23:1-23:16\"><strong>طراحی و ساخت</strong></p>\r\n<p data-sourcepos=\"25:1-25:172\">محافظ برق 6 خانه سیم دار امگا مدل P6000 بدون ارت دارای طراحی ساده و شیکی است. این محافظ از پلاستیک با کیفیت ساخته شده است و مقاومت بالایی در برابر ضربه و سایر آسیب&zwnj;ها دارد.</p>\r\n<p data-sourcepos=\"27:1-27:16\"><strong>نحوه استفاده</strong></p>\r\n<p data-sourcepos=\"29:1-29:164\">برای استفاده از محافظ برق 6 خانه سیم دار امگا مدل P6000 بدون ارت، ابتدا سیم برق را به پریز برق وصل کنید. سپس دستگاه&zwnj;های الکترونیکی خود را به پریزهای محافظ وصل کنید.</p>\r\n<p data-sourcepos=\"33:1-33:317\">محافظ برق 6 خانه سیم دار امگا مدل P6000 بدون ارت یک محصول با کیفیت و مقرون به صرفه است که می&zwnj;تواند از دستگاه&zwnj;های الکترونیکی شما به خوبی محافظت کند. این محافظ برق دارای ویژگی&zwnj;های منحصر به فردی مانند طول کابل 5 متری، 3 نشانگر LED و محافظت در برابر نوسانات برق است که آن را به یک گزینه ایده&zwnj;آل برای کاربران تبدیل می&zwnj;کند.</p>",
                                "variants": [
                                    {
                                        "base_id": 34566,
                                        "id": " ZNOMPX6752",
                                        "inStock": "0",
                                        "price": "2900000.0",
                                        "keys": [
                                            10645
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 34564,
                                        "id": "",
                                        "inStock": "0",
                                        "price": "2900000.0",
                                        "keys": [],
                                        "images": [
                                            {
                                                "id": 22009,
                                                "styles": [
                                                    {
                                                        "height": 870,
                                                        "width": 650,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJOVEI0T0Rjd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--9d99bfcc52d0a1897dd97b07bffc02efbde44a2b/ZNOMPX6753_a.jpg"
                                                    },
                                                    {
                                                        "height": 371,
                                                        "width": 278,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMHlOemg0TXpjeFBnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--64b14f523be50f7476123b6d541a38b24837d871/ZNOMPX6753_a.jpg"
                                                    },
                                                    {
                                                        "height": 600,
                                                        "width": 600,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ZNOMPX6753_a.jpg"
                                                    },
                                                    {
                                                        "height": 371,
                                                        "width": 278,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMHlOemg0TXpjeFBnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--64b14f523be50f7476123b6d541a38b24837d871/ZNOMPX6753_a.jpg"
                                                    },
                                                    {
                                                        "height": 297,
                                                        "width": 222,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMHlNako0TWprM1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--73aa0d5baaa5bb6622b3df722e8276359aa0f6dd/ZNOMPX6753_a.jpg"
                                                    },
                                                    {
                                                        "height": 468,
                                                        "width": 350,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMHpOVEI0TkRZNFBnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--549ca421774c56b66e5355327eeaa8dd2d3d2f76/ZNOMPX6753_a.jpg"
                                                    },
                                                    {
                                                        "height": 340,
                                                        "width": 254,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMHlOVFI0TXpRd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--2149fe8b40080437ff5cc3147f62f608cfef49a1/ZNOMPX6753_a.jpg"
                                                    },
                                                    {
                                                        "height": 600,
                                                        "width": 448,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDBORGg0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--33bf1b5e3d1117fb133b0a48c3416c49a0cc870d/ZNOMPX6753_a.jpg"
                                                    },
                                                    {
                                                        "height": 200,
                                                        "width": 160,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMHhOakI0TWpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--34355f8547d5104466da9ba10360fa977bb7121f/ZNOMPX6753_a.jpg"
                                                    },
                                                    {
                                                        "height": 240,
                                                        "width": 240,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMHlOREI0TWpRd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--32f5850d7079b1e01877ade69790fcb82531b648/ZNOMPX6753_a.jpg"
                                                    },
                                                    {
                                                        "height": 100,
                                                        "width": 100,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMHhNREI0TVRBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--541f9eb5aca281fd8a7bf356092299654af8e92e/ZNOMPX6753_a.jpg"
                                                    },
                                                    {
                                                        "height": 48,
                                                        "width": 48,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnczBPSGcwT0Q0R093WlVPZ3RsZUhSbGJuUkFDRG9QWW1GamEyZHliM1Z1WkVraUNYTm9iM2NHT3daVU9neHhkV0ZzYVhSNWFWVT0iLCJleHAiOm51bGwsInB1ciI6InZhcmlhdGlvbiJ9fQ==--8bb3ed9a09345618b7b48cd911403af9c9ae788e/ZNOMPX6753_a.jpg"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ],
                                "images": [
                                    {
                                        "id": 22009,
                                        "styles": [
                                            {
                                                "height": 870,
                                                "width": 650,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJOVEI0T0Rjd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--9d99bfcc52d0a1897dd97b07bffc02efbde44a2b/ZNOMPX6753_a.jpg"
                                            },
                                            {
                                                "height": 371,
                                                "width": 278,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMHlOemg0TXpjeFBnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--64b14f523be50f7476123b6d541a38b24837d871/ZNOMPX6753_a.jpg"
                                            },
                                            {
                                                "height": 600,
                                                "width": 600,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ZNOMPX6753_a.jpg"
                                            },
                                            {
                                                "height": 371,
                                                "width": 278,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMHlOemg0TXpjeFBnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--64b14f523be50f7476123b6d541a38b24837d871/ZNOMPX6753_a.jpg"
                                            },
                                            {
                                                "height": 297,
                                                "width": 222,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMHlNako0TWprM1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--73aa0d5baaa5bb6622b3df722e8276359aa0f6dd/ZNOMPX6753_a.jpg"
                                            },
                                            {
                                                "height": 468,
                                                "width": 350,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMHpOVEI0TkRZNFBnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--549ca421774c56b66e5355327eeaa8dd2d3d2f76/ZNOMPX6753_a.jpg"
                                            },
                                            {
                                                "height": 340,
                                                "width": 254,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMHlOVFI0TXpRd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--2149fe8b40080437ff5cc3147f62f608cfef49a1/ZNOMPX6753_a.jpg"
                                            },
                                            {
                                                "height": 600,
                                                "width": 448,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDBORGg0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--33bf1b5e3d1117fb133b0a48c3416c49a0cc870d/ZNOMPX6753_a.jpg"
                                            },
                                            {
                                                "height": 200,
                                                "width": 160,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMHhOakI0TWpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--34355f8547d5104466da9ba10360fa977bb7121f/ZNOMPX6753_a.jpg"
                                            },
                                            {
                                                "height": 240,
                                                "width": 240,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMHlOREI0TWpRd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--32f5850d7079b1e01877ade69790fcb82531b648/ZNOMPX6753_a.jpg"
                                            },
                                            {
                                                "height": 100,
                                                "width": 100,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMHhNREI0TVRBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--541f9eb5aca281fd8a7bf356092299654af8e92e/ZNOMPX6753_a.jpg"
                                            },
                                            {
                                                "height": 48,
                                                "width": 48,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbE9pIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6c45cb96cd08e92202b726ca89c77b896669a08b/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnczBPSGcwT0Q0R093WlVPZ3RsZUhSbGJuUkFDRG9QWW1GamEyZHliM1Z1WkVraUNYTm9iM2NHT3daVU9neHhkV0ZzYVhSNWFWVT0iLCJleHAiOm51bGwsInB1ciI6InZhcmlhdGlvbiJ9fQ==--8bb3ed9a09345618b7b48cd911403af9c9ae788e/ZNOMPX6753_a.jpg"
                                            }
                                        ]
                                    }
                                ],
                                "optionTypes": [
                                    {
                                        "id": 10003,
                                        "name": "tolsim",
                                        "optioValues": []
                                    },
                                    {
                                        "id": 1,
                                        "name": "brand",
                                        "optioValues": [
                                            {
                                                "id": 10645,
                                                "name": "امگا"
                                            }
                                        ]
                                    }
                                ],
                                "optioValues": [],
                                "properties": [
                                    {
                                        "key": "رنگ",
                                        "value": "سفید"
                                    },
                                    {
                                        "key": "تعداد پورت یو اس بی",
                                        "value": "ندارد"
                                    },
                                    {
                                        "key": "توان",
                                        "value": "2500 ولت آمپر"
                                    },
                                    {
                                        "key": "تعداد پریز",
                                        "value": "6"
                                    },
                                    {
                                        "key": "بدون ارت",
                                        "value": "بدون ارت"
                                    },
                                    {
                                        "key": "توضیحات",
                                        "value": "پریز دارای 3 پریز گرد 45 درجه"
                                    },
                                    {
                                        "key": "نشانگر ال ای دی",
                                        "value": "دارد"
                                    }
                                ]
                            },
                            {
                                "id": 17666,
                                "name": "چند راهی برق 1.8 متری نماد کنترل",
                                "description": "<p data-sourcepos=\"14:1-14:248\">چند راهی برق نماد کنترل یکی از پرکاربردترین تجهیزات برقی است که برای اتصال چندین دستگاه برقی به یک پریز برق استفاده می&zwnj;شود. این دستگاه دارای یک یا چند پریز برق بوده و به وسیله یک کلید یا یک سوییچ، جریان برق را به هر یک از پریزها متصل یا قطع می&zwnj;کند.</p>\r\n<p data-sourcepos=\"16:1-16:33\"><strong>انواع چند راهی برق نماد کنترل</strong></p>\r\n<p data-sourcepos=\"18:1-18:105\">چند راهی برق نماد کنترل از نظر تعداد پریز برق، نوع کلید یا سوییچ و جنس بدنه به انواع مختلفی تقسیم می&zwnj;شود.</p>\r\n<ul data-sourcepos=\"20:1-23:0\">\r\n<li data-sourcepos=\"20:1-20:112\"><strong>از نظر تعداد پریز برق:</strong>&nbsp;چند راهی برق نماد کنترل می&zwnj;تواند دارای یک، دو، سه، چهار، شش و یا هشت پریز برق باشد.</li>\r\n<li data-sourcepos=\"21:1-21:112\"><strong>از نظر نوع کلید یا سوییچ:</strong>&nbsp;چند راهی برق نماد کنترل می&zwnj;تواند دارای کلید یا سوییچ مکانیکی یا سوییچ لمسی باشد.</li>\r\n<li data-sourcepos=\"22:1-23:0\"><strong>از نظر جنس بدنه:</strong>&nbsp;چند راهی برق نماد کنترل می&zwnj;تواند از جنس پلاستیک، فلز یا ترکیبی از این دو باشد.</li>\r\n</ul>\r\n<p data-sourcepos=\"24:1-24:48\"><strong>عوامل موثر در انتخاب چند راهی برق نماد کنترل</strong></p>\r\n<p data-sourcepos=\"26:1-26:154\">در هنگام انتخاب چند راهی برق نماد کنترل، عوامل مختلفی باید مورد توجه قرار گیرند. برخی از مهم&zwnj;ترین عوامل موثر در انتخاب چند راهی برق نماد کنترل عبارتند از:</p>\r\n<ul data-sourcepos=\"28:1-31:0\">\r\n<li data-sourcepos=\"28:1-28:75\"><strong>تعداد پریز برق:</strong>&nbsp;تعداد پریز برق چند راهی باید متناسب با نیاز شما باشد.</li>\r\n<li data-sourcepos=\"29:1-29:169\"><strong>نوع کلید یا سوییچ:</strong>&nbsp;اگر می&zwnj;خواهید بتوانید به صورت جداگانه جریان برق هر یک از پریزها را کنترل کنید، باید از چند راهی برق نماد کنترل دارای کلید یا سوییچ استفاده کنید.</li>\r\n<li data-sourcepos=\"30:1-31:0\"><strong>جنس بدنه:</strong>&nbsp;جنس بدنه چند راهی برق نماد کنترل باید متناسب با محیطی باشد که قرار است در آن استفاده شود.</li>\r\n</ul>\r\n<p data-sourcepos=\"32:1-32:44\"><strong>نکات مهم در خرید چند راهی برق نماد کنترل</strong></p>\r\n<p data-sourcepos=\"34:1-34:66\">در هنگام خرید چند راهی برق نماد کنترل، توجه به نکات زیر ضروری است:</p>\r\n<ul data-sourcepos=\"36:1-40:0\">\r\n<li data-sourcepos=\"36:1-36:79\"><strong>مطمئن شوید که چند راهی برق نماد کنترل دارای استانداردهای ایمنی لازم باشد.</strong></li>\r\n<li data-sourcepos=\"37:1-37:48\"><strong>به توان چند راهی برق نماد کنترل توجه کنید.</strong></li>\r\n<li data-sourcepos=\"38:1-38:52\"><strong>به جنس بدنه چند راهی برق نماد کنترل توجه کنید.</strong></li>\r\n<li data-sourcepos=\"39:1-40:0\"><strong>به قیمت چند راهی برق نماد کنترل توجه کنید.</strong></li>\r\n</ul>\r\n<p data-sourcepos=\"41:1-41:43\"><strong>نحوه استفاده از چند راهی برق نماد کنترل</strong></p>\r\n<p data-sourcepos=\"43:1-43:156\">برای استفاده از چند راهی برق نماد کنترل، کافی است پریزهای برق دستگاه&zwnj;های مورد نظر را به پریزهای چند راهی وصل کرده و سپس کلید یا سوییچ چند راهی را روشن کنید.</p>\r\n<p data-sourcepos=\"47:1-47:355\">چند راهی برق نماد کنترل یک وسیله کاربردی و ضروری است که می&zwnj;تواند به شما در مدیریت مصرف برق و جلوگیری از آسیب دیدن دستگاه&zwnj;های برقی کمک کند. در هنگام خرید چند راهی برق نماد کنترل، توجه به عوامل موثر در انتخاب چند راهی برق نماد کنترل و نکات مهم در خرید چند راهی برق نماد کنترل ضروری است تا بتوانید یک چند راهی برق نماد کنترل با کیفیت و مناسب را خریداری کنید.</p>",
                                "variants": [
                                    {
                                        "base_id": 34288,
                                        "id": "ELNCPX064",
                                        "inStock": "Infinity",
                                        "price": "1750000.0",
                                        "keys": [
                                            10016
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 34286,
                                        "id": "",
                                        "inStock": "0",
                                        "price": "1750000.0",
                                        "keys": [],
                                        "images": [
                                            {
                                                "id": 21550,
                                                "styles": [
                                                    {
                                                        "height": 600,
                                                        "width": 600,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaHVzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--e13819360198b303936ee89cc6ca61c7b9f47368/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ELNCPX065_a.jpg"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ],
                                "images": [
                                    {
                                        "id": 21550,
                                        "styles": [
                                            {
                                                "height": 600,
                                                "width": 600,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaHVzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--e13819360198b303936ee89cc6ca61c7b9f47368/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ELNCPX065_a.jpg"
                                            }
                                        ]
                                    }
                                ],
                                "optionTypes": [
                                    {
                                        "id": 10003,
                                        "name": "tolsim",
                                        "optioValues": [
                                            {
                                                "id": 10016,
                                                "name": "1.8metri"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 1,
                                        "name": "brand",
                                        "optioValues": []
                                    }
                                ],
                                "optioValues": [],
                                "properties": [{"key": "حداقل ولتاژ برای قطع شدن جریان","value": "170 ولت"},{"key": "حداکثر ولتاژ برای قطع شدن جریان","value": "250 ولت"}]
                            },
                            {
                                "id": 17665,
                                "name": "محافظ ولتاژ و چندراهی 5 خانه 1.8متری  نماد کنترل مدل A2002",
                                "description": "<p data-sourcepos=\"14:1-14:274\">نوسانات برق شهری یکی از مهم&zwnj;ترین عوامل آسیب به لوازم برقی است. این نوسانات می&zwnj;توانند باعث سوختن بردهای الکترونیکی، آسیب به قطعات داخلی و حتی آتش&zwnj;سوزی شوند. محافظ ولتاژ و چند راهی نماد کنترل یک دستگاه کاربردی است که می&zwnj;تواند از لوازم برقی شما در برابر این نوسانات محافظت کند.</p>\r\n<p data-sourcepos=\"16:1-16:49\"><strong>نحوه عملکرد محافظ ولتاژ و چند راهی نماد کنترل</strong></p>\r\n<p data-sourcepos=\"18:1-18:211\">محافظ ولتاژ و چند راهی نماد کنترل از یک مدار الکترونیکی استفاده می&zwnj;کند تا ولتاژ ورودی را به میزان مشخصی تثبیت کند. این کار از آسیب دیدن لوازم برقی در برابر ولتاژ بالا، ولتاژ پایین و نوسانات ولتاژ جلوگیری می&zwnj;کند.</p>\r\n<p data-sourcepos=\"20:1-20:44\"><strong>مزایای محافظ ولتاژ و چند راهی نماد کنترل</strong></p>\r\n<p data-sourcepos=\"22:1-22:72\">محافظ ولتاژ و چند راهی نماد کنترل دارای مزایای متعددی است که عبارتند از:</p>\r\n<ul data-sourcepos=\"24:1-29:0\">\r\n<li data-sourcepos=\"24:1-24:46\"><strong>حفاظت از لوازم برقی در برابر نوسانات برق</strong></li>\r\n<li data-sourcepos=\"25:1-25:31\"><strong>افزایش طول عمر لوازم برقی</strong></li>\r\n<li data-sourcepos=\"26:1-26:25\"><strong>جلوگیری از آتش&zwnj;سوزی</strong></li>\r\n<li data-sourcepos=\"27:1-27:24\"><strong>دارای 5 پورت خروجی</strong></li>\r\n<li data-sourcepos=\"28:1-29:0\"><strong>طول کابل 1.8 متر</strong></li>\r\n</ul>\r\n<p data-sourcepos=\"32:1-32:134\">&nbsp;</p>\r\n<p data-sourcepos=\"34:1-34:53\"><strong>نحوه استفاده از محافظ ولتاژ و چند راهی نماد کنترل</strong></p>\r\n<p data-sourcepos=\"36:1-36:155\">برای استفاده از محافظ ولتاژ و چند راهی نماد کنترل، کافی است سیم برق لوازم برقی خود را به پورت&zwnj;های خروجی محافظ وصل کنید. سپس، محافظ را به پریز برق وصل کنید.</p>\r\n<p data-sourcepos=\"40:1-40:191\">محافظ ولتاژ و چند راهی نماد کنترل یک وسیله کاربردی و ضروری است که می&zwnj;تواند از لوازم برقی شما در برابر نوسانات برق محافظت کند. این محافظ دارای مزایای متعددی است و استفاده از آن بسیار آسان است.</p>",
                                "variants": [
                                    {
                                        "base_id": 34285,
                                        "id": "ELNCPX1061",
                                        "inStock": "Infinity",
                                        "price": "2600000.0",
                                        "keys": [
                                            10016
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 34282,
                                        "id": "",
                                        "inStock": "0",
                                        "price": "2600000.0",
                                        "keys": [],
                                        "images": [
                                            {
                                                "id": 21549,
                                                "styles": [
                                                    {
                                                        "height": 600,
                                                        "width": 600,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaHlzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--2242d604cd21bdd215e4b0b1eb15e2f8141a13bd/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ELNCPX1061_a.jpg"
                                                    }
                                                ]
                                            },
                                            {
                                                "id": 21548,
                                                "styles": [
                                                    {
                                                        "height": 600,
                                                        "width": 600,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBcEdkIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--f5f1e32a0a924067e3b8c4c865fb917ec6c133bb/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ELNCPX1061_a.jpg"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ],
                                "images": [
                                    {
                                        "id": 21549,
                                        "styles": [
                                            {
                                                "height": 600,
                                                "width": 600,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaHlzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--2242d604cd21bdd215e4b0b1eb15e2f8141a13bd/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ELNCPX1061_a.jpg"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 21548,
                                        "styles": [
                                            {
                                                "height": 600,
                                                "width": 600,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBcEdkIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--f5f1e32a0a924067e3b8c4c865fb917ec6c133bb/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ELNCPX1061_a.jpg"
                                            }
                                        ]
                                    }
                                ],
                                "optionTypes": [
                                    {
                                        "id": 10003,
                                        "name": "tolsim",
                                        "optioValues": [
                                            {
                                                "id": 10016,
                                                "name": "1.8metri"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 1,
                                        "name": "brand",
                                        "optioValues": []
                                    }
                                ],
                                "optioValues": [],
                                "properties": [{"key": "حداقل ولتاژ برای قطع شدن جریان","value": "170 ولت"},{"key": "حداکثر ولتاژ برای قطع شدن جریان","value": "250 ولت"}]
                            },
                            {
                                "id": 17664,
                                "name": "محافظ ولتاژ و چندراهی 5 خانه 3متری  نماد کنترل مدل A2002",
                                "description": "<p data-sourcepos=\"14:1-14:274\">نوسانات برق شهری یکی از مهم&zwnj;ترین عوامل آسیب به لوازم برقی است. این نوسانات می&zwnj;توانند باعث سوختن بردهای الکترونیکی، آسیب به قطعات داخلی و حتی آتش&zwnj;سوزی شوند. محافظ ولتاژ و چند راهی نماد کنترل یک دستگاه کاربردی است که می&zwnj;تواند از لوازم برقی شما در برابر این نوسانات محافظت کند.</p>\r\n<p data-sourcepos=\"16:1-16:49\"><strong>نحوه عملکرد محافظ ولتاژ و چند راهی نماد کنترل</strong></p>\r\n<p data-sourcepos=\"18:1-18:211\">محافظ ولتاژ و چند راهی نماد کنترل از یک مدار الکترونیکی استفاده می&zwnj;کند تا ولتاژ ورودی را به میزان مشخصی تثبیت کند. این کار از آسیب دیدن لوازم برقی در برابر ولتاژ بالا، ولتاژ پایین و نوسانات ولتاژ جلوگیری می&zwnj;کند.</p>\r\n<p data-sourcepos=\"20:1-20:44\"><strong>مزایای محافظ ولتاژ و چند راهی نماد کنترل</strong></p>\r\n<p data-sourcepos=\"22:1-22:72\">محافظ ولتاژ و چند راهی نماد کنترل دارای مزایای متعددی است که عبارتند از:</p>\r\n<ul data-sourcepos=\"24:1-29:0\">\r\n<li data-sourcepos=\"24:1-24:46\"><strong>حفاظت از لوازم برقی در برابر نوسانات برق</strong></li>\r\n<li data-sourcepos=\"25:1-25:31\"><strong>افزایش طول عمر لوازم برقی</strong></li>\r\n<li data-sourcepos=\"26:1-26:25\"><strong>جلوگیری از آتش&zwnj;سوزی</strong></li>\r\n<li data-sourcepos=\"27:1-27:24\"><strong>دارای 5 پورت خروجی</strong></li>\r\n<li data-sourcepos=\"28:1-29:0\"><strong>طول کابل 1.8 متر</strong></li>\r\n</ul>\r\n<p data-sourcepos=\"32:1-32:134\">&nbsp;</p>\r\n<p data-sourcepos=\"34:1-34:53\"><strong>نحوه استفاده از محافظ ولتاژ و چند راهی نماد کنترل</strong></p>\r\n<p data-sourcepos=\"36:1-36:155\">برای استفاده از محافظ ولتاژ و چند راهی نماد کنترل، کافی است سیم برق لوازم برقی خود را به پورت&zwnj;های خروجی محافظ وصل کنید. سپس، محافظ را به پریز برق وصل کنید.</p>\r\n<p data-sourcepos=\"40:1-40:191\">محافظ ولتاژ و چند راهی نماد کنترل یک وسیله کاربردی و ضروری است که می&zwnj;تواند از لوازم برقی شما در برابر نوسانات برق محافظت کند. این محافظ دارای مزایای متعددی است و استفاده از آن بسیار آسان است.</p>",
                                "variants": [
                                    {
                                        "base_id": 34284,
                                        "id": "ELNCPX1062",
                                        "inStock": "Infinity",
                                        "price": "2600000.0",
                                        "keys": [
                                            10015
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 34281,
                                        "id": "",
                                        "inStock": "0",
                                        "price": "2600000.0",
                                        "keys": [],
                                        "images": [
                                            {
                                                "id": 21547,
                                                "styles": [
                                                    {
                                                        "height": 600,
                                                        "width": 600,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaHlzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--2242d604cd21bdd215e4b0b1eb15e2f8141a13bd/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ELNCPX1061_a.jpg"
                                                    }
                                                ]
                                            },
                                            {
                                                "id": 21546,
                                                "styles": [
                                                    {
                                                        "height": 600,
                                                        "width": 600,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBcEdkIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--f5f1e32a0a924067e3b8c4c865fb917ec6c133bb/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ELNCPX1061_a.jpg"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ],
                                "images": [
                                    {
                                        "id": 21547,
                                        "styles": [
                                            {
                                                "height": 600,
                                                "width": 600,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaHlzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--2242d604cd21bdd215e4b0b1eb15e2f8141a13bd/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ELNCPX1061_a.jpg"
                                            }
                                        ]
                                    },
                                ],
                                "optionTypes": [
                                    {
                                        "id": 10003,
                                        "name": "tolsim",
                                        "optioValues": [
                                            {
                                                "id": 10015,
                                                "name": "3metri"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 1,
                                        "name": "brand",
                                        "optioValues": []
                                    }
                                ],
                                "optioValues": [],
                                "properties": [{"key": "حداقل ولتاژ برای قطع شدن جریان","value": "170 ولت"},{"key": "حداکثر ولتاژ برای قطع شدن جریان","value": "250 ولت"}]
                            },
                            {
                                "id": 17662,
                                "name": "محافظ ولتاژ 1.8متری پارت الکتریک مدل PE904",
                                "description": "<p><strong>محافظ برق پارت الکتریک مدل PE904</strong></p>\r\n<p><span style=\"font-weight: 400;\">محافظ برق پارت الکتریک مدل PE904 یک محافظ برق با کیفیت و کارآمد است که برای محافظت از دستگاه&zwnj;های الکتریکی شما در برابر نوسانات ولتاژ طراحی شده است. این محافظ برق دارای دو پریز ارت دار است که می&zwnj;تواند دو دستگاه را به طور همزمان محافظت کند.</span></p>\r\n<p><strong>موارد استفاده:</strong></p>\r\n<p><span style=\"font-weight: 400;\">محافظ مدل PE904&nbsp; برای انواع دستگاه&zwnj;های الکتریکی خانگی و اداری مناسب است. از جمله دستگاه&zwnj;هایی که می&zwnj;توان از این محافظ برق برای آنها استفاده کرد می&zwnj;توان به موارد زیر اشاره کرد:</span></p>\r\n<ul>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">یخچال و فریزر</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">تلویزیون</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">کامپیوتر و لپ تاپ</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">لوازم صوتی و تصویری</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">سیستم&zwnj;های روشنایی</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">و سایر دستگاه&zwnj;های الکتریکی</span></li>\r\n</ul>\r\n<p style=\"text-align: right;\">&nbsp;</p>\r\n<p><strong>سابقه شرکت سازنده:</strong></p>\r\n<p><span style=\"font-weight: 400;\">شرکت پارت الکتریک یکی از تولیدکنندگان باکیفیت و معتبر در داخل کشور است که بیش از 20 سال سابقه فعالیت در زمینه تولید تجهیزات برق و الکترونیک دارد. محصولات این شرکت با استفاده از مواد اولیه با کیفیت و با رعایت استانداردهای بین&zwnj;المللی تولید می&zwnj;شوند.</span></p>\r\n<p style=\"text-align: right;\">&nbsp;</p>\r\n<p><strong>مزایا:</strong></p>\r\n<p><span style=\"font-weight: 400;\">محافظ برق پارت الکتریک مدل PE904 دارای مزایای زیر است:</span></p>\r\n<ul>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">محافظت از دستگاه&zwnj;های الکتریکی در برابر نوسانات ولتاژ</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">دارای دو پریز ارت دار</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">ساخته شده از مواد با کیفیت و مقاوم</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">دارای سابقه درخشان شرکت سازنده</span></li>\r\n</ul>\r\n<p style=\"text-align: right;\">&nbsp;</p>\r\n<p><strong>نتیجه&zwnj;گیری:</strong></p>\r\n<p><span style=\"font-weight: 400;\">محافظ برق پارت الکتریک مدل PE904 یک انتخاب مناسب برای محافظت از دستگاه&zwnj;های الکتریکی شما در برابر نوسانات ولتاژ است. این محافظ برق دارای دو پریز ارت دار است و از مواد با کیفیت و مقاوم ساخته شده است. همچنین، این محصول دارای سابقه درخشان شرکت سازنده است.</span></p>\r\n<p style=\"text-align: right;\"><br /><br /><br /></p>",
                                "variants": [
                                    {
                                        "base_id": 34279,
                                        "id": "ELPTPX1100",
                                        "inStock": "0",
                                        "price": "3380000.0",
                                        "keys": [
                                            10016,
                                            10646
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 34274,
                                        "id": "",
                                        "inStock": "0",
                                        "price": "3380000.0",
                                        "keys": [],
                                        "images": [
                                            {
                                                "id": 21544,
                                                "styles": [
                                                    {
                                                        "height": 600,
                                                        "width": 600,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdU9aIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--7479843e6a83c83873d63ca6f1995aa9bfccae52/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ELPTPX1102_a.jpg"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ],
                                "images": [
                                    {
                                        "id": 21544,
                                        "styles": [
                                            {
                                                "height": 600,
                                                "width": 600,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdU9aIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--7479843e6a83c83873d63ca6f1995aa9bfccae52/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ELPTPX1102_a.jpg"
                                            }
                                        ]
                                    }
                                ],
                                "optionTypes": [
                                    {
                                        "id": 10003,
                                        "name": "tolsim",
                                        "optioValues": [
                                            {
                                                "id": 10016,
                                                "name": "1.8metri"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 1,
                                        "name": "brand",
                                        "optioValues": [
                                            {
                                                "id": 10646,
                                                "name": "پارت الکتریک"
                                            }
                                        ]
                                    }
                                ],
                                "optioValues": [],
                                "properties": [{"key": "حداقل ولتاژ برای قطع شدن جریان","value": "170 ولت"},{"key": "حداکثر ولتاژ برای قطع شدن جریان","value": "250 ولت"}]
                            },
                            {
                                "id": 17660,
                                "name": "محافظ ولتاژ 3متری پارت الکتریک مدل PE904",
                                "description": "<p><strong>محافظ برق پارت الکتریک مدل PE904</strong></p>\r\n<p><span style=\"font-weight: 400;\">محافظ برق پارت الکتریک مدل PE904 یک محافظ برق با کیفیت و کارآمد است که برای محافظت از دستگاه&zwnj;های الکتریکی شما در برابر نوسانات ولتاژ طراحی شده است. این محافظ برق دارای دو پریز ارت دار است که می&zwnj;تواند دو دستگاه را به طور همزمان محافظت کند.</span></p>\r\n<p><strong>موارد استفاده:</strong></p>\r\n<p><span style=\"font-weight: 400;\">محافظ مدل PE904&nbsp; برای انواع دستگاه&zwnj;های الکتریکی خانگی و اداری مناسب است. از جمله دستگاه&zwnj;هایی که می&zwnj;توان از این محافظ برق برای آنها استفاده کرد می&zwnj;توان به موارد زیر اشاره کرد:</span></p>\r\n<ul>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">یخچال و فریزر</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">تلویزیون</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">کامپیوتر و لپ تاپ</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">لوازم صوتی و تصویری</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">سیستم&zwnj;های روشنایی</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">و سایر دستگاه&zwnj;های الکتریکی</span></li>\r\n</ul>\r\n<p style=\"text-align: right;\">&nbsp;</p>\r\n<p><strong>سابقه شرکت سازنده:</strong></p>\r\n<p><span style=\"font-weight: 400;\">شرکت پارت الکتریک یکی از تولیدکنندگان باکیفیت و معتبر در داخل کشور است که بیش از 20 سال سابقه فعالیت در زمینه تولید تجهیزات برق و الکترونیک دارد. محصولات این شرکت با استفاده از مواد اولیه با کیفیت و با رعایت استانداردهای بین&zwnj;المللی تولید می&zwnj;شوند.</span></p>\r\n<p style=\"text-align: right;\">&nbsp;</p>\r\n<p><strong>مزایا:</strong></p>\r\n<p><span style=\"font-weight: 400;\">محافظ برق پارت الکتریک مدل PE904 دارای مزایای زیر است:</span></p>\r\n<ul>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">محافظت از دستگاه&zwnj;های الکتریکی در برابر نوسانات ولتاژ</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">دارای دو پریز ارت دار</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">ساخته شده از مواد با کیفیت و مقاوم</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">دارای سابقه درخشان شرکت سازنده</span></li>\r\n</ul>\r\n<p style=\"text-align: right;\">&nbsp;</p>\r\n<p><strong>نتیجه&zwnj;گیری:</strong></p>\r\n<p><span style=\"font-weight: 400;\">محافظ برق پارت الکتریک مدل PE904 یک انتخاب مناسب برای محافظت از دستگاه&zwnj;های الکتریکی شما در برابر نوسانات ولتاژ است. این محافظ برق دارای دو پریز ارت دار است و از مواد با کیفیت و مقاوم ساخته شده است. همچنین، این محصول دارای سابقه درخشان شرکت سازنده است.</span></p>\r\n<p style=\"text-align: right;\"><br /><br /><br /></p>",
                                "variants": [
                                    {
                                        "base_id": 34278,
                                        "id": "ELPTPX1101",
                                        "inStock": "0",
                                        "price": "3380000.0",
                                        "keys": [
                                            10646,
                                            10015
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 34267,
                                        "id": "",
                                        "inStock": "0",
                                        "price": "3380000.0",
                                        "keys": [],
                                        "images": [
                                            {
                                                "id": 21542,
                                                "styles": [
                                                    {
                                                        "height": 600,
                                                        "width": 600,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdU9aIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--7479843e6a83c83873d63ca6f1995aa9bfccae52/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ELPTPX1102_a.jpg"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ],
                                "images": [
                                    {
                                        "id": 21542,
                                        "styles": [
                                            {
                                                "height": 600,
                                                "width": 600,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdU9aIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--7479843e6a83c83873d63ca6f1995aa9bfccae52/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ELPTPX1102_a.jpg"
                                            }
                                        ]
                                    }
                                ],
                                "optionTypes": [
                                    {
                                        "id": 10003,
                                        "name": "tolsim",
                                        "optioValues": [
                                            {
                                                "id": 10015,
                                                "name": "3metri"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 1,
                                        "name": "brand",
                                        "optioValues": [
                                            {
                                                "id": 10646,
                                                "name": "پارت الکتریک"
                                            }
                                        ]
                                    }
                                ],
                                "optioValues": [],
                                "properties": [{"key": "حداقل ولتاژ برای قطع شدن جریان","value": "170 ولت"},{"key": "حداکثر ولتاژ برای قطع شدن جریان","value": "250 ولت"}]
                            },
                            {
                                "id": 17657,
                                "name": "چندراهی برق و محافظ 1.8متری  پارت الکتریک مدل PE21604",
                                "description": "<p><strong>چندراهی برق و محافظ پارت الکتریک کد PE21604</strong></p>\r\n<p><span style=\"font-weight: 400;\">چندراهی برق و محافظ پارت الکتریک کد PE21604 یک ابزار مفید و کاربردی برای دسترسی و توسعه برق رسانی است. این چندراهی دارای 6 پریز برق است که به شما امکان می&zwnj;دهد تا 6 دستگاه برقی را به آن متصل کرده و از آن&zwnj;ها به طور همزمان استفاده کنید. یکی از مزیت&zwnj;های این چندراهی، طول کابل 5 متری آن است که به شما امکان دسترسی به نقاط دورتر برای برق&zwnj;رسانی می&zwnj;دهد. زمان تاخیر تنظیم شده در این چندراهی به مدت یک دقیقه است، تا بتواند به صورت پایدار برق را به دستگاه&zwnj;های برقی ارسال کند و از آسیب&zwnj;های ناشی از قطع و وصل ناگهانی برق جلوگیری کند.</span></p>\r\n<p><strong>موارد استفاده:</strong></p>\r\n<p><span style=\"font-weight: 400;\">چندراهی برق و محافظ پارت الکتریک کد PE21604 برای استفاده در محیط&zwnj;های خانگی، تجاری و صنعتی مناسب است. این چندراهی می&zwnj;تواند برای تأمین برق وسایل برقی مختلف مانند تلویزیون، کامپیوتر، لوازم آشپزخانه، دستگاه&zwnj;های صنعتی و غیره استفاده شود.</span></p>\r\n<p>&nbsp;</p>\r\n<p><strong>سابقه شرکت سازنده:</strong></p>\r\n<p><span style=\"font-weight: 400;\">شرکت پارت الکتریک یکی از تولیدکنندگان پیشرو لوازم برقی در ایران است. این شرکت با بیش از 30 سال سابقه فعالیت، محصولات با کیفیت و با دوام را به بازار عرضه می&zwnj;کند.</span></p>\r\n<p>&nbsp;</p>\r\n<p><strong>مزایا:</strong></p>\r\n<ul>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">دارای 6 پریز برق برای اتصال همزمان 6 دستگاه برقی</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">طول کابل 5 متری برای دسترسی به نقاط دورتر</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">زمان تاخیر تنظیم شده برای جلوگیری از آسیب&zwnj;های ناشی از قطع و وصل ناگهانی برق</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">ساخت ایران با کیفیت بالا</span></li>\r\n</ul>\r\n<p>&nbsp;</p>\r\n<p><strong>جمع&zwnj;بندی:</strong></p>\r\n<p><span style=\"font-weight: 400;\">چندراهی برق و محافظ پارت الکتریک کد PE21604 یک محصول با کیفیت و کاربردی است که می&zwnj;تواند نیازهای مختلف کاربران را برآورده کند. این چندراهی دارای ویژگی&zwnj;های متعددی است که آن را به یک گزینه مناسب برای استفاده در محیط&zwnj;های مختلف تبدیل می&zwnj;کند.</span></p>\r\n<p><br /><br /><br /></p>",
                                "variants": [
                                    {
                                        "base_id": 34264,
                                        "id": "ELPTPX1107",
                                        "inStock": "0",
                                        "price": "4300000.0",
                                        "keys": [
                                            10016,
                                            10646
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 34263,
                                        "id": "",
                                        "inStock": "0",
                                        "price": "4300000.0",
                                        "keys": [],
                                        "images": [
                                            {
                                                "id": 21538,
                                                "styles": [
                                                    {
                                                        "height": 600,
                                                        "width": 600,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdVdaIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--51cd816e9ea194057ef52f1c806468335a6190f2/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ELPTPX1108_a.jpg"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ],
                                "images": [
                                    {
                                        "id": 21538,
                                        "styles": [
                                            {
                                                "height": 600,
                                                "width": 600,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdVdaIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--51cd816e9ea194057ef52f1c806468335a6190f2/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ELPTPX1108_a.jpg"
                                            }
                                        ]
                                    }
                                ],
                                "optionTypes": [
                                    {
                                        "id": 10003,
                                        "name": "tolsim",
                                        "optioValues": [
                                            {
                                                "id": 10016,
                                                "name": "1.8metri"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 1,
                                        "name": "brand",
                                        "optioValues": [
                                            {
                                                "id": 10646,
                                                "name": "پارت الکتریک"
                                            }
                                        ]
                                    }
                                ],
                                "optioValues": [],
                                "properties": [{"key": "حداقل ولتاژ برای قطع شدن جریان","value": "170 ولت"},{"key": "حداکثر ولتاژ برای قطع شدن جریان","value": "250 ولت"}]
                            },
                            {
                                "id": 17655,
                                "name": "سیم رابط 4 خانه 3متری سرامیکی  پارت الکتریک",
                                "description": "<p><strong>سیم رابط چهار خانه پارت الکتریک</strong></p>\r\n<p><span style=\"font-weight: 400;\">سیم رابط چهار خانه پارت الکتریک یک وسیله کاربردی و ضروری برای خانه و محل کار است که امکان اتصال و استفاده همزمان از چندین دستگاه برقی را فراهم می&zwnj;کند. این سیم رابط دارای چهار خروجی برق است که به کاربر اجازه می&zwnj;دهد تا دستگاه&zwnj;های خود را به طور همزمان شارژ کند یا از آنها استفاده نماید.</span></p>\r\n<p><strong>موارد استفاده:</strong></p>\r\n<ul>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">شارژ همزمان چندین دستگاه برقی مانند گوشی&zwnj;های هوشمند، تبلت&zwnj;ها، لپ&zwnj;تاپ&zwnj;ها و ...</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">استفاده همزمان از چندین دستگاه برقی مانند تلویزیون، یخچال، ماشین لباسشویی و ...</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">استفاده در محیط&zwnj;های تجاری و اداری</span></li>\r\n</ul>\r\n<p style=\"text-align: right;\">&nbsp;</p>\r\n<p><strong>سابقه شرکت سازنده:</strong></p>\r\n<p><span style=\"font-weight: 400;\">شرکت پارت الکتریک یکی از شرکت&zwnj;های پیشرو در زمینه تولید لوازم الکتریکی در ایران است. این شرکت با بیش از 30 سال سابقه فعالیت، محصولات با کیفیت و متنوعی را در بازار عرضه می&zwnj;کند.</span></p>\r\n<p style=\"text-align: right;\">&nbsp;</p>\r\n<p><strong>مزایا:</strong></p>\r\n<ul>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">امکان اتصال و استفاده همزمان از چندین دستگاه برقی</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">دارای کابل بلند برای استفاده در فاصله دلخواه</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">بدنه محکم و مقاوم در برابر ضربه</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">دارای دکمه قطع و وصل برای ایمنی بیشتر</span></li>\r\n</ul>\r\n<p style=\"text-align: right;\">&nbsp;</p>\r\n<p><strong>جمع&zwnj;بندی:</strong></p>\r\n<p><span style=\"font-weight: 400;\">سیم رابط چهار خانه پارت الکتریک یک وسیله کاربردی و ضروری برای خانه و محل کار است که با کیفیت و قیمت مناسب در بازار عرضه می&zwnj;شود. این سیم رابط با داشتن چهار خروجی برق، امکان اتصال و استفاده همزمان از چندین دستگاه برقی را فراهم می&zwnj;کند. بدنه محکم و مقاوم این سیم رابط در برابر ضربه و جریانات برقی از ایمنی کاربر محافظت می&zwnj;کند. همچنین، دکمه قطع و وصل بر روی بدنه این سیم رابط باعث کاهش مصرف انرژی و ایمنی بیشتر می&zwnj;شود.</span></p>\r\n<p style=\"text-align: right;\"><br /><br /><br /></p>",
                                "variants": [
                                    {
                                        "base_id": 34260,
                                        "id": "ELPTWC0429",
                                        "inStock": "0",
                                        "price": "3400000.0",
                                        "keys": [
                                            10702,
                                            10646
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 34259,
                                        "id": "",
                                        "inStock": "0",
                                        "price": "3400000.0",
                                        "keys": [],
                                        "images": [
                                            {
                                                "id": 21535,
                                                "styles": [
                                                    {
                                                        "height": 600,
                                                        "width": 600,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaDZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--40e5be3be25968e45c28c3c6434d561684b55ac3/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ELPTWC0431_a.jpg"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ],
                                "images": [
                                    {
                                        "id": 21535,
                                        "styles": [
                                            {
                                                "height": 600,
                                                "width": 600,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaDZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--40e5be3be25968e45c28c3c6434d561684b55ac3/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ELPTWC0431_a.jpg"
                                            }
                                        ]
                                    }
                                ],
                                "optionTypes": [
                                    {
                                        "id": 10030,
                                        "name": "tolmetr",
                                        "optioValues": [
                                            {
                                                "id": 10702,
                                                "name": "3metr"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 1,
                                        "name": "brand",
                                        "optioValues": [
                                            {
                                                "id": 10646,
                                                "name": "پارت الکتریک"
                                            }
                                        ]
                                    }
                                ],
                                "optioValues": [],
                                "properties": []
                            },
                            {
                                "id": 17654,
                                "name": " سیم رابط 4 خانه1.8 متری سرامیکی  پارت الکتریک",
                                "description": "<p><strong>سیم رابط چهار خانه پارت الکتریک</strong></p>\r\n<p><span style=\"font-weight: 400;\">سیم رابط چهار خانه پارت الکتریک یک وسیله کاربردی و ضروری برای خانه و محل کار است که امکان اتصال و استفاده همزمان از چندین دستگاه برقی را فراهم می&zwnj;کند. این سیم رابط دارای چهار خروجی برق است که به کاربر اجازه می&zwnj;دهد تا دستگاه&zwnj;های خود را به طور همزمان شارژ کند یا از آنها استفاده نماید.</span></p>\r\n<p><strong>موارد استفاده:</strong></p>\r\n<ul>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">شارژ همزمان چندین دستگاه برقی مانند گوشی&zwnj;های هوشمند، تبلت&zwnj;ها، لپ&zwnj;تاپ&zwnj;ها و ...</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">استفاده همزمان از چندین دستگاه برقی مانند تلویزیون، یخچال، ماشین لباسشویی و ...</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">استفاده در محیط&zwnj;های تجاری و اداری</span></li>\r\n</ul>\r\n<p style=\"text-align: right;\">&nbsp;</p>\r\n<p><strong>سابقه شرکت سازنده:</strong></p>\r\n<p><span style=\"font-weight: 400;\">شرکت پارت الکتریک یکی از شرکت&zwnj;های پیشرو در زمینه تولید لوازم الکتریکی در ایران است. این شرکت با بیش از 30 سال سابقه فعالیت، محصولات با کیفیت و متنوعی را در بازار عرضه می&zwnj;کند.</span></p>\r\n<p style=\"text-align: right;\">&nbsp;</p>\r\n<p><strong>مزایا:</strong></p>\r\n<ul>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">امکان اتصال و استفاده همزمان از چندین دستگاه برقی</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">دارای کابل بلند برای استفاده در فاصله دلخواه</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">بدنه محکم و مقاوم در برابر ضربه</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">دارای دکمه قطع و وصل برای ایمنی بیشتر</span></li>\r\n</ul>\r\n<p style=\"text-align: right;\">&nbsp;</p>\r\n<p><strong>جمع&zwnj;بندی:</strong></p>\r\n<p><span style=\"font-weight: 400;\">سیم رابط چهار خانه پارت الکتریک یک وسیله کاربردی و ضروری برای خانه و محل کار است که با کیفیت و قیمت مناسب در بازار عرضه می&zwnj;شود. این سیم رابط با داشتن چهار خروجی برق، امکان اتصال و استفاده همزمان از چندین دستگاه برقی را فراهم می&zwnj;کند. بدنه محکم و مقاوم این سیم رابط در برابر ضربه و جریانات برقی از ایمنی کاربر محافظت می&zwnj;کند. همچنین، دکمه قطع و وصل بر روی بدنه این سیم رابط باعث کاهش مصرف انرژی و ایمنی بیشتر می&zwnj;شود.</span></p>\r\n<p style=\"text-align: right;\"><br /><br /><br /></p>",
                                "variants": [
                                    {
                                        "base_id": 34258,
                                        "id": "ELPTWC0430",
                                        "inStock": "0",
                                        "price": "3400000.0",
                                        "keys": [
                                            11595,
                                            10646
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 34257,
                                        "id": " ",
                                        "inStock": "0",
                                        "price": "3400000.0",
                                        "keys": [],
                                        "images": [
                                            {
                                                "id": 21534,
                                                "styles": [
                                                    {
                                                        "height": 600,
                                                        "width": 600,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaDZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--40e5be3be25968e45c28c3c6434d561684b55ac3/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ELPTWC0431_a.jpg"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ],
                                "images": [
                                    {
                                        "id": 21534,
                                        "styles": [
                                            {
                                                "height": 600,
                                                "width": 600,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaDZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--40e5be3be25968e45c28c3c6434d561684b55ac3/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ELPTWC0431_a.jpg"
                                            }
                                        ]
                                    }
                                ],
                                "optionTypes": [
                                    {
                                        "id": 10030,
                                        "name": "tolmetr",
                                        "optioValues": [
                                            {
                                                "id": 11595,
                                                "name": "1/8metr"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 1,
                                        "name": "brand",
                                        "optioValues": [
                                            {
                                                "id": 10646,
                                                "name": "پارت الکتریک"
                                            }
                                        ]
                                    }
                                ],
                                "optioValues": [],
                                "properties": []
                            },
                            {
                                "id": 17642,
                                "name": " ریسه شلنگی تک رنگ 5 متری همراه باسوکت دوشاخه دار",
                                "description": "<p>نورپردازی مخفی در فضاهای گوناگون مانند فضای داخلی و بیرونی ساختمان تاثیر زیادی در زیبایی بصری آن دارد. یکی از بهترین روش ها برای این منظور استفاده از ریسه های شلنگی می باشد. نور حاصل از این نوع ریسه بسیار شفاف بوده و همین موضوع باعث زیبایی فراوان محلی خواهد بود که این نوع ریسه در آن نصب شده است. کاهش برق مصرفی و تنوع رنگی (به صورت تک رنگ) از دیگر ویژگی های ریسه شلنگی تک رنگ است که رضایت طیف گسترده ای از سلایق را جلب می کند.</p>\r\n<p>نصب ریسه شلنگی ال ای دی بسیار ساده بوده و تنها با یک سوکت می توان از آن استفاده نمود و در نتیجه نیازی به ترانس ندارد.</p>\r\n<p>ریسه شلنگی به دلیل بهره گیری از رویه شلنگی نسبت به گرد و غبار و همچنین رطوبت مقاومت بالایی دارد و در محیط های گوناگون قابل استفاده است.</p>\r\n<p>&nbsp;</p>",
                                "variants": [
                                    {
                                        "base_id": 34244,
                                        "id": "ELRGLG0546",
                                        "inStock": "0",
                                        "price": "2900000.0",
                                        "keys": [
                                            10670,
                                            10017
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 34243,
                                        "id": "RGLG0603",
                                        "inStock": "0",
                                        "price": "2900000.0",
                                        "keys": [
                                            10017,
                                            11257
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 34242,
                                        "id": "ELRGLG0586",
                                        "inStock": "0",
                                        "price": "2900000.0",
                                        "keys": [
                                            10017,
                                            10735
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 34241,
                                        "id": "RGLG0604",
                                        "inStock": "0",
                                        "price": "2900000.0",
                                        "keys": [
                                            10017,
                                            10671
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 34240,
                                        "id": "ELRGLG0566",
                                        "inStock": "0",
                                        "price": "2900000.0",
                                        "keys": [
                                            10017,
                                            3
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 34239,
                                        "id": "NBLG0003",
                                        "inStock": "0",
                                        "price": "2900000.0",
                                        "keys": [
                                            10017,
                                            4
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 34175,
                                        "id": "",
                                        "inStock": "0",
                                        "price": "2900000.0",
                                        "keys": [],
                                        "images": [
                                            {
                                                "id": 21507,
                                                "styles": [
                                                    {
                                                        "height": 600,
                                                        "width": 600,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBcU9wIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--631e199dd4b51c1b1bff54a29ebf7cf57c01b587/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lKYW5CbFp3WTZCa1ZVT2d4bmNtRjJhWFI1U1NJTFkyVnVkR1Z5QmpzR1ZEb0xjbVZ6YVhwbFNTSU5OakF3ZURZd01ENEdPd1pVT2d0bGVIUmxiblJBQ0RvUFltRmphMmR5YjNWdVpFa2lDWE5vYjNjR093WlVPZ3h4ZFdGc2FYUjVhVlU9IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--04f0d288dcebcfd694dafbe47a5374781b1c2c34/ELRGLG0589_a.jpeg"
                                                    }
                                                ]
                                            },
                                            {
                                                "id": 21506,
                                                "styles": [
                                                    {
                                                        "height": 600,
                                                        "width": 600,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaWlwIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--436f1df832a31559fca6a45fc82039fdceaf1b90/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/RGLG0614_a.jpg"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ],
                                "images": [
                                    {
                                        "id": 21507,
                                        "styles": [
                                            {
                                                "height": 600,
                                                "width": 600,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBcU9wIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--631e199dd4b51c1b1bff54a29ebf7cf57c01b587/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lKYW5CbFp3WTZCa1ZVT2d4bmNtRjJhWFI1U1NJTFkyVnVkR1Z5QmpzR1ZEb0xjbVZ6YVhwbFNTSU5OakF3ZURZd01ENEdPd1pVT2d0bGVIUmxiblJBQ0RvUFltRmphMmR5YjNWdVpFa2lDWE5vYjNjR093WlVPZ3h4ZFdGc2FYUjVhVlU9IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--04f0d288dcebcfd694dafbe47a5374781b1c2c34/ELRGLG0589_a.jpeg"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 21506,
                                        "styles": [
                                            {
                                                "height": 600,
                                                "width": 600,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaWlwIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--436f1df832a31559fca6a45fc82039fdceaf1b90/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/RGLG0614_a.jpg"
                                            }
                                        ]
                                    }
                                ],
                                "optionTypes": [
                                    {
                                        "id": 10003,
                                        "name": "tolsim",
                                        "optioValues": [
                                            {
                                                "id": 10017,
                                                "name": "5metri"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 2,
                                        "name": "rangenoor",
                                        "optioValues": [
                                            {"id": 11257,"name": "بنفش"},
                                            {
                                                "id": 10735,
                                                "name": "سبز"
                                            },
                                            {
                                                "id": 10671,
                                                "name": "انبه ای"
                                            },
                                            {
                                                "id": 10670,
                                                "name": "آبی"
                                            },
                                            {
                                                "id": 4,
                                                "name": "Aftabi"
                                            },
                                            {
                                                "id": 3,
                                                "name": "Mahtabi"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 1,
                                        "name": "brand",
                                        "optioValues": []
                                    }
                                ],
                                "optioValues": [],
                                "properties": [{"key": "حداقل ولتاژ برای قطع شدن جریان","value": "170 ولت"},{"key": "حداکثر ولتاژ برای قطع شدن جریان","value": "250 ولت"}]
                            },
                            {
                                "id": 17639,
                                "name": " ریسه شلنگی تک رنگ 10 متری همراه باسوکت دوشاخه دار",
                                "description": "<p>اگر به دنبال ریسه ای با ترکیب رنگی بالا هستید بهترین گزینه ریسه شلنگی RGB خواهد بود. این مدل ریسه انتخاب مناسبی برای فضاهای شاد و جذاب است. بکار گیری ریسه &nbsp;ال ای دی RGB به صورت مخفی به این صورت که فقط نور آن قابل مشاهده باشد، استفاده از آن را جذاب تر می کند.</p>\r\n<p>ریسه شلنگی به دلیل انعطاف پذیر و ضد آب بودن در محیط سرپوشیده و سرباز قابل استفاده می باشد. از کاربردهای این لامپ شلنگی طویل می توان به نورپردازی نمای ساختمان، نورپردازی شهربازی ها، فضای سبز شهری مانند میدان ها، آزین بندی در جشن ها و اعیاد، استفاده از آن برای تبلیغات در فروشگاه و مراکز خرید، نورپردازی سقف آپارتمان ها، زیر کابینت، زیر پله ها و بسیاری از مکان های دیگر نیز اشاره کرد.</p>\r\n<p>ریسه شلنگی ال ای دی RGB به دلیل بهره گیری از رویه شلنگی نسبت به گرد و غبار و همچنین رطوبت مقاومت بالایی دارد.</p>",
                                "variants": [
                                    {
                                        "base_id": 34256,
                                        "id": "ELRGLG0549",
                                        "inStock": "0",
                                        "price": "1500000.0",
                                        "keys": [
                                            10029,
                                            10670
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 34255,
                                        "id": "RGLG0613",
                                        "inStock": "0",
                                        "price": "1500000.0",
                                        "keys": [
                                            10029,
                                            11257
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 34254,
                                        "id": "NBLG0577",
                                        "inStock": "0",
                                        "price": "1500000.0",
                                        "keys": [
                                            10029,
                                            10735
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 34250,
                                        "id": "RGLG0614",
                                        "inStock": "0",
                                        "price": "1500000.0",
                                        "keys": [
                                            10029,
                                            10671
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 34249,
                                        "id": "ELRGLG0567",
                                        "inStock": "0",
                                        "price": "1500000.0",
                                        "keys": [
                                            3,
                                            10029
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 34248,
                                        "id": "RGLG0580",
                                        "inStock": "0",
                                        "price": "1500000.0",
                                        "keys": [
                                            4,
                                            10029
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 34165,
                                        "id": "",
                                        "inStock": "0",
                                        "price": "1500000.0",
                                        "keys": [],
                                        "images": [
                                            {
                                                "id": 21502,
                                                "styles": [
                                                    {
                                                        "height": 600,
                                                        "width": 600,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBZ0txIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--02ca6ffa08e0a1b948818ba361ca4df09d2a0030/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/RGLG0645_a.jpg"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ],
                                "images": [
                                    {
                                        "id": 21502,
                                        "styles": [
                                            {
                                                "height": 600,
                                                "width": 600,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBZ0txIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--02ca6ffa08e0a1b948818ba361ca4df09d2a0030/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/RGLG0645_a.jpg"
                                            }
                                        ]
                                    }
                                ],
                                "optionTypes": [
                                    {
                                        "id": 10003,
                                        "name": "tolsim",
                                        "optioValues": [
                                            {
                                                "id": 10029,
                                                "name": "10metri"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 2,
                                        "name": "rangenoor",
                                        "optioValues": [
                                            {"id": 11257,"name": "بنفش"},
                                            {"id": 10735,"name": "سبز"},
                                            {"id": 10671,"name": "انبه ای"},
                                            {"id": 10670,"name": "آبی"},
                                            {"id": 4,"name": "Aftabi"},
                                            {"id": 3,"name": "Mahtabi"}
                                        ]
                                    },
                                    {"id": 1,"name": "brand","optioValues": []}
                                ],
                                "optioValues": [],
                                "properties": [{"key": "حداقل ولتاژ برای قطع شدن جریان","value": "170 ولت"},{"key": "حداکثر ولتاژ برای قطع شدن جریان","value": "250 ولت"}]
                            },
                            {
                                "id": 17637,
                                "name": " ریسه شلنگی تک رنگ 3 متری همراه باسوکت دوشاخه دار",
                                "description": "<p>نورپردازی مخفی در فضاهای گوناگون مانند فضای داخلی و بیرونی ساختمان تاثیر زیادی در زیبایی بصری آن دارد. یکی از بهترین روش ها برای این منظور استفاده از ریسه های شلنگی می باشد. نور حاصل از این نوع ریسه بسیار شفاف بوده و همین موضوع باعث زیبایی فراوان محلی خواهد بود که این نوع ریسه در آن نصب شده است. کاهش برق مصرفی و تنوع رنگی (به صورت تک رنگ) از دیگر ویژگی های ریسه شلنگی تک رنگ است که رضایت طیف گسترده ای از سلایق را جلب می کند.</p>\r\n<p>نصب ریسه شلنگی ال ای دی بسیار ساده بوده و تنها با یک سوکت می توان از آن استفاده نمود و در نتیجه نیازی به ترانس ندارد.</p>\r\n<p>ریسه شلنگی به دلیل بهره گیری از رویه شلنگی نسبت به گرد و غبار و همچنین رطوبت مقاومت بالایی دارد و در محیط های گوناگون قابل استفاده است.</p>\r\n<p>&nbsp;</p>",
                                "variants": [
                                    {"base_id": 34235,"id": "ELRGLG0589","inStock": "0","price": "2900000.0","keys": [10670,10015],"images": []},
                                    {"base_id": 34234,"id": "RGLG0590","inStock": "0","price": "2900000.0","keys": [10015,11257],"images": []},
                                    {"base_id": 34233,"id": "NBLG0575","inStock": "0","price": "2900000.0","keys": [10015,10735],"images": []},
                                    {"base_id": 34232,"id": "RGLG0592","inStock": "0","price": "2900000.0","keys": [10015,10671],"images": []},
                                    {"base_id": 34231,"id": "RGLG0565","inStock": "0","price": "2900000.0","keys": [10015,3],"images": []},
                                    {"base_id": 34127,"id": " RGLG0560","inStock": "0","price": 2900000,"keys": [4,10015],"images": []},
                                    {
                                        "base_id": 34126,"id": "","inStock": "0","price": "2900000.0","keys": [],
                                        "images": [
                                            {
                                                "id": 21499,
                                                "styles": [
                                                    {
                                                        "height": 600,"width": 600,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBcU9wIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--631e199dd4b51c1b1bff54a29ebf7cf57c01b587/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lKYW5CbFp3WTZCa1ZVT2d4bmNtRjJhWFI1U1NJTFkyVnVkR1Z5QmpzR1ZEb0xjbVZ6YVhwbFNTSU5OakF3ZURZd01ENEdPd1pVT2d0bGVIUmxiblJBQ0RvUFltRmphMmR5YjNWdVpFa2lDWE5vYjNjR093WlVPZ3h4ZFdGc2FYUjVhVlU9IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--04f0d288dcebcfd694dafbe47a5374781b1c2c34/ELRGLG0589_a.jpeg"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ],
                                "images": [
                                    {
                                        "id": 21499,
                                        "styles": [
                                            {
                                                "height": 600,"width": 600,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBcU9wIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--631e199dd4b51c1b1bff54a29ebf7cf57c01b587/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lKYW5CbFp3WTZCa1ZVT2d4bmNtRjJhWFI1U1NJTFkyVnVkR1Z5QmpzR1ZEb0xjbVZ6YVhwbFNTSU5OakF3ZURZd01ENEdPd1pVT2d0bGVIUmxiblJBQ0RvUFltRmphMmR5YjNWdVpFa2lDWE5vYjNjR093WlVPZ3h4ZFdGc2FYUjVhVlU9IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--04f0d288dcebcfd694dafbe47a5374781b1c2c34/ELRGLG0589_a.jpeg"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 21498,
                                        "styles": [
                                            {
                                                "height": 600,
                                                "width": 600,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaWlwIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--436f1df832a31559fca6a45fc82039fdceaf1b90/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/RGLG0614_a.jpg"
                                            }
                                        ]
                                    }
                                ],
                                "optionTypes": [
                                    {"id": 10003,"name": "tolsim","optioValues": [{"id": 10015,"name": "3metri"}]},
                                    {
                                        "id": 2,
                                        "name": "rangenoor",
                                        "optioValues": [
                                            {"id": 11257,"name": "بنفش"},
                                            {"id": 10735,"name": "سبز"},
                                            {"id": 10671,"name": "انبه ای"},
                                            {"id": 10670,"name": "آبی"},
                                            {"id": 4,"name": "Aftabi"},
                                            {"id": 3,"name": "Mahtabi"}
                                        ]
                                    },
                                    {"id": 1,"name": "brand","optioValues": []}
                                ],
                                "optioValues": [],
                                "properties": [{"key": "حداقل ولتاژ برای قطع شدن جریان","value": "170 ولت"},{"key": "حداکثر ولتاژ برای قطع شدن جریان","value": "250 ولت"}]
                            },
                            {
                                "id": 17622,
                                "name": "ریسه شلنگی چند رنگ همراه با سوکت و ریموت کنترلی 10متری",
                                "description": "<p data-sourcepos=\"1:1-1:97\"><strong>عنوان:</strong> <strong>ریسه شلنگی چند رنگ همراه با سوکت و ریموت کنترلی: نوری رنگارنگ و جذاب برای هر فضایی</strong></p>\r\n<p data-sourcepos=\"10:1-10:20\"><strong>معرفی ریسه شلنگی</strong></p>\r\n<p data-sourcepos=\"12:1-13:29\">ریسه شلنگی یک نوع ریسه نوری است که از یک لوله پلاستیکی انعطاف پذیر ساخته شده است. این ریسه معمولاً با LEDهای رنگی پر شده است که می&zwnj;توانند در حالت&zwnj;های مختلف نورپردازی قرار گیرند. ریسه شلنگی برای تزئین انواع فضاها، از جمله خانه، محل کار، و فضای باز استفاده می&zwnj;شود.</p>\r\n<p data-sourcepos=\"15:1-15:32\"><strong>ویژگی های ریسه شلنگی چند رنگ</strong></p>\r\n<p data-sourcepos=\"17:1-17:43\">ریسه شلنگی چند رنگ دارای ویژگی&zwnj;های زیر است:</p>\r\n<ul data-sourcepos=\"19:1-23:0\">\r\n<li data-sourcepos=\"19:1-19:140\"><strong>طول قابل تنظیم:</strong>&nbsp;ریسه شلنگی معمولاً در طول&zwnj;های مختلف تولید می&zwnj;شود که می&zwnj;توان آن&zwnj;ها را به یکدیگر متصل کرد تا طول مورد نیاز را ایجاد کرد.</li>\r\n<li data-sourcepos=\"20:1-20:80\"><strong>قابلیت اتصال به برق:</strong>&nbsp;ریسه شلنگی با استفاده از سوکت برق به برق متصل می&zwnj;شود.</li>\r\n<li data-sourcepos=\"21:1-21:147\"><strong>قابلیت کنترل با ریموت:</strong>&nbsp;ریسه شلنگی چند رنگ معمولاً با یک ریموت کنترلی عرضه می&zwnj;شود که با استفاده از آن می&zwnj;توان حالت&zwnj;های نورپردازی را تغییر داد.</li>\r\n<li data-sourcepos=\"22:1-23:0\"><strong>تنوع رنگی:</strong>&nbsp;ریسه شلنگی چند رنگ در طیف وسیعی از رنگ&zwnj;ها موجود است.</li>\r\n</ul>\r\n<p data-sourcepos=\"24:1-24:29\"><strong>کاربرد ریسه شلنگی چند رنگ</strong></p>\r\n<p data-sourcepos=\"26:1-26:106\">ریسه شلنگی چند رنگ برای تزئین انواع فضاها استفاده می&zwnj;شود. برخی از کاربردهای ریسه شلنگی چند رنگ عبارتند از:</p>\r\n<ul data-sourcepos=\"28:1-32:0\">\r\n<li data-sourcepos=\"28:1-28:23\"><strong>تزئین درخت کریسمس</strong></li>\r\n<li data-sourcepos=\"29:1-29:36\"><strong>تزئین خانه در مناسبت&zwnj;های مختلف</strong></li>\r\n<li data-sourcepos=\"30:1-30:20\"><strong>تزئین فضای باز</strong></li>\r\n<li data-sourcepos=\"31:1-32:0\"><strong>ایجاد نورپردازی دکوراتیو</strong></li>\r\n</ul>",
                                "variants": [
                                    {
                                        "base_id": 34063,
                                        "id": "ELRGLG1637",
                                        "inStock": "0",
                                        "price": "2350000.0",
                                        "keys": [
                                            10029
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 34062,
                                        "id": "",
                                        "inStock": "0",
                                        "price": "2350000.0",
                                        "keys": [],
                                        "images": [
                                            {
                                                "id": 21470,
                                                "styles": [
                                                    {
                                                        "height": 600,
                                                        "width": 600,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBcVNwIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--7dd2242b6007d27db2cb0541241f99204e78ab81/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ELRGLG1637_a.jpg"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ],
                                "images": [
                                    {
                                        "id": 21470,
                                        "styles": [
                                            {
                                                "height": 600,
                                                "width": 600,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBcVNwIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--7dd2242b6007d27db2cb0541241f99204e78ab81/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ELRGLG1637_a.jpg"
                                            }
                                        ]
                                    }
                                ],
                                "optionTypes": [
                                    {
                                        "id": 10003,
                                        "name": "tolsim",
                                        "optioValues": [
                                            {
                                                "id": 10029,
                                                "name": "10metri"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 2,
                                        "name": "rangenoor",
                                        "optioValues": []
                                    },
                                    {
                                        "id": 1,
                                        "name": "brand",
                                        "optioValues": []
                                    }
                                ],
                                "properties": [
                                    {
                                        "key": "نوع",
                                        "value": "RGB"
                                    }
                                ]
                            },
                            {
                                "id": 17620,
                                "name": "ریسه شلنگی چند رنگ همراه با سوکت و ریموت کنترلی 5متری",
                                "description": "<p data-sourcepos=\"1:1-1:97\"><strong>عنوان:</strong> <strong>ریسه شلنگی چند رنگ همراه با سوکت و ریموت کنترلی: نوری رنگارنگ و جذاب برای هر فضایی</strong></p>\r\n<p data-sourcepos=\"10:1-10:20\"><strong>معرفی ریسه شلنگی</strong></p>\r\n<p data-sourcepos=\"12:1-13:29\">ریسه شلنگی یک نوع ریسه نوری است که از یک لوله پلاستیکی انعطاف پذیر ساخته شده است. این ریسه معمولاً با LEDهای رنگی پر شده است که می&zwnj;توانند در حالت&zwnj;های مختلف نورپردازی قرار گیرند. ریسه شلنگی برای تزئین انواع فضاها، از جمله خانه، محل کار، و فضای باز استفاده می&zwnj;شود.</p>\r\n<p data-sourcepos=\"15:1-15:32\"><strong>ویژگی های ریسه شلنگی چند رنگ</strong></p>\r\n<p data-sourcepos=\"17:1-17:43\">ریسه شلنگی چند رنگ دارای ویژگی&zwnj;های زیر است:</p>\r\n<ul data-sourcepos=\"19:1-23:0\">\r\n<li data-sourcepos=\"19:1-19:140\"><strong>طول قابل تنظیم:</strong>&nbsp;ریسه شلنگی معمولاً در طول&zwnj;های مختلف تولید می&zwnj;شود که می&zwnj;توان آن&zwnj;ها را به یکدیگر متصل کرد تا طول مورد نیاز را ایجاد کرد.</li>\r\n<li data-sourcepos=\"20:1-20:80\"><strong>قابلیت اتصال به برق:</strong>&nbsp;ریسه شلنگی با استفاده از سوکت برق به برق متصل می&zwnj;شود.</li>\r\n<li data-sourcepos=\"21:1-21:147\"><strong>قابلیت کنترل با ریموت:</strong>&nbsp;ریسه شلنگی چند رنگ معمولاً با یک ریموت کنترلی عرضه می&zwnj;شود که با استفاده از آن می&zwnj;توان حالت&zwnj;های نورپردازی را تغییر داد.</li>\r\n<li data-sourcepos=\"22:1-23:0\"><strong>تنوع رنگی:</strong>&nbsp;ریسه شلنگی چند رنگ در طیف وسیعی از رنگ&zwnj;ها موجود است.</li>\r\n</ul>\r\n<p data-sourcepos=\"24:1-24:29\"><strong>کاربرد ریسه شلنگی چند رنگ</strong></p>\r\n<p data-sourcepos=\"26:1-26:106\">ریسه شلنگی چند رنگ برای تزئین انواع فضاها استفاده می&zwnj;شود. برخی از کاربردهای ریسه شلنگی چند رنگ عبارتند از:</p>\r\n<ul data-sourcepos=\"28:1-32:0\">\r\n<li data-sourcepos=\"28:1-28:23\"><strong>تزئین درخت کریسمس</strong></li>\r\n<li data-sourcepos=\"29:1-29:36\"><strong>تزئین خانه در مناسبت&zwnj;های مختلف</strong></li>\r\n<li data-sourcepos=\"30:1-30:20\"><strong>تزئین فضای باز</strong></li>\r\n<li data-sourcepos=\"31:1-32:0\"><strong>ایجاد نورپردازی دکوراتیو</strong></li>\r\n</ul>",
                                "variants": [
                                    {
                                        "base_id": 34060,
                                        "id": "ELRGLG1636",
                                        "inStock": "0",
                                        "price": "2350000.0",
                                        "keys": [
                                            10017
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 34059,
                                        "id": "",
                                        "inStock": "0",
                                        "price": "2350000.0",
                                        "keys": [],
                                        "images": [
                                            {
                                                "id": 21468,
                                                "styles": [
                                                    {
                                                        "height": 600,
                                                        "width": 600,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBcVNwIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--7dd2242b6007d27db2cb0541241f99204e78ab81/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ELRGLG1637_a.jpg"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ],
                                "images": [
                                    {
                                        "id": 21468,
                                        "styles": [
                                            {
                                                "height": 600,
                                                "width": 600,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBcVNwIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--7dd2242b6007d27db2cb0541241f99204e78ab81/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/ELRGLG1637_a.jpg"
                                            }
                                        ]
                                    }
                                ],
                                "optionTypes": [
                                    {
                                        "id": 10003,
                                        "name": "tolsim",
                                        "optioValues": [
                                            {
                                                "id": 10017,
                                                "name": "5metri"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 2,
                                        "name": "rangenoor",
                                        "optioValues": []
                                    },
                                    {
                                        "id": 1,
                                        "name": "brand",
                                        "optioValues": []
                                    }
                                ],
                                "optioValues": [],
                                "properties": [{"key": "حداقل ولتاژ برای قطع شدن جریان","value": "170 ولت"},{"key": "حداکثر ولتاژ برای قطع شدن جریان","value": "250 ولت"}]
                            },
                            {
                                "id": 17290,
                                "name": "لامپ اس ام دی 50 وات دونیکو طرح سفینه مدل XA-004 پایه E27",
                                "description": "<p><strong>لامپ اس ام دی 50 وات دونیکو طرح سفینه مدل XA-004:</strong></p>\r\n<p><span style=\"font-weight: 400;\">لامپ&zwnj;های اس ام دی یکی از محبوب&zwnj;ترین انواع لامپ&zwnj;های کم&zwnj;مصرف هستند که به دلیل مزایای متعددی مانند مصرف انرژی پایین، طول عمر بالا، نوردهی یکنواخت و عدم تولید اشعه فرابنفش و مادون قرمز، به سرعت جای خود را در بازار روشنایی باز کرده&zwnj;اند. لامپ اس ام دی 50 وات دونیکو طرح سفینه مدل XA-004 یکی از محصولات باکیفیت این شرکت است که با ویژگی&zwnj;های منحصربه&zwnj;فرد خود، می&zwnj;تواند گزینه مناسبی برای استفاده در فضاهای مختلف باشد.</span></p>\r\n<p><strong>مزایا:</strong></p>\r\n<ul>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><span style=\"font-weight: 400;\">پرنور: این لامپ با توان 50 وات، نوردهی بسیار مناسبی را ارائه می&zwnj;دهد و می&zwnj;تواند فضاهای بزرگ را به راحتی روشن کند.</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><strong>کم&zwnj;مصرف:</strong><span style=\"font-weight: 400;\"> این لامپ با مصرف انرژی تنها 20 وات، می&zwnj;تواند تا 90 درصد در مصرف انرژی صرفه&zwnj;جویی کند.</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><strong>طول عمر بالا: </strong><span style=\"font-weight: 400;\">این لامپ با طول عمر بیش از 25000 ساعت، نیاز به تعویض مکرر را به حداقل می&zwnj;رساند.</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><strong>نوردهی یکنواخت: </strong><span style=\"font-weight: 400;\">این لامپ با پخش نور یکنواخت، جلوه&zwnj;ای زیبا و طبیعی به فضا می&zwnj;بخشد.</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><strong>عدم تولید اشعه فرابنفش و مادون قرمز:</strong><span style=\"font-weight: 400;\"> این لامپ هیچ گونه اشعه مضری تولید نمی&zwnj;کند و برای سلامتی انسان بی خطر است.</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><strong>مقاوم در برابر ضربه: </strong><span style=\"font-weight: 400;\">این لامپ از جنس پلاستیک مقاوم ساخته شده است و در برابر ضربه و خراش بسیار مقاوم است.</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><strong>قابل استفاده در تمامی فضاها:</strong><span style=\"font-weight: 400;\"> این لامپ با طراحی مدرن و جذاب خود، می&zwnj;تواند در فضاهای مختلف مانند اتاق نشیمن، اتاق خواب، آشپزخانه، راهرو و ... مورد استفاده قرار گیرد.</span></li>\r\n</ul>\r\n<p><strong>کاربردها:</strong></p>\r\n<p><span style=\"font-weight: 400;\">لامپ اس ام دی 50 وات دونیکو طرح سفینه مدل XA-004 به دلیل پرنور بودن، طول عمر بالا و نوردهی یکنواخت، برای استفاده در فضاهای مختلف مانند اتاق نشیمن، اتاق خواب، آشپزخانه، راهرو و ... مناسب است. این لامپ همچنین می&zwnj;تواند برای نورپردازی محیط&zwnj;های تجاری و صنعتی نیز مورد استفاده قرار گیرد.</span></p>\r\n<p><strong>جمع بندی:</strong></p>\r\n<p><span style=\"font-weight: 400;\">لامپ اس ام دی 50 وات دونیکو طرح سفینه مدل XA-004 یک محصول باکیفیت و مقرون به صرفه است که با ویژگی&zwnj;های منحصربه&zwnj;فرد خود، می&zwnj;تواند گزینه مناسبی برای استفاده در فضاهای مختلف باشد. این لامپ با پرنور بودن، طول عمر بالا و نوردهی یکنواخت، می&zwnj;تواند به خوبی نیازهای روشنایی شما را برآورده کند.</span></p>\r\n<p data-sourcepos=\"1:1-1:93\"><br /><br /></p>",
                                "variants": [
                                    {
                                        "base_id": 33096,
                                        "id": "DILG0082",
                                        "inStock": "Infinity",
                                        "price": "2850000.0",
                                        "keys": [
                                            10632,
                                            3
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 33092,
                                        "id": "",
                                        "inStock": "0",
                                        "price": "2850000.0",
                                        "keys": [],
                                        "images": [
                                            {
                                                "id": 20109,
                                                "styles": [
                                                    {
                                                        "height": 600,"width": 600,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdm5SIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--3bd8c28cde0eca7ea99c246efb10cdd709d1f38a/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/DILG0082_a.jpg"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ],
                                "images": [
                                    {
                                        "id": 20109,
                                        "styles": [
                                            {
                                                "height": 600,"width": 600,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdm5SIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--3bd8c28cde0eca7ea99c246efb10cdd709d1f38a/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/DILG0082_a.jpg"
                                            }
                                        ]
                                    }
                                ],
                                "optionTypes": [
                                    {"id": 2,"name": "rangenoor","optioValues": [{"id": 3,"name": "Mahtabi"}]},
                                    {"id": 1,"name": "brand","optioValues": [{"id": 10632,"name": "دونیکو"}]}
                                ],
                                "optioValues": [],
                                "properties": [{"key": "حداقل ولتاژ برای قطع شدن جریان","value": "170 ولت"},{"key": "حداکثر ولتاژ برای قطع شدن جریان","value": "250 ولت"}]
                            },
                            {
                                "id": 17288,
                                "name": " لامپ ال ای دی 100 وات پارس شوان مدل H/100 پایه  E40",
                                "description": "<p data-sourcepos=\"5:1-5:331\">لامپ ال ای دی 100 وات پارس شوان مدل H/100 پایه E40 یک انتخاب عالی برای محیط های بزرگی مانند انبارها، کارگاه ها، سالن های ورزشی و... است. این لامپ با توان 100 وات و میزان روشنایی 9000 لومن، نوری بسیار زیاد و یکنواخت را در محیط ایجاد می کند. همچنین، طول عمر این لامپ 25000 ساعت است که برای استفاده در محیط های پرتردد بسیار مناسب است.</p>\r\n<p data-sourcepos=\"5:1-5:331\">&nbsp;</p>\r\n<p data-sourcepos=\"16:1-16:73\"><strong>مزایای استفاده از لامپ ال ای دی 100 وات پارس شوان مدل H/100 پایه E40:</strong></p>\r\n<ul data-sourcepos=\"18:1-22:0\">\r\n<li data-sourcepos=\"18:1-18:181\">نور بسیار زیاد: این لامپ با توان 100 وات نوری بسیار زیاد را در محیط منتشر می کند. این نور برای روشنایی محیط های بزرگ مانند انبارها، کارگاه ها، سالن های ورزشی و... بسیار مناسب است.</li>\r\n<li data-sourcepos=\"19:1-19:95\">طول عمر بالا: این لامپ با طول عمر 25000 ساعت برای استفاده در محیط های پرتردد بسیار مناسب است.</li>\r\n<li data-sourcepos=\"20:1-20:79\">مصرف انرژی پایین: این لامپ با مصرف انرژی پایین، هزینه های برق را کاهش می دهد.</li>\r\n<li data-sourcepos=\"21:1-22:0\">تنوع رنگ نور: این لامپ در دو رنگ آفتابی و مهتابی موجود است که امکان انتخاب رنگ نور مناسب را برای کاربر فراهم می کند.</li>\r\n</ul>\r\n<p data-sourcepos=\"29:1-29:289\">&nbsp;این لامپ با توان 100 وات، میزان روشنایی 9000 لومن، طول عمر 25000 ساعت، زاویه نوردهی 200 درجه، رده انرژی +A و تنوع رنگ نور، انتخابی مناسب برای کاربرانی است که به دنبال یک لامپ با کیفیت و با دوام هستند.</p>",
                                "variants": [
                                    {
                                        "base_id": 33094,"id": "PNLG0039","inStock": "Infinity","price": "6700000.0",
                                        "keys": [10589,4],
                                        "images": []
                                    },
                                    {
                                        "base_id": 33093,
                                        "id": "PNLG0038",
                                        "inStock": "Infinity",
                                        "price": "6700000.0",
                                        "keys": [
                                            10589,
                                            3
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 33088,
                                        "id": "",
                                        "inStock": "0",
                                        "price": "6700000.0",
                                        "keys": [],
                                        "images": [
                                            {
                                                "id": 20108,
                                                "styles": [
                                                    {
                                                        "height": 600,
                                                        "width": 600,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdmJSIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--413aff7f977e8d4dd38279539e9c085083d71985/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/PNLG0038_a.jpg"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ],
                                "images": [
                                    {
                                        "id": 20108,
                                        "styles": [
                                            {
                                                "height": 600,
                                                "width": 600,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdmJSIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--413aff7f977e8d4dd38279539e9c085083d71985/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/PNLG0038_a.jpg"
                                            }
                                        ]
                                    }
                                ],
                                "optionTypes": [
                                    {
                                        "id": 2,"name": "rangenoor",
                                        "optioValues": [{"id": 4,"name": "Aftabi"},{"id": 3,"name": "Mahtabi"}]
                                    },
                                    {
                                        "id": 1,
                                        "name": "brand",
                                        "optioValues": [
                                            {"id": 10589,"name": "parsshouan"}
                                        ]
                                    }
                                ],
                                "optioValues": [],
                                "properties": [{"key": "حداقل ولتاژ برای قطع شدن جریان","value": "170 ولت"},{"key": "حداکثر ولتاژ برای قطع شدن جریان","value": "250 ولت"}]
                            },
                            {
                                "id": 17287,
                                "name": "لامپ ال ای دی سفینه ای 40 وات دونیکو ",
                                "description": "<p><strong>لامپ LED سفینه ای 40 وات E27 دونیکو:&nbsp;</strong></p>\r\n<p><span style=\"font-weight: 400;\">نورپردازی یکی از مهم&zwnj;ترین عوامل در ایجاد فضایی دلنشین و آرامش&zwnj;بخش است. لامپ&zwnj;های LED به دلیل مصرف انرژی پایین، طول عمر بالا و نوردهی یکنواخت، به&zwnj;عنوان یکی از بهترین گزینه&zwnj;های نورپردازی شناخته می&zwnj;شوند.</span></p>\r\n<p><span style=\"font-weight: 400;\">لامپ LED سفینه ای 40 وات E27 دونیکو یکی از محصولات باکیفیت و مقرون به صرفه این شرکت است که با ویژگی&zwnj;های منحصربه&zwnj;فرد خود، می&zwnj;تواند گزینه مناسبی برای استفاده در فضاهای مختلف باشد.</span></p>\r\n<p><strong>مزایا:</strong></p>\r\n<ul>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><strong>پرنور:</strong><span style=\"font-weight: 400;\"> لامپ LED سفینه ای دونیکو با توان 40 وات، نوری پرنور و درخشان را ایجاد می&zwnj;کند که برای روشنایی فضاهای بزرگ و متوسط مناسب است.</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><strong>کم&zwnj;مصرف:</strong><span style=\"font-weight: 400;\"> لامپ LED سفینه ای دونیکو با مصرف انرژی فقط 40 وات، می&zwnj;تواند تا 80 درصد در مصرف انرژی صرفه&zwnj;جویی کند.</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><strong>طول عمر بالا:</strong><span style=\"font-weight: 400;\"> لامپ LED سفینه ای دونیکو با طول عمر بیش از 25 هزار ساعت، نیاز به تعویض مکرر را از بین می&zwnj;برد.</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><strong>نوردهی یکنواخت: </strong><span style=\"font-weight: 400;\">لامپ LED سفینه ای دونیکو با نوردهی یکنواخت خود، باعث ایجاد فضایی دلنشین و آرامش&zwnj;بخش می&zwnj;شود.</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><strong>عدم تولید اشعه فرابنفش و مادون قرمز:</strong><span style=\"font-weight: 400;\"> لامپ LED سفینه ای دونیکو هیچ&zwnj;گونه اشعه مضر فرابنفش و مادون قرمزی تولید نمی&zwnj;کند و برای سلامتی انسان بی&zwnj;خطر است.</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><strong>مقاوم در برابر ضربه:</strong><span style=\"font-weight: 400;\"> لامپ LED سفینه ای دونیکو با بدنه مقاوم در برابر ضربه، در برابر آسیب&zwnj;های احتمالی مقاوم است.</span></li>\r\n<li style=\"font-weight: 400;\" aria-level=\"1\"><strong>قابل استفاده در تمامی فضاها:</strong><span style=\"font-weight: 400;\"> لامپ LED سفینه ای دونیکو با قابلیت نصب در تمامی پایه&zwnj;های E27، برای استفاده در تمامی فضاها مناسب است.</span></li>\r\n</ul>\r\n<p><strong>کاربردها:</strong></p>\r\n<p><span style=\"font-weight: 400;\">لامپ LED سفینه ای 40 وات E27 دونیکو به دلیل پرنور بودن، طول عمر بالا و نوردهی یکنواخت، برای استفاده در فضاهای مختلف مانند اتاق نشیمن، اتاق خواب، آشپزخانه، راهرو و &hellip; مناسب است.</span></p>\r\n<p><strong>نتیجه&zwnj;گیری:</strong></p>\r\n<p><span style=\"font-weight: 400;\">لامپ LED سفینه ای 40 وات E27 دونیکو با ویژگی&zwnj;های منحصربه&zwnj;فرد خود، گزینه مناسبی برای افرادی است که به دنبال لامپ LED پرنور، کم&zwnj;مصرف و با طول عمر بالا هستند. این لامپ با نوردهی یکنواخت خود، می&zwnj;تواند فضایی دلنشین و آرامش&zwnj;بخش را ایجاد کند.</span></p>\r\n<p data-sourcepos=\"1:1-1:85\"><br /><br /><br /></p>",
                                "variants": [
                                    {
                                        "base_id": 33090,
                                        "id": "ELDILG0072",
                                        "inStock": "Infinity",
                                        "price": "2090000.0",
                                        "keys": [
                                            3,
                                            10632
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 33089,
                                        "id": "ELDILG0070",
                                        "inStock": "Infinity",
                                        "price": "2090000.0",
                                        "keys": [
                                            10632,
                                            4
                                        ],
                                        "images": []
                                    },
                                    {
                                        "base_id": 33086,
                                        "id": "",
                                        "inStock": "0",
                                        "price": "2090000.0",
                                        "keys": [],
                                        "images": [
                                            {
                                                "id": 20106,
                                                "styles": [
                                                    {
                                                        "height": 600,"width": 600,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdkxSIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--190d454f6ec3e84ee0c648c0ea96b92011aca16a/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/DILG0070_a.jpg"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ],
                                "images": [
                                    {
                                        "id": 20106,
                                        "styles": [
                                            {
                                                "height": 600,"width": 600,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdkxSIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--190d454f6ec3e84ee0c648c0ea96b92011aca16a/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/DILG0070_a.jpg"
                                            }
                                        ]
                                    }
                                ],
                                "optionTypes": [
                                    {"id": 2,"name": "rangenoor","optioValues": [{"id": 4,"name": "Aftabi"},{"id": 3,"name": "Mahtabi"}]},
                                    {"id": 1,"name": "brand","optioValues": [{"id": 10632,"name": "دونیکو"}]}
                                ],
                                "optioValues": [],
                                "properties": [{"key": "حداقل ولتاژ برای قطع شدن جریان","value": "170 ولت"},{"key": "حداکثر ولتاژ برای قطع شدن جریان","value": "250 ولت"}]
                            },
                            {
                                "id": 17284,
                                "name": "لامپ ال ای دی 50 وات پارس شوان مدل H-50 پایه E27 ",
                                "description": "<p data-sourcepos=\"24:1-24:70\"><strong>مزایای استفاده از لامپ ال ای دی 50 وات پارس شوان مدل H-50 پایه E27</strong></p>\r\n<ul data-sourcepos=\"26:1-31:0\">\r\n<li data-sourcepos=\"26:1-26:14\">روشنایی بالا</li>\r\n<li data-sourcepos=\"27:1-27:25\">صرفه جویی در مصرف انرژی</li>\r\n<li data-sourcepos=\"28:1-28:12\">عمر طولانی</li>\r\n<li data-sourcepos=\"29:1-29:17\">بدون جیوه و سرب</li>\r\n<li data-sourcepos=\"30:1-31:0\">بدون اشعه ماورا بنفش</li>\r\n</ul>\r\n<p data-sourcepos=\"48:1-48:246\">لامپ ال ای دی 50 وات پارس شوان مدل H-50 پایه E27 یک انتخاب عالی برای افرادی است که به دنبال یک لامپ روشن، کم مصرف و با عمر طولانی هستند. این لامپ با ویژگی های منحصر به فرد خود می تواند جایگزین مناسبی برای لامپ های رشته ای، فلورسنت و هالوژنی باشد.</p>",
                                "variants": [
                                    {
                                        "base_id": 33085,"id": "PNLG0037","inStock": "Infinity","price": "2400000.0","keys": [10589,4],
                                        "images": []
                                    },
                                    {
                                        "base_id": 33083,"id": "PNLG0036","inStock": "Infinity","price": "2400000.0",
                                        "keys": [10589,3],
                                        "images": []
                                    },
                                    {
                                        "base_id": 33080,"id": "","inStock": "0","price": "2400000.0","keys": [],
                                        "images": [
                                            {
                                                "id": 20104,
                                                "styles": [
                                                    {
                                                        "height": 600,"width": 600,
                                                        "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdTdSIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--49abd7d7e3004a334700e120150929e93fd5a85e/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/PNLG0036_a.jpg"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ],
                                "images": [
                                    {
                                        "id": 20104,
                                        "styles": [
                                            {
                                                "height": 600,"width": 600,
                                                "url": "/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdTdSIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--49abd7d7e3004a334700e120150929e93fd5a85e/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2REdkeVlYWnBkSGxKSWd0alpXNTBaWElHT3daVU9ndHlaWE5wZW1WSklnMDJNREI0TmpBd1BnWTdCbFE2QzJWNGRHVnVkRUFJT2c5aVlXTnJaM0p2ZFc1a1NTSUpjMmh2ZHdZN0JsUTZESEYxWVd4cGRIbHBWUT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--c832c7a891b75267d6f73832476cf5be3d82c592/PNLG0036_a.jpg"
                                            }
                                        ]
                                    }
                                ],
                                "optionTypes": [
                                    {"id": 2,"name": "rangenoor","optioValues": [{"id": 4,"name": "Aftabi"},{"id": 3,"name": "Mahtabi"}]},
                                    {"id": 1,"name": "brand","optioValues": [{"id": 10589,"name": "parsshouan"}]}
                                ],
                                "optioValues": [],
                                "properties": [{"key": "حداقل ولتاژ برای قطع شدن جریان","value": "170 ولت"},{"key": "حداکثر ولتاژ برای قطع شدن جریان","value": "250 ولت"}]
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
        },
        v_updateMyVitrin() {
            return true;
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
        v_mahsoolate_entekhab_shode() {
            return ['3', '4', '5']
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