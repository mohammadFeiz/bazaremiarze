import React, { Component,Fragment } from 'react';
import AIOButton from './../../../interfaces/aio-button/aio-button';
// import ProductCount from './../product-count/product-count';
import CartButton from '../cart-button';
import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
import appContext from './../../../app-context';
import Slider from './../../../npm/aio-slider/aio-slider';
import getSvg from './../../../utils/getSvg';
import { mdiChevronDown, mdiChevronLeft,mdiCheckCircle, mdiAlertCircle, mdiMinus, mdiPlus } from '@mdi/js';
import {Icon} from '@mdi/react';
import SplitNumber from '../../../npm/aio-functions/split-number';
import cartonSrc from './../../../images/belex-box.jpg';
export default class Product extends Component{
    static contextType = appContext
    componentDidMount(){
        let { product } = this.props;
        let {addAnaliticsHistory} = this.context;
        addAnaliticsHistory({url:product.id,title:product.name})
        
    }
    render(){
        let { product } = this.props;
        if(product.cartId === 'فروش ویژه'){return <ForoosheVije {...this.props}/>}
        if(product.cartId === 'بلکس'){return <Belex {...this.props}/>}
        return <ProductReqular {...this.props}/>
    }
}
class ProductReqular extends Component {
    static contextType = appContext;
    componentDidMount(){
        this.mounted = true;
        let { product } = this.props;
        this.getVariants()
        let firstVariant = product.inStock ? (product.variants.filter((o) => o.inStock)[0]) : undefined;
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
            if (!inStock) { continue }
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
    body_layout() {
        let { product } = this.props;
        let { name, optionTypes, details, srcs } = product;
        let { srcIndex,selectedVariant } = this.state;
        let code = selectedVariant?selectedVariant.code:undefined;
        return {
            flex: 1,className: "ofy-auto",gap: 12,
            column: [
                this.image_layout(name, code, srcs[srcIndex]),
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
                            value={selectedVariant?selectedVariant.id:undefined}
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
        let { openPopup } = this.context;
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
            size: 80, style: { boxShadow:'0 0px 6px 1px rgba(0,0,0,.1)' }, className: "p-h-12 bg-fff",
            row: [
                this.addToCart_layout(), 
                { flex: 1 }, 
                this.price_layout()
            ],
        };
    }
    addToCart_layout() {
        let {product} = this.props;
        let { selectedVariant } = this.state;
        if (!selectedVariant || !selectedVariant.inStock) {
            return { html: '' }
        }
        return {
            column:[
                {flex:1},
                {html:(<CartButton variantId={selectedVariant.id} product={product} renderIn='product'/>)},
                {flex:1}
            ]
        }
    }
    price_layout() {
        let { selectedVariant } = this.state;
        if (!selectedVariant || !selectedVariant.inStock) {
            return { column: [{ flex: 1 }, { html: "ناموجود", className: "colorD83B01 bold fs-14" }, { flex: 1 }] };
        }
        let {product} = this.props;
        let { getCartItem } = this.context;
        //یا یک را اضافه می کنم چون اگه تعداد صفر بود قیمت واحد رو نشون بده
        let {count} = getCartItem(product.cartId,selectedVariant.id) || {count:1}
        let {B1Dscnt,CmpgnDscnt,PymntDscnt} = selectedVariant;
        return {
            column: [
                { flex: 1 },
                {
                    row: [
                        { flex: 1 },
                        { show:!!B1Dscnt || !!CmpgnDscnt || !!PymntDscnt,html: ()=><del>{SplitNumber(selectedVariant.Price * count)}</del>, className: "theme-light-font-color" },
                        { size: 1 },
                        {
                            html: "%" + B1Dscnt,show:!!B1Dscnt,
                            style: { background: "#FDB913", color: "#fff", borderRadius: 8, padding: "0 3px" },
                        },
                        { size: 1 },
                        {
                            html: "%" + CmpgnDscnt,show:!!CmpgnDscnt,
                            style: { background: "#FDB913", color: "#fff", borderRadius: 8, padding: "0 3px" },
                        },
                        { size: 1 },
                        {
                            html: "%" + PymntDscnt,show:!!PymntDscnt,
                            style: { background: "#ff4335", color: "#fff", borderRadius: 8, padding: "0 3px" },
                        }
                    ],
                },
                {
                    row: [
                        { flex: 1 },
                        { html: SplitNumber(selectedVariant.FinalPrice * count), className: "theme-dark-font-color bold" },
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
        let {getCartItem} = this.context;
        let { variantId,product } = this.props;
        let count = false;
        if(variantId){
            count = getCartItem(product.cartId,variantId) || {}
        }
        this.setState({variantId,count})
    }
    changeVariant(variantId){
        let {getCartItem} = this.context;
        let {product} = this.props;
        let cartItem = getCartItem(product.cardId,variantId)
        let count;
        if( cartItem !== false){count = cartItem.count}
        else{
            let {product} = this.props;
            let {optionValues} = product;
            let variant = this.getVariant(variantId);
            let {totalQty} = variant;
            let qtyInPack = optionValues.map(({name,id,step},i)=>{
                return {optionValueId:id,optionValueName:name,count:i === 0?totalQty:0,step}
            })
            count = {packQty:0,qtyInPack}
        }
        this.setState({count,variantId})
    }
    getVariant(variantId = this.state.variantId){
        if(!variantId){return false}
        let {product} = this.props;
        let {variants} = product;
        return variants.find(({id})=>variantId === id);
    }
    changeCount(count) {
        this.setState({count})
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
                {show:!!variant,html:()=>`قیمت واحد محصول : ${SplitNumber(variant.unitPrice)} ریال`,className:'theme-medium-font-color fs-12'},
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
        let {variantId,count} = this.state;
        if(!variantId || !count){return false}
        let {packQty} = count;
        
        return {
            align:'v',
            style:{borderRadius:6,background:'#DCE1FF',padding:'0 12px'},
            column:[
                {size:12},
                {align:'v',html:`تعداد بسته را مشخص کنید :`,className:'theme-dark-font-color fs-14 bold'},
                {size:12},
                {
                    row:[
                        {
                            size:40,html:<Icon path={mdiPlus} size={1}/>,align:'vh',onClick:()=>this.changePackQty(1),
                            style:{background:'#3B55A5',height:40,color:'#fff',borderRadius:6}
                        },
                        {size:6},
                        {
                            size:48,html:packQty,align:'vh'  
                        },
                        {size:6},
                        {
                            size:40,html:<Icon path={mdiMinus} size={1}/>,align:'vh',onClick:()=>this.changePackQty(-1),
                            style:{background:'#3B55A5',height:40,color:'#fff',borderRadius:6}
                        }
                    ]
                },
                {size:12}
            ]
        }
    }
    changePackQty(v){
        let {count} = this.state;
        let {packQty} = count;
        packQty += v;
        if(packQty < 0){packQty = 0}
        count.packQty = packQty;
        this.changeCount(count)
    }
    getSelectedCount(){
        let {count} = this.state;
        let {qtyInPack} = count;
        let selectedCount = 0;
        for(let i = 0; i < qtyInPack.length; i++){
            selectedCount += qtyInPack[i].count || 0;
        }
        return selectedCount;
    }
    isFull(){
        let v = this.getVariant();
        if(!v){return false}
        let {count} = this.state;
        if(!count){return false}
        let {packQty} = count;
        let {totalQty} = v;
        totalQty *= packQty;
        let selectedCount = this.getSelectedCount();
        return selectedCount === totalQty;
        
    }
    qtyInPacks_layout(){
        let {variantId,count} = this.state;
        if(!variantId || !count){return false}
        let {qtyInPack,packQty} = count;
        if(!packQty){return false}
        let v = this.getVariant();
        let {totalQty} = v;
        totalQty *= packQty;
        let selectedCount = this.getSelectedCount();
        let isFull = this.isFull();
        return {
            column:[
                {
                    html:`3: رنگ کالاها در ${packQty + ' ' + v.name} را انتخاب کنید`,
                    align:'v',className:'theme-dark-font-color fs-14 bold',
                },
                {size:12},
                {
                    gap:6,column:qtyInPack.map((o,i)=>{
                        let used = 0;
                        for(let j = 0; j < qtyInPack.length; j++){
                            used += qtyInPack[j].count;
                        }
                        let remaining = totalQty - used;
                        return {
                            size:72,
                            html:(
                                <ForoosheVijeSlider 
                                    key={variantId} {...o} totalQty={totalQty} max={o.count + remaining} 
                                    onChange={(value)=>{
                                        o.count = value;
                                        this.changeCount(count)
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
                        {html:`${SplitNumber(finalPrice)} ریال`,className:'theme-dark-font-color fs-12 bold',align:'v'}
                    ]
                }
            ]
        }
    }
    showCart_layout(){
        let { openPopup } = this.context;
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
        let { variantId,count } = this.state;
        if(!variantId || !count){return false}
        let variant = this.getVariant(variantId);
        //یا یک را اضافه می کنم چون اگه تعداد صفر بود قیمت واحد رو نشون بده
        let {packQty} = count;
        packQty = packQty || 1; 
        let {finalPrice} = variant;
        return {
            column: [
                { flex: 1 },
                {
                    row: [
                        { flex: 1 },
                        { html: SplitNumber(finalPrice * packQty), className: "theme-dark-font-color bold" },
                        { size: 6 },
                        { html: "ریال", className: "theme-dark-font-color bold" },
                    ],
                },
                { flex: 1 },
            ],
        };
    }
    async updateCart(){
        let {count} = this.state;
        let {packQty} = count;
        let {product} = this.props;
        let {variantId} = this.state;
        let {changeCart} = this.context;
        changeCart({product,variantId,count:!packQty?0:count})
    }
    cart_layout() {
        let {variantId} = this.state;
        if(!variantId){return false}
        let {getCartItem} = this.context;
        let {product} = this.props;
        let cartItem = getCartItem(product.cartId,variantId)
        let isFull = this.isFull()
        return {
            column:[
                {
                    flex:1,show:cartItem === false,html: (<button disabled={!isFull} onClick={() => this.updateCart()} className={"button-2"}>افزودن به سبد خرید</button>),
                    align: "v",
                },
                {
                    flex:1,show:cartItem !== false,html: (<button disabled={!isFull} onClick={() => this.updateCart()} className={"button-2"}>ویرایش سبد خرید</button>),
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
        let count = false;
        let cartItem = this.getCartItem()
        if(cartItem){count = cartItem.count}
        else {count = this.getQtyInPacks()}
        this.setState({count})
    }
    getCartItem(){
        let { product } = this.props;
        let {getCartItem} = this.context;
        return getCartItem(product.cartId,product.code)
    }
    getQtyInPacks(){
        let {product} = this.props;
        let {variants} = product;
        let qtyInPacks = {};
        let packQty = 0
        for(let i = 0; i < variants.length; i++){
            let variant = variants[i];
            qtyInPacks[variant.id] = variant.variants.map((o,j)=>{   
                return {optionValueId:o.Code,unitPrice:variant.unitPrice,optionValueName:o.Name,count:j === 0?variant.qty:0,step:o.Step}
            })
        }
        return {packQty,qtyInPacks};
    }
    changeCount(count) {
        this.setState({count});
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
    changePackQty(v){
        let {belex} = this.context;
        let {maxCount = 40} = belex;
        let {count} = this.state;
        let {packQty,qtyInPacks} = count;
        let {product} = this.props;
        packQty = packQty || 0;
        packQty += v;
        if(packQty < 0){packQty = 0}
        if(packQty > maxCount){packQty = maxCount}
        count.packQty = packQty;
        for(let i = 0; i < product.variants.length; i++){
            let variant = product.variants[i];
            let qtyInPack = qtyInPacks[variant.id];
            let used = 0;
            for(let j = 0; j < qtyInPack.length; j++){
                used += qtyInPack[j].count;
            }
            let remaining = (variant.qty * (count.packQty || 0)) - used;
            if(remaining){
                qtyInPack[0].count += remaining; 
            } 
        }
        this.changeCount(count)
    }
    packQty_layout(){
        let {count} = this.state;
        if(!count){return false}
        let {belex} = this.context;
        let {maxCount = 40} = belex;
        let {packQty} = count;
        return {
            align:'v',
            style:{borderRadius:6,background:'#DCE1FF',padding:'0 12px'},
            column:[
                {size:12},
                {align:'v',html:`تعداد بسته را مشخص کنید :`,className:'theme-dark-font-color fs-14 bold'},
                {size:12},
                {
                    row:[
                        {
                            size:40,html:<Icon path={mdiPlus} size={1}/>,align:'vh',onClick:()=>this.changePackQty(1),
                            style:{background:'#3B55A5',height:40,color:'#fff',borderRadius:6,opacity:packQty >= maxCount?0.4:1}
                        },
                        {size:6},
                        {
                            size:48,html:packQty,align:'vh'  
                        },
                        {size:6},
                        {
                            size:40,html:<Icon path={mdiMinus} size={1}/>,align:'vh',onClick:()=>this.changePackQty(-1),
                            style:{background:'#3B55A5',height:40,color:'#fff',borderRadius:6}
                        }
                    ]
                },
                {size:12}
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
        let {count} = this.state;
        let {qtyInPacks} = count;
        let qtyInPack = qtyInPacks[id];
        let selectedCount = 0;
        for(let i = 0; i < qtyInPack.length; i++){
            selectedCount += qtyInPack[i].count || 0;
        }
        return selectedCount;
    }
    isFull(id){
        let {product} = this.props;
        let {count} = this.state;
        if(!count){return false}
        let variant = product.variants.find((o)=>o.id === id);
        let selectedCount = this.getSelectedCount(id);
        return selectedCount === variant.qty;
        
    }
    qtyInPacks_layout(){
        let {count} = this.state;
        if(!count){return false}
        let {qtyInPacks,packQty} = count;
        if(!packQty){return false}
        let {product} = this.props;
        return {
            column:product.variants.map((variant)=>{
                let {qty,name,id} = variant;
                qty *= packQty;
                let qtyInPack = qtyInPacks[id]
                let selectedCount = this.getSelectedCount(id);
                let isFull = this.isFull(id);
                return {
                    column:[
                        {
                            html:`رنگ کالاها در ${packQty + ' بسته ' + name} را انتخاب کنید`,
                            align:'v',
                            className:'theme-dark-font-color fs-14 bold'
                        },
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
                                                this.changeCount(count)
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
        let { openPopup } = this.context;
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
        let { count } = this.state;
        if(!count){return false}
        //یا یک را اضافه می کنم چون اگه تعداد صفر بود قیمت واحد رو نشون بده
        let {packQty} = count;
        packQty = packQty || 1; 
        let {product} = this.props;
        return {
            column: [
                { flex: 1 },
                {
                    row: [
                        { flex: 1 },
                        { html: SplitNumber(product.price * packQty), className: "theme-dark-font-color bold" },
                        { size: 6 },
                        { html: "ریال", className: "theme-dark-font-color bold" },
                    ],
                },
                { flex: 1 },
            ],
        };
    }
    async updateCart(remove){
        let {count} = this.state;
        let {packQty} = count;
        let {product} = this.props;
        let {changeCart} = this.context;
        changeCart({product,variantId:product.code,count:packQty === 0 || remove?0:count})
    }
    cart_layout() {
        let {product} = this.props;
        let {count} = this.state;
        if(!count){return false}
        let cartItem = this.getCartItem();
        return {
            column:[
                {
                    flex:1,show:!!cartItem,html: (
                        <button 
                            className={"button-2"}
                            style={{color:'#d0000a',background:'none',fontWeight:'bold',padding:0}}
                        >موجود در سبد خرید</button>
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
                                            showValue={true}
                                            fillStyle={(index)=>{
                                                if(index === 0){return {height:4,background:'#2BBA8F'}}
                                            }}
                                            valueStyle={{
                                                background:'#2BBA8F',height:14,top:-24,
                                                display:'flex',alignItems:'center',fontSize:12
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
                                // {
                                //     html:<div style={{background:'#2BBA8F',padding:'0 3px',color:'#fff',width:36,borderRadius:6}}>{count}</div>,align:'vh'
                                // }
                            ]
                        }
                    ]
                }}
            />
        )
    }
}