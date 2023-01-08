import React,{Component,createRef} from 'react';
import RVD from './../../interfaces/react-virtual-dom/react-virtual-dom';
import storeSvg from '../../utils/svgs/store-svg';
import Form from './../../interfaces/aio-form-react/aio-form-react';
import Axios from 'axios';
import Map from './../map/map';
import getSvg from '../../utils/getSvg';
import {Icon} from '@mdi/react';
import {mdiInformation,mdiLoading} from '@mdi/js';
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
            showMap:true,
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
                {flex:1,html:mode === 'edit'?'ویرایش اطلاعات کاربری':'ثبت نام',className:'fs-16 color605E5C',align:'v'}
            ]
        }
    }
    logo_layout(){return {html:storeSvg,align:'vh'}}
    text_layout(){
        let {mode} = this.props;
        if(mode === 'edit'){return false}
        return {html:'به خانواده بزرگ بروکس بپیوندید',align:'h',className:'fs-20 color323130 bold'}
    }
    subtext_layout(){
        let {mode} = this.props;
        if(mode === 'edit'){return false}
        return {html:'بیش از 8000 فروشگاه در سطح کشور عضو این خانواده هستند',align:'vh',className:'fs-14 color605E5C'}
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
                        bodyStyle:{background:'#fff',padding:12},
                        inputStyle:{height:30,background:'#f5f5f5',border:'none'}
                    }}
                    className='box-shadow'
                    labelAttrs={{className:'fs-14 color605E5C'}}
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
    constructor(props){
        super(props);
        let {latitude = 35.699739,longitude = 51.338097} = props;
        this.state = {latitude,longitude,showSearch:false,searchValue:''};
    }
    header_layout(){
        let {onClose} = this.props;
        return {
            className:'box-shadow of-visible',size:60,style:{marginBottom:12,background:'#fff'},
            row:[
                {size:60,html:getSvg("chevronLeft", { flip: true }),align:'vh',attrs:{onClick:()=>onClose()}},
                {flex:1,html:'انتخاب موقعیت فروشگاه',className:'fs-16 color605E5C',align:'v'}
            ]
        }
    }
    map_layout(){
        let {latitude,longitude,searchValue} = this.state;
        let {search = true} = this.props;
        return {
            flex:1,
            html:(
                <>
                    <Map
                        latitude={latitude} longitude={longitude} style={{width:'100%',height:'100%',position:'absolute'}}
                        onChange={(latitude,longitude)=>this.setState({latitude,longitude})}
                        getGoTo={(fn)=>this.goTo = fn}
                    />
                    {
                        search && 
                        <input 
                            onClick={()=>this.setState({showSearch:true})}
                            defaultValue={searchValue}
                            style={{
                                zIndex:1000,position:'absolute',left:12,top:12,width:'calc(100% - 24px)',padding:12,height:36,
                                boxSizing:'border-box',border:'1px solid #ddd',borderRadius:4,fontFamily:'inherit'
                            }} 
                            type='text' placeholder='جستجو'
                        />
                    }
                </>
            )
        }
    }
    footer_layout(){
        let {onChange} = this.props;
        let {latitude,longitude} = this.state;
        return {
            size:72,style:{position:'absolute',bottom:12,left:12,width:'calc(100% - 24px)',zIndex:100000000000},
            className:'box-shadow of-visible',align:'vh',
            column:[
                {html:`latitude:${latitude.toFixed(6)} - Lonitude:${longitude.toFixed(6)}`,style:{width:'100%',background:'rgba(255,255,255,.8)',fontSize:12,borderRadius:5},align:'h',className:'color3B55A5'},
                {size:6},
                {html:<button onClick={()=>onChange(latitude,longitude)} className='button-2 box-shadow'>تایید موقعیت</button>,style:{background:'orange',width:'100%'}},
            ]
        }
    }
    render(){
        let {showSearch,latitude,longitude,searchValue} = this.state;
        return (
            <>
                <RVD
                    layout={{
                        style:{position:'fixed',left:0,top:0,width:'100%',height:'100%',zIndex:100},
                        column:[this.header_layout(),this.map_layout(),this.footer_layout()]
                    }}
                />
                {
                    showSearch &&
                    <MapSearch 
                        searchValue={searchValue}
                        onClose={(searchValue)=>this.setState({showSearch:false,searchValue})}
                        latitude={latitude}
                        longitude={longitude}
                        onClick={(lat,lng,searchValue)=>{
                            this.goTo(lat,lng);
                            this.setState({showSearch:false,searchValue})
                        }}
                    />
                }
            </>
        )
    }
}

class MapSearch extends Component{
    constructor(props){
        super(props);
        this.dom = createRef()
        this.state = {searchValue:'',searchResult:[]}
    }
    componentDidMount(){
        let {searchValue} = this.props;
        if(searchValue){this.changeSearch(searchValue);}
        $(this.dom.current).focus().select()
    }
    async changeSearch(searchValue){
        let {latitude,longitude} = this.props;
        this.setState({searchValue});

        clearTimeout(this.timeout);
        this.timeout = setTimeout(async ()=>{
            let param = {
                headers:{
                    'Api-Key':'service.8f13cd0a4d2442399a3d690d26e993ed',
                    'Authorization':undefined
                }
            }
            let url = `https://api.neshan.org/v1/search?term=${searchValue}&lat=${latitude}&lng=${longitude}`;
            let res = await Axios.get(url,param); 
            if(res.status !== 200){return}
            this.setState({searchResult:res.data.items})
        },1000)
    }
    space_layout(type){
        let {onClose} = this.props;
        let {searchValue} = this.state;
        let layout = {onClick:()=>onClose(searchValue)};
        if(type === 'first'){layout.size = 84;}
        else {layout.flex = 1;}
        return layout;
    }
    input_layout(){
        let {searchValue} = this.state;
        return {
            align:'h',
            html:(
                <input 
                    ref={this.dom}
                    value={searchValue}
                    onChange={(e)=>this.changeSearch(e.target.value)}
                    style={{
                        zIndex:1000,width:'calc(100% - 24px)',padding:12,height:36,
                        boxSizing:'border-box',border:'1px solid #ddd',borderRadius:4,fontFamily:'inherit',outline:'none'
                    }} 
                    type='text' placeholder='جستجو'
                />
            )
        }
    }
    result_layout(){
        let {searchResult} = this.state;
        if(!searchResult || !searchResult.length){return false}
        let {onClick} = this.props;
        return {
            style:{background:'#fff',height:'fit-content',maxHeight:400},
            className:'m-h-12 p-v-12 ofy-auto',gap:3,
            column:searchResult.map(({title,address,location})=>{
                return {
                    onClick:()=>{
                        this.setState({searchValue:title,showSearch:false});
                        onClick(location.y,location.x,title)
                    },
                    column:[
                        {
                            html:title,className:'p-h-12 fs-12',align:'v'
                        },
                        {html:address,className:'p-h-12 fs-10',align:'v',style:{opacity:0.5}}
                    ]
                }
            })
        }
    }
    render(){
        return (
            <RVD
                layout={{
                    style:{zIndex:1000,background:'rgba(0,0,0,0.5)'},
                    className:'fullscreen',
                    column:[
                        this.space_layout('first'),
                        this.input_layout(),
                        this.result_layout(),
                        this.space_layout('last')
                    ]
                }}
            />
        )
    }
}