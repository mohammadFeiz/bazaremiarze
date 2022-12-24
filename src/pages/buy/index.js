import React, { Component } from "react";
import RVD from "./../../interfaces/react-virtual-dom/react-virtual-dom";
import appContext from "../../app-context";
import CategorySlider from "./../../components/kharid/category-slider/category-slider";
import AIOButton from "../../interfaces/aio-button/aio-button";
import FamilyCard from './../../components/family-card/family-card';
import "./index.css";
import Billboard from "../../components/billboard/billboard";

export default class Buy extends Component {
  static contextType = appContext;
  constructor(props) {
    super(props);
    let {view = {type:"main"}} = this.props;
    this.state = {
      searchValue: "",
      view, //main,category,product
      tabs: [
        { text: "نمایشگاه", value: "1" },
        { text: "دسته بندی کالاها", value: "2"},
      ],
      activeTabId: "1",
      activeCartTabId:'regular',
      families: [],
      categories: [],
    };
  }
  changeView(o){
    if(o === 'back'){
      if(!this.viewStack.pop){return}
      this.viewStack.pop();
      let beforeView = {...this.viewStack[this.viewStack.length - 1]};
      this.setState({view:{...beforeView}});
      
    }
    else {
      this.viewStack = this.viewStack || [{type:'main'}];
      this.viewStack.push(o)
      this.setState({view:{...o}});
    }
    
  }
  async getCategories() {
    let {kharidApis} = this.context;
    let categories = await kharidApis({api:"getCategories",cache:24 * 60});
    this.setState({ categories });
  }
  async getFamilies() {
    let {kharidApis} = this.context;
    let families = await kharidApis({api:'families',cache:24 * 60});
    this.setState({ families });
  }
  async get_recommendeds() {
    let {kharidApis} = this.context;
    let recommendeds = await kharidApis({api:'recommendeds',cache:24 * 60});
    this.setState({ recommendeds });
  }
  async get_newOrders() {
    let {kharidApis} = this.context;
    let newOrders = await kharidApis({api:"newOrders",cache:24 * 60});
    this.setState({ newOrders });
  }
  async get_bestSellings() {
    let {kharidApis} = this.context;
    let bestSellings = await kharidApis({api:'bestSellings',cache:24 * 60});
    this.setState({ bestSellings });
  }
  //dont set async for parallel data fetching
  componentDidMount() {
    this.get_newOrders(10);
    this.getFamilies();
    this.get_recommendeds(10);
    this.get_bestSellings(10);
    this.getCategories();
    this.context.SetState({buy_view:undefined})//reset temporary state
  }
  tabs(){
    let {view,tabs,activeTabId} = this.state;
    return {
      flex: 1,style:{overflow:'hidden'},show:view.type === 'main',
      column: [
        {html:<AIOButton type='tabs' options={tabs} value={activeTabId} onChange={(activeTabId)=>this.setState({activeTabId})} optionStyle={{flex:1}}/>},
        {size:12},
        this['tab' + activeTabId]()
      ],
    }
  }
  tab1(){
    return {
      flex: 1,scroll: "v",gap: 12,
      column: [
        this.billboard_layout(),
        //this.families(),
        this.sliders()
      ]
    }
  }
  tab2(){
    let {openPopup} = this.context;
    let {categories = []} = this.state;
    return {
      flex: 1,className:'padding-12',scroll:'v',gap: 24,
      column:categories.map((o)=>{
        return {
          attrs:{onClick:()=>openPopup('category',{name:o.name,category:{products:o.products,name:o.name}})},
          column:[
            {size:200,html:<img src={o.src} alt='' height='100%'/>,align:'vh'},
            {size:36,align:'vh',html:o.name,className:'color323130 size16 bold'}
          ] 
        }
      })
    };
  }
  billboard_layout(){
    return {html:<Billboard renderIn='buy'/>}
  }
  families(){
    let {families} = this.state;
    return {
      className: "box gap-no-color",style: { padding: 12 },show: families.length !== 0,
      column: [
        {html: "محبوب ترین خانواده ها",className: "size14 color323130 bold",size: 36,align: "v"},
        {
          gap: 16,scroll:'h',
          row: families.map((o) => {
            return {html:<FamilyCard title={o.name} src={o.src} id={o.id}/>}
          }),
        },
      ],
    }
  }
  sliders(){
    let {openPopup} = this.context;
    let sliders = [['newOrders','جدید ترین محصولات'],['bestSellings','پر فروش ترین محصولات'],['recommendeds','پیشنهاد سفارش']]
    return {
      gap:12,className:'margin-0-12',
      style:{overflow:'visible'},
      column:sliders.map(([key,name])=>{
        let products = this.state[key] || [];
        return {
          style:{overflow:'visible'},
          className:'box gap-no-color',
          html:()=>(
            <CategorySlider 
              title={name} products={this.state[key]} 
              showAll={()=>openPopup('category',{name,category:{products,name}})}
            />
          )
        }
      })
    }
  }
  render() {
    return (
      <RVD layout={{
        flex: 1,className: "page-bg",style: { width: "100%" },
        column: [
          this.tabs(),
          {size:12}
        ]
      }}/>
    )
  }
}

