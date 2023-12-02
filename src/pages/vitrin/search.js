import React, { Component } from "react";
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import AIOInput from "../../npm/aio-input/aio-input";
import Box from "./box";
import TreeCategories from './../../npm/aio-functions/tree-category/index';
import Suggestion from "./suggestion";
import Products from "./products";
import VitrinContext from "./context";
import Icon from "@mdi/react";
import { mdiMagnify } from "@mdi/js";
export default class Search extends Component {
    static contextType = VitrinContext;
    constructor(props) {
        super(props);
        this.state = {
            categories: [], taxon: false, searchValue: '', products: undefined, pageNumber: 1, pageSize: 10,total: false,
            brands:[],selectedBrands:[],
            paging: {
                number: 1,size: 20,sizes: [10, 20, 40, 100],serverSide: true,length: 0,
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
            'بروکس','پارس شهاب','سایروکس','خزرشید','کملیون','مازی نور'
        ]
        this.setState({ categories: backOffice.vitrinCategories,brands }, () => this.updateProducts())
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
    changeCategory(taxon){
        let {paging} = this.state;
        this.setState({ taxon, total: false, paging: { ...paging, number: 1 } }, () => this.updateProducts())
    }
    header_layout(){
        let { isFirstTime } = this.props
        return !isFirstTime?false:{html: <Box type='description'/>}
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
    body_layout(){
        let { removeModal } = this.context,{ isFirstTime } = this.props;
        let { products, paging,categories, total } = this.state;
        return {
            flex: 1,
            column: [
                { 
                    flex: 1, className: 'ofy-auto', 
                    column: [
                        this.search_layout(), 
                        this.categories_layout(categories, total), 
                        //this.brands_layout(),
                        this.products_layout(products,paging),
                        this.suggestion_layout(isFirstTime)
                    ] 
                },
                this.inter_layout(isFirstTime,removeModal)
            ]
        }
    }
    search_layout(){
        let className = 'vitrin-search-box',placeholder = "جستجو در محصولات",before = <Icon path={mdiMagnify} size={1} />
        let props = {type:'text',className,placeholder,before,onChange:(value) => this.changeSearch(value)}
        return {html: <AIOInput {...props}/>}
    }
    categories_layout(categories,total){
        let props = {rtl:true,total,categories,onChange:(taxon) => this.changeCategory(taxon)}
        return !categories.length?false:{className: 'm-h-6',html: <TreeCategories {...props} />}
    }
    products_layout(products,paging){
        let props = {type:'table',value:products,paging,rowsTemplate:() => <Products products={products} />}
        return {html: <AIOInput {...props}/>}
    }
    suggestion_layout(isFirstTime){
        return !!isFirstTime?false:{className: 'p-24', style: { background: '#eee' }, html: ()=><Suggestion/> }
    }
    inter_layout(isFirstTime,removeModal){
        return !isFirstTime?false:{
            className: 'm-12',align: 'vh',
            html: ()=><button onClick={() => removeModal()} className='button-2'>تایید و ورود به ویترین من</button>
        }
    }
    render() {return <RVD layout={{className: 'theme-popup-bg',column: [this.header_layout(),this.body_layout()]}}/>}
}