import React, { Component } from "react";
import RVD from "./../../../interfaces/react-virtual-dom/react-virtual-dom";
import appContext from "./../../../app-context";
import AIOButton from './../../../interfaces/aio-button/aio-button';
import './index.css';
export default class OrdersHistory extends Component {
    static contextType = appContext;
    constructor(props) {
      super(props);
      this.state = {activeTab:false,tabs:[]};
    }
    async componentDidMount() {
      let {kharidApis} = this.context;
      let {activeTab} = this.props;
      let tabs = await kharidApis({api:"ordersHistory"});
      try{this.setState({tabs,activeTab:activeTab || tabs[0].text});}
      catch{return}
    }
    tabs_layout() {
      let {tabs,activeTab} = this.state;
      return {
        html:(
          <AIOButton 
            type='tabs' options={tabs} optionValue='option.text' value={activeTab} 
            optionAfter={(option)=><div className='tab-badge'>{option.orders.length}</div>}
            onChange={(activeTab)=>this.setState({activeTab})}/>
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
      if(activeTab === false){return false}
      let tab = tabs.filter(({text})=>text === activeTab)[0];
      let orders = tab.orders;
      if(!orders.length){
        return {
          flex:1,html:'سفارشی موجود نیست',className:'size16 color605E5C bold',align:'vh'
        }
      }
      let column = orders.map((o,i)=>this.order_layout(o,i))
      column.push({size:300})
      return {flex: 1,gap: 12,scroll:'v',column}
    }
    order_layout(order,index){
      let {openPopup} = this.context;
      return {
        style:{overflow:'visible'},
        html:<OrderCard order={order} index={index}/>,
        attrs:{onClick:()=>openPopup('joziate-sefareshe-kharid',order)}
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
          {html:"پیش سفارش:",className:"colorA19F9D size12"},
          {size:4},
          {html:mainDocNum, className: "color605E5C size14"},
          {flex:1},
          {html:date,className:"colorA19F9D size12"},
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
          {html:order.translate,className:'size12 color323130'},
          {flex:1},
          {html:this.splitPrice(total),className: "size14 color323130"},
          {size:6},
          {html:unit,className: "size12 color605E5C"},
        ],
      }
    }
    render() {
      let {mounted} = this.state;
      return (
        <RVD
          layout={{
            className: "box gap-no-color order-card" + (mounted?' mounted':''),
            column: [this.header_layout(),this.footer_layout(),],
          }}
        />
      );
    }
  }