import React, { Component } from "react";
import RVD from "./../../../interfaces/react-virtual-dom/react-virtual-dom";
import appContext from "./../../../app-context";
import functions from "./../../../functions";
export default class OrderPopup extends Component {
    static contextType = appContext;
    state = {details:{}}
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
      let {order} = this.props;
      let details = await kharidApis({api:'orderProducts',parameter:order})
      this.setState({details})
    }
    async pardakht(){
      let {kharidApis} = this.context;
      let {order} = this.props;
      let res = await kharidApis({api:'pardakhte_kharid',parameter:{order}})
    }
    splitter_layout(){
      return {
        html:'',style:{borderBottom:'1px solid #ccc'}
      }
    }
    details_layout(){
      let {userInfo} = this.context;
      let {order} = this.props;
      let {details = {}} = this.state;
      details.basePrice = details.basePrice || 0
      return {
        className: "box gap-no-color m-h-12 p-12",gap: 12,
        column: [
          this.getRow("پیش فاکتور", order.mainDocNum),
          this.getRow("تاریخ ثبت", order.date),
          this.splitter_layout(),
          this.getRow("نام مشتری",details.customerName + " - " + details.customerCode),
          this.getRow("گروه مشتری", userInfo.groupName),
          this.getRow("نام کمپین", details.campaignName),
          this.getRow("قیمت پایه", functions.splitPrice(details.basePrice) + ' ریال'),
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
          this.getRow("مبلغ پرداختی کل", functions.splitPrice(order.total) + ' ریال')
        ],
      }
    }
    dokmeye_pardakht_layout(){
      let {order} = this.props;
      let {docStatus} = order;
      let {details = {}} = this.state;
      let {nahve_pardakht} = details;
      if(docStatus !== 'WaitingForPayment' || nahve_pardakht !== 'اینترنتی'){return false}
      return {
        className:'p-12',
        html:(<button className="button-2" onClick={()=>this.pardakht()}>پرداخت</button>)
      }
    }
    products_layout(){
      let {details = {}} = this.state;
      let {products = []} = details;
      return {
        gap: 2,className:'m-h-12',of:'visible',
        column: products.map((o, i) => {
          return {
            of:'visible',
            html:(
              <ProductCard {...o} index={i}
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
            className: "popup-bg",
            column: [
              {size:12},
              {
                flex: 1,ofy: "auto",gap: 12,
                column: [
                  this.details_layout(),
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
      let {src} = this.props;
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
      return {html:itemName,className:'fs-12 color575756 bold'}
    }
    details_layout(){
      let {details = []} = this.props;
      if(!details.length){return false}
      return {
        column:details.map((d)=>{
            return {size:20,align:'v',html:`${d[0]} : ${d[1]}`,className:'fs-10 colorA19F9D'}
        })
      }
    }
    discount_layout(){
      let {discountPercent,priceAfterVat} = this.props;
      if(!discountPercent){return false}
      return {
        gap:4,
        row:[
            {flex:1},
            {html:<del>{functions.splitPrice(priceAfterVat)}</del>,className:'fs-14 colorA19F9D',align:'v'},
            {html:<div style={{background:'#FFD335',color:'#fff',padding:'1px 3px',fontSize:12,borderRadius:6}}>{discountPercent + '%'}</div>,align:'v'},
        ]  
      }
    }
    price_layout(){
      let {price} = this.props;
      return {
        row:[
            {flex:1},
            {html:functions.splitPrice(price) + ' ریال',className:'fs-12 color404040 bold',align:'v'}
        ]
      }
    }
    render(){
      return (
        <RVD
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

  