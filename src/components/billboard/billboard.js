import React ,{Component} from 'react';
import ACS from './../../npm/aio-content-slider/aio-content-slider';
import Sookhte from './../../images/banner1111.jpg';
import RVD from './../../interfaces/react-virtual-dom/react-virtual-dom';
import appContext from '../../app-context';
export default class Billboard extends Component{
    static contextType = appContext;
    getCampaignIcon(campaign){
        //در صورت تعریف یک کمپین باید آیکونش رو اینجا ریترن کنیم
    }
    getItems(){
        let {openPopup,backOffice,userInfo,Shop_Bundle,spreeCampaignIds = [],getShopById,homeBillboards,getLinkToFunction} = this.context;
        let {renderIn} = this.props;
        let items = [];
        if(renderIn === 'buy'){
            for(let i = 0; i < spreeCampaignIds.length; i++){
                let spreeCampaignId = spreeCampaignIds[i]
                let Shop = getShopById(spreeCampaignId);
                let {billboard,icon,name,id} = Shop;
                items.push({name,billboard,icon,onClick:()=>Shop.openCategory()})
            }
        }
        else if(renderIn === 'home'){
            for(let i = 0; i < homeBillboards.length; i++){
                let {linkTo,url} = homeBillboards[i];
                let onClick = linkTo?getLinkToFunction(linkTo):undefined;
                items.push({billboard:url,onClick})    
            }
        }
        
        if(renderIn === 'home' && !!backOffice.activeManager.garanti && userInfo.slpcode){
            items.push({
               billboard:Sookhte,
               onClick:()=>openPopup('sabteGarantiJadid')
            })
        }
        if(Shop_Bundle.active && renderIn === 'buy'){
            items.push({
                name:Shop_Bundle.name,icon:Shop_Bundle.icon,billboard:Shop_Bundle.billboard,
                onClick:()=>Shop_Bundle.openCategory()
            })
        }
        return items
    }
    billboards_layout(items){
        return {html:<ACS items={items.map(({billboard,onClick},i)=>{
            return (<img src={billboard} alt="" width='100%' onClick={onClick}/>)
        })}/>}
    }
    icons_layout(items){
        let {renderIn} = this.props;
        if(renderIn !== 'buy'){return false}
        items = items.filter((o)=>!!o.icon);
        if(!items.length){return false}
        return {
            column:[
                {html:'جشنواره ها',className:'fs-14 bold theme-dark-font-color p-h-24',size:36,align:'v'},
                {
                    row:items.map(({name,icon,onClick})=>{
                        return {
                            flex:1,align:'h',onClick,
                            column:[
                                {html:<img src={icon} width={54} height={54} alt='' style={{borderRadius:16}}/>},
                                {size:3},
                                {html:name,className:'fs-12 bold theme-dark-font-color'}
                            ]
                        }
                    })
                },
                {size:12}
            ]
        }
    }
    render(){
        let items = this.getItems()
        return (
            <RVD 
                layout={{
                    style:{width:'100%',maxWidth:600},
                    column:[
                        this.billboards_layout(items),
                        this.icons_layout(items)
                    ]
                }}
            />
        )
    }
}