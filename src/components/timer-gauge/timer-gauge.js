import React,{Component} from 'react';
import RVD from './../../npm/react-virtual-dom/react-virtual-dom';
import Gauge from './../../npm/aio-gauge/aio-gauge';
export default class TimerGauge extends Component{
    constructor(props){
        super(props);
        this.state = {remainingTime:this.getRemainigTime()}
        setInterval(()=>{
            this.setState({remainingTime:this.getRemainigTime()})
        },60000)
    }
    getRemainigTime(){
        let {startTime,totalTime,onExpired = ()=>{}} = this.props;
        if(!typeof onExpired === 'function'){debugger;}
        let now = new Date().getTime();
        let date = new Date(startTime).getTime()
        let passedTime = now - date;
        passedTime = passedTime / 1000 / 60;
        if(passedTime > totalTime){
            onExpired()
            return false
        }
        let res;
        try{res = +(totalTime - passedTime).toFixed(0)}
        catch{res = 0}
        return res
    }
    render(){
        let {totalTime} = this.props;
        let {remainingTime} = this.state;
        if(remainingTime === false){return false}
        let timeRate = remainingTime / totalTime;
        let timeColor;
        if(timeRate < 0.15){timeColor = 'red'}
        else if(timeRate < 0.50){timeColor = 'orange'}
        else {timeColor = 'green'}
        let hours = Math.floor(remainingTime / 60);
        let minutes = Math.floor(remainingTime - (hours * 60)) 
        return (
            <RVD
                layout={{
                    column:[
                        {size:12},
                        {
                            align:'vh',
                            html:(
                                <Gauge
                                    style={{width:48,height:48}} rotate={180} direction='clockwise'
                                    start={0} radius={20} angle={360} end={totalTime} thickness={3}
                                    ranges={[
                                        {value:remainingTime,color:timeColor},
                                        {value:totalTime,color:'#ddd'}
                                    ]}
                                />
                            )
                        },
                        {
                            className:'fs-10',style:{color:'#000'},align:'vh',
                            column:[
                                {html:`زمان باقیمانده`},
                                {
                                    align:'v',gap:3,
                                    row:[
                                        {html:hours,className:'bold fs-12',style:{color:timeColor}},
                                        {html:'ساعت و',style:{opacity:0.7}},
                                        {html:minutes,className:'bold fs-12',style:{color:timeColor}},
                                        {html:'دقیقه',style:{opacity:0.7}},
                                    ]
                                },
                            ]
                        }
                    ]
                }}
            />
        )
    }
}