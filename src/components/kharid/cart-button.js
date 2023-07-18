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
            if(['product','cart','category'].indexOf(renderIn) === -1){
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
                            className:'fs-12 color3B55A5',
                            onClick:(e)=>this.openCart(e),
                            row:[
                                {html:<Icon path={mdiCart} size={1}/>,align:'vh'},
                                {size:3},
                                {html:count,align:'v',className:'fs-18'}
                            ]
                        },
                        {
                            show:!!cartItems.length,align:'h',align:'vh',
                            className:'fs-12 color3B55A5',
                            onClick:(e)=>this.openCart(e),
                            size:36,
                            row:[
                                {html:<Icon path={mdiCart} size={1}/>,align:'vh'},
                                {size:3},
                                {html:cartItems.length,align:'v',className:'fs-18'}
                            ]
                        },
                        {
                            show:['product','shipping','cart'].indexOf(renderIn) === -1 && !!count,align:'vh',
                            style:{background:'yellow'},
                            size:36,
                            row:[
                                {html:<Icon path={mdiCart} size={1}/>,align:'vh'},
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
                                    style={{fontSize:12,height:36,padding:'0 8px'}}
                                >افزودن به سبد خرید</button>
                            )
                        },
                        {
                            show:renderIn === 'product' && !!count,align:'vh',
                            html:'تعداد در سبد خرید',className:'fs-12 color3B55A5'
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