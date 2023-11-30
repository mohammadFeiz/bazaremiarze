import React, { Component } from "react";
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import imgph from './../../images/imgph.png';
import SplitNumber from './../../npm/aio-functions/split-number';
import Icon from "@mdi/react";
import { mdiClose, mdiPlus } from "@mdi/js";

export default class ProductCard extends Component {
    image_layout() {
        let { src = imgph, type = 'v' } = this.props;
        let imageStyle = type === 'v' ? { height: '100%' } : { width: '100%' };
        let size = type === 'v' ? 120 : 60;
        return { className: 'm-b-6', size, html: <img src={src} alt='' {...imageStyle} className='br-8' />, align: 'vh' }
    }
    name_layout() {
        let { name } = this.props;
        if (!name) { return false }
        return { html: name, className: `theme-dark-font-color fs-12 p-h-12 t-a-right` }
    }
    price_layout() {
        let { price, type = 'v' } = this.props;
        price = isNaN(price) ? 0 : price;
        if (price < 500) { price = 0 }
        let priceFontSize = type === 'v' ? 18 : 14;
        return {
            row: [
                { show: !price, html: 'در حال تامین', className: 'fs-12 bold', style: { color: 'red' }, align: 'v' },
                { show: !!price, html: () => SplitNumber(price), className: `theme-dark-font-color fs-${priceFontSize} bold`, align: 'v' },
                { size: 3 },
                { show: !!price, html: 'تومان', className: 'theme-light-font-color fs-10', align: 'v' }
            ]
        }
    }
    plus_layout() {
        let { price, selected, onSelect, id, loading, type = 'v' } = this.props;
        price = isNaN(price) ? 0 : price;
        if (price < 500) { price = 0 }
        if (!price && !selected) { return false }
        if (!onSelect) { return false }
        let padding = type === 'v' ? 8 : 0;
        return {
            html: <Icon path={selected ? mdiClose : mdiPlus} size={1} />,
            style: { border: loading ? undefined : '2px solid', color: selected ? 'orange' : '#3B55A5' },
            className: `br-100 p-${padding}`, align: 'vh', onClick: () => onSelect(id)
        }
    }
    id_layout() {
        let { id } = this.props;
        return { html: id }
    }
    render() {
        let { loading, name, type = 'v' } = this.props;
        if (!name) { return null }
        let style = { height: type === 'v' ? 260 : undefined, borderBottom: '1px solid #ddd', borderLeft: '1px solid #ddd' }
        let layout;
        if (type === 'v') {
            layout = {
                column: [
                    { size: 12 }, this.image_layout(), this.name_layout(), { flex: 1 },
                    { className: 'p-h-12', row: [this.price_layout(), { flex: 1 }, this.plus_layout()] },
                    { size: 12 }
                ]
            }
        }
        else {
            layout = {
                row: [
                    this.image_layout(),
                    {
                        flex: 1, className: 'p-6',
                        column: [this.name_layout(), { flex: 1 }, { row: [this.price_layout(), { flex: 1 }, this.plus_layout(),] },]
                    }
                ]
            }
        }
        return (<RVD loading={loading} layout={{ style, ...layout }} />)
    }
}