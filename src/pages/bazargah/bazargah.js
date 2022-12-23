import React,{Component} from 'react';
import RVD from './../../interfaces/react-virtual-dom/react-virtual-dom';
import bazargahNoItemSrc from './../../images/bazargah-no-items.png';
import appContext from '../../app-context';
import bulbSrc from './../../images/10w-bulb.png';
import Header from '../../components/header/header';
import Tabs from '../../components/tabs/tabs';
import getSvg from '../../utils/getSvg';
import AIOButton from './../../interfaces/aio-button/aio-button';
import AIOContentSlider from './../../npm/aio-content-slider/aio-content-slider';
import Popup from '../../components/popup/popup';
import {Icon} from '@mdi/react';
import Form from './../../interfaces/aio-form-react/aio-form-react';
import {mdiCheck} from '@mdi/js';
import Slider from './../../npm/aio-slider/aio-slider';
import Map from '../../components/map/map';
import bazargahBlankSrc from './../../images/blank-bazargah.png';
//import functions from '../../../functions';
import functions from '../../functions';
import TimerGauge from '../../components/timer-gauge/timer-gauge';
import bazargahCommingSoon from './../../images/bazargah-comming-soon.png';

export default class Bazargah extends Component{
    static contextType = appContext;
    constructor(props){
        super(props);
        this.state = {
            activeTabId:0,
            notifType:0,
            notifTypes:[
                {text:'پیامک و اعلان اپ',value:0},
                {text:'سایر موارد',value:1}
            ],
            showDetails:false
        }
    }
    wait_to_get_layout(){
        let {bazargah,SetState} = this.context;
        let {activeTabId} = this.state;
        if(activeTabId !== 0 || !bazargah.active){return false}
        if(!bazargah.wait_to_get){
            return {
                size:400,html:'در حال بارگزاری',className:'size12 color605E5C',align:'vh'
            }
        }
        if(bazargah.wait_to_get.length === 0){
            return {
                size:400,html:<img src={bazargahNoItemSrc}/>,align:'vh'
            }
        }
        return {
            gap:12,flex:1,scroll:'v',
            column:bazargah.wait_to_get.map((o,i)=>{
                return {
                    style:{overflow:'visible'},
                    html:(
                        <BazargahCard key={o.orderId} {...o} 
                            onExpired={()=>{
                                bazargah.wait_to_get = bazargah.wait_to_get.filter((oo)=>o.orderId !== oo.orderId)
                                SetState({bazargah})
                            }}
                            onShowDetails={()=>{
                                this.setState({showDetails:o})
                            }}
                        />
                    )
                }
            })
        }
    }
    mock_wait_to_send_layout(){
        let {SetState} = this.context;
        let {activeTabId} = this.state;
        if(activeTabId !== 1){return false}
        let wait_to_send = [
            {
                type:'wait_to_send',
                sendStatus:{
                    itemsChecked:{},//{'0':true,'1':false}
                    delivererId:false,
                },
                "amount":123456789,
                distance:1000,
                "benefit":110000,
                "totalTime":10,
                "address": 'آدرس',
                "items":[
                    {name:'نام1',src:bulbSrc,detail:'جزییات',id:'0'},
                    {name:'نام2',src:bulbSrc,detail:'جزییات',id:'1'},
                    {name:'نام3',src:bulbSrc,detail:'جزییات',id:'2'},
                ],
                "cityId": null,
                "provinceId": null,
                "buyerId": '10',
                "receiverId": '10',
                "buyerName": 'نام',
                "receiverName": 'نام',
                "buyerNumber": 12354,
                "receiverNumber": 123546,
                "orderId": '0',
                "vendorId": '0',
                "shippingAddress": 'آدرس',
                "zipCode": '12345',
                "optionalAddress": 'آدرس',
                "city":'تهران',
                "province": 'تهران',
                "longitude": 51.338097,
                "latitude": 35.699739,
                "orderDate": new Date().getTime(),
                "id": '0',
                "createdDate": new Date().getTime() - 6000000,
                "modifiedDate": null,
                "isDeleted": false
            }
        ];
        if(!wait_to_send){return {size:96,align:'vh',html:'در حال بارگزاری'}}
        if(wait_to_send.length === 0){return {size:96,align:'vh',html:'موردی وجود ندارد'}}
        return {
            gap:12,flex:1,scroll:'v',
            column:wait_to_send.map((o,i)=>{
                return {style:{overflow:'visible'},html:<BazargahCard key={o.orderId} {...o} onSend={()=>this.setState({showDetails:o})}/>}
            })
        }
    }
    wait_to_send_layout(){
        //return this.mock_wait_to_send_layout()
        let {SetState,bazargah} = this.context;
        if(!bazargah.active){return false}
        let {activeTabId} = this.state;
        if(activeTabId !== 1){return false}
        let {wait_to_send} = bazargah;
        if(!wait_to_send){return {size:96,align:'vh',html:'در حال بارگزاری'}}
        if(wait_to_send.length === 0){return {size:96,align:'vh',html:'موردی وجود ندارد'}}
        return {
            gap:12,flex:1,scroll:'v',
            column:wait_to_send.map((o,i)=>{
                return {style:{overflow:'visible'},html:<BazargahCard {...o} onSend={()=>this.setState({showDetails:o})} onExpired={()=>{
                    bazargah.wait_to_send = bazargah.wait_to_send.filter((oo)=>o.orderId !== oo.orderId)
                    SetState({bazargah})
                }}/>}
            })
        }
    }
    notifType_layout(){
        let {activeTabId,notifTypes,notifType} = this.state;
        if(activeTabId !== 0){return false}
        return {
            size:48,className:'bgFFF box-shadow',
            row:[
                {size:36,html:getSvg(25),align:'vh'},
                {html:'نحوه اعلان سفارشات جدید',align:'v',className:'size14 color605E5C',flex:1},
                {html:(<AIOButton type='select' value={notifType} options={notifTypes} style={{background:'none'}}/>)}
            ]
        }
    }
    tabs_layout(){
        let {bazargah} = this.context;
        if(!bazargah.active){return false}
        let {activeTabId} = this.state;
        return {
            html:(
                <Tabs 
                    tabs={[{title:'اطراف من',flex:1,id:0},{title:'اخذ شده',flex:1,id:1}]}
                    activeTabId={activeTabId}
                    onChange={(activeTabId)=>this.setState({activeTabId})}
                />
            )
        }
    }
    renderInHome(){
        let {bazargah,SetState,rsa_actions} = this.context;
        if(!bazargah.active || !bazargah.wait_to_get){return false}
        let {setNavId} = rsa_actions;
        return (
            <RVD
                layout={{
                    style:{flex:'none',width:'100%'},
                    column:[
                        {
                            size:48,className:'padding-0-12',
                            row:[
                                {html: "بازارگاه",className: "size14 color323130 bold padding-0-12",size: 48,align: "v"},
                                {size:6},
                                {html:<div className='my-burux-badge bg3B55A5'>{bazargah.wait_to_get.length}</div>,align:'vh'},
                                {flex:1},
                                {html:'مشاهده همه',align:'v',className:'color3B55A5 size12 bold',show:!!bazargah.wait_to_get.length,attrs:{onClick:()=>setNavId('bazargah')}}
                            ]
                        },
                        {
                            className:'box margin-0-12 padding-0-12 size14 color605E5C',show:bazargah.wait_to_get.length === 0,
                            column:[
                                {size:12},
                                {
                                    html:<img src={bazargahBlankSrc}/>,align:'vh'
                                },
                                {
                                    size:48,align:'vh',style:{marginBottom:12},
                                    html:'سفارشی در نزدیکی شما ثبت نشده است' 
                                },
                            ]
                        },
                        {
                            show:!!bazargah.wait_to_get.length, 
                            html:(
                                <AIOContentSlider
                                    autoSlide={5000} arrow={false}
                                    items={bazargah.wait_to_get.map((o,i)=>{
                                        return (
                                            <BazargahCard 
                                                {...o} items={false} address={false} 
                                                onExpired={()=>{
                                                    bazargah.wait_to_get = bazargah.wait_to_get.filter((oo)=>o.orderId !== oo.orderId)
                                                    SetState({bazargah})
                                                }}
                                                onShowDetails={()=>{
                                                    this.setState({showDetails:o})
                                                }}
                                            />
                                        )
                                    })}
                                />
                            )
                        }
                    ]
                }}
            />
        )
    }
    bazargahPower_layout(){
        let {bazargah} = this.context;
        if(bazargah.active){return false}
        return {
            html:getSvg('bazargahPower'),
            attrs:{
                onClick:()=>bazargah.setActivity(true)
            }
        }
    }
    render(){
        let {showDetails} = this.state;
        let {bazargah} = this.context;
        if(showDetails){
            return (
                <Popup>
          <JoziateSefaresheBazargah
            {...showDetails}
            onClose={()=>this.setState({showDetails:false})}
          />
        </Popup>
            )
        }
        if(this.props.renderInHome){return this.renderInHome()}
        if(!bazargah.active){
            return (
                <RVD
                    layout={{
                        className:'page-bg',style:{width:'100%'},
                        column:[
                            {html:'بازارگاه',className:'size24 bold',align:'vh',size:96},
                            {html:<img src={bazargahCommingSoon} alt={''} width={300} height={240}/>,align:'vh'},
                            {size:24},
                            {html:'محلی برای اخذ و ارسال سفارش های مردمی',className:'size16 color605E5C',align:'vh'},
                            {size:24},
                            {html:'بزودی',className:'size18 colorA19F9D',align:'vh'}
                        ]
                    }}
                />
            )
        }
        return (
            <RVD
                layout={{
                    className:'page-bg',style:{width:'100%'},
                    column:[
                        this.bazargahPower_layout(),
                        this.tabs_layout(),
                        {size:12},
                        this.wait_to_get_layout(),
                        this.wait_to_send_layout(),
                        {size:12}
                    ]
                }}
            />
        )
    }
}




class JoziateSefaresheBazargah extends Component{
    static contextType=appContext;
    constructor(props){
        super(props);
        this.state = {sendStep:0,sendStatus:props.sendStatus,deliverers:[],code0:'',code1:'',code2:'',staticCode:props.deliveredCode}
    }
    async get_deliverers(){
        let {bazargahApis} = this.context;
        let deliverers = await bazargahApis({type:'get_deliverers'});
        this.setState({deliverers})
    }
    async componentDidMount(){
        this.get_deliverers();
    }
    async changeSendStatus(key,value){
        let {bazargahApis} = this.context;
        let {orderId} = this.props;
        let {sendStatus} = this.state;
        sendStatus = JSON.parse(JSON.stringify(sendStatus));
        sendStatus[key] = value;
        let res = await bazargahApis({type:'taghire_vaziate_ersale_sefaresh',parameter:{orderId,sendStatus}})
        if(!res){
            alert('تغییرات موفقیت آمیز نبود')
        }
        else{this.setState({sendStatus})}
    }
    getVisibility(key){
        let {type} = this.props;
        let {sendStep} = this.state;
        if(key === 'timer'){return type === 'wait_to_get' || sendStep === 0}
        if(key === 'items'){return type === 'wait_to_get' || [0,1,3].indexOf(sendStep) !== -1}
        if(key === 'wizard'){return type === 'wait_to_send' && sendStep > 0}
        if(key === 'deliverer'){return type === 'wait_to_send' && sendStep === 2}
        if(key === 'address'){return type === 'wait_to_send' && sendStep === 2}
        if(key === 'details'){return type === 'wait_to_get' || [0,3].indexOf(sendStep) !== -1}
        if(key === 'code'){return type === 'wait_to_send' && sendStep === 3}
        if(key === 'call'){return type === 'wait_to_send' && sendStep === 3}
        if(key === 'submit'){return type === 'wait_to_get' || sendStep < 3}
    }
    async onSubmit(){
        let {type} = this.props;
        if(type === 'wait_to_get'){
            let {bazargahApis} = this.context;
            let {orderId} = this.props;
            let res = await bazargahApis({type:'akhze_sefaresh',parameter:{orderId}})
            let {showMessage} = this.context;
            if(res){showMessage('سفارش با موفقیت اخذ شد'); this.props.onClose()}
            else{showMessage('اخذ سفارش با خطا روبرو شد')}   
        }
        if(type === 'wait_to_send'){
            let {sendStep} = this.state;
            this.setState({sendStep:sendStep + 1})
        }
    }
    getHints(){
        let {type} = this.props;
        if(type === 'wait_to_get'){
            return {
                title:'اخذ سفارش',
                hints: [
                    'سفارش را اخذ کنید',
                    'کالاهای سفارش را بسته بندی کنید',
                    'به نشانی تحویل ارسال کنید',
                    'مبلغ سفارش به کیف پول شما واریز میشود'
                ]
            }
        }
        if(type === 'wait_to_send'){
            let {sendStep,sendStatus} = this.state;
            let res = {}
            res.title = [
                'ارسال سفارش',
                'آماده سازی سفارش',
                'نحوه ارسال سفارش',
                'تحویل بسته'
            ][sendStep];    
            if(sendStep === 0){
                res.hints = [
                    'کالاهای سفارش را بسته بندی کنید',
                    'نحوه ارسال را مشخص کنید'
                ]
            }
            if(sendStep === 1){
                res.hints = [
                    'کالاهای سفارش را یک به یک بررسی کنید و برای سفارش آماده کنید',
                    'پس از آماده سازی هر کالا تیک کنار آن را بزنید'
                ]
            }
            if(sendStep === 2){
                res.hints = ['اطلاعات مربوط به ارسال بسته سفارش  را تکمیل کنید']
            }
            if(sendStep === 3){
                res.hints = [
                    '4 رقم ابتدایی را به پیک اعلام کنید',
                    'پیک از تحویل گیرنده کد تحویل را میخواهد',
                    'پیک پس از تطابق 4 رقم ابتدایی، 3 رقم پایانی را به شما اعلام میکند',
                    'پس از وارد کردن 3 رقم پایانی وضعیت سفارش به تحویل شد تغییر میابد'
                ]
            }
            return res
        }
    }
    getInfo(key){
        let {type} = this.props;
        if(type === 'wait_to_get'){
            if(key === 'onBack'){return ()=>this.props.onClose()}
            if(key === 'isCheckable'){return false}
            if(key === 'buttonDisabled'){return false}
            if(key === 'title'){return 'جزییات سفارش'}
            if(key === 'buttonTitle'){return 'اخذ سفارش'}
            if(key === 'timeTitle'){return 'مانده تا انقضای سفارش'}
        }
        if(type === 'wait_to_send'){
            let {sendStep,sendStatus} = this.state;
            if(key === 'onBack'){
                if(sendStep === 0){return ()=>this.props.onClose()}
                if(sendStep === 1){return ()=>this.setState({sendStep:0})}
                if(sendStep === 2){return ()=>this.setState({sendStep:1})}
                if(sendStep === 3){return ()=>this.setState({sendStep:2})}
            }
            if(key === 'isCheckable'){return sendStep === 1}
            if(key === 'title'){return 'ارسال سفارش'}
            if(key === 'buttonTitle'){
                if(sendStep === 0){return 'ارسال سفارش'}
                if(sendStep === 1){return 'مرحله بعد'}
                if(sendStep === 2){return 'ارسال سفارش'}
            }
            if(key === 'buttonDisabled'){
                let {itemsChecked = {},delivererId} = sendStatus;
                if(sendStep === 0){return false}
                if(sendStep === 1){
                    return Object.keys(itemsChecked).filter((o)=>!!itemsChecked[o]).length !== this.props.items.length
                }
                if(sendStep === 2){return !delivererId}
            }
            if(key === 'timeTitle'){return 'مهلت ارسال'}
        }
    }
    header_layout(){
        return {
            html:(
                <Header title={this.getInfo('title')} onClose={()=>this.getInfo('onBack')()}/>
            )
        }
    }
    detailRow_layout(label,value){
        return {
            size:28,className:'padding-0-24',
            row:[
                {html:label,className:'colorA19F9D size12',align:'v'},
                {flex:1},
                {html:value,className:'color323130 size12 bold',align:'v'}
            ]
        }
    }
    details_layout(){
        if(!this.getVisibility('details')){return false}
        let {orderId,createdDate,receiverName,receiverNumber,shippingAddress,amount,benefit} = this.props;
        return {
            column:[
                {size:6},
                {
                    style:{borderTop:'5px solid #ddd',borderBottom:'5px solid #ddd'},
                    column:[
                        this.detailRow_layout('کد سفارش',orderId),
                        this.detailRow_layout('تاریخ ثبت',createdDate),
                    ]
                },
                this.detailRow_layout('تحویل گیرنده',receiverName),
                this.detailRow_layout('موبایل',receiverNumber),
                {
                    column:[
                        {html:'آدرس',className:'colorA19F9D size12 padding-0-24'},
                        {html:shippingAddress,className:'color323130 size12 bold padding-0-24'},
                        {size:12}
                    ]
                },
                {
                    style:{borderTop:'5px solid #ddd',borderBottom:'5px solid #ddd'},
                    column:[
                        this.detailRow_layout('مبلغ پرداختی کل: ',functions.splitPrice(amount) + ' ریال'),
                        //this.detailRow_layout('سود شما از فروش:',functions.splitPrice(benefit) + ' ریال')
                    ]
                },
                {size:6}
            ]
        }
    }
    time_layout(){
        if(!this.getVisibility('timer')){return false}
        let {totalTime,orderDate} = this.props;
        let timeTitle = this.getInfo('timeTitle');
        return {
            row:[
                {flex:1},
                {size:110,html:<TimerGauge key={this.props.id} {...{totalTime,startTime:orderDate}}/>,align:'vh'},
                {align:'v',html:timeTitle,className:'color605E5C size14'},
                {flex:1}
            ]
        }
    }
    hintItem_layout(color,text,number){
        let style = {width:24,height:24,background:color,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,borderRadius:'100%'};
        return {
            row:[
                {size:48,align:'vh',html:<div style={style}>{number}</div>},
                {html:text,className:'color605E5C size12 bold',align:'v'}
            ]
        }
    }
    hint_layout(){
        let colors = ['#FDB913','#F15A29','#662D91','#00B5A5']
        let {title,hints} = this.getHints()
        return {
            column:[
                {size:6},
                {show:!!title,html:title,className:'size20 bold margin-0-12',size:36},
                {
                    className:'margin-0-12 padding-12-0 round-8',style:{border:'2px dotted #2BA4D8'},gap:12,
                    column:hints.map((o,i)=>this.hintItem_layout(colors[i],o,i + 1))
                },
                {size:6}
            ]
        }
    }
    items_layout(){
        let {items} = this.props;
        if(!items){return false}
        if(!this.getVisibility('items')){return false}
        let isCheckable = this.getInfo('isCheckable')
        return {
            flex:1,className:'margin-0-12',gap:1,style:{boxSizing:'border-box',width:'calc(100% - 24px)',marginTop:6},
            column:items.map((o,i)=>{
                return {html:this.item_layout({...o,isFirst:i === 0,isLast:i === items.length - 1,isCheckable})}
            })
        }
    }
    item_layout({src,name,detail,isFirst,isLast,isCheckable,id}){
        let {sendStatus} = this.state;
        let borderRadius,onClick;
        if(isFirst && isLast){borderRadius = 8} 
        else if(isFirst){borderRadius = '8px 8px 0 0'}
        else if(isLast){borderRadius = '0 0 8px 8px'}
        else{borderRadius = 0}
        let isChecked;
        if(isCheckable){
            let {itemsChecked = {}} = sendStatus;
            isChecked = !!itemsChecked[id];
            onClick = ()=>{
                let newItemsChecked = {...itemsChecked,[id]:!itemsChecked[id]}
                this.changeSendStatus('itemsChecked',newItemsChecked)
            }
        }
        return (
            <RVD
                layout={{
                    style:{width:'100%',height:90,borderRadius,overflow:'hidden',opacity:isCheckable?(isChecked?1:0.5):1},
                    className:'box',
                    attrs:{onClick},
                    row:[
                        {size:90,html:<img src={src} width='100%'/>,className:'padding-3'},
                        {
                            flex:1,
                            column:[
                                {flex:1},
                                {html:name,className:'color605E5C size12 bold'},
                                {html:detail,className:'color605E5C size12'},
                                {flex:1}
                            ]
                        },
                        {
                            show:!!isCheckable,
                            size:36,align:'vh',
                            html:(
                                <div 
                                    style={{
                                        border:'1px solid dodgerblue',borderRadius:3,width:20,height:20,
                                        background:isChecked?'dodgerblue':'#fff',display:'flex',alignItems:'center',justifyContent:'center'
                                    }}
                                >
                                    {isChecked && <Icon path={mdiCheck} color='#fff' size={0.8}/>}
                                </div>
                            )
                        }
                    ]
                }}
            />
        )
    }
    address_layout(){
        if(!this.getVisibility('address')){return false}
        let {latitude,longitude,shippingAddress} = this.props;
        return {
            className:'margin-0-12',
            column:[
                {size:6},
                {
                    html:(
                        <Map
                            latitude={latitude}
                            longitude={longitude}
                            changeView={false}
                            style={{width:'100%',height:120}}
                        />
                    )
                },
                {size:12},
                {
                    column:[
                        {html:'آدرس تحویل',className:'colorA19F9D size12 padding-0-24'},
                        {html:shippingAddress,className:'color323130 size12 bold padding-0-24'}
                    ]
                },
                {size:6}
            ]
        }
    }
    
    deliverer_layout(){
        if(!this.getVisibility('deliverer')){return false}
        let {deliverers,sendStatus} = this.state;
        return {
            column:[
                {size:16},
                {
                    size:36,className:'size16 color323130 bold margin-0-12',
                    row:[
                        {flex:1,html:'انتخاب پیک',align:'v'},
                        {
                            html:(
                                <AIOButton
                                    type='button'
                                    style={{background:'none'}}
                                    className='color3B55A5 bold size14'
                                    text='افزودن پیک جدید'
                                    position='bottom'
                                    popOver={(obj)=><AddDeliverer onSuccess={(model)=>{
                                        this.setState({deliverers:deliverers.concat({...model})});
                                        obj.toggle()
                                    }}/>}
                                />
                            )
                        } 
                    ]
                },
                {
                    html:(
                        <AIOButton
                            type={'radio'}
                            options={deliverers}
                            optionText='option.name'
                            optionValue='option.id'
                            optionStyle='{width:"100%",borderBottom:"1px solid #ddd"}'
                            optionSubtext='option.mobile'
                            optionClassName='size14 color605E5C'
                            optionAfter='"A"'
                            value={sendStatus.delivererId}
                            onChange={(value)=>this.changeSendStatus('delivererId',value)}
                        />
                    )
                }
            ]
        }
    }
    getSvg(key){
        if(key === 1){
            return (
                <svg width="53" height="52" viewBox="0 0 53 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30.1396 1.48901C27.8054 0.542726 25.1945 0.542726 22.8603 1.48901L17.2015 3.78314L41.9813 13.4198L50.6984 10.0518C50.3473 9.76056 49.9485 9.51966 49.511 9.34226L30.1396 1.48901ZM52.3333 13.5743L28.4369 22.807V51.0251C29.0152 50.9071 29.5852 50.7357 30.1396 50.5109L49.511 42.6577C51.217 41.966 52.3333 40.309 52.3333 38.4681V13.5743ZM24.5619 51.0249V22.807L0.666626 13.5747V38.4681C0.666626 40.309 1.7829 41.966 3.48896 42.6577L22.8603 50.5109C23.4144 50.7356 23.9841 50.9069 24.5619 51.0249ZM2.30117 10.0521L26.4994 19.4014L36.6183 15.4918L11.967 5.90522L3.48896 9.34226C3.05124 9.51972 2.65235 9.76072 2.30117 10.0521Z" fill="#F15A29"/>
                </svg>

            )
        }
        if(key === 2){
            return (
                <svg width="63" height="62" viewBox="0 0 63 62" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M49.5834 18.0837C49.5834 15.242 47.2584 12.917 44.4167 12.917L36.6667 12.917V18.0837L44.4167 18.0837V24.9295L35.4267 36.167L26.3334 36.167L26.3334 23.2503L16.0001 23.2503C10.2909 23.2503 5.66675 27.8745 5.66675 33.5837L5.66675 41.3337H10.8334C10.8334 45.622 14.2951 49.0837 18.5834 49.0837C22.8717 49.0837 26.3334 45.622 26.3334 41.3337L37.9067 41.3337L49.5834 26.7378V18.0837ZM10.8334 36.167V33.5837C10.8334 30.742 13.1584 28.417 16.0001 28.417L21.1667 28.417L21.1667 36.167H10.8334ZM18.5834 43.917C17.1626 43.917 16.0001 42.7545 16.0001 41.3337H21.1667C21.1667 42.7545 20.0042 43.917 18.5834 43.917Z" fill="#F15A29"/>
                    <path d="M13.4167 15.5L26.3334 15.5V20.6667L13.4167 20.6667L13.4167 15.5ZM49.5834 33.5833C45.2951 33.5833 41.8334 37.045 41.8334 41.3333C41.8334 45.6217 45.2951 49.0833 49.5834 49.0833C53.8717 49.0833 57.3334 45.6217 57.3334 41.3333C57.3334 37.045 53.8717 33.5833 49.5834 33.5833ZM49.5834 43.9167C48.1626 43.9167 47.0001 42.7542 47.0001 41.3333C47.0001 39.9125 48.1626 38.75 49.5834 38.75C51.0042 38.75 52.1667 39.9125 52.1667 41.3333C52.1667 42.7542 51.0042 43.9167 49.5834 43.9167Z" fill="#F15A29"/>
                </svg>
            )
        }
        if(key === 'code'){
            return (
                <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="42" height="42" rx="14" transform="matrix(1 0 0 -1 0 42)" fill="#662D91"/>
                    <path d="M27.25 12C28.7688 12 30 13.2312 30 14.75V27.25C30 28.7688 28.7688 30 27.25 30H14.75C13.2312 30 12 28.7688 12 27.25V14.75C12 13.2312 13.2312 12 14.75 12H27.25ZM16 19L15.8643 19.0068C15.3762 19.0565 15 19.3703 15 19.75C15 20.1642 15.4477 20.5 16 20.5H26L26.1357 20.4932C26.6238 20.4435 27 20.1297 27 19.75C27 19.3358 26.5523 19 26 19H16ZM24.3333 22H17.6667L17.5762 22.0068C17.2508 22.0565 17 22.3703 17 22.75C17 23.1642 17.2985 23.5 17.6667 23.5H24.3333L24.4238 23.4932C24.7492 23.4435 25 23.1297 25 22.75C25 22.3358 24.7015 22 24.3333 22Z" fill="white"/>
                </svg>
            )
        }
        if(key === 'deliverer'){
            return (
                <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="42" height="42" rx="14" transform="matrix(1 0 0 -1 0 42)" fill="#662D91"/>
                    <path d="M29.1663 15.1663C29.1663 13.883 28.1163 12.833 26.833 12.833H23.333V15.1663H26.833V18.258L22.773 23.333H18.6663V17.4997H13.9997C11.4213 17.4997 9.33301 19.588 9.33301 22.1663V25.6663H11.6663C11.6663 27.603 13.2297 29.1663 15.1663 29.1663C17.103 29.1663 18.6663 27.603 18.6663 25.6663H23.893L29.1663 19.0747V15.1663ZM15.1663 26.833C14.5247 26.833 13.9997 26.308 13.9997 25.6663H16.333C16.333 26.308 15.808 26.833 15.1663 26.833Z" fill="white"/>
                    <path d="M12.8335 14H18.6668V16.3333H12.8335V14ZM29.1668 22.1667C27.2302 22.1667 25.6668 23.73 25.6668 25.6667C25.6668 27.6033 27.2302 29.1667 29.1668 29.1667C31.1035 29.1667 32.6668 27.6033 32.6668 25.6667C32.6668 23.73 31.1035 22.1667 29.1668 22.1667ZM29.1668 26.8333C28.5252 26.8333 28.0002 26.3083 28.0002 25.6667C28.0002 25.025 28.5252 24.5 29.1668 24.5C29.8085 24.5 30.3335 25.025 30.3335 25.6667C30.3335 26.3083 29.8085 26.8333 29.1668 26.8333Z" fill="white"/>
                </svg>
            )
        }
        if(key === 'phone'){
            return (
                <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.98706 1.06589C4.89545 0.792081 5.86254 1.19479 6.31418 2.01224L6.38841 2.16075L7.04987 3.63213C7.46246 4.54992 7.28209 5.61908 6.60754 6.3496L6.47529 6.48248L5.43194 7.45541C5.24417 7.63298 5.38512 8.32181 6.06527 9.49986C6.67716 10.5597 7.17487 11.0552 7.41986 11.0823L7.4628 11.082L7.5158 11.0716L9.56651 10.4446C10.1332 10.2713 10.7438 10.4487 11.1298 10.8865L11.2215 11.0014L12.5781 12.8815C13.1299 13.6462 13.0689 14.6842 12.4533 15.378L12.3314 15.5039L11.7886 16.018C10.7948 16.9592 9.34348 17.2346 8.07389 16.7231C6.13867 15.9433 4.38077 14.1607 2.78368 11.3945C1.18323 8.62242 0.519004 6.20438 0.815977 4.13565C0.99977 2.85539 1.87301 1.78674 3.07748 1.3462L3.27036 1.28192L3.98706 1.06589Z" fill="#0094D4"/>
                </svg>
            )
        }
    }
    wizard_layout(){
        if(!this.getVisibility('wizard')){return false}
        let {sendStep} = this.state;
        return {
            column:[
                {size:60,html:this.getSvg(sendStep),align:'vh'},
                {
                    html:(
                        <Slider
                            attrs={{className:'margin-0-36'}}
                            start={1}
                            direction='left'
                            end={4}
                            labelStep={1}
                            labelStyle={(v)=>{
                                let active = v === sendStep;
                                if(active){
                                    return {
                                        width:20,height:20,borderRadius:'100%',top:8,transform:'translateX(11px)',fontSize:14,
                                        background:'#F15A29',
                                        border:'1px solid #F15A29',
                                        color:'#fff'
                                        
                                    }
                                }
                                else {
                                    return {
                                        width:20,height:20,borderRadius:'100%',top:8,transform:'translateX(11px)',fontSize:14,
                                        background:'#fff',
                                        border:'1px solid #aaa',
                                        color:'#aaa'   
                                    }
                                }
                            }}
                            points={[sendStep]}
                        />
                    )
                }
            ]
        }
    }
    code_layout(){
        if(!this.getVisibility('code')){return false}
        let {rsa_actions} = this.context;
        let {setNavId} = rsa_actions;
        let {staticCode,code0,code1,code2} = this.state;
        code0 = parseInt(code0); code1 = parseInt(code1); code2 = parseInt(code2);
        let disabled = isNaN(code0) || isNaN(code1) ||isNaN(code2);
        return {
            className:'margin-0-12',
            column:[
                {size:6},
                {
                    size:42,
                    row:[
                        {size:42,align:'vh',html:this.getSvg('code')},
                        {size:12},
                        {
                            column:[
                                {html:'کد تحویل',className:'size16 bold color323130'},
                                {html:'سه رقم پایانی را وارد کنید',className:'size14 color605E5C'}
                            ]
                        }
                    ]
                },
                {size:12},
                {
                    size:48,style:{direction:'ltr'},
                    row:[
                        {flex:1},
                        {
                            row:staticCode.split('').map((o)=>{
                                return {size:30,html:o,align:'vh',className:'bold size24'}
                            })
                        },
                        {
                            row:['0','1','2'].map((o)=>{
                                let inputStyle = {
                                    width: 26,textAlign: 'center',height: 32,background:'#fff',border: '1px solid',
                                    fontFamily:'inherit',fontSize:24,borderRadius:4,fontWeight:'bold'
                                }                        
                                return {
                                    size:36,align:'vh',className:'bold size24',
                                    html:(
                                        <AIOButton 
                                            style={inputStyle} type='button' caret={false}
                                            text={this.state['code' + o]}
                                            popOver={
                                                (obj)=>{
                                                    return (
                                                        <InlineNumberKeyboard 
                                                            onClick={(v)=>{
                                                                this.setState({['code' + o]:v});
                                                                obj.toggle()
                                                            }}
                                                        />
                                                    )
                                                }
                                            }
                                        />
                                    )
                                }
                            })
                        },
                        {flex:1}
                    ]
                },
                {size:6},
                {
                    align:'vh',
                    html:(
                        <button 
                            className='button-2 margin-0-12' disabled={disabled} style={{height:36}}
                            onClick={async ()=>{
                                if(disabled){return}
                                let {bazargahApis,showMessage} = this.context;
                                let res = await bazargahApis({type:'taide_code_tahvil',parameter:{staticCode,orderId:this.props.orderId,dynamicCode:`${code0}${code1}${code2}`}})
                                if(res){
                                    showMessage('کالا تحویل شد.');
                                    setNavId('khane')
                                }
                                else{
                                    showMessage('کد معتبر نیست')
                                }
                            }}
                        >تایید</button>
                    )
                },
                {size:6}
            ]
        }
    }
    callDeliverer_layout(){
        if(!this.getVisibility('call')){return false}
        let {sendStatus,deliverers} = this.state;
        let deliverer = deliverers.find((o)=>o.id === sendStatus.delivererId)
        return {
            className:'margin-0-12',
            column:[
                {size:6},
                {
                    size:42,
                    row:[
                        {size:42,align:'vh',html:this.getSvg('deliverer')},
                        {size:12},
                        {
                            column:[
                                {html:deliverer.name,className:'size16 bold color323130'},
                                {html:deliverer.mobile,className:'size14 color605E5C'}
                            ]
                        },
                        {flex:1},
                        {
                            html:(
                                <a href={`tel:${deliverer.mobile}`} style={{display:'flex',alignItems:'center'}}>
                                    {getSvg('phone',{style:{transform:'scale(0.6)'}})}
                                    <span className='color3B55A5 size14 bold'>تماس</span>
                                </a>
                            )
                        }
                    ]
                },
                {size:6}
            ]
        }
    }
    submit_layout(){
        if(!this.getVisibility('submit')){return false}
        return {
            className:'padding-0-12',align:'v',
            size:60,html:<button className='button-2' disabled={this.getInfo('buttonDisabled')} onClick={()=>this.onSubmit()}>{this.getInfo('buttonTitle')}</button>
        }
    }
    render(){
        return (
            <RVD
                layout={{
                    style:{width:'100%'},
                    className:'popup-bg',
                    column:[
                        this.header_layout(),
                        {
                            flex:1,scroll:'v',
                            column:[
                                this.wizard_layout(),
                                this.hint_layout(),
                                this.callDeliverer_layout(),
                                this.code_layout(),
                                this.time_layout(),
                                this.details_layout(),
                                this.items_layout(),
                                this.address_layout(),
                                this.deliverer_layout()
                            ]
                        },
                        this.submit_layout()
                    ]
                }}
            />
        )
    }
}
class InlineNumberKeyboard extends Component{
    render(){
        let {onClick} = this.props;
        let style = {background:'dodgerblue',color:'#fff',borderRadius:5}
        return (
            <RVD
                layout={{
                    style:{width:120,fontSize:16,flex:'none',padding:6},
                    gap:6,
                    column:[
                        {
                            size:30,gap:6,
                            row:[
                                {flex:1,style,html:'1',align:'vh',attrs:{onClick:()=>onClick('1')}},
                                {flex:1,style,html:'2',align:'vh',attrs:{onClick:()=>onClick('2')}},
                                {flex:1,style,html:'3',align:'vh',attrs:{onClick:()=>onClick('3')}},
                            ]
                        },
                        {
                            size:30,gap:6,
                            row:[
                                {flex:1,style,html:'4',align:'vh',attrs:{onClick:()=>onClick('4')}},
                                {flex:1,style,html:'5',align:'vh',attrs:{onClick:()=>onClick('5')}},
                                {flex:1,style,html:'6',align:'vh',attrs:{onClick:()=>onClick('6')}},
                            ]
                        },
                        {
                            size:30,gap:6,
                            row:[
                                {flex:1,style,html:'7',align:'vh',attrs:{onClick:()=>onClick('7')}},
                                {flex:1,style,html:'8',align:'vh',attrs:{onClick:()=>onClick('8')}},
                                {flex:1,style,html:'9',align:'vh',attrs:{onClick:()=>onClick('9')}},
                            ]
                        },
                        {
                            size:30,gap:6,
                            row:[
                                {flex:1,html:'',align:'vh'},
                                {flex:1,style,html:'0',align:'vh',attrs:{onClick:()=>onClick('0')}},
                                {flex:1,html:'',align:'vh'},
                            ]
                        }
                    ]
                }}
            />
        )
    }
}
class AddDeliverer extends Component{
    static contextType = appContext;
    constructor(props){
        super(props);
        this.state = {model:{name:'',mobile:''}}
    }
    render(){
        let {model} = this.state;
        let {onSuccess} = this.props;
        return (
            <Form
                lang='fa'
                header={{title:'افزودن پیک جدید',className:'bold'}}
                onChange={(model)=>this.setState({model})}
                onSubmit={async ()=>{
                    let {bazargahApis,showMessage} = this.context;
                    let res = await bazargahApis({type:'add_deliverer',parameter:model});
                    if(res){
                        showMessage('افزودن پیک با موفقیت انجام شد')
                        onSuccess({...model})
                        this.setState({model:{name:'',mobile:''}});
                        
                    }
                    else {showMessage('افزودن پیک با خطا مواجه شد')}
                }}
                submitText='افزودن پیک'
                model={model}
                inputs={[
                    {type:'text',label:'نام',field:'model.name',validations:[['required']]},
                    {type:'text',label:'موبایل',field:'model.mobile',validations:[['required'],['length',11]]}, 
                ]}
            />
        )
    }
}


class BazargahCard extends Component{
    button_layout(){
        let {type = 'wait_to_get',deliveredDate,canseledDate,onSend,onShowDetails = ()=>{}} = this.props;
        let text = {
            'wait_to_get':'اخذ سفارش',
            'wait_to_send':'ارسال سفارش',
            'delivered':`تاریخ تحویل: ${deliveredDate}`,
            'canseled':`تاریخ لغو: ${canseledDate}`
        }[type];
        let onClick = {
            'wait_to_get':()=>onShowDetails(),
            'wait_to_send':()=>onSend()
        }[type]
        return {
            size:48,align:'v',
            row:[
                {flex:1,html:<button className='button-2' style={{height:32,margin:'0 12px'}} onClick={onClick}>{text}</button>}
            ]
        }
    }
    amount_layout(amount){
        return {
            gap:4,
            row:[
                {html:getSvg('cash'),size:36,align:'vh'},
                {html:'مبلغ سفارش:',className:'size14 color605E5C',align:'v'},
                {html:functions.splitPrice(amount),align:'v',className:'bold color323130 size14'},
                {html:'ریال',align:'v',className:'colorA19F9D size12'}
            ]
        }
    }
    distance_layout(distance){
        let distanceValue = distance,distanceUnit = 'کیلومتر';
        return {
            gap:4,
            row:[
                {html:getSvg('location'),size:36,align:'vh'},
                {html:'فاصله:',className:'size14 color605E5C',align:'v'},
                {html:distanceValue,align:'v',className:'bold color323130 size14'},
                {html:distanceUnit,align:'v',className:'colorA19F9D size12'}
            ]
        }
    }
    address_layout(address){
        if(!address){return false}
        return {
            gap:4,
            row:[
                {html:getSvg('address'),size:36,align:'vh'},
                {html:'آدرس:',className:'size14 color605E5C',align:'v'},
                {html:address,align:'v',className:'colorA19F9D size12'}
            ]
        }
    }
    benefit_layout(benefit){
        return false;
        if(!benefit){return false}
        return {
            gap:4,
            row:[
                {html:getSvg('benefit'),size:36,align:'vh'},
                {html:'سود:',className:'size14 colorF15A29',align:'v'},
                {html:functions.splitPrice(benefit),align:'v',className:'bold colorF15A29 size14'},
                {html:'ریال',align:'v',className:'colorF15A29 size12'}
            ]
        }
    }
    time_layout(totalTime,orderDate){
        let {onExpired = ()=>{},id} = this.props;
        return {size:110,align:'h',html:(<TimerGauge key={id} onExpired={()=>onExpired()} totalTime={totalTime} startTime={orderDate}/>)}
    }
    items_layout(items){
        if(!items){return false}
        return {
            flex:1,scroll:'h',gap:12,className:'margin-0-12',style:{boxSizing:'border-box',width:'calc(100% - 24px)'},
            row:items.map((o)=>{
                return {html:this.item_layout(o)}
            })
        }
    }
    item_layout({src,name,detail}){
        return (
            <RVD
                layout={{
                    style:{width:240,height:60,border:'1px solid #ddd',borderRadius:6,overflow:'hidden'},
                    row:[
                        {size:60,html:<img src={src} width='100%'/>,className:'padding-3'},
                        {
                            column:[
                                {flex:1},
                                {html:name,className:'color605E5C size12 bold'},
                                {html:detail,className:'color605E5C size12'},
                                {flex:1}
                            ]
                        }
                    ]
                }}
            />
        )
    }
    render(){
        let {amount,distance,benefit,totalTime,orderDate,address,items} = this.props;        
        return (
            <RVD
                layout={{
                    className:'box gap-no-color margin-0-12',
                    style:{direction:'rtl',overflow:'hidden'},
                    column:[
                        {
                            row:[
                                {
                                    flex:1,gap:6,
                                    column:[
                                        {size:12},
                                        this.amount_layout(amount),
                                        this.distance_layout(distance),
                                        this.benefit_layout(benefit),
                                        this.address_layout(address),
                                        {size:12}
                                    ]
                                },
                                this.time_layout(totalTime,orderDate),
                                
                            ]
                        },
                        this.items_layout(items),
                        {size:12},
                        this.button_layout()
                    ]
                }}
            />
        )
    }
}
