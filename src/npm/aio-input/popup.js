import React, { Component, createRef } from 'react';
import { Popover } from './../aio-popup/aio-popup';
import AIContext from './context';
import $ from 'jquery';
export default class Popup extends Component {
    static contextType = AIContext;
    constructor(props) {
        super(props);
        this.dom = createRef();
    }
    renderPopOver(content) {
        let {
            toggle, openRelatedTo, datauniqid,fitHorizontal,rtl, animate, fixPopupPosition, popoverSide, popupHeader, popupFooter,backdrop
        } = this.context;
        let { parentDom } = this.props;
        let props = {
            backdrop,
            popoverSide, rtl, animate, openRelatedTo, fixPopupPosition, className: `aio-input-popover${rtl ? ' aio-input-popover-rtl' : ''}`, id: datauniqid,
            fitHorizontal,
            getTarget: () => $(parentDom.current),
            onClose: () => toggle(false),
            backdropAttrs: { className: 'aio-input-popup-container' },
            attrs: {
                //onKeyDown: (e) => keyDown(e, $(this.dom.current)),...popupAttrs
            },
            body: () => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {popupHeader && typeof popupHeader === 'function' ? popupHeader() : popupHeader}
                    {content}
                    {popupFooter && typeof popupFooter === 'function' ? popupFooter() : popupFooter}
                </div>
            )
        }
        return <Popover {...props} />
    }
    render() {
        let { popOver } = this.props;
        popOver = popOver();
        if(popOver === null){return null}
        return this.renderPopOver(popOver)
    }
}

