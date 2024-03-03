import React, { Component, useContext, useEffect, useState } from "react";
import { Icon } from '@mdi/react';
import { mdiCart, mdiMagnify } from "@mdi/js";
import RVD from './../npm/react-virtual-dom/react-virtual-dom';
import AIOInput from "../npm/aio-input/aio-input";
import appContext from "./../app-context";
export default function Header({ navId, type, popupId }) {
  let { actionClass, cart } = useContext(appContext)
  let [cartLength, setCartLength] = useState(0)
  async function updateLength() {
    let cartLength = await actionClass.getCartLength();
    setCartLength(cartLength)
  }
  useEffect(() => {
    updateLength()
  }, [cart])
  function cart_layout() {
    if (type === 'page') {
      if (['kharid'].indexOf(navId) === -1) { return false }
    }
    if (type === 'popup') {
      if (['product', 'search', 'category-view'].indexOf(popupId) === -1) { return false }
    }
    return {
      html: (
        <AIOInput
          type="button"
          className='header-icon'
          style={{ background: "none", color: '#605E5C' }}
          text={
            <>
              <Icon path={mdiCart} size={0.8} />
              {cartLength > 0 ? <div className='badge-2'>{cartLength}</div> : undefined}
            </>
          }
          onClick={() => actionClass.openPopup('cart')}
        />
      )
    }
  }
  function buySearch_layout() {
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
  return (
    <RVD
      layout={{
        style: { paddingLeft: 12 },
        row: [
          { flex: 1 },
          //this.buySearch_layout(),
          cart_layout(),
        ]
      }}
    />
  )
}