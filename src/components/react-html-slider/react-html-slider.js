import React,{Component} from "react";
import ReactHtmlSlider from "react-html-slider";
export default class RHS extends Component{
    render(){
        return <ReactHtmlSlider {...this.props}/>
    }
}