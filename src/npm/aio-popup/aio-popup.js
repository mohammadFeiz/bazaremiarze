import React, { Component, createRef } from 'react';
import { Align } from './../aio-functions/aio-functions';
import { Icon } from '@mdi/react';
import { mdiClose, mdiChevronRight, mdiChevronLeft, mdiCheckCircleOutline, mdiAlertOutline, mdiInformationOutline, mdiChevronDown } from '@mdi/js';
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import $ from 'jquery';
import './aio-popup.css';


export default class AIOPopup extends Component {
  constructor(props) {
    super(props);
    let { getActions = () => { } } = props
    this.state = {
      popups: [],
      confirm: false
    }
    getActions({
      removePopup: this.removePopup.bind(this),
      addPopup: this.addPopup.bind(this),
      setConfirm: this.setConfirm.bind(this),
    })
  }
  onChange(obj) {
    let { onChange = () => { } } = this.props;
    this.setState(obj, () => onChange({ ...this.state }))
  }
  setConfirm(obj) {
    let confirm;
    let { type } = obj;
    let icon = typeof obj.icon === 'function' ? icon() : icon;
    if (type) {
      let { text, subtext } = obj;
      let path, color;
      if (type === 'success') { path = mdiCheckCircleOutline; color = 'green'; }
      else if (type === 'error') { path = mdiClose; color = 'red'; }
      else if (type === 'warning') { path = mdiAlertOutline; color = 'orange'; }
      else if (type === 'info') { path = mdiInformationOutline; color = 'dodgerblue'; }
      let body = (
        <RVD
          layout={{
            className: 'p-12', gap: 12,
            column: [
              { show: icon !== false, html: icon ? icon : <Icon path={path} size={2} />, style: { color }, align: 'vh' },
              { html: text, style: { color }, align: 'vh' },
              { html: subtext, align: 'vh', className: 'fs-10' }
            ]
          }}
        />
      )
      confirm = { text: body, style: { height: 'fit-content', width: 360 }, buttons: [{ text: 'بستن' }], backClose: true }
    }
    else { confirm = obj; }
    this.onChange({ confirm })
  }
  addPopup(o) {
    let { popups } = this.state;
    let { id = ('popup' + Math.round(Math.random() * 1000000)) } = o;
    popups = popups.filter(({ _popupId }) => _popupId !== id);
    this.state.popups = popups;
    this.onChange({ popups: popups.concat({ ...o, _popupId: id }) })
  }
  async removePopup(id) {
    if (id === 'all') {
      this.state.popups = [];
      this.onChange({ popups: [] })
      return
    }
    let { popups } = this.state;
    let popup;
    if (id) { popup = popups.find((o) => o.id === id) }
    else { popup = popups[popups.length - 1] }
    if (!popup) { return }
    let { onClose = () => { }, _popupId } = popup;
    let res = await onClose();
    if (res === false) { return }
    $(`[data-popup-id=${_popupId}]`).animate({ left: '50%', top: '100%', height: '0%', width: '0%', opacity: 0 }, 300, () => {
      this.onChange({ popups: popups.filter((o) => o._popupId !== _popupId) })
    });

  }
  getPopups() {
    let { popups, confirm } = this.state;
    let { popupConfig = {} } = this.props;
    if (!popups.length) { return null }
    return popups.map(({ className, blur, type, rtl = this.props.rtl, style, onClose = () => { }, removePopup, title, header, closeType, body, _popupId, animate }, i) => {
      let props = {
        _popupId, animate,
        key: i, blur: confirm || i === popups.length - 2,
        ...popupConfig,
        className, blur, type, rtl, style, onClose, removePopup, title, header, closeType, body,
        index: i,
        onClose: () => this.removePopup(),
        rtl
      }
      return <Popup {...props} />
    })
  }
  render() {
    let { confirm } = this.state;
    let { rtl } = this.props;
    return (
      <>
        {this.getPopups()}
        {confirm && <Confirm rtl={rtl} {...confirm} onClose={() => this.setState({ confirm: false })} />}
      </>
    )
  }
}

class Popup extends Component {
  constructor(props) {
    super(props);
    this.dom = createRef();
    this.dui = 'a' + Math.random();
  }
  async onClose() {
    let { onClose } = this.props;
    onClose(this.dom.current)
  }
  header_layout() {
    let { title, header, rtl, closeType = 'close button' } = this.props;
    if (header === false) { return false }
    return {
      size: 48, className: 'aio-popup-header',
      row: [
        { show: closeType === 'back button' && this.props.onClose !== false, html: <Icon path={rtl ? mdiChevronRight : mdiChevronLeft} size={1} />, align: 'vh', onClick: () => this.onClose() },
        { show: closeType === 'back button' && this.props.onClose !== false, size: 6 },
        { flex: 1, html: title, align: 'v', className: 'aio-popup-title' },
        { show: !!header, html: () => <div style={{ display: 'flex', alignItems: 'center' }}>{header()}</div> },
        { show: closeType === 'close button' && this.props.onClose !== false, size: 36, html: <Icon path={mdiClose} size={0.8} />, align: 'vh', onClick: () => this.onClose() }
      ]
    }
  }
  getClassName() {
    let { type, blur, className: cls } = this.props;
    let className = 'aio-popup-container';
    if (cls) { className += className ? (' ' + cls) : '' }
    if (blur) { className += ' aio-popup-blur' }
    if (type === 'fullscreen') { className += ' fullscreen' }
    if (type === 'bottom') { className += ' bottom-popup' }
    return className
  }
  backClick(e) {
    let target = $(e.target);
    if (target.hasClass(this.dui)) { return }
    let parents = target.parents('.aio-popup');
    if (parents.hasClass(this.dui)) { return }
    let { removePopup, onClose = () => removePopup(), backClose } = this.props;
    if (onClose === false) { return }
    if (!backClose) { return }
    onClose();
  }
  componentDidMount() {
    let { animate } = this.props;
    if (animate !== false) {
      $(this.dom.current).animate({ height: '100%', width: '100%', left: '0%', top: '0%', opacity: 1 }, 300);
    }

  }
  render() {
    let { rtl, style, body, _popupId, animate } = this.props;
    let props = {
      className: this.getClassName(),
      onClick: (e) => this.backClick(e),
      'data-popup-id': _popupId,
    }
    let Style;
    if (animate === false) {
      Style = {
        position: 'absolute', left: '0%', top: '0%', height: '100%', width: '100%',
        opacity: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }
    }
    else {
      Style = {
        position: 'absolute', left: '50%', top: '100%', height: '0%', width: '0%',
        opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }
    }
    return (
      <div {...props}>
        <div
          ref={this.dom}
          style={Style}
        >
          <RVD
            layout={{
              className: 'aio-popup' + (rtl ? ' rtl' : ' ltr') + (' ' + this.dui),
              style: { flex: 'none', ...style, },
              column: [
                this.header_layout(),
                { flex: 1, html: <div className='aio-popup-body'>{body()}</div> }
              ]
            }}
          />
        </div>
      </div>
    )
  }
}


class Confirm extends Component {
  constructor(props) {
    super(props);
    this.dui = 'a' + Math.random();
  }
  header_layout() {
    let { onClose, title } = this.props;
    if (!title) { return false }
    return {
      size: 48, className: 'aio-popup-header',
      row: [
        { flex: 1, html: title, align: 'v', className: 'aio-popup-title' },
        { size: 48, html: <Icon path={mdiClose} size={0.8} />, align: 'vh', attrs: { onClick: () => onClose() } }
      ]
    }
  }
  body_layout() {
    let { text } = this.props;
    return { flex: 1, html: text, className: 'aio-popup-body ofy-auto' }
  }
  onSubmit() {
    let { onClose, onSubmit } = this.props;
    onSubmit();
    onClose();
  }
  footer_layout() {
    let { buttons, onClose = () => { } } = this.props;
    return {
      gap: 12,
      size: 48,
      align: 'v',
      style: { padding: '0 12px' },
      className: 'aio-popup-confirm-footer',
      row: buttons.map(({ text, onClick = () => { } }) => {
        return {
          html: (
            <button
              className='aio-popup-footer-button'
              onClick={() => { onClick(); onClose() }}
            >{text}</button>
          )
        }
      })
    }
  }
  backClick(e) {
    let { onClose, backClose } = this.props;
    if (!backClose) { return }
    let target = $(e.target);
    if (target.hasClass(this.dui)) { return }
    let parents = target.parents('.aio-popup');
    if (parents.hasClass(this.dui)) { return }

    onClose();
  }
  render() {
    let { style = { width: 400, height: 300 }, rtl } = this.props;
    return (
      <div className='aio-popup-container' onClick={(e) => this.backClick(e)}>
        <RVD layout={{ className: 'aio-popup aio-confirm' + (' ' + this.dui), style: { flex: 'none', direction: rtl ? 'rtl' : 'ltr', ...style }, column: [this.header_layout(), this.body_layout(), this.footer_layout()] }} />
      </div>
    )
  }
}

export class Popover extends Component {
  constructor(props) {
    super(props);
    this.dom = createRef();
  }
  handleClose(e) {
    let { id, onClose = () => { } } = this.props;
    let target = $(e.target);
    let datauniqid = target.attr('datauniqid')
    if (datauniqid === id) { return }
    if (target.parents(`[data-uniq-id=${id}]`).length) { return }
    onClose()
  }
  componentDidMount() {
    this.update($(this.dom.current));
    if (this.props.backdrop === false) {
      $(window).on('click', (e) => this.handleClose(e))
    }
  }
  update(popup) {
    let { getTarget, popoverSide } = this.props;
    if (popoverSide) { return }
    let target = getTarget();
    if (!target || !target.length) { return }
    var { rtl, openRelatedTo, animate, fitHorizontal, attrs = {}, fixPopupPosition = (o) => o, popupWidth } = this.props;
    Align(popup, target, { fixStyle: fixPopupPosition, pageSelector: openRelatedTo, animate, fitHorizontal, style: attrs.style, rtl })
    popup.focus();
  }
  getClassName() {
    let { attrs = {}, className } = this.props;
    let { className: popupClassName } = attrs;
    let cls = 'aio-popover';
    if (popupClassName) { cls += ' ' + popupClassName }
    else if (className) { cls += ' ' + className }
    return cls;
  }
  getBackClassName() {
    let { backdropAttrs = {}, popoverSide } = this.props;
    let { className: backdropClassName } = backdropAttrs;
    let className = 'aio-popover-backdrop';
    if (backdropClassName) { className += ' ' + backdropClassName }
    if (popoverSide === 'center') { className += ' aio-popover-center' }
    if (popoverSide === 'left') { className += ' aio-popover-left' }
    if (popoverSide === 'right') { className += ' aio-popover-right' }
    if (popoverSide === 'top') { className += ' aio-popover-top' }
    if (popoverSide === 'bottom') { className += ' aio-popover-bottom' }
    if (popoverSide === 'top right') { className += ' aio-popover-topright' }
    if (popoverSide === 'top left') { className += ' aio-popover-topleft' }
    if (popoverSide === 'bottom right') { className += ' aio-popover-bottomright' }
    if (popoverSide === 'bottom left') { className += ' aio-popover-bottomleft' }
    return className;
  }
  //start
  render() {
    var { attrs = {}, body, backdropAttrs = {}, backdrop, id } = this.props;
    let props = {
      className: this.getBackClassName(),
      style: backdropAttrs.style,
      onClick: (e) => this.handleClose(e),
    }
    let popOver = (
      <div {...attrs} ref={this.dom} data-uniq-id={id} className={this.getClassName()}>
        {body()}
      </div>
    )
    if (backdrop === false) { return popOver; }
    return <div {...props}>{popOver}</div>;
  }
}