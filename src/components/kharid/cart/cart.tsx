import React, { useContext, useEffect, useState } from 'react';
import appContext from '../../../app-context';
import RVD from '../../../npm/react-virtual-dom/react-virtual-dom';
import AIOInput from '../../../npm/aio-input/aio-input';
import noItemSrc from './../../../images/not-found.png';
import { I_app_state } from '../../../types';
type I_Cart = {cartId:string}
export default function Cart(props:I_Cart) {
  let context:I_app_state = useContext(appContext);
  let {cartId} = props;
  let { cart,Shop } = context;
  let [activeTabId,setActiveTabId] = useState<string|false>(false)
  let [tabs,setTabs] = useState<string[]>([])
  useEffect(()=>update(),[])
  useEffect(()=> {
    let { activeTabId, tabs } = this.state;
    let emptyCartItems = tabs.filter((o) => {
      let cartTab = cart[o] || {items:{}} 
      return !Object.keys(cartTab.items).length
    })
    if (emptyCartItems.length) {
      update();
      return;
    }
    if (tabs.length && activeTabId !== false && tabs.indexOf(activeTabId) === -1) {
      update()
    }
  },[cart,activeTabId])
  function update() {
    let tabs = Object.keys(cart).filter((o) => {
      return !!Object.keys(cart[o].items).length
    });
    let activeTabId = cartId || tabs[0] || false;
    this.setState({ activeTabId, tabs })
  }
  function getBadge(option:string){
    let cartTab = cart[option] || {items:{}}
    return <div className='tab-badge'>{Object.keys(cartTab.items).length}</div>
  }
  function tabs_layout() {
    if(!tabs.length){return false}
    return {
      html: (
        <AIOInput
          type='tabs'
          options={tabs}
          style={{ marginBottom: 12, fontSize: 12 }}
          value={activeTabId}
          optionAfter={(option) => getBadge(option)}
          optionText={(option) => Shop[option].name}
          optionValue='option'
          onChange={(activeTabId:string) => setActiveTabId(activeTabId)}
        />
      )
    }
  }
  function empty_layout() {
    return {
      style: { background: '#eee', opacity: 0.5 },
      flex: 1, align: 'vh',
      column: [
        { html: <img src={noItemSrc as string} alt='' width='128' height='128' /> },
        { html: 'سبد خرید شما خالی است', style: { color: '#858a95' } },
        { size: 60 }
      ]
    }
  }
  function products_layout() {
    if (!activeTabId) { return empty_layout() }
    let productCards = Shop[activeTabId].getCartProducts('cart');
    if (!productCards.length) { return empty_layout() }
    return { flex: 1, className: 'ofy-auto', gap: 12, column: productCards.map((card) => { return { html: card } }) }
  }
  function payment_layout() {
    if (!activeTabId) { return false }
    let { renderCartFactor } = Shop[activeTabId];
    return { html: renderCartFactor() }
  }
  return (
    <RVD
      layout={{
        flex: 1, className: 'theme-popup-bg',
        column: [this.tabs_layout(), this.products_layout(), this.payment_layout()]
      }}
    />
  )
}
