import React,{Component,createRef} from 'react';
import RVD from './../../interfaces/react-virtual-dom/react-virtual-dom';
import storeSvg from '../../utils/svgs/store-svg';
import Form from './../../interfaces/aio-form-react/aio-form-react';
import Axios from 'axios';
import Map from './../map/map';
import getSvg from '../../utils/getSvg';
import {Icon} from '@mdi/react';
import {mdiInformation,mdiLoading,mdiCrosshairsGps} from '@mdi/js';
import allCities from './cities';
import provinces from './provinces';
import './index.css';
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
        latitude = isNaN(parseFloat(latitude))?35.699739:parseFloat(latitude);
        longitude = isNaN(parseFloat(longitude))?51.338097:parseFloat(longitude);
        this.cities = allCities.filter(({province})=>province === userProvince)
        this.state = {
            prevProvince:userProvince,
            model:{latitude,cardCode,longitude,firstName,lastName,phoneNumber,storeName,address,userProvince,userCity,landline,password,re_password:password},
            showMap:false,
            loading:false,
        }
    }
    onClose(){
        let {onClose,mode} = this.props;
        $(this.dom.current).animate({
            height: '0%',
            width: '0%',
            left:'50%',
            top:'100%',
            opacity:0
        }, 300,()=>{
            if(mode === 'edit'){onClose()}
        });
    }
    header_layout(){
        let {mode} = this.props;
        return {
            className:'box-shadow of-visible',size:60,style:{marginBottom:12,background:'#fff'},
            row:[
                {size:60,html:getSvg("chevronLeft", { flip: true }),align:'vh',attrs:{onClick:()=>this.onClose()}},
                {flex:1,html:mode === 'edit'?'ویرایش اطلاعات کاربری':'ثبت نام',className:'fs-16 theme-medium-font-color',align:'v'}
            ]
        }
    }
    logo_layout(){return {html:storeSvg,align:'vh'}}
    text_layout(){
        let {mode} = this.props;
        if(mode === 'edit'){return false}
        return {html:'به خانواده بزرگ بروکس بپیوندید',align:'h',className:'fs-20 theme-dark-font-color bold'}
    }
    subtext_layout(){
        let {mode} = this.props;
        if(mode === 'edit'){return false}
        return {html:'بیش از 8000 فروشگاه در سطح کشور عضو این خانواده هستند',align:'vh',className:'fs-14 theme-medium-font-color'}
    }
    async onSubmit(){
        if($('.aio-form-error').length){alert('موارد ضروری را پر کنید'); return;}
        let {model} = this.state;
        let {mode,baseUrl} = this.props;
        let url = {
            'register':`${baseUrl}/Users/NewUser`,
            'edit':`${baseUrl}/Users/UpdateUser`
        }[mode];
        model.landlineNumber = model.landline;
        this.setState({loading:true})
        let res;
        try{
            res = await Axios.post(url, model);
        }
        catch(err){
            alert(err.message)
        }
        this.setState({loading:false})
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
            className:'of-visible',
            html:(
                <Form
                    lang={'fa'}
                    model={model}
                    style={{margin:12,borderRadius:12}}
                    theme={{
                        inlineLabel:false,
                        bodyStyle:{background:'none',padding:12},
                    }}
                    classNames={{
                        label:'fs-14 theme-dark-font-color bold',
                        input:'theme-input',
                    }}
                    className='theme-box-shadow theme-card-bg'
                    onChange={(model)=>this.change(model)}
                    inputs={[
                        {label:'کد مشتری',type:'text',field:'model.cardCode',disabled:true,show:mode === 'edit'},
                        {label:'نام',type:'text',field:'model.firstName',rowKey:'1',validations:[['required']],disabled:mode === 'edit'},
                        {type:'html',html:()=>'',rowKey:'1',rowWidth:12},
                        {label:'نام خانوادگی',type:'text',field:'model.lastName',rowKey:'1',validations:[['required']],disabled:mode === 'edit'},
                        {label:'رمز عبور',type:'password',field:'model.password',validations:[['required'],['length>',5]],show:mode === 'register'},
                        {
                            label:'تکرار رمز عبور',type:'password',field:'model.re_password',
                            validations:[['=','model.password',{message:'تکرار رمز عبور با رمز عبور مطابقت ندارد'}]],
                            show:mode === 'register'
                        },
                        {label:'تلفن همراه',type:'text',field:'model.phoneNumber',rowKey:'3',disabled:true},
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
                        {label:'آدرس',type:'textarea',field:'model.address',validations:[['required']],disabled:mode === 'edit'},
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
        let {showMap,model,prevProvince,loading} = this.state;
        let {mode} = this.props;
        if(prevProvince !== model.userProvince){
            setTimeout(()=>{
                this.cities = allCities.filter(({province})=>province === model.userProvince);
                model.userCity = '';
                this.setState({prevProvince:model.userProvince,model});
            },0)
        }
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
                                className:'ofy-auto',flex:1,
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
                                className:'m-12',
                                
                                html:(
                                    <button 
                                        onClick={()=>this.onSubmit()} 
                                        className='button-2'
                                    >
                                        <>
                                            {loading && <Icon path={mdiLoading} size={1} spin={0.2} style={{margin:'0 6px'}}/>}
                                            {mode === 'edit'?'ویرایش حساب کاربری':'ایجاد حساب کاربری'}
                                        </>
                                    </button>
                                )
                            }
                        ]
                    }}
                />
                {showMap && <ShowMap latitude={model.latitude} longitude={model.longitude} onClose={()=>this.setState({showMap:false})} onChange={(latitude,longitude)=>{
                    debugger;
                    let {model} = this.state;
                    model.latitude = latitude;
                    model.longitude = longitude;
                    this.setState({model,showMap:false})
                }}/>}
                {loading && <div style={{zIndex:1000000000,position:'fixed',left:0,top:0,width:'100%',height:'100%'}}></div>}
            </>
        )
    }
}


class ShowMap extends Component{
    header_layout(){
        let {onClose} = this.props;
        return {
            className:'box-shadow of-visible',size:60,style:{background:'#fff'},
            row:[
                {size:60,html:getSvg("chevronLeft", { flip: true }),align:'vh',attrs:{onClick:()=>onClose()}},
                {flex:1,html:'انتخاب موقعیت فروشگاه',className:'fs-16 theme-medium-font-color',align:'v'}
            ]
        }
    }
    map_layout(){
        let {onChange,latitude,longitude} = this.props;
        return {
            flex:1,
            html:(
                <>
                    <Map
                        latitude={latitude} longitude={longitude} style={{width:'100%',height:'100%',position:'absolute'}}
                        onChange={(latitude,longitude)=>onChange(latitude,longitude)}
                        search={true}
                    />
                    
                </>
            )
        }
    }
    render(){
        return (
            <>
                <RVD
                    rtl={true}
                    layout={{
                        style:{position:'fixed',left:0,top:0,width:'100%',height:'100%',zIndex:100},
                        column:[this.header_layout(),this.map_layout()]
                    }}
                />
                
            </>
        )
    }
}

