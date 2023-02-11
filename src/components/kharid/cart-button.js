import React,{Component} from "react";
import ProductCount from "./product-count/product-count";
import appContext from "../../app-context";
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import Icon from "@mdi/react";
import { mdiCart } from "@mdi/js";
export default class CartButton extends Component{
    static contextType = appContext;
    openCart(e){
        e.stopPropagation();
        let {openPopup} = this.context;
        let {product} = this.props;
        openPopup('cart',product.cartId)
    }
    render(){
        let {cart,changeCart,getCartItemsByProduct} = this.context;
        let {variantId,product,renderIn,onChange = ()=>{}} = this.props;
        if(!product){console.error(`CartButton missing product props`)}
        if(!product.cartId){console.error(`CartButton missing cartId in product props`)}
        let cartTab = cart[product.cartId];
        let count = 0,cartItems = [];
        if(variantId){
            if(cartTab && cartTab.items[variantId]){
                count = cartTab.items[variantId].count;    
            }
        }
        else {
            if(['product','cart'].indexOf(renderIn) === -1){
                console.error('missing varinatId in ProductCard Component due render in cart page or product page')
            }
            cartItems = getCartItemsByProduct(product);
        }
        return (
            <RVD
                layout={{
                    column:[
                        {
                            show:['product','cart'].indexOf(renderIn) === -1 && !!count,align:'h',
                            className:'fs-12 colorA4262C',
                            onClick:(e)=>this.openCart(e),
                            row:[
                                {html:<Icon path={mdiCart} size={0.7}/>,align:'vh'},
                                {size:3},
                                {html:count,align:'v'}
                            ]
                        },
                        {
                            show:!!cartItems.length,align:'h',
                            className:'fs-12 colorA4262C',
                            onClick:(e)=>this.openCart(e),
                            row:[
                                {html:<Icon path={mdiCart} size={0.7}/>,align:'vh'},
                                {size:3},
                                {html:cartItems.length,align:'v'}
                            ]
                        },
                        {
                            show:['product','shipping','cart'].indexOf(renderIn) === -1 && !!count,
                            row:[
                                {html:<Icon path={mdiCart} size={0.8}/>,align:'vh'},
                                {size:3},
                                {html:count,align:'v'}
                            ]
                        },
                        {
                            show:renderIn === 'product' && !count,
                            html:()=>(
                                <button 
                                    onClick={() => {
                                        changeCart({variantId,product,count:1})
                                        onChange(1)
                                    }} 
                                    className="button-2"
                                    style={{fontSize:12,height:36,padding:'0 12px'}}
                                >افزودن به سبد خرید</button>
                            )
                        },
                        {
                            show:renderIn === 'product' && !!count,
                            html:'تعداد در سبد خرید',className:'fs-12 colorA4262C'
                        },
                        {
                            show:(renderIn === 'product' || renderIn === 'cart') && !!count,
                            html:()=>(
                                <ProductCount 
                                    value={count} 
                                    onChange={(count) => {
                                        changeCart({product,variantId,count})
                                        onChange(count)
                                    }} 
                                />
                            )
                        }
                    ]
                }}
            />
        )
    }
}