import React,{Component} from "react";
import ReactVirtualDom from './../../npm/react-virtual-dom/react-virtual-dom';
export default class ReactVirtualDom_Interface extends Component{
    render(){
        return <ReactVirtualDom {...this.props}/>
    }
}