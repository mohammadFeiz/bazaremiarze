import React,{ useContext, useEffect, useState } from 'react';
import RVD from '../../npm/react-virtual-dom/react-virtual-dom.js';
import AIOInput from '../../npm/aio-input/aio-input.js';
import AIODate from 'aio-date';
import {SplitNumber} from 'aio-utils';
import appContext from '../../app-context.js';
import lampsrc from './../../images/lamp.png';
import bgvsrc from './../../images/bgv.png';
import { I_app_state } from '../../types.js';
import {Icon} from '@mdi/react';
import { mdiAlert, mdiAlertOutline, mdiInformation } from '@mdi/js';
import './bg.css'

type I_bazargah_order = {
    status:I_bg_status,
    submitDate:number,
    deliverDate?:number,
    code:string,
    price:number,
    items:I_bazargah_order_item[],
    isInVitrin:boolean,
    distanceKM:number,
    preCode?:number,
    info:{name:string,lat:number,lng:number,address:string,city:string,province:string,postal:number,phone:string}
}
type I_bg_status = 'canTake'|'takenByOther'|'shouldSend' | 'sending' | 'sent'
type I_bazargah_order_item = {
    count:number,
    price:number,
    image:string,
    name:string,
    details:{key:string,value:string}[]
}
type I_tab = 'اطراف من' | 'سفارشات من';
export default function Bazargah(){
    let [tab,setTab] = useState<I_tab>('اطراف من')
    let tabs:I_tab[] = ['اطراف من','سفارشات من'];
    let [order] = useState<I_bazargah_order>({
        status:'sending',
        submitDate:new Date().getTime() - (9 * 60 * 60 * 1000) - (22 * 60 * 1000),
        code:'R534534534',
        price:1230000,
        isInVitrin:true,
        distanceKM:4.6,
        preCode:378,
        info:{
            name:'محمد شریف فیض',lat:35.70080152485188,lng:51.40090942382813,province:'تهران',postal:1992233212,phone:'09123534314',
            address:'تهران شیخ بهایی شمالی نوربخش پلاک 30 واحد 4 طبقه دوم',city:'تهران'
        },
        items:[
            {
                count:3,
                price:54000,
                image:lampsrc as string,
                name:'لامپ حبابی 7 وات',
                details:[{key:'رنگ نور',value:'مهتابی'},{key:'سرپیچ',value:'E27'}]
            },
            {
                count:3,
                price:54000,
                image:lampsrc as string,
                name:'لامپ حبابی 7 وات لامپ حبابی 7 وات لامپ حبابی 7 وات لامپ حبابی 7 وات',
                details:[{key:'رنگ نور',value:'مهتابی'},{key:'سرپیچ',value:'E27'}]
            },
            {
                count:3,
                price:54000,
                image:lampsrc as string,
                name:'لامپ حبابی 7 وات',
                details:[{key:'رنگ نور',value:'مهتابی'},{key:'سرپیچ',value:'E27'}]
            },
            {
                count:3,
                price:54000,
                image:lampsrc as string,
                name:'لامپ حبابی 7 وات',
                details:[{key:'رنگ نور',value:'مهتابی'},{key:'سرپیچ',value:'E27'}]
            },
            {
                count:3,
                price:54000,
                image:lampsrc as string,
                name:'لامپ حبابی 7 وات',
                details:[{key:'رنگ نور',value:'مهتابی'},{key:'سرپیچ',value:'E27'}]
            }
        ]
    })
    function tabs_layout(){
        return {
            className:'of-visible m-b-6',
            html:(
                <AIOInput value={tab} className='bazargah-tabs theme-box-shadow' type='tabs' options={tabs} optionText='option' optionValue='option' onChange={(tab:I_tab)=>setTab(tab)}/>
            )
        }
    }
    function orderCard_layout(){
        return {
            html:<BazargahOrderCard order={order}/>
        }
    }
    function orderPage_layout(){
        return {html:<BazargahOrderPage order={order}/>}
    }
    function deliveryPopup_layout(){
        return {html:<DeliveryPopup onSubmit={()=>{}} onCansel={()=>{}}/>}
    }
    return (
        <RVD
            layout={{
                className:'page-bg',style:{width:'100%',height:'100%'},
                column:[
                    tabs_layout(),
                    {
                        flex:1,className:'bg-body ofy-auto p-t-0',
                        column:[
                            orderCard_layout(),
                            {size:12},
                            orderPage_layout(),
                            {size:12},
                            deliveryPopup_layout()
                        ]
                    }
                ]
            }}
        />
    )
} 
type I_BazargahOrderCard = {
    order:I_bazargah_order
}

export function BazargahOrderCard(props:I_BazargahOrderCard){
    let {backOffice}:I_app_state = useContext(appContext);
    let {order} = props;
    let {status,deliverDate,price,items,isInVitrin,code} = order;
    function status_layout(){
        let text,color;
        if(status === 'canTake'){text = 'سفارش جدید! جزئیات را بررسی کنید';color = '#0F7B6C';}
        else if(status === 'takenByOther'){text = 'سفارش توسط فروشنده دیگری اخذ شده است.';color = '#E03E3E';}
        else if(status === 'shouldSend'){text = 'سفارش را برای خریدار ارسال کنید';color = '#3B55A5';}
        else if(status === 'sending'){text = 'سفارش در مسیر تحویل است';color = '#0F7B6C';}
        else if(status === 'sent'){
            if(!deliverDate){alert(`bazargah error : order status is sent but deliverDate is not an number`); return false}
            text = AIODate().getDateByPattern({date:deliverDate,jalali:true,pattern:'تحویل شده توسط شما در تاریخ {year}/{month}/{day} ساعت {hour}:{minute}'});
            color = '#0F7B6C';
        }
        else{alert(`bazargah error : order status is not any of "canTake" | "takenByOther" | "shouldSend" | "sending" | "sent"`);return false}
        return {
            column:[
                {align:'v',className:'p-h-6 p-v-3 fs-12 bold br-4',style:{color,background:`${color}27`},html:text},
                {row:[{html:<BazargahSubmitDate order={order}/>},{flex:1},{html:code,align:'v',className:'fs-14 theme-dark-font-color'}],className:'p-h-6',align:'v',size:36}
            ]
        }
    }
    function price_layout(){
        return {align:'v',gap:3,row:[{html:SplitNumber(price),className:'fs-14 bold',style:{color:'#3B55A5'}},{html:'تومان',className:'fs-10 theme-light-font-color'}]}
    }
    function count_layout(){
        return {html:`${items.length} کالا`,className:'fs-14 bold theme-medium-font-color'}
    }
    function items_layout(){
        let images = items.map((o:I_bazargah_order_item)=>o.image)
        if(images.length < 5){images = [...images,'','','','','']}
        images = images.slice(0,5);
        return {
            align:'vh',gap:6,className:'m-b-12',
            row:images.map((image)=>{
                return {
                    html:<img src={image} alt='' width='100%'/>,flex:1,style:{maxWidth:80},align:'vh'
                }
            })
        }
    }
    function expireDate_layout(){
        if(status !== 'canTake'){return false}
        let total = backOffice.bazargah.forsate_akhze_sefareshe_bazargah;
        return {html:<BazargahExpiredDate order={order} total={total}/>,className:'m-b-12'}
    }
    function footer_layout(){
        return {row:[{html:(<button className='bg-button-1'>مشاهده جزییات</button>)}]}
    }
    let showVitrinText = !isInVitrin || status !== 'canTake';
    return (
        <RVD
            layout={{
                className:'bg-order-card',
                column:[
                    status_layout(),
                    {row:[price_layout(),{flex:1},count_layout()],align:'v',size:36},
                    items_layout(),
                    showVitrinText?{html:<BGVitrinText/>}:false,
                    expireDate_layout(),
                    footer_layout(),
                ]
            }}
        />
    )
}

type I_BazargahItemCard = {
    item:I_bazargah_order_item
}
function BazargahItemCard(props:I_BazargahItemCard){
    let {item} = props;
    let {name,details,price,image,count} = item;
    function name_layout(){return {html:name,className:'fs-14 bold m-b-12',style:{color:'#00164E',textAlign:'right'}}}
    function details_layout(){return {gap:3,column:[...details,{key:'قیمت واحد',value:`${price} تومان`}].map((o:{key:string,value:string})=>detail_layout(o))}}
    function detail_layout(p:{key:string,value:string}){
        return {
            align:'v',className:'fs-10 theme-dark-font-color',gap:3,
            row:[bullet_layout(),{html:p.key},{html:p.value}]
        }
    }
    function bullet_layout(){
        return {align:'vh',html:<div className='w-6 h-6 br-100' style={{background:'#ddd'}}></div>,size:16}
    }
    function image_layout(){return {size:72,html:<img src={image} alt='' width='100%'/>,align:'vh'}}
    function count_layout(){
        return {
            gap:3,align:'v',size:36,
            row:[
                {html:<div className='align-vh br-100 fs-12 bold' style={{minWidth:20,color:'#405AAA',background:'#405AAA27'}}>{count}</div>},
                {html:'عدد',className:'fs-10 theme-light-font-color'}
            ]
        }
    }
    function total_layout(){
        return {
            gap:3,align:'v',
            row:[
                {html:<div className='fs-16 bold' style={{color:'#3B55A5'}}>{SplitNumber(price * count)}</div>},
                {html:'تومان',className:'fs-12 theme-light-font-color'}
            ]
        }
    }
    return (
        <RVD
            layout={{
                className:'bg-item-card',
                column:[
                    {
                        row:[
                            {flex:1,column:[name_layout(),details_layout()]},
                            image_layout()
                        ]
                    },
                    count_layout(),total_layout()
                ]
            }}
        />
    )
}

type I_BazargahOrderPage = {
    order:I_bazargah_order
}
function BazargahOrderPage(props:I_BazargahOrderPage){
    let {order} = props;
    let {isInVitrin,status,items,distanceKM,price} = order;
    function changeStatus(from:I_bg_status,to:I_bg_status){}
    function sendDetails_layout(){
        if(status !== 'sending' && status !== 'sent'){return false}
        return {
            column:[
                {html:<BGLabel text='اطلاعات ارسال سفارش'/>,className:'p-h-12'}
            ]
        }
    }
    function label_layout(text:string,subtext?:string){
        return {
            align:'v',gap:6,className:'p-h-12',size:48,style:{borderBottom:'1px solid #eee'},
            row:[
                {html:<div style={{width:4,height:16,background:'#3B55A5'}}></div>},
                {html:text,className:'fs-14 bold'},
                {show:!!subtext,html:()=>`( ${subtext} )`,className:'fs-12'}
            ]
        }
    }
    function items_layout(){
        return {
            column:[
                {html:<BGLabel text='کالا های سفارش' subtext={`${items.length} کالا`}/>,className:'p-h-12'},
                {column:items.map((item:I_bazargah_order_item)=>{return {html:<BazargahItemCard item={item}/>}})}
            ]
        }
    }
    function detailCards_layout(){
        return {
            gap:12,align:'vh',className:'p-12',
            row:[
                detailCard_layout('دریافتی شما',SplitNumber(price),'تومان'),
                detailCard_layout('کالا ها',items.length,'عدد'),
                detailCard_layout('تا محل تحویل',distanceKM,'کیلومتر'),
            ]
        }
    }
    function detailCard_layout(title:string,value:any,unit:string){
        return {
            gap:6,className:'theme-box-shadow br-12',style:{background:'#fff',width:84,height:84},align:'vh',
            column:[
                {html:title,className:'fs-10 bold theme-medium-font-color'},
                {html:value,className:'fs-16 bold theme-link-font-color'},
                {html:unit,className:'fs-10 theme-light-font-color'},

            ]
        }
    }
    function button_layout(){return {className:'p-12',html:(<button onClick={()=>changeStatus('canTake','shouldSend')} className='button-2'>قبول سفارش</button>)}}
    function hint_layout(){
        return {
            column:[
                label_layout('نکات قابل قبول سفارش'),
                {
                    className:'theme-medium-font-color fs-12 t-a-right p-12',
                    html:'لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد. کتابهای زیادی در شصت و سه درصد گذشته، حال و آینده شناخت فراوان جامعه و متخصصان را می طلبد تا با نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان خلاقی و فرهنگ پیشرو در زبان فارسی ایجاد کرد. در این صورت می توان امید داشت که تمام و دشواری موجود در ارائه راهکارها و شرایط سخت تایپ به پایان رسد وزمان مورد نیاز شامل حروفچینی دستاوردهای اصلی و جوابگوی سوالات پیوسته اهل دنیای موجود طراحی اساسا مورد استفاده قرار گیرد.'
                }
            ]
        }
    }
    let isMine = ['shouldSend','sending','sent'].indexOf(status) !== -1;
    let showVitrin = isInVitrin && status === 'canTake';
    return (
        <RVD
            layout={{
                className:'bg-order-page',
                column:[
                    showVitrin?{html:<BGVitrinText/>}:false,
                    !isMine?{html:<BGPage_PublicStatus order={order}/>}:false,
                    isMine?{html:<BGPage_PrivateStatus order={order} changeStatus={changeStatus}/>}:false,
                    sendDetails_layout(),
                    isMine?{html:<BGPage_Location order={order}/>}:false,
                    isMine && status !== 'shouldSend'?{html:<BGPage_SendInfo order={order}/>}:false,
                    items_layout(),
                    {
                        show:status === 'canTake',
                        style:{background:'#eee'},
                        column:[
                            detailCards_layout(),
                            button_layout(),
                            hint_layout()
                        ]
                    }
                    
                ]
            }}
        />
    )
}
type I_BGPage_PublicStatus = {order:I_bazargah_order}
function BGPage_PublicStatus(props:I_BGPage_PublicStatus){
    let {backOffice}:I_app_state = useContext(appContext);
    let {order} = props,{status,code} = order;
    let text = {canTake:'سفارش جدید! جزئیات را بررسی کنید',takenByOther:'سفارش توسط فروشنده دیگری اخذ شده است.'}
    let color = {canTake:'#0F7B6C',takenByOther:'#E03E3E'}
    let total = backOffice.bazargah.forsate_akhze_sefareshe_bazargah;
    function box_layout(){
        let className = 'p-12 fs-12 bold br-12 m-12',style = {color,background:`${color}27`};
        return {align:'v',className,style,column:[text_layout(),expiredDate_layout()]}
    }
    function text_layout(){return {html:text}}
    function expiredDate_layout(){return {show:status === 'canTake',html:()=><BazargahExpiredDate order={order} total={total}/>}}
    function footer_layout(){return {row:[{html:submitDate_layout()},{flex:1},code_layout()]}}
    function submitDate_layout(){return <BazargahSubmitDate order={order}/>}
    function code_layout(){return {html:code,align:'v',className:'fs-14 theme-dark-font-color'}}
    return <RVD layout={{column:[box_layout(),footer_layout()]}}/>
}
type I_BGPage_PrivateStatus = {order:I_bazargah_order,changeStatus:(from:I_bg_status,to:I_bg_status)=>void}
function BGPage_PrivateStatus(props:I_BGPage_PrivateStatus){
    let {backOffice,actionClass,rsa}:I_app_state = useContext(appContext);
    let total = backOffice.bazargah.forsate_ersale_sefareshe_bazargah;    
    let {order,changeStatus} = props,{code,price,status} = order;
    let index = {'shouldSend':0,'sending':1,'sent':2}[status]
    let text = {'shouldSend':'سفارش را برای خریدار ارسال کنید','sending':'مرسوله در مسیر تحویل است','sent':'مرسوله به مشتری تحویل شد'}[status];
    function details_layout(){
        let rows = [
            {key:'شماره سفارش',value:code},
            {key:'زمان ثبت سفارش',value:<BazargahSubmitDate order={order}/>},
            {key:'مبلغ دریافتی',value:`${SplitNumber(price)} تومان`,bold:true}
        ]
        return {
            className:'p-12',gap:3,
            column:rows.map((p:{key:string,value:React.ReactNode,bold?:boolean})=>{
                let {key,value,bold} = p
                return {
                    size:24,align:'v',
                    row:[
                        {html:key,className:'fs-12 theme-medium-font-color'},
                        {flex:1},
                        {html:value,className:`fs-12 bold theme-${bold?'link':'medium'}-font-color`}
                    ]
                }
            })
        }
    }
    function card_layout(){
        let column:any[] = [slider_layout(),text_layout()]
        if(['shouldSend','sending'].indexOf(status) !== -1){
            column.push({html:<BazargahExpiredDate order={order} total={total}/>})
        }
        if(['shouldSend'].indexOf(status) !== -1){
            column.push({html:<BGDeliveryType onSubmit={()=>changeStatus('shouldSend','sending')}/>})
        }
        if(['sending'].indexOf(status) !== -1){
            column.push({
                html:(
                    <BGPassCode 
                        order={order} 
                        onSubmit={()=>{
                            actionClass.openPopup('bazargah-sent',{
                                render:()=><DeliveryPopup onSubmit={()=>changeStatus('sending','sent')} onCansel={()=>rsa.removeModal()}/>
                            })
                        }}
                    />
                )
            })
        }
        return {className:'theme-card-bg theme-box-shadow theme-border-radius p-12 m-12',gap:8,column}
    }
    function slider_layout(){return {html:<BazargahSlider index={index}/>,className:'p-6'}}
    function text_layout(){return {html:text,className:'fs-14 bold'}}
    return (<RVD layout={{column:[details_layout(),card_layout()]}}/>)
}
type I_BGDeliveryType = {onSubmit:()=>void}
type I_deliveryType = 'post' | 'carier'

function BGDeliveryType(props:I_BGDeliveryType){
    let [deliveryType,setDeliveryType] = useState<I_deliveryType>();
    let [trakingCode,setTrakingCode] = useState<string>('')
    let {onSubmit} = props;
    let options:I_deliveryType[] = ['post','carier']
    let trans = {'post':'پست','carier':'پیک شخصی / سرویس های دیگر'}
    function label_layout(text:string){return {html:text,className:'fs-14 bold'}}
    return (
        <RVD
            layout={{
                gap:6,
                column:[
                    {size:6},
                    label_layout('نحوه ارسال'),
                    {
                        html:(
                            <AIOInput 
                                className='fs-12 p-0' type='radio'
                                optionCheckIcon={{color:'#3B55A5',background:'#3B55A5',padding:2}} optionStyle={{width:'100%',borderBottom:'1px solid #eee'}}
                                options={options} optionText={(option)=>trans[option]} optionValue='option' value={deliveryType}
                                onChange={(deliveryType:I_deliveryType)=>setDeliveryType(deliveryType)}
                            />
                        )
                    },
                    {size:6},
                    label_layout('شماره پیگیری مرسوله را وارد کنید'),
                    {
                        html:(
                            <AIOInput 
                                style={{border:'1px solid #ddd'}} className='m-v-12 fs-12 h-36'
                                type='text' value={trakingCode} onChange={(trakingCode:string)=>setTrakingCode(trakingCode)} placeholder='شماره پیگیری'
                            />
                        )
                    },
                    {html:(<button disabled={!deliveryType || !trakingCode} className='button-2' onClick={()=>onSubmit()}>ارسال</button>)}
                ]
            }}
        />
    )
}
type I_BGPassCode = {order:I_bazargah_order,onSubmit:()=>void}
function BGPassCode(props:I_BGPassCode){
    let {apis}:I_app_state = useContext(appContext);
    let [passCodes,setPassCodes] = useState<any[]>([false,false,false])
    let [submitedCode,setSubmitedCode] = useState<boolean>(false);
    let {order,onSubmit} = props,{preCode} = order;
    if(!preCode){alert('bazargah error : order status is sending but missing preCode property on order object')}
    function submitCode(){
        let parameter:number = +`${preCode}${passCodes[0]}${passCodes[1]}${passCodes[2]}`
        apis.request({
            api:'bazargah.bg_submit_code',loading:true,parameter,message:{success:true},
            description:'تایید کد تحویل بازارگاه',onSuccess:()=>setSubmitedCode(true)
        })
    }
    function submitDelivered(){
        apis.request({
            api:'bazargah.bg_submit_delivered',loading:true,description:'اعلام تحویل سفارش بازارگاه',
            onSuccess:()=>onSubmit(),message:{success:true}
        })
    }
    function getOptions(){return new Array(11).fill(0).map((o,i:number)=>{return {text:i === 0?'':i - 1,value:i === 0?false:i - 1}})}
    function change(v,index){setPassCodes(passCodes.map((passCode:number,i:number)=>i === index?v:passCode))}
    function preCode_layout(index:number){return {html:preCode.toString()[index],align:'vh',className:'theme-link-font-color bazargah-pre-code',size:24}}
    function input_layout(index:number){
        let p = {type:'list',width:36,size:36,count:1,className:'bazargah-pass-code',value:passCodes[index]}
        return {html:<AIOInput {...p} options={getOptions()} onChange={(v:number)=>change(v,index)}/>}
    }
    function arrow_layout(dir:'up'|'down'){return {html:<div className={`bazargah-pass-code-arrow-${dir}`}></div>,align:'vh'}}
    function passCode_layout(index:number){return {column:[arrow_layout('up'),input_layout(index),arrow_layout('down')]}}
    return (
        <RVD
            layout={{
                style:{borderTop:'1px solid #ddd',paddingTop:12},
                column:[
                    {html:<BGLabel text='کد تحویل'/>,className:'p-h-8'},
                    {
                        align:'v',gap:6,
                        row:[
                            {align:'vh',html:<Icon path={mdiInformation} size={0.8}/>,style:{color:'orange'}},
                            {
                                flex:1,className:'t-a-right fs-10',
                                html:'از پیک بخواهید سه رقم آخر کد تحویل را از مشتری بگیرد و به شما اعلام کند'
                            }
                        ]
                    },
                    {size:16},
                    {
                        gap:6,align:'vh',className:'dir-ltr',
                        row:[preCode_layout(0),preCode_layout(1),preCode_layout(2),passCode_layout(0),passCode_layout(1),passCode_layout(2)]
                    },
                    {size:16},
                    {
                        html:(
                            <button 
                                disabled={passCodes[0] === false || passCodes[1] === false || passCodes[2] === false} 
                                className='button-2' onClick={()=>submitCode()}
                            >تایید کد تحویل</button>
                        )
                    },
                    {size:12},
                    {html:(<button className='button-1' disabled={!submitedCode} onClick={()=>submitDelivered()}>سفارش تحویل شد</button>)}
                ]
            }}
        />
    )
}
function BGVitrinText(){
    return (
        <RVD
            layout={{
                gap:3,align:'v',
                row:[
                    {html:<img src={bgvsrc as string} alt='' width='36'/>,align:'vh'},
                    {html:'اعلام زودتر:',className:'fs-10'},
                    {html:'مطابق با ویترین شما',className:'fs-10 bold',style:{color:'#D9730D'}}
                ]
            }}
        />
    )
}
type I_BGPage_Location = {order:I_bazargah_order}
function BGPage_Location(props:I_BGPage_Location){
    let {order} = props,{info} = order,{lat,lng,name,phone,city,province,postal,address} = info;
    function kv_layout(p:[key:string,value:string]){
        return {className:'p-12 p-b-0',column:[{html:p[0],className:'bold fs-12'},{html:p[1],className:'fs-12 theme-medium-font-color t-a-right'}]}
    }
    return (
        <RVD
            layout={{
                className:'p-b-12',style:{borderBottom:'1px solid #eee'},
                column:[
                    {html:<BGLabel text='اطلاعات محل تحویل'/>,className:'p-12'},
                    {
                        html:(
                            <AIOInput 
                                type='map' value={{lat,lng}} mapConfig={{showAddress:false}} className='w-100 h-96'
                            />
                        )
                    },
                    kv_layout(['نام و نام خانوادگی تحویل گیرنده',name]),
                    kv_layout(['شماره تلفن تحویل گیرنده',phone]),
                    kv_layout(['استان و شهر',`${city},${province}`]),
                    kv_layout(['آدرس',address]),
                    kv_layout(['کد پستی',postal.toString()])
                    
                ]
            }}
        />
    )
}
type I_BGPage_SendInfo = {order:I_bazargah_order}
function BGPage_SendInfo(props:I_BGPage_SendInfo){
    let {order} = props,{info} = order,{lat,lng,name,phone,city,province,postal,address} = info;
    function kv_layout(p:[key:string,value:string]){
        return {className:'p-12 p-b-0',column:[{html:p[0],className:'bold fs-12'},{html:p[1],className:'fs-12 theme-medium-font-color t-a-right'}]}
    }
    return (
        <RVD
            layout={{
                className:'p-b-12',style:{borderBottom:'1px solid #eee'},
                column:[
                    {html:<BGLabel text='اطلاعات محل تحویل'/>,className:'p-12'},
                    {
                        html:(
                            <AIOInput 
                                type='map' value={{lat,lng}} mapConfig={{showAddress:false}} className='w-100 h-96'
                            />
                        )
                    },
                    kv_layout(['نام و نام خانوادگی تحویل گیرنده',name]),
                    kv_layout(['شماره تلفن تحویل گیرنده',phone]),
                    kv_layout(['استان و شهر',`${city},${province}`]),
                    kv_layout(['آدرس',address]),
                    kv_layout(['کد پستی',postal.toString()])
                    
                ]
            }}
        />
    )
}
type I_BazargahSlider = {index:number}
function BazargahSlider(props:I_BazargahSlider){
    let {index} = props;
    let color = '#2BBA8F';
    function p(index:number,i:number){
        let active = index === i;
        let style = {color,border:'1px solid',background:active?color:'#fff'};
        return {
            column:[
                {html:<div className='w-16 h-16 br-100' style={style}></div>,align:'vh'},
                {size:3},
                {html:['اخذ','ارسال','تحویل'][i],align:'vh',className:`fs-10 theme-${active?'medium':'light'}-font-color${active?' bold':''}`}
            ]
        }
    }
    function l(active:boolean){
        let style = {background:active?color:`${color}30`,height:3,width:'100%',marginBottom:17};
        return {html:<div style={style}></div>,align:'v',flex:1}
    }
    return (
        <RVD layout={{
            row:[
                p(index,0),l(index > 0),p(index,1),l(index > 1),p(index,2)
            ]
        }}/>
    )
}
type I_BazargahExpiredDate = {order:I_bazargah_order,total:number}
function BazargahExpiredDate(props:I_BazargahExpiredDate){
    function getColor(percent:number){
        if(percent < 25){return 'red'}
        else if(percent < 50){return 'orange'}
        else if(percent < 25){return 'yellow'}
        else{return '#0F7B6C'}
    }
    function getText(expiredDate:number,now:number){
        let miliseconds = expiredDate - now,text = []; 
        let {day,hour,minute} = AIODate().convertMiliseconds({miliseconds,unit:'hour'});
        if(day){text.push(`${day} روز`)} 
        if(hour){text.push(`${hour} ساعت`)} 
        if(minute){text.push(`${minute} دقیقه`)}
        return text.join(' و ')
    }
    function slider_layout(percent:number,color:string){
        let props = {
            type:'slider',direction:'left',start:0,end:100,value:percent,
            attrs:{style:{height:30,background:'none'}},
            fillStyle:{background:color,height:3},
            pointStyle:{display:'none'},
            lineStyle:{height:3,background:'#f8f8f8'}
        }
        return {html:(<AIOInput {...props}/>)}
    }
    function text_layout(expiredDate:number,color:string,now:number){
        let key_layout = {html:'زمان باقی مانده تا انقضا',align:'v',className:'fs-10 theme-dark-font-color'}
        let value_layout = {html:getText(expiredDate,now),className:'fs-12 bold',style:{color}}
        return {align:'v',size:24,row:[key_layout,{flex:1},value_layout]}
    }
    useEffect(()=>{setInterval(()=>setNow(new Date().getTime()),60000)},[])
    let {order,total} = props,{submitDate} = order;
    let [now,setNow] = useState<number>(new Date().getTime())
    let expiredDate = submitDate + (total * 60 * 1000);
    let percent = 100 - Math.round(((now - submitDate) * 100) / (expiredDate - submitDate));
    let color = getColor(percent)
    return (<RVD layout={{column:[slider_layout(percent,color),text_layout(expiredDate,color,now)]}}/>)
}
type I_BazargahSubmitDate = {order:I_bazargah_order}
function BazargahSubmitDate(props:I_BazargahSubmitDate){
    let {order} = props,{submitDate} = order,text:string;
    let delta = new Date().getTime() - submitDate;
    if(delta < 0){alert(`bazargah error : submitDate is after now!!!`); return null}
    if(delta < 24 * 60 * 60 * 1000){text = AIODate().convertMiliseconds({miliseconds:delta,unit:'hour',pattern:'{hour} ساعت و {minute} دقیقه پیش'})}
    else {text = AIODate().getDateByPattern({date:submitDate,jalali:true,pattern:'{year}/{month}/{day} {hour}:{minute}'})}
    return (<RVD layout={{html:text,align:'v',className:'fs-10 theme-medium-font-color bold'}}/>)
}

type I_BGLabel = {text:string,subtext?:string}
function BGLabel(props:I_BGLabel){
    let {text,subtext} = props;
    return (
        <RVD
            layout={{
                align:'v',gap:6,style:{height:36,flex:'none'},
                row:[
                    {html:<div style={{width:4,height:16,background:'#3B55A5'}}></div>},
                    {html:text,className:'fs-16 bold'},
                    {show:!!subtext,html:()=>`( ${subtext} )`,className:'fs-12'}
                ]
            }}
        />
    )
}
type I_DeliveryPopup = {onSubmit:()=>void,onCansel:()=>void}
function DeliveryPopup(props:I_DeliveryPopup){
    let {onSubmit,onCansel} = props;
    return (
        <RVD
            layout={{
                gap:6,className:'fs-14',
                column:[
                    {html:<Icon path={mdiAlertOutline} size={3}/>,align:'vh',style:{color:'orange'}},
                    {html:'لطفا مطمئن شوید مرسوله به دست مشتری رسیده باشد.',className:'bold',align:'vh'},
                    {html:'برای سفارش های زیر ۱ میلیون میتوانید بدون کد تحویل سفارش را تحویل دهید'},
                    {size:6},
                    {
                        html:(
                            <button onClick={()=>onSubmit()} className='button-2'>بازگشت</button>
                        )
                    },
                    {
                        html:(
                            <button onClick={()=>onCansel()} className='button-1'>مرسوله به خریدار تحویل شده است</button>
                        )
                    }
                ]
            }}
        />
    )
}