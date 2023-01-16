import React, { Component } from "react";
import RVD from "./../../../interfaces/react-virtual-dom/react-virtual-dom";
import appContext from "./../../../app-context";
import AIOButton from './../../../interfaces/aio-button/aio-button';
export default class OrdersHistory extends Component {
    static contextType = appContext;
    constructor(props) {
      super(props);
      this.state = {activeTab:'در حال بررسی',tabs:fakeData,loading:true};
    }
    async componentDidMount() {
      let {kharidApis} = this.context;
      let {activeTab} = this.props;
      let tabs = await kharidApis({api:"ordersHistory"});
      try{this.setState({tabs,activeTab:activeTab || tabs[0].text,loading:false});}
      catch{return}
    }
    tabs_layout() {
      let {tabs,activeTab,loading} = this.state;
      if(loading){return false}
      return {
        html:(
          <AIOButton 
            type='tabs' options={tabs} optionValue='option.text' value={activeTab} 
            optionAfter={(option)=><div className='tab-badge'>{option.orders.length}</div>}
            onChange={(activeTab)=>{
              if(activeTab === this.state.activeTab){return}
              this.setState({activeTab})
            }}/>
        )
      }
    }
    async getDetails(o){
      let { SetState,kharidApis } = this.context;
      let res = await kharidApis({api:"joziatepeygiriyesefareshekharid", parameter:o});
      SetState({popup: {mode: "joziate-sefareshe-kharid",order: res}})
    }
    orders_layout(){
      let { activeTab,tabs } = this.state;
      let tab = tabs.filter(({text})=>text === activeTab)[0];
      let orders = tab.orders;
      if(!orders.length){
        return {
          flex:1,html:'سفارشی موجود نیست',className:'fs-16 theme-medium-font-color bold',align:'vh'
        }
      }
      let column = orders.map((o,i)=>this.order_layout(o,i))
      column.push({size:300})
      return {flex: 1,gap: 12,className:'ofy-auto',column}
    }
    order_layout(order,index){
      let {openPopup} = this.context;
      let {loading} = this.state;
      return {
        className:'of-visible',
        html:(
          <OrderCard 
            key={order.code + loading} 
            order={order} 
            index={index} 
            loading={loading}
            onClick={()=>openPopup('joziate-sefareshe-kharid',order)}
          />
        )
      }
    }
    render() {
      return (
          <RVD layout={{className: "popup-bg",column: [this.tabs_layout(),{size:12},this.orders_layout()]}}/>
      );
    }
  }

  class OrderCard extends Component {
    state = {unit:'ریال',mounted:false}
    componentDidMount(){
      let {index = 0} = this.props;
        setTimeout(()=>{
            this.setState({mounted:true})
        },index * 100 + 100)
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
    header_layout(){
      let {order} = this.props;
      let {mainDocNum,date} = order;
      return {
        align:"v",size:36,
        row: [
          {html:"پیش سفارش:",className:"theme-light-font-color fs-12"},
          {size:4},
          {html:mainDocNum, className: "theme-medium-font-color fs-14"},
          {flex:1},
          {html:date,className:"theme-light-font-color fs-12"},
        ],
      }
    }
    footer_layout(){
      let {unit} = this.state;
      let {order} = this.props;
      let {total} = order;
      return {
        size: 36,childsProps: { align: "v" },
        row: [
          {html:order.translate,className:'fs-12 theme-dark-font-color'},
          {flex:1},
          {html:this.splitPrice(total),className: "fs-14 theme-dark-font-color"},
          {size:6},
          {html:unit,className: "fs-12 theme-medium-font-color"},
        ],
      }
    }
    render() {
      let {mounted} = this.state;
      let {loading,onClick} = this.props;
      if(loading){mounted = true}
      return (
        <RVD
          loading={loading}
          layout={{
            onClick,
            className: "box gap-no-color m-h-12 p-12 rvd-rotate-card" + (mounted?' mounted':''),
            column: [this.header_layout(),this.footer_layout(),],
          }}
        />
      );
    }
  }

  let fakeData = [
    {
      "text": "در حال بررسی",
      "orders": [
          {"code": 22655,"translate": "در حال بررسی","mainDocNum": 22395,"date": "1401/9/22","_time": "00:00:00","total": 5266800},
          {"code": 22655,"translate": "در حال بررسی","mainDocNum": 22395,"date": "1401/9/22","_time": "00:00:00","total": 5266800},
          {"code": 22655,"translate": "در حال بررسی","mainDocNum": 22395,"date": "1401/9/22","_time": "00:00:00","total": 5266800},
          {"code": 22655,"translate": "در حال بررسی","mainDocNum": 22395,"date": "1401/9/22","_time": "00:00:00","total": 5266800},
          {"code": 22655,"translate": "در حال بررسی","mainDocNum": 22395,"date": "1401/9/22","_time": "00:00:00","total": 5266800},
          {"code": 22655,"translate": "در حال بررسی","mainDocNum": 22395,"date": "1401/9/22","_time": "00:00:00","total": 5266800}
      ]
  }
  ]