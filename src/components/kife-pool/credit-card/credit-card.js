import React,{Component} from "react";
import RVD from './../../../npm/react-virtual-dom/react-virtual-dom';
import {Icon} from '@mdi/react';
import {mdiClose} from '@mdi/js';
import './credit-card.css';
export default class CreaditCard extends Component{
    state = {mounted:false}
    componentDidMount(){
        let {index = 0} = this.props;
        setTimeout(()=>{
            this.setState({mounted:true})
        },index * 200)
    }
    render(){
        let {number = '',onRemove,id,name} = this.props;
        let {mounted} = this.state;
        let {className,bankName} = getCardDetail(number)
        let split1 = number.slice(0,4);
        let split2 = number.slice(4,8);
        let split3 = number.slice(8,12);
        let split4 = number.slice(12,16);
        return (
            <RVD
                layout={{
                    className:'credit-card rvd-rotate-card w-100 h-168 br-16' + (mounted?' mounted':''),
                    column:[
                        {size:12},
                        {
                            row:[
                                {className:'credit-card-logo w-60 h-60 m-h-6' + (className?' ' + className:'')},
                                {show:!!bankName,html:'بانک ' + bankName,className:'fs-16',align:'v'},
                                {flex:1},
                                {show:!!onRemove,size:60,html:<Icon path={mdiClose} size={1}/>,align:'vh',attrs:{onClick:()=>onRemove(id)}}
                            ]
                        },
                        {
                            className:'h-48 align-v fs-14',
                            row:[
                                {flex:1},
                                {html:split1,className:'credit-card-number-split m-h-6'},
                                {html:split2,className:'credit-card-number-split m-h-6'},
                                {html:split3,className:'credit-card-number-split m-h-6'},
                                {html:split4,className:'credit-card-number-split m-h-6'},
                                {flex:1}
                            ]
                        },
                        {flex:1,html:name,align:'v',className:'p-h-24 m-b-12'}
                    ]
                }}
            />
        )
    }
}
export function getCardDetail(number = ''){
    if(number.length < 6){
        return {className:'',bankName:''}
    }
    let res = '';
    for(let i = 0; i < number.length; i++){
        if(number[i] === '۰'){res += '0'}
        else if(number[i] === '٠'){res += '0'}
        else if(number[i] === '۱'){res += '1'}
        else if(number[i] === '١'){res += '1'}
        else if(number[i] === '۲'){res += '2'}
        else if(number[i] === '٢'){res += '2'}
        else if(number[i] === '۳'){res += '3'}
        else if(number[i] === '٣'){res += '3'}
        else if(number[i] === '۴'){res += '4'}
        else if(number[i] === '٤'){res += '4'}
        else if(number[i] === '۵'){res += '5'}
        else if(number[i] === '٥'){res += '5'}
        else if(number[i] === '۶'){res += '6'}
        else if(number[i] === '٦'){res += '6'}
        else if(number[i] === '۷'){res += '7'}
        else if(number[i] === '٧'){res += '7'}
        else if(number[i] === '۸'){res += '8'}
        else if(number[i] === '٨'){res += '8'}
        else if(number[i] === '۹'){res += '9'}
        else if(number[i] === '٩'){res += '9'}
        else {
            res += number[i]
        }
    }
    number = res;
    if(number.indexOf('603799') === 0){return {className:'bank-meli',bankName:'ملی'}}
    if(number.indexOf('589210') === 0){return {className:'bank-sepah',bankName:'سپه'}}
    if(number.indexOf('627961') === 0){return {className:'bank-sanatmadan',bankName:'صنعت و معدن'}}
    if(number.indexOf('603770') === 0){return {className:'bank-keshavarsi',bankName:'کشاورزی'}}
    if(number.indexOf('628023') === 0){return {className:'bank-maskan',bankName:'مسکن'}}
    if(number.indexOf('627760') === 0){return {className:'bank-postbank',bankName:'پست بانک'}}
    if(number.indexOf('502908') === 0){return {className:'bank-tosehe',bankName:'توسعه'}}
    if(number.indexOf('627412') === 0){return {className:'bank-eghtesad',bankName:'اقتصاد نوین'}}
    if(number.indexOf('622106') === 0){return {className:'bank-parsian',bankName:'پارسیان'}}
    if(number.indexOf('502229') === 0){return {className:'bank-pasargad',bankName:'پاسارگاد'}}
    if(number.indexOf('627488') === 0){return {className:'bank-karafarin',bankName:'کار آفرین'}}
    if(number.indexOf('621986') === 0){return {className:'bank-saman',bankName:'سامان'}}
    if(number.indexOf('639346') === 0){return {className:'bank-sina',bankName:'سینا'}}
    if(number.indexOf('639607') === 0){return {className:'bank-sarmaye',bankName:'سرمایه'}}
    if(number.indexOf('502806') === 0){return {className:'bank-shahr',bankName:'شهر'}}
    if(number.indexOf('502938') === 0){return {className:'bank-day',bankName:'دی'}}
    if(number.indexOf('603769') === 0){return {className:'bank-saderat',bankName:'صادرات'}}
    if(number.indexOf('610433') === 0){return {className:'bank-mellat',bankName:'ملت'}}
    if(number.indexOf('627353') === 0){return {className:'bank-tejarat',bankName:'تجارت'}}
    if(number.indexOf('589463') === 0){return {className:'bank-refah',bankName:'رفاه'}}
    if(number.indexOf('627381') === 0){return {className:'bank-ansar',bankName:'انصار'}}
    if(number.indexOf('639370') === 0){return {className:'bank-mehreqtesad',bankName:'مهر اقتصاد'}}
    if(number.indexOf('639599') === 0){return {className:'bank-ghavamin',bankName:'قوامین'}}
    if(number.indexOf('504172') === 0){return {className:'bank-resalat',bankName:'رسالت'}}
    return {className:'',bankName:''}
}