import React, { useContext,Component,useState } from "react";
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import AIOInput from "../../npm/aio-input/aio-input";
import getSvg from "./getSvg";
import appContext from "../../app-context";
import Icon from "@mdi/react";
import vbsrc from './../../images/vitrin-bazargah.png';
import { mdiClose, mdiPlus,mdiCamera,mdiDotsVertical,mdiMagnify, mdiLamp, mdiChevronDown, mdiMenu } from "@mdi/js";
import './vitrin.css';
import imgph from './../../images/imgph.png';
import image_src from './../../images/vitrin-landing.png';
import vitlan1 from './../../images/vitrin-landing-1.png';
import vitlan2 from './../../images/vitrin-landing-2.png';
import SplitNumber from './../../npm/aio-functions/split-number';
import TreeCategories from './../../npm/aio-functions/tree-category/index';

export default class Vitrin extends Component {
    static contextType = appContext
    start() {
        let { apis, vitrin,actionClass } = this.context;
        apis.request({
            api: 'vitrin.v_setStarted', parameter: true, description: 'شروع ویترین',
            onSuccess: () => vitrin.update({ started: true }, () => {
                let render = () => (<Search isFirstTime={true} />)
                actionClass.openPopup('vitrin-search', {render})
            })
        })
    }
    render() {
        let { vitrin } = this.context,{ started } = vitrin;
        return started === true?<VitrinPage1 />:<Landing start={()=>this.start()}/>
    }
}
function Landing(props){
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
    state = {searchValue: ''}
    count_layout() {
        let { vitrin } = this.context;
        let { selectedProducts = {} } = vitrin;
        return {
            align: 'vh', className: 'p-12',
            column: [
                {
                    className: 'w-144 h-144 br-6', style: { border: '1px solid #eee' },align:'v',
                    column: [
                        { html: getSvg('svg1'), align: 'vh' },
                        { size: 6 },
                        { html: `${Object.keys(selectedProducts).length} کالا`, align: 'vh', className: 'bold fs-14 theme-dark-font-color', size: 24 },
                        { html: 'در ویترین شما', className: 'theme-medium-font-color fs-10', align: 'h' }
                    ]
                },
                {
                    style: { position: 'absolute', left: 6, top: 6 },
                    html: (
                        <AIOInput
                            type='select' caret={false} optionCheckIcon={{background: '#3B55A5',color: '#3B55A5'}}
                            text={<Icon path={mdiDotsVertical} size={1} />}
                            options={[
                                { text: 'نمایش به صورت لیست', checked: vitrin.viewProducts === 'list', onClick: () => vitrin.update({ viewProducts: vitrin.viewProducts === 'list' ? 'tile' : 'list' }) }
                            ]}
                        />
                    )
                }
            ]
        }
    }
    bazargah_billboard_layout() {
        return {html: <img src={vbsrc} width='100%' alt='' />, align: 'vh', className: 'm-h-12'}
    }
    toolbar_layout() {
        let { actionClass, vitrin } = this.context,{ selectedProducts } = vitrin;
        return {
            className: 'br-6 p-12 m-b-12 of-visible', style: { background: '#fff' },
            row: [
                { html: getSvg('svg2'), style: { background: '#3b55a5', padding: 3, width: 36, height: 36, borderRadius: '100%' }, align: 'vh' },
                { size: 12 },
                { flex: 1, className: 'fs-14 bold', html: 'ویترین من', align: 'v' },
                { show: !!selectedProducts, html: (<button onClick={() => {
                    let render = () => (<Search/>)
                    actionClass.openPopup('vitrin-search',{render})
                }} className='button-2'>افزودن محصول</button>) }
            ]
        }
    }

    products_layout() {
        let { vitrin } = this.context,{ selectedProducts } = vitrin;
        let products = selectedProducts ? Object.keys(selectedProducts).map((id) => selectedProducts[id]) : undefined
        return { html: <Products products={products} /> }
    }
    render() {
        return (
            <RVD
                layout={{
                    className: 'theme-popup-bg ofy-auto m-b-24', flex: 1,
                    column: [this.count_layout(),this.bazargah_billboard_layout(),this.toolbar_layout(),this.products_layout()]
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
            categories: [], taxon: false, categoryPath:[],searchValue: '', products: undefined, pageNumber: 1, pageSize: 10, total: false,
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
            api: 'vitrin.v_kolle_mahsoolat', description: 'دریافت لیست محصولات قابل انتخاب ویترین', loading: false,
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
        this.setState({ searchValue: value, pageNumber: 1 }, () => this.updateProducts())
    }
    changeCategory(path) {
        let { paging } = this.state;
        let taxon = path[path.length - 1].id;
        this.setState({ taxon,categoryPath:path, total: false, paging: { ...paging, number: 1 } }, () => this.updateProducts())
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
        let props = { type: 'text', className, placeholder, before, onChange: (value) => {console.log(value); this.changeSearch(value)},delay:1200 }
        return { html: <AIOInput {...props} /> }
    }
    // categories_layout(categories,total){
    //     let props = {rtl:true,total,categories,onChange:(taxon) => this.changeCategory(taxon)}
    //     return !categories.length?false:{className: 'm-h-6',html: <TreeCategories {...props} />}
    // }
    getCategoryTitle(){
        let {categoryPath} = this.state;
        if(!categoryPath.length){return 'دسته بندی محصولات'}
        let res = [];
        for(let i = 0; i < categoryPath.length; i++){
            let o = categoryPath[i];
            if(o.show !== false){
                res.push(o.name)
            }
        }
        return res.join(' / ')
    }
    categories_layout(categories, total) {
        if (!categories.length) { return false }
        return {
            className: 'p-6 bg-32',
            column:[
                {
                    html: <AIOInput
                        type='button'
                        style={{ width: 'fit-content', minHeight: 30, padding: '0 12px',textAlign:'right' }}
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
        let {rsa,actionClass} = this.context;
        let render = () => {
            let props = { rtl: true, total, categories, onChange: (taxon) => { this.changeCategory(taxon); rsa.removeModal() } }
            return <Categories {...props} />
        }
        actionClass.openPopup('vitrin-categories',{render})
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
            column:[
                level2_item({ childs: [], name: `کل دسته بندی ${item.name}`, id:item.id,show:false },true),
                {column: childs.map((o) => level1_item(o))}
            ]
        }
    }
    function level1_item(obj) {
        let { name, id } = obj;
        let childs = [{ childs: [], name: `کل دسته بندی ${obj.name}`, id,show:false }, ...obj.childs]
        let level1Id = path[1]?path[1].id:false;
        console.log(level1Id);
        let showChilds = obj.id === level1Id;
        return {
            onClick: () => {
                if (path[1] && path[1].id === id) { setPath([path[0]]) }
                else { setPath([{...path[0]},{...obj}]) }
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
                    show:showChilds,
                    flex: 1, className: 'categories-level-2',
                    column: childs.map((o) => level2_item(o))
                }
            ]
        }
    }
    function level2_item(obj,isRoot) {
        let { name } = obj;
        return {
            className: 'categories-level-2-item' + (isRoot?' is-root':''),
            onClick: () => onChange(path.concat(obj)),
            row: [
                { align: 'v', html: name, flex: 1 }
            ]
        }
    }
    return (<RVD layout={{className: 'categories-popup',row: [level0_layout(),level1_layout()]}}/>);
}
class Box extends Component {
    getStyle() {
        let { styleType = 0 } = this.props;
        return [
            { background: 'linear-gradient(180deg, #EFF0FF -50.48%, #8FA7FE 308.1%)', color: '#032979' },
            { background: 'linear-gradient(270deg, #405AAA -4.27%, #617CD0 105.33%)', color: '#fff', borderRadius: 12 }
        ][styleType];
    }
    getProps(){
        let { type,icon, texts, after, onClick } = this.props;
        if(type === 'description'){
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
    let {apis} = useContext(appContext);
    async function addSuggestion() {
        apis.request({
            api: 'vitrin.addSuggestion', description: 'پیشنهاد افزودن محصول به ویترین', parameter: suggestion, message: { success: true },
            onSuccess: () => setSuggestion({ name: '', file: undefined, brand: '' })
        })
    }
    let [suggestion,setSuggestion] = useState({ name: '', file: undefined, brand: '' });
    return (
        <AIOInput
            type='form' lang='fa' value={{...suggestion}} submitText='ثبت' inputStyle={{ border: 'none' }}
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
                        input: {type: 'image', placeholder: <Icon path={mdiCamera} size={1} />, width: '100%'},
                        label: 'تصویر محصول', field: 'value.image', validations: [['required']]
                    },
                ]
            }}
        />
    )
}
function getMockProducts(){return new Array(6).fill(0).map(()=>{return {"name": "لامپ ال ای دی شمعی 7 وات پایه E14", "price": 257840}})}
class Products extends Component {
    static contextType = appContext;
    render() {
        let { vitrin } = this.context
        let { products } = this.props;
        let Products;
        if (!products) { Products = getMockProducts() }
        else {
            Products = products;
            if (vitrin.viewProducts === 'tile' && Products.length % 2 !== 0) { Products.push({}) }
        }
        let list = Products.map((o) => {
            let { vitrin } = this.context;
            let { updateSelectedProducts } = vitrin;
            let { selectedProducts = {} } = vitrin;
            let { name, src, price, id } = o;
            let selected = !!selectedProducts[id];
            let props = { name, src, price, selected, type: vitrin.viewProducts === 'tile' ? 'v' : 'h', id, onSelect: (id) => updateSelectedProducts(id, o) };
            return { flex: 1, html: <ProductCard {...props} loading={!products} /> }
        })
        let layout;
        if (vitrin.viewProducts === 'tile') { layout = { className: 'ofy-auto', grid: list, gridCols: 2 } }
        else { layout = { className: 'ofy-auto', column: list } }
        return (<RVD layout={layout} />)
    }
}
class ProductCard extends Component {
    image_layout() {
        let { src = imgph, type = 'v' } = this.props;
        let imageStyle = type === 'v' ? { height: '100%' } : { width: '100%' };
        let size = type === 'v' ? 120 : 60;
        return { className: 'm-b-6', size, html: <img src={src} alt='' {...imageStyle} className='br-8' />, align: 'vh' }
    }
    name_layout() {
        let { name } = this.props;
        if (!name) { return false }
        return { html: name, className: `theme-dark-font-color fs-12 p-h-12 t-a-right` }
    }
    price_layout() {
        let { price, type = 'v' } = this.props;
        price = isNaN(price) ? 0 : price;
        if (price < 500) { price = 0 }
        let priceFontSize = type === 'v' ? 18 : 14;
        return {
            row: [
                { show: !price, html: 'در حال تامین', className: 'fs-12 bold', style: { color: 'red' }, align: 'v' },
                { show: !!price, html: () => SplitNumber(price), className: `theme-dark-font-color fs-${priceFontSize} bold`, align: 'v' },
                { size: 3 },
                { show: !!price, html: 'تومان', className: 'theme-light-font-color fs-10', align: 'v' }
            ]
        }
    }
    plus_layout() {
        let { price, selected, onSelect, id, loading, type = 'v' } = this.props;
        price = isNaN(price) ? 0 : price;
        if (price < 500) { price = 0 }
        if (!onSelect) { return false }
        let padding = type === 'v' ? 8 : 0;
        return {
            html: <Icon path={selected ? mdiClose : mdiPlus} size={1} />,
            style: { border: loading ? undefined : '2px solid', color: selected ? 'orange' : '#3B55A5' },
            className: `br-100 p-${padding}`, align: 'vh', onClick: () => onSelect(id)
        }
    }
    id_layout() {
        let { id } = this.props;
        return { html: id }
    }
    render() {
        let { loading, name, type = 'v' } = this.props;
        if (!name) { return null }
        let style = { height: type === 'v' ? 260 : undefined, borderBottom: '1px solid #ddd', borderLeft: '1px solid #ddd' }
        let layout;
        if (type === 'v') {
            layout = {
                column: [
                    { size: 12 }, this.image_layout(), this.name_layout(), { flex: 1 },
                    { className: 'p-h-12', row: [this.price_layout(), { flex: 1 }, this.plus_layout()] },
                    { size: 12 }
                ]
            }
        }
        else {
            layout = {
                row: [
                    this.image_layout(),
                    {
                        flex: 1, className: 'p-6',
                        column: [this.name_layout(), { flex: 1 }, { row: [this.price_layout(), { flex: 1 }, this.plus_layout(),] },]
                    }
                ]
            }
        }
        return (<RVD loading={loading} layout={{ style, ...layout }} />)
    }
}