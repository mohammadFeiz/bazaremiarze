import React,{Component,createRef} from 'react';
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import bmsrc from './../../images/logo5.png';
import AIOInput from '../../npm/aio-input/aio-input';
import Axios from 'axios';
import getSvg from '../../utils/getSvg';
import {Icon} from '@mdi/react';
import {mdiLoading,mdiInformationOutline} from '@mdi/js';
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
        if(!phoneNumber || phoneNumber === null){phoneNumber = model.userName;}
        latitude = isNaN(parseFloat(latitude))?35.699739:parseFloat(latitude);
        longitude = isNaN(parseFloat(longitude))?51.338097:parseFloat(longitude);
        this.cities = allCities.filter(({province})=>province === userProvince)
        this.state = {
            errors:[],
            prevProvince:userProvince,
            model:{latitude,cardCode,longitude,firstName,lastName,phoneNumber,storeName,address,userProvince,userCity,landline,password,re_password:password,coords:{lat:latitude,lng:longitude}},
            loading:false,
        }
    }
    onClose(){
        let {onClose,mode,locationMode} = this.props;
        if(locationMode){
            onClose()
        }
        else{
            $(this.dom.current).animate({height: '0%',width: '0%',left:'50%',top:'100%',opacity:0}, 300,()=>{
                if(mode === 'edit'){onClose()}
            });
        }
        
    }
    header_layout(){
        let {mode,logout} = this.props;
        return {
            className:'theme-box-shadow of-visible',size:60,style:{marginBottom:12,background:'#fff'},
            row:[
                {size:60,html:getSvg("chevronLeft", { flip: true }),align:'vh',attrs:{onClick:()=>this.onClose()}},
                {flex:1,html:mode === 'edit'?'ویرایش اطلاعات کاربری':'ثبت نام',className:'fs-16 theme-medium-font-color',align:'v'},
                {show:!!logout,html:'خروج از حساب',align:'v',onClick:()=>logout(),className:'fs-12 theme-link-font-color bold p-h-12'}
            ]
        }
    }
    logo_layout(){
        let {locationMode} = this.props;
        if(locationMode){
            return {
                className:'p-24',align:'vh',style:{color:'#fff'},
                row:[
                    {size:36},
                    {html:<Icon path={mdiInformationOutline} size={2}/>},
                    {size:24},
                    {flex:1,html:'کاربر گرامی لطفا در راستای ارتقای خدمات گروه بازار می ارزه موقعیت دقیق خود را روی نقشه  برای ما ثبت کنید',style:{textAlign:'right'}}
                ]
            }
        }
        return {html:<img src={bmsrc} width={160}/>,align:'vh'}
    }
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
        if($('.aio-input-form-error').length){alert('موارد ضروری را پر کنید'); return;}
        let {mode,baseUrl,locationMode} = this.props;
        let model;
        if(locationMode){
            let {model:propsModel} = this.props;
            let {latitude,longitude,userCity,userProvince} = this.state.model;
            model = {...propsModel,latitude,longitude,userCity,userProvince}
        }
        else{
            model = this.state.model;
        }
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
            let data = err.response.data;
            if(typeof data !== 'object'){alert(err.message || err.Message)}
            alert(data.Message || data.message)
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
        else{
            res = res || {};
            res.data = res.data || {}; 
            let {message,Message} = res.data;
            alert(message || Message)
        }
    }
    change(model){
        this.setState({model})
    }
    form_layout(){
        let {model} = this.state;
        let {mode,locationMode} = this.props;
        return {
            align:'vh',
            className:'of-visible',
            html:(
                <AIOInput
                    type='form' lang={'fa'} value={model}
                    style={{margin:12,borderRadius:12}}
                    className='theme-box-shadow theme-card-bg'
                    onChange={(model,errors)=>{
                        let newModel = {...model}
                        if(model.coords){
                            newModel = {...newModel,latitude:model.coords.lat,longitude:model.coords.lng}
                        }
                        else{
                            newModel = {...newModel,coords:{lat:undefined,lng:undefined},latitude:undefined,longitude:undefined}
                        }
                        this.change(newModel); 
                        this.setState({errors})
                    }}
                    getErrors={(errors)=>{
                        this.setState({errors})
                    }}
                    inputs={{
                        props:{gap:12},
                        column:[
                            {input:{type:'text',disabled:true},label:'کد مشتری',field:'value.cardCode',show:!locationMode && mode === 'edit'},
                            {
                                show:!locationMode,
                                row:[
                                    {input:{type:'text',inputAttrs:{autoComplete:'off'}},label:'نام',field:'value.firstName',validations:[['required']]},
                                    {input:{type:'text',inputAttrs:{autoComplete:'off'}},label:'نام خانوادگی',field:'value.lastName',validations:[['required']]}
                                ]
                            },
                            {input:{type:'password',inputAttrs:{autoComplete:'off'}},label:'رمز عبور',field:'value.password',validations:[['required'],['length>',5]],show:!locationMode && mode === 'register'},
                            {
                                input:{type:'password',inputAttrs:{autoComplete:'off'}},label:'تکرار رمز عبور',field:'value.re_password',
                                validations:[['required'],['=','value.password',{message:'تکرار رمز عبور با رمز عبور مطابقت ندارد'}]],
                                show:!locationMode && mode === 'register'
                            },
                            {
                                show:!locationMode,
                                row:[
                                    {input:{type:'text',disabled:true},label:'تلفن همراه',field:'value.phoneNumber'},
                                    {input:{type:'text'},label:'تلفن ثابت',field:'value.landline'},
                                ]
                            },
                            {input:{type:'text'},label:'نام فروشگاه',field:'value.storeName',validations:[['required']],show:!locationMode},
                            {
                                input:{
                                    type:'map',mapConfig:{draggable:false,zoomable:false},
                                    onChangeAddress:(address)=>{
                                        this.setState({model:{...this.state.model,address}})
                                    },
                                    popup:{mapConfig:{search:true,title:'ثبت موقعیت جغرافیایی',zoomable:true,draggable:true}}
                                },
                                field:'value.coords',
                                label:'ثبت موقعیت جغرافیایی'
                            },
                            {input:{type:'textarea'},label:'آدرس',field:'value.address',validations:[['required']]},
                            {
                                row:[
                                    {input:{type:'select',options:provinces,optionText:'option',optionValue:'option',popover:{fitHorizontal:true}},label:'استان',field:'value.userProvince',validations:[['required']]},
                                    {input:{type:'select',options:this.cities,optionValue:'option.text',popover:{fitHorizontal:true}},label:'شهر',field:'value.userCity',validations:[['required']]}
                                ]
                            }
                            
                        ]
                    }}
                />
            )
        }
    }
    
    componentDidMount(){
        // $(this.dom.current).animate({
        //     height: '100%',
        //     width: '100%',
        //     left:'0%',
        //     top:'0%',
        //     opacity:1
        // }, 300);
    }
    async changeAddress(latitude,longitude){
        //debugger;
        let {mode} = this.props;
        //if(mode !== 'register'){return;}
        let param = {
            headers:{
                'Api-Key':'service.05feac099b574f18a11b8fce31f7382f',
                'Authorization':undefined
            }
        }
        let url = `https://api.neshan.org/v5/reverse?lat=${latitude}&lng=${longitude}`;
        let res = await Axios.get(url,param);
        if(res.status !== 200){return}
        let {model} = this.state;
        let address = res.data.formatted_address;
        model.address = address;
        this.change(model)
    }
    render(){
        let {errors,model,prevProvince,loading} = this.state;
        let {mode,locationMode} = this.props;
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
                        className:'fullscreen',
                        style:{opacity:1,background:'#3b55a5'},
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
                                    {size:410}       
                                ]
                            },
                            {
                                className:'m-12',
                                
                                html:(
                                    <button 
                                        disabled={!!errors.length}
                                        onClick={()=>this.onSubmit()} 
                                        className='button-2' style={{background:'dodgerblue'}}
                                    >
                                        <>
                                            {loading && <Icon path={mdiLoading} size={1} spin={0.2} style={{margin:'0 6px'}}/>}
                                            {locationMode?'ثبت موقعیت':(mode === 'edit'?'ویرایش حساب کاربری':'ایجاد حساب کاربری')}
                                        </>
                                    </button>
                                )
                            }
                        ]
                    }}
                />
                {loading && <div style={{zIndex:1000000000,position:'fixed',left:0,top:0,width:'100%',height:'100%'}}></div>}
            </>
        )
    }
}
