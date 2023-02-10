import React,{Component} from "react";
import ProductCount from "./product-count/product-count";
import appContext from "../../app-context";
export default class CartButton extends Component{
    static contextType = appContext;
    render(){
        let {cart,changeCart} = this.context;
        let {variantId,product,renderIn,onChange = ()=>{}} = this.props;
        if(!product){console.error(`CartButton missing product props`)}
        if(!product.cartId){console.error(`CartButton missing cartId in product props`)}
        cart[product.cartId] = cart[product.cartId] || {};
        if(!variantId){return ''}
        if(!cart[product.cartId][variantId]){
            return (
                <button 
                    onClick={() => {
                        changeCart({variantId,product,count:1})
                        onChange(1)
                    }} 
                    className="button-2"
                    style={{fontSize:12,height:36,padding:'0 12px'}}
                >افزودن به سبد خرید</button>
                
                )
        }
        let {count} = cart[product.cartId][variantId];
        if(renderIn === 'shipping'){
            return count;
        }
        return (
            <ProductCount 
                value={count} 
                onChange={(count) => {
                    changeCart({product,variantId,count})
                    onChange(count)
                }} />
        )
    }
}