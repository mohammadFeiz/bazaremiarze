import { mdiCash, mdiLamp, mdiLightbulbOutline } from "@mdi/js";
import Icon from "@mdi/react";
import React,{Component} from "react";
import RVD from './../../interfaces/react-virtual-dom/react-virtual-dom';
import Slider from './../../npm/aio-slider/aio-slider';
import appContext from "../../app-context";
export default class NV3Report extends Component{
    static contextType = appContext;
    slider_layout(){
        let {nv3Details} = this.context;
        let {amount = 0,renderIn} = this.props;
        let steps = nv3Details.map(({amount})=>+((amount/10000000).toFixed(1)));
        amount = +((amount/10000000).toFixed(1));
        let end = +((nv3Details[nv3Details.length - 1].amount/10000000).toFixed(1));
        return {
            show:renderIn !== 'shipping',
            size:124,
            html:(
                <Slider
                    direction='left'
                    attrs={{
                        style:{padding:'0 24px',height:120}
                    }}
                    start={0}
                    scaleStep={steps}
                    getScaleHTML={(value)=>{
                        return (
                            <RVD
                                layout={{
                                    style:{
                                        background:amount >= value?'#EFF0FF':'#F3F3F3',
                                        borderRadius:12,fontSize:12,padding:'3px 0',
                                        color:amount >= value?'#3B55A5':'#A19F9D',
                                        opacity:amount >= value?1:0.5,
                                    },
                                    column:[
                                        {align:'vh',html:<Icon path={mdiLightbulbOutline} size={0.7} style={{color:amount >= value?'orange':'#A19F9D'}}/>},
                                        {html:{'10.5':'50','20.5':'100','40.5':'200'}[value.toString()],align:'vh',className:'fs-14'}
                                    ]
                                }}
                            />
                        )
                    }}
                    labelStep={steps}
                    labelStyle={()=>{return {top:72,fontSize:14}}}
                    scaleStyle={()=>{return {width:24,height:48,transform:'translateX(12px)',top:12,background:'none'}}}
                    end={end}
                    step={0.5}
                    points={[amount]}
                    lineStyle={{background:'#D4F1E8',height:6,borderRadius:4}}
                    pointStyle={{display:'none'}}
                    fillStyle={(index)=>{
                        return {
                            height:6,borderRadius:4,
                            background:index === 0?'#2BBA8F':'transparent'
                        }
                    }}
                />
            ),
            
        }
    }
    text_layout(){
        let {nv3Details} = this.context;
        let {amount = 0,renderIn} = this.props;
        let remaining = 0,target;
        for(let i = 0; i < nv3Details.length; i++){
            let o = nv3Details[i];
            if(amount < o.amount){
                remaining = o.amount - amount;
                target = o.lamp;
                break;
            }    
        }
        return {
            style:{background:'#DCE1FF'},
            className:'m-h-12 p-6',
            column:[
                {
                    show:renderIn !== 'shipping',
                    row:[
                        {size:36,html:<Icon path={mdiCash} size={0.9} style={{color:'orange'}}/>,align:'vh'},
                        {
                            gap:3,
                            row:[
                                {html:'جمع سبد خرید نورواره شما تا کنون : ',className:'color3B55A5 fs-12'},
                                {html:(amount/10000000).toFixed(1),className:'bold color3B55A5 fs-14'},
                                {html:'میلیون تومان',className:'color3B55A5 fs-12'}
                            ]
                        }
                    ]
                },
                {
                    show:renderIn !== 'shipping' && !!remaining,
                    row:[
                        {size:36,html:<Icon path={mdiLightbulbOutline} size={0.9} style={{color:'orange'}}/>,align:'vh'},
                        {
                            gap:3,
                            row:[
                                {html:(remaining / 10000000).toFixed(1),className:'bold color3B55A5 fs-14'},
                                {html:'میلیون تومان تا',className:'color3B55A5 fs-12'},
                                {html:target,className:'bold color3B55A5 fs-14'},
                                {html:'عدد لامپ رایگان',className:'color3B55A5 fs-12'}
                            ]
                        }
                    ]
                }
            ]
        }
    }
    header_layout(){
        let {nv3Details = []} = this.context;
        let {renderIn,amount} = this.props;
        let text = '';
        if(!amount){text = 'از نورواره خرید کنید لامپ رایگان هدیه بگیرید'}
        for(let i = 0; i < nv3Details.length; i++){
            let o = nv3Details[i];
            if(amount < o.amount){
                let catched = i === 0?0:nv3Details[i - 1].lamp;
                text = `لامپ رایگان حبابی 7 وات سبد خرید نورواره شما تا کنون : ${catched} عدد `
            }    
        }
        if(!text){
            let catched = nv3Details[nv3Details.length - 1].lamp;
            text = `شما ${catched} عدد لامپ حبابی 7 وات رایگان بابت این خرید دریافت می کنید`
        }
        return {show:renderIn !== 'shipping',html:text,className:'bold color3B55A5 size14 m-h-12',style:{textAlign:'right'}}
    }
    render(){
        return (
            <RVD
                layout={{
                    column:[
                        this.header_layout(),
                        this.slider_layout(),
                        this.text_layout()
                    ]
                }}
            />
        )
    }
}
