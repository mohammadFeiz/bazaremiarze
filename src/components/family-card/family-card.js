import React,{Component} from 'react';
import RVD from './../../interfaces/react-virtual-dom/react-virtual-dom';
import NoSrc from './../../images/no-src.png';
import GeneralSrc from './../../images/general.png';
import GiantSrc from './../../images/giant.png';
import PaneliSrc from './../../images/paneli.png';
import appContext from '../../app-context';
export default class FamilyCard extends Component{
    static contextType = appContext;
    getSrc(title){
        if(title === 'جنرال'){return GeneralSrc}
        if(title === 'جاینت'){return GiantSrc}
        if(title === 'پنلی توکار'){return PaneliSrc}   
    }
    render(){
        let {kharidApis,openPopup} = this.context;
        let {title,id,style} = this.props;
        return (
            <RVD
                layout={{
                    style:{height:180,width:140,...style},
                    className:'bg-fff bold border-ddd br-12 fs-14',
                    attrs:{onClick:async ()=>{
                        openPopup('category',{
                            name:'خانواده ی ' + title,
                            category:{
                                name:'خانواده ی ' + title,
                                products:await kharidApis({api:'familyProducts',parameter:{id},cache:12 * 60,cacheName:`products-of-family-with-id-${id}`}) 
                            }
                        })
                    }},
                    column:[
                        {size:128,align:'vh',html:<img src={this.getSrc(title) || NoSrc} width={'100%'} className='w-100 h-100' alt=''/>,style:{padding:6,paddingBottom:0}},
                        {align:'vh',html:title,className:'fs-12 p-v-6 p-h-12 theme-medium-font-color bold',style:{whiteSpace:'normal'}},
                        {flex:1},
                        {size:12}
                    ]
                }}
            />
        )
    }
}