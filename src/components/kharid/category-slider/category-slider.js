import React,{Component} from 'react';
import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
import ProductCard from './../product-card/product-card';
//props
//1 - products [product,product,...]
//2 - title(text) required
//3 - showAll(function) optional
//4 - onClick(function) optional 
export default class CategorySlider extends Component{
    products_layout(){
      let {products} = this.props;
      if(!products){return this.productsLoading_layout()}
      return {
        gap: 16,scroll:'h',style:{overflowY:'visible'},
        row: products.map((product,i) =>{
            return {
              html:(
                <ProductCard 
                    type='vertical' product={product} 
                    isFirst={i === 0} isLast={i === products.length - 1} 
                />
              )
            }
        }),
      }
    }
    productsLoading_layout(){
      return {
        gap: 16,scroll:'h',
        row: new Array(3).fill(0).map(() =>{
            return {
              html:(
                <RVD
                  layout={{
                      style:{height:256,width:140,borderRadius:12,opacity:0.5},
                      className:'content-loading',
                      column:[
                          {size:128,align:'vh',html:<div style={{width:'100%',height:'100%',borderRadius:8,background:'#fff'}}></div>,style:{padding:6,paddingBottom:0}},
                          {size:12},
                          {html:<div style={{height:12,width:'100%',background:'#fff',margin:'0 12px'}}></div>},
                          {size:12},
                          {html:<div style={{height:12,width:'100%',background:'#fff',margin:'0 12px',marginLeft:36}}></div>},
                          {size:12},
                          {html:<div style={{height:12,width:'100%',background:'#fff',margin:'0 12px',marginLeft:36}}></div>},
                          {flex:1},
                          {html:<div style={{height:12,width:'100%',background:'#fff',margin:'0 12px',marginRight:48}}></div>},
                          {size:12}
                      ]
                  }}
                />
              )
            }
        }),
      }
    }
    render(){
      let {products,title,showAll} = this.props;
      return (
        <RVD
          layout={{
            style: { padding: 12 },scroll:'v',
            column: [
              {
                size:36,
                row:[
                  {html:title,className: "size14 color323130 bold",align: "v"},
                  {flex:1},
                  {show:showAll !== undefined && products !== undefined,html: "مشاهده همه",className: "size12 color3B55A5 bold",align: "v",attrs:{onClick:()=>showAll()}}
                ]
              },
              this.products_layout(),
            ],
          }}
        />
      )
    }
  }