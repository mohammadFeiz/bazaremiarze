import React,{Component,createRef} from "react";
import RVD from "./../../interfaces/react-virtual-dom/react-virtual-dom";
import getSvg from "../../utils/getSvg";
import functions from "../../functions";
import GAH from './../../npm/aio-datepicker/aio-datepicker';
import appContext from "../../app-context";
import Form from "./../../interfaces/aio-form-react/aio-form-react";
import noItemSrc from './../../images/not-found.png';
import AIOButton from './../../interfaces/aio-button/aio-button';
import {Icon} from '@mdi/react';
import {mdiCog} from '@mdi/js';
import './index.css';
export default class Wallet extends Component{
    static contextType = appContext
    constructor(props){
        super(props);
        this.dom = createRef();
        this.state = {fromDate:'',toDate:false,items:[],cards:[]}
    }
    svg_in(){
        return (
            <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="46" height="46" rx="23" fill="#5FD255" fillOpacity="0.2"/>
                <path d="M29.8664 23.8371C30.0526 23.6332 30.0382 23.3169 29.8342 23.1307C29.6303 22.9446 29.314 22.959 29.1278 23.1629L23.4971 29.3307V15.5C23.4971 15.2239 23.2733 15 22.9971 15C22.721 15 22.4971 15.2239 22.4971 15.5V29.3279L16.869 23.1629C16.6828 22.959 16.3666 22.9446 16.1627 23.1307C15.9587 23.3169 15.9443 23.6332 16.1305 23.8371L22.4445 30.7535C22.5723 30.8934 22.7398 30.9732 22.913 30.993C22.9403 30.9976 22.9684 31 22.9971 31C23.024 31 23.0504 30.9979 23.0761 30.9938C23.252 30.9756 23.4227 30.8955 23.5523 30.7535L29.8664 23.8371Z" fill="#107C10"/>
            </svg>
        )
    }
    svg_out(){
        return (
            <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="46" height="46" rx="23" fill="#F3F2F1"/>
                <path d="M21.5 17C21.2239 17 21 16.7761 21 16.5C21 16.2239 21.2239 16 21.5 16H29.5C29.7761 16 30 16.2239 30 16.5V24.5C30 24.7761 29.7761 25 29.5 25C29.2239 25 29 24.7761 29 24.5V17.7071L16.8535 29.8536C16.6583 30.0488 16.3417 30.0488 16.1464 29.8536C15.9512 29.6583 15.9512 29.3417 16.1464 29.1464L28.2929 17H21.5Z" fill="#605E5C"/>
            </svg>
        )
    }
    async componentDidMount(){
        let {walletApis,showMessage} = this.context;
        let {fromDate}=this.state;
        let items = await walletApis({type:'items',parameter:fromDate,loading:false});
        let cards = []; 
        let res = await walletApis({type:'ettelaate_banki'})
        if(typeof res === 'string'){showMessage(res);}
        else{cards = res;}
        this.setState({items,cards})
    }
    header_layout(){
        let {userInfo,openPopup} = this.context;
        let {onClose} = this.props;
        return {
            className:'blue-gradient',
            column:[
                {className:'blue-gradient-point1'},
                {className:'blue-gradient-point2'},
                {
                    size:60,className:'colorFFF',
                    row:[
                        {size:60,html:getSvg('chevronLeft',{flip:true,fill:'#fff'}),align:'vh',attrs:{onClick:()=>onClose()}},
                        {flex:1,html:'مدیریت کیف پول',align:'v'},
                        {
                            size:60,align:'vh',html:<Icon path={mdiCog} size={0.8}/>,
                            attrs:{
                                onClick:()=>{
                                    let {cards} = this.state;
                                    openPopup('tanzimate-kife-pool',{cards,onChange:(cards)=>this.setState({cards})})
                                }}
                            }
                    ]
                },
                {
                    size:72,
                    row:[
                        {flex:1},
                        {html:'تراز حساب',className:'size12 colorC7E7F4',align:'v'},
                        {size:12},
                        {row:[{html:' بدهکاری',align:'v'},{size:6}],show:userInfo.ballance < 0,className:'colorA4262C size16 bold'},
                        {html:userInfo.ballance < 0?functions.splitPrice(-userInfo.ballance):functions.splitPrice(userInfo.ballance),className:`colorFFF ${userInfo.ballance < 0?'size16':'size30'} bold`,align:'v'},
                        {size:6},
                        {html:'تومان',className:'size14 colorFFF',align:'v'},
                        {flex:1}
                    ]
                },
                {size:12},
                {
                    row:[
                        {flex:1},
                        {html:this.headerButton_layout(getSvg('arrowTopRight'),'برداشت','bardasht',userInfo.ballance <= 0)},
                        {size:24},
                        {html:this.headerButton_layout(getSvg('arrowDown'),'شارژ حساب','variz')},
                        {flex:1}
                    ]
                },
                {size:12},
                {size:36,html:(
                    <div style={{height:48,width:'100%',background:'#fff',borderRadius:'24px 24px 0 0'}}></div>
                )}
            ]
        }
    }
    headerButton_layout(icon,text,type,disabled){
        let {cards} = this.state;
        let {userInfo} = this.context;
        return (
            <AIOButton
                type='button' caret={false}
                position='bottom'
                style={{background:'none',padding:0}}
                text={
                    <RVD
                        layout={{
                            className:'wallet-button' + (disabled?' disabled':''),
                            column:[
                                {size:6},
                                {html:icon,align:'h'},
                                {size:3},
                                {html:text,align:'h',className:'size14 colorFFF'},
                                {size:6}
                            ]
                        }}
                    />
                }
                popOver={disabled?undefined:({toggle})=>{
                    if(type === 'bardasht'){
                        if(userInfo.ballance > 0){return <BardashtPopup onClose={()=>toggle()} cards={cards} mojoodi={userInfo.ballance}/>}
                    }
                    if(type === 'variz'){return <VarizPopup/>}
                }}
            />
        )
    }
    body_layout(){
        return {
            flex:1,
            style:{background:'#fff'},
            column:[
                this.filter_layout(),
                this.cards_layout(),
                this.noItem_layout()
            ]
        }
    }
    filter_layout(){
        let {walletApis}=this.context;
        let {fromDate,toDate} = this.state;
        let style = {borderRadius:24,width:100,height:24,border:'1px solid #605E5C'}
        let fromStyle = !fromDate?{color:'#605E5C'}:{border:'1px solid #605E5C',color:'#fff',background:'#605E5C'}
        let toStyle = toDate === false?{color:'#605E5C'}:{border:'1px solid #605E5C',color:'#fff',background:'#605E5C'}
        return {
            size:36,align:'v',
            row:[
                {flex:1},
                {html:'از تاریخ : ',className:'size12 color323130',align:'v'},
                {size:6},
                {
                    html:(
                        <GAH
                            value={fromDate || false}
                            style={{...style,...fromStyle}}
                            calendarType='jalali'
                            onChange={async ({gregorian,dateString})=>{
                                this.setState({fromDate:dateString});
                                let items = await walletApis({type:'items',parameter:`${gregorian[0]}/${gregorian[1]}/${gregorian[2]}`});
                                this.setState({items});
                            }}
                            theme={['#0d436e','#fff']}
                            onClear={async ()=>{
                                this.setState({fromDate:''});
                                let items = await walletApis({type:'items',parameter:''});
                                this.setState({items});
                            }}
                        />
                    ),align:'v'
                },
                {flex:1},
                // {html:'تا تاریخ : ',className:'size12 color323130',align:'v'},
                // {size:6},
                // {
                //     html:(
                //         <GAH
                //             value={toDate}
                //             style={{...style,...toStyle}}
                //             calendarType='jalali'
                //             onChange={(obj)=>this.setState({toDate:obj.dateString})}
                //             onClear={()=>this.setState({toDate:false})}
                //         />
                //     ),align:'v'
                // },
                // {flex:1}
            ]
        }
    }
    cards_layout(){
        let {items = []} = this.state;
        if(!items.length){return false}
        return {
            style:{background:'#eee'},
            flex:1,scroll:'v',gap:1,
            column:items.map((o)=>{
                return this.card_layout(o)
            })
        }
    }
    card_layout(o){
        return {
            style:{background:'#fff',padding:'6px 0'},
            row:[
                {size:12},
                {html:o.type === 'in'?this.svg_in():this.svg_out()},
                {size:12},
                {
                    column:[
                        {html:o.title,className:'size14 color323130 bold'},
                        {html:o.date + ' ' + o._time,className:'size12 colorA19F9D'}
                    ]
                },
                {flex:1},
                {
                    column:[
                        {flex:1},
                        {
                            html:functions.splitPrice(o.amount) + ' تومان',align:'v',className:'size12 color605E5C bold',
                            style:{
                                background:o.type === 'in'?'#5FD25533':undefined,
                                color:o.type === 'in'?'#107C10':undefined
                            }
                        },
                        {flex:1}
                    ]
                },
                {size:12}
            ]
        }
    }
    noItem_layout(){
        let {items = []} = this.state;
        if(items.length){return false}
        return {
            style:{background:'#eee',opacity:0.5},
            flex:1,scroll:'v',gap:1,align:'vh',
            column:[
                {html:<img src={noItemSrc} alt='' width='128' height='128'/>},
                {html:'سابقه ای موجود نیست',style:{color:'#858a95'}},
                {size:60}
            ]
        }
    }
    render(){
        return (
            <>
                <RVD
                    layout={{
                        className:'popup-bg',
                        attrs:{ref:this.dom},
                        column:[
                            this.header_layout(),
                            this.body_layout()
                        ]
                    }}
                />
            </>
        )
    }
}


//props:
//mojhoodi
//onClose
//cards array of objects ({number,id,name})
class BardashtPopup extends Component{
    static contextType = appContext;
    constructor(props){
        super(props);
        if(typeof props.mojoodi !== 'number'){console.error('error => BardashtPopup mojoodi props is not an number')}
        this.state = {model:{amount:'',card:false},mojoodi:props.mojoodi}
    }
    async onSubmit(){
        let {walletApis,showMessage} = this.context;
        let {onClose} = this.props;
        let {model} = this.state;
        let res = await walletApis({type:'bardasht',parameter:model})
        if(typeof res === 'string'){showMessage(res); onClose()}
        else if(res === true){
            onClose()
        } 
    }
    render(){
        let {model,mojoodi} = this.state;
        let {cards} = this.props;
        return (
            <Form
                rtl={true} lang={'fa'}
                affixAttrs={{style:{height:36,background:'#fff',color:'#333'}}}
                model={model}
                data={{cards}}
                footerAttrs={{style:{background:'#fff'}}}
                rowStyle={{marginBottom:12}}
                bodyStyle={{background:'#fff',padding:12,paddingBottom:36}}
                onChange={(model)=>this.setState({model})}
                header={{title:'برداشت از کیف پول',style:{background:'#fff'}}}
                inputs={[
                    {type:'html',html:()=><span className="size12 bold" style={{height:36}}>مبلغ انتخابی حداکثر تا # ساعت به حساب شما واریز میشود</span>},
                    {type:'select',options:cards,optionValue:'option.id',optionSubtext:'option.name',optionText:'option.number',field:'model.card',label:'انتخاب کارت'},
                    {type:'number',field:'model.amount',affix:'ریال',label:'مبلغ برداشت',validations:[['required'],['<=',mojoodi]]},
                    {
                        type:'html',
                        html:()=>(
                            <RVD 
                                layout={{
                                    style:{height:48,flex:'none'},gap:6,
                                    row:[
                                        {html:'موجودی:',className:'size14 color605E5C bold',align:'v'},
                                        {html:`${functions.splitPrice(mojoodi)} ریال`,className:'size14 color3B55A5 bold',align:'v'},
                                    ]
                                }}
                            />
                        )
                    }
                ]}
                onSubmit={()=>this.onSubmit()}
                submitText='برداشت'
            />
        )
    }
}

class VarizPopup extends Component{
    static contextType = appContext;
    constructor(props){
        super(props);
        this.state = {model:{amount:''}}
    }
    async onSubmit(){
        let {walletApis,showMessage} = this.context;
        let {onClose} = this.props;
        let {model} = this.state;
        let res = await walletApis({type:'variz',parameter:model})
        if(typeof res === 'string'){showMessage(res); onClose()}
        else if(res === true){
            onClose()
        }
    }
    render(){
        let {model} = this.state;
        return (
            <Form
                rtl={true} lang='fa'
                affixAttrs={{style:{height:36,background:'#fff',color:'#333'}}}
                model={model}
                footerAttrs={{style:{background:'#fff'}}}
                style={{flex:'none'}}
                rowStyle={{marginBottom:0}}
                bodyStyle={{background:'#fff'}}
                onChange={(model)=>this.setState({model})}
                header={{title:'افزایش موجودی کیف پول',style:{background:'#fff'}}}
                inputs={[
                    {type:'number',field:'model.amount',affix:'ریال',label:'مبلغ افزایش موجودی',validations:[['required'],['>=',10000]]}
                ]}
                onSubmit={()=>this.onSubmit()}
                submitText='پرداخت'
            />
        )
    }
}