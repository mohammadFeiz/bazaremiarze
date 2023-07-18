import React, { Component } from "react";
import haraj1 from './../../images/haraj1.png';
import haraj2 from './../../images/haraj2.png';
import haraj3 from './../../images/haraj3.png';
import haraj4 from './../../images/haraj4.png';
import haraj5 from './../../images/haraj5.png';
import SplitNumber from "../../npm/aio-functions/split-number";
//pages//////////////////////////////////
import Home from "./../home/index";
import Buy from "./../buy/index";
import Bazargah from "../bazargah/bazargah";
import Profile from "./../profile/profile";
import Vitrin from './../../pages/vitrin/vitrin';
import BackOffice from './../../back-office-panel';

//popups/////////////////////////////////////
import OrdersHistory from "./../../components/kharid/orders-history/orders-history";
import SabteGarantiJadid from "../../components/garanti/sabte-garanti-jadid/sabte-garanti-jadid";
import Shipping from './../../components/kharid/shipping/shipping';
import Wallet from "../../popups/wallet/wallet";
import TanzimateKifePool from "../../components/kife-pool/tanzimate-kife-pool/tanzimate-kife-pool";
import Cart from "./../../components/kharid/cart/cart";
import Sefareshe_Ersal_Shode_Baraye_Vizitor from "./../../components/kharid/sefareshe-ersal-shode-baraye-vizitor/sefareshe-ersal-shode-baraye-vizitor";
import JoziateDarkhastHayeGaranti from "./../../components/garanti/joziate-darkhast-haye-garanti/joziate-darkhast-haye-garanti";
import OrderPopup from "./../../components/kharid/order-popup/order-popup";
import PasswordPopup from "../../components/password-popup/password-popup";
import CountPopup from "../../components/kharid/product-count/count-popup";
import PriceList from "../../popups/price-list/price-list";

//npm////////////////////////////////////////
import { Icon } from '@mdi/react';
import { mdiShieldCheck, mdiCellphoneMarker, mdiClipboardList, mdiExitToApp, mdiCart, mdiBell, mdiPower, mdiMagnify, mdiPalette, mdiOpacity, mdiClose, mdiSecurity } from "@mdi/js";
import RSA from './../../npm/react-super-app/react-super-app';
import RVD from './../../interfaces/react-virtual-dom/react-virtual-dom';
import AIOService from './../../npm/aio-service/aio-service';
import AIOButton from './../../interfaces/aio-button/aio-button';
import AIOStorage from './../../npm/aio-storage/aio-storage';

//apis//////////////////////////////////////////////
import kharidApis from "../../apis/kharid-apis";
import bazargahApis, { bazargahMock } from './../../apis/bazargah-apis';
import walletApis from './../../apis/wallet-apis';
import gardooneApis from './../../apis/gardoone-apis';
import guarantiApis from './../../apis/guaranti-apis';
import vitrinApis from './../../apis/vitrin-apis';
import { vitrinMock } from "./../../apis/vitrin-apis";


import getSvg from "../../utils/getSvg";
import ProductCard from "../../components/kharid/product-card/product-card";
import BelexCard from "../../components/kharid/belex-card/belex-card";
import ForoosheVijeCard from "../../components/kharid/forooshe-vije-card/forooshe-vije-card";
import Logo1 from './../../images/logo1.png';
import Pricing from "./../../pricing";
import appContext from "../../app-context";
import dateCalculator from "../../utils/date-calculator";
import Search from "./../../components/kharid/search/search";
import Product from "./../../components/kharid/product/product";
import CategoryView from "./../../components/kharid/category-view/category-view";
import SabteGarantiJadidBaJoziat from "../../components/garanti/sabte-garanti-jadid-ba-joziat/sabte-garanti-jadid-ba-joziat";
import PayameSabteGaranti from "../../components/garanti/payame-sabte-garanti/payame-sabte-garanti";
import SignalR from '../../singalR/signalR';
import Splash from "../../components/spalsh/splash";
import "./index.css";
export default class Main extends Component {
  constructor(props) {
    super(props);
    let wrl = window.location.href;
    let status = wrl.indexOf('status=');
    if (status !== -1) {
      status = wrl.slice(status + 7, wrl.length)
      if (status === '2') {
        alert('خطا در پرداخت')
        //window.location.href = wrl.slice(0,wrl.indexOf('/?status')) 
        window.history.pushState(window.history.state, window.title, wrl.slice(0, wrl.indexOf('/?status')));
      }
      if (status === '3') {
        alert('پرداخت موفق')
        //window.location.href = wrl.slice(0,wrl.indexOf('/?status')) 
        window.history.pushState(window.history.state, window.title, wrl.slice(0, wrl.indexOf('/?status')));
      }

    }

    let images = localStorage.getItem('electricy-images');
    if (images === undefined || images === null) {
      images = {};
      localStorage.setItem('electricy-images', '{}')
    }
    else {
      images = JSON.parse(images);
    }
    this.dateCalculator = dateCalculator();
    this.noorvare3Storage = AIOStorage('noorvare3');
    let noorvare3 = !!!props.userInfo.norvareh3Agreement;
    if (!this.noorvare3Storage.load({ name: 'show', def: true })) { noorvare3 = false }
    let { token, baseUrl } = this.props;
    this.state = {
      backOffice: {},
      landing_takhfif: false,
      baseUrl,
      setBackOffice: (backOffice) => {
        this.setState({ backOffice })
      },
      noorvare3,
      opacity: 100, theme: 'light',
      bazargahOrders: {
        wait_to_get: undefined,
        wait_to_send: undefined
      },
      SetState: (obj) => this.setState(obj),
      showMessage: this.showMessage.bind(this),
      images,
      messages: [],
      campaigns: [],
      testedChance: true,
      updateUserInfo: props.updateUserInfo,
      getUserInfo: props.getUserInfo,
      updatePassword: props.updatePassword,
      allProducts: [],
      cart: {},//{variantId:{count,product,variant}}
      product: false,
      category: false,
      guaranteePopupZIndex: 0,
      ordersHistoryZIndex: 0,
      order: false,
      guaranteeItems: [],
      garanti_products_dic: {},
      guaranteeExistItems: [],
      popup: {},
      peygiriyeSefaresheKharid_tab: undefined,
      buy_view: undefined,//temporary state
    };
    let log = true;
    let getState = () => {
      return { ...this.state, userInfo: props.userInfo }
    }
    let signalR = new SignalR(() => this.state);
    signalR.start();
    this.state.signalR = signalR;
    this.state.kharidApis = AIOService({ token, getState, getResponse: kharidApis, log, baseUrl, id: 'bazaremiarzekharid' });
    this.state.bazargahApis = AIOService({ token, getState, getResponse: bazargahApis, getMock: bazargahMock, log, baseUrl, id: 'bazaremiarzebazargah' });
    this.state.walletApis = AIOService({ token, getState, getResponse: walletApis, log, baseUrl, id: 'bazaremiarzewallet' });
    this.state.gardooneApis = AIOService({ token, getState, getResponse: gardooneApis, log, baseUrl, id: 'bazaremiarzegardoone' });
    this.state.guarantiApis = AIOService({ token, getState, getResponse: guarantiApis, log, baseUrl, id: 'bazaremiarzeguaranti' });
    this.state.vitrinApis = AIOService({ token, getState, getResponse: vitrinApis, getMock: vitrinMock, log, baseUrl, id: 'bazaremiarzevitrin' });
  }
  changeOpacity() {
    let { opacity } = this.state;
    if (opacity === 100) { opacity = 90 }
    else if (opacity === 90) { opacity = 80 }
    else if (opacity === 80) { opacity = 70 }
    else if (opacity === 70) { opacity = 100 }
    this.setState({ opacity })
  }
  getCartItem(cartId, variantId) {
    if (!variantId) { return false }
    let { cart } = this.state;
    let cartTab = cart[cartId];
    if (!cartTab) { return false }
    return cartTab.items[variantId] || false
  }
  getCartItemsByProduct(product) {
    let { cartId } = product;
    let res = [];
    for (let i = 0; i < product.variants.length; i++) {
      let variant = product.variants[i];
      let cartItem = this.getCartItem(cartId, variant.id);
      if (cartItem !== false) { res.push(cartItem) }
    }
    return res
  }
  getCartLength() {
    let { cart } = this.state;
    let cartLength = 0;
    let cartTabs = Object.keys(cart);
    for (let i = 0; i < cartTabs.length; i++) {
      let cartTab = cart[cartTabs[i]];
      cartLength += Object.keys(cartTab.items).length;
    }
    return cartLength
  }
  removeCart(cartId) {
    let { cart } = this.state;
    let newCart = {}
    for (let prop in cart) {
      if (prop !== cartId) { newCart[prop] = cart[prop] }
    }
    this.setState({ cart: newCart })
  }
  fix(value) {
    try { return +value.toFixed(0) }
    catch { return 0 }
  }
  getCartTab(cartId, obj = {}) {
    let cartTab = {
      getCartItems: () => {
        let { cart } = this.state;
        let cartTab = cart[cartId];
        if (!cartTab) { return [] }
        let { items = {} } = cartTab;
        return Object.keys(items).map((o) => cart[cartId].items[o])
      }
    };
    if (cartId === 'فروش ویژه') {
      cartTab.getAmounts = (shippingOptions = {}) => {
        let { cart } = this.state;
        let cartTab = cart[cartId];
        if (!cartTab) { return {} }
        let cartItems = cartTab.getCartItems();
        let total = 0;
        for (let i = 0; i < cartItems.length; i++) {
          let { count, variant } = cartItems[i];
          total += count.packQty * variant.finalPrice;
        }
        let { PayDueDate = 1 } = shippingOptions;
        let paymentMethodDiscountPercent = {
          '1': 12, '17': 4.8, '18': 3.6, '19': 4.5, '20': 10.5
        }[(PayDueDate).toString()]
        let paymentMethodDiscount = total * paymentMethodDiscountPercent / 100;
        let paymentAmount = total - paymentMethodDiscount;
        let peymentPercent = {
          '1': 12, '17': 4.8, '18': 3.6, '19': 4.5, '20': 10.5
        }[(PayDueDate).toString()]
        paymentAmount = paymentAmount * peymentPercent / 100
        return { total, paymentMethodDiscountPercent, paymentMethodDiscount, paymentAmount };
      }
      cartTab.getProductCards = (renderIn) => {
        let { cart } = this.state;
        let cartTab = cart[cartId];
        if (!cartTab) { return [] }
        let cartItems = cartTab.getCartItems();
        return cartItems.map(({ variant, product, count }) => {
          return <ForoosheVijeCard key={variant.id} product={product} variant={variant} count={count} renderIn={renderIn} />
        })
      }
      cartTab.getFactorItems = (shippingOptions = {}) => {
        let { cart } = this.state;
        let cartTab = cart[cartId];
        let { getAmounts } = cartTab;
        let { total, paymentMethodDiscount, paymentMethodDiscountPercent, paymentAmount } = getAmounts(shippingOptions);
        return [
          {
            key: 'جمع کل سبد خرید',
            value: `${SplitNumber(this.fix(total)) + ' ریال'}`,
            className: 'color00B5A5 fs-14'
          },
          {
            key: 'تخفیف نحوه پرداخت',
            value: `${SplitNumber(this.fix(paymentMethodDiscount)) + ' ریال'} (${paymentMethodDiscountPercent} %)`,
            className: 'color00B5A5 fs-14'
          },
          {
            key: 'مبلغ چک',
            value: SplitNumber(this.fix(total - paymentMethodDiscount - paymentAmount)) + ' ریال',
            className: 'theme-medium-font-color fs-14'
          },
          {
            key: 'مبلغ قابل پرداخت',
            value: SplitNumber(this.fix(paymentAmount)) + ' ریال',
            className: 'theme-dark-font-color bold fs-16'
          }
        ]
      }
      cartTab.paymentButtonText = (shippingOptions) => shippingOptions.SettleType === 16 ? 'پرداخت' : 'ثبت'
    }
    else if (cartId === 'بلکس') {

      cartTab.getAmounts = (shippingOptions = {}) => {
        let { cart } = this.state;
        let cartTab = cart[cartId];
        if (!cartTab) { return {} }
        let cartItems = cartTab.getCartItems();
        let total = 0;

        for (let i = 0; i < cartItems.length; i++) {
          let { count, product } = cartItems[i];
          total += ((count.packQty * product.price) / 88) * 100;
        }

        let { PayDueDate = 1 } = shippingOptions;
        let paymentMethodDiscountPercent = {
          '1': 12, '25': 7.8, '26': 6.6, '27': 6
        }[(PayDueDate).toString()]
        let paymentMethodDiscount = total * paymentMethodDiscountPercent / 100;
        let paymentAmount = total - paymentMethodDiscount;
        let peymentPercent = {
          '1': 100, '25': 30, '26': 40, '27': 50
        }[(PayDueDate).toString()]
        paymentAmount = paymentAmount * peymentPercent / 100
        return { total, paymentMethodDiscountPercent, paymentMethodDiscount, paymentAmount };
      }
      cartTab.getProductCards = (renderIn) => {
        let { cart } = this.state;
        let cartTab = cart[cartId];
        if (!cartTab) { return [] }
        let cartItems = cartTab.getCartItems();
        return cartItems.map(({ product, count, variantId }) => {
          return <BelexCard key={variantId} variantId={variantId} product={product} count={count} renderIn={renderIn} />
        })
      }
      cartTab.getFactorItems = (shippingOptions) => {
        let { cart } = this.state;
        let cartTab = cart[cartId];
        let { getAmounts } = cartTab;
        let { total, paymentMethodDiscount, paymentMethodDiscountPercent, paymentAmount } = getAmounts(shippingOptions);
        return [
          {
            key: 'جمع کل سبد خرید',
            value: `${SplitNumber(this.fix(total)) + ' ریال'}`,
            className: 'color00B5A5 fs-14'
          },
          {
            key: 'تخفیف نحوه پرداخت',
            value: `${SplitNumber(this.fix(paymentMethodDiscount)) + ' ریال'} (${paymentMethodDiscountPercent} %)`,
            className: 'color00B5A5 fs-14'
          },
          {
            key: 'مبلغ چک',
            value: SplitNumber(this.fix(total - paymentMethodDiscount - paymentAmount)) + ' ریال',
            className: 'theme-medium-font-color fs-14'
          },
          {
            key: 'مبلغ قابل پرداخت',
            value: SplitNumber(this.fix(paymentAmount)) + ' ریال',
            className: 'theme-dark-font-color bold fs-16'
          }
        ]
      }
      cartTab.paymentButtonText = (shippingOptions) => shippingOptions.SettleType === 16 ? 'پرداخت' : 'ثبت'
    }
    else {
      cartTab.getAmounts = (shippingOptions) => {
        let { cart } = this.state;
        let cartTab = cart[cartId];
        if (!cartTab) { return {} }
        let cartItems = cartTab.getCartItems();
        let { getFactorDetails } = this.state;
        let factorDetailsItems = [];
        for (let i = 0; i < cartItems.length; i++) {
          let { variantId, count, product } = cartItems[i];
          let variant = product.variants.find((o) => o.id === variantId)
          factorDetailsItems.push({ ItemCode: variant.code, ItemQty: count })
        }
        let factorDetails = getFactorDetails(factorDetailsItems, shippingOptions);
        console.log(factorDetails)
        let total = 0;
        for (let i = 0; i < factorDetails.MarketingLines.length; i++) {
          let o = factorDetails.MarketingLines[i];
          total += o.Price * o.ItemQty;
        }
        let paymentMethodDiscountPercent = factorDetails.marketingdetails.DocumentDiscountPercent
        let paymentMethodDiscount = factorDetails.marketingdetails.DocumentDiscount;
        let paymentAmount = factorDetails.DocumentTotal;
        let discount = total - (paymentAmount + paymentMethodDiscount);
        return {
          total, discount, paymentMethodDiscount, paymentMethodDiscountPercent, paymentAmount, factorDetails
        }
      }
      cartTab.getProductCards = (renderIn, shippingOptions) => {
        let paymentMethodDiscountPercent;
        if (renderIn === 'shipping') {
          let { PayDueDate_options, PayDueDate } = shippingOptions;
          paymentMethodDiscountPercent = PayDueDate_options.find(({ value }) => value === PayDueDate).percent;
        }

        let { cart } = this.state;
        let cartTab = cart[cartId];
        if (!cartTab) { return [] }
        let cartItems = cartTab.getCartItems();
        return cartItems.map(({ product, count, variantId }, i) => {
          let variant = product.variants.find((o) => o.id === variantId);
          let { optionTypes } = product;
          let { optionValues } = variant;
          let details = [];
          for (let j = 0; j < optionTypes.length; j++) {
            let optionType = optionTypes[j];
            details.push([optionType.name, optionType.items[optionValues[optionType.id]]]);
          }
          let props = {
            product, details, type: 'horizontal', renderIn, cartId,
            paymentMethodDiscountPercent,
            isFirst: i === 0, isLast: i === cartItems.length - 1,
          }
          return <ProductCard key={variantId} variantId={variantId} {...props} index={i} />
        })
      }
      cartTab.getFactorItems = (shippingOptions) => {
        let { cart } = this.state;
        let cartTab = cart[cartId];
        let { getAmounts } = cartTab;
        let res = getAmounts(shippingOptions);
        let { discount, paymentMethodDiscount, paymentMethodDiscountPercent, paymentAmount, total } = res;

        return [
          {
            key: 'قیمت کالاها',
            value: SplitNumber(this.fix(total)) + ' ریال',
            className: 'theme-medium-font-color fs-14'
          },
          {
            key: 'تخفیف گروه مشتری',
            value: SplitNumber(this.fix(discount)) + ' ریال',
            className: 'colorFDB913 fs-14'
          },
          {
            key: 'تخفیف نحوه پرداخت',
            value: `${SplitNumber(this.fix(paymentMethodDiscount)) + ' ریال'} (${paymentMethodDiscountPercent} %)`,
            className: 'colorFF4335 fs-14'
          },
          {
            key: 'مبلغ قابل پرداخت',
            value: SplitNumber(this.fix(paymentAmount)) + ' ریال',
            className: 'theme-dark-font-color bold fs-16'
          }
        ]
      }
      cartTab.paymentButtonText = (shippingOptions) => 'ارسال برای ویزیتور'
    }
    return { ...obj, ...cartTab }
  }
  async changeCart({ count, variantId, product }) {
    let { cart, kharidApis } = this.state;
    let newCartTabItems = {};
    let { cartId } = product;
    let cartTab = cart[cartId];
    //مقدار اولیه سبد خرید
    if (!cartTab) { cartTab = this.getCartTab(cartId, { items: {} }) }
    //حذف از سبد خرید
    if (count === 0) {
      let res = {};
      for (let prop in cartTab.items) {
        if (prop.toString() !== variantId.toString()) { res[prop] = cartTab.items[prop] }
      }
      newCartTabItems = res;
    }
    else {
      newCartTabItems = { ...cartTab.items }
      //افزودن به سبد خرید
      if (newCartTabItems[variantId] === undefined) {
        newCartTabItems[variantId] = { count, product, variantId }
      }
      //ویرایش سبد خرید
      else { newCartTabItems[variantId].count = count; }
    }
    clearTimeout(this.cartTimeout);
    let newCart = { ...cart, [cartId]: { ...cartTab, items: newCartTabItems } };
    this.cartTimeout = setTimeout(async () => await kharidApis({ api: 'setCart', parameter: newCart, loading: false, name: 'ثبت سبد خرید' }), 2000)
    this.setState({ cart: newCart });
  }
  async getGuaranteeImages(items) {
    if (!items.length) { return }
    let { guarantiApis, images } = this.state;
    let itemCodes = [];
    for (let i = 0; i < items.length; i++) {
      let { Details = [] } = items[i];
      for (let j = 0; j < Details.length; j++) {
        let { Code } = Details[j];
        if (images[Code]) { continue }
        if (itemCodes.indexOf(Code) !== -1) { continue }
        itemCodes.push(Code);
      }
    }
    let res = await guarantiApis({ api: 'daryafte_tasavire_kalahaye_garanti', parameter: itemCodes, loading: false, name: 'دریافت تصاویر کالاهای گارانتی' });
    for (let i = 0; i < res.length; i++) {
      images[res.ItemCode] = res.ImagesUrl;
    }
    this.setState({ images })
  }
  async getGuaranteeItems() {
    let { guarantiApis } = this.state;
    let res = await guarantiApis({ api: "garantiItems", loading: false, name: 'دریافت لیست کالاهای گارانتی کاربر' });
    if (res === false) {
      this.props.logout();
      return;
    }
    //this.getGuaranteeImages(items);
    let guaranteeExistItems = await guarantiApis({ api: "kalahaye_ghabele_garanti", loading: false, name: 'کالاهای قابل گارانتی' });
    this.setState({
      guaranteeItems: res,
      guaranteeExistItems
    });
  }
  async getCampaignsData() {
    let { kharidApis } = this.state;
    let campaigns = await kharidApis({ api: "getCampaigns", loading: false, name: 'دریافت لیست کمپین ها', def: [] });
    debugger
    this.setState({ campaigns });
  }
  async get_forooshe_vije() {
    let { kharidApis } = this.state;
    let forooshe_vije = await kharidApis({ api: "daryafte_ettelaate_forooshe_vije", loading: false, name: 'دریافت اطلاعات فروش ویژه' });
    this.setState({ forooshe_vije });
  }
  async get_belex() {
    let { kharidApis } = this.state;
    let belex = await kharidApis({ api: "daryafte_ettelaate_belex", loading: false, name: 'دریافت اطلاعات بلکس' });
    this.setState({ belex });
  }
  async getBazargahOrders() {
    let { bazargahOrders, bazargahApis } = this.state;
    let wait_to_get = await bazargahApis({ api: 'daryafte_sefareshate_bazargah', parameter: { type: 'wait_to_get' }, loading: false, name: 'دریافت سفارشات در انتظار اخذ بازارگاه' });
    let wait_to_send = await bazargahApis({ api: 'daryafte_sefareshate_bazargah', parameter: { type: 'wait_to_send' }, loading: false, name: 'دریافت سفارشات در انتظار ارسال بازارگاه' });
    this.setState({ bazargahOrders: { ...bazargahOrders, wait_to_get, wait_to_send } })
  }
  showMessage(message) {
    alert(message)
    //this.setState({message:this.state.messages.concat(message)});
  }
  async getGarantProducts() {
    let { guaranteeItems, guarantiApis, garanti_products_dic } = this.state;
    for (let i = 0; i < guaranteeItems.length; i++) {
      let { org_object, id } = guaranteeItems[i];
      let mahsoolat = await guarantiApis({ api: 'mahsoolate_garanti', parameter: org_object, loading: false, name: 'دریافت محصولات گارانتی' });
      garanti_products_dic[id] = mahsoolat;
    }
    this.setState({ garanti_products_dic });
  }
  async componentDidMount() {
    this.mounted = true;
    let { userInfo } = this.props;
    let pricing = new Pricing('https://b1api.burux.com/api/BRXIntLayer/GetCalcData', userInfo.cardCode, 12 * 60 * 60 * 1000)
    pricing.startservice().then((value) => { return value; });
    //await pricing.forceFetchData();

    let { kharidApis } = this.state;
    let backOffice = await kharidApis({
      api: 'get_backoffice',
      name: 'دریافت اطلاعات پنل کمپین',
    })
    this.state.backOffice = backOffice;
    let version = await kharidApis({ api: 'getVersion', name: 'دریافت ورژن اپلیکیشن' });
    if (version) {
      let cacheVersion = localStorage.getItem('bazarmiarzeversion')
      if (typeof cacheVersion !== 'string') {
        localStorage.setItem('bazarmiarzeversion', version);
        cacheVersion = version
      }
      if (version.toString() !== cacheVersion.toString()) {
        let loginStorage = localStorage.getItem('brxelctoken');
        localStorage.clear();
        localStorage.setItem('bazarmiarzeversion', version);
        localStorage.setItem('brxelctoken', loginStorage);
        window.location.reload()
      }
    }
    let getFactorDetails = (items, obj = {}) => {
      let { SettleType, PaymentTime, PayDueDate, DeliveryType } = obj;
      let { userInfo } = this.props;
      let config = {
        "CardCode": userInfo.cardCode,
        "CardGroupCode": userInfo.groupCode,
        "MarketingLines": items,
        "DeliverAddress": userInfo.address,
        "marketingdetails": {
          "SlpCode": userInfo.slpcode,
          SettleType,
          PaymentTime,
          PayDueDate,
          DeliveryType
        }
      }
      let res = pricing.autoCalcDoc(config)
      return res
    }
    let fixPrice = (items, campaign = {}, log) => {
      let { userInfo } = this.props;
      if(!userInfo.groupCode){console.error('fixPrice missing userInfo.groupCode')}
      if(!userInfo.cardCode){console.error('fixPrice missing userInfo.cardCode')}
      if(!userInfo.slpcode){console.error('fixPrice missing userInfo.slpcode')}
      let data = {
        "CardGroupCode": userInfo.groupCode,
        "CardCode": userInfo.cardCode,
        "marketingdetails": {
          "PriceList": campaign.PriceListNum,
          "SlpCode": userInfo.slpcode,
          "Campaign": campaign.CampaignId
        },
        "MarketingLines": items
      }
      let list = items.map(({ itemCode }) => itemCode);
      try {
        list = pricing.autoPriceList(list, data);
      }
      catch (err) {
        alert('Pricing در محاسبات دچار مشکل شد . لطفا این مساله را با ادمین سیستم در میان بگذارید')
        alert(err)
      }

      return list
    }
    this.state.fixPrice = fixPrice;
    this.state.getFactorDetails = getFactorDetails;
    if (backOffice.activeManager.garanti && userInfo.slpcode) { this.getGuaranteeItems(); }
    //if (backOffice.activeManager.campaigns) { await this.getCampaignsData(); }
    if (backOffice.activeManager.forooshe_vije) { this.get_forooshe_vije(); }
    if (backOffice.activeManager.belex) { this.get_belex(); }
    if (backOffice.activeManager.bazargah) { this.getBazargahOrders(); }
    //let testedChance = await gardooneApis({type:"get_tested_chance"});
    let cart = await kharidApis({ api: 'getCart', loading: false, name: 'دریافت اطلاعات سبد خرید' });
    for (let prop in cart) {
      cart[prop] = this.getCartTab(prop, cart[prop])
    }
    this.setState({
      backOffice,
      landing_takhfif:true,
      cart,
      fixPrice,
      pricing,
      getFactorDetails
    });
  }
  async openPopup(type, parameter) {
    let { rsa_actions, backOffice } = this.state;
    let { userInfo } = this.props;
    let { addPopup, removePopup, setNavId } = rsa_actions;
    if (type === 'price list') {
      addPopup({
        type: 'fullscreen', id: 'price-list',
        body: () => <PriceList />, title: 'لیست قیمت تولیدکنندگان', closeType: 'close button'
      })
    }
    else if (type === 'admin-panel') {
      addPopup({
        type: 'fullscreen', id: 'admin-popup',
        body: () => <BackOffice model={backOffice} cardCode={userInfo.cardCode} />, title: 'پنل ادمین', closeType: 'close button'
      })
    }
    
    else if (type === 'count-popup') {
      addPopup({
        type: 'center', id: 'count-popup',
        style: { height: 'fit-content' },
        body: () => <CountPopup {...parameter} />, title: 'تعداد را وارد کنید', backClose: true, closeType: 'close button'
      })
    }
    else if (type === 'password') {
      addPopup({ type: 'fullscreen', body: () => <PasswordPopup />, title: 'مشاهده و ویرایش رمز عبور' })
    }
    else if (type === 'peygiriye-sefareshe-kharid') {
      addPopup({ type: 'fullscreen', body: () => <OrdersHistory activeTab={parameter} />, title: 'جزيیات سفارش خرید' })
    }
    if (type === 'joziate-sefareshe-kharid') {
      addPopup({ type: 'fullscreen', body: () => <OrderPopup order={parameter} />, title: 'پیگیری سفارش خرید' })
    }
    else if (type === 'sabte-garanti-jadid') {
      addPopup({ type: 'fullscreen', body: () => <SabteGarantiJadid />, title: 'درخواست مرجوع کالای سوخته' })
    }
    else if (type === 'joziate-darkhast-haye-garanti') {
      addPopup({ type: 'fullscreen', body: () => <JoziateDarkhastHayeGaranti />, title: 'جزییات درخواست های گارانتی' })
    }
    else if (type === 'payame-sabte-garanti') {
      let { text, subtext } = parameter;
      addPopup({ type: 'center', body: () => <PayameSabteGaranti text={text} subtext={subtext} onClose={() => removePopup()} />, header: false })
    }
    else if (type === 'sabte-garanti-jadid-ba-joziat') {
      addPopup({ type: 'fullscreen', body: () => <SabteGarantiJadidBaJoziat />, title: 'ثبت در خواست گارانتی جدید با جزییات' })
    }
    else if (type === 'search') {
      addPopup({
        type: 'fullscreen', body: () => <Search />, title: 'جستجو در محصولات',
        header: () => <Header type='popup' popupId='search' />
      })
    }
    else if (type === 'product') {
      addPopup({
        type: 'fullscreen', body: () => <Product product={parameter.product} variantId={parameter.variantId} />,
        title: parameter.cartId, id: 'product',
        header: () => <Header type='popup' popupId='product' />
      })
    }
    else if (type === 'category') {
      addPopup({
        type: 'fullscreen', body: () => <CategoryView category={parameter.category} />,
        title: parameter.category.name,
        header: () => <Header type='popup' popupId='category-view' />
      })
    }
    else if (type === 'wallet') {
      addPopup({ type: 'fullscreen', header: false, body: () => <Wallet onClose={() => removePopup()} /> })
    }
    else if (type === 'tanzimate-kife-pool') {
      addPopup({ type: 'fullscreen', body: () => <TanzimateKifePool cards={parameter.cards} onChange={parameter.onChange} />, title: 'تنظیمات کیف پول' })
    }
    else if (type === 'cart') {
      addPopup({ type: 'fullscreen', body: () => <Cart cartId={parameter} />, title: 'سبد خرید', id: 'cart' })
    }
    else if (type === 'shipping') {
      addPopup({
        type: 'fullscreen', body: () => <Shipping cartId={parameter} />,
        title: 'ادامه فرایند خرید'
      })
    }
    else if (type === 'sefareshe-ersal-shode-baraye-vizitor') {
      addPopup({
        body: () => (
          <Sefareshe_Ersal_Shode_Baraye_Vizitor
            orderNumber={parameter.orderNumber}
            qr={parameter.qr}
            onShowInHistory={() => {
              removePopup('all');
              this.openPopup('peygiriye-sefareshe-kharid', 'در حال بررسی');
            }}
            onClose={() => {
              removePopup('all');
              setNavId('khane')
            }}
          />
        ),
        header: false
      })
    }
  }
  getProfileName(userInfo) {
    //let str = userInfo.cardName;
    let str = `${userInfo.firstName} ${userInfo.lastName}`;
    if (!str) { return 'پروفایل' }
    if (str.length <= 12) { return str }
    return <marquee behavior='scroll' scrollamount={3} direction='right'>{str}</marquee>
  }
  addAnaliticsHistory({ url, title }) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'event': 'virtualPageview',
      'pageUrl': `https://bazar.miarze.com/${url}`,
      'pageTitle': title //some arbitrary name for the page/state
    });
  }
  getContext() {
    return {
      ...this.state,
      userInfo: this.props.userInfo,
      openPopup: this.openPopup.bind(this),
      changeCart: this.changeCart.bind(this),
      removeCart: this.removeCart.bind(this),
      getCartItem: this.getCartItem.bind(this),
      getCartItemsByProduct: this.getCartItemsByProduct.bind(this),
      getBazargahOrders: this.getBazargahOrders.bind(this),
      getCartLength: this.getCartLength.bind(this),
      logout: this.props.logout,
      baseUrl: this.props.baseUrl,
      addAnaliticsHistory: this.addAnaliticsHistory.bind(this)

    }
  }
  render() {
    if (!this.mounted) { return null }
    let { userInfo, logout } = this.props;
    let { opacity, theme, backOffice, landing_takhfif } = this.state;
    return (
      <appContext.Provider value={this.getContext()}>
        <RSA
          rtl={true}
          className={`rvd-rtl opacity-${opacity} theme-${theme}`}
          popupConfig={{ closeType: 'back button', type: 'fullscreen', className: `opacity-${opacity} theme-${theme}` }}
          sideClassName={`opacity-${opacity} theme-${theme}`}
          title={(nav) => nav.id === 'khane' ? <>{getSvg('mybrxlogo', { className: 'rvd-hide-sm rvd-hide-md rvd-hide-lg' })}<div className='rvd-hide-xs'>{nav.text}</div></> : (nav.id === 'profile' ? 'پروفایل' : nav.text)}
          navs={[
            { text: "خانه", icon: () => getSvg(19), id: "khane" },
            { text: "خرید", icon: () => getSvg('buy'), id: "kharid" },
            { text: "بازارگاه", icon: () => getSvg(20), id: "bazargah" },
            { text: "ویترین", icon: () => getSvg('vitrin'), id: "vitrin", show: () => !!backOffice.activeManager.vitrin },
            { text: this.getProfileName(userInfo), icon: () => getSvg(21), id: "profile" },
          ]}
          sides={[
            { text: 'بازارگاه', icon: () => <Icon path={mdiCellphoneMarker} size={0.8} />, onClick: () => this.state.rsa_actions.setNavId('bazargah') },
            { text: 'پیگیری سفارش خرید', icon: () => <Icon path={mdiClipboardList} size={0.8} />, onClick: () => this.openPopup('peygiriye-sefareshe-kharid') },
            { text: 'درخواست گارانتی', icon: () => <Icon path={mdiShieldCheck} size={0.8} />, onClick: () => this.openPopup('sabte-garanti-jadid'), show: () => !!backOffice.activeManager.garanti && userInfo.slpcode },
            { text: 'پنل ادمین', icon: () => <Icon path={mdiSecurity} size={0.8} />, onClick: () => this.openPopup('admin-panel'), show: () => ['c39801', 'c39838', 'c39842', 'c39843', 'c63291', 'c202528'].indexOf(userInfo.cardCode) !== -1 },
            { text: 'خروج از حساب کاربری', icon: () => <Icon path={mdiExitToApp} size={0.8} />, className: 'colorFDB913', onClick: () => logout() }
          ]}
          navHeader={() => {
            return <NavHeader />
          }}
          sideHeader={() => <div style={{ padding: '24px 0' }}>{getSvg('mybrxlogo')}</div>}
          sideFooter={() => (
            <RVD
              layout={{
                className: 'h-48 p-12 color-fff', align: 'v',
                row: [
                  { flex: 1 },
                  { html: <Icon path={mdiOpacity} size={1} onClick={() => this.changeOpacity()} /> }
                ]
              }}
            />
          )}
          header={({ navId }) => <Header type='page' navId={navId} />}
          navId='khane'
          body={({ navId, setNavId }) => {
            if (navId === "khane") { return <Home />; }
            if (navId === "kharid") { return <Buy />; }
            if (navId === "bazargah") { return <Bazargah />; }
            if (navId === "vitrin") { return <Vitrin onExit={() => { setNavId('khane') }} />; }
            if (navId === "profile") { return <Profile />; }
          }}
          getActions={({ setConfirm, addPopup, removePopup, setNavId }) => {
            let obj = { setConfirm, addPopup, removePopup, setNavId };
            this.setState({ rsa_actions: obj })
          }}
          splash={() => <Splash />}
          splashTime={7000}
        />
        {
          landing_takhfif &&
          <Landing_takhfif onClose={()=>this.setState({landing_takhfif:false})}/>
        }
      </appContext.Provider>
    );
  }
}
Main.defaultProps = { userInfo: { cardCode: 'c50000' } }
class NavHeader extends Component {
  render() {
    return (
      <div className='w-100 align-vh m-v-16'>
        <img src={Logo1} alt='' width={200} />
      </div>

    )
  }
}
class Header extends Component {
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
        <AIOButton
          type="button"
          className='header-icon'
          style={{ background: "none", color: '#605E5C' }}
          text={<Icon path={mdiCart} size={0.7} />}
          badge={length > 0 ? length : undefined}
          badgeAttrs={{ className: "badge-1" }}
          onClick={() => openPopup('cart')}
        />
      )
    }
  }
  notif_layout() {
    let { navId, type } = this.props;
    if (type === 'popup' || navId !== 'khane') { return false }
    let length = 12;
    return {
      html: (
        <AIOButton
          type="button"
          className='header-icon'
          style={{ background: "none", color: '#605E5C' }}
          text={<Icon path={mdiBell} size={0.7} />}
          badge={length > 0 ? length : undefined}
          badgeAttrs={{ className: "badge-1" }}
        />
      )
    }
  }
  bazargahPower_layout() {
    let { backOffice } = this.context;
    let { navId, type } = this.props;
    if (type !== 'page' || navId !== 'bazargah' || !backOffice.activeManager.bazargah) { return false }
    return {
      html: (
        <AIOButton
          type="button"
          className='header-icon'
          style={{ background: "none", color: '#605E5C' }}
          text={<Icon path={mdiPower} size={0.7} />}
          onClick={async () => {
            let { bazargahApis, setBackOffice, backOffice } = this.context;
            let res = await bazargahApis({ api: 'bazargahActivity', parameter: false, name: 'تشخیص فعال بودن بازارگاه' })
            setBackOffice({ ...backOffice, activeManager: { ...backOffice.activeManager, bazargah: res } })
          }}
        />
      )
    }
  }
  buySearch_layout() {
    let { openPopup } = this.context;
    let { navId, type } = this.props;
    if (type !== 'page' || navId !== 'kharid') { return false }
    return {
      html: (
        <AIOButton
          type="button"
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
            this.buySearch_layout(),
            this.cart_layout(),
            //this.notif_layout(),
            this.bazargahPower_layout(),

          ]
        }}
      />
    )
  }
}



class Landing_takhfif extends Component{
  static contextType = appContext;
  close_layout(){
    let {onClose} = this.props;
    return {
      size:48,
      row:[
        {flex:1},
        {
          align:'vh',
          className:'p-h-12',
          onClick:()=>onClose(),
          html:<Icon path={mdiClose} size={1}/>
        }
      ]
    }
  }
  header_layout(src){
    return {
      column:[
        {
          html:(
            <img src={src} width='100%' alt=''/>
          )
        }
      ]
    }
  }
  billboard_layout(src){
    return {
      className:'p-12',
      html:(
        <img src={src} alt='' width='100%'/>
      )
    }
  }
  description_layout(text){
    return {
      style:{textAlign:'right'},
      className:'m-b-12 p-h-12 fs-12',
      html:text
    }
  }
  label_layout(text){
    return {
      className:'theme-dark-font-color fs-16 bold p-h-12',
      html:text
    }
  }
  link_be_kharid(){
    let {onClose} = this.props;
    return {
      className:'m-b-12 p-h-12',
      html:(
        <button 
          onClick={()=>{
            let {rsa_actions} = this.context;
            rsa_actions.setNavId('kharid');
            onClose()
          }}
          className='button-2'
        >همین الان خرید کنید</button>
      )
    }
  }
  link_be_belex(){
    let {openPopup,belex} = this.context;
    let {onClose} = this.props;
    return {
      className:'m-b-12 p-h-12',
      html:(
        <button 
          onClick={()=>{
            openPopup('category',{category:belex});
            onClose()
          }}
          className='button-2'
        >خرید لامپ 10 وات</button>
      )
    }
  }
  render(){
    return (
      <RVD
        layout={{
          style:{background:'#fff',height:'100%'},
          className:'fullscreen',
          column:[
            this.close_layout(),
            {
              className:'ofy-auto',flex:1,
              column:[
                this.header_layout(haraj1),
                this.billboard_layout(haraj2),
                this.billboard_layout(haraj3),
                this.description_layout(
                  `
                  این روزها که شاهد گرونی های روزافزون و کاهش قدرت خرید هستیم، شرکت بروکس با در نظر گرفتن شرایط اقتصادی فعلی جامعه و نرخ تورم سعی در کمک به کسب و کار الکتریکی‌ها داره. برای همین طی مذاکرات و تصمیم گیری‌ها، در نظر گرفتیم تمامی محصولات روشنایی و الکتریکی خود را با 25 الی 30 درصد زیر قیمت به فروش برسونیم!
                  `
                ),
                this.link_be_kharid(),
                this.billboard_layout(haraj4),
                this.label_layout('لامپ 10 وات بروکس فقط 20 هزارتومن!'),
                this.description_layout(
                  `
                  در صورت خرید از محصولاتی که کاهش قیمت داشتند روی هر سبد خریدتون 2 عدد کارتن (بله درست خوندید! دو عدد کارتن 100 عددی!) لامپ 10 وات رو میتونین با قیمت 20 هزارتومان خریداری کنید! یعنی ۴ میلیون ریال هدیه ما به شما!
                  `
                ),
                this.link_be_belex(),
                
              ]
            }  
          ]
        }}
      
      />
    )
  }
}