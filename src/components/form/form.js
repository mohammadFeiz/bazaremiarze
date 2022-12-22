import React,{Component} from "react";
import AIOFormReact from 'aio-form-react';
export default class Form extends Component{
    render(){
        return <AIOFormReact {...this.props}/>
    }
}