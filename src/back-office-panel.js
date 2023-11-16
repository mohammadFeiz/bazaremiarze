import React, { Component, createContext, useState,useEffect,useContext } from "react";
import RVD from './npm/react-virtual-dom/react-virtual-dom';
import { Icon } from '@mdi/react';
import { mdiClose, mdiPlusThick, mdiChevronDown, mdiChevronLeft, mdiCheckboxBlankOutline, mdiCheckboxMarkedOutline, mdiImageOutline, mdiTextBoxEditOutline, mdiArrowUp, mdiArrowDown, mdiArrowLeft, mdiArrowLeftBold, mdiDisc, mdiAccountSync, mdiEye, mdiCellphoneMarker, mdiContentSave } from '@mdi/js';
import appContext from "./app-context";
import AIOInput from './npm/aio-input/aio-input';
import AIOStorage from 'aio-storage';
import AIOPopup from './npm/aio-popup/aio-popup';
import backofficebackup from "./back-office-backup";
import './back-office-panel.css';
const BackOfficeContext = createContext();
export default class BackOffice extends Component {
  static contextType = appContext;
  constructor(props) {
    super(props);
    //let model = backofficebackup;
    let {model} = props;
    model = this.fixInitialModel(model)
    this.state = {
      model,
      currentVersions: model.versions,
      tabs:this.getTabs(model),
      tab: 'appsetting'
    }
  }
  fixInitialModel(model){
    return model;
    // let newModel = {
    //   ...model,
    //   PayDueDate_options:model.PayDueDate_options.map((o)=>{
    //     let {percent,value,discountPercent,cashPercent,days,text} = o;
    //     if(discountPercent === undefined){discountPercent = percent}
    //     if(cashPercent === undefined){
    //       if(value === 1){cashPercent = 100;}//
    //       if(value === 2){cashPercent = 0;}//
    //       if(value === 3){cashPercent = 0;}//
    //       if(value === 4){cashPercent = 0;}//
    //       if(value === 6){cashPercent = 0;}//
    //       if(value === 7){cashPercent = 0;}//
    //       if(value === 8){cashPercent = 0;}//
    //       if(value === 9){cashPercent = 0;}//
    //       if(value === 10){cashPercent = 0;}//
    //       if(value === 11){cashPercent = 0;}//
    //       if(value === 12){cashPercent = 0;}//
    //       if(value === 13){cashPercent = 0;}//
    //       if(value === 14){cashPercent = 0;}//
    //       if(value === 15){cashPercent = 25;}//
    //       if(value === 16){cashPercent = 50;}//
    //       if(value === 17){cashPercent = 20;}//
    //       if(value === 18){cashPercent = 30;}//
    //       if(value === 19){cashPercent = 50;}//
    //       if(value === 20){cashPercent = 10;}//
    //       if(value === 21){cashPercent = 10;}//
    //       if(value === 22){cashPercent = 10;}//
    //       if(value === 23){cashPercent = 10;}//
    //       if(value === 24){cashPercent = 50;}//
    //       if(value === 25){cashPercent = 30;}//
    //       if(value === 26){cashPercent = 40;}//
    //       if(value === 27){cashPercent = 50;}//
    //       if(value === 28){cashPercent = 20;}//
    //       if(value === 28){cashPercent = 20;}//
    //       if(value === 38){cashPercent = 40;}//
    //       if(value === 37){cashPercent = 30;}//

    //     }
    //     if(days === undefined){
    //       if(value === 1){days = 0;}//
    //       if(value === 2){days = 15;}//
    //       if(value === 3){days = 30;}//
    //       if(value === 4){days = 45;}//
    //       if(value === 6){days = 60;}//
    //       if(value === 7){days = 70;}//
    //       if(value === 8){days = 90;}//
    //       if(value === 9){days = 105;}//
    //       if(value === 10){days = 120;}//
    //       if(value === 11){days = 135;}//
    //       if(value === 12){days = 150;}//
    //       if(value === 13){days = 165;}//
    //       if(value === 14){days = 180;}//
    //       if(value === 15){days = 60;}//
    //       if(value === 16){days = 90;}//
    //       if(value === 17){days = 90;}//
    //       if(value === 18){days = 120;}//
    //       if(value === 19){days = 150;}//
    //       if(value === 20){days = 30;}//
    //       if(value === 22){days = 90;}//
    //       if(value === 21){days = 60;}//
    //       if(value === 23){days = 120;}//
    //       if(value === 24){days = 30;}//
    //       if(value === 25){days = 60;}//
    //       if(value === 26){days = 90;}//
    //       if(value === 27){days = 120;}//
    //       if(value === 28){days = 60;}//
    //       if(value === 38){days = 120;}//
    //       if(value === 37){days = 90;}//
    //     }
    //     return {value,discountPercent,cashPercent,days,text};
    //   })
    // }
    // return newModel;
  }
  getTabs(model){
    return [
      { text: 'تنظیمات اپ', value: 'appsetting', show: this.hasAccess('appsetting',model) },
      { text: 'مدیریت اسپری', value: 'spreeManagement', show: this.hasAccess('spreeManagement',model) },
      { text: 'مدیریت محتوی', value: 'contentManagement', show: this.hasAccess('contentManagement',model) },
      { text: 'لیست قیمت ها', value: 'priceList', show: this.hasAccess('priceList',model) },
      { text: 'مدیریت دسترسی', value: 'accessmanagement', show: this.hasAccess('accessmanagement',model) },
      { text: 'تنظیمات شیپینگ', value: 'shippingOptions', show: this.hasAccess('shippingOptions',model) },
      { text: 'پیشنهادات ویترین', value: 'vitrinSuggestion', show: this.hasAccess('vitrinSuggestion',model) }
    ]
  }
  hasAccess(tab,model){
    let {phoneNumber} = this.props;
    let {accessPhoneNumbers = []} = model;
    let obj = accessPhoneNumbers.find((o)=>o.phoneNumber === phoneNumber);
    if(obj){return !!obj.access[tab]}
    return false
  }
  componentDidMount() {
    let { tabs, tab } = this.state;
    let visibleTabs = tabs.filter(({ show }) => show)
    if (!visibleTabs.length) { return }
    let activeTab = tab;
    if (!visibleTabs.find((o) => o.value === activeTab)) { activeTab = visibleTabs[0].value; }
    this.setState({ tab: activeTab })
  }
  header_layout() {
    let {rsa} = this.context;
    return {
      size: 48,
      className: 'back-office-header',
      row: [
        { html: 'پنل ادمین', flex: 1, align: 'v' },
        { html: <Icon path={mdiClose} size={1} />, align: 'vh', size: 48,onClick:()=>rsa.removeModal('admin-panel') }
      ]
    }
  }
  body_layout() {
    let { tab } = this.state;
    let html;
    if (tab === 'appsetting') { html = <AppSetting /> }
    else if (tab === 'homecontent') { html = <Content field='homeContent' trans='محتوی صفحه خانه' /> }
    else if (tab === 'shippingOptions') { html = <ShippingOptions /> }
    else if (tab === 'spreeManagement') { html = <SpreeManagement /> }
    else if (tab === 'contentManagement') { html = <ContentManagement /> }
    else if (tab === 'priceList') { html = <PriceList /> }
    else if (tab === 'accessmanagement') { html = <AccessManagement /> }
    else if (tab === 'vitrinSuggestion') { html = <VitrinSuggestion /> }
    return { flex: 1, className: 'ofy-auto', html }
  }
  tabs_layout() {
    let { tab, tabs } = this.state;
    return { html: (<AIOInput type='tabs' className='back-office-primary-tabs' value={tab} options={tabs} onChange={(tab) => this.setState({ tab })} />) }
  }
  modelCorrection(model) {
    let {versions = {}} = model;
    let newVersions = {...versions};
    let list = ['all','campaignProducts','categories','cart']
    for(let i = 0; i < list.length; i++){
      if(newVersions[list[i]] === undefined){
        newVersions[list[i]] = 1;
      }
    }
    model.versions = newVersions;
    return model
  }
  footer_layout() {
    let { apis } = this.context, { tab } = this.state;
    if (tab === 'priceList') { return false }
    return {
      html: <button className='back-office-submit-button' onClick={() => {
        let { model } = this.state;
        model = this.modelCorrection(model);
        apis.request({ api: 'backOffice.set_backoffice', parameter: model, message: {success:true}, description: 'بروزرسانی پنل کمپین', onSuccess: () => {window.location.reload()} })
      }}>بروزرسانی</button>
    }
  }
  getContext() {
    let { apis } = this.context, { model, currentVersions } = this.state;
    return {
      model, currentVersions, apis,
      setModel: (key, value) => {
        let newModel = { ...model, [key]: value }
        this.setState({ model: newModel })
      },
      update:(model)=>this.setState({model,tabs:this.getTabs(model)}),
    }
  }
  render() {
    return (
      <BackOfficeContext.Provider value={this.getContext()}>
        <RVD layout={{ className: 'back-office', column: [this.header_layout(), this.tabs_layout(), this.body_layout(), this.footer_layout()] }} />
      </BackOfficeContext.Provider>
    )
  }
}
class BundleSetting extends Component {
  static contextType = BackOfficeContext;
  form_layout() {
    let { model, setModel } = this.context, { Bundle } = model;
    return { flex: 1, className: 'ofy-auto', html: <FormSetting data={Bundle} onChange={(obj) => setModel('Bundle', obj)} type='Bundle' /> }
  }
  render() { return (<RVD layout={{ flex: 1, className: 'back-office-panel', column: [this.form_layout()] }} />) }
}
class RegularSetting extends Component {
  static contextType = BackOfficeContext;
  form_layout() {
    let { model, setModel } = this.context, { Regular } = model;
    return { flex: 1, className: 'ofy-auto', html: <FormSetting data={Regular} onChange={(obj) => setModel('Regular', obj)} type='Regular' /> }
  }
  render() { return (<RVD layout={{ flex: 1, className: 'back-office-panel', column: [{ size: 12 }, this.form_layout()] }} />) }
}
class AccessManagement extends Component {
  static contextType = BackOfficeContext;
  state = {
    pn:'',
    items:[
      {text:'تنظیمات شیپینگ',value:'shippingOptions'},
      {text:'لیست قیمت',value:'priceList'},
      {text:'مدیریت محتوی',value:'contentManagement'},
      {text:'تنظیمات اپ',value:'appsetting'},
      {text:'مدیریت دسترسی',value:'accessmanagement'},
      {text:'مدیریت اسپری',value:'spreeManagement'},
      {text:'پیشنهاد ویترین',value:'vitrinSuggestion'}
    ]
  }
  header_layout(){
    let {pn} = this.state;
    return {
      className:'p-h-12 fs-12',gap:6,
      row:[
        {html:'افزودن موبایل',align:'v'},
        {flex:1,html:<input className='back-office-input' type='text' style={{width:'100%'}} value={pn} onChange={(e)=>this.setState({pn:e.target.value})}/>,align:'v'},
        {html:<button className='back-office-add-button-2' disabled={!pn} onClick={()=>this.add()}>افزودن</button>}
      ]
    }
  }
  add(){
    let {model,setModel} = this.context;
    let {accessPhoneNumbers = []} = model;
    let {pn} = this.state;
    let addModel = {phoneNumber:pn,access:{shippingOptions:false,spreeManagement:false,priceList:false,contentManagement:false,appsetting:false,accessmanagement:false}}
    setModel('accessPhoneNumbers',accessPhoneNumbers.concat(addModel));
    this.setState({pn:''})
  }
  cards_layout(){
    let {model} = this.context;
    let {accessPhoneNumbers = []} = model;
    return {
      column:accessPhoneNumbers.map((o,i)=>this.card_layout(o,i))
    }
  }
  card_layout({phoneNumber,access,name},index){
    let {items} = this.state; 
    return {
      className:'back-office-access-card',
      column:[
        {
          className:'back-office-access-card-header',gap:3,align:'v',
          row:[
            {html:phoneNumber},
            {flex:1,html:(
              <input 
                placeholder="نام را وارد کنید"
              type='text' value={name} onChange={(e)=>this.changeName(index,e.target.value)} style={{width:'100%',padding:'0 6px',color:'#fff',border:'none',background:'none',outline:'none'}}/>
            )},
            {html:<Icon path={mdiClose} size={.8}/>,align:'vh',size:36,onClick:()=>this.remove(phoneNumber)}
          ]
        },
        {className:'back-office-access-card-body',grid:items.map((o)=>this.row_layout(o,access,phoneNumber)),gridCols:2}
      ]
    }
  }
  changeName(index,name){
    let {model,setModel} = this.context;
    let {accessPhoneNumbers = []} = model;
    setModel('accessPhoneNumbers',accessPhoneNumbers.map((o,i)=>{
      if(index === i){return {...o,name}}
      return o
    }));
  }
  change(field,value,phoneNumber){
    let {model,setModel} = this.context;
    let {accessPhoneNumbers = []} = model;
    setModel('accessPhoneNumbers',accessPhoneNumbers.map((o)=>o.phoneNumber === phoneNumber?{phoneNumber,access:{...o.access,[field]:value}}:o))
  }
  remove(phoneNumber){
    let {model,setModel} = this.context;
    let {accessPhoneNumbers = []} = model;
    setModel('accessPhoneNumbers',accessPhoneNumbers.filter((o)=>o.phoneNumber !== phoneNumber))
  }
  row_layout(item,access,phoneNumber){
    let active = !!access[item.value];
    return {
      className:'back-office-access-card-row',flex:1,
      onClick:()=>this.change(item.value,!active,phoneNumber),
      row:[
        {html:item.text,flex:1,align:'v'},
        {size:36,align:'vh',html:<Icon path={active ? mdiCheckboxMarkedOutline : mdiCheckboxBlankOutline} size={1}/>}
      ]
    }
  }
  render() { return (<RVD layout={{ flex: 1, className: 'back-office-panel ofy-auto', column: [{ size: 12 }, this.header_layout(),this.cards_layout()] }} />) }
}
function VitrinSuggestion(){
  let [items,setItems] = useState([]);
  let [popup] = useState(new AIOPopup())
  let {apis} = useContext(BackOfficeContext);
  useEffect(()=>{
    apis.request({
      api:'backOffice.vitrin_suggestion',
      description:'دریافت لیست پیشنهادات ویترین',
      onSuccess:(items)=>setItems(items)
    })
  },[])
  function remove(id){
    let newItems = items.filter((o)=>o.id !== id)
    setItems(newItems)
  }
  function label_layout(){
    return {
      html:'پیشنهادات ویترین'
    }
  }
  function item_layout(item){
    return {
      className:'back-office-panel of-visible',
      style:{height:72},
      row:[
        {
          size:72,html:<img src={item.url} width='100%' alt=''/>,
          onClick:()=>{
            popup.addModal({
              header:{title:item.name},position:'top',
              body:{
                render:()=>{
                  return (
                    <img src={item.url} width='100%' alt=''/>
                  )
                }
              }
            })
          }
        },
        {
          flex:1,align:'v',className:'p-12',
          column:[
            {
              row:[
                {html:'نام',size:60,aling:'v',style:{opacity:0.7,fontSize:10}},
                {html:item.name,align:'v',flex:1,className:'fs-12'},
              ]
            },
            {
              row:[
                {html:'برند',flex:1,aling:'v',size:60,style:{opacity:0.7,fontSize:10}},
                {html:item.brand,align:'v',flex:1,className:'fs-12'},
              ]
            }
            
          ]  
        },
        {
          className:'align-vh w-24 h-24 br-100 of-visible',style:{position:'absolute',background:'orange',left:-8,top:-8,color:'#fff'},
          html:<Icon path={mdiClose} size={0.8}/>,
          onClick:()=>{
            apis.request({
              api:'backOffice.remove_vitrin_suggestion',
              description:'حذف پیشنهاد ویترین',
              parameter:item.id,
              onSuccess:()=>remove(item.id)
            })
          }
        }
      ]
    }
  }
  function items_layout(){
    return {
      className:'ofy-auto',flex:1,
      column:items.map((o)=>{
        return item_layout(o)
      })
    }
  }
  return (
    <>
    <RVD
      layout={{
        style:{height:'100%'},
        column:[
          label_layout(),
          items_layout()
        ]
      }}
    />
    {popup.render()}
    </>
  )
}
class Content extends Component {
  static contextType = BackOfficeContext;
  constructor(props) {
    super(props);
    this.options = [
      { text: 'بیلبورد', value: 'billboard', before: <Icon path={mdiImageOutline} size={.8} /> },
      { text: 'تصویر', value: 'image', before: <Icon path={mdiImageOutline} size={.8} /> },
      { text: 'لیبل', value: 'label', before: <Icon path={mdiTextBoxEditOutline} size={.8} /> },
      { text: 'متن', value: 'description', before: <Icon path={mdiTextBoxEditOutline} size={.8} /> }
    ]
    this.state = {
      actions: []
    }
  }
  async componentDidMount() {
    let { model } = this.context;
    let actions = [
      { text: 'لینک به تب خرید', value: 'bottomMenu_kharid' },
      { text: 'لینک به تب بازارگاه', value: 'bottomMenu_bazargah' },
      { text: 'لینک به تب ویترین', value: 'bottomMenu_vitrin' },
      { text: 'لینک به تب پروفایل', value: 'bottomMenu_profile' },
      { text: 'لینک به لیست قیمت', value: 'openPopup_priceList' },
      { text: 'لینک به ثبت گارانتی جدید', value: 'openPopup_sabteGarantiJadid' },

    ];
    let { spreeCategories = [] } = model;
    for (let i = 0; i < spreeCategories.length; i++) {
      let { name, id } = spreeCategories[i];
      actions.push({ text: `لینک به دسته بندی ${name}`, value: `category_${id}` })
    }
    let { spreeCampaigns = [] } = model;
    for (let i = 0; i < spreeCampaigns.length; i++) {
      let { name, id } = spreeCampaigns[i];
      actions.push({ text: `لینک به کمپین ${name}`, value: `spreeCampaign_${id}` })
    }
    let { Bundle } = model;
    if (Bundle.active) {
      actions.push({ text: `لینک به باندل`, value: `Bundle` })
    }
    this.setState({ actions })
  }
  add(type) {
    let { setModel } = this.context;
    let { field } = this.props;
    let entity = this.getEntity();
    let id = 'bo_image_' + Math.round(Math.random() * 10000000)
    let obj = {};
    if (type === 'billboard') { obj = { type: 'billboard', url: '', id, active: true, linkTo: '' } }
    else if (type === 'label') { obj = { type: 'label', text: '', linkTo: '', id, active: true } }
    else if (type === 'description') { obj = { type: 'description', text: '', linkTo: '', id, active: true } }
    else if (type === 'image') { obj = { type: 'image', url: '', linkTo: '', id, active: true } }
    setModel(field, entity.concat(obj))
  }
  remove(index) {
    let { setModel } = this.context;
    let { field } = this.props;
    let entity = this.getEntity();
    setModel(field, entity.filter((o, i) => i !== index))
  }
  move(index, dir) {
    let { setModel } = this.context;
    let { field } = this.props;
    let entity = this.getEntity();
    let firstIndex = dir === 'up' ? index - 1 : index;
    let secondIndex = dir === 'up' ? index : index + 1;
    let first = entity[secondIndex]
    let second = entity[firstIndex]
    setModel(field, entity.map((o, i) => {
      if (i === firstIndex) { return first }
      else if (i === secondIndex) { return second }
      else { return o }
    }))
  }
  getEntity() {
    let { model } = this.context;
    let { field } = this.props;
    return model[field] || [];
  }
  setEntity(index, prop, value) {
    let { setModel } = this.context;
    let { field } = this.props;
    let entity = this.getEntity();
    setModel(field, entity.map((o, i) => i === index ? { ...entity[i], [prop]: value } : o))
  }
  getActive() {
    let { model } = this.context;
    let { field } = this.props;
    return model[`active_${field}`];
  }
  setActive(value) {
    let { setModel } = this.context;
    let { field } = this.props;
    setModel(`active_${field}`, value)
  }
  toolbar_layout() {
    let { trans } = this.props;
    let active = this.getActive()
    return {
      className: 'back-office-content-toolbar',
      row: [
        {
          flex: 1,
          html: (
            <AIOInput
              type='select' text={`افزودن آیتم به ${trans}`} options={this.options}
              before={<Icon path={mdiPlusThick} size={.8} />}
              onChange={(value) => this.add(value)} popover={{fitHorizontal:true}}
            />
          )
        },
        { size: 6 },
        {
          size: 32, align: 'vh', className: 'back-office-content-activity',
          html: <Icon path={active ? mdiCheckboxMarkedOutline : mdiCheckboxBlankOutline} size={1} />,
          onClick: () => this.setActive(!active),
        },

      ]
    }
  }
  control_layout(index, isFirst, isLast, typeName) {
    let entity = this.getEntity();
    let item = entity[index];
    return {
      className: 'back-office-content-item-toolbar', gap: 6,
      row: [
        { html: <Icon path={mdiClose} size={0.9} onClick={() => this.remove(index)} />, style: { background: 'orange' } },
        { html: typeName, align: 'v', flex: 1, className: 'fs-10' },
        { show: !isFirst, html: <Icon path={mdiArrowUp} size={0.9} onClick={() => this.move(index, 'up')} />, style: { background: 'rgb(35, 72, 109)' } },
        { show: !isLast, html: <Icon path={mdiArrowDown} size={0.9} onClick={() => this.move(index, 'down')} />, style: { background: 'rgb(35, 72, 109)' } },
        { show: true, html: <Icon path={item.active ? mdiCheckboxMarkedOutline : mdiCheckboxBlankOutline} size={0.9} onClick={() => this.setEntity(index, 'active', !item.active)} />, style: { background: 'rgb(35, 72, 109)' } },
      ]
    }
  }
  link_layout(index) {
    let entity = this.getEntity()
    let { actions } = this.state;
    return {
      className: 'm-b-12 m-h-12',
      row: [
        { html: 'لینک به', align: 'v', className: 'fs-12' },
        { size: 6 },
        {
          flex: 1,
          html: (
            <AIOInput
              search={false}
              type='select' options={actions} value={entity[index].linkTo}
              onChange={(value) => this.setEntity(index, 'linkTo', value)} popover={{fitHorizontal:true}}
              className='back-office-link-to'
            />
          )
        },
      ]
    }
  }
  type_billboard_layout(row, index, isFirst, isLast) {
    let { url, id } = row;
    return {
      className: 'back-office-content-item',
      column: [
        this.control_layout(index, isFirst, isLast, 'بیلبورد'),
        {
          flex: 1, className: 'p-12',
          html: (
            <Image
              id={id}
              url={url} placeholder='تصویر هدر'
              onChange={(url) => this.setEntity(index, 'url', url)}
              style={{ height: 'fit-content', minHeight: 100,width:'100%' }}
            />
          )
        },
        this.link_layout(index)
      ]
    }
  }
  type_label_layout(row, index, isFirst, isLast) {
    let { text } = row;
    return {
      className: 'back-office-content-item',
      column: [
        this.control_layout(index, isFirst, isLast, 'لیبل'),
        {
          flex: 1,
          html: (
            <input
              type='text'
              value={text}
              className='theme-dark-font-color fs-16 bold p-h-0 bold'
              style={{ border: 'none', width: '100%', background: 'none', color: 'inherit' }} placeholder='لیبل را وارد کنید'
              onChange={(e) => this.setEntity(index, 'text', e.target.value)}
            />
          )
        }
      ]
    }
  }
  type_description_layout(row, index, isFirst, isLast) {
    let { text } = row;
    return {
      className: 'back-office-content-item',
      column: [
        this.control_layout(index, isFirst, isLast, 'متن'),
        {
          flex: 1,
          html: (
            <textarea
              value={text} style={{ width: '100%', color: 'inherit', minHeight: 'fit-content', resize: 'vertical', background: 'none', border: 'none', minHeight: 96, padding: 6, fontFamily: 'inherit' }}
              onChange={(e) => this.setEntity(index, 'text', e.target.value)} placeholder="متن مورد نظر را وارد کنید"
            />
          )
        }
      ]
    }
  }
  type_image_layout(row, index, isFirst, isLast) {
    let { url, id } = row;
    return {
      className: 'back-office-content-item',
      column: [
        this.control_layout(index, isFirst, isLast, 'تصویر'),
        {
          flex: 1, className: 'p-12',
          html: (
            <Image
              id={id}
              url={url} placeholder='تصویر بیلبورد'
              onChange={(url) => this.setEntity(index, 'url', url)}
              style={{ height: 'fit-content', minHeight: 100 }}
            />
          )
        },
        this.link_layout(index)
      ]
    }
  }
  render() {
    let entity = this.getEntity();
    return (
      <RVD
        layout={{
          className: 'back-office-content',
          column: [
            this.toolbar_layout(),
            {
              flex: 1, className: 'ofy-auto', gap: 12,
              column: entity.map((o, i) => {
                let { type } = o, isFirst = i === 0, isLast = i === entity.length - 1;
                return this[`type_${type}_layout`](o, i, isFirst, isLast)
              })
            }
          ]
        }}
      />
    )
  }
}
class FormSetting extends Component {
  static contextType = BackOfficeContext;
  getSelectedPayDueDates(){
    let { data } = this.props;
    let {PayDueDates = []} = data;
    let { model } = this.context;
    let { PayDueDate_options } = model;
    return PayDueDate_options.filter(({value})=>{
      return PayDueDates.indexOf(value) !== -1
    })
  }
  render() {
    let { model } = this.context;
    let { SettleType_options, PayDueDate_options, DeliveryType_options, PaymentTime_options } = model;
    let { data, type, onChange, id } = this.props;
    return (
      <AIOInput
        type='form' lang='fa'
        style={{padding:12}}
        value={data}
        className='back-office-form-setting'
        inputs={{
          props:{gap:12},
          column:[
            {
              show: ['Bundle', 'spreeCampaigns', 'spreeCategories'].indexOf(type) !== -1,
              column:[
                {html:'بیلبورد'},
                {
                  label: 'بیلبورد',
                  style:{maxWidth:240},
                  html: () => {
                    return (
                      <Image
                        id={`${type}_${id === undefined ? '' : `${id}_`}billboard`}
                        style={{ minHeight: 74, height: 'fit-content' }}
                        url={data.billboard}
                        onChange={(billboard) => onChange({ ...data, billboard })}
                      />
                    )
                  }
                }
              ]
            },
            {
              column:[
                {html:'آیکون'},
                {
                  show: ['Bundle', 'spreeCampaigns', 'spreeCategories'].indexOf(type) !== -1,
                  type: 'html', label: 'آیکون', rowWidth: 142,
                  html: () => {
                    return (
                      <Image
                        id={`${type}_${id === undefined ? '' : `${id}_`}icon`}
                        url={data.icon}
                        style={{ height: 74, width: 74 }}
                        onChange={(icon) => onChange({ ...data, icon })}
                      />
                    )
                  }
                }
              ]
            },
            {
              show: true,label: 'فعالسازی', field: 'value.active',
              input:{
                type: 'radio', optionStyle: { width: 'fit-content' },
                options: [{ text: 'فعال', value: true }, { text: 'غیر فعال', value: false }] ,
              }
            },
            {
              show: ['Regular', 'Bundle'].indexOf(type) !== -1,
              input:{type: 'text'}, label: 'نام', field: 'value.name',
            },
            {
              show: ['spreeCategories'].indexOf(type) !== -1,label: 'نمایش به صورت', field: 'value.showType',
              input:{
                type: 'radio' ,optionStyle: { width: 'fit-content' },
                options: [{ text: 'آیکون', value: 'icon' }, { text: 'اسلاید', value: 'slider' }]
              }
            },
            {
              show: ['Regular', 'Bundle', 'spreeCampaigns'].indexOf(type) !== -1, 
              input:{type: 'text'}, label: 'B1Id', field: 'value.B1Id'
            },
            {
              show: ['Bundle'].indexOf(type) !== -1,
              input:{type: 'number'}, label: 'سقف تعداد بسته', field: 'value.maxCart'
            },
            {
              show: ['Regular', 'Bundle', 'spreeCampaigns'].indexOf(type) !== -1,
              input:{type: 'multiselect',options: PayDueDate_options, text: 'پرداخت های چکی'}, field: 'value.PayDueDates',
            },
            {
              show: ['Regular', 'Bundle', 'spreeCampaigns'].indexOf(type) !== -1,
              input:{type: 'select',options: this.getSelectedPayDueDates(),popover:{fitHorizontal:true}}, 
              label: 'پیشفرض نوع پرداخت چکی', field: 'value.PayDueDate'
            },
            {
              show: ['Regular', 'Bundle', 'spreeCampaigns'].indexOf(type) !== -1, field: 'value.SettleTypes',
              input:{type: 'multiselect',options: SettleType_options, text: 'نحوه های پرداخت'},
            },
            {
              show: ['Regular', 'Bundle', 'spreeCampaigns'].indexOf(type) !== -1,
              input:{type: 'select',options: SettleType_options,popover:{fitHorizontal:true}}, label: 'پیشفرض نحوه پرداخت', field: 'value.SettleType',
            },
            {
              show: ['Regular', 'Bundle', 'spreeCampaigns'].indexOf(type) !== -1,
              input:{type: 'multiselect',text: 'نحوه های ارسال',options: DeliveryType_options}, field: 'value.DeliveryTypes'
            },
            {
              show: ['Regular', 'Bundle', 'spreeCampaigns'].indexOf(type) !== -1,
              input:{type: 'select',options: DeliveryType_options,popover:{fitHorizontal:true}}, label: 'پیشفرض نحوه ارسال', field: 'value.DeliveryType',
            },
            {
              show: ['Regular', 'Bundle', 'spreeCampaigns'].indexOf(type) !== -1, field: 'value.PaymentTimes',
              input:{type: 'multiselect',options: PaymentTime_options,text: 'زمان های پرداخت'}, 
            },
            {
              show: ['Regular', 'Bundle', 'spreeCampaigns'].indexOf(type) !== -1,
              input:{type: 'select',options: PaymentTime_options,popover:{fitHorizontal:true}}, label: 'پیشفرض زمان پرداخت', field: 'value.PaymentTime',
            },
            
            
            
          ]
        }}
        onChange={(obj) => onChange(obj)}
      />
    )
  }
}
class PriceList extends Component {
  static contextType = BackOfficeContext;
  constructor(props) {
    super(props);
    this.state = { brandText: '', file: undefined, list: [] }
  }
  componentDidMount() {
    let { apis } = this.context;
    apis.request({
      api: 'backOffice.price_list',
      onSuccess: (list) => this.setState({ list })
    })
  }
  submit() {
    let { apis } = this.context;
    let { brandText, file } = this.state;
    apis.request({
      api: 'backOffice.priceList_add',parameter: { brandText, file },description: 'ثبت در لیست قیمت',
      onSuccess: (item) => {
        let { list } = this.state;
        this.setState({ brandText: '', file: undefined, list: [item, ...list] })
      }
    })
  }
  remove(id) {
    let { apis } = this.context;
    let res = window.confirm('از حذف این مورد اطمینان دارید؟')
    if(res !== true){return}
    apis.request({
      api: 'backOffice.priceList_remove',description: 'حذف از لیست قیمت',parameter: id,
      onSuccess: () => {
        let { list } = this.state;
        this.setState({ list: list.filter((o) => o.id !== id) })
      }
    })
  }
  render() {
    let { list, brandText, file } = this.state;
    return (
      <RVD
        layout={{
          flex: 1, gap: 12, className: 'p-t-12',
          column: [
            {
              className: 'back-office-price-list-toolbar',
              row: [
                {
                  flex: 1,
                  column: [
                    {
                      align: 'v',
                      html: (
                        <input
                          type='text' value={brandText}
                          placeholder="نام برند را وارد کنید"
                          onChange={(e) => this.setState({ brandText: e.target.value })}
                          className='br-4 w-100 p-h-6'
                        />
                      )
                    },
                    { size: 6 },
                    {
                      align: 'v',
                      html: (
                        <AIOInput
                          type='file' text={'آپلود فایل'}
                          onChange={(file) => this.setState({ file })}
                          value={file}
                        />
                      )
                    }
                  ]
                },
                { size: 6 },
                {
                  html: (
                    <button
                      disabled={!brandText || !file}
                      style={{ height: 64 }}
                      className='button-2'
                      onClick={() => this.submit()}
                    >ثبت</button>
                  )
                }
              ]
            },
            {
              className: 'ofy-auto', flex: 1, gap: 12,
              column: list.map(({ brand, url, date, fileName, id }) => {
                return {
                  className: 'back-office-price-list-card',
                  column: [
                    {
                      row: [
                        { flex:1,html: brand, className: 'fs-14 bold', align: 'v',style:{textAlign:'right'} },
                        { size:36,html: <Icon path={mdiClose} size={1} />, align: 'vh', onClick: () => this.remove(id) }
                      ]
                    },
                    { size: 12 },
                    { html: date, className: 'fs-12', align: 'v',size:36, },
                    { html: url, className: 't-a-left fs-10' }
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
class SpreeManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabs: [
        { text: 'دسته بندی ها', value: 'spreeCategories', show: true },
        { text: 'خرید عادی', value: 'Regular', show: true },
        { text: 'کمپین های اسپری', value: 'spreeCampaigns', show: true },
        { text: 'باندل', value: 'Bundle', show: true }
      ],
      tab: 'Regular'
    }
  }
  componentDidMount() {
    let { tabs, tab } = this.state;
    let visibleTabs = tabs.filter(({ show }) => show)
    if (!visibleTabs.length) { return }
    let activeTab = tab;
    if (!visibleTabs.find((o) => o.value === activeTab)) { activeTab = visibleTabs[0].value; }
    this.setState({ tab: activeTab })
  }
  tabs_layout() {
    let { tab, tabs } = this.state;
    return { html: (<AIOInput type='tabs' className='back-office-secondary-tabs' value={tab} options={tabs} onChange={(tab) => this.setState({ tab })} />) }
  }
  body_layout() {
    let { tab } = this.state;
    let html;
    if (tab === 'Bundle') { html = <BundleSetting /> }
    else if (tab === 'Regular') { html = <RegularSetting /> }
    else if (tab === 'spreeCampaigns') { html = <SpreeEntity field={tab} /> }
    else if (tab === 'spreeCategories') { html = <SpreeEntity field={tab} /> }
    return { flex: 1, className: 'ofy-auto', html }
  }
  render() {
    return (
      <RVD
        layout={{
          column: [
            this.tabs_layout(),
            this.body_layout()
          ]
        }}
      />
    )
  }
}
class ContentManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabs: [
        { text: 'لندینگ', value: 'landing', show: true },
        { text: 'صفحه خانه', value: 'homeContent', show: true },
      ],
      tab: 'Regular'
    }
  }
  componentDidMount() {
    let { tabs, tab } = this.state;
    let visibleTabs = tabs.filter(({ show }) => show)
    if (!visibleTabs.length) { return }
    let activeTab = tab;
    if (!visibleTabs.find((o) => o.value === activeTab)) { activeTab = visibleTabs[0].value; }
    this.setState({ tab: activeTab })
  }
  tabs_layout() {
    let { tab, tabs } = this.state;
    return { html: (<AIOInput type='tabs' className='back-office-secondary-tabs' value={tab} options={tabs} onChange={(tab) => this.setState({ tab })} />) }
  }
  body_layout() {
    let { tab } = this.state;
    let html;
    if (tab === 'homeContent') { html = <Content field='homeContent' trans='صفحه خانه' /> }
    else if (tab === 'landing') { html = <Content field='landing' trans='لندینگ' /> }
    return { flex: 1, className: 'ofy-auto', html }
  }
  render() {
    return (
      <RVD
        layout={{
          column: [
            this.tabs_layout(),
            this.body_layout()
          ]
        }}
      />
    )
  }
}
class AppSetting extends Component {
  static contextType = BackOfficeContext;
  state = { openDic: {} }
  splitter_layout(text, id, icon) {
    let { openDic } = this.state;
    openDic[id] = openDic[id] === undefined ? true : openDic[id];
    return {
      size: 36, align: 'v', className: 'back-office-splitter',
      onClick: () => this.setState({ openDic: { ...openDic, [id]: !openDic[id] } }),
      row: [
        {
          size: 30, align: 'vh',
          html: <Icon path={!openDic[id] ? mdiChevronLeft : mdiChevronDown} size={.8} />
        },
        { html: text, align: 'v' },
        { flex: 1 },
        { html: <Icon path={icon} size={0.8} />, style: { background: 'orange', color: '#fff', padding: 3, borderRadius: 4 } }

      ]
    }
  }
  version_layout() {
    let { openDic } = this.state;
    if (!openDic.version) { return false }
    let { model, currentVersions = {}, setModel } = this.context;
    let { versions = {} } = model;
    let cls = 'back-office-cachebutton'
    return {
      className: 'back-office-app-setting-item', gap: 6,
      column: Object.keys(versions).map((o) => {
        let currentVersion = currentVersions[o] || 0;
        let version = versions[o] || 0;
        return {
          childsProps: { align: 'v' }, className: 'fs-12',
          row: [
            { html: o, align: 'v', size: 120 },
            { size: 6 },
            {
              show: currentVersion !== version,
              className: 'p-h-6 br-6 align-vh', style: { color: 'dodgerblue', width: 68 },
              gap: 3,
              row: [
                { html: currentVersion, align: 'v' },
                { html: <Icon path={mdiArrowLeftBold} size={.7} />, align: 'vh' },
                { html: version, align: 'v' },
              ]
            },
            {
              show: currentVersion === version,
              className: 'p-h-6 br-6 align-vh', style: { color: 'dodgerblue', width: 68 }, gap: 3, row: [{ html: currentVersion, align: 'v' }]
            },
            { flex: 1 },
            { show: currentVersion === version, html: <button className={cls} onClick={() => setModel('versions', { ...versions, [o]: version + 1 })}>حذف cache</button> },
            { show: currentVersion !== version, html: <button className={cls + ' active'} onClick={() => setModel('versions', { ...versions, [o]: currentVersions[o] })}>حذف شد cache</button> }
          ]
        }
      })
    }
  }
  activeManager_layout() {
    let { openDic } = this.state;
    if (!openDic.activeManager) { return false }
    let { model, setModel } = this.context;
    let { activeManager } = model;
    let options = {
      "garanti": 'گارانتی',
      "bazargah": 'بازارگاه',
      "wallet": 'کیف پول',
      "vitrin": 'ویترین',
      "priceList": 'لیست قیمت'
    }
    activeManager = { ...activeManager }
    return {
      className: 'back-office-app-setting-item',
      html: (
        <AIOInput
          type='form' lang='fa'
          style={{ flex: 'none', width: '100%', height: 'fit-content', background: 'none' }}
          theme={{ rowStyle: { marginBottom: 0 }, bodyStyle: { padding: 0 }, inputStyle: { border: 'none' } }}
          onChange={(obj) => setModel('activeManager', obj)}
          value={activeManager}
          inputs={{
            column:Object.keys(options).map((o) => {
              return { input:{type:'checkbox', text: options[o]}, field: `value.${o}` }
            })
          }}
        />
      )
    }
  }
  bazargah_layout() {
    let { openDic } = this.state;
    if (!openDic.bazargah) { return false }
    let { model, setModel } = this.context;
    let { bazargah = {} } = model;
    return {
      className: 'back-office-app-setting-item',
      html: (
        <AIOInput
          type='form' lang='fa'
          rtl={true}
          style={{ flex: 'none', width: '100%', height: 'fit-content', background: 'none' }}
          theme={{ bodyStyle: { padding: 0 } }}
          value={bazargah}
          inputs={{
            column:[
              { input:{type: 'number',after:'دقیقه' }, field: 'value.forsate_akhze_sefareshe_bazargah', label: 'فرصت اخذ سفارش بازارگاه' },
              { input:{type: 'number',after: 'دقیقه'}, field: 'value.forsate_ersale_sefareshe_bazargah', label: 'فرصت ارسال سفارش بازارگاه' }
            ]
          }}
          onChange={(obj) => setModel('bazargah', obj)}
        />
      )
    }
  }
  download(){
    let {model} = this.context;
    let storage = AIOStorage('bmbof');
    storage.download({file:model,name:'bazar-miarze-back-office-setting'})
  }
  upload(file){
    let {update} = this.context;
    let storage = AIOStorage('bmbof');
    storage.read({file:file,callback:(backOffice)=>update(backOffice)})
  }
  file_layout(){
    return {
      className:'p-12',gap:12,
      row:[
        {html:(<AIOInput type='file' text='آپلود' className='back-office-button' onChange={(file)=>this.upload(file)}/>)},
        {
          html:(
            <button className='back-office-button' onClick={()=>this.download()}>دانلود</button>
          )
        }
      ]
    } 
  }
  render() {
    return (
      <RVD
        layout={{
          className: 'ofy-auto back-office-panel',
          column: [
            { size: 12 },
            this.splitter_layout('مدیریت cache کاربران', 'version', mdiAccountSync),
            this.version_layout(),
            this.splitter_layout('فعالسازی بخش های اپ', 'activeManager', mdiEye),
            this.activeManager_layout(),
            this.splitter_layout('بازارگاه', 'bazargah', mdiCellphoneMarker),
            this.bazargah_layout(),
            this.splitter_layout('مدیریت فایل تنظیمات', 'bazargah', mdiContentSave),
            this.file_layout()
          ]
        }}
      />
    )
  }
}
class Image extends Component {
  static contextType = BackOfficeContext;
  remove() {
    let { onRemove } = this.props;
    onRemove()
  }
  render() {
    let { id, onChange, url, style, placeholder, onRemove } = this.props;
    return (
      <AIOInput
        before={onRemove ? <Icon path={mdiClose} size={1} onClick={(e) => { e.stopPropagation(); this.remove() }} /> : undefined}
        type='file'
        className='back-office-image'
        style={{ ...style }}
        text={!url && placeholder ? placeholder : (<img src={url} alt='' width='100%' />)}
        onChange={async (file) => {
          let { apis } = this.context;
          let { url } = await apis.request({api: 'backOffice.set_file',parameter: { file, name: id }})
          onChange(url);
        }}

      />
    )
  }
}


class SpreeEntity extends Component {
  static contextType = BackOfficeContext;
  state = { openDic: {} }
  trans(type) {
    let { field } = this.props;
    let trans = { 'spreeCampaigns': 'کمپین', 'spreeCategories': 'دسته بندی' }[field]
    return [
      `آی دی ${trans} تعریف شده در اسپری را وارد کنید`,
      `این ${trans} وارد شده است . مجددا نمی توانید این ${trans} را وارد کنید`,
      `دریافت ${trans} های اسپری`,
      `آی دی ${trans} در اسپری موجود نیست`,
      `آیا از حذف این ${trans} اطمینان دارید؟`,
      `لیست ${trans} های اسپری`,
      `افزودن ${trans}`
    ][type]
  }
  getEntity() {
    let { model } = this.context;
    let { field } = this.props;
    return model[field] || []
  }
  async getAddItem(id) {
    let { apis } = this.context;
    let { field } = this.props;
    if (field === 'spreeCampaigns') {
      let list = await apis.request({ api: 'kharid.getCampaigns', description: this.trans(2), def: [], parameter: id })
      if (list[0]) {
        let { name, src, CampaignId, PriceListNum } = list[0];
        return { id, name, billboard: src, CampaignId, PriceListNum, icon: '' }
      }
    }
    else if (field === 'spreeCategories') {
      let list = await apis.request({ api: 'kharid.getCategories', description: this.trans(2), def: [], parameter: [id] })
      if (list[0]) {
        let { name, id } = list[0];
        return { id, name, billboard: '', icon: '', showType: 'icon' }
      }
    }
  }
  async add() {
    let { setModel } = this.context;
    let { field } = this.props;
    let entity = this.getEntity();
    let id = window.prompt(this.trans(0))
    if (id === undefined || id === null) { return }
    if (entity.find((o) => o.id === id)) { alert(this.trans(1)); return }
    let addItem = await this.getAddItem(id);
    if (addItem) { setModel(field, entity.concat(addItem)) }
    else { alert(this.trans(3)) }
  }
  remove(id) {
    let { setModel } = this.context;
    let { field } = this.props;
    let entity = this.getEntity();
    let res = window.confirm(this.trans(4))
    if (res === true) { setModel(field, entity.filter((o) => o.id !== id)) }
  }
  header_layout() {
    return {
      className: 'p-h-12 m-v-12',
      row: [
        { html: this.trans(5), className: 'fs-12 bold', flex: 1, align: 'v' },
        {
          className: 'back-office-add-button', onClick: () => this.add(),
          row: [
            { html: <Icon path={mdiPlusThick} size={.7} />, align: 'vh', size: 24 },
            { html: this.trans(6), align: 'v' }
          ]
        }
      ]
    }
  }
  toolbarIcon_layout(item) {
    let { field } = this.props;
    let html
    if (field === 'spreeCampaigns') {
      html = <div style={{ background: item.active ? '#23486d' : 'orange' }} className='p-h-3 fs-12'>{item.active ? 'فعال' : 'غیر فعال'}</div>
    }
    else if (field === 'spreeCategories') {
      html = <div style={{ background: item.showType === 'slider' ? '#23486d' : 'orange' }} className='p-h-3 fs-12'>{item.showType}</div>
    }
    return { html }
  }
  toolbar_layout(item) {
    let { openDic } = this.state;
    let open = openDic[item.id];
    return {
      className: 'back-office-collapse' + (open ? ' back-office-collapse-open' : ''), align: 'v',
      row: [
        {
          size: 30, align: 'vh',
          html: <Icon path={open ? mdiChevronDown : mdiChevronLeft} size={.8} />,
          onClick: () => this.setState({ openDic: { ...openDic, [item.id]: !open } })
        },
        {
          flex: 1,
          row: [
            { flex: 1, align: 'v', html: `${item.name} (${item.id})` },
            this.toolbarIcon_layout(item)
          ]
        },
        {
          html: <Icon path={mdiClose} size={.7} />, align: 'vh', size: 36,
          onClick: () => this.remove(item.id)
        }
      ]
    }
  }
  form_layout(item) {
    let { setModel } = this.context;
    let { openDic } = this.state, { id } = item;
    if (!openDic[id]) { return false }
    let { field } = this.props;
    return {
      html: (
        <FormSetting
          key={id} type={field} data={item} id={id}
          onChange={(obj) => setModel(field, this.getEntity().map((o) => o.id === id ? { ...item, ...obj } : o))}
        />
      )
    }
  }
  render() {
    let entity = this.getEntity();
    return (
      <RVD
        layout={{
          flex: 1, className: 'back-office-panel',
          column: [
            this.header_layout(),
            {
              flex: 1, className: 'ofy-auto',
              column: entity.map((o) => {
                return { className: 'm-h-12 m-b-12', column: [this.toolbar_layout(o), this.form_layout(o)] }
              })
            }
          ]
        }}

      />
    )
  }
}

class ShippingOptions extends Component {
  static contextType = BackOfficeContext;
  state = { activeTabId: 'PayDueDate_options' }
  getPayDueDateText({cashPercent = 0,days = 0}){
    let res = []
    if(cashPercent){res.push(`${cashPercent}% نقد`)}
    if(days){res.push(`%${100 - cashPercent} چک ${(days / 30).toFixed(1)} ماهه`)}
    return res.join(' - ') 
  }
  tabs_layout() {
    let { activeTabId } = this.state;
    return {
      html: (
        <AIOInput
          type='tabs' className='back-office-secondary-tabs' value={activeTabId}
          options={[
            { text: 'PayDueDate', value: 'PayDueDate_options' },
            { text: 'PaymentTime', value: 'PaymentTime_options' },
            { text: 'SettleType', value: 'SettleType_options' },
            { text: 'DeliveryType', value: 'DeliveryType_options' },
          ]}
          onChange={(activeTabId) => this.setState({ activeTabId })}
        />
      )
    }
  }
  getColumns(activeTabId){
    if(activeTabId === 'PayDueDate_options'){
      let badgeStyle = {background:'dodgerblue',color:'#fff',padding:'0 3px'};
      let base = {titleAttrs:{style:{fontSize:10}},justify: true};
      return [
        { ...base,title: 'درصد نقدی', value: 'row.cashPercent',width:70,input:{type: 'text',before:<div style={badgeStyle}>%</div>}},
        { ...base,title: 'مدت چک(روز)', value: 'row.days',input:{type: 'text',before:({row})=><div style={badgeStyle}>{`${((row.days || 0) / 30).toFixed(1)} ماهه`}</div>}},
        { ...base,title: 'درصد تخفیف', value: 'row.discountPercent', width: 72, input:{type: 'number',before:<div style={badgeStyle}>%</div>} },
        { ...base,title: 'v', value: 'row.value', width: 60, input:{type: 'number'} },
      ]
    }
    else {
      return [
        { title: 'نام', value: 'row.text',input:{type: 'text'}},
        { title: 'v', value: 'row.value', width: 50, justify: true, input:{type: 'number'} },
      ]
    }
  }
  table_layout() {
    let { activeTabId } = this.state;
    let { model,setModel } = this.context;
    return {
      flex: 1,
      html: (
        <AIOInput
          type='table'
          onRemove={true}
          onSwap={true}
          onAdd={()=>{
            let { model } = this.context;
            let newRow;
            if(activeTabId === 'PayDueDate_options'){
              newRow = {value:'',discountPercent:'',cashPercent:'',days:''}
            }
            else {
              newRow = {text:'',value:''}
            }
            setModel(activeTabId, [...model[activeTabId],newRow])
          }}
          key={activeTabId}
          value={model[activeTabId] || []}
          columns={this.getColumns(activeTabId)}
          onChange={(list) => {
            if(activeTabId === 'PayDueDate_options'){
              list = list.map((o)=>{
                return {...o,text:this.getPayDueDateText(o)}
              })
            }
            setModel(activeTabId, list)
          }}
        />
      )
    }
  }
  render() {
    return (
      <RVD
        layout={{
          flex: 1, className: 'ofy-auto',
          column: [
            this.tabs_layout(),
            this.table_layout(),
          ]
        }}
      />
    )
  }
}

