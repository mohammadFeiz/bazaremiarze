import React,{Component} from 'react';
  import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
  import functions from './../../../functions';
  import AIOButton from './../../../interfaces/aio-button/aio-button';
  import appContext from './../../../app-context';
  export default class BelexShipping extends Component{
    static contextType = appContext;
    constructor(props){
      super(props);
      this.state = {
        name:'',
        code:'',
        campaign:'فروش ویژه 10 وات',
        basePrice:'',
        customerGroup:'الکتریکی',
        address:'',
        phone:'09123534314',
        PayDueDate:'ByDelivery',
        PayDueDate_options:[
          {value:'ByDelivery',text:'نقد'},
          {value:'Cash20_ThreeMonth80',text:'20% نقد و 80% چک سه ماهه'},
          {value:'Cash30_FourMonth70',text:'30% نقد و 70% چک چهار ماهه'},
          {value:'Cash50_FiveMonth50',text:'50% نقد و 50% چک پنج ماهه'},
          
        ],
        PayDueDate_map:{
          ByDelivery:1,
          Cash20_ThreeMonth80:17,
          Cash30_FourMonth70:18,
          Cash50_FiveMonth50:19,
        },
        // PaymentTime:'ByOnlineOrder',
        // PaymentTime_options:[
        //   {value:'ByOnlineOrder',text:'اینترنتی'},
        //   {value:'ByPos',text:'دستگاه پوز'}//////////////////////
        // ],
        // PaymentTime_map:{
        //     ByOnlineOrder:5,
        //     ByPos:6/////////////////////////////
        // },
        DeliveryType:'BRXDistribution',
        DeliveryType_options:[
          {value:'BRXDistribution',text:'ماشین توزیع بروکس'},
          {value:'RentalCar',text:'ماشین اجاره ای'},
          {value:'Cargo',text:'باربری'},
          {value:'BySalesMan',text:'ارسال توسط ویزیتور'}
        ],
        DeliveryType_map: {
          BRXDistribution:11,//پخش بروکس--->*
          RentalCar:12,//ماشین اجازه‌ای
          Cargo:13,//باربری --->*
          HotDelivery:14,//پخش گرم
          BySalesMan:15,//پخش توسط ویزیتور
          NotSet:16,
        },
        SettleType:'ByDelivery',
        SettleType_options:[
          {value:'Cash',text:'نقد'},
          {value:'Cheque',text:'چک'},
          {value:'Pos',text:'دستگاه پوز'},
          {value:'Online',text:'آنلاین'},
          {value:'Card',text:'کارت به کارت'},
          {value:'Pos_Cheque',text:'دستگاه پوز و چک'},
          {value:'Online_Cheque',text:'آنلاین و چک'},
          {value:'Card_Cheque',text:'کارت به کارت و چک'},
        ],
        SettleType_map:{
          Cash:1,
          Cheque:2,
          Pos:8,
          Online:16,
          Card:32,
          Pos_Cheque:10,
          Online_Cheque:18,
          Card_Cheque:34
        },
      }
    }
    details_layout(){
      let {name,code,campaign,customerGroup} = this.state;
      return {
        className:'box p-12 m-h-12',
        column:[
          {
            size:36,childsProps:{align:'v'},
            row:[
              {html:'نام مشتری:',className:'theme-light-font-color fs-14'},
              {html:name,className:'fs-14'},
              {flex:1},
              {html:'نام کمپین:',className:'theme-light-font-color fs-14'},
              {html:campaign,className:'fs-14'}
            ]
          },
          {
            size:36,childsProps:{align:'v'},
            row:[
              {html:'کد مشتری:',className:'theme-light-font-color fs-14'},
              {html:code,className:'fs-14'},
              {flex:1},
              {html:'گروه مشتری:',className:'theme-light-font-color fs-14'},
              {html:customerGroup,className:'fs-14'},
            ]
          },
          
        ]
      }
    }
    async componentDidMount(){
      let {userInfo,shipping} = this.context;
      this.setState({
        campaign:shipping.title,
        //name:userInfo.cardName,
        name:`${userInfo.firstName} ${userInfo.lastName}`,
        code:userInfo.cardCode,
        address:userInfo.address,
        phone:userInfo.phone1,
        customerGroup:userInfo.groupName,
        finalPrice:shipping.finalPrice
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
      let options = this.state[key + '_options']
      let value = this.state[key];
      if(!cond){return false}
      return {
        className:'box p-12 m-h-12',
        column:[
          {size:36,align:'v',className:'theme-medium-font-color fs-12 bold',html:title},
          {
            html:(
              <AIOButton
                type='radio'
                options={options}
                optionClassName='"w-100 h-36"'
                value={value}
                onChange={(newValue)=>this.setState({[key]:newValue})}
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
      let {shipping} = this.context;
      let {cards} = shipping;
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
    amount_layout(){
      let {address,finalPrice} = this.state;
      let {kharidApis} = this.context;
      
      let {
        PayDueDate_map,PayDueDate,
        SettleType_map,SettleType,
        DeliveryType_map,DeliveryType,
        //PaymentTime_map,PaymentTime,
      } = this.state;
      PayDueDate = PayDueDate_map[PayDueDate];
      DeliveryType = DeliveryType_map[DeliveryType];
      SettleType = SettleType_map[SettleType]
      //PaymentTime = PaymentTime_map[PaymentTime];
      
      return {
        className:'p-h-12 bg-fff theme-box-shadow',
        style:{paddingTop:12,borderRadius:'16px 16px 0 0'},
        column:[
          {
            size:28,childsProps:{align:'v'},
            row:[
              {html:'مبلغ قابل پرداخت:',className:'theme-dark-font-color bold fs-16'},
              {flex:1},
              {html:functions.splitPrice(this.fix(finalPrice)) + ' ریال',className:'theme-dark-font-color bold fs-16'}
            ]
          },
          {size:6},
          {
            size:36,align:'vh',className:'theme-medium-font-color fs-14 bold',
            html:(
              <button 
                className="button-2" 
                onClick={()=>{
                  this.onSubmit({
                    address,
                    //PaymentTime,
                    SettleType,
                    DeliveryType,
                    PayDueDate
                  })
                }}
              >{SettleType === 'Online' || SettleType === 'Online_Cheque'?'پرداخت':'ثبت'}</button>
            )
          },
          {size:12}
        ]
      }
    }
    async onSubmit({
        address,
        //PaymentTime,
        SettleType,
        DeliveryType,
        PayDueDate
      }){
      let {shipping,kharidApis,cart,rsa_actions,changeCart} = this.context;
      let {cartItems} = shipping;
      let orderNumber = await kharidApis({
        api:SettleType === 'Online' || SettleType === 'Online_Cheque'?"pardakhte_belex":'sabte_belex',
        parameter:{
          address,
          //PaymentTime,
          SettleType,
          DeliveryType,
          PayDueDate
        }
      })
      if(orderNumber){
        let variantIds = cartItems.map((o)=>o.variantId)
        let newCart = {};
        for(let prop in cart){
          if(variantIds.indexOf(prop) === -1){
            newCart[prop] = cart[prop]
          }
        }
        rsa_actions.removePopup('all');
        changeCart(newCart)
        // this.openPopup('sefareshe-ersal-shode-baraye-vizitor',orderNumber)
      }
    }
    render(){
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
                  this.details_layout(),
                  {size:12},
                  this.address_layout(),
                  {size:12},
                  this.phone_layout(),
                  {size:12},
                  this.options_layout('DeliveryType','نحوه ارسال'),
                  {size:12},
                  this.options_layout('PayDueDate','مهلت تسویه'),
                  {size:12},
                  this.options_layout('SettleType','نحوه پرداخت'),
                  {size:12},
                  // this.options_layout('PaymentTime','زمان پرداخت',),
                  // {size:12},
                  this.products_layout(),
                  {size:12},
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

  