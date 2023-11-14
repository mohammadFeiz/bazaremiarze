import React, { Component } from "react";
import { Icon } from '@mdi/react';
import { mdiCart, mdiPower, mdiMagnify } from "@mdi/js";
import RVD from './../npm/react-virtual-dom/react-virtual-dom';
import AIOInput from "../npm/aio-input/aio-input";
import appContext from "./../app-context";
export default class Header extends Component {
    static contextType = appContext;
    cart_layout() {
      let { openPopup } = this.context;
      let { navId, type, popupId } = this.props;
      if (type === 'page') {
        if (['kharid'].indexOf(navId) === -1) { return false }
      }
      if (type === 'popup') {
        if (['product', 'search', 'category-view'].indexOf(popupId) === -1) { return false }
      }
      let { getCartLength } = this.context;
      let length = getCartLength();
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
            onClick={() => openPopup('cart')}
          />
        )
      }
    }
    // bazargahPower_layout() {
    //   let { bazargahPower,bazargahPowerStorage } = this.context;
    //   let { navId, type } = this.props;
    //   if (type !== 'page' || navId !== 'bazargah' || !bazargahPower) { return false }
    //   return {
    //     html: (
    //       <AIOInput
    //         type="button" center={true}
    //         className='header-icon'
    //         style={{ background: "none", color: '#605E5C' }}
    //         text={<Icon path={mdiPower} size={0.7} />}
    //         onClick={()=>bazargahPowerStorage('set')}
    //       />
    //     )
    //   }
    // }
    buySearch_layout() {
      let { openPopup } = this.context;
      let { navId, type } = this.props;
      if (type !== 'page' || navId !== 'kharid') { return false }
      return {
        html: (
          <AIOInput
            type="button" center={true}
            className='header-icon'
            style={{ background: "none", color: '#605E5C' }}
            text={<Icon path={mdiMagnify} size={0.7} />}
            onClick={() => openPopup('search')}
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
              //this.bazargahPower_layout(),
            ]
          }}
        />
      )
    }
  }