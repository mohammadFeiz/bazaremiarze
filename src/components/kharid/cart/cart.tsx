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
  let [factor,setFactor] = useState<React.ReactNode>()
  let [items,setItems] = useState<any[]>([])
  let tabs = Object.keys(cart);
  useEffect(()=>{
    update(true)
  },[])
  useEffect(()=> {
    update(false)
  },[cart])
  async function update(initial) {
    let activeTabId:false | string = false;
    if(initial){
      if(props.cartId){activeTabId = props.cartId}
      else{activeTabId = tabs[0] || false}
    }
    if(activeTabId !== false && !cart[activeTabId]){activeTabId = false}
    setActiveTabId(activeTabId);
    if(activeTabId){
      let factor = await Shop[activeTabId].renderCartFactor();
      let items = await Shop[activeTabId].renderCartItems('cart');
      setFactor(factor);
      setItems(items);
    }
    else {
      setFactor(false)
    }
  }
  function getBadge(option:string){
    let cartTab = cart[option]
    let length:number;
    if(cartTab.type === 'taxon'){length = Object.keys(cartTab.taxons).length}
    else if(cartTab.type === 'Bundle'){length = Object.keys(cartTab.taxons).length}
    else{length = Object.keys(cartTab.products).length}
    return <div className='tab-badge'>{length}</div>
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
    if (!items.length) { return empty_layout() }
    return { flex: 1, className: 'ofy-auto', gap: 12, column: items.map((cartItem) => { return { html: cartItem } }) }
  }
  function payment_layout() {
    if (!factor) { return false }
    return { html: factor }
  }
  return (
    <RVD
      layout={{
        flex: 1, className: 'theme-popup-bg',
        column: [tabs_layout(), products_layout(), payment_layout()]
      }}
    />
  )
}
