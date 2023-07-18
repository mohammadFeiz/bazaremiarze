import React, { Component } from "react";
import RVD from "./../../../interfaces/react-virtual-dom/react-virtual-dom";
import appContext from "./../../../app-context";
import SplitNumber from "../../../npm/aio-functions/split-number";
import NoSrc from './../../../images/no-src.png';
// code:25965
// date:"1401/11/24"
// docStatus:"CustomerApproved"
// mainDocNum:25679
// mainDocType:"Quotation"
// mainDocisDraft:false
// total:1584660
// translate:"در حال بررسی"
// _time:"00:00:00"
export default class OrderPopup extends Component {
    static contextType = appContext;
    state = {order:this.props.order}
    getRow(key, value = '-------------',show = true) {
      if(value === null){value = '-------------'}
      if(!show){return false}
      return {
        align: "v",
        row: [
          { size: 110, html: key + " : ", className: "fs-10 bold" },
          {flex:1},
          { html: value, className: "fs-12" },
        ],
      };
    }
    getStatus(status) {
      let statuses = [
        { title: "در حال پردازش", color: "#662D91", percent: 50 },
        { title: "مرسوله در مسیر فروشگاه است", color: "#108ABE", percent: 65 },
        { title: "تحویل شده", color: "#107C10", percent: 100 },
        { title: "لغو شده", color: "#A4262C", percent: 100 },
      ];
      let obj = statuses[status];
      if (!obj) {return null;}
      return {
        style: { padding: "0 24px" },className: "box",
        column: [
          { size: 16 },
          {size: 24,html: obj.title,style: { color: obj.color },className: "fs-14 bold"},
          {
            html: (
              <div style={{height: 12,display: "flex",width: "100%",borderRadius: 3,overflow: "hidden"}}>
                <div style={{ width: obj.percent + "%", background: obj.color }}></div>
                <div style={{ flex: 1, background: obj.color, opacity: 0.3 }}></div>
              </div>
            ),
          },
          { size: 16 },
        ],
      };
    }
    async componentDidMount(){
      await this.getDetails()  
    }
    async getDetails(){
      let {kharidApis} = this.context;
      let {order} = this.state;
      if(order.details){return}
      let newOrder = await kharidApis({
        api:'mahsoolate_sefareshe_kharid',parameter:order,loading:false,name:'دریافت محصولات سفارش خرید'
        //cacheName:'order-popup-' + order.mainDocNum,
        //cache:10000000
      })
      this.setState({order:newOrder})
    }
    async pardakht(){
      let {kharidApis} = this.context;
      let {order} = this.props;
      let res = await kharidApis({api:'pardakhte_kharid',parameter:{order},name:'پرداخت خرید عادی'})
    }
    splitter_layout(){
      return {
        html:'',style:{borderBottom:'1px solid #ccc'}
      }
    }
    details_layout(){
      let {userInfo} = this.context;
      let {order} = this.state;
      let {details = {}} = order;
      details.basePrice = details.basePrice || 0
      return {
        className: "box gap-no-color theme-gap-h p-12",gap: 12,
        column: [
          this.getRow("پیش فاکتور", order.mainDocNum),
          this.getRow("تاریخ ثبت", order.date),
          this.splitter_layout(),
          this.getRow("نام مشتری",details.customerName + " - " + details.customerCode),
          this.getRow("گروه مشتری", userInfo.groupName),
          this.getRow("نام کمپین", details.campaignName),
          this.getRow("قیمت پایه", SplitNumber(details.basePrice) + ' ریال'),
          this.getRow("نام ویزیتور", details.visitorName),
          this.getRow("کد ویزیتور", details.visitorCode),
          this.splitter_layout(),
          this.getRow("آدرس", details.address),
          this.getRow("تلفن همراه", details.mobile),
          this.getRow("تلفن ثابت", details.phone),
          this.splitter_layout(),
          this.getRow("نحوه ارسال", details.nahve_ersal),
          this.getRow("نحوه پرداخت", details.nahve_pardakht),
          this.getRow("مهلت تسویه", details.mohlate_tasvie,!!details.mohlate_tasvie),
          this.getRow("مبلغ پرداختی کل", SplitNumber(order.total) + ' ریال')
        ],
      }
    }
    dokmeye_pardakht_layout(){
      let {order} = this.state;
      let {docStatus} = order;
      let {details = {}} = order;
      let {nahve_pardakht} = details;
      if(docStatus !== 'WaitingForPayment' || nahve_pardakht !== 'اینترنتی'){return false}
      return {
        className:'p-12',
        html:(<button className="button-2" onClick={()=>this.pardakht()}>پرداخت</button>)
      }
    }
    products_layout(){
      let {order} = this.state;
      let {details = {}} = order;
      let {products} = details;
      let loading = false;
      if(!products){
        loading = true;
        products = fakeData;
      }
      return {
        gap: 2,className:'theme-gap-h of-visible',
        column: products.map((o, i) => {
          return {
            className:'of-visible',
            html:(
              <ProductCard loading={loading} {...o} index={i}
                isFirst={i === 0} isLast={i === products.length - 1}
              />
            )
          }
        })
      }
    }
    render() {
      return (
        <RVD
          layout={{
            className: "theme-popup-bg",
            column: [
              {className:'theme-vertical-gap'},
              {
                flex: 1,className: "ofy-auto",
                column: [
                  this.details_layout(),
                  {className:'theme-vertical-gap'},
                  this.products_layout(),
                ],
              },
              this.dokmeye_pardakht_layout()
            ],
          }}
        />
      );
    }
  }

  class ProductCard extends Component{
    getStyle(){
      let {isFirst,isLast} = this.props;
      return {
        padding:6,
        borderBottomLeftRadius:!isLast?0:undefined,
        borderBottomRightRadius:!isLast?0:undefined,
        borderTopLeftRadius:!isFirst?0:undefined,
        borderTopRightRadius:!isFirst?0:undefined
      }
    }
    image_layout(){
      let {src = NoSrc} = this.props;
      return {flex:1,html:<img src={src} width={'100%'} alt=''/>}
    }
    count_layout(){
      let {itemQty} = this.props;
      return {size:24,html:itemQty,align:'vh'}
    }
    campaign_layout(){
      let {campaign} = this.props;
      if(!campaign){return false}
      return {html:campaign.name,className:'fs-10',style:{color:'rgb(253, 185, 19)'}}
    }
    name_layout(){
      let {itemName} = this.props;
      return {html:itemName,className:'fs-12 theme-medium-font-color bold'}
    }
    details_layout(){
      let {details = []} = this.props;
      if(!details.length){return false}
      return {
        column:details.map((d)=>{
            return {size:20,align:'v',html:`${d[0]} : ${d[1]}`,className:'fs-10 theme-light-font-color'}
        })
      }
    }
    discount_layout(){
      let {discountPercent,price} = this.props;
      if(!discountPercent){return false}
      return {
        gap:4,
        row:[
            {flex:1},
            {html:<del>{SplitNumber(price)}</del>,className:'fs-14 theme-light-font-color',align:'v'},
            {html:<div style={{background:'#FFD335',color:'#fff',padding:'1px 3px',fontSize:12,borderRadius:6}}>{discountPercent + '%'}</div>,align:'v'},
        ]  
      }
    }
    price_layout(){
      let {priceAfterVat} = this.props;
      return {
        row:[
            {flex:1},
            {html:SplitNumber(priceAfterVat) + ' ریال',className:'fs-12 color404040 bold',align:'v'}
        ]
      }
    }
    render(){
      let {loading} = this.props;
      return (
        <RVD
          loading={loading}
          layout={{
            className:'box gap-no-color',style:this.getStyle(),
            row:[
              {
                size:96,
                column:[
                    this.image_layout(),
                    this.count_layout()
                ]
              },
              {size:3},
              {
                  flex:1,gap:6,
                  column:[
                      {size:3},
                      this.campaign_layout(),
                      this.name_layout(),
                      {flex:1},
                      this.details_layout(),
                      this.discount_layout(),
                      this.price_layout(),
                      {size:3}
                  ]
              },
              {size:6}
            ] 
          }}
        />
      )
    }
  }

  let fakeData = [
    {
      "lineNum": 0,"itemName": "پنل پلي كربنات 18 وات آفتابي توكار","itemCode": "7570","itemQty": 3,"itemGroupCode": 104,"price": 924000,
      "priceAfterDiscount": 847706.422,"priceAfterVat": 924000,"discountPercent": 0,"discount": 0,"openQty": 3,      
    },
    {
      "lineNum": 0,"itemName": "پنل پلي كربنات 18 وات آفتابي توكار","itemCode": "7570","itemQty": 3,"itemGroupCode": 104,"price": 924000,
      "priceAfterDiscount": 847706.422,"priceAfterVat": 924000,"discountPercent": 0,"discount": 0,"openQty": 3,      
    },
    {
      "lineNum": 0,"itemName": "پنل پلي كربنات 18 وات آفتابي توكار","itemCode": "7570","itemQty": 3,"itemGroupCode": 104,"price": 924000,
      "priceAfterDiscount": 847706.422,"priceAfterVat": 924000,"discountPercent": 0,"discount": 0,"openQty": 3,      
    },
  ]