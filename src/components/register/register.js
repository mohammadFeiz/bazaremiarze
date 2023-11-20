import React,{Component} from 'react';
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import bmsrc from './../../images/bazar miarze.png';
import bmsrc1 from './../../images/logo5.png';
import AIOInput from '../../npm/aio-input/aio-input';
import allCities from './cities';
import provinces from './provinces';
import './index.css';
import appContext from '../../app-context';

export default class Register extends Component{
    static contextType = appContext
    constructor(props){
        super(props);
        this.state = {model:{},cities:[]}
    }
    componentDidMount(){
        let model = this.getInitialModel();
        let cities = model.userProvince?allCities.filter(({province})=>province === model.userProvince):[]
        this.setState({model:this.getInitialModel(),cities})
    }
    getInitialModel(){
        let {userInfo} = this.context;
        let obj = {...userInfo}
        if(!obj.phoneNumber || obj.phoneNumber === null){obj.phoneNumber = obj.userName;}
        obj.coords = {lat:obj.latitude,lng:obj.longitude}
        if(obj.lastName === null){obj.lastName = ''}
        return obj
    }
    logo_layout(){
        let {mode} = this.props;
        if(mode !== 'edit'){return false}
        return {html:<img src={bmsrc1} width={120}/>,align:'vh'}
    }
    header_layout(){
        let {mode} = this.props;
        if(mode === 'edit'){return false}
        return {
            className:'br-12 p-12',style:{background:'#eff5f9'},
            row:[
                {html:<img src={bmsrc} width={68}/>,align:'vh'},
                {flex:1,align:'v',props:{gap:6},column:[this.text_layout(),this.subtext_layout()]}
            ]
        }
    }
    text_layout(){
        let {mode} = this.props;
        if(mode === 'register'){
            return {html:'به خانواده بزرگ بروکس بپیوندید',className:'fs-12 theme-dark-font-color bold t-a-right'}
        }
        else if(mode === 'location'){
            return {html:'کاربر گرامی لطفا در راستای ارتقای خدمات گروه بازار می ارزه موقعیت دقیق خود را روی نقشه  برای ما ثبت کنید',className:'fs-12 theme-dark-font-color bold t-a-right'}
        }
        
        return false
    }
    subtext_layout(){
        let {mode} = this.props;
        if(mode === 'register'){
            return {html:'بیش از 8000 فروشگاه در سطح کشور عضو این خانواده هستند',className:'fs-10 theme-medium-font-color t-a-right'}
        }
        return false
    }
    async onSubmit(){
        debugger
        let {apis,updateUserInfo,rsa} = this.context;
        let {mode} = this.props;
        let {model} = this.state;
        model.landlineNumber = model.landline;
        model.latitude = model.coords.lat;
        model.longitude = model.coords.lng;
        let description = {register:'ثبت نام',edit:'ویرایش حساب کاربری',location:'ثبت موقعیت جغرافیایی'}[mode]
        apis.request({
            api:'login.profile',parameter:{model,mode},description,
            onCatch:(error)=>{
                let {response,message,Message} = error;
                if(response && response.data){
                    let {message,Message} = response.data;
                    if(message || Message){return message || Message}
                }
                return message || Message || 'خطای نا مشخص onCatch'
            },
            getError:(response)=>{
                if(!response.data.isSuccess){
                    let {message,Message} = response.data;
                    return message || Message || 'خطای نا مشخص onError'
                }   
            },
            onSuccess:(data)=>{
                updateUserInfo(data);
                rsa.removeModal()
            }
        })
    }
    change(model){
        this.setState({model})
    }
    form_layout(){
        let {model,cities} = this.state;
        let {mode} = this.props;
        let {Login} = this.context;
        let submitText = {register:'ثبت نام',edit:'ویرایش حساب کاربری',location:'ثبت موقعیت جغرافیایی'}[mode]
        return {
            align:'vh',flex:1,
            html:(
                <AIOInput
                    type='form' lang={'fa'} value={model}
                    style={{borderRadius:12,height:'100%',flex:1}}
                    className='theme-box-shadow theme-card-bg'
                    onSubmit={()=>this.onSubmit()}
                    submitText={submitText}
                    onClose={()=>Login.logout()}
                    closeText='خروج از حساب'
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
                            this.header_layout(),
                            {
                                show:mode !== 'location',
                                row:[
                                    {input:{type:'text',inputAttrs:{autoComplete:'off'}},label:'نام',field:'value.firstName',validations:[['required']]},
                                    {input:{type:'text',inputAttrs:{autoComplete:'off'}},label:'نام خانوادگی',field:'value.lastName',validations:[['required']]}
                                ]
                            },
                            {
                                row:[
                                    {input:{type:'password',inputAttrs:{autoComplete:'off'}},label:'رمز عبور',field:'value.password',validations:[['length>',5]],show:mode === 'register'},
                                    {
                                        input:{type:'password',inputAttrs:{autoComplete:'off'}},label:'تکرار رمز عبور',field:'value.re_password',
                                        validations:[['=','value.password',{message:'تکرار رمز عبور با رمز عبور مطابقت ندارد'}]],
                                        show:mode === 'register' && !!model.password
                                    }
                                ]
                            },
                            {
                                show:mode !== 'location',
                                row:[
                                    {input:{type:'text'},label:'نام فروشگاه',field:'value.storeName',validations:[['required']]},
                                    {input:{type:'text'},label:'تلفن ثابت',field:'value.landline'},
                                ]
                            },
                            {
                                input:{
                                    type:'map',mapConfig:{draggable:false,zoomable:false,showAddress:false},
                                    onChangeAddress:(address)=>{
                                        this.setState({model:{...this.state.model,address}})
                                    },
                                    popup:{mapConfig:{search:true,title:'ثبت موقعیت جغرافیایی',zoomable:true,draggable:true}},
                                    style:{height:90,minHeight:90}
                                },
                                field:'value.coords',
                                label:'ثبت موقعیت جغرافیایی'
                            },
                            {input:{type:'textarea'},label:'آدرس',field:'value.address',validations:[['required']]},
                            {
                                row:[
                                    {input:{type:'select',options:provinces,optionText:'option',optionValue:'option',popover:{fitHorizontal:true}},label:'استان',field:'value.userProvince',validations:[['required']]},
                                    {input:{type:'select',options:cities,optionValue:'option.text',popover:{fitHorizontal:true}},label:'شهر',field:'value.userCity',validations:[['required']]}
                                ]
                            }
                            
                        ]
                    }}
                />
            )
        }
    }
    render(){
        return (
            <RVD
                layout={{
                    className:'bm-profile-form',flex:1,
                    column:[
                        this.logo_layout(),
                        this.form_layout()      
                    ]
                }}
            />
        )
    }
}