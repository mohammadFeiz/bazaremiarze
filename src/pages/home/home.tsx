import React, { useContext, useState } from 'react';
import RVD from '../../npm/react-virtual-dom/react-virtual-dom';
import getSvg from '../../utils/getSvg';
import appContext from '../../app-context';
import SplitNumber from '../../npm/aio-functions/split-number';
import AIOInput from '../../npm/aio-input/aio-input';
import Card from '../../components/card/card';
import Billboard from '../../components/billboard/billboard.tsx';
import Bazargah from '../bazargah/bazargah';
import Call from '../../components/call';
import './index.css';
import { I_app_state } from '../../types';

export default function Home() {
    let {b1Info,actionClass,backOffice}:I_app_state = useContext(appContext);
    let [showCallPopup,setShowCallPopup] = useState<boolean>(false)
    function billboard_layout(){
        return { html: <Billboard renderIn='home'/>,align:'h' }
    }
    function cartAndWallet_layout(){
        let cartLength = actionClass.getCartLength()
        return {
            className:'of-visible theme-gap-h',
            row: [
                {
                    show:!!backOffice.activeManager.wallet,
                    className:'of-visible',flex:1,
                    html:()=>(
                        <Card
                            type='card1' title='کیف پول' value={SplitNumber(Math.max(b1Info.customer.ballance * 10,0))} unit='ریال'
                            icon={getSvg(29,{width:30,height:30})} onClick={()=>actionClass.openPopup('wallet')}
                        />
                    )
                },
                {size:12,show:!!backOffice.activeManager.wallet},
                {
                    className:'of-visible',flex:1,
                    html:(
                        <Card
                            type='card1' title='سبد خرید' value={cartLength} unit='کالا'
                            icon={getSvg(28,{width:30,height:30})} onClick={()=>actionClass.openPopup('cart')}
                        />
                    )
                }
            ]
        }
    }
    function bazargah_layout(){
        return {className:'of-visible theme-gap-h',html:<Bazargah renderInHome={true}/>}
    }   
    function promotion_layout(){
        let {homeContent = []} = backOffice;
        if(!homeContent.length){return false}
        return {
            gap:12,className:'theme-card-bg m-b-12 p-12 theme-box-shadow',
            column:homeContent.map((o)=>{
                let {type,text,url,linkTo} = o;
                if(type === 'label'){return {className:'m-h-12 fs-14 bold',html:text}}
                if(type === 'description'){return {className:'m-h-12 m-b-12 fs-12',style:{textAlign:'right'},html:text}}
                if(type === 'image'){
                    return {
                        className:'m-h-12 m-b-12',onClick:linkTo?()=>actionClass.openLink(linkTo):undefined,
                        html:(<img src={url} alt='' width='100%'/>)
                    }
                }
                return false
            })
        }
    }
    function getContent() {
        return {
            flex: 1,
            className:'page-bg',style:{width:'100%'},
            column: [
                {flex:1,className:'ofy-auto',column: [billboard_layout(),promotion_layout(),cartAndWallet_layout(),bazargah_layout()]}
            ]
        }
    }
    return (
        <>
            <RVD layout={getContent()} />
            <AIOInput
                text={getSvg(showCallPopup?'phoneClose':'phone')} style={{padding:0,background:'none'}}
                caret={false} type='button' className='phone-button'
                onClick={()=>setShowCallPopup(true)}
            />
            {showCallPopup && <Call onClose={()=>setShowCallPopup(false)}/>}
        </>   
    )
}
