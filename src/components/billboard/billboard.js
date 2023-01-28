import React ,{Component} from 'react';
import ACS from './../../npm/aio-content-slider/aio-content-slider';
import Sookhte from './../../images/banner1111.png';
import RVD from './../../interfaces/react-virtual-dom/react-virtual-dom';
import yaldaye_roshanayi from './../../images/yaldaye-roshanayi.png';
import yaldaye_batri from './../../images/yaldaye-batri.png';
import appContext from '../../app-context';
export default class Billboard extends Component{
    static contextType = appContext;
    svgs = [<img src={yaldaye_batri} width={54} height={54} alt=''/>,<img src={yaldaye_roshanayi} width={54} height={54} alt=''/>]
    async onClick(campaign){
        let {kharidApis,openPopup} = this.context;
        if(campaign.type === 'forooshe_vije'){
            openPopup('category',{category:{products:campaign.products,name:campaign.name,src:campaign.src},name:campaign.name})
        }
        else if(campaign.type === 'belex'){
            openPopup('category',{category:{products:campaign.products,name:campaign.name,src:campaign.src},name:campaign.name})
        }
        else{
            let products = await kharidApis({api:'getCampaignProducts',parameter:campaign,cacheName:'campaign' + campaign.id});
            openPopup('category',{category:{products,name:campaign.name,src:campaign.src},name:campaign.name})
        }
    }
    billboard_layout(){
        let {campaigns,openPopup,backOffice,forooshe_vije,belex} = this.context,{renderIn} = this.props;
        let items = campaigns.map((o)=><img src={o.src} width='100%' onClick={async ()=>this.onClick(o)}/>)
        if(renderIn === 'home' && !!backOffice.activeManager.garanti){
            // items.push(<img src={HomeSlide2} alt="" width='100%'/>)
            items.push(<img src={Sookhte} alt="" width='100%' className='sookhte' onClick={()=>{
                openPopup('sabte-garanti-jadid')
            }}/>)
        }
        if(forooshe_vije){
            items.push(<img src={forooshe_vije.src} alt="" width='100%' className='forooshe-vije-billboard' onClick={()=>{
                openPopup('category',{category:forooshe_vije})
            }}/>)
        }
        if(belex){
            items.push(<img src={belex.src} alt="" width='100%' onClick={()=>{
                openPopup('category',{category:belex})
            }}/>)
        }
        return {html:<ACS items={items}/>}
    }
    campaigns_layout(){
        let {campaigns,forooshe_vije,belex} = this.context,{renderIn} = this.props;
        if(renderIn !== 'buy'){return false}
        let list = [...campaigns];
        if(forooshe_vije){
            list.push(forooshe_vije)
        }
        if(belex){
            list.push(belex)
        }
        return {
            column:[
                {html:'جشنواره ها',className:'fs-14 bold theme-dark-font-color p-h-24',size:36,align:'v'},
                {row:list.map((campaign,i)=>this.campaign_layout(campaign,i))},
                {size:12}
            ]
        }
    }
    campaign_layout(campaign,index){
        return {
            flex:1,align:'h',
            attrs:{onClick:async ()=>this.onClick(campaign)},
            column:[
                {html:campaign.icon?<img src={campaign.icon} width={54} height={54} alt=''/>:this.svgs[index]},
                {size:3},
                {html:campaign.name,className:'fs-12 bold theme-dark-font-color'}
            ]
        }
    }
    render(){
        return (
            <RVD layout={{style:{width:'100%',maxWidth:600},column:[this.billboard_layout(),this.campaigns_layout()]}}/>
        )
    }
}