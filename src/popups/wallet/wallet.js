import React,{Component,createRef} from "react";
import RVD from "./../../npm/react-virtual-dom/react-virtual-dom";
import getSvg from "../../utils/getSvg";
import SplitNumber from "../../npm/aio-functions/split-number";
import appContext from "../../app-context";
import noItemSrc from './../../images/not-found.png';
import AIOInput from "../../npm/aio-input/aio-input";
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
        let {apis,rsa} = this.context;
        let {fromDate}=this.state;
        let items = await apis.request({api:'wallet.walletItems',parameter:fromDate,loading:false,description:'دریافت جزییات کیف پول'});
        let cards = []; 
        let res = await apis.request({api:'wallet.ettelaate_banki'})
        if(typeof res === 'string'){rsa.addAlert({type:'error',text:'',subtext:res});}
        else{cards = res;}
        this.setState({items,cards})
    }
    header_layout(){
        let {userInfo,actionClass} = this.context;
        let {onClose} = this.props;
        return {
            className:'blue-gradient',
            column:[
                {className:'blue-gradient-point1'},
                {className:'blue-gradient-point2'},
                {
                    size:60,className:'color-fff',
                    row:[
                        {size:60,html:getSvg('chevronLeft',{flip:true,className:'theme-color-fff'}),align:'vh',attrs:{onClick:()=>onClose()}},
                        {flex:1,html:'مدیریت کیف پول',align:'v'},
                        {
                            size:60,align:'vh',html:<Icon path={mdiCog} size={0.8}/>,
                            attrs:{
                                onClick:()=>{
                                    let {cards} = this.state;
                                    actionClass.openPopup('tanzimate-kife-pool',{cards,onChange:(cards)=>this.setState({cards})})
                                }}
                            }
                    ]
                },
                {
                    size:72,
                    row:[
                        {flex:1},
                        {html:'تراز حساب',className:'fs-12 colorC7E7F4',align:'v'},
                        {size:12},
                        {row:[{html:' بدهکاری',align:'v'},{size:6}],show:userInfo.ballance < 0,className:'colorA4262C fs-16 bold'},
                        {html:userInfo.ballance < 0?SplitNumber(-userInfo.ballance):SplitNumber(userInfo.ballance),className:`color-fff ${userInfo.ballance < 0?'fs-16':'fs-28'} bold`,align:'v'},
                        {size:6},
                        {html:'ریال',className:'fs-14 color-fff',align:'v'},
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
            <AIOInput
                type='button' caret={false}
                style={{background:'none',padding:0}}
                text={
                    <RVD
                        layout={{
                            className:'wallet-button' + (disabled?' disabled':''),
                            column:[
                                {size:6},
                                {html:icon,align:'h'},
                                {size:3},
                                {html:text,align:'h',className:'fs-14 color-fff'},
                                {size:6}
                            ]
                        }}
                    />
                }
                popoverSide='bottom'
                backdropAttrs={{style:{background:'rgba(0,0,0,0.8)'}}}
                popOver={disabled?undefined:()=>{
                    if(type === 'bardasht'){
                        if(userInfo.ballance > 0){return <BardashtPopup cards={cards} mojoodi={userInfo.ballance}/>}
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
        let {apis}=this.context;
        let {
            fromDate,
            //toDate
        } = this.state;
        let style = {borderRadius:24,width:100,height:24,border:'1px solid #605E5C'}
        let fromStyle = !fromDate?{color:'#605E5C'}:{border:'1px solid #605E5C',color:'#fff',background:'#605E5C'}
        //let toStyle = toDate === false?{color:'#605E5C'}:{border:'1px solid #605E5C',color:'#fff',background:'#605E5C'}
        return {
            size:36,align:'v',
            row:[
                {flex:1},
                {html:'از تاریخ : ',className:'fs-12 theme-dark-font-color',align:'v'},
                {size:6},
                {
                    html:(
                        <AIOInput
                            type='datepicker' value={fromDate || false}
                            style={{...style,...fromStyle}}
                            calendarType='jalali'
                            onChange={async ({gregorian,dateString})=>{
                                this.setState({fromDate:dateString});
                                let items = await apis.request({api:'wallet.walletItems',parameter:`${gregorian[0]}/${gregorian[1]}/${gregorian[2]}`,description:'دریافت جزییات کیف پول'});
                                this.setState({items});
                            }}
                            theme={['#0d436e','#fff']}
                            onClear={async ()=>{
                                this.setState({fromDate:''});
                                let items = await apis.request({api:'wallet.walletItems',parameter:'',description:'دریافت جزییات کیف پول'});
                                this.setState({items});
                            }}
                        />
                    ),align:'v'
                },
                {flex:1},
            ]
        }
    }
    cards_layout(){
        let {items = []} = this.state;
        if(!items.length){return false}
        return {
            style:{background:'#eee'},
            flex:1,className:'ofy-auto',gap:1,
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
                        {html:o.title,className:'fs-14 theme-dark-font-color bold'},
                        {html:o.date + ' ' + o._time,className:'fs-12 theme-light-font-color'}
                    ]
                },
                {flex:1},
                {
                    column:[
                        {flex:1},
                        {
                            html:SplitNumber(o.amount) + ' ریال',align:'v',className:'fs-12 theme-medium-font-color bold',
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
            flex:1,className:'ofy-auto',gap:1,align:'vh',
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
                        className:'theme-popup-bg',
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
        let {apis,rsa} = this.context;
        let {onClose} = this.props;
        let {model} = this.state;
        let res = await apis.request({api:'wallet.bardasht',parameter:model})
        if(typeof res === 'string'){rsa.addAlert({type:'error',text:'',subtext:res}); onClose()}
        else if(res === true){
            onClose()
        } 
    }
    render(){
        let {model,mojoodi} = this.state;
        let {cards} = this.props;
        return (
            <AIOInput
                type='form' rtl={true} lang={'fa'}
                value={model}
                onChange={(model)=>this.setState({model})}
                title='برداشت از کیف پول'
                inputs={{
                    props:{gap:12},
                    column:[
                        {html:()=><span className="fs-12 bold" style={{height:36}}>مبلغ انتخابی حداکثر تا # ساعت به حساب شما واریز میشود</span>},
                        {input:{type:'select',options:cards,optionValue:'option.id',optionSubtext:'option.name',optionText:'option.number'},field:'value.card',label:'انتخاب کارت'},
                        {input:{type:'number',after:'ریال'},field:'value.amount',label:'مبلغ برداشت',validations:[['required'],['<=',mojoodi]]},
                        {
                            html:()=>(
                                <RVD 
                                    layout={{
                                        style:{height:48,flex:'none'},gap:6,
                                        row:[
                                            {html:'موجودی:',className:'fs-14 theme-medium-font-color bold',align:'v'},
                                            {html:`${SplitNumber(mojoodi)} ریال`,className:'fs-14 color3B55A5 bold',align:'v'},
                                        ]
                                    }}
                                />
                            )
                        }
                    ]
                }}
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
        let {apis,rsa} = this.context;
        let {onClose} = this.props;
        let {model} = this.state;
        let res = await apis.request({api:'wallet.variz',parameter:model})
        if(typeof res === 'string'){rsa.addAlert({type:'error',text:'',subtext:res}); onClose()}
        else if(res === true){
            onClose()
        }
    }
    render(){
        let {model} = this.state;
        return (
            <AIOInput
                type='form' rtl={true} lang='fa'
                model={model}
                style={{flex:'none'}}
                onChange={(model)=>this.setState({model})}
                title='افزایش موجودی کیف پول'
                inputs={{
                    column:[
                        {input:{type:'number',after:'ریال'},field:'value.amount',label:'مبلغ افزایش موجودی',validations:[['required'],['>=',10000]]}
                    ]
                }}
                onSubmit={()=>this.onSubmit()}
                submitText='پرداخت'
            />
        )
    }
}