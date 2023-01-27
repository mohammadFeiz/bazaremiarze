import React, { Component,Fragment } from 'react';
import AIOButton from './../../../interfaces/aio-button/aio-button';
import ProductCount from './../product-count/product-count';
import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
import appContext from './../../../app-context';
import Slider from './../../../npm/aio-slider/aio-slider';
import getSvg from './../../../utils/getSvg';
import { mdiChevronDown, mdiChevronLeft,mdiCheckCircle, mdiAlertCircle } from '@mdi/js';
import {Icon} from '@mdi/react';
import functions from './../../../functions';
import cartonSrc from './../../../images/belex-box.jpg';
export default class Product extends Component{
    render(){
        let { product } = this.props;
        if(product.type === 'forooshe_vije'){return <ForoosheVije {...this.props}/>}
        if(product.type === 'belex'){return <Belex {...this.props}/>}
        return <ProductReqular {...this.props}/>
    }
}
class ProductReqular extends Component {
    static contextType = appContext;
    componentDidMount(){
        this.mounted = true;
        let { product } = this.props;
        this.getVariants()
        let firstVariant = product.inStock ? (product.variants.filter((o) => o.inStock === null ? false : !!o.inStock)[0]) : undefined;
        this.setState({
            optionValues: firstVariant ? { ...firstVariant.optionValues } : undefined, showDetails: true,
            selectedVariant: firstVariant, srcIndex: 0
        });
    }
    getVariants() {
        let { product } = this.props;
        let { variants, optionTypes } = product;
        let optionTypesDict = {}
        let optionValuesDict = {}
        for (let i = 0; i < optionTypes.length; i++) {
            let o = optionTypes[i];
            optionTypesDict[o.id] = o.name;
            for (let prop in o.items) {
                let id = prop.toString();
                let name = o.items[id];
                optionValuesDict[id] = name;
            }
        }
        let res = [];
        this.ovs = []
            
        for (let i = 0; i < variants.length; i++) {
            let { optionValues, inStock, id } = variants[i];
            if (!inStock || inStock === null) { continue }
            let str = [];
            for (let prop in optionValues) {
                str.push(optionTypesDict[prop] + ' : ' + optionValuesDict[optionValues[prop]])
                this.ovs.push(optionValuesDict[optionValues[prop]]);
            }
            str = str.join(' -- ')
            res.push({ text: str, value: id, variant: variants[i],style:{height:36} })
        }
        this.options = res;
    }
    getVariantBySelected(selected) {
        let { product } = this.props;
        for (let i = 0; i < product.variants.length; i++) {
            let variant = product.variants[i];
            let { optionValues } = variant;
            let isMatch = true;
            for (let prop in selected) {
                if (selected[prop] !== optionValues[prop]) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) {
                return variant;
            }
        }
        return false;
    }
    changeOptionType(obj) {
        let { optionValues } = this.state;
        let keys = Object.keys(obj)
        for (let i = 0; i < keys.length; i++){
            //let key = keys[i];
            let newSelected;
            // if(obj[key] === optionValues[key]){
            //     newSelected = {...optionValues,[key]:undefined};
            // }
            // else{
                newSelected = { ...optionValues, ...obj };
            //}
            let variant = this.getVariantBySelected(newSelected);
            this.setState({
                optionValues: newSelected,
                selectedVariant: variant
            });
        }
    }
    getInStock() {
        let { selectedVariant } = this.state;
        let { inStock = 0 } = selectedVariant;
        if (inStock === null) { inStock = 0 }
        return inStock;
    }
    changeCount(count) {
        let {product} = this.props;
        let { changeCart } = this.context;
        let { selectedVariant } = this.state;
        let variantId = selectedVariant.id;
        changeCart(count, variantId,product);
    }
    body_layout() {
        let { product } = this.props;
        let { name, optionTypes, details, srcs } = product;
        let { srcIndex,selectedVariant } = this.state;
        return {
            flex: 1,className: "ofy-auto",gap: 12,
            column: [
                this.image_layout(name, selectedVariant.code, srcs[srcIndex]),
                this.options_layout(),
                this.optionTypes_layout(optionTypes),
                this.details_layout(details),
                
            ],
        };
    }
    image_layout(name, code, src) {
        let { product } = this.props, { srcIndex } = this.state;
        return {
            size: 346, className: "theme-box-shadow theme-card-bg theme-border-radius m-h-12",
            column: [
                { size: 24 },
                {
                    flex: 1, style: { overflow: 'hidden' },
                    childsProps: { align: "vh" },
                    row: [
                        { size: 36, html: getSvg("chevronLeft", { flip: true }), style: { opacity: srcIndex === 0 ? 0.5 : 1 } },
                        { flex: 1, html: <img src={src} alt="" height="100%" /> },
                        { size: 36, html: getSvg("chevronLeft"), style: { opacity: srcIndex === product ? 0.5 : 1 } },
                    ],
                },
                { size: 12 },
                { size: 36, html: name, className: "fs-14 theme-dark-font-color bold p-h-12" },
                { size: 36, html: "کد کالا : " + (code || ""), className: "fs-12 theme-medium-font-color p-h-12" },
            ]
        };
    }
    options_layout() {
        let { product } = this.props;
        if (product.optionTypes.length < 2) { return false }
        let {selectedVariant} = this.state;
        return {
            className: 'theme-card-bg theme-box-shadow theme-border-radius m-h-12',hide_xs:true,
            column: [
                {size:12},
                {
                    row:[
                        {html:`(${this.options.length}) انتخاب اقلام موجود`,align:'v',className:'p-h-12 theme-medium-font-color fs-14 bold',style:{direction:'ltr'}},
                        {flex:1}
                    ]
                },
                {
                    align: 'v', className: 'p-12',
                    html: (
                        <AIOButton
                            type='select' className='product-exist-options'
                            style={{width:'100%'}}
                            popupAttrs={{ style: { maxHeight: 400 } }}
                            options={this.options}
                            popupWidth='fit'
                            value={selectedVariant.id}
                            optionStyle='{height:28,fontSize:12}'
                            onChange={(value, obj) => {
                                this.changeOptionType(obj.option.variant.optionValues)
                            }}
                        />
                    )
                }
            ]

        }
    }
    optionTypes_layout(optionTypes) {
        let { optionValues } = this.state;
        if (!optionValues || !optionTypes) { return { html: '' } }
        return {
            className: "theme-card-bg theme-box-shadow theme-border-radius gap-no-color m-h-12 p-12",
            column: [
                {
                    gap:6,
                    column: optionTypes.map(({ name, id, items = {} }, i) => {
                        if(name === 'brand'){return false}
                        return {
                            column: [
                                { html: name, align: "v", className: "fs-12 theme-medium-font-color bold h-24" },
                                {size:6},
                                {
                                    className: "ofx-auto", gap: 12,
                                    row: Object.keys(items).filter((o)=>{
                                        return this.ovs.indexOf(items[o]) !== -1
                                    }).map((o) => {
                                        let itemId = o.toString();
                                        let active = false,style;
                                        if(optionValues[id] === undefined){
                                            console.error(`
in product by id = ${this.props.product.id} there is an optionType by id = ${id}. but in optionValues we can find this id. optionValues is ${JSON.stringify(optionValues)}
                                            `)
                                        }
                                        else{
                                            active = optionValues[id].toString() === itemId;
                                        }
                                        let className = 'fs-12 p-v-3 p-h-12 br-4 product-option-value';
                                        if (active) { className += ' active'; }
                                        return { html: items[itemId], align: "vh", className, style,onClick: () => this.changeOptionType({ [id]: itemId })};
                                    })
                                }
                            ]
                        };
                    })
                }
            ]
        };
    }
    details_layout(details) {
        let { showDetails } = this.state;
        if(!details){return false}
        return {
            className: "theme-card-bg theme-box-shadow theme-border-radius p-12 m-h-12",
            column: [
                {
                    size: 36, childsProps: { align: 'v' },
                    onClick: (() => this.setState({ showDetails: !showDetails })),
                    className:'theme-medium-font-color',
                    row: [
                        { size: 24, align: 'vh', html: <Icon path={showDetails?mdiChevronDown:mdiChevronLeft} size={0.8}/> },
                        { html: 'مشخصات', className: "fs-14 bold" }
                    ]
                },
                {
                    show: !!showDetails,
                    html: () => (
                        <div className='w-100 br-4 of-hidden' style={{ display: "grid", gridTemplateColumns: "auto auto", gridGap: 1}}>
                            {details.map((o, i) => {
                                if(o[0] === undefined || o[1] === undefined){return null}
                                let props = { className: "fs-12 theme-medium-font-color p-v-6 p-h-12", style: { background: "#F4F4F4" } };
                                return (<Fragment key={i}><div {...props}>{o[0]}</div><div {...props}>{o[1]}</div></Fragment>);
                            })}
                        </div>
                    )
                }
            ]
        };
    }
    showCart_layout(){
        let { cart,openPopup } = this.context;
        if(!Object.keys(cart).length){return false}
        return {
            className:'p-h-12 bgFFF',size:36,align:'v',
            row:[
                {html:'مشاهده',className:'theme-light-font-color fs-12 bold',align:'v'},
                {size:4},
                {html:'سبد خرید',className:'theme-link-font-color fs-12 bold',align:'v',attrs:{onClick:()=>openPopup('cart')}},
                {size:4},
                {html:<Icon path={mdiChevronLeft} size={0.8}/>,align:'vh',className:'theme-link-font-color'}
            ]
        }
    }
    footer_layout() {
        return {
            size: 80, style: { boxShadow:'0 0px 6px 1px rgba(0,0,0,.1)' }, className: "p-h-24 bg-fff",
            row: [
                this.addToCart_layout(), 
                { flex: 1 }, 
                this.price_layout()
            ],
        };
    }
    addToCart_layout() {
        let { getCartCountByVariantId } = this.context;
        let { selectedVariant } = this.state;
        if (!selectedVariant || !selectedVariant.inStock || selectedVariant.inStock === null) {
            return { html: '' }
        }
        let count = getCartCountByVariantId(selectedVariant.id)
        return {
            column:[
                {
                    flex:1,show:!!!count,html: (<button onClick={() => this.changeCount(1)} className={"button-2" + (!selectedVariant ? " disabled" : "")}>افزودن به سبد خرید</button>),
                    align: "v",
                },
                { flex:1,align:'v',show:!!count, html: () => <ProductCount value={count} onChange={(count) => this.changeCount(count)} max={this.getInStock()} /> },
                
            ]
        }
    }
    price_layout() {
        let { selectedVariant } = this.state;
        if (!selectedVariant || !selectedVariant.inStock || selectedVariant.inStock === null) {
            return { column: [{ flex: 1 }, { html: "ناموجود", className: "colorD83B01 bold fs-14" }, { flex: 1 }] };
        }
        let { getCartCountByVariantId } = this.context;
        //یا یک را اضافه می کنم چون اگه تعداد صفر بود قیمت واحد رو نشون بده
        let count = getCartCountByVariantId(selectedVariant.id) || 1;
        let {B1Dscnt,CmpgnDscnt,PymntDscnt} = selectedVariant;
        return {
            column: [
                { flex: 1 },
                {
                    row: [
                        { flex: 1 },
                        { show:!!B1Dscnt || !!CmpgnDscnt || !!PymntDscnt,html: ()=><del>{functions.splitPrice(selectedVariant.Price * count)}</del>, className: "theme-light-font-color" },
                        { size: 3 },
                        {
                            html: "%" + B1Dscnt,show:!!B1Dscnt,
                            style: { background: "#FDB913", color: "#fff", borderRadius: 8, padding: "0 3px" },
                        },
                        { size: 3 },
                        {
                            html: "%" + CmpgnDscnt,show:!!CmpgnDscnt,
                            style: { background: "#FDB913", color: "#fff", borderRadius: 8, padding: "0 3px" },
                        },
                        { size: 3 },
                        {
                            html: "%" + PymntDscnt,show:!!PymntDscnt,
                            style: { background: "#ff4335", color: "#fff", borderRadius: 8, padding: "0 3px" },
                        }
                    ],
                },
                {
                    row: [
                        { flex: 1 },
                        { html: functions.splitPrice(selectedVariant.FinalPrice * count), className: "theme-dark-font-color bold" },
                        { size: 6 },
                        { html: "ریال", className: "theme-dark-font-color bold" },
                    ],
                },
                { flex: 1 },
            ],
        };
    }
    render() {
        if(!this.mounted){return null}
        return (
            <RVD
                layout={{
                    className: "theme-popup-bg",
                    column: [
                        {size:12},
                        this.body_layout(),
                        {size:12},
                        this.showCart_layout(), 
                        this.footer_layout()
                    ],
                }}
            />
        );
    }
}




class ForoosheVije extends Component {
    static contextType = appContext;
    state = {}
    componentDidMount(){
        this.mounted = true;
        let {cart} = this.context;
        let { variantId } = this.props;
        let foroosheVije_count = false;
        if(variantId){foroosheVije_count = cart[variantId].foroosheVije_count}
        this.setState({variantId,foroosheVije_count})
    }
    changeVariant(variantId){
        let {cart} = this.context;
        let foroosheVije_count;
        if(cart[variantId]){foroosheVije_count = cart[variantId].foroosheVije_count}
        else{
            let {product} = this.props;
            let {optionValues} = product;
            let variant = this.getVariant(variantId);
            let {totalQty} = variant;
            let qtyInPack = optionValues.map(({name,id,step},i)=>{
                return {optionValueId:id,optionValueName:name,count:i === 0?totalQty:0,step}
            })
            foroosheVije_count = {packQty:0,qtyInPack}
        }
        this.setState({foroosheVije_count,variantId})
    }
    getVariant(variantId = this.state.variantId){
        if(!variantId){return false}
        let {product} = this.props;
        let {variants} = product;
        return variants.find(({id})=>variantId === id);
    }
    changeCount(foroosheVije_count) {
        this.setState({foroosheVije_count})
    }
    image_layout(name, code, src) {
        let { product } = this.props, { srcIndex } = this.state;
        return {
            size: 346, className: "theme-box-shadow theme-card-bg theme-border-radius m-h-12",
            column: [
                { size: 24 },
                {
                    flex: 1, style: { overflow: 'hidden' },
                    childsProps: { align: "vh" },
                    row: [
                        { size: 36, html: getSvg("chevronLeft", { flip: true }), style: { opacity: srcIndex === 0 ? 0.5 : 1 } },
                        { flex: 1, html: <img src={src} alt="" height="100%" /> },
                        { size: 36, html: getSvg("chevronLeft"), style: { opacity: srcIndex === product ? 0.5 : 1 } },
                    ],
                },
                { size: 12 },
                { size: 36, html: name, className: "fs-14 theme-dark-font-color bold p-h-12" },
                { size: 36, html: "کد کالا : " + (code || ""), className: "fs-12 theme-medium-font-color p-h-12" },
            ]
        };
    }
    packs_layout(){
        let {product} = this.props;
        let {variants} = product;
        let {variantId} = this.state;
        let variant;
        if(variantId){
            variant = this.getVariant()
        }
        
        return {
            column:[
                {html:'بسته خود را مشخص کنید',align:'v',className:'theme-dark-font-color fs-14 bold'},
                {html:'بسته های بزرگ تر تخقیف های ارزنده تری دارند.',align:'v',className:'theme-medium-font-color fs-12'},
                {size:12},
                {className:'ofx-auto',row:variants.map((o,i)=>this.pack_layout(o,i))},
                {size:12},
                {show:!!variant,html:()=>`قیمت واحد محصول : ${functions.splitPrice(variant.unitPrice)} ریال`,className:'theme-medium-font-color fs-12'},
                {show:!!variant,html:()=>`تعداد محصول در بسته : ${variant.totalQty} عدد`,className:'theme-medium-font-color fs-12'},
                {show:!!variant,size:12},
                {
                    show:!!variant,
                    style:{color:'#107C10'},
                    row:[
                        {html:<Icon path={mdiCheckCircle} size={0.7}/>,align:'vh'},
                        {size:6},
                        {html:'موجودی کافی',className:'fs-14 bold',align:'v'}
                    ]
                }
            ]
        }
    }
    packQty_layout(){
        let {variantId,foroosheVije_count} = this.state;
        if(!variantId || !foroosheVije_count){return false}
        let {packQty} = foroosheVije_count;
        return {
            column:[
                {html:`2: تعداد بسته را مشخص کنید`,align:'v',className:'theme-dark-font-color fs-14 bold'},
                {
                    html:(
                        <input type ='number' value={packQty} onChange={(e)=>{
                            let value = +e.target.value;
                            if(isNaN(value)){value = ''}
                            foroosheVije_count.packQty = value;
                            this.changeCount(foroosheVije_count)
                        }}/>
                    )
                }
            ]
        }
    }
    getSelectedCount(){
        let {foroosheVije_count} = this.state;
        let {qtyInPack} = foroosheVije_count;
        let count = 0;
        for(let i = 0; i < qtyInPack.length; i++){
            count += qtyInPack[i].count || 0;
        }
        return count;
    }
    isFull(){
        let v = this.getVariant();
        if(!v){return false}
        let {foroosheVije_count} = this.state;
        if(!foroosheVije_count){return false}
        let {packQty} = foroosheVije_count;
        let {totalQty} = v;
        totalQty *= packQty;
        let selectedCount = this.getSelectedCount();
        return selectedCount === totalQty;
        
    }
    qtyInPacks_layout(){
        let {variantId,foroosheVije_count} = this.state;
        if(!variantId || !foroosheVije_count){return false}
        let {qtyInPack,packQty} = foroosheVije_count;
        if(!packQty){return false}
        let {product} = this.props;
        let v = this.getVariant();
        let {totalQty} = v;
        totalQty *= packQty;
        let selectedCount = this.getSelectedCount();
        let isFull = this.isFull();
        return {
            column:[
                {html:`3: رنگ کالاها در ${packQty + ' ' + v.name} را انتخاب کنید`,align:'v',className:'theme-dark-font-color fs-14 bold'},
                {
                    gap:6,column:qtyInPack.map((o,i)=>{
                        let used = 0;
                        for(let j = 0; j < qtyInPack.length; j++){
                            used += qtyInPack[j].count;
                        }
                        let remaining = totalQty - used;
                        return {
                            size:48,
                            html:(
                                <ForoosheVijeSlider 
                                    key={variantId} {...o} totalQty={totalQty} max={o.count + remaining} 
                                    onChange={(value)=>{
                                        o.count = value;
                                        this.changeCount(foroosheVije_count)
                                    }}
                                />
                            )
                        }
                    })
                },
                {size:12}, 
                {
                    style:{color:isFull?'#107C10':'#d0000a'},
                    row:[
                        {html:<Icon path={isFull?mdiCheckCircle:mdiAlertCircle} size={0.7}/>},
                        {size:6},
                        {html:`${selectedCount + ' عدد'} از ${totalQty + ' عدد'} کالا تعیین رنگ شده`,align:'v',className:'fs-14 bold'}
                    ]
                },
            ]
        }
    }
    pack_layout({id,name,finalPrice},i){
        let {variantId} = this.state;
        let {product} = this.props;
        let {variants} = product;
        let active = id === variantId;
        let br = {borderTopLeftRadius:0,borderTopRightRadius:0,borderBottomLeftRadius:0,borderBottomRightRadius:0};
        if(i === 0){br.borderTopRightRadius = 36; br.borderBottomRightRadius = 36}
        if(i === variants.length - 1){br.borderTopLeftRadius = 36; br.borderBottomLeftRadius = 36}
        return {
            onClick:()=>this.changeVariant(id),
            size:144,style:{border:'1px solid',padding:'6px 12px',...br,background:active?'#DCE1FF':'#fff'},
            column:[
                {html:name,className:'theme-dark-font-color fs-14 bold',style:{textAlign:'right'}},
                {
                    row:[
                        {html:`${functions.splitPrice(finalPrice)} ریال`,className:'theme-dark-font-color fs-12 bold',align:'v'}
                    ]
                }
            ]
        }
    }
    showCart_layout(){
        let { cart,openPopup } = this.context;
        if(!Object.keys(cart).length){return false}
        return {
            className:'p-h-12 bgFFF',size:36,align:'v',
            row:[
                {html:'مشاهده',className:'theme-light-font-color fs-12 bold',align:'v'},
                {size:4},
                {html:'سبد خرید',className:'theme-link-font-color fs-12 bold',align:'v',attrs:{onClick:()=>openPopup('cart')}},
                {size:4},
                {html:<Icon path={mdiChevronLeft} size={0.8}/>,align:'vh',className:'theme-link-font-color'}
            ]
        }
    }
    price_layout() {
        let { variantId,foroosheVije_count } = this.state;
        if(!variantId || !foroosheVije_count){return false}
        let variant = this.getVariant(variantId);
        //یا یک را اضافه می کنم چون اگه تعداد صفر بود قیمت واحد رو نشون بده
        let {packQty} = foroosheVije_count;
        packQty = packQty || 1; 
        let {finalPrice} = variant;
        return {
            column: [
                { flex: 1 },
                {
                    row: [
                        { flex: 1 },
                        { html: functions.splitPrice(finalPrice * packQty), className: "theme-dark-font-color bold" },
                        { size: 6 },
                        { html: "ریال", className: "theme-dark-font-color bold" },
                    ],
                },
                { flex: 1 },
            ],
        };
    }
    async updateCart(){
        let {foroosheVije_count} = this.state;
        let {packQty} = foroosheVije_count;
        let {product} = this.props;
        let {variantId} = this.state;
        let {cart,kharidApis,SetState} = this.context;
        let newCart;
        if(packQty === 0){
            let res = {};
            for(let prop in cart){
                if(prop.toString() !== variantId.toString()){res[prop] = cart[prop]}
            }
            newCart = res;
        }
        else{
            newCart = {...cart}
            if(newCart[variantId] === undefined){
                let variant = this.getVariant();
                newCart[variantId] = {foroosheVije_count,product,variantId:variant.id}
            }
            else{newCart[variantId].foroosheVije_count = foroosheVije_count;}
        }
        
        await kharidApis({api:'setCart',parameter:newCart,loading:false})
        SetState({cart:newCart});
        
    }
    cart_layout() {
        let {variantId} = this.state;
        if(!variantId){return false}
        let {cart} = this.context;
        let isFull = this.isFull()
        return {
            column:[
                {
                    flex:1,show:!cart[variantId],html: (<button disabled={!isFull} onClick={() => this.updateCart()} className={"button-2"}>افزودن به سبد خرید</button>),
                    align: "v",
                },
                {
                    flex:1,show:!!cart[variantId],html: (<button disabled={!isFull} onClick={() => this.updateCart()} className={"button-2"}>ویرایش سبد خرید</button>),
                    align: "v",
                },
                
                
            ]
        }
    }
    render() {
        if(!this.mounted){return null}
        let { product } = this.props;
        let { name, src,code } = product;
        return (
            <RVD
                layout={{
                    className: "theme-popup-bg",
                    column: [
                        {size:12},
                        {
                            flex: 1,className: "ofy-auto",gap: 12,
                            column: [
                                this.image_layout(name, code, src),
                                {
                                    className: 'theme-card-bg theme-box-shadow theme-border-radius m-h-12 p-12',
                                    column:[
                                        this.packs_layout(),
                                        {size:36,align:'v',html:<div style={{width:'100%',height:1,background:'#ddd'}}></div>},
                                        this.packQty_layout(),
                                        {size:36,align:'v',html:<div style={{width:'100%',height:1,background:'#ddd'}}></div>},
                                        this.qtyInPacks_layout()
                                    ]
                                }                                
                            ]
                        },
                        {size:12},
                        this.showCart_layout(), 
                        {
                            size: 80, style: { boxShadow:'0 0px 6px 1px rgba(0,0,0,.1)' }, className: "p-h-24 bg-fff",
                            row: [
                                this.cart_layout(),
                                { flex: 1 },
                                this.price_layout()
                            ],
                        }
                    ]
                }}
            />
        );
    }
}


class Belex extends Component {
    static contextType = appContext;
    state = {}
    componentDidMount(){
        this.mounted = true;
        let {cart} = this.context;
        let { product } = this.props;
        let belex_count;
        if(cart[product.code]){belex_count = cart[product.code].belex_count}
        else {belex_count = this.getQtyInPacks()}
        this.setState({belex_count})
    }
    getQtyInPacks(){
        let {product} = this.props;
        let {variants} = product;
        let qtyInPacks = {};
        let packQty = 0
        for(let i = 0; i < variants.length; i++){
            let variant = variants[i];
            qtyInPacks[variant.id] = variant.variants.map((o,j)=>{   
                return {optionValueId:o.Code,optionValueName:o.Name,count:j === 0?variant.qty:0,step:o.Step}
            })
        }
        return {packQty,qtyInPacks};
    }
    changeCount(belex_count) {
        this.setState({belex_count});
        clearTimeout(this.cartTimeout);
        this.cartTimeout = setTimeout(()=>{
            this.updateCart()
        },1000)
    }
    image_layout(name, code, src) {
        let { product } = this.props, { srcIndex } = this.state;
        return {
            size: 346, className: "theme-box-shadow theme-card-bg theme-border-radius m-h-12",
            column: [
                { size: 24 },
                {
                    flex: 1, style: { overflow: 'hidden' },
                    childsProps: { align: "vh" },
                    row: [
                        { size: 36, html: getSvg("chevronLeft", { flip: true }), style: { opacity: srcIndex === 0 ? 0.5 : 1 } },
                        { flex: 1, html: <img src={src} alt="" height="100%" /> },
                        { size: 36, html: getSvg("chevronLeft"), style: { opacity: srcIndex === product ? 0.5 : 1 } },
                    ],
                },
                { size: 12 },
                { size: 36, html: name, className: "fs-14 theme-dark-font-color bold p-h-12" },
                { size: 36, html: "کد کالا : " + (code || ""), className: "fs-12 theme-medium-font-color p-h-12" },
            ]
        };
    }
    
    packQty_layout(){
        let {belex_count} = this.state;
        if(!belex_count){return false}
        let {packQty,qtyInPacks} = belex_count;
        return {
            row:[
                {html:`تعداد بسته را مشخص کنید`,align:'v',className:'theme-dark-font-color fs-14 bold'},
                {size:12},
                {
                    html:(
                        <input 
                            type ='number' 
                            value={packQty} 
                            style={{
                                border:'1px solid #ddd',
                                borderRadius: 4,
                                height:24,
                                width:72,
                                outline:'none'
                            }}
                            onChange={(e)=>{
                            let {product} = this.props;
                            let value = +e.target.value;
                            if(isNaN(value)){value = ''}
                            belex_count.packQty = value;
                            for(let i = 0; i < product.variants.length; i++){
                                let variant = product.variants[i];
                                let qtyInPack = qtyInPacks[variant.id];
                                let used = 0;
                                for(let j = 0; j < qtyInPack.length; j++){
                                    used += qtyInPack[j].count;
                                }
                                let remaining = (variant.qty * (belex_count.packQty || 0)) - used;
                                if(remaining){
                                    qtyInPack[0].count += remaining; 
                                } 
                            }
                            this.changeCount(belex_count)
                        }}/>
                    )
                }
            ]
        }
    }
    packDetails_layout(){
        let {product} = this.props;
        return {
            className:'theme-card-bg m-h-12 p-12 theme-border-radius theme-box-shadow',
            column:[
                {html:`اقلام داخل هر یک بسته`,align:'v',className:'theme-dark-font-color fs-14 bold'},
                {size:12},
                {
                    column:product.variants.map((o)=>{
                        return {
                            row:[
                                {align:'vh',html:<img src={cartonSrc} alt='' width='30'/>},
                                {size:6},
                                {
                                    align:'v',html:`تعداد ${o.qty} عدد ${o.name}`,className:'theme-medium-font-color fs-12'
                                }
                            ]
                        }
                    })
                }
            ]
        }
    }
    getSelectedCount(id){
        let {belex_count} = this.state;
        let {qtyInPacks} = belex_count;
        let qtyInPack = qtyInPacks[id];
        let count = 0;
        for(let i = 0; i < qtyInPack.length; i++){
            count += qtyInPack[i].count || 0;
        }
        return count;
    }
    isFull(id,qty){
        let {belex_count} = this.state;
        if(!belex_count){return false}
        let selectedCount = this.getSelectedCount(id);
        return selectedCount === qty;
        
    }
    qtyInPacks_layout(){
        let {belex_count} = this.state;
        if(!belex_count){return false}
        let {qtyInPacks,packQty} = belex_count;
        if(!packQty){return false}
        let {product} = this.props;
        return {
            column:product.variants.map((variant)=>{
                let {qty,name,id} = variant;
                qty *= packQty;
                let qtyInPack = qtyInPacks[id]
                let selectedCount = this.getSelectedCount(id);
                let isFull = this.isFull(id,qty);
                return {
                    column:[
                        {
                            html:`رنگ کالاها در ${packQty + ' بسته ' + name} را انتخاب کنید`,
                            align:'v',
                            className:'theme-dark-font-color fs-14 bold'},
                            {size:12},
                        {
                            gap:6,column:qtyInPack.map((o,i)=>{
                                let used = 0;
                                for(let j = 0; j < qtyInPack.length; j++){
                                    used += qtyInPack[j].count;
                                }
                                let remaining = qty - used;
                                return {
                                    size:72,
                                    html:(
                                        <ForoosheVijeSlider 
                                            key={product.code} {...o} totalQty={qty} max={o.count + remaining} 
                                            onChange={(value)=>{
                                                o.count = value;
                                                this.changeCount(belex_count)
                                            }}
                                        />
                                    )
                                }
                            })
                        },
                        {size:12}, 
                        {
                            style:{color:isFull?'#107C10':'#d0000a'},
                            row:[
                                {html:<Icon path={isFull?mdiCheckCircle:mdiAlertCircle} size={0.7}/>},
                                {size:6},
                                {html:`${selectedCount + ' عدد'} از ${qty + ' عدد'} کالا تعیین رنگ شده`,align:'v',className:'fs-14 bold'}
                            ]
                        },
                        {size:36},
                        {html:<div style={{height:6,background:'#f8f8f8',width:'100%'}}></div>},
                        {size:36}
                    ]
                }
            })
        }
    }
    showCart_layout(){
        let { cart,openPopup } = this.context;
        if(!Object.keys(cart).length){return false}
        return {
            className:'p-h-12 bgFFF',size:36,align:'v',
            row:[
                {html:'مشاهده',className:'theme-light-font-color fs-12 bold',align:'v'},
                {size:4},
                {html:'سبد خرید',className:'theme-link-font-color fs-12 bold',align:'v',attrs:{onClick:()=>openPopup('cart')}},
                {size:4},
                {html:<Icon path={mdiChevronLeft} size={0.8}/>,align:'vh',className:'theme-link-font-color'}
            ]
        }
    }
    price_layout() {
        let { belex_count } = this.state;
        if(!belex_count){return false}
        //یا یک را اضافه می کنم چون اگه تعداد صفر بود قیمت واحد رو نشون بده
        let {packQty} = belex_count;
        packQty = packQty || 1; 
        let {product} = this.props;
        return {
            column: [
                { flex: 1 },
                {
                    row: [
                        { flex: 1 },
                        { html: functions.splitPrice(product.price * packQty), className: "theme-dark-font-color bold" },
                        { size: 6 },
                        { html: "ریال", className: "theme-dark-font-color bold" },
                    ],
                },
                { flex: 1 },
            ],
        };
    }
    async updateCart(remove){
        let {belex_count} = this.state;
        let {packQty} = belex_count;
        let {product} = this.props;
        let {cart,kharidApis,SetState} = this.context;
        let newCart;
        if(packQty === 0 || remove){
            let res = {};
            for(let prop in cart){
                if(prop.toString() !== product.code.toString()){res[prop] = cart[prop]}
            }
            newCart = res;
        }
        else{
            newCart = {...cart}
            if(newCart[product.code] === undefined){
                newCart[product.code] = {belex_count,product}
            }
            else{newCart[product.code].belex_count = belex_count;}
        }
        
        await kharidApis({api:'setCart',parameter:newCart,loading:false})
        SetState({cart:newCart});
        
    }
    cart_layout() {
        let {cart} = this.context;
        let {product} = this.props;
        let {belex_count} = this.state;
        if(!belex_count){return false}
        let isFull = true;
        for(let i = 0; i < product.variants.length; i++){
            let variant = product.variants[i];
            if(!this.isFull(variant.id,variant.qty * belex_count.packQty)){
                isFull = false;
                break;
            }
        }
        return {
            column:[
                {
                    flex:1,show:!cart[product.code],html: (<button disabled={!isFull} onClick={() => this.updateCart()} className={"button-2"}>افزودن به سبد خرید</button>),
                    align: "v",
                },
                {
                    flex:1,show:!!cart[product.code],html: (
                        <button 
                            onClick={() => this.updateCart(true)} className={"button-2"}
                            style={{color:'#d0000a',background:'none',fontWeight:'bold'}}
                        >حذف از سبد خرید</button>
                    ),
                    align: "v",
                },
                
                
            ]
        }
    }
    render() {
        if(!this.mounted){return null}
        let { product } = this.props;
        let { name, src,code } = product;
        return (
            <RVD
                layout={{
                    className: "theme-popup-bg",
                    column: [
                        {size:12},
                        {
                            flex: 1,className: "ofy-auto",gap: 12,
                            column: [
                                this.image_layout(name, code, src),
                                this.packDetails_layout(),
                                {
                                    className: 'theme-card-bg theme-box-shadow theme-border-radius m-h-12 p-12',
                                    column:[
                                        //{size:36,align:'v',html:<div style={{width:'100%',height:1,background:'#ddd'}}></div>},
                                        this.packQty_layout(),
                                        {size:36,align:'v',html:<div style={{width:'100%',height:1,background:'#ddd'}}></div>},
                                        this.qtyInPacks_layout()
                                    ]
                                }                                
                            ]
                        },
                        {size:12},
                        this.showCart_layout(), 
                        {
                            size: 80, style: { boxShadow:'0 0px 6px 1px rgba(0,0,0,.1)' }, className: "p-h-24 bg-fff",
                            row: [
                                this.cart_layout(),
                                { flex: 1 },
                                this.price_layout()
                            ],
                        }
                    ]
                }}
            />
        );
    }
}

class ForoosheVijeSlider extends Component{
    state = {count:this.props.count,prevCount:this.props.count}
    render(){
        let {count,prevCount} = this.state;
        if(this.props.count !== prevCount){
            setTimeout(()=>{
                this.setState({
                    count:this.props.count,
                    prevCount:this.props.count
                })
            },0)
        }
        let {optionValueName,totalQty,onChange = ()=>{},max,step} = this.props;
        let percent = (count / totalQty * 100).toFixed(0); 
        
                        
        return (
            <RVD
                layout={{
                    column:[
                        {html:optionValueName,align:'v',className:'theme-medium-font-color fs-12 bold'},
                        {
                            
                            row:[
                                {
                                    flex:1,
                                    html:(
                                        <Slider
                                            attrs={{style:{padding:'0 30px'}}}
                                            scaleStep={[max]}
                                            scaleStyle={(value)=>{if(value === max){return {background:'#2BBA8F'}}}}
                                            labelStep={[max]}
                                            labelStyle={(value)=>{if(value === max){return {color:'#2BBA8F',fontSize:12,top:43}}}}
                                            start={0} direction='left'
                                            end={totalQty}
                                            max={max}
                                            step={step}
                                            points={[count]}
                                            lineStyle={{height:4}}
                                            showValue={false}
                                            fillStyle={(index)=>{
                                                if(index === 0){return {height:4,background:'#2BBA8F'}}
                                            }}
                                            pointStyle={{background:'#2BBA8F',width:16,height:16,zIndex:1000}}
                                            onChange={(points,drag)=>{
                                                this.setState({count:points[0]});
                                                if(!drag){onChange(points[0])}
                                            }}
                                        />
                                    ),
                                    align:'v'
                                },
                                {
                                    html:<div style={{padding:'0 3px',color:'#666',width:24,borderRadius:6,fontSize:10}}>{percent + '%'}</div>,align:'vh'
                                },
                                {
                                    html:<div style={{background:'#2BBA8F',padding:'0 3px',color:'#fff',width:36,borderRadius:6}}>{count}</div>,align:'vh'
                                }
                            ]
                        }
                    ]
                }}
            />
        )
    }
}