import React ,{Component} from 'react';
import ACS from './../../npm/aio-content-slider/aio-content-slider';
import Sookhte from './../../images/banner1111.jpg';
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import appContext from '../../app-context';
export default class Billboard extends Component{
    static contextType = appContext;
    constructor(props){
        super(props);
        this.state = {homeBillboards:[]}
    }
    componentDidMount(){
        let {backOffice = {}} = this.context;
        let {homeContent = []} = backOffice;
        let homeBillboards = homeContent.filter((o)=>o.type === 'billboard');
        this.setState({homeBillboards})
    }
    getItems(){
        let {backOffice,b1Info,Shop,actionClass} = this.context;
        let {renderIn} = this.props;
        let {homeBillboards} = this.state;
        let items = [];
        if(renderIn === 'buy'){
            for(let shopId in Shop){
                let ShopClass = Shop[shopId]
                if(ShopClass.billboard){
                    let {billboard,icon,name} = ShopClass;
                    items.push({name,billboard,icon,onClick:()=>Shop.openCategory()})
                }
            }
        }
        else if(renderIn === 'home'){
            for(let i = 0; i < homeBillboards.length; i++){
                let {linkTo,url} = homeBillboards[i];
                let onClick = linkTo?()=>actionClass.openLink(linkTo):undefined;
                items.push({billboard:url,onClick})    
            }
        }
        
        if(renderIn === 'home' && !!backOffice.activeManager.garanti && b1Info.customer.slpcode){
            items.push({
               billboard:Sookhte,
               onClick:()=>actionClass.openPopup('sabteGarantiJadid')
            })
        }
        if(Shop.Bundle.active && renderIn === 'buy'){
            items.push({
                name:Shop.Bundle.name,icon:Shop.Bundle.icon,billboard:Shop.Bundle.billboard,
                onClick:()=>Shop.Bundle.openCategory()
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