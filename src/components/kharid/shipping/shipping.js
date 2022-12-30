import React,{Component} from 'react';
import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
import functions from './../../../functions';
import AIOButton from './../../../interfaces/aio-button/aio-button';
import appContext from './../../../app-context';
export default class Shipping extends Component{
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
          {value:'By15Days',text:'چک 15 روزه'},
          {value:'ByMonth',text:'چک 30 روزه'},
          {value:'By45Days',text:'چک 45 روزه'},
          {value:'By60Days',text:'چک 60 روزه'},
        ],
        PayDueDate_map:{
          ByDelivery:1, // نقد --->*
          By15Days:2, // *
          ByMonth:3,// *
          By45Days:4, // *
          NotSet:5,
          By60Days:6,//*
          By75Days:7,
          By3Months:8,
          By3_5Months:9,
          By4Months:10,
          By4_5Months:11,
          By5Months:12,
          By5_5Months:13,
          By6Months:14,
        },
        PaymentTime:'ByOnlineOrder',
        PaymentTime_options:[
          {value:'ByOnlineOrder',text:'اینترنتی'},
          {value:'ByOrder',text:'واریز قبل ارسال - نقد'},
          {value:'ByDelivery',text:'واریز پای بار - نقد'},
        ],
        PaymentTime_map:{
            ByOrder:1,
            ByDelivery:2,
            ByGuarantee:3,
            ByCredit:4,
            ByOnlineOrder:5,
            NotSet:6
        },
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
    details_layout(){
      let {name,code,campaign,basePrice,customerGroup} = this.state;
      return {
        className:'box padding-12 margin-0-12',
        column:[
          {
            size:36,childsProps:{align:'v'},
            row:[
              {html:'نام مشتری:',className:'colorA19F9D size14'},
              {html:name,className:'size14'},
              {flex:1},
              {html:'نام کمپین:',className:'colorA19F9D size14'},
              {html:campaign,className:'size14'}
            ]
          },
          {
            size:36,childsProps:{align:'v'},
            row:[
              {html:'کد مشتری:',className:'colorA19F9D size14'},
              {html:code,className:'size14'},
              {flex:1},
              {html:'گروه مشتری:',className:'colorA19F9D size14'},
              {html:customerGroup,className:'size14'},
            ]
          },
          
        ]
      }
    }
    async componentDidMount(){
      let {userInfo,shipping} = this.context;
      this.setState({
        campaign:shipping.title,
        name:userInfo.cardName,
        code:userInfo.cardCode,
        address:userInfo.address,
        phone:userInfo.phone1,
        customerGroup:userInfo.groupName
      })
    }
    address_layout(){
      let {address} = this.state;
      return {
        className:'box padding-12 margin-0-12',
        column:[
          {size:36,align:'v',className:'color605E5C size12 bold',html:'آدرس تحویل'},
          {
            className:'size14 color575756 bgF1F1F1 padding-12 round-6',html:address,size:72
          }
        ]
      }
    }

    options_layout(key,title,cond = true){
      let options = this.state[key + '_options']
      let value = this.state[key];
      if(!cond){return false}
      return {
        className:'box padding-12 margin-0-12',
        column:[
          {size:36,align:'v',className:'color605E5C size12 bold',html:title},
          {
            html:(
              <AIOButton
                type='radio'
                optionStyle='{width:"100%"}'
                options={options}
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
        className:'box padding-12 margin-0-12',
        column:[
          {size:36,align:'v',className:'color605E5C size12 bold',html:'شماره تلفن'},
          {
            className:'size14 color575756 bgF1F1F1 padding-12 round-6',html:phone,style:{minHeight:36}
          }
        ]
      }
    }
    products_layout(){
      let {shipping} = this.context;
      let {cards} = shipping;
      return {
        styke:{overflow:'visible'},
        column:[
          {size:36,align:'v',className:'color605E5C size14 bold padding-0-12',html:'محصولات'},
          {
            style:{overflow:'visible'},column:cards.map((card)=>{return {html:card,style:{overflow:'visible'}}})
          },
          {size:12}
        ]
      }
    }
    fix(value){
      try{return +value.toFixed(0)}
      catch{return 0}
    }
    amount_layout(){
      let {getFactorDetails,shipping} = this.context;
      let {address} = this.state;
      let {onSend} = this.props;
      
      let {
        PayDueDate_map,PayDueDate,
        SettleType_map,SettleType,
        DeliveryType_map,DeliveryType,
        PaymentTime_map,PaymentTime,
      } = this.state;
      PayDueDate = PayDueDate_map[PayDueDate];
      SettleType = SettleType_map[SettleType];
      DeliveryType = DeliveryType_map[DeliveryType];
      PaymentTime = PaymentTime_map[PaymentTime];
      let factorDetails = getFactorDetails(shipping.items,{PayDueDate,PaymentTime,SettleType,DeliveryType})
      let discount = factorDetails.marketingdetails.DocumentDiscount;
      let darsade_takhfife_pardakhte_online = factorDetails.marketingdetails.DocumentDiscountPercent
      let mablaghe_ghabele_pardakht = factorDetails.DocumentTotal;
      let mablaghe_takhfife_pardakhte_online = (mablaghe_ghabele_pardakht * darsade_takhfife_pardakhte_online) / 100;
      mablaghe_ghabele_pardakht = mablaghe_ghabele_pardakht - mablaghe_takhfife_pardakhte_online;
      
      return {
        className:'padding-0-12 bgFFF box-shadow-up',
        style:{paddingTop:12,borderRadius:'16px 16px 0 0'},
        column:[
          {
            size:28,childsProps:{align:'v'},
            row:[
              {html:'تخفیف:',className:'colorFDB913 size14'},
              {flex:1},
              {html:functions.splitPrice(discount) + ' ریال',className:'colorFDB913 size14'}
            ]
          },
          {
            size:28,childsProps:{align:'v'},
            row:[
              {html:'تخفیف نحوه پرداخت:',className:'color00B5A5 size14'},
              {flex:1},
              {html:`(${darsade_takhfife_pardakhte_online} %)`,className:'color00B5A5 size14'},
              {size:6},
              {html:functions.splitPrice(this.fix(mablaghe_takhfife_pardakhte_online)) + ' ریال',className:'color00B5A5 size14'},
            ]
          },
          {
            size:28,childsProps:{align:'v'},
            row:[
              {html:'قیمت کالاها:',className:'color605E5C size14'},
              {flex:1},
              {html:functions.splitPrice(this.fix(mablaghe_ghabele_pardakht + discount + mablaghe_takhfife_pardakhte_online)) + ' ریال',className:'color605E5C size14'}
            ]
          },
          {
            size:28,childsProps:{align:'v'},
            row:[
              {html:'مبلغ قابل پرداخت:',className:'color323130 bold size16'},
              {flex:1},
              {html:functions.splitPrice(this.fix(mablaghe_ghabele_pardakht)) + ' ریال',className:'color323130 bold size16'}
            ]
          },
          {size:6},
          {
            size:36,align:'vh',className:'color605E5C size14 bold',
            html:(
              <button 
                className="button-2" 
                onClick={()=>onSend({address,SettleType,PaymentTime,DeliveryType,PayDueDate})}
              >ارسال برای ویزیتور</button>
            )
          },
          {size:12}
        ]
      }
    }
    render(){
      let {PaymentTime} = this.state;
      return (
        <>
          <RVD
          layout={{
            className:'popup-bg',
            flex:1,
            column:[
              {
                flex:1,scroll:'v',
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
                  this.options_layout('PaymentTime','زمان پرداخت',),
                  // {size:12},
                  // this.options_layout('PayDueDate','مهلت تسویه',PaymentTime !== 'ByOnlineOrder'),
                  {size:12},
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

  