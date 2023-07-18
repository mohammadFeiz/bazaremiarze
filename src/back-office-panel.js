import React, { Component } from "react";
import RVD from './npm/react-virtual-dom/react-virtual-dom';
import Form from './npm/aio-form-react/aio-form-react';
import { Icon } from '@mdi/react';
import { mdiClose, mdiPlusThick,mdiDelete, mdiDisc, mdiContentSave } from '@mdi/js';
import appContext from "./app-context";
import AIOButton from "./npm/aio-button/aio-button";
import Table from './npm/aio-table/aio-table';
import $ from 'jquery';
export default class BackOffice extends Component {
  static contextType = appContext;
  constructor(props){
    super(props);
    let role = this.getRole();
    this.state = { 
      defaultActiveManager:{
        "garanti": false,
        "belex": false,
        "forooshe_vije": false,
        "campaigns": false,
        "bazargah": false,
        "wallet": false,
        "noorvare3": false,
        "eydane": false,
        "vitrin": false,
        "priceList":false
      },
      model: props.model, 
      tabs:[
        { text: 'فعال سازی', value: 'activeManager',show:['a'].indexOf(role) !== -1 },
        { text: 'شیپینگ', value: 'shipping',show:['a'].indexOf(role) !== -1 },
        { text: 'طرح ها', value: 'tarhHa',show:['a'].indexOf(role) !== -1 },
        { text: 'بازارگاه', value: 'bazargah',show:['a'].indexOf(role) !== -1 },
        { text: 'لیست قیمت ها', value: 'priceList' ,show:['a','b'].indexOf(role) !== -1},
      ],
      tab: 'activeManager', 
      shippingOption: 'PayDueDate_options',
      tarh:false,
    }
  }
  getRole(){
    let {cardCode} = this.props;
    if(cardCode === 'c202528'){return 'b'}
    return 'a'
  }
  componentDidMount() {
    let { kharidApis } = this.context;
    let {tabs} = this.state;
    let visibleTabs = tabs.filter(({show})=>show)
    if(!visibleTabs.length){return}
    this.setState({tab:visibleTabs[0].value})
    kharidApis({
      api:'get_backoffice',
      callback:(model)=>{
        this.setState({ model })
      }
    })
  }
  activeManager_layout() {
    let { model,defaultActiveManager } = this.state;
    let {activeManager} = model;
    activeManager = {...defaultActiveManager,...activeManager}
    return {
      flex: 1, className: 'ofy-auto',
      html: (
        <Form
          theme={{rowStyle:{marginBottom:1}}}
          onChange={(obj)=>{
            model.activeManager = obj;
            this.setState({model})
          }}
          model={activeManager}
          inputs={Object.keys(activeManager).map((o)=>{
            return {type:'checkbox',text:o,field:`model.${o}`}
          })}
        />
      )
    }
  }
  shippingOptions_layout() {
    let { model,shippingOption } = this.state;
    return (
      <Table key={shippingOption}
        model={model[shippingOption]}
        columns={[
          { title: 'نام', field: 'row.text' ,inlineEdit:{type:'text'}},
          { title: 'v', field: 'row.value', width: 50, justify: true,inlineEdit:{type:'number'} },
          { show:shippingOption === 'PayDueDate_options',title: '%', field: 'row.percent', width: 50, justify: true ,inlineEdit:{type:'number'}},
        ]}
        setModel={(list)=>{
          model[shippingOption] = list;
          this.setState({model})
        }}
      />
    )
  }
  shipping_layout() {
    let { shippingOption } = this.state;
    return {
      flex: 1, className: 'ofy-auto',
      column: [
        {
          html: (
            <AIOButton
              type='tabs'
              options={[
                { text: 'PayDueDate', value: 'PayDueDate_options' },
                { text: 'PaymentTime', value: 'PaymentTime_options' },
                { text: 'SettleType', value: 'SettleType_options' },
                { text: 'DeliveryType', value: 'DeliveryType_options' },
              ]}
              fixPopupPosition={(obj)=>{
                let left = $('.rsa').offset().left;
                obj.left = obj.left - left;
                return obj
              }}
              value={shippingOption}
              onChange={(shippingOption) => this.setState({ shippingOption })}
            />
          )
        },
        {
          flex: 1,
          html: this.shippingOptions_layout()
        }
      ]
    }
  }
  header_layout() {
    let {onClose} = this.props;
    return {
      size: 60,
      className: 'p-h-12',
      style: { background: '#eee' },
      row: [
        { html: 'پنل ادمین بازار می ارزه', align: 'v' },
        { flex: 1 },
        { size: 48, html: <Icon path={mdiContentSave} size={1} />, align: 'vh' },
        { size: 48, html: <Icon path={mdiClose} size={1} />, align: 'vh',onClick:()=>onClose() }
      ]
    }
  }
  priceList_layout(){
    let {priceList,priceList_brand,priceList_file} = this.state;
    return {
      flex:1,
      html:<PriceList/>
    }
  }
  tarhHa_layout(){
    let {model,tarh} = this.state;
    let {tarhHa} = model;
    if(!tarhHa){return false}
    let list = Object.keys(tarhHa);
    if(!tarh && list.length){tarh = list[0]}
    return {
      flex:1,
      column:[
        {
          className:'p-v-6',
          row:[
            {size:6},
            {
              flex:1,
              show:!!list.length,
              html:()=>(
                <AIOButton
                  style={{width:'100%',height:36}}
                  fixPopupPosition={(obj)=>{
                    let left = $('.rsa').offset().left;
                    obj.left = obj.left - left;
                    return obj
                  }}
                  type='select'
                  popupWidth='fit'
                  options={list}
                  optionText='option'
                  optionValue='option'
                  value={tarh}
                  onChange={(tarh)=>this.setState({tarh})}
                />
              )
            },
            {size:6},
            {
              show:!!tarh,
              align:'vh',size:36,html:<Icon path={mdiDelete} size={1}/>,style:{background:'red',color:'#fff'},
              onClick:()=>{
                let newTarhHa = {};
                for (let prop in tarhHa){
                  if(prop !== tarh){newTarhHa[prop] = tarhHa[prop]}
                }
                model.tarhHa = newTarhHa;
                this.setState({model,tarh:false})
              }                            
            },
            {size:6},
            {
              align:'vh',size:36,html:(
                <AIOButton
                  type='button' caret={false} style={{background:'none',color:'#fff'}}
                  text={<Icon path={mdiPlusThick} size={1}/>}
                  popOver={({toggle})=>{
                    return <AddCampaign onSubmit={(text)=>{
                      if(model.tarhHa[text]){
                        alert('نام طرح تکراری است')
                      }
                      else {
                        model.tarhHa[text] = {defaultShipping:{}}
                        this.setState({model})
                      }
                      toggle()
                    }}/>
                  }}
                />
              ),style:{background:'dodgerblue'}
            },
            {size:6}
          ]
        },
        {
          show:!!tarh,
          flex:1,className:'ofy-auto',
          html:()=>this.tarh(tarhHa[tarh],tarh)
        }
        
      ]
    }
  }
  tarh({defaultShipping},tarh){
    let {model} = this.state;
    return (
        <Form
          model={defaultShipping}
          theme={{rowStyle:{marginBottom:6},labelStyle:{width:136}}}
          fixPopupPosition={(obj)=>{
              let left = $('.rsa').offset().left;
              obj.left = obj.left - left;
              return obj
          }}
          inputs={[
            {type:'radio',label:'فعالسازی',field:'model.active',options:[{text:'فعال',value:true},{text:'غیر فعال',value:false}],optionWidth:'fit-content'},
            {type:'text',label:'تگزون آی دی',field:'model.id',theme:{inlineLabel:true}},
            {type:'select',field:'model.SettleType',label:'پیشفرض نحوه پرداخت',theme:{inlineLabel:true},options:model.SettleType_options},
            {type:'select',field:'model.PayDueDate',label:'پیشفرض نوع پرداخت چکی',theme:{inlineLabel:true},options:model.PayDueDate_options},
            {type:'select',field:'model.DeliveryType',label:'پیشفرض نحوه ارسال',theme:{inlineLabel:true},options:model.DeliveryType_options},
            {type:'select',field:'model.PaymentTime',label:'پیشفرض زمان پرداخت',theme:{inlineLabel:true},options:model.PaymentTime_options},
            {text:'پرداخت های چکی',type:'multiselect',field:'model.PayDueDateOptions',options:model.PayDueDate_options},
            {text:'نحوه های پرداخت',type:'multiselect',field:'model.SettleTypeOptions',options:model.SettleType_options},
            {text:'زمان های پرداخت',type:'multiselect',field:'model.PaymentTimeOptions',options:model.PaymentTime_options},
            {text:'نحوه های ارسال',type:'multiselect',field:'model.DeliveryTypeOptions',options:model.DeliveryType_options},
          ]}
          onChange={(obj)=>{
            model.tarhHa[tarh].defaultShipping = obj;
            this.setState({model});
          }}
        />
      )
  }
  form_layout() {
    let { tab } = this.state;
    return this[tab + '_layout']()
  }
  bazargah_layout(){
    let { model } = this.state;
    return {
      flex: 1, className: 'ofy-auto',
      html: (
        <Form
          rtl={true}
          theme={{rowStyle:{marginBottom:1},labelStyle:{padding:'0 12px'}}}
          model={model}
          inputs={[
            {type:'number',affix:'دقیقه',field:'model.bazargah.forsate_akhze_sefareshe_bazargah',label:'فرصت اخذ سفارش بازارگاه'},
            {type:'number',affix:'دقیقه',field:'model.bazargah.forsate_ersale_sefareshe_bazargah',label:'فرصت ارسال سفارش بازارگاه'}
          ]}
          onChange={(model)=>this.setState({model})}
        />
      )
    }
  }
  tabs_layout() {
    let { tab,tabs } = this.state;
    return {
      html: (
        <AIOButton
          type='tabs'
          value={tab}
          options={tabs}
          onChange={(tab) => this.setState({ tab })}
        />
      )
    }
  }
  footer_layout(){
    let {kharidApis} = this.context;
    let {tab} = this.state;
    if(tab === 'priceList'){return false}
    return {
      className:'p-6',
      html:<button className='button-2' onClick={()=>{
        let {model} = this.state;
        kharidApis({
          api:'set_backoffice',
          parameter:model,
          successMessage:true,
          name:'بروزرسانی پنل کمپین',
          callback:()=>window.location.reload()
        })
      }}>بروزرسانی</button>
    }
  }
  render() {
    let {model} = this.state;
    console.log(model);
    return (
      <RVD
        layout={{
          style: {background: '#fff',height:'100%' },
          column: [
            this.tabs_layout(),
            this.form_layout(),
            this.footer_layout()
          ]
        }}


      />
    )
  }
}

class AddCampaign extends Component{
  state = {text:''}
  onSubmit(){
    let {text} = this.state;
    let {onSubmit} = this.props;
    onSubmit(text)
  }
  render(){
    let {text} = this.state;
    return (
      <RVD
        layout={{
          className:'p-12',style:{flex:'none',width:'100vw'},
          column:[
            {html:'افزودن طرح جدید'},
            {size:36},
            {html:'نام طرح را وارد کنید',className:'fs-12'},
            {
              flex:1,
              html:(
                <input 
                  style={{width:'100%',height:36}} type='text' value={text} 
                  onChange={(e)=>this.setState({text:e.target.value})}
                />
              ) 
            },
            {size:12},
            {html:(<button className='button-2' onClick={()=>this.onSubmit()}>افزودن</button>)}
          ]
        }}
      />
    )
  }
}


class PriceList extends Component{
  static contextType = appContext;
  constructor(props){
    super(props);
    this.state = {brandText:'',file:undefined,list:[]}
  }
  componentDidMount(){
    let {kharidApis} = this.context;
    kharidApis({
      api:'price_list',
      callback:(list)=>{
        this.setState({ list })
      }
    })
  }
  submit(){
    let {kharidApis} = this.context;
    let {brandText,file} = this.state;
    kharidApis({
      api:'priceList_add',
      parameter:{brandText,file},
      name:'ثبت در لیست قیمت',
      callback:(item)=>{
        let {list} = this.state;
        this.setState({brandText:'',file:undefined,list:[item,...list]})
      }
    })
  }
  remove(id){
    let {kharidApis} = this.context;
    kharidApis({
      api:'priceList_remove',
      name:'حذف از لیست قیمت',
      parameter:id,
      callback:()=>{
        let {list} = this.state;
        this.setState({list:list.filter((o)=>o.id !== id)})  
      }
    })
  }
  render(){
    let {list,brandText,file} = this.state;
    return (
      <RVD
        layout={{
          flex:1,gap:12,className:'p-t-12',
          column:[
            {
              className:'p-12 m-h-12 br-12',
              style:{border:'2px dashed dodgerblue'},
              row:[
                {
                  flex:1,
                  column:[
                    {
                      align:'v',
                      html:(
                        <input 
                          type='text' value={brandText} 
                          placeholder="نام برند را وارد کنید"
                          onChange={(e)=>this.setState({brandText:e.target.value})}
                          style={{height:30,border:'1px solid #ddd'}}
                          className='br-4 w-100 p-h-6'
                        />
                      )
                    },
                    {size:6},
                    {
                      align:'v',
                      html:(
                        <AIOButton 
                          type='file' text={'آپلود فایل'} 
                          onChange={(files)=>this.setState({file:files[0]})}
                          value={file?[file]:[]}
                          style={{background: '#1ca2a7',color: '#fff',borderRadius: 4,marginLeft:6}}
                        />
                      )
                    }
                  ]
                },
                {size:6},
                {
                  html:(
                    <button 
                      disabled={!brandText || !file}
                      style={{height:64}} 
                      className='button-2'
                      onClick={()=>this.submit()}
                    >ثبت</button>
                  )
                }
              ]
            },
            {
              className:'ofy-auto',flex:1,gap:12,
              column:list.map(({brand,url,date,fileName,id})=>{
                return {
                  className:'p-12 m-h-12 br-12',
                  style:{border:'1px solid orange'},
                  column:[
                    {
                      row:[
                        {html:brand,className:'fs-14 bold',align:'v'},
                        {size:6},
                        {html:date,className:'fs-12',align:'v'},
                        {flex:1},
                        {html:<Icon path={mdiClose} size={1}/>,align:'vh',onClick:()=>this.remove(id)}
                      ]
                    },
                    {size:12},
                    {html:url,className:'t-a-left fs-10'}
                  ]
                }
              })
            }
          ]
        }}
      />
    )
  }
}