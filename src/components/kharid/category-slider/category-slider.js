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
      let loading = false;
      if(!products){loading = true; products = [fakeProduct,fakeProduct,fakeProduct,fakeProduct,fakeProduct]}
      return {
        gap: 16,className:'ofx-auto ofy-visible',
        row: products.map((product,i) =>{
            return {
              html:(
                <ProductCard 
                    type='vertical' product={product} loading={loading}
                    isFirst={i === 0} isLast={i === products.length - 1} 
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
                  {html:title,className: "fs-14 theme-dark-font-color bold",align: "v"},
                  {flex:1},
                  {show:showAll !== undefined && products !== undefined,html: "مشاهده همه",className: "fs-12 theme-link-font-color bold",align: "v",onClick:()=>showAll()}
                ]
              },
              this.products_layout(),
            ],
          }}
        />
      )
    }
  }
let fakeProduct = {
  "inStock": 15914,"details": [],"optionTypes": [],
  "variants": [{"id": "23338","discountPrice": 0,"price": 0,"inStock": 15914,"srcs": [],"code": "9425","discountPercent": 0,"isDefault": true}],
  "srcs": [],
  "name": "باتری سکه ای بروکس",
  "defaultVariant": {
      "id": "23338","discountPrice": 0,"price": 0,"inStock": 15914,
      "srcs": [],"code": "9425","discountPercent": 0,"isDefault": true
  },
  "price": 0,"discountPrice": 0,"discountPercent": 0,"id": "12666","ItemCode": "9425",
  "OnHand": {"whsCode": "01","qty": 15804,"qtyLevel": 20000,"qtyLevRel": 1},
  "Price": 527000,"B1Dscnt": 0,"FinalPrice": 505920,"PymntDscnt": 4,"CmpgnDscnt": 0
}


  