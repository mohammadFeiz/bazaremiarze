import React, { Component } from "react";
import RVD from "./../../npm/react-virtual-dom/react-virtual-dom";
import appContext from "../../app-context";
import CategorySlider from "./../../components/kharid/category-slider/category-slider";
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
      category:false,
      categories: [],
      sliders:[]
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
  async componentDidMount() {
    let {spreeCategories,Shop_Regular} = this.context;
    let {slider_type = []} = spreeCategories;
    let sliders = [];
    for(let i = 0; i < slider_type.length; i++){
      let o = slider_type[i];
      let {id,name} = o;
      let products = await Shop_Regular.getCategoryProducts(id,6);
      sliders.push({products,name,id})
    }
    this.setState({sliders})
  }
  tabs(){
    let {view} = this.state;
    let {Shop_Regular} = this.context;
    return {
      flex: 1,style:{overflow:'hidden'},show:view.type === 'main',
      column: [
        {
          flex: 1,
          column: [
            // {
            //   html:()=>{
            //     return Shop_Regular.renderCartFactor(false)
            //   }
            // },
            {
              className: "ofy-auto",
              flex:1,column:[
                this.billboard_layout(),
                {size:24},
                this.categories_layout(),
                this.sliders_layout(),
                //this.category_layout()
              ]
            }
          ]
        }
      ],
    }
  }
  categories_layout(){
    let {Shop_Regular,backOffice} = this.context;
    let {spreeCategories = []} = backOffice;
    let categories = spreeCategories.filter(({showType})=>showType === 'icon');
    return {
      column:[
        {html:'دسته بندی ها',align:'v',className:'p-h-24 fs-14 bold',size:36},
        {
          gridCols:3,gridRow:{align:'vh',gap:12},gap:12,
          grid:categories.concat(new Array(categories.length % 3).fill(false)).map((o)=>{
            if(o === false){return {flex:1}}
            let {name,icon,id} = o;
            return {
              flex:1,align:'vh',style:{maxWidth:220},
              onClick:()=>Shop_Regular.openCategory(id),
              // onClick:async ()=>{
              //   let category = await Shop_Regular.getCategoryProps(id)
              //   this.setState({category})
              // },
              column:[
                {html:<img src={icon} width='100%' alt=''/>,align:'vh'},
                {size:6},
                {html:name,className:'fs-14 bold',align:'vh'}
              ]
            }
          })
        }
      ]
    }
  }
  category_layout(){
    let {Shop_Regular} = this.context;
    let {category} = this.state
    if(!category){return false}
    return {
      html:Shop_Regular.getCategory(category)
    }
  }
  billboard_layout(){
    return {html:<Billboard renderIn='buy'/>}
  }
  sliders_layout(){
    let {Shop_Regular} = this.context;
    let {sliders} = this.state;
    return {
      className:'of-visible',
      column:sliders.map(({name,id,products})=>{
        return {
          className:'of-visible',style:{marginBottom:12},
          html:()=><CategorySlider title={name} products={products} showAll={()=>Shop_Regular.openCategory(id)}/>
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
        ]
      }}/>
    )
  }
}