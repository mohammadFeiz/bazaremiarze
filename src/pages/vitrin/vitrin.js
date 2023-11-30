import React, { Component } from "react";
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import Landing from "./landing";
import AIOInput from "../../npm/aio-input/aio-input";
import AIOPopup from "../../npm/aio-popup/aio-popup";
import Search from './search';
import Products from "./products";
import getSvg from "./getSvg";
import appContext from "../../app-context";
import VitrinContext from "./context";
import Icon from "@mdi/react";
import vbsrc from './../../images/vitrin-bazargah.png';
import { mdiDotsVertical } from "@mdi/js";
import './vitrin.css';
export default class Vitrin extends Component {
    static contextType = appContext
    constructor(props) {
        super(props);
        this.popup = new AIOPopup();
        this.state = {viewProducts: 'list'}
    }
    updateSelectedProducts(id, product) {
        let { apis, vitrin } = this.context,{ selectedProducts } = vitrin;
        let state = !!selectedProducts[id];
        apis.request({
            api: 'vitrin.v_updateMyVitrin',parameter: { id, state, product },
            onCatch: (error) => {
                try {
                    let { message, Message } = error.response.data;
                    return message || Message
                }
                catch {return 'خطای 1133'}
            },
            onSuccess: () => {
                let { vitrin } = this.context;
                let { selectedProducts } = vitrin;
                let newSelectedProducts;
                if (!state) { newSelectedProducts = { ...selectedProducts, [id]: product } }
                else {
                    newSelectedProducts = {}
                    for (let prop in selectedProducts) {
                        if (prop !== id) { newSelectedProducts[prop] = selectedProducts[prop] }
                    }
                }
                vitrin.update({ selectedProducts: newSelectedProducts })
            }
        })
    }
    openPopup(name, parameter) {
        let { addModal, removeModal } = this.popup;
        if (name === 1) {
            addModal({id: name, header: { title: 'بروزرسانی ویترین من' },body: { render: () => <VitrinPage1 /> }})
        }
        else if (name === 'search') {
            addModal({
                id: name,
                header: { title: 'افزودن محصول به ویترین من', attrs: { className: 'vitrin-search-popup-header' } },
                body: { render: () => (<Search onClose={() => removeModal()} isFirstTime={parameter} />) }
            })
        }
    }
    start() {
        let { apis, vitrin } = this.context;
        apis.request({
            api: 'vitrin.v_setStarted', parameter: true, description: 'شروع ویترین',
            onSuccess: () => vitrin.update({ started: true }, () => this.openPopup('search', true))
        })
    }
    SetState(obj) { this.setState(obj) }
    getContext() {
        let { apis, vitrin, backOffice } = this.context;
        return {
            ...this.state, apis, vitrin, backOffice,
            SetState: this.SetState.bind(this),
            openPopup: this.openPopup.bind(this),
            removeModal: (id) => this.popup.removeModal(id),
            updateSelectedProducts: this.updateSelectedProducts.bind(this)
        }
    }
    render() {
        let { vitrin } = this.context,{ started } = vitrin;
        return (
            <VitrinContext.Provider value={this.getContext()}>
                {started === true?<VitrinPage1 />:<Landing/>}
                {this.popup.render()}
            </VitrinContext.Provider>
        )
    }
}
class VitrinPage1 extends Component {
    static contextType = VitrinContext;
    state = {searchValue: ''}
    count_layout() {
        let { vitrin, viewProducts, SetState } = this.context;
        let { selectedProducts = {} } = vitrin;
        return {
            align: 'vh', className: 'p-12',
            column: [
                {
                    className: 'w-144 h-144 br-6', style: { border: '1px solid #eee' },align:'v',
                    column: [
                        { html: getSvg('svg1'), align: 'vh' },
                        { size: 6 },
                        { html: `${Object.keys(selectedProducts).length} کالا`, align: 'vh', className: 'bold fs-14 theme-dark-font-color', size: 24 },
                        { html: 'در ویترین شما', className: 'theme-medium-font-color fs-10', align: 'h' }
                    ]
                },
                {
                    style: { position: 'absolute', left: 6, top: 6 },
                    html: (
                        <AIOInput
                            type='select' caret={false} optionCheckIcon={{background: '#3B55A5',color: '#3B55A5'}}
                            text={<Icon path={mdiDotsVertical} size={1} />}
                            options={[
                                { text: 'نمایش به صورت لیست', checked: viewProducts === 'list', onClick: () => SetState({ viewProducts: viewProducts === 'list' ? 'tile' : 'list' }) }
                            ]}
                        />
                    )
                }
            ]
        }
    }
    bazargah_billboard_layout() {
        return {html: <img src={vbsrc} width='100%' alt='' />, align: 'vh', className: 'm-h-12'}
    }
    toolbar_layout() {
        let { openPopup, vitrin } = this.context,{ selectedProducts } = vitrin;
        return {
            className: 'br-6 p-12 m-b-12 of-visible', style: { background: '#fff' },
            row: [
                { html: getSvg('svg2'), style: { background: '#3b55a5', padding: 3, width: 36, height: 36, borderRadius: '100%' }, align: 'vh' },
                { size: 12 },
                { flex: 1, className: 'fs-14 bold', html: 'ویترین من', align: 'v' },
                { show: !!selectedProducts, html: (<button onClick={() => openPopup('search')} className='button-2'>افزودن محصول</button>) }
            ]
        }
    }

    products_layout() {
        let { vitrin } = this.context,{ selectedProducts } = vitrin;
        let products = selectedProducts ? Object.keys(selectedProducts).map((id) => selectedProducts[id]) : undefined
        return { html: <Products products={products} /> }
    }
    render() {
        return (
            <RVD
                layout={{
                    className: 'theme-popup-bg ofy-auto m-b-24', flex: 1,
                    column: [this.count_layout(),this.bazargah_billboard_layout(),this.toolbar_layout(),this.products_layout()]
                }}
            />
        )
    }
}