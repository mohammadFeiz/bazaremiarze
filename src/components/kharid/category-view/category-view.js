import React, { Component } from 'react';
import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
import ProductCard from './../product-card/product-card';
import SearchBox from './../../../components/search-box/index';
export default class CategoryView extends Component {
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
    product_layout(product,index){
        let {searchValue} = this.state;
        if (searchValue && product.name.indexOf(searchValue) === -1) { return false; }
        return {html:<ProductCard index={index} product={product} isFirst={true} isLast={true} type='horizontal' />,of:'visible'}
    }
    render() {
        let {category} = this.props;
        let { products} = category;
        return (
            <RVD
                layout={{
                    className:'popup-bg',
                    column: [
                        this.search_layout(),
                        {
                            flex:1,className:'ofy-auto',
                            column:[
                                this.banner_layout(),
                                {size:12},
                                {
                                    gap: 12,
                                    column: products.map((product,index)=>this.product_layout(product,index))
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