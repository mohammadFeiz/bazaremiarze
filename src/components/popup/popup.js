import React,{Component} from 'react';
import appContext from '../../app-context';
import './index.css';
export default class Popup extends Component{
    static contextType = appContext;
    render(){
        let {style} = this.props;
        return (
            <div className={"popup-container"} style={style}>
                {this.props.children}
            </div>
        )
    }
} 