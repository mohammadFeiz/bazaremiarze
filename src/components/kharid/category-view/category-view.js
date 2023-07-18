import React, { Component } from 'react';
import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
import ProductCard from './../product-card/product-card';
import SearchBox from './../../../components/search-box/index';
import ForoosheVijeCard from '../forooshe-vije-card/forooshe-vije-card';
import BelexCard from '../belex-card/belex-card';
import NV3Report from '../nv3-report';
import appContext from '../../../app-context';
export default class CategoryView extends Component {
    static contextType = appContext;
    constructor(props) {
        super(props);
        this.state = { searchValue: '' }
    }
    search_layout(){
        let {searchValue} = this.state;
        return {html:<SearchBox value={searchValue} onChange={(searchValue)=>this.setState({searchValue})}/>}
    }
    banner_layout(){
        let {category} = this.props;
        let {src} = category;
        if(!src){return false}
        return {html:<img src={src} alt='' width='100%' />}
    }
    description_layout(){
        let {category} = this.props;
        let {description} = category;
        if(!description){return false}
        return {html:description,style:{textAlign:'right',padding:'0 12px'}}
    }
    product_layout(product,index){
        let {searchValue} = this.state;
        if (searchValue && product.name.indexOf(searchValue) === -1) { return false; }
        if(product.cartId === 'فروش ویژه'){
            return {html:<ForoosheVijeCard index={index} product={product} renderIn='category'/>,className:'of-visible'}    
        }
        if(product.cartId === 'بلکس'){
            return {html:<BelexCard index={index} product={product} renderIn='category'/>,className:'of-visible'}    
        }
        return {html:<ProductCard key={product.ItemCode} index={index} product={product} renderIn='category' cartId={product.cartId} isFirst={true} isLast={true} type='horizontal' />,className:'of-visible'}
    }
    nv3Report_layout(){
        let {cart} = this.context;
        let {category} = this.props;
        if(category.name !== 'نورواره 3'){return false}
        let cartTab = cart['نورواره 3']
        let total = 0;
        if(cartTab){
            let {getAmounts} = cartTab;
            total = getAmounts().total
        }
        return {
            html:<NV3Report amount={total}/>
        }
    }
    getProductsBySearch(products){
        let {searchValue} = this.state;
        return products.filter((o)=>{
            if (!searchValue){return true}
            return o.name.indexOf(searchValue) !== -1
        })
    }
    render() {
        let {category} = this.props;
        let { products = []} = category;
        return (
            <RVD
                layout={{
                    className:'theme-popup-bg',
                    column: [
                        this.search_layout(),
                        {
                            flex:1,className:'ofy-auto',
                            column:[
                                this.banner_layout(),
                                {size:12},
                                this.description_layout(),
                                {size:12},
                                this.nv3Report_layout(),
                                {size:12},
                                {
                                    gap: 12,
                                    column: this.getProductsBySearch(products).map((product,index)=>this.product_layout(product,index))
                                }
                            ]
                        },
                        {size:12}
                    ],
                }}
            />
        )
    }
}

