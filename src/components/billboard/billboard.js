import React ,{Component} from 'react';
import ACS from './../../npm/aio-content-slider/aio-content-slider';
import Sookhte from './../../images/banner1111.png';
import RVD from './../../interfaces/react-virtual-dom/react-virtual-dom';
import appContext from '../../app-context';
export default class Billboard extends Component{
    static contextType = appContext;
    async onClick(campaign){
        let {kharidApis,openPopup} = this.context;
        if(campaign.cartId === 'forooshe_vije' || campaign.cartId === 'belex'){
            openPopup('category',{category:campaign})
        }
        else if(campaign.cartId === 'نورواره 3'){
            openPopup('category',{category:{...campaign}})
        }
        else if(campaign.name === 'بسته عیدانه'){
            openPopup('eydane')
        }
        else{
            let products = await kharidApis({api:'getCampaignProducts',parameter:campaign,cacheName:'campaign' + campaign.cartId});
            openPopup('category',{category:{...campaign,products}})
        }
    }
    billboard_layout(){
        let {campaigns,openPopup,backOffice,forooshe_vije,belex,userInfo,nv3,eydane} = this.context,{renderIn} = this.props;
        let items = []
        if(renderIn === 'buy'){
            items = items.concat(campaigns.map((o)=><img src={o.src} width='100%' alt='' onClick={async ()=>this.onClick(o)}/>))
            
        }
        if(renderIn === 'home' && !!backOffice.activeManager.garanti && userInfo.slpcode){
            // items.push(<img src={HomeSlide2} alt="" width='100%'/>)
            items.push(<img src={Sookhte} alt="" width='100%' className='sookhte' onClick={()=>{
                openPopup('sabte-garanti-jadid')
            }}/>)
        }
        
        if(forooshe_vije && renderIn === 'buy'){
            items.push(<img src={forooshe_vije.src} alt="" width='100%' className='forooshe-vije-billboard' onClick={()=>{
                openPopup('category',{category:forooshe_vije})
            }}/>)
        }
        if(belex && renderIn === 'buy'){
            items.push(<img src={belex.src} alt="" width='100%' onClick={()=>{
                openPopup('category',{category:belex})
            }}/>)
        }
        if(nv3 && renderIn === 'buy'){
            items.push(<img src={nv3.src} alt="" width='100%' onClick={()=>{
                openPopup('category',{category:{...nv3}})
            }}/>)
        }
        if(eydane){
            items.push(<img src={eydane.src} alt="" width='100%' onClick={()=>{
                openPopup('eydane')
            }}/>)
        }
        return {html:<ACS items={items}/>}
    }
    campaigns_layout(){
        let {campaigns,forooshe_vije,belex,nv3,eydane} = this.context,{renderIn} = this.props;
        if(renderIn !== 'buy'){return false}
        let list = [...campaigns];
        if(forooshe_vije){
            list.push(forooshe_vije)
        }
        if(belex){
            list.push(belex)
        }
        if(nv3){
            list.push(nv3)
        }
        if(eydane){
            list.push(eydane)
        }
        return {
            column:[
                {show:!!list.length,html:'جشنواره ها',className:'fs-14 bold theme-dark-font-color p-h-24',size:36,align:'v'},
                {row:list.map((campaign)=>this.campaign_layout(campaign))},
                {size:12}
            ]
        }
    }
    campaign_layout(campaign){
        let {name,icon} = campaign;
        return {
            flex:1,align:'h',
            attrs:{onClick:async ()=>this.onClick(campaign)},
            column:[
                {html:<img src={icon} width={54} height={54} alt='' style={{borderRadius:16}}/>},
                {size:3},
                {html:name,className:'fs-12 bold theme-dark-font-color'}
            ]
        }
    }
    render(){
        return (
            <RVD layout={{style:{width:'100%',maxWidth:600},column:[this.billboard_layout(),this.campaigns_layout()]}}/>
        )
    }
}