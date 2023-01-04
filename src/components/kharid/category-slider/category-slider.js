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
        gap: 16,className:'ofx-auto ofy-visible',
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
        gap: 16,className:'ofx-auto',
        row: new Array(3).fill(0).map(() =>{
            return {
              html:(
                <RVD
                  layout={{
                      style:{opacity:0.5},
                      className:'content-loading br-12 w-168 h-288',
                      column:[
                          {size:128,align:'vh',className:'p-12 p-b-0',html:<div className='w-100 h-100 br-8 bg-fff'></div>},
                          {size:12},
                          {html:<div className='w-100 h-12 bg-fff m-h-12'></div>},
                          {size:12},
                          {html:<div className='w-100 h-12 bg-fff m-r-12 m-l-36'></div>},
                          {size:12},
                          {html:<div className='w-100 h-12 bg-fff m-r-12 m-l-36'></div>},
                          {flex:1},
                          {html:<div className='w-100 h-12 bg-fff m-l-12 m-r-48'></div>},
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
            style: { padding: 12 },className:'ofy-auto',
            column: [
              {
                size:36,
                row:[
                  {html:title,className: "fs-14 color323130 bold",align: "v"},
                  {flex:1},
                  {show:showAll !== undefined && products !== undefined,html: "مشاهده همه",className: "fs-12 color3B55A5 bold",align: "v",onClick:()=>showAll()}
                ]
              },
              this.products_layout(),
            ],
          }}
        />
      )
    }
  }