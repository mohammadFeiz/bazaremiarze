import React,{Component} from 'react';
import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
import AIOButton from './../../../interfaces/aio-button/aio-button';
import appContext from './../../../app-context';
import NV3Report from '../nv3-report';

export default class Shipping extends Component{
    static contextType = appContext;
    constructor(props){
      super(props);
      this.state = {}
    }
    
    details_layout(list){
      return {
        className:'box p-12 m-h-12',
        column:list.map(({key,value,className = 'theme-medium-font-color fs-14'})=>{
          return {
            size:36,childsProps:{align:'v'},
            row:[
              {html:key + ':',className},
              {flex:1},
              {html:value,className} 
            ]
          }
        })
      }
    }
    async componentDidMount(){
      let {userInfo,backOffice} = this.context;
      let {cartId} = this.props;
      let {defaultShipping} = backOffice.tarhHa[cartId];
      let {PayDueDate,PaymentTime,DeliveryType,SettleType,
        PayDueDateOptions = [],PaymentTimeOptions = [],SettleTypeOptions = [],DeliveryTypeOptions = []
      } = defaultShipping;
      debugger;
      let PayDueDate_options = backOffice.PayDueDate_options.filter(({value})=>PayDueDateOptions.indexOf(value) !== -1);
      let PaymentTime_options = backOffice.PaymentTime_options.filter(({value})=>PaymentTimeOptions.indexOf(value) !== -1);
      let SettleType_options = backOffice.SettleType_options.filter(({value})=>SettleTypeOptions.indexOf(value) !== -1);
      let DeliveryType_options = backOffice.DeliveryType_options.filter(({value})=>DeliveryTypeOptions.indexOf(value) !== -1)
      this.mounted = true;
      this.setState({
        PayDueDate,PaymentTime,DeliveryType,SettleType,
        PayDueDate_options,PaymentTime_options,SettleType_options,DeliveryType_options,
        campaign:cartId,
        name:`${userInfo.firstName} ${userInfo.lastName}`,
        code:userInfo.cardCode,
        address:userInfo.address,
        phone:userInfo.phoneNumber,
        customerGroup:userInfo.groupName
      })
    }
    address_layout(){
      let {address} = this.state;
      return {
        className:'box p-12 m-h-12',
        column:[
          {size:36,align:'v',className:'theme-medium-font-color fs-12 bold',html:'آدرس تحویل'},
          {
            className:'fs-14 theme-medium-font-color bgF1F1F1 p-12 br-4',html:address,size:72
          }
        ]
      }
    }

    options_layout(key,title,cond = true){
      //if(key === 'SettleType'){debugger;}
      if(key === 'PaymentTime'){debugger}
      let options = this.state[key + '_options']
      let value = this.state[key];
      if(!cond || value === undefined){return false}
      return {
        className:'box p-12 m-h-12',
        column:[
          {size:36,align:'v',className:'theme-medium-font-color fs-12 bold',html:title},
          {
            html:(
              <AIOButton
                key={key}
                className='shipping-options fs-14'
                type='radio'
                optionAfter={(option)=>{
                  if(option.percent){return `${option.percent}% تخفیف`}
                }}
                options={options}
                optionClassName='"w-100 h-36"'
                value={value}
                onChange={(newValue)=>{
                  this.setState({[key]:newValue})
                }}
              />
            )
          }
        ]
      }
    }
    phone_layout(){
      let {phone} = this.state;
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
    products_layout(){
      let {cart} = this.context;
      let {cartId} = this.props;
      let cards = cart[cartId].getProductCards('shipping',{...this.state});
      return {
        column:[
          {size:36,align:'v',className:'theme-medium-font-color fs-14 bold p-h-12',html:'محصولات'},
          {className:'of-visible',column:cards.map((card)=>{return {html:card,className:'of-visible'}})},
          {size:12}
        ]
      }
    }
    fix(value){
      try{return +value.toFixed(0)}
      catch{return 0}
    }
    nv3Report_layout(){
      let {cart} = this.context;
      let {cartId} = this.props;
      if(cartId !== 'نورواره 3'){return false}
      let amount = cart[cartId].getAmounts().total;
      return {
        html:<NV3Report amount={amount} renderIn='shipping'/>
      }
    }
    amount_layout(){
      let {cart,userInfo,openPopup,removeCart} = this.context;
      let {address} = this.state;
      let {cartId} = this.props;
      let {PayDueDate,SettleType,DeliveryType,PaymentTime} = this.state;
      let cartTab = cart[cartId]
      let {getFactorItems,paymentButtonText} = cartTab;
      let factorItems = getFactorItems({PayDueDate,SettleType,DeliveryType,PaymentTime,address})
      let qr = cartId === 'نورواره 3'?userInfo.norvareh3QR:undefined
      return {
        className:'p-h-12 bg-fff theme-box-shadow',
        style:{paddingTop:12,borderRadius:'16px 16px 0 0'},
        column:[
          this.details_layout(factorItems),
          {size:6},
          {
            size:36,align:'vh',className:'theme-medium-font-color fs-14 bold',
            html:(
              <button 
                className="button-2" 
                onClick={async ()=>{
                  let {kharidApis,rsa_actions,cart} = this.context;
                  let {PayDueDate,SettleType,DeliveryType,PaymentTime,address} = this.state;
                  let {cartId} = this.props;
                  let cartTab = cart[cartId];
                  let {getAmounts} = cartTab;
                  let res = await kharidApis({
                    api:"shippingPayment",
                    name:()=>'پرداخت' + cartId,
                    parameter:{
                      address,
                      SettleType,
                      PaymentTime,
                      DeliveryType,
                      PayDueDate,
                      cartId,
                      amounts:getAmounts({PayDueDate,SettleType,DeliveryType,PaymentTime,address})
                    },
                  })

                  if(typeof res === 'object'){
                    let {orderNumber} = res;
                    rsa_actions.removePopup('all');
                    removeCart(cartId)
                    openPopup('sefareshe-ersal-shode-baraye-vizitor',{orderNumber,qr})
                  }
                }}
              >{paymentButtonText({PayDueDate,SettleType,DeliveryType,PaymentTime,address})}</button>
            )
          },
          {size:12}
        ]
      }
    }
    render(){
      if(!this.mounted){return null}
      let {PaymentTime} = this.state;
      let {name,code,campaign,customerGroup} = this.state;
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
                  this.details_layout([{key:'نام مشتری',value:name},{key:'نام کمپین',value:campaign},{key:'کد مشتری',value:code},{key:'گروه مشتری',value:customerGroup}]),
                  {size:12},
                  this.address_layout(),
                  {size:12},
                  this.phone_layout(),
                  {size:12},
                  this.options_layout('DeliveryType','نحوه ارسال'),
                  {size:12},
                  this.options_layout('PaymentTime','زمان پرداخت',),
                  {size:12},
                  this.options_layout('PayDueDate','مهلت تسویه',PaymentTime !== 5),
                  {size:12},
                  this.options_layout('SettleType','نحوه پرداخت'),
                  {size:12},
                  this.products_layout(),
                  {size:12},
                  this.nv3Report_layout()
                ],
              },
              this.amount_layout(),
            ]
          }}
        />
        </>
      )
    }
  }  