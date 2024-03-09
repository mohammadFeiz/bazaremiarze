import React, { Component } from "react";
import RVD from "./../../../npm/react-virtual-dom/react-virtual-dom";
import appContext from "./../../../app-context";
import SplitNumber from "../../../npm/aio-functions/split-number";
import NoSrc from './../../../images/imgph.png';
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

    //making row
    static contextType = appContext;
    state = {order:this.props.order}
    getRow(key, value = '-------------',show = true, style) {
      if(value === null){value = '-------------'}
      if(!show){return false}
      return {
        align: "v",
        style,
        row: [
          { size: 160, html: key + " : ", className: "fs-12" },
          {flex:1},
          { html: value, className: "fs-12" },
        ],
      };
    }

    //making number splitter
    splitter_layout(){
      return {
        html:'',style:{borderBottom:'1px solid #eee'}
      }
    }
    
    //status sefareshat
    getStatus(status) {

      let {order} = this.state;
      let {details = {}} = order;
      details.basePrice = details.basePrice || 0;

      let statuses = [
        // در حال بررسی
        { title: "در انتظار بررسی", color: "#3B55A5", percent: 20},
        { title: "سفارش ثبت شده", color: "#3B55A5", percent: 20},
        // در انتظار پرداخت
        { title: "مغایرت پرداخت", color: "#E9A23B", percent: 35},
        { title: "ثبت اولیه پرداخت", color: "#E9A23B", percent: 35},
        { title: "در انتظار پرداخت", color: "#E9A23B", percent: 35},
        // در حال پردازش
        { title: "تایید واحد مالی", color: "#662D91", percent: 50 },
        { title: "دریافت اطلاعات پرداخت", color: "#662D91", percent: 50 },
        { title: "تایید پای بار واحد فروش", color: "#662D91", percent: 50 },
        { title: "عملیات انبار", color: "#662D91", percent: 50 },
        //در حال ارسال
        { title: "بخشی فاکتور شده", color: "#0095DA", percent: 65},
        { title: "بخشی تحویل برخی فاکتور شده", color: "#0095DA", percent: 65},
        { title: "آماده توزیع", color: "#0095DA", percent: 65},
        { title: "بخشی تحویل شده", color: "#0095DA", percent: 65},
        //تحویل شده
        { title: "تحویل کامل و برخی فاکتور شده", color: "#455a96", percent: 80 },
        { title: "تحویل شده", color: "#455a96", percent: 80 },
        //تکمیل شده
        { title: "فاکتور شده", color: "#2F9461", percent: 100 },
        //لغو شده
        { title: "لغو شده", color: "#CD3636", percent: 100 },
        { title: "کنسل شده", color: "#CD3636", percent: 100 },
        { title: "مرجوع شده", color: "#CD3636", percent: 100 },
      ];

      let obj = statuses.find((o)=>o.title === order.translate);
      if (!obj) {return null;}
      return {
        style: { padding: "0 24px" },className: "box m-h-12 gap-no-color theme-gap-h",gap: 12,
        column: [
          { size: 16 },
          //مبلغ پرداختی کل  = قیمت پایه
          this.getRow("مبلغ پرداختی کل", SplitNumber(order.total) + ' ریال', true, {color:'#242424', fontSize:14, fontWeight:'bold'}),
          this.getRow("نحوه تسویه", details.nahve_tasvie),
          this.getRow("موعد پرداخت", details.moede_pardakht),
          this.getRow("نحوه پرداخت", details.nahve_pardakht),
          { size: 16 },
          {
            className:'p-12',
            style:{background:'#f5f5f5', borderRadius:'10px'},
            column:[
              {size: 24,html: obj.title,style: { color: obj.color },className: "fs-14 bold m-b-6"},
              {
                html: (
                  <div style={{height: 6,display: "flex",width: "100%",borderRadius: 3,overflow: "hidden"} }>
                    <div style={{ width: obj.percent + "%", background: obj.color }}></div>
                    <div style={{ flex: 1, background: '#eee' }}></div>
                  </div>
                )
              }
            ]
          },
          { size: 16 },
        ],
      };
    }

    async componentDidMount(){
      await this.getDetails()  
    }
    async getDetails(){
      let {apis} = this.context;
      let {order} = this.state;
      if(order.details){return}
      await apis.request({
        api:'kharid.mahsoolate_sefareshe_kharid',parameter:order,loading:false,description:'دریافت محصولات سفارش خرید',
        onSuccess:(newOrder)=>{
          this.setState({order:newOrder})
        }
      })
      
    }
    
    async pardakht(){
      let {apis} = this.context;
      let {order} = this.props;
      await apis.request({api:'kharid.pardakhte_kharid',parameter:{order},description:'پرداخت خرید عادی'})
    }
    details_layout(){
      let {b1Info} = this.context;
      let {order} = this.state;
      let {details = {}} = order;
      return {
        className: "box gap-no-color theme-gap-h p-12",gap: 12,
        column: [
          this.getRow("پیش فاکتور", order.mainDocNum),
          this.getRow("تاریخ ثبت", order.date),
          this.splitter_layout(),
          this.getRow("نام مشتری",details.customerName + " - " + details.customerCode),
          this.getRow("گروه مشتری", b1Info.customer.groupName),
          this.getRow("نام کمپین", details.campain_name),
          this.splitter_layout(),
          this.getRow("تلفن همراه", details.mobile),
          this.getRow("آدرس", details.address),
        ],
      }
    }
    // factorDetails_layout(){
    //   let {order} = this.state;
    //   return {
    //     style: { padding: "0 24px" },className: "box gap-no-color theme-gap-h p-12",gap: 12,
    //     row:[
    //         {html:<div>پیش فاکتور : {order.mainDocNum}</div>,className:'fs-12 theme-medium-font-color bold',align:'v'},
    //         {flex:2},
    //         {html:<div>تاریخ ثبت : {order.date}</div>,className:'fs-12 theme-medium-font-color bold',align:'v'},
    //         {flex:1},
    //     ]
    //   }
    // }
    takhfifat_layout(){
      let {order} = this.state;
      let {details = {}} = order;
      details.basePrice = details.basePrice || 0;
      return {
        className: "box gap-no-color theme-gap-h p-12",gap: 12,
        column: [
          this.getRow("قیمت کالاها", SplitNumber(details.basePrice) + ' ریال'),
          this.getRow("تخفیف ویژه " + '(' + Math.round(details.darsad_takfif_vizhe) + '%' + ')', SplitNumber(details.takhfif_vizhe) + ' ریال', true, {color:'#0095DA',fontWeight:'bold',fontSize:16}),
          this.getRow("تخفیف نحوه پرداخت " + '(' + details.discountPercent + '%' + ')',  SplitNumber(details.docDiscount) + ' ریال', true, {color:'#2F9461',fontWeight:'bold',fontSize:16}),
          this.splitter_layout(),
          this.getRow("جمع نهایی", SplitNumber(order.total) + ' ریال', true, {fontWeight:'bold',fontSize:16}),
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

      let {order} = this.state;
      
      return (
        <RVD
          layout={{
            className: "theme-popup-bg",
            column: [
              {className:'theme-vertical-gap'},
              {
                flex: 1,className: "gap-12",
                column: [
                  //position=fixed
                  // this.factorDetails_layout(),
                  {
                    flex:1,
                    className: "ofy-auto gap-12 m-b-12",
                    column:[
                      this.details_layout(),                               
                      this.getStatus(order),                 
                      this.products_layout(),                 
                      this.takhfifat_layout(),
                    ]
                  }                  
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
      let {imageUrl} = this.props;
      return {html:<img src={imageUrl} width={'100%'} alt=''/>}
    }

    unit_layout(){
      let {itemQty} = this.props;
      let {unitOfMeasure} = this.props;
      return {
        gap:4,
        column:[
          {size:6},
          {html:<div>تعداد :  {itemQty}</div>,className:'fs-10 op-80 theme-light-font-color bold',align:'h'},
          {html:<div>واحد : {unitOfMeasure}</div>,className:'fs-10 op-80 theme-light-font-color bold',align:'h'},
        ]
      }
    }
    campaign_layout(){
      let {campaign} = this.props;
      if(!campaign){return false}
      return {html:campaign.name,className:'fs-10',style:{color:'rgb(253, 185, 19)'}}
    }
    name_layout(){
      let {itemName} = this.props;
      return {
        gap:4,
        row:[
          {html:<div style={{color:'#455a96'}}>{itemName}</div>,className:'fs-14 bold m-b-6',align:'v'},
        ]
      }
    }
    itemCode_layout(){
      let {itemCode} = this.props;
      return {
        gap:4,
        row:[
          {html:<div style={{background:'#e8e8e8',fontWeight:'bold',padding:'1px 3px',fontSize:12,borderRadius:6}}>{itemCode}</div>,className:'fs-12 theme-medium-font-color bold',align:'v'},
        ]
      }
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
      let {price} = this.props;
      let {priceAfterVat} = this.props;
      let {discountPercent} = this.props;
      let {itemQty} =this.props;
      if(!discountPercent){return false}
      return {
        row:[
          {flex:1},
          {
            className:'gap-3',
            column:[
              {
                className:'gap-3',align:'v',
                row:[
                  {flex:1},
                  {html:<del>{SplitNumber(price*itemQty)}</del>,className:'fs-12'},
                  {html:<div style={{background:'#0095DA',color:'#fff',padding:'1px 5px',fontSize:12,borderRadius:6}}>{discountPercent + '%'}</div>,align:'v'}
                  
                ]
              },
              {
                className:'gap-3',align:'v',
                row:[
                  {flex:1},
                  {html:SplitNumber(priceAfterVat*itemQty),className:'fs-14 theme-medium-font-color bold'},
                  {html:'ریال',className:'fs-10'}
                ]
              }
            ]  
          }
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
    row_layout(key,value){
      return {
        gap:3,
        className:'fs-12 theme-medium-font-color',align:'v',
        row:[
          {size:12,align:'vh',html:<div className='w-6 h-6 bg-18 br-100'></div>},
          {html:key,className:'op-80'},
          {html:':'},
          {html:value,className:'bold'},
        ]
      }
    }
    render(){
      let {loading,unitOfMeasure,boxName,inBox,price,priceAfterVat} = this.props;
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
                    this.unit_layout(),
                ]
              },
              {size:6},
              {
                  flex:1,gap:6,
                  column:[
                      {size:3},
                      this.campaign_layout(),
                      this.itemCode_layout(),
                      this.name_layout(),
                      {
                        className:'theme-medium-font-color fs-10 gap-6',
                        column:[
                          this.row_layout('محتوای بسته',`${inBox} ${unitOfMeasure} در هر ${boxName}`),
                          this.row_layout('قیمت تکی',`${SplitNumber(price)} ریال`),
                          this.row_layout('قیمت تکی بعد از تخفیف',`${SplitNumber(priceAfterVat)} ریال`)
                        ]
                      },
                      {flex:1},
                      this.details_layout(),
                      this.discount_layout(),
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