import React, { Component, useContext, useEffect, useState } from "react";
import RVD from "../../npm/react-virtual-dom/react-virtual-dom";
import appContext from "../../app-context";
import {CategorySlider} from "../../shop-class";
import "./index.css";
import Billboard from "../../components/billboard/billboard";
import { I_app_state, I_product, I_spreeCategory } from "../../types";
type I_slider = {getProducts:()=>Promise<I_product[]>,name:string,id:any}
export default function Buy() {
  let {Shop,spreeCategories,backOffice}:I_app_state = useContext(appContext);
  let [sliders,setSliders] = useState<I_slider[]>([])
  async function getSliders(){
    let {slider_type = []} = spreeCategories;
    let sliders:I_slider[] = [];
    for(let i = 0; i < slider_type.length; i++){
      let o:I_spreeCategory = slider_type[i];
      let {id,name} = o;
      let getProducts = async ()=>{
        debugger
        let products = await Shop.Regular.getCategoryItems(id)
        return products;
      };
      sliders.push({getProducts,name,id})
    }
    setSliders(sliders)
  }
  useEffect(()=>{getSliders()},[])
  function categories_layout(){
    let {spreeCategories = []} = backOffice;
    let categories:I_spreeCategory[] = spreeCategories.filter(({showType})=>showType === 'icon');
    return {
      column:[
        {html:'دسته بندی ها',align:'v',className:'p-h-24 fs-14 bold',size:36},
        {
          gridCols:3,gridRow:{align:'vh',gap:12},gap:12,
          grid:categories.concat(new Array(categories.length % 3).fill(false)).map((o:I_spreeCategory | false)=>{
            if(o === false){return {flex:1}}
            let {name,icon,id} = o as I_spreeCategory;
            return {
              flex:1,align:'vh',style:{maxWidth:220},gap:6,onClick:()=>Shop.Regular.openCategory(id),
              column:[{html:<img src={icon} width='100%' alt=''/>,align:'vh'},{html:name,className:'fs-14 bold',align:'vh'}]
            }
          })
        }
      ]
    }
  }
  function billboard_layout(){
    return {html:<Billboard renderIn='buy'/>}
  }
  function sliders_layout(){
    return {
      className:'of-visible',
      column:sliders.map((o:I_slider)=>{
        let {name,id,getProducts} = o;
        return {
          className:'of-visible',style:{marginBottom:12},
          html:()=><CategorySlider title={name} getProducts={getProducts} showAll={()=>Shop.Regular.openCategory(id)}/>
        }
      })
    }
  }
  return (
    <RVD 
      layout={{
        flex: 1,className: "page-bg w-100",style:{overflow:'hidden'},
        column: [
          {className: "ofy-auto",gap:24,flex:1,column:[billboard_layout(),categories_layout(),sliders_layout()]}
        ]
      }}
    />
  )
}