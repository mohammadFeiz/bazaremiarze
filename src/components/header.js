import React, { Component } from "react";
import { Icon } from '@mdi/react';
import { mdiCart, mdiMagnify } from "@mdi/js";
import RVD from './../npm/react-virtual-dom/react-virtual-dom';
import AIOInput from "../npm/aio-input/aio-input";
import appContext from "./../app-context";
export default class Header extends Component {
    static contextType = appContext;
    cart_layout() {
      let { actionClass } = this.context;
      let { navId, type, popupId } = this.props;
      if (type === 'page') {
        if (['kharid'].indexOf(navId) === -1) { return false }
      }
      if (type === 'popup') {
        if (['product', 'search', 'category-view'].indexOf(popupId) === -1) { return false }
      }
      let length = actionClass.getCartLength();
      return {
        html: (
          <AIOInput
            type="button"
            className='header-icon'
            style={{ background: "none", color: '#605E5C' }}
            text={
              <>
                <Icon path={mdiCart} size={0.8} />
                {length > 0 ? <div className='badge-2'>{length}</div> : undefined}
              </>
            }
            onClick={() => actionClass.openPopup('cart')}
          />
        )
      }
    }
    buySearch_layout() {
      let { actionClass } = this.context;
      let { navId, type } = this.props;
      if (type !== 'page' || navId !== 'kharid') { return false }
      return {
        html: (
          <AIOInput
            type="button" center={true}
            className='header-icon'
            style={{ background: "none", color: '#605E5C' }}
            text={<Icon path={mdiMagnify} size={0.7} />}
            onClick={() => actionClass.openPopup('search')}
          />
        )
      }
    }
    render() {
      return (
        <RVD
          layout={{
            style: { paddingLeft: 12 },
            row: [
              { flex: 1 },
              //this.buySearch_layout(),
              this.cart_layout(),
            ]
          }}
        />
      )
    }
  }