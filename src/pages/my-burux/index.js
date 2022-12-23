import React,{Component} from 'react';
import RVD from './../../interfaces/react-virtual-dom/react-virtual-dom';
import headerSvg from './../../images/header-svg';
import footerSvg from './../../images/footer-svg';
import getSvg from './../../utils/getSvg';
import appContext from '../../app-context';
import functions from '../../functions';
import {Icon} from '@mdi/react';
import {mdiAccountCircle} from '@mdi/js';
import AIOButton from './../../interfaces/aio-button/aio-button';
import SabteGarantiJadid from '../../components/garanti/sabte-garanti-jadid/sabte-garanti-jadid';
import Popup from '../../components/popup/popup';
import Register from '../../components/register/register';
import Card from '../../components/card/card';
import Wallet from '../../popups/wallet/wallet';
import './index.css';
export default class MyBurux extends Component{
    static contextType = appContext;
    constructor(props){
        super(props);
        this.state = {
            showProfile:false,
            showWallet:false,
            user:'محمد شریف فیض',
            customerCode:'c19428',shopName:'فروشگاه الکتریکی تهران',visitorName:'علی محمدی',nationalCode:'0386481784',
            parts:[
                {after:getSvg('chevronLeft'),text:'پیگیری سفارش خرید',icon:getSvg(13),onClick:()=>{
                    let {openPopup} = this.context;
                    openPopup('peygiriye-sefareshe-kharid')
                }},
                //{after:getSvg('chevronLeft'),text:'جایزه ها',icon:getSvg(15),onClick:()=>{}},
                {after:getSvg('chevronLeft'),text:'حساب ها',icon:getSvg(14),onClick:()=>{}},
                {after:getSvg('chevronLeft'),text:'جزییات درخواست های گارانتی',icon:getSvg(14),onClick:async ()=>{
                    let {SetState,guarantiApis,openPopup} = this.context;
                    let {items,total} = await guarantiApis({type:'items'});
                    SetState({guaranteeItems:items,totalGuaranteeItems:total});
                    openPopup('joziate-darkhast-haye-garanti'); 
                }},
                //{after:getSvg('chevronLeft'),text:'قوانین و مقررات',icon:getSvg(16),onClick:()=>{}},
                {after:getSvg('chevronLeft'),text:'خروج از حساب کاربری',icon:getSvg(17),onClick:()=>this.context.logout(),style:{color:'#A4262C'}},
            ]
        }
    }
    parts_layout(){
        let {parts} = this.state;
        return {className:'margin-0-12',style:{overflow:'visible'},html:<Card type='card4' items={parts}/>}
    }
    getContent(){
        let {totalGuaranteeItems,userInfo,openPopup} = this.context;
        let slpname,slpcode;
        try{
            slpname = userInfo.slpname || 'تایین نشده';
            slpcode = userInfo.slpcode || 'تایین نشده';
        }
        catch{
            slpname = 'تایین نشده';
            slpcode = 'تایین نشده';
        }
        return {
            scroll:'v',flex:1,className:'page-bg',
            column:[
                {
                    className:'my-burux-header',
                    html:headerSvg()
                },
                {
                    size:100,style:{overflow:'visible'},
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
                        {className:'color323130 size20 bold',html:userInfo.cardName,align:'vh'},
                        {flex:1}
                    ]
                },
                {size:6},
                {
                    className:'margin-0-12',style:{overflow:'visible'},
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
                                            className='color3B55A5'
                                            onClick={()=>openPopup('password')}
                                        >مشاهده و ویرایش</button>]]
                                
                            ]}
                            onClick={()=>this.setState({showProfile:true})}
                        />
                    )
                },
                {size:16},
                {
                    style:{overflow:'visible'},
                    className:'margin-0-12',
                    row:[
                        {
                            flex:1,style:{overflow:'visible'},
                            html:(
                                <Card
                                    type='card3' footer='جزییات کیف پول'
                                    rows={[[['کیف پول',functions.splitPrice(userInfo.ballance) + ' ریال']]]}
                                    onClick={()=>this.setState({showWallet:true})}
                                />
                            )
                        },
                        {size:12},
                        {
                            flex:1,style:{overflow:'visible'},
                            html:(
                                <Card
                                    type='card3'
                                    rows={[[['کالا های گارانتی شده',totalGuaranteeItems + ' عدد']]]}
                                    footer={
                                        <AIOButton 
                                            type='button' caret={false} position='bottom' text='درخواست گارانتی جدید'
                                            style={{background:'none',color:'inherit',fontWeight:'inherit',fontSize:'inherit'}}
                                            popOver={()=><SabteGarantiJadid close={false}/>}
                                        />        
                                    }
                                />
                            )
                        }
                    ]
                },
                {size:16},
                this.parts_layout(),
                {size:120,html:footerSvg(),align:'vh'},
                {html:(
                    <AIOButton position='bottom' className='color605E5C size14 bold' style={{width:90}} type='button' text='نسخه 3.0.1' popOver={()=>{
                        return (
                            <>
                            <div style={{height:60,display:'flex',alignItems:'center'}} className='color323130 size16 bold padding-0-24'>موارد اضافه شده به این نسخه</div>
                            <ul>
                                <li>تکمیل بازارگاه تا تحویل به مشتری</li>
                                <li>بهبود گرافیک</li>
                                <li>بهبود تجربه کاربری  در خرید</li>
                                <li>اتصال به بک آفیس</li>
                                <li>افزایش سرعت دریافت داده ها از سرور</li>

                            </ul>
                            </>
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

