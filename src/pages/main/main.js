import React, { Component } from "react";
import Header from "../../components/header";
//actions////////////////////////////////
import ActionClass from "../../actionClass";
//npm////////////////////////////////////////
import RSA from 'react-super-app';
import Logo5 from './../../images/logo5.png';
import Logo1 from './../../images/bmloading.png';
import appContext from "../../app-context";
import SignalR from '../../singalR/signalR';
import "./index.css";
export default class Main extends Component {
  constructor(props) {
    super(props);
    let { baseUrl,Logger,updateProfile,userInfo,b1Info,Login,apis,backOffice,msfReport } = props;
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
        header:()=><div className='w-100 m-v-16'><img src={Logo5} alt='' width={200} /></div>
      },
      side:{
        items:actionClass.getSideItems,
        header:() => <div style={{margin:'24px 0'}} className='align-vh w-100'><img src={Logo1} alt='' height={24}/></div>,
        footer:actionClass.getSideFooter
      },
      headerContent:({ navId }) => <Header type='page' navId={navId} />,
      body:({ render,id,text }) => {
        if(id !== this.lastNavId){
          let {msfReport} = this.props;
          msfReport({actionName:'tab',actionId:7,targetName:text,targetId:id,tagName:'id',eventName:'page view'})  
        }
        this.lastNavId = id;

        let {mounted} = this.state;
        if(mounted){return render()}
        else {return null}
      },
    })
    
    actionClass.manageUrl();
    this.state = {
      developerMode:false,actionClass,Logger,updateProfile,Login,apis,rsa,userInfo,backOffice,baseUrl,msfReport,b1Info,
      logout:()=>{
        let {Login,msfReport} = this.props;
        msfReport({actionName:'logout',actionId:875,tagName:'user auth',eventName:'action'});
        Login.logout();
      },
      vitrin:{
        // vitrinSelected:{
        //   productId:{
        //     product:{...},
        //     variantIds:[1,2,3]
        //   },
        //   ...
        // }
        viewProducts:'tile',
        isFetch:false,
        update:(obj)=>{
          let {vitrin} = this.state;
          let newVitrin = {...vitrin,...obj}
          this.setState({vitrin:newVitrin})
        },
        removeSelectedProduct:(productId)=>{
          let { vitrin } = this.state,{ vitrinSelected = {},update } = vitrin;
          let newVitrinSelected = {}
          for(let prop in vitrinSelected){
            if(prop !== productId.toString()){
              newVitrinSelected[prop] = vitrinSelected[prop]
            }
          }
          update({vitrinSelected:newVitrinSelected})
        },
        getIsSelected:(productId,variantId)=>{
          let { vitrin } = this.state,{ vitrinSelected = {} } = vitrin;
          if(!vitrinSelected[productId.toString()]){return false}
          if(!variantId){return true}
          return !!vitrinSelected[productId.toString()].variantIds.find((o)=>o === variantId)
        },
        add:(product,variantId)=>{
          let { vitrin } = this.state,{ vitrinSelected,getIsSelected,update } = vitrin;
          if(getIsSelected(product.id,variantId)){return}
          let pstrid = product.id.toString();
          let newVitrinSelected = {};
          if(getIsSelected(product.id)){
            let newVariantIds = [...vitrinSelected[pstrid].variantIds,variantId]
            newVitrinSelected = {...vitrinSelected,[pstrid]:{...vitrinSelected[pstrid],variantIds:newVariantIds}}
          }
          else {
            newVitrinSelected = {...vitrinSelected,[pstrid]:{product,variantIds:[variantId]}}
          }
          update({vitrinSelected:newVitrinSelected})
        },
        remove:(product,variantId)=>{
          let { vitrin } = this.state,{ vitrinSelected,getIsSelected,update } = vitrin;
          if(!getIsSelected(product.id,variantId)){return}
          let pstrid = product.id.toString();
          let newVitrinSelected = {};
          let newVariantIds = vitrinSelected[pstrid].variantIds.filter((vi)=>vi !== variantId)
          for(let pid in vitrinSelected){
            if(pid !== pstrid){
              newVitrinSelected[pid] = vitrinSelected[pid]
            }
            else if(newVariantIds.length){
              newVitrinSelected[pid] = {...vitrinSelected[pid],variantIds:newVariantIds}
            }
          }
          update({vitrinSelected:newVitrinSelected})
        },
        updateVitrinSelected:(product,variantId)=>{
          let { apis, vitrin } = this.state,{ add,remove,getIsSelected } = vitrin;
          let isSelected = getIsSelected(product.id,variantId)
          apis.request({
              api: 'vitrin.v_updateMyVitrin',parameter: { isSelected, product,variantId },
              onCatch: (error) => {
                  try {
                      let { message, Message } = error.response.data;
                      return message || Message
                  }
                  catch {return 'خطای 1133'}
              },
              onSuccess: () => {
                  if (getIsSelected(product.id,variantId)) { remove(product,variantId)}
                  else {add(product,variantId)}
              }
          })
        },
        fetchData:async ()=>{
          let {apis,userInfo,vitrin} = this.state;
          let started = await apis.request({api: 'vitrin.v_getStarted',loading:false,description: 'دریافت وضعیت ویترین'})
          this.state.vitrin.started = started;
          apis.request({
            api: 'vitrin.v_selected',description: 'دریافت محصولات انتخاب شده ی ویترین',loading:false,
            parameter:userInfo.cardCode,def:[],
            onSuccess:async (list)=>{
              let vitrinSelected = {};
              for(let i = 0; i < list.length; i++){
                let {product,productId,variantId,vartiantId} = list[i];
                vitrinSelected[productId] = vitrinSelected[productId] || {product,variantIds:[]}
                vitrinSelected[productId].variantIds.push(vartiantId || variantId)
              }
              vitrin.update({vitrinSelected})
            }
          });
        }
      },
      getSettleType:(PayDueDate)=>{
        if(PayDueDate === undefined){return}
        let {backOffice} = this.props;
        let PayDueDateOption = backOffice.PayDueDate_options.find((o)=>o.value === PayDueDate);
        if(!PayDueDateOption){return}
        let {cashPercent,days} = PayDueDateOption;
        if(days){
          if(cashPercent){return 4}
          else{return 2}
        }
        else{
          if(cashPercent){return 1}
          else{return}
        }
      },
      Shop_Bundle:{},Shop_Regular:{},
      bazargahOrders: {wait_to_get: undefined,wait_to_send: undefined},
      spreeCategories:{slider_type:[],icon_type:[],dic:{}},
      SetState: (obj) => this.setState(obj),
      cart: {},//{variantId:{count,product,variant}}
      guaranteeItems: [],garanti_products_dic: {},guaranteeExistItems: [],
    };
    let signalR = new SignalR(() => this.state);
    signalR.start();
    this.state.signalR = signalR;
  }
  async componentDidMount() {
    let { b1Info } = this.props;
    let {vitrin} = this.state;
    vitrin.fetchData();
    let {backOffice,actionClass} = this.state;
    await actionClass.startPricing()
    await actionClass.getShopState();
    if (backOffice.activeManager.garanti && b1Info.customer.slpcode) { actionClass.getGuaranteeItems(); }
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
