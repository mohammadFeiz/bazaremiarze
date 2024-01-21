import React, { Fragment, useContext, useEffect, useState, useRef } from "react";
import RVD from './npm/react-virtual-dom/react-virtual-dom';
import AIOStorage from 'aio-storage';
import { Icon } from '@mdi/react';
import { mdiPlusThick, mdiChevronLeft, mdiChevronDown, mdiCheckCircle, mdiAlertCircle, mdiCart, mdiPlus, mdiMinus, mdiTrashCanOutline, mdiClose, mdiCheck, mdiInformationOffOutline, mdiInformationOutline, mdiInformation } from "@mdi/js";
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
import appContext from './app-context';
import { I_ShopClass, I_taxon, I_app_state, I_bundle_product, I_bundle_taxon, I_bundle_variant, I_cartTab, I_cartTab_bundle, I_cartTab_bundle_product, I_cartTab_bundle_taxon, I_cartTab_taxon, I_cartTaxon, I_cartVariant, I_discount, I_product, I_product_optionType, I_shippingOptions, I_renderIn, I_state_cart, I_variant, I_variant_optionValues, I_cartProduct, I_product_category, I_getFactorDetails_result, I_factorItem, I_cartTab_bundle_variant, I_marketingLine_bundle } from "./types";
import { I_getTaxonProducts_p } from "./apis/kharid-apis";
import noItemSrc from './images/not-found.png';
import nosrc from './images/no-src.png';


export default class ShopClass implements I_ShopClass {
    constructor({ getAppState, config }) {
        this.getAppState = getAppState;
        this.update(config);
    }
    update(obj) { for (let prop in obj) { this[prop] = obj[prop]; } }
    dicToArray = (dic: { [key: string]: any }) => Object.keys(dic).map((key) => dic[key])
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
    categoryItems?: any;
    itemType: 'Product' | 'Bundle' | 'Taxon'
    getProductById = async (productId: string, productCategory: I_product_category) => {
        let categoryItems = await this.getCategoryItems(productCategory);
        return categoryItems.find((o: I_product) => o.id === productId)
    }
    getCategoryItems = async (p?: { categoryId?: string, categoryName?: string, count?: number }) => {
        let { apis } = this.getAppState();
        if (this.shopId === 'Bundle') {
            if (!this.categoryItems) {
                this.categoryItems = await apis.request({
                    api: 'kharid.daryafte_ettelaate_bundle', description: 'دریافت لیست باندل', def: [],
                });
            }
            return this.categoryItems;
        }
        else if (this.taxons) { this.categoryItems = this.taxons; return this.categoryItems }
        else if (this.shopId === 'Regular') {
            let key = `${p.categoryId}${p.count ? `_count${p.count}` : ''}`;
            if (!this.categoryItems) { this.categoryItems = {} }
            if (!this.categoryItems[key]) {
                let description: string = `دریافت محصولات دسته بندی ${p.categoryName}`;
                let cacheName: string = `categoryProducts.${key}`;
                let parameter: I_getTaxonProducts_p = { category: { shopId: 'Regular', shopName: 'خرید عادی', categoryId: p.categoryId, categoryName: p.categoryName } }
                let request = {
                    api: 'kharid.getTaxonProducts', description, def: [], parameter, loading: false,
                    cache: { time: 30 * 24 * 60 * 60 * 1000, name: cacheName }
                }
                this.categoryItems[key] = await apis.request(request);
            }
            return this.categoryItems[key];
        }
        else {
            if (!this.categoryItems) {
                let description = `دریافت محصولات ${this.shopName}`;
                let cacheName = `taxonProducts.${this.shopId}`;
                let parameter: I_getTaxonProducts_p = { category: { shopId: this.shopId, shopName: this.shopName } }
                this.categoryItems = await apis.request({
                    api: 'kharid.getTaxonProducts', description, def: [], parameter, loading: false,
                    cache: { time: 30 * 24 * 60 * 60 * 1000, name: cacheName }
                });
            }
            return this.categoryItems;
        }
    }
    openCategory = async (p?: { categoryId: string, categoryName: string }) => {
        let { rsa, actionClass, msfReport } = this.getAppState();
        let items = await this.getCategoryItems(p);
        let taxonName = p ? p.categoryName : this.shopName;
        let taxonId = p ? p.categoryId : this.shopId;
        let props: I_CategoryView = {
            billboard: this.billboard, items, description: this.description, itemType: this.itemType,
            renderItem: (item: I_product | I_bundle_taxon | I_taxon, index?: number) => this.renderCard({ item, renderIn: 'category', index })
        }
        msfReport({ actionName: 'open category', actionId: 4, targetName: taxonName, targetId: taxonId, tagName: 'kharid', eventName: 'page view' })
        let buttons = actionClass.getHeaderIcons({ cart: true })
        rsa.addModal({
            id: 'shop-class-category', position: 'fullscreen',
            body: { render: () => <CategoryView {...props} /> },
            header: { title: taxonName, buttons }
        })
    }
    renderCard = (p: { item: I_product | I_taxon | I_bundle_taxon, renderIn: I_renderIn, index?: number }) => {
        let { item, renderIn, index } = p;
        if (this.shopId === 'Bundle') { return this.renderCard_Bundle({ taxon: item as I_bundle_taxon, renderIn, index }) }
        if (this.taxons) { return this.renderCard_taxon({ taxon: item as I_taxon, renderIn }) }
        else { return this.renderCard_Regular({ product: item as I_product, renderIn, index }) }
    }
    renderCard_Regular = (
        p: {
            product: I_product, renderIn: I_renderIn, index: number,
            loading?: boolean, type?: 'horizontal' | 'vertical'
        }
    ) => {
        let { product, renderIn, index, loading, type } = p;
        let cartVariants: I_cartVariant[] = this.getCartVariants({ productId: product.id });
        let props: I_RegularCard = {
            cartVariants, product, renderIn, loading, index, type, shopId: this.shopId,
            onClick: () => this.openProductPage(product)
        }
        return (<RegularCard key={product.id} {...props} />)
    }
    renderCard_taxon = (p: { taxon: I_taxon, renderIn: I_renderIn }) => {
        let { taxon, renderIn } = p;
        let props: I_TaxonCard = {
            taxon, renderIn, shopId: this.shopId, shopName: this.shopName,
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
            body: {
                render: () => {
                    let props: I_BundlePage = { taxon }
                    return <BundlePage {...props} />
                }
            },
            header: false
        })
    }
    openProductPage = async (product: I_product) => {
        let taxonId = product.category.taxonId;
        let { apis, rsa, actionClass, msfReport } = this.getAppState();
        if (!product.hasFullDetail) {
            debugger
            product = await apis.request({ api: 'kharid.getProductFullDetail', parameter: product })
            product.hasFullDetail = true;
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
            header: { title: this.shopName, buttons: actionClass.getHeaderIcons({ cart: true }) }
        })
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

    getCartVariants = (p?: { productId?: string, taxonId?: string }) => {
        const getVariants = (Parent) => {
            if (this.itemType === 'Bundle') {
                let parent = Parent as I_cartTab_bundle_taxon
                let res = []
                for (let productId in parent.products) {
                    if (p && p.productId !== undefined && p.productId !== productId) { continue }
                    let cartProduct = parent.products[productId] as I_cartTab_bundle_product
                    let { variants } = cartProduct;
                    for (let variantId in variants) {
                        let { count, step } = variants[variantId]
                        let obj: I_cartTab_bundle_variant = { count, step, variantId }
                        res.push(obj)
                    }
                }
                return res
            }
            else {
                let res: I_cartVariant[] = []
                let taxonId, minValue, maxValue;
                let parent;
                if (this.itemType === 'Taxon') {
                    parent = Parent as I_cartTaxon;
                    taxonId = parent.taxonId;
                    minValue = parent.minValue;
                    maxValue = parent.maxValue;
                }
                for (let productId in parent.products) {
                    if (p && p.productId !== undefined && p.productId !== productId) { continue }
                    let cartProduct = parent.products[productId] as I_cartProduct
                    let { variants } = cartProduct;
                    for (let variantId in variants) {
                        let { count, productId, productCategory, error } = variants[variantId]
                        let obj: I_cartVariant = { count, productId, productCategory, variantId, taxonId, minValue, maxValue, error }
                        res.push(obj)
                    }
                }
                return res
            }
        }
        let { cart } = this.getAppState();
        let shopId = this.shopId;
        if (!cart[shopId]) { return [] }
        if (this.taxons || shopId === 'Bundle') {
            let res = []
            let cartTab = cart[shopId] as I_cartTab_taxon;
            for (let taxonId in cartTab.taxons) {
                if (p) {
                    if (p.taxonId !== undefined && p.taxonId !== taxonId) { continue }
                }
                res = [...res, ...getVariants(cartTab.taxons[taxonId])]
            }
            return res
        }
        else { return getVariants(cart[shopId]) }
    }
    //جمع قیمت سبد خرید بدون تخفیف
    getCartVariantsTotal = async (cartVariants: I_cartVariant[]) => {
        let total = 0;
        for (let i = 0; i < cartVariants.length; i++) {
            let { count, productId, variantId, productCategory } = cartVariants[i];
            let product: I_product = await this.getProductById(productId, productCategory);
            let variant = product.variants.find((o) => o.id === variantId);
            total += variant.Price * count
        }
        return total;
    }
    getAmounts = async (shippingOptions: I_shippingOptions, container?: string) => {
        if (this.shopId === 'Bundle') { return this.getAmounts_Bundle(shippingOptions, container) }
        else { return await this.getAmounts_all(shippingOptions, container) }
    }
    getAmounts_all = async (shippingOptions: I_shippingOptions, container?: string) => {
        let { actionClass } = this.getAppState();
        let cartVariants = this.getCartVariants();
        let total = await this.getCartVariantsTotal(cartVariants)
        let marketingLines = this.getMarketingLines_all(cartVariants);
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
    getBundleCartDetails = () => {
        let { cart } = this.getAppState();
        if (!cart.Bundle) { return { total: 0, marketingLines: [] } }
        let marketingLines: I_marketingLine_bundle[] = []
        let total: number = 0;
        let cartTab: I_cartTab_bundle = cart.Bundle as I_cartTab_bundle;
        for (let taxonId in cartTab.taxons) {
            let cartTaxon: I_cartTab_bundle_taxon = cartTab.taxons[taxonId];
            let { products, count: taxonCount, price: taxonPrice } = cartTaxon;
            total += taxonCount * taxonPrice;
            for (let productId in products) {
                let cartProduct: I_cartTab_bundle_product = products[productId];
                let { variants, price: productPrice } = cartProduct;
                for (let variantId in variants) {
                    let cartVariant: I_cartTab_bundle_variant = variants[variantId];
                    let { count } = cartVariant;
                    marketingLines.push({ ItemCode: variantId, ItemQty: count, Price: productPrice, BasePackCode: productId, BasePackQty: taxonCount })
                }
            }
        }
        return { marketingLines, total }
    }
    getAmounts_Bundle = async (shippingOptions: I_shippingOptions, container?: string) => {
        let { actionClass, backOffice } = this.getAppState();
        let { PayDueDate_options } = backOffice;
        let { total }: { total: number } = this.getBundleCartDetails();
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
        let { cart } = this.getAppState();
        if (!cart[this.shopId]) { return [] }
        if (this.shopId === 'Bundle') {
            let cartTab = cart.Bundle as I_cartTab_bundle;
            let cartTaxons: I_cartTab_bundle_taxon[] = this.dicToArray(cartTab.taxons);
            let renders = []
            //به دلیل هندل نشدن پرامیز در مپ جاوا اسکریپت از حلقه فور استفاده می کنم
            for (let i = 0; i < cartTaxons.length; i++) {
                let { taxonId } = cartTaxons[i];
                let categoryItems = await this.getCategoryItems();
                let taxon = await categoryItems.find((o: I_bundle_taxon) => o.id === taxonId)
                let res = await this.renderCard_Bundle({ taxon, index: i, renderIn })
                renders.push(res)
            }
            return renders
        }
        else if (this.taxons) {
            let cartTab = cart[this.shopId] as I_cartTab_taxon
            let cartItems = this.dicToArray(cartTab.taxons);
            return cartItems.map((cartItem: I_cartTaxon) => {
                let { taxonId } = cartItem;
                let taxon = this.taxons.find((o) => o.id === taxonId)
                return this.renderCard_taxon({ taxon, renderIn })
            })
        }
        else {
            let cartTab = cart[this.shopId] as I_cartTab;
            let cartProducts = this.dicToArray(cartTab.products);
            return cartProducts.map(async (cartProduct: I_cartProduct, index: number) => {
                let { variants: cartVariants, productId, productCategory } = cartProduct;
                let product = await this.getProductById(productId, productCategory);
                return this.renderCard_Regular({ product, renderIn, index })
            })
        }

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
        if (this.shopId === 'Bundle') { this.fillAuto() }
        msfReport({ actionName: 'open checkout page', actionId: 754, targetName: this.shopName, targetId: this.shopId, tagName: 'kharid', eventName: 'page view' })
        rsa.addModal({ id: 'edameye_farayande_kharid', position: 'fullscreen', body: { render: () => <Shipping shopId={this.shopId} shopName={this.shopName} /> }, header: { title: 'ادامه فرایند خرید' } })
    }
    fillAuto = () => {
        return;
        // let {cart} = this.getAppState()
        // let items = cart.Bundle.items;
        // for(let prop in items){
        //   let {count,product,variantId} = items[prop];
        //   let total = 0;
        //   for(let x in count.qtyInPacks){
        //       for(let i = 0; i < count.qtyInPacks[x].length; i++){
        //           let o = count.qtyInPacks[x][i];
        //           total += o.count;
        //       }
        //   }
        //   let v = product.variants[0];
        //   let qty = v.qty;
        //   let delta = qty - total;
        //   if(delta){
        //     let a = count.qtyInPacks[v.id];
        //     let b = a.find(({optionValueName})=>optionValueName === 'مهتابی')
        //     if(!b)
        //     {
        //       b = a[0];
        //     }
        //     b.count = b.count + delta
        //   }
        // }
    }
    sabt = async (obj) => {
        //obj => { address, SettleType, PaymentTime, DeliveryType, PayDueDate }
        let { baseUrl } = this.getAppState();
        let body = this.getOrderBody(obj)
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
        let body = this.getOrderBody(obj)
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
    getOrderBody = ({ PaymentTime, DeliveryType, PayDueDate, address, giftCodeInfo, discountCodeInfo }) => {
        let appState = this.getAppState();
        let { userInfo, b1Info, actionClass } = appState;
        let DiscountList = actionClass.getCodeDetails({ giftCodeInfo, discountCodeInfo })
        let marketingLines;
        if (this.shopId === 'Bundle') { marketingLines = this.getMarketingLines_Bundle() }
        else { marketingLines = this.getMarketingLines_all(this.getCartVariants()) }
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
    getMarketingLines_all = (cartVariants: I_cartVariant[]) => {
        return cartVariants.map((o: I_cartVariant) => { return { ItemCode: o.variantId, ItemQty: o.count } })
    }
    getMarketingLines_Bundle() {
        let marketingLines = [];
        let { cart } = this.getAppState();
        let cartTab = cart.Bundle as I_cartTab_bundle;
        for (let taxonId in cartTab.taxons) {
            let { products, count: packCount } = cartTab.taxons[taxonId];
            for (let productId in products) {
                let { variants, price } = products[productId];
                for (let variantId in variants) {
                    let { count } = variants[variantId];
                    marketingLines.push({ ItemCode: variantId, ItemQty: count, Price: price, BasePackCode: taxonId, BasePackQty: packCount })
                }
            }
        }
        return marketingLines;
    }
    getPaymentButtonText = (shippingOptions: I_shippingOptions) => {
        if (this.shopId === 'Bundle') { return shippingOptions.SettleType !== 2 ? 'پرداخت' : 'ثبت' }
        else { return 'ارسال برای ویزیتور' }
    }
    renderCartFactor = async (button = true) => {
        let res = await this.getAmounts(undefined, 'cart');
        let { payment } = res;
        if (!button) {
            return (
                <RVD
                    layout={{
                        size: 72, className: "bgFFF p-h-12 theme-box-shadow",
                        row: [
                            { flex: 1, align: "v", html: "جمع سبد خرید", className: "theme-medium-font-color fs-12" },
                            {
                                row: [
                                    { align: "v", html: SplitNumber(payment), className: "theme-dark-font-color fs-20 bold" },
                                    { size: 4 },
                                    { align: "v", html: " ریال", className: "theme-dark-font-color fs-12" }
                                ]
                            }
                        ]
                    }}
                />
            )
        }
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
                                        let { rsa } = this.getAppState();
                                        rsa.removeModal('all');
                                        this.edameye_farayande_kharid()
                                    }}
                                    className="button-2" style={{ height: 36, padding: '0 12px' }}
                                >ادامه فرایند خرید</button>
                            ),
                            align: "v"
                        },
                    ],
                }}
            />
        )
    }
}
type I_CategoryView = { billboard?: string, description?: string, renderItem: Function, items: (I_product | I_bundle_taxon | I_taxon)[], itemType: 'Product' | 'Taxon' | 'Bundle' }
function CategoryView(props: I_CategoryView) {
    let [searchValue, setSearchValue] = useState<string>('')
    let { billboard, description, renderItem, items } = props
    function search_layout() {
        return { html: <SearchBox value={searchValue} onChange={(searchValue) => setSearchValue(searchValue)} /> }
    }
    function banner_layout() {
        if (!billboard) { return false }
        return { html: <img src={billboard} alt='' width='100%' /> }
    }
    function description_layout() {
        if (!description) { return false }
        return { html: description, style: { textAlign: 'right', padding: '0 12px' } }
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
        return { flex: 1, className: 'ofy-auto m-b-12', gap: 12, column: [banner_layout(), description_layout(), products_layout()] }
    }
    return (<RVD layout={{ className: 'theme-popup-bg', column: [search_layout(), body_layout()] }} />)
}
type I_TaxonCard = { taxon: I_taxon, shopId: string, shopName: string, renderIn: I_renderIn, renderCard: (product: I_product, index: number) => React.ReactNode }
function TaxonCard(props: I_TaxonCard) {
    let { apis, cart }: I_app_state = useContext(appContext);
    let storage = AIOStorage('taxonCardToggle');
    let { taxon, shopId, shopName, renderIn, renderCard } = props;
    let [open, setOpen] = useState<boolean>(storage.load({ name: 'toggle' + taxon.id, def: false }))
    let [products, setProducts] = useState<I_product[] | undefined>()
    async function click() { setOpen(!open); storage.save({ name: 'toggle' + taxon.id, value: !open }) }
    function close_layout() {
        return (
            <RVD
                layout={{
                    className: 'p-12 theme-box-shadow', onClick: () => click(),
                    row: [{ size: 36, align: 'vh', html: <Icon path={mdiChevronLeft} size={.8} /> }, { html: taxon.name, align: 'v' }]
                }}
            />
        )
    }
    function groupDiscount_layout() {
        if (renderIn !== 'cart' && renderIn !== 'shipping') { return false }
        let cartTab = cart[shopId] as I_cartTab_taxon;
        if (!cartTab) { return false }
        let cartLength = Object.keys(cartTab.taxons).length;
        return {
            align: 'v', html: `تخفیف گروه کالا ${0.5 * cartLength} درصد`,
            className: 'fs-10', style: { color: 'green', background: '#fff' }
        }
    }
    function taxonName_layout() {
        return {
            onClick: (e) => { e.stopPropagation(); click() },
            row: [
                { html: <Icon path={mdiChevronDown} size={0.8} />, align: 'vh', size: 36 },
                { html: taxon.name, flex: 1, align: 'v' },
            ]
        }
    }
    function products_layout() { return { column: products.map((o: I_product, i: number) => { return { html: renderCard(o, i) } }) } }
    function range_layout() {
        let Min = SplitNumber(taxon.min), Max = SplitNumber(taxon.max);
        return {
            gap: 12, align: 'v', className: 'fs-10', style: { color: '#60B4D0', background: '#eee', padding: '3px 6px' },
            row: [{ html: `حداقل مبلغ ${Min} ریال` }, { html: `حداکثر مبلغ ${Max} ریال` },]
        }
    }
    function open_layout() {
        return (<RVD layout={{ className: 'p-12 theme-box-shadow', column: [taxonName_layout(), products_layout(), groupDiscount_layout(), range_layout()] }} />)
    }
    useEffect(() => { getProducts() }, [cart, open])
    async function getProducts() {
        if (renderIn === 'cart' || renderIn === 'shipping') {
            let cartTab = cart[shopId] as I_cartTab_taxon;
            let productDic = cartTab.taxons[taxon.id].products;
            let products = []
            for (let productId in productDic) { products.push(productDic[productId]) }
            setProducts(products)
        }
        else {
            let parameter: I_getTaxonProducts_p = { category: { shopId, shopName, taxonId: taxon.id, taxonName: taxon.name } }
            let products = await apis.request({
                api: 'kharid.getTaxonProducts', description: `دریافت محصولات تکزون ${taxon.name}`, def: [], parameter,
                cache: { time: 30 * 24 * 60 * 60 * 1000, name: `taxonProducts.${shopId}.${taxon.id}` }
            });
            setProducts(products)
        }
    }
    return open && products ? open_layout() : close_layout()
}
type I_RegularCard = {
    product: I_product, shopId: string, cartVariants: I_cartVariant[],
    renderIn: I_renderIn, index: number, loading?: boolean,
    onClick?: Function, type?: 'horizontal' | 'vertical'
}
function RegularCard(props: I_RegularCard) {
    let { Shop }: I_app_state = useContext(appContext);
    let [mounted, setMounted] = useState<boolean>(false)
    let { product, shopId, renderIn, index, loading, onClick, type = 'horizontal', cartVariants = [] } = props;
    function image_layout() {
        let { images = [] } = product;
        return { size: 116, align: 'vh', html: <img src={images[0] || NoSrc as string} width={'100%'} alt='' /> }
    }
    function count_layout() {
        debugger
        if (!cartVariants.length) { return false }
        let column = cartVariants.map((p: I_cartVariant) => {
            let { count, variantId, taxonId } = p;
            let variant = product.variants.find((o: I_variant) => o.id === variantId)
            let { optionTypes } = product;
            let { optionValues } = variant;
            let details = [];
            for (let j = 0; j < optionTypes.length; j++) {
                let optionType = optionTypes[j];
                details.push([optionType.name, optionType.items[optionValues[optionType.id]]]);
            }
            let unitTotal = product.FinalPrice * count
            return {
                style: { background: '#f7f7f7' }, className: 'p-h-3',
                row: [
                    {
                        flex: 1, align: 'v',
                        column: [
                            { align: 'v', className: 'theme-medium-font-color fs-10 bold', gap: 6, row: details.map(([key, value]) => { return { html: `${key} : ${value === undefined ? '' : value}` } }) },
                            { show: !isNaN(unitTotal), className: 'theme-light-font-color fs-12', html: () => `مجموع ${SplitNumber(unitTotal)} ریال` }
                        ]
                    },
                    { html: (<CartButton renderIn={renderIn} product={product} variantId={variantId} />), align: 'vh' }
                ]
            }
        })
        return { gap: 3, style: { background: '#fff' }, column }
    }
    function title_layout() {
        return { html: Shop[shopId].shopName, className: 'fs-10', style: { color: 'rgb(253, 185, 19)' } }
    }
    function name_layout() {
        let { name } = product;
        return { html: name, className: 'fs-12 theme-medium-font-color bold', style: { whiteSpace: 'normal', textAlign: 'right' } }
    }
    function discount_layout() {
        let { inStock, Price, B1Dscnt = 0, CmpgnDscnt = 0, PymntDscnt = 0 } = product;
        if (!Price || !inStock) { return false }
        return {
            gap: 4, className: 'p-h-12',
            row: [
                { flex: 1 },
                { show: !!B1Dscnt || !!CmpgnDscnt || !!PymntDscnt, html: <del>{SplitNumber(Price)}</del>, className: 'fs-14 theme-light-font-color' },
                {
                    gap: 3,
                    row: [
                        { show: !!B1Dscnt, html: <div style={{ background: '#FFD335', color: '#fff', padding: '1px 3px', fontSize: 12, borderRadius: 6 }}>{B1Dscnt + '%'}</div> },
                        { show: !!CmpgnDscnt, html: <div style={{ background: '#ffa835', color: '#fff', padding: '1px 3px', fontSize: 12, borderRadius: 6 }}>{CmpgnDscnt + '%'}</div> },
                        { show: !!PymntDscnt, html: <div style={{ background: '#ff4335', color: '#fff', padding: '1px 3px', fontSize: 12, borderRadius: 6 }}>{(PymntDscnt) + '%'}</div> }//notice
                    ]
                }
            ]
        }
    }
    function details_layout() {
        if (!product.description) { return false }
        return {
            html: product.description, className: 'fs-9',
            style: {
                whiteSpace: 'nowrap',
                overflow: 'hidden'
            }
        }
    }
    function notExist_layout() {
        let { inStock } = product;
        if (inStock) { return false }
        return { row: [{ flex: 1 }, { html: 'نا موجود', className: 'colorD83B01 bold fs-12' }, { size: 12 }] }
    }
    function price_layout() {
        let { FinalPrice, inStock } = product;
        if (!inStock || !FinalPrice) { return false }
        return {
            row: [
                { flex: 1 },
                { html: SplitNumber(FinalPrice) + ' ریال', className: 'fs-12 theme-dark-font-color bold p-h-12' }
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
                    className: 'theme-card-bg theme-box-shadow gap-no-color rvd-rotate-card' + (mounted ? ' mounted' : ''),
                    onClick,
                    style: { border: '1px solid #eee' },
                    column: [
                        {
                            row: [
                                image_layout(),
                                {
                                    flex: 1,
                                    column: [
                                        { size: 6 },
                                        title_layout(),
                                        name_layout(),
                                        details_layout(),
                                        { flex: 1 },
                                        discount_layout(),
                                        notExist_layout(),
                                        { row: [{ flex: 1 }, price_layout()] },
                                        { size: 6 },

                                    ]
                                }
                            ]
                        },
                        count_layout()
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
                        discount_layout(),
                        price_layout(),
                        notExist_layout(),
                        { size: 12 }
                    ]
                }}
            />
        )
    }
    return type === 'horizontal' ? horizontal_layout() : vertical_layout()

}
type I_BundleCard = { taxon: I_bundle_taxon, renderIn: I_renderIn, index?: number, onClick?: Function }
function BundleCard(props: I_BundleCard) {
    let { cart, Shop }: I_app_state = useContext(appContext)
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
            let cartTab = cart.Bundle as I_cartTab_bundle;
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
            let cartTab: I_cartTab_bundle = cart.Bundle as I_cartTab_bundle;
            if (!cartTab) { return false }
            let cartTaxon = cartTab.taxons[taxon.id];
            if (!cartTaxon) { return false }
            let ps = [];
            for (let i = 0; i < taxon.products.length; i++) {
                let product = taxon.products[i];
                let cartProduct: I_cartTab_bundle_product = cartTaxon.products[product.id];
                let str = `${product.name} ( `;
                for (let j = 0; j < product.variants.length; j++) {
                    let variant = product.variants[j];
                    let cartVariant: I_cartTab_bundle_variant = cartProduct.variants[variant.id];
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
    let { actionClass, Shop }: I_app_state = useContext(appContext);
    let { product, shopId } = props;
    let taxonId = product.category.taxonId;
    let [selectedVariant, setSelectedVariant] = useState<I_variant | undefined>()
    let [selectedDic, setSelectedDic] = useState<I_variant_optionValues | undefined>()
    let [existOptionValueNames, setExistOptionValueNames] = useState<string[]>([])
    let [variantOptions, setVariantOptions] = useState<{ text: string, value: any }[]>([])
    let [showDetails, setShowDetails] = useState<boolean>(false)
    let [srcIndex, setSrcIndex] = useState<number>(0)
    let { optionTypes, variants } = product;
    useEffect(() => {
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
            if (optionValues[optionTypeId] !== selectedDic[optionTypeId]) { return false }
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
                { size: 36, html: "کد کالا : " + (product.id || ""), className: "fs-12 theme-medium-font-color p-h-12" },
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
        let cartVariants = Shop[shopId].getCartVariants({ productId: product.id })
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
    let { cart, actionClass, rsa }: I_app_state = useContext(appContext);
    let { taxon } = props;
    if (typeof taxon.max !== 'number') { taxon.max = Infinity }
    const defaultCartTaxon: I_cartTab_bundle_taxon = { products: {}, count: 0, taxonId: taxon.id, price: taxon.price }
    let [cartTaxon, setCartTaxon] = useState<I_cartTab_bundle_taxon>(JSON.parse(JSON.stringify(defaultCartTaxon)))
    let [submitLoading, setSubmitLoading] = useState<boolean>(false)
    let cartTimeout;
    function setCart(newCartTaxon) {
        let newCart: I_state_cart = JSON.parse(JSON.stringify(cart));
        let cartTab: I_cartTab_bundle = newCart.Bundle as I_cartTab_bundle;
        if (!cartTab) {
            cartTab = { taxons: {}, type: 'Bundle' };
        }
        cartTab.taxons[taxon.id] = newCartTaxon;
        newCart.Bundle = cartTab;
        actionClass.setCart(newCart)
    }
    function virayeshe_sabad(newCartTaxon: I_cartTab_bundle_taxon, delay?: boolean) {
        //ابتدا استیت خودت رو آپدیت کن سپس استیت سبد در اپ مرکزی رو با تاخیر (برای جلو گیری از لگ زدن) آپدیت کن
        delay = delay === undefined?true:delay
        setCartTaxon(newCartTaxon);
        clearTimeout(cartTimeout);
        if (!delay) { setCart(newCartTaxon) }
        else { cartTimeout = setTimeout(() => setCart(newCartTaxon), 1000) }
    }
    useEffect(() => {
        try {
            let cartTab = cart.Bundle as I_cartTab_bundle;
            let cartTaxon: I_cartTab_bundle_taxon = cartTab.taxons[taxon.id];
            if (cartTaxon) { setCartTaxon(cartTaxon) }
        }
        catch { }
    }, [])
    function hazfe_taxon_az_sabad() {
        setCartTaxon(JSON.parse(JSON.stringify(defaultCartTaxon)))
        actionClass.removeCartBundleTaxon(taxon)
    }
    function virayeshe_taxon_dar_sabad(newCartTaxon: I_cartTab_bundle_taxon,delay?:boolean) {
        delay = delay === undefined?true:delay
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
        virayeshe_sabad(newCartTaxon,delay)
    }
    function taghire_tedade_baste(dir: 1 | -1) {
        let newCartTaxon: I_cartTab_bundle_taxon = JSON.parse(JSON.stringify(cartTaxon))
        newCartTaxon.count += dir;
        if (newCartTaxon.count < 0) { newCartTaxon.count = 0 }
        if (newCartTaxon.count > taxon.max) { newCartTaxon.count = taxon.max }
        if (!newCartTaxon.count) { hazfe_taxon_az_sabad() }
        else { virayeshe_taxon_dar_sabad(newCartTaxon,false) }
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
        let newCartTaxon: I_cartTab_bundle_taxon = JSON.parse(JSON.stringify(cartTaxon));
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
            let newCartTaxon: I_cartTab_bundle_taxon = JSON.parse(JSON.stringify(cartTaxon))
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
    let { actionClass, cart }: I_app_state = useContext(appContext);
    let { product, renderIn, variantId, onChange = () => { } } = props;
    let { shopId, taxonId } = product.category;
    function openCart(e) {
        e.stopPropagation();
        actionClass.openPopup('cart', shopId)
    }
    let count: number = 0;
    if (cart[shopId]) {
        if (taxonId) {
            let cartTab = cart[shopId] as I_cartTab_taxon
            if (cartTab.taxons[taxonId]) {
                if (cartTab.taxons[taxonId].products[product.id]) {
                    if (cartTab.taxons[taxonId].products[product.id].variants[variantId]) {
                        count = cartTab.taxons[taxonId].products[product.id].variants[variantId].count as number;
                    }
                }
            }
        }
        else {
            let cartTab = cart[shopId] as I_cartTab
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
                    onClick={() => {
                        actionClass.changeCart({ variantId, product, count: 1, taxonId })
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
                            onChange={(count) => {
                                actionClass.changeCart({ product, variantId, count, taxonId })
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
    let { actionClass, rsa }: I_app_state = useContext(appContext);
    let [value, setValue] = useState<number>(props.value)
    let [popup, setPopup] = useState<boolean>(false)
    let { onChange, max = Infinity } = props;
    let changeTimeout;
    useEffect(() => {
        setValue(props.value)
    }, [props.value])
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
type I_CountPopup = { value: number, onRemove: any, onChange: any }
export function CountPopup(props: I_CountPopup) {
    const dom = useRef<HTMLInputElement>(null)
    let { onRemove, onChange } = props;
    let [value, setValue] = useState<any>(props.value)
    function input_layout() {
        return {
            flex: 1,
            html: (
                <AIOInput
                    type='number' value={value} min={0} attrs={{ ref: dom }}
                    onChange={(e) => setValue(e.target.value)}
                    onClick={() => $(dom.current).focus().select()}
                    style={{ width: '100%', border: '1px solid lightblue', height: 36, textAlign: 'center', borderRadius: 4 }}
                />
            )
        }
    }
    return (
        <RVD
            layout={{
                style: { height: '100%', padding: 12 }, onClick: (e) => e.stopPropagation(), gap: 12,
                column: [
                    { gap: 3, row: [input_layout()] },
                    {
                        gap: 12, row: [
                            { flex: 1, html: (<button className='button-2' style={{ background: 'red', border: 'none' }} onClick={() => onRemove()}>حذف محصول</button>) },
                            { flex: 1, html: (<button onClick={() => onChange(value)} className='button-2'>تایید</button>) }
                        ]
                    },
                ]
            }}
        />
    )
}
type I_Cart = { shopId: string }
export function Cart(props: I_Cart) {
    let context: I_app_state = useContext(appContext);
    let { shopId } = props;
    let { cart, Shop } = context;
    let [activeTabId, setActiveTabId] = useState<string | false>(false)
    let [factor, setFactor] = useState<React.ReactNode>()
    let [items, setItems] = useState<any[]>([])
    let tabs = Object.keys(cart);
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
        if (activeTabId !== false && !cart[activeTabId]) { activeTabId = false }
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
        let cartTab = cart[option]
        let length: number;
        if (cartTab.type === 'taxon') { length = Object.keys(cartTab.taxons).length }
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
        return { flex: 1, className: 'ofy-auto', gap: 12, column: items.map((cartItem) => { return { html: cartItem, className: 'of-visible' } }) }
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