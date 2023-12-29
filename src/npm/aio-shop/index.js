import React, { Component, useEffect, useState } from 'react';
//import AIOShopBackOffice from './back-office';
import AIOStorage from './../../npm/aio-storage/aio-storage';
import AIOPopup from './../../npm/aio-popup/aio-popup';
import { Icon } from '@mdi/react';
import { mdiStar, mdiStarOutline, mdiStarHalfFull, mdiCircleSmall, mdiCart, mdiChevronDown, mdiChevronLeft, mdiPlus, mdiMinus, mdiTrashCanOutline, mdiMagnify, mdiPlusThick, mdiClose, mdiContentSave, mdiDelete } from '@mdi/js';
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import AIOInput from './../../npm/aio-input/aio-input';
import { SplitNumber, Search } from './../../npm/aio-utils/aio-utils';
import { makeAutoObservable } from "mobx";
import { observer } from "mobx-react-lite";
import './index.css';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default class AIOSHOP {
    constructor(props) {
        this.shipping = {};
        this.popup = {};
        this.getCartItem = (productId, variantId) => { return this.cart.find((o) => o.product.id === productId && o.variantId === variantId); };
        this.getCartItems = (productId) => { return productId ? this.cart.filter((o) => o.product.id === productId) : this.cart; };
        this.getCartCount = (productId, variantId) => {
            if (variantId !== undefined) {
                let cartItem = this.getCartItem(productId, variantId);
                return cartItem ? cartItem.count : 0;
            }
            let cartItems = this.getCartItems(productId) || [], sum = 0;
            for (let i = 0; i < cartItems.length; i++) {
                let { count = 0 } = cartItems[i];
                sum += count;
            }
            return sum;
        };
        this.removeCartItem = (productId, variantId) => {
            let newCart = [];
            if (variantId) {
                newCart = this.cart.filter((cartItem) => cartItem.product.id !== productId || cartItem.variantId !== variantId);
            }
            else {
                newCart = this.cart.filter((cartItem) => cartItem.product.id !== productId);
            }
            this.cart = newCart;
        };
        this.getState = () => {
            return {
                id: this.id,
                unit: this.unit,
                addToCartText: this.addToCartText,
                importHTML: this.importHTML,
                getShippingOptions: this.getShippingOptions,
                getDiscounts: this.getDiscounts,
                getExtras: this.getExtras,
                cartCache: this.cartCache,
                checkDiscountCode: this.checkDiscountCode,
                payment: this.payment,
                shipping: this.shipping,
                storage: this.storage,
                cart: this.cart,
                factor: this.factor,
                popup: this.popup
            };
        };
        this.getShopProps = () => {
            return;
        };
        this.setCartCount = ({ product, variantId, count }) => {
            if (count === 0) {
                this.removeCartItem(product.id, variantId);
            }
            else {
                let newCart = [];
                let cartItem = this.getCartItem(product.id, variantId);
                if (!cartItem) {
                    newCart = this.cart.concat({ product, variantId, count });
                }
                else {
                    newCart = this.cart.map((o) => o.product.id === product.id && o.variantId === variantId ? Object.assign(Object.assign({}, o), { count }) : o);
                }
                this.cart = newCart;
            }
            if (this.cartCache) {
                if (typeof this.cartCache === 'function') {
                    this.cartCache('set', this.cart);
                }
                else if (this.storage) {
                    this.storage.save({ name: 'cart', value: this.cart });
                }
            }
            this.updateFactor();
        };
        this.updateShipping = (shipping) => this.shipping = shipping;
        this.updateFactor = () => __awaiter(this, void 0, void 0, function* () {
            let discount = 0;
            let total = 0;
            let amount = 0;
            let factors = this.cart.map((cartItem) => {
                let { count = 1, product, variantId } = cartItem;
                let price = this.getProp({ product, variantId, prop: 'price', def: 0 });
                let discountPercent = this.getProp({ product, variantId, prop: 'discountPercent', def: 0 });
                let sum = this.getDiscountPercent(discountPercent);
                let itemTotal = count * price;
                total += itemTotal;
                let itemDiscount = itemTotal * sum / 100;
                discount += itemDiscount;
                let itemAmount = itemTotal - itemDiscount;
                amount += itemAmount;
                return { product, variantId, discountPercent: sum, total: itemTotal, discount: itemDiscount, amount: itemAmount };
            });
            let discountItems = yield this.getDiscounts(this);
            let discounts = [];
            for (let i = 0; i < discountItems.length; i++) {
                let { title, discountPercent = 0, maxDiscount } = discountItems[i];
                if (discountPercent) {
                    let discount = amount * discountPercent / 100;
                    amount -= discount;
                    if (maxDiscount !== undefined && discount > maxDiscount) {
                        discount = maxDiscount;
                    }
                    discounts.push({ discountPercent, maxDiscount, title });
                }
            }
            let extras = (yield this.getExtras(this)) || [];
            for (let i = 0; i < extras.length; i++) {
                let { amount: Amount } = extras[i];
                amount += Amount;
            }
            let factor = { discount, discounts, total, amount, factors, extras };
            this.factor = factor;
            return factor;
        });
        this.getProp = ({ product, variantId, prop, def }) => {
            if (!product) {
                debugger;
            }
            let result;
            if (!variantId) {
                result = product[prop];
            }
            else {
                let variant = this.getVariant(product, variantId);
                result = variant && variant[prop] !== undefined ? variant[prop] : product[prop];
            }
            if (result === undefined) {
                result = def;
            }
            return result;
        };
        this.copy = (value) => {
            return JSON.parse(JSON.stringify(value));
        };
        this.getFirstVariant = (product, variantId) => {
            let { variants, defaultVariantId } = product;
            if (!variants || !variants.length) {
                return;
            }
            if (variantId) {
                let variant = this.getVariant(product, variantId);
                if (variant) {
                    return variant;
                }
            }
            if (defaultVariantId) {
                let variant = this.getVariant(product, defaultVariantId);
                if (variant) {
                    let { inStock = Infinity, max = Infinity } = variant;
                    if (inStock && max) {
                        return variant;
                    }
                }
            }
            for (let i = 0; i < variants.length; i++) {
                let variant = variants[i];
                let { inStock = Infinity, max = Infinity } = variant;
                if (inStock && max) {
                    return variant;
                }
            }
        };
        this.getExistVariantsByOptionValues = (product, values) => {
            function isMatch(key) {
                let keyList = key.split('_');
                for (let j = 0; j < values.length; j++) {
                    if (keyList[j] !== values[j]) {
                        return false;
                    }
                }
                return true;
            }
            let res = [];
            if (product.variants) {
                for (let i = 0; i < product.variants.length; i++) {
                    let variant = product.variants[i];
                    let { key } = variant;
                    if (!isMatch(key)) {
                        continue;
                    }
                    res.push(variant);
                }
            }
            return res;
        };
        this.getVariantLabel = (product, variantId) => {
            let { optionTypes = [] } = product;
            let variant = this.getVariant(product, variantId);
            if (!variant) {
                return '';
            }
            let { key } = variant;
            let variantValues = key.split('_');
            return optionTypes.map((optionType, i) => {
                let { optionValues, name } = optionType;
                let variantValue = variantValues[i];
                let optionValue = optionValues.find((o) => o.id === variantValue);
                return optionValue ? `${name} : ${optionValue.name}` : '';
            }).join(' - ');
        };
        this.getVariant = (product, variantId) => {
            let { variants = [] } = product;
            return variants.find((o) => o.id === variantId);
        };
        this.getVariantByKey = (product, variantKey) => {
            if (!product || !product.variants || variantKey === undefined) {
                return;
            }
            return product.variants.find((o) => o.key === variantKey);
        };
        this.isVariantKeyExist = (product, variantKey) => {
            let variant = this.getVariantByKey(product, variantKey);
            if (!variant) {
                return false;
            }
            let { inStock = Infinity, max = Infinity } = variant;
            return !!inStock && !!max;
        };
        this.renderList = (props) => {
            let { products, before, after, popup } = props;
            if (popup) {
                let render = () => <div className='aio-shop-popup'>{this.renderList({ products, before, after })}</div>;
                this.popup.addModal(Object.assign(Object.assign({}, popup), { body: Object.assign(Object.assign({}, popup.body), { render }) }));
            }
            else {
                return <List products={products} actions={this.actions} getState={this.getState.bind(this)} before={before} after={after}/>;
            }
        };
        this.renderPopups = () => this.popup.render();
        this.renderCartCountButton = ({ product, variantId, type, addToCart }) => {
            return <CartCountButton {...{ key: product.id + ' ' + variantId, product, variantId, type, actions: this.actions, getState: this.getState.bind(this), addToCart }}/>;
        };
        this.renderFactor = () => <Factor actions={this.actions} getState={this.getState.bind(this)}/>;
        this.renderPrice = (obj) => {
            let { product, variantId, type } = obj;
            return <Price actions={this.actions} getState={this.getState.bind(this)} product={product} variantId={variantId} type={type}/>;
        };
        this.renderShipping = (popup) => {
            if (popup) {
                let render = () => this.renderShipping();
                this.popup.addModal(Object.assign(Object.assign({}, popup), { header: Object.assign(Object.assign({}, popup.header), { title: 'ثبت نهایی خرید' }), body: Object.assign(Object.assign({}, popup.body), { render }) }));
            }
            return <Shipping actions={this.actions} getState={this.getState.bind(this)}/>;
        };
        this.renderCart = (popup) => {
            if (popup) {
                let render = () => <div className='aio-shop-popup'>{this.renderCart()}</div>;
                this.popup.addModal(Object.assign(Object.assign({}, popup), { header: Object.assign({ title: 'سبد خرید' }, popup.header), body: Object.assign(Object.assign({}, popup.body), { render }) }));
            }
            return <Cart actions={this.actions} getState={this.getState.bind(this)} onSubmit={() => this.renderShipping({})}/>;
        };
        this.renderProductSlider = (props) => {
            let { items, before, after } = props;
            return (<Slider items={items} actions={this.actions} getState={this.getState.bind(this)} before={before} after={after}/>);
        };
        this.renderCartButton = (icon = <Icon path={mdiCart} size={1}/>) => {
            let cartLength = this.getCartItems().length;
            return (<div onClick={() => this.renderCart({})} className='as-cart-button'>
                {typeof icon === 'function' ? icon() : icon}
                {!!cartLength && <div className='as-badge-1'>{cartLength}</div>}
            </div>);
        };
        this.renderProductCard = (props) => {
            let { product, variantId, html, imageSize, type = 'horizontal', floatHtml, addToCart, onClick, footer } = props;
            if (onClick === false) {
                onClick = undefined;
            }
            else if (onClick === undefined) {
                onClick = () => this.renderProductPage({ product, variantId, popup: { id: product.id } });
            }
            return (<ProductCard actions={this.actions} getState={this.getState.bind(this)} key={product.id + ' ' + variantId} product={product} variantId={variantId} {...{ html, imageSize, type, floatHtml, addToCart, footer }} onClick={() => this.renderProductPage({ product, variantId, popup: { id: product.id } })}/>);
        };
        this.renderProductPage = ({ product, variantId, importHtml, popup }) => {
            if (popup) {
                this.popup.addModal(Object.assign({ header: Object.assign(Object.assign({}, popup.header), { title: product.name }), body: Object.assign(Object.assign({}, popup.body), { render: () => <div className='h-100'>{this.renderProductPage({ product, variantId, importHtml })}</div> }) }, popup));
            }
            else {
                return (<ProductPage actions={this.actions} getState={this.getState.bind(this)} product={product} variantId={variantId} importHtml={importHtml}/>);
            }
        };
        this.renderBackOffice = ({ product, category, popup }) => {
            if (popup) {
                this.popup.addModal(Object.assign({ header: Object.assign(Object.assign({}, popup.header), { title: 'پنل ادمین' }), body: Object.assign(Object.assign({}, popup.body), { render: () => <div className='h-100'>{this.renderBackOffice({ product, category, popup: undefined })}</div> }) }, popup));
            }
            else {
                return (<BackOffice product={product} category={category} actions={this.actions} getState={this.getState.bind(this)}/>);
            }
        };
        this.actions = {
            renderBackOffice: this.renderBackOffice.bind(this),
            renderList: this.renderList.bind(this),
            renderCartCountButton: this.renderCartCountButton.bind(this),
            renderFactor: this.renderFactor.bind(this),
            renderPrice: this.renderPrice.bind(this),
            renderShipping: this.renderShipping.bind(this),
            renderCart: this.renderCart.bind(this),
            renderProductSlider: this.renderProductSlider.bind(this),
            renderCartButton: this.renderCartButton.bind(this),
            renderProductCard: this.renderProductCard.bind(this),
            renderProductPage: this.getCartCount.bind(this),
            getCartItem: this.getCartItem.bind(this),
            getCartItems: this.getCartItems.bind(this),
            getCartCount: this.getCartCount.bind(this),
            removeCartItem: this.removeCartItem.bind(this),
            setCartCount: this.setCartCount.bind(this),
            updateShipping: this.updateShipping.bind(this),
            updateFactor: this.updateFactor.bind(this),
            getProp: this.getProp.bind(this),
            copy: this.copy.bind(this),
            getFirstVariant: this.getFirstVariant.bind(this),
            getExistVariantsByOptionValues: this.getExistVariantsByOptionValues.bind(this),
            getVariantLabel: this.getVariantLabel.bind(this),
            getVariant: this.getVariant.bind(this),
            getVariantByKey: this.getVariantByKey.bind(this),
            isVariantKeyExist: this.isVariantKeyExist.bind(this),
            getDiscountPercent: this.getDiscountPercent.bind(this)
        };
        let { id, unit = '$', addToCartText = 'Add To Cart', getDiscounts = () => [], getExtras = () => [], getShippingOptions = () => [], cartCache = false, checkDiscountCode, payment, importHTML, } = props;
        if (id === undefined) {
            console.error('aio shop error=> missing id props');
        }
        this.id = id;
        this.importHTML = importHTML;
        this.unit = unit;
        this.addToCartText = addToCartText;
        this.getDiscounts = getDiscounts;
        this.getExtras = getExtras;
        this.getShippingOptions = getShippingOptions;
        this.cartCache = cartCache;
        this.checkDiscountCode = checkDiscountCode;
        this.payment = payment;
        this.storage = AIOStorage('aioshop' + id);
        if (this.cartCache) {
            if (typeof this.cartCache === 'function') {
                this.cart = this.cartCache('get') || [];
            }
            else if (this.storage) {
                this.cart = this.storage.load({ name: 'cart', def: [] });
            }
            else {
                this.cart = [];
            }
        }
        else {
            this.cart = [];
        }
        this.factor = { total: 0, discount: 0, discounts: [], amount: 0, extras: [], factors: [] };
        this.shipping = {};
        this.popup = new AIOPopup();
        makeAutoObservable(this);
    }
    //{ count:Number, product:Object,productId:any,variantId:any,type:'product' | 'variant' }
    getDiscountPercent(dp = 0) {
        function validate(v = 0) { v = +v; if (isNaN(v)) {
            v = 0;
        } return v; }
        ;
        let list = (!Array.isArray(dp) ? [dp] : dp);
        let sum = 0;
        for (let i = 0; i < list.length; i++) {
            sum += validate(list[i]);
        }
        return sum;
    }
}
const ProductCard = observer((props) => {
    let { variantId, actions, getState, product, onClick, type, floatHtml = '', addToCart, footer, header } = props;
    let [variantLabel] = useState(variantId ? actions.getVariantLabel(product, variantId) : undefined);
    let [description] = useState(variantLabel || getProp('description'));
    function getProp(prop) { return actions.getProp({ product, variantId, prop }); }
    function getImage() {
        let props = {
            src: getProp('image'), onClick, [type === 'vertical' ? 'height' : 'width']: '100%'
        };
        return <img {...props}/>;
    }
    function name_layout() { return { html: product.name, className: 'as-product-card-name' }; }
    function description_layout() { return description ? { html: description, className: 'as-product-card-description' } : false; }
    function image_layout() { return { className: 'as-product-card-image', align: type === 'vertical' ? 'vh' : undefined, html: (<>{getImage()}{floatHtml}</>) }; }
    function cartButton_layout() {
        return { className: 'of-visible', html: actions.renderCartCountButton({ product, variantId, type, addToCart }) };
    }
    function getLayout_horizontal() {
        return {
            className: `as-product-card ${type}`,
            column: [
                { show: !!header, html: () => header, className: 'w-100' },
                {
                    row: [
                        image_layout(),
                        { size: 6 },
                        {
                            flex: 1,
                            column: [
                                {
                                    flex: 1,
                                    column: [
                                        { size: 6 },
                                        name_layout(),
                                        description_layout(),
                                        {
                                            className: 'of-visible',
                                            row: [
                                                cartButton_layout(),
                                                { flex: 1 },
                                                { html: actions.renderPrice({ product, variantId, type: 'v', actions, getState }) },
                                                { size: 12 }
                                            ]
                                        },
                                        { size: 6 }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                { show: !!footer, html: () => footer, className: 'w-100' }
            ]
        };
    }
    function getLayout_vertical() {
        return {
            className: `as-product-card ${type}`,
            column: [
                image_layout(),
                {
                    flex: 1, className: 'p-6',
                    column: [
                        {
                            flex: 1,
                            column: [
                                { size: 6 },
                                name_layout(),
                                description_layout(),
                                { flex: 1 },
                                { html: actions.renderPrice({ product, variantId, type: 'v', actions, getState }) },
                                { size: 6 },
                                { row: [cartButton_layout()] }
                            ]
                        }
                    ]
                }
            ]
        };
    }
    function getLayout_shipping() {
        let className = `as-product-card ${type}`;
        return {
            className,
            row: [
                image_layout(),
                { size: 6 },
                {
                    flex: 1, align: 'v',
                    column: [
                        name_layout(),
                        { size: 24, className: 'fs-10', align: 'v', show: !!variantLabel, html: variantLabel },
                        { size: 24, className: 'fs-10', align: 'v', show: !variantLabel, html: getProp('description') },
                        { row: [{ html: actions.renderPrice({ product, variantId, type: 'h', actions, getState }), flex: 1 }, cartButton_layout()] }
                    ]
                }
            ]
        };
    }
    let layout;
    if (type === 'horizontal') {
        layout = getLayout_horizontal();
    }
    else if (type === 'vertical') {
        layout = getLayout_vertical();
    }
    else if (type === 'shipping') {
        layout = getLayout_shipping();
    }
    return (<RVD layout={layout}/>);
});
const ProductPage = observer((props) => {
    let { product, variantId, actions, getState } = props;
    let [variantKey, setVariantKey] = useState('');
    let [optionValuesDic] = useState(getOptionValuesDic());
    let [error, setError] = useState('');
    let [toggle, setToggle] = useState({});
    useEffect(() => {
        if (variantId !== undefined) {
            if (!actions.getVariant(product, variantId)) {
                setError('محصول مورد نظر یافت نشد');
            }
        }
    }, []);
    useEffect(() => {
        let { variants = [] } = product;
        if (variants.length) {
            let firstVariant = actions.getFirstVariant(product, variantId);
            let variantKey = firstVariant ? firstVariant.key : undefined;
            setVariantKey(variantKey);
        }
    }, []);
    function getOptionValuesDic() {
        let { optionTypes = [], variants = [] } = product;
        function getOptionValue(id, index) {
            var _a;
            let { optionValues } = optionTypes[index];
            let optionValueId = id;
            let optionValueName = ((_a = optionValues.find((o) => o.id === id)) === null || _a === void 0 ? void 0 : _a.name) || '';
            return { optionValueId, optionValueName };
        }
        let res = [];
        for (let i = 0; i < variants.length; i++) {
            let variant = variants[i];
            let { key, id: variantId } = variant;
            let inStock = actions.getProp({ product, variantId, prop: 'inStock', def: Infinity });
            if (!inStock) {
                continue;
            }
            let keyList = key.split('_');
            for (let j = 0; j < keyList.length; j++) {
                res[j] = res[j] || [];
                if (!res[j].find((o) => o.optionValueId === keyList[j])) {
                    res[j].push(getOptionValue(keyList[j], j));
                }
            }
        }
        return res;
    }
    function changeVariantKey(optionTypeIndex, optionValueId) {
        let optionValueIds = variantKey.split('_');
        optionValueIds[optionTypeIndex] = optionValueId;
        let ev = actions.getExistVariantsByOptionValues(product, optionValueIds.slice(0, optionTypeIndex + 1));
        let newVariantKey = ev[0].key;
        setVariantKey(newVariantKey);
    }
    function getImage(image) { return <img src={image} height='100%' alt=''/>; }
    function getProp(prop, def) {
        let variant = variantKey ? actions.getVariantByKey(product, variantKey) : undefined;
        return actions.getProp({ product, variantId: variant ? variant.id : undefined, prop, def });
    }
    function image_layout() {
        let name = getProp('name');
        let rate = getProp('rate');
        let image = getProp('image');
        return {
            html: (<Box content={(<RVD layout={{
                        className: 'as-product-page-image',
                        column: [
                            { align: 'vh', html: (<>{getImage(image)}{rate_layout(rate)}</>) },
                            name_layout(name)
                        ]
                    }}/>)}/>)
        };
    }
    function rate_layout(rate) {
        if (rate === undefined) {
            return false;
        }
        return <div className='as-product-page-rate-container'><Rate rate={rate} singleStar={true}/></div>;
    }
    function name_layout(name) { return { className: 'as-fs-l as-fc-d as-bold', html: name }; }
    function variant_layout() {
        let { variants = [], optionTypes = [] } = product;
        if (!optionTypes.length || !variants.length || !variantKey) {
            return false;
        }
        if (variantId !== undefined) {
            return { html: (<Box content={<RVD layout={{ html: actions.getVariantLabel(product, variantId) }}/>}/>) };
        }
        return {
            html: (<Box content={(<RVD layout={{ column: [{ gap: 6, column: optionTypes.map((o, i) => optionValues_layout(o, i)) }] }}/>)}/>)
        };
    }
    function optionValues_layout({ name }, index) {
        let selectedKeys = variantKey.split('_');
        let optionValues = optionValuesDic[index].filter(({ optionValueId }) => {
            let values = selectedKeys.slice(0, index).concat(optionValueId);
            let res = actions.getExistVariantsByOptionValues(product, values) || [];
            return !!res.length;
        });
        return {
            className: 'as-product-page-option-type',
            column: [
                label_layout(name),
                { size: 6 },
                {
                    className: 'ofx-auto',
                    row: optionValues.map(({ optionValueName, optionValueId }) => {
                        let active = selectedKeys[index] === optionValueId;
                        return optionButton_layout(optionValueName, optionValueId, active, index);
                    })
                }
            ]
        };
    }
    function optionButton_layout(text, value, active, index) {
        let className = 'as-product-page-option-type-button as-fs-m' + (active ? ' active' : '');
        return { html: (<button className={className} onClick={() => changeVariantKey(index, value)}>{text}</button>) };
    }
    function label_layout(label, key) {
        let icon = false;
        if (key) {
            icon = { show: !!key, html: <Icon path={toggle[key] ? mdiChevronDown : mdiChevronLeft} size={1}/>, size: 30, align: 'vh' };
        }
        return {
            className: 'as-box-label',
            onClick: key ? () => setToggle(Object.assign(Object.assign({}, toggle), { [key]: !toggle[key] })) : undefined,
            row: [
                icon,
                { html: label, align: 'v' },
            ]
        };
    }
    function review_layout() {
        let review = getProp('review');
        if (!review) {
            return false;
        }
        return { html: (<Box title={'توضیحات'} content={review} toggle={true}/>) };
    }
    function details_layout() {
        let details = [];
        let { details: productDetails = [] } = product;
        details = [...productDetails];
        if (variantKey) {
            let variant = actions.getVariantByKey(product, variantKey);
            let { details: variantDetails = [] } = variant;
            details = [...variantDetails, ...details];
        }
        if (!details.length) {
            return false;
        }
        return {
            html: (<Box title={'مشخصات'} showAll={true} content={(showAll) => <Details details={details} showAll={showAll}/>}/>)
        };
    }
    function rates_layout() {
        let rates = getProp('rates', []);
        if (!rates.length) {
            return false;
        }
        return { html: <Box title='امتیاز کاربران' content={<RateItems rates={rates}/>}/> };
    }
    function import_layout(row) {
        let { importHTML = () => { } } = getState();
        ;
        let html = importHTML({ type: 'cart', position: row });
        if (!html) {
            return false;
        }
        return { html: <Box content={html}/>, className: 'as-fs-m as-fc-m' };
    }
    function footer_layout() {
        let variantId;
        if (product.variants) {
            if (!actions.isVariantKeyExist(product, variantKey)) {
                return { html: 'ناموجود', className: 'as-product-page-footer as-not-exist', align: 'v' };
            }
            let variant = actions.getVariantByKey(product, variantKey);
            variantId = variant.id;
        }
        return {
            className: 'as-product-page-footer',
            row: [
                { align: 'v', column: [cartCountButton_layout(product, variantId)] },
                { flex: 1 },
                { html: actions.renderPrice({ product, variantId, type: 'v', actions, getState }) }
            ]
        };
    }
    function cartCountButton_layout(product, variantId) {
        return {
            className: 'of-visible', align: 'v',
            html: actions.renderCartCountButton({ product, variantId, type: 'product page', addToCart: true })
        };
    }
    if (error) {
        return (<RVD layout={{ className: 'as-product-page', html: error, align: 'vh' }}/>);
    }
    return (<RVD layout={{
            className: 'as-product-page',
            column: [
                {
                    flex: 1, className: 'ofy-auto as-product-page-body',
                    column: [
                        image_layout(),
                        import_layout(0),
                        variant_layout(),
                        import_layout(1),
                        details_layout(),
                        import_layout(2),
                        review_layout(),
                        import_layout(3),
                        rates_layout(),
                        import_layout(4),
                    ]
                },
                footer_layout()
            ]
        }}/>);
});
class Details extends Component {
    lowDetails_layout(details, showAll) {
        if (showAll) {
            return false;
        }
        let bolds = details.filter(([key, value, bold]) => bold);
        if (bolds.length < 3) {
            for (let i = 0; i < details.length; i++) {
                let [key, value, bold] = details[i];
                if (bold) {
                    continue;
                }
                if (bolds.length >= 3) {
                    break;
                }
                bolds.push(details[i]);
            }
        }
        return {
            className: 'as-product-page-details',
            column: bolds.map((o) => this.detail_layout(o))
        };
    }
    fullDetails_layout(details, showAll) {
        if (!showAll) {
            return false;
        }
        return {
            className: 'as-product-page-details',
            column: details.map((o) => this.detail_layout(o))
        };
    }
    detail_layout([key, value, bold]) {
        let isList = Array.isArray(value);
        return {
            className: 'as-product-page-detail',
            row: [
                { html: key, className: 'as-fs-s as-fc-m as-detail-key' + (bold ? ' bold-key' : ''), align: 'v' },
                { show: !isList, html: value, className: 'as-fs-m as-fc-d as-detail-value' },
                {
                    show: !!isList, className: 'as-fs-m as-fc-d as-detail-value', column: () => value.map((v) => {
                        return {
                            row: [
                                { html: <Icon path={mdiCircleSmall} size={.8}/> },
                                { html: v, flex: 1 }
                            ]
                        };
                    })
                }
            ]
        };
    }
    render() {
        let { details, showAll } = this.props;
        return (<RVD layout={{
                column: [
                    this.fullDetails_layout(details, showAll),
                    this.lowDetails_layout(details, showAll),
                ]
            }}/>);
    }
}
function Price(props) {
    let { product, variantId, type, actions, getState } = props;
    function validateDiscountPercent(v = 0) { v = +v; if (isNaN(v)) {
        v = 0;
    } return v; }
    if (!product) {
        debugger;
    }
    let price = actions.getProp({ product, variantId, prop: 'price', def: 0 });
    let discountPercent = actions.getProp({ product, variantId, prop: 'discountPercent', def: 0 });
    let sum = actions.getDiscountPercent(discountPercent);
    function price_layout() { return { show: !!sum, html: () => (<del>{SplitNumber(price)}</del>), align: 'v', style: { fontSize: '80%' } }; }
    function finalPrice_layout() { return { html: `${SplitNumber(price - (price * sum / 100))}`, align: 'v', style: { fontWeight: 'bold' } }; }
    function unit_layout() { return { html: getState().unit, align: 'v', style: { fontSize: '70%' } }; }
    function discountPercent_layout() {
        return {
            show: !!sum, gap: 3, style: { fontSize: '85%' },
            row: () => {
                let list = !Array.isArray(discountPercent) ? [{ value: discountPercent }] : discountPercent.map((o) => typeof o === 'object' ? o : { value: o });
                return list.map(({ value, color }) => {
                    value = validateDiscountPercent(value);
                    return { show: !!value, html: value + '%', className: 'as-discount-box', align: 'v', style: { background: color } };
                });
            }
        };
    }
    let className = 'as-price-layout', layout;
    if (type === 'h') {
        layout = { className, gap: 3, row: [discountPercent_layout(), price_layout(), finalPrice_layout(), unit_layout()] };
    }
    else {
        let row1 = { gap: 3, show: !!sum, row: [{ flex: 1 }, price_layout(), discountPercent_layout()] };
        let row2 = { row: [{ flex: 1 }, finalPrice_layout(),{size:3}, unit_layout()] };
        layout = { className, align: 'v', column: [row1, row2] };
    }
    return <RVD layout={layout}/>;
}
const Shipping = observer((props) => {
    let { actions, getState } = props;
    let [discountCode, setDiscountCode] = useState('');
    let [discountCodeAmount, setDiscountCodeAmount] = useState(0);
    let [discountCodeError, setDiscountCodeError] = useState('');
    let { cart, getShippingOptions, checkDiscountCode } = getState();
    function changeShipping(changeObject) {
        return __awaiter(this, void 0, void 0, function* () {
            let newShipping = Object.assign(Object.assign({}, getState().shipping), changeObject);
            actions.updateShipping(newShipping);
            yield actions.updateFactor();
        });
    }
    useEffect(() => {
        const fetchData = () => __awaiter(void 0, void 0, void 0, function* () {
            let shippingOptions = getShippingOptions();
            let shipping = {};
            for (let i = 0; i < shippingOptions.length; i++) {
                let shippingOption = shippingOptions[i];
                let option = typeof shippingOption === 'function' ? shippingOption() : shippingOption;
                let { value, field } = option;
                if (!field) {
                    continue;
                }
                shipping[field] = value;
            }
            yield changeShipping(shipping);
        });
        fetchData();
    }, []);
    function items_layout() {
        let cartItems_layout = cart.map(({ product, variantId }) => {
            let html = actions.renderProductCard({ product, variantId, type: 'shipping', actions, getState });
            return { className: 'of-visible', html };
        });
        return { html: (<Box content={(<RVD layout={{ className: 'of-visible', column: [{ flex: 1, className: 'of-visible', column: cartItems_layout }] }}/>)}/>) };
    }
    function options_layout() {
        let shippingOptions = getShippingOptions();
        if (!shippingOptions.length) {
            return false;
        }
        return {
            column: shippingOptions.map((o, i) => {
                let shippingOption = typeof o === 'function' ? o() : o;
                if (!shippingOption) {
                    return false;
                }
                let { show } = shippingOption;
                show = typeof show === 'function' ? show() : show;
                if (show === false) {
                    return false;
                }
                if (shippingOption.type === 'html') {
                    return html_layout(shippingOption);
                }
                return option_layout(shippingOption, i === shippingOptions.length - 1);
            })
        };
    }
    function option_layout(shippingOption, isLast) {
        let { title, subtitle, options, field, multiple } = shippingOption;
        return {
            html: (<Box title={title} subtitle={subtitle} content={(<AIOInput type='radio' className='as-shipping-item' multiple={multiple} options={options.map((o) => { return Object.assign(Object.assign({}, o), { before: o.icon }); })} optionClassName="as-shipping-option" value={getState().shipping[field]} onChange={(value) => changeShipping({ [field]: value })}/>)}/>)
        };
    }
    function html_layout(shippingOption) {
        let { title, subtitle, html } = shippingOption;
        html = typeof html === 'function' ? html((obj) => changeShipping(obj)) : html;
        return { html: <Box title={title} subtitle={subtitle} content={html}/> };
    }
    function discountCode_layout() {
        if (!checkDiscountCode) {
            return false;
        }
        return {
            html: (<Box content={(<RVD layout={{
                        className: 'as-discount-code',
                        row: [
                            {
                                flex: 1,
                                html: (<input disabled={!!discountCodeAmount} placeholder='کد تخفیف' type='text' value={discountCode} onChange={(e) => { setDiscountCode(e.target.value); setDiscountCodeError(''); }}/>)
                            },
                            {
                                html: (<button disabled={!!discountCodeAmount || !discountCode} onClick={() => __awaiter(this, void 0, void 0, function* () {
                                        if (!checkDiscountCode) {
                                            return;
                                        }
                                        let res = yield checkDiscountCode(discountCode, getState());
                                        if (typeof res === 'number') {
                                            setDiscountCodeAmount(res);
                                            setDiscountCodeError('');
                                        }
                                        else if (typeof res === 'string') {
                                            setDiscountCodeAmount(0);
                                            setDiscountCodeError(res);
                                        }
                                    })}>ثبت کد تخفیف</button>)
                            }
                        ]
                    }}/>)}/>)
        };
    }
    function discountCodeError_layout() {
        if (!discountCodeError) {
            return false;
        }
        return { className: 'as-shipping-discount-code-error', html: discountCodeError };
    }
    function factor_layout() {
        if (!cart.length) {
            return false;
        }
        return { html: <Box content={() => actions.renderFactor()}/> };
    }
    function submit_layout() {
        let { amount } = getState().factor;
        return {
            className: 'as-submit-button-container',
            html: (<button onClick={() => getState().payment()} className='as-submit-button'>{`پرداخت ${SplitNumber(amount)} ${getState().unit}`}</button>)
        };
    }
    function import_layout(row) {
        let { importHTML = () => { } } = getState();
        let html = importHTML({ type: 'cart', position: row });
        if (!html) {
            return false;
        }
        return { html: <Box content={html}/>, className: 'as-fs-m as-fc-m' };
    }
    return (<RVD layout={{
            style: { background: '#f4f4f4', height: '100%' }, className: 'as-shipping',
            column: [
                {
                    flex: 1, className: 'ofy-auto',
                    column: [
                        import_layout(0),
                        items_layout(),
                        import_layout(1),
                        options_layout(),
                        discountCode_layout(),
                        discountCodeError_layout(),
                        import_layout(2),
                        factor_layout(),
                    ]
                },
                submit_layout(),
            ]
        }}/>);
});
const Cart = observer((props) => {
    let { actions, getState, onSubmit } = props;
    let { cart } = getState();
    function item_layout({ product, variantId }) {
        return { className: 'of-visible', html: actions.renderProductCard({ product, variantId, type: 'horizontal', addToCart: true, actions, getState }) };
    }
    function items_layout() {
        if (!cart.length) {
            return { html: 'سبد خرید شما خالی است', align: 'vh' };
        }
        return { className: 'of-visible', column: cart.map((o) => item_layout(o)) };
    }
    function total_layout() {
        if (!cart.length) {
            return false;
        }
        let { total, discount } = getState().factor;
        let html = (<Box content={(<RVD layout={{
                    className: 'as-fs-l as-fc-d',
                    row: [
                        { html: 'جمع سبد خرید', flex: 1 },
                        { html: SplitNumber(total - discount), align: 'v', className: 'bold m-h-3' },
                        { html: getState().unit, className: 'as-fs-s as-fc-l', align: 'v' }
                    ]
                }}/>)}/>);
        return { html };
    }
    function submit_layout() {
        if (!cart.length) {
            return false;
        }
        return {
            className: 'as-submit-button-container',
            html: <button onClick={() => onSubmit()} className='as-submit-button'>تکمیل خرید</button>
        };
    }
    function import_layout(row) {
        let { importHTML = () => { } } = getState();
        let html = importHTML({ type: 'cart', position: row });
        if (!html) {
            return false;
        }
        return { html: <Box content={html}/>, className: 'as-fs-m as-fc-m' };
    }
    return (<RVD layout={{
            className: 'as-cart',
            column: [
                { flex: 1, className: 'ofy-auto ofx-visible', column: [import_layout(0), items_layout(), import_layout(1)] },
                { column: [total_layout(), submit_layout()] }
            ]
        }}/>);
});
function CartCountButton(props) {
    let { actions, getState, product, variantId, type, addToCart } = props;
    function getInitialCount() { return actions.getCartCount(product.id, variantId); }
    let { addToCartText } = getState();
    let initialCount = getInitialCount();
    let [count, setCount] = useState(initialCount);
    let [prevCount, setPrevCount] = useState(initialCount);
    let changeTimeout;
    function validateCount(count) {
        if (count === 0) {
            return 0;
        }
        let min = actions.getProp({ product, variantId, prop: 'min', def: 0 });
        let max = actions.getProp({ product, variantId, prop: 'max', def: Infinity });
        if (count > max) {
            count = max;
        }
        if (count < min) {
            count = min;
        }
        return count;
    }
    function change(count) {
        count = +count;
        if (isNaN(count)) {
            count = 0;
        }
        count = validateCount(count);
        setCount(count);
        clearTimeout(changeTimeout);
        changeTimeout = setTimeout(() => actions.setCartCount({ product, variantId, count }), 500);
    }
    function handlePropsChanged() {
        let count = getInitialCount();
        if (count !== prevCount) {
            setTimeout(() => { setCount(count); setPrevCount(count); }, 0);
        }
    }
    function cartIcon_layout(count) {
        if (!count) {
            return false;
        }
        let icon = <Icon path={mdiCart} size={0.8}/>;
        return { align: 'vh', className: 'p-h-6', row: [{ html: icon, align: 'vh' }, { html: count, align: 'v' }] };
    }
    function getIcon(dir, count, min) {
        let path;
        if (dir === 1) {
            path = mdiPlus;
        }
        else {
            if (count - 1 < min || count === 1) {
                path = mdiTrashCanOutline;
            }
            else {
                path = mdiMinus;
            }
        }
        return <Icon path={path} size={dir === 1 ? .9 : (count === 1 ? .8 : .9)}/>;
    }
    function dirButton_layout(dir) {
        let min = actions.getProp({ product, variantId, prop: 'min', def: 0 });
        let max = actions.getProp({ product, variantId, prop: 'max', def: Infinity });
        let step = actions.getProp({ product, variantId, prop: 'step', def: 1 });
        let inStock = actions.getProp({ product, variantId, prop: 'inStock', def: Infinity });
        return {
            align: 'vh',
            html: (<button className='as-cart-count-button-step' onClick={() => change(count + (dir * step))} disabled={dir === 1 && (count >= max || count >= inStock)}>
                    {getIcon(dir, count, min)}
                </button>)
        };
    }
    function changeButton_layout() {
        if (!count) {
            return false;
        }
        let step = actions.getProp({ product, variantId, prop: 'step', def: 1 });
        let min = actions.getProp({ product, variantId, prop: 'min', def: 0 });
        let max = actions.getProp({ product, variantId, prop: 'max', def: Infinity });
        let inStock = actions.getProp({ product, variantId, prop: 'inStock', def: Infinity });
        if (count && count < min) {
            count = min;
        }
        let maxText = '', minText = '';
        if (max && inStock) {
            if (!!min) {
                minText = `حداقل ${min}`;
            }
            if (max && inStock) {
                if (count === max) {
                    maxText = `حداکثر ${max}`;
                }
                else if (count === inStock) {
                    maxText = `سقف موجودی`;
                }
            }
        }
        return {
            className: 'of-visible',
            column: [
                {
                    row: [
                        dirButton_layout(1),
                        { align: 'v', className: 'of-visible', html: (<div data-step={step > 1 ? `${step}+` : undefined} className='as-cart-count-button-input as-fs-m as-fc-d'>{count}</div>) },
                        dirButton_layout(-1)
                    ]
                },
                { show: !!minText || !!maxText, html: `${minText} ${maxText}`, className: 'as-cart-button-text' },
            ]
        };
    }
    function getLayout() {
        //اگر این یک کارت کاستوم برای نمایش از خارج سیستم است
        let { variants } = product;
        let step = actions.getProp({ product, variantId, prop: 'step', def: 1 });
        //اگر در حال نمایش صفحه یک محصول که در انبار موجود نیست هستیم
        if (!actions.getProp({ product, variantId, prop: 'inStock', def: Infinity })) {
            return { html: 'نا موجود', className: 'as-cart-count-button-not-exist' };
        }
        else if (type === 'product page') {
            //اگر در حال نمایش صفحه یک محصول واریانت دار هستیم و واریانت آی دی ارسالی معتبر نیست
            if (variants && !variantId) {
                return { html: 'نا موجود', className: 'as-cart-count-button-not-exist' };
            }
        }
        else {
            //اگر در حال نمایش کارت یک محصول واریانت دار هستیم 
            if (variants && !variantId) {
                return cartIcon_layout(actions.getCartCount(product.id));
            }
            //اگر در حال نمایش کارت یک محصول در صفحه شیپینگ هستیم
            if (type === 'shipping') {
                return cartIcon_layout(actions.getCartCount(product.id, variantId));
            }
        }
        if (addToCart) {
            if (!count) {
                return { html: <button onClick={() => change(step)} className={'as-cart-count-button-add'}>{addToCartText}</button> };
            }
            if (count) {
                return changeButton_layout();
            }
        }
    }
    useEffect(() => handlePropsChanged());
    let layout = getLayout();
    if (!layout) {
        return null;
    }
    return (<RVD layout={layout}/>);
}
const Factor = observer((props) => {
    let { actions, getState } = props;
    let { unit } = getState();
    let { total, discount, discounts = [], amount, extras = [] } = getState().factor;
    function total_layout() {
        return {
            className: 'as-fs-m as-fc-m',
            row: [
                { html: 'مجموع قیمت' },
                { flex: 1 },
                { html: SplitNumber(total), align: 'v' },
                { size: 3 },
                { html: unit, className: 'as-fs-s as-fc-l', align: 'v' }
            ]
        };
    }
    function discount_layout() {
        if (!discount) {
            return false;
        }
        return {
            className: 'as-fs-m as-fc-m',
            row: [
                { html: 'مجموع تخفیف' },
                { flex: 1 },
                { html: SplitNumber(discount), align: 'v' },
                { size: 3 },
                { html: unit, className: 'as-fs-s as-fc-l', align: 'v' },
                { html: <Icon path={mdiMinus} size={0.7}/>, align: 'vh', style: { color: 'red' } }
            ]
        };
    }
    function discounts_layout() {
        if (!discounts.length) {
            return false;
        }
        return {
            gap: 12,
            column: discounts.map(({ title, discountPercent = 0, discount }) => {
                return row_layout({ title, percent: discountPercent, amount: discount, dir: -1 });
            })
        };
    }
    function row_layout({ title, percent, amount, dir }) {
        return {
            row: [
                { html: title, className: 'as-fs-m as-fc-m' },
                { flex: 1 },
                { show: !!percent, html: `(${percent}%)`, className: 'm-h-3 as-fs-m as-fc-m' },
                { html: SplitNumber(amount), align: 'v', className: 'as-fs-m as-fc-m' },
                { size: 3 },
                { html: unit, className: 'as-fs-s as-fc-l', align: 'v' },
                { html: <Icon path={dir === -1 ? mdiMinus : mdiPlus} size={0.7}/>, align: 'vh', style: { color: dir === -1 ? 'red' : 'green' } }
            ]
        };
    }
    function extras_layout() {
        if (!extras.length) {
            return false;
        }
        return {
            gap: 12,
            column: extras.map(({ title, percent, amount }) => row_layout({ title, percent, amount, dir: 1 }))
        };
    }
    function amount_layout() {
        return {
            className: 'as-fs-l as-fc-d',
            row: [
                { html: 'قابل پرداخت', className: 'bold' },
                { flex: 1 },
                { html: SplitNumber(amount), align: 'v', className: 'bold' },
                { size: 3 },
                { html: unit, className: 'as-fs-s as-fc-l', align: 'v' }
            ]
        };
    }
    return (<RVD layout={{ gap: 12, column: [total_layout(), discount_layout(), discounts_layout(), extras_layout(), amount_layout()] }}/>);
});
function List(props) {
    let { actions, before, after, search, onChange, totalCount = 0, products } = props;
    let [paging, setPaging] = useState(getPaging());
    let [searchValue, setSeachValue] = useState('');
    function change(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!onChange) {
                alert(`
                aio-shop error => in renderList props you set search:boolean and/or paging:boolean props 
                but missing set onChange:({pageSize?:number,pageNumber?:number,searchValue?:string})=>boolean props
            `);
                return;
            }
            let newPaging = paging, newSearchValue = searchValue;
            if (key === 'paging') {
                newPaging = Object.assign(Object.assign({}, paging), value);
                let { size: pageSize, number: pageNumber } = newPaging;
                let res = yield onChange({ pageSize, pageNumber, searchValue });
                if (res === true) {
                    setPaging(newPaging);
                }
            }
            if (key === 'searchValue') {
                newSearchValue = value;
            }
            let res = yield onChange({ pageSize: newPaging.size, pageNumber: newPaging.number, searchValue: newSearchValue });
            if (res === true) {
                setPaging(newPaging);
                setSeachValue(newSearchValue);
            }
        });
    }
    function getPaging() {
        if (typeof totalCount !== 'number') {
            alert(`
                aio-shop error => in renderList props you set paging:boolean props 
                but missing set totalCount:number props
            `);
        }
        return {
            number: 1, size: 20, sizes: [10, 20, 40, 100], serverSide: true, length: totalCount, onChange: (obj) => change('paging', obj)
        };
    }
    function search_layout() {
        if (!search) {
            return false;
        }
        return {
            className: 'as-list-search',
            html: (<AIOInput type='text' after={<Icon path={mdiMagnify} size={0.8}/>} onChange={(searchValue) => change('searchValue', searchValue)}/>)
        };
    }
    function before_layout() { return { show: !!before, html: () => typeof before === 'function' ? before() : before }; }
    function after_layout() { return { show: !!after, html: () => typeof after === 'function' ? after() : after }; }
    function items_layout() {
        return {
            className: 'of-visible',
            html: (<AIOInput type='table' value={products} rowTemplate={({ row }) => actions.renderProductCard(row)} paging={props.paging ? paging : undefined}/>)
        };
    }
    return (<RVD layout={{
            className: 'as-list of-visible',
            column: [
                search_layout(),
                { flex: 1, className: 'ofy-auto as-list-products', column: [before_layout(), items_layout(), after_layout()] }
            ]
        }}/>);
}
function Slider({ items, actions, getState, before, after }) {
    function before_layout() { return { show: !!before, html: before, className: 'as-slider-before' }; }
    function after_layout() { return { show: !!after, html: after, className: 'as-slider-after' }; }
    function item_layout(product) { return { className: 'of-visible', html: actions.renderProductCard(Object.assign(Object.assign({}, product), { type: 'vertical' })) }; }
    function items_layout() { return { gap: 12, className: 'of-visible', row: items.map((item) => item_layout(item)) }; }
    function body_layout() { return { className: 'as-slider-body', gap: 12, row: [before_layout(), items_layout(), after_layout()] }; }
    return (<RVD layout={{ className: 'as-slider', column: [body_layout()] }}/>);
}
function Rate(props) {
    let { rate, color, singleStar } = props;
    function getIcon(index) {
        let full = Math.floor(rate);
        let half = !!(rate - full);
        if (index < full) {
            return mdiStar;
        }
        else if (index === full && half) {
            return mdiStarHalfFull;
        }
        else {
            return mdiStarOutline;
        }
    }
    function icons_layout(list) { return { row: list.map((o, i) => icon_layout(i)) }; }
    function icon_layout(index) { return { style: { color }, className: 'as-rate-icon', html: <Icon path={getIcon(index)} size={0.6}/> }; }
    function text_layout() { return { html: rate, className: 'as-rate-text' }; }
    let list = Array(singleStar ? 1 : 5).fill(0);
    return (<RVD layout={{ align: 'v', className: 'align-vh as-rate', row: [text_layout(), { size: 3 }, icons_layout(list)] }}/>);
}
function RateItems({ rates }) {
    function getRangeColor(value) { return ['red', 'orange', 'yellow', 'green', 'lightgreen'][value - 1]; }
    function text_layout(text) { return { html: text, className: 'as-fs-s as-fs-m w-96 no-wrap', align: 'v' }; }
    function slider_layout(value) { return { align: 'v', className: 'as-rate-item-slider', flex: 1, html: getSlider(value) }; }
    function value_laoyut(value) { return { align: 'vh', html: value, className: 'as-rate-item-value' }; }
    function getFillStyle(index) { if (index === 0) {
        return { background: 'green' };
    } }
    function getSlider(value) { return (<AIOInput type='slider' start={0} end={5} step={0.1} value={[value]} direction='left' fillStyle={getFillStyle}/>); }
    function item_layout({ text, value }) { return { className: 'as-rate-items', row: [text_layout(text), slider_layout(value), value_laoyut(value)] }; }
    return (<RVD layout={{ column: rates.map((o) => item_layout(o)) }}/>);
}
class Box extends Component {
    constructor(props) {
        super(props);
        this.state = { open: true, toggleShowAll: false };
    }
    toggle_layout(toggle) {
        if (!toggle) {
            return false;
        }
        let { open } = this.state;
        return {
            size: 30, align: 'vh', html: <Icon path={open ? mdiChevronDown : mdiChevronLeft} size={1}/>
        };
    }
    header_layout(title, subtitle, toggle, showAll) {
        let { toggleShowAll } = this.state;
        return {
            className: 'as-box-title',
            onClick: toggle ? () => this.setState({ open: !this.state.open }) : undefined,
            row: [
                this.toggle_layout(toggle),
                { show: !!title, html: title, align: 'v' },
                { show: !!subtitle, html: `( ${subtitle} )`, className: 'as-fs-s as-fc-l as-box-subtitle', align: 'v' },
                { flex: 1 },
                {
                    show: !!showAll,
                    html: toggleShowAll ? 'نمایش کمتر' : 'نمایش همه',
                    className: 'as-link',
                    onClick: () => this.setState({ toggleShowAll: !toggleShowAll })
                }
            ]
        };
    }
    render() {
        let { open, toggleShowAll } = this.state;
        let { title, subtitle, content, toggle, showAll } = this.props;
        return (<RVD layout={{
                className: 'as-box',
                column: [
                    this.header_layout(title, subtitle, toggle, showAll),
                    { size: 6, show: !!open && !!title },
                    { show: !!open && !!content, html: typeof content === 'function' ? content(toggleShowAll) : content, className: 'as-fs-m as-fc-m as-box-content' }
                ]
            }}/>);
    }
}
function BackOffice(props) {
    let { category, product, actions, getState } = props;
    const getTabs = () => {
        let tabs = [];
        if (product) {
            tabs.push({ text: 'محصولات', value: 'products' });
        }
        if (category) {
            tabs.push({ text: 'دسته بندی ها', value: 'categories' });
        }
        return tabs;
    };
    let [tabs] = useState(getTabs());
    let [tab, setTab] = useState('products');
    function tabs_layout(tab) { return { html: (<AIOInput type='tabs' options={tabs} value={tab} onChange={(tab) => setTab(tab)}/>) }; }
    function body_layout(tab) {
        if (tab === 'products') {
            return products_layout();
        }
        if (tab === 'categories') {
            return categories_layout();
        }
    }
    function products_layout() {
        let { list, onAdd, onRemove, onEdit, onChange, fields, variantMode } = product;
        let p = { actions, getState, list, onAdd, onRemove, onEdit, onChange, fields, variantMode };
        return { className: 'h-100 ofy-auto', flex: 1, html: (<ProductManager {...p}/>) };
    }
    function categories_layout() {
        let { list, onChange } = category, p = { actions, getState, categories: list, onChange };
        return { className: 'h-100 ofy-auto', flex: 1, html: (<CategoryManager {...p}/>) };
    }
    return <RVD layout={{ className: 'aio-shop-back-office', column: [tabs_layout(tab), body_layout(tab)] }}/>;
}
function ProductManager(props) {
    let cls = 'as-bo-productmanager-productcard';
    let { list = [], variantMode, fields, getState, onAdd = () => 'id' + Math.round(Math.random() * 1000000), onEdit = () => true, onRemove = () => true } = props;
    let { popup } = getState();
    let [searchValue, setSearchValue] = useState('');
    function header_layout(searchValue) {
        return { gap: 12, className: 'as-bo-productmanager-header', row: [add_layout(), search_layout(searchValue)] };
    }
    function add_layout() { return { html: <button onClick={() => productFormPopup(undefined)} className='as-bo-button'>افزودن</button> }; }
    function search_layout(searchValue) {
        return {
            flex: 1,
            html: (<AIOInput placeholder='جستجو' className='as-bo-productmanager-search' type='text' value={searchValue} after={<Icon path={mdiMagnify} size={.9} style={{ margin: '0 6px' }}/>} onChange={(searchValue) => setSearchValue(searchValue)}/>)
        };
    }
    const add = (newProduct) => __awaiter(this, void 0, void 0, function* () { if ((yield onAdd(newProduct)) === true) {
        popup.removeModal();
    } });
    const remove = (id) => __awaiter(this, void 0, void 0, function* () { if ((yield onRemove(id)) === true) {
        popup.removeModal();
    } });
    const edit = (newProduct) => __awaiter(this, void 0, void 0, function* () { if ((yield onEdit(newProduct)) === true) {
        popup.removeModal();
    } });
    function body_layout(searchValue) {
        return { flex: 1, className: 'ofy-auto', column: Search(list, searchValue, (o) => `${o.name} ${o.id}`).map((o) => card_layout(o)) };
    }
    function card_layout(product) {
        let { variants = [], name, description, id, image } = product;
        return {
            className: cls, align: 'v', onClick: () => productFormPopup(product),
            row: [
                { html: <img src={image} width={56} height={56}/>, size: 60, align: 'vh', className: cls + '-image' },
                { html: variants.length, className: cls + '-variants-length', show: !!variants.length },
                { size: 6 },
                {
                    flex: 1,
                    column: [{ html: name, className: cls + '-name' }, { html: description, className: cls + '-description' }, { html: `کد ${id}`, className: cls + '-code' }]
                },
                { size: 6 },
                { html: <Icon path={mdiClose} size={.7}/>, align: 'vh', className: cls + '-remove', onClick: (e) => { e.stopPropagation(); remove(id); } },
                { size: 6 }
            ]
        };
    }
    function productFormPopup(o) {
        let product = o || { name: '', image: false, review: '', description: '', details: [], price: 0, discountPercent: 0 };
        let type = !!o ? 'edit' : 'add';
        let title = !!o ? 'ویرایش محصول' : 'افزودن محصول';
        popup.addModal({
            header: { title },
            body: {
                render: () => (<RVD layout={{
                        style: { height: '100%', background: '#fff', display: 'flex' },
                        column: [
                            {
                                flex: 1,
                                html: (<ProductForm variantMode={variantMode} fields={fields} product={product} type={type === 'add' ? 'add' : 'edit'} onAdd={(newProduct) => add(newProduct)} onEdit={(newProduct) => edit(newProduct)} onRemove={() => remove(o.id)}/>)
                            }
                        ]
                    }}/>)
            }
        });
    }
    return (<><RVD layout={{ className: 'product-manager', column: [header_layout(searchValue), body_layout(searchValue)] }}/></>);
}
function ProductForm(props) {
    let [model, setModel] = useState(props.product);
    let { variantMode, fields = [], onAdd, onEdit, onRemove, type } = props;
    function form() {
        let { optionTypes = [] } = model;
        return (<AIOInput className='as-bo-form' type='form' lang='fa' reset={true} value={Object.assign({}, model)} footer={(obj) => formFooter_layout(obj)} onChange={(model, errors) => setModel(Object.assign({}, model))} inputs={{
                props: { gap: 12 },
                column: [
                    { input: { type: 'text', disabled: true }, field: 'value.id', label: 'آی دی', show: model.id !== undefined },
                    { input: { type: 'text' }, field: 'value.name', label: 'نام', validations: [['required']] },
                    {
                        row: [
                            { input: { type: 'number' }, field: 'value.price', label: 'قیمت', validations: [['required']] },
                            { input: { type: 'number' }, field: 'value.discountPercent', label: 'درصد تخفیف' }
                        ]
                    },
                    { input: { type: 'textarea' }, field: 'value.description', label: 'توضیحات', validations: [['required']] },
                    { input: { type: 'textarea' }, field: 'value.review', label: 'شرح', validations: [['required']] },
                    {
                        input: {
                            type: 'table', add: { text: '', value: '' }, remove: true,
                            columns: [{ title: 'نام', value: 'row.name' }, { title: 'آی دی', value: 'row.id' }]
                        },
                        field: 'value.optionTypes', show: !!variantMode, label: 'آپشن ها'
                    },
                    {
                        show: !!variantMode,
                        column: !variantMode ? undefined : optionTypes.map(({ name }, i) => {
                            return {
                                input: {
                                    type: 'table', remove: true, add: { name: '', id: '' },
                                    columns: [{ title: 'نام', value: 'row.name' }, { title: 'آی دی', value: 'row.id' }]
                                },
                                inlineLabel: `${name} ها`, field: `value.optionTypes[${i}].optionValues`
                            };
                        })
                    },
                    {
                        show: !!variantMode,
                        input: {
                            type: 'table',
                            add: { id: 'nv' + Math.round(Math.random() * 10000000) },
                            remove: true,
                            columns: !variantMode ? undefined : model.optionTypes.map(({ name, id, optionValues }, i) => {
                                return {
                                    title: name, type: 'select', value: `row.key.split("_")[${i}]`, optionTypeId: id,
                                    options: optionValues.map(({ name, id }) => { return { text: name, value: id }; }),
                                    onChange: ({ row, value }) => {
                                        let key = row.key;
                                        if (!key) {
                                            key = optionTypes.map(() => 'notset').join('_');
                                        }
                                        let keyList = key.split('_');
                                        keyList[i] = value;
                                        row.key = keyList.join('_');
                                        setModel(model);
                                    }
                                };
                            })
                        },
                        inlineLabel: 'واریانت ها', field: 'value.variants'
                    },
                    {
                        row: [
                            {
                                field: 'value.image', flex: 'none',
                                input: {
                                    type: 'image', placeholder: 'افزودن تصویر', height: 120,
                                    onChange: ({ url, file }) => setModel(Object.assign(Object.assign({}, model), { image: url, image_file: file }))
                                }
                            },
                            { flex: 1 }
                        ]
                    },
                    ...fields
                ]
            }}/>);
    }
    function getErrorMessage(errors, errorKeys) {
        let firstError = errorKeys[0] ? errors[errorKeys[0]] : false;
        if (firstError) {
            return firstError;
        }
        if (!model.image) {
            return 'ثبت تصویر محصول ضروری است';
        }
    }
    function formFooter_layout({ errors, isModelChanged, onReset }) {
        let errorKeys = Object.keys(errors);
        let showSubmit = !!onAdd;
        let showEdit = !!onEdit && isModelChanged;
        let errorMessage = getErrorMessage(errors, errorKeys);
        if (!showSubmit && !showEdit && !errorMessage && !onRemove) {
            return false;
        }
        return (<RVD layout={{
                className: 'as-bo-product-form',
                row: [
                    {
                        show: type === 'add',
                        html: (<button disabled={!!errorMessage} className='as-bo-button as-bo-button-submit' onClick={() => onAdd(model)}>ثبت</button>)
                    },
                    {
                        show: type === 'edit' && isModelChanged,
                        html: (<button className='as-bo-button as-bo-button-edit' onClick={() => onEdit(model)}>ویرایش</button>)
                    },
                    {
                        show: !!onReset && !!isModelChanged,
                        html: (<button className='as-bo-button as-bo-button-reset' onClick={() => onReset(model)}>بازنشانی تغییرات</button>)
                    },
                    {
                        show: type === 'edit',
                        html: (<button className='as-bo-button as-bo-button-remove' onClick={() => onRemove()}>حذف</button>)
                    },
                    { flex: 1 },
                    { show: !!errorMessage, html: () => errorMessage, align: 'v', style: { color: 'red', fontSize: 10 } }
                ]
            }}/>);
    }
    return <RVD layout={{ className: 'p-12', style: { background: '#eee' }, html: form() }}/>;
}
function CategoryManager(props) {
    let [state, setState] = useState({
        categories: JSON.parse(JSON.stringify(props.categories || [])),
        editId: false,
        temp: ''
    });
    function header_layout(state) { return toolbar_layout(state, undefined); }
    function items_layout(state, items, level) {
        return { column: items.map((o) => item_layout(state, o, level)) };
    }
    function item_layout(state, item, level = 0) {
        let column = [toolbar_layout(state, item)];
        let { childs = [] } = item;
        if (childs.length) {
            column.push(items_layout(state, item.childs, level + 1));
        }
        return { style: { marginRight: level === 0 ? 0 : 24 }, column };
    }
    function toolbar_layout(state, item) {
        let style = { marginBottom: 6 };
        if (!item) {
            style.background = 'lightblue';
            style.fontWeight = 'bold';
        }
        return {
            size: 36, style,
            row: [
                plus_layout(state, item),
                name_layout(state, item),
                { show: !item, html: <Icon path={mdiContentSave} size={1}/>, size: 36, align: 'vh' },
                { show: !!item, html: <Icon path={mdiDelete} size={0.8}/>, size: 36, align: 'vh' }
            ]
        };
    }
    function change(state, item, field, value) {
        item[field] = value;
        setState(state);
    }
    function add(state, parent) {
        let newItem = { id: 'cat' + Math.round(Math.random() * 100000000), name: '', childs: [] };
        if (!parent) {
            state.categories.push(newItem);
        }
        else {
            parent.childs = parent.childs || [];
            parent.childs.push(newItem);
        }
        setState(state);
    }
    function name_input(state, item) {
        if (!item) {
            return 'مدیریت دسته بندی';
        }
        let { editId, temp, categories } = state;
        if (editId !== item.id) {
            return (<div style={{ border: 'none', background: 'none', width: '100%', height: '100%', padding: '0 12px' }} className='align-v' onClick={() => setState(Object.assign(Object.assign({}, state), { editId: item.id, temp: item.name }))}>{item.name}</div>);
        }
        return (<input className='category-manager-input' type='text' value={temp} onBlur={(e) => change(categories, item, 'name', e.target.value)} onChange={(e) => setState(Object.assign(Object.assign({}, state), { temp: e.target.value }))}/>);
    }
    function name_layout(state, item) {
        return { flex: 1, html: name_input(state, item), style: { border: '1px solid #ddd', height: '100%' }, align: 'v' };
    }
    function plus_layout(state, item) {
        return { className: 'category-manmager-add', onClick: () => add(state, item), html: <Icon path={mdiPlusThick} size={0.8}/>, align: 'vh' };
    }
    return <RVD layout={{ className: 'category-manager', column: [header_layout(state), items_layout(state, 0, undefined)] }}/>;
}
