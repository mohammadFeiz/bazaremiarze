import React,{Component} from 'react';
import RVD from '../../interfaces/react-virtual-dom/react-virtual-dom';
import headerSvg from '../../images/header-svg';
import footerSvg from '../../images/footer-svg';
import getSvg from '../../utils/getSvg';
import appContext from '../../app-context';
import functions from '../../functions';
import {Icon} from '@mdi/react';
import {mdiAccountCircle} from '@mdi/js';
import AIOButton from '../../interfaces/aio-button/aio-button';
import Popup from '../../components/popup/popup';
import Register from '../../components/register/register';
import Card from '../../components/card/card';
import Wallet from '../../popups/wallet/wallet';
import eleph from './../../images/eleph.ogg';
import './profile.css';
export default class Profile extends Component{
    static contextType = appContext;
    constructor(props){
        super(props);
        this.eggCounter = 0;
        this.state = {
            showProfile:false,
            showWallet:false,
            user:'محمد شریف فیض',
            customerCode:'c19428',shopName:'فروشگاه الکتریکی تهران',visitorName:'علی محمدی',nationalCode:'0386481784',
            parts:[
                {after:getSvg('chevronLeft'),text:'پیگیری سفارش خرید',icon:getSvg(13,{className:'theme-medium-font-color'}),onClick:()=>{
                    let {openPopup} = this.context;
                    openPopup('peygiriye-sefareshe-kharid')
                }},
                //{after:getSvg('chevronLeft'),text:'جایزه ها',icon:getSvg(15),onClick:()=>{}},
                {
                    after:getSvg('chevronLeft'),
                    text:'جزییات درخواست های گارانتی',
                    icon:getSvg(14,{className:'theme-medium-font-color'}),
                    show:()=>!!this.context.backOffice.activeManager.garanti,
                    onClick:async ()=>{
                        let {SetState,guarantiApis,openPopup} = this.context;
                        let guaranteeItems = await guarantiApis({api:'items'});
                        SetState({guaranteeItems});
                        openPopup('joziate-darkhast-haye-garanti'); 
                    }
                },
                //{after:getSvg('chevronLeft'),text:'قوانین و مقررات',icon:getSvg(16),onClick:()=>{}},
                {after:getSvg('chevronLeft'),text:'خروج از حساب کاربری',icon:getSvg(17),onClick:()=>this.context.logout(),style:{color:'#A4262C'}},
            ]
        }
    }
    parts_layout(){
        let {parts} = this.state;
        return {className:'m-h-12 of-visible',html:<Card type='card4' items={parts}/>}
    }
    egg(){
        this.eggCounter++;
        if(this.eggCounter > 4){
            var audio = new Audio(eleph);
            audio.play();
        }
        clearTimeout(this.timeOut);
        this.timeOut = setTimeout(()=>{
            this.eggCounter = 0;
        },500)

    }
    getContent(){
        let {guaranteeItems = [],userInfo,openPopup,backOffice} = this.context;
        let slpname,slpcode;
        try{
            slpname = userInfo.slpname || 'تعیین نشده';
            slpcode = userInfo.slpcode || 'تعیین نشده';
        }
        catch{
            slpname = 'تعیین نشده';
            slpcode = 'تعیین نشده';
        }
        return {
            flex:1,className:'page-bg ofy-auto',
            column:[
                {
                    className:'my-burux-header',
                    html:headerSvg()
                },
                {
                    size:100,className:'of-visible',
                    html:(
                        <div style={{background:'rgba(255,255,255,0.4)',boxShadow:'rgb(0 0 0 / 25%) 0px 4px 12px 1px',color:'#ccc',width:132,height:132,left:'calc(50% - 66px)',position:'absolute',top:-32,borderRadius:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <Icon path={mdiAccountCircle} size={6}/>
                        </div>
                    )
                },
                {
                    size:36,
                    row:[
                        {flex:1},
                        //{className:'theme-dark-font-color fs-20 bold',html:userInfo.cardName,align:'vh'},
                        {className:'theme-dark-font-color fs-20 bold',html:`${userInfo.firstName} ${userInfo.lastName}`,align:'vh'},
                        {flex:1}
                    ]
                },
                {size:6},
                {
                    className:'m-h-12 of-visible',       
                    html:(
                        <Card
                            type='card3' footer='مشاهده و ویرایش اطلاعات کاربری'
                            rows={[
                                [['کد مشتری',userInfo.cardCode],['نام فروشگاه',userInfo.storeName]],
                                [['نام ویزیتور',slpname],['کد ویزیتور',slpcode]],
                                [
                                    ['گروه مشتری',userInfo.groupName],
                                    [
                                        'رمز ورود',
                                        <button 
                                            style={{background:'none',border:'none',outline:'none',fontWeight:'bold'}}
                                            className='theme-link-font-color'
                                            onClick={()=>openPopup('password')}
                                        >مشاهده و ویرایش</button>]]
                                
                            ]}
                            onClick={()=>this.setState({showProfile:true})}
                        />
                    )
                },
                {size:16},
                {
                    className:'m-h-12 of-visible',gap:12,
                    row:[
                        {
                            show:!!backOffice.activeManager.wallet,
                            flex:1,className:'of-visible', 
                            html:()=>(
                                <Card
                                    type='card3' footer='جزییات کیف پول'
                                    rows={[[['کیف پول',functions.splitPrice(Math.max(userInfo.ballance * 10,0)) + ' ریال']]]}
                                    onClick={()=>this.setState({showWallet:true})}
                                />
                            )
                        },
                        {
                            flex:1,className:'of-visible',show:!!backOffice.activeManager.garanti,          
                            html:()=>(
                                <Card
                                    type='card3'
                                    rows={[[['کالا های گارانتی شده',guaranteeItems.length + ' عدد']]]}
                                    footer={
                                        <AIOButton 
                                            type='button' caret={false} position='bottom' text='درخواست گارانتی جدید'
                                            style={{background:'none',color:'inherit',fontWeight:'inherit',fontSize:'inherit'}}
                                            onClick={()=>openPopup('sabte-garanti-jadid')}
                                        />        
                                    }
                                />
                            )
                        }
                    ]
                },
                {size:16},
                this.parts_layout(),
                {size:120,html:footerSvg(),align:'vh',onClick:()=>this.egg()},
                {html:(
                    <AIOButton position='bottom' className='theme-medium-font-color fs-14 bold' style={{width:90}} type='button' text='نسخه 3.0.1' popOver={()=>{
                        return (
                            <div style={{background:'#fff'}}>
                                <div style={{height:60,display:'flex',alignItems:'center'}} className='theme-dark-font-color fs-16 bold p-h-24'>موارد اضافه شده به این نسخه</div>
                                <ul>
                                    <li>تکمیل بازارگاه تا تحویل به مشتری</li>
                                    <li>بهبود گرافیک</li>
                                    <li>بهبود تجربه کاربری  در خرید</li>
                                    <li>اتصال به بک آفیس</li>
                                    <li>افزایش سرعت دریافت داده ها از سرور</li>

                                </ul>
                            </div>
                        )
                    }}/>
                ),align:'vh'},
                {size:24}
            ]
        }
    }
    render(){
        let {showProfile,showWallet} = this.state;
        let {userInfo,updateUserInfo,baseUrl} = this.context;
        return (<>
            <RVD layout={this.getContent()}/>
            {
                showProfile && 
                (
                    <Popup>
                        <RVD
                            layout={{
                                className:'fixed',
                                html:(
                                    <Register baseUrl={baseUrl} mode='edit' model={{...userInfo}} 
                                        onClose={()=>this.setState({showProfile:false})}
                                        onSubmit={(userInfo)=>{
                                            updateUserInfo(userInfo)
                                        }}
                                    />
                                )
                            }}
                        />
                    </Popup>
                )
            }
            {
                showWallet && 
                (
                    <Popup>
                        <Wallet onClose={()=>this.setState({showWallet:false})}/>
                    </Popup>
                )
            }
        </>)
    }
}

