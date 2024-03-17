import React, { Component, createContext, useState, useEffect, useContext } from "react";
import RVD from './npm/react-virtual-dom/react-virtual-dom';
import { Icon } from '@mdi/react';
import { mdiClose, mdiPlusThick, mdiChevronDown, mdiChevronLeft, mdiCheckboxBlankOutline, mdiCheckboxMarkedOutline, mdiImageOutline, mdiTextBoxEditOutline, mdiArrowUp, mdiArrowDown, mdiArrowLeftBold, mdiAccountSync, mdiEye, mdiCellphoneMarker, mdiContentSave, mdiDelete, mdiDotsHorizontal, mdiImage, mdiPhone, mdiAccount, mdiArchive, mdiTag, mdiListBox } from '@mdi/js';
import appContext from "./app-context";
import AIOInput,{Acardion,Tree} from './npm/aio-input/aio-input';
import AIOStorage from 'aio-storage';
import AIOPopup from './npm/aio-popup/aio-popup';
import AIODoc from './npm/aio-documentation/aio-documentation.js';
import './back-office-panel.css';
import { I_AIOService_class, I_ShopProps, I_app_state, I_backOffice_access, I_backOffice_accessKey, I_backOffice_accessPhoneNumber, I_backOffice_content, I_backOffice_versions, I_backOffice_vitrinCategory, I_spreeCategory, I_state_backOffice } from "./types";
const BackOfficeContext = createContext({} as I_BackOfficeContext);

type I_BackOfficeContext = {
  model: I_state_backOffice,
  setModel: (key: string, value: any) => void,
  removeImage: Function,
  apis: I_AIOService_class,
  currentVersions: I_backOffice_versions,
  tabs: I_BackOffice_tab[],
  update: (model: I_state_backOffice) => void,
  rsa:any,
  phoneNumber:string,
  accessKeys:I_backOffice_accessKey[]
}
type I_BackOffice_tab = { text: string, value: string, show: boolean }
type I_BackOffice = {
  model: I_state_backOffice,
  phoneNumber: string
}
type I_BackOffice_tabName = 'appsetting' | 'spreeManagement' | 'contentManagement' | 'priceList' | 'vitrin'
type I_BackOffice_vitrinTab_subTab = 'vitrinSuggestions'|'vitrinCategories'|'vitrinBrands'
export default function BackOffice(props: I_BackOffice) {
  let { rsa, apis }: I_app_state = useContext(appContext);
  let { phoneNumber } = props;
  let [model, setModel] = useState<I_state_backOffice>(fixInitialModel(props.model))
  let [currentVersions] = useState<I_backOffice_versions>(props.model.versions)
  let [tabs, setTabs] = useState(getTabs(props.model))
  let [tab, setTab] = useState<I_BackOffice_tabName>('appsetting')
  let accessKeys:I_backOffice_accessKey[] = ['appsetting','spreeManagement','contentManagement','priceList','vitrinSuggestions','vitrinBrands','vitrinCategories'];
  function fixInitialModel(model: I_state_backOffice) {
    model.versions.all = model.versions.all || 1
    return model;
  }
  function getTabs(model) {
    let tabs:I_BackOffice_tabName[] = ['appsetting', 'spreeManagement', 'contentManagement', 'priceList', 'vitrin']
    let dic = {
      'appsetting': 'تنظیمات',
      'spreeManagement': 'اسپری',
      'contentManagement': 'محتوی',
      'priceList': 'لیست قیمت',
      'vitrin': 'ویترین',
      'test': 'تست'
    }
    let res = tabs.map((tab: I_BackOffice_tabName) => {
      return { text: dic[tab], value: tab, show: hasAccess(tab, model) }
    })
    return res
  }
  useEffect(() => {
    let visibleTabs = tabs.filter(({ show }) => show)
    if (!visibleTabs.length) { return }
    let activeTab = tab;
    if (!visibleTabs.find((o) => o.value === activeTab)) { activeTab = visibleTabs[0].value; }
    setTab(activeTab)
  }, [])
  async function removeImage() {
    return true
  }
  function hasAccess(tab: I_BackOffice_tabName, model: I_state_backOffice) {
    let { accessPhoneNumbers = [] } = model;
    if(phoneNumber === '09123534314' || phoneNumber === '+989123534314'){return true}
    let obj = accessPhoneNumbers.find((o) => o.phoneNumber === phoneNumber);
    if (obj) { 
      if(tab === 'vitrin'){
        let subTabs:I_BackOffice_vitrinTab_subTab[] = ["vitrinCategories","vitrinSuggestions","vitrinBrands"];
        for(let i = 0; i < subTabs.length; i++){
          let subTab:I_BackOffice_vitrinTab_subTab = subTabs[i];
          if(obj.access[subTab]){return true}
        }
        return false
      }
      else {
        return !!obj.access[tab] 
      }
      
    }
    return false
  }
  function header_layout() {
    return {
      size: 48,
      className: 'back-office-header',
      row: [
        { html: 'پنل ادمین', flex: 1, align: 'v' },
        { html: <Icon path={mdiClose} size={1} />, align: 'vh', size: 48, onClick: () => rsa.removeModal('admin-panel') }
      ]
    }
  }
  function body_layout() {
    let html;
    if (tab === 'appsetting') { html = <AppSetting /> }
    else if (tab === 'spreeManagement') { html = <SpreeManagement /> }
    else if (tab === 'contentManagement') { html = <ContentManagement /> }
    else if (tab === 'priceList') { html = <PriceList /> }
    else if (tab === 'vitrin') { html = <Vitrin /> }
    return { flex: 1, className: 'ofy-auto', html }
  }
  function tabs_layout() {
    return { html: (<AIOInput type='tabs' className='back-office-primary-tabs' value={tab} options={tabs} onChange={(tab: I_BackOffice_tabName) => setTab(tab)} />) }
  }
  function modelCorrection(model) {
    // let { versions = {} } = model;
    // let newVersions = { ...versions };
    // let list = ['all', 'campaignProducts', 'categories', 'cart']
    // for (let i = 0; i < list.length; i++) {
    //   if (newVersions[list[i]] === undefined) { newVersions[list[i]] = 1; }
    // }
    // model.versions = newVersions;
    return model
  }
  function footer_layout() {
    if (tab === 'priceList') { return false }
    return {
      html: <button className='back-office-submit-button' onClick={() => {
        let admins = model.accessPhoneNumbers.map((o) => o.phoneNumber)
        model = modelCorrection(model);
        apis.request({ api: 'backOffice.set_backoffice', parameter: { model, admins }, message: { success: true }, description: 'بروزرسانی پنل کمپین', onSuccess: () => { window.location.reload() } })
      }}>بروزرسانی</button>
    }
  }
  function getContext(): I_BackOfficeContext {
    let context: I_BackOfficeContext = {
      model, currentVersions, apis, tabs,rsa,phoneNumber,accessKeys,
      setModel: (key, value) => {
        let newModel: I_state_backOffice = { ...model, [key]: value }
        console.log(newModel)
        setModel(newModel)
      },
      removeImage,
      update: (model: I_state_backOffice) => { setModel(model); setTabs(getTabs(model)) }
    }
    return context;
  }
  return (
    <BackOfficeContext.Provider value={getContext()}>
      <RVD layout={{ className: 'back-office', column: [header_layout(), tabs_layout(), body_layout(), footer_layout()] }} />
    </BackOfficeContext.Provider>
  )
}
function BundleSetting() {
  let { model, setModel }: I_BackOfficeContext = useContext(BackOfficeContext);
  function form_layout() {
    let { Bundle } = model;
    let props: I_FormSetting = { data: Bundle, onChange: (obj: I_ShopProps) => setModel('Bundle', obj), type: 'Bundle', id: 'Bundle' }
    return { flex: 1, className: 'ofy-auto', html: <FormSetting {...props} /> }
  }
  return (<RVD layout={{ flex: 1, className: 'back-office-panel', column: [form_layout()] }} />)
}
function RegularSetting() {
  let { model, setModel }: I_BackOfficeContext = useContext(BackOfficeContext);
  function form_layout() {
    let { Regular } = model;
    let props: I_FormSetting = { data: Regular, onChange: (obj: I_ShopProps) => setModel('Regular', obj), type: 'Regular', id: 'Regular' }
    return { flex: 1, className: 'ofy-auto', html: <FormSetting {...props} /> }
  }
  return (<RVD layout={{ flex: 1, className: 'back-office-panel', column: [{ size: 12 }, form_layout()] }} />)
}
function Vitrin(){
  let { model,phoneNumber }: I_BackOfficeContext = useContext(BackOfficeContext)
  let vitrinTabs:I_BackOffice_vitrinTab_subTab[] = ['vitrinCategories','vitrinBrands','vitrinSuggestions']
  let tabs:I_BackOffice_vitrinTab_subTab[] = vitrinTabs.filter((o:I_BackOffice_vitrinTab_subTab)=>hasAccess(o));
  let trans = {'vitrinSuggestions':'پیشنهادات محصول','vitrinCategories':'دسته بندی ها ','vitrinBrands':'برند ها'};
  let [tab,setTab] = useState<I_BackOffice_vitrinTab_subTab>(tabs[0])
  function hasAccess(tab: I_BackOffice_vitrinTab_subTab) {
    let { accessPhoneNumbers = [] } = model;
    if(phoneNumber === '09123534314' || phoneNumber === '+989123534314'){return true}
    let obj = accessPhoneNumbers.find((o) => o.phoneNumber === phoneNumber);
    if (obj) {return obj.access[tab]}
    return false
  }
  function tabs_layout() {
    return { 
      html: (
        <AIOInput 
          type='tabs' value={tab} options={tabs} optionText={(option)=>trans[option]} optionValue='option' 
          className='back-office-secondary-tabs' 
          onChange={(tab: I_BackOffice_vitrinTab_subTab) => setTab(tab)} />
      ) 
    }
  }
  function body_layout(){
    if(tab === 'vitrinSuggestions'){return {flex:1,html:<VitrinSuggestions/>}}
    if(tab === 'vitrinCategories'){return {flex:1,html:<VitrinCategories/>}}
    if(tab === 'vitrinBrands'){return {flex:1,html:<VitrinBrands/>}}
  }
  return (
    <RVD
      layout={{
        column:[
          tabs_layout(),
          body_layout()
        ]
      }}
    />
  )
}
function VitrinSuggestions() {
  let [items, setItems] = useState([]);
  let [popup] = useState(new AIOPopup())
  let { apis } = useContext(BackOfficeContext);
  useEffect(() => {
    apis.request({
      api: 'backOffice.vitrin_suggestion',
      description: 'دریافت لیست پیشنهادات ویترین',
      onSuccess: (items) => setItems(items)
    })
  }, [])
  function remove(id) {
    let newItems = items.filter((o) => o.id !== id)
    setItems(newItems)
  }
  function label_layout() {
    return {
      html: 'پیشنهادات ویترین',className:'p-12 p-b-0'
    }
  }
  function item_layout(item) {
    return {
      className: 'back-office-panel of-visible',
      row: [
        {
          size: 108, html: <img src={item.url} width='100%' height='108' alt='' />,
          onClick: () => {
            popup.addModal({
              header: { title: item.name }, position: 'top',
              body: {
                render: () => {
                  return (
                    <img src={item.url} width='100%' alt='' />
                  )
                }
              }
            })
          }
        },
        {
          flex: 1, align: 'v', className: 'p-12 p-r-3', gap: 6,
          column: [
            {
              gap: 6,
              row: [
                { html: <Icon path={mdiAccount} size={.8} />, align: 'vh' },
                { flex: 1, html: `${(typeof item.vendorName === 'string' ? item.vendorName : '').slice(0, 12)} ( ${item.cardCode || ''} )`, align: 'v', className: 't-a-right' },
              ]
            },
            {
              gap: 6,
              row: [
                { html: <Icon path={mdiPhone} size={.8} />, align: 'vh' },
                { flex: 1, html: item.phoneNumber || '', align: 'v', className: 't-a-right' }
              ]
            },
            {
              gap: 6,
              row: [
                { html: <Icon path={mdiArchive} size={.8} />, align: 'vh' },
                { flex: 1, html: item.name, align: 'v', className: 't-a-right' },
              ]
            },
            {
              gap: 6,
              row: [
                { html: <Icon path={mdiTag} size={.8} />, align: 'vh' },
                { html: item.brand, align: 'v', flex: 1, className: 't-a-right' },
              ]
            }

          ]
        },
        {
          className: 'align-vh w-24 h-24 br-100 of-visible', style: { position: 'absolute', background: 'orange', left: -8, top: -8, color: '#fff' },
          html: <Icon path={mdiClose} size={0.8} />,
          onClick: () => {
            apis.request({
              api: 'backOffice.remove_vitrin_suggestion',
              description: 'حذف پیشنهاد ویترین',
              parameter: item.id,
              onSuccess: () => remove(item.id)
            })
          }
        }
      ]
    }
  }
  function items_layout() {
    return {
      className: 'ofy-auto', flex: 1,
      column: items.map((o) => {
        return item_layout(o)
      })
    }
  }
  return (
    <>
      <RVD
        layout={{
          style: { height: '100%',color:'#fff' },
          column: [
            label_layout(),
            items_layout()
          ]
        }}
      />
      {popup.render()}
    </>
  )
}
type I_brand_table_row = {name:string}
function VitrinBrands(){
  let { model, setModel,rsa }: I_BackOfficeContext = useContext(BackOfficeContext)
  function add(){
    rsa.addPrompt({
      title:'نام برند را وارد کنید',attrs:{className:'back-office-prompt'},
      onSubmit:(text)=>{
        setModel('vitrinBrands',[...model.vitrinBrands,text])
      }
    })
  }
  return (
    <RVD
      layout={{
        column:[
          {
            align:'v',className:'p-h-12 fs-12 h-36',style:{color:'#fff',background:'rgba(255,255,255,0.1)'},
            row:[
              {html:'برند های قابل فیلتر در ویترین',flex:1},
              {html:<button onClick={()=>add()} className='back-office-add-button'><Icon path={mdiPlusThick} size={0.8}/>افزودن برند</button>}
            ]
          },
          {
            flex:1,
            html:(
              <AIOInput
                type='table'
                style={{height:'100%'}}
                value={(model.vitrinBrands || []).map((o)=>{return {name:o}})}
                columns={[
                  {title:'نام برند',value:'row.name'}
                ]}
                onRemove={true}
                onChange={(rows:I_brand_table_row[])=>{setModel('vitrinBrands',rows.map((o)=>o.name))}}
              />
            )
          }
        ]
      }}
    />
  )
}
type I_Content = { field: 'homeContent' | 'landing' }
type I_Content_entity = 'billboard' | 'image' | 'label' | 'description'
function Content(props: I_Content) {
  let { model, setModel }: I_BackOfficeContext = useContext(BackOfficeContext);
  let { field } = props;
  let entities: I_Content_entity[] = ['billboard', 'image', 'label', 'description']
  let path_dic = { 'billboard': mdiImageOutline, 'image': mdiImageOutline, 'label': mdiTextBoxEditOutline, 'description': mdiTextBoxEditOutline }
  let text_dic = { 'billboard': 'بیلبورد', 'image': 'تصویر', 'label': 'لیبل', 'description': 'متن' }
  let [options] = useState<{ text: string, value: string, before: any }[]>(
    entities.map((o: I_Content_entity) => {
      return { text: text_dic[o], value: o, before: <Icon path={path_dic[o]} size={.8} /> }
    })
  )
  let [actions, setActions] = useState(getActions())
  let entity: I_backOffice_content[] = model[field] || [];
  function getActions() {
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
      let { shopName, shopId } = spreeCampaigns[i];
      actions.push({ text: `لینک به کمپین ${shopName}`, value: `spreeCampaign_${shopId}` })
    }
    let { Bundle } = model;
    if (Bundle.active) {
      actions.push({ text: `لینک به باندل`, value: `Bundle` })
    }
    return actions
  }
  function add(type: I_Content_entity) {
    let id = 'bo_image_' + Math.round(Math.random() * 10000000)
    let obj: I_backOffice_content;
    if (type === 'billboard') { obj = { type: 'billboard', url: '', id, active: true, linkTo: '' } }
    else if (type === 'label') { obj = { type: 'label', text: '', linkTo: '', id, active: true } }
    else if (type === 'description') { obj = { type: 'description', text: '', linkTo: '', id, active: true } }
    else if (type === 'image') { obj = { type: 'image', url: '', linkTo: '', id, active: true } }
    setModel(field, entity.concat(obj))
  }
  function remove(index) {
    setModel(field, entity.filter((o, i) => i !== index))
  }
  function move(index, dir) {
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
  function setEntity(index, prop, value) {
    setModel(field, entity.map((o, i) => i === index ? { ...entity[i], [prop]: value } : o))
  }
  function getActive() {
    return model[`active_${field}`];
  }
  function setActive(value) {
    setModel(`active_${field}`, value)
  }
  function toolbar_layout() {
    let trans = { 'homeContent': 'صفحه خانه', 'landing': 'لندینگ' }[field];
    let active = getActive()
    return {
      className: 'back-office-content-toolbar',
      row: [
        {
          flex: 1,
          html: (
            <AIOInput
              type='select' text={`افزودن آیتم به ${trans}`} options={options}
              before={<Icon path={mdiPlusThick} size={.8} />}
              onChange={(value) => add(value)} popover={{ fitHorizontal: true }}
            />
          )
        },
        { size: 6 },
        {
          size: 32, align: 'vh', className: 'back-office-content-activity',
          html: <Icon path={active ? mdiCheckboxMarkedOutline : mdiCheckboxBlankOutline} size={1} />,
          onClick: () => setActive(!active),
        },

      ]
    }
  }
  function control_layout(index, isFirst, isLast, typeName) {
    let item = entity[index];
    return {
      className: 'back-office-content-item-toolbar', gap: 6,
      row: [
        { html: <Icon path={mdiClose} size={0.9} />, style: { background: 'orange' }, onClick: () => remove(index) },
        { html: typeName, align: 'v', flex: 1, className: 'fs-10' },
        { show: !isFirst, html: <Icon path={mdiArrowUp} size={0.9} />, style: { background: 'rgb(35, 72, 109)' }, onClick: () => move(index, 'up') },
        { show: !isLast, html: <Icon path={mdiArrowDown} size={0.9} />, style: { background: 'rgb(35, 72, 109)' }, onClick: () => move(index, 'down') },
        { show: true, html: <Icon path={item.active ? mdiCheckboxMarkedOutline : mdiCheckboxBlankOutline} size={0.9} />, style: { background: 'rgb(35, 72, 109)' }, onClick: () => setEntity(index, 'active', !item.active) }
      ]
    }
  }
  function link_layout(index) {
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
              onChange={(value) => setEntity(index, 'linkTo', value)} popover={{ fitHorizontal: true }}
              className='back-office-link-to'
            />
          )
        },
      ]
    }
  }
  function type_billboard_layout(row, index, isFirst, isLast) {
    let { url, id } = row;
    return {
      className: 'back-office-content-item',
      column: [
        control_layout(index, isFirst, isLast, 'بیلبورد'),
        {
          flex: 1, className: 'p-12',
          html: (
            <Image
              id={id}
              url={url} placeholder='تصویر هدر'
              onChange={(url) => setEntity(index, 'url', url)}
              style={{ height: 'fit-content', minHeight: 100, width: '100%' }}
            />
          )
        },
        link_layout(index)
      ]
    }
  }
  function type_label_layout(row, index, isFirst, isLast) {
    let { text } = row;
    return {
      className: 'back-office-content-item',
      column: [
        control_layout(index, isFirst, isLast, 'لیبل'),
        {
          flex: 1,
          html: (
            <input
              type='text'
              value={text}
              className='theme-dark-font-color fs-16 bold p-h-0 bold'
              style={{ border: 'none', width: '100%', background: 'none', color: 'inherit' }} placeholder='لیبل را وارد کنید'
              onChange={(e) => setEntity(index, 'text', e.target.value)}
            />
          )
        }
      ]
    }
  }
  function type_description_layout(row, index, isFirst, isLast) {
    let { text } = row;
    return {
      className: 'back-office-content-item',
      column: [
        control_layout(index, isFirst, isLast, 'متن'),
        {
          flex: 1,
          html: (
            <textarea
              value={text} style={{ width: '100%', color: 'inherit', resize: 'vertical', background: 'none', border: 'none', minHeight: 96, padding: 6, fontFamily: 'inherit' }}
              onChange={(e) => setEntity(index, 'text', e.target.value)} placeholder="متن مورد نظر را وارد کنید"
            />
          )
        }
      ]
    }
  }
  function type_image_layout(row, index, isFirst, isLast) {
    let { url, id } = row;
    return {
      className: 'back-office-content-item',
      column: [
        control_layout(index, isFirst, isLast, 'تصویر'),
        {
          flex: 1, className: 'p-12',
          html: (
            <Image
              id={id} url={url} placeholder='تصویر بیلبورد'
              onChange={(url) => setEntity(index, 'url', url)}
              style={{ height: 'fit-content', minHeight: 100 }}
            />
          )
        },
        link_layout(index)
      ]
    }
  }
  return (
    <RVD
      layout={{
        className: 'back-office-content',
        column: [
          toolbar_layout(),
          {
            flex: 1, className: 'ofy-auto', gap: 12,
            column: entity.map((o, i) => {
              let { type } = o, isFirst = i === 0, isLast = i === entity.length - 1;
              if (type === 'billboard') { return type_billboard_layout(o, i, isFirst, isLast) }
              if (type === 'image') { return type_image_layout(o, i, isFirst, isLast) }
              if (type === 'description') { return type_description_layout(o, i, isFirst, isLast) }
              if (type === 'label') { return type_label_layout(o, i, isFirst, isLast) }
            })
          }
        ]
      }}
    />
  )
}
type I_priceList_item = { brand: string, url: string, date: string, fileName: string, id: any }
function PriceList() {
  let { apis }: I_BackOfficeContext = useContext(BackOfficeContext)
  let [brandText, setBrandText] = useState<string>('');
  let [file, setFile] = useState<any>()
  let [list, setList] = useState<any[]>([])
  function getList() { apis.request({ api: 'backOffice.price_list', onSuccess: (list) => setList(list) }) }
  useEffect(() => { getList() }, [])
  function submit() {
    apis.request({
      api: 'backOffice.priceList_add', parameter: { brandText, file }, description: 'ثبت در لیست قیمت',
      onSuccess: (item) => { setBrandText(''); setFile(undefined); setList([item, ...list]) }
    })
  }
  function remove(id) {
    let res = window.confirm('از حذف این مورد اطمینان دارید؟')
    if (res !== true) { return }
    apis.request({
      api: 'backOffice.priceList_remove', description: 'حذف از لیست قیمت', parameter: id,
      onSuccess: () => setList(list.filter((o) => o.id !== id))
    })
  }
  function name_layout() {
    return {
      align: 'v',
      html: (
        <input
          type='text' value={brandText} placeholder="نام برند را وارد کنید"
          onChange={(e) => setBrandText(e.target.value)} className='br-4 w-100 p-h-6'
        />
      )
    }
  }
  function file_layout() {
    return { align: 'v', html: (<AIOInput type='file' text={'آپلود فایل'} onChange={(file) => setFile(file)} value={file} />) }
  }
  function submit_layout() {
    return {
      html: <button disabled={!brandText || !file} style={{ height: 64 }} className='button-2' onClick={() => submit()}>ثبت</button>
    }
  }
  function cards_layout() {
    return { className: 'ofy-auto', flex: 1, gap: 12, column: list.map((o: I_priceList_item) => card_layout(o)) }
  }
  function card_layout(item: I_priceList_item) {
    let { brand, url, date, fileName, id } = item
    return {
      className: 'back-office-price-list-card',
      column: [
        {
          row: [
            { flex: 1, html: brand, className: 'fs-14 bold', align: 'v', style: { textAlign: 'right' } },
            { size: 36, html: <Icon path={mdiClose} size={1} />, align: 'vh', onClick: () => remove(id) }
          ]
        },
        { size: 12 },
        { html: date, className: 'fs-12', align: 'v', size: 36, },
        { html: url, className: 't-a-left fs-10' }
      ]
    }
  }
  return (
    <RVD
      layout={{
        flex: 1, gap: 12, className: 'p-t-12',
        column: [
          {
            className: 'back-office-price-list-toolbar', gap: 6,
            row: [
              { flex: 1, gap: 6, column: [name_layout(), file_layout()] },
              submit_layout()
            ]
          },
          cards_layout()
        ]
      }}
    />
  )
}
type I_SpreeManagement_tab = 'spreeCategories' | 'Regular' | 'spreeCampaigns' | 'Bundle' | 'setting'
function SpreeManagement() {
  let tabValues: I_SpreeManagement_tab[] = ['spreeCategories', 'Regular', 'spreeCampaigns', 'Bundle', 'setting']
  let text_dic = { 'spreeCategories': 'دسته بندی', 'Regular': 'خرید عادی', 'spreeCampaigns': 'کمپین ها', 'Bundle': 'باندل', 'setting': 'تنظیمات' }
  let [tabs] = useState<{ text: string, value: I_SpreeManagement_tab, show: boolean }[]>(
    tabValues.map((tabValue: I_SpreeManagement_tab) => {
      return { text: text_dic[tabValue], value: tabValue, show: true }
    })
  )
  let [tab, setTab] = useState<I_SpreeManagement_tab>('setting')
  useEffect(() => {
    let visibleTabs = tabs.filter(({ show }) => show)
    if (!visibleTabs.length) { return }
    let activeTab = tab;
    if (!visibleTabs.find((o) => o.value === activeTab)) { activeTab = visibleTabs[0].value; }
    setTab(activeTab)
  }, [])
  function tabs_layout() {
    return { html: (<AIOInput type='tabs' className='back-office-secondary-tabs' value={tab} options={tabs} onChange={(tab: I_SpreeManagement_tab) => setTab(tab)} />) }
  }
  function body_layout() {
    let html;
    if (tab === 'Bundle') { html = <BundleSetting /> }
    else if (tab === 'Regular') { html = <RegularSetting /> }
    else if (tab === 'spreeCampaigns') { html = <SpreeCampaigns/> }
    else if (tab === 'spreeCategories') { html = <SpreeCategories/> }
    else if (tab === 'setting') { html = <ShippingOptions /> }
    return { flex: 1, className: 'ofy-auto', html }
  }
  return (<RVD layout={{ column: [tabs_layout(), body_layout()] }} />)
}
type I_ContentManagement_tabValue = 'landing' | 'homeContent';
type I_ContentManagement_tab = { text: string, value: I_ContentManagement_tabValue, show: boolean }
function ContentManagement() {
  let tabValues: I_ContentManagement_tabValue[] = ['landing', 'homeContent']
  let textDic = { 'landing': 'لندینگ', 'homeContent': 'صفحه خانه' }
  let [tabs] = useState<I_ContentManagement_tab[]>(
    tabValues.map((tabValue: I_ContentManagement_tabValue) => { return { text: textDic[tabValue], value: tabValue, show: true } })
  )
  let [tab, setTab] = useState<I_ContentManagement_tabValue>('landing')
  useEffect(() => {
    let visibleTabs = tabs.filter(({ show }) => show)
    if (!visibleTabs.length) { return }
    let activeTab = tab;
    if (!visibleTabs.find((o) => o.value === activeTab)) { activeTab = visibleTabs[0].value; }
    setTab(activeTab)
  }, [])
  function tabs_layout() {
    return { html: (<AIOInput type='tabs' className='back-office-secondary-tabs' value={tab} options={tabs} onChange={(tab) => setTab(tab)} />) }
  }
  function body_layout() {
    let html;
    if (tab === 'homeContent') { html = <Content field='homeContent' /> }
    else if (tab === 'landing') { html = <Content field='landing' /> }
    return { flex: 1, className: 'ofy-auto', html }
  }
  return (<RVD layout={{ column: [tabs_layout(), body_layout()] }} />)
}
type I_Image = { onRemove?: Function, id: any, onChange: (url: string) => void, url?: string, placeholder?: any, style?: any }
function Image(props: I_Image) {
  let { apis }: I_BackOfficeContext = useContext(BackOfficeContext);
  let { onRemove, id, onChange, url, style, placeholder } = props;
  return (
    <AIOInput
      before={onRemove && url ? <div onClick={(e) => { e.stopPropagation(); onRemove() }}><Icon path={mdiClose} size={1} /></div> : undefined}
      type='file' className='back-office-image' style={{ ...style }}
      text={!url && placeholder ? placeholder : (<img src={url} alt='' width='100%' />)}
      onChange={async (file) => {
        let { url } = await apis.request({ api: 'backOffice.set_file', parameter: { file, name: id } })
        onChange(url);
      }}
    />
  )
}
function SpreeCampaigns() {
  let { model, apis, setModel }: I_BackOfficeContext = useContext(BackOfficeContext)
  let [openDic, setOpenDic] = useState({})
  function trans(type) {
    return [
      `آی دی کمپین تعریف شده در اسپری را وارد کنید`,
      `این کمپین وارد شده است . مجددا نمی توانید این کمپین را وارد کنید`,
      `دریافت کمپین های اسپری`,
      `آی دی کمپین در اسپری موجود نیست`,
      `آیا از حذف این کمپین اطمینان دارید؟`,
      `لیست کمپین های اسپری`,
      `افزودن با آی دی`,
      `افزودن با نام`,
      `نام کمپین را وارد کنید`,
    ][type]
  }
  async function getAddItem(id) {
    let list = await apis.request({ api: 'kharid.getCampaigns', description: trans(2), def: [], parameter: id })
    if (list[0]) {
      let { shopName, src, CampaignId, PriceListNum,taxons } = list[0];
      
      let addItem:I_ShopProps = { 
        justActiveForAdmins:false,
        shopId: id, shopName, billboard: src, CampaignId, PriceListNum, icon: '',itemType:'Product' ,
        active:false,PayDueDate:0,PaymentTime:0,DeliveryType:0,PayDueDates:[],PaymentTimes:[],DeliveryTypes:[],taxons
      }
      return addItem;
    }
  }
  async function addById() {
    let { spreeCampaigns = [] } = model;
    let id = window.prompt(trans(0))
    if (id === undefined || id === null) { return }
    if (spreeCampaigns.find((o: I_ShopProps) => o.shopId === id)) { alert(trans(1)); return }
    let addItem = await getAddItem(id);
    if (addItem) { setModel('spreeCampaigns', [...spreeCampaigns, addItem]) }
    else { alert(trans(3)) }
  }
  async function addByName() {
    let { spreeCampaigns = [] } = model;
    let name = window.prompt(trans(0))
    if (name === undefined || name === null) { return }
    if (spreeCampaigns.find((o: I_ShopProps) => o.shopName === name)) { alert(trans(1)); return }
    let addItem = { 
      shopName:name, src:'', CampaignId:'', PriceListNum:'',icon:'',itemType:'Category',shopId:Math.floor(Math.random() * 10000),
      active:false,PayDueDate:0,PaymentTime:0,DeliveryType:0,PayDueDates:[],PaymentTimes:[],DeliveryTypes:[]
    };
    setModel('spreeCampaigns', [...spreeCampaigns, addItem])
  }
  function remove(shopId) {
    let { spreeCampaigns = [] } = model;
    let res = window.confirm(trans(4))
    if (res === true) { setModel('spreeCampaigns', spreeCampaigns.filter((o: I_ShopProps) => o.shopId !== shopId)) }
  }
  function header_layout() {
    return {
      className: 'p-h-12 m-v-12',
      row: [
        { html: trans(5), className: 'fs-12 bold', flex: 1, align: 'v' },
        {
          className: 'back-office-add-button', onClick: () => addById(),
          row: [
            { html: <Icon path={mdiPlusThick} size={.7} />, align: 'vh', size: 24 },
            { html: trans(6), align: 'v' }
          ]
        },
        {
          className: 'back-office-add-button', onClick: () => addByName(),
          row: [
            { html: <Icon path={mdiPlusThick} size={.7} />, align: 'vh', size: 24 },
            { html: trans(7), align: 'v' }
          ]
        }
      ]
    }
  }
  function toolbarIcon_layout(campaign: I_ShopProps) {
    let html = <div style={{ background: campaign.active ? '#23486d' : 'orange' }} className='p-h-3 fs-12'>{campaign.active ? 'فعال' : 'غیر فعال'}</div>
    return { html }
  }
  function toolbar_layout(campaign: I_ShopProps) {
    let open = openDic[campaign.shopId];
    return {
      className: 'back-office-collapse' + (open ? ' back-office-collapse-open' : ''), align: 'v',
      row: [
        {
          size: 30, align: 'vh',
          html: <Icon path={open ? mdiChevronDown : mdiChevronLeft} size={.8} />,
          onClick: () => setOpenDic({ ...openDic, [campaign.shopId]: !open })
        },
        {
          flex: 1,
          row: [
            { flex: 1, align: 'v', html: `${campaign.shopName} (${campaign.shopId})` },
            toolbarIcon_layout(campaign)
          ]
        },
        { html: <Icon path={mdiClose} size={.7} />, align: 'vh', size: 36, onClick: () => remove(campaign.shopId) }
      ]
    }
  }
  function form_layout(campaign: I_ShopProps) {
    let { shopId } = campaign;
    if (!openDic[shopId]) { return false }
    return {
      html: (
        <FormSetting
          key={shopId} type={'spreeCampaigns'} data={campaign} id={shopId}
          onChange={(obj) => setModel('spreeCampaigns', model.spreeCampaigns.map((o) => o.shopId === shopId ? { ...campaign, ...obj } : o))}
        />
      )
    }
  }
  let { spreeCampaigns = [] } = model;
  return (
    <RVD
      layout={{
        flex: 1, className: 'back-office-panel',
        column: [
          header_layout(),
          {
            flex: 1, className: 'ofy-auto',
            column: spreeCampaigns.map((spreeCampaign: I_ShopProps) => {
              return { className: 'm-b-12', column: [toolbar_layout(spreeCampaign), form_layout(spreeCampaign)] }
            })
          }
        ]
      }}
    />
  )
}
function SpreeCategories() {
  let { model, apis, setModel }: I_BackOfficeContext = useContext(BackOfficeContext)
  let [openDic, setOpenDic] = useState({})
  function trans(type) {
    return [
      `آی دی 'دسته بندی' تعریف شده در اسپری را وارد کنید`,
      `این 'دسته بندی' وارد شده است . مجددا نمی توانید این 'دسته بندی' را وارد کنید`,
      `دریافت 'دسته بندی' های اسپری`,
      `آی دی 'دسته بندی' در اسپری موجود نیست`,
      `آیا از حذف این 'دسته بندی' اطمینان دارید؟`,
      `لیست 'دسته بندی' های اسپری`,
      `افزودن 'دسته بندی'`
    ][type]
  }
  async function getAddItem(id) {
    let list = await apis.request({ api: 'kharid.getCategories', description: trans(2), def: [], parameter: [id] })
    if (list[0]) {
      let { name, id } = list[0];
      return { id, name, billboard: '', icon: '', showType: 'icon' }
    }
  }
  async function add() {
    let { spreeCategories = [] } = model;
    let id = window.prompt(trans(0))
    if (id === undefined || id === null) { return }
    if (spreeCategories.find((o) => o.id === id)) { alert(trans(1)); return }
    let addItem = await getAddItem(id);
    if (addItem) { setModel('spreeCategories', [...spreeCategories, addItem]) }
    else { alert(trans(3)) }
  }
  function remove(id) {
    let { spreeCategories = [] } = model;
    let res = window.confirm(trans(4))
    if (res === true) { setModel('spreeCategories', spreeCategories.filter((o: I_spreeCategory) => o.id !== id)) }
  }
  function header_layout() {
    return {
      className: 'p-h-12 m-v-12',
      row: [
        { html: trans(5), className: 'fs-12 bold', flex: 1, align: 'v' },
        {
          className: 'back-office-add-button', onClick: () => add(),
          row: [
            { html: <Icon path={mdiPlusThick} size={.7} />, align: 'vh', size: 24 },
            { html: trans(6), align: 'v' }
          ]
        }
      ]
    }
  }
  function toolbarIcon_layout(category: I_spreeCategory) {
    let html = <div style={{ background: category.showType === 'slider' ? '#23486d' : 'orange' }} className='p-h-3 fs-12'>{category.showType}</div>
    return { html }
  }
  function toolbar_layout(category: I_spreeCategory) {
    let open = openDic[category.id];
    return {
      className: 'back-office-collapse' + (open ? ' back-office-collapse-open' : ''), align: 'v',
      row: [
        {
          size: 30, align: 'vh',
          html: <Icon path={open ? mdiChevronDown : mdiChevronLeft} size={.8} />,
          onClick: () => setOpenDic({ ...openDic, [category.id]: !open })
        },
        {
          flex: 1,
          row: [
            { flex: 1, align: 'v', html: `${category.name} (${category.id})` },
            toolbarIcon_layout(category)
          ]
        },
        { html: <Icon path={mdiClose} size={.7} />, align: 'vh', size: 36, onClick: () => remove(category.id) }
      ]
    }
  }
  function form_layout(category: I_spreeCategory) {
    let { id } = category;
    if (!openDic[id]) { return false }
    let { spreeCategories = [] } = model;
    return {
      html: (
        <FormSetting
          key={id} type={'spreeCategories'} data={category} id={id}
          onChange={(obj) => setModel('spreeCategories', spreeCategories.map((o) => o.id === id ? { ...category, ...obj } : o))}
        />
      )
    }
  }
  let { spreeCategories = [] } = model;
  return (
    <RVD
      layout={{
        flex: 1, className: 'back-office-panel',
        column: [
          header_layout(),
          {
            flex: 1, className: 'ofy-auto',
            column: spreeCategories.map((o: I_spreeCategory) => { return { className: 'm-h-12 m-b-12', column: [toolbar_layout(o), form_layout(o)] } })
          }
        ]
      }}
    />
  )
}
type I_FormSetting = {
  data: I_ShopProps | I_spreeCategory, type: 'spreeCampaigns' | 'spreeCategories' | 'Regular' | 'Bundle',
  onChange: (newShop: I_ShopProps | I_spreeCategory) => void, id: string
}
function FormSetting(props: I_FormSetting) {
  let { model }: I_BackOfficeContext = useContext(BackOfficeContext)
  let { data, type, onChange, id } = props;
  function getSelectedPayDueDates() {
    if (type !== 'spreeCategories') {
      let { PayDueDates = [] } = data as I_ShopProps;
      let { PayDueDate_options } = model;
      return PayDueDate_options.filter(({ value }) => {
        return PayDueDates.indexOf(value) !== -1
      })
    }
    return []
  }
  function change(key,value){
    onChange({...data,[key]:value})
  }
  let { PayDueDate_options, DeliveryType_options, PaymentTime_options } = model;
  return (
    <AIOInput
      type='form' lang='fa' style={{ padding: 12 }} value={{...data}} className='back-office-form-setting'
      inputs={{
        props: { gap: 12 },
        column: [
          {
            show: ['Bundle', 'spreeCampaigns', 'spreeCategories'].indexOf(type) !== -1,
            column: [
              { html: 'بیلبورد' },
              {
                label: 'بیلبورد',
                style: { maxWidth: 240 },
                html: () => {
                  return (
                    <Image
                      id={`${type}_${id === undefined ? '' : `${id}_`}billboard`}
                      style={{ minHeight: 74, height: 'fit-content' }}
                      onRemove={()=>change('billboard','')}
                      url={data.billboard} onChange={(billboard) => change('billboard',billboard)}
                    />
                  )
                }
              }
            ]
          },
          {
            column: [
              { html: 'آیکون' },
              {
                show: ['Bundle', 'spreeCampaigns', 'spreeCategories'].indexOf(type) !== -1,
                type: 'html', label: 'آیکون', rowWidth: 142,
                html: () => {
                  return (
                    <Image
                      id={`${type}_${id === undefined ? '' : `${id}_`}icon`}
                      onRemove={()=>change('icon','')}
                      url={data.icon} style={{ height: 74, width: 74 }} onChange={(icon) => change('icon',icon)}
                    />
                  )
                }
              }
            ]
          },
          {
            show: true, label: 'فعالسازی', field: 'value.active',
            input: {
              type: 'radio', optionStyle: { width: 'fit-content' },
              options: [{ text: 'فعال', value: true }, { text: 'غیر فعال', value: false }],
            }
          },
          {
            show: true, field: 'value.justActiveForAdmins',
            input: {type: 'checkbox',text: 'نمایش فقط برای ادمین'}
          },
          {
            input:{type: 'textarea',inputAttrs:{style:{height:144}}}, label: 'توضیحات', field: 'value.description',
          },
          {
            show: ['Regular', 'Bundle'].indexOf(type) !== -1 || (data as I_ShopProps).itemType === 'Category',
            input: { type: 'text' }, label: 'نام', field: 'value.shopName',
          },
          {
            show: type === 'spreeCampaigns',
            input: { type: 'number' }, label: 'تخفیف مازاد برای نمایش روی کارت محصول', field: 'value.discountPercent',
          },
          {
            show: type === 'spreeCategories', label: 'نمایش به صورت', field: 'value.showType',
            input: {
              type: 'radio', optionStyle: { width: 'fit-content' },
              options: [{ text: 'آیکون', value: 'icon' }, { text: 'اسلاید', value: 'slider' }]
            }
          },
          {
            show: type === 'spreeCampaigns', label: 'نوع محصولات کمپین', field: 'value.itemType',
            input: {
              type: 'radio', optionStyle: { width: 'fit-content' },
              options: (data as I_ShopProps).itemType === 'Category'?[{ text: 'دسته بندی', value: 'Category' }]:[{ text: 'پروداکت', value: 'Product' }, { text: 'تکزون', value: 'Taxon' }]
            }
          },
          {
            show: type !== 'spreeCategories',
            column: [
              {
                input: { type: 'number' }, label: 'CampaignId', field: 'value.CampaignId'
              },
              {
                input: { type: 'multiselect', options: PayDueDate_options, text: 'پرداخت های چکی' }, field: 'value.PayDueDates',
              },
              {
                input: { type: 'select', options: getSelectedPayDueDates(), popover: { fitHorizontal: true } },label: 'پیشفرض نوع پرداخت چکی', field: 'value.PayDueDate'
              },
              {
                input: { type: 'multiselect', text: 'نحوه های ارسال', options: DeliveryType_options }, field: 'value.DeliveryTypes'
              },
              {
                input: { type: 'select', options: DeliveryType_options, popover: { fitHorizontal: true } }, label: 'پیشفرض نحوه ارسال', field: 'value.DeliveryType',
              },
              {
                input: { type: 'multiselect', options: PaymentTime_options, text: 'زمان های پرداخت' },field: 'value.PaymentTimes',
              },
              {
                input: { type: 'select', options: PaymentTime_options, popover: { fitHorizontal: true } }, label: 'پیشفرض زمان پرداخت', field: 'value.PaymentTime',
              }
            ]
          },
          {
            show:type === 'spreeCampaigns' && (data as I_ShopProps).itemType === 'Taxon',
            field:'value.taxons',
            input:{
              type:'table',style:{fontSize:10},
              onAdd:{name:'',id:'',min:0,max:0},
              onRemove:true,
              header:'لیست تکزون های کمپین',
              columns:[
                {title:'Name',value:'row.name',input:{type:'textarea',inputAttrs:{style:{resize:'vertical'}}}},
                {title:'id',value:'row.id',input:{type:'text'},width:60},
                {title:'Min',value:'row.min',input:{type:'number',spin:false},width:56},
                {title:'Max',value:'row.max',input:{type:'number',spin:false},width:56},
                
              ]
            }
          }

        ]
      }}
      onChange={(obj) => onChange(obj)}
    />
  )
}

type I_ShippingOptions_tab = 'PayDueDate_options' | 'PaymentTime_options' | 'DeliveryType_options' | 'bundleData';
function ShippingOptions() {
  let { model, setModel,apis }: I_BackOfficeContext = useContext(BackOfficeContext);
  let [activeTabId, setActiveTabId] = useState<I_ShippingOptions_tab>('bundleData')
  let [orgBundleData,setOrgBundleData] = useState('');
  let [bundleData,setBundleData] = useState(model.bundleData);
  function getPayDueDateText({ cashPercent = 0, days = 0 }) {
    let res = []
    if (cashPercent) { res.push(`${cashPercent}% نقد`) }
    if (days) { res.push(`%${100 - cashPercent} چک ${(days / 30).toFixed(1)} ماهه`) }
    return res.join(' - ')
  }
  function tabs_layout() {
    return {
      html: (
        <AIOInput
          type='tabs' className='back-office-primary-tabs' value={activeTabId}
          options={[
            { text: 'PayDueDate', value: 'PayDueDate_options' },
            { text: 'PaymentTime', value: 'PaymentTime_options' },
            { text: 'DeliveryType', value: 'DeliveryType_options' },
            { text: 'Bundle Data', value: 'bundleData' },
          ]}
          onChange={(activeTabId: I_ShippingOptions_tab) => setActiveTabId(activeTabId)}
        />
      )
    }
  }
  function getColumns(activeTabId) {
    if (activeTabId === 'PayDueDate_options') {
      let base = { titleAttrs: { style: { fontSize: 10 } }, justify: true };
      return [
        { ...base, title: 'درصد نقدی', value: 'row.cashPercent', width: 70, input: { type: 'text', before: <div className='back-office-table-badge'>%</div> } },
        { ...base, title: 'مدت چک(روز)', value: 'row.days', input: { type: 'text', before: ({ row }) => <div className='back-office-table-badge'>{`${((row.days || 0) / 30).toFixed(1)} ماهه`}</div> } },
        { ...base, title: 'درصد تخفیف', value: 'row.discountPercent', width: 72, input: { type: 'number', spin: false, before: <div className='back-office-table-badge'>%</div> } },
        { ...base, title: 'v', value: 'row.value', width: 60, input: { type: 'number' } },
      ]
    }
    else {
      return [
        { title: 'نام', value: 'row.text', input: { type: 'text' } },
        { title: 'v', value: 'row.value', width: 50, justify: true, input: { type: 'number' } },
      ]
    }
  }
  function content_layout(){
    if(activeTabId === 'bundleData'){return bundleData_layout()}
    else {return table_layout()}
  }
  async function fixBundleData(orgBundleData){
    if(!orgBundleData){return false}
    let data;
    try{data = JSON.parse(orgBundleData)}
    catch{}
    let res = await apis.request({api:'kharid.daryafte_ettelaate_bundle',parameter:data,message:{success:true},description:'تبدیل دیتای باندل'})
    if(res){
      setBundleData(res);
      setModel('bundleData',res)
      return true
    }
  }
  function bundleData_layout(){
    return {
      flex: 1,
      column:[
        {
          gap:12,
          row:[
            {html:<button onClick={()=>{
            setOrgBundleData('')
            }}>پاک کردن</button>}
          ]
        },
        {html:'دیتای اصلی',style:{color:'#fff'},className:'p-6'},
        {
          size:60,
          html: (
            <AIOInput
              type='textarea'
              style={{width:'100%',height:'100%',direction:'ltr'}}
              value={!orgBundleData?'':JSON.stringify(orgBundleData,null,4)}
              onChange={async (value)=>{
                let res = await fixBundleData(value);
                if(res){setOrgBundleData(value);}
                else {setOrgBundleData('')}
              }}
              disabled={!!orgBundleData}
            />
          )
        },
        {html:'دیتای اصلاح شده',style:{color:'#fff'},className:'p-6'},
        {
          flex:1,
          html: AIODoc().Code(!bundleData?'':JSON.stringify(bundleData,null,4))
        },
      ]
      
    }
  }
  function table_layout() {
    let rows = model[activeTabId] || [];
    rows = rows.map((o) => {
      let { id = 't' + Math.round(Math.random() * 1000000) } = o;
      return { ...o, id }
    })
    return {
      flex: 1,
      html: (
        <AIOInput
          type='table' onRemove={true} onSwap={true}
          onAdd={() => {
            let newRow;
            let id = 't' + Math.round(Math.random() * 1000000)
            if (activeTabId === 'PayDueDate_options') { newRow = { value: '', discountPercent: '', cashPercent: '', days: '', id } }
            else { newRow = { text: '', value: '', id } }
            setModel(activeTabId, [...model[activeTabId], newRow])
          }}
          key={activeTabId}
          value={rows}
          columns={getColumns(activeTabId)}
          onChange={(list) => {
            if (activeTabId === 'PayDueDate_options') {
              list = list.map((o) => { return { ...o, text: getPayDueDateText(o) } })
            }
            setModel(activeTabId, list)
          }}
        />
      )
    }
  }
  return (<RVD layout={{ flex: 1, className: 'ofy-auto', column: [tabs_layout(), content_layout()] }} />)
}
function AppSetting() {
  function getAfter(icon){return (<div className='back-office-after'><Icon path={icon} size={0.8} /></div>)}
  let items = [
    {id:'version',after:getAfter(mdiAccountSync),name:'مدیریت cache کاربران',content:()=><Versions/>,contentAttrs:{className:'p-12'}},
    {id:'activeManager',after:getAfter(mdiEye),name:'فعالسازی بخش های اپ',content:()=><ActiveManager/>},
    {id:'bazargah',after:getAfter(mdiCellphoneMarker),name:'بازارگاه',content:()=><Bazargah/>},
    {id:'accessManagement',after:getAfter(mdiAccountSync),name:'مدیریت دسترسی',content:()=><AccessManagement/>},
    {id:'filemanager',after:getAfter(mdiContentSave),name:'مدیریت فایل تنظیمات',content:()=><FileManager/>}
  ]
  return (<RVD layout={{className: 'ofy-auto back-office-panel', style: { margin: 0 },html:<Acardion items={items} singleOpen={true}/>}}/>)
}
function Versions() {
  let { model, currentVersions = {}, setModel }: I_BackOfficeContext = useContext(BackOfficeContext);
  let { versions = {} } = model;
  let cls = 'back-office-cachebutton'
  return (
    <RVD
      layout={{
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
      }}
    />
  )
}
function ActiveManager() {
  let { model, setModel }: I_BackOfficeContext = useContext(BackOfficeContext);
  let { activeManager } = model;
  let options = {
    "garanti": 'گارانتی',
    "bazargah": 'بازارگاه',
    "wallet": 'کیف پول',
    "vitrin": 'ویترین',
    "priceList": 'لیست قیمت'
  }
  activeManager = { ...activeManager }
  return (
    <RVD
      layout={{
        className: 'back-office-app-setting-item',
        html: (
          <AIOInput
            type='form' lang='fa'
            style={{ flex: 'none', width: '100%', height: 'fit-content', background: 'none' }}
            bodyAttrs={{ style: { padding: 0 } }}
            theme={{ rowStyle: { marginBottom: 0 }, bodyStyle: { padding: 0 }, inputStyle: { border: 'none' } }}
            onChange={(obj) => setModel('activeManager', obj)}
            value={activeManager}
            inputs={{
              column: Object.keys(options).map((o) => {
                return { input: { type: 'checkbox', text: options[o] }, field: `value.${o}` }
              })
            }}
          />
        )
      }}
    />
  )
}
function Bazargah() {
  let { model, setModel }: I_BackOfficeContext = useContext(BackOfficeContext);
  let { bazargah = {} } = model;
  return (
    <RVD
      layout={{
        className: 'back-office-app-setting-item',
        html: (
          <AIOInput
            type='form' lang='fa'
            rtl={true}
            style={{ flex: 'none', width: '100%', height: 'fit-content', background: 'none' }}
            theme={{ bodyStyle: { padding: 0 } }}
            value={bazargah}
            inputs={{
              column: [
                { input: { type: 'number', after: 'دقیقه' }, field: 'value.forsate_akhze_sefareshe_bazargah', label: 'فرصت اخذ سفارش بازارگاه' },
                { input: { type: 'number', after: 'دقیقه' }, field: 'value.forsate_ersale_sefareshe_bazargah', label: 'فرصت ارسال سفارش بازارگاه' }
              ]
            }}
            onChange={(obj) => setModel('bazargah', obj)}
          />
        )
      }}
    />
  )
}
type I_backOffice_access_item = {text:string,value:I_backOffice_accessKey};
function AccessManagement() {
  let { accessKeys, model, setModel,rsa }: I_BackOfficeContext = useContext(BackOfficeContext);
  let trans = {
    'appsetting': 'تنظیمات',
    'spreeManagement': 'اسپری',
    'contentManagement': 'محتوی',
    'priceList': 'لیست قیمت',
    'vitrinSuggestions': 'پیشنهادات ویترین',
    'vitrinBrands':'برند های ویترین',
    'vitrinCategories':'دسته بندی های ویترین'
  }
  let items:I_backOffice_access_item[] = accessKeys.map((o)=>{return {text:trans[o],value:o}})
  function header_layout() {
    return {
      className: 'p-h-12 fs-12', gap: 6,
      row: [
        { html: <button className='back-office-add-button-2' onClick={() => openAddModal()}>افزودن دسترسی</button> }
      ]
    }
  }
  function openAddModal(){
    rsa.addModal({
      position:'center',
      attrs:{style:{maxWidth:320}},
      backdrop:{attrs:{style:{backdropFilter:'blur(3px)',background:'rgba(0,0,0,0.6)'}}},
      header:{title:'افزودن دسترسی',attrs:{className:'back-office-popup-header'}},
      state:{model:{}},
      body:{
        attrs:{className:'back-office-popup-body'},
        render:({state,setState})=>{
          return (
            <AIOInput
              type='form' value={{...state.model}} lang='fa'
              className='back-office-form'
              onChange={(model)=>setState({model})}
              onSubmit={()=>add(state.model)}
              submitText='ثبت دسترسی'
              inputs={{
                column:[
                  {input:{type:'text'},field:'value.name',label:'نام شخص',validations:[['required']]},
                  {input:{type:'text',justNumber:true,maxLength:11},validations:[['required']],field:'value.phoneNumber',label:'شماره همراه شخص'},
                  {
                    input:{
                      type:'radio',multiple:true,
                      options:accessKeys,
                      optionText:(option)=>trans[option],
                      optionValue:'option'
                    },
                    field:'value.accesses',
                    label:'دسترسی ها'
                  }
                ]
              }}
            />
          )
        }
      }
    })
  }
  function add({name,phoneNumber,accesses}) {
    rsa.removeModal();
    let { accessPhoneNumbers = [] } = model;
    let access = {} as I_backOffice_access;
    for(let i = 0; i < accessKeys.length; i++){
      let accessKey = accessKeys[i];
      let active = accesses.indexOf(accessKey) !== -1;
      access[accessKey] = active;
    }
    let addModel: I_backOffice_accessPhoneNumber = {name, phoneNumber,access}
    setModel('accessPhoneNumbers', accessPhoneNumbers.concat(addModel));
  }
  function cards_layout() {
    let { accessPhoneNumbers = [] } = model;
    return {
      column: accessPhoneNumbers.map((o: I_backOffice_accessPhoneNumber, i) => card_layout(o, i))
    }
  }
  function card_layout(o: I_backOffice_accessPhoneNumber, index: number) {
    let { phoneNumber, access, name } = o
    let isSuperAdmin = phoneNumber === '09123534314' || phoneNumber === '+989123534314'
    return {
      className: 'back-office-access-card',
      column: [
        {
          className: 'back-office-access-card-header', gap: 3, align: 'v',
          row: [
            { html: phoneNumber },
            {
              flex: 1, html: (
                <input
                  placeholder="نام را وارد کنید"
                  type='text' value={name} onChange={(e) => changeName(index, e.target.value)} style={{ width: '100%', padding: '0 6px', color: '#fff', border: 'none', background: 'none', outline: 'none' }} />
              )
            },
            { show: !isSuperAdmin, html: () => <Icon path={mdiClose} size={.8} />, align: 'vh', size: 36, onClick: () => remove(phoneNumber) }
          ]
        },
        { className: 'back-office-access-card-body', grid: items.map((o: I_backOffice_access_item) => row_layout(o, access, phoneNumber)), gridCols: 2 }
      ]
    }
  }
  function changeName(index: number, name: string) {
    let { accessPhoneNumbers = [] } = model;
    setModel('accessPhoneNumbers', accessPhoneNumbers.map((o, i) => {
      if (index === i) { return { ...o, name } }
      return o
    }));
  }
  function change(field, value, phoneNumber) {
    let { accessPhoneNumbers = [] } = model;
    setModel('accessPhoneNumbers', accessPhoneNumbers.map((o: I_backOffice_accessPhoneNumber) => o.phoneNumber === phoneNumber ? { phoneNumber, access: { ...o.access, [field]: value } } : o))
  }
  function remove(phoneNumber: string) {
    let { accessPhoneNumbers = [] } = model;
    setModel('accessPhoneNumbers', accessPhoneNumbers.filter((o: I_backOffice_accessPhoneNumber) => o.phoneNumber !== phoneNumber))
  }
  function row_layout(item: I_backOffice_access_item, access, phoneNumber) {
    let active = !!access[item.value];
    return {
      className: 'back-office-access-card-row', flex: 1,
      onClick: () => change(item.value, !active, phoneNumber),
      row: [
        { html: item.text, flex: 1, align: 'v' },
        { size: 36, align: 'vh', html: <Icon path={active ? mdiCheckboxMarkedOutline : mdiCheckboxBlankOutline} size={1} /> }
      ]
    }
  }
  return (<RVD layout={{ flex: 1, column: [{ size: 12 }, header_layout(), cards_layout()] }} />)
}
function FileManager() {
  let { model, update }: I_BackOfficeContext = useContext(BackOfficeContext);
  function download() {
    let storage = AIOStorage('bmbof');
    storage.download({ file: model, name: 'bazar-miarze-back-office-setting' })
  }
  function upload(file) {
    let storage = AIOStorage('bmbof');
    storage.read({ file: file, callback: (backOffice) => update(backOffice) })
  }
  return (
    <RVD
      layout={{
        className: 'p-12', gap: 12,
        row: [
          { html: <AIOInput type='file' text='آپلود' className='back-office-button' onChange={(file) => upload(file)} /> },
          { html: <AIOInput type='button' className='back-office-button' onClick={() => download()} text='دانلود' /> }
        ]
      }}
    />
  )
}
function VitrinCategories() {
  let { model, setModel }: I_BackOfficeContext = useContext(BackOfficeContext)
  function getOptionIcon(value){
    if(value === 'add'){return <Icon path={mdiPlusThick} size={1} />}
    if(value === 'remove'){return <Icon path={mdiDelete} size={1} />}
  }
  return (
    <Tree
      getOptionBefore={(value)=>getOptionIcon(value)}
      getOprions={(row)=>[]}
      getText={(row)=>`آی دی دسته بندی: ${row.id}`}
      getSubtext={(row)=>row.name}
      onAdd={(parent)=>{
        let id = window.prompt('آی دی دسته بندی را وارد کنید');
        if (typeof id === 'string') {
          let name = window.prompt('نام دسته بندی را وارد کنید');
          if (typeof name === 'string') {
            return { name, id: +id, childs: [] }    
          }  
        }
      }}
      data={model.vitrinCategories || []}
      onRemove={(row,parent)=>true}
      onChange={(data)=>setModel('vitrinCategories', data)}
    />
  )
}
