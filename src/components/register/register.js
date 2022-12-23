import React,{Component,createRef} from 'react';
import RVD from './../../interfaces/react-virtual-dom/react-virtual-dom';
import storeSvg from '../../utils/svgs/store-svg';
import Form from './../../interfaces/aio-form-react/aio-form-react';
import Axios from 'axios';
import Map from './../map/map';
import getSvg from '../../utils/getSvg';
import {Icon} from '@mdi/react';
import {mdiInformation} from '@mdi/js';
import allCities from './cities';
import provinces from './provinces';
import $ from 'jquery';

export default class Register extends Component{
    constructor(props){
        super(props);
        this.dom = createRef();
        let {model} = props;
        let {
            latitude,longitude,cardCode = '',firstName = '',lastName = '',
            phoneNumber,//دیفالت ندارد و همیشه باید مقدارش ارسال بشه
            storeName = '',address = '',userProvince = '',userCity = '',landline = '',password = ''
        } = model;
        latitude = 35.699739;
        latitude = isNaN(parseFloat(latitude))?35.699739:parseFloat(latitude);
        longitude = isNaN(parseFloat(longitude))?35.699739:parseFloat(longitude);
        this.cities = allCities.filter(({province})=>province === userProvince)
        this.state = {
            prevProvince:userProvince,
            model:{latitude,cardCode,longitude,firstName,lastName,phoneNumber,storeName,address,userProvince,userCity,landline,password,re_password:password},
            showMap:false,
            errors:[]
        }
    }
    onClose(){
        let {onClose} = this.props;
        $(this.dom.current).animate({
            height: '0%',
            width: '0%',
            left:'50%',
            top:'100%',
            opacity:0
        }, 300,()=>onClose());
    }
    header_layout(){
        let {mode} = this.props;
        return {
            className:'box-shadow',size:60,style:{overflow:'visible',marginBottom:12,background:'#fff'},
            row:[
                {size:60,html:getSvg("chevronLeft", { flip: true }),align:'vh',attrs:{onClick:()=>this.onClose()}},
                {flex:1,html:mode === 'edit'?'ویرایش اطلاعات کاربری':'ثبت نام',className:'size16 color605E5C',align:'v'}
            ]
        }
    }
    logo_layout(){return {html:storeSvg,align:'vh'}}
    text_layout(){
        let {mode} = this.props;
        if(mode === 'edit'){return false}
        return {html:'به خانواده بزرگ بروکس بپیوندید',align:'h',className:'size20 color323130 bold'}
    }
    subtext_layout(){
        let {mode} = this.props;
        if(mode === 'edit'){return false}
        return {html:'بیش از 8000 فروشگاه در سطح کشور عضو این خانواده هستند',align:'vh',className:'size14 color605E5C'}
    }
    async onSubmit(){
        let {model} = this.state;
        let {mode,baseUrl} = this.props;
        let url = {
            'register':`${baseUrl}/Users/NewUser`,
            'edit':`${baseUrl}/Users/UpdateUser`
        }[mode];
        model.landlineNumber = model.landline
        let res = await Axios.post(url, model);
        let result = false;
        try{result = res.data.isSuccess || false}
        catch{result = false}
        if(result){
            let {onSubmit} = this.props;
            onSubmit(res.data.data);
            this.onClose();
        }
        else{alert('خطا در برقراری ارتباط')}
    }
    change(model){
        this.setState({model})
    }
    form_layout(){
        let {model} = this.state;
        let {mode} = this.props;
        return {
            style:{overflow:'visible'},
            html:(
                <Form
                    lang={'fa'}
                    model={model}
                    style={{margin:12,borderRadius:12}}
                    theme={{
                        inlineLabel:false,
                        bodyStyle:{background:'#fff',padding:12},
                        inputStyle:{height:30,background:'#f5f5f5',border:'none'}
                    }}
                    showErrors={false}
                    getErrors={(errors)=>this.setState({errors})}
                    className='box-shadow'
                    labelAttrs={{className:'size14 color605E5C'}}
                    onChange={(model)=>this.change(model)}
                    inputs={[
                        {label:'کد مشتری',type:'text',field:'model.cardCode',disabled:true,show:mode === 'edit'},
                        {label:'نام',type:'text',field:'model.firstName',rowKey:'1',validations:[['required']]},
                        {type:'html',html:()=>'',rowKey:'1',rowWidth:12},
                        {label:'نام خانوادگی',type:'text',field:'model.lastName',rowKey:'1',validations:[['required']]},
                        {label:'رمز عبور',type:'password',field:'model.password',validations:[['required'],['length>',5]],show:mode === 'register'},
                        {
                            label:'تکرار رمز عبور',type:'password',field:'model.re_password',
                            validations:[['=','model.password',{message:'تکرار رمز عبور با رمز عبور مطابقت ندارد'}]],
                            show:mode === 'register'
                        },
                        {label:'تلفن همراه',type:'text',field:'model.phoneNumber',rowKey:'3',disabled:mode === 'edit'},
                        {type:'html',html:()=>'',rowKey:'3',rowWidth:12},
                        {label:'تلفن ثابت',type:'text',field:'model.landline',rowKey:'3'},
                        {label:'نام فروشگاه',type:'text',field:'model.storeName',validations:[['required']]},
                        {label:'ثبت موقعیت جغرافیایی',type:'html',html:()=>{
                            let {showMap,model} = this.state;
                            if(showMap){return ''}
                            return (
                                <Map
                                    changeView={false}
                                    onClick={()=>this.setState({showMap:true})}
                                    latitude={model.latitude}
                                    longitude={model.longitude}
                                    style={{width:'100%',height:'120px'}}
                                />
                            )
                        }},
                        {type:'html',html:()=><div style={{color:'red'}}>تنظیم موقعیت جغرافیایی الزامیست</div>,show:model.latitude === 35.699739 && model.longitude === 35.699739},
                        {label:'استان',type:'select',field:'model.userProvince',rowKey:'2',options:provinces,optionText:'option',optionValue:'option',validations:[['required']]},
                        {type:'html',html:()=>'',rowKey:'2',rowWidth:12},
                        {label:'شهر',type:'select',field:'model.userCity',options:this.cities,optionValue:'option.text',rowKey:'2',validations:[['required']]},
                        {label:'آدرس',type:'textarea',field:'model.address',validations:[['required']]},
                        // {label:'شماره شبا',type:'text',field:'model.sheba'},
                        // {label:'شماره کارت بانکی',type:'number',field:'model.cardBankNumber'},
                        // {label:'نام دارنده کارت بانکی',type:'text',field:'model.cardBankName'},
                        
                    ]}
                />
            )
        }
    }
    componentDidMount(){
        $(this.dom.current).animate({
            height: '100%',
            width: '100%',
            left:'0%',
            top:'0%',
            opacity:1
        }, 300);
    }
    render(){
        let {showMap,model,prevProvince,errors} = this.state;
        let {mode} = this.props;
        if(prevProvince !== model.userProvince){
            setTimeout(()=>{
                this.cities = allCities.filter(({province})=>province === model.userProvince);
                model.userCity = '';
                this.setState({prevProvince:model.userProvince,model});
            },0)
        }
        console.log(errors)
        return (
            <>
                <RVD
                    layout={{
                        attrs:{ref:this.dom},
                        style:{width:'100%',height:'100%',overflow:'hidden',position:'fixed',left:'50%',top:'100%',height:'0%',width:'0%',opacity:0,background:'#f8f8f8'},
                        column:[
                            this.header_layout(),
                            {size:12},
                            {
                                scroll:'v',flex:1,
                                column:[
                                    this.logo_layout(),
                                    this.text_layout(),
                                    {size:6},
                                    this.subtext_layout(),
                                    this.form_layout(),
                                    {size:300}       
                                ]
                            },
                            {
                                column:[
                                    {size:12},
                                    {
                                        className:'colorA4262C size10 padding-0-12',
                                        column:errors.map((e)=>{
                                            return {
                                                row:[
                                                    {html:<Icon path={mdiInformation} size={0.6}/>,align:'v'},
                                                    {size:6},
                                                    {html:e,align:'v'}
                                                ]
                                            }
                                        })
                                    }
                                ]
                            },
                            {
                                className:'margin-12',
                                html:<button disabled={!!errors.length} onClick={()=>this.onSubmit()} className='button-2'>{mode === 'edit'?'ویرایش حساب کاربری':'ایجاد حساب کاربری'}</button>
                            }
                        ]
                    }}
                />
                {showMap && <ShowMap latitude={model.latitude} longitude={model.longitude} onClose={()=>this.setState({showMap:false})} onChange={(latitude,longitude)=>{
                    let {model} = this.state;
                    model.latitude = latitude;
                    model.longitude = longitude;
                    this.setState({model,showMap:false})
                }}/>}
            </>
        )
    }
}


class ShowMap extends Component{
    constructor(props){
        super(props);
        let {latitude = 35.699739,longitude = 51.338097} = props;
        this.state = {latitude,longitude};
    }
    header_layout(){
        let {onClose} = this.props;
        return {
            className:'box-shadow',size:60,style:{overflow:'visible',marginBottom:12,background:'#fff'},
            row:[
                {size:60,html:getSvg("chevronLeft", { flip: true }),align:'vh',attrs:{onClick:()=>onClose()}},
                {flex:1,html:'انتخاب موقعیت فروشگاه',className:'size16 color605E5C',align:'v'}
            ]
        }
    }
    map_layout(){
        let {latitude,longitude} = this.state;
        return {
            flex:1,
            html:(
                <Map
                    latitude={latitude} longitude={longitude} style={{width:'100%',height:'100%'}}
                    onChange={(latitude,longitude)=>this.setState({latitude,longitude})}
                />
            ),
            
        }
    }
    footer_layout(){
        let {onChange} = this.props;
        let {latitude,longitude} = this.state;
        return {
            size:72,style:{position:'absolute',bottom:12,left:12,width:'calc(100% - 24px)',overflow:'visible',zIndex:100000000000},
            className:'box-shadow',align:'vh',
            column:[
                {html:`latitude:${latitude.toFixed(6)} - Lonitude:${longitude.toFixed(6)}`,style:{width:'100%',background:'rgba(255,255,255,.8)',fontSize:12,borderRadius:5},align:'h',className:'color3B55A5'},
                {size:6},
                {html:<button onClick={()=>onChange(latitude,longitude)} className='button-2 box-shadow'>تایید موقعیت</button>,style:{background:'orange',width:'100%'}},
            ]
        }
    }
    render(){
        return (
            <RVD
                layout={{
                    style:{position:'fixed',left:0,top:0,width:'100%',height:'100%',zIndex:100},
                    column:[this.header_layout(),this.map_layout(),this.footer_layout()]
                }}
            />
        )
    }
}