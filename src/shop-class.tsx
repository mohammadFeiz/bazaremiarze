import React, { Fragment, useContext, useEffect, useState, useRef } from "react";
import RVD from './npm/react-virtual-dom/react-virtual-dom';
import AIOStorage from 'aio-storage';
import { Icon } from '@mdi/react';
import { mdiPlusThick, mdiChevronLeft, mdiChevronDown, mdiCheckCircle, mdiAlertCircle, mdiCart, mdiPlus, mdiMinus, mdiTrashCanOutline } from "@mdi/js";
import Axios from 'axios';
import SplitNumber from "./npm/aio-functions/split-number";
import Shipping from "./components/kharid/shipping/shipping";
import NoSrc from './images/no-src.png';
import CartButton from './components/kharid/cart-button';
import getSvg from "./utils/getSvg";
import AIOInput from "./npm/aio-input/aio-input";
import $ from 'jquery';
import bundleBoxSrc from './images/bundle-box.jpg';
import SearchBox from './components/search-box/index';
import appContext from './app-context';
import { I_ShopClass, I_ShopClass_taxon, I_app_state, I_bundle_product, I_bundle_taxon, I_bundle_variant, I_cartTab, I_cartTab_bundle, I_cartTab_bundle_product, I_cartTab_bundle_taxon, I_cartTab_taxon, I_cartTaxon, I_cartVariant, I_discount, I_product, I_product_optionType, I_shippingOptions, I_shopRenderIn, I_state_cart, I_variant, I_variant_optionValues } from "./types";


export default class ShopClass implements I_ShopClass {
    constructor({ getAppState, config }) {
        this.getAppState = getAppState;
        this.update(config);
    }
    update(obj) { for (let prop in obj) { this[prop] = obj[prop]; } }
    dicToArray = (dic: { [key: string]: any }) => Object.keys(dic).map((key) => dic[key])
    /****type defined**** */
    getAppState: () => I_app_state;
    id: string;
    name: string;
    cartId: string;
    taxons?: I_ShopClass_taxon[];
    maxCart?: number;
    CampaignId?: number;
    PriceListNum?: number;
    billboard?: string;
    products?: I_product;
    description?: string;
    icon?: string;

    
    renderCard_Bundle = (p) => {
        //{ taxon: I_bundle_taxon, renderIn: I_shopRenderIn, index?: number, onClick?: Function }
        let { taxon, renderIn, index } = p;
        let { apis, rsa, actionClass, msfReport, cart } = this.getAppState();
        let props = {
            taxon,renderIn,index,
            onClick: async () => {
                msfReport({ actionName: 'open product', actionId: 5, targetName: taxon.name, targetId: taxon.id, tagName: 'kharid', eventName: 'page view' })
                rsa.addModal({
                    position: 'fullscreen', id: 'product',
                    body: { render: () => this.renderPage_Bundle(taxon) },
                    header: { title: this.name, buttons: actionClass.getHeaderIcons({ cart: true }) }
                })
            }
        }
        return (<BundleCard key={taxon.id} {...props} />)
    }
    renderCard = (p) => {
        let { product, renderIn, variantId, count, details, loading, index, style, type } = p;
        let { apis, rsa, actionClass, msfReport, cart } = this.getAppState();
        let props = {
            cart,
            title: this.name, product, renderIn, variantId, count, details, loading, index, style, type, cartId: this.cartId, CampaignId: this.CampaignId,
            onClick: async () => {
                if (!product.hasFullDetail) {
                    product = await apis.request({
                        api: 'kharid.getProductFullDetail',
                        parameter: product
                    })
                    product.hasFullDetail = true;
                }
                msfReport({ actionName: 'open product', actionId: 5, targetName: product.name, targetId: product.id, tagName: 'kharid', eventName: 'page view' })
                rsa.addModal({
                    position: 'fullscreen', id: 'product',
                    body: { render: () => this.renderPage(product) },
                    header: { title: this.name, buttons: actionClass.getHeaderIcons({ cart: true }) }
                })
            },
        }
        return (<RegularCard key={product.id} {...props} />)
    }
    renderPage_Bundle = (taxon:I_bundle_taxon)=><BundlePage taxon={taxon} />
    renderPage = (product:I_product) => {
        let { actionClass } = this.getAppState()
        let props = {
            product, maxCart: this.maxCart, cartId: this.cartId, CampaignId: this.CampaignId,
            onShowCart: () => actionClass.openPopup('cart'),
            //use in bundle
        }
        return <RegularPage {...props} />
    }
    renderTaxonCard = (p) => {
        let { taxon, renderIn, index, errors = [], hasErrors = [] } = p;
        let { apis, msfReport, cart } = this.getAppState();
        let props = {
            title: taxon.name, taxon, renderIn, index, errors, cart, cartId: this.cartId, hasErrors,
            renderProductCard: (product, index) => {
                return this.renderCard({ product, index, renderIn });
            }
        }
        return (<TaxonCard key={taxon.id} {...props} />)
    }
    openCategory = async (id?: string, name?: string) => {
        let { apis, rsa, actionClass, msfReport } = this.getAppState();
        let products;
        let taxonName = name || this.name;
        if (this.cartId === 'Bundle') {
            products = this.products
        }
        else {
            products = await apis.request({
                api: 'kharid.getTaxonProducts', description: 'دریافت محصولات تکزون', def: [],
                parameter: { cartId:this.cartId,taxonId:id },
                cache: { time: 30 * 24 * 60 * 60 * 1000, name: `taxonProducts.cartId_${this.cartId}${id?`_taxonId_${id}`:''}` }
            });
        }
        let props = { billboard: this.billboard, products, description: this.description, title: this.name }
        msfReport({ actionName: 'open category', actionId: 4, targetName: taxonName, targetId: id, tagName: 'kharid', eventName: 'page view' })
        let buttons = actionClass.getHeaderIcons({ cart: true })
        rsa.addModal({
            id: 'shop-class-category',
            position: 'fullscreen',
            body: {
                render: () => {
                    if (this.taxons) {
                        let renderProductCard = (product, index) => this.renderTaxonCard({
                            taxon: product, index, renderIn: 'category', taxonId: product.id
                        })
                        return (<CategoryView {...props} renderProductCard={renderProductCard} products={products} />)
                    }
                    else {
                        let renderProductCard;
                        if(this.cartId === 'Bundle'){
                            renderProductCard = (taxon:I_bundle_taxon, index:number) => {
                                return this.renderCard_Bundle({taxon,renderIn:'category',index})
                            }
                        }
                        else {
                            renderProductCard = (product:I_product, index:number) => {
                                return this.renderCard({ product, index, renderIn: 'category' })      
                            }
                        }
                        return (<CategoryView {...props} renderProductCard={renderProductCard} products={products} />)
                    }
                }
            },
            header: { title: taxonName, buttons }
        })
    }
    payment = async (obj: I_shippingOptions) => {
        //obj => { address, SettleType, PaymentTime, DeliveryType, PayDueDate }
        let { rsa, actionClass } = this.getAppState();
        let result = await this.sabt(obj);
        if (typeof result === 'object') {
            let { orderNumber } = result;
            rsa.removeModal('all');
            actionClass.removeCartTab(this.cartId)
            actionClass.openPopup('sefareshe-ersal-shode-baraye-vizitor', { orderNumber });
            return true
        }
        else { return false }
    }

    /******** */

    getCartVariants = (p?:{productId?:string,taxonId?:string}) => {
        function getVariants(parent) {
            let res = []
            for (let productId in parent.products) {
                if(p.productId !== undefined && p.productId !== productId){continue}
                let { variants, product } = parent.products[productId]
                for (let variantId in variants) {
                    let { count, variant } = variants[variantId]
                    let obj:{product:I_product,cartId:string,productId:string,variantId:string,variant:I_variant,count:number,taxon?:I_ShopClass_taxon,taxonId?:string} = { 
                        cartId, productId, variantId, product, variant, count, taxon: parent.taxon, taxonId: parent.taxonId 
                    }
                    res.push(obj)
                }
            }
            return res
        }
        let { cart } = this.getAppState();
        let cartId = this.cartId;
        if (!cart[cartId]) { return [] }
        if (this.taxons) {
            let res = []
            let cartTab = cart[cartId] as I_cartTab_taxon;
            for (let taxonId in cartTab.taxons) { 
                if(p.taxonId !== undefined && p.taxonId !== taxonId){continue}
                res = [...res, getVariants(cartTab.taxons[taxonId])] 
            }
            return res
        }
        else { return getVariants(cart[cartId]) }
    }
    

    //جمع قیمت سبد خرید بدون تخفیف
    getCartVariantsTotal = (cartVariants: I_cartVariant[]) => {
        let total = 0;
        for (let i = 0; i < cartVariants.length; i++) {
            total += cartVariants[i].variant.Price * cartVariants[i].count
        }
        return total;
    }
    getAmounts = (shippingOptions: I_shippingOptions, container?: string) => {
        if (this.cartId === 'Bundle') { return this.getAmounts_Bundle(shippingOptions, container) }
        else { return this.getAmounts_all(shippingOptions, container) }
    }
    getAmounts_all(shippingOptions: I_shippingOptions, container?: string) {
        let { actionClass } = this.getAppState();
        let cartVariants = this.getCartVariants();
        let total = this.getCartVariantsTotal(cartVariants)
        let marketingLines = this.getMarketingLines_all(cartVariants);
        let factorDetails = actionClass.getFactorDetails(marketingLines, { ...shippingOptions, CampaignId: this.CampaignId }, container);
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
    getAmounts_Bundle = (shippingOptions: I_shippingOptions, container?: string) => {
        let { actionClass, backOffice } = this.getAppState();
        let { PayDueDate_options } = backOffice;
        let cartVariants = this.getCartVariants();
        let total = 0;
        for (let i = 0; i < cartVariants.length; i++) {
            let { count, product } = cartVariants[i];
            let price = product.price / (1 - (12 / 100))
            total += count.packQty * price;
        }
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
    getCartProducts_Bundle = (cartItems, renderIn) => {
        return cartItems.map(({ product, count, variantId }) => this.renderCard({ product, count, variantId, renderIn }))
    }
    getCartProducts = (renderIn, shippingOptions) => {
        let { cart } = this.getAppState();
        let cartTab = cart[this.cartId];
        if (!cartTab) { return [] }
        let cartItems = [];
        if (this.taxons) { cartItems = this.dicToArray((cartTab as I_cartTab_taxon).taxons) }
        else { cartItems = this.dicToArray((cartTab as I_cartTab).products) }
        if (this.cartId === 'Bundle') { return this.getCartProducts_Bundle(cartItems, renderIn) }
        else { return this.getCartProducts_all(cartItems, renderIn, shippingOptions) }
    }

    getCartProducts_all = (cartItems, renderIn, shippingOptions) => {//notice // shippingOptions here never used
        if (this.taxons) {
            let hasErrors = cartItems.filter((cartItem, i) => {
                let errors = cartItem.errors;
                return errors && errors.length
            })
            return cartItems.map((cartItem, i) => {

                let taxon = this.taxons.find((o) => o.id === cartItem.taxonId)
                let errors = cartItem.errors;
                let props = { taxon, renderIn }
                return this.renderTaxonCard(props)
            })
        }
        else {
            return cartItems.map((cartItem, i) => {
                let { product, variantId } = cartItem;
                let props = {
                    key: variantId, variantId, index: i, product, type: 'horizontal',
                    renderIn, cartId: this.cartId
                }
                return this.renderCard(props)

            })
        }

    }
    fix(value, v = 0) {
        try { return +value.toFixed(v) }
        catch { return 0 }
    }
    getFactorItems = (shippingOptions, container) => {
        let amounts = this.getAmounts(shippingOptions, container);
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
        if (this.cartId === 'Bundle') { this.fillAuto() }
        msfReport({ actionName: 'open checkout page', actionId: 754, targetName: this.cartId, targetId: this.cartId, tagName: 'kharid', eventName: 'page view' })
        rsa.addModal({ id: 'edameye_farayande_kharid', position: 'fullscreen', body: { render: () => <Shipping cartId={this.cartId} /> }, header: { title: 'ادامه فرایند خرید' } })
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
        let result = await Axios.post(`${baseUrl}/payment/request`, {
            "Price": Math.round(this.getAmounts(obj, 'payment').payment),
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
        if(this.cartId === 'Bundle'){marketingLines = this.getMarketingLines_Bundle()}
        else {marketingLines = this.getMarketingLines_all(this.getCartVariants())}
        let SettleType = actionClass.getSettleType(PayDueDate)
        return {
            "DiscountList": DiscountList,
            "marketdoc": {
                "DiscountList": DiscountList,
                "DocType": this.cartId === 'Bundle' ? 17 : undefined,
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
        let {cart} = this.getAppState();
        let cartTab = cart.Bundle as I_cartTab_bundle;
        for(let taxonId in cartTab.taxons){
            let {products,count:packCount} = cartTab.taxons[taxonId];
            for(let productId in products){
                let {variants,qty,price} = products[productId];
                for(let variantId in variants){
                    let {count} = variants[variantId];
                    marketingLines.push({ItemCode:variantId,ItemQty:count,Price:price,BasePackCode:productId,BasePackQty:packCount})
                }    
            }    
        }
        return marketingLines;
    }
    getPaymentButtonText = (shippingOptions: I_shippingOptions) => {
        if (this.cartId === 'Bundle') { return shippingOptions.SettleType !== 2 ? 'پرداخت' : 'ثبت' }
        else { return 'ارسال برای ویزیتور' }
    }
    async getCategoryProducts(id, count) {
        let { apis } = this.getAppState();
        return await apis.request({
            api: 'kharid.getTaxonProducts', parameter: { cartId:this.cartId,taxonId:id, count }, description: 'دریافت محصولات دسته بندی', def: [],
            cache: { time: 30 * 24 * 60 * 60 * 1000, name: `taxonProducts.cartId_${this.cartId}${id?`_taxonId_${id}`:''}${count?`_count_${count}`:''}` }
        });
    }
    renderCartFactor = (button = true) => {
        let res = this.getAmounts(undefined, 'cart');
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
//props
//billboard
//description
//products
//renderProductCard function
type I_CategoryView = { billboard?: string, description?: string, renderProductCard: Function, products: I_product[] }
function CategoryView(props: I_CategoryView) {
    let [searchValue, setSearchValue] = useState<string>('')
    let { billboard, description, renderProductCard, products } = props
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
        return { html: renderProductCard(product, index), className: 'of-visible' }
    }
    function getProductsBySearch() {
        return products.filter((o) => !searchValue || o.name.indexOf(searchValue) !== -1)
    }
    function body_layout() {
        return { flex: 1, className: 'ofy-auto m-b-12', gap: 12, column: [banner_layout(), description_layout(), products_layout()] }
    }
    return (<RVD layout={{ className: 'theme-popup-bg', column: [search_layout(), body_layout()] }} />)
}
type I_TaxonCard = { taxon: I_ShopClass_taxon, cartId: string, renderIn: I_shopRenderIn, renderProductCard: any }
function TaxonCard(props: I_TaxonCard) {
    let { apis, Shop, cart }: I_app_state = useContext(appContext);
    let storage = AIOStorage('taxonCardToggle');
    let { taxon, cartId, renderIn, renderProductCard } = props;
    let [open, setOpen] = useState<boolean>(storage.load({ name: 'toggle' + taxon.id, def: false }))
    let [products, setProducts] = useState<I_product[] | undefined>()
    async function click() { setOpen(!open); storage.save({ name: 'toggle' + taxon.id, value: !open }) }

    function close_layout() {
        return (
            <RVD
                layout={{
                    className: 'p-12 theme-box-shadow', onClick: () => click(),
                    row: [
                        { size: 36, align: 'vh', html: <Icon path={mdiChevronLeft} size={.8} /> },
                        { html: taxon.name, align: 'v' }
                    ]
                }}
            />
        )
    }
    function groupDiscount_layout() {
        if (renderIn !== 'cart' && renderIn !== 'shipping') { return false }
        let cartTab = cart[cartId] as I_cartTab_taxon;
        if (!cartTab) { return false }
        let cartLength = Object.keys(cartTab.taxons).length;
        return {
            align: 'v', html: `تخفیف گروه کالا ${0.5 * cartLength} درصد`,
            className: 'fs-10', style: { color: 'green', background: '#fff' }
        }
    }
    function taxonName_layout() {
        return {
            onClick: (e) => { e.stopPropagation(); this.click() },
            row: [
                { html: <Icon path={mdiChevronDown} size={0.8} />, align: 'vh', size: 36 },
                { html: taxon.name, flex: 1, align: 'v' },
            ]
        }
    }
    function products_layout() { return { column: products.map((o, i) => { return { html: renderProductCard(o, i) } }) } }
    function range_layout() {
        let Min = SplitNumber(taxon.min), Max = SplitNumber(taxon.max);
        return {
            gap: 12, align: 'v', className: 'fs-10', style: { color: 'orange' },
            row: [{ html: `حداقل مبلغ ${Min} ریال` }, { html: `حداکثر مبلغ ${Max} ریال` },]
        }
    }
    function open_layout() {
        return (<RVD layout={{ className: 'p-12 theme-box-shadow', column: [taxonName_layout(), products_layout(), groupDiscount_layout(), range_layout()] }} />)
    }
    useEffect(() => { getProducts() }, [cart, open])
    async function getProducts() {
        if (renderIn === 'cart' || renderIn === 'shipping') {
            let cartTab = cart[cartId] as I_cartTab_taxon;
            let productDic = cartTab.taxons[taxon.id].products;
            let products = []
            for (let productId in productDic) { products.push(productDic[productId]) }
            setProducts(products)
        }
        else {
            let products = await apis.request({
                api: 'kharid.getTaxonProducts', description: 'دریافت محصولات کمپین', def: [],
                parameter: { cartId,taxonId:taxon.id },
                cache: { time: 30 * 24 * 60 * 60 * 1000, name: `taxonProducts.cartId_${cartId}_taxonId_${taxon.id}` }
            });
            setProducts(products)
        }
    }
    return open && products ? open_layout() : close_layout()
}
type I_RegularCard = { 
    product: I_product, cartId: string, taxonId?:string, 
    renderIn, index?: number, loading?: boolean, 
    onClick?: Function, type?: 'horizontal' | 'vertical' 
}
function RegularCard(props: I_RegularCard) {
    let { cart,Shop }: I_app_state = useContext(appContext);
    let [mounted, setMounted] = useState<boolean>(false)
    let { product, cartId, taxonId, renderIn, index, loading, onClick, type = 'horizontal' } = props;
    function image_layout() {
        let { images = [] } = product;
        return { size: 116, align: 'vh', html: <img src={images[0] || NoSrc as string} width={'100%'} alt='' /> }
    }
    function count_layout() {
        let cartTab = cart[cartId];
        if (!cartTab) { return false }

        let cartVariants = []
        if (cartTab.type === 'taxon') {
            cartVariants = Shop[cartId].getCartVariants({taxonId,productId:product.id})
        }
        else {
            cartVariants = Shop[cartId].getCartVariants({productId:product.id})
        }
        if (!cartVariants.length) { return false }
        let column = cartVariants.map((p:{product:I_product,variant:I_variant,count:number,variantId:string}) => {
            let {product,variant,count,variantId} = p;
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
                    {html: (<CartButton renderIn={renderIn} product={product} variantId={variantId} cartId={cartId} taxonId={taxonId} />), align: 'vh'}
                ]
            }
        })
        return { gap: 3, style: { background: '#fff' }, column }
    }
    function title_layout() {
        return { html: Shop[cartId].name, className: 'fs-10', style: { color: 'rgb(253, 185, 19)' } }
    }
    function name_layout() {
        let { name } = product;
        return { html: name, className: 'fs-12 theme-medium-font-color bold', style: { whiteSpace: 'normal', textAlign: 'right' } }
    }
    function discount_layout() {
        let { product } = this.props;
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
                        //this.name_layout(),
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
type I_BundleCard = { taxon: I_bundle_taxon, renderIn: I_shopRenderIn, index?: number, onClick?: Function }
function BundleCard(props: I_BundleCard) {
    let { cart,Shop }: I_app_state = useContext(appContext)
    let { taxon, renderIn, index = 0, onClick } = props;
    let [mounted, setMounted] = useState<boolean>(false)
    function title_layout() {
        return {
            row: [
                { html: Shop.Bundle.name, style: { color: '#FDB913' }, className: 'fs-12 bold', align: 'v' },
                { size: 3 },
                { flex: 1, html: (<div style={{ height: 2, width: '1100%', background: '#FDB913' }}></div>), align: 'v' }
            ]
        }
    }
    function image_layout() {
        return {
            column: [
                { flex: 1, size: 114, html: <img src={taxon.image} alt='' width='100%' height='100%' className='br-12' /> },
                { show: renderIn === 'cart', size: 30, html: 'حذف از سبد', align: 'vh', style: { color: 'red' }, className: 'bold fs-14' }
            ]
        }
    }
    function name_layout() {
        return { html: taxon.name, className: 'fs-14 theme-dark-font-color bold', style: { textAlign: 'right' } }
    }
    function detail_layout() {
        if(renderIn === 'cart'){
            let cartTab:I_cartTab_bundle = cart.Bundle as I_cartTab_bundle;
            let cartTaxon = cartTab.taxons[taxon.id];
            let ps = [];
            for(let i = 0; i < taxon.products.length; i++){
                let product = taxon.products[i];
                let cartProduct:I_cartTab_bundle_product = cartTaxon.products[product.id];
                let str = `${product.name} ( `;
                for(let j = 0; j < product.variants.length; i++){
                    let variant = product.variants[i];
                    let count = cartProduct.variants[variant.id];
                    if(!count){continue}
                    str += `${variant.name} : ${count} واحد - `; 
                }    
                ps.push(str)
            }
            return {
                html: ps.join('***'), className: 'fs-12 theme-medium-font-color', style: { textAlign: 'right' }
            }
        }
        let ps = [];
        for(let i = 0; i < taxon.products.length; i++){
            let product = taxon.products[i];
            let str = `${product.qty} عدد ${product.name}`;
            ps.push(str)
        }
        return {
            html: ps.join('***'), className: 'fs-12 theme-medium-font-color', style: { textAlign: 'right' }
        }
    }
    function price_layout() {
        return {size: 36,row: [{flex: 1, className: 'fs-14 bold theme-dark-font-color',align: 'v', row: [{ flex: 1 }, { html: `${SplitNumber(taxon.price)} ریال` }]}]}
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
                            { size: 114, column: [image_layout()] },
                            { flex: 1, column: [name_layout(), { size: 6 }, detail_layout(), { flex: 1 }, price_layout()] }
                        ]
                    },
                ]
            }}
        />
    )
}
type I_RegularPage = { product: I_product, onShowCart: Function, cartId: string, taxonId?: string }
function RegularPage(props: I_RegularPage) {
    let { product, onShowCart, cartId, taxonId } = props;
    let [selectedVariant, setSelectedVariant] = useState<I_variant | undefined>()
    let [selectedDic, setSelectedDic] = useState<I_variant_optionValues | undefined>()
    let [existOptionValueNames, setExistOptionValueNames] = useState<string[]>([])
    let [variantOptions, setVariantOptions] = useState<{text:string,value:any}[]>([])
    let [showDetails, setShowDetails] = useState<boolean>(false)
    let [srcIndex, setSrcIndex] = useState<number>(0)
    let {optionTypes,variants} = product;
    useEffect(() => {
        let { existOptionValueNames, variantOptions } = getVariants()
        setExistOptionValueNames(existOptionValueNames)
        setVariantOptions(variantOptions)
        let firstVariant:I_variant = product.inStock ? (product.variants.filter((o) => o.inStock)[0]) : undefined;
        let selectedDic:I_variant_optionValues = firstVariant ? { ...firstVariant.optionValues } : undefined;
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
                let optionType = optionTypes.find((o)=>o.id === optionTypeId);
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
    function isVariantMatchBySelected(variant:I_variant,newSelectedDic:I_variant_optionValues){
        let {optionValues} = variant;
        for(let optionTypeId in newSelectedDic){
            if(optionValues[optionTypeId] !== selectedDic[optionTypeId]){return false}
        }
        return true;
    }
    function getVariantBySelected(newSelectedDic:I_variant_optionValues) {
        for (let i = 0; i < variants.length; i++) {
            let variant = variants[i];
            if(isVariantMatchBySelected(variant,newSelectedDic)){return variant}
        }
    }
    function changeOptionType(dic) {
        let newSelectedDic:I_variant_optionValues = { ...selectedDic, ...dic };
        let variant:I_variant = getVariantBySelected(newSelectedDic);
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
                        { size: 36, html: getSvg("chevronLeft", { flip: true })},
                        { flex: 1, html: <img src={product.images[srcIndex]} alt="" height="100%" /> },
                        { size: 36, html: getSvg("chevronLeft")},
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
                            onChange={(value) => changeOptionType(variants.find((o)=>o.id === value).optionValues)}
                        />
                    )
                }
            ]
        }
    }
    function optionTypes_layout(optionTypes:I_product_optionType[]) {
        if (!selectedDic) { return { html: '' } }
        return {
            className: "theme-card-bg theme-box-shadow theme-border-radius gap-no-color m-h-12 p-12",
            column: [
                {
                    gap: 6,
                    column: optionTypes.map((optionType:I_product_optionType, i) => {
                        let { items = {} } = optionType;
                        let optionValueIds = Object.keys(items);
                        optionValueIds = optionValueIds.filter((optionValueId)=>{
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
                                        let className = 'fs-12 p-v-3 p-h-12 br-4 product-option-value' + (active?' active':'');
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
        return {
            onClick: onShowCart,
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
                { html: (<CartButton variantId={selectedVariant.id} product={product} renderIn='product' cartId={cartId} taxonId={taxonId} />) },
                { flex: 1 }
            ]
        }
    }
    function price_layout() {
        if (!selectedVariant || !selectedVariant.inStock) {
            return { column: [{ flex: 1 }, { html: "ناموجود", className: "colorD83B01 bold fs-14" }, { flex: 1 }] };
        }
        let { cartItem = {} } = this.props;
        //یا یک را اضافه می کنم چون اگه تعداد صفر بود قیمت واحد رو نشون بده
        let count = cartItem.count || 1;
        let { B1Dscnt, CmpgnDscnt, PymntDscnt } = selectedVariant;
        return {
            column: [
                { flex: 1 },
                {
                    row: [
                        { flex: 1 },
                        { show: !!B1Dscnt || !!CmpgnDscnt || !!PymntDscnt, html: () => <del>{SplitNumber(selectedVariant.Price * count)}</del>, className: "theme-light-font-color" },
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
                        { html: SplitNumber(selectedVariant.FinalPrice * count), className: "theme-dark-font-color bold" },
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
type I_BundeCard = { taxon: I_bundle_taxon }
function BundlePage(props: I_BundeCard) {
    let { cart, actionClass }: I_app_state = useContext(appContext);
    let { taxon } = props;
    const defaultCartTaxon: I_cartTab_bundle_taxon = { products: {}, taxon: props.taxon, count: 0 }
    let [cartTaxon, setCartTaxon] = useState<I_cartTab_bundle_taxon>(defaultCartTaxon)
    let [submitLoading,setSubmitLoading] = useState<boolean>(false)
    let cartTimeout;
    function changeCartTaxon(newCartTaxon: I_cartTab_bundle_taxon) {
        setCartTaxon(newCartTaxon);
        clearTimeout(cartTimeout);
        cartTimeout = setTimeout(() => {
            let newCart: I_state_cart = JSON.parse(JSON.stringify(cart));
            let cartTab: I_cartTab_bundle = newCart.Bundle as I_cartTab_bundle;
            if (!cartTab) { newCart.Bundle = { taxons: {},type:'Bundle' } }
            if (!cartTab.taxons[taxon.id]) { cartTab.taxons[taxon.id] = newCartTaxon }
            newCart.Bundle = cartTab;
            actionClass.setCart(newCart)
        }, 1000)
    }
    useEffect(() => {
        try {
            let cartTab = cart.Bundle as I_cartTab_bundle;
            let cartTaxon: I_cartTab_bundle_taxon = cartTab.taxons[taxon.id];
            setCartTaxon(cartTaxon)
        }
        catch { }
    }, [])
    function removeCartTaxon() {
        changeCartTaxon(defaultCartTaxon)
    }
    function editCartTaxon(newCartTaxon: I_cartTab_bundle_taxon) {
        for (let i = 0; i < taxon.products.length; i++) {
            let product = taxon.products[i];
            let { variants, qty,price } = product;
            let cartProduct = newCartTaxon.products[product.id];
            //اطلاعات پروداکت در کارت را در صورت عدم وجود بساز
            if (!cartProduct) { newCartTaxon.products[product.id] = { variants: {},qty,price } }
            if (variants.length < 2) {
                let { id, step } = variants[0];
                newCartTaxon.products[product.id].variants[id] = { count: qty, step }
            }
            else {
                for (let i = 0; i < variants.length; i++) {
                    let { id, step } = variants[i];
                    newCartTaxon.products[product.id].variants[id] = { count: 0, step }
                }
            }
        }
        changeCartTaxon(newCartTaxon)
    }
    function changeTaxonCount(dir: 1 | -1) {
        let newCartTaxon: I_cartTab_bundle_taxon = JSON.parse(JSON.stringify(cartTaxon))
        newCartTaxon.count += dir;
        if (newCartTaxon.count < 0) { newCartTaxon.count = 0 }
        if (newCartTaxon.count > taxon.max) { newCartTaxon.count = taxon.max }
        if (newCartTaxon.count === 0) { removeCartTaxon() }
        else { editCartTaxon(newCartTaxon) }
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
            align: 'v', className: 'p-12 br-6', style: { background: '#DCE1FF' }, gap: 12,
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
            size: 40, html: <Icon path={path} size={1} />, align: 'vh', onClick: () => changeTaxonCount(dir),
            style: { background: '#3B55A5', height: 40, color: '#fff', borderRadius: 6, opacity }
        }
    }
    function productSingleVariant_layout(product:I_bundle_product) {
        return {
            style: { color: '#107C10' },
            row: [
                { html: <Icon path={mdiCheckCircle} size={0.7} /> },
                { size: 6 },
                { html: `${product.qty + ' واحد'} ${product.name} انتخاب شده`, align: 'v', className: 'fs-14 bold' }
            ]
        }
    }
    function getFillCount(product:I_bundle_product):number {
        let selectedCount:number = 0;
        for(let variantId in cartTaxon.products[product.id].variants){
            let cartVariant = cartTaxon.products[product.id].variants[variantId];
            selectedCount += cartVariant.count
        }
        return selectedCount;
    }
    function products_layout() {
        if (!cartTaxon.count) { return false }
        return {column: taxon.products.map((product: I_bundle_product) => product_layout(product))}
    }
    function product_layout(product:I_bundle_product){
        if (product.variants.length < 2) {return productSingleVariant_layout(product)}
        //بر حسب تعداد بسته انتخابی مجموع تعداد انتخاب شده ی واریانت ها باید برابر این مقدار باشد 
        let totalCount: number = cartTaxon.count * product.qty;
        //تعدادی که تعیین نوع شده است
        let fillCount:number = getFillCount(product);
        return {
            gap:12,column: [
                product_layout_label(product),
                product_layout_sliders(product,totalCount,fillCount),
                product_layout_message(product,totalCount,fillCount),
                { html: <div style={{ height: 6, background: '#f8f8f8', width: '100%' }}></div> }
            ]
        }
    }
    function product_layout_label(product:I_bundle_product){
        return {html: `نوع کالاها در ${cartTaxon.count + ' بسته ' + product.name} را انتخاب کنید`,align: 'v',className: 'theme-dark-font-color fs-14 bold'}
    }
    function product_layout_sliders(product:I_bundle_product,totalCount:number,fillCount:number){
        return {gap: 6, column: product.variants.map((variant:I_bundle_variant) => slider_layout(product,variant,totalCount,fillCount))}
    }
    function product_layout_message(product:I_bundle_product,totalCount:number,fillCount:number){
        let isFull = totalCount === fillCount;
        return {
            style: { color: isFull ? '#107C10' : '#d0000a' },
            row: [
                { html: <Icon path={isFull ? mdiCheckCircle : mdiAlertCircle} size={0.7} /> },
                { size: 6 },
                { html: `${fillCount + ' عدد'} از ${product.qty + ' عدد'} کالا تعیین نوع شده`, align: 'v', className: 'fs-14 bold' }
            ]
        }
    }
    function slider_layout(product:I_bundle_product,variant:I_bundle_variant,totalCount:number,fillCount:number){
        let newCartTaxon:I_cartTab_bundle_taxon = JSON.parse(JSON.stringify(cartTaxon));
        let cartProduct = newCartTaxon.products[product.id];
        let {id:variantId,name:variantName,step} = variant;
        //تعداد انتخاب شده ی این واریانت در سبد خرید
        let count:number = cartProduct.variants[variantId].count;
        //حد اکثر تعدادی که این واریانت در این لحظه می تواند بگیرد
        let max:number = count + (totalCount - fillCount);
        let onChange:((count:number)=>void) = (count)=>{
            cartProduct.variants[variantId].count = count;
            changeCartTaxon(newCartTaxon)
        }
        let sliderProps = {totalCount,max,onChange,count,variantName,step}
        return {size: 72,html: (<BundleSlider key={product.id + variantId} {...sliderProps}/>)}
    }
    function footer_layout(){
        return {
            style: { boxShadow: '0 0px 6px 1px rgba(0,0,0,.1)' }, className: "p-24 bg-fff",
            row: [
                {
                    show:!!cartTaxon.count,className: 'p-h-24 bgFFF theme-link-font-color bold',
                    html:(<button disabled={!!submitLoading} className='button-2' onClick={()=>edameye_farayande_kharid()}>ادامه فرایند خرید</button>)
                },
                { flex: 1 },
                { html:`${SplitNumber(taxon.price * (cartTaxon.count || 1))} ریال`, className: "theme-dark-font-color bold" }
            ]
        }
    }
    function fixCart():boolean{
        let hasError = false;
        for(let i = 0; i < taxon.products.length; i++){
            let product:I_bundle_product = taxon.products[i];
            let totalCount = cartTaxon.count * product.qty;
            let fillCount = getFillCount(product);
            let emptyCount = totalCount - fillCount;
            if(!emptyCount){continue}
            hasError = true;
            let newCartTaxon:I_cartTab_bundle_taxon = JSON.parse(JSON.stringify(cartTaxon))
            //تنظیم واریانتی که در صورت خالی بودن باید مقادیر به آن اضافه شود
            let firstVariant = product.variants[0];
            newCartTaxon.products[product.id].variants[firstVariant.id].count += emptyCount;
            changeCartTaxon(newCartTaxon)
        }
        return hasError;
    }
    function edameye_farayande_kharid(){
        let hasError = fixCart();
        if(hasError){
            setSubmitLoading(true)
            setTimeout(()=>{
                setSubmitLoading(false);
                actionClass.openPopup('cart');
            },2000)    
        }
        else {actionClass.openPopup('cart');}
    }
    function body_layout(){
        return { flex: 1, className: "ofy-auto m-v-12", gap: 12, column: [image_layout(), taxonDetails_layout(), count_layout()] }
    }
    return (<RVD layout={{className: "theme-popup-bg",column: [body_layout(),footer_layout()]}}/>);
}
type I_BundleSlider = { count: number, variantName: string, totalCount: number, onChange: any, max: number, step: number }
function BundleSlider(props: I_BundleSlider) {
    let { variantName, totalCount, onChange = () => { }, max, step,count } = props;
    let percent = (count / totalCount * 100).toFixed(0);
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
                                        attrs={{ style: { padding: '0 30px' } }}
                                        scaleStep={[max]}
                                        scaleStyle={(value:number) => { if (value === max) { return { background: '#2BBA8F' } } }}
                                        labelStep={[max]}
                                        labelStyle={(value:number) => { if (value === max) { return { color: '#2BBA8F', fontSize: 12, top: 43 } } }}
                                        start={0} direction='left'
                                        end={totalCount}
                                        max={max}
                                        step={step}
                                        value={count}
                                        lineStyle={{ height: 4 }}
                                        showValue={true}
                                        fillStyle={(index:number) => {
                                            if (index === 0) { return { height: 4, background: '#2BBA8F' } }
                                        }}
                                        valueStyle={{
                                            background: '#2BBA8F', height: 14, top: -24,
                                            display: 'flex', alignItems: 'center', fontSize: 12
                                        }}
                                        pointStyle={{ background: '#2BBA8F', width: 16, height: 16, zIndex: 1000 }}
                                        onChange={(newCount:number) => onChange(newCount)}
                                        after={<div style={{ padding: '0 3px', color: '#666', width: 24, borderRadius: 6, fontSize: 10 }}>{percent + '%'}</div>}
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
type I_CartButton = { product: I_product, renderIn: I_shopRenderIn, variantId: string, onChange?: Function, cartId: string, taxonId?: string }
function CartButton(props: I_CartButton) {
    let { actionClass, cart }: I_app_state = useContext(appContext);
    let { product, renderIn, variantId, onChange = () => { }, taxonId, cartId } = props;
    function openCart(e) {
        e.stopPropagation();
        actionClass.openPopup('cart', product.cartId)
    }
    let count = 0;
    if (cart[cartId]) {
        if (taxonId) {
            let cartTab = cart[cartId] as I_cartTab_taxon
            if (cartTab.taxons[taxonId]) {
                if (cartTab.taxons[taxonId].products[product.id]) {
                    if (cartTab.taxons[taxonId].products[product.id].variants[variantId]) {
                        count = cartTab.taxons[taxonId].products[product.id].variants[variantId].count as number;
                    }
                }
            }
        }
        else {
            let cartTab = cart[cartId] as I_cartTab
            if (cartTab.products[product.id]) {
                if (cartTab.products[product.id].variants[variantId]) {
                    count = cartTab.products[product.id].variants[variantId].count as number;
                }
            }

        }
    }
    let layout;
    if (!count) {
        layout = {
            html: () => (
                <button
                    onClick={() => {
                        actionClass.changeCart({ variantId, product, count: 1, cartId, taxonId })
                        onChange(1)
                    }}
                    className="button-2"
                    style={{ fontSize: 12, height: 36, padding: '0 8px' }}
                >افزودن به سبد خرید</button>
            )
        }
    }
    else if (renderIn === 'shipping') {
        layout = {
            align: 'h', gap: 3, className: 'fs-12 color3B55A5', onClick: (e) => openCart(e),
            row: [{ html: <Icon path={mdiCart} size={1} />, align: 'vh' }, { html: count, align: 'v', className: 'fs-18' }]
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
                                actionClass.changeCart({ product, variantId, count, cartId, taxonId })
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
        // clearTimeout(this.timeout);
        // clearInterval(this.interval);
        // this.timeout = setTimeout(()=>{
        //   this.interval = setInterval(()=>{
        //     let {value} = this.state;
        //     let {min = 0} = this.props;
        //     this.change(value + dir,Math.max(min,1))
        //   },60)
        // },800)
    }
    function touchEnd() {
        $(window).unbind('touchend', touchEnd)
        $(window).unbind('mouseup', touchEnd)
        // clearTimeout(this.timeout)
        // clearInterval(this.interval) 
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
    function offset(v) {
        value = +value;
        if (isNaN(value)) { value = 0 }
        value += v;
        if (value < 0) { value = 0 }
        return value;
    }
    let timeout, interval;
    function change(v) {
        eventHandler('window', 'mouseup', mouseup);
        setValue(offset(v));
        clearTimeout(timeout)
        clearInterval(interval)
        timeout = setTimeout(() => interval = setInterval(() => setValue(offset(v)), 10), 700)
    }
    function mouseup() {
        this.eventHandler('window', 'mouseup', this.mouseup, 'unbind');
        clearTimeout(this.timeout)
        clearInterval(this.interval)
    }
    function eventHandler(selector, event, action, type = "bind") {
        var me = { mousedown: "touchstart", mousemove: "touchmove", mouseup: "touchend" };
        event = "ontouchstart" in document.documentElement ? me[event] : event;
        var element = typeof selector === "string" ? (selector === "window" ? $(window) : $(selector)) : selector;
        element.unbind(event, action);
        if (type === "bind") { element.bind(event, action); }
    }
    let touch = "ontouchstart" in document.documentElement;
    function changeButton_layout(dir: 1 | -1) {
        return {
            size: 48, html: <Icon path={mdiPlusThick} size={1} />, align: 'vh',
            attrs: { [touch ? 'onTouchStart' : 'onMouseDown']: () => change(dir) }
        }
    }
    function input_layout() {
        return {
            flex: 1,
            html: (
                <input
                    type='number' value={value} min={0}
                    ref={dom}
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
                    { gap: 3, row: [changeButton_layout(1), input_layout(), changeButton_layout(-1)] },
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