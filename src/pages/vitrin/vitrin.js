import React,{Component} from "react";
import RVD from './../../interfaces/react-virtual-dom/react-virtual-dom';
import image_src from './../../images/logo.png';
import getSvg from "../../utils/getSvg";
import AIODate from "../../npm/aio-date/aio-date";
export default class Vitrin extends Component{
    state = {step:'home'}
    landing_layout(){
        return (
            <RVD
                layout={{
                    className:'page-bg ofy-auto',
                    column:[
                        {flex:1},
                        {
                            html:(
                                <img src={image_src} alt='' width='144' height='144'/>
                            ),align:'vh'
                        },
                        {flex:1},
                        {
                            html:'محصولات خودت رو بفروش!',
                            className:'theme-dark-font-color fs-24 bold',
                            align:'h'
                        },
                        {
                            html:'همین الان ویترین خودت رو بچین تا هیچ سفارشی رو از دست ندی!',
                            className:'theme-medium-font-color fs-16 p-h-12',
                            align:'h'
                        },
                        {flex:1},
                        {
                            align:'vh',
                            html:(
                                <button
                                    style={{width:160,borderRadius:24}}
                                    className="button-2"
                                >شروع کن</button>
                            )
                        },
                        {flex:1},
                        
                    ]
                }}
            />
        )
    }
    home_layout(){
        return (
            <RVD
                layout={{
                    className:'page-bg ofy-auto',
                    column:[
                        this.box_layout({
                            icon:getSvg('my vitrin'),
                            text:'ویترین من',
                            subtext:'افزودن یا حذف کردن محصولات از ویترین من',
                            after:24
                        })
                    ]
                }}
            />
        )
    }
    box_layout({icon,text,subtext,after}){
        return {
            style:{
                background:'linear-gradient(270deg, #405AAA -4.27%, #617CD0 105.33%)',
                color:'#fff'
            },
            className:'m-h-12 br-12',
            row:[
                {size:60,align:'vh',html:icon},
                {
                    flex:1,
                    column:[
                        {size:24},
                        {html:text,className:'fs-16 bold'},
                        {size:6},
                        {html:subtext,className:'fs-12'},
                        {size:24}
                    ]
                },
                {show:!!after,className:'p-12',html:after,align:'vh'}
            ]
        }
    }
    render(){
        let {step} = this.state;
        return this[`${step}_layout`]()
    }
}