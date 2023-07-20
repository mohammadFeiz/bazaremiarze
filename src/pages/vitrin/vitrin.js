import React, { Component, createContext } from "react";
import RVD from './../../interfaces/react-virtual-dom/react-virtual-dom';
import AIOButton from "../../npm/aio-button/aio-button";
import AIOPopup from "../../npm/aio-popup/aio-popup";
import image_src from './../../images/vitrin-landing.png';
import SplitNumber from './../../npm/aio-functions/split-number';
import appContext from "../../app-context";
import Icon from "@mdi/react";
import { mdiCamera, mdiChevronLeft, mdiClose, mdiFilter, mdiMagnify, mdiMenu, mdiPlus, mdiPlusThick } from "@mdi/js";
import vitrin_niazsanji_src from './../../images/vitrin-niazsanji.jpg';
import vitrin_category_src from './../../images/vitrin-category.png';
import vitrin_brand_src from './../../images/vitrin-brand.png';
import VitrinContext from "../../vitrin-context";
export default class Vitrin extends Component {
    static contextType = appContext
    state = {
        step: 0,
        products: [],
        selectedProducts: [],
        lastUpdate: 'چند لحظه پیش',
        categoryOptions: [],
        miarze_porforoosh: [],
        miarze_categories: [],
        miarze_brands: [],
        started: undefined,
        page: 2,
        popup:{}
    }
    updateSelectedProducts(id) {
        let { vitrinApis } = this.context;
        let { selectedProducts,products } = this.state;
        let state = selectedProducts.indexOf(id) === -1;
        vitrinApis({
            api: 'v_updateMyVitrin',
            parameter: { id, state,product:products.find((o)=>o.id === id) },
            callback: () => {
                let { selectedProducts } = this.state;
                let newSelectedProducts;
                if (state) { newSelectedProducts = selectedProducts.concat(id) }
                else { newSelectedProducts = selectedProducts.filter((o) => o !== id) }
                this.setState({ selectedProducts: newSelectedProducts })
            }
        })
    }
    async componentDidMount() {
        let { vitrinApis,userInfo } = this.context;
        let started = await vitrinApis({
            api: 'v_getStarted',
            name: 'دریافت وضعیت ویترین'
        })
        let products = await vitrinApis({
            api: 'v_kolle_mahsoolat',
            cache: 24 * 60 * 60 * 1000,
            name: 'دریافت لیست محصولات قابل انتخاب ویترین'
        })
        let selectedProducts = await vitrinApis({
            api: 'v_mahsoolate_entekhab_shode',
            name: 'دریافت لیست محصولات انتخاب شده ی ویترین',
            parameter:userInfo.cardCode
        });
        let categoryOptions = await vitrinApis({
            api: 'v_category_options',
            cache: 24 * 60 * 60 * 1000,
            name: 'دریافت لیست دسته بندی های محصولات ویترین'
        });
        await vitrinApis({
            api: 'v_miarze_categories',
            cache: 24 * 60 * 60 * 1000,
            name: 'دریافت لیست دسته بندی های می ارزه',
            callback: (miarze_categories) => this.setState({ miarze_categories })
        });
        await vitrinApis({
            api: 'v_miarze_porforoosh',
            cache: 24 * 60 * 60 * 1000,
            name: 'دریافت لیست پرفروش های می ارزه',
            callback: (miarze_porforoosh) => this.setState({ miarze_porforoosh })
        });
        await vitrinApis({
            api: 'v_miarze_brands',
            cache: 24 * 60 * 60 * 1000,
            name: 'دریافت برند های می ارزه',
            callback: (miarze_brands) => this.setState({ miarze_brands })
        });

        this.setState({ products, selectedProducts, categoryOptions, started })
    }
    changeStep() {
        let { step } = this.state;
        this.setState({ step: step + 1 })
    }
    openPopup(name, parameter) {
        let { popup } = this.state;
        let { addPopup,removePopup } = popup;
        if (name === 1) {
            addPopup({
                id: 'vitrin1',
                type: 'fullscreen',
                title: 'بروزرسانی ویترین من',
                body: () => {
                    return (
                        <VitrinPage1 isWizard={false}/>
                    )
                }
            })
        }
        else if (name === 2) {
            addPopup({
                type: 'fullscreen',
                title: 'ویترین من',
                body: () => {
                    return <VitrinPage2 />
                }
            })
        }
        else if (name === 'search'){
            addPopup({
                type: 'fullscreen', title: 'افزودن محصول به ویترین من',
                body: () => (
                    <SearchProducts 
                        onClose={() => removePopup()} 
                        isFirstTime={parameter}
                        onNext={()=>{
                            removePopup();
                            this.setState({page:2,started:true})
                        }}
                    />
                )
            })
        }
    }
    start(){
        let {vitrinApis} = this.context;
        vitrinApis({
            api:'v_setStarted',
            parameter:true,
            name:'شروع ویترین',
            callback:()=>{
                this.openPopup('search',true)
                //this.setState({page:1,started:true})
            }
        })
    }
    landing_layout() {
        let { started } = this.state;
        if (started === undefined) { return null }
        return (
            <RVD
                layout={{
                    className: 'page-bg ofy-auto',
                    style:{background:'#EFF0FF'},
                    column: [
                        { flex: 1 },
                        { html: (<img src={image_src} alt='' width='144' height='144' />), align: 'vh' },
                        { flex: 1 },
                        { html: 'محصولات خودت رو بفروش!', className: 'theme-dark-font-color fs-24 bold', align: 'h' },
                        {
                            html: 'همین الان ویترین خودت رو بچین تا هیچ سفارشی رو از دست ندی!',
                            className: 'theme-medium-font-color fs-16 p-h-24', align: 'h'
                        },
                        { flex: 1 },
                        {
                            show: started === false,
                            align: 'vh',
                            className:'p-h-24',
                            html: (<button style={{ width: '100%', borderRadius: 24,height:42 }} className="button-2" onClick={() => this.start()}>شروع کن</button>)
                        },
                        { flex: 2 },

                    ]
                }}
            />
        )
    }
    SetState(obj) { this.setState(obj) }
    getContext() {
        return {
            ...this.state,
            SetState: this.SetState.bind(this),
            openPopup:this.openPopup.bind(this),
            removePopup:(id,animate)=>this.state.popup.removePopup(id,animate),
            updateSelectedProducts: this.updateSelectedProducts.bind(this)
        }
    }
    header() {
        return (
            <RVD
                layout={{
                    row: [
                        { flex: 1 },
                        this.exit_layout(),
                        { size: 12 }
                    ]
                }}
            />
        )
    }
    getContent() {
        let { started, page } = this.state;
        if (started !== true) { return this.landing_layout() }
        if (page === 1) { 
            return (
                <VitrinPage1 isWizard={true}/>
            ) 
        }
        if (page === 2) { return <VitrinPage2 /> }
    }
    render() {
        return (
            <VitrinContext.Provider value={this.getContext()}>
                {this.getContent()}
                <AIOPopup
                    getActions={({addPopup,removePopup})=>{
                        this.setState({popup:{addPopup,removePopup}})
                    }}
                />
            </VitrinContext.Provider>
        )
    }
}

class VitrinPage1 extends Component {
    static contextType = VitrinContext;
    constructor(props) {
        super(props);
        this.state = {
            searchValue: '',
        }
    }
    box_layout() {
        return {
            html: (
                <Box
                    texts={[
                        { className: 'fs-16 bold', html: 'محصولات مورد نظرتان را به ویترین اضافه کنید' },
                        { className: 'fs-12 theme-medium-font-color', html: 'بر روی + محصول مورد نظر ضربه بزنید' },
                    ]}
                />
            )
        }
    }
    toolbar_layout() {
        let {openPopup} = this.context;
        return {
            className: 'br-6 p-h-12 m-b-12 of-visible', size: 36, style: { background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid #ddd', boxShadow: '0 0 3px 0 rgba(0,0,0,0.1)' },
            row: [
                { flex: 1, className: 'fs-14 bold', html: 'محصولات ویترین من', align: 'v' },
                {
                    row: [
                        { html: <Icon path={mdiPlusThick} size={0.8} />, align: 'vh', className: 'theme-link-font-color' },
                        { html: 'افزودن محصول', className: 'theme-link-font-color bold', align: 'v' }
                    ],
                    onClick: () => openPopup('search')
                }
            ]
        }
    }
    products_layout() {
        let { products, selectedProducts } = this.context;
        let products_dic = {};
        for (let i = 0; i < products.length; i++) {
            let o = products[i];
            products_dic[o.id] = o;
        }
        let items = selectedProducts.map((id) => {
            return products_dic[id];
        });
        if (selectedProducts.length % 2 !== 0) { items.push({}) }
        return {
            grid: items.map(({ name, src, price, id }) => {
                let props = { name, src, price, id, selected: true };
                return {
                    flex: 1,
                    html: (
                        <ProductCard
                            {...props}
                            onSelect={(id) => {
                                let { updateSelectedProducts } = this.context;
                                updateSelectedProducts(id)
                            }}
                        />
                    )
                }
            }),
            gridCols: 2
        }
    }
    next(){
        let {SetState} = this.context;
        SetState({page:2})
    }
    footer_layout() {
        let { isWizard } = this.props;
        if(!isWizard){return false}
        return { className: 'p-6', html: (<button className="button-2" onClick={() => this.next()}>بعدی</button>) }
    }
    render() {
        return (
            <RVD
                layout={{
                    className: 'theme-popup-bg',
                    column: [
                        this.box_layout(),
                        this.toolbar_layout(),
                        {
                            flex: 1, className: 'ofy-auto',
                            column: [
                                this.products_layout(),
                            ]
                        },
                        this.footer_layout()
                    ]
                }}
            />
        )
    }
}

class SearchProducts extends Component {
    static contextType = VitrinContext;
    constructor(props) {
        super(props);
        this.state = {
            searchValue: '',
            selectedCategories: [],
        }
    }
    box_layout(){
        let {isFirstTime} = this.props;
        if(!isFirstTime){return false}
        return {
            html: (
                <Box
                    texts={[
                        { className: 'fs-14 bold', html: 'گام اول: انتخاب محصولات' },
                        { className: 'fs-16 bold', html: 'محصولات مورد نظرتان را به ویترین اضافه کنید' },
                        { className: 'fs-12 theme-medium-font-color', html: 'بر روی  + محصول مورد نظر ضربه بزنید' },
                    ]}
                />
            )
        }
    }
    toolbar_layout() {
        let { searchValue } = this.state;
        return {
            className: 'm-h-12 br-6',
            style: { border: '1px solid #ddd' },
            row: [
                {
                    html: <Icon path={mdiMagnify} size={1} />, align: 'vh', size: 48, style: { color: '#bbb' }
                },
                {
                    flex: 1,
                    html: (
                        <input
                            type='text' value={searchValue}
                            onChange={(e) => this.setState({ searchValue: e.target.value })} placeholder="جستجو"
                            className='w-100 br-6 h-36 p-h-12' style={{ border: 'none' }}
                        />
                    )
                }
            ]
        }
    }
    category_layout() {
        let { selectedCategories } = this.state;
        let { categoryOptions } = this.context;
        return {
            className: 'p-h-12',
            html: (
                <AIOButton
                    type='multiselect' caret={false}
                    optionText='option'
                    optionValue='option'
                    popupWidth='fit'
                    optionTagAttrs={{ style: { background: '#2BBA8F' } }}
                    style={{ background: '#2BBA8F15', border: '1px solid #2BBA8F' }}
                    className='fs-12 br-6 h-36'
                    text='دسته بندی محصولات'
                    before={<Icon path={mdiMenu} size={1} style={{ color: '#2BBA8F' }} />}
                    options={categoryOptions}
                    value={selectedCategories}
                    onChange={(selectedCategories) => this.setState({ selectedCategories })}
                />
            )
        }
    }
    isMatchSearch(name) {
        let { searchValue } = this.state;
        if (!searchValue) { return true }
        if (name.indexOf(searchValue) !== -1) { return true }
        return false
    }
    isMatchCategories(categories) {
        let { selectedCategories } = this.state;
        if (!selectedCategories.length) { return true }
        for (let i = 0; i < selectedCategories.length; i++) {
            let sc = selectedCategories[i];
            if (categories.indexOf(sc) !== -1) { return true }
        }
        return false
    }
    isSelected(id){
        return this.selectedProducts.indexOf(id) !== -1
    }
    getFilteredProducts() {
        let { products } = this.context;
        return products.filter(({ categories = [], name, id }) => {
            let isMatchSearch = this.isMatchSearch(name);
            let isMatchCategories = this.isMatchCategories(categories);
            let isSelected = this.isSelected(id);
            return isMatchCategories && isMatchSearch && !isSelected;
        })
    }
    products_layout() {
        let items = [...this.getFilteredProducts()];
        if (items.length % 2 !== 0) {
            items.push({})
        }
        return {
            flex: 1, className: 'ofy-auto',
            grid: items.map((o) => {
                let { selectedProducts, SetState } = this.context;
                let { name, src, price, id } = o;
                let selected = selectedProducts.indexOf(id) !== -1;
                let props = {
                    name, src, price, selected, id,
                    onSelect: (id) => {
                        let { updateSelectedProducts } = this.context;
                        updateSelectedProducts(id);
                    }
                };
                return {
                    flex: 1,
                    html: <ProductCard {...props} />
                }
            }),
            gridCols: 2
        }
    }
    footer_layout() {
        let { onClose,isFirstTime,onNext } = this.props;
        let html; 
        if(isFirstTime){
            html = <button className="button-2" onClick={() => onNext()}>بعدی</button>
        }
        else {
            html = <button className="button-2" onClick={() => onClose()}>بازگشت</button>
        }
        return {className: 'p-6',html}
    }
    render() {
        let {selectedProducts} = this.context;
        if(!this.selectedProducts){this.selectedProducts = [...selectedProducts]}
        return (
            <RVD
                layout={{
                    className: 'theme-popup-bg',
                    column: [
                        this.box_layout(),
                        { size: 12 },
                        this.toolbar_layout(),
                        { size: 12 },
                        this.category_layout(),
                        { size: 12 },
                        this.products_layout(),
                        this.footer_layout()
                    ]
                }}
            />
        )
    }
}

class VitrinPage2 extends Component {
    static contextType = VitrinContext;
    constructor(props) {
        super(props);
        this.state = {
            myVitrinLength: 8,
            myVitrinType:'slider',
        }
    }
    count_layout() {
        let { selectedProducts } = this.context;
        return {
            align: 'vh',
            column: [
                {
                    className: 'w-144 h-144 br-6', style: { border: '1px solid #eee' },
                    column: [
                        { flex: 1 },
                        { html: getSvg('svg1'), align: 'vh' },
                        { size: 6 },
                        { html: `${selectedProducts.length} کالا`, align: 'vh', className: 'bold fs-14 theme-dark-font-color', size: 24 },
                        { html: 'در ویترین شما', className: 'theme-medium-font-color fs-10', align: 'h' },
                        { flex: 1 }
                    ]
                }
            ]
        }
    }
    update_layout() {
        let { openPopup } = this.context;
        return {
            className: 'm-h-12',
            html: (
                <Box
                    onClick={() => openPopup(1)}
                    styleType={1}
                    icon={getSvg('svg2')}
                    after={<Icon path={mdiChevronLeft} size={1} />}
                    texts={[
                        { html: 'بروزرسانی ویترین من', className: 'fs-14 bold' },
                        { html: 'برای افزودن یا حدف کردن محصولات از ویترینتان همین الان بروزرسانی کنید', className: 't-a-right fs-12' }
                    ]}
                />
            )
        }
    }
    lastUpdate_layout() {
        return false 
        let { lastUpdate } = this.context;
        return {
            html: `اخرین بروزرسانی : ${lastUpdate}`, className: 'fs-10 m-h-12', size: 24, align: 'v'
        }
    }
    niazSanji_layout() {
        return {
            className: 'm-h-12',
            html: <img src={vitrin_niazsanji_src} alt='' width='100%' />
        }
    }
    mahsoolate_vitrine_man_layout() {
        let { myVitrinLength,myVitrinType } = this.state;
        if(myVitrinType === 'slider'){
            return this.mahsoolate_vitrine_man_layout_h()
        }
        let { selectedProducts, products } = this.context;
        let items = selectedProducts.map((o) => {
            let product = products.find((x) => x.id === o);
            return product;
        });
        if (items.length > myVitrinLength) {
            items = items.slice(0, myVitrinLength)
        }
        if (items.length % 2 !== 0) { items.push({}) }
        return {
            column: [
                {
                    className: 'm-h-12',
                    row: [
                        { html: getSvg('svg2'), style: { background: '#3b55a5', padding: 3, width: 36, height: 36, borderRadius: '100%' }, align: 'vh' },
                        { size: 12 },
                        { html: 'محصولات ویترین من', align: 'v', className: 'bold fs-14',flex:1 }
                    ]
                },
                {
                    gridCols: 2, grid: items.map((o) => {
                        return { flex: 1, html: <ProductCard {...o} /> }
                    })
                },
                {
                    size: 48, html: 'مشاهده کامل ویترین من', className: 'theme-link-font-color fs-14 bold', align: 'vh'
                }
            ]
        }
    }
    mahsoolate_vitrine_man_layout_h() {
        let { selectedProducts, products,openPopup } = this.context;
        let { myVitrinLength } = this.state;
        let items = selectedProducts.map((o) => {
            let product = products.find((x) => x.id === o);
            return product;
        });
        if (items.length > myVitrinLength) {
            items = items.slice(0, myVitrinLength)
        }
        return {
            column: [
                {
                    className: 'm-h-12',
                    row: [
                        { html: getSvg('svg2'), style: { background: '#3b55a5', padding: 3, width: 36, height: 36, borderRadius: '100%' }, align: 'vh' },
                        { size: 12 },
                        { html: 'محصولات ویترین من', align: 'v', className: 'bold fs-14',flex:1 },
                        {
                            className:'theme-link-font-color bold fs-14',align:'v',
                            html:'نمایش همه',
                            onClick:()=>openPopup(1)
                        }
                    ]
                },
                {
                    className:'ofx-auto',
                    row: items.map((o) => {
                        return { size:192,html: <ProductCard {...o} /> }
                    })
                }
            ]
        }
    }
    miarze_layout() {
        return {
            html: <Miarze />
        }
    }
    render() {
        return (
            <RVD
                layout={{
                    className: 'ofy-auto theme-popup-bg',
                    style: { height: '100%' },
                    column: [
                        { size: 12 },
                        this.count_layout(),
                        { size: 24 },
                        this.update_layout(),
                        this.lastUpdate_layout(),
                        { size: 24 },
                        // this.niazSanji_layout(),
                        // { size: 24 },
                        this.mahsoolate_vitrine_man_layout(),
                        { size: 12 },
                        //this.miarze_layout()
                    ]
                }}
            />
        )
    }
}

class Miarze extends Component {
    static contextType = VitrinContext;
    constructor(props) {
        super(props);
        this.state = {
            searchValue: '',
            addValue: '',
        }
    }
    header_layout() {
        return {
            className: 'm-h-12',
            row: [
                { html: getSvg('miarze') },
                { size: 12 },
                {
                    flex: 1,
                    column: [
                        { flex: 1 },
                        { html: 'محصولات می ارزه', style: { color: '#006C50' }, className: 'fs-20 bold' },
                        { size: 6 },
                        { html: 'محصولاتی که در می ارزه برای فروش وجود دارد', className: 'fs-14 t-a-right' },
                        { flex: 1 }
                    ]
                }
            ]
        }
    }
    changeSearch(searchValue) {
        this.setStateL({ searchValue })
    }
    search_layout() {
        let { searchValue } = this.state;
        return {
            size: 36,
            style: { background: '#fff' },
            className: 'm-h-12 br-6',
            row: [
                { size: 36, html: <Icon path={mdiMagnify} size={1} />, align: 'vh' },
                {
                    flex: 1,
                    html: (
                        <input
                            placeholder="جستجو در میان محصولات می ارزه"
                            style={{ width: '100%', background: '#fff', border: 'none' }}
                            type='text' value={searchValue}
                            onChange={(e) => this.changeSearch(e.target.value)}
                        />
                    )
                }
            ]
        }
    }
    porForoosh_layout() {
        let { miarze_porforoosh } = this.context;
        return {
            column: [
                {
                    size: 36, className: 'm-h-12', align: 'v',
                    row: [
                        { html: 'پرفروش ترین کالاها', className: 'fs-14 bold theme-dark-font-color' },
                        { flex: 1 },
                        { html: 'مشاهده همه', className: 'fs-14 theme-link-font-color bold' }
                    ]
                },
                {
                    className: 'ofx-auto',
                    row: [
                        { size: 12 },
                        {
                            gap: 12,
                            row: miarze_porforoosh.map((o) => {
                                return this.card_layout(o)
                            })
                        },
                        { size: 12 }
                    ]
                }
            ]
        }
    }
    card_layout({ src, name, price }) {
        return {
            style: { background: '#fff', height: 240, width: 180 },
            className: 'p-12 br-6',
            column: [
                { size: 90, html: <img src={src} height='100%' alt='' /> },
                { html: name, className: 'fs-16 bold theme-dark-font-color t-a-right' },
                { flex: 1 },
                {
                    row: [
                        { flex: 1 },
                        { html: SplitNumber(price), align: 'v', className: 'fs-16 theme-dark-font-color bold' },
                        { size: 3 },
                        { html: 'تومان', className: 'fs-10 theme-light-font-color', align: 'v' }
                    ]
                },
                { size: 6 },
                {
                    html: (
                        <AIOButton
                            type='button'
                            style={{ width: '100%', borderRadius: 24, border: '1px solid', color: '#3B55A5', background: 'none' }}
                            text='افزودن به ویترین'
                            before={<Icon path={mdiPlus} size={.8} />}
                        />
                    )
                }
            ]
        }
    }
    categories_layout() {
        let { miarze_categories } = this.context;
        return {
            column: [
                { html: 'دسته بندی کالاها', size: 36, align: 'v', className: 'theme-dark-font-color fs-16 bold p-h-12' },
                {
                    row: [
                        { size: 12 },
                        {
                            flex: 1,
                            gap: 12, className: 'ofx-auto',
                            row: miarze_categories.map(({ src, name }) => {
                                return {
                                    column: [
                                        { html: <img src={src} height='110' width='110' alt='' /> },
                                        { size: 12 },
                                        { html: name, className: 'theme-dark-font-color fs-12 bold', align: 'h' }
                                    ]
                                }
                            })
                        },
                        { size: 12 }
                    ]
                }
            ]
        }
    }
    brands_layout() {
        let { miarze_brands } = this.context;
        return {
            column: [
                { html: 'برند های موجود', size: 36, align: 'v', className: 'theme-dark-font-color fs-16 bold p-h-12' },
                {
                    row: [
                        { size: 12 },
                        {
                            flex: 1,
                            gap: 12, className: 'ofx-auto',
                            row: miarze_brands.map(({ src, name }) => {
                                return {
                                    column: [
                                        { html: <img src={src} height='100%' alt='' /> },
                                        { size: 12 },
                                        { html: name, className: 'theme-dark-font-color fs-12 bold', align: 'h' }
                                    ]
                                }
                            })
                        },
                        { size: 12 }
                    ]
                }
            ]
        }
    }
    seeAll_layout() {
        return {
            className: 'p-12',
            html: (
                <button style={{ background: '#2BBA8F', color: '#fff', border: 'none' }} className='fs-12 bold w-100 h-36 br-6'>
                    مشاهده همه محصولات می ارزه
                </button>
            )
        }
    }
    add_layout() {
        let { addValue } = this.state;
        return {
            className: 'p-12',
            style: { background: '#fff' },
            column: [
                { html: 'درخواست افزودن محصول', className: 'fs-18 bold theme-dark-font-color' },
                { size: 12 },
                {
                    html: 'ما به سرعت در حال اضافه کردن محصولات جدید به می ارزه هستیم. نام محصول پیشنهادی خود را برای ما بفرستید تا ما در اولویت قرار دهیم.',
                    className: 'fs-12 theme-medium-font-color t-a-right'
                },
                { size: 12 },
                {
                    html: (
                        <input
                            type='text' value={addValue} placeholder="نام کامل محصول"
                            style={{ width: '100%', height: 36, background: '#f8f8f8', border: 'none', padding: '0 12px' }}
                            onChange={(e) => this.setState({ addValue: e.target.value })}
                        />
                    )
                },
                { size: 12 },
                {
                    html: (
                        <AIOButton
                            style={{
                                width: '100%',
                                height: 100,
                                display: 'flex',
                                flexDirection: 'column',
                                color: '#888'
                            }}
                            before={<Icon path={mdiCamera} size={1} />}
                            type='file'
                            text='افزودن تصویر محصول'
                        />
                    )
                },
                { size: 12 },
                {
                    html: (
                        <button className='button-2'>ثبت</button>
                    )
                }
            ]
        }
    }
    render() {
        return (
            <RVD
                layout={{
                    style: { background: '#E7F1EB' },
                    className: 'br-12',
                    column: [
                        { size: 24 },
                        this.header_layout(),
                        { size: 12 },
                        this.search_layout(),
                        { size: 24 },
                        this.porForoosh_layout(),
                        { size: 36 },
                        this.categories_layout(),
                        { size: 24 },
                        // this.brands_layout(),
                        // { size: 24 },
                        this.seeAll_layout(),
                        { size: 12 },
                        this.add_layout()

                    ]
                }}
            />
        )
    }
}

class ProductCard extends Component {
    image_layout() {
        let { src } = this.props;
        if (!src) { return false }
        return {
            className:'m-b-6',size: 120, html: <img src={src} alt='' height='100%' className='br-8'/>, align: 'vh'
        }
    }
    name_layout() {
        let { name } = this.props;
        if (!name) { return false }
        return {
            html: name, className: 'theme-dark-font-color fs-14 p-h-12 t-a-right'
        }
    }
    price_layout() {
        let { price } = this.props;
        if (!price) { return false }
        return {
            row: [
                { html: SplitNumber(price), className: 'theme-dark-font-color fs-18 bold', align: 'v' },
                { size: 3 },
                { html: 'تومان', className: 'theme-light-font-color fs-10', align: 'v' }
            ]
        }
    }
    plus_layout() {
        let { price, selected, onSelect, id } = this.props;
        if (!price || !onSelect) { return false }
        return {
            html: <Icon path={selected ? mdiClose : mdiPlus} size={1} />,
            style: { border: '2px solid', color: selected ? '#605e5c' : '#3b55a5' },
            className: 'br-100 p-8',
            align: 'vh',
            onClick: () => onSelect(id)
        }
    }
    id_layout() {
        let { id } = this.props;
        return { html: id }
    }
    render() {
        return (
            <RVD
                layout={{
                    style: { height: 260, borderBottom: '1px solid #ddd', borderLeft: '1px solid #ddd' },
                    column: [
                        { size: 12 },
                        this.image_layout(),
                        this.name_layout(),
                        { flex: 1 },
                        //this.id_layout(),
                        {
                            className: 'p-h-12',
                            row: [
                                this.price_layout(),
                                { flex: 1 },
                                this.plus_layout(),
                            ]
                        },
                        { size: 12 }
                    ]
                }}
            />
        )
    }
}

class Box extends Component {
    getStyle() {
        let { styleType = 0 } = this.props;
        return [
            { background: 'linear-gradient(180deg, #EFF0FF -50.48%, #8FA7FE 308.1%)', color: '#032979' },
            { background: 'linear-gradient(270deg, #405AAA -4.27%, #617CD0 105.33%)', color: '#fff', borderRadius: 12 }
        ][styleType];
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
                        { flex: 1, column: [{ size: 16 }, { gap: 3, column: texts.filter(({show})=>show !== false) }, { size: 16 }] },
                        { show: !!after, html: after, align: 'vh' },
                        { html: '' }
                    ]
                }}
            />
        )
    }
}

function getSvg(type) {
    return {
        svg1() {
            return (
                <svg width="57" height="73" viewBox="0 0 57 73" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M44.7 0.0499878H12.3C7.82644 0.0499878 4.19995 3.67648 4.19995 8.14999V64.85C4.19995 69.3235 7.82644 72.95 12.3 72.95H44.7C49.1735 72.95 52.7999 69.3235 52.7999 64.85V8.14999C52.7999 3.67648 49.1735 0.0499878 44.7 0.0499878Z" fill="#2A44A1" />
                    <path d="M46.3199 8.14996H10.6799C8.44313 8.14996 6.62988 9.96321 6.62988 12.2V60.8C6.62988 63.0367 8.44313 64.85 10.6799 64.85H46.3199C48.5566 64.85 50.3699 63.0367 50.3699 60.8V12.2C50.3699 9.96321 48.5566 8.14996 46.3199 8.14996Z" fill="#EDF0FF" />
                    <path d="M0.149902 8.14996H8.2499V12.2C8.2499 13.2741 7.82321 14.3042 7.06368 15.0637C6.30416 15.8233 5.27403 16.25 4.1999 16.25C3.12578 16.25 2.09564 15.8233 1.33612 15.0637C0.576598 14.3042 0.149902 13.2741 0.149902 12.2V8.14996Z" fill="#36C196" />
                    <path d="M8.25 8.14996H16.35V12.2C16.35 13.2741 15.9233 14.3042 15.1638 15.0637C14.4043 15.8233 13.3741 16.25 12.3 16.25C11.2259 16.25 10.1957 15.8233 9.43622 15.0637C8.6767 14.3042 8.25 13.2741 8.25 12.2V8.14996Z" fill="#2A44A1" />
                    <path d="M16.3499 8.14996H24.4499V12.2C24.4499 13.2741 24.0232 14.3042 23.2636 15.0637C22.5041 15.8233 21.474 16.25 20.3999 16.25C19.3257 16.25 18.2956 15.8233 17.5361 15.0637C16.7765 14.3042 16.3499 13.2741 16.3499 12.2V8.14996Z" fill="#36C196" />
                    <path d="M24.45 8.14996H32.55V12.2C32.55 13.2741 32.1233 14.3042 31.3637 15.0637C30.6042 15.8233 29.5741 16.25 28.5 16.25C27.4258 16.25 26.3957 15.8233 25.6362 15.0637C24.8766 14.3042 24.45 13.2741 24.45 12.2V8.14996Z" fill="#2A44A1" />
                    <path d="M32.5498 8.14996H40.6498V12.2C40.6498 13.2741 40.2231 14.3042 39.4636 15.0637C38.7041 15.8233 37.6739 16.25 36.5998 16.25C35.5257 16.25 34.4955 15.8233 33.736 15.0637C32.9765 14.3042 32.5498 13.2741 32.5498 12.2V8.14996Z" fill="#36C196" />
                    <path d="M40.6499 8.14996H48.7499V12.2C48.7499 13.2741 48.3232 14.3042 47.5637 15.0637C46.8042 15.8233 45.774 16.25 44.6999 16.25C43.6258 16.25 42.5956 15.8233 41.8361 15.0637C41.0766 14.3042 40.6499 13.2741 40.6499 12.2V8.14996Z" fill="#2A44A1" />
                    <path d="M48.75 8.14996H56.85V12.2C56.85 13.2741 56.4233 14.3042 55.6638 15.0637C54.9043 15.8233 53.8741 16.25 52.8 16.25C51.7259 16.25 50.6957 15.8233 49.9362 15.0637C49.1767 14.3042 48.75 13.2741 48.75 12.2V8.14996Z" fill="#36C196" />
                    <path d="M16.35 0.0499878H8.25V8.14999H16.35V0.0499878Z" fill="#3D60F6" />
                    <path d="M24.4499 0.0499878H16.3499V8.14999H24.4499V0.0499878Z" fill="#FFBA40" />
                    <path d="M32.55 0.0499878H24.45V8.14999H32.55V0.0499878Z" fill="#3D60F6" />
                    <path d="M40.6498 0.0499878H32.5498V8.14999H40.6498V0.0499878Z" fill="#FFBA40" />
                    <path d="M48.7499 0.0499878H40.6499V8.14999H48.7499V0.0499878Z" fill="#3D60F6" />
                    <path d="M0.149902 8.14999L2.3855 3.67069C2.93096 2.58261 3.76834 1.66771 4.804 1.02829C5.83965 0.388876 7.03276 0.0501486 8.2499 0.0499878V8.14999H0.149902Z" fill="#FFBA40" />
                    <path d="M56.85 8.14999L54.6144 3.67069C54.0689 2.58261 53.2316 1.66771 52.1959 1.02829C51.1602 0.388876 49.9671 0.0501486 48.75 0.0499878V8.14999H56.85Z" fill="#FFBA40" />
                    <path d="M28.4593 70.925C29.5777 70.925 30.4843 70.0184 30.4843 68.9C30.4843 67.7816 29.5777 66.875 28.4593 66.875C27.3409 66.875 26.4343 67.7816 26.4343 68.9C26.4343 70.0184 27.3409 70.925 28.4593 70.925Z" fill="white" />
                </svg>
            )
        },
        svg2() {
            return (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_5801_30867)">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M29.5918 5.43556C29.3946 5.27459 29.1467 5.18515 28.8891 5.18515H11.1113L10.9582 5.19574C10.7061 5.2308 10.472 5.35172 10.2967 5.54058L5.48356 10.7288L5.42553 10.7965L5.32884 10.9379C5.2187 11.1294 5.17476 11.3387 5.18672 11.5421L5.18701 14.3211L5.19688 14.6585C5.27541 15.9984 5.81856 17.2134 6.66754 18.1448L6.6687 33.7037L6.67884 33.8544C6.75242 34.3968 7.2173 34.8148 7.77981 34.8148H23.0885C22.7446 34.1227 22.494 33.3759 22.3533 32.5911H19.9937L19.9942 22.5941L19.984 22.4433C19.9105 21.9009 19.4456 21.4829 18.8831 21.4829H12.2224L12.0716 21.4931C11.5293 21.5667 11.1113 22.0315 11.1113 22.5941L11.1107 32.5911H8.89056L8.88869 19.6456C9.50412 19.8741 10.1699 19.9989 10.8649 19.9989C12.7372 19.9989 14.3979 19.0927 15.4312 17.6949C16.4654 19.0927 18.1261 19.9989 19.9984 19.9989C21.8603 19.9989 23.5129 19.1028 24.5483 17.7182L24.566 17.6919C25.6002 19.0914 27.2618 19.9989 29.1355 19.9989C29.8293 19.9989 30.4941 19.8745 31.1087 19.6467L31.1086 22.7958C31.8836 22.8466 32.6297 23.0033 33.3325 23.2516L33.3328 18.1448C34.2526 17.1358 34.8134 15.7939 34.8134 14.3211L34.8156 11.4781C34.8156 11.2543 34.7476 11.0263 34.5969 10.8254L34.5514 10.7677L29.7036 5.54058L29.5918 5.43556ZM28.8961 22.943V22.5941L28.8859 22.4433C28.8123 21.9009 28.3475 21.4829 27.785 21.4829H22.5977L22.4469 21.4931C21.9046 21.5667 21.4865 22.0315 21.4865 22.5941V27.7822L21.4967 27.933C21.5669 28.4506 21.9936 28.855 22.5214 28.8908C22.7741 27.9743 23.1794 27.121 23.7083 26.3602V23.7052H26.6728V23.7357C27.3623 23.372 28.1091 23.102 28.8961 22.943ZM13.3335 23.7052H17.7706V32.5911H13.3335V23.7052ZM7.40908 12.5955H14.3202L14.3206 14.3211L14.3126 14.5577C14.191 16.3558 12.6939 17.7767 10.8649 17.7767L10.6283 17.7687L10.3608 17.7402C9.74385 17.65 9.17983 17.3969 8.71387 17.0258L8.65151 16.9749L8.50892 16.8491L8.29889 16.6357L8.10811 16.4051L8.02769 16.2944L7.87519 16.0552C7.81992 15.9601 7.76906 15.8621 7.72288 15.7616L7.66262 15.6223L7.58209 15.4033L7.50894 15.1485L7.46043 14.917L7.41838 14.5744L7.40924 14.3211L7.40908 12.5955ZM16.5424 12.5955H23.4535L23.4541 14.3211L23.4461 14.5577C23.3245 16.3558 21.8274 17.7767 19.9984 17.7767L19.7618 17.7687L19.5295 17.7452C17.8428 17.5163 16.5428 16.0705 16.5428 14.3211L16.5424 12.5955ZM25.6787 12.5955H32.5898L32.5911 14.3211L32.5821 14.573L32.5554 14.82L32.5134 15.0534L32.4567 15.2787L32.4126 15.4203L32.3263 15.6501L32.2332 15.8545L32.0798 16.1311C32.0114 16.242 31.937 16.3488 31.8569 16.4509L31.6404 16.7016L31.4688 16.8701L31.3358 16.9858C30.7382 17.4798 29.9715 17.7767 29.1355 17.7767L28.8989 17.7687L28.6666 17.7452C26.9799 17.5163 25.6798 16.0705 25.6798 14.3211L25.6787 12.5955ZM11.5957 7.40589H15.647L14.7344 10.3733H8.84315L11.5957 7.40589ZM17.9715 7.40589H22.0278L22.9404 10.3733H17.0589L17.9715 7.40589ZM24.3522 7.40589H28.4032L31.1557 10.3733H25.2648L24.3522 7.40589Z" fill="#EFF0FF" />
                        <g clipPath="url(#clip1_5801_30867)">
                            <path d="M31.2221 39.1852C27.1311 39.1852 23.8147 35.8688 23.8147 31.7778C23.8147 27.6868 27.1311 24.3704 31.2221 24.3704C35.3131 24.3704 38.6295 27.6868 38.6295 31.7778C38.6295 35.8688 35.3131 39.1852 31.2221 39.1852ZM33.6447 30.8518H32.7036C32.3968 30.8518 32.148 31.1006 32.148 31.4074C32.148 31.7142 32.3968 31.963 32.7036 31.963H34.7406C35.0474 31.963 35.2962 31.7142 35.2962 31.4074V29C35.2962 28.6932 35.0474 28.4444 34.7406 28.4444C34.4338 28.4444 34.1851 28.6932 34.1851 29V29.5552C33.5094 28.6558 32.434 28.0741 31.2222 28.0741C30.0838 28.0741 29.071 28.5632 28.3874 29.3856C28.1913 29.6216 28.2236 29.9719 28.4596 30.168C28.6956 30.3641 29.0459 30.3318 29.242 30.0958C29.7134 29.5286 30.4125 29.1852 31.2222 29.1852C32.3276 29.1852 33.272 29.8773 33.6447 30.8518ZM28.2591 34.5555V34C28.9347 34.8994 30.0101 35.4815 31.2222 35.4815C32.3519 35.4815 33.3733 34.9748 34.0528 34.1756C34.2515 33.9418 34.2231 33.5912 33.9894 33.3925C33.7556 33.1937 33.405 33.2221 33.2063 33.4559C32.7308 34.0151 32.0152 34.3704 31.2222 34.3704C30.1885 34.3704 29.2951 33.7651 28.8789 32.8889H29.7406C30.0474 32.8889 30.2962 32.6401 30.2962 32.3333C30.2962 32.0265 30.0474 31.7778 29.7406 31.7778H27.7036C27.3968 31.7778 27.148 32.0265 27.148 32.3333V34.5555C27.148 34.8624 27.3968 35.1111 27.7036 35.1111C28.0104 35.1111 28.2591 34.8624 28.2591 34.5555Z" fill="#FBAD45" />
                        </g>
                    </g>
                    <defs>
                        <clipPath id="clip0_5801_30867">
                            <rect width="40" height="40" fill="white" />
                        </clipPath>
                        <clipPath id="clip1_5801_30867">
                            <rect width="17.7778" height="17.7778" fill="white" transform="translate(22.2222 22.7778)" />
                        </clipPath>
                    </defs>
                </svg>

            )
        },
        miarze() {
            return (
                <svg width="122" height="124" viewBox="0 0 122 124" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="122" height="124" rx="16" fill="#2BBA8F" />
                    <path d="M101.604 61.1765H99.7039V63.0437H101.604V61.1765Z" fill="white" />
                    <path d="M87.6148 61.8035H87.605C86.6797 61.71 85.7713 61.4958 84.9035 61.1668C84.2174 60.9084 83.5505 60.6031 82.9076 60.2533C82.3541 59.9514 81.8214 59.6139 81.3132 59.2429L81.1527 59.3688C80.8026 59.9143 80.4965 60.4859 80.2371 61.0783C80.0958 61.3994 79.9845 61.7325 79.9047 62.0735C79.7118 62.8292 79.7118 63.4272 79.9047 63.8992C80.0289 64.3231 80.2862 64.6976 80.64 64.9691C80.7019 65.0176 80.7681 65.0646 80.8372 65.1075C81.0005 65.2173 81.1703 65.3176 81.3456 65.4079C81.6194 65.5511 81.9016 65.6782 82.1907 65.7885L82.6738 65.9754L84.4894 66.6772C85.4776 67.0642 86.5109 67.3292 87.5655 67.4661C87.9531 67.5166 88.3436 67.5429 88.7346 67.545V61.8589C88.3606 61.859 87.9869 61.8405 87.6148 61.8035Z" fill="white" />
                    <path d="M46.3108 55.4779V73.9993H47.4376C48.3735 74.0097 49.294 73.7649 50.0968 73.292C50.8837 72.831 51.5407 72.1838 52.0081 71.4095C52.4852 70.6207 52.7323 69.718 52.7223 68.8004V55.4779H46.3108Z" fill="white" />
                    <path d="M54.4927 55.4779V73.9993H55.6195C56.5567 74.01 57.4787 73.7652 58.2829 73.292C59.0695 72.8305 59.7264 72.1835 60.1943 71.4095C60.6713 70.6207 60.9184 69.718 60.9084 68.8004V55.4779H54.4927Z" fill="white" />
                    <path d="M67.9636 51.4113C67.0311 51.4011 66.1134 51.6403 65.3086 52.1033C64.5185 52.5605 63.8594 53.2072 63.393 53.983C62.9136 54.7724 62.6664 55.6771 62.6789 56.5963V69.9188H69.0946V51.4113H67.9636Z" fill="white" />
                    <path d="M34.8017 70.6538C33.857 70.6628 32.9276 70.4193 32.1129 69.9493C31.31 69.4883 30.6404 68.8331 30.1678 68.0461C29.6837 67.2474 29.4327 66.3332 29.4424 65.4037V56.0136H39.1948C40.1064 56.005 41.0016 56.2523 41.7752 56.7264C42.5428 57.1956 43.1813 57.843 43.6344 58.6116C44.1013 59.3947 44.3487 60.2855 44.3513 61.1931V65.4715C44.3603 66.3909 44.1055 67.2942 43.6161 68.0779C43.1381 68.8539 42.4692 69.4994 41.6709 69.9548C40.8587 70.4183 39.934 70.6574 38.9948 70.6469L34.8017 70.6538ZM35.9496 64.2576H37.8497V62.3904H35.9496V64.2576Z" fill="white" />
                    <path d="M92.8571 62.0111H89.1951C88.8183 62.0072 88.442 61.9818 88.0683 61.935H88.0584C87.4665 61.856 86.8823 61.7287 86.3119 61.5543C85.3786 61.2619 84.469 60.901 83.5907 60.4747C83.5154 60.4393 83.4383 60.4079 83.3597 60.3806C82.884 60.2159 82.3666 60.2078 81.8858 60.3577C81.4051 60.5075 80.987 60.8071 80.6948 61.2111C80.5534 61.5322 80.4422 61.8653 80.3624 62.2063C80.1694 62.962 80.1694 63.56 80.3624 64.032C80.4865 64.4559 80.7439 64.8304 81.0976 65.1019C81.1596 65.1504 81.2258 65.1974 81.2948 65.2403L83.1371 66.1082C83.9278 66.4773 84.717 66.8501 85.5048 67.2266C83.5907 68.1609 81.3202 68.7727 79.3539 68.698C78.4285 68.6606 77.2862 68.4488 76.7412 67.6253C76.3989 67.102 76.2214 66.3172 76.2595 65.1822C76.2975 64.1856 76.7665 62.0665 77.4905 61.319L73.6594 57.6178C71.9227 59.3494 70.9959 62.6008 70.8818 64.9829C70.7804 67.3014 71.3044 69.1354 72.2523 70.5541C73.8016 72.8601 76.4369 73.8567 79.1539 73.9813C79.3511 73.991 79.5511 73.9951 79.7525 73.9951C83.2188 73.9951 87.164 72.611 89.9092 70.8116C90.3421 70.5287 90.6826 70.129 90.89 69.6605C91.0974 69.192 91.1627 68.6747 91.0782 68.1706C91.0317 67.8855 90.9867 67.599 90.9486 67.3097H92.8642C93.0556 67.3089 93.2389 67.2339 93.3743 67.1009C93.5096 66.9679 93.586 66.7877 93.5867 66.5996V62.7184C93.5852 62.5296 93.5076 62.3491 93.3708 62.2165C93.234 62.0839 93.0493 62.01 92.8571 62.0111Z" fill="white" />
                    <path d="M51.8038 49.0001H47.2375C47.2329 48.9997 47.2282 49.001 47.2246 49.0038C47.2209 49.0067 47.2185 49.0108 47.2178 49.0153V53.4972C47.2181 53.5022 47.2203 53.507 47.2239 53.5105C47.2275 53.5141 47.2324 53.5162 47.2375 53.5166H51.8038C51.8137 53.5166 51.8179 53.5069 51.8179 53.4972V49.0153C51.8123 49.0001 51.8038 49.0001 51.8038 49.0001Z" fill="white" />
                    <path d="M100.626 67.3083C101.397 67.3156 102.155 67.1166 102.82 66.7325C103.475 66.3578 104.022 65.8234 104.407 65.1809C104.802 64.529 105.007 63.783 105 63.0243V55.3672H97.0419C96.2978 55.3599 95.5671 55.5621 94.9362 55.9499C94.3083 56.332 93.7858 56.8601 93.415 57.4877C93.0343 58.1264 92.8327 58.8528 92.8305 59.593V63.0866C92.8238 63.8368 93.0312 64.5738 93.4291 65.2141C93.8202 65.8463 94.3658 66.3726 95.0165 66.745C95.6801 67.1246 96.436 67.3207 97.2038 67.3125L100.626 67.3083ZM99.6927 62.09H98.1433V60.5675H99.6927V62.09Z" fill="white" />
                    <path d="M98.8192 62.6326H89.5654V67.3083H98.8192V62.6326Z" fill="white" />
                    <path d="M18.3282 49.0003H23.2692C23.4389 49.0002 23.6065 49.0363 23.7606 49.1061C23.9147 49.1759 24.0515 49.2778 24.1616 49.4047C24.2717 49.5316 24.3525 49.6805 24.3983 49.841C24.4441 50.0016 24.4539 50.17 24.427 50.3346L23.3762 56.8097C23.3687 56.8558 23.3714 56.9029 23.3842 56.9479C23.397 56.9928 23.4196 57.0345 23.4504 57.0701C23.4812 57.1056 23.5195 57.1341 23.5626 57.1537C23.6057 57.1733 23.6527 57.1834 23.7002 57.1834H26.2355C26.2866 57.1835 26.3371 57.1954 26.3828 57.2179C26.4285 57.2405 26.4682 57.2733 26.4988 57.3135C26.5295 57.3538 26.5501 57.4006 26.5592 57.4501C26.5682 57.4996 26.5654 57.5504 26.551 57.5987L23.7833 66.6954C23.4368 67.8248 21.7452 67.6255 21.6888 66.4407L21.4719 61.9726C21.4698 61.9278 21.4582 61.8839 21.4379 61.8437C21.4175 61.8036 21.3889 61.768 21.3537 61.7394C21.3186 61.7107 21.2778 61.6896 21.2339 61.6773C21.1899 61.665 21.1439 61.6619 21.0987 61.6681L19.3226 61.8923C19.1573 61.9132 18.9894 61.8992 18.83 61.8513C18.6706 61.8033 18.5235 61.7226 18.3983 61.6144C18.2732 61.5063 18.173 61.3731 18.1043 61.2239C18.0356 61.0747 18 60.9128 18 60.749V49.3228C18.0004 49.2374 18.0351 49.1556 18.0965 49.0952C18.158 49.0348 18.2413 49.0007 18.3282 49.0003Z" fill="white" />
                    <path d="M20.824 69.4856C20.6832 69.5188 20.6677 69.5312 20.1916 69.9963C19.9451 70.2372 19.7296 70.4572 19.7113 70.4849C19.6531 70.5691 19.6248 70.6699 19.631 70.7715C19.6242 70.8829 19.6566 70.9933 19.7226 71.0843C19.8493 71.2614 21.8733 73.8194 21.9198 73.8609C22.0195 73.9504 22.1496 74 22.2846 74C22.4196 74 22.5497 73.9504 22.6494 73.8609C22.7072 73.8097 24.81 71.1438 24.8664 71.0511C24.9196 70.9686 24.9447 70.8716 24.9382 70.7742C24.9436 70.6727 24.9155 70.5722 24.8579 70.4877C24.8382 70.46 24.6227 70.2399 24.3776 69.9991C23.9734 69.606 23.9241 69.5589 23.8579 69.5285C23.8158 69.5107 23.7725 69.4959 23.7283 69.4842C23.6339 69.462 20.9015 69.4648 20.824 69.4856Z" fill="white" />
                </svg>
            )
        }
    }[type]()
}