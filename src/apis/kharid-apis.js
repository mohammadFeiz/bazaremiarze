import Axios from "axios";
import nosrcImage from './../images/no-src.png';
import nosrc from './../images/no-src.png';
import foroosheVijeSrc from './../images/forooshe-vije.png';
import foroosheVijeIcon from './../images/forooshe-vije-icon.png';
export default function kharidApis({getState,token,getDateAndTime,showAlert,AIOServiceShowAlert,baseUrl}) {
  return {
    async taide_noorvare(name){
      await Axios.get(`${baseUrl}/Users/Norvareh3Agreement`);
    },
    async ordersHistory() {
      let {userInfo} = getState();
      let res = await Axios.post(`${baseUrl}/BOne/GetOrders`, {
        "FieldName": "cardcode",
        "FieldValue": userInfo.cardCode,
        // "StartDate":"2022-06-01",
        "StartDate": "2022-06-01",
        "QtyInPage": 1000,
        "PageNo": 1
      });
      let results = res.data.data.results;
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

      let tabs = [
        {text:'در حال بررسی',orders:[]},
        {text:'در انتظار پرداخت',orders:[]},
        {text:'در حال پردازش',orders:[]},
        {text:'تحویل شده',orders:[]},
        {text:'لغو شده',orders:[]},
        {text:'مرجوع شده',orders:[]}
      ]
      if(!Array.isArray(results)){return tabs}
      let statuses = {
        Returned:[-390,'مرجوع شده','مرجوع شده'],//
        Cancelled:[-290,'لغو شده','لغو شده'],//
        Rejected:[-190,'در حال بررسی','رد شده'],//
        NotSet:[0,'در حال بررسی','نا مشخص'],//
        PendingPreOrder:[100,'در حال بررسی','ارسال شده برای ویزیتور'],//
        PreOrder:[120,'در حال بررسی','در حال بررسی'],//
        CustomerApproved:[130,'در حال بررسی','در حال بررسی'],//
        VisitorApproved:[140,'در حال بررسی','در حال بررسی'],//
        SuperVisorApproved:[150,'در حال بررسی','در حال بررسی'],//
        ManagerApproved:[160,'در حال بررسی','در حال بررسی'],//
        Registered:[190,'در حال بررسی','سفارش ثبت شده'],//
        SalesApproved:[210,'در حال بررسی','تایید واحد مالی'],//
        WaitingForPayment:[220,'در انتظار پرداخت','در انتظار پرداخت'],//
        PaymentPassed:[230,'در حال پردازش','پرداخت شده'],//
        PaymentApproved:[290,'در حال پردازش','پرداخت شده'],//
        WarhousePicked:[350,'در حال پردازش','آماده سازی جهت حمل'],//
        DeliveryPacked:[370,'در حال پردازش','آماده سازی جهت حمل'],//
        Delivered:[390,'تحویل شده','تحویل شده'],//
        //Invoiced:[490,'در حال پردازش'],
        //PartiallyDelivered:[380,'در حال پردازش'],
        //Settlled:[590,'نا مشخص'],
        //SettledWithBadDept:[580,'نا مشخص'],
      }

      for (let i = 0; i < results.length; i++){
        let order = results[i];
        let {date,time} = getDateAndTime(order.mainDocDate);
        if(!statuses[order.docStatus]){continue}
        let tab = tabs.find(({text})=>text === statuses[order.docStatus][1]);
        tab.orders.push({
          code: order.mainDocEntry,
          docStatus:order.docStatus,
          translate:statuses[order.docStatus][2],
          mainDocNum:order.mainDocNum,
          mainDocisDraft: order.mainDocisDraft,
          mainDocType: order.mainDocType,
          date,
          _time:time,
          total: order.mainDocTotal,
        })
      }
      return tabs;
    },
    async orderProducts(order) {
      let { userInfo } = getState();

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

      const campaignDictionary = {
        NA: 1,
        LinearSpecialSale: 2,
        GoldenWatt: 5,
        Golden10W: 4,
        ArianSpecialSale: 3,
        NULL: 6,
        Noorvareh2: 7,
        NoorvarehSpecial: 8,
        Eidaneh: 9,
        Special10w: 10,
        HotDelivery: 11,
        HotSummer2022: 12,
      }
      let res = await Axios.post(`${baseUrl}/BOne/GetDocument`, {
        "DocEntry": order.code,
        "DocType": docTypeDictionary[order.mainDocType],
        "isDraft": order.mainDocisDraft
      });
      let result = res.data.data.results;

      let Skus = [];
      const products = result.marketingLines.map((i) => {
        Skus.push(i.itemCode)
        return {...i,src: nosrcImage,details: []};
      })

      let srcs = await Axios.post(`${baseUrl}/Spree/Products`, {
        Skus:Skus.toString(),
        PerPage:250,
        Include: "default_variant,images" });
      const included=srcs.data.data.included;

      for (const item of srcs.data.data.data) {

        const defaultVariantId = item.relationships.default_variant.data.id;
        const defaultVariantImagesId = item.relationships.images.data.map(x=>x.id);
        const defaultVariant=included.find(x=>x.type==="variant" && x.id===defaultVariantId);
        const defaultVariantImages=included.filter(x=>x.type==="image" && defaultVariantImagesId.includes(x.id));
        const defaultVariantSku=defaultVariant.attributes.sku;
        if(!defaultVariantSku){
          console.error('there is an item without sku');
          console.error('items is:',item)
          continue
        }
        const srcs = defaultVariantImages.map(x => "https://shopback.miarze.com" + x.attributes.original_url);
        let firstItem = products.find(x=>x.itemCode === defaultVariantSku);
        if(firstItem === null || firstItem === undefined) continue;
        firstItem.src=srcs[0];
      }

      //PayDueDate:'ByDelivery',
      let dic1 = {
        'ByDelivery':'نقد',
        'By15Days':'چک 15 روزه',
        'ByMonth':'چک 30 روزه',
        'By45Days':'چک 45 روزه',
        'By60Days':'چک 60 روزه'
      }
      //PaymentTime:'ByOnlineOrder'

      let dic2 = {
        'ByOnlineOrder':'اینترنتی',
        'ByOrder':'واریز قبل ارسال',
        'ByDelivery':'واریز پای بار'
      }
      //DeliveryType:'BRXDistribution'
      let dic3 = {
        'BRXDistribution':'ماشین توزیع بروکس',
        'RentalCar':'ماشین اجاره ای',
        'Cargo':'باربری',
        'HotDelivery':'پخش گرم',
        'BySalesMan':'ارسال توسط ویزیتور'
      }
      let nahve_pardakht = dic2[result.marketingdetails.paymentTime];
      let discount;
      try{
        discount = result.marketingdetails.documentDiscount || 0;
      }
      catch{discount = 0;}
      return {
        products,
        nahve_ersal:dic3[result.marketingdetails.deliveryType],
        mohlate_tasvie:result.marketingdetails.paymentTime === 'ByOnlineOrder'?undefined:dic1[result.marketingdetails.payDueDate],
        nahve_pardakht,
        paymentMethod: result.paymentdetails.paymentTermName,
        visitorName: result.marketingdetails.slpName,
        visitorCode: result.marketingdetails.slpCode,
        customerName: result.cardName,
        customerCode: result.cardCode,
        customerGroup: result.cardGroupCode,
        basePrice: result.documentTotal + discount,
        campaignName: campaignDictionary[result.marketingdetails.campaign],
        address: result.deliverAddress,
        phone: userInfo.landline,
        mobile: userInfo.phoneNumber,
      }
    },
    async joziatepeygiriyesefareshekharid(order) {
      let { userInfo } = getState();
      let res = await Axios.post(`${baseUrl}/BOne/GetDocument`, {"docentry": order.docEntry,"DocType": order.docType,"isDraft": order.isDraft});
      let result = res.data.data.results;
      let total = 0, basePrice = 0, visitorName, paymentMethod;
      let { marketingLines = [], marketingdetails = {}, paymentdetails = {} } = result;
      visitorName = marketingdetails.slpName;
      paymentMethod = paymentdetails.paymentTermName || '';
      for (let i = 0; i < marketingLines.length; i++) {
        let { priceAfterVat = 0, price = 0 } = result.marketingLines[i];
        total += priceAfterVat;
        basePrice += price;
      }
      let {date,time} = getDateAndTime(result.docTime);
      result = {
        number: order,//
        date,_time:time,
        customerName: result.cardName,//
        customerCode: result.cardCode,//
        customerGroup: result.cardGroupCode,//
        campain: result.marketingdetails.campaign,//
        basePrice,//
        visitorName,//
        address: result.deliverAddress || '',//
        mobile: userInfo.phone1,//
        phone: userInfo.phone2,//
        total,//
        paymentMethod,//
        items: marketingLines.map((o) => {
          return {
            name: o.itemName,//
            count: o.itemQty,//
            discountPrice: o.discount,//
            discountPercent: o.discountPercent,//
            unit: o.unitOfMeasure,//
            price: o.priceAfterVat,//
            src: undefined
          };
        }),
      };
      return result;
    },
    async userInfo() {
      let {userInfo} = getState();
      let res = await Axios.post(`${baseUrl}/BOne/GetCustomer`, { "DocCode": userInfo.cardCode });
      if(res.status===401){return false;}
      try { res = res.data.data.customer }
      catch { res = {} }
      return res
    },
    async getCampaigns() {
      let res = await Axios.get(`${baseUrl}/Spree/GetAllCampaigns?ids=10947,10945`);
      let dataResult = res.data.data.data;
      let includedResult = res.data.data.included;

      let campaigns = dataResult.map((o) => {
        let src = nosrc;
        const imgData = o.relationships.image.data;
        if (imgData !== undefined && imgData != null) {
          const taxonImage = includedResult.find(x => x.type === "taxon_image" && x.id === imgData.id)
          if (taxonImage !== undefined && taxonImage != null) {
            src = "https://shopback.miarze.com" + taxonImage.attributes.original_url;
          }
        }
        let campaignId;
        try{
          campaignId = JSON.parse(o.attributes.meta_description)
        }
        catch{
          campaignId = undefined;
        }
        return { name: o.attributes.name, id: o.id, src: src,campaignId};
      });

      return campaigns;
    },
    updateCampaignPrice(campaignId,obj){
      if(campaignId === '10931'){
        let price = {
          '9190':3650000,
          '9195':2605000,
          '9191':3650000,
          '9192':3650000,
          '9194':3650000,
          '3582':1385000,
          '9193':2605000,
        }[obj.ItemCode]
        obj.Price = price;
        obj.FinalPrice = price;
        obj.price = price;
        obj.PymntDscnt = 0;
      }
      if(campaignId === '10930'){
        let price = {
          '7702':699840,
          '7572':589077,
          '7562':550080,
          '7732':1903125,
          '7722':1450029,
          '7712':1100064,
          '8922':1450029,
          '3182':6343779,
          '4622':209470,
          '4610':170750,
          '8932':1803510,
          '9191':4687500,
          '9192':4687500,
          '9193':3125000,
          '9194':4687500,
          'x1110':1119400,
          'NNSR0013':593800,
          'x1120':1545000,
          '9195':3125000,
          '9190':4687500,
          'x1130':2499600,
          '6240':500000,
          'x1140':3466500,
          '8912':833400,
          'NNSR0012':539800,
          '6250':802100,
        }[obj.ItemCode]
        obj.Price = price;
        obj.FinalPrice = price;
        obj.price = price;
        obj.PymntDscnt = 0;
      }
      return obj
    },
    async getCampaignProducts(campaign) {
      let { id,campaignId } = campaign;
      let res = await this.getProductsByTaxonId({ Taxons: id});
      const finalRes=getState().updateProductPrice(res,campaignId);
      console.log(finalRes);
      return finalRes.map((o) => {
        let res = { ...o, campaign }
        return this.updateCampaignPrice(id,res)
      });
    },
    async newOrders() {
      const taxonProductsList=await this.getProductsByTaxonId({Taxons:'10932'});
      return getState().updateProductPrice(taxonProductsList);
    },
    async recommendeds() {
      let res = await this.getProductsByTaxonId({Taxons:'10550'});
      return getState().updateProductPrice(res);
    },
    async bestSellings(){
      let res = await this.getProductsByTaxonId({Taxons:'10820'});
      return getState().updateProductPrice(res,);
    },
    async preOrders() {
      let {userInfo} = getState();
      let preOrders = { waitOfVisitor: 0, waitOfPey: 0 };
      let res = await Axios.post(`${baseUrl}/Visit/PreOrderStat`, { CardCode: userInfo.cardCode });
      if (!res || !res.data || !res.data.data) {
        console.error('kharidApis.preOrders Error!!!');
        return preOrders;
      }
      let result = res.data.data;
      for (let i = 0; i < result.length; i++) {
        if (['PreOrder','CustomeApproved','VisitorApproved'].indexOf(result[i]).docStatus !== -1) { preOrders.waitOfVisitor++; }
        if (result[i].docStatus === 'WaitingForPayment') { preOrders.waitOfPey++; }
      }
      return preOrders;
    },
    async search(searchValue) {
      let res = await Axios.post(`${baseUrl}/Spree/Products`,{Name:searchValue,PerPage:250,Include:"images"});
      let result = res.data.data.data,included = res.data.data.included;
      return result.map((o) => {
        let src;
        try {
          let imgId = o.relationships.images.data[0].id;
          src = included.filter((m) => m.id === imgId)[0].attributes.original_url;
        }
        catch { src = ""; }
        return { name: o.attributes.name, price: o.attributes.price, unit: "", src: `https://shopback.miarze.com${src}`, discountPercent: 0, discountPrice: 0 };
      });
    },
    async getCategories() {
      let res = await Axios.get(`${baseUrl}/Spree/GetAllCategoriesbyIds?ids=10820,10179,10928,10550,10180`);
      let dataResult = res.data.data.data;
      let included = res.data.data.included;
      let categories = dataResult.map((o) => {
        let src = nosrc;
        const imgData = o.relationships.image.data;
        // const imgIds = imgData.map((x) => x.id);
        if (imgData !== undefined && imgData != null) {
          const taxonImage = included.find(x => x.type === "taxon_image" && x.id === imgData.id)
          if (taxonImage !== undefined && taxonImage != null) {
            src = "https://shopback.miarze.com" + taxonImage.attributes.original_url;
          }
        }

        return { name: o.attributes.name, id: o.id, src: src };
      });
      for (let i = 0; i < categories.length; i++) {
        categories[i].products = await this.getCategoryItems(categories[i]);
      }
      return categories;
    },
    async getCategoryItems(category) {
      // let items = await this.getTaxonProducts({ Taxons: category.id.toString() });
      // return getState().updateProductPrice(items,'kharidApis => getCategoryItems')

      let items = await this.getProductsByTaxonId({ Taxons: category.id.toString() });
      return getState().updateProductPrice(items,'kharidApis => getCategoryItems')
    },
    async families() {
      return [
        { src: undefined, name: "جنرال", id: "1" },
        { src: undefined, name: "جاینت", id: "2" },
        { src: undefined, name: "پنلی توکار", id: "3" },
      ]
    },
    async familyProducts({ id }) {
      return await this.getTaxonProducts({ Taxons: '10180' })
    },
    getVariantOptionValues(optionValues, optionTypes) {
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
      return result;
    },
    getProductVariant(include_variant, include_srcs, b1Result, optionTypes, defaultVariantId,product) {
        let { id, attributes, relationships } = include_variant;
      let srcs = relationships.images.data.map(({ id }) => include_srcs[id.toString()].attributes.original_url)
      const b1_item = b1Result.find((i) => i.itemCode === attributes.sku);
      if(!b1_item){
        return false
      }
      let price, discountPrice, discountPercent, inStock;
      try { price = b1_item.finalPrice } catch { price = 0 }
      try { discountPercent = b1_item.pymntDscnt } catch { discountPrice = 0 }
      try { inStock = b1_item.onHand.qty } catch { inStock = 0 }
      try { discountPrice = Math.round(b1_item.price * discountPercent / 100) } catch { discountPrice = 0 }
      let optionValues = this.getVariantOptionValues(relationships.option_values.data, optionTypes)
      let code = '';
      if(b1_item && b1_item.itemCode){code = b1_item.itemCode}
      else {
        // console.error(`missing itemCode`)
        // console.error('product is : ' ,product);
        // console.error('b1_item is :', b1_item);
      }
      return {
        id, optionValues, discountPrice, price, inStock, srcs,
        code,
        discountPercent,
        isDefault: defaultVariantId === id
      };

    },
    sortIncluded(spreeResult) {
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
      return sorted
    },
    getMappedAllProducts({ spreeResult, b1Result, loadType }) {

      if(loadType===0){

        const included=spreeResult.included;
        let finalResult =[];

        for (const item of spreeResult.data) {

          const defaultVariantId = item.relationships.default_variant.data.id;
          const defaultVariantImagesId = item.relationships.images.data.map(x=>x.id);
          const defaultVariant=included.find(x=>x.type==="variant" && x.id===defaultVariantId);
          const defaultVariantImages=included.filter(x=>x.type==="image" && defaultVariantImagesId.includes(x.id));
          const defaultVariantSku=defaultVariant.attributes.sku;
          if(!defaultVariantSku){
            // console.error('there is an item without sku');
            // console.error('items is:',item)
            continue
          }
          const itemFromB1=b1Result.find(x=>x.itemCode===defaultVariantSku);
          const srcs=defaultVariantImages.map(x=>{
            return "https://shopback.miarze.com" + x.attributes.original_url;
          });

          if(itemFromB1==undefined) continue;

          const defaultVariantQty=itemFromB1.onHand.qty;
          finalResult.push({name:item.attributes.name,id:item.id,
              inStock:defaultVariantQty, details:[], optionTypes:[], variants:[], srcs,
                defaultVariant:{code:defaultVariantSku,srcs},
              price:0, discountPrice:0, discountPercent:0});
        }

        return finalResult;
      }

      let products = spreeResult.data;
      let { include_optionTypes, include_variants, include_details, include_srcs, meta_optionTypes } = this.sortIncluded(spreeResult);
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
        if(!optionTypes.length){continue}
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
          srcs.push("https://shopback.miarze.com" + original_url)
        }
        let variants = [];
        let defaultVariant;
        let inStock = 0;
        let defaultVariantId = product.relationships.default_variant.data.id;
        for (let i = 0; i < relationships.variants.data.length; i++) {
          let { id } = relationships.variants.data[i];
          id = id.toString();
          let variant = this.getProductVariant(include_variants[id], include_srcs, b1Result, optionTypes, defaultVariantId,product)
          if(variant === false){continue}
          if (variant.isDefault) { defaultVariant = variant }
          inStock += variant.inStock;
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
      return finalResult;
    },
    async sendToVisitor({address,SettleType,PaymentTime,DeliveryType,PayDueDate}) {
      let {userInfo,shipping} = getState();
      let body = {
        "marketdoc":{
          "CardCode":userInfo.cardCode,
          "CardGroupCode": userInfo.groupCode,
          "MarketingLines":shipping.cartItems.map((o)=>{
            return { ItemCode: o.variant.code, ItemQty: o.count }
          }),
          "DeliverAddress":address,
          "marketingdetails":{}
        },
        SettleType,PaymentTime,DeliveryType,PayDueDate
      }
      let res = await Axios.post(`${baseUrl}/BOne/AddNewOrder`, body);
      try { return res.data.data[0].docNum }
      catch { return false }
    },
    async getProductFullDetail({id,code,product}){
      //پروداکت رو همینجوری برای اینکه یک چیزی ریترن بشه فرستادم تو از کد و آی دی آبجکت کامل پروداکت رو بساز و ریترن کن
      let res = await Axios.post(`${baseUrl}/Spree/Products`,
            {
              Ids: id,
              PerPage:250,
              Include: "variants,option_types,product_properties,images"
            }
          );

      if(res.data.data.status === 500){
        return false
      }

      const productResult=res.data.data.data[0];
      if(productResult==undefined)
        return {};

      const included = res.data.data.included;
      let { relationships } = productResult;
      let {fixPrice} = getState();
      let variants = [];
      let details = [];
      let optionTypes = [];
      const defaultVariantId=product.defaultVariant.code;
      let { include_optionTypes, include_variants, include_details, include_srcs, meta_optionTypes } = this.sortIncluded(res.data.data);

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
        const variant = included.find(x=>x.type==="variant" && x.id===item.id);
        let varId = variant.id.toString();
        let varSku = variant.attributes.sku;
        let optionValues = this.getVariantOptionValues(variant.relationships.option_values.data, optionTypes)
        const variantImagesId = variant.relationships.images.data.map(x=>x.id);
        const variantImages=included.filter(x=>x.type==="image" && variantImagesId.includes(x.id));
        const srcs=variantImages.map(x=>{
          return "https://shopback.miarze.com" + x.attributes.original_url;
        });

        let price=fixPrice([{itemCode : varSku, itemQty : 1}])[0];
        if(product.campaign){
          price = this.updateCampaignPrice(product.campaign.id,price)
        }
        if(price==undefined) continue;
        variants.push({
          id:varId,
          optionValues,
          inStock:price.OnHand !== null?price.OnHand.qty:0,
          srcs,
          code:varSku,
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

      return product;
    },
    async pardakhte_belex(){

    },
    async sabte_belex(){

    },

    async refreshB1Rules() {
      await Axios.get(`${baseUrl}/BOne/RefreshRules`);
    },
    async refreshB1CentralInvetoryProducts() {
      await Axios.get(`${baseUrl}/BOne/RefreshCentralInvetoryProducts`);
    },
    async getTaxonProducts({ loadType,Taxons,Name }) {
      let { userInfo } = getState();
      let res = await Axios.post(`${baseUrl}/Spree/Products`,
        {
          CardCode: userInfo.cardCode,
          Taxons,
          PerPage:250,
          // Name,
          Skame:Name,
          // ProductFields:"id,name,type,sku,slug,images,option_types,variants,default_variant,product_properties",
          // VariantFields:"id,sku,type,option_values,images,option_types,product_properties",
          Include: loadType === 0 ? "default_variant,images" : "variants,option_types,product_properties,taxons,images,default_variant"
        }
      );

      if(res.data.data.status === 500){
        return false
      }
      // const included = res.data.data.included;

      // let skusId = [];

      // for (let includeItem of included) {

      //   if (includeItem.type === "variant"
      //     && includeItem.attributes != undefined
      //     && includeItem.attributes.sku != undefined
      //     && includeItem.attributes.sku.length) {
      //     skusId.push(includeItem.attributes.sku);
      //   }
      // }
      // if(!skusId.length === 0){return}

      // let b1Res = await Axios.post(`${baseUrl}/BOne/GetB1PriceList`,
      //   {
      //     "CardCode": userInfo.cardCode,
      //     "ItemCode": skusId // should be an array
      //   });

      const spreeData = res.data.data;
      // const b1Data = b1Res.data.data;
      const b1Data = userInfo.itemPrices.map((i)=>{
        const onHand=i.inventory.filter(x=>x.whsCode==="01");
        return {
          "itemCode": i.itemCode,
          "price": 0,
          "finalPrice": 0,
          "b1Dscnt": 0,
          "cmpgnDscnt": 0,
          "pymntDscnt": 0,
          "onHand":onHand.length ? onHand[0] : {},
          //   "onHand": {
          //   "whsCode": "01",
          //   "qty": 269.3,
          //   "qtyLevel": 300,
          //   "qtyLevRel": "Less"
          // }
        };
      });
      return this.getMappedAllProducts({ spreeResult: spreeData, b1Result: b1Data, loadType });
    },
    async getProductsByTaxonId({ Taxons }) {
      let { userInfo } = getState();
      let res = await Axios.post(`${baseUrl}/Spree/Products`,
        {
          CardCode: userInfo.cardCode,
          Taxons,
          PerPage:250,
          ProductFields:"id,name,type,sku,slug,default_variant,images",
          VariantFields:"id,sku,type,images",
          Include: "default_variant,images"
        }
      );

      if(res.data.data.status === 500){
        return false
      }

      const spreeData = res.data.data;
      const b1Data = userInfo.itemPrices.map((i)=>{
        const onHand=i.inventory.filter(x=>x.whsCode==="01");
        return {
          "itemCode": i.itemCode,
          "price": 0,
          "finalPrice": 0,
          "b1Dscnt": 0,
          "cmpgnDscnt": 0,
          "pymntDscnt": 0,
          "mainSku":i.mainSku,
          "onHand":onHand.length ? onHand[0] : {},
          //   "onHand": {
          //   "whsCode": "01",
          //   "qty": 269.3,
          //   "qtyLevel": 300,
          //   "qtyLevRel": "Less"
          // }
        };
      });

      return this.getModifiedProducts({ spreeResult: spreeData, b1Result: b1Data });
    },
    getModifiedProducts({spreeResult , b1Result}){

      let allProducts=[];
      for (const product of spreeResult.data) {

        // 11291 ,
        //11909 ,
        // 11922 ,
        // 12314 ,
        // 12395
        if( product.id=="12395") continue;

        if(product.relationships.default_variant==undefined || product.relationships.default_variant.data==undefined) continue;

        const productDefaultVariantId=product.relationships.default_variant.data.id;
        const productDefaultVariant=spreeResult.included.find(x=>x.type==="variant" && x.id===productDefaultVariantId);
        const productDefaultVariantSku=productDefaultVariant.attributes.sku;
        const defaultVariantImagesId = product.relationships.images.data.map(x=>x.id);
        const defaultVariantImages=spreeResult.included.filter(x=>x.type==="image" && defaultVariantImagesId.includes(x.id));

        if(productDefaultVariantSku && productDefaultVariantId){
          const itemFromB1=b1Result.find(x=>x.itemCode === productDefaultVariantSku || x.mainSku === productDefaultVariantSku);
          const srcs=defaultVariantImages.map(x=>{
            return "https://shopback.miarze.com" + x.attributes.original_url;
          });

          if(itemFromB1 != undefined && itemFromB1) {
            const defVariantFinalResult={
              "id": productDefaultVariantId,
              "discountPrice": 0,
              "price": 0,
              "inStock": itemFromB1.onHand.qty,
              "srcs": [],
              "code": productDefaultVariantSku,
              "discountPercent": 0,
              "isDefault": true
            };
            allProducts.push(
              {
                  inStock:itemFromB1.onHand.qty, details:[], optionTypes:[], variants:[defVariantFinalResult], srcs,
                  name: product.attributes.name, defaultVariant:defVariantFinalResult,
                  price:0, discountPrice:0, discountPercent:0, id: product.id
                }
            );
          }
        }
      }

      return allProducts;
    },
    async getProductsWithCalculation(skusId) {
      let { userInfo } = getState();
      let res = await Axios.post(`${baseUrl}/BOne/GetItemsByItemCode`,
        {
          "CardCode": userInfo.cardCode,
          "ItemCode": skusId // should be an array
        }
      );
      const included = res.data.data.included;
      return res;
    },
    async getCart(){
      let res = await Axios.get(`${baseUrl}/orderuidata`);
      let result = '{}';
      try{
        result = res.data.data[0].jsonData || '{}';
      }
      catch{
        result = '{}'
      }
      return JSON.parse(result)
    },
    async setCart(cart){
      let res = await Axios.post(`${baseUrl}/orderuidata/updatejson`,{JsonData:JSON.stringify(cart)});
    },
    async dargah({amount,url}){
      //AIOServiceShowAlert({type:'success',text:'text',subtext:'test'})
      let res = await Axios.get(`${baseUrl}/payment/request?price=${amount}&cbu=${url}`);
      if(res.data.isSuccess){
        let {getUserInfo} = getState();
        getUserInfo()
        window.location.href = res.data.data;
      }
    },
    async pardakhte_kharid({order}){

      let res = await Axios.post(`${baseUrl}/payment/request`,{
        "Price":order.total,
        "IsDraft":order.mainDocisDraft,
        "DocNum":order.mainDocNum,
        "DocEntry":order.code,
        // "CallbackUrl":"https://bazar.miarze."+"com/"
        "CallbackUrl":"https://uiretailerapp.bbeta."+"ir/"
        // "CallbackUrl":"http://localhost:3000/"
      });

      if(res.data.isSuccess){
        let {getUserInfo} = getState();
        getUserInfo()

        window.location.href = res.data.data;
      }
    },
    async belex(){
      let res = await Axios.get(`https://spreeapi.bpilot.ir/api/Spreegw/GetItemsDataRaw?campaign=8`);
      if(res.data.isvalid !=undefined && !res.data.isvalid) debugger;
      // else{
      //   localStorage.setItem("TESTTT",JSON.stringify(res.data));
      // }

      // let allData=JSON.parse(localStorage.getItem("TESTTT"));
      let allData=res.data;
      allData=allData[0];
      allData=allData.taxons;

      var items=[];
      for (const i1 of allData) {
        if(i1.items) items.push(i1.items.filter(x=>x.itemcodes!=null));
        if(!i1.taxons) continue;
        for (const i2 of i1.taxons) {

          if(i2.items) items.push(i2.items.filter(x=>x.itemcodes!=null));
          if(!i2.taxons) continue;
          for (const i3 of i2.taxons) {

              if(i3.items) items.push(i3.items.filter(x=>x.itemcodes!=null));
              if(!i3.taxons) continue;
              for (const i4 of i3.taxons){

                if(i4.items) items.push(i4.items.filter(x=>x.itemcodes!=null));
                if(!i4.taxons) continue;
                for (const i5 of i4.taxons){

                  if(i5.items) items.push(i5.items.filter(x=>x.itemcodes!=null));
                  if(!i5.taxons) continue;
                    for (const i6 of i5.taxons){

                      if(i6.items) items.push(i6.items.filter(x=>x.itemcodes!=null));
                      if(!i6.taxons) continue;

                        for (const i7 of i6.taxons){

                          if(i7.items) items.push(i7.items.filter(x=>x.itemcodes!=null));
                          if(!i7.taxons) continue;
                        }
                    }
                }
              }
          }
        }
      }
      console.log(items)

      let products=[];
      for (const item of items) {

        if(item.length){

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
              type:'belex',
              name:subItem.itemname,
              code:subItem.itemcode,
              price:subItem.price,
              variants:subItem.itemcodes.map(x=>{
                return {
                  mainsku:x.mainsku,name:x.Name,unitPrice:x.Price,qty:x.Qty,step:x.Step,variants:x.Variants,
                  id:x.Name
                }
              }),
              src:subItem.imageurl
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
      
      console.log(products)
      return {
        type:'belex',
        name:'بلکس 23 شیراز',
        src:foroosheVijeSrc,
        icon:foroosheVijeIcon,
        products
      }
    },
    async forooshe_vije(){
      let {userInfo} = getState();
      let res = await Axios.get(`https://spreeapi.bpilot.ir/api/Spreegw/GetItemsDataRaw?cardCode=${userInfo.cardCode}`);
      const allData=res.data;
      let products=[];
      for (const t1 of allData) {
        const taxondepth0 = t1.taxons; // بسته یلدا

        for (const t1 of taxondepth0) {
          const taxondepth1 = t1.taxons; //سایر

          for (const t2 of taxondepth1) {
          const taxondepth2 = t2.taxons; // چسب

            for (const t3 of taxondepth2) {
              const taxondepth3Items=t3.items;
              if(!Array.isArray(taxondepth3Items)) continue;
              let variants=[];
              let optionValues=[];
              let src;
              for (const t3Item of taxondepth3Items) {
                if(!src){src = t3Item.imageurl;}
                if(!t3Item.itemcodes[0].Qty){debugger;}
                variants.push({
                  name:t3Item.itemname,
                  totalQty:t3Item.itemcodes[0].Qty,
                  finalPrice:t3Item.price,
                  id:t3Item.itemid,
                  unitPrice:t3Item.itemcodes[0].Price
                });

                optionValues=t3Item.itemcodes[0].Variants.map(x=>{
                  return {name:x.Name,id:x.Code,step:x.Step};
                });
              }


              products.push({
                type:'forooshe_vije',
                name:t3.taxonname,
                code:t3.taxonid,
                details:[['توان','144'],['وزن','3 کیلوگرم']],
                // optionValues:[{name:'آفتابی',id:'1'},{name:'مهتابی',id:'2'},{name:'انبه ای',id:'3'},{name:'پوست پیازی',id:'4'}],
                optionValues,
                // variants:{cartonQty:(itemTotalQty/itemQytInCarton),qtyInCarton:itemQytInCarton,discountPercent:0,finalPrice:t3Item.price,id:t3Item.itemid},
                variants,
                src:src || nosrc
              });
            }
          }
        }
      }
      return {
        type:'forooshe_vije',
        name:'فروش ویژه',
        src:foroosheVijeSrc,
        icon:foroosheVijeIcon,
        products:products
        // [
        //   {
        //     type:'forooshe_vije',
        //     name:'لامپ LED جنرال 10 وات بروکس',
        //     code:'12345',
        //     unitPrice:123000,
        //     details:[['توان','144'],['وزن','3 کیلوگرم']],
        //     optionValues:[{name:'آفتابی',id:'1'},{name:'مهتابی',id:'2'},{name:'انبه ای',id:'3'},{name:'پوست پیازی',id:'4'}],
        //     variants:[
        //       {cartonQty:2,qtyInCarton:60,discountPercent:2,finalPrice:14464800,id:'1'},
        //       {cartonQty:5,qtyInCarton:60,discountPercent:3,finalPrice:35793000,id:'2'},
        //       {cartonQty:7,qtyInCarton:60,discountPercent:4,finalPrice:45593600,id:'3'},
        //       {cartonQty:10,qtyInCarton:60,discountPercent:5,finalPrice:70110000,id:'4'}
        //     ],
        //     src:nosrc
        //   }
        // ]
      }
    }
  }
}