import Axios from "axios";
import nosrcImage from './../images/imgph.png';
import nosrc from './../images/imgph.png';
import staticBundleData from './bundledata';
import AIOStorage from 'aio-storage';
import { I_B1Info, I_PaydueDate_option, I_ShopProps, I_actionClass, I_app_state, I_bundle_product, I_bundle_taxon, I_bundle_variant, I_fixPrice_result, I_itemPrice, I_product, I_product_category, I_product_detail, I_product_optionType, I_state_cart, I_variant, I_variant_optionValues } from "../types";
type I_chekcCode_return = any;
type I_getCampaigns_return = { shopName: string, id: string, CampaignId: number, PriceListNum: number,taxons?:{name:string,id:any,min:number,max:number}[] };
type I_getCategories_return = { name: string, id: string }[]
type I_ni = (p: any, appState?: I_app_state) => any
export type I_getTaxonProducts_p = { category:I_product_category,pageSize?:number,pageNumber?:number,ids?:string,searchValue?:string }
type I_apiFunctions = {
  checkCode: (p: { code: string }) => Promise<{ result: I_chekcCode_return }>,
  tarikhche_sefareshate_kharid: I_ni,
  mahsoolate_sefareshe_kharid: I_ni,
  getCampaigns: (ids: string[],isTaxon?:string) => Promise<{ result: I_getCampaigns_return[] }>,
  getTaxonProducts:(p:I_getTaxonProducts_p, appState: I_app_state)=>Promise<{result:I_product[]}>
  preOrders: I_ni,
  search: I_ni,
  getCategories: (ids: string[], appState?: I_app_state) => Promise<{ result: I_getCategories_return }>
  payment: I_ni,
  getFakeProduct:()=>{result:I_product},
  getProductFullDetail: (product:I_product,appState:I_app_state)=>Promise<{result:I_product}>,
  getCart: (p: any, appState: I_app_state) => Promise<{ result: I_state_cart }>,
  setCart: (cart: I_state_cart, appState: I_app_state) => { result: true }
  dargah: I_ni,
  pardakhte_kharid: I_ni,
  bundleData: I_ni,
  daryafte_ettelaate_bundle: (p:any, appState: I_app_state) => Promise<{ result: I_bundle_taxon[] }>
}
export default function kharidApis({ baseUrl, helper }) {
  let apiFunctions: I_apiFunctions = {
    async checkCode({ code }) {
      const response = await Axios.get(`${baseUrl}/os/couponvalidation?code=${code}`);
      if (response.data.isSuccess) {
        return { result: response.data.data }
      }
      else {
        return { result: response.data.message || response.data.Message }
      }
    },
    async tarikhche_sefareshate_kharid(undefined, { userInfo }) {
      let res = await Axios.post(`${baseUrl}/BOne/GetOrders`, {
        "FieldName": "cardcode",
        "FieldValue": userInfo.cardCode,
        // "StartDate":"2022-06-01",
        "StartDate": "2022-06-01",
        "QtyInPage": 1000,
        "PageNo": 1
      });
      let tabs = [
        { text: 'در حال بررسی', orders: [] },
        { text: 'در انتظار پرداخت', orders: [] },
        { text: 'در حال پردازش', orders: [] },
        { text: 'در حال ارسال', orders: [] },
        { text: 'تحویل شده', orders: [] },
        { text: 'تکمیل شده', orders: [] },
        { text: 'لغو شده', orders: [] }
      ]

      let results;

      try {
        results = res.data.data.results;
      }
      catch {
        console.error(`ای پی آی گرفتن لیست سفارشات درست کار نمیکنه. ریزالتی که از سرور اومده اینه:`, res)
        return { result: tabs }
      }
      // results = [
      //   {docStatus:'Returned',mainDocEntry:'123456',mainDocNum:'53453',mainDocisDraft:false,mainDocTotal:10},
      //   {docStatus:'Cancelled',mainDocEntry:'123456',mainDocNum:'53453',mainDocisDraft:false,mainDocTotal:10},
      //   {docStatus:'Rejected',mainDocEntry:'123456',mainDocNum:'53453',mainDocisDraft:false,mainDocTotal:10},
      //   {docStatus:'NotSet',mainDocEntry:'123456',mainDocNum:'53453',mainDocisDraft:false,mainDocTotal:10},
      //   {docStatus:'PendingPreOrder',mainDocEntry:'123456',mainDocNum:'53453',mainDocisDraft:false,mainDocTotal:10},
      //   {docStatus:'PreOrder',mainDocEntry:'123456',mainDocNum:'53453',mainDocisDraft:false,mainDocTotal:10},
      //   {docStatus:'CustomerApproved',mainDocEntry:'123456',mainDocNum:'53453',mainDocisDraft:false,mainDocTotal:10},
      //   {docStatus:'VisitorApproved',mainDocEntry:'123456',mainDocNum:'53453',mainDocisDraft:false,mainDocTotal:10},
      //   {docStatus:'SuperVisorApproved',mainDocEntry:'123456',mainDocNum:'53453',mainDocisDraft:false,mainDocTotal:10},
      //   {docStatus:'ManagerApproved',mainDocEntry:'123456',mainDocNum:'53453',mainDocisDraft:false,mainDocTotal:10},
      //   {docStatus:'Registered',mainDocEntry:'123456',mainDocNum:'53453',mainDocisDraft:false,mainDocTotal:10},
      //   {docStatus:'SalesApproved',mainDocEntry:'123456',mainDocNum:'53453',mainDocisDraft:false,mainDocTotal:10},
      //   {docStatus:'WaitingForPayment',mainDocEntry:'123456',mainDocNum:'53453',mainDocisDraft:false,mainDocTotal:10},
      //   {docStatus:'PaymentPassed',mainDocEntry:'123456',mainDocNum:'53453',mainDocisDraft:false,mainDocTotal:10},
      //   {docStatus:'PaymentApproved',mainDocEntry:'123456',mainDocNum:'53453',mainDocisDraft:false,mainDocTotal:10},
      //   {docStatus:'WarhousePicked',mainDocEntry:'123456',mainDocNum:'53453',mainDocisDraft:false,mainDocTotal:10},
      //   {docStatus:'DeliveryPacked',mainDocEntry:'123456',mainDocNum:'53453',mainDocisDraft:false,mainDocTotal:10},
      //   {docStatus:'Delivered',mainDocEntry:'123456',mainDocNum:'53453',mainDocisDraft:false,mainDocTotal:10},
      //   {docStatus:'Invoiced',mainDocEntry:'123456',mainDocNum:'53453',mainDocisDraft:false,mainDocTotal:10},
      //   {docStatus:'PartiallyDelivered',mainDocEntry:'123456',mainDocNum:'53453',mainDocisDraft:false,mainDocTotal:10},
      //   {docStatus:'Settlled',mainDocEntry:'123456',mainDocNum:'53453',mainDocisDraft:false,mainDocTotal:10},
      //   {docStatus:'SettledWithBadDept',mainDocEntry:'123456',mainDocNum:'53453',mainDocisDraft:false,mainDocTotal:10},
      // ]

      if (!Array.isArray(results)) { return { result: tabs } }
      let statuses = {
        Returned: [-390, 'لغو شده', 'مرجوع شده'],//
        Cancelled: [-290, 'لغو شده', 'کنسل شده'],//
        Rejected: [-190, 'لغو شده', 'لغو شده'],//
        CustomerApproved: [130, 'در حال بررسی', 'در انتظار بررسی'],//
        Registered: [190, 'در حال بررسی', 'سفارش ثبت شده'],//
        WaitingForPayment: [220, 'در انتظار پرداخت', 'در انتظار پرداخت'],//
        AdvancedPayment: [225, 'در انتظار پرداخت', 'ثبت اولیه پرداخت'],//
        PaymentConflict: [240, 'در انتظار پرداخت', 'مغایرت پرداخت'],//
        PaymentApproved: [310, 'در حال پردازش', 'تایید واحد مالی'],//
        ByDeliveryApproved: [305, 'در حال پردازش', 'تایید پای بار واحد فروش'],//
        PaymentPassed: [230, 'در حال پردازش', 'دریافت اطلاعات پرداخت'],//
        WarhousePicked: [350, 'در حال پردازش', 'عملیات انبار'],//
        PartiallyDelivered: [380, 'در حال ارسال', 'بخشی تحویل شده'],//
        DeliveryPacked: [370, 'در حال ارسال', 'آماده توزیع'],//
        PartiallyDeliveredPartiallyInvoiced: [460, 'در حال ارسال', 'بخشی تحویل برخی فاکتور شده'],//
        PartiallyDeliveredInvoiced: [470, 'در حال ارسال', 'بخشی فاکتور شده'],//
        Delivered: [390, 'تحویل شده', 'تحویل شده'],//
        ShippingRestDeliveryPacked: [480, 'تحویل شده', 'تحویل کامل و برخی فاکتور شده'],//
        Invoiced: [490, 'تکمیل شده', 'فاکتور شده'],//
        // NotSet: [0, 'در حال بررسی', 'نا مشخص'],//
        // PendingPreOrder: [100, 'در حال بررسی', 'ارسال شده برای ویزیتور'],//
        // PreOrder: [120, 'در حال بررسی', 'در حال بررسی'],//
        // VisitorApproved: [140, 'در حال بررسی', 'در حال بررسی'],//
        // SuperVisorApproved: [150, 'در حال بررسی', 'در حال بررسی'],//
        // ManagerApproved: [160, 'در حال بررسی', 'در حال بررسی'],//
        // SalesApproved: [210, 'در حال بررسی', 'تایید واحد مالی'],//
        // PaymentApproved: [290, 'در حال پردازش', 'پرداخت شده'],//
        //Invoiced:[490,'در حال پردازش'],
        //PartiallyDelivered:[380,'در حال پردازش'],
        //Settlled:[590,'نا مشخص'],
        //SettledWithBadDept:[580,'نا مشخص'],
      }

      for (let i = 0; i < results.length; i++) {
        let order = results[i];
        let { date, time } = helper.getDateAndTime(order.mainDocDate);
        if (!statuses[order.docStatus]) { continue }
        let tab = tabs.find(({ text }) => text === statuses[order.docStatus][1]);
        tab.orders.push({
          code: order.mainDocEntry,
          docStatus: order.docStatus,
          translate: statuses[order.docStatus][2],
          mainDocNum: order.mainDocNum,
          mainDocisDraft: order.mainDocisDraft,
          mainDocType: order.mainDocType,
          date,
          _time: time,
          total: order.mainDocTotal,
        })
      }
      return { result: tabs };
    },
    async mahsoolate_sefareshe_kharid(order, { userInfo }) {
      const docTypeDictionary = {
        Customer: 2,
        Quotation: 23,
        Order: 17,
        Invoice: 13,
        CreditMemo: 14,
        MarketingDraft: 112,
        PaymentDraft: 140,
        ReturnRequest: 234000031,
        Return: 16,
        Delivery: 15,
        PickList: 156,
        IncomingPayment: 24,
        OutgoingPayment: 46,
        ProductionOrder: 202,
        DownPayment: 203,
        InventoryTransfer: 67,
        GoodsReceipt: 59,
        GoodsIssue: 60,
        InventoryTransferReuqest: 1250000001,
        PurchaseOrder: 22,
        PurchaseQuotation: 540000006,
        PurchaseRequest: 1470000113,
      };

      let res = await Axios.post(`${baseUrl}/BOne/GetDocument`, {
        "DocEntry": order.code,
        "DocType": docTypeDictionary[order.mainDocType],
        "isDraft": order.mainDocisDraft
      });

      let result = res.data.data.results;
      if(result===null){
        return {result:'خطا در دریافت اطلاعات'}
      }
      let Skus = [];
      let products = result.marketingLines.map((i) => {
          Skus.push(i.itemCode)
          return { ...i, src: nosrcImage, details: [] };
        })

      //moede-pardakht
      //PayDueDate:'ByDelivery',
      let dic1 = {
        'ByDelivery': 'به روز',
        'By15Days': 'چک 15 روزه',
        'ByMonth': 'چک 30 روزه',
        'By45Days': 'چک 45 روزه',
        'By60Days': 'چک 60 روزه',
        'Cash10_OneMonth90': '10% نقد مابقی چک یک ماهه',
        'Cash40_FourMonth60': '40% نقد مابقی چک 4 ماهه',
        'Cash30_ThreeMonth70': '30% نقد مابقی چک 3 ماهه',
        'Golden1500_45Days': 'قرارداد طلایی 1500 میلیونی 45 روزه',
        'Golden900_40Days': 'قرارداد طلایی 900 میلیونی 40 روزه',
        'Golden600_OneMonth': 'قرارداد طلایی 600 میلیونی 30 روزه',
        'Golden300_OneMonth': 'قرارداد طلایی 300 میلیونی 30 روزه',
        'Golden180_OneMonth': 'قرارداد طلایی 180 میلیونی 30 روزه',
        'Golden90_OneMonth': 'قرارداد طلایی 90 میلیونی 30 روزه',
        'Golden50_OneMonth': 'قرارداد طلایی 50 میلیونی 30 روزه',
        'Cash20_TwoMonth80': '20% نقد مابقی چک 2 ماهه',
        'Cash50_FourMonth50': '50% نقد مابقی چک 4 ماهه',
        'Cash40_ThreeMonth60': '40% نقد مابقی چک 3 ماهه',
        'Cash30_TwoMonth70': '30% نقد مابقی چک 2 ماهه',
        'Cash50_OneMonth50': '50% نقد مابقی چک 1 ماهه',
        'Cash10_FourMonth90': '10% نقد مابقی چک 4 ماهه',
        'Cash10_ThreeMonth90': '10% نقد مابقی چک 3 ماهه',
        'Cash10_TwoMonth90': '10% نقد مابقی چک 2 ماهه',
        'Cash50_FiveMonth50': '50% نقد مابقی چک 5 ماهه',
        'Cash30_FourMonth70': '30% نقد مابقی چک 4 ماهه',
        'Cash20_ThreeMonth80': '20% نقد مابقی چک 3 ماهه',
        'Cash50_ThreeMonth50': '50% نقد مابقی چک 3 ماهه',
        'Cash25_TwoMonth75': '25% نقد مابقی چک 2 ماهه',
        'By6Months': '6 ماه بعد',
        'By5_5Months': '5 ماه و نیم بعد',
        'By5Months': '5 ماه بعد',
        'By4_5Months': '4 ماه و نیم بعد',
        'By4Months': '4 ماه بعد',
        'By3_5Months': '3 ماه و نیم بعد',
        'By3Months': '3 ماه بعد ',
        'By75Days': '2 ماه و نیم بعد',
        'NotSet': 'تعیین نشده',
      }
      //PaymentTime:'ByOnlineOrder'

      let dic2 = {
        'ByOnlineOrder': 'اینترنتی',
        'ByOrder': 'واریز قبل ارسال',
        'ByDelivery': 'واریز پای بار'
      }
      //DeliveryType:'BRXDistribution'
      let dic3 = {
        'BRXDistribution': 'ماشین توزیع بروکس',
        'RentalCar': 'ماشین اجاره ای',
        'Cargo': 'باربری',
        'HotDelivery': 'پخش گرم',
        'BySalesMan': 'ارسال توسط ویزیتور'
      }
      //cmpaigns
      let dic4 = {
        'EidanehCredit': 'عیدانه چکی',
        'EidanehCash': 'عیدانه نقدی',
        'ItemDis1402_69': 'طرح اقلامی زمستان 1402',
        'NA': 'فروش عادی',
        'HeavyItemDis1402_69': 'طرح اقلامی سنگین زمستان 1402',
        // 'QtyWinter': 'حبابی های زمستان 1402',
        // 'ItemDis1402': 'طرح اقلامی زمستان 1402',
        // 'Belex403_National_Tools': 'فروش اقلامی همایش بلکس 2023',
        // 'Belex403_National_Packs': 'بسته های اقلامی همایش بلکس 2023',
        // 'ClubCredit': 'فروش امتیازی باشگاه',
        // 'Belex403_National': 'همایش بلکس 2023',
        // 'Golden10W1402': '10 وات طلایی اپ الکتریکی',
        // 'Belex402_HMD': 'همایش همدان 1402'
      }
      //nahve-tasvie
      let dic5 = {
        'Cash': 'نقد',
        'Cheque': 'چکی',
        'Hybrid': 'ترکیبی',
        'NotSet': 'تنظیم نشده',
        'pos': 'کارتخوان',
        'online': 'آنلاین',
        'card': 'کارت به کارت',
        'pos_cheque': 'کارتخوان-چک',
        'online_cheque': 'آنلاین-چک',
        'card_cheque': 'کارت به کارت-چک',
        'ClubPoint': 'امتیاز باشگاه',
      }

      let campain_name = dic4[result.marketingdetails.campaign];

      let nahve_pardakht = dic2[result.marketingdetails.paymentTime];

      let nahve_tasvie = dic5[result.marketingdetails.settleType];

      let discount;

      try {
        discount = result.marketingdetails.documentDiscount || 0;
      }

      catch { discount = 0; }

      // let campaignName = '';
      let details = {
        products,
        nahve_ersal: dic3[result.marketingdetails.deliveryType],
        moede_pardakht: result.marketingdetails.paymentTime === 'ByOnlineOrder' ? undefined : dic1[result.marketingdetails.payDueDate],
        nahve_pardakht,
        // paymentMethod: result.paymentdetails.paymentTermName,
        nahve_tasvie,
        visitorName: result.marketingdetails.slpName,
        visitorCode: result.marketingdetails.slpCode,
        customerName: result.cardName,
        customerCode: result.cardCode,
        customerGroup: result.cardGroupCode,
        // basePrice: result.documentTotal + discount,
        basePrice: result.marketingdetails.discountList.showTotalBfDis,
        docDiscount: result.marketingdetails.documentDiscount * 1.09,
        //campaignName
        campain_name,
        address: result.deliverAddress,
        phone: userInfo.landlineNumber,
        mobile: userInfo.phoneNumber,
        discountPercent: result.marketingdetails.documentDiscountPercent,
        takhfif_vizhe: result.marketingdetails.discountList.showDisValue,
        darsad_takfif_vizhe: result.marketingdetails.discountList.showDisPer,
      }
      return { result: { ...order, details } }
    },
    async getCampaigns(ids,isTaxon) {
      if (!ids) { return { result: [] } }
      if (!ids.length) { return { result: [] } }
      let res = await Axios.get(`${baseUrl}/Spree/GetAllCampaigns?ids=${ids.toString()}`);
      let dataResult = res.data.data.data;
      let includedResult = res.data.data.included;
      
      let campaigns:I_getCampaigns_return[] = dataResult.map((o,i) => {
        let src = nosrc;
        let taxons = []
          try{
            taxons = includedResult.map(({attributes,id})=>{
              let {name,description}:{name:string,description:string} = attributes;
              let min = 0,max = 0;
              try{
                let arr = description.split(' ');
                let nums = arr.filter((o)=>!isNaN(+o)).map((o)=>+o * 1000000);
                let num1 = nums[0]
                let num2 = nums[1];
                min = Math.min(num1,num2);
                max = Math.max(num1,num2);
              }
              catch{}
              return {id,name,min,max}
            });
          }
          catch{}

        const imgData = o.relationships.image.data;
        if (imgData !== undefined && imgData != null) {
          const taxonImage = includedResult.find(x => x.type === "taxon_image" && x.id === imgData.id)
          if (taxonImage !== undefined && taxonImage != null) {
            src = "https://spree.burux.com" + taxonImage.attributes.original_url;
          }
        }
        let obj;
        try { obj = JSON.parse(o.attributes.meta_description) }
        catch { obj = {}; }
        let result:I_getCampaigns_return = { taxons,shopName: o.attributes.name, id: o.id, CampaignId: obj.CampaignId, PriceListNum: obj.PriceListNum };
        return result;
      });

      return { result: campaigns };
    },
    async preOrders(undefined, { userInfo }) {
      let preOrders = { waitOfVisitor: 0, waitOfPey: 0 };
      let res = await Axios.post(`${baseUrl}/Visit/PreOrderStat`, { CardCode: userInfo.cardCode });
      if (!res || !res.data || !res.data.data) {
        console.error('apis.kharid.preOrders Error!!!');
        return { result: preOrders };
      }
      let result = res.data.data;
      for (let i = 0; i < result.length; i++) {
        if (['PreOrder', 'CustomeApproved', 'VisitorApproved'].indexOf(result[i].docStatus) !== -1) { preOrders.waitOfVisitor++; }
        if (result[i].docStatus === 'WaitingForPayment') { preOrders.waitOfPey++; }
      }
      return { result: preOrders };
    },
    async search(searchValue) {
      let response = await Axios.post(`${baseUrl}/Spree/Products`, { Name: searchValue, PerPage: 250, Include: "images" });
      let res = response.data.data.data;
      let included = res.data.data.included;
      let result = res.map((o) => {
        let src;
        try {
          let imgId = o.relationships.images.data[0].id;
          src = included.filter((m) => m.id === imgId)[0].attributes.original_url;
        }
        catch { src = ""; }
        return { name: o.attributes.name, price: o.attributes.price, unit: "", src: `https://spree.burux.com${src}`, discountPercent: 0, discountPrice: 0 };
      });
      return { result }
    },
    async getCategories(ids) {
      //10709,10711,10713,10714,10715,10732
      let res = await Axios.get(`${baseUrl}/Spree/GetAllCategoriesbyIds?ids=${ids.toString()}`);
      let dataResult = res.data.data.data;
      let categories = dataResult.map((o) => {
        return { name: o.attributes.name, id: o.id };
      });
      return { result: categories };
    },
    async payment(obj, { Shop }) {
      let { shopId } = obj;
      let result = Shop[shopId].payment(obj);
      return { result }
    },
    getFakeProduct(){
      let product:I_product = {
        id:'1231',
        name:'محصول تستی',
        images:[nosrc],
        inStock:true,
        B1Dscnt:10,
        CmpgnDscnt:10,
        PymntDscnt:10,
        FinalPrice:200000, 
        Price:220000,
        hasFullDetail:false,
        category:{shopId:'Regular',shopName:'خرید عادی'}
      }
      return {result:product}
    },
    async getProductFullDetail(product , appState) {
      let spree = new Spree(appState);
      let result = await spree.getProductFullDetail(product)
      return { result };
    },
    async getTaxonProducts(p:I_getTaxonProducts_p, appState) {
      let spree = new Spree(appState);
      let {products,total} = await spree.getTaxonProducts(p)
      //products:I_product[] = appState.apis.request({ api: 'kharid.updateProductPrice', description: '', parameter: { products,shopId:p.shopId } })
      
      return { result:products }
    },
    async getCart({ Shop, userInfo }) {
      try{
        let cartStorage = AIOStorage('bazaremiarzeapis');
        let cart = cartStorage.load({ name: 'cart.' + userInfo.cardCode, def: {shops:{}} });
        let shopIds = Object.keys(Shop);
        let keys = Object.keys(cart.shops)
        let newCart = {shops:{}}
        for (let i = 0; i < keys.length; i++) {
          let shopId = keys[i];
          if (shopIds.indexOf(shopId) === -1) { continue }
          newCart.shops[shopId] = cart.shops[shopId]
        }
        return { result: newCart }
      }
      catch(err){
        console.error('getCart error',err)
        return {result:{shops:{}}}
      }
    },
    setCart(cart, { userInfo }) {
      let cartStorage = AIOStorage('bazaremiarzeapis');
      cartStorage.save({ name: 'cart.' + userInfo.cardCode, value: cart });
      return { result: true }
    },
    async dargah({ amount, url }) {
      //AIOServiceShowAlert({type:'success',text:'text',subtext:'test'})
      let res = await Axios.get(`${baseUrl}/payment/request?price=${amount}&cbu=${url}`);
      if (res.data.isSuccess) {
        window.location.href = res.data.data;
      }
    },
    async pardakhte_kharid({ order }) {
      let res = await Axios.post(`${baseUrl}/payment/request`, {
        "Price": Math.round(order.total),
        "IsDraft": order.mainDocisDraft,
        "DocNum": order.mainDocNum,
        "DocEntry": order.code,
        "CallbackUrl": baseUrl === 'https://retailerapp.bbeta.ir/api/v1' ? 'https://uiretailerapp.bbeta.ir/' : 'https://bazar.miarze.com/'
      });
      if (res.data.isSuccess) {
        window.location.href = res.data.data;
      }
    },
    async bundleData() {return { result: staticBundleData }},
    async daryafte_ettelaate_bundle(allData, { apis }) {
      allData = allData[0].taxons[0].taxons[0].taxons;
      let taxons = []
      for(let i = 0; i < allData.length; i++){
        let {items} = allData[i];
        taxons = [...taxons,...items]
      }
      let result:I_bundle_taxon[] = taxons.map((t)=>{
        let {itemname,description,itemcode,price,itemcodes,imageurl,max = Infinity} = t;
        if(typeof max !== 'number'){max = Infinity}
        let taxon:I_bundle_taxon = {
          shopId:'Bundle',description,id:itemcode,name:itemname,price,image:imageurl,max,
          products:itemcodes.map(({mainsku,Name,Price,Qty,Variants})=>{
            let product:I_bundle_product = {
              id:mainsku,name:Name,qty:Qty,price:Price,
              variants:Variants.map(({Code,Name,Step = 1})=>{
                let variant:I_bundle_variant = {id:Code,name:Name,step:Step}
                return variant
              })
            }
            return product
          })
        }
        return taxon
      })
      return { result }
    },
  }
  return apiFunctions
}

//تقدی آنلاین

type I_spreeResult = {
  data:I_spreeProduct[],
  included:any,
  meta:I_spreeResult_meta
}
type I_spreeProduct = {
  relationships:I_spreeProduct_relationships,
  attributes:I_spreeProduct_attributes,
  id:any
}
type I_spreeVariant = {attributes:{sku:any},relationships:I_spreeVariant_relationships}
type I_spreeVariant_relationships = {
  option_values:{data:{id:any}[]},
  images:{data:{id:any}[]}
}
type I_spreeImage = {attributes:{original_url:string,styles:{url:string}[]}}
type I_spreeProduct_relationships = {
  default_variant:{data:{id:any}},
  images:{data:{id:any}[]},
  option_types:{data:{id:any}[]},
  variants:{data:{id:any}[]},
  product_properties:{data:{id:any}[]}
}
type I_spreeProduct_attributes = {
  name:string,sku:string|number
}
type I_spreeIncluded = {
  optionTypes:any,
  details:{[id:string]:I_spreeDetail},
  images:{[id:string]:I_spreeImage},
  meta_optionTypes:any,
  variants:{[id:string]:I_spreeVariant}
}
type I_spreeDetail = {attributes:{name:string,value:any}}
type I_spreeResult_meta = {
  total_count:number,
  filters:{option_types:{id:any}[]}
}
type I_Spree = {
  appState:I_app_state,
  getIncluded:(spreeResult:I_spreeResult)=>I_spreeIncluded,
  request:(p:{body?:I_Spree_getTaxonProducts,product?:I_product})=>Promise<I_spreeResult | false>,
  getTaxonProducts:(p:I_getTaxonProducts_p)=>Promise<{products:I_product[],total:number}>,
  getProductFullDetail:(product:I_product)=>Promise<I_product>,
  getOptionTypes:(spreeProduct:I_spreeProduct,spreeIncluded:I_spreeIncluded)=>I_product_optionType[],
  getVariants:(shopId:string,spreeProduct:I_spreeProduct,spreeIncluded:I_spreeIncluded,optionTypes:I_product_optionType[]) =>I_variant[],
  getVariantOptionValues:(relationships:I_spreeVariant_relationships,optionTypes:I_product_optionType[]) => I_variant_optionValues,
  getDetails:(spreeProduct:I_spreeProduct,spreeIncluded:I_spreeIncluded) => I_product_detail[]
}
type I_Spree_getTaxonProducts = {
  searchValue?:string,ids?:string,pageSize?:number,pageNumber?:number,
  category:I_product_category
}
class Spree implements I_Spree{
  appState:I_app_state;
  constructor(appState){
    this.appState = appState; 
  }
  getIncluded = (spreeResult:I_spreeResult)=>{
    let sorted:I_spreeIncluded = { 
      optionTypes: {}, details: {}, images: {}, meta_optionTypes: {}, variants: {}
    }
    for (let i = 0; i < spreeResult.included.length; i++) {
      let include = spreeResult.included[i];
      let { type, id } = include;
      id = id.toString();
      if (type === 'option_type') { sorted.optionTypes[id] = include; }
      else if (type === 'product_property') { sorted.details[id] = include; }
      else if (type === 'image') { sorted.images[id] = include; }
      else if (type === 'variant') { sorted.variants[id] = include; }
    }
    for (let i = 0; i < spreeResult.meta.filters.option_types.length; i++) {
      let optionType = spreeResult.meta.filters.option_types[i];
      sorted.meta_optionTypes[optionType.id.toString()] = optionType;
    }
    return sorted
  }
  request = async (p:{body?:I_Spree_getTaxonProducts,product?:I_product})=>{
    let {userInfo,baseUrl} = this.appState;
    let body:any;
    if(p.product){body = { Ids: p.product.id, PerPage: 250, Include: "variants,option_types,product_properties,images" }}
    else if(p.body){
      let {category,searchValue,ids,pageSize = 250,pageNumber} = p.body;
      body = {
        CardCode: userInfo.cardCode, Taxons:category.taxonId || category.shopId, Name:searchValue, ids, PerPage: pageSize, Page: pageNumber,
        ProductFields: "id,name,type,sku,slug,default_variant,images,price",
        VariantFields: "id,sku,type,images",Include: "default_variant,images"
      }
    }
    let res = await Axios.post(`${baseUrl}/Spree/Products`, body); 
    if (!res.data.isSuccess) { alert(res.data.message); return false}
    return res.data.data as I_spreeResult;
  }
  getTaxonProducts = async (parameter:I_getTaxonProducts_p)=>{
    let {category} = parameter;
    let spreeResult = await this.request({body:parameter});
    if(spreeResult === false){
      alert('خطا در دریافت اطلاعات اسپری');
      return {products:[],total:0}
    }
    let total:number = spreeResult.meta.total_count;
    const spreeProducts:I_spreeProduct[] = spreeResult.data;
    const spreeIncluded:I_spreeIncluded = this.getIncluded(spreeResult)
    let products:I_product[] = [];
    for (const spreeProduct of spreeProducts) {
      let product = this.getProduct(spreeProduct,spreeIncluded,category)
      if(product === false){total--}
      else {products.push(product)}
    }
    return { products, total }
  }
  getProductFullDetail = async (product:I_product) => {
    let spreeResult = await this.request({product})
    if(spreeResult === false){return product}
    let spreeProducts:I_spreeProduct[] = spreeResult.data;
    let spreeProduct:I_spreeProduct = spreeProducts[0];
    let spreeIncluded:I_spreeIncluded = this.getIncluded(spreeResult);
    let optionTypes:I_product_optionType[] = this.getOptionTypes(spreeProduct,spreeIncluded);
    let shopId:string = product.category.shopId;
    let variants:I_variant[] = this.getVariants(shopId,spreeProduct,spreeIncluded,optionTypes);
    let details:I_product_detail[] = this.getDetails(spreeProduct,spreeIncluded)
    return {...product,optionTypes,variants,details,hasFullDetail:true}
  }
  getOptionTypes = (spreeProduct:I_spreeProduct,spreeIncluded:I_spreeIncluded) => {
    let {relationships} = spreeProduct,{option_types} = relationships;
    let optionTypes:I_product_optionType[] = [];
    for (let i = 0; i < option_types.data.length; i++) {
      let { id } = option_types.data[i];
      id = id.toString();
      if (!spreeIncluded.meta_optionTypes[id]) {continue;}
      let { option_values } = spreeIncluded.meta_optionTypes[id];
      let { attributes } = spreeIncluded.optionTypes[id];
      let items = {}
      for (let j = 0; j < option_values.length; j++) {
        let {id,presentation} = option_values[j];
        items[id.toString()] = presentation;
      }
      optionTypes.push({ id, name: attributes.presentation, items })
    }
    return optionTypes;
  }
  getVariantOptionValues = (relationships:I_spreeVariant_relationships,optionTypes:I_product_optionType[]) => {
    let {option_values} = relationships;
    let optionValues:I_variant_optionValues = {};
    for (let optionValue of option_values.data) {
      let id = optionValue.id.toString();
      for (let i = 0; i < optionTypes.length; i++) {
        let optionTypeId = optionTypes[i].id.toString()
        let items = optionTypes[i].items;
        for (let prop in items) {
          let itemId = prop.toString();
          if (id === itemId) {
            optionValues[optionTypeId] = itemId;
          }
        }
      }
    }
    return optionValues;
  }
  getDetails = (spreeProduct:I_spreeProduct,spreeIncluded:I_spreeIncluded) => {
    let details:I_product_detail[] = [];
    for (let i = 0; i < spreeProduct.relationships.product_properties.data.length; i++) {
      let {id} = spreeProduct.relationships.product_properties.data[i];
      id = id.toString();
      let { attributes } = spreeIncluded.details[id];
      let { name, value } = attributes;
      details.push([name, value])
    }
    return details;
  }
  getPymntDscnt = (shopId:string)=>{
    let {Shop,backOffice} = this.appState;
    let {PayDueDates} = Shop[shopId];
    let PymntDscnt:number;
    try{
      let firstPayDueDate = PayDueDates[0]
      let firstPayDueDateObject = backOffice.PayDueDate_options.find((o:I_PaydueDate_option)=>o.value.toString() === firstPayDueDate.toString())
      PymntDscnt = firstPayDueDateObject.discountPercent;
    }
    catch{PymntDscnt = 0;}
    return PymntDscnt
  }
  getVariants = (shopId:string,spreeProduct:I_spreeProduct,spreeIncluded:I_spreeIncluded,optionTypes:I_product_optionType[]) => {
    let variants:I_variant[] = []
    for (const spreeVariant of spreeProduct.relationships.variants.data) {
      const {attributes,relationships}:I_spreeVariant = spreeIncluded.variants[spreeVariant.id.toString()]
      let cartInfo = this.getCartInfo(attributes.sku,shopId);
      if(!cartInfo){continue}
      let optionValues = this.getVariantOptionValues(relationships,optionTypes)
      let images = relationships.images.data.map(({id})=>{
        return `https://spree.burux.com${spreeIncluded.images[id].attributes.original_url}`
      })
      let {inStock,B1Dscnt,CmpgnDscnt,PymntDscnt,FinalPrice,Price} = cartInfo; 
      let variant:I_variant = {optionValues,inStock,images,id: attributes.sku,B1Dscnt,PymntDscnt,CmpgnDscnt,FinalPrice,Price}
      variants.push(variant);
    }
    return variants;
  }
  getCartInfo = (sku,shopId)=>{
    if(!sku){return false}
    let {userInfo,b1Info,actionClass,Shop} = this.appState;
    const b1Result = b1Info.itemPrices.find((o) =>  o.itemCode === sku || o.mainSku === sku);
    if (!b1Result) {return false}
    let {CampaignId,PriceListNum} = Shop[shopId];
    let PayDueDate;
    if(CampaignId === 55){debugger}
    try{
      let res = actionClass.autoGetCampaignConditionsByCardCode(CampaignId,userInfo.cardCode,b1Info.customer.groupCode)
      PayDueDate = res.PayDueDate[0]
    }
    catch{}
    let fixPrice_payload = {items:[{ ItemCode: sku, itemCode: sku, ItemQty: 1, itemQty: 1 }], CampaignId, PriceListNum,PayDueDate}
    let fixPrice_results:I_fixPrice_result[] = actionClass.fixPrice(fixPrice_payload)
    let fixPrice_result:I_fixPrice_result = fixPrice_results[0];
    let {canSell,qtyRelation} = b1Result;
    //let dropShipping = qtyRelation === 4
    let {OnHand,B1Dscnt,CmpgnDscnt,FinalPrice,Price} = fixPrice_result;
    if(!OnHand || OnHand === null){OnHand = {qtyLevel:0}}  
    let {qtyLevel = 0} = OnHand;
    let inStock = !!qtyLevel && !!canSell;
    let PymntDscnt = this.getPymntDscnt(shopId);
    return {inStock,B1Dscnt,CmpgnDscnt,PymntDscnt,FinalPrice,Price}
  }
  getProduct = (spreeProduct:I_spreeProduct,spreeIncluded:I_spreeIncluded,category:I_product_category) => { 
    let { relationships,attributes,id } = spreeProduct,name = attributes.name;
    const sku = spreeIncluded.variants[relationships.default_variant.data.id].attributes.sku;
    let cartInfo = this.getCartInfo(sku,category.shopId);
    if(!cartInfo){return false}
    let images = relationships.images.data.map(({id})=>`https://spree.burux.com${spreeIncluded.images[id.toString()].attributes.styles[9].url}`)
    let {inStock,B1Dscnt,CmpgnDscnt,PymntDscnt,FinalPrice,Price} = cartInfo; 
    let product:I_product = {category,images,name,id,inStock,B1Dscnt,PymntDscnt,CmpgnDscnt,FinalPrice,Price,hasFullDetail:false}
    return product;
  }
}