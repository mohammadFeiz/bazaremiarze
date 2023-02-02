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
  tabs_layout() {
    let { cart } = this.context,{ activeTabId } = this.state;
    return {
      html: (
        <AIOButton
          type='tabs' optionText='option' optionValue='option' style={{ marginBottom: 12 }} value={activeTabId} options={Object.keys(cart)}
          optionStyle={{ flex: this.tabs.length <= 3 ? 1 : undefined }}
          optionAfter={(option) => <div className='tab-badge'>{Object.keys(cart[option]).length}</div>}
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
    return {size: 72, className: "bgFFF p-h-12 theme-box-shadow",html:<CartPayment cartId={activeTabId}/>}
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
  fix(value) {
    try { return +value.toFixed(0) }
    catch { return 0 }
  }
  //خرید عادی و کمپین ها
  getDetails1(cartId){
    let { cart, fixPrice, getFactorDetails } = this.context;
    let cartTab = cart[cartId];
    let productCards = [];
    let cartItems = [];
    for(let id in cartTab){
      let { product, count,variantId } = cartTab[id];
      cartItems.push({
        itemCode: product.defaultVariant.code,//use in fixPrice()
        itemQty: count,//use in fixPrice()
        ItemCode: variantId,//use in getFactorDetails()
        ItemQty: count,//use in getFactorDetails()
        variantId//use for update cartItem
      });
      productCards.push(
        <ProductCard
          type='horizontal' renderIn='shipping'
          key={variantId}
          product={product}
          variantId={id}
          count={count}
        />
      )
    }
    let fixedItems = fixPrice(cartItems)
    cartItems = cartItems.map(({ variantId }, i) => {
      let cartItem = cartTab[variantId];
      let updatedProduct = { ...cartItem.product, ...fixedItems[i] }
      return { ...cartItem, product: updatedProduct }
    })
    let { DocumentTotal:total } = getFactorDetails(cartItems);
    let payment_layout = (shippingOptions)=>{
      let { getFactorDetails } = this.context;
      let { PayDueDate, SettleType, DeliveryType, PaymentTime } = shippingOptions;
      let factorDetails = getFactorDetails(cartItems, { PayDueDate, PaymentTime, SettleType, DeliveryType })
      let jame_kolle_takhfif = factorDetails.marketingdetails.DocumentDiscount;
      let darsade_takhfife_pardakhte_online = factorDetails.marketingdetails.DocumentDiscountPercent
      let mablaghe_ghabele_pardakht = factorDetails.DocumentTotal;
      let takhfife_pardakhte_online = (mablaghe_ghabele_pardakht * darsade_takhfife_pardakhte_online) / 100;
      mablaghe_ghabele_pardakht = mablaghe_ghabele_pardakht - takhfife_pardakhte_online;
      let jame_kolle_sabade_kharid = mablaghe_ghabele_pardakht + jame_kolle_takhfif + takhfife_pardakhte_online;
      return (
        <ShippingPayment
          api={'sentToVisitor'}
          shippingOptions={shippingOptions}
          cartItems={cartItems}
          buttonText={'ارسال برای ویزیتور'}
          mablaghe_ghabele_pardakht={mablaghe_ghabele_pardakht}
          amounts={[
            ['جمع کل سبد خرید',jame_kolle_sabade_kharid,'theme-medium-font-color fs-14'],
            ['جمع کل تخفیف',jame_kolle_takhfif,'colorFDB913 fs-14'],
            ['تخفیف نحوه پرداخت',takhfife_pardakhte_online,'color00B5A5 fs-14'],
            ['مبلغ قابل پرداخت',mablaghe_ghabele_pardakht,'theme-dark-font-color bold fs-16'],
          ]}
        />
      )
    }
    return {total,cartItems,productCards,payment_layout}
  }
  //فروش ویژه و بلکس
  getDetails2(cartId){
    let { cart } = this.context;
    let cartTab = cart[cartId];
    let total = 0;
    let productCards = [];
    let cartItems = [];
    for (let id in cartTab) {
      let { product, count, variantId } = cartTab[id];
      let { packQty } = count;
      let CardComponent;
      if(cartId === 'فروش ویژه'){
        let variant = product.variants.find((o) => o.id === variantId);
        let { finalPrice } = variant;
        total += packQty * finalPrice;
        CardComponent = ForoosheVijeCard
      }
      else if(cartId === 'بلکس'){
        total += packQty * product.price;
        CardComponent = BelexCard;
      }
      cartItems.push(cartTab[id]);
      productCards.push(
        <CardComponent
          type='horizontal' renderIn='shipping'
          key={variantId}
          product={product}
          variantId={variantId}
          count={count}
        />
      )
    }
    let payment_layout = (shippingOptions)=>{
      let { PayDueDate, SettleType } = shippingOptions;
      let percents = {
        'ByDelivery':[12,100],'Cash20_ThreeMonth80':[4.8,20],'Cash30_FourMonth70':[3.6,30],
        'Cash50_FiveMonth50':[4.5,50],'Cash50_OneMonth50':[10.5,50]
      }
      let [a,b] = percents[PayDueDate];
      let jame_kolle_sabade_kharid = total;
      let takhfife_pardakhte_online = this.fix(jame_kolle_sabade_kharid * a / 100);
      let mablaghe_ghabele_pardakht = jame_kolle_sabade_kharid - takhfife_pardakhte_online;
      mablaghe_ghabele_pardakht = this.fix(mablaghe_ghabele_pardakht * b / 100)
      let api = '';
      api += SettleType === 16?'pardakhte_':'sabte_' 
      api += cartId === 'فروش ویژه'?'foroosheVije':'belex'
      return (
        <ShippingPayment
          api={api}
          shippingOptions={shippingOptions}
          cartItems={cartItems}
          buttonText={SettleType === 16 ? 'پرداخت' : 'ثبت'}
          mablaghe_ghabele_pardakht={mablaghe_ghabele_pardakht}
          amounts={[
            ['جمع کل سبد خرید',jame_kolle_sabade_kharid,'theme-medium-font-color fs-14'],
            ['تخفیف نحوه پرداخت',takhfife_pardakhte_online,'color00B5A5 fs-14'],
            ['مبلغ قابل پرداخت',mablaghe_ghabele_pardakht,'theme-dark-font-color bold fs-16'],
          ]}
        />
      )
    }
    return {total,cartItems,productCards,payment_layout}
  }
  render() {
    let { cartId } = this.props;
    let details;
    if (cartId === 'خرید عادی') {
      details = this.getDetails1(cartId)
    }
    else if(cartId === 'فروش ویژه' || cartId === 'بلکس'){
      details = this.getDetails2(cartId);
    }
    return (
      <RVD
        layout={{
          className: "bgFFF p-h-12 theme-box-shadow",
          row: [
            {
              flex: 1,
              column: [
                { size: 12 },
                { size: 24, align: "v", html: "مبلغ قابل پرداخت", className: "theme-medium-font-color fs-12" },
                { size: 3 },
                {
                  size: 24,
                  row: [
                    { align: "v", html: functions.splitPrice(details.total), className: "theme-dark-font-color fs-14 bold" },
                    { size: 4 },
                    { align: "v", html: " ریال", className: "theme-dark-font-color fs-12" }
                  ]
                },
                { size: 12 },
              ],
            },
            {
              html: (
                <button
                  onClick={()=>openPopup('shipping',details)}
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
}

class ShippingPayment extends Component{
  async onSubmit(){
    let { kharidApis,cart,SetState,rsa_actions,openPopup} = this.context;
    let {shippingOptions,cartItems,mablaghe_ghabele_pardakht,cartId,api} = this.props;
    let { address, SettleType, PaymentTime, DeliveryType, PayDueDate } = shippingOptions;
    let orderNumber = await kharidApis({
      api,
      parameter: { 
        address, SettleType, PaymentTime, DeliveryType,PayDueDate,
        cartItems,mablaghe_ghabele_pardakht 
      }
    })
    if(!orderNumber){return}
    let newCart = {};
    for (let id in cart) { if (id !== cartId) { newCart[id] = cart[id] } }
    SetState({ cart: newCart })
    rsa_actions.removePopup('all');
    openPopup('sefareshe-ersal-shode-baraye-vizitor', orderNumber)
  }
  amounts_layout(){
    let {amounts} = this.props;
    return {className:'box p-12 m-h-12',column:amounts.map((o)=>this.amount_layout(o))}
  }
  amount_layout([key,value,attrs = {}]){
    if(!value){return false}
    let {className = 'theme-medium-font-color fs-14',style} = attrs;
    return {
      size:36,childsProps:{align:'v'},style,
      row:[{html:key + ':',className},{flex:1},{html:value,className}]
    }
  }
  button_layout(){
    let {buttonText} = this.props;
    return {
      size: 36, align: 'vh', className: 'theme-medium-font-color fs-14 bold',
      html: (
        <button 
          className="button-2" 
          onClick={() => this.onSubmit()}
        >{buttonText}</button>)
    }
  }
  render(){
    return (
      <RVD
        layout={{
          className: 'p-h-12 bg-fff theme-box-shadow',
          style: { paddingTop: 12, borderRadius: '16px 16px 0 0' },
          column: [
            this.amounts_layout(),
            { size: 6 },
            this.button_layout(),
            { size: 12 }
          ]
        }}
      />
    )
  }
}