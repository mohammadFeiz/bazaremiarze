import React, { useContext, useState, useEffect, Component } from "react";
import RVD from '../../npm/react-virtual-dom/react-virtual-dom';
import AIOInput from "../../npm/aio-input/aio-input";
import getSvg from "./getSvg";
import appContext from "../../app-context";
import Loading from './loading';
import Icon from "@mdi/react";
import vbsrc from './../../images/vitrin-bazargah.png';
import { mdiCamera, mdiMagnify, mdiLamp, mdiChevronDown, mdiMenu, mdiChevronLeft, mdiDelete, mdiToggleSwitch } from "@mdi/js";
import './vitrin.css';
import imgph from './../../images/imgph.png';
import image_src from './../../images/vitrin-landing.png';
import vitlan1 from './../../images/vitrin-landing-1.png';
import vitlan2 from './../../images/vitrin-landing-2.png';
import SplitNumber from '../../npm/aio-functions/split-number';
import {IsTouch} from 'aio-utils';
import TreeCategories from '../../npm/aio-functions/tree-category/index';
import notfounrsrc from './../../images/not-found.png';
import { v_kolle_mahsoolat_payload, v_price_suggestion_payload, v_setStarted_payload, vitrinMock } from "../../apis/vitrin-apis";
import { I_app_state, I_vitrin_product, I_vitrin_variant,I_RVD_layout, I_RVD_child } from "../../types";
type I_path = {id:string,show:boolean,name:string,childs?:I_path[]}
export default function Vitrin() {
    let {apis, vitrin, actionClass,backOffice,userInfo}:I_app_state = useContext(appContext);
    let [splash,setSplash] = useState<boolean>(true)
    useEffect(()=>{setTimeout(()=>setSplash(false),2500)},[])
    function start() {
        let parameter:v_setStarted_payload = true;
        apis.request({
            api: 'vitrin.v_setStarted', parameter, description: 'شروع ویترین',
            onSuccess: () => vitrin.update({ started: true }, () => {
                actionClass.openPopup('vitrin-search', {render:()=><Search isFirstTime={true} />})
            })
        })
    }
    if(splash){return <div className='w-100 h-100 align-vh'><Loading/></div> }
    if(!backOffice.activeManager.vitrin && !backOffice.isSuperAdmin(userInfo)){
        return <div className='w-100 h-100 align-vh fs-12'>سرویس ویترین تا اطلاع ثانوی در حال بروز رسانی میباشد</div>    
    }
    let { started } = vitrin;
    if(started === true){return <VitrinPage1 />}
    if(started === false){return <Landing start={() => start()} />}
    return <div className='w-100 h-100 align-vh fs-12'>در حال بارگزاری اطلاعات ویترین</div>
}

function VitrinPage1() {
    let {actionClass, vitrin}:I_app_state = useContext(appContext);
    function count_layout() {
        let { vitrinSelected = {} } = vitrin;
        return {
            align: 'vh', className: 'p-12',
            column: [
                {
                    className: 'w-144 h-144 br-6', style: { border: '1px solid #eee' }, align: 'v',
                    column: [
                        { html: getSvg('svg1'), align: 'vh' },
                        { size: 12 },
                        { html: 'در ویترین شما', className: 'theme-medium-font-color fs-10', align: 'h' },
                        { html: `${Object.keys(vitrinSelected).length} کالا`, align: 'vh', className: 'bold fs-14 theme-dark-font-color', size: 24 },
                    ]
                }
            ]
        }
    }
    function bazargah_billboard_layout() {
        return { html: <img src={vbsrc as string} width='100%' alt='' />, align: 'vh', className: 'm-h-12' }
    }
    function toolbar_layout() {
        let { vitrinSelected } = vitrin;
        return {
            className: 'br-6 p-12 m-b-12 of-visible', style: { background: '#fff' },
            row: [
                { html: getSvg('svg2'), style: { background: '#3b55a5', padding: 3, width: 36, height: 36, borderRadius: '100%' }, align: 'vh' },
                { size: 12 },
                { flex: 1, className: 'fs-14 bold', html: 'ویترین من', align: 'v' },
                {
                    show: !!vitrinSelected, html: (<button onClick={() => {
                        let render = () => (<Search isFirstTime={false}/>)
                        actionClass.openPopup('vitrin-search', { render })
                    }} className='button-2'>افزودن کالای جدید</button>)
                },
                {html: <button className='button-1 m-r-8'>تاریخچه قیمت های پیشنهادی</button>}
            ]
        }
    }

    function products_layout() {return { html: <SelectedProducts /> }}
    return (
        <RVD
            layout={{
                className: 'theme-popup-bg ofy-auto m-b-24', flex: 1,
                column: [count_layout(), bazargah_billboard_layout(), toolbar_layout(), products_layout()]
            }}
        />
    )
}
type I_paging = {
    number:number,size:number,sizes:number[],serverSide:boolean,length:number,onChange:(obj:any)=>void
}
type I_Search = {isFirstTime:boolean}
type I_Search_state = {
    categories:any[],
    taxon:false | number,
    categoryPath:I_path[],
    searchValue:string,
    products:I_vitrin_product[],
    total:false | number,
    brand:any,
    paging:I_paging
}
class Search extends Component<I_Search,I_Search_state> {
    static contextType = appContext;
    constructor(props){
        super(props);
        this.state = {
           categories:[],
           taxon:false,
           categoryPath:[],
           searchValue:'',
           products:[],
           total:false,
           brand:{},
           paging:this.getInitialPaging()
        }
    }
    changePaging(obj){
        let {paging} = this.state;
        let newPaging:I_paging = { ...paging, ...obj }
        this.setState({paging:newPaging},()=>this.updateProducts())
    }
    getInitialPaging(){
        return {
            number: 1, size: 20, sizes: [10, 20, 40, 100], serverSide: true, length: 0,
            onChange: (obj)=>this.changePaging(obj)
        }
    }
    async updateProducts() {
        let {backOffice,apis} = this.context as I_app_state;
        let {searchValue,taxon,paging,brand} = this.state;
        this.setState({products:undefined})
        let parameter:v_kolle_mahsoolat_payload = { pageSize: paging.size, pageNumber: paging.number, searchValue, taxon: taxon || '10673'}
        let activeBrands = backOffice.vitrinBrands.filter((o)=>brand[o])
        if(activeBrands.length){
            parameter.optionTypeFilters = [{optionTypeName:'برند',optionValueNames:activeBrands}]
        }
        let { products, total } = await apis.request({
            api: 'vitrin.v_kolle_mahsoolat', description: 'دریافت لیست محصولات قابل انتخاب ویترین', loading: false,def:[],parameter
        })
        this.setState({products,paging:{ ...paging, length: total },total});
    }
    componentDidMount(){
        let {backOffice} = this.context as I_app_state;
        this.setState({categories:backOffice.vitrinCategories})
        this.updateProducts()
    }
    changeSearch(value) {
        let {msfReport} = this.context as I_app_state;
        if (value.length > 3) {
            msfReport({ actionName: 'vitrin search', actionId: 56, targetName: value, tagName: 'vitrin', eventName: 'action' })
        }
        let {paging} = this.state;
        let newPaging:I_paging = {...paging,number:1}
        paging = newPaging;
        this.setState({paging:newPaging,searchValue:value},()=>this.updateProducts())
    }
    header_layout() {
        let {isFirstTime} = this.props;
        return !isFirstTime ? false : { html: <Box type='description' /> }
    }
    changeBrand(value){
        let {brand} = this.state;
        this.setState({brand:{...brand,[value]:!brand[value]}},()=>this.updateProducts()) 
    }
    brands_layout(){
        let {backOffice} = this.context as I_app_state;
        let {brand} = this.state;
        let className = 'vitrin-brand-filter';
        if(IsTouch()){className += ' hide-scroll'}
        return {
            align:'v',className,
            row:backOffice.vitrinBrands.map((o:string)=>{
                let active = brand[o];
                return (
                    {
                        align:'vh',
                        html:(
                            <button onClick={()=>this.changeBrand(o)} className={'vitrin-brand-button' + (active?' active':'')}>{o}</button>
                        )
                    }
                )
            })
        }
    }
    body_layout() {
        let {rsa} = this.context as I_app_state;
        let {isFirstTime} = this.props;
        let {products,paging} = this.state;
        return {
            flex: 1,
            column: [
                {
                    flex: 1, className: 'ofy-auto',
                    column: [
                        this.search_layout(),
                        this.categories_layout(),
                        //brands_layout(),
                        this.products_layout(products, paging),
                        this.suggestion_layout(isFirstTime)
                    ]
                },
                this.inter_layout(isFirstTime, rsa.removeModal)
            ]
        }
    }
    search_layout() {
        let className = 'vitrin-search-box gap-4', placeholder = "جستجو در محصولات", before = <Icon path={mdiMagnify} size={1} />
        let props = { type: 'text', className, placeholder, before, onChange: (value) => { console.log(value); this.changeSearch(value) }, delay: 1200 }
        return { html: <AIOInput {...props} /> }
    }
    // function categories_layout(categories,total){
    //     let props = {rtl:true,total,categories,onChange:(taxon) => changeCategory(taxon)}
    //     return !categories.length?false:{className: 'm-h-6',html: <TreeCategories {...props} />}
    // }
    getCategoryTitle() {
        let {categoryPath} = this.state;
        if (!categoryPath.length) { return 'دسته بندی محصولات' }
        let res = [];
        for (let i = 0; i < categoryPath.length; i++) {
            let o = categoryPath[i];
            if (o.show !== false) {
                res.push(o.name)
            }
        }
        return res.join(' / ')
    }
    changeCategory(pathes:I_path[]) {
        let {msfReport} = this.context as I_app_state;
        let {paging,taxon} = this.state;
        let lastPath:I_path = pathes[pathes.length - 1];
        let newTaxon = lastPath.id;
        msfReport({ actionName: 'vitrin filter by category', actionId: 57, targetName: pathes.map((o:I_path)=>o.name).join('/'), targetId: taxon, tagName: 'vitrin', eventName: 'action' })
        let newPaging:I_paging = { ...paging, number: 1 }
        this.setState({paging:newPaging,categoryPath:pathes,taxon:newTaxon,total:false},()=>this.updateProducts())
    }
    openCategories() {
        let {actionClass,rsa} = this.context as I_app_state;
        let render = () => {
            let {categories,total} = this.state;
            let props = { rtl: true, total, categories, onChange: (taxon) => { this.changeCategory(taxon); rsa.removeModal() } }
            return <Categories {...props} />
        }
        actionClass.openPopup('vitrin-categories', { render })
    }
    categories_layout() {
        let {categories} = this.state;
        if (!categories.length) { return false }
        return {
            className: 'p-8 bg-32',
            column: [
                {
                    html: <AIOInput
                        type='button'
                        style={{ width: 'fit-content', minHeight: 30, padding: '0 12px', textAlign: 'right',color:'#3B55A5' }}
                        className='fs-14 bold h-24 p-0 w-100'
                        text={this.getCategoryTitle()}
                        before={<Icon path={mdiMenu} size={1} />}
                        after={<Icon path={mdiChevronLeft} size={1} />}
                        onClick={() => this.openCategories()}
                    />
                },
            ]
        }
    }
    products_layout(products, paging) {
        let props = { type: 'table',style:{border:'none'}, value: products, paging, rowsTemplate: () => <Products products={products} count={paging.size}/> }
        return { html: <AIOInput {...props} /> }
    }
    suggestion_layout(isFirstTime:boolean) {
        return !!isFirstTime ? false : { className: 'p-24', style: { background: '#eee' }, html: () => <Suggestion /> }
    }
    inter_layout(isFirstTime:boolean, removeModal) {
        return !isFirstTime ? false : {
            className: 'm-12', align: 'vh',
            html: () => <button onClick={() => removeModal()} className='button-2'>تایید و ورود به ویترین من</button>
        }
    }
    render(){
        return (<RVD layout={{ className: 'theme-popup-bg', column: [this.header_layout(), this.body_layout()] }} />)
    }
}
type I_Categories = {categories?:any[],onChange:(path:I_path[])=>void}
function Categories(props:I_Categories) {
    let { categories = [], onChange } = props || {}
    let [path, setPath] = useState<I_path[]>([]);
    function level0_layout() {
        return {
            className: 'categories-level-0',
            column: categories.map((o:I_path) => level0_item(o))
        }
    }
    function level0_item(obj:I_path) {
        let { name, id } = obj;
        return {
            className: 'categories-level-0-item' + (path[0] && id === path[0].id ? ' active' : ''),
            onClick: () => setPath([{ ...obj }]),
            column: [
                { html: <Icon path={mdiLamp} size={1} /> },
                { html: name, className: 'categories-level-0-item-text' }
            ]
        }
    }
    function level1_layout() {
        if (!path[0]) { return false }
        let item = categories.find((o) => o.id === path[0].id)
        let childs = [...(item.childs || [])]
        return {
            flex: 1, className: 'categories-level-1',
            column: [
                level2_item({ childs: [], name: `کل دسته بندی ${item.name}`, id: item.id, show: false }, true),
                { column: childs.map((o) => level1_item(o)) }
            ]
        }
    }
    function level1_item(obj) {
        let { name, id } = obj;
        let newChild:I_path = { childs: [], name: `کل دسته بندی ${obj.name}`, id, show: false };
        let childs = [newChild, ...obj.childs]
        let level1Id = path[1] ? path[1].id : false;
        console.log(level1Id);
        let showChilds = obj.id === level1Id;
        return {
            onClick: () => {
                if (path[1] && path[1].id === id) { setPath([path[0]]) }
                else { setPath([{ ...path[0] }, { ...obj }]) }
            },
            column: [
                {
                    className: 'categories-level-1-item',
                    row: [
                        { align: 'v', html: name, flex: 1 },
                        { align: 'vh', html: <Icon path={mdiChevronDown} size={1} /> }
                    ]
                },
                {
                    show: showChilds,
                    flex: 1, className: 'categories-level-2',
                    column: childs.map((o:I_path) => level2_item(o,false))
                }
            ]
        }
    }
    function level2_item(obj:I_path, isRoot:boolean) {
        let { name } = obj;
        return {
            className: 'categories-level-2-item' + (isRoot ? ' is-root' : ''),
            onClick: () => onChange(path.concat(obj)),
            row: [
                { align: 'v', html: name, flex: 1 }
            ]
        }
    }
    return (<RVD layout={{ className: 'categories-popup', row: [level0_layout(), level1_layout()] }} />);
}
type I_Box = {styleType?:0 | 1,type:'description',icon?:React.ReactNode,texts?:{show?:boolean,className:string,html:React.ReactNode}[],after?:React.ReactNode,onClick?:Function}
function Box(props:I_Box) {
    let { styleType = 0,type, icon, texts, after, onClick } = props;
    function getStyle() {
        return [
            { background: 'linear-gradient(180deg, #EFF0FF -50.48%, #8FA7FE 308.1%)', color: '#032979' },
            { background: 'linear-gradient(270deg, #405AAA -4.27%, #617CD0 105.33%)', color: '#fff', borderRadius: 12 }
        ][styleType];
    }
    function getProps() {
        if (type === 'description') {
            texts = [
                { className: 'fs-14 bold', html: 'گام اول: انتخاب محصولات' },
                { className: 'fs-16 bold', html: 'محصولات مورد نظرتان را به ویترین اضافه کنید' },
                { className: 'fs-12 theme-medium-font-color', html: 'بر روی  + محصول مورد نظر ضربه بزنید' },
            ]
        }
        return { icon, texts, after, onClick }
    }
    return (
        <RVD
            layout={{
                onClick, style: getStyle(), gap: 12,
                row: [
                    { html: '' },
                    { align: 'vh', html: icon, show: !!icon },
                    { flex: 1, column: [{ size: 16 }, { gap: 3, column: texts.filter(({ show }) => show !== false) }, { size: 16 }] },
                    { show: !!after, html: after, align: 'vh' },
                    { html: '' }
                ]
            }}
        />
    )
    
}
function Suggestion() {
    let { apis }:I_app_state = useContext(appContext);
    async function addSuggestion() {
        apis.request({
            api: 'vitrin.addSuggestion', description: 'پیشنهاد افزودن محصول به ویترین', parameter: suggestion, message: { success: true },
            onSuccess: () => setSuggestion({ name: '', file: undefined, brand: '' })
        })
    }
    let [suggestion, setSuggestion] = useState<{name:string,file?:any,brand:string}>({ name: '', file: undefined, brand: '' });
    return (
        <AIOInput
            type='form' lang='fa' value={{ ...suggestion }} submitText='ثبت' inputStyle={{ border: 'none' }}
            onChange={(obj) => setSuggestion(obj)}
            footerAttrs={{ className: 'vitrin-suggestion-footer' }}
            onSubmit={() => addSuggestion()}
            inputs={{
                column: [
                    { html: 'درخواست افزودن محصول', className: 'fs-18 bold theme-dark-font-color' },
                    { size: 12 },
                    {
                        html: 'ما به سرعت در حال اضافه کردن محصولات جدید به می ارزه هستیم. نام محصول پیشنهادی خود را برای ما بفرستید تا ما در اولویت قرار دهیم.',
                        className: 'fs-12 theme-medium-font-color t-a-right'
                    },
                    { size: 24 },
                    { input: { type: 'text', placeholder: 'نام کامل محصول' }, label: 'نام محصول', field: 'value.name', validations: [['required']] },
                    { input: { type: 'text', placeholder: 'برند محصول' }, label: 'برند محصول', field: 'value.brand', validations: [['required']] },
                    {
                        input: { type: 'image', placeholder: <Icon path={mdiCamera} size={1} />, width: '100%' },
                        label: 'تصویر محصول', field: 'value.image', validations: [['required']]
                    },
                ]
            }}
        />
    )
}
function getMockProducts(count) {
    let { result } = vitrinMock().v_getProducts(count)
    return result.products
}
function getMockVitrinSelected() {
    return vitrinMock().v_mockVitrinSelected()
}
type I_Products = {products?:I_vitrin_product[],count:number}
function Products(props:I_Products) {
    let {products,count} = props;
    let Products;
    if (!products) { Products = getMockProducts(count) }
    else { Products = products }
    let list = Products.map((o) => {
        return { html: <ProductCard product={o} loading={!products} /> }
    })
    let layout;
    if(!list.length){
        layout = { 
            align:'vh',
            column:[
                {html:<img src={notfounrsrc as string} height='100px' alt=''/>,align:'vh'},
                {html:'محصولی یافت نشد',align:'h',size:36}
            ] 
        }
    }
    else {layout = { className: 'ofy-auto', column: list }}
    return (<RVD layout={layout} />)
}
function SelectedProducts() {
    let { vitrin }:I_app_state = useContext(appContext);
    let { vitrinSelected } = vitrin;
    let loading = !vitrinSelected;
    vitrinSelected = vitrinSelected || getMockVitrinSelected();
    let column = Object.keys(vitrinSelected).map((key) => {
        let { product } = vitrinSelected[key];
        return { html: <ProductCard product={product} loading={loading} renderIn='my-vitrin'/> }
    })
    let layout = { className: 'ofy-auto', column }
    return (<RVD layout={layout} />)
}
function Price(props) {
    let {price} = props;
    price = isNaN(price) ? 0 : price;
    if (price < 500) { price = 0 }
    return <RVD 
        layout={{
            align: 'v', className: 'v-product-card-price',gap:3,
            row: [
                { show: !price, html: 'در حال تامین', className: 'v-product-card-no-price' },
                { show: !!price, html: () => SplitNumber(price) },
                { show: !!price, html: 'تومان', className: 'v-product-card-unit' }
            ]
        }}/>
}
type I_ProductCard = {product:I_vitrin_product,loading?:boolean,renderIn?:any}
function ProductCard(props:I_ProductCard) {
    let {vitrin,actionClass,apis,rsa}:I_app_state = useContext(appContext);
    let {product,loading,renderIn} = props;
    function getSelectedVariantIds(){
        let {vitrinSelected} = vitrin;
        let res = vitrinSelected[product.id]
        if(!res){return []}
        return res.variantIds; 
    }
    function name_layout(name) {
        return { html: name, className: `v-product-card-name flex-1 align-v` }
    }
    function price_layout(price) {
        price = isNaN(price) ? 0 : price;
        if (price < 500) { price = 0 }
        return {
            align: 'v', className: 'v-product-card-price',gap:3,
            row: [
                { show: !price, html: 'در حال تامین', className: 'v-product-card-no-price' },
                { show: !!price, html: () => SplitNumber(price) },
                { show: !!price, html: 'تومان', className: 'v-product-card-unit' }
            ]
        }
    }
    function image_layout(image) {
        return { className: 'v-product-card-image', size: 72, html: <img src={image} alt='' height='100%' className='br-8' />, align: 'vh' }
    }
    function variants_layout(product:I_vitrin_product) { 
        return {
            className: 'v-product-card-variants',
            column: product.variants.map((variant)=>{
                return variant_layout(product,variant)
            })
            //column: [
                //{ className: 'v-product-card-variants-label', html: 'موجود در ویترین' },
                //{ className:'m-t-6',show:!!variantIds.length,html:<VariantLabels product={product} variantIds={variantIds}/>}
            //]
        }
    }
    function toggle(product,variantId){
        vitrin.updateVitrinSelected(product,variantId)
    }
    function variant_layout(product,variant) {
        let selected = vitrin.getIsSelected(product.id,variant.id)
        let { price } = variant;
        let vlProps:I_VariantLabel = {product,variantId:variant.id,type:'horizontal'}
        return {
            className: 'v-product-card-variant align-vh',
            row: [
                {
                    column:[
                        {html: <VariantLabel {...vlProps}/>, className:'fs-14 m-b-12'},
                        // price_layout(price,'variant'),
                        {html: <Price price={price} />},
                        {size:6},
                        {html: (<button className='v-product-card-price-problem' onClick={() => openPopup(variant)}>پیشنهاد قیمت دیگر</button>)}
                    ]
                },
                {flex:1},
                {show : !selected, html:()=> <button onClick={()=>toggle(product,variant.id)} className='v-product-card-add-button'>افزودن</button>}, 
                {
                    show : !!selected, 
                    html:()=> (
                        <button className='v-product-card-remove-button w-36 h-36' onClick={()=>toggle(product,variant.id)}>
                            <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.5 3H9.5C9.5 2.17157 8.82843 1.5 8 1.5C7.17157 1.5 6.5 2.17157 6.5 3ZM5.5 3C5.5 1.61929 6.61929 0.5 8 0.5C9.38071 0.5 10.5 1.61929 10.5 3H15.5C15.7761 3 16 3.22386 16 3.5C16 3.77614 15.7761 4 15.5 4H14.4456L13.2521 14.3439C13.0774 15.8576 11.7957 17 10.2719 17H5.72813C4.20431 17 2.92256 15.8576 2.7479 14.3439L1.55437 4H0.5C0.223858 4 0 3.77614 0 3.5C0 3.22386 0.223858 3 0.5 3H5.5ZM3.74131 14.2292C3.85775 15.2384 4.71225 16 5.72813 16H10.2719C11.2878 16 12.1422 15.2384 12.2587 14.2292L13.439 4H2.56101L3.74131 14.2292ZM6.5 6.5C6.77614 6.5 7 6.72386 7 7V13C7 13.2761 6.77614 13.5 6.5 13.5C6.22386 13.5 6 13.2761 6 13V7C6 6.72386 6.22386 6.5 6.5 6.5ZM10 7C10 6.72386 9.77614 6.5 9.5 6.5C9.22386 6.5 9 6.72386 9 7V13C9 13.2761 9.22386 13.5 9.5 13.5C9.77614 13.5 10 13.2761 10 13V7Z" fill="#CD3636"/>
                            </svg>
                        </button>
                    )
                }    
            ]
        }
    }
    function openPopup(variant:I_vitrin_variant){
        actionClass.openPopup('vitrin-price-suggestion',{render:()=><VitrinPriceSuggestion onSubmit={(price:number)=>{
            let parameter:v_price_suggestion_payload = {variant,price};
            apis.request({
                api:'vitrin.v_price_suggestion',description:'پیشنهاد قیمت ویترین',parameter,message:{success:true},
                onSuccess:()=>rsa.removeModal()
            })
        }}/>})
    }
    let { image = imgph, name } = product;
    return (
        <RVD
            loading={loading}
            layout={{
                className: 'v-product-card',
                column: [
                    {
                        gap:6,
                        row: [
                            image_layout(image),
                            name_layout(name),
                        ]
                    },
                    variants_layout(product)
                ]
            }}
        />
    )
}
type I_ProductPage = {product:I_vitrin_product}
function ProductPage(props:I_ProductPage){
    let {vitrin,apis,rsa,actionClass}:I_app_state = useContext(appContext)
    let {product} = props;
    function image_layout(image) {
        return { className: 'v-product-page-image', size: 144, html: <img src={image} alt='' height='100%' />, align: 'vh' }
    }
    function getSelectedVariantIds(){
        let {vitrinSelected} = vitrin;
        let res = vitrinSelected[product.id]
        if(!res){return []}
        return res.variantIds; 
    }
    function name_layout(name) {return { align:'vh',html: name, className: `v-product-card-name` }}
    function card_layout(variant){
        return {
            className:'v-product-page-card',
            column:[
                {
                    html:<VariantLabels product={product} variantIds={[variant.id]} type='vertical' showPrice={true}/>
                },
                {size:6},
                buttons_layout(variant)
            ]
        }
    }
    function openPopup(variant:I_vitrin_variant){
        actionClass.openPopup('vitrin-price-suggestion',{render:()=><VitrinPriceSuggestion onSubmit={(price:number)=>{
            let parameter:v_price_suggestion_payload = {variant,price};
            apis.request({
                api:'vitrin.v_price_suggestion',description:'پیشنهاد قیمت ویترین',parameter,message:{success:true},
                onSuccess:()=>rsa.removeModal()
            })
        }}/>})
    }
    function buttons_layout(variant){
        let variantIds = getSelectedVariantIds()
        let selected = variantIds.indexOf(variant.id) !== -1;
        let text = selected?'موجود در ویترین':'افزودن'
        return {
            row: [
                {html: (<button className={'v-product-page-add-button' + (selected?' selected':'')} onClick={() => vitrin.updateVitrinSelected(product,variant.id)}>{text}</button>)},
                { flex: 1 },
                {html: (<button className='v-product-card-price-problem' onClick={() => openPopup(variant)}>با قیمت موافق نیستم</button>)}
            ]
        }
    }
    let { image = imgph, name, price } = product;
    return (
        <RVD
            layout={{
                gap:16,
                column:[
                    {size:24},
                    image_layout(image),
                    name_layout(name),
                    {gap:12,column:product.variants.map((o)=>card_layout(o))}
                ]
            }}
        />
    )
}
type I_VariantLabels = { product:I_vitrin_product, variantIds:(number|string)[],type?:'horizontal'|'vertical',showPrice?:boolean }
function VariantLabels(props:I_VariantLabels) {
    let { product, variantIds,type = 'horizontal',showPrice } = props
    let layout:I_RVD_layout = {align: 'v',gap:6,column: variantIds.map((variantId) => {
        let p:I_VariantLabel = {product,variantId,type,showPrice}
        return <VariantLabel {...p}/>
    })}
    return (<RVD layout={layout}/>)
}
type I_VariantLabel = {product,variantId,type,showPrice?:boolean}
function VariantLabel(props:I_VariantLabel) {
    let { product, variantId,type = 'horizontal',showPrice } = props
    let { variants, optionTypes } = product
    function keyValues_layout() {
        let variant:I_vitrin_variant = variants.find((o) => o.id === variantId);
        if(!variant){
            ProductError('not_found_selected_variant_id_in_product_variants',{product,variantIds:product.variants.map((o)=>o.id),variantId})
            return false
        }
        let { keys } = variant;
        let row:I_RVD_child[] = keys.map((key,i)=>keyValue_layout(key,i,variant))
        if(showPrice){
            row.push({
                className: 'v-product-card-option',gap:3,align:'v',
                row: [{ html:bullet() },price_layout(variant.price)]
            })
        }
        if(type === 'horizontal'){row = [{html:bullet()},...row]}
        return {gap:8,className: 'v-product-card-options',[type === 'horizontal'?'row':'column']:row,align:'v'}
    }
    function keyValue_layout(key,index,variant):I_RVD_child{
        let { name: optionTypeName, optionValues } = optionTypes[index];
        let optionValueName = '';
        let optionValue = optionValues.find((ov) => ov.id === key);
        if(!optionValue){ProductError('key_is_not_match_by_optionValues',{product,variant,keyIndex:index})}
        else {optionValueName = optionValue.name;}
        return {
            className: 'v-product-card-option',gap:3,align:'v',
            row: [
                { show:type === 'vertical',html:bullet() },
                { html: optionTypeName + ' : ', className: 'v-product-card-variant-option-name' },
                { html: optionValueName, className: 'v-product-card-variant-option-value' }
            ]
        }
    }
    function bullet():React.ReactNode{return <div className='v-product-card-options-bullet'></div>}
    function price_layout(price:number):I_RVD_child {
        price = isNaN(price) ? 0 : price;
        if (price < 500) { price = 0 }
        return {
            align: 'v', className: 'v-product-card-price',gap:3,
            row: [
                { show: !price, html: 'در حال تامین', className: 'v-product-card-no-price' },
                { show: !!price, html: () => SplitNumber(price) },
                { show: !!price, html: 'تومان', className: 'v-product-card-unit' }
            ]
        }
    }
    return (<RVD layout={keyValues_layout()}/>)
}


function ProductError(type,parameter){
    let $$ = {
        key_is_not_match_by_optionValues:()=>{
            let {product,variant,keyIndex} = parameter
            console.error(`variant error => key_is_not_match_by_optionValues`);
            console.log('product is : ',product);
            console.log('variant is : ',variant);
            console.log('variant keys is : ',variant.keys);
            let key = variant.keys[keyIndex];
            console.log('variant key index is : ',keyIndex);
            console.log(`variant key is: `,key);
            console.log('optionTypes is',product.optionTypes);
            console.log(`optionType is`,product.optionTypes[keyIndex]);
            console.log(`optionValues is`,JSON.stringify(product.optionTypes[keyIndex].optionValues));
            console.log(`but in optionValues we cannot find id=${key}`)    
        },
        not_found_selected_variant_id_in_product_variants:()=>{
            let {product,variantIds,variantId} = parameter
            console.error(`variant error => not_found_selected_variant_id_in_product_variants`);
            console.log('product is : ',product);
            console.log('selected variant ids is : ',variantIds);
            console.log('selected variant id is : ',variantId);
            let productVariantsIds = ''
            try{productVariantsIds = JSON.stringify(product.variants.map(({id})=>id))}
            catch{productVariantsIds = '[]'}
            console.log(`product.variants ids is : ${productVariantsIds}`);
            console.log(`but we cannot find ${variantId} in ${productVariantsIds} `);
        }
    }
    $$[type]()   
}


type I_Landing = {start:()=>void}
function Landing(props:I_Landing) {
    let { vitrin }:I_app_state = useContext(appContext), { started } = vitrin;
    let {start} = props;
    return (
        <RVD
            layout={{
                className: 'page-bg ofy-auto', style: { background: '#fff' },
                column: [
                    { html: (<img src={image_src as string} alt='' width='240' height='259' />), align: 'vh' },
                    { size: 12 },
                    { html: 'زودتر از سفارشات با خبر شو!', className: 'theme-dark-font-color fs-24 bold', align: 'h' },
                    { size: 8 },
                    {
                        html: 'همین الان ویترین خودت رو بچین تا هیچ سفارشی رو از دست ندی!',
                        className: 'theme-medium-font-color fs-16 p-h-24', align: 'h'
                    },
                    { size: 36 },
                    {
                        show: started === false, align: 'vh', className: 'p-h-24',
                        html: (<button style={{ width: '100%', borderRadius: 24, height: 48 }} className="button-2" onClick={() => start()}>شروع کن</button>)
                    },
                    { html: <img src={vitlan2 as string} width='100%' alt='' /> },
                    { size: 24 },
                    { html: <img src={vitlan1 as string} width='100%' alt='' /> },
                    { size: 24 }
                ]
            }}
        />
    )
}
type I_VitrinPriceSuggestion = {onSubmit:(price:number)=>void}
function VitrinPriceSuggestion(props:I_VitrinPriceSuggestion){
    let {onSubmit} = props;
    let [price,setPrice] = useState('');
    function submit(){
        if(!price){return}
        onSubmit(+price)
    }
    function description_layout(){
        return {
            html:'بابت اتفاق پیش آمده متاسفیم. ما همواره در حال بررسی قیمت ها و ارائه قیمت رقابتی در بازار ِآنلاین هستیم. قیمت پیشنهادی خود را وارد کنید. در اسرع وقت کارشناسان ما قیمت پیشنهادی شما رو بررسی خواهند کرد'
        }
    }
    function input_layout(){
        return {
            html:(
                <AIOInput className='w-100' after='تومان'
                    type='number' placeholder='قیمت پیشنهادی شما'
                    value={price}
                    onChange={(price)=>setPrice(price)}
                />
            )
        }
    }
    function submit_layout(){
        return {
            html:(
                <button disabled={!price} className='button-2' onClick={()=>submit()}>تایید</button>
            )
        }
    }
    return (<RVD layout={{className:'p-12',gap:12,column:[description_layout(),input_layout(),submit_layout()]}}/>)
}
