export default function getCardDetail(number = ''){
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