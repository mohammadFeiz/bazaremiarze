import React, { Component } from 'react';
import appContext from './../../../app-context';
import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
import ProductCard from './../product-card/product-card';
import AIOButton from '../../../interfaces/aio-button/aio-button';
import noItemSrc from './../../../images/not-found.png';
import functions from '../../../functions';
import ForoosheVijeCard from '../forooshe-vije-card/forooshe-vije-card';
import BelexCard from '../belex-card/belex-card';
export default class Cart extends Component {
  static contextType = appContext;
  constructor(props) {
    super(props);
    this.state = { activeTabId: false, continued: false }
  }
  componentDidMount() {
    let { cart } = this.context;
    let { activeTabId = this.state.activeTabId } = this.props;
    if (!activeTabId) {
      let tabIds = Object.keys(cart);
      if (tabIds.length) { activeTabId = tabIds[0]; }
    }
    this.setState({ activeTabId })
  }
  getDetails() {
    let { changeCart, fixPrice, getFactorDetails } = this.context;
    this.tabs = [];
    for (let tabId in tabsDictionary) {
      let tab = tabsDictionary[tabId]
      if (tabId === 'forooshe_vije') {
        let finalPrice = 0;
        tab.cards = tab.cartItems.map(({ product, foroosheVije_count, variantId }) => {
          let variant = product.variants.find(({ id }) => id === variantId);
          finalPrice += foroosheVije_count.packQty * variant.finalPrice;
          return <ForoosheVijeCard product={product} variantId={variantId} count={foroosheVije_count} type='cart' />
        })
        tab.finalPrice = finalPrice;
      }
      else if (tabId === 'belex') {
        let finalPrice = 0;
        tab.cards = tab.cartItems.map(({ product, belex_count }) => {
          finalPrice += belex_count.packQty * product.price;
          return <BelexCard key={product.code} product={product} count={belex_count} />
        })
        tab.finalPrice = finalPrice;
      }
      else {
        let fixedItems = fixPrice(tab.cartItems.map(({ product, count }) => {
          let itemCode = product.defaultVariant.code;
          return { itemCode, itemQty: count }
        }))
        tab.cartItems = tab.cartItems.map((o, i) => {
          return { ...o, product: { ...o.product, ...fixedItems[i] } }
        })
        let items = tab.cartItems.map((o) => {
          return { ItemCode: o.variant.code, ItemQty: o.count }
        })
        tab.items = items;
        tab.factorDetails = getFactorDetails(items);
      }
      tab.badge = tab.cartItems.length;

      this.tabs.push(tab);
    }
    if (tabsDictionary[this.state.activeTabId]) {
      this.tab = tabsDictionary[this.state.activeTabId];
    }
    else {
      if (this.tabs[0]) {
        this.state.activeTabId = this.tabs[0].id;
        this.tab = this.tabs[0]
      }
      else {
        this.tab = undefined;
        this.state.activeTabId = undefined;
      }
    }
  }
  tabs_layout() {
    let { cart } = this.context;
    let { activeTabId } = this.state;
    return {
      html: (
        <AIOButton
          type='tabs'
          options={Object.keys(cart)}
          optionStyle={{ flex: this.tabs.length <= 3 ? 1 : undefined }}
          style={{ marginBottom: 12 }}
          value={activeTabId}
          optionAfter={(option) => <div className='tab-badge'>{Object.keys(cart[option]).length}</div>}
          optionText='option'
          optionValue='option'
          onChange={(activeTabId) => this.setState({ activeTabId })}
        />
      )
    }
  }
  products_layout() {
    let { cart } = this.context;
    let { activeTabId } = this.state;
    if (activeTabId) {
      let tab = cart[activeTabId];
      let items = Object.keys(tab);
      let cards = items.map((variantId) => {
        let { product, count } = tab[variantId];
        return (
          <ProductCard key={variantId} product={product} variantId={variantId} count={count} type='horizontal' />
        )
      });
      return { flex: 1, className: 'ofy-auto', gap: 12, column: cards.map((card) => { return { html: card } }) }
    }
    return {
      style: { background: '#eee', opacity: 0.5 },
      flex: 1, align: 'vh',
      column: [
        { html: <img src={noItemSrc} alt='' width='128' height='128' /> },
        { html: 'سبد خرید شما خالی است', style: { color: '#858a95' } },
        { size: 60 }
      ]
    }
  }
  payment_layout() {
    let { activeTabId } = this.state;
    if (!activeTabId) { return false }
    if (this.tab.id === 'forooshe_vije') { return this.foroosheVije_payment_layout() }
    if (this.tab.id === 'belex') { return this.belex_payment_layout() }
    let total = this.tab.factorDetails.DocumentTotal;
    return {
      size: 72, className: "bgFFF p-h-12 theme-box-shadow",
      row: [
        {
          flex: 1,
          column: [
            { flex: 1 },
            { align: "v", html: "مبلغ قابل پرداخت", className: "theme-medium-font-color fs-12" },
            { size: 3 },
            {
              row: [
                { align: "v", html: functions.splitPrice(total), className: "theme-dark-font-color fs-14 bold" },
                { size: 4 },
                { align: "v", html: " ریال", className: "theme-dark-font-color fs-12" }
              ]
            },
            { flex: 1 },
          ],
        },
        { html: <button disabled={continued} onClick={() => this.continue()} className="button-2" style={{ height: 36 }}>ادامه فرایند خرید</button>, align: "v" },
      ],
    }
  }
  foroosheVije_payment_layout() {
    let total = this.tab.finalPrice;
    let { continued } = this.state;
    return {
      size: 72, className: "bgFFF p-h-12 theme-box-shadow",
      row: [
        {
          flex: 1,
          column: [
            { flex: 1 },
            { align: "v", html: "مبلغ قابل پرداخت", className: "theme-medium-font-color fs-12" },
            { size: 3 },
            {
              row: [
                { align: "v", html: functions.splitPrice(total), className: "theme-dark-font-color fs-14 bold" },
                { size: 4 },
                { align: "v", html: " ریال", className: "theme-dark-font-color fs-12" }
              ]
            },
            { flex: 1 },
          ],
        },
        { html: <button disabled={continued} onClick={() => this.continue()} className="button-2" style={{ height: 36 }}>ادامه فرایند خرید</button>, align: "v" },
      ],
    }
  }
  belex_payment_layout() {
    let total = this.tab.finalPrice;
    let { continued } = this.state;
    return {
      size: 72, className: "bgFFF p-h-12 theme-box-shadow",
      row: [
        {
          flex: 1,
          column: [
            { flex: 1 },
            { align: "v", html: "مبلغ قابل پرداخت", className: "theme-medium-font-color fs-12" },
            { size: 3 },
            {
              row: [
                { align: "v", html: functions.splitPrice(total), className: "theme-dark-font-color fs-14 bold" },
                { size: 4 },
                { align: "v", html: " ریال", className: "theme-dark-font-color fs-12" }
              ]
            },
            { flex: 1 },
          ],
        },
        { html: <button onClick={() => this.continue()} className="button-2" style={{ height: 36 }}>ادامه فرایند خرید</button>, align: "v" },
      ],
    }
  }
  continue() {
    let { openPopup } = this.context;
    this.setState({ continued: true })
    openPopup('shipping', { ...this.tab })
  }
  render() {
    this.getDetails();
    return (
      <RVD
        layout={{
          flex: 1, className: 'theme-popup-bg',
          column: [this.tabs_layout(), this.products_layout(), this.payment_layout()]
        }}
      />
    )
  }
}


class CartPayment extends Component {
  static contextType = appContext;
  mablaghe_ghabele_pardakht_layout(total) {
    return {
      flex: 1,
      column: [
        { size: 12 },
        { size: 24, align: "v", html: "مبلغ قابل پرداخت", className: "theme-medium-font-color fs-12" },
        { size: 3 },
        {
          size: 24,
          row: [
            { align: "v", html: functions.splitPrice(total), className: "theme-dark-font-color fs-14 bold" },
            { size: 4 },
            { align: "v", html: " ریال", className: "theme-dark-font-color fs-12" }
          ]
        },
        { size: 12 },
      ],
    }
  }
  kharide_addi_layout() {
    let { cart, fixPrice, getFactorDetails, openPopup } = this.context;
    let { cartId } = this.props;
    let cartTab = cart[cartId];
    let cartItems = Object.keys(cartTab).map((variantId) => {
      let { product, count } = cartTab[variantId];
      let variant = product.variants.find(({ code }) => code === variantId);
      if (!variant) { debugger; }
      return {
        itemCode: product.defaultVariant.code,//use in fixPrice()
        itemQty: count,//use in fixPrice()
        ItemCode: variant.code,//use in getFactorDetails()
        ItemQty: count,//use in getFactorDetails()
        variantId//use for update cartItem
      }
    });
    let fixedItems = fixPrice(cartItems)
    cartItems = cartItems.map(({ variantId }, i) => {
      let cartItem = cartTab[variantId];
      let updatedProduct = { ...cartItem.product, ...fixedItems[i] }
      return { ...cartItem, product: updatedProduct }
    })
    let { DocumentTotal } = getFactorDetails(cartItems);
    return (
      <RVD
        layout={{
          className: "bgFFF p-h-12 theme-box-shadow",
          row: [
            this.mablaghe_ghabele_pardakht_layout(DocumentTotal),
            {
              html: (
                <button
                  onClick={() => {
                    openPopup(
                      'shipping',
                      {
                        cartId,
                        productCards: cartItems.map(({ variantId, product, count }) => {
                          return (
                            <ProductCard
                              key={variantId}
                              product={product}
                              variantId={variantId}
                              count={count}
                              type='horizontal'
                              renderIn='shipping'
                            />
                          )
                        }),
                        payment_layout: (shippingOptions) => this.kharide_addi_shipping_payment_layout(shippingOptions, cartItems)
                      }
                    )
                  }}
                  className="button-2" style={{ height: 36 }}
                >ادامه فرایند خرید</button>
              ),
              align: "v"
            }
          ]
        }}
      />
    )
  }
  forooshe_vije_layout() {
    let { cart, openPopup } = this.context;
    let { cartId } = this.props;
    let cartTab = cart[cartId];
    let total = 0;
    let productCards = [];
    let cartItems = [];
    for (let id in cartTab) {
      let { product, foroosheVije_count, variantId } = cartTab[id];
      let variant = product.variants.find(({ id }) => id === variantId);
      let { finalPrice } = variant;
      let { packQty } = foroosheVije_count;
      total += packQty * finalPrice;
      cartItems.push(cartTab[id]);
      productCards.push(
        <ForoosheVijeCard
          key={variantId}
          product={product}
          variantId={variantId}
          count={foroosheVije_count}
          type='horizontal'
          renderIn='shipping'
        />
      )
    }
    return (
      <RVD
        layout={{
          className: "bgFFF p-h-12 theme-box-shadow",
          row: [
            this.mablaghe_ghabele_pardakht_layout(total),
            {
              html: (
                <button
                  onClick={() => {
                    openPopup(
                      'shipping',
                      {
                        cartId, productCards,
                        payment_layout: (shippingOptions) => this.forooshe_vije_shipping_payment_layout(shippingOptions, total, cartItems)
                      }
                    )
                  }}
                  className="button-2" style={{ height: 36 }}
                >ادامه فرایند خرید</button>
              ),
              align: "v"
            }
          ]
        }}
      />
    )
  }
  fix(value) {
    try { return +value.toFixed(0) }
    catch { return 0 }
  }
  //خرید عادی و کمپین ها
  getPaymentDetails1(shippingOptions,cartItems){
    let { getFactorDetails } = this.context;
    let { PayDueDate, SettleType, DeliveryType, PaymentTime } = shippingOptions;
    let factorDetails = getFactorDetails(cartItems, { PayDueDate, PaymentTime, SettleType, DeliveryType })
    let jame_kolle_takhfif = factorDetails.marketingdetails.DocumentDiscount;
    let darsade_takhfife_pardakhte_online = factorDetails.marketingdetails.DocumentDiscountPercent
    let mablaghe_ghabele_pardakht = factorDetails.DocumentTotal;
    let takhfife_pardakhte_online = (mablaghe_ghabele_pardakht * darsade_takhfife_pardakhte_online) / 100;
    mablaghe_ghabele_pardakht = mablaghe_ghabele_pardakht - takhfife_pardakhte_online;
    let jame_kolle_sabade_kharid = mablaghe_ghabele_pardakht + jame_kolle_takhfif + takhfife_pardakhte_online;
    let mablaghe_pardakhte_naghdi = false;
    let buttonText = 'ارسال برای ویزیتور';
    return {
      jame_kolle_sabade_kharid,
      jame_kolle_takhfif,
      takhfife_pardakhte_online,
      mablaghe_ghabele_pardakht,
      mablaghe_pardakhte_naghdi,
      buttonText
    }
  }
  //بلکس و فروش ویژه
  getPaymentDetails2(shippingOptions,cartItems,jame_kolle_sabade_kharid){
    let { PayDueDate, SettleType } = shippingOptions;
    let percents = {
      'ByDelivery':[12,100],'Cash20_ThreeMonth80':[4.8,20],'Cash30_FourMonth70':[3.6,30],
      'Cash50_FiveMonth50':[4.5,50],'Cash50_OneMonth50':[10.5,50]
    }
    let [a,b] = percents[PayDueDate];
    let takhfife_pardakhte_online = this.fix(jame_kolle_sabade_kharid * a / 100);
    let mablaghe_ghabele_pardakht = jame_kolle_sabade_kharid - takhfife_pardakhte_online;
    let mablaghe_pardakhte_naghdi = this.fix(mablaghe_ghabele_pardakht * b / 100)
    let jame_kolle_takhfif = false;
    let buttonText = SettleType === 16 ? 'پرداخت' : 'ثبت';
    return {
      jame_kolle_sabade_kharid,
      jame_kolle_takhfif,
      takhfife_pardakhte_online,
      mablaghe_ghabele_pardakht,
      mablaghe_pardakhte_naghdi,
      buttonText
    }
  }
  details_layout(list){
    return {
      className:'box p-12 m-h-12',
      column:list.map(([key,value,attrs = {}])=>{
        if(value === false){return false}
        let {className = 'theme-medium-font-color fs-14',style} = attrs;
        return {
          size:36,childsProps:{align:'v'},style,
          row:[
            {html:key + ':',className},
            {flex:1},
            {html:value,className} 
          ]
        }
      })
    }
  }
  shipping_payment_layout(shippingOptions, cartItems,total) {
    let {cartId} = this.props;
    let fn;
    if(cartId === 'خرید عادی'){fn = 'getPaymentDetails1';}
    else{fn = 'getPaymentDetails2';}
    let {
      jame_kolle_sabade_kharid,
      jame_kolle_takhfif,
      takhfife_pardakhte_online,
      mablaghe_ghabele_pardakht,
      mablaghe_pardakhte_naghdi,
      buttonText
    } = this[fn](shippingOptions, cartItems,total)
    return {
      className: 'p-h-12 bg-fff theme-box-shadow',
      style: { paddingTop: 12, borderRadius: '16px 16px 0 0' },
      column: [
        this.details_layout([
          ['جمع کل سبد خرید',jame_kolle_sabade_kharid,'theme-medium-font-color fs-14'],
          ['جمع کل تخفیف',jame_kolle_takhfif,'colorFDB913 fs-14'],
          ['تخفیف نحوه پرداخت',takhfife_pardakhte_online,'color00B5A5 fs-14'],
          ['مبلغ قابل پرداخت',mablaghe_ghabele_pardakht,'theme-dark-font-color bold fs-16'],
          ['مبلغ پرداخت نقدی',mablaghe_pardakhte_naghdi,'color00B5A5 fs-14']
        ]),
        { size: 6 },
        {
          size: 36, align: 'vh', className: 'theme-medium-font-color fs-14 bold',
          html: (
            <button
              className="button-2"
              onClick={() => this.onSubmit(shippingOptions,cartItems,mablaghe_ghabele_pardakht)}
            >{buttonText}</button>
          )
        },
        { size: 12 }
      ]
    }

  }
  async onSubmit(shippingOptions,cartItems,mablaghe_ghabele_pardakht){
    let { kharidApis} = this.context;
    let { address, SettleType, PaymentTime, DeliveryType, PayDueDate } = shippingOptions;
    let api;
    let {cartId} = this.props;
    if(cartId === 'خرید عادی'){api = 'sendToVisitor'}
    else if(cartId === 'فروش ویژه'){
      api = SettleType === 16?'pardakhte_foroosheVije':'sabte_foroosheVije'
    }
    else if(cartId === 'فروش ویژه'){
      api = SettleType === 16?'pardakhte_belex':'sabte_belex'
    }
    let orderNumber = await kharidApis({
      api,
      parameter: { 
        address, SettleType, PaymentTime, DeliveryType, 
        PayDueDate,cartItems,mablaghe_ghabele_pardakht 
      }
    })
    if(!orderNumber){return}
    let { cart,SetState,rsa_actions,openPopup } = this.context;
    let newCart = {};
    for (let id in cart) { if (id !== cartId) { newCart[id] = cart[id] } }
    SetState({ cart: newCart })
    rsa_actions.removePopup('all');
    openPopup('sefareshe-ersal-shode-baraye-vizitor', orderNumber)
  }
  render() {
    let { cartId } = this.props;
    if (cartId === 'خرید عادی') {
      return this.kharide_addi_layout()
    }
  }
}