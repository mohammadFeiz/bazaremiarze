import React, { Fragment, useContext, useEffect, useState, useRef, createRef, Component } from "react";
import RVD from './npm/react-virtual-dom/react-virtual-dom';
import AIOStorage from 'aio-storage';
import { Icon } from '@mdi/react';
import {
    mdiChevronLeft, mdiChevronDown, mdiCheckCircle, mdiAlertCircle, mdiCart, mdiPlus, mdiMinus, mdiTrashCanOutline, mdiClose, mdiCheck,
    mdiInformation, mdiArrowDown, mdiArrowUp
} from "@mdi/js";
import Axios from 'axios';
import SplitNumber from "./npm/aio-functions/split-number";
import NoSrc from './images/no-src.png';
import getSvg from "./utils/getSvg";
import AIOInput from "./npm/aio-input/aio-input";
import $ from 'jquery';
import bundleBoxSrc from './images/bundle-box.jpg';
import SearchBox from './components/search-box/index';
import aftabisrc from './images/aftabi.png';
import mahtabisrc from './images/mahtabi.png';
import yakhisrc from './images/yakhi.png';
import sabzsrc from './images/sabz.png';
import ghermezsrc from './images/ghermez.png';
import abisrc from './images/abi.png';
import narenjisrc from './images/narenji.png';
import zardsrc from './images/zard.png';
import appContext from './app-context';
import { 
    I_ShopClass, I_taxon, I_app_state, I_bundle_product, I_bundle_taxon, I_bundle_variant, I_cartShop_Product, I_cartShop_bundle, I_cartShop_bundle_product, 
    I_cartShop_bundle_taxon, I_cartShop_taxon, I_cartTaxon, I_cartVariant, I_discount, I_product, I_product_optionType, I_shippingOptions, I_renderIn, 
    I_variant, I_variant_optionValues, I_cartProduct, I_getFactorDetails_result, I_factorItem, I_cartShop_bundle_variant, I_marketingLine_bundle, I_cartShop, I_ShopProps 
} from "./types";
import { I_getTaxonProducts_p } from "./apis/kharid-apis";
import noItemSrc from './images/not-found.png';
import nosrc from './images/no-src.png';
import './shop-class.css';

export default class ShopClass implements I_ShopClass {
    /****type defined**** */
    getAppState: () => I_app_state;
    shopId: string;
    active: boolean;
    shopName: string;
    taxons?: I_taxon[];
    maxCart?: number;
    CampaignId?: number;
    PriceListNum?: number;
    billboard?: string;
    products?: I_product;
    description?: string;
    icon?: string;
    itemType: 'Product' | 'Bundle' | 'Taxon'
    items: I_bundle_taxon[] | I_product[] | { [taxonId: string]: I_product[] }
    cart:I_cartShop;
    constructor(p:{ getAppState:()=>I_app_state, config:I_ShopProps }) {
        let { getAppState, config } = p;
        this.getAppState = getAppState;
        this.update(config);
        
    }
    update(obj) { for (let prop in obj) { this[prop] = obj[prop]; } }
    dicToArray = (dic: { [key: string]: any }) => Object.keys(dic).map((key) => dic[key])
    getTaxonNameByTaxonId = (taxonId:string)=>{
        if(this.shopId === 'Regular'){
            let {spreeCategories} = this.getAppState();
            return spreeCategories.dic[taxonId].name;
        }
        if(this.itemType === 'Taxon'){return this.taxons.find((o)=>o.id === taxonId).name}
    }
    isProductInCart = (productId:string,taxonId?:string)=>{
        let {actionClass} = this.getAppState()
        if(!actionClass.getCartShop(this.shopId)){return false}
        if(taxonId){
            let cartTab = actionClass.getCartShop(this.shopId) as I_cartShop_taxon;
            let cartTaxon = cartTab.taxons[taxonId];
            if(!cartTaxon){return false}
            return !!cartTaxon.products[productId]
        }
        else {
            let cartTab = actionClass.getCartShop(this.shopId) as I_cartShop_Product;
            return !!cartTab.products[productId]
        }
    }
    getShopItems = async (p?:{taxonId?: string, productId?: string}) => {
        let { apis,backOffice } = this.getAppState();
        if (this.itemType === 'Bundle') {
            debugger
            if (!this.items) {
                let {bundleData} = backOffice
                this.items = bundleData;
            }
            return this.items
        }
        else if(this.shopId === 'Regular' || this.itemType === 'Taxon'){
            if(!this.items){this.items = {}}
            if(!p || !p.taxonId){
                if(this.itemType === 'Taxon'){return this.taxons}
                alert('error 34234')
            }
            let taxonId = p.taxonId;
            let taxonName = this.getTaxonNameByTaxonId(p.taxonId);
            if(!this.items[taxonId]){
                let parameter: I_getTaxonProducts_p = { category: { shopId: this.shopId, shopName: this.shopName, taxonId, taxonName } }
                let products = await apis.request({
                    api: 'kharid.getTaxonProducts', description: `دریافت محصولات تکزون ${taxonName}`, def: [], parameter,
                    cache: { time: 30 * 24 * 60 * 60 * 1000, name: `taxonProducts.${this.shopId}.${taxonId}` }
                });
                this.items[taxonId] = products;
            }
            if (!p || !p.productId) { return this.items[taxonId] }
            let product:I_product = this.items[taxonId].find((o: I_product) => o.id === p.productId)
            return [product]
        }
        else {
            if(!this.items){
                let parameter = { category: { shopId: this.shopId, shopName: this.shopName } }
                let cacheName = `taxonProducts.${this.shopId}`;
                let description = `دریافت محصولات ${this.shopName}`;
                let request = { api: 'kharid.getTaxonProducts', description, def: [], parameter, loading: false, cache: { time: 30 * 24 * 60 * 60 * 1000, name: cacheName } }
                let products = await apis.request(request)
                this.items = products;
            }
            if(!p || !p.productId){return this.items}
            let product = (this.items as I_product[]).find((o: I_product) => o.id === p.productId)
            return [product]
        }
    }
    openCategory = async (taxonId?: string) => {
        let { rsa, actionClass, msfReport, spreeCategories } = this.getAppState();
        let items = await this.getShopItems({taxonId});
        let name = taxonId ? spreeCategories.dic[taxonId].name : this.shopName;
        let id = taxonId ? taxonId : this.shopId;
        let props: I_CategoryView = {
            shopId:this.shopId,billboard: this.billboard, items, description: this.description, itemType: this.itemType,
            renderItem: (item: I_product | I_bundle_taxon | I_taxon, index?: number) => this.renderCard({ item, renderIn: 'category', index })
        }
        msfReport({ actionName: 'open category', actionId: 4, targetName: name, targetId: id, tagName: 'kharid', eventName: 'page view' })
        let buttons = await actionClass.getHeaderIcons({ cart: true })
        rsa.addModal({
            id: 'shop-class-category', position: 'fullscreen',
            body: { render: () => <CategoryView {...props} /> },
            header: { title: name, buttons }
        })
    }
    renderCard = (p: { item: I_product | I_taxon | I_bundle_taxon, renderIn: I_renderIn, index?: number }) => {
        let { item, renderIn, index } = p;
        if (this.itemType === 'Bundle') { return this.renderCard_Bundle({ taxon: item as I_bundle_taxon, renderIn, index }) }
        if (this.itemType === 'Taxon') { return this.renderCard_taxon({ taxon: item as I_taxon, renderIn }) }
        if (this.itemType === 'Product') { return this.renderCard_Regular({ product: item as I_product, renderIn, index }) }
    }
    renderCard_Regular = (
        p: {
            product: I_product, renderIn: I_renderIn, index: number,
            loading?: boolean, type?: 'horizontal' | 'vertical'
        }
    ) => {
        let { product, renderIn, index, loading, type } = p;
        let props: I_RegularCard = {
            product, renderIn, loading, index, type, shopId: this.shopId,
            onClick: async (product: I_product) => {
                let newProduct: I_product = await this.openProductPage(product);
                return newProduct;
            }
        }
        return (<RegularCard key={product.id} {...props} />)
    }
    renderCard_taxon = (p: { taxon: I_taxon, renderIn: I_renderIn }) => {
        let { taxon, renderIn } = p;
        let props: I_TaxonCard = {
            taxon, renderIn, shopId: this.shopId, shopName: this.shopName,
            getProducts: async () => await this.getShopItems({taxonId:taxon.id}),
            renderCard: (product: I_product, index: number) => this.renderCard_Regular({ product, index, renderIn })
        }
        return (<TaxonCard key={taxon.id} {...props} />)
    }
    renderCard_Bundle = (p: { taxon: I_bundle_taxon, renderIn: I_renderIn, index?: number }) => {
        //{ taxon: I_bundle_taxon, renderIn: I_renderIn, index?: number, onClick?: Function }
        let { taxon, renderIn, index } = p;
        let props = { taxon, renderIn, index, onClick: () => this.openBundlePage({ taxon }) }
        return (<BundleCard key={taxon.id} {...props} />)
    }
    openBundlePage = (p: { taxon: I_bundle_taxon }) => {
        let { taxon } = p;
        let { rsa, msfReport } = this.getAppState();
        msfReport({ actionName: 'open product', actionId: 5, targetName: taxon.name, targetId: taxon.id, tagName: 'kharid', eventName: 'page view' })
        rsa.addModal({
            position: 'fullscreen', id: 'product',
            body: {render: () => {let props: I_BundlePage = { taxon }; return <BundlePage {...props} />}},
            header: false
        })
    }
    updateProduct = (product: I_product) => {
        let { apis } = this.getAppState();
        let items: I_product[], storageKey: string;
        if (product.category.taxonId) {
            storageKey = `taxonProducts.${this.shopId}.${product.category.taxonId}`
            items = this.items[product.category.taxonId];
        }
        else {
            storageKey = `taxonProducts.${this.shopId}`;
            items = this.items as I_product[];
        }
        let list = apis.getCache(storageKey);
        if(list){
            let newList = list.map((o: I_product) => o.id === product.id ? product : o)
            apis.setCache(storageKey, newList);
        }
        let index: number = items.findIndex((o: I_product) => o.id === product.id)
        items[index] = product;
    }
    openProductPage = async (product: I_product) => {
        let { apis, rsa, actionClass, msfReport } = this.getAppState();
        if (!product.hasFullDetail) {
            product = await apis.request({ api: 'kharid.getProductFullDetail', parameter: product })
            product.hasFullDetail = true;
            this.updateProduct(product)
        }
        msfReport({ actionName: 'open product', actionId: 5, targetName: product.name, targetId: product.id, tagName: 'kharid', eventName: 'page view' })
        rsa.addModal({
            position: 'fullscreen', id: 'product',
            body: {
                render: () => {
                    let props: I_RegularPage = { product, shopId: this.shopId }
                    return <RegularPage {...props} />
                }
            },
            header: { title: this.shopName, buttons: await actionClass.getHeaderIcons({ cart: true }) }
        })
        return product
    }
    payment = async (obj: I_shippingOptions) => {
        //obj => { address, SettleType, PaymentTime, DeliveryType, PayDueDate }
        let { rsa, actionClass } = this.getAppState();
        let result = await this.sabt(obj);
        if (typeof result === 'object') {
            let { orderNumber } = result;
            rsa.removeModal('all');
            actionClass.removeCartTab(this.shopId)
            actionClass.openPopup('sefareshe-ersal-shode-baraye-vizitor', { orderNumber });
            return true
        }
        else { return false }
    }

    /******** */

    getCartVariants = async (p?: { productId?: string, taxonId?: string }) => {
        let { actionClass } = this.getAppState();
        let res:{
            cartVariants:I_cartVariant[],
            marketingLines:any[],
            total:number,
            bundleMarketingLines:I_marketingLine_bundle[],
            bundleCartVariants:I_cartShop_bundle_variant[]
        } = {cartVariants:[],bundleCartVariants:[],marketingLines:[],bundleMarketingLines:[],total:0} 
        if (!actionClass.getCartShop(this.shopId)) { return res } 
        if (this.itemType === 'Taxon') {
            let cartTab = actionClass.getCartShop(this.shopId) as I_cartShop_taxon;
            for (let taxonId in cartTab.taxons) {
                if (p && p.taxonId && p.taxonId !== taxonId) {continue }
                let cartTaxon:I_cartTaxon = cartTab.taxons[taxonId];
                for(let productId in cartTaxon.products){
                    if (p && p.productId && p.productId !== productId) {continue }    
                    let cartProduct:I_cartProduct = cartTaxon.products[productId];
                    let products = await this.getShopItems({taxonId,productId}) as I_product[];
                    let product = products[0];    
                    for(let variantId in cartProduct.variants){
                        let {count} = cartProduct.variants[variantId];
                        let variant = product.variants.find((o:I_variant)=>o.id === variantId)
                        let {Price} = variant;
                        res.total += count * Price;
                        res.marketingLines.push({ItemCode:variantId,ItemQty:count})
                        res.cartVariants.push(cartProduct.variants[variantId])
                    }
                }
            }
        }
        else if(this.itemType === 'Product') { 
            let cartTab = actionClass.getCartShop(this.shopId) as I_cartShop_Product;
            for(let productId in cartTab.products){
                let cartProduct:I_cartProduct = cartTab.products[productId];
                let {productCategory} = cartProduct;
                if(p && p.taxonId && p.taxonId !== productCategory.taxonId){continue}
                if(p && p.productId && p.productId !== productId){continue}
                let products:I_product[] = await this.getShopItems({taxonId:cartProduct.productCategory.taxonId,productId}) as I_product[];
                let product = products[0];
                for(let variantId in cartProduct.variants){
                    let {count} = cartProduct.variants[variantId];
                    let variant = product.variants.find((o:I_variant)=>o.id === variantId)
                    let {Price} = variant;    
                    res.total += count * Price;
                    res.marketingLines.push({ItemCode:variantId,ItemQty:count})
                    res.cartVariants.push(cartProduct.variants[variantId])
                }
            }
        }
        else if(this.itemType === 'Bundle'){
            let cartTab: I_cartShop_bundle = actionClass.getCartShop('Bundle') as I_cartShop_bundle;
            for (let taxonId in cartTab.taxons) {
                let cartTaxon: I_cartShop_bundle_taxon = cartTab.taxons[taxonId];
                let { products, count: taxonCount, price: taxonPrice } = cartTaxon;
                res.total += taxonCount * taxonPrice;
                for (let productId in products) {
                    let cartProduct: I_cartShop_bundle_product = products[productId];
                    let { variants, price: productPrice } = cartProduct;
                    for (let variantId in variants) {
                        let cartVariant: I_cartShop_bundle_variant = variants[variantId];
                        let { count } = cartVariant;
                        res.bundleMarketingLines.push({ ItemCode: variantId, ItemQty: count, Price: productPrice, BasePackCode: taxonId, BasePackQty: taxonCount })
                        res.bundleCartVariants.push(cartVariant)
                    }
                }
            }
        }
        return res
    }
    getAmounts = async (shippingOptions: I_shippingOptions, container?: string) => {
        if (this.shopId === 'Bundle') { return this.getAmounts_Bundle(shippingOptions, container) }
        else { return await this.getAmounts_all(shippingOptions, container) }
    }
    getAmounts_all = async (shippingOptions: I_shippingOptions, container?: string) => {
        let { actionClass } = this.getAppState();
        let {marketingLines,total} = await this.getCartVariants();
        let factorDetails: I_getFactorDetails_result = actionClass.getFactorDetails(marketingLines, { ...shippingOptions, CampaignId: this.CampaignId }, container);
        let { marketingdetails, DocumentTotal } = factorDetails;
        let { DiscountList, ClubPoints = {} } = marketingdetails;
        let { DiscountValueUsed, DiscountPercentage, PaymentDiscountPercent, PaymentDiscountValue, PromotionValueUsed } = DiscountList;
        let discounts: I_discount[] = []
        if (PaymentDiscountPercent && PaymentDiscountValue) {
            discounts.push({ percent: PaymentDiscountPercent, value: PaymentDiscountValue, title: 'تخفیف نحوه پرداخت' })
        }
        if (DiscountValueUsed && DiscountPercentage) {
            discounts.push({ percent: DiscountPercentage, value: DiscountValueUsed, title: 'کد تخفیف' })
        }
        if (PromotionValueUsed) {
            discounts.push({ value: PromotionValueUsed, title: 'کارت هدیه' })
        }
        return { total, discounts, payment: DocumentTotal, ClubPoints }
    }
    getAmounts_Bundle = async (shippingOptions: I_shippingOptions, container?: string) => {
        let { actionClass, backOffice } = this.getAppState();
        let { PayDueDate_options } = backOffice;
        let { total }: { total: number } = await this.getCartVariants();
        total = total / (1 - (12 / 100))
        let payment = total;
        let { PayDueDate, discountCodeInfo, giftCodeInfo } = shippingOptions || {};
        let cashPercent = 100;
        let discounts: I_discount[] = [];
        if (PayDueDate) {
            let PayDueDateOption = PayDueDate_options.find((o) => o.value === PayDueDate);
            let percent = PayDueDateOption.discountPercent;
            let value = total * percent / 100;
            let title = 'نخفیف نحوه پرداخت';
            discounts.push({ percent, value, title });
            cashPercent = PayDueDateOption.cashPercent;
            payment -= value;
        }
        let DiscountList = actionClass.getCodeDetails({ discountCodeInfo, giftCodeInfo }) || {};
        if (DiscountList.DiscountPercentage) {
            let percent = DiscountList.DiscountPercentage;
            let value = payment * percent / 100;
            let title = 'کد تخفیف';
            discounts.push({ percent, value, title })
            payment -= value;
        }
        if (DiscountList.PromotionValue) {
            let value = DiscountList.PromotionValue;
            let title = 'کارت هدیه';
            discounts.push({ title, value });
            payment -= value;
        }
        payment = payment * cashPercent / 100;
        return { total, discounts, payment, ClubPoints: {} };//notice // ClubPoints!!!!
    }
    renderCartItems = async (renderIn: I_renderIn) => {
        let { actionClass } = this.getAppState();
        let renders:React.ReactNode[] = []
        if (!actionClass.getCartShop(this.shopId)) { return renders }
        if (this.itemType === 'Bundle') {
            let cartTab = actionClass.getCartShop('Bundle') as I_cartShop_bundle;
            let cartTaxons: I_cartShop_bundle_taxon[] = this.dicToArray(cartTab.taxons);
            //به دلیل هندل نشدن پرامیز در مپ جاوا اسکریپت از حلقه فور استفاده می کنم
            for (let i = 0; i < cartTaxons.length; i++) {
                let { taxonId } = cartTaxons[i];
                let shopItems = await this.getShopItems();
                let taxon = await shopItems.find((o: I_bundle_taxon) => o.id === taxonId)
                let res = this.renderCard_Bundle({ taxon, index: i, renderIn })
                renders.push(res)
            }
        }
        else if (this.itemType === 'Taxon') {
            let cartTab = actionClass.getCartShop(this.shopId) as I_cartShop_taxon
            for(let taxonId in cartTab.taxons){
                let taxon:I_taxon = this.taxons.find((o:I_taxon)=>o.id === taxonId)
                renders.push(this.renderCard_taxon({ taxon, renderIn }))
            }
        }
        else {
            let cartTab = actionClass.getCartShop(this.shopId) as I_cartShop_Product;
            let cartProducts: I_cartProduct[] = this.dicToArray(cartTab.products);
            for(let i = 0; i < cartProducts.length; i++){
                let { productId, productCategory } = cartProducts[i];
                let products = await this.getShopItems({productId, taxonId:productCategory.taxonId});
                let product = products[0];
                renders.push(this.renderCard_Regular({ product, renderIn, index:i }))
            }
        }
        return renders;
    }
    fix(value, v = 0) {
        try { return +value.toFixed(v) }
        catch { return 0 }
    }
    getFactorItems = async (shippingOptions: I_shippingOptions, container) => {
        let amounts = await this.getAmounts(shippingOptions, container);
        let { total, payment, discounts, ClubPoints } = amounts;
        if (!total) { alert('missing total in ShopClass.getFactorItems') }
        if (!payment) { alert('missing payment in ShopClass.getFactorItems') }
        if (!ClubPoints) { alert('missing ClubPoints in ShopClass.getFactorItems') }
        let res = [];
        // if (ClubPoints.CampaignPoint) {
        //     res.push({ key: 'امتیاز خرید جشنواره', value: ClubPoints.CampaignPoint, className: 'theme-medium-font-color fs-14' },)
        // }
        // if (ClubPoints.CashPoint) {
        //     res.push({ key: 'امتیاز خرید نقدی', value: ClubPoints.CashPoint, className: 'theme-medium-font-color fs-14' },)
        // }
        // if (ClubPoints.PurchasePoint) {
        //     res.push({ key: 'امتیاز خرید', value: ClubPoints.PurchasePoint, className: 'theme-medium-font-color fs-14' },)
        // }
        res.push({ key: 'قیمت کالاها', value: SplitNumber(this.fix(total)) + ' ریال', className: 'theme-medium-font-color fs-14' })
        for (let i = 0; i < discounts.length; i++) {
            let { title, percent, value } = discounts[i];
            if (!title) { alert('missing discount.title in ShopClass.getFactorItems') }
            if (!value) { alert('missing discount.value in ShopClass.getFactorItems') }
            let text = `${percent ? `${percent}% - ` : ''}${SplitNumber(value)} ریال`
            res.push({ key: title, value: text, className: 'colorFDB913 fs-14' })
        }
        res.push(
            { key: 'مبلغ قابل پرداخت', value: SplitNumber(this.fix(payment)) + ' ریال', className: 'theme-dark-font-color bold fs-16' }
        )
        return res
    }
    edameye_farayande_kharid = () => {
        let { rsa, msfReport } = this.getAppState();
        msfReport({ actionName: 'open checkout page', actionId: 754, targetName: this.shopName, targetId: this.shopId, tagName: 'kharid', eventName: 'page view' })
        rsa.addModal({ id: 'edameye_farayande_kharid', position: 'fullscreen', body: { render: () => <Shipping shopId={this.shopId} shopName={this.shopName} /> }, header: { title: 'ادامه فرایند خرید' } })
    }
    sabt = async (obj) => {
        //obj => { address, SettleType, PaymentTime, DeliveryType, PayDueDate }
        let { baseUrl } = this.getAppState();
        let body = await this.getOrderBody(obj)
        let res = await Axios.post(`${baseUrl}/BOne/AddNewOrder`, body);
        if (res.data.isSuccess) {
            try { return { orderNumber: res.data.data[0].docNum } }
            catch {
                console.log('5567', res)
                return 'خطا در محاسبه result:res.data.data[0].docNum برای مشاهده ریسپانس خروجی 5567 در کنسول را بررسی کنید'
            }
        }
        else { return res.data.message }
    }
    pardakht = async (obj) => {
        //obj => { address, SettleType, PaymentTime, DeliveryType, PayDueDate }
        let { baseUrl } = this.getAppState();
        let body = await this.getOrderBody(obj)
        let res = await Axios.post(`${baseUrl}/BOne/AddNewOrder`, body);
        let registredOrder;
        try { registredOrder = res.data.data[0] }
        catch {
            console.error('BOne/AddNewOrder not compatible response', res)
            return 'BOne/AddNewOrder not compatible response'
        }
        let amounts = await this.getAmounts(obj, 'payment');
        let result = await Axios.post(`${baseUrl}/payment/request`, {
            "Price": Math.round(amounts.payment),
            "IsDraft": registredOrder.isDraft,
            "DocNum": registredOrder.docNum,
            "DocEntry": registredOrder.docEntry,
            "CallbackUrl": baseUrl === 'https://retailerapp.bbeta.ir/api/v1' ? 'https://uiretailerapp.bbeta.ir/' : 'https://bazar.miarze.com/'
        });
        if (result.data.isSuccess) { window.location.href = result.data.data }
        else { return result.data.message }
    }
    getOrderBody = async ({ PaymentTime, DeliveryType, PayDueDate, address, giftCodeInfo, discountCodeInfo }) => {
        let appState = this.getAppState();
        let { userInfo, b1Info, actionClass } = appState;
        let DiscountList = actionClass.getCodeDetails({ giftCodeInfo, discountCodeInfo })
        let marketingLines;

        if (this.shopId === 'Bundle') { 
            let res = await this.getCartVariants()
            marketingLines = res.bundleMarketingLines; 
        }
        else {
            let res = await this.getCartVariants(); 
            marketingLines = res.marketingLines; 
        }
        let SettleType = actionClass.getSettleType(PayDueDate)
        return {
            "DiscountList": DiscountList,
            "marketdoc": {
                "DiscountList": DiscountList,
                "DocType": this.shopId === 'Bundle' ? 17 : undefined,
                "CardCode": userInfo.cardCode,
                "CardGroupCode": b1Info.customer.groupCode,
                "MarketingLines": marketingLines,
                "DeliverAddress": address,
                "marketingdetails": { Campaign: this.CampaignId }
            },
            SettleType, PaymentTime, DeliveryType, PayDueDate
        }
    }
    getPaymentButtonText = (shippingOptions: I_shippingOptions) => {
        if (this.shopId === 'Bundle') { return shippingOptions.SettleType !== 2 ? 'پرداخت' : 'ثبت' }
        else { return 'ارسال برای ویزیتور' }
    }
    hasCartError = ()=>{
        let {actionClass} = this.getAppState();
        if(this.itemType !== 'Taxon'){return false}
        let cartTab = actionClass.getCartShop(this.shopId) as I_cartShop_taxon;
        if(!cartTab){return false}
        for(let taxonId in cartTab.taxons){
            let cartTaxon:I_cartTaxon = cartTab.taxons[taxonId];
            let {hasError} = cartTaxon;
            if(hasError){return true}   
        }
        return false
    }
    renderCartFactor = async (button?:boolean) => {
        let {actionClass} = this.getAppState();
        let res = await this.getAmounts(undefined, 'cart');
        let { payment } = res;
        let hasError = this.hasCartError();
        return (
            <RVD
                layout={{
                    size: 72, className: "bgFFF p-h-12 theme-box-shadow",
                    row: [
                        {
                            flex: 1,
                            column: [
                                { flex: 1 },
                                { align: "v", html: "مبلغ قابل پرداخت", className: "theme-medium-font-color fs-12" },
                                {
                                    row: [
                                        { align: "v", html: SplitNumber(payment), className: "theme-dark-font-color fs-20 bold" },
                                        { size: 4 },
                                        { align: "v", html: " ریال", className: "theme-dark-font-color fs-12" }
                                    ]
                                },
                                { flex: 1 },
                            ],
                        },
                        {
                            html: () => (
                                <button
                                    //disabled={!!hasError}
                                    onClick={() => {
                                        if(hasError){
                                            actionClass.fixCartByPricing(this.shopId)
                                        }
                                        else {
                                            let { rsa } = this.getAppState();
                                            rsa.removeModal('all');
                                            this.edameye_farayande_kharid()
                                        }
                                    }}
                                    className={hasError?"button-3":"button-2"} style={{ height: 36, padding: '0 12px' }}
                                >{hasError?'اصلاح سبد خرید':'ادامه فرایند خرید'}</button>
                            ),
                            align: "v"
                        },
                    ],
                }}
            />
        )
    }
}
type I_CategoryView = { shopId:string,billboard?: string, description?: string, renderItem: Function, items: (I_product | I_bundle_taxon | I_taxon)[], itemType: 'Product' | 'Taxon' | 'Bundle' }
function CategoryView(props: I_CategoryView) {
    let {Shop,cart}:I_app_state = useContext(appContext);
    let [searchValue, setSearchValue] = useState<string>('')
    let { billboard, description, renderItem, items,shopId } = props
    let [factor, setFactor] = useState<React.ReactNode>()
    async function getFactor(){
        let factor = await Shop[shopId].renderCartFactor();
        setFactor(factor);
    }
    useEffect(() => {
        getFactor()
    }, [cart])
    
    function search_layout() {
        return { html: <SearchBox value={searchValue} onChange={(searchValue) => setSearchValue(searchValue)} /> }
    }
    function banner_layout() {
        if (!billboard) { return false }
        return { html: <img src={billboard} alt='' width='100%' /> }
    }
    function description_layout() {
        if (!description) { return false }
        return { html: <pre className='category-view-description'>{description}</pre>,className:'of-visible' }
    }
    function products_layout() {
        return { gap: 12, column: getProductsBySearch().map((product, index) => product_layout(product, index)) }
    }
    function product_layout(product, index) {
        if (searchValue && product.name.indexOf(searchValue) === -1) { return false; }
        return { html: renderItem(product, index), className: 'of-visible' }
    }
    function getProductsBySearch() {
        return items.filter((o) => !searchValue || o.name.indexOf(searchValue) !== -1)
    }
    function body_layout() {
        return { flex: 1, className: 'ofy-auto m-b-12',column: [banner_layout(), description_layout(), products_layout()] }
    }
    function payment_layout() {
        if (!factor) { return false }
        return { html: factor }
    }
    return (<RVD layout={{ className: 'theme-popup-bg', column: [search_layout(), body_layout(),payment_layout()] }} />)
}
type I_TaxonCard = {
    taxon: I_taxon, shopId: string, shopName: string, renderIn: I_renderIn,
    renderCard: (product: I_product, index: number) => React.ReactNode,
    getProducts: () => Promise<I_product[]>
}
function TaxonCard(props: I_TaxonCard) {
    let { Shop,actionClass }: I_app_state = useContext(appContext);
    let storage = AIOStorage('taxonCardToggle');
    let { taxon, shopId, renderIn, renderCard } = props;
    let [open, setOpen] = useState<boolean>(storage.load({ name: 'toggle' + taxon.id, def: false }))
    let [products, setProducts] = useState<I_product[]>([])
    async function getProducts() {
        if (open && !products.length) { 
            let products = await props.getProducts();
            setProducts(products) 
        }
    }
    useEffect(() => { getProducts() }, [open])
    async function onClick(e) { e.stopPropagation(); setOpen(!open); storage.save({ name: 'toggle' + taxon.id, value: !open }) }
    function name_layout() { return { html: taxon.name, flex: 1, align: 'v' } }
    function icon_layout() { return { size: 36, align: 'vh', html: <Icon path={open ? mdiChevronDown : mdiChevronLeft} size={.8} /> } }
    function groupDiscount_layout() {
        let cartTab = actionClass.getCartShop(shopId) as I_cartShop_taxon;
        if (!cartTab) { return false }
        let taxonIds = Object.keys(cartTab.taxons);
        let notHasErrors = taxonIds.filter((taxonId) => !cartTab.taxons[taxonId].hasError)
        let cartTaxon:I_cartTaxon = cartTab.taxons[taxon.id]
        if(cartTaxon && cartTaxon.hasError){return false}
        return {
            align: 'v', className: 'taxon-card-group-discount',
            row:[
                {html:`${0.5 * notHasErrors.length} %`,className:'discount-percent',style:{background:'orange'},size:36,align:'vh'},
                { html: `تخفیف گروه کالا`}
            ]
        }
        return 
    }
    function header_layout() { return { className:'taxon-card-header',onClick, row: [icon_layout(), name_layout()] } }
    function products_layout() { 
        if(!open){return false}
        return { 
            className:'p-6 of-visible',
            column: products.map((product: I_product, index: number) => {
                if(renderIn === 'cart' || renderIn === 'shipping'){if(!Shop[shopId].isProductInCart(product.id,taxon.id)){return false}}
                return product_layout(product, index)
            }) 
        } 
    }
    function product_layout(product: I_product, index: number) { return { className:'of-visible',html: renderCard(product, index) } }
    function rangeItem_layout(type: 'min' | 'max') {
        return {
            style: { color: type === 'min' ? 'red' : 'green' },
            row: [
                { html: <Icon path={type === 'min' ? mdiArrowDown : mdiArrowUp} size={0.7} />, align: 'vh', size: 16},
                { html: `${type === 'min' ? 'حداقل' : 'حداکثر'} مبلغ ${SplitNumber(taxon[type])} ریال`, align: 'v' },
            ]
        }
    }
    function range_layout() { return { align: 'v', className: 'taxon-card-range', row: [rangeItem_layout('min'),{flex:1}, rangeItem_layout('max')] } }
    function footer_layout(){
        return {
            className:'taxon-card-footer',column:[groupDiscount_layout(), range_layout()]
        }
    }
    return (
        <RVD
            layout={{
                className: 'taxon-card theme-box-shadow',
                column: [header_layout(), products_layout(), footer_layout()]
            }}
        />
    )
}
type I_RegularCard = {
    product: I_product, shopId: string,renderIn: I_renderIn, index: number, loading?: boolean,
    onClick: (product: I_product) => Promise<I_product>, type?: 'horizontal' | 'vertical'
}
function RegularCard(props: I_RegularCard) {
    let { Shop, cart }: I_app_state = useContext(appContext);
    let { shopId, renderIn, index, loading, onClick, type = 'horizontal' } = props;
    let [cartVariants,setCartVariants] = useState<I_cartVariant[]>([])
    async function getCartVariants(){
        let {product} = props;
        let {category} = product;
        let {taxonId} = category;
        let {cartVariants} = await Shop[shopId].getCartVariants({taxonId,productId:product.id});
        setCartVariants(cartVariants)
    }
    useEffect(()=>{getCartVariants()},[cart])
    let [mounted, setMounted] = useState<boolean>(false)
    let [product, setProduct] = useState<I_product>(props.product)
    let [isLamp] = useState(product.name.indexOf('لامپ') !== -1)
    function image_layout(size) {
        let { images = [] } = product;
        return { size, align: 'vh', html: <img src={images[0] || NoSrc as string} width={'100%'} alt='' /> }
    }
    function variants_layout() {
        if (!cartVariants.length) { return false }
        let column = cartVariants.map((p: I_cartVariant) => variant_layout(p))
        return { gap: 3, style: { background: '#fff' }, column,onClick:(e)=>e.stopPropagation() }
    }
    function variant_layout(cartVariant: I_cartVariant) {
        console.log(product)
        let { count, variantId, error } = cartVariant;
        return {
            className: 'regular-card-variant',
            column: [
                {row: [{ flex: 1, align: 'v', column: [variantLabels_layout(variantId), variantAmount_layout(count)] },countButton_layout(variantId)]},
                variantError_layout(error)
            ]
        }
    }
    function countButton_layout(variantId) {
        return { html: (<CartButton renderIn={renderIn} product={product} variantId={variantId} />), align: 'vh' }
    }
    function variantError_layout(error?: string) {
        if (!error) { return false }
        let icon = <Icon path={mdiInformation} size={0.6} />;
        return { align: 'v', className: 'regular-card-variant-error', row: [{ html: icon, size: 20, align: 'vh' }, { html: error }] }
    }
    function variantAmount_layout(count: number) {
        let unitTotal = product.FinalPrice * count
        if (isNaN(unitTotal)) { return false }
        return {
            align: 'v', gap: 3,
            row: [
                { html: `جمع ${count} عدد`, className: 'theme-light-font-color fs-10' },
                { html: SplitNumber(unitTotal), className: 'theme-dark-font-color fs-12 bold' },
                { html: 'ریال', className: 'theme-light-font-color fs-10' }
            ]
        }
    }
    function variantLabels_layout(variantId: string) {
        let { optionTypes, variants } = product;
        let variant = variants.find((o: I_variant) => o.id === variantId)
        let { optionValues } = variant, details = [];
        for (let j = 0; j < optionTypes.length; j++) {
            let { id: optionTypeId, name: optionTypeName, items } = optionTypes[j];
            let optionValueId = optionValues[optionTypeId];
            let optionValueName = items[optionValueId]
            details.push([optionTypeName, optionValueName]);
        }
        return { align: 'v', className: 'theme-medium-font-color fs-10 bold', gap: 6, gepHtml: () => '-', row: details.map(([key, value]) => { return variantLabel_layout(key, value) }) }
    }
    function variantLabel_layout(key: string, value: string = '') {
        //return { html: `${key} : ${value}` }
        let before;
        if (value === 'زرد') { before = <img src={zardsrc as string} width='20' alt='' /> }
        else if (value === 'قرمز') { before = <img src={ghermezsrc as string} width='20' alt='' /> }
        else if (value === 'نارنجی') { before = <img src={narenjisrc as string} width='20' alt='' /> }
        else if (value === 'سبز') { before = <img src={sabzsrc as string} width='20' alt='' /> }
        else if (value === 'آبی') { before = <img src={abisrc as string} width='20' alt='' /> }
        else if (value === 'یخی') { before = <img src={yakhisrc as string} width='20' alt='' /> }
        return { gap: 2, align: 'v', row: [{ show: !!before, html: () => before }, { html: value }] }
    }
    function title_layout() {return { html: Shop[shopId].shopName, className: 'fs-10', style: { color: 'rgb(253, 185, 19)' } }}
    function name_layout(fontSize) {return { html: product.name, className: `fs-${fontSize} theme-medium-font-color bold`, style: { whiteSpace: 'normal', textAlign: 'right' } }}
    function discount_layout() {
        let { inStock, Price, B1Dscnt = 0, CmpgnDscnt = 0, PymntDscnt = 0 } = product;
        if (!Price || !inStock) { return false }
        return {
            gap: 4, className: 'p-h-6',
            row: [
                { show: !!B1Dscnt || !!CmpgnDscnt || !!PymntDscnt, html: <del>{SplitNumber(Price)}</del>, className: 'fs-12 theme-light-font-color' },
                dps_layout()
            ]
        }
    }
    function dps_layout(){
        let { B1Dscnt = 0, CmpgnDscnt = 0, PymntDscnt = 0 } = product;
        return {gap: 3,row: [dp_layout(B1Dscnt,'#FFD335'),dp_layout(CmpgnDscnt,'#ffa835'),dp_layout(PymntDscnt,'#ff4335')]}
    }
    function dp_layout(percent:number,color){return !percent?false:{ html: <div className='discount-percent' style={{ background: color}}>{percent + '%'}</div> }}
    function description_layout() {return {html: product.description, className: 'fs-9',style: {whiteSpace: 'nowrap',overflow: 'hidden'}}}
    function notExist_layout() {return { row: [{ flex: 1 }, { html: 'نا موجود', className: 'colorD83B01 bold fs-12' }, { size: 12 }] }}
    function price_layout() {
        let { FinalPrice, inStock } = product;
        if (!inStock || !FinalPrice) { return false }
        return {
            row: [
                { html: SplitNumber(FinalPrice) + ' ریال', className: 'fs-12 theme-dark-font-color bold p-h-6' }
            ]
        }
    }
    useEffect(() => {
        setTimeout(() => {
            setMounted(true)
        }, (index || 0) * 100 + 100)
    }, [])
    function horizontal_layout() {
        return (
            <RVD
                loading={loading}
                layout={{
                    className: 'theme-card-bg theme-box-shadow gap-no-color rvd-rotate-card regular-card' + (mounted ? ' mounted' : ''),
                    onClick: async () => {
                        //با کلیک روی پروداکت اطلاعات این پروداکت تکمیل میشه پس تکمیل شدشو می گیریم و استیت این کامپوننت رو آپدیت می کنیم
                        let newProduct: I_product = await onClick(product);
                        setProduct(newProduct)
                    },
                    style: { border: '1px solid #eee' },
                    column: [
                        {
                            row: [
                                image_layout(116),
                                {
                                    flex: 1,
                                    column: [
                                        { size: 6 },
                                        title_layout(),
                                        name_layout(12),
                                        !product.description?false:description_layout(),
                                        { flex: 1 },
                                        { row: [{ flex: 1 }, discount_layout()] },
                                        product.inStock?false:notExist_layout(),
                                        { row: [{ flex: 1 }, price_layout()] },
                                        { size: 6 }
                                    ]
                                }
                            ]
                        },
                        variants_layout()
                    ]
                }}
            />
        )
    }
    function cart_layout() {
        return (
            <RVD
                loading={loading}
                layout={{
                    className: 'theme-card-bg theme-box-shadow gap-no-color rvd-rotate-card regular-card' + (mounted ? ' mounted' : ''),
                    onClick: async () => {
                        //با کلیک روی پروداکت اطلاعات این پروداکت تکمیل میشه پس تکمیل شدشو می گیریم و استیت این کامپوننت رو آپدیت می کنیم
                        let newProduct: I_product = await onClick(product);
                        setProduct(newProduct)
                    },
                    style: { border: '1px solid #eee' },
                    column: [
                        {
                            row: [
                                image_layout(54),
                                {size:4},
                                {
                                    flex: 1,
                                    column: [
                                        { size: 6 },
                                        name_layout(10),
                                        !product.description?false:description_layout(),
                                        { flex: 1 },
                                        {align:'v',row:[price_layout(),{flex:1},discount_layout()]},
                                        product.inStock?false:notExist_layout(),
                                        { size: 6 }
                                    ]
                                }
                            ]
                        },
                        variants_layout()
                    ]
                }}
            />
        )
    }
    function vertical_layout() {
        let { images = [], name } = product;
        return (
            <RVD
                loading={loading}
                layout={{
                    className: 'theme-card-bg theme-box-shadow theme-border-radius of-visible w-168 h-288 fs-14 br-12',
                    onClick,
                    column: [
                        { size: 140, align: 'vh', html: <img src={(images[0] || NoSrc) as string} width={'100%'} style={{ width: 'calc(100% - 24px)', height: '100%', borderRadius: 8 }} alt='' />, style: { padding: 6, paddingBottom: 0 } },
                        { html: name, className: 'fs-12 p-v-6 p-h-12 theme-medium-font-color bold', style: { whiteSpace: 'normal' } },
                        //name_layout(),
                        { flex: 1 },
                        { row: [{ flex: 1 }, discount_layout()] },
                        price_layout(),
                        notExist_layout(),
                        { size: 12 }
                    ]
                }}
            />
        )
    }
    if(renderIn === 'cart' || renderIn === 'shipping'){
        return cart_layout()
    }
    return type === 'horizontal' ? horizontal_layout() : vertical_layout()

}
type I_BundleCard = { taxon: I_bundle_taxon, renderIn: I_renderIn, index?: number, onClick?: Function }
function BundleCard(props: I_BundleCard) {
    let { Shop,actionClass }: I_app_state = useContext(appContext)
    let { taxon, renderIn, index = 0, onClick } = props;
    let [mounted, setMounted] = useState<boolean>(false)
    function title_layout() {
        return {
            row: [
                { html: Shop.Bundle.shopName, style: { color: '#FDB913' }, className: 'fs-12 bold', align: 'v' },
                { size: 3 },
                { flex: 1, html: (<div style={{ height: 2, width: '1100%', background: '#FDB913' }}></div>), align: 'v' }
            ]
        }
    }
    function image_layout() {
        return {
            flex: 1, html: <img src={taxon.image} alt='' width='100%' className='br-12' />
        }
    }
    function count_layout() {
        let count;
        try {
            let cartTab = actionClass.getCartShop('Bundle') as I_cartShop_bundle;
            count = cartTab.taxons[taxon.id].count
        }
        catch { count = 0 }
        if (!count) { return false }
        return { align: 'vh', html: `${count} بسته`, className: 'fs-12 bold', style: { color: '#0008ff' } }
    }
    function name_layout() {
        return { html: taxon.name, className: 'fs-14 theme-dark-font-color bold', style: { textAlign: 'right' } }
    }
    function detail_layout() {
        if (renderIn === 'cart') {
            let cartTab: I_cartShop_bundle = actionClass.getCartShop('Bundle') as I_cartShop_bundle;
            if (!cartTab) { return false }
            let cartTaxon = cartTab.taxons[taxon.id];
            if (!cartTaxon) { return false }
            let ps = [];
            for (let i = 0; i < taxon.products.length; i++) {
                let product = taxon.products[i];
                let cartProduct: I_cartShop_bundle_product = cartTaxon.products[product.id];
                let str = `${product.name} ( `;
                for (let j = 0; j < product.variants.length; j++) {
                    let variant = product.variants[j];
                    let cartVariant: I_cartShop_bundle_variant = cartProduct.variants[variant.id];
                    let count = cartVariant.count;
                    str += `${variant.name} : ${count} واحد${j < product.variants.length - 1 ? ' - ' : ''}`;
                }
                str += ` )`
                ps.push(str)
            }
            return {
                html: ps.join('***'), className: 'fs-12 theme-medium-font-color', style: { textAlign: 'right' }
            }
        }
        let ps = [];
        for (let i = 0; i < taxon.products.length; i++) {
            let product = taxon.products[i];
            let str = `${product.qty} عدد ${product.name}`;
            ps.push(str)
        }
        return {
            html: ps.join('***'), className: 'fs-12 theme-medium-font-color', style: { textAlign: 'right' }
        }
    }
    function price_layout() {
        return { size: 36, row: [{ flex: 1, className: 'fs-14 bold theme-dark-font-color', align: 'v', row: [{ flex: 1 }, { html: `${SplitNumber(taxon.price)} ریال` }] }] }
    }
    useEffect(() => {
        setTimeout(() => setMounted(true), index * 100 + 100)
    }, [])
    return (
        <RVD
            layout={{
                className: 'theme-box-shadow theme-card-bg theme-border-radius theme-gap-h p-12 of-visible rvd-rotate-card' + (mounted ? ' mounted' : ''),
                onClick,
                column: [
                    title_layout(), { size: 6 },
                    {
                        gap: 12, row: [
                            { size: 114, column: [image_layout(), count_layout()] },
                            { flex: 1, column: [name_layout(), { size: 6 }, detail_layout(), { flex: 1 }, price_layout()] }
                        ]
                    },
                ]
            }}
        />
    )
}
type I_RegularPage = { product: I_product, shopId: string }
function RegularPage(props: I_RegularPage) {
    let { actionClass, Shop,cart }: I_app_state = useContext(appContext);
    let { product, shopId } = props;
    let [selectedVariant, setSelectedVariant] = useState<I_variant | undefined>()
    let [selectedDic, setSelectedDic] = useState<I_variant_optionValues | undefined>()
    let [existOptionValueNames, setExistOptionValueNames] = useState<string[]>([])
    let [variantOptions, setVariantOptions] = useState<{ text: string, value: any }[]>([])
    let [showDetails, setShowDetails] = useState<boolean>(false)
    let [srcIndex, setSrcIndex] = useState<number>(0)
    let [cartVariants,setCartVariants] = useState<I_cartVariant[]>([])
    async function getCartVariants(){
        let {category} = product;
        let {taxonId} = category;
        let {cartVariants} = await Shop[shopId].getCartVariants({ taxonId,productId: product.id })
        setCartVariants(cartVariants)
    }
    useEffect(()=>{getCartVariants()},[cart])
    let { optionTypes, variants } = product;
    useEffect(() => {
        debugger
        let { existOptionValueNames, variantOptions } = getVariants()
        setExistOptionValueNames(existOptionValueNames)
        setVariantOptions(variantOptions)
        let firstVariant: I_variant = product.inStock ? (product.variants.filter((o) => o.inStock)[0]) : undefined;
        let selectedDic: I_variant_optionValues = firstVariant ? { ...firstVariant.optionValues } : undefined;
        setSelectedDic(selectedDic)
        setSelectedVariant(firstVariant)
    }, [])
    function getVariants() {
        let variantOptions = [];
        let existOptionValueNames = []
        for (let i = 0; i < variants.length; i++) {
            let { optionValues, inStock, id } = variants[i];
            if (!inStock) { continue }
            let str = [];
            for (let optionTypeId in optionValues) {
                let optionType = optionTypes.find((o) => o.id === optionTypeId);
                let optionValueId = optionValues[optionTypeId];
                let optionTypeName = optionType.name;
                let optionValueName = optionType.items[optionValueId]
                str.push(optionTypeName + ' : ' + optionValueName)
                existOptionValueNames.push(optionValueName);
            }
            variantOptions.push({ text: str.join(' -- '), value: id })
        }
        return { existOptionValueNames, variantOptions }
    }
    function isVariantMatchBySelected(variant: I_variant, newSelectedDic: I_variant_optionValues) {
        let { optionValues } = variant;
        for (let optionTypeId in newSelectedDic) {
            if (optionValues[optionTypeId] !== newSelectedDic[optionTypeId]) { return false }
        }
        return true;
    }
    function getVariantBySelected(newSelectedDic: I_variant_optionValues) {
        for (let i = 0; i < variants.length; i++) {
            let variant = variants[i];
            if (isVariantMatchBySelected(variant, newSelectedDic)) { return variant }
        }
    }
    function changeOptionType(dic) {
        let newSelectedDic: I_variant_optionValues = { ...selectedDic, ...dic };
        let variant: I_variant = getVariantBySelected(newSelectedDic);
        setSelectedDic(newSelectedDic);
        setSelectedVariant(variant)
    }
    function body_layout() {
        let { optionTypes, details } = product;
        return {
            flex: 1, className: "ofy-auto", gap: 12,
            column: [
                image_layout(),
                options_layout(),
                optionTypes_layout(optionTypes),
                details_layout(details),

            ],
        };
    }
    function image_layout() {
        return {
            size: 346, className: "theme-box-shadow theme-card-bg theme-border-radius m-h-12",
            column: [
                { size: 24 },
                {
                    flex: 1, style: { overflow: 'hidden' },
                    childsProps: { align: "vh" },
                    row: [
                        { size: 36, html: getSvg("chevronLeft", { flip: true }) },
                        { flex: 1, html: <img src={product.images[srcIndex]} alt="" height="100%" /> },
                        { size: 36, html: getSvg("chevronLeft") },
                    ],
                },
                { size: 12 },
                { size: 36, html: product.name, className: "fs-14 theme-dark-font-color bold p-h-12" },
                { show:!!selectedVariant,size: 36, html: ()=>"کد کالا : " + selectedVariant.id, className: "fs-12 theme-medium-font-color p-h-12" },
            ]
        };
    }
    function options_layout() {
        if (optionTypes.length < 2) { return false }
        return {
            className: 'theme-card-bg theme-box-shadow theme-border-radius m-h-12', hide_xs: true,
            column: [
                { size: 12 },
                {
                    row: [
                        { html: `(${variantOptions.length}) انتخاب اقلام موجود`, align: 'v', className: 'p-h-12 theme-medium-font-color fs-14 bold', style: { direction: 'ltr' } },
                        { flex: 1 }
                    ]
                },
                {
                    align: 'v', className: 'p-12',
                    html: (
                        <AIOInput
                            type='select' className='product-exist-options'
                            style={{ width: '100%', fontSize: 12 }}
                            options={variantOptions}
                            popover={{ fitHorizontal: true }}
                            value={selectedVariant ? selectedVariant.id : undefined}
                            optionStyle={{ height: 28, fontSize: 12 }}
                            onChange={(value) => changeOptionType(variants.find((o) => o.id === value).optionValues)}
                        />
                    )
                }
            ]
        }
    }
    function optionTypes_layout(optionTypes: I_product_optionType[]) {
        if (!selectedDic) { return { html: '' } }
        return {
            className: "theme-card-bg theme-box-shadow theme-border-radius gap-no-color m-h-12 p-12",
            column: [
                {
                    gap: 6,
                    column: optionTypes.map((optionType: I_product_optionType, i) => {
                        let { items = {} } = optionType;
                        let optionValueIds = Object.keys(items);
                        optionValueIds = optionValueIds.filter((optionValueId) => {
                            let optionValueName = items[optionValueId];
                            return existOptionValueNames.indexOf(optionValueName) !== -1
                        })
                        return {
                            column: [
                                { html: optionType.name, align: "v", className: "fs-12 theme-medium-font-color bold h-24" },
                                { size: 6 },
                                {
                                    className: "ofx-auto", gap: 12,
                                    row: optionValueIds.map((optionValueId) => {
                                        optionValueId = optionValueId.toString();
                                        let optionValueName = items[optionValueId];
                                        let active = selectedDic[optionType.id].toString() === optionValueId;
                                        let className = 'fs-12 p-v-3 p-h-12 br-4 product-option-value' + (active ? ' active' : '');
                                        return { html: optionValueName, align: "vh", className, onClick: () => changeOptionType({ [optionType.id]: optionValueId }) };
                                    })
                                }
                            ]
                        };
                    })
                }
            ]
        };
    }
    function details_layout(details) {
        if (!details) { return false }
        return {
            className: "theme-card-bg theme-box-shadow theme-border-radius p-12 m-h-12",
            column: [
                {
                    size: 36, childsProps: { align: 'v' },
                    onClick: (() => setShowDetails(!showDetails)),
                    className: 'theme-medium-font-color',
                    row: [
                        { size: 24, align: 'vh', html: <Icon path={showDetails ? mdiChevronDown : mdiChevronLeft} size={0.8} /> },
                        { html: 'مشخصات', className: "fs-14 bold" }
                    ]
                },
                {
                    show: !!showDetails,
                    html: () => (
                        <div className='w-100 br-4 of-hidden' style={{ display: "grid", gridTemplateColumns: "auto auto", gridGap: 1 }}>
                            {details.map((o, i) => {
                                if (o[0] === undefined || o[1] === undefined) { return null }
                                let props = { className: "fs-12 theme-medium-font-color p-v-6 p-h-12", style: { background: "#F4F4F4" } };
                                return (<Fragment key={i}><div {...props}>{o[0]}</div><div {...props}>{o[1]}</div></Fragment>);
                            })}
                        </div>
                    )
                }
            ]
        };
    }
    function showCart_layout() {
        if (!cartVariants.length) { return false }
        return {
            onClick: () => actionClass.openPopup('cart', shopId),
            className: 'p-h-12 bgFFF', size: 36, align: 'v',
            row: [
                { html: 'مشاهده سبد خرید', className: 'theme-light-font-color fs-12 bold', align: 'v' },
                { size: 4 },
                { html: <Icon path={mdiChevronLeft} size={0.8} />, align: 'vh', className: 'theme-link-font-color' }
            ]
        }
    }
    function footer_layout() {
        return {
            size: 80, style: { boxShadow: '0 0px 6px 1px rgba(0,0,0,.1)' }, className: "p-h-12 bg-fff",
            row: [
                addToCart_layout(),
                { flex: 1 },
                price_layout()
            ],
        };
    }
    function addToCart_layout() {
        if (!selectedVariant || !selectedVariant.inStock) { return { html: '' } }
        return {
            column: [
                { flex: 1 },
                { html: (<CartButton variantId={selectedVariant.id} product={product} renderIn='product' />) },
                { flex: 1 }
            ]
        }
    }
    function price_layout() {
        if (!selectedVariant || !selectedVariant.inStock) {
            return { column: [{ flex: 1 }, { html: "ناموجود", className: "colorD83B01 bold fs-14" }, { flex: 1 }] };
        }
        let { B1Dscnt, CmpgnDscnt, PymntDscnt } = selectedVariant;
        return {
            column: [
                { flex: 1 },
                {
                    row: [
                        { flex: 1 },
                        { show: !!B1Dscnt || !!CmpgnDscnt || !!PymntDscnt, html: () => <del>{SplitNumber(selectedVariant.Price)}</del>, className: "theme-light-font-color" },
                        { size: 1 },
                        {
                            html: "%" + B1Dscnt, show: !!B1Dscnt,
                            style: { background: "#FDB913", color: "#fff", borderRadius: 8, padding: "0 3px" },
                        },
                        { size: 1 },
                        {
                            html: "%" + CmpgnDscnt, show: !!CmpgnDscnt,
                            style: { background: "#FDB913", color: "#fff", borderRadius: 8, padding: "0 3px" },
                        },
                        { size: 1 },
                        {
                            html: "%" + PymntDscnt, show: !!PymntDscnt,
                            style: { background: "#ff4335", color: "#fff", borderRadius: 8, padding: "0 3px" },
                        }
                    ],
                },
                {
                    row: [
                        { flex: 1 },
                        { html: SplitNumber(selectedVariant.FinalPrice), className: "theme-dark-font-color bold" },
                        { size: 6 },
                        { html: "ریال", className: "theme-dark-font-color bold" },
                    ],
                },
                { flex: 1 },
            ],
        };
    }
    return (<RVD layout={{ className: "theme-popup-bg", gap: 12, column: [body_layout(), showCart_layout(), footer_layout()] }} />);
}
type I_BundlePage = { taxon: I_bundle_taxon }
function BundlePage(props: I_BundlePage) {
    let { actionClass, rsa }: I_app_state = useContext(appContext);
    let { taxon } = props;
    if (typeof taxon.max !== 'number') { taxon.max = Infinity }
    const defaultCartTaxon: I_cartShop_bundle_taxon = { products: {}, count: 0, taxonId: taxon.id, price: taxon.price }
    let [cartTaxon, setCartTaxon] = useState<I_cartShop_bundle_taxon>(JSON.parse(JSON.stringify(defaultCartTaxon)))
    let [submitLoading, setSubmitLoading] = useState<boolean>(false)
    let cartTimeout;
    function setCart(newCartTaxon) {
        let cartTab: I_cartShop_bundle = actionClass.getCartShop('Bundle') as I_cartShop_bundle;
        if (!cartTab) {
            cartTab = { taxons: {}, type: 'Bundle' };
        }
        cartTab.taxons[taxon.id] = newCartTaxon;
        actionClass.setCartShop('Bundle',cartTab)
    }
    function virayeshe_sabad(newCartTaxon: I_cartShop_bundle_taxon, delay?: boolean) {
        //ابتدا استیت خودت رو آپدیت کن سپس استیت سبد در اپ مرکزی رو با تاخیر (برای جلو گیری از لگ زدن) آپدیت کن
        delay = delay === undefined ? true : delay
        setCartTaxon(newCartTaxon);
        clearTimeout(cartTimeout);
        if (!delay) { setCart(newCartTaxon) }
        else { cartTimeout = setTimeout(() => setCart(newCartTaxon), 1000) }
    }
    useEffect(() => {
        try {
            let cartTab = actionClass.getCartShop('Bundle') as I_cartShop_bundle;
            let cartTaxon: I_cartShop_bundle_taxon = cartTab.taxons[taxon.id];
            if (cartTaxon) { setCartTaxon(cartTaxon) }
        }
        catch { }
    }, [])
    function hazfe_taxon_az_sabad() {
        setCartTaxon(JSON.parse(JSON.stringify(defaultCartTaxon)))
        actionClass.removeCartBundleTaxon(taxon)
    }
    function virayeshe_taxon_dar_sabad(newCartTaxon: I_cartShop_bundle_taxon, delay?: boolean) {
        delay = delay === undefined ? true : delay
        for (let i = 0; i < taxon.products.length; i++) {
            let product = taxon.products[i];
            let { variants, qty, price } = product;
            let cartProduct = newCartTaxon.products[product.id];
            //اطلاعات پروداکت در کارت را در صورت عدم وجود بساز
            if (!cartProduct) { newCartTaxon.products[product.id] = { variants: {}, qty, price } }
            if (variants.length < 2) {
                let { id, step } = variants[0];
                //در حالت تک واریانتی تعداد واریانت را برابر مقدار نهایی قرار بده
                newCartTaxon.products[product.id].variants[id] = { count: qty, step, variantId: id }
            }
            else {
                for (let i = 0; i < variants.length; i++) {
                    let { id, step } = variants[i];
                    //به دلیل پیچیدگی ماجرا در چند واریانتی تعداد همه واریانت ها رو صفر کن تا کاربر دوباره تعداد هر کدوم رو ست کنه
                    newCartTaxon.products[product.id].variants[id] = { count: 0, step, variantId: id }
                }
            }
        }
        virayeshe_sabad(newCartTaxon, delay)
    }
    function taghire_tedade_baste(dir: 1 | -1) {
        let newCartTaxon: I_cartShop_bundle_taxon = JSON.parse(JSON.stringify(cartTaxon))
        newCartTaxon.count += dir;
        if (newCartTaxon.count < 0) { newCartTaxon.count = 0 }
        if (newCartTaxon.count > taxon.max) { newCartTaxon.count = taxon.max }
        if (!newCartTaxon.count) { hazfe_taxon_az_sabad() }
        else { virayeshe_taxon_dar_sabad(newCartTaxon, false) }
    }
    function image_layout() {
        return {
            size: 346, className: "theme-box-shadow theme-card-bg theme-border-radius m-h-12",
            column: [
                { size: 24 },
                { flex: 1, html: <img src={taxon.image} alt="" height="100%" />, align: 'vh' },
                { size: 12 },
                { size: 36, html: taxon.name, className: "fs-14 theme-dark-font-color bold p-h-12" },
                { size: 36, html: "کد کالا : " + taxon.id, className: "fs-12 theme-medium-font-color p-h-12" },
            ]
        };
    }
    function taxonDetails_layout() {
        return {
            className: 'theme-card-bg m-h-12 p-12 theme-border-radius theme-box-shadow',
            column: [
                { html: `اقلام داخل هر یک بسته`, align: 'v', className: 'theme-dark-font-color fs-14 bold' },
                { size: 12 },
                {
                    column: taxon.products.map(({ qty, name }) => {
                        return {
                            gap: 6, row: [
                                { align: 'vh', html: <img src={bundleBoxSrc as string} alt='' width='30' /> },
                                { align: 'v', html: `تعداد ${qty} عدد ${name}`, className: 'theme-medium-font-color fs-12' }
                            ]
                        }
                    })
                }
            ]
        }
    }
    function count_layout() {
        return {
            className: 'theme-card-bg theme-box-shadow theme-border-radius m-h-12 p-12',
            column: [taxonCount_layout(), products_layout()]
        }
    }
    function taxonCount_layout() {
        return {
            align: 'v', className: 'p-12 br-6 m-b-12', style: { background: '#DCE1FF' }, gap: 12,
            column: [
                {
                    gap: 6, row: [
                        { align: 'v', html: `تعداد بسته را مشخص کنید`, className: 'theme-dark-font-color fs-14 bold' },
                        { show: taxon.max !== Infinity, align: 'v', html: `( سقف ${taxon.max} بسته )`, className: 'theme-dark-font-color fs-10' },
                    ]
                },
                { gap: 6, row: [countButton_layout(1), { size: 48, html: cartTaxon.count, align: 'vh' }, countButton_layout(-1)] }
            ]
        }
    }
    function countButton_layout(dir: 1 | -1) {
        let path = dir < 0 ? mdiMinus : mdiPlus;
        let opacity = 1;
        if (dir > 0 && cartTaxon.count >= taxon.max) { opacity = 0.4 }
        if (dir < 0 && cartTaxon.count <= 0) { opacity = 0.4 }
        return {
            size: 40, html: <Icon path={path} size={1} />, align: 'vh', onClick: () => taghire_tedade_baste(dir),
            style: { background: '#3B55A5', height: 40, color: '#fff', borderRadius: 6, opacity }
        }
    }
    function productSingleVariant_layout(product: I_bundle_product) {
        return {
            style: { color: '#107C10' },
            row: [
                { html: <Icon path={mdiCheckCircle} size={0.7} /> },
                { size: 6 },
                { html: `${product.qty + ' واحد'} ${product.name} انتخاب شده`, align: 'v', className: 'fs-14 bold' }
            ]
        }
    }
    function getFillCount(product: I_bundle_product): number {
        let selectedCount: number = 0;
        let cartProduct = cartTaxon.products[product.id];
        if (cartProduct) {
            for (let variantId in cartProduct.variants) {
                let cartVariant = cartProduct.variants[variantId];
                selectedCount += cartVariant.count
            }
        }
        return selectedCount;
    }
    function products_layout() {
        if (!cartTaxon.count) { return false }
        return { column: taxon.products.map((product: I_bundle_product) => product_layout(product)) }
    }
    function product_layout(product: I_bundle_product) {
        if (product.variants.length < 2) { return productSingleVariant_layout(product) }
        //بر حسب تعداد بسته انتخابی مجموع تعداد انتخاب شده ی واریانت ها باید برابر این مقدار باشد 
        let totalCount: number = cartTaxon.count * product.qty;
        //تعدادی که تعیین نوع شده است
        let fillCount: number = getFillCount(product);
        return {
            column: [
                product_layout_label(product),
                product_layout_sliders(product, totalCount, fillCount),
                product_layout_message(product, totalCount, fillCount),
                { html: <div style={{ height: 6, background: '#f8f8f8', width: '100%' }}></div> }
            ]
        }
    }
    function product_layout_label(product: I_bundle_product) {
        let { qty } = product;
        return {
            className: 'm-b-6',
            column: [
                {
                    align: 'v', className: 'm-b-6',
                    row: [
                        { size: 30, align: 'vh', html: <Icon path={mdiInformation} size={0.7} />, style: { color: 'dodgerblue' } },
                        { html: `نوع کالاها در ${cartTaxon.count + ' بسته ' + product.name} ${`( ${qty * cartTaxon.count} عدد )`} را انتخاب کنید`, align: 'v', className: 'theme-dark-font-color fs-12 bold' }
                    ]
                },
                {
                    html: `با حرکت دادن زبانه ها تعداد ${qty * cartTaxon.count} واحد از انواع این محصول را انتخاب کنید`, className: 'fs-10 bold p-h-24 theme-light-font-color'
                }
            ]
        }
    }
    function product_layout_sliders(product: I_bundle_product, totalCount: number, fillCount: number) {
        return { column: product.variants.map((variant: I_bundle_variant) => slider_layout(product, variant, totalCount, fillCount)) }
    }
    function product_layout_message(product: I_bundle_product, totalCount: number, fillCount: number) {
        let isFull = totalCount === fillCount;
        return {
            style: { color: isFull ? '#107C10' : '#d0000a' }, size: 48, align: 'v',
            row: [
                { size: 30, html: <Icon path={isFull ? mdiCheckCircle : mdiAlertCircle} size={0.7} />, align: 'vh' },
                { html: `${fillCount + ' عدد'} از ${(product.qty * cartTaxon.count) + ' عدد'} کالا تعیین نوع شده`, align: 'v', className: 'fs-12 bold' }
            ]
        }
    }
    function slider_layout(product: I_bundle_product, variant: I_bundle_variant, totalCount: number, fillCount: number) {
        let newCartTaxon: I_cartShop_bundle_taxon = JSON.parse(JSON.stringify(cartTaxon));
        let cartProduct = newCartTaxon.products[product.id];
        let { id: variantId, name: variantName, step } = variant;
        //تعداد انتخاب شده ی این واریانت در سبد خرید
        let count: number = cartProduct.variants[variantId].count;
        //حد اکثر تعدادی که این واریانت در این لحظه می تواند بگیرد
        let max: number = count + (totalCount - fillCount);
        let onChange: ((count: number) => void) = (count) => {
            cartProduct.variants[variantId].count = count;
            virayeshe_sabad(newCartTaxon)
        }
        let sliderProps = { totalCount, max, onChange, count, variantName, step }
        return { html: (<BundleSlider key={product.id + variantId} {...sliderProps} />) }
    }
    function footer_layout() {
        return {
            style: { boxShadow: '0 0px 6px 1px rgba(0,0,0,.1)' }, className: "p-12 bg-fff", align: 'v',
            row: [
                {
                    show: !!cartTaxon.count, className: 'theme-link-font-color bold',
                    html: (<button disabled={!!submitLoading} className='button-2' onClick={() => edameye_farayande_kharid()}>ادامه فرایند خرید</button>)
                },
                { flex: 1 },
                {
                    align: 'v', className: 'p-6',
                    column: [
                        {
                            gap: 6, align: 'v', className: 'fs-10 theme-medium-font-color theme-link-font-color',
                            row: [
                                { flex: 1 },
                                { html: "قیمت هر یک بسته", align: 'v' },
                                { html: `${SplitNumber(taxon.price)}`, className: "bold fs-12" },
                                { html: `ریال` },
                            ]
                        },
                        {
                            gap: 6, align: 'v', className: 't-a-left',
                            row: [
                                { flex: 1 },
                                { html: "مجموع", align: 'v', className: 'fs-10 theme-medium-font-color' },
                                { html: `${SplitNumber(taxon.price * (cartTaxon.count))}`, className: "theme-dark-font-color bold fs-20" },
                                { html: `ریال`, className: "theme-light-font-color fs-10" },
                            ]
                        }
                    ]
                }
            ]
        }
    }
    function fixCart(): boolean {
        let hasError = false;
        for (let i = 0; i < taxon.products.length; i++) {
            let product: I_bundle_product = taxon.products[i];
            let totalCount = cartTaxon.count * product.qty;
            let fillCount = getFillCount(product);
            let emptyCount = totalCount - fillCount;
            if (!emptyCount) { continue }
            hasError = true;
            let newCartTaxon: I_cartShop_bundle_taxon = JSON.parse(JSON.stringify(cartTaxon))
            //تنظیم واریانتی که در صورت خالی بودن باید مقادیر به آن اضافه شود
            let firstVariant = product.variants[0];
            newCartTaxon.products[product.id].variants[firstVariant.id].count += emptyCount;
            virayeshe_sabad(newCartTaxon)
        }
        return hasError;
    }
    function edameye_farayande_kharid() {
        let hasError = fixCart();
        if (hasError) {
            setSubmitLoading(true)
            rsa.addSnakebar({
                text: 'تعداد سبد محصولات این بسته به طور اتوماتیک پر شد', type: 'info', onClose: false
            })
            setTimeout(() => {
                setSubmitLoading(false);
                actionClass.openPopup('cart', 'Bundle');
            }, 2000)
        }
        else { actionClass.openPopup('cart', 'Bundle'); }
    }
    function header_layout() {
        return {
            size: 48, align: 'v', className: 'p-r-12',
            row: [
                { html: taxon.name, className: 'fs-12 bold', flex: 1 },
                {
                    html: <Icon path={mdiClose} size={1} />, size: 48, align: 'vh', onClick: () => {
                        let res = fixCart();
                        if (res) {
                            rsa.addSnakebar({
                                text: 'تعداد سبد محصولات این بسته به طور اتوماتیک پر شد', type: 'info', onClose: false
                            })
                        }
                        else {
                            rsa.removeModal();
                        }

                    }
                }
            ]
        }
    }
    function body_layout() {
        return { flex: 1, className: "ofy-auto m-v-12", gap: 12, column: [image_layout(), taxonDetails_layout(), count_layout()] }
    }
    return (<RVD layout={{ className: "theme-popup-bg", column: [header_layout(), body_layout(), footer_layout()] }} />);
}
type I_BundleSlider = { count: number, variantName: string, totalCount: number, onChange: any, max: number, step: number }
function BundleSlider(props: I_BundleSlider) {
    let { variantName, totalCount, onChange = () => { }, max, step, count } = props;
    let percent = (count / totalCount * 100).toFixed(0);
    let image;
    if (variantName === 'آفتابی') { image = aftabisrc }
    else if (variantName === 'مهتابی') { image = mahtabisrc }
    else if (variantName === 'یخی') { image = yakhisrc }

    return (
        <RVD
            layout={{
                column: [
                    { html: variantName, align: 'v', className: 'theme-medium-font-color fs-12 bold' },
                    {

                        row: [
                            {
                                flex: 1,
                                html: (
                                    <AIOInput
                                        type='slider'
                                        attrs={{ style: { padding: 0, height: 48 } }}
                                        scaleStep={[max]}
                                        scaleStyle={(value: number) => { if (value === max) { return { background: 'dodgerblue' } } }}
                                        labelStep={[max]}
                                        labelStyle={(value: number) => { if (value === max) { return { color: 'dodgerblue', fontSize: 10, top: 43 } } }}
                                        start={0} direction='left'
                                        end={totalCount}
                                        max={max}
                                        step={step}
                                        value={count}
                                        getPointHTML={!image ? undefined : () => {
                                            return <img src={image as string} width='30' alt='' />
                                        }}
                                        lineStyle={{ height: 4 }}
                                        showValue={true}
                                        fillStyle={(index: number) => {
                                            let background = '#2BBA8F';
                                            if (variantName === 'آفتابی') { background = '#fae006' }
                                            else if (variantName === 'مهتابی') { background = '#63e1f6' }
                                            else if (variantName === 'یخی') { background = '#effd8e' }
                                            if (index === 0) { return { height: 4, background } }
                                        }}
                                        valueStyle={{
                                            color: 'dodgerblue', background: 'none', height: 14, top: -28,
                                            display: 'flex', alignItems: 'center', fontSize: 12
                                        }}
                                        pointStyle={{ background: image ? 'none' : '#2BBA8F', width: 16, height: 16, zIndex: 1000, top: -6 }}
                                        onChange={(newCount: number) => onChange(newCount)}
                                        after={<div style={{ fontWeight: 'bold', padding: '0 3px', color: '#333', width: 24, borderRadius: 6, fontSize: 12 }}>{percent + '%'}</div>}
                                    />
                                ),
                                align: 'v'
                            },
                            // {
                            //     html:<div style={{background:'#2BBA8F',padding:'0 3px',color:'#fff',width:36,borderRadius:6}}>{count}</div>,align:'vh'
                            // }
                        ]
                    }
                ]
            }}
        />
    )
}
type I_CartButton = { product: I_product, renderIn: I_renderIn, variantId?: string, onChange?: Function }
function CartButton(props: I_CartButton) {
    let { actionClass }: I_app_state = useContext(appContext);
    let { product, renderIn, variantId, onChange = () => { } } = props;
    let { shopId, taxonId } = product.category;
    function openCart(e) {
        e.stopPropagation();
        actionClass.openPopup('cart', shopId)
    }
    let count: number = 0;
    if (actionClass.getCartShop(shopId)) {
        if (taxonId) {
            let cartTab = actionClass.getCartShop(shopId) as I_cartShop_taxon
            if (cartTab.taxons[taxonId]) {
                if (cartTab.taxons[taxonId].products[product.id]) {
                    if (cartTab.taxons[taxonId].products[product.id].variants[variantId]) {
                        count = cartTab.taxons[taxonId].products[product.id].variants[variantId].count as number;
                    }
                }
            }
        }
        else {
            let cartTab = actionClass.getCartShop(shopId) as I_cartShop_Product
            if (cartTab.products[product.id]) {
                if (cartTab.products[product.id].variants[variantId]) {
                    count = cartTab.products[product.id].variants[variantId].count as number;
                }
            }

        }
    }
    function icon_layout(count) {
        return {
            align: 'h', gap: 3, className: 'fs-12 color3B55A5', onClick: (e) => openCart(e),
            row: [{ html: <Icon path={mdiCart} size={1} />, align: 'vh' }, { html: count, align: 'v', className: 'fs-18' }]
        }
    }
    let layout;
    if (renderIn === 'shipping') {
        layout = icon_layout(count)
    }
    else if (!count) {
        layout = {
            html: () => (
                <button
                    onClick={async () => {
                        await actionClass.changeCart({ shopId,taxonId,productId:product.id,variantId, productCategory:product.category, count: 1 })
                        onChange(1)
                    }}
                    className="button-2"
                    style={{ fontSize: 12, height: 36, padding: '0 8px' }}
                >افزودن به سبد خرید</button>
            )
        }
    }
    else {
        layout = {
            column: [
                { show: renderIn === 'product', align: 'vh', html: 'تعداد در سبد خرید', className: 'fs-12 color3B55A5' },
                {
                    html: () => (
                        <ProductCount
                            value={count}
                            onChange={async (count) => {
                                await actionClass.changeCart({ shopId,taxonId,productId:product.id, variantId, count, productCategory:product.category })
                                onChange(count)
                            }}
                        />
                    )
                }
            ]
        }
    }
    return (<RVD layout={layout} />)
}
type I_ProductCount = { value: number, min?: number, max?: number, onChange?: Function }
function ProductCount(props: I_ProductCount) {
    let { actionClass, rsa,cart }: I_app_state = useContext(appContext);
    let [value, setValue] = useState<number>(props.value)
    let [popup, setPopup] = useState<boolean>(false)
    let { onChange, max = Infinity } = props;
    let changeTimeout;
    useEffect(() => {
        setValue(props.value)
    }, [props.value,cart])
    function change(value, min = props.min || 0) {
        value = +value;
        if (isNaN(value)) { value = 0 }
        setValue(value);
        clearTimeout(changeTimeout);
        changeTimeout = setTimeout(() => {
            if (value > max) { value = max }
            if (value < min) { value = min }
            onChange(value)
        }, 500)
    }
    function touchStart(dir, touch, isTouch) {
        if (touch && !isTouch) { return }
        if (!touch && isTouch) { return }
        change(value + dir)
        if (touch) { $(window).bind('touchend', touchEnd) }
        else { $(window).bind('mouseup', touchEnd) }
    }
    function touchEnd() {
        $(window).unbind('touchend', touchEnd)
        $(window).unbind('mouseup', touchEnd)
    }
    function openPopup() {
        let config = {
            onChange: (value) => {
                change(value);
                rsa.removeModal()
            },
            onRemove: () => {
                change(0)
                rsa.removeModal()
            },
            onClose: () => rsa.removeModal(),
            value,
        }
        actionClass.openPopup('count-popup', config)
    }
    let touch = 'ontouchstart' in document.documentElement;
    return (
        <RVD
            layout={{
                childsProps: { align: "vh" },
                style: { height: 36 },
                attrs: { onClick: (e) => e.stopPropagation() },
                row: [
                    {
                        html: (
                            <div
                                onMouseDown={(e) => touchStart(1, touch, false)}
                                onTouchStart={(e) => touchStart(1, touch, true)}
                                className={'product-count-button' + (value >= max ? ' disabled' : '')}
                            >
                                <Icon path={mdiPlus} size={1} />
                            </div>
                        ),
                        align: 'vh', show: onChange !== undefined
                    },
                    {
                        show: !!value, flex: 1,
                        html: (<div className='product-count-input' onClick={() => openPopup()} >{value}</div>)
                    },
                    {
                        html: () => (
                            <div
                                onMouseDown={(e) => touchStart(-1, touch, false)}
                                onTouchStart={(e) => touchStart(-1, touch, true)}
                                className='product-count-button'
                            >
                                <Icon path={mdiMinus} size={1} />
                            </div>),
                        show: value > 1 && onChange !== undefined
                    },
                    {
                        html: () => (
                            <div onClick={(e) => change(0)} className='product-count-button'>
                                <Icon path={mdiTrashCanOutline} size={0.8} />
                            </div>
                        ),
                        show: value === 1 && onChange !== undefined
                    },
                ]
            }}
        />
    )
}
type I_CountPopup = { value: number, onRemove: any, onChange: (newValue:number)=>void }
export class CountPopup extends Component <I_CountPopup,{value:number}> {
    dom:any;
    constructor(props){
        super(props);
        this.dom = createRef()
        this.state = {value:props.value}
    }
    input_layout() {
        let {value} = this.state;
        return {
            flex: 1,
            html:(
                <input type='number' ref={this.dom} value={value} min={0} 
                    onChange={(e) => this.setState({value:+e.target.value})}
                    onClick={() => $(this.dom.current).focus().select()}
                    style={{ width: '100%', border: '1px solid lightblue', height: 36, textAlign: 'center', borderRadius: 4 }}
                />
            )
        }
    }
    render(){
        let { onRemove, onChange } = this.props;
        let {value} = this.state
        return (
            <RVD
                layout={{
                    className:'count-popup', onClick: (e) => e.stopPropagation(), gap: 12,
                    column: [
                        { gap: 3, row: [this.input_layout()] },
                        {
                            gap: 12, row: [
                                { flex: 1, html: (<button className='button-1' onClick={() => onRemove()}>حذف محصول</button>) },
                                { flex: 1, html: (<button onClick={() => onChange(value)} className='button-2'>تایید</button>) }
                            ]
                        },
                    ]
                }}
            />
        )
    }
}
type I_Cart = { shopId: string }
export function Cart(props: I_Cart) {
    let context: I_app_state = useContext(appContext);
    let { cart, Shop,actionClass } = context;
    let [activeTabId, setActiveTabId] = useState<string | false>(false)
    let [factor, setFactor] = useState<React.ReactNode>()
    let [items, setItems] = useState<any[]>([])
    let tabs = Object.keys(cart.shops);
    useEffect(() => {
        update(true)
    }, [])
    useEffect(() => {
        update(false)
    }, [cart])
    async function update(initial) {
        if (initial) {
            if (props.shopId) { activeTabId = props.shopId }
            else { activeTabId = tabs[0] || false }
        }
        if (activeTabId !== false && !cart.shops[activeTabId]) { activeTabId = false }
        setActiveTabId(activeTabId);
        if (activeTabId) {
            let factor = await Shop[activeTabId].renderCartFactor();
            let items = await Shop[activeTabId].renderCartItems('cart');
            setItems(items);
            setFactor(factor);
        }
        else {
            setItems([])
            setFactor(false)
        }
    }
    function getBadge(option: string) {
        let cartTab:I_cartShop = actionClass.getCartShop(option)
        let length: number;
        if (cartTab.type === 'Taxon') { length = Object.keys(cartTab.taxons).length }
        else if (cartTab.type === 'Bundle') { length = Object.keys(cartTab.taxons).length }
        else { length = Object.keys(cartTab.products).length }
        return <div className='tab-badge'>{length}</div>
    }
    function tabs_layout() {
        if (!tabs.length) { return false }
        return {
            html: (
                <AIOInput
                    type='tabs'
                    options={tabs}
                    style={{ marginBottom: 12, fontSize: 12 }}
                    value={activeTabId}
                    optionAfter={(option) => getBadge(option)}
                    optionText={(option) => Shop[option].shopName}
                    optionValue='option'
                    onChange={(activeTabId: string) => setActiveTabId(activeTabId)}
                />
            )
        }
    }
    function empty_layout() {
        return {
            style: { background: '#eee', opacity: 0.5 },
            flex: 1, align: 'vh',
            column: [
                { html: <img src={noItemSrc as string} alt='' width='128' height='128' /> },
                { html: 'سبد خرید شما خالی است', style: { color: '#858a95' } },
                { size: 60 }
            ]
        }
    }
    function products_layout() {
        if (!items.length) { return empty_layout() }
        return { flex: 1, className: 'ofy-auto', column: items.map((cartItem) => { return { html: cartItem, className: 'of-visible' } }) }
    }
    function payment_layout() {
        if (!factor) { return false }
        return { html: factor }
    }
    return (
        <RVD
            layout={{
                flex: 1, className: 'theme-popup-bg',
                column: [
                    tabs_layout(),
                    products_layout(),
                    payment_layout()
                ]
            }}
        />
    )
}
type I_Shipping = { shopId: string, shopName: string }
function Shipping(props: I_Shipping) {
    let { userInfo, b1Info, backOffice, Shop, apis, Logger, actionClass, msfReport }: I_app_state = useContext(appContext);
    let { shopId, shopName } = props;
    let [code, setCode] = useState<{ discount: string, gift: string }>({ discount: '', gift: '' })
    let [codeState, setCodeState] = useState<{ discount: boolean, gift: boolean }>({ discount: false, gift: false })
    let [codeInfo, setCodeInfo] = useState<{ discount: any, gift: any }>({ discount: undefined, gift: undefined })
    let [data, setData] = useState<{ [key: string]: { value: number, options: any[] } }>()
    let [mounted, setMounted] = useState<boolean>(false)
    let [factorItems, setFactorItems] = useState<I_factorItem[]>([])
    let [cartItems, setCartItems] = useState<any[]>([])
    function details_layout(list: { key: string, value: any, className?: string }[]) {
        return {
            className: 'box p-12 m-h-12',
            column: list.map(({ key, value, className = 'theme-medium-font-color fs-14' }) => {
                return {
                    size: 36, childsProps: { align: 'v' },
                    row: [{ html: key + ':', className }, { flex: 1 }, { html: value, className }]
                }
            })
        }
    }
    function getParams(data) {
        let { PayDueDate, DeliveryType, PaymentTime } = data;
        let SettleType = actionClass.getSettleType(PayDueDate.value);
        return {
            SettleType, PayDueDate: PayDueDate.value, DeliveryType: DeliveryType.value, PaymentTime: PaymentTime.value,
            address: userInfo.address, giftCodeInfo: codeInfo.gift, discountCodeInfo: codeInfo.discount
        }
    }
    async function getFactorItems(data) {
        let ShopClass = Shop[shopId];
        let { getFactorItems } = ShopClass;
        let params = getParams(data)
        let factorItems: I_factorItem[] = await getFactorItems(params, 'shipping')
        setFactorItems(factorItems)
    }
    async function getCartItems() {
        let cartItems = await Shop[shopId].renderCartItems('shipping');
        setCartItems(cartItems);
    }
    useEffect(() => { onMount() }, [])
    useEffect(() => {
        if (data) { getFactorItems(data) }
    }, [data])
    async function onMount() {
        let backOfficeData = backOffice[shopId] || backOffice.spreeCampaigns.find((o) => o.shopId === shopId);
        let { PayDueDate, PaymentTime, DeliveryType, PayDueDates, PaymentTimes, DeliveryTypes } = backOfficeData

        let data = {
            PayDueDate: { value: PayDueDate, options: backOffice.PayDueDate_options.filter(({ value }) => PayDueDates.indexOf(value) !== -1) },
            PaymentTime: { value: PaymentTime, options: backOffice.PaymentTime_options.filter(({ value }) => PaymentTimes.indexOf(value) !== -1) },
            DeliveryType: { value: DeliveryType, options: backOffice.DeliveryType_options.filter(({ value }) => DeliveryTypes.indexOf(value) !== -1) }
        }
        setData(data)
        getFactorItems(data);
        getCartItems();
        setMounted(true);
    }
    function address_layout() {
        return {
            className: 'box p-12 m-h-12',
            column: [
                { size: 36, align: 'v', className: 'theme-medium-font-color fs-12 bold', html: 'آدرس تحویل' },
                { className: 'fs-14 theme-medium-font-color bgF1F1F1 p-12 br-4', html: userInfo.address, size: 72 }
            ]
        }
    }
    function phone_layout() {
        return {
            className: 'box p-12 m-h-12',
            column: [
                { size: 36, align: 'v', className: 'theme-medium-font-color fs-12 bold', html: 'شماره تلفن' },
                { className: 'fs-14 theme-medium-font-color bgF1F1F1 p-12 br-4', html: userInfo.phoneNumber, style: { minHeight: 36 } }
            ]
        }
    }
    function products_layout() {
        return {
            column: [
                { size: 36, align: 'v', className: 'theme-medium-font-color fs-14 bold p-h-12', html: 'محصولات' },
                { className: 'of-visible', column: cartItems.map((card) => { return { html: card, className: 'of-visible' } }) },
                { size: 12 }
            ]
        }
    }
    function fix(value) {
        try { return +value.toFixed(0) }
        catch { return 0 }
    }
    function codeView_layout() {
        let column = [];
        if (codeInfo.gift) {
            try {
                let details = actionClass.getCodeDetails({ giftCodeInfo: codeInfo.gift, discountCodeInfo: codeInfo.discount })
                if (details.PromotionValue) {
                    column.push({
                        style: { color: 'green' }, html: `کارت هدیه به مبلغ ${details.PromotionValue} روی فاکتور اعمال شد`
                    })
                }
            }
            catch { }
        }
        if (codeInfo.discount) {
            try {
                let details = actionClass.getCodeDetails({ discountCodeInfo: codeInfo.discount, giftCodeInfo: codeInfo.gift })
                if (details.DiscountPercentage) {
                    column.push({
                        style: { color: 'green' }, html: `کد تخفیف ${`${details.DiscountPercentage} درصد`} تا سقف ${details.DiscountMaxValue} روی فاکتور اعمال شد `
                    })
                }
            }
            catch { }
        }
        if (column.length) {
            return { column, className: 'box m-t-12 p-12 m-h-12' }
        }
    }
    function amount_layout() {
        if (!data) { return false }
        let ShopClass = Shop[shopId];
        let { getPaymentButtonText } = ShopClass;
        let params = getParams(data)
        let Details = details_layout(factorItems);
        return {
            className: 'p-h-12 bg-fff theme-box-shadow',
            style: { paddingTop: 12, borderRadius: '16px 16px 0 0' },
            column: [
                Details,
                { size: 6 },
                {
                    size: 36, align: 'vh', className: 'theme-medium-font-color fs-14 bold',
                    html: (
                        <button
                            className="button-2"
                            onClick={async () => {
                                await apis.request({
                                    api: "kharid.payment", description: 'عملیات ثبت و پرداخت',
                                    parameter: { ...params, shopId },
                                    onSuccess: () => {
                                        msfReport({ actionName: 'send to visitor', actionId: 234, tagName: 'kharid', result: 'success', eventName: 'action' })
                                    },
                                    onError: (message) => {
                                        msfReport({ actionName: 'send to visitor', actionId: 234, tagName: 'kharid', result: 'unsuccess', message, eventName: 'action' })
                                    }
                                })
                            }}
                        >{getPaymentButtonText(params)}</button>
                    )
                },
                { size: 12 }
            ]
        }
    }
    function getCodeAfter(type: 'gift' | 'discount') {
        let state = codeState[type]
        let value = code[type]
        let text, className = '';
        if (state === true) {
            text = <Icon path={mdiCheck} size={0.8} />
            className = 'success'
        }
        else if (state === false) {
            text = 'اعمال'
        }
        return (
            <button disabled={!value || value.length < 5} onClick={() => checkCode(type)} className={'shipping-code-button' + (className ? ' ' + className : '')}>{text}</button>
        )
    }
    function checkCode(type: 'gift' | 'discount') {
        if (codeState[type]) {
            setCodeState({ ...codeState, [type]: false })
            setCodeInfo({ ...codeInfo, [type]: undefined })
            return
        }
        let description = { 'giftCode': 'کارت هدیه', 'discountCode': 'کد تخفیف' }[type]
        apis.request({
            api: 'kharid.checkCode',
            description: `ارسال ${description}`,
            parameter: { type, code: code[type] },
            onSuccess: (obj = {}) => {
                Logger.add(`اطلاعات دریافت شده از ${description}`, obj, type)
                setCodeState({ ...codeState, [type]: true })
                setCodeInfo({ ...codeInfo, [type]: obj })
            },
            onError: () => {
                setCode({ ...code, [type]: '' })
                setCodeInfo({ ...codeInfo, [type]: undefined })
            },
            onCatch: (response) => {
                return response.response.data.Message;
            }
        })
    }
    function code_layout(type: 'gift' | 'discount') {
        let placeholder = { 'gift': 'کارت هدیه', 'discount': 'کد تخفیف' }[type]
        let value = code[type];
        return {
            className: 'box m-h-12',
            html: (
                <AIOInput
                    key={type} type='text' value={value} disabled={!!codeState[type]} style={{ height: 36 }}
                    placeholder={`${placeholder} را وارد کنید`} onChange={(v) => setCode({ ...code, [type]: v })}
                    after={getCodeAfter(type)} before={placeholder}
                />
            )
        }
    }
    function options_layout(key, title, cond = true) {
        if (!data) { return false }
        let value = data[key].value;
        let options = data[key].options;
        if(key === 'PaymentTime' && b1Info.customer.purchaseState && b1Info.customer.purchaseState.onlyByOrder){
            options = [{value: 1, text: 'واریز قبل ارسال'}]
        }
        if(key === 'PayDueDate' && b1Info.customer.purchaseState && b1Info.customer.purchaseState.onlyByCash){
            options = options.filter((o)=>o.value === 1)
        }
        
        if (!cond || value === undefined) { return false }
        return {
            className: 'box p-12 m-h-12',
            column: [
                { size: 36, align: 'v', className: 'theme-medium-font-color fs-12 bold', html: title },
                {
                    html: (
                        <AIOInput
                            key={key} style={{ padding: 0 }} className='shipping-options fs-12' type='radio' options={options} value={value}
                            optionAfter={(option) => {
                                if (option.discountPercent) { return <div style={{ whiteSpace: 'nowrap' }}>{`${option.discountPercent}% تخفیف`}</div> }
                            }}
                            optionAttrs={{ style: { height: 36, width: '100%', padding: 0 } }}
                            onChange={(newValue) => setData({ ...data, [key]: { ...data[key], value: newValue } })}
                        />
                    )
                }
            ]
        }
    }

    if (!mounted) { return null }
    return (
        <>
            <RVD
                layout={{
                    className: 'theme-popup-bg',
                    flex: 1,
                    column: [
                        {
                            flex: 1, className: 'ofy-auto',
                            column: [
                                { size: 12 },
                                details_layout([
                                    { key: 'نام مشتری', value: `${userInfo.firstName} ${userInfo.lastName}` },
                                    { key: 'نام کمپین', value: shopName },
                                    { key: 'کد مشتری', value: userInfo.cardCode },
                                    { key: 'گروه مشتری', value: b1Info.customer.groupName }
                                ]),
                                { size: 12 },
                                address_layout(),
                                { size: 12 },
                                phone_layout(),
                                { size: 12 },
                                options_layout('DeliveryType', 'نحوه ارسال'),
                                { size: 12 },
                                options_layout('PaymentTime', 'زمان پرداخت',),
                                { size: 12 },
                                options_layout('PayDueDate', 'مهلت تسویه', data.PaymentTime.value !== 5),
                                { size: 12 },
                                // code_layout('gift'),
                                // { size: 12 },
                                // code_layout('discount'),
                                //codeView_layout(),
                                products_layout()
                            ],
                        },
                        amount_layout(),
                    ]
                }}
            />
        </>
    )
}
type I_CategorySlider = {
    getProducts: () => Promise<I_product[]>, title: string, showAll: Function
}
export function CategorySlider(props: I_CategorySlider) {
    let { Shop, apis }: I_app_state = useContext(appContext);
    let { title, showAll } = props;
    let [products, setProducts] = useState<I_product[]>()
    useEffect(() => {
        getProducts()
    }, [])
    async function getProducts() {
        let products = await props.getProducts();
        setProducts(products)
    }
    function products_layout() {
        let loading = false;
        if (!products) {
            let fakeProduct = {
                id: '1231',
                productSku:'234234',
                name: 'محصول تستی',
                images: [nosrc],
                inStock: true,
                B1Dscnt: 10,
                CmpgnDscnt: 0,
                PymntDscnt: 10,
                FinalPrice: 200000,
                Price: 220000,
                hasFullDetail: false,
                category: { shopId: 'Regular', shopName: 'خرید عادی' }
            };
            loading = true;
            products = [fakeProduct, fakeProduct, fakeProduct, fakeProduct, fakeProduct]
        }
        return {
            gap: 16, className: 'ofx-auto p-b-12',
            row: products.map((product, i) => {
                return {
                    className: 'of-visible',
                    html: (Shop.Regular.renderCard_Regular({ type: 'vertical', product, loading, renderIn: 'slider', index: i }))
                }
            }),
        }
    }
    return (
        <RVD
            layout={{
                style: { padding: 12 }, className: 'ofx-visible',
                column: [
                    {
                        size: 36,
                        row: [
                            { html: title, className: "fs-14 theme-dark-font-color bold", align: "v" },
                            { flex: 1 },
                            { show: !!showAll && !!products && !!products.length, html: "مشاهده همه", className: "fs-12 theme-link-font-color bold", align: "v", onClick: () => showAll() }
                        ]
                    },
                    products_layout(),
                ],
            }}
        />
    )
}



// class CartClass{
//     id:string;
//     type:'Product' | 'Taxon' | 'Bundle';
//     getState:()=>I_app_state;
//     getCartShop:(shopId:string)=>I_cartShop;
//     reportRemoveCart:(p:{shopId:string,taxonId:string,productId:string,variantId:string})=>Promise<void>;
//     reportAddToCart:(p:{shopId:string,taxonId:string,productId:string,variantId:string})=>Promise<void>;
//     changeCart:(p:I_changeCartProps)=>void;
//     removeCart:(cart:I_state_cart,ids:string[],fields:string[])=>void;
//     removeCartItem:(p:I_changeCartProps)=>Promise<I_state_cart>;
//     editCartItem:(p:I_changeCartProps)=>Promise<I_state_cart>;
//     editCartTaxonByPricing:(cartTaxon:I_cartTaxon,shopId:string,removable:boolean)=>Promise<void>;
//     constructor(p:{id:string,type:'Product' | 'Taxon' | 'Bundle',getState:()=>I_app_state}){
//         let {id,type,getState} = p;
//         this.getState = getState;
//         this.id = id;
//         this.type = type;
//         this.getCartShop = (shopId)=>{
//             let { cart } = this.getState();
//             return cart.shops[shopId]
//         }
//         this.reportRemoveCart = async ({shopId,taxonId,productId,variantId})=>{
//             let { msfReport,Shop } = this.getState();
//             let products =  await Shop[shopId].getShopItems({taxonId,productId})
//             let product = products[0];
//             msfReport({actionName:'remove from cart',actionId:23,targetName:`${product.name}(${variantId})`,targetId:variantId,tagName:'kharid',eventName:'action'})
//         }
//         this.reportAddToCart = async ({shopId,taxonId,productId,variantId})=>{
//             let { msfReport,Shop } = this.getState();
//             let products =  await Shop[shopId].getShopItems({taxonId,productId})
//             let product = products[0];
//             msfReport({actionName:'add to cart',actionId:24,targetName:`${product.name}(${variantId})`,targetId:variantId,tagName:'kharid',eventName:'action'})
//         }
//         this.changeCart = async (p:I_changeCartProps) => {
//             let { apis,actionClass } = this.getState();
//             let { shopId,taxonId, productId, variantId,count,productCategory } = p;
//             let props:I_changeCartProps = { shopId,taxonId, productId, variantId,count,productCategory }
//             let newCart = !count?await this.removeCartItem(props):await this.editCartItem(props);
//             apis.request({ api: 'kharid.setCart', parameter: newCart, loading: false, description: 'ثبت سبد خرید' })
//             actionClass.setCart(newCart);
//         }
//         this.removeCart = (cart,ids,fields)=>{
//             let obj = cart;
//             for(let i = 0; i < ids.length - 1; i++){
//                 obj = obj[fields[i]];
//                 if(!obj){return}
//                 obj = obj[ids[i]]
//             }
//             let field = fields[ids.length - 1];
//             let id = ids[ids.length - 1];
//             let newItems = {}
//             let length = 0;
//             for(let prop in obj[field]){
//                 if(id.toString() !== prop.toString()){
//                     length++;
//                     newItems[prop] = obj[field][prop]
//                 }
//             }
//             if(length){obj[field] = newItems}
//             else if(ids.length < 2){obj[field] = {};}
//             else {this.removeCart(cart,ids.slice(0,ids.length - 1),fields)}
//         }
//         this.removeCartItem = async (p:I_changeCartProps)=>{
//             let {shopId,taxonId,productId,variantId} = p;
//             let { cart } = this.getState();
//             let newCart:I_state_cart = JSON.parse(JSON.stringify(cart));
//             if(taxonId){
//                 this.removeCart(newCart,[shopId,taxonId,productId,variantId],['shops','taxons','products','variants'])
//                 let cartShop = newCart.shops[shopId] as I_cartShop_taxon;
//                 if(cartShop && cartShop.taxons[taxonId]){
//                     await this.editCartTaxonByPricing(cartShop.taxons[taxonId],shopId,false)     
//                 }
//             }
//             else {
//                 this.removeCart(newCart,[shopId,productId,variantId],['shops','products','variants'])
//             }
//             return newCart as I_state_cart
//         }
//         this.editCartItem = async (p:I_changeCartProps)=>{
//             let {shopId,taxonId, productId, variantId,count,productCategory} = p; 
//             let { cart } = this.getState();
//             let cartShop = this.getCartShop(shopId);
//             let reportAdd = false;
//             if(taxonId){
//                 let newCartShop = cartShop as I_cartShop_taxon;
//                 if(newCartShop){newCartShop = JSON.parse(JSON.stringify(newCartShop))}
//                 if(!newCartShop){newCartShop = {type:'Taxon',taxons:{}}}
//                 if(!newCartShop.taxons[taxonId]){
//                     newCartShop.taxons[taxonId] = {taxonId,products:{},hasError:false}
//                 }
//                 if(!newCartShop.taxons[taxonId].products[productId]){
//                     newCartShop.taxons[taxonId].products[productId] = {variants:{},productId,productCategory}
//                 }
//                 if(!newCartShop.taxons[taxonId].products[productId].variants[variantId]){
//                     reportAdd = true;
//                     newCartShop.taxons[taxonId].products[productId].variants[variantId] = {count:0,productCategory,productId,variantId}
//                 }
//                 newCartShop.taxons[taxonId].products[productId].variants[variantId].count = count
//                 let cartTaxon:I_cartTaxon = newCartShop.taxons[taxonId];
//                 await this.editCartTaxonByPricing(cartTaxon,shopId,false);
//                 newCartShop.taxons[taxonId] = cartTaxon;
//                 cartShop = newCartShop;
//             }
//             else {
//                 let newCartShop = cartShop as I_cartShop_Product;
//                 if(!newCartShop){newCartShop = {products:{},type:'Product'}}
//                 if(!newCartShop.products[productId]){
//                     newCartShop.products[productId] = {variants:{},productId,productCategory}
//                 }
//                 if(!newCartShop.products[productId].variants[variantId]){
//                     reportAdd = true
//                     newCartShop.products[productId].variants[variantId] = {count:0,productCategory,variantId,productId}
//                 }
//                 newCartShop.products[productId].variants[variantId].count = count;
//                 cartShop = newCartShop;
//             }
//             if(reportAdd){this.reportAddToCart({shopId,taxonId,productId,variantId})}
//             return {...cart,shops:{...cart.shops,[shopId]:cartShop}}
//         }
//         this.editCartTaxonByPricing = async(cartTaxon:I_cartTaxon,shopId:string,removable:boolean)=>{
//             let { Shop,rsa,cart,actionClass } = this.getState();
//             let factorDetailsItems:I_factorDetailItem[] = []
//             let variantsParents:{[variantId:string]:{productId:string,taxonId:string}} = {}
//             for(let productId in cartTaxon.products){
//                 let { variants }:I_cartProduct = cartTaxon.products[productId];
//                 for(let variantId in variants){
//                     let variant:I_cartVariant = variants[variantId];
//                     let { count } = variant;
//                     variant.error = undefined;
//                     variantsParents[variantId] = {productId,taxonId:cartTaxon.taxonId};
//                     factorDetailsItems.push({ ItemCode: variantId, ItemQty: count });
//                 }
//             }
//             let CampaignId = Shop[shopId].CampaignId;
//             let factorDetails:I_getFactorDetails_result = actionClass.getFactorDetails(factorDetailsItems, {CampaignId}, 'editCartItem');
//             let { MarketingLines } = factorDetails;
//             let hasError = false;
//             for(let i = 0; i < MarketingLines.length; i++){
//                 let {CampaignDetails = {},ItemCode,ItemQty} = MarketingLines[i];
//                 let {productId,taxonId} = variantsParents[ItemCode]; 
//                 let products = await Shop[shopId].getShopItems({taxonId,productId})
//                 let product = products[0];
//                 let cartVariant:I_cartVariant = cartTaxon.products[productId].variants[ItemCode];
//                 let {Information,BundleRowsInfos} = CampaignDetails;
//                 let {isUnderValue,isOverValue} = BundleRowsInfos;
//                 if(isUnderValue){
//                     if(ItemQty === 0){
//                         if(removable){
//                             let newCart = JSON.parse(JSON.stringify(cart));
//                             this.removeCart(newCart,[shopId,cartTaxon.taxonId,productId,ItemCode],['shops','taxons','products','variants'])
//                             actionClass.setCart(newCart)
//                         }
//                         else {
//                             rsa.addSnakebar({text:Information,time:4,type:'warning'});
//                             hasError = true; cartVariant.error = Information;
//                         }
//                     }
//                     else {cartVariant.count = ItemQty;}
//                 }
//                 else if(isOverValue){
//                     rsa.addSnakebar({text:`در شرایط فعلی این فاکتور حداکثر تعداد قابل انتخاب از محصول ${product.name} ${ItemQty} عدد می باشد`,time:6,type:'warning'});
//                     if(ItemQty === 0){
//                         let newCart = JSON.parse(JSON.stringify(cart));
//                         this.removeCart(newCart,[shopId,cartTaxon.taxonId,productId,ItemCode],['shops','taxons','products','variants'])
//                         actionClass.setCart(newCart)
//                     }
//                     else {
//                         cartVariant.count = ItemQty;
//                     }
//                 }
//             }
//             cartTaxon.hasError = hasError;
//         }
//     }
    
// }