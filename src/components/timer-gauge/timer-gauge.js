import React,{Component} from 'react';
import {Gauge} from './../../npm/aio-chart/aio-chart';
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
            <Gauge
                style={{width:100,height:100}} rotate={180} direction='clockwise'
                start={0} radius={32} angle={360} end={totalTime} thickness={4}
                text={[
                    {value:`${hours}:${minutes}`,top:0,fontSize:16,color:timeColor,fontFamily:'IranSans_light'}
                ]}
                ranges={[
                    {value:remainingTime,color:timeColor},
                    {value:totalTime,color:'#ddd'}
                ]}
            />
        )
    }
}