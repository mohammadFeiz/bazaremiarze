import React,{Component} from 'react';
import RVD from './../../../npm/react-virtual-dom/react-virtual-dom';
import appContext from '../../../app-context';
//props
//1 - products [product,product,...]
//2 - title(text) required
//3 - showAll(function) optional
//4 - onClick(function) optional 
export default class CategorySlider extends Component{
    static contextType = appContext;
    products_layout(){
      let {Shop_Regular} = this.context;
      let {products} = this.props;
      let loading = false;
      if(!products){loading = true; products = [fakeProduct,fakeProduct,fakeProduct,fakeProduct,fakeProduct]}
      return {
        gap: 16,className:'ofx-auto p-b-12',
        row: products.map((product,i) =>{
            return {
              className:'of-visible',
              html:(Shop_Regular.renderCard({type:'vertical',product,loading,renderIn:'category slider'}))
            }
        }),
      }
    }
    render(){
      let {products,title,showAll} = this.props;
      return (
        <RVD
          layout={{
            style: { padding: 12 },className:'ofx-visible',
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
  "inStock": true,"details": [],"optionTypes": [],
  "variants": [{"id": "23338","discountPrice": 0,"price": 0,"inStock": true,"srcs": [],"code": "9425","discountPercent": 0,"isDefault": true}],
  "srcs": [],
  "name": "باتری سکه ای بروکس",
  "defaultVariant": {
      "id": "23338","discountPrice": 0,"price": 0,"inStock": true,
      "srcs": [],"code": "9425","discountPercent": 0,"isDefault": true
  },
  "price": 0,"discountPrice": 0,"discountPercent": 0,"id": "12666","ItemCode": "9425",
  "OnHand": {"whsCode": "01","qty": 15804,"qtyLevel": 20000,"qtyLevRel": 1},
  "Price": 527000,"B1Dscnt": 0,"FinalPrice": 505920,"PymntDscnt": 4,"CmpgnDscnt": 0
}


  