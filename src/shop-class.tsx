import React, { Component, Fragment, useContext, useEffect, useState,createRef } from "react";
import RVD from './npm/react-virtual-dom/react-virtual-dom';
import AIOStorage from 'aio-storage';
import { Icon } from '@mdi/react';
import { mdiMinusThick, mdiPlusThick,mdiChevronLeft, mdiChevronDown, mdiCheckCircle, mdiAlertCircle, mdiCart, mdiPlus, mdiMinus, mdiTrashCanOutline } from "@mdi/js";
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
import { I_ShopClass, I_ShopClass_taxon, I_app_state, I_bundleCount, I_cartProduct, I_cartTab, I_cartTab_isTaxon, I_cartTaxon, I_cartVariant, I_discount, I_product, I_shippingOptions, I_shopRenderIn, I_state_cart, I_variant } from "./types";


export default class ShopClass implements I_ShopClass {
    constructor({ getAppState, config }) {
        this.getAppState = getAppState;
        this.update(config);
    }
    update(obj) { for (let prop in obj) { this[prop] = obj[prop]; } }
    dicToArray = (dic:{[key:string]:any}) => Object.keys(dic).map((key)=>dic[key])
    /****type defined**** */
    getAppState:()=>I_app_state;
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
    icon?:string;
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
                        parameter: { id: product.id, code: product.defaultVariant.code, product }
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
            onRemove: () => actionClass.changeCart({ count: 0, variantId: product.code, product, cartId: this.cartId })
        }
        let Wrapper = this.id === 'Bundle' ? BundleCard : RegularCard;
        return (<Wrapper key={product.id} {...props} />)
    }
    renderPage = (product) => {
        let { actionClass } = this.getAppState()
        let props = {
            product,  maxCart: this.maxCart, cartId: this.cartId, CampaignId: this.CampaignId,
            onShowCart: () => actionClass.openPopup('cart'),
            //use in bundle
            onChangeCount: (count) => {
                actionClass.changeCart({ product, variantId: product.code, count, cartId: this.cartId, taxonId, CampaignId: this.CampaignId })
            }
        }
        let Wrapper = this.cartId === 'Bundle' ? BundlePage : RegularPage;
        return <Wrapper {...props} />
    }
    renderTaxonCard = (p) => {
        let { taxon, renderIn, index, , errors = [], hasErrors = [] } = p;
        let { apis, msfReport, cart } = this.getAppState();
        let props = {
            title: taxon.name, taxon, renderIn, index, errors, cart, cartId: this.cartId, hasErrors,
            renderProductCard: (product, index) => {
                return this.renderCard({ product, index, renderIn });
            }
        }
        return (<TaxonCard key={taxon.id} {...props} />)
    }
    getCartVariants = ()=>{
        function getVariants(parent){
            let res = []
            for(let productId in parent.products){
                let {variants,product} = parent.products[productId]
                for(let variantId in variants){
                    let {count,variant} = variants[variantId]
                    res.push({cartId,productId,variantId,product,variant,count,taxon:parent.taxon,taxonId:parent.taxonId})
                }
            }
            return res
        }
        let { cart } = this.getAppState();
        let cartId = this.cartId;
        if (!cart[cartId]) { return [] }
        if(this.taxons){
            let res = []
            let cartTab = cart[cartId] as I_cartTab_isTaxon;
            for(let taxonId in cartTab.taxons){res = [...res,getVariants(cartTab.taxons[taxonId])]}
            return res
        }
        else {return getVariants(cart[cartId])}
    }
    openCategory = async(id?:string) => {
        let { apis,rsa, actionClass, msfReport } = this.getAppState(); 
        let props;
        if (this.cartId === 'Bundle') {
            props = { products: this.products }
        }
        else if (this.cartId === 'Regular') {
            let { spreeCategories } = this.getAppState();
            let products = await this.getCategoryProducts(id);
            let { billboard, name, description } = spreeCategories.dic[id];
            return { billboard, products, description }
        }
        else {
            if (!this.products) {
                if (this.taxons) {
                    this.products = [...this.taxons]
                }
                else {
                    this.products = await apis.request({
                        api: 'kharid.getCampaignProducts', description: 'دریافت محصولات کمپین', def: [],
                        parameter: { id: this.cartId, CampaignId: this.CampaignId, PriceListNum: this.PriceListNum },
                        cache: { time: 30 * 24 * 60 * 60 * 1000, name: 'campaigns.campaignProducts.item_' + this.cartId }
                    });
                }
            }
            return { billboard: this.billboard, products: this.products, description: this.description, title: this.name, isTaxon: !!this.taxons }
        }

        msfReport({ actionName: 'open category', actionId: 4, targetName: res.title, targetId: id, tagName: 'kharid', eventName: 'page view' })
        let buttons = actionClass.getHeaderIcons({ cart: true })
        rsa.addModal({
            id: 'shop-class-category',
            position: 'fullscreen',
            body: { render: () => this.getCategory(res) },
            header: { title: res.title, buttons }
        })
    }
    payment = async (obj:I_shippingOptions) => {
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
    
    
    //جمع قیمت سبد خرید بدون تخفیف
    getCartVariantsTotal = (cartVariants:I_cartVariant[]) => {
        let total = 0;
        for(let i = 0; i < cartVariants.length; i++){
            total += cartVariants[i].variant.Price
        }
        return total;
    }
    getAmounts = (shippingOptions:I_shippingOptions, container?:string) => {
        if (this.cartId === 'Bundle') { return this.getAmounts_Bundle(shippingOptions, container) }
        else { return this.getAmounts_all(shippingOptions, container) }
    }
    getAmounts_all(shippingOptions:I_shippingOptions, container?:string) {
        let { actionClass } = this.getAppState();
        let cartVariants = this.getCartVariants();
        let total = this.getCartVariantsTotal(cartVariants)
        let marketingLines = this.getMarketingLines(cartVariants);
        let factorDetails = actionClass.getFactorDetails(marketingLines, { ...shippingOptions, CampaignId: this.CampaignId }, container);
        let { marketingdetails, DocumentTotal } = factorDetails;
        let { DiscountList, ClubPoints = {} } = marketingdetails;
        let { DiscountValueUsed, DiscountPercentage, PaymentDiscountPercent, PaymentDiscountValue, PromotionValueUsed } = DiscountList;
        let discounts:I_discount[] = []
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
    getAmounts_Bundle = (shippingOptions:I_shippingOptions, container?:string) => {
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
        let discounts:I_discount[] = [];
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
        if (this.taxons) {cartItems = this.dicToArray((cartTab as I_cartTab_isTaxon).taxons)}
        else {cartItems = this.dicToArray((cartTab as I_cartTab).products)}
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
                let props = {taxon,renderIn}
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
        let marketingLines = this.getMarketingLines(this.getCartVariants())
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
    getMarketingLines = (cartVariants:I_cartVariant[]) => {
        if (this.cartId === 'Bundle') { return this.getMarketingLiens_Bundle(cartVariants) }
        else { return cartVariants.map((o:I_cartVariant)=>{return {ItemCode:o.variantId,ItemQty:o.count}}) }
    }
    getMarketingLiens_Bundle(cartVariants:I_cartVariant[]) {
        let list = [];
        for (let j = 0; j < cartVariants.length; j++) {
            let cartVariant = cartVariants[j];
            let count = cartVariant.count as I_bundleCount
            const items = count.qtyInPacks;
            let packQty = count.packQty;
            for (const key in items) {
                for (let i = 0; i < items[key].length; i++) {
                    list.push({ ...items[key][i], variantId: cartVariant.variantId, packQty: packQty });
                }
            }
        }
        return list.map((o) => {
            return {
                ItemCode: o.optionValueId, ItemQty: o.count, Price: o.unitPrice,
                BasePackCode: o.variantId, BasePackQty: o.packQty
            }
        })
    }
    getPaymentButtonText = (shippingOptions:I_shippingOptions) => {
        if (this.cartId === 'Bundle') { return shippingOptions.SettleType !== 2 ? 'پرداخت' : 'ثبت' }
        else { return 'ارسال برای ویزیتور' }
    }
    getCategory = ({ products }) => {
        let props = {billboard:this.billboard,description:this.description}
        if (this.taxons) {
            let renderProductCard = (product, index) => this.renderTaxonCard({ 
                taxon: product, index, renderIn: 'category', taxonId: product.id 
            })
            return (<CategoryView {...props} renderProductCard={renderProductCard} products={products}/>)
        }
        else {
            let renderProductCard = (product, index) => this.renderCard({ product, index, renderIn: 'category' })
            return (<CategoryView {...props} renderProductCard={renderProductCard} products={products}/>)
        }

    }
    async getCategoryProducts(id, count) {
        let { apis } = this.getAppState();
        return await apis.request({
            api: 'kharid.getCategoryProducts', parameter: { id, count }, description: 'دریافت محصولات دسته بندی', def: [],
            cache: { time: 30 * 24 * 60 * 60 * 1000, name: 'categories.categoryProducts.item_' + id + (count ? count : '') }
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
class CategoryView extends Component {
    constructor(props) {
        super(props);
        this.state = { searchValue: '' }
    }
    search_layout() {
        let { searchValue } = this.state;
        return { html: <SearchBox value={searchValue} onChange={(searchValue) => this.setState({ searchValue })} /> }
    }
    banner_layout() {
        let { billboard } = this.props;
        if (!billboard) { return false }
        return { html: <img src={billboard} alt='' width='100%' /> }
    }
    description_layout() {
        let { description } = this.props;
        if (!description) { return false }
        return { html: description, style: { textAlign: 'right', padding: '0 12px' } }
    }
    product_layout(product, index) {
        let { searchValue } = this.state;
        let { renderProductCard } = this.props;
        if (searchValue && product.name.indexOf(searchValue) === -1) { return false; }
        return { html: renderProductCard(product, index, product.isTaxon ? (products) => { product.products = products; this.setState({}) } : undefined), className: 'of-visible' }
    }
    getProductsBySearch(products) {
        let { searchValue } = this.state;
        return products.filter((o) => {
            if (!searchValue) { return true }
            return o.name.indexOf(searchValue) !== -1
        })
    }
    render() {
        let { products = [] } = this.props;
        return (
            <RVD
                layout={{
                    className: 'theme-popup-bg',
                    column: [
                        this.search_layout(),
                        {
                            flex: 1, className: 'ofy-auto',
                            column: [
                                this.banner_layout(),
                                { size: 12 },
                                this.description_layout(),
                                { size: 12 },
                                {
                                    gap: 12,
                                    column: this.getProductsBySearch(products).map((product, index) => this.product_layout(product, index))
                                }
                            ]
                        },
                        { size: 12 }
                    ],
                }}
            />
        )
    }
}
type I_TaxonCard = {taxon:I_ShopClass_taxon,cartId:string,renderIn:I_shopRenderIn,renderProductCard:any}
function TaxonCard(props:I_TaxonCard) {
    let {apis,Shop,cart}:I_app_state = useContext(appContext);
    let storage = AIOStorage('taxonCardToggle');
    let {taxon,cartId,renderIn,renderProductCard} = props;
    let [open,setOpen] = useState<boolean>(storage.load({name:'toggle' +taxon.id,def:false}))
    let [products,setProducts] = useState<I_product[] | undefined>()
    async function click(){setOpen(!open); storage.save({name:'toggle' +taxon.id,value:!open})}
    
    function close_layout() {
        return (
            <RVD 
                layout={{ 
                    className: 'p-12 theme-box-shadow', onClick:()=>click(), 
                    row:[
                        {size:36,align:'vh',html:<Icon path={mdiChevronLeft} size={.8}/>},
                        {html: taxon.name,align:'v'}
                    ] 
                }} 
            />
        )
    }
    function groupDiscount_layout(){
        if(renderIn !== 'cart' && renderIn !== 'shipping'){return false}
        let cartTab = cart[cartId] as I_cartTab_isTaxon;
        if(!cartTab){return false}
        let cartLength = Object.keys(cartTab.taxons).length;
        return {
            align: 'v',html: `تخفیف گروه کالا ${0.5 * cartLength} درصد`,
            className: 'fs-10', style: { color: 'green', background: '#fff' }
        }
    }
    function taxonName_layout(){
        return {
            onClick:(e)=>{e.stopPropagation(); this.click()},
            row:[
                {html:<Icon path={mdiChevronDown} size={0.8}/>,align:'vh',size:36},
                { html: taxon.name, flex: 1, align: 'v' },
            ]
        }
    }
    function products_layout(){return { column: products.map((o, i) => { return { html: renderProductCard(o, i) } }) }}
    function range_layout(){
        let Min = SplitNumber(taxon.min),Max = SplitNumber(taxon.max);
        return {
            gap: 12, align: 'v', className: 'fs-10', style: { color: 'orange' },
            row: [{ html: `حداقل مبلغ ${Min} ریال` },{ html: `حداکثر مبلغ ${Max} ریال` },]
        }
    }
    function open_layout() {
        return (<RVD layout={{className: 'p-12 theme-box-shadow',column: [taxonName_layout(),products_layout(),groupDiscount_layout(),range_layout()]}}/>)
    }
    useEffect(()=>{getProducts()},[cart,open])
    async function getProducts(){
        if(renderIn === 'cart' || renderIn === 'shipping'){
            let cartTab = cart[cartId] as I_cartTab_isTaxon;
            let productDic = cartTab.taxons[taxon.id].products;
            let products = []
            for(let productId in productDic){products.push(productDic[productId])}
            setProducts(products)
        }
        else {
            let {CampaignId,PriceListNum} = Shop[cartId]
            let products = await apis.request({
                api: 'kharid.getCampaignProducts', description: 'دریافت محصولات کمپین', def: [],
                parameter: { id: taxon.id, cartId, CampaignId, PriceListNum },
                cache: { time: 30 * 24 * 60 * 60 * 1000, name: `campaigns.campaignProducts.item_${cartId}_${taxon.id}` }
            });
            setProducts(products)
        }
    }
    return open && products?open_layout():close_layout()
}
type I_RegularCard = { product: I_product, cartId: string, cartName: string, taxonId, CampaignId?: number, renderIn, index?: number, loading?: boolean, onClick?: Function, type?: 'horizontal' | 'vertical' }
function RegularCard(props: I_RegularCard) {
    let { cart }: I_app_state = useContext(appContext);
    let [mounted, setMounted] = useState<boolean>(false)
    let { product, cartId, taxonId, CampaignId, renderIn, cartName, index, loading, onClick, type = 'horizontal' } = props;
    function image_layout() {
        let { srcs = [] } = product;
        return { size: 116, align: 'vh', html: <img src={srcs[0] || NoSrc} width={'100%'} alt='' /> }
    }
    function count_layout() {
        let cartTab = cart[cartId];
        if (!cartTab) { return false }

        let cartItems = {}
        if (cartTab.isTaxon === true) {
            for (let taxonId in cartTab.taxons) {
                let cartTaxon = cartTab.taxons[taxonId];
                for (let productId in cartTaxon.products) {
                    if (product.id === productId) {
                        let cartProduct = cartTaxon.products[productId];
                        cartItems = cartProduct.variants
                    }
                }
            }
        }
        else {
            for (let productId in cartTab.products) {
                if (product.id === productId) {
                    let cartProduct = cartTab.products[productId];
                    cartItems = cartProduct.variants
                }
            }
        }
        let keys = Object.keys(cartItems);
        if (!keys.length) { return false }
        let variantsDic = {}
        product.variants.map(({ id }) => variantsDic[id] = true)
        keys = keys.filter((variantId) => !!variantsDic[variantId])
        if (!keys.length) { return false }
        let column = keys.map((variantId) => {
            let { count, variant } = cartItems[variantId];
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
                            { show: !isNaN(unitTotal), className: 'theme-light-font-color fs-9', html: () => `مجموع ${SplitNumber(unitTotal)} ریال` }
                        ]
                    },
                    {
                        html: (
                            <CartButton renderIn={renderIn} product={product} variantId={variantId} cartId={cartId} taxonId={taxonId} CampaignId={CampaignId} />
                        ), align: 'vh'
                    }
                ]
            }
        })
        return { gap: 3, style: { background: '#fff' }, column }
        //return { size: 36, html: () => <CartButton renderIn={renderIn} product={product} variantId={variantId} cartId={cartId} taxonId={taxonId} CampaignId={CampaignId}/> }
    }
    function title_layout() {
        return { html: cartName, className: 'fs-10', style: { color: 'rgb(253, 185, 19)' } }
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
        let { srcs = [], name } = product;
        return (
            <RVD
                loading={loading}
                layout={{
                    className: 'theme-card-bg theme-box-shadow theme-border-radius of-visible w-168 h-288 fs-14 br-12',
                    onClick,
                    column: [
                        { size: 140, align: 'vh', html: <img src={srcs[0] || NoSrc} width={'100%'} style={{ width: 'calc(100% - 24px)', height: '100%', borderRadius: 8 }} alt='' />, style: { padding: 6, paddingBottom: 0 } },
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
type I_BundleCard = { cartName: string, product: I_product, renderIn: I_shopRenderIn, count: { qtyInPacks: any, count: number }, index?: number,onClick?:Function }
function BundleCard(props: I_BundleCard) {
    let { actionClass }: I_app_state = useContext(appContext)
    let { cartName, product, renderIn, count, index = 0,onClick } = props;
    let [mounted, setMounted] = useState<boolean>(false)
    function title_layout() {
        if (!cartName) { return false }
        return {
            row: [
                { html: cartName, style: { color: '#FDB913' }, className: 'fs-12 bold', align: 'v' },
                { size: 3 },
                { flex: 1, html: (<div style={{ height: 2, width: '1100%', background: '#FDB913' }}></div>), align: 'v' }
            ]
        }
    }
    function image_layout() {
        let { src = '' } = product;
        return {
            column: [
                { flex: 1, size: 114, html: <img src={src} alt='' width='100%' height='100%' className='br-12' /> },
                { show: renderIn === 'cart', size: 30, html: 'حذف از سبد', align: 'vh', style: { color: 'red' }, className: 'bold fs-14' }
            ]
        }
    }
    function name_layout() {
        let { name } = product;
        return { html: name, className: 'fs-14 theme-dark-font-color bold', style: { textAlign: 'right' } }
    }
    function detail_layout() {
        let { variants } = product;
        if (count) {
            let str = '';
            for (let prop in count.qtyInPacks) {
                str += ` ${prop}`;
                for (let i = 0; i < count.qtyInPacks[prop].length; i++) {
                    let o = count.qtyInPacks[prop][i];
                    str += ` ${o.count} عدد ${o.optionValueName}`
                }
                str += ' *** '
            }
            return {
                column: [
                    { html: str },
                    {
                        show: !!product.clubpoint,
                        gap: 3, className: 'fs-9 m-t-12 bold', align: 'v',
                        row: [
                            { html: 'با خرید این محصول' },
                            { html: product.clubpoint, className: 'fs-12', style: { color: 'orange' } },
                            { html: 'امتیاز باشگاه مشتریان دریافت کنید' },

                        ]
                    }
                ], className: 'fs-12 theme-medium-font-color', style: { textAlign: 'right' }
            }

        }
        let names = variants.map(({ name }) => name);
        return {
            column: [
                { html: names.join(' - ') },
                {
                    show: !!product.clubpoint,
                    gap: 3, className: 'fs-9 m-t-12 bold', align: 'v',
                    row: [
                        { html: 'با خرید این محصول' },
                        { html: product.clubpoint, className: 'fs-12', style: { color: 'orange' } },
                        { html: 'امتیاز باشگاه مشتریان دریافت کنید' },

                    ]
                }
            ], className: 'fs-12 theme-medium-font-color', style: { textAlign: 'right' }
        }
    }
    function price_layout() {
        return {
            size: 36,
            row: [
                {
                    flex: 1, className: 'fs-14 bold theme-dark-font-color',
                    align: 'v', row: [{ flex: 1 }, { html: SplitNumber(product.price) }, { size: 3 }, { html: 'ریال' }]
                },
            ]
        }
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
                    this.title_layout(),{ size: 6 },
                    {
                        gap:12,row: [
                            {size: 114, column: [this.image_layout()]},
                            {flex: 1,column: [this.name_layout(),{ size: 6 },this.detail_layout(),{ flex: 1 },this.price_layout()]}
                        ]
                    },
                ]
            }}
        />
    )
}
type I_RegularPage = {product:I_product}
function RegularPage(props:I_RegularPage) {
    let {product} = props;
    let [mounted,setMounted] = useState<boolean>(false)
    let [selectedVariant,setSelectedVariant] = useState<I_variant|undefined>()
    let [optionValues,setOptionValues] = useState<>()
    useEffect(()=>{
        setMounted(true)
        let {ovs,options} = getVariants()
        let firstVariant = product.inStock ? (product.variants.filter((o) => o.inStock)[0]) : undefined;
        let optionValues = firstVariant ? { ...firstVariant.optionValues } : undefined;
        set
        this.setState({
            optionValues, showDetails: true,
            selectedVariant: firstVariant, srcIndex: 0
        });
    },[])
    componentDidMount() {
        
    }
    getVariants() {
        let { variants, optionTypes } = product;
        let optionTypesDict = {}
        let optionValuesDict = {}
        for (let i = 0; i < optionTypes.length; i++) {
            let o = optionTypes[i];
            optionTypesDict[o.id] = o.name;
            for (let prop in o.items) {
                let id = prop.toString();
                let name = o.items[id];
                optionValuesDict[id] = name;
            }
        }
        let res = [];
        this.ovs = []

        for (let i = 0; i < variants.length; i++) {
            let { optionValues, inStock, id } = variants[i];
            if (!inStock) { continue }
            let str = [];
            for (let prop in optionValues) {
                str.push(optionTypesDict[prop] + ' : ' + optionValuesDict[optionValues[prop]])
                this.ovs.push(optionValuesDict[optionValues[prop]]);
            }
            str = str.join(' -- ')
            res.push({ text: str, value: id, variant: variants[i], style: { height: 36 } })
        }
        this.options = res;
    }
    getVariantBySelected(selected) {
        let { product } = this.props;
        for (let i = 0; i < product.variants.length; i++) {
            let variant = product.variants[i];
            let { optionValues } = variant;
            let isMatch = true;
            for (let prop in selected) {
                if (selected[prop] !== optionValues[prop]) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) {
                return variant;
            }
        }
        return false;
    }
    changeOptionType(obj) {
        let { optionValues } = this.state;
        let keys = Object.keys(obj)
        for (let i = 0; i < keys.length; i++) {
            //let key = keys[i];
            let newSelected;
            // if(obj[key] === optionValues[key]){
            //     newSelected = {...optionValues,[key]:undefined};
            // }
            // else{
            newSelected = { ...optionValues, ...obj };
            //}
            let variant = this.getVariantBySelected(newSelected);
            this.setState({
                optionValues: newSelected,
                selectedVariant: variant
            });
        }
    }
    body_layout() {
        let { product } = this.props;
        let { name, optionTypes, details, srcs } = product;
        let { srcIndex, selectedVariant } = this.state;
        let code = selectedVariant ? selectedVariant.code : undefined;
        return {
            flex: 1, className: "ofy-auto", gap: 12,
            column: [
                this.image_layout(name, code, srcs[srcIndex]),
                this.options_layout(),
                this.optionTypes_layout(optionTypes),
                this.details_layout(details),

            ],
        };
    }
    image_layout(name, code, src) {
        let { product } = this.props, { srcIndex } = this.state;
        return {
            size: 346, className: "theme-box-shadow theme-card-bg theme-border-radius m-h-12",
            column: [
                { size: 24 },
                {
                    flex: 1, style: { overflow: 'hidden' },
                    childsProps: { align: "vh" },
                    row: [
                        { size: 36, html: getSvg("chevronLeft", { flip: true }), style: { opacity: srcIndex === 0 ? 0.5 : 1 } },
                        { flex: 1, html: <img src={src} alt="" height="100%" /> },
                        { size: 36, html: getSvg("chevronLeft"), style: { opacity: srcIndex === product ? 0.5 : 1 } },
                    ],
                },
                { size: 12 },
                { size: 36, html: name, className: "fs-14 theme-dark-font-color bold p-h-12" },
                { size: 36, html: "کد کالا : " + (code || ""), className: "fs-12 theme-medium-font-color p-h-12" },
            ]
        };
    }
    options_layout() {
        let { product } = this.props;
        if (product.optionTypes.length < 2) { return false }
        let { selectedVariant } = this.state;

        return {
            className: 'theme-card-bg theme-box-shadow theme-border-radius m-h-12', hide_xs: true,
            column: [
                { size: 12 },
                {
                    row: [
                        { html: `(${this.options.length}) انتخاب اقلام موجود`, align: 'v', className: 'p-h-12 theme-medium-font-color fs-14 bold', style: { direction: 'ltr' } },
                        { flex: 1 }
                    ]
                },
                {
                    align: 'v', className: 'p-12',
                    html: (
                        <AIOInput
                            type='select' className='product-exist-options'
                            style={{ width: '100%', fontSize: 12 }}
                            options={this.options}
                            popover={{ fitHorizontal: true }}
                            value={selectedVariant ? selectedVariant.id : undefined}
                            optionStyle={{ height: 28, fontSize: 12 }}
                            onChange={(value, obj) => {
                                this.changeOptionType(obj.option.variant.optionValues)
                            }}
                        />
                    )
                }
            ]

        }
    }
    optionTypes_layout(optionTypes) {
        let { optionValues } = this.state;
        if (!optionValues || !optionTypes) { return { html: '' } }
        return {
            className: "theme-card-bg theme-box-shadow theme-border-radius gap-no-color m-h-12 p-12",
            column: [
                {
                    gap: 6,
                    column: optionTypes.map(({ name, id, items = {} }, i) => {
                        if (name === 'brand') { return false }
                        return {
                            column: [
                                { html: name, align: "v", className: "fs-12 theme-medium-font-color bold h-24" },
                                { size: 6 },
                                {
                                    className: "ofx-auto", gap: 12,
                                    row: Object.keys(items).filter((o) => {
                                        return this.ovs.indexOf(items[o]) !== -1
                                    }).map((o) => {
                                        let itemId = o.toString();
                                        let active = false, style;
                                        if (optionValues[id] === undefined) {
                                            console.error(`
in product by id = ${this.props.product.id} there is an optionType by id = ${id}. but in optionValues we can find this id. optionValues is ${JSON.stringify(optionValues)}
                                            `)
                                        }
                                        else {
                                            active = optionValues[id].toString() === itemId;
                                        }
                                        let className = 'fs-12 p-v-3 p-h-12 br-4 product-option-value';
                                        if (active) { className += ' active'; }
                                        return { html: items[itemId], align: "vh", className, style, onClick: () => this.changeOptionType({ [id]: itemId }) };
                                    })
                                }
                            ]
                        };
                    })
                }
            ]
        };
    }
    details_layout(details) {
        let { showDetails } = this.state;
        if (!details) { return false }
        return {
            className: "theme-card-bg theme-box-shadow theme-border-radius p-12 m-h-12",
            column: [
                {
                    size: 36, childsProps: { align: 'v' },
                    onClick: (() => this.setState({ showDetails: !showDetails })),
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
    showCart_layout() {
        let { onShowCart } = this.props;
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
    footer_layout() {
        return {
            size: 80, style: { boxShadow: '0 0px 6px 1px rgba(0,0,0,.1)' }, className: "p-h-12 bg-fff",
            row: [
                this.addToCart_layout(),
                { flex: 1 },
                this.price_layout()
            ],
        };
    }
    addToCart_layout() {
        let { product, cartId, taxonId, CampaignId } = this.props;
        let { selectedVariant } = this.state;
        if (!selectedVariant || !selectedVariant.inStock) {
            return { html: '' }
        }
        return {
            column: [
                { flex: 1 },
                { html: (<CartButton variantId={selectedVariant.id} product={product} renderIn='product' cartId={cartId} taxonId={taxonId} CampaignId={CampaignId} />) },
                { flex: 1 }
            ]
        }
    }
    price_layout() {
        let { selectedVariant } = this.state;
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
    render() {
        if (!this.mounted) { return null }
        return (
            <RVD
                layout={{
                    className: "theme-popup-bg",
                    column: [
                        { size: 12 },
                        this.body_layout(),
                        { size: 12 },
                        this.showCart_layout(),
                        this.footer_layout()
                    ],
                }}
            />
        );
    }
}
class BundlePage extends Component {
    state = {}
    mounted: boolean;
    componentDidMount() {
        this.mounted = true;
        let { cartItem } = this.props;
        let count = false;
        if (cartItem) { count = cartItem.count }
        else { count = this.getQtyInPacks() }
        this.setState({ count })
    }
    getQtyInPacks() {
        let { product } = this.props;
        let { variants } = product;
        let qtyInPacks = {};
        let packQty = 0
        for (let i = 0; i < variants.length; i++) {
            let variant = variants[i];
            qtyInPacks[variant.id] = variant.variants.map((o, j) => {
                return { optionValueId: o.Code, unitPrice: variant.unitPrice, optionValueName: o.Name, count: j === 0 ? variant.qty : 0, step: o.Step }
            })
        }
        return { packQty, qtyInPacks };
    }
    changeCount(count) {
        this.setState({ count });
        clearTimeout(this.cartTimeout);
        this.cartTimeout = setTimeout(() => {
            this.updateCart()
        }, 1000)
    }
    cartTimeout(cartTimeout: any) {
        throw new Error("Method not implemented.");
    }
    image_layout(name, code, src) {
        return {
            size: 346, className: "theme-box-shadow theme-card-bg theme-border-radius m-h-12",
            column: [
                { size: 24 },
                { flex: 1, html: <img src={src} alt="" height="100%" />, align: 'vh' },
                { size: 12 },
                { size: 36, html: name, className: "fs-14 theme-dark-font-color bold p-h-12" },
                { size: 36, html: "کد کالا : " + (code || ""), className: "fs-12 theme-medium-font-color p-h-12" },
            ]
        };
    }
    clubpoint_layout() {
        let { product } = this.props;
        if (!product.clubpoint) { return false }
        return {
            gap: 3, className: "theme-box-shadow theme-card-bg theme-border-radius m-h-12 fs-10 bold p-12", align: 'v',
            row: [
                { html: 'با خرید این محصول' },
                { html: product.clubpoint, className: 'fs-12', style: { color: 'orange' } },
                { html: 'امتیاز باشگاه مشتریان دریافت کنید' }
            ]
        };
    }
    changePackQty(v) {
        let { product, maxCart = 40 } = this.props;
        let { count } = this.state;
        let { packQty, qtyInPacks } = count;
        packQty = packQty || 0;
        packQty += v;
        if (packQty < 0) { packQty = 0 }
        if (packQty > maxCart) { packQty = maxCart }
        count.packQty = packQty;
        for (let i = 0; i < product.variants.length; i++) {
            let variant = product.variants[i];
            let qtyInPack = qtyInPacks[variant.id];
            let used = 0;
            for (let j = 0; j < qtyInPack.length; j++) {
                used += qtyInPack[j].count;
            }
            let remaining = (variant.qty * (count.packQty || 0)) - used;
            if (remaining) {
                qtyInPack[0].count += remaining;
            }
        }
        this.changeCount(count)
    }
    packQty_layout() {
        let { count } = this.state;
        if (!count) { return false }
        let { maxCart = 40 } = this.props;
        let { packQty } = count;
        return {
            align: 'v',
            style: { borderRadius: 6, background: '#DCE1FF', padding: '0 12px' },
            column: [
                { size: 12 },
                {
                    row: [
                        { align: 'v', html: `تعداد بسته را مشخص کنید`, className: 'theme-dark-font-color fs-14 bold' },
                        { size: 6 },
                        { show: maxCart && maxCart !== Infinity, align: 'v', html: `( سقف ${maxCart} بسته )`, className: 'theme-dark-font-color fs-10' },

                    ]
                },
                { size: 12 },
                {
                    row: [
                        {
                            size: 40, html: <Icon path={mdiPlus} size={1} />, align: 'vh', onClick: () => this.changePackQty(1),
                            style: { background: '#3B55A5', height: 40, color: '#fff', borderRadius: 6, opacity: packQty >= maxCart ? 0.4 : 1 }
                        },
                        { size: 6 },
                        {
                            size: 48, html: packQty, align: 'vh'
                        },
                        { size: 6 },
                        {
                            size: 40, html: <Icon path={mdiMinus} size={1} />, align: 'vh', onClick: () => this.changePackQty(-1),
                            style: { background: '#3B55A5', height: 40, color: '#fff', borderRadius: 6 }
                        }
                    ]
                },
                { size: 12 }
            ]
        }
    }
    packDetails_layout() {
        let { product } = this.props;
        return {
            className: 'theme-card-bg m-h-12 p-12 theme-border-radius theme-box-shadow',
            column: [
                { html: `اقلام داخل هر یک بسته`, align: 'v', className: 'theme-dark-font-color fs-14 bold' },
                { size: 12 },
                {
                    column: product.variants.map((o) => {
                        return {
                            row: [
                                { align: 'vh', html: <img src={bundleBoxSrc} alt='' width='30' /> },
                                { size: 6 },
                                {
                                    align: 'v', html: `تعداد ${o.qty} عدد ${o.name}`, className: 'theme-medium-font-color fs-12'
                                }
                            ]
                        }
                    })
                }
            ]
        }
    }
    getSelectedCount(id) {
        let { count } = this.state;
        let { qtyInPacks } = count;
        let qtyInPack = qtyInPacks[id];
        let selectedCount = 0;
        for (let i = 0; i < qtyInPack.length; i++) {
            selectedCount += qtyInPack[i].count || 0;
        }
        return selectedCount;
    }
    isFull(id) {
        let { product } = this.props;
        let { count } = this.state;
        if (!count) { return false }
        let variant = product.variants.find((o) => o.id === id);
        let selectedCount = this.getSelectedCount(id);
        return selectedCount === variant.qty;

    }
    qtyInPacks_layout() {
        let { count } = this.state;
        if (!count) { return false }
        let { qtyInPacks, packQty } = count;
        if (!packQty) { return false }
        let { product } = this.props;
        return {
            column: product.variants.map((variant) => {
                let { qty, name, id } = variant;
                qty *= packQty;
                let qtyInPack = qtyInPacks[id]
                if (qtyInPack.length < 2) {
                    return false
                }
                let selectedCount = this.getSelectedCount(id);
                let isFull = this.isFull(id);
                return {
                    column: [
                        {
                            html: `رنگ کالاها در ${packQty + ' بسته ' + name} را انتخاب کنید`,
                            align: 'v',
                            className: 'theme-dark-font-color fs-14 bold'
                        },
                        { size: 12 },
                        {
                            gap: 6, column: qtyInPack.map((o, i) => {
                                let used = 0;
                                for (let j = 0; j < qtyInPack.length; j++) {
                                    used += qtyInPack[j].count;
                                }
                                let remaining = qty - used;
                                return {
                                    size: 72,
                                    html: (
                                        <ForoosheVijeSlider
                                            key={product.code} {...o} totalQty={qty} max={o.count + remaining}
                                            onChange={(value) => {
                                                o.count = value;
                                                this.changeCount(count)
                                            }}
                                        />
                                    )
                                }
                            })
                        },
                        { size: 12 },
                        {
                            style: { color: isFull ? '#107C10' : '#d0000a' },
                            row: [
                                { html: <Icon path={isFull ? mdiCheckCircle : mdiAlertCircle} size={0.7} /> },
                                { size: 6 },
                                { html: `${selectedCount + ' عدد'} از ${qty + ' عدد'} کالا تعیین رنگ شده`, align: 'v', className: 'fs-14 bold' }
                            ]
                        },
                        { size: 36 },
                        { html: <div style={{ height: 6, background: '#f8f8f8', width: '100%' }}></div> },
                        { size: 36 }
                    ]
                }
            })
        }
    }
    showCart_layout() {
        let { onShowCart } = this.props;
        let { count } = this.state;
        if (!count) { return false }
        let { packQty } = count;
        if (!packQty) { return false }
        return {
            onClick: onShowCart,
            className: 'p-h-24 bgFFF theme-link-font-color bold', size: 36, align: 'v',
            row: [
                { html: 'ادامه فرایند خرید', className: 'fs-16', align: 'v' },
                { size: 4 },
                { html: <Icon path={mdiChevronLeft} size={0.8} />, align: 'vh' }
            ]
        }
    }
    price_layout() {
        let { count } = this.state;
        if (!count) { return false }
        //یا یک را اضافه می کنم چون اگه تعداد صفر بود قیمت واحد رو نشون بده
        let { packQty } = count;
        packQty = packQty || 1;
        let { product } = this.props;
        return {
            column: [
                { flex: 1 },
                {
                    row: [
                        { flex: 1 },
                        { html: SplitNumber(product.price * packQty), className: "theme-dark-font-color bold" },
                        { size: 6 },
                        { html: "ریال", className: "theme-dark-font-color bold" },
                    ],
                },
                { flex: 1 },
            ],
        };
    }
    async updateCart(remove) {
        let { count } = this.state;
        let { packQty } = count;
        let { onChangeCount } = this.props;
        onChangeCount(packQty === 0 || remove ? 0 : count)
    }
    cart_layout() {
        let { count } = this.state;
        if (!count) { return false }
        let { cartItem } = this.props;
        return {
            column: [
                {
                    flex: 1, show: !!cartItem, html: (
                        <button
                            className={"button-2"}
                            style={{ color: '#d0000a', background: 'none', fontWeight: 'bold', padding: 0 }}
                        >موجود در سبد خرید</button>
                    ),
                    align: "v",
                },


            ]
        }
    }
    render() {
        if (!this.mounted) { return null }
        let { product } = this.props;
        let { name, src, code } = product;
        return (
            <RVD
                layout={{
                    className: "theme-popup-bg",
                    column: [
                        { size: 12 },
                        {
                            flex: 1, className: "ofy-auto", gap: 12,
                            column: [
                                this.image_layout(name, code, src),
                                this.clubpoint_layout(),
                                this.packDetails_layout(),
                                {
                                    className: 'theme-card-bg theme-box-shadow theme-border-radius m-h-12 p-12',
                                    column: [
                                        //{size:36,align:'v',html:<div style={{width:'100%',height:1,background:'#ddd'}}></div>},
                                        this.packQty_layout(),
                                        { size: 36, align: 'v', html: <div style={{ width: '100%', height: 1, background: '#ddd' }}></div> },
                                        this.qtyInPacks_layout()
                                    ]
                                }
                            ]
                        },
                        { size: 12 },
                        this.showCart_layout(),
                        {
                            size: 80, style: { boxShadow: '0 0px 6px 1px rgba(0,0,0,.1)' }, className: "p-h-24 bg-fff",
                            row: [
                                this.cart_layout(),
                                { flex: 1 },
                                this.price_layout()
                            ],
                        }
                    ]
                }}
            />
        );
    }
}
class ForoosheVijeSlider extends Component {
    state = { count: this.props.count, prevCount: this.props.count }
    render() {
        let { count, prevCount } = this.state;
        if (this.props.count !== prevCount) {
            setTimeout(() => {
                this.setState({
                    count: this.props.count,
                    prevCount: this.props.count
                })
            }, 0)
        }
        let { optionValueName, totalQty, onChange = () => { }, max, step } = this.props;
        let percent = (count / totalQty * 100).toFixed(0);


        return (
            <RVD
                layout={{
                    column: [
                        { html: optionValueName, align: 'v', className: 'theme-medium-font-color fs-12 bold' },
                        {

                            row: [
                                {
                                    flex: 1,
                                    html: (
                                        <AIOInput
                                            type='slider'
                                            attrs={{ style: { padding: '0 30px' } }}
                                            scaleStep={[max]}
                                            scaleStyle={(value) => { if (value === max) { return { background: '#2BBA8F' } } }}
                                            labelStep={[max]}
                                            labelStyle={(value) => { if (value === max) { return { color: '#2BBA8F', fontSize: 12, top: 43 } } }}
                                            start={0} direction='left'
                                            end={totalQty}
                                            max={max}
                                            step={step}
                                            value={count}
                                            lineStyle={{ height: 4 }}
                                            showValue={true}
                                            fillStyle={(index) => {
                                                if (index === 0) { return { height: 4, background: '#2BBA8F' } }
                                            }}
                                            valueStyle={{
                                                background: '#2BBA8F', height: 14, top: -24,
                                                display: 'flex', alignItems: 'center', fontSize: 12
                                            }}
                                            pointStyle={{ background: '#2BBA8F', width: 16, height: 16, zIndex: 1000 }}
                                            onChange={(count) => { this.setState({ count }); onChange(count) }}
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
}

class CartButton extends Component{
    static contextType = appContext;
    openCart(e){
        e.stopPropagation();
        let {actionClass} = this.context;
        let {product} = this.props;
        actionClass.openPopup('cart',product.cartId)
    }
    render(){
        let {cart,actionClass} = this.context;
        let {variantId,product,renderIn,onChange = ()=>{},cartId,taxonId,CampaignId} = this.props;
        if(!product){console.error(`CartButton missing product props`)}
        if(!product.cartId){console.error(`CartButton missing cartId in product props`)}
        let cartTab = cart[cartId];
        let count = 0;
        if(variantId){
            if(cartTab){
                if(taxonId){
                    if(cartTab.items[taxonId]){
                        if(cartTab.items[taxonId].items[variantId]){
                            count = cartTab.items[taxonId].items[variantId].count;    
                        }
                    }
                }
                else {
                    if(cartTab.items[variantId]){
                        count = cartTab.items[variantId].count;    
                    }
                }
            }
            
            
        }
        else {
            if(['product','cart','category'].indexOf(renderIn) === -1){
                console.error('missing varinatId in ProductCard Component due render in cart page or product page')
            }
        }
        let layout;
        if(!count){
            layout = {
                html:()=>(
                    <button 
                        onClick={() => {
                            actionClass.changeCart({variantId,product,count:1,cartId,taxonId,CampaignId})
                            onChange(1)
                        }} 
                        className="button-2"
                        style={{fontSize:12,height:36,padding:'0 8px'}}
                    >افزودن به سبد خرید</button>
                )
            }
        }
        else if(renderIn === 'shipping'){
            layout = {
                align:'h',gap:3,className:'fs-12 color3B55A5',onClick:(e)=>this.openCart(e),
                row:[{html:<Icon path={mdiCart} size={1}/>,align:'vh'},{html:count,align:'v',className:'fs-18'}]
            }
        }
        else{
            layout={
                column:[
                    {show:renderIn === 'product',align:'vh',html:'تعداد در سبد خرید',className:'fs-12 color3B55A5'},
                    {
                        html:()=>(
                            <ProductCount 
                                value={count} 
                                onChange={(count) => {
                                    actionClass.changeCart({product,variantId,count,cartId,taxonId,CampaignId})
                                    onChange(count)
                                }} 
                            />
                        )
                    }
                ]
            }
        }
        return (<RVD layout={layout}/>)
    }
}

class ProductCount extends Component{
    static contextType = appContext;
    constructor(props){
        super(props);
        let {value} = this.props;
        this.state = {value,prevValue:value,popup:false}
    }
    change(value,min = this.props.min || 0){
        value = +value;
        if(isNaN(value)){value = 0}
        let {onChange,max = Infinity} = this.props;
        this.setState({value});
        clearTimeout(this.changeTimeout);
        this.changeTimeout = setTimeout(()=>{
            if(value > max){value = max}
            if(value < min){value = min}
            onChange(value)
        },500)
        
    }
    changeTimeout(changeTimeout: any) {
        throw new Error("Method not implemented.");
    }
    touchStart(dir,touch,isTouch){
        if(touch && !isTouch){return}
        if(!touch && isTouch){return}
        let {value} = this.state;
        this.change(value + dir)
        if(touch){$(window).bind('touchend',$.proxy(this.touchEnd,this))}
        else{$(window).bind('mouseup',$.proxy(this.touchEnd,this))}
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
      touchEnd(){
        $(window).unbind('touchend',this.touchEnd)
        $(window).unbind('mouseup',this.touchEnd)
        // clearTimeout(this.timeout)
        // clearInterval(this.interval) 
      }
      openPopup(){
        let {actionClass,rsa} = this.context;
        let {value} = this.state;
        let config = {
            onChange:(value)=>{
                this.change(value);
                rsa.removeModal()
            },
            onRemove:()=>{
                this.change(0)
                rsa.removeModal()
            },
            onClose:()=>{
                rsa.removeModal()
            },
            value,
        }
        actionClass.openPopup('count-popup',config)
      }
    render(){
        let {value,prevValue} = this.state;
        let {onChange,max = Infinity,style} = this.props;
        if(this.props.value !== prevValue){setTimeout(()=>this.setState({value:this.props.value,prevValue:this.props.value}),0)}
        let touch = 'ontouchstart' in document.documentElement;
        return (
            <>
                <RVD
                layout={{
                    childsProps: { align: "vh" },
                    style:{height:36,...style},
                    attrs:{onClick:(e)=>e.stopPropagation()},
                    row: [
                        {
                            html: (
                                <div 
                                    onMouseDown={(e)=>this.touchStart(1,touch,false)} 
                                    onTouchStart={(e)=>this.touchStart(1,touch,true)} 
                                    className={'product-count-button' + (value >= max?' disabled':'')}
                                >
                                    <Icon path={mdiPlus} size={1}/>
                                </div>
                            ),
                            align:'vh',
                            show:onChange!== undefined
                        },
                        { 
                            show:!!value,
                            flex:1,
                            html:(
                                <div
                                    className='product-count-input'
                                    onClick={()=>this.openPopup()}
                                >{value}</div>
                            )
                        },
                        {
                            html: ()=>(
                                <div 
                                    onMouseDown={(e) =>this.touchStart(-1,touch,false)} 
                                    onTouchStart={(e) =>this.touchStart(-1,touch,true)} 
                                    className='product-count-button'
                                >
                                    <Icon path={mdiMinus} size={1}/>
                                </div>),
                            show:value > 1 && onChange!== undefined
                        },
                        {
                            html: ()=>(
                                <div 
                                    onClick={(e)=>this.change(0)} 
                                    className='product-count-button'
                                >
                                    <Icon path={mdiTrashCanOutline} size={0.8}/>
                                </div>
                            ),
                            show:value === 1 && onChange!== undefined
                        },
                    ] 
                }}
            />
            </>
        )
    }
}

class CountPopup extends Component{
    dom: React.RefObject<unknown>;
    constructor(props){
        super(props);
        this.dom = createRef();
        this.state = {value:props.value}
    }
    offset(v){
        let {value} = this.state;
        value = +value;
        if(isNaN(value)){value = 0}
        value += v;
        if(value < 0){value = 0}
        return value;
    }
    change(v){
        this.eventHandler('window','mouseup',$.proxy(this.mouseup,this));
        this.setState({value:this.offset(v)});
        clearTimeout(this.timeout)
        clearInterval(this.interval)
        this.timeout = setTimeout(()=>{
            this.interval = setInterval(()=>{
                this.setState({value:this.offset(v)});
            },10);
        },700)
    }
    timeout(timeout: any) {
        throw new Error("Method not implemented.");
    }
    interval(interval: any) {
        throw new Error("Method not implemented.");
    }
    mouseup(){
        this.eventHandler('window','mouseup',this.mouseup,'unbind');
        clearTimeout(this.timeout)
        clearInterval(this.interval)
    }
    eventHandler(selector, event, action, type = "bind") {
        var me = {mousedown: "touchstart",mousemove: "touchmove",mouseup: "touchend"};
        event = "ontouchstart" in document.documentElement ? me[event] : event;
        var element = typeof selector === "string" ? (selector === "window"? $(window): $(selector)): selector;
        element.unbind(event, action);
        if (type === "bind") {element.bind(event, action);}
    }
    render(){
        let {value} = this.state;
        let {onRemove,onChange} = this.props;
        let touch = "ontouchstart" in document.documentElement;
        return (
            <RVD
                layout={{
                    style:{height:'100%',padding:12},
                    onClick:(e)=>e.stopPropagation(),
                    column:[
                        {
                            gap:3,
                            row:[
                                {
                                    size:48,html:<Icon path={mdiPlusThick} size={1}/>,align:'vh',onClick:()=>this.change(1),
                                    attrs:{
                                        [touch?'onTouchStart':'onMouseDown']:()=>this.change(1)
                                    }
                                },
                                {
                                    flex:1,
                                    html:(
                                        <input 
                                            type='number' value={value} min={0}
                                            ref={this.dom}
                                            onChange={(e)=>{
                                                let val = e.target.value;
                                                this.setState({value:val});
                                            }}
                                            onClick={()=>{
                                                $(this.dom.current).focus().select()
                                            }}
                                            style={{width:'100%',border:'1px solid lightblue',height:36,textAlign:'center',borderRadius:4}}
                                        />
                                    )
                                },
                                {
                                    size:48,html:<Icon path={mdiMinusThick} size={1}/>,align:'vh',
                                    attrs:{
                                        [touch?'onTouchStart':'onMouseDown']:()=>this.change(-1)
                                    }
                                }
                            ]
                        },
                        {size:12},
                        {
                            row:[
                                {
                                    flex:1,
                                    html:(
                                        <button 
                                            className='button-2' style={{background:'red',border:'none'}}
                                            onClick={()=>onRemove()}
                                        >حذف محصول</button>
                                    )
                                },
                                {size:12},
                                {
                                    flex:1,
                                    html:(
                                        <button onClick={()=>onChange(value)} className='button-2'>
                                                تایید
                                        </button>
                                    )
                                },
                            ]
                        },
                    ]
                }}
            />
        )
    }
}