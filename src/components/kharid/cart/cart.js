import React,{Component} from 'react';
import appContext from './../../../app-context';
import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
import ProductCard from './../product-card/product-card';
import AIOButton from '../../../interfaces/aio-button/aio-button';
import noItemSrc from './../../../images/not-found.png';
import functions from '../../../functions';
import NV3Report from '../nv3-report';
import ForoosheVijeCard from '../forooshe-vije-card/forooshe-vije-card';
import BelexCard from '../belex-card/belex-card';
export default class Cart extends Component{
    static contextType = appContext;
    constructor(props){
      super(props);
      this.state = {activeTabId:'regular'}
    }
    splitPrice(price){
      if(!price){return price}
      let str = price.toString(),dotIndex = str.indexOf('.');
      if(dotIndex !== -1){str = str.slice(0,dotIndex)}
      let res = '',index = 0;
      for(let i = str.length - 1; i >= 0; i--){
          res = str[i] + res;
          if(index === 2){index = 0; if(i > 0){res = ',' + res;}}
          else{index++}
      }
      return res
    }
    getDetails(){
      let { cart,changeCart,fixPrice,getFactorDetails } = this.context,tabsDictionary = {};
      let variantIds = Object.keys(cart);
      for(let i = 0; i < variantIds.length; i++){
        let variantId = variantIds[i];
        let { product } = cart[variantId];
        let { campaign } = product;
        let tabId,tabTitle;
        if(product.type === 'forooshe_vije'){tabId = 'forooshe_vije'; tabTitle = 'فروش ویژه'}
        else if(product.type === 'belex'){tabId = 'belex'; tabTitle = 'بلکس 23 شیراز'}
        else if(product.cartId === 'نورواره 3'){tabId = 'نورواره 3'; tabTitle = 'نورواره 3'}
        else if(campaign){tabId = campaign.id; tabTitle = campaign.name}
        else{tabId = 'regular'; tabTitle = 'خرید عادی'}
        tabsDictionary[tabId] = tabsDictionary[tabId] || {id:tabId,title:tabTitle,cards:[],total:0,cartItems:[],totalDiscount:0,flex:1};
        tabsDictionary[tabId].cartItems.push(cart[variantId])
        tabsDictionary[tabId].badge++;
        tabsDictionary[tabId].id = tabId;
      }
      this.tabs = [];
      for(let tabId in tabsDictionary){
        let tab = tabsDictionary[tabId]
        if(tabId === 'forooshe_vije'){
          let finalPrice = 0;
          tab.cards = tab.cartItems.map(({product,foroosheVije_count,variantId})=>{
            let variant = product.variants.find(({id})=>id === variantId);
            finalPrice += foroosheVije_count.packQty * variant.finalPrice;
            return <ForoosheVijeCard product={product} variantId={variantId} count={foroosheVije_count} type='cart'/>
          })
          tab.finalPrice = finalPrice;
        }
        else if(tabId === 'belex'){
          let finalPrice = 0;
          tab.cards = tab.cartItems.map(({product,belex_count})=>{
            finalPrice += belex_count.packQty * product.price;
            return <BelexCard key={product.code} product={product} count={belex_count}/>
          })
          tab.finalPrice = finalPrice;
        }
        else{
          let fixedItems = fixPrice(tab.cartItems.map(({product,count})=>{
            let itemCode = product.defaultVariant.code;
            return {itemCode,itemQty:count} 
          }))
          tab.cartItems = tab.cartItems.map((o,i)=>{
            return {...o,product:{...o.product,...fixedItems[i]}}
          })
          tab.cards = tab.cartItems.map(({product,count,variant},i)=>{
            let { optionTypes,campaign } = product;
            let { optionValues } = variant;
            tab.total += count * product.FinalPrice;
            tab.totalDiscount += count * (product.Price - product.FinalPrice)
            let details = [];
            for (let j = 0; j < optionTypes.length; j++) {
              let optionType = optionTypes[j];
              details.push([optionType.name, optionType.items[optionValues[optionType.id]]]);
            }
            let props = {
              product,details,count,type:'horizontal',
              title:campaign?campaign.name:undefined,//2
              isFirst:i === 0,isLast: i === tabsDictionary[tabId].cartItems.length - 1,
              changeCount:(count) => changeCart(count,variant.id,product)
            }
            return <ProductCard {...props} index={i} showIsInCart={false}/>
          })
          let items = tab.cartItems.map((o)=>{
            return { ItemCode: o.variant.code, ItemQty: o.count }
          })
          tab.items = items;
          tab.factorDetails =  getFactorDetails(items);
        }
        tab.badge = tab.cartItems.length;
        
        this.tabs.push(tab);
      }
      if(tabsDictionary[this.state.activeTabId]){
        this.tab = tabsDictionary[this.state.activeTabId];
      }
      else{
        if(this.tabs[0]){
          this.state.activeTabId = this.tabs[0].id;
          this.tab = this.tabs[0]
        }
        else{
          this.tab = undefined;
          this.state.activeTabId = undefined;
        }
      }
    }
    tabs_layout(){
      if(!this.tabs.length){return false}
      return {
        html:(
          <AIOButton 
            type='tabs' 
            options={this.tabs}  
            optionStyle={{flex:this.tabs.length <= 3?1:undefined}}
            style={{marginBottom:12}}
            value={this.state.activeTabId} 
            optionAfter={(option)=><div className='tab-badge'>{option.badge}</div>}
            optionText='option.title'
            optionValue='option.id'
            onChange={(activeTabId)=>this.setState({activeTabId})}
          />
        )
      }
    }
    products_layout(){
      if(this.tab){
        let {cards} = this.tab;
        return {flex: 1,className:'ofy-auto',gap:12,column:cards.map((card) => {return {html:card}})}
      }
      return {
        style:{background:'#eee',opacity:0.5},
        flex:1,align:'vh',
        column:[
            {html:<img src={noItemSrc} alt='' width='128' height='128'/>},
            {html:'سبد خرید شما خالی است',style:{color:'#858a95'}},
            {size:60}
        ]
      }
    }
    payment_layout(){
      if(!this.tab){return false}
      if(this.tab.id === 'forooshe_vije'){return this.foroosheVije_payment_layout()}
      if(this.tab.id === 'belex'){return this.belex_payment_layout()}
      let total = this.tab.factorDetails.DocumentTotal;
      return {
        size: 72,className: "bgFFF p-h-12 theme-box-shadow",
        row: [
          {
            flex: 1,
            column: [
              { flex: 1 },
              {align: "v",html: "مبلغ قابل پرداخت",className: "theme-medium-font-color fs-12"},
              {size:3},
              {
                row:[
                  {align: "v",html: this.splitPrice(total),className: "theme-dark-font-color fs-14 bold"},
                  {size:4},
                  {align: "v",html: " ریال",className: "theme-dark-font-color fs-12"}
                ]
              },
              { flex: 1 },
            ],
          },
          {html: <button onClick={()=>this.continue()} className="button-2" style={{height:36}}>ادامه فرایند خرید</button>,align: "v"},
        ],
      }
    }
    foroosheVije_payment_layout(){
      let total = this.tab.finalPrice;
      return {
        size: 72,className: "bgFFF p-h-12 theme-box-shadow",
        row: [
          {
            flex: 1,
            column: [
              { flex: 1 },
              {align: "v",html: "مبلغ قابل پرداخت",className: "theme-medium-font-color fs-12"},
              {size:3},
              {
                row:[
                  {align: "v",html: this.splitPrice(total),className: "theme-dark-font-color fs-14 bold"},
                  {size:4},
                  {align: "v",html: " ریال",className: "theme-dark-font-color fs-12"}
                ]
              },
              { flex: 1 },
            ],
          },
          {html: <button onClick={()=>this.continue()} className="button-2" style={{height:36}}>ادامه فرایند خرید</button>,align: "v"},
        ],
      }
    }
    belex_payment_layout(){
      let total = this.tab.finalPrice;
      return {
        size: 72,className: "bgFFF p-h-12 theme-box-shadow",
        row: [
          {
            flex: 1,
            column: [
              { flex: 1 },
              {align: "v",html: "مبلغ قابل پرداخت",className: "theme-medium-font-color fs-12"},
              {size:3},
              {
                row:[
                  {align: "v",html: this.splitPrice(total),className: "theme-dark-font-color fs-14 bold"},
                  {size:4},
                  {align: "v",html: " ریال",className: "theme-dark-font-color fs-12"}
                ]
              },
              { flex: 1 },
            ],
          },
          {html: <button onClick={()=>this.continue()} className="button-2" style={{height:36}}>ادامه فرایند خرید</button>,align: "v"},
        ],
      }
    }
    nv3Report_layout(){
      if(!this.tab){return false}
      if(this.tab.id !== 'نورواره 3'){return false}
      return {
          html:<NV3Report amount={this.tab.factorDetails.DocumentTotal/10000000}/>
      }
    }
    continue(){
      let {openPopup} = this.context;
      openPopup('shipping',{...this.tab})
    }
    render(){
        this.getDetails();
        return (
            <RVD 
              layout={{
                flex: 1,className:'theme-popup-bg',
                column: [this.tabs_layout(),this.products_layout(),this.nv3Report_layout(),this.payment_layout()]
              }}
            />
        )
    }
  }
  