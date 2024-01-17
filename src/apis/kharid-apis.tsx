import Axios from "axios";
import nosrcImage from './../images/no-src.png';
import nosrc from './../images/no-src.png';
import staticBundleData from './bundledata';
import AIOStorage from 'aio-storage';
import { I_ShopProps, I_app_state, I_bundle_product, I_bundle_taxon, I_bundle_variant, I_product, I_state_cart } from "../types";
type I_chekcCode_return = any;
type I_updateProductPrice_return = I_product[]
type I_getCampaigns_return = { cartId: string, name: string, id: string, src: string, CampaignId: number, PriceListNum: number }[];
type I_getCategories_return = { name: string, id: string }[]
type I_ni = (p: any, appState?: I_app_state) => any
type I_apiFunctions = {
  checkCode: (p: { code: string }) => Promise<{ result: I_chekcCode_return }>,
  updateProductPrice: (
    p: {products: I_product[],cartId:string},
    appState: I_app_state
  ) => { result: I_updateProductPrice_return },
  tarikhche_sefareshate_kharid: I_ni,
  mahsoolate_sefareshe_kharid: I_ni,
  getCampaigns: (ids: string[]) => Promise<{ result: I_getCampaigns_return }>,
  getTaxonProducts:(p:{ taxonId?:string, cartId:string,count?:number }, appState: I_app_state)=>Promise<{result:I_product[]}>
  preOrders: I_ni,
  search: I_ni,
  getCategories: (ids: string[], appState?: I_app_state) => Promise<{ result: I_getCategories_return }>
  getVariantOptionValues: I_ni,
  getProductVariant: I_ni,
  sortIncluded: I_ni,
  getMappedAllProducts: I_ni,
  payment: I_ni,
  getProductFullDetail: I_ni,
  getSpreeProducts: I_ni,
  getModifiedProducts: I_ni,
  getCart: (p: any, appState: I_app_state) => { result: I_state_cart },
  setCart: (cart: I_state_cart, appState: I_app_state) => { result: true }
  dargah: I_ni,
  pardakhte_kharid: I_ni,
  bundleData: I_ni,
  daryafte_ettelaate_bundle: (p:any, appState: I_app_state) => { result: I_bundle_taxon[] }
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
    updateProductPrice({ products, cartId }, { actionClass,Shop }) {
      if (!products.length) { return { result: [] } }
      let {CampaignId,PriceListNum} = Shop[cartId];
      let items = products.map(({ defaultVariant }) => { return { ItemCode: defaultVariant.id, itemCode: defaultVariant.id, ItemQty: 1, itemQty: 1 }; })
      let fixed = actionClass.fixPrice({ items, CampaignId, PriceListNum })
      let res:I_product[] = products.map((o, i) => { return { ...o, ...fixed[i] } })
      return { result: res };
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
    async getCampaigns(ids) {
      if (!ids) { return { result: [] } }
      if (!ids.length) { return { result: [] } }
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
        let obj;
        try { obj = JSON.parse(o.attributes.meta_description) }
        catch { obj = {}; }
        return { cartId: o.attributes.name, name: o.attributes.name, id: o.id, src: src, CampaignId: obj.CampaignId, PriceListNum: obj.PriceListNum };
      });

      return { result: campaigns };
    },
    async getTaxonProducts({ taxonId, cartId,count }, { apis }) {
      let { products } = await apis.request({ api: 'kharid.getSpreeProducts', description: '', parameter: { Taxons: taxonId || cartId, pageSize: count } });
      let result:I_product[] = await apis.request({ api: 'kharid.updateProductPrice', description: '', parameter: { products,cartId } })
      return { result }
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
    async getVariantOptionValues({ optionValues, optionTypes }) {
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
      return { result };
    },
    async getProductVariant({ include_variant, include_srcs, b1Result, optionTypes, defaultVariantId, product }, { apis }) {
      let { id, attributes, relationships } = include_variant;
      let srcs = relationships.images.data.map(({ id }) => include_srcs[id.toString()].attributes.original_url)
      const b1_item = b1Result.find((i) => i.itemCode === attributes.sku);
      if (!b1_item) {
        return { result: false }
      }
      let price, discountPrice, discountPercent, inStock, dropShipping;
      try { price = b1_item.finalPrice } catch { price = 0 }
      try { discountPercent = b1_item.pymntDscnt } catch { discountPrice = 0 }
      try { inStock = !!b1_item.canSell } catch { inStock = 0 }
      try { dropShipping = b1_item.qtyRelation === 4 } catch { dropShipping = 0 }
      try { discountPrice = Math.round(b1_item.price * discountPercent / 100) } catch { discountPrice = 0 }
      let optionValues = await apis.request({ api: 'kharid.getVariantOptionValues', description: '', parameter: { optionValues: relationships.option_values.data, optionTypes } })
      let code = '';
      if (b1_item && b1_item.itemCode) { code = b1_item.itemCode }
      else {
        // console.error(`missing itemCode`)
        // console.error('product is : ' ,product);
        // console.error('b1_item is :', b1_item);
      }
      let result = {
        id:code, optionValues, discountPrice, price, inStock, srcs,
        dropShipping, discountPercent, isDefault: defaultVariantId === id
      };
      return { result }
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
      return { result: sorted }
    },
    async getMappedAllProducts({ spreeResult, b1Result, loadType }, { apis }) {
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
            defaultVariant: { id: defaultVariantSku, srcs },
            price: 0, discountPrice: 0, discountPercent: 0
          });
        }

        return { result: finalResult };
      }

      let products = spreeResult.data;
      let { include_optionTypes, include_variants, include_details, include_srcs, meta_optionTypes } = await apis.request({ api: 'kharid.sortIncluded', description: '', parameter: spreeResult });
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
          let variant = await apis.request({
            api: 'kharid.getProductVariant', description: '',
            parameter: { include_variant: include_variants[id], include_srcs, b1Result, optionTypes, defaultVariantId, product }
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
          console.error(`product width id = ${product.id} has not default variant`)
          console.log('spree item is', product);
          continue;
        }
        finalResult.push({
          inStock, details, optionTypes, variants, srcs, name: product.attributes.name, defaultVariant,
          price, discountPrice, discountPercent, id: product.id
        })
      }
      return { result: finalResult };
    },
    async payment(obj, { Shop }) {
      let { cartId } = obj;
      let result = Shop[cartId].payment(obj);
      return { result }
    },
    async getProductFullDetail(product , { b1Info, actionClass, apis }) {
      //پروداکت رو همینجوری برای اینکه یک چیزی ریترن بشه فرستادم تو از کد و آی دی آبجکت کامل پروداکت رو بساز و ریترن کن
      let res = await Axios.post(`${baseUrl}/Spree/Products`,
        { Ids: product.id, PerPage: 250, Include: "variants,option_types,product_properties,images" }
      );
      if (res.data.data.status === 500) { return { result: false } }
      const productResult = res.data.data.data[0];
      if (productResult === undefined) { return { result: {} }; }

      const included = res.data.data.included;
      let { relationships } = productResult;
      let variants = [];
      let details = [];
      let optionTypes = [];
      const defaultVariantId = product.defaultVariant.id;
      let response = await apis.request({ api: 'kharid.sortIncluded', description: '', parameter: res.data.data });
      let { include_optionTypes, include_details, meta_optionTypes } = response;
      for (let i = 0; i < relationships.option_types.data.length; i++) {
        let { id } = relationships.option_types.data[i];
        id = id.toString();
        if (!meta_optionTypes[id]) {continue;}
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
        let optionValues = await apis.request({ api: 'kharid.getVariantOptionValues', parameter: { optionValues: variant.relationships.option_values.data, optionTypes } })
        const variantImagesId = variant.relationships.images.data.map(x => x.id);
        const variantImages = included.filter(x => x.type === "image" && variantImagesId.includes(x.id));
        const srcs = variantImages.map(x => {
          return "https://spree.burux.com" + x.attributes.original_url;
        });
        let price = actionClass.fixPrice({ items: [{ ItemCode: varSku, itemCode: varSku, ItemQty: 1, itemQty: 1 }] })[0];
        if (price === undefined) continue;
        let sss = b1Info.itemPrices.find(x => x.itemCode === varSku || x.mainSku === varSku);
        if (!sss) { sss = {} }
        let { canSell, qtyRelation } = sss;
        variants.push({
          optionValues,
          inStock: !!canSell,
          dropShipping: qtyRelation === 4,
          srcs,
          id: varSku,
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
      return { result: product };
    },
    async getSpreeProducts({ Taxons, pageSize = 250, pageNumber, ids, Name, vitrin }, { userInfo, b1Info, apis }) {
      let body = {
        vitrin,
        CardCode: userInfo.cardCode, Taxons, Name, ids, PerPage: pageSize, Page: pageNumber,
        ProductFields: "id,name,type,sku,slug,default_variant,images,price",
        VariantFields: "id,sku,type,images",
        Include: "default_variant,images"
      }
      let res = await Axios.post(`${baseUrl}/Spree/Products`, body);
      if (!res.data.isSuccess) { return { result: res.data.message } }
      const spreeData = res.data.data;
      if (!spreeData) { return { result: 'خطا در دریافت اطلاعات اسپری' } }
      let b1Data;
      if (!vitrin) {
        if (!b1Info.itemPrices) {
          helper.showAlert({ type: 'error', text: `b1Info.itemPrices is not valid` })
          return { result: [] }
        }
        b1Data = b1Info.itemPrices.map((i) => {
          return {
            "itemCode": i.itemCode,
            "price": 0,
            "finalPrice": 0,
            "b1Dscnt": 0,
            "cmpgnDscnt": 0,
            "pymntDscnt": 0,
            "mainSku": i.mainSku,
            "canSell": i.canSell,
            //"onHand": {
            //   "whsCode": "01",
            //   "qty": 269.3,
            //   "qtyLevel": 300,
            //   "qtyLevRel": "Less"
            //}
          };
        });
      }

      let products = await apis.request({ api: 'kharid.getModifiedProducts', description: '', parameter: { spreeResult: spreeData, b1Result: b1Data, Taxons, vitrin } })
      let total = spreeData.meta.total_count
      let result = { products: [], total: 0 };
      if (Array.isArray(products)) { result = { products, total } }
      return { result }
    },
    async getModifiedProducts({ spreeResult, b1Result, Taxons, vitrin }) {
      let images = spreeResult.included.filter(({ type }) => type === 'image')
      function getImagesDic() {
        let baseImageUrl = vitrin ? "https://shopback.miarze.com" : "https://spree.burux.com"
        let images_dic = {};
        for (let i = 0; i < images.length; i++) { let { attributes, id } = images[i]; images_dic[id.toString()] = baseImageUrl + attributes.styles[9].url; }
        return images_dic
      }
      let images_dic = getImagesDic()
      function getImages(product) {
        return product.relationships.images.data.map(({ id }) => images_dic[id.toString()])
      }
      let allProducts = [];
      let variants = spreeResult.included.filter(({ type }) => type === 'variant')

      for (const product of spreeResult.data) {
        // 11291 ,
        //11909 ,
        // 11922 ,
        // 12314 ,
        // 12395
        if (product.id === "12395" || product.relationships.default_variant === undefined || product.relationships.default_variant.data === undefined) {
          console.error(`
            if (product.id === "12395" || product.relationships.default_variant === undefined || product.relationships.default_variant.data === undefined) {      
              continue;
            }
          `)
          continue;
        }
        let iimages = getImages(product);
        let { relationships } = product;
        let defalutVariantId = relationships.default_variant.data.id;
        const defaultVariant = variants.find(({ id }) => id === defalutVariantId);
        const sku = defaultVariant.attributes.sku;
        if (!sku) {
          console.error(`missing sku in default variant of product`);
          console.error(`product is : `, product);
          console.error(`default variant is : `, defaultVariant);
          console.error(`defaultVariant.attributes.sku is : `, sku);
          continue
        }
        let defaultVariantProps = {
          "discountPrice": 0,
          "price": 0,
          inStock: true,
          "dropShipping": true,
          "srcs": [],
          "id": sku,
          "discountPercent": 0,
          "isDefault": true
        };
        let productProps = {}
        const itemFromB1 = b1Result.find((x) => {
          if (x.itemCode === sku) { return true }
          if (x.mainSku === sku) { return true }
          return false
        });
        if (!itemFromB1) {
          console.error(`spree item with sku = ${sku} is not match with any item in B1`);
          console.error(`product is : `, product);
          console.error(`default variant is : `, defaultVariant);
          continue
        }
        defaultVariantProps.inStock = !!itemFromB1 && !!itemFromB1.canSell;
        defaultVariantProps.dropShipping = itemFromB1.qtyRelation === 4;
        productProps = {
          inStock: defaultVariantProps.inStock, details: [], optionTypes: [], variants: [defaultVariantProps], srcs: iimages,
          name: product.attributes.name, defaultVariant: defaultVariantProps,
          price: 0, discountPrice: 0, discountPercent: 0, id: product.id
        }
        allProducts.push(productProps);
      }
      return { result: allProducts };
    },
    getCart({ Shop, userInfo }) {
      let cartStorage = AIOStorage('bazaremiarzeapis');
      let cart = cartStorage.load({ name: 'cart.' + userInfo.cardCode, def: {} });
      let cartIds = Object.keys(Shop);
      let keys = Object.keys(cart)
      let newCart = {}
      for (let i = 0; i < keys.length; i++) {
        let cartId = keys[i];
        if (cartIds.indexOf(cartId) === -1) { continue }
        newCart[cartId] = cart[cartId]
      }
      return { result: newCart }
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
    daryafte_ettelaate_bundle(parameter, { apis }) {
      let allData = apis.request({
        api: 'kharid.bundleData', description: 'دریافت دیتای باندل', def: []
      })
      allData = allData[0].taxons[0].taxons[0];
      let result:I_bundle_taxon[] = allData.map(({itemname,description,itemcode,price,itemcodes,imageurl,max = Infinity})=>{
        let taxon:I_bundle_taxon = {
          cartId:'Bundle',description,id:itemcode,name:itemname,price,image:imageurl,max,
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

