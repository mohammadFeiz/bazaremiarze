import React,{Component} from 'react';
import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
import AIOButton from './../../../interfaces/aio-button/aio-button';
import appContext from './../../../app-context';
export default class Shipping extends Component{
    static contextType = appContext;
    constructor(props){
      super(props);
      this.state = {
        name:'',code:'',campaign:'',basePrice:'',customerGroup:'',address:'',phone:'',
        PayDueDate:1,
        PayDueDate_options:[
          {text:'نقد',value:1},//ByDelivery
          {value:15,text:'25% نقد و 75% چک دو ماهه'},//'Cash25_TowMonth75'
          {text:'50% نقد و چک سه ماهه',value:16},//'Cach50_ThreeMonth50'
        ],
        PaymentTime:'ByOnlineOrder',
        PaymentTime_options:[
          {value:'ByOnlineOrder',text:'اینترنتی',map:5},
          {value:'ByOrder',text:'واریز قبل ارسال',map:1},
          {value:'ByDelivery',text:'واریز پای بار',map:2},
        ],
        SettleType:'ByDelivery',
        SettleType_options:[
          {value:'ByDelivery',text:'نقد'},
          {value:'Cheque',text:'چک'}
        ],
        SettleType_map:{
          ByDelivery:1,
          Cheque:2,
        },
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
        }
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
    async componentDidMount(){
      let {userInfo,shipping} = this.context;
      this.setState({
        campaign:shipping.cartId,
        //name:userInfo.cardName,
        name:`${userInfo.firstName} ${userInfo.lastName}`,
        code:userInfo.cardCode,
        address:userInfo.address,
        phone:userInfo.phone1,
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
                onChange={(value)=>this.setState({[key]:value})}
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
      let {productCards} = shipping;
      return {
        column:[
          {size:36,align:'v',className:'theme-medium-font-color fs-14 bold p-h-12',html:'محصولات'},
          {className:'of-visible',column:cards.map((card)=>{return {html:productCards,className:'of-visible'}})},
          {size:12}
        ]
      }
    }
    fix(value){
      try{return +value.toFixed(0)}
      catch{return 0}
    }
    payment_layout(){
      let {shipping} = this.context;
      let {payment_layout} = shipping;
      let {
        address,
        PayDueDate,
        SettleType_map,SettleType,
        DeliveryType_map,DeliveryType,
        PaymentTime,
      } = this.state;
      SettleType = SettleType_map[SettleType];
      DeliveryType = DeliveryType_map[DeliveryType];
      return payment_layout({address,PayDueDate,SettleType,DeliveryType,PaymentTime});
    }
    render(){
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
                  this.details_layout([['نام مشتری',name],['نام کمپین',campaign],['کد مشتری',code],['گروه مشتری',customerGroup]]),
                  {size:12},
                  this.address_layout(),
                  {size:12},
                  this.phone_layout(),
                  {size:12},
                  this.options_layout('DeliveryType','نحوه ارسال'),
                  {size:12},
                  this.options_layout('PaymentTime','زمان پرداخت',),
                  {size:12},
                  this.options_layout('PayDueDate','مهلت تسویه',PaymentTime.value !== 'ByOnlineOrder'),
                  {size:12},
                  this.products_layout(),
                  {size:12},
                ],
              },
              this.payment_layout(),
            ]
          }}
        />
        </>
      )
    }
  }



  