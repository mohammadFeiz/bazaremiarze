import { mdiLamp, mdiLightbulbOutline } from "@mdi/js";
import Icon from "@mdi/react";
import React,{Component} from "react";
import RVD from './../../interfaces/react-virtual-dom/react-virtual-dom';
import Slider from './../../npm/aio-slider/aio-slider';
export default class NV3Report extends Component{
    slider_layout(){
        let {amount = 12} = this.props;
        return {
            size:136,
            html:(
                <Slider
                    direction='left'
                    attrs={{
                        style:{padding:'0 24px',height:120}
                    }}
                    start={0}
                    scaleStep={[10.5,20.5,40.5]}
                    getScaleHTML={(value)=>{
                        let {amount = 12} = this.props;
                        return (
                            <RVD
                                layout={{
                                    style:{
                                        background:amount >= value?'#EFF0FF':'#F3F3F3',
                                        borderRadius:12,fontSize:12,padding:'3px 0',
                                        color:amount >= value?'#3B55A5':'#A19F9D',
                                        opacity:amount >= value?1:0.5
                                    },
                                    column:[
                                        {align:'vh',html:<Icon path={mdiLightbulbOutline} size={0.7} style={{color:amount >= value?'orange':'#A19F9D'}}/>},
                                        {html:{'10.5':'50','20.5':'100','40.5':'200'}[value.toString()],align:'vh'}
                                    ]
                                }}
                            />
                        )
                    }}
                    labelStep={[10.5,20.5,40.5]}
                    labelStyle={()=>{return {top:72}}}
                    scaleStyle={()=>{return {width:24,height:48,transform:'translateX(12px)',top:12,background:'none'}}}
                    end={40.5}
                    step={0.5}
                    points={[amount]}
                    lineStyle={{background:'#D4F1E8',height:6,borderRadius:4}}
                    pointStyle={{background:'#2BBA8F'}}
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
        let {amount = 12} = this.props;
        let text = '';
        let remaining,target;
        if(amount < 10.5){
            remaining = 10.5 - amount;
            target = 50;
        }
        else if(amount < 20.5){
            remaining = 20.5 - amount;
            target = 100;
        }
        else if(amount < 40.5){
            remaining = 40.5 - amount;
            target = 200;
        }
        return {
            style:{background:'#DCE1FF'},
            className:'m-h-12 p-6',
            row:[
                {size:36,html:<Icon path={mdiLightbulbOutline} size={0.9} style={{color:'orange'}}/>,align:'vh'},
                {
                    gap:3,
                    row:[
                        {html:remaining,className:'bold color3B55A5 fs-16'},
                        {html:'میلیون تومان تا',className:'color3B55A5 fs-14'},
                        {html:target,className:'bold color3B55A5 fs-16'},
                        {html:'عدد لامپ رایگان',className:'color3B55A5 fs-14'}
                    ]
                }
            ]
        }
    }
    render(){
        return (
            <RVD
                layout={{
                    column:[
                        {html:'از نورواره خرید کنید لامپ رایگان هدیه بگیرید',className:'bold color3B55A5 size14 m-h-12'},
                        this.slider_layout(),
                        this.text_layout()
                    ]
                }}
            />
        )
    }
}
