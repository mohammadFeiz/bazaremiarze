import React, { Component } from 'react';
import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
import ProductCard from './../product-card/product-card';
import SearchBox from './../../../components/search-box/index';
export default class CategoryView extends Component {
    constructor(props) {
        super(props);
        this.state = { searchValue: '' }
    }
    render() {
        let {category} = this.props;
        let { products,src} = category;
        let {searchValue} = this.state;
        return (
            <RVD
                layout={{
                    className:'main-bg',style:{height:'100%',overflow:'hidden'},
                    column: [
                        {html:<SearchBox value={searchValue} onChange={(searchValue)=>this.setState({searchValue})}/>},
                        {
                            flex:1,scroll: "v",
                            column:[
                                {show: !!src,style:{marginBottom:12},html: () => <img src={src} alt='' width='100%' />},
                                {size:12},
                                {
                                    gap: 1,
                                    column: products.map((product, i) => {
                                        let { searchValue } = this.state;
                                        if (searchValue && product.name.indexOf(searchValue) === -1) { return false; }
                                        return {html:<ProductCard product={product} isFirst={i === 0} isLast={i === products.length - 1} type='horizontal' />,style:{overflow:'visible'}}
                                    })
                                }
                            ]
                        }
                    ],
                }}
            />
        )
    }
}