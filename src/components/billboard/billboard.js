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
        let products = await kharidApis({api:'getCampaignProducts',parameter:campaign,cacheName:'campaign' + campaign.id});
        openPopup('category',{category:{products,name:campaign.name,src:campaign.src},name:campaign.name})
    }
    billboard_layout(){
        let {campaigns,openPopup,showGaranti} = this.context,{renderIn} = this.props;
        let items = campaigns.map((o)=><img src={o.src} width='100%' onClick={async ()=>this.onClick(o)}/>)
        if(renderIn === 'home' && showGaranti !== false){
            // items.push(<img src={HomeSlide2} alt="" width='100%'/>)
            items.push(<img src={Sookhte} alt="" width='100%' className='sookhte' onClick={()=>{
                openPopup('sabte-garanti-jadid')
            }}/>)
        }
        return {html:<ACS items={items}/>}
    }
    campaigns_layout(){
        let {campaigns} = this.context,{renderIn} = this.props;
        if(renderIn !== 'buy'){return false}
        return {
            column:[
                {html:'جشنواره ها',className:'fs-14 bold p-h-24',size:36,align:'v'},
                {row:campaigns.map((campaign,i)=>this.campaign_layout(campaign,i))},
                {size:12}
            ]
        }
    }
    campaign_layout(campaign,index){
        return {
            flex:1,align:'h',
            attrs:{onClick:async ()=>this.onClick(campaign)},
            column:[
                {html:this.svgs[index]},
                {size:3},
                {html:campaign.name,className:'fs-12 bold'}
            ]
        }
    }
    render(){
        return (
            <RVD layout={{style:{width:'100%',maxWidth:600},column:[this.billboard_layout(),this.campaigns_layout()]}}/>
        )
    }
}