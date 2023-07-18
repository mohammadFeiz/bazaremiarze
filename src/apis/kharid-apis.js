import Axios from "axios";
import nosrcImage from './../images/no-src.png';
import nosrc from './../images/no-src.png';
import foroosheVijeIcon from './../images/forooshe-vije-icon.png';
import belexbillboard from './../images/belex-billboard.png';
import belexIcon from './../images/belex-icon.png';
import yaldaye_roshanayi from './../images/yaldaye-roshanayi.png';
import yaldaye_batri from './../images/yaldaye-batri.png';
import gheymat_haye_ghadim_icon from './../images/gheymat-haye-ghadim-icon.png';
import tarh_aglami_icon from './../images/tarh_aglami_icon.png';
import eydane_roshanayi from './../images/eydane-roshanayi.png';
import staticBelexData from './belexdata';
export default function kharidApis({ getState,helper }) {
  //let { baseUrl, userInfo } = getState()
  return {
    async price_list_download({url,fileName,id,date}){
        let {baseUrl} = getState();
        await Axios({
          url: `${baseUrl}/BackOffice/DownloadPdf/${id}`, //your url
          method: 'GET',
          responseType: 'blob', // important
      }).then((response) => {
          // create file link in browser's memory
          const href = URL.createObjectURL(response.data);
      
          // create "a" HTML element with href to file & click
          const link = document.createElement('a');
          link.href = href;
          let name = date.split(' ');
          name = name[0].split('/').concat(name[1].split(':')).join('_') + '_' + fileName
          link.setAttribute('download', name); //or any other extension
          document.body.appendChild(link);
          link.click();
      
          // clean up "a" element & remove ObjectURL
          document.body.removeChild(link);
          URL.revokeObjectURL(href);
      });
      // let response = await Axios.get(`${baseUrl}/BackOffice/Download2/${id}`);
      // const urll = window.URL.createObjectURL(
      //   new Blob([response.data]),
      // );
      // //const url = window.URL.createObjectURL(new Blob([response.data]));
      // const link = document.createElement('a');
      // link.href = urll;
      // link.setAttribute('download', 'file.pdf');
      // document.body.appendChild(link);
      // link.click();
      // const url = window.URL.createObjectURL(
      //   new Blob([blob]),
      // );
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute(
      //   'download',
      //   `${res.data.data.url}`,
      // );

      // // Append to html link element page
      // document.body.appendChild(link);

      // // Start download
      // link.click();

      // // Clean up and remove the link
      // link.parentNode.removeChild(link);
      // const downloadFile = (
      //   filePath = res.data.data.url,
      //   fileName = 'Example-PDF-file.pdf',
      // ) => {
        // fetch(`${res.data.data.downloadUrl}`, {
        //   method: 'GET',
        //   headers: {
        //     'Content-Type': 'application/pdf',
        //   },
        // })
        //   .then(response => response.blob())
        //   .then(blob => {
        //     const url = window.URL.createObjectURL(new Blob([blob]));
    
        //     const link = document.createElement('a');
        //     link.href = url;
        //     link.download = fileName;
    
        //     document.body.appendChild(link);
    
        //     link.click();
    
        //     link.parentNode.removeChild(link);
        //   });
        
      return {result:true}
    },
    async price_list(){
  
      let {baseUrl} = getState();
      let res = await Axios.get(`${baseUrl}/BackOffice/GetAllPriceList`);
      let pdfs;
      pdfs = res.data.data.map((o) => {return{id : o.id , brand : o.brand , date : helper.getDateAndTime(o.modifiedDate).dateAndTime , fileName : o.name , url : o.downloadUrl}})
      return {result:pdfs}
    },
    async priceList_add({brandText,file}){
      
      let {baseUrl} = getState();
      let formdata = new FormData();
      formdata.append("File" , file.file);
      formdata.append("Brand" , brandText);     
      let res = await Axios.post(`${baseUrl}/BackOffice/AddPriceList` , formdata)
      let result = {
        brand : res.data.data.brand , 
        id : res.data.data.id ,
        date : res.data.data.modifiedDate , 
        fileName : res.data.data.name ,
        url : res.data.data.downloadUrl
      }
      return {result:result}
    },
    async priceList_remove(id){
      let {baseUrl} = getState();
      let res = await Axios.get(`${baseUrl}/BackOffice/DeletePriceList/${id}`)
      if(res.data.isSuccess === true){
        return {result:true}
    }
    return {result:false}
    },
    async get_backoffice() {
      let { baseUrl,backOffice } = getState()
      const response = await Axios.get(`${baseUrl}/BackOffice/GetLastCampaignManagement`);
      let result = typeof response.data.data.jsonData === 'string'?JSON.parse(response.data.data.jsonData):backOffice;
      return { result };
    },
    async set_backoffice(JsonData) {
      let { baseUrl } = getState()
      const response = await Axios.post(`${baseUrl}/BackOffice/UpdateCampaignManagement`,{JsonData:JSON.stringify(JsonData)});
      let result;
      if(!!response.data.isSuccess){
        result = true
      }
      else {
        result = response.data.message;
      }
      return { result };
    },
    async eydane_registered() {
      let { baseUrl } = getState()
      const result = await Axios.get(`${baseUrl}/Users/GetEydaneStatus`);
      return { result: result.data.isSuccess && result.data.data };
    },
    async updateProductPrice({ products, campaign, campaignId, cartId }) {
      if (!products) { return {result:false} }
      let { fixPrice } = getState();
      let config = products.map(({ defaultVariant }) => {return { ItemCode: defaultVariant.code , itemCode : defaultVariant.code , ItemQty: 1 , itemQty : 1 };})
      let fixed = fixPrice(config, campaignId)
      if (!fixed[0].B1Dscnt) {fixed = fixPrice(config, campaignId, true);}
      let res = products.map((o, i) => {return { ...o, ...fixed[i], cartId }})
      return {result:res};
    },
    async taide_noorvare(name) {
      let { baseUrl } = getState()
      let result = Axios.get(`${baseUrl}/Users/Norvareh3Agreement`);
      return { result }
    },
    async tarikhche_sefareshate_kharid() {
      let { baseUrl, userInfo } = getState()
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
        { text: 'تحویل شده', orders: [] },
        { text: 'لغو شده', orders: [] },
        { text: 'مرجوع شده', orders: [] }
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
        Returned: [-390, 'مرجوع شده', 'مرجوع شده'],//
        Cancelled: [-290, 'لغو شده', 'لغو شده'],//
        Rejected: [-190, 'در حال بررسی', 'رد شده'],//
        NotSet: [0, 'در حال بررسی', 'نا مشخص'],//
        PendingPreOrder: [100, 'در حال بررسی', 'ارسال شده برای ویزیتور'],//
        PreOrder: [120, 'در حال بررسی', 'در حال بررسی'],//
        CustomerApproved: [130, 'در حال بررسی', 'در حال بررسی'],//
        VisitorApproved: [140, 'در حال بررسی', 'در حال بررسی'],//
        SuperVisorApproved: [150, 'در حال بررسی', 'در حال بررسی'],//
        ManagerApproved: [160, 'در حال بررسی', 'در حال بررسی'],//
        Registered: [190, 'در حال بررسی', 'سفارش ثبت شده'],//
        SalesApproved: [210, 'در حال بررسی', 'تایید واحد مالی'],//
        WaitingForPayment: [220, 'در انتظار پرداخت', 'در انتظار پرداخت'],//
        PaymentPassed: [230, 'در حال پردازش', 'پرداخت شده'],//
        PaymentApproved: [290, 'در حال پردازش', 'پرداخت شده'],//
        WarhousePicked: [350, 'در حال پردازش', 'آماده سازی جهت حمل'],//
        DeliveryPacked: [370, 'در حال پردازش', 'آماده سازی جهت حمل'],//
        Delivered: [390, 'تحویل شده', 'تحویل شده'],//
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
    async mahsoolate_sefareshe_kharid(order) {
      let { userInfo, backOffice, baseUrl } = getState()
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

      let Skus = [];
      const products = result.marketingLines.map((i) => {
        Skus.push(i.itemCode)
        return { ...i, src: nosrcImage, details: [] };
      })

      let srcs = await Axios.post(`${baseUrl}/Spree/Products`, {
        Skus: Skus.toString(),
        PerPage: 250,
        Include: "default_variant,images"
      });
      const included = srcs.data.data.included;

      for (const item of srcs.data.data.data) {

        const defaultVariantId = item.relationships.default_variant.data.id;
        const defaultVariantImagesId = item.relationships.images.data.map(x => x.id);
        const defaultVariant = included.find(x => x.type === "variant" && x.id === defaultVariantId);

        const defaultVariantImages = included.filter(x => x.type === "image" && defaultVariantImagesId.includes(x.id));
        const defaultVariantSku = defaultVariant.attributes.sku;
        if (!defaultVariantSku) {
          console.error('there is an item without sku');
          console.error('items is:', item)
          continue
        }
        const srcs = defaultVariantImages.map(x => "https://spree.burux.com" + x.attributes.original_url);
        let firstItem = products.find(x => x.itemCode === defaultVariantSku);
        if (firstItem === null || firstItem === undefined) continue;
        firstItem.src = srcs[0];
      }

      //PayDueDate:'ByDelivery',
      let dic1 = {
        'ByDelivery': 'نقد',
        'By15Days': 'چک 15 روزه',
        'ByMonth': 'چک 30 روزه',
        'By45Days': 'چک 45 روزه',
        'By60Days': 'چک 60 روزه'
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
      let nahve_pardakht = dic2[result.marketingdetails.paymentTime];
      let discount;
      try {
        discount = result.marketingdetails.documentDiscount || 0;
      }
      catch { discount = 0; }
      let campaignName = '';
      let details = {
        products,
        nahve_ersal: dic3[result.marketingdetails.deliveryType],
        mohlate_tasvie: result.marketingdetails.paymentTime === 'ByOnlineOrder' ? undefined : dic1[result.marketingdetails.payDueDate],
        nahve_pardakht,
        paymentMethod: result.paymentdetails.paymentTermName,
        visitorName: result.marketingdetails.slpName,
        visitorCode: result.marketingdetails.slpCode,
        customerName: result.cardName,
        customerCode: result.cardCode,
        customerGroup: result.cardGroupCode,
        basePrice: result.documentTotal + discount,
        campaignName,
        address: result.deliverAddress,
        phone: userInfo.landline,
        mobile: userInfo.phoneNumber,
      }
      return { result: { ...order, details } }
    },
    // async userInfo() {
    //   let {userInfo} = getState();
    //   let res = await Axios.post(`${baseUrl}/BOne/GetCustomer`, { "DocCode": userInfo.cardCode });
    //   if(res.status===401){return false;}
    //   try { res = res.data.data.customer }
    //   catch { res = {} }
    //   return res
    // },
    async getCampaigns() {
      let { baseUrl,backOffice } = getState();
      let {tarhHa} = backOffice;
      let ids = Object.keys(tarhHa).filter((name)=>tarhHa[name].defaultShipping.active === true && tarhHa[name].defaultShipping.id.toString() !== '10721' && !!tarhHa[name].defaultShipping.id).map((name)=>tarhHa[name].defaultShipping.id)
      if(!ids.length){return {result:[]}}
      let res = await Axios.get(`${baseUrl}/Spree/GetAllCampaigns?ids=${ids.toString()}`);
      let dataResult = res.data.data.data;
      let includedResult = res.data.data.included;
      let campaigns = dataResult.map((o) => {
        let src = nosrc;
        const imgData = o.relationships.image.data;
        if (imgData !== undefined && imgData != null) {
          const taxonImage = includedResult.find(x => x.type === "taxon_image" && x.id === imgData.id)
          if (taxonImage !== undefined && taxonImage != null) {
            src = "https://spree.burux.com" + taxonImage.attributes.original_url;
          }
        }
        let icon;
        if (o.id === '10947') { icon = yaldaye_batri }
        else if (o.id === '10945') { icon = yaldaye_roshanayi }
        else if (o.id === '10676') { icon = eydane_roshanayi }//عیدانه روشنایی
        else if (o.id === '10721') { icon = gheymat_haye_ghadim_icon }//عیدانه روشنایی
        else if (o.id === '10728') { icon = tarh_aglami_icon }
        let campaignId;
        try {
          campaignId = JSON.parse(o.attributes.meta_description)
        }
        catch {
          campaignId = undefined;
        }
        return { cartId: o.attributes.name, name: o.attributes.name, id: o.id, src: src, campaignId, icon };
      });

      return { result: campaigns };
    },
    async updateCampaignPrice({campaignId, item}) {
      if (campaignId === '10931') {
        let price = {
          '9190': 3650000,
          '9195': 2605000,
          '9191': 3650000,
          '9192': 3650000,
          '9194': 3650000,
          '3582': 1385000,
          '9193': 2605000,
        }[item.ItemCode]
        item.Price = price;
        item.FinalPrice = price;
        item.price = price;
        item.PymntDscnt = 0;
      }
      if (campaignId === '10930') {
        let price = {
          '7702': 699840,
          '7572': 589077,
          '7562': 550080,
          '7732': 1903125,
          '7722': 1450029,
          '7712': 1100064,
          '8922': 1450029,
          '3182': 6343779,
          '4622': 209470,
          '4610': 170750,
          '8932': 1803510,
          '9191': 4687500,
          '9192': 4687500,
          '9193': 3125000,
          '9194': 4687500,
          'x1110': 1119400,
          'NNSR0013': 593800,
          'x1120': 1545000,
          '9195': 3125000,
          '9190': 4687500,
          'x1130': 2499600,
          '6240': 500000,
          'x1140': 3466500,
          '8912': 833400,
          'NNSR0012': 539800,
          '6250': 802100,
        }[item.ItemCode]
        item.Price = price;
        item.FinalPrice = price;
        item.price = price;
        item.PymntDscnt = 0;
      }
      return {result:item}
    },
    async getCampaignProducts(campaign) {
      let {kharidApis} = getState();
      let { id, campaignId, name } = campaign;
      let products = await kharidApis({api:'getProductsByTaxonId',parameter:{ Taxons: id }});
      const finalRes = await kharidApis({api:'updateProductPrice',parameter:{ products, campaignId, cartId: name }});
      let result = [];
      for(let i = 0; i < finalRes.length; i++){
        let o = finalRes[i];
        let res = await kharidApis({
          api:'updateCampaignPrice',
          parameter:{campaignId:id, item:{ ...o, campaign }},
        });
        result.push(res)
      }
      return { result };
    },
    async noorvare3_details() {
      let { baseUrl } = getState();
      let res = await Axios.get(`${baseUrl}/Visit/GiftOnPurchaseByCardCode`)
      let result;
      if (res.data.isSuccess) {
        result = res.data.data.map((o) => {
          return { lamp: o.giftQty, amount: o.minimumPurchase }
        })
      }
      else {
        result = 'خطا'
      }
      return {result}
    },
    async pardakhte_noorvare3({ address, SettleType, PaymentTime, DeliveryType, PayDueDate, total, cartId }) {
      let {baseUrl} = getState();
      let freeLamps;
      if (total < 105000000) {freeLamps = 0;}
      else if (total < 205000000) {freeLamps = 50;}
      else if (total < 405000000) {freeLamps = 100;}
      else {freeLamps = 200}
      let { userInfo, cart } = getState();
      let cartTab = cart[cartId];
      let { getCartItems } = cartTab;
      let cartItems = getCartItems();
      let marketingLines = cartItems.map(({ variantId, count, product }) => {
        let variant = product.variants.find((o) => o.id === variantId)
        return { ItemCode: variant.code, ItemQty: count };
      });
      marketingLines.push({ ItemCode: "2372F", ItemQty: freeLamps });
      let body = {
        "marketdoc": {
          "CardCode": userInfo.cardCode,
          "CardGroupCode": userInfo.groupCode,
          "MarketingLines": marketingLines,
          "DeliverAddress": address,
          "marketingdetails": {
            "Campaign": 20 // Noorvareh3 value
          }
        },
        SettleType, PaymentTime, DeliveryType, PayDueDate
      }
      let res = await Axios.post(`${baseUrl}/BOne/AddNewOrder`, body);
      try {return {result:res.data.data[0].docNum}}
      catch {
        console.log('nv3 error', res)
        return {result:false}
      }
    },
    async jadid_tarin_mahsoolat() {
      let {kharidApis} = getState();
      let products = await kharidApis({api:'getProductsByTaxonId',parameter:{ Taxons: '10715' }});
      let result = await kharidApis({api:'updateProductPrice',parameter:{ products, cartId: 'خرید عادی' }})
      return {result}
    },
    async recommendeds() {
      let {kharidApis} = getState();
      let products = await kharidApis({api:'getProductsByTaxonId',parameter:{ Taxons: '10714' }});
      let result = await kharidApis({api:'updateProductPrice',parameter:{ products, cartId: 'خرید عادی' }})
      return {result}
    },
    async bestSellings() {
      let {kharidApis} = getState();
      let products = await kharidApis({api:'getProductsByTaxonId',parameter:{ Taxons: '10709' }});
      let result = await kharidApis({api:'updateProductPrice',parameter:{ products, cartId: 'خرید عادی' }})
      return {result}
    },
    async preOrders() {
      let { userInfo,baseUrl } = getState();
      let preOrders = { waitOfVisitor: 0, waitOfPey: 0 };
      let res = await Axios.post(`${baseUrl}/Visit/PreOrderStat`, { CardCode: userInfo.cardCode });
      if (!res || !res.data || !res.data.data) {
        console.error('kharidApis.preOrders Error!!!');
        return {result:preOrders};
      }
      let result = res.data.data;
      for (let i = 0; i < result.length; i++) {
        if (['PreOrder', 'CustomeApproved', 'VisitorApproved'].indexOf(result[i]).docStatus !== -1) { preOrders.waitOfVisitor++; }
        if (result[i].docStatus === 'WaitingForPayment') { preOrders.waitOfPey++; }
      }
      return {result:preOrders};
    },
    async search(searchValue) {
      let { baseUrl } = getState();
      let res = await Axios.post(`${baseUrl}/Spree/Products`, { Name: searchValue, PerPage: 250, Include: "images" });
      res = res.data.data.data;
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
      return {result}
    },
    async getCategories() {
      let { baseUrl,kharidApis } = getState();
      let res = await Axios.get(`${baseUrl}/Spree/GetAllCategoriesbyIds?ids=10709,10711,10714,10713,10732`);
      let dataResult = res.data.data.data;
      let included = res.data.data.included;
      let categories = dataResult.map((o) => {
        let src = nosrc;
        const imgData = o.relationships.image.data;
        // const imgIds = imgData.map((x) => x.id);
        if (imgData !== undefined && imgData != null) {
          const taxonImage = included.find(x => x.type === "taxon_image" && x.id === imgData.id)
          if (taxonImage !== undefined && taxonImage != null) {
            src = "https://spree.burux.com" + taxonImage.attributes.original_url;
          }
        }

        return { name: o.attributes.name, cartId: o.attributes.name, id: o.id, src: src };
      });
      for (let i = 0; i < categories.length; i++) {
        categories[i].products = await kharidApis({api:'getCategoryItems',parameter:categories[i]});
      }
      return {result:categories};
    },
    async getCategoryItems(category) {
      let {kharidApis} = getState();
      let products = await kharidApis({api:'getProductsByTaxonId',parameter:{ Taxons: category.id.toString() }});
      let result = await kharidApis({api:'updateProductPrice',parameter:{ products, cartId: 'خرید عادی' }})
      return {result}
    },
    async families() {
      let result = [
        { src: undefined, name: "جنرال", id: "1" },
        { src: undefined, name: "جاینت", id: "2" },
        { src: undefined, name: "پنلی توکار", id: "3" },
      ]
      return {result}
    },
    async familyProducts({ id }) {
      let {kharidApis} = getState(); 
      let result = await kharidApis({api:'getTaxonProducts',parameter:{ Taxons: '10180' }})
      return {result} 
    },
    async getVariantOptionValues({optionValues, optionTypes}) {
      let result = {};
      for (let optionValue of optionValues) {
        let id = optionValue.id.toString();
        for (let i = 0; i < optionTypes.length; i++) {
          let optionTypeId = optionTypes[i].id.toString()
          let items = optionTypes[i].items;
          for (let prop in items) {
            let itemId = prop.toString();
            if (id === itemId) {
              result[optionTypeId] = itemId;
            }
          }
        }
      }
      return {result};
    },
    async getProductVariant({include_variant, include_srcs, b1Result, optionTypes, defaultVariantId, product}) {
      let {kharidApis} = getState();
      let { id, attributes, relationships } = include_variant;
      let srcs = relationships.images.data.map(({ id }) => include_srcs[id.toString()].attributes.original_url)
      const b1_item = b1Result.find((i) => i.itemCode === attributes.sku);
      if (!b1_item) {
        return {result:false}
      }
      let price, discountPrice, discountPercent, inStock, dropShipping;
      try { price = b1_item.finalPrice } catch { price = 0 }
      try { discountPercent = b1_item.pymntDscnt } catch { discountPrice = 0 }
      try { inStock = !!b1_item.canSell } catch { inStock = 0 }
      try { dropShipping = b1_item.qtyRelation === 4 } catch { dropShipping = 0 }
      try { discountPrice = Math.round(b1_item.price * discountPercent / 100) } catch { discountPrice = 0 }
      let optionValues = await kharidApis({api:'getVariantOptionValues',parameter:{optionValues:relationships.option_values.data, optionTypes}})
      let code = '';
      if (b1_item && b1_item.itemCode) { code = b1_item.itemCode }
      else {
        // console.error(`missing itemCode`)
        // console.error('product is : ' ,product);
        // console.error('b1_item is :', b1_item);
      }
      let result = {
        id, optionValues, discountPrice, price, inStock, srcs,
        dropShipping, code, discountPercent, isDefault: defaultVariantId === id
      };
      return {result}
    },
    async sortIncluded(spreeResult) {
      let sorted = { include_optionTypes: {}, include_details: {}, include_srcs: {}, meta_optionTypes: {}, include_variants: {} }
      for (let i = 0; i < spreeResult.included.length; i++) {
        let include = spreeResult.included[i];
        let { type, id } = include;
        id = id.toString();
        if (type === 'option_type') { sorted.include_optionTypes[id] = include }
        else if (type === 'product_property') { sorted.include_details[id] = include }
        else if (type === 'image') { sorted.include_srcs[id] = include }
        else if (type === 'variant') { sorted.include_variants[id] = include }
      }
      for (let i = 0; i < spreeResult.meta.filters.option_types.length; i++) {
        let optionType = spreeResult.meta.filters.option_types[i];
        sorted.meta_optionTypes[optionType.id.toString()] = optionType;
      }
      return {result:sorted}
    },
    async getMappedAllProducts({ spreeResult, b1Result, loadType }) {
      let {kharidApis} = getState()
      if (loadType === 0) {

        const included = spreeResult.included;
        let finalResult = [];

        for (const item of spreeResult.data) {

          const defaultVariantId = item.relationships.default_variant.data.id;
          const defaultVariantImagesId = item.relationships.images.data.map(x => x.id);
          const defaultVariant = included.find(x => x.type === "variant" && x.id === defaultVariantId);
          const defaultVariantImages = included.filter(x => x.type === "image" && defaultVariantImagesId.includes(x.id));
          const defaultVariantSku = defaultVariant.attributes.sku;

          if (!defaultVariantSku) {
            // console.error('there is an item without sku');
            // console.error('items is:',item)
            continue
          }
          const itemFromB1 = b1Result.find(x => x.itemCode === defaultVariantSku);
          const srcs = defaultVariantImages.map(x => {
            return "https://spree.burux.com" + x.attributes.original_url;
          });

          if (itemFromB1 === undefined) continue;

          const dropShipping = itemFromB1.qtyRelation === 4;
          finalResult.push({
            name: item.attributes.name, id: item.id,
            dropShipping, inStock: !!itemFromB1 && !!itemFromB1.canSell, details: [], optionTypes: [], variants: [], srcs,
            defaultVariant: { code: defaultVariantSku, srcs },
            price: 0, discountPrice: 0, discountPercent: 0
          });
        }

        return {result:finalResult};
      }

      let products = spreeResult.data;
      let { include_optionTypes, include_variants, include_details, include_srcs, meta_optionTypes } = await kharidApis({api:'sortIncluded',parameter:spreeResult});
      var finalResult = [];
      for (let product of products) {
        let { relationships } = product;

        if (!relationships.variants.data || !relationships.variants.data.length) {
          // console.error(`product width id = ${product.id} has not any varinat`)
          // console.log('spree item is', product);
          continue;
        }
        let optionTypes = [];
        for (let i = 0; i < relationships.option_types.data.length; i++) {
          let { id } = relationships.option_types.data[i];
          id = id.toString();
          if (!meta_optionTypes[id]) {
            // console.error(`in product by id = ${product.id} in relationships.option_types.data[${i}] id is ${id}. but we cannot find this id in meta.filters.option_values`)
            // console.log('product is', product)
            // console.log('meta.filters.option_values is', meta_optionTypes)
            continue;
          }
          let { option_values } = meta_optionTypes[id];
          let { attributes } = include_optionTypes[id];
          let items = {}
          for (let j = 0; j < option_values.length; j++) {
            let o = option_values[j];
            items[o.id.toString()] = o.presentation;
          }
          optionTypes.push({ id, name: attributes.name, items })
        }
        if (!optionTypes.length) { continue }
        let details = [];
        for (let i = 0; i < relationships.product_properties.data.length; i++) {
          let detail = relationships.product_properties.data[i];
          let { id } = detail;
          id = id.toString();
          let { attributes } = include_details[id];
          let { name, value } = attributes;
          details.push([name, value])
        }
        let srcs = [];
        for (let i = 0; i < relationships.images.data.length; i++) {
          let { id } = relationships.images.data[i];
          id = id.toString();
          let { attributes } = include_srcs[id];
          let { original_url } = attributes;
          srcs.push("https://spree.burux.com" + original_url)
        }
        let variants = [];
        let defaultVariant;
        let inStock = false;
        let defaultVariantId = product.relationships.default_variant.data.id;
        for (let i = 0; i < relationships.variants.data.length; i++) {
          let { id } = relationships.variants.data[i];
          id = id.toString();
          let variant = await kharidApis({
            api:'getProductVariant',
            parameter:{include_variant:include_variants[id],include_srcs,b1Result,optionTypes,defaultVariantId,product}
          })
          if (variant === false) { continue }
          if (variant.isDefault) { defaultVariant = variant }
          inStock = !!inStock || !!variant.inStock;
          variants.push(variant)
        }
        let price = 0, discountPrice = 0, discountPercent = 0;
        if (defaultVariant) {
          price = defaultVariant.price;
          discountPrice = defaultVariant.discountPrice;
          discountPercent = defaultVariant.discountPercent;
        }
        else {
          // console.error(`product width id = ${product.id} has not default variant`)
          // console.log('spree item is', product);
          continue;
        }
        finalResult.push({
          inStock, details, optionTypes, variants, srcs, name: product.attributes.name, defaultVariant,
          price, discountPrice, discountPercent, id: product.id
        })
      }
      return {result:finalResult};
    },
    async shippingPayment(obj) {
      let {kharidApis} = getState()
      let { cartId, PayDueDate, SettleType } = obj;
      let result;
      if (cartId === 'بلکس') {
        if (SettleType === 16) {result = await kharidApis({api:'pardakhte_belex',parameter:obj,name:'پرداخت بلکس'})}
        else {result = await kharidApis({api:'sabte_belex',parameter:obj,name:'ثبت بلکس'});}
      }
      else if (cartId === 'فروش ویژه') {
        if (PayDueDate === 16) {result = await kharidApis({api:'pardakhte_foroosheVije',parameter:obj,name:'پرداخت فروش ویژه'})}
        else {result = await kharidApis({api:'sabte_foroosheVije',parameter:obj,name:'ثبت فروش ویژه'});}
      }
      else if (cartId === 'نورواره 3') {result = await kharidApis({api:'pardakhte_noorvare3',parameter:obj,name:'پرداخت نورواره 3'});}
      else {result = await kharidApis({api:'sendToVisitor',parameter:obj,name:'ثبت خرید'})}
      return {result}
    },
    async sendToVisitor({ address, SettleType, PaymentTime, DeliveryType, PayDueDate, cartId }) {
      let { userInfo, cart,baseUrl } = getState();
      let cartItems = cart[cartId].getCartItems();
      let body = {
        "marketdoc": {
          "CardCode": userInfo.cardCode,
          "CardGroupCode": userInfo.groupCode,
          "MarketingLines": cartItems.map(({ product, variantId, count }) => {
            let variant = product.variants.find((v) => v.id === variantId)
            return { ItemCode: variant.code, ItemQty: count }
          }),
          "DeliverAddress": address,
          "marketingdetails": {}
        },
        SettleType, PaymentTime, DeliveryType, PayDueDate
      }
      let res = await Axios.post(`${baseUrl}/BOne/AddNewOrder`, body);
      if(res.data.isSuccess){
        try { return {result:{orderNumber:res.data.data[0].docNum}}}
        catch { 
          console.log('5567',res)
          return {result:'خطا در محاسبه result:res.data.data[0].docNum برای مشاهده ریسپانس خروجی 5567 در کنسول را بررسی کنید'} 
        }
      }
      else {
        return {result:res.data.message}
      }
    },
    async getProductFullDetail({ id, code, product }) {
      //پروداکت رو همینجوری برای اینکه یک چیزی ریترن بشه فرستادم تو از کد و آی دی آبجکت کامل پروداکت رو بساز و ریترن کن
      let {baseUrl,userInfo,fixPrice,kharidApis} = getState();
      let res = await Axios.post(`${baseUrl}/Spree/Products`,
        {Ids: id,PerPage: 250,Include: "variants,option_types,product_properties,images"}
      );
      if (res.data.data.status === 500) {return {result:false}}
      const productResult = res.data.data.data[0];
      if (productResult === undefined){return {result:{}};}

      const included = res.data.data.included;
      let { relationships } = productResult;
      let variants = [];
      let details = [];
      let optionTypes = [];
      const defaultVariantId = product.defaultVariant.code;
      let response = await kharidApis({api:'sortIncluded',parameter:res.data.data});
      let { include_optionTypes, include_details, meta_optionTypes } = response;
      for (let i = 0; i < relationships.option_types.data.length; i++) {
        let { id } = relationships.option_types.data[i];
        id = id.toString();
        if (!meta_optionTypes[id]) {
          // console.error(`in product by id = ${product.id} in relationships.option_types.data[${i}] id is ${id}. but we cannot find this id in meta.filters.option_values`)
          // console.log('product is', product)
          // console.log('meta.filters.option_values is', meta_optionTypes)
          continue;
        }
        let { option_values } = meta_optionTypes[id];
        let { attributes } = include_optionTypes[id];
        let items = {}
        for (let j = 0; j < option_values.length; j++) {
          let o = option_values[j];
          items[o.id.toString()] = o.presentation;
        }
        optionTypes.push({ id, name: attributes.presentation, items })
      }
      for (const item of relationships.variants.data) {
        const variant = included.find(x => x.type === "variant" && x.id === item.id);
        let varId = variant.id.toString();
        let varSku = variant.attributes.sku;
        if (!varSku) { continue }
        let optionValues = await kharidApis({api:'getVariantOptionValues',parameter:{optionValues:variant.relationships.option_values.data, optionTypes}})
        const variantImagesId = variant.relationships.images.data.map(x => x.id);
        const variantImages = included.filter(x => x.type === "image" && variantImagesId.includes(x.id));
        const srcs = variantImages.map(x => {
          return "https://spree.burux.com" + x.attributes.original_url;
        });
        let price = fixPrice([{ ItemCode: varSku, itemCode : varSku ,ItemQty: 1 , itemQty : 1}])[0];
        if (product.campaign) {
          price = await kharidApis({api:'updateCampaignPrice',parameter:{campaignId:product.campaign.id, item:price}})
        }
        if (price === undefined) continue;
        let sss = userInfo.itemPrices.find(x => x.itemCode === varSku || x.mainSku === varSku);
        if (!sss) { debugger; }
        let { canSell, qtyRelation } = sss;
        variants.push({
          id: varId,
          optionValues,
          inStock: !!canSell,
          dropShipping: qtyRelation === 4,
          srcs,
          code: varSku,
          isDefault: defaultVariantId === varId,
          ...price
        });
      }
      for (let i = 0; i < relationships.product_properties.data.length; i++) {
        let detail = relationships.product_properties.data[i];
        let { id } = detail;
        id = id.toString();
        let { attributes } = include_details[id];
        let { name, value } = attributes;
        details.push([name, value])
      }
      product.details = details;
      product.variants = variants;
      product.optionTypes = optionTypes;
      return {result:product};
    },
    async pardakhte_foroosheVije() {

    },
    async sabte_foroosheVije() {

    },
    async pardakhte_belex({ address, SettleType, PaymentTime, DeliveryType, PayDueDate, amounts }) {
      let { paymentAmount } = amounts;
      let { userInfo, cart,baseUrl,kharidApis } = getState();
      let cartItems = cart['بلکس'].getCartItems()
      let arr = [];
      for (let j = 0; j < cartItems.length; j++) {
        let cartItem = cartItems[j];
        const items = cartItem.count.qtyInPacks;
        let packQty = cartItem.count.packQty;
        for (const key in items) {
          for (let i = 0; i < items[key].length; i++) {
            arr.push({ ...items[key][i], variantId: cartItem.variantId, packQty: packQty });
          }
        }
      }
      let body = {
        "marketdoc": {
          "DocType": 17,
          "CardCode": userInfo.cardCode,
          "CardGroupCode": userInfo.groupCode,
          "MarketingLines": arr.map((o) => {
            return { ItemCode: o.optionValueId, ItemQty: o.count, Price: o.unitPrice, BasePackCode: o.variantId, BasePackQty: o.packQty }
          }),
          "DeliverAddress": address,
          "marketingdetails": { Campaign: 43 }
        },
        SettleType, PaymentTime, DeliveryType, PayDueDate
      }
      let res = await Axios.post(`${baseUrl}/BOne/AddNewOrder`, body);
      let registredOrder;
      try { registredOrder = res.data.data[0] }
      catch { return {result:false} }
      let parameter = {
        order: {
          total: paymentAmount,
          mainDocisDraft: registredOrder.isDraft,
          mainDocNum: registredOrder.docNum,
          code: registredOrder.docEntry
        }
      }
      let result = await kharidApis({api:'pardakhte_kharid',parameter,name:'پرداخت خرید'})
      return {result}
    },
    async sabte_belex({ address, SettleType, PaymentTime, DeliveryType, PayDueDate, amounts }) {
      let { userInfo, cart,baseUrl } = getState();
      let cartItems = cart['بلکس'].getCartItems()
      let arr = [];
      for (let j = 0; j < cartItems.length; j++) {
        let cartItem = cartItems[j];
        const items = cartItem.count.qtyInPacks;
        let packQty = cartItem.count.packQty;
        for (const key in items) {
          for (let i = 0; i < items[key].length; i++) {
            arr.push({ ...items[key][i], variantId: cartItem.variantId, packQty: packQty });
          }
        }
      }
      let body = {
        "marketdoc": {
          "DocType": 17,
          "CardCode": userInfo.cardCode,
          "CardGroupCode": userInfo.groupCode,
          "MarketingLines": arr.map((o) => {
            return { ItemCode: o.optionValueId, ItemQty: o.count, Price: o.unitPrice, BasePackCode: o.variantId, BasePackQty: o.packQty }
          }),
          "DeliverAddress": address,
          "marketingdetails": { Campaign: 43 }
        },
        SettleType, PaymentTime, DeliveryType, PayDueDate
      }
      let res = await Axios.post(`${baseUrl}/BOne/AddNewOrder`, body);
      if(res.data.isSuccess){
        try { return {result:{orderNumber:res.data.data[0].docNum}}}
        catch { 
          console.log('5568',res)
          return {result:'خطا در محاسبه result:res.data.data[0].docNum برای مشاهده ریسپانس خروجی 5568 در کنسول را بررسی کنید'} 
        }
      }
      else {
        return {result:res.data.message}
      }
    },
    async getTaxonProducts({ loadType, Taxons, Name }) {
      let { userInfo,baseUrl } = getState();
      let res = await Axios.post(`${baseUrl}/Spree/Products`,
        {
          CardCode: userInfo.cardCode,Taxons,PerPage: 250,Skame: Name,
          Include: loadType === 0 ? "default_variant,images" : "variants,option_types,product_properties,taxons,images,default_variant"
        }
      );

      if (res.data.data.status === 500) {return {result:false}}
      const spreeData = res.data.data;
      const b1Data = userInfo.itemPrices.map((i) => {
        return {
          "itemCode": i.itemCode,
          "price": 0,
          "finalPrice": 0,
          "b1Dscnt": 0,
          "cmpgnDscnt": 0,
          "pymntDscnt": 0,
          "canSell": i.canSell
        };
      });
      let result = await kharidApis({api:'getMappedAllProducts',parameter:{ spreeResult: spreeData, b1Result: b1Data, loadType }})
      return {result};
    },
    async getProductsByTaxonId({ Taxons }) {
      let { userInfo,baseUrl,kharidApis } = getState();
      let res = await Axios.post(`${baseUrl}/Spree/Products`,
        {
          CardCode: userInfo.cardCode,
          Taxons,
          PerPage: 250,
          ProductFields: "id,name,type,sku,slug,default_variant,images",
          VariantFields: "id,sku,type,images",
          Include: "default_variant,images"
        }
      );
      
      if(!res.data.isSuccess){return {result:res.data.message}}
      const spreeData = res.data.data;
      if(!userInfo.itemPrices){
        helper.showAlert({type:'error',text:`userInfo.itemPrices is not valid`})
        return {result:[]}
      }
      const b1Data = userInfo.itemPrices.map((i) => {
        return {
          "itemCode": i.itemCode,
          "price": 0,
          "finalPrice": 0,
          "b1Dscnt": 0,
          "cmpgnDscnt": 0,
          "pymntDscnt": 0,
          "mainSku": i.mainSku,
          "canSell": i.canSell
          //   "onHand": {
          //   "whsCode": "01",
          //   "qty": 269.3,
          //   "qtyLevel": 300,
          //   "qtyLevRel": "Less"
          // }
        };
      });
      let result = await kharidApis({api:'getModifiedProducts',parameter:{ spreeResult: spreeData, b1Result: b1Data,debug:Taxons === '10709' }})
      if(!Array.isArray(result)){result = []}
      return {result}
    },
    async getModifiedProducts({ spreeResult, b1Result,debug }) {
      let allProducts = [];
      for (const product of spreeResult.data) {
        // 11291 ,
        //11909 ,
        // 11922 ,
        // 12314 ,
        // 12395
        if (product.id === "12395" || product.relationships.default_variant === undefined || product.relationships.default_variant.data === undefined) {      
          continue;
        }

        const productDefaultVariantId = product.relationships.default_variant.data.id;
        const productDefaultVariant = spreeResult.included.find(x => x.type === "variant" && x.id === productDefaultVariantId);
        const productDefaultVariantSku = productDefaultVariant.attributes.sku;
        const defaultVariantImagesId = product.relationships.images.data.map(x => x.id);
        const defaultVariantImages = spreeResult.included.filter(x => x.type === "image" && defaultVariantImagesId.includes(x.id));

        if (productDefaultVariantSku && productDefaultVariantId) {
          const itemFromB1 = b1Result.find(x => x.itemCode === productDefaultVariantSku || x.mainSku === productDefaultVariantSku);
          const srcs = defaultVariantImages.map(x => "https://spree.burux.com" + x.attributes.original_url);

          if (itemFromB1 !== undefined && itemFromB1) {
            const defVariantFinalResult = {
              "id": productDefaultVariantId,
              "discountPrice": 0,
              "price": 0,
              "inStock": !!itemFromB1 && !!itemFromB1.canSell,
              "dropShipping": itemFromB1.qtyRelation === 4,
              "srcs": [],
              "code": productDefaultVariantSku,
              "discountPercent": 0,
              "isDefault": true
            };
            let aaa = {
              inStock: !!itemFromB1 && !!itemFromB1.canSell, details: [], optionTypes: [], variants: [defVariantFinalResult], srcs,
              name: product.attributes.name, defaultVariant: defVariantFinalResult,
              price: 0, discountPrice: 0, discountPercent: 0, id: product.id
            }
            allProducts.push(
              aaa
            );
          }
        }
        else {
          if(!productDefaultVariantSku){
            console.error(`missing sku in default variant of product`);
            console.error(`product is : `,product);
            console.error(`default variant is : `,productDefaultVariant);
            console.error(`defaultVariant.attributes.sku is : `,productDefaultVariantSku);
          }
        }
      }
      
      
      return {result:allProducts};
    },
    async setBackOffice(backOffice) {
      return {result:true}
    },
    async getCart() {
      let {baseUrl} = getState();
      let res = await Axios.get(`${baseUrl}/orderuidata`);
      let result = '{}';
      try {result = res.data.data[0].jsonData || '{}';}
      catch {result = '{}'}
      let cart = JSON.parse(result)
      if (typeof cart !== 'object') {return {result:{}}}
      let keys = Object.keys(cart)
      let { backOffice, campaigns } = getState();
      let { activeManager } = backOffice;
      let newCart = {}
      for (let i = 0; i < keys.length; i++) {
        let cartTab = cart[keys[i]];
        if (!cartTab.items) { return {result:{}} }
        if (activeManager[keys[i]] !== undefined && activeManager[keys[i]] === false) { continue }

        if (activeManager.campaigns === false) {
          let res = campaigns.find((o) => o.name === keys[i]);
          if (res) {
            if (activeManager[keys[i]] === false) { continue }
          }
        }
        if (activeManager.noorvare3 === false) {
          if (keys[i] === 'نورواره 3') {continue}
        }
        newCart[keys[i]] = cart[keys[i]]
      }
      return {result:newCart}
    },
    async setCart(cart) {
      let {baseUrl} = getState()
      let result = await Axios.post(`${baseUrl}/orderuidata/updatejson`, { JsonData: JSON.stringify(cart) });
      return {result}
    },
    async dargah({ amount, url }) {
      //AIOServiceShowAlert({type:'success',text:'text',subtext:'test'})
      let {baseUrl} = getState();
      let res = await Axios.get(`${baseUrl}/payment/request?price=${amount}&cbu=${url}`);
      if (res.data.isSuccess) {
        let { getUserInfo } = getState();
        getUserInfo()
        window.location.href = res.data.data;
      }
    },
    async pardakhte_kharid({ order }) {
      let {baseUrl} = getState();
      let res = await Axios.post(`${baseUrl}/payment/request`, {
        "Price": Math.round(order.total),
        "IsDraft": order.mainDocisDraft,
        "DocNum": order.mainDocNum,
        "DocEntry": order.code,
        "CallbackUrl": baseUrl === 'https://retailerapp.bbeta.ir/api/v1' ? 'https://uiretailerapp.bbeta.ir/' : 'https://bazar.miarze.com/'
      });
      if (res.data.isSuccess) {
        let { getUserInfo } = getState();
        try{
          getUserInfo()
        }
        catch(err){
          console.log(err)
          getUserInfo()
        }
        //window.location.href = res.data.data;
      }
    },
    async belexData(){
      // let {baseUrl} = getState();
      // let response = await Axios.get(`${baseUrl}/BackOffice/GetBelexData`);
      // let result = response.data.data.taxons;
      let result = staticBelexData;
      return {result}
    },
    async daryafte_ettelaate_belex() {
      // let res = await Axios.get(`https://spreeapi.bpilot.ir/api/Spreegw/GetItemsDataRaw?campaign=8`);
      // //if(res.data.isvalid !=undefined && !res.data.isvalid) debugger;
      // // else{
      // //   localStorage.setItem("TESTTT",JSON.stringify(res.data));
      // // }

      // //let allData=JSON.parse(localStorage.getItem("TESTTT"));
      // let allData = [];
      // //allData = res;
      // allData=res.data[0];
      // //allData = allData.Array[0].data;
      // allData=allData.taxons;
      let {kharidApis} = getState();
      let belexdata = await kharidApis({
        api:'belexData',name:'دریافت دیتای بلکس',def:[]
      })
      let allData = belexdata;
      var items = [];
      for (const i1 of allData.filter(x => x.taxonid !== 159)) {
        if (i1.items) items.push(i1.items.filter(x => x.itemcodes != null));
        if (!i1.taxons) continue;
        for (const i2 of i1.taxons) {
          if (i2.items) items.push(i2.items.filter(x => x.itemcodes != null));
          if (!i2.taxons) continue;
          for (const i3 of i2.taxons) {
            if (i3.items) items.push(i3.items.filter(x => x.itemcodes != null));
            if (!i3.taxons) continue;
            for (const i4 of i3.taxons) {
              if (i4.items) items.push(i4.items.filter(x => x.itemcodes != null));
              if (!i4.taxons) continue;
              for (const i5 of i4.taxons) {
                if (i5.items) items.push(i5.items.filter(x => x.itemcodes != null));
                if (!i5.taxons) continue;
                for (const i6 of i5.taxons) {
                  if (i6.items) items.push(i6.items.filter(x => x.itemcodes != null));
                  if (!i6.taxons) continue;
                  for (const i7 of i6.taxons) {
                    if (i7.items) items.push(i7.items.filter(x => x.itemcodes != null));
                    if (!i7.taxons) continue;
                  }
                }
              }
            }
          }
        }
      }
      var cableItems = [];
      for (const i1 of allData.filter(x => x.taxonid === 159)) {
        if (i1.items) cableItems.push(i1.items.filter(x => x.itemcodes != null));
        if (!i1.taxons) continue;
        for (const i2 of i1.taxons) {

          if (i2.items) cableItems.push(i2.items.filter(x => x.itemcodes != null));
          if (!i2.taxons) continue;
          for (const i3 of i2.taxons) {

            if (i3.items) cableItems.push(i3.items.filter(x => x.itemcodes != null));
            if (!i3.taxons) continue;
            for (const i4 of i3.taxons) {

              if (i4.items) cableItems.push(i4.items.filter(x => x.itemcodes != null));
              if (!i4.taxons) continue;
              for (const i5 of i4.taxons) {

                if (i5.items) cableItems.push(i5.items.filter(x => x.itemcodes != null));
                if (!i5.taxons) continue;
                for (const i6 of i5.taxons) {

                  if (i6.items) cableItems.push(i6.items.filter(x => x.itemcodes != null));
                  if (!i6.taxons) continue;

                  for (const i7 of i6.taxons) {

                    if (i7.items) cableItems.push(i7.items.filter(x => x.itemcodes != null));
                    if (!i7.taxons) continue;
                  }
                }
              }
            }
          }
        }
      }

      let products = [];
      for (const item of items) {

        if (item.length) {

          for (const subItem of item) {

            // var subProduct = {
            //   name:subItem.itemname,
            //   id:subItem.itemid,
            //   finalPrice:subItem.price,
            //   products:subItem.itemcodes.map(x=>{
            //     return {mainsku:x.mainsku,name:x.Name,unitPrice:x.Price,qty:x.Qty,step:x.Step,variants:x.Variants}
            //   })
            // };

            products.push({
              cartId: 'بلکس',
              name: subItem.itemname,
              code: subItem.itemcode,
              price: subItem.price,
              cableCategory: false,
              variants: subItem.itemcodes.map(x => {
                return {
                  mainsku: x.mainsku, name: x.Name, unitPrice: x.Price, qty: x.Qty, step: x.Step, variants: x.Variants,
                  id: x.Name
                }
              }),
              src: subItem.imageurl
            });
          }
        }
      }

      for (const item of cableItems) {

        if (item.length) {

          for (const subItem of item) {

            products.push({
              cartId: 'بلکس',
              name: subItem.itemname,
              code: subItem.itemcode,
              price: subItem.price,
              cableCategory: true,
              variants: subItem.itemcodes.map(x => {
                return {
                  mainsku: x.mainsku, name: x.Name, unitPrice: x.Price, qty: x.Qty, step: x.Step, variants: x.Variants,
                  id: x.Name
                }
              }),
              src: subItem.imageurl
            });
          }
        }
      }

      // for (const tarh of allData) {
      //   let t={masterName:tarh.taxonname,details:[]}

      //   for (const iterator of tarh.taxons) {
      //     let tt={name:iterator.taxonname,taxons:[]};
      //     for (const tax of iterator.taxons) {
      //       if(!tax.items || tax.items==null) return {};
      //       tt.taxons.push({taxonname: tax.taxonname,
      //         taxonId:tax.taxonid,
      //         taxonItems:tax.items.map(x=>{
      //           if(!x.itemcodes || x.itemcodes==null) return {};
      //           return {
      //             itemCode:x.itemcode,
      //             itemId:x.itemid,
      //             itemName:x.itemname,
      //             itemPrice:x.price,
      //             itemImage:x.imageurl,
      //             itemCodes:x.itemcodes.map(xx=>{
      //               if(!xx.Variants || xx.Variants==null) return {};
      //               return {
      //                 name:xx.Name,
      //                 qty:xx.Qty,
      //                 step:xx.Step,
      //                 price:xx.Price,
      //                 variants:xx.Variants.map(xxx=>{
      //                   return {
      //                     code:xxx.Code,
      //                     name:xxx.Name,
      //                     step:xxx.Step,
      //                     priceCoef:xxx.PriceCoef,
      //                     qtyCoef:xxx.QtyCoef
      //                   };
      //                 })
      //               };
      //             })
      //           }
      //         })
      //       });

      //     }

      //     t.details.push(tt);
      //   }

      //   products.push(t);
      // }
      let result = {
        cartId: 'بلکس',
        name: 'بلکس',
        src: belexbillboard,
        icon: belexIcon,
        products
      }
      return {result}
    },
    async daryafte_ettelaate_forooshe_vije() {
      let { userInfo } = getState();
      let res = await Axios.get(`https://spreeapi.bpilot.ir/api/Spreegw/GetItemsDataRaw?cardCode=${userInfo.cardCode}`);
      const allData = res.data;
      let products = [];
      for (const t1 of allData) {
        const taxondepth0 = t1.taxons; // بسته یلدا

        for (const t1 of taxondepth0) {
          const taxondepth1 = t1.taxons; //سایر

          for (const t2 of taxondepth1) {
            const taxondepth2 = t2.taxons; // چسب

            for (const t3 of taxondepth2) {
              const taxondepth3Items = t3.items;
              if (!Array.isArray(taxondepth3Items)) continue;
              let variants = [];
              let optionValues = [];
              let src;
              for (const t3Item of taxondepth3Items) {
                if (!src) { src = t3Item.imageurl; }

                variants.push({
                  name: t3Item.itemname,
                  totalQty: t3Item.itemcodes[0].Qty,
                  finalPrice: t3Item.price,
                  id: t3Item.itemid,
                  unitPrice: t3Item.itemcodes[0].Price
                });

                optionValues = t3Item.itemcodes[0].Variants.map(x => {
                  return { name: x.Name, id: x.Code, step: x.Step };
                });
              }


              products.push({
                cartId: 'فروش ویژه',
                name: t3.taxonname,
                code: t3.taxonid,
                details: [['توان', '144'], ['وزن', '3 کیلوگرم']],
                // optionValues:[{name:'آفتابی',id:'1'},{name:'مهتابی',id:'2'},{name:'انبه ای',id:'3'},{name:'پوست پیازی',id:'4'}],
                optionValues,
                // variants:{cartonQty:(itemTotalQty/itemQytInCarton),qtyInCarton:itemQytInCarton,discountPercent:0,finalPrice:t3Item.price,id:t3Item.itemid},
                variants,
                src: src || nosrc
              });
            }
          }
        }
      }
      let result = {
        cartId: 'فروش ویژه',
        name: 'فروش ویژه',
        src: '',
        icon: foroosheVijeIcon,
        products: products
      }
      return {result}
    },
    async getVersion() {
      let {baseUrl} = getState();
      // let res = await Axios.get(`${baseUrl}/Update/NewVersion`);
      let res = await Axios.get(`${baseUrl}/Update/GetLastVersion`);
      let result;
      if (res.data.isSuccess) {result =  res.data.data.version;}
      else{result = false;}
      return {result}
    },
    async changeVersion() {
      let {baseUrl} = getState();
      let res = await Axios.get(`${baseUrl}/Update/NewVersion`);
      return {result:res.data.isSuccess}
    },
    async kharide_eydane() {
      let { userInfo,baseUrl } = getState();

      // let body = {
      //   "marketdoc":{
      //     "CardCode":userInfo.cardCode,
      //     "CardGroupCode": userInfo.groupCode,
      //     "MarketingLines":[{ ItemCode: 'x1401', ItemQty: 1 }],
      //     "DeliverAddress":userInfo.address,
      //     "marketingdetails":{}
      //   },
      //   SettleType:1,
      //   PaymentTime:5,
      //   DeliveryType:11,
      //   PayDueDate:1
      // }
      let body = {
        "Document": {
          "CardCode": userInfo.cardCode,
          "CardGroupCode": userInfo.groupCode,
          "MarketingLines": [{ ItemCode: 'x1401', ItemQty: 1 }],
          "DeliverAddress": userInfo.address,
          "marketingdetails": {
            SettleType: 1,
            PaymentTime: 5,
            DeliveryType: 11,
            PayDueDate: 1
          }
        },
        "Price": "117021120",
        "CallbackUrl": "https://bazar.miarze.com",
      }
      let res = await Axios.post(`${baseUrl}/PayMent/EydaneRequest`, body);
      let result;
      try {
        window.location.href = res.data.data
      }
      catch { result = false }
      return {result}
    }
  }
}

//تقدی آنلاین