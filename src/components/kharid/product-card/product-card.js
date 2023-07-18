import React,{Component} from 'react';
import RVD from './../../../interfaces/react-virtual-dom/react-virtual-dom';
import NoSrc from './../../../images/no-src.png';
import appContext from './../../../app-context';
import CartButton from '../cart-button';
import SplitNumber from '../../../npm/aio-functions/split-number';
//props
//1 - product {name = '',variants = [{id}],price = 0,discountPrice = 0,discountPercent = 0,inStock = false,srcs = ['...']}
//3 - details = [[title = '',value = '']]
//4 - isFirst = false
//5 - isLast = false
//6 - count = 0
//7 - changeCount = undefined
//9 - type = 'horizontal' || 'vertical'
export default class ProductCard extends Component{
    static contextType = appContext;
    debuggerMode = false;
    state = {mounted:false}
    image_layout(){
        let {product} = this.props;
        let {srcs = []} = product;
        return {flex:1,align:'vh',html:<img src={srcs[0] || NoSrc} width={'100%'} alt=''/>}
    }
    changeCount(count){
        let {changeCart} = this.context;
        let {variantId,product} = this.props;
        changeCart({variantId,product,count})
    }
    count_layout(){
        let {product,renderIn,variantId} = this.props;
        return {size:36,html:()=><CartButton renderIn={renderIn} product={product} variantId={variantId}/>}
    }
    title_layout(){
        let {product} = this.props;
        return {html:product.cartId,className:'fs-10',style:{color:'rgb(253, 185, 19)'}}    
    }
    name_layout(){
        let {product} = this.props;
        let {name} = product;
        return {html:name,className:'fs-12 theme-medium-font-color bold',style:{whiteSpace:'normal',textAlign:'right'}}
    }
    discount_layout(){
        let {product,count = 1,paymentMethodDiscountPercent} = this.props;
        let {inStock,Price,B1Dscnt = 0,CmpgnDscnt = 0,PymntDscnt = 0,FinalPrice} = product;

        if(!Price || !inStock){return false}
        return {
            gap:4,className:'p-h-12',
            row:[
                {flex:1},
                {show:!!B1Dscnt || !!CmpgnDscnt || !!PymntDscnt,html:<del>{SplitNumber(Price)}</del>,className:'fs-14 theme-light-font-color'},
                {
                    gap:3,
                    row:[
                        {show:!!B1Dscnt,html:<div style={{background:'#FFD335',color:'#fff',padding:'1px 3px',fontSize:12,borderRadius:6}}>{B1Dscnt + '%'}</div>},
                        {show:!!CmpgnDscnt,html:<div style={{background:'#ffa835',color:'#fff',padding:'1px 3px',fontSize:12,borderRadius:6}}>{CmpgnDscnt + '%'}</div>},
                        {show:!!paymentMethodDiscountPercent || !!PymntDscnt,html:<div style={{background:'#ff4335',color:'#fff',padding:'1px 3px',fontSize:12,borderRadius:6}}>{(paymentMethodDiscountPercent || PymntDscnt) + '%'}</div>}
                    ]
                },
            ]
        }
    }
    details_layout(){
        let {details = []} = this.props;
        if(!details.length){return false}
        let text = '';
        for(let i = 0; i < details.length; i++){
            let [title,value] = details[i];
            text += `${title}:${value} `
        }
        return {
            html:text,className:'fs-9',
            style:{
                whiteSpace:'nowrap',
                overflow:'hidden'
            }
        }
    }
    notExist_layout(){
        let {product} = this.props;
        let {inStock} = product;
        if(inStock){return false}
        return {row:[{flex:1},{html:'نا موجود',className:'colorD83B01 bold fs-12'},{size:12}]}
    }
    price_layout(){
        let {product} = this.props;
        let {FinalPrice,inStock} = product;
        if(!inStock || !FinalPrice){return false}
        return {
            row:[
                {flex:1},
                {html:SplitNumber(FinalPrice) + ' ریال',className:'fs-12 theme-dark-font-color bold p-h-12'}
            ]
        }
    }
    async onClick(){
        if(this.debuggerMode){return }
        let {kharidApis,openPopup} = this.context;
        let {product,cartId} = this.props;
        if(!product.hasFullDetail){
            product = await kharidApis({api:'getProductFullDetail',parameter:{id:product.id,code:product.defaultVariant.code,product}})
            product.hasFullDetail = true;
        }
        openPopup('product',{product,cartId})
    }
    componentDidMount(){
        let {index = 0} = this.props;
        setTimeout(()=>{
            this.setState({mounted:true})
        },index * 100 + 100)
    }
    horizontal_layout(){
        let {isLast,isFirst,loading} = this.props;
        let {mounted} = this.state;
        return (
            <RVD
                loading={loading}
                layout={{
                    className:'theme-card-bg theme-box-shadow gap-no-color rvd-rotate-card' + (mounted?' mounted':''),
                    attrs:{onClick:()=>this.onClick()},
                    // egg:{
                    //     count:3,
                    //     callback:()=>{
                    //         console.log(this.props)
                    //     }
                    // },
                    style:{
                        height:148,border:'1px solid #eee',
                        borderBottomLeftRadius:!isLast?0:undefined,
                        borderBottomRightRadius:!isLast?0:undefined,
                        borderTopLeftRadius:!isFirst?0:undefined,
                        borderTopRightRadius:!isFirst?0:undefined
                    },
                    gap:12,
                    row:[
                        {
                            size:116,
                            column:[
                                this.image_layout(),
                                this.count_layout()
                            ]
                        },
                        {
                            flex:1,
                            column:[
                                {size:6},
                                this.title_layout(),
                                this.name_layout(),
                                this.details_layout(),
                                {flex:1},
                                this.discount_layout(),
                                this.notExist_layout(),
                                {row:[{flex:1},this.price_layout()]},
                                {size:6},
                                
                            ]
                        }
                    ]
                }}
            />
        )
    }
    vertical_layout(){
        let {style,product,loading} = this.props;
        let {srcs = [],name} = product;
        return (
            <RVD
                loading={loading}
                layout={{
                    style:{...style},className:'theme-card-bg theme-box-shadow theme-border-radius of-visible w-168 h-288 fs-14 br-12',
                    attrs:{onClick:()=>this.onClick()},
                    column:[
                        {size:140,align:'vh',html:<img src={srcs[0] || NoSrc} width={'100%'} style={{width:'calc(100% - 24px)',height:'100%',borderRadius:8}} alt=''/>,style:{padding:6,paddingBottom:0}},
                        {html:name,className:'fs-12 p-v-6 p-h-12 theme-medium-font-color bold',style:{whiteSpace:'normal'}},
                        //this.name_layout(),
                        {flex:1},
                        this.discount_layout(),
                        this.price_layout(),
                        this.notExist_layout(),
                        {size:12}
                    ]
                }}
            />
        )
    }
    render(){
        let {type,product} = this.props;
        if(product.ItemCode === '5332'){
            console.log(product.B1Dscnt);
        }
        return this[type +'_layout']()
    }
}