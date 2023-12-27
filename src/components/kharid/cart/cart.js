import React, { Component } from 'react';
import appContext from './../../../app-context';
import RVD from './../../../npm/react-virtual-dom/react-virtual-dom';
import AIOInput from '../../../npm/aio-input/aio-input';
import noItemSrc from './../../../images/not-found.png';
export default class Cart extends Component {
  static contextType = appContext;
  constructor(props) {
    super(props);
    this.state = { activeTabId: false, tabs: [] }
  }
  componentDidMount() {
    this.update()
  }
  componentDidUpdate() {
    let { cart } = this.context;
    let { activeTabId, tabs } = this.state;
    let emptyCartItems = tabs.filter((o) => {
      return !Object.keys(cart[o].items).length
    })
    if (emptyCartItems.length) {
      this.update();
      return;
    }
    if (tabs.length && activeTabId !== false && tabs.indexOf(activeTabId) === -1) {
      this.update()
    }
  }
  update() {
    let { cart } = this.context;
    let { cartId } = this.props;
    let tabs = Object.keys(cart).filter((o) => {
      return !!Object.keys(cart[o].items).length
    });
    let activeTabId = cartId || tabs[0] || false;
    this.setState({ activeTabId, tabs })
  }
  tabs_layout() {
    let { cart, actionClass } = this.context;
    let { activeTabId, tabs } = this.state;
    return {
      html: (
        <AIOInput
          type='tabs'
          options={tabs}
          style={{ marginBottom: 12, fontSize: 12 }}
          value={activeTabId}
          optionAfter={(option) => <div className='tab-badge'>{Object.keys(cart[option].items).length}</div>}
          optionText={(option) => actionClass.getShopById(option).name}
          optionValue='option'
          onChange={(activeTabId) => this.setState({ activeTabId })}
        />
      )
    }
  }
  empty_layout() {
    return {
      style: { background: '#eee', opacity: 0.5 },
      flex: 1, align: 'vh',
      column: [
        { html: <img src={noItemSrc} alt='' width='128' height='128' /> },
        { html: 'سبد خرید شما خالی است', style: { color: '#858a95' } },
        { size: 60 }
      ]
    }
  }
  products_layout() {
    let { activeTabId } = this.state;
    let { actionClass } = this.context;
    if (!activeTabId) { return this.empty_layout() }
    let productCards = actionClass.getShopById(activeTabId).getCartProducts('cart');
    if (!productCards.length) { return this.empty_layout() }
    return { flex: 1, className: 'ofy-auto', gap: 12, column: productCards.map((card) => { return { html: card } }) }
  }
  payment_layout() {
    let { activeTabId } = this.state;
    if (!activeTabId) { return false }
    let { actionClass } = this.context;
    let { renderCartFactor } = actionClass.getShopById(activeTabId);
    return { html: renderCartFactor() }
  }
  render() {
    return (
      <RVD
        layout={{
          flex: 1, className: 'theme-popup-bg',
          column: [this.tabs_layout(), this.products_layout(), this.payment_layout()]
        }}
      />
    )
  }
}
