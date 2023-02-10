import React, { Component } from 'react';
import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
import ProductCard from './../product-card/product-card';
import SearchBox from './../../../components/search-box/index';
import ForoosheVijeCard from '../forooshe-vije-card/forooshe-vije-card';
import BelexCard from '../belex-card/belex-card';
import NV3Card from '../nv3-card/nv3-card';
import NV3Report from '../nv3-report';
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
    description_layout(){
        let {category} = this.props;
        let {description} = category;
        if(!description){return false}
        return {html:description,style:{textAlign:'right',padding:'0 12px'}}
    }
    product_layout(product,index){
        let {searchValue} = this.state;
        let {category} = this.props;
        if (searchValue && product.name.indexOf(searchValue) === -1) { return false; }
        if(category.id === 'nv3'){
            return {html:<NV3Card index={index} product={product}/>,className:'of-visible'}    
        }
        if(product.type === 'forooshe_vije'){
            return {html:<ForoosheVijeCard index={index} product={product}/>,className:'of-visible'}    
        }
        if(product.type === 'belex'){
            return {html:<BelexCard index={index} product={product}/>,className:'of-visible'}    
        }
        return {html:<ProductCard index={index} product={product} isFirst={true} isLast={true} type='horizontal' />,className:'of-visible'}
    }
    nv3Report_layout(){
        let {category} = this.props;
        if(category.name !== 'نورواره 3'){return false}
        return {
            html:<NV3Report/>
        }
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

