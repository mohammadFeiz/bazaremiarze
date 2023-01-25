import React, { Component,Fragment } from 'react';
import AIOButton from './../../../interfaces/aio-button/aio-button';
import ProductCount from './../product-count/product-count';
import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
import appContext from './../../../app-context';
import Slider from './../../../npm/aio-slider/aio-slider';
import getSvg from './../../../utils/getSvg';
import { mdiChevronDown, mdiChevronLeft,mdiCheckCircle } from '@mdi/js';
import {Icon} from '@mdi/react';
import functions from './../../../functions';
export default class Product extends Component {
    static contextType = appContext;
    componentDidMount(){
        this.mounted = true;
        let { product } = this.props;
        if(product.type === 'forooshe_vije'){
            let {variants} = product;
            let variantId = variants[0].id;
            this.setState({variantId,foroosheVije_count:this.get_foroosheVije_count(variantId)})
        }
        else{
            this.getVariants()
            let firstVariant = product.inStock ? (product.variants.filter((o) => o.inStock === null ? false : !!o.inStock)[0]) : undefined;
            this.setState({
                optionValues: firstVariant ? { ...firstVariant.optionValues } : undefined, showDetails: true,
                selectedVariant: firstVariant, srcIndex: 0
            });
        }
        
    }
    get_foroosheVije_count(variantId){
        let {product} = this.props;
        let {optionValues} = product;
        let variant = this.get_foroosheVije_variant(variantId);
        let {totalQty} = variant;
        return optionValues.map(({name,id,step},i)=>{
            return {optionValueId:id,optionValueName:name,count:i === 0?totalQty:0,step}
        })
    }
    get_foroosheVije_variant(variantId = this.state.variantId){
        let {product} = this.props;
        let {variants} = product;
        return variants.find(({id})=>variantId === id);
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
            let key = keys[i];
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
        if(product.type === 'forooshe_vije'){
            let {variantId} = this.state;
            changeCart(count, variantId,product);
        }
        else{
            let { selectedVariant } = this.state;
            let variantId = selectedVariant.id;
            changeCart(count, variantId,product);
        }
        
    }
    body_layout() {
        let { product } = this.props;
        if(product.type === 'forooshe_vije'){return this.foroosheVije_layout()}
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
    foroosheVije_layout(){
        let { product } = this.props;
        let { name, details, src,code } = product;
        return {
            flex: 1,className: "ofy-auto",gap: 12,
            column: [
                this.image_layout(name, code, src),
                this.foroosheVije_options_layout(),
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
    foroosheVije_options_layout(){
        let {variantId,foroosheVije_count} = this.state;
        let {product} = this.props;
        let {getCartCountByVariantId} = this.context;
        let cartCount = getCartCountByVariantId(variantId);
        let v = this.get_foroosheVije_variant();
        let {totalQty,unitPrice} = v;
        return {
            className: 'theme-card-bg theme-box-shadow theme-border-radius m-h-12 p-12',
            column:[
                {html:'بسته خود را مشخص کنید',align:'v',className:'theme-dark-font-color fs-14 bold'},
                {html:'بسته های بزرگ تر تخقیف های ارزنده تری دارند.',align:'v',className:'theme-medium-font-color fs-12'},
                {size:12},
                this.foroosheVije_variant_layout(),
                {size:12},
                {html:`قیمت واحد محصول : ${functions.splitPrice(unitPrice)} ریال`,className:'theme-medium-font-color fs-12'},
                {html:`تعداد محصول در بسته : ${totalQty} عدد`,className:'theme-medium-font-color fs-12'},
                {size:12},
                {
                    style:{color:'#107C10'},
                    row:[
                        {html:<Icon path={mdiCheckCircle} size={0.7}/>,align:'vh'},
                        {size:6},
                        {html:'موجودی کافی',className:'fs-14 bold',align:'v'}
                    ]
                },
                {size:36,align:'v',html:<div style={{width:'100%',height:1,background:'#ddd'}}></div>},
                {html:`2: رنگ کالاها در ${product.name} را انتخاب کنید`,align:'v',className:'theme-dark-font-color fs-14 bold'},
                {html:'حال تصمیم بگیرید چه تعداد از هر رنگ کالا میخواهید. ',align:'v',className:'theme-medium-font-color fs-12'},
                {
                    gap:6,column:foroosheVije_count.map((o,i)=>{
                        let used = 0;
                        for(let j = 0; j < foroosheVije_count.length; j++){
                            used += foroosheVije_count[j].count;
                        }
                        let remaining = totalQty - used;
                        return {
                            size:48,
                            html:(
                                <ForoosheVijeSlider 
                                    key={variantId} {...o} totalQty={totalQty} max={o.count + remaining} 
                                    onChange={(value)=>{
                                        o.count = value;
                                        this.setState({foroosheVije_count})
                                    }}
                                />
                            )
                        }
                    })
                }
                
            ]
        }
    }
    foroosheVije_variant_layout(){
        let {variantId} = this.state;
        let {product} = this.props;
        let {variants} = product;
        return {
            className:'ofx-auto',
            row:variants.map(({id,name,finalPrice,discountPercent},i)=>{
                let active = id === variantId;
                let br = {borderTopLeftRadius:0,borderTopRightRadius:0,borderBottomLeftRadius:0,borderBottomRightRadius:0};
                if(i === 0){br.borderTopRightRadius = 36; br.borderBottomRightRadius = 36}
                if(i === variants.length - 1){br.borderTopLeftRadius = 36; br.borderBottomLeftRadius = 36}
                return {
                    onClick:()=>{
                        this.setState({variantId:id,foroosheVije_count:this.get_foroosheVije_count(id)});
                    },
                    size:144,style:{border:'1px solid',padding:'6px 12px',...br,background:active?'#DCE1FF':'#fff'},
                    column:[
                        {html:name,className:'theme-dark-font-color fs-14 bold'},
                        {
                            row:[
                                {html:`${functions.splitPrice(finalPrice)} ریال`,className:'theme-dark-font-color fs-12 bold',align:'v'}
                            ]
                        }
                    ]
                }
            })
        }
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
        let { optionValues, selectedVariant } = this.state;
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
        let {product} = this.props;
        if(product.type === 'forooshe_vije'){return false}
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
        let {product} = this.props;
        if(product.type === 'forooshe_vije'){return this.foroosheVije_addToCart_layout()}
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
    foroosheVije_addToCart_layout() {
        let { getCartCountByVariantId } = this.context;
        let {variantId} = this.state;
        let cartCount = getCartCountByVariantId(variantId);
        let disabled = false;
        return {
            column:[
                {
                    flex:1,show:!!!cartCount,html: (<button onClick={() => this.changeCount(1)} className={"button-2" + (disabled ? " disabled" : "")}>افزودن به سبد خرید</button>),
                    align: "v",
                },
                { flex:1,align:'v',show:!!cartCount, html: () => <ProductCount value={cartCount} onChange={(cartCount) => this.changeCount(cartCount)} max={undefined} /> },
                
            ]
        }
    }
    price_layout() {
        let {product} = this.props;
        if(product.type === 'forooshe_vije'){return this.foroosheVije_price_layout()}
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
    foroosheVije_price_layout() {
        let variant = this.get_foroosheVije_variant();
        let { getCartCountByVariantId } = this.context;
        //یا یک را اضافه می کنم چون اگه تعداد صفر بود قیمت واحد رو نشون بده
        let cartCount = getCartCountByVariantId(variant.id) || 1; 
        let {finalPrice} = variant;
        return {
            column: [
                { flex: 1 },
                {
                    row: [
                        { flex: 1 },
                        { html: functions.splitPrice(finalPrice * cartCount), className: "theme-dark-font-color bold" },
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

class ForoosheVijeSlider extends Component{
    state = {count:this.props.count}
    render(){
        let {count} = this.state;
        let {optionValueName,totalQty,onChange = ()=>{},max,step} = this.props;
        let percent = (count / totalQty * 100).toFixed(0); 
        return (
            <RVD
                layout={{
                    row:[
                        {size:72,html:optionValueName,align:'v',className:'theme-medium-font-color fs-12 bold',align:'v'},
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
                                    pointStyle={{background:'#2BBA8F',width:16,height:16}}
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
                }}
            />
        )
    }
}