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
  updateState(cartId){
    this.setState({ 
      activeTabId:cartId
    })
  }
  getDynamics(key,shippingOptions){
    let {activeTabId} = this.state;
    let obj;
    if(activeTabId === 'خرید عادی'){
      obj = {
        total:()=>this.getTotal_kharide_addi(shippingOptions),
        amounts:()=>this.getAmounts_kharide_addi(shippingOptions),
        productCardComponent:()=>ProductCard
      }
    }
    if(activeTabId === 'کمپین'){
      obj = {
        total:()=>this.getTotal_kharide_addi(shippingOptions),
        amounts:()=>this.getAmounts_kharide_addi(shippingOptions),
        productCardComponent:()=>ProductCard
      }
    }  
    if(activeTabId === 'فروش ویژه'){
      obj = {
        total:()=>this.getTotal_forooshe_vije(shippingOptions),
        amounts:()=>this.getAmounts_forooshe_vije(shippingOptions),
        productCardComponent:()=>ForoosheVijeCard
      }
    }
    if(activeTabId === 'بلکس'){
      obj = {
        total:()=>this.getTotal_belex(shippingOptions),
        amounts:()=>this.getAmounts_forooshe_vije(shippingOptions),
        productCardComponent:()=>BelexCard
      }
    }  
    return obj[key]() 
  }
  getTotal_kharide_addi(shippingOptions){
    let { cart, getFactorDetails } = this.context;
    let {activeTabId} = this.state;
    let cartTab = cart[activeTabId];
    let cartItems = [];
    for(let id in cartTab){
      let { product, count,variantId } = cartTab[id];
      cartItems.push({
        ItemCode: product.defaultVariant.code,//use in getFactorDetails()
        ItemQty: count,//use in getFactorDetails()
      });
    }
    let res = getFactorDetails(cartItems,shippingOptions);
    return res.DocumentTotal
  }
  getTotal_forooshe_vije(){
    let { cart } = this.context;
    let {activeTabId} = this.state;
    let cartTab = cart[activeTabId];
    let total = 0;
    for (let id in cartTab) {
      let { product, count, variantId } = cartTab[id];
      let { packQty } = count;
      let variant = product.variants.find((o) => o.id.toString() === id.toString());
      let { finalPrice } = variant;
      total += packQty * finalPrice;
    }
    return total;
  }
  getTotal_belex(){
    let { cart } = this.context;
    let {activeTabId} = this.state;
    let cartTab = cart[activeTabId];
    let total = 0;
    for (let id in cartTab) {
      let { product, count, variantId } = cartTab[id];
      let { packQty } = count;
      total += packQty * product.price;
    }
    return total;
  }
  getAmounts_kharide_addi(shippingOptions){
    let { getFactorDetails,cart } = this.context;
    let { PayDueDate, SettleType, DeliveryType, PaymentTime } = shippingOptions;
    let {activeTabId} = this.state;
    let cartTab = cart[activeTabId];
    let cartItems = [];
    for(let id in cartTab){
      let { product, count,variantId } = cartTab[id];
      cartItems.push({
        ItemCode: product.defaultVariant.code,//use in getFactorDetails()
        ItemQty: count,//use in getFactorDetails()
      });
    }
    let factorDetails = getFactorDetails(cartItems, { PayDueDate, PaymentTime, SettleType, DeliveryType })
    console.log(factorDetails)
    let jame_kolle_takhfif = factorDetails.marketingdetails.DocumentDiscount;
    let darsade_takhfife_pardakhte_online = factorDetails.marketingdetails.DocumentDiscountPercent
    let mablaghe_ghabele_pardakht = factorDetails.DocumentTotal;
    let takhfife_pardakhte_online = (mablaghe_ghabele_pardakht * darsade_takhfife_pardakhte_online) / 100;
    mablaghe_ghabele_pardakht = mablaghe_ghabele_pardakht - takhfife_pardakhte_online;
    let jame_kolle_sabade_kharid = mablaghe_ghabele_pardakht + jame_kolle_takhfif + takhfife_pardakhte_online;
    return [
      ['جمع کل سبد خرید',jame_kolle_sabade_kharid,'theme-medium-font-color fs-12'],
      ['جمع کل تخفیف',jame_kolle_takhfif,'colorFDB913 fs-12'],
      ['تخفیف نحوه پرداخت',takhfife_pardakhte_online,'color00B5A5 fs-12'],
      ['مبلغ قابل پرداخت',mablaghe_ghabele_pardakht,'theme-dark-font-color fs-12 bold'],
    ]
  }
  getAmounts_forooshe_vije(shippingOptions){
    let { PayDueDate } = shippingOptions;
      let percents = {
        '1':[12,100],'17':[4.8,20],'18':[3.6,30],
        '19':[4.5,50],'20':[10.5,50]
      }
      let [a,b] = percents[PayDueDate.toString()];
      let jame_kolle_sabade_kharid = this.getDynamics('total',shippingOptions);
      let takhfife_pardakhte_online = this.fix(jame_kolle_sabade_kharid * a / 100);
      let mablaghe_ghabele_pardakht = jame_kolle_sabade_kharid - takhfife_pardakhte_online;
      mablaghe_ghabele_pardakht = this.fix(mablaghe_ghabele_pardakht * b / 100)
      return [
        ['جمع کل سبد خرید',jame_kolle_sabade_kharid,'theme-medium-font-color fs-14'],
        ['تخفیف نحوه پرداخت',takhfife_pardakhte_online,'color00B5A5 fs-14'],
        ['مبلغ قابل پرداخت',mablaghe_ghabele_pardakht,'theme-dark-font-color bold fs-16'],
      ]
  }
  getCartItems(){
    let { cart,fixPrice } = this.context;
    let {activeTabId} = this.state;
    let cartTab = cart[activeTabId];
    let cartItems = [];
    if(activeTabId === 'خرید عادی' || activeTabId === 'کمپین'){
      for(let id in cartTab){
        let { product, count,variantId } = cartTab[id];
        cartItems.push({
          itemCode: product.defaultVariant.code,//use in fixPrice()
          itemQty: count,//use in fixPrice()
          variantId
        });
      }
      let fixedItems = fixPrice(cartItems.map(({itemCode,itemQty})=>{return {itemCode,itemQty}}))
      cartItems = cartItems.map(({ variantId }, i) => {
        let cartItem = cartTab[variantId];
        let updatedProduct = { ...cartItem.product, ...fixedItems[i] }
        return { ...cartItem, product: updatedProduct }
      })
    }
    if(activeTabId === 'فروش ویژه' || activeTabId === 'بلکس'){
      for(let id in cartTab){cartItems.push(cartTab[id]);}
    }
    return cartItems
  }
  componentDidMount() {
    let { cart } = this.context;
    let { activeTabId = this.state.activeTabId } = this.props;
    if (!activeTabId) {
      let tabIds = Object.keys(cart);
      if (tabIds.length) { activeTabId = tabIds[0]; }
    }
    if(activeTabId){this.updateState(activeTabId)}
    
  }
  getProductCards(renderIn){
    let ProductCardComponent = this.getDynamics('productCardComponent');
    return this.getCartItems().map(({product,variantId,count})=>{
      return <ProductCardComponent type='horizontal' renderIn={renderIn} key={variantId} product={product} variantId={variantId} count={count}/>
    });
  }
  tabs_layout() {
    let { cart } = this.context,{ activeTabId } = this.state;
    let tabs = Object.keys(cart);;
    return {
      html: (
        <AIOButton
          type='tabs' optionText='option' optionValue='option' style={{ marginBottom: 12 }} value={activeTabId} options={tabs}
          optionStyle={{ flex: tabs.length <= 3 ? 1 : undefined }}
          optionAfter={(option) => <div className='tab-badge'>{Object.keys(cart[option]).length}</div>}
          onChange={(activeTabId) => this.updateState( activeTabId )}
        />
      )
    }
  }
  products_layout() {
    let { activeTabId } = this.state;
    if (activeTabId) {
      return { flex: 1, className: 'ofy-auto', gap: 12, column: this.getProductCards('cart').map((card) => { return { html: card } }) }
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
  openPopup() {
    let { rsa_actions } = this.context;
    let {activeTabId} = this.state;
    rsa_actions.addPopup({
      body:()=>(
        <Shipping
          getDynamics={this.getDynamics.bind(this)}
          options={this.getOptions()}
          cartId={activeTabId}
          productCards={this.getProductCards('shipping')}
          shippingState={this.getShippingState()}
        />
      ),
      title:'ادامه فرایند خرید'
    })
  }
  fix(value) {
    try { return +value.toFixed(0) }
    catch { return 0 }
  }
  payment_layout() {
    let { activeTabId } = this.state;
    if (!activeTabId) { return false }
    return {
      size:60,
      className: "bgFFF p-h-12 theme-box-shadow",
      row: [
        {
          flex: 1,className:'p-h-12',
          column: [
            {flex:1},
            { align: "v", html: "مبلغ قابل پرداخت", className: "theme-medium-font-color fs-12" },
            {align: "v", html: `${functions.splitPrice(this.getDynamics('total',{PayDueDate:1,PaymentTime:5,SettleType:1,DeliveryType:11}))} ریال`, className: "theme-dark-font-color fs-14 bold" },
            {flex:1}
          ]
        },
        {
          html: (<button onClick={()=>this.openPopup()} className="button-2" style={{ height: 36 }}>ادامه فرایند خرید</button>),
          align: "v"
        }
      ]
    }
  }
  getShippingState(){
    let {activeTabId} = this.state;
    return {
      PayDueDate:1,
      PayDueDate_options:[
        {value:1,text:'نقد',type:['کمپین','خرید عادی']},//ByDelivery
        {value:15,text:'25% نقد و 75% چک دو ماهه',type:['کمپین','خرید عادی']},//'Cash25_TowMonth75'
        {value:16,text:'50% نقد و چک سه ماهه',type:['کمپین','خرید عادی']},//'Cach50_ThreeMonth50'
        {value:1,text:'نقد (12% تخفیف بیشتر)',type:['بلکس','فروش ویژه']},//'ByDelivery'
        {value:17,text:'20% نقد و 80% چک سه ماهه (4.8% تخفیف بیشتر)',type:['بلکس','فروش ویژه']},//'Cash20_ThreeMonth80'
        {value:18,text:'30% نقد و 70% چک چهار ماهه (3.6% تخفیف بیشتر)',type:['بلکس','فروش ویژه']},//'Cash30_FourMonth70'
        {value:19,text:'50% نقد و 50% چک پنج ماهه (4.5% تخفیف بیشتر)',type:['بلکس','فروش ویژه']},//'Cash50_FiveMonth50'
        {value:20,text:'50% نقد و 50% چک یک ماهه (10.5% تخفیف بیشتر)',type:['بلکس','فروش ویژه']}//'Cash50_OneMonth50'
      ].filter(({type})=>{
        return type.indexOf(activeTabId) !== -1
      }),
      PaymentTime:5,
      PaymentTime_options:[
        {value:5,text:'اینترنتی'},//'ByOnlineOrder'
        {value:1,text:'واریز قبل ارسال'},//'ByOrder'
        {value:2,text:'واریز پای بار'},//'ByDelivery'
      ],
      SettleType:1,
      SettleType_options:[
        {value:1,text:'نقد'},//'ByDelivery'
        {value:2,text:'چک'}//'Cheque'
      ],
      DeliveryType:11,
      DeliveryType_options:[
        {value:11,text:'ماشین توزیع بروکس'},//'BRXDistribution'
        {value:12,text:'ماشین اجاره ای'},//'RentalCar'
        {value:13,text:'باربری'},//'Cargo'
        {value:15,text:'ارسال توسط ویزیتور'}//'BySalesMan'
      ]
    }
  }
  getOptions(){
    let {activeTabId} = this.state;
    return [
      {key:'DeliveryType',text:'نحوه ارسال',show:()=>true},
      {key:'PaymentTime',text:'زمان پرداخت',show:()=>activeTabId === 'خرید عادی' || activeTabId === 'کمپین'},
      {key:'PayDueDate',text:'نحوه پرداخت',show:(shippingState)=>(activeTabId === 'خرید عادی' || activeTabId === 'کمپین') && shippingState.PaymentTime !== 5},
      {key:'PayDueDate',text:'نحوه پرداخت',show:()=>activeTabId === 'بلکس' || activeTabId === 'فروش ویژه'},
      {key:'SettleType',text:'نحوه پرداخت نقد',show:()=>activeTabId === 'بلکس' || activeTabId === 'فروش ویژه'}
    ]
  }
  render() {
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





class Shipping extends Component{
  static contextType = appContext;
  constructor(props){
    super(props);
    this.state = {
      shippingOptions:props.shippingState
    }
  }
  details_layout(list){
    return {
      className:'box p-12 m-h-12',
      column:list.map(([key,value,attrs = {}])=>{
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
  address_layout(address){
    return {
      className:'box p-12 m-h-12',
      column:[
        {size:36,align:'v',className:'theme-medium-font-color fs-12 bold',html:'آدرس تحویل'},          {
          className:'fs-14 theme-medium-font-color bgF1F1F1 p-12 br-4',html:address,size:72
        }
      ]
    }
  }
  options_layout(){
    let {options} = this.props;
    let {shippingOptions} = this.state
    return {
      gap:12,
      column:options.filter(({show})=>show(shippingOptions)).map((o)=>this.option_layout(o))
    }
  }
  changeOption(key,value){
    let {shippingOptions} = this.state;
    shippingOptions[key] = value;
    this.setState({shippingOptions})
  }
  option_layout({key,text}){
    let options = this.state.shippingOptions[key + '_options']
    let value = this.state.shippingOptions[key];
    return {
      className:'box p-12 m-h-12',
      column:[
        {size:36,align:'v',className:'theme-medium-font-color fs-12 bold',html:text},
        {
          html:(
            <AIOButton
              type='radio'
              options={options}
              optionClassName='"w-100 h-36"'
              value={value}
              onChange={(value)=>this.changeOption(key,value)}
            />
          )
        }
      ]
    }
  }
  phone_layout(phone){
    return {
      className:'box p-12 m-h-12',
      column:[
        {size:36,align:'v',className:'theme-medium-font-color fs-12 bold',html:'شماره تلفن'},
        {
          className:'fs-14 theme-medium-font-color bgF1F1F1 p-12 br-4',html:phone,style:{minHeight:36}
        }
      ]
    }
  }
  products_layout(productCards){
    return {
      column:[
        {size:36,align:'v',className:'theme-medium-font-color fs-14 bold p-h-12',html:'محصولات'},
        {className:'of-visible',column:productCards.map((card)=>{return {html:card,className:'of-visible'}})},
        {size:12}
      ]
    }
  }
  fix(value){
    try{return +value.toFixed(0)}
    catch{return 0}
  }
  amounts_layout(){
    let {getDynamics} = this.props;
    let {shippingOptions} = this.state;
    let amounts = getDynamics('amounts',shippingOptions)
    return {
      column:amounts.map(([key,value,className = 'theme-medium-font-color fs-14'])=>{
        if(value === false){return false}
        return {
          childsProps:{align:'v'},
          row:[{html:key + ':',className},{flex:1},{html:`${functions.splitPrice(value)} ریال`,className}]
        }
      })
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
  async onSubmit(){
    let { kharidApis,cart,SetState,rsa_actions,openPopup} = this.context;
    let {shippingOptions} = this.state;
    let {getDynamics,cartId} = this.props;
    let total = getDynamics('total',shippingOptions)
    let orderNumber = await kharidApis({
      api:'shipping',parameter: {cartId,shippingOptions,total}
    })
    if(!orderNumber){return}
    let newCart = {};
    for (let id in cart) { if (id !== cartId) { newCart[id] = cart[id] } }
    SetState({ cart: newCart })
    rsa_actions.removePopup('all');
    openPopup('sefareshe-ersal-shode-baraye-vizitor', orderNumber)
  }
  render(){
    let {userInfo} = this.context;
    let {cartId,productCards} = this.props;
    return (
      <>
        <RVD
        layout={{
          className:'theme-popup-bg',
          flex:1,
          column:[
            {
              flex:1,className:'ofy-auto',
              column:[
                {size:12},
                this.details_layout([
                  ['نام مشتری',`${userInfo.firstName} ${userInfo.lastName}`],
                  ['نام کمپین',cartId],
                  ['کد مشتری',userInfo.cardCode],
                  ['گروه مشتری',userInfo.groupName]
                ]),
                {size:12},
                this.address_layout(userInfo.address),
                {size:12},
                this.phone_layout(userInfo.phoneNumber),
                {size:12},
                this.options_layout(cartId),
                {size:12},
                this.products_layout(productCards),
                {size:12},
              ],
            },
            {
              className: 'p-h-12 bg-fff theme-box-shadow',
              style: { paddingTop: 12, borderRadius: '16px 16px 0 0' },
              column: [
                this.amounts_layout(),
                { size: 6 },
                this.button_layout(),
                { size: 12 }
              ]
            }
          ]
        }}
      />
      </>
    )
  }
}



