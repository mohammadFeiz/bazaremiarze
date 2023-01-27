import Axios from "axios";
import nosrcImage from './../images/no-src.png';
import nosrc from './../images/no-src.png';
import foroosheVijeSrc from './../images/forooshe-vije.png';
import foroosheVijeIcon from './../images/forooshe-vije-icon.png';
import belexbillboard from './../images/belex-billboard.png';
import belexIcon from './../images/belex-icon.png';
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
    async pardakhte_belex({address,SettleType,PaymentTime,DeliveryType,PayDueDate,shipping,ghabele_pardakht}){

      let {userInfo} = getState();
      let arr=[];
      for(const cart of shipping.cartItems){
        const items=cart.belex_count.qtyInPacks;
        for (const key in items) {
          arr=arr.concat(items[key])
        }
      }

      let body = {
        "marketdoc":{
          "DocType":17,
          "CardCode":userInfo.cardCode,
          "CardGroupCode": userInfo.groupCode,
          "MarketingLines":arr.map((o)=>{
            return { ItemCode: o.optionValueId, ItemQty: o.count, Price: o.unitPrice }
          }),
          "DeliverAddress":address,
          "marketingdetails":{Campaign:19}
        },
        SettleType,PaymentTime:6,DeliveryType,PayDueDate
      }
      let res = await Axios.post(`${baseUrl}/BOne/AddNewOrder`, body);
      let registredOrder;
      try { registredOrder=res.data.data[0] }
      catch { return false }

      await this.pardakhte_kharid({order:{
        total:ghabele_pardakht,
        mainDocisDraft:registredOrder.isDraft,
        mainDocNum:registredOrder.docNum,
        code:registredOrder.docEntry
      }});
    },
    async sabte_belex({address,SettleType,PaymentTime,DeliveryType,PayDueDate,shipping}){
      let {userInfo} = getState();
      let arr=[];
      for(const cart of shipping.cartItems){
        const items=cart.belex_count.qtyInPacks;
        for (const key in items) {
          arr=arr.concat(items[key])
        }
      }

      let body = {
        "marketdoc":{
          "DocType":17,
          "CardCode":userInfo.cardCode,
          "CardGroupCode": userInfo.groupCode,
          "MarketingLines":arr.map((o)=>{
            return { ItemCode: o.optionValueId, ItemQty: o.count, Price: o.unitPrice }
          }),
          "DeliverAddress":address,
          "marketingdetails":{Campaign:19}
        },
        SettleType,PaymentTime:6,DeliveryType,PayDueDate
      }
      let res = await Axios.post(`${baseUrl}/BOne/AddNewOrder`, body);
      try { return res.data.data[0].docNum }
      catch { return false }
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
      //let res = await Axios.get(`https://spreeapi.bpilot.ir/api/Spreegw/GetItemsDataRaw?campaign=8`);
      //if(res.data.isvalid !=undefined && !res.data.isvalid) debugger;
      // else{
      //   localStorage.setItem("TESTTT",JSON.stringify(res.data));
      // }

      // let allData=JSON.parse(localStorage.getItem("TESTTT"));
      let allData=[
        {
            "taxonid": 122,
            "parnetid": null,
            "taxonname": "بسته های همایش شیراز",
            "metadescription": "",
            "Depth": 0,
            "Position": 0,
            "taxons": [
                {
                    "taxonid": 173,
                    "taxonname": "سایر محصولات",
                    "metadescription": "",
                    "Depth": 1,
                    "Position": 0,
                    "items": null,
                    "taxons": [
                        {
                            "taxonid": 141,
                            "parnetid": 173,
                            "taxonname": "ابزار ",
                            "metadescription": "",
                            "Depth": 2,
                            "Position": 0,
                            "items": null,
                            "taxons": [
                                {
                                    "taxonid": 144,
                                    "parnetid": 141,
                                    "taxonname": "بسته چسب 123",
                                    "metadescription": null,
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": "چسب 123 3 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhjamQ0YkdSNmFqY3hiREp5WW5Zd016TTNaR0poT0hNek1XeHRhUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpQVlocGJteHBibVU3SUdacGJHVnVZVzFsUFNKWGFHRjBjMEZ3Y0NCSmJXRm5aU0F5TURJeUxUQTBMVEV3SUdGMElEWXVNelV1TVRBZ1VFMHVhbkJsWnlJN0lHWnBiR1Z1WVcxbEtqMVZWRVl0T0NjblYyaGhkSE5CY0hBbE1qQkpiV0ZuWlNVeU1ESXdNakl0TURRdE1UQWxNakJoZENVeU1EWXVNelV1TVRBbE1qQlFUUzVxY0dWbkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSVBhVzFoWjJVdmFuQmxad1k3QmxRNkVYTmxjblpwWTJWZmJtRnRaVG9LYkc5allXdz0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--3d698ea1d35642a175ef19efc42cc0090efe49be/WhatsApp%20Image%202022-04-10%20at%206.35.10%20PM.jpeg\", \"ItemCodes\": [{\"Qty\": 75, \"Name\": \" چسب 122\", \"Step\": 25, \"Price\": 751400, \"mainsku\": \"9415K3\", \"Variants\": [{\"Code\": \"9415\", \"Name\": \"اصلی\", \"Step\": 25, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p style=\"text-align: right;\">چسب 123: 75 عدد: 58200تومان</p>",
                                            "itemcode": "EXBR0101",
                                            "itemid": 346,
                                            "price": 51015940.00,
                                            "totalremained": 46,
                                            "itemcodes": [
                                                {
                                                    "Qty": 75,
                                                    "Name": " چسب 122",
                                                    "Step": 25,
                                                    "Price": 680210,
                                                    "mainsku": "9415K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "9415",
                                                            "Name": "اصلی",
                                                            "Step": 25,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhjamQ0YkdSNmFqY3hiREp5WW5Zd016TTNaR0poT0hNek1XeHRhUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpQVlocGJteHBibVU3SUdacGJHVnVZVzFsUFNKWGFHRjBjMEZ3Y0NCSmJXRm5aU0F5TURJeUxUQTBMVEV3SUdGMElEWXVNelV1TVRBZ1VFMHVhbkJsWnlJN0lHWnBiR1Z1WVcxbEtqMVZWRVl0T0NjblYyaGhkSE5CY0hBbE1qQkpiV0ZuWlNVeU1ESXdNakl0TURRdE1UQWxNakJoZENVeU1EWXVNelV1TVRBbE1qQlFUUzVxY0dWbkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSVBhVzFoWjJVdmFuQmxad1k3QmxRNkVYTmxjblpwWTJWZmJtRnRaVG9LYkc5allXdz0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--3d698ea1d35642a175ef19efc42cc0090efe49be/WhatsApp%20Image%202022-04-10%20at%206.35.10%20PM.jpeg"
                                        },
                                        {
                                            "Position": 2,
                                            "itemname": "چسب 123 5 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhjamQ0YkdSNmFqY3hiREp5WW5Zd016TTNaR0poT0hNek1XeHRhUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpQVlocGJteHBibVU3SUdacGJHVnVZVzFsUFNKWGFHRjBjMEZ3Y0NCSmJXRm5aU0F5TURJeUxUQTBMVEV3SUdGMElEWXVNelV1TVRBZ1VFMHVhbkJsWnlJN0lHWnBiR1Z1WVcxbEtqMVZWRVl0T0NjblYyaGhkSE5CY0hBbE1qQkpiV0ZuWlNVeU1ESXdNakl0TURRdE1UQWxNakJoZENVeU1EWXVNelV1TVRBbE1qQlFUUzVxY0dWbkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSVBhVzFoWjJVdmFuQmxad1k3QmxRNkVYTmxjblpwWTJWZmJtRnRaVG9LYkc5allXdz0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--3d698ea1d35642a175ef19efc42cc0090efe49be/WhatsApp%20Image%202022-04-10%20at%206.35.10%20PM.jpeg\", \"ItemCodes\": [{\"Qty\": 125, \"Name\": \" چسب 122\", \"Step\": 25, \"Price\": 727670, \"mainsku\": \"9415K3\", \"Variants\": [{\"Code\": \"9415\", \"Name\": \"اصلی\", \"Step\": 25, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p style=\"text-align: right;\">چسب 123: 125عدد: 56200تومان</p>",
                                            "itemcode": "EXBR0102",
                                            "itemid": 347,
                                            "price": 82759190.00,
                                            "totalremained": 28,
                                            "itemcodes": [
                                                {
                                                    "Qty": 125,
                                                    "Name": " چسب 122",
                                                    "Step": 25,
                                                    "Price": 662070,
                                                    "mainsku": "9415K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "9415",
                                                            "Name": "اصلی",
                                                            "Step": 25,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhjamQ0YkdSNmFqY3hiREp5WW5Zd016TTNaR0poT0hNek1XeHRhUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpQVlocGJteHBibVU3SUdacGJHVnVZVzFsUFNKWGFHRjBjMEZ3Y0NCSmJXRm5aU0F5TURJeUxUQTBMVEV3SUdGMElEWXVNelV1TVRBZ1VFMHVhbkJsWnlJN0lHWnBiR1Z1WVcxbEtqMVZWRVl0T0NjblYyaGhkSE5CY0hBbE1qQkpiV0ZuWlNVeU1ESXdNakl0TURRdE1UQWxNakJoZENVeU1EWXVNelV1TVRBbE1qQlFUUzVxY0dWbkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSVBhVzFoWjJVdmFuQmxad1k3QmxRNkVYTmxjblpwWTJWZmJtRnRaVG9LYkc5allXdz0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--3d698ea1d35642a175ef19efc42cc0090efe49be/WhatsApp%20Image%202022-04-10%20at%206.35.10%20PM.jpeg"
                                        },
                                        {
                                            "Position": 3,
                                            "itemname": "چسب 123 10 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhjamQ0YkdSNmFqY3hiREp5WW5Zd016TTNaR0poT0hNek1XeHRhUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpQVlocGJteHBibVU3SUdacGJHVnVZVzFsUFNKWGFHRjBjMEZ3Y0NCSmJXRm5aU0F5TURJeUxUQTBMVEV3SUdGMElEWXVNelV1TVRBZ1VFMHVhbkJsWnlJN0lHWnBiR1Z1WVcxbEtqMVZWRVl0T0NjblYyaGhkSE5CY0hBbE1qQkpiV0ZuWlNVeU1ESXdNakl0TURRdE1UQWxNakJoZENVeU1EWXVNelV1TVRBbE1qQlFUUzVxY0dWbkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSVBhVzFoWjJVdmFuQmxad1k3QmxRNkVYTmxjblpwWTJWZmJtRnRaVG9LYkc5allXdz0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--3d698ea1d35642a175ef19efc42cc0090efe49be/WhatsApp%20Image%202022-04-10%20at%206.35.10%20PM.jpeg\", \"ItemCodes\": [{\"Qty\": 250, \"Name\": \" چسب 122\", \"Step\": 25, \"Price\": 688120, \"mainsku\": \"9415K3\", \"Variants\": [{\"Code\": \"9415\", \"Name\": \"اصلی\", \"Step\": 25, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p style=\"text-align: right;\">چسب 123: 250 عدد: 54200تومان</p>",
                                            "itemcode": "EXBR0108",
                                            "itemid": 348,
                                            "price": 160983630.00,
                                            "totalremained": 14,
                                            "itemcodes": [
                                                {
                                                    "Qty": 250,
                                                    "Name": " چسب 122",
                                                    "Step": 25,
                                                    "Price": 643930,
                                                    "mainsku": "9415K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "9415",
                                                            "Name": "اصلی",
                                                            "Step": 25,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhjamQ0YkdSNmFqY3hiREp5WW5Zd016TTNaR0poT0hNek1XeHRhUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpQVlocGJteHBibVU3SUdacGJHVnVZVzFsUFNKWGFHRjBjMEZ3Y0NCSmJXRm5aU0F5TURJeUxUQTBMVEV3SUdGMElEWXVNelV1TVRBZ1VFMHVhbkJsWnlJN0lHWnBiR1Z1WVcxbEtqMVZWRVl0T0NjblYyaGhkSE5CY0hBbE1qQkpiV0ZuWlNVeU1ESXdNakl0TURRdE1UQWxNakJoZENVeU1EWXVNelV1TVRBbE1qQlFUUzVxY0dWbkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSVBhVzFoWjJVdmFuQmxad1k3QmxRNkVYTmxjblpwWTJWZmJtRnRaVG9LYkc5allXdz0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--3d698ea1d35642a175ef19efc42cc0090efe49be/WhatsApp%20Image%202022-04-10%20at%206.35.10%20PM.jpeg"
                                        }
                                    ]
                                },
                                {
                                    "taxonid": 143,
                                    "parnetid": 141,
                                    "taxonname": "دستکش زبرا",
                                    "metadescription": null,
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 4,
                                            "itemname": "دستکش زبرا 360 عددی",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhibkUyWlhadGRIb3pOV05xZW5Gd2QyTnRPWEJ0T0hZeGFHZHRNQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW1SemRHdHphQzVxY0djaU95Qm1hV3hsYm1GdFpTbzlWVlJHTFRnbkp5VkVPQ1ZCUmlWRU9DVkNNeVZFT0NWQlFTVkVRU1ZCT1NWRU9DVkNOQzVxY0djR093WlVPaEZqYjI1MFpXNTBYM1I1Y0dWSklnOXBiV0ZuWlM5cWNHVm5CanNHVkRvUmMyVnlkbWxqWlY5dVlXMWxPZ3BzYjJOaGJBPT0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--4997283916bbc10dc299269d74e2b7972f2a9e97/%D8%AF%D8%B3%D8%AA%DA%A9%D8%B4.jpg\", \"ItemCodes\": [ { \"Qty\": 360, \"Name\": \"دستکش زبرا\", \"Step\": 1, \"Price\": 176826, \"mainsku\": \"9396\", \"Variants\": [ { \"Code\": \"9396\", \"Name\": \"دستکش زبرا\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shirazdastkeshzz",
                                            "itemid": 460,
                                            "price": 63657180.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 360,
                                                    "Name": "دستکش زبرا",
                                                    "Step": 1,
                                                    "Price": 176826,
                                                    "mainsku": "9396",
                                                    "Variants": [
                                                        {
                                                            "Code": "9396",
                                                            "Name": "دستکش زبرا",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhibkUyWlhadGRIb3pOV05xZW5Gd2QyTnRPWEJ0T0hZeGFHZHRNQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW1SemRHdHphQzVxY0djaU95Qm1hV3hsYm1GdFpTbzlWVlJHTFRnbkp5VkVPQ1ZCUmlWRU9DVkNNeVZFT0NWQlFTVkVRU1ZCT1NWRU9DVkNOQzVxY0djR093WlVPaEZqYjI1MFpXNTBYM1I1Y0dWSklnOXBiV0ZuWlM5cWNHVm5CanNHVkRvUmMyVnlkbWxqWlY5dVlXMWxPZ3BzYjJOaGJBPT0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--4997283916bbc10dc299269d74e2b7972f2a9e97/%D8%AF%D8%B3%D8%AA%DA%A9%D8%B4.jpg"
                                        },
                                        {
                                            "Position": 5,
                                            "itemname": "دستکش زبرا 120 عددی",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhibkUyWlhadGRIb3pOV05xZW5Gd2QyTnRPWEJ0T0hZeGFHZHRNQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW1SemRHdHphQzVxY0djaU95Qm1hV3hsYm1GdFpTbzlWVlJHTFRnbkp5VkVPQ1ZCUmlWRU9DVkNNeVZFT0NWQlFTVkVRU1ZCT1NWRU9DVkNOQzVxY0djR093WlVPaEZqYjI1MFpXNTBYM1I1Y0dWSklnOXBiV0ZuWlM5cWNHVm5CanNHVkRvUmMyVnlkbWxqWlY5dVlXMWxPZ3BzYjJOaGJBPT0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--4997283916bbc10dc299269d74e2b7972f2a9e97/%D8%AF%D8%B3%D8%AA%DA%A9%D8%B4.jpg\", \"ItemCodes\": [ { \"Qty\": 120, \"Name\": \"دستکش زبرا\", \"Step\": 1, \"Price\": 181807, \"mainsku\": \"9396\", \"Variants\": [ { \"Code\": \"9396\", \"Name\": \"دستکش زبرا\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shirazdastkeshze",
                                            "itemid": 459,
                                            "price": 21816780.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 120,
                                                    "Name": "دستکش زبرا",
                                                    "Step": 1,
                                                    "Price": 181807,
                                                    "mainsku": "9396",
                                                    "Variants": [
                                                        {
                                                            "Code": "9396",
                                                            "Name": "دستکش زبرا",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhibkUyWlhadGRIb3pOV05xZW5Gd2QyTnRPWEJ0T0hZeGFHZHRNQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW1SemRHdHphQzVxY0djaU95Qm1hV3hsYm1GdFpTbzlWVlJHTFRnbkp5VkVPQ1ZCUmlWRU9DVkNNeVZFT0NWQlFTVkVRU1ZCT1NWRU9DVkNOQzVxY0djR093WlVPaEZqYjI1MFpXNTBYM1I1Y0dWSklnOXBiV0ZuWlM5cWNHVm5CanNHVkRvUmMyVnlkbWxqWlY5dVlXMWxPZ3BzYjJOaGJBPT0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--4997283916bbc10dc299269d74e2b7972f2a9e97/%D8%AF%D8%B3%D8%AA%DA%A9%D8%B4.jpg"
                                        },
                                        {
                                            "Position": 6,
                                            "itemname": "دستکش زبرا 36 عددی",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhibkUyWlhadGRIb3pOV05xZW5Gd2QyTnRPWEJ0T0hZeGFHZHRNQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW1SemRHdHphQzVxY0djaU95Qm1hV3hsYm1GdFpTbzlWVlJHTFRnbkp5VkVPQ1ZCUmlWRU9DVkNNeVZFT0NWQlFTVkVRU1ZCT1NWRU9DVkNOQzVxY0djR093WlVPaEZqYjI1MFpXNTBYM1I1Y0dWSklnOXBiV0ZuWlM5cWNHVm5CanNHVkRvUmMyVnlkbWxqWlY5dVlXMWxPZ3BzYjJOaGJBPT0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--4997283916bbc10dc299269d74e2b7972f2a9e97/%D8%AF%D8%B3%D8%AA%DA%A9%D8%B4.jpg\", \"ItemCodes\": [ { \"Qty\": 36, \"Name\": \"دستکش زبرا\", \"Step\": 1, \"Price\": 186788, \"mainsku\": \"9396\", \"Variants\": [ { \"Code\": \"9396\", \"Name\": \"دستکش زبرا\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shirazdastkeshz",
                                            "itemid": 458,
                                            "price": 6724350.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 36,
                                                    "Name": "دستکش زبرا",
                                                    "Step": 1,
                                                    "Price": 186788,
                                                    "mainsku": "9396",
                                                    "Variants": [
                                                        {
                                                            "Code": "9396",
                                                            "Name": "دستکش زبرا",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhibkUyWlhadGRIb3pOV05xZW5Gd2QyTnRPWEJ0T0hZeGFHZHRNQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW1SemRHdHphQzVxY0djaU95Qm1hV3hsYm1GdFpTbzlWVlJHTFRnbkp5VkVPQ1ZCUmlWRU9DVkNNeVZFT0NWQlFTVkVRU1ZCT1NWRU9DVkNOQzVxY0djR093WlVPaEZqYjI1MFpXNTBYM1I1Y0dWSklnOXBiV0ZuWlM5cWNHVm5CanNHVkRvUmMyVnlkbWxqWlY5dVlXMWxPZ3BzYjJOaGJBPT0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--4997283916bbc10dc299269d74e2b7972f2a9e97/%D8%AF%D8%B3%D8%AA%DA%A9%D8%B4.jpg"
                                        }
                                    ]
                                },
                                {
                                    "taxonid": 142,
                                    "parnetid": 141,
                                    "taxonname": "بسته دستکش ساده",
                                    "metadescription": "",
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 4,
                                            "itemname": "دستکش ساده 360 عددی",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhibkUyWlhadGRIb3pOV05xZW5Gd2QyTnRPWEJ0T0hZeGFHZHRNQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW1SemRHdHphQzVxY0djaU95Qm1hV3hsYm1GdFpTbzlWVlJHTFRnbkp5VkVPQ1ZCUmlWRU9DVkNNeVZFT0NWQlFTVkVRU1ZCT1NWRU9DVkNOQzVxY0djR093WlVPaEZqYjI1MFpXNTBYM1I1Y0dWSklnOXBiV0ZuWlM5cWNHVm5CanNHVkRvUmMyVnlkbWxqWlY5dVlXMWxPZ3BzYjJOaGJBPT0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--4997283916bbc10dc299269d74e2b7972f2a9e97/%D8%AF%D8%B3%D8%AA%DA%A9%D8%B4.jpg\", \"ItemCodes\": [ { \"Qty\": 360, \"Name\": \"دستکش ساده\", \"Step\": 1, \"Price\": 135788, \"mainsku\": \"9395\", \"Variants\": [ { \"Code\": \"9395\", \"Name\": \"دستکش ساده\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shirazsade",
                                            "itemid": 461,
                                            "price": 48883500.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 360,
                                                    "Name": "دستکش ساده",
                                                    "Step": 1,
                                                    "Price": 135788,
                                                    "mainsku": "9395",
                                                    "Variants": [
                                                        {
                                                            "Code": "9395",
                                                            "Name": "دستکش ساده",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhibkUyWlhadGRIb3pOV05xZW5Gd2QyTnRPWEJ0T0hZeGFHZHRNQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW1SemRHdHphQzVxY0djaU95Qm1hV3hsYm1GdFpTbzlWVlJHTFRnbkp5VkVPQ1ZCUmlWRU9DVkNNeVZFT0NWQlFTVkVRU1ZCT1NWRU9DVkNOQzVxY0djR093WlVPaEZqYjI1MFpXNTBYM1I1Y0dWSklnOXBiV0ZuWlM5cWNHVm5CanNHVkRvUmMyVnlkbWxqWlY5dVlXMWxPZ3BzYjJOaGJBPT0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--4997283916bbc10dc299269d74e2b7972f2a9e97/%D8%AF%D8%B3%D8%AA%DA%A9%D8%B4.jpg"
                                        },
                                        {
                                            "Position": 5,
                                            "itemname": "دستکش ساده 120 عددی",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhibkUyWlhadGRIb3pOV05xZW5Gd2QyTnRPWEJ0T0hZeGFHZHRNQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW1SemRHdHphQzVxY0djaU95Qm1hV3hsYm1GdFpTbzlWVlJHTFRnbkp5VkVPQ1ZCUmlWRU9DVkNNeVZFT0NWQlFTVkVRU1ZCT1NWRU9DVkNOQzVxY0djR093WlVPaEZqYjI1MFpXNTBYM1I1Y0dWSklnOXBiV0ZuWlM5cWNHVm5CanNHVkRvUmMyVnlkbWxqWlY5dVlXMWxPZ3BzYjJOaGJBPT0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--4997283916bbc10dc299269d74e2b7972f2a9e97/%D8%AF%D8%B3%D8%AA%DA%A9%D8%B4.jpg\", \"ItemCodes\": [ { \"Qty\": 120, \"Name\": \"دستکش ساده\", \"Step\": 1, \"Price\": 139613, \"mainsku\": \"9395\", \"Variants\": [ { \"Code\": \"9395\", \"Name\": \"دستکش ساده\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shirazsaade",
                                            "itemid": 462,
                                            "price": 16753500.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 120,
                                                    "Name": "دستکش ساده",
                                                    "Step": 1,
                                                    "Price": 139613,
                                                    "mainsku": "9395",
                                                    "Variants": [
                                                        {
                                                            "Code": "9395",
                                                            "Name": "دستکش ساده",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhibkUyWlhadGRIb3pOV05xZW5Gd2QyTnRPWEJ0T0hZeGFHZHRNQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW1SemRHdHphQzVxY0djaU95Qm1hV3hsYm1GdFpTbzlWVlJHTFRnbkp5VkVPQ1ZCUmlWRU9DVkNNeVZFT0NWQlFTVkVRU1ZCT1NWRU9DVkNOQzVxY0djR093WlVPaEZqYjI1MFpXNTBYM1I1Y0dWSklnOXBiV0ZuWlM5cWNHVm5CanNHVkRvUmMyVnlkbWxqWlY5dVlXMWxPZ3BzYjJOaGJBPT0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--4997283916bbc10dc299269d74e2b7972f2a9e97/%D8%AF%D8%B3%D8%AA%DA%A9%D8%B4.jpg"
                                        },
                                        {
                                            "Position": 6,
                                            "itemname": "دستکش ساده 36 عددی",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhibkUyWlhadGRIb3pOV05xZW5Gd2QyTnRPWEJ0T0hZeGFHZHRNQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW1SemRHdHphQzVxY0djaU95Qm1hV3hsYm1GdFpTbzlWVlJHTFRnbkp5VkVPQ1ZCUmlWRU9DVkNNeVZFT0NWQlFTVkVRU1ZCT1NWRU9DVkNOQzVxY0djR093WlVPaEZqYjI1MFpXNTBYM1I1Y0dWSklnOXBiV0ZuWlM5cWNHVm5CanNHVkRvUmMyVnlkbWxqWlY5dVlXMWxPZ3BzYjJOaGJBPT0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--4997283916bbc10dc299269d74e2b7972f2a9e97/%D8%AF%D8%B3%D8%AA%DA%A9%D8%B4.jpg\", \"ItemCodes\": [ { \"Qty\": 36, \"Name\": \"دستکش ساده\", \"Step\": 1, \"Price\": 143438, \"mainsku\": \"9395\", \"Variants\": [ { \"Code\": \"9395\", \"Name\": \"دستکش ساده\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shiraazsade",
                                            "itemid": 463,
                                            "price": 5163750.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 36,
                                                    "Name": "دستکش ساده",
                                                    "Step": 1,
                                                    "Price": 143438,
                                                    "mainsku": "9395",
                                                    "Variants": [
                                                        {
                                                            "Code": "9395",
                                                            "Name": "دستکش ساده",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhibkUyWlhadGRIb3pOV05xZW5Gd2QyTnRPWEJ0T0hZeGFHZHRNQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW1SemRHdHphQzVxY0djaU95Qm1hV3hsYm1GdFpTbzlWVlJHTFRnbkp5VkVPQ1ZCUmlWRU9DVkNNeVZFT0NWQlFTVkVRU1ZCT1NWRU9DVkNOQzVxY0djR093WlVPaEZqYjI1MFpXNTBYM1I1Y0dWSklnOXBiV0ZuWlM5cWNHVm5CanNHVkRvUmMyVnlkbWxqWlY5dVlXMWxPZ3BzYjJOaGJBPT0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--4997283916bbc10dc299269d74e2b7972f2a9e97/%D8%AF%D8%B3%D8%AA%DA%A9%D8%B4.jpg"
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "taxonid": 172,
                            "parnetid": 173,
                            "taxonname": "فیوز مینیاتوری",
                            "metadescription": "",
                            "Depth": 2,
                            "Position": 0,
                            "items": null,
                            "taxons": [
                                {
                                    "taxonid": 179,
                                    "parnetid": 172,
                                    "taxonname": "بسته ترکیبی فیوز",
                                    "metadescription": null,
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": "(فیوز مینیاتوری 10 بچه کارتن(120پل",
                                            "metadescription": "",
                                            "description": "",
                                            "itemcode": "shirazfioz",
                                            "itemid": 451,
                                            "price": 10000.00,
                                            "totalremained": null,
                                            "itemcodes": null,
                                            "imageurl": null
                                        },
                                        {
                                            "Position": 2,
                                            "itemname": "(فیوز مینیاتوری 50 بچه کارتن(600پل",
                                            "metadescription": "",
                                            "description": "",
                                            "itemcode": "shirazfiuzz",
                                            "itemid": 453,
                                            "price": 10000.00,
                                            "totalremained": null,
                                            "itemcodes": null,
                                            "imageurl": null
                                        },
                                        {
                                            "Position": 3,
                                            "itemname": "(فیوز مینیاتوری 30 بچه کارتن(360پل",
                                            "metadescription": "",
                                            "description": "",
                                            "itemcode": "shirazfiuz",
                                            "itemid": 452,
                                            "price": 10000.00,
                                            "totalremained": null,
                                            "itemcodes": null,
                                            "imageurl": null
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "taxonid": 151,
                            "parnetid": 173,
                            "taxonname": "باتری",
                            "metadescription": null,
                            "Depth": 2,
                            "Position": 0,
                            "items": null,
                            "taxons": [
                                {
                                    "taxonid": 153,
                                    "parnetid": 151,
                                    "taxonname": "باتری قلمی",
                                    "metadescription": "",
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": "باتری قلمی کارتی(دو تایی)  ",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhibXh2YzJscE5EUnNhamN3TVhRMU0zUXhjSEJuYzNWc2FqaDFPQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVDJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW5Gc2JXa3VhbkJuSWpzZ1ptbHNaVzVoYldVcVBWVlVSaTA0SnljbFJEa2xPRElsUkRrbE9EUWxSRGtsT0RVbFJFSWxPRU11YW5CbkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSVBhVzFoWjJVdmFuQmxad1k3QmxRNkVYTmxjblpwWTJWZmJtRnRaVG9LYkc5allXdz0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--e529d0472240d1b75b5dff319de81010e03a30a8/%D9%82%D9%84%D9%85%DB%8C.jpg\", \"ItemCodes\": [ { \"Qty\": 160, \"Name\": \"قلمی کارتی(دو تایی)\", \"Step\": 20, \"Price\": 196745, \"mainsku\": \"9418\", \"Variants\": [ { \"Code\": \"9418\", \"Name\": \"قلمی کارتی(دو تایی)\", \"Step\": 20, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shiraazbtr",
                                            "itemid": 414,
                                            "price": 31479200.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 160,
                                                    "Name": "قلمی کارتی(دو تایی)",
                                                    "Step": 20,
                                                    "Price": 196745,
                                                    "mainsku": "9418",
                                                    "Variants": [
                                                        {
                                                            "Code": "9418",
                                                            "Name": "قلمی کارتی(دو تایی)",
                                                            "Step": 20,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhibXh2YzJscE5EUnNhamN3TVhRMU0zUXhjSEJuYzNWc2FqaDFPQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVDJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW5Gc2JXa3VhbkJuSWpzZ1ptbHNaVzVoYldVcVBWVlVSaTA0SnljbFJEa2xPRElsUkRrbE9EUWxSRGtsT0RVbFJFSWxPRU11YW5CbkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSVBhVzFoWjJVdmFuQmxad1k3QmxRNkVYTmxjblpwWTJWZmJtRnRaVG9LYkc5allXdz0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--e529d0472240d1b75b5dff319de81010e03a30a8/%D9%82%D9%84%D9%85%DB%8C.jpg"
                                        },
                                        {
                                            "Position": 3,
                                            "itemname": "قلمی شیرینگ(چهار تایی)",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhibXh2YzJscE5EUnNhamN3TVhRMU0zUXhjSEJuYzNWc2FqaDFPQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVDJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW5Gc2JXa3VhbkJuSWpzZ1ptbHNaVzVoYldVcVBWVlVSaTA0SnljbFJEa2xPRElsUkRrbE9EUWxSRGtsT0RVbFJFSWxPRU11YW5CbkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSVBhVzFoWjJVdmFuQmxad1k3QmxRNkVYTmxjblpwWTJWZmJtRnRaVG9LYkc5allXdz0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--e529d0472240d1b75b5dff319de81010e03a30a8/%D9%82%D9%84%D9%85%DB%8C.jpg\", \"ItemCodes\": [ { \"Qty\": 180, \"Name\": \"قلمی شیرینگ(چهار تایی)\", \"Step\": 20, \"Price\": 344755, \"mainsku\": \"9403\", \"Variants\": [ { \"Code\": \"9403\", \"Name\": \"قلمی شیرینگ(چهار تایی)\", \"Step\": 20, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shiraazcbtrys",
                                            "itemid": 418,
                                            "price": 62055900.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 180,
                                                    "Name": "قلمی شیرینگ(چهار تایی)",
                                                    "Step": 20,
                                                    "Price": 344755,
                                                    "mainsku": "9403",
                                                    "Variants": [
                                                        {
                                                            "Code": "9403",
                                                            "Name": "قلمی شیرینگ(چهار تایی)",
                                                            "Step": 20,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhibXh2YzJscE5EUnNhamN3TVhRMU0zUXhjSEJuYzNWc2FqaDFPQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVDJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW5Gc2JXa3VhbkJuSWpzZ1ptbHNaVzVoYldVcVBWVlVSaTA0SnljbFJEa2xPRElsUkRrbE9EUWxSRGtsT0RVbFJFSWxPRU11YW5CbkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSVBhVzFoWjJVdmFuQmxad1k3QmxRNkVYTmxjblpwWTJWZmJtRnRaVG9LYkc5allXdz0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--e529d0472240d1b75b5dff319de81010e03a30a8/%D9%82%D9%84%D9%85%DB%8C.jpg"
                                        },
                                        {
                                            "Position": 2,
                                            "itemname": "قلمی کارتی(چهار تایی)",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhibXh2YzJscE5EUnNhamN3TVhRMU0zUXhjSEJuYzNWc2FqaDFPQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVDJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW5Gc2JXa3VhbkJuSWpzZ1ptbHNaVzVoYldVcVBWVlVSaTA0SnljbFJEa2xPRElsUkRrbE9EUWxSRGtsT0RVbFJFSWxPRU11YW5CbkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSVBhVzFoWjJVdmFuQmxad1k3QmxRNkVYTmxjblpwWTJWZmJtRnRaVG9LYkc5allXdz0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--e529d0472240d1b75b5dff319de81010e03a30a8/%D9%82%D9%84%D9%85%DB%8C.jpg\", \"ItemCodes\": [ { \"Qty\": 160, \"Name\": \"قلمی کارتی(چهار تایی)\", \"Step\": 20, \"Price\": 388978, \"mainsku\": \"9402\", \"Variants\": [ { \"Code\": \"9402\", \"Name\": \"قلمی کارتی(چهار تایی)\", \"Step\": 20, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shiraazbtrr4",
                                            "itemid": 416,
                                            "price": 62236400.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 160,
                                                    "Name": "قلمی کارتی(چهار تایی)",
                                                    "Step": 20,
                                                    "Price": 388978,
                                                    "mainsku": "9402",
                                                    "Variants": [
                                                        {
                                                            "Code": "9402",
                                                            "Name": "قلمی کارتی(چهار تایی)",
                                                            "Step": 20,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhibXh2YzJscE5EUnNhamN3TVhRMU0zUXhjSEJuYzNWc2FqaDFPQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVDJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW5Gc2JXa3VhbkJuSWpzZ1ptbHNaVzVoYldVcVBWVlVSaTA0SnljbFJEa2xPRElsUkRrbE9EUWxSRGtsT0RVbFJFSWxPRU11YW5CbkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSVBhVzFoWjJVdmFuQmxad1k3QmxRNkVYTmxjblpwWTJWZmJtRnRaVG9LYkc5allXdz0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--e529d0472240d1b75b5dff319de81010e03a30a8/%D9%82%D9%84%D9%85%DB%8C.jpg"
                                        }
                                    ]
                                },
                                {
                                    "taxonid": 156,
                                    "parnetid": 151,
                                    "taxonname": "بسته ترکیبی باتری",
                                    "metadescription": "",
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": "قلمی و نیم قلم کارتی(دو تایی) , قلمی کارتی و شیرینگ(چهار تایی)  , نیم قلمی کارتی(چهار تایی) , کتابی 9ولت , قلمی متوسط و بزرگ (دو تایی) , ریموتی A23, A27, سکه ای و قلم و نیم قلم شارژی",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhhMmxwYjJzeWEzYzRNSEExY214dlpEbGxaV2s1YVRseE5HRnJkUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUzJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW1KMWNuVjRMV0owY2kwd01pNXFjR2NpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSjJKMWNuVjRMV0owY2kwd01pNXFjR2NHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc5cGJXRm5aUzlxY0dWbkJqc0dWRG9SYzJWeWRtbGpaVjl1WVcxbE9ncHNiMk5oYkE9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9rZXkifX0=--24425c0a85dc98977716bec8a35e4c6b112ac529/burux-btr-02.jpg\", \"ItemCodes\": [ { \"Qty\": 20, \"Name\": \"قلمی کارتی(دو تایی)\", \"Step\": 20, \"Price\": 194674, \"mainsku\": \"9418\", \"Variants\": [ { \"Code\": \"9418\", \"Name\": \"قلمی کارتی(دو تایی)\", \"Step\": 20, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 20, \"Name\": \"قلمی کارتی(چهار تایی)\", \"Step\": 20, \"Price\": 384883, \"mainsku\": \"9402\", \"Variants\": [ { \"Code\": \"9402\", \"Name\": \"قلمی کارتی(چهار تایی)\", \"Step\": 20, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 20, \"Name\": \"قلمی شیرینگ(چهار تایی)\", \"Step\": 20, \"Price\": 341126, \"mainsku\": \"9403\", \"Variants\": [ { \"Code\": \"9403\", \"Name\": \"قلمی شیرینگ(چهار تایی)\", \"Step\": 20, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 30, \"Name\": \"نیم قلمی کارتی(دو تایی)\", \"Step\": 30, \"Price\": 173242, \"mainsku\": \"9419\", \"Variants\": [ { \"Code\": \"9419\", \"Name\": \"نیم قلمی کارتی(دو تایی)\", \"Step\": 30, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 30, \"Name\": \"نیم قلمی کارتی(چهار تایی)\", \"Step\": 30, \"Price\": 341126, \"mainsku\": \"9400\", \"Variants\": [ { \"Code\": \"9400\", \"Name\": \"نیم قلمی کارتی(چهار تایی)\", \"Step\": 30, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 30, \"Name\": \"نیم قلمی شیرینگ(چهار تایی)\", \"Step\": 30, \"Price\": 302727, \"mainsku\": \"9401\", \"Variants\": [ { \"Code\": \"9401\", \"Name\": \"نیم قلمی شیرینگ(چهار تایی)\", \"Step\": 30, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 30, \"Name\": \"کتابی 9ولت\", \"Step\": 30, \"Price\": 389348, \"mainsku\": \"9422\", \"Variants\": [ { \"Code\": \"9422\", \"Name\": \"کتابی 9ولت\", \"Step\": 30, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 12, \"Name\": \"قلمی متوسط(دو تایی)\", \"Step\": 12, \"Price\": 626886, \"mainsku\": \"9420\", \"Variants\": [ { \"Code\": \"9420\", \"Name\": \"قلمی متوسط(دو تایی)\", \"Step\": 12, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 12, \"Name\": \"قلمی بزرگ(دو تایی)\", \"Step\": 12, \"Price\": 908181, \"mainsku\": \"9421\", \"Variants\": [ { \"Code\": \"9421\", \"Name\": \"قلمی بزرگ(دو تایی)\", \"Step\": 12, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 30, \"Name\": \"ریموتی A23\", \"Step\": 30, \"Price\": 151810, \"mainsku\": \"9423\", \"Variants\": [ { \"Code\": \"9423\", \"Name\": \"ریموتی A23\", \"Step\": 30, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 30, \"Name\": \"ریموتی A27\", \"Step\": 30, \"Price\": 151810, \"mainsku\": \"9427\", \"Variants\": [ { \"Code\": \"9427\", \"Name\": \"ریموتی A27\", \"Step\": 30, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 20, \"Name\": \"سکه ای 2016(5عددی)\", \"Step\": 20, \"Price\": 470611, \"mainsku\": \"9425\", \"Variants\": [ { \"Code\": \"9425\", \"Name\": \"سکه ای 2016(5عددی)\", \"Step\": 20, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 20, \"Name\": \"سکه ای 2025(5عددی)\", \"Step\": 20, \"Price\": 470611, \"mainsku\": \"9426\", \"Variants\": [ { \"Code\": \"9426\", \"Name\": \"سکه ای 2025(5عددی)\", \"Step\": 20, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 20, \"Name\": \"سکه ای 2032(5عددی)\", \"Step\": 20, \"Price\": 470611, \"mainsku\": \"9427\", \"Variants\": [ { \"Code\": \"9427\", \"Name\": \"سکه ای 2032(5عددی)\", \"Step\": 20, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 20, \"Name\": \"قلمی شارژی(2عددی)\", \"Step\": 20, \"Price\": 1567215, \"mainsku\": \"9428\", \"Variants\": [ { \"Code\": \"9428\", \"Name\": \"قلمی شارژی(2عددی)\", \"Step\": 20, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 20, \"Name\": \"نیم قلمی شارژی(2عددی)\", \"Step\": 20, \"Price\": 892107, \"mainsku\": \"9429\", \"Variants\": [ { \"Code\": \"9429\", \"Name\": \"نیم قلمی شارژی(2عددی)\", \"Step\": 20, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shirazbtry",
                                            "itemid": 450,
                                            "price": 168480524.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 20,
                                                    "Name": "قلمی کارتی(دو تایی)",
                                                    "Step": 20,
                                                    "Price": 194674,
                                                    "mainsku": "9418",
                                                    "Variants": [
                                                        {
                                                            "Code": "9418",
                                                            "Name": "قلمی کارتی(دو تایی)",
                                                            "Step": 20,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 20,
                                                    "Name": "قلمی کارتی(چهار تایی)",
                                                    "Step": 20,
                                                    "Price": 384883,
                                                    "mainsku": "9402",
                                                    "Variants": [
                                                        {
                                                            "Code": "9402",
                                                            "Name": "قلمی کارتی(چهار تایی)",
                                                            "Step": 20,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 20,
                                                    "Name": "قلمی شیرینگ(چهار تایی)",
                                                    "Step": 20,
                                                    "Price": 341126,
                                                    "mainsku": "9403",
                                                    "Variants": [
                                                        {
                                                            "Code": "9403",
                                                            "Name": "قلمی شیرینگ(چهار تایی)",
                                                            "Step": 20,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 30,
                                                    "Name": "نیم قلمی کارتی(دو تایی)",
                                                    "Step": 30,
                                                    "Price": 173242,
                                                    "mainsku": "9419",
                                                    "Variants": [
                                                        {
                                                            "Code": "9419",
                                                            "Name": "نیم قلمی کارتی(دو تایی)",
                                                            "Step": 30,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 30,
                                                    "Name": "نیم قلمی کارتی(چهار تایی)",
                                                    "Step": 30,
                                                    "Price": 341126,
                                                    "mainsku": "9400",
                                                    "Variants": [
                                                        {
                                                            "Code": "9400",
                                                            "Name": "نیم قلمی کارتی(چهار تایی)",
                                                            "Step": 30,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 30,
                                                    "Name": "نیم قلمی شیرینگ(چهار تایی)",
                                                    "Step": 30,
                                                    "Price": 302727,
                                                    "mainsku": "9401",
                                                    "Variants": [
                                                        {
                                                            "Code": "9401",
                                                            "Name": "نیم قلمی شیرینگ(چهار تایی)",
                                                            "Step": 30,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 30,
                                                    "Name": "کتابی 9ولت",
                                                    "Step": 30,
                                                    "Price": 389348,
                                                    "mainsku": "9422",
                                                    "Variants": [
                                                        {
                                                            "Code": "9422",
                                                            "Name": "کتابی 9ولت",
                                                            "Step": 30,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 12,
                                                    "Name": "قلمی متوسط(دو تایی)",
                                                    "Step": 12,
                                                    "Price": 626886,
                                                    "mainsku": "9420",
                                                    "Variants": [
                                                        {
                                                            "Code": "9420",
                                                            "Name": "قلمی متوسط(دو تایی)",
                                                            "Step": 12,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 12,
                                                    "Name": "قلمی بزرگ(دو تایی)",
                                                    "Step": 12,
                                                    "Price": 908181,
                                                    "mainsku": "9421",
                                                    "Variants": [
                                                        {
                                                            "Code": "9421",
                                                            "Name": "قلمی بزرگ(دو تایی)",
                                                            "Step": 12,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 30,
                                                    "Name": "ریموتی A23",
                                                    "Step": 30,
                                                    "Price": 151810,
                                                    "mainsku": "9423",
                                                    "Variants": [
                                                        {
                                                            "Code": "9423",
                                                            "Name": "ریموتی A23",
                                                            "Step": 30,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 30,
                                                    "Name": "ریموتی A27",
                                                    "Step": 30,
                                                    "Price": 151810,
                                                    "mainsku": "9427",
                                                    "Variants": [
                                                        {
                                                            "Code": "9427",
                                                            "Name": "ریموتی A27",
                                                            "Step": 30,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 20,
                                                    "Name": "سکه ای 2016(5عددی)",
                                                    "Step": 20,
                                                    "Price": 470611,
                                                    "mainsku": "9425",
                                                    "Variants": [
                                                        {
                                                            "Code": "9425",
                                                            "Name": "سکه ای 2016(5عددی)",
                                                            "Step": 20,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 20,
                                                    "Name": "سکه ای 2025(5عددی)",
                                                    "Step": 20,
                                                    "Price": 470611,
                                                    "mainsku": "9426",
                                                    "Variants": [
                                                        {
                                                            "Code": "9426",
                                                            "Name": "سکه ای 2025(5عددی)",
                                                            "Step": 20,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 20,
                                                    "Name": "سکه ای 2032(5عددی)",
                                                    "Step": 20,
                                                    "Price": 470611,
                                                    "mainsku": "9427",
                                                    "Variants": [
                                                        {
                                                            "Code": "9427",
                                                            "Name": "سکه ای 2032(5عددی)",
                                                            "Step": 20,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 20,
                                                    "Name": "قلمی شارژی(2عددی)",
                                                    "Step": 20,
                                                    "Price": 1567215,
                                                    "mainsku": "9428",
                                                    "Variants": [
                                                        {
                                                            "Code": "9428",
                                                            "Name": "قلمی شارژی(2عددی)",
                                                            "Step": 20,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 20,
                                                    "Name": "نیم قلمی شارژی(2عددی)",
                                                    "Step": 20,
                                                    "Price": 892107,
                                                    "mainsku": "9429",
                                                    "Variants": [
                                                        {
                                                            "Code": "9429",
                                                            "Name": "نیم قلمی شارژی(2عددی)",
                                                            "Step": 20,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhhMmxwYjJzeWEzYzRNSEExY214dlpEbGxaV2s1YVRseE5HRnJkUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUzJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW1KMWNuVjRMV0owY2kwd01pNXFjR2NpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSjJKMWNuVjRMV0owY2kwd01pNXFjR2NHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc5cGJXRm5aUzlxY0dWbkJqc0dWRG9SYzJWeWRtbGpaVjl1WVcxbE9ncHNiMk5oYkE9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9rZXkifX0=--24425c0a85dc98977716bec8a35e4c6b112ac529/burux-btr-02.jpg"
                                        }
                                    ]
                                },
                                {
                                    "taxonid": 155,
                                    "parnetid": 151,
                                    "taxonname": "باتری نیم قلمی",
                                    "metadescription": "",
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 3,
                                            "itemname": "نیم قلمی شیرینگ(چهار تایی)",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhibXh2YzJscE5EUnNhamN3TVhRMU0zUXhjSEJuYzNWc2FqaDFPQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVDJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW5Gc2JXa3VhbkJuSWpzZ1ptbHNaVzVoYldVcVBWVlVSaTA0SnljbFJEa2xPRElsUkRrbE9EUWxSRGtsT0RVbFJFSWxPRU11YW5CbkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSVBhVzFoWjJVdmFuQmxad1k3QmxRNkVYTmxjblpwWTJWZmJtRnRaVG9LYkc5allXdz0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--e529d0472240d1b75b5dff319de81010e03a30a8/%D9%82%D9%84%D9%85%DB%8C.jpg\", \"ItemCodes\": [ { \"Qty\": 180, \"Name\": \"نیم قلمی شیرینگ(چهار تایی)\", \"Step\": 30, \"Price\": 305948, \"mainsku\": \"9401\", \"Variants\": [ { \"Code\": \"9401\", \"Name\": \"نیم قلمی شیرینگ(چهار تایی)\", \"Step\": 30, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shiraazc6www",
                                            "itemid": 419,
                                            "price": 55070550.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 180,
                                                    "Name": "نیم قلمی شیرینگ(چهار تایی)",
                                                    "Step": 30,
                                                    "Price": 305948,
                                                    "mainsku": "9401",
                                                    "Variants": [
                                                        {
                                                            "Code": "9401",
                                                            "Name": "نیم قلمی شیرینگ(چهار تایی)",
                                                            "Step": 30,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhibXh2YzJscE5EUnNhamN3TVhRMU0zUXhjSEJuYzNWc2FqaDFPQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVDJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW5Gc2JXa3VhbkJuSWpzZ1ptbHNaVzVoYldVcVBWVlVSaTA0SnljbFJEa2xPRElsUkRrbE9EUWxSRGtsT0RVbFJFSWxPRU11YW5CbkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSVBhVzFoWjJVdmFuQmxad1k3QmxRNkVYTmxjblpwWTJWZmJtRnRaVG9LYkc5allXdz0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--e529d0472240d1b75b5dff319de81010e03a30a8/%D9%82%D9%84%D9%85%DB%8C.jpg"
                                        },
                                        {
                                            "Position": 1,
                                            "itemname": " باتری نیم قلمی کارتی(دو تایی)",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhibXh2YzJscE5EUnNhamN3TVhRMU0zUXhjSEJuYzNWc2FqaDFPQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVDJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW5Gc2JXa3VhbkJuSWpzZ1ptbHNaVzVoYldVcVBWVlVSaTA0SnljbFJEa2xPRElsUkRrbE9EUWxSRGtsT0RVbFJFSWxPRU11YW5CbkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSVBhVzFoWjJVdmFuQmxad1k3QmxRNkVYTmxjblpwWTJWZmJtRnRaVG9LYkc5allXdz0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--e529d0472240d1b75b5dff319de81010e03a30a8/%D9%82%D9%84%D9%85%DB%8C.jpg\", \"ItemCodes\": [ { \"Qty\": 240, \"Name\": \"نیم قلمی کارتی(دو تایی)\", \"Step\": 30, \"Price\": 175085, \"mainsku\": \"9419\", \"Variants\": [ { \"Code\": \"9419\", \"Name\": \"نیم قلمی کارتی(دو تایی)\", \"Step\": 30, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shiraazbtrr",
                                            "itemid": 415,
                                            "price": 42020400.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 240,
                                                    "Name": "نیم قلمی کارتی(دو تایی)",
                                                    "Step": 30,
                                                    "Price": 175085,
                                                    "mainsku": "9419",
                                                    "Variants": [
                                                        {
                                                            "Code": "9419",
                                                            "Name": "نیم قلمی کارتی(دو تایی)",
                                                            "Step": 30,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhibXh2YzJscE5EUnNhamN3TVhRMU0zUXhjSEJuYzNWc2FqaDFPQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVDJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW5Gc2JXa3VhbkJuSWpzZ1ptbHNaVzVoYldVcVBWVlVSaTA0SnljbFJEa2xPRElsUkRrbE9EUWxSRGtsT0RVbFJFSWxPRU11YW5CbkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSVBhVzFoWjJVdmFuQmxad1k3QmxRNkVYTmxjblpwWTJWZmJtRnRaVG9LYkc5allXdz0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--e529d0472240d1b75b5dff319de81010e03a30a8/%D9%82%D9%84%D9%85%DB%8C.jpg"
                                        },
                                        {
                                            "Position": 2,
                                            "itemname": "نیم قلمی کارتی(چهار تایی)",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhibXh2YzJscE5EUnNhamN3TVhRMU0zUXhjSEJuYzNWc2FqaDFPQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVDJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW5Gc2JXa3VhbkJuSWpzZ1ptbHNaVzVoYldVcVBWVlVSaTA0SnljbFJEa2xPRElsUkRrbE9EUWxSRGtsT0RVbFJFSWxPRU11YW5CbkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSVBhVzFoWjJVdmFuQmxad1k3QmxRNkVYTmxjblpwWTJWZmJtRnRaVG9LYkc5allXdz0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--e529d0472240d1b75b5dff319de81010e03a30a8/%D9%82%D9%84%D9%85%DB%8C.jpg\", \"ItemCodes\": [ { \"Qty\": 240, \"Name\": \"نیم قلمی کارتی(چهار تایی)\", \"Step\": 30, \"Price\": 344755, \"mainsku\": \"9400\", \"Variants\": [ { \"Code\": \"9400\", \"Name\": \"نیم قلمی کارتی(چهار تایی)\", \"Step\": 30, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shiraazbtrri",
                                            "itemid": 417,
                                            "price": 82741200.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 240,
                                                    "Name": "نیم قلمی کارتی(چهار تایی)",
                                                    "Step": 30,
                                                    "Price": 344755,
                                                    "mainsku": "9400",
                                                    "Variants": [
                                                        {
                                                            "Code": "9400",
                                                            "Name": "نیم قلمی کارتی(چهار تایی)",
                                                            "Step": 30,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhibXh2YzJscE5EUnNhamN3TVhRMU0zUXhjSEJuYzNWc2FqaDFPQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVDJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW5Gc2JXa3VhbkJuSWpzZ1ptbHNaVzVoYldVcVBWVlVSaTA0SnljbFJEa2xPRElsUkRrbE9EUWxSRGtsT0RVbFJFSWxPRU11YW5CbkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSVBhVzFoWjJVdmFuQmxad1k3QmxRNkVYTmxjblpwWTJWZmJtRnRaVG9LYkc5allXdz0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--e529d0472240d1b75b5dff319de81010e03a30a8/%D9%82%D9%84%D9%85%DB%8C.jpg"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    "taxonid": 159,
                    "taxonname": "سیم و کابل",
                    "metadescription": null,
                    "Depth": 1,
                    "Position": 0,
                    "items": null,
                    "taxons": [
                        {
                            "taxonid": 174,
                            "parnetid": 159,
                            "taxonname": "سیم ها",
                            "metadescription": null,
                            "Depth": 2,
                            "Position": 0,
                            "items": null,
                            "taxons": [
                                {
                                    "taxonid": 170,
                                    "parnetid": 174,
                                    "taxonname": "بسته سیم افشان 4",
                                    "metadescription": null,
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": "سیم افشان 4  ده کلاف 100 متری",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhOakZ6Tm5KaGJteDJNR1kwT1ROek1EUnliREI2YzIxc00ydDVhQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRJdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB5TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--5d73f5cf14fd1a57d9afa1a8ed52895044affc81/Untitled-2.jpg\", \"ItemCodes\": [ { \"Qty\": 10, \"Name\": \"سیم افشان 4\", \"Step\": 1, \"Price\": 17630005, \"mainsku\": \"7240\", \"Variants\": [ { \"Code\": \"7240\", \"Name\": \"مشکی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7241\", \"Name\": \"آبی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7242\", \"Name\": \"قرمز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7243\", \"Name\": \"ارت\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shiraazsmaf",
                                            "itemid": 429,
                                            "price": 17630005000.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 10,
                                                    "Name": "سیم افشان 4",
                                                    "Step": 1,
                                                    "Price": 17630005,
                                                    "mainsku": "7240",
                                                    "Variants": [
                                                        {
                                                            "Code": "7240",
                                                            "Name": "مشکی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7241",
                                                            "Name": "آبی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7242",
                                                            "Name": "قرمز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7243",
                                                            "Name": "ارت",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhOakZ6Tm5KaGJteDJNR1kwT1ROek1EUnliREI2YzIxc00ydDVhQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRJdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB5TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--5d73f5cf14fd1a57d9afa1a8ed52895044affc81/Untitled-2.jpg"
                                        },
                                        {
                                            "Position": 2,
                                            "itemname": "سیم افشان 4  پنج کلاف 100 متری",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhOakZ6Tm5KaGJteDJNR1kwT1ROek1EUnliREI2YzIxc00ydDVhQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRJdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB5TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--5d73f5cf14fd1a57d9afa1a8ed52895044affc81/Untitled-2.jpg\", \"ItemCodes\": [ { \"Qty\": 5, \"Name\": \"سیم افشان 4\", \"Step\": 1, \"Price\": 17815584, \"mainsku\": \"7240\", \"Variants\": [ { \"Code\": \"7240\", \"Name\": \"مشکی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7241\", \"Name\": \"آبی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7242\", \"Name\": \"قرمز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7243\", \"Name\": \"ارت\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shirraaz",
                                            "itemid": 430,
                                            "price": 8907792000.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 5,
                                                    "Name": "سیم افشان 4",
                                                    "Step": 1,
                                                    "Price": 17815584,
                                                    "mainsku": "7240",
                                                    "Variants": [
                                                        {
                                                            "Code": "7240",
                                                            "Name": "مشکی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7241",
                                                            "Name": "آبی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7242",
                                                            "Name": "قرمز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7243",
                                                            "Name": "ارت",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhOakZ6Tm5KaGJteDJNR1kwT1ROek1EUnliREI2YzIxc00ydDVhQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRJdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB5TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--5d73f5cf14fd1a57d9afa1a8ed52895044affc81/Untitled-2.jpg"
                                        },
                                        {
                                            "Position": 3,
                                            "itemname": "سیم افشان 4  سه کلاف 100 متری",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhOakZ6Tm5KaGJteDJNR1kwT1ROek1EUnliREI2YzIxc00ydDVhQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRJdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB5TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--5d73f5cf14fd1a57d9afa1a8ed52895044affc81/Untitled-2.jpg\", \"ItemCodes\": [ { \"Qty\": 3, \"Name\": \"سیم افشان 4\", \"Step\": 1, \"Price\": 18186742, \"mainsku\": \"7240\", \"Variants\": [ { \"Code\": \"7240\", \"Name\": \"مشکی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7241\", \"Name\": \"آبی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7242\", \"Name\": \"قرمز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7243\", \"Name\": \"ارت\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shiraazsimaf",
                                            "itemid": 431,
                                            "price": 5456022600.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 3,
                                                    "Name": "سیم افشان 4",
                                                    "Step": 1,
                                                    "Price": 18186742,
                                                    "mainsku": "7240",
                                                    "Variants": [
                                                        {
                                                            "Code": "7240",
                                                            "Name": "مشکی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7241",
                                                            "Name": "آبی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7242",
                                                            "Name": "قرمز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7243",
                                                            "Name": "ارت",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhOakZ6Tm5KaGJteDJNR1kwT1ROek1EUnliREI2YzIxc00ydDVhQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRJdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB5TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--5d73f5cf14fd1a57d9afa1a8ed52895044affc81/Untitled-2.jpg"
                                        }
                                    ]
                                },
                                {
                                    "taxonid": 171,
                                    "parnetid": 174,
                                    "taxonname": "بسته سیم افشان 6",
                                    "metadescription": null,
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": "سیم افشان 6  سه کلاف 100 متری",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhObkExTW1ObWRuaDJiV2g1YmpoNFlYSjBZWE16ZVhSdU9IaHFOUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRJdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB5TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--13b70ad3634f9fbcae4dba2a1edabded044ca007/Untitled-2.jpg\", \"ItemCodes\": [ { \"Qty\": 3, \"Name\": \"سیم افشان 6\", \"Step\": 1, \"Price\": 24100160, \"mainsku\": \"7250\", \"Variants\": [ { \"Code\": \"7250\", \"Name\": \"مشکی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7251\", \"Name\": \"آبی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7252\", \"Name\": \"قرمز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7253\", \"Name\": \"ارت\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shirraazsim",
                                            "itemid": 426,
                                            "price": 7230048000.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 3,
                                                    "Name": "سیم افشان 6",
                                                    "Step": 1,
                                                    "Price": 24100160,
                                                    "mainsku": "7250",
                                                    "Variants": [
                                                        {
                                                            "Code": "7250",
                                                            "Name": "مشکی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7251",
                                                            "Name": "آبی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7252",
                                                            "Name": "قرمز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7253",
                                                            "Name": "ارت",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhObkExTW1ObWRuaDJiV2g1YmpoNFlYSjBZWE16ZVhSdU9IaHFOUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRJdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB5TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--13b70ad3634f9fbcae4dba2a1edabded044ca007/Untitled-2.jpg"
                                        },
                                        {
                                            "Position": 2,
                                            "itemname": "سیم افشان 6  پنج کلاف 100 متری",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhObkExTW1ObWRuaDJiV2g1YmpoNFlYSjBZWE16ZVhSdU9IaHFOUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRJdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB5TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--13b70ad3634f9fbcae4dba2a1edabded044ca007/Untitled-2.jpg\", \"ItemCodes\": [ { \"Qty\": 5, \"Name\": \"سیم افشان 6\", \"Step\": 1, \"Price\": 23608320, \"mainsku\": \"7250\", \"Variants\": [ { \"Code\": \"7250\", \"Name\": \"مشکی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7251\", \"Name\": \"آبی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7252\", \"Name\": \"قرمز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7253\", \"Name\": \"ارت\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shiraazzsm",
                                            "itemid": 427,
                                            "price": 11804160000.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 5,
                                                    "Name": "سیم افشان 6",
                                                    "Step": 1,
                                                    "Price": 23608320,
                                                    "mainsku": "7250",
                                                    "Variants": [
                                                        {
                                                            "Code": "7250",
                                                            "Name": "مشکی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7251",
                                                            "Name": "آبی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7252",
                                                            "Name": "قرمز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7253",
                                                            "Name": "ارت",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhObkExTW1ObWRuaDJiV2g1YmpoNFlYSjBZWE16ZVhSdU9IaHFOUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRJdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB5TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--13b70ad3634f9fbcae4dba2a1edabded044ca007/Untitled-2.jpg"
                                        },
                                        {
                                            "Position": 3,
                                            "itemname": "سیم افشان 6 ده کلاف 100 متری",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhObkExTW1ObWRuaDJiV2g1YmpoNFlYSjBZWE16ZVhSdU9IaHFOUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRJdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB5TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--13b70ad3634f9fbcae4dba2a1edabded044ca007/Untitled-2.jpg\", \"ItemCodes\": [ { \"Qty\": 10, \"Name\": \"سیم افشان 6\", \"Step\": 1, \"Price\": 23362400, \"mainsku\": \"7250\", \"Variants\": [ { \"Code\": \"7250\", \"Name\": \"مشکی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7251\", \"Name\": \"آبی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7252\", \"Name\": \"قرمز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7253\", \"Name\": \"ارت\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shiraazafshn",
                                            "itemid": 428,
                                            "price": 23362400000.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 10,
                                                    "Name": "سیم افشان 6",
                                                    "Step": 1,
                                                    "Price": 23362400,
                                                    "mainsku": "7250",
                                                    "Variants": [
                                                        {
                                                            "Code": "7250",
                                                            "Name": "مشکی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7251",
                                                            "Name": "آبی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7252",
                                                            "Name": "قرمز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7253",
                                                            "Name": "ارت",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhObkExTW1ObWRuaDJiV2g1YmpoNFlYSjBZWE16ZVhSdU9IaHFOUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRJdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB5TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--13b70ad3634f9fbcae4dba2a1edabded044ca007/Untitled-2.jpg"
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "taxonid": 175,
                            "parnetid": 159,
                            "taxonname": "کابل ها",
                            "metadescription": null,
                            "Depth": 2,
                            "Position": 0,
                            "items": null,
                            "taxons": [
                                {
                                    "taxonid": 167,
                                    "parnetid": 175,
                                    "taxonname": "بسته 4 زوج مس",
                                    "metadescription": null,
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": "سه کلاف 300 متری مس کابل 4 زوج ",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhaR0ZzYjI5d1puVTJZMkl6Tm1saWNuWnlPSGhtY0hBMGNtNTBhUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRFdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB4TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--44cce443b52574f76f592fb696e9cc9d6197f7b9/Untitled-1.jpg\", \"ItemCodes\": [ { \"Qty\": 900, \"Name\": \"کابل 4 زوج مس\", \"Step\": 300, \"Price\": 128151, \"mainsku\": \"7331\", \"Variants\": [ { \"Code\": \"7331\", \"Name\": \"طوسی\", \"Step\": 300, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "COPY OF shiraazkblzoj",
                                            "itemid": 447,
                                            "price": 115335612.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 900,
                                                    "Name": "کابل 4 زوج مس",
                                                    "Step": 300,
                                                    "Price": 128151,
                                                    "mainsku": "7331",
                                                    "Variants": [
                                                        {
                                                            "Code": "7331",
                                                            "Name": "طوسی",
                                                            "Step": 300,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhaR0ZzYjI5d1puVTJZMkl6Tm1saWNuWnlPSGhtY0hBMGNtNTBhUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRFdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB4TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--44cce443b52574f76f592fb696e9cc9d6197f7b9/Untitled-1.jpg"
                                        },
                                        {
                                            "Position": 2,
                                            "itemname": "پنج کلاف 300 متری کابل 4 زوج مس",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhaR0ZzYjI5d1puVTJZMkl6Tm1saWNuWnlPSGhtY0hBMGNtNTBhUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRFdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB4TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--44cce443b52574f76f592fb696e9cc9d6197f7b9/Untitled-1.jpg\", \"ItemCodes\": [ { \"Qty\": 1500, \"Name\": \"کابل 4 زوج مس\", \"Step\": 300, \"Price\": 125535, \"mainsku\": \"7331\", \"Variants\": [ { \"Code\": \"7331\", \"Name\": \"طوسی\", \"Step\": 300, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "COPY OF COPY OF shiraazkblzoj",
                                            "itemid": 448,
                                            "price": 188303040.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 1500,
                                                    "Name": "کابل 4 زوج مس",
                                                    "Step": 300,
                                                    "Price": 125535,
                                                    "mainsku": "7331",
                                                    "Variants": [
                                                        {
                                                            "Code": "7331",
                                                            "Name": "طوسی",
                                                            "Step": 300,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhaR0ZzYjI5d1puVTJZMkl6Tm1saWNuWnlPSGhtY0hBMGNtNTBhUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRFdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB4TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--44cce443b52574f76f592fb696e9cc9d6197f7b9/Untitled-1.jpg"
                                        },
                                        {
                                            "Position": 3,
                                            "itemname": "ده کلاف 300 متری کابل 4 زوج مس",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhaR0ZzYjI5d1puVTJZMkl6Tm1saWNuWnlPSGhtY0hBMGNtNTBhUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRFdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB4TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--44cce443b52574f76f592fb696e9cc9d6197f7b9/Untitled-1.jpg\", \"ItemCodes\": [ { \"Qty\": 3000, \"Name\": \"کابل 4 زوج مس\", \"Step\": 300, \"Price\": 124228, \"mainsku\": \"7331\", \"Variants\": [ { \"Code\": \"7331\", \"Name\": \"طوسی\", \"Step\": 300, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "COPY OF COPY OF COPY OF shiraazkblzoj",
                                            "itemid": 449,
                                            "price": 372683100.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 3000,
                                                    "Name": "کابل 4 زوج مس",
                                                    "Step": 300,
                                                    "Price": 124228,
                                                    "mainsku": "7331",
                                                    "Variants": [
                                                        {
                                                            "Code": "7331",
                                                            "Name": "طوسی",
                                                            "Step": 300,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhaR0ZzYjI5d1puVTJZMkl6Tm1saWNuWnlPSGhtY0hBMGNtNTBhUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRFdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB4TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--44cce443b52574f76f592fb696e9cc9d6197f7b9/Untitled-1.jpg"
                                        }
                                    ]
                                },
                                {
                                    "taxonid": 164,
                                    "parnetid": 175,
                                    "taxonname": "بسته سیم انتن سپهر",
                                    "metadescription": null,
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": "سیم انتن سپهر3  قرقره",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhabVkwWldWdmMydHlhVEZsWW5ZM05uZDRjR2RwZDNWMGRXZ3daQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRJdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB5TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--23397386d3cb0d3c20fc8cbffa8cd135df5926c6/Untitled-2.jpg\", \"ItemCodes\": [ { \"Qty\": 1500, \"Name\": \"سیم آنتن سپهر\", \"Step\": 1500, \"Price\": 98980, \"mainsku\": \"7340\", \"Variants\": [ { \"Code\": \"7340\", \"Name\": \"تمام مس\", \"Step\": 1500, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shirazsim",
                                            "itemid": 420,
                                            "price": 148470000.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 1500,
                                                    "Name": "سیم آنتن سپهر",
                                                    "Step": 1500,
                                                    "Price": 98980,
                                                    "mainsku": "7340",
                                                    "Variants": [
                                                        {
                                                            "Code": "7340",
                                                            "Name": "تمام مس",
                                                            "Step": 1500,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhabVkwWldWdmMydHlhVEZsWW5ZM05uZDRjR2RwZDNWMGRXZ3daQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRJdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB5TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--23397386d3cb0d3c20fc8cbffa8cd135df5926c6/Untitled-2.jpg"
                                        },
                                        {
                                            "Position": 3,
                                            "itemname": " سیم انتن سپهر10 قرقره",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhabVkwWldWdmMydHlhVEZsWW5ZM05uZDRjR2RwZDNWMGRXZ3daQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRJdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB5TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--23397386d3cb0d3c20fc8cbffa8cd135df5926c6/Untitled-2.jpg\", \"ItemCodes\": [ { \"Qty\": 5000, \"Name\": \"سیم آنتن سپهر\", \"Step\": 5000, \"Price\": 95950, \"mainsku\": \"7340\", \"Variants\": [ { \"Code\": \"7340\", \"Name\": \"تمام مس\", \"Step\": 5000, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shiraazsims",
                                            "itemid": 422,
                                            "price": 479750000.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 5000,
                                                    "Name": "سیم آنتن سپهر",
                                                    "Step": 5000,
                                                    "Price": 95950,
                                                    "mainsku": "7340",
                                                    "Variants": [
                                                        {
                                                            "Code": "7340",
                                                            "Name": "تمام مس",
                                                            "Step": 5000,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhabVkwWldWdmMydHlhVEZsWW5ZM05uZDRjR2RwZDNWMGRXZ3daQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRJdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB5TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--23397386d3cb0d3c20fc8cbffa8cd135df5926c6/Untitled-2.jpg"
                                        },
                                        {
                                            "Position": 2,
                                            "itemname": "سیم انتن سپهر5  قرقره",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhabVkwWldWdmMydHlhVEZsWW5ZM05uZDRjR2RwZDNWMGRXZ3daQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRJdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB5TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--23397386d3cb0d3c20fc8cbffa8cd135df5926c6/Untitled-2.jpg\", \"ItemCodes\": [ { \"Qty\": 2500, \"Name\": \"سیم آنتن سپهر\", \"Step\": 2500, \"Price\": 96960, \"mainsku\": \"7340\", \"Variants\": [ { \"Code\": \"7340\", \"Name\": \"تمام مس\", \"Step\": 2500, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shiraazsimm",
                                            "itemid": 421,
                                            "price": 479750000.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 2500,
                                                    "Name": "سیم آنتن سپهر",
                                                    "Step": 2500,
                                                    "Price": 96960,
                                                    "mainsku": "7340",
                                                    "Variants": [
                                                        {
                                                            "Code": "7340",
                                                            "Name": "تمام مس",
                                                            "Step": 2500,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhabVkwWldWdmMydHlhVEZsWW5ZM05uZDRjR2RwZDNWMGRXZ3daQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRJdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB5TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--23397386d3cb0d3c20fc8cbffa8cd135df5926c6/Untitled-2.jpg"
                                        }
                                    ]
                                },
                                {
                                    "taxonid": 169,
                                    "parnetid": 175,
                                    "taxonname": "بسته کابل 2.5*2",
                                    "metadescription": "",
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": "کابل 2.5*2 پنج کلاف 300متری",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhiR3N6TmpZNGJuRm9lamhqYTNSdmFtaDFabTR3WlRZMGVUazNNQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRNdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB6TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--7485bf56a0368a22853ae747fd6e8808acdd0f0c/Untitled-3.jpg\", \"ItemCodes\": [ { \"Qty\": 5, \"Name\": \"کابل 2*2.5\", \"Step\": 1, \"Price\": 25195200, \"mainsku\": \"7312\", \"Variants\": [ { \"Code\": \"7312\", \"Name\": \"مشکی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shiraazkbbl",
                                            "itemid": 433,
                                            "price": 12597600000.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 5,
                                                    "Name": "کابل 2*2.5",
                                                    "Step": 1,
                                                    "Price": 25195200,
                                                    "mainsku": "7312",
                                                    "Variants": [
                                                        {
                                                            "Code": "7312",
                                                            "Name": "مشکی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhiR3N6TmpZNGJuRm9lamhqYTNSdmFtaDFabTR3WlRZMGVUazNNQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRNdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB6TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--7485bf56a0368a22853ae747fd6e8808acdd0f0c/Untitled-3.jpg"
                                        },
                                        {
                                            "Position": 3,
                                            "itemname": "کابل 2.5*2 ده کلاف 300متری",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhiR3N6TmpZNGJuRm9lamhqYTNSdmFtaDFabTR3WlRZMGVUazNNQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRNdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB6TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--7485bf56a0368a22853ae747fd6e8808acdd0f0c/Untitled-3.jpg\", \"ItemCodes\": [ { \"Qty\": 10, \"Name\": \"کابل 2*2.5\", \"Step\": 1, \"Price\": 24932750, \"mainsku\": \"7312\", \"Variants\": [ { \"Code\": \"7312\", \"Name\": \"مشکی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shiraazkbll",
                                            "itemid": 434,
                                            "price": 24932750000.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 10,
                                                    "Name": "کابل 2*2.5",
                                                    "Step": 1,
                                                    "Price": 24932750,
                                                    "mainsku": "7312",
                                                    "Variants": [
                                                        {
                                                            "Code": "7312",
                                                            "Name": "مشکی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhiR3N6TmpZNGJuRm9lamhqYTNSdmFtaDFabTR3WlRZMGVUazNNQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRNdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB6TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--7485bf56a0368a22853ae747fd6e8808acdd0f0c/Untitled-3.jpg"
                                        },
                                        {
                                            "Position": 2,
                                            "itemname": "کابل 2.5*2 سه کلاف 300متری",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhiR3N6TmpZNGJuRm9lamhqYTNSdmFtaDFabTR3WlRZMGVUazNNQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRNdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB6TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--7485bf56a0368a22853ae747fd6e8808acdd0f0c/Untitled-3.jpg\", \"ItemCodes\": [ { \"Qty\": 3, \"Name\": \"کابل 2*2.5\", \"Step\": 1, \"Price\": 25720100, \"mainsku\": \"7312\", \"Variants\": [ { \"Code\": \"7312\", \"Name\": \"مشکی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shiraazkbl",
                                            "itemid": 432,
                                            "price": 7716030000.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 3,
                                                    "Name": "کابل 2*2.5",
                                                    "Step": 1,
                                                    "Price": 25720100,
                                                    "mainsku": "7312",
                                                    "Variants": [
                                                        {
                                                            "Code": "7312",
                                                            "Name": "مشکی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhiR3N6TmpZNGJuRm9lamhqYTNSdmFtaDFabTR3WlRZMGVUazNNQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRNdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB6TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--7485bf56a0368a22853ae747fd6e8808acdd0f0c/Untitled-3.jpg"
                                        }
                                    ]
                                },
                                {
                                    "taxonid": 168,
                                    "parnetid": 175,
                                    "taxonname": "بسته 6 زوج مس",
                                    "metadescription": null,
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": "کابل 6 زوج مس سه کلاف 250متری",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhaR0ZzYjI5d1puVTJZMkl6Tm1saWNuWnlPSGhtY0hBMGNtNTBhUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRFdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB4TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--44cce443b52574f76f592fb696e9cc9d6197f7b9/Untitled-1.jpg\", \"ItemCodes\": [ { \"Qty\": 750, \"Name\": \"کابل 6 زوج مس\", \"Step\": 250, \"Price\": 185828, \"mainsku\": \"7332\", \"Variants\": [ { \"Code\": \"7332\", \"Name\": \"طوسی\", \"Step\": 250, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shiraazkbls",
                                            "itemid": 435,
                                            "price": 139370700.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 750,
                                                    "Name": "کابل 6 زوج مس",
                                                    "Step": 250,
                                                    "Price": 185828,
                                                    "mainsku": "7332",
                                                    "Variants": [
                                                        {
                                                            "Code": "7332",
                                                            "Name": "طوسی",
                                                            "Step": 250,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhaR0ZzYjI5d1puVTJZMkl6Tm1saWNuWnlPSGhtY0hBMGNtNTBhUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRFdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB4TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--44cce443b52574f76f592fb696e9cc9d6197f7b9/Untitled-1.jpg"
                                        },
                                        {
                                            "Position": 2,
                                            "itemname": "کابل 6 زوج مس پنج کلاف 250متری",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhaR0ZzYjI5d1puVTJZMkl6Tm1saWNuWnlPSGhtY0hBMGNtNTBhUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRFdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB4TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--44cce443b52574f76f592fb696e9cc9d6197f7b9/Untitled-1.jpg\", \"ItemCodes\": [ { \"Qty\": 1250, \"Name\": \"کابل 6 زوج مس\", \"Step\": 250, \"Price\": 182035, \"mainsku\": \"7332\", \"Variants\": [ { \"Code\": \"7332\", \"Name\": \"طوسی\", \"Step\": 250, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shiraazkblsi",
                                            "itemid": 436,
                                            "price": 227544000.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 1250,
                                                    "Name": "کابل 6 زوج مس",
                                                    "Step": 250,
                                                    "Price": 182035,
                                                    "mainsku": "7332",
                                                    "Variants": [
                                                        {
                                                            "Code": "7332",
                                                            "Name": "طوسی",
                                                            "Step": 250,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhaR0ZzYjI5d1puVTJZMkl6Tm1saWNuWnlPSGhtY0hBMGNtNTBhUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRFdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB4TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--44cce443b52574f76f592fb696e9cc9d6197f7b9/Untitled-1.jpg"
                                        },
                                        {
                                            "Position": 3,
                                            "itemname": "کابل 6 زوج مس ده کلاف 250متری",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhaR0ZzYjI5d1puVTJZMkl6Tm1saWNuWnlPSGhtY0hBMGNtNTBhUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRFdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB4TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--44cce443b52574f76f592fb696e9cc9d6197f7b9/Untitled-1.jpg\", \"ItemCodes\": [ { \"Qty\": 2500, \"Name\": \"کابل 6 زوج مس\", \"Step\": 250, \"Price\": 180139, \"mainsku\": \"7332\", \"Variants\": [ { \"Code\": \"7332\", \"Name\": \"طوسی\", \"Step\": 250, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shiraazkblsix",
                                            "itemid": 437,
                                            "price": 450347500.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 2500,
                                                    "Name": "کابل 6 زوج مس",
                                                    "Step": 250,
                                                    "Price": 180139,
                                                    "mainsku": "7332",
                                                    "Variants": [
                                                        {
                                                            "Code": "7332",
                                                            "Name": "طوسی",
                                                            "Step": 250,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhaR0ZzYjI5d1puVTJZMkl6Tm1saWNuWnlPSGhtY0hBMGNtNTBhUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRFdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB4TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--44cce443b52574f76f592fb696e9cc9d6197f7b9/Untitled-1.jpg"
                                        }
                                    ]
                                },
                                {
                                    "taxonid": 165,
                                    "parnetid": 175,
                                    "taxonname": "بسته سیم آنتن سما",
                                    "metadescription": null,
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": "سیم انتن سما 5 قرقره",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhabVkwWldWdmMydHlhVEZsWW5ZM05uZDRjR2RwZDNWMGRXZ3daQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRJdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB5TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--23397386d3cb0d3c20fc8cbffa8cd135df5926c6/Untitled-2.jpg\", \"ItemCodes\": [ { \"Qty\": 2500, \"Name\": \"سیم آنتن سما\", \"Step\": 2500, \"Price\": 36480, \"mainsku\": \"7341\", \"Variants\": [ { \"Code\": \"7341\", \"Name\": \"مس و CCA\", \"Step\": 2500, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shiraazsimantn",
                                            "itemid": 424,
                                            "price": 91200000.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 2500,
                                                    "Name": "سیم آنتن سما",
                                                    "Step": 2500,
                                                    "Price": 36480,
                                                    "mainsku": "7341",
                                                    "Variants": [
                                                        {
                                                            "Code": "7341",
                                                            "Name": "مس و CCA",
                                                            "Step": 2500,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhabVkwWldWdmMydHlhVEZsWW5ZM05uZDRjR2RwZDNWMGRXZ3daQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRJdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB5TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--23397386d3cb0d3c20fc8cbffa8cd135df5926c6/Untitled-2.jpg"
                                        },
                                        {
                                            "Position": 2,
                                            "itemname": "سیم انتن سما 3 قرقره",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhabVkwWldWdmMydHlhVEZsWW5ZM05uZDRjR2RwZDNWMGRXZ3daQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRJdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB5TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--23397386d3cb0d3c20fc8cbffa8cd135df5926c6/Untitled-2.jpg\", \"ItemCodes\": [ { \"Qty\": 1500, \"Name\": \"سیم آنتن سما\", \"Step\": 1500, \"Price\": 37240, \"mainsku\": \"7341\", \"Variants\": [ { \"Code\": \"7341\", \"Name\": \"مس و CCA\", \"Step\": 1500, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shiraazantensi",
                                            "itemid": 423,
                                            "price": 55860000.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 1500,
                                                    "Name": "سیم آنتن سما",
                                                    "Step": 1500,
                                                    "Price": 37240,
                                                    "mainsku": "7341",
                                                    "Variants": [
                                                        {
                                                            "Code": "7341",
                                                            "Name": "مس و CCA",
                                                            "Step": 1500,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhabVkwWldWdmMydHlhVEZsWW5ZM05uZDRjR2RwZDNWMGRXZ3daQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRJdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB5TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--23397386d3cb0d3c20fc8cbffa8cd135df5926c6/Untitled-2.jpg"
                                        },
                                        {
                                            "Position": 3,
                                            "itemname": "سیم انتن سما 10 قرقره",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhabVkwWldWdmMydHlhVEZsWW5ZM05uZDRjR2RwZDNWMGRXZ3daQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRJdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB5TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--23397386d3cb0d3c20fc8cbffa8cd135df5926c6/Untitled-2.jpg\", \"ItemCodes\": [ { \"Qty\": 5000, \"Name\": \"سیم آنتن سما\", \"Step\": 5000, \"Price\": 36100, \"mainsku\": \"7341\", \"Variants\": [ { \"Code\": \"7341\", \"Name\": \"مس و CCA\", \"Step\": 5000, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shiraazsimant",
                                            "itemid": 425,
                                            "price": 180500000.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 5000,
                                                    "Name": "سیم آنتن سما",
                                                    "Step": 5000,
                                                    "Price": 36100,
                                                    "mainsku": "7341",
                                                    "Variants": [
                                                        {
                                                            "Code": "7341",
                                                            "Name": "مس و CCA",
                                                            "Step": 5000,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhabVkwWldWdmMydHlhVEZsWW5ZM05uZDRjR2RwZDNWMGRXZ3daQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRJdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB5TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--23397386d3cb0d3c20fc8cbffa8cd135df5926c6/Untitled-2.jpg"
                                        }
                                    ]
                                },
                                {
                                    "taxonid": 166,
                                    "parnetid": 175,
                                    "taxonname": "ccaبسته کابل 2 زوج ",
                                    "metadescription": null,
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": " پنج کلاف 400 متری cca کابل 2 زوج ",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhkbU5zYW0wM2IzSjJNRFo2Y3pBNGVYbG5aSFEwWmpoeVptNDFaQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRNdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB6TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--e23598a5da59ffb77e9d7ca994400901cd7df759/Untitled-3.jpg\", \"ItemCodes\": [ { \"Qty\": 2000, \"Name\": \"کابل 2 زوج CCA\", \"Step\": 400, \"Price\": 26635, \"mainsku\": \"7333\", \"Variants\": [ { \"Code\": \"7333\", \"Name\": \"طوسی\", \"Step\": 400, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shiraazkblzo",
                                            "itemid": 439,
                                            "price": 53270400.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 2000,
                                                    "Name": "کابل 2 زوج CCA",
                                                    "Step": 400,
                                                    "Price": 26635,
                                                    "mainsku": "7333",
                                                    "Variants": [
                                                        {
                                                            "Code": "7333",
                                                            "Name": "طوسی",
                                                            "Step": 400,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhkbU5zYW0wM2IzSjJNRFo2Y3pBNGVYbG5aSFEwWmpoeVptNDFaQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRNdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB6TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--e23598a5da59ffb77e9d7ca994400901cd7df759/Untitled-3.jpg"
                                        },
                                        {
                                            "Position": 2,
                                            "itemname": " سه کلاف 400 متری cca کابل 2 زوج ",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhkbU5zYW0wM2IzSjJNRFo2Y3pBNGVYbG5aSFEwWmpoeVptNDFaQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRNdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB6TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--e23598a5da59ffb77e9d7ca994400901cd7df759/Untitled-3.jpg\", \"ItemCodes\": [ { \"Qty\": 1200, \"Name\": \"کابل 2 زوج CCA\", \"Step\": 400, \"Price\": 27190, \"mainsku\": \"7333\", \"Variants\": [ { \"Code\": \"7333\", \"Name\": \"طوسی\", \"Step\": 400, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shiraazkblzoj",
                                            "itemid": 440,
                                            "price": 32628120.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 1200,
                                                    "Name": "کابل 2 زوج CCA",
                                                    "Step": 400,
                                                    "Price": 27190,
                                                    "mainsku": "7333",
                                                    "Variants": [
                                                        {
                                                            "Code": "7333",
                                                            "Name": "طوسی",
                                                            "Step": 400,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhkbU5zYW0wM2IzSjJNRFo2Y3pBNGVYbG5aSFEwWmpoeVptNDFaQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRNdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB6TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--e23598a5da59ffb77e9d7ca994400901cd7df759/Untitled-3.jpg"
                                        },
                                        {
                                            "Position": 3,
                                            "itemname": " ده کلاف 400 متری cca کابل 2 زوج ",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhkbU5zYW0wM2IzSjJNRFo2Y3pBNGVYbG5aSFEwWmpoeVptNDFaQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRNdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB6TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--e23598a5da59ffb77e9d7ca994400901cd7df759/Untitled-3.jpg\", \"ItemCodes\": [ { \"Qty\": 4000, \"Name\": \"کابل 2 زوج CCA\", \"Step\": 400, \"Price\": 26358, \"mainsku\": \"7333\", \"Variants\": [ { \"Code\": \"7333\", \"Name\": \"طوسی\", \"Step\": 400, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shiraazkblz",
                                            "itemid": 438,
                                            "price": 105431000.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 4000,
                                                    "Name": "کابل 2 زوج CCA",
                                                    "Step": 400,
                                                    "Price": 26358,
                                                    "mainsku": "7333",
                                                    "Variants": [
                                                        {
                                                            "Code": "7333",
                                                            "Name": "طوسی",
                                                            "Step": 400,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhkbU5zYW0wM2IzSjJNRFo2Y3pBNGVYbG5aSFEwWmpoeVptNDFaQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxWdWRHbDBiR1ZrTFRNdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWRWYm5ScGRHeGxaQzB6TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--e23598a5da59ffb77e9d7ca994400901cd7df759/Untitled-3.jpg"
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "taxonid": 178,
                            "parnetid": 159,
                            "taxonname": "بسته های سیم و کابل",
                            "metadescription": null,
                            "Depth": 2,
                            "Position": 0,
                            "items": null,
                            "taxons": [
                                {
                                    "taxonid": 163,
                                    "parnetid": 178,
                                    "taxonname": "بسته شگفت انگیز سیم و کابل ",
                                    "metadescription": null,
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": "کابل 6 زوج مس , کابل 4 زوج مس , کابل 4 زوجcc,کابل ۲ زوجcc, سیم انتن سما , سیم انتن سپهر , کابل 4*2 , کابل 2.5*2 , سیم افشان 6 , سیم افشان 4 , سیم افشان 2,5 , سیم افشان 1,5 , سیم1",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhNSFV6ZFhSMWEzVnZZbkIwZVhKb2FtSTBibTluT0d0bk4yeDBZZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpTzJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW5OcGJTNXFabWxtSWpzZ1ptbHNaVzVoYldVcVBWVlVSaTA0SnlkemFXMHVhbVpwWmdZN0JsUTZFV052Ym5SbGJuUmZkSGx3WlVraUQybHRZV2RsTDJwd1pXY0dPd1pVT2hGelpYSjJhV05sWDI1aGJXVTZDbXh2WTJGcyIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9rZXkifX0=--01082ddf9ecfa3ab868cb6d6c511719e0ea497b5/sim.jfif\", \"ItemCodes\": [ { \"Qty\": 10, \"Name\": \"سیم افشان 1\", \"Step\": 1, \"Price\": 4379500, \"mainsku\": \"7210\", \"Variants\": [ { \"Code\": \"7210\", \"Name\": \"مشکی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7211\", \"Name\": \"آبی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7212\", \"Name\": \"قرمز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7213\", \"Name\": \"ارت\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7214\", \"Name\": \"سبز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 50, \"Name\": \"سیم افشان 1.5\", \"Step\": 1, \"Price\": 7052002, \"mainsku\": \"7220\", \"Variants\": [ { \"Code\": \"7220\", \"Name\": \"مشکی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7221\", \"Name\": \"آبی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7222\", \"Name\": \"قرمز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7223\", \"Name\": \"ارت\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7224\", \"Name\": \"سبز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7225\", \"Name\": \"زرد\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7226\", \"Name\": \"قهوه ای\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 50, \"Name\": \"سیم افشان 2.5\", \"Step\": 1, \"Price\": 10578003, \"mainsku\": \"7230\", \"Variants\": [ { \"Code\": \"7230\", \"Name\": \"مشکی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7231\", \"Name\": \"آبی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7232\", \"Name\": \"قرمز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7233\", \"Name\": \"ارت\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7234\", \"Name\": \"سبز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7235\", \"Name\": \"زرد\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7236\", \"Name\": \"قهوه ای\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 10, \"Name\": \"سیم افشان 4\", \"Step\": 1, \"Price\": 17630005, \"mainsku\": \"7240\", \"Variants\": [ { \"Code\": \"7240\", \"Name\": \"مشکی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7241\", \"Name\": \"آبی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7242\", \"Name\": \"قرمز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7243\", \"Name\": \"ارت\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 10, \"Name\": \"سیم افشان 6\", \"Step\": 1, \"Price\": 23362400, \"mainsku\": \"7250\", \"Variants\": [ { \"Code\": \"7250\", \"Name\": \"مشکی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7251\", \"Name\": \"آبی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7252\", \"Name\": \"قرمز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7253\", \"Name\": \"ارت\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 1, \"Name\": \"کابل 2*2.5\", \"Step\": 1, \"Price\": 24932750, \"mainsku\": \"7312\", \"Variants\": [ { \"Code\": \"7312\", \"Name\": \"مشکی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 1, \"Name\": \"کابل 2*4\", \"Step\": 1, \"Price\": 38353400, \"mainsku\": \"7313\", \"Variants\": [ { \"Code\": \"7313\", \"Name\": \"مشکی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 500, \"Name\": \"سیم آنتن سپهر\", \"Step\": 500, \"Price\": 95950, \"mainsku\": \"7340\", \"Variants\": [ { \"Code\": \"7340\", \"Name\": \"تمام مس\", \"Step\": 500, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 500, \"Name\": \"سیم آنتن سما\", \"Step\": 500, \"Price\": 36100, \"mainsku\": \"7341\", \"Variants\": [ { \"Code\": \"7341\", \"Name\": \"مس و CCA\", \"Step\": 500, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 400, \"Name\": \"کابل 2 زوج CCA\", \"Step\": 400, \"Price\": 26358, \"mainsku\": \"7333\", \"Variants\": [ { \"Code\": \"7333\", \"Name\": \"طوسی\", \"Step\": 400, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 300, \"Name\": \"کابل 4 زوج CCA\", \"Step\": 300, \"Price\": 46610, \"mainsku\": \"7334\", \"Variants\": [ { \"Code\": \"7334\", \"Name\": \"طوسی\", \"Step\": 300, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 300, \"Name\": \"کابل 4 زوج مس\", \"Step\": 300, \"Price\": 124228, \"mainsku\": \"7331\", \"Variants\": [ { \"Code\": \"7331\", \"Name\": \"طوسی\", \"Step\": 300, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 250, \"Name\": \"کابل 6 زوج مس\", \"Step\": 250, \"Price\": 180139, \"mainsku\": \"7332\", \"Variants\": [ { \"Code\": \"7332\", \"Name\": \"طوسی\", \"Step\": 250, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shirazgoldsim",
                                            "itemid": 442,
                                            "price": 1571359565.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 10,
                                                    "Name": "سیم افشان 1",
                                                    "Step": 1,
                                                    "Price": 4379500,
                                                    "mainsku": "7210",
                                                    "Variants": [
                                                        {
                                                            "Code": "7210",
                                                            "Name": "مشکی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7211",
                                                            "Name": "آبی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7212",
                                                            "Name": "قرمز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7213",
                                                            "Name": "ارت",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7214",
                                                            "Name": "سبز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 50,
                                                    "Name": "سیم افشان 1.5",
                                                    "Step": 1,
                                                    "Price": 7052002,
                                                    "mainsku": "7220",
                                                    "Variants": [
                                                        {
                                                            "Code": "7220",
                                                            "Name": "مشکی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7221",
                                                            "Name": "آبی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7222",
                                                            "Name": "قرمز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7223",
                                                            "Name": "ارت",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7224",
                                                            "Name": "سبز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7225",
                                                            "Name": "زرد",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7226",
                                                            "Name": "قهوه ای",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 50,
                                                    "Name": "سیم افشان 2.5",
                                                    "Step": 1,
                                                    "Price": 10578003,
                                                    "mainsku": "7230",
                                                    "Variants": [
                                                        {
                                                            "Code": "7230",
                                                            "Name": "مشکی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7231",
                                                            "Name": "آبی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7232",
                                                            "Name": "قرمز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7233",
                                                            "Name": "ارت",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7234",
                                                            "Name": "سبز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7235",
                                                            "Name": "زرد",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7236",
                                                            "Name": "قهوه ای",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 10,
                                                    "Name": "سیم افشان 4",
                                                    "Step": 1,
                                                    "Price": 17630005,
                                                    "mainsku": "7240",
                                                    "Variants": [
                                                        {
                                                            "Code": "7240",
                                                            "Name": "مشکی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7241",
                                                            "Name": "آبی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7242",
                                                            "Name": "قرمز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7243",
                                                            "Name": "ارت",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 10,
                                                    "Name": "سیم افشان 6",
                                                    "Step": 1,
                                                    "Price": 23362400,
                                                    "mainsku": "7250",
                                                    "Variants": [
                                                        {
                                                            "Code": "7250",
                                                            "Name": "مشکی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7251",
                                                            "Name": "آبی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7252",
                                                            "Name": "قرمز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7253",
                                                            "Name": "ارت",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 1,
                                                    "Name": "کابل 2*2.5",
                                                    "Step": 1,
                                                    "Price": 24932750,
                                                    "mainsku": "7312",
                                                    "Variants": [
                                                        {
                                                            "Code": "7312",
                                                            "Name": "مشکی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 1,
                                                    "Name": "کابل 2*4",
                                                    "Step": 1,
                                                    "Price": 38353400,
                                                    "mainsku": "7313",
                                                    "Variants": [
                                                        {
                                                            "Code": "7313",
                                                            "Name": "مشکی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 500,
                                                    "Name": "سیم آنتن سپهر",
                                                    "Step": 500,
                                                    "Price": 95950,
                                                    "mainsku": "7340",
                                                    "Variants": [
                                                        {
                                                            "Code": "7340",
                                                            "Name": "تمام مس",
                                                            "Step": 500,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 500,
                                                    "Name": "سیم آنتن سما",
                                                    "Step": 500,
                                                    "Price": 36100,
                                                    "mainsku": "7341",
                                                    "Variants": [
                                                        {
                                                            "Code": "7341",
                                                            "Name": "مس و CCA",
                                                            "Step": 500,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 400,
                                                    "Name": "کابل 2 زوج CCA",
                                                    "Step": 400,
                                                    "Price": 26358,
                                                    "mainsku": "7333",
                                                    "Variants": [
                                                        {
                                                            "Code": "7333",
                                                            "Name": "طوسی",
                                                            "Step": 400,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 300,
                                                    "Name": "کابل 4 زوج CCA",
                                                    "Step": 300,
                                                    "Price": 46610,
                                                    "mainsku": "7334",
                                                    "Variants": [
                                                        {
                                                            "Code": "7334",
                                                            "Name": "طوسی",
                                                            "Step": 300,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 300,
                                                    "Name": "کابل 4 زوج مس",
                                                    "Step": 300,
                                                    "Price": 124228,
                                                    "mainsku": "7331",
                                                    "Variants": [
                                                        {
                                                            "Code": "7331",
                                                            "Name": "طوسی",
                                                            "Step": 300,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 250,
                                                    "Name": "کابل 6 زوج مس",
                                                    "Step": 250,
                                                    "Price": 180139,
                                                    "mainsku": "7332",
                                                    "Variants": [
                                                        {
                                                            "Code": "7332",
                                                            "Name": "طوسی",
                                                            "Step": 250,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhNSFV6ZFhSMWEzVnZZbkIwZVhKb2FtSTBibTluT0d0bk4yeDBZZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpTzJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW5OcGJTNXFabWxtSWpzZ1ptbHNaVzVoYldVcVBWVlVSaTA0SnlkemFXMHVhbVpwWmdZN0JsUTZFV052Ym5SbGJuUmZkSGx3WlVraUQybHRZV2RsTDJwd1pXY0dPd1pVT2hGelpYSjJhV05sWDI1aGJXVTZDbXh2WTJGcyIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9rZXkifX0=--01082ddf9ecfa3ab868cb6d6c511719e0ea497b5/sim.jfif"
                                        }
                                    ]
                                },
                                {
                                    "taxonid": 160,
                                    "parnetid": 178,
                                    "taxonname": "بسته های مهیج سیم و کابل",
                                    "metadescription": "",
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 3,
                                            "itemname": "سیم 1.5, سیم 2.5  , سیم 4 , سیم 6 , سیم آنتن سپهر",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhjVFpzY1RZMk5YcG5lWFU1Ym5SbVluUTJhSFJ0TkhoemJHMTVZUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpYjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWtsdVpIVnpkSEpwWVd3dFEyRmliR1V0VTJodmNDMWpiM0I1TFcxcGJpNXdibWNpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSjBsdVpIVnpkSEpwWVd3dFEyRmliR1V0VTJodmNDMWpiM0I1TFcxcGJpNXdibWNHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc1cGJXRm5aUzl3Ym1jR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--cafab34a976cf8592d51fcc4922ea018a46f12f1/Industrial-Cable-Shop-copy-min.png\", \"ItemCodes\": [ { \"Qty\": 50, \"Name\": \"سیم افشان 1.5\", \"Step\": 1, \"Price\": 7200465, \"mainsku\": \"7220\", \"Variants\": [ { \"Code\": \"7220\", \"Name\": \"مشکی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7221\", \"Name\": \"آبی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7222\", \"Name\": \"قرمز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7223\", \"Name\": \"ارت\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7224\", \"Name\": \"سبز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7225\", \"Name\": \"زرد\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7226\", \"Name\": \"قهوه ای\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 50, \"Name\": \"سیم افشان 2.5\", \"Step\": 1, \"Price\": 10800698, \"mainsku\": \"7230\", \"Variants\": [ { \"Code\": \"7230\", \"Name\": \"مشکی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7231\", \"Name\": \"آبی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7232\", \"Name\": \"قرمز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7233\", \"Name\": \"ارت\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7234\", \"Name\": \"سبز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7235\", \"Name\": \"زرد\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7236\", \"Name\": \"قهوه ای\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 10, \"Name\": \"سیم افشان 4\", \"Step\": 1, \"Price\": 18001163, \"mainsku\": \"7240\", \"Variants\": [ { \"Code\": \"7240\", \"Name\": \"مشکی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7241\", \"Name\": \"آبی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7242\", \"Name\": \"قرمز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7243\", \"Name\": \"ارت\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 10, \"Name\": \"سیم افشان 6\", \"Step\": 1, \"Price\": 23854240, \"mainsku\": \"7250\", \"Variants\": [ { \"Code\": \"7250\", \"Name\": \"مشکی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7251\", \"Name\": \"آبی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7252\", \"Name\": \"قرمز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7253\", \"Name\": \"ارت\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 500, \"Name\": \"سیم آنتن سپهر\", \"Step\": 500, \"Price\": 97970, \"mainsku\": \"7340\", \"Variants\": [ { \"Code\": \"7340\", \"Name\": \"تمام مس\", \"Step\": 500, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shirazsimtr",
                                            "itemid": 443,
                                            "price": 180846218.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 5,
                                                    "Name": "سیم افشان 1.5",
                                                    "Step": 1,
                                                    "Price": 7200465,
                                                    "mainsku": "7220",
                                                    "Variants": [
                                                        {
                                                            "Code": "7220",
                                                            "Name": "مشکی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7221",
                                                            "Name": "آبی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7222",
                                                            "Name": "قرمز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7223",
                                                            "Name": "ارت",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7224",
                                                            "Name": "سبز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7225",
                                                            "Name": "زرد",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7226",
                                                            "Name": "قهوه ای",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 5,
                                                    "Name": "سیم افشان 2.5",
                                                    "Step": 1,
                                                    "Price": 10800698,
                                                    "mainsku": "7230",
                                                    "Variants": [
                                                        {
                                                            "Code": "7230",
                                                            "Name": "مشکی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7231",
                                                            "Name": "آبی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7232",
                                                            "Name": "قرمز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7233",
                                                            "Name": "ارت",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7234",
                                                            "Name": "سبز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7235",
                                                            "Name": "زرد",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7236",
                                                            "Name": "قهوه ای",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 1,
                                                    "Name": "سیم افشان 4",
                                                    "Step": 1,
                                                    "Price": 18001163,
                                                    "mainsku": "7240",
                                                    "Variants": [
                                                        {
                                                            "Code": "7240",
                                                            "Name": "مشکی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7241",
                                                            "Name": "آبی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7242",
                                                            "Name": "قرمز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7243",
                                                            "Name": "ارت",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 1,
                                                    "Name": "سیم افشان 6",
                                                    "Step": 1,
                                                    "Price": 23854240,
                                                    "mainsku": "7250",
                                                    "Variants": [
                                                        {
                                                            "Code": "7250",
                                                            "Name": "مشکی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7251",
                                                            "Name": "آبی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7252",
                                                            "Name": "قرمز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7253",
                                                            "Name": "ارت",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 500,
                                                    "Name": "سیم آنتن سپهر",
                                                    "Step": 500,
                                                    "Price": 97970,
                                                    "mainsku": "7340",
                                                    "Variants": [
                                                        {
                                                            "Code": "7340",
                                                            "Name": "تمام مس",
                                                            "Step": 500,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhjVFpzY1RZMk5YcG5lWFU1Ym5SbVluUTJhSFJ0TkhoemJHMTVZUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpYjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWtsdVpIVnpkSEpwWVd3dFEyRmliR1V0VTJodmNDMWpiM0I1TFcxcGJpNXdibWNpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSjBsdVpIVnpkSEpwWVd3dFEyRmliR1V0VTJodmNDMWpiM0I1TFcxcGJpNXdibWNHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc1cGJXRm5aUzl3Ym1jR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--cafab34a976cf8592d51fcc4922ea018a46f12f1/Industrial-Cable-Shop-copy-min.png"
                                        },
                                        {
                                            "Position": 1,
                                            "itemname": "سیم 1.5  , سیم 2.5 ,کابل 4* 2 ,کابل 2.5*2 ",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhjVFpzY1RZMk5YcG5lWFU1Ym5SbVluUTJhSFJ0TkhoemJHMTVZUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpYjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWtsdVpIVnpkSEpwWVd3dFEyRmliR1V0VTJodmNDMWpiM0I1TFcxcGJpNXdibWNpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSjBsdVpIVnpkSEpwWVd3dFEyRmliR1V0VTJodmNDMWpiM0I1TFcxcGJpNXdibWNHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc1cGJXRm5aUzl3Ym1jR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--cafab34a976cf8592d51fcc4922ea018a46f12f1/Industrial-Cable-Shop-copy-min.png\", \"ItemCodes\": [ { \"Qty\": 50, \"Name\": \"سیم افشان 1.5\", \"Step\": 1, \"Price\": 7200465, \"mainsku\": \"7220\", \"Variants\": [ { \"Code\": \"7220\", \"Name\": \"مشکی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7221\", \"Name\": \"آبی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7222\", \"Name\": \"قرمز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7223\", \"Name\": \"ارت\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7224\", \"Name\": \"سبز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7225\", \"Name\": \"زرد\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7226\", \"Name\": \"قهوه ای\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 50, \"Name\": \"سیم افشان 2.5\", \"Step\": 1, \"Price\": 10800698, \"mainsku\": \"7230\", \"Variants\": [ { \"Code\": \"7230\", \"Name\": \"مشکی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7231\", \"Name\": \"آبی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7232\", \"Name\": \"قرمز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7233\", \"Name\": \"ارت\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7234\", \"Name\": \"سبز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7235\", \"Name\": \"زرد\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7236\", \"Name\": \"قهوه ای\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 1, \"Name\": \"کابل 2*2.5\", \"Step\": 1, \"Price\": 25457650, \"mainsku\": \"7312\", \"Variants\": [ { \"Code\": \"7312\", \"Name\": \"مشکی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 1, \"Name\": \"کابل 2*4\", \"Step\": 1, \"Price\": 39160840, \"mainsku\": \"7313\", \"Variants\": [ { \"Code\": \"7313\", \"Name\": \"مشکی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shiraazcx",
                                            "itemid": 444,
                                            "price": 154624305.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 5,
                                                    "Name": "سیم افشان 1.5",
                                                    "Step": 1,
                                                    "Price": 7200465,
                                                    "mainsku": "7220",
                                                    "Variants": [
                                                        {
                                                            "Code": "7220",
                                                            "Name": "مشکی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7221",
                                                            "Name": "آبی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7222",
                                                            "Name": "قرمز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7223",
                                                            "Name": "ارت",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7224",
                                                            "Name": "سبز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7225",
                                                            "Name": "زرد",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7226",
                                                            "Name": "قهوه ای",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 5,
                                                    "Name": "سیم افشان 2.5",
                                                    "Step": 1,
                                                    "Price": 10800698,
                                                    "mainsku": "7230",
                                                    "Variants": [
                                                        {
                                                            "Code": "7230",
                                                            "Name": "مشکی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7231",
                                                            "Name": "آبی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7232",
                                                            "Name": "قرمز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7233",
                                                            "Name": "ارت",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7234",
                                                            "Name": "سبز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7235",
                                                            "Name": "زرد",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7236",
                                                            "Name": "قهوه ای",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 1,
                                                    "Name": "کابل 2*2.5",
                                                    "Step": 1,
                                                    "Price": 25457650,
                                                    "mainsku": "7312",
                                                    "Variants": [
                                                        {
                                                            "Code": "7312",
                                                            "Name": "مشکی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 1,
                                                    "Name": "کابل 2*4",
                                                    "Step": 1,
                                                    "Price": 39160840,
                                                    "mainsku": "7313",
                                                    "Variants": [
                                                        {
                                                            "Code": "7313",
                                                            "Name": "مشکی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhjVFpzY1RZMk5YcG5lWFU1Ym5SbVluUTJhSFJ0TkhoemJHMTVZUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpYjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWtsdVpIVnpkSEpwWVd3dFEyRmliR1V0VTJodmNDMWpiM0I1TFcxcGJpNXdibWNpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSjBsdVpIVnpkSEpwWVd3dFEyRmliR1V0VTJodmNDMWpiM0I1TFcxcGJpNXdibWNHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc1cGJXRm5aUzl3Ym1jR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--cafab34a976cf8592d51fcc4922ea018a46f12f1/Industrial-Cable-Shop-copy-min.png"
                                        },
                                        {
                                            "Position": 2,
                                            "itemname": " سیم 1.5  , سیم 2.5 ,4 زوج مس , 6 زوج مس",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhjVFpzY1RZMk5YcG5lWFU1Ym5SbVluUTJhSFJ0TkhoemJHMTVZUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpYjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWtsdVpIVnpkSEpwWVd3dFEyRmliR1V0VTJodmNDMWpiM0I1TFcxcGJpNXdibWNpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSjBsdVpIVnpkSEpwWVd3dFEyRmliR1V0VTJodmNDMWpiM0I1TFcxcGJpNXdibWNHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc1cGJXRm5aUzl3Ym1jR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--cafab34a976cf8592d51fcc4922ea018a46f12f1/Industrial-Cable-Shop-copy-min.png\", \"ItemCodes\": [ { \"Qty\": 50, \"Name\": \"سیم افشان 1.5\", \"Step\": 1, \"Price\": 7200465, \"mainsku\": \"7220\", \"Variants\": [ { \"Code\": \"7220\", \"Name\": \"مشکی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7221\", \"Name\": \"آبی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7222\", \"Name\": \"قرمز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7223\", \"Name\": \"ارت\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7224\", \"Name\": \"سبز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7225\", \"Name\": \"زرد\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7226\", \"Name\": \"قهوه ای\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 50, \"Name\": \"سیم افشان 2.5\", \"Step\": 1, \"Price\": 10800698, \"mainsku\": \"7230\", \"Variants\": [ { \"Code\": \"7230\", \"Name\": \"مشکی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7231\", \"Name\": \"آبی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7232\", \"Name\": \"قرمز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7233\", \"Name\": \"ارت\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7234\", \"Name\": \"سبز\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7235\", \"Name\": \"زرد\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7236\", \"Name\": \"قهوه ای\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 300, \"Name\": \"کابل 4 زوج مس\", \"Step\": 300, \"Price\": 126843, \"mainsku\": \"7331\", \"Variants\": [ { \"Code\": \"7331\", \"Name\": \"طوسی\", \"Step\": 300, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 250, \"Name\": \"کابل 6 زوج مس\", \"Step\": 250, \"Price\": 183931, \"mainsku\": \"7332\", \"Variants\": [ { \"Code\": \"7332\", \"Name\": \"طوسی\", \"Step\": 250, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "",
                                            "itemcode": "shiraazcss",
                                            "itemid": 445,
                                            "price": 174041571.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 5,
                                                    "Name": "سیم افشان 1.5",
                                                    "Step": 1,
                                                    "Price": 7200465,
                                                    "mainsku": "7220",
                                                    "Variants": [
                                                        {
                                                            "Code": "7220",
                                                            "Name": "مشکی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7221",
                                                            "Name": "آبی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7222",
                                                            "Name": "قرمز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7223",
                                                            "Name": "ارت",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7224",
                                                            "Name": "سبز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7225",
                                                            "Name": "زرد",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7226",
                                                            "Name": "قهوه ای",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 5,
                                                    "Name": "سیم افشان 2.5",
                                                    "Step": 1,
                                                    "Price": 10800698,
                                                    "mainsku": "7230",
                                                    "Variants": [
                                                        {
                                                            "Code": "7230",
                                                            "Name": "مشکی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7231",
                                                            "Name": "آبی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7232",
                                                            "Name": "قرمز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7233",
                                                            "Name": "ارت",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7234",
                                                            "Name": "سبز",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7235",
                                                            "Name": "زرد",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7236",
                                                            "Name": "قهوه ای",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 300,
                                                    "Name": "کابل 4 زوج مس",
                                                    "Step": 300,
                                                    "Price": 126843,
                                                    "mainsku": "7331",
                                                    "Variants": [
                                                        {
                                                            "Code": "7331",
                                                            "Name": "طوسی",
                                                            "Step": 300,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 250,
                                                    "Name": "کابل 6 زوج مس",
                                                    "Step": 250,
                                                    "Price": 183931,
                                                    "mainsku": "7332",
                                                    "Variants": [
                                                        {
                                                            "Code": "7332",
                                                            "Name": "طوسی",
                                                            "Step": 250,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhjVFpzY1RZMk5YcG5lWFU1Ym5SbVluUTJhSFJ0TkhoemJHMTVZUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpYjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWtsdVpIVnpkSEpwWVd3dFEyRmliR1V0VTJodmNDMWpiM0I1TFcxcGJpNXdibWNpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSjBsdVpIVnpkSEpwWVd3dFEyRmliR1V0VTJodmNDMWpiM0I1TFcxcGJpNXdibWNHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc1cGJXRm5aUzl3Ym1jR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--cafab34a976cf8592d51fcc4922ea018a46f12f1/Industrial-Cable-Shop-copy-min.png"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    "taxonid": 124,
                    "taxonname": "روشنایی",
                    "metadescription": null,
                    "Depth": 1,
                    "Position": 0,
                    "items": null,
                    "taxons": [
                        {
                            "taxonid": 125,
                            "parnetid": 124,
                            "taxonname": "لامپ",
                            "metadescription": "",
                            "Depth": 2,
                            "Position": 0,
                            "items": null,
                            "taxons": [
                                {
                                    "taxonid": 136,
                                    "parnetid": 125,
                                    "taxonname": "بسته هالوژن با سوکت",
                                    "metadescription": null,
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": "بسته هالوژن 3 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhObWxxY1RabmMyNWlPVGxxZERKemRtRmpOR3BpTVRsNVkzSmhhUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUVdsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWtoaGJHOW5aVzR1YW5Cbklqc2dabWxzWlc1aGJXVXFQVlZVUmkwNEp5ZElZV3h2WjJWdUxtcHdad1k3QmxRNkVXTnZiblJsYm5SZmRIbHdaVWtpRDJsdFlXZGxMMnB3WldjR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--dc56289d2f077873bc4b2d8528fbe33df7998fa7/Halogen.jpg\", \"ItemCodes\": [{\"Qty\": 300, \"Name\": \"  هالوژن 7 وات\", \"Step\": 50, \"Price\": 364820, \"mainsku\": \"3502K3\", \"Variants\": [{\"Code\": \"3502\", \"Name\": \"مهتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"3500\", \"Name\": \"آفتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p>هالوژن :&nbsp; 300 عدد : 26900 تومان</p>",
                                            "itemcode": "EXBR0017",
                                            "itemid": 255,
                                            "price": 87592500.00,
                                            "totalremained": 26,
                                            "itemcodes": [
                                                {
                                                    "Qty": 300,
                                                    "Name": "  هالوژن 7 وات",
                                                    "Step": 50,
                                                    "Price": 291975,
                                                    "mainsku": "3502K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "3502",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "3500",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhObWxxY1RabmMyNWlPVGxxZERKemRtRmpOR3BpTVRsNVkzSmhhUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUVdsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWtoaGJHOW5aVzR1YW5Cbklqc2dabWxzWlc1aGJXVXFQVlZVUmkwNEp5ZElZV3h2WjJWdUxtcHdad1k3QmxRNkVXTnZiblJsYm5SZmRIbHdaVWtpRDJsdFlXZGxMMnB3WldjR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--dc56289d2f077873bc4b2d8528fbe33df7998fa7/Halogen.jpg"
                                        },
                                        {
                                            "Position": 2,
                                            "itemname": "بسته هالوژن 5 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhObWxxY1RabmMyNWlPVGxxZERKemRtRmpOR3BpTVRsNVkzSmhhUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUVdsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWtoaGJHOW5aVzR1YW5Cbklqc2dabWxzWlc1aGJXVXFQVlZVUmkwNEp5ZElZV3h2WjJWdUxtcHdad1k3QmxRNkVXTnZiblJsYm5SZmRIbHdaVWtpRDJsdFlXZGxMMnB3WldjR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--dc56289d2f077873bc4b2d8528fbe33df7998fa7/Halogen.jpg\", \"ItemCodes\": [{\"Qty\": 500, \"Name\": \"  هالوژن 7 وات\", \"Step\": 50, \"Price\": 353300, \"mainsku\": \"3502K3\", \"Variants\": [{\"Code\": \"3502\", \"Name\": \"مهتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"3500\", \"Name\": \"آفتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p>هالوژن :&nbsp; 500 عدد : 25900 تومان</p>",
                                            "itemcode": "EXBR0054",
                                            "itemid": 296,
                                            "price": 142094500.00,
                                            "totalremained": 15,
                                            "itemcodes": [
                                                {
                                                    "Qty": 500,
                                                    "Name": "  هالوژن 7 وات",
                                                    "Step": 50,
                                                    "Price": 284189,
                                                    "mainsku": "3502K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "3502",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "3500",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhObWxxY1RabmMyNWlPVGxxZERKemRtRmpOR3BpTVRsNVkzSmhhUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUVdsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWtoaGJHOW5aVzR1YW5Cbklqc2dabWxzWlc1aGJXVXFQVlZVUmkwNEp5ZElZV3h2WjJWdUxtcHdad1k3QmxRNkVXTnZiblJsYm5SZmRIbHdaVWtpRDJsdFlXZGxMMnB3WldjR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--dc56289d2f077873bc4b2d8528fbe33df7998fa7/Halogen.jpg"
                                        },
                                        {
                                            "Position": 3,
                                            "itemname": "بسته هالوژن 10 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhObWxxY1RabmMyNWlPVGxxZERKemRtRmpOR3BpTVRsNVkzSmhhUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUVdsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWtoaGJHOW5aVzR1YW5Cbklqc2dabWxzWlc1aGJXVXFQVlZVUmkwNEp5ZElZV3h2WjJWdUxtcHdad1k3QmxRNkVXTnZiblJsYm5SZmRIbHdaVWtpRDJsdFlXZGxMMnB3WldjR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--dc56289d2f077873bc4b2d8528fbe33df7998fa7/Halogen.jpg\", \"ItemCodes\": [{\"Qty\": 1000, \"Name\": \"  هالوژن 7 وات\", \"Step\": 50, \"Price\": 334100, \"mainsku\": \"3502K3\", \"Variants\": [{\"Code\": \"3502\", \"Name\": \"مهتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"3500\", \"Name\": \"آفتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p>هالوژن :&nbsp; 1000 عدد : 24900 تومان</p>",
                                            "itemcode": "EXBR0055",
                                            "itemid": 297,
                                            "price": 276403000.00,
                                            "totalremained": 3,
                                            "itemcodes": [
                                                {
                                                    "Qty": 1000,
                                                    "Name": "  هالوژن 7 وات",
                                                    "Step": 50,
                                                    "Price": 276403,
                                                    "mainsku": "3502K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "3502",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "3500",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhObWxxY1RabmMyNWlPVGxxZERKemRtRmpOR3BpTVRsNVkzSmhhUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUVdsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWtoaGJHOW5aVzR1YW5Cbklqc2dabWxzWlc1aGJXVXFQVlZVUmkwNEp5ZElZV3h2WjJWdUxtcHdad1k3QmxRNkVXTnZiblJsYm5SZmRIbHdaVWtpRDJsdFlXZGxMMnB3WldjR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--dc56289d2f077873bc4b2d8528fbe33df7998fa7/Halogen.jpg"
                                        }
                                    ]
                                },
                                {
                                    "taxonid": 137,
                                    "parnetid": 125,
                                    "taxonname": "بسته اف پی ال ",
                                    "metadescription": "",
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": "بسته 3 کارتنیFPL",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhOSFU0ZERoeU9UVm9aSHB1Y1dJMU9YRnFPRFZ5TVhWclpYTjJiZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUVdsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWtad2JDMXRhVzR1YW5Cbklqc2dabWxzWlc1aGJXVXFQVlZVUmkwNEp5ZEdjR3d0YldsdUxtcHdad1k3QmxRNkVXTnZiblJsYm5SZmRIbHdaVWtpRDJsdFlXZGxMMnB3WldjR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--540ebfc393a87f00d7ba0ab68c3569d0e346a145/Fpl-min.jpg\", \"ItemCodes\": [{\"Qty\": 75, \"Name\": \"اف پی ال 18 وات \", \"Step\": 5, \"Price\": 702950, \"mainsku\": \"5502K3\", \"Variants\": [{\"Code\": \"5501\", \"Name\": \"یخی\", \"Step\": 5, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5502\", \"Name\": \"مهتابی\", \"Step\": 5, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5500\", \"Name\": \"آفتابی\", \"Step\": 5, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p>اف پی ال :&nbsp; 75 عدد : 54400تومان</p>",
                                            "itemcode": "EXBR0010",
                                            "itemid": 248,
                                            "price": 47430000.00,
                                            "totalremained": 46,
                                            "itemcodes": [
                                                {
                                                    "Qty": 75,
                                                    "Name": "اف پی ال 18 وات ",
                                                    "Step": 5,
                                                    "Price": 632400,
                                                    "mainsku": "5502K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5501",
                                                            "Name": "یخی",
                                                            "Step": 5,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5502",
                                                            "Name": "مهتابی",
                                                            "Step": 5,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhOSFU0ZERoeU9UVm9aSHB1Y1dJMU9YRnFPRFZ5TVhWclpYTjJiZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUVdsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWtad2JDMXRhVzR1YW5Cbklqc2dabWxzWlc1aGJXVXFQVlZVUmkwNEp5ZEdjR3d0YldsdUxtcHdad1k3QmxRNkVXTnZiblJsYm5SZmRIbHdaVWtpRDJsdFlXZGxMMnB3WldjR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--540ebfc393a87f00d7ba0ab68c3569d0e346a145/Fpl-min.jpg"
                                        },
                                        {
                                            "Position": 2,
                                            "itemname": "بسته 5 کارتنیFPL",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhOSFU0ZERoeU9UVm9aSHB1Y1dJMU9YRnFPRFZ5TVhWclpYTjJiZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUVdsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWtad2JDMXRhVzR1YW5Cbklqc2dabWxzWlc1aGJXVXFQVlZVUmkwNEp5ZEdjR3d0YldsdUxtcHdad1k3QmxRNkVXTnZiblJsYm5SZmRIbHdaVWtpRDJsdFlXZGxMMnB3WldjR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--540ebfc393a87f00d7ba0ab68c3569d0e346a145/Fpl-min.jpg\", \"ItemCodes\": [{\"Qty\": 125, \"Name\": \"اف پی ال 18 وات \", \"Step\": 5, \"Price\": 680750, \"mainsku\": \"5502K3\", \"Variants\": [{\"Code\": \"5501\", \"Name\": \"یخی\", \"Step\": 5, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5502\", \"Name\": \"مهتابی\", \"Step\": 5, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5500\", \"Name\": \"آفتابی\", \"Step\": 5, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p>اف پی ال :&nbsp; 125عدد : 52500 تومان</p>",
                                            "itemcode": "EXBR0011",
                                            "itemid": 249,
                                            "price": 76942000.00,
                                            "totalremained": 87,
                                            "itemcodes": [
                                                {
                                                    "Qty": 125,
                                                    "Name": "اف پی ال 18 وات ",
                                                    "Step": 5,
                                                    "Price": 615536,
                                                    "mainsku": "5502K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5501",
                                                            "Name": "یخی",
                                                            "Step": 5,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5502",
                                                            "Name": "مهتابی",
                                                            "Step": 5,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhOSFU0ZERoeU9UVm9aSHB1Y1dJMU9YRnFPRFZ5TVhWclpYTjJiZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUVdsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWtad2JDMXRhVzR1YW5Cbklqc2dabWxzWlc1aGJXVXFQVlZVUmkwNEp5ZEdjR3d0YldsdUxtcHdad1k3QmxRNkVXTnZiblJsYm5SZmRIbHdaVWtpRDJsdFlXZGxMMnB3WldjR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--540ebfc393a87f00d7ba0ab68c3569d0e346a145/Fpl-min.jpg"
                                        },
                                        {
                                            "Position": 3,
                                            "itemname": "بسته 10 تایی FPL",
                                            "metadescription": "",
                                            "description": "",
                                            "itemcode": "EXBR0012",
                                            "itemid": 250,
                                            "price": 149668000.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 250,
                                                    "Name": "اف پی ال 18 وات ",
                                                    "Step": 5,
                                                    "Price": 598672,
                                                    "mainsku": "5502K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5501",
                                                            "Name": "یخی",
                                                            "Step": 5,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5502",
                                                            "Name": "مهتابی",
                                                            "Step": 5,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhOSFU0ZERoeU9UVm9aSHB1Y1dJMU9YRnFPRFZ5TVhWclpYTjJiZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUVdsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWtad2JDMXRhVzR1YW5Cbklqc2dabWxzWlc1aGJXVXFQVlZVUmkwNEp5ZEdjR3d0YldsdUxtcHdad1k3QmxRNkVXTnZiblJsYm5SZmRIbHdaVWtpRDJsdFlXZGxMMnB3WldjR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--540ebfc393a87f00d7ba0ab68c3569d0e346a145/Fpl-min.jpg"
                                        }
                                    ]
                                },
                                {
                                    "taxonid": 132,
                                    "parnetid": 125,
                                    "taxonname": "بسته های لامپ 7 وات",
                                    "metadescription": "",
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": "بسته 7 وات 3 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhhbUowYkdKMU9IcGxiV3AxYmpVemJIbDNPWEIxYUhjME9IWnFaZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpTjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpkM0xtcHdaeUk3SUdacGJHVnVZVzFsS2oxVlZFWXRPQ2NuTjNjdWFuQm5CanNHVkRvUlkyOXVkR1Z1ZEY5MGVYQmxTU0lQYVcxaFoyVXZhbkJsWndZN0JsUTZFWE5sY25acFkyVmZibUZ0WlRvS2JHOWpZV3c9IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--e1b398d6a5192ee4e3a52494ac8cc3486456c3a9/7w.jpg\", \"ItemCodes\": [{\"Qty\": 300, \"Name\": \"  لامپ 7 وات\", \"Step\": 50, \"Price\": 197440, \"mainsku\": \"2372K3\", \"Variants\": [{\"Code\": \"2372\", \"Name\": \"مهتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"2370\", \"Name\": \"آفتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "",
                                            "itemcode": "EXBR0030",
                                            "itemid": 268,
                                            "price": 53741250.00,
                                            "totalremained": 46,
                                            "itemcodes": [
                                                {
                                                    "Qty": 300,
                                                    "Name": "  لامپ 7 وات",
                                                    "Step": 50,
                                                    "Price": 179138,
                                                    "mainsku": "2372K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "2372",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "2370",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhhbUowYkdKMU9IcGxiV3AxYmpVemJIbDNPWEIxYUhjME9IWnFaZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpTjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpkM0xtcHdaeUk3SUdacGJHVnVZVzFsS2oxVlZFWXRPQ2NuTjNjdWFuQm5CanNHVkRvUlkyOXVkR1Z1ZEY5MGVYQmxTU0lQYVcxaFoyVXZhbkJsWndZN0JsUTZFWE5sY25acFkyVmZibUZ0WlRvS2JHOWpZV3c9IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--e1b398d6a5192ee4e3a52494ac8cc3486456c3a9/7w.jpg"
                                        },
                                        {
                                            "Position": 2,
                                            "itemname": "بسته  7 وات 5 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhhbUowYkdKMU9IcGxiV3AxYmpVemJIbDNPWEIxYUhjME9IWnFaZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpTjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpkM0xtcHdaeUk3SUdacGJHVnVZVzFsS2oxVlZFWXRPQ2NuTjNjdWFuQm5CanNHVkRvUlkyOXVkR1Z1ZEY5MGVYQmxTU0lQYVcxaFoyVXZhbkJsWndZN0JsUTZFWE5sY25acFkyVmZibUZ0WlRvS2JHOWpZV3c9IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--e1b398d6a5192ee4e3a52494ac8cc3486456c3a9/7w.jpg\", \"ItemCodes\": [{\"Qty\": 500, \"Name\": \"  لامپ 7 وات\", \"Step\": 50, \"Price\": 191210, \"mainsku\": \"2372K3\", \"Variants\": [{\"Code\": \"2372\", \"Name\": \"مهتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"2370\", \"Name\": \"آفتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p style=\"text-align: right;\">لامپ 7 وات: 500عدد: 14400تومان</p>",
                                            "itemcode": "EXBR0031",
                                            "itemid": 269,
                                            "price": 87180250.00,
                                            "totalremained": 18,
                                            "itemcodes": [
                                                {
                                                    "Qty": 500,
                                                    "Name": "  لامپ 7 وات",
                                                    "Step": 50,
                                                    "Price": 174361,
                                                    "mainsku": "2372K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "2372",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "2370",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhhbUowYkdKMU9IcGxiV3AxYmpVemJIbDNPWEIxYUhjME9IWnFaZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpTjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpkM0xtcHdaeUk3SUdacGJHVnVZVzFsS2oxVlZFWXRPQ2NuTjNjdWFuQm5CanNHVkRvUlkyOXVkR1Z1ZEY5MGVYQmxTU0lQYVcxaFoyVXZhbkJsWndZN0JsUTZFWE5sY25acFkyVmZibUZ0WlRvS2JHOWpZV3c9IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--e1b398d6a5192ee4e3a52494ac8cc3486456c3a9/7w.jpg"
                                        },
                                        {
                                            "Position": 3,
                                            "itemname": "بسته  7 وات 10 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhhbUowYkdKMU9IcGxiV3AxYmpVemJIbDNPWEIxYUhjME9IWnFaZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpTjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpkM0xtcHdaeUk3SUdacGJHVnVZVzFsS2oxVlZFWXRPQ2NuTjNjdWFuQm5CanNHVkRvUlkyOXVkR1Z1ZEY5MGVYQmxTU0lQYVcxaFoyVXZhbkJsWndZN0JsUTZFWE5sY25acFkyVmZibUZ0WlRvS2JHOWpZV3c9IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--e1b398d6a5192ee4e3a52494ac8cc3486456c3a9/7w.jpg\", \"ItemCodes\": [{\"Qty\": 1000, \"Name\": \"  لامپ 7 وات\", \"Step\": 50, \"Price\": 180820, \"mainsku\": \"2372K3\", \"Variants\": [{\"Code\": \"2372\", \"Name\": \"مهتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"2370\", \"Name\": \"آفتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p style=\"text-align: right;\">لامپ 7 وات: 1000عدد: 13400تومان</p>",
                                            "itemcode": "EXBR0032",
                                            "itemid": 270,
                                            "price": 169583500.00,
                                            "totalremained": 25,
                                            "itemcodes": [
                                                {
                                                    "Qty": 1000,
                                                    "Name": "  لامپ 7 وات",
                                                    "Step": 50,
                                                    "Price": 169584,
                                                    "mainsku": "2372K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "2372",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "2370",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhhbUowYkdKMU9IcGxiV3AxYmpVemJIbDNPWEIxYUhjME9IWnFaZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpTjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpkM0xtcHdaeUk3SUdacGJHVnVZVzFsS2oxVlZFWXRPQ2NuTjNjdWFuQm5CanNHVkRvUlkyOXVkR1Z1ZEY5MGVYQmxTU0lQYVcxaFoyVXZhbkJsWndZN0JsUTZFWE5sY25acFkyVmZibUZ0WlRvS2JHOWpZV3c9IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--e1b398d6a5192ee4e3a52494ac8cc3486456c3a9/7w.jpg"
                                        }
                                    ]
                                },
                                {
                                    "taxonid": 123,
                                    "parnetid": 125,
                                    "taxonname": "بسته های 10 وات",
                                    "metadescription": "",
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": "بسته 10 وات 3 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhlR0ZxTXpZMWNqRnVNbnAzYlhNNWVXVnliMmwzWW0xbWJuaGtNUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUzJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFd2R5MWlkV3hpTFcxcGJpNXdibWNpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSnpFd2R5MWlkV3hpTFcxcGJpNXdibWNHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc1cGJXRm5aUzl3Ym1jR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--d2d446153f9cec908af604250416e387bb5e1c1d/10w-bulb-min.png\", \"ItemCodes\": [{\"Qty\": 300, \"Name\": \"   لامپ 10 وات\", \"Step\": 50, \"Price\": 216190, \"mainsku\": \"5322K3\", \"Variants\": [{\"Code\": \"5322\", \"Name\": \"مهتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5320\", \"Name\": \"آفتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p style=\"text-align: right;\">لامپ 10وات: 300عدد: 16800 تومان</p>",
                                            "itemcode": "EXBR0001",
                                            "itemid": 239,
                                            "price": 58713750.00,
                                            "totalremained": 127,
                                            "itemcodes": [
                                                {
                                                    "Qty": 300,
                                                    "Name": "   لامپ 10 وات",
                                                    "Step": 50,
                                                    "Price": 195713,
                                                    "mainsku": "5322K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5322",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5320",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhlR0ZxTXpZMWNqRnVNbnAzYlhNNWVXVnliMmwzWW0xbWJuaGtNUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUzJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFd2R5MWlkV3hpTFcxcGJpNXdibWNpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSnpFd2R5MWlkV3hpTFcxcGJpNXdibWNHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc1cGJXRm5aUzl3Ym1jR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--d2d446153f9cec908af604250416e387bb5e1c1d/10w-bulb-min.png"
                                        },
                                        {
                                            "Position": 2,
                                            "itemname": "بسته 10 وات 5 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhlR0ZxTXpZMWNqRnVNbnAzYlhNNWVXVnliMmwzWW0xbWJuaGtNUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUzJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFd2R5MWlkV3hpTFcxcGJpNXdibWNpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSnpFd2R5MWlkV3hpTFcxcGJpNXdibWNHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc1cGJXRm5aUzl3Ym1jR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--d2d446153f9cec908af604250416e387bb5e1c1d/10w-bulb-min.png\", \"ItemCodes\": [{\"Qty\": 500, \"Name\": \"   لامپ 10 وات\", \"Step\": 50, \"Price\": 209370, \"mainsku\": \"5322K3\", \"Variants\": [{\"Code\": \"5322\", \"Name\": \"مهتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5320\", \"Name\": \"آفتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p style=\"text-align: right;\">لامپ 10وات: 500عدد: 16400تومان</p>",
                                            "itemcode": "EXBR0002",
                                            "itemid": 240,
                                            "price": 95246750.00,
                                            "totalremained": 68,
                                            "itemcodes": [
                                                {
                                                    "Qty": 500,
                                                    "Name": "   لامپ 10 وات",
                                                    "Step": 50,
                                                    "Price": 190494,
                                                    "mainsku": "5322K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5322",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5320",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhlR0ZxTXpZMWNqRnVNbnAzYlhNNWVXVnliMmwzWW0xbWJuaGtNUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUzJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFd2R5MWlkV3hpTFcxcGJpNXdibWNpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSnpFd2R5MWlkV3hpTFcxcGJpNXdibWNHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc1cGJXRm5aUzl3Ym1jR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--d2d446153f9cec908af604250416e387bb5e1c1d/10w-bulb-min.png"
                                        },
                                        {
                                            "Position": 3,
                                            "itemname": "بسته 10 وات 10 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhlR0ZxTXpZMWNqRnVNbnAzYlhNNWVXVnliMmwzWW0xbWJuaGtNUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUzJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFd2R5MWlkV3hpTFcxcGJpNXdibWNpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSnpFd2R5MWlkV3hpTFcxcGJpNXdibWNHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc1cGJXRm5aUzl3Ym1jR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--d2d446153f9cec908af604250416e387bb5e1c1d/10w-bulb-min.png\", \"ItemCodes\": [{\"Qty\": 1000, \"Name\": \"   لامپ 10 وات\", \"Step\": 50, \"Price\": 197990, \"mainsku\": \"5322K3\", \"Variants\": [{\"Code\": \"5322\", \"Name\": \"مهتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5320\", \"Name\": \"آفتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "",
                                            "itemcode": "EXBR0003",
                                            "itemid": 241,
                                            "price": 185274500.00,
                                            "totalremained": 133,
                                            "itemcodes": [
                                                {
                                                    "Qty": 1000,
                                                    "Name": "   لامپ 10 وات",
                                                    "Step": 50,
                                                    "Price": 185275,
                                                    "mainsku": "5322K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5322",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5320",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhlR0ZxTXpZMWNqRnVNbnAzYlhNNWVXVnliMmwzWW0xbWJuaGtNUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUzJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFd2R5MWlkV3hpTFcxcGJpNXdibWNpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSnpFd2R5MWlkV3hpTFcxcGJpNXdibWNHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc1cGJXRm5aUzl3Ym1jR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--d2d446153f9cec908af604250416e387bb5e1c1d/10w-bulb-min.png"
                                        }
                                    ]
                                },
                                {
                                    "taxonid": 138,
                                    "parnetid": 125,
                                    "taxonname": "بسته لامپ رنگی ",
                                    "metadescription": null,
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": "بسته لامپ رنگی 3 کارتنی",
                                            "metadescription": "{\"Qty\": 300, \"Step\": 50, \"Price\": 231235, \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhORGh0YzNGcmJXSTBjVE52WTNSck9EbGxjamM0TlhabWRHRjNOQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpQWF0cGJteHBibVU3SUdacGJHVnVZVzFsUFNJbE0wWWxNMFlsTTBZbE0wWWdKVE5HSlROR0pUTkdKVE5HTFNVelJpVXpSaVV6UmkwbE0wWWxNMFl1Y0c1bklqc2dabWxzWlc1aGJXVXFQVlZVUmkwNEp5Y2xSRGtsT0RRbFJEZ2xRVGNsUkRrbE9EVWxSRGtsUWtVbE1qQWxSRGdsUWpFbFJEa2xPRFlsUkVFbFFVWWxSRUlsT0VNdEpVUTRKVUl5SlVRNEpVSXhKVVE0SlVGR0xTVkVPQ1ZCUVNWRVFTVkJPUzV3Ym1jR093WlVPaEZqYjI1MFpXNTBYM1I1Y0dWSklnNXBiV0ZuWlM5d2JtY0dPd1pVT2hGelpYSjJhV05sWDI1aGJXVTZDbXh2WTJGcyIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9rZXkifX0=--179b162c7f4514ca51ed90e6288d05e1ffe31754/%D9%84%D8%A7%D9%85%D9%BE%20%D8%B1%D9%86%DA%AF%DB%8C-%D8%B2%D8%B1%D8%AF-%D8%AA%DA%A9.png\", \"ItemCodes\": [{\"Qty\": 300, \"Name\": \"  لامپ رنگی 9وات\", \"Step\": 50, \"Price\": 240480, \"mainsku\": \"5943K3\", \"Variants\": [{\"Code\": \"5943\", \"Name\": \"زرد\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5944\", \"Name\": \"نارنجی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5945\", \"Name\": \"قرمز\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5946\", \"Name\": \"سبز\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5947\", \"Name\": \"آبی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p style=\"text-align: right;\">لامپ رنگی : عدد300 : 18500 تومان</p>",
                                            "itemcode": "EXBR0113",
                                            "itemid": 358,
                                            "price": 65407500.00,
                                            "totalremained": 25,
                                            "itemcodes": [
                                                {
                                                    "Qty": 300,
                                                    "Name": "  لامپ رنگی 9وات",
                                                    "Step": 50,
                                                    "Price": 218025,
                                                    "mainsku": "5943K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5943",
                                                            "Name": "زرد",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5944",
                                                            "Name": "نارنجی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5945",
                                                            "Name": "قرمز",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5946",
                                                            "Name": "سبز",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5947",
                                                            "Name": "آبی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhORGh0YzNGcmJXSTBjVE52WTNSck9EbGxjamM0TlhabWRHRjNOQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpQWF0cGJteHBibVU3SUdacGJHVnVZVzFsUFNJbE0wWWxNMFlsTTBZbE0wWWdKVE5HSlROR0pUTkdKVE5HTFNVelJpVXpSaVV6UmkwbE0wWWxNMFl1Y0c1bklqc2dabWxzWlc1aGJXVXFQVlZVUmkwNEp5Y2xSRGtsT0RRbFJEZ2xRVGNsUkRrbE9EVWxSRGtsUWtVbE1qQWxSRGdsUWpFbFJEa2xPRFlsUkVFbFFVWWxSRUlsT0VNdEpVUTRKVUl5SlVRNEpVSXhKVVE0SlVGR0xTVkVPQ1ZCUVNWRVFTVkJPUzV3Ym1jR093WlVPaEZqYjI1MFpXNTBYM1I1Y0dWSklnNXBiV0ZuWlM5d2JtY0dPd1pVT2hGelpYSjJhV05sWDI1aGJXVTZDbXh2WTJGcyIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9rZXkifX0=--179b162c7f4514ca51ed90e6288d05e1ffe31754/%D9%84%D8%A7%D9%85%D9%BE%20%D8%B1%D9%86%DA%AF%DB%8C-%D8%B2%D8%B1%D8%AF-%D8%AA%DA%A9.png"
                                        },
                                        {
                                            "Position": 2,
                                            "itemname": "بسته لامپ رنگی 5 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhORGh0YzNGcmJXSTBjVE52WTNSck9EbGxjamM0TlhabWRHRjNOQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpQWF0cGJteHBibVU3SUdacGJHVnVZVzFsUFNJbE0wWWxNMFlsTTBZbE0wWWdKVE5HSlROR0pUTkdKVE5HTFNVelJpVXpSaVV6UmkwbE0wWWxNMFl1Y0c1bklqc2dabWxzWlc1aGJXVXFQVlZVUmkwNEp5Y2xSRGtsT0RRbFJEZ2xRVGNsUkRrbE9EVWxSRGtsUWtVbE1qQWxSRGdsUWpFbFJEa2xPRFlsUkVFbFFVWWxSRUlsT0VNdEpVUTRKVUl5SlVRNEpVSXhKVVE0SlVGR0xTVkVPQ1ZCUVNWRVFTVkJPUzV3Ym1jR093WlVPaEZqYjI1MFpXNTBYM1I1Y0dWSklnNXBiV0ZuWlM5d2JtY0dPd1pVT2hGelpYSjJhV05sWDI1aGJXVTZDbXh2WTJGcyIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9rZXkifX0=--179b162c7f4514ca51ed90e6288d05e1ffe31754/%D9%84%D8%A7%D9%85%D9%BE%20%D8%B1%D9%86%DA%AF%DB%8C-%D8%B2%D8%B1%D8%AF-%D8%AA%DA%A9.png\", \"ItemCodes\": [{\"Qty\": 500, \"Name\": \"  لامپ رنگی 9وات\", \"Step\": 50, \"Price\": 232890, \"mainsku\": \"5943K3\", \"Variants\": [{\"Code\": \"5943\", \"Name\": \"زرد\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5944\", \"Name\": \"نارنجی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5945\", \"Name\": \"قرمز\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5946\", \"Name\": \"سبز\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5947\", \"Name\": \"آبی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p style=\"text-align: right;\">لامپ رنگی : عدد500 : 17500 تومان</p>",
                                            "itemcode": "EXBR0114",
                                            "itemid": 359,
                                            "price": 106105500.00,
                                            "totalremained": 19,
                                            "itemcodes": [
                                                {
                                                    "Qty": 500,
                                                    "Name": "  لامپ رنگی 9وات",
                                                    "Step": 50,
                                                    "Price": 212211,
                                                    "mainsku": "5943K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5943",
                                                            "Name": "زرد",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5944",
                                                            "Name": "نارنجی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5945",
                                                            "Name": "قرمز",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5946",
                                                            "Name": "سبز",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5947",
                                                            "Name": "آبی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhORGh0YzNGcmJXSTBjVE52WTNSck9EbGxjamM0TlhabWRHRjNOQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpQWF0cGJteHBibVU3SUdacGJHVnVZVzFsUFNJbE0wWWxNMFlsTTBZbE0wWWdKVE5HSlROR0pUTkdKVE5HTFNVelJpVXpSaVV6UmkwbE0wWWxNMFl1Y0c1bklqc2dabWxzWlc1aGJXVXFQVlZVUmkwNEp5Y2xSRGtsT0RRbFJEZ2xRVGNsUkRrbE9EVWxSRGtsUWtVbE1qQWxSRGdsUWpFbFJEa2xPRFlsUkVFbFFVWWxSRUlsT0VNdEpVUTRKVUl5SlVRNEpVSXhKVVE0SlVGR0xTVkVPQ1ZCUVNWRVFTVkJPUzV3Ym1jR093WlVPaEZqYjI1MFpXNTBYM1I1Y0dWSklnNXBiV0ZuWlM5d2JtY0dPd1pVT2hGelpYSjJhV05sWDI1aGJXVTZDbXh2WTJGcyIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9rZXkifX0=--179b162c7f4514ca51ed90e6288d05e1ffe31754/%D9%84%D8%A7%D9%85%D9%BE%20%D8%B1%D9%86%DA%AF%DB%8C-%D8%B2%D8%B1%D8%AF-%D8%AA%DA%A9.png"
                                        },
                                        {
                                            "Position": 3,
                                            "itemname": "بسته لامپ رنگی 10 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhORGh0YzNGcmJXSTBjVE52WTNSck9EbGxjamM0TlhabWRHRjNOQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpQWF0cGJteHBibVU3SUdacGJHVnVZVzFsUFNJbE0wWWxNMFlsTTBZbE0wWWdKVE5HSlROR0pUTkdKVE5HTFNVelJpVXpSaVV6UmkwbE0wWWxNMFl1Y0c1bklqc2dabWxzWlc1aGJXVXFQVlZVUmkwNEp5Y2xSRGtsT0RRbFJEZ2xRVGNsUkRrbE9EVWxSRGtsUWtVbE1qQWxSRGdsUWpFbFJEa2xPRFlsUkVFbFFVWWxSRUlsT0VNdEpVUTRKVUl5SlVRNEpVSXhKVVE0SlVGR0xTVkVPQ1ZCUVNWRVFTVkJPUzV3Ym1jR093WlVPaEZqYjI1MFpXNTBYM1I1Y0dWSklnNXBiV0ZuWlM5d2JtY0dPd1pVT2hGelpYSjJhV05sWDI1aGJXVTZDbXh2WTJGcyIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9rZXkifX0=--179b162c7f4514ca51ed90e6288d05e1ffe31754/%D9%84%D8%A7%D9%85%D9%BE%20%D8%B1%D9%86%DA%AF%DB%8C-%D8%B2%D8%B1%D8%AF-%D8%AA%DA%A9.png\", \"ItemCodes\": [{\"Qty\": 1000, \"Name\": \"  لامپ رنگی 9وات\", \"Step\": 50, \"Price\": 220230, \"mainsku\": \"5943K3\", \"Variants\": [{\"Code\": \"5943\", \"Name\": \"زرد\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5944\", \"Name\": \"نارنجی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5945\", \"Name\": \"قرمز\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5946\", \"Name\": \"سبز\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5947\", \"Name\": \"آبی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p style=\"text-align: right;\">لامپ رنگی : عدد1000 : 16500 تومان</p>",
                                            "itemcode": "EXBR0115",
                                            "itemid": 360,
                                            "price": 206397000.00,
                                            "totalremained": 2,
                                            "itemcodes": [
                                                {
                                                    "Qty": 1000,
                                                    "Name": "  لامپ رنگی 9وات",
                                                    "Step": 50,
                                                    "Price": 2063970,
                                                    "mainsku": "5943K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5943",
                                                            "Name": "زرد",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5944",
                                                            "Name": "نارنجی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5945",
                                                            "Name": "قرمز",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5946",
                                                            "Name": "سبز",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5947",
                                                            "Name": "آبی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhORGh0YzNGcmJXSTBjVE52WTNSck9EbGxjamM0TlhabWRHRjNOQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpQWF0cGJteHBibVU3SUdacGJHVnVZVzFsUFNJbE0wWWxNMFlsTTBZbE0wWWdKVE5HSlROR0pUTkdKVE5HTFNVelJpVXpSaVV6UmkwbE0wWWxNMFl1Y0c1bklqc2dabWxzWlc1aGJXVXFQVlZVUmkwNEp5Y2xSRGtsT0RRbFJEZ2xRVGNsUkRrbE9EVWxSRGtsUWtVbE1qQWxSRGdsUWpFbFJEa2xPRFlsUkVFbFFVWWxSRUlsT0VNdEpVUTRKVUl5SlVRNEpVSXhKVVE0SlVGR0xTVkVPQ1ZCUVNWRVFTVkJPUzV3Ym1jR093WlVPaEZqYjI1MFpXNTBYM1I1Y0dWSklnNXBiV0ZuWlM5d2JtY0dPd1pVT2hGelpYSjJhV05sWDI1aGJXVTZDbXh2WTJGcyIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9rZXkifX0=--179b162c7f4514ca51ed90e6288d05e1ffe31754/%D9%84%D8%A7%D9%85%D9%BE%20%D8%B1%D9%86%DA%AF%DB%8C-%D8%B2%D8%B1%D8%AF-%D8%AA%DA%A9.png"
                                        }
                                    ]
                                },
                                {
                                    "taxonid": 126,
                                    "parnetid": 125,
                                    "taxonname": "بسته لامپ 15 وات ",
                                    "metadescription": null,
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": "بسته 15 وات 3 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhjbTExZEhCMmFXWmhkWGhoZHpGek1tSnllV1J1WVhSMmNEZzNkUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpTjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFMUxtcHdaeUk3SUdacGJHVnVZVzFsS2oxVlZFWXRPQ2NuTVRVdWFuQm5CanNHVkRvUlkyOXVkR1Z1ZEY5MGVYQmxTU0lQYVcxaFoyVXZhbkJsWndZN0JsUTZFWE5sY25acFkyVmZibUZ0WlRvS2JHOWpZV3c9IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--75e914b94cefd5751128f1c1de8691d81183d228/15.jpg\", \"ItemCodes\": [{\"Qty\": 150, \"Name\": \"  لامپ 15 وات\", \"Step\": 25, \"Price\": 443210, \"mainsku\": \"5332K3\", \"Variants\": [{\"Code\": \"5332\", \"Name\": \"مهتابی\", \"Step\": 25, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5330\", \"Name\": \"آفتابی\", \"Step\": 25, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p>لامپ 15وات: 150عدد: 33300تومان</p>",
                                            "itemcode": "EXBR0022",
                                            "itemid": 260,
                                            "price": 59670000.00,
                                            "totalremained": 35,
                                            "itemcodes": [
                                                {
                                                    "Qty": 150,
                                                    "Name": "  لامپ 15 وات",
                                                    "Step": 25,
                                                    "Price": 397800,
                                                    "mainsku": "5332K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5332",
                                                            "Name": "مهتابی",
                                                            "Step": 25,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5330",
                                                            "Name": "آفتابی",
                                                            "Step": 25,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhjbTExZEhCMmFXWmhkWGhoZHpGek1tSnllV1J1WVhSMmNEZzNkUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpTjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFMUxtcHdaeUk3SUdacGJHVnVZVzFsS2oxVlZFWXRPQ2NuTVRVdWFuQm5CanNHVkRvUlkyOXVkR1Z1ZEY5MGVYQmxTU0lQYVcxaFoyVXZhbkJsWndZN0JsUTZFWE5sY25acFkyVmZibUZ0WlRvS2JHOWpZV3c9IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--75e914b94cefd5751128f1c1de8691d81183d228/15.jpg"
                                        },
                                        {
                                            "Position": 2,
                                            "itemname": "بسته 15 وات 5 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhjbTExZEhCMmFXWmhkWGhoZHpGek1tSnllV1J1WVhSMmNEZzNkUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpTjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFMUxtcHdaeUk3SUdacGJHVnVZVzFsS2oxVlZFWXRPQ2NuTVRVdWFuQm5CanNHVkRvUlkyOXVkR1Z1ZEY5MGVYQmxTU0lQYVcxaFoyVXZhbkJsWndZN0JsUTZFWE5sY25acFkyVmZibUZ0WlRvS2JHOWpZV3c9IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--75e914b94cefd5751128f1c1de8691d81183d228/15.jpg\", \"ItemCodes\": [{\"Qty\": 250, \"Name\": \"  لامپ 15 وات\", \"Step\": 25, \"Price\": 429220, \"mainsku\": \"5332K3\", \"Variants\": [{\"Code\": \"5332\", \"Name\": \"مهتابی\", \"Step\": 25, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5330\", \"Name\": \"آفتابی\", \"Step\": 25, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p>لامپ 15وات: 250عدد: 32900تومان</p>",
                                            "itemcode": "EXBR0023",
                                            "itemid": 261,
                                            "price": 96798000.00,
                                            "totalremained": 14,
                                            "itemcodes": [
                                                {
                                                    "Qty": 250,
                                                    "Name": "  لامپ 15 وات",
                                                    "Step": 25,
                                                    "Price": 387192,
                                                    "mainsku": "5332K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5332",
                                                            "Name": "مهتابی",
                                                            "Step": 25,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5330",
                                                            "Name": "آفتابی",
                                                            "Step": 25,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhjbTExZEhCMmFXWmhkWGhoZHpGek1tSnllV1J1WVhSMmNEZzNkUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpTjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFMUxtcHdaeUk3SUdacGJHVnVZVzFsS2oxVlZFWXRPQ2NuTVRVdWFuQm5CanNHVkRvUlkyOXVkR1Z1ZEY5MGVYQmxTU0lQYVcxaFoyVXZhbkJsWndZN0JsUTZFWE5sY25acFkyVmZibUZ0WlRvS2JHOWpZV3c9IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--75e914b94cefd5751128f1c1de8691d81183d228/15.jpg"
                                        },
                                        {
                                            "Position": 3,
                                            "itemname": "بسته 15 وات 10 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhjbTExZEhCMmFXWmhkWGhoZHpGek1tSnllV1J1WVhSMmNEZzNkUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpTjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFMUxtcHdaeUk3SUdacGJHVnVZVzFsS2oxVlZFWXRPQ2NuTVRVdWFuQm5CanNHVkRvUlkyOXVkR1Z1ZEY5MGVYQmxTU0lQYVcxaFoyVXZhbkJsWndZN0JsUTZFWE5sY25acFkyVmZibUZ0WlRvS2JHOWpZV3c9IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--75e914b94cefd5751128f1c1de8691d81183d228/15.jpg\", \"ItemCodes\": [{\"Qty\": 500, \"Name\": \"  لامپ 15 وات\", \"Step\": 25, \"Price\": 405890, \"mainsku\": \"5332K3\", \"Variants\": [{\"Code\": \"5332\", \"Name\": \"مهتابی\", \"Step\": 25, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5330\", \"Name\": \"آفتابی\", \"Step\": 25, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p>لامپ 15وات: 500عدد: 31900تومان</p>",
                                            "itemcode": "EXBR0024",
                                            "itemid": 262,
                                            "price": 188292000.00,
                                            "totalremained": 14,
                                            "itemcodes": [
                                                {
                                                    "Qty": 500,
                                                    "Name": "  لامپ 15 وات",
                                                    "Step": 25,
                                                    "Price": 376584,
                                                    "mainsku": "5332K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5332",
                                                            "Name": "مهتابی",
                                                            "Step": 25,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5330",
                                                            "Name": "آفتابی",
                                                            "Step": 25,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhjbTExZEhCMmFXWmhkWGhoZHpGek1tSnllV1J1WVhSMmNEZzNkUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpTjJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFMUxtcHdaeUk3SUdacGJHVnVZVzFsS2oxVlZFWXRPQ2NuTVRVdWFuQm5CanNHVkRvUlkyOXVkR1Z1ZEY5MGVYQmxTU0lQYVcxaFoyVXZhbkJsWndZN0JsUTZFWE5sY25acFkyVmZibUZ0WlRvS2JHOWpZV3c9IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--75e914b94cefd5751128f1c1de8691d81183d228/15.jpg"
                                        }
                                    ]
                                },
                                {
                                    "taxonid": 127,
                                    "parnetid": 125,
                                    "taxonname": "بسته های لامپ 20 وات ",
                                    "metadescription": null,
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": "بسته 20 وات 3 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhialZ6Tldwa01XUTNjWEZ4TTNKdlptazRjM0poZG01aWJuWm1hd1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpU1dsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpJd0xXSjFiR0l0YldsdUxuQnVaeUk3SUdacGJHVnVZVzFsS2oxVlZFWXRPQ2NuTWpBdFluVnNZaTF0YVc0dWNHNW5CanNHVkRvUlkyOXVkR1Z1ZEY5MGVYQmxTU0lPYVcxaFoyVXZjRzVuQmpzR1ZEb1JjMlZ5ZG1salpWOXVZVzFsT2dwc2IyTmhiQT09IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--224ca244c89b2323d75ebb75b09e45278d1d13d3/20-bulb-min.png\", \"ItemCodes\": [{\"Qty\": 150, \"Name\": \"  لامپ 20 وات\", \"Step\": 25, \"Price\": 703300, \"mainsku\": \"5352K3\", \"Variants\": [{\"Code\": \"5352\", \"Name\": \"مهتابی\", \"Step\": 25, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5350\", \"Name\": \"آفتابی\", \"Step\": 25, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p>لامپ 20وات: 150عدد: 52500تومان</p>",
                                            "itemcode": "EXBR0026",
                                            "itemid": 264,
                                            "price": 95051250.00,
                                            "totalremained": 38,
                                            "itemcodes": [
                                                {
                                                    "Qty": 150,
                                                    "Name": "  لامپ 20 وات",
                                                    "Step": 25,
                                                    "Price": 633675,
                                                    "mainsku": "5352K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5352",
                                                            "Name": "مهتابی",
                                                            "Step": 25,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhialZ6Tldwa01XUTNjWEZ4TTNKdlptazRjM0poZG01aWJuWm1hd1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpU1dsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpJd0xXSjFiR0l0YldsdUxuQnVaeUk3SUdacGJHVnVZVzFsS2oxVlZFWXRPQ2NuTWpBdFluVnNZaTF0YVc0dWNHNW5CanNHVkRvUlkyOXVkR1Z1ZEY5MGVYQmxTU0lPYVcxaFoyVXZjRzVuQmpzR1ZEb1JjMlZ5ZG1salpWOXVZVzFsT2dwc2IyTmhiQT09IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--224ca244c89b2323d75ebb75b09e45278d1d13d3/20-bulb-min.png"
                                        },
                                        {
                                            "Position": 2,
                                            "itemname": "بسته 20 وات 5 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhialZ6Tldwa01XUTNjWEZ4TTNKdlptazRjM0poZG01aWJuWm1hd1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpU1dsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpJd0xXSjFiR0l0YldsdUxuQnVaeUk3SUdacGJHVnVZVzFsS2oxVlZFWXRPQ2NuTWpBdFluVnNZaTF0YVc0dWNHNW5CanNHVkRvUlkyOXVkR1Z1ZEY5MGVYQmxTU0lPYVcxaFoyVXZjRzVuQmpzR1ZEb1JjMlZ5ZG1salpWOXVZVzFsT2dwc2IyTmhiQT09IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--224ca244c89b2323d75ebb75b09e45278d1d13d3/20-bulb-min.png\", \"ItemCodes\": [{\"Qty\": 250, \"Name\": \"  لامپ 20 وات\", \"Step\": 25, \"Price\": 681090, \"mainsku\": \"5352K3\", \"Variants\": [{\"Code\": \"5352\", \"Name\": \"مهتابی\", \"Step\": 25, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5350\", \"Name\": \"آفتابی\", \"Step\": 25, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p>لامپ 20وات: 250عدد: 51900تومان</p>",
                                            "itemcode": "EXBR0027",
                                            "itemid": 265,
                                            "price": 154194250.00,
                                            "totalremained": 15,
                                            "itemcodes": [
                                                {
                                                    "Qty": 250,
                                                    "Name": "  لامپ 20 وات",
                                                    "Step": 25,
                                                    "Price": 616777,
                                                    "mainsku": "5352K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5352",
                                                            "Name": "مهتابی",
                                                            "Step": 25,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhialZ6Tldwa01XUTNjWEZ4TTNKdlptazRjM0poZG01aWJuWm1hd1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpU1dsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpJd0xXSjFiR0l0YldsdUxuQnVaeUk3SUdacGJHVnVZVzFsS2oxVlZFWXRPQ2NuTWpBdFluVnNZaTF0YVc0dWNHNW5CanNHVkRvUlkyOXVkR1Z1ZEY5MGVYQmxTU0lPYVcxaFoyVXZjRzVuQmpzR1ZEb1JjMlZ5ZG1salpWOXVZVzFsT2dwc2IyTmhiQT09IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--224ca244c89b2323d75ebb75b09e45278d1d13d3/20-bulb-min.png"
                                        },
                                        {
                                            "Position": 3,
                                            "itemname": "بسته 20 وات 10 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhialZ6Tldwa01XUTNjWEZ4TTNKdlptazRjM0poZG01aWJuWm1hd1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpU1dsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpJd0xXSjFiR0l0YldsdUxuQnVaeUk3SUdacGJHVnVZVzFsS2oxVlZFWXRPQ2NuTWpBdFluVnNZaTF0YVc0dWNHNW5CanNHVkRvUlkyOXVkR1Z1ZEY5MGVYQmxTU0lPYVcxaFoyVXZjRzVuQmpzR1ZEb1JjMlZ5ZG1salpWOXVZVzFsT2dwc2IyTmhiQT09IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--224ca244c89b2323d75ebb75b09e45278d1d13d3/20-bulb-min.png\", \"ItemCodes\": [{\"Qty\": 500, \"Name\": \"  لامپ 20 وات\", \"Step\": 25, \"Price\": 644070, \"mainsku\": \"5352K3\", \"Variants\": [{\"Code\": \"5352\", \"Name\": \"مهتابی\", \"Step\": 25, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5350\", \"Name\": \"آفتابی\", \"Step\": 25, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p>لامپ 20وات: 500عدد: 50900تومان</p>",
                                            "itemcode": "EXBR0028",
                                            "itemid": 266,
                                            "price": 299939500.00,
                                            "totalremained": 15,
                                            "itemcodes": [
                                                {
                                                    "Qty": 500,
                                                    "Name": "  لامپ 20 وات",
                                                    "Step": 25,
                                                    "Price": 599879,
                                                    "mainsku": "5352K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5352",
                                                            "Name": "مهتابی",
                                                            "Step": 25,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhialZ6Tldwa01XUTNjWEZ4TTNKdlptazRjM0poZG01aWJuWm1hd1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpU1dsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpJd0xXSjFiR0l0YldsdUxuQnVaeUk3SUdacGJHVnVZVzFsS2oxVlZFWXRPQ2NuTWpBdFluVnNZaTF0YVc0dWNHNW5CanNHVkRvUlkyOXVkR1Z1ZEY5MGVYQmxTU0lPYVcxaFoyVXZjRzVuQmpzR1ZEb1JjMlZ5ZG1salpWOXVZVzFsT2dwc2IyTmhiQT09IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--224ca244c89b2323d75ebb75b09e45278d1d13d3/20-bulb-min.png"
                                        }
                                    ]
                                },
                                {
                                    "taxonid": 133,
                                    "parnetid": 125,
                                    "taxonname": "بسته های لامپ 12 وات",
                                    "metadescription": null,
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": "بسته 12 وات 3 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhkMmcwY0Rjd2FXbHFOSE54Wlc4M1ozTTFjbVprYTNGbFpIQTROd1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpTldsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWN4TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--51fb927d4838c1b1bbc967d47e53293f316b948f/1.jpg\", \"ItemCodes\": [{\"Qty\": 300, \"Name\": \"  لامپ 12 وات\", \"Step\": 50, \"Price\": 330480, \"mainsku\": \"5342K3\", \"Variants\": [{\"Code\": \"5342\", \"Name\": \"مهتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5340\", \"Name\": \"آفتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p>لامپ 12وات: 300عدد: 24200تومان</p>",
                                            "itemcode": "EXBR0018",
                                            "itemid": 256,
                                            "price": 89313750.00,
                                            "totalremained": 25,
                                            "itemcodes": [
                                                {
                                                    "Qty": 300,
                                                    "Name": "  لامپ 12 وات",
                                                    "Step": 50,
                                                    "Price": 297713,
                                                    "mainsku": "5342K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5342",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5340",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhkMmcwY0Rjd2FXbHFOSE54Wlc4M1ozTTFjbVprYTNGbFpIQTROd1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpTldsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWN4TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--51fb927d4838c1b1bbc967d47e53293f316b948f/1.jpg"
                                        },
                                        {
                                            "Position": 2,
                                            "itemname": "بسته 12 وات 5 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhkMmcwY0Rjd2FXbHFOSE54Wlc4M1ozTTFjbVprYTNGbFpIQTROd1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpTldsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWN4TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--51fb927d4838c1b1bbc967d47e53293f316b948f/1.jpg\", \"ItemCodes\": [{\"Qty\": 500, \"Name\": \"  لامپ 12 وات\", \"Step\": 50, \"Price\": 320040, \"mainsku\": \"5342K3\", \"Variants\": [{\"Code\": \"5342\", \"Name\": \"مهتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5340\", \"Name\": \"آفتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p>لامپ 12وات: 500عدد: 23900تومان</p>",
                                            "itemcode": "EXBR0019",
                                            "itemid": 257,
                                            "price": 144886750.00,
                                            "totalremained": 14,
                                            "itemcodes": [
                                                {
                                                    "Qty": 500,
                                                    "Name": "  لامپ 12 وات",
                                                    "Step": 50,
                                                    "Price": 289774,
                                                    "mainsku": "5342K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5342",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5340",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhkMmcwY0Rjd2FXbHFOSE54Wlc4M1ozTTFjbVprYTNGbFpIQTROd1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpTldsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWN4TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--51fb927d4838c1b1bbc967d47e53293f316b948f/1.jpg"
                                        },
                                        {
                                            "Position": 3,
                                            "itemname": "بسته 12 وات 10 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhkMmcwY0Rjd2FXbHFOSE54Wlc4M1ozTTFjbVprYTNGbFpIQTROd1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpTldsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWN4TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--51fb927d4838c1b1bbc967d47e53293f316b948f/1.jpg\", \"ItemCodes\": [{\"Qty\": 1000, \"Name\": \"  لامپ 12 وات\", \"Step\": 50, \"Price\": 302650, \"mainsku\": \"5342K3\", \"Variants\": [{\"Code\": \"5342\", \"Name\": \"مهتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"5340\", \"Name\": \"آفتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p style=\"text-align: right;\">لامپ 12وات: 1000عدد: 22900تومان</p>",
                                            "itemcode": "EXBR0020",
                                            "itemid": 258,
                                            "price": 281834500.00,
                                            "totalremained": 10,
                                            "itemcodes": [
                                                {
                                                    "Qty": 1000,
                                                    "Name": "  لامپ 12 وات",
                                                    "Step": 50,
                                                    "Price": 281835,
                                                    "mainsku": "5342K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5342",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5340",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhkMmcwY0Rjd2FXbHFOSE54Wlc4M1ozTTFjbVprYTNGbFpIQTROd1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpTldsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFdWFuQm5JanNnWm1sc1pXNWhiV1VxUFZWVVJpMDRKeWN4TG1wd1p3WTdCbFE2RVdOdmJuUmxiblJmZEhsd1pVa2lEMmx0WVdkbEwycHdaV2NHT3daVU9oRnpaWEoyYVdObFgyNWhiV1U2Q214dlkyRnMiLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--51fb927d4838c1b1bbc967d47e53293f316b948f/1.jpg"
                                        }
                                    ]
                                },
                                {
                                    "taxonid": 134,
                                    "parnetid": 125,
                                    "taxonname": "بسته های اشکی 6 وات",
                                    "metadescription": null,
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": "اشکی 6 وات سه کارتنی",
                                            "metadescription": "",
                                            "description": "",
                                            "itemcode": "shirazashki",
                                            "itemid": 455,
                                            "price": 70953750.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 300,
                                                    "Name": "اشکی 6 وات ",
                                                    "Step": 50,
                                                    "Price": 236513,
                                                    "mainsku": "1272",
                                                    "Variants": [
                                                        {
                                                            "Code": "1272",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "1270",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhlak0wYjNwbGFuQmllakF5Y1dsNlpEUndiWFZzWkRJeU5HRmlid1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVDJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW5Ob1lXMXBMV0oxYkdJdGJXbHVMbkJ1WnlJN0lHWnBiR1Z1WVcxbEtqMVZWRVl0T0NjbmMyaGhiV2t0WW5Wc1lpMXRhVzR1Y0c1bkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSU9hVzFoWjJVdmNHNW5CanNHVkRvUmMyVnlkbWxqWlY5dVlXMWxPZ3BzYjJOaGJBPT0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--b38ab1ffaa2f7c1bb5dc4a66fc3c067dc044def7/shami-bulb-min.png"
                                        },
                                        {
                                            "Position": 2,
                                            "itemname": "اشکی 6 وات پنج کارتنی",
                                            "metadescription": "",
                                            "description": "",
                                            "itemcode": "shirazashkii",
                                            "itemid": 456,
                                            "price": 115102750.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 500,
                                                    "Name": "اشکی 6 وات ",
                                                    "Step": 50,
                                                    "Price": 230206,
                                                    "mainsku": "1272",
                                                    "Variants": [
                                                        {
                                                            "Code": "1272",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "1270",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhlak0wYjNwbGFuQmllakF5Y1dsNlpEUndiWFZzWkRJeU5HRmlid1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVDJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW5Ob1lXMXBMV0oxYkdJdGJXbHVMbkJ1WnlJN0lHWnBiR1Z1WVcxbEtqMVZWRVl0T0NjbmMyaGhiV2t0WW5Wc1lpMXRhVzR1Y0c1bkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSU9hVzFoWjJVdmNHNW5CanNHVkRvUmMyVnlkbWxqWlY5dVlXMWxPZ3BzYjJOaGJBPT0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--b38ab1ffaa2f7c1bb5dc4a66fc3c067dc044def7/shami-bulb-min.png"
                                        },
                                        {
                                            "Position": 3,
                                            "itemname": "اشکی 6 وات ده کارتنی",
                                            "metadescription": "",
                                            "description": "",
                                            "itemcode": "shirazashhki",
                                            "itemid": 457,
                                            "price": 223898500.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 1000,
                                                    "Name": "اشکی 6 وات ",
                                                    "Step": 50,
                                                    "Price": 223899,
                                                    "mainsku": "1270",
                                                    "Variants": [
                                                        {
                                                            "Code": "1272",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "1270",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhlak0wYjNwbGFuQmllakF5Y1dsNlpEUndiWFZzWkRJeU5HRmlid1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVDJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW5Ob1lXMXBMV0oxYkdJdGJXbHVMbkJ1WnlJN0lHWnBiR1Z1WVcxbEtqMVZWRVl0T0NjbmMyaGhiV2t0WW5Wc1lpMXRhVzR1Y0c1bkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSU9hVzFoWjJVdmNHNW5CanNHVkRvUmMyVnlkbWxqWlY5dVlXMWxPZ3BzYjJOaGJBPT0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--b38ab1ffaa2f7c1bb5dc4a66fc3c067dc044def7/shami-bulb-min.png"
                                        }
                                    ]
                                },
                                {
                                    "taxonid": 135,
                                    "parnetid": 125,
                                    "taxonname": "بسته های شمعی 7 وات",
                                    "metadescription": null,
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": "بسته شمعی 7 وات 3 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhlak0wYjNwbGFuQmllakF5Y1dsNlpEUndiWFZzWkRJeU5HRmlid1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVDJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW5Ob1lXMXBMV0oxYkdJdGJXbHVMbkJ1WnlJN0lHWnBiR1Z1WVcxbEtqMVZWRVl0T0NjbmMyaGhiV2t0WW5Wc1lpMXRhVzR1Y0c1bkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSU9hVzFoWjJVdmNHNW5CanNHVkRvUmMyVnlkbWxqWlY5dVlXMWxPZ3BzYjJOaGJBPT0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--b38ab1ffaa2f7c1bb5dc4a66fc3c067dc044def7/shami-bulb-min.png\", \"ItemCodes\": [{\"Qty\": 300, \"Name\": \"  لامپ شمعی 7 وات\", \"Step\": 50, \"Price\": 269320, \"mainsku\": \"1372K3\", \"Variants\": [{\"Code\": \"1372\", \"Name\": \"مهتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"1370\", \"Name\": \"آفتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p style=\"text-align: right;\">لامپ شمعی 7 وات: 300عدد: 20500تومان</p>",
                                            "itemcode": "EXBR0109",
                                            "itemid": 354,
                                            "price": 73057500.00,
                                            "totalremained": 48,
                                            "itemcodes": [
                                                {
                                                    "Qty": 300,
                                                    "Name": "  لامپ شمعی 7 وات",
                                                    "Step": 50,
                                                    "Price": 243525,
                                                    "mainsku": "1372K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "1372",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "1370",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhlak0wYjNwbGFuQmllakF5Y1dsNlpEUndiWFZzWkRJeU5HRmlid1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVDJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW5Ob1lXMXBMV0oxYkdJdGJXbHVMbkJ1WnlJN0lHWnBiR1Z1WVcxbEtqMVZWRVl0T0NjbmMyaGhiV2t0WW5Wc1lpMXRhVzR1Y0c1bkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSU9hVzFoWjJVdmNHNW5CanNHVkRvUmMyVnlkbWxqWlY5dVlXMWxPZ3BzYjJOaGJBPT0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--b38ab1ffaa2f7c1bb5dc4a66fc3c067dc044def7/shami-bulb-min.png"
                                        },
                                        {
                                            "Position": 2,
                                            "itemname": "بسته شمعی 7 وات 5 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhlak0wYjNwbGFuQmllakF5Y1dsNlpEUndiWFZzWkRJeU5HRmlid1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVDJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW5Ob1lXMXBMV0oxYkdJdGJXbHVMbkJ1WnlJN0lHWnBiR1Z1WVcxbEtqMVZWRVl0T0NjbmMyaGhiV2t0WW5Wc1lpMXRhVzR1Y0c1bkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSU9hVzFoWjJVdmNHNW5CanNHVkRvUmMyVnlkbWxqWlY5dVlXMWxPZ3BzYjJOaGJBPT0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--b38ab1ffaa2f7c1bb5dc4a66fc3c067dc044def7/shami-bulb-min.png\", \"ItemCodes\": [{\"Qty\": 500, \"Name\": \"  لامپ شمعی 7 وات\", \"Step\": 50, \"Price\": 260810, \"mainsku\": \"1372K3\", \"Variants\": [{\"Code\": \"1372\", \"Name\": \"مهتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"1370\", \"Name\": \"آفتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p style=\"text-align: right;\">لامپ شمعی 7 وات: 500عدد: 19900تومان</p>",
                                            "itemcode": "EXBR0110",
                                            "itemid": 355,
                                            "price": 118515500.00,
                                            "totalremained": 19,
                                            "itemcodes": [
                                                {
                                                    "Qty": 500,
                                                    "Name": "  لامپ شمعی 7 وات",
                                                    "Step": 50,
                                                    "Price": 237031,
                                                    "mainsku": "1372K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "1372",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "1370",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhlak0wYjNwbGFuQmllakF5Y1dsNlpEUndiWFZzWkRJeU5HRmlid1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVDJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW5Ob1lXMXBMV0oxYkdJdGJXbHVMbkJ1WnlJN0lHWnBiR1Z1WVcxbEtqMVZWRVl0T0NjbmMyaGhiV2t0WW5Wc1lpMXRhVzR1Y0c1bkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSU9hVzFoWjJVdmNHNW5CanNHVkRvUmMyVnlkbWxqWlY5dVlXMWxPZ3BzYjJOaGJBPT0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--b38ab1ffaa2f7c1bb5dc4a66fc3c067dc044def7/shami-bulb-min.png"
                                        },
                                        {
                                            "Position": 3,
                                            "itemname": "بسته شمعی 7 وات 10 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhlak0wYjNwbGFuQmllakF5Y1dsNlpEUndiWFZzWkRJeU5HRmlid1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVDJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW5Ob1lXMXBMV0oxYkdJdGJXbHVMbkJ1WnlJN0lHWnBiR1Z1WVcxbEtqMVZWRVl0T0NjbmMyaGhiV2t0WW5Wc1lpMXRhVzR1Y0c1bkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSU9hVzFoWjJVdmNHNW5CanNHVkRvUmMyVnlkbWxqWlY5dVlXMWxPZ3BzYjJOaGJBPT0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--b38ab1ffaa2f7c1bb5dc4a66fc3c067dc044def7/shami-bulb-min.png\", \"ItemCodes\": [{\"Qty\": 1000, \"Name\": \"  لامپ شمعی 7 وات\", \"Step\": 50, \"Price\": 246630, \"mainsku\": \"1372K3\", \"Variants\": [{\"Code\": \"1372\", \"Name\": \"مهتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"1370\", \"Name\": \"آفتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p style=\"text-align: right;\">لامپ شمعی 7 وات: 1000عدد: 18900تومان</p>",
                                            "itemcode": "EXBR0111",
                                            "itemid": 356,
                                            "price": 230537000.00,
                                            "totalremained": 10,
                                            "itemcodes": [
                                                {
                                                    "Qty": 1000,
                                                    "Name": "  لامپ شمعی 7 وات",
                                                    "Step": 50,
                                                    "Price": 230537,
                                                    "mainsku": "1372K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "1372",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "1370",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhlak0wYjNwbGFuQmllakF5Y1dsNlpEUndiWFZzWkRJeU5HRmlid1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVDJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SW5Ob1lXMXBMV0oxYkdJdGJXbHVMbkJ1WnlJN0lHWnBiR1Z1WVcxbEtqMVZWRVl0T0NjbmMyaGhiV2t0WW5Wc1lpMXRhVzR1Y0c1bkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSU9hVzFoWjJVdmNHNW5CanNHVkRvUmMyVnlkbWxqWlY5dVlXMWxPZ3BzYjJOaGJBPT0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--b38ab1ffaa2f7c1bb5dc4a66fc3c067dc044def7/shami-bulb-min.png"
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "taxonid": 150,
                            "parnetid": 124,
                            "taxonname": "پنل و ریسه",
                            "metadescription": "",
                            "Depth": 2,
                            "Position": 0,
                            "items": null,
                            "taxons": [
                                {
                                    "taxonid": 145,
                                    "parnetid": 150,
                                    "taxonname": "بسته ریسه وایرلس",
                                    "metadescription": "",
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": "بسته ریسه 3 کارتنی",
                                            "metadescription": "",
                                            "description": "<p style=\"text-align: right;\">بسته ریسه 3کارتنی: 300عدد: 31100تومان</p>\r\n<p style=\"text-align: right;\">&nbsp;</p>\r\n<p style=\"text-align: right;\">&nbsp;</p>",
                                            "itemcode": "EXBR0014",
                                            "itemid": 252,
                                            "price": 123126750.00,
                                            "totalremained": 28,
                                            "itemcodes": [
                                                {
                                                    "Qty": 3,
                                                    "Name": "ریسه بدون سیم",
                                                    "Step": 1,
                                                    "Price": 41042250,
                                                    "mainsku": "1272",
                                                    "Variants": [
                                                        {
                                                            "Code": "1672",
                                                            "Name": "مهتابی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "1670",
                                                            "Name": "آفتابی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "1674",
                                                            "Name": "آبی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "1677",
                                                            "Name": "انبه ای",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhPSGt5TVRWaGEzVm9jM0Z4WjNaeU1YcDVhVE0wTldGNVkyOXpOQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpZTJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpZNE5tUTRZamcxTFdNNU4ySXROR1F3WVMxaE9EUmtMVGhqTjJGalltRm1PREJpTVM1cWNHY2lPeUJtYVd4bGJtRnRaU285VlZSR0xUZ25Kelk0Tm1RNFlqZzFMV001TjJJdE5HUXdZUzFoT0RSa0xUaGpOMkZqWW1GbU9EQmlNUzVxY0djR093WlVPaEZqYjI1MFpXNTBYM1I1Y0dWSklnOXBiV0ZuWlM5cWNHVm5CanNHVkRvUmMyVnlkbWxqWlY5dVlXMWxPZ3BzYjJOaGJBPT0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--a8e3c34fd478f04f6d5cb43c49a5c39c5a946682/686d8b85-c97b-4d0a-a84d-8c7acbaf80b1.jpg"
                                        },
                                        {
                                            "Position": 2,
                                            "itemname": "بسته ریسه 5 کارتنی",
                                            "metadescription": "",
                                            "description": "<p style=\"text-align: right;\">بسته ریسه 5 کارتنی: 500عدد: 30100تومان</p>",
                                            "itemcode": "EXBR0015",
                                            "itemid": 253,
                                            "price": 199738950.00,
                                            "totalremained": 158,
                                            "itemcodes": [
                                                {
                                                    "Qty": 5,
                                                    "Name": "ریسه بدون سیم",
                                                    "Step": 1,
                                                    "Price": 39947790,
                                                    "mainsku": "1272",
                                                    "Variants": [
                                                        {
                                                            "Code": "1672",
                                                            "Name": "مهتابی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "1670",
                                                            "Name": "آفتابی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "1674",
                                                            "Name": "آبی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "1677",
                                                            "Name": "انبه ای",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhPSGt5TVRWaGEzVm9jM0Z4WjNaeU1YcDVhVE0wTldGNVkyOXpOQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpZTJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpZNE5tUTRZamcxTFdNNU4ySXROR1F3WVMxaE9EUmtMVGhqTjJGalltRm1PREJpTVM1cWNHY2lPeUJtYVd4bGJtRnRaU285VlZSR0xUZ25Kelk0Tm1RNFlqZzFMV001TjJJdE5HUXdZUzFoT0RSa0xUaGpOMkZqWW1GbU9EQmlNUzVxY0djR093WlVPaEZqYjI1MFpXNTBYM1I1Y0dWSklnOXBiV0ZuWlM5cWNHVm5CanNHVkRvUmMyVnlkbWxqWlY5dVlXMWxPZ3BzYjJOaGJBPT0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--a8e3c34fd478f04f6d5cb43c49a5c39c5a946682/686d8b85-c97b-4d0a-a84d-8c7acbaf80b1.jpg"
                                        },
                                        {
                                            "Position": 3,
                                            "itemname": "بسته ریسه 10 کارتنی",
                                            "metadescription": "",
                                            "description": "<p style=\"text-align: right;\">بسته ریسه 10 کارتنی: 1000عدد: 29100تومان</p>",
                                            "itemcode": "EXBR0016",
                                            "itemid": 254,
                                            "price": 388533300.00,
                                            "totalremained": 7,
                                            "itemcodes": [
                                                {
                                                    "Qty": 10,
                                                    "Name": "ریسه بدون سیم",
                                                    "Step": 1,
                                                    "Price": 38853330,
                                                    "mainsku": "1272",
                                                    "Variants": [
                                                        {
                                                            "Code": "1672",
                                                            "Name": "مهتابی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "1670",
                                                            "Name": "آفتابی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "1674",
                                                            "Name": "آبی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "1677",
                                                            "Name": "انبه ای",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhPSGt5TVRWaGEzVm9jM0Z4WjNaeU1YcDVhVE0wTldGNVkyOXpOQVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpZTJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpZNE5tUTRZamcxTFdNNU4ySXROR1F3WVMxaE9EUmtMVGhqTjJGalltRm1PREJpTVM1cWNHY2lPeUJtYVd4bGJtRnRaU285VlZSR0xUZ25Kelk0Tm1RNFlqZzFMV001TjJJdE5HUXdZUzFoT0RSa0xUaGpOMkZqWW1GbU9EQmlNUzVxY0djR093WlVPaEZqYjI1MFpXNTBYM1I1Y0dWSklnOXBiV0ZuWlM5cWNHVm5CanNHVkRvUmMyVnlkbWxqWlY5dVlXMWxPZ3BzYjJOaGJBPT0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--a8e3c34fd478f04f6d5cb43c49a5c39c5a946682/686d8b85-c97b-4d0a-a84d-8c7acbaf80b1.jpg"
                                        }
                                    ]
                                },
                                {
                                    "taxonid": 146,
                                    "parnetid": 150,
                                    "taxonname": "بسته پنل 60*60",
                                    "metadescription": "",
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": "پنل آراز 60*60 بسته 3 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhkM1V6ZW5oeGREUnZaMjExZUhOME5EVTBjSFozY0d4emFXdGlkUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUTJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWtGeVlYb3RiV2x1TG1wd1p5STdJR1pwYkdWdVlXMWxLajFWVkVZdE9DY25RWEpoZWkxdGFXNHVhbkJuQmpzR1ZEb1JZMjl1ZEdWdWRGOTBlWEJsU1NJUGFXMWhaMlV2YW5CbFp3WTdCbFE2RVhObGNuWnBZMlZmYm1GdFpUb0tiRzlqWVd3PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9rZXkifX0=--b6c0382d4dcc888fd68090012f5a87a0b3a4b134/Araz-min.jpg\", \"ItemCodes\": [{\"Qty\": 3, \"Name\": \" پنل آراز  60 * 60\", \"Step\": 1, \"Price\": 783169, \"mainsku\": \"3182K3\", \"Variants\": [{\"Code\": \"3182\", \"Name\": \"مهتابی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"3180\", \"Name\": \"آفتابی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "",
                                            "itemcode": "shirazaraz",
                                            "itemid": 454,
                                            "price": 23495063.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 3,
                                                    "Name": " پنل آراز  60 * 60",
                                                    "Step": 1,
                                                    "Price": 7831688,
                                                    "mainsku": "3182K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "3182",
                                                            "Name": "مهتابی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "3180",
                                                            "Name": "آفتابی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhkM1V6ZW5oeGREUnZaMjExZUhOME5EVTBjSFozY0d4emFXdGlkUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUTJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWtGeVlYb3RiV2x1TG1wd1p5STdJR1pwYkdWdVlXMWxLajFWVkVZdE9DY25RWEpoZWkxdGFXNHVhbkJuQmpzR1ZEb1JZMjl1ZEdWdWRGOTBlWEJsU1NJUGFXMWhaMlV2YW5CbFp3WTdCbFE2RVhObGNuWnBZMlZmYm1GdFpUb0tiRzlqWVd3PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9rZXkifX0=--b6c0382d4dcc888fd68090012f5a87a0b3a4b134/Araz-min.jpg"
                                        },
                                        {
                                            "Position": 3,
                                            "itemname": "پنل آراز 60*60 بسته 10 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhkM1V6ZW5oeGREUnZaMjExZUhOME5EVTBjSFozY0d4emFXdGlkUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUTJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWtGeVlYb3RiV2x1TG1wd1p5STdJR1pwYkdWdVlXMWxLajFWVkVZdE9DY25RWEpoZWkxdGFXNHVhbkJuQmpzR1ZEb1JZMjl1ZEdWdWRGOTBlWEJsU1NJUGFXMWhaMlV2YW5CbFp3WTdCbFE2RVhObGNuWnBZMlZmYm1GdFpUb0tiRzlqWVd3PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9rZXkifX0=--b6c0382d4dcc888fd68090012f5a87a0b3a4b134/Araz-min.jpg\", \"ItemCodes\": [{\"Qty\": 10, \"Name\": \" پنل آراز  60 * 59\", \"Step\": 1, \"Price\": 7995160, \"mainsku\": \"3182K3\", \"Variants\": [{\"Code\": \"3182\", \"Name\": \"مهتابی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"3180\", \"Name\": \"آفتابی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p style=\"text-align: right;\">پنل آراز 60*60: 10عدد: 660000تومان</p>\r\n<p style=\"text-align: right;\">&nbsp;</p>",
                                            "itemcode": "EXBR0040",
                                            "itemid": 278,
                                            "price": 74139975.00,
                                            "totalremained": 9,
                                            "itemcodes": [
                                                {
                                                    "Qty": 10,
                                                    "Name": " پنل آراز  60 * 60",
                                                    "Step": 1,
                                                    "Price": 7413998,
                                                    "mainsku": "3182K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "3182",
                                                            "Name": "مهتابی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "3180",
                                                            "Name": "آفتابی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhkM1V6ZW5oeGREUnZaMjExZUhOME5EVTBjSFozY0d4emFXdGlkUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUTJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWtGeVlYb3RiV2x1TG1wd1p5STdJR1pwYkdWdVlXMWxLajFWVkVZdE9DY25RWEpoZWkxdGFXNHVhbkJuQmpzR1ZEb1JZMjl1ZEdWdWRGOTBlWEJsU1NJUGFXMWhaMlV2YW5CbFp3WTdCbFE2RVhObGNuWnBZMlZmYm1GdFpUb0tiRzlqWVd3PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9rZXkifX0=--b6c0382d4dcc888fd68090012f5a87a0b3a4b134/Araz-min.jpg"
                                        },
                                        {
                                            "Position": 2,
                                            "itemname": "پنل آراز 60*60 بسته 5 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhkM1V6ZW5oeGREUnZaMjExZUhOME5EVTBjSFozY0d4emFXdGlkUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUTJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWtGeVlYb3RiV2x1TG1wd1p5STdJR1pwYkdWdVlXMWxLajFWVkVZdE9DY25RWEpoZWkxdGFXNHVhbkJuQmpzR1ZEb1JZMjl1ZEdWdWRGOTBlWEJsU1NJUGFXMWhaMlV2YW5CbFp3WTdCbFE2RVhObGNuWnBZMlZmYm1GdFpUb0tiRzlqWVd3PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9rZXkifX0=--b6c0382d4dcc888fd68090012f5a87a0b3a4b134/Araz-min.jpg\", \"ItemCodes\": [{\"Qty\": 5, \"Name\": \" پنل آراز  60 * 59\", \"Step\": 1, \"Price\": 8454650, \"mainsku\": \"3182K3\", \"Variants\": [{\"Code\": \"3182\", \"Name\": \"مهتابی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"3180\", \"Name\": \"آفتابی\", \"Step\": 1, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p style=\"text-align: right;\">پنل آراز 60*60: 5عدد: 670000تومان</p>\r\n<p style=\"text-align: right;\">&nbsp;</p>\r\n<p style=\"text-align: right;\">&nbsp;</p>",
                                            "itemcode": "EXBR0039",
                                            "itemid": 277,
                                            "price": 38114213.00,
                                            "totalremained": 18,
                                            "itemcodes": [
                                                {
                                                    "Qty": 5,
                                                    "Name": " پنل آراز  60 * 60",
                                                    "Step": 1,
                                                    "Price": 7622843,
                                                    "mainsku": "3182K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "3182",
                                                            "Name": "مهتابی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "3180",
                                                            "Name": "آفتابی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhkM1V6ZW5oeGREUnZaMjExZUhOME5EVTBjSFozY0d4emFXdGlkUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUTJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWtGeVlYb3RiV2x1TG1wd1p5STdJR1pwYkdWdVlXMWxLajFWVkVZdE9DY25RWEpoZWkxdGFXNHVhbkJuQmpzR1ZEb1JZMjl1ZEdWdWRGOTBlWEJsU1NJUGFXMWhaMlV2YW5CbFp3WTdCbFE2RVhObGNuWnBZMlZmYm1GdFpUb0tiRzlqWVd3PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9rZXkifX0=--b6c0382d4dcc888fd68090012f5a87a0b3a4b134/Araz-min.jpg"
                                        }
                                    ]
                                },
                                {
                                    "taxonid": 140,
                                    "parnetid": 150,
                                    "taxonname": "بسته لاینر 40 وات ",
                                    "metadescription": null,
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": "بسته چراغ خطی آریان40 وات  3 کارتنی ",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhjak5wYjNJNWFEaHNZM3AzYXpFeGQyVTJhamh4TnpBeE5uSjJkZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVDJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWt4cGJtVmhjaTAwTUhjdGJXbHVMbXB3WnlJN0lHWnBiR1Z1WVcxbEtqMVZWRVl0T0NjblRHbHVaV0Z5TFRRd2R5MXRhVzR1YW5CbkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSVBhVzFoWjJVdmFuQmxad1k3QmxRNkVYTmxjblpwWTJWZmJtRnRaVG9LYkc5allXdz0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--9c5c242bc2be11d353dbbf4bfb21423a5bf07e08/Linear-40w-min.jpg\", \"ItemCodes\": [{\"Qty\": 75, \"Name\": \" چراغ خطی آریان\", \"Step\": 5, \"Price\": 1839360, \"mainsku\": \"3582K3\", \"Variants\": [{\"Code\": \"3582\", \"Name\": \"مهتابی\", \"Step\": 5, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"3580\", \"Name\": \"آفتابی\", \"Step\": 5, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "",
                                            "itemcode": "yaldaari3k",
                                            "itemid": 387,
                                            "price": 124790625.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 75,
                                                    "Name": " چراغ خطی آریان",
                                                    "Step": 5,
                                                    "Price": 1663875,
                                                    "mainsku": "3582K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "3582",
                                                            "Name": "مهتابی",
                                                            "Step": 5,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "3581",
                                                            "Name": "یخی",
                                                            "Step": 5,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "3580",
                                                            "Name": "آفتابی",
                                                            "Step": 5,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhjak5wYjNJNWFEaHNZM3AzYXpFeGQyVTJhamh4TnpBeE5uSjJkZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVDJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWt4cGJtVmhjaTAwTUhjdGJXbHVMbXB3WnlJN0lHWnBiR1Z1WVcxbEtqMVZWRVl0T0NjblRHbHVaV0Z5TFRRd2R5MXRhVzR1YW5CbkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSVBhVzFoWjJVdmFuQmxad1k3QmxRNkVYTmxjblpwWTJWZmJtRnRaVG9LYkc5allXdz0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--9c5c242bc2be11d353dbbf4bfb21423a5bf07e08/Linear-40w-min.jpg"
                                        },
                                        {
                                            "Position": 2,
                                            "itemname": "بسته چراغ خطی آریان40 وات  5 کارتنی ",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhjak5wYjNJNWFEaHNZM3AzYXpFeGQyVTJhamh4TnpBeE5uSjJkZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVDJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWt4cGJtVmhjaTAwTUhjdGJXbHVMbXB3WnlJN0lHWnBiR1Z1WVcxbEtqMVZWRVl0T0NjblRHbHVaV0Z5TFRRd2R5MXRhVzR1YW5CbkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSVBhVzFoWjJVdmFuQmxad1k3QmxRNkVYTmxjblpwWTJWZmJtRnRaVG9LYkc5allXdz0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--9c5c242bc2be11d353dbbf4bfb21423a5bf07e08/Linear-40w-min.jpg\", \"ItemCodes\": [{\"Qty\": 125, \"Name\": \" چراغ خطی آریان\", \"Step\": 5, \"Price\": 1781280, \"mainsku\": \"3582K3\", \"Variants\": [{\"Code\": \"3582\", \"Name\": \"مهتابی\", \"Step\": 5, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"3580\", \"Name\": \"آفتابی\", \"Step\": 5, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "",
                                            "itemcode": "yaldaari5k",
                                            "itemid": 388,
                                            "price": 202438125.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 125,
                                                    "Name": " چراغ خطی آریان",
                                                    "Step": 5,
                                                    "Price": 1619505,
                                                    "mainsku": "3582K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "3582",
                                                            "Name": "مهتابی",
                                                            "Step": 5,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "3581",
                                                            "Name": "یخی",
                                                            "Step": 5,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "3580",
                                                            "Name": "آفتابی",
                                                            "Step": 5,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhjak5wYjNJNWFEaHNZM3AzYXpFeGQyVTJhamh4TnpBeE5uSjJkZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVDJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWt4cGJtVmhjaTAwTUhjdGJXbHVMbXB3WnlJN0lHWnBiR1Z1WVcxbEtqMVZWRVl0T0NjblRHbHVaV0Z5TFRRd2R5MXRhVzR1YW5CbkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSVBhVzFoWjJVdmFuQmxad1k3QmxRNkVYTmxjblpwWTJWZmJtRnRaVG9LYkc5allXdz0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--9c5c242bc2be11d353dbbf4bfb21423a5bf07e08/Linear-40w-min.jpg"
                                        },
                                        {
                                            "Position": 3,
                                            "itemname": "بسته چراغ خطی آریان40 وات  10 کارتنی ",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhjak5wYjNJNWFEaHNZM3AzYXpFeGQyVTJhamh4TnpBeE5uSjJkZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVDJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWt4cGJtVmhjaTAwTUhjdGJXbHVMbXB3WnlJN0lHWnBiR1Z1WVcxbEtqMVZWRVl0T0NjblRHbHVaV0Z5TFRRd2R5MXRhVzR1YW5CbkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSVBhVzFoWjJVdmFuQmxad1k3QmxRNkVYTmxjblpwWTJWZmJtRnRaVG9LYkc5allXdz0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--9c5c242bc2be11d353dbbf4bfb21423a5bf07e08/Linear-40w-min.jpg\", \"ItemCodes\": [{\"Qty\": 250, \"Name\": \" چراغ خطی آریان\", \"Step\": 5, \"Price\": 1684470, \"mainsku\": \"3582K3\", \"Variants\": [{\"Code\": \"3582\", \"Name\": \"مهتابی\", \"Step\": 5, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"3580\", \"Name\": \"آفتابی\", \"Step\": 5, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "",
                                            "itemcode": "yaldaari10k",
                                            "itemid": 389,
                                            "price": 393783750.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 250,
                                                    "Name": " چراغ خطی آریان",
                                                    "Step": 5,
                                                    "Price": 1575135,
                                                    "mainsku": "3582K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "3582",
                                                            "Name": "مهتابی",
                                                            "Step": 5,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "3581",
                                                            "Name": "یخی",
                                                            "Step": 5,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "3580",
                                                            "Name": "آفتابی",
                                                            "Step": 5,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhjak5wYjNJNWFEaHNZM3AzYXpFeGQyVTJhamh4TnpBeE5uSjJkZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpVDJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWt4cGJtVmhjaTAwTUhjdGJXbHVMbXB3WnlJN0lHWnBiR1Z1WVcxbEtqMVZWRVl0T0NjblRHbHVaV0Z5TFRRd2R5MXRhVzR1YW5CbkJqc0dWRG9SWTI5dWRHVnVkRjkwZVhCbFNTSVBhVzFoWjJVdmFuQmxad1k3QmxRNkVYTmxjblpwWTJWZmJtRnRaVG9LYkc5allXdz0iLCJleHAiOm51bGwsInB1ciI6ImJsb2Jfa2V5In19--9c5c242bc2be11d353dbbf4bfb21423a5bf07e08/Linear-40w-min.jpg"
                                        }
                                    ]
                                },
                                {
                                    "taxonid": 139,
                                    "parnetid": 150,
                                    "taxonname": "بسته پنل 8 وات ",
                                    "metadescription": "",
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": "بسته پنل 8 وات3 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhiMk5oWlcxNE9UVnRhamxwWXprM1puQTJibVpuWjNsdk5HeHJkZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUzJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxCaGJtVnNMVGgzTFcxcGJpNXFjR2NpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSjFCaGJtVnNMVGgzTFcxcGJpNXFjR2NHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc5cGJXRm5aUzlxY0dWbkJqc0dWRG9SYzJWeWRtbGpaVjl1WVcxbE9ncHNiMk5oYkE9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9rZXkifX0=--228e0ce449325bc44ee3f1fd14ac42d46fa9cc64/Panel-8w-min.jpg\", \"ItemCodes\": [{\"Qty\": 120, \"Name\": \" پنل 8 وات توکار\", \"Step\": 20, \"Price\": 406780, \"mainsku\": \"7552K3\", \"Variants\": [{\"Code\": \"7551\", \"Name\": \"یخی\", \"Step\": 20, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"7552\", \"Name\": \"مهتابی\", \"Step\": 20, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"7550\", \"Name\": \"آفتابی\", \"Step\": 20, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "",
                                            "itemcode": "yalda83k",
                                            "itemid": 386,
                                            "price": 44064000.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 120,
                                                    "Name": " پنل 8 وات توکار",
                                                    "Step": 20,
                                                    "Price": 367200,
                                                    "mainsku": "7552K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "7551",
                                                            "Name": "یخی",
                                                            "Step": 20,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7550",
                                                            "Name": "آفتابی",
                                                            "Step": 20,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhiMk5oWlcxNE9UVnRhamxwWXprM1puQTJibVpuWjNsdk5HeHJkZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUzJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxCaGJtVnNMVGgzTFcxcGJpNXFjR2NpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSjFCaGJtVnNMVGgzTFcxcGJpNXFjR2NHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc5cGJXRm5aUzlxY0dWbkJqc0dWRG9SYzJWeWRtbGpaVjl1WVcxbE9ncHNiMk5oYkE9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9rZXkifX0=--228e0ce449325bc44ee3f1fd14ac42d46fa9cc64/Panel-8w-min.jpg"
                                        },
                                        {
                                            "Position": 2,
                                            "itemname": "بسته پنل 8 وات 5 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhiMk5oWlcxNE9UVnRhamxwWXprM1puQTJibVpuWjNsdk5HeHJkZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUzJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxCaGJtVnNMVGgzTFcxcGJpNXFjR2NpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSjFCaGJtVnNMVGgzTFcxcGJpNXFjR2NHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc5cGJXRm5aUzlxY0dWbkJqc0dWRG9SYzJWeWRtbGpaVjl1WVcxbE9ncHNiMk5oYkE9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9rZXkifX0=--228e0ce449325bc44ee3f1fd14ac42d46fa9cc64/Panel-8w-min.jpg\", \"ItemCodes\": [{\"Qty\": 200, \"Name\": \" پنل 8 وات توکار\", \"Step\": 20, \"Price\": 393940, \"mainsku\": \"7552K3\", \"Variants\": [{\"Code\": \"7551\", \"Name\": \"یخی\", \"Step\": 20, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"7552\", \"Name\": \"مهتابی\", \"Step\": 20, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"7550\", \"Name\": \"آفتابی\", \"Step\": 20, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p style=\"text-align: right;\">پنل 8وات: 200عدد: 32260تومان</p>",
                                            "itemcode": "EXBR0006",
                                            "itemid": 244,
                                            "price": 71481600.00,
                                            "totalremained": 86,
                                            "itemcodes": [
                                                {
                                                    "Qty": 200,
                                                    "Name": " پنل 8 وات توکار",
                                                    "Step": 20,
                                                    "Price": 357408,
                                                    "mainsku": "7552K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "7551",
                                                            "Name": "یخی",
                                                            "Step": 20,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7550",
                                                            "Name": "آفتابی",
                                                            "Step": 20,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhiMk5oWlcxNE9UVnRhamxwWXprM1puQTJibVpuWjNsdk5HeHJkZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUzJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxCaGJtVnNMVGgzTFcxcGJpNXFjR2NpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSjFCaGJtVnNMVGgzTFcxcGJpNXFjR2NHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc5cGJXRm5aUzlxY0dWbkJqc0dWRG9SYzJWeWRtbGpaVjl1WVcxbE9ncHNiMk5oYkE9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9rZXkifX0=--228e0ce449325bc44ee3f1fd14ac42d46fa9cc64/Panel-8w-min.jpg"
                                        },
                                        {
                                            "Position": 3,
                                            "itemname": "بسته پنل 8 وات 10 کارتنی",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhiMk5oWlcxNE9UVnRhamxwWXprM1puQTJibVpuWjNsdk5HeHJkZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUzJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxCaGJtVnNMVGgzTFcxcGJpNXFjR2NpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSjFCaGJtVnNMVGgzTFcxcGJpNXFjR2NHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc5cGJXRm5aUzlxY0dWbkJqc0dWRG9SYzJWeWRtbGpaVjl1WVcxbE9ncHNiMk5oYkE9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9rZXkifX0=--228e0ce449325bc44ee3f1fd14ac42d46fa9cc64/Panel-8w-min.jpg\", \"ItemCodes\": [{\"Qty\": 400, \"Name\": \" پنل 8 وات توکار\", \"Step\": 20, \"Price\": 372530, \"mainsku\": \"7552K3\", \"Variants\": [{\"Code\": \"7551\", \"Name\": \"یخی\", \"Step\": 20, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"7552\", \"Name\": \"مهتابی\", \"Step\": 20, \"QtyCoef\": 1, \"PriceCoef\": 1}, {\"Code\": \"7550\", \"Name\": \"آفتابی\", \"Step\": 20, \"QtyCoef\": 1, \"PriceCoef\": 1}]}]}",
                                            "description": "<p style=\"text-align: right;\">پنل 8وات: 400عدد: 31000تومان</p>",
                                            "itemcode": "EXBR0007",
                                            "itemid": 245,
                                            "price": 139046400.00,
                                            "totalremained": 39,
                                            "itemcodes": [
                                                {
                                                    "Qty": 400,
                                                    "Name": " پنل 8 وات توکار",
                                                    "Step": 20,
                                                    "Price": 347616,
                                                    "mainsku": "7552K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "7551",
                                                            "Name": "یخی",
                                                            "Step": 20,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7550",
                                                            "Name": "آفتابی",
                                                            "Step": 20,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhiMk5oWlcxNE9UVnRhamxwWXprM1puQTJibVpuWjNsdk5HeHJkZ1k2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUzJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWxCaGJtVnNMVGgzTFcxcGJpNXFjR2NpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSjFCaGJtVnNMVGgzTFcxcGJpNXFjR2NHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc5cGJXRm5aUzlxY0dWbkJqc0dWRG9SYzJWeWRtbGpaVjl1WVcxbE9ncHNiMk5oYkE9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9rZXkifX0=--228e0ce449325bc44ee3f1fd14ac42d46fa9cc64/Panel-8w-min.jpg"
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "taxonid": 128,
                            "parnetid": 124,
                            "taxonname": "بسته های ترکیبی",
                            "metadescription": null,
                            "Depth": 2,
                            "Position": 0,
                            "items": null,
                            "taxons": [
                                {
                                    "taxonid": 147,
                                    "parnetid": 128,
                                    "taxonname": "بسته های مهیج روشنایی",
                                    "metadescription": "",
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 8,
                                            "itemname": "بسته ترکیبی روشنایی دو",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhlR0ZxTXpZMWNqRnVNbnAzYlhNNWVXVnliMmwzWW0xbWJuaGtNUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUzJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFd2R5MWlkV3hpTFcxcGJpNXdibWNpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSnpFd2R5MWlkV3hpTFcxcGJpNXdibWNHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc1cGJXRm5aUzl3Ym1jR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--d2d446153f9cec908af604250416e387bb5e1c1d/10w-bulb-min.png\", \"ItemCodes\": [ { \"Qty\": 200, \"Name\": \"لامپ 10 وات\", \"Step\": 50, \"Price\": 182670, \"mainsku\": \"5322K3\", \"Variants\": [ { \"Code\": \"5322\", \"Name\": \"مهتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"5320\", \"Name\": \"آفتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 100, \"Name\": \"لامپ 12 وات\", \"Step\": 50, \"Price\": 277870, \"mainsku\": \"5342K3\", \"Variants\": [ { \"Code\": \"5342\", \"Name\": \"مهتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"5340\", \"Name\": \"آفتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 100, \"Name\": \"اشکی 6 وات\", \"Step\": 50, \"Price\": 220750, \"mainsku\": \"1222K3\", \"Variants\": [ { \"Code\": \"1222\", \"Name\": \"مهتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"1220\", \"Name\": \"آفتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 40, \"Name\": \"پنل 8 وات\", \"Step\": 20, \"Price\": 342720, \"mainsku\": \"7552k3\", \"Variants\": [ { \"Code\": \"7551\", \"Name\": \"مهتابی\", \"Step\": 20, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7550\", \"Name\": \"آفتابی\", \"Step\": 20, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] } ",
                                            "description": "<p style=\"direction: rtl;\">12 وات - 100 عدد - 27،787 تومان</p>\r\n<p style=\"direction: rtl;\">10 وات 200 عدد - 18،267 تومان</p>\r\n<p style=\"direction: rtl;\">اشکی 6 وات 100 عدد - 22،075 تومان</p>\r\n<p style=\"direction: rtl;\">پنل 8 وات 40 عدد - 34،272 تومان</p>",
                                            "itemcode": "COPY OF shiraz12",
                                            "itemid": 407,
                                            "price": 100102800.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 200,
                                                    "Name": "لامپ 10 وات",
                                                    "Step": 50,
                                                    "Price": 182670,
                                                    "mainsku": "5322K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5322",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5320",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 100,
                                                    "Name": "لامپ 12 وات",
                                                    "Step": 50,
                                                    "Price": 277870,
                                                    "mainsku": "5342K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5342",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5340",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 100,
                                                    "Name": "اشکی 6 وات",
                                                    "Step": 50,
                                                    "Price": 220750,
                                                    "mainsku": "1222K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "1222",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "1220",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 40,
                                                    "Name": "پنل 8 وات",
                                                    "Step": 20,
                                                    "Price": 342720,
                                                    "mainsku": "7552k3",
                                                    "Variants": [
                                                        {
                                                            "Code": "7551",
                                                            "Name": "مهتابی",
                                                            "Step": 20,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7550",
                                                            "Name": "آفتابی",
                                                            "Step": 20,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhlR0ZxTXpZMWNqRnVNbnAzYlhNNWVXVnliMmwzWW0xbWJuaGtNUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUzJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFd2R5MWlkV3hpTFcxcGJpNXdibWNpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSnpFd2R5MWlkV3hpTFcxcGJpNXdibWNHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc1cGJXRm5aUzl3Ym1jR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--d2d446153f9cec908af604250416e387bb5e1c1d/10w-bulb-min.png"
                                        },
                                        {
                                            "Position": 4,
                                            "itemname": "بسته ترکیبی روشنایی سه",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhlR0ZxTXpZMWNqRnVNbnAzYlhNNWVXVnliMmwzWW0xbWJuaGtNUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUzJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFd2R5MWlkV3hpTFcxcGJpNXdibWNpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSnpFd2R5MWlkV3hpTFcxcGJpNXdibWNHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc1cGJXRm5aUzl3Ym1jR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--d2d446153f9cec908af604250416e387bb5e1c1d/10w-bulb-min.png\", \"ItemCodes\": [ { \"Qty\": 200, \"Name\": \"لامپ 10 وات\", \"Step\": 50, \"Price\": 182670, \"mainsku\": \"5322K3\", \"Variants\": [ { \"Code\": \"5322\", \"Name\": \"مهتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"5320\", \"Name\": \"آفتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 50, \"Name\": \"لامپ 15 وات\", \"Step\": 25, \"Price\": 371280, \"mainsku\": \"5352K3\", \"Variants\": [ { \"Code\": \"5332\", \"Name\": \"مهتابی\", \"Step\": 25, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"5330\", \"Name\": \"آفتابی\", \"Step\": 25, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 100, \"Name\": \"اشکی 6 وات\", \"Step\": 50, \"Price\": 220750, \"mainsku\": \"1222K3\", \"Variants\": [ { \"Code\": \"1222\", \"Name\": \"مهتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"1220\", \"Name\": \"آفتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 100, \"Name\": \"هالوژن 7 وات\", \"Step\": 50, \"Price\": 272510, \"mainsku\": \"3502k3\", \"Variants\": [ { \"Code\": \"3502\", \"Name\": \"مهتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"3500\", \"Name\": \"آفتابی\", \"Step\": 20, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "<p style=\"direction: rtl;\">12 وات - 100 عدد - 27،787 تومان</p>\r\n<p style=\"direction: rtl;\">10 وات 200 عدد - 18،267 تومان</p>\r\n<p style=\"direction: rtl;\">اشکی 6 وات 100 عدد - 22،075 تومان</p>\r\n<p style=\"direction: rtl;\">پنل 8 وات 40 عدد - 34،272 تومان</p>",
                                            "itemcode": "COPY OF COPY OF COPY OF COPY OF COPY OF shiraz12",
                                            "itemid": 413,
                                            "price": 104422500.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 200,
                                                    "Name": "لامپ 10 وات",
                                                    "Step": 50,
                                                    "Price": 182670,
                                                    "mainsku": "5322K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5322",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5320",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 50,
                                                    "Name": "لامپ 15 وات",
                                                    "Step": 25,
                                                    "Price": 371280,
                                                    "mainsku": "5352K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5332",
                                                            "Name": "مهتابی",
                                                            "Step": 25,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5330",
                                                            "Name": "آفتابی",
                                                            "Step": 25,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 100,
                                                    "Name": "اشکی 6 وات",
                                                    "Step": 50,
                                                    "Price": 220750,
                                                    "mainsku": "1222K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "1222",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "1220",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 100,
                                                    "Name": "هالوژن 7 وات",
                                                    "Step": 50,
                                                    "Price": 272510,
                                                    "mainsku": "3502k3",
                                                    "Variants": [
                                                        {
                                                            "Code": "3502",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "3500",
                                                            "Name": "آفتابی",
                                                            "Step": 20,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhlR0ZxTXpZMWNqRnVNbnAzYlhNNWVXVnliMmwzWW0xbWJuaGtNUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUzJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFd2R5MWlkV3hpTFcxcGJpNXdibWNpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSnpFd2R5MWlkV3hpTFcxcGJpNXdibWNHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc1cGJXRm5aUzl3Ym1jR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--d2d446153f9cec908af604250416e387bb5e1c1d/10w-bulb-min.png"
                                        },
                                        {
                                            "Position": 5,
                                            "itemname": "بسته ترکیبی روشنایی چهار",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhlR0ZxTXpZMWNqRnVNbnAzYlhNNWVXVnliMmwzWW0xbWJuaGtNUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUzJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFd2R5MWlkV3hpTFcxcGJpNXdibWNpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSnpFd2R5MWlkV3hpTFcxcGJpNXdibWNHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc1cGJXRm5aUzl3Ym1jR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--d2d446153f9cec908af604250416e387bb5e1c1d/10w-bulb-min.png\", \"ItemCodes\": [ { \"Qty\": 12, \"Name\": \"لامپ 30 وات\", \"Step\": 12, \"Price\": 1093610, \"mainsku\": \"5812\", \"Variants\": [ { \"Code\": \"5812\", \"Name\": \"مهتابی\", \"Step\": 6, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 12, \"Name\": \"لامپ 40 وات\", \"Step\": 6, \"Price\": 1425620, \"mainsku\": \"5822\", \"Variants\": [ { \"Code\": \"5822\", \"Name\": \"مهتابی\", \"Step\": 6, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 12, \"Name\": \"لامپ 50 وات\", \"Step\": 6, \"Price\": 1811780, \"mainsku\": \"5832\", \"Variants\": [ { \"Code\": \"5832\", \"Name\": \"مهتابی\", \"Step\": 6, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 12, \"Name\": \"لامپ 80 وات\", \"Step\": 6, \"Price\": 4250680, \"mainsku\": \"5852\", \"Variants\": [ { \"Code\": \"5852\", \"Name\": \"مهتابی\", \"Step\": 6, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "<p style=\"direction: rtl;\">12 وات - 100 عدد - 27،787 تومان</p>\r\n<p style=\"direction: rtl;\">10 وات 200 عدد - 18،267 تومان</p>\r\n<p style=\"direction: rtl;\">اشکی 6 وات 100 عدد - 22،075 تومان</p>\r\n<p style=\"direction: rtl;\">پنل 8 وات 40 عدد - 34،272 تومان</p>",
                                            "itemcode": "COPY OF COPY OF COPY OF COPY OF shiraz12",
                                            "itemid": 412,
                                            "price": 102980220.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 12,
                                                    "Name": "لامپ 30 وات",
                                                    "Step": 12,
                                                    "Price": 1093610,
                                                    "mainsku": "5812",
                                                    "Variants": [
                                                        {
                                                            "Code": "5812",
                                                            "Name": "مهتابی",
                                                            "Step": 6,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 12,
                                                    "Name": "لامپ 40 وات",
                                                    "Step": 6,
                                                    "Price": 1425620,
                                                    "mainsku": "5822",
                                                    "Variants": [
                                                        {
                                                            "Code": "5822",
                                                            "Name": "مهتابی",
                                                            "Step": 6,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 12,
                                                    "Name": "لامپ 50 وات",
                                                    "Step": 6,
                                                    "Price": 1811780,
                                                    "mainsku": "5832",
                                                    "Variants": [
                                                        {
                                                            "Code": "5832",
                                                            "Name": "مهتابی",
                                                            "Step": 6,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 12,
                                                    "Name": "لامپ 80 وات",
                                                    "Step": 6,
                                                    "Price": 4250680,
                                                    "mainsku": "5852",
                                                    "Variants": [
                                                        {
                                                            "Code": "5852",
                                                            "Name": "مهتابی",
                                                            "Step": 6,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhlR0ZxTXpZMWNqRnVNbnAzYlhNNWVXVnliMmwzWW0xbWJuaGtNUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUzJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFd2R5MWlkV3hpTFcxcGJpNXdibWNpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSnpFd2R5MWlkV3hpTFcxcGJpNXdibWNHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc1cGJXRm5aUzl3Ym1jR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--d2d446153f9cec908af604250416e387bb5e1c1d/10w-bulb-min.png"
                                        },
                                        {
                                            "Position": 6,
                                            "itemname": "بسته ترکیبی روشنایی پنج",
                                            "metadescription": "{ \"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhlR0ZxTXpZMWNqRnVNbnAzYlhNNWVXVnliMmwzWW0xbWJuaGtNUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUzJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFd2R5MWlkV3hpTFcxcGJpNXdibWNpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSnpFd2R5MWlkV3hpTFcxcGJpNXdibWNHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc1cGJXRm5aUzl3Ym1jR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--d2d446153f9cec908af604250416e387bb5e1c1d/10w-bulb-min.png\", \"ItemCodes\": [ { \"Qty\": 40, \"Name\": \"پنل 8 وات توکار\", \"Step\": 20, \"Price\": 342720, \"mainsku\": \"7551\", \"Variants\": [ { \"Code\": \"7551\", \"Name\": \"مهتابی\", \"Step\": 20, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7550\", \"Name\": \"آفتابی\", \"Step\": 20, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 20, \"Name\": \"پنل 15 وات توکار\", \"Step\": 10, \"Price\": 635460, \"mainsku\": \"7562\", \"Variants\": [ { \"Code\": \"7562\", \"Name\": \"مهتابی\", \"Step\": 10, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7560\", \"Name\": \"آفتابی\", \"Step\": 10, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7561\", \"Name\": \"یخی\", \"Step\": 10, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 20, \"Name\": \"پنل 18 وات توکار\", \"Step\": 10, \"Price\": 761010, \"mainsku\": \"7572\", \"Variants\": [ { \"Code\": \"7572\", \"Name\": \"مهتابی\", \"Step\": 10, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7570\", \"Name\": \"آفتابی\", \"Step\": 10, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7571\", \"Name\": \"یخی\", \"Step\": 10, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 12, \"Name\": \"پنل 22 وات توکار\", \"Step\": 6, \"Price\": 1123960, \"mainsku\": \"7582\", \"Variants\": [ { \"Code\": \"7582\", \"Name\": \"مهتابی\", \"Step\": 6, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7580\", \"Name\": \"آفتابی\", \"Step\": 6, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7581\", \"Name\": \"یخی\", \"Step\": 6, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 12, \"Name\": \"پنل 28 وات توکار\", \"Step\": 6, \"Price\": 1662430, \"mainsku\": \"7592\", \"Variants\": [ { \"Code\": \"7592\", \"Name\": \"مهتابی\", \"Step\": 6, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7590\", \"Name\": \"آفتابی\", \"Step\": 6, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"7591\", \"Name\": \"یخی\", \"Step\": 6, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] }",
                                            "description": "<p style=\"direction: rtl;\">12 وات - 100 عدد - 27،787 تومان</p>\r\n<p style=\"direction: rtl;\">10 وات 200 عدد - 18،267 تومان</p>\r\n<p style=\"direction: rtl;\">اشکی 6 وات 100 عدد - 22،075 تومان</p>\r\n<p style=\"direction: rtl;\">پنل 8 وات 40 عدد - 34،272 تومان</p>",
                                            "itemcode": "COPY OF COPY OF COPY OF shiraz12",
                                            "itemid": 411,
                                            "price": 88783520.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 80,
                                                    "Name": "پنل 8 وات توکار",
                                                    "Step": 20,
                                                    "Price": 342720,
                                                    "mainsku": "7551",
                                                    "Variants": [
                                                        {
                                                            "Code": "7551",
                                                            "Name": "مهتابی",
                                                            "Step": 20,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7550",
                                                            "Name": "آفتابی",
                                                            "Step": 20,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 20,
                                                    "Name": "پنل 15 وات توکار",
                                                    "Step": 10,
                                                    "Price": 635460,
                                                    "mainsku": "7562",
                                                    "Variants": [
                                                        {
                                                            "Code": "7562",
                                                            "Name": "مهتابی",
                                                            "Step": 10,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7560",
                                                            "Name": "آفتابی",
                                                            "Step": 10,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7561",
                                                            "Name": "یخی",
                                                            "Step": 10,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 20,
                                                    "Name": "پنل 18 وات توکار",
                                                    "Step": 10,
                                                    "Price": 761010,
                                                    "mainsku": "7572",
                                                    "Variants": [
                                                        {
                                                            "Code": "7572",
                                                            "Name": "مهتابی",
                                                            "Step": 10,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7570",
                                                            "Name": "آفتابی",
                                                            "Step": 10,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7571",
                                                            "Name": "یخی",
                                                            "Step": 10,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 12,
                                                    "Name": "پنل 22 وات توکار",
                                                    "Step": 6,
                                                    "Price": 1123960,
                                                    "mainsku": "7582",
                                                    "Variants": [
                                                        {
                                                            "Code": "7582",
                                                            "Name": "مهتابی",
                                                            "Step": 6,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7580",
                                                            "Name": "آفتابی",
                                                            "Step": 6,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7581",
                                                            "Name": "یخی",
                                                            "Step": 6,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 12,
                                                    "Name": "پنل 28 وات توکار",
                                                    "Step": 6,
                                                    "Price": 1662430,
                                                    "mainsku": "7592",
                                                    "Variants": [
                                                        {
                                                            "Code": "7592",
                                                            "Name": "مهتابی",
                                                            "Step": 6,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7590",
                                                            "Name": "آفتابی",
                                                            "Step": 6,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7591",
                                                            "Name": "یخی",
                                                            "Step": 6,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhlR0ZxTXpZMWNqRnVNbnAzYlhNNWVXVnliMmwzWW0xbWJuaGtNUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUzJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFd2R5MWlkV3hpTFcxcGJpNXdibWNpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSnpFd2R5MWlkV3hpTFcxcGJpNXdibWNHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc1cGJXRm5aUzl3Ym1jR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--d2d446153f9cec908af604250416e387bb5e1c1d/10w-bulb-min.png"
                                        },
                                        {
                                            "Position": 7,
                                            "itemname": "بسته ترکیبی روشنایی یک",
                                            "metadescription": "{\"ImageURL\": \"https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhlR0ZxTXpZMWNqRnVNbnAzYlhNNWVXVnliMmwzWW0xbWJuaGtNUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUzJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFd2R5MWlkV3hpTFcxcGJpNXdibWNpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSnpFd2R5MWlkV3hpTFcxcGJpNXdibWNHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc1cGJXRm5aUzl3Ym1jR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--d2d446153f9cec908af604250416e387bb5e1c1d/10w-bulb-min.png\",\"ItemCodes\": [{\"Qty\": 200,\"Name\": \"لامپ 10 وات\",\"Step\": 50,\"Price\": 182670, \"mainsku\": \"5322K3\", \"Variants\": [ { \"Code\": \"5322\", \"Name\": \"مهتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"5320\", \"Name\": \"آفتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 100, \"Name\": \"لامپ 7 وات\", \"Step\": 50, \"Price\": 167200, \"mainsku\": \"5322K3\", \"Variants\": [ { \"Code\": \"2372\", \"Name\": \"مهتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"2370\", \"Name\": \"آفتابی\", \"Step\": 50, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 50, \"Name\": \"لامپ 15 وات\", \"Step\": 25, \"Price\": 371280, \"mainsku\": \"5352K3\", \"Variants\": [ { \"Code\": \"5332\", \"Name\": \"مهتابی\", \"Step\": 25, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"5330\", \"Name\": \"آفتابی\", \"Step\": 25, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] }, { \"Qty\": 50, \"Name\": \"لامپ 20 وات\", \"Step\": 25, \"Price\": 591430, \"mainsku\": \"5352K3\", \"Variants\": [ { \"Code\": \"5352\", \"Name\": \"مهتابی\", \"Step\": 25, \"QtyCoef\": 1, \"PriceCoef\": 1 }, { \"Code\": \"5350\", \"Name\": \"آفتابی\", \"Step\": 25, \"QtyCoef\": 1, \"PriceCoef\": 1 } ] } ] } ",
                                            "description": "<p style=\"direction: rtl;\">7 وات - 100 عدد - 16،720 تومان</p>\r\n<p style=\"direction: rtl;\">10 وات 200 عدد - 18،267 تومان</p>\r\n<p style=\"direction: rtl;\">15 وات 50 عدد - 37،128 تومان</p>\r\n<p style=\"direction: rtl;\">20 وات 50 عدد - 59،143 تومان</p>",
                                            "itemcode": "shiraz12",
                                            "itemid": 406,
                                            "price": 101388000.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 200,
                                                    "Name": "لامپ 10 وات",
                                                    "Step": 50,
                                                    "Price": 182670,
                                                    "mainsku": "5322K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5322",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5320",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 100,
                                                    "Name": "لامپ 7 وات",
                                                    "Step": 50,
                                                    "Price": 167200,
                                                    "mainsku": "5322K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "2372",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "2370",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 50,
                                                    "Name": "لامپ 15 وات",
                                                    "Step": 25,
                                                    "Price": 371280,
                                                    "mainsku": "5352K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5332",
                                                            "Name": "مهتابی",
                                                            "Step": 25,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5330",
                                                            "Name": "آفتابی",
                                                            "Step": 25,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 50,
                                                    "Name": "لامپ 20 وات",
                                                    "Step": 25,
                                                    "Price": 591430,
                                                    "mainsku": "5352K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5352",
                                                            "Name": "مهتابی",
                                                            "Step": 25,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5350",
                                                            "Name": "آفتابی",
                                                            "Step": 25,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhlR0ZxTXpZMWNqRnVNbnAzYlhNNWVXVnliMmwzWW0xbWJuaGtNUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUzJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFd2R5MWlkV3hpTFcxcGJpNXdibWNpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSnpFd2R5MWlkV3hpTFcxcGJpNXdibWNHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc1cGJXRm5aUzl3Ym1jR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--d2d446153f9cec908af604250416e387bb5e1c1d/10w-bulb-min.png"
                                        }
                                    ]
                                },
                                {
                                    "taxonid": 176,
                                    "parnetid": 128,
                                    "taxonname": "بسته ویژه طلایی",
                                    "metadescription": "",
                                    "Depth": 3,
                                    "Position": 0,
                                    "items": [
                                        {
                                            "Position": 1,
                                            "itemname": "7 , 10 , 9 , 12 , 15 , 20 , 30 , 40 , 50 , 80 , fpl , ریسه وایرلس , لاینر , هالوژن , پنل 8 , اشکی 6  , شمعی 7",
                                            "metadescription": "",
                                            "description": "",
                                            "itemcode": "shirazgold",
                                            "itemid": 441,
                                            "price": 604532529.00,
                                            "totalremained": null,
                                            "itemcodes": [
                                                {
                                                    "Qty": 40,
                                                    "Name": "پنل 8 وات توکار",
                                                    "Step": 20,
                                                    "Price": 337830,
                                                    "mainsku": "7551",
                                                    "Variants": [
                                                        {
                                                            "Code": "7551",
                                                            "Name": "مهتابی",
                                                            "Step": 20,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "7550",
                                                            "Name": "آفتابی",
                                                            "Step": 20,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 200,
                                                    "Name": "لامپ 10 وات",
                                                    "Step": 50,
                                                    "Price": 180060,
                                                    "mainsku": "5322K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5322",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5320",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 100,
                                                    "Name": "لامپ 7 وات",
                                                    "Step": 50,
                                                    "Price": 164810,
                                                    "mainsku": "5322K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "2372",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "2370",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 50,
                                                    "Name": "لامپ 15 وات",
                                                    "Step": 25,
                                                    "Price": 365980,
                                                    "mainsku": "5352K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5332",
                                                            "Name": "مهتابی",
                                                            "Step": 25,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5330",
                                                            "Name": "آفتابی",
                                                            "Step": 25,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 50,
                                                    "Name": "لامپ 20 وات",
                                                    "Step": 25,
                                                    "Price": 582990,
                                                    "mainsku": "5352K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5352",
                                                            "Name": "مهتابی",
                                                            "Step": 25,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5350",
                                                            "Name": "آفتابی",
                                                            "Step": 25,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 12,
                                                    "Name": "لامپ 30 وات",
                                                    "Step": 12,
                                                    "Price": 1077990,
                                                    "mainsku": "5812",
                                                    "Variants": [
                                                        {
                                                            "Code": "5812",
                                                            "Name": "مهتابی",
                                                            "Step": 6,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 12,
                                                    "Name": "لامپ 40 وات",
                                                    "Step": 6,
                                                    "Price": 1405260,
                                                    "mainsku": "5822",
                                                    "Variants": [
                                                        {
                                                            "Code": "5822",
                                                            "Name": "مهتابی",
                                                            "Step": 6,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 12,
                                                    "Name": "لامپ 50 وات",
                                                    "Step": 6,
                                                    "Price": 1785900,
                                                    "mainsku": "5832",
                                                    "Variants": [
                                                        {
                                                            "Code": "5832",
                                                            "Name": "مهتابی",
                                                            "Step": 6,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 12,
                                                    "Name": "لامپ 80 وات",
                                                    "Step": 6,
                                                    "Price": 4189960,
                                                    "mainsku": "5852",
                                                    "Variants": [
                                                        {
                                                            "Code": "5852",
                                                            "Name": "مهتابی",
                                                            "Step": 6,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 100,
                                                    "Name": "لامپ 12 وات",
                                                    "Step": 50,
                                                    "Price": 273900,
                                                    "mainsku": "5342K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "5342",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5340",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 100,
                                                    "Name": "اشکی 6 وات",
                                                    "Step": 50,
                                                    "Price": 217600,
                                                    "mainsku": "1222K3",
                                                    "Variants": [
                                                        {
                                                            "Code": "1222",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "1220",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 100,
                                                    "Name": "شمعی 7 وات",
                                                    "Step": 50,
                                                    "Price": 224050,
                                                    "mainsku": "1370",
                                                    "Variants": [
                                                        {
                                                            "Code": "1372",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "1370",
                                                            "Name": "آفتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 100,
                                                    "Name": "هالوژن 7 وات",
                                                    "Step": 50,
                                                    "Price": 268620,
                                                    "mainsku": "3502k3",
                                                    "Variants": [
                                                        {
                                                            "Code": "3502",
                                                            "Name": "مهتابی",
                                                            "Step": 50,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "3500",
                                                            "Name": "آفتابی",
                                                            "Step": 20,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 25,
                                                    "Name": "چراغ خطی 40 وات",
                                                    "Step": 5,
                                                    "Price": 1530770,
                                                    "mainsku": "3582a",
                                                    "Variants": [
                                                        {
                                                            "Code": "3582",
                                                            "Name": "مهتابی",
                                                            "Step": 5,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "3580",
                                                            "Name": "آفتابی",
                                                            "Step": 5,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "3581",
                                                            "Name": "یخی",
                                                            "Step": 5,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 1,
                                                    "Name": "ریسه وایرلس",
                                                    "Step": 1,
                                                    "Price": 37758870,
                                                    "mainsku": "1672a",
                                                    "Variants": [
                                                        {
                                                            "Code": "1672",
                                                            "Name": "مهتابی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "1670",
                                                            "Name": "آفتابی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "1677",
                                                            "Name": "انبه ای",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "1674",
                                                            "Name": "آبی",
                                                            "Step": 1,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 100,
                                                    "Name": "لامپ رنگی 9 وات",
                                                    "Step": 25,
                                                    "Price": 200583,
                                                    "mainsku": "5943a",
                                                    "Variants": [
                                                        {
                                                            "Code": "5943",
                                                            "Name": "آبی",
                                                            "Step": 25,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5944",
                                                            "Name": "نارنجی",
                                                            "Step": 25,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5945",
                                                            "Name": "قرمز",
                                                            "Step": 25,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5946",
                                                            "Name": "سبز",
                                                            "Step": 25,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5947",
                                                            "Name": "زرد",
                                                            "Step": 25,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                },
                                                {
                                                    "Qty": 25,
                                                    "Name": "لامپ FPL LED",
                                                    "Step": 5,
                                                    "Price": 581810,
                                                    "mainsku": "5502a",
                                                    "Variants": [
                                                        {
                                                            "Code": "5501",
                                                            "Name": "سفید صدفی",
                                                            "Step": 5,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        },
                                                        {
                                                            "Code": "5502",
                                                            "Name": "مهتابی",
                                                            "Step": 5,
                                                            "QtyCoef": 1,
                                                            "PriceCoef": 1
                                                        }
                                                    ]
                                                }
                                            ],
                                            "imageurl": "https://spree.burux.com/rails/active_storage/disk/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDVG9JYTJWNVNTSWhlR0ZxTXpZMWNqRnVNbnAzYlhNNWVXVnliMmwzWW0xbWJuaGtNUVk2QmtWVU9oQmthWE53YjNOcGRHbHZia2tpUzJsdWJHbHVaVHNnWm1sc1pXNWhiV1U5SWpFd2R5MWlkV3hpTFcxcGJpNXdibWNpT3lCbWFXeGxibUZ0WlNvOVZWUkdMVGduSnpFd2R5MWlkV3hpTFcxcGJpNXdibWNHT3daVU9oRmpiMjUwWlc1MFgzUjVjR1ZKSWc1cGJXRm5aUzl3Ym1jR093WlVPaEZ6WlhKMmFXTmxYMjVoYldVNkNteHZZMkZzIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2tleSJ9fQ==--d2d446153f9cec908af604250416e387bb5e1c1d/10w-bulb-min.png"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ];
      allData=allData[0];
      allData=allData.taxons;

      var items=[];
      for (const i1 of allData.filter(x=>x.taxonid!=159)) {
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

      var cableItems=[];
      for (const i1 of allData.filter(x=>x.taxonid==159)) {
        if(i1.items) cableItems.push(i1.items.filter(x=>x.itemcodes!=null));
        if(!i1.taxons) continue;
        for (const i2 of i1.taxons) {

          if(i2.items) cableItems.push(i2.items.filter(x=>x.itemcodes!=null));
          if(!i2.taxons) continue;
          for (const i3 of i2.taxons) {

              if(i3.items) cableItems.push(i3.items.filter(x=>x.itemcodes!=null));
              if(!i3.taxons) continue;
              for (const i4 of i3.taxons){

                if(i4.items) cableItems.push(i4.items.filter(x=>x.itemcodes!=null));
                if(!i4.taxons) continue;
                for (const i5 of i4.taxons){

                  if(i5.items) cableItems.push(i5.items.filter(x=>x.itemcodes!=null));
                  if(!i5.taxons) continue;
                    for (const i6 of i5.taxons){

                      if(i6.items) cableItems.push(i6.items.filter(x=>x.itemcodes!=null));
                      if(!i6.taxons) continue;

                        for (const i7 of i6.taxons){

                          if(i7.items) cableItems.push(i7.items.filter(x=>x.itemcodes!=null));
                          if(!i7.taxons) continue;
                        }
                    }
                }
              }
          }
        }
      }

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
              cableCategory:false,
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

      for (const item of cableItems) {

        if(item.length){

          for (const subItem of item) {

            products.push({
              type:'belex',
              name:subItem.itemname,
              code:subItem.itemcode,
              price:subItem.price,
              cableCategory:true,
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
        src:belexbillboard,
        icon:belexIcon,
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