import React,{Component} from "react";
import ProductCount from "./product-count/product-count";
import appContext from "../../app-context";
export default class CartButton extends Component{
    static contextType = appContext;
    render(){
        let {cart,changeCartCount} = this.context;
        let {variantId,product,renderIn} = this.props;
        if(!product){console.error(`CartButton missing product props`)}
        if(!product.cartId){console.error(`CartButton missing cartId in product props`)}
        cart[product.cartId] = cart[product.cartId] || {};
        if(!variantId){return ''}
        if(!cart[product.cartId][variantId]){
            return (<button onClick={() => this.changeCount({cartId:product.cartId,variantId,product,count:1})} className="button-2">افزودن به سبد خرید</button>)
        }
        let {count} = cart[product.cartId][variantId];
        if(renderIn === 'shipping'){
            return count;
        }
        return (
            <ProductCount value={count} onChange={(count) => changeCartCount({product,variantId,count})} />
        )
    }
}