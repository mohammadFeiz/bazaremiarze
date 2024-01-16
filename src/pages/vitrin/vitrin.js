import React, { useContext, Component, useState } from "react";
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import AIOInput from "../../npm/aio-input/aio-input";
import getSvg from "./getSvg";
import appContext from "../../app-context";
import Loading from './loading';
import Icon from "@mdi/react";
import vbsrc from './../../images/vitrin-bazargah.png';
import { mdiCamera, mdiMagnify, mdiLamp, mdiChevronDown, mdiMenu, mdiCheck, mdiPlusThick, mdiStoreCheck, mdiMarkerCheck, mdiClockCheck } from "@mdi/js";
import './vitrin.css';
import imgph from './../../images/imgph.png';
import image_src from './../../images/vitrin-landing.png';
import vitlan1 from './../../images/vitrin-landing-1.png';
import vitlan2 from './../../images/vitrin-landing-2.png';
import SplitNumber from './../../npm/aio-functions/split-number';
import TreeCategories from './../../npm/aio-functions/tree-category/index';
import { vitrinMock } from "../../apis/vitrin-apis";
export default class Vitrin extends Component {
    static contextType = appContext
    constructor(props){
        super(props);
        this.state = {splash:true}
        setTimeout(()=>this.setState({splash:false}),2500)
    }
    start() {
        let { apis, vitrin, actionClass,userInfo } = this.context;
        apis.request({
            api: 'vitrin.v_setStarted', parameter: true, description: 'شروع ویترین',
            onSuccess: () => vitrin.update({ started: true }, () => {
                let render = () => (<Search isFirstTime={true} />)
                actionClass.openPopup('vitrin-search', { render })
            })
        })
    }
    render() {
        let {backOffice,userInfo} = this.context;
        let {splash} = this.state;
        if(splash){return <div className='w-100 h-100 align-vh'><Loading/></div> }
        if(!backOffice.activeManager.vitrin && !userInfo.isSuperAdmin){
            return <div className='w-100 h-100 align-vh fs-12'>سرویس ویترین تا اطلاع ثانوی در حال بروز رسانی میباشد</div>    
        }
        let { vitrin } = this.context, { started } = vitrin;
        if(started === true){return <VitrinPage1 />}
        if(started === false){return <Landing start={() => this.start()} />}
        return <div className='w-100 h-100 align-vh fs-12'>در حال بارگزاری اطلاعات ویترین</div>
    }
}
function Landing(props) {
    let { vitrin } = useContext(appContext), { started } = vitrin;
    return (
        <RVD
            layout={{
                className: 'page-bg ofy-auto', style: { background: '#fff' },
                column: [
                    { html: (<img src={image_src} alt='' width='240' height='259' />), align: 'vh' },
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
                        html: (<button style={{ width: '100%', borderRadius: 24, height: 48 }} className="button-2" onClick={() => props.start()}>شروع کن</button>)
                    },
                    { html: <img src={vitlan2} width='100%' alt='' /> },
                    { size: 24 },
                    { html: <img src={vitlan1} width='100%' alt='' /> },
                    { size: 24 }
                ]
            }}
        />
    )
}

class VitrinPage1 extends Component {
    static contextType = appContext;
    state = { searchValue: '' }
    count_layout() {
        let { vitrin } = this.context;
        let { vitrinSelected = {} } = vitrin;
        return {
            align: 'vh', className: 'p-12',
            column: [
                {
                    className: 'w-144 h-144 br-6', style: { border: '1px solid #eee' }, align: 'v',
                    column: [
                        { html: getSvg('svg1'), align: 'vh' },
                        { size: 6 },
                        { html: `${Object.keys(vitrinSelected).length} کالا`, align: 'vh', className: 'bold fs-14 theme-dark-font-color', size: 24 },
                        { html: 'در ویترین شما', className: 'theme-medium-font-color fs-10', align: 'h' }
                    ]
                },
                // {
                //     style: { position: 'absolute', left: 6, top: 6 },
                //     html: (
                //         <AIOInput
                //             type='select' caret={false} optionCheckIcon={{background: '#3B55A5',color: '#3B55A5'}}
                //             text={<Icon path={mdiDotsVertical} size={1} />}
                //             options={[
                //                 { text: 'نمایش به صورت لیست', checked: vitrin.viewProducts === 'list', onClick: () => vitrin.update({ viewProducts: vitrin.viewProducts === 'list' ? 'tile' : 'list' }) }
                //             ]}
                //         />
                //     )
                // }
            ]
        }
    }
    bazargah_billboard_layout() {
        return { html: <img src={vbsrc} width='100%' alt='' />, align: 'vh', className: 'm-h-12' }
    }
    toolbar_layout() {
        let { actionClass, vitrin } = this.context, { vitrinSelected } = vitrin;
        return {
            className: 'br-6 p-12 m-b-12 of-visible', style: { background: '#fff' },
            row: [
                { html: getSvg('svg2'), style: { background: '#3b55a5', padding: 3, width: 36, height: 36, borderRadius: '100%' }, align: 'vh' },
                { size: 12 },
                { flex: 1, className: 'fs-14 bold', html: 'ویترین من', align: 'v' },
                {
                    show: !!vitrinSelected, html: (<button onClick={() => {
                        let render = () => (<Search />)
                        actionClass.openPopup('vitrin-search', { render })
                    }} className='button-2'>افزودن محصول</button>)
                }
            ]
        }
    }

    products_layout() {
        return { html: <SelectedProducts /> }
    }
    render() {
        return (
            <RVD
                layout={{
                    className: 'theme-popup-bg ofy-auto m-b-24', flex: 1,
                    column: [
                        this.count_layout(), 
                        this.bazargah_billboard_layout(), 
                        this.toolbar_layout(), 
                        this.products_layout()
                    ]
                }}
            />
        )
    }
}
class Search extends Component {
    static contextType = appContext;
    constructor(props) {
        super(props);
        this.state = {
            categories: [], taxon: false, categoryPath: [], searchValue: '', products: undefined, pageNumber: 1, pageSize: 10, total: false,
            brands: [], selectedBrands: [],
            paging: {
                number: 1, size: 20, sizes: [10, 20, 40, 100], serverSide: true, length: 0,
                onChange: (obj) => {
                    let { paging } = this.state;
                    this.setState({ paging: { ...paging, ...obj } }, () => this.updateProducts())
                }
            }
        }
    }
    async updateProducts() {
        let { apis } = this.context;
        let { paging, searchValue, taxon } = this.state;
        this.setState({ products: undefined })
        let { products, total } = await apis.request({
            api: 'vitrin.v_kolle_mahsoolat', description: 'دریافت لیست محصولات قابل انتخاب ویترین', loading: false,def:[],
            parameter: { pageSize: paging.size, pageNumber: paging.number, searchValue, taxon: taxon || '10673' }
        })
        this.setState({ products, paging: { ...this.state.paging, length: total }, total })
    }
    componentDidMount() {
        let { backOffice } = this.context;
        let brands = [
            'بروکس', 'پارس شهاب', 'سایروکس', 'خزرشید', 'کملیون', 'مازی نور'
        ]
        this.setState({ categories: backOffice.vitrinCategories, brands }, () => this.updateProducts())
    }
    changePageNumber(dir) {
        let { pageNumber, products } = this.state;
        if (dir === -1 && pageNumber === 1) { return }
        if (dir === 1 && !products.length) { return }
        this.setState({ pageNumber: pageNumber + dir }, () => this.updateProducts())
    }
    changeSearch(value) {
        let { msfReport } = this.context;
        if (value.length > 3) {
            msfReport({ actionName: 'vitrin search', actionId: 56, targetName: value, tagName: 'vitrin', eventName: 'action' })
        }
        this.setState({ searchValue: value, pageNumber: 1 }, () => this.updateProducts())
    }
    changeCategory(path) {
        let { msfReport } = this.context;
        let { paging } = this.state;
        let taxon = path[path.length - 1].id;
        msfReport({ actionName: 'vitrin filter by category', actionId: 57, targetName: path.join('/'), targetId: taxon, tagName: 'vitrin', eventName: 'action' })
        this.setState({ taxon, categoryPath: path, total: false, paging: { ...paging, number: 1 } }, () => this.updateProducts())
    }
    header_layout() {
        let { isFirstTime } = this.props
        return !isFirstTime ? false : { html: <Box type='description' /> }
    }
    // brands_layout(){
    //     let {brands} = this.state;
    //     let options = brands.map((brand)=>{
    //         return {
    //             text:brand,
    //             value:brand,

    //         }
    //     })
    //     return {
    //         html:(
    //             <AIOInput
    //                 type='select'
    //                 options={options}
    //             />
    //         )
    //     }
    // }
    body_layout() {
        let { rsa } = this.context, { isFirstTime } = this.props;
        let { products, paging, categories, total } = this.state;
        return {
            flex: 1,
            column: [
                {
                    flex: 1, className: 'ofy-auto',
                    column: [
                        this.search_layout(),
                        this.categories_layout(categories, total),
                        //this.brands_layout(),
                        this.products_layout(products, paging),
                        this.suggestion_layout(isFirstTime)
                    ]
                },
                this.inter_layout(isFirstTime, rsa.removeModal)
            ]
        }
    }
    search_layout() {
        let className = 'vitrin-search-box', placeholder = "جستجو در محصولات", before = <Icon path={mdiMagnify} size={1} />
        let props = { type: 'text', className, placeholder, before, onChange: (value) => { console.log(value); this.changeSearch(value) }, delay: 1200 }
        return { html: <AIOInput {...props} /> }
    }
    // categories_layout(categories,total){
    //     let props = {rtl:true,total,categories,onChange:(taxon) => this.changeCategory(taxon)}
    //     return !categories.length?false:{className: 'm-h-6',html: <TreeCategories {...props} />}
    // }
    getCategoryTitle() {
        let { categoryPath } = this.state;
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
    categories_layout(categories, total) {
        if (!categories.length) { return false }
        return {
            className: 'p-6 bg-32',
            column: [
                {
                    html: <AIOInput
                        type='button'
                        style={{ width: 'fit-content', minHeight: 30, padding: '0 12px', textAlign: 'right' }}
                        className='button-2'
                        text={this.getCategoryTitle()}
                        before={<Icon path={mdiMenu} size={1} />}
                        onClick={() => this.openCategories(categories, total)}
                    />
                },
            ]

        }
    }
    openCategories(categories, total) {
        let { rsa, actionClass } = this.context;
        let render = () => {
            let props = { rtl: true, total, categories, onChange: (taxon) => { this.changeCategory(taxon); rsa.removeModal() } }
            return <Categories {...props} />
        }
        actionClass.openPopup('vitrin-categories', { render })
    }
    products_layout(products, paging) {
        let props = { type: 'table', value: products, paging, rowsTemplate: () => <Products products={products} /> }
        return { html: <AIOInput {...props} /> }
    }
    suggestion_layout(isFirstTime) {
        return !!isFirstTime ? false : { className: 'p-24', style: { background: '#eee' }, html: () => <Suggestion /> }
    }
    inter_layout(isFirstTime, removeModal) {
        return !isFirstTime ? false : {
            className: 'm-12', align: 'vh',
            html: () => <button onClick={() => removeModal()} className='button-2'>تایید و ورود به ویترین من</button>
        }
    }
    render() {
        return (<RVD layout={{ className: 'theme-popup-bg', column: [this.header_layout(), this.body_layout()] }} />)
    }
}
function Categories(props = {}) {
    let { categories = [], onChange } = props
    let [path, setPath] = useState([]);
    function level0_layout() {
        return {
            className: 'categories-level-0',
            column: categories.map((o) => level0_item(o))
        }
    }
    function level0_item(obj) {
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
        let childs = [{ childs: [], name: `کل دسته بندی ${obj.name}`, id, show: false }, ...obj.childs]
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
                    column: childs.map((o) => level2_item(o))
                }
            ]
        }
    }
    function level2_item(obj, isRoot) {
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
class Box extends Component {
    getStyle() {
        let { styleType = 0 } = this.props;
        return [
            { background: 'linear-gradient(180deg, #EFF0FF -50.48%, #8FA7FE 308.1%)', color: '#032979' },
            { background: 'linear-gradient(270deg, #405AAA -4.27%, #617CD0 105.33%)', color: '#fff', borderRadius: 12 }
        ][styleType];
    }
    getProps() {
        let { type, icon, texts, after, onClick } = this.props;
        if (type === 'description') {
            texts = [
                { className: 'fs-14 bold', html: 'گام اول: انتخاب محصولات' },
                { className: 'fs-16 bold', html: 'محصولات مورد نظرتان را به ویترین اضافه کنید' },
                { className: 'fs-12 theme-medium-font-color', html: 'بر روی  + محصول مورد نظر ضربه بزنید' },
            ]
        }
        return { icon, texts, after, onClick }
    }
    render() {
        let { icon, texts, after, onClick } = this.props;
        return (
            <RVD
                layout={{
                    onClick, style: this.getStyle(), gap: 12,
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
}
function Suggestion() {
    let { apis } = useContext(appContext);
    async function addSuggestion() {
        apis.request({
            api: 'vitrin.addSuggestion', description: 'پیشنهاد افزودن محصول به ویترین', parameter: suggestion, message: { success: true },
            onSuccess: () => setSuggestion({ name: '', file: undefined, brand: '' })
        })
    }
    let [suggestion, setSuggestion] = useState({ name: '', file: undefined, brand: '' });
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
function getMockProducts() {
    let { result } = vitrinMock().v_getProducts()
    return result.products
}
function getMockVitrinSelected() {
    return vitrinMock().v_mockVitrinSelected()
}
class Products extends Component {
    static contextType = appContext;
    render() {
        let { products } = this.props;
        let Products;
        if (!products) { Products = getMockProducts() }
        else { Products = products }
        let list = Products.map((o) => {
            return { html: <ProductCard product={o} loading={!products} /> }
        })
        let layout = { className: 'ofy-auto', column: list }
        return (<RVD layout={layout} />)
    }
}
class SelectedProducts extends Component {
    static contextType = appContext;
    render() {
        let { vitrin } = this.context
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
}
class ProductCard extends Component {
    static contextType = appContext;
    getSelectedVariantIds(){
        let {vitrin} = this.context,{vitrinSelected} = vitrin;
        let {product} = this.props;
        if(!vitrinSelected){return []}
        let res = vitrinSelected[product.id]
        if(!res){return []}
        return res.variantIds; 
    }
    openPopup() {
        let {actionClass} = this.context;
        let {product} = this.props;
        actionClass.openPopup('vitrin-product-page',{render:()=><ProductPage product={product}/>,product})
    }
    name_layout(name) {
        return { html: name, className: `v-product-card-name` }
    }
    price_layout(price) {
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
    image_layout(image) {
        return { className: 'v-product-card-image', size: 72, html: <img src={image} alt='' height='100%' className='br-8' />, align: 'vh' }
    }
    id_layout() {
        let { id } = this.props;
        return { html: id }
    }
    variants_layout(product,variantIds) {
        if (!variantIds || !variantIds.length) { return false }
        return {
            className: 'v-product-card-variants',
            column: [
                { className: 'v-product-card-variants-label', html: 'موجود در ویترین' },
                { className:'m-t-6',show:!!variantIds.length,html:<VariantLabels product={product} variantIds={variantIds}/>}
            ]
        }
    }
    render() {
        let { loading, product, renderIn } = this.props;
        let { image = imgph, name, price } = product;
        let variantIds = this.getSelectedVariantIds()
        return (
            <RVD
                loading={loading}
                layout={{
                    className: 'v-product-card',
                    column: [
                        {
                            row: [
                                {flex: 1,column: [this.name_layout(name),{ flex: 1 },this.price_layout(price)]},
                                this.image_layout(image)
                            ]
                        },
                        { size: 6 },
                        {
                            row: [
                                {html: (<button className='v-product-card-add-button' onClick={() => this.openPopup()}>{renderIn === 'my-vitrin'?'ویرایش':'مشاهده و افزودن'}</button>)},
                                { flex: 1 },
                                {html: (<button className='v-product-card-price-problem' onClick={() => this.openPopup()}>با قیمت موافق نیستم</button>)}
                            ]
                        },
                        this.variants_layout(product,variantIds)
                    ]
                }}
            />
        )
    }
}
class ProductPage extends Component{
    static contextType = appContext;
    image_layout(image) {
        return { className: 'v-product-page-image', size: 144, html: <img src={image} alt='' height='100%' />, align: 'vh' }
    }
    getSelectedVariantIds(){
        let {vitrin} = this.context,{vitrinSelected} = vitrin;
        let {product} = this.props;
        let res = vitrinSelected[product.id]
        if(!res){return []}
        return res.variantIds; 
    }
    name_layout(name) {
        return { align:'vh',html: name, className: `v-product-card-name` }
    }
    card_layout(variant){
        let {product} = this.props;
        return {
            className:'v-product-page-card',
            column:[
                {
                    html:<VariantLabels product={product} variantIds={[variant.id]} type='vertical' showPrice={true}/>
                },
                {size:6},
                this.buttons_layout(variant)
            ]
        }
    }
    openPopup(variant) {
        let {apis,rsa,actionClass} = this.context;
        actionClass.openPopup('vitrin-price-suggestion',{render:()=><VitrinPriceSuggestion onSubmit={(price)=>{
            apis.request({
                api:'vitrin.v_price_suggestion',
                description:'پیشنهاد قیمت ویترین',
                parameter:{variant,price},
                message:{success:true},
                onSuccess:()=>rsa.removeModal()
            })
        }}/>})
    }
    buttons_layout(variant){
        let {vitrin} = this.context;
        let { product } = this.props;
        let variantIds = this.getSelectedVariantIds()
        let selected = variantIds.indexOf(variant.id) !== -1;
        let text = selected?'موجود در ویترین':'افزودن'
        return {
            row: [
                {html: (<button className={'v-product-page-add-button' + (selected?' selected':'')} onClick={() => vitrin.updateVitrinSelected(product,variant.id)}>{text}</button>)},
                { flex: 1 },
                {html: (<button className='v-product-card-price-problem' onClick={() => this.openPopup(variant)}>با قیمت موافق نیستم</button>)}
            ]
        }
    }
    render(){
        let { product } = this.props;
        let { image = imgph, name, price } = product;
        
        return (
            <RVD
                layout={{
                    gap:16,
                    column:[
                        {size:24},
                        this.image_layout(image),
                        this.name_layout(name),
                        {
                            gap:12,column:product.variants.map((o)=>this.card_layout(o))
                        }
                    ]
                }}
            />
        )
    }
}
function VariantLabels({ product, variantIds,type = 'horizontal',showPrice }) {
    let { variants, optionTypes } = product
    function keyValues_layout(variantId) {
        let variant = variants.find((o) => o.id === variantId);
        if(!variant){
            ProductError('not_found_selected_variant_id_in_product_variants',{product,variantIds,variantId})
            return false
        }
        let { keys } = variant;
        let row = keys.map((key,i)=>keyValue_layout(key,i,variant))
        if(showPrice){
            row.push({
                className: 'v-product-card-option',gap:3,align:'v',
                row: [
                    { html:bullet_layout() },
                    price_layout(variant.price)
                ]
            })
        }
        if(type === 'horizontal'){row = [{html:bullet_layout()},...row]}
        return {gap:6,className: 'v-product-card-options',[type === 'horizontal'?'row':'column']:row,align:'v'}
    }
    function keyValue_layout(key,index,variant){
        let { name: optionTypeName, optionValues } = optionTypes[index];
        let optionValueName = '';
        let optionValue = optionValues.find((ov) => ov.id === key);
        if(!optionValue){ProductError('key_is_not_match_by_optionValues',{product,variant,keyIndex:index})}
        else {optionValueName = optionValue.name;}
        return {
            className: 'v-product-card-option',gap:3,align:'v',
            row: [
                { show:type === 'vertical',html:bullet_layout() },
                { html: optionTypeName + ' : ', className: 'v-product-card-variant-option-name' },
                { html: optionValueName, className: 'v-product-card-variant-option-value' }
            ]
        }
    }
    function bullet_layout(){return <div className='v-product-card-options-bullet'></div>}
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
    
    return (<RVD layout={{align: 'v',gap:6,column: variantIds.map((variantId) => keyValues_layout(variantId))}}/>)
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

function VitrinPriceSuggestion({onSubmit}){
    let [price,setPrice] = useState('');
    function submit(){
        if(!price){return}
        onSubmit(price)
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