import React,{Component, useContext, useState} from 'react';
import RVD from '../../npm/react-virtual-dom/react-virtual-dom';
import brxbillboard from '../../images/Burux-billboard.png';
import getSvg from '../../utils/getSvg';
import appContext from '../../app-context';
import SplitNumber from '../../npm/aio-functions/split-number';
import {Icon} from '@mdi/react';
import {mdiAccountCircle} from '@mdi/js';
import AIOInput from '../../npm/aio-input/aio-input';
import Popup from '../../components/popup/popup';
import Card from '../../components/card/card';
import Wallet from '../../popups/wallet/wallet';
import './profile.css';
import { I_app_state } from '../../types';
export default function Profile(){
    let {guaranteeItems = [],userInfo,b1Info,actionClass,backOffice,setGuaranteeItems,apis,logout}:I_app_state = useContext(appContext);
    let [showWallet,setShowWallet] = useState<boolean>(false)
    let [parts] = useState<any>([
        {after:getSvg('chevronLeft'),text:'پیگیری سفارش خرید',icon:getSvg(13,{className:'theme-medium-font-color'}),onClick:()=>{
            actionClass.openPopup('peygiriye-sefareshe-kharid')
        }},
        //{after:getSvg('chevronLeft'),text:'جایزه ها',icon:getSvg(15),onClick:()=>{}},
        {
            after:getSvg('chevronLeft'),
            text:'جزییات درخواست های گارانتی',
            icon:getSvg(14,{className:'theme-medium-font-color'}),
            show:()=>!!backOffice.activeManager.garanti && !!b1Info.customer.slpcode,
            onClick:async ()=>{
                let guaranteeItems = await apis.request({api:'guaranti.garantiItems',description:'دریافت لیست کالاهای گارانتی کاربر'});
                setGuaranteeItems(guaranteeItems);
                actionClass.openPopup('joziate-darkhast-haye-garanti'); 
            }
        },
        //{after:getSvg('chevronLeft'),text:'قوانین و مقررات',icon:getSvg(16),onClick:()=>{}},
        {after:getSvg('chevronLeft'),text:'خروج از حساب کاربری',icon:getSvg(17),onClick:()=>logout(),style:{color:'#A4262C'}},
    ])
    function parts_layout(){return {className:'m-h-12 of-visible',html:<Card type='card4' items={parts}/>}}
    function getContent(){
        let slpname,slpcode;
        let firstName = userInfo.firstName;
        let lastName = !userInfo.lastName || userInfo.lastName === null?'':userInfo.lastName;
        try{slpname = b1Info.customer.slpname || 'تعیین نشده'; slpcode = b1Info.customer.slpcode || 'تعیین نشده';}
        catch{slpname = 'تعیین نشده'; slpcode = 'تعیین نشده';}
        return {
            flex:1,className:'page-bg ofy-auto',
            column:[
                {className:'my-burux-header',html:<img src={brxbillboard as string} width='100%' alt=''/>},
                {size:100,className:'of-visible',html:(<div className='bm-profile-icon'><Icon path={mdiAccountCircle} size={6}/></div>)},
                {size:36,align:'vh',className:'theme-dark-font-color fs-20 bold',html:`${firstName} ${lastName}`,},
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
                                    ['گروه مشتری',b1Info.customer.groupName],
                                    [
                                        'رمز ورود',
                                        <button 
                                            style={{background:'none',border:'none',outline:'none',fontWeight:'bold'}}
                                            className='theme-link-font-color'
                                            onClick={()=>actionClass.openPopup('password')}
                                        >مشاهده و ویرایش</button>]]
                                
                            ]}
                            onClick={()=>actionClass.openPopup('profile','profile')}
                        />
                    )
                },
                {size:16},
                {
                    className:'m-h-12 of-visible',gap:12,
                    row:[
                        {
                            show:!!backOffice.activeManager.wallet,flex:1,className:'of-visible', 
                            html:()=>(
                                <Card
                                    type='card3' footer='جزییات کیف پول' onClick={()=>setShowWallet(true)}
                                    rows={[[['کیف پول',SplitNumber(Math.max(b1Info.customer.ballance * 10,0)) + ' ریال']]]}
                                />
                            )
                        },
                        {
                            flex:1,className:'of-visible',show:!!backOffice.activeManager.garanti && !!b1Info.customer.slpcode,          
                            html:()=>(
                                <Card
                                    type='card3'
                                    rows={[[['کالا های گارانتی شده',guaranteeItems.length + ' عدد']]]}
                                    footer={
                                        <AIOInput 
                                            type='button' caret={false} position='bottom' text='درخواست گارانتی جدید'
                                            style={{background:'none',color:'inherit',fontWeight:'inherit',fontSize:'inherit'}}
                                            onClick={()=>actionClass.openPopup('sabteGarantiJadid')}
                                        />        
                                    }
                                />
                            )
                        }
                    ]
                },
                {size:16},
                parts_layout(),
                {size:120,html:'',align:'vh'},
                {
                    html:(
                        <AIOInput position='bottom' className='theme-medium-font-color fs-14 bold' style={{width:90}} type='button' text='نسخه 3.0.1' popOver={()=>{
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
                    ),align:'vh'
                },
                {size:24}
            ]
        }
    }
    return (
        <>
            <RVD layout={getContent()}/>
            {showWallet && (<Popup><Wallet onClose={()=>setShowWallet(false)}/></Popup>)}
        </>
    )
}

