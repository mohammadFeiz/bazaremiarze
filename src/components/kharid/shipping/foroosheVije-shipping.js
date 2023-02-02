import React,{Component} from 'react';
  import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
  import functions from './../../../functions';
  import AIOButton from './../../../interfaces/aio-button/aio-button';
  import appContext from './../../../app-context';
  export default class ForoosheVijeShipping extends Component{
    static contextType = appContext;
    constructor(props){
      super(props);
      this.state = {
        name:'',code:'',campaign:'',basePrice:'',customerGroup:'',address:'',phone:'',
        PayDueDate:1,
        PayDueDate_options:[
          {value:1,text:'نقد (12% تخفیف بیشتر)'},//'ByDelivery'
          {value:17,text:'20% نقد و 80% چک سه ماهه (4.8% تخفیف بیشتر)'},//'Cash20_ThreeMonth80'
          {value:18,text:'30% نقد و 70% چک چهار ماهه (3.6% تخفیف بیشتر)'},//'Cash30_FourMonth70'
          {value:19,text:'50% نقد و 50% چک پنج ماهه (4.5% تخفیف بیشتر)'},//'Cash50_FiveMonth50'
          {value:20,text:'50% نقد و 50% چک یک ماهه (10.5% تخفیف بیشتر)',show:false}//'Cash50_OneMonth50'
          
        ],
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
        SettleType:'Online',
        SettleType_options:[
          {value:'Pos',text:'دستگاه پوز'},
          {value:'Online',text:'آنلاین'},
        ],
        SettleType_map:{
          Pos:8,
          Online:16,
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
      let hasCable = false;
      try{
        for(let i = 0; i < shipping.cartItems.length; i++){
          let product = shipping.cartItems[i].product;
          if(product.cableCategory){
            hasCable = true;
            break;
          }
        }
        if(hasCable){this.state.PayDueDate_options[4].show = true}
      }
      catch{
        debugger;
      }
      this.setState({
        hasCable,
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
                  this.options_layout('PayDueDate','نحوه پرداخت'),
                  {size:12},
                  this.options_layout('SettleType','نحوه پرداخت نقد'),
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

  