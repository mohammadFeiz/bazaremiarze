import React, { Component } from "react";
import Header from "../../components/header";
//actions////////////////////////////////
import ActionClass from "../../actionClass";
//npm////////////////////////////////////////
import RSA from '../../npm/react-super-app/react-super-app';
import Logo5 from './../../images/logo5.png';
import Logo1 from './../../images/logo1.png';
import appContext from "../../app-context";
import SignalR from '../../singalR/signalR';
import "./index.css";
export default class Main extends Component {
  constructor(props) {
    super(props);
    let { baseUrl,Logger } = this.props;
    props.apis.setProperty('getState',()=>{return {...this.state}});
    let actionClass = new ActionClass({
      getSelf:()=>this,
      getState:()=>this.state,
      getProps:()=>this.props,
      setState:(obj)=>{
        for(let prop in obj){this.state[prop] = obj[prop]}
        this.setState(obj)
      }
    })
    let rsa = new RSA({
      rtl:true,maxWidth:770,id:'bazarmiarzersa',
      title:(nav)=>actionClass.getAppTitle(nav),
      nav:{
        items:actionClass.getNavItems,
        id:actionClass.getInitialNavId(),
        header:()=><div className='w-100 align-vh m-v-16'><img src={Logo5} alt='' width={200} /></div>
      },
      side:{
        items:actionClass.getSideItems,
        header:() => <div style={{margin:'24px 0'}}><img src={Logo1} alt='' height={48}/></div>,
        footer:actionClass.getSideFooter
      },
      headerContent:({ navId }) => <Header type='page' navId={navId} />,
      body:({ render }) => {
        let {registered} = this.props;
        let {mounted} = this.state;
        if(!registered){actionClass.openPopup('profile','register')}
        else if(mounted){return render()}
        else {return null}
      },
    })
    
    actionClass.manageUrl();
    this.state = {
      developerMode:true,
      actionClass,
      Logger,
      vitrin:{
        isFetch:false,
        update:(obj)=>{
          let {vitrin} = this.state;
          let newVitrin = {...vitrin,...obj}
          this.setState({vitrin:newVitrin})
        },
        fetchData:async ()=>{
          let {apis,userInfo,vitrin} = this.state;
          let started = await apis.request({
            api: 'vitrin.v_getStarted',loading:false,
            description: 'دریافت وضعیت ویترین'
          })
          this.setState({vitrin:{...vitrin,started}})
          apis.request({
            api: 'vitrin.v_mahsoolate_entekhab_shode',description: 'دریافت آی دی های محصولات انتخاب شده ی ویترین',loading:false,
            parameter:userInfo.cardCode,
            onSuccess:async (selectedProductsIds)=>{
                let selectedProductsList = selectedProductsIds.length?await apis.request({
                    api: 'vitrin.v_getProductsByIds',description: 'دریافت لیست محصولات انتخاب شده ی ویترین',loading:false,def:[],
                    parameter:selectedProductsIds.toString(),
            
                }):[];
                let selectedProducts = {};
                for(let i = 0; i < selectedProductsList.length; i++){
                    let p = selectedProductsList[i];
                    selectedProducts[p.id] = p
                }
                vitrin.update({selectedProducts})
            }
          });
        }
      },
      Login:props.Login,
      apis:props.apis,
      rsa,
      userInfo:props.userInfo,
      backOffice: props.backOffice,
      Shop_Bundle:{},
      Shop_Regular:{},
      baseUrl,
      bazargahOrders: {
        wait_to_get: undefined,
        wait_to_send: undefined
      },
      spreeCategories:{slider_type:[],icon_type:[],dic:{}},
      SetState: (obj) => this.setState(obj),
      updateUserInfo: props.updateUserInfo,
      allProducts: [],
      cart: {},//{variantId:{count,product,variant}}
      guaranteeItems: [],
      garanti_products_dic: {},
      guaranteeExistItems: [],
    };
    let signalR = new SignalR(() => this.state);
    signalR.start();
    this.state.signalR = signalR;
  }
  getSelectedProducts(){
    let { apis,userInfo,actionClass } = this.context;
    //actionClass.addAnaliticsHistory({url:'Vitrin',title:'Vitrin'}) //notice
    
  }
  async componentDidMount() {
    let { userInfo,registered } = this.props;
    if(!registered){this.setState({}); return}
    let {vitrin} = this.state;
    vitrin.fetchData();
    let {backOffice,actionClass} = this.state;
    await actionClass.startPricing()
    await actionClass.getShopState();
    if (backOffice.activeManager.garanti && userInfo.slpcode) { actionClass.getGuaranteeItems(); }
    if (backOffice.activeManager.bazargah) { actionClass.getBazargahOrders(); }
    actionClass.handleMissedLocation()
    this.setState({mounted:true})
  }
  getContext() {return {...this.state}}
  render() {
    let { rsa} = this.state;
    return (
      <appContext.Provider value={this.getContext()}>
        {rsa.render()}
      </appContext.Provider>
    );
  }
}
Main.defaultProps = { userInfo: { cardCode: 'c50000' } }