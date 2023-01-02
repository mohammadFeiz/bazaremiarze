import React,{Component} from 'react';
import RVD from './../../interfaces/react-virtual-dom/react-virtual-dom';
import './index.css';
export default class Tabs extends Component{
    badgeStyle(badge){
        return {background:badge === 0?'#eee':'dodgerblue',padding:'0 3px',overflow:'hidden',color:'#fff',borderRadius:2,minWidth:12,height:18,margin:'0 6px',display:'flex',alignItems:'center',justifyContent:'center'}
    }
    tab_layout({size,flex,id,title,badge}){
        let {activeTabId,onChange} = this.props;
        if(typeof badge === 'function'){badge = badge()}
        let active = id === activeTabId;
        return {
            align: 'vh', size, flex, className: 'fs-12',
            attrs: { onClick: () => onChange(id) },
            style:active?{borderBottom:'2px solid',color:'dodgerblue'}:{},
            row: [
                { html: title, className: 'tab-title', align: 'v' },
                { show: badge !== undefined, html: ()=><div style={this.badgeStyle(badge)}>{badge}</div>, align: 'vh' }
            ]
        }
    }
    render(){
        let {tabs = []} = this.props;
        if(!tabs.length){return null}
        return (
            <RVD layout={{gap: 12,ofx:'auto',style:{height:36},className: 'tabs-container p-h-24 bg-fff',row: tabs.map((o)=>this.tab_layout({...o}))}}/>
        )
    }
}