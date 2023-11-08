import React, { Component, Fragment } from "react";
import RVD from './npm/react-virtual-dom/react-virtual-dom';
import CategoryView from "./components/kharid/category-view/category-view";
import { Icon } from '@mdi/react';
import { mdiChevronLeft, mdiChevronDown, mdiCheckCircle, mdiAlertCircle, mdiDelete, mdiPlus, mdiMinus } from "@mdi/js";
import Axios from 'axios';
import SplitNumber from "./npm/aio-functions/split-number";
import Shipping from "./components/kharid/shipping/shipping";
import NoSrc from './images/no-src.png';
import CartButton from './components/kharid/cart-button';
import getSvg from "./utils/getSvg";
import AIOInput from "./npm/aio-input/aio-input";
import $ from 'jquery';
import bundleBoxSrc from './images/bundle-box.jpg';

export default class ShopClass {
    constructor({ getAppState, config }) {
        this.getAppState = getAppState;
        this.update(config)
    }
    update(obj) { for (let prop in obj) { this[prop] = obj[prop]; } }
    getCartItems = () => {
        let { cart } = this.getAppState();
        let cartTab = cart[this.cartId];
        if (!cartTab) { return [] }
        let { items = {} } = cartTab;
        return Object.keys(items).map((o) => items[o])
    }
    getAmounts = (shippingOptions) => {
        let { cart } = this.getAppState();
        let cartTab = cart[this.cartId];
        if (!cartTab) { return {} }
        let cartItems = this.getCartItems();
        if (this.cartId === 'Bundle') {return this.getAmounts_Bundle(cartItems, shippingOptions)}
        else { return this.getAmounts_all(cartItems, shippingOptions) }
    }
    getAmounts_all(cartItems, shippingOptions) {
        let { getFactorDetails } = this.getAppState();
        let factorDetailsItems = [];
        for (let i = 0; i < cartItems.length; i++) {
            let { variantId, count, product } = cartItems[i];
            let variant = product.variants.find((o) => o.id === variantId)
            factorDetailsItems.push({ ItemCode: variant.code, ItemQty: count })
        }
        let factorDetails = getFactorDetails(factorDetailsItems, shippingOptions);
        let total = 0;
        for (let i = 0; i < factorDetails.MarketingLines.length; i++) {
            let o = factorDetails.MarketingLines[i];
            total += o.Price * o.ItemQty;
        }
        let paymentMethodDiscountPercent = factorDetails.marketingdetails.DocumentDiscountPercent
        let paymentMethodDiscount = factorDetails.marketingdetails.DocumentDiscount;
        let paymentAmount = factorDetails.DocumentTotal;
        let discount = total - (paymentAmount + paymentMethodDiscount);
        return {
            total, discount, paymentMethodDiscount, paymentMethodDiscountPercent, paymentAmount, factorDetails
        }
    }
    getAmounts_Bundle(cartItems, shippingOptions = {}) {
        let total = 0;
        for (let i = 0; i < cartItems.length; i++) {
            let { count, product } = cartItems[i];
            total += ((count.packQty * product.price) / 88) * 100;
        }
        let { PayDueDate = 1 } = shippingOptions;
        let paymentMethodDiscountPercent = {
            '1': 12, '25': 7.8, '26': 6.6, '27': 6
        }[(PayDueDate).toString()]
        let paymentMethodDiscount = total * paymentMethodDiscountPercent / 100;
        let paymentAmount = total - paymentMethodDiscount;
        let peymentPercent = {
            '1': 100, '25': 30, '26': 40, '27': 50
        }[(PayDueDate).toString()]
        paymentAmount = paymentAmount * peymentPercent / 100
        return { total, paymentMethodDiscountPercent, paymentMethodDiscount, paymentAmount };
    }
    getCartProducts = (renderIn,shippingOptions) => {
        let { cart } = this.getAppState();
        let cartTab = cart[this.cartId];
        if (!cartTab) { return [] }
        let cartItems = this.getCartItems();
        if (this.cartId === 'Bundle') { return this.getCartProducts_Bundle(cartItems, renderIn) }
        else { return this.getCartProducts_all(cartItems, renderIn,shippingOptions) }
    }
    getCartProducts_Bundle = (cartItems, renderIn) => {
        return cartItems.map(({ product, count, variantId }) => this.renderCard({ product, count, variantId, renderIn }))
    }
    getCartProducts_all = (cartItems, renderIn, shippingOptions) => {
        let paymentMethodDiscountPercent;
        if (renderIn === 'shipping') {
            let { PayDueDate_options, PayDueDate } = shippingOptions;
            paymentMethodDiscountPercent = PayDueDate_options.find(({ value }) => value === PayDueDate).percent;
        }
        return cartItems.map(({ product, count, variantId }, i) => {
            let variant = product.variants.find((o) => o.id === variantId);
            let { optionTypes } = product;
            let { optionValues } = variant;
            let details = [];
            for (let j = 0; j < optionTypes.length; j++) {
                let optionType = optionTypes[j];
                details.push([optionType.name, optionType.items[optionValues[optionType.id]]]);
            }
            let props = {
                key: variantId, variantId, index: i, product, details, type: 'horizontal',
                renderIn, cartId: this.cartId, paymentMethodDiscountPercent
            }
            return this.renderCard(props)
        })
    }
    fix(value) {
        try { return +value.toFixed(0) }
        catch { return 0 }
    }
    getFactorItems = (shippingOptions) => {
        let amounts = this.getAmounts(shippingOptions);
        if (this.cartId === 'Bundle') { return this.getFactorItems_bundle(amounts) }
        else { return this.getFactorItems_all(amounts) }
    }
    getFactorItems_bundle = ({ total, paymentMethodDiscount, paymentMethodDiscountPercent, paymentAmount }) => {
        return [
            { key: 'جمع کل سبد خرید', value: `${SplitNumber(this.fix(total)) + ' ریال'}`, className: 'color00B5A5 fs-14' },
            { key: 'تخفیف نحوه پرداخت', value: `${SplitNumber(this.fix(paymentMethodDiscount)) + ' ریال'} (${paymentMethodDiscountPercent} %)`, className: 'color00B5A5 fs-14' },
            { key: 'مبلغ چک', value: SplitNumber(this.fix(total - paymentMethodDiscount - paymentAmount)) + ' ریال', className: 'theme-medium-font-color fs-14' },
            { key: 'مبلغ قابل پرداخت', value: SplitNumber(this.fix(paymentAmount)) + ' ریال', className: 'theme-dark-font-color bold fs-16' }
        ]
    }
    getFactorItems_all = ({ total, paymentMethodDiscount, paymentMethodDiscountPercent, paymentAmount, discount }) => {
        return [
            { key: 'قیمت کالاها', value: SplitNumber(this.fix(total)) + ' ریال', className: 'theme-medium-font-color fs-14' },
            { key: 'تخفیف گروه مشتری', value: SplitNumber(this.fix(discount)) + ' ریال', className: 'colorFDB913 fs-14' },
            { key: 'تخفیف نحوه پرداخت', value: `${SplitNumber(this.fix(paymentMethodDiscount)) + ' ریال'} (${paymentMethodDiscountPercent} %)`, className: 'colorFF4335 fs-14' },
            { key: 'مبلغ قابل پرداخت', value: SplitNumber(this.fix(paymentAmount)) + ' ریال', className: 'theme-dark-font-color bold fs-16' }
        ]
    }
    edameye_farayande_kharid = () => {
        let { rsa } = this.getAppState();
        if (this.cartId === 'Bundle') { this.fillAuto() }
        rsa.addModal({ id:'edameye_farayande_kharid',position: 'fullscreen', body: {render:() => <Shipping cartId={this.cartId} /> }, header:{title: 'ادامه فرایند خرید'}})
    }
    fillAuto = () => {
        let {cart} = this.getAppState()
        let items = cart.Bundle.items;
        for(let prop in items){
          let {count,product,variantId} = items[prop];
          let total = 0;
          for(let x in count.qtyInPacks){
              for(let i = 0; i < count.qtyInPacks[x].length; i++){
                  let o = count.qtyInPacks[x][i];
                  total += o.count;
              }
          }
          let v = product.variants[0];
          let qty = v.qty;
          let delta = qty - total;
          if(delta){
            let a = count.qtyInPacks[v.id];
            let b = a.find(({optionValueName})=>optionValueName === 'مهتابی')
            if(!b)
            {
              b = a[0];
            }
            b.count = b.count + delta
          }
        }
    }
    payment = async (obj) => {
        //obj => { address, SettleType, PaymentTime, DeliveryType, PayDueDate }
        let { rsa, removeCart, openPopup } = this.getAppState();
        let result;
        if (this.cartId === 'Bundle') { result = obj.SettleType === 16 ? await this.pardakht(obj) : await this.sabt(obj) }
        else { result = await this.sabt(obj); }
        if (typeof result === 'object') {
            let { orderNumber } = result;
            rsa.removeModal('all');
            removeCart(this.cartId)
            openPopup('sefareshe-ersal-shode-baraye-vizitor', { orderNumber });
            return true
        }
        else { return result }
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
            "Price": Math.round(this.getAmounts(obj).paymentAmount),
            "IsDraft": registredOrder.isDraft,
            "DocNum": registredOrder.docNum,
            "DocEntry": registredOrder.docEntry,
            "CallbackUrl": baseUrl === 'https://retailerapp.bbeta.ir/api/v1' ? 'https://uiretailerapp.bbeta.ir/' : 'https://bazar.miarze.com/'
        });
        if (result.data.isSuccess) { window.location.href = result.data.data }
        else { return result.data.message }
    }
    getOrderBody = ({ SettleType, PaymentTime, DeliveryType, PayDueDate, address }) => {
        let appState = this.getAppState();
        let { userInfo } = appState;
        let marketingLines = this.getMarketingLines()
        return {
            "marketdoc": {
                "DocType": this.cartId === 'Bundle' ? 17 : undefined,
                "CardCode": userInfo.cardCode,
                "CardGroupCode": userInfo.groupCode,
                "MarketingLines": marketingLines,
                "DeliverAddress": address,
                "marketingdetails": { Campaign: this.B1Id }
            },
            SettleType, PaymentTime, DeliveryType, PayDueDate
        }
    }
    getMarketingLines = () => {
        let cartItems = this.getCartItems()
        if (this.cartId === 'Bundle') { return this.getMarketingLiens_Bundle(cartItems) }
        else { return this.getMarketingLiens_all(cartItems) }
    }
    getMarketingLiens_Bundle(cartItems) {
        let list = [];
        for (let j = 0; j < cartItems.length; j++) {
            let cartItem = cartItems[j];
            const items = cartItem.count.qtyInPacks;
            let packQty = cartItem.count.packQty;
            for (const key in items) {
                for (let i = 0; i < items[key].length; i++) {
                    list.push({ ...items[key][i], variantId: cartItem.variantId, packQty: packQty });
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
    getMarketingLiens_all(cartItems) {
        return cartItems.map(({ product, variantId, count }) => {
            let variant = product.variants.find((v) => v.id === variantId)
            return { ItemCode: variant.code, ItemQty: count }
        })
    }
    getPaymentButtonText = (shippingOptions) => {
        if (this.cartId === 'Bundle') { return shippingOptions.SettleType === 16 ? 'پرداخت' : 'ثبت' }
        else { return 'ارسال برای ویزیتور' }
    }
    async openCategory(parameter) {
        let { rsa,getHeaderIcons } = this.getAppState();
        let { billboard, products, description,title } = await this.getCategoryProps(parameter)
        let buttons = getHeaderIcons({cart:true})
        rsa.addModal({
            id:'shop-class-category',
            position: 'fullscreen',
            body: {render:() => (
                <CategoryView
                    renderProductCard={(product, index) => this.renderCard({ product, index, renderIn: 'category' })}
                    billboard={billboard} products={products} description={description}
                />
            )},
            header: {title,buttons}
        })
    }
    async getCategoryProducts(id,count){
        let {apis} = this.getAppState();
        return await apis.request({ 
            api: 'kharid.getCategoryProducts', parameter: {id,count},description:'دریافت محصولات دسته بندی',
            cache: {time:30 * 24 * 60 * 60 * 1000, name: 'categories.categoryProducts.item_' + id + (count?count:'') }
        });
    }
    async getCategoryProps(id) {
        let { apis } = this.getAppState();
        if (this.cartId === 'Bundle') {
            return { billboard: this.billboard, products: this.products, description: this.description,title:this.name }
        }
        if (this.spreeCampaign) {
            if (!this.products) {
                this.products = await apis.request({
                    api: 'kharid.getCampaignProducts', description: 'دریافت محصولات کمپین', def: [],
                    parameter: { id: this.cartId, CampaignId: this.CampaignId, PriceListNum: this.PriceListNum },
                    cache:{time:30 * 24 * 60 * 60 * 1000,name:'campaignProducts.item_' + this.cartId}
                });
            }
            return { billboard: this.billboard, products: this.products, description: this.description,title:this.name }
        }
        if (this.cartId === 'Regular') {
            let {spreeCategories} = this.getAppState();
            let products = await this.getCategoryProducts(id);
            let {billboard,name,description} = spreeCategories.dic[id];
            return { billboard, products, description,title:name }
        }
    }
    renderCard({ product, renderIn, variantId, paymentMethodDiscountPercent, count, details, loading, index, style, type }) {
        let { apis, rsa, changeCart,getHeaderIcons } = this.getAppState();
        let props = {
            title: this.name, product, renderIn, variantId, paymentMethodDiscountPercent, count, details, loading, index, style, type,
            onClick: async () => {
                if (this.spree && !product.hasFullDetail) {
                    product = await apis.request({
                        api: 'kharid.getProductFullDetail',
                        parameter: { id: product.id, code: product.defaultVariant.code, product }
                    })
                    product.hasFullDetail = true;
                }
                rsa.addModal({
                    position: 'fullscreen', id: 'product',
                    body: {render:() => this.renderPage(product)},
                    header: {title: this.name, buttons:getHeaderIcons({cart:true})}
                })
            },
            onRemove: () => changeCart({ count: 0, variantId: product.code, product })
        }
        let Wrapper = this.spree ? RegularCard : BundleCard;
        return (<Wrapper key={product.id || product.code} {...props} />)
    }
    renderPage(product) {
        let { cart, openPopup, changeCart } = this.getAppState()
        let cartTab = cart[this.cartId];
        let cartItem;
        if (cartTab) {
            let { items = {} } = cartTab;
            cartItem = items[product.code] || false
        }
        let props = {
            product, cartItem, maxCart: this.maxCart,
            onShowCart: () => openPopup('cart'),
            //use in bundle
            onChangeCount: (count) => changeCart({ product, variantId: product.code, count })
        }
        let Wrapper = this.spree ? RegularPage : BundlePage;
        return <Wrapper {...props} />
    }
}
class RegularCard extends Component {
    state = { mounted: false }
    image_layout() {
        let { product } = this.props;
        let { srcs = [] } = product;
        return { flex: 1, align: 'vh', html: <img src={srcs[0] || NoSrc} width={'100%'} alt='' /> }
    }
    count_layout() {
        let { product, renderIn, variantId } = this.props;
        return { size: 36, html: () => <CartButton renderIn={renderIn} product={product} variantId={variantId} /> }
    }
    title_layout() {
        let { title } = this.props;
        return { html: title, className: 'fs-10', style: { color: 'rgb(253, 185, 19)' } }
    }
    name_layout() {
        let { product } = this.props;
        let { name } = product;
        return { html: name, className: 'fs-12 theme-medium-font-color bold', style: { whiteSpace: 'normal', textAlign: 'right' } }
    }
    discount_layout() {
        let { product, count = 1, paymentMethodDiscountPercent } = this.props;
        let { inStock, Price, B1Dscnt = 0, CmpgnDscnt = 0, PymntDscnt = 0, FinalPrice } = product;

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
                        { show: !!paymentMethodDiscountPercent || !!PymntDscnt, html: <div style={{ background: '#ff4335', color: '#fff', padding: '1px 3px', fontSize: 12, borderRadius: 6 }}>{(paymentMethodDiscountPercent || PymntDscnt) + '%'}</div> }
                    ]
                },
            ]
        }
    }
    details_layout() {
        let { details = [] } = this.props;
        if (!details.length) { return false }
        let text = '';
        for (let i = 0; i < details.length; i++) {
            let [title, value] = details[i];
            text += `${title}:${value} `
        }
        return {
            html: text, className: 'fs-9',
            style: {
                whiteSpace: 'nowrap',
                overflow: 'hidden'
            }
        }
    }
    notExist_layout() {
        let { product } = this.props;
        let { inStock } = product;
        if (inStock) { return false }
        return { row: [{ flex: 1 }, { html: 'نا موجود', className: 'colorD83B01 bold fs-12' }, { size: 12 }] }
    }
    price_layout() {
        let { product } = this.props;
        let { FinalPrice, inStock } = product;
        if (!inStock || !FinalPrice) { return false }
        return {
            row: [
                { flex: 1 },
                { html: SplitNumber(FinalPrice) + ' ریال', className: 'fs-12 theme-dark-font-color bold p-h-12' }
            ]
        }
    }
    componentDidMount() {
        let { index = 0 } = this.props;
        setTimeout(() => {
            this.setState({ mounted: true })
        }, index * 100 + 100)
    }
    horizontal_layout() {
        let { loading, onClick } = this.props;
        let { mounted } = this.state;
        return (
            <RVD
                loading={loading}
                layout={{
                    className: 'theme-card-bg theme-box-shadow gap-no-color rvd-rotate-card' + (mounted ? ' mounted' : ''),
                    onClick,
                    // egg:{
                    //     count:3,
                    //     callback:()=>{
                    //         console.log(this.props)
                    //     }
                    // },
                    style: { height: 148, border: '1px solid #eee' },
                    gap: 12,
                    row: [
                        {
                            size: 116,
                            column: [
                                this.image_layout(),
                                this.count_layout()
                            ]
                        },
                        {
                            flex: 1,
                            column: [
                                { size: 6 },
                                this.title_layout(),
                                this.name_layout(),
                                this.details_layout(),
                                { flex: 1 },
                                this.discount_layout(),
                                this.notExist_layout(),
                                { row: [{ flex: 1 }, this.price_layout()] },
                                { size: 6 },

                            ]
                        }
                    ]
                }}
            />
        )
    }
    vertical_layout() {
        let { style, product, loading, onClick } = this.props;
        let { srcs = [], name } = product;
        return (
            <RVD
                loading={loading}
                layout={{
                    style: { ...style }, className: 'theme-card-bg theme-box-shadow theme-border-radius of-visible w-168 h-288 fs-14 br-12',
                    onClick,
                    column: [
                        { size: 140, align: 'vh', html: <img src={srcs[0] || NoSrc} width={'100%'} style={{ width: 'calc(100% - 24px)', height: '100%', borderRadius: 8 }} alt='' />, style: { padding: 6, paddingBottom: 0 } },
                        { html: name, className: 'fs-12 p-v-6 p-h-12 theme-medium-font-color bold', style: { whiteSpace: 'normal' } },
                        //this.name_layout(),
                        { flex: 1 },
                        this.discount_layout(),
                        this.price_layout(),
                        this.notExist_layout(),
                        { size: 12 }
                    ]
                }}
            />
        )
    }
    render() {
        let { type = 'horizontal' } = this.props;
        return this[type + '_layout']()
    }
}
class BundleCard extends Component {
    state = { mounted: false, removeMode: false }
    title_layout() {
        let { title } = this.props;
        if (!title) { return false }
        return {
            row: [
                { html: title, style: { color: '#FDB913' }, className: 'fs-12 bold', align: 'v' },
                { size: 3 },
                { flex: 1, html: (<div style={{ height: 2, width: '1100%', background: '#FDB913' }}></div>), align: 'v' }
            ]
        }
    }
    image_layout() {
        let { product } = this.props;
        let { src = '' } = product;
        return {
            column: [
                {
                    flex: 1, size: 114, html: <img src={src} alt='' width='100%' height='100%' className='br-12' />
                }
            ]
        }
    }
    name_layout() {
        let { product } = this.props;
        let { name } = product;
        return { html: name, className: 'fs-14 theme-dark-font-color bold', style: { textAlign: 'right' } }
    }
    detail_layout() {
        let { product, count } = this.props;
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
            return { html: str, className: 'fs-12 theme-medium-font-color', style: { textAlign: 'right' } }

        }
        let names = variants.map(({ name }) => name);
        return { html: names.join(' - '), className: 'fs-12 theme-medium-font-color', style: { textAlign: 'right' } }
    }
    price_layout() {
        let { product } = this.props;
        return {
            size: 36,
            row: [
                {
                    flex: 1, className: 'fs-14 bold theme-dark-font-color',
                    align: 'v',
                    row: [
                        { flex: 1 },
                        { html: SplitNumber(product.price) },
                        { size: 3 },
                        { html: 'ریال' }
                    ]
                },

            ]
        }
    }
    remove(e) {
        e.stopPropagation()
        let { count, onRemove } = this.props;
        if (!count) { return false }
        onRemove()
    }
    componentDidMount() {
        let { index = 0 } = this.props;
        setTimeout(() => {
            this.setState({ mounted: true })
        }, index * 100 + 100)
    }
    timer(e) {
        this.time = 0;
        this.interval = setInterval(() => {
            this.time++;
            if (this.time > 50) {
                clearInterval(this.interval);
                this.setState({ removeMode: true })
            }
        }, 10)
    }
    cancelRemoveMode() {
        this.setState({ removeMode: false })
    }
    remove_layout() {
        let { removeMode } = this.state;
        if (!removeMode) { return false }
        let { onRemove } = this.props
        let space = { flex: 1, onClick: () => this.cancelRemoveMode() };
        return {
            style: { zIndex: 10, position: 'absolute', width: '100%', height: '100%', left: 0, top: 0, background: 'rgba(255,255,255,0.9)' },
            html: (
                <RVD
                    layout={{
                        column: [
                            space,
                            {
                                row: [
                                    space,
                                    {
                                        html: <Icon path={mdiDelete} size={1} style={{ padding: 16, background: '#A4262C', color: '#fff', borderRadius: '100%' }} />, align: 'vh',
                                        onClick: () => this.remove()
                                    },
                                    space
                                ]
                            },
                            space
                        ]
                    }}
                />
            )
        }
    }
    mounseup() {
        clearInterval(this.interval);
        $(window).unbind('mouseup', this.mounseup)
        $(window).unbind('touchend', this.mounseup)
    }
    render() {
        let { mounted, removeMode } = this.state;
        let { count, onClick } = this.props;
        let touch = 'ontouchstart' in document.documentElement;
        let attrs = {};
        if (count) {
            if (touch) {
                attrs.onTouchStart = () => {
                    this.timer();
                    $(window).bind('touchend', $.proxy(this.mounseup, this))
                }
            }
            else {
                attrs.onMouseDown = () => {
                    this.timer();
                    $(window).bind('mouseup', $.proxy(this.mounseup, this))
                }
            }
        }
        return (
            <RVD
                layout={{
                    className: 'theme-box-shadow theme-card-bg theme-border-radius theme-gap-h p-12 of-visible rvd-rotate-card' + (mounted ? ' mounted' : ''),
                    attrs,
                    onClick: () => { if (!removeMode) { onClick() } },
                    column: [
                        this.title_layout(),
                        this.remove_layout(),
                        { size: 6 },
                        {
                            row: [
                                {
                                    size: 114, column: [
                                        this.image_layout(),
                                    ]
                                },
                                { size: 12 },
                                {
                                    flex: 1,
                                    column: [
                                        this.name_layout(),
                                        { size: 6 },
                                        this.detail_layout(),
                                        { flex: 1 },
                                        this.price_layout()
                                    ]
                                }
                            ]
                        },

                    ]
                }}
            />
        )
    }
}
class RegularPage extends Component {
    componentDidMount() {
        this.mounted = true;
        let { product } = this.props;
        this.getVariants()
        let firstVariant = product.inStock ? (product.variants.filter((o) => o.inStock)[0]) : undefined;
        this.setState({
            optionValues: firstVariant ? { ...firstVariant.optionValues } : undefined, showDetails: true,
            selectedVariant: firstVariant, srcIndex: 0
        });
    }
    getVariants() {
        let { product } = this.props;
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
                            style={{ width: '100%',fontSize:12 }}
                            popupAttrs={{ style: { maxHeight: 400 } }}
                            options={this.options}
                            popover={{fitHorizontal:true}}
                            value={selectedVariant ? selectedVariant.id : undefined}
                            optionStyle='{height:28,fontSize:12}'
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
        let { product } = this.props;
        let { selectedVariant } = this.state;
        if (!selectedVariant || !selectedVariant.inStock) {
            return { html: '' }
        }
        return {
            column: [
                { flex: 1 },
                { html: (<CartButton variantId={selectedVariant.id} product={product} renderIn='product' />) },
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
                                            onChange={(count) => {this.setState({ count}); onChange(count)}}
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