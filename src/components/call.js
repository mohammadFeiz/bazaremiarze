import React, { Component } from 'react';
import RVD from './../npm/react-virtual-dom/react-virtual-dom';
import getSvg from './../utils/getSvg';
import appContext from './../app-context';
export default class Call extends Component{
    static contextType = appContext;
    render(){
        let {onClose} = this.props;
        let {b1Info} = this.context;
        let mobile = b1Info.salePeople?b1Info.salePeople.mobile:undefined;
        
        return (
            <RVD
                layout={{
                    style:{direction:'ltr',position:'fixed',height:'100%',width:'100%',left:0,top:0,background:'rgba(0,0,0,0.6)'},
                    column:[
                        {flex:1,attrs:{onClick:()=>onClose()}},
                        {
                            size:48,className:'m-b-12',show:!!mobile,
                            row:[
                                {size:12},
                                {html:<a style={{height:48}} href={`tel:${mobile}`}>{getSvg('tamasbavizitor')}</a>,align:'vh'},
                                {size:12},
                                {
                                    column:[
                                        {html:'تماس با ویزیتور',align:'v',style:{color:'#fff'},className:'fs-14'},
                                        {html:mobile,align:'v',style:{color:'#fff'},className:'fs-12'}
                                    ]
                                }
                            ]
                        },
                        {
                            size:48,
                            row:[
                                {size:12},
                                {html:<a style={{height:48}} href="tel:02175116">{getSvg('tamasbavizitor')}</a>,align:'vh'},
                                {size:12},
                                {
                                    column:[
                                        {html:'تماس با پشتیبانی',align:'v',style:{color:'#fff'},className:'fs-14'},
                                        {html:'02175116',align:'v',style:{color:'#fff'},className:'fs-12'}
                                    ]
                                }
                            ]
                        },
                        {size:12},
                        {size:48,row:[{size:12},{html:getSvg('phoneClose'),align:'vh',attrs:{onClick:()=>onClose()}}]},
                        {size:68}
                    ]
                }}
            />        
        )
    }
}
