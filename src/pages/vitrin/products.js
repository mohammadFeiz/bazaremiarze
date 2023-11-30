import React, { Component } from "react";
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import ProductCard from "./product-card";
import VitrinContext from "./context";
function getMockProducts(){return new Array(6).fill(0).map(()=>{return {"name": "لامپ ال ای دی شمعی 7 وات پایه E14", "price": 257840}})}
export default class Products extends Component {
    static contextType = VitrinContext;
    render() {
        let { viewProducts } = this.context
        let { products } = this.props;
        let Products;
        if (!products) { Products = getMockProducts() }
        else {
            Products = products;
            if (viewProducts === 'tile' && Products.length % 2 !== 0) { Products.push({}) }
        }
        let list = Products.map((o) => {
            let { vitrin, updateSelectedProducts } = this.context;
            let { selectedProducts = {} } = vitrin;
            let { name, src, price, id } = o;
            let selected = !!selectedProducts[id];
            let props = { name, src, price, selected, type: viewProducts === 'tile' ? 'v' : 'h', id, onSelect: (id) => updateSelectedProducts(id, o) };
            return { flex: 1, html: <ProductCard {...props} loading={!products} /> }
        })
        let layout;
        if (viewProducts === 'tile') { layout = { className: 'ofy-auto', grid: list, gridCols: 2 } }
        else { layout = { className: 'ofy-auto', column: list } }
        return (<RVD layout={layout} />)
    }
}

