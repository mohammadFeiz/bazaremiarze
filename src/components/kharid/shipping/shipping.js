import React,{Component} from 'react';
import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
import functions from './../../../functions';
import AIOButton from './../../../interfaces/aio-button/aio-button';
import appContext from './../../../app-context';
import { mdiCash, mdiLamp, mdiLightbulbOutline } from "@mdi/js";
import Icon from "@mdi/react";
import NV3Report from '../nv3-report';

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
        PayDueDate:1,
        PayDueDate_options:[
          {value:1,text:'نقد'},//ByDelivery
          {value:15,text:'25% نقد و 75% چک دو ماهه',after:'4/5% تخفیف'},//Cash25_TowMonth75
          {value:16,text:'50% نقد و 50% چک سه ماهه',after:'4/5% تخفیف'},//Cach50_ThreeMonth50
          {value:17,text:'20% نقد و 80% چک سه ماهه',after:'4/8% تخفیف'},//Cash20_ThreeMonth80
          {value:18,text:'30% نقد و 70% چک چهار ماهه',after:'3/6% تخفیف'},//Cash30_FourMonth70
          {value:19,text:'50% نقد و 50% چک پنج ماهه',after:'4/5% تخفیف'},//Cash50_FiveMonth50
        
          
        ],
        PaymentTime:5,
        PaymentTime_options:[
          {value:5,text:'اینترنتی'},//ByOnlineOrder
          {value:1,text:'واریز قبل ارسال'},//ByOrder
          {value:2,text:'واریز پای بار'},//ByDelivery
        ],
        SettleType:'ByDelivery',
        SettleType_options:[
          {value:1,text:'نقد'},//ByDelivery
          {value:2,text:'چک'}//Cheque
        ],
        DeliveryType:11,
        DeliveryType_options:[
          {value:11,text:'ماشین توزیع بروکس'},//BRXDistribution
          {value:12,text:'ماشین اجاره ای'},//RentalCar
          {value:13,text:'باربری'},//Cargo
          {value:15,text:'ارسال توسط ویزیتور'}//BySalesMan
        ]
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
        campaign:shipping.title,
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
    nv3Report_layout(){
      let {shipping} = this.context;
      if(shipping.id !== 'نورواره 3'){return false}
      let amount = shipping.factorDetails.DocumentTotal;
      amount = amount / 10000000
      return {
        html:<NV3Report amount={amount} renderIn='shipping'/>
      }
    }
    amount_layout(){
      let {getFactorDetails,shipping} = this.context;
      let {address} = this.state;
      let {onSend} = this.props;
      
      let {
        PayDueDate,
        SettleType,
        DeliveryType,
        PaymentTime,
      } = this.state;
      let factorDetails = getFactorDetails(shipping.items,{PayDueDate,PaymentTime,SettleType,DeliveryType})
      let discount = factorDetails.marketingdetails.DocumentDiscount;
      let darsade_takhfife_pardakhte_online = factorDetails.marketingdetails.DocumentDiscountPercent
      let mablaghe_ghabele_pardakht = factorDetails.DocumentTotal;
      let mablaghe_takhfife_pardakhte_online = (mablaghe_ghabele_pardakht * darsade_takhfife_pardakhte_online) / 100;
      mablaghe_ghabele_pardakht = mablaghe_ghabele_pardakht - mablaghe_takhfife_pardakhte_online;
      return {
        className:'p-h-12 bg-fff theme-box-shadow',
        style:{paddingTop:12,borderRadius:'16px 16px 0 0'},
        column:[
          this.details_layout([
            [
              'تخفیف',
              functions.splitPrice(discount) + ' ریال',
              {className:'colorFDB913 fs-14'}
            ],
            [
              'تخفیف نحوه پرداخت',
              `${functions.splitPrice(this.fix(mablaghe_takhfife_pardakhte_online)) + ' ریال'} (${darsade_takhfife_pardakhte_online} %)`,
              {className:'color00B5A5 fs-14'}
            ],
            [
              'قیمت کالاها',
              functions.splitPrice(this.fix(mablaghe_ghabele_pardakht + discount + mablaghe_takhfife_pardakhte_online)) + ' ریال',
              {className:'theme-medium-font-color fs-14'}
            ],
            [
              'مبلغ قابل پرداخت',
              functions.splitPrice(this.fix(mablaghe_ghabele_pardakht)) + ' ریال',
              {className:'theme-dark-font-color bold fs-16'}
            ]
          ]),
          {size:6},
          {
            size:36,align:'vh',className:'theme-medium-font-color fs-14 bold',
            html:(
              <button 
                className="button-2" 
                onClick={()=>onSend({address,SettleType,PaymentTime,DeliveryType,PayDueDate},shipping.id,factorDetails)}
              >ارسال برای ویزیتور</button>
            )
          },
          {size:12}
        ]
      }
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
                  this.options_layout('PayDueDate','مهلت تسویه',PaymentTime !== 5),
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



  