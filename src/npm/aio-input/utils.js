import * as ReactDOMServer from 'react-dom/server';
import AIOPopup from 'aio-popup';
import $ from 'jquery';

export function getMainProperties(props,getProp,types){
    let p = getProp;
    let {type,rtl} = props;
    let value = p('value');
    let loading = p('loading');
    let disabled = p('disabled');
    let className = p('className');
    let style = p('style');
    let onClick = p('onClick',undefined,true);
    let attrs = {...p('attrs',{})};
    let justify = p('justify');
    if(className){attrs.className = className}
    if(style){attrs.style = style}
    if(onClick){attrs.onClick = onClick}
    let properties = {
        props:{...props},
        value,type,rtl,loading,disabled:loading || disabled,attrs,justify,
        onChange: p('onChange',undefined,true),
        text: p('text'),
        before: p('before'),after: p('after'),subtext: p('subtext'),label: p('label'),
        className: p('className'),style: p('style')
    }
    if(types.hasOption){
        properties = {
            ...properties,
            options:p('options'),
            optionText:p('optionText'),
            optionValue:p('optionValue'),
            optionAttrs:p('optionAttrs'),
            optionDisabled:p('optionDisabled'),
            optionClassName:p('optionClassName'),
            optionStyle:p('optionStyle'),
            optionShow:p('optionShow'),
            optionSubtext:p('optionSubtext'),
            optionCheckIcon:p('optionCheckIcon'),
            optionBefore:p('optionBefore'),
            optionAfter:p('optionAfter')
        }
    }
    if(types.isDropdown){
        properties = {...properties,caret: p('caret'),popover:p('popover')}
        if(types.hasOption){properties = {...properties,optionClose:p('optionClose'),onSwap:p('onSwap')}}
    }
    if(types.isInput){properties = {...properties,inputAttrs:p('inputAttrs'),blurChange:p('blurChange')}}
    if(types.hasPlaceholder){properties = {...properties,placeholder: p('placeholder')}}
    if(types.hasMultiple){properties = {...properties,multiple: p('multiple')}}
    if(types.hasSearch){properties = {...properties,search: p('search')}}
    if(types.hasKeyboard){properties = {...properties,maxLength: p('maxLength'),filter: p('filter'),justNumber: p('justNumber')}}
    if(type === 'number'){properties = {...properties,swip:p('swip'),spin:p('spin',true)}}
    else if(type === 'password'){properties = {...properties,visible:p('visible')}}
    else if(type === 'checkbox'){properties = {...properties,checkIcon:p('checkIcon'),checked:!!value}}
    else if(type === 'image'){properties = {...properties,preview:p('preview'),width:p('width'),height:p('height')}}
    else if(type === 'map'){properties = {...properties,onChangeAddress:p('onChangeAddress'),popup:p('popup'),mapConfig:p('mapConfig',{})}}
    else if(type === 'multiselect'){
        properties = {
            ...properties,
            optionTagAttrs:p('optionTagAttrs'),
            optionTagBefore:p('optionTagBefore'),
            optionTagAfter:p('optionTagAfter'),
            hideTags:p('hideTags')
        }
    }
    else if(type === 'datepicker'){
        properties = {
            ...properties,
            calendarType:p('calendarType','gregorian'),
            unit:p('unit','day'),
            theme:p('theme',[]),
            size:p('size',180),
            startYear:p('startYear','-10'),
            endYear:p('endYear','+10'),
            pattern:p('pattern'),
            dateDisabled:p('dateDisabled'),
            dateAttrs:p('dateAttrs'),
            remove:p('remove'),
            close:p('close')
        }
    }
    else if(type === 'time'){
        properties = {
            ...properties,
            calendarType:p('calendarType','gregorian')
        }
    }
    else if(type === 'list'){
        properties = {
            ...properties,
            size:p('size',48),
            width:p('width',200),
            decay:p('decay',8),
            stop:p('stop',3),
            count:p('count',3),
            move:p('move'),
            editable:p('editable',true)
        }
    }
    else if(type === 'slider'){
        properties = {
            ...properties,
            showValue:p('showValue'),
            lineStyle:p('lineStyle'),
            fillStyle:p('fillStyle'),
            pointStyle:p('pointStyle'),
            valueStyle:p('valueStyle'),
            labelStyle:p('labelStyle'),
            scaleStyle:p('scaleStyle'),
            getPointHTML:p('getPointHTML'),
            getScaleHTML:p('getScaleHTML'),
            direction:p('direction',rtl?'left':'right'),
            scaleStep:p('scaleStep'),
            labelStep:p('labelStep'),
            editLabel:p('editLabel'),
            start:p('start'),
            step:p('step'),
            end:p('end'),
            min:p('min'),
            max:p('max'),
            labelRotate:p('labelRotate'),
        }
    }
    else if(type === 'form'){
        properties = {
            ...properties,
            onClose:p('onClose'),
            onBack:p('onBack'),
            headerAttrs:p('headerAttrs',{}),
            subtitle:p('subtitle'),
            header:p('header'),
            footer:p('footer'),
            getErrors:p('getErrors'),
            footer:p('footer'),
            onSubmit:p('onSubmit'),
            footerAttrs:p('footerAttrs',{}),
            closeText:p('closeText','Close'),
            resetText:p('resetText','Reset'),
            submitText:p('submitText','Submit'),
            reset:p('reset'),
            inputs:p('inputs'),
            inputClassName:p('inputClassName'),
            inputStyle:p('inputStyle',{}),
            labelAttrs:p('labelAttrs'),
            lang:p('lang','en'),
            updateInput:p('updateInput',(o)=>o),
            initialDisabled:p('initialDisabled',true)
        }
    }
    else if(type === 'table'){
        properties = {
            ...properties,
            columns:p('columns',[]),
            getValue:p('getValue',{}),
            rowAttrs:p('rowAttrs'),
            toolbar:p('toolbar'),
            excel:p('excel'),
            toolbarAttrs:p('toolbarAttrs'),
            paging:p('paging'),
            rowGap:p('rowGap'),
            columnGap:p('columnGap'),
            onAdd:p('onAdd'),
            onRemove:p('onRemove'),
            onSearch:p('onSearch'),
            onSwap:p('onSwap'),
            onChangeSort:p('onChangeSort'),
            headerAttrs:p('headerAttrs'),
            rowTemplate:p('rowTemplate'),
            rowsTemplate:p('rowsTemplate'),
            rowAfter:p('rowAfter'),
            rowBefore:p('rowBefore')
        }
    }
    //if(type === 'datepicker'){debugger}
    return {...properties}
}
export function Search(items,searchValue,getValue = (o) =>o){if(!searchValue){return items}function isMatch(keys,value){for(let i = 0; i < keys.length; i++){if(value.indexOf(keys[i]) === -1){return false}} return true}let keys = searchValue.split(' ');return items.filter((o,i)=>isMatch(keys,getValue(o,i)))}
export function ExportToExcel(rows,config = {}){let {promptText = 'Inter Excel File Name'} = config;let o = {fixPersianAndArabicNumbers (str){if(typeof str !== 'string'){return str} let persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g],arabicNumbers  = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g]; for(var i=0; i<10; i++){str = str.replace(persianNumbers[i], i).replace(arabicNumbers[i], i);}return str;},getJSON(rows){let result = [];for (let i = 0; i < rows.length; i++) {let json = rows[i],fixedJson = {};for(let prop in json){fixedJson[prop] = this.fixPersianAndArabicNumbers(json[prop])} result.push(fixedJson);}return result;},export() {let name = window.prompt(promptText);if (!name || name === null || !name.length) {return};var data = this.getJSON(rows);var arrData = typeof data != "object" ? JSON.parse(data) : data;var CSV = "";CSV += '\r\n\n';if (true) {let row = "";for (let index in arrData[0]) { row += index + ","; }row = row.slice(0, -1);CSV += row + "\r\n";}for (var i = 0; i < arrData.length; i++) {let row = "";for (let index in arrData[i]) { row += '"' + arrData[i][index] + '",'; }row.slice(0, row.length - 1);CSV += row + "\r\n";}if (CSV === "") { alert("Invalid data"); return; }var fileName = name.replace(/ /g, "_");var universalBOM = "\uFEFF";var uri = "data:text/csv;charset=utf-8," + encodeURIComponent(universalBOM + CSV);var link = document.createElement("a");link.href = uri;link.style = "visibility:hidden";link.download = fileName + ".csv";document.body.appendChild(link);link.click();document.body.removeChild(link);}}; return o.export();}
export async function DownloadUrl(url, name) {fetch(url, {mode: 'no-cors',}).then(resp => resp.blob()).then(blob => {let url = window.URL.createObjectURL(blob);let a = document.createElement('a');a.style.display = 'none';a.href = url;a.download = name;document.body.appendChild(a);a.click();window.URL.revokeObjectURL(url);}).catch(() => alert('oh no!'));}
export function JSXToHTML(html){return ReactDOMServer.renderToStaticMarkup(html)}
export function getDistance(p1, p2) {
    let { lat: lat1, lng: lon1 } = p1;
    let { lat: lat2, lng: lon2 } = p2;
    let rad = Math.PI / 180;
    let radius = 6371; //earth radius in kilometers
    return Math.acos(Math.sin(lat2 * rad) * Math.sin(lat1 * rad) + Math.cos(lat2 * rad) * Math.cos(lat1 * rad) * Math.cos(lon2 * rad - lon1 * rad)) * radius; //result in Kilometers
}
export class AIOInputValidate {
    constructor(props) {
        this.props = props;
        let error = this.getError()
        if (error && !$('.aio-popup-alert-container').length) {
            let subtext;
            try {subtext = JSON.stringify(props);} catch {subtext = '';}
            new AIOPopup().addAlert({ text: error, type: 'error', subtext })
        }
    }
    varTypes = {'object': true, 'array': true, 'string': true, 'number': true, 'boolean': true, 'undefined': true, 'any': true, 'function': true, 'null': true}
    titr = 'aio-input error =>';
    getTypes = () => {
        return [
            'text', 'number', 'textarea', 'color', 'password', 'file', 'image', 'select', 'multiselect', 'table', 'form',
            'time', 'datepicker', 'list', 'checkbox', 'radio', 'tabs', 'slider', 'button', 'map'
        ]
    }
    getType = (v) => {
        if (Array.isArray(v)) { return 'array' }
        return v === null?'undefined':typeof v;
    }
    checkTypes = (value, types) => {
        if (types === 'any') { return }
        types = types.split('|');
        let res;
        let passed = false;
        for (let i = 0; i < types.length; i++) {
            let type = types[i];
            let error = this.checkType(value, type, types)
            if (error) { res = error }
            else { passed = true }
        }
        if (!passed) { return res }
    }
    checkType = (value, type, types) => {
        let res = false,valueType = this.getType(value);
        if (this.varTypes[type]) {if (valueType === type) { res = true }}
        else {
            let typeString;
            try { typeString = JSON.parse(type) } catch { typeString = type }
            if (value === typeString) { res = true }
        }
        if (res === false) {
            let res;
            try { res = JSON.stringify(value) } catch { res = value }
            return `should be ${types.join('|')} but is ${res}`
        }
    }
    getError = () => {
        let types = this.getTypes();
        let { type } = this.props;
        if (types.indexOf(type) === -1) { return `${this.titr} ${type} is invalid type` }
        let error = this.getMessage(type);
        if (error) { return error }
    }
    getValidateObject = (type) => {
        let options = 'array|undefined', optionText = 'any', optionValue = 'any', optionBefore = 'any', optionAfter = 'any', optionSubtext = 'any', optionDisabled = 'any', optionAttrs = 'any', optionCheckIcon = 'any',optionClassName = 'any',optionStyle = 'any';
        let style = 'function|object|undefined',disabled = 'boolean|undefined',subtext = 'number|string|function';
        let dic = {
            text: {
                type: '"text"', value: 'string|number|undefined',inputAttrs: "object|undefined",placeholder: 'any',
                options, optionText, optionValue, optionBefore, optionAfter, optionSubtext, optionDisabled, optionAttrs, optionCheckIcon,optionClassName,optionStyle,
                justNumber: "boolean|array|undefined", maxLength: 'number|undefined', filter: 'array',
                before: 'any', after: 'any', subtext,caret: 'any',popover: 'object|undefined',disabled, loading: 'any',
            },
            textarea: {
                type: '"textarea"', value: 'string|number|undefined',maxLength: 'number|undefined',popover: 'object|undefined',filter:'array',
                options, optionText, optionValue, optionBefore, optionAfter, optionSubtext, optionDisabled, optionAttrs, optionCheckIcon,optionClassName,optionStyle,
                inputAttrs: "object|undefined",disabled,placeholder: 'any',caret: 'any',before: 'any', after: 'any', subtext,loading: 'any',
            },
            number: {
                type: '"number"',swip: 'boolean|undefined',popover: 'object|undefined',placeholder: 'any',
                options, optionText, optionValue, optionBefore, optionAfter, optionSubtext, optionDisabled, optionAttrs, optionCheckIcon,optionClassName,optionStyle,
                inputAttrs: "object|undefined",value: '""|number|undefined',caret: 'any',before: 'any', after: 'any', subtext,disabled, loading: 'any',
            },
            radio: {
                type: '"radio"', value: 'any',multiple: 'boolean|undefined',before: 'any', after: 'any', subtext,disabled, loading: 'any',
                options, optionText, optionValue, optionBefore, optionAfter, optionSubtext, optionDisabled, optionAttrs, optionCheckIcon,optionClassName,optionStyle
            },
            tabs: {
                type: '"tabs"', value: 'any',before: 'any', after: 'any', subtext,disabled, loading: 'any',
                options, optionText, optionValue, optionBefore, optionAfter, optionSubtext, optionDisabled, optionAttrs, optionCheckIcon,optionClassName,optionStyle
            },
            multiselect: {
                type: '"multiselect"', value: 'array|undefined',before: 'any', after: 'any', subtext,text: 'any',
                options, optionText, optionValue, optionBefore, optionAfter, optionSubtext, optionDisabled, optionAttrs, optionCheckIcon,optionClassName,optionStyle,
                popover: 'object|undefined',hideTags: 'boolean|undefined',search: 'boolean|undefined',onSwap:'function|undefined',
                caret: 'any',disabled, loading: 'any',optionTagBefore: 'any', optionTagAfter: 'any', optionTagAttrs: 'any',
            },
            password: {
                type: '"password"', value: 'string|number|undefined',filter: 'array',disabled, loading: 'any',
                before: 'any', after: 'any', subtext,visible: 'boolean|undefined',placeholder: 'any',
                inputAttrs: "object|undefined",justNumber: "boolean|array|undefined",maxLength: 'number|undefined'
            },
            color: {
                type: '"color"', value: 'string|number|undefined',
                options, optionText, optionValue, optionAttrs,
                inputAttrs: "object|undefined",before: 'any', after: 'any', subtext,disabled, loading: 'any',
            },
            checkbox: {
                type: '"checkbox"', value: 'boolean|undefined',
                before: 'any', after: 'any', subtext,disabled, loading: 'any',checkIcon: 'any',
            },
            select: {
                type: '"select"', value: 'number|string|undefined',
                caret: 'any',placeholder: 'any',
                search: 'boolean|undefined',disabled, loading: 'any',
                before: 'any', after: 'any', subtext,popover: 'object|undefined',onSwap: 'function|undefined',
                options, optionText, optionValue, optionBefore, optionAfter, optionSubtext, optionDisabled, optionAttrs, optionCheckIcon,optionClassName,optionStyle
            },
            file: {
                type: '"file"', value: 'any',multiple: 'boolean',before: 'any', after: 'any', subtext,
                inputAttrs: "object|undefined",disabled, loading: 'any',justify:'boolean|undefined',
            },
            slider: {
                value: 'number|array|undefined',type: '"slider"',before: 'any', after: 'any',
                start: 'number|undefined', step: 'number|undefined', end: 'number|undefined', min: 'number|undefined', max: 'number|undefined',
                disabled, loading: 'any',showValue: 'boolean|"inline"|undefined',
                lineStyle: style, fillStyle: style, pointStyle: style, valueStyle: style, labelStyle: style, scaleStyle: style,
                multiple: 'boolean|undefined',getPointHTML: 'function|undefined',getScaleHTML: 'function|undefined',
                direction: '"left"|"right"|"top"|"bottom"|undefined',labelStep: 'number|array|undefined',
                scaleStep: 'number|array|undefined',editLabel: 'function|undefined',labelRotate: 'number|function|undefined'
            },
            form: {
                type: '"form"',inputs: 'object',value: 'object',disabled,inputClassName: 'string|function|undefined',inputStyle: style,submitText:'string|undefined',closeText:'string|undefined',
                labelAttrs: 'object|function|undefined',lang: '"en"|"fa"|undefined',updateInput: 'function|undefined',onSubmit:'function|undefined',resetText:'string|undefined',
                footer:'function|undefined',initialDisabled:'boolean|undefined'
            },
            datepicker: {
                type: '"datepicker"', value: 'any',caret: 'any',popover: 'object|undefined',
                before: 'any', after: 'any', subtext,placeholder: 'any',disabled, loading: 'any',
                calendarType: '"jalali"|"gregorian"|undefined', unit: '"month"|"day"|"hour"', theme: 'array|undefined', size: 'number|undefined', startYear: 'string|number|undefined', endYear: 'string|number|undefined',
                pattern: 'string|undefined',dateDisabled: 'array|undefined',dateAttrs: 'function|undefined',remove: 'boolean|undefined'
            },
            image: {
                type: '"image"', value: 'object|undefined',before: 'any', after: 'any', subtext,
                placeholder: 'any',attrs: 'object|undefined',preview: 'boolean|undefined',disabled, loading: 'any',
                width: 'string|number|undefined', height: 'string|number|undefined',
            },
            time: {type: '"time"', value: 'object|undefined',before: 'any', after: 'any', subtext,disabled, loading: 'any',calendarType:'jalali|gregorian'},
            button: {
                type: '"button"', value: 'any',before: 'any', after: 'any', subtext,onClick:'function|undefined',
                disabled, loading: 'any',caret: 'any',justify: 'boolean|undefined',popover: 'object|undefined',
            },
            list: {
                type: '"list"', value: 'any',options: 'array',
                size: 'number|undefined',width: 'number|undefined',decay: 'number|undefined',stop: 'number|undefined',
            },
            table: {
                type: '"table"', value: 'array|undefined',placeholder: 'any',onChangeSort: 'function|undefined',
                columns: 'array|undefined',onSwap: 'function|undefined|true',getValue: 'object|undefined',
                rowAttrs: 'function|undefined',excel: 'boolean|string|undefined',
                toolbar: 'any', toolbarAttrs: 'function|object|undefined',
                disabled, loading: 'any',paging: 'object|undefined',
                rowGap: 'number|undefined', columnGap: 'number|undefined',
                onAdd: 'function|object|undefined', onRemove: 'function|boolean|undefined',
                onSearch: 'function|boolean|undefined',headerAttrs: 'function|object|undefined',
                rowTemplate: 'function|undefined', rowsTemplate: 'function|undefined',
                rowAfter: 'function|undefined', rowBefore: 'function|undefined'
            },
            map: {
                type: '"map"', value: 'object|undefined',onChangeAddress: 'function|undefined',
                popup: 'object|undefined',mapConfig: 'object|undefined',before: 'any', after: 'any', subtext,disabled, loading: 'any'
            }
        }
        let privateObject = dic[type];
        if (!privateObject) { return }
        let publicObject = {
            attrs: 'object|undefined', onChange: 'function|undefined', rtl: 'boolean|undefined', justify: 'boolean|undefined',
            className:'string|undefined',style:'object|undefined',text:'any'
        }
        return { ...publicObject, ...privateObject }
    }
    getMessage = (type) => {
        let validProps = this.getValidateObject(type)
        if (!validProps) { return `${type} validator is not implement` }
        for (let prop in this.props) {
            if (!validProps[prop]) { return `${this.titr} in type="${type}", ${prop} is invalid props` }
            let error = this.checkTypes(this.props[prop], validProps[prop])
            if (error) {
                return `${this.titr} in type="${type}", ${prop} props ${error}`
            }
        }
    }
} 
export function getFormInputs(fields,path){
    function getInput(input){return typeof input === 'string'?getFormInput(input,path):input}
    return fields.map((o)=>Array.isArray(o)?{row:o.map((oo)=>getInput(oo))}:getInput(o))
}
export function getFormInput(Field,path){
    function getOptions(field,path){
        return {
            militaryservice:()=>['مشمول','معاف','پایان خدمت'],gender:()=>['مرد','زن'],married:()=>['مجرد','متاهل'],state:()=>Object.keys(getCities()),
            city:()=>(value)=>{
                let state;
                try{eval(`state = value${path?'.' + path:''}.state`)} catch{}
                return !state?[]:getCities()[state]
            },
            
        }[field]()
    }
    function getField(field){return `value${path?`.${path}`:''}.${field}`}
    function getBase(field){
        let list = field.split('_');
        if(list.length === 3){return {field:list[0],input:{type:list[1]},label:list[2],extra:{}}}
        let {input,label,extra = {}} = {
            fullname:{input:{type:'text'},label:'نام و نام خانوادگی'},
            firstname:{input:{type:'text'},label:'نام'},
            lastname:{input:{type:'text'},label:'نام خانوادگی'},
            username:{input:{type:'text'},label:'نام کاربری'},
            address:{input:{type:'textarea'},label:'آدرس'},
            email:{input:{type:'text'},label:'ایمیل'},
            father:{input:{type:'text'},label:'نام پدر'},
            phone:{input:{type:'text',maxLength:11,justNumber:true},label:'شماره تلفن'},
            mobile:{input:{type:'text',maxLength:11,justNumber:true},label:'شماره همراه'},
            postal:{input:{type:'text',justNumber:true},label:'کد پستی'},
            nationalcode:{input:{type:'text',maxLength:10,justNumber:true},label:'کد ملی'},
            idnumber:{input:{type:'text'},label:'شماره شناسنامه'}, 
            cardbank:{input:{type:'text',justNumber:true,maxLength:16},label:'شماره کارت'},
            state:{input:{type:'select'},label:'استان'},
            city:{input:{type:'select'},label:'شهر'},
            gender:{input:{type:'radio'},label:'جنسیت'},
            married:{input:{type:'radio'},label:'وضعیت تاهل'},
            password:{input:{type:'password'},label:'رمز عبور'},
            repassword:{
                input:{type:'password'},label:'تکرار رمز عبور',
                extra:{validations:[['=',getField('password'),{message:'تکرار رمز صحیح نیست'}]],show:`!!${getField('password')}`}
            },
            militaryservice:{input:{type:'radio'},label:'وضعیت خدمت'},
            location:{
                input:{
                    type:'map',mapConfig:{draggable:false,zoomable:false,showAddress:false},
                    popup:{mapConfig:{search:true,title:'ثبت موقعیت جغرافیایی',zoomable:true,draggable:true}},
                    style:{height:90,minHeight:90}
                },
                label:'موقعیت جغرافیایی',extra:{addressField:getField('address')}
            }, 
        }[field];
        return {input,label,extra,field}
    }
    let required = false;
    if(Field.indexOf('*') === 0){Field = Field.slice(1,Field.length); required = true}
    let {input,label,extra,field} = getBase(Field);
    let inputProps = {...input}
    if(['select','radio'].indexOf(input.type) !== -1){inputProps = {...inputProps,optionText:'option',optionValue:'option',options:getOptions(field,path)}}
    if(['select'].indexOf(input.type) !== -1){inputProps = {...inputProps,popover:{fitHorizontal:true}}}
    return {field:`value${path?`.${path}`:''}.${field}`,validations:required?[['required']]:undefined,label,input:inputProps,...extra}     
}
function getCities() {
    return {
        "آذربایجان شرقی": ["اسکو", "اهر", "ایلخچی", "آبش احمد", "آذرشهر", "آقکند", "باسمنج", "بخشایش", "بستان آباد", "بناب", "بناب جدید", "تبریز", "ترک", "ترکمانچای", "تسوج", "تیکمه داش", "جلفا", "خاروانا", "خامنه", "خراجو", "خسروشهر", "خضرلو", "خمارلو", "خواجه", "دوزدوزان", "زرنق", "زنوز", "سراب", "سردرود", "سهند", "سیس", "سیه رود", "شبستر", "شربیان", "شرفخانه", "شندآباد", "صوفیان", "عجب شیر", "قره آغاج", "کشکسرای", "کلوانق", "کلیبر", "کوزه کنان", "گوگان", "لیلان", "مراغه", "مرند", "ملکان", "ملک کیان", "ممقان", "مهربان", "میانه", "نظرکهریزی", "هادی شهر", "هرگلان", "هریس", "هشترود", "هوراند", "وایقان", "ورزقان", "یامچی"],
        "آذربایجان غربی": ["ارومیه", "اشنویه", "ایواوغلی", "آواجیق", "باروق", "بازرگان", "بوکان", "پلدشت", "پیرانشهر", "تازه شهر", "تکاب", "چهاربرج", "خوی", "دیزج دیز", "ربط", "سردشت", "سرو", "سلماس","سیلوانه", "سیمینه", "سیه چشمه", "شاهین دژ", "شوط", "فیرورق", "قره ضیاءالدین", "قطور", "قوشچی", "کشاورز", "گردکشانه", "ماکو", "محمدیار", "محمودآباد", "مهاباد", "میاندوآب","میرآباد", "نالوس", "نقده", "نوشین"],
        "اردبیل": ["اردبیل", "اصلاندوز", "آبی بیگلو", "بیله سوار", "پارس آباد", "تازه کند", "تازه کندانگوت", "جعفرآباد", "خلخال", "رضی", "سرعین", "عنبران", "فخرآباد", "کلور", "کوراییم","گرمی", "گیوی", "لاهرود", "مشگین شهر", "نمین", "نیر", "هشتجین", "هیر"],
        "اصفهان": ["ابریشم", "ابوزیدآباد", "اردستان", "اژیه", "اصفهان", "افوس", "انارک", "ایمانشهر", "آران وبیدگل", "بادرود", "باغ بهادران", "بافران", "برزک", "برف انبار", "بهاران شهر", "بهارستان", "بوئین و میاندشت", "پیربکران", "تودشک", "تیران", "جندق", "جوزدان", "جوشقان و کامو", "چادگان", "چرمهین", "چمگردان", "حبیب آباد", "حسن آباد", "حنا", "خالدآباد", "خمینی شهر", "خوانسار", "خور", "خورزوق", "داران", "دامنه", "درچه", "دستگرد", "دهاقان", "دهق", "دولت آباد", "دیزیچه", "رزوه", "رضوانشهر", "زاینده رود", "زرین شهر", "زواره", "زیباشهر", "سده لنجان", "سفیدشهر", "سگزی", "سمیرم", "شاهین شهر", "شهرضا", "طالخونچه", "عسگران", "علویجه", "فرخی", "فریدونشهر", "فلاورجان", "فولادشهر", "قمصر", "قهجاورستان", "قهدریجان", "کاشان", "کرکوند", "کلیشاد و سودرجان", "کمشچه", "کمه", "کهریزسنگ", "کوشک", "کوهپایه", "گرگاب", "گزبرخوار", "گلپایگان", "گلدشت", "گلشهر", "گوگد", "لای بید", "مبارکه", "مجلسی", "محمدآباد", "مشکات", "منظریه", "مهاباد", "میمه", "نائین", "نجف آباد", "نصرآباد", "نطنز", "نوش آباد", "نیاسر", "نیک آباد", "هرند", "ورزنه", "ورنامخواست", "وزوان", "ونک"],
        "البرز": ["اسارا", "اشتهارد", "تنکمان","تهران دشت", "چهارباغ","ساوجبلاغ", "سعید آباد", "شهر جدید هشتگرد", "طالقان","فردیس", "کرج","کردان", "کمال شهر", "کوهسار", "گرمدره","گلبهار", "ماهدشت", "محمدشهر", "مشکین دشت", "نظرآباد", "هشتگرد"],
        "ایلام": ["ارکواز","ایلام","ایوان","آبدانان","آسمان آباد","بدره","پهله","توحید","چوار","دره شهر","دلگشا","دهلران","زرنه","سراب باغ","سرابله","صالح آباد","لومار","مهران","مورموری","موسیان","میمه" ],
        "بوشهر": ["امام حسن","انارستان","اهرم","آب پخش","آبدان","برازجان","بردخون","بندردیر","بندردیلم","بندرریگ","بندرکنگان","بندرگناوه","بنک","بوشهر","تنگ ارم","جم","چغادک","خارک","خورموج","دالکی","دلوار","ریز","سعدآباد","سیراف","شبانکاره","شنبه","عسلویه","کاکی","کلمه","نخل تقی","وحدتیه"],
        "تهران":["ارجمند","اسلامشهر","اندیشه","آبسرد","آبعلی","باغستان","باقرشهر","بومهن","پاکدشت","پردیس","پرند","پیشوا","تهران","جوادآباد","چهاردانگه","حسن آباد","دماوند","دیزین","شهر ری","رباط کریم","رودهن","شاهدشهر","شریف آباد","شمشک","شهریار","صالح آباد","صباشهر","صفادشت","فردوسیه","فشم","فیروزکوه","قدس","قرچک","قیامدشت","کهریزک","کیلان","گلستان","لواسان","مارلیک","ملارد","میگون","نسیم شهر","نصیرآباد","وحیدیه","ورامین"],
        "چهارمحال و بختیاری": ["اردل","آلونی","باباحیدر","بروجن","بلداجی","بن","جونقان","چلگرد","سامان","سفیددشت","سودجان","سورشجان","شلمزار","شهرکرد","طاقانک","فارسان","فرادنبه","فرخ شهر","کیان","گندمان","گهرو","لردگان","مال خلیفه","ناغان","نافچ","نقنه","هفشجان"],
        "خراسان جنوبی": ["ارسک","اسدیه","اسفدن","اسلامیه","آرین شهر","آیسک","بشرویه","بیرجند","حاجی آباد","خضری دشت بیاض","خوسف","زهان","سرایان","سربیشه","سه قلعه","شوسف","طبس ","فردوس","قاین","قهستان","محمدشهر","مود","نهبندان","نیمبلوک"],
        "خراسان رضوی": ["احمدآباد صولت","انابد","باجگیران","باخرز","بار","بایگ","بجستان","بردسکن","بیدخت","بینالود","تایباد","تربت جام","تربت حیدریه","جغتای","جنگل","چاپشلو","چکنه","چناران","خرو","خلیل آباد","خواف","داورزن","درگز","در رود","دولت آباد","رباط سنگ","رشتخوار","رضویه","روداب","ریوش","سبزوار","سرخس","سفیدسنگ","سلامی","سلطان آباد","سنگان","شادمهر","شاندیز","ششتمد","شهرآباد","شهرزو","صالح آباد","طرقبه","عشق آباد","فرهادگرد","فریمان","فیروزه","فیض آباد","قاسم آباد","قدمگاه","قلندرآباد","قوچان","کاخک","کاریز","کاشمر","کدکن","کلات","کندر","گلمکان","گناباد","لطف آباد","مزدآوند","مشهد","ملک آباد","نشتیفان","نصرآباد","نقاب","نوخندان","نیشابور","نیل شهر","همت آباد","یونسی" ],
        "خراسان شمالی": ["اسفراین","ایور","آشخانه","بجنورد","پیش قلعه","تیتکانلو","جاجرم","حصارگرمخان","درق","راز","سنخواست","شوقان","شیروان","صفی آباد","فاروج","قاضی","گرمه","لوجلی"],
        "خوزستان": ["اروندکنار","الوان","امیدیه","اندیمشک","اهواز","ایذه","آبادان","آغاجاری","باغ ملک","بستان","بندرامام خمینی","بندرماهشهر","بهبهان","ترکالکی","جایزان","چمران","چویبده","حر","حسینیه","حمزه","حمیدیه","خرمشهر","دارخوین","دزآب","دزفول","دهدز","رامشیر","رامهرمز","رفیع","زهره","سالند","سردشت","سوسنگرد","شادگان","شاوور","شرافت","شوش","شوشتر","شیبان","صالح شهر","صفی آباد","صیدون","قلعه تل","قلعه خواجه","گتوند","لالی","مسجدسلیمان","ملاثانی","میانرود","مینوشهر","هفتگل","هندیجان","هویزه","ویس"],
        "زنجان": ["ابهر","ارمغان خانه","آب بر","چورزق","حلب","خرمدره","دندی","زرین آباد","زرین رود","زنجان","سجاس","سلطانیه","سهرورد","صائین قلعه","قیدار","گرماب","ماه نشان","هیدج"],
        "سمنان": ["امیریه","ایوانکی","آرادان","بسطام","بیارجمند","دامغان","درجزین","دیباج","سرخه","سمنان","شاهرود","شهمیرزاد","کلاته خیج","گرمسار","مجن","مهدی شهر","میامی"],
        "سیستان و بلوچستان": ["ادیمی","اسپکه","ایرانشهر","بزمان","بمپور","بنت","بنجار","پیشین","جالق","چابهار","خاش","دوست محمد","راسک","زابل","زابلی","زاهدان","زهک","سراوان","سرباز","سوران","سیرکان","علی اکبر","فنوج","قصرقند","کنارک","گشت","گلمورتی","محمدان","محمدآباد","محمدی","میرجاوه","نصرت آباد","نگور","نوک آباد","نیک شهر","هیدوچ"],
        "فارس": ["اردکان","ارسنجان","استهبان","اشکنان","افزر","اقلید","امام شهر","اهل","اوز","ایج","ایزدخواست","آباده","آباده طشک","باب انار","بالاده","بنارویه","بهمن","بوانات","بیرم","بیضا","جنت شهر","جهرم","جویم","زرین دشت","حسن آباد","خان زنیان","خاوران","خرامه","خشت","خنج","خور","داراب","داریان","دبیران","دژکرد","دهرم","دوبرجی","رامجرد","رونیز","زاهدشهر","زرقان","سده","سروستان","سعادت شهر","سورمق","سیدان","ششده","شهرپیر","شهرصدرا","شیراز","صغاد","صفاشهر","علامرودشت","فدامی","فراشبند","فسا","فیروزآباد","قائمیه","قادرآباد","قطب آباد","قطرویه","قیر","کارزین (فتح آباد)","کازرون","کامفیروز","کره ای","کنارتخته","کوار","گراش","گله دار","لار","لامرد","لپویی","لطیفی","مبارک آباددیز","مرودشت","مشکان","مصیری","مهر","میمند","نوبندگان","نوجین","نودان","نورآباد","نی ریز","وراوی"],
        "قزوین": ["ارداق","اسفرورین","اقبالیه","الوند","آبگرم","آبیک","آوج","بوئین زهرا","بیدستان","تاکستان","خاکعلی","خرمدشت","دانسفهان","رازمیان","سگزآباد","سیردان","شال","شریفیه","ضیاآباد","قزوین","کوهین","محمدیه","محمودآباد نمونه","معلم کلایه","نرجه"],
        "قم": ["جعفریه","دستجرد","سلفچگان","قم","قنوات","کهک"],
        "کردستان": ["آرمرده","بابارشانی","بانه","بلبان آباد","بوئین سفلی","بیجار","چناره","دزج","دلبران","دهگلان","دیواندره","زرینه","سروآباد","سریش آباد","سقز","سنندج","شویشه","صاحب","قروه","کامیاران","کانی دینار","کانی سور","مریوان","موچش","یاسوکند"],
        "کرمان": ["اختیارآباد","ارزوئیه","امین شهر","انار","اندوهجرد","باغین","بافت","بردسیر","بروات","بزنجان","بم","بهرمان","پاریز","جبالبارز","جوپار","جوزم","جیرفت","چترود","خاتون آباد","خانوک","خورسند","درب بهشت","دهج","رابر","راور","راین","رفسنجان","رودبار","ریحان شهر","زرند","زنگی آباد","زیدآباد","سیرجان","شهداد","شهربابک","صفائیه","عنبرآباد","فاریاب","فهرج","قلعه گنج","کاظم آباد","کرمان","کشکوئیه","کهنوج","کوهبنان","کیانشهر","گلباف","گلزار","لاله زار","ماهان","محمدآباد","محی آباد","مردهک","مس سرچشمه","منوجان","نجف شهر","نرماشیر","نظام شهر","نگار","نودژ","هجدک","یزدان شهر"],
        "کرمانشاه": ["ازگله","اسلام آباد غرب","باینگان","بیستون","پاوه","تازه آباد","جوان رود","حمیل","ماهیدشت","روانسر","سرپل ذهاب","سرمست","سطر","سنقر","سومار","شاهو","صحنه","قصرشیرین","کرمانشاه","کرندغرب","کنگاور","کوزران","گهواره","گیلانغرب","میان راهان","نودشه","نوسود","هرسین","هلشی"],
        "کهگیلویه و بویراحمد": ["باشت","پاتاوه","چرام","چیتاب","دهدشت","دوگنبدان","دیشموک","سوق","سی سخت","قلعه رئیسی","گراب سفلی","لنده","لیکک","مادوان","مارگون","یاسوج"],
        "گلستان": ["انبارآلوم","اینچه برون","آزادشهر","آق قلا","بندرترکمن","بندرگز","جلین","خان ببین","دلند","رامیان","سرخنکلاته","سیمین شهر","علی آباد کتول","فاضل آباد","کردکوی","کلاله","گالیکش","گرگان","گمیش تپه","گنبدکاووس","مراوه","مینودشت","نگین شهر","نوده خاندوز","نوکنده"],
        "لرستان": ["ازنا","اشترینان","الشتر","الیگودرز","بروجرد","پلدختر","چالانچولان","چغلوندی","چقابل","خرم آباد","درب گنبد","دورود","زاغه","سپیددشت","سراب دوره","فیروزآباد","کونانی","کوهدشت","گراب","معمولان","مومن آباد","نورآباد","ویسیان"],
        "گیلان": ["احمدسرگوراب","اسالم","اطاقور","املش","آستارا","آستانه اشرفیه","بازار جمعه","بره سر","بندرانزلی","پره سر","پیربازار","تالش","توتکابن","جیرنده","چابکسر","چاف و چمخاله","چوبر","حویق","خشکبیجار","خمام","دیلمان","زیباکنار","رانکوه","رحیم آباد","رستم آباد","رشت","رضوانشهر","رودبار","رودبنه","رودسر","سنگر","سیاهکل","شفت","شلمان","صومعه سرا","فومن","کلاچای","کوچصفهان","کومله","کیاشهر","گوراب زرمیخ","لاهیجان","لشت نشا","لنگرود","لوشان","لولمان","لوندویل","لیسار","ماسال","ماسوله","مرجقل","منجیل","واجارگاه"],
        "مازندران": ["امیرکلا","ایزدشهر","آلاشت","آمل","بابل","بابلسر","بلده","بهشهر","بهنمیر","پل سفید","تنکابن","جویبار","چالوس","چمستان","خرم آباد","خلیل شهر","خوش رودپی","دابودشت","رامسر","رستمکلا","رویان","رینه","زرگرمحله","زیرآب","سادات شهر","ساری","سرخرود","سلمان شهر","سورک","شیرگاه","شیرود","عباس آباد","فریدونکنار","فریم","قائم شهر","کتالم","کلارآباد","کلاردشت","کله بست","کوهی خیل","کیاسر","کیاکلا","گتاب","گزنک","گلوگاه","محمودآباد","مرزن آباد","مرزیکلا","نشتارود","نکا","نور","نوشهر"],
        "مرکزی": ["اراک","آستانه","آشتیان","پرندک","تفرش","توره","جاورسیان","خشکرود","خمین","خنداب","داودآباد","دلیجان","رازقان","زاویه","ساروق","ساوه","سنجان","شازند","غرق آباد","فرمهین","قورچی باشی","کرهرود","کمیجان","مامونیه","محلات","مهاجران","میلاجرد","نراق","نوبران","نیمور","هندودر"],
        "هرمزگان": ["ابوموسی","بستک","بندرجاسک","بندرچارک","بندرخمیر","بندرعباس","بندرلنگه","بیکا","پارسیان","تخت","جناح","حاجی آباد","درگهان","دهبارز","رویدر","زیارتعلی","سردشت","سندرک","سوزا","سیریک","فارغان","فین","قشم","قلعه قاضی","کنگ","کوشکنار","کیش","گوهران","میناب","هرمز","هشتبندی"],
        "همدان": ["ازندریان","اسدآباد","برزول","بهار","تویسرکان","جورقان","جوکار","دمق","رزن","زنگنه","سامن","سرکان","شیرین سو","صالح آباد","فامنین","فرسفج","فیروزان","قروه درجزین","قهاوند","کبودر آهنگ","گل تپه","گیان","لالجین","مریانج","ملایر","نهاوند","همدان"],
        "یزد": ["ابرکوه","احمدآباد","اردکان","اشکذر","بافق","بفروئیه","بهاباد","تفت","حمیدیا","خضرآباد","دیهوک","رضوانشهر","زارچ","شاهدیه","طبس","عقدا","مروست","مهردشت","مهریز","میبد","ندوشن","نیر","هرات","یزد"]
    }  
}