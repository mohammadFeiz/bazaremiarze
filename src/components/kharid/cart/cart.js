import React,{Component} from 'react';
import appContext from './../../../app-context';
import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
import AIOButton from '../../../interfaces/aio-button/aio-button';
import noItemSrc from './../../../images/not-found.png';
import NV3Report from '../nv3-report';
export default class Cart extends Component{
    static contextType = appContext;
    constructor(props){
      super(props);
      this.state = {activeTabId:false,continued:false}
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
    tabs_layout(){
      let {cart} = this.context;
      let options = Object.keys(cart)
      let {activeTabId} = this.state;
      return {
        html:(
          <AIOButton 
            type='tabs' 
            options={options}  
            optionStyle={{flex:options.length <= 3?1:undefined}}
            style={{marginBottom:12}}
            value={activeTabId} 
            optionAfter={(option)=><div className='tab-badge'>{Object.keys(cart[option].items)}</div>}
            optionText='option'
            optionValue='option'
            onChange={(activeTabId)=>this.setState({activeTabId})}
          />
        )
      }
    }
    products_layout(){
      let {activeTabId} = this.state;
      if(!activeTabId){
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
      let {cart} = this.context;
      let tab = cart[activeTabId];
      let {getProductCards} = tab;
      return {flex: 1,className:'ofy-auto',gap:12,column:getProductCards('cart').map((card) => {return {html:card}})}
      
      
    }
    payment_layout(){
      let {cart} = this.context;
      let {activeTabId} = this.state;
      if(!activeTabId){return false}
      if(activeTabId === 'فروش ویژه'){return this.foroosheVije_payment_layout()}
      if(activeTabId === 'بلکس'){return this.belex_payment_layout()}
      let cartTab = cart[activeTabId];
      let total = cartTab.getAmounts().total;
      let {continued} = this.state;
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
          {html: <button disabled={continued} onClick={()=>this.continue()} className="button-2" style={{height:36}}>ادامه فرایند خرید</button>,align: "v"},
        ],
      }
    }
    foroosheVije_payment_layout(){
      let {cart} = this.context;
      let {activeTabId} = this.state;
      if(!activeTabId){return false}
      let cartTab = cart[activeTabId];
      let {total} = cartTab.getAmounts()
      let {continued} = this.state;
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
          {html: <button disabled={continued} onClick={()=>this.continue()} className="button-2" style={{height:36}}>ادامه فرایند خرید</button>,align: "v"},
        ],
      }
    }
    belex_payment_layout(){
      let {cart} = this.context;
      let {activeTabId} = this.state;
      if(!activeTabId){return false}
      let cartTab = cart[activeTabId];
      let {total} = cartTab.getAmounts()
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
      let {activeTabId} = this.state;
      if(!activeTabId){return false}
      if(activeTabId !== 'نورواره 3'){return false}
      let {cart} = this.context;
      let cartTab = cart[activeTabId];
      let {total} = cartTab.getAmounts()
      
      return {
          html:<NV3Report amount={total/10000000}/>
      }
    }
    continue(){
      let {openPopup} = this.context;
      let {activeTabId} = this.state;
      openPopup('shipping',activeTabId)
    }
    render(){
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
  