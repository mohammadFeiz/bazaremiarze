import React ,{Component, useContext, useEffect, useState} from 'react';
import ACS from '../../npm/aio-content-slider/aio-content-slider';
import RVD from '../../npm/react-virtual-dom/react-virtual-dom';
import deficonsrc from './../../images/deficon.png';
import defbillboardsrc from './../../images/defbillboard.png';
import appContext from '../../app-context';
import { I_app_state, I_backOffice_content } from '../../types';
type I_Billboard = {renderIn:'buy' | 'home'}
type I_Billboard_item = {name?:string,billboard:any,icon?:any,onClick?:any}
export default function Billboard(props:I_Billboard){
    let {backOffice,b1Info,Shop,actionClass}:I_app_state = useContext(appContext);
    let {renderIn} = props;
    let [items,setItems] = useState<I_Billboard_item[]>([])
    useEffect(()=>{getItems()},[])
    function getItems(){
        let items:I_Billboard_item[] = [];
        if(renderIn === 'buy'){
            for(let shopId in Shop){
                let ShopClass = Shop[shopId]
                if(shopId === 'Regular' || !ShopClass.active){continue}
                let {billboard,icon,shopName} = ShopClass;
                items.push({name:shopName,billboard,icon,onClick:()=>ShopClass.openCategory()})
                
            }
        }
        else if(renderIn === 'home'){
            let {homeContent = []} = backOffice;
            let homeBillboards:I_backOffice_content[] = homeContent.filter((o)=>o.type === 'billboard');
            for(let i = 0; i < homeBillboards.length; i++){
                let {linkTo,url} = homeBillboards[i];
                let onClick = linkTo?()=>actionClass.openLink(linkTo):undefined;
                items.push({billboard:url,onClick})    
            }
        }
        setItems(items)
    }
    function billboards_layout(){
        return {html:<ACS items={items.map(({billboard = defbillboardsrc,onClick},i)=><img src={billboard} alt="" width='100%' onClick={onClick}/>)}/>}
    }
    function icons_layout(){
        if(renderIn !== 'buy'){return false}
        items = items.filter((o)=>!!o.icon);
        if(!items.length){return false}
        return {
            column:[
                {html:'جشنواره ها',className:'fs-14 bold theme-dark-font-color p-h-24',size:36,align:'v'},
                {
                    row:items.map(({name,icon = deficonsrc,onClick})=>{
                        return {
                            flex:1,align:'h',onClick,gap:3,
                            column:[
                                {html:<img src={icon} width={54} height={54} alt='' style={{borderRadius:16}}/>},
                                {html:name,className:'fs-12 bold theme-dark-font-color'}
                            ]
                        }
                    })
                },
                {size:12}
            ]
        }
    }
    return (<RVD layout={{style:{width:'100%',maxWidth:600},column:[billboards_layout(),icons_layout()]}}/>)
    
}