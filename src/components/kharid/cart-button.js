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
        let {actionClass} = this.context;
        let {product} = this.props;
        actionClass.openPopup('cart',product.cartId)
    }
    render(){
        let {cart,actionClass} = this.context;
        let {variantId,product,renderIn,onChange = ()=>{},cartId,taxonId,CampaignId} = this.props;
        if(!product){console.error(`CartButton missing product props`)}
        if(!product.cartId){console.error(`CartButton missing cartId in product props`)}
        let cartTab = cart[cartId];
        let count = 0,cartItems = [];
        if(variantId){
            if(cartTab){
                if(taxonId){
                    if(cartTab.items[taxonId]){
                        if(cartTab.items[taxonId].items[variantId]){
                            count = cartTab.items[taxonId].items[variantId].count;    
                        }
                    }
                }
                else {
                    if(cartTab.items[variantId]){
                        count = cartTab.items[variantId].count;    
                    }
                }
            }
            
            
        }
        else {
            if(['product','cart','category'].indexOf(renderIn) === -1){
                console.error('missing varinatId in ProductCard Component due render in cart page or product page')
            }
            cartItems = actionClass.getCartItemsByProduct(product,cartId,taxonId);
        }
        let layout;
        if(!count){
            layout = {
                html:()=>(
                    <button 
                        onClick={() => {
                            actionClass.changeCart({variantId,product,count:1,cartId,taxonId,CampaignId})
                            onChange(1)
                        }} 
                        className="button-2"
                        style={{fontSize:12,height:36,padding:'0 8px'}}
                    >افزودن به سبد خرید</button>
                )
            }
        }
        else if(renderIn === 'shipping'){
            layout = {
                align:'h',gap:3,className:'fs-12 color3B55A5',onClick:(e)=>this.openCart(e),
                row:[{html:<Icon path={mdiCart} size={1}/>,align:'vh'},{html:count,align:'v',className:'fs-18'}]
            }
        }
        else{
            layout={
                column:[
                    {show:renderIn === 'product',align:'vh',html:'تعداد در سبد خرید',className:'fs-12 color3B55A5'},
                    {
                        html:()=>(
                            <ProductCount 
                                value={count} 
                                onChange={(count) => {
                                    actionClass.changeCart({product,variantId,count,cartId,taxonId,CampaignId})
                                    onChange(count)
                                }} 
                            />
                        )
                    }
                ]
            }
        }
        return (<RVD layout={layout}/>)
    }
}