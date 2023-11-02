import React, { Component } from 'react';
import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
import SearchBox from './../../../components/search-box/index';
import appContext from '../../../app-context';
//props
//billboard
//description
//products
//renderProductCard function
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
        let {billboard} = this.props;
        if(!billboard){return false}
        return {html:<img src={billboard} alt='' width='100%' />}
    }
    description_layout(){
        let {description} = this.props;
        if(!description){return false}
        return {html:description,style:{textAlign:'right',padding:'0 12px'}}
    }
    product_layout(product,index){
        let {searchValue} = this.state;
        let {renderProductCard} = this.props;
        if (searchValue && product.name.indexOf(searchValue) === -1) { return false; }
        return {html:renderProductCard(product,index),className:'of-visible'}
    }
    getProductsBySearch(products){
        let {searchValue} = this.state;
        return products.filter((o)=>{
            if (!searchValue){return true}
            return o.name.indexOf(searchValue) !== -1
        })
    }
    render() {
        let {products = []} = this.props;
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

